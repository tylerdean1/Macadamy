// START: supabase/functions/_shared/microsoftGraph.ts
// Note:
// - Supabase Edge Functions run on Deno in Supabase's runtime.
// - This helper intentionally uses Web Crypto APIs available in Deno.

export type JsonRecord = Record<string, unknown>;

export type MicrosoftTokenResponse = {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    scope?: string;
    expires_in: number;
    id_token?: string;
};

export type MicrosoftUserProfile = {
    id: string;
    displayName?: string | null;
    mail?: string | null;
    userPrincipalName?: string | null;
};

export type StoredMicrosoftConnection = {
    id: string;
    user_id: string;
    microsoft_tenant_id: string;
    microsoft_user_id: string;
    access_token_ciphertext: string;
    refresh_token_ciphertext: string;
    expires_at: string;
    granted_scopes: string[];
    connected_features: string[];
    status: string;
};

export const MICROSOFT_GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';

export const MICROSOFT_GRAPH_SCOPES = [
    'openid',
    'profile',
    'email',
    'offline_access',
    'User.Read',
    'Files.Read.All',
    'Sites.Read.All',
    'Mail.Read',
    'Mail.Send',
    'Team.ReadBasic.All',
    'Channel.ReadBasic.All',
    'Chat.Read',
    'ChannelMessage.Read.All',
] as const;

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

export function jsonResponse(
    status: number,
    body: JsonRecord,
    origin: string | null,
    methods = 'POST, OPTIONS',
): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Access-Control-Allow-Origin': origin ?? '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Access-Control-Allow-Methods': methods,
            'Access-Control-Max-Age': '86400',
            Vary: 'Origin',
            'Content-Type': 'application/json',
        },
    });
}

export function corsResponse(origin: string | null, methods = 'POST, OPTIONS'): Response {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': origin ?? '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Access-Control-Allow-Methods': methods,
            'Access-Control-Max-Age': '86400',
            Vary: 'Origin',
        },
    });
}

export function getRequiredEnv(name: string): string {
    const value = Deno.env.get(name);
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export function getBearerToken(authHeader: string | null): string | null {
    if (!authHeader) {
        return null;
    }

    const prefix = 'Bearer ';
    if (!authHeader.startsWith(prefix)) {
        return null;
    }

    const token = authHeader.slice(prefix.length).trim();
    return token.length > 0 ? token : null;
}

export function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
    const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let binary = '';
    for (const byte of array) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export async function sha256Base64Url(value: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', TEXT_ENCODER.encode(value));
    return base64UrlEncode(digest);
}

export function createRandomBase64Url(byteCount: number): string {
    const bytes = new Uint8Array(byteCount);
    crypto.getRandomValues(bytes);
    return base64UrlEncode(bytes);
}

export function parseGrantedScopes(scopeValue: string | undefined): string[] {
    if (!scopeValue) {
        return [];
    }

    return scopeValue
        .split(' ')
        .map((scope) => scope.trim())
        .filter((scope) => scope.length > 0);
}

export function inferConnectedFeatures(scopes: string[]): string[] {
    const scopeSet = new Set(scopes.map((scope) => scope.toLowerCase()));
    const features = new Set<string>();

    if (scopeSet.has('files.read.all') || scopeSet.has('sites.read.all')) {
        features.add('sharepoint');
    }

    if (scopeSet.has('mail.read') || scopeSet.has('mail.send')) {
        features.add('outlook');
    }

    if (
        scopeSet.has('team.readbasic.all') ||
        scopeSet.has('channel.readbasic.all') ||
        scopeSet.has('chat.read') ||
        scopeSet.has('channelmessage.read.all')
    ) {
        features.add('teams');
    }

    return Array.from(features);
}

export function getMicrosoftTenant(): string {
    return Deno.env.get('MICROSOFT_TENANT') ?? 'organizations';
}

export function getMicrosoftAuthorizeUrl(): string {
    return `https://login.microsoftonline.com/${getMicrosoftTenant()}/oauth2/v2.0/authorize`;
}

export function getMicrosoftTokenUrl(): string {
    return `https://login.microsoftonline.com/${getMicrosoftTenant()}/oauth2/v2.0/token`;
}

export async function exchangeCodeForTokens(args: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
}): Promise<MicrosoftTokenResponse> {
    const body = new URLSearchParams({
        client_id: getRequiredEnv('MICROSOFT_CLIENT_ID'),
        client_secret: getRequiredEnv('MICROSOFT_CLIENT_SECRET'),
        grant_type: 'authorization_code',
        code: args.code,
        redirect_uri: args.redirectUri,
        code_verifier: args.codeVerifier,
    });

    const response = await fetch(getMicrosoftTokenUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });

    const payload = await response.json() as JsonRecord;
    if (!response.ok) {
        throw new Error(typeof payload.error_description === 'string' ? payload.error_description : 'Microsoft token exchange failed.');
    }

    return payload as MicrosoftTokenResponse;
}

export async function refreshMicrosoftTokens(refreshToken: string): Promise<MicrosoftTokenResponse> {
    const body = new URLSearchParams({
        client_id: getRequiredEnv('MICROSOFT_CLIENT_ID'),
        client_secret: getRequiredEnv('MICROSOFT_CLIENT_SECRET'),
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        scope: MICROSOFT_GRAPH_SCOPES.join(' '),
    });

    const response = await fetch(getMicrosoftTokenUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });

    const payload = await response.json() as JsonRecord;
    if (!response.ok) {
        throw new Error(typeof payload.error_description === 'string' ? payload.error_description : 'Microsoft token refresh failed.');
    }

    return payload as MicrosoftTokenResponse;
}

export async function fetchMicrosoftProfile(accessToken: string): Promise<MicrosoftUserProfile> {
    const response = await fetch(`${MICROSOFT_GRAPH_BASE_URL}/me?$select=id,displayName,mail,userPrincipalName`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const payload = await response.json() as JsonRecord;
    if (!response.ok) {
        throw new Error(typeof payload.error?.toString === 'function' ? payload.error.toString() : 'Microsoft profile lookup failed.');
    }

    return payload as MicrosoftUserProfile;
}

export function decodeJwtPayload(token: string): JsonRecord {
    const [, payload] = token.split('.');
    if (!payload) {
        return {};
    }

    const paddedPayload = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    const normalizedPayload = paddedPayload.replaceAll('-', '+').replaceAll('_', '/');

    try {
        return JSON.parse(atob(normalizedPayload)) as JsonRecord;
    } catch (error) {
        console.error('[microsoftGraph] Unable to decode JWT payload.', { error });
        return {};
    }
}

async function getEncryptionKey(): Promise<CryptoKey> {
    const rawSecret = getRequiredEnv('MICROSOFT_TOKEN_ENCRYPTION_KEY');
    let keyBytes: Uint8Array;

    try {
        keyBytes = Uint8Array.from(atob(rawSecret), (character) => character.charCodeAt(0));
    } catch (error) {
        void error;
        keyBytes = TEXT_ENCODER.encode(rawSecret);
    }

    const normalized = new Uint8Array(32);
    normalized.set(keyBytes.slice(0, 32));

    if (keyBytes.length < 32) {
        throw new Error('MICROSOFT_TOKEN_ENCRYPTION_KEY must be at least 32 bytes after decoding.');
    }

    return crypto.subtle.importKey('raw', normalized, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function encryptToken(token: string): Promise<string> {
    const key = await getEncryptionKey();
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, TEXT_ENCODER.encode(token));
    return `${base64UrlEncode(iv)}.${base64UrlEncode(ciphertext)}`;
}

export async function decryptToken(ciphertextValue: string): Promise<string> {
    const [ivText, ciphertextText] = ciphertextValue.split('.');
    if (!ivText || !ciphertextText) {
        throw new Error('Invalid encrypted token payload.');
    }

    const key = await getEncryptionKey();
    const iv = Uint8Array.from(atob(ivText.replaceAll('-', '+').replaceAll('_', '/')), (character) => character.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(ciphertextText.replaceAll('-', '+').replaceAll('_', '/')), (character) => character.charCodeAt(0));
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return TEXT_DECODER.decode(plaintext);
}

export function buildExpiresAt(expiresInSeconds: number): string {
    const safetyWindowMs = 60_000;
    return new Date(Date.now() + (expiresInSeconds * 1_000) - safetyWindowMs).toISOString();
}

export function isTokenExpiredSoon(expiresAt: string): boolean {
    const expiresAtMs = Date.parse(expiresAt);
    if (Number.isNaN(expiresAtMs)) {
        return true;
    }

    return expiresAtMs <= Date.now() + 120_000;
}

export async function graphRequest(accessToken: string, path: string): Promise<JsonRecord> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const response = await fetch(`${MICROSOFT_GRAPH_BASE_URL}${normalizedPath}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const payload = await response.json() as JsonRecord;
    if (!response.ok) {
        const message = typeof payload.error === 'object' && payload.error !== null && 'message' in payload.error
            ? String((payload.error as { message?: unknown }).message)
            : 'Microsoft Graph request failed.';
        throw new Error(message);
    }

    return payload;
}

// END: supabase/functions/_shared/microsoftGraph.ts
