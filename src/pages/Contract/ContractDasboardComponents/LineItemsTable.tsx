import React from 'react';

interface LineItem {
  id: string;
  line_code: string;
  description: string;
  unit_measure: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  amount_paid: number;
}

interface LineItemsTableProps {
  items: LineItem[];
  onDeleteLine?: (lineId: string) => void;
}

export const LineItemsTable: React.FC<LineItemsTableProps> = ({ items }) => {
  if (items.length === 0) {
    return <p className="text-gray-400 p-4">No line items available for this map.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-white">
        <thead>
          <tr className="border-b border-background-lighter">
            <th className="text-left p-2">Line Code</th>
            <th className="text-left p-2">Description</th>
            <th className="text-right p-2">Quantity</th>
            <th className="text-right p-2">Unit</th>
            <th className="text-right p-2">Unit Price</th>
            <th className="text-right p-2">Total Cost</th>
            <th className="text-right p-2">Amount Paid</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-background-lighter">
              <td className="p-2">{item.line_code}</td>
              <td className="p-2">{item.description}</td>
              <td className="p-2 text-right">{item.quantity}</td>
              <td className="p-2 text-right">{item.unit_measure}</td>
              <td className="p-2 text-right">
                ${item.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="p-2 text-right">
                ${item.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="p-2 text-right">
                ${item.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
