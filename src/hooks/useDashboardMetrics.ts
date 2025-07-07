import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { rpcClient } from '@/lib/rpc.client';
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
            const metricsData = await rpcClient.getDashboardMetrics({ _user_id: profile.id });
            setMetrics({
                activeContracts: metricsData.active_contracts || 0,
                openIssues: metricsData.total_issues || 0, // Assuming total_issues maps to openIssues
                pendingInspections: metricsData.total_inspections || 0, // Assuming total_inspections maps to pendingInspections
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
        reloadMetrics: loadMetrics, // Expose a way to reload metrics
    };
}
