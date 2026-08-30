const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const predictiveConfig = require('../config/predictiveScoring.config');

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

router.get('/predictive-scoring', authMiddleware, requireRole(['office_manager', 'company_admin', 'super_admin']), async (req, res) => {
  try {
    const params = [req.user.company_id];
    let scope = 'l.company_id=$1';
    if (req.user.role === 'office_manager') { params.push(req.user.office_id); scope += ' AND l.office_id=$2'; }
    const modelParam = params.length + 1;
    params.push(predictiveConfig.modelVersion);
    const report = await pool.query(`WITH latest_predictions AS (
      SELECT DISTINCT ON (ph.lead_id) ph.lead_id,ph.predicted_score,ph.model_version,ph.predicted_at
      FROM lead_prediction_history ph JOIN leads l ON l.id=ph.lead_id
      WHERE ${scope} AND ph.model_version=$${modelParam} AND l.status IN ('Satış Tamamlandı','İptal') AND ph.predicted_at<=l.updated_at
      ORDER BY ph.lead_id,ph.predicted_at DESC
    ), evaluated AS (
      SELECT lp.*,CASE WHEN l.status='Satış Tamamlandı' THEN 1.0 ELSE 0.0 END AS outcome
      FROM latest_predictions lp JOIN leads l ON l.id=lp.lead_id
    ) SELECT COUNT(*)::INTEGER AS sample_size,
      AVG(ABS(predicted_score/100.0-outcome))::NUMERIC(8,4) AS mean_absolute_error,
      AVG(POWER(predicted_score/100.0-outcome,2))::NUMERIC(8,4) AS brier_score,
      AVG(CASE WHEN (predicted_score>=50)=(outcome=1) THEN 1.0 ELSE 0.0 END)::NUMERIC(8,4) AS threshold_accuracy
      FROM evaluated`, params);
    const sampleSize = report.rows[0].sample_size;
    if (sampleSize < predictiveConfig.minimumOutcomes) {
      return res.json({ status: 'insufficient_data', sample_size: sampleSize, required_sample_size: predictiveConfig.minimumOutcomes,
        message: `Model doğruluğunu ölçmek için en az ${predictiveConfig.minimumOutcomes} sonuçlanmış ve önceden tahmin edilmiş lead gerekir.` });
    }
    const calibration = await pool.query(`WITH latest_predictions AS (
      SELECT DISTINCT ON (ph.lead_id) ph.lead_id,ph.predicted_score
      FROM lead_prediction_history ph JOIN leads l ON l.id=ph.lead_id
      WHERE ${scope} AND ph.model_version=$${modelParam} AND l.status IN ('Satış Tamamlandı','İptal') AND ph.predicted_at<=l.updated_at
      ORDER BY ph.lead_id,ph.predicted_at DESC
    ) SELECT LEAST(90,FLOOR(predicted_score/10.0)*10)::INTEGER AS score_band,
      COUNT(*)::INTEGER AS sample_size,AVG(predicted_score)::NUMERIC(6,2) AS average_prediction,
      AVG(CASE WHEN l.status='Satış Tamamlandı' THEN 100.0 ELSE 0.0 END)::NUMERIC(6,2) AS actual_conversion_rate
      FROM latest_predictions lp JOIN leads l ON l.id=lp.lead_id GROUP BY 1 ORDER BY 1`, params);
    res.json({ status: 'ready', model_version: predictiveConfig.modelVersion, ...report.rows[0], calibration: calibration.rows });
  } catch (error) {
    console.error('Predictive scoring report error:', error);
    res.status(500).json({ message: 'Tahminsel skor raporu oluşturulamadı.' });
  }
});

module.exports = router;
