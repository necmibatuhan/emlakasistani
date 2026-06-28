const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role, company_id, office_id, id: user_id } = req.user;
    
    let scopeClause = '';
    let values = [];

    if (role === 'super_admin' || role === 'company_admin') {
      scopeClause = 'company_id = $1';
      values.push(company_id);
    } else if (role === 'office_manager') {
      scopeClause = 'office_id = $1';
      values.push(office_id);
    } else {
      scopeClause = 'assigned_to = $1';
      values.push(user_id);
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalLeadsRes = await db.query(`SELECT COUNT(*) FROM leads WHERE ${scopeClause} AND created_at >= $2`, [...values, startOfMonth]);
    const totalLeads = parseInt(totalLeadsRes.rows[0].count);

    const labelDistRes = await db.query(`SELECT label, COUNT(*) FROM leads WHERE ${scopeClause} GROUP BY label`, values);
    const labelDist = labelDistRes.rows.map(row => ({ name: row.label, value: parseInt(row.count) }));

    const statusDistRes = await db.query(`SELECT status, COUNT(*) FROM leads WHERE ${scopeClause} GROUP BY status`, values);
    const statusDist = statusDistRes.rows.map(row => ({ name: row.status, value: parseInt(row.count) }));

    const salesRes = await db.query(`SELECT COUNT(*) FROM leads WHERE ${scopeClause} AND status = 'Satış Tamamlandı'`, values);
    const totalEverRes = await db.query(`SELECT COUNT(*) FROM leads WHERE ${scopeClause}`, values);
    
    const sales = parseInt(salesRes.rows[0].count);
    const totalEver = parseInt(totalEverRes.rows[0].count);
    const conversionRate = totalEver > 0 ? ((sales / totalEver) * 100).toFixed(1) : 0;

    const scoreRes = await db.query(`SELECT AVG(score) as avg_score FROM leads WHERE ${scopeClause}`, values);
    const averageScore = scoreRes.rows[0].avg_score ? parseFloat(scoreRes.rows[0].avg_score).toFixed(1) : '0.0';

    const trendRes = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM leads 
      WHERE ${scopeClause} AND created_at >= $2
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [...values, thirtyDaysAgo]);

    const trend = trendRes.rows.map(row => ({
      date: new Date(row.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      count: parseInt(row.count)
    }));

    res.json({
      totalLeads,
      labelDist,
      statusDist,
      conversionRate,
      averageScore,
      trend
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
