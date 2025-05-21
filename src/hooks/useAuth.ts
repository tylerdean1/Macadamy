import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Database } from "@/lib/database.types";
import type { EnrichedProfile } from "@/lib/store";
import { cloneDemoData, DemoSession } from "@/lib/utils/cloneDemoData";
import { rpcClient } from "@/lib/rpc.client";

type UserRole = Database["public"]["Enums"]["user_role"];

// Input type for signup, similar to what was in useSignup.ts
export interface AuthEnrichedProfileInput {
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  location?: string;
  role: UserRole;
  job_title_id?: string;
  custom_job_title?: string;
  organization_id?: string;
  custom_organization_name?: string;
  avatar_id?: string;
}

// Add a minimal explicit return type for useAuth
export function useAuth(): Record<string, unknown> {
  const {
    user,
    profile,
    setUser,
    setProfile,
    clearAuth,
    isLoading,
  } = useAuthStore();

  const [error, setError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);

  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // --- LOGIN FUNCTION ---
  const login = useCallback(
    async (
      identifier: string,
      password: string,
    ): Promise<EnrichedProfile | null> => {
      // setLoading(true);
      setError(null);

      if (window.sessionStorage.getItem("lastLoginAttempt") !== identifier) {
        setLoginAttempts(0);
      }
      window.sessionStorage.setItem("lastLoginAttempt", identifier);

      if (!validateEmail(identifier)) {
        setError("Please enter a valid email address");
        toast.error("Please enter a valid email address");
        // setLoading(false);
        return null;
      }

      try {
        const { data: userExists } = await supabase
          .from("profiles")
          .select("id")
          .ilike("email", identifier.trim())
          .maybeSingle();

        if (!userExists) {
          setError("No account found with this email");
          toast.error("No account found with this email. Please sign up.");
          // setLoading(false);
          return null;
        }

        const { data, error: authError } = await supabase.auth
          .signInWithPassword({
            email: identifier,
            password,
          });

        if (Boolean(authError) || !data.user) {
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          setError((typeof authError?.message === 'string' && authError.message.trim() !== '') ? authError.message : "Login failed");
          if (newAttempts >= 3) {
            toast.error(
              "Too many failed attempts. Try resetting your password.",
            );
            navigate("/reset-password");
          } else {
            toast.error(
              (typeof authError?.message === 'string' && authError.message.trim() !== '') ? authError.message : "Incorrect password. Please try again.",
            );
          }
          // setLoading(false);
          return null;
        }

        setUser(data.user);
        await useAuthStore.getState().loadProfile(data.user.id); // Load profile via store
        const currentProfile = useAuthStore.getState().profile;

        if (!currentProfile) {
          setError(
            "Failed to load profile. You may need to complete onboarding.",
          );
          toast.error(
            "Failed to load profile. You may need to complete onboarding.",
          );
          // Potentially clearAuth() here if profile is essential for logged-in state
          // setLoading(false);
          return null;
        }

        toast.success("Welcome back!");
        navigate(
          currentProfile.role === "Admin" ? "/admin/dashboard" : "/dashboard",
        ); // Example role-based redirect
        return currentProfile;
      } catch (err) {
        console.error("[ERROR] Login error:", err);
        const message = err instanceof Error
          ? err.message
          : "An unexpected error occurred during login";
        setError(message);
        toast.error(message);
        // setLoading(false);
        return null;
      } finally {
        // setLoading(false);
      }
    },
    [navigate, setUser, loginAttempts],
  );

  // --- SIGNUP FUNCTION ---
  const signup = useCallback(
    async (
      email: string,
      password: string,
      profileInput: AuthEnrichedProfileInput,
    ): Promise<EnrichedProfile | null> => {
      // setLoading(true);
      setError(null);
      // clearAuth(); // Consider if auth should be cleared before signup attempt

      if (!validateEmail(email)) {
        setError("Please enter a valid email address");
        toast.error("Please enter a valid email address");
        // setLoading(false);
        return null;
      }

      try {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email.toLowerCase())
          .maybeSingle();

        if (existingUser) {
          setError("An account with this email already exists");
          toast.error(
            "An account with this email already exists. Please log in.",
          );
          // setLoading(false);
          return null;
        }

        const { data: signUpData, error: authError } = await supabase.auth
          .signUp({
            email,
            password,
            options: {
              // emailRedirectTo: `${window.location.origin}/dashboard`, // Or onboarding
              // data: profileInput, // Supabase auth metadata for profile is an option
            },
          });

        if (Boolean(authError) || !signUpData.user) {
          setError(authError?.message ?? "Signup failed");
          toast.error(authError?.message ?? "Signup failed");
          // setLoading(false);
          return null;
        }        // setUser(signUpData.user); // Set user in store immediately

        // Insert profile using RPC client
        try {
          await rpcClient.insertProfileFull({
            _id: signUpData.user.id,
            _role: profileInput.role,
            _full_name: profileInput.full_name,
            _email: profileInput.email, // Ensure this matches the auth email
            _username: profileInput.username,
            _phone: profileInput.phone ?? undefined,
            _location: profileInput.location ?? undefined,
            _job_title_id: profileInput.job_title_id ?? undefined,
            _custom_job_title: profileInput.custom_job_title ?? undefined,
            _organization_id: profileInput.organization_id ?? undefined,
            _custom_organization_name: profileInput.custom_organization_name ??
              undefined,
            _avatar_id: profileInput.avatar_id ?? undefined,
          });
        } catch (insertProfileError) {
          setError(
            (insertProfileError as Error)?.message ||
            "Failed to create profile after signup.",
          );
          toast.error(
            (insertProfileError as Error)?.message ||
            "Failed to create profile. Please contact support.",
          );
          // Potentially attempt to clean up the auth user if profile creation fails critically
          // await supabase.auth.deleteUser(signUpData.user.id); // Requires admin privileges
          // setLoading(false);
          return null;
        }

        // After successful profile insertion, set user and load profile
        setUser(signUpData.user);
        await useAuthStore.getState().loadProfile(signUpData.user.id);
        const newProfile = useAuthStore.getState().profile;

        if (!newProfile) {
          setError(
            "Profile created but failed to load. Please try logging in.",
          );
          toast.error(
            "Profile created but failed to load. Please try logging in.",
          ); // Changed from toast.warn
          // setLoading(false);
          navigate("/login"); // Or to a page explaining the situation
          return null;
        }

        toast.success("Signup successful! Redirecting to onboarding...");
        navigate("/onboarding"); // Redirect to onboarding
        return newProfile;
      } catch (err) {
        console.error("Signup error:", err);
        const message = err instanceof Error
          ? err.message
          : "An unexpected error occurred during signup";
        setError(message);
        toast.error(message);
        // setLoading(false);
        return null;
      } finally {
        // setLoading(false);
      }
    },
    [navigate, setUser, setProfile],
  );

  // --- LOGOUT FUNCTION ---
  const logout = useCallback(
    async () => {
      // setLoading(true);
      setError(null);
      try {
        await supabase.auth.signOut();
        clearAuth();
        toast.success("Logged out successfully");
        navigate("/");
      } catch (err) {
        console.error("Logout error:", err);
        const message = err instanceof Error
          ? err.message
          : "An unexpected error occurred during logout";
        setError(message);
        toast.error("Failed to log out. Please try again.");
      } finally {
        // setLoading(false);
      }
    },
    [navigate, clearAuth],
  );
  // --- RESET PASSWORD FUNCTION ---
  const resetPassword = useCallback(
    async (email: string): Promise<boolean> => {
      setError(null);

      if (!validateEmail(email)) {
        setError("Please enter a valid email address");
        toast.error("Please enter a valid email address");
        return false;
      }

      try {
        // Use RPC client to check if user exists
        const { data: userExists } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email.toLowerCase())
          .maybeSingle();

        if (!userExists) {
          setError("No account found with this email");
          toast.error(
            "No account found with this email. Please sign up first.",
          );
          return false;
        }

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          },
        );

        if (resetError) {
          setError(resetError.message || "Password reset failed");
          toast.error(resetError.message || "Password reset failed");
          return false;
        }

        toast.success("Password reset email sent. Please check your inbox.");
        return true;
      } catch (err) {
        console.error("Password reset error:", err);
        const message = err instanceof Error
          ? err.message
          : "An unexpected error occurred during password reset";
        setError(message);
        toast.error(message);
        return false;
      }
    },
    [],
  );
  // --- LOGIN AS DEMO USER FUNCTION ---
  const loginAsDemoUser = useCallback(
    async (): Promise<EnrichedProfile | null> => {
      setError(null);

      try {
        // Use RPC client to get or create demo session
        const demoSessionData: DemoSession = await cloneDemoData();

        // Sign in with Supabase Auth
        const demoEmail = String(import.meta.env.VITE_DEMO_USER_EMAIL ?? "demo@example.com");
        const demoPassword = String(import.meta.env.VITE_DEMO_USER_PASSWORD ?? "demo123");

        if (demoEmail === "demo@example.com") {
          console.warn(
            "Using default demo credentials. Ensure VITE_DEMO_USER_EMAIL and VITE_DEMO_USER_PASSWORD are set in your .env file for a real demo account.",
          );
        }

        const { data: authData, error: authError } = await supabase.auth
          .signInWithPassword({
            email: demoEmail,
            password: demoPassword,
          });

        if (Boolean(authError) || !authData.user) {
          setError(
            (typeof authError?.message === 'string' && authError.message.trim() !== '') ? authError.message : "Demo login failed. Check credentials or demo account status.",
          );
          toast.error(
            (typeof authError?.message === 'string' && authError.message.trim() !== '') ? authError.message : "Demo login failed. Please try again later or contact support.",
          );
          return null;
        }

        // Set the authenticated user in the store
        setUser(authData.user);

        // Load the cloned enriched profile
        await useAuthStore.getState().loadProfile(demoSessionData.userId);
        const demoProfile = useAuthStore.getState().profile;

        if (!demoProfile) {
          setError(
            "Failed to load demo profile. The demo account might be incomplete.",
          );
          toast.error(
            "Failed to load demo profile. Please try again later or contact support.",
          );
          return null;
        }

        toast.success("Welcome to the Demo Environment!");
        navigate(
          demoProfile.role === "Admin" ? "/admin/dashboard" : "/dashboard",
        );
        return demoProfile;
      } catch (err) {
        console.error("[ERROR] Demo login error:", err);
        const message = err instanceof Error
          ? err.message
          : "An unexpected error occurred during demo login";
        setError(message);
        toast.error(message);
        return null;
      }
    },
    [navigate, setUser],
  );

  return {
    user,
    profile,
    login,
    signup,
    logout,
    resetPassword,
    loginAsDemoUser,
    loading: isLoading,
    error,
    isLoggedIn: !!user,
    isProfileLoaded: !!profile,
    currentRole: profile ? profile.role : null,
    currentOrgId: profile ? profile.organization_id : null,
    currentAvatarUrl: profile ? profile.avatar_url : null,
    currentSessionId: profile ? profile.session_id : null,
  };
}
