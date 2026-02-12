/**
 * Geospatial types for WKT-enabled RPC responses
 * These interfaces represent database rows with Well-Known Text geometry data
 */

import type { Database } from "./database.types";

// Base interfaces for WKT-enabled rows
export interface ContractWithWktRow {
    id: string;
    project_id: string | null;
    contract_number: string;
    title: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    budget: number | null;
    status: Database["public"]["Enums"]["general_status"] | null;
    created_at: string | null;
    updated_at: string;
    coordinates_wkt: string | null;
}

export interface WbsWithWktRow {
    id: string;
    contract_id: string;
    wbs_number: string | null;
    description: string | null;
    budget: number | null;
    scope: string | null;
    location: string | null;
    created_at: string | null;
    updated_at: string;
    coordinates_wkt: string | null;
}

export interface LineItemsWithWktRow {
    id: string;
    contract_id: string;
    wbs_id: string;
    map_id: string | null;
    item_code: string | null;
    description: string | null;
    quantity: number;
    unit_price: number;
    unit_measure: Database["public"]["Enums"]["unit_measure"] | null;
    reference_doc: string | null;
    template_id: string | null;
    created_at: string | null;
    updated_at: string;
    coordinates_wkt: string | null;
}

export interface MapsWithWktRow {
    id: string;
    contract_id: string;
    wbs_id?: string; // Adding this for compatibility
    map_number: string;
    location_description: string;
    scale: string | null;
    created_at: string | null;
    updated_at: string;
    coordinates_wkt: string | null;
}

// Profile types for user data
export interface EnrichedProfileRow {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_id: string | null;
    role: Database["public"]["Enums"]["user_role_type"] | null;
    job_title_id: string | null;
    organization_id: string | null;
    organization_name: string | null;
    job_title: string | null;
    created_at: string | null;
    updated_at: string;
    deleted_at: string | null;
    profile_completed_at: string | null;
}

// Add EnrichedProfile type for compatibility
export interface EnrichedProfile {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_id: string | null;
    role: Database["public"]["Enums"]["user_role_type"] | null;
    job_title_id: string | null;
    organization_id: string | null;
    organization_name: string | null;
    job_title: string | null;
    created_at: string | null;
    updated_at: string;
    deleted_at: string | null;
    profile_completed_at: string | null;
}

// Equipment and other entity types
export interface EquipmentRow {
    id: string;
    user_defined_id: string;
    name: string;
    description: string | null;
    equipment_type: Database["public"]["Enums"]["equipment_type"] | null;
    organization_id: string | null;
    created_at: string | null;
    updated_at: string;
    deleted_at: string | null;
}

export interface OrganizationRow {
    id: string;
    name: string;
    description: string | null;
    address: string | null;
    phone: string | null;
    website: string | null;
    created_at: string | null;
    updated_at: string;
    deleted_at: string | null;
}

export interface JobTitleRow {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

// Add missing RPC argument types
export interface UpdateProfileRpcArgs {
    _input: {
        id: string;
        full_name?: string;
        email?: string;
        phone?: string;
        avatar_id?: string;
        job_title_id?: string;
        organization_id?: string;
        role?: Database["public"]["Enums"]["user_role_type"];
    };
}

export interface InsertJobTitleRpcArgs {
    _input: {
        name: string;
    };
}

// Add ProfilesByContractRow for compatibility
export interface ProfilesByContractRow {
    id: string;
    full_name: string | null;
    email: string;
    role: Database["public"]["Enums"]["user_role_type"] | null;
    contract_role: string | null;
    assigned_at: string | null;
}

// Inspection type
export interface Inspection {
    id: string;
    name: string;
    description: string | null;
    inspection_type: string | null;
    date: string | null;
    status: string | null;
    result: Record<string, unknown> | null;
    notes: string | null;
    project_id: string | null;
    contract_id: string | null;
    wbs_id: string | null;
    map_id: string | null;
    inspector_id: string | null;
    created_at: string | null;
    updated_at: string;
    deleted_at: string | null;
}

// Equipment usage type
export interface EquipmentUsage {
    id: string;
    equipment_id: string;
    project_id: string | null;
    operator_id: string | null;
    usage_date: string;
    hours_used: number;
    notes: string | null;
    created_at: string | null;
    updated_at: string;
}

// Equipment item type
export interface EquipmentItem {
    id: string;
    user_defined_id: string;
    name: string;
    description: string | null;
    equipment_type: Database["public"]["Enums"]["equipment_type"] | null;
    organization_id: string | null;
    created_at: string | null;
    updated_at: string;
    deleted_at: string | null;
}

// Labor records type
export interface LaborRecords {
    id: string;
    project_id: string | null;
    employee_id: string | null;
    date: string;
    hours_worked: number;
    hourly_rate: number | null;
    notes: string | null;
    created_at: string | null;
    updated_at: string;
    deleted_at: string | null;
}
