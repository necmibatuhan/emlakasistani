const pool = require('./db');

async function migrate() {
  try {
    console.log('Starting Phase 1 migrations...');
    
    // Add KVKK Consent
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS kvkk_consent_at TIMESTAMPTZ`);
    console.log('Added kvkk_consent_at to users');

    // Drop old score constraint and add new one
    try {
      await pool.query(`ALTER TABLE leads DROP CONSTRAINT leads_score_check`);
    } catch (e) {
      console.log('leads_score_check constraint did not exist or already dropped.');
    }
    await pool.query(`ALTER TABLE leads ADD CONSTRAINT leads_score_check CHECK (score BETWEEN 0 AND 100)`);
    console.log('Updated leads score constraint to 0-100');

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
