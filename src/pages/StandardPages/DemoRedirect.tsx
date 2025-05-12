import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '@/pages/StandardPages/StandardPageComponents/badge';
import type { Database } from '@/lib/database.types';
import { validateUserRole } from '@/lib/utils/validate-user-role';
import type { Organization, JobTitle } from '@/lib/types';
import {
  getDemoSession,
  saveDemoSession,
  type DemoSession,
} from '@/utils/demoBranch';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileWithRelations = ProfileRow & {
  organizations?: Organization[];
  job_titles?: JobTitle[];
};

export function DemoRedirect() {
  const { setUser, setProfile } = useAuthStore();
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // 1) Sign in as your demo account
        const { data: authData, error: authErr } =
          await supabase.auth.signInWithPassword({
            email:    'test@test.com',
            password: 'test123',
          });
        if (authErr || !authData.user)
          throw new Error(authErr?.message || 'Failed to authenticate demo user');
        setUser(authData.user);

        // 2) Reuse or spin up a new demo session
        let session: DemoSession | null = getDemoSession();
        if (!session) {
          session = {
            sessionId: uuidv4(),
            userId:    authData.user.id,
            email:     'test@test.com',
            password:  'test123',
            createdAt: Date.now(),
          };
          const { error: fnErr } = await supabase.functions.invoke(
            'clone_demo_environment',
            { body: { session_id: session.sessionId, user_id: session.userId } }
          );
          if (fnErr) throw new Error(fnErr.message);
          saveDemoSession(session);
        }

        // 3) Load the profile (with its FK relations)
        const profileRes = await supabase
          .from('profiles')
          .select(
            `id, role, full_name, email, username,
             phone, location, avatar_id, avatar_url,
             organization_id, job_title_id,
             organizations(id, name, address, phone, website),
             job_titles(id, title, is_custom)`
          )
          .eq('id', authData.user.id)
          .single();
        if (profileRes.error) throw profileRes.error;
        if (!profileRes.data) throw new Error('Demo profile not found');

        // 4) Cast safely, pull out the first related org & job title
        const pd = profileRes.data as unknown as ProfileWithRelations;
        const org = pd.organizations?.[0] ?? {
          id: '', name: '', address: '', phone: '', website: ''
        };
        const jt  = pd.job_titles?.[0]    ?? {
          id: '', title: '', is_custom: false
        };

        // 5) Map and stash into your global store
        setProfile({
          id:             pd.id,
          user_role:      validateUserRole(pd.role),
          full_name:      pd.full_name,
          email:          pd.email      ?? '',
          username:       pd.username   ?? '',
          phone:          pd.phone      ?? '',
          location:       pd.location   ?? '',
          avatar_id:      pd.avatar_id  ?? null,
          avatar_url:     pd.avatar_url ?? null,
          organization_id:pd.organization_id ?? null,
          job_title_id:   pd.job_title_id    ?? null,
          organizations:  org,
          job_titles:     jt,
        });

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
        — You’re in a sandbox. Changes expire after 12 hrs.
      </div>
      <Navigate to="/dashboard" replace />
    </>
  );
}