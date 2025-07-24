import React, { useEffect } from 'react'; // Import React and necessary hooks
import { Button } from './button'; // Import custom Button component
import '@/styles/components.css'; // Import custom CSS for modal styling

// Define the props for the Modal component
interface ModalProps {
  isOpen: boolean; // Control the open state of the modal
  onClose: () => void; // Function to call when the modal is closed
  title?: string; // Optional title for the modal
  children: React.ReactNode; // Child components to be rendered inside the modal
  className?: string; // Optional additional classes for styling
  showCloseButton?: boolean; // Control the visibility of the close button
}

// Modal component for displaying overlay content
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '', // Default className to an empty string
  showCloseButton = true // Default to showing the close button
}: ModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose(); // Close modal on ESC key press
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc); // Add event listener when modal is open
    }

    return () => {
      window.removeEventListener('keydown', handleEsc); // Cleanup event listener on unmount
    };
  }, [isOpen, onClose]); // Dependencies 

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}> {/* Overlay that closes the modal on click */}
      <div
        className={`modal-container ${className}`} // Container for the modal content
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="modal-header"> {/* Header section of the modal */}
          {typeof title === 'string' && title.trim() !== '' && ( // Render title if exists and is not empty
            <h2 className="modal-title">{title}</h2>
          )}
          {showCloseButton && ( // Conditionally render the close button
            <Button
              className="modal-close-button"
              onClick={onClose} // Close the modal on button click
              aria-label="Close"
            >
              × {/* X icon for closing */}
            </Button>
          )}
        </div>
        <div className="modal-content"> {/* Main content area of the modal */}
          {children} {/* Render child components or content */}
        </div>
      </div>
    </div>
  );
}
