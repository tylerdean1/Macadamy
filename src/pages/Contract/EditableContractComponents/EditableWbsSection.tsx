import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { EditableWbsItem } from './EditableWbsItem';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import type { 
  WbsWithWktRow, 
  MapsWithWktRow, 
  LineItemsWithWktRow
} from '@/lib/rpc.types';

interface EditableWbsSectionProps {
  wbsItems: WbsWithWktRow[];
  mapItems: MapsWithWktRow[];
  lineItems: LineItemsWithWktRow[];
  contractId: string;
  onWbsUpdate: (wbs: WbsWithWktRow) => void;
  onWbsCreate: (wbs: WbsWithWktRow) => void;
  onWbsDelete: (wbsId: string) => void;
  onMapUpdate: (map: MapsWithWktRow) => void;
  onMapCreate: (map: MapsWithWktRow) => void;
  onMapDelete: (mapId: string) => void;
}

export function EditableWbsSection({
  wbsItems,
  mapItems,
  lineItems,
  contractId,
  onWbsUpdate,
  onWbsCreate,
  onWbsDelete,
  onMapUpdate,
  onMapCreate,
  onMapDelete
}: EditableWbsSectionProps) {
  const { profile } = useAuthStore();
  const [isCreatingWbs, setIsCreatingWbs] = useState(false);
  const [newWbsNumber, setNewWbsNumber] = useState('');
  const [newWbsScope, setNewWbsScope] = useState('');
  const [newWbsBudget, setNewWbsBudget] = useState('0');

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  // Calculate budget utilization for a WBS
  const calculateBudgetUtilization = (wbsId: string) => {
    const items = lineItems.filter(item => item.wbs_id === wbsId);
    const wbs = wbsItems.find(w => w.id === wbsId);
    
    if (!wbs || !items.length || wbs.budget <= 0) return 0;
    
    const totalUsed = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    return (totalUsed / wbs.budget) * 100;
  };

  // Get maps count for a WBS
  const getMapsCount = (wbsId: string) => {
    return mapItems.filter(map => map.wbs_id === wbsId).length;
  };

  // Get line items count for a WBS
  const getLineItemsCount = (wbsId: string) => {
    return lineItems.filter(item => item.wbs_id === wbsId).length;
  };

  const handleCreateWbs = async () => {
    if (!newWbsNumber.trim()) {
      toast.error('WBS number is required');
      return;
    }

    try {
      const newWbsId = uuidv4();
      const wbsData = {
        id: newWbsId,
        contract_id: contractId,
        wbs_number: newWbsNumber.trim(),
        scope: newWbsScope.trim() || null,
        budget: parseFloat(newWbsBudget) || 0,
        location: '',
        created_by: profile?.id || '',
      };

      // Use the Supabase RPC call
      const { error } = await supabase.rpc('insert_wbs', { _data: wbsData });
      
      if (error) throw error;

      // Get the created WBS to ensure we have all fields
      const { data: newWbsData, error: fetchError } = await supabase
        .rpc('get_wbs_with_wkt', { contract_id: contractId });
      
      if (fetchError) throw fetchError;
      
      const createdWbs = newWbsData.find(wbs => wbs.id === newWbsId);
      if (createdWbs) {
        onWbsCreate(createdWbs);
        toast.success('WBS created successfully');
        setIsCreatingWbs(false);
        setNewWbsNumber('');
        setNewWbsScope('');
        setNewWbsBudget('0');
      }
    } catch (error) {
      console.error('Error creating WBS:', error);
      toast.error('Failed to create WBS');
    }
  };

  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Work Breakdown Structure</h2>
          {!isCreatingWbs && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCreatingWbs(true)}
            >
              Add WBS
            </Button>
          )}
        </div>

        {isCreatingWbs && (
          <div className="mb-6 p-4 border border-gray-700 rounded-md">
            <h3 className="text-md font-semibold mb-3">Create New WBS</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  WBS Number *
                </label>
                <input
                  type="text"
                  value={newWbsNumber}
                  onChange={(e) => setNewWbsNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. WBS-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Budget ($)
                </label>
                <input
                  type="number"
                  value={newWbsBudget}
                  onChange={(e) => setNewWbsBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter budget amount"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Scope
                </label>
                <textarea
                  value={newWbsScope}
                  onChange={(e) => setNewWbsScope(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe the scope of this WBS"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsCreatingWbs(false);
                    setNewWbsNumber('');
                    setNewWbsScope('');
                    setNewWbsBudget('0');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={handleCreateWbs}
                >
                  Create WBS
                </Button>
              </div>
            </div>
          </div>
        )}

        {wbsItems.length === 0 && !isCreatingWbs ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No WBS items have been created yet</p>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setIsCreatingWbs(true)}
            >
              Create First WBS
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {wbsItems.map(wbs => (
              <EditableWbsItem
                key={wbs.id}
                wbs={wbs}
                maps={mapItems.filter(map => map.wbs_id === wbs.id)}
                lineItems={lineItems.filter(item => item.wbs_id === wbs.id)}
                onUpdate={onWbsUpdate}
                onDelete={onWbsDelete}
                onMapUpdate={onMapUpdate}
                onMapCreate={onMapCreate}
                onMapDelete={onMapDelete}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
