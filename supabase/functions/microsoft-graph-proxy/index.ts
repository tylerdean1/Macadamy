// START: supabase/functions/microsoft-graph-proxy/index.ts
// @ts-nocheck
// Note:
// - Supabase Edge Functions run on Deno in Supabase's runtime.
// - This is a narrow allowlisted Microsoft Graph proxy. Do not turn this into a raw open proxy.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
    buildExpiresAt,
    corsResponse,
    decryptToken,
    encryptToken,
    getBearerToken,
    getRequiredEnv,
    graphRequest,
    isTokenExpiredSoon,
    jsonResponse,
    parseGrantedScopes,
    refreshMicrosoftTokens,
    type StoredMicrosoftConnection,
} from '../_shared/microsoftGraph.ts';

type MicrosoftGraphProxyRequest = {
    connectionId?: string | null;
    resource: 'me' | 'sharepointSites' | 'outlookMessages' | 'teams' | 'joinedTeams';
    query?: string | null;
};

function sanitizeSearchQuery(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return null;
    }

    return trimmed.slice(0, 120).replaceAll("'", "''");
}

function buildGraphPath(payload: MicrosoftGraphProxyRequest): string {
    switch (payload.resource) {
        case 'me':
            return '/me?$select=id,displayName,mail,userPrincipalName';
        case 'sharepointSites': {
            const query = sanitizeSearchQuery(payload.query);
            if (query) {
                return `/sites?search=${encodeURIComponent(query)}&$top=10`;
            }
            return '/sites?search=*&$top=10';
        }
        case 'outlookMessages':
            return '/me/messages?$top=10&$select=id,subject,from,receivedDateTime,webLink&$orderby=receivedDateTime desc';
        case 'joinedTeams':
        case 'teams':
            return '/me/joinedTeams?$select=id,displayName,description&$top=20';
        default:
            throw new Error('Unsupported Microsoft Graph resource.');
    }
}

async function getActiveConnection(args: {
    adminClient: ReturnType<typeof createClient>;
    userId: string;
    connectionId: string | null | undefined;
}): Promise<StoredMicrosoftConnection | null> {
    let query = args.adminClient
        .from('microsoft_connections')
        .select('id,user_id,microsoft_tenant_id,microsoft_user_id,access_token_ciphertext,refresh_token_ciphertext,expires_at,granted_scopes,connected_features,status')
        .eq('user_id', args.userId)
        .eq('status', 'connected')
        .order('last_connected_at', { ascending: false })
        .limit(1);

    if (args.connectionId) {
        query = query.eq('id', args.connectionId);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
        throw new Error(error.message);
    }

    return data as StoredMicrosoftConnection | null;
}

async function getUsableAccessToken(args: {
    adminClient: ReturnType<typeof createClient>;
    connection: StoredMicrosoftConnection;
}): Promise<string> {
    if (!isTokenExpiredSoon(args.connection.expires_at)) {
        return decryptToken(args.connection.access_token_ciphertext);
    }

    const refreshToken = await decryptToken(args.connection.refresh_token_ciphertext);
    const refreshedTokens = await refreshMicrosoftTokens(refreshToken);
    const nextRefreshToken = refreshedTokens.refresh_token ?? refreshToken;
    const grantedScopes = parseGrantedScopes(refreshedTokens.scope);

    const accessTokenCiphertext = await encryptToken(refreshedTokens.access_token);
    const refreshTokenCiphertext = await encryptToken(nextRefreshToken);
    const expiresAt = buildExpiresAt(refreshedTokens.expires_in);

    const { error } = await args.adminClient
        .from('microsoft_connections')
        .update({
            access_token_ciphertext: accessTokenCiphertext,
            refresh_token_ciphertext: refreshTokenCiphertext,
            granted_scopes: grantedScopes.length > 0 ? grantedScopes : args.connection.granted_scopes,
            expires_at: expiresAt,
            updated_at: new Date().toISOString(),
            last_error: null,
            status: 'connected',
        })
        .eq('id', args.connection.id)
        .eq('user_id', args.connection.user_id);

    if (error) {
        throw new Error(error.message);
    }

    return refreshedTokens.access_token;
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
            console.error('[microsoft-graph-proxy] Unable to authenticate caller.', { userError });
            return jsonResponse(401, { error: 'Unauthorized' }, origin);
        }

        const payload = await request.json() as MicrosoftGraphProxyRequest;
        if (!payload.resource) {
            return jsonResponse(400, { error: 'resource is required.' }, origin);
        }

        const connection = await getActiveConnection({
            adminClient,
            userId: user.id,
            connectionId: payload.connectionId ?? null,
        });

        if (!connection) {
            return jsonResponse(404, { error: 'No connected Microsoft 365 account found.' }, origin);
        }

        const graphPath = buildGraphPath(payload);
        const accessToken = await getUsableAccessToken({ adminClient, connection });
        const graphPayload = await graphRequest(accessToken, graphPath);

        return jsonResponse(200, { data: graphPayload }, origin);
    } catch (error) {
        console.error('[microsoft-graph-proxy] Unhandled error.', { error });
        const detail = error instanceof Error ? error.message : String(error);
        return jsonResponse(500, { error: 'Unhandled server error', detail }, origin);
    }
});

// END: supabase/functions/microsoft-graph-proxy/index.ts
