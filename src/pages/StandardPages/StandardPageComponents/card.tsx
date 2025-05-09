import { CardProps } from '@/lib/ui.types';

export function Card({
  children,
  className = '',
  title,
  subtitle,
  icon,
  footer,
  isHoverable = false
}: CardProps) {
  return (
    <div
      className={`
        bg-background-light 
        rounded-lg 
        border 
        border-background-lighter 
        overflow-hidden
        ${isHoverable ? 'hover:border-primary transition-colors cursor-pointer' : ''}
        ${className}
      `}
    >
      {(title || icon) && (
        <div className="p-4 border-b border-background-lighter">
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-lg font-medium text-white">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
            </div>
            {icon && <div className="text-gray-400">{icon}</div>}
          </div>
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="p-4 border-t border-background-lighter bg-background">
          {footer}
        </div>
      )}
    </div>
  );
}
