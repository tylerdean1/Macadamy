import React from 'react';
import { Download } from 'lucide-react';
import { Size } from '@/lib/ui.types';
import { exportDataToFile } from '@/lib/utils/export-utils';

interface ExportButtonProps {
  /**
   * The label for the button
   */
  label?: string;
  /**
   * The data to export
   */
  data: Record<string, unknown>[] | Record<string, unknown>;
  /**
   * The filename to use (without extension)
   */
  fileName: string;
  /**
   * Export format (csv or json)
   */
  format?: 'csv' | 'json';
  /**
   * Optional icon to display. If not provided, uses Download icon
   */
  icon?: React.ReactNode;
  /**
   * Optional additional styling
   */
  className?: string;
  /**
   * Button size
   */
  size?: Size;
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

/**
 * ExportButton Component
 * 
 * A reusable button for exporting data in CSV or JSON format.
 */
export const ExportButton: React.FC<ExportButtonProps> = ({
  label = 'Export',
  data,
  fileName,
  format = 'csv',
  icon = <Download size={16} />,
  className = '',
  size = 'md',
  variant = 'outline',
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    outline: 'bg-transparent border border-gray-600 hover:bg-gray-800',
    ghost: 'bg-transparent hover:bg-gray-800',
  };

  const handleExport = () => {
    exportDataToFile({
      fileName,
      data,
      format,
    });
  };
  
  return (
    <button
      onClick={handleExport}
      className={`flex items-center gap-1.5 rounded-md ${sizeClasses[size]} ${variantClasses[variant]} transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 ${className}`}
      aria-label={`Export as ${format.toUpperCase()}`}
      title={`Export as ${format.toUpperCase()}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default ExportButton;
