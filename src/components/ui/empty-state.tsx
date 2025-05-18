import React from 'react';

interface EmptyStateProps {
  /**
   * Icon to display in the empty state
   */
  icon?: React.ReactNode;
  /**
   * Main message to display
   */
  message: string;
  /**
   * Optional subtext for additional information
   */
  description?: string;
  /**
   * Optional action button
   */
  actionButton?: React.ReactNode;
  /**
   * Optional additional styling
   */
  className?: string;
}

/**
 * EmptyState Component
 * 
 * Displays a consistent empty state with an icon, message, and optional action button.
 * Used when there's no data to display in a component.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  message,
  description,
  actionButton,
  className = '',
}) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-gray-700 rounded-lg ${className}`}
      role="region" 
      aria-label="Empty content"
    >
      {icon && <div className="mb-4 text-gray-500">{icon}</div>}
      <p className="mb-2 text-base font-medium text-gray-300">{message}</p>
      {description && <p className="mb-4 text-sm text-gray-400">{description}</p>}
      {actionButton && <div className="mt-2">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
