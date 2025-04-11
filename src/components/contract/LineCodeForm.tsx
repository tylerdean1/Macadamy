import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField, FormSection } from '@/components/ui/form';
import type { Template, Variable } from '@/types';

interface LineCodeFormProps {
  templates: Template[];
  unitOptions: { label: string; value: string }[];
  onChange: (updated: LineCodeData) => void;
}

interface LineCodeData {
  line_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  unit_measure: string;
  reference_doc: string;
  formula?: string;
  variables?: Variable[];
}

export const LineCodeForm: React.FC<LineCodeFormProps> = ({
  templates,
  unitOptions,
  onChange
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  const [lineCodeData, setLineCodeData] = useState<LineCodeData>({
    line_code: '',
    description: '',
    quantity: 0,
    unit_price: 0,
    unit_measure: '',
    reference_doc: '',
  });

  useEffect(() => {
    if (selectedTemplate !== 'custom') {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        const updated: LineCodeData = {
          ...lineCodeData,
          description: template.description,
          unit_measure: template.unit_measure,
          formula: template.formula,
          variables: template.variables,
        };
        setLineCodeData(updated);
        onChange(updated);
      }
    }
  }, [selectedTemplate, templates, lineCodeData, onChange]);

  const handleChange = (field: keyof LineCodeData, value: string | number) => {
    const updated = { ...lineCodeData, [field]: value };
    setLineCodeData(updated);
    onChange(updated);
  };

  return (
    <FormSection title="Line Code Details">
      <FormField label="Select Template" htmlFor="template">
        <Select
          id="template"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          options={[
            { value: 'custom', label: 'Build Custom' },
            ...templates.map(t => ({ value: t.id, label: t.title }))
          ]}
          fullWidth
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Line Code" htmlFor="line_code" required>
          <Input
            id="line_code"
            value={lineCodeData.line_code}
            onChange={(e) => handleChange('line_code', e.target.value)}
            fullWidth
          />
        </FormField>

        <FormField label="Quantity" htmlFor="quantity" required>
          <Input
            id="quantity"
            type="number"
            value={lineCodeData.quantity}
            onChange={(e) => handleChange('quantity', parseFloat(e.target.value))}
            fullWidth
          />
        </FormField>

        <FormField label="Unit Price" htmlFor="unit_price" required>
          <Input
            id="unit_price"
            type="number"
            value={lineCodeData.unit_price}
            onChange={(e) => handleChange('unit_price', parseFloat(e.target.value))}
            fullWidth
          />
        </FormField>

        <FormField label="Unit of Measure" htmlFor="unit_measure" required>
          <Select
            id="unit_measure"
            value={lineCodeData.unit_measure}
            onChange={(e) => handleChange('unit_measure', e.target.value)}
            options={unitOptions}
            fullWidth
          />
        </FormField>

        <FormField label="Reference Document (optional)" htmlFor="reference_doc">
          <Input
            id="reference_doc"
            placeholder="Paste a file link or upload system coming later"
            value={lineCodeData.reference_doc}
            onChange={(e) => handleChange('reference_doc', e.target.value)}
            fullWidth
          />
        </FormField>

        <FormField label="Description" htmlFor="description">
          <Input
            id="description"
            value={lineCodeData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
          />
        </FormField>
      </div>
    </FormSection>
  );
};
