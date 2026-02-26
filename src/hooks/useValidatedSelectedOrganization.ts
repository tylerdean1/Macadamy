import { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/lib/store';

export type SelectedOrganizationValidation = {
    validatedSelectedOrganizationId: string | null;
    validatedActiveMembership: boolean;
    shouldClearSelection: boolean;
};

export function resolveSelectedOrganizationValidation(
    selectedOrganizationId: string | null,
    activeOrgIds: ReadonlySet<string>
): SelectedOrganizationValidation {
    const hasSelectedOrganization = selectedOrganizationId !== null;
    const hasValidatedMembership =
        hasSelectedOrganization && selectedOrganizationId !== null
            ? activeOrgIds.has(selectedOrganizationId)
            : false;

    return {
        validatedSelectedOrganizationId: hasValidatedMembership ? selectedOrganizationId : null,
        validatedActiveMembership: hasValidatedMembership,
        shouldClearSelection: hasSelectedOrganization && !hasValidatedMembership,
    };
}

export function useValidatedSelectedOrganization(activeOrgIdsInput: ReadonlyArray<string>) {
    const { selectedOrganizationId, setSelectedOrganizationId } = useAuthStore();

    const activeOrgIds = useMemo(() => {
        const ids = new Set<string>();
        for (const orgId of activeOrgIdsInput) {
            if (typeof orgId === 'string' && orgId.trim() !== '') {
                ids.add(orgId);
            }
        }
        return ids;
    }, [activeOrgIdsInput]);

    const validation = useMemo(
        () => resolveSelectedOrganizationValidation(selectedOrganizationId, activeOrgIds),
        [selectedOrganizationId, activeOrgIds]
    );

    useEffect(() => {
        if (validation.shouldClearSelection) {
            setSelectedOrganizationId(null);
        }
    }, [validation.shouldClearSelection, setSelectedOrganizationId]);

    return {
        activeOrgIds,
        ...validation,
    };
}
