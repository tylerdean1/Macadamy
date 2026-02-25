#!/usr/bin/env node
/// <reference types="node" />
/* eslint-env node */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function resolveRepoRoot() {
    const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8', shell: true });
    if (r.status === 0) {
        const p = String(r.stdout || '').trim();
        if (p) return p;
    }
    return process.cwd();
}

function tryLoadDotenv(p) {
    try {
        if (p && fs.existsSync(p)) {
            require('dotenv').config({ path: p });
            return true;
        }
    } catch (_) {
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
    } catch (_) {
        // ignore
    }
}

function deriveProjectRefFromUrl(supabaseUrl) {
    if (!supabaseUrl) return '';
    try {
        const url = new URL(supabaseUrl);
        return String(url.hostname.split('.')[0] || '').trim();
    } catch (_) {
        return '';
    }
}

function parseArgs(argv) {
    const args = argv.slice(2);
    const out = { out: '', schema: '' };
    for (let i = 0; i < args.length; i += 1) {
        const a = args[i];
        if (a === '--out' && args[i + 1]) {
            out.out = String(args[i + 1]);
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

const repoRoot = resolveRepoRoot();
loadEnv(repoRoot);
const cli = parseArgs(process.argv);

const env = process.env;
const schema = cli.schema || env.SUPABASE_TYPEGEN_SCHEMA || 'public,auth';

const supabaseUrl =
    env.VITE_SUPABASE_URL || env.SUPABASE_URL || '';

let projectRef = env.SUPABASE_PROJECT_REF || env.SUPABASE_PROJECT_ID || '';
let dbUrl = env.DATABASE_URL || env.SUPABASE_DB_URL || '';

// derive ref if needed
if (!projectRef) projectRef = deriveProjectRefFromUrl(supabaseUrl);

// Build a DB URL from PG* vars if not provided
if (!dbUrl) {
    const host = env.PGHOST;
    const port = env.PGPORT;
    const user = env.PGUSER;
    const pass = env.PGPASSWORD;
    const name = env.PGDATABASE || 'postgres';
    if (host && port && user && pass && name) {
        dbUrl = `postgresql://${user}:${encodeURIComponent(pass)}@${host}:${port}/${name}`;
    }
}

if (!projectRef && !dbUrl) {
    console.error(
        'Error: Neither SUPABASE project ref nor DATABASE_URL found. Set VITE_SUPABASE_URL or SUPABASE_PROJECT_REF, or provide DATABASE_URL/PG* vars.',
    );
    process.exit(1);
}

// Default output path for this repo
const defaultOut = path.resolve(repoRoot, 'src', 'lib', 'database.types.ts');
const outPath = cli.out ? path.resolve(repoRoot, cli.out) : defaultOut;

let args;
if (projectRef) {
    console.log('Using Supabase project id/ref:', projectRef);
    args = ['gen', 'types', 'typescript', '--project-id', projectRef, '--schema', schema];
} else {
    console.log('Using DATABASE_URL to generate types');
    args = ['gen', 'types', 'typescript', '--db-url', dbUrl, '--schema', schema];
}

// IMPORTANT: do not print dbUrl
const printableArgs = args.map((v, idx) => {
    if (args[idx - 1] === '--db-url') return '[REDACTED_DB_URL]';
    if (dbUrl && v === dbUrl) return '[REDACTED_DB_URL]';
    return v;
});

console.log('Running: npx supabase', printableArgs.join(' '));

const res = spawnSync('npx', ['supabase', ...args], { encoding: 'utf8', shell: true });
if (res.error) {
    console.error(
        'Failed to run supabase CLI via npx. Try installing @supabase/cli globally or run `npx supabase` manually.',
        res.error,
    );
    process.exit(1);
}
if (res.status !== 0) {
    console.error('supabase CLI exited with non-zero status:');
    console.error(res.stderr || res.stdout);
    process.exit(res.status || 1);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, res.stdout || '', 'utf8');
console.log('Wrote Supabase types to', outPath);
