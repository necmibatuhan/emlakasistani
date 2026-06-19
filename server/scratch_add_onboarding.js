const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_onboarding_progress (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        has_added_3_leads BOOLEAN DEFAULT false,
        has_analyzed_listing BOOLEAN DEFAULT false,
        has_first_match BOOLEAN DEFAULT false,
        has_10_leads BOOLEAN DEFAULT false,
        current_level INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `);
    console.log("Table user_onboarding_progress created.");
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

main();
