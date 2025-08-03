import type { ProjectStatus } from '@/lib/types';
import {
  Loader,
  CheckCircle,
  PauseCircle,
  FileText,
  Archive,
  XCircle,
} from 'lucide-react';

export const getStatusColor = (status: ProjectStatus): string => {
  switch (status) {
    case 'planned':
      return 'text-blue-500 border-blue-500';
    case 'active':
      return 'text-green-500 border-green-500';
    case 'complete':
      return 'text-purple-500 border-purple-500';
    case 'archived':
      return 'text-gray-600 border-gray-600';
    case 'on_hold':
      return 'text-amber-500 border-amber-500';
    case 'canceled':
      return 'text-red-500 border-red-500';
    default:
      return 'text-gray-400 border-gray-400';
  }
};

export const getStatusBackground = (status: ProjectStatus): string => {
  switch (status) {
    case 'planned':
      return 'bg-blue-100 text-blue-700';
    case 'active':
      return 'bg-green-100 text-green-700';
    case 'complete':
      return 'bg-purple-100 text-purple-700';
    case 'archived':
      return 'bg-gray-200 text-gray-800';
    case 'on_hold':
      return 'bg-amber-100 text-amber-700';
    case 'canceled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const getStatusIcon = (status: ProjectStatus): JSX.Element => {
  switch (status) {
    case 'planned':
      return <FileText className="w-4 h-4" />;
    case 'active':
      return <CheckCircle className="w-4 h-4" />;
    case 'complete':
      return <CheckCircle className="w-4 h-4" />;
    case 'archived':
      return <Archive className="w-4 h-4" />;
    case 'on_hold':
      return <PauseCircle className="w-4 h-4" />;
    case 'canceled':
      return <XCircle className="w-4 h-4" />;
    default:
      return <Loader className="w-4 h-4 animate-spin" />;
  }
};

export const getStatusBadgeMeta = (
  status: ProjectStatus
): { variant: string; icon: JSX.Element } => {
  return {
    variant: getStatusColor(status),
    icon: getStatusIcon(status),
  };
};