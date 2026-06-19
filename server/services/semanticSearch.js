const { OpenAI } = require('openai');
const db = require('../db');

// Initialize OpenAI. Make sure OPENAI_API_KEY is in .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 1. Intent Extraction (Niyet Analizi)
 * Müşterinin doğal dildeki ifadesini alır ve yapılandırılmış bir formata (SQL filtreleri ve Semantik Arama niyeti) çevirir.
 * @param {string} rawQuery - Müşterinin girdiği sorgu ("Şişli'de ferah ofis")
 */
async function extractIntent(rawQuery) {
  try {
    const prompt = `
Bir emlak danışmanısın. Müşteri sana aşağıdaki talebi iletti.
Görevlerin:
1. "location" (İlçe), "type" (Konut/Ofis vs.) gibi kesin filtreleri ayır. (Eğer belirtilmemişse null bırak)
2. Müşterinin gizli niyetini (latent intent) tespit et. Örneğin "ferah" diyorsa "geniş pencereli, yüksek tavan, aydınlık" demek istiyor olabilir.
3. Bunları tek bir "semanticSearchQuery" cümlesinde birleştir. Bu cümle vektörel eşleştirme için kullanılacak.

Müşteri Talebi: "${rawQuery}"

Lütfen sadece aşağıdaki JSON formatında bir cevap döndür (```json etiketlerini kullanma, sadece JSON'u ver):
{
  "explicitFilters": {
    "location": "string | null",
    "type": "string | null"
  },
  "semanticSearchQuery": "string (müşterinin asıl niyetini ve aradığı özellikleri detaylı anlatan 1-2 cümle)"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // GPT-4o-mini is fast and good for this
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Intent Extraction Error:", error);
    throw error;
  }
}

/**
 * 2. Generate Embedding
 * Verilen bir metni vektöre (1536 boyutlu dizi) çevirir.
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Embedding Error:", error);
    throw error;
  }
}

/**
 * 3. Semantic Search
 * Vektörel benzerliği kullanarak veritabanından en uygun ilanları bulur.
 */
async function findMatchingProperties(companyId, rawQuery, topK = 5) {
  try {
    // 1. Niyeti ayrıştır
    const intent = await extractIntent(rawQuery);
    console.log("Extracted Intent:", intent);

    // 2. Niyet cümlesini vektöre çevir
    const queryVector = await generateEmbedding(intent.semanticSearchQuery);
    const vectorString = `[${queryVector.join(',')}]`; // pgvector formatı

    // 3. Veritabanında (pgvector ile) Kosinüs Benzerliği (Cosine Similarity) ara
    // <=> operatörü Kosinüs mesafesini (Cosine distance) hesaplar. 
    // Daha küçük mesafe = daha yüksek benzerlik.
    
    let sqlQuery = `
      SELECT id, title, type, location, address, price, features, description,
             1 - (embedding <=> $1::vector) AS similarity_score
      FROM properties
      WHERE company_id = $2
    `;
    let values = [vectorString, companyId];
    let valueCounter = 3;

    // Eğer LLM kesin bir filtre bulduysa ekle
    if (intent.explicitFilters.location) {
      sqlQuery += ` AND location ILIKE $${valueCounter}`;
      values.push(`%${intent.explicitFilters.location}%`);
      valueCounter++;
    }
    
    if (intent.explicitFilters.type) {
      sqlQuery += ` AND type ILIKE $${valueCounter}`;
      values.push(`%${intent.explicitFilters.type}%`);
      valueCounter++;
    }

    // Mesafe null değilse (yani embedding varsa) sırala ve limit koy
    sqlQuery += ` AND embedding IS NOT NULL`;
    sqlQuery += ` ORDER BY embedding <=> $1::vector ASC`;
    sqlQuery += ` LIMIT $${valueCounter}`;
    values.push(topK);

    const { rows } = await db.query(sqlQuery, values);
    
    // 4. İsteğe Bağlı: LLM ile sonuçları açıklama (Re-ranking / Explanation)
    if (rows.length > 0) {
      const explanations = await explainMatches(intent.semanticSearchQuery, rows);
      // Açıklamaları sonuçlara ekle
      rows.forEach((row, idx) => {
        row.aiExplanation = explanations[idx] || "Eşleşme detayı bulunamadı.";
      });
    }

    return {
      intent,
      matches: rows
    };

  } catch (error) {
    console.error("Semantic Search Error:", error);
    throw error;
  }
}

/**
 * 4. Explain Matches
 * Bulunan eşleşmelerin "Neden" eşleştiğini danışman için açıklar.
 */
async function explainMatches(intentQuery, properties) {
  try {
    const prompt = `
Sen bir emlak danışmanının asistanısın. Müşteri şu gizli niyetlerle ilan arıyor: "${intentQuery}"

Aşağıdaki ${properties.length} ilanın özelliklerine bakarak, her biri için müşterinin gizli niyetini NASIL karşıladığını anlatan tek cümlelik bir açıklama yaz.
Eğer bir özellik eksikse ama başka bir özellikle bunu telafi ediyorsa belirt.

İlanlar (JSON Formatında):
${JSON.stringify(properties.map(p => ({ id: p.id, title: p.title, description: p.description, features: p.features })))}

Dönüş Formatı (Sadece bir JSON dizisi dön):
[
  "1. ilan için açıklama",
  "2. ilan için açıklama"
]
`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" } 
      // Not: response_format: json_object kullanılınca root'un JSON Objesi olması beklenir. 
      // Bu yüzden prompt'u ufak bir key içine alarak değiştiriyorum.
    });

    const fixedPrompt = `...
Dönüş Formatı (Sadece aşağıdaki JSON formatını dön):
{
  "explanations": ["1. ilan açıklaması", "2. ilan açıklaması"]
}
`;
    
    const completionV2 = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt.replace(/Dönüş Formatı.*/s, fixedPrompt) }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completionV2.choices[0].message.content);
    return result.explanations || [];
  } catch (error) {
    console.error("Explanation Error:", error);
    return [];
  }
}

/**
 * Portföye yeni ilan eklendiğinde çağrılır. 
 * İlanın tüm metinsel özelliklerini birleştirip tek bir vektöre çevirir.
 */
async function embedProperty(propertyId) {
  try {
    // İlanı getir
    const { rows } = await db.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
    if (rows.length === 0) return;
    
    const property = rows[0];
    const textToEmbed = `
Başlık: ${property.title}
Tip: ${property.type}
Bölge: ${property.location}
Adres: ${property.address}
Fiyat: ${property.price}
Metrekare: ${property.sqm}
Özellikler: ${JSON.stringify(property.features)}
Açıklama: ${property.description || ''}
    `.trim();

    // Vektör oluştur
    const embedding = await generateEmbedding(textToEmbed);
    const vectorString = `[${embedding.join(',')}]`;

    // DB'ye kaydet
    await db.query(
      'UPDATE properties SET embedding = $1::vector WHERE id = $2',
      [vectorString, propertyId]
    );

    console.log(`Property ${propertyId} embedded successfully.`);
  } catch (error) {
    console.error("Embed Property Error:", error);
  }
}

module.exports = {
  extractIntent,
  generateEmbedding,
  findMatchingProperties,
  embedProperty
};
