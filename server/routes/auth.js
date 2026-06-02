const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'MOCK_CLIENT_ID');

// Helper for Mock Email
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  console.log(`\n\n=== E-POSTA SİMÜLASYONU ===`);
  console.log(`Kime: ${email}`);
  console.log(`Konu: Emlak Asistanı Hesabınızı Doğrulayın`);
  console.log(`İçerik: Hesabınızı doğrulamak için aşağıdaki linke tıklayın:`);
  console.log(`${verificationUrl}`);
  console.log(`=============================\n\n`);
};

router.post('/register', async (req, res) => {
  try {
    const { email, name, password, role = 'agent' } = req.body;
    
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Bu e-posta zaten kullanımda.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Multi-tenant Setup: Create Company -> Office -> User
    await db.query('BEGIN');
    
    const companyRes = await db.query(
      'INSERT INTO companies (name) VALUES ($1) RETURNING id',
      [`${name} Emlak`]
    );
    const companyId = companyRes.rows[0].id;

    const officeRes = await db.query(
      'INSERT INTO offices (company_id, name, city) VALUES ($1, $2, $3) RETURNING id',
      [companyId, 'Merkez Ofis', 'İstanbul']
    );
    const officeId = officeRes.rows[0].id;

    const newUser = await db.query(
      `INSERT INTO users (company_id, office_id, email, name, password_hash, role, verification_token, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, company_id, office_id, role, email, name, plan, is_verified`,
      [companyId, officeId, email, name, password_hash, role, verificationToken, false]
    );

    await db.query('COMMIT');

    const user = newUser.rows[0];
    
    // Send verification email mock
    await sendVerificationEmail(user.email, verificationToken);

    // DİKKAT: Henüz onaylanmadığı için token dönmüyoruz (veya is_verified kontrolü ekliyoruz)
    // Front-end tarafı bu mesajı görünce "lütfen mailinizi onaylayın" desin.
    res.status(201).json({ message: 'Kayıt başarılı. Lütfen e-postanıza gönderilen doğrulama linkine tıklayın.', user });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya şifre' });
    }
    const user = userRes.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: user.company_id, office_id: user.office_id, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      user: { id: user.id, role: user.role, company_id: user.company_id, office_id: user.office_id, email: user.email, name: user.name, plan: user.plan }, 
      token 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.query('SELECT id, company_id, office_id, role, email, name, plan, is_verified FROM users WHERE id = $1', [req.user.id]);
    if (user.rows.length === 0) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token bulunamadı' });

    const userRes = await db.query('SELECT * FROM users WHERE verification_token = $1', [token]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }

    await db.query('UPDATE users SET is_verified = true, verification_token = null WHERE id = $1', [userRes.rows[0].id]);
    res.json({ message: 'E-postanız başarıyla doğrulandı. Artık giriş yapabilirsiniz.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential bulunamadı' });

    // In a real scenario, uncomment and use googleClient to verify
    /*
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: google_id } = payload;
    */
    
    // For MOCK demo, we'll parse the JWT without verification
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    const { email, name, sub: google_id } = payload;

    let userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (userRes.rows.length > 0) {
      // User exists, update google_id if missing, verify them
      user = userRes.rows[0];
      await db.query('UPDATE users SET google_id = $1, is_verified = true WHERE id = $2', [google_id, user.id]);
    } else {
      // New user, create them (with a mock company/office for demo purposes)
      await db.query('BEGIN');
      const companyRes = await db.query('INSERT INTO companies (name) VALUES ($1) RETURNING id', [`${name} Emlak`]);
      const companyId = companyRes.rows[0].id;
      const officeRes = await db.query('INSERT INTO offices (company_id, name, city) VALUES ($1, $2, $3) RETURNING id', [companyId, 'Merkez Ofis', 'İstanbul']);
      const officeId = officeRes.rows[0].id;

      const newUser = await db.query(
        `INSERT INTO users (company_id, office_id, email, name, role, google_id, is_verified) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, company_id, office_id, role, email, name, plan`,
        [companyId, officeId, email, name, 'agent', google_id, true]
      );
      await db.query('COMMIT');
      user = newUser.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: user.company_id, office_id: user.office_id, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      user: { id: user.id, role: user.role, company_id: user.company_id, office_id: user.office_id, email: user.email, name: user.name, plan: user.plan }, 
      token 
    });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
