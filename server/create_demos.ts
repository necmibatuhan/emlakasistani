require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');

async function createDemos() {
  try {
    console.log('Demo hesapları kontrol ediliyor...');
    
    // Check if Century 21 company exists
    let companyRes = await db.query("SELECT id FROM companies WHERE name = 'Century 21'");
    let companyId;
    if (companyRes.rows.length === 0) {
      const newComp = await db.query("INSERT INTO companies (name, plan) VALUES ($1, $2) RETURNING id", ['Century 21', 'enterprise']);
      companyId = newComp.rows[0].id;
    } else {
      companyId = companyRes.rows[0].id;
    }

    // Check if office exists
    let officeRes = await db.query("SELECT id FROM offices WHERE company_id = $1 AND name = 'C21 Merkez'", [companyId]);
    let officeId;
    if (officeRes.rows.length === 0) {
      const newOff = await db.query("INSERT INTO offices (company_id, name, city) VALUES ($1, $2, $3) RETURNING id", [companyId, 'C21 Merkez', 'İstanbul']);
      officeId = newOff.rows[0].id;
    } else {
      officeId = officeRes.rows[0].id;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('123456', salt);

    const accounts = [
      { email: 'demo@kapora.online', name: 'Demo Kullanıcı', role: 'company_admin' }
    ];

    for (let acc of accounts) {
      const userRes = await db.query("SELECT id FROM users WHERE email = $1", [acc.email]);
      if (userRes.rows.length > 0) {
        await db.query("UPDATE users SET password_hash = $1, is_verified = true, role = $2 WHERE email = $3", [password_hash, acc.role, acc.email]);
        console.log(`Guncellendi: ${acc.email}`);
      } else {
        await db.query(
          "INSERT INTO users (company_id, office_id, name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5, $6, true)",
          [companyId, officeId, acc.name, acc.email, password_hash, acc.role]
        );
        console.log(`Olusturuldu: ${acc.email}`);
      }
    }
    
    console.log('Demo hesapları başarıyla ayarlandı.');
    process.exit(0);
  } catch (err) {
    console.error('Hata:', err);
    process.exit(1);
  }
}

createDemos();
