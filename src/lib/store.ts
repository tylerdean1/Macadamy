import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Import middleware for persistence
import { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { Profile } from './types'; // Import the updated Profile interface

export type UserRole = Database['public']['Enums']['user_role'];

interface AuthState {
  user: SupabaseUser | null;
  profile: Profile | null;
  setUser: (user: SupabaseUser | null) => void;
  setProfile: (profile: Profile | null) => void;
  clearAuth: () => void;
  bypassAuth: () => void;
}

const defaultUser: SupabaseUser = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'test@test.com',
  role: 'authenticated',
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
};

const defaultProfile: Profile = {
  id: '00000000-0000-0000-0000-000000000000',
  user_role: 'admin', // Ensure this matches a value in the UserRole enum
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

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      profile: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      clearAuth: () => set({ user: null, profile: null }),
      bypassAuth: () => set({ user: defaultUser, profile: defaultProfile }),
    }),
    {
      name: 'auth-storage', // Name of the storage key
      getStorage: () => localStorage, // Use localStorage for persistence
    }
  )
);