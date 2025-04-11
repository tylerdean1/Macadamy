export type ContractStatus =
  | 'Draft'
  | 'Awaiting Assignment'
  | 'Active'
  | 'On Hold'
  | 'Final Review'
  | 'Closed'
  | 'Completed'
  | 'Cancelled';

export const getStatusColor = (status: ContractStatus): string => {
  switch (status) {
    case 'Draft':
      return 'text-gray-400 border-gray-400';
    case 'Awaiting Assignment':
      return 'text-yellow-500 border-yellow-500';
    case 'Active':
      return 'text-green-500 border-green-500';
    case 'On Hold':
      return 'text-amber-500 border-amber-500';
    case 'Final Review':
      return 'text-blue-500 border-blue-500';
    case 'Closed':
      return 'text-gray-700';
    case 'Completed':
      return 'text-purple-500 border-purple-500';
    case 'Cancelled':
      return 'text-red-500 border-red-500';
    default:
      return 'text-gray-400 border-gray-400';
  }
};
