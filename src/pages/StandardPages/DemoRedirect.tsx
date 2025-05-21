import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Badge } from '@/pages/StandardPages/StandardPageComponents/badge';

export default function DemoRedirect() {
  // Cast loginAsDemoUser to the correct function type
  const { loginAsDemoUser: loginAsDemoUserRaw, loading: authLoading, error: authErrorHook, profile } = useAuth();
  const loginAsDemoUser = loginAsDemoUserRaw as (() => Promise<unknown>);
  const [isLoadingLocally, setIsLoadingLocally] = useState(true);
  const [errorLocally, setErrorLocally] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const attemptDemoLogin = async () => {
      if (!isMounted) return;
      setIsLoadingLocally(true);
      setErrorLocally(null);
      try {
        const demoProfile = await loginAsDemoUser();
        if ((typeof demoProfile !== 'object' || demoProfile === null) && (!(typeof authErrorHook === 'string' && authErrorHook.length > 0))) {
          const genericMessage = 'Failed to set up demo environment. Please try again.';
          setErrorLocally(genericMessage);
          toast.error(genericMessage);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'An unexpected error occurred during demo setup.';
          setErrorLocally(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingLocally(false);
        }
      }
    };
    void attemptDemoLogin();
    return () => {
      isMounted = false;
    };
  }, [loginAsDemoUser]);

  if (isLoadingLocally === true || authLoading === true) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <p className="text-gray-300 text-lg">Setting up your demo environment...</p>
      </div>
    );
  }

  const displayError = typeof errorLocally === 'string' && errorLocally.length > 0
    ? errorLocally
    : (typeof authErrorHook === 'string' && authErrorHook.length > 0 ? authErrorHook : '');
  if (displayError.length > 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-background-light p-8 rounded-lg border border-background-lighter max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-4">Demo Setup Failed</h2>
          <p className="text-gray-400 mb-6">{displayError}</p>
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

  if (typeof profile === 'object' && profile !== null) {
    return (
      <>
        <div className="w-full text-center bg-yellow-400/90 text-black py-2 text-sm">
          <Badge className="bg-black/80 text-yellow-300 px-2 py-0.5 rounded-full">
            DEMO USER
          </Badge>{' '}
          You&apos;re in a sandbox. Changes expire after 12 hrs.
        </div>
        <Navigate to="/dashboard" replace />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <p className="text-gray-300 text-lg">Finalizing demo session...</p>
    </div>
  );
}
