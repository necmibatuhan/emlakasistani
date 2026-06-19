const express = require('express');
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const semanticSearch = require('../services/semanticSearch');

const router = express.Router();

// GET all properties
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role, company_id, office_id } = req.user;
    
    let query = 'SELECT * FROM properties WHERE ';
    let values = [];

    if (role === 'super_admin' || role === 'company_admin') {
      query += 'company_id = $1';
      values.push(company_id);
    } else { // office_manager, agent, viewer
      query += 'office_id = $1';
      values.push(office_id);
    }

    query += ' ORDER BY created_at DESC';

    const properties = await db.query(query, values);
    res.json(properties.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// ADD property
router.post('/', authMiddleware, requireRole(['company_admin', 'office_manager', 'agent']), async (req, res) => {
  try {
    const { title, type, category, city, district, address, price, sqm, rooms, floor, features } = req.body;
    
    const newProperty = await db.query(
      `INSERT INTO properties 
      (company_id, office_id, listed_by, title, type, category, city, district, address, price, sqm, rooms, floor, features) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [req.user.company_id, req.user.office_id, req.user.id, title, type, category, city, district, address, price, sqm, rooms, floor, JSON.stringify(features || {})]
    );

    // Publish NEW_PROPERTY event to Queue to match existing leads
    const queue = require('../services/queue');
    queue.add('MATCH_LEADS_FOR_PROPERTY', { propertyId: newProperty.rows[0].id });

    // Generate vector embedding in background
    semanticSearch.embedProperty(newProperty.rows[0].id).catch(console.error);

    try {
      const { triggerListingAnalyzed } = require('../services/onboardingService');
      await triggerListingAnalyzed(req.user.id);
    } catch (e) { console.error(e); }

    res.status(201).json(newProperty.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// UPDATE property status
router.put('/:id', authMiddleware, requireRole(['company_admin', 'office_manager', 'agent']), async (req, res) => {
  try {
    const { status } = req.body;
    const property = await db.query(
      'UPDATE properties SET status = $1 WHERE id = $2 AND company_id = $3 RETURNING *',
      [status, req.params.id, req.user.company_id]
    );
    if (property.rows.length === 0) return res.status(404).json({ message: 'Mülk bulunamadı' });
    res.json(property.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
