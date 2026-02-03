import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store";

/**
 * This hook ensures that a user has a loaded profile.
 * If a user is authenticated but their profile is missing or incomplete after loading attempts,
 * it redirects them to profile onboarding.
 * This hook should be used on pages that absolutely require a profile to function.
 */
export function useRequireProfile(): void {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuthStore((state) => ({
    user: state.user,
    profile: state.profile,
    loading: state.loading,
  }));

  // Check if any loading process is in progress
  const isLoading = loading.initialization || loading.auth || loading.profile;
  useEffect(() => {
    // Only proceed if the authentication and profile loading process has finished
    // Skip if we're initializing, as that will be handled by the router
    if (loading.initialization || loading.profile) {
      console.log("[useRequireProfile] Auth/profile state is loading. Waiting...");
      return;
    }

    console.log("[useRequireProfile] Auth/profile state resolved:", {
      user: !!user,
      profile: !!profile,
      loading,
    });      // If there is an authenticated user but no profile after loading has completed
    const isProfileComplete = Boolean(profile?.profile_completed_at);
    if (user && !isProfileComplete) {
      console.warn(
        "[useRequireProfile] User is authenticated, but profile is missing or incomplete. Redirecting to onboarding.",
      );
      navigate("/onboarding/profile", { replace: true });
    }
    // If no user, or user and profile exist, do nothing.
  }, [user, profile, isLoading, navigate]);
}
