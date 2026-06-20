const express = require('express');
const multer = require('multer');
const db = require('../db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const semanticSearch = require('../services/semanticSearch');
const { getGenAI, hasValidAiConfig } = require('../utils/ai');

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

// Analyze listing image
router.post('/analyze-listing', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const imageFile = req.file;
    if (!imageFile) return res.status(400).json({ message: 'Görsel dosyası eksik.' });
    if (!hasValidAiConfig()) return res.status(500).json({ message: 'Yapay zeka yapılandırması eksik.' });

    const imageBase64 = imageFile.buffer.toString('base64');
    let mimeType = imageFile.mimetype;
    
    // Fallback if mimeType is somehow octet-stream
    if (mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
        mimeType = 'image/jpeg';
    }

    const promptText = `Sen usta bir emlak danışmanısın. Ekip arkadaşın sana bir emlak sitesindeki ilanın ekran görüntüsünü (screenshot) yolladı.
Bu ilanı incele ve bana sadece aşağıdaki formatta geçerli bir JSON dön:
{
  "score": 0-100 arası bir tamsayı (İlanın satılma ihtimali ve çekiciliği),
  "weaknesses": ["Zayıf yön 1", "Zayıf yön 2", "Örn: Fotoğraf karanlık", "Örn: Açıklama yetersiz"],
  "strengths": ["Güçlü yön 1", "Güçlü yön 2"],
  "improved_description": "Bu ilanın daha hızlı satılması için kullanılabilecek SEO uyumlu, dikkat çekici, harika bir taslak ilan başlığı ve açıklaması."
}`;

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json", temperature: 0.3 } });
    
    const aiResult = await model.generateContent([
      { inlineData: { mimeType, data: imageBase64 } },
      { text: promptText }
    ]);

    let respText = aiResult.response.text().trim();
    if (respText.startsWith('\`\`\`json')) respText = respText.replace('\`\`\`json', '').replace('\`\`\`', '').trim();
    
    const parsedResult = JSON.parse(respText);

    // Update onboarding progress
    try {
      const { triggerListingAnalyzed } = require('../services/onboardingService');
      await triggerListingAnalyzed(req.user.id);
    } catch (e) { console.error('Onboarding update err:', e); }

    res.json(parsedResult);
  } catch (err) {
    console.error('Analyze Listing API Error:', err);
    res.status(500).json({ message: 'İlan analizi başarısız oldu' });
  }
});

module.exports = router;
