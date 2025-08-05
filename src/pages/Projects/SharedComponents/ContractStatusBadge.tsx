import { cn } from '@/lib/utils/uiClassUtils';
import type { Database } from '@/lib/database.types';

type ContractStatus = Database['public']['Enums']['project_status'];

interface ContractStatusBadgeProps {
  status: ContractStatus;
  className?: string;
}

export function ContractStatusBadge({ status, className = '' }: ContractStatusBadgeProps) {
  const getStatusColor = (status: ContractStatus): string => {
    switch (status) {
      case 'planned':
        return 'bg-gray-700 text-gray-300';
      case 'active':
        return 'bg-green-700/20 text-green-500';
      case 'on_hold':
        return 'bg-orange-700/20 text-orange-500';
      case 'complete':
        return 'bg-purple-700/20 text-purple-500';
      case 'archived':
      case 'canceled':
        return 'bg-red-700/20 text-red-500';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const getStatusLabel = (status: ContractStatus): string => {
    switch (status) {
      case 'planned':
        return 'Planned';
      case 'active':
        return 'Active';
      case 'on_hold':
        return 'On Hold';
      case 'complete':
        return 'Complete';
      case 'archived':
        return 'Archived';
      case 'canceled':
        return 'Canceled';
      default:
        return status;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getStatusColor(status),
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
