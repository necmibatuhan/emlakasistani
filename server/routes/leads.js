const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const PrivacyPipeline = require('../utils/PrivacyPipeline');

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

    // 1. Sanitize input to remove PII (Regex + Custom masking)
    const pipeline = new PrivacyPipeline();
    const customReplacements = [];
    if (name) customReplacements.push({ originalValue: name.trim(), type: 'CLIENT_NAME' });
    if (phone) customReplacements.push({ originalValue: phone.trim(), type: 'PHONE' });
    
    const maskedText = pipeline.mask(message, customReplacements);

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
  "customer_intent": "buyer" | "seller" | "investor" | "renter" | "unknown", (DİKKAT: Eğer kişi 'kiralık' arıyorsa kesinlikle 'renter' yap. 'satın almak' istiyorsa 'buyer' yap.)
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
  
7. INTENT CLASSIFICATION: 
   - 'renter': Eğer kullanıcı 'kiralık', 'kira', 'kiralamak' gibi ifadeler kullanıyorsa kesinlikle 'renter' seç.
   - 'buyer': Eğer kullanıcı 'satılık', 'satın almak', 'yatırım', 'mülk sahibi olmak' gibi ifadeler kullanıyorsa kesinlikle 'buyer' seç.

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

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      return res.status(500).json({ message: 'Yapay zeka (GEMINI_API_KEY) yapılandırması eksik.' });
    }

    let parsedResult;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json", temperature: 0.2 } });
      const aiResult = await model.generateContent(prompt);
      let respText = aiResult.response.text().trim();
      if (respText.startsWith('```json')) respText = respText.replace('```json', '').replace('```', '').trim();
      parsedResult = JSON.parse(respText);
    } catch (apiErr) {
      console.error('Gemini Analyze API Error:', apiErr.message);
      return res.status(500).json({ message: 'Yapay zeka analizi başarısız oldu' });
    }

    // 2. Restore PII into the AI's response before saving to database
    // PrivacyPipeline handles the entire JSON structure and clears the vault automatically
    parsedResult = pipeline.unmask(parsedResult);

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

// AI Analyze and Update Existing Lead
router.put('/:id/analyze', authMiddleware, async (req, res) => {
  try {
    const { name, phone, message } = req.body;

    if (!checkRateLimit(req.user.id)) {
      return res.status(429).json({ message: 'Rate limit aşıldı.' });
    }

    const pipeline = new PrivacyPipeline();
    const customReplacements = [];
    if (name) customReplacements.push({ originalValue: name.trim(), type: 'CLIENT_NAME' });
    if (phone) customReplacements.push({ originalValue: phone.trim(), type: 'PHONE' });
    
    const maskedText = pipeline.mask(message, customReplacements);
    const prompt = `Sen profesyonel bir emlak danışmanlığı AI asistanısın. 10+ yıllık tecrübeye sahip, detaycı, gerçekçi ve Türkiye'deki emlak piyasasını çok iyi bilen bir uzmansın.\n\nGörevin: Kullanıcı mesajı veya sesli not transkriptini analiz edip aşağıdaki JSON formatında yapılandırılmış çıktı üretmek.\n\nKURALLAR (Çok Önemli):# Privacy & Security Guidelines (MUST FOLLOW)\n1. Sadece gerçek metinde geçen bilgileri kullan. Bilmiyorsan null veya boş array koy.\n2. Halüsinasyon yapma! Tahmin etme, varsayımda bulundurma.\n3. Bütçe analizi yaparken Türkiye'deki gerçekçi piyasa koşullarını göz önünde bulundur.\n4. Aciliyet ve ciddiyet skorunu sadece metindeki dil, tekrarlar ve vurguya göre ver.\n5. Overall lead score = (Bütçe skoru × 0.35) + (Ciddiyet skoru × 0.40) + (Aciliyet skoru × 0.25) formülüyle hesapla.\n6. DATA ISOLATION & ANONYMIZATION: PII tespit edersen analiz et ama "Müşteri" olarak kullan. İşlem bitince unut.\n7. INTENT CLASSIFICATION:\n   - 'renter': Eğer kullanıcı 'kiralık', 'kira', 'kiralamak' gibi ifadeler kullanıyorsa kesinlikle 'renter' seç.\n   - 'buyer': Eğer kullanıcı 'satılık', 'satın almak', 'yatırım', 'mülk sahibi olmak' gibi ifadeler kullanıyorsa kesinlikle 'buyer' seç.\n\n# Input\nMüşteri Mesajı: ${maskedText}\n\n# Output Format\nSadece aşağıdaki JSON formatında yanıt dön:\n{\n  "customer_intent": "buyer" | "seller" | "investor" | "renter" | "unknown", (DİKKAT: Eğer kişi 'kiralık' arıyorsa kesinlikle 'renter' yap. 'satın almak' istiyorsa 'buyer' yap.)\n  "budget": {\n    "min": "number | null",\n    "max": "number | null",\n    "currency": "TRY" | "USD" | "EUR",\n    "confidence": "high" | "medium" | "low"\n  },\n  "location_preferences": ["semt1", "semt2"],\n  "property_type": ["daire", "villa", "rezidans", "ofis"],\n  "room_count": {\n    "min": "number | null",\n    "max": "number | null"\n  },\n  "urgency": "very_urgent" | "urgent" | "moderate" | "exploring" | "low",\n  "seriousness_score": "1-10 arası",\n  "budget_score": "1-10 arası",\n  "overall_lead_score": "1-100 arası",\n  \n  "skor": "1-10 arası (overall_lead_score/10 yuvarlanmış hali)",\n  "etiket": "Sıcak (overall 75+ ise) | Ilık (40-74 arası) | Soğuk (0-39 arası)",\n  \n  "key_motivations": ["sebep1", "sebep2"],\n  "potential_risks": ["risk1", "risk2"],\n  "recommended_next_action": "Bugün ara | Bu hafta ara | Takip listesine ekle",\n  "suggested_whatsapp_reply": "hazır mesaj taslağı (en fazla 2-3 cümle, samimi ve profesyonel)",\n  "extracted_raw_quotes": ["müşterinin tam söylediği önemli cümleler"]\n}\n`;

    let parsedResult;
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      return res.status(500).json({ message: 'Yapay zeka (GEMINI_API_KEY) yapılandırması eksik.' });
    }
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json", temperature: 0.2 } });
      const aiResult = await model.generateContent(prompt);
      let respText = aiResult.response.text().trim();
      if (respText.startsWith('```json')) respText = respText.replace('```json', '').replace('```', '').trim();
      parsedResult = JSON.parse(respText);
    } catch (apiErr) {
      console.error('Gemini Analyze API Error:', apiErr.message);
      return res.status(500).json({ message: 'Yapay zeka analizi başarısız oldu' });
    }

    parsedResult = pipeline.unmask(parsedResult);
    const finalName = name?.trim() ? name.trim() : '[İsim Belirtilmedi]';
    const finalPhone = phone?.trim() ? phone.trim() : '[Telefon Belirtilmedi]';
    const reasoningText = `Motivasyon: ${(parsedResult.key_motivations || []).join(', ')}. Riskler: ${(parsedResult.potential_risks || []).join(', ')}. Intent: ${parsedResult.customer_intent}`;

    const updateRes = await db.query(
      `UPDATE leads SET name=$1, phone=$2, message=$3, score=$4, label=$5, reasoning=$6, recommended_action=$7, whatsapp_draft=$8, properties=$9, updated_at=NOW() 
       WHERE id=$10 AND company_id=$11 RETURNING *`,
      [
        finalName, finalPhone, message, 
        parsedResult.skor || Math.ceil(parsedResult.overall_lead_score / 10), 
        parsedResult.etiket, reasoningText, parsedResult.recommended_next_action, 
        parsedResult.suggested_whatsapp_reply, JSON.stringify(parsedResult),
        req.params.id, req.user.company_id
      ]
    );

    if (updateRes.rows.length === 0) return res.status(404).json({ message: 'Lead bulunamadı' });
    res.json(updateRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// GET External Matches (Ters Eşleşme Mock)
router.get('/:id/external-matches', authMiddleware, async (req, res) => {
  try {
    const lead = await db.query('SELECT properties FROM leads WHERE id = $1', [req.params.id]);
    if (lead.rows.length === 0) return res.json([]);
    
    // Dinamik AI Portföy Eşleştirme Motoru
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      return res.status(500).json({ message: 'Yapay zeka yapılandırması eksik. Lütfen GEMINI_API_KEY ayarlayın.' });
    }

    const leadProps = lead.rows[0].properties;
    let propsObj = {};
    if (typeof leadProps === 'string') {
      try { propsObj = JSON.parse(leadProps); } catch(e){}
    } else {
      propsObj = leadProps;
    }

    const aiPrompt = `Sen Türkiye emlak piyasasını çok iyi bilen bir portföy uzmanısın.
Müşterinin talebine göre, sahibinden.com veya hepsiemlak.com'da bulunabilecek tarzda, GERÇEKÇİ 2 veya 3 adet eşleşen portföy ilanı üret.

Müşteri Talebi Analizi:
- Niyet: ${propsObj.customer_intent} (DİKKAT: 'renter' ise kesinlikle KİRALIK ilan üret. 'buyer' ise SATILIK ilan üret.)
- Bütçe: ${propsObj.budget?.min || 0} - ${propsObj.budget?.max || 'Limitsiz'} ${propsObj.budget?.currency || 'TRY'}
- Lokasyon Tercihleri: ${(propsObj.location_preferences || []).join(', ')}
- Emlak Tipi: ${(propsObj.property_type || []).join(', ')}

Üreteceğin ilanların fiyatları müşterinin bütçe aralığına ve bölgeye GÖRE MANTIKLI olsun. (Örn: Beşiktaş'ta 2+1 kiralık arıyorsa, fiyatı 25.000 - 45.000 TL arası mantıklıdır. Milyonluk kiralık olmaz, 3.000 TL'ye kiralık da olmaz.)

SADECE AŞAĞIDAKİ JSON ARRAY FORMATINDA YANIT DÖN:
[
  {
    "id": "ext_ai_1",
    "source_name": "Sahibinden",
    "title": "İlan Başlığı (Örn: Beşiktaş Merkezde Yeni Boyalı 2+1 Kiralık)",
    "price": 28000,
    "currency": "TRY",
    "district": "Beşiktaş",
    "city": "İstanbul",
    "rooms": "2+1",
    "url": "https://sahibinden.com/ilan/mock-1",
    "owner_phone": "+905550001122"
  }
]
`;

    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json", temperature: 0.4 } });
      const aiResult = await model.generateContent(aiPrompt);
      let respText = aiResult.response.text().trim();
      if (respText.startsWith('\`\`\`json')) respText = respText.replace('\`\`\`json', '').replace('\`\`\`', '').trim();
      
      const dynamicListings = JSON.parse(respText);
      res.json(dynamicListings);
    } catch (apiErr) {
      console.error('Gemini External Matches API Error:', apiErr.message);
      res.status(500).json({ message: 'Portföy eşleştirmesi sırasında hata oluştu.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// WAKEUP AI MESSAGE (Fırsat Sinyali)
router.post('/:id/wakeup', authMiddleware, async (req, res) => {
  try {
    const leadId = req.params.id;
    const leadRes = await db.query('SELECT * FROM leads WHERE id = $1 AND company_id = $2', [leadId, req.user.company_id]);
    if (leadRes.rows.length === 0) return res.status(404).json({ message: 'Lead bulunamadı' });
    const lead = leadRes.rows[0];

    const notesRes = await db.query('SELECT content, created_at FROM notes WHERE lead_id = $1 ORDER BY created_at ASC', [leadId]);
    const notesStr = notesRes.rows.map(n => n.content).join(' | ');

    const { MASTER_AGENT_PROMPT } = require('../utils/promptLibrary');

    const prompt = `${MASTER_AGENT_PROMPT}
    
Senaryo 5 (Uyuyan Alıcı Datası Eşleştirme) kurallarına göre şu Müşteriyi analiz et ve 'Hazır Mesaj' üret. Başka hiçbir açıklama yapma.
Müşteri Adı: ${lead.name}
Geçmiş Notları/İhtiyacı: ${lead.message} | ${notesStr}
`;

    let generatedMessage = '';
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      generatedMessage = `Merhaba ${lead.name} Bey, [Emlakçı Adı] ben. Rehberimde tam sizin kriterlerinize uygun, güncel piyasa koşullarında satılabilir fiyat öngörüsü çok doğru olan bir yer yakaladım. Kısa sürede satışa dönecek bir fırsat. Detaylar için arıyorum.`;
    } else {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { temperature: 0.7 } });
        const aiResult = await model.generateContent(prompt);
        generatedMessage = aiResult.response.text().trim();
      } catch (err) {
        console.error('Gemini Wakeup Error:', err.message);
        generatedMessage = 'Yapay zeka mesajı oluşturamadı, lütfen manuel yazın.';
      }
    }

    // Update whatsapp_draft
    const updatedLead = await db.query(
      'UPDATE leads SET whatsapp_draft = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [generatedMessage, leadId]
    );

    res.json({ success: true, lead: updatedLead.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
