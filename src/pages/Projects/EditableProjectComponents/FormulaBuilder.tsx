import { useState } from 'react';
import { Input } from '@/pages/StandardPages/StandardPageComponents/input';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { Trash2 } from 'lucide-react';
import { Modal } from '@/pages/StandardPages/StandardPageComponents/modal';
import type { CalculatorTemplate, Variable } from '@/lib/formula.types';
import { UnitMeasureType } from '@/lib/enums';

interface FormulaBuilderProps {
  calculator: CalculatorTemplate;
  onCalculatorChange: (value: CalculatorTemplate) => void;
  onSave: () => void;
}

export function FormulaBuilder({
  calculator,
  onCalculatorChange,
  onSave,
}: FormulaBuilderProps) {
  const [newVar, setNewVar] = useState<Omit<Variable, 'defaultValue'>>({
    name: '',
    type: 'input',
    unit: undefined,
    value: '',
  });

  const [showWarning, setShowWarning] = useState(false);

  const addVariable = () => {
    if (!newVar.name) return;
    const updatedVars = [
      ...calculator.variables,
      {
        name: newVar.name,
        type: 'input',
        unit: newVar.unit as UnitMeasureType | null | undefined,
        defaultValue: parseFloat(newVar.value as string) || 0,
        value: newVar.value,
      } as Variable,
    ];
    onCalculatorChange({ ...calculator, variables: updatedVars });
    setNewVar({ name: '', type: 'input', unit: undefined, value: '' });
  };

  const deleteVariable = (name: string) => {
    const updated = calculator.variables.filter((v) => v.name !== name);
    onCalculatorChange({ ...calculator, variables: updated });
  };

  const checkUnused = () => {
    const formulaExpr = calculator.formula.expression || '';
    const usedNames = Array.isArray(formulaExpr.match(/\b[a-zA-Z_]\w*\b/g)) ? formulaExpr.match(/\b[a-zA-Z_]\w*\b/g) as string[] : [];
    const unused = calculator.variables.filter((v) => !usedNames.includes(v.name));
    return unused.length > 0;
  };

  const handleSaveClick = () => {
    if (checkUnused()) {
      setShowWarning(true);
    } else {
      onSave();
    }
  };

  const confirmSaveAnyway = () => {
    setShowWarning(false);
    onSave();
  };

  const removeUnusedVars = () => {
    const formulaExpr = calculator.formula.expression || '';
    const usedNames = Array.isArray(formulaExpr.match(/\b[a-zA-Z_]\w*\b/g)) ? formulaExpr.match(/\b[a-zA-Z_]\w*\b/g) as string[] : [];
    const filtered = calculator.variables.filter((v) => usedNames.includes(v.name));
    onCalculatorChange({ ...calculator, variables: filtered });
    setShowWarning(false);
  };

  return (
    <div className="space-y-4">
      {/* Variable Entry */}
      <div className="grid grid-cols-4 gap-2">
        <Input
          placeholder="Name"
          value={newVar.name}
          onChange={(e) => setNewVar({ ...newVar, name: e.target.value })}
        />
        <Input
          placeholder="Unit"
          value={newVar.unit ?? ''}
          onChange={(e) => setNewVar({ ...newVar, unit: e.target.value as UnitMeasureType })}
        />
        <Input
          placeholder="Value"
          value={newVar.value as string}
          onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
        />
        <Button onClick={addVariable}>Add</Button>
      </div>

      {/* Variable List */}
      <div>
        {calculator.variables.map((v) => (
          <div
            key={v.name}
            className="grid grid-cols-4 gap-2 items-center mb-2 bg-muted px-2 py-1 rounded"
          >
            <span>{v.name}</span>
            <span>{v.unit}</span>
            <span>{v.value}</span>
            <Button
              type="button"
              variant="ghost"
              className="text-red-500 hover:text-red-700"
              onClick={() => deleteVariable(v.name)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Formula Editor */}
      <div>
        <label htmlFor="formula" className="block text-sm font-medium mb-1">
          Formula
        </label>
        <Input
          id="formula"
          placeholder="e.g. length * width * depth"
          value={calculator.formula.expression}
          onChange={(e) =>
            onCalculatorChange({
              ...calculator,
              formula: {
                ...calculator.formula,
                expression: e.target.value,
              },
            })
          }
        />
      </div>

      {/* Save Button */}
      <Button onClick={handleSaveClick} className="mt-4">
        Save Formula
      </Button>

      {/* Warning Modal */}
      {showWarning && (
        <Modal
          isOpen={showWarning}
          onClose={() => setShowWarning(false)}
          title="Unused Variables Detected"
        >
          <div>
            <p className="text-sm text-muted-foreground my-2">
              Your formula contains variables that are not used. Do you want to
              remove them or keep everything as-is?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={confirmSaveAnyway}>
                Keep As-Is
              </Button>
              <Button variant="danger" onClick={removeUnusedVars}>
                Remove Unused
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
