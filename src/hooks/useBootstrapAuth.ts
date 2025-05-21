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
      async (_event, session) => {
        const supabaseUser = session?.user ?? null;
        setUser(supabaseUser);

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
      if (!user) {
        console.log("[useBootstrapAuth] No user, navigating to /login.");
        navigate("/login");
      } else if (user && profile === null) {
        // Explicitly check profile for null
        console.log(
          "[useBootstrapAuth] User exists, but no profile, navigating to /create-profile.",
        );
        navigate("/create-profile");
      }
    }
  }, [user, profile, authStoreLoading, navigate]);

  return authStoreLoading;
}
