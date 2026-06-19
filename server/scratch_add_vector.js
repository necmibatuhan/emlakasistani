require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/emlak_asistani'
});

async function main() {
  try {
    console.log("Adding vector extension...");
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
    
    console.log("Adding embedding column to properties...");
    await pool.query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS embedding vector(1536);');
    
    console.log("Success");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
