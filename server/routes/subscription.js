const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { Parser } = require('json2csv');

// In-memory store for offer expiries (in production, use Redis)
// Format: { [userId]: expiresAtTimestamp }
const offerExpirations = {};

// POST /api/subscription/cancel-intent
router.post('/cancel-intent', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Log the event
    await pool.query(
      `INSERT INTO cancel_flow_events (user_id, step, action) VALUES ($1, $2, $3)`,
      [userId, 'STEP_1', 'INITIATE_CANCEL']
    );

    // Get user stats for loss aversion screen
    const statsQuery = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM leads WHERE user_id = $1) as customer_count,
        (SELECT COUNT(*) FROM contacts WHERE user_id = $1) as contact_count,
        EXTRACT(DAY FROM (NOW() - created_at)) as days_active
      FROM users WHERE id = $1
    `, [userId]);

    const stats = statsQuery.rows[0];

    // Mock portfolio matching since we don't have a properties table joined directly
    const portfolio_count = Math.floor(Math.random() * 10) + 2; 

    res.json({
      customer_count: parseInt(stats.customer_count) || 0,
      contact_count: parseInt(stats.contact_count) || 0,
      portfolio_count,
      days_active: parseInt(stats.days_active) || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// POST /api/subscription/cancel-reason
router.post('/cancel-reason', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reason, feedback } = req.body;

    // Save reason to DB
    await pool.query(
      `UPDATE users SET cancel_reason = $1, cancel_feedback = $2 WHERE id = $3`,
      [reason, feedback, userId]
    );

    await pool.query(
      `INSERT INTO cancel_flow_events (user_id, step, action, metadata) VALUES ($1, $2, $3, $4)`,
      [userId, 'STEP_2', 'SUBMIT_REASON', JSON.stringify({ reason })]
    );

    // Generate offer based on reason
    let offer = null;
    if (reason === 'Fiyat çok yüksek') {
      offer = {
        type: 'discount',
        discount_percent: 50,
        duration_months: 2,
        old_price: 899,
        new_price: 449
      };
      
      // Set 10 minute expiration
      offerExpirations[userId] = Date.now() + 10 * 60 * 1000;
      offer.expires_at = offerExpirations[userId];
    } else if (reason === 'İhtiyacım olan özellik yok') {
      offer = { type: 'feature_promise', extra_months_free: 3 };
    } else if (reason === 'Kullanımı zor buldum') {
      offer = { type: 'free_coaching', duration_hours: 1 };
    } else if (reason === 'Başka bir araç kullanmaya başladım') {
      offer = { type: 'discount', discount_percent: 30 };
    }

    res.json({ offer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// POST /api/subscription/accept-offer
router.post('/accept-offer', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { offer_type } = req.body;

    // Validate expiration for discounts
    if (offer_type === 'discount') {
      const expiresAt = offerExpirations[userId];
      if (!expiresAt || Date.now() > expiresAt) {
        return res.status(422).json({ message: 'Teklif süresi doldu' });
      }
    }

    await pool.query(
      `UPDATE users SET discount_offered = true, discount_accepted = true WHERE id = $1`,
      [userId]
    );

    await pool.query(
      `INSERT INTO cancel_flow_events (user_id, step, action, metadata) VALUES ($1, $2, $3, $4)`,
      [userId, 'STEP_3', 'ACCEPT_OFFER', JSON.stringify({ offer_type })]
    );

    // Clear expiry
    delete offerExpirations[userId];

    res.json({ success: true, message: 'Teklif başarıyla uygulandı.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// POST /api/subscription/confirm-cancel
router.post('/confirm-cancel', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    await pool.query(
      `UPDATE users SET 
        subscription_status = 'cancelled', 
        cancelled_at = NOW(), 
        grace_period_ends = NOW() + INTERVAL '30 days' 
      WHERE id = $1`,
      [userId]
    );

    await pool.query(
      `INSERT INTO cancel_flow_events (user_id, step, action) VALUES ($1, $2, $3)`,
      [userId, 'STEP_5', 'CONFIRM_CANCEL']
    );

    res.json({ success: true, message: 'Aboneliğiniz iptal edildi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// GET /api/subscription/export-data
router.get('/export-data', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const leadsQuery = await pool.query(`SELECT name, phone, score, label, status, created_at FROM leads WHERE user_id = $1`, [userId]);
    const leads = leadsQuery.rows;

    if (leads.length === 0) {
      return res.status(404).json({ message: 'Dışa aktarılacak veri bulunamadı.' });
    }

    const fields = ['name', 'phone', 'score', 'label', 'status', 'created_at'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(leads);

    res.header('Content-Type', 'text/csv');
    res.attachment('kapora_leads_export.csv');
    return res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Dışa aktarma hatası' });
  }
});

module.exports = router;
