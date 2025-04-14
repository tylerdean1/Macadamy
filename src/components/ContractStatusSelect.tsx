import React, { useState } from 'react'; // Import React and necessary hooks
import { Loader } from 'lucide-react'; // Import loader icon for loading state
import { Select } from './ui/select'; // Import custom Select component
import { getStatusColor } from '../utils/status-utils'; // Utility function to get colors based on status

// Type definition for contract statuses
export type ContractStatus =
  | 'Draft'
  | 'Awaiting Assignment'
  | 'Active'
  | 'On Hold'
  | 'Final Review'
  | 'Closed';

// Props interface for the ContractStatusSelect component
interface ContractStatusSelectProps {
  value: ContractStatus; // Current status value
  onChange: (value: ContractStatus) => void; // Function to handle changes in status
  disabled?: boolean; // Disable select input
  className?: string; // Additional CSS classes
}

// ContractStatusSelect component for managing contract status
export function ContractStatusSelect({
  value,
  onChange,
  disabled = false, // Default disabled state
  className = '', // Default className
}: ContractStatusSelectProps) {
  const [loading, setLoading] = useState(false); // State for loading indication

  // Define available status options
  const statuses: { value: ContractStatus; label: string }[] = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Awaiting Assignment', label: 'Awaiting Assignment' },
    { value: 'Active', label: 'Active' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Final Review', label: 'Final Review' },
    { value: 'Closed', label: 'Closed' },
  ];

  // Handle status change event
  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value as ContractStatus; // Get new status value
    setLoading(true); // Set loading state before changing status
    try {
      await onChange(newStatus); // Call the onChange callback with the new status
    } finally {
      setLoading(false); // Stop loading after attempting to change status
    }
  };

  return (
    <div className={`relative ${className}`}> {/* Container for the select input */}
      <Select
        options={statuses} // Pass status options to the Select component
        value={value} // Bind current value
        onChange={handleChange} // Bind change handler
        disabled={disabled || loading} // Disable if the loading state or manually specified
        className={`${getStatusColor(value)} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} // Apply styles based on status
        aria-label="Contract Status" // Accessibility label
        fullWidth // Allow the select to be full width
      />

      {loading && (
        <Loader className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted" /> // Show loader while loading
      )}
    </div>
  );
}