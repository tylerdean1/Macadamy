/**
 * RPC return types for typed database responses
 * These match the actual RPC function return types from Supabase
 */

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
    status: string | null;
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
    unit_measure: string | null;
    reference_doc: string | null;
    template_id: string | null;
    created_at: string | null;
    updated_at: string;
    coordinates_wkt: string | null;
}

export interface MapsWithWktRow {
    id: string;
    contract_id: string;
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
    username: string | null;
    email: string;
    phone: string | null;
    location: string | null;
    role: string | null;
    avatar_id: string | null;
    avatar_url: string | null;
    job_title_id: string | null;
    organization_id: string | null;
    organization_name: string | null;
    job_title: string | null;
    created_at: string | null;
    updated_at: string;
}

// Equipment and other entity types
export interface EquipmentRow {
    id: string;
    equipment_number: string;
    equipment_type: string;
    make: string | null;
    model: string | null;
    year: number | null;
    organization_id: string | null;
    created_at: string | null;
    updated_at: string;
}

export interface OrganizationRow {
    id: string;
    name: string;
    description: string | null;
    created_at: string | null;
    updated_at: string;
}

export interface JobTitleRow {
    id: string;
    title: string;
    description: string | null;
    created_at: string | null;
    updated_at: string;
}
