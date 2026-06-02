// Mock Queue Service (In-memory) for development without Redis
const db = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock');

const matchQueue = [];

// Worker process to handle matches in background
setInterval(async () => {
  if (matchQueue.length > 0) {
    const job = matchQueue.shift();
    if (job.name === 'MATCH_PROPERTIES') {
      try {
        console.log(`Processing MATCH_PROPERTIES for Lead: ${job.data.leadId}`);
        const leadRes = await db.query('SELECT * FROM leads WHERE id = $1', [job.data.leadId]);
        if (leadRes.rows.length === 0) return;
        const lead = leadRes.rows[0];

        // Fetch properties for that office
        const propertiesRes = await db.query("SELECT * FROM properties WHERE office_id = $1 AND status = 'Aktif'", [lead.office_id]);
        if (propertiesRes.rows.length === 0) {
            console.log("No active properties found for matching.");
            return;
        }

        const prompt = `Emlak AI Eşleştirme Motoru
Aşağıdaki Lead tercihleri ile Portföy listesindeki mülkleri eşleştir.

Lead Tercihleri:
${JSON.stringify(lead.properties)}

Aktif Portföy Listesi:
${JSON.stringify(propertiesRes.rows.map(p => ({id: p.id, title: p.title, type: p.type, city: p.city, price: p.price, features: p.features})))}

Lütfen en uygun olan maksimum 3 mülkü puanlayarak eşleştir.
Yanıtını JSON dizisi olarak ver. Örnek: [{"property_id": "...", "match_score": 85, "ai_reasoning": "Bütçeye ve bölgeye tam uyuyor."}]`;

        let matches = [];
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
            // Mock match
            matches = [{
                property_id: propertiesRes.rows[0].id,
                match_score: 90,
                ai_reasoning: "Lead bütçesi ve lokasyon isteği ile tamamen örtüşüyor."
            }];
        } else {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
            const aiResult = await model.generateContent(prompt);
            matches = JSON.parse(aiResult.response.text());
        }

        for (const match of matches) {
            await db.query(
                'INSERT INTO lead_property_matches (lead_id, property_id, match_score, ai_reasoning) VALUES ($1, $2, $3, $4)',
                [lead.id, match.property_id, match.match_score, match.ai_reasoning]
            );
        }
        console.log(`Matched ${matches.length} properties for lead ${lead.id}`);

      } catch (err) {
        console.error("Queue matching error:", err);
      }
    }
  }
}, 3000);

const queue = {
  add: (name, data) => {
    matchQueue.push({ name, data });
  }
};

module.exports = queue;
