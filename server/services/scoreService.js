const { getGenAI, hasValidAiConfig } = require('../utils/ai');
const pool = require('../db');

const genAI = getGenAI();

async function calculateScoreForLead(lead) {
  if (!hasValidAiConfig()) {
    return {
      score: Math.floor(Math.random() * 40) + 60,
      reason: "Mock AI gerekçesi: Yüksek bütçeli müşteri, acil arama.",
      tags: ["Yüksek Bütçe", "Sıcak Müşteri"]
    };
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Sen bir gayrimenkul satış koçusun. Aşağıdaki müşteri profiline bakarak 0-100 arası bir öncelik skoru ver ve NEDENİNİ 1-2 cümlede Türkçe açıkla. Sadece JSON dön, başka hiçbir şey yazma.

Format:
{
  "score": <sayı>,
  "reason": "<1-2 cümle Türkçe gerekçe>",
  "tags": ["<kısa etiket 1>", "<kısa etiket 2>"]
}

Müşteri verisi:
${JSON.stringify(lead, null, 2)}

Skorlama kriterleri:
- Uzun süredir iletişim kurulmadıysa öncelik artar
- Bütçe yüksekse öncelik artar  
- Eşleşen portföy varsa öncelik artar
- Referans kaynaklı müşteriler daha değerlidir
- Notlarda aciliyet/somut gereksinim varsa öncelik artar`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Score Error:", error);
    // Rule-based fallback
    return {
      score: 50,
      reason: "Yapay zeka analiz edemedi, varsayılan skor atandı.",
      tags: ["Sistem"]
    };
  }
}

async function updateLeadScore(leadId, scoreData) {
  await pool.query(
    `UPDATE leads 
     SET score = $1, score_reason = $2, score_tags = $3, score_updated_at = NOW() 
     WHERE id = $4`,
    [scoreData.score, scoreData.reason, JSON.stringify(scoreData.tags), leadId]
  );
}

module.exports = {
  calculateScoreForLead,
  updateLeadScore
};
