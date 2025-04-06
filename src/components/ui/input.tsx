import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className = '',
    label,
    helperText,
    error,
    startAdornment,
    endAdornment,
    fullWidth = false,
    id,
    ...props
  }, ref) => {
    // Generate a unique ID if one is not provided
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {startAdornment && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {startAdornment}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              bg-background
              border
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-primary'}
              text-white
              rounded-md
              px-3
              py-2
              ${startAdornment ? 'pl-10' : ''}
              ${endAdornment ? 'pr-10' : ''}
              focus:outline-none
              focus:ring-2
              focus:border-transparent
              transition-colors
              ${fullWidth ? 'w-full' : ''}
              ${className}
            `}
            {...props}
          />
          {endAdornment && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {endAdornment}
            </div>
          )}
        </div>
        {(helperText || error) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-400'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

