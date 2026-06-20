const express = require('express');
const router = express.Router();
const db = require('../db');
const twilioService = require('../services/twilioService');
const { getGenAI } = require('../utils/ai');

const WHATSAPP_PROMPT = `
Sen dünyanın en iyi emlak asistanı ve CRM veri çıkarıcısısın.
Danışman WhatsApp üzerinden sana yeni bir müşteri veya not gönderdi.
Aşağıdaki metni analiz et ve JSON formatında bilgileri çıkar.

Eğer kişi adı yoksa, name'i null bırak. Eğer bütçe yoksa null bırak.
Konum/bölge belirtilmişse array olarak "locations" içine yaz.
Müşteri durumu için mantıklı bir şey uydur (örn: Yeni, Takipte).

Gerekli JSON formatı:
{
  "name": "Müşteri Adı Soyadı",
  "phone": "Müşteri Telefon Numarası",
  "budget_min": 0,
  "budget_max": 0,
  "locations": ["İl/İlçe/Mahalle"],
  "status": "Yeni",
  "message": "Metnin özetlenmiş, net hali",
  "source": "WhatsApp"
}
Lütfen SADECE geçerli JSON dizesi döndür (markdown kod bloğu kullanma).
`;

router.post('/', async (req, res) => {
  try {
    const { From, Body, MediaUrl0, ProfileName } = req.body;
    
    // Numara formatı genellikle "whatsapp:+905551234567" şeklindedir.
    const phoneNumber = From ? From.replace('whatsapp:', '') : '';
    console.log(`[WhatsApp Inbound] Mesaj geldi: ${phoneNumber}`);

    // Hemen 200 dönelim ki Twilio bir daha atmasın (İşlemi arkada asenkron yapacağız)
    res.status(200).send('<Response></Response>');

    // 1. Danışmanı (User) Bul
    // Numaradaki '+' işaretini hesaba katarak veya katmayarak esnek arayalım
    const phoneClean = phoneNumber.replace('+', '');
    const userRes = await db.query(
      `SELECT * FROM users WHERE REPLACE(whatsapp_phone, '+', '') = $1`, 
      [phoneClean]
    );

    if (userRes.rows.length === 0) {
      console.log(`[WhatsApp Inbound] Numara kayıtlı değil: ${phoneNumber}`);
      await twilioService.sendWhatsAppMessage(From, "Numaranız Kapora AI sistemine kayıtlı değil. Lütfen paneldeki Profil ayarlarından WhatsApp numaranızı ekleyin.");
      return;
    }

    const user = userRes.rows[0];

    // 2. Metni İşle (Eğer ses ise şimdilik metin beklediğimizi söyleyebiliriz, ama ileride MediaUrl0 indirilebilir)
    let textToAnalyze = Body;
    if (MediaUrl0) {
      // Şimdilik sesli notu desteklemediğimizi bildirelim
      await twilioService.sendWhatsAppMessage(From, "Şu an WhatsApp üzerinden sesli notları indiremiyorum, lütfen metin olarak yazın.");
      return;
    }

    if (!textToAnalyze || textToAnalyze.trim() === '') {
      return; // Boş mesaj
    }

    await twilioService.sendWhatsAppMessage(From, "🤖 Analiz ediliyor, CRM'e ekleniyor...");

    // 3. Gemini ile Analiz
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent([
      { text: WHATSAPP_PROMPT },
      { text: `Danışmandan gelen mesaj: "${textToAnalyze}"` }
    ]);

    const responseText = result.response.text();
    let parsedData = {};
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("[WhatsApp] JSON parse hatası:", e);
      await twilioService.sendWhatsAppMessage(From, "❌ Mesajınızı anlayamadım veya eksik bilgi var. Lütfen daha açık yazın.");
      return;
    }

    // 4. Veritabanına Kaydet
    const leadName = parsedData.name || 'İsimsiz WhatsApp Lead';
    const leadPhone = parsedData.phone || '';
    
    // Score ve label oluştur
    const score = 50; 
    const label = 'Ilık';

    const insertRes = await db.query(
      `INSERT INTO leads 
      (company_id, office_id, assigned_to, name, phone, budget_min, budget_max, locations, status, message, source, score, label) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      [
        user.company_id, 
        user.office_id, 
        user.id, 
        leadName, 
        leadPhone, 
        parsedData.budget_min || null, 
        parsedData.budget_max || null, 
        parsedData.locations ? parsedData.locations.join(', ') : null, 
        parsedData.status || 'Yeni', 
        parsedData.message || textToAnalyze, 
        parsedData.source || 'WhatsApp',
        score,
        label
      ]
    );

    const newLeadId = insertRes.rows[0].id;
    
    // 5. Başarı Mesajı Gönder
    await twilioService.sendWhatsAppMessage(From, `✅ Yeni müşteri *${leadName}* başarıyla CRM paneline eklendi!\nBütçe: ${parsedData.budget_max ? parsedData.budget_max + '₺' : 'Belirsiz'}\nKonum: ${parsedData.locations ? parsedData.locations.join(', ') : 'Belirsiz'}`);

  } catch (error) {
    console.error('[WhatsApp Webhook] Hata oluştu:', error);
  }
});

module.exports = router;
