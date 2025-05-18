import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();

  async function login(email: string, password: string): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authErr || !data.user) {
        setError(authErr?.message || "Login failed");
        setLoading(false);
        return false;
      }

      setUser(data.user);

      // Load profile using store method
      await useAuthStore.getState().loadProfile(data.user.id);

      setLoading(false);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
      return false;
    }
  }

  return {
    login,
    loading,
    error,
  };
}
