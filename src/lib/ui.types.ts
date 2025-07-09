// ui.types.ts
import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
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
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type Variant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline"
  | "ghost";

export type Size = "sm" | "md" | "lg";

/**
 * Contract Dashboard Component Types
 */
import type {
  ContractWithWktRow,
  LineItemsWithWktRow,
  MapsWithWktRow,
  WbsWithWktRow,
} from "@/lib/rpc.types";

/**
 * Base interface for all dashboard components with loading and error states
 */
export interface DashboardComponentBase {
  /**
   * Whether the component is in a loading state
   */
  isLoading?: boolean;
  /**
   * Error state for the component
   */
  error?: Error | string | null;
  /**
   * Retry callback for error states
   */
  onRetry?: () => void;
  /**
   * Additional classNames
   */
  className?: string;
}

/**
 * Common project header props
 */
export interface ProjectHeaderProps extends DashboardComponentBase {
  /**
   * Contract data
   */
  contract: ContractWithWktRow;
  /**
   * Whether the component is in edit mode
   */
  isEditMode?: boolean;
  /**
   * Whether the user can edit the contract
   */
  canEdit?: boolean;
  /**
   * Callback when refresh is requested
   */
  onRefresh?: () => void;
}

/**
 * Project info form props
 */
export interface ProjectInfoFormProps extends DashboardComponentBase {
  /**
   * Contract data
   */
  contractData: ContractWithWktRow;
  /**
   * Whether the component is in edit mode
   */
  isEditMode?: boolean;
  /**
   * Whether we're creating a new contract
   */
  isCreating?: boolean;
  /**
   * Callback when contract data changes
   */
  onContractChange?: (contract: ContractWithWktRow) => void;
}

/**
 * Project totals panel props
 */
export interface ProjectTotalsPanelProps extends DashboardComponentBase {
  /**
   * Total budget for the contract
   */
  totalBudget: number;
  /**
   * Total of all line items
   */
  lineItemsTotal: number;
  /**
   * Remaining budget
   */
  budgetRemaining: number;
  /**
   * Percentage of budget used
   */
  percentUsed: number;
  /**
   * Contract ID
   */
  contractId: string;
}

/**
 * WBS Section props
 */
export interface WbsSectionProps extends DashboardComponentBase {
  /**
   * WBS items
   */
  wbsItems: WbsWithWktRow[];
  /**
   * Map items
   */
  mapItems: MapsWithWktRow[];
  /**
   * Line items
   */
  lineItems: LineItemsWithWktRow[];
  /**
   * Contract ID
   */
  contractId?: string;
}

/**
 * Line items table props
 */
export interface LineItemsTableProps extends DashboardComponentBase {
  /**
   * Line items
   */
  lineItems: LineItemsWithWktRow[];
  /**
   * WBS items for reference
   */
  wbsItems: WbsWithWktRow[];
  /**
   * Map items for reference
   */
  mapItems: MapsWithWktRow[];
  /**
   * Contract ID
   */
  contractId: string;
  /**
   * Whether to show controls for editing
   */
  showControls?: boolean;
  /**
   * Callback when line items change
   */
  onLineItemsChange?: (lineItems: LineItemsWithWktRow[]) => void;
}

/**
 * Common status type for all dashboard components
 */
export type ComponentStatus = "idle" | "loading" | "success" | "error";
