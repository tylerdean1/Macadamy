import React, { useState } from 'react'; // Import necessary React hooks
import { Input } from '@/components/ui/input'; // Import Input component for text input

// Define the props for the FormulaDropZone component
interface FormulaDropZoneProps {
  value: string; // The current formula value
  onChange: (newValue: string) => void; // Callback to update the formula value
}

// FormulaDropZone component allows users to drop text or variables into a textarea
export const FormulaDropZone: React.FC<FormulaDropZoneProps> = ({ value, onChange }) => {
  const [dragOver, setDragOver] = useState(false); // State to manage drag-and-drop feedback

  // Handle the drop event to add dropped text to the formula
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); // Prevent default behavior
    const text = e.dataTransfer.getData('text/plain'); // Get the text being dropped
    const target = e.target as HTMLInputElement; // Cast target to input element
    const start = target.selectionStart || value.length; // Get cursor position
    const end = target.selectionEnd || value.length; // Get end of the selection
    const newValue = value.slice(0, start) + text + value.slice(end); // Construct new value
    onChange(newValue); // Update the formula value through the callback
    setDragOver(false); // Reset drag over state
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault(); // Prevent default behavior to allow dropping
        setDragOver(true); // Set drag over state
      }}
      onDragLeave={() => setDragOver(false)} // Reset drag over state when leaving
      onDrop={handleDrop} // Handle drop event to add variable
      className={`border rounded-md p-2 ${dragOver ? 'border-primary' : 'border-gray-600'}`} // Dynamic border color based on drag state
    >
      <Input
        value={value} // Bind current formula value
        onChange={(e) => onChange(e.target.value)} // Update value on input change
        placeholder="Type or drop variables/operators here" // Placeholder text
        fullWidth // Make the input take the full width of the container
      />
    </div>
  );
};