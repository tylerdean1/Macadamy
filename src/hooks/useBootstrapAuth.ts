import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store";

/**
 * Hook to initialize auth state and load user profile if needed.
 * This hook uses the auth store which internally uses the RPC client.
 */
export function useBootstrapAuth(): boolean {
  // Use correct type for store
  const store = useAuthStore();
  const user = store.user;
  const profile = store.profile;
  const authLoading = store.isLoading;
  const loadProfile = store.loadProfile;
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const navigate = useNavigate();

  useEffect((): void => {
    const bootstrap = async (): Promise<void> => {
      if (authLoading === true || authLoading === false) {
        // In bootstrap, add type guard for user.id
        if (user !== null && profile == null && typeof user.id === 'string') {
          await loadProfile(user.id);
        }
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, [user, profile, authLoading, loadProfile, navigate]);

  useEffect((): void => {
    // Ensure bootstrapping is complete and auth is not actively loading
    if (isBootstrapping === false && authLoading === false) {
      // Check if the user object is null or undefined
      if (!user) {
        console.log("[useBootstrapAuth] No user, navigating to /login.");
        navigate("/login");
      } else if (user && profile === null) {
        // User exists, but profile is explicitly null (meaning it hasn'''s been loaded or doesn'''t exist)
        console.log(
          "[useBootstrapAuth] User exists, but no profile, navigating to /create-profile.",
        );
        navigate("/create-profile");
      }
    }
  }, [user, profile, isBootstrapping, authLoading, navigate]);

  return isBootstrapping || Boolean(authLoading);
}
