import React from 'react';

interface ErrorStateProps {
  /**
   * The error message or object
   */
  error: Error | string;
  /**
   * Optional callback to retry the operation
   */
  onRetry?: () => void;
  /**
   * Optional title for the error message
   */
  title?: string;
  /**
   * Optional additional styling
   */
  className?: string;
}

/**
 * ErrorState Component
 * 
 * Displays a consistent error state with an optional retry button.
 * This component should be used across all dashboard components for error handling.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  title = 'An error occurred',
  className = '',
}) => {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return (
    <div className={`rounded-lg border border-red-700 bg-red-900/20 p-4 ${className}`} role="alert" aria-live="assertive">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-400">{title}</h3>
          <div className="mt-2 text-sm text-gray-300">
            <p>{errorMessage}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="rounded-md bg-red-900 px-3 py-2 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
