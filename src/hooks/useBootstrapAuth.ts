import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
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

  // Helper: retry profile load briefly to allow server trigger to create row post-confirm
  const loadProfileWithRetry = async (uid: string, attempts = 5, delayMs = 600): Promise<void> => {
    for (let i = 0; i < attempts; i++) {
      await loadProfile(uid);
      const state = useAuthStore.getState();
      if (state.profile) return;
      const msg = state.error ?? '';
      const needsRetry = typeof msg === 'string' && msg.includes('profile not found');
      if (!needsRetry) return;
      await new Promise(res => setTimeout(res, delayMs));
    }
  };

  /* ── FIRST EFFECT ▪ initial session check ───────────────────── */
  useEffect(() => {
    (async (): Promise<void> => {
      if (import.meta.env.DEV && debugAuth) {
        console.log('[useBootstrapAuth] starting initial session check');
      }
      setLoading({ initialization: true });

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          if (import.meta.env.DEV && debugAuth) {
            console.error('[useBootstrapAuth] session error', sessionError);
          }
          setError(sessionError.message);
          clearAuth();
          return;
        }

        const activeSession = sessionData.session;
        if (!activeSession) {
          // No session on initial load → nothing to validate or sign out
          clearAuth();
          return;
        }

        // Validate that the user in the token still exists server-side
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          if (import.meta.env.DEV && debugAuth) {
            console.warn('[useBootstrapAuth] invalid or missing user, clearing session', userError);
          }
          // Only signOut if we actually had a session
          await supabase.auth.signOut();
          clearAuth();
          return;
        }

        const sessionUser = activeSession.user ?? userData.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          try {
            // Attempt to create the profile first (post-email confirm) BEFORE any filter call
            try {
              const raw = localStorage.getItem('pending_profile');
              if (raw) {
                const parsed = JSON.parse(raw) as {
                  userId: string;
                  input: {
                    full_name: string;
                    phone?: string | null;
                    role: string;
                    job_title_id?: string | null;
                    organization_id?: string | null;
                  };
                  email: string;
                };
                if (parsed && parsed.userId === sessionUser.id) {
                  const { rpcClient } = await import('@/lib/rpc.client');
                  const payload = {
                    id: sessionUser.id,
                    email: parsed.email.toLowerCase(),
                    full_name: parsed.input.full_name,
                    phone: parsed.input.phone ?? null,
                    role: parsed.input.role as Database['public']['Enums']['user_role_type'],
                    job_title_id: parsed.input.job_title_id ?? null,
                    organization_id: parsed.input.organization_id ?? null,
                  } as unknown as import('@/lib/database.types').Json;
                  try {
                    await rpcClient.insert_profiles({ _input: payload });
                  } catch {
                    // Fallback: directly insert into table (RLS should allow creating own profile)
                    try {
                      await supabase.from('profiles').insert({
                        id: sessionUser.id,
                        email: parsed.email.toLowerCase(),
                        full_name: parsed.input.full_name,
                        phone: parsed.input.phone ?? null,
                        role: parsed.input.role as Database['public']['Enums']['user_role_type'],
                        job_title_id: parsed.input.job_title_id ?? null,
                        organization_id: parsed.input.organization_id ?? null,
                      });
                    } catch {/* ignore, loadProfile will surface any issue */ }
                  }
                  localStorage.removeItem('pending_profile');
                }
              }
            } catch {/* best effort */ }

            // Safety: if no pending_profile was present, ensure a minimal profile row exists
            try {
              const email = sessionUser.email ? sessionUser.email.toLowerCase() : null;
              if (email) {
                await supabase.from('profiles').upsert(
                  { id: sessionUser.id, email },
                  { onConflict: 'id', ignoreDuplicates: true }
                );
              }
            } catch {/* ignore */ }

            await loadProfileWithRetry(sessionUser.id);
            if (import.meta.env.DEV && debugAuth) {
              console.log('[useBootstrapAuth] profile loaded');
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error loading user profile';
            setError(msg);
            if (import.meta.env.DEV && debugAuth) {
              console.error('[useBootstrapAuth] profile load error', err);
            }
          }
        } else {
          clearAuth();
        }
      } finally {
        setLoading({ initialization: false });
        setInitialCheckDone(true);
        if (import.meta.env.DEV && debugAuth) {
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

    if (import.meta.env.DEV && debugAuth) {
      console.log('[useBootstrapAuth] registering onAuthStateChange listener');
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
          if (valErr || !valUser?.user) {
            if (import.meta.env.DEV && debugAuth) {
              console.warn('[useBootstrapAuth] auth event user invalid, clearing', valErr);
            }
            await supabase.auth.signOut();
            clearAuth();
            setLoading({ initialization: false });
            return;
          }
        } else {
          // No session/user → nothing to validate or sign out
          setUser(null);
          clearAuth();
          setLoading({ initialization: false });
          return;
        }

        setUser(nextUser);

        if (nextUser) {
          try {
            // If profile doesn’t exist yet, create it from pending_profile (post-email confirm)
            try {
              const raw = localStorage.getItem('pending_profile');
              if (raw) {
                const parsed = JSON.parse(raw) as {
                  userId: string;
                  input: {
                    full_name: string;
                    phone?: string | null;
                    role: string;
                    job_title_id?: string | null;
                    organization_id?: string | null;
                  };
                  email: string;
                };
                if (parsed && parsed.userId === nextUser.id) {
                  const { rpcClient } = await import('@/lib/rpc.client');
                  const payload = {
                    id: nextUser.id,
                    email: parsed.email.toLowerCase(),
                    full_name: parsed.input.full_name,
                    phone: parsed.input.phone ?? null,
                    role: parsed.input.role as Database['public']['Enums']['user_role_type'],
                    job_title_id: parsed.input.job_title_id ?? null,
                    organization_id: parsed.input.organization_id ?? null,
                  } as unknown as import('@/lib/database.types').Json;
                  try {
                    await rpcClient.insert_profiles({ _input: payload });
                  } catch {
                    // Fallback: directly insert into table
                    try {
                      await supabase.from('profiles').insert({
                        id: nextUser.id,
                        email: parsed.email.toLowerCase(),
                        full_name: parsed.input.full_name,
                        phone: parsed.input.phone ?? null,
                        role: parsed.input.role as Database['public']['Enums']['user_role_type'],
                        job_title_id: parsed.input.job_title_id ?? null,
                        organization_id: parsed.input.organization_id ?? null,
                      });
                    } catch {/* ignore */ }
                  }
                  localStorage.removeItem('pending_profile');
                }
              }
            } catch {/* best effort */ }
            // Safety: ensure minimal profile exists if pending data missing (e.g. opened link in another browser)
            try {
              const email = nextUser.email ? nextUser.email.toLowerCase() : null;
              if (email) {
                await supabase.from('profiles').upsert(
                  { id: nextUser.id, email },
                  { onConflict: 'id', ignoreDuplicates: true }
                );
              }
            } catch {/* ignore */ }

            await loadProfileWithRetry(nextUser.id);
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
    if (!loading.initialization && user && profile == null) {
      const isAuthRoute = window.location.pathname.startsWith('/onboarding') || window.location.pathname === '/';
      if (!isAuthRoute) {
        navigate('/onboarding');
      }
    }
  }, [loading.initialization, user, profile, navigate]);

  /* ── FOURTH EFFECT ▪ org onboarding redirect when org_id is null ──────── */
  useEffect(() => {
    if (loading.initialization) return;
    if (!user || !profile) return;
    const noOrg = profile.organization_id === null || profile.organization_id === '';
    if (!noOrg) return;
    const path = window.location.pathname;
    const alreadyOnOrgOnboarding = path.startsWith('/organizations/onboarding');
    const isAuthFlow = path.startsWith('/onboarding');
    if (!alreadyOnOrgOnboarding && !isAuthFlow) {
      navigate('/organizations/onboarding');
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