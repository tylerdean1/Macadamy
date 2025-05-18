import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type UserRole = Database['public']['Enums']['user_role'];

export interface EnrichedProfile {
  id: string;
  full_name: string;
  username: string | null;
  email: string;
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

export function useLoadProfile(userId: string | null): EnrichedProfile | null {
  const [profile, setProfile] = useState<EnrichedProfile | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase.rpc('get_enriched_profile', {
        _user_id: userId,
      });

      if (error || !data) {
        console.error('Failed to fetch enriched profile:', error);
        return;
      }

      setProfile(data[0]);
    };

    fetchProfile();
  }, [userId]);

  return profile;
}
