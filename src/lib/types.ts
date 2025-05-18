import type { Database } from "./database.types";
import type { UserRole } from "./enums";

/**
 * General Utilities
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Types for Tables
 */

// Asphalt Types Table
export type AsphaltTypes = Database["public"]["Tables"]["asphalt_types"]["Row"];
export type AsphaltTypesInsert =
  Database["public"]["Tables"]["asphalt_types"]["Insert"];
export type AsphaltTypesUpdate =
  Database["public"]["Tables"]["asphalt_types"]["Update"];

// Avatars Table
export type Avatars = Database["public"]["Tables"]["avatars"]["Row"];
export type AvatarsInsert = Database["public"]["Tables"]["avatars"]["Insert"];
export type AvatarsUpdate = Database["public"]["Tables"]["avatars"]["Update"];

// Change Orders Table
export type ChangeOrders = Database["public"]["Tables"]["change_orders"]["Row"];
export type ChangeOrdersInsert =
  Database["public"]["Tables"]["change_orders"]["Insert"];
export type ChangeOrdersUpdate =
  Database["public"]["Tables"]["change_orders"]["Update"];

// Contract Organizations Table
export type ContractOrganizations =
  Database["public"]["Tables"]["contract_organizations"]["Row"];
export type ContractOrganizationsInsert =
  Database["public"]["Tables"]["contract_organizations"]["Insert"];
export type ContractOrganizationsUpdate =
  Database["public"]["Tables"]["contract_organizations"]["Update"];

// Contracts Table
export type Contracts = Database["public"]["Tables"]["contracts"]["Row"];
export type ContractsInsert =
  Database["public"]["Tables"]["contracts"]["Insert"];
export type ContractsUpdate =
  Database["public"]["Tables"]["contracts"]["Update"];

// Crew Members Table
export type CrewMembers = Database["public"]["Tables"]["crew_members"]["Row"];
export type CrewMembersInsert =
  Database["public"]["Tables"]["crew_members"]["Insert"];
export type CrewMembersUpdate =
  Database["public"]["Tables"]["crew_members"]["Update"];

// Crews Table
export type Crews = Database["public"]["Tables"]["crews"]["Row"];
export type CrewsInsert = Database["public"]["Tables"]["crews"]["Insert"];
export type CrewsUpdate = Database["public"]["Tables"]["crews"]["Update"];

// Daily Logs Table
export type DailyLogs = Database["public"]["Tables"]["daily_logs"]["Row"];
export type DailyLogsInsert =
  Database["public"]["Tables"]["daily_logs"]["Insert"];
export type DailyLogsUpdate =
  Database["public"]["Tables"]["daily_logs"]["Update"];

// Dump Trucks Table
export type DumpTrucks = Database["public"]["Tables"]["dump_trucks"]["Row"];
export type DumpTrucksInsert =
  Database["public"]["Tables"]["dump_trucks"]["Insert"];
export type DumpTrucksUpdate =
  Database["public"]["Tables"]["dump_trucks"]["Update"];

// Equipment Table
export type Equipment = Database["public"]["Tables"]["equipment"]["Row"];
export type EquipmentInsert =
  Database["public"]["Tables"]["equipment"]["Insert"];
export type EquipmentUpdate =
  Database["public"]["Tables"]["equipment"]["Update"];

// Equipment Assignments Table
export type EquipmentAssignments =
  Database["public"]["Tables"]["equipment_assignments"]["Row"];
export type EquipmentAssignmentsInsert =
  Database["public"]["Tables"]["equipment_assignments"]["Insert"];
export type EquipmentAssignmentsUpdate =
  Database["public"]["Tables"]["equipment_assignments"]["Update"];

// Equipment Usage Table
export type EquipmentUsage =
  Database["public"]["Tables"]["equipment_usage"]["Row"];
export type EquipmentUsageInsert =
  Database["public"]["Tables"]["equipment_usage"]["Insert"];
export type EquipmentUsageUpdate =
  Database["public"]["Tables"]["equipment_usage"]["Update"];

// Inspections Table
export type Inspections = Database["public"]["Tables"]["inspections"]["Row"];
export type InspectionsInsert =
  Database["public"]["Tables"]["inspections"]["Insert"];
export type InspectionsUpdate =
  Database["public"]["Tables"]["inspections"]["Update"];

// Issues Table
export type Issues = Database["public"]["Tables"]["issues"]["Row"];
export type IssuesInsert = Database["public"]["Tables"]["issues"]["Insert"];
export type IssuesUpdate = Database["public"]["Tables"]["issues"]["Update"];

// Job Titles Table
export type JobTitles = Database["public"]["Tables"]["job_titles"]["Row"];
export type JobTitlesInsert =
  Database["public"]["Tables"]["job_titles"]["Insert"];
export type JobTitlesUpdate =
  Database["public"]["Tables"]["job_titles"]["Update"];

// Line Item Entries Table
export type LineItemEntries =
  Database["public"]["Tables"]["line_item_entries"]["Row"];
export type LineItemEntriesInsert =
  Database["public"]["Tables"]["line_item_entries"]["Insert"];
export type LineItemEntriesUpdate =
  Database["public"]["Tables"]["line_item_entries"]["Update"];

// Line Item Templates Table
export type LineItemTemplates =
  Database["public"]["Tables"]["line_item_templates"]["Row"];
export type LineItemTemplatesInsert =
  Database["public"]["Tables"]["line_item_templates"]["Insert"];
export type LineItemTemplatesUpdate =
  Database["public"]["Tables"]["line_item_templates"]["Update"];

// Line Items Table
export type LineItems = Database["public"]["Tables"]["line_items"]["Row"];
export type LineItemsInsert =
  Database["public"]["Tables"]["line_items"]["Insert"];
export type LineItemsUpdate =
  Database["public"]["Tables"]["line_items"]["Update"];

// Maps Table
export type Maps = Database["public"]["Tables"]["maps"]["Row"];
export type MapsInsert = Database["public"]["Tables"]["maps"]["Insert"];
export type MapsUpdate = Database["public"]["Tables"]["maps"]["Update"];

// Organizations Table
export type Organizations =
  Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationsInsert =
  Database["public"]["Tables"]["organizations"]["Insert"];
export type OrganizationsUpdate =
  Database["public"]["Tables"]["organizations"]["Update"];

// Profiles Table
export type Profiles = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfilesInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfilesUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// Spatial Ref Sys Table
export type SpatialRefSys =
  Database["public"]["Tables"]["spatial_ref_sys"]["Row"];
export type SpatialRefSysInsert =
  Database["public"]["Tables"]["spatial_ref_sys"]["Insert"];
export type SpatialRefSysUpdate =
  Database["public"]["Tables"]["spatial_ref_sys"]["Update"];

// Tack Rates Table
export type TackRates = Database["public"]["Tables"]["tack_rates"]["Row"];
export type TackRatesInsert =
  Database["public"]["Tables"]["tack_rates"]["Insert"];
export type TackRatesUpdate =
  Database["public"]["Tables"]["tack_rates"]["Update"];

// User Contracts Table
export type UserContracts =
  Database["public"]["Tables"]["user_contracts"]["Row"];
export type UserContractsInsert =
  Database["public"]["Tables"]["user_contracts"]["Insert"];
export type UserContractsUpdate =
  Database["public"]["Tables"]["user_contracts"]["Update"];

// WBS Table
export type WBS = Database["public"]["Tables"]["wbs"]["Row"];
export type WBSInsert = Database["public"]["Tables"]["wbs"]["Insert"];
export type WBSUpdate = Database["public"]["Tables"]["wbs"]["Update"];

/**
 * Map Location Types
 */

// Define the type for different geometry data
export type GeometryType = "Point" | "LineString" | "Polygon";

// Import the formula types
import type { CalculatorTemplate } from "./formula.types";

export interface GeometryData {
  type: GeometryType; // Specifies the type: Point, LineString, or Polygon
  coordinates: number[] | number[][] | number[][][]; // Adjusted to handle different geometry types
}

/**
 * Formula Definition for Line Item Templates
 */
export interface FormulaDef {
  id: string;
  name: string | null;
  description: string | null;
  output_unit: string | null; // Unit measure enum
  unit_type: string | null; // Unit measure enum
  formula: CalculatorTemplate | null; // Using the CalculatorTemplate from formula.types.ts
  instructions: string | null;
}

// Main interface for map locations
export interface MapLocation {
  id: string;
  map_number: string;
  location_description: string | null;
  coordinates?: GeometryData | null; // Represents the geography data for the location
  line_items: LineItems[]; // Assuming LineItems type exists
  contractTotal: number;
  amountPaid: number;
  progress: number;
}

export interface ProcessedMap {
  id: string;
  map_number: string;
  location_description: string | null;
  coordinates: GeometryData | null;
  scope: string | null;
  budget: number | null; // From the database directly
  line_items: {
    id: string;
    line_code: string;
    description: string;
    unit_measure: string;
    quantity: number;
    unit_price: number;
    reference_doc: string | null;
    map_id: string | null;
    template_id: string | null;
    coordinates: GeometryData | null;
    total_cost: number;
    amount_paid: number;
    formula?: FormulaDef | null;
  }[];
  contractTotal: number; // Calculated total from line items
  amountPaid: number;
  progress: number;
}

export interface WBSGroup {
  id: string;
  wbs_number: string; // Equivalent to wbs_number in the database
  wbs: string; // Alias for wbs_number to maintain compatibility
  description: string; // Equivalent to scope in the database
  location: string | null;
  coordinates: GeometryData | null;
  budget: number | null; // From the database
  scope: string | null; // Detailed scope information
  maps: ProcessedMap[];
  contractTotal: number; // Calculated from line items
  amountPaid: number;
  progress: number;
}

/**
 * Other Structured Types
 */
// Interface for the organizations field
export interface Organization {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
}

// Interface for the job_titles field
export interface JobTitle {
  id: string;
  title: string;
  is_custom: boolean | null;
}

export interface Profile {
  id: string;
  user_role: UserRole;
  full_name: string;
  email: string;
  username: string | null;
  phone: string | null;
  location: string | null;
  avatar_id: string | null;
  avatar_url: string | null; // ✅ Flattened and usable in all components
  organization_id: string | null;
  job_title_id: string | null;

  organizations?: {
    name: string;
    address: string | null;
    phone: string | null;
    website: string | null;
  } | null;

  job_titles?: {
    title: string;
    is_custom: boolean | null;
  } | null;

  is_demo_user?: boolean;
  session_id?: string | null;
}

/**
 * Specific Interfaces for Components
 */
export interface EditForm {
  avatar_id: string | null;
  organization_id: string;
  job_title_id: string;
  address: string;
  phone: string;
  email: string;
  custom_job_title: string;
}

export interface EditableWbsSection {
  id: string;
  wbs_number: string;
  description: string;
  coordinates?: string;
}

// Interface for cropping coordinates
export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}
export type WbsClean = Omit<WBS, "wbs_number" | "description"> & {
  wbs_number: string;
  description: string;
};

export type MapsClean = Omit<Maps, "map_number" | "location_description"> & {
  map_number: string;
  location_description: string;
};

export type LineItemsClean = Omit<LineItems, "line_code" | "description"> & {
  line_code: string;
  description: string;
};

export interface ContractRolePermission {
  role: 'Admin' | 'Contractor' | 'Engineer' | 'Project Manager' | 'Inspector';
  can_view: boolean;
  can_edit: boolean;
  can_approve: boolean;
  can_delete: boolean;
  can_create: boolean;
  can_manage_users: boolean;
}

export interface Calculation {
  id: string;
  line_item_id: string;
  template_id: string;
  values: Record<string, number>;
  results: Record<string, number>;
  created_at?: string;
  created_by?: string;
}