const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Seed default templates if they don't exist for the user
const seedDefaultTemplates = async (userId) => {
  const check = await pool.query('SELECT COUNT(*) FROM message_templates WHERE user_id = $1', [userId]);
  if (parseInt(check.rows[0].count) === 0) {
    const defaults = [
      {
        name: 'İlk Temas',
        text: 'Merhaba {{musteri_adi}}, ben {{danisman_adi}}. Gayrimenkul arayışınızda yardımcı olmak için arıyorum. Size uygun birkaç seçeneğim var, kısa bir görüşme yapabilir miyiz?'
      },
      {
        name: 'Portföy Paylaşımı',
        text: 'Merhaba {{musteri_adi}}, {{portfoy_adresi}} adresinde {{fiyat}} değerinde bir ilan var, tam aradığınız özelliklere uyuyor. Detayları paylaşabilir miyim?'
      },
      {
        name: 'Takip',
        text: 'Merhaba {{musteri_adi}}, geçen görüşmemizden sonra yeni seçenekler çıktı. Uygun bir zamanda bilgi verebilir miyim?'
      }
    ];
    for (const t of defaults) {
      await pool.query(
        'INSERT INTO message_templates (user_id, name, template_text) VALUES ($1, $2, $3)',
        [userId, t.name, t.text]
      );
    }
  }
};

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await seedDefaultTemplates(userId);
    
    const result = await pool.query('SELECT * FROM message_templates WHERE user_id = $1 ORDER BY id ASC', [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, template_text } = req.body;
    const result = await pool.query(
      'INSERT INTO message_templates (user_id, name, template_text) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, template_text]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query('DELETE FROM message_templates WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
