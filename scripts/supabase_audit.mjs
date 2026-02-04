// scripts/supabase_audit.mjs
// Run:
//   node scripts/supabase_audit.mjs --in audits/supabase --out audits/supabase/supabase_audit.md --top 20
//
// Purpose:
//   Ingest Supabase dashboard CSV exports (security/performance lint, query perf reports, snippet exports)
//   and generate actionable Markdown + JSON + summary outputs.
//
// No external deps.

import fs from "node:fs/promises";
import path from "node:path";

const CWD = process.cwd();

function toAbs(p) {
    if (!p) return p;
    return path.isAbsolute(p) ? p : path.join(CWD, p);
}

function parseArgs(argv) {
    const out = {
        inDir: path.join(CWD, "audits/supabase"),
        outFile: path.join(CWD, "audits/supabase/supabase_audit.md"),
        top: 20,
        only: null,
        minCalls: null,
        minTotalMs: null,
        minAvgMs: null,
        format: "both",
        failOn: null,
    };

    const a = [...argv];
    while (a.length) {
        const k = a.shift();
        if (!k) break;

        const next = () => a.shift();

        if (k === "--in") out.inDir = toAbs(next());
        else if (k === "--out") out.outFile = toAbs(next());
        else if (k === "--top") out.top = Number(next() ?? "20");
        else if (k === "--limit") out.top = Number(next() ?? "20");
        else if (k === "--format") out.format = String(next() ?? "both").toLowerCase();
        else if (k === "--only") {
            const v = (next() ?? "").trim();
            out.only = v
                ? new Set(
                    v
                        .split(",")
                        .map((s) => s.trim().toLowerCase())
                        .filter(Boolean),
                )
                : null;
        } else if (k === "--minCalls") out.minCalls = Number(next());
        else if (k === "--minTotalMs") out.minTotalMs = Number(next());
        else if (k === "--minAvgMs") out.minAvgMs = Number(next());
        else if (k === "--fail-on") out.failOn = String(next() ?? "").toUpperCase();
    }

    if (!Number.isFinite(out.top) || out.top <= 0) out.top = 20;
    if (!new Set(["md", "json", "both"]).has(out.format)) out.format = "both";

    return out;
}

// Minimal CSV parser with quoted-field support (handles commas/newlines inside quotes).
function parseCsv(raw) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < raw.length; i++) {
        const c = raw[i];

        if (inQuotes) {
            if (c === '"') {
                // Escaped quote
                const next = raw[i + 1];
                if (next === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += c;
            }
            continue;
        }

        if (c === '"') {
            inQuotes = true;
            continue;
        }

        if (c === ",") {
            row.push(field);
            field = "";
            continue;
        }

        if (c === "\n") {
            row.push(field);
            field = "";
            // drop empty trailing last row from file ending
            if (row.length > 1 || (row.length === 1 && row[0] !== "")) rows.push(row);
            row = [];
            continue;
        }

        if (c === "\r") {
            continue;
        }

        field += c;
    }

    // Flush last field/row
    row.push(field);
    if (row.length > 1 || (row.length === 1 && row[0] !== "")) rows.push(row);

    if (!rows.length) return { headers: [], data: [] };

    const headers = rows[0].map((h) => (h ?? "").trim());
    const data = rows.slice(1).map((r) => {
        const obj = {};
        for (let i = 0; i < headers.length; i++) obj[headers[i]] = r[i] ?? "";
        return obj;
    });

    return { headers, data };
}

function lcKeys(headers) {
    return headers.map((h) => h.toLowerCase());
}

function parseNumber(v) {
    if (v == null) return null;
    const s = String(v).trim();
    if (!s) return null;
    // remove common noise: commas, "ms", etc.
    const cleaned = s.replaceAll(",", "").replace(/ms\b/gi, "").trim();
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
}

function truncate(s, max = 140) {
    const str = String(s ?? "");
    if (str.length <= max) return str;
    return str.slice(0, max - 1) + "…";
}

function mdEscape(s) {
    return String(s ?? "").replaceAll("|", "\\|").replaceAll("\n", " ").replaceAll("\r", " ");
}

function normalizeQuery(input) {
    const s = String(input ?? "").toLowerCase();
    return s
        .replace(/\s+/g, " ")
        .replace(/'(?:''|[^'])*'/g, "'?'")
        .replace(/\b\d+(?:\.\d+)?\b/g, "?")
        .trim();
}

function hashFNV1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
}

function inferSortKey(headers, kind) {
    const H = lcKeys(headers);
    const has = (k) => H.includes(k);

    if (kind === "slowest") {
        const candidates = [
            "mean_time_ms",
            "avg_time_ms",
            "mean_time",
            "avg_time",
            "p95_time_ms",
            "p99_time_ms",
            "max_time_ms",
            "max_time",
            "time_ms",
            "execution_time_ms",
            "duration_ms",
            "duration",
        ];
        for (const c of candidates) if (has(c)) return headers[H.indexOf(c)];
    }

    if (kind === "frequent") {
        const candidates = ["calls", "count", "executions", "total_calls", "n_calls"];
        for (const c of candidates) if (has(c)) return headers[H.indexOf(c)];
    }

    if (kind === "time_consuming") {
        const candidates = [
            "total_time_ms",
            "total_time",
            "sum_time_ms",
            "sum_time",
            "total_exec_time_ms",
            "total_execution_time_ms",
        ];
        for (const c of candidates) if (has(c)) return headers[H.indexOf(c)];
    }

    // generic fallback: first numeric-looking column
    for (let i = 0; i < headers.length; i++) {
        const k = headers[i].toLowerCase();
        if (k.includes("time") || k.includes("ms") || k.includes("calls") || k.includes("count")) return headers[i];
    }

    return null;
}

function guessDisplayColumns(headers, preferredKeys, sortKey) {
    const preferred = [...preferredKeys];

    if (sortKey) preferred.unshift(sortKey);

    const headerMap = new Map(headers.map((h) => [h.toLowerCase(), h]));
    const cols = [];
    for (const p of preferred) {
        const actual = headerMap.get(p.toLowerCase());
        if (actual && !cols.includes(actual)) cols.push(actual);
        if (cols.length >= 6) break;
    }

    if (cols.length < 3) {
        for (const h of headers) {
            if (!cols.includes(h)) cols.push(h);
            if (cols.length >= 5) break;
        }
        if (sortKey && !cols.includes(sortKey)) cols.unshift(sortKey);
    }

    return cols.slice(0, 6);
}

function mdTable(rows, cols, limit) {
    const head = `| ${cols.map(mdEscape).join(" | ")} |`;
    const sep = `| ${cols.map(() => "---").join(" | ")} |`;
    const body = rows.slice(0, limit).map((r) => {
        const cells = cols.map((c) => mdEscape(truncate(r[c], 160)));
        return `| ${cells.join(" | ")} |`;
    });
    return [head, sep, ...body].join("\n");
}

function sortAndFilter(rows, sortKey, kind, args) {
    const filtered = rows.filter((r) => {
        if (!sortKey) return true;

        const v = parseNumber(r[sortKey]);
        if (v == null) return true;

        if (kind === "frequent" && args.minCalls != null) return v >= args.minCalls;
        if (kind === "time_consuming" && args.minTotalMs != null) return v >= args.minTotalMs;
        if (kind === "slowest" && args.minAvgMs != null) return v >= args.minAvgMs;

        return true;
    });

    if (!sortKey) return filtered;

    return filtered.sort((a, b) => {
        const av = parseNumber(a[sortKey]) ?? -Infinity;
        const bv = parseNumber(b[sortKey]) ?? -Infinity;
        return bv - av;
    });
}

function sectionAllowed(onlySet, sectionKey) {
    if (!onlySet) return true;
    return onlySet.has(sectionKey);
}

function classifyFile(fileName, headers) {
    const low = fileName.toLowerCase();
    const H = lcKeys(headers);
    const has = (k) => H.includes(k);

    if (low.includes("security") && low.includes("lint")) return "security";
    if (low.includes("performance") && low.includes("lint")) return "performance";
    if (low.includes("query") && low.includes("performance")) return "queries";
    if (low.includes("snippet") && low.includes("polic")) return "policies";
    if (low.includes("snippet") && low.includes("rpc")) return "rpc";
    if (low.includes("rpc") && low.includes("roles")) return "rpcRoles";
    if (low.includes("snippet") && low.includes("roles")) return "roles";
    if (low.includes("trigger")) return "triggers";
    if (low.includes("schema") && low.includes("table")) return "tables";

    if (has("policy") || has("using") || has("check")) return "policies";
    if (has("trigger") || has("trigger_name")) return "triggers";
    if (has("query") || has("statement") || has("query_text")) return "queries";
    if ((has("function") || has("routine")) && (has("role") || has("grantee"))) return "rpcRoles";
    if (has("function") || has("routine")) return "rpc";

    return "other";
}

function collectQueryText(row, headers) {
    const keys = [
        "query",
        "query_text",
        "statement",
        "sql",
        "normalized_query",
        "queryid",
    ];
    const headerMap = new Map(headers.map((h) => [h.toLowerCase(), h]));
    for (const k of keys) {
        const actual = headerMap.get(k);
        if (actual && row[actual]) return String(row[actual]);
    }
    return "";
}

function toKeyLowerMap(row) {
    const out = {};
    for (const [k, v] of Object.entries(row)) out[k.toLowerCase()] = v;
    return out;
}

function getRowValue(row, headers, candidates) {
    const map = new Map(headers.map((h) => [h.toLowerCase(), h]));
    for (const c of candidates) {
        const actual = map.get(c.toLowerCase());
        if (actual && row[actual]) return String(row[actual]);
    }
    return "";
}

function summarizeSecurity(rows, headers) {
    const severityKey = inferColumn(headers, ["severity", "level", "risk"]);
    const categoryKey = inferColumn(headers, ["category", "type"]);
    const tableKey = inferColumn(headers, ["table", "relation", "object"]);
    const functionKey = inferColumn(headers, ["function", "routine", "name"]);

    const bySeverity = tally(rows, severityKey);
    const byCategory = tally(rows, categoryKey);
    const byTable = tally(rows, tableKey);
    const byFunction = tally(rows, functionKey);

    return { severityKey, categoryKey, tableKey, functionKey, bySeverity, byCategory, byTable, byFunction };
}

function tally(rows, key) {
    if (!key) return {};
    const counts = {};
    rows.forEach((r) => {
        const v = String(r[key] ?? "").trim() || "(empty)";
        counts[v] = (counts[v] ?? 0) + 1;
    });
    return counts;
}

function inferColumn(headers, candidates) {
    const map = new Map(headers.map((h) => [h.toLowerCase(), h]));
    for (const c of candidates) {
        const actual = map.get(c.toLowerCase());
        if (actual) return actual;
    }
    return null;
}

function summarizePolicies(policyRows, policyHeaders, tableRows, tableHeaders) {
    const tableKey = inferColumn(policyHeaders, ["table", "relation", "tablename"]);
    const schemaKey = inferColumn(policyHeaders, ["schema", "schemaname"]);
    const map = new Map();
    for (const row of policyRows) {
        const table = tableKey ? String(row[tableKey] ?? "") : "";
        const schema = schemaKey ? String(row[schemaKey] ?? "") : "";
        if (!table) continue;
        const key = schema ? `${schema}.${table}` : table;
        map.set(key, (map.get(key) ?? 0) + 1);
    }

    const tables = new Set();
    if (tableRows.length) {
        const tKey = inferColumn(tableHeaders, ["table", "tablename", "name"]);
        const sKey = inferColumn(tableHeaders, ["schema", "schemaname"]);
        tableRows.forEach((row) => {
            const table = tKey ? String(row[tKey] ?? "") : "";
            const schema = sKey ? String(row[sKey] ?? "") : "";
            if (!table) return;
            const key = schema ? `${schema}.${table}` : table;
            tables.add(key);
        });
    }

    const zeroPolicy = [];
    if (tables.size) {
        for (const t of tables) if (!map.has(t)) zeroPolicy.push(t);
    }

    return { policyCounts: map, zeroPolicy };
}

function summarizeRpcExposure(rpcRows, rpcHeaders, roleRows, roleHeaders) {
    const fnKey = inferColumn(rpcHeaders, ["function", "routine", "name"]);
    const schemaKey = inferColumn(rpcHeaders, ["schema", "schemaname"]);
    const defKey = inferColumn(rpcHeaders, ["definition", "sql", "body"]);

    const roleFnKey = inferColumn(roleHeaders, ["function", "routine", "name"]);
    const roleNameKey = inferColumn(roleHeaders, ["role", "grantee"]);
    const roleSchemaKey = inferColumn(roleHeaders, ["schema", "schemaname"]);

    const rolesByFn = new Map();
    for (const row of roleRows) {
        const fn = roleFnKey ? String(row[roleFnKey] ?? "") : "";
        const schema = roleSchemaKey ? String(row[roleSchemaKey] ?? "") : "";
        const key = schema && fn ? `${schema}.${fn}` : fn;
        if (!key) continue;
        const role = roleNameKey ? String(row[roleNameKey] ?? "") : "";
        if (!rolesByFn.has(key)) rolesByFn.set(key, new Set());
        if (role) rolesByFn.get(key).add(role);
    }

    const items = rpcRows.map((row) => {
        const fn = fnKey ? String(row[fnKey] ?? "") : "";
        const schema = schemaKey ? String(row[schemaKey] ?? "") : "";
        const key = schema && fn ? `${schema}.${fn}` : fn;
        const definition = defKey ? String(row[defKey] ?? "") : "";
        const roles = Array.from(rolesByFn.get(key) ?? []);
        const roleList = roles.length ? roles.join(", ") : "(unknown)";
        const writeLike = /\b(insert|update|delete|upsert|create|write|set)\b/i.test(fn + " " + definition);
        const anonExposure = roles.some((r) => r.toLowerCase() === "anon");
        const risk = anonExposure && writeLike ? "P0" : anonExposure ? "P1" : "P2";
        return { key, function: fn, schema, roles: roleList, writeLike, risk };
    });

    return { items };
}

function summarizeTriggers(rows, headers) {
    const triggerKey = inferColumn(headers, ["trigger", "trigger_name", "name"]);
    const tableKey = inferColumn(headers, ["table", "tablename", "relation"]);
    const functionKey = inferColumn(headers, ["function", "routine"]);
    return rows.map((row) => ({
        trigger: triggerKey ? String(row[triggerKey] ?? "") : "",
        table: tableKey ? String(row[tableKey] ?? "") : "",
        function: functionKey ? String(row[functionKey] ?? "") : "",
    }));
}

async function loadCsv(dir, fileName) {
    try {
        const raw = await fs.readFile(path.join(dir, fileName), "utf8");
        const parsed = parseCsv(raw);
        return parsed.headers.length ? parsed : null;
    } catch {
        return null;
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const inDir = args.inDir;
    const outFile = args.outFile;
    const outDir = path.dirname(outFile);
    const baseName = path.basename(outFile, path.extname(outFile));
    const outJson = path.join(outDir, `${baseName}.json`);
    const outSummary = path.join(outDir, `${baseName}.summary.txt`);

    let entries = [];
    try {
        entries = await fs.readdir(inDir, { withFileTypes: true });
    } catch {
        entries = [];
    }

    const csvFiles = entries
        .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".csv"))
        .map((e) => e.name)
        .sort((a, b) => a.localeCompare(b));
    const ingested = [];

    const buckets = {
        security: [],
        performance: [],
        queries: [],
        policies: [],
        rpc: [],
        rpcRoles: [],
        roles: [],
        triggers: [],
        tables: [],
        other: [],
    };

    for (const file of csvFiles) {
        const parsed = await loadCsv(inDir, file);
        if (!parsed) continue;

        const kind = classifyFile(file, parsed.headers);
        buckets[kind].push({ file, ...parsed });

        ingested.push({
            file,
            rows: parsed.data.length,
            headers: parsed.headers,
            kind,
        });
    }

    const lines = [];
    const generatedAt = new Date().toISOString();

    lines.push("# Supabase Audit Report");
    lines.push("");
    lines.push(`Generated: ${generatedAt}`);
    lines.push("");

    lines.push("## Run Info");
    lines.push("");
    if (!csvFiles.length) {
        lines.push(`- No CSV files found in ${path.relative(CWD, inDir).replaceAll("\\", "/")}`);
        lines.push("");
    } else {
        lines.push(`- Input directory: ${path.relative(CWD, inDir).replaceAll("\\", "/")}`);
        lines.push(`- Files ingested: ${ingested.length}`);
        lines.push("");
        lines.push("| File | Rows | Kind |");
        lines.push("| --- | ---: | --- |");
        ingested.forEach((i) => {
            lines.push(`| ${mdEscape(i.file)} | ${i.rows} | ${mdEscape(i.kind)} |`);
        });
        lines.push("");
    }

    lines.push("## Triage Order");
    lines.push("1) Security lint warnings / missing RLS & policy gaps");
    lines.push("2) Slowest queries + most time-consuming queries (indexes, N+1s, missing WHERE indexes)");
    lines.push("3) Performance lint warnings (indexes, functions, etc.)");
    lines.push("4) Dependency cleanup (only after verifying usage)");
    lines.push("");

    const report = {
        meta: {
            generatedAt,
            inputDir: path.relative(CWD, inDir).replaceAll("\\", "/"),
            files: ingested,
        },
        sections: {},
        recommendations: { p0: [], p1: [], p2: [] },
    };

    // Security lint
    if (sectionAllowed(args.only, "security")) {
        lines.push("## Security Lint Findings");
        lines.push("");
        const rows = buckets.security.flatMap((b) => b.data);
        const headers = buckets.security[0]?.headers ?? [];
        const summary = summarizeSecurity(rows, headers);
        report.sections.security = { rows, summary };

        if (!rows.length) {
            lines.push("- ⚠️ No security lint CSVs found or they were empty.");
            lines.push("");
        } else {
            lines.push(`- Total findings: ${rows.length}`);
            if (summary.severityKey) {
                lines.push("");
                lines.push("**By severity**");
                lines.push("");
                lines.push(mdTable(Object.entries(summary.bySeverity).map(([k, v]) => ({ Severity: k, Count: v })), ["Severity", "Count"], args.top));
            }
            if (summary.categoryKey) {
                lines.push("");
                lines.push("**By category**");
                lines.push("");
                lines.push(mdTable(Object.entries(summary.byCategory).map(([k, v]) => ({ Category: k, Count: v })), ["Category", "Count"], args.top));
            }
            if (summary.tableKey) {
                lines.push("");
                lines.push("**By table**");
                lines.push("");
                lines.push(mdTable(Object.entries(summary.byTable).map(([k, v]) => ({ Table: k, Count: v })), ["Table", "Count"], args.top));
            }
            if (summary.functionKey) {
                lines.push("");
                lines.push("**By function**");
                lines.push("");
                lines.push(mdTable(Object.entries(summary.byFunction).map(([k, v]) => ({ Function: k, Count: v })), ["Function", "Count"], args.top));
            }
            lines.push("");
            const sortKey = inferSortKey(headers, "slowest");
            const cols = guessDisplayColumns(headers, ["severity", "level", "category", "table", "schema", "message", "description"], sortKey);
            lines.push(mdTable(rows, cols, 25));
            lines.push("");
        }
    }

    // Performance lint
    if (sectionAllowed(args.only, "performance")) {
        lines.push("## Performance Lint Findings");
        lines.push("");
        const rows = buckets.performance.flatMap((b) => b.data);
        const headers = buckets.performance[0]?.headers ?? [];
        report.sections.performance = { rows };

        if (!rows.length) {
            lines.push("- ⚠️ No performance lint CSVs found or they were empty.");
            lines.push("");
        } else {
            lines.push(`- Total findings: ${rows.length}`);
            lines.push("");
            const perfTypeKey = inferColumn(headers, ["type", "category", "severity", "level"]);
            if (perfTypeKey) {
                const perfByType = tally(rows, perfTypeKey);
                lines.push("**By type**");
                lines.push("");
                lines.push(mdTable(Object.entries(perfByType).map(([k, v]) => ({ Type: k, Count: v })), ["Type", "Count"], args.top));
                lines.push("");
            }
            const sortKey = inferSortKey(headers, "slowest");
            const cols = guessDisplayColumns(headers, ["severity", "level", "category", "table", "schema", "message", "description"], sortKey);
            lines.push(mdTable(rows, cols, 25));
            lines.push("");
        }
    }

    // Queries
    if (sectionAllowed(args.only, "queries")) {
        lines.push("## Query Performance");
        lines.push("");

        const queryBuckets = buckets.queries.length ? buckets.queries : buckets.other.filter((b) => classifyFile(b.file, b.headers) === "queries");
        const queryRows = queryBuckets.flatMap((b) => b.data.map((row) => ({ row, headers: b.headers })));

        const buildQueryRows = (kind) => {
            const rows = queryRows.map(({ row, headers }) => {
                const queryText = collectQueryText(row, headers);
                const normalized = normalizeQuery(queryText);
                const fingerprint = normalized ? hashFNV1a(normalized) : "";
                const withComputed = { ...row, Query: queryText, Fingerprint: fingerprint };
                return { withComputed, headers };
            });

            if (!rows.length) return { rows: [], sortKey: null, headers: [] };

            const header = rows[0].headers;
            const sortKey = inferSortKey(header, kind);
            const sorted = sortKey
                ? sortAndFilter(rows.map((r) => r.withComputed), sortKey, kind, args)
                : rows.map((r) => r.withComputed);
            return { rows: sorted, sortKey, headers: header };
        };

        const slowest = buildQueryRows("slowest");
        const frequent = buildQueryRows("frequent");
        const consuming = buildQueryRows("time_consuming");

        report.sections.queries = {
            slowest: slowest.rows,
            frequent: frequent.rows,
            timeConsuming: consuming.rows,
        };

        const queryCols = (headers, sortKey) => {
            const preferred = ["Query", "Fingerprint", "calls", "count", "rows", "mean_time_ms", "avg_time_ms", "total_time_ms"];
            return guessDisplayColumns(headers.concat(["Query", "Fingerprint"]), preferred, sortKey);
        };

        lines.push("### Top Slowest (avg/mean)");
        lines.push("");
        if (!slowest.rows.length) {
            lines.push("- ⚠️ No query performance CSVs found or they were empty.");
        } else {
            const cols = queryCols(slowest.headers, slowest.sortKey);
            lines.push(mdTable(slowest.rows, cols, args.top));
        }
        lines.push("");

        lines.push("### Top Most Time Consuming");
        lines.push("");
        if (!consuming.rows.length) {
            lines.push("- ⚠️ No query performance CSVs found or they were empty.");
        } else {
            const cols = queryCols(consuming.headers, consuming.sortKey);
            lines.push(mdTable(consuming.rows, cols, args.top));
        }
        lines.push("");

        lines.push("### Top Most Frequent");
        lines.push("");
        if (!frequent.rows.length) {
            lines.push("- ⚠️ No query performance CSVs found or they were empty.");
        } else {
            const cols = queryCols(frequent.headers, frequent.sortKey);
            lines.push(mdTable(frequent.rows, cols, args.top));
        }
        lines.push("");
    }

    // RPC exposure
    if (sectionAllowed(args.only, "rpc")) {
        lines.push("## RPC Exposure");
        lines.push("");
        const rpcRows = buckets.rpc.flatMap((b) => b.data);
        const rpcHeaders = buckets.rpc[0]?.headers ?? [];
        const roleRows = buckets.rpcRoles.flatMap((b) => b.data);
        const roleHeaders = buckets.rpcRoles[0]?.headers ?? [];
        const rpcSummary = summarizeRpcExposure(rpcRows, rpcHeaders, roleRows, roleHeaders);
        report.sections.rpc = rpcSummary;

        if (!rpcSummary.items.length) {
            lines.push("- ⚠️ No RPC exports found or they were empty.");
            lines.push("");
        } else {
            const rows = rpcSummary.items.map((i) => ({
                Function: i.key,
                Roles: i.roles,
                WriteLike: i.writeLike ? "yes" : "no",
                Risk: i.risk,
            }));
            lines.push(mdTable(rows, ["Function", "Roles", "WriteLike", "Risk"], args.top));
            lines.push("");
        }
    }

    // Policies overview
    if (sectionAllowed(args.only, "policies")) {
        lines.push("## Policies Overview");
        lines.push("");
        const policyRows = buckets.policies.flatMap((b) => b.data);
        const policyHeaders = buckets.policies[0]?.headers ?? [];
        const tableRows = buckets.tables.flatMap((b) => b.data);
        const tableHeaders = buckets.tables[0]?.headers ?? [];
        const policySummary = summarizePolicies(policyRows, policyHeaders, tableRows, tableHeaders);
        report.sections.policies = {
            policyCounts: Object.fromEntries(policySummary.policyCounts),
            zeroPolicy: policySummary.zeroPolicy,
        };

        if (!policyRows.length) {
            lines.push("- ⚠️ No policy CSVs found or they were empty.");
            lines.push("");
        } else {
            const counts = Array.from(policySummary.policyCounts.entries()).map(([k, v]) => ({ Table: k, Policies: v }));
            lines.push(mdTable(counts, ["Table", "Policies"], args.top));
            lines.push("");
        }

        if (policySummary.zeroPolicy.length) {
            lines.push("**Tables with 0 policies (based on schema tables export):**");
            lines.push("");
            lines.push(policySummary.zeroPolicy.map((t) => `- ${mdEscape(t)}`).join("\n"));
            lines.push("");
        }
    }

    // Triggers overview
    if (sectionAllowed(args.only, "triggers")) {
        lines.push("## Triggers Overview");
        lines.push("");
        const triggerRows = buckets.triggers.flatMap((b) => b.data);
        const triggerHeaders = buckets.triggers[0]?.headers ?? [];
        const triggerSummary = summarizeTriggers(triggerRows, triggerHeaders);
        report.sections.triggers = { items: triggerSummary };

        if (!triggerSummary.length) {
            lines.push("- ⚠️ No trigger exports found or they were empty.");
            lines.push("");
        } else {
            lines.push(mdTable(triggerSummary.map((t) => ({ Trigger: t.trigger, Table: t.table, Function: t.function })), ["Trigger", "Table", "Function"], args.top));
            lines.push("");
        }
    }

    // Recommended actions
    lines.push("## Recommended Actions (Prioritized)");
    lines.push("");

    const securityFindings = (report.sections.security?.rows ?? []).length;
    const rpcItems = report.sections.rpc?.items ?? [];
    const p0 = [];
    const p1 = [];
    const p2 = [];

    if (securityFindings > 0) {
        p0.push("Address security lint findings (policy gaps, RLS, risky grants).");
    }
    if (rpcItems.some((i) => i.risk === "P0")) {
        p0.push("Restrict anon-exposed write-like RPCs.");
    }
    if (rpcItems.some((i) => i.risk === "P1")) {
        p1.push("Review anon-exposed read-like RPCs and tighten grants if needed.");
    }
    if ((report.sections.queries?.slowest ?? []).length > 0) {
        p1.push("Investigate top slowest/most time-consuming queries (EXPLAIN ANALYZE).");
    }
    if ((report.sections.performance?.rows ?? []).length > 0) {
        p2.push("Resolve performance lint recommendations (indexes, query patterns).");
    }

    if (!p0.length && !p1.length && !p2.length) {
        lines.push("- No prioritized actions identified (check CSVs for completeness).");
    } else {
        if (p0.length) {
            lines.push("**P0**");
            p0.forEach((a) => lines.push(`- ${a}`));
        }
        if (p1.length) {
            lines.push("");
            lines.push("**P1**");
            p1.forEach((a) => lines.push(`- ${a}`));
        }
        if (p2.length) {
            lines.push("");
            lines.push("**P2**");
            p2.forEach((a) => lines.push(`- ${a}`));
        }
    }

    report.recommendations = { p0, p1, p2 };

    await fs.mkdir(outDir, { recursive: true });

    if (args.format === "md" || args.format === "both") {
        await fs.writeFile(outFile, lines.join("\n"), "utf8");
    }

    if (args.format === "json" || args.format === "both") {
        await fs.writeFile(outJson, JSON.stringify(report, null, 2), "utf8");
    }

    const summaryLines = [
        `Generated: ${generatedAt}`,
        `Input: ${path.relative(CWD, inDir).replaceAll("\\", "/")}`,
        "",
        "P0:",
        ...(p0.length ? p0.map((a) => `- ${a}`) : ["- (none)"]),
        "",
        "P1:",
        ...(p1.length ? p1.map((a) => `- ${a}`) : ["- (none)"]),
        "",
        "P2:",
        ...(p2.length ? p2.map((a) => `- ${a}`) : ["- (none)"]),
        "",
        "Triage reminder: security → queries → performance → deps",
    ];
    await fs.writeFile(outSummary, summaryLines.join("\n"), "utf8");

    if (args.format === "md" || args.format === "both") {
        console.log(`Wrote ${path.relative(CWD, outFile).replaceAll("\\", "/")}`);
    }
    if (args.format === "json" || args.format === "both") {
        console.log(`Wrote ${path.relative(CWD, outJson).replaceAll("\\", "/")}`);
    }
    console.log(`Wrote ${path.relative(CWD, outSummary).replaceAll("\\", "/")}`);
    console.log("Triage reminder: security → queries → performance → deps");

    if (args.failOn === "P0" && p0.length) {
        console.error("Failing due to P0 findings.");
        process.exit(2);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
