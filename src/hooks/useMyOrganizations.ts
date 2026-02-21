import { useEffect, useState } from 'react';
import { rpcClient } from '@/lib/rpc.client';

type OrgItem = {
    id: string;
    name: string;
    role: string | null;
};

const ORG_CACHE_TTL_MS = 30_000;
const orgCache = new Map<string, { items: OrgItem[]; fetchedAt: number }>();
const orgInFlight = new Map<string, Promise<OrgItem[]>>();

export function invalidateMyOrganizationsCache(profileId?: string | null): void {
    if (profileId) {
        orgCache.delete(profileId);
        orgInFlight.delete(profileId);
        return;
    }

    orgCache.clear();
    orgInFlight.clear();
}

function getCachedOrganizations(cacheKey: string): OrgItem[] | null {
    const cached = orgCache.get(cacheKey);
    if (!cached) return null;
    if (cached.items.length === 0) {
        orgCache.delete(cacheKey);
        return null;
    }
    if (Date.now() - cached.fetchedAt > ORG_CACHE_TTL_MS) {
        orgCache.delete(cacheKey);
        return null;
    }
    return cached.items;
}

async function fetchOrganizations(cacheKey: string): Promise<OrgItem[]> {
    const cached = getCachedOrganizations(cacheKey);
    if (cached) return cached;

    const inFlight = orgInFlight.get(cacheKey);
    if (inFlight) return inFlight;

    const request = (async () => {
        const memberships = await rpcClient.get_my_member_organizations();
        const items: OrgItem[] = Array.isArray(memberships)
            ? memberships
                .map((item) => ({
                    id: item.id,
                    name: item.name,
                    role: item.role ?? null,
                }))
                .filter((item) => item.id !== '' && item.name !== '')
            : [];

        orgCache.set(cacheKey, { items, fetchedAt: Date.now() });
        return items;
    })();

    orgInFlight.set(cacheKey, request);
    try {
        return await request;
    } finally {
        orgInFlight.delete(cacheKey);
    }
}

export function useMyOrganizations(profileId?: string | null) {
    const [orgs, setOrgs] = useState<OrgItem[]>([]);
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

                const cached = getCachedOrganizations(profileId);
                if (cached) {
                    if (mounted) setOrgs(cached);
                    return;
                }

                const items = await fetchOrganizations(profileId);

                if (mounted) setOrgs(items);
            } catch (err) {
                if (mounted) setError(err instanceof Error ? err.message : String(err));
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void load();
        return () => { mounted = false; };
    }, [profileId]);

    return { orgs, loading, error };
}
