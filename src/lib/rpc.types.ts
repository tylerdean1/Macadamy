// ========== HAND-WRITTEN RPC ROW TYPES & FUNCTION TYPES ==========
import type { Database } from './database.types';

// --- Contract/Team Management ---
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
export type GetContractWithWktRpcArgs = { contract_id: string };
export type GetContractWithWktRpc = (args: GetContractWithWktRpcArgs) => Promise<ContractWithWktRow[]>;

export type WbsWithWktRow = {
  id: string;
  contract_id: string;
  wbs_number: string | null;
  budget: number | null;
  scope: string | null;
  location: string | null;
  coordinates_wkt: string | null;
  session_id: string | null;
};
export type GetWbsWithWktRpcArgs = { contract_id: string; session_id: string };
export type GetWbsWithWktRpc = (args: GetWbsWithWktRpcArgs) => Promise<WbsWithWktRow[]>;

export type MapsWithWktRow = {
  id: string;
  contract_id: string;
  wbs_id: string;
  map_number: string | null;
  location: string | null;
  scope: string | null;
  budget: number | null;
  created_at: string | null;
  updated_at: string | null;
  session_id: string | null;
  coordinates_wkt: string | null;
};
export type GetMapsWithWktRpcArgs = { wbs_id: string; session_id: string };
export type GetMapsWithWktRpc = (args: GetMapsWithWktRpcArgs) => Promise<MapsWithWktRow[]>;

export type LineItemsWithWktRow = {
  id: string;
  contract_id: string;
  wbs_id: string;
  map_id: string;
  item_code: string | null;
  description: string | null;
  quantity: number | null;
  unit_price: number | null;
  unit_measure: Database["public"]["Enums"]["unit_measure_type"] | null;
  reference_doc: string | null;
  template_id: string | null;
  coordinates_wkt: string | null;
  session_id: string | null;
};
export type GetLineItemsWithWktRpcArgs = { contract_id: string; session_id: string };
export type GetLineItemsWithWktRpc = (args: GetLineItemsWithWktRpcArgs) => Promise<LineItemsWithWktRow[]>;

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
export type GetChangeOrdersForLineItemRpcArgs = { line_item_id: string; session_id: string };
export type GetChangeOrdersForLineItemRpc = (args: GetChangeOrdersForLineItemRpcArgs) => Promise<ChangeOrdersRow[]>;

export type ContractOrganizationsRow = {
  organization_id: string;
  notes: string | null;
  role: Database["public"]["Enums"]["organization_role"];
  session_id: string | null;
};
export type GetContractOrganizationsRpcArgs = { contract_id: string; session_id: string };
export type GetContractOrganizationsRpc = (args: GetContractOrganizationsRpcArgs) => Promise<ContractOrganizationsRow[]>;

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
export type GetCrewMembersByOrganizationRpcArgs = { organization_id: string; session_id: string };
export type GetCrewMembersByOrganizationRpc = (args: GetCrewMembersByOrganizationRpcArgs) => Promise<CrewMembersByOrganizationRow[]>;

export type CrewsByOrganizationRow = {
  id: string;
  name: string;
  description: string | null;
  foreman_id: string | null;
  created_by: string;
  session_id: string | null;
};
export type GetCrewsByOrganizationRpcArgs = { organization_id: string; session_id: string };
export type GetCrewsByOrganizationRpc = (args: GetCrewsByOrganizationRpcArgs) => Promise<CrewsByOrganizationRow[]>;

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
export type GetDailyLogsForContractRpcArgs = { contract_id: string; session_id: string };
export type GetDailyLogsForContractRpc = (args: GetDailyLogsForContractRpcArgs) => Promise<DailyLogsRow[]>;

export type EquipmentByOrganizationRow = {
  id: string;
  user_defined_id: string;
  name: string;
  description: string | null;
  operator_id: string | null;
  session_id: string | null;
};
export type GetEquipmentByOrganizationRpcArgs = { organization_id: string; session_id: string };
export type GetEquipmentByOrganizationRpc = (args: GetEquipmentByOrganizationRpcArgs) => Promise<EquipmentByOrganizationRow[]>;

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
export type GetEquipmentAssignmentsRpcArgs = { equipment_id: string; session_id: string };
export type GetEquipmentAssignmentsRpc = (args: GetEquipmentAssignmentsRpcArgs) => Promise<EquipmentAssignmentsRow[]>;

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
export type GetEquipmentUsageRpcArgs = { equipment_id: string; session_id: string };
export type GetEquipmentUsageRpc = (args: GetEquipmentUsageRpcArgs) => Promise<EquipmentUsageRow[]>;

export type InspectionsRow = {
  id: string;
  wbs_id: string;
  map_id: string;
  line_item_id: string;
  name: string | null;
  description: string | null;
  status: string | null;
  scheduled_date: string | null;
  completed_date: string | null;
  created_by: string;
  session_id: string | null;
};
export type GetInspectionsForContractRpcArgs = { contract_id: string; session_id: string };
export type GetInspectionsForContractRpc = (args: GetInspectionsForContractRpcArgs) => Promise<InspectionsRow[]>;

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
export type GetIssuesForContractRpcArgs = { contract_id: string; session_id: string };
export type GetIssuesForContractRpc = (args: GetIssuesForContractRpcArgs) => Promise<IssuesRow[]>;

export type JobTitlesRow = {
  id: string; // Added id based on database.types.ts, assuming it's primary key and useful
  title: string;
  is_custom: boolean | null; // Updated to allow null
  organization_id: string | null; // Added organization_id based on database.types.ts
  session_id: string | null;
};
export type GetJobTitlesByOrganizationRpcArgs = Record<string, never>;
export type GetJobTitlesByOrganizationRpc = () => Promise<JobTitlesRow[]>;

export type LineItemEntriesRow = {
  id: string;
  wbs_id: string;
  map_id: string;
  line_item_id: string;
  template_id: string;
  entered_by: string;
  entry_date: string;
  value: number;
  notes: string | null;
  session_id: string | null;
};
export type GetLineItemEntriesRpcArgs = { line_item_id: string; session_id: string };
export type GetLineItemEntriesRpc = (args: GetLineItemEntriesRpcArgs) => Promise<LineItemEntriesRow[]>;

export type LineItemTemplatesByOrganizationRow = {
  id: string;
  name: string;
  description: string | null;
  unit_type: Database["public"]["Enums"]["unit_measure_type"];
  formula: Record<string, unknown>;
  instructions: string | null;
  session_id: string | null;
};
export type GetLineItemTemplatesByOrganizationRpcArgs = { organization_id: string; session_id: string };
export type GetLineItemTemplatesByOrganizationRpc = (args: GetLineItemTemplatesByOrganizationRpcArgs) => Promise<LineItemTemplatesByOrganizationRow[]>;

export type AllLineItemTemplatesRow = {
  id: string;
  name: string;
  description: string;
  unit_type: Database["public"]["Enums"]["unit_measure_type"];
  formula: Record<string, unknown>;
  instructions: string;
  session_id: string | null;
};
export type GetAllLineItemTemplatesRpcArgs = { session_id: string };
export type GetAllLineItemTemplatesRpc = (args: GetAllLineItemTemplatesRpcArgs) => Promise<AllLineItemTemplatesRow[]>;

export type OrganizationsRow = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  session_id: string | null;
};
export type GetOrganizationsRpcArgs = Record<string, never>;
export type GetOrganizationsRpc = () => Promise<OrganizationsRow[]>;

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
export type GetProfilesByOrganizationRpcArgs = { organization_id: string; session_id: string };
export type GetProfilesByOrganizationRpc = (args: GetProfilesByOrganizationRpcArgs) => Promise<ProfilesByOrganizationRow[]>;

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
export type GetAllProfilesRpcArgs = { session_id: string };
export type GetAllProfilesRpc = (args: GetAllProfilesRpcArgs) => Promise<AllProfilesRow[]>;

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
export type GetProfilesByContractRpcArgs = { contract_id: string; session_id: string };
export type GetProfilesByContractRpc = (args: GetProfilesByContractRpcArgs) => Promise<ProfilesByContractRow[]>;

export type AvatarsForProfileRow = {
  id: string;
  url: string;
  is_preset: boolean;
  profile_id?: string | null;
  session_id: string | null;
};
export type GetAvatarsForProfileRpcArgs = { _profile_id: string };
export type GetAvatarsForProfileRpc = (args: GetAvatarsForProfileRpcArgs) => Promise<AvatarsForProfileRow[]>;

export type UserContractsRow = {
  contract_id: string;
  role: Database["public"]["Enums"]["user_role"];
  session_id: string | null;
};
export type GetUserContractsRpcArgs = { user_id: string; session_id: string };
export type GetUserContractsRpc = (args: GetUserContractsRpcArgs) => Promise<UserContractsRow[]>;

// Added for get_enriched_user_contracts RPC
export type EnrichedUserContractRow = {
  id: string; // uuid
  title: string | null; // text
  description: string | null; // text
  location: string | null; // text
  start_date: string | null; // date
  end_date: string | null; // date
  created_by: string | null; // uuid
  created_at: string | null; // timestamp with time zone
  updated_at: string | null; // timestamp with time zone
  budget: number | null; // numeric
  status: Database["public"]["Enums"]["contract_status"] | null;
  coordinates: Database["public"]["Tables"]["contracts"]["Row"]["coordinates"]; // Json | null
  user_contract_role: Database["public"]["Enums"]["user_role"] | null;
  session_id: string | null; // uuid
};

export type GetEnrichedUserContractsRpcArgs = { _user_id: string };
export type GetEnrichedUserContractsRpc = (args: GetEnrichedUserContractsRpcArgs) => Promise<EnrichedUserContractRow[]>;

// --- Utility/Enum/Other RPCs ---
export type CheckUsernameAvailableRpcArgs = { username: string };
export type CheckUsernameAvailableRpc = (args: CheckUsernameAvailableRpcArgs) => Promise<boolean>;

export type GetDashboardMetricsRpcArgs = { _user_id: string };
export type GetDashboardMetricsRpc = (args: GetDashboardMetricsRpcArgs) => Promise<{ active_contracts: number; total_issues: number; total_inspections: number }>;


// --- Delete/Write/Mutate RPCs (all return void) ---
export type DeleteContractsRpcArgs = { id: string };
export type DeleteContractsRpc = (args: DeleteContractsRpcArgs) => Promise<void>;
export type DeleteCrewsRpcArgs = { id: string };
export type DeleteCrewsRpc = (args: DeleteCrewsRpcArgs) => Promise<void>;
export type DeleteDailyLogsRpcArgs = { id: string };
export type DeleteDailyLogsRpc = (args: DeleteDailyLogsRpcArgs) => Promise<void>;
export type DeleteEquipmentRpcArgs = { id: string };
export type DeleteEquipmentRpc = (args: DeleteEquipmentRpcArgs) => Promise<void>;
export type DeleteEquipmentAssignmentsRpcArgs = { id: string };
export type DeleteEquipmentAssignmentsRpc = (args: DeleteEquipmentAssignmentsRpcArgs) => Promise<void>;
export type DeleteEquipmentUsageRpcArgs = { id: string };
export type DeleteEquipmentUsageRpc = (args: DeleteEquipmentUsageRpcArgs) => Promise<void>;
export type DeleteInspectionsRpcArgs = { id: string };
export type DeleteInspectionsRpc = (args: DeleteInspectionsRpcArgs) => Promise<void>;
export type DeleteIssuesRpcArgs = { id: string };
export type DeleteIssuesRpc = (args: DeleteIssuesRpcArgs) => Promise<void>;
export type DeleteJobTitlesRpcArgs = { id: string };
export type DeleteJobTitlesRpc = (args: DeleteJobTitlesRpcArgs) => Promise<void>;
export type DeleteLineItemEntriesRpcArgs = { id: string };
export type DeleteLineItemEntriesRpc = (args: DeleteLineItemEntriesRpcArgs) => Promise<void>;
export type DeleteLineItemTemplatesRpcArgs = { id: string };
export type DeleteLineItemTemplatesRpc = (args: DeleteLineItemTemplatesRpcArgs) => Promise<void>;
export type DeleteLineItemsRpcArgs = { id: string };
export type DeleteLineItemsRpc = (args: DeleteLineItemsRpcArgs) => Promise<void>;
export type DeleteMapsRpcArgs = { id: string };
export type DeleteMapsRpc = (args: DeleteMapsRpcArgs) => Promise<void>;
export type DeleteOrganizationsRpcArgs = { id: string };
export type DeleteOrganizationsRpc = (args: DeleteOrganizationsRpcArgs) => Promise<void>;
export type DeleteProfilesRpcArgs = { id: string };
export type DeleteProfilesRpc = (args: DeleteProfilesRpcArgs) => Promise<void>;
export type DeleteUserContractsRpcArgs = { user_id: string; contract_id: string };
export type DeleteUserContractsRpc = (args: DeleteUserContractsRpcArgs) => Promise<void>;
export type DeleteWbsRpcArgs = { id: string };
export type DeleteWbsRpc = (args: DeleteWbsRpcArgs) => Promise<void>;

// --- Additional Delete RPCs ---
export type DeleteAsphaltTypeRpcArgs = { id: string };
export type DeleteAsphaltTypeRpc = (args: DeleteAsphaltTypeRpcArgs) => Promise<void>;

export type DeleteAvatarsRpcArgs = { id: string };
export type DeleteAvatarsRpc = (args: DeleteAvatarsRpcArgs) => Promise<void>;

export type DeleteChangeOrderRpcArgs = { id: string };
export type DeleteChangeOrderRpc = (args: DeleteChangeOrderRpcArgs) => Promise<void>;

export type DeleteContractOrganizationRpcArgs = { id: string };
export type DeleteContractOrganizationRpc = (args: DeleteContractOrganizationRpcArgs) => Promise<void>;

export type DeleteCrewRpcArgs = { id: string };
export type DeleteCrewRpc = (args: DeleteCrewRpcArgs) => Promise<void>;

export type DeleteCrewMemberRpcArgs = { id: string };
export type DeleteCrewMemberRpc = (args: DeleteCrewMemberRpcArgs) => Promise<void>;


export type DeleteDumpTruckRpcArgs = { id: string };
export type DeleteDumpTruckRpc = (args: DeleteDumpTruckRpcArgs) => Promise<void>;

export type DeleteEquipmentAssignmentRpcArgs = { id: string };
export type DeleteEquipmentAssignmentRpc = (args: DeleteEquipmentAssignmentRpcArgs) => Promise<void>;

export type DeleteTackRatesRpcArgs = { id: string };
export type DeleteTackRatesRpc = (args: DeleteTackRatesRpcArgs) => Promise<void>;

// --- Insert RPCs ---
export type InsertAsphaltTypeRpcArgs = {
  name: string;
  compaction_min?: number;
  jmf_temp_max?: number;
  jmf_temp_min?: number;
  lift_depth_inches?: number;
  notes?: string;
  target_spread_rate_lbs_per_sy?: number;
};
export type InsertAsphaltTypeRpc = (args: InsertAsphaltTypeRpcArgs) => Promise<string>;

export type InsertAvatarRpcArgs = {
  id: string;
  name: string;
  url: string;
  is_preset?: boolean;
  session_id?: string;
};
export type InsertAvatarRpc = (args: InsertAvatarRpcArgs) => Promise<string>;

export type InsertChangeOrderRpcArgs = {
  contract_id: string;
  line_item_id?: string;
  title?: string;
  description?: string;
  attachments?: string[];
  new_quantity?: number;
  new_unit_price?: number;
  status?: Database["public"]["Enums"]["change_order_status"];
  submitted_date?: string;
  created_by?: string;
  session_id?: string;
};
export type InsertChangeOrderRpc = (args: InsertChangeOrderRpcArgs) => Promise<string>;

export type InsertContractOrganizationRpcArgs = {
  contract_id: string;
  organization_id: string;
  created_by: string;
  role?: Database["public"]["Enums"]["organization_role"];
  notes?: string;
  session_id?: string;
};
export type InsertContractOrganizationRpc = (args: InsertContractOrganizationRpcArgs) => Promise<string>;

export type InsertCrewRpcArgs = {
  name: string;
  organization_id: string;
  created_by: string;
  description?: string;
  foreman_id?: string;
  session_id?: string;
};
export type InsertCrewRpc = (args: InsertCrewRpcArgs) => Promise<string>;

export type InsertCrewMemberRpcArgs = {
  created_by: string;
  crew_id: string;
  profile_id: string;
  role?: string;
  location_notes?: string;
  organization_id?: string;
  map_location_id?: string;
  session_id?: string;
  assigned_at?: string;
};
export type InsertCrewMemberRpc = (args: InsertCrewMemberRpcArgs) => Promise<string>;

export type InsertJobTitleRpcArgs = {
  title: string; // Corrected: Supabase RPC likely expects direct param names, not prefixed with _
  is_custom?: boolean; // Optional as per typical DB schema defaults
  organization_id?: string; // Optional
  session_id?: string; // Optional
  // Add other fields if your insert_job_title RPC function expects them
};
export type InsertJobTitleRpc = (args: InsertJobTitleRpcArgs) => Promise<JobTitlesRow[]>; // Assuming it returns the new/found job title(s)

export type InsertDailyLogRpcArgs = {
  contract_id: string;
  created_by: string;
  log_date: string;
  // ... other fields for daily log ...
  session_id?: string;
};
export type InsertDailyLogRpc = (args: InsertDailyLogRpcArgs) => Promise<string>;

export type InsertDumpTruckRpcArgs = {
  payload_capacity_tons: number;
  truck_identifier: string;
  axle_count?: number;
  bed_height?: number;
  bed_length?: number;
  bed_volume?: number;
  bed_width?: number;
  contract_id?: string;
  equipment_id?: string;
  hoist_bottom?: number;
  hoist_top?: number;
  hoist_width?: number;
  notes?: string;
  weight_capacity_tons?: number;
};
export type InsertDumpTruckRpc = (args: InsertDumpTruckRpcArgs) => Promise<string>;

export type InsertEquipmentRpcArgs = {
  name: string;
  created_by?: string;
  operator_id?: string;
  organization_id?: string;
  session_id?: string;
  standard_pay_rate?: number;
  standard_pay_unit?: Database["public"]["Enums"]["pay_rate_unit"];
  description?: string;
  user_defined_id?: string;
};
export type InsertEquipmentRpc = (args: InsertEquipmentRpcArgs) => Promise<string>;

export type InsertEquipmentUsageRpcArgs = {
  hours_used: number;
  contract_id?: string;
  created_by?: string;
  equipment_id?: string;
  line_item_id?: string;
  map_id?: string;
  operator_id?: string;
  session_id?: string;
  notes?: string;
  updated_by?: string;
  usage_date?: string;
  wbs_id?: string;
};
export type InsertEquipmentUsageRpc = (args: InsertEquipmentUsageRpcArgs) => Promise<string>;

export type InsertInspectionRpcArgs = {
  contract_id: string;
  name: string;
  description?: string;
  created_by?: string;
  line_item_id?: string;
  map_id?: string;
  pdf_url?: string;
  photo_urls?: string[];
  session_id?: string;
  wbs_id?: string;
};
export type InsertInspectionRpc = (args: InsertInspectionRpcArgs) => Promise<string>;

export type InsertIssueRpcArgs = {
  title: string;
  description: string;
  status: string;
  priority?: Database["public"]["Enums"]["priority"];
  assigned_to?: string;
  contract_id?: string;
  created_by?: string;
  equipment_id?: string;
  line_item_id?: string;
  map_id?: string;
  session_id?: string;
  photo_urls?: string[];
  resolution?: string;
  due_date?: string;
  updated_at?: string;
  updated_by?: string;
  wbs_id?: string;
};
export type InsertIssueRpc = (args: InsertIssueRpcArgs) => Promise<string>;

export type InsertLineItemRpcArgs = {
  description: string;
  line_code: string;
  wbs_id: string;
  unit_measure: Database["public"]["Enums"]["unit_measure_type"];
  quantity: number;
  unit_price: number;
  contract_id?: string;
  map_id?: string;
  reference_doc?: string;
  template_id?: string;
  session_id?: string;
  coordinates?: string;
};
export type InsertLineItemRpc = (args: InsertLineItemRpcArgs) => Promise<string>;

export type InsertLineItemEntryRpcArgs = {
  contract_id: string;
  line_item_id: string;
  map_id: string;
  input_variables: Record<string, unknown>;
  wbs_id: string;
  computed_output?: number;
  notes?: string;
  output_unit?: Database["public"]["Enums"]["unit_measure_type"];
  entered_by?: string;
};
export type InsertLineItemEntryRpc = (args: InsertLineItemEntryRpcArgs) => Promise<string>;

export type InsertLineItemTemplateRpcArgs = {
  id: string;
  name?: string;
  description?: string;
  formula?: Record<string, unknown>;
  instructions?: string;
  created_by?: string;
  organization_id?: string;
  output_unit?: Database["public"]["Enums"]["unit_measure_type"];
  session_id?: string;
};
export type InsertLineItemTemplateRpc = (args: InsertLineItemTemplateRpcArgs) => Promise<string>;

export type InsertMapRpcArgs = {
  map_number: string;
  wbs_id: string;
  location?: string;
  budget?: number;
  scope?: string;
  coordinates?: string;
  contract_id?: string;
  session_id?: string;
};
export type InsertMapRpc = (args: InsertMapRpcArgs) => Promise<string>;

export type InsertOrganizationRpcArgs = {
  name: string;
  created_by: string;
  address?: string;
  phone?: string;
  website?: string;
  session_id?: string;
};
export type InsertOrganizationRpc = (args: InsertOrganizationRpcArgs) => Promise<string>;

export type InsertProfileRpcArgs = {
  id: string;
  full_name: string;
  email?: string;
  username?: string;
  phone?: string;
  avatar_id?: string;
  job_title_id?: string;
  location?: string;
  role?: Database["public"]["Enums"]["user_role"];
  organization_id?: string;
  session_id?: string;
};
export type InsertProfileRpc = (args: InsertProfileRpcArgs) => Promise<string>;

export type InsertProfileFullRpcArgs = {
  role: Database["public"]["Enums"]["user_role"];
  full_name: string;
  email: string;
  username: string;
  id?: string;
  phone?: string;
  location?: string;
  job_title_id?: string;
  custom_job_title?: string;
  organization_id?: string;
  custom_organization_name?: string;
  avatar_id?: string;
};
export type InsertProfileFullRpc = (args: InsertProfileFullRpcArgs) => Promise<string>;

export type InsertUserContractRpcArgs = {
  user_id: string;
  contract_id: string;
  role?: Database["public"]["Enums"]["user_role"];
  session_id?: string;
};
export type InsertUserContractRpc = (args: InsertUserContractRpcArgs) => Promise<void>;

export type InsertWbsRpcArgs = {
  wbs_number: string;
  contract_id: string;
  location?: string;
  budget?: number;
  scope?: string;
  coordinates?: string;
  session_id?: string;
};
export type InsertWbsRpc = (args: InsertWbsRpcArgs) => Promise<string>;


// --- Update RPCs ---
export type UpdateContractRpcArgs = {
  _id: string;
  _title?: string;
  _location?: string;
  _start_date?: string;
  _end_date?: string;
  _status?: Database["public"]["Enums"]["contract_status"];
  _budget?: number;
  _description?: string;
  _coordinates?: unknown;
};
export type UpdateContractRpc = (args: UpdateContractRpcArgs) => Promise<void>;

export type UpdateProfileRpcArgs = {
  _id: string;
  _full_name?: string;
  _email?: string;
  _username?: string;
  _phone?: string;
  _avatar_id?: string;
  _job_title_id?: string;
  _location?: string;
  _role?: Database["public"]["Enums"]["user_role"];
  _organization_id?: string;
  _session_id?: string;
};
export type UpdateProfileRpc = (args: UpdateProfileRpcArgs) => Promise<void>;
