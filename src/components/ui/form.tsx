import { FormFieldProps, FormSectionProps } from '@/lib/ui.types';

export function FormField({
  label,
  htmlFor,
  error,
  children,
  required = false,
  className = '',
  description
}: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && <p className="text-sm text-gray-400 mb-1">{description}</p>}
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
  className = ''
}: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-medium text-white">{title}</h3>}
          {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
