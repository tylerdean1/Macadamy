import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Database } from "@/lib/database.types";
import type { EnrichedProfile } from "@/lib/store";
import { rpcClient } from "@/lib/rpc.client";
import { useDemoLogin } from "@/hooks/useDemoLogin";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/* TYPES ============================================================== */
/* ------------------------------------------------------------------ */
type UserRole = Database["public"]["Enums"]["user_role"];

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

type UseAuthReturn = {
  user: SupabaseUser | null;
  profile: EnrichedProfile | null;
  login: (identifier: string, password: string) => Promise<EnrichedProfile | null>;
  signup: (
    email: string,
    password: string,
    profileInput: AuthEnrichedProfileInput
  ) => Promise<EnrichedProfile | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  loginAsDemoUser: () => Promise<EnrichedProfile | null>;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  isProfileLoaded: boolean;
  currentRole: UserRole | null;
  currentOrgId: string | null;
  currentAvatarUrl: string | null;
  currentSessionId: string | null;
};

/* ------------------------------------------------------------------ */
/* HELPERS =========================================================== */
/* ------------------------------------------------------------------ */
const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* ------------------------------------------------------------------ */
/* HOOK ============================================================== */
/* ------------------------------------------------------------------ */
export function useAuth(): UseAuthReturn {
  const {
    user,
    profile,
    setUser,
    clearAuth,
    loading,
    setLoading,
    error: storeError,
    setError,
  } = useAuthStore();

  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const navigate = useNavigate();

  // Use the demo login hook for demo functionality
  const { loginAsDemoUser: demoLoginFunction } = useDemoLogin();

  /* ----------------------------- LOGIN ---------------------------- */
  const login = useCallback(
    async (
      identifier: string,
      password: string,
    ): Promise<EnrichedProfile | null> => {
      // Set auth loading state
      setLoading({ auth: true });
      setError(null);

      const trimmedIdentifier = identifier.trim();
      const lastAttemptIdentifier = window.sessionStorage.getItem("lastLoginAttempt");
      if (lastAttemptIdentifier !== trimmedIdentifier) setLoginAttempts(0);
      window.sessionStorage.setItem("lastLoginAttempt", trimmedIdentifier);

      if (!validateEmail(trimmedIdentifier)) {
        const msg = "Please enter a valid email address";
        setError(msg);
        toast.error(msg);
        setLoading({ auth: false });
        return null;
      }

      try {
        const { data, error: authErr } = await supabase.auth.signInWithPassword({
          email: trimmedIdentifier,
          password,
        });

        /* ----- error or missing user ----- */
        if (authErr != null || !data?.user) {
          const msg =
            typeof authErr?.message === "string" && authErr.message.trim() !== ""
              ? authErr.message
              : "Invalid login credentials";
          setError(msg);
          toast.error(msg);
          setLoginAttempts((prev) => prev + 1);
          setLoading({ auth: false });
          return null;
        }

        /* ----- success ----- */
        setUser(data.user);
        await useAuthStore.getState().loadProfile(data.user.id);
        const currentProfile = useAuthStore.getState().profile;

        if (!currentProfile) {
          const msg = "User profile not found. Please complete onboarding.";
          setError(msg);
          toast.error(msg);
          navigate("/onboarding");
          setLoading({ auth: false });
          return null;
        }

        setLoginAttempts(0);
        window.sessionStorage.removeItem("lastLoginAttempt");
        toast.success("Welcome back!");
        navigate("/dashboard");
        setLoading({ auth: false });
        return currentProfile;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "An unexpected error occurred during login";
        setError(msg);
        toast.error(msg);
        setLoading({ auth: false });
        return null;
      }
    },
    [navigate, setUser, loginAttempts, setLoginAttempts, setLoading, setError],
  );

  /* ---------------------------- SIGNUP --------------------------- */
  const signup = useCallback(
    async (
      email: string,
      password: string,
      profileInput: AuthEnrichedProfileInput,
    ): Promise<EnrichedProfile | null> => {
      setLoading({ auth: true });
      setError(null);

      if (!validateEmail(email)) {
        const msg = "Please enter a valid email address";
        setError(msg);
        toast.error(msg);
        setLoading({ auth: false });
        return null;
      }

      try {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email.toLowerCase())
          .maybeSingle();

        if (existing) {
          const msg = "An account with this email already exists";
          setError(msg);
          toast.error(`${msg}. Please log in.`);
          setLoading({ auth: false });
          return null;
        }

        const { data: signUpData, error: authErr } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authErr != null || !signUpData?.user) {
          const msg =
            typeof authErr?.message === "string" && authErr.message.trim() !== ""
              ? authErr.message
              : "Signup failed";
          setError(msg);
          toast.error(msg);
          setLoading({ auth: false });
          return null;
        }

        /* ---- insert full profile via RPC ---- */
        try {
          await rpcClient.insertProfileFull({
            ...profileInput,
            id: signUpData.user.id,
          });
        } catch (upErr) {
          const upMsg =
            upErr instanceof Error
              ? upErr.message
              : "Failed to create profile after signup.";
          setError(upMsg);
          toast.error(upMsg);
          setLoading({ auth: false });
          return null;
        }

        setUser(signUpData.user);
        await useAuthStore.getState().loadProfile(signUpData.user.id);
        const newProfile = useAuthStore.getState().profile;

        if (!newProfile) {
          const msg = "Profile creation failed";
          setError(msg);
          toast.error(msg);
          setLoading({ auth: false });
          return null;
        }

        toast.success("Signup successful! Redirecting to onboarding...");
        navigate("/onboarding");
        setLoading({ auth: false });
        return newProfile;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "An unexpected error occurred during signup";
        setError(msg);
        toast.error(msg);
        setLoading({ auth: false });
        return null;
      }
    },
    [navigate, setUser, setLoading, setError],
  );

  /* ---------------------------- LOGOUT --------------------------- */
  const logout = useCallback(async (): Promise<void> => {
    setLoading({ auth: true });
    setError(null);
    try {
      await supabase.auth.signOut();
      clearAuth();
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred during logout";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading({ auth: false });
    }
  }, [navigate, clearAuth, setLoading, setError]);

  /* ------------------------- RESET PASSWORD ---------------------- */
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    setLoading({ auth: true });
    setError(null);

    if (!validateEmail(email)) {
      const msg = "Please enter a valid email address";
      setError(msg);
      toast.error(msg);
      setLoading({ auth: false });
      return false;
    }

    try {
      const { data: userExists } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (!userExists) {
        const msg = "No account found with this email address";
        setError(msg);
        toast.error(msg);
        setLoading({ auth: false });
        return false;
      }

      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetErr) {
        const msg = resetErr.message || "Password reset failed";
        setError(msg);
        toast.error(msg);
        setLoading({ auth: false });
        return false;
      }

      toast.success(
        "Password reset email sent! Check your inbox for further instructions.",
      );
      setLoading({ auth: false });
      return true;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during password reset";
      setError(msg);
      toast.error(msg);
      setLoading({ auth: false });
      return false;
    }
  }, [setLoading, setError]);

  /* ----------------------- LOGIN AS DEMO USER -------------------- */
  // Delegate to the specialized demo login hook
  const loginAsDemoUser = useCallback(
    async (): Promise<EnrichedProfile | null> => {
      return demoLoginFunction();
    },
    [demoLoginFunction],
  );

  /* --------------------------- RETURN ---------------------------- */
  return {
    user,
    profile,
    login,
    signup,
    logout,
    resetPassword,
    loginAsDemoUser,
    loading: loading.initialization || loading.auth || loading.profile || loading.demo,
    error: storeError, // Use the centralized error from the auth store
    isLoggedIn: user != null,
    isProfileLoaded: profile != null,
    currentRole: profile ? profile.role : null,
    currentOrgId: profile ? profile.organization_id : null,
    currentAvatarUrl: profile ? profile.avatar_url : null,
    currentSessionId: profile ? profile.session_id : null,
  };
}
