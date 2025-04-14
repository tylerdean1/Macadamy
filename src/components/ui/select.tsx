import React, { forwardRef } from 'react'; // Import React and forwardRef for ref forwarding
import { SelectOption } from '../../types'; // Import types for select options

// Define the props for the Select component
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; // Optional label for the select input
  helperText?: string; // Optional helper text to display below the select input
  error?: string; // Optional error message to show if there's an error
  options: SelectOption[]; // Array of options to be populated in the select dropdown
  fullWidth?: boolean; // Whether the select input should take full width
}

// Create the Select component using forwardRef for ref handling
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    className = '', // Default className is an empty string
    label,
    helperText,
    error,
    options,
    id,
    fullWidth = false, // Defaults to false
    ...props // Spread the remaining props
  }, ref) => {
    // Generate a unique ID if one is not provided
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`; 
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}> {/* Apply full width if specified */}
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-300 mb-1">
            {label} {/* Display the label if provided */}
          </label>
        )}
        <select
          id={selectId} // Set the ID for the select element
          ref={ref} // Forward the ref to the select element
          className={`
            block
            bg-background
            border
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-primary'} 
            text-white 
            rounded-md 
            px-3 
            py-2 
            appearance-none
            focus:outline-none 
            focus:ring-2 
            focus:border-transparent 
            transition-colors
            ${fullWidth ? 'w-full' : ''} // Apply full width if specified
            ${className} // Include any additional classes
          `}
          {...props} // Spread the props onto the select element
        >
          {options.map((option) => ( // Map over the options to create option elements
            <option 
              key={option.value} // Unique key for each option
              value={option.value} // Value for the option
              disabled={option.disabled} // Disable option if specified
            >
              {option.label} // Display the label for the option
            </option>
          ))}
        </select>
        {(helperText || error) && ( // Show helper text or error message if provided
          <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-400'}`}>
            {error || helperText} // Display error or helper text
          </p>
        )}
      </div>
    );
  }
);

// Set display name for the component for better debugging
Select.displayName = 'Select';