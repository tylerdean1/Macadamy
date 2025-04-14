import React, { useState } from 'react'; // Import React and useState hook
import { Button } from '@/components/ui/button'; // Import custom Button component
import { Card } from '@/components/ui/card'; // Import custom Card component
import { LineItemModal } from './LineItemModal'; // Import LineItemModal for editing and adding items
import type { LineItem, Template } from '@/types'; // Import types for LineItem and Template

/** 
 * LineItemsForm component for managing multiple line items in a contract.
 * 
 * This component allows users to view, add, edit, and remove line items,
 * providing a modal interface for detailed input. It maintains an array of 
 * line items in its state and reflects any changes back to the parent 
 * component using the onChange callback. The user can click the "Add Line 
 * Item" button to open a modal form, which can be used to input or edit
 * the details of each line item.
 */
interface LineItemsFormProps {
  items: LineItem[]; // Existing line items
  templates: Template[]; // Array of templates for line items
  unitOptions: { label: string; value: string }[]; // Options for unit selection
  onChange: (updatedItems: LineItem[]) => void; // Callback to update line items
}

// LineItemsForm component for managing line items in a contract
export const LineItemsForm: React.FC<LineItemsFormProps> = ({
  items,
  templates,
  unitOptions,
  onChange,
}) => {
  const [modalOpen, setModalOpen] = useState(false); // State for modal visibility
  const [editIndex, setEditIndex] = useState<number | null>(null); // Index of the item being edited

  // Handle adding a new line item
  const handleAdd = (item: LineItem) => {
    onChange([...items, item]); // Update line items
  };

  // Handle editing an existing line item
  const handleEdit = (updated: LineItem) => {
    if (editIndex === null) return; // Ensure an item is selected for editing
    const updatedItems = [...items]; // Copy existing items
    updatedItems[editIndex] = updated; // Replace edited item
    onChange(updatedItems); // Update line items with edited item
    setEditIndex(null); // Reset edit index
  };

  // Handle removing a line item by its index
  const handleRemove = (index: number) => {
    const updated = [...items]; // Copy existing items
    updated.splice(index, 1); // Remove the item at the specified index
    onChange(updated); // Update line items
  };

  return (
    <div className="space-y-4">
      {/* Render each line item in a card */}
      {items.map((item, index) => (
        <Card key={index} className="p-4"> 
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-semibold">{item.lineCode || `Line Item ${index + 1}`}</h3> {/* Display line code or fallback */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditIndex(index); setModalOpen(true); }}>
                Edit {/* Button to edit item */}
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleRemove(index)}>
                Remove {/* Button to remove item */}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-300">{item.description}</p> {/* Display line item description */}
        </Card>
      ))}

      {/* Button to open modal for adding a new line item */}
      <div className="text-right">
        <Button onClick={() => { setEditIndex(null); setModalOpen(true); }}>
          Add Line Item
        </Button>
      </div>

      {/* Modal for adding or editing line items */}
      <LineItemModal
        open={modalOpen} // Modal visibility state
        onClose={() => { setModalOpen(false); setEditIndex(null); }} // Close modal and reset edit index
        templates={templates} // Pass templates to the modal
        unitOptions={unitOptions} // Pass unit options to the modal
        onSave={(item) => {
          if (editIndex === null) {
            handleAdd(item); // Add new item to list
          } else {
            handleEdit(item); // Edit existing item
          }
          setModalOpen(false); // Close modal after saving
        }}
      />
    </div>
  );
};