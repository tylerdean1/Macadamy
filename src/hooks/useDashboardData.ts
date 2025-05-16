import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import type { Avatars, Contracts, JobTitle, Organization } from "@/lib/types";

interface DashboardMetricsData {
    activeContracts: number;
    openIssues: number;
    pendingInspections: number;
}

export function useDashboardData() {
    const { user, profile } = useAuthStore();

    // State
    const [avatars, setAvatars] = useState<Avatars[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
    const [contracts, setContracts] = useState<Contracts[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetricsData>({
        activeContracts: 0,
        openIssues: 0,
        pendingInspections: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            if (!user?.id) return;
            setLoading(true);
            setError(null);

            try {
                // Get the profile from the store
                if (!profile) {
                    setLoading(false);
                    return;
                }

                // Load avatars (used in modal)
                const { data: avs } = await supabase
                    .from("avatars")
                    .select("*")
                    .or(`is_preset.eq.true,profile_id.eq.${user.id}`)
                    .order("created_at");
                setAvatars(avs || []);

                // Load organizations and job titles for editing
                const [orgRes, jobRes] = await Promise.all([
                    supabase.from("organizations").select("*"),
                    supabase.from("job_titles").select("*"),
                ]);
                setOrganizations(orgRes.data || []);
                setJobTitles(jobRes.data || []);

                // Load user contracts
                // NOTE: Future optimization - this could be refactored to use useContractData hook
                // for consistency with other parts of the application and to leverage
                // the hook's built-in error handling and data transformation
                const { data: ucRes, error: ucErr } = await supabase
                    .from("user_contracts")
                    .select("contract_id")
                    .eq("user_id", user.id);

                if (ucErr) {
                    console.error("Error loading user contracts:", ucErr);
                    toast.error("Failed to load contracts");
                    setLoading(false);
                    return;
                }

                const contractIds = ucRes?.map((u) => u.contract_id) || [];

                if (contractIds.length === 0) {
                    setContracts([]);
                    setMetrics({
                        activeContracts: 0,
                        openIssues: 0,
                        pendingInspections: 0,
                    });
                    setLoading(false);
                    return;
                }

                // Load contracts & metrics in parallel
                const [
                    { data: contractData, error: contractErr },
                    { data: activeRows, error: activeErr },
                    { data: openIssueRows, error: issueErr },
                    { data: inspectionRows, error: inspectionErr },
                ] = await Promise.all([
                    // 1. Full contract list
                    supabase
                        .from("contracts")
                        .select("*")
                        .in("id", contractIds)
                        .order("created_at", { ascending: false }),

                    // 2. Active contracts (we only need IDs to count)
                    supabase
                        .from("contracts")
                        .select("id")
                        .in("id", contractIds)
                        .eq("status", "Active"),

                    // 3. Open issues
                    supabase
                        .from("issues")
                        .select("id")
                        .in("contract_id", contractIds)
                        .eq("status", "Open"),

                    // 4. All inspections (no status filter)
                    supabase
                        .from("inspections")
                        .select("id")
                        .in("contract_id", contractIds),
                ]);

                // Handle any errors from the parallel queries
                if (contractErr || activeErr || issueErr || inspectionErr) {
                    console.error(
                        "Error loading contract data:",
                        contractErr || activeErr || issueErr || inspectionErr,
                    );
                    toast.error("Some contract data could not be loaded");
                }

                // Compute counts client-side
                const activeCount = activeRows?.length ?? 0;
                const issuesCount = openIssueRows?.length ?? 0;
                const inspCount = inspectionRows?.length ?? 0;

                // Update state
                setContracts(contractData || []);
                setMetrics({
                    activeContracts: activeCount,
                    openIssues: issuesCount,
                    pendingInspections: inspCount,
                });
            } catch (error) {
                console.error("Error loading dashboard data:", error);
                toast.error("Failed to load dashboard data");
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [user, profile]);

    return {
        avatars,
        organizations,
        jobTitles,
        contracts,
        metrics,
        loading,
        error,
    };
}
