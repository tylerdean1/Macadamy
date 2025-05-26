export function logError(scope: string, error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`[${scope}] ${err.message}`, {
    stack: err.stack,
    full: error,
  });
}