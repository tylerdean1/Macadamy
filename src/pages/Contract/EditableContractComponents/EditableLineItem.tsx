import React, { useState } from 'react';
import { Save, X, Edit } from 'lucide-react';
import { Input } from '@/pages/StandardPages/StandardPageComponents/input';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { useEnumOptions } from '@/hooks/useEnumOptions';

import type { LineItemsUpdate } from '@/lib/types';
import type { UnitMeasureTypeValue } from '@/lib/enums';

interface EditableLineItemProps {
  lineId: string;
  lineCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unitMeasure: UnitMeasureTypeValue;
  onUpdate: (lineId: string, updates: LineItemsUpdate) => void;
  onDelete: (lineId: string) => void;
}

export const EditableLineItem: React.FC<EditableLineItemProps> = ({
  lineId,
  lineCode,
  description,
  quantity,
  unitPrice,
  unitMeasure,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftLineCode, setDraftLineCode] = useState(lineCode);
  const [draftDescription, setDraftDescription] = useState(description);
  const [draftQuantity, setDraftQuantity] = useState(quantity);
  const [draftUnitPrice, setDraftUnitPrice] = useState(unitPrice);
  const [draftUnitMeasure, setDraftUnitMeasure] = useState<UnitMeasureTypeValue>(unitMeasure);

  const unitOptions = useEnumOptions('unit_measure_type');

  const handleSave = () => {
    onUpdate(lineId, {
      line_code: draftLineCode,
      description: draftDescription,
      quantity: draftQuantity,
      unit_price: draftUnitPrice,
      unit_measure: draftUnitMeasure,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftLineCode(lineCode);
    setDraftDescription(description);
    setDraftQuantity(quantity);
    setDraftUnitPrice(unitPrice);
    setDraftUnitMeasure(unitMeasure);
    setIsEditing(false);
  };

  const totalCost = quantity * unitPrice;

  if (isEditing) {
    return (
      <div className="bg-background-darker p-3 rounded-md border border-background-lighter ml-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input
            value={draftLineCode}
            onChange={(e) => setDraftLineCode(e.target.value)}
            placeholder="Line Code"
            aria-label="Line Code"
          />
          <Input
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
            placeholder="Description"
            aria-label="Description"
          />
          <Input
            type="number"
            value={draftQuantity}
            onChange={(e) => setDraftQuantity(parseFloat(e.target.value) || 0)}
            placeholder="Quantity"
            aria-label="Quantity"
          />
          <Input
            type="number"
            value={draftUnitPrice}
            onChange={(e) => setDraftUnitPrice(parseFloat(e.target.value) || 0)}
            placeholder="Unit Price"
            aria-label="Unit Price"
          />
          <select
            value={draftUnitMeasure}
            onChange={(e) => setDraftUnitMeasure(e.target.value as UnitMeasureTypeValue)}
            className="bg-background border border-zinc-700 text-white rounded px-3 py-2"
            aria-label="Unit Measure"
          >
            <option value="" disabled>Select unit</option>
            {(unitOptions as UnitMeasureTypeValue[]).map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            leftIcon={<X className="w-4 h-4" />}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center ml-8 py-1 text-sm">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{lineCode}</span>
          <span className="text-gray-400">{description}</span>
        </div>
        <div className="flex gap-4 text-xs text-gray-400">
          <span>
            {quantity} {unitMeasure}
          </span>
          <span>${unitPrice.toFixed(2)}/unit</span>
          <span className="font-semibold text-white">${totalCost.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          leftIcon={<Edit className="w-3 h-3" />}
          title="Edit line item"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(lineId)}
          leftIcon={<X className="w-3 h-3" />}
          className="text-red-500 hover:text-red-700"
          title="Delete line item"
        />
      </div>
    </div>
  );
};
