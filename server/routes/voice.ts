const express = require('express');
const multer = require('multer');
const { getGenAI, hasValidAiConfig } = require('../utils/ai');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const PrivacyPipeline = require('../utils/PrivacyPipeline');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

const SUPPORTED_AUDIO_TYPES = new Set([
  'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/aac', 'audio/flac'
]);

const normalizeAudio = (audioFile) => {
  if (!audioFile || audioFile.buffer.length < 1_000) {
    const error = new Error('Ses kaydı boş veya çok kısa. En az birkaç saniye konuşup tekrar deneyin.');
    error.statusCode = 400;
    throw error;
  }
  const mimeType = (audioFile.mimetype || '').split(';')[0].toLowerCase();
  if (!SUPPORTED_AUDIO_TYPES.has(mimeType)) {
    const error = new Error('Bu ses biçimi desteklenmiyor. Chrome, Safari veya Edge ile tekrar deneyin.');
    error.statusCode = 415;
    throw error;
  }
  return { mimeType, audioBase64: audioFile.buffer.toString('base64') };
};

// POST /api/voice/transcribe
router.post('/transcribe', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    const audioFile = req.file;
    if (!audioFile) return res.status(400).json({ error: 'Ses dosyası bulunamadı' });

    const { audioBase64, mimeType } = normalizeAudio(audioFile);

    if (!hasValidAiConfig()) {
      return res.status(500).json({ error: 'Yapay zeka (GEMINI_API_KEY) yapılandırması eksik.' });
    }

    try {
      console.log(`[Voice API] Sending audio to Gemini: ${mimeType}, Size: ${audioFile.size} bytes`);
      const model = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });
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
      return res.status(502).json({ error: 'Ses servisi şu anda yanıt vermiyor. Birkaç dakika sonra tekrar deneyin.' });
    }
  } catch (err) {
    console.error('Transcribe general error:', err);
    res.status(err.statusCode || 500).json({ error: err.statusCode ? err.message : 'Ses metne çevrilemedi' });
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
    if (!hasValidAiConfig()) {
      analysis = getMockAnalysis();
    } else {
      try {
        const model = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: "application/json", temperature: 0.1 } });
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

const analyzeNewLeadAudio = async (audioFile) => {
  if (!hasValidAiConfig()) {
    const error = new Error('Ses analizi geçici olarak kullanılamıyor.');
    error.statusCode = 503;
    throw error;
  }
  const { audioBase64, mimeType } = normalizeAudio(audioFile);
  let transcript = '';
  try {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent([
      { inlineData: { mimeType, data: audioBase64 } },
      { text: 'Bu ses kaydını Türkçe olarak tam ve doğru şekilde metne çevir. Yalnızca konuşulan metni yaz.' }
    ]);
    transcript = result.response.text().trim();
  } catch (error) {
    console.error('Gemini voice transcription error:', error.message);
    const serviceError = new Error('Ses metne çevrilemedi. Daha net ve kısa bir kayıtla tekrar deneyin.');
    serviceError.statusCode = 502;
    throw serviceError;
  }
  if (!transcript) {
    const error = new Error('Kayıtta anlaşılır bir konuşma bulunamadı.');
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
  const prompt = `Sen bir Türk emlak CRM asistanısın. Aşağıdaki görüşme notundan doğrulanabilir bir müşteri taslağı çıkar.
Şu an: ${now}. "Yarın", "Pazartesi" gibi ifadeleri Europe/Istanbul saatine göre ISO tarihe dönüştür.
Bilgi yoksa tahmin etme; boş metin veya null kullan. Yalnızca geçerli JSON döndür.

TRANSKRİPT: ${transcript}

{
  "isim":"", "telefon":"", "skor":1, "etiket":"Sıcak|Ilık|Soğuk",
  "gerekceler":{"aciklama":""}, "onerilen_aksiyon":"", "yanit_taslak":"",
  "mulk_tercihleri":{"bolge":null,"tip":"Satılık|Kiralık|Belirsiz","oda":null,"butce":null,"aciliyet":"Acil|Belirsiz"},
  "calendar_event":{"title":"","description":"","start_date":"YYYY-MM-DD","start_time":"HH:MM","is_task":true}
}
Takvim bilgisi yoksa calendar_event null olsun.`;

  try {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json', temperature: 0.1 } });
    const result = await model.generateContent(prompt);
    const draft = JSON.parse(result.response.text().replace(/^```json|```$/g, '').trim());
    return { transcript, draft };
  } catch (error) {
    console.error('Gemini voice lead extraction error:', error.message);
    const serviceError = new Error('Ses anlaşıldı ancak müşteri taslağı çıkarılamadı.');
    serviceError.statusCode = 502;
    throw serviceError;
  }
};

const saveVoiceLead = async (user, transcript, draft) => {
  const name = String(draft.isim || '').trim();
  const phone = String(draft.telefon || '').trim();
  if (!name) throw Object.assign(new Error('Müşteri adı gereklidir.'), { statusCode: 400 });
  if (phone && phone.replace(/\D/g, '').length < 10) throw Object.assign(new Error('Telefon numarası geçersiz.'), { statusCode: 400 });

  const score = Math.max(1, Math.min(10, Number(draft.skor) || 5));
  const label = ['Sıcak', 'Ilık', 'Soğuk'].includes(draft.etiket) ? draft.etiket : 'Ilık';
  const calendarEvent = draft.calendar_event?.start_date ? draft.calendar_event : null;
  const properties = { ...(draft.mulk_tercihleri || {}), calendar_event: calendarEvent };
  const reminderDate = calendarEvent ? new Date(`${calendarEvent.start_date}T${calendarEvent.start_time || '09:00'}:00+03:00`) : null;
  const userResult = await db.query('SELECT referral_code FROM users WHERE id = $1', [user.id]);
  const referralCode = userResult.rows[0]?.referral_code || '';
  let whatsappDraft = String(draft.yanit_taslak || '').trim();
  if (whatsappDraft) whatsappDraft += `\n\n📋 Kapora AI ile hazırlandı.\n🔗 ${referralCode ? `kapora.online/davet/${referralCode}` : 'kapora.online'}`;

  const leadResult = await db.query(
    `INSERT INTO leads (company_id, office_id, assigned_to, source, name, phone, message, score, label, reasoning, recommended_action, whatsapp_draft, properties, reminder_date)
     VALUES ($1,$2,$3,'voice',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [user.company_id || null, user.office_id || null, user.id, name, phone || null, transcript, score, label,
      draft.gerekceler?.aciklama || '', draft.onerilen_aksiyon || '', whatsappDraft, JSON.stringify(properties), reminderDate]
  );
  const lead = leadResult.rows[0];
  await db.query('INSERT INTO lead_notes (lead_id, content) VALUES ($1, $2)', [lead.id, `Sistem (Sesli Kayıt): ${transcript}`]);
  if (calendarEvent) {
    await db.query('INSERT INTO lead_events (lead_id, event_type, description) VALUES ($1,$2,$3)',
      [lead.id, 'calendar_event_created', `${calendarEvent.title || 'Takip görevi'} · ${calendarEvent.start_date} ${calendarEvent.start_time || ''}`]);
  }
  try {
    const { triggerLeadAdded } = require('../services/onboardingService');
    await triggerLeadAdded(user.id);
  } catch (error) {
    console.error('Voice onboarding progress error:', error.message);
  }
  require('../services/queue').add('MATCH_PROPERTIES', { leadId: lead.id });
  return lead;
};

router.post('/preview-lead', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Ses dosyası bulunamadı.' });
    res.json(await analyzeNewLeadAudio(req.file));
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Ses kaydı işlenemedi.' });
  }
});

router.post('/confirm-lead', authMiddleware, async (req, res) => {
  try {
    const { transcript, draft } = req.body;
    if (!transcript || !draft) return res.status(400).json({ error: 'Onaylanacak müşteri taslağı eksik.' });
    res.status(201).json(await saveVoiceLead(req.user, String(transcript).slice(0, 10000), draft));
  } catch (error) {
    console.error('Confirm voice lead error:', error);
    res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Müşteri oluşturulamadı.' });
  }
});

router.post('/create-lead', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Ses dosyası bulunamadı.' });
    const { transcript, draft } = await analyzeNewLeadAudio(req.file);
    res.status(201).json(await saveVoiceLead(req.user, transcript, draft));
  } catch (error) {
    console.error('Create lead from voice error:', error);
    res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Müşteri oluşturulamadı.' });
  }
});

module.exports = router;
