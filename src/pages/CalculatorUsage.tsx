import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

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
  line_code: string;      // Line code associated with the calculator template
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

export function CalculatorUsage() {
  const { id, templateId } = useParams(); // Extract contract ID and template ID from route parameters
  const navigate = useNavigate();

  const [template, setTemplate] = useState<CalculatorTemplate | null>(null);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, number>>({});
  const [stationNumber, setStationNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);

  // Fetch the calculator template from the database using Supabase
  const fetchTemplate = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('line_item_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      setTemplate(data);

      // Initialize input values with default values from the template
      const initialValues = data.variables.reduce(
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
  }, [templateId]); // <-- Include templateId in dependencies

  // Fetch previously saved calculations from the database
  const fetchCalculations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('line_item_calculations')
        .select('*')
        .eq('template_id', templateId)
        .eq('line_item_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalculations(data || []);
    } catch (error) {
      console.error('Error fetching calculations:', error);
    } finally {
      setLoading(false);
    }
  }, [templateId, id]); // <-- Include templateId and id in dependencies

  // Evaluate a mathematical expression and return its evaluated result
  const evaluateExpression = (expression: string, values: Record<string, number>): number => {
    try {
      const evalString = expression.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (match) => {
        if (match in values) {
          return values[match].toString();
        }
        throw new Error(`Unknown variable: ${match}`);
      });
      return new Function(`return ${evalString}`)();
    } catch (error) {
      console.error('Error evaluating expression:', error);
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
    fetchTemplate();
    fetchCalculations();
  }, [templateId, fetchTemplate, fetchCalculations]);

  // Save the current calculation to the database
  const handleSave = async () => {
    if (!template || !user) return;
    try {
      setError(null);
      const { error } = await supabase
        .from('line_item_calculations')
        .insert({
          line_item_id: id,
          template_id: template.id,
          station_number: stationNumber || null,
          values,
          results,
          notes: notes || null,
          created_by: user.id
        });

      if (error) throw error;
      setStationNumber('');
      setNotes('');
      fetchCalculations();
    } catch (error) {
      console.error('Error saving calculation:', error);
      setError('Error saving calculation');
    }
  };

  // Load a previous calculation into the form
  const handleLoadCalculation = (calculation: Calculation) => {
    setValues(calculation.values);
    setStationNumber(calculation.station_number || '');
    setNotes(calculation.notes || '');
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
              <p className="text-gray-400">Line Code: {template.line_code}</p>
            </div>
          </div>
        </div>

        {error && (
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
                  onClick={handleSave}
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
                          {calc.created_at ? new Date(calc.created_at).toLocaleString() : ''}
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
                      {calc.station_number && (
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
                      {calc.notes && (
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
