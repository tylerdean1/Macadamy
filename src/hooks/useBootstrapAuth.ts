import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

const LOADING_TIMEOUT_MS = 5_000; // fallback guard

/**
 * Bootstraps authentication on app mount:
 *  ▪ pulls existing session
 *  ▪ loads profile (if user present)
 *  ▪ keeps Zustand store in sync with Supabase auth events
 *  ▪ exposes a boolean “isLoading” for legacy callers
 */
export function useBootstrapAuth(): boolean {
  const {
    setUser,
    loadProfile,
    user,
    profile,
    loading,
    isLoading: storeIsLoading,
    clearAuth,
    setLoading,
    setError,
  } = useAuthStore();

  const navigate = useNavigate();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  /* ── FIRST EFFECT ▪ initial session check ───────────────────── */
  useEffect(() => {
    (async (): Promise<void> => {
      if (import.meta.env.DEV) {
        console.log('[useBootstrapAuth] starting initial session check');
      }
      setLoading({ initialization: true });

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          if (import.meta.env.DEV) {
            console.error('[useBootstrapAuth] session error', error);
          }
          setError(error.message);
          clearAuth();
          return;
        }

        const sessionUser = data.session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          try {
            await loadProfile(sessionUser.id);
            if (import.meta.env.DEV) {
              console.log('[useBootstrapAuth] profile loaded');
            }
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : 'Error loading user profile';
            setError(msg);
            if (import.meta.env.DEV) {
              console.error('[useBootstrapAuth] profile load error', err);
            }
          }
        } else {
          clearAuth();
        }
      } finally {
        setLoading({ initialization: false });
        setInitialCheckDone(true);
        if (import.meta.env.DEV) {
          console.log('[useBootstrapAuth] initial session check complete');
        }
      }
    })().catch((err) => {
      setError(err instanceof Error ? err.message : String(err));
      clearAuth();
      setLoading({ initialization: false });
      setInitialCheckDone(true);
    });
  }, [setUser, loadProfile, clearAuth, setLoading, setError]);

  /* ── SECOND EFFECT ▪ subscribe to auth changes ──────────────── */
  useEffect(() => {
    if (!initialCheckDone) return;

    if (import.meta.env.DEV) {
      console.log('[useBootstrapAuth] registering onAuthStateChange listener');
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (import.meta.env.DEV) {
          console.log('[useBootstrapAuth] auth change event', event);
        }

        const nextUser = session?.user ?? null;

        /* special case: password recovery flow */
        if (event === 'PASSWORD_RECOVERY') {
          setUser(nextUser);
          setLoading({ initialization: false, auth: false });
          navigate('/update-password');
          return;
        }

        setUser(nextUser);

        if (nextUser) {
          try {
            await loadProfile(nextUser.id);
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : 'Error loading user profile';
            setError(msg);
            if (import.meta.env.DEV) {
              console.error('[useBootstrapAuth] profile load error', err);
            }
          }
        } else {
          clearAuth();
        }

        setLoading({ initialization: false });
      },
    );

    return () => {
      if (import.meta.env.DEV) {
        console.log('[useBootstrapAuth] unsubscribing auth listener');
      }
      listener?.subscription.unsubscribe();
    };
  }, [
    initialCheckDone,
    setUser,
    loadProfile,
    clearAuth,
    setLoading,
    setError,
    navigate,
  ]);

  /* ── THIRD EFFECT ▪ onboarding redirect ─────────────────────── */
  useEffect(() => {
    if (!loading.initialization && user && profile == null) {
      navigate('/onboarding');
    }
  }, [loading.initialization, user, profile, navigate]);

  /* ── SAFETY TIMEOUT ▪ reset stuck loading ───────────────────── */
  useEffect(() => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
    }

    if (loading.initialization) {
      timeoutRef.current = window.setTimeout(() => {
        if (loading.initialization) {
          if (import.meta.env.DEV) {
            console.warn(
              '[useBootstrapAuth] initialization stuck – forcing reset',
            );
          }
          useAuthStore.getState().resetLoadingStates();
        }
      }, LOADING_TIMEOUT_MS);
    }

    return () => {
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
    };
  }, [loading.initialization]);

  /* legacy return value for older callers */
  return storeIsLoading;
}