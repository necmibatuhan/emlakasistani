require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkUser() {
  try {
    const res = await pool.query(`SELECT email, is_verified FROM users`);
    console.log("Kayıtlı Kullanıcılar:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkUser();
