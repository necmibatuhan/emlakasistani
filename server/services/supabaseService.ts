import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'mock_supabase_url';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock_supabase_key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

export const hasValidSupabaseConfig = () => {
  return process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
};
