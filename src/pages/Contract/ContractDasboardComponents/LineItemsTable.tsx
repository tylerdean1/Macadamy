import { useState } from 'react';
import type { LineItem } from '@/hooks/contractHooks';
import { GeometryButton } from '@/pages/Contract/SharedComponents/GoogleMaps/GeometryButton';
import { FormulaModal } from '@/pages/Contract/EditableContractComponents/FormulaModal';
import { Calculator } from 'lucide-react';

interface Props {
  items: LineItem[];
  onLineItemClick?: (item: LineItem) => void;
}

export function LineItemsTable({ items, onLineItemClick }: Props) {
  const [activeFormula, setActiveFormula] = useState<LineItem | null>(null);
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);

  const handleFormulaClick = (item: LineItem) => {
    setActiveFormula(item);
    setFormulaModalOpen(true);
  };

  return (
    <div className="overflow-x-auto relative">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600">
            <th className="text-left px-3 py-2">Line Code</th>
            <th className="text-left px-3 py-2">Description</th>
            <th className="text-left px-3 py-2">Unit</th>
            <th className="text-right px-3 py-2">Qty</th>
            <th className="text-right px-3 py-2">Unit Price</th>
            <th className="text-right px-3 py-2">Total</th>
            <th className="text-right px-3 py-2">Paid</th>
            <th className="text-center px-3 py-2">Map</th>
            <th className="text-center px-3 py-2">Formula</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t relative">
              <td className="px-3 py-2">{item.line_code}</td>
              <td className="px-3 py-2">{item.description}</td>
              <td className="px-3 py-2">{item.unit_measure}</td>
              <td className="px-3 py-2 text-right">{item.quantity}</td>
              <td className="px-3 py-2 text-right">${item.unit_price.toFixed(2)}</td>
              <td className="px-3 py-2 text-right">${item.total_cost.toFixed(2)}</td>
              <td className="px-3 py-2 text-right">${item.amount_paid.toFixed(2)}</td>
              <td className="px-3 py-2 text-center">
                {item.coordinates && (
                  <GeometryButton
                    geometry={item.coordinates}
                    wkt={null}
                    table="line_items"
                    targetId={item.id}
                    label="View Map"
                    onSaveSuccess={() => onLineItemClick?.(item)}
                  />
                )}
              </td>
              <td className="px-3 py-2 text-center">
                {item.formula && (
                  <button 
                    onClick={() => handleFormulaClick(item)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="View Formula"
                  >
                    <Calculator size={16} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <FormulaModal
        open={formulaModalOpen}
        onClose={() => setFormulaModalOpen(false)}
        formula={activeFormula?.formula || null}
      />
    </div>
  );
}
