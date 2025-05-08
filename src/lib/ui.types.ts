// ui.types.ts
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: ButtonSize;
  icon?: React.ReactNode;
  className?: string; // Updated the naming convention
}

export interface CardProps {
  children: React.ReactNode;
  className?: string; // Updated the naming convention
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  isHoverable?: boolean; // Optional: updated camelCase for consistency
}

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children?: React.ReactNode;
  required?: boolean;
  className?: string; // Updated the naming convention
  description?: string;
}

export interface FormSectionProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: React.ReactNode; // Optional: for custom rendering
}

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

  export type Variant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline'
  | 'ghost';

export type Size = 'sm' | 'md' | 'lg';