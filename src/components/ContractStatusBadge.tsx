import React from 'react'; // Import React
import { AlertCircle, Clock, CheckCircle, PauseCircle, FileCheck, Archive } from 'lucide-react'; // Import icons
import { Badge } from './ui/badge'; // Import Badge component
import { BadgeVariant } from '../types'; // Import Badge variant types

// Define props for the ContractStatusBadge component
interface ContractStatusBadgeProps {
  status: 'Draft' | 'Awaiting Assignment' | 'Active' | 'On Hold' | 'Final Review' | 'Closed'; // Allowed status values
  className?: string; // Optional additional CSS classes
}

// ContractStatusBadge component to display contract status with an associated icon and style
export function ContractStatusBadge({ status, className = '' }: ContractStatusBadgeProps) {
  // Function to determine the status details (variant and icon) based on the current status
  const getStatusDetails = (status: string): { variant: BadgeVariant; icon: React.ReactNode } => {
    switch (status) {
      case 'Draft':
        return { variant: 'default', icon: <AlertCircle className="w-4 h-4" /> }; // Badge styles for draft
      case 'Awaiting Assignment':
        return { variant: 'warning', icon: <Clock className="w-4 h-4" /> }; // Badge styles for awaiting assignment
      case 'Active':
        return { variant: 'success', icon: <CheckCircle className="w-4 h-4" /> }; // Badge styles for active
      case 'On Hold':
        return { variant: 'warning', icon: <PauseCircle className="w-4 h-4" /> }; // Badge styles for on hold
      case 'Final Review':
        return { variant: 'info', icon: <FileCheck className="w-4 h-4" /> }; // Badge styles for final review
      case 'Closed':
        return { variant: 'primary', icon: <Archive className="w-4 h-4" /> }; // Badge styles for closed
      default:
        return { variant: 'default', icon: <AlertCircle className="w-4 h-4" /> }; // Fallback for unknown status
    }
  };

  const { variant, icon } = getStatusDetails(status); // Extract status details

  return (
    <Badge
      variant={variant} // Pass the variant determined based on status
      icon={icon} // Pass the associated icon
      className={className} // Additional styling if provided
    >
      {status} {/* Display the status text */}
    </Badge>
  );
}
