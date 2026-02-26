import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const snapshotPath = path.join(root, 'backend.snapshot.sql')
const migrationPath = path.join(root, 'supabase', 'migrations', 'rewrite_insert_rpc_defaults.sql')
const auditPath = path.join(root, 'audits', 'supabase', 'insert_rpc_rewrite_audit.md')
const deltaPath = path.join(root, 'audits', 'supabase', 'insert_rpc_rewrite_delta.md')

const sql = fs.readFileSync(snapshotPath, 'utf8')
const lines = sql.split(/\r?\n/)

const forbiddenStatic = new Set(['id', 'created_at', 'updated_at', 'deleted_at'])

function parseTables(sqlLines) {
    const tables = new Map()
    let inTable = false
    let currentTable = ''
    let buffer = []

    for (const line of sqlLines) {
        const start = line.match(/^CREATE TABLE public\.([a-zA-Z0-9_]+) \($/)
        if (start) {
            inTable = true
            currentTable = start[1]
            buffer = []
            continue
        }

        if (!inTable) continue

        if (line.trim() === ');') {
            const cols = []
            for (const raw of buffer) {
                const trimmed = raw.trim()
                if (!trimmed) continue
                if (/^(CONSTRAINT|PRIMARY KEY|UNIQUE|CHECK|FOREIGN KEY|EXCLUDE)\b/i.test(trimmed)) continue
                const m = raw.match(/^\s{4}([a-zA-Z_][a-zA-Z0-9_]*)\s+(.+?)(,)?$/)
                if (!m) continue

                const name = m[1]
                const def = m[2]
                const hasDefault = /\bDEFAULT\b/i.test(def)
                const notNull = /\bNOT NULL\b/i.test(def)
                const generated = /\bGENERATED\b\s+ALWAYS\b/i.test(def)
                const identity = /\bGENERATED\b\s+(?:ALWAYS|BY\s+DEFAULT)\s+AS\s+IDENTITY\b/i.test(def)

                cols.push({
                    name,
                    hasDefault,
                    notNull,
                    generated,
                    identity,
                    definition: def,
                })
            }

            tables.set(currentTable, { name: currentTable, columns: cols })
            inTable = false
            currentTable = ''
            buffer = []
            continue
        }

        buffer.push(line)
    }

    return tables
}

function findInsertInputFunctions(content) {
    const regex = /^CREATE FUNCTION public\.(insert_[a-zA-Z0-9_]+)\(_input jsonb\) RETURNS SETOF public\.([a-zA-Z0-9_]+)/gm
    const matches = []
    let m
    while ((m = regex.exec(content)) !== null) {
        matches.push({
            functionName: m[1],
            tableName: m[2],
            startIndex: m.index,
            headerText: m[0],
        })
    }

    function findFunctionEndFromStart(startIndex) {
        const tail = content.slice(startIndex)
        const asTagMatch = tail.match(/\n\s*AS\s+(\$[^$\n]*\$)\s*\n/m)
        if (!asTagMatch) {
            throw new Error(`Unable to find AS $tag$ for function at index ${startIndex}`)
        }

        const tag = asTagMatch[1]
        const asTagAbsoluteIndex = startIndex + (asTagMatch.index ?? 0)
        const bodyStart = asTagAbsoluteIndex + asTagMatch[0].length
        const terminator = `${tag};`
        const end = content.indexOf(terminator, bodyStart)

        if (end === -1) {
            throw new Error(`Unable to find function terminator ${terminator} for function at index ${startIndex}`)
        }

        return end + terminator.length
    }

    return matches.map((item) => {
        const endIndex = findFunctionEndFromStart(item.startIndex)
        return { ...item, endIndex, body: content.slice(item.startIndex, endIndex) }
    })
}

function lineNumberAtIndex(content, index) {
    return content.slice(0, index).split(/\r?\n/).length
}

function replaceDeclareSection(fnSql, tableName) {
    const declareMatch = fnSql.match(/(^\s*DECLARE\s*\n)([\s\S]*?)(\n\s*BEGIN\s*\n)/m)
    if (!declareMatch) return { updated: fnSql, changed: false }

    const existing = declareMatch[2]
    const indentMatch = declareMatch[1].match(/^(\s*)DECLARE/m)
    const indent = indentMatch ? `${indentMatch[1]}  ` : '  '
    const additions = [
        `${indent}_input_sanitized jsonb := '{}'::jsonb;`,
        `${indent}_insert_columns text[] := ARRAY[]::text[];`,
        `${indent}_insert_column_list text;`,
        `${indent}_insert_value_list text;`,
        `${indent}_r public.${tableName};`,
    ]

    const alreadyHasAll = additions.every((line) => existing.includes(line.trim()))
    if (alreadyHasAll) return { updated: fnSql, changed: false }

    const newDeclare = `${declareMatch[1]}${existing}${existing.endsWith('\n') ? '' : '\n'}${additions.join('\n')}\n${declareMatch[3]}`
    const updated = fnSql.replace(declareMatch[0], newDeclare)
    return { updated, changed: true }
}

function buildSanitizeExpression(forbiddenCols) {
    const unique = [...new Set(['id', 'created_at', 'updated_at', 'deleted_at', ...forbiddenCols])]
    return unique.map((c) => ` - '${c}'`).join('')
}

function buildInsertReplacement(tableName, candidateColumns, forbiddenColumns) {
    const sanitizeExpr = buildSanitizeExpression(forbiddenColumns)

    const ifBlocks = candidateColumns
        .map((c) => `  IF _input_sanitized ? '${c}' THEN\n    _insert_columns := array_append(_insert_columns, '${c}');\n  END IF;`)
        .join('\n\n')

    return [
        `  _input_sanitized := COALESCE(_input, '{}'::jsonb)${sanitizeExpr};`,
        '',
        `  _r := jsonb_populate_record(NULL::public.${tableName}, _input_sanitized);`,
        '',
        ifBlocks,
        '',
        `  IF COALESCE(array_length(_insert_columns, 1), 0) = 0 THEN`,
        `    INSERT INTO public.${tableName} DEFAULT VALUES`,
        `    RETURNING * INTO _new_row;`,
        `  ELSE`,
        `    SELECT string_agg(format('%I', c), ', ')`,
        `    INTO _insert_column_list`,
        `    FROM unnest(_insert_columns) AS c;`,
        '',
        `    SELECT string_agg(format('($1).%I', c), ', ')`,
        `    INTO _insert_value_list`,
        `    FROM unnest(_insert_columns) AS c;`,
        '',
        `    EXECUTE format(`,
        `      'INSERT INTO public.${tableName} (%s) VALUES (%s) RETURNING *',`,
        `      _insert_column_list,`,
        `      _insert_value_list`,
        `    )`,
        `    USING _r`,
        `    INTO _new_row;`,
        `  END IF;`,
    ].join('\n')
}

function main() {
    const tables = parseTables(lines)
    const functions = findInsertInputFunctions(sql)

    const populatePatternByTable = (tableName) => new RegExp(
        `INSERT INTO public\\.${tableName}\\s+SELECT \\(jsonb_populate_record\\(NULL::public\\.${tableName}, _input\\)\\)\\.\\*\\s+RETURNING \\* INTO _new_row;`,
        'm'
    )

    const totalInsertInputFunctions = functions.length
    const targets = []
    const outliers = []
    const rewrites = []

    for (const fn of functions) {
        const pattern = populatePatternByTable(fn.tableName)
        if (!pattern.test(fn.body)) {
            outliers.push(fn)
            continue
        }

        const table = tables.get(fn.tableName)
        if (!table) {
            throw new Error(`Table metadata not found for ${fn.tableName}`)
        }

        const forbiddenDerived = table.columns
            .filter((c) => c.generated || c.identity)
            .map((c) => c.name)

        const forbiddenAll = [...new Set([...forbiddenStatic, ...forbiddenDerived])]

        const candidateColumns = table.columns
            .map((c) => c.name)
            .filter((c) => !forbiddenAll.includes(c))

        let updatedFn = fn.body
        const declareResult = replaceDeclareSection(updatedFn, fn.tableName)
        updatedFn = declareResult.updated

        const replacement = buildInsertReplacement(fn.tableName, candidateColumns, forbiddenDerived)
        updatedFn = updatedFn.replace(pattern, replacement)
        updatedFn = updatedFn.replace(/^CREATE FUNCTION\s+/m, 'CREATE OR REPLACE FUNCTION ')

        if (updatedFn === fn.body) {
            throw new Error(`Failed to rewrite function ${fn.functionName}`)
        }

        rewrites.push({
            ...fn,
            updatedFn,
            table,
            forbiddenColumns: forbiddenAll,
            candidateColumns,
            defaultColumns: table.columns.filter((c) => c.hasDefault).map((c) => c.name),
            generatedIdentityColumns: forbiddenDerived,
            lineNumber: lineNumberAtIndex(sql, fn.startIndex),
        })

        targets.push(fn)
    }

    const migrationHeader = `-- Migration: rewrite insert RPC functions to preserve DB defaults when keys are omitted\n-- Generated from backend.snapshot.sql\n-- Date: ${new Date().toISOString()}\n\nBEGIN;\n\n`
    const migrationBody = rewrites
        .map((r) => `${r.updatedFn.trim()}\n`)
        .join('\n')
    const migrationFooter = `\nCOMMIT;\n`

    fs.mkdirSync(path.dirname(migrationPath), { recursive: true })
    fs.writeFileSync(migrationPath, `${migrationHeader}${migrationBody}${migrationFooter}`, 'utf8')

    const auditLines = []
    auditLines.push('# Insert RPC Rewrite Audit')
    auditLines.push('')
    auditLines.push(`- Total insert_*(_input jsonb) functions: ${totalInsertInputFunctions}`)
    auditLines.push(`- Populate-star rewrites generated: ${rewrites.length}`)
    auditLines.push(`- Outliers (not rewritten): ${outliers.length}`)
    auditLines.push('')
    auditLines.push('## Outliers')
    auditLines.push('')
    for (const o of outliers) {
        auditLines.push(`- ${o.functionName} (table: ${o.tableName}, line: ${lineNumberAtIndex(sql, o.startIndex)})`)
    }
    auditLines.push('')
    auditLines.push('## Rewritten Functions')
    auditLines.push('')

    for (const r of rewrites) {
        const forbiddenReasonMap = r.forbiddenColumns.map((c) => {
            if (['id', 'created_at', 'updated_at', 'deleted_at'].includes(c)) return `${c} (system field)`
            if (r.generatedIdentityColumns.includes(c)) return `${c} (identity/generated)`
            return `${c} (forbidden)`
        })

        const defaultEligible = r.defaultColumns.filter((c) => !r.forbiddenColumns.includes(c))

        auditLines.push(`### ${r.functionName} -> public.${r.tableName}`)
        auditLines.push(`- Line: ${r.lineNumber}`)
        auditLines.push(`- Forbidden columns stripped/omitted: ${forbiddenReasonMap.length ? forbiddenReasonMap.join(', ') : 'none'}`)
        auditLines.push(`- Defaulted columns omitted when key absent: ${defaultEligible.length ? defaultEligible.join(', ') : 'none'}`)
        auditLines.push(`- Columns included when key present: ${r.candidateColumns.length ? r.candidateColumns.join(', ') : 'none'}`)
        auditLines.push('- Required-column missing behavior: enforced by DB constraints at runtime')
        auditLines.push('')
    }

    fs.mkdirSync(path.dirname(auditPath), { recursive: true })
    fs.writeFileSync(auditPath, `${auditLines.join('\n')}\n`, 'utf8')

    const deltaLines = []
    deltaLines.push('# Insert RPC Rewrite Delta')
    deltaLines.push('')
    deltaLines.push(`- Source: backend.snapshot.sql`)
    deltaLines.push(`- Total insert_*(_input jsonb): ${totalInsertInputFunctions}`)
    deltaLines.push(`- Rewritten (populate-star targets): ${rewrites.length}`)
    deltaLines.push(`- Outliers unchanged: ${outliers.length}`)
    deltaLines.push('')
    deltaLines.push('## Outliers unchanged')
    for (const o of outliers) {
        deltaLines.push(`- ${o.functionName} (line ${lineNumberAtIndex(sql, o.startIndex)})`)
    }

    fs.writeFileSync(deltaPath, `${deltaLines.join('\n')}\n`, 'utf8')

    console.log(`Generated migration: ${path.relative(root, migrationPath)}`)
    console.log(`Generated audit: ${path.relative(root, auditPath)}`)
    console.log(`Generated delta: ${path.relative(root, deltaPath)}`)
    console.log(`Counts -> total: ${totalInsertInputFunctions}, rewritten: ${rewrites.length}, outliers: ${outliers.length}`)
}

main()
