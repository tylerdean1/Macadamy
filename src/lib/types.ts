// Common types used across the application
import React from 'react';

// Profile-related types
export interface Profile {
  id: string;
  role: string;
  full_name: string;
  email: string;
  username: string | null;
  phone: string | null;
  location: string | null;
  avatar_url?: string;
  organization_id?: string | null;
  job_title_id?: string | null;
  organizations?: {
    name: string;
    address: string | null;
    phone: string | null;
    website: string | null;
  };
  job_titles?: {
    title: string;
    is_custom?: boolean;
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
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  created_by: string;
  created_at: string;
}

export interface JobTitle {
  id: string;
  title: string;
  is_custom?: boolean;
}

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

// UI Components types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  isHoverable?: boolean;
}

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children?: React.ReactNode;
  required?: boolean;
  className?: string;
  description?: string;
}