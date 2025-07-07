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

  async updateProfileFull(args: RPC.UpdateProfileRpcArgs): Promise<void> {
    await this.callRpc<void>("update_profile", args);
  }

  async insertProfileFull(args: RPC.InsertProfileFullRpcArgs): Promise<string> {
    return this.callRpc<string>("insert_profile_full", args);
  }

  // Enum RPCs
  async getEnumValues(args: { enum_type: string }): Promise<{ value: string }[]> {
    return this.callRpc<{ value: string }[]>("get_enum_values", args);
  }


  async checkUsernameAvailable(args: RPC.CheckUsernameAvailableRpcArgs): Promise<boolean> {
    return this.callRpc<boolean>("check_username_available", args, { single: true });
  }

  async getEnrichedProfileByUsername(args: { username: string }): Promise<RPC.AllProfilesRow | null> {
    const data = await this.callRpc<RPC.AllProfilesRow[]>("get_enriched_profile_by_username", args);
    return data != null && data.length > 0 ? data[0] : null;
  }

  async getAvatarsForProfile(args: RPC.GetAvatarsForProfileRpcArgs): Promise<RPC.AvatarsForProfileRow[]> {
    return this.callRpc<RPC.AvatarsForProfileRow[]>("get_avatars_for_profile", args);
  }

  async getOrganizations(): Promise<RPC.OrganizationsRow[]> {
    return this.callRpc<RPC.OrganizationsRow[]>("get_organizations", {});
  }

  async getJobTitles(): Promise<RPC.JobTitlesRow[]> {
    return this.callRpc<RPC.JobTitlesRow[]>("get_job_titles", {});
  }

  async insert_job_title(args: RPC.InsertJobTitleRpcArgs): Promise<RPC.JobTitlesRow[]> {
    return this.callRpc<RPC.JobTitlesRow[]>("insert_job_title", args);
  }

  async getEnrichedUserContracts(args: { _user_id: string }): Promise<EnrichedUserContract[]> {
    return this.callRpc<EnrichedUserContract[]>("get_enriched_user_contracts", args);
  }

  async getDashboardMetrics(args: RPC.GetDashboardMetricsRpcArgs): Promise<{ active_contracts: number; total_issues: number; total_inspections: number; }> {
    return this.callRpc<{ active_contracts: number; total_issues: number; total_inspections: number; }>("get_dashboard_metrics", { _user_id: args._user_id });
  }

  async getAllLineItemTemplates(args: RPC.GetAllLineItemTemplatesRpcArgs): Promise<RPC.AllLineItemTemplatesRow[]> {
    return this.callRpc<RPC.AllLineItemTemplatesRow[]>(
      'get_all_line_item_templates',
      args
    );
  }

  // Contract/Team Management RPCs
  async getContractWithWkt(args: RPC.GetContractWithWktRpcArgs): Promise<RPC.ContractWithWktRow[]> {
    return this.callRpc<RPC.ContractWithWktRow[]>(
      'get_contract_with_wkt',
      args
    );
  }

  async getProfilesByContract(args: RPC.GetProfilesByContractRpcArgs): Promise<RPC.ProfilesByContractRow[]> {
    return this.callRpc<RPC.ProfilesByContractRow[]>(
      'get_profiles_by_contract',
      args
    );
  }

  async updateContracts(args: RPC.UpdateContractRpcArgs): Promise<void> {
    return this.callRpc<void>('update_contract', args);
  }

  async removeProfileFromContract(args: { _contract_id: string; _profile_id: string }): Promise<void> {
    return this.callRpc<void>('remove_profile_from_contract', args);
  }

  async updateProfileContractRole(args: { _contract_id: string; _profile_id: string; _role: string }): Promise<void> {
    return this.callRpc<void>('update_profile_contract_role', args);
  }

  async deleteContracts(args: RPC.DeleteContractsRpcArgs): Promise<void> {
    return this.callRpc<void>('delete_contract', args);
  }
}

export const rpcClient = new RpcClient();
