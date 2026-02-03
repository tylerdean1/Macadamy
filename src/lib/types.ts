import type { Database } from "./database.types";
export type { Database } from "./database.types";

/**
 * Convenient type aliases for database enums
 */
export type GeneralStatus = Database["public"]["Enums"]["general_status"];
export type ProjectStatus = Database["public"]["Enums"]["project_status"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type UnitMeasure = Database["public"]["Enums"]["unit_measure"];
export type OrgRole = Database["public"]["Enums"]["org_role"];
export type UserRoleType = Database["public"]["Enums"]["user_role_type"];
export type EquipmentType = Database["public"]["Enums"]["equipment_type"];
export type DocumentType = Database["public"]["Enums"]["document_type"];
export type CertificationType = Database["public"]["Enums"]["certification_type"];
export type CommitmentType = Database["public"]["Enums"]["commitment_type"];
export type IssueType = Database["public"]["Enums"]["issue_type"];
export type NotificationCategory = Database["public"]["Enums"]["notification_category"];
export type WorkflowName = Database["public"]["Enums"]["workflow_name"];

/**
 * Convenient option arrays using database constants
 */
import { Constants } from "./database.types";

export const GENERAL_STATUS_OPTIONS = Constants.public.Enums.general_status;
export const PROJECT_STATUS_OPTIONS = Constants.public.Enums.project_status;
export const TASK_STATUS_OPTIONS = Constants.public.Enums.task_status;
export const UNIT_MEASURE_OPTIONS = Constants.public.Enums.unit_measure;
export const ORG_ROLE_OPTIONS = Constants.public.Enums.org_role;
export const USER_ROLE_TYPE_OPTIONS = Constants.public.Enums.user_role_type;
export const EQUIPMENT_TYPE_OPTIONS = Constants.public.Enums.equipment_type;
export const DOCUMENT_TYPE_OPTIONS = Constants.public.Enums.document_type;
export const CERTIFICATION_TYPE_OPTIONS = Constants.public.Enums.certification_type;
export const COMMITMENT_TYPE_OPTIONS = Constants.public.Enums.commitment_type;
export const ISSUE_TYPE_OPTIONS = Constants.public.Enums.issue_type;
export const NOTIFICATION_CATEGORY_OPTIONS = Constants.public.Enums.notification_category;
export const WORKFLOW_NAME_OPTIONS = Constants.public.Enums.workflow_name;

/**
 * Enum utility functions
 */
export function getEnumOptions<T extends string>(enumArray: readonly T[]): Array<{ value: T; label: T }> {
  return enumArray.map(value => ({ value, label: value }));
}

export function isValidEnumValue<T extends string>(value: unknown, enumArray: readonly T[]): value is T {
  return typeof value === 'string' && enumArray.includes(value as T);
}

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
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

export type TableRow<T extends keyof Tables> = Tables[T]['Row'];
export type TableInsert<T extends keyof Tables> = Tables[T]['Insert'];
export type TableUpdate<T extends keyof Tables> = Tables[T]['Update'];

/**
 * Specific table type aliases for commonly used tables
 */
export type Issues = TableRow<'issues'>;
export type IssuesInsert = TableInsert<'issues'>;
export type IssuesUpdate = TableUpdate<'issues'>;

export type ChangeOrders = TableRow<'change_orders'>;
export type ChangeOrdersInsert = TableInsert<'change_orders'>;
export type ChangeOrdersUpdate = TableUpdate<'change_orders'>;

export type Inspections = TableRow<'inspections'>;
export type InspectionsInsert = TableInsert<'inspections'>;
export type InspectionsUpdate = TableUpdate<'inspections'>;

export type LineItems = TableRow<'line_items'>;
export type LineItemsInsert = TableInsert<'line_items'>;
export type LineItemsUpdate = TableUpdate<'line_items'>;

export type Maps = TableRow<'maps'>;
export type MapsInsert = TableInsert<'maps'>;
export type MapsUpdate = TableUpdate<'maps'>;

export type WBS = TableRow<'wbs'>;
export type WBSInsert = TableInsert<'wbs'>;
export type WBSUpdate = TableUpdate<'wbs'>;

// Add these exports for compatibility
export type {
  ContractWithWktRow,
  WbsWithWktRow,
  LineItemsWithWktRow,
  MapsWithWktRow,
  EnrichedProfileRow,
  EnrichedProfile,
  EquipmentRow,
  OrganizationRow,
  JobTitleRow,
  UpdateProfileRpcArgs,
  InsertJobTitleRpcArgs,
  ProfilesByContractRow,
  Inspection,
  EquipmentUsage,
  EquipmentItem,
  LaborRecords
} from './rpc.types';

// Add missing types that are referenced in the codebase
export type Avatars = TableRow<'avatars'>;
export type Projects = TableRow<'projects'>;
export type Profiles = TableRow<'profiles'>;
export type Organizations = TableRow<'organizations'>;
export type JobTitles = TableRow<'job_titles'>;

// Keep contracts as an alias for projects for backward compatibility
export type Contracts = Projects;

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
    item_code: string;
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
  name: string;
}

export interface Profile {
  id: string;
  role: Database["public"]["Enums"]["user_role_type"] | null;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_id: string | null;
  organization_id: string | null;
  job_title_id: string | null;
  created_at: string | null;
  updated_at: string;
  deleted_at: string | null;

  organizations?: {
    name: string;
    address: string | null;
    phone: string | null;
    website: string | null;
  } | null;

  job_titles?: {
    name: string;
  } | null;
}

/**
 * Type for the get_enriched_profile RPC response
 */
export interface EnrichedUserProfile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: Database["public"]["Enums"]["user_role_type"] | null;
  job_title_id: string | null;
  job_title: string | null;
  organization_id: string | null;
  organization_name: string | null;
  avatar_id: string | null;
  created_at: string | null;
  updated_at: string;
  deleted_at: string | null;
}

export interface EnrichedUserContract {
  id: string;
  name: string; // Changed from title to name to match projects table
  description: string | null;
  start_date: string | null; // Dates are typically strings in ISO format
  end_date: string | null; // Dates are typically strings in ISO format
  created_at: string | null; // Timestamps are typically strings in ISO format
  updated_at: string; // Timestamps are typically strings in ISO format
  status: Database["public"]["Enums"]["project_status"] | null; // Use project_status instead of general_status
  organization_id: string | null;
  user_contract_role: Database["public"]["Enums"]["user_role_type"] | null;
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
  role: Database["public"]["Enums"]["user_role_type"];
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

// Core Feature Types
export type { Project } from './features/project.types';
export type { Estimate } from './features/estimate.types';
export type { CostCode } from './features/cost-code.types';
export type { ScheduleTask } from './features/schedule-task.types';
