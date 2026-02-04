// scripts/deps_audit.mjs
// Run:
//   node scripts/deps_audit.mjs
//
// Purpose:
//   Scan src/ and scripts/ for imports/requires and summarize dependency usage.
//
// No external deps.

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT_FILE = path.join(ROOT, "deps_audit.md");

const BUILTINS = new Set([
    "assert",
    "buffer",
    "child_process",
    "cluster",
    "console",
    "constants",
    "crypto",
    "dgram",
    "dns",
    "domain",
    "events",
    "fs",
    "http",
    "http2",
    "https",
    "inspector",
    "module",
    "net",
    "os",
    "path",
    "perf_hooks",
    "process",
    "punycode",
    "querystring",
    "readline",
    "repl",
    "stream",
    "string_decoder",
    "sys",
    "timers",
    "tls",
    "tty",
    "url",
    "util",
    "v8",
    "vm",
    "wasi",
    "worker_threads",
    "zlib",
]);

function isBuiltin(spec) {
    if (!spec) return false;
    const s = spec.replace(/^node:/, "");
    return BUILTINS.has(s);
}

function isLocal(spec) {
    return spec.startsWith(".") || spec.startsWith("/") || spec.startsWith("@/");
}

function packageNameFromSpecifier(spec) {
    if (!spec) return null;
    if (spec.startsWith("@")) {
        const parts = spec.split("/");
        return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : spec;
    }
    return spec.split("/")[0];
}

async function listFiles(dir, exts) {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    const files = [];
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
            files.push(...(await listFiles(full, exts)));
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (exts.has(ext)) files.push(full);
        }
    }
    return files;
}

function scanFile(content) {
    const matches = [];
    const importRegex = /\bimport\s+(?:[^"']+?\s+from\s+)?["']([^"']+)["']/g;
    const requireRegex = /\brequire\(\s*["']([^"']+)["']\s*\)/g;
    const dynamicImportRegex = /\bimport\(\s*["']([^"']+)["']\s*\)/g;

    for (const regex of [importRegex, requireRegex, dynamicImportRegex]) {
        let m;
        while ((m = regex.exec(content))) {
            if (m[1]) matches.push(m[1]);
        }
    }
    return matches;
}

async function main() {
    const pkgPath = path.join(ROOT, "package.json");
    const pkgRaw = await fs.readFile(pkgPath, "utf8");
    const pkg = JSON.parse(pkgRaw);

    const deps = new Set(Object.keys(pkg.dependencies || {}));
    const devDeps = new Set(Object.keys(pkg.devDependencies || {}));

    const srcFiles = await listFiles(path.join(ROOT, "src"), new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".cjs", ".mjs"]));
    const scriptFiles = await listFiles(path.join(ROOT, "scripts"), new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".cjs", ".mjs"]));

    const used = new Set();
    const usedInSrc = new Set();
    const usedInScripts = new Set();

    const scanFiles = async (files, targetSet) => {
        for (const file of files) {
            const content = await fs.readFile(file, "utf8").catch(() => "");
            const specs = scanFile(content);
            for (const spec of specs) {
                if (!spec || isLocal(spec) || isBuiltin(spec)) continue;
                const name = packageNameFromSpecifier(spec);
                if (!name) continue;
                used.add(name);
                targetSet.add(name);
            }
        }
    };

    await scanFiles(srcFiles, usedInSrc);
    await scanFiles(scriptFiles, usedInScripts);

    const allDeclared = new Set([...deps, ...devDeps]);
    const unusedDeclared = [...allDeclared].filter((d) => !used.has(d)).sort();
    const missingDeclared = [...used].filter((u) => !allDeclared.has(u)).sort();

    const moveToDev = [...deps].filter((d) => usedInScripts.has(d) && !usedInSrc.has(d)).sort();
    const moveToDeps = [...devDeps].filter((d) => usedInSrc.has(d)).sort();

    const lines = [];
    lines.push("# Dependency Audit");
    lines.push("");
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push("");

    lines.push("## Summary");
    lines.push("");
    lines.push(`- Declared dependencies: ${deps.size}`);
    lines.push(`- Declared devDependencies: ${devDeps.size}`);
    lines.push(`- Used packages detected: ${used.size}`);
    lines.push("");

    lines.push("## Unused Declared Dependencies");
    lines.push("");
    if (!unusedDeclared.length) lines.push("- (none)");
    else unusedDeclared.forEach((d) => lines.push(`- ${d}`));
    lines.push("");

    lines.push("## Missing Declared Dependencies");
    lines.push("");
    if (!missingDeclared.length) lines.push("- (none)");
    else missingDeclared.forEach((d) => lines.push(`- ${d}`));
    lines.push("");

    lines.push("## Possibly Move to devDependencies");
    lines.push("");
    if (!moveToDev.length) lines.push("- (none)");
    else moveToDev.forEach((d) => lines.push(`- ${d}`));
    lines.push("");

    lines.push("## Possibly Move to dependencies");
    lines.push("");
    if (!moveToDeps.length) lines.push("- (none)");
    else moveToDeps.forEach((d) => lines.push(`- ${d}`));
    lines.push("");

    await fs.writeFile(OUT_FILE, lines.join("\n"), "utf8");
    console.log(`Wrote ${path.relative(ROOT, OUT_FILE).replaceAll("\\", "/")}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
