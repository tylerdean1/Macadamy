import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { User as SupabaseUser } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import type { Database } from '@/lib/database.types';
import type { EnrichedProfile } from '@/lib/store';
import { rpcClient } from '@/lib/rpc.client';
import { logError } from '@/utils/errorLogger';

type UserRole = Database['public']['Enums']['user_role'];

/* ── constants ─────────────────────────────────────────────────── */
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 5 * 60 * 1_000;

/* ── helper(s) ─────────────────────────────────────────────────── */
const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/* ── public API types ──────────────────────────────────────────── */
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

interface UseAuthReturn {
  user: SupabaseUser | null;
  profile: EnrichedProfile | null;

  login: (identifier: string, password: string) => Promise<EnrichedProfile | null>;
  signup: (email: string, password: string, input: AuthEnrichedProfileInput) => Promise<EnrichedProfile | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;

  loading: boolean;
  error: string | null;

  /* convenience flags */
  isLoggedIn: boolean;
  isProfileLoaded: boolean;
  currentRole: UserRole | null;
  currentOrgId: string | null;
  currentAvatarUrl: string | null;
}

/* ── hook implementation ──────────────────────────────────────── */
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

  const navigate = useNavigate();

  /* local state – throttled login attempts */
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  /* ── LOGIN ──────────────────────────────────────────────────── */
  const login = useCallback(
    async (identifier: string, password: string): Promise<EnrichedProfile | null> => {
      const now = Date.now();

      if (lockUntil !== null && now < lockUntil) {
        toast.error('Too many failed attempts — please wait a moment and try again.');
        return null;
      }

      setLoading({ auth: true });
      setError(null);

      const email = identifier.trim();
      if (!isValidEmail(email)) {
        const msg = 'Please enter a valid email address';
        setError(msg);
        toast.error(msg);
        setLoading({ auth: false });
        return null;
      }

      if (import.meta.env.DEV) {
        console.log('[useAuth] attempting login', { email });
      }

      try {
        const { data, error: authErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        const hasAuthError: boolean = authErr !== null && authErr !== undefined;
        const userMissing: boolean = data === null || data.user === null || data.user === undefined;

        if (hasAuthError || userMissing) {
          const rawMsg = hasAuthError && typeof authErr!.message === 'string' ? authErr!.message.trim() : '';
          const isServerError = hasAuthError && typeof (authErr as any).status === 'number' && (authErr as any).status >= 500;
          const msg = isServerError
            ? 'Server error during login. Please try again later.'
            : rawMsg !== ''
              ? rawMsg
              : 'Invalid login credentials';
          logError('login', authErr);
          setError(msg);
          toast.error(msg);

          const attempts = loginAttempts + 1;
          setLoginAttempts(attempts);

          if (attempts >= MAX_LOGIN_ATTEMPTS) {
            setLockUntil(now + LOGIN_LOCK_MS);
          }
          return null;
        }

        /* success ─────────────────────────────────────────────── */
        setUser(data.user);
        if (!data.user) {
          const msg = 'User information is missing after login.';
          setError(msg);
          toast.error(msg);
          return null;
        }
        await useAuthStore.getState().loadProfile(data.user.id);
        const enrichedProfile = useAuthStore.getState().profile;

        if (enrichedProfile === null) {
          const msg = 'User profile not found — please complete onboarding';
          setError(msg);
          toast.error(msg);
          navigate('/onboarding');
          return null;
        }

        /* reset throttling & navigate */
        setLoginAttempts(0);
        setLockUntil(null);
        toast.success('Welcome back!');
        navigate('/dashboard');

        return enrichedProfile;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unexpected login error';
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading({ auth: false });
      }
    },
    [loginAttempts, lockUntil, navigate, setUser, setLoading, setError],
  );

  /* ── SIGN-UP (unchanged logic, explicit comparisons added) ─── */
  const signup = useCallback(
    async (email: string, password: string, input: AuthEnrichedProfileInput): Promise<EnrichedProfile | null> => {
      setLoading({ auth: true });
      setError(null);

      if (!isValidEmail(email)) {
        const msg = 'Please enter a valid email address';
        setError(msg);
        toast.error(msg);
        setLoading({ auth: false });
        return null;
      }

      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email.toLowerCase())
          .maybeSingle();

        const accountExists = existing !== null && existing !== undefined;

        if (accountExists) {
          const msg = 'An account with this email already exists';
          setError(msg);
          toast.error(`${msg}. Please log in.`);
          return null;
        }

        const { data: signUpData, error: authErr } = await supabase.auth.signUp({
          email,
          password,
        });

        const signupFailed = authErr !== null && authErr !== undefined;
        const noUserReturned = signUpData === null || signUpData === undefined || !signUpData.user;

        if (signupFailed || noUserReturned) {
          const rawMsg = signupFailed && typeof authErr?.message === 'string' ? authErr.message.trim() : '';
          const msg = rawMsg !== '' ? rawMsg : 'Signup failed';
          setError(msg);
          toast.error(msg);
          return null;
        }
        if (!signUpData.user) {
          const msg = 'User information is missing after signup.';
          setError(msg);
          toast.error(msg);
          return null;
        }

        await rpcClient.insertProfileFull({
          ...input,
          id: signUpData.user.id,
        });

        setUser(signUpData.user);
        await useAuthStore.getState().loadProfile(signUpData.user.id);
        const newProfile = useAuthStore.getState().profile;

        if (newProfile === null) {
          const msg = 'Profile creation failed';
          setError(msg);
          toast.error(msg);
          return null;
        }
        if (newProfile === null) {
          const msg = 'Profile creation failed';
          setError(msg);
          toast.error(msg);
          return null;
        }

        toast.success('Signup successful! Redirecting to onboarding…');
        navigate('/onboarding');
        return newProfile;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unexpected signup error';
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading({ auth: false });
      }
    },
    [navigate, setUser, setLoading, setError],
  );

  /* ── LOGOUT (unchanged) ─────────────────────────────────────── */
  const logout = useCallback(async (): Promise<void> => {
    setLoading({ auth: true });
    setError(null);

    try {
      await supabase.auth.signOut();
      clearAuth();
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected logout error';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading({ auth: false });
    }
  }, [navigate, clearAuth, setLoading, setError]);

  /* ── RESET PASSWORD (explicit comparisons added) ────────────── */
  const resetPassword = useCallback(
    async (email: string): Promise<boolean> => {
      setLoading({ auth: true });
      setError(null);

      if (!isValidEmail(email)) {
        const msg = 'Please enter a valid email address';
        setError(msg);
        toast.error(msg);
        setLoading({ auth: false });
        return false;
      }

      try {
        const { data: exists } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email.toLowerCase())
          .maybeSingle();

        const accountFound = exists !== null && exists !== undefined;

        if (!accountFound) {
          const msg = 'No account found with this email address';
          setError(msg);
          toast.error(msg);
          return false;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        const resetFailed = error !== null && error !== undefined;

        if (resetFailed) {
          const msg = error.message !== '' ? error.message : 'Password reset failed';
          setError(msg);
          toast.error(msg);
          return false;
        }

        toast.success('Password reset email sent! Check your inbox.');
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unexpected reset error';
        setError(msg);
        toast.error(msg);
        return false;
      } finally {
        setLoading({ auth: false });
      }
    },
    [setLoading, setError],
  );


  /* ── RETURN SHAPE ───────────────────────────────────────────── */
  return {
    user,
    profile,
    login,
    signup,
    logout,
    resetPassword,

    loading: loading.initialization || loading.auth || loading.profile,
    error: storeError,

    isLoggedIn: user !== null,
    isProfileLoaded: profile !== null,
    currentRole: profile !== null ? profile.role : null,
    currentOrgId: profile !== null ? profile.organization_id : null,
    currentAvatarUrl: profile !== null ? profile.avatar_url : null,
  };}