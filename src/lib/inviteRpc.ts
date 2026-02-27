import type { Database } from '@/lib/database.types';
import { rpcClient } from '@/lib/rpc.client';
import { supabase } from '@/lib/supabase';

export type OrgRoleType = Database['public']['Enums']['org_role'];

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
export type InviteDisplayStatus = InviteStatus | 'expired';

export interface OrganizationEmailInviteRow {
    id: string;
    organization_id: string;
    invitee_email: string;
    invited_by_profile_id: string;
    status: InviteStatus;
    display_status: InviteDisplayStatus;
    requested_permission_role: OrgRoleType | null;
    requested_job_title_id: string | null;
    requested_job_title_name: string | null;
    message_note: string | null;
    deny_reason: string | null;
    expires_at: string;
    created_at: string;
    updated_at: string;
    responded_at: string | null;
    cancelled_at: string | null;
    invited_by_name: string | null;
    claimed_profile_id: string | null;
}

export interface SendOrganizationInviteEmailArgs {
    email: string;
    organizationId: string;
    organizationName: string;
    inviteId: string;
    requestedRole: string;
    requestedJobTitleName?: string;
    messageNote?: string;
    invitedByName?: string;
}

export interface InviteSendArgs {
    p_organization_id: string;
    p_email: string;
    p_requested_permission_role: OrgRoleType;
    p_requested_job_title_id?: string;
    p_message_note?: string;
}

export interface InviteListForOrgArgs {
    p_organization_id: string;
    p_include_resolved_within_days?: number;
}

export interface InviteResendArgs {
    p_invite_id: string;
}

export interface InviteCancelArgs {
    p_invite_id: string;
}

export interface InviteRespondSelfArgs {
    p_invite_id: string;
    p_decision: 'accepted' | 'declined';
    p_deny_reason?: string;
}

type InviteMutationRow = Database['public']['Functions']['org_invite_send_by_email']['Returns'][number];
type InviteListRow = Database['public']['Functions']['org_invite_list_for_org']['Returns'][number];
type InviteCurrentUserListRow = Database['public']['Functions']['org_invite_list_for_current_user']['Returns'][number];

function asNullableString(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }
    return value;
}

function mapMutationRow(row: InviteMutationRow): OrganizationEmailInviteRow {
    return {
        id: row.id,
        organization_id: row.organization_id,
        invitee_email: row.invitee_email,
        invited_by_profile_id: row.invited_by_profile_id,
        status: row.status as InviteStatus,
        display_status: row.status as InviteDisplayStatus,
        requested_permission_role: row.requested_permission_role,
        requested_job_title_id: asNullableString(row.requested_job_title_id),
        requested_job_title_name: null,
        message_note: asNullableString(row.message_note),
        deny_reason: asNullableString(row.deny_reason),
        expires_at: row.expires_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        responded_at: asNullableString(row.responded_at),
        cancelled_at: asNullableString(row.cancelled_at),
        invited_by_name: null,
        claimed_profile_id: asNullableString(row.claimed_profile_id),
    };
}

function mapListRow(row: InviteListRow | InviteCurrentUserListRow): OrganizationEmailInviteRow {
    return {
        id: row.id,
        organization_id: row.organization_id,
        invitee_email: row.invitee_email,
        invited_by_profile_id: row.invited_by_profile_id,
        status: row.status as InviteStatus,
        display_status: row.display_status as InviteDisplayStatus,
        requested_permission_role: row.requested_permission_role,
        requested_job_title_id: asNullableString(row.requested_job_title_id),
        requested_job_title_name: asNullableString(row.requested_job_title_name),
        message_note: asNullableString(row.message_note),
        deny_reason: asNullableString(row.deny_reason),
        expires_at: row.expires_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        responded_at: asNullableString(row.responded_at),
        cancelled_at: asNullableString(row.cancelled_at),
        invited_by_name: asNullableString(row.invited_by_name),
        claimed_profile_id: null,
    };
}

export async function sendOrganizationInviteEmail(args: SendOrganizationInviteEmailArgs): Promise<void> {
    const { error } = await supabase.functions.invoke('send-org-invite-email', {
        body: {
            email: args.email,
            organizationId: args.organizationId,
            organizationName: args.organizationName,
            inviteId: args.inviteId,
            requestedRole: args.requestedRole,
            requestedJobTitleName: args.requestedJobTitleName ?? null,
            messageNote: args.messageNote ?? null,
            invitedByName: args.invitedByName ?? null,
        },
    });

    if (error) {
        console.error('[inviteRpc] send-org-invite-email', {
            error,
            organizationId: args.organizationId,
            inviteId: args.inviteId,
            email: args.email,
        });
        throw error;
    }
}

export async function orgInviteSendByEmail(args: InviteSendArgs): Promise<OrganizationEmailInviteRow> {
    const rows = await rpcClient.org_invite_send_by_email(args);
    const row = rows[0];
    if (!row) {
        throw new Error('org_invite_send_by_email returned no invite row.');
    }
    return mapMutationRow(row);
}

export async function orgInviteListForOrg(args: InviteListForOrgArgs): Promise<OrganizationEmailInviteRow[]> {
    const rows = await rpcClient.org_invite_list_for_org(args);
    return Array.isArray(rows) ? rows.map(mapListRow) : [];
}

export async function orgInviteResend(args: InviteResendArgs): Promise<OrganizationEmailInviteRow> {
    const rows = await rpcClient.org_invite_resend(args);
    const row = rows[0];
    if (!row) {
        throw new Error('org_invite_resend returned no invite row.');
    }
    return mapMutationRow(row);
}

export async function orgInviteCancel(args: InviteCancelArgs): Promise<OrganizationEmailInviteRow> {
    const rows = await rpcClient.org_invite_cancel(args);
    const row = rows[0];
    if (!row) {
        throw new Error('org_invite_cancel returned no invite row.');
    }
    return mapMutationRow(row);
}

export async function orgInviteListForCurrentUser(): Promise<OrganizationEmailInviteRow[]> {
    const rows = await rpcClient.org_invite_list_for_current_user();
    return Array.isArray(rows) ? rows.map(mapListRow) : [];
}

export async function orgInviteRespondSelf(args: InviteRespondSelfArgs): Promise<OrganizationEmailInviteRow> {
    const rows = await rpcClient.org_invite_respond_self(args);
    const row = rows[0];
    if (!row) {
        throw new Error('org_invite_respond_self returned no invite row.');
    }
    return mapMutationRow(row);
}
