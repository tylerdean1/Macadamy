import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const SOURCE_PATH = path.join(ROOT_DIR, 'src', 'lib', 'mapsServer.ts');
const OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'lib', 'edge.functions.ts');

function readSource() {
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error(`Missing source file: ${SOURCE_PATH}`);
  }

  return fs.readFileSync(SOURCE_PATH, 'utf-8');
}

function extractMethodBlocks(source) {
  const methodRegex = /export\s+async\s+function\s+(\w+)\s*\(/g;
  const matches = [];

  for (const match of source.matchAll(methodRegex)) {
    matches.push({
      name: match[1],
      index: match.index ?? 0,
    });
  }

  const blocks = [];
  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    const end = next ? next.index : source.length;
    blocks.push({
      name: current.name,
      content: source.slice(current.index, end),
    });
  }

  return blocks;
}

function extractEdgeFunctionName(blockContent) {
  const edgeNameMatch = blockContent.match(/maps_[a-z0-9_]+/i);
  if (!edgeNameMatch) {
    return null;
  }

  return edgeNameMatch[0];
}

function splitTopLevel(input, delimiter = ',') {
  const parts = [];
  let current = '';
  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  let angleDepth = 0;
  let quote = null;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (quote) {
      current += char;
      if (char === quote && input[index - 1] !== '\\') {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      current += char;
      continue;
    }

    if (char === '(') parenDepth += 1;
    else if (char === ')') parenDepth = Math.max(parenDepth - 1, 0);
    else if (char === '{') braceDepth += 1;
    else if (char === '}') braceDepth = Math.max(braceDepth - 1, 0);
    else if (char === '[') bracketDepth += 1;
    else if (char === ']') bracketDepth = Math.max(bracketDepth - 1, 0);
    else if (char === '<') angleDepth += 1;
    else if (char === '>') angleDepth = Math.max(angleDepth - 1, 0);

    if (
      char === delimiter
      && parenDepth === 0
      && braceDepth === 0
      && bracketDepth === 0
      && angleDepth === 0
    ) {
      parts.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  const tail = current.trim();
  if (tail.length > 0) {
    parts.push(tail);
  }

  return parts;
}

function normalizeType(typeText) {
  return typeText.replace(/\s+/g, ' ').trim();
}

function parseMethodParams(paramsText) {
  const cleaned = paramsText.trim();
  if (!cleaned) {
    return [];
  }

  const rawParams = splitTopLevel(cleaned, ',');

  return rawParams
    .map((rawParam) => {
      const hasDefault = rawParam.includes('=');
      const noDefault = hasDefault ? rawParam.slice(0, rawParam.indexOf('=')).trim() : rawParam.trim();
      const match = noDefault.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([\s\S]+)$/);
      if (!match) {
        return null;
      }

      return {
        name: match[1],
        type: normalizeType(match[2]),
        optional: hasDefault,
      };
    })
    .filter((param) => param !== null);
}

function extractMethodMetadata(source) {
  const metadata = new Map();
  const signatureRegex = /export\s+async\s+function\s+(\w+)\s*\(([\s\S]*?)\)\s*:\s*Promise<([\s\S]*?)>\s*\{/g;

  for (const match of source.matchAll(signatureRegex)) {
    const method = match[1];
    const paramsText = match[2] ?? '';
    const responseType = normalizeType(match[3] ?? 'unknown');

    metadata.set(method, {
      params: parseMethodParams(paramsText),
      responseType,
    });
  }

  return metadata;
}

function buildRequestShapeExpression(method, methodMeta) {
  if (!methodMeta || !Array.isArray(methodMeta.params) || methodMeta.params.length === 0) {
    return '{}';
  }

  const params = methodMeta.params;

  if (params.length === 1) {
    const param = params[0];
    if (['request', 'input', 'body', 'payload'].includes(param.name)) {
      return `EdgeMethodArgs<'${method}'>[0]`;
    }

    return `{ ${param.name}${param.optional ? '?' : ''}: EdgeMethodArgs<'${method}'>[0] }`;
  }

  const entries = params
    .map((param, index) => `${param.name}${param.optional ? '?' : ''}: EdgeMethodArgs<'${method}'>[${index}]`)
    .join('; ');

  return `{ ${entries} }`;
}

function buildMethodMap(source) {
  const blocks = extractMethodBlocks(source);
  const methodMetadata = extractMethodMetadata(source);

  const entries = [];
  for (const block of blocks) {
    const edgeName = extractEdgeFunctionName(block.content);
    if (!edgeName) {
      continue;
    }

    const methodMeta = methodMetadata.get(block.name) ?? null;
    const requestShape = buildRequestShapeExpression(block.name, methodMeta);

    entries.push({
      method: block.name,
      edgeFunction: edgeName,
      requestShape,
      responseShape: `EdgeMethodResult<'${block.name}'>`,
    });
  }

  return entries;
}

function buildOutput(entries) {
  const uniqueEdgeFunctions = [...new Set(entries.map((entry) => entry.edgeFunction))].sort((a, b) => a.localeCompare(b));
  const sortedEntries = [...entries].sort((a, b) => a.method.localeCompare(b.method));

  const lines = [];
  lines.push('// AUTO-GENERATED — DO NOT EDIT. Run npm run gen:edge-functions');
  lines.push('// Generated from src/lib/mapsServer.ts');
  lines.push("import type * as MapsServer from './mapsServer';");
  lines.push('');
  lines.push('export const EDGE_FUNCTIONS = [');
  for (const name of uniqueEdgeFunctions) {
    lines.push(`  '${name}',`);
  }
  lines.push('] as const;');
  lines.push('');
  lines.push('export const EDGE_METHOD_TO_FUNCTION = {');
  for (const entry of sortedEntries) {
    lines.push(`  ${entry.method}: '${entry.edgeFunction}',`);
  }
  lines.push('} as const;');
  lines.push('');
  lines.push('export const EDGE_FUNCTION_METHODS = {');
  for (const edgeFunction of uniqueEdgeFunctions) {
    const methods = sortedEntries
      .filter((entry) => entry.edgeFunction === edgeFunction)
      .map((entry) => entry.method)
      .sort((a, b) => a.localeCompare(b));

    lines.push(`  ${edgeFunction}: [`);
    for (const method of methods) {
      lines.push(`    '${method}',`);
    }
    lines.push('  ],');
  }
  lines.push('} as const;');
  lines.push('');
  lines.push('export type EdgeFunctionName = typeof EDGE_FUNCTIONS[number];');
  lines.push('export type EdgeClientMethod = keyof typeof EDGE_METHOD_TO_FUNCTION;');
  lines.push('export type EdgeFunctionForMethod<M extends EdgeClientMethod> = (typeof EDGE_METHOD_TO_FUNCTION)[M];');
  lines.push('export type EdgeMethodArgs<M extends EdgeClientMethod> = Parameters<(typeof MapsServer)[M]>;');
  lines.push('export type EdgeMethodResult<M extends EdgeClientMethod> = Awaited<ReturnType<(typeof MapsServer)[M]>>;');
  lines.push('');
  lines.push('export type EdgeMethodRequestMap = {');
  for (const entry of sortedEntries) {
    lines.push(`  ${entry.method}: ${entry.requestShape};`);
  }
  lines.push('};');
  lines.push('');
  lines.push('export type EdgeMethodRequest<M extends EdgeClientMethod> = EdgeMethodRequestMap[M];');
  lines.push('');
  lines.push('export type EdgeFunctionRequestMap = {');
  for (const edgeFunction of uniqueEdgeFunctions) {
    const methods = sortedEntries
      .filter((entry) => entry.edgeFunction === edgeFunction)
      .map((entry) => entry.method)
      .sort((a, b) => a.localeCompare(b));
    const requestUnion = methods.map((method) => `EdgeMethodRequest<'${method}'>`).join(' | ');
    lines.push(`  ${edgeFunction}: ${requestUnion};`);
  }
  lines.push('};');
  lines.push('');
  lines.push('export type EdgeFunctionResponseMap = {');
  for (const edgeFunction of uniqueEdgeFunctions) {
    const methods = sortedEntries
      .filter((entry) => entry.edgeFunction === edgeFunction)
      .map((entry) => entry.method)
      .sort((a, b) => a.localeCompare(b));
    const responseUnion = methods.map((method) => `EdgeMethodResult<'${method}'>`).join(' | ');
    lines.push(`  ${edgeFunction}: ${responseUnion};`);
  }
  lines.push('};');
  lines.push('');
  lines.push('export type EdgeFunctionRequest<F extends EdgeFunctionName> = EdgeFunctionRequestMap[F];');
  lines.push('export type EdgeFunctionResponse<F extends EdgeFunctionName> = EdgeFunctionResponseMap[F];');
  lines.push('');
  lines.push('export type EdgeFunctionContractMap = {');
  lines.push('  [F in EdgeFunctionName]: {');
  lines.push('    request: EdgeFunctionRequest<F>;');
  lines.push('    response: EdgeFunctionResponse<F>;');
  lines.push('  };');
  lines.push('};');
  lines.push('');
  lines.push('export type EdgeFunctionContract<F extends EdgeFunctionName> = EdgeFunctionContractMap[F];');
  lines.push('');
  lines.push('export type EdgeMethodContractMap = {');
  lines.push('  [M in EdgeClientMethod]: {');
  lines.push('    functionName: EdgeFunctionForMethod<M>;');
  lines.push('    request: EdgeMethodRequest<M>;');
  lines.push('    response: EdgeMethodResult<M>;');
  lines.push('  };');
  lines.push('};');
  lines.push('');
  lines.push('export type EdgeMethodContract<M extends EdgeClientMethod> = EdgeMethodContractMap[M];');
  lines.push('');
  lines.push('export function isEdgeFunctionName(value: string): value is EdgeFunctionName {');
  lines.push('  return (EDGE_FUNCTIONS as readonly string[]).includes(value);');
  lines.push('}');
  lines.push('');

  return `${lines.join('\n')}\n`;
}

function main() {
  const source = readSource();
  const entries = buildMethodMap(source);

  if (entries.length === 0) {
    throw new Error('No edge function client mappings found in src/lib/mapsServer.ts');
  }

  const output = buildOutput(entries);
  fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');

  console.log(`Generated ${OUTPUT_PATH} with ${entries.length} method mappings.`);
}

main();