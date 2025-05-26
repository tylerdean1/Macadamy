// filepath: c:\Users\tyler\OneDrive\Desktop\Macadamy\public\src\hooks\useBootstrapAuth.ts
import { useEffect, useState } from "react";
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
    loading,
    isLoading: authStoreLoading,
    clearAuth,
    setLoading,
    setError,
  } = useAuthStore();
  const navigate = useNavigate();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // First effect: Immediate initial session check to handle first page load
  useEffect(() => {
    const initialSessionCheck = async (): Promise<void> => {
      console.log("[useBootstrapAuth] Starting auth initialization");
      // Mark as initializing
      setLoading({ initialization: true });

      try {
        // Check for existing session immediately
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("[useBootstrapAuth] Session check error:", sessionError);
          setError(sessionError.message);
          clearAuth(); // Clear any stale auth data
          setLoading({ initialization: false });
          setInitialCheckDone(true);
          return;
        }

        const initialUser = sessionData?.session?.user ?? null;
        console.log("[useBootstrapAuth] Initial session check:", initialUser ? "User found" : "No user");

        // Set the user in store
        setUser(initialUser);

        if (initialUser) {
          // If we have a user, load their profile
          try {
            await loadProfile(initialUser.id);
            console.log("[useBootstrapAuth] Initial profile loaded");
          } catch (err) {
            console.error("[useBootstrapAuth] Error loading initial profile:", err);
            setError(err instanceof Error ? err.message : "Error loading user profile");
          }
        } else {
          // No user, clear any stale auth data
          clearAuth();
        }
      } catch (err) {
        console.error("[useBootstrapAuth] Unexpected error during initialization:", err);
        setError(err instanceof Error ? err.message : "Unexpected error during auth initialization");
        clearAuth();
      } finally {
        // Always complete initialization, even if there were errors
        setLoading({ initialization: false });
        setInitialCheckDone(true);
        console.log("[useBootstrapAuth] Initial auth check complete");
      }
    };

    void initialSessionCheck();
  }, [setLoading, setUser, setError, loadProfile, clearAuth]);

  // Second effect: Set up auth state change listener for subsequent changes
  useEffect(() => {
    // Only set up the listener after initial check is complete to avoid duplicate work
    if (!initialCheckDone) return;

    console.log("[useBootstrapAuth] Setting up auth state change listener");

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[useBootstrapAuth] Auth state change:", event);
        const supabaseUser = session?.user ?? null;

        // Special case for password recovery
        if (event === "PASSWORD_RECOVERY") {
          console.log(
            "[useBootstrapAuth] Password recovery event detected, navigating to /update-password",
          );
          setUser(supabaseUser);
          setLoading({
            initialization: false,
            auth: false,
          });
          navigate("/update-password");
          return;
        }

        // Update user in store
        setUser(supabaseUser);

        if (supabaseUser) {
          console.log("[useBootstrapAuth] User authenticated, loading profile");
          try {
            await loadProfile(supabaseUser.id);
          } catch (err) {
            console.error("[useBootstrapAuth] Error loading profile:", err);
            setError(
              err instanceof Error ? err.message : "Error loading user profile",
            );
          }
        } else {
          console.log("[useBootstrapAuth] No user found, clearing auth state");
          clearAuth();
        }

        // Always ensure initialization is marked as complete after auth event
        setLoading({ initialization: false });
      },
    );

    return () => {
      console.log("[useBootstrapAuth] Unsubscribing from auth changes");
      authListener?.subscription.unsubscribe();
    };
  }, [initialCheckDone, setUser, loadProfile, clearAuth, setLoading, setError, navigate]);
  // Effect for handling navigation after auth state is resolved
  useEffect(() => {
    if (!loading.initialization) {
      // Auth initialization complete, handle navigation logic

      // If a user exists but profile is missing, redirect to onboarding
      if (user && profile === null) {
        console.log(
          "[useBootstrapAuth] User exists but no profile, navigating to /onboarding",
        );
        navigate("/onboarding");
      }
      // Protected routes are handled by ProtectedRoute component
    }
  }, [user, profile, loading.initialization, navigate]);

  // Safety effect: Ensure we never get stuck in loading state
  useEffect(() => {
    // Set a timeout to ensure loading state isn't stuck
    const loadingTimeout = setTimeout(() => {
      if (loading.initialization) {
        console.warn('[useBootstrapAuth] Loading state appears stuck. Forcing reset.');
        // Force reset loading states after 5 seconds if initialization is still true
        // This is a safety mechanism to prevent infinite loading
        useAuthStore.getState().resetLoadingStates();
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(loadingTimeout);
  }, [loading.initialization]);

  // Return the overall loading state for backward compatibility
  return authStoreLoading;
}
