const cron = require('node-cron');
const pool = require('../db');
const { sendEmail, getInactivity3DaysTemplate, getInactivity7DaysTemplate } = require('./emailService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Run every day at 09:00 Istanbul time
cron.schedule('0 9 * * *', async () => {
  console.log('[ChurnPrevention] Starting daily check...');
  await checkInactiveUsers();
}, { timezone: 'Europe/Istanbul' });

const generateUnsubscribeUrl = (userId) => {
  const token = jwt.sign({ id: userId, action: 'unsubscribe' }, JWT_SECRET);
  return `${process.env.APP_URL || 'http://localhost:5173'}/api/notifications/unsubscribe?token=${token}`;
};

const checkInactiveUsers = async () => {
  try {
    // We check last_sign_in_at from users or the max(created_at) from analytics_events
    // For this example, we assume analytics_events contains login or onboarding events, or we check last_sign_in_at if available
    
    // Find users with no events in the last X days but have events before
    // And not unsubscribed
    const { rows: users } = await pool.query(`
      WITH user_last_activity AS (
        SELECT user_id, MAX(created_at) as last_active
        FROM analytics_events
        GROUP BY user_id
      )
      SELECT u.id, u.email, u.name, u.unsubscribed_at, la.last_active,
             EXTRACT(DAY FROM NOW() - la.last_active) as days_inactive
      FROM users u
      JOIN user_last_activity la ON la.user_id = u.id
      WHERE u.unsubscribed_at IS NULL
    `);

    for (const user of users) {
      const days = parseInt(user.days_inactive);
      
      // Prevent spam: check if we already sent this type of notification recently
      if (days === 3) {
        const hasSent = await checkNotificationSent(user.id, 'email_3days');
        if (!hasSent) {
          await send3DaysEmail(user);
        }
      } else if (days === 7) {
        const hasSent = await checkNotificationSent(user.id, 'email_7days');
        if (!hasSent) {
          await send7DaysEmail(user);
        }
      } else if (days === 14) {
        const hasSent = await checkNotificationSent(user.id, 'email_14days');
        if (!hasSent) {
          console.log(`[ChurnPrevention] 14 days inactive: ${user.email} - Account freezing warning placeholder.`);
          await logNotification(user.id, 'email', 'email_14days');
        }
      }
    }
    
    console.log('[ChurnPrevention] Daily check completed.');
  } catch (err) {
    console.error('[ChurnPrevention] Error:', err);
  }
};

const checkNotificationSent = async (userId, templateName) => {
  const { rows } = await pool.query(`
    SELECT id FROM notification_logs 
    WHERE user_id = $1 AND template_name = $2 
    AND sent_at > NOW() - INTERVAL '30 days'
  `, [userId, templateName]);
  return rows.length > 0;
};

const logNotification = async (userId, type, templateName) => {
  await pool.query(
    'INSERT INTO notification_logs (user_id, type, template_name) VALUES ($1, $2, $3)',
    [userId, type, templateName]
  );
};

const send3DaysEmail = async (user) => {
  try {
    // Get top 3 leads
    const { rows: leads } = await pool.query(`
      SELECT id, name, score, EXTRACT(DAY FROM NOW() - updated_at) as days_since
      FROM leads
      WHERE user_id = $1
      ORDER BY score DESC NULLS LAST
      LIMIT 3
    `, [user.id]);
    
    const countRes = await pool.query('SELECT COUNT(*) FROM leads WHERE user_id = $1 AND is_reminder = true', [user.id]);
    const numClients = parseInt(countRes.rows[0].count) || leads.length;
    
    if (leads.length === 0) return; // Nothing to remind about
    
    const unsubsUrl = generateUnsubscribeUrl(user.id);
    const html = getInactivity3DaysTemplate(leads, numClients, unsubsUrl);
    
    const subject = `3 gün görüşmedik — ${numClients} müşteriniz sizi bekliyor`;
    const sent = await sendEmail(user.email, subject, html);
    if (sent) {
      await logNotification(user.id, 'email', 'email_3days');
      console.log(`[ChurnPrevention] Sent 3-days email to ${user.email}`);
    }
  } catch (err) {
    console.error(`[ChurnPrevention] Failed to send 3-days to ${user.email}:`, err);
  }
};

const send7DaysEmail = async (user) => {
  try {
    const unsubsUrl = generateUnsubscribeUrl(user.id);
    const html = getInactivity7DaysTemplate(unsubsUrl);
    
    const subject = `Kapora'da bu hafta neler oldu?`;
    const sent = await sendEmail(user.email, subject, html);
    if (sent) {
      await logNotification(user.id, 'email', 'email_7days');
      console.log(`[ChurnPrevention] Sent 7-days email to ${user.email}`);
    }
  } catch (err) {
    console.error(`[ChurnPrevention] Failed to send 7-days to ${user.email}:`, err);
  }
};

module.exports = {
  checkInactiveUsers
};
