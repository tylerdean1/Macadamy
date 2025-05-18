import type { Database } from "@/lib/database.types";

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
    title: string;
    description: string;
    location: string;
    start_date: string;
    end_date: string;
    budget: number;
    status: Database["public"]["Enums"]["contract_status"];
    coordinates_wkt: string;
    session_id: string;
};

export type WbsWithWktRow = {
    id: string;
    wbs_number: string;
    scope: string;
    budget: number;
    location: string;
    coordinates_wkt: string;
    session_id: string;
};

export type MapsWithWktRow = {
    id: string;
    wbs_id: string;
    map_number: string;
    location: string;
    scope: string;
    budget: number;
    coordinates_wkt: string;
    session_id: string;
};
  
export type LineItemsWithWktRow = {
    id: string;
    wbs_id: string;
    map_id: string;
    line_code: string;
    description: string;
    template_id: string;
    unit_measure: Database["public"]["Enums"]["unit_measure_type"];
    quantity: number;
    unit_price: number;
    reference_doc: string;
    coordinates_wkt: string;
    session_id: string;
};

export type ChangeOrdersRow = {
    id: string;
    line_item_id: string;
    new_quantity: number;
    new_unit_price: number;
    title: string;
    description: string;
    status: Database["public"]["Enums"]["change_order_status"];
    submitted_date: string;
    approved_date: string;
    approved_by: string;
    created_by: string;
    attachments: string[];
    session_id: string;
};

export type ContractOrganizationsRow = {
      organization_id: string;
      notes: string;
      role: Database["public"]["Enums"]["organization_role"];
};
  
export type CrewMembersByOrganizationRow = {
    crew_id: string;
    profile_id: string;
    role: string;
    assigned_at: string;
    created_by: string;
    map_location_id: string;
    location_notes: string;
    session_id: string;
};

export type CrewsByOrganizationRow = {
    id: string;
    name: string;
    description: string;
    foreman_id: string;
    created_by: string;
    session_id: string;
};
  
export type DailyLogsRow = {
    id: string;
    log_date: string;
    weather_conditions: string;
    temperature: string;
    work_performed: string;
    delays_encountered: string;
    visitors: string;
    safety_incidents: string;
    created_by: string;
    session_id: string;
};
  
export type EquipmentByOrganizationRow = {
    id: string;
    user_defined_id: string;
    name: string;
    description: string;
    operator_id: string;
    session_id: string;
};
  
export type EquipmentAssignmentsRow = {
    id: string;
    equipment_id: string;
    operator_id: string;
    start_date: string;
    end_date: string;
    status: string;
    notes: string;
    session_id: string;
};  
  
export type EquipmentUsageRow = {
    equipment_id: string;
    wbs_id: string;
    map_id: string;
    line_item_id: string;
    usage_date: string;
    hours_used: number;
    operator_id: string;
    session_id: string;
};  
  
export type InspectionsRow = {
    id: string;
    wbs_id: string;
    map_id: string;
    line_item_id: string;
    name: string;
    description: string;
    pdf_url: string;
    photo_urls: string[];
    created_by: string;
    session_id: string;
};  

export type IssuesRow = {
    id: string;
    wbs_id: string;
    map_id: string;
    line_item_id: string;
    equipment_id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    due_date: string;
    resolution: string;
    assigned_to: string;
    created_by: string;
    photo_urls: string[];
    session_id: string;
};

export type JobTitlesRow = {
    title: string;
    is_custom: boolean;
      session_id: string;
};  
  
export type LineItemEntriesRow = {
    id: string;
    wbs_id: string;
    map_id: string;
    line_item_id: string;
    entered_by: string;
    input_variables: Record<string, unknown>;
    computed_output: number;
    notes: string;
    output_unit: Database["public"]["Enums"]["unit_measure_type"];
    session_id: string;
  };

export type LineItemTemplatesByOrganizationRow = {
    id: string;
    name: string;
    description: string;
    unit_type: Database["public"]["Enums"]["unit_measure_type"];
    formula: Record<string, unknown>;
    instructions: string;
    session_id: string;
};
  
export type AllLineItemTemplatesRow = {
    id: string;
    name: string;
    description: string;
    unit_type: Database["public"]["Enums"]["unit_measure_type"];
    formula: Record<string, unknown>;
    instructions: string;
    session_id: string;
};

export type OrganizationsRow = {
    id: string;
    name: string;
    address: string;
    phone: string;
    website: string;
    session_id: string;
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
    session_id: string;
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
    session_id: string;
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
    session_id: string;
};
  
export type AvatarsForProfileRow = {
    id: string;
    url: string;
    is_preset: boolean;
};
  
export type UserContractsRow = {
    contract_id: string;
    role: Database["public"]["Enums"]["user_role"];
    session_id: string;
};

//   ========== RPC FUNCTION TYPES ==========
  
/**
 * RPC Types with enhanced documentation and type safety
 */

// ==============================================
// CONTRACT MANAGEMENT RPCs
// ==============================================

/**
 * Creates a new contract in the database
 * @param _data Contract data including required fields
 * @returns The UUID of the newly created contract
 */
export type InsertContractsFunction = (_data: {
  id?: string;
  created_by: string;
  title?: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  status?: Database["public"]["Enums"]["contract_status"];
  coordinates_wkt?: string;
  session_id?: string;
  [key: string]: unknown;
}) => Promise<string>;
  
/**
 * Updates an existing contract by ID
 * @param _id Contract UUID to update
 * @param _data Contract data to update
 * @returns void
 */
export type UpdateContractsFunction = (
    _id: string, 
    _data: {
        title?: string;
        description?: string;
        location?: string;
        start_date?: string;
        end_date?: string;
        budget?: number;
        status?: Database["public"]["Enums"]["contract_status"];
        coordinates_wkt?: string;
        session_id?: string;
        [key: string]: unknown;
  }
) => Promise<void>;

/**
* Deletes a contract by ID
* @param _id Contract UUID to delete
* @returns void
*/
export type DeleteContractsFunction = (_id: string) => Promise<void>;

// ==============================================
// WORK BREAKDOWN STRUCTURE RPCs
//   ==============================================

/**
 * Creates a new WBS (Work Breakdown Structure) in the database
 * @param _data WBS data including required fields
 * @returns The UUID of the newly created WBS
 */
export type InsertWbsFunction = (_data: {
  id?: string;
  created_by: string;
  contract_id?: string;
  wbs_number?: string;
  scope?: string;
  budget?: number;
  location?: string;
  coordinates_wkt?: string;
  session_id?: string;
  [key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing WBS by ID
 * @param _id WBS UUID to update
 * @param _data WBS data to update
 * @returns void
 */
export type UpdateWbsFunction = (
    _id: string, 
    _data: {
        contract_id?: string;
        wbs_number?: string;
        scope?: string;
        budget?: number;
        location?: string;
        coordinates_wkt?: string;
        session_id?: string;
        [key: string]: unknown;
}) => Promise<void>;

/**
* Deletes a WBS by ID
* @param _id WBS UUID to delete
* @returns void
*/
export type DeleteWbsFunction = (_id: string) => Promise<void>;

// ==============================================
// MAPS RPCs
// ==============================================

/**
* Creates a new map in the database
* @param _data Map data including required fields
* @returns The UUID of the newly created map
*/
export type InsertMapsFunction = (_data: {
    id?: string;
    created_by: string;
    wbs_id?: string;
    map_number?: string;
    location?: string;
    scope?: string;
    budget?: number;
    coordinates_wkt?: string;
    session_id?: string;
    [key: string]: unknown;
}) => Promise<string>;
  
/**
* Updates an existing map by ID
* @param _id Map UUID to update
* @param _data Map data to update
* @returns void
*/
export type UpdateMapsFunction = (
    _id: string, 
    _data: {
        wbs_id?: string;
        map_number?: string;
        location?: string;
        scope?: string;
        budget?: number;
        coordinates_wkt?: string;
        session_id?: string;
        [key: string]: unknown;
    }
) => Promise<void>;

/**
*   Deletes a map by ID
* @param _id Map UUID to delete
* @returns void
*/
export type DeleteMapsFunction = (_id: string) => Promise<void>;

// ==============================================
// CHANGE ORDERS RPCs
// ==============================================
  
/**
* Creates a new change order in the database
* @param _data Change order data including required fields
* @returns The UUID of the newly created change order
*/
export type InsertChangeOrdersFunction = (_data: {
    id?: string;
    created_by: string;
    line_item_id?: string;
    new_quantity?: number;
    new_unit_price?: number;
    title?: string;
    description?: string;
    status?: Database["public"]["Enums"]["change_order_status"];
    submitted_date?: string;
    approved_date?: string;
    approved_by?: string;
    attachments?: string[];
    session_id?: string;
    [key: string]: unknown;
}) => Promise<string>;
  
/**
* Updates an existing change order by ID
* @param _id Change order UUID to update
* @param _data Change order data to update
* @returns void
*/
export type UpdateChangeOrdersFunction = (
    _id: string, 
    _data: {
        line_item_id?: string;
        new_quantity?: number;
        new_unit_price?: number;
        title?: string;
        description?: string;
        status?: Database["public"]["Enums"]["change_order_status"];
        submitted_date?: string;
        approved_date?: string;
        approved_by?: string;
        attachments?: string[];
        session_id?: string;
        [key: string]: unknown;
    }
) => Promise<void>;

/**
* Deletes a change order by ID
* @param _id Change order UUID to delete
* @returns void
*/
export type DeleteChangeOrdersFunction = (_id: string) => Promise<void>;

// ==============================================
// PROFILE MANAGEMENT RPCs
//   ==============================================
  
/**    
* Creates a new user profile in the database
* @param _data Profile data including required fields
* @returns The UUID of the newly created profile
*/
export type InsertProfilesFunction = (_data: {
    id?: string;
    full_name?: string;
    username?: string;
    email?: string;
    phone?: string;
    location?: string;
    role?: Database["public"]["Enums"]["user_role"];
    job_title_id?: string;
    organization_id?: string;
    avatar_id?: string;
    avatar_url?: string;
    session_id?: string;
    [key: string]: unknown;
}) => Promise<string>;

/**
* Updates an existing profile by ID
* @param _id Profile UUID to update
* @param _data Profile data to update
* @returns void
*/
export type UpdateProfilesFunction = (
    _id: string, 
    _data: {
        full_name?: string;
        username?: string;
        email?: string;
        phone?: string;
        location?: string;
        role?: Database["public"]["Enums"]["user_role"];
        job_title_id?: string;
        organization_id?: string;
        avatar_id?: string;
        avatar_url?: string;
        session_id?: string;
        [key: string]: unknown;
  }
) => Promise<void>;

/**
* Deletes a profile by ID
* @param _id Profile UUID to delete
* @returns void
*/
export type DeleteProfilesFunction = (_id: string) => Promise<void>;

// ==============================================
// ORGANIZATION MANAGEMENT RPCs
// ==============================================

/**
* Creates a new organization in the database
* @param _data Organization data including required fields
* @returns The UUID of the newly created organization
*/
export type InsertOrganizationsFunction = (_data: {
    id?: string;
    name?: string;
    address?: string;
    phone?: string;
    website?: string;
    session_id?: string;
    [key: string]: unknown;
}) => Promise<string>;

/**
* Updates an existing organization by ID
* @param _id Organization UUID to update
* @param _data Organization data to update
* @returns void
*/
export type UpdateOrganizationsFunction = (
    _id: string, 
    _data: {
        name?: string;
        address?: string;
        phone?: string;
        website?: string;
        session_id?: string;
        [key: string]: unknown;
    }
) => Promise<void>;

/**
* Deletes an organization by ID
* @param _id Organization UUID to delete
* @returns void
*/
export type DeleteOrganizationsFunction = (_id: string) => Promise<void>;

/**
* Creates a new contract organization link in the database
* @param _data Contract organization data including required fields
* @returns The UUID of the newly created contract organization link
*/
export type InsertContractOrganizationsFunction = (_data: {
    id?: string;
    contract_id?: string;
    organization_id?: string;
    notes?: string;
    role?: Database["public"]["Enums"]["organization_role"];
    [key: string]: unknown;
}) => Promise<string>;

/**
* Updates an existing contract organization link by ID
* @param _id Contract organization UUID to update
* @param _data Contract organization data to update
* @returns void
*/
export type UpdateContractOrganizationsFunction = (
    _id: string, 
    _data: {
        contract_id?: string;
        organization_id?: string;
        notes?: string;
        role?: Database["public"]["Enums"]["organization_role"];
        [key: string]: unknown;
  }
) => Promise<void>;

/**
* Deletes a contract organization link by ID
* @param _id Contract organization UUID to delete
* @returns void
*/
export type DeleteContractOrganizationsFunction = (_id: string) => Promise<void>;

// ==============================================
// USER CONTRACT ASSIGNMENTS RPCs
// ==============================================

/**
* Creates a new user contract assignment in the database
* @param _data User contract data including required fields
* @returns The UUID of the newly created user contract assignment
*/
export type InsertUserContractsFunction = (_data: {
    id?: string;
    user_id?: string;
    contract_id?: string;
    role?: Database["public"]["Enums"]["user_role"];
    session_id?: string;
    [key: string]: unknown;
}) => Promise<string>;

/**
* Updates an existing user contract assignment by ID
* @param _id User contract UUID to update
* @param _data User contract data to update
* @returns void
*/
export type UpdateUserContractsFunction = (
    _id: string, 
    _data: {
        user_id?: string;
        contract_id?: string;
        role?: Database["public"]["Enums"]["user_role"];
        session_id?: string;
        [key: string]: unknown;
  }
) => Promise<void>;

/**
* Deletes a user contract assignment by ID
* @param _id User contract UUID to delete
* @returns void
*/
export type DeleteUserContractsFunction = (_id: string) => Promise<void>;

// ==============================================
// AVATAR MANAGEMENT RPCs
// ==============================================

/**
* Creates a new avatar in the database
* @param _data Avatar data including required fields
* @returns The UUID of the newly created avatar
*/
export type InsertAvatarsFunction = (_data: {
    id?: string;
    name?: string;
    url?: string;
    is_preset?: boolean;
    profile_id?: string;
    session_id?: string;
    [key: string]: unknown;
}) => Promise<string>;

/**
* Updates an existing avatar by ID
* @param _id Avatar UUID to update
* @param _data Avatar data to update
* @returns void
*/
export type UpdateAvatarsFunction = (
    _id: string, 
    _data: {
        name?: string;
        url?: string;
        is_preset?: boolean;
        profile_id?: string;
        session_id?: string;
        [key: string]: unknown;
  }
) => Promise<void>;

/**
* Deletes an avatar by ID
* @param _id Avatar UUID to delete
* @returns void
*/
export type DeleteAvatarsFunction = (_id: string) => Promise<void>;

// ==============================================
// CREW MANAGEMENT RPCs
// ==============================================

/**
* Creates a new crew in the database
* @param _data Crew data including required fields
* @returns The UUID of the newly created crew
*/
export type InsertCrewsFunction = (_data: {
    id?: string;
    created_by: string;
    name?: string;
    description?: string;
    foreman_id?: string;
    organization_id?: string;
    session_id?: string;
    [key: string]: unknown;
}) => Promise<string>;

/**
* Updates an existing crew by ID
* @param _id Crew UUID to update
* @param _data Crew data to update
* @returns void
*/
export type UpdateCrewsFunction = (
    _id: string, 
    _data: {
        name?: string;
        description?: string;
        foreman_id?: string;
        organization_id?: string;
        session_id?: string;
        [key: string]: unknown;
    }
) => Promise<void>;

/**
* Deletes a crew by ID
* @param _id Crew UUID to delete
* @returns void
*/
export type DeleteCrewsFunction = (_id: string) => Promise<void>;

/**
* Creates a new crew member assignment in the database
* @param _data Crew member data including required fields
* @returns The UUID of the newly created crew member assignment
*/
export type InsertCrewMembersFunction = (_data: {
    id?: string;
    created_by: string;
    crew_id?: string;
    profile_id?: string;
    role?: string;
    assigned_at?: string;
    map_location_id?: string;
    location_notes?: string;
    session_id?: string;
    [key: string]: unknown;
}) => Promise<string>;

/**
* Updates an existing crew member assignment by ID
* @param _id Crew member UUID to update
* @param _data Crew member data to update
* @returns void
*/
export type UpdateCrewMembersFunction = (
    _id: string, 
    _data: {
        crew_id?: string;
        profile_id?: string;
        role?: string;
        assigned_at?: string;
        map_location_id?: string;
        location_notes?: string;
        session_id?: string;
        [key: string]: unknown;
    }
) => Promise<void>;

/**
* Deletes a crew member assignment by ID
* @param _id Crew member UUID to delete
* @returns void
*/
export type DeleteCrewMembersFunction = (_id: string) => Promise<void>;

// ==============================================
// DASHBOARD METRICS RPC
// ==============================================

/**
* Gets dashboard metrics for a specific user
* 
* This function retrieves aggregated metrics about a user's active contracts,
* open issues, and total inspections for display on the dashboard.
* It executes SQL joins across multiple tables to compile the metrics.
* 
* @param _user_id The UUID of the user to get metrics for
* @returns An object containing count metrics for active contracts, issues, and inspections
*/
export type GetDashboardMetricsFunction = (_user_id: string) => Promise<{
    active_contracts: number;
    total_issues: number;
    total_inspections: number;
}>;

// ==============================================
// UPDATE PROFILE FULL RPC
// ==============================================

/**
* Advanced profile update with related entities creation
* 
* This function updates a user profile and can also create related entities like
* custom job titles and avatars in a single transaction. If is_custom is true,
* it will create a new job title. If is_preset is false, it will create a new avatar.
* 
* @param _id The UUID of the profile to update
* @param _data Extended profile data including optional job title and avatar
* @returns void
*/
export type UpdateProfileFullFunction = (
    _id: string,
    _data: {
        full_name?: string;
        username?: string;
        email?: string;
        phone?: string;
        location?: string;
        role?: Database["public"]["Enums"]["user_role"];
        job_title?: string;
        is_custom?: boolean;
        job_title_id?: string;
        organization_id?: string;
        avatar_url?: string;
        is_preset?: boolean;
        avatar_id?: string;
        created_by: string;
        session_id: string;
        [key: string]: unknown;
    }
) => Promise<void>;

// ==============================================
// LINE ITEMS RPCs
// ==============================================

/**
* Creates a new line item in the database
* @param _data Line item data including required fields
* @returns The UUID of the newly created line item
*/
export type InsertLineItemsFunction = (_data: {
id?: string;
created_by: string;
wbs_id?: string;
map_id?: string;
line_code?: string;
description?: string;
template_id?: string;
unit_measure?: Database["public"]["Enums"]["unit_measure_type"];
quantity?: number;
unit_price?: number;
reference_doc?: string;
coordinates_wkt?: string;
session_id?: string;
[key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing line item by ID
 * @param _id Line item UUID to update
 * @param _data Line item data to update
 * @returns void
 */
export type UpdateLineItemsFunction = (
  _id: string, 
  _data: {
    /** WBS ID this line item belongs to */
    wbs_id?: string;
    /** Map ID this line item belongs to */
    map_id?: string;
    /** Line item code */
    line_code?: string;
    /** Line item description */
    description?: string;
    /** Template ID if using a template */
    template_id?: string;
    /** Unit of measurement */
    unit_measure?: Database["public"]["Enums"]["unit_measure_type"];
    /** Quantity */
    quantity?: number;
    /** Unit price */
    unit_price?: number;
    /** Reference document */
    reference_doc?: string;
    /** WKT coordinates string */
    coordinates_wkt?: string;
    /** Session ID for demo data */
    session_id?: string;
    /** Allow other properties */
    [key: string]: unknown;
  }
) => Promise<void>;

/**
 * Deletes a line item by ID
 * @param _id Line item UUID to delete
 * @returns void
 */
export type DeleteLineItemsFunction = (_id: string) => Promise<void>;

// ==============================================
// LINE ITEM TEMPLATES RPCs
// ==============================================

/**
 * Creates a new line item template in the database
 * @param _data Line item template data including required fields
 * @returns The UUID of the newly created line item template
 */
export type InsertLineItemTemplatesFunction = (_data: {
  /** Optional ID (will be generated if not provided) */
  id?: string;
  /** User ID of the creator */
  created_by: string;
  /** Template name */
  name?: string;
  /** Template description */
  description?: string;
  /** Unit of measurement type */
  unit_type?: Database["public"]["Enums"]["unit_measure_type"];
  /** Formula for calculations */
  formula?: Record<string, unknown>;
  /** Instructions for using this template */
  instructions?: string;
  /** Session ID for demo data */
  session_id?: string;
  /** Allow other properties */
  [key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing line item template by ID
 * @param _id Line item template UUID to update
 * @param _data Line item template data to update
 * @returns void
 */
export type UpdateLineItemTemplatesFunction = (
  _id: string, 
  _data: {
    /** Template name */
    name?: string;
    /** Template description */
    description?: string;
    /** Unit of measurement type */
    unit_type?: Database["public"]["Enums"]["unit_measure_type"];
    /** Formula for calculations */
    formula?: Record<string, unknown>;
    /** Instructions for using this template */
    instructions?: string;
    /** Session ID for demo data */
    session_id?: string;
    /** Allow other properties */
    [key: string]: unknown;
  }
) => Promise<void>;

/**
 * Deletes a line item template by ID
 * @param _id Line item template UUID to delete
 * @returns void
 */
export type DeleteLineItemTemplatesFunction = (_id: string) => Promise<void>;

// ==============================================
// LINE ITEM ENTRIES RPCs
// ==============================================

/**
 * Creates a new line item entry in the database
 * @param _data Line item entry data including required fields
 * @returns The UUID of the newly created line item entry
 */
export type InsertLineItemEntriesFunction = (_data: {
  /** Optional ID (will be generated if not provided) */
  id?: string;
  /** User ID of the creator */
  created_by: string;
  /** WBS ID this entry belongs to */
  wbs_id?: string;
  /** Map ID this entry belongs to */
  map_id?: string;
  /** Line item ID this entry belongs to */
  line_item_id?: string;
  /** User who entered this data */
  entered_by?: string;
  /** Input variables for formula calculation */
  input_variables?: Record<string, unknown>;
  /** Computed output value */
  computed_output?: number;
  /** Additional notes */
  notes?: string;
  /** Output unit of measurement */
  output_unit?: Database["public"]["Enums"]["unit_measure_type"];
  /** Session ID for demo data */
  session_id?: string;
  /** Allow other properties */
  [key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing line item entry by ID
 * @param _id Line item entry UUID to update
 * @param _data Line item entry data to update
 * @returns void
 */
export type UpdateLineItemEntriesFunction = (
  _id: string, 
  _data: {
    /** WBS ID this entry belongs to */
    wbs_id?: string;
    /** Map ID this entry belongs to */
    map_id?: string;
    /** Line item ID this entry belongs to */
    line_item_id?: string;
    /** User who entered this data */
    entered_by?: string;
    /** Input variables for formula calculation */
    input_variables?: Record<string, unknown>;
    /** Computed output value */
    computed_output?: number;
    /** Additional notes */
    notes?: string;
    /** Output unit of measurement */
    output_unit?: Database["public"]["Enums"]["unit_measure_type"];
    /** Session ID for demo data */
    session_id?: string;
    /** Allow other properties */
    [key: string]: unknown;
  }
) => Promise<void>;

/**
 * Deletes a line item entry by ID
 * @param _id Line item entry UUID to delete
 * @returns void
 */
export type DeleteLineItemEntriesFunction = (_id: string) => Promise<void>;

// ==============================================
// DAILY LOGS RPCs
// ==============================================

/**
 * Creates a new daily log in the database
 * @param _data Daily log data including required fields
 * @returns The UUID of the newly created daily log
 */
export type InsertDailyLogsFunction = (_data: {
  /** Optional ID (will be generated if not provided) */
  id?: string;
  /** User ID of the creator */
  created_by: string;
  /** Date of the log (ISO string) */
  log_date?: string;
  /** Weather conditions */
  weather_conditions?: string;
  /** Temperature */
  temperature?: string;
  /** Description of work performed */
  work_performed?: string;
  /** Description of delays encountered */
  delays_encountered?: string;
  /** List of visitors */
  visitors?: string;
  /** Description of safety incidents */
  safety_incidents?: string;
  /** Contract ID this log belongs to */
  contract_id?: string;
  /** Session ID for demo data */
  session_id?: string;
  /** Allow other properties */
  [key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing daily log by ID
 * @param _id Daily log UUID to update
 * @param _data Daily log data to update
 * @returns void
 */
export type UpdateDailyLogsFunction = (
  _id: string, 
  _data: {
    /** Date of the log (ISO string) */
    log_date?: string;
    /** Weather conditions */
    weather_conditions?: string;
    /** Temperature */
    temperature?: string;
    /** Description of work performed */
    work_performed?: string;
    /** Description of delays encountered */
    delays_encountered?: string;
    /** List of visitors */
    visitors?: string;
    /** Description of safety incidents */
    safety_incidents?: string;
    /** Contract ID this log belongs to */
    contract_id?: string;
    /** Session ID for demo data */
    session_id?: string;
    /** Allow other properties */
    [key: string]: unknown;
  }
) => Promise<void>;

/**
 * Deletes a daily log by ID
 * @param _id Daily log UUID to delete
 * @returns void
 */
export type DeleteDailyLogsFunction = (_id: string) => Promise<void>;

// ==============================================
// JOB TITLES RPCs
// ==============================================

/**
 * Creates a new job title in the database
 * @param _data Job title data including required fields
 * @returns The UUID of the newly created job title
 */
export type InsertJobTitlesFunction = (_data: {
  /** Optional ID (will be generated if not provided) */
  id?: string;
  /** Job title */
  title?: string;
  /** Whether this is a custom job title */
  is_custom?: boolean;
  /** User ID of the creator */
  created_by?: string;
  /** Session ID for demo data */
  session_id?: string;
  /** Allow other properties */
  [key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing job title by ID
 * @param _id Job title UUID to update
 * @param _data Job title data to update
 * @returns void
 */
export type UpdateJobTitlesFunction = (
  _id: string, 
  _data: {
    /** Job title */
    title?: string;
    /** Whether this is a custom job title */
    is_custom?: boolean;
    /** Session ID for demo data */
    session_id?: string;
    /** Allow other properties */
    [key: string]: unknown;
  }
) => Promise<void>;

/**
 * Deletes a job title by ID
 * @param _id Job title UUID to delete
 * @returns void
 */
export type DeleteJobTitlesFunction = (_id: string) => Promise<void>;

// ==============================================
// ISSUES MANAGEMENT RPCs
// ==============================================

/**
 * Creates a new issue in the database
 * @param _data Issue data including required fields
 * @returns The UUID of the newly created issue
 */
export type InsertIssuesFunction = (_data: {
  /** Optional ID (will be generated if not provided) */
  id?: string;
  /** User ID of the creator */
  created_by: string;
  /** WBS ID this issue belongs to */
  wbs_id?: string;
  /** Map ID this issue belongs to */
  map_id?: string;
  /** Line item ID this issue belongs to */
  line_item_id?: string;
  /** Equipment ID this issue is related to */
  equipment_id?: string;
  /** Contract ID this issue belongs to */
  contract_id?: string;
  /** Issue title */
  title?: string;
  /** Issue description */
  description?: string;
  /** Issue priority */
  priority?: string;
  /** Issue status */
  status?: string;
  /** Due date (ISO string) */
  due_date?: string;
  /** Issue resolution */
  resolution?: string;
  /** User ID of the person assigned to this issue */
  assigned_to?: string;
  /** Array of photo URLs */
  photo_urls?: string[];
  /** Session ID for demo data */
  session_id?: string;
  /** Allow other properties */
  [key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing issue by ID
 * @param _id Issue UUID to update
 * @param _data Issue data to update
 * @returns void
 */
export type UpdateIssuesFunction = (
  _id: string, 
  _data: {
    /** WBS ID this issue belongs to */
    wbs_id?: string;
    /** Map ID this issue belongs to */
    map_id?: string;
    /** Line item ID this issue belongs to */
    line_item_id?: string;
    /** Equipment ID this issue is related to */
    equipment_id?: string;
    /** Contract ID this issue belongs to */
    contract_id?: string;
    /** Issue title */
    title?: string;
    /** Issue description */
    description?: string;
    /** Issue priority */
    priority?: string;
    /** Issue status */
    status?: string;
    /** Due date (ISO string) */
    due_date?: string;
    /** Issue resolution */
    resolution?: string;
    /** User ID of the person assigned to this issue */
    assigned_to?: string;
    /** Array of photo URLs */
    photo_urls?: string[];
    /** Session ID for demo data */
    session_id?: string;
    /** Allow other properties */
    [key: string]: unknown;
  }
) => Promise<void>;

/**
 * Deletes an issue by ID
 * @param _id Issue UUID to delete
 * @returns void
 */
export type DeleteIssuesFunction = (_id: string) => Promise<void>;

// ==============================================
// EQUIPMENT MANAGEMENT RPCs
// ==============================================

/**
 * Creates a new equipment entry in the database
 * @param _data Equipment data including required fields
 * @returns The UUID of the newly created equipment
 */
export type InsertEquipmentFunction = (_data: {
  /** Optional ID (will be generated if not provided) */
  id?: string;
  /** User ID of the creator */
  created_by: string;
  /** User-defined equipment ID */
  user_defined_id?: string;
  /** Equipment name */
  name?: string;
  /** Equipment description */
  description?: string;
  /** User ID of the default operator */
  operator_id?: string;
  /** Organization ID this equipment belongs to */
  organization_id?: string;
  /** Session ID for demo data */
  session_id?: string;
  /** Allow other properties */
  [key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing equipment entry by ID
 * @param _id Equipment UUID to update
 * @param _data Equipment data to update
 * @returns void
 */
export type UpdateEquipmentFunction = (
  _id: string, 
  _data: {
    /** User-defined equipment ID */
    user_defined_id?: string;
    /** Equipment name */
    name?: string;
    /** Equipment description */
    description?: string;
    /** User ID of the default operator */
    operator_id?: string;
    /** Organization ID this equipment belongs to */
    organization_id?: string;
    /** Session ID for demo data */
    session_id?: string;
    /** Allow other properties */
    [key: string]: unknown;
  }
) => Promise<void>;

/**
 * Deletes an equipment entry by ID
 * @param _id Equipment UUID to delete
 * @returns void
 */
export type DeleteEquipmentFunction = (_id: string) => Promise<void>;

/**
 * Creates a new equipment assignment in the database
 * @param _data Equipment assignment data including required fields
 * @returns The UUID of the newly created equipment assignment
 */
export type InsertEquipmentAssignmentsFunction = (_data: {
  /** Optional ID (will be generated if not provided) */
  id?: string;
  /** User ID of the creator */
  created_by: string;
  /** Equipment ID */
  equipment_id?: string;
  /** User ID of the operator */
  operator_id?: string;
  /** Start date of assignment (ISO string) */
  start_date?: string;
  /** End date of assignment (ISO string) */
  end_date?: string;
  /** Assignment status */
  status?: string;
  /** Additional notes */
  notes?: string;
  /** Session ID for demo data */
  session_id?: string;
  /** Allow other properties */
  [key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing equipment assignment by ID
 * @param _id Equipment assignment UUID to update
 * @param _data Equipment assignment data to update
 * @returns void
 */
export type UpdateEquipmentAssignmentsFunction = (
  _id: string, 
  _data: {
    /** Equipment ID */
    equipment_id?: string;
    /** User ID of the operator */
    operator_id?: string;
    /** Start date of assignment (ISO string) */
    start_date?: string;
    /** End date of assignment (ISO string) */
    end_date?: string;
    /** Assignment status */
    status?: string;
    /** Additional notes */
    notes?: string;
    /** Session ID for demo data */
    session_id?: string;
    /** Allow other properties */
    [key: string]: unknown;
  }
) => Promise<void>;

/**
 * Deletes an equipment assignment by ID
 * @param _id Equipment assignment UUID to delete
 * @returns void
 */
export type DeleteEquipmentAssignmentsFunction = (_id: string) => Promise<void>;

/**
 * Creates a new equipment usage record in the database
 * @param _data Equipment usage data including required fields
 * @returns The UUID of the newly created equipment usage record
 */
export type InsertEquipmentUsageFunction = (_data: {
  /** Optional ID (will be generated if not provided) */
  id?: string;
  /** User ID of the creator */
  created_by: string;
  /** Equipment ID */
  equipment_id?: string;
  /** WBS ID */
  wbs_id?: string;
  /** Map ID */
  map_id?: string;
  /** Line item ID */
  line_item_id?: string;
  /** Date of usage (ISO string) */
  usage_date?: string;
  /** Hours used */
  hours_used?: number;
  /** User ID of the operator */
  operator_id?: string;
  /** Session ID for demo data */
  session_id?: string;
  /** Allow other properties */
  [key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing equipment usage record by ID
 * @param _id Equipment usage UUID to update
 * @param _data Equipment usage data to update
 * @returns void
 */
export type UpdateEquipmentUsageFunction = (
  _id: string, 
  _data: {
    /** Equipment ID */
    equipment_id?: string;
    /** WBS ID */
    wbs_id?: string;
    /** Map ID */
    map_id?: string;
    /** Line item ID */
    line_item_id?: string;
    /** Date of usage (ISO string) */
    usage_date?: string;
    /** Hours used */
    hours_used?: number;
    /** User ID of the operator */
    operator_id?: string;
    /** Session ID for demo data */
    session_id?: string;
    /** Allow other properties */
    [key: string]: unknown;
  }
) => Promise<void>;

/**
 * Deletes an equipment usage record by ID
 * @param _id Equipment usage UUID to delete
 * @returns void
 */
export type DeleteEquipmentUsageFunction = (_id: string) => Promise<void>;

// ==============================================
// INSPECTIONS RPCs
// ==============================================

/**
 * Creates a new inspection in the database
 * @param _data Inspection data including required fields
 * @returns The UUID of the newly created inspection
 */
export type InsertInspectionsFunction = (_data: {
  /** Optional ID (will be generated if not provided) */
  id?: string;
  /** User ID of the creator */
  created_by: string;
  /** WBS ID this inspection belongs to */
  wbs_id?: string;
  /** Map ID this inspection belongs to */
  map_id?: string;
  /** Line item ID this inspection belongs to */
  line_item_id?: string;
  /** Contract ID this inspection belongs to */
  contract_id?: string;
  /** Inspection name */
  name?: string;
  /** Inspection description */
  description?: string;
  /** URL to the inspection PDF */
  pdf_url?: string;
  /** Array of photo URLs */
  photo_urls?: string[];
  /** Inspection date (ISO string) */
  inspection_date?: string;
  /** Inspection status */
  status?: string;
  /** Session ID for demo data */
  session_id?: string;
  /** Allow other properties */
  [key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing inspection by ID
 * @param _id Inspection UUID to update
 * @param _data Inspection data to update
 * @returns void
 */
export type UpdateInspectionsFunction = (
  _id: string, 
  _data: {
    /** WBS ID this inspection belongs to */
    wbs_id?: string;
    /** Map ID this inspection belongs to */
    map_id?: string;
    /** Line item ID this inspection belongs to */
    line_item_id?: string;
    /** Contract ID this inspection belongs to */
    contract_id?: string;
    /** Inspection name */
    name?: string;
    /** Inspection description */
    description?: string;
    /** URL to the inspection PDF */
    pdf_url?: string;
    /** Array of photo URLs */
    photo_urls?: string[];
    /** Inspection date (ISO string) */
    inspection_date?: string;
    /** Inspection status */
    status?: string;
    /** Session ID for demo data */
    session_id?: string;
    /** Allow other properties */
    [key: string]: unknown;
  }
) => Promise<void>;

/**
 * Deletes an inspection by ID
 * @param _id Inspection UUID to delete
 * @returns void
 */
export type DeleteInspectionsFunction = (_id: string) => Promise<void>;

// ==============================================
// ASPHALT TYPES RPCs
// ==============================================

/**
 * Creates a new asphalt type in the database
 * @param _data Asphalt type data including required fields
 * @returns The UUID of the newly created asphalt type
 */
export type InsertAsphaltTypesFunction = (_data: {
  /** Optional ID (will be generated if not provided) */
  id?: string;
  /** User ID of the creator */
  created_by: string;
  /** Asphalt type name */
  name: string;
  /** Minimum compaction percentage */
  compaction_min?: number;
  /** Minimum Job Mix Formula temperature (°F) */
  jmf_temp_min?: number;
  /** Maximum Job Mix Formula temperature (°F) */
  jmf_temp_max?: number;
  /** Lift depth in inches */
  lift_depth_inches?: number;
  /** Target spread rate in lbs/SY */
  target_spread_rate_lbs_per_sy?: number;
  /** Additional notes */
  notes?: string;
  /** Session ID for demo data */
  session_id?: string;
  /** Allow other properties */
  [key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing asphalt type by ID
 * @param _id Asphalt type UUID to update
 * @param _data Asphalt type data to update
 * @returns void
 */
export type UpdateAsphaltTypesFunction = (
  _id: string, 
  _data: {
    /** Asphalt type name */
    name?: string;
    /** Minimum compaction percentage */
    compaction_min?: number;
    /** Minimum Job Mix Formula temperature (°F) */
    jmf_temp_min?: number;
    /** Maximum Job Mix Formula temperature (°F) */
    jmf_temp_max?: number;
    /** Lift depth in inches */
    lift_depth_inches?: number;
    /** Target spread rate in lbs/SY */
    target_spread_rate_lbs_per_sy?: number;
    /** Additional notes */
    notes?: string;
    /** Session ID for demo data */
    session_id?: string;
    /** Allow other properties */
    [key: string]: unknown;
  }
) => Promise<void>;

/**
 * Deletes an asphalt type by ID
 * @param _id Asphalt type UUID to delete
 * @returns void
 */
export type DeleteAsphaltTypesFunction = (_id: string) => Promise<void>;

// ==============================================
// DUMP TRUCKS RPCs
// ==============================================

/**
 * Creates a new dump truck entry in the database
 * @param _data Dump truck data including required fields
 * @returns The UUID of the newly created dump truck
 */
export type InsertDumpTrucksFunction = (_data: {
  /** Optional ID (will be generated if not provided) */
  id?: string;
  /** User ID of the creator */
  created_by: string;
  /** Truck number/identifier */
  truck_number?: string;
  /** Truck company name */
  company_name?: string;
  /** Truck capacity in tons */
  capacity_tons?: number;
  /** Truck driver's name */
  driver_name?: string;
  /** Driver's contact information */
  driver_contact?: string;
  /** License plate */
  license_plate?: string;
  /** Additional notes */
  notes?: string;
  /** Session ID for demo data */
  session_id?: string;
  /** Allow other properties */
  [key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing dump truck entry by ID
 * @param _id Dump truck UUID to update
 * @param _data Dump truck data to update
 * @returns void
 */
export type UpdateDumpTrucksFunction = (
  _id: string, 
  _data: {
    /** Truck number/identifier */
    truck_number?: string;
    /** Truck company name */
    company_name?: string;
    /** Truck capacity in tons */
    capacity_tons?: number;
    /** Truck driver's name */
    driver_name?: string;
    /** Driver's contact information */
    driver_contact?: string;
    /** License plate */
    license_plate?: string;
    /** Additional notes */
    notes?: string;
    /** Session ID for demo data */
    session_id?: string;
    /** Allow other properties */
    [key: string]: unknown;
  }
) => Promise<void>;

/**
 * Deletes a dump truck entry by ID
 * @param _id Dump truck UUID to delete
 * @returns void
 */
export type DeleteDumpTrucksFunction = (_id: string) => Promise<void>;

// ==============================================
// TACK RATES RPCs
// ==============================================

/**
 * Creates a new tack rate entry in the database
 * @param _data Tack rate data including required fields
 * @returns The UUID of the newly created tack rate
 */
export type InsertTackRatesFunction = (_data: {
  /** Optional ID (will be generated if not provided) */
  id?: string;
  /** User ID of the creator */
  created_by: string;
  /** Tack rate name/type */
  name?: string;
  /** Application rate in gallons per square yard */
  app_rate_gal_per_sy?: number;
  /** Residual rate */
  residual_rate?: number;
  /** Dilution percentage */
  dilution_percent?: number;
  /** Additional notes */
  notes?: string;
  /** Session ID for demo data */
  session_id?: string;
  /** Allow other properties */
  [key: string]: unknown;
}) => Promise<string>;

/**
 * Updates an existing tack rate entry by ID
 * @param _id Tack rate UUID to update
 * @param _data Tack rate data to update
 * @returns void
 */
export type UpdateTackRatesFunction = (
  _id: string, 
  _data: {
    /** Tack rate name/type */
    name?: string;
    /** Application rate in gallons per square yard */
    app_rate_gal_per_sy?: number;
    /** Residual rate */
    residual_rate?: number;
    /** Dilution percentage */
    dilution_percent?: number;
    /** Additional notes */
    notes?: string;
    /** Session ID for demo data */
    session_id?: string;
    /** Allow other properties */
    [key: string]: unknown;
  }
) => Promise<void>;

/**
 * Deletes a tack rate entry by ID
 * @param _id Tack rate UUID to delete
 * @returns void
 */
export type DeleteTackRatesFunction = (_id: string) => Promise<void>;
