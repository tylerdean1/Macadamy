import { cn } from '@/lib/utils/uiClassUtils';
import type { Database } from '@/lib/database.types';

type ContractStatus = Database['public']['Enums']['contract_status'];

interface ContractStatusBadgeProps {
  status: ContractStatus;
  className?: string;
}

export function ContractStatusBadge({ status, className = '' }: ContractStatusBadgeProps) {
  const getStatusColor = (status: ContractStatus): string => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-700 text-gray-300';
      case 'Awaiting Assignment':
      case 'Bidding Solicitation':
        return 'bg-yellow-700/20 text-yellow-500';
      case 'Active':
      case 'Assigned(Partial)':
      case 'Assigned(Full)':
        return 'bg-green-700/20 text-green-500';
      case 'On Hold':
        return 'bg-orange-700/20 text-orange-500';
      case 'Final Review':
        return 'bg-blue-700/20 text-blue-500';
      case 'Completed':
        return 'bg-purple-700/20 text-purple-500';
      case 'Closed':
      case 'Cancelled':
        return 'bg-red-700/20 text-red-500';
      default:
        return 'bg-gray-700 text-gray-300';
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
      {status}
    </span>
  );
}
