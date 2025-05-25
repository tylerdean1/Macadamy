import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { rpcClient } from '@/lib/rpc.client';
import { useAuthStore } from '@/lib/store';
import { evaluate } from 'mathjs'; // Import mathjs

// This interface defines the structure for Variables used in calculations
interface Variable {
  name: string;        // The name of the variable used in calculations
  label: string;       // Display label for the variable
  type: string;        // Specify the variable type (e.g., number)
  unit: string;        // Unit associated with the variable
  defaultValue: number; // Default value for the variable
}

// This interface defines the structure for Formula objects in the calculator
interface Formula {
  name: string;         // Name of the formula
  expression: string;   // Mathematical expression for calculation
  description: string;  // Description of the formula's purpose
}

// This interface defines the structure for Calculator templates fetched from the database
interface CalculatorTemplate {
  id: string;             // Unique identifier for the calculator template
  name: string;           // The name of the calculator template
  description: string;    // Description detailing the template
  variables: Variable[];  // List of variables associated with this template
  formulas: Formula[];    // List of formulas used in the calculator
}

// This interface defines the structure for calculations performed using the template
interface Calculation {
  id?: string;                     // Optional ID for the calculation
  line_item_id: string;            // ID linking to the line item
  template_id: string;             // Template ID linked to the calculation
  station_number?: string;         // Station number associated with this calculation
  values: Record<string, number>;  // Variable values in the calculation
  results: Record<string, number>; // Calculation results from formulas
  notes?: string;                  // Additional notes associated with the calculation
  created_at?: string;             // Optional created_at timestamp from database
}

export default function CalculatorUsage() {
  const { id, templateId } = useParams(); // Extract contract ID and template ID from route parameters
  const navigate = useNavigate();
  const { currentSessionId } = useAuth();

  const [template, setTemplate] = useState<CalculatorTemplate | null>(null);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, number>>({});
  const [stationNumber, setStationNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);

  // Fetch the calculator template from the database using RPC
  const fetchTemplate = useCallback(async () => {
    if (typeof currentSessionId !== 'string' || currentSessionId.length === 0 || typeof templateId !== 'string' || templateId.length === 0) return;
    try {
      const data = await rpcClient.getAllLineItemTemplates({ session_id: currentSessionId });
      const found = Array.isArray(data) ? data.find((t) => t.id === templateId) : undefined;
      if (!found) throw new Error('Template not found');
      // Parse variables and formulas from formula JSON
      let variables: Variable[] = [];
      let formulas: Formula[] = [];
      try {
        // 1. Remove all usage of line_code if not present on the type
        // 2. Type-safe JSON parsing for formulaObj
        let formulaObj: { variables?: Variable[]; formulas?: Formula[] } = {};
        if (typeof found?.formula === 'string') {
          try {
            const parsed: unknown = JSON.parse(found.formula);
            if (
              typeof parsed === 'object' &&
              parsed !== null &&
              ('variables' in parsed || 'formulas' in parsed)
            ) {
              formulaObj = parsed as { variables?: Variable[]; formulas?: Formula[] };
            }
          } catch {
            // Optionally log error
          }
        } else if (typeof found?.formula === 'object' && found.formula !== null) {
          formulaObj = found.formula;
        }
        // 3. Access variables/formulas safely
        variables = Array.isArray(formulaObj.variables) ? formulaObj.variables : [];
        formulas = Array.isArray(formulaObj.formulas) ? formulaObj.formulas : [];
      } catch { /* Optionally log error */ }
      setTemplate({
        id: found.id,
        name: found.name ?? '',
        description: found.description ?? '',
        variables,
        formulas,
      });
      // Initialize input values with default values from the template
      const initialValues = variables.reduce(
        (acc: Record<string, number>, v: Variable) => {
          acc[v.name] = v.defaultValue;
          return acc;
        },
        {} as Record<string, number>
      );
      setValues(initialValues);
    } catch (error) {
      console.error('Error fetching template:', error);
      setError('Error loading calculator template');
    }
  }, [templateId, currentSessionId]);

  // Fetch previously saved calculations from the database (TODO: refactor to RPC if available)
  // Add runtime guard for id and templateId
  const fetchCalculations = useCallback(() => {
    if (typeof id !== 'string' || id.length === 0 || typeof templateId !== 'string' || templateId.length === 0) return;
    // TODO: Replace with RPC when available
    setCalculations([]);
    setLoading(false);
  }, [templateId, id]);

  // Evaluate a mathematical expression and return its evaluated result
  const evaluateExpression = (expression: string, currentValues: Record<string, number>): number => {
    try {
      // The scope (variables) is passed directly to mathjs
      const resultUnknown: unknown = evaluate(expression, currentValues);
      if (typeof resultUnknown !== 'number') return 0;
      return resultUnknown;
    } catch (error) {
      console.error('Error evaluating expression with mathjs:', error);
      // Return NaN or throw a custom error to be handled by the caller
      // For now, returning 0 to maintain previous behavior, but NaN might be more appropriate
      return 0;
    }
  };

  // Wrap calculateResults in useCallback so it can be used as an effect dependency
  const calculateResults = useCallback(() => {
    if (!template) return;
    const newResults = template.formulas.reduce(
      (acc: Record<string, number>, formula: Formula) => {
        acc[formula.name] = evaluateExpression(formula.expression, values);
        return acc;
      },
      {} as Record<string, number>
    );
    setResults(newResults);
  }, [template, values]);

  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  useEffect(() => {
    void fetchTemplate();
    void fetchCalculations();
  }, [templateId, fetchTemplate, fetchCalculations]);

  // Save the current calculation to the database
  const handleSave = () => {
    if (!template || !user || typeof id !== 'string' || id.length === 0 || typeof templateId !== 'string' || templateId.length === 0) return;
    setError('Saving calculations is not yet supported via RPC.');
    // TODO: Implement save via RPC when available
  };

  // Load a previous calculation into the form
  const handleLoadCalculation = (calculation: Calculation) => {
    setValues(calculation.values);
    setStationNumber(calculation.station_number ?? '');
    setNotes(calculation.notes ?? '');
  };

  // Loading indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no template found
  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400">Calculator template not found</p>
          <button
            onClick={() => navigate(`/contracts/${id}/calculators`)}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
            aria-label="Return to calculators"
          >
            Return to Calculators
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
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
            <div>
              <h1 className="text-2xl font-bold text-white">{template.name}</h1>
            </div>
          </div>
        </div>

        {typeof error === 'string' && error.length > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Input Values */}
            <div className="bg-background-light rounded-lg border border-background-lighter p-6">
              <h2 className="text-lg font-medium text-white mb-4">Input Values</h2>
              <div className="grid grid-cols-2 gap-4">
                {template.variables.map((variable) => (
                  <div key={variable.name}>
                    <label
                      htmlFor={`input-${variable.name}`}
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
                      {variable.label} ({variable.unit})
                    </label>
                    <input
                      id={`input-${variable.name}`}
                      type="number"
                      value={values[variable.name]}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [variable.name]: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="bg-background-light rounded-lg border border-background-lighter p-6">
              <h2 className="text-lg font-medium text-white mb-4">Results</h2>
              <div className="grid grid-cols-2 gap-4">
                {template.formulas.map((formula) => (
                  <div key={formula.name} className="bg-background p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">{formula.description}</div>
                    <div className="text-2xl font-bold text-white">
                      {results[formula.name]?.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-background-light rounded-lg border border-background-lighter p-6">
              <h2 className="text-lg font-medium text-white mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="stationNumber"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Station Number (optional)
                  </label>
                  <input
                    id="stationNumber"
                    type="text"
                    value={stationNumber}
                    onChange={(e) => setStationNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => { void handleSave(); }}
                  className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
                  aria-label="Save calculation"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Calculation
                </button>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="space-y-6">
            <div className="bg-background-light rounded-lg border border-background-lighter p-6">
              <h2 className="text-lg font-medium text-white mb-4">History</h2>
              <div className="space-y-4">
                {calculations.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    No calculations saved yet
                  </p>
                ) : (
                  calculations.map((calc) => (
                    <div
                      key={calc.id}
                      className="bg-background p-4 rounded-lg cursor-pointer hover:bg-background-lighter transition-colors"
                      onClick={() => handleLoadCalculation(calc)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-400">
                          {typeof calc.created_at === 'string' && calc.created_at.length > 0 ? new Date(calc.created_at).toLocaleString() : ''}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadCalculation(calc);
                          }}
                          className="p-1 text-gray-400 hover:text-primary transition-colors"
                          aria-label="Load this calculation"
                          title="Load Calculation"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                      {typeof calc.station_number === 'string' && calc.station_number.trim() !== '' && (
                        <div className="text-sm text-gray-400 mb-2">
                          Station: {calc.station_number}
                        </div>
                      )}
                      <div className="space-y-2">
                        {Object.entries(calc.results).map(([name, value]) => (
                          <div key={name} className="flex justify-between">
                            <span className="text-gray-400">{name}:</span>
                            <span className="text-white font-medium">{value.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {typeof calc.notes === 'string' && calc.notes.trim() !== '' && (
                        <div className="mt-2 text-sm text-gray-400 border-t border-background-lighter pt-2">
                          {calc.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
