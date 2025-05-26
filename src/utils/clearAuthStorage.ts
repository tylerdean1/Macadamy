/**
 * Wipes any corrupted auth blob from localStorage and forces a hard reload.
 * Exposed as `window.clearAuthStorage()` in DEV builds for quick recovery.
 */

const STORAGE_KEY = 'auth-profile-storage';

export function clearAuthStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.info('[Auth] Cleared stale auth storage – reloading…');
    window.location.reload();
  } catch (err) {
    console.error('[Auth] Failed to clear auth storage:', err);
  }
}

/* Expose globally ONLY in development bundles */
declare global {
  interface Window {
    clearAuthStorage: typeof clearAuthStorage;
  }
}

if (import.meta.env.DEV) {
  window.clearAuthStorage = clearAuthStorage;
}

