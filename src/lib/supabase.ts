import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';          // ← generated file
import { getValidatedClientEnv } from '@/utils/env-validator';

/* ── environment ────────────────────────────────────────────────
   Throws at boot if the vars are missing, so you fail fast
   in dev/CI instead of getting mysterious runtime 401s.        */
const {
  VITE_SUPABASE_URL: SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_TOKEN: SUPABASE_ANON,
} = getValidatedClientEnv();

/* ── typed client ──────────────────────────────────────────────
   - persistSession keeps users logged in on refresh
   - autoRefreshToken silently renews JWTs when they near expiry
   - detectSessionInUrl handles OAuth redirect flows out-of-box  */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  // keep fetch explicit so it works in Node & modern browsers
  global: { fetch },
});

/* Optional: re-export the client type for hooks & tests */export type SupabaseClient = typeof supabase;