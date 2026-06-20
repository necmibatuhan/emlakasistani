const { getGenAI, hasValidAiConfig } = require('../utils/ai');
import db from '../db.js'; // PostgreSQL db instance

const genAI = getGenAI();

export interface LandlordReport {
  property_title: string;
  total_leads_this_week: number;
  appointments_made: number;
  price_feedbacks: number;
  ai_generated_report: string;
}

const REPORT_SYSTEM_PROMPT = `
Sen üst düzey bir Kurumsal Gayrimenkul Danışmanısın.
Görevin: Mal sahibine (Mülk sahibine) haftalık portföy aktivite raporu yazmak.
Sana verilecek veriler, o mülk ile ilgilenen müşterilerin son 7 günlük özetleridir.
Kurallar:
1. Hitap son derece profesyonel ve saygılı olmalı. ("Değerli mülk sahibimiz," gibi)
2. Asla müşteri isimlerini (Kişisel Verileri) açık etme! "Bir yatırımcı müşterimiz", "Bir aile" şeklinde bahset.
3. Fiyat itirazları varsa bunu mal sahibini suçlamadan, piyasa gerçekliği olarak nazikçe aktar.
4. Raporu okuyan mal sahibi, emlakçının çok sıkı çalıştığını ve mülküyle yakından ilgilendiğini hissetmeli.
Çıktı Formatı: Markdown kullanılmayan, düzgün paragraflara bölünmüş şık bir e-posta/WhatsApp metni.
`;

/**
 * Son 7 günde belirli bir mülk ile eşleşen aktiviteleri toplayıp yapay zekaya raporlatır.
 */
export async function generateLandlordReport(propertyId: string): Promise<LandlordReport> {
  try {
    // 1. Mülk detaylarını çek
    const propertyRes = await db.query('SELECT title, price, district FROM properties WHERE id = $1', [propertyId]);
    if (propertyRes.rows.length === 0) throw new Error("Mülk bulunamadı");
    const property = propertyRes.rows[0];

    // 2. Son 7 günün aktivitesini getir (lead_property_matches)
    const recentActivityQuery = \`
      SELECT l.name, l.status, l.score, l.reasoning, m.ai_reasoning
      FROM lead_property_matches m
      JOIN leads l ON m.lead_id = l.id
      WHERE m.property_id = $1 
        AND m.created_at >= NOW() - INTERVAL '7 days'
    \`;
    const activityRes = await db.query(recentActivityQuery, [propertyId]);
    const leadsData = activityRes.rows;

    // 3. İstatistikleri Hesapla
    const total_leads = leadsData.length;
    const appointments = leadsData.filter(l => l.status === 'Randevu Alındı').length;
    
    const price_feedbacks = leadsData.filter(l => 
      (l.reasoning || '').toLowerCase().includes('pahalı') || 
      (l.reasoning || '').toLowerCase().includes('bütçe')
    ).length;

    let reportText = "";
    
    // 4. Gemini API'ye Raporu Yazdır
    if (hasValidAiConfig()) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { temperature: 0.3 } });
      
      const rawDataContext = JSON.stringify({
        property_details: property,
        activity_count: total_leads,
        appointments_made: appointments,
        feedbacks: leadsData.map(l => l.reasoning || l.ai_reasoning)
      });

      const result = await model.generateContent([
        { text: REPORT_SYSTEM_PROMPT },
        { text: \`Lütfen bu verilere dayanarak haftalık durumu özetleyen bir metin yaz: \\n\${rawDataContext}\` }
      ]);

      reportText = result.response.text().trim();
    } else {
      reportText = "Değerli mülk sahibimiz, bu hafta mülkünüzle " + total_leads + " kişi ilgilendi. " + appointments + " adet randevu gerçekleştirdik. Piyasa koşullarını yakından takip ediyor, doğru alıcıyı/kiracıyı bulmak için çalışmalarımıza devam ediyoruz.";
    }

    return {
      property_title: property.title,
      total_leads_this_week: total_leads,
      appointments_made: appointments,
      price_feedbacks,
      ai_generated_report: reportText
    };

  } catch (error: any) {
    console.error("Mal Sahibi Raporu Üretilirken Hata:", error.message);
    throw new Error("Rapor üretilemedi.");
  }
}
