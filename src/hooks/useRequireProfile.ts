import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

/**
 * This hook ensures that a valid profile is loaded.
 * If no profile is found (but the user is logged in),
 * it signs out the session and redirects to the homepage.
 */
export function useRequireProfile() {
  const navigate = useNavigate();
  const { profile, clearAuth } = useAuthStore();

  useEffect(() => {
    const handleMissingProfile = async () => {
      if (profile === null) {
        console.warn('No profile found. Signing out and redirecting to home.');
        await supabase.auth.signOut();
        clearAuth();
        navigate('/');
      }
    };

    handleMissingProfile();
  }, [profile, clearAuth, navigate]);
}
