const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Adding subscription columns to users table...');
    
    // Add columns if they don't exist
    const addColumnQueries = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'trial';",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS cancel_reason VARCHAR(100);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS cancel_feedback TEXT;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS discount_offered BOOLEAN DEFAULT false;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS discount_accepted BOOLEAN DEFAULT false;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS grace_period_ends TIMESTAMPTZ;"
    ];

    for (const query of addColumnQueries) {
      await client.query(query);
    }

    console.log('Creating cancel_flow_events table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS cancel_flow_events (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        step VARCHAR(50),
        action VARCHAR(50),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('Migration successful!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
