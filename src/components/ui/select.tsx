import React, { forwardRef } from 'react';
import { SelectOption } from '../../types';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className = '', 
    label, 
    helperText, 
    error, 
    options,
    id,
    fullWidth = false,
    ...props 
  }, ref) => {
    // Generate a unique ID if one is not provided
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-300 mb-1">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
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
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {(helperText || error) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-400'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

