import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/lib/store';
import type { Database } from '@/lib/database.types';

type UserRole = Database['public']['Enums']['user_role_type'];

/** Route guard
 *
 *  ✔ Blocks unauthenticated users (redirects to `/`)
 *  ✔ Optionally requires a completed profile (`requireProfile`)
 *  ✔ Optionally checks that the user’s role is in `allowedRoles`
 *  ✔ All debug logs stripped from production via `import.meta.env.DEV`
 */
interface ProtectedRouteProps {
  /** Component(s) to render when access is granted */
  children: React.ReactNode;
  /** Redirect if `profile` is null (default = true) */
  requireProfile?: boolean;
  /** Allow only these roles (empty array → any role permitted) */
  allowedRoles?: readonly UserRole[];
  /** Where to send unauthenticated users (default = "/") */
  redirectUnauthenticatedTo?: string;
  /** Where to send users lacking the required role (default = "/dashboard") */
  redirectUnauthorizedTo?: string;
}

export function ProtectedRoute({
  children,
  requireProfile = true,
  allowedRoles = [],
  redirectUnauthenticatedTo = '/',
  redirectUnauthorizedTo = '/dashboard',
}: ProtectedRouteProps): JSX.Element {
  const { user, profile, loading } = useAuthStore();

  /* ── 1 ▪ initial auth bootstrap ─────────────────────────────── */
  if (loading.initialization) {
    if (import.meta.env.DEV) {
      console.log('[ProtectedRoute] waiting for auth bootstrap…');
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  /* ── 2 ▪ no user ⇒ kick to landing ──────────────────────────── */
  if (user == null) {
    if (import.meta.env.DEV) {
      console.warn('[ProtectedRoute] no user – redirecting');
    }
    return <Navigate to={redirectUnauthenticatedTo} replace />;
  }

  /* ── 3 ▪ profile required but missing ───────────────────────── */
  if (requireProfile && profile == null) {
    if (import.meta.env.DEV) {
      console.warn('[ProtectedRoute] profile missing – redirecting to /onboarding');
    }
    return <Navigate to="/onboarding" replace />;
  }

  /* ── 4 ▪ role gate, if specified ───────────────────────────── */
  if (profile && allowedRoles.length > 0) {
    const hasRole = profile.role != null && allowedRoles.includes(profile.role);
    if (!hasRole) {
      if (import.meta.env.DEV) {
        console.warn('[ProtectedRoute] role check failed – redirecting');
      }
      return <Navigate to={redirectUnauthorizedTo} replace />;
    }
  }

  /* ── 5 ▪ all clear ──────────────────────────────────────────── */
  return <>{children}</>;
}