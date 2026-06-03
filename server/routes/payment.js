const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Shopier Checkout (Ödeme Formunu Başlatma)
router.post('/shopier-checkout', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    
    // Geçerli plan kontrolü
    if (!['pro', 'proplus'].includes(plan)) {
      return res.status(400).json({ message: 'Geçersiz plan seçimi' });
    }

    const price = plan === 'pro' ? 299 : 599;
    const user = req.user; // authMiddleware'den geliyor
    
    // Veritabanından kullanıcı detaylarını al
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [user.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    
    const dbUser = userRes.rows[0];
    const userNameParts = dbUser.name ? dbUser.name.split(' ') : ['İsimsiz', 'Kullanıcı'];
    const buyerName = userNameParts[0] || 'Müşteri';
    const buyerSurname = userNameParts.slice(1).join(' ') || 'Soyadı';

    // Sipariş numarası oluştur
    const orderId = `KAPORA_${Date.now()}_${dbUser.id}`;

    // Veritabanına bekleyen siparişi (pending) kaydet
    // (Önce tablomuz yoksa hızlıca bir 'orders' tablosu gereksinimi var, 
    // ancak şu an basit tutmak için user tablosundaki bir metadata veya direkt callback üzerinden çözebiliriz.
    // Daha güvenli olması için orders tablosu eklenebilir. Şu anlık callback'e parametre gönderiyoruz.)

    // API Anahtarları (.env'den alınacak, yoksa test verisi)
    const API_KEY = process.env.SHOPIER_API_KEY || 'TEST_API_KEY';
    const API_SECRET = process.env.SHOPIER_API_SECRET || 'TEST_API_SECRET';
    const CALLBACK_URL = `${process.env.VITE_API_URL || 'http://localhost:5001'}/api/payment/shopier-callback`;

    // Shopier Hash oluşturma
    // Hash Mantığı: API_SECRET + orderId + totalAmount + currency
    const totalAmount = price; 
    const currency = 0; // 0 = TL
    const randomString = crypto.randomBytes(4).toString('hex');

    // Yeni sistem HMAC SHA256 Hash
    const hashString = orderId + totalAmount + currency;
    const hmac = crypto.createHmac('sha256', API_SECRET);
    hmac.update(hashString);
    const signature = hmac.digest('base64');

    // Dönen form HTML'ini veya verileri frontend'e verelim.
    // Shopier, arka planda form submit yapmayı sever.
    res.json({
      success: true,
      data: {
        API_KEY,
        signature,
        orderId,
        totalAmount,
        currency,
        buyerName,
        buyerSurname,
        buyerEmail: dbUser.email,
        buyerPhone: '05555555555', // Geliştirilecek
        buyerAddress: 'İstanbul, Türkiye', // Geliştirilecek
        callbackUrl: CALLBACK_URL,
        buyerAccountAge: 0,
        buyerId: dbUser.id,
        customData: plan // Hangi planı aldığını Shopier'e custom veri olarak iletiyoruz
      }
    });

  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Ödeme başlatılamadı.' });
  }
});

// Shopier Callback / Webhook
router.post('/shopier-callback', async (req, res) => {
  try {
    const {
      status, 
      invoice_id, 
      order_id, 
      item_type, 
      total_amount, 
      currency, 
      installment, 
      custom_data, 
      signature
    } = req.body;

    const API_SECRET = process.env.SHOPIER_API_SECRET || 'TEST_API_SECRET';

    // Güvenlik doğrulaması (Hash kontrolü)
    const expectedHashString = random_nr + order_id + total_amount + currency; 
    // Shopier dökümantasyonuna göre POST edilen verideki random_nr'yi alıp signature doğrulanır.
    const random_nr = req.body.random_nr;
    const hash_str = random_nr + order_id + total_amount + currency;
    const hmac = crypto.createHmac('sha256', API_SECRET);
    hmac.update(hash_str);
    const expectedSignature = hmac.digest('base64');

    if (signature !== expectedSignature) {
      console.error('Shopier geçersiz imza (signature mismatch)');
      return res.status(400).send('Geçersiz İmza');
    }

    if (status === 'success') {
      // custom_data içerisinden planı ve kullanıcı ID'sini order_id'den çıkarabiliriz.
      // order_id formatımız: KAPORA_123456789_userId
      const orderParts = order_id.split('_');
      const userId = orderParts[2];
      const plan = custom_data || 'pro'; // varsayılan

      if (userId) {
        await db.query('UPDATE users SET plan = $1 WHERE id = $2', [plan, userId]);
        console.log(`Kullanıcı ${userId} planı ${plan} olarak güncellendi.`);
        
        // Kullanıcıyı frontend başarılı sayfasına yönlendir (GET / POST method farkından dolayı frontend yönlendirmesi yapıyoruz)
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result?status=success`);
      }
    } else {
      console.error(`Shopier ödeme başarısız: ${order_id}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result?status=fail`);
    }

  } catch (err) {
    console.error('Shopier callback error:', err);
    res.status(500).send('Webhook Hatası');
  }
});

module.exports = router;
