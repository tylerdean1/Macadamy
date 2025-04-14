import React, { forwardRef } from 'react'; // Import React and forwardRef

// Define props for the Input component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Optional label for the input
  helperText?: string; // Optional helper text displayed below the input
  error?: string; // Optional error message to be shown if there's an error
  startAdornment?: React.ReactNode; // Optional element to render at the start of the input
  endAdornment?: React.ReactNode; // Optional element to render at the end of the input
  fullWidth?: boolean; // Control if the input should take full width
}

// Create the Input component using forwardRef for direct access to the input element
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className = '', // Default className to an empty string
    label,
    helperText,
    error,
    startAdornment,
    endAdornment,
    fullWidth = false, // Defaults to false
    id,
    ...props // Spread remaining props for the input element
  }, ref) => {
    // Generate a unique ID if one is not provided
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}> {/* Set full width if specified */}
        {label && ( // Render the label if it exists
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative"> {/* Wrapper for the input */}
          {startAdornment && ( // Render the start adornment if provided
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {startAdornment}
            </div>
          )}
          <input
            id={inputId}  // Bind the generated ID to the input element
            ref={ref} // Forward ref to access the input directly
            className={`
              bg-background
              border
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-primary'} // Conditional styles based on error
              text-white
              rounded-md
              px-3
              py-2
              ${startAdornment ? 'pl-10' : ''} // Extra padding for start adornment
              ${endAdornment ? 'pr-10' : ''} // Extra padding for end adornment
              focus:outline-none
              focus:ring-2
              focus:border-transparent
              transition-colors
              ${fullWidth ? 'w-full' : ''} // Full width if specified
              ${className} // Additional classes to apply
            `}
            {...props} // Spread other props for the input
          />
          {endAdornment && ( // Render the end adornment if provided
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {endAdornment}
            </div>
          )}
        </div>
        {(helperText || error) && ( // Display helper text or error message if present
          <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-400'}`}>
            {error || helperText} // Show either error or helper text
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; // Set display name for debugging purposes