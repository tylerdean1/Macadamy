import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database, Json } from '@/lib/database.types';
import { useAuthStore } from '@/lib/store';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

export type EnrichedProfile = Profile & {
  role: UserRole;
};

interface SaveProfilePayload {
  full_name?: string;
  email?: string;
  username?: string;
  phone?: string;
  location?: string;
  role?: UserRole;
  organization_id?: string;
  job_title_id?: string;
  custom_job_title?: string; // if present, triggers job title insert
  avatar_url?: string;       // used for custom avatars
  avatar_id?: string;
  is_preset?: boolean;
  created_by?: string;
  session_id?: string | null;
}

// Type guard for EnrichedProfile
function isEnrichedProfile(profile: unknown): profile is EnrichedProfile {
  return profile !== null &&
         typeof profile === 'object' &&
         'role' in profile &&
         typeof (profile as EnrichedProfile).full_name === 'string';
}

export function useProfileEdit() {
  const { user, profile, setProfile } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProfile = async (updates: SaveProfilePayload) => {
    if (!user || !profile) return;

    setIsSaving(true);
    setError(null);

    try {
      const typedProfile = isEnrichedProfile(profile) ? profile : null;

      if (!typedProfile) {
        setError('Profile data is incomplete or invalid.');
        setIsSaving(false);
        return;
      }

      const payload: Record<string, unknown> = {
        full_name: updates.full_name ?? typedProfile.full_name,
        email: updates.email ?? typedProfile.email,
        username: updates.username ?? typedProfile.username,
        phone: updates.phone ?? typedProfile.phone,
        location: updates.location ?? typedProfile.location,
        role: updates.role ?? typedProfile.role,
        organization_id: updates.organization_id ?? typedProfile.organization_id,
        job_title_id: updates.job_title_id ?? typedProfile.job_title_id,
        avatar_id: updates.avatar_id ?? typedProfile.avatar_id,
        avatar_url: updates.avatar_url ?? null,
        is_preset: updates.is_preset ?? true,
        job_title: updates.custom_job_title ?? null,
        is_custom: updates.custom_job_title ? true : false,
        created_by: updates.created_by ?? user.id,
        session_id: updates.session_id ?? typedProfile.session_id ?? null,
      };

      const jsonPayload = payload as Json;

      const { error: updateError } = await supabase.rpc('update_profiles', {
        _id: typedProfile.id,
        _data: jsonPayload,
      });

      if (updateError) throw updateError;

      setProfile({ ...typedProfile, ...updates });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[useProfileEdit]', errorMessage);
      setError(errorMessage || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return { saveProfile, isSaving, error };
}