const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { maskPII, unmaskPII } = require('../services/piiService');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock');

const analyzeRateLimitMap = new Map();

const checkRateLimit = (userId) => {
  const now = Date.now();
  const userWindow = analyzeRateLimitMap.get(userId) || [];
  const recentRequests = userWindow.filter(time => now - time < 5 * 60 * 1000);
  
  if (recentRequests.length >= 10) return false;
  
  recentRequests.push(now);
  analyzeRateLimitMap.set(userId, recentRequests);
  return true;
};

// GET all leads (Role-based scope)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role, company_id, office_id, id: user_id } = req.user;
    let query = 'SELECT * FROM leads WHERE ';
    let values = [];

    if (role === 'super_admin' || role === 'company_admin') {
      query += 'company_id = $1';
      values.push(company_id);
    } else if (role === 'office_manager') {
      query += 'office_id = $1';
      values.push(office_id);
    } else { // agent or viewer
      query += 'assigned_to = $1';
      values.push(user_id);
    }

    query += ' ORDER BY created_at DESC';

    const leads = await db.query(query, values);
    res.json(leads.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// GET lead details by id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await db.query('SELECT * FROM leads WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    if (lead.rows.length === 0) return res.status(404).json({ message: 'Lead bulunamadı veya yetkisiz.' });

    const notes = await db.query('SELECT * FROM notes WHERE lead_id = $1 ORDER BY created_at DESC', [req.params.id]);
    
    // Fetch property matches
    const matches = await db.query(`
      SELECT m.*, p.title, p.price, p.city, p.district 
      FROM lead_property_matches m
      JOIN properties p ON m.property_id = p.id
      WHERE m.lead_id = $1
      ORDER BY m.match_score DESC
    `, [req.params.id]);

    res.json({
      ...lead.rows[0],
      notes: notes.rows,
      matches: matches.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// UPDATE lead
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, reminder_date } = req.body;
    
    const lead = await db.query('SELECT * FROM leads WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    if (lead.rows.length === 0) return res.status(404).json({ message: 'Lead bulunamadı' });

    const updatedLead = await db.query(
      'UPDATE leads SET status = COALESCE($1, status), reminder_date = COALESCE($2, reminder_date), updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, reminder_date, req.params.id]
    );

    if (status && status !== lead.rows[0].status) {
      await db.query('INSERT INTO notes (lead_id, content) VALUES ($1, $2)', [req.params.id, `Sistem: Durum güncellendi -> ${status}`]);
    }

    res.json(updatedLead.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// ADD Note
router.post('/:id/notes', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const lead = await db.query('SELECT * FROM leads WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    if (lead.rows.length === 0) return res.status(404).json({ message: 'Lead bulunamadı' });

    const newNote = await db.query(
      'INSERT INTO notes (lead_id, content) VALUES ($1, $2) RETURNING *',
      [req.params.id, content]
    );

    res.json(newNote.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// AI Analyze Endpoint
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { name, phone, message } = req.body;

    if (!checkRateLimit(req.user.id)) {
      return res.status(429).json({ message: 'Rate limit aşıldı.' });
    }

    // 1. Sanitize input to remove PII (Regex based masking)
    const { maskedText, tokenMap } = maskPII(message, name);

    const prompt = `Sen profesyonel bir emlak danışmanlığı AI asistanısın. 10+ yıllık tecrübeye sahip, detaycı, gerçekçi ve Türkiye'deki emlak piyasasını çok iyi bilen bir uzmansın.

Görevin: Kullanıcı mesajı veya sesli not transkriptini analiz edip aşağıdaki JSON formatında yapılandırılmış çıktı üretmek.

KURALLAR (Çok Önemli):# Privacy & Security Guidelines (MUST FOLLOW)
1. Sadece gerçek metinde geçen bilgileri kullan. Bilmiyorsan null veya boş array koy.
2. Halüsinasyon yapma! Tahmin etme, varsayımda bulundurma.
3. Bütçe analizi yaparken Türkiye'deki gerçekçi piyasa koşullarını göz önünde bulundur.
4. Aciliyet ve ciddiyet skorunu sadece metindeki dil, tekrarlar ve vurguya göre ver.
5. Overall lead score = (Bütçe skoru × 0.35) + (Ciddiyet skoru × 0.40) + (Aciliyet skoru × 0.25) formülüyle hesapla.
6. DATA ISOLATION & ANONYMIZATION: PII tespit edersen analiz et ama "Müşteri" olarak kullan. İşlem bitince unut.

# Input
Müşteri Mesajı: ${maskedText}

# Output Format
Sadece aşağıdaki JSON formatında yanıt dön:
{
  "customer_intent": "buyer" | "seller" | "investor" | "renter" | "unknown",
  "budget": {
    "min": "number | null",
    "max": "number | null",
    "currency": "TRY" | "USD" | "EUR",
    "confidence": "high" | "medium" | "low"
  },
  "location_preferences": ["semt1", "semt2"],
  "property_type": ["daire", "villa", "rezidans", "ofis"],
  "room_count": {
    "min": "number | null",
    "max": "number | null"
  },
  "urgency": "very_urgent" | "urgent" | "moderate" | "exploring" | "low",
  "seriousness_score": "1-10 arası",
  "budget_score": "1-10 arası",
  "overall_lead_score": "1-100 arası",
  
  "skor": "1-10 arası (overall_lead_score/10 yuvarlanmış hali)",
  "etiket": "Sıcak (overall 75+ ise) | Ilık (40-74 arası) | Soğuk (0-39 arası)",
  
  "key_motivations": ["sebep1", "sebep2"],
  "potential_risks": ["risk1", "risk2"],
  "recommended_next_action": "Bugün ara | Bu hafta ara | Takip listesine ekle",
  "suggested_whatsapp_reply": "hazır mesaj taslağı (en fazla 2-3 cümle, samimi ve profesyonel)",
  "extracted_raw_quotes": ["müşterinin tam söylediği önemli cümleler"]
}
`;

    let parsedResult;
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      parsedResult = getMockAnalyzeResult();
    } else {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json", temperature: 0.2 } });
        const aiResult = await model.generateContent(prompt);
        let respText = aiResult.response.text().trim();
        if (respText.startsWith('\`\`\`json')) respText = respText.replace('\`\`\`json', '').replace('\`\`\`', '').trim();
        parsedResult = JSON.parse(respText);
      } catch (apiErr) {
        console.error('Gemini Analyze API Error:', apiErr.message);
        parsedResult = getMockAnalyzeResult();
      }
    }

    function getMockAnalyzeResult() {
      return { 
        customer_intent: "buyer",
        key_motivations: ["Deneme/Mock verisi", "AI bağlantısı kurulamadı"],
        potential_risks: ["API anahtarı eksik"],
        overall_lead_score: 80,
        skor: 8, 
        etiket: "Sıcak", 
        recommended_next_action: "Sistem yöneticisi ile görüşüp GEMINI_API_KEY ayarını Render'a ekle.", 
        suggested_whatsapp_reply: `Merhaba ${name}, sistem AI entegrasyonu tamamlanmadığı için size bu test mesajını iletiyorum.`, 
      };
    }

    // 2. Restore PII into the AI's response before saving to database
    if (parsedResult.suggested_whatsapp_reply) {
      parsedResult.suggested_whatsapp_reply = unmaskPII(parsedResult.suggested_whatsapp_reply, tokenMap);
    }
    if (parsedResult.extracted_raw_quotes) {
      parsedResult.extracted_raw_quotes = parsedResult.extracted_raw_quotes.map(q => unmaskPII(q, tokenMap));
    }

    const finalName = name?.trim() ? name.trim() : '[İsim Belirtilmedi]';
    const finalPhone = phone?.trim() ? phone.trim() : '[Telefon Belirtilmedi]';

    const reasoningText = `Motivasyon: ${(parsedResult.key_motivations || []).join(', ')}. Riskler: ${(parsedResult.potential_risks || []).join(', ')}. Intent: ${parsedResult.customer_intent}`;

    const leadInsert = await db.query(
      `INSERT INTO leads (company_id, office_id, assigned_to, source, name, phone, message, score, label, reasoning, recommended_action, whatsapp_draft, properties) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        req.user.company_id, req.user.office_id, req.user.id, 'manual', finalName, finalPhone, message, 
        parsedResult.skor || Math.ceil(parsedResult.overall_lead_score / 10), 
        parsedResult.etiket, 
        reasoningText, 
        parsedResult.recommended_next_action, 
        parsedResult.suggested_whatsapp_reply, 
        JSON.stringify(parsedResult)
      ]
    );

    const newLead = leadInsert.rows[0];

    // Publish MATCH_PROPERTIES event to Queue
    const queue = require('../services/queue');
    queue.add('MATCH_PROPERTIES', { leadId: newLead.id });

    res.status(201).json(newLead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
