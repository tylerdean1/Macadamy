// hooks/useBootstrapAuth.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

export function useBootstrapAuth() {
  const { setUser, setProfile } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      const { data: profile } = await supabase
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

      if (profile) {
        setProfile({
          id: profile.id,
          user_role: profile.role,
          full_name: profile.full_name,
          email: profile.email,
          username: profile.username || '',
          phone: profile.phone || '',
          location: profile.location || '',
          avatar_url: profile.avatar_url || '',
          organization_id: profile.organization_id || '',
          job_title_id: profile.job_title_id || '',
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
        });
      }
    };

    initAuth();
  }, [setUser, setProfile]);
}
