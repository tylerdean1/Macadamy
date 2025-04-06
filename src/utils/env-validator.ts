/**
 * Environment variables validation utility 
 */

/**
 * Validates that required environment variables are present
 * @param variables - Array of required environment variable names
 * @throws Error if any required variable is missing
 */
export function validateEnvVariables(variables: string[]): void {
  const missing = variables.filter(variable => {
    const value = import.meta.env[variable];
    return value === undefined || value === '';
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Gets a required environment variable
 * @param name - The name of the environment variable
 * @returns The value of the environment variable
 * @throws Error if the environment variable is missing
 */
export function getRequiredEnv(name: string): string {
  const value = import.meta.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 * @param name - The name of the environment variable
 * @param defaultValue - The default value to return if the variable is missing
 * @returns The value of the environment variable or the default value
 */
export function getOptionalEnv(name: string, defaultValue: string): string {
  const value = import.meta.env[name];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value;
}