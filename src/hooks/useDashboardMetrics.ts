import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

interface DashboardMetricsData {
    activeContracts: number;
    openIssues: number;
    pendingInspections: number;
}

export function useDashboardMetrics() {
    const { profile } = useAuthStore();
    const [metrics, setMetrics] = useState<DashboardMetricsData>({
        activeContracts: 0,
        openIssues: 0,
        pendingInspections: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMetrics = useCallback(async () => {
        if (!profile?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Get active projects count using filter_projects
            const { data: activeProjectsData, error: projectsError } = await supabase
                .rpc('filter_projects', {
                    _filters: { status: 'active' },
                    _select_cols: []
                });

            if (projectsError) throw projectsError;

            const activeContracts = Array.isArray(activeProjectsData) ? activeProjectsData.length : 0;

            setMetrics({
                activeContracts,
                openIssues: 0, // TODO: Implement when issues table is available
                pendingInspections: 0, // TODO: Implement when inspections are properly set up
            });
        } catch (err) {
            console.error('Error loading dashboard metrics:', err);
            toast.error('Failed to load dashboard metrics');
            setError('Failed to load dashboard metrics.');
        } finally {
            setLoading(false);
        }
    }, [profile?.id]);

    useEffect(() => {
        void loadMetrics();
    }, [loadMetrics]);

    return {
        metrics,
        loading,
        error,
        reloadMetrics: loadMetrics,
    };
}
