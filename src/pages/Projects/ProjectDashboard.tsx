/**
 * Project Dashboard
 * 
 * Enhanced with comprehensive improvements across all components:
 * - ProjectHeader: Converted to functional component with hooks, improved error handling
 * - ProjectTools: Added tooltips, permission checks, badges, and real-time updates
 * - ProjectTotalsPanel: Added trend visualization, forecasting, drill-down, and export
 * - ProjectInfoForm: Added compact/detailed view toggle, edit capabilities
 * - WbsSection: Added expand/collapse, sorting, filtering, and improved UI
 * - LineItemsTable: Added pagination, sorting, filtering, and improved accessibility
 */
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Page, PageContainer, SectionContainer } from '@/components/Layout';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import type { TableRow } from '@/lib/types';

type Project = TableRow<'projects'>;
type Wbs = TableRow<'wbs'>;
type LineItem = TableRow<'line_items'>;

import { ProjectHeader } from './ProjectDashboardComponents/ProjectHeader';
import { ProjectInfoForm } from './ProjectDashboardComponents/ProjectInfoForm';
import { ProjectTotalsPanel } from './ProjectDashboardComponents/ProjectTotalsPanel';
import { WbsSection } from './ProjectDashboardComponents/WbsSection';
import { LineItemsTable } from './ProjectDashboardComponents/LineItemsTable';
import { ProjectTools } from './ProjectDashboardComponents/ProjectTools';

export default function ProjectDashboard() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Project | null>(null);
  const [wbsItems, setWbsItems] = useState<Wbs[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [issuesCount, setIssuesCount] = useState<number>(0);
  const [changeOrdersCount, setChangeOrdersCount] = useState<number>(0);
  const [inspectionsCount, setInspectionsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch contract data
  const fetchContractData = useCallback(async () => {
    if (typeof contractId !== 'string' || !contractId.trim()) {
      setError(new Error('No contract ID provided.'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch project details directly from projects table
      const { data: projectDetails, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', contractId)
        .single();

      if (projectError) throw projectError;
      setContract(projectDetails as Project);

      // Fetch WBS items directly from wbs table
      const { data: wbsData, error: wbsError } = await supabase
        .from('wbs')
        .select('*')
        .eq('project_id', contractId);

      if (wbsError) throw wbsError;
      setWbsItems(wbsData as Wbs[]);

      // Fetch Line Items directly from line_items table
      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('project_id', contractId);

      if (lineItemsError) throw lineItemsError;
      setLineItems(lineItemsData as LineItem[]);

      // Count issues for this project
      const { count: issuesCount, error: issuesCountError } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', contractId);

      if (issuesCountError) throw issuesCountError;
      setIssuesCount(issuesCount || 0);

      // Count change orders for this project  
      const { count: changeOrdersCount, error: changeOrdersCountError } = await supabase
        .from('change_orders')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', contractId);

      if (changeOrdersCountError) throw changeOrdersCountError;
      setChangeOrdersCount(changeOrdersCount || 0);

      // Count inspections for this project
      const { count: inspectionsCount, error: inspectionsCountError } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', contractId);

      if (inspectionsCountError) throw inspectionsCountError;
      setInspectionsCount(inspectionsCount || 0);

    } catch (err) {
      console.error('Error fetching contract data:', err);
      const fetchError = err instanceof Error ? err : new Error('Failed to fetch contract data');
      setError(fetchError);
      setContract(null);
      setWbsItems([]);
      setLineItems([]);
      setIssuesCount(0);
      setChangeOrdersCount(0);
      setInspectionsCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [contractId]); // Removed navigate from dependencies as it was not used in the callback

  // Initial data fetch
  useEffect(() => {
    void fetchContractData(); // Use void for fire-and-forget
  }, [fetchContractData]);

  // Real-time subscriptions
  useEffect(() => {
    if (typeof contractId !== 'string' || !contractId.trim()) return; // Explicit null/empty check

    const changes = supabase
      .channel(`contract-dashboard-${contractId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts', filter: `id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wbs', filter: `contract_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'line_items', filter: `contract_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues', filter: `contract_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'change_orders', filter: `contract_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inspections', filter: `contract_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .subscribe();

    return () => {
      void supabase.removeChannel(changes); // Use void for fire-and-forget
    };
  }, [contractId, fetchContractData]);

  if (isLoading) {
    return (
      <Page>
        <PageContainer>
          <SectionContainer className="flex justify-center items-center min-h-screen">
            <LoadingState size="lg" message="Loading contract data..." />
          </SectionContainer>
        </PageContainer>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <PageContainer>
          <SectionContainer className="py-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-850 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-red-400">Error Loading Contract</h2>
                <p className="text-gray-300 mb-6">{error.message}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => { void fetchContractData(); }} // Wrap async in void arrow
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </SectionContainer>
        </PageContainer>
      </Page>
    );
  }

  if (!contract) {
    return (
      <Page>
        <PageContainer>
          <SectionContainer className="py-8">
            <EmptyState
              icon={<FileText size={48} className="opacity-50" />}
              message="Contract not found"
              description="The contract you're looking for doesn't exist or you don't have permission to view it."
              actionButton={
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  Return to Dashboard
                </button>
              }
            />
          </SectionContainer>
        </PageContainer>
      </Page>
    );
  }

  return (
    <Page>
      <PageContainer>
        <SectionContainer className="py-6">
          <ProjectHeader
            contract={contract}
          />

          <ProjectTools
            contractId={contract.id}
            issuesCount={issuesCount}
            changeOrdersCount={changeOrdersCount}
            inspectionsCount={inspectionsCount}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <ProjectInfoForm
                contractData={contract}
              />
            </div>
            <div className="lg:col-span-1">
              <ProjectTotalsPanel
                totalBudget={typeof contract.budget === 'number' ? contract.budget : 0}
                lineItemsTotal={lineItems.reduce((acc, item) => acc + (typeof item.quantity === 'number' && typeof item.unit_price === 'number' ? item.quantity * item.unit_price : 0), 0)}
                budgetRemaining={(typeof contract.budget === 'number' ? contract.budget : 0) - lineItems.reduce((acc, item) => acc + (typeof item.quantity === 'number' && typeof item.unit_price === 'number' ? item.quantity * item.unit_price : 0), 0)}
                percentUsed={(() => {
                  const budget = typeof contract.budget === 'number' && contract.budget !== 0 ? contract.budget : 1;
                  const used = lineItems.reduce((acc, item) => acc + (typeof item.quantity === 'number' && typeof item.unit_price === 'number' ? item.quantity * item.unit_price : 0), 0);
                  return (used / budget) * 100;
                })()}
              />
            </div>
          </div>
          <WbsSection
            wbsItems={wbsItems}
            lineItems={lineItems}
            contractId={contract.id} // Use contract.id for a guaranteed string
            isLoading={isLoading}
            error={error}
            onRetry={() => { void fetchContractData(); }} // Wrap async in void arrow
          />
          <LineItemsTable
            lineItems={lineItems}
            wbsItems={wbsItems}
            contractId={contract.id} // Use contract.id for a guaranteed string
          />
        </SectionContainer>
      </PageContainer>
    </Page>
  );
};
