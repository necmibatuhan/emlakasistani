import db from '../db.js';

export interface ExternalListing {
  id: string;
  source_name: string; // "Sahibinden", "Hepsiemlak" vb.
  url: string;
  title: string;
  city: string;
  district: string;
  price: number;
  currency: string;
  rooms: string;
  owner_phone: string;
  match_score: number;
}

/**
 * MOCK: Gerçek bir dış havuz (Sahibinden vb.) entegrasyonumuz olsaydı tablo yapımız böyle olurdu:
 * 
 * CREATE TABLE external_listings (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   source_name TEXT NOT NULL,
 *   external_id TEXT UNIQUE NOT NULL,
 *   url TEXT NOT NULL,
 *   title TEXT NOT NULL,
 *   city TEXT,
 *   district TEXT,
 *   price NUMERIC NOT NULL,
 *   currency TEXT DEFAULT 'TRY',
 *   rooms TEXT,
 *   sqm INTEGER,
 *   owner_phone TEXT,
 *   scraped_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Fiyat, Şehir, İlçe bazlı hızlı arama için Index
 * CREATE INDEX idx_external_listings_search ON external_listings (city, district, price);
 */

// Simüle edilmiş dış havuz veritabanı (Mock Data)
const MOCK_EXTERNAL_DB: ExternalListing[] = [
  { id: 'ext-1', source_name: 'Sahibinden', url: 'https://sahibinden.com/ilan/1', title: 'Sahibinden Acil Satılık 3+1 Fırsat Daire', city: 'İstanbul', district: 'Kadıköy', price: 4800000, currency: 'TRY', rooms: '3+1', owner_phone: '+905551234567', match_score: 0 },
  { id: 'ext-2', source_name: 'Hepsiemlak', url: 'https://hepsiemlak.com/ilan/2', title: 'Moda Merkezde Yatırımlık Temiz Daire', city: 'İstanbul', district: 'Kadıköy', price: 5100000, currency: 'TRY', rooms: '3+1', owner_phone: '+905329876543', match_score: 0 },
  { id: 'ext-3', source_name: 'Zingat', url: 'https://zingat.com/ilan/3', title: 'Metroya Yakın Masrafsız 2+1', city: 'İstanbul', district: 'Şişli', price: 3200000, currency: 'TRY', rooms: '2+1', owner_phone: '+905051112233', match_score: 0 },
  { id: 'ext-4', source_name: 'Sahibinden', url: 'https://sahibinden.com/ilan/4', title: 'Kadıköy Çarşıda Satılık Dükkan', city: 'İstanbul', district: 'Kadıköy', price: 12000000, currency: 'TRY', rooms: '1+0', owner_phone: '+905334445566', match_score: 0 }
];

/**
 * Gelen Lead (müşteri) talebine göre dış havuzu tarayıp en iyi eşleşen 3 fırsatı döner.
 */
export async function findExternalOpportunities(leadId: string): Promise<ExternalListing[]> {
  // 1. Lead'in kriterlerini kendi veritabanımızdan çek
  const leadRes = await db.query('SELECT properties FROM leads WHERE id = $1', [leadId]);
  if (leadRes.rows.length === 0) return [];
  
  const properties = leadRes.rows[0].properties;
  if (!properties) return [];
  
  const props = typeof properties === 'string' ? JSON.parse(properties) : properties;
  
  // Lead'in bütçesi ve aradığı lokasyon/oda sayısı
  const targetMinBudget = props.butce_min || props.budget?.min || 0;
  const targetMaxBudget = props.butce_max || props.budget?.max || 999999999;
  const targetLocations = props.location_preferences || []; // Örn: ["Kadıköy", "Moda"]
  
  // Gerçek senaryoda bu işlem SQL ile optimize şekilde yapılır:
  /*
    SELECT *, 
      (CASE WHEN district = ANY($1) THEN 50 ELSE 0 END) +
      (CASE WHEN price BETWEEN $2 AND $3 THEN 50 ELSE 0 END) as match_score
    FROM external_listings
    WHERE district = ANY($1) OR price BETWEEN $2 AND $3
    ORDER BY match_score DESC
    LIMIT 3;
  */

  // 2. MOCK Veri üzerinde puanlama (Reverse Match Algoritması)
  const scoredListings = MOCK_EXTERNAL_DB.map(listing => {
    let score = 0;
    
    // Lokasyon uyumu (+50 Puan)
    const isLocationMatch = targetLocations.some((loc: string) => 
      listing.district.toLowerCase().includes(loc.toLowerCase()) || 
      listing.city.toLowerCase().includes(loc.toLowerCase())
    );
    if (isLocationMatch || targetLocations.length === 0) score += 50;

    // Bütçe uyumu (+50 Puan)
    if (listing.price >= targetMinBudget && listing.price <= targetMaxBudget) {
      score += 50;
    } else if (listing.price <= targetMaxBudget * 1.1) {
      // Bütçeyi %10 aşan ilanlara kısmi puan ver (+25 Puan)
      score += 25; 
    }

    return { ...listing, match_score: score };
  });

  // 3. Sadece mantıklı eşleşmeleri (skoru > 0 olanları) sırala ve ilk 3'ü dön
  const topMatches = scoredListings
    .filter(l => l.match_score > 0)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3);

  return topMatches;
}
