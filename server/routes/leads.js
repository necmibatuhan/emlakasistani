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

    const prompt = `# Role
Sen bir Emlak CRM Asistanısın. Görevin, müşteri görüşmelerini analiz ederek iş akışını hızlandırmaktır.

# Privacy & Security Guidelines (MUST FOLLOW)
1. DATA ISOLATION: İşlediğin hiçbir veriyi (kişi isimleri, telefon numaraları, adres detayları) belleğinde saklama.
2. NO TRAINING: Bu veriler "Sadece İşlem" (Processing Only) amaçlıdır. Verileri öğrenme, modellerini güncelleme veya veriyi herhangi bir dış veri setiyle eşleştirme.
3. DATA ANONYMIZATION: Eğer sana gönderilen metinde PII (Kişisel Veri) tespit edersen, bunları analiz et ama çıktı olarak paylaşma. Analiz sonuçlarında gerçek isim yerine "Müşteri" ibaresini kullan.
4. ZERO RETENTION: İşlem tamamlandığında, analiz ettiğin içeriği unut. Çıktı sadece yapılandırılmış bir JSON formatı olmalıdır.

# Input
Müşteri Mesajı: ${maskedText}

# Output Format
Sadece aşağıdaki JSON formatında yanıt dön:
{
  "skor": <1-10 arası>,
  "etiket": "<Sıcak|Ilık|Soğuk>",
  "gerekceler": { "aciklama": "<metin>" },
  "onerilen_aksiyon": "<Bugün ara|Bu hafta ara|Takip listesine ekle>",
  "yanit_taslak": "<Müşteriye verilecek taslak yanıt>",
  "mulk_tercihleri": {
    "bolge": "<veya null>",
    "tip": "<Satılık|Kiralık|Belirsiz>",
    "oda": "<veya Belirsiz>",
    "butce": "<veya null>",
    "aciliyet": "<Acil|Bu ay|Bu yıl|Belirsiz>",
    "yabanci_alici_potansiyeli": false,
    "yatirim_amacli": false,
    "kira_getirisi_ilgisi": false,
    "tavsiye_kaynak": false,
    "on_onay_durumu": "Yok"
  }
}`;

    let parsedResult;
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      parsedResult = getMockAnalyzeResult();
    } else {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
        const aiResult = await model.generateContent(prompt);
        parsedResult = JSON.parse(aiResult.response.text());
      } catch (apiErr) {
        console.error('Gemini Analyze API Error:', apiErr.message);
        parsedResult = getMockAnalyzeResult();
      }
    }

    function getMockAnalyzeResult() {
      return { 
        skor: 8, etiket: "Sıcak", 
        gerekceler: { aciklama: "Net bütçe ve aciliyet belirtilmiş." }, 
        onerilen_aksiyon: "Bugün ara", 
        yanit_taslak: `Merhaba ${name}, talebiniz için uygun portföyleri hazırladım. Ne zaman görüşelim?`, 
        mulk_tercihleri: { bolge: "Merkez", tip: "Satılık", oda: "3+1", butce: "5M", aciliyet: "Acil", yatirim_amacli: true, on_onay_durumu: "Belli" } 
      };
    }

    // 2. Restore PII into the AI's response before saving to database
    if (parsedResult.yanit_taslak) {
      parsedResult.yanit_taslak = unmaskPII(parsedResult.yanit_taslak, tokenMap);
    }
    if (parsedResult.gerekceler && parsedResult.gerekceler.aciklama) {
      parsedResult.gerekceler.aciklama = unmaskPII(parsedResult.gerekceler.aciklama, tokenMap);
    }

    const finalName = name?.trim() ? name.trim() : '[İsim Belirtilmedi]';
    const finalPhone = phone?.trim() ? phone.trim() : '[Telefon Belirtilmedi]';

    const leadInsert = await db.query(
      `INSERT INTO leads (company_id, office_id, assigned_to, source, name, phone, message, score, label, reasoning, recommended_action, whatsapp_draft, properties) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        req.user.company_id, req.user.office_id, req.user.id, 'manual', finalName, finalPhone, message, 
        parsedResult.skor, parsedResult.etiket, parsedResult.gerekceler.aciklama, 
        parsedResult.onerilen_aksiyon, parsedResult.yanit_taslak, JSON.stringify(parsedResult.mulk_tercihleri)
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
