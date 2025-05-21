import { Database } from "./database.types";

/**
 * Remote Procedure Call (RPC) Type Definitions
 *
 * This file defines the TypeScript types for all RPC functions that interact with the Supabase backend.
 * Each RPC is documented with detailed information about:
 *   - Its purpose and functionality
 *   - Input parameters with property-level documentation
 *   - Return types and expected values
 *
 * These type definitions provide type safety for frontend code that calls these RPCs
 * and serve as documentation for developers working with the API.
 *
 * Organization:
 * - Database row types are defined first to represent the data structures from the database
 * - RPC function types are organized by functional area (contracts, WBS, maps, profiles, etc.)
 * - Special RPCs with complex behavior are documented with additional details
 */

// ========== DATABASE ROW TYPES ==========
export type ContractWithWktRow = {
  id: string;
  title: string | null;
  description: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  status: Database["public"]["Enums"]["contract_status"] | null;
  coordinates_wkt: string | null;
  session_id: string | null;
};

export type WbsWithWktRow = Database["public"]["Tables"]["wbs"]["Row"] & {
  wbs_number?: string | null;
  budget?: number | null;
  scope?: string | null;
  location?: string | null;
  coordinates_wkt?: string | null;
  session_id?: string | null;
};

export type MapsWithWktRow = {
  id: string | null;
  wbs_id: string | null;
  map_number: string | null;
  location: string | null;
  scope: string | null;
  budget: number | null;
  coordinates_wkt: string | null;
  session_id: string | null;
};

export type LineItemsWithWktRow = Database["public"]["Tables"]["line_items"]["Row"] & {
  line_code?: string | null;
  map_id?: string | null;
  unit_measure?:  Database["public"]["Enums"]["unit_measure_type"];
  reference_doc?: string | null;
  template_id?: string | null;
  coordinates_wkt?: string | null;
  session_id?: string | null;
};

export type ChangeOrdersRow = {
  id: string;
  line_item_id: string;
  new_quantity: number | null;
  new_unit_price: number;
  title: string;
  description: string | null;
  status: Database["public"]["Enums"]["change_order_status"];
  submitted_date: string;
  approved_date: string | null;
  approved_by: string | null;
  created_by: string;
  attachments: string[] | null;
  session_id: string | null;
};

export type ContractOrganizationsRow = {
  organization_id: string;
  notes: string | null;
  role: Database["public"]["Enums"]["organization_role"];
  session_id: string | null;
};

export type CrewMembersByOrganizationRow = {
  crew_id: string;
  profile_id: string;
  role: string | null;
  assigned_at: string;
  created_by: string | null;
  map_location_id: string;
  location_notes: string | null;
  session_id: string | null;
};

export type CrewsByOrganizationRow = {
  id: string;
  name: string;
  description: string | null;
  foreman_id: string | null;
  created_by: string;
  session_id: string | null;
};

export type DailyLogsRow = {
  id: string;
  log_date: string;
  weather_conditions: string | null;
  temperature: string | null;
  work_performed: string | null;
  delays_encountered: string | null;
  visitors: string | null;
  safety_incidents: string | null;
  created_by: string;
  session_id: string | null;
};

export type EquipmentByOrganizationRow = {
  id: string;
  user_defined_id: string;
  name: string;
  description: string | null;
  operator_id: string | null;
  session_id: string | null;
};

export type EquipmentAssignmentsRow = {
  id: string;
  equipment_id: string;
  operator_id: string;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  notes: string | null;
  session_id: string | null;
};

export type EquipmentUsageRow = {
  equipment_id: string;
  wbs_id: string;
  map_id: string;
  line_item_id: string;
  usage_date: string;
  hours_used: number | null;
  operator_id: string | null;
  session_id: string | null;
};

export type InspectionsRow = {
  id: string;
  wbs_id: string;
  map_id: string;
  line_item_id: string;
  name: string | null;
  description: string | null;
  pdf_url: string | null;
  photo_urls: string[] | null;
  created_by: string;
  session_id: string | null;
};

export type IssuesRow = {
  id: string;
  wbs_id: string;
  map_id: string;
  line_item_id: string;
  equipment_id: string;
  title: string | null;
  description: string | null;
  priority: string | null;
  status: string | null;
  due_date: string | null;
  resolution: string | null;
  assigned_to: string | null;
  created_by: string;
  photo_urls: string[] | null;
  session_id: string | null;
};

export type JobTitlesRow = {
  title: string;
  is_custom: boolean;
  session_id: string | null;
};

export type LineItemEntriesRow = {
  id: string;
  wbs_id: string;
  map_id: string;
  line_item_id: string;
  template_id: string;
  entered_by: string;
  input_variables: Record<string, unknown>;
  computed_output: number;
  notes: string | null;
  output_unit: Database["public"]["Enums"]["unit_measure_type"];
  session_id: string | null;
};

export type LineItemTemplatesByOrganizationRow = {
  id: string;
  name: string;
  description: string | null;
  unit_type: Database["public"]["Enums"]["unit_measure_type"];
  formula: Record<string, unknown>;
  instructions: string | null;
  session_id: string | null;
};

export type AllLineItemTemplatesRow = {
  id: string;
  name: string;
  description: string;
  unit_type: Database["public"]["Enums"]["unit_measure_type"];
  formula: Record<string, unknown>;
  instructions: string;
  session_id: string | null;
};

export type OrganizationsRow = {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  session_id: string | null;
};

export type ProfilesByOrganizationRow = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  role: Database["public"]["Enums"]["user_role"];
  job_title_id: string;
  organization_id: string;
  avatar_id: string;
  avatar_url: string;
  session_id: string | null;
};

export type AllProfilesRow = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  role: Database["public"]["Enums"]["user_role"];
  job_title_id: string;
  organization_id: string;
  avatar_id: string;
  avatar_url: string;
  session_id: string | null;
};

export type ProfilesByContractRow = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  role: Database["public"]["Enums"]["user_role"];
  job_title_id: string;
  organization_id: string;
  avatar_id: string;
  avatar_url: string;
  session_id: string | null;
};

export type AvatarsForProfileRow = {
  id: string;
  url: string;
  is_preset: boolean;
  profile_id?: string | null;
  session_id: string | null;
};

export type UserContractsRow = {
  contract_id: string;
  role: Database["public"]["Enums"]["user_role"];
  session_id: string | null;
};

// Generated RPC function types from functions.sql

/**
 * Helper function to get user ID from session.
 * @param args Object containing parameters for the RPC.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to the user ID (UUID string).
 */
export type GetUserIdFromSessionRpcArgs = {
  p_session_id: string;
};
export type GetUserIdFromSessionRpc = (
  args: GetUserIdFromSessionRpcArgs,
) => Promise<string>;

/**
 * RPC to get all contracts with WKT coordinates for the current session.
 * @param args Object containing parameters for the RPC.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of contract rows with WKT coordinates.
 */
export type GetContractsWithWktRpcArgs = {
  p_session_id: string;
};
export type GetContractsWithWktRpc = (
  args: GetContractsWithWktRpcArgs,
) => Promise<ContractWithWktRow[]>;

/**
 * RPC to get all WBS with WKT coordinates for a given contract_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_contract_id The contract ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of WBS rows with WKT coordinates.
 */
export type GetWbsWithWktRpcArgs = {
  p_contract_id: string;
  p_session_id: string;
};
export type GetWbsWithWktRpc = (
  args: GetWbsWithWktRpcArgs,
) => Promise<WbsWithWktRow[]>;

/**
 * RPC to get all maps with WKT coordinates for a given wbs_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_wbs_id The WBS ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of map rows with WKT coordinates.
 */
export type GetMapsWithWktRpcArgs = {
  p_wbs_id: string;
  p_session_id: string;
};
export type GetMapsWithWktRpc = (
  args: GetMapsWithWktRpcArgs,
) => Promise<MapsWithWktRow[]>;

/**
 * RPC to get all line items for a given contract_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_contract_id The contract ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of line item rows.
 */
export type GetLineItemsWithWktRpcArgs = {
  p_contract_id: string;
  p_session_id: string;
};
export type GetLineItemsWithWktRpc = (
  args: GetLineItemsWithWktRpcArgs,
) => Promise<LineItemsWithWktRow[]>;

/**
 * RPC to get all change orders for a given line_item_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_line_item_id The line item ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of change order rows.
 */
export type GetChangeOrdersForLineItemRpcArgs = {
  p_line_item_id: string;
  p_session_id: string;
};
export type GetChangeOrdersForLineItemRpc = (
  args: GetChangeOrdersForLineItemRpcArgs,
) => Promise<ChangeOrdersRow[]>;

/**
 * RPC to get all organizations associated with a contract.
 * @param args Object containing parameters for the RPC.
 * @param args.p_contract_id The contract ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of contract organization rows.
 */
export type GetContractOrganizationsRpcArgs = {
  p_contract_id: string;
  p_session_id: string;
};
export type GetContractOrganizationsRpc = (
  args: GetContractOrganizationsRpcArgs,
) => Promise<ContractOrganizationsRow[]>;

/**
 * RPC to get all crew members for a given organization_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_organization_id The organization ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of crew member rows for the organization.
 */
export type GetCrewMembersByOrganizationRpcArgs = {
  p_organization_id: string;
  p_session_id: string;
};
export type GetCrewMembersByOrganizationRpc = (
  args: GetCrewMembersByOrganizationRpcArgs,
) => Promise<CrewMembersByOrganizationRow[]>;

/**
 * RPC to get all crews for a given organization_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_organization_id The organization ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of crew rows for the organization.
 */
export type GetCrewsByOrganizationRpcArgs = {
  p_organization_id: string;
  p_session_id: string;
};
export type GetCrewsByOrganizationRpc = (
  args: GetCrewsByOrganizationRpcArgs,
) => Promise<CrewsByOrganizationRow[]>;

/**
 * RPC to get all daily logs for a given contract_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_contract_id The contract ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of daily log rows for the contract.
 */
export type GetDailyLogsForContractRpcArgs = {
  p_contract_id: string;
  p_session_id: string;
};
export type GetDailyLogsForContractRpc = (
  args: GetDailyLogsForContractRpcArgs,
) => Promise<DailyLogsRow[]>;

/**
 * RPC to get all equipment for a given organization_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_organization_id The organization ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of equipment rows for the organization.
 */
export type GetEquipmentByOrganizationRpcArgs = {
  p_organization_id: string;
  p_session_id: string;
};
export type GetEquipmentByOrganizationRpc = (
  args: GetEquipmentByOrganizationRpcArgs,
) => Promise<EquipmentByOrganizationRow[]>;

/**
 * RPC to get all equipment assignments for a given equipment_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_equipment_id The equipment ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of equipment assignment rows.
 */
export type GetEquipmentAssignmentsRpcArgs = {
  p_equipment_id: string;
  p_session_id: string;
};
export type GetEquipmentAssignmentsRpc = (
  args: GetEquipmentAssignmentsRpcArgs,
) => Promise<EquipmentAssignmentsRow[]>;

/**
 * RPC to get all equipment usage records for a given equipment_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_equipment_id The equipment ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of equipment usage rows.
 */
export type GetEquipmentUsageRpcArgs = {
  p_equipment_id: string;
  p_session_id: string;
};
export type GetEquipmentUsageRpc = (
  args: GetEquipmentUsageRpcArgs,
) => Promise<EquipmentUsageRow[]>;

/**
 * RPC to get all inspections for a given contract_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_contract_id The contract ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of inspection rows for the contract.
 */
export type GetInspectionsForContractRpcArgs = {
  p_contract_id: string;
  p_session_id: string;
};
export type GetInspectionsForContractRpc = (
  args: GetInspectionsForContractRpcArgs,
) => Promise<InspectionsRow[]>;

/**
 * RPC to get all issues for a given contract_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_contract_id The contract ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of issue rows for the contract.
 */
export type GetIssuesForContractRpcArgs = {
  p_contract_id: string;
  p_session_id: string;
};
export type GetIssuesForContractRpc = (
  args: GetIssuesForContractRpcArgs,
) => Promise<IssuesRow[]>;

/**
 * RPC to get all job titles for a given organization_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_organization_id The organization ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of job title rows for the organization.
 */
export type GetJobTitlesByOrganizationRpcArgs = {
  p_organization_id: string;
  p_session_id: string;
};
export type GetJobTitlesByOrganizationRpc = (
  args: GetJobTitlesByOrganizationRpcArgs,
) => Promise<JobTitlesRow[]>;

/**
 * RPC to get all line item entries for a given line_item_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_line_item_id The line item ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of line item entry rows.
 */
export type GetLineItemEntriesRpcArgs = {
  p_line_item_id: string;
  p_session_id: string;
};
export type GetLineItemEntriesRpc = (
  args: GetLineItemEntriesRpcArgs,
) => Promise<LineItemEntriesRow[]>;

/**
 * RPC to get all line item templates for a given organization_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_organization_id The organization ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of line item template rows for the organization.
 */
export type GetLineItemTemplatesByOrganizationRpcArgs = {
  p_organization_id: string;
  p_session_id: string;
};
export type GetLineItemTemplatesByOrganizationRpc = (
  args: GetLineItemTemplatesByOrganizationRpcArgs,
) => Promise<LineItemTemplatesByOrganizationRow[]>;

/**
 * RPC to get all line item templates (global) for the current session.
 * @param args Object containing parameters for the RPC.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of all global line item template rows.
 */
export type GetAllLineItemTemplatesRpcArgs = {
  p_session_id: string;
};
export type GetAllLineItemTemplatesRpc = (
  args: GetAllLineItemTemplatesRpcArgs,
) => Promise<AllLineItemTemplatesRow[]>;

/**
 * RPC to get all organizations for the current session.
 * @param args Object containing parameters for the RPC.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of organization rows.
 */
export type GetOrganizationsRpcArgs = {
  p_session_id: string;
};
export type GetOrganizationsRpc = (
  args: GetOrganizationsRpcArgs,
) => Promise<OrganizationsRow[]>;

/**
 * RPC to get all profiles for a given organization_id and session_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_organization_id The organization ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of profile rows for the organization.
 */
export type GetProfilesByOrganizationRpcArgs = {
  p_organization_id: string;
  p_session_id: string;
};
export type GetProfilesByOrganizationRpc = (
  args: GetProfilesByOrganizationRpcArgs,
) => Promise<ProfilesByOrganizationRow[]>;

/**
 * RPC to get all profiles (global) for the current session.
 * @param args Object containing parameters for the RPC.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of all profile rows.
 */
export type GetAllProfilesRpcArgs = {
  p_session_id: string;
};
export type GetAllProfilesRpc = (
  args: GetAllProfilesRpcArgs,
) => Promise<AllProfilesRow[]>;

/**
 * RPC to get all profiles associated with a contract.
 * @param args Object containing parameters for the RPC.
 * @param args.p_contract_id The contract ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of profile rows associated with the contract.
 */
export type GetProfilesByContractRpcArgs = {
  p_contract_id: string;
  p_session_id: string;
};
export type GetProfilesByContractRpc = (
  args: GetProfilesByContractRpcArgs,
) => Promise<ProfilesByContractRow[]>;

/**
 * RPC to get all avatars for a given profile_id.
 * @param args Object containing parameters for the RPC.
 * @param args.p_profile_id The profile ID.
 * @returns A promise that resolves to an array of avatar rows for the profile.
 */
export type GetAvatarsForProfileRpcArgs = {
  p_profile_id: string;
};
export type GetAvatarsForProfileRpc = (
  args: GetAvatarsForProfileRpcArgs,
) => Promise<AvatarsForProfileRow[]>;

/**
 * RPC to get all contracts associated with a user.
 * @param args Object containing parameters for the RPC.
 * @param args.p_user_id The user ID.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves to an array of user contract rows.
 */
export type GetUserContractsRpcArgs = {
  p_user_id: string;
  p_session_id: string;
};
export type GetUserContractsRpc = (
  args: GetUserContractsRpcArgs,
) => Promise<UserContractsRow[]>;

/**
 * RPC to get dashboard metrics for a user.
 * @param args Object containing parameters for the RPC.
 * @param args.p_user_id The user ID.
 * @returns A promise that resolves to an object containing dashboard metrics.
 */
export type GetDashboardMetricsRpcArgs = {
  p_user_id: string;
};
export type GetDashboardMetricsRpc = (
  args: GetDashboardMetricsRpcArgs,
) => Promise<{
  active_contracts: number;
  total_issues: number;
  total_inspections: number;
}>;

/**
 * RPC to update a profile and its related job title and avatar.
 * @param args Object containing parameters for the RPC.
 * @param args.p_id The ID of the profile to update.
 * @param args.p_full_name Optional new full name.
 * @param args.p_username Optional new username.
 * @param args.p_email Optional new email.
 * @param args.p_phone Optional new phone number.
 * @param args.p_location Optional new location.
 * @param args.p_role Optional new user role.
 * @param args.p_job_title Optional new job title text.
 * @param args.p_is_custom Optional flag if the job title is custom.
 * @param args.p_job_title_id Optional ID of an existing job title.
 * @param args.p_organization_id Optional organization ID.
 * @param args.p_avatar_url Optional new avatar URL.
 * @param args.p_is_preset Optional flag if the avatar is a preset.
 * @param args.p_avatar_id Optional ID of an existing avatar.
 * @param args.p_created_by The user ID of the person making the update.
 * @param args.p_session_id The session ID.
 * @returns A promise that resolves when the update is complete.
 */
export type UpdateProfileFullRpcArgs = {
  p_id: string;
  p_full_name?: string;
  p_username?: string;
  p_email?: string;
  p_phone?: string;
  p_location?: string;
  p_role?: Database["public"]["Enums"]["user_role"];
  p_job_title?: string;
  p_is_custom?: boolean;
  p_job_title_id?: string;
  p_organization_id?: string;
  p_avatar_url?: string;
  p_is_preset?: boolean;
  p_avatar_id?: string;
  p_created_by: string;
  p_session_id: string;
};
export type UpdateProfileFullRpc = (
  args: UpdateProfileFullRpcArgs,
) => Promise<void>;

/**
 * RPC to insert a new profile with all the provided fields.
 *
 * @param args._id The user ID for the profile.
 * @param args._role The role of the user.
 * @param args._full_name The full name of the user.
 * @param args._email The email of the user.
 * @param args._username The username of the user.
 * @param args._phone The phone number of the user.
 * @param args._location The location of the user.
 * @param args._job_title_id The job title ID of the user.
 * @param args._custom_job_title The custom job title if not using a preset.
 * @param args._organization_id The organization ID of the user.
 * @param args._custom_organization_name The custom organization name if not using a preset.
 * @param args._avatar_id The avatar ID of the user.
 * @returns A promise that resolves when the insert is complete.
 */
export type InsertProfileFullRpcArgs = {
  _id: string;
  _role: Database["public"]["Enums"]["user_role"];
  _full_name: string;
  _email: string;
  _username: string;
  _phone?: string;
  _location?: string;
  _job_title_id?: string;
  _custom_job_title?: string;
  _organization_id?: string;
  _custom_organization_name?: string;
  _avatar_id?: string;
};
export type InsertProfileFullRpc = (
  args: InsertProfileFullRpcArgs,
) => Promise<void>;

/**
 * RPC to check if a username is available (not taken).
 * @param args._username The username to check (case-insensitive).
 * @returns A promise that resolves to a boolean: true if available, false if taken.
 */
export type CheckUsernameAvailableRpcArgs = {
  _username: string;
};
export type CheckUsernameAvailableRpc = (
  args: CheckUsernameAvailableRpcArgs,
) => Promise<boolean>;

/**
 * RPC to get an enriched profile by username (case-insensitive).
 * @param args._username The username to look up.
 * @returns A promise that resolves to an enriched profile row or null.
 */
export type GetEnrichedProfileByUsernameRpcArgs = {
  _username: string;
};
export type GetEnrichedProfileByUsernameRpc = (
  args: GetEnrichedProfileByUsernameRpcArgs,
) => Promise<AllProfilesRow | null>;

/**
 * ========== AUTO-GENERATED RPC TYPES FROM database.types.ts & functions.sql ==========
 * These types are generated to match every RPC/function in the database schema.
 * Each type is named as <FunctionName>RpcArgs and <FunctionName>Rpc.
 *
 * NOTE: If a function returns void/undefined, the Promise resolves to void.
 *       If a function returns a single value, the Promise resolves to that value.
 *       If a function returns a row or array of rows, the Promise resolves to the row type(s).
 */

// --- Calculation Functions ---
export type CalculateCyRpcArgs = { length: number; width: number; depth: number };
export type CalculateCyRpc = (args: CalculateCyRpcArgs) => Promise<number>;

export type CalculateSyRpcArgs = { length: number; width: number };
export type CalculateSyRpc = (args: CalculateSyRpcArgs) => Promise<number>;

export type CalculateTonsRpcArgs = { volume: number; density: number };
export type CalculateTonsRpc = (args: CalculateTonsRpcArgs) => Promise<number>;

// --- Admin/Utility Functions ---
export type CheckIsAdminRpcArgs = object;
export type CheckIsAdminRpc = (args: CheckIsAdminRpcArgs) => Promise<boolean>;

// --- Demo Clone/Session Functions ---
export type CloneChangeOrdersForSessionRpcArgs = { session_id: string };
export type CloneChangeOrdersForSessionRpc = (args: CloneChangeOrdersForSessionRpcArgs) => Promise<void>;

export type CloneContractOrganizationsRpcArgs = { session_id: string };
export type CloneContractOrganizationsRpc = (args: CloneContractOrganizationsRpcArgs) => Promise<void>;

export type CloneContractsRpcArgs = { session_id: string };
export type CloneContractsRpc = (args: CloneContractsRpcArgs) => Promise<void>;

export type CloneCrewMembersRpcArgs = { session_id: string };
export type CloneCrewMembersRpc = (args: CloneCrewMembersRpcArgs) => Promise<void>;

export type CloneCrewsRpcArgs = { session_id: string };
export type CloneCrewsRpc = (args: CloneCrewsRpcArgs) => Promise<void>;

export type CloneDailyLogsRpcArgs = { session_id: string };
export type CloneDailyLogsRpc = (args: CloneDailyLogsRpcArgs) => Promise<void>;

export type CloneEquipmentRpcArgs = { session_id: string };
export type CloneEquipmentRpc = (args: CloneEquipmentRpcArgs) => Promise<void>;

export type CloneEquipmentAssignmentsRpcArgs = { session_id: string };
export type CloneEquipmentAssignmentsRpc = (args: CloneEquipmentAssignmentsRpcArgs) => Promise<void>;

export type CloneInspectionsRpcArgs = { session_id: string };
export type CloneInspectionsRpc = (args: CloneInspectionsRpcArgs) => Promise<void>;

export type CloneIssuesRpcArgs = { session_id: string };
export type CloneIssuesRpc = (args: CloneIssuesRpcArgs) => Promise<void>;

export type CloneLineItemCrewAssignmentsRpcArgs = { session_id: string };
export type CloneLineItemCrewAssignmentsRpc = (args: CloneLineItemCrewAssignmentsRpcArgs) => Promise<void>;

export type CloneLineItemEntriesRpcArgs = { session_id: string };
export type CloneLineItemEntriesRpc = (args: CloneLineItemEntriesRpcArgs) => Promise<void>;

export type CloneLineItemEquipmentAssignmentsRpcArgs = { session_id: string };
export type CloneLineItemEquipmentAssignmentsRpc = (args: CloneLineItemEquipmentAssignmentsRpcArgs) => Promise<void>;

export type CloneLineItemTemplatesRpcArgs = { session_id: string };
export type CloneLineItemTemplatesRpc = (args: CloneLineItemTemplatesRpcArgs) => Promise<void>;

export type CloneLineItemsForMapsRpcArgs = { session_id: string };
export type CloneLineItemsForMapsRpc = (args: CloneLineItemsForMapsRpcArgs) => Promise<void>;

export type CloneMapsForWbsRpcArgs = { session_id: string };
export type CloneMapsForWbsRpc = (args: CloneMapsForWbsRpcArgs) => Promise<void>;

export type CloneWbsForContractsRpcArgs = { session_id: string };
export type CloneWbsForContractsRpc = (args: CloneWbsForContractsRpcArgs) => Promise<void>;

export type ExecuteFullDemoCloneRpcArgs = { p_session_id: string };
export type ExecuteFullDemoCloneRpc = (args: ExecuteFullDemoCloneRpcArgs) => Promise<void>;

// --- Delete Functions (all return void) ---
export type DeleteAsphaltTypesRpcArgs = { _id: string };
export type DeleteAsphaltTypesRpc = (args: DeleteAsphaltTypesRpcArgs) => Promise<void>;
export type DeleteAvatarsRpcArgs = { _id: string };
export type DeleteAvatarsRpc = (args: DeleteAvatarsRpcArgs) => Promise<void>;
export type DeleteChangeOrdersRpcArgs = { _id: string };
export type DeleteChangeOrdersRpc = (args: DeleteChangeOrdersRpcArgs) => Promise<void>;
export type DeleteContractsRpcArgs = { _id: string };
export type DeleteContractsRpc = (args: DeleteContractsRpcArgs) => Promise<void>;
export type DeleteCrewMembersRpcArgs = { _id: string };
export type DeleteCrewMembersRpc = (args: DeleteCrewMembersRpcArgs) => Promise<void>;
export type DeleteCrewsRpcArgs = { _id: string };
export type DeleteCrewsRpc = (args: DeleteCrewsRpcArgs) => Promise<void>;
export type DeleteDailyLogsRpcArgs = { _id: string };
export type DeleteDailyLogsRpc = (args: DeleteDailyLogsRpcArgs) => Promise<void>;
export type DeleteDumpTrucksRpcArgs = { _id: string };
export type DeleteDumpTrucksRpc = (args: DeleteDumpTrucksRpcArgs) => Promise<void>;
export type DeleteEquipmentRpcArgs = { _id: string };
export type DeleteEquipmentRpc = (args: DeleteEquipmentRpcArgs) => Promise<void>;
export type DeleteEquipmentAssignmentsRpcArgs = { _id: string };
export type DeleteEquipmentAssignmentsRpc = (args: DeleteEquipmentAssignmentsRpcArgs) => Promise<void>;
export type DeleteEquipmentUsageRpcArgs = { _id: string };
export type DeleteEquipmentUsageRpc = (args: DeleteEquipmentUsageRpcArgs) => Promise<void>;
export type DeleteInspectionsRpcArgs = { _id: string };
export type DeleteInspectionsRpc = (args: DeleteInspectionsRpcArgs) => Promise<void>;
export type DeleteIssuesRpcArgs = { _id: string };
export type DeleteIssuesRpc = (args: DeleteIssuesRpcArgs) => Promise<void>;
export type DeleteJobTitlesRpcArgs = { _id: string };
export type DeleteJobTitlesRpc = (args: DeleteJobTitlesRpcArgs) => Promise<void>;
export type DeleteLineItemEntriesRpcArgs = { _id: string };
export type DeleteLineItemEntriesRpc = (args: DeleteLineItemEntriesRpcArgs) => Promise<void>;
export type DeleteLineItemTemplatesRpcArgs = { _id: string };
export type DeleteLineItemTemplatesRpc = (args: DeleteLineItemTemplatesRpcArgs) => Promise<void>;
export type DeleteLineItemsRpcArgs = { _id: string };
export type DeleteLineItemsRpc = (args: DeleteLineItemsRpcArgs) => Promise<void>;
export type DeleteMapsRpcArgs = { _id: string };
export type DeleteMapsRpc = (args: DeleteMapsRpcArgs) => Promise<void>;
export type DeleteOrganizationsRpcArgs = { _id: string };
export type DeleteOrganizationsRpc = (args: DeleteOrganizationsRpcArgs) => Promise<void>;
export type DeleteProfilesRpcArgs = { _id: string };
export type DeleteProfilesRpc = (args: DeleteProfilesRpcArgs) => Promise<void>;
export type DeleteTackRatesRpcArgs = { _id: string };
export type DeleteTackRatesRpc = (args: DeleteTackRatesRpcArgs) => Promise<void>;
export type DeleteUserContractsRpcArgs = { _user_id: string; _contract_id: string };
export type DeleteUserContractsRpc = (args: DeleteUserContractsRpcArgs) => Promise<void>;
export type DeleteWbsRpcArgs = { _id: string };
export type DeleteWbsRpc = (args: DeleteWbsRpcArgs) => Promise<void>;
