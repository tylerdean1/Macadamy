import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';

export default function AuthCallback(): JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    let settled = false;

    const finalizeToDashboard = (): void => {
      if (cancelled || settled) return;
      settled = true;
      navigate('/dashboard', { replace: true });
    };

    const finalizeToLogin = (message: string): void => {
      if (cancelled || settled) return;
      settled = true;
      toast.error(message);
      navigate('/login', { replace: true });
    };

    const completeOAuthSession = async (): Promise<void> => {
      const { data, error } = await supabase.auth.getSession();

      if (cancelled) {
        return;
      }

      if (error) {
        finalizeToLogin('Google sign-in failed. Please try again.');
        return;
      }

      if (data.session?.user) {
        finalizeToDashboard();
        return;
      }

      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          listener.subscription.unsubscribe();
          finalizeToDashboard();
        }
      });

      const timeoutId = window.setTimeout(() => {
        listener.subscription.unsubscribe();
        finalizeToLogin('Google sign-in did not complete. Please try again.');
      }, 5000);

      const unsubscribe = listener.subscription.unsubscribe.bind(listener.subscription);
      listener.subscription.unsubscribe = () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
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
