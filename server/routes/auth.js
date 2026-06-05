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

const sendResendEmail = async (to, subject, html) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_ZMoRLSj3_67kzciBd73eaHcCiNGAtsPUk';
  const fromEmail = process.env.SMTP_FROM || 'info@kapora.online';
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `Kapora <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: html
    })
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Resend API Hatası');
  }
  return data;
};

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  try {
    const data = await sendResendEmail(
      email,
      "Kapora Hesabınızı Doğrulayın",
      `
        <h2>Kapora'a Hoş Geldiniz!</h2>
        <p>Hesabınızı aktifleştirmek için lütfen aşağıdaki bağlantıya tıklayın:</p>
        <a href="${verificationUrl}" style="display:inline-block;padding:10px 20px;color:#fff;background-color:#F5A623;text-decoration:none;border-radius:5px;">Hesabımı Doğrula</a>
        <p>Eğer butona tıklayamazsanız, bu linki kopyalayıp tarayıcınıza yapıştırın:</p>
        <p>${verificationUrl}</p>
      `
    );
    console.log(`Doğrulama maili gönderildi: ${email} (${data.id})`);
  } catch (error) {
    console.error("Mail gönderme hatası:", error);
  }
};

// Cloudflare Turnstile Verification
async function verifyTurnstile(token) {
  if (!process.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY === 'GIRILECEK_TURNSTILE_SECRET_KEY') {
    return true; // Skip if not configured
  }
  if (!token) return false;
  
  try {
    const formData = new URLSearchParams();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}

router.post('/register', async (req, res) => {
  try {
    const { email, name, password, role = 'agent', turnstileToken } = req.body;
    
    const isHuman = await verifyTurnstile(turnstileToken);
    if (!isHuman) {
      return res.status(403).json({ message: 'Lütfen robot olmadığınızı doğrulayın.' });
    }
    
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
    try { await db.query('ROLLBACK'); } catch(e) {}
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası', error: err.message, stack: err.stack });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, turnstileToken } = req.body;

    const demoEmails = ['admin@c21.com', 'manager@c21.com', 'agent@c21.com'];
    const isDemoAccount = email && demoEmails.includes(email.toLowerCase().trim());

    if (!isDemoAccount) {
      const isHuman = await verifyTurnstile(turnstileToken);
      if (!isHuman) {
        return res.status(403).json({ message: 'Lütfen robot olmadığınızı doğrulayın.' });
      }
    }

    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya şifre' });
    }
    const user = userRes.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Lütfen giriş yapmadan önce e-posta adresinizi doğrulayın.' });
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
    const { credential, role = 'agent' } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential bulunamadı' });

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.error("Google Token Hatası:", err);
      return res.status(401).json({ message: 'Google ile giriş başarısız oldu.' });
    }

    const { email, name, sub: google_id } = payload;

    let userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (userRes.rows.length > 0) {
      user = userRes.rows[0];
      // Eğer Google ile girmiş ama verify edilmemişse, Google üzerinden girdi diye verify edebiliriz.
      if (!user.is_verified) {
        await db.query('UPDATE users SET is_verified = true WHERE id = $1', [user.id]);
        user.is_verified = true;
      }
    } else {
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
        `INSERT INTO users (company_id, office_id, email, name, password_hash, role, is_verified) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, company_id, office_id, role, email, name, plan, is_verified`,
        [companyId, officeId, email, name, 'google_login_no_password', role, true]
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
// Şifremi Unuttum (Forgot Password)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, turnstileToken } = req.body;
    
    // Verify Turnstile Token (if configured)
    if (process.env.TURNSTILE_SECRET_KEY && process.env.TURNSTILE_SECRET_KEY !== 'GIRILECEK_TURNSTILE_SECRET_KEY') {
      if (!turnstileToken) {
        return res.status(403).json({ message: 'Lütfen robot olmadığınızı doğrulayın.' });
      }

      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`
      });
      
      const turnstileData = await turnstileRes.json();
      if (!turnstileData.success) {
        return res.status(403).json({ message: 'Güvenlik doğrulaması başarısız oldu.' });
      }
    }
    
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.json({ message: 'Eğer bu e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.' });
    }
    
    const user = userResult.rows[0];
    const resetSecret = (process.env.JWT_SECRET || 'gizli_anahtar') + user.password_hash;
    const resetToken = jwt.sign({ userId: user.id, email: user.email }, resetSecret, { expiresIn: '1h' });
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&id=${user.id}`;
    
    if (process.env.RESEND_API_KEY || (process.env.SMTP_USER && process.env.SMTP_PASS)) {
      try {
        await sendResendEmail(
          email,
          "Kapora Şifre Sıfırlama İsteği",
          `
            <h2>Şifrenizi Sıfırlayın</h2>
            <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın. Bu bağlantı 1 saat boyunca geçerlidir.</p>
            <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;color:#fff;background-color:#F5A623;text-decoration:none;border-radius:5px;">Şifremi Sıfırla</a>
            <p>Eğer butona tıklayamazsanız, bu linki kopyalayıp tarayıcınıza yapıştırın:</p>
            <p>${resetUrl}</p>
          `
        );
      } catch (mailErr) {
        console.error('SMTP Mail Gönderme Hatası:', mailErr);
        return res.status(500).json({ message: `Mail gönderilemedi. Lütfen sistem yöneticisiyle iletişime geçin. (Hata: ${mailErr.message})` });
      }
    } else {
      console.log('\n\n🔔 DİKKAT: SMTP Ayarları (Mail) girilmediği için şifre sıfırlama maili gönderilemedi.');
      console.log('Kullanıcının şifresini sıfırlaması için gereken gizli link (Manuel olarak iletebilirsiniz):');
      console.log('👉', resetUrl, '\n\n');
    }
    
    res.json({ message: 'Eğer bu e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.' });
    
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// Şifre Sıfırlama (Reset Password)
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;
    
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(400).json({ message: 'Geçersiz bağlantı.' });
    
    const user = userResult.rows[0];
    const resetSecret = (process.env.JWT_SECRET || 'gizli_anahtar') + user.password_hash;
    
    try {
      jwt.verify(token, resetSecret);
    } catch (err) {
      return res.status(400).json({ message: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);
    
    res.json({ message: 'Şifreniz başarıyla sıfırlandı. Artık giriş yapabilirsiniz.' });
    
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// GET /me (Get current user)
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

// DELETE /me (Hard delete user and all associated data)
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    const deleteRes = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.user.id]);
    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı veya zaten silinmiş.' });
    }
    res.json({ message: 'Kullanıcı hesabı ve tüm verileri kalıcı olarak silindi.' });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ message: 'Kullanıcı hesabı silinirken sunucu hatası oluştu.' });
  }
});

module.exports = router;
