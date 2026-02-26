import { useEffect, useState } from 'react';
import { logBackendError } from '@/lib/backendErrors';
import { rpcClient } from '@/lib/rpc.client';

export type InactiveOrganizationItem = {
    organizationId: string;
    organizationName: string;
    membershipDeletedAt: string;
    roleLastKnown: string | null;
};

const INACTIVE_ORG_CACHE_TTL_MS = 30_000;
const inactiveOrgCache = new Map<string, { items: InactiveOrganizationItem[]; fetchedAt: number }>();
const inactiveOrgInFlight = new Map<string, Promise<InactiveOrganizationItem[]>>();

export function invalidateMyInactiveOrganizationsCache(profileId?: string | null): void {
    if (profileId) {
        inactiveOrgCache.delete(profileId);
        inactiveOrgInFlight.delete(profileId);
        return;
    }

    inactiveOrgCache.clear();
    inactiveOrgInFlight.clear();
}

function getCachedInactiveOrganizations(cacheKey: string): InactiveOrganizationItem[] | null {
    const cached = inactiveOrgCache.get(cacheKey);
    if (!cached) return null;
    if (Date.now() - cached.fetchedAt > INACTIVE_ORG_CACHE_TTL_MS) {
        inactiveOrgCache.delete(cacheKey);
        return null;
    }
    return cached.items;
}

async function fetchInactiveOrganizations(cacheKey: string): Promise<InactiveOrganizationItem[]> {
    const cached = getCachedInactiveOrganizations(cacheKey);
    if (cached) return cached;

    const inFlight = inactiveOrgInFlight.get(cacheKey);
    if (inFlight) return inFlight;

    const request = (async () => {
        const rows = await rpcClient.get_my_inactive_member_organizations();
        const items: InactiveOrganizationItem[] = Array.isArray(rows)
            ? rows
                .filter((row): row is Record<string, unknown> => row != null && typeof row === 'object')
                .map((row) => ({
                    organizationId: typeof row.organization_id === 'string' ? row.organization_id : '',
                    organizationName: typeof row.organization_name === 'string' ? row.organization_name : '',
                    membershipDeletedAt: typeof row.membership_deleted_at === 'string' ? row.membership_deleted_at : '',
                    roleLastKnown: typeof row.role_last_known === 'string' ? row.role_last_known : null,
                }))
                .filter((item) => item.organizationId !== '' && item.organizationName !== '' && item.membershipDeletedAt !== '')
            : [];

        inactiveOrgCache.set(cacheKey, { items, fetchedAt: Date.now() });
        return items;
    })();

    inactiveOrgInFlight.set(cacheKey, request);
    try {
        return await request;
    } finally {
        inactiveOrgInFlight.delete(cacheKey);
    }
}

export function useMyInactiveOrganizations(profileId?: string | null) {
    const [orgs, setOrgs] = useState<InactiveOrganizationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setError(null);
            setLoading(true);
            try {
                if (!profileId) {
                    if (mounted) setOrgs([]);
                    return;
                }

                const cached = getCachedInactiveOrganizations(profileId);
                if (cached) {
                    if (mounted) setOrgs(cached);
                    return;
                }

                const items = await fetchInactiveOrganizations(profileId);
                if (mounted) setOrgs(items);
            } catch (err) {
                logBackendError({
                    module: 'useMyInactiveOrganizations',
                    operation: 'load inactive member organizations',
                    trigger: 'background',
                    error: err,
                    ids: {
                        profileId: profileId ?? null,
                    },
                });
                if (mounted) {
                    setError(err instanceof Error ? err.message : String(err));
                    setOrgs([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void load();
        return () => { mounted = false; };
    }, [profileId]);

    return { orgs, loading, error };
}
