import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';
import { initGlobalErrorLogger } from './utils/errorLogger';
import { validateEnvVariablesAny, warnEnvVariablesAny } from './utils/env-validator';

validateEnvVariablesAny([
  ['NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL'],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'],
  ['VITE_GOOGLE_MAPS_API_KEY'],
]);

warnEnvVariablesAny(
  [['VITE_GOOGLE_MAPS_API_KEY']],
  'Google Maps API key is missing. Map features will be unavailable.'
);

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
      <App />
    </BrowserRouter>
  </StrictMode>,
);
