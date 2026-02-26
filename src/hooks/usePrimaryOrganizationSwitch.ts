import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
import { rpcClient } from '@/lib/rpc.client';
import { logBackendError, toBackendErrorToastMessage } from '@/lib/backendErrors';

function isPrimaryOrgNotMemberError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const maybeError = error as { code?: string; message?: string | null };
    const message = (maybeError.message ?? '').toLowerCase();
    return maybeError.code === '42501' && message.includes('not a member of the selected organization');
}

export function usePrimaryOrganizationSwitch() {
    const { user, profile, loadProfile, setSelectedOrganizationId } = useAuthStore();
    const [isSwitching, setIsSwitching] = useState(false);
    const isSwitchingRef = useRef(false);

    const switchPrimaryOrganization = useCallback(async (organizationId: string): Promise<void> => {
        if (isSwitchingRef.current) {
            return;
        }

        if (profile?.organization_id && profile.organization_id === organizationId) {
            setSelectedOrganizationId(organizationId);
            return;
        }

        isSwitchingRef.current = true;
        setIsSwitching(true);
        try {
            const memberships = await rpcClient.get_my_member_organizations();

            const isMember = Array.isArray(memberships)
                && memberships.some((membership) => membership?.id === organizationId);

            if (!isMember) {
                throw new Error('You are no longer a member of that organization.');
            }

            await rpcClient.set_my_primary_organization({ p_organization_id: organizationId });
            setSelectedOrganizationId(organizationId);
            if (user?.id) {
                await loadProfile(user.id);
            }
            toast.success('Primary organization updated');
        } catch (error) {
            if (isPrimaryOrgNotMemberError(error)) {
                logBackendError({
                    module: 'PrimaryOrganizationSwitch',
                    operation: 'switch primary organization',
                    trigger: 'user',
                    error,
                    ids: {
                        organizationId,
                        userId: user?.id ?? null,
                    },
                });
                toast.error(toBackendErrorToastMessage({
                    module: 'PrimaryOrganizationSwitch',
                    operation: 'switch primary organization',
                    trigger: 'user',
                    error,
                    ids: {
                        organizationId,
                        userId: user?.id ?? null,
                    },
                }));
                throw error;
            }

            logBackendError({
                module: 'PrimaryOrganizationSwitch',
                operation: 'switch primary organization',
                trigger: 'user',
                error,
                ids: {
                    organizationId,
                    userId: user?.id ?? null,
                },
            });
            toast.error(toBackendErrorToastMessage({
                module: 'PrimaryOrganizationSwitch',
                operation: 'switch primary organization',
                trigger: 'user',
                error,
                ids: {
                    organizationId,
                    userId: user?.id ?? null,
                },
            }));
            throw error;
        } finally {
            isSwitchingRef.current = false;
            setIsSwitching(false);
        }
    }, [loadProfile, profile?.organization_id, setSelectedOrganizationId, user?.id]);

    return {
        isSwitching,
        switchPrimaryOrganization,
    };
}
