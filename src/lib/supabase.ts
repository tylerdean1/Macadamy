import { createClient } from '@supabase/supabase-js'; // Import Supabase client library
import { Database } from './database.types'; // Import the database type definitions
import { getRequiredEnv } from '../utils/env-validator'; // Import environment variable validation utility

// Get required environment variables with validation
const supabaseUrl = getRequiredEnv('VITE_SUPABASE_URL'); // Fetch Supabase URL
const supabaseAnonKey = getRequiredEnv('VITE_SUPABASE_ANON_KEY'); // Fetch API key for Supabase

// Create and export a Supabase client instance with configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Persist user session across refreshes
    autoRefreshToken: true, // Automatically refresh tokens for session validity
  },
  db: {
    schema: 'public', // Use the public schema by default
  },
});