import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(repoRoot, 'src');

const sourceExtensions = new Set(['.cjs', '.js', '.jsx', '.mjs', '.ts', '.tsx']);

const checks = [
  {
    description: 'direct Supabase table access via supabase.from(...)',
    pattern: /\bsupabase\s*\.\s*from\s*\(/,
    allowedPaths: new Set(),
  },
  {
    description: 'direct Supabase RPC access via supabase.rpc(...)',
    pattern: /\bsupabase\s*\.\s*rpc\s*\(/,
    allowedPaths: new Set(['src/lib/rpc.client.ts']),
  },
  {
    description: 'direct Supabase Storage access outside storageClient',
    pattern: /\bsupabase\s*\.\s*storage\s*\./,
    allowedPaths: new Set(['src/lib/storageClient.ts']),
  },
];

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectSourceFiles(entryPath));
      continue;
    }

    if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function findViolations(repoPath, content) {
  const lines = content.split(/\r?\n/);
  const violations = [];

  lines.forEach((line, index) => {
    for (const check of checks) {
      if (!check.allowedPaths.has(repoPath) && check.pattern.test(line)) {
        violations.push({
          repoPath,
          lineNumber: index + 1,
          description: check.description,
          excerpt: line.trim(),
        });
      }
    }
  });

  return violations;
}

const sourceFiles = await collectSourceFiles(sourceRoot);
const violations = [];

for (const filePath of sourceFiles) {
  const repoPath = toRepoPath(filePath);
  const content = await readFile(filePath, 'utf8');
  violations.push(...findViolations(repoPath, content));
}

if (violations.length > 0) {
  console.error('[data-boundary-audit] frontend data boundary violations found:');
  for (const violation of violations) {
    console.error(
      `- ${violation.repoPath}:${violation.lineNumber} ${violation.description}: ${violation.excerpt}`,
    );
  }
  process.exit(1);
}

console.log(`[data-boundary-audit] checked ${sourceFiles.length} source files; data boundary is clean.`);
