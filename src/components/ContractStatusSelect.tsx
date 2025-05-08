import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { Select } from './ui/select';
import { getStatusColor } from '../utils/status-utils';
import {
  CONTRACT_STATUS_SELECT_OPTIONS,
  type ContractStatusValue,
} from '@/lib/enums';

interface ContractStatusSelectProps {
  value: ContractStatusValue;
  onChange: (value: ContractStatusValue) => void;
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

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value as ContractStatusValue;
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
        options={CONTRACT_STATUS_SELECT_OPTIONS}
        value={value}
        onChange={handleChange}
        disabled={disabled || loading}
        className={`${getStatusColor(value)} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Contract Status"
        fullWidth
      />
      {loading && (
        <Loader className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted" />
      )}
    </div>
  );
}
