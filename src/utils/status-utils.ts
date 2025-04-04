import type { ContractStatus } from '../components/ContractStatusSelect';

export const getStatusColor = (status: ContractStatus): string => {
  switch (status) {
    case 'Draft':
      return 'text-gray-500';
    case 'Awaiting Assignment':
      return 'text-yellow-500';
    case 'Active':
      return 'text-green-500';
    case 'On Hold':
      return 'text-orange-500';
    case 'Final Review':
      return 'text-blue-500';
    case 'Closed':
      return 'text-gray-700';
    default:
      return '';
  }
};
