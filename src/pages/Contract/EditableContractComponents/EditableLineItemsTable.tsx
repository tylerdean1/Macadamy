import React, { useEffect, useState } from 'react';
import { Input } from '@/pages/StandardPages/StandardPageComponents/input';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { FormulaBuilder } from '@/pages/Contract/EditableContractComponents/FormulaBuilder';
import { useEnumOptions } from '@/hooks/useEnumOptions';
import type { LineItems } from '@/lib/types';
import type { CalculatorTemplate } from '@/lib/formula.types';
import type { SelectOption } from '@/lib/ui.types';

interface EditableLineItemsTableProps {
  items: LineItems[];
  templates: CalculatorTemplate[];
  onChange: (updated: LineItems[]) => void;
  onAdd?: () => void;
  onDelete?: (id: string) => void;
}

export const EditableLineItemsTable: React.FC<EditableLineItemsTableProps> = ({
  items,
  templates,
  onChange,
  onAdd,
  onDelete,
}) => {
  const enumValues = useEnumOptions('unit_measure_type');
  const [unitOptions, setUnitOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const formatted = enumValues.map((value) => ({
      label: value,
      value,
    }));
    setUnitOptions(formatted);
  }, [enumValues]);

  const handleFieldChange = (
    index: number,
    field: keyof LineItems,
    value: string | number | null
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-white font-medium">Line Items</h4>
        {onAdd && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={onAdd}
          >
            Add Line Item
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-white">
          <thead>
            <tr className="border-b border-background-lighter text-left">
              <th className="p-2">Code</th>
              <th className="p-2">Description</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Unit</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((li, index) => (
              <tr key={li.id} className="border-b border-background-lighter">
                <td className="p-2">
                  <Input
                    value={li.line_code}
                    onChange={(e) =>
                      handleFieldChange(index, 'line_code', e.target.value)
                    }
                    placeholder="Code"
                    aria-label="Line Code"
                  />
                </td>
                <td className="p-2">
                  <Input
                    value={li.description}
                    onChange={(e) =>
                      handleFieldChange(index, 'description', e.target.value)
                    }
                    placeholder="Description"
                    aria-label="Line Description"
                  />
                </td>
                <td className="p-2 text-right">
                  <Input
                    type="number"
                    value={li.quantity}
                    onChange={(e) =>
                      handleFieldChange(index, 'quantity', parseFloat(e.target.value))
                    }
                    placeholder="Qty"
                    aria-label="Quantity"
                  />
                </td>
                <td className="p-2 text-right">
                  <select
                    value={li.unit_measure}
                    onChange={(e) =>
                      handleFieldChange(index, 'unit_measure', e.target.value)
                    }
                    className="bg-background border border-gray-600 rounded px-2 py-1 text-white w-full"
                    aria-label="Unit Measure"
                  >
                    {unitOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 text-right">
                  <Input
                    type="number"
                    value={li.unit_price}
                    onChange={(e) =>
                      handleFieldChange(index, 'unit_price', parseFloat(e.target.value))
                    }
                    placeholder="Price"
                    aria-label="Unit Price"
                  />
                </td>
                <td className="p-2 text-right text-green-300 font-medium">
                  ${Number(li.quantity * li.unit_price || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="p-2">
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={() => onDelete(li.id)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.map((li) => {
        const template = templates.find((t) => t.id === li.template_id);
        return template ? (
          <div key={`formula-${li.id}`} className="mt-4">
            <FormulaBuilder
              formula={template.formulas[0]?.expression || ''}
              variables={template.variables}
              onFormulaChange={(newExpr) => {
                console.log('Updated expression:', newExpr);
              }}
              onVariablesChange={(vars) => {
                console.log('Updated variables:', vars);
              }}
              onSave={() => {
                console.log('Save triggered');
              }}
            />
          </div>
        ) : null;
      })}
    </div>
  );
};