import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { Command } from "commander";
import { z } from "zod";
import pc from "picocolors";
import { findUp } from "find-up";

let ROOT = process.cwd();
let OUT_FILE = path.join(ROOT, "networkErrors", "supabase_logs.json");
let CONSOLE_OUT_FILE = path.join(ROOT, "networkErrors", "localhost.console.json");
let LOCALHOST_ERROR_REPORT_FILE = path.join(ROOT, "networkErrors", "localhost_error_report.txt");
const MANAGEMENT_API_BASE = "https://api.supabase.com/v1";
const DEFAULT_SOURCES = [
    "auth_logs",
    "edge_logs",
    "function_edge_logs",
    "function_logs",
    "postgres_logs",
    "realtime_logs",
    "storage_logs",
];
const DEFAULT_INVITE_SOURCES = ["function_logs", "function_edge_logs", "auth_logs"];
const MAX_TERMINAL_CHARS = 28000;
const MAX_CONCURRENCY = 3;
const DEFAULT_LOCAL_APP_URL = "http://localhost:5173";

const CliArgsSchema = z.object({
    minutes: z.number().finite().positive(),
    projectRef: z.string(),
    focusSources: z.array(z.string().min(1)),
    severity: z.enum(["all", "warn", "error"]),
    raw: z.boolean(),
    invite: z.boolean(),
    harPath: z.string(),
    autoHar: z.boolean(),
    appUrl: z.string(),
    positional: z.array(z.string()),
});

function getErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}

function setRootPaths(root) {
    ROOT = root;
    OUT_FILE = path.join(ROOT, "networkErrors", "supabase_logs.json");
    CONSOLE_OUT_FILE = path.join(ROOT, "networkErrors", "localhost.console.json");
    LOCALHOST_ERROR_REPORT_FILE = path.join(ROOT, "networkErrors", "localhost_error_report.txt");
}

async function resolveWorkspaceRoot() {
    const markerPath = await findUp(["package.json", "AGENTS.md"], { cwd: process.cwd() });
    if (!markerPath) {
        return process.cwd();
    }
    return path.dirname(markerPath);
}

function splitCsv(value) {
    return String(value ?? "")
        .split(",")
        .map((source) => source.trim())
        .filter(Boolean);
}

function isTrueish(value) {
    return ["1", "true", "yes", "on", ""].includes(String(value ?? "").trim().toLowerCase());
}

function getSupportedSources() {
    const configuredSources = splitCsv(process.env.SUPABASE_LOG_SOURCES ?? process.env.LOG5_SOURCES ?? "");
    if (configuredSources.length === 0) {
        return DEFAULT_SOURCES;
    }
    return [...new Set([...DEFAULT_SOURCES, ...configuredSources])];
}

function getInviteSources(supportedSources) {
    const inviteConfigured = splitCsv(process.env.SUPABASE_INVITE_LOG_SOURCES ?? "");
    const sourceSet = new Set(supportedSources);
    const fallback = DEFAULT_INVITE_SOURCES.filter((source) => sourceSet.has(source));
    if (inviteConfigured.length === 0) {
        return fallback;
    }
    const fromConfig = [...new Set(inviteConfigured)].filter((source) => sourceSet.has(source));
    return fromConfig.length > 0 ? fromConfig : fallback;
}

async function readTextIfExists(filePath, contextLabel) {
    try {
        return await fs.readFile(filePath, "utf8");
    } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
            return "";
        }
        throw new Error(`${contextLabel}: ${getErrorMessage(error)}`);
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

async function loadEnvFilesIfPresent() {
    const envFiles = [
        path.join(ROOT, ".env.local"),
        path.join(ROOT, ".env"),
    ];

    for (const filePath of envFiles) {
        const raw = await readTextIfExists(filePath, `Failed to read env file ${filePath}`);
        if (!raw) {
            continue;
        }

        const parsed = parseEnvContent(raw);
        for (const [key, value] of Object.entries(parsed)) {
            if (process.env[key] == null) {
                process.env[key] = value;
            }
        }
    }
}

function parseArgs(argv, supportedSources) {
    const sourceListHelp = supportedSources.join(", ");
    const program = new Command()
        .name("supabase_logs")
        .description("Pull Supabase warning/error logs from the Management API with diagnostics.")
        .argument("[focus]", "Optional comma-separated focus sources, e.g. postgres_logs,function_logs")
        .option("-m, --minutes <minutes>", "Window size in minutes", (value) => Number(value), 5)
        .option("--project-ref <ref>", "Supabase project ref")
        .option("--focus <sources>", "Comma-separated source names")
        .option("--severity <mode>", "Severity filter: warn|error|all", "warn")
        .option("--raw", "Print raw source error responses")
        .option("--invite", "Shortcut focus for invite triage")
        .option("--har <path>", "Existing HAR file path to correlate")
        .option("--app-url <url>", "App URL for automatic localhost HAR capture")
        .option("--no-auto-har", "Disable automatic localhost HAR capture")
        .addHelpText("after", `\nAvailable sources: ${sourceListHelp}`);

    program.parse(argv, { from: "user" });

    const options = program.opts();
    const positional = program.processedArgs
        .filter((value) => typeof value === "string" && value.trim().length > 0)
        .map((value) => String(value));

    const rawArgs = {
        minutes: Number(options.minutes),
        projectRef: String(options.projectRef ?? "").trim(),
        focusSources: splitCsv(options.focus ?? ""),
        severity: String(options.severity ?? "warn").trim().toLowerCase(),
        raw: Boolean(options.raw),
        invite: Boolean(options.invite),
        harPath: String(options.har ?? "").trim(),
        autoHar: Boolean(options.autoHar),
        appUrl: String(options.appUrl ?? "").trim(),
        positional,
    };

    if (rawArgs.minutes === 5 && process.env.npm_config_minutes) {
        const fromNpm = Number(process.env.npm_config_minutes);
        if (Number.isFinite(fromNpm) && fromNpm > 0) {
            rawArgs.minutes = fromNpm;
        }
    }

    if (!rawArgs.projectRef && process.env.npm_config_project_ref) {
        rawArgs.projectRef = String(process.env.npm_config_project_ref).trim();
    }

    if (rawArgs.focusSources.length === 0 && process.env.npm_config_focus) {
        rawArgs.focusSources = splitCsv(process.env.npm_config_focus);
    }

    if (rawArgs.severity === "warn" && process.env.npm_config_severity) {
        rawArgs.severity = String(process.env.npm_config_severity).trim().toLowerCase();
    }

    if (!rawArgs.raw && process.env.npm_config_raw != null) {
        rawArgs.raw = isTrueish(process.env.npm_config_raw);
    }

    if (!rawArgs.invite && process.env.npm_config_invite != null) {
        rawArgs.invite = isTrueish(process.env.npm_config_invite);
    }

    if (!rawArgs.harPath && process.env.npm_config_har) {
        rawArgs.harPath = String(process.env.npm_config_har).trim();
    }

    if (!rawArgs.appUrl && process.env.npm_config_app_url) {
        rawArgs.appUrl = String(process.env.npm_config_app_url).trim();
    }

    if (rawArgs.autoHar && process.env.npm_config_no_auto_har != null) {
        rawArgs.autoHar = false;
    }

    if (rawArgs.focusSources.length === 0 && rawArgs.positional.length > 0) {
        rawArgs.focusSources = splitCsv(rawArgs.positional[0]);
    }

    const parsed = CliArgsSchema.safeParse(rawArgs);
    if (!parsed.success) {
        const messages = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
        throw new Error(`Invalid CLI arguments:\n- ${messages.join("\n- ")}`);
    }

    return parsed.data;
}

function resolveAppUrl(appUrlArg) {
    const fromArg = String(appUrlArg ?? "").trim();
    if (fromArg) {
        return fromArg;
    }

    const fromEnv = String(process.env.LOG5_APP_URL ?? process.env.LOCAL_APP_URL ?? "").trim();
    if (fromEnv) {
        return fromEnv;
    }

    return DEFAULT_LOCAL_APP_URL;
}

function isLocalhostUrl(urlValue) {
    try {
        const url = new URL(urlValue);
        const host = String(url.hostname ?? "").toLowerCase();
        return host === "localhost" || host === "127.0.0.1" || host === "::1";
    } catch {
        return false;
    }
}

function resolveSources(focusSources, invite, supportedSources, inviteSources) {
    const sourceSet = new Set(supportedSources);

    if (invite) {
        return inviteSources;
    }

    if (!Array.isArray(focusSources) || focusSources.length === 0) {
        return supportedSources;
    }

    const uniqueFocus = [...new Set(focusSources)];
    const invalid = uniqueFocus.filter((source) => !sourceSet.has(source));
    if (invalid.length > 0) {
        throw new Error(`Invalid --focus source(s): ${invalid.join(", ")}. Valid sources: ${supportedSources.join(", ")}`);
    }

    return uniqueFocus;
}

function runShell(command, args) {
    return new Promise((resolve) => {
        const child = spawn(command, args, {
            cwd: ROOT,
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

async function ensureSupabaseCli() {
    const res = await runShell("supabase", ["--version"]);
    if (res.code !== 0) {
        throw new Error(
            "Supabase CLI is required to auto-resolve project ref when --project-ref/SUPABASE_PROJECT_REF is not provided.",
        );
    }
}

async function readProjectRefFromLinkedTemp() {
    const projectRefPath = path.join(ROOT, "supabase", ".temp", "project-ref");
    const content = await readTextIfExists(projectRefPath, `Failed to read linked project ref at ${projectRefPath}`);
    return content.trim();
}

async function readProjectRefFromSupabaseCli() {
    const res = await runShell("supabase", ["projects", "list", "--output", "json"]);
    if (res.code !== 0) {
        return "";
    }

    const parsed = JSON.parse(res.stdout || "[]");
    if (!Array.isArray(parsed)) {
        return "";
    }

    if (parsed.length === 1 && typeof parsed[0]?.ref === "string") {
        return parsed[0].ref.trim();
    }

    return "";
}

async function resolveProjectRef(projectRefArg) {
    const fromArg = String(projectRefArg ?? "").trim();
    if (fromArg) {
        return { projectRef: fromArg, usedCli: false };
    }

    const fromEnv = String(process.env.SUPABASE_PROJECT_REF ?? "").trim();
    if (fromEnv) {
        return { projectRef: fromEnv, usedCli: false };
    }

    const fromLinked = await readProjectRefFromLinkedTemp();
    if (fromLinked) {
        return { projectRef: fromLinked, usedCli: false };
    }

    await ensureSupabaseCli();
    const fromCli = await readProjectRefFromSupabaseCli();
    return { projectRef: fromCli, usedCli: true };
}

function getAccessToken() {
    const explicit = String(process.env.SUPABASE_ACCESS_TOKEN ?? "").trim();
    if (explicit) {
        return explicit;
    }

    const alternate = String(process.env.SUPABASE_MANAGEMENT_TOKEN ?? "").trim();
    if (alternate) {
        return alternate;
    }

    return "";
}

function isoMinutesAgo(minutes) {
    const ms = Date.now() - Math.floor(minutes * 60_000);
    return new Date(ms).toISOString();
}

function getSeverityRegex(severity) {
    if (severity === "all") {
        return "";
    }

    if (severity === "error") {
        return "(error|fatal|exception)";
    }

    return "(error|warn|warning|exception|failed|denied|forbidden|timeout|panic|invalid|500|502|503|504|429|400|401|403|404)";
}

function buildSourceSql(source, startIso, endIso, severity) {
    const lines = [
        "select",
        "  s.timestamp,",
        "  s.event_message,",
        "  to_json_string(s) as raw_event_json",
        `from ${source} as s`,
        `where s.timestamp >= timestamp('${startIso}') and s.timestamp <= timestamp('${endIso}')`,
    ];

    const severityRegex = getSeverityRegex(severity);
    if (severityRegex) {
        lines.push(
            "and regexp_contains(",
            "  lower(concat(ifnull(s.event_message, ''), ' ', ifnull(to_json_string(s), ''))),",
            `  r'${severityRegex}'`,
            ")",
        );
    }

    lines.push("order by s.timestamp desc", "limit 500");
    return lines.join("\n");
}

function extractMatch(text, pattern) {
    const match = text.match(pattern);
    return match?.[1] ?? null;
}

function classifySeverity(message, statusCode) {
    if (typeof statusCode === "number") {
        if (statusCode >= 500) return "error";
        if (statusCode >= 400) return "warning";
    }

    const normalized = message.toLowerCase();
    if (/(panic|fatal|error|exception|failed|fail|timeout)/.test(normalized)) {
        return "error";
    }

    if (/(warn|warning|denied|forbidden|invalid|unauthorized|not found)/.test(normalized)) {
        return "warning";
    }

    return "info";
}

function normalizeSignature(message) {
    return message
        .toLowerCase()
        .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, "<uuid>")
        .replace(/\b\d{3,}\b/g, "<n>")
        .replace(/["'`][^"'`]{4,}["'`]/g, '"<value>"')
        .trim()
        .slice(0, 220);
}

function parseJsonSafe(text) {
    try {
        return JSON.parse(String(text ?? ""));
    } catch {
        return null;
    }
}

function getFirstHeaderObject(rawParsed) {
    return rawParsed?.metadata?.[0]?.response?.[0]?.headers?.[0] ?? null;
}

function extractRpcName(pathValue) {
    const pathText = String(pathValue ?? "");
    const match = pathText.match(/\/rest\/v1\/rpc\/([^/?]+)/i);
    return match?.[1] ?? null;
}

function extractProxyStatus(rawParsed) {
    const headerObj = getFirstHeaderObject(rawParsed);
    const proxyStatus = typeof headerObj?.proxy_status === "string" ? headerObj.proxy_status : null;
    return proxyStatus;
}

function extractPostgrestErrorCode(proxyStatus) {
    const text = String(proxyStatus ?? "");
    const match = text.match(/error=([A-Z0-9]+)/i);
    return match?.[1] ?? null;
}

function extractRequestResponseSnippets(rawParsed) {
    const requestNode = rawParsed?.metadata?.[0]?.request?.[0] ?? null;
    const responseNode = rawParsed?.metadata?.[0]?.response?.[0] ?? null;

    const requestBodyCandidate =
        requestNode?.body ??
        requestNode?.payload ??
        requestNode?.data ??
        requestNode?.query ??
        null;

    const responseBodyCandidate =
        responseNode?.body ??
        responseNode?.payload ??
        responseNode?.data ??
        responseNode?.error ??
        null;

    const requestBodySnippet = requestBodyCandidate == null
        ? null
        : toJsonStringSafe(requestBodyCandidate).slice(0, 400);
    const responseBodySnippet = responseBodyCandidate == null
        ? null
        : toJsonStringSafe(responseBodyCandidate).slice(0, 400);

    return {
        requestBodySnippet,
        responseBodySnippet,
    };
}

function deriveFailureCauseLine(entry) {
    const statusCode = entry?.statusCode;
    const errorCode = String(entry?.postgrestErrorCode ?? "").toUpperCase();
    const proxyStatus = String(entry?.proxyStatus ?? "").toLowerCase();

    if (errorCode === "23503" || proxyStatus.includes("constraint") || proxyStatus.includes("violat")) {
        return "Foreign key or relational integrity violation; one referenced ID likely does not exist in the target table.";
    }

    if (errorCode === "23505") {
        return "Unique constraint violation; duplicate row conflict for a key that must remain unique.";
    }

    if (statusCode === 401) {
        return "Authentication failure; token/session missing, expired, or invalid for this endpoint.";
    }

    if (statusCode === 403) {
        return "Authorization failure; role/RLS policy likely rejected this request.";
    }

    if (statusCode === 404) {
        return "Requested resource or route not found; verify endpoint path and IDs.";
    }

    if (typeof statusCode === "number" && statusCode >= 500) {
        return "Server-side execution failure; inspect runtime logs and upstream dependency responses.";
    }

    return entry?.rootCauseHints?.[0] ?? "Investigate request/response details and related source entries for the root cause.";
}

function deriveActionSuggestions(entry) {
    const suggestions = new Set();
    const statusCode = entry?.statusCode;
    const errorCode = String(entry?.postgrestErrorCode ?? "").toUpperCase();
    const proxyStatus = String(entry?.proxyStatus ?? "").toLowerCase();
    const signature = String(entry?.signature ?? "").toLowerCase();
    const source = String(entry?.source ?? "");
    const rpcName = String(entry?.rpcName ?? "").trim();
    const hints = Array.isArray(entry?.rootCauseHints) ? entry.rootCauseHints : [];

    if (statusCode === 401) {
        suggestions.add("Check auth session bootstrap flow.");
        suggestions.add("Verify Supabase redirect URL allowlist.");
        suggestions.add("Confirm cookies are set for correct domain.");
        suggestions.add("Ensure Authorization header is present in request.");
    }

    if (statusCode === 403) {
        suggestions.add("Check RLS policies for target table.");
        suggestions.add("Verify org membership role (owner/admin/hr etc).");
        suggestions.add("Confirm RPC permission guard logic matches membership model.");
    }

    if (statusCode === 404) {
        suggestions.add("Confirm route path and RPC name.");
        suggestions.add("Check ID existence before request.");
        suggestions.add("Validate org context switching logic.");
    }

    if (statusCode === 429) {
        suggestions.add("Check rate limiting or burst traffic.");
        suggestions.add("Add retry/backoff if necessary.");
    }

    if (typeof statusCode === "number" && statusCode >= 500) {
        suggestions.add("Inspect Edge Function logs.");
        suggestions.add("Correlate requestId across sources.");
        suggestions.add("Validate upstream dependency availability.");
    }

    if (errorCode === "23505") {
        suggestions.add("Unique constraint violation.");
        suggestions.add("Check upsert vs insert semantics.");
        suggestions.add("Confirm idempotency logic.");
    }

    if (errorCode === "23503" || proxyStatus.includes("constraint") || proxyStatus.includes("violat")) {
        suggestions.add("Foreign key violation.");
        suggestions.add("Verify referenced row exists.");
        suggestions.add("Check ordering of bootstrap creation.");
    }

    if (source === "function_logs" || source === "function_edge_logs") {
        suggestions.add("Verify deployed function version.");
        suggestions.add("Confirm environment variables exist in function runtime.");
    }

    if (rpcName) {
        suggestions.add("Validate RPC argument contract against database.types.ts.");
    }

    if (signature.includes("timeout") || signature.includes("deadline")) {
        suggestions.add("Profile latency and add retries/timeouts aligned with backend SLA.");
    }

    if (signature.includes("unauthorized") || signature.includes("forbidden") || signature.includes("permission")) {
        suggestions.add("Validate user auth context and org scoping before request dispatch.");
    }

    if (hints.some((hint) => String(hint).toLowerCase().includes("payload/query shape"))) {
        suggestions.add("Compare request payload keys/types with RPC function signature.");
    }

    return [...suggestions];
}

function deriveHints(message, statusCode, source) {
    const text = message.toLowerCase();
    const hints = [];

    if (statusCode === 401 || text.includes("unauthorized")) {
        hints.push("Auth token/session likely missing, expired, or invalid for this request path.");
    }

    if (statusCode === 403 || text.includes("forbidden") || text.includes("permission")) {
        hints.push("Permission or policy rejection; verify role grants, RLS policy scope, and organization context.");
    }

    if (statusCode === 404 || text.includes("not found")) {
        hints.push("Resource/path mismatch; verify IDs, route path, and object existence at request time.");
    }

    if (statusCode === 429 || text.includes("rate limit")) {
        hints.push("Rate limiting detected; reduce burst traffic or add retry/backoff strategy.");
    }

    if (statusCode != null && statusCode >= 500) {
        hints.push("Server-side failure; inspect upstream service logs around same timestamp and trace/request identifiers.");
    }

    if (text.includes("timeout") || text.includes("deadline")) {
        hints.push("Timeout/deadline exceeded; inspect query/runtime latency and downstream dependency response times.");
    }

    if (text.includes("invalid") || text.includes("parse") || text.includes("syntax")) {
        hints.push("Payload/query shape may be invalid; compare request fields and expected schema/contract.");
    }

    if (source === "postgres_logs" && (text.includes("statement") || text.includes("constraint") || text.includes("violat"))) {
        hints.push("Database query/constraint issue; inspect SQL, constraints, and RPC argument mapping.");
    }

    if (source === "function_logs" || source === "function_edge_logs") {
        hints.push("Edge Function involvement detected; correlate with function runtime logs and deployment version.");
    }

    return [...new Set(hints)];
}

function enrichRows(source, rows) {
    return rows.map((row) => {
        const timestamp = String(row?.timestamp ?? "");
        const eventMessage = String(row?.event_message ?? "");
        const rawEventJson = String(row?.raw_event_json ?? "");
        const searchable = `${eventMessage}\n${rawEventJson}`;

        const statusCodeRaw =
            extractMatch(searchable, /"status_code"\s*:\s*(\d{3})/) ??
            extractMatch(searchable, /\bstatus(?:\s*code)?\s*[:=]\s*(\d{3})\b/i);
        const statusCode = statusCodeRaw ? Number(statusCodeRaw) : null;

        const method =
            extractMatch(searchable, /"method"\s*:\s*"([A-Z]+)"/) ??
            extractMatch(searchable, /\bmethod\s*[:=]\s*([A-Z]+)/i);

        const pathValue =
            extractMatch(searchable, /"path"\s*:\s*"([^"]+)"/) ??
            extractMatch(searchable, /"url"\s*:\s*"([^"]+)"/) ??
            extractMatch(searchable, /\bpath\s*[:=]\s*([^\s,]+)/i);

        const requestId =
            extractMatch(searchable, /"request_id"\s*:\s*"([^"]+)"/) ??
            extractMatch(searchable, /"trace_id"\s*:\s*"([^"]+)"/) ??
            extractMatch(searchable, /"cf_ray"\s*:\s*"([^"]+)"/);

        const identifier =
            extractMatch(searchable, /"identifier"\s*:\s*"([^"]+)"/) ??
            extractMatch(searchable, /"project_ref"\s*:\s*"([^"]+)"/) ??
            null;

        const severity = classifySeverity(eventMessage, statusCode);
        const signature = normalizeSignature(eventMessage || rawEventJson || "unknown_event");
        const rawParsed = parseJsonSafe(rawEventJson);
        const proxyStatus = extractProxyStatus(rawParsed);
        const postgrestErrorCode = extractPostgrestErrorCode(proxyStatus);
        const rpcName = extractRpcName(pathValue);
        const bodySnippets = extractRequestResponseSnippets(rawParsed);

        return {
            source,
            timestamp,
            severity,
            statusCode,
            method,
            path: pathValue,
            rpcName,
            identifier,
            requestId,
            proxyStatus,
            postgrestErrorCode,
            eventMessage,
            signature,
            rootCauseHints: deriveHints(eventMessage, statusCode, source),
            probableCause: null,
            requestBodySnippet: bodySnippets.requestBodySnippet,
            responseBodySnippet: bodySnippets.responseBodySnippet,
            rawEventJson,
        };
    });
}

function buildFailureDiagnostics(results) {
    const allEntries = results.flatMap((result) => result.entries);
    const failedEntries = allEntries
        .filter((entry) => typeof entry.statusCode === "number" && entry.statusCode >= 400)
        .map((entry) => ({
            ...entry,
            probableCause: deriveFailureCauseLine(entry),
            actionSuggestions: deriveActionSuggestions(entry),
        }))
        .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));

    const rpcBuckets = new Map();
    for (const entry of failedEntries) {
        const key = entry.rpcName ?? entry.path ?? "unknown";
        const current = rpcBuckets.get(key) ?? {
            rpcName: entry.rpcName,
            path: entry.path,
            count: 0,
            lastSeenTimestamp: entry.timestamp,
            statusCodes: new Set(),
            errorCodes: new Set(),
            sources: new Set(),
            actionSuggestions: new Set(),
        };
        current.count += 1;
        if (entry.timestamp > current.lastSeenTimestamp) {
            current.lastSeenTimestamp = entry.timestamp;
        }
        if (entry.statusCode != null) {
            current.statusCodes.add(entry.statusCode);
        }
        if (entry.postgrestErrorCode) {
            current.errorCodes.add(entry.postgrestErrorCode);
        }
        current.sources.add(entry.source);
        for (const suggestion of entry.actionSuggestions ?? []) {
            current.actionSuggestions.add(suggestion);
        }
        rpcBuckets.set(key, current);
    }

    const topFailingRpcs = [...rpcBuckets.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((item) => ({
            rpcName: item.rpcName,
            path: item.path,
            count: item.count,
            lastSeenTimestamp: item.lastSeenTimestamp,
            statusCodes: [...item.statusCodes].sort((a, b) => a - b),
            errorCodes: [...item.errorCodes],
            sources: [...item.sources],
            actionSuggestions: [...item.actionSuggestions],
        }));

    const correlatedFailures = failedEntries.slice(0, 25).map((failed) => {
        const failedMs = toUnixMs(failed.timestamp);
        const relatedEntries = allEntries
            .filter((candidate) => {
                if (candidate === failed || candidate.source === failed.source) {
                    return false;
                }

                const candidateMs = toUnixMs(candidate.timestamp);
                const withinWindow = failedMs != null && candidateMs != null
                    ? Math.abs(candidateMs - failedMs) <= 120000
                    : false;
                const sameRpc = Boolean(failed.rpcName && candidate.rpcName && failed.rpcName === candidate.rpcName);
                const samePath = Boolean(failed.path && candidate.path && failed.path === candidate.path);
                return withinWindow && (sameRpc || samePath);
            })
            .slice(0, 6)
            .map((entry) => ({
                source: entry.source,
                timestamp: entry.timestamp,
                statusCode: entry.statusCode,
                method: entry.method,
                path: entry.path,
                requestId: entry.requestId,
                signature: entry.signature,
            }));

        return {
            source: failed.source,
            timestamp: failed.timestamp,
            method: failed.method,
            path: failed.path,
            rpcName: failed.rpcName,
            statusCode: failed.statusCode,
            requestId: failed.requestId,
            postgrestErrorCode: failed.postgrestErrorCode,
            proxyStatus: failed.proxyStatus,
            probableCause: failed.probableCause,
            rootCauseHints: failed.rootCauseHints,
            actionSuggestions: failed.actionSuggestions,
            requestBodySnippet: failed.requestBodySnippet,
            responseBodySnippet: failed.responseBodySnippet,
            relatedEntries,
        };
    });

    return {
        totalFailures: failedEntries.length,
        topFailingRpcs,
        failures: correlatedFailures,
    };
}

function buildActionGuidance(failureDiagnostics) {
    const failures = Array.isArray(failureDiagnostics?.failures) ? failureDiagnostics.failures : [];
    const counts = new Map();

    for (const failure of failures) {
        const suggestions = Array.isArray(failure?.actionSuggestions) ? failure.actionSuggestions : [];
        for (const suggestion of suggestions) {
            counts.set(suggestion, (counts.get(suggestion) ?? 0) + 1);
        }
    }

    const summary = [...counts.entries()]
        .sort((a, b) => {
            if (b[1] !== a[1]) {
                return b[1] - a[1];
            }
            return a[0].localeCompare(b[0]);
        })
        .slice(0, 5)
        .map(([suggestion, count]) => ({ suggestion, count }));

    const perFailure = failures.map((failure) => ({
        source: failure.source,
        timestamp: failure.timestamp,
        rpcName: failure.rpcName,
        path: failure.path,
        statusCode: failure.statusCode,
        postgrestErrorCode: failure.postgrestErrorCode,
        probableCause: failure.probableCause,
        actionSuggestions: Array.isArray(failure.actionSuggestions) ? failure.actionSuggestions : [],
    }));

    return {
        summary,
        perFailure,
    };
}

function toJsonStringSafe(value) {
    if (typeof value === "string") {
        return value;
    }

    try {
        return JSON.stringify(value);
    } catch {
        return String(value ?? "");
    }
}

function getApiErrorCode(status, errorValue) {
    if (typeof status === "number" && status >= 400) {
        return status;
    }

    if (typeof errorValue === "object" && errorValue != null && typeof errorValue.code === "number") {
        return errorValue.code;
    }

    if (typeof errorValue === "string") {
        const codeFromText = extractMatch(errorValue, /\b(400|404)\b/);
        return codeFromText ? Number(codeFromText) : null;
    }

    return null;
}

function getApiErrorMessage(status, source, errorValue) {
    const code = getApiErrorCode(status, errorValue);
    if (code === 400 || code === 404) {
        return `Source ${source} unsupported or unavailable for this project/token.`;
    }

    const text = toJsonStringSafe(errorValue).slice(0, 300);
    return text || `Source ${source} query failed.`;
}

function buildSourceDiagnostic(sourceResult) {
    const entries = sourceResult.entries;
    const statusBuckets = {
        status2xx: 0,
        status3xx: 0,
        status4xx: 0,
        status5xx: 0,
        statusUnknown: 0,
    };

    const severityBuckets = {
        error: 0,
        warning: 0,
        info: 0,
    };

    const signatures = new Map();
    const hints = new Map();

    for (const entry of entries) {
        if (entry.statusCode == null) {
            statusBuckets.statusUnknown += 1;
        } else if (entry.statusCode >= 500) {
            statusBuckets.status5xx += 1;
        } else if (entry.statusCode >= 400) {
            statusBuckets.status4xx += 1;
        } else if (entry.statusCode >= 300) {
            statusBuckets.status3xx += 1;
        } else {
            statusBuckets.status2xx += 1;
        }

        severityBuckets[entry.severity] += 1;
        signatures.set(entry.signature, (signatures.get(entry.signature) ?? 0) + 1);

        for (const hint of entry.rootCauseHints) {
            hints.set(hint, (hints.get(hint) ?? 0) + 1);
        }
    }

    const topSignatures = [...signatures.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([signature, count]) => ({ signature, count }));

    const topHints = [...hints.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hint, count]) => ({ hint, count }));

    return {
        source: sourceResult.source,
        ok: sourceResult.ok,
        status: sourceResult.status,
        error: sourceResult.error,
        matchedEntries: entries.length,
        statusBuckets,
        severityBuckets,
        topSignatures,
        topHints,
    };
}

function buildAtGlance(results, diagnosticsBySource, summary, selectedSources, allSupportedSources, minutes) {
    const diagnosticFailures = results
        .filter((result) => !result.ok)
        .map((result) => ({
            source: result.source,
            status: result.status,
            explanation: getApiErrorMessage(result.status, result.source, result.error),
        }));

    const statusTotals = {
        status4xx: 0,
        status5xx: 0,
        statusUnknown: 0,
    };

    const signatureCounts = new Map();
    const hintCounts = new Map();

    for (const sourceDiagnostic of diagnosticsBySource) {
        statusTotals.status4xx += sourceDiagnostic.statusBuckets.status4xx;
        statusTotals.status5xx += sourceDiagnostic.statusBuckets.status5xx;
        statusTotals.statusUnknown += sourceDiagnostic.statusBuckets.statusUnknown;

        for (const item of sourceDiagnostic.topSignatures) {
            signatureCounts.set(item.signature, (signatureCounts.get(item.signature) ?? 0) + item.count);
        }

        for (const item of sourceDiagnostic.topHints) {
            hintCounts.set(item.hint, (hintCounts.get(item.hint) ?? 0) + item.count);
        }
    }

    const topSignatures = [...signatureCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([signature, count]) => ({ signature, count }));

    const likelyPrimaryCauses = [...hintCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hint, count]) => ({ hint, count }));

    const checks = [];
    if (summary.totalRows === 0) {
        checks.push(`No warning/error matches found in the last ${minutes} minute(s). Increase window with --minutes or broaden source focus.`);
    }

    if (statusTotals.status5xx > 0) {
        checks.push("5xx errors detected. Prioritize server-side traces and correlate request IDs/timestamps across affected sources.");
    }

    if (statusTotals.status4xx > 0) {
        checks.push("4xx errors detected. Review auth, permissions, request paths, and payload schema contracts.");
    }

    if (diagnosticFailures.length > 0) {
        checks.push("Some source queries failed. Inspect diagnosticsBySource.error and queryFailures explanations.");
    }

    if (selectedSources.length < allSupportedSources.length) {
        checks.push("Focused run active; some root causes may be outside selected sources.");
    }

    if (checks.length === 0) {
        checks.push("No immediate high-risk patterns detected in this window; inspect topSignatures and likelyPrimaryCauses for recurring weak signals.");
    }

    return {
        selectedSources,
        sourceMode: selectedSources.length === allSupportedSources.length ? "all" : "focused",
        queryFailures: diagnosticFailures,
        statusTotals,
        topSignatures,
        likelyPrimaryCauses,
        checks,
    };
}

function normalizeHarPath(harPath) {
    if (!harPath) {
        return "";
    }

    if (path.isAbsolute(harPath)) {
        return harPath;
    }

    return path.join(ROOT, harPath);
}

async function captureLocalHar(appUrl) {
    const targetPath = path.join(ROOT, "networkErrors", "localhost.auto.har");
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    let playwrightModule;
    try {
        playwrightModule = await import("playwright");
    } catch {
        return {
            attempted: true,
            captured: false,
            reason: "Playwright is not installed; skipping automatic HAR capture.",
            harPath: null,
        };
    }

    const chromium = playwrightModule?.chromium;
    if (!chromium) {
        return {
            attempted: true,
            captured: false,
            reason: "Playwright chromium API unavailable; skipping automatic HAR capture.",
            harPath: null,
        };
    }

    let browser = null;
    let context = null;
    const consoleEvents = [];
    try {
        browser = await chromium.launch({ headless: true });
        context = await browser.newContext({
            recordHar: {
                path: targetPath,
            },
        });

        const page = await context.newPage();
        page.on("console", (message) => {
            const args = message.args().map((arg) => arg.toString());
            consoleEvents.push({
                ts: new Date().toISOString(),
                type: message.type(),
                text: message.text(),
                args,
                location: message.location(),
            });
        });

        page.on("pageerror", (error) => {
            consoleEvents.push({
                ts: new Date().toISOString(),
                type: "pageerror",
                text: error instanceof Error ? error.message : String(error),
                args: [],
                location: null,
            });
        });

        await page.goto(appUrl, { waitUntil: "networkidle", timeout: 15000 });
        await page.waitForTimeout(2000);

        await fs.writeFile(CONSOLE_OUT_FILE, `${JSON.stringify(consoleEvents, null, 2)}\n`, "utf8");
        await context.close();
        await browser.close();

        return {
            attempted: true,
            captured: true,
            reason: null,
            harPath: targetPath,
            consolePath: CONSOLE_OUT_FILE,
            consoleCount: consoleEvents.length,
        };
    } catch (error) {
        try {
            await context?.close();
        } catch {
            // no-op
        }
        try {
            await browser?.close();
        } catch {
            // no-op
        }

        return {
            attempted: true,
            captured: false,
            reason: `Automatic HAR capture failed: ${error instanceof Error ? error.message : String(error)}`,
            harPath: null,
            consolePath: null,
            consoleCount: 0,
        };
    }
}

async function resolveHarPath(args, appUrl) {
    if (args.harPath) {
        return {
            resolvedHarPath: args.harPath,
            autoHar: {
                attempted: false,
                captured: false,
                reason: "Explicit --har provided; skipped automatic HAR capture.",
                harPath: normalizeHarPath(args.harPath),
                consolePath: null,
                consoleCount: 0,
            },
        };
    }

    if (!args.autoHar) {
        return {
            resolvedHarPath: "",
            autoHar: {
                attempted: false,
                captured: false,
                reason: "Automatic HAR capture disabled by --no-auto-har.",
                harPath: null,
                consolePath: null,
                consoleCount: 0,
            },
        };
    }

    if (!isLocalhostUrl(appUrl)) {
        return {
            resolvedHarPath: "",
            autoHar: {
                attempted: false,
                captured: false,
                reason: "Automatic HAR capture only runs for localhost URLs.",
                harPath: null,
                consolePath: null,
                consoleCount: 0,
            },
        };
    }

    const autoHar = await captureLocalHar(appUrl);
    return {
        resolvedHarPath: autoHar.harPath ?? "",
        autoHar,
    };
}

function toUnixMs(value) {
    const ms = Date.parse(String(value ?? ""));
    if (Number.isNaN(ms)) {
        return null;
    }
    return ms;
}

function extractPathname(urlValue) {
    try {
        const url = new URL(String(urlValue ?? ""));
        return `${url.pathname}${url.search}`;
    } catch {
        return String(urlValue ?? "");
    }
}

async function buildHarCorrelation(harPath, backendResults) {
    if (!harPath) {
        return null;
    }

    const absolutePath = normalizeHarPath(harPath);
    const raw = await readTextIfExists(absolutePath, `Failed to read HAR file at ${absolutePath}`);
    if (!raw) {
        return {
            enabled: true,
            harPath: absolutePath,
            error: "HAR file not found or unreadable",
        };
    }

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return {
            enabled: true,
            harPath: absolutePath,
            error: "HAR file is not valid JSON",
        };
    }

    const harEntriesRaw = Array.isArray(parsed?.log?.entries) ? parsed.log.entries : [];
    const harEntries = harEntriesRaw.map((entry) => ({
        startedAt: String(entry?.startedDateTime ?? ""),
        method: String(entry?.request?.method ?? ""),
        path: extractPathname(entry?.request?.url ?? ""),
        statusCode: typeof entry?.response?.status === "number" ? entry.response.status : null,
    }));

    const backendEntries = backendResults.flatMap((result) =>
        result.entries.map((entry) => ({
            source: entry.source,
            timestamp: entry.timestamp,
            method: entry.method,
            path: entry.path,
            statusCode: entry.statusCode,
            signature: entry.signature,
        })),
    );

    let matched = 0;
    for (const harEntry of harEntries) {
        const harMs = toUnixMs(harEntry.startedAt);
        const candidate = backendEntries.find((backendEntry) => {
            const backendMs = toUnixMs(backendEntry.timestamp);
            if (harMs == null || backendMs == null) {
                return false;
            }

            const withinWindow = Math.abs(backendMs - harMs) <= 120000;
            const sameStatus = harEntry.statusCode != null && backendEntry.statusCode != null
                ? harEntry.statusCode === backendEntry.statusCode
                : true;
            const pathMatch = harEntry.path && backendEntry.path
                ? harEntry.path.includes(backendEntry.path) || backendEntry.path.includes(harEntry.path)
                : true;
            return withinWindow && sameStatus && pathMatch;
        });

        if (candidate) {
            matched += 1;
        }
    }

    return {
        enabled: true,
        harPath: absolutePath,
        harEntryCount: harEntries.length,
        backendEntryCount: backendEntries.length,
        matchedEntries: matched,
        unmatchedEntries: Math.max(harEntries.length - matched, 0),
    };
}

async function fetchSourceLogs({ projectRef, accessToken, source, startIso, endIso, severity }) {
    const sql = buildSourceSql(source, startIso, endIso, severity);
    const query = new URLSearchParams({
        iso_timestamp_start: startIso,
        iso_timestamp_end: endIso,
        sql,
    });

    const url = `${MANAGEMENT_API_BASE}/projects/${projectRef}/analytics/endpoints/logs.all?${query.toString()}`;
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    const bodyText = await response.text();
    let body = null;
    if (bodyText) {
        try {
            body = JSON.parse(bodyText);
        } catch {
            body = { raw: bodyText.slice(0, 5000) };
        }
    }

    if (!response.ok) {
        return {
            source,
            ok: false,
            status: response.status,
            error: body,
            rowCount: 0,
            entries: [],
        };
    }

    const rows = Array.isArray(body?.result) ? body.result : [];
    const hasApiError = Boolean(body?.error);
    const enrichedEntries = hasApiError ? [] : enrichRows(source, rows);

    return {
        source,
        ok: !hasApiError,
        status: response.status,
        error: body?.error ?? null,
        rowCount: rows.length,
        entries: enrichedEntries,
    };
}

async function mapWithConcurrency(items, limit, mapper) {
    const results = new Array(items.length);
    let cursor = 0;

    async function worker() {
        while (true) {
            const index = cursor;
            cursor += 1;
            if (index >= items.length) {
                return;
            }
            results[index] = await mapper(items[index], index);
        }
    }

    const workerCount = Math.min(limit, items.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
    return results;
}

function summarizeResults(results) {
    const summary = {
        totalSources: results.length,
        successfulSources: 0,
        failedSources: 0,
        totalRows: 0,
    };

    for (const item of results) {
        if (item.ok) {
            summary.successfulSources += 1;
            summary.totalRows += item.entries.length;
        } else {
            summary.failedSources += 1;
        }
    }

    return summary;
}

async function writeOutputFile(payload) {
    await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
    await fs.writeFile(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function buildLocalhostErrorReport(payload) {
    const lines = [];
    const summary = payload?.summary ?? {};
    const atGlance = payload?.atGlance ?? {};
    const diagnosticsBySource = Array.isArray(payload?.diagnosticsBySource) ? payload.diagnosticsBySource : [];
    const topFailingRpcs = Array.isArray(payload?.failureDiagnostics?.topFailingRpcs)
        ? payload.failureDiagnostics.topFailingRpcs
        : [];
    const queryFailures = Array.isArray(atGlance.queryFailures) ? atGlance.queryFailures : [];
    const likelyCauses = Array.isArray(atGlance.likelyPrimaryCauses) ? atGlance.likelyPrimaryCauses : [];
    const checks = Array.isArray(atGlance.checks) ? atGlance.checks : [];

    lines.push("LOCALHOST ERROR REPORT");
    lines.push("======================");
    lines.push(`Generated: ${payload?.generatedAt ?? "unknown"}`);
    lines.push(`Project: ${payload?.projectRef ?? "unknown"}`);
    lines.push(`Window: last ${payload?.window?.minutes ?? "?"} minute(s) (${payload?.window?.startIso ?? "?"} -> ${payload?.window?.endIso ?? "?"})`);
    lines.push(`Severity mode: ${payload?.options?.severity ?? "unknown"}`);
    lines.push("");

    lines.push("1) Summary");
    lines.push("----------");
    lines.push(`- Sources scanned: ${summary.totalSources ?? 0}`);
    lines.push(`- Successful source queries: ${summary.successfulSources ?? 0}`);
    lines.push(`- Failed source queries: ${summary.failedSources ?? 0}`);
    lines.push(`- Matched warning/error rows: ${summary.totalRows ?? 0}`);
    lines.push("");

    lines.push("2) Where errors are coming from");
    lines.push("-------------------------------");
    if (queryFailures.length === 0) {
        lines.push("- No source-level query failures in this run.");
    } else {
        for (const failure of queryFailures) {
            lines.push(`- Source '${failure.source}' failed (status ${failure.status}): ${failure.explanation}`);
        }
    }
    lines.push("");

    lines.push("3) Why these errors are likely happening");
    lines.push("----------------------------------------");
    if (likelyCauses.length === 0) {
        lines.push("- No dominant root-cause hints were detected in this window.");
    } else {
        for (const cause of likelyCauses.slice(0, 10)) {
            lines.push(`- [${cause.count}] ${cause.hint}`);
        }
    }
    lines.push("");

    lines.push("4) Most impacted RPC/path buckets");
    lines.push("---------------------------------");
    if (topFailingRpcs.length === 0) {
        lines.push("- No recurring RPC/path failure bucket was identified.");
    } else {
        for (const item of topFailingRpcs.slice(0, 15)) {
            const name = item.rpcName || item.path || "unknown";
            const statusCodes = Array.isArray(item.statusCodes) && item.statusCodes.length > 0
                ? item.statusCodes.join(",")
                : "n/a";
            const errorCodes = Array.isArray(item.errorCodes) && item.errorCodes.length > 0
                ? item.errorCodes.join(",")
                : "n/a";
            lines.push(`- [${item.count}] ${name} | status=${statusCodes} | errorCodes=${errorCodes}`);
        }
    }
    lines.push("");

    lines.push("5) Source-by-source evidence");
    lines.push("----------------------------");
    for (const sourceDiag of diagnosticsBySource) {
        lines.push(`Source: ${sourceDiag.source}`);
        lines.push(`- Query status: ${sourceDiag.ok ? "ok" : "failed"}${sourceDiag.status != null ? ` (HTTP ${sourceDiag.status})` : ""}`);
        if (!sourceDiag.ok && sourceDiag.error != null) {
            lines.push(`- Query error detail: ${toJsonStringSafe(sourceDiag.error).slice(0, 500)}`);
        }
        lines.push(`- Matched entries: ${sourceDiag.matchedEntries}`);
        lines.push(
            `- Severity counts: error=${sourceDiag.severityBuckets.error}, warning=${sourceDiag.severityBuckets.warning}, info=${sourceDiag.severityBuckets.info}`,
        );
        lines.push(
            `- HTTP buckets in matched entries: 4xx=${sourceDiag.statusBuckets.status4xx}, 5xx=${sourceDiag.statusBuckets.status5xx}, unknown=${sourceDiag.statusBuckets.statusUnknown}`,
        );

        if (Array.isArray(sourceDiag.topSignatures) && sourceDiag.topSignatures.length > 0) {
            lines.push("- Top signatures:");
            for (const sig of sourceDiag.topSignatures.slice(0, 5)) {
                lines.push(`  - [${sig.count}] ${sig.signature}`);
            }
        }

        if (Array.isArray(sourceDiag.topHints) && sourceDiag.topHints.length > 0) {
            lines.push("- Top cause hints:");
            for (const hint of sourceDiag.topHints.slice(0, 5)) {
                lines.push(`  - [${hint.count}] ${hint.hint}`);
            }
        }

        lines.push("");
    }

    lines.push("6) Action checklist");
    lines.push("-------------------");
    if (checks.length === 0) {
        lines.push("- No checks generated.");
    } else {
        for (const check of checks) {
            lines.push(`- ${check}`);
        }
    }

    return `${lines.join("\n")}\n`;
}

async function writeLocalhostErrorReport(payload) {
    const reportText = buildLocalhostErrorReport(payload);
    await fs.mkdir(path.dirname(LOCALHOST_ERROR_REPORT_FILE), { recursive: true });
    await fs.writeFile(LOCALHOST_ERROR_REPORT_FILE, reportText, "utf8");
}

function printQuickSummary(payload) {
    const checks = Array.isArray(payload?.atGlance?.checks) ? payload.atGlance.checks : [];
    const causes = Array.isArray(payload?.atGlance?.likelyPrimaryCauses) ? payload.atGlance.likelyPrimaryCauses : [];
    const signatures = Array.isArray(payload?.atGlance?.topSignatures) ? payload.atGlance.topSignatures : [];
    const queryFailures = Array.isArray(payload?.atGlance?.queryFailures) ? payload.atGlance.queryFailures : [];
    const topFailingRpcs = Array.isArray(payload?.failureDiagnostics?.topFailingRpcs)
        ? payload.failureDiagnostics.topFailingRpcs
        : [];

    console.log(pc.bold(pc.cyan("\n=== Log5 Quick Summary ===")));
    console.log(`Generated: ${payload.generatedAt}`);
    console.log(`Window: last ${payload.window.minutes} min (${payload.window.startIso} -> ${payload.window.endIso})`);
    console.log(
        `Sources: ${payload.summary.totalSources} total | ${payload.summary.successfulSources} ok | ${payload.summary.failedSources} failed`,
    );
    console.log(`Matched rows: ${payload.summary.totalRows}`);

    console.log(pc.bold("\nAt-a-glance checks:"));
    if (checks.length === 0) {
        console.log("- none");
    } else {
        for (const check of checks) {
            console.log(`- ${check}`);
        }
    }

    console.log(pc.bold("\nLikely primary causes (top 5):"));
    if (causes.length === 0) {
        console.log("- none in this window");
    } else {
        for (const cause of causes.slice(0, 5)) {
            console.log(`- [${cause.count}] ${cause.hint}`);
        }
    }

    console.log(pc.bold("\nTop signatures (top 5):"));
    if (signatures.length === 0) {
        console.log("- none in this window");
    } else {
        for (const signature of signatures.slice(0, 5)) {
            console.log(`- [${signature.count}] ${signature.signature}`);
        }
    }

    console.log(pc.bold("\nSource failures:"));
    if (queryFailures.length === 0) {
        console.log(pc.green("- none"));
    } else {
        for (const failure of queryFailures) {
            console.log(pc.red(`- ${failure.source} (status ${failure.status}): ${failure.explanation}`));
        }
    }

    console.log(pc.bold("\nTop failing RPC/path buckets:"));
    if (topFailingRpcs.length === 0) {
        console.log("- none in this window");
    } else {
        for (const item of topFailingRpcs.slice(0, 5)) {
            const name = item.rpcName || item.path || "unknown";
            const statusCodes = Array.isArray(item.statusCodes) ? item.statusCodes.join(",") : "";
            const errorCodes = Array.isArray(item.errorCodes) ? item.errorCodes.join(",") : "";
            console.log(`- [${item.count}] ${name} | status=${statusCodes} | errorCodes=${errorCodes}`);
        }
    }
}

async function main() {
    const workspaceRoot = await resolveWorkspaceRoot();
    setRootPaths(workspaceRoot);
    await loadEnvFilesIfPresent();

    const supportedSources = getSupportedSources();
    const inviteSources = getInviteSources(supportedSources);
    const args = parseArgs(process.argv.slice(2), supportedSources);
    const selectedSources = resolveSources(args.focusSources, args.invite, supportedSources, inviteSources);
    const appUrl = resolveAppUrl(args.appUrl);
    console.log(pc.cyan(`🌐 App URL for HAR capture: ${appUrl}`));

    const resolved = await resolveProjectRef(args.projectRef);
    const projectRef = resolved.projectRef;
    const accessToken = getAccessToken();

    if (!projectRef) {
        console.error(pc.red("❌ Missing Supabase project ref. Set --project-ref or SUPABASE_PROJECT_REF, or run supabase link."));
        process.exit(1);
    }

    if (!accessToken) {
        const hasServiceRole = String(process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim().length > 0;
        console.error(pc.red("❌ Missing SUPABASE_ACCESS_TOKEN for Management API log access."));
        if (hasServiceRole) {
            console.error(pc.yellow("SUPABASE_SERVICE_ROLE_KEY cannot access Management API analytics logs endpoints."));
        }
        console.error(pc.yellow("Set SUPABASE_ACCESS_TOKEN (or SUPABASE_MANAGEMENT_TOKEN) in .env/.env.local or your shell."));
        process.exit(1);
    }

    const endIso = new Date().toISOString();
    const startIso = isoMinutesAgo(args.minutes);

    const harResolution = await resolveHarPath(args, appUrl);
    if (harResolution.autoHar.attempted && harResolution.autoHar.captured && harResolution.autoHar.harPath) {
        console.log(pc.green(`🧷 Captured local HAR: ${harResolution.autoHar.harPath}`));
        if (harResolution.autoHar.consolePath) {
            console.log(pc.green(
                `🪵 Captured browser console: ${harResolution.autoHar.consolePath} (${harResolution.autoHar.consoleCount} entries)`,
            ));
        }
    } else if (harResolution.autoHar.reason) {
        console.log(pc.yellow(`🧷 HAR capture note: ${harResolution.autoHar.reason}`));
    }

    const sourceLabel = selectedSources.length === supportedSources.length ? "all sources" : selectedSources.join(", ");
    console.log(
        pc.cyan(`🔎 Pulling Supabase logs for ${projectRef} (${args.minutes}m window, severity=${args.severity}, ${sourceLabel})...`),
    );

    const results = await mapWithConcurrency(selectedSources, MAX_CONCURRENCY, async (source) =>
        fetchSourceLogs({
            projectRef,
            accessToken,
            source,
            startIso,
            endIso,
            severity: args.severity,
        }),
    );

    for (const result of results) {
        if (!result.ok) {
            const code = getApiErrorCode(result.status, result.error);
            if (code === 400 || code === 404) {
                console.error(pc.yellow(`⚠️ Source ${result.source} unsupported or unavailable for this project/token.`));
                if (args.raw && result.error != null) {
                    console.error(pc.yellow(toJsonStringSafe(result.error)));
                }
            } else if (args.raw && result.error != null) {
                console.error(pc.red(`⚠️ Source ${result.source} query error: ${toJsonStringSafe(result.error)}`));
            }
        }
    }

    const summary = summarizeResults(results);
    const diagnosticsBySource = results.map((result) => buildSourceDiagnostic(result));
    const atGlance = buildAtGlance(results, diagnosticsBySource, summary, selectedSources, supportedSources, args.minutes);
    const failureDiagnostics = buildFailureDiagnostics(results);
    const actionGuidance = buildActionGuidance(failureDiagnostics);
    atGlance.actionSummary = actionGuidance.summary;
    const harCorrelation = await buildHarCorrelation(harResolution.resolvedHarPath, results);

    const payload = {
        generatedAt: new Date().toISOString(),
        projectRef,
        window: {
            minutes: args.minutes,
            startIso,
            endIso,
        },
        options: {
            severity: args.severity,
            raw: args.raw,
            invite: args.invite,
            selectedSources,
            usedCliForProjectRef: resolved.usedCli,
            maxConcurrency: MAX_CONCURRENCY,
            appUrl,
            autoHar: args.autoHar,
            har: harResolution.resolvedHarPath || null,
        },
        summary,
        atGlance,
        failureDiagnostics,
        actionGuidance,
        diagnosticsBySource,
        harCorrelation,
        autoHar: harResolution.autoHar,
        results,
    };

    const serialized = JSON.stringify(payload, null, 2);
    if (serialized.length <= MAX_TERMINAL_CHARS) {
        console.log(serialized);
    } else {
        await writeOutputFile(payload);
        console.log(pc.yellow(`📄 Output too large for terminal; wrote logs to: ${OUT_FILE}`));
    }

    await writeLocalhostErrorReport(payload);
    console.log(pc.green(`📝 Wrote readable localhost error report: ${LOCALHOST_ERROR_REPORT_FILE}`));

    printQuickSummary(payload);
}

main().catch((error) => {
    console.error(pc.red("❌ supabase_logs failed"), { error: getErrorMessage(error) });
    process.exit(1);
});
