import type { Database } from './database.types';

/** Extract Supabase enum types */
export type ContractStatusValue = Database['public']['Enums']['contract_status'];
export type AsphaltTypeValue = Database['public']['Enums']['asphalt_type'];
export type ChangeOrderStatusValue = Database['public']['Enums']['change_order_status'];
export type ExistingSurfaceValue = Database['public']['Enums']['existing_surface'];
export type OrganizationRoleValue = Database['public']['Enums']['organization_role'];
export type PatchStatusValue = Database['public']['Enums']['patch_status'];
export type RoadSideValue = Database['public']['Enums']['road_side'];
export type UnitMeasureTypeValue = Database['public']['Enums']['unit_measure_type'];
export type UserRoleValue = Database['public']['Enums']['user_role'];

/** Label-friendly enums for internal display use */
export enum ContractStatus {
  Draft = 'Draft',
  AwaitingAssignment = 'Awaiting Assignment',
  Active = 'Active',
  OnHold = 'On Hold',
  FinalReview = 'Final Review',
  Closed = 'Closed',
  BiddingSolicitation = 'Bidding Solicitation',
  AssignedPartial = 'Assigned(Partial)',
  AssignedFull = 'Assigned(Full)',
}

export enum ChangeOrderStatus {
  Draft = 'draft',
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum AsphaltType {
  SA1 = 'SA-1',
  S475A = 'S4.75A',
  SF95A = 'SF9.5A',
  S95B = 'S9.5B',
  S95C = 'S9.5C',
  S95D = 'S9.5D',
  S125C = 'S12.5C',
  S125D = 'S12.5D',
  I190B = 'I19.0B',
  I190C = 'I19.0C',
  I190D = 'I19.0D',
  B250B = 'B25.0B',
  B250C = 'B25.0C',
}

export enum ExistingSurface {
  NewAsphalt = 'New Asphalt',
  OxidizedAsphalt = 'Oxidized Asphalt',
  MilledAsphalt = 'Milled Asphalt',
  Concrete = 'Concrete',
  DirtSoil = 'Dirt/Soil',
  Gravel = 'Gravel',
}

export enum OrganizationRole {
  PrimeContractor = 'Prime Contractor',
  Subcontractor = 'Subcontractor',
  Auditor = 'Auditor',
  Engineering = 'Engineering',
  Inspection = 'Inspection',
  Other = 'Other'
}

export enum PatchStatus {
  Proposed = 'Proposed',
  Marked = 'Marked',
  Milled = 'Milled',
  Patched = 'Patched',
  Deleted = 'Deleted',
}

export enum RoadSide {
  Left = 'Left',
  Right = 'Right',
}

export enum UnitMeasureType {
  Feet = 'Feet (FT)',
  Inches = 'Inches (IN)',
  LinearFeet = 'Linear Feet (LF)',
  Mile = 'Mile (MI)',
  ShoulderMile = 'Shoulder Mile (SMI)',
  SquareFeet = 'Square Feet (SF)',
  SquareYard = 'Square Yard (SY)',
  Acre = 'Acre (AC)',
  CubicFoot = 'Cubic Foot (CF)',
  CubicYard = 'Cubic Yard (CY)',
  Gallon = 'Gallon (GAL)',
  Pounds = 'Pounds (LBS)',
  Ton = 'TON',
  Each = 'Each (EA)',
  LumpSum = 'Lump Sum (LS)',
  Hour = 'Hour (HR)',
  Day = 'DAY',
  Station = 'Station (STA)',
  MSF = 'MSF (1000SF)',
  MLF = 'MLF (1000LF)',
  CubicFeetPerSecond = 'Cubic Feet per Second (CFS)',
  PoundsPerSquareInch = 'Pounds per Square Inch (PSI)',
  Percent = 'Percent (%)',
  Degrees = 'Degrees (*)',
}

export enum UserRole {
  Admin = 'Admin',
  Contractor = 'Contractor',
  Engineer = 'Engineer',
  ProjectManager = 'Project Manager',
  Inspector = 'Inspector',
}

/** Runtime option arrays */
export const CONTRACT_STATUS_OPTIONS: ContractStatusValue[] = Object.values(ContractStatus);
export const UNIT_MEASURE_OPTIONS: UnitMeasureTypeValue[] = Object.values(UnitMeasureType);
export const USER_ROLE_OPTIONS: UserRoleValue[] = Object.values(UserRole);

/** Optional display-friendly maps (can be styled later) */
export const CONTRACT_STATUS_LABELS: Record<ContractStatusValue, string> = {
  'Draft': 'Draft',
  'Awaiting Assignment': 'Awaiting Assignment',
  'Active': 'Active',
  'On Hold': 'On Hold',
  'Final Review': 'Final Review',
  'Closed': 'Closed',
  'Bidding Solicitation': 'Bidding Solicitation',
  'Assigned(Partial)': 'Assigned (Partial)',
  'Assigned(Full)': 'Assigned (Full)',
  'Completed': 'Completed',
  'Cancelled': 'Cancelled',
};

export const CONTRACT_STATUS_SELECT_OPTIONS: {
  value: ContractStatusValue;
  label: string;
}[] = CONTRACT_STATUS_OPTIONS.map((value) => ({
  value,
  label: CONTRACT_STATUS_LABELS[value],
}));
