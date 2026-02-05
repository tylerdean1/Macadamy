import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { rpcClient } from '@/lib/rpc.client';
import type { UnitMeasure, Database } from '@/lib/types';

type LineItem = Database['public']['Tables']['line_items']['Row'];
type WbsItem = Database['public']['Tables']['wbs']['Row'];
type MapItem = Database['public']['Tables']['maps']['Row'];

interface EditableLineItemsTableProps {
  lineItems: LineItem[];
  wbsItems: WbsItem[];
  mapItems: MapItem[];
  contractId: string;
  onLineItemCreate: (lineItem: LineItem) => void;
}

export const EditableLineItemsTable: React.FC<EditableLineItemsTableProps> = ({
  lineItems,
  wbsItems,
  mapItems,
  contractId,
  onLineItemCreate
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [unitOptions, setUnitOptions] = useState<UnitMeasure[]>([]);
  const [newItem, setNewItem] = useState({
    wbs_id: '',
    map_id: '',
    name: '', // Changed from item_code to name
    description: '',
    unit_measure: 'Feet (FT)' as UnitMeasure,
    quantity: 1,
    unit_price: 0,
  });

  // Fetch unit measure options directly with RPC
  useEffect(() => {
    const fetchUnitOptions = async () => {
      try {
        // Use the unit options from our database constants instead of calling RPC
        const { UNIT_MEASURE_OPTIONS } = await import('@/lib/types');
        setUnitOptions([...UNIT_MEASURE_OPTIONS]);
      } catch (error) {
        console.error('Error loading unit options:', error);
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
    if (!newItem.name) {
      toast.error('Name is required');
      return;
    }
    if (!newItem.description) {
      toast.error('Description is required');
      return;
    }

    try {
      setIsCreating(true);

      // Use the insert_line_items RPC function with proper JSON input format
      const lineItemData = {
        project_id: contractId,
        wbs_id: newItem.wbs_id,
        map_id: newItem.map_id || null,
        name: newItem.name,
        description: newItem.description,
        unit_measure: newItem.unit_measure,
        quantity: newItem.quantity,
        unit_price: newItem.unit_price,
      };

      const createdData = await rpcClient.insert_line_items({
        _input: lineItemData
      });

      const createdLineItem = Array.isArray(createdData) && createdData.length > 0
        ? (createdData[0] as LineItem)
        : null;

      if (!createdLineItem) {
        throw new Error('Failed to create line item');
      }

      onLineItemCreate(createdLineItem);
      toast.success('Line item created successfully');

      // Reset form
      setNewItem({
        wbs_id: '',
        map_id: '',
        name: '',
        description: '',
        unit_measure: 'Feet (FT)' as UnitMeasure,
        quantity: 1,
        unit_price: 0,
      });

      setIsCreating(false);
    } catch (error) {
      console.error('Error creating line item:', error);
      toast.error('Failed to create line item');
      setIsCreating(false);
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
                    {wbsItems.map((wbs: WbsItem) => (
                      <option key={wbs.id} value={wbs.id}>
                        {wbs.name}
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
                    {filteredMaps.filter((map: MapItem) => map.id != null && map.id !== undefined).map((map: MapItem) => (
                      <option key={String(map.id)} value={String(map.id)}>
                        {map.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Steel Pipe"
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

              <div className="flex justify-end space-x-3 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setNewItem({
                      wbs_id: '',
                      map_id: '',
                      name: '',
                      description: '',
                      unit_measure: 'Feet (FT)' as UnitMeasure,
                      quantity: 1,
                      unit_price: 0,
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
                      {item.name}
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
