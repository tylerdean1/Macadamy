import { supabase } from "./supabase";
import type * as RPC from "./rpc.types";
import type { EnrichedUserContract } from "./types";

/**
 * Type-safe RPC client for Supabase database functions
 */
class RpcClient {
  // Helper method to call RPCs with proper typing
  private async callRpc<T = unknown>(
    rpcName: string,
    args: Record<string, unknown>,
    options?: { single?: boolean }
  ): Promise<T> {
    // @ts-expect-error - TypeScript doesn't understand dynamic RPC names
    const query = supabase.rpc(rpcName, args);
    const result = options && options.single === true ? await query.single() : await query;

    if (result.error) {
      console.error(`[RpcClient] ${rpcName} error:`, result.error);
      throw result.error;
    }

    return result.data as T;
  }

  // Profile RPCs
  async getEnrichedProfile(args: { _user_id: string }): Promise<RPC.AllProfilesRow | null> {
    const data = await this.callRpc<RPC.AllProfilesRow[]>("get_enriched_profile", args);
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  }

  async getAllProfiles(args: RPC.GetAllProfilesRpcArgs): Promise<RPC.AllProfilesRow[]> {
    return this.callRpc<RPC.AllProfilesRow[]>("get_all_profiles", args);
  }

  async updateProfileFull(args: RPC.UpdateProfileFullRpcArgs): Promise<void> {
    await this.callRpc("update_profile_full", args);
  }

  async insertProfileFull(args: RPC.InsertProfileFullRpcArgs): Promise<void> {
    await this.callRpc("insert_profile_full", args);
  }

  // Enum RPCs
  async getEnumValues(args: { enum_type: string }): Promise<{ value: string }[]> {
    return this.callRpc<{ value: string }[]>("get_enum_values", args);
  }

  // Demo Data RPCs
  async createDemoEnvironment(args: { base_profile_email: string }): Promise<{ created_session_id: string; created_profile_id: string }> {
    return this.callRpc<{ created_session_id: string; created_profile_id: string }>(
      "create_demo_environment",
      args,
      { single: true }
    );
  }

  async executeFullDemoClone(args: { p_session_id: string }): Promise<void> {
    await this.callRpc("execute_full_demo_clone", args);
  }

  async checkUsernameAvailable(args: RPC.CheckUsernameAvailableRpcArgs): Promise<boolean> {
    return this.callRpc<boolean>("check_username_available", args, { single: true });
  }

  async getEnrichedProfileByUsername(args: RPC.GetEnrichedProfileByUsernameRpcArgs): Promise<RPC.AllProfilesRow | null> {
    const data = await this.callRpc<RPC.AllProfilesRow[]>("get_enriched_profile_by_username", args);
    return data != null && data.length > 0 ? data[0] : null;
  }

  async getAvatarsForProfile(args: RPC.GetAvatarsForProfileRpcArgs): Promise<RPC.AvatarsForProfileRow[]> {
    return this.callRpc<RPC.AvatarsForProfileRow[]>("get_avatars_for_profile", args);
  }

  async getOrganizations(args: RPC.GetOrganizationsRpcArgs): Promise<RPC.OrganizationsRow[]> {
    return this.callRpc<RPC.OrganizationsRow[]>("get_organizations", args);
  }

  async getJobTitles(): Promise<RPC.JobTitlesRow[]> {
    return this.callRpc<RPC.JobTitlesRow[]>("get_job_titles", {});
  }

  async getEnrichedUserContracts(args: { _user_id: string }): Promise<EnrichedUserContract[]> {
    return this.callRpc<EnrichedUserContract[]>("get_enriched_user_contracts", args);
  }

  async getDashboardMetrics(args: RPC.GetDashboardMetricsRpcArgs): Promise<{ active_contracts: number; total_issues: number; total_inspections: number; }> {
    return this.callRpc<{ active_contracts: number; total_issues: number; total_inspections: number; }>("get_dashboard_metrics", args);
  }

  async getAllLineItemTemplates(args: import('./rpc.types').GetAllLineItemTemplatesRpcArgs): Promise<import('./rpc.types').AllLineItemTemplatesRow[]> {
    return this.callRpc<import('./rpc.types').AllLineItemTemplatesRow[]>(
      'get_all_line_item_templates',
      args
    );
  }

  // Contract/Team Management RPCs
  async getContractWithWkt(args: { contract_id: string }): Promise<import('./rpc.types').ContractWithWktRow[]> {
    return this.callRpc<import('./rpc.types').ContractWithWktRow[]>(
      'get_contract_with_wkt',
      args
    );
  }

  async getProfilesByContract(args: { _contract_id: string }): Promise<import('./rpc.types').ProfilesByContractRow[]> {
    return this.callRpc<import('./rpc.types').ProfilesByContractRow[]>(
      'get_profiles_by_contract',
      args
    );
  }

  async updateContracts(args: { _id: string; _data: { status: string } }): Promise<void> {
    return this.callRpc<void>('update_contracts', args);
  }

  async removeProfileFromContract(args: { _contract_id: string; _profile_id: string }): Promise<void> {
    return this.callRpc<void>('remove_profile_from_contract', args);
  }

  async updateProfileContractRole(args: { _contract_id: string; _profile_id: string; _role: string }): Promise<void> {
    return this.callRpc<void>('update_profile_contract_role', args);
  }

  async deleteContracts(args: { _id: string }): Promise<void> {
    return this.callRpc<void>('delete_contract', args);
  }
}

export const rpcClient = new RpcClient();
