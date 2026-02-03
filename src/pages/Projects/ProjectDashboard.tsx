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
import { rpcClient } from '@/lib/rpc.client';
import { getOrderByColumn } from '@/lib/utils/rpcOrderBy';
import { supabase } from '@/lib/supabase';
import { Page, PageContainer, SectionContainer } from '@/components/Layout';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import type { ContractWithWktRow, WbsWithWktRow, LineItemsWithWktRow } from '@/lib/rpc.types';
import type { Database } from '@/lib/database.types';

type WbsRow = Database['public']['Functions']['filter_wbs']['Returns'][number];
type LineItemRow = Database['public']['Functions']['filter_line_items']['Returns'][number];

import { ProjectHeader } from './ProjectDashboardComponents/ProjectHeader';
import { ProjectInfoForm, type ProjectInfoVM } from './ProjectDashboardComponents/ProjectInfoForm';
import { ProjectTotalsPanel } from './ProjectDashboardComponents/ProjectTotalsPanel';
import { WbsSection } from './ProjectDashboardComponents/WbsSection';
import { LineItemsTable } from './ProjectDashboardComponents/LineItemsTable';
import { ProjectTools } from './ProjectDashboardComponents/ProjectTools';

export default function ProjectDashboard() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<ContractWithWktRow | null>(null);
  const [wbsItems, setWbsItems] = useState<WbsWithWktRow[]>([]);
  const [lineItems, setLineItems] = useState<LineItemsWithWktRow[]>([]);
  const [issuesCount, setIssuesCount] = useState<number>(0);
  const [changeOrdersCount, setChangeOrdersCount] = useState<number>(0);
  const [inspectionsCount, setInspectionsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const projectInfo: ProjectInfoVM | null = contract
    ? {
      id: contract.id,
      title: contract.title,
      description: contract.description,
      start_date: contract.start_date,
      end_date: contract.end_date,
      status: typeof contract.status === 'string' ? contract.status : null,
      budget: contract.budget,
      coordinates_wkt: contract.coordinates_wkt,
      created_at: contract.created_at,
      updated_at: contract.updated_at,
    }
    : null;

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
      const orderBy = await getOrderByColumn('projects');
      if (!orderBy) {
        throw new Error('Project ordering unavailable');
      }

      const projects = await rpcClient.filter_projects({
        _filters: { id: contractId },
        _order_by: orderBy,
        _direction: 'asc'
      });

      const project = Array.isArray(projects) ? projects[0] : null;
      if (!project) throw new Error('Project not found');

      const mappedContract: ContractWithWktRow = {
        id: project.id,
        project_id: project.id,
        contract_number: '',
        title: project.name,
        description: project.description,
        start_date: project.start_date,
        end_date: project.end_date,
        budget: null,
        status: project.status as ContractWithWktRow['status'],
        created_at: project.created_at,
        updated_at: project.updated_at,
        coordinates_wkt: null
      };
      setContract(mappedContract);

      const wbsData = await rpcClient.filter_wbs({
        _filters: { project_id: contractId }
      });

      const normalizedWbs: WbsWithWktRow[] = Array.isArray(wbsData)
        ? wbsData.map((wbs: WbsRow) => ({
          id: wbs.id,
          contract_id: wbs.project_id ?? contractId,
          wbs_number: typeof wbs.order_num === 'number' ? String(wbs.order_num) : wbs.name,
          description: wbs.name,
          budget: null,
          scope: null,
          location: wbs.location,
          created_at: wbs.created_at,
          updated_at: wbs.updated_at,
          coordinates_wkt: null
        }))
        : [];
      setWbsItems(normalizedWbs);

      const lineItemsData = await rpcClient.filter_line_items({
        _filters: { project_id: contractId }
      });

      const normalizedLineItems: LineItemsWithWktRow[] = Array.isArray(lineItemsData)
        ? lineItemsData.map((item: LineItemRow) => ({
          id: item.id,
          contract_id: item.project_id ?? contractId,
          wbs_id: item.wbs_id ?? '',
          map_id: item.map_id ?? null,
          item_code: item.cost_code_id ?? item.name ?? null,
          description: item.description ?? item.name ?? null,
          quantity: typeof item.quantity === 'number' ? item.quantity : 0,
          unit_price: typeof item.unit_price === 'number' ? item.unit_price : 0,
          unit_measure: item.unit_measure as LineItemsWithWktRow['unit_measure'],
          reference_doc: null,
          template_id: item.template_id ?? null,
          created_at: item.created_at,
          updated_at: item.updated_at,
          coordinates_wkt: null
        }))
        : [];
      setLineItems(normalizedLineItems);

      const issues = await rpcClient.filter_issues({
        _filters: { project_id: contractId }
      });
      setIssuesCount(Array.isArray(issues) ? issues.length : 0);

      const changeOrders = await rpcClient.filter_change_orders({
        _filters: { project_id: contractId }
      });
      setChangeOrdersCount(Array.isArray(changeOrders) ? changeOrders.length : 0);

      const inspections = await rpcClient.filter_inspections({
        _filters: { project_id: contractId }
      });
      setInspectionsCount(Array.isArray(inspections) ? inspections.length : 0);

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wbs', filter: `project_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'line_items', filter: `project_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues', filter: `project_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'change_orders', filter: `project_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inspections', filter: `project_id=eq.${contractId}` }, () => { void fetchContractData(); })
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
              {projectInfo && (
                <ProjectInfoForm
                  contractData={projectInfo}
                />
              )}
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
