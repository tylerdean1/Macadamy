import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField, FormSection } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { FormulaDropZone } from '../ui/FormulaDropZone';
import { LiveFormulaPreview } from './LiveFormulaPreview';
import type { Variable } from '@/types';

interface FormulaBuilderProps {
  unitOptions: { label: string; value: string }[];
  value: {
    variables: Variable[];
    formula: string;
  };
  onChange: (updated: { variables: Variable[]; formula: string }) => void;
}

export const FormulaBuilder: React.FC<FormulaBuilderProps> = ({
  unitOptions,
  value,
  onChange
}) => {
  const [variables, setVariables] = useState<Variable[]>(value.variables || []);
  const [formula, setFormula] = useState<string>(value.formula || '');

  useEffect(() => {
    onChange({ variables, formula });
  }, [variables, formula, onChange]);

  const updateVariable = (index: number, field: keyof Variable, val: string) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: val };
    setVariables(updated);
  };

  const addVariable = () => {
    setVariables([...variables, { name: '', unit: '', value: 0 }]);
  };

  const removeVariable = (index: number) => {
    const updated = [...variables];
    updated.splice(index, 1);
    setVariables(updated);
  };

  const insertToken = (token: string) => {
    setFormula((prev) => prev + token);
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
                  onChange={(e) => updateVariable(index, 'name', e.target.value)}
                  fullWidth
                />
              </FormField>
              <FormField label="Unit" htmlFor={`variable-unit-${index}`}>
                <Select
                  id={`variable-unit-${index}`}
                  value={v.unit}
                  onChange={(e) => updateVariable(index, 'unit', e.target.value)}
                  options={unitOptions}
                  fullWidth
                />
              </FormField>
              <div className="col-span-2" />
              <div>
                <Button variant="danger" size="sm" onClick={() => removeVariable(index)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}

          <Button variant="secondary" size="sm" onClick={addVariable}>
            Add Variable
          </Button>

          <FormField label="Formula" htmlFor="formula-input" description="Drag or click variables and operators to build your formula.">
            <div className="flex flex-wrap gap-2 mb-3">
              {variables.map((v, i) => (
                <button
                  key={i}
                  draggable
                  onClick={() => insertToken(v.name)}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', v.name)}
                  className="bg-gray-700 hover:bg-primary text-white px-2 py-1 rounded text-sm cursor-pointer"
                >
                  {v.name}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {['+', '-', '*', '/', '^', '(', ')', 'sqrt()', 'sin()', 'cos()', 'tan()'].map((op) => (
                <button
                  key={op}
                  draggable
                  onClick={() => insertToken(op)}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', op)}
                  className="bg-gray-800 hover:bg-primary text-white px-2 py-1 rounded text-sm cursor-pointer"
                >
                  {op}
                </button>
              ))}
            </div>

            <FormulaDropZone value={formula} onChange={setFormula} />
          </FormField>
        </div>
      </FormSection>

      <LiveFormulaPreview
        formula={formula}
        variables={variables}
      />
    </>
  );
};
