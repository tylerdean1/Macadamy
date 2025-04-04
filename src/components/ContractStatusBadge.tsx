import React from 'react';
import { AlertCircle, Clock, CheckCircle, PauseCircle, FileCheck, Archive } from 'lucide-react';

interface ContractStatusBadgeProps {
  status: 'Draft' | 'Awaiting Assignment' | 'Active' | 'On Hold' | 'Final Review' | 'Closed';
  className?: string;
}

export function ContractStatusBadge({ status, className = '' }: ContractStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-500/10 text-gray-500';
      case 'Awaiting Assignment':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'Active':
        return 'bg-green-500/10 text-green-500';
      case 'On Hold':
        return 'bg-orange-500/10 text-orange-500';
      case 'Final Review':
        return 'bg-blue-500/10 text-blue-500';
      case 'Closed':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft':
        return <AlertCircle className="w-4 h-4" />;
      case 'Awaiting Assignment':
        return <Clock className="w-4 h-4" />;
      case 'Active':
        return <CheckCircle className="w-4 h-4" />;
      case 'On Hold':
        return <PauseCircle className="w-4 h-4" />;
      case 'Final Review':
        return <FileCheck className="w-4 h-4" />;
      case 'Closed':
        return <Archive className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)} ${className}`}>
      {getStatusIcon(status)}
      <span>{status}</span>
    </div>
  );
}