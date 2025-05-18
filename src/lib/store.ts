import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Database, Json } from '@/lib/database.types';

// Types
type UserRole = Database['public']['Enums']['user_role'];

export interface EnrichedProfile {
  id: string;
  full_name: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  role: UserRole;
  job_title_id: string | null;
  organization_id: string | null;
  avatar_id: string | null;
  avatar_url: string | null;
  job_title: string | null;
  organization_name: string | null;
  session_id: string | null;
}

interface AuthState {
  user: SupabaseUser | null;
  profile: EnrichedProfile | null;

  setUser: (user: SupabaseUser | null) => void;
  setProfile: (profile: EnrichedProfile | null) => void;

  clearAuth: () => void;

  // Load enriched profile from RPC by user id
  loadProfile: (userId: string) => Promise<void>;

  // Update profile via RPC; partial updates allowed
  updateProfile: (profileId: string, updates: Partial<EnrichedProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,

      setUser: (user: SupabaseUser | null) => set({ user }),
      setProfile: (profile: EnrichedProfile | null) => set({ profile }),

      clearAuth: () => set({ user: null, profile: null }),

      loadProfile: async (userId: string) => {
        if (!userId) return;
        
        try {
          const { data, error } = await supabase.rpc('get_enriched_profile', {
            _user_id: userId,
          });
          
          if (error) {
            console.error('[loadProfile] RPC error:', error);
            set({ profile: null });
            return;
          }
          
          if (!data || data.length === 0) {
            console.warn('[loadProfile] No profile found for user ID:', userId);
            set({ profile: null });
            return;
          }
          
          set({ profile: data[0] });
        } catch (err) {
          console.error('[loadProfile] Unexpected error:', err);
          set({ profile: null });
        }
      },

      updateProfile: async (profileId: string, updates: Partial<EnrichedProfile>) => {
        if (!profileId) return;
        const payload: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
        const jsonPayload = payload as Json;

        const { error } = await supabase.rpc('update_profiles', {
          _id: profileId,
          _data: jsonPayload,
        });
        
        if (error) {
          console.error('[updateProfile] RPC error:', error);
          throw error;
        }
        
        // Update local store copy optimistically
        const currentProfile = get().profile;
        if (currentProfile) {
          set({ profile: { ...currentProfile, ...updates } });
        }
      },
    }),
    {
      name: 'auth-profile-storage',
      partialize: (state) => ({ profile: state.profile }), // only persist profile, NOT user or tokens
    }
  )
);

console.log('[DEBUG] useAuthStore initialized.');
