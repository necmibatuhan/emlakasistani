const { getGenAI, hasValidAiConfig } = require('../utils/ai');

async function createWhatsAppDraft(lead, params = {}) {
  const fallback = params.template || `Merhaba ${lead.name}, daha önce konuştuğumuz gayrimenkul ihtiyacınızla ilgili uygun seçenekleri paylaşmak isterim. Görüşmek için uygun olduğunuz zamanı yazabilir misiniz?`;
  if (!hasValidAiConfig()) return fallback;
  try {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(`Bir emlak danışmanı adına, gönderilmeden önce danışman onayına sunulacak kısa ve doğal bir WhatsApp taslağı yaz. Sadece mesajı döndür. Müşteri: ${lead.name}. İhtiyaç/not: ${lead.message || ''}. Ek talimat: ${params.instruction || ''}`);
    return result.response.text().trim();
  } catch (error) {
    console.error('Follow-up draft error:', error.message);
    return fallback;
  }
}

module.exports = { createWhatsAppDraft };
