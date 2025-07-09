import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { CalculatorTemplate } from '@/lib/formula.types';
import { useEffect, useState } from 'react';
import { Calculator } from 'lucide-react';

interface FormulaModalProps {
  open: boolean;
  onClose: () => void;
  calculator: CalculatorTemplate | null;
}

export function FormulaModal({ open, onClose, calculator }: FormulaModalProps) {
  const [calculatedResult, setCalculatedResult] = useState<number | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'details' | 'calculator'>('details');

  // Reset state when opening with a new calculator
  useEffect(() => {
    if (open && calculator) {
      const initialValues: Record<string, number> = {};
      calculator.variables?.forEach(variable => {
        if (variable.defaultValue == null || Number.isNaN(variable.defaultValue)) {
          initialValues[variable.name] = 0;
        } else {
          initialValues[variable.name] = variable.defaultValue;
        }
      });
      setVariableValues(initialValues);
      setCalculatedResult(null);
    }
  }, [open, calculator]);

  const handleInputChange = (name: string, value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setVariableValues(prev => ({
        ...prev,
        [name]: numericValue
      }));
    }
  };

  const calculateResult = () => {
    if (!calculator?.formula) return;

  // TODO: Use mathjs or similar to evaluate calculator.formulas[0].expression with variableValues
  // Temporary sample calculation until evaluation logic is implemented
    const total = Object.values(variableValues).reduce((sum, value) => sum + value, 0);
    setCalculatedResult(total);
  };

  if (!calculator) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            <span>{calculator.name || 'Formula Details'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="border-b mb-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-4 font-medium ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              Details
            </button>
            {Array.isArray(calculator.variables) && calculator.variables.length > 0 && (
              <button
                onClick={() => setActiveTab('calculator')}
                className={`py-2 px-4 font-medium ${activeTab === 'calculator' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              >
                Calculator
              </button>
            )}
          </div>
        </div>

        {activeTab === 'details' && (
          <div className="space-y-4">
            {typeof calculator.description === 'string' && calculator.description.trim() !== '' && (
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm text-gray-500">{calculator.description}</p>
              </div>
            )}

            {/* The following fields are not present in CalculatorTemplate:
                output_unit, unit_type, instructions
                If needed, these should be handled at a higher level or omitted.
                Remove references to these fields in the rendering logic. */}

            {Array.isArray(calculator.variables) && calculator.variables.length > 0 && (
              <div>
                <h3 className="text-sm font-medium">Formula Structure</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-60">
                  {JSON.stringify(calculator, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calculator' && Array.isArray(calculator.variables) && calculator.variables.length > 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Input Variables</h3>
              <div className="grid grid-cols-2 gap-4">
                {calculator.variables?.map((variable) => (
                  <div key={variable.name} className="flex flex-col gap-1">
                    <label htmlFor={variable.name} className="text-sm font-medium">
                      {variable.name} {variable.unit ? `(${variable.unit})` : ''}
                    </label>
                    <input
                      id={variable.name}
                      type="number"
                      className="border rounded-md px-3 py-2"
                      value={variableValues[variable.name] || ''}
                      onChange={(e) => handleInputChange(variable.name, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {typeof calculator.formula === 'object' && calculator.formula !== null && typeof calculator.formula.expression === 'string' && calculator.formula.expression.trim() !== '' && (
              <div>
                <h3 className="text-sm font-medium mb-2">Formula Expression</h3>
                <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                  {calculator.formula.expression}
                </div>

                {calculatedResult !== null && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <span className="font-medium">Result:</span> {calculatedResult.toFixed(2)}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button onClick={calculateResult}>
                Calculate
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
