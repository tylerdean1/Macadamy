import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calculator, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { rpcClient } from '@/lib/rpc.client';

export default function Calculators() {
  const { id } = useParams(); // Retrieve the contract ID from the URL parameters
  const navigate = useNavigate(); // Hook to facilitate navigation between routes
  useAuth();
  interface CalculatorTemplate {
    id: string;
    name: string;
    description: string;
    line_code: string; // (optional, legacy support only)
    item_code: string; // Use this for new code
    variables: { name: string; value: string | number }[]; // Replace with the actual structure of variables
  }

  const [templates, setTemplates] = useState<CalculatorTemplate[]>([]); // State to hold the calculator templates
  const [loading, setLoading] = useState(true); // State to manage loading status

  // Fetch calculator templates when the component mounts or ID changes
  useEffect(() => {
    void fetchTemplates();
  }, [id]);

  // Function to fetch templates from the database
  const fetchTemplates = async () => {
    try {
      const data = await rpcClient.getAllLineItemTemplates();
      interface FormulaJson {
        variables?: { name: string; value: string | number }[];
      }
      const parsedTemplates: CalculatorTemplate[] = (Array.isArray(data) ? data : []).map((template) => {
        const formulaData = template.formula as FormulaJson;
        return {
          id: template.id,
          name: template.name ?? 'Untitled',
          description: template.description ?? '',
          line_code: 'N/A', // replace if your schema includes it
          // Safely extract item_code or line_code from template (typed as unknown)
          item_code: typeof template === 'object' && template !== null && 'item_code' in template && typeof (template as { item_code?: string }).item_code === 'string'
            ? (template as { item_code: string }).item_code
            : (typeof template === 'object' && template !== null && 'line_code' in template && typeof (template as { line_code?: string }).line_code === 'string'
              ? (template as { line_code: string }).line_code
              : 'N/A'),
          variables: Array.isArray(formulaData?.variables) ? formulaData.variables : [],
        };
      });
      setTemplates(parsedTemplates);
    } catch (error) {
      console.error('Error fetching line item templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading spinner while templates are being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Main component rendering
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with navigation and button to create a new calculator */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/projects/${id}`)} // Navigate back to the project details
              className="p-2 text-gray-400 hover:text-white hover:bg-background-lighter rounded-lg transition-colors"
              title="Go back to contract details" // Add a title attribute for accessibility
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Calculators</h1>
          </div>
          <button
            onClick={() => navigate(`/projects/${id}/calculators/new`)} // Navigate to create a new calculator
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Calculator
          </button>
        </div>

        {/* Grid to display calculator templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length === 0 ? ( // Check if there are no templates
            <div className="col-span-full bg-background-light rounded-lg border border-background-lighter p-8 text-center">
              <Calculator className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Calculators</h3>
              <p className="text-gray-400 mb-6">Create custom calculators for your line items.</p>
              <button
                onClick={() => navigate(`/projects/${id}/calculators/new`)} // Navigate to create a calculator
                className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Calculator
              </button>
            </div>
          ) : (
            templates.map((template) => ( // Map through the fetched templates
              <div
                key={template.id} // Unique key for each template
                className="bg-background-light rounded-lg border border-background-lighter p-6 hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/projects/${id}/calculators/${template.id}`)} // Navigate to calculator details on click
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-indigo-500/10">
                    <Calculator className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div className="px-2 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs">
                    Line Code: {template.line_code} {/* Display the line code */}
                  </div>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{template.name}</h3>
                <p className="text-gray-400 mb-4">{template.description}</p>
                <div className="border-t border-background-lighter pt-4">
                  <div className="flex items-center text-gray-400">
                    <FileText className="w-4 h-4 mr-2" />
                    {template.variables.length} Variables {/* Display the number of variables associated with the template */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );}