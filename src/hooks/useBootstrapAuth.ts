import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getBackendErrorMessage, logBackendError } from '@/lib/backendErrors';
import { orgInviteListForCurrentUser } from '@/lib/inviteRpc';
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
  const debugAuth =
    typeof localStorage !== 'undefined' && localStorage.getItem('DEBUG_AUTH') === '1';
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

  const discoverPendingInvites = async (userId: string): Promise<void> => {
    try {
      await orgInviteListForCurrentUser();
    } catch (error) {
      logBackendError({
        module: 'BootstrapAuth',
        operation: 'discover pending organization invites',
        trigger: 'background',
        error,
        ids: {
          userId,
        },
      });
    }
  };

  const tryGetSessionFromUrl = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    const hasAuthCallback =
      window.location.hash.includes('access_token=') ||
      window.location.hash.includes('refresh_token=') ||
      window.location.hash.includes('type=');
    if (!hasAuthCallback) return;

    type AuthWithSessionFromUrl = {
      getSessionFromUrl: (options: { storeSession: boolean }) => Promise<{
        data: unknown;
        error: unknown;
      }>;
    };

    const authClient = supabase.auth as unknown as Partial<AuthWithSessionFromUrl>;
    if (typeof authClient.getSessionFromUrl !== 'function') {
      return;
    }

    const { data, error } = await authClient.getSessionFromUrl({ storeSession: true });
    console.log('[auth] getSessionFromUrl', data, error);
    history.replaceState(null, '', window.location.pathname + window.location.search);
  };


  /* ── FIRST EFFECT ▪ initial session check ───────────────────── */
  useEffect(() => {
    (async (): Promise<void> => {
      if (import.meta.env.DEV && debugAuth) {
        console.log('[useBootstrapAuth] starting initial session check');
      }
      setLoading({ initialization: true });

      try {
        await tryGetSessionFromUrl();

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log('[auth] getSession', sessionData, sessionError);

        if (sessionError) {
          logBackendError({
            module: 'BootstrapAuth',
            operation: 'get session',
            trigger: 'background',
            error: sessionError,
          });
          setError(getBackendErrorMessage(sessionError));
          clearAuth();
          return;
        }

        const session = sessionData?.session ?? null;
        if (!session) {
          // No session on initial load → nothing to validate or sign out
          clearAuth({ clearError: true });
          return;
        }

        // Validate that the user in the token still exists server-side
        const { data: userData, error: userError } = await supabase.auth.getUser();
        const userStatus = (userError as { status?: number } | null)?.status;
        const isAuthError = userStatus === 401 || userStatus === 403;
        if (userError || !userData?.user) {
          logBackendError({
            module: 'BootstrapAuth',
            operation: 'validate session user',
            trigger: 'background',
            error: userError ?? new Error('Session user is missing after getUser.'),
            ids: {
              userStatus,
            },
          });
          if (import.meta.env.DEV && debugAuth) {
            console.warn('[useBootstrapAuth] invalid or missing user, clearing session', userError);
          }
          // Only signOut if we actually had a session
          if (isAuthError) {
            await supabase.auth.signOut({ scope: 'local' });
            console.log('[auth] cleared local session after auth error');
          } else {
            await supabase.auth.signOut();
          }
          clearAuth();
          return;
        }

        const sessionUser = session.user ?? userData.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          try {
            await loadProfile(sessionUser.id);
            await discoverPendingInvites(sessionUser.id);
            if (import.meta.env.DEV && debugAuth) {
              console.log('[useBootstrapAuth] profile loaded');
            }
          } catch (err) {
            logBackendError({
              module: 'BootstrapAuth',
              operation: 'load profile during initial session bootstrap',
              trigger: 'background',
              error: err,
              ids: {
                userId: sessionUser.id,
              },
            });
            const msg = getBackendErrorMessage(err);
            setError(msg);
            if (import.meta.env.DEV && debugAuth) {
              console.error('[useBootstrapAuth] profile load error', err);
            }
          }
        } else {
          clearAuth({ clearError: true });
        }
      } finally {
        setLoading({ initialization: false });
        setInitialCheckDone(true);
        if (import.meta.env.DEV && debugAuth) {
          console.log('[useBootstrapAuth] initial session check complete');
        }
      }
    })().catch((err) => {
      logBackendError({
        module: 'BootstrapAuth',
        operation: 'initial session bootstrap',
        trigger: 'background',
        error: err,
      });
      setError(getBackendErrorMessage(err));
      clearAuth();
      setLoading({ initialization: false });
      setInitialCheckDone(true);
    });
  }, [setUser, loadProfile, clearAuth, setLoading, setError]);

  /* ── SECOND EFFECT ▪ subscribe to auth changes ──────────────── */
  useEffect(() => {
    if (!initialCheckDone) return;

    if (import.meta.env.DEV && debugAuth) {
      console.log('[useBootstrapAuth] registering onAuthStateChange listener');
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[auth]', event, !!session, session?.user?.id);
        if (import.meta.env.DEV && debugAuth) {
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

        // Validate user existence when a session is reported
        if (nextUser) {
          const { data: valUser, error: valErr } = await supabase.auth.getUser();
          const valStatus = (valErr as { status?: number } | null)?.status;
          const isAuthError = valStatus === 401 || valStatus === 403;
          if (valErr || !valUser?.user) {
            logBackendError({
              module: 'BootstrapAuth',
              operation: 'validate auth state user',
              trigger: 'background',
              error: valErr ?? new Error('Auth event user is missing after getUser.'),
              ids: {
                authEvent: event,
                userStatus: valStatus ?? null,
                userId: nextUser.id,
              },
            });
            if (import.meta.env.DEV && debugAuth) {
              console.warn('[useBootstrapAuth] auth event user invalid, clearing', valErr);
            }
            if (isAuthError) {
              await supabase.auth.signOut({ scope: 'local' });
              console.log('[auth] cleared local session after auth error');
            } else {
              await supabase.auth.signOut();
            }
            clearAuth();
            setLoading({ initialization: false });
            return;
          }
        } else {
          // No session/user → nothing to validate or sign out
          setUser(null);
          clearAuth({ clearError: true });
          setLoading({ initialization: false });
          return;
        }

        setUser(nextUser);

        const shouldLoadProfile =
          Boolean(nextUser) &&
          (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION');

        if (shouldLoadProfile && nextUser) {
          try {
            await loadProfile(nextUser.id);
            await discoverPendingInvites(nextUser.id);
          } catch (err) {
            logBackendError({
              module: 'BootstrapAuth',
              operation: 'load profile on auth state change',
              trigger: 'background',
              error: err,
              ids: {
                authEvent: event,
                userId: nextUser.id,
              },
            });
            const msg = getBackendErrorMessage(err);
            setError(msg);
            if (import.meta.env.DEV) {
              console.error('[useBootstrapAuth] profile load error', err);
            }
          }
        } else {
          clearAuth({ clearError: true });
        }

        setLoading({ initialization: false });
      },
    );

    return () => {
      if (import.meta.env.DEV && debugAuth) {
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
    if (loading.initialization || loading.auth || loading.profile || !user) return;
    const isProfileComplete = Boolean(profile?.profile_completed_at);
    if (isProfileComplete) return;

    const path = window.location.pathname;
    const isAuthRoute = path.startsWith('/onboarding') || path === '/';
    if (!isAuthRoute) {
      navigate('/onboarding/profile');
      return;
    }
    if (path === '/onboarding') {
      navigate('/onboarding/profile');
    }
  }, [loading.initialization, loading.auth, loading.profile, user, profile, navigate]);

  /* ── FOURTH EFFECT ▪ (removed) automatic org onboarding redirect ───────── */
  // Previous behavior redirected users to /organizations/onboarding when their
  // profile had no organization_id. That forced first-time users into org setup
  // immediately after sign-in. Per product decision, we no longer force this.
  // Users may open the Organization wizard manually via the Dashboard → Add Organization.
  // Leaving this comment to explain why automatic redirect was intentionally removed.
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