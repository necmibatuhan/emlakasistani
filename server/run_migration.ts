require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN whatsapp_phone TEXT;');
    console.log('Migration successful: Added whatsapp_phone');
  } catch (err) {
    if (err.code === '42701') {
      console.log('Column already exists, ignoring.');
    } else {
      console.error('Migration failed', err);
    }
  } finally {
    pool.end();
  }
}

run();
