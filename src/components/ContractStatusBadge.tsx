import { Badge } from './ui/badge';
import { getStatusBadgeMeta } from '@/utils/status-utils';
import type { ContractStatusValue } from '@/lib/enums';

interface ContractStatusBadgeProps {
  status: ContractStatusValue;
  className?: string;
}

export function ContractStatusBadge({ status, className = '' }: ContractStatusBadgeProps) {
  const { variant, icon } = getStatusBadgeMeta(status);

  return (
    <Badge
      variant="default" // You can override if needed
      icon={icon}
      className={`${variant} ${className}`}
    >
      {status}
    </Badge>
  );
}
