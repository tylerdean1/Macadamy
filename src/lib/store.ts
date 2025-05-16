// Libraries
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Utilities
import { validateUserRole } from './utils/validate-user-role';

// Types
import type { Profile } from './types';

// AuthState Interface
interface AuthState {
  user: SupabaseUser | null;
  profile: Profile | null;
  setUser: (user: SupabaseUser | null) => void;
  setProfile: (profile: Profile | null) => void;
  clearAuth: () => void;
  bypassAuth: () => void;
}

// Auth Store (memory only for sensitive user info)
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  profile: null,
  setUser: (user) => {
    console.log('[DEBUG] setUser called with:', user);
    set({ user });
  },
  setProfile: (profile) => {
    console.log('[DEBUG] setProfile called with:', profile);
    set({ profile });
  },
  clearAuth: () => {
    console.log('[DEBUG] clearAuth called');
    set({ user: null, profile: null });
  },
  bypassAuth: () => {
    console.log('[DEBUG] bypassAuth called. Setting default user and profile.');
    set({
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@test.com',
        role: 'authenticated',
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
      },
      profile: {
        id: '00000000-0000-0000-0000-000000000000',
        user_role: validateUserRole('Admin'),
        full_name: 'Bypassed Test User',
        email: 'test@test.com',
        phone: '123-456-7891',
        location: '123 Main Street St. Augustine, FL 32080',
        username: 'BYPASSED.TEST.PROFILE',
        avatar_id: '407180e5-203d-49e2-894a-0fee4fee372b',
        avatar_url:
          'https://koaxmrtrzhilnzjbiybr.supabase.co/storage/v1/object/public/avatars-presets//Contract%20Plans.png',
        organization_id: '14344b69-c36b-4e2a-880a-7b24effe1779',
        job_title_id: '411b844e-7f87-4a43-a784-e535336576f1',
        job_titles: {
          title: 'Engineer',
          is_custom: false,
        },
      },
    });
  },
}));

// Persisted Profile Store (non-sensitive)
export const usePersistedProfileStore = create(
  persist<{ profile: Profile | null; setProfile: (p: Profile | null) => void }>(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
    }),
    {
      name: 'auth-profile-storage',
    }
  )
);

// Log Zustand store initialization
console.log('[DEBUG] useAuthStore initialized.');
