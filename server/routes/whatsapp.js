const express = require('express');
const router = express.Router();

// Twilio'dan gelen webhook isteklerini yakalayan endpoint
// POST /v1/whatsapp-receiver
router.post('/', async (req, res) => {
  try {
    const { From, Body, MediaUrl0, ProfileName } = req.body;
    
    // Gelen numaradaki 'whatsapp:' önekini temizle
    const phoneNumber = From ? From.replace('whatsapp:', '') : 'Bilinmeyen Numara';

    console.log('--- YENİ WHATSAPP MESAJI ---');
    console.log(`Gönderen: ${phoneNumber} (${ProfileName || 'İsimsiz'})`);
    console.log(`Mesaj İçeriği: ${Body || '(Boş/Metin Yok)'}`);
    
    if (MediaUrl0) {
      console.log(`Ekli Ses/Medya Dosyası: ${MediaUrl0}`);
    }
    console.log('----------------------------');

    // İLERİDE YAPILACAKLAR: 
    // - Bu numarayı veritabanında (users veya leads tablosunda) ara.
    // - Eğer kayıtlıysa mesajı o hesaba "Yenilik/Lead/Not" olarak işle.
    // - Eğitilmiş AI modelini (Gemini/OpenAI) çağırıp kullanıcıya otomatik yanıt ver veya asistanı devreye sok.
    // Örneğin:
    // const dbClient = await pool.connect();
    // await dbClient.query('INSERT INTO leads (phone, message) VALUES ($1, $2)', [phoneNumber, Body]);

    // Twilio Webhook'ları her zaman HTTP 200 veya 2xx status kodu ve TwiML (XML) veya boş cevap bekler.
    // Başarılı olduğunu Twilio'ya bildirelim ki tekrar denemesin.
    res.status(200).send('<Response></Response>');

  } catch (error) {
    console.error('[WhatsApp Webhook] Hata oluştu:', error);
    // Hata olsa bile Twilio'ya 200 dönmek genellikle iyi bir fikirdir, 
    // yoksa Twilio isteği başarısız sayıp defalarca tekrar gönderebilir.
    res.status(200).send('<Response></Response>');
  }
});

module.exports = router;
