export function logError(location: string, error: unknown): void {
  const err = error as Error;
  console.error(`[${location}]`, {
    message: err.message,
    stack: err.stack,
    full: err,
  });
}
