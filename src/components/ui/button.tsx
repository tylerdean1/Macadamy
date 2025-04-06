import React from 'react';
import { ButtonVariant, ButtonSize } from '../../types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-white hover:bg-primary-hover focus:ring-primary/50';
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500/50';
      case 'outline':
        return 'bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 focus:ring-gray-500/50';
      case 'ghost':
        return 'bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-500/50';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50';
      default:
        return 'bg-primary text-white hover:bg-primary-hover focus:ring-primary/50';
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2';
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`inline-flex items-center justify-center rounded focus:outline-none focus:ring-2 transition-colors
        ${getVariantClasses()} ${getSizeClasses()}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}