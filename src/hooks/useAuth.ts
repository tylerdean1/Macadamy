import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { useLoadProfile } from '@/hooks/useLoadProfile';

export function useAuth() {
  const { user, setUser, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const loadProfile = useLoadProfile();

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      if (authError || !data.user) {
        setError(authError?.message || 'Login failed');
        setLoading(false);
        return null;
      }

      setUser(data.user);

      const profile = await loadProfile(data.user.id);
      if (!profile) {
        setError('Failed to load profile. You may need to complete onboarding.');
        setLoading(false);
        return null;
      }

      useAuthStore.getState().setProfile(profile);
      setSuccess('Login successful');
      setLoading(false);
      navigate('/dashboard');
      return data.user;
    } catch (err) {
      console.error('[ERROR] Login error:', err);
      setError('An unexpected error occurred during login');
      setLoading(false);
      return null;
    }
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    clearAuth();

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) {
        setError(authError.message || 'Signup failed');
        setLoading(false);
        return null;
      }

      navigate('/');
      setSuccess('Signup successful! Please check your email to confirm your account.');
      setLoading(false);
      return data.user;
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred during signup');
      setLoading(false);
      return null;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      clearAuth();
      setSuccess('Logged out successfully');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      setError('An unexpected error occurred during logout');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message || 'Password reset failed');
        setLoading(false);
        return false;
      }

      setSuccess('Password reset email sent. Please check your inbox.');
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred during password reset');
      setLoading(false);
      return false;
    }
  };

  const loginAsDemoUser = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'demo123',
      });

      if (authError || !data.user) {
        setError(authError?.message || 'Demo login failed');
        setLoading(false);
        return null;
      }

      setUser(data.user);

      const profile = await loadProfile(data.user.id);
      if (!profile) {
        setError('Failed to load demo profile.');
        setLoading(false);
        return null;
      }

      useAuthStore.getState().setProfile(profile);
      setSuccess('Demo login successful');
      navigate('/demo-redirect');
      setLoading(false);
      return data.user;
    } catch (err) {
      console.error('Demo login error:', err);
      setError('An unexpected error occurred during demo login');
      setLoading(false);
      return null;
    }
  };

  return {
    user,
    loading,
    error,
    success,
    login,
    signup,
    logout,
    resetPassword,
    loginAsDemoUser,
  };
}
