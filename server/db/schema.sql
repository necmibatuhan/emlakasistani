CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE offices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  office_id UUID REFERENCES offices(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'office_manager', 'company_admin')),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','proplus')),
  verification_token TEXT,
  is_verified BOOLEAN DEFAULT false,
  referral_code TEXT UNIQUE,
  referred_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subscription_status VARCHAR(20) DEFAULT 'trial',
  cancel_reason VARCHAR(100),
  cancel_feedback TEXT,
  discount_offered BOOLEAN DEFAULT false,
  discount_accepted BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  grace_period_ends TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cancel_flow_events (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  step VARCHAR(50),
  action VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 10),
  label TEXT NOT NULL CHECK (label IN ('Sıcak','Ilık','Soğuk')),
  reasoning TEXT,
  recommended_action TEXT,
  whatsapp_draft TEXT,
  status TEXT NOT NULL DEFAULT 'Takipte'
    CHECK (status IN ('Takipte','Arandı','Randevu Alındı','Satış Tamamlandı')),
  reminder_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lead_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  bolge TEXT, tip TEXT, oda TEXT, butce TEXT, aciliyet TEXT
);

CREATE TABLE lead_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lead_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
