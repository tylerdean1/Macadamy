import React from 'react'; // Import React library
import { Dialog } from '@headlessui/react'; // Import Dialog component for modal
import { X } from 'lucide-react'; // Import close icon
import { LineCodeForm } from './LineCodeForm'; // Import LineCodeForm component for line item details
import { FormulaBuilder } from './FormulaBuilder'; // Import FormulaBuilder for handling formulas
import type { Variable, LineItem, Template } from '@/types'; // Import types for Variable, LineItem, and Template

// Define props for LineItemModal component
interface LineItemModalProps {
  open: boolean; // State to control modal visibility
  onClose: () => void; // Callback to handle modal close
  templates: Template[]; // Array of templates for line items
  unitOptions: { label: string; value: string }[]; // Options for unit selection
  onSave: (lineItemData: LineItem) => void; // Callback to save the line item data
}

// LineItemModal component for adding or editing line items
export const LineItemModal: React.FC<LineItemModalProps> = ({
  open,
  onClose,
  templates,
  unitOptions,
  onSave
}) => {
  const [lineItemData, setLineItemData] = React.useState<LineItem>({
    lineCode: '',       // Changed from line_code to lineCode
    description: '',
    quantity: 0,
    unitPrice: 0,       // Changed from unit_price to unitPrice
    unitMeasure: '',    // Changed from unit_measure to unitMeasure
    referenceDoc: '',   // Changed from reference_doc to referenceDoc
    formula: '',
    variables: []
  });

  // Handle changes to line item data from inputs
  const handleChange = (updated: Partial<LineItem>) => {
    const { formula, variables, ...rest } = updated; // Destructure updated values
    setLineItemData((prev) => ({
      ...prev,
      ...rest,
      ...(formula !== undefined ? { formula } : {}), // Update formula if provided
      ...(variables !== undefined ? { variables } : {}), // Update variables if provided
    }));
  };

  // Handle formula changes from FormulaBuilder component
  const handleFormulaChange = (updated: {
    variables: Variable[]; // Updated variables
    formula: string; // Updated formula
  }) => {
    setLineItemData((prev) => ({
      ...prev,
      ...updated, // Update line item data with new variables and formula
    }));
  };

  // Handle submission of line item data
  const handleSubmit = () => {
    onSave(lineItemData); // Call onSave with current line item data
    onClose(); // Close modal after saving
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-3xl bg-background-light rounded-lg shadow-lg p-6 border border-background-lighter">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Add Line Item</h2> {/* Modal title */}
            <button onClick={onClose} title="Close" className="text-gray-400 hover:text-white transition">
              <X className="w-5 h-5" /> {/* Close icon */}
            </button>
          </div>

          <div className="space-y-6">
            <LineCodeForm
              templates={templates} // Pass templates to the line code form
              unitOptions={unitOptions} // Pass unit options to the line code form
              onChange={handleChange} // Handle changes in line item data
            />

            <FormulaBuilder
              unitOptions={unitOptions} // Pass unit options to the formula builder
              value={{
                variables: lineItemData.variables, // Current variables
                formula: lineItemData.formula, // Current formula
              }}
              onChange={handleFormulaChange} // Handle changes to formula in the builder
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
              onClick={onClose} // Cancel button to close modal
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover"
              onClick={handleSubmit} // Save button to trigger submission
            >
              Save Line Item
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
