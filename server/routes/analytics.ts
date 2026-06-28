const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Simple in-memory rate limiting for events
const eventRateLimits = new Map();

router.post('/event', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { event_name, properties, session_id } = req.body;

    // Rate limiting: max 100 events / minute / user
    const now = Date.now();
    const windowStart = now - 60000;
    
    if (!eventRateLimits.has(userId)) {
      eventRateLimits.set(userId, []);
    }
    
    let userEvents = eventRateLimits.get(userId);
    userEvents = userEvents.filter(t => t > windowStart);
    
    if (userEvents.length >= 100) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    userEvents.push(now);
    eventRateLimits.set(userId, userEvents);

    await pool.query(
      'INSERT INTO analytics_events (user_id, event_name, properties, session_id) VALUES ($1, $2, $3, $4)',
      [userId, event_name, properties || {}, session_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error logging analytics event:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/funnel', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'company_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const totalSignupsRes = await pool.query('SELECT COUNT(DISTINCT user_id) FROM analytics_events');
    const totalSignups = parseInt(totalSignupsRes.rows[0].count);

    const getCount = async (eventName) => {
      const res = await pool.query('SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event_name = $1', [eventName]);
      return parseInt(res.rows[0].count);
    };

    const completed_onboarding = await getCount('onboarding_completed');
    const added_first_customer = await getCount('customer_added') + await getCount('customer_quick_add');
    const viewed_score = await getCount('score_viewed');
    const clicked_whatsapp = await getCount('whatsapp_clicked');
    const day1_return = await getCount('day_1_return');
    const day7_return = await getCount('day_7_return');

    res.json({
      total_signups: totalSignups,
      completed_onboarding,
      added_first_customer,
      viewed_score,
      clicked_whatsapp,
      day1_return,
      day7_return,
      conversion_rates: {
        onboarding_conversion: totalSignups ? (completed_onboarding / totalSignups * 100).toFixed(1) + '%' : '0%',
        activation_conversion: totalSignups ? (added_first_customer / totalSignups * 100).toFixed(1) + '%' : '0%',
        whatsapp_usage: totalSignups ? (clicked_whatsapp / totalSignups * 100).toFixed(1) + '%' : '0%'
      }
    });

  } catch (error) {
    console.error('Error generating funnel report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
