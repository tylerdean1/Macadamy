#!/usr/bin/env node
/* eslint-env node */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function resolveRepoRoot() {
    const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
        encoding: 'utf8',
        shell: true,
    });
    if (result.status === 0) {
        const root = String(result.stdout || '').trim();
        if (root) return root;
    }
    return process.cwd();
}

function tryLoadDotenv(dotenvPath) {
    try {
        if (dotenvPath && fs.existsSync(dotenvPath)) {
            require('dotenv').config({ path: dotenvPath });
            return true;
        }
    } catch {
        // ignore dotenv loading errors and continue fallbacks
    }
    return false;
}

function loadEnv(repoRoot) {
    const explicit = String(process.env.ENV_PATH || '').trim();
    if (explicit && tryLoadDotenv(path.resolve(repoRoot, explicit))) return;

    const candidates = [
        path.resolve(repoRoot, '.env.local'),
        path.resolve(repoRoot, 'apps', 'web', '.env.local'),
        path.resolve(repoRoot, '.env'),
    ];

    for (const candidate of candidates) {
        if (tryLoadDotenv(candidate)) return;
    }

    try {
        require('dotenv').config();
    } catch {
        // ignore fallback errors
    }
}

function getDatabaseUrl(env) {
    const dbUrl = String(env.DATABASE_URL || env.SUPABASE_DB_URL || '').trim();
    if (!dbUrl) {
        console.error('ERROR: DATABASE_URL or SUPABASE_DB_URL not set in environment.');
        process.exit(1);
    }
    return dbUrl;
}

function main() {
    const repoRoot = resolveRepoRoot();
    loadEnv(repoRoot);

    const dbUrl = getDatabaseUrl(process.env);
    const outputPath = path.resolve(repoRoot, 'src', 'lib', 'functions.sql');

    const args = [
        '--schema=public',
        '--section=pre-data',
        '--section=post-data',
        '--no-owner',
        '--no-privileges',
        '--no-tablespaces',
        '--no-unlogged-table-data',
        '--no-comments',
        `--file=${outputPath}`,
        dbUrl,
    ];

    console.log('Running: pg_dump [REDACTED_DB_URL] --schema=public --section=pre-data --section=post-data --no-owner --no-privileges --no-tablespaces --no-unlogged-table-data --no-comments');

    const result = spawnSync('pg_dump', args, {
        stdio: 'inherit',
        shell: false,
    });

    if (result.error) {
        console.error('Failed to execute pg_dump. Ensure Postgres client tools are installed and available in PATH.', result.error);
        process.exit(1);
    }

    if (result.status !== 0) {
        process.exit(result.status || 1);
    }

    console.log('Wrote functions SQL to', outputPath);
}

main();
