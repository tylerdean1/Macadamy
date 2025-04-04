import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}