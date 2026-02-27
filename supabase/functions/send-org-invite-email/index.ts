// @ts-nocheck
// Note:
// - Supabase Edge Functions run on Deno in Supabase's runtime.
// - This file intentionally uses Deno APIs (for example, `Deno.serve` and `Deno.env`).
// - You do NOT need Deno installed for normal frontend app development in this repo.
// - You only need Deno if you want to run edge functions locally outside Supabase.
// - `@ts-nocheck` avoids Node/TS editor diagnostics in this Deno-targeted file.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildCorsHeaders } from './cors.ts';

type InviteEmailRequest = {
    email: string;
    organizationId: string;
    organizationName: string;
    inviteId: string;
    requestedRole: string;
    requestedJobTitleName?: string | null;
    messageNote?: string | null;
    invitedByName?: string | null;
};

type InviteLookupRow = {
    id: string;
    organization_id: string;
    invited_by_profile_id: string;
    invitee_email: string;
    status: 'pending' | 'accepted' | 'declined' | 'cancelled';
    expires_at: string;
};

type InviteListForOrgRpcRow = {
    id: string;
    organization_id: string;
    invited_by_profile_id: string;
    invitee_email: string;
    status: 'pending' | 'accepted' | 'declined' | 'cancelled';
    expires_at: string;
};

function jsonResponse(
    status: number,
    body: Record<string, unknown>,
    origin: string | null,
): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...buildCorsHeaders(origin),
            'Content-Type': 'application/json',
        },
    });
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function getBearerToken(authHeader: string | null): string | null {
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

Deno.serve(async (request: Request) => {
    const origin = request.headers.get('origin');
    const corsHeaders = buildCorsHeaders(origin);
    try {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        if (request.method !== 'POST') {
            return jsonResponse(405, { error: 'Method not allowed' }, origin);
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const siteUrl = Deno.env.get('SITE_URL') ?? Deno.env.get('PUBLIC_SITE_URL') ?? null;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('[send-org-invite-email] Missing required Supabase environment variables.');
            return jsonResponse(500, { error: 'Server misconfigured' }, origin);
        }

        const token = getBearerToken(request.headers.get('Authorization'));
        if (!token) {
            return jsonResponse(401, { error: 'Missing authorization token' }, origin);
        }

        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        const projectApiKey = Deno.env.get('SUPABASE_ANON_KEY') ?? serviceRoleKey;
        const callerClient = createClient(supabaseUrl, projectApiKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
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
            console.error('[send-org-invite-email] Unable to authenticate caller.', { userError });
            return jsonResponse(401, { error: 'Unauthorized' }, origin);
        }

        let payload: InviteEmailRequest;
        try {
            payload = (await request.json()) as InviteEmailRequest;
        } catch (error) {
            console.error('[send-org-invite-email] Invalid JSON payload.', { error });
            return jsonResponse(400, { error: 'Invalid JSON payload' }, origin);
        }

        const email = normalizeEmail(payload.email ?? '');
        const organizationId = payload.organizationId?.trim() ?? '';
        const organizationName = payload.organizationName?.trim() ?? '';
        const inviteId = payload.inviteId?.trim() ?? '';
        const requestedRole = payload.requestedRole?.trim() ?? '';

        if (!email || !email.includes('@')) {
            return jsonResponse(400, { error: 'Valid email is required' }, origin);
        }

        if (!organizationId || !inviteId || !requestedRole || !organizationName) {
            return jsonResponse(400, { error: 'Missing required invite fields' }, origin);
        }

        const { data: inviteRowsRaw, error: inviteLookupError } = await callerClient.rpc('org_invite_list_for_org', {
            p_organization_id: organizationId,
        });

        if (inviteLookupError) {
            console.error('[send-org-invite-email] Failed invite lookup.', {
                inviteLookupError,
                organizationId,
                inviteId,
                email,
                callerId: user.id,
            });
            return jsonResponse(500, { error: 'Invite lookup failed', detail: inviteLookupError.message }, origin);
        }

        const inviteRows = Array.isArray(inviteRowsRaw)
            ? (inviteRowsRaw as InviteListForOrgRpcRow[])
            : [];
        const inviteLookup =
            inviteRows.find((row) => row.id === inviteId) as InviteLookupRow | undefined;
        if (!inviteLookup) {
            return jsonResponse(404, { error: 'Invite not found' }, origin);
        }

        if (inviteLookup.organization_id !== organizationId) {
            return jsonResponse(400, { error: 'Invite organization mismatch' }, origin);
        }

        if (inviteLookup.invited_by_profile_id !== user.id) {
            return jsonResponse(403, { error: 'Forbidden' }, origin);
        }

        if (normalizeEmail(inviteLookup.invitee_email) !== email) {
            return jsonResponse(400, { error: 'Invite email mismatch' }, origin);
        }

        if (inviteLookup.status !== 'pending') {
            return jsonResponse(409, { error: 'Invite is not pending' }, origin);
        }

        const inviteExpiry = Date.parse(inviteLookup.expires_at);
        if (!Number.isNaN(inviteExpiry) && inviteExpiry <= Date.now()) {
            return jsonResponse(409, { error: 'Invite is expired' }, origin);
        }

        const inviteOptions: {
            redirectTo?: string;
            data: {
                organization_name: string;
                requested_role: string;
                requested_job_title_name: string;
                message_note: string;
                invited_by_name: string;
                invite_id: string;
                organization_id: string;
            };
        } = {
            data: {
                organization_name: organizationName,
                requested_role: requestedRole,
                requested_job_title_name: payload.requestedJobTitleName?.trim() ?? '',
                message_note: payload.messageNote?.trim() ?? '',
                invited_by_name: payload.invitedByName?.trim() ?? '',
                invite_id: inviteId,
                organization_id: organizationId,
            },
        };

        if (siteUrl) {
            inviteOptions.redirectTo = `${siteUrl.replace(/\/$/, '')}/login`;
        }

        const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, inviteOptions);

        if (inviteError) {
            const inviteErrorMessage = inviteError.message ?? 'Unknown invite error';
            const normalizedInviteErrorMessage = inviteErrorMessage.toLowerCase();
            console.error('[send-org-invite-email] inviteUserByEmail failed.', {
                inviteError,
                organizationId,
                inviteId,
                email,
            });

            if (
                normalizedInviteErrorMessage.includes('database error saving new user') ||
                normalizedInviteErrorMessage.includes('profiles_email_key')
            ) {
                return jsonResponse(
                    409,
                    {
                        error: 'Invite delivery blocked: a profile with this email already exists but cannot be linked automatically.',
                        detail: inviteErrorMessage,
                        code: 'profile_email_conflict',
                    },
                    origin,
                );
            }

            return jsonResponse(400, { error: inviteErrorMessage }, origin);
        }

        return jsonResponse(
            200,
            {
                success: true,
                organizationId,
                inviteId,
                email,
            },
            origin,
        );
    } catch (error) {
        console.error('[send-org-invite-email] Unhandled error.', { error });
        const detail = error instanceof Error ? error.message : String(error);
        return jsonResponse(500, { error: 'Unhandled server error', detail }, origin);
    }
});
