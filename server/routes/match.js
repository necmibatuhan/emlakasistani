const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const semanticSearch = require('../services/semanticSearch');

const router = express.Router();

/**
 * POST /api/match
 * Müşterinin isteğini (raw query) alır, niyet analizi yapar ve portföyle eşleştirir.
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Lütfen arama için bir metin girin.' });
    }

    const { company_id } = req.user;
    
    // 1. Semantic Search Servisini Çağır
    const matchResult = await semanticSearch.findMatchingProperties(company_id, query, 5);
    
    res.json({
      intent: matchResult.intent,
      matches: matchResult.matches
    });
  } catch (error) {
    console.error('Match Route Error:', error);
    res.status(500).json({ message: 'Eşleştirme sırasında bir hata oluştu.' });
  }
});

module.exports = router;
