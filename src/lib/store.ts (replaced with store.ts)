import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface Profile {
  role: 'Admin' | 'Contractor' | 'Engineer' | 'Project Manager' | 'Inspector';
  fullName: string;
  email: string;
  phone: string;
  location: string;
  company: string;
  username: string;
  jobTitleId?: string;
  organizationId?: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  clearAuth: () => void;
  bypassAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  clearAuth: () => set({ user: null, profile: null }),
  bypassAuth: () => set({ 
    user: {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@test.com',
      role: 'authenticated',
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User,
    profile: {
      role: 'Admin',
      fullName: 'Test User',
      email: 'test@test.com',
      phone: '',
      location: '',
      company: '',
      username: 'test'
    }
  }),
}));