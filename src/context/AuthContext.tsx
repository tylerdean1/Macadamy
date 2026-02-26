import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { getBackendErrorMessage, logBackendError } from '@/lib/backendErrors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeSession = async (): Promise<void> => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error) {
        logBackendError({
          module: 'AuthContext',
          operation: 'initialize session',
          trigger: 'background',
          error,
        });
        setSession(null);
        setUser(null);
        setError(getBackendErrorMessage(error));
        setLoading(false);
        return;
      }

      const activeSession = data.session;
      setSession(activeSession);
      setUser(activeSession?.user ?? null);
      setError(null);
      setLoading(false);
    };

    void initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setError(null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logBackendError({
          module: 'AuthContext',
          operation: 'global sign out',
          trigger: 'user',
          error,
        });

        const { error: localError } = await supabase.auth.signOut({ scope: 'local' });
        if (localError) {
          throw localError;
        }
      }
    } finally {
      useAuthStore.getState().clearAuth({ clearError: true });
      setSession(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      error,
      logout,
    }),
    [user, session, loading, error, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
