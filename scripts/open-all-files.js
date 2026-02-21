/* eslint-disable no-console */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Opens files in the current VS Code window with a delay.
// Monorepo-aware: defaults to scanning apps/web + packages/shared if they exist.

const fs = require('fs');
const path = require('path');
const { exec, spawnSync } = require('child_process');

function resolveRepoRoot() {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8', shell: true });
  if (r.status === 0) {
    const p = String(r.stdout || '').trim();
    if (p) return p;
  }
  return process.cwd();
}

const REPO_ROOT = resolveRepoRoot();

const DEFAULT_DELAY_MS = 100;
const delayMs = Number.parseInt(process.env.OPENALL_DELAY_MS || '', 10);
const DELAY = Number.isFinite(delayMs) ? delayMs : DEFAULT_DELAY_MS;

const DRY_RUN = String(process.env.OPENALL_DRY_RUN || '').trim() === '1';

// Optional: only open certain extensions.
// Example: OPENALL_EXTS=.ts,.tsx,.md,.json
const EXTS = (() => {
  const raw = String(process.env.OPENALL_EXTS || '').trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.startsWith('.') ? s.toLowerCase() : `.${s.toLowerCase()}`)),
  );
})();

// Default skip set (add more as needed)
const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'out',
  '.turbo',
  'coverage',
  '.vercel',
  'supabase',
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isWin() {
  return process.platform === 'win32';
}

function firstExistingPath(candidates) {
  for (const p of candidates) {
    if (!p) continue;
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }
  return null;
}

function resolveVsCodeCliCommand() {
  const override = String(process.env.OPENALL_CODE_CMD || '').trim();
  if (override) return override;
  if (!isWin()) return 'code';

  const localAppData = process.env.LOCALAPPDATA || '';
  const programFiles = process.env.ProgramFiles || '';
  const programFilesX86 = process.env['ProgramFiles(x86)'] || '';

  const candidates = [
    'code',
    'code.cmd',
    localAppData
      ? path.join(localAppData, 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd')
      : null,
    localAppData
      ? path.join(localAppData, 'Programs', 'Microsoft VS Code Insiders', 'bin', 'code.cmd')
      : null,
    programFiles ? path.join(programFiles, 'Microsoft VS Code', 'bin', 'code.cmd') : null,
    programFilesX86 ? path.join(programFilesX86, 'Microsoft VS Code', 'bin', 'code.cmd') : null,
  ];

  return firstExistingPath(candidates) || 'code';
}

function getDefaultTargets(repoRoot) {
  const candidates = [
    path.join(repoRoot, 'apps', 'web'),
    path.join(repoRoot, 'packages', 'shared'),
  ];
  const existing = candidates.filter((p) => fs.existsSync(p));
  return existing.length ? existing : [repoRoot];
}

// Optional: specify targets (relative to repo root) to scan
// Example: OPENALL_TARGETS=apps/web,packages/shared
function getTargets(repoRoot) {
  const raw = String(process.env.OPENALL_TARGETS || '').trim();
  if (!raw) return getDefaultTargets(repoRoot);
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const abs = parts.map((p) => path.resolve(repoRoot, p)).filter((p) => fs.existsSync(p));
  return abs.length ? abs : getDefaultTargets(repoRoot);
}

async function listFilesRecursive(rootDir) {
  const results = [];
  const stack = [rootDir];

  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;

      if (EXTS) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!EXTS.has(ext)) continue;
      }

      results.push(fullPath);
    }
  }

  results.sort((a, b) => a.localeCompare(b));
  return results;
}

function openFileInVSCode(codeCmd, filePath) {
  return new Promise((resolve) => {
    const cmd = `"${codeCmd}" -r "${filePath}"`;
    exec(cmd, { windowsHide: true }, (error) => {
      if (error) {
        console.error('[openall] Error opening:', filePath, error.message || String(error));
      }
      resolve();
    });
  });
}

(async () => {
  const codeCmd = resolveVsCodeCliCommand();
  const targets = getTargets(REPO_ROOT);

  console.log(`[openall] repo root: ${REPO_ROOT}`);
  console.log(`[openall] targets: ${targets.map((t) => path.relative(REPO_ROOT, t)).join(', ')}`);
  console.log(`[openall] delay: ${DELAY}ms`);
  console.log(`[openall] skipping dirs: ${Array.from(SKIP_DIRS).join(', ')}`);
  console.log(`[openall] code cmd: ${codeCmd}`);
  if (EXTS) console.log(`[openall] exts: ${Array.from(EXTS).join(', ')}`);

  const allFiles = [];
  for (const t of targets) {
    // eslint-disable-next-line no-await-in-loop
    const files = await listFilesRecursive(t);
    allFiles.push(...files);
  }

  // Unique + stable order
  const files = Array.from(new Set(allFiles)).sort((a, b) => a.localeCompare(b));
  console.log(`[openall] files: ${files.length}`);

  if (!files.length) {
    console.log('[openall] No files found.');
    process.exit(0);
  }

  if (DRY_RUN) {
    files.forEach((f) => console.log(path.relative(REPO_ROOT, f)));
    process.exit(0);
  }

  for (let i = 0; i < files.length; i += 1) {
    const f = files[i];
    console.log(`[openall] (${i + 1}/${files.length}) ${path.relative(REPO_ROOT, f)}`);
    // eslint-disable-next-line no-await-in-loop
    await openFileInVSCode(codeCmd, f);
    // eslint-disable-next-line no-await-in-loop
    await sleep(DELAY);
  }

  console.log('[openall] done');
})();
