import type { ContractStatusValue } from '@/lib/enums';
import {
  Loader,
  Clock,
  CheckCircle,
  PauseCircle,
  FileText,
  Archive,
  XCircle,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export const getStatusColor = (status: ContractStatusValue): string => {
  switch (status) {
    case 'Draft':
      return 'text-gray-400 border-gray-400';
    case 'Awaiting Assignment':
      return 'text-yellow-500 border-yellow-500';
    case 'Bidding Solicitation':
      return 'text-cyan-500 border-cyan-500';
    case 'Assigned(Partial)':
      return 'text-orange-400 border-orange-400';
    case 'Assigned(Full)':
      return 'text-orange-600 border-orange-600';
    case 'Active':
      return 'text-green-500 border-green-500';
    case 'On Hold':
      return 'text-amber-500 border-amber-500';
    case 'Final Review':
      return 'text-blue-500 border-blue-500';
    case 'Completed':
      return 'text-purple-500 border-purple-500';
    case 'Cancelled':
      return 'text-red-500 border-red-500';
    case 'Closed':
      return 'text-gray-600 border-gray-600';
    default:
      return 'text-gray-400 border-gray-400';
  }
};

export const getStatusBackground = (status: ContractStatusValue): string => {
  switch (status) {
    case 'Draft':
      return 'bg-gray-100 text-gray-700';
    case 'Awaiting Assignment':
      return 'bg-yellow-100 text-yellow-700';
    case 'Bidding Solicitation':
      return 'bg-cyan-100 text-cyan-700';
    case 'Assigned(Partial)':
      return 'bg-orange-100 text-orange-700';
    case 'Assigned(Full)':
      return 'bg-orange-200 text-orange-800';
    case 'Active':
      return 'bg-green-100 text-green-700';
    case 'On Hold':
      return 'bg-amber-100 text-amber-700';
    case 'Final Review':
      return 'bg-blue-100 text-blue-700';
    case 'Completed':
      return 'bg-purple-100 text-purple-700';
    case 'Cancelled':
      return 'bg-red-100 text-red-700';
    case 'Closed':
      return 'bg-gray-200 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const getStatusIcon = (status: ContractStatusValue): JSX.Element => {
  switch (status) {
    case 'Draft':
      return <FileText className="w-4 h-4" />;
    case 'Awaiting Assignment':
      return <Clock className="w-4 h-4" />;
    case 'Bidding Solicitation':
      return <Eye className="w-4 h-4" />;
    case 'Assigned(Partial)':
      return <AlertTriangle className="w-4 h-4" />;
    case 'Assigned(Full)':
    case 'Completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'Active':
      return <CheckCircle className="w-4 h-4" />;
    case 'On Hold':
      return <PauseCircle className="w-4 h-4" />;
    case 'Final Review':
      return <FileText className="w-4 h-4" />;
    case 'Cancelled':
      return <XCircle className="w-4 h-4" />;
    case 'Closed':
      return <Archive className="w-4 h-4" />;
    default:
      return <Loader className="w-4 h-4 animate-spin" />;
  }
};

export const getStatusBadgeMeta = (
  status: ContractStatusValue
): { variant: string; icon: JSX.Element } => {
  return {
    variant: getStatusColor(status),
    icon: getStatusIcon(status),
  };
};