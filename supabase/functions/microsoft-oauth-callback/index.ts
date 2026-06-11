// START: supabase/functions/microsoft-oauth-callback/index.ts
// @ts-nocheck
// Note:
// - Supabase Edge Functions run on Deno in Supabase's runtime.
// - This completes Microsoft Graph OAuth and stores encrypted delegated tokens server-side.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
    buildExpiresAt,
    decodeJwtPayload,
    encryptToken,
    exchangeCodeForTokens,
    fetchMicrosoftProfile,
    inferConnectedFeatures,
    parseGrantedScopes,
    sha256Base64Url,
    getRequiredEnv,
} from '../_shared/microsoftGraph.ts';

type OAuthStateRow = {
    state_hash: string;
    user_id: string;
    code_verifier: string;
    requested_scopes: string[];
    redirect_after_connect: string | null;
    expires_at: string;
};

function redirectResponse(location: string): Response {
    return new Response(null, {
        status: 302,
        headers: {
            Location: location,
        },
    });
}

function getSiteUrl(): string {
    return (Deno.env.get('SITE_URL') ?? Deno.env.get('PUBLIC_SITE_URL') ?? 'https://www.macadamy.io').replace(/\/$/, '');
}

function buildAppRedirect(path: string, params: Record<string, string>): string {
    const siteUrl = getSiteUrl();
    const url = new URL(path.startsWith('/') ? `${siteUrl}${path}` : `${siteUrl}/${path}`);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }
    return url.toString();
}

Deno.serve(async (request: Request) => {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const state = requestUrl.searchParams.get('state');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    const fallbackPath = '/settings/integrations';

    try {
        if (error) {
            return redirectResponse(buildAppRedirect(fallbackPath, {
                microsoft: 'error',
                reason: errorDescription ?? error,
            }));
        }

        if (!code || !state) {
            return redirectResponse(buildAppRedirect(fallbackPath, {
                microsoft: 'error',
                reason: 'missing_code_or_state',
            }));
        }

        const supabaseUrl = getRequiredEnv('SUPABASE_URL');
        const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
        const microsoftRedirectUri = getRequiredEnv('MICROSOFT_REDIRECT_URI');
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        const stateHash = await sha256Base64Url(state);
        const { data: stateRowRaw, error: stateLookupError } = await adminClient
            .from('microsoft_oauth_states')
            .select('state_hash,user_id,code_verifier,requested_scopes,redirect_after_connect,expires_at')
            .eq('state_hash', stateHash)
            .maybeSingle();

        if (stateLookupError || !stateRowRaw) {
            console.error('[microsoft-oauth-callback] OAuth state not found.', { stateLookupError });
            return redirectResponse(buildAppRedirect(fallbackPath, {
                microsoft: 'error',
                reason: 'invalid_state',
            }));
        }

        const stateRow = stateRowRaw as OAuthStateRow;
        const redirectPath = stateRow.redirect_after_connect ?? fallbackPath;

        if (Date.parse(stateRow.expires_at) <= Date.now()) {
            await adminClient.from('microsoft_oauth_states').delete().eq('state_hash', stateHash);
            return redirectResponse(buildAppRedirect(redirectPath, {
                microsoft: 'error',
                reason: 'expired_state',
            }));
        }

        const tokenResponse = await exchangeCodeForTokens({
            code,
            codeVerifier: stateRow.code_verifier,
            redirectUri: microsoftRedirectUri,
        });

        if (!tokenResponse.refresh_token) {
            return redirectResponse(buildAppRedirect(redirectPath, {
                microsoft: 'error',
                reason: 'missing_refresh_token',
            }));
        }

        const profile = await fetchMicrosoftProfile(tokenResponse.access_token);
        const jwtPayload = tokenResponse.id_token ? decodeJwtPayload(tokenResponse.id_token) : {};
        const tenantId = typeof jwtPayload.tid === 'string' ? jwtPayload.tid : 'unknown';
        const grantedScopes = parseGrantedScopes(tokenResponse.scope);
        const connectedFeatures = inferConnectedFeatures(grantedScopes.length > 0 ? grantedScopes : stateRow.requested_scopes);
        const email = profile.mail ?? profile.userPrincipalName ?? null;
        const accessTokenCiphertext = await encryptToken(tokenResponse.access_token);
        const refreshTokenCiphertext = await encryptToken(tokenResponse.refresh_token);
        const expiresAt = buildExpiresAt(tokenResponse.expires_in);

        const { error: upsertError } = await adminClient
            .from('microsoft_connections')
            .upsert(
                {
                    user_id: stateRow.user_id,
                    microsoft_tenant_id: tenantId,
                    microsoft_user_id: profile.id,
                    display_name: profile.displayName ?? null,
                    email,
                    access_token_ciphertext: accessTokenCiphertext,
                    refresh_token_ciphertext: refreshTokenCiphertext,
                    token_type: tokenResponse.token_type,
                    granted_scopes: grantedScopes,
                    connected_features: connectedFeatures,
                    expires_at: expiresAt,
                    status: 'connected',
                    last_error: null,
                    last_connected_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: 'user_id,microsoft_tenant_id,microsoft_user_id',
                },
            );

        await adminClient.from('microsoft_oauth_states').delete().eq('state_hash', stateHash);

        if (upsertError) {
            console.error('[microsoft-oauth-callback] Failed to store Microsoft connection.', {
                upsertError,
                userId: stateRow.user_id,
            });
            return redirectResponse(buildAppRedirect(redirectPath, {
                microsoft: 'error',
                reason: 'store_failed',
            }));
        }

        return redirectResponse(buildAppRedirect(redirectPath, {
            microsoft: 'connected',
        }));
    } catch (caughtError) {
        console.error('[microsoft-oauth-callback] Unhandled error.', { caughtError });
        const reason = caughtError instanceof Error ? caughtError.message : 'unhandled_error';
        return redirectResponse(buildAppRedirect(fallbackPath, {
            microsoft: 'error',
            reason,
        }));
    }
});

// END: supabase/functions/microsoft-oauth-callback/index.ts
