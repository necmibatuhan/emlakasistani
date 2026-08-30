CREATE TABLE IF NOT EXISTS follow_up_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  office_id UUID REFERENCES offices(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE, created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS follow_up_plan_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), plan_id UUID NOT NULL REFERENCES follow_up_plans(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL CHECK (step_order > 0), delay_minutes INTEGER NOT NULL DEFAULT 0 CHECK (delay_minutes >= 0),
  action_type TEXT NOT NULL CHECK (action_type IN ('whatsapp_draft','reminder','score_adjust')),
  action_params JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(plan_id, step_order)
);
CREATE TABLE IF NOT EXISTS lead_active_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), plan_id UUID NOT NULL REFERENCES follow_up_plans(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE, current_step INTEGER NOT NULL DEFAULT 1,
  next_run_at TIMESTAMPTZ, status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','completed','cancelled')),
  pause_reason TEXT, started_by UUID REFERENCES users(id) ON DELETE SET NULL, started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), completed_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_follow_up_per_lead ON lead_active_plans(lead_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS due_follow_up_plans ON lead_active_plans(status,next_run_at) WHERE status = 'active';
CREATE TABLE IF NOT EXISTS follow_up_step_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), active_plan_id UUID NOT NULL REFERENCES lead_active_plans(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES follow_up_plan_steps(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','completed','failed','skipped')),
  output JSONB NOT NULL DEFAULT '{}'::jsonb, executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(active_plan_id, step_id)
);

WITH new_plans AS (
  INSERT INTO follow_up_plans(company_id,name,description)
  SELECT c.id, 'Yeni Lead – 7 Günlük Takip', '1. gün WhatsApp taslağı, 3. gün hatırlatma, 7. gün skor güncelleme'
  FROM companies c
  WHERE NOT EXISTS (SELECT 1 FROM follow_up_plans p WHERE p.company_id=c.id AND p.name='Yeni Lead – 7 Günlük Takip')
  RETURNING id
)
INSERT INTO follow_up_plan_steps(plan_id,step_order,delay_minutes,action_type,action_params)
SELECT id, 1, 1440, 'whatsapp_draft', '{"instruction":"İlk görüşmeyi nazikçe takip et"}'::jsonb FROM new_plans
UNION ALL SELECT id, 2, 4320, 'reminder', '{"message":"Lead yanıt vermedi; yeniden iletişim kurun."}'::jsonb FROM new_plans
UNION ALL SELECT id, 3, 10080, 'score_adjust', '{"delta":-1}'::jsonb FROM new_plans;
