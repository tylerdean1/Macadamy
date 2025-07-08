/* eslint-env node */
const { execSync } = require('child_process');
let eslintAvailable = true;
try {
  require.resolve('eslint');
} catch {
  eslintAvailable = false;
}

const args = process.argv.slice(2).join(' ');
const cmd = `npx eslint \"src/**/*.{ts,tsx}\" --ignore-pattern src/lib/database.types.ts ${args}`;

try {
  if (eslintAvailable) {
    execSync(cmd, { stdio: 'inherit' });
  } else {
    console.warn('eslint not installed; skipping lint');
  }
} catch {
  process.exit(1);
}
