import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { validateUserRole } from '@/lib/utils/validate-user-role';
import type { Profile } from '@/lib/types';

export function useAuth() {
  const navigate = useNavigate();
  const { setUser, setProfile, clearAuth } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1) resolve username → email
      let email = identifier.trim();
      if (!email.includes('@')) {
        const { data: u, error: ue } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier.toLowerCase())
          .single();
        if (ue || !u?.email) throw new Error('Invalid credentials');
        email = u.email;
      }

      // 2) sign in
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr || !authData.user) throw authErr ?? new Error('Login failed');
      setUser(authData.user);

      // 3) fetch profile row
      const { data: p, error: pErr } = await supabase
        .from('profiles')
        .select(`
          id,
          role,
          full_name,
          email,
          username,
          phone,
          location,
          avatar_id,
          avatar_url,
          organization_id,
          job_title_id
        `)
        .eq('id', authData.user.id)
        .single();
      if (pErr || !p) throw pErr ?? new Error('Failed to load profile');

      // 4) map exactly to your Profile interface
      const mapped: Profile = {
        id:             p.id,
        user_role:      validateUserRole(p.role),
        full_name:      p.full_name,
        email:          p.email        ?? '',
        username:       p.username     ?? null,
        phone:          p.phone        ?? null,
        location:       p.location     ?? null,
        avatar_id:      p.avatar_id    ?? null,
        avatar_url:     p.avatar_url   ?? null,
        organization_id:p.organization_id ?? null,
        job_title_id:   p.job_title_id    ?? null,
      };

      setProfile(mapped);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // prevent duplicate accounts
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (existing) throw new Error('Email already in use');

      // 1) sign up
      const { data: s, error: sErr } = await supabase.auth.signUp({ email, password });
      if (sErr || !s.user) throw sErr ?? new Error('Signup failed');

      // 2) create blank profile row
      const { error: pErr } = await supabase
        .from('profiles')
        .insert({
          id: s.user.id,
          email,
          full_name: '',
          role: 'Contractor',
          created_at: new Date().toISOString(),
        });
      if (pErr) throw new Error('Error creating profile');

      setUser(s.user);
      navigate('/onboarding');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: rpErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (rpErr) throw rpErr;
      setSuccess('Password reset instructions sent.');
    } catch {
      setError('Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, login, signup, resetPassword };
}