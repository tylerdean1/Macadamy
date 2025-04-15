// ui.types.ts
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: ButtonSize;
  icon?: React.ReactNode;
  class_name?: string;
}

export interface CardProps {
  children: React.ReactNode;
  class_name?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  is_hoverable?: boolean;
}

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children?: React.ReactNode;
  required?: boolean;
  class_name?: string;
  description?: string;
  is_required?: boolean;
  error_message?: string;
}
