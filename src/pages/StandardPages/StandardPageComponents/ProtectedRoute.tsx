import React from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection
import { useAuthStore } from '@/lib/store'; // Import auth store to manage user state

// ProtectedRoute component that guards access to certain routes
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user); // Get the current user from the auth store

  // If no user is authenticated, redirect to the home page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Render the child components if user is authenticated
  return <>{children}</>;
}