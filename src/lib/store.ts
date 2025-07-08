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
}

export interface LoadingState {
  initialization: boolean;
  auth: boolean;
  profile: boolean;
}

export type AuthState = {
  user: SupabaseUser | null;
  profile: EnrichedProfile | null;
  loading: LoadingState;
  error: string | null;
  setLoading: (loadingState: Partial<LoadingState>) => void;
  setError: (error: string | null) => void;
  setUser: (user: SupabaseUser | null) => void;
  setProfile: (profile: EnrichedProfile | null) => void;
  clearAuth: () => void;
  resetLoadingStates: () => void; // New function to clear loading states if they get stuck
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (
    profileId: string,
    updates: Partial<EnrichedProfile>,
  ) => Promise<void>;

  // Deprecated - for backwards compatibility
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: {
        initialization: false, // Set to false by default - will be set to true during active initialization
        auth: false,
        profile: false,
      },
      error: null,
      isLoading: false, // Deprecated but kept for backward compatibility

      setLoading: (loadingState: Partial<LoadingState>): void =>
        set(state => {
          // Calculate the overall loading state
          const newLoadingState = { ...state.loading, ...loadingState };
          const isAnyLoading = Object.values(newLoadingState).some(Boolean);

          return {
            ...state,
            loading: newLoadingState,
            isLoading: isAnyLoading, // Update legacy isLoading based on any loading flags
          };
        }),

      setIsLoading: (isLoading: boolean): void =>
        set(state => {
          // If setting to true, we assume it's initialization
          // If setting to false, we clear all loading flags
          const newLoadingState = isLoading
            ? { ...state.loading, initialization: true }
            : { initialization: false, auth: false, profile: false };

          return {
            ...state,
            loading: newLoadingState,
            isLoading, // Update legacy isLoading
          };
        }),

      setError: (error: string | null): void => set({ error }),

      setUser: (user: SupabaseUser | null): void =>
        set((state) => ({
          ...state,
          user,
        })),

      setProfile: (profile: EnrichedProfile | null): void =>
        set((state) => ({ ...state, profile })),

      clearAuth: (): void =>
        set({
          user: null,
          profile: null,
          loading: { initialization: false, auth: false, profile: false },
          isLoading: false,
          error: null
        }),

      // Helper function to force clear loading states if they get stuck
      resetLoadingStates: (): void =>
        set(state => ({
          ...state,
          loading: { initialization: false, auth: false, profile: false },
          isLoading: false,
        })),

      loadProfile: async (userId: string): Promise<void> => {
        if (typeof userId !== 'string' || userId.length === 0) {
          set(state => ({
            ...state,
            profile: null,
            loading: { ...state.loading, profile: false },
            isLoading: state.loading.initialization || state.loading.auth,
            error: "Invalid user ID provided"
          }));
          return;
        }

        // Set profile loading to true
        set(state => ({
          ...state,
          loading: { ...state.loading, profile: true },
          isLoading: true
        }));

        try {
          const data = await rpcClient.getEnrichedProfile({ _user_id: userId });

          if (!data || typeof data !== 'object') {
            set(state => ({
              ...state,
              profile: null,
              loading: { ...state.loading, profile: false },
              isLoading: state.loading.initialization || state.loading.auth,
              error: "Failed to load user profile"
            }));
            return;
          }

          // Profile loaded successfully
          set(state => ({
            ...state,
            profile: data as EnrichedProfile,
            loading: { ...state.loading, profile: false },
            isLoading: state.loading.initialization || state.loading.auth,
            error: null
          }));
        } catch (err) {
          console.error("Error loading profile:", err);
          set(state => ({
            ...state,
            profile: null,
            loading: { ...state.loading, profile: false },
            isLoading: state.loading.initialization || state.loading.auth,
            error: err instanceof Error ? err.message : "Error loading profile"
          }));
        }
      },

      updateProfile: async (
        profileId: string,
        updates: Partial<EnrichedProfile>,
      ): Promise<void> => {
        if (!profileId) {
          set(state => ({
            ...state,
            error: "Invalid profile ID provided"
          }));
          return;
        }

        // Set profile loading to true for update
        set(state => ({
          ...state,
          loading: { ...state.loading, profile: true },
          isLoading: true
        }));

        try {
          const rpcArgs = {
            _id: profileId,
            _full_name: updates.full_name ?? undefined,
            _username: updates.username ?? undefined,
            _email: updates.email ?? undefined,
            _phone: updates.phone ?? undefined,
            _location: updates.location ?? undefined,
            _role: updates.role ?? undefined,
            _job_title_id: updates.job_title_id ?? undefined,
            _organization_id: updates.organization_id ?? undefined,
            _avatar_id: updates.avatar_id ?? undefined,
          };

          await rpcClient.updateProfileFull(rpcArgs);
          const currentProfile = get().profile;

          if (currentProfile && typeof currentProfile === 'object') {
            set((state) => ({
              ...state,
              profile: { ...currentProfile, ...updates },
              loading: { ...state.loading, profile: false },
              isLoading: state.loading.initialization || state.loading.auth,
              error: null
            }));
          } else {
            set(state => ({
              ...state,
              loading: { ...state.loading, profile: false },
              isLoading: state.loading.initialization || state.loading.auth,
              error: "Profile not found for update"
            }));
          }
        } catch (err) {
          console.error("Error updating profile:", err);
          set(state => ({
            ...state,
            loading: { ...state.loading, profile: false },
            isLoading: state.loading.initialization || state.loading.auth,
            error: err instanceof Error ? err.message : "Error updating profile"
          }));
        }
      },
    }),
    {
      name: "auth-profile-storage",
      partialize: (state) => ({ profile: state.profile, user: state.user }), // Persist user as well
    },
  ),
);

// Add more detailed debug logging
console.log("[DEBUG] useAuthStore initialized with state:", {
  user: "Not logged yet",
  profile: "Not logged yet",
  loading: useAuthStore.getState().loading,
  isLoading: useAuthStore.getState().isLoading,
});

// Set up a state listener to track loading state changes
if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
  useAuthStore.subscribe((state) => {
    console.log("[DEBUG] Auth store state changed:", {
      loading: state.loading,
      isLoading: state.isLoading
    });
  });
}
