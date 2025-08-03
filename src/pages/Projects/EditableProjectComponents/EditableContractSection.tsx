import React from 'react';
import { Input } from '@/pages/StandardPages/StandardPageComponents/input';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { ContractStatusSelect } from '@/pages/Projects/SharedComponents/ContractStatusSelect';
import { MapPin, Save } from 'lucide-react';
import type { Contracts } from '@/lib/types';
import type { ProjectStatus } from '@/lib/types';

interface EditableContractSectionProps {
  contract: Contracts;
  onChange: (updated: Contracts) => void;
  onSave?: () => void;
  onOpenMapModal?: () => void;
}

export const EditableContractSection: React.FC<EditableContractSectionProps> = ({
  contract,
  onChange,
  onSave,
  onOpenMapModal,
}) => {
  // Handle status change
  const handleStatusChange = (status: ProjectStatus) => {
    onChange({ ...contract, status });
  };

  return (
    <div className="border-b border-background-lighter pb-6 mb-6 space-y-4">
      {/* Contract Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1 w-full">
          <Input
            value={contract.title ?? ''}
            onChange={(e) => onChange({ ...contract, title: e.target.value })}
            placeholder="Contract Title"
            className="text-xl font-bold w-full"
            aria-label="Contract Title"
          />

          <div className="mt-2 flex items-center gap-4">
            <ContractStatusSelect
              value={contract.status}
              onChange={handleStatusChange}
            />
          </div>

          <Input
            value={contract.location ?? ''}
            onChange={(e) => onChange({ ...contract, location: e.target.value })}
            placeholder="Contract Location"
            className="mt-2 w-full"
            aria-label="Contract Location"
          />

          <textarea
            value={contract.description ?? ''}
            onChange={(e) => onChange({ ...contract, description: e.target.value })}
            placeholder="Contract Description"
            className="mt-2 w-full bg-background border border-zinc-700 px-3 py-2 rounded text-white"
            rows={2}
            aria-label="Contract Description"
          />
        </div>

        <div className="w-full sm:w-auto space-y-2">
          <p className="text-sm text-gray-500">Contract Period</p>
          <div className="flex flex-col sm:items-end gap-2">
            <Input
              type="date"
              value={contract.start_date ?? ''}
              onChange={(e) => onChange({ ...contract, start_date: e.target.value })}
              placeholder="Start Date"
              aria-label="Start Date"
            />
            <Input
              type="date"
              value={contract.end_date ?? ''}
              onChange={(e) => onChange({ ...contract, end_date: e.target.value })}
              placeholder="End Date"
              aria-label="End Date"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<MapPin className="w-4 h-4" />}
          onClick={onOpenMapModal}
        >
          Edit Contract Geometry
        </Button>

        {onSave && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={onSave}
            className="ml-auto"
          >
            Save Contract
          </Button>
        )}
      </div>
    </div>
  );
};