import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { FormulaDef } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Calculator } from 'lucide-react';

interface FormulaModalProps {
  open: boolean;
  onClose: () => void;
  formula: FormulaDef | null;
}

export function FormulaModal({ open, onClose, formula }: FormulaModalProps) {
  const [calculatedResult, setCalculatedResult] = useState<number | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'details' | 'calculator'>('details');

  // Reset state when opening with a new formula
  useEffect(() => {
    if (open && formula?.formula) {
      const initialValues: Record<string, number> = {};
      formula.formula.variables?.forEach(variable => {
        initialValues[variable.name] = variable.defaultValue || 0;
      });
      
      setVariableValues(initialValues);
      setCalculatedResult(null);
    }
  }, [open, formula]);

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
    // This is a placeholder for actual calculation logic
    // In a real implementation, you would use something like mathjs to evaluate the formula
    
    if (!formula?.formula?.formulas?.length) return;
    
    // Mock calculation for demonstration purposes
    // In a real app, you'd evaluate each formula using the variableValues
    // For example, using mathjs: math.evaluate(formula.formula.formulas[0].expression, variableValues)
    
    // Simple calculation demo
    const total = Object.values(variableValues).reduce((sum, value) => sum + value, 0);
    setCalculatedResult(total);
  };

  if (!formula) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            <span>{formula.name || 'Formula Details'}</span>
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
            {formula.formula && formula.formula.variables && (
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
            {formula.description && (
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm text-gray-500">{formula.description}</p>
              </div>
            )}

            {formula.output_unit && (
              <div>
                <h3 className="text-sm font-medium">Output Unit</h3>
                <p className="text-sm text-gray-500">{formula.output_unit}</p>
              </div>
            )}

            {formula.unit_type && (
              <div>
                <h3 className="text-sm font-medium">Unit Type</h3>
                <p className="text-sm text-gray-500">{formula.unit_type}</p>
              </div>
            )}

            {formula.instructions && (
              <div>
                <h3 className="text-sm font-medium">Instructions</h3>
                <p className="text-sm text-gray-500 whitespace-pre-wrap">{formula.instructions}</p>
              </div>
            )}

            {formula.formula && (
              <div>
                <h3 className="text-sm font-medium">Formula Structure</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-60">
                  {JSON.stringify(formula.formula, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calculator' && formula.formula && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Input Variables</h3>
              <div className="grid grid-cols-2 gap-4">
                {formula.formula.variables?.map((variable) => (
                  <div key={variable.name} className="flex flex-col gap-1">
                    <label htmlFor={variable.name} className="text-sm font-medium">
                      {variable.label || variable.name} {variable.unit && `(${variable.unit})`}
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

            {formula.formula.formulas?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Formula Expression</h3>
                <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                  {formula.formula.formulas[0].expression}
                </div>
                
                {calculatedResult !== null && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <span className="font-medium">Result:</span> {calculatedResult.toFixed(2)} 
                    {formula.output_unit && <span className="ml-1 text-gray-500">{formula.output_unit}</span>}
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
