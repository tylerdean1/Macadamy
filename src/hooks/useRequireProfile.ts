import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

/**
 * This hook ensures that a user has a loaded profile.
 * If a user is authenticated but their profile is not available after loading attempts,
 * it signs out the user and redirects to the homepage.
 * This hook should be used on pages that absolutely require a profile to function.
 */
export function useRequireProfile(): void {
  const navigate = useNavigate();
  const { user, profile, isLoading, clearAuth } = useAuthStore((state) => ({
    user: state.user,
    profile: state.profile,
    isLoading: state.isLoading,
    clearAuth: state.clearAuth,
  }));

  useEffect(() => {
    // Only proceed if the authentication and profile loading process has finished
    if (isLoading) {
      console.log("[useRequireProfile] Auth/profile state is loading. Waiting...");
      return;
    }

    console.log("[useRequireProfile] Auth/profile state resolved:", {
      user: !!user,
      profile: !!profile,
      isLoading,
    });      // If there is an authenticated user but no profile after loading has completed
    if (user && !profile) {
      console.warn(
        "[useRequireProfile] User is authenticated, but no profile found after loading. Signing out.",
      );
      const performSignOut = async (): Promise<void> => {
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error("[useRequireProfile] Error during signOut:", signOutError);
        }
        clearAuth(); // Clear local auth state
        navigate("/", { replace: true }); // Redirect to homepage
      };

      void performSignOut();
    }
    // If no user, or user and profile exist, do nothing.
  }, [user, profile, isLoading, clearAuth, navigate]);
}
