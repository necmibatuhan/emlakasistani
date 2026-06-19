const jwt = require('jsonwebtoken');

const JWT_SECRET = 'super_secret_jwt_key_for_emlak';

const payload = {
  id: '00000000-0000-0000-0000-000000000000',
  role: 'super_admin',
  company_id: '00000000-0000-0000-0000-000000000000'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

async function poll() {
  while (true) {
    try {
      const res = await fetch(`https://emlakasistani.onrender.com/api/leads/123e4567-e89b-12d3-a456-426614174000`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const text = await res.text();
      console.log(new Date().toISOString(), res.status, text);
      if (text.includes('Lead bulunamadı') || res.status === 404 && text.startsWith('{')) {
        console.log("RENDER IS UP WITH THE NEW CODE!");
        break;
      }
    } catch (e) {
      console.error(e.message);
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}

poll();
