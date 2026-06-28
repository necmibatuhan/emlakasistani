const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getOnboardingProgress } = require('../services/onboardingService');

const router = express.Router();

router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const progress = await getOnboardingProgress(req.user.id);
    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
