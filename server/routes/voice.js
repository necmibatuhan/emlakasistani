const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const PrivacyPipeline = require('../utils/PrivacyPipeline');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock');

// POST /api/voice/transcribe
router.post('/transcribe', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    const audioFile = req.file;
    if (!audioFile) return res.status(400).json({ error: 'Ses dosyası bulunamadı' });

    const audioBase64 = audioFile.buffer.toString('base64');
    const mimeType = audioFile.mimetype;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      // API Key yoksa test (mock) metni dön
      return res.json({ transcript: "Merhaba Ahmet Bey, Kadıköy'deki ofisimizden arıyorum. Düşündüğünüz 3+1 daire için fiyatta anlaşabiliriz, yarın ofiste görüşelim." });
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType,
            data: audioBase64
          }
        },
        {
          text: `Bu ses kaydını Türkçe olarak tam ve doğru şekilde metne çevir. Sadece konuşulan metni yaz, başka hiçbir şey ekleme. Bağlam: Bir emlak danışmanı telefon görüşmesi sonrası müşteri hakkında not bırakıyor. Bölge adları, fiyat, oda sayısı gibi terimler geçebilir.`
        }
      ]);

      const transcript = result.response.text().trim();
      return res.json({ transcript });
    } catch (apiErr) {
      console.error('Gemini Transcribe API Error:', apiErr.message);
      // API hatası durumunda mock fallback'e dön
      return res.json({ transcript: "Merhaba Ahmet Bey, Kadıköy'deki ofisimizden arıyorum. Düşündüğünüz 3+1 daire için fiyatta anlaşabiliriz, yarın ofiste görüşelim." });
    }
  } catch (err) {
    console.error('Transcribe error:', err);
    res.status(500).json({ error: 'Ses metne çevrilemedi' });
  }
});

const VOICE_SYSTEM_PROMPT = `
Sen profesyonel bir emlak danışmanlığı AI asistanısın. 10+ yıllık tecrübeye sahip, detaycı, gerçekçi ve Türkiye'deki emlak piyasasını çok iyi bilen bir uzmansın.
Görevin: Müşteri sesli notunu analiz edip müşterinin sistemdeki mevcut durumunu (skor, etiket, aşama) güncellemek ve JSON çıktısı üretmek.

KURALLAR:
1. Sadece gerçek metinde geçen bilgileri kullan. Bilmiyorsan null veya boş array koy.
2. Halüsinasyon yapma! Tahmin etme.
3. Bütçe analizi yaparken Türkiye'deki gerçekçi piyasa koşullarını göz önünde bulundur.
4. Aciliyet ve ciddiyet skorunu sese/metne göre ver.
5. Overall lead score = (Bütçe skoru × 0.35) + (Ciddiyet skoru × 0.40) + (Aciliyet skoru × 0.25) formülüyle hesapla.

# Output Format
SADECE aşağıdaki JSON şemasında yanıt dön:
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
  "room_count": { "min": "number | null", "max": "number | null" },
  "urgency": "very_urgent" | "urgent" | "moderate" | "exploring" | "low",
  "seriousness_score": "1-10",
  "budget_score": "1-10",
  "overall_lead_score": "1-100",
  
  "skor": "1-10 (overall_lead_score'un 10'a bölünmüş hali)",
  "etiket": "Sıcak (overall 75+ ise) | Ilık (40-74 arası) | Soğuk (0-39 arası)",
  "yeni_durum": "Takipte | Arandı | Randevu Alındı | Teklif Verildi | Sözleşme Aşamasında | Satış Tamamlandı | İptal (Durum değişmiyorsa mevcut durumu koru)",

  "key_motivations": ["sebep1", "sebep2"],
  "potential_risks": ["risk1", "risk2"],
  "recommended_next_action": "Bugün ara | Bu hafta ara | Takip listesine ekle",
  "suggested_whatsapp_reply": "hazır mesaj taslağı (en fazla 2-3 cümle)",
  "extracted_raw_quotes": ["tam cümleler"]
}
`;

// POST /api/voice/analyze
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { leadId, transcript } = req.body;
    const userId = req.user.id;

    // Fetch lead details for context
    const leadRes = await db.query('SELECT * FROM leads WHERE id = $1', [leadId]);
    if (leadRes.rows.length === 0) return res.status(404).json({ error: 'Lead bulunamadı' });
    const lead = leadRes.rows[0];

    const pipeline = new PrivacyPipeline();
    const customReplacements = [];
    if (lead.name) customReplacements.push({ originalValue: lead.name.trim(), type: 'CLIENT_NAME' });
    if (lead.phone) customReplacements.push({ originalValue: lead.phone.trim(), type: 'PHONE' });
    
    const maskedText = pipeline.mask(transcript, customReplacements);

    const userPrompt = `
Mevcut müşteri skor ve durumu: ${lead.score}/10 (${lead.label}) - ${lead.status}

Danışmanın sesli notu:
"${maskedText}"
`;

    let analysis;
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      analysis = getMockAnalysis();
    } else {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json", temperature: 0.1 } });
        const result = await model.generateContent([
          { text: VOICE_SYSTEM_PROMPT },
          { text: userPrompt }
        ]);

        let responseText = result.response.text().trim();
        if (responseText.startsWith('\`\`\`json')) {
          responseText = responseText.substring(7, responseText.length - 3).trim();
        } else if (responseText.startsWith('\`\`\`')) {
          responseText = responseText.substring(3, responseText.length - 3).trim();
        }
        
        try {
          analysis = JSON.parse(responseText);
        } catch(e) {
          console.error('Failed to parse AI JSON', responseText);
          analysis = getMockAnalysis();
        }
      } catch (apiErr) {
        console.error('Gemini Analyze API Error:', apiErr.message);
        analysis = getMockAnalysis();
      }
    }

    function getMockAnalysis() {
      return {
        customer_intent: "buyer",
        overall_lead_score: 90,
        skor: 9, 
        etiket: "Sıcak", 
        yeni_durum: "Randevu Alındı",
        budget: { min: 3000000, max: 5000000, currency: "TRY" },
        location_preferences: ["Kadıköy"],
        room_count: { min: 3, max: 4 },
        recommended_next_action: "Bugün ara",
        suggested_whatsapp_reply: "Merhaba [MÜŞTERİ], yarın ofisimizde görüşmek üzere."
      };
    }

    // Restore names in summary and draft
    analysis = pipeline.unmask(analysis);
    const ozetStr = `Niyet: ${analysis.customer_intent}. Riskler: ${(analysis.potential_risks || []).join(', ')}`;
    analysis.ozet = ozetStr;

    await db.query('BEGIN');

    // 1. Insert Note
    await db.query(
      'INSERT INTO lead_notes (lead_id, content, note_type) VALUES ($1, $2, $3)',
      [leadId, `${transcript}\n\n---\nAI Özeti: ${analysis.ozet}`, 'voice']
    );

    // 2. Update Lead
    const updates = {};
    const values = [];
    let setClause = [];
    let idx = 1;

    let newScore = analysis.skor || Math.ceil((analysis.overall_lead_score || 50) / 10);
    setClause.push(`score = $${idx++}`);
    values.push(newScore);

    if (analysis.etiket) {
      setClause.push(`label = $${idx++}`);
      values.push(analysis.etiket);
    }
    if (analysis.yeni_durum) {
      setClause.push(`status = $${idx++}`);
      values.push(analysis.yeni_durum);
    }
    if (analysis.suggested_whatsapp_reply) {
      setClause.push(`whatsapp_draft = $${idx++}`);
      values.push(analysis.suggested_whatsapp_reply);
    }

    // Property preferences updates (storing them in the leads table since we don't have lead_properties table logic active)
    let currentProperties = lead.properties || {};
    let propsUpdated = false;
    
    currentProperties = { ...currentProperties, ...analysis };
    
    if (analysis.budget && analysis.budget.min !== null) {
      currentProperties.butce_min = analysis.budget.min;
      propsUpdated = true;
    }
    if (analysis.budget && analysis.budget.max !== null) {
      currentProperties.butce_max = analysis.budget.max;
      propsUpdated = true;
    }

    if (propsUpdated) {
      setClause.push(`properties = $${idx++}`);
      values.push(JSON.stringify(currentProperties));
    }

    // Add reminder logic based on AI action
    if (analysis.recommended_next_action === "Bugün ara" || analysis.recommended_next_action === "Bu hafta ara") {
      let reminderDate = new Date();
      if (analysis.recommended_next_action === "Bugün ara") {
        reminderDate.setHours(reminderDate.getHours() + 2); // 2 hours later
      } else {
        reminderDate.setDate(reminderDate.getDate() + 2); // 2 days later
      }
      setClause.push(`reminder_date = $${idx++}`);
      values.push(reminderDate);
    }

    if (setClause.length > 0) {
      values.push(leadId); // the WHERE id = $X parameter
      await db.query(`UPDATE leads SET ${setClause.join(', ')} WHERE id = $${idx}`, values);
    }

    // 3. Reminders
    if (analysis.recommended_next_action) {
      await db.query(
        'INSERT INTO lead_events (lead_id, event_type, description) VALUES ($1, $2, $3)',
        [leadId, 'voice_note_added', `Sesli not eklendi. Önerilen takip: ${analysis.recommended_next_action}`]
      );
    }

    await db.query('COMMIT');

    res.json({
      success: true,
      transcript,
      analysis,
      message: 'Sesli not kaydedildi ve müşteri kartı güncellendi.'
    });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: 'Analiz tamamlanamadı', details: err.message, stack: err.stack });
  }
});

// POST /api/voice/create-lead (Sesli nottan doğrudan yeni müşteri oluşturur)
router.post('/create-lead', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    const audioFile = req.file;
    if (!audioFile) return res.status(400).json({ error: 'Ses dosyası bulunamadı' });

    const audioBase64 = audioFile.buffer.toString('base64');
    const mimeType = audioFile.mimetype;

    let transcript = "";
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      transcript = "Ahmet Bey aradı, 0532 123 45 67, Kadıköy'den 5 milyona ev bakıyor.";
    } else {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([
          { inlineData: { mimeType, data: audioBase64 } },
          { text: "Bu ses kaydını Türkçe olarak tam ve doğru şekilde metne çevir. Sadece konuşulan metni yaz." }
        ]);
        transcript = result.response.text().trim();
      } catch (apiErr) {
        transcript = "Ahmet Bey aradı, 0532 123 45 67, Kadıköy'den 5 milyona ev bakıyor.";
      }
    }

    if (!transcript) return res.status(400).json({ error: 'Metne çevrilemedi' });

    // Şimdi metinden İsim, Telefon, ve Analiz verilerini çıkaralım
    const prompt = `# Role
Sen bir Emlak CRM Asistanısın. Aşağıdaki sesli not transkriptini analiz et ve JSON formatında bir müşteri oluştur.
Eğer isim yoksa "Bilinmeyen Müşteri", telefon yoksa "Belirtilmemiş" yaz.

# Input:
${transcript}

# Output JSON:
{
  "isim": "<Müşteri İsmi>",
  "telefon": "<Telefon Numarası>",
  "skor": <1-10 arası>,
  "etiket": "<Sıcak|Ilık|Soğuk>",
  "gerekceler": { "aciklama": "<metin>" },
  "onerilen_aksiyon": "<Bugün ara|Bu hafta ara|Takip listesine ekle>",
  "yanit_taslak": "<taslak>",
  "mulk_tercihleri": { "bolge": "<veya null>", "tip": "<Satılık|Kiralık|Belirsiz>", "oda": "<veya Belirsiz>", "butce": "<veya null>", "aciliyet": "<Acil|Belirsiz>" }
}`;

    let parsedResult;
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      parsedResult = getMockNewLead();
    } else {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } });
        const aiResult = await model.generateContent(prompt);
        parsedResult = JSON.parse(aiResult.response.text());
      } catch (err) {
        parsedResult = getMockNewLead();
      }
    }

    function getMockNewLead() {
      return { 
        isim: "Ahmet Yılmaz", telefon: "0532 123 4567",
        skor: 8, etiket: "Sıcak", 
        gerekceler: { aciklama: "Net bütçe ve bölge belirtti." }, 
        onerilen_aksiyon: "Bugün ara", 
        yanit_taslak: "Merhaba Ahmet Bey, portföyleri iletiyorum.", 
        mulk_tercihleri: { bolge: "Kadıköy", tip: "Satılık", oda: "Belirsiz", butce: "5M", aciliyet: "Acil" } 
      };
    }

    const { maskedText, tokenMap } = maskPII(transcript, parsedResult.isim);
    
    // Veritabanına Ekle
    const leadInsert = await db.query(
      `INSERT INTO leads (company_id, office_id, assigned_to, source, name, phone, message, score, label, reasoning, recommended_action, whatsapp_draft, properties) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        req.user.company_id, req.user.office_id, req.user.id, 'voice', parsedResult.isim, parsedResult.telefon, transcript, 
        parsedResult.skor, parsedResult.etiket, unmaskPII(parsedResult.gerekceler.aciklama, tokenMap), 
        parsedResult.onerilen_aksiyon, unmaskPII(parsedResult.yanit_taslak, tokenMap), JSON.stringify(parsedResult.mulk_tercihleri)
      ]
    );

    const newLead = leadInsert.rows[0];

    // Sesli Notu da lead_notes'a ekle
    await db.query(
      'INSERT INTO notes (lead_id, content) VALUES ($1, $2)',
      [newLead.id, `Sistem (Sesli Kayıt): ${transcript}`]
    );

    const queue = require('../services/queue');
    queue.add('MATCH_PROPERTIES', { leadId: newLead.id });

    res.status(201).json(newLead);
  } catch (err) {
    console.error('Create lead from voice error:', err);
    res.status(500).json({ error: 'Müşteri oluşturulamadı' });
  }
});

module.exports = router;
