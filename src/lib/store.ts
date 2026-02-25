import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { rpcClient } from "@/lib/rpc.client";
import type { UserRoleType } from "@/lib/types";

// Types - using imported types from types.ts for consistency

export interface EnrichedProfile {
  id: string;
  full_name: string | null; // Allow null as per database
  email: string;
  phone: string | null;
  location: string | null;
  role: UserRoleType | null; // Allow role to be null
  job_title_id: string | null;
  organization_id: string | null;
  organization_address: string | null;
  avatar_id: string | null;
  avatar_url: string | null; // Derived from avatars table
  job_title: string | null; // Enriched field from job_titles.name
  organization_name: string | null; // Enriched field from organizations.name
  created_at: string | null;
  updated_at: string;
  deleted_at: string | null;
  profile_completed_at: string | null;
}

async function resolveAvatarUrl(avatarId: string | null): Promise<string | null> {
  if (!avatarId) return null;
  try {
    const data = await rpcClient.get_avatar_by_id_public({ p_avatar_id: avatarId });
    return typeof data?.url === 'string' ? data.url : null;
  } catch (error) {
    console.error("Error resolving avatar URL:", error);
    return null;
  }
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

  // Dashboard-specific UI: currently selected organization filter (null = All orgs)
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (orgId: string | null) => void;

  // Deprecated - for backwards compatibility
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

// helper to strip surrounding quotes from UUIDs that might accidentally get stored
function stripUuidQuotes(value: string | null | undefined): string | null {
  if (!value) return null;
  const s = value.toString();
  return s.replace(/^"|"$/g, '');
}

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
      // Default dashboard org filter (null => All organizations)
      selectedOrganizationId: null,

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
        set((state) => ({
          ...state,
          profile: profile
            ? {
              ...profile,
              id: stripUuidQuotes(profile.id) ?? profile.id,
              job_title_id: stripUuidQuotes(profile.job_title_id),
              organization_id: stripUuidQuotes(profile.organization_id),
              avatar_id: stripUuidQuotes(profile.avatar_id),
            }
            : null
        })),

      setSelectedOrganizationId: (orgId: string | null): void =>
        set((state) => ({ ...state, selectedOrganizationId: orgId })),

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
          const currentUserId = get().user?.id ?? null;
          const isCurrentUser = currentUserId != null && currentUserId === userId;

          const row = isCurrentUser ? await rpcClient.get_my_profile() : null;

          const sourceRow = row ?? null;
          if (!sourceRow && !isCurrentUser) {
            const currentProfile = get().profile;
            const orgReady = Boolean(currentProfile?.organization_id) && Boolean(currentProfile?.profile_completed_at);
            const role = currentProfile?.role ?? null;
            const canViewOthers = role === 'system_admin' || role === 'org_admin' || role === 'org_supervisor';
            if (!orgReady || !canViewOthers) {
              set(state => ({
                ...state,
                profile: null,
                loading: { ...state.loading, profile: false },
                isLoading: state.loading.initialization || state.loading.auth,
                error: null
              }));
              return;
            }

            const rows = await rpcClient.filter_profiles({ _filters: { id: userId }, _limit: 1 });
            const first = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
            if (!first) {
              set(state => ({
                ...state,
                profile: null,
                loading: { ...state.loading, profile: false },
                isLoading: state.loading.initialization || state.loading.auth,
                error: "Failed to load user profile"
              }));
              return;
            }

            const avatarUrl = await resolveAvatarUrl(first.avatar_id);
            const sanitize = (field: string | null | undefined) => {
              if (typeof field === 'string' && /^".*"$/.test(field)) {
                console.warn('stripUuidQuotes: found quoted value', field);
              }
              return stripUuidQuotes(field);
            };

            const prof: EnrichedProfile = {
              id: sanitize(first.id) as string,
              full_name: first.full_name,
              email: first.email,
              phone: first.phone,
              location: first.location,
              role: first.role as unknown as EnrichedProfile['role'],
              job_title_id: null,
              organization_id: sanitize(first.organization_id),
              organization_address: null,
              avatar_id: sanitize(first.avatar_id),
              avatar_url: avatarUrl,
              job_title: null,
              organization_name: null,
              created_at: first.created_at,
              updated_at: first.updated_at,
              deleted_at: first.deleted_at,
              profile_completed_at: first.profile_completed_at ?? null,
            };

            set(state => ({
              ...state,
              profile: prof,
              loading: { ...state.loading, profile: false },
              isLoading: state.loading.initialization || state.loading.auth,
              error: null
            }));
            return;
          }

          if (!sourceRow) {
            set(state => ({
              ...state,
              profile: null,
              loading: { ...state.loading, profile: false },
              isLoading: state.loading.initialization || state.loading.auth,
              error: "Failed to load user profile"
            }));
            return;
          }

          // sanitize returned uuids and log unexpected quotes
          const sanitize = (field: string | null | undefined) => {
            if (typeof field === 'string' && /^".*"$/.test(field)) {
              console.warn('stripUuidQuotes: found quoted value', field);
            }
            return stripUuidQuotes(field);
          };

          const avatarUrl = await resolveAvatarUrl(sourceRow.avatar_id);
          const prof: EnrichedProfile = {
            id: sanitize(sourceRow.id) as string,
            full_name: sourceRow.full_name,
            email: sourceRow.email,
            phone: sourceRow.phone,
            location: sourceRow.location,
            role: sourceRow.role as unknown as EnrichedProfile['role'],
            job_title_id: null,
            organization_id: sanitize(sourceRow.organization_id),
            organization_address: null,
            avatar_id: sanitize(sourceRow.avatar_id),
            avatar_url: avatarUrl,
            job_title: null,
            organization_name: null,
            created_at: sourceRow.created_at,
            updated_at: sourceRow.updated_at,
            deleted_at: sourceRow.deleted_at,
            profile_completed_at: sourceRow.profile_completed_at ?? null,
          };

          set(state => ({
            ...state,
            profile: prof,
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
          const inputPayload: Record<string, unknown> = {
            full_name: updates.full_name ?? undefined,
            email: updates.email ?? undefined,
            phone: updates.phone ?? undefined,
            role: updates.role ?? undefined,
            organization_id: updates.organization_id ?? undefined,
            avatar_id: updates.avatar_id ?? undefined,
            profile_completed_at: updates.profile_completed_at ?? undefined,
          };

          Object.keys(inputPayload).forEach((key) => {
            const K = key as keyof typeof inputPayload;
            if (inputPayload[K] === undefined) {
              delete inputPayload[K];
            }
          });

          await rpcClient.update_profiles({
            _id: profileId,
            _input: inputPayload as Database['public']['Functions']['update_profiles']['Args']['_input']
          });
          const currentProfile = get().profile;

          if (currentProfile && typeof currentProfile === 'object') {
            const nextAvatarUrl = typeof updates.avatar_id !== 'undefined'
              ? await resolveAvatarUrl(updates.avatar_id ?? null)
              : currentProfile.avatar_url;
            set((state) => ({
              ...state,
              profile: { ...currentProfile, ...updates, avatar_url: nextAvatarUrl },
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

// Dev-only debug logs gated behind localStorage DEBUG_AUTH=1
try {
  const debugAuth =
    typeof window !== 'undefined' &&
    typeof localStorage !== 'undefined' &&
    localStorage.getItem('DEBUG_AUTH') === '1';
  if (import.meta.env?.DEV && debugAuth) {
    console.log("[DEBUG] useAuthStore initialized with state:", {
      user: "Not logged yet",
      profile: "Not logged yet",
      loading: useAuthStore.getState().loading,
      isLoading: useAuthStore.getState().isLoading,
    });
    useAuthStore.subscribe((state) => {
      console.log("[DEBUG] Auth store state changed:", {
        loading: state.loading,
        isLoading: state.isLoading
      });
    });
  }
} catch {
  // no-op
}
