import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LineItemModal } from './LineItemModal';
import type { LineItem, Template } from '@/types';

interface LineItemsFormProps {
  items: LineItem[];
  templates: Template[];
  unitOptions: { label: string; value: string }[];
  onChange: (updatedItems: LineItem[]) => void;
}

export const LineItemsForm: React.FC<LineItemsFormProps> = ({
  items,
  templates,
  unitOptions,
  onChange,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleAdd = (item: LineItem) => {
    onChange([...items, item]);
  };

  const handleEdit = (updated: LineItem) => {
    if (editIndex === null) return;
    const updatedItems = [...items];
    updatedItems[editIndex] = updated;
    onChange(updatedItems);
    setEditIndex(null);
  };

  const handleRemove = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-semibold">{item.line_code || `Line Item ${index + 1}`}</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditIndex(index); setModalOpen(true); }}>
                Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleRemove(index)}>
                Remove
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-300">{item.description}</p>
        </Card>
      ))}

      <div className="text-right">
        <Button onClick={() => { setEditIndex(null); setModalOpen(true); }}>
          Add Line Item
        </Button>
      </div>

      <LineItemModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditIndex(null); }}
        templates={templates}
        unitOptions={unitOptions}
        onSave={(item) => {
          if (editIndex === null) {
            handleAdd(item);
          } else {
            handleEdit(item);
          }
          setModalOpen(false);
        }}
      />
    </div>
  );
};
