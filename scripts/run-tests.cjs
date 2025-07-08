/* eslint-env node */
const { execSync } = require('child_process');

try {
  execSync('npm run lint', { stdio: 'inherit' });
} catch (err) {
  process.exit(1);
}
