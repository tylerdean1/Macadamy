import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const REQUIRED_DEV_DEPS = ["commander", "find-up", "picocolors", "zod", "playwright"];
const REQUIRED_SCRIPTS = {
    log5: "node scripts/supabase_logs.mjs",
    "log5:invite": "node scripts/supabase_logs.mjs --invite",
    "log5:error": "node scripts/supabase_logs.mjs --severity=error",
    "log5:full": "node scripts/supabase_logs.mjs --severity=all",
    "log5:postgres": "node scripts/supabase_logs.mjs postgres_logs",
    "log5:setup": "node scripts/setup_supabase_logs.mjs",
    supabaselogs: "node scripts/supabase_logs.mjs",
};

function parseArgs(argv) {
    const flags = new Set(argv);
    return {
        skipInstall: flags.has("--skip-install"),
        skipCliCheck: flags.has("--skip-cli-check"),
        skipEnvTemplate: flags.has("--skip-env-template"),
    };
}

function getNodeMajorVersion() {
    const major = Number(process.versions.node.split(".")[0]);
    return Number.isFinite(major) ? major : 0;
}

function runShell(command, args, cwd) {
    return new Promise((resolve) => {
        const child = spawn(command, args, {
            cwd,
            shell: true,
            stdio: ["ignore", "pipe", "pipe"],
            env: process.env,
        });

        let stdout = "";
        let stderr = "";

        child.stdout?.on("data", (chunk) => {
            stdout += String(chunk);
        });

        child.stderr?.on("data", (chunk) => {
            stderr += String(chunk);
        });

        child.on("close", (code) => {
            resolve({ code: code ?? 1, stdout, stderr });
        });
    });
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function findWorkspaceRoot(startDir) {
    let current = startDir;

    while (true) {
        const candidate = path.join(current, "package.json");
        if (await fileExists(candidate)) {
            return current;
        }

        const parent = path.dirname(current);
        if (parent === current) {
            return "";
        }
        current = parent;
    }
}

function parseEnvContent(content) {
    const out = {};
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) {
            continue;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        let value = trimmed.slice(separatorIndex + 1).trim();

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        if (key) {
            out[key] = value;
        }
    }

    return out;
}

async function loadEnvMap(root) {
    const envFiles = [
        path.join(root, ".env"),
        path.join(root, ".env.local"),
        path.join(root, ".env.development"),
        path.join(root, ".env.production"),
    ];

    const map = {};
    for (const filePath of envFiles) {
        try {
            const raw = await fs.readFile(filePath, "utf8");
            const parsed = parseEnvContent(raw);

            for (const [key, value] of Object.entries(parsed)) {
                const nextValue = String(value ?? "").trim();
                const currentValue = String(map[key] ?? "").trim();

                if (!currentValue && nextValue) {
                    map[key] = nextValue;
                }
            }
        } catch (error) {
            if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) {
                throw error;
            }
        }
    }

    return map;
}

async function ensurePackageScripts(root) {
    const packageJsonPath = path.join(root, "package.json");
    const raw = await fs.readFile(packageJsonPath, "utf8");
    const pkg = JSON.parse(raw);

    const scripts = typeof pkg.scripts === "object" && pkg.scripts !== null ? pkg.scripts : {};
    let changed = false;

    for (const [scriptName, scriptCmd] of Object.entries(REQUIRED_SCRIPTS)) {
        if (scripts[scriptName] !== scriptCmd) {
            scripts[scriptName] = scriptCmd;
            changed = true;
        }
    }

    pkg.scripts = scripts;

    if (changed) {
        await fs.writeFile(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
    }

    return { changed, pkg };
}

function findMissingDeps(pkg) {
    const devDeps = typeof pkg.devDependencies === "object" && pkg.devDependencies !== null
        ? pkg.devDependencies
        : {};

    return REQUIRED_DEV_DEPS.filter((dep) => !devDeps[dep]);
}

async function ensureEnvTemplate(root) {
    const examplePath = path.join(root, ".env.log5.example");
    const template = [
        "# Supabase Management API token (required for log retrieval)",
        "# Create at: https://supabase.com/dashboard/account/tokens",
        "SUPABASE_ACCESS_TOKEN=",
        "",
        "# Optional alias for SUPABASE_ACCESS_TOKEN",
        "SUPABASE_MANAGEMENT_TOKEN=",
        "",
        "# Required: project reference id",
        "# Find in Supabase Dashboard -> Project Settings -> General -> Reference ID",
        "SUPABASE_PROJECT_REF=",
        "",
        "# Optional source extensions",
        "# SUPABASE_LOG_SOURCES=auth_logs,edge_logs,function_edge_logs,function_logs,postgres_logs,realtime_logs,storage_logs",
        "# SUPABASE_INVITE_LOG_SOURCES=function_logs,function_edge_logs,auth_logs",
        "",
        "# Optional localhost app URL used by automatic HAR capture",
        "LOG5_APP_URL=http://localhost:5173",
        "",
    ].join("\n");

    await fs.writeFile(examplePath, template, "utf8");

    return { examplePath };
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const root = await findWorkspaceRoot(process.cwd());

    if (!root) {
        console.error("❌ Could not find package.json. Run this command from your project directory.");
        process.exit(1);
    }

    const nodeMajor = getNodeMajorVersion();
    if (nodeMajor < 18) {
        console.error(`❌ Node 18+ is required. Detected ${process.versions.node}.`);
        process.exit(1);
    }

    const logsScriptPath = path.join(root, "scripts", "supabase_logs.mjs");
    if (!(await fileExists(logsScriptPath))) {
        console.error("❌ Missing scripts/supabase_logs.mjs in this project.");
        console.error("Copy scripts/supabase_logs.mjs (and this setup script) into the target project's scripts/ folder first.");
        process.exit(1);
    }

    console.log(`📁 Workspace: ${root}`);

    const scriptResult = await ensurePackageScripts(root);
    console.log(scriptResult.changed ? "✅ package.json scripts updated." : "✅ package.json scripts already configured.");

    const missingDeps = findMissingDeps(scriptResult.pkg);
    if (missingDeps.length === 0) {
        console.log("✅ Required dev dependencies already installed.");
    } else if (args.skipInstall) {
        console.log(`⚠️ Missing dev dependencies: ${missingDeps.join(", ")}`);
        console.log("Run this command to install them:");
        console.log(`npm install -D ${missingDeps.join(" ")}`);
    } else {
        console.log(`📦 Installing missing dev dependencies: ${missingDeps.join(", ")}`);
        const installRes = await runShell("npm", ["install", "-D", ...missingDeps], root);
        if (installRes.code !== 0) {
            console.error("❌ Failed to install dependencies.");
            console.error(installRes.stderr || installRes.stdout);
            process.exit(1);
        }
        console.log("✅ Dependencies installed.");
    }

    if (args.skipCliCheck) {
        console.log("⏭️ Supabase CLI check skipped (--skip-cli-check).");
    } else {
        const cli = await runShell("supabase", ["--version"], root);
        if (cli.code === 0) {
            console.log(`✅ Supabase CLI detected: ${cli.stdout.trim()}`);
        } else {
            console.log("⚠️ Supabase CLI not found in PATH.");
            console.log("Install from: https://supabase.com/docs/guides/cli");
            console.log("This tool still works if SUPABASE_PROJECT_REF is set in env files.");
        }
    }

    const envMap = await loadEnvMap(root);
    const hasAccessToken = Boolean((envMap.SUPABASE_ACCESS_TOKEN ?? envMap.SUPABASE_MANAGEMENT_TOKEN ?? "").trim());
    const hasProjectRef = Boolean((envMap.SUPABASE_PROJECT_REF ?? "").trim());

    const missingRequired = [];
    if (!hasAccessToken) {
        missingRequired.push("SUPABASE_ACCESS_TOKEN (or SUPABASE_MANAGEMENT_TOKEN)");
    }

    if (!hasProjectRef) {
        missingRequired.push("SUPABASE_PROJECT_REF");
    }

    if (missingRequired.length > 0) {
        if (args.skipEnvTemplate) {
            console.log("⏭️ Env template generation skipped (--skip-env-template).");
        } else {
            const envTemplateInfo = await ensureEnvTemplate(root);
            console.log(`✅ Missing variables detected; wrote template: ${envTemplateInfo.examplePath}`);
        }
    }

    console.log("\n=== Supabase values you need ===");
    if (hasAccessToken) {
        console.log("✅ Access token found (SUPABASE_ACCESS_TOKEN or SUPABASE_MANAGEMENT_TOKEN).");
    } else {
        console.log("❗ Missing access token.");
        console.log("Find it at: https://supabase.com/dashboard/account/tokens");
        console.log("Create a Personal Access Token, then put it in .env.local as SUPABASE_ACCESS_TOKEN=...");
    }

    if (hasProjectRef) {
        console.log("✅ Project ref found (SUPABASE_PROJECT_REF).");
    } else {
        console.log("❗ Missing required project ref.");
        console.log("Find it in Supabase Dashboard -> Project Settings -> General -> Reference ID.");
        console.log("Then set SUPABASE_PROJECT_REF=... in .env.local.");
    }

    if (missingRequired.length > 0) {
        console.log("\n❌ Setup incomplete. Missing required variables:");
        for (const item of missingRequired) {
            console.log(`- ${item}`);
        }
        console.log("\n=== Next steps ===");
        console.log("1) Fill missing keys in .env/.env.local (or your preferred .env.* file).");
        console.log("2) Re-run: npm run log5:setup");
        process.exit(1);
    }

    console.log("\n=== Next steps ===");
    console.log("1) Run: npm run log5:error");
    console.log("2) For full docs/help: npm run log5 -- --help");

    console.log("\n=== Command quick list ===");
    console.log("- npm run log5         -> Last 5 minutes, warning+error scan across standard sources.");
    console.log("- npm run log5:error   -> Last 5 minutes, error-focused scan.");
    console.log("- npm run log5:full    -> Last 5 minutes, all severities (no severity filter).");
    console.log("- npm run log5:invite  -> Invite triage preset (focuses invite-relevant sources).");
    console.log("- npm run log5:postgres -> Focus only postgres logs.");
    console.log("- npm run log5 -- --help -> Show all flags/options.");

}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ log5 setup failed", { error: message });
    process.exit(1);
});
