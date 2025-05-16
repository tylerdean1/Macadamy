import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { logError } from "@/utils/errorLogger";
import type { Crews } from "@/lib/types";

/**
 * Hook for handling crew-related operations
 */
export function useCrewOperations() {
    /**
     * Fetch crews by organization ID
     */
    const fetchCrewsByOrganization = useCallback(
        async (organizationId: string) => {
            try {
                const { data, error } = await supabase
                    .from("crews")
                    .select("*")
                    .eq("organization_id", organizationId);

                if (error) throw error;
                return data || [];
            } catch (err) {
                logError("fetchCrewsByOrganization", err);
                return [];
            }
        },
        [],
    );

    /**
     * Create a new crew
     */
    const createCrew = useCallback(async (data: Crews) => {
        try {
            const { data: newCrew, error } = await supabase
                .from("crews")
                .insert(data)
                .select("id")
                .single();

            if (error) throw error;
            return newCrew?.id || null;
        } catch (err) {
            logError("createCrew", err);
            throw err;
        }
    }, []);

    /**
     * Update an existing crew
     */
    const updateCrew = useCallback(
        async (id: string, updates: Partial<Crews>) => {
            try {
                const { error } = await supabase
                    .from("crews")
                    .update(updates)
                    .eq("id", id);

                if (error) throw error;
            } catch (err) {
                logError("updateCrew", err);
                throw err;
            }
        },
        [],
    );

    /**
     * Delete a crew
     */
    const deleteCrew = useCallback(async (id: string) => {
        try {
            const { error } = await supabase
                .from("crews")
                .delete()
                .eq("id", id);

            if (error) throw error;
        } catch (err) {
            logError("deleteCrew", err);
            throw err;
        }
    }, []);

    return {
        fetchCrewsByOrganization,
        createCrew,
        updateCrew,
        deleteCrew,
    };
}
