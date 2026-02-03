/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function resolveRepoRoot() {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8', shell: true });
  if (r.status === 0) {
    const p = String(r.stdout || '').trim();
    if (p) return p;
  }
  return process.cwd();
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const out = { appDir: '', distDir: '' };
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--app' && args[i + 1]) {
      out.appDir = String(args[i + 1]);
      i += 1;
      continue;
    }
    if (a === '--dist' && args[i + 1]) {
      out.distDir = String(args[i + 1]);
      i += 1;
      continue;
    }
  }
  return out;
}

async function rm(targetPath) {
  try {
    await fs.promises.rm(targetPath, { recursive: true, force: true, maxRetries: 3 });
  } catch (err) {
    try {
      const renamed = `${targetPath}__old__${Date.now()}`;
      await fs.promises.rename(targetPath, renamed);
      await fs.promises.rm(renamed, { recursive: true, force: true, maxRetries: 3 });
    } catch (err2) {
      console.warn('[clean-next] failed:', err2 && err2.message ? err2.message : String(err2));
      process.exitCode = 0;
    }
  }
}

(async () => {
  const repoRoot = resolveRepoRoot();
  const cli = parseArgs(process.argv);

  const appDir = cli.appDir || process.env.NEXT_APP_DIR || 'apps/web';
  const distDir = cli.distDir || process.env.NEXT_DIST_DIR || '.next';

  const dist = path.resolve(repoRoot, appDir, distDir);
  await rm(dist);
  console.log(`[clean-next] removed ${path.relative(repoRoot, dist)}`);
})();
