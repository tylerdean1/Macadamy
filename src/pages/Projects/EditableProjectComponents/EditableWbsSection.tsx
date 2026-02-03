import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { rpcClient } from '@/lib/rpc.client';
import type { WbsWithWktRow } from '@/lib/rpc.types';

interface EditableWbsSectionProps {
  wbsItems: WbsWithWktRow[];
  contractId: string;
  onWbsUpdate: (wbs: WbsWithWktRow) => void;
  onWbsCreate: (wbs: WbsWithWktRow) => void;
  onWbsDelete: (wbsId: string) => void;
}

export function EditableWbsSection({
  wbsItems,
  contractId,
  onWbsUpdate,
  onWbsCreate,
  onWbsDelete
}: EditableWbsSectionProps) {
  const [isCreatingWbs, setIsCreatingWbs] = useState(false);
  const [newWbsNumber, setNewWbsNumber] = useState('');
  const [newWbsScope, setNewWbsScope] = useState('');
  const [newWbsBudget, setNewWbsBudget] = useState('0');

  const handleCreateWbs = async () => {
    if (!newWbsNumber.trim()) {
      toast.error('WBS number is required');
      return;
    }

    try {
      const newWbsId = uuidv4();

      const created = await rpcClient.insert_wbs({
        _input: {
          id: newWbsId,
          project_id: contractId,
          name: newWbsNumber.trim(),
          location: newWbsScope.trim() || null,
          order_num: 0
        }
      });

      const newWbsData = Array.isArray(created) && created.length > 0 ? created[0] : null;

      // When creating WBS, use the returned data and convert to expected interface
      if (newWbsData) {
        const wbsWithWkt: WbsWithWktRow = {
          id: newWbsData.id,
          contract_id: newWbsData.project_id || '',
          wbs_number: newWbsData.name,
          description: null,
          budget: null,
          scope: newWbsData.location,
          location: newWbsData.location,
          created_at: newWbsData.created_at,
          updated_at: newWbsData.updated_at,
          coordinates_wkt: null
        };
        onWbsCreate(wbsWithWkt);
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
                  onClick={() => { void handleCreateWbs(); }}
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
              <div key={wbs.id} className="p-4 border border-gray-700 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-semibold">{wbs.wbs_number}</h3>
                  <div className="text-sm text-gray-400">
                    Budget: {wbs.budget != null ? wbs.budget.toFixed(2) : '0.00'}
                  </div>
                </div>
                <div className="text-sm text-gray-300 mb-2">
                  {wbs.scope}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onWbsUpdate(wbs)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onWbsDelete(wbs.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
