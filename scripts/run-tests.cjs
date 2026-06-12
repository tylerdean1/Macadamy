/* eslint-env node */
const { spawnSync } = require('child_process');

const checks = [
  ['npm', ['run', 'eslint']],
  ['npm', ['run', 'test:unit']]
];

for (const [command, args] of checks) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.error) {
    console.error('[test-runner] failed to start check', {
      command: [command, ...args].join(' '),
      error: result.error
    });
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
