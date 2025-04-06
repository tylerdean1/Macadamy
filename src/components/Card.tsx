import React from 'react';
import './styles/components.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  as?: React.ElementType;
}

export function Card({
  children,
  className,
  scrollable,
  as: Component = 'div'
}: CardProps) {
  return (
    <Component className={`card ${scrollable ? 'card-scrollable' : ''} ${className || ''}`}>
      {children}
    </Component>
  );
}

// Modal component for better reusability
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className = '' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={`modal-content ${className}`}>
        {children}
      </div>
    </div>
  );
}
