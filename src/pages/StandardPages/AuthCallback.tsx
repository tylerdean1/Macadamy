import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';

const MAX_ATTEMPTS = 20;
const RETRY_DELAY_MS = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default function AuthCallback(): JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const completeOAuthSession = async (): Promise<void> => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const { data, error } = await supabase.auth.getSession();

        if (cancelled) {
          return;
        }

        if (error) {
          toast.error('Google sign-in failed. Please try again.');
          navigate('/login', { replace: true });
          return;
        }

        if (data.session?.user) {
          navigate('/dashboard', { replace: true });
          return;
        }

        await sleep(RETRY_DELAY_MS);
      }

      if (!cancelled) {
        toast.error('Google sign-in did not complete. Please try again.');
        navigate('/login', { replace: true });
      }
    };

    void completeOAuthSession();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-400 mt-4">Completing sign-in…</p>
      </div>
    </div>
  );
}
