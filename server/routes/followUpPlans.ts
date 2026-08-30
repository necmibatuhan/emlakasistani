const express = require('express');
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();
const managerOnly = requireRole(['office_manager', 'company_admin', 'super_admin']);
const validActions = new Set(['whatsapp_draft', 'reminder', 'score_adjust']);

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const plans = await db.query(`SELECT p.*, COALESCE(json_agg(s ORDER BY s.step_order) FILTER (WHERE s.id IS NOT NULL),'[]') AS steps
      FROM follow_up_plans p LEFT JOIN follow_up_plan_steps s ON s.plan_id=p.id
      WHERE p.company_id=$1 AND p.is_active=TRUE AND (p.office_id IS NULL OR p.office_id=$2)
      GROUP BY p.id ORDER BY p.created_at`, [req.user.company_id, req.user.office_id || null]);
    res.json(plans.rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/', managerOnly, async (req, res) => {
  const { name, description = '', steps = [] } = req.body;
  if (!name?.trim() || !steps.length || steps.some(s => !validActions.has(s.action_type) || Number(s.delay_minutes) < 0)) {
    return res.status(400).json({ message: 'Plan adı ve geçerli en az bir adım gerekli.' });
  }
  try {
    const plan = await db.withTransaction(async client => {
      const created = await client.query(`INSERT INTO follow_up_plans(company_id,office_id,name,description,created_by)
        VALUES($1,$2,$3,$4,$5) RETURNING *`, [req.user.company_id, req.user.role === 'office_manager' ? req.user.office_id : null, name.trim(), description, req.user.id]);
      for (let i = 0; i < steps.length; i++) await client.query(`INSERT INTO follow_up_plan_steps(plan_id,step_order,delay_minutes,action_type,action_params)
        VALUES($1,$2,$3,$4,$5)`, [created.rows[0].id, i + 1, Number(steps[i].delay_minutes || 0), steps[i].action_type, steps[i].action_params || {}]);
      return created.rows[0];
    });
    res.status(201).json(plan);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:id', managerOnly, async (req, res) => {
  const { name, description = '', steps = [] } = req.body;
  if (!name?.trim() || !steps.length) return res.status(400).json({ message: 'Eksik plan bilgisi.' });
  try {
    await db.withTransaction(async client => {
      const owned = await client.query('UPDATE follow_up_plans SET name=$1,description=$2,updated_at=NOW() WHERE id=$3 AND company_id=$4 RETURNING id', [name, description, req.params.id, req.user.company_id]);
      if (!owned.rowCount) throw new Error('Plan bulunamadı');
      await client.query('DELETE FROM follow_up_plan_steps WHERE plan_id=$1', [req.params.id]);
      for (let i = 0; i < steps.length; i++) await client.query('INSERT INTO follow_up_plan_steps(plan_id,step_order,delay_minutes,action_type,action_params) VALUES($1,$2,$3,$4,$5)', [req.params.id, i + 1, Number(steps[i].delay_minutes || 0), steps[i].action_type, steps[i].action_params || {}]);
    });
    res.json({ success: true });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

router.get('/lead/:leadId', async (req, res) => {
  try {
    const result = await db.query(`SELECT ap.*,p.name AS plan_name,s.action_type AS current_action,s.delay_minutes
      FROM lead_active_plans ap JOIN follow_up_plans p ON p.id=ap.plan_id
      LEFT JOIN follow_up_plan_steps s ON s.plan_id=ap.plan_id AND s.step_order=ap.current_step
      JOIN leads l ON l.id=ap.lead_id WHERE ap.lead_id=$1 AND l.company_id=$2
      ORDER BY ap.started_at DESC LIMIT 1`, [req.params.leadId, req.user.company_id]);
    res.json(result.rows[0] || null);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/assign', async (req, res) => {
  const { lead_id, plan_id } = req.body;
  try {
    const assigned = await db.withTransaction(async client => {
      const scope = await client.query('SELECT id FROM leads WHERE id=$1 AND company_id=$2', [lead_id, req.user.company_id]);
      const plan = await client.query(`SELECT p.id,s.step_order,s.delay_minutes FROM follow_up_plans p JOIN follow_up_plan_steps s ON s.plan_id=p.id
        WHERE p.id=$1 AND p.company_id=$2 ORDER BY s.step_order LIMIT 1`, [plan_id, req.user.company_id]);
      if (!scope.rowCount || !plan.rowCount) throw new Error('Lead veya plan bulunamadı');
      await client.query("UPDATE lead_active_plans SET status='cancelled',next_run_at=NULL,updated_at=NOW() WHERE lead_id=$1 AND status='active'", [lead_id]);
      return (await client.query(`INSERT INTO lead_active_plans(plan_id,lead_id,current_step,next_run_at,started_by)
        VALUES($1,$2,$3,NOW()+($4*INTERVAL '1 minute'),$5) RETURNING *`, [plan_id, lead_id, plan.rows[0].step_order, plan.rows[0].delay_minutes, req.user.id])).rows[0];
    });
    res.status(201).json(assigned);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

router.patch('/active/:id', async (req, res) => {
  const { action } = req.body;
  try {
    const current = await db.query(`SELECT ap.* FROM lead_active_plans ap JOIN leads l ON l.id=ap.lead_id WHERE ap.id=$1 AND l.company_id=$2`, [req.params.id, req.user.company_id]);
    if (!current.rowCount) return res.status(404).json({ message: 'Aktif plan bulunamadı' });
    if (action === 'pause') await db.query("UPDATE lead_active_plans SET status='paused',pause_reason='Danışman tarafından duraklatıldı',next_run_at=NULL,updated_at=NOW() WHERE id=$1", [req.params.id]);
    else if (action === 'resume') await db.query("UPDATE lead_active_plans SET status='active',pause_reason=NULL,next_run_at=NOW(),updated_at=NOW() WHERE id=$1", [req.params.id]);
    else if (action === 'skip') await db.withTransaction(async client => {
      const row = current.rows[0];
      const step = await client.query('SELECT id FROM follow_up_plan_steps WHERE plan_id=$1 AND step_order=$2', [row.plan_id, row.current_step]);
      if (step.rows[0]) await client.query("INSERT INTO follow_up_step_executions(active_plan_id,step_id,status,output) VALUES($1,$2,'skipped',$3) ON CONFLICT DO NOTHING", [row.id, step.rows[0].id, { reason: 'Danışman tarafından atlandı' }]);
      const next = await client.query('SELECT step_order,delay_minutes FROM follow_up_plan_steps WHERE plan_id=$1 AND step_order>$2 ORDER BY step_order LIMIT 1', [row.plan_id, row.current_step]);
      if (next.rows[0]) await client.query("UPDATE lead_active_plans SET current_step=$1,next_run_at=NOW()+($2*INTERVAL '1 minute'),status='active',updated_at=NOW() WHERE id=$3", [next.rows[0].step_order, next.rows[0].delay_minutes, row.id]);
      else await client.query("UPDATE lead_active_plans SET status='completed',next_run_at=NULL,completed_at=NOW(),updated_at=NOW() WHERE id=$1", [row.id]);
    });
    else return res.status(400).json({ message: 'Geçersiz işlem' });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
