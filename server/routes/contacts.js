const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.post('/log', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { customer_id, template_id } = req.body;
    
    // Log
    await pool.query(
      'INSERT INTO contact_logs (lead_id, user_id, template_id) VALUES ($1, $2, $3)',
      [customer_id, userId, template_id || null]
    );

    // Update last_contact_date on leads table
    await pool.query(
      'UPDATE leads SET last_contact_date = NOW(), updated_at = NOW() WHERE id = $1 AND assigned_to = $2',
      [customer_id, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error logging contact:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
