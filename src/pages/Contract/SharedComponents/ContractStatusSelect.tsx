import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type ContractStatus = Database['public']['Enums']['contract_status'];

interface ContractStatusSelectProps {
  value: ContractStatus;
  onChange: (value: ContractStatus) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * ContractStatusSelect Component
 * 
 * A custom select component for contract status that uses direct RPC calls 
 * to fetch available status options from the database.
 */
export const ContractStatusSelect = ({
  value,
  onChange,
  disabled = false,
  className = '',
}: ContractStatusSelectProps) => {
  const [statusOptions, setStatusOptions] = useState<ContractStatus[]>([]);

  // Fetch status options using direct RPC call
  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        // Direct RPC call to get enum values
        const { data, error } = await supabase.rpc('get_enum_values', {
          enum_type: 'contract_status',
        });

        if (error) throw error;

        const options = data.map((item) => item.value as ContractStatus);
        setStatusOptions(options);
      } catch (error) {
        console.error('Error fetching contract status options:', error);
      }
    };

    void fetchStatusOptions();
  }, []);

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
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => {
          const newValue = e.target.value as ContractStatus;
          onChange(newValue);
        }}
        disabled={disabled}
        aria-label="Contract Status"
        title="Select contract status"
        className={`appearance-none block w-full px-4 py-2 rounded ${getStatusColor(
          value
        )} 
          border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg
          className="h-4 w-4 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};
