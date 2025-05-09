import React from 'react';
import { Input } from '@/pages/StandardPages/StandardPageComponents/input';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { ContractStatusSelect } from '@/pages/Contract/SharedComponents/ContractStatusSelect';
import { MapPin } from 'lucide-react';
import type { Contracts } from '@/lib/types';
import type { ContractStatusValue } from '@/lib/enums';

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
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          value={contract.title ?? ''}
          onChange={(e) => onChange({ ...contract, title: e.target.value })}
          placeholder="Contract Title"
          aria-label="Contract Title"
        />
        <Input
          value={contract.location ?? ''}
          onChange={(e) => onChange({ ...contract, location: e.target.value })}
          placeholder="Contract Location"
          aria-label="Contract Location"
        />
        <textarea
          value={contract.description ?? ''}
          onChange={(e) => onChange({ ...contract, description: e.target.value })}
          placeholder="Contract Description"
          className="col-span-full bg-background border border-zinc-700 px-3 py-2 rounded text-white"
          rows={3}
          aria-label="Contract Description"
        />
        <ContractStatusSelect
          value={contract.status as ContractStatusValue}
          onChange={(status) => onChange({ ...contract, status })}
        />
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

      <div className="flex items-center justify-between mt-2">
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