/* eslint-env node */
const { execSync } = require('child_process');

const args = process.argv.slice(2).join(' ');
const cmd = `npx eslint . --ext .ts,.tsx ${args}`;

try {
  execSync(cmd, { stdio: 'inherit' });
} catch (err) {
  process.exit(1);
}
