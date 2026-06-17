const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sql = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Şirket hiyerarşisi
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'enterprise',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- users tablosunu güncelle (mevcut varsa düşür veya alter et)
DROP TABLE IF EXISTS whatsapp_messages CASCADE;
DROP TABLE IF EXISTS crm_integrations CASCADE;
DROP TABLE IF EXISTS lead_property_matches CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS lead_events CASCADE;
DROP TABLE IF EXISTS lead_notes CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  office_id UUID REFERENCES offices(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN
    ('super_admin','company_admin','office_manager','agent','viewer')),
  plan TEXT DEFAULT 'free',
  verification_token TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead + mülk veritabanı
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  office_id UUID REFERENCES offices(id),
  assigned_to UUID REFERENCES users(id),
  source TEXT,  
  external_id TEXT,  
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  score SMALLINT CHECK (score BETWEEN 1 AND 10),
  label TEXT CHECK (label IN ('Sıcak','Ilık','Soğuk')),
  reasoning TEXT,
  whatsapp_draft TEXT,
  recommended_action TEXT,
  status TEXT DEFAULT 'Takipte' CHECK (status IN
    ('Takipte','Arandı','Randevu Alındı','Teklif Verildi',
     'Sözleşme Aşamasında','Satış Tamamlandı','İptal')),
  reminder_date TIMESTAMPTZ,
  budget_min NUMERIC,
  budget_max NUMERIC,
  currency TEXT DEFAULT 'TRY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  properties JSONB
);

CREATE TABLE lead_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lead_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portföy
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  office_id UUID REFERENCES offices(id),
  listed_by UUID REFERENCES users(id),
  external_listing_id TEXT,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('Satılık','Kiralık')),
  category TEXT,
  city TEXT,
  district TEXT,
  address TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'TRY',
  sqm INTEGER,
  rooms TEXT,
  floor INTEGER,
  status TEXT DEFAULT 'Aktif' CHECK (status IN
    ('Aktif','Rezerve','Satıldı','Pasif')),
  photos JSONB,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead–Mülk eşleştirme
CREATE TABLE lead_property_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  match_score SMALLINT,
  ai_reasoning TEXT,
  shown_to_lead BOOLEAN DEFAULT FALSE,
  shown_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dış CRM senkronizasyonu
CREATE TABLE crm_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  field_mapping JSONB,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'idle',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp konuşma logu
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  direction TEXT CHECK (direction IN ('outbound','inbound')),
  message TEXT NOT NULL,
  wa_message_id TEXT,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_office ON leads(office_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_properties_company ON properties(company_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_lead ON lead_property_matches(lead_id, match_score DESC);
`;

async function setup() {
  try {
    await pool.query(sql);
    console.log("Enterprise Database setup complete.");
  } catch (err) {
    console.error("Error setting up db:", err);
  } finally {
    pool.end();
  }
}

setup();
