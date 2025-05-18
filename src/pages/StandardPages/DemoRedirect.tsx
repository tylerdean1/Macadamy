import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/pages/StandardPages/StandardPageComponents/badge';
import { useDemoLogin } from '@/hooks/useDemoLogin';
import { toast } from 'sonner';

export function DemoRedirect() {
  const { setUser } = useAuthStore();
  const demoLogin = useDemoLogin();
  const [loading, setLoading] = useState(true);
  const [setupStep, setSetupStep] = useState<string>('Authenticating demo user...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setSetupStep('Authenticating demo user...');

        // 1. Sign in with demo credentials
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: 'test@test.com',
          password: 'test123',
        });
        
        if (authErr || !authData.user) {
          throw new Error(authErr?.message || 'Failed to authenticate demo user');
        }

        setUser(authData.user);
        setSetupStep('Creating demo environment...');

        // 2. Create a demo environment with a unique session ID
        const { data: demoSessionId, error: demoErr } = await supabase.rpc('create_demo_environment', {
          uid: authData.user.id,
        });

        if (demoErr || !demoSessionId) {
          throw new Error(demoErr?.message || 'Failed creating demo environment');
        }

        setSetupStep('Cloning demo data...');
        
        // 3. Clone demo data using the session ID
        const { error: cloneErr } = await supabase.rpc('execute_full_demo_clone', {
          session_id: demoSessionId,
        });

        if (cloneErr) {
          throw new Error(cloneErr?.message || 'Failed cloning demo data');
        }

        setSetupStep('Loading profile...');
        
        // 4. Load the profile using our useDemoLogin hook
        const profile = await demoLogin(authData.user.id, demoSessionId);
        
        if (!profile) {
          throw new Error('Failed to load demo profile');
        }

        toast.success('Demo environment created successfully');
        setLoading(false);
      } catch (err) {
        console.error('Demo setup error:', err);
        toast.error((err as Error).message || 'Failed to set up demo environment');
        setError((err as Error).message);
        setLoading(false);
      }
    })();
  }, [setUser, demoLogin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <p className="text-gray-300 text-lg">{setupStep}</p>
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
