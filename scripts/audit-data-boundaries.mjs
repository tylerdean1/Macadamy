import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(repoRoot, 'src');
const rpcDefinitionsPath = path.join(sourceRoot, 'lib', 'rpc.definitions.ts');
const rpcClientPath = path.join(sourceRoot, 'lib', 'rpc.client.ts');

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

function extractQuotedArrayValues(source, exportName) {
  const pattern = new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s+as\\s+const`, 'm');
  const match = source.match(pattern);
  if (!match) return [];
  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map(([, value]) => value);
}

async function loadKnownRpcNames() {
  const rpcDefinitions = await readFile(rpcDefinitionsPath, 'utf8');
  const rpcClient = await readFile(rpcClientPath, 'utf8');

  return new Set([
    ...extractQuotedArrayValues(rpcDefinitions, 'RPC_NAMES'),
    ...extractQuotedArrayValues(rpcClient, 'EXTRA_RPC_NAMES'),
  ]);
}

function findBoundaryViolations(repoPath, content) {
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

function findUnknownInvokeRpcViolations(repoPath, content, knownRpcNames) {
  const lines = content.split(/\r?\n/);
  const violations = [];
  const invokeRpcPattern = /\binvokeRpc(?:<[^>]+>)?\s*\(\s*['"]([^'"]+)['"]/g;

  lines.forEach((line, index) => {
    invokeRpcPattern.lastIndex = 0;
    let match;
    while ((match = invokeRpcPattern.exec(line)) !== null) {
      const rpcName = match[1];
      if (!knownRpcNames.has(rpcName)) {
        violations.push({
          repoPath,
          lineNumber: index + 1,
          description: 'invokeRpc(...) call to RPC missing from generated or live RPC contract',
          excerpt: line.trim(),
        });
      }
    }
  });

  return violations;
}

const sourceFiles = await collectSourceFiles(sourceRoot);
const knownRpcNames = await loadKnownRpcNames();
const violations = [];

for (const filePath of sourceFiles) {
  const repoPath = toRepoPath(filePath);
  const content = await readFile(filePath, 'utf8');
  violations.push(...findBoundaryViolations(repoPath, content));
  violations.push(...findUnknownInvokeRpcViolations(repoPath, content, knownRpcNames));
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
