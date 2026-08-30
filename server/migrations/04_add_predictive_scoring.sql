ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id),
  ADD COLUMN IF NOT EXISTS office_id UUID REFERENCES offices(id),
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS predicted_conversion_score SMALLINT CHECK (predicted_conversion_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS predicted_conversion_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS predictive_model_version TEXT;

-- Some early installations were created before semantic match persistence was
-- added. Keep this migration self-contained so predictive features can be
-- calculated safely on those databases too.
CREATE TABLE IF NOT EXISTS properties (
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
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif','Rezerve','Satıldı','Pasif')),
  photos JSONB,
  features JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_property_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  match_score SMALLINT,
  ai_reasoning TEXT,
  shown_to_lead BOOLEAN DEFAULT FALSE,
  shown_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_lead_property_match ON lead_property_matches(lead_id, property_id);
CREATE INDEX IF NOT EXISTS idx_matches_lead ON lead_property_matches(lead_id, match_score DESC);

CREATE TABLE IF NOT EXISTS lead_score_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  score SMALLINT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lead_score_history_lead ON lead_score_history(lead_id, recorded_at DESC);

CREATE OR REPLACE FUNCTION record_lead_score_change() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.score IS DISTINCT FROM OLD.score AND NEW.score IS NOT NULL THEN
    INSERT INTO lead_score_history(lead_id, score) VALUES(NEW.id, NEW.score);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_record_lead_score_change ON leads;
CREATE TRIGGER trg_record_lead_score_change AFTER UPDATE OF score ON leads
FOR EACH ROW EXECUTE FUNCTION record_lead_score_change();

INSERT INTO lead_score_history(lead_id, score, recorded_at)
SELECT l.id, l.score, l.created_at FROM leads l
WHERE l.score IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lead_score_history h WHERE h.lead_id=l.id);

CREATE TABLE IF NOT EXISTS lead_prediction_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  predicted_score SMALLINT NOT NULL CHECK (predicted_score BETWEEN 0 AND 100),
  model_version TEXT NOT NULL,
  feature_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  predicted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prediction_history_lead ON lead_prediction_history(lead_id, predicted_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS one_prediction_per_model_per_day
  ON lead_prediction_history(lead_id, model_version, ((predicted_at AT TIME ZONE 'UTC')::date));

CREATE OR REPLACE VIEW lead_conversion_features AS
WITH event_metrics AS (
  SELECT lead_id, COUNT(*)::INTEGER AS event_count, MIN(created_at) AS first_event_at,
    MAX(created_at) AS last_event_at,
    COUNT(*) FILTER (WHERE event_type ~* 'call|contact|whatsapp|voice|note|reminder|follow_up')::INTEGER AS contact_event_count
  FROM lead_events GROUP BY lead_id
), note_metrics AS (
  SELECT lead_id, COUNT(*)::INTEGER AS note_count, MIN(created_at) AS first_note_at, MAX(created_at) AS last_note_at
  FROM lead_notes GROUP BY lead_id
), match_metrics AS (
  SELECT lead_id, COUNT(*)::INTEGER AS match_count, AVG(match_score)::NUMERIC(6,2) AS average_match_score
  FROM lead_property_matches GROUP BY lead_id
), score_metrics AS (
  SELECT lead_id, COUNT(*)::INTEGER AS score_history_count, AVG(score)::NUMERIC(6,2) AS average_historical_score,
    MIN(score)::SMALLINT AS minimum_historical_score, MAX(score)::SMALLINT AS maximum_historical_score
  FROM lead_score_history GROUP BY lead_id
)
SELECT l.id AS lead_id, l.company_id, l.office_id, l.assigned_to, l.status, l.score AS current_crm_score,
  l.created_at, l.updated_at,
  COALESCE(LEAST(e.first_event_at,n.first_note_at),e.first_event_at,n.first_note_at) AS first_contact_at,
  COALESCE(GREATEST(e.last_event_at,n.last_note_at),e.last_event_at,n.last_note_at,l.created_at) AS last_activity_at,
  CASE WHEN l.status='Satış Tamamlandı' THEN TRUE WHEN l.status='İptal' THEN FALSE ELSE NULL END AS converted,
  CASE WHEN l.status IN ('Satış Tamamlandı','İptal') THEN EXTRACT(EPOCH FROM (l.updated_at-l.created_at))/86400.0 END AS days_to_outcome,
  CASE WHEN l.status IN ('Satış Tamamlandı','İptal') AND COALESCE(LEAST(e.first_event_at,n.first_note_at),e.first_event_at,n.first_note_at) IS NOT NULL
    THEN EXTRACT(EPOCH FROM (l.updated_at-COALESCE(LEAST(e.first_event_at,n.first_note_at),e.first_event_at,n.first_note_at)))/86400.0 END AS days_first_contact_to_outcome,
  EXTRACT(EPOCH FROM (NOW()-l.created_at))/86400.0 AS lead_age_days,
  EXTRACT(EPOCH FROM (COALESCE(LEAST(e.first_event_at,n.first_note_at),e.first_event_at,n.first_note_at,l.created_at)-l.created_at))/3600.0 AS response_time_hours,
  EXTRACT(EPOCH FROM (NOW()-COALESCE(GREATEST(e.last_event_at,n.last_note_at),e.last_event_at,n.last_note_at,l.created_at)))/86400.0 AS days_since_last_activity,
  (COALESCE(e.contact_event_count,0)+COALESCE(n.note_count,0))::INTEGER AS contact_count,
  ((COALESCE(e.contact_event_count,0)+COALESCE(n.note_count,0))/GREATEST(EXTRACT(EPOCH FROM (NOW()-l.created_at))/604800.0,1))::NUMERIC(8,2) AS contacts_per_week,
  COALESCE(m.match_count,0)::INTEGER AS match_count, COALESCE(m.average_match_score,0)::NUMERIC(6,2) AS average_match_score,
  COALESCE(s.score_history_count,0)::INTEGER AS score_history_count, s.average_historical_score,
  s.minimum_historical_score, s.maximum_historical_score
FROM leads l
LEFT JOIN event_metrics e ON e.lead_id=l.id
LEFT JOIN note_metrics n ON n.lead_id=l.id
LEFT JOIN match_metrics m ON m.lead_id=l.id
LEFT JOIN score_metrics s ON s.lead_id=l.id;
