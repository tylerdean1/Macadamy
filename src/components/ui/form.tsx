import { FormFieldProps, FormSectionProps } from '../../types'; // Import necessary types for props

// FormField component that wraps input fields with labels, descriptions, and error messages
export function FormField({ 
  label, // Label for the input field
  htmlFor, // HTML for attribute for accessibility
  error, // Optional error message to display if there's a validation error
  children, // Child components (typically input elements)
  required = false, // Indicates if the field is required
  className = '', // Additional CSS classes for styling
  description // Optional description to provide more context
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor} // Set the associated input for accessibility
        className="block text-sm font-medium text-gray-300 mb-1" // Styling for the label
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>} {/* Show asterisk if required */}
      </label>
      {description && (
        <p className="text-sm text-gray-400 mb-1">{description}</p> // Render description if provided
      )}
      {children} {/* Render the children (input field)*/}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>} {/* Render error message if present*/}
    </div>
  );
}

// FormSection component to group form fields with titles and optional descriptions
export function FormSection({ 
  title, // Title for the section
  description, // Optional description for the section
  children, // Child components to be rendered within the section
  className = '' // Additional CSS classes for styling
}: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}> {/* Ensure spacing between items */}
      {(title || description) && ( // Only render if title or description exists
        <div className="mb-4">
          {title && <h3 className="text-lg font-medium text-white">{title}</h3>} {/* Render title if provided */}
          {description && <p className="text-sm text-gray-400">{description}</p>} {/* Render description if provided */}
        </div>
      )}
      {children} {/* Render the children components */}
    </div>
  );
}