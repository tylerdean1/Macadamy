type RequiredEnvName =
  | 'VITE_SUPABASE_URL'
  | 'VITE_SUPABASE_PUBLISHABLE_TOKEN';

type OptionalEnvName = 'VITE_GOOGLE_MAPS_BROWSER_KEY';

export interface ValidatedClientEnv {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_TOKEN: string;
  VITE_GOOGLE_MAPS_BROWSER_KEY?: string;
}

const REQUIRED_ENV_NAMES: readonly RequiredEnvName[] = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_TOKEN',
];

const OPTIONAL_ENV_NAMES: readonly OptionalEnvName[] = [
  'VITE_GOOGLE_MAPS_BROWSER_KEY',
];

const isBrowserRuntime = typeof window !== 'undefined';

function normalizeEnvValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function readViteEnv(name: string): string | undefined {
  return normalizeEnvValue(import.meta.env[name]);
}

function readNodeEnv(name: string): string | undefined {
  if (isBrowserRuntime) return undefined;

  const processLike = globalThis as { process?: { env?: Record<string, string | undefined> } };
  const nodeValue = processLike.process?.env?.[name];
  return normalizeEnvValue(nodeValue);
}

function readEnvValue(name: string): string | undefined {
  return readViteEnv(name) ?? readNodeEnv(name);
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

  const primaryName = names.length > 0 ? names[0] : 'UNKNOWN_ENV';
  throw new Error(`Missing required environment variable: ${primaryName}`);
}

/**
 * Returns an optional env var, falling back to `defaultValue`.
 */
export function getOptionalEnv(name: string, defaultValue: string): string {
  return readEnvValue(name) ?? defaultValue;
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

/**
 * Throws if ANY name in `vars` is unset or empty.
 */
export function validateEnvVariables(vars: readonly string[]): void {
  for (const name of vars) {
    getRequiredEnv(name);
  }
}

/**
 * Throws if ALL names in a group are unset or empty.
 */
export function validateEnvVariablesAny(groups: readonly (readonly string[])[]): void {
  for (const group of groups) {
    const hasAny = group.some((name) => readEnvValue(name) != null);
    if (!hasAny) {
      const firstName = group.length > 0 ? group[0] : 'UNKNOWN_ENV';
      throw new Error(`Missing required environment variable: ${firstName}`);
    }
  }
}

/**
 * Warns if ALL names in a group are unset or empty. Does not throw.
 */
export function warnEnvVariablesAny(groups: readonly (readonly string[])[], message: string): void {
  if (!import.meta.env.DEV) return;

  const hasMissingGroup = groups.some((group) => group.every((name) => readEnvValue(name) == null));
  if (hasMissingGroup) {
    console.warn(message);
  }
}

/**
 * Validates and returns browser-safe Vite environment variables.
 */
export function getValidatedClientEnv(): ValidatedClientEnv {
  const validated: ValidatedClientEnv = {
    VITE_SUPABASE_URL: getRequiredEnv(REQUIRED_ENV_NAMES[0]),
    VITE_SUPABASE_PUBLISHABLE_TOKEN: getRequiredEnv(REQUIRED_ENV_NAMES[1]),
  };

  const googleMapsKey = readEnvValue(OPTIONAL_ENV_NAMES[0]);
  if (googleMapsKey != null) {
    validated.VITE_GOOGLE_MAPS_BROWSER_KEY = googleMapsKey;
  }

  return validated;
}
