const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const Iyzipay = require('iyzipay');

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || 'sandbox-12345',
  secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-secret-12345',
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
});

// Shopier Checkout (Ödeme Formunu Başlatma)
router.post('/shopier-checkout', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    
    // Geçerli plan kontrolü
    if (!['pro', 'proplus'].includes(plan)) {
      return res.status(400).json({ message: 'Geçersiz plan seçimi' });
    }

    const price = plan === 'pro' ? 299 : 599;
    const user = req.user;
    
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [user.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    
    const dbUser = userRes.rows[0];
    const userNameParts = dbUser.name ? dbUser.name.split(' ') : ['İsimsiz', 'Kullanıcı'];
    const buyerName = userNameParts[0] || 'Müşteri';
    const buyerSurname = userNameParts.slice(1).join(' ') || 'Soyadı';

    const orderId = `KAPORA_${Date.now()}_${dbUser.id}`;

    const API_KEY = process.env.SHOPIER_API_KEY || 'TEST_API_KEY';
    const API_SECRET = process.env.SHOPIER_API_SECRET || 'TEST_API_SECRET';
    const CALLBACK_URL = `${process.env.API_URL || 'http://localhost:5001'}/api/payment/shopier-callback`;

    // Shopier variables
    const random_nr = Math.floor(Math.random() * 1000000).toString();
    const totalAmount = price; 
    const currency = 0; // 0 = TL

    // Shopier HMAC SHA256 Hash
    const hashString = random_nr + orderId + totalAmount + currency;
    const hmac = crypto.createHmac('sha256', API_SECRET);
    hmac.update(hashString);
    const signature = hmac.digest('base64');

    res.json({
      success: true,
      data: {
        API_KEY,
        signature,
        platform_order_id: orderId,
        random_nr,
        product_name: plan === 'pro' ? 'Emlak Asistanı Pro' : 'Emlak Asistanı Pro+',
        product_type: 2, // Digital
        product_price: totalAmount,
        currency,
        buyer_name: buyerName,
        buyer_surname: buyerSurname,
        buyer_email: dbUser.email,
        buyer_phone: '05555555555',
        buyer_idnr: dbUser.id,
        buyer_account_age: 0,
        custom_data: plan,
        callback: CALLBACK_URL
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
      signature,
      random_nr
    } = req.body;

    const API_SECRET = process.env.SHOPIER_API_SECRET || 'TEST_API_SECRET';

    // Verify Signature
    const hash_str = random_nr + order_id + total_amount + currency;
    const hmac = crypto.createHmac('sha256', API_SECRET);
    hmac.update(hash_str);
    const expectedSignature = hmac.digest('base64');

    if (signature !== expectedSignature) {
      console.error('Shopier signature mismatch');
      return res.status(400).send('Geçersiz İmza');
    }

    if (status === 'success') {
      const orderParts = order_id.split('_');
      const userId = orderParts[2];
      const plan = custom_data || 'pro';

      if (userId) {
        await db.query('UPDATE users SET plan = $1 WHERE id = $2', [plan, userId]);
        console.log(`User ${userId} upgraded to ${plan}`);
        
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result?status=success`);
      }
    } else {
      console.error(`Shopier failed payment: ${order_id}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result?status=fail`);
    }

  } catch (err) {
    console.error('Shopier callback error:', err);
    res.status(500).send('Webhook Error');
  }
});

// MOCK CHECKOUT FOR DEMO/TESTING
router.post('/mock-checkout', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['pro', 'proplus'].includes(plan)) {
      return res.status(400).json({ message: 'Geçersiz plan seçimi' });
    }
    const price = plan === 'pro' ? 299 : 599;
    const user = req.user;
    
    // Simulate creating a checkout session and returning its ID
    const sessionId = `mock_sess_${crypto.randomBytes(8).toString('hex')}`;
    
    res.json({
      success: true,
      data: {
        sessionId,
        plan,
        price,
        userId: user.id
      }
    });
  } catch (err) {
    console.error('Mock Checkout error:', err);
    res.status(500).json({ message: 'Ödeme başlatılamadı.' });
  }
});

// MOCK CALLBACK FOR DEMO/TESTING
router.post('/mock-callback', authMiddleware, async (req, res) => {
  try {
    const { plan, success } = req.body;
    const userId = req.user.id;

    if (success) {
      await db.query('UPDATE users SET plan = $1 WHERE id = $2', [plan, userId]);
      console.log(`Mock: User ${userId} upgraded to ${plan}`);
      return res.json({ success: true, message: 'Ödeme başarılı, plan güncellendi.' });
    } else {
      return res.status(400).json({ success: false, message: 'Ödeme başarısız.' });
    }
  } catch (err) {
    console.error('Mock Callback error:', err);
    res.status(500).json({ message: 'Callback Error' });
  }
});


// IYZICO CHECKOUT
router.post('/iyzico-checkout', authMiddleware, async (req, res) => {
  try {
    const { plan, billingCycle = 'monthly' } = req.body;
    if (!['pro', 'proplus'].includes(plan)) {
      return res.status(400).json({ message: 'Geçersiz plan seçimi' });
    }

    let price = '0.0';
    if (plan === 'pro') {
      price = billingCycle === 'yearly' ? '1490.0' : '149.0';
    } else if (plan === 'proplus') {
      price = billingCycle === 'yearly' ? '2490.0' : '249.0';
    }
    const user = req.user;
    
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [user.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    const dbUser = userRes.rows[0];

    const userNameParts = dbUser.name ? dbUser.name.split(' ') : ['İsimsiz', 'Kullanıcı'];
    const buyerName = userNameParts[0] || 'Müşteri';
    const buyerSurname = userNameParts.slice(1).join(' ') || 'Soyadı';

    const conversationId = `CONV_${Date.now()}_${dbUser.id}`;
    // Encode plan and userId into basketId so we can retrieve them in callback
    const basketId = `${plan}|${dbUser.id}`;

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      price: price,
      paidPrice: price,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: basketId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
      callbackUrl: `${process.env.API_URL || 'http://localhost:5001'}/api/payment/iyzico-callback`,
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: dbUser.id,
        name: buyerName,
        surname: buyerSurname,
        gsmNumber: '+905555555555',
        email: dbUser.email,
        identityNumber: '11111111111',
        lastLoginDate: '2023-01-01 10:00:00',
        registrationDate: '2023-01-01 10:00:00',
        registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || '85.34.78.112',
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34732'
      },
      shippingAddress: {
        contactName: dbUser.name || 'Müşteri',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: '34732'
      },
      billingAddress: {
        contactName: dbUser.name || 'Müşteri',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: '34732'
      },
      basketItems: [
        {
          id: basketId,
          name: plan === 'pro' ? 'Emlak Asistanı PRO Abonelik' : 'Emlak Asistanı PRO+ Abonelik',
          category1: 'Subscription',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: price
        }
      ]
    };

    iyzipay.checkoutFormInitialize.create(request, function (err, result) {
      if (err || result.status !== 'success') {
        console.error('Iyzico Init Error:', err || result);
        return res.status(500).json({ message: 'Ödeme formu başlatılamadı.', error: result?.errorMessage || err });
      }

      res.json({
        success: true,
        data: {
          paymentPageUrl: result.paymentPageUrl,
          token: result.token,
          htmlContent: result.checkoutFormContent
        }
      });
    });

  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Ödeme başlatılamadı.' });
  }
});

// IYZICO CALLBACK
router.post('/iyzico-callback', async (req, res) => {
  const token = req.body.token;
  
  if (!token) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result?status=fail`);
  }

  iyzipay.checkoutForm.retrieve({
    locale: Iyzipay.LOCALE.TR,
    token: token
  }, async function (err, result) {
    if (err || result.paymentStatus !== 'SUCCESS') {
      console.error('Iyzico retrieve error:', err || result);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result?status=fail`);
    }

    // result.basketId contains 'plan|userId'
    const basketId = result.basketId || '';
    const [plan, userId] = basketId.split('|');

    if (userId && plan) {
      await db.query('UPDATE users SET plan = $1 WHERE id = $2', [plan, userId]);
      console.log(`Iyzico: User ${userId} upgraded to ${plan}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result?status=success`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result?status=fail`);
    }
  });
});

module.exports = router;
