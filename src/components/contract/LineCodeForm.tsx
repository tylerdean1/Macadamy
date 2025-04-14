import React, { useState, useEffect } from 'react'; // Import React and hooks
import { Input } from '@/components/ui/input'; // Import custom Input component
import { Select } from '@/components/ui/select'; // Import custom Select component
import { FormField, FormSection } from '@/components/ui/form'; // Import form field components
import type { Template, Variable } from '@/types'; // Import types for Template and Variable

/** 
 * LineCodeForm component for managing line item details.
 * 
 * This component allows users to select a template for a line item 
 * and input its specific attributes such as line code, description,
 * quantity, unit price, unit of measure, and any reference documents. 
 * It also integrates state management to track the currently entered line 
 * item data and invokes an onChange callback to update the parent component 
 * whenever changes are made to the input fields.
 */
interface LineCodeFormProps {
  templates: Template[]; // Array of templates to choose from
  unitOptions: { label: string; value: string }[]; // Options for units of measurement
  onChange: (updated: LineCodeData) => void; // Callback to handle changes in line code data
}

// Define the structure of line code data
interface LineCodeData {
  line_code: string; // Code for the line item
  description: string; // Description of the line item
  quantity: number; // Quantity of the line item
  unit_price: number; // Price per unit
  unit_measure: string; // Unit of measure for the item
  reference_doc: string; // Reference document for the item
  formula?: string; // Optional formula associated with the item
  variables?: Variable[]; // Optional variables for the formula
}

// LineCodeForm component for managing line item details
export const LineCodeForm: React.FC<LineCodeFormProps> = ({
  templates, // Templates for line items
  unitOptions, // Options for units of measurement
  onChange // Callback for updating line item data
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom'); // State for selected template
  const [lineCodeData, setLineCodeData] = useState<LineCodeData>({ // State for line item data
    line_code: '',
    description: '',
    quantity: 0,
    unit_price: 0,
    unit_measure: '',
    reference_doc: '',
  });

  useEffect(() => {
    // Use effect to update line code data when a template is selected
    if (selectedTemplate !== 'custom') {
      const template = templates.find(t => t.id === selectedTemplate); // Find selected template
      if (template) {
        const updated: LineCodeData = {  // Prepare updated line code data
          ...lineCodeData,
          description: template.description, // Update description from template
          unit_measure: template.unit_measure, // Update unit measure from template
          formula: template.formula, // Update formula from template
          variables: template.variables, // Update variables from template
        };
        setLineCodeData(updated); // Update state
        onChange(updated); // Notify parent component of changes
      }
    }
  }, [selectedTemplate, templates, lineCodeData, onChange]); // Dependencies for effect

  // Handle changes from input fields
  const handleChange = (field: keyof LineCodeData, value: string | number) => {
    const updated = { ...lineCodeData, [field]: value }; // Create updated line code data
    setLineCodeData(updated); // Update state
    onChange(updated); // Notify parent component of changes
  };

  return (
    <FormSection title="Line Code Details"> {/* Section title */}
      <FormField label="Select Template" htmlFor="template"> {/* Template selection */}
        <Select
          id="template"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)} // Update selected template
          options={[ // Options for template selection
            { value: 'custom', label: 'Build Custom' },
            ...templates.map(t => ({ value: t.id, label: t.title })), // Populate with templates
          ]}
          fullWidth
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Grid layout for inputs */}
        <FormField label="Line Code" htmlFor="line_code" required>
          <Input
            id="line_code"
            value={lineCodeData.line_code}
            onChange={(e) => handleChange('line_code', e.target.value)} // Update line code
            fullWidth
          />
        </FormField>

        <FormField label="Quantity" htmlFor="quantity" required>
          <Input
            id="quantity"
            type="number"
            value={lineCodeData.quantity}
            onChange={(e) => handleChange('quantity', parseFloat(e.target.value))} // Update quantity
            fullWidth
          />
        </FormField>

        <FormField label="Unit Price" htmlFor="unit_price" required>
          <Input
            id="unit_price"
            type="number"
            value={lineCodeData.unit_price}
            onChange={(e) => handleChange('unit_price', parseFloat(e.target.value))} // Update unit price
            fullWidth
          />
        </FormField>

        <FormField label="Unit of Measure" htmlFor="unit_measure" required>
          <Select
            id="unit_measure"
            value={lineCodeData.unit_measure}
            onChange={(e) => handleChange('unit_measure', e.target.value)} // Update unit measure
            options={unitOptions} // Pass unit options
            fullWidth
          />
        </FormField>

        <FormField label="Reference Document (optional)" htmlFor="reference_doc">
          <Input
            id="reference_doc"
            placeholder="Paste a file link or upload system coming later"
            value={lineCodeData.reference_doc}
            onChange={(e) => handleChange('reference_doc', e.target.value)} // Update reference document
            fullWidth
          />
        </FormField>

        <FormField label="Description" htmlFor="description">
          <Input
            id="description"
            value={lineCodeData.description}
            onChange={(e) => handleChange('description', e.target.value)} // Update description
            fullWidth
          />
        </FormField>
      </div>
    </FormSection>
  );
};