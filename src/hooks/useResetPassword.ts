import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  async function resetPassword(email: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      setLoading(false);
      return false;
    }

    try {
      // Check if the user exists in the database
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

      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (resetErr) {
        setError(resetErr.message);
        toast.error(resetErr.message || "Password reset failed");
        setLoading(false);
        return false;
      }

      setSuccess(true);
      toast.success("Password reset email sent. Please check your inbox.");
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred during password reset");
      toast.error("An unexpected error occurred during password reset");
      setLoading(false);
      return false;
    }
  }

  return { loading, error, success, resetPassword };
}
