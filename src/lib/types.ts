import type { Database } from './database.types';

export type UserRole = Database['public']['Enums']['user_role'];

export interface Formula {
  name: string;
  expression: string;
  description: string;
}

// Matches the structure of parsed variable JSON
export interface Variable {
  name: string;
  label: string;
  type: string;
  unit: string;
  defaultValue: number;
}

// Parsed version of a calculator template
export interface CalculatorTemplate {
  id: string;
  name: string;
  description: string;
  line_code: string; // You can default this as "N/A" if not stored
  variables: Variable[];
  formulas: Formula[];
}
export interface Profile {
  id: string;
  user_role: UserRole;
  full_name: string;
  email: string;
  username: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  organization_id: string | null;
  job_title_id: string | null;
  organizations?: {
    name: string;
    address: string | null;
    phone: string | null;
    website: string | null;
  };
  job_titles?: {
    title: string;
    is_custom: boolean | null;
  };
}

export interface EditForm {
  avatar_id: string;
  organization_id: string;
  job_title_id: string;
  address: string;
  phone: string;
  email: string;
  custom_job_title: string;
}

export interface Avatar {
  id: string;
  name: string;
  url: string;
  is_preset: boolean;
  profile_id?: string;
  created_at: string | null;
}

export interface Organization {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  created_by: string;
  created_at: string | null;
}

export interface JobTitle {
  id: string;
  title: string;
  is_custom: boolean | null;
}

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}
