import React from 'react';
import type { Variant, Size } from '@/lib/ui.types';
import { getVariantClasses, getSizeClasses } from '@/lib/utils/uiClassUtils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = ''
}: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full 
      ${getVariantClasses(variant, 'badge')} ${getSizeClasses(size, 'badge')} ${className}`}>
      {Boolean(icon) && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
}
