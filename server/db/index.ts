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
  withTransaction: async (callback) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};
