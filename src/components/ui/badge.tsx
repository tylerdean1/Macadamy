import { BadgeProps } from '../../lib/types'; // Import BadgeProps type for prop management

// Badge component for displaying status or category labels
export function Badge({ 
  children, // Child elements/content of the badge
  variant = 'default', // Default badge variant set to 'default'
  size = 'md', // Default badge size set to 'medium'
  icon, // Optional icon to display within the badge
  className = '' // Additional classes for custom styling
}: BadgeProps) {
  
  // Function to return appropriate CSS classes based on the badge's variant
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/10 text-primary'; // Styles for primary badge
      case 'success':
        return 'bg-green-500/10 text-green-500'; // Styles for success badge
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500'; // Styles for warning badge
      case 'danger':
        return 'bg-red-500/10 text-red-500'; // Styles for danger badge
      case 'info':
        return 'bg-blue-500/10 text-blue-500'; // Styles for info badge
      default:
        return 'bg-gray-500/10 text-gray-500'; // Fallback to default badge styles
    }
  };

  // Function to return appropriate CSS classes based on the badge's size
  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5'; // Styles for small badge
      case 'md':
        return 'text-sm px-2.5 py-0.5'; // Styles for medium badge
      case 'lg':
        return 'text-base px-3 py-1'; // Styles for large badge
      default:
        return 'text-sm px-2.5 py-0.5'; // Fallback to medium badge styles
    }
  };

  // Render the badge as a span element with appropriate styles and content
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${getVariantClasses()} ${getSizeClasses()} ${className}`}>
      {icon && <span className="mr-1">{icon}</span>} {/* Render icon if provided */}
      {children} {/* Render the badge's content */}
    </span>
  );
}