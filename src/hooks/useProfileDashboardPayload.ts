import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { rpcClient } from '@/lib/rpc.client';
import { useAuthStore, type EnrichedProfile } from '@/lib/store';
import type { EnrichedUserContract } from '@/lib/types';

interface DashboardMetricsData {
    activeContracts: number;
    openIssues: number;
    pendingInspections: number;
}

interface DashboardPayloadResult {
    profile: EnrichedProfile | null;
    projects: EnrichedUserContract[];
    metrics: DashboardMetricsData;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

interface OrganizationMembershipItem {
    id: string;
    name: string;
    role: string | null;
}

interface RpcErrorShape {
    code?: unknown;
    message?: unknown;
}

const normalizeString = (value: unknown, fallback: string | null = null): string | null =>
    typeof value === 'string' && value.trim() !== '' ? value : fallback;

const normalizeNumber = (value: unknown, fallback = 0): number =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const normalizeProject = (raw: Record<string, unknown>): EnrichedUserContract => ({
    id: typeof raw.id === 'string' ? raw.id : '',
    name: typeof raw.name === 'string' ? raw.name : '',
    description: normalizeString(raw.description),
    start_date: normalizeString(raw.start_date),
    end_date: normalizeString(raw.end_date),
    created_at: normalizeString(raw.created_at),
    updated_at: String(raw.updated_at ?? ''),
    status: typeof raw.status === 'string' ? raw.status as EnrichedUserContract['status'] : null,
    organization_id: normalizeString(raw.organization_id),
    user_contract_role: null,
});

const sortProjectsByUpdatedDesc = (items: EnrichedUserContract[]): EnrichedUserContract[] => {
    const withScore = items.map((item) => {
        const timestamp = Date.parse(item.updated_at ?? '');
        return {
            item,
            score: Number.isFinite(timestamp) ? timestamp : 0,
        };
    });

    withScore.sort((a, b) => b.score - a.score);
    return withScore.map((entry) => entry.item);
};

const dedupeProjects = (items: EnrichedUserContract[]): EnrichedUserContract[] => {
    const byId = new Map<string, EnrichedUserContract>();
    for (const item of items) {
        if (!item.id) continue;
        const existing = byId.get(item.id);
        if (!existing) {
            byId.set(item.id, item);
            continue;
        }
        const existingScore = Date.parse(existing.updated_at ?? '');
        const nextScore = Date.parse(item.updated_at ?? '');
        if ((Number.isFinite(nextScore) ? nextScore : 0) > (Number.isFinite(existingScore) ? existingScore : 0)) {
            byId.set(item.id, item);
        }
    }
    return sortProjectsByUpdatedDesc(Array.from(byId.values()));
};

const isProfileDashboardJobTitleDriftError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const candidate = error as RpcErrorShape;
    if (candidate.code !== '42703' || typeof candidate.message !== 'string') {
        return false;
    }

    return candidate.message.includes('v_profile') && candidate.message.includes('job_title_id');
};

export function useProfileDashboardPayload(): DashboardPayloadResult {
    const { user, profile, loading: authLoading, setProfile, selectedOrganizationId } = useAuthStore();
    const [projects, setProjects] = useState<EnrichedUserContract[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetricsData>({
        activeContracts: 0,
        openIssues: 0,
        pendingInspections: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const requestSeq = useRef(0);
    const isMountedRef = useRef(true);

    const loadOrgScopedDashboard = useCallback(async (organizationId: string) => {
        const orgRaw = await rpcClient.rpc_org_dashboard_payload({ p_organization_id: organizationId });
        const orgPayload = orgRaw && typeof orgRaw === 'object' ? (orgRaw as Record<string, unknown>) : {};
        const orgMetrics = (orgPayload.metrics && typeof orgPayload.metrics === 'object')
            ? (orgPayload.metrics as Record<string, unknown>)
            : {};

        const totalProjects = normalizeNumber(orgMetrics.total_projects, 0);
        const openIssues = normalizeNumber(orgMetrics.open_issues, 0);
        const pendingInspections = normalizeNumber(orgMetrics.pending_inspections, 0);

        const projectsData = await rpcClient.filter_projects({
            _filters: { organization_id: organizationId },
            _limit: 25,
            _order_by: 'updated_at',
            _direction: 'desc'
        }) as Array<Record<string, unknown>>;

        const nextProjects = Array.isArray(projectsData) ? projectsData.map((p) => normalizeProject(p)) : [];

        return {
            projects: nextProjects,
            metrics: {
                activeContracts: totalProjects,
                openIssues,
                pendingInspections,
            },
        };
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const loadPayload = useCallback(async (): Promise<void> => {
        const requestId = ++requestSeq.current;
        const canUpdate = () => isMountedRef.current && requestId === requestSeq.current;

        if (authLoading.initialization || authLoading.profile || authLoading.auth) {
            if (canUpdate()) {
                setLoading(true);
            }
            return;
        }

        if (!user?.id) {
            if (canUpdate()) {
                setProjects([]);
                setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
                setLoading(false);
            }
            return;
        }

        if (!profile || profile.id !== user.id) {
            if (canUpdate()) {
                setLoading(true);
            }
            return;
        }

        if (canUpdate()) {
            setLoading(true);
            setError(null);
        }

        try {
            const membershipRows = await rpcClient.get_my_member_organizations();
            const memberships: OrganizationMembershipItem[] = Array.isArray(membershipRows)
                ? membershipRows
                    .map((row) => ({
                        id: typeof row.id === 'string' ? row.id : '',
                        name: typeof row.name === 'string' ? row.name : '',
                        role: normalizeString((row as Record<string, unknown>).role),
                    }))
                    .filter((row) => row.id !== '' && row.name !== '')
                : [];

            if (selectedOrganizationId) {
                const scoped = await loadOrgScopedDashboard(selectedOrganizationId);
                if (canUpdate()) {
                    setProjects(sortProjectsByUpdatedDesc(scoped.projects));
                    setMetrics(scoped.metrics);
                }

                const selectedMembership = memberships.find((item) => item.id === selectedOrganizationId) ?? null;
                const selectedOrgName = selectedMembership?.name ?? null;
                const shouldUpdateProfile = profile.organization_name !== selectedOrgName;
                if (shouldUpdateProfile) {
                    setProfile({
                        ...profile,
                        organization_name: selectedOrgName,
                        organization_address: null,
                        job_title: null,
                    });
                }
                return;
            }

            if (memberships.length > 0) {
                const allOrgResults = await Promise.all(
                    memberships.map((membership) => loadOrgScopedDashboard(membership.id))
                );

                const aggregatedMetrics = allOrgResults.reduce(
                    (acc, item) => ({
                        activeContracts: acc.activeContracts + item.metrics.activeContracts,
                        openIssues: acc.openIssues + item.metrics.openIssues,
                        pendingInspections: acc.pendingInspections + item.metrics.pendingInspections,
                    }),
                    { activeContracts: 0, openIssues: 0, pendingInspections: 0 }
                );

                const aggregatedProjects = dedupeProjects(
                    allOrgResults.flatMap((item) => item.projects)
                );

                if (canUpdate()) {
                    setProjects(aggregatedProjects);
                    setMetrics(aggregatedMetrics);
                }

                const shouldUpdateProfile =
                    profile.organization_name !== null ||
                    profile.organization_address !== null ||
                    profile.job_title !== null;

                if (shouldUpdateProfile) {
                    setProfile({
                        ...profile,
                        organization_name: null,
                        organization_address: null,
                        job_title: null,
                    });
                }

                return;
            }

            // Fallback for users with no active memberships: use profile-scoped payload
            let payload: Record<string, unknown> = {};
            try {
                const raw = await rpcClient.rpc_profile_dashboard_payload({
                    p_projects_page: 1,
                    p_page_size: 25,
                });
                payload = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
            } catch (rpcError) {
                if (!isProfileDashboardJobTitleDriftError(rpcError)) {
                    throw rpcError;
                }

                if (canUpdate()) {
                    setProjects([]);
                    setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
                }

                const shouldClearOrgContext =
                    profile.organization_name !== null ||
                    profile.organization_address !== null ||
                    profile.job_title !== null;

                if (shouldClearOrgContext) {
                    setProfile({
                        ...profile,
                        organization_name: null,
                        organization_address: null,
                        job_title: null,
                    });
                }

                return;
            }

            const orgRaw = payload.organization && typeof payload.organization === 'object'
                ? (payload.organization as Record<string, unknown>)
                : null;
            const projectsRaw = payload.projects && typeof payload.projects === 'object'
                ? (payload.projects as Record<string, unknown>)
                : {};
            const itemsRaw = Array.isArray((projectsRaw as Record<string, unknown>).items)
                ? ((projectsRaw as Record<string, unknown>).items as Array<Record<string, unknown>>)
                : [];
            const metricsRaw = payload.metrics && typeof payload.metrics === 'object'
                ? (payload.metrics as Record<string, unknown>)
                : {};

            const nextProjects = itemsRaw.map((item) => normalizeProject(item));

            const activeProjects = normalizeNumber(metricsRaw.active_projects, 0);
            const openIssues = normalizeNumber(metricsRaw.open_issues, 0);
            const pendingInspections = normalizeNumber(metricsRaw.pending_inspections, 0);

            if (canUpdate()) {
                setProjects(nextProjects);
                setMetrics({
                    activeContracts: activeProjects,
                    openIssues,
                    pendingInspections,
                });
            }

            const organizationName = orgRaw ? normalizeString(orgRaw.name) : null;
            const organizationAddress = orgRaw ? normalizeString(orgRaw.headquarters) : null;

            const shouldUpdateProfile =
                profile.organization_name !== organizationName ||
                profile.job_title !== null ||
                profile.organization_address !== organizationAddress;

            if (shouldUpdateProfile) {
                setProfile({
                    ...profile,
                    organization_name: organizationName,
                    organization_address: organizationAddress,
                    job_title: null,
                });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load dashboard data.';
            if (canUpdate()) {
                setError(message);
                setProjects([]);
                setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
            }
        } finally {
            if (canUpdate()) {
                setLoading(false);
            }
        }
    }, [authLoading.initialization, authLoading.profile, authLoading.auth, profile, setProfile, user?.id, selectedOrganizationId, loadOrgScopedDashboard]);

    useEffect(() => {
        void loadPayload();
    }, [loadPayload]);

    const displayedProjects = selectedOrganizationId
        ? projects.filter((p) => p.organization_id === selectedOrganizationId)
        : projects;

    return {
        profile,
        projects: useMemo(() => displayedProjects, [projects, selectedOrganizationId]),
        metrics,
        loading,
        error,
        reload: loadPayload,
    };
}
