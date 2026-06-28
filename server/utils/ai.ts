const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OpenAI } = require('openai');

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock_openai_key'
});

// Setup Gemini (Legacy/Fallback)
let keyIndex = 0;
const getGenAI = () => {
  const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(k => k && k !== 'mock');
  if (keys.length === 0) {
    return new GoogleGenerativeAI('mock');
  }
  const key = keys[keyIndex % keys.length];
  keyIndex++;
  return new GoogleGenerativeAI(key);
};

const hasValidAiConfig = () => {
  const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(k => k && k !== 'mock');
  return keys.length > 0 || !!process.env.OPENAI_API_KEY;
};

/**
 * Analyzes a real estate listing image using OpenAI Vision API.
 * @param {string} base64Image - Base64 encoded image string (e.g. "data:image/jpeg;base64,...")
 * @param {string} description - The listing text description
 * @returns {Promise<Object>} JSON containing the scores and suggestions
 */
const analyzeListingImage = async (base64Image, description) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock_openai_key') {
    console.warn("Using mock OpenAI analysis because OPENAI_API_KEY is not set.");
    return {
      photoScore: 65,
      textScore: 50,
      priceScore: 70,
      overallScore: 62,
      improvements: [
        "Lütfen API anahtarınızı (OPENAI_API_KEY) ayarlayın.",
        "Fotoğraf ışığı yetersiz (Mock Yanıt)",
        "Açıklama çok kısa (Mock Yanıt)"
      ]
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Sen uzman bir gayrimenkul danışmanı ve pazarlama uzmanısın. Görevin, sana gönderilen emlak ilan fotoğrafını ve ilan açıklamasını analiz ederek ilanın pazarlama potansiyelini puanlamaktır.
Lütfen sadece aşağıdaki formatta geçerli BİR JSON döndür:
{
  "score": 0-100 arası bir tamsayı (İlanın satılma ihtimali ve kalitesi),
  "weaknesses": ["Zayıf yön 1", "Zayıf yön 2", "Örn: Fotoğraf karanlık", "Örn: Açıklama yetersiz"],
  "strengths": ["Güçlü yön 1", "Güçlü yön 2"],
  "improved_description": "Bu ilanın daha hızlı satılması için kullanılabilecek dikkat çekici, duygusal bağ kuran yeni bir taslak ilan açıklaması."
}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: `İlan Açıklaması: ${description || 'Belirtilmemiş'}` },
            { type: "image_url", image_url: { url: base64Image } }
          ]
        }
      ]
    });

    let respText = response.choices[0].message.content.trim();
    // Clean markdown if present
    const jsonMatch = respText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      respText = jsonMatch[1];
    } else if (respText.startsWith('```')) {
      respText = respText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }

    const result = JSON.parse(respText);
    return result;
  } catch (error) {
    console.error("OpenAI Vision API Error:", error);
    throw new Error("Görsel analizi sırasında bir hata oluştu.");
  }
};

module.exports = { getGenAI, hasValidAiConfig, openai, analyzeListingImage };
