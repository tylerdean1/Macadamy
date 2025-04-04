import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Save, Calculator } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface Variable {
  name: string;
  label: string;
  type: string;
  unit: string;
  defaultValue: number;
}

interface Formula {
  name: string;
  expression: string;
  description: string;
}

// Math operations available for formulas
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

export function CalculatorCreation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [variables, setVariables] = useState<Variable[]>([
    {
      name: 'length',
      label: 'Length',
      type: 'number',
      unit: 'ft',
      defaultValue: 0
    }
  ]);
  const [formulas, setFormulas] = useState<Formula[]>([
    {
      name: 'result',
      expression: 'length',
      description: 'Basic calculation'
    }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const user = useAuthStore(state => state.user);

  const handleAddVariable = () => {
    setVariables([
      ...variables,
      {
        name: '',
        label: '',
        type: 'number',
        unit: '',
        defaultValue: 0
      }
    ]);
  };

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleVariableChange = (index: number, field: keyof Variable, value: string | number) => {
    const newVariables = [...variables];
    if (field === 'defaultValue') {
      newVariables[index][field] = Number(value);
    } else {
      newVariables[index][field] = value as string;
    }
    setVariables(newVariables);
  };

  const handleAddFormula = () => {
    setFormulas([
      ...formulas,
      {
        name: '',
        expression: '',
        description: ''
      }
    ]);
  };

  const handleRemoveFormula = (index: number) => {
    setFormulas(formulas.filter((_, i) => i !== index));
  };

  const handleFormulaChange = (index: number, field: keyof Formula, value: string) => {
    const newFormulas = [...formulas];
    newFormulas[index][field] = value;
    setFormulas(newFormulas);
  };

  const insertIntoFormula = (index: number, text: string) => {
    const formula = formulas[index];
    const cursorPosition = (document.activeElement as HTMLInputElement)?.selectionStart || formula.expression.length;
    const newExpression = 
      formula.expression.slice(0, cursorPosition) + 
      text + 
      formula.expression.slice(cursorPosition);
    
    handleFormulaChange(index, 'expression', newExpression);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setError(null);

      // Validate variable names are unique
      const variableNames = new Set();
      for (const variable of variables) {
        if (variableNames.has(variable.name)) {
          throw new Error('Variable names must be unique');
        }
        variableNames.add(variable.name);
      }

      // Validate formula names are unique
      const formulaNames = new Set();
      for (const formula of formulas) {
        if (formulaNames.has(formula.name)) {
          throw new Error('Formula names must be unique');
        }
        formulaNames.add(formula.name);
      }

      const { error: insertError } = await supabase
        .from('calculator_templates')
        .insert({
          name,
          description,
          variables,
          formulas,
          created_by: user.id
        });

      if (insertError) throw insertError;

      navigate(`/contracts/${id}/calculators`);
    } catch (error) {
      console.error('Error creating calculator template:', error);
      setError(error.message);
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
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Create Calculator Template</h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-background-light rounded-lg border border-background-lighter p-6">
            <h2 className="text-lg font-medium text-white mb-4">Template Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-background-light rounded-lg border border-background-lighter p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Variables</h2>
              <button
                type="button"
                onClick={handleAddVariable}
                className="p-2 text-gray-400 hover:text-white hover:bg-background rounded-full transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {variables.map((variable, index) => (
                <div key={index} className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={variable.name}
                      onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={variable.label}
                      onChange={(e) => handleVariableChange(index, 'label', e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={variable.unit}
                      onChange={(e) => handleVariableChange(index, 'unit', e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Default Value
                    </label>
                    <input
                      type="number"
                      value={variable.defaultValue}
                      onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariable(index)}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-warning hover:text-warning-hover rounded-md transition-colors"
                    >
                      <Minus className="w-5 h-5 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-background-light rounded-lg border border-background-lighter p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Formulas</h2>
              <button
                type="button"
                onClick={handleAddFormula}
                className="p-2 text-gray-400 hover:text-white hover:bg-background rounded-full transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              {formulas.map((formula, formulaIndex) => (
                <div key={formulaIndex} className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formula.name}
                        onChange={(e) => handleFormulaChange(formulaIndex, 'name', e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={formula.description}
                        onChange={(e) => handleFormulaChange(formulaIndex, 'description', e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveFormula(formulaIndex)}
                        className="w-full px-4 py-2 bg-background border border-background-lighter text-warning hover:text-warning-hover rounded-md transition-colors"
                      >
                        <Minus className="w-5 h-5 mx-auto" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-background rounded-lg border-2 border-primary/20 p-4 space-y-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Expression
                    </label>
                    <textarea
                      value={formula.expression}
                      onChange={(e) => handleFormulaChange(formulaIndex, 'expression', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors font-mono"
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
                              onClick={() => insertIntoFormula(formulaIndex, v.name)}
                              className="px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-md hover:bg-indigo-500/20 transition-colors text-sm font-mono"
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
                          {MATH_OPERATIONS.map((op, opIndex) => (
                            <button
                              key={opIndex}
                              type="button"
                              onClick={() => insertIntoFormula(formulaIndex, op.insert || op.symbol)}
                              className="w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded-md hover:bg-blue-500/20 transition-colors text-lg font-mono"
                            >
                              {op.symbol}
                            </button>
                          ))}
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
                            onClick={() => insertIntoFormula(formulaIndex, `${fn.name}(`)}
                            className="px-3 py-1.5 bg-purple-500/10 text-purple-500 rounded-md hover:bg-purple-500/20 transition-colors text-sm font-mono"
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
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
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