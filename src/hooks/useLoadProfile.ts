import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { validateUserRole } from '@/lib/utils/validate-user-role';
import type { Profile } from '@/lib/types';

export function useLoadProfile() {
  const { setProfile } = useAuthStore();

  return async function loadProfile(userId: string): Promise<Profile | null> {
    const profileRes = await supabase
      .from('profiles')
      .select(
        `id, role, full_name, email, username, phone, location, avatar_id, organization_id, job_title_id,
         organizations:organization_id (id, name, address, phone, website),
         job_titles:job_title_id (id, title, is_custom),
         avatars:avatar_id (url)`
      )
      .eq('id', userId)
      .single();

    if (profileRes.error || !profileRes.data) {
      console.error('Failed to load profile:', profileRes.error);
      return null;
    }

    const pd = profileRes.data;

    const profile: Profile = {
      id: pd.id,
      user_role: validateUserRole(pd.role),
      full_name: pd.full_name,
      email: pd.email ?? '',
      username: pd.username,
      phone: pd.phone,
      location: pd.location,
      avatar_id: pd.avatar_id,
      avatar_url: pd.avatars?.url ?? null,
      organization_id: pd.organization_id,
      job_title_id: pd.job_title_id,
      organizations: pd.organizations || null,
      job_titles: pd.job_titles || null,
      is_demo_user: false,
      session_id: null,
    };

    setProfile(profile);
    return profile;
  };
}
