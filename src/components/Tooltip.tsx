import React, { useState, useRef, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full mt-1';
      case 'left':
        return 'right-full mr-1';
      case 'right':
        return 'left-full ml-1';
      case 'top':
      default:
        return 'bottom-full mb-1';
    }
  };

  return (
    <div className="relative inline-block" onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onFocus={showTooltip} onBlur={hideTooltip}>
      {children}
      {isVisible && (
        <div 
          className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm whitespace-nowrap ${getPositionClasses()}`}
          style={{ transform: 'translateX(-50%)', left: '50%' }}
        >
          {content}
          <div 
            className={`absolute w-0 h-0 border-4 border-transparent ${
              position === 'bottom' ? 'border-b-gray-900 -top-2' :
              position === 'left' ? 'border-l-gray-900 -right-2' :
              position === 'right' ? 'border-r-gray-900 -left-2' :
              'border-t-gray-900 -bottom-2'
            }`}
            style={{ left: position === 'top' || position === 'bottom' ? 'calc(50% - 4px)' : undefined }}
          />
        </div>
      )}
    </div>
  );
};
