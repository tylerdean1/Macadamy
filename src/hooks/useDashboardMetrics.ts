import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { disableOrderByForTable, getOrderByColumn } from '@/lib/utils/rpcOrderBy';
import { useAuthStore } from '@/lib/store';

interface DashboardMetricsData {
    activeContracts: number;
    openIssues: number;
    pendingInspections: number;
}

export function useDashboardMetrics() {
    const { user, profile, loading: authLoading } = useAuthStore();
    const [metrics, setMetrics] = useState<DashboardMetricsData>({
        activeContracts: 0,
        openIssues: 0,
        pendingInspections: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accessDenied, setAccessDenied] = useState(false);
    const requestSeq = useRef(0);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const loadMetrics = useCallback(async () => {
        const requestId = ++requestSeq.current;
        const canUpdate = () => isMountedRef.current && requestId === requestSeq.current;
        if (authLoading.initialization || authLoading.profile || authLoading.auth) {
            console.debug('[useDashboardMetrics] Skipping load: auth still bootstrapping', {
                initialization: authLoading.initialization,
                auth: authLoading.auth,
                profile: authLoading.profile,
            });
            if (canUpdate()) {
                setLoading(true);
            }
            return;
        }
        if (!user?.id) {
            console.debug('[useDashboardMetrics] Skipping load: user not ready', {
                userId: user?.id ?? null,
            });
            if (canUpdate()) {
                setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
                setLoading(false);
            }
            return;
        }
        if (!profile || profile.id !== user.id) {
            console.debug('[useDashboardMetrics] Skipping load: profile not synced to user', {
                userId: user.id,
                profileId: profile?.id ?? null,
            });
            if (canUpdate()) {
                setLoading(true);
            }
            return;
        }
        if (!profile.organization_id) {
            console.debug('[useDashboardMetrics] Skipping load: missing organization_id');
            if (canUpdate()) {
                setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
                setLoading(false);
            }
            return;
        }
        if (accessDenied) {
            console.debug('[useDashboardMetrics] Skipping load: access denied flag set');
            if (canUpdate()) {
                setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
                setLoading(false);
            }
            return;
        }
        const canUseProjectRpc = profile.role === 'system_admin'
            || profile.role === 'org_admin'
            || profile.role === 'org_supervisor';
        if (!canUseProjectRpc) {
            console.debug('[useDashboardMetrics] Skipping load: role not permitted', {
                role: profile.role ?? null,
            });
            if (canUpdate()) {
                setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
                setLoading(false);
            }
            return;
        }
        if (canUpdate()) {
            setLoading(true);
            setError(null);
        }
        try {
            // Get active projects count using filter_projects
            const orderBy = await getOrderByColumn('projects');
            if (!orderBy) {
                if (canUpdate()) {
                    setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
                    setError(null);
                }
                return;
            }

            const payload = {
                _filters: { organization_id: profile.organization_id, status: 'active' },
                _order_by: orderBy,
                _direction: 'asc'
            } as Record<string, unknown>;

            console.debug('[useDashboardMetrics] Calling filter_projects', {
                userId: user.id,
                profileId: profile.id,
                role: profile.role ?? null,
                organizationId: profile.organization_id ?? null,
                payload,
            });

            const { data: activeProjectsData, error: projectsError } = await supabase
                .rpc('filter_projects', payload);

            if (projectsError) {
                console.error('[useDashboardMetrics] filter_projects error', {
                    code: projectsError.code,
                    message: projectsError.message,
                    details: projectsError.details,
                    hint: projectsError.hint,
                });
                const message = projectsError.message?.toLowerCase() ?? '';
                const isPermissionDenied = projectsError.code === '42501'
                    || message.includes('access denied')
                    || message.includes('permission denied');
                if (isPermissionDenied) {
                    if (canUpdate()) {
                        console.warn('[useDashboardMetrics] Access denied for filter_projects; suppressing retries');
                        setAccessDenied(true);
                        setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
                        setError(null);
                    }
                    return;
                }
                if (projectsError.message === 'unknown order_by column') {
                    disableOrderByForTable('projects');
                    if (canUpdate()) {
                        setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
                        setError(null);
                    }
                    return;
                }
                throw projectsError;
            }

            const activeContracts = Array.isArray(activeProjectsData) ? activeProjectsData.length : 0;

            if (canUpdate()) {
                setMetrics({
                    activeContracts,
                    openIssues: 0, // TODO: Implement when issues table is available
                    pendingInspections: 0, // TODO: Implement when inspections are properly set up
                });
            }
        } catch (err) {
            const message = (err as { message?: string } | null)?.message ?? '';
            if (message === 'unknown order_by column') {
                if (canUpdate()) {
                    setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
                    setError(null);
                }
                return;
            }
            console.error('[useDashboardMetrics] Error loading dashboard metrics', err);
            if (canUpdate()) {
                toast.error('Failed to load dashboard metrics');
                setError('Failed to load dashboard metrics.');
            }
        } finally {
            if (canUpdate()) {
                setLoading(false);
            }
        }
    }, [accessDenied, authLoading.initialization, authLoading.profile, authLoading.auth, profile?.id, profile?.organization_id, profile?.role, user?.id]);

    useEffect(() => {
        void loadMetrics();
    }, [loadMetrics]);

    useEffect(() => {
        setAccessDenied(false);
    }, [user?.id]);

    return {
        metrics,
        loading,
        error,
        reloadMetrics: loadMetrics,
    };
}
