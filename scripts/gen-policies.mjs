#!/usr/bin/env node
/* eslint-env node */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { spawnSync } = require('child_process');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'lib', 'database.policies.ts');

function loadEnv() {
    const dotenv = require('dotenv');
    dotenv.config({ path: path.resolve(ROOT_DIR, '.env.local') });
    dotenv.config({ path: path.resolve(ROOT_DIR, '.env') });
}

function getDatabaseUrl() {
    const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    if (!url) {
        console.error('ERROR: DATABASE_URL or SUPABASE_DB_URL not set in environment.');
        process.exit(1);
    }
    return url;
}

const SNAPSHOT_PATH = path.join(ROOT_DIR, 'backend.snapshot.sql');

function parsePoliciesFromSnapshot(snapshot) {
    const policies = [];
    const lines = snapshot.split('\n');
    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();
        if (line.startsWith('CREATE POLICY ')) {
            const match = line.match(/CREATE POLICY (\w+) ON ([\w.]+) FOR (\w+) USING \((.+)\);/);
            if (match) {
                const [, policyname, table, cmd, qual] = match;
                const tablename = table.split('.').pop();
                policies.push({
                    schemaname: 'public',
                    tablename,
                    policyname,
                    permissive: true, // assume permissive, as restrictive are rare
                    roles: [], // not easy to parse
                    cmd,
                    qual,
                    with_check: null,
                });
            }
        }
        i++;
    }
    return policies;
}

function queryPolicies() {
    if (!fs.existsSync(SNAPSHOT_PATH)) {
        console.error(`Snapshot file not found: ${SNAPSHOT_PATH}`);
        console.error('Run npm run backend-snapshot first.');
        process.exit(1);
    }
    const snapshot = fs.readFileSync(SNAPSHOT_PATH, 'utf-8');
    return parsePoliciesFromSnapshot(snapshot);
}

function generateTypescript(policies) {
    const lines = [];
    lines.push('// AUTO-GENERATED — DO NOT EDIT. Run npm run gen:policies');
    lines.push('');
    lines.push('export interface Policy {');
    lines.push('  schemaname: string;');
    lines.push('  tablename: string;');
    lines.push('  policyname: string;');
    lines.push('  permissive: boolean;');
    lines.push('  roles: string[];');
    lines.push('  cmd: string;');
    lines.push('  qual: string | null;');
    lines.push('  with_check: string | null;');
    lines.push('}');
    lines.push('');
    lines.push('export const POLICIES: Policy[] = [');
    for (const policy of policies) {
        lines.push('  {');
        lines.push(`    schemaname: '${policy.schemaname}',`);
        lines.push(`    tablename: '${policy.tablename}',`);
        lines.push(`    policyname: '${policy.policyname}',`);
        lines.push(`    permissive: ${policy.permissive},`);
        lines.push(`    roles: ${JSON.stringify(policy.roles)},`);
        lines.push(`    cmd: '${policy.cmd}',`);
        lines.push(`    qual: ${policy.qual ? JSON.stringify(policy.qual) : 'null'},`);
        lines.push(`    with_check: ${policy.with_check ? JSON.stringify(policy.with_check) : 'null'},`);
        lines.push('  },');
    }
    lines.push('];');
    lines.push('');

    return lines.join('\n');
}

function main() {
    loadEnv();
    console.log('Parsing policies from backend snapshot...');
    const policies = queryPolicies();
    console.log(`Found ${policies.length} policies.`);
    const ts = generateTypescript(policies);
    fs.writeFileSync(OUTPUT_PATH, ts, 'utf-8');
    console.log(`Generated ${OUTPUT_PATH}`);
}

main();