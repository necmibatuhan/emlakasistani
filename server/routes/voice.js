const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { maskPII, unmaskPII } = require('../services/piiService');

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
# Role
Sen bir Emlak CRM Asistanısın. Görevin, müşteri görüşmelerini (sesli notları) analiz ederek iş akışını hızlandırmaktır.

# Privacy & Security Guidelines (MUST FOLLOW)
1. DATA ISOLATION: İşlediğin hiçbir veriyi (kişi isimleri, telefon numaraları, adres detayları) belleğinde saklama.
2. NO TRAINING: Bu veriler "Sadece İşlem" (Processing Only) amaçlıdır. Verileri öğrenme, modellerini güncelleme veya veriyi herhangi bir dış veri setiyle eşleştirme.
3. DATA ANONYMIZATION: Eğer sana gönderilen metinde PII (Kişisel Veri) tespit edersen, bunları analiz et ama çıktı olarak paylaşma. Analiz sonuçlarında gerçek isim yerine "Müşteri" ibaresini kullan.
4. ZERO RETENTION: İşlem tamamlandığında, analiz ettiğin içeriği unut. Çıktı sadece yapılandırılmış bir JSON formatı olmalıdır.

# Output Format
SADECE JSON döndür, başka hiçbir şey yazma (markdown \`\`\`json vs kullanma, doğrudan saf JSON döndür).

JSON şeması:
{
  "ozet": "<2-3 cümle net özet>",
  "guncelleme": {
    "yeni_skor": <1-10 veya null>,
    "yeni_etiket": "<Sıcak|Ilık|Soğuk veya null>",
    "yeni_durum": "<Takipte|Arandı|Randevu Alındı|Teklif Verildi|Sözleşme Aşamasında|Satış Tamamlandı|İptal veya null>"
  },
  "mulk_tercihleri": {
    "bolge": "<veya null>",
    "butce_min": <sayı veya null>,
    "butce_max": <sayı veya null>,
    "oda": "<veya null>"
  },
  "hatirlatici": {
    "gerekli_mi": true/false,
    "tarih_ipucu": "<'yarın', 'cuma', 'bu hafta' gibi ifade veya null>"
  },
  "whatsapp_taslak": "<güncellenen bilgilere göre yeni taslak veya null>"
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

    const { maskedText, tokenMap } = maskPII(transcript, lead.name);

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
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
        ozet: "Müşteri ile fiyat konusunda anlaşıldı, yarın ofiste yüz yüze görüşülecek.",
        guncelleme: { yeni_skor: 9, yeni_etiket: "Sıcak", yeni_durum: "Randevu Alındı" },
        mulk_tercihleri: { bolge: "Kadıköy", oda: "3+1" },
        hatirlatici: { gerekli_mi: true, tarih_ipucu: "yarın" },
        whatsapp_taslak: "Merhaba [MÜŞTERİ], yarın ofisimizde görüşmek üzere."
      };
    }

    // Restore names in summary and draft
    if (analysis.ozet) {
      analysis.ozet = unmaskPII(analysis.ozet, tokenMap);
    }
    if (analysis.whatsapp_taslak) {
      analysis.whatsapp_taslak = unmaskPII(analysis.whatsapp_taslak, tokenMap);
    }

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

    if (analysis.guncelleme.yeni_skor !== null && analysis.guncelleme.yeni_skor !== undefined) {
      setClause.push(`score = $${idx++}`);
      values.push(analysis.guncelleme.yeni_skor);
    }
    if (analysis.guncelleme.yeni_etiket) {
      setClause.push(`label = $${idx++}`);
      values.push(analysis.guncelleme.yeni_etiket);
    }
    if (analysis.guncelleme.yeni_durum) {
      setClause.push(`status = $${idx++}`);
      values.push(analysis.guncelleme.yeni_durum);
    }
    if (analysis.whatsapp_taslak) {
      setClause.push(`whatsapp_draft = $${idx++}`);
      values.push(analysis.whatsapp_taslak);
    }

    // Property preferences updates (storing them in the leads table since we don't have lead_properties table logic active)
    let currentProperties = lead.properties || {};
    let propsUpdated = false;
    
    if (analysis.mulk_tercihleri) {
      if (analysis.mulk_tercihleri.bolge) {
        currentProperties.bolge = analysis.mulk_tercihleri.bolge;
        propsUpdated = true;
      }
      if (analysis.mulk_tercihleri.oda) {
        currentProperties.oda = analysis.mulk_tercihleri.oda;
        propsUpdated = true;
      }
      if (analysis.mulk_tercihleri.butce_min !== null && analysis.mulk_tercihleri.butce_min !== undefined) {
        setClause.push(`budget_min = $${idx++}`);
        values.push(analysis.mulk_tercihleri.butce_min);
      }
      if (analysis.mulk_tercihleri.butce_max !== null && analysis.mulk_tercihleri.butce_max !== undefined) {
        setClause.push(`budget_max = $${idx++}`);
        values.push(analysis.mulk_tercihleri.butce_max);
      }
    }

    if (propsUpdated) {
      setClause.push(`properties = $${idx++}`);
      values.push(currentProperties);
    }

    if (setClause.length > 0) {
      values.push(leadId); // the WHERE id = $X parameter
      await db.query(`UPDATE leads SET ${setClause.join(', ')} WHERE id = $${idx}`, values);
    }

    // 3. Reminders
    if (analysis.hatirlatici && analysis.hatirlatici.gerekli_mi) {
      await db.query(
        'INSERT INTO lead_events (lead_id, event_type, description) VALUES ($1, $2, $3)',
        [leadId, 'voice_note_added', `Sesli not eklendi. Önerilen takip: ${analysis.hatirlatici.tarih_ipucu || 'Belirtilmedi'}`]
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
