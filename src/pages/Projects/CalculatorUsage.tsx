import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { rpcClient } from '@/lib/rpc.client';
import { useAuthStore } from '@/lib/store';
import { logBackendError, toBackendErrorToastMessage } from '@/lib/backendErrors';
import { evaluate } from 'mathjs';

type RawRecord = Record<string, unknown>;

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

interface CalculatorTemplate {
  id: string;
  name: string;
  description: string;
  variables: Variable[];
  formulas: Formula[];
}

interface Calculation {
  id?: string;
  line_item_id: string;
  template_id: string;
  station_number?: string;
  values: Record<string, number>;
  results: Record<string, number>;
  notes?: string;
  created_at?: string;
}

function isRecord(value: unknown): value is RawRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseJsonish(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (trimmed === '') return value;

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function toFiniteNumber(value: unknown): number {
  const numericValue = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number(value)
      : 0;

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function parseVariable(value: unknown): Variable | null {
  if (!isRecord(value)) return null;

  const name = typeof value.name === 'string' ? value.name.trim() : '';
  if (name === '') return null;

  const label = typeof value.label === 'string' && value.label.trim() !== ''
    ? value.label
    : name;
  const type = typeof value.type === 'string' && value.type.trim() !== ''
    ? value.type
    : 'input';
  const unit = typeof value.unit === 'string' ? value.unit : '';
  const defaultValue = toFiniteNumber(value.defaultValue ?? value.value);

  return {
    name,
    label,
    type,
    unit,
    defaultValue,
  };
}

function parseFormula(value: unknown): Formula | null {
  if (typeof value === 'string' && value.trim() !== '') {
    return {
      name: 'result',
      expression: value.trim(),
      description: 'Result',
    };
  }

  if (!isRecord(value)) return null;

  const expression = typeof value.expression === 'string' ? value.expression.trim() : '';
  if (expression === '') return null;

  const name = typeof value.name === 'string' && value.name.trim() !== ''
    ? value.name
    : 'result';
  const description = typeof value.description === 'string' && value.description.trim() !== ''
    ? value.description
    : name;

  return {
    name,
    expression,
    description,
  };
}

function extractVariables(value: unknown): Variable[] {
  const parsedValue = parseJsonish(value);
  const rawVariables = Array.isArray(parsedValue)
    ? parsedValue
    : isRecord(parsedValue) && Array.isArray(parsedValue.variables)
      ? parsedValue.variables
      : [];

  return rawVariables.map(parseVariable).filter((variable): variable is Variable => variable !== null);
}

function extractFormulas(value: unknown): Formula[] {
  const parsedValue = parseJsonish(value);

  if (Array.isArray(parsedValue)) {
    return parsedValue.map(parseFormula).filter((formula): formula is Formula => formula !== null);
  }

  if (isRecord(parsedValue) && Array.isArray(parsedValue.formulas)) {
    const formulas = parsedValue.formulas
      .map(parseFormula)
      .filter((formula): formula is Formula => formula !== null);
    if (formulas.length > 0) return formulas;
  }

  const formula = parseFormula(parsedValue);
  return formula ? [formula] : [];
}

function parseTemplateDetails(found: RawRecord): Pick<CalculatorTemplate, 'variables' | 'formulas'> {
  const formulaField = parseJsonish(found.formula);
  const variablesField = parseJsonish(found.variables);
  const formulasField = parseJsonish(found.formulas);

  const variablesFromFormula = extractVariables(formulaField);
  const variablesFromField = extractVariables(variablesField);
  const formulasFromFormula = extractFormulas(formulaField);
  const formulasFromField = extractFormulas(formulasField);

  return {
    variables: variablesFromFormula.length > 0 ? variablesFromFormula : variablesFromField,
    formulas: formulasFromFormula.length > 0 ? formulasFromFormula : formulasFromField,
  };
}

function reportCalculatorUsageError(
  operation: string,
  error: unknown,
  projectId: string | null,
  templateId: string | null,
): string {
  const context = {
    module: 'CalculatorUsage',
    operation,
    trigger: 'user' as const,
    error,
    ids: {
      projectId,
      templateId,
    },
  };

  logBackendError(context);
  const message = toBackendErrorToastMessage(context);
  toast.error(message);
  return message;
}

export default function CalculatorUsage() {
  const { id, templateId } = useParams();
  const projectId = typeof id === 'string' && id.trim() !== '' ? id : null;
  const selectedTemplateId = typeof templateId === 'string' && templateId.trim() !== '' ? templateId : null;
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

  const fetchTemplate = useCallback(async () => {
    if (!projectId || !selectedTemplateId) {
      setTemplate(null);
      setCalculations([]);
      setValues({});
      setResults({});
      setError('Project or calculator context is missing. Return to the project and try again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const raw = await rpcClient.rpc_calculator_template_payload({ p_template_id: selectedTemplateId });
      const payload = raw && typeof raw === 'object' && !Array.isArray(raw)
        ? (raw as RawRecord)
        : {};
      const found = isRecord(payload.template) ? payload.template : null;

      if (!found) throw new Error('Template not found');

      const { variables, formulas } = parseTemplateDetails(found);
      const loadedTemplate: CalculatorTemplate = {
        id: typeof found.id === 'string' ? found.id : selectedTemplateId,
        name: typeof found.name === 'string' && found.name.trim() !== '' ? found.name : 'Untitled Calculator',
        description: typeof found.description === 'string' ? found.description : '',
        variables,
        formulas,
      };

      setTemplate(loadedTemplate);
      setCalculations([]);
      setResults({});
      setValues(variables.reduce<Record<string, number>>((acc, variable) => {
        acc[variable.name] = variable.defaultValue;
        return acc;
      }, {}));
    } catch (error: unknown) {
      setTemplate(null);
      setCalculations([]);
      setValues({});
      setResults({});
      setError(reportCalculatorUsageError('load calculator template', error, projectId, selectedTemplateId));
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedTemplateId]);

  const evaluateExpression = (expression: string, currentValues: Record<string, number>): number => {
    try {
      const resultUnknown: unknown = evaluate(expression, currentValues);
      if (typeof resultUnknown !== 'number') return 0;
      return resultUnknown;
    } catch (error) {
      console.error('Error evaluating expression with mathjs:', error);
      return 0;
    }
  };

  const calculateResults = useCallback(() => {
    if (!template) return;

    setResults(template.formulas.reduce<Record<string, number>>((acc, formula) => {
      acc[formula.name] = evaluateExpression(formula.expression, values);
      return acc;
    }, {}));
  }, [template, values]);

  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  useEffect(() => {
    void fetchTemplate();
  }, [fetchTemplate]);

  const handleSave = () => {
    if (!template || !user || !projectId || !selectedTemplateId) return;
    setError('Saving calculations is not yet supported via RPC.');
  };

  const handleLoadCalculation = (calculation: Calculation) => {
    setValues(calculation.values);
    setStationNumber(calculation.station_number ?? '');
    setNotes(calculation.notes ?? '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-xl text-center">
          <p className="text-xl text-gray-400">{error ?? 'Calculator template not found'}</p>
          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
            {projectId && selectedTemplateId && (
              <button
                type="button"
                onClick={() => { void fetchTemplate(); }}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
              >
                Retry
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(projectId ? `/projects/${projectId}/calculators` : '/projects')}
              className="px-4 py-2 bg-background-lighter hover:bg-background-light text-white rounded-md transition-colors"
              aria-label="Return to calculators"
            >
              Return to Calculators
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(projectId ? `/projects/${projectId}/calculators` : '/projects')}
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
