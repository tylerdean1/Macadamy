import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { useLoadProfile } from '@/hooks/useLoadProfile';

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();
  const loadProfile = useLoadProfile();

  async function signup(email: string, password: string): Promise<boolean> {
    setLoading(true);
    setError(null);

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpErr || !data.user) {
      setError(signUpErr?.message || 'Signup failed');
      setLoading(false);
      return false;
    }

    setUser(data.user);
    await loadProfile(data.user.id);

    setLoading(false);
    return true;
  }

  return {
    signup,
    loading,
    error,
  };
}
