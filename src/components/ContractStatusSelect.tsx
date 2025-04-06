import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { Select } from './ui/select';
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

  const statuses: { value: ContractStatus; label: string }[] = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Awaiting Assignment', label: 'Awaiting Assignment' },
    { value: 'Active', label: 'Active' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Final Review', label: 'Final Review' },
    { value: 'Closed', label: 'Closed' },
  ];

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value as ContractStatus;
    setLoading(true);
    try {
      await onChange(newStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Select
        options={statuses}
        value={value}
        onChange={handleChange}
        disabled={disabled || loading}
        className={`${getStatusColor(value)} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Contract Status"
        fullWidth
      />

      {loading && (
        <Loader className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted" />
      )}
    </div>
  );
}