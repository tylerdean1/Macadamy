// filepath: c:\Users\tyler\OneDrive\Desktop\Macadamy\public\src\pages\StandardPages\DemoRedirect.tsx
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { Badge } from '@/pages/StandardPages/StandardPageComponents/badge';

export default function DemoRedirect() {
  // Get demo-specific functions from useAuth
  const { loginAsDemoUser, profile } = useAuth();
  // Get detailed loading states and errors directly from the auth store
  const { loading, error } = useAuthStore();
  const isLoading = loading.demo || loading.auth || loading.profile;

  // Debug logging
  console.log("[DemoRedirect] Component state:", {
    hasProfile: !!profile,
    loading: { ...loading },
    error,
    isLoading
  });

  useEffect(() => {
    let isMounted = true;

    const attemptDemoLogin = async () => {
      if (!isMounted) return;

      try {
        // The loading state is now managed by the demo login function in the store
        await loginAsDemoUser();
        // No need to check the result since error handling is now centralized in the auth store
      } catch (err) {
        // This catch block is just a safety net as the main error handling is in useDemoLogin
        if (isMounted && (error === null || error === '')) {
          const message = err instanceof Error ? err.message : 'An unexpected error occurred during demo setup.';
          toast.error(message);
        }
      }
    };

    void attemptDemoLogin();
    return () => {
      isMounted = false;
    };
  }, [loginAsDemoUser, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <p className="text-gray-300 text-lg">
          {loading.demo ? "Setting up your demo environment..." :
            loading.auth ? "Authenticating demo user..." :
              loading.profile ? "Loading your profile..." : "Preparing demo..."}
        </p>
      </div>
    );
  }

  if (error !== null && error !== '') {
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
