import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';
import { AuthProvider } from '@/context/AuthContext';
import { initGlobalErrorLogger } from './utils/errorLogger';
import { getValidatedClientEnv } from './utils/env-validator';

const env = getValidatedClientEnv();

if (!env.VITE_GOOGLE_MAPS_BROWSER_KEY && import.meta.env.DEV) {
  console.warn('Google Maps API key is missing. Map features will be unavailable.');
}

initGlobalErrorLogger();

/**
 * Clears any stale auth/session artifacts on page load.
 * (Optional: delete the file to disable without touching this entry.)
 */
import('@/utils/clearAuthStorage').catch(() => {
  if (import.meta.env.DEV) {
    console.warn('[main] clearAuthStorage helper not found – skipping');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
