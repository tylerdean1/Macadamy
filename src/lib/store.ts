// Libraries
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Utilities
import { validateUserRole } from './utils/validate-user-role';

// Types
import type { Database } from './database.types';
import type { Profile } from './types';

// Exported Types
export type UserRole = Database['public']['Enums']['user_role'];

// AuthState Interface
interface AuthState {
  user: SupabaseUser | null;
  profile: Profile | null;
  setUser: (user: SupabaseUser | null) => void;
  setProfile: (profile: Profile | null) => void;
  clearAuth: () => void;
  bypassAuth: () => void;
}

// Default User for bypassing authentication
const defaultUser: SupabaseUser = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'test@test.com',
  role: 'authenticated',
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
};

// Default Profile for bypassing authentication
const defaultProfile: Profile = {
  id: '00000000-0000-0000-0000-000000000000',
  user_role: validateUserRole('Admin'),
  full_name: 'Test User',
  email: 'test@test.com',
  phone: '',
  location: '',
  username: 'test',
  avatar_url: '',
  organization_id: '',
  job_title_id: '',
  organizations: {
    name: 'Demo Org',
    address: '',
    phone: '',
    website: '',
  },
  job_titles: {
    title: 'Engineer',
    is_custom: false,
  },
};

/**
 * Zustand store for handling authentication state.
 */
export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      /**
       * The currently authenticated user.
       */
      user: null,

      /**
       * The profile of the authenticated user.
       */
      profile: null,

      /**
       * Updates the authenticated user.
       */
      setUser: (user: SupabaseUser | null) => set({ user }),

      /**
       * Updates the profile of the authenticated user.
       */
      setProfile: (profile: Profile | null) => set({ profile }),

      /**
       * Clears authentication state (user and profile).
       */
      clearAuth: () => set({ user: null, profile: null }),

      /**
       * Bypasses authentication by setting default user and profile.
       */
      bypassAuth: () => set({ user: defaultUser, profile: defaultProfile }),
    }),
    {
      name: 'auth-storage', // Name of the storage key
      getStorage: () => localStorage, // Use localStorage for persistence
    }
  )
);