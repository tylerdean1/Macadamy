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
    const inputId = typeof id === 'string' && id.trim() !== '' ? id : `input-${Math.random().toString(36).substring(2, 9)}`;

    const hasLabel = typeof label === 'string' && label.trim() !== '';
    const hasError = typeof error === 'string' && error.trim() !== '';
    const hasHelperText = typeof helperText === 'string' && helperText.trim() !== '';
    const hasStartAdornment = Boolean(startAdornment);
    const hasEndAdornment = Boolean(endAdornment);

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {hasLabel ? (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1">
            {label}
          </label>
        ) : null}
        <div className="relative">
          {hasStartAdornment ? (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {startAdornment}
            </div>
          ) : null}
          <input
            id={inputId}
            ref={ref}
            className={`
              bg-background
              border
              ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-primary'}
              text-white
              rounded-md
              px-3
              py-2
              ${hasStartAdornment ? 'pl-10' : ''}
              ${hasEndAdornment ? 'pr-10' : ''}
              focus:outline-none
              focus:ring-2
              focus:border-transparent
              transition-colors
              ${fullWidth ? 'w-full' : ''}
              ${className}
            `}
            {...props}
          />
          {hasEndAdornment ? (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {endAdornment}
            </div>
          ) : null}
        </div>
        {(hasHelperText || hasError) ? (
          <p className={`mt-1 text-sm ${hasError ? 'text-red-500' : 'text-gray-400'}`}>
            {hasError ? error : helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input'; // Set display name for debugging purposes