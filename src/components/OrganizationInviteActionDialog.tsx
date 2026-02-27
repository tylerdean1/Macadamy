import { useState } from 'react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { orgInviteRespondSelf } from '@/lib/inviteRpc';
import { usePrimaryOrganizationSwitch } from '@/hooks/usePrimaryOrganizationSwitch';

export interface OrganizationInviteActionContext {
    inviteId: string;
    organizationId: string | null;
    organizationName: string;
    requestedRole: string | null;
    requestedJobTitleName: string | null;
    messageNote: string | null;
}

interface OrganizationInviteActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invite: OrganizationInviteActionContext | null;
    onCompleted?: () => Promise<void> | void;
}

export function OrganizationInviteActionDialog({
    open,
    onOpenChange,
    invite,
    onCompleted,
}: OrganizationInviteActionDialogProps): JSX.Element {
    const [busy, setBusy] = useState(false);
    const [denyReason, setDenyReason] = useState('');
    const { switchPrimaryOrganization } = usePrimaryOrganizationSwitch();

    const handleAccept = async (): Promise<void> => {
        if (!invite) {
            return;
        }

        setBusy(true);
        try {
            await orgInviteRespondSelf({
                p_invite_id: invite.inviteId,
                p_decision: 'accepted',
            });

            if (invite.organizationId) {
                await switchPrimaryOrganization(invite.organizationId);
            }

            toast.success('Invite accepted.');
            setDenyReason('');
            onOpenChange(false);
            await onCompleted?.();
        } catch (error) {
            console.error('[OrganizationInviteActionDialog] accept invite', error);
            toast.error('Unable to accept invite.');
        } finally {
            setBusy(false);
        }
    };

    const handleDecline = async (): Promise<void> => {
        if (!invite) {
            return;
        }

        const reason = denyReason.trim();
        if (!reason) {
            toast.error('Please provide a reason for denying this invite.');
            return;
        }

        setBusy(true);
        try {
            await orgInviteRespondSelf({
                p_invite_id: invite.inviteId,
                p_decision: 'declined',
                p_deny_reason: reason,
            });

            toast.success('Invite declined.');
            setDenyReason('');
            onOpenChange(false);
            await onCompleted?.();
        } catch (error) {
            console.error('[OrganizationInviteActionDialog] decline invite', error);
            toast.error('Unable to decline invite.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Organization invite</DialogTitle>
                    <DialogDescription>
                        {invite
                            ? `${invite.organizationName} invited you to join their organization.`
                            : 'Review your organization invite.'}
                    </DialogDescription>
                </DialogHeader>

                {invite && (
                    <div className="space-y-2 text-sm text-gray-300">
                        <p>Role: {invite.requestedRole ?? 'Unspecified'}</p>
                        <p>Job title: {invite.requestedJobTitleName ?? 'Unspecified'}</p>
                        {invite.messageNote && <p>Message: {invite.messageNote}</p>}
                    </div>
                )}

                <div className="space-y-2 mt-2">
                    <label htmlFor="invite-deny-reason" className="text-sm text-gray-300">Deny reason (required to decline)</label>
                    <textarea
                        id="invite-deny-reason"
                        className="w-full rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white"
                        rows={4}
                        value={denyReason}
                        onChange={(event) => setDenyReason(event.target.value)}
                        placeholder="Enter reason if declining"
                        disabled={busy}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={busy}>
                        Close
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { void handleDecline(); }} disabled={busy}>
                        {busy ? 'Working…' : 'Deny'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { void handleAccept(); }} disabled={busy}>
                        {busy ? 'Working…' : 'Accept'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
