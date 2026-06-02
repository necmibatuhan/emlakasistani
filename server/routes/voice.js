const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

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
  } catch (err) {
    console.error('Transcribe error:', err);
    res.status(500).json({ error: 'Ses metne çevrilemedi' });
  }
});

const VOICE_SYSTEM_PROMPT = `
Sen bir emlak CRM asistanısın.
Danışmanın telefon görüşmesi sonrası söylediği sesli notu analiz edeceksin.
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

    const userPrompt = `
Mevcut müşteri: ${lead.name}
Mevcut skor: ${lead.score}/10 (${lead.label})
Mevcut durum: ${lead.status}

Danışmanın sesli notu:
"${transcript}"
`;

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
    
    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch(e) {
      console.error('Failed to parse AI JSON', responseText);
      return res.status(500).json({ error: 'AI analizi anlaşılamadı' });
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
    console.error('Analyze error:', err);
    res.status(500).json({ error: 'Analiz tamamlanamadı' });
  }
});

module.exports = router;
