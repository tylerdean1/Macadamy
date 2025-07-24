import React, { forwardRef } from 'react';
import { SelectOption } from '@/lib/ui.types';
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
    const selectId = typeof id === 'string' && id.trim() !== '' ? id : `select-${Math.random().toString(36).substring(2, 9)}`;
    const hasLabel = typeof label === 'string' && label.trim() !== '';
    const hasError = typeof error === 'string' && error.trim() !== '';
    const hasHelperText = typeof helperText === 'string' && helperText.trim() !== '';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {hasLabel ? (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-300 mb-1">
            {label}
          </label>
        ) : null}
        <select
          id={selectId}
          ref={ref}
          className={`
            block
            bg-background
            border
            ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-primary'}
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
        {(hasHelperText || hasError) ? (
          <p className={`mt-1 text-sm ${hasError ? 'text-red-500' : 'text-gray-400'}`}>
            {hasError ? error : helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
