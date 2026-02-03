// <start env-validator.ts>
/**
 * Runtime helpers for validating Vite-style `import.meta.env` variables.
 *
 * All functions throw a plain `Error` so CI/dev fail fast when a required
 * variable is missing.  Returns are always `string` (never undefined).
 */

type EnvValue = string | boolean | undefined;

const viteEnv: Record<string, EnvValue> =
  typeof import.meta !== 'undefined' && 'env' in import.meta
    ? (import.meta.env as Record<string, EnvValue>)
    : {};

const nodeEnv: Record<string, string | undefined> =
  typeof process !== 'undefined' && process.env
    ? (process.env as Record<string, string | undefined>)
    : {};

function readEnvValue(name: string): string | undefined {
  const viteValue = viteEnv[name];
  if (typeof viteValue === 'string' && viteValue.trim() !== '') {
    return viteValue;
  }
  const nodeValue = nodeEnv[name];
  if (typeof nodeValue === 'string' && nodeValue.trim() !== '') {
    return nodeValue;
  }
  return undefined;
}

/**
 * Throws if ANY name in `vars` is unset or empty.
 */
export function validateEnvVariables(vars: readonly string[]): void {
  const missing = vars.filter((v) => readEnvValue(v) == null);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Throws if ALL names in a group are unset or empty.
 */
export function validateEnvVariablesAny(groups: readonly (readonly string[])[]): void {
  const missingGroups = groups.filter((group) => group.every((name) => readEnvValue(name) == null));
  if (missingGroups.length > 0) {
    const labels = missingGroups.map((g) => g.join(' | '));
    throw new Error(`Missing required environment variables: ${labels.join(', ')}`);
  }
}

/**
 * Warns if ALL names in a group are unset or empty. Does not throw.
 */
export function warnEnvVariablesAny(groups: readonly (readonly string[])[], message: string): void {
  const isDev = typeof import.meta !== 'undefined' && 'env' in import.meta && Boolean(import.meta.env?.DEV);
  if (!isDev) return;
  const missingGroups = groups.filter((group) => group.every((name) => readEnvValue(name) == null));
  if (missingGroups.length > 0) {
    console.warn(message);
  }
}

/**
 * Returns a single required env var (never undefined).
 */
export function getRequiredEnv(name: string): string {
  const value = readEnvValue(name);
  if (value == null) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Returns the first non-empty env var from a list of names.
 */
export function getRequiredEnvAny(names: readonly string[]): string {
  for (const name of names) {
    const value = readEnvValue(name);
    if (value != null) return value;
  }
  throw new Error(`Missing required environment variable: ${names.join(' | ')}`);
}

/**
 * Returns an optional env var, falling back to `defaultValue`.
 */
export function getOptionalEnv(name: string, defaultValue: string): string {
  const value = readEnvValue(name);
  return value == null ? defaultValue : value;
}

/**
 * Returns the first non-empty env var from a list of names, or defaultValue.
 */
export function getOptionalEnvAny(names: readonly string[], defaultValue: string): string {
  for (const name of names) {
    const value = readEnvValue(name);
    if (value != null) return value;
  }
  return defaultValue;
}
// <end env-validator.ts>
