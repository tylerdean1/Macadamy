import { useEffect, useMemo, useState } from 'react';
import { rpcClient } from '@/lib/rpc.client';
import type { EnrichedProfile } from '@/lib/store';
import { useAuthStore } from '@/lib/store';

/**
 * Custom hook to load an enriched profile for a given user ID.
 * Note: Consider using `useAuthStore` for managing the authenticated user's profile,
 * as this hook provides local state and might be redundant if the profile
 * is already managed globally by `useAuthStore`.
 * This hook could be useful for loading profiles of users other than the authenticated one,
 * if that's a requirement.
 */
export function useLoadProfile(userId: string | null): EnrichedProfile | null {
  const [profile, setProfile] = useState<EnrichedProfile | null>(null);
  const { user: currentUser, profile: currentProfile } = useAuthStore();
  const canViewOthers = useMemo(() => {
    const role = currentProfile?.role ?? null;
    return role === 'system_admin' || role === 'org_admin' || role === 'org_supervisor';
  }, [currentProfile?.role]);

  useEffect(() => {
    if (userId == null || userId === '') {
      setProfile(null);
      return;
    }

    const resolveAvatarUrl = async (avatarId: string | null): Promise<string | null> => {
      if (!avatarId) return null;
      const data = await rpcClient.get_avatar_by_id_public({ p_avatar_id: avatarId });
      return typeof data?.url === 'string' ? data.url : null;
    };

    const fetchProfile = async (): Promise<void> => {
      try {
        const currentUserId = currentUser?.id ?? null;
        const isCurrentUser = currentUserId != null && currentUserId === userId;
        if (isCurrentUser) {
          const row = await rpcClient.get_my_profile();
          if (!row) {
            setProfile(null);
            return;
          }
          const avatarUrl = await resolveAvatarUrl(row.avatar_id ?? null);
          const prof: EnrichedProfile = {
            id: row.id,
            full_name: row.full_name,
            email: row.email,
            phone: row.phone,
            location: row.location,
            role: row.role as unknown as EnrichedProfile['role'],
            job_title_id: null,
            organization_id: row.organization_id,
            organization_address: null,
            avatar_id: row.avatar_id,
            avatar_url: avatarUrl,
            job_title: null,
            organization_name: null,
            created_at: row.created_at,
            updated_at: row.updated_at,
            deleted_at: row.deleted_at,
            profile_completed_at: row.profile_completed_at ?? null,
          };
          setProfile(prof);
          return;
        }

        const orgReady = Boolean(currentProfile?.organization_id) && Boolean(currentProfile?.profile_completed_at);
        if (!orgReady || !canViewOthers) {
          setProfile(null);
          return;
        }

        const rows = await rpcClient.filter_profiles({ _filters: { id: userId }, _limit: 1 });
        const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
        if (!row) {
          setProfile(null);
          return;
        }
        const avatarUrl = await resolveAvatarUrl(row.avatar_id ?? null);
        const prof: EnrichedProfile = {
          id: row.id,
          full_name: row.full_name,
          email: row.email,
          phone: row.phone,
          location: row.location,
          role: row.role as unknown as EnrichedProfile['role'],
          job_title_id: null,
          organization_id: row.organization_id,
          organization_address: null,
          avatar_id: row.avatar_id,
          avatar_url: avatarUrl,
          job_title: null,
          organization_name: null,
          created_at: row.created_at,
          updated_at: row.updated_at,
          deleted_at: row.deleted_at,
          profile_completed_at: row.profile_completed_at ?? null,
        };
        setProfile(prof);
      } catch {
        setProfile(null);
      }
    };

    void fetchProfile();
  }, [userId, currentUser?.id, currentProfile?.organization_id, currentProfile?.profile_completed_at, canViewOthers]);

  return profile;
}
