const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.get('/priorities', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch user's leads
    const result = await pool.query(
      `SELECT * FROM leads WHERE assigned_to = $1 ORDER BY score DESC LIMIT 10`, 
      [userId]
    );

    let priorities = result.rows.map(lead => {
      const reasons = [];
      const now = new Date();
      // Using created_at since last_contact_date doesn't seem to exist by default
      const lastContactDate = lead.created_at ? new Date(lead.created_at) : new Date();
      const diffTime = Math.abs(now - lastContactDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 14) {
        reasons.push(`${diffDays} gün sessizlik`);
      } else if (diffDays === 0) {
        reasons.push(`Bugün temas edildi`);
      } else {
        reasons.push(`${diffDays} gün sessizlik`);
      }

      let parsedProps = {};
      if (lead.properties) {
        try { parsedProps = typeof lead.properties === 'string' ? JSON.parse(lead.properties) : lead.properties; }
        catch (e) {}
      }
      
      const budget = parsedProps.budget || '';
      if (budget.includes('5M') || budget.includes('10M') || budget.includes('Yüksek')) {
        reasons.push('Yüksek bütçe');
      }

      if (parsedProps.matching_portfolio_count > 0) {
        reasons.push(`${parsedProps.matching_portfolio_count} eşleşen portföy`);
      }
      
      return {
        ...lead,
        score_reasons: reasons,
        last_contact_days: diffDays
      };
    });

    // Sort: highest score first, then by oldest contact (diffDays descending)
    priorities.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.last_contact_days - a.last_contact_days;
    });

    res.json(priorities.slice(0, 5));

  } catch (error) {
    console.error('Priority error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
