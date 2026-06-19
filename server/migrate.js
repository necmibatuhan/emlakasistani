const pool = require('./db');

async function migrate() {
  try {
    console.log('Starting migration...');
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES users(id) ON DELETE SET NULL`);
    
    // Generate referral codes for existing users
    const users = await pool.query('SELECT id, name FROM users WHERE referral_code IS NULL');
    for (const u of users.rows) {
      const baseCode = u.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5);
      const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const refCode = `${baseCode}${uniqueSuffix}`;
      await pool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [refCode, u.id]);
    }
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
