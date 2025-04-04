import React, { useState } from 'react';
import {
  AlertCircle,
  Clock,
  CheckCircle,
  PauseCircle,
  FileCheck,
  Archive,
  Loader,
} from 'lucide-react';
import { getStatusColor } from '../utils/status-utils';



export type ContractStatus =
  | 'Draft'
  | 'Awaiting Assignment'
  | 'Active'
  | 'On Hold'
  | 'Final Review'
  | 'Closed';

interface ContractStatusSelectProps {
  value: ContractStatus;
  onChange: (value: ContractStatus) => void;
  disabled?: boolean;
  className?: string;
}

export function ContractStatusSelect({
  value,
  onChange,
  disabled = false,
  className = '',
}: ContractStatusSelectProps) {
  const [loading, setLoading] = useState(false);

  const statuses: { value: ContractStatus; label: string; icon: React.ElementType }[] = [
    { value: 'Draft', label: 'Draft', icon: AlertCircle },
    { value: 'Awaiting Assignment', label: 'Awaiting Assignment', icon: Clock },
    { value: 'Active', label: 'Active', icon: CheckCircle },
    { value: 'On Hold', label: 'On Hold', icon: PauseCircle },
    { value: 'Final Review', label: 'Final Review', icon: FileCheck },
    { value: 'Closed', label: 'Closed', icon: Archive },
  ];

  const handleChange = async (newStatus: ContractStatus) => {
    setLoading(true);
    try {
      await onChange(newStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <select
        aria-label="Contract Status"
        value={value}
        onChange={(e) => handleChange(e.target.value as ContractStatus)}
        disabled={disabled}
        className={`w-full px-4 py-2 bg-background border border-background-lighter rounded-md
          focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${getStatusColor(value)}`}
        
      >

        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      {loading && (
        <Loader className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted" />
      )}
    </div>
  );
}


