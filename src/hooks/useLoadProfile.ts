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
      setProfile(null); // Clear profile if no userId
      return;
    }

    const fetchProfile = async (): Promise<void> => {
      try {
        const data = await rpcClient.getEnrichedProfile({
          _user_id: userId,
        });

        if (!data) {
          console.warn('[useLoadProfile] No profile data found for user ID:', userId);
          setProfile(null);
          return;
        }

        setProfile(data as EnrichedProfile); // Assuming data matches EnrichedProfile
      } catch (e) {
        console.error('[useLoadProfile] Unexpected error fetching profile:', e);
        setProfile(null);
      }
    };

    void fetchProfile();
  }, [userId]);

  return profile;
}
