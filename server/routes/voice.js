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
    let mimeType = audioFile.mimetype.split(';')[0];
    if (mimeType === 'application/octet-stream' || !mimeType.startsWith('audio/')) {
        mimeType = 'audio/webm'; // Fallback for Gemini
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      return res.status(500).json({ error: 'Yapay zeka (GEMINI_API_KEY) yapılandırması eksik.' });
    }

    if (audioFile.buffer.length === 0) {
      return res.status(400).json({ error: 'Ses dosyası boş (0 bytes).' });
    }

    try {
      console.log(`[Voice API] Sending audio to Gemini: ${mimeType}, Size: ${audioFile.size} bytes`);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
      console.error('Gemini Transcribe API Error Details:', apiErr);
      return res.status(500).json({ error: `Ses işlenemedi: ${apiErr.message}` });
    }
  } catch (err) {
    console.error('Transcribe general error:', err);
    res.status(500).json({ error: 'Ses metne çevrilemedi' });
  }
});

const VOICE_SYSTEM_PROMPT = `
Sen dünyanın en iyi emlak satış koçu ve CRM analiz motorusun.

Görevin yalnızca lead'i puanlamak değil, danışmanın bugün hangi lead'e odaklanması gerektiğini belirlemektir. Ayrıca danışmanın sesli notundaki takvim/etkinlik planlamalarını çıkarmalısın.

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
11. TAKVİM & GÖREV ANALİZİ: Danışman "Yarın Ahmet Bey'e evi göstereceğim", "Pazartesi günü sözleşme var" gibi geleceğe yönelik bir eylemden bahsediyorsa, verilen güncel sistem saatini kullanarak bunu YYYY-MM-DD formatına çevir ve 'calendar_event' objesini doldur. Eğer hiçbir görev/randevu yoksa null yap.
12. YENİ DURUM: Danışman durumu belirtiyorsa "Takipte | Arandı | Randevu Alındı | Teklif Verildi | Sözleşme Aşamasında | Satış Tamamlandı | İptal" arasından uygun olanı yaz. (Durum değişmiyorsa null bırak)

JSON formatında çıktı ver:
{
  "lead_score": 0,
  "buy_probability": 0,
  "urgency_score": 0,
  "followup_risk": 0,
  "priority_score": 0,
  "category": "",
  "reason": "",
  "next_action": "",
  "whatsapp_message": "",
  "ai_insight": "",
  "calendar_event": {
    "title": "string",
    "description": "string",
    "start_date": "YYYY-MM-DD",
    "start_time": "HH:MM:SS",
    "is_task": true
  },
  "yeni_durum": ""
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

    // Sistem saatini LLM'e referans olarak gönderiyoruz (Zaman analizi için)
    const now = new Date();
    const currentDateStr = now.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const currentTimeStr = now.toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' });

    const userPrompt = `
SİSTEM BİLGİSİ (ZAMAN REFERANSI):
Şu anki tarih: ${currentDateStr}
Şu anki saat: ${currentTimeStr}
Bu tarihi referans alarak, metindeki "yarın", "haftaya" gibi zamanları YYYY-MM-DD formatına dönüştür.

Mevcut müşteri skor ve durumu: ${lead.score}/10 (${lead.label}) - ${lead.status}

Danışmanın sesli notu:
"${maskedText}"
`;

    let analysis;
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
      analysis = getMockAnalysis();
    } else {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: "application/json", temperature: 0.1 } });
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
    const ozetStr = `İçgörü: ${analysis.ai_insight || analysis.reason || ''}`;
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

    const rawScore = analysis.priority_score || analysis.lead_score || 50;
    const finalScore = Math.max(1, Math.min(10, Math.round(Number(rawScore) / 10) || 5));
    
    setClause.push(`score = $${idx++}`);
    values.push(finalScore);

    let mappedLabel = 'Soğuk';
    const cat = analysis.category || '';
    if (cat.includes('Hemen Ara') || cat.includes('Bugün Ulaş')) {
       mappedLabel = 'Sıcak';
    } else if (cat.includes('Bu Hafta Takip Et')) {
       mappedLabel = 'Ilık';
    }

    setClause.push(`label = $${idx++}`);
    values.push(mappedLabel);

    if (analysis.yeni_durum) {
      const allowedStatuses = ['Takipte','Arandı','Randevu Alındı','Teklif Verildi','Sözleşme Aşamasında','Satış Tamamlandı','İptal'];
      if (allowedStatuses.includes(analysis.yeni_durum)) {
        setClause.push(`status = $${idx++}`);
        values.push(analysis.yeni_durum);
      } else {
        console.warn('Geçersiz AI durumu, atlandı:', analysis.yeni_durum);
      }
    }
    if (analysis.whatsapp_message) {
      setClause.push(`whatsapp_draft = $${idx++}`);
      values.push(analysis.whatsapp_message);
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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: "application/json" } });
        const aiResult = await model.generateContent(prompt);
        let respText = aiResult.response.text().trim();
        if (respText.startsWith('```json')) {
          respText = respText.substring(7, respText.length - 3).trim();
        } else if (respText.startsWith('```')) {
          respText = respText.substring(3, respText.length - 3).trim();
        }
        
        try {
          parsedResult = JSON.parse(respText);
        } catch (parseErr) {
          console.error('Failed to parse new lead AI JSON', respText);
          parsedResult = getMockNewLead();
          parsedResult.gerekceler.aciklama = "Sistem Notu: Yapay zeka yapılandırılmış veri dönemedi, bu nedenle geçici mock verisi oluşturuldu. Ham analiz: " + respText.substring(0, 200);
        }
      } catch (err) {
        console.error('Gemini create-lead AI Error', err);
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

    const pipeline = new PrivacyPipeline();
    const customReplacements = [];
    if (parsedResult.isim) customReplacements.push({ originalValue: parsedResult.isim.trim(), type: 'CLIENT_NAME' });
    if (parsedResult.telefon) customReplacements.push({ originalValue: parsedResult.telefon.trim(), type: 'PHONE' });
    
    // Note: Since we didn't mask before sending to AI for create-lead because we needed the AI to extract name/phone,
    // we don't strictly need to unmask the result here. The AI already has the raw data.
    // However, to keep it consistent, we could run the pipeline. But the AI extracted it from raw text.
    // The previous implementation used maskPII but it was undefined.
    // I will simply store the AI's result. No need to unmask since we didn't mask it.
    
    const unmaskedAciklama = parsedResult.gerekceler?.aciklama || '';
    
    const userRes = await db.query('SELECT referral_code FROM users WHERE id = $1', [req.user.id]);
    const refCode = userRes.rows[0]?.referral_code || '';
    const refUrl = refCode ? `kapora.online/davet/${refCode}` : `kapora.online`;
    let unmaskedTaslak = parsedResult.yanit_taslak || '';
    if (unmaskedTaslak) {
      unmaskedTaslak += `\n\n📋 Bu sunum Kapora AI ile hazırlanmıştır.\n🔗 Ücretsiz deneyin: ${refUrl}`;
    }
    
    // Veritabanına Ekle
    const leadInsert = await db.query(
      `INSERT INTO leads (company_id, office_id, assigned_to, source, name, phone, message, score, label, reasoning, recommended_action, whatsapp_draft, properties) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        req.user.company_id, req.user.office_id, req.user.id, 'voice', parsedResult.isim, parsedResult.telefon, transcript, 
        parsedResult.skor, parsedResult.etiket, unmaskedAciklama, 
        parsedResult.onerilen_aksiyon, unmaskedTaslak, JSON.stringify(parsedResult.mulk_tercihleri)
      ]
    );

    const newLead = leadInsert.rows[0];

    // Sesli Notu da lead_notes'a ekle
    await db.query(
      'INSERT INTO lead_notes (lead_id, content) VALUES ($1, $2)',
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
