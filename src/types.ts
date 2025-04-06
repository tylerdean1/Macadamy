import { ReactNode } from 'react';
import {
  Area as LibArea,
  Avatar as LibAvatar,
  Organization as LibOrganization,
  JobTitle as LibJobTitle,
  EditForm as LibEditForm,
  Profile as LibProfile,
  CardProps as LibCardProps
} from './lib/types';
import { ContractStatus as ContractStatusType } from './utils/status-utils';

// UI Component Types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export type ContractStatus = ContractStatusType;
// Form and Data Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Re-export types from lib/types.ts
export type EditForm = LibEditForm;
export type Avatar = LibAvatar;
export type Organization = LibOrganization;
export type JobTitle = LibJobTitle;
export type Area = LibArea;
export type Profile = LibProfile;
export type CardProps = LibCardProps;

// Component props types
export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  className?: string;
}

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
  description?: string;
}

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}