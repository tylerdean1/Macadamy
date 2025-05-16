import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { useLoadProfile } from '@/hooks/useLoadProfile';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();
  const loadProfile = useLoadProfile();

  async function login(email: string, password: string): Promise<boolean> {
    setLoading(true);
    setError(null);

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authErr || !data.user) {
      setError(authErr?.message || 'Login failed');
      setLoading(false);
      return false;
    }

    setUser(data.user);
    await loadProfile(data.user.id);

    setLoading(false);
    return true;
  }

  return {
    login,
    loading,
    error,
  };
}
