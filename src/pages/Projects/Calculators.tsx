import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calculator, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { rpcClient } from '@/lib/rpc.client';
import { logBackendError, toBackendErrorToastMessage } from '@/lib/backendErrors';

interface CalculatorTemplate {
  id: string;
  name: string;
  description: string;
  line_code: string;
  item_code: string;
  variables: { name: string; value: string | number }[];
}

interface FormulaJson {
  variables?: { name: string; value: string | number }[];
}

function reportCalculatorsError(
  operation: string,
  error: unknown,
  projectId: string | null,
): string {
  const context = {
    module: 'Calculators',
    operation,
    trigger: 'user' as const,
    error,
    ids: {
      projectId,
    },
  };

  logBackendError(context);
  const message = toBackendErrorToastMessage(context);
  toast.error(message);
  return message;
}

export default function Calculators() {
  const { id } = useParams();
  const projectId = typeof id === 'string' && id.trim() !== '' ? id : null;
  const navigate = useNavigate();
  useAuth();

  const [templates, setTemplates] = useState<CalculatorTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!projectId) {
      setTemplates([]);
      setErrorMessage('Project context is missing. Return to the project and try again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const raw = await rpcClient.rpc_calculators_payload();
      const payload = raw && typeof raw === 'object' && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};
      const data = Array.isArray(payload.templates) ? payload.templates : [];

      const parsedTemplates: CalculatorTemplate[] = data.map((template) => {
        const formulaData = typeof template.formula === 'object' && template.formula !== null
          ? (template.formula as FormulaJson)
          : {};
        return {
          id: typeof template.id === 'string' ? template.id : '',
          name: typeof template.name === 'string' ? template.name : 'Untitled',
          description: '',
          line_code: 'N/A',
          item_code: typeof template === 'object' && template !== null && 'item_code' in template && typeof (template as { item_code?: string }).item_code === 'string'
            ? (template as { item_code: string }).item_code
            : (typeof template === 'object' && template !== null && 'line_code' in template && typeof (template as { line_code?: string }).line_code === 'string'
              ? (template as { line_code: string }).line_code
              : 'N/A'),
          variables: Array.isArray(formulaData?.variables) ? formulaData.variables : [],
        };
      }).filter((template) => template.id !== '');
      setTemplates(parsedTemplates);
    } catch (error) {
      setTemplates([]);
      setErrorMessage(reportCalculatorsError('load calculator templates', error, projectId));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const handleCreateCalculator = () => {
    if (!projectId) {
      setErrorMessage('Project context is missing. Return to the project and try again.');
      return;
    }

    navigate(`/projects/${projectId}/calculators/new`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(projectId ? `/projects/${projectId}` : '/projects')}
              className="p-2 text-gray-400 hover:text-white hover:bg-background-lighter rounded-lg transition-colors"
              aria-label="Go back to project"
              title="Go back to project"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Calculators</h1>
          </div>
          <button
            onClick={handleCreateCalculator}
            disabled={!projectId}
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Calculator
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>{errorMessage}</p>
              {projectId ? (
                <button
                  type="button"
                  onClick={() => { void fetchTemplates(); }}
                  className="rounded-md border border-red-400/40 px-3 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/20"
                >
                  Retry
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/projects')}
                  className="rounded-md border border-red-400/40 px-3 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/20"
                >
                  Projects
                </button>
              )}
            </div>
          </div>
        )}

        {!errorMessage && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.length === 0 ? (
              <div className="col-span-full bg-background-light rounded-lg border border-background-lighter p-8 text-center">
                <Calculator className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Calculators</h3>
                <p className="text-gray-400 mb-6">Create custom calculators for your line items.</p>
                <button
                  onClick={handleCreateCalculator}
                  className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Calculator
                </button>
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-background-light rounded-lg border border-background-lighter p-6 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => navigate(`/projects/${projectId}/calculators/${template.id}`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-indigo-500/10">
                      <Calculator className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div className="px-2 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs">
                      Line Code: {template.line_code}
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">{template.name}</h3>
                  <p className="text-gray-400 mb-4">{template.description}</p>
                  <div className="border-t border-background-lighter pt-4">
                    <div className="flex items-center text-gray-400">
                      <FileText className="w-4 h-4 mr-2" />
                      {template.variables.length} Variables
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
