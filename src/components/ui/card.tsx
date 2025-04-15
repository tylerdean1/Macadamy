import { CardProps } from '../../types'; // Import CardProps type for prop management

/** 
 * Card component for displaying content within a styled card.
 * 
 * This component is designed to encapsulate content within a 
 * visually distinct card layout. It allows for optional titles, 
 * subtitles, icons, and footers, along with a customizable hover effect.
 */
export function Card({ 
  children, // Content of the card
  className = '', // Optional additional CSS classes for styling
  title, // Card title (optional)
  subtitle, // Card subtitle (optional)
  icon, // Icon to display on the card (optional)
  footer, // Content to display at the bottom of the card (optional)
  isHoverable = false // Determines if the card should have hover effects
}: CardProps) {
  return (
    <div 
      className={`
        bg-background-light 
        rounded-lg 
        border 
        border-background-lighter 
        overflow-hidden
        ${isHoverable ? 'hover:border-primary transition-colors cursor-pointer' : ''} // Conditionally apply hover styles
        ${className} // Include any additional classes provided
      `}
    >
      {(title || icon) && ( // Render title and icon if present
        <div className="p-4 border-b border-background-lighter">
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-lg font-medium text-white">{title}</h3>} {/* Render the title*/}
              {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>} {/* Render the subtitle */}
            </div>
            {icon && <div className="text-gray-400">{icon}</div>} {/* Render the icon if present */}
          </div>
        </div>
      )}
      <div className="p-4">{children}</div> {/* Main content of the card */}
      {footer && ( // Render footer if provided
        <div className="p-4 border-t border-background-lighter bg-background">
          {footer} {/* Display footer content */}
        </div>
      )}
    </div>
  );
}