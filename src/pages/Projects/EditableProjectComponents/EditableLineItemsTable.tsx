import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { supabase } from '@/lib/supabase';
import { UnitMeasureType } from '@/lib/enums';
import { LineItemsWithWktRow, WbsWithWktRow, MapsWithWktRow } from '../../../lib/rpc.types';

interface EditableLineItemsTableProps {
  lineItems: LineItemsWithWktRow[];
  wbsItems: WbsWithWktRow[];
  mapItems: MapsWithWktRow[];
  contractId: string;
  onLineItemCreate: (lineItem: LineItemsWithWktRow) => void;
}

export const EditableLineItemsTable: React.FC<EditableLineItemsTableProps> = ({
  lineItems,
  wbsItems,
  mapItems,
  contractId,
  onLineItemCreate
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [unitOptions, setUnitOptions] = useState<UnitMeasureType[]>([]);
  const [newItem, setNewItem] = useState({
    wbs_id: '',
    map_id: '',
    item_code: '',
    description: '',
    unit_measure: 'Feet (FT)' as UnitMeasureType,
    quantity: 1,
    unit_price: 0,
    reference_doc: ''
  });

  // Fetch unit measure options directly with RPC
  useEffect(() => {
    const fetchUnitOptions = async () => {
      try {
        // Direct RPC call to get enum values
        const { data, error } = await supabase.rpc('get_enum_values', {
          enum_type: 'unit_measure_type'
        });
        if (error) throw error;
        if (Array.isArray(data)) {
          setUnitOptions(data.map(item => item.value as UnitMeasureType));
        }
      } catch (error) {
        console.error('Error fetching unit measure options:', error);
      }
    };
    void fetchUnitOptions();
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateLineItem = async () => {
    if (!newItem.wbs_id) {
      toast.error('Please select a WBS');
      return;
    }
    if (!newItem.item_code) {
      toast.error('Item code is required');
      return;
    }
    if (!newItem.description) {
      toast.error('Description is required');
      return;
    }
    try {
      const lineItemId = uuidv4();
      // Use direct RPC call with correct argument structure
      const { error } = await supabase.rpc('insert_line_item', {
        _contract_id: contractId,
        _wbs_id: newItem.wbs_id,
        _map_id: newItem.map_id ? newItem.map_id : undefined,
        _line_code: newItem.item_code,
        _description: newItem.description,
        _unit_measure: newItem.unit_measure,
        _quantity: newItem.quantity,
        _unit_price: newItem.unit_price,
        _reference_doc: newItem.reference_doc ? newItem.reference_doc : undefined
      });
      if (error) throw error;
      // Get the created line item to ensure we have all fields
      const { data: lineItemsData, error: fetchError } = await supabase
        .rpc('get_line_items_with_wkt', { contract_id_param: contractId });
      if (fetchError) throw fetchError;
      // The backend returns line_code, not item_code
      type BackendLineItem = Omit<LineItemsWithWktRow, 'item_code' | 'unit_measure'> & { line_code: string; unit_measure?: string; unit?: string };
      const createdLineItem = (lineItemsData as BackendLineItem[]).find(item => item.id === lineItemId);
      if (createdLineItem && createdLineItem.id) {
        const validUnitMeasures = Object.values(UnitMeasureType) as string[];
        const fallbackUnit = UnitMeasureType.Feet;
        let safeUnit = fallbackUnit;
        if (typeof createdLineItem.unit_measure === 'string' && validUnitMeasures.includes(createdLineItem.unit_measure)) {
          safeUnit = createdLineItem.unit_measure as UnitMeasureType;
        } else if (typeof createdLineItem.unit === 'string' && validUnitMeasures.includes(createdLineItem.unit)) {
          safeUnit = createdLineItem.unit as UnitMeasureType;
        }
        // When mapping backend line item, add 'item_code' property from 'line_code'
        const safeLineItem: LineItemsWithWktRow = {
          ...createdLineItem,
          unit_measure: safeUnit,
          item_code: createdLineItem.line_code ?? '', // Map line_code to item_code
        };
        onLineItemCreate(safeLineItem);
        toast.success('Line item created successfully');
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error creating line item:', error);
      toast.error('Failed to create line item');
    }
  };

  // Filter maps based on selected WBS
  const filteredMaps = newItem.wbs_id
    ? mapItems.filter(map => map.wbs_id === newItem.wbs_id)
    : [];

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Line Items</h2>
          {!isCreating && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(true)}
            >
              Add Line Item
            </Button>
          )}
        </div>

        {isCreating && (
          <div className="mb-6 p-4 border border-gray-700 rounded-md">
            <h3 className="text-md font-semibold mb-3">Create New Line Item</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    WBS *
                  </label>
                  <select
                    value={newItem.wbs_id}
                    onChange={(e) => {
                      handleInputChange('wbs_id', e.target.value);
                      handleInputChange('map_id', '');
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Select WBS"
                    title="Select a WBS item"
                  >
                    <option value="">Select WBS</option>
                    {wbsItems.map((wbs: WbsWithWktRow) => (
                      <option key={wbs.id} value={wbs.id}>
                        {wbs.wbs_number}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Map
                  </label>
                  <select
                    value={newItem.map_id}
                    onChange={(e) => handleInputChange('map_id', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={!newItem.wbs_id}
                    aria-label="Select Map"
                    title="Select a map for this line item"
                  >
                    <option value="">No Map</option>
                    {filteredMaps.filter((map: MapsWithWktRow) => map.id != null && map.id !== undefined).map((map: MapsWithWktRow) => (
                      <option key={String(map.id)} value={String(map.id)}>
                        {map.map_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Item Code *
                </label>
                <input
                  type="text"
                  value={newItem.item_code}
                  onChange={(e) => handleInputChange('item_code', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. ITEM-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description *
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Description of line item"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Unit
                  </label>
                  <select
                    value={newItem.unit_measure}
                    onChange={(e) => handleInputChange('unit_measure', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Select Unit Measure"
                    title="Select unit of measurement"
                  >
                    {unitOptions.length > 0 ? (
                      unitOptions.map(unit => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Each (EA)">Each (EA)</option>
                        <option value="Linear Feet (LF)">Linear Feet (LF)</option>
                        <option value="Square Feet (SF)">Square Feet (SF)</option>
                        <option value="Square Yard (SY)">Square Yard (SY)</option>
                        <option value="Cubic Yard (CY)">Cubic Yard (CY)</option>
                        <option value="TON">TON</option>
                        <option value="Lump Sum (LS)">Lump Sum (LS)</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    step="0.01"
                    min="0"
                    title="Enter quantity"
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    value={newItem.unit_price}
                    onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    step="0.01"
                    min="0"
                    title="Enter unit price"
                    placeholder="Enter unit price"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Reference Document
                </label>
                <input
                  type="text"
                  value={newItem.reference_doc}
                  onChange={(e) => handleInputChange('reference_doc', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Spec Sheet ABC-123"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setNewItem({
                      wbs_id: '',
                      map_id: '',
                      item_code: '',
                      description: '',
                      unit_measure: 'Each (EA)' as UnitMeasureType,
                      quantity: 1,
                      unit_price: 0,
                      reference_doc: ''
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    void handleCreateLineItem();
                  }}
                >
                  Create Line Item
                </Button>
              </div>
            </div>
          </div>
        )}

        {lineItems.length === 0 && !isCreating ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No line items have been created yet</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreating(true)}
            >
              Create First Line Item
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Code</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">WBS</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Map</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Budget</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {lineItems.map(item => (
                  <tr key={item.id}>
                    <td className="px-3 py-4 text-sm font-medium text-gray-200 whitespace-nowrap">
                      {item.item_code}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-300 whitespace-nowrap">
                      {item.description}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-300 whitespace-nowrap">
                      {item.wbs_id}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-300 whitespace-nowrap">
                      {item.map_id}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-300 whitespace-nowrap text-right">
                      {(item.quantity ?? 0).toFixed(2)} {item.unit_measure}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-300 whitespace-nowrap text-right">
                      {formatCurrency(item.unit_price ?? 0)}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-300 whitespace-nowrap text-right">
                      {formatCurrency((item.quantity ?? 0) * (item.unit_price ?? 0))}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-300 whitespace-nowrap text-center">
                      {/* Budget/Progress bar can be added here if needed */}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-300 whitespace-nowrap text-center">
                      {/* Actions column */}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="px-3 py-3 text-right text-sm font-medium">Total:</td>
                  <td className="px-3 py-3 text-right text-sm font-medium">
                    {formatCurrency(
                      lineItems.reduce((sum, item) => sum + ((item.quantity ?? 0) * (item.unit_price ?? 0)), 0)
                    )}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};
