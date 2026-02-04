// scripts/supabase_collect.mjs
// Run: node scripts/supabase_collect.mjs
// Purpose: Generate Supabase audit artifacts into audits/supabase/
// - Uses psql with DATABASE_URL or SUPABASE_DB_URL
// - Optional: fetches Advisors (security/performance) if SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF are set

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "audits", "supabase");

function quote(s) {
    return `"${String(s).replaceAll('"', '\\"')}"`;
}

function toSqlPath(p) {
    return String(p).replaceAll("\\", "/");
}

function runShell(cmd, { capture = false, cwd = ROOT, env = process.env } = {}) {
    return new Promise((resolve) => {
        const child = spawn(cmd, {
            cwd,
            shell: true,
            stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
            env,
        });

        if (!capture) {
            child.on("close", (code) => resolve({ code, stdout: "", stderr: "" }));
            return;
        }

        let stdout = "";
        let stderr = "";

        child.stdout?.on("data", (d) => (stdout += d.toString()));
        child.stderr?.on("data", (d) => (stderr += d.toString()));

        child.on("close", (code) => resolve({ code, stdout, stderr }));
    });
}

async function ensureDir(p) {
    await fs.mkdir(p, { recursive: true });
}

async function cleanOldOutputs(dir) {
    const generatedNames = new Set([
        "db_lint.txt",
        "_meta.json",
    ]);
    const entries = await fs.readdir(dir).catch(() => []);
    await Promise.all(
        entries.map(async (name) => {
            const lower = name.toLowerCase();
            if (generatedNames.has(lower)) {
                await fs.rm(path.join(dir, name), { force: true });
            }
        }),
    );
}

function getDbUrl() {
    return process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || "";
}

function parseEnvContent(content) {
    const out = {};
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const idx = trimmed.indexOf("=");
        if (idx === -1) continue;
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        if (key && !(key in out)) out[key] = val;
    }
    return out;
}

async function loadEnvFromFiles(files) {
    for (const file of files) {
        try {
            const raw = await fs.readFile(file, "utf8");
            const parsed = parseEnvContent(raw);
            for (const [key, value] of Object.entries(parsed)) {
                if (process.env[key] == null) process.env[key] = value;
            }
        } catch {
            // ignore missing files
        }
    }
}

async function checkPsql() {
    const res = await runShell("psql --version", { capture: true });
    return res.code === 0;
}

async function psqlCopy(dbUrl, sql, outFile) {
    const sqlPath = toSqlPath(outFile);
    const cmd = `psql ${quote(dbUrl)} -v ON_ERROR_STOP=1 -c "SET client_encoding TO 'UTF8'" -c "\\copy (${sql}) TO '${sqlPath}' WITH CSV HEADER"`;
    const res = await runShell(cmd, {
        env: {
            ...process.env,
            PGCLIENTENCODING: "UTF8",
        },
    });
    if (res.code !== 0) {
        throw new Error(`psql export failed: ${path.basename(outFile)}`);
    }
}

function toCsv(rows, headers) {
    const esc = (v) => {
        const s = String(v ?? "");
        if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
        return s;
    };
    const head = headers.join(",");
    const body = rows.map((r) => headers.map((h) => esc(r[h])).join(","));
    return [head, ...body].join("\n");
}

async function writeAdvisorsCsv(type, token, projectRef, outFile) {
    const url = `https://api.supabase.com/v1/projects/${projectRef}/advisors/${type}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch ${type} advisors: ${res.status}`);
    }

    const data = await res.json();
    const rows = Array.isArray(data) ? data : [];
    const headers = [
        "name",
        "title",
        "level",
        "facing",
        "categories",
        "description",
        "detail",
        "remediation",
        "metadata",
        "cache_key",
    ];

    const normalized = rows.map((r) => ({
        name: r.name ?? "",
        title: r.title ?? "",
        level: r.level ?? "",
        facing: r.facing ?? "",
        categories: Array.isArray(r.categories) ? r.categories.join(";") : String(r.categories ?? ""),
        description: r.description ?? "",
        detail: r.detail ?? "",
        remediation: r.remediation ?? "",
        metadata: r.metadata ? JSON.stringify(r.metadata) : "",
        cache_key: r.cache_key ?? "",
    }));

    await fs.writeFile(outFile, toCsv(normalized, headers), "utf8");
}

async function main() {
    await ensureDir(OUT_DIR);
    await cleanOldOutputs(OUT_DIR);

    await loadEnvFromFiles([
        path.join(ROOT, ".env"),
        path.join(ROOT, ".env.local"),
        path.join(ROOT, ".env.development"),
        path.join(ROOT, ".env.production"),
    ]);

    const dbUrl = getDbUrl();
    if (!dbUrl) {
        console.error("❌ DATABASE_URL or SUPABASE_DB_URL is required (env or .env/.env.local/.env.development/.env.production).\n");
        console.error("Tip: add DATABASE_URL=... to .env or export SUPABASE_DB_URL in your shell.");
        process.exit(1);
    }

    const psqlOk = await checkPsql();
    if (!psqlOk) {
        console.error("❌ psql is required to collect audit CSVs. Install Postgres client tools and retry.");
        process.exit(1);
    }

    const exports = [
        {
            name: "snippet_policies.csv",
            sql: `select schemaname as schema, tablename as table, policyname as policy, permissive, roles, cmd as command, qual as using, with_check as check from pg_policies order by schemaname, tablename, policyname`,
        },
        {
            name: "snippet_roles.csv",
            sql: `select rolname as role, rolsuper as superuser, rolcreaterole as create_role, rolcreatedb as create_db, rolreplication as replication, rolbypassrls as bypass_rls from pg_roles order by rolname`,
        },
        {
            name: "snippet_rpcs.csv",
            sql: `select n.nspname as schema, p.proname as function, pg_get_functiondef(p.oid) as definition from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname not in ('pg_catalog','information_schema') order by n.nspname, p.proname`,
        },
        {
            name: "rpc_roles_query.csv",
            sql: `select n.nspname as schema, p.proname as function, r.rolname as role, p.prosecdef as security_definer from pg_proc p join pg_namespace n on n.oid = p.pronamespace join pg_roles r on r.oid = p.proowner where n.nspname not in ('pg_catalog','information_schema') order by n.nspname, p.proname, r.rolname`,
        },
        {
            name: "snippet_triggers_search.csv",
            sql: `select n.nspname as schema, c.relname as table, t.tgname as trigger, pg_get_triggerdef(t.oid, true) as definition from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace where not t.tgisinternal order by n.nspname, c.relname, t.tgname`,
        },
        {
            name: "all_schema_tables_query.csv",
            sql: `select table_schema as schema, table_name as table, table_type from information_schema.tables where table_schema not in ('pg_catalog','information_schema') order by table_schema, table_name`,
        },
        {
            name: "query_performance_slowest.csv",
            sql: `select query, calls, mean_exec_time as mean_time_ms, max_exec_time as max_time_ms, total_exec_time as total_time_ms, rows from pg_stat_statements order by mean_exec_time desc limit 100`,
        },
        {
            name: "query_performance_most_frequent.csv",
            sql: `select query, calls, total_exec_time as total_time_ms, rows from pg_stat_statements order by calls desc limit 100`,
        },
        {
            name: "query_performance_most_time_consuming.csv",
            sql: `select query, calls, total_exec_time as total_time_ms, mean_exec_time as mean_time_ms, rows from pg_stat_statements order by total_exec_time desc limit 100`,
        },
    ];

    console.log(`\n==> Exporting CSVs into ${path.relative(ROOT, OUT_DIR).replaceAll("\\", "/")}\n`);
    for (const ex of exports) {
        const outFile = path.join(OUT_DIR, ex.name);
        try {
            await psqlCopy(dbUrl, ex.sql, outFile);
            console.log(`✅ Wrote ${path.relative(ROOT, outFile).replaceAll("\\", "/")}`);
        } catch (err) {
            console.error(`⚠️ Failed to export ${ex.name}: ${err.message}`);
        }
    }

    const token = process.env.SUPABASE_ACCESS_TOKEN || "";
    const projectRef = process.env.SUPABASE_PROJECT_REF || "";
    if (token && projectRef) {
        console.log("\n==> Fetching Advisors (security/performance)\n");
        const secOut = path.join(OUT_DIR, "security_lint_warning.csv");
        const perfOut = path.join(OUT_DIR, "performance_lint_warning.csv");
        try {
            await writeAdvisorsCsv("security", token, projectRef, secOut);
            console.log(`✅ Wrote ${path.relative(ROOT, secOut).replaceAll("\\", "/")}`);
        } catch (err) {
            console.error(`⚠️ Failed to fetch security advisors: ${err.message}`);
        }
        try {
            await writeAdvisorsCsv("performance", token, projectRef, perfOut);
            console.log(`✅ Wrote ${path.relative(ROOT, perfOut).replaceAll("\\", "/")}`);
        } catch (err) {
            console.error(`⚠️ Failed to fetch performance advisors: ${err.message}`);
        }
    } else {
        console.log("\n==> Advisors skipped (SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF not set)\n");
    }

    const metaPath = path.join(OUT_DIR, "_meta.json");
    const meta = {
        generated_at: new Date().toISOString(),
        out_dir: path.relative(ROOT, OUT_DIR).replaceAll("\\", "/"),
        used_db_url: true,
        advisors_enabled: Boolean(token && projectRef),
    };
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), "utf8");
    console.log(`✅ Wrote ${path.relative(ROOT, metaPath).replaceAll("\\", "/")}`);

    console.log("\nDone. Now run: npm run audit:supabase\n");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
