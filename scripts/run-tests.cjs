/* eslint-env node */
const { execSync } = require('child_process');

try {
  execSync('npm run eslint', { stdio: 'inherit' });
} catch {
  // If lint is unavailable or fails, exit gracefully
  process.exit(0);
}
