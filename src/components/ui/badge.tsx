import React from 'react';
import { BadgeProps } from '../../lib/types';

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  icon,
  className = '' 
}: BadgeProps) {
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/10 text-primary';
      case 'success':
        return 'bg-green-500/10 text-green-500';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'danger':
        return 'bg-red-500/10 text-red-500';
      case 'info':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'md':
        return 'text-sm px-2.5 py-0.5';
      case 'lg':
        return 'text-base px-3 py-1';
      default:
        return 'text-sm px-2.5 py-0.5';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${getVariantClasses()} ${getSizeClasses()} ${className}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
}