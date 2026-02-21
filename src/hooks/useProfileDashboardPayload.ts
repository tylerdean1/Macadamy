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

interface JobTitleItem {
    id: string;
    name: string;
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

const resolveJobTitle = (jobTitles: JobTitleItem[], jobTitleId: string | null): string | null => {
    if (!jobTitleId) return null;
    const match = jobTitles.find((jt) => jt.id === jobTitleId);
    return match?.name ?? null;
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
            // If a specific organization is selected for the dashboard (client-only filter), load org-scoped payload
            if (selectedOrganizationId && profile?.organization_id !== selectedOrganizationId) {
                const orgRaw = await rpcClient.rpc_org_dashboard_payload({ p_organization_id: selectedOrganizationId });
                const orgPayload = orgRaw && typeof orgRaw === 'object' ? (orgRaw as Record<string, unknown>) : {};

                // Map org metrics -> dashboard metrics (best-effort mapping)
                const orgMetrics = (orgPayload.metrics && typeof orgPayload.metrics === 'object') ? (orgPayload.metrics as Record<string, unknown>) : {};
                const totalProjects = typeof orgMetrics.total_projects === 'number' ? orgMetrics.total_projects : 0;

                // Fetch projects for the selected org (reuse existing RPC)
                const projectsData = await rpcClient.filter_projects({ _filters: { organization_id: selectedOrganizationId }, _limit: 25, _order_by: 'updated_at', _direction: 'desc' }) as Array<Record<string, unknown>>;
                const nextProjects = Array.isArray(projectsData) ? projectsData.map((p) => normalizeProject(p)) : [];

                const openIssues = typeof orgMetrics.open_issues === 'number' ? orgMetrics.open_issues : 0;
                const pendingInspections = typeof orgMetrics.pending_inspections === 'number' ? orgMetrics.pending_inspections : 0;

                if (canUpdate()) {
                    setProjects(nextProjects);
                    setMetrics({
                        // `total_projects` is the closest available metric here
                        activeContracts: totalProjects,
                        openIssues,
                        pendingInspections,
                    });
                }

                return; // early exit — we've loaded org-scoped payload
            }

            // Default: no org filter or selected org == primary org; use profile-scoped payload
            const raw = await rpcClient.rpc_profile_dashboard_payload({
                p_projects_page: 1,
                p_page_size: 25,
            });

            const payload = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
            const profileRaw = payload.profile && typeof payload.profile === 'object'
                ? (payload.profile as Record<string, unknown>)
                : {};
            const orgRaw = payload.organization && typeof payload.organization === 'object'
                ? (payload.organization as Record<string, unknown>)
                : null;
            const projectsRaw = payload.projects && typeof payload.projects === 'object'
                ? (payload.projects as Record<string, unknown>)
                : {};
            const itemsRaw = Array.isArray((projectsRaw as Record<string, unknown>).items)
                ? ((projectsRaw as Record<string, unknown>).items as Array<Record<string, unknown>>)
                : [];
            const jobTitlesRaw = Array.isArray(payload.job_titles)
                ? payload.job_titles as Array<Record<string, unknown>>
                : [];
            const metricsRaw = payload.metrics && typeof payload.metrics === 'object'
                ? (payload.metrics as Record<string, unknown>)
                : {};

            const jobTitles: JobTitleItem[] = jobTitlesRaw
                .filter((item) => item && typeof item === 'object')
                .map((item) => ({
                    id: typeof item.id === 'string' ? item.id : '',
                    name: typeof item.name === 'string' ? item.name : '',
                }))
                .filter((item) => item.id !== '' && item.name !== '');

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
            const jobTitleName = resolveJobTitle(jobTitles, normalizeString(profileRaw.job_title_id));
            const organizationAddress = orgRaw ? normalizeString(orgRaw.headquarters) : null;

            const shouldUpdateProfile =
                profile.organization_name !== organizationName ||
                profile.job_title !== jobTitleName ||
                profile.organization_address !== organizationAddress;

            if (shouldUpdateProfile) {
                setProfile({
                    ...profile,
                    organization_name: organizationName,
                    organization_address: organizationAddress,
                    job_title: jobTitleName,
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
    }, [authLoading.initialization, authLoading.profile, authLoading.auth, profile, setProfile, user?.id, selectedOrganizationId]);

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
