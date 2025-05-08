import { FormField, FormSection } from '@/components/ui/form';
import type { Database } from '@/lib/database.types';
import { CONTRACT_STATUS_SELECT_OPTIONS } from '@/lib/enums';
import type { ContractStatusValue } from '@/lib/enums';

type Contract = Database['public']['Tables']['contracts']['Row'];

interface ContractInfoFormProps {
  contract: Contract;
  onChange: (contract: Contract) => void;
}

export function ContractInfoForm({ contract, onChange }: ContractInfoFormProps) {
  return (
    <FormSection title="Contract Info">
      <FormField label="Contract Title" htmlFor="title" required>
        <input
          id="title"
          title="Contract Title"
          placeholder="Enter contract title"
          value={contract.title || ''}
          onChange={(e) => onChange({ ...contract, title: e.target.value })}
          className="w-full p-2 bg-background border rounded"
        />
      </FormField>

      <FormField label="Description" htmlFor="description">
        <textarea
          id="description"
          title="Contract Description"
          placeholder="Enter contract description"
          value={contract.description || ''}
          onChange={(e) => onChange({ ...contract, description: e.target.value })}
          className="w-full p-2 bg-background border rounded"
        />
      </FormField>

      <FormField label="Location" htmlFor="location">
        <input
          id="location"
          title="Contract Location"
          placeholder="Enter contract location"
          value={contract.location || ''}
          onChange={(e) => onChange({ ...contract, location: e.target.value })}
          className="w-full p-2 bg-background border rounded"
        />
      </FormField>

      <FormField label="Start Date" htmlFor="start_date">
        <input
          type="date"
          id="start_date"
          title="Start Date"
          placeholder="Select start date"
          value={contract.start_date || ''}
          onChange={(e) => onChange({ ...contract, start_date: e.target.value })}
          className="w-full p-2 bg-background border rounded"
        />
      </FormField>

      <FormField label="End Date" htmlFor="end_date">
        <input
          type="date"
          id="end_date"
          title="End Date"
          placeholder="Select end date"
          value={contract.end_date || ''}
          onChange={(e) => onChange({ ...contract, end_date: e.target.value })}
          className="w-full p-2 bg-background border rounded"
        />
      </FormField>

      <FormField label="Status" htmlFor="status">
        <select
          id="status"
          title="Contract Status"
          value={contract.status || ''}
          onChange={(e) =>
            onChange({ ...contract, status: e.target.value as ContractStatusValue })
          }
          className="w-full p-2 bg-background border rounded"
        >
          <option value="" disabled>
            Select status
          </option>
          {CONTRACT_STATUS_SELECT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormField>
    </FormSection>
  );
}