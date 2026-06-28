require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);
    
    // Admin
    await pool.query(`
      INSERT INTO users (email, name, password_hash, role, plan) 
      VALUES ($1, $2, $3, 'company_admin', 'proplus')
      ON CONFLICT (email) DO UPDATE SET plan = 'proplus', role = 'company_admin';
    `, ['admin@c21.com', 'Admin Yöneticisi', hash]);
    
    // Manager
    await pool.query(`
      INSERT INTO users (email, name, password_hash, role, plan) 
      VALUES ($1, $2, $3, 'office_manager', 'proplus')
      ON CONFLICT (email) DO UPDATE SET plan = 'proplus', role = 'office_manager';
    `, ['manager@c21.com', 'Ofis Yöneticisi', hash]);
    
    // Agent
    await pool.query(`
      INSERT INTO users (email, name, password_hash, role, plan) 
      VALUES ($1, $2, $3, 'agent', 'proplus')
      ON CONFLICT (email) DO UPDATE SET plan = 'proplus', role = 'agent';
    `, ['agent@c21.com', 'Emlak Danışmanı', hash]);

    console.log('Demo hesapları başarıyla güncellendi/oluşturuldu!');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

seed();
