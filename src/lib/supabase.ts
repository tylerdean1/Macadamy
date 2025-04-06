import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { getRequiredEnv } from '../utils/env-validator';

// Get required environment variables with validation
const supabaseUrl = getRequiredEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getRequiredEnv('VITE_SUPABASE_ANON_KEY');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});