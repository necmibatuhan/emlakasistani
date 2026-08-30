const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');
const morningBriefing = require('../services/morningBriefing');
const { getDataSufficiency } = require('../services/predictiveScoring.service');

router.get('/priorities', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const predictiveSufficiency = await getDataSufficiency(req.user.company_id);
    
    // Fetch user's leads
    const result = await pool.query(
      `SELECT l.*,
        GREATEST(
          COALESCE((SELECT MAX(created_at) FROM lead_notes WHERE lead_id = l.id), l.created_at),
          COALESCE((SELECT MAX(created_at) FROM lead_events WHERE lead_id = l.id), l.created_at),
          l.created_at
        ) AS last_activity_at
       FROM leads l
       WHERE l.assigned_to = $1
         AND l.status NOT IN ('Satış Tamamlandı', 'İptal')
       LIMIT 50`,
      [userId]
    );

    let priorities = result.rows.map(lead => {
      const reasons = [];
      const now = new Date();
      const lastContactDate = lead.last_activity_at ? new Date(lead.last_activity_at) : new Date(lead.created_at);
      const diffTime = Math.max(0, now - lastContactDate);
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
      
      const budget = parsedProps.butce || parsedProps.budget || parsedProps.butce_max || '';
      const numericBudget = typeof budget === 'number' ? budget : Number(String(budget).replace(/[^\d]/g, ''));
      if (numericBudget >= 5000000 || /5M|10M|Yüksek/i.test(String(budget))) {
        reasons.push('Yüksek bütçe');
      }

      if (parsedProps.matching_portfolio_count > 0) {
        reasons.push(`${parsedProps.matching_portfolio_count} eşleşen portföy`);
      }
      
      const scoreOutOf100 = Math.max(0, Math.min(100, Number(lead.score || 0) * 10));
      const stalenessScore = Math.min(100, diffDays * 5);
      const reminderAt = lead.reminder_date ? new Date(lead.reminder_date) : null;
      const reminderDue = reminderAt && reminderAt <= now;
      const priorityScore = Math.round(
        scoreOutOf100 * 0.55 + stalenessScore * 0.3 + (reminderDue ? 15 : 0)
      );
      if (reminderDue) reasons.unshift('Takip zamanı geldi');

      const predictedScore = lead.predicted_conversion_score == null ? null : Number(lead.predicted_conversion_score);
      let scoreConflict = null;
      if (predictedScore !== null && priorityScore >= 70 && predictedScore < 40) scoreConflict = 'high_priority_low_conversion';
      if (predictedScore !== null && priorityScore < 50 && predictedScore >= 70) scoreConflict = 'low_priority_high_conversion';

      return {
        ...lead,
        priority_score: Math.min(100, priorityScore),
        score_reasons: reasons,
        last_contact_days: diffDays,
        predicted_conversion_score: predictedScore,
        predictive_score_status: predictedScore !== null ? 'ready' : (predictiveSufficiency.sufficient ? 'not_calculated' : 'insufficient_data'),
        predictive_data_sufficiency: predictiveSufficiency,
        score_conflict: scoreConflict
      };
    });

    // Sort: highest score first, then by oldest contact (diffDays descending)
    priorities.sort((a, b) => {
      if (b.priority_score !== a.priority_score) return b.priority_score - a.priority_score;
      return b.last_contact_days - a.last_contact_days;
    });

    res.json(priorities.slice(0, 5));

  } catch (error) {
    console.error('Priority error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/briefing', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const briefing = await morningBriefing.getUserBriefing(userId);
    res.json(briefing);
  } catch (error) {
    console.error('Briefing error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
