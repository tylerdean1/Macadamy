import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { EnrichedProfileInput } from "@/hooks/useSignup";

export function useAuth() {
  const { user, setUser, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Reset login attempts if it's a new session
    if (
      loginAttempts > 0 &&
      window.sessionStorage.getItem("lastLoginAttempt") !== identifier
    ) {
      setLoginAttempts(0);
    }

    // Store the current identifier for future comparison
    window.sessionStorage.setItem("lastLoginAttempt", identifier);

    // Validate email format
    if (validateEmail(identifier)) {
      try {
        // Check if email exists in database
        const { data: userExists } = await supabase
          .from("profiles")
          .select("id")
          .ilike("email", identifier.trim())
          .maybeSingle();

        if (!userExists) {
          setError("No account found with this email");
          setLoading(false);
          toast.error("No account found with this email. Please sign up.");
          return null;
        }

        const { data, error: authError } = await supabase.auth
          .signInWithPassword({
            email: identifier,
            password,
          });
        if (authError || !data.user) {
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          setError(authError?.message || "Login failed");

          if (newAttempts >= 3) {
            toast.error(
              "Too many failed attempts. Try resetting your password.",
            );
            // Redirect to reset password page after too many attempts
            navigate("/reset-password");
          } else {
            toast.error("Incorrect password. Please try again.");
          }

          setLoading(false);
          return null;
        }

        setUser(data.user);

        // Load profile using the store's loadProfile method
        await useAuthStore.getState().loadProfile(data.user.id);
        const profile = useAuthStore.getState().profile;

        if (!profile) {
          setError(
            "Failed to load profile. You may need to complete onboarding.",
          );
          setLoading(false);
          toast.error(
            "Failed to load profile. You may need to complete onboarding.",
          );
          return null;
        }
        setSuccess("Login successful");
        setLoading(false);
        toast.success("Welcome back!");
        navigate("/dashboard");
        return data.user;
      } catch (err) {
        console.error("[ERROR] Login error:", err);
        setError("An unexpected error occurred during login");
        toast.error("An unexpected error occurred. Please try again later.");
        setLoading(false);
        return null;
      }
    } else {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      setLoading(false);
      return null;
    }
  };
  const signup = async (
    email: string,
    password: string,
    profileInput?: Partial<EnrichedProfileInput>,
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    clearAuth();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      setLoading(false);
      return null;
    }

    try {
      // Check if email already exists
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
        setLoading(false);
        return null;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: profileInput, // Pass profile data to auth metadata
        },
      });

      if (authError) {
        setError(authError.message || "Signup failed");
        toast.error(authError.message || "Signup failed");
        setLoading(false);
        return null;
      }

      setUser(data.user);
      setSuccess(
        "Signup successful! Please check your email to confirm your account.",
      );
      toast.success(
        "Signup successful! Please check your email to confirm your account.",
      );

      // After signup, redirect to onboarding
      navigate("/onboarding");
      setLoading(false);
      return data.user;
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred during signup");
      toast.error("An unexpected error occurred during signup");
      setLoading(false);
      return null;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      clearAuth();
      setSuccess("Logged out successfully");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      setError("An unexpected error occurred during logout");
      toast.error("Failed to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      setLoading(false);
      return false;
    }

    try {
      // Check if the email exists in the database
      const { data: userExists } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (!userExists) {
        setError("No account found with this email");
        toast.error("No account found with this email. Please sign up first.");
        setLoading(false);
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
        setLoading(false);
        return false;
      }

      setSuccess("Password reset email sent. Please check your inbox.");
      toast.success("Password reset email sent. Please check your inbox.");
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred during password reset");
      setLoading(false);
      return false;
    }
  };
  const loginAsDemoUser = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: "demo@example.com",
          password: "demo123",
        },
      );

      if (authError || !data.user) {
        setError(authError?.message || "Demo login failed");
        toast.error(authError?.message || "Demo login failed");
        setLoading(false);
        return null;
      }
      setUser(data.user);

      // Load profile using the store's loadProfile method
      await useAuthStore.getState().loadProfile(data.user.id);
      const profile = useAuthStore.getState().profile;
      if (!profile) {
        setError("Failed to load demo profile.");
        toast.error("Failed to load demo profile. Please try again later.");
        setLoading(false);
        return null;
      }

      useAuthStore.getState().setProfile(profile);
      setSuccess("Demo login successful");
      toast.success("Redirecting to demo environment setup...");
      navigate("/demo-redirect");
      setLoading(false);
      return data.user;
    } catch (err) {
      console.error("Demo login error:", err);
      setError("An unexpected error occurred during demo login");
      setLoading(false);
      return null;
    }
  };
  return {
    user,
    loading,
    error,
    success,
    loginAttempts,
    login,
    signup,
    logout,
    resetPassword,
    loginAsDemoUser,
  };
}
