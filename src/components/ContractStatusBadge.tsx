import React from 'react';
import { AlertCircle, Clock, CheckCircle, PauseCircle, FileCheck, Archive } from 'lucide-react';
import { Badge } from './ui/badge';
import { BadgeVariant } from '../types';

interface ContractStatusBadgeProps {
  status: 'Draft' | 'Awaiting Assignment' | 'Active' | 'On Hold' | 'Final Review' | 'Closed';
  className?: string;
}

export function ContractStatusBadge({ status, className = '' }: ContractStatusBadgeProps) {
  const getStatusDetails = (status: string): { variant: BadgeVariant, icon: React.ReactNode } => {
    switch (status) {
      case 'Draft':
        return { variant: 'default', icon: <AlertCircle className="w-4 h-4" /> };
      case 'Awaiting Assignment':
        return { variant: 'warning', icon: <Clock className="w-4 h-4" /> };
      case 'Active':
        return { variant: 'success', icon: <CheckCircle className="w-4 h-4" /> };
      case 'On Hold':
        return { variant: 'warning', icon: <PauseCircle className="w-4 h-4" /> };
      case 'Final Review':
        return { variant: 'info', icon: <FileCheck className="w-4 h-4" /> };
      case 'Closed':
        return { variant: 'primary', icon: <Archive className="w-4 h-4" /> };
      default:
        return { variant: 'default', icon: <AlertCircle className="w-4 h-4" /> };
    }
  };

  const { variant, icon } = getStatusDetails(status);

  return (
    <Badge
      variant={variant}
      icon={icon}
      className={className}
    >
      {status}
    </Badge>
  );
}