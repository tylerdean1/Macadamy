import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import type { CalculatorTemplate, Variable as CanonicalVariable, Formula as CanonicalFormula } from '@/lib/formula.types';

const MATH_OPERATIONS = [
  { symbol: '+', description: 'Addition' },
  { symbol: '-', description: 'Subtraction' },
  { symbol: '*', description: 'Multiplication' },
  { symbol: '/', description: 'Division' },
  { symbol: '^', description: 'Exponent', insert: 'pow(' },
  { symbol: '√', description: 'Square Root', insert: 'sqrt(' },
  { symbol: '(', description: 'Open Parenthesis' },
  { symbol: ')', description: 'Close Parenthesis' },
];

const MATH_FUNCTIONS = [
  { name: 'abs', description: 'Absolute value' },
  { name: 'ceil', description: 'Round up to nearest integer' },
  { name: 'floor', description: 'Round down to nearest integer' },
  { name: 'round', description: 'Round to nearest integer' },
  { name: 'max', description: 'Maximum value' },
  { name: 'min', description: 'Minimum value' },
  { name: 'pow', description: 'Power' },
  { name: 'sqrt', description: 'Square root' },
  { name: 'sin', description: 'Sine (radians)' },
  { name: 'cos', description: 'Cosine (radians)' },
  { name: 'tan', description: 'Tangent (radians)' },
  { name: 'asin', description: 'Arc sine' },
  { name: 'acos', description: 'Arc cosine' },
  { name: 'atan', description: 'Arc tangent' },
  { name: 'log', description: 'Natural logarithm' },
  { name: 'exp', description: 'Exponential (e^x)' },
  { name: 'PI', description: 'π (3.14159...)' },
  { name: 'E', description: 'e (2.71828...)' },
];

export default function CalculatorCreation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user) as { id: string } | null;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [variables, setVariables] = useState<CanonicalVariable[]>([
    {
      name: 'length',
      type: 'input',
      unit: 'Feet (FT)',
      defaultValue: 0,
    },
  ]);
  const [formulas, setFormulas] = useState<CanonicalFormula[]>([
    {
      name: 'result',
      expression: 'length',
      description: 'Basic calculation',
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  const handleAddVariable = () => {
    setVariables([...variables, { name: '', type: 'input', unit: 'Feet (FT)', defaultValue: 0 }]);
  };

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleVariableChange = (index: number, field: keyof CanonicalVariable, value: string | number) => {
    const newVariables = [...variables];
    if (field === 'defaultValue') {
      newVariables[index][field] = typeof value === 'string' ? parseFloat(value) : value;
    } else if (field === 'type') {
      // Only allow valid types for 'type' field
      if (value === 'input' || value === 'output' || value === 'constant') {
        newVariables[index][field] = value;
      }
    } else if (field === 'unit') {
      newVariables[index][field] = value as CanonicalVariable['unit'];
    } else {
      newVariables[index][field] = value as string;
    }
    setVariables(newVariables);
  };

  const handleAddFormula = () => {
    setFormulas([...formulas, { name: '', expression: '', description: '' }]);
  };

  const handleRemoveFormula = (index: number) => {
    setFormulas(formulas.filter((_, i) => i !== index));
  };

  const handleFormulaChange = (index: number, field: keyof CanonicalFormula, value: string) => {
    const newFormulas = [...formulas];
    newFormulas[index][field] = value;
    setFormulas(newFormulas);
  };

  const insertIntoFormula = (index: number, text: string) => {
    const formula = formulas[index];
    const activeElement = document.activeElement as HTMLInputElement | null;
    const cursorPosition = activeElement?.selectionStart ?? formula.expression.length;
    const newExpression = formula.expression.slice(0, cursorPosition) + text + formula.expression.slice(cursorPosition);
    handleFormulaChange(index, 'expression', newExpression);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setError(null);

      const variableNames = new Set();
      for (const variable of variables) {
        if (variableNames.has(variable.name)) throw new Error('Variable names must be unique');
        variableNames.add(variable.name);
      }

      const formulaNames = new Set();
      for (const formula of formulas) {
        if (formulaNames.has(formula.name)) throw new Error('Formula names must be unique');
        formulaNames.add(formula.name);
      }

      const calculatorTemplate: CalculatorTemplate = {
        id: '',
        name,
        description,
        variables,
        formula: formulas[0],
      };
      const { error: insertError } = await supabase.from('line_item_templates').insert({
        ...calculatorTemplate,
        formula: JSON.stringify(calculatorTemplate.formula),
      });
      if (insertError) throw insertError;

      navigate(`/contracts/${id}/line-items`);
    } catch (error: unknown) {
      console.error('Error creating calculator template:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/contracts/${id}/calculators`)}
              className="p-2 text-gray-400 hover:text-white hover:bg-background-lighter rounded-lg transition-colors"
              aria-label="Go back to calculators list"
              title="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Create Calculator Template</h1>
          </div>
        </div>

        {/* Display error message if any */}
        {typeof error === 'string' && error.trim() !== '' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {/* Form for entering calculator template details */}
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
          <div className="bg-background-light rounded-lg border border-background-lighter p-6">
            <h2 className="text-lg font-medium text-white mb-4">Template Details</h2>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-400 mb-1"
                  htmlFor="templateName"
                >
                  Template Name
                </label>
                <input
                  id="templateName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Enter template name"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-400 mb-1"
                  htmlFor="templateDescription"
                >
                  Description
                </label>
                <textarea
                  id="templateDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Enter description"
                />
              </div>
            </div>
          </div>

          {/* Section for managing variables */}
          <div className="bg-background-light rounded-lg border border-background-lighter p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Variables</h2>
              {/* Icon-only button => add an accessible name */}
              <button
                type="button"
                onClick={handleAddVariable}
                className="p-2 text-gray-400 hover:text-white hover:bg-background rounded-full transition-colors"
                aria-label="Add a new variable"
                title="Add Variable"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {variables.map((variable, index) => {
                const nameId = `variableName-${index}`;
                const unitId = `variableUnit-${index}`;
                const defaultValId = `variableDefaultVal-${index}`;
                return (
                  <div key={index} className="grid grid-cols-5 gap-4">
                    {/* Name field */}
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-400 mb-1"
                        htmlFor={nameId}
                      >
                        Name
                      </label>
                      <input
                        id={nameId}
                        type="text"
                        value={variable.name}
                        onChange={(e) =>
                          handleVariableChange(index, 'name', e.target.value)
                        }
                        className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    {/* Unit field */}
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-400 mb-1"
                        htmlFor={unitId}
                      >
                        Unit
                      </label>
                      <select
                        id={unitId}
                        value={variable.unit ?? ''}
                        onChange={(e) => handleVariableChange(index, 'unit', e.target.value || '')}
                        className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        required
                      >
                        <option value="">Select unit</option>
                        <option value="Feet (FT)">Feet (FT)</option>
                        <option value="Inches (IN)">Inches (IN)</option>
                        <option value="Linear Feet (LF)">Linear Feet (LF)</option>
                        <option value="Mile (MI)">Mile (MI)</option>
                        <option value="Shoulder Mile (SMI)">Shoulder Mile (SMI)</option>
                        <option value="Square Feet (SF)">Square Feet (SF)</option>
                        <option value="Square Yard (SY)">Square Yard (SY)</option>
                        <option value="Acre (AC)">Acre (AC)</option>
                        <option value="Cubic Foot (CF)">Cubic Foot (CF)</option>
                        <option value="Cubic Yard (CY)">Cubic Yard (CY)</option>
                        <option value="Ton (TON)">Ton (TON)</option>
                        <option value="Pound (LB)">Pound (LB)</option>
                        <option value="Gallon (GAL)">Gallon (GAL)</option>
                        <option value="Lump Sum (LS)">Lump Sum (LS)</option>
                        <option value="Hour (HR)">Hour (HR)</option>
                        <option value="Day (DAY)">Day (DAY)</option>
                        <option value="Each (EA)">Each (EA)</option>
                        <option value="Station (STA)">Station (STA)</option>
                        <option value="Degrees (*)">Degrees (*)</option>
                      </select>
                    </div>

                    {/* Default Value field */}
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-400 mb-1"
                        htmlFor={defaultValId}
                      >
                        Default Value
                      </label>
                      <input
                        id={defaultValId}
                        type="number"
                        value={variable.defaultValue}
                        onChange={(e) =>
                          handleVariableChange(
                            index,
                            'defaultValue',
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    {/* Remove Variable icon-only button => add an accessible name */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariable(index)}
                        className="w-full px-4 py-2 bg-background border border-background-lighter text-warning hover:text-warning-hover rounded-md transition-colors"
                        aria-label="Remove this variable"
                        title="Remove Variable"
                      >
                        <Minus className="w-5 h-5 mx-auto" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section for managing formulas */}
          <div className="bg-background-light rounded-lg border border-background-lighter p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Formulas</h2>
              {/* Icon-only button => add an accessible name */}
              <button
                type="button"
                onClick={handleAddFormula}
                className="p-2 text-gray-400 hover:text-white hover:bg-background rounded-full transition-colors"
                aria-label="Add a new formula"
                title="Add Formula"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {formulas.map((formula, formulaIndex) => (
                <div key={formulaIndex} className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-400 mb-1"
                        htmlFor={`formulaName-${formulaIndex}`}
                      >
                        Name
                      </label>
                      <input
                        id={`formulaName-${formulaIndex}`}
                        type="text"
                        value={formula.name}
                        onChange={(e) =>
                          handleFormulaChange(
                            formulaIndex,
                            'name',
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Enter formula name"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label
                        className="block text-sm font-medium text-gray-400 mb-1"
                        htmlFor={`formulaDescription-${formulaIndex}`}
                      >
                        Description
                      </label>
                      <input
                        id={`formulaDescription-${formulaIndex}`}
                        type="text"
                        value={formula.description ?? ''}
                        onChange={(e) =>
                          handleFormulaChange(
                            formulaIndex,
                            'description',
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Enter formula description"
                      />
                    </div>
                    <div className="flex items-end">
                      {/* Remove formula button => add an accessible name */}
                      <button
                        type="button"
                        onClick={() => handleRemoveFormula(formulaIndex)}
                        className="w-full px-4 py-2 bg-background border border-background-lighter text-warning hover:text-warning-hover rounded-md transition-colors"
                        aria-label="Remove this formula"
                        title="Remove Formula"
                      >
                        <Minus className="w-5 h-5 mx-auto" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-background rounded-lg border-2 border-primary/20 p-4 space-y-4">
                    <label
                      className="block text-sm font-medium text-gray-400 mb-1"
                      htmlFor={`formulaExpression-${formulaIndex}`}
                    >
                      Expression
                    </label>
                    <textarea
                      id={`formulaExpression-${formulaIndex}`}
                      value={formula.expression}
                      onChange={(e) =>
                        handleFormulaChange(
                          formulaIndex,
                          'expression',
                          e.target.value
                        )
                      }
                      rows={3}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors font-mono"
                      placeholder="Enter formula expression"
                      title="Formula Expression"
                      required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Variables
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {variables.map((v, varIndex) => (
                            <button
                              key={varIndex}
                              type="button"
                              onClick={() =>
                                insertIntoFormula(formulaIndex, v.name)
                              }
                              onDragStart={(e) =>
                                e.dataTransfer.setData('text/plain', v.name)
                              }
                              className="px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-md hover:bg-indigo-500/20 transition-colors text-sm font-mono"
                              aria-label={`Insert variable "${v.name}" into formula`}
                              title={`Insert variable "${v.name}"`}
                            >
                              {v.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Operations
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {MATH_OPERATIONS.map((op, opIndex) => {
                            const opText = op.insert ?? op.symbol;
                            return (
                              <button
                                key={opIndex}
                                type="button"
                                onClick={() =>
                                  insertIntoFormula(formulaIndex, opText)
                                }
                                onDragStart={(e) =>
                                  e.dataTransfer.setData('text/plain', opText)
                                }
                                className="w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded-md hover:bg-blue-500/20 transition-colors text-lg font-mono"
                                aria-label={`Insert operation "${op.description}"`}
                                title={op.description}
                              >
                                {op.symbol}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Functions
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {MATH_FUNCTIONS.map((fn, fnIndex) => (
                          <button
                            key={fnIndex}
                            type="button"
                            onClick={() =>
                              insertIntoFormula(formulaIndex, `${fn.name}(`)
                            }
                            className="px-3 py-1.5 bg-purple-500/10 text-purple-500 rounded-md hover:bg-purple-500/20 transition-colors text-sm font-mono"
                            aria-label={`Insert function "${fn.name}"`}
                            title={fn.description}
                          >
                            {fn.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            {/* Submit button with descriptive text => good for A11y */}
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              aria-label="Save this Calculator Template"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
