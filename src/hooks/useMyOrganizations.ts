import { useEffect, useState } from 'react';
import { logBackendError } from '@/lib/backendErrors';
import { rpcClient } from '@/lib/rpc.client';

type OrgItem = {
    id: string;
    name: string;
    role: string | null;
    permissionRole: string | null;
    jobTitleLabel: string | null;
    roleLabel: string | null;
};

const ORG_CACHE_TTL_MS = 30_000;
const orgCache = new Map<string, { items: OrgItem[]; fetchedAt: number }>();
const orgInFlight = new Map<string, Promise<OrgItem[]>>();

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: string | null): value is string =>
    typeof value === 'string' && UUID_PATTERN.test(value);

const toTitleCaseLabel = (value: string): string =>
    value
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

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
        const jobTitles = await rpcClient.get_job_titles_public();
        const jobTitleById = new Map<string, string>(
            Array.isArray(jobTitles)
                ? jobTitles
                    .filter((row) => row.id && row.name)
                    .map((row) => [row.id, row.name])
                : []
        );

        const items: OrgItem[] = Array.isArray(memberships)
            ? memberships
                .map((item) => ({
                    id: item.id,
                    name: item.name,
                    role: item.role ?? null,
                    permissionRole: (() => {
                        const rawPermissionRole = (item as unknown as { permission_role?: string | null }).permission_role ?? null;
                        if (rawPermissionRole) {
                            return rawPermissionRole;
                        }

                        const rawRole = item.role ?? null;
                        if (rawRole && !isUuid(rawRole)) {
                            return rawRole;
                        }

                        return null;
                    })(),
                    jobTitleLabel: (() => {
                        const explicitJobTitleName = (item as unknown as { job_title_name?: string | null }).job_title_name ?? null;
                        if (explicitJobTitleName) return explicitJobTitleName;

                        const jobTitleId = (item as unknown as { job_title_id?: string | null }).job_title_id ?? null;
                        if (jobTitleId && isUuid(jobTitleId)) {
                            return jobTitleById.get(jobTitleId) ?? jobTitleId;
                        }

                        const rawRole = item.role ?? null;
                        if (isUuid(rawRole)) {
                            return jobTitleById.get(rawRole) ?? rawRole;
                        }

                        return null;
                    })(),
                    roleLabel: (() => {
                        const explicitRoleName = (item as unknown as { role_name?: string | null }).role_name ?? null;
                        const rawPermissionRole = (item as unknown as { permission_role?: string | null }).permission_role ?? null;
                        if (rawPermissionRole) {
                            return toTitleCaseLabel(rawPermissionRole);
                        }

                        if (explicitRoleName) return explicitRoleName;

                        const rawRole = item.role ?? null;
                        if (rawRole && !isUuid(rawRole)) {
                            return toTitleCaseLabel(rawRole);
                        }

                        const explicitJobTitleName = (item as unknown as { job_title_name?: string | null }).job_title_name ?? null;
                        if (explicitJobTitleName) return explicitJobTitleName;

                        if (isUuid(rawRole)) {
                            return jobTitleById.get(rawRole) ?? rawRole;
                        }

                        return rawRole;
                    })(),
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
                logBackendError({
                    module: 'useMyOrganizations',
                    operation: 'load member organizations',
                    trigger: 'background',
                    error: err,
                    ids: {
                        profileId: profileId ?? null,
                    },
                });
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
