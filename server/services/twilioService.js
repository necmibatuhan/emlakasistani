const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Initialize Twilio client if credentials exist
let client = null;
try {
  if (accountSid && authToken && accountSid !== 'your_twilio_account_sid') {
    client = twilio(accountSid, authToken);
  }
} catch (error) {
  console.error('[Twilio Service] Initialization error:', error.message);
}

/**
 * Emlakçıya WhatsApp üzerinden mesaj gönderir.
 * @param {string} to - Gönderilecek numara (örn: '+905551234567')
 * @param {string} agentName - Danışman Adı
 * @param {number} buyerCount - Eşleşen alıcı sayısı
 */
const sendWhatsAppMessage = async (to, agentName, buyerCount) => {
  if (!client) {
    console.warn('[Twilio Service] Twilio Client başlatılamadı. Lütfen .env değişkenlerini kontrol edin.');
    return;
  }

  // Numarada 'whatsapp:' öneki yoksa ekle
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

  const messageText = `Merhaba ${agentName} Bey, Kapora AI çalıştı! 🚀 Portföyünüzle %100 uyumlu ${buyerCount} yeni alıcı bulundu. Detaylar: https://kapora.online`;

  try {
    const message = await client.messages.create({
      from: twilioNumber,
      to: formattedTo,
      body: messageText
    });
    
    console.log(`[Twilio Service] Mesaj başarıyla gönderildi: SID ${message.sid} (To: ${formattedTo})`);
    return message;
  } catch (error) {
    console.error(`[Twilio Service] Mesaj gönderim hatası (To: ${formattedTo}):`, error.message);
    throw error;
  }
};

/**
 * Genel amaçlı serbest metin mesajı gönderir.
 * @param {string} to - Gönderilecek numara
 * @param {string} text - Mesaj metni
 */
const sendCustomWhatsAppMessage = async (to, text) => {
  if (!client) return;
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  
  try {
    const message = await client.messages.create({
      from: twilioNumber,
      to: formattedTo,
      body: text
    });
    return message;
  } catch (error) {
    console.error(`[Twilio Service] Özel mesaj gönderim hatası:`, error.message);
    throw error;
  }
};

module.exports = {
  sendWhatsAppMessage,
  sendCustomWhatsAppMessage
};
