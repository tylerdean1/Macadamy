import type { Database } from "./database.types";

// Export all database enums for easy access
export type GeneralStatus = Database["public"]["Enums"]["general_status"];
export type ProjectStatus = Database["public"]["Enums"]["project_status"];
export type UserRoleType = Database["public"]["Enums"]["user_role_type"];
export type OrgRole = Database["public"]["Enums"]["org_role"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type EquipmentType = Database["public"]["Enums"]["equipment_type"];
export type CertificationType = Database["public"]["Enums"]["certification_type"];
export type CommitmentType = Database["public"]["Enums"]["commitment_type"];
export type DocumentType = Database["public"]["Enums"]["document_type"];
export type IssueType = Database["public"]["Enums"]["issue_type"];
export type NotificationCategory = Database["public"]["Enums"]["notification_category"];
export type UnitMeasure = Database["public"]["Enums"]["unit_measure"];
export type WorkflowName = Database["public"]["Enums"]["workflow_name"];

// Export constants for option arrays
import { Constants } from "./database.types";

export const GENERAL_STATUS_OPTIONS = Constants.public.Enums.general_status;
export const PROJECT_STATUS_OPTIONS = Constants.public.Enums.project_status;
export const USER_ROLE_TYPE_OPTIONS = Constants.public.Enums.user_role_type;
export const ORG_ROLE_OPTIONS = Constants.public.Enums.org_role;
export const TASK_STATUS_OPTIONS = Constants.public.Enums.task_status;
export const EQUIPMENT_TYPE_OPTIONS = Constants.public.Enums.equipment_type;
export const CERTIFICATION_TYPE_OPTIONS = Constants.public.Enums.certification_type;
export const COMMITMENT_TYPE_OPTIONS = Constants.public.Enums.commitment_type;
export const DOCUMENT_TYPE_OPTIONS = Constants.public.Enums.document_type;
export const ISSUE_TYPE_OPTIONS = Constants.public.Enums.issue_type;
export const NOTIFICATION_CATEGORY_OPTIONS = Constants.public.Enums.notification_category;
export const UNIT_MEASURE_OPTIONS = Constants.public.Enums.unit_measure;
export const WORKFLOW_NAME_OPTIONS = Constants.public.Enums.workflow_name;

// Keep legacy exports for backward compatibility
export const contract_status = GENERAL_STATUS_OPTIONS;
export const user_role = USER_ROLE_TYPE_OPTIONS;