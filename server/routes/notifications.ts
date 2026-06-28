const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.get('/unsubscribe', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('<h1>Hatalı İstek</h1><p>Geçersiz bağlantı.</p>');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.action !== 'unsubscribe') {
      throw new Error('Invalid action');
    }

    const userId = decoded.id;

    await pool.query('UPDATE users SET unsubscribed_at = NOW() WHERE id = $1', [userId]);

    res.send(`
      <div style="font-family: sans-serif; padding: 40px; text-align: center; max-width: 500px; margin: 0 auto;">
        <h1 style="color: #10B981;">Abonelikten Çıkıldı</h1>
        <p style="color: #4b5563;">Artık Kapora'dan pazarlama ve hatırlatma e-postaları almayacaksınız. Fatura ve güvenlik e-postaları gelmeye devam edecektir.</p>
        <a href="/" style="display: inline-block; margin-top: 20px; color: #10B981; text-decoration: none; font-weight: bold;">Siteye Dön</a>
      </div>
    `);
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(400).send('<h1>Geçersiz İstek</h1><p>Bağlantı süresi dolmuş veya geçersiz.</p>');
  }
});

module.exports = router;
