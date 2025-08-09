import { useEffect, useState } from 'react';
import { rpcClient } from '@/lib/rpc.client';
import type { EnrichedProfile } from '@/lib/store';

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
  useEffect(() => {
    if (userId == null || userId === '') {
      setProfile(null);
      return;
    }

    const fetchProfile = async (): Promise<void> => {
      try {
        const rows = await rpcClient.filter_profiles({ _filters: { id: userId }, _limit: 1 });
        const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
        if (!row) {
          setProfile(null);
          return;
        }
        const prof: EnrichedProfile = {
          id: row.id,
          full_name: row.full_name,
          email: row.email,
          phone: row.phone,
          role: row.role as unknown as EnrichedProfile['role'],
          job_title_id: row.job_title_id,
          organization_id: row.organization_id,
          avatar_url: row.avatar_url,
          job_title: null,
          organization_name: null,
          created_at: row.created_at,
          updated_at: row.updated_at,
          deleted_at: row.deleted_at,
        };
        setProfile(prof);
      } catch {
        setProfile(null);
      }
    };

    void fetchProfile();
  }, [userId]);

  return profile;
}
