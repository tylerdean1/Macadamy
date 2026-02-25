// scripts/purge-orphaned-avatars.mjs
// Run: node scripts/purge-orphaned-avatars.mjs [--dry-run] [--max-delete N]
// Purpose: remove orphaned avatar rows via RPC and purge unreferenced files in avatars-personal.

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const BUCKET = 'avatars-personal';

function tryLoadDotenv(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return false;
  dotenv.config({ path: filePath });
  return true;
}

function loadEnv(root) {
  const explicit = String(process.env.ENV_PATH || '').trim();
  if (explicit && tryLoadDotenv(path.resolve(root, explicit))) return;

  const candidates = [
    path.resolve(root, '.env'),
    path.resolve(root, '.env.local'),
    path.resolve(root, '.env.development'),
    path.resolve(root, '.env.production'),
  ];
  for (const candidate of candidates) {
    if (tryLoadDotenv(candidate)) return;
  }
}

function readEnvAny(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim() !== '') return value.trim();
  }
  return '';
}

function extractStoragePath(url) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

async function listAll(storage, prefix) {
  const items = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const { data, error } = await storage.list(prefix, { limit, offset });
    if (error) throw error;
    const batch = Array.isArray(data) ? data : [];
    items.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }

  return items;
}

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) {
    out.push(list.slice(i, i + size));
  }
  return out;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const out = { dryRun: false, maxDelete: 0 };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--dry-run') {
      out.dryRun = true;
      continue;
    }
    if (arg === '--max-delete' && args[i + 1]) {
      out.maxDelete = Number(args[i + 1]) || 0;
      i += 1;
    }
  }
  return out;
}

async function removePaths(storage, paths, options, label) {
  if (paths.length === 0) return 0;
  const maxDelete = options.maxDelete > 0 ? options.maxDelete : paths.length;
  const limited = paths.slice(0, maxDelete);

  if (options.dryRun) {
    console.log(`[dry-run] ${label}: ${limited.length}`);
    const sample = limited.slice(0, 10);
    if (sample.length > 0) {
      console.log(`[dry-run] sample paths: ${sample.join(', ')}`);
    }
    return 0;
  }

  let removed = 0;
  for (const group of chunk(limited, 100)) {
    const { error } = await storage.remove(group);
    if (error) throw error;
    removed += group.length;
  }
  return removed;
}

async function main() {
  const root = process.cwd();
  loadEnv(root);
  const options = parseArgs(process.argv);


  // Use available Supabase URL env vars
  const supabaseUrl = readEnvAny([
    'VITE_SUPABASE_URL',
    'SUPABASE_URL',
  ]);
  // Use available anon key env vars
  const anonKey = readEnvAny([
    'VITE_SUPABASE_PUBLISHABLE_TOKEN',
  ]);

  if (!supabaseUrl || !anonKey) {
    console.error('Missing Supabase URL and/or anon key in env.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch },
  });

  const storage = supabase.storage.from(BUCKET);

  // 1) Purge orphaned avatar rows and remove their files.
  const { data: deletedRows, error: purgeError } = await supabase.rpc('purge_orphaned_avatars');
  if (purgeError) throw purgeError;
  const deletedList = Array.isArray(deletedRows) ? deletedRows : [];
  const deletedPaths = deletedList
    .map((row) => extractStoragePath(row.url))
    .filter((value) => value);

  const removedFromDb = deletedList.length;
  const removedFiles = await removePaths(storage, deletedPaths, options, 'orphaned avatar files');

  // 2) Remove files that are not referenced by any remaining avatar row.
  const { data: activePathsData, error: activeError } = await supabase.rpc('get_avatar_storage_paths');
  if (activeError) throw activeError;
  const activePaths = new Set(
    (Array.isArray(activePathsData) ? activePathsData : []).filter((value) => value),
  );

  const rootItems = await listAll(storage, '');
  const rootFiles = rootItems.filter((item) => item?.name && item?.metadata);
  const rootFolders = rootItems.filter((item) => item?.name && !item?.metadata);

  const allPaths = [];

  for (const item of rootFiles) {
    if (item.name.startsWith('.')) continue;
    allPaths.push(item.name);
  }

  for (const folder of rootFolders) {
    if (folder.name.startsWith('.')) continue;
    const files = await listAll(storage, folder.name);
    for (const file of files) {
      if (!file?.name || file.name.startsWith('.')) continue;
      allPaths.push(`${folder.name}/${file.name}`);
    }
  }

  const orphanedPaths = allPaths.filter((pathName) => !activePaths.has(pathName));
  const removedOrphaned = await removePaths(storage, orphanedPaths, options, 'unreferenced avatar files');

  console.log(`Purged avatar rows: ${removedFromDb}`);
  console.log(`Removed files from purge: ${removedFiles}`);
  console.log(`Removed unreferenced files: ${removedOrphaned}`);
}

main().catch((err) => {
  console.error('Avatar cleanup failed:', err?.message || err);
  process.exit(1);
});
