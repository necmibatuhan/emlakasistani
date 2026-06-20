const cron = require('node-cron');
const db = require('../db');
const { OpenAI } = require('openai');

// Initialize OpenAI. Make sure OPENAI_API_KEY is in .env
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Global cache for today's motivation to avoid calling OpenAI for every user
let todaysMotivation = null;
let motivationDate = null;

/**
 * Generate a daily motivation string using OpenAI
 */
async function generateDailyMotivation() {
  const today = new Date().toDateString();
  if (todaysMotivation && motivationDate === today) {
    return todaysMotivation;
  }

  try {
    const prompt = `
Bir emlak danışmanı için güne başlarken okuyacağı, enerjisini yükseltecek, satış psikolojisi veya güncel piyasa trendleri hakkında çok kısa (1-2 cümlelik) bir motivasyon sözü veya stratejik öngörü yaz.
Sadece sözü döndür, tırnak işareti kullanma.
Örnek: "Gayrimenkulde satış, mülkü değil; o mülkün sunacağı yeni yaşamı satmaktır. Bugün 1 müşterinin hayaline dokun!"
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    todaysMotivation = response.choices[0].message.content.trim();
    motivationDate = today;
    return todaysMotivation;
  } catch (err) {
    console.error("Error generating motivation:", err);
    return "Gayrimenkulde başarı, pes etmeyenlerin ve doğru takip yapanlarındır. Bugün harika bir gün olacak!";
  }
}

/**
 * Get Morning Briefing Data for a Specific User
 */
async function getUserBriefing(userId) {
  try {
    const motivation = await generateDailyMotivation();

    // 1. Sıcak 3 Müşteri (Score >= 7, Satış Tamamlanmadı)
    const hotLeadsResult = await db.query(`
      SELECT id, name, phone, message, score, status 
      FROM leads 
      WHERE user_id = $1 AND score >= 7 AND status != 'Satış Tamamlandı'
      ORDER BY score DESC, updated_at DESC
      LIMIT 3
    `, [userId]);

    // 2. Kayıp Riski Taşıyan 2 Portföy (Örnek: 15 günden eski ve durumu Aktif olan)
    // properties tablosunda listed_by kullanıcısı için
    const atRiskResult = await db.query(`
      SELECT id, title, type, location, price, created_at
      FROM properties
      WHERE listed_by = $1 AND status != 'Satıldı' AND created_at < NOW() - INTERVAL '15 days'
      ORDER BY created_at ASC
      LIMIT 2
    `, [userId]);

    return {
      motivation,
      hotLeads: hotLeadsResult.rows,
      atRiskProperties: atRiskResult.rows
    };
  } catch (err) {
    console.error("Error getting user briefing:", err);
    throw err;
  }
}

/**
 * Send WhatsApp/Push simulation for all active users at 08:30
 */
async function runDailyBriefingJob() {
  console.log('[MorningBriefing] Starting daily briefing job...');
  try {
    await generateDailyMotivation(); // Cache it for today
    
    // Aktif kullanıcıları bul
    const { rows: users } = await db.query('SELECT id, name, phone FROM users WHERE is_verified = true');
    
    for (const user of users) {
      const briefing = await getUserBriefing(user.id);
      
      // WhatsApp Gönderim Simülasyonu
      console.log(`[WhatsApp] Sending briefing to ${user.name} (${user.phone || 'No phone'}):`);
      console.log(`🌅 Günaydın ${user.name}!`);
      console.log(`💡 Öngörü: ${briefing.motivation}`);
      console.log(`🔥 Sıcak Müşteriler: ${briefing.hotLeads.map(l => l.name).join(', ')}`);
      console.log(`⚠️ Riskli Portföyler: ${briefing.atRiskProperties.map(p => p.title).join(', ')}`);
      console.log('--------------------------------------------------');
    }
    
    console.log('[MorningBriefing] Job completed successfully.');
  } catch (err) {
    console.error('[MorningBriefing] Job failed:', err);
  }
}

// Her sabah 08:30'da çalıştır (Türkiye Saati)
cron.schedule('30 8 * * *', () => {
  runDailyBriefingJob();
}, { timezone: 'Europe/Istanbul' });

module.exports = {
  generateDailyMotivation,
  getUserBriefing,
  runDailyBriefingJob
};
