const { Pool } = require('pg');
require('dotenv').config();

const rawConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
let connectionString = rawConnectionString;

if (rawConnectionString) {
  const parsed = new URL(rawConnectionString);
  parsed.searchParams.delete('sslmode');
  connectionString = parsed.toString();
}

const usesSupabase = Boolean(connectionString?.includes('.supabase.com'));

const pool = new Pool({
  connectionString,
  ssl: usesSupabase || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
