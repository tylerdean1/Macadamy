import { CardProps } from '@/lib/ui.types';

export function Card({
  children,
  className = '',
  title,
  subtitle,
  icon,
  footer,
  isHoverable = false
}: CardProps): JSX.Element {
  return (
    <div
      className={`
        bg-background-light 
        rounded-lg 
        border 
        border-background-lighter 
        overflow-hidden
        ${isHoverable === true ? 'hover:border-primary transition-colors cursor-pointer' : ''}
        ${className}
      `}
    >
      {(Boolean(title) || Boolean(icon)) && (
        <div className="p-4 border-b border-background-lighter">
          <div className="flex items-center justify-between">
            <div>
              {Boolean(title) && <h3 className="text-lg font-medium text-white">{title}</h3>}
              {Boolean(subtitle) && <p className="text-sm text-gray-400">{subtitle}</p>}
            </div>
            {Boolean(icon) && <div className="text-gray-400">{icon}</div>}
          </div>
        </div>
      )}
      <div className="p-4">{children}</div>
      {Boolean(footer) && (
        <div className="p-4 border-t border-background-lighter bg-background">
          {footer}
        </div>
      )}
    </div>
  );
}
