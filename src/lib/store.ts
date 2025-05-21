import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { rpcClient } from "@/lib/rpc.client";
import type { Database } from "@/lib/database.types";

// Types
type UserRole = Database["public"]["Enums"]["user_role"];

export interface EnrichedProfile {
  id: string;
  full_name: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  role: UserRole | null; // Allow role to be null
  job_title_id: string | null;
  organization_id: string | null;
  avatar_id: string | null;
  avatar_url: string | null;
  job_title: string | null;
  organization_name: string | null;
  session_id: string | null;
}

export type AuthState = {
  user: SupabaseUser | null;
  profile: EnrichedProfile | null;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void; // Add setIsLoading action
  setUser: (user: SupabaseUser | null) => void;
  setProfile: (profile: EnrichedProfile | null) => void;
  clearAuth: () => void;
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (
    profileId: string,
    updates: Partial<EnrichedProfile>,
  ) => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true, // Initialize isLoading to true

      setIsLoading: (isLoading: boolean): void => set({ isLoading }), // Implement setIsLoading

      setUser: (user: SupabaseUser | null): void =>
        set((state) => ({
          ...state,
          user,
        })),

      setProfile: (profile: EnrichedProfile | null): void =>
        set((state) => ({ ...state, profile })),

      clearAuth: (): void =>
        set({ user: null, profile: null, isLoading: false }),

      loadProfile: async (userId: string): Promise<void> => {
        if (typeof userId !== 'string' || userId.length === 0) {
          set({ profile: null, isLoading: false });
          return;
        }
        set((state) => ({ ...state, isLoading: true }));
        try {
          // Use rpcClient directly, remove 'as any'
          const data = await rpcClient.getEnrichedProfile({ _user_id: userId });
          if (!data || typeof data !== 'object') {
            set({ profile: null, isLoading: false });
            return;
          }
          set({ profile: data as EnrichedProfile, isLoading: false });
        } catch {
          set({ profile: null, isLoading: false });
        }
      },

      updateProfile: async (
        profileId: string,
        updates: Partial<EnrichedProfile>,
      ): Promise<void> => {
        if (!profileId) return;
        try {
          const rpcArgs = {
            p_id: profileId,
            // In updateProfile, use rpcClient directly and remove 'as any'
            p_created_by: get().user?.id ?? '',
            p_session_id: get().profile?.session_id ?? '',
          };
          const fullRpcArgs = {
            ...rpcArgs,
            ...(updates.full_name !== undefined && { p_full_name: updates.full_name ?? undefined }),
            ...(updates.username !== undefined && { p_username: updates.username ?? undefined }),
            ...(updates.email !== undefined && { p_email: updates.email ?? undefined }),
            ...(updates.phone !== undefined && { p_phone: updates.phone ?? undefined }),
            ...(updates.location !== undefined && { p_location: updates.location ?? undefined }),
            ...(updates.role !== undefined && { p_role: updates.role ?? undefined }),
            ...(updates.job_title_id !== undefined && { p_job_title_id: updates.job_title_id ?? undefined }),
            ...(updates.organization_id !== undefined && { p_organization_id: updates.organization_id ?? undefined }),
            ...(updates.avatar_id !== undefined && { p_avatar_id: updates.avatar_id ?? undefined }),
          };
          await rpcClient.updateProfileFull(fullRpcArgs);
          const currentProfile = get().profile;
          if (currentProfile && typeof currentProfile === 'object') {
            set((state) => ({
              ...state,
              profile: { ...currentProfile, ...updates },
            }));
          }
        } catch {
          // swallow
        }
      },
    }),
    {
      name: "auth-profile-storage",
      partialize: (state) => ({ profile: state.profile, user: state.user }), // Persist user as well
    },
  ),
);

console.log("[DEBUG] useAuthStore initialized.");
