import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const TYPES_PATH = path.join(ROOT_DIR, 'src', 'lib', 'database.types.ts');
const OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'lib', 'rpc.definitions.ts');

function extractPublicFunctionNames(source) {
    const publicIndex = source.indexOf('public: {');
    if (publicIndex < 0) return [];
    const functionsIndex = source.indexOf('Functions:', publicIndex);
    if (functionsIndex < 0) return [];
    const startBrace = source.indexOf('{', functionsIndex);
    if (startBrace < 0) return [];

    let i = startBrace + 1;
    let depth = 1;
    while (i < source.length && depth > 0) {
        const ch = source[i];
        if (ch === '{') depth += 1;
        if (ch === '}') depth -= 1;
        i += 1;
    }
    const block = source.slice(startBrace + 1, i - 1);
    const matches = Array.from(block.matchAll(/^[\s]{6}([A-Za-z0-9_]+)\s*:/gm));
    const names = matches.map((m) => m[1]).filter((n) => typeof n === 'string');
    return Array.from(new Set(names)).sort();
}

const source = fs.readFileSync(TYPES_PATH, 'utf-8');
const names = extractPublicFunctionNames(source);

const lines = [];
lines.push('// AUTO-GENERATED — DO NOT EDIT. Run npm run gen:rpc');
lines.push('');
lines.push("import type { Database } from './database.types';");
lines.push('');
lines.push('export const RPC_NAMES = [');
for (const name of names) {
    lines.push(`  '${name}',`);
}
lines.push('] as const;');
lines.push('');
lines.push('export type RpcName = typeof RPC_NAMES[number];');
lines.push("export type RpcArgs<N extends RpcName> = Database['public']['Functions'][N]['Args'];");
lines.push("export type RpcReturns<N extends RpcName> = Database['public']['Functions'][N]['Returns'];");
lines.push('');
lines.push('export function isRpcName(value: string): value is RpcName {');
lines.push('  return (RPC_NAMES as readonly string[]).includes(value);');
lines.push('}');
lines.push('');

fs.writeFileSync(OUTPUT_PATH, `${lines.join('\n')}`);
console.log(`Generated ${OUTPUT_PATH} with ${names.length} RPC names.`);
