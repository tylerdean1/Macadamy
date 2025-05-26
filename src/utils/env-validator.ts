// <start env-validator.ts>
/**
 * Runtime helpers for validating Vite-style `import.meta.env` variables.
 *
 * All functions throw a plain `Error` so CI/dev fail fast when a required
 * variable is missing.  Returns are always `string` (never undefined).
 */

/**
 * Throws if ANY name in `vars` is unset or empty.
 */
export function validateEnvVariables(vars: readonly string[]): void {
  const missing = vars.filter((v) => {
    const value = import.meta.env[v] as unknown as string | undefined;
    return value == null || value === '';
  });
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Returns a single required env var (never undefined).
 */
export function getRequiredEnv(name: string): string {
  const value = import.meta.env[name] as unknown as string | undefined;
  if (value == null || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Returns an optional env var, falling back to `defaultValue`.
 */
export function getOptionalEnv(name: string, defaultValue: string): string {
  const value = import.meta.env[name] as unknown as string | undefined;
  return value == null || value === '' ? defaultValue : value;
}
// <end env-validator.ts>
