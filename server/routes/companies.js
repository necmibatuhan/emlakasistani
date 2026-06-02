const express = require('express');
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', authMiddleware, requireRole(['super_admin', 'company_admin']), async (req, res) => {
  try {
    const { company_id } = req.user;

    const officesRes = await db.query('SELECT COUNT(*) FROM offices WHERE company_id = $1', [company_id]);
    const totalOffices = parseInt(officesRes.rows[0].count);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const monthlyLeadsRes = await db.query(
      'SELECT COUNT(*) FROM leads WHERE company_id = $1 AND created_at >= $2',
      [company_id, startOfMonth]
    );
    const monthlyLeads = parseInt(monthlyLeadsRes.rows[0].count);

    const salesRes = await db.query("SELECT COUNT(*) FROM leads WHERE company_id = $1 AND status = 'Satış Tamamlandı'", [company_id]);
    const totalEverRes = await db.query("SELECT COUNT(*) FROM leads WHERE company_id = $1", [company_id]);
    
    const sales = parseInt(salesRes.rows[0].count);
    const totalEver = parseInt(totalEverRes.rows[0].count);
    const conversionRate = totalEver > 0 ? ((sales / totalEver) * 100).toFixed(1) : 0;

    // Active office
    const activeOfficeRes = await db.query(`
      SELECT o.name, COUNT(l.id) as lead_count
      FROM offices o
      LEFT JOIN leads l ON l.office_id = o.id
      WHERE o.company_id = $1
      GROUP BY o.id
      ORDER BY lead_count DESC
      LIMIT 1
    `, [company_id]);
    
    const activeOffice = activeOfficeRes.rows.length > 0 ? activeOfficeRes.rows[0].name : '-';

    res.json({
      totalOffices,
      monthlyLeads,
      conversionRate,
      activeOffice
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
