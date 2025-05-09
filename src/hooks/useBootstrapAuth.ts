import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { validateUserRole } from '@/lib/utils/validate-user-role';
import type { Profile } from '@/lib/types';

export function useBootstrapAuth() {
  const { setUser, setProfile, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // ✅ Use getSession instead of getUser to avoid "auth session missing" errors
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) throw new Error(`Error fetching session: ${sessionError.message}`);
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const user = session.user;
        setUser(user);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            role,
            full_name,
            email,
            username,
            phone,
            location,
            avatar_id,
            job_title_id,
            organization_id,
            avatars:avatar_id (
              url
            ),
            organizations:organizations!profiles_organization_id_fkey (
              name, address, phone, website
            ),
            job_titles:job_titles!profiles_job_title_id_fkey (
              title, is_custom
            )
          `)
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw new Error(`Error fetching profile: ${profileError.message}`);
        if (!profile) {
          console.warn('No profile found. Clearing session.');
          await supabase.auth.signOut();
          clearAuth();
          setIsLoading(false);
          return;
        }

        const mappedProfile: Profile = {
          id: profile.id,
          user_role: validateUserRole(profile.role),
          full_name: profile.full_name,
          email: profile.email ?? '',
          username: profile.username ?? '',
          phone: profile.phone ?? '',
          location: profile.location ?? '',
          avatar_id: profile.avatar_id ?? null,
          avatar_url: profile.avatars?.url ?? null,
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
          if (!(error instanceof Error && error.message.includes('Auth session missing'))) {
            console.error('Failed to initialize authentication:', error);
          }
        
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [setUser, setProfile, clearAuth]);

  return isLoading;
}
