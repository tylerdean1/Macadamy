// START: supabase/functions/microsoft-connection-status/index.ts
// @ts-nocheck
// Note:
// - Supabase Edge Functions run on Deno in Supabase's runtime.
// - This returns safe Microsoft 365 connector metadata. It never returns tokens.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
    corsResponse,
    getBearerToken,
    getRequiredEnv,
    jsonResponse,
} from '../_shared/microsoftGraph.ts';

type MicrosoftConnectionRow = {
    id: string;
    microsoft_tenant_id: string;
    microsoft_user_id: string;
    display_name: string | null;
    email: string | null;
    granted_scopes: string[];
    connected_features: string[];
    expires_at: string;
    status: string;
    last_error: string | null;
    last_connected_at: string;
    created_at: string;
    updated_at: string;
};

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
            console.error('[microsoft-connection-status] Unable to authenticate caller.', { userError });
            return jsonResponse(401, { error: 'Unauthorized' }, origin);
        }

        const { data, error } = await adminClient
            .from('microsoft_connections')
            .select('id,microsoft_tenant_id,microsoft_user_id,display_name,email,granted_scopes,connected_features,expires_at,status,last_error,last_connected_at,created_at,updated_at')
            .eq('user_id', user.id)
            .order('last_connected_at', { ascending: false });

        if (error) {
            console.error('[microsoft-connection-status] Failed to read connections.', { error, userId: user.id });
            return jsonResponse(500, { error: 'Failed to read Microsoft connections.' }, origin);
        }

        const connections = Array.isArray(data) ? data as MicrosoftConnectionRow[] : [];

        return jsonResponse(200, { connections }, origin);
    } catch (error) {
        console.error('[microsoft-connection-status] Unhandled error.', { error });
        const detail = error instanceof Error ? error.message : String(error);
        return jsonResponse(500, { error: 'Unhandled server error', detail }, origin);
    }
});

// END: supabase/functions/microsoft-connection-status/index.ts
