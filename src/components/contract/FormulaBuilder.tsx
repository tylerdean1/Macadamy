import React, { useState, useEffect } from 'react'; // Import React and hooks
import { Input } from '@/components/ui/input'; // Import custom Input component
import { Select } from '@/components/ui/select'; // Import custom Select component
import { FormField, FormSection } from '@/components/ui/form'; // Import form field components
import { Button } from '@/components/ui/button'; // Import custom Button component
import { FormulaDropZone } from '../ui/FormulaDropZone'; // Import component for formula input area
import { LiveFormulaPreview } from './LiveFormulaPreview'; // Import component to preview formula results
import type { Variable } from '@/types'; // Import type for Variable

/** 
 * FormulaBuilder component for defining and constructing a formula using variables.
 * 
 * This component allows users to manage a list of variables, select units, 
 * and build a mathematical formula using standard operators. The component 
 * triggers updates via the onChange callback to notify parent components 
 * whenever the variables or formula change. Users can add and remove 
 * variables dynamically, and the formula can be constructed using 
 * drag-and-drop functionality.
 */
interface FormulaBuilderProps {
  unitOptions: { label: string; value: string }[]; // Options for unit of measure
  value: {
    variables: Variable[]; // Current variables in the formula
    formula: string; // Current formula being constructed
  };
  onChange: (updated: { variables: Variable[]; formula: string }) => void; // Callback to handle updates
}

// FormulaBuilder component for managing formulas
export const FormulaBuilder: React.FC<FormulaBuilderProps> = ({
  unitOptions,
  value,
  onChange
}) => {
  const [variables, setVariables] = useState<Variable[]>(value.variables || []); // State for formula variables
  const [formula, setFormula] = useState<string>(value.formula || ''); // State for the formula

  // Effect to notify parent component of changes in variables or formula
  useEffect(() => {
    onChange({ variables, formula }); // Call the onChange callback whenever variables or the formula change
  }, [variables, formula, onChange]); // Dependencies for effect

  // Handle updating a variable based on user input
  const updateVariable = (index: number, field: keyof Variable, val: string) => {
    const updated = [...variables]; // Create a copy of variables
    updated[index] = { ...updated[index], [field]: val }; // Update field of the specific variable
    setVariables(updated); // Update state
  };

  // Handle adding a new variable to the formula
  const addVariable = () => {
    setVariables([...variables, { name: '', unit: '', value: 0 }]); // Add a blank variable
  };

  // Handle removing a variable from the formula
  const removeVariable = (index: number) => {
    const updated = [...variables]; // Create a copy of variables
    updated.splice(index, 1); // Remove the specified variable
    setVariables(updated); // Update state
  };

  // Handle inserting a token (variable/operator) into the formula
  const insertToken = (token: string) => {
    setFormula((prev) => prev + token); // Append token to the formula
  };

  return (
    <>
      <FormSection title="Formula Builder" description="Define variables and build a formula using standard math syntax.">
        <div className="space-y-3">
          {variables.map((v, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 items-end">
              <FormField label="Variable Name" htmlFor={`variable-name-${index}`}>
                <Input
                  id={`variable-name-${index}`}
                  value={v.name}
                  onChange={(e) => updateVariable(index, 'name', e.target.value)} // Update variable name
                  fullWidth
                />
              </FormField>
              <FormField label="Unit" htmlFor={`variable-unit-${index}`}>
                <Select
                  id={`variable-unit-${index}`}
                  value={v.unit}
                  onChange={(e) => updateVariable(index, 'unit', e.target.value)} // Update variable unit
                  options={unitOptions} // Provide unit options for selection
                  fullWidth
                />
              </FormField>
              <div className="col-span-2" /> {/* Empty space for layout */}
              <div>
                <Button variant="danger" size="sm" onClick={() => removeVariable(index)}> {/* Button to remove variable */}
                  Remove
                </Button>
              </div>
            </div>
          ))}

          <Button variant="secondary" size="sm" onClick={addVariable}> {/* Button to add a new variable */}
            Add Variable
          </Button>

          <FormField label="Formula" htmlFor="formula-input" description="Drag or click variables and operators to build your formula.">
            <div className="flex flex-wrap gap-2 mb-3"> {/* Display available variables as buttons */}
              {variables.map((v, i) => (
                <button
                  key={i}
                  draggable
                  onClick={() => insertToken(v.name)} // On click, insert variable name into formula
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', v.name)} // Enable drag-and-drop
                  className="bg-gray-700 hover:bg-primary text-white px-2 py-1 rounded text-sm cursor-pointer"
                >
                  {v.name} {/* Display variable name */}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-3"> {/* Display available operators as buttons */}
              {['+', '-', '*', '/', '^', '(', ')', 'sqrt()', 'sin()', 'cos()', 'tan()'].map((op) => (
                <button
                  key={op}
                  draggable
                  onClick={() => insertToken(op)} // On click, insert operator into formula
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', op)} // Enable drag-and-drop
                  className="bg-gray-800 hover:bg-primary text-white px-2 py-1 rounded text-sm cursor-pointer"
                >
                  {op} {/* Display operator */}
                </button>
              ))}
            </div>

            <FormulaDropZone value={formula} onChange={setFormula} /> {/* Drop zone for formula input */}
          </FormField>
        </div>
      </FormSection>

      <LiveFormulaPreview
        formula={formula} // Pass current formula to LiveFormulaPreview
        variables={variables} // Pass current variables to LiveFormulaPreview
      />
    </>
  );
};