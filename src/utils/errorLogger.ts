export function logError(scope: string, error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`[${scope}] ${err.message}`, {
    stack: err.stack,
    full: error,
  });
}

let isInitialized = false;

/**
 * Registers global listeners for `error` and `unhandledrejection` events.
 * Logged errors include message and stack for easier debugging.
 *
 * Call once at application startup.
 */
export function initGlobalErrorLogger(scope = 'global'): void {
  if (isInitialized) return;
  isInitialized = true;

  window.addEventListener('error', (event) => {
    logError(`${scope}:error`, event.error ?? event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError(`${scope}:unhandledrejection`, event.reason);
  });
}