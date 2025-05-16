import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { validateUserRole } from '@/lib/utils/validate-user-role';
import { getDemoSession, DemoSession } from '@/lib/utils/cloneDemoData';
import type { Profile } from '@/lib/types';

export function useBootstrapAuth(): boolean {
  const { setUser, setProfile, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        console.log('[DEBUG] Bootstrapping auth...');
        const {
          data: sessionData,
          error: sessionError,
        } = await supabase.auth.getSession();

        // No logged-in user?
        if (sessionError || !sessionData.session?.user) {
          console.log('[DEBUG] No active session found');
          clearAuth();
          setIsLoading(false);
          return;
        }

        const user = sessionData.session.user;
        console.log('[DEBUG] Found user session:', user.id);
        setUser(user);

        // Fetch the profile row
        const { data, error } = await supabase
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
            organization_id,
            job_title_id,
            session_id,
            avatars (url)
          `)
          .eq('id', user.id)
          .single();

        if (error || !data) {
          console.error('[ERROR] Failed to load profile during bootstrap:', error);
          clearAuth();
          setIsLoading(false);
          return;
        }

        // Check for a demo session
        const demoSession: DemoSession | null = getDemoSession();
        const isDemo = demoSession?.userId === user.id;

        // Build our Profile object
        const profile: Profile = {
          id: data.id,
          user_role: validateUserRole(data.role),
          full_name: data.full_name,
          email: data.email ?? '',
          username: data.username ?? null,
          phone: data.phone ?? null,
          location: data.location ?? null,
          avatar_id: data.avatar_id ?? null,
          avatar_url: data.avatars?.url ?? null, // ✅ loaded through join
          organization_id: data.organization_id ?? null,
          job_title_id: data.job_title_id ?? null,
          is_demo_user: isDemo,
          session_id: isDemo ? demoSession!.sessionId : data.session_id ?? undefined,
        };

        console.log('[DEBUG] Setting profile in bootstrap:', profile);
        setProfile(profile);
      } catch (err) {
        console.error('[ERROR] Bootstrap auth error:', err);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [setUser, setProfile, clearAuth, navigate]);

  return isLoading;
}
