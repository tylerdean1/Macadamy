import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';
import { initGlobalErrorLogger } from './utils/errorLogger';

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
