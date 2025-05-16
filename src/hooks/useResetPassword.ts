import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function resetPassword(email: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email);

    if (resetErr) {
      setError(resetErr.message);
      setLoading(false);
      return false;
    }

    setSuccess(true);
    setLoading(false);
    return true;
  }

  return { loading, error, success, resetPassword };
}
