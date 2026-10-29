import { createClient } from '@supabase/supabase-js';

// These come from the .env file (see .env.example).
// They are public by design: the database security rules (RLS) protect the data.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// If .env is not filled in yet, supabase is null and the staff pages show a setup message
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
