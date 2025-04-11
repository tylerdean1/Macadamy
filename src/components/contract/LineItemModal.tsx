import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { LineCodeForm } from './LineCodeForm';
import { FormulaBuilder } from './FormulaBuilder';
import type { Variable, LineItem, Template } from '@/types';

interface LineItemModalProps {
  open: boolean;
  onClose: () => void;
  templates: Template[];
  unitOptions: { label: string; value: string }[];
  onSave: (lineItemData: LineItem) => void;
}

export const LineItemModal: React.FC<LineItemModalProps> = ({
  open,
  onClose,
  templates,
  unitOptions,
  onSave
}) => {
  const [lineItemData, setLineItemData] = React.useState<LineItem>({
    line_code: '',
    description: '',
    quantity: 0,
    unit_price: 0,
    unit_measure: '',
    reference_doc: '',
    formula: '',
    variables: []
  });

  const handleChange = (updated: Partial<LineItem>) => {
    const { formula, variables, ...rest } = updated;
    setLineItemData((prev) => ({
      ...prev,
      ...rest,
      ...(formula !== undefined ? { formula } : {}),
      ...(variables !== undefined ? { variables } : {})
    }));
  };

  const handleFormulaChange = (updated: {
    variables: Variable[];
    formula: string;
  }) => {
    setLineItemData((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleSubmit = () => {
    onSave(lineItemData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div role="dialog" className="w-full max-w-3xl bg-background-light rounded-lg shadow-lg p-6 border border-background-lighter">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Add Line Item</h2>
            <button onClick={onClose} title="Close" className="text-gray-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <LineCodeForm
              templates={templates}
              unitOptions={unitOptions}
              onChange={handleChange}
            />

            <FormulaBuilder
              unitOptions={unitOptions}
              value={{
                variables: lineItemData.variables,
                formula: lineItemData.formula,
              }}
              onChange={handleFormulaChange}
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover"
              onClick={handleSubmit}
            >
              Save Line Item
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
