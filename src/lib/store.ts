// Libraries
import { create } from 'zustand';
import { persist, StorageValue } from 'zustand/middleware';
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
  avatar_id: '', // ✅ added to fix type error
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

// Log initial default user and profile
console.log('[DEBUG] Default User:', defaultUser);
console.log('[DEBUG] Default Profile:', defaultProfile);

// Custom storage adapter (type-safe)
const localStorageAdapter = {
  getItem: (name: string): StorageValue<AuthState> | null => {
    console.log('[DEBUG] Retrieving item from localStorage with name:', name);
    try {
      const str = localStorage.getItem(name);
      console.log('[DEBUG] Retrieved item:', str);
      return str ? JSON.parse(str) : null;
    } catch (error) {
      console.error('[ERROR] Failed to retrieve item from localStorage:', error);
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<AuthState>) => {
    console.log('[DEBUG] Setting item in localStorage with name:', name, 'and value:', value);
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.error('[ERROR] Failed to set item in localStorage:', error);
    }
  },
  removeItem: (name: string) => {
    console.log('[DEBUG] Removing item from localStorage with name:', name);
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('[ERROR] Failed to remove item from localStorage:', error);
    }
  },
};

/**
 * Zustand store for handling authentication state.
 */
export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      profile: null,
      setUser: (user) => {
        console.log('[DEBUG] setUser called with:', user);
        if (!user || typeof user !== 'object') {
          console.error('[ERROR] Invalid user passed to setUser:', user);
          return;
        }
        set({ user });
      },
      setProfile: (profile) => {
        console.log('[DEBUG] setProfile called with:', profile);
        if (!profile || typeof profile !== 'object') {
          console.error('[ERROR] Invalid profile passed to setProfile:', profile);
          return;
        }
        set({ profile });
      },
      clearAuth: () => {
        console.log('[DEBUG] clearAuth called');
        set({ user: null, profile: null });
      },
      bypassAuth: () => {
        console.log('[DEBUG] bypassAuth called. Setting default user and profile.');
        set({ user: defaultUser, profile: defaultProfile });
      },
    }),
    {
      name: 'auth-storage',
      storage: localStorageAdapter,
    }
  )
);

// Log Zustand store initialization
console.log('[DEBUG] useAuthStore initialized.');