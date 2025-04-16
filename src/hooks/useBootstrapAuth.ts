import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { validateUserRole } from '@/lib/utils/validate-user-role';
import type { Profile } from '@/lib/types';

export function useBootstrapAuth() {
  const { setUser, setProfile } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw new Error(`Error fetching user: ${userError.message}`);
        if (!user) return;

        setUser(user);

        // Fetch the profile from the database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            organizations:organizations!profiles_organization_id_fkey (
              name, address, phone, website
            ),
            job_titles:job_titles!profiles_job_title_id_fkey (
              title, is_custom
            )
          `)
          .eq('id', user.id)
          .single();

        if (profileError) throw new Error(`Error fetching profile: ${profileError.message}`);
        if (!profile) return;

        // Map profile data to the Profile type
        const mappedProfile: Profile = {
          id: profile.id,
          user_role: validateUserRole(profile.role), // Use the validateUserRole function here
          full_name: profile.full_name,
          email: profile.email,
          username: profile.username ?? '',
          phone: profile.phone ?? '',
          location: profile.location ?? '',
          avatar_url: profile.avatar_url ?? '',
          organization_id: profile.organization_id ?? '',
          job_title_id: profile.job_title_id ?? '',
          organizations: profile.organizations ?? {
            name: '',
            address: '',
            phone: '',
            website: ''
          },
          job_titles: profile.job_titles ?? {
            title: '',
            is_custom: null
          }
        };

        setProfile(mappedProfile);
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
      }
    };

    initAuth();
  }, [setUser, setProfile]);
}