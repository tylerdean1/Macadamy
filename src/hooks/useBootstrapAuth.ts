import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

/**
 * Hook to initialize auth state by listening to Supabase auth changes,
 * update the Zustand store, and manage app loading status and initial navigation.
 */
export function useBootstrapAuth(): boolean {
  const {
    setUser,
    loadProfile,
    user,
    profile,
    isLoading: authStoreLoading,
    clearAuth,
    setIsLoading, // Assuming setIsLoading is part of your store
  } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true); // Set loading true at the start of the effect
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const supabaseUser = session?.user ?? null;
        setUser(supabaseUser);

        if (event === "PASSWORD_RECOVERY") {
          console.log(
            "[useBootstrapAuth] Password recovery event detected, navigating to /update-password",
          );
          navigate("/update-password"); // Navigate to the new UpdatePassword page
          setIsLoading(false);
          return;
        }

        if (supabaseUser) {
          await loadProfile(supabaseUser.id); // loadProfile should handle its own loading state internally
        } else {
          clearAuth(); // clearAuth should set isLoading to false
        }
        // If neither user nor loadProfile/clearAuth sets loading to false, do it here.
        // However, it'''s better if loadProfile and clearAuth manage this.
        // For now, let'''s assume they do. If not, uncomment the line below.
        // setIsLoading(false);
      },
    );

    return () => {
      authListener?.subscription.unsubscribe(); // Correct way to unsubscribe
    };
  }, [setUser, loadProfile, clearAuth, setIsLoading]);

  useEffect(() => {
    if (authStoreLoading === false) {
      // If a user exists but their profile hasn'''t been loaded or is incomplete,
      // navigate them to the onboarding page to complete their profile.
      // We assume that /onboarding is the correct route for profile creation/completion.
      if (user && profile === null) {
        // Explicitly check profile for null
        console.log(
          "[useBootstrapAuth] User exists, but no profile, navigating to /onboarding.",
        );
        navigate("/onboarding"); // Navigate to the existing onboarding route
      }
      // If there'''s no user (!user), we no longer navigate from here.
      // Access to protected routes will be handled by the ProtectedRoute component,
      // which should redirect to the landing page ('/') if the user is not authenticated.
      // Public routes like '/', '/reset-password', etc., will remain accessible.
    }
  }, [user, profile, authStoreLoading, navigate]);

  return authStoreLoading;
}
