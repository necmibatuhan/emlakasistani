import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isValidSupabaseConfig = Boolean(
  supabaseUrl && /^https?:\/\//.test(supabaseUrl) && supabaseServiceKey,
);

export const supabase: SupabaseClient | null =
  isValidSupabaseConfig ? createClient(supabaseUrl!, supabaseServiceKey!) : null;

export const hasValidSupabaseConfig = () => {
  return Boolean(supabase);
};
