const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const PrivacyPipeline = require('../utils/PrivacyPipeline');
const scoreService = require('../services/scoreService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

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

    const notes = await db.query('SELECT * FROM lead_notes WHERE lead_id = $1 ORDER BY created_at DESC', [req.params.id]);
    
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
      await db.query('INSERT INTO lead_notes (lead_id, content) VALUES ($1, $2)', [req.params.id, `Sistem: Durum güncellendi -> ${status}`]);
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
      'INSERT INTO lead_notes (lead_id, content) VALUES ($1, $2) RETURNING *',
      [req.params.id, content]
    );

    res.json(newNote.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Direct Voice-to-CRM Analyze Endpoint
router.post('/analyze-voice', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    const { name, phone } = req.body;
    const audioFile = req.file;

    if (!audioFile) return res.status(400).json({ message: 'Ses dosyası eksik.' });

    if (!checkRateLimit(req.user.id)) {
      return res.status(429).json({ message: 'Rate limit aşıldı.' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      return res.status(500).json({ message: 'Yapay zeka yapılandırması eksik.' });
    }

    const audioBase64 = audioFile.buffer.toString('base64');
    let mimeType = audioFile.mimetype.split(';')[0];
    if (mimeType === 'application/octet-stream' || !mimeType.startsWith('audio/')) {
        mimeType = 'audio/webm';
    }

    const promptText = `Sen dünyanın en iyi emlak satış koçu ve CRM analiz motorusun.
Bu ses kaydı, bir emlak danışmanının müşteriyle yaptığı görüşme sonrası bıraktığı sesli nottur.
Aşağıdaki müşteri verilerini doğrudan ses kaydından çıkar ve SADECE JSON formatında yanıt ver:

1. LEAD SICAKLIK SKORU (lead_score): 0-100 arasında puan ver.
2. Müşteri Niyeti (customer_intent): "Alıcı", "Satıcı", veya "Kiracı"
3. Bütçe (budget): { "min": 0, "max": 0, "currency": "TRY" } (Eğer tek fiyat verilmişse max'a yaz. Rakam olarak ver)
4. Lokasyon Tercihleri (location_preferences): ["Şehir/İlçe"]
5. Emlak Tipi (property_type): ["Konut", "İşyeri", "Arsa" vb.]
6. Oda Sayısı (rooms): "3+1", "2+1" gibi (varsa)
7. ACİLİYET SKORU (urgency_score): 0-100 arasında hesapla.
8. KATEGORİ (category): "🔥 Hemen Ara", "⚡ Bugün Ulaş", "📅 Bu Hafta Takip Et", "🌱 Nurture Sürecine Al", "❌ Şimdilik Beklet"
9. NEDEN (reason): Kararı maksimum 3 cümlede açıkla.
10. SONRAKİ AKSİYON (next_action): Danışmanın uygulaması gereken tek aksiyonu belirt.
11. WHATSAPP MESAJI (whatsapp_message): Müşteriye gönderilecek kişiselleştirilmiş mesaj oluştur.
12. TAKVİM & GÖREV ANALİZİ (calendar_event): Eğer geleceğe yönelik bir eylemden bahsediliyorsa (Örn: Yarın Ahmet Bey'e evi göstereceğim), bunu doldur: { "title": "...", "description": "...", "start_date": "YYYY-MM-DD" } Yoksa null yap.

Lütfen çıktını başka hiçbir metin olmadan sadece geçerli bir JSON olarak ver.`;

    let parsedResult;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json", temperature: 0.2 } });
      const aiResult = await model.generateContent([
        {
          inlineData: {
            mimeType,
            data: audioBase64
          }
        },
        { text: promptText }
      ]);
      
      let respText = aiResult.response.text().trim();
      if (respText.startsWith('\`\`\`json')) respText = respText.replace('\`\`\`json', '').replace('\`\`\`', '').trim();
      parsedResult = JSON.parse(respText);
    } catch (apiErr) {
      console.error('Gemini Analyze-Voice API Error:', apiErr.message);
      return res.status(500).json({ message: 'Ses analizi başarısız oldu' });
    }

    const finalName = name?.trim() ? name.trim() : '[İsim Belirtilmedi]';
    const finalPhone = phone?.trim() ? phone.trim() : '[Telefon Belirtilmedi]';
    const reasoningText = parsedResult.reason || 'Belirtilmedi';
    const rawScore = parsedResult.lead_score || 50;
    const finalScore = Math.max(1, Math.min(10, Math.round(Number(rawScore) / 10) || 5));

    let mappedLabel = 'Soğuk';
    const cat = parsedResult.category || '';
    if (cat.includes('Hemen Ara') || cat.includes('Bugün Ulaş')) {
       mappedLabel = 'Sıcak';
    } else if (cat.includes('Bu Hafta Takip Et')) {
       mappedLabel = 'Ilık';
    }

    const message = "Sesli not üzerinden sisteme eklendi.";

    const userRes = await db.query('SELECT referral_code FROM users WHERE id = $1', [req.user.id]);
    const refCode = userRes.rows[0]?.referral_code || '';
    const refUrl = refCode ? `kapora.online/davet/${refCode}` : `kapora.online`;
    let wpDraft = parsedResult.whatsapp_message || '';
    if (wpDraft) {
      wpDraft += `\n\n📋 Bu sunum Kapora AI ile hazırlanmıştır.\n🔗 Ücretsiz deneyin: ${refUrl}`;
    }

    const leadInsert = await db.query(
      `INSERT INTO leads (company_id, office_id, assigned_to, source, name, phone, message, score, label, reasoning, recommended_action, whatsapp_draft, properties) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        req.user.company_id, req.user.office_id, req.user.id, 'voice', finalName, finalPhone, message, 
        finalScore, 
        mappedLabel, 
        reasoningText, 
        parsedResult.next_action || '', 
        wpDraft, 
        JSON.stringify(parsedResult)
      ]
    );

    try {
      const { triggerLeadAdded } = require('../services/onboardingService');
      await triggerLeadAdded(req.user.id);
    } catch (e) { console.error(e); }

    const newLead = leadInsert.rows[0];

    const queue = require('../services/queue');
    queue.add('MATCH_PROPERTIES', { leadId: newLead.id });

    res.status(201).json(newLead);
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

    const prompt = `Sen dünyanın en iyi emlak satış koçu ve CRM analiz motorusun.

Görevin yalnızca lead'i puanlamak değil, danışmanın bugün hangi lead'e odaklanması gerektiğini belirlemektir.

Aşağıdaki müşteri verilerini analiz et:
* İsim, Bütçe, Lokasyon tercihi, Oda sayısı tercihi
* Son iletişim tarihi, Toplam görüşme sayısı, WhatsApp mesajları
* Arama notları, Sesli not dökümleri, Lead kaynağı, Son etkileşimler
* Gösterilen portföyler, İtirazlar, Satın alma/kiralama zamanı
* Medeni durum, Yatırım veya oturum amacı, Lead oluşturulma tarihi

Analiz sonucunda aşağıdaki çıktıyı üret:
1. LEAD SICAKLIK SKORU: 0-100 arasında puan ver.
2. SATIN ALMA OLASILIĞI: Yüzde olarak tahmin et.
3. ACİLİYET SKORU: 0-100 arasında hesapla.
4. TAKİP RİSKİ: Bu müşteri unutulursa kaybedilme ihtimalini 0-100 arasında hesapla.
5. ÖNCELİK SKORU: (Satın Alma Olasılığı × 0.35) + (Aciliyet × 0.30) + (Bütçe Potansiyeli × 0.20) + (Etkileşim Seviyesi × 0.15) formülüyle hesapla.
6. KATEGORİ: "🔥 Hemen Ara", "⚡ Bugün Ulaş", "📅 Bu Hafta Takip Et", "🌱 Nurture Sürecine Al", "❌ Şimdilik Beklet" seçeneklerinden sadece birini seç.
7. NEDEN: Kararı maksimum 3 cümlede açıkla.
8. SONRAKİ AKSİYON: Danışmanın uygulaması gereken tek aksiyonu belirt.
9. WHATSAPP MESAJI: Müşteriye gönderilecek kişiselleştirilmiş mesaj oluştur.
10. AI İÇGÖRÜSÜ: CRM ekranında gösterilecek kısa özet üret.

# Input
Müşteri Mesajı: ${maskedText}

JSON formatında çıktı ver:
{
"lead_score":0,
"buy_probability":0,
"urgency_score":0,
"followup_risk":0,
"priority_score":0,
"category":"",
"reason":"",
"next_action":"",
"whatsapp_message":"",
"ai_insight":""
}
`;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      return res.status(500).json({ message: 'Yapay zeka (GEMINI_API_KEY) yapılandırması eksik.' });
    }

    let parsedResult;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json", temperature: 0.2 } });
      const aiResult = await model.generateContent(prompt);
      let respText = aiResult.response.text().trim();
      if (respText.startsWith('```json')) respText = respText.replace('```json', '').replace('```', '').trim();
      parsedResult = JSON.parse(respText);
    } catch (apiErr) {
      console.error('Gemini Analyze API Error:', apiErr.message);
      return res.status(500).json({ message: 'Yapay zeka analizi başarısız oldu' });
    }

    // 2. Restore PII into the AI's response before saving to database
    parsedResult = pipeline.unmask(parsedResult);

    const finalName = name?.trim() ? name.trim() : '[İsim Belirtilmedi]';
    const finalPhone = phone?.trim() ? phone.trim() : '[Telefon Belirtilmedi]';

    const reasoningText = parsedResult.reason || parsedResult.ai_insight || 'Belirtilmedi';

    const rawScore = parsedResult.priority_score || parsedResult.lead_score || 50;
    const finalScore = Math.max(1, Math.min(10, Math.round(Number(rawScore) / 10) || 5));

    let mappedLabel = 'Soğuk';
    const cat = parsedResult.category || '';
    if (cat.includes('Hemen Ara') || cat.includes('Bugün Ulaş')) {
       mappedLabel = 'Sıcak';
    } else if (cat.includes('Bu Hafta Takip Et')) {
       mappedLabel = 'Ilık';
    }

    const userRes = await db.query('SELECT referral_code FROM users WHERE id = $1', [req.user.id]);
    const refCode = userRes.rows[0]?.referral_code || '';
    const refUrl = refCode ? `kapora.online/davet/${refCode}` : `kapora.online`;
    let wpDraft = parsedResult.whatsapp_message || '';
    if (wpDraft) {
      wpDraft += `\n\n📋 Bu sunum Kapora AI ile hazırlanmıştır.\n🔗 Ücretsiz deneyin: ${refUrl}`;
    }

    const leadInsert = await db.query(
      `INSERT INTO leads (company_id, office_id, assigned_to, source, name, phone, message, score, label, reasoning, recommended_action, whatsapp_draft, properties) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        req.user.company_id, req.user.office_id, req.user.id, 'manual', finalName, finalPhone, message, 
        finalScore, 
        mappedLabel, 
        reasoningText, 
        parsedResult.next_action, 
        wpDraft, 
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
    const prompt = `Sen dünyanın en iyi emlak satış koçu ve CRM analiz motorusun.

Görevin yalnızca lead'i puanlamak değil, danışmanın bugün hangi lead'e odaklanması gerektiğini belirlemektir.

Aşağıdaki müşteri verilerini analiz et:
* İsim, Bütçe, Lokasyon tercihi, Oda sayısı tercihi
* Son iletişim tarihi, Toplam görüşme sayısı, WhatsApp mesajları
* Arama notları, Sesli not dökümleri, Lead kaynağı, Son etkileşimler
* Gösterilen portföyler, İtirazlar, Satın alma/kiralama zamanı
* Medeni durum, Yatırım veya oturum amacı, Lead oluşturulma tarihi

Analiz sonucunda aşağıdaki çıktıyı üret:
1. LEAD SICAKLIK SKORU: 0-100 arasında puan ver.
2. SATIN ALMA OLASILIĞI: Yüzde olarak tahmin et.
3. ACİLİYET SKORU: 0-100 arasında hesapla.
4. TAKİP RİSKİ: Bu müşteri unutulursa kaybedilme ihtimalini 0-100 arasında hesapla.
5. ÖNCELİK SKORU: (Satın Alma Olasılığı × 0.35) + (Aciliyet × 0.30) + (Bütçe Potansiyeli × 0.20) + (Etkileşim Seviyesi × 0.15) formülüyle hesapla.
6. KATEGORİ: "🔥 Hemen Ara", "⚡ Bugün Ulaş", "📅 Bu Hafta Takip Et", "🌱 Nurture Sürecine Al", "❌ Şimdilik Beklet" seçeneklerinden sadece birini seç.
7. NEDEN: Kararı maksimum 3 cümlede açıkla.
8. SONRAKİ AKSİYON: Danışmanın uygulaması gereken tek aksiyonu belirt.
9. WHATSAPP MESAJI: Müşteriye gönderilecek kişiselleştirilmiş mesaj oluştur.
10. AI İÇGÖRÜSÜ: CRM ekranında gösterilecek kısa özet üret.

# Input
Müşteri Mesajı: ${maskedText}

JSON formatında çıktı ver:
{
"lead_score":0,
"buy_probability":0,
"urgency_score":0,
"followup_risk":0,
"priority_score":0,
"category":"",
"reason":"",
"next_action":"",
"whatsapp_message":"",
"ai_insight":""
}
`;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      return res.status(500).json({ message: 'Yapay zeka (GEMINI_API_KEY) yapılandırması eksik.' });
    }
    
    let parsedResult;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json", temperature: 0.2 } });
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
    const reasoningText = parsedResult.reason || parsedResult.ai_insight || 'Belirtilmedi';

    const rawScore = parsedResult.priority_score || parsedResult.lead_score || 50;
    const finalScore = Math.max(1, Math.min(10, Math.round(Number(rawScore) / 10) || 5));

    let mappedLabel = 'Soğuk';
    const cat = parsedResult.category || '';
    if (cat.includes('Hemen Ara') || cat.includes('Bugün Ulaş')) {
       mappedLabel = 'Sıcak';
    } else if (cat.includes('Bu Hafta Takip Et')) {
       mappedLabel = 'Ilık';
    }

    const updateRes = await db.query(
      `UPDATE leads 
       SET name=$1, phone=$2, message=$3, score=$4, label=$5, reasoning=$6, recommended_action=$7, whatsapp_draft=$8, properties=$9, updated_at=NOW() 
       WHERE id=$10 AND company_id=$11 RETURNING *`,
      [
        finalName, finalPhone, message, 
        finalScore, 
        mappedLabel, reasoningText, parsedResult.next_action, 
        parsedResult.whatsapp_message, JSON.stringify(parsedResult),
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
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json", temperature: 0.4 } });
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

    const notesRes = await db.query('SELECT content, created_at FROM lead_notes WHERE lead_id = $1 ORDER BY created_at ASC', [leadId]);
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { temperature: 0.7 } });
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

// Calculate score for single lead
router.post('/:id/calculate-score', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: user_id } = req.user;

    let query = 'SELECT * FROM leads WHERE id = $1';
    let values = [id];
    if (role === 'agent' || role === 'viewer') {
      query += ' AND assigned_to = $2';
      values.push(user_id);
    }

    const leadRes = await db.query(query, values);
    if (leadRes.rows.length === 0) {
      return res.status(404).json({ message: 'Lead bulunamadı' });
    }

    const lead = leadRes.rows[0];
    const scoreData = await scoreService.calculateScoreForLead(lead);
    
    await scoreService.updateLeadScore(id, scoreData);

    res.json({ success: true, scoreData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Skor hesaplanırken hata oluştu' });
  }
});

// Recalculate scores for all leads of user
router.post('/recalculate-all', authMiddleware, async (req, res) => {
  try {
    const { role, id: user_id } = req.user;
    
    let query = 'SELECT * FROM leads WHERE ';
    let values = [];
    if (role === 'agent' || role === 'viewer') {
      query += 'assigned_to = $1';
      values.push(user_id);
    } else {
      // Sadece manager/admin ise onlara ait ofisteki vs olabilir ama şimdilik assigned_to
      query += 'assigned_to = $1';
      values.push(user_id);
    }

    const leads = await db.query(query, values);

    // Background job instead of blocking (simplified)
    const jobId = Date.now().toString();
    res.json({ success: true, message: 'Toplu skorlama başlatıldı', job_id: jobId, total: leads.rows.length });

    // Process in background
    (async () => {
      for (const lead of leads.rows) {
        try {
          const scoreData = await scoreService.calculateScoreForLead(lead);
          await scoreService.updateLeadScore(lead.id, scoreData);
          // Rate limiting sleep 1s
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
          console.error(`Failed to calculate score for lead ${lead.id}`);
        }
      }
      console.log(`Finished recalculating scores for job ${jobId}`);
    })();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Toplu skorlama başlatılamadı' });
  }
});

// Delete lead endpoint
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: user_id } = req.user;

    let leadCheckQuery = 'SELECT id FROM leads WHERE id = $1';
    let leadCheckValues = [id];
    
    if (role === 'company_admin') {
      leadCheckQuery += ' AND company_id = $2';
      leadCheckValues.push(req.user.company_id);
    } else if (role === 'office_manager') {
      leadCheckQuery += ' AND office_id = $2';
      leadCheckValues.push(req.user.office_id);
    } else if (role === 'agent' || role === 'viewer') {
      leadCheckQuery += ' AND assigned_to = $2';
      leadCheckValues.push(user_id);
    }

    const leadCheck = await db.query(leadCheckQuery, leadCheckValues);
    if (leadCheck.rowCount === 0) {
      return res.status(404).json({ message: 'Lead bulunamadı veya silme yetkiniz yok' });
    }

    await db.query('BEGIN');
    
    // Explicitly delete related records to bypass any missing ON DELETE CASCADE
    await db.query('DELETE FROM lead_notes WHERE lead_id = $1', [id]);
    await db.query('DELETE FROM lead_property_matches WHERE lead_id = $1', [id]);
    await db.query('DELETE FROM lead_events WHERE lead_id = $1', [id]).catch(() => {});
    await db.query('DELETE FROM whatsapp_messages WHERE lead_id = $1', [id]).catch(() => {});
    await db.query('DELETE FROM contact_logs WHERE lead_id = $1', [id]).catch(() => {});
    
    await db.query('DELETE FROM leads WHERE id = $1', [id]);
    
    await db.query('COMMIT');

    res.json({ message: 'Lead başarıyla silindi' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Delete Lead Error:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
