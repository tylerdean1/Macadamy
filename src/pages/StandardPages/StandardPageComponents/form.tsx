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
  const hasDescription = typeof description === 'string' && description.trim() !== '';
  const hasError = typeof error === 'string' && error.trim() !== '';
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hasDescription ? <p className="text-sm text-gray-400 mb-1">{description}</p> : null}
      {children}
      {hasError ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
  className = ''
}: FormSectionProps) {
  const hasTitle = typeof title === 'string' && title.trim() !== '';
  const hasDescription = typeof description === 'string' && description.trim() !== '';
  return (
    <div className={`space-y-4 ${className}`}>
      {(hasTitle || hasDescription) ? (
        <div className="mb-4">
          {hasTitle ? <h3 className="text-lg font-medium text-white">{title}</h3> : null}
          {hasDescription ? <p className="text-sm text-gray-400">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
