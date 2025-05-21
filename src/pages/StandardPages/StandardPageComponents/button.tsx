import React from 'react';
import type { Variant, Size } from '@/lib/ui.types';
import { getVariantClasses, getSizeClasses } from '@/lib/utils/uiClassUtils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
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
}: ButtonProps): JSX.Element {
  const isDisabled: boolean = Boolean(disabled) || Boolean(isLoading);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
  const variantClasses = (getVariantClasses as any)(variant, 'button') as string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
  const sizeClasses = (getSizeClasses as any)(size, 'button') as string;

  return (
    <button
      className={`inline-flex items-center justify-center rounded focus:outline-none focus:ring-2 transition-colors
        ${variantClasses} ${sizeClasses}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <>
          {Boolean(leftIcon) && <span className="mr-2">{leftIcon}</span>}
          {children}
          {Boolean(rightIcon) && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
