const { openai } = require('../utils/ai');
const pool = require('../db');

async function calculateScoreForLead(lead) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock_openai_key') {
    return {
      score: Math.floor(Math.random() * 40) + 60,
      label: "Sıcak",
      reasoning: "Mock AI gerekçesi: Yüksek bütçeli müşteri, acil arama.",
      recommended_action: "Hemen WhatsApp üzerinden iletişime geçin."
    };
  }

  const prompt = `Sen uzman bir gayrimenkul danışmanısın. Aşağıdaki müşteri profiline bakarak, bu müşterinin "Satın Alma/Kiralama" potansiyelini analiz et.
Sadece aşağıdaki formata uygun BİR JSON dön:
{
  "score": 0-100 arası bir tamsayı (Müşterinin potansiyel skoru),
  "label": "Sıcak" veya "Ilık" veya "Soğuk" (Kesinlikle bu 3 kelimeden biri olmalı),
  "reasoning": "Bu skoru neden verdiğini açıklayan 1-2 cümlelik Türkçe mantıksal açıklama.",
  "recommended_action": "Danışmana verilecek 1 cümlelik Türkçe aksiyon tavsiyesi."
}

Müşteri verisi:
${JSON.stringify(lead, null, 2)}

Skorlama kriterleri:
- Uzun süredir iletişim kurulmadıysa öncelik artar
- Bütçe yüksekse öncelik artar  
- Aciliyet bildiren bir kelime varsa (hemen, acil, bugün) skor çok yüksek olmalı`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }]
    });

    let text = response.choices[0].message.content.trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("OpenAI Score Error:", error);
    return {
      score: 50,
      label: "Ilık",
      reasoning: "Yapay zeka analiz edemedi, varsayılan skor atandı.",
      recommended_action: "Manuel olarak iletişime geçip durumu öğrenin."
    };
  }
}

async function updateLeadScore(leadId, scoreData) {
  await pool.query(
    `UPDATE leads 
     SET score = $1, label = $2, reasoning = $3, recommended_action = $4, updated_at = NOW() 
     WHERE id = $5`,
    [scoreData.score, scoreData.label, scoreData.reasoning, scoreData.recommended_action, leadId]
  );
}

module.exports = {
  calculateScoreForLead,
  updateLeadScore
};
