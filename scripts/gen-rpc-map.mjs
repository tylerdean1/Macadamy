import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DB_TYPES_PATH = path.join(ROOT_DIR, 'src', 'lib', 'database.types.ts');
const OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'lib', 'tables.rpc.ts');

function extractBlock(source, marker) {
    const markerIndex = source.indexOf(marker);
    if (markerIndex === -1) {
        throw new Error(`Marker not found: ${marker}`);
    }

    const braceIndex = source.indexOf('{', markerIndex);
    if (braceIndex === -1) {
        throw new Error(`Opening brace not found for marker: ${marker}`);
    }

    let depth = 0;
    for (let i = braceIndex; i < source.length; i += 1) {
        const ch = source[i];
        if (ch === '{') depth += 1;
        if (ch === '}') depth -= 1;

        if (depth === 0) {
            return source.slice(braceIndex + 1, i);
        }
    }

    throw new Error(`Closing brace not found for marker: ${marker}`);
}

function parseTopLevelKeys(block) {
    const keys = [];
    let i = 0;
    let depth = 0;

    while (i < block.length) {
        if (depth === 0) {
            const slice = block.slice(i);
            const match = /^\s*([A-Za-z0-9_]+)\s*:\s*\{/.exec(slice);
            if (match) {
                keys.push(match[1]);
                i += match[0].length;
                depth = 1;
                continue;
            }
        }

        const ch = block[i];
        if (ch === '{') depth += 1;
        if (ch === '}') depth -= 1;
        i += 1;
    }

    return keys;
}

function parseTopLevelBlocks(block) {
    const entries = new Map();
    let i = 0;
    let depth = 0;

    while (i < block.length) {
        if (depth === 0) {
            const slice = block.slice(i);
            const match = /^\s*([A-Za-z0-9_]+)\s*:\s*\{/.exec(slice);
            if (match) {
                const name = match[1];
                const braceIndex = i + match[0].length - 1;
                let localDepth = 0;
                let endIndex = -1;

                for (let j = braceIndex; j < block.length; j += 1) {
                    const ch = block[j];
                    if (ch === '{') localDepth += 1;
                    if (ch === '}') localDepth -= 1;
                    if (localDepth === 0) {
                        endIndex = j;
                        break;
                    }
                }

                if (endIndex === -1) {
                    throw new Error(`Closing brace not found for function block: ${name}`);
                }

                const inner = block.slice(braceIndex + 1, endIndex);
                entries.set(name, inner);
                i = endIndex + 1;
                continue;
            }
        }

        const ch = block[i];
        if (ch === '{') depth += 1;
        if (ch === '}') depth -= 1;
        i += 1;
    }

    return entries;
}

function extractFunctionField(block, fieldName) {
    const markerIndex = block.indexOf(`${fieldName}:`);
    if (markerIndex === -1) {
        return null;
    }

    let i = markerIndex + fieldName.length + 1;
    while (i < block.length && /\s/.test(block[i])) {
        i += 1;
    }

    if (block[i] === '{') {
        let depth = 0;
        let end = -1;
        for (let j = i; j < block.length; j += 1) {
            const ch = block[j];
            if (ch === '{') depth += 1;
            if (ch === '}') depth -= 1;
            if (depth === 0) {
                end = j + 1;
                break;
            }
        }

        if (end === -1) {
            throw new Error(`Closing brace not found for ${fieldName} block.`);
        }

        let endWithSuffix = end;
        while (endWithSuffix < block.length && !/[\r\n;]/.test(block[endWithSuffix])) {
            endWithSuffix += 1;
        }

        return block.slice(i, endWithSuffix).trim();
    }

    let end = i;
    while (end < block.length && !/[\r\n;]/.test(block[end])) {
        end += 1;
    }

    return block.slice(i, end).trim();
}

function formatObjectType(typeText) {
    const trimmed = typeText.trim();
    if (!trimmed.startsWith('{')) {
        return [trimmed];
    }

    let depth = 0;
    let endIndex = -1;
    for (let i = 0; i < trimmed.length; i += 1) {
        const ch = trimmed[i];
        if (ch === '{') depth += 1;
        if (ch === '}') depth -= 1;
        if (depth === 0) {
            endIndex = i;
            break;
        }
    }

    if (endIndex === -1) {
        return [trimmed];
    }

    const objectText = trimmed.slice(0, endIndex + 1);
    const suffix = trimmed.slice(endIndex + 1).trim();
    const inner = objectText.slice(1, -1).trim();
    const lines = ['{'];

    if (inner.length > 0) {
        const innerLines = inner.includes('\n')
            ? inner.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
            : inner.split(';').map(line => line.trim()).filter(Boolean);

        for (const line of innerLines) {
            lines.push(`  ${line}`);
        }
    }

    const closing = suffix.length > 0 ? `}${suffix}` : '}';
    lines.push(closing);
    return lines;
}

function emitFieldLines(fieldName, typeText, indent) {
    const lines = formatObjectType(typeText);
    if (lines.length === 1) {
        return [`${indent}${fieldName}: ${lines[0]}`];
    }

    const output = [`${indent}${fieldName}: ${lines[0]}`];
    for (let i = 1; i < lines.length; i += 1) {
        output.push(`${indent}${lines[i]}`);
    }
    return output;
}

function buildTableRpcMap(tableNames, rpcNames) {
    const tableMap = new Map();
    const tablesSorted = [...tableNames].sort((a, b) => a.localeCompare(b));
    const rpcsSorted = [...rpcNames].sort((a, b) => a.localeCompare(b));

    for (const table of tablesSorted) {
        tableMap.set(table, []);
    }

    for (const rpc of rpcsSorted) {
        for (const table of tablesSorted) {
            const pattern = new RegExp(`(^|_)${table}(_|$)`);
            if (pattern.test(rpc)) {
                tableMap.get(table).push(rpc);
            }
        }
    }

    return tableMap;
}

const dbTypes = fs.readFileSync(DB_TYPES_PATH, 'utf8');
const publicBlock = extractBlock(dbTypes, 'public:');
const tablesBlock = extractBlock(publicBlock, 'Tables:');
const functionsBlock = extractBlock(publicBlock, 'Functions:');

const tableNames = parseTopLevelKeys(tablesBlock);
const functionBlocks = parseTopLevelBlocks(functionsBlock);
const rpcNames = [...functionBlocks.keys()];
const tableRpcMap = buildTableRpcMap(tableNames, rpcNames);

const outputLines = [];
outputLines.push('// AUTO-GENERATED — DO NOT EDIT. Run npm run rpcmap');
outputLines.push('');
outputLines.push("import type { Database, Json } from './database.types';");
outputLines.push('');
outputLines.push('export type TableRpcMap = {');

for (const [table, rpcs] of tableRpcMap.entries()) {
    outputLines.push(`  ${table}: {`);
    if (rpcs.length === 0) {
        outputLines.push('  },');
        continue;
    }

    for (const rpc of rpcs) {
        const block = functionBlocks.get(rpc);
        if (!block) {
            continue;
        }

        const argsText = extractFunctionField(block, 'Args') ?? 'never';
        const returnsText = extractFunctionField(block, 'Returns') ?? 'never';

        outputLines.push(`    ${rpc}: {`);
        outputLines.push(...emitFieldLines('Args', argsText, '      '));
        outputLines.push(...emitFieldLines('Returns', returnsText, '      '));
        outputLines.push('    },');
    }

    outputLines.push('  },');
}

outputLines.push('};');
outputLines.push('');

fs.writeFileSync(OUTPUT_PATH, outputLines.join('\n'), 'utf8');

console.log(`RPC table map written to ${OUTPUT_PATH}`);
