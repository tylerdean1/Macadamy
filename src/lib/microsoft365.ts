// START: src/lib/microsoft365.ts

import { supabase } from '@/lib/supabase';

export type MicrosoftConnectedFeature = 'sharepoint' | 'outlook' | 'teams';

export type MicrosoftConnectionStatus = 'connected' | 'revoked' | 'error';

export interface MicrosoftConnectionSummary {
    id: string;
    microsoft_tenant_id: string;
    microsoft_user_id: string;
    display_name: string | null;
    email: string | null;
    granted_scopes: string[];
    connected_features: MicrosoftConnectedFeature[];
    expires_at: string;
    status: MicrosoftConnectionStatus;
    last_error: string | null;
    last_connected_at: string;
    created_at: string;
    updated_at: string;
}

export interface MicrosoftConnectionStatusResponse {
    connections: MicrosoftConnectionSummary[];
}

export interface StartMicrosoftOAuthResponse {
    authorizationUrl: string;
}

export type MicrosoftGraphResource = 'me' | 'sharepointSites' | 'outlookMessages' | 'teams' | 'joinedTeams';

export interface MicrosoftGraphProxyArgs {
    connectionId?: string;
    resource: MicrosoftGraphResource;
    query?: string;
}

export interface MicrosoftGraphProxyResponse {
    data: Record<string, unknown>;
}

function assertFunctionData<TPayload>(data: TPayload | null, functionName: string): TPayload {
    if (!data) {
        throw new Error(`${functionName} returned no data.`);
    }

    return data;
}

export async function startMicrosoft365Connection(redirectAfterConnect = '/settings/integrations'): Promise<void> {
    const { data, error } = await supabase.functions.invoke<StartMicrosoftOAuthResponse>('microsoft-oauth-start', {
        body: {
            redirectAfterConnect,
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    const response = assertFunctionData(data, 'microsoft-oauth-start');
    if (!response.authorizationUrl) {
        throw new Error('Microsoft OAuth start did not return an authorization URL.');
    }

    window.location.href = response.authorizationUrl;
}

export async function getMicrosoft365ConnectionStatus(): Promise<MicrosoftConnectionSummary[]> {
    const { data, error } = await supabase.functions.invoke<MicrosoftConnectionStatusResponse>('microsoft-connection-status', {
        body: {},
    });

    if (error) {
        throw new Error(error.message);
    }

    const response = assertFunctionData(data, 'microsoft-connection-status');
    return response.connections;
}

export async function microsoftGraphProxy(args: MicrosoftGraphProxyArgs): Promise<Record<string, unknown>> {
    const { data, error } = await supabase.functions.invoke<MicrosoftGraphProxyResponse>('microsoft-graph-proxy', {
        body: {
            connectionId: args.connectionId ?? null,
            resource: args.resource,
            query: args.query ?? null,
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    const response = assertFunctionData(data, 'microsoft-graph-proxy');
    return response.data;
}

export function getFeatureStatus(
    connections: MicrosoftConnectionSummary[],
    feature: MicrosoftConnectedFeature,
): 'connected' | 'not_connected' | 'error' {
    const matchingConnection = connections.find((connection) => connection.connected_features.includes(feature));

    if (!matchingConnection) {
        return 'not_connected';
    }

    if (matchingConnection.status === 'error') {
        return 'error';
    }

    return 'connected';
}

// END: src/lib/microsoft365.ts
