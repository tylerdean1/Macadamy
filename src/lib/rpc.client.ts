import { supabase } from "./supabase";
import type { Database } from "./database.types";

/**
 * Type-safe RPC client for Supabase database functions
 * All function types are now sourced from database.types.ts
 */
class RpcClient {
    // Helper method to call RPCs with proper typing
    private async callRpc<T = unknown>(
        rpcName: keyof Database["public"]["Functions"],
        args: Record<string, unknown> = {},
        options?: { single?: boolean }
    ): Promise<T> {
        // @ts-expect-error - TypeScript doesn't understand dynamic RPC names
        const query = supabase.rpc(rpcName, args);
        const result = options && options.single === true ? await query.single() : await query;

        if (result.error) {
            console.error(`[RpcClient] ${String(rpcName)} error:`, result.error);
            throw result.error;
        }

        return result.data as T;
    }

    // Profile Management
    async getEnrichedProfile(args: { _user_id: string }): Promise<any | null> {
        // This would need to be implemented based on your specific RPC functions
        // For now, returning a placeholder
        console.warn("getEnrichedProfile needs to be implemented with proper database function");
        return null;
    }

    async getEnrichedProfileByUsername(args: { username: string }): Promise<any | null> {
        console.warn("getEnrichedProfileByUsername needs to be implemented with proper database function");
        return null;
    }

    async updateProfileFull(args: any): Promise<void> {
        console.warn("updateProfileFull needs to be implemented with proper database function");
    }

    async insertProfileFull(args: any): Promise<string> {
        console.warn("insertProfileFull needs to be implemented with proper database function");
        return "";
    }

    // Organization Management
    async getOrganizations(): Promise<any[]> {
        console.warn("getOrganizations needs to be implemented with proper database function");
        return [];
    }

    async getJobTitles(): Promise<any[]> {
        console.warn("getJobTitles needs to be implemented with proper database function");
        return [];
    }

    async insert_job_title(args: any): Promise<any[]> {
        console.warn("insert_job_title needs to be implemented with proper database function");
        return [];
    }

    // Contract Management
    async getEnrichedUserContracts(args: { _user_id: string }): Promise<any[]> {
        console.warn("getEnrichedUserContracts needs to be implemented with proper database function");
        return [];
    }

    async getContractWithWkt(args: { contract_id: string }): Promise<any[]> {
        console.warn("getContractWithWkt needs to be implemented with proper database function");
        return [];
    }

    async getProfilesByContract(args: { contract_id: string }): Promise<any[]> {
        console.warn("getProfilesByContract needs to be implemented with proper database function");
        return [];
    }

    async updateContracts(args: any): Promise<void> {
        console.warn("updateContracts needs to be implemented with proper database function");
    }

    async deleteContracts(args: { id: string }): Promise<void> {
        console.warn("deleteContracts needs to be implemented with proper database function");
    }

    // Dashboard & Metrics
    async getDashboardMetrics(args: { _user_id: string }): Promise<{ active_contracts: number; total_issues: number; total_inspections: number; }> {
        console.warn("getDashboardMetrics needs to be implemented with proper database function");
        return { active_contracts: 0, total_issues: 0, total_inspections: 0 };
    }

    // Labor Records
    async getLaborRecords(args: { line_item_id: string }): Promise<any[]> {
        console.warn("getLaborRecords needs to be implemented with proper database function");
        return [];
    }

    async insertLaborRecord(args: any): Promise<string> {
        console.warn("insertLaborRecord needs to be implemented with proper database function");
        return "";
    }

    // Line Item Templates
    async getAllLineItemTemplates(args?: any): Promise<any[]> {
        console.warn("getAllLineItemTemplates needs to be implemented with proper database function");
        return [];
    }

    // Enum Values
    async getEnumValues(args: { enum_type: string }): Promise<{ value: string }[]> {
        // This is a placeholder - ideally you'd implement this using the Constants from database.types.ts
        console.warn("getEnumValues is deprecated - use Constants from database.types.ts instead");
        return [];
    }

    // Placeholder methods that were referenced but may not exist
    async removeProfileFromContract(args: { _contract_id: string; _profile_id: string }): Promise<void> {
        console.warn("removeProfileFromContract needs to be implemented with proper database function");
    }

    async updateProfileContractRole(args: { _contract_id: string; _profile_id: string; _role: string }): Promise<void> {
        console.warn("updateProfileContractRole needs to be implemented with proper database function");
    }
}

export const rpcClient = new RpcClient();
