import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

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

    const switchPrimaryOrganization = useCallback(async (organizationId: string): Promise<boolean> => {
        if (isSwitchingRef.current) return false;

        if (profile?.organization_id && profile.organization_id === organizationId) {
            setSelectedOrganizationId(organizationId);
            return true;
        }

        isSwitchingRef.current = true;
        setIsSwitching(true);
        try {
            const { data: memberships, error: membershipsError } = await supabase.rpc('get_my_member_organizations');
            if (membershipsError) {
                throw membershipsError;
            }

            const isMember = Array.isArray(memberships)
                && memberships.some((membership) => membership?.id === organizationId);

            if (!isMember) {
                toast.error('You are no longer a member of that organization.');
                return false;
            }

            const { error } = await supabase.rpc('set_my_primary_organization', { p_organization_id: organizationId });
            if (error) {
                throw error;
            }
            setSelectedOrganizationId(organizationId);
            if (user?.id) {
                await loadProfile(user.id);
            }
            toast.success('Primary organization updated');
            return true;
        } catch (error) {
            if (isPrimaryOrgNotMemberError(error)) {
                toast.error('You are no longer a member of that organization.');
                return false;
            }
            console.error('Error switching primary organization:', error);
            toast.error('Unable to update primary organization');
            return false;
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
