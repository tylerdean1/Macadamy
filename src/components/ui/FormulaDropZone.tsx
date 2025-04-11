import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

interface FormulaDropZoneProps {
  value: string;
  onChange: (newValue: string) => void;
}

export const FormulaDropZone: React.FC<FormulaDropZoneProps> = ({ value, onChange }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    const target = e.target as HTMLInputElement;
    const start = target.selectionStart || value.length;
    const end = target.selectionEnd || value.length;
    const newValue = value.slice(0, start) + text + value.slice(end);
    onChange(newValue);
    setDragOver(false);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border rounded-md p-2 ${dragOver ? 'border-primary' : 'border-gray-600'}`}
    >
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type or drop variables/operators here"
        fullWidth
      />
    </div>
  );
};
