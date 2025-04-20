// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { getRequiredEnv } from '../utils/env-validator';

const supabaseUrl = getRequiredEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getRequiredEnv('VITE_SUPABASE_ANON_KEY');

// Prevent multiple GoTrueClient instances during HMR or reloads
const globalForSupabase = globalThis as unknown as {
  __supabase?: ReturnType<typeof createClient<Database>>;
};

const supabase =
  globalForSupabase.__supabase ??
  createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'macadamy.auth.token', // ✅ custom key to avoid overlap
    },
    db: {
      schema: 'public',
    },
  });

// Cache client for HMR during development
if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.__supabase = supabase;
}

export { supabase };
