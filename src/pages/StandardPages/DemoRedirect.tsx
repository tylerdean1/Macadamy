import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/pages/StandardPages/StandardPageComponents/badge';
import { validateUserRole } from '@/lib/utils/validate-user-role';
import type { Profile } from '@/lib/types';

export function DemoRedirect() {
  const { setUser, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: 'test@test.com',
          password: 'test123',
        });
        if (authErr || !authData.user) throw new Error(authErr?.message || 'Failed to authenticate demo user');

        setUser(authData.user);

        const { data: demoSessionId, error: demoErr } = await supabase.rpc('create_demo_environment', {
          uid: authData.user.id,
        });

        if (demoErr || !demoSessionId) throw new Error(demoErr?.message || 'Failed creating demo environment');

        const { error: cloneErr } = await supabase.rpc('execute_full_demo_clone', {
          session_id: demoSessionId,
        });

        if (cloneErr) throw new Error(cloneErr?.message || 'Failed cloning demo data');

        const profileRes = await supabase
          .from('profiles')
          .select(`
            id, role, full_name, email, username, phone, location, avatar_id, organization_id, job_title_id, session_id,
            organizations (id, name, address, phone, website),
            job_titles (id, title, is_custom),
            avatars (url, is_preset)
          `)
          .eq('id', authData.user.id)
          .single();

        if (profileRes.error) throw profileRes.error;

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
          is_demo_user: true,
          session_id: demoSessionId,
        };

        setProfile(profile);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    })();
  }, [setUser, setProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-background-light p-8 rounded-lg border border-background-lighter max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-4">Demo Setup Failed</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full text-center bg-yellow-400/90 text-black py-2 text-sm">
        <Badge className="bg-black/80 text-yellow-300 px-2 py-0.5 rounded-full">
          DEMO USER
        </Badge>{' '}
        — You're in a sandbox. Changes expire after 12 hrs.
      </div>
      <Navigate to="/dashboard" replace />
    </>
  );
}
