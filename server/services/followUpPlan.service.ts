const cron = require('node-cron');
const db = require('../db');
const { createWhatsAppDraft } = require('./draftMessage.service');
const { adjustLeadScoreForOverdue } = require('./scoreService');

async function runAction(client, lead, step) {
  const params = step.action_params || {};
  if (step.action_type === 'whatsapp_draft') {
    const draft = await createWhatsAppDraft(lead, params);
    await client.query('UPDATE leads SET whatsapp_draft=$1, updated_at=NOW() WHERE id=$2', [draft, lead.id]);
    await client.query("INSERT INTO lead_events(lead_id,event_type,description) VALUES($1,'follow_up_whatsapp_draft_ready',$2)", [lead.id, 'WhatsApp taslağı hazırlandı; danışman onayı bekleniyor.']);
    return { draft };
  }
  if (step.action_type === 'reminder') {
    const message = params.message || 'Otomatik takip hatırlatıcısı';
    await client.query('UPDATE leads SET reminder_date=NOW(), updated_at=NOW() WHERE id=$1', [lead.id]);
    await client.query("INSERT INTO lead_events(lead_id,event_type,description) VALUES($1,'follow_up_reminder',$2)", [lead.id, message]);
    return { message };
  }
  const delta = Number(params.delta ?? -1);
  const adjusted = await adjustLeadScoreForOverdue(lead, delta, client);
  await client.query("INSERT INTO lead_events(lead_id,event_type,description) VALUES($1,'follow_up_score_adjust',$2)", [lead.id, `Takip gecikmesi nedeniyle skor ${delta >= 0 ? '+' : ''}${delta} değiştirildi.`]);
  return adjusted;
}

async function processOne(activeId) {
  return db.withTransaction(async (client) => {
    const found = await client.query(`SELECT ap.*, l.*, ap.id AS active_plan_id, s.id AS step_id, s.step_order, s.delay_minutes, s.action_type, s.action_params
      FROM lead_active_plans ap JOIN leads l ON l.id=ap.lead_id
      JOIN follow_up_plan_steps s ON s.plan_id=ap.plan_id AND s.step_order=ap.current_step
      WHERE ap.id=$1 AND ap.status='active' AND ap.next_run_at<=NOW() FOR UPDATE OF ap SKIP LOCKED`, [activeId]);
    if (!found.rows[0]) return false;
    const row = found.rows[0];
    const claim = await client.query(`INSERT INTO follow_up_step_executions(active_plan_id,step_id) VALUES($1,$2)
      ON CONFLICT(active_plan_id,step_id) DO NOTHING RETURNING id`, [activeId, row.step_id]);
    if (!claim.rows[0]) return false;
    try {
      const output = await runAction(client, row, row);
      await client.query("UPDATE follow_up_step_executions SET status='completed',output=$1 WHERE id=$2", [output, claim.rows[0].id]);
      const next = await client.query('SELECT * FROM follow_up_plan_steps WHERE plan_id=$1 AND step_order>$2 ORDER BY step_order LIMIT 1', [row.plan_id, row.current_step]);
      if (next.rows[0]) {
        await client.query("UPDATE lead_active_plans SET current_step=$1,next_run_at=NOW()+($2*INTERVAL '1 minute'),updated_at=NOW() WHERE id=$3", [next.rows[0].step_order, next.rows[0].delay_minutes, activeId]);
      } else {
        await client.query("UPDATE lead_active_plans SET status='completed',next_run_at=NULL,completed_at=NOW(),updated_at=NOW() WHERE id=$1", [activeId]);
      }
      return true;
    } catch (error) {
      await client.query("UPDATE follow_up_step_executions SET status='failed',output=$1 WHERE id=$2", [{ error: error.message }, claim.rows[0].id]);
      await client.query("UPDATE lead_active_plans SET next_run_at=NOW()+INTERVAL '5 minutes',updated_at=NOW() WHERE id=$1", [activeId]);
      throw error;
    }
  });
}

async function processDueFollowUps() {
  const due = await db.query("SELECT id FROM lead_active_plans WHERE status='active' AND next_run_at<=NOW() ORDER BY next_run_at LIMIT 25");
  for (const item of due.rows) {
    try { await processOne(item.id); } catch (error) { console.error('Follow-up step failed:', error.message); }
  }
  return due.rowCount;
}

async function pauseForManualContact(leadId) {
  await db.query("UPDATE lead_active_plans SET status='paused',pause_reason='Danışman manuel temas/not ekledi',next_run_at=NULL,updated_at=NOW() WHERE lead_id=$1 AND status='active'", [leadId]);
}

cron.schedule('* * * * *', processDueFollowUps);
setTimeout(() => processDueFollowUps().catch(console.error), 5000);

module.exports = { processDueFollowUps, pauseForManualContact };
