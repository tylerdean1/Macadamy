// Common types used across the application
import React from 'react';

// Profile-related types
export interface Profile {
  id: string; // Unique identifier for the profile
  role: string; // User's role (e.g., Admin, Contractor)
  fullName: string; // User's full name
  email: string; // User's email address
  username: string | null; // User's username (optional)
  phone: string | null; // User's phone number (optional)
  location: string | null; // User's location (optional)
  avatarUrl?: string; // URL for the user's avatar image (optional)
  organizationId?: string | null; // ID for the user's organization (optional)
  jobTitleId?: string | null; // ID for the user's job title (optional)
  organizations?: { // Organization details associated with the user
    name: string; // Organization name
    address: string | null; // Organization address (optional)
    phone: string | null; // Organization phone number (optional)
    website: string | null; // Organization website (optional)
  };
  jobTitles?: { // Job title details for the user
    title: string; // Title of the user's job
    isCustom?: boolean; // Indicates if it's a custom title (optional)
  };
}

// Edit form structure for updating profile information
export interface EditForm {
  avatarId: string; // ID of the user's avatar (optional)
  organizationId: string; // Organization ID associated with the user
  jobTitleId: string; // Job title ID associated with the user
  address: string; // User's address
  phone: string; // User's phone number
  email: string; // User's email address
  customJobTitle: string; // Custom job title if applicable
}

// Avatar structure representing user's avatar images
export interface Avatar {
  id: string; // Unique identifier for the avatar
  name: string; // Name of the avatar (or predefined name)
  url: string; // URL of the avatar image
  isPreset: boolean; // Indicates if it is a preset avatar (true/false)
  profileId?: string; // ID of the profile associated with the avatar (optional)
  createdAt: string; // Creation date of the avatar (timestamp)
}

// Organization structure representing user organizations
export interface Organization {
  id: string; // Unique identifier for the organization
  name: string; // Name of the organization
  address: string | null; // Address of the organization (optional)
  phone: string | null; // Phone number of the organization (optional)
  website: string | null; // Website of the organization (optional)
  createdBy: string; // ID of the user who created the organization
  createdAt: string; // Creation date of the organization (timestamp)
}

// Job title structure for users
export interface JobTitle {
  id: string; // Unique identifier for the job title
  title: string; // Title of the job
  isCustom?: boolean; // Indicates if the title is custom (optional)
}

// Interface for cropping coordinates
export interface Area {
  x: number; // X coordinate for cropping
  y: number; // Y coordinate for cropping
  width: number; // Width of the crop area
  height: number; // Height of the crop area
}

// UI components types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'; // Variants the button can take
export type ButtonSize = 'sm' | 'md' | 'lg'; // Size options for buttons

// Props for Badge component
export interface BadgeProps {
  children: React.ReactNode; // Content for the badge
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'; // Optional badge variant
  size?: ButtonSize; // Size of the badge (optional)
  icon?: React.ReactNode; // Optional icon to display in the badge
  className?: string; // Optional additional CSS classes
}

// Props for Card component
export interface CardProps {
  children: React.ReactNode; // Content of the card
  className?: string; // Optional additional CSS classes
  title?: string; // Card title (optional)
  subtitle?: string; // Card subtitle (optional)
  icon?: React.ReactNode; // Optional icon to display in the card
  footer?: React.ReactNode; // Optional footer content
  isHoverable?: boolean; // Indicates if the card is hoverable
}

// Props for FormField component
export interface FormFieldProps {
  label: string; // Label for the form field
  htmlFor: string; // HTML ID for the form field
  error?: string; // Optional error message to display
  children?: React.ReactNode; // Child components (e.g., input fields)
  required?: boolean; // Indicates if this field is required
  className?: string; // Optional additional CSS classes
  description?: string; // Optional description for the field
}