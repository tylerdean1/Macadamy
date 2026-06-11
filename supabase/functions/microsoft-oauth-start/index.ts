// START: supabase/functions/microsoft-oauth-start/index.ts
// @ts-nocheck
// Note:
// - Supabase Edge Functions run on Deno in Supabase's runtime.
// - This starts the Microsoft Graph OAuth authorization-code + PKCE flow.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
    MICROSOFT_GRAPH_SCOPES,
    corsResponse,
    createRandomBase64Url,
    getBearerToken,
    getMicrosoftAuthorizeUrl,
    getRequiredEnv,
    jsonResponse,
    sha256Base64Url,
} from '../_shared/microsoftGraph.ts';

type MicrosoftOAuthStartRequest = {
    redirectAfterConnect?: string | null;
    scopes?: string[] | null;
};

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function sanitizeRedirectAfterConnect(value: string | null | undefined): string {
    if (!value || !value.startsWith('/')) {
        return '/settings/integrations';
    }

    if (value.startsWith('//')) {
        return '/settings/integrations';
    }

    return value;
}

Deno.serve(async (request: Request) => {
    const origin = request.headers.get('origin');

    try {
        if (request.method === 'OPTIONS') {
            return corsResponse(origin);
        }

        if (request.method !== 'POST') {
            return jsonResponse(405, { error: 'Method not allowed' }, origin);
        }

        const token = getBearerToken(request.headers.get('Authorization'));
        if (!token) {
            return jsonResponse(401, { error: 'Missing authorization token' }, origin);
        }

        const supabaseUrl = getRequiredEnv('SUPABASE_URL');
        const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
        const microsoftClientId = getRequiredEnv('MICROSOFT_CLIENT_ID');
        const microsoftRedirectUri = getRequiredEnv('MICROSOFT_REDIRECT_URI');

        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        const {
            data: { user },
            error: userError,
        } = await adminClient.auth.getUser(token);

        if (userError || !user) {
            console.error('[microsoft-oauth-start] Unable to authenticate caller.', { userError });
            return jsonResponse(401, { error: 'Unauthorized' }, origin);
        }

        let payload: MicrosoftOAuthStartRequest = {};
        try {
            payload = await request.json() as MicrosoftOAuthStartRequest;
        } catch (error) {
            void error;
        }

        const requestedScopes = isStringArray(payload.scopes) && payload.scopes.length > 0
            ? payload.scopes
            : [...MICROSOFT_GRAPH_SCOPES];

        const codeVerifier = createRandomBase64Url(64);
        const codeChallenge = await sha256Base64Url(codeVerifier);
        const state = createRandomBase64Url(32);
        const stateHash = await sha256Base64Url(state);
        const redirectAfterConnect = sanitizeRedirectAfterConnect(payload.redirectAfterConnect ?? null);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1_000).toISOString();

        const { error: insertError } = await adminClient
            .from('microsoft_oauth_states')
            .insert({
                state_hash: stateHash,
                user_id: user.id,
                code_verifier: codeVerifier,
                requested_scopes: requestedScopes,
                redirect_after_connect: redirectAfterConnect,
                expires_at: expiresAt,
            });

        if (insertError) {
            console.error('[microsoft-oauth-start] Failed to store OAuth state.', { insertError, userId: user.id });
            return jsonResponse(500, { error: 'Failed to start Microsoft connection.' }, origin);
        }

        const authorizationUrl = new URL(getMicrosoftAuthorizeUrl());
        authorizationUrl.searchParams.set('client_id', microsoftClientId);
        authorizationUrl.searchParams.set('response_type', 'code');
        authorizationUrl.searchParams.set('redirect_uri', microsoftRedirectUri);
        authorizationUrl.searchParams.set('response_mode', 'query');
        authorizationUrl.searchParams.set('scope', requestedScopes.join(' '));
        authorizationUrl.searchParams.set('state', state);
        authorizationUrl.searchParams.set('code_challenge', codeChallenge);
        authorizationUrl.searchParams.set('code_challenge_method', 'S256');
        authorizationUrl.searchParams.set('prompt', 'select_account');

        return jsonResponse(200, { authorizationUrl: authorizationUrl.toString() }, origin);
    } catch (error) {
        console.error('[microsoft-oauth-start] Unhandled error.', { error });
        const detail = error instanceof Error ? error.message : String(error);
        return jsonResponse(500, { error: 'Unhandled server error', detail }, origin);
    }
});

// END: supabase/functions/microsoft-oauth-start/index.ts
