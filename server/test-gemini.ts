require('dotenv').config();
const { getGenAI } = require('./utils/ai');

async function test() {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json", temperature: 0.3 } });
  
  const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  
  const promptText = `Sen usta bir emlak danışmanısın. Ekip arkadaşın sana bir emlak sitesindeki ilanın ekran görüntüsünü (screenshot) yolladı.
Bu ilanı incele ve bana sadece aşağıdaki formatta geçerli bir JSON dön:
{
  "score": 80,
  "weaknesses": ["A"],
  "strengths": ["B"],
  "improved_description": "C"
}`;

  try {
    const aiResult = await model.generateContent([
      { inlineData: { mimeType: "image/png", data: dummyBase64 } },
      { text: promptText }
    ]);
    
    let respText = aiResult.response.text().trim();
    console.log("RAW RESPONSE:", respText);
    
    const jsonMatch = respText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      respText = jsonMatch[1];
    } else if (respText.startsWith('```')) {
      respText = respText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }
    
    const parsed = JSON.parse(respText);
    console.log("PARSED OK:", parsed);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
test();
