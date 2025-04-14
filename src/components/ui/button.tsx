import React from 'react'; // Import React library
import { ButtonVariant, ButtonSize } from '../../types'; // Import types for button variants and sizes

// Define the interface for ButtonProps, extending the default button attributes
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant; // Optional property to define button style variant
  size?: ButtonSize; // Optional property to define button size
  isLoading?: boolean; // Optional property to indicate if the button is in a loading state
  leftIcon?: React.ReactNode; // Optional property for an icon to display on the left side of the button
  rightIcon?: React.ReactNode; // Optional property for an icon to display on the right side of the button
}

// Button component for rendering styled buttons with various configurations
export function Button({
  children, // Child elements or text displayed inside the button
  className = '', // Additional CSS classes for styling
  variant = 'primary', // Default button variant set to 'primary'
  size = 'md', // Default button size set to 'medium'
  isLoading = false, // Default loading state set to false
  leftIcon, // Optional icon to be displayed on the left side of the button
  rightIcon, // Optional icon to be displayed on the right side of the button
  disabled, // Provides the disabled state passed from props
  ...props // Spread operator for any additional attributes to be passed to the button
}: ButtonProps) {
  // Function to return appropriate CSS classes for the button's variant
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-white hover:bg-primary-hover focus:ring-primary/50'; // Styles for primary button
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500/50'; // Styles for secondary button
      case 'outline':
        return 'bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 focus:ring-gray-500/50'; // Styles for outline button
      case 'ghost':
        return 'bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-500/50'; // Styles for ghost button
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50'; // Styles for danger button
      default:
        return 'bg-primary text-white hover:bg-primary-hover focus:ring-primary/50'; // Fallback to primary button styles
    }
  };

  // Function to return appropriate CSS classes for the button's size
  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'; // Styles for small button
      case 'md':
        return 'px-4 py-2'; // Styles for medium button
      case 'lg':
        return 'px-6 py-3 text-lg'; // Styles for large button
      default:
        return 'px-4 py-2'; // Fallback to medium button styles
    }
  };

  // Determine if the button should be disabled based on loading state or disabled prop
  const isDisabled = disabled || isLoading;

  // Render the button component with the appropriate styles and content
  return (
    <button
      className={`inline-flex items-center justify-center rounded focus:outline-none focus:ring-2 transition-colors
        ${getVariantClasses()} ${getSizeClasses()} // Apply variant and size CSS classes
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''} // Reduce opacity and change cursor if disabled
        ${className}`} // Include any additional CSS classes provided
      disabled={isDisabled} // Disable button if loading or explicitly disabled
      {...props} // Spread any additional props to the button element
    >
      {isLoading && (
        // Render loading spinner if isLoading is true
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>} {/* Render left icon when not in loading state */}
      {children} {/* Render the content passed to the button */}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>} {/* Render right icon when not in loading state */}
    </button>
  );
}