const express = require('express');
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, requireRole(['super_admin', 'company_admin']), async (req, res) => {
  try {
    const offices = await db.query(`
      SELECT o.id, o.name, o.city, o.region,
             (SELECT COUNT(*) FROM users u WHERE u.office_id = o.id AND u.role IN ('agent', 'office_manager')) as agent_count,
             (SELECT COUNT(*) FROM leads l WHERE l.office_id = o.id) as lead_count,
             (SELECT COUNT(*) FROM leads l WHERE l.office_id = o.id AND l.label = 'Sıcak') as hot_leads,
             (SELECT COUNT(*) FROM leads l WHERE l.office_id = o.id AND l.label = 'Ilık') as warm_leads,
             (SELECT COUNT(*) FROM leads l WHERE l.office_id = o.id AND l.status = 'Satış Tamamlandı') as sales_count
      FROM offices o
      WHERE o.company_id = $1
      ORDER BY o.created_at DESC
    `, [req.user.company_id]);

    const enriched = offices.rows.map(o => {
      const total = parseInt(o.lead_count);
      const sales = parseInt(o.sales_count);
      return {
        ...o,
        conversionRate: total > 0 ? ((sales / total) * 100).toFixed(1) : 0
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.post('/', authMiddleware, requireRole(['super_admin', 'company_admin']), async (req, res) => {
  try {
    const { name, city, region } = req.body;
    const newOffice = await db.query(
      'INSERT INTO offices (company_id, name, city, region) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.company_id, name, city, region]
    );
    res.status(201).json(newOffice.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.get('/:id', authMiddleware, requireRole(['super_admin', 'company_admin', 'office_manager']), async (req, res) => {
  try {
    // If office_manager, they can only see their own office
    if (req.user.role === 'office_manager' && req.user.office_id !== req.params.id) {
      return res.status(403).json({ message: 'Bu ofisi görüntüleme yetkiniz yok' });
    }

    const office = await db.query('SELECT * FROM offices WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id]);
    if (office.rows.length === 0) return res.status(404).json({ message: 'Ofis bulunamadı' });

    const agents = await db.query(`
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             (SELECT COUNT(*) FROM leads l WHERE l.assigned_to = u.id) as lead_count,
             (SELECT COUNT(*) FROM leads l WHERE l.assigned_to = u.id AND l.label = 'Sıcak') as hot_leads,
             (SELECT COUNT(*) FROM leads l WHERE l.assigned_to = u.id AND l.status = 'Satış Tamamlandı') as sales_count
      FROM users u
      WHERE u.office_id = $1 AND u.role IN ('agent', 'office_manager')
      ORDER BY u.created_at DESC
    `, [req.params.id]);

    const enrichedAgents = agents.rows.map(a => {
      const total = parseInt(a.lead_count);
      const sales = parseInt(a.sales_count);
      return {
        ...a,
        conversionRate: total > 0 ? ((sales / total) * 100).toFixed(1) : 0
      };
    });

    res.json({
      ...office.rows[0],
      agents: enrichedAgents
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
