import React from 'react';
import { Size } from '@/lib/ui.types';

interface LoadingStateProps {
  /**
   * Optional custom message to display while loading
   */
  message?: string;
  /**
   * Optional size for the loading spinner (sm, md, lg)
   */
  size?: Size;
  /**
   * Optional class name for custom styling
   */
  className?: string;
  /**
   * Whether to show as overlay or inline
   */
  overlay?: boolean;
}

/**
 * LoadingState Component
 * 
 * Displays a consistent loading spinner with an optional message.
 * Can be used as an overlay or inline component.
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  className = '',
  overlay = false,
}) => {
  // Map size to pixel values
  const sizeMap = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-t-2 border-b-2',
    lg: 'h-16 w-16 border-t-3 border-b-3',
  };

  const spinnerClass = sizeMap[size] || sizeMap.md;
  
  if (overlay) {
    return (
      <div className="absolute inset-0 bg-gray-900/70 flex flex-col justify-center items-center z-50 rounded-lg" aria-live="polite" role="status">
        <div className={`${spinnerClass} animate-spin rounded-full border-primary`} />
        {message && <p className="mt-4 text-white">{message}</p>}
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col justify-center items-center py-8 ${className}`} aria-live="polite" role="status">
      <div className={`${spinnerClass} animate-spin rounded-full border-primary`} />
      {message && <p className="mt-4 text-gray-400">{message}</p>}
    </div>
  );
};

export default LoadingState;
