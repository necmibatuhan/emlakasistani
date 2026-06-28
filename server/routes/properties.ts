const express = require('express');
const multer = require('multer');
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const semanticSearch = require('../services/semanticSearch');
const { getGenAI, hasValidAiConfig } = require('../utils/ai');
const jwt = require('jsonwebtoken');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

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

const { supabase, hasValidSupabaseConfig } = require('../services/supabaseService');
const { v4: uuidv4 } = require('uuid');

// Generate Presigned Upload URL for Analyzer
router.post('/generate-upload-url', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let userId = 'anonymous';
    if (token && token !== 'null' && token !== 'undefined') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {}
    }

    if (!hasValidSupabaseConfig()) {
      // Mock mode: return a fake upload URL
      return res.json({
        uploadUrl: 'mock_upload_url',
        path: `properties/${userId}/mock-image-${uuidv4()}.jpg`
      });
    }

    const fileName = `${uuidv4()}.jpg`;
    const filePath = `analyzer/${userId}/${fileName}`;

    const { data, error } = await supabase
      .storage
      .from('properties')
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error("Supabase Storage error:", error);
      return res.status(500).json({ message: "Upload URL oluşturulamadı." });
    }

    res.json({
      uploadUrl: data.signedUrl,
      path: filePath
    });
  } catch (err) {
    console.error('Generate Upload URL Error:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Analyze listing image
router.post('/analyze-listing', async (req, res) => {
  try {
    const { image, imagePath, mimeType = 'image/jpeg' } = req.body;
    if (!image && !imagePath) return res.status(400).json({ message: 'Görsel dosyası eksik.' });
    if (!hasValidAiConfig()) return res.status(500).json({ message: 'Yapay zeka yapılandırması eksik.' });

    let userId = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token && token !== 'null' && token !== 'undefined') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {}
    }

    let imageUrlForAI = null;
    
    // If client sent imagePath (Direct Upload), get public URL
    if (imagePath) {
      if (hasValidSupabaseConfig()) {
        const { data } = supabase.storage.from('properties').getPublicUrl(imagePath);
        imageUrlForAI = data.publicUrl;
      } else {
        // Mock mode fallback
        imageUrlForAI = 'https://mock.com/image.jpg';
      }
    } else {
      // Fallback to Base64 (legacy)
      imageUrlForAI = `data:${mimeType};base64,${image}`;
    }

    const { analyzeListingImage } = require('../utils/ai');
    
    // Default description if none provided by the frontend right now
    const description = req.body.description || "Açıklama belirtilmemiş.";
    
    // Call OpenAI Vision integration
    const parsedResult = await analyzeListingImage(imageUrlForAI, description);

    // Update onboarding progress if logged in
    if (userId) {
      try {
        const { triggerListingAnalyzed } = require('../services/onboardingService');
        await triggerListingAnalyzed(userId);
      } catch (e) { console.error('Onboarding update err:', e); }
    }

    res.json(parsedResult);
  } catch (err) {
    console.error('Analyze Listing API Error:', err);
    res.status(500).json({ message: 'İlan analizi başarısız oldu' });
  }
});

module.exports = router;
