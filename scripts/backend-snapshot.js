#!/usr/bin/env node
/* eslint-env node */
/* global console, process, URL */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
/**
 * backend-snapshot.js (monorepo-aware, schema-only)
 *
 * Writes backend snapshots to repo root (or --out-dir):
 *  - backend.snapshot.md  (always; from `supabase gen types`)
 *  - backend.snapshot.sql (optional; best-effort schema dump)
 *
 * Env loading order:
 *  1) ENV_PATH (explicit)
 *  2) <repo>/.env.local
 *  3) <repo>/apps/web/.env.local
 *  4) default dotenv lookup
 *
 * Requirements:
 *  - For types: VITE_SUPABASE_URL (derive ref) or SUPABASE_PROJECT_REF or DATABASE_URL
 *  - For SQL dump: DATABASE_URL (and docker or pg_dump)
 *
 * Never prints secrets (DATABASE_URL) to console.
 *
 * NOTE: This version intentionally does NOT attempt to dump or append data
 * for any specific tables. It produces schema-only SQL dumps (best-effort).
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ------------------------------
// CLI args
// ------------------------------
function parseArgs(argv) {
  const args = argv.slice(2);
  const out = {
    outDir: '',
    schema: '',
  };

  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--out-dir' && args[i + 1]) {
      out.outDir = String(args[i + 1]);
      i += 1;
      continue;
    }
    if (a === '--schema' && args[i + 1]) {
      out.schema = String(args[i + 1]);
      i += 1;
      continue;
    }
  }
  return out;
}

function runCmd(cmd, args, label, opts) {
  const redactDbUrl = Boolean(opts && opts.redactDbUrl);
  const dbUrl = (opts && opts.dbUrl) || '';

  const printableArgs = redactDbUrl
    ? args.map((val, idx) => {
      const prev = args[idx - 1];
      if (prev === '--db-url') return '[REDACTED_DB_URL]';
      if (dbUrl && val === dbUrl) return '[REDACTED_DB_URL]';
      return val;
    })
    : args;

  console.log(`Running: ${cmd} ${printableArgs.join(' ')} (${label})`);

  // shell:true matches your previous behavior and is fine here because we never print secrets.
  // (If you ever run into special character parsing issues on Windows, switch this to shell:false.)
  const res = spawnSync(cmd, args, { encoding: 'utf8', shell: true });

  if (res.error) {
    console.error(`Failed to run command (${label}):`, res.error);
    process.exit(1);
  }
  if (res.status !== 0) {
    console.error(`${cmd} exited non-zero (${label}):`);
    console.error(res.stderr || res.stdout);
    process.exit(res.status || 1);
  }

  return res.stdout || '';
}

function runCmdToFile(cmd, args, label, opts) {
  const redactDbUrl = Boolean(opts && opts.redactDbUrl);
  const dbUrl = (opts && opts.dbUrl) || '';

  const printableArgs = redactDbUrl
    ? args.map((val, idx) => {
      const prev = args[idx - 1];
      if (prev === '--db-url') return '[REDACTED_DB_URL]';
      if (dbUrl && val === dbUrl) return '[REDACTED_DB_URL]';
      return val;
    })
    : args;

  console.log(`Running: ${cmd} ${printableArgs.join(' ')} (${label})`);

  const res = spawnSync(cmd, args, { encoding: 'utf8', shell: false, stdio: 'inherit' });

  if (res.error) {
    console.error(`Failed to run command (${label}):`, res.error);
    process.exit(1);
  }
  if (res.status !== 0) {
    console.error(`${cmd} exited non-zero (${label}).`);
    process.exit(res.status || 1);
  }
}

function commandExists(cmd) {
  const r = spawnSync(cmd, ['--version'], { encoding: 'utf8', shell: true });
  return r.status === 0;
}

function dockerAvailable() {
  const r = spawnSync('docker', ['version'], { encoding: 'utf8', shell: true });
  return r.status === 0;
}

function safeWrite(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, 'utf8');
}

function resolveRepoRoot() {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
    shell: true,
  });
  if (r.status === 0) {
    const p = String(r.stdout || '').trim();
    if (p) return p;
  }
  return process.cwd();
}

// ------------------------------
// Env loading
// ------------------------------
function tryLoadDotenv(dotenvPath) {
  try {
    if (dotenvPath && fs.existsSync(dotenvPath)) {
      require('dotenv').config({ path: dotenvPath });
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

function loadEnv(repoRoot) {
  const explicit = String(process.env.ENV_PATH || '').trim();
  if (explicit && tryLoadDotenv(path.resolve(repoRoot, explicit))) return;

  const candidates = [
    path.resolve(repoRoot, '.env.local'),
    path.resolve(repoRoot, 'apps', 'web', '.env.local'),
  ];

  for (const c of candidates) {
    if (tryLoadDotenv(c)) return;
  }

  try {
    require('dotenv').config();
  } catch {
    // ignore
  }
}

function deriveProjectRefFromUrl(supabaseUrl) {
  if (!supabaseUrl) return '';
  try {
    const url = new URL(supabaseUrl);
    return String(url.hostname.split('.')[0] || '').trim();
  } catch {
    return '';
  }
}

// ------------------------------
// Main
// ------------------------------
const repoRoot = resolveRepoRoot();
loadEnv(repoRoot);

const cli = parseArgs(process.argv);
const env = process.env;

const schema = cli.schema || env.SUPABASE_TYPEGEN_SCHEMA || 'public,auth';

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';
const dbUrl = env.DATABASE_URL || env.SUPABASE_DB_URL || '';
let projectRef = env.SUPABASE_PROJECT_REF || env.SUPABASE_PROJECT_ID || '';

if (!projectRef) {
  projectRef = deriveProjectRefFromUrl(supabaseUrl);
}

if (!projectRef && !dbUrl) {
  console.error(
    'Error: Need either VITE_SUPABASE_URL to derive project ref, SUPABASE_PROJECT_REF, or DATABASE_URL.',
  );
  process.exit(1);
}

const outDir = cli.outDir ? path.resolve(repoRoot, cli.outDir) : repoRoot;
const outMd = path.resolve(outDir, 'backend.snapshot.md');
const outSql = path.resolve(outDir, 'backend.snapshot.sql');

// 1) Always generate types snapshot
let typesOut = '';
if (projectRef) {
  console.log('Using Supabase project id/ref:', projectRef);
  typesOut = runCmd(
    'npx',
    ['supabase', 'gen', 'types', 'typescript', '--project-id', projectRef, '--schema', schema],
    'types',
    { redactDbUrl: false },
  );
} else {
  console.log('No project ref found; using DATABASE_URL for types.');
  typesOut = runCmd(
    'npx',
    ['supabase', 'gen', 'types', 'typescript', '--db-url', dbUrl, '--schema', schema],
    'types',
    { redactDbUrl: true, dbUrl },
  );
}

// 2) Optional SQL dump (schema only)
let sqlDumpWritten = false;
let sqlDumpMethod = '';
let sqlDumpNote = '';

if (dbUrl && dockerAvailable()) {
  runCmdToFile(
    'npx',
    ['supabase', 'db', 'dump', '--db-url', dbUrl, '--schema', schema, '--file', outSql],
    'db dump (docker)',
    { redactDbUrl: true, dbUrl },
  );
  sqlDumpWritten = true;
  sqlDumpMethod = 'supabase db dump (Docker)';
} else if (dbUrl && commandExists('pg_dump')) {
  runCmdToFile(
    'pg_dump',
    ['--schema=public', '--schema=auth', '--no-owner', '--no-privileges', '--file', outSql, dbUrl],
    'pg_dump',
    { redactDbUrl: true, dbUrl },
  );
  sqlDumpWritten = true;
  sqlDumpMethod = 'pg_dump (local Postgres tools)';
} else {
  if (!dbUrl) {
    sqlDumpNote = 'No DATABASE_URL provided, so a full SQL dump was skipped.\n';
  } else {
    sqlDumpNote =
      'Skipped full SQL dump: Docker is not available and pg_dump is not installed.\n' +
      'You still got a types-based backend snapshot (tables/enums/RPC signatures).\n';
  }
}

if (sqlDumpWritten) {
  console.log(`Wrote full SQL backend snapshot to: ${outSql} (${sqlDumpMethod})`);
}

// 3) Always write MD snapshot
const now = new Date().toISOString();
const md = `# Backend Snapshot

Generated: ${now}
Repo root: ${repoRoot}

## What this is
This file is a reference snapshot of the Supabase backend as seen by type generation.

## What it contains
- Generated TypeScript definitions from: \`supabase gen types\`
- Schemas included: \`${schema}\`

## Full SQL dump
${sqlDumpWritten
    ? `✅ Generated \`backend.snapshot.sql\` using: **${sqlDumpMethod}**`
    : `❌ Not generated.\n\n${String(sqlDumpNote || '').trim()}`
  }

---

## Generated Types

\`\`\`ts
${String(typesOut || '').trim()}
\`\`\`
`;

safeWrite(outMd, md);
console.log('Wrote backend snapshot to:', outMd);