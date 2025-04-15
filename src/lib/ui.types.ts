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