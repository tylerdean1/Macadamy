import React from 'react';
import { FaSave as Save } from 'react-icons/fa';
import { Select } from './ui/select';

interface InspectionFormProps {
  inspection: {
    inspector: string;
    inspection_date: string;
    status: string;
    findings: string;
    recommendations: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  onChange: (updatedInspection: Partial<InspectionFormProps['inspection']>) => void;
}

const InspectionForm: React.FC<InspectionFormProps> = ({ inspection, onSubmit, onChange }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="inspector-select" className="block text-sm font-medium text-gray-400 mb-1">
            Inspector
        </label>
        <select
            id="inspector-select" // ✅ label now linked
            title="Inspector"
            value={inspection.inspector}
            onChange={(e) => onChange({ ...inspection, inspector: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            required
        >
            <option value="">Select Inspector</option>
            {/* Insert actual inspector options here */}
        </select>
        </div>

      <div>
        <label htmlFor="inspection-date" className="block text-sm font-medium text-gray-400 mb-1">
            Inspection Date
        </label>
        <input
            id="inspection-date" // ✅ link the label
            type="date"
            value={inspection.inspection_date}
            onChange={(e) => onChange({ ...inspection, inspection_date: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="Select a date" // ✅ satisfies placeholder/title complaint
            required
        />
        </div>

      <Select
        label="Status"
        value={inspection.status}
        onChange={(e) => onChange({ ...inspection, status: e.target.value })}
        options={[
          { label: 'Pending', value: 'Pending' },
          { label: 'Passed', value: 'Passed' },
          { label: 'Failed', value: 'Failed' },
          { label: 'Needs Review', value: 'Needs Review' }
        ]}
        fullWidth
      />

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Findings</label>
        <textarea
          title="Inspection Findings"
          placeholder="Enter findings from the inspection"
          value={inspection.findings}
          onChange={(e) => onChange({ ...inspection, findings: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Recommendations</label>
        <textarea
          title="Inspection Recommendations"
          placeholder="Enter recommendations based on the inspection"
          value={inspection.recommendations}
          onChange={(e) => onChange({ ...inspection, recommendations: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => onChange({})}
          className="px-4 py-2 bg-background border border-background-lighter text-white rounded-md hover:bg-background-lighter transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
        >
          <Save className="w-5 h-5 mr-2" />
          Save
        </button>
      </div>
    </form>
  );
};

export default InspectionForm;
