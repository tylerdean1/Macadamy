import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

/**
 * This hook ensures that a valid profile is loaded.
 * If no profile is found (but the user is logged in),
 * it signs out the session and redirects to the homepage.
 */
export function useRequireProfile() {
  const navigate = useNavigate();
  const { user, profile, clearAuth } = useAuthStore();
  
  useEffect(() => {
    const handleMissingProfile = async () => {
      console.log("[DEBUG] useRequireProfile checking auth:", {
        user,
        profile,
      });

      // Only redirect if we have a user but no profile
      if (user && profile === null) {
        try {
          // Try to fetch profile directly with RPC before giving up
          const { data, error } = await supabase.rpc(
            "get_enriched_profile",
            { _user_id: user.id }
          );
          
          if (error || !data || data.length === 0) {
            console.warn("[WARN] User exists but no profile found. Signing out.");
            await supabase.auth.signOut();
            clearAuth();
            navigate("/", { replace: true });
          }
        } catch (error) {
          console.error("Error checking profile:", error);
          await supabase.auth.signOut();
          clearAuth();
          navigate("/", { replace: true });
        }
      }
    };

    // Add a small delay to allow profile loading to complete
    const timeoutId = setTimeout(() => {
      handleMissingProfile();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [user, profile, clearAuth, navigate]);
}
