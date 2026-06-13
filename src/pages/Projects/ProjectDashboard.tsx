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
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, FileText, FolderKanban } from 'lucide-react';

import { Page, PageContainer, SectionContainer } from '@/components/Layout';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { getBackendErrorMessage, logBackendError } from '@/lib/backendErrors';
import { rpcClient } from '@/lib/rpc.client';
import { supabase } from '@/lib/supabase';
import type { ContractWithWktRow, LineItemsWithWktRow, WbsWithWktRow } from '@/lib/geospatial.types';
import { toast } from 'sonner';

import { LineItemsTable } from './ProjectDashboardComponents/LineItemsTable';
import { ProjectHeader } from './ProjectDashboardComponents/ProjectHeader';
import { ProjectInfoForm, type ProjectInfoVM } from './ProjectDashboardComponents/ProjectInfoForm';
import { ProjectTools } from './ProjectDashboardComponents/ProjectTools';
import { ProjectTotalsPanel } from './ProjectDashboardComponents/ProjectTotalsPanel';
import { WbsSection } from './ProjectDashboardComponents/WbsSection';
import ProjectNav from './ProjectNav';

type ProjectPayload = {
  project: Record<string, unknown>;
  wbs: { total_count: number; items: Array<Record<string, unknown>> };
  line_items: { total_count: number; items: Array<Record<string, unknown>> };
  counts: { issues: number; change_orders: number; inspections: number };
};

type LoadTrigger = 'user' | 'background';

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export default function ProjectDashboard(): JSX.Element {
  const { contractId, id } = useParams<{ contractId?: string; id?: string }>();
  const projectId = contractId ?? id ?? '';
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

  const fetchProjectData = useCallback(async (trigger: LoadTrigger = 'user') => {
    if (typeof projectId !== 'string' || !projectId.trim()) {
      setError(new Error('No project ID provided.'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const raw = await rpcClient.rpc_project_dashboard_payload({
        p_project_id: projectId,
        p_line_items_page: 1,
        p_page_size: 500,
      });

      const payload = raw && typeof raw === 'object' ? raw as ProjectPayload : null;
      const projectRaw = payload?.project ?? {};
      if (!payload || typeof projectRaw !== 'object') {
        throw new Error('Project not found');
      }

      const mappedContract: ContractWithWktRow = {
        id: typeof projectRaw.id === 'string' ? projectRaw.id : projectId,
        project_id: typeof projectRaw.id === 'string' ? projectRaw.id : projectId,
        contract_number: '',
        title: typeof projectRaw.name === 'string' ? projectRaw.name : 'Project',
        description: typeof projectRaw.description === 'string' ? projectRaw.description : null,
        start_date: typeof projectRaw.start_date === 'string' ? projectRaw.start_date : null,
        end_date: typeof projectRaw.end_date === 'string' ? projectRaw.end_date : null,
        budget: toNullableNumber(projectRaw.budget),
        status: projectRaw.status as ContractWithWktRow['status'],
        created_at: typeof projectRaw.created_at === 'string' ? projectRaw.created_at : null,
        updated_at: typeof projectRaw.updated_at === 'string' ? projectRaw.updated_at : '',
        coordinates_wkt: typeof projectRaw.coordinates_wkt === 'string' ? projectRaw.coordinates_wkt : null,
      };
      setContract(mappedContract);

      const wbsItemsRaw = Array.isArray(payload?.wbs?.items) ? payload.wbs.items : [];
      const normalizedWbs: WbsWithWktRow[] = wbsItemsRaw.map((wbs) => ({
        id: typeof wbs.id === 'string' ? wbs.id : '',
        contract_id: typeof wbs.project_id === 'string' ? wbs.project_id : projectId,
        wbs_number: typeof wbs.order_num === 'number' ? String(wbs.order_num) : (typeof wbs.name === 'string' ? wbs.name : null),
        description: typeof wbs.name === 'string' ? wbs.name : null,
        budget: toNullableNumber(wbs.budget),
        scope: typeof wbs.scope === 'string' ? wbs.scope : null,
        location: typeof wbs.location === 'string' ? wbs.location : null,
        created_at: typeof wbs.created_at === 'string' ? wbs.created_at : null,
        updated_at: typeof wbs.updated_at === 'string' ? wbs.updated_at : '',
        coordinates_wkt: typeof wbs.coordinates_wkt === 'string' ? wbs.coordinates_wkt : null,
      })).filter((item) => item.id !== '');
      setWbsItems(normalizedWbs);

      const lineItemsRaw = Array.isArray(payload?.line_items?.items) ? payload.line_items.items : [];
      const normalizedLineItems: LineItemsWithWktRow[] = lineItemsRaw.map((item) => ({
        id: typeof item.id === 'string' ? item.id : '',
        contract_id: typeof item.project_id === 'string' ? item.project_id : projectId,
        wbs_id: typeof item.wbs_id === 'string' ? item.wbs_id : '',
        map_id: typeof item.map_id === 'string' ? item.map_id : null,
        item_code: typeof item.cost_code_id === 'string' ? item.cost_code_id : (typeof item.name === 'string' ? item.name : null),
        description: typeof item.description === 'string' ? item.description : (typeof item.name === 'string' ? item.name : null),
        quantity: toNullableNumber(item.quantity) ?? 0,
        unit_price: toNullableNumber(item.unit_price) ?? 0,
        unit_measure: (typeof item.unit_measure === 'string' ? item.unit_measure : null) as LineItemsWithWktRow['unit_measure'],
        reference_doc: null,
        template_id: typeof item.template_id === 'string' ? item.template_id : null,
        created_at: typeof item.created_at === 'string' ? item.created_at : null,
        updated_at: typeof item.updated_at === 'string' ? item.updated_at : '',
        coordinates_wkt: typeof item.coordinates_wkt === 'string' ? item.coordinates_wkt : null,
      })).filter((item) => item.id !== '');
      setLineItems(normalizedLineItems);

      setIssuesCount(typeof payload?.counts?.issues === 'number' ? payload.counts.issues : 0);
      setChangeOrdersCount(typeof payload?.counts?.change_orders === 'number' ? payload.counts.change_orders : 0);
      setInspectionsCount(typeof payload?.counts?.inspections === 'number' ? payload.counts.inspections : 0);
    } catch (err) {
      logBackendError({
        module: 'Project Dashboard',
        operation: 'load project dashboard payload',
        trigger,
        error: err,
        ids: { projectId },
      });
      const fetchError = new Error(getBackendErrorMessage(err));
      setError(fetchError);
      setContract(null);
      setWbsItems([]);
      setLineItems([]);
      setIssuesCount(0);
      setChangeOrdersCount(0);
      setInspectionsCount(0);
      if (trigger === 'user') {
        toast.error('Unable to load project dashboard.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void fetchProjectData('user');
  }, [fetchProjectData]);

  useEffect(() => {
    if (typeof projectId !== 'string' || !projectId.trim()) return;

    const changes = supabase
      .channel(`project-dashboard-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, () => { void fetchProjectData('background'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wbs', filter: `project_id=eq.${projectId}` }, () => { void fetchProjectData('background'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'line_items', filter: `project_id=eq.${projectId}` }, () => { void fetchProjectData('background'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues', filter: `project_id=eq.${projectId}` }, () => { void fetchProjectData('background'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'change_orders', filter: `project_id=eq.${projectId}` }, () => { void fetchProjectData('background'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inspections', filter: `project_id=eq.${projectId}` }, () => { void fetchProjectData('background'); })
      .subscribe();

    return () => {
      void supabase.removeChannel(changes);
    };
  }, [projectId, fetchProjectData]);

  if (isLoading) {
    return (
      <Page>
        <PageContainer>
          <SectionContainer className="flex justify-center items-center min-h-screen">
            <LoadingState size="lg" message="Loading project data..." />
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
                <h2 className="text-xl font-semibold mb-4 text-red-400">Error Loading Project</h2>
                <p className="text-gray-300 mb-6">{error.message}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => { void fetchProjectData('user'); }}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/projects')}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    Return to Projects
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
              message="Project not found"
              description="The project you're looking for doesn't exist or you don't have permission to view it."
              actionButton={
                <button
                  onClick={() => navigate('/projects')}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  Return to Projects
                </button>
              }
            />
          </SectionContainer>
        </PageContainer>
      </Page>
    );
  }

  const lineItemsTotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  const totalBudget = typeof contract.budget === 'number' ? contract.budget : 0;

  const workspaceCards = [
    {
      title: 'PM Workspace',
      code: 'PM',
      href: `/projects/${contract.id}/management`,
      description: 'Command center for the project-management workspaces.',
    },
    {
      title: 'Controls',
      code: 'CTRL',
      href: `/projects/${contract.id}/controls`,
      description: 'Budget, schedule, P6-lite logic, blockers, and production controls.',
    },
    {
      title: 'Registers',
      code: 'REG',
      href: `/projects/${contract.id}/registers`,
      description: 'RFQs, submittals, RFIs, POs, subcontracts, invoices, AP invoices, and change orders.',
    },
    {
      title: 'Production',
      code: 'PROD',
      href: `/projects/${contract.id}/production`,
      description: 'Labor hours, installed quantities, worker counts, and production rates.',
    },
  ];

  return (
    <Page>
      <PageContainer>
        <SectionContainer className="py-6">
          <ProjectHeader contract={contract} />
          <ProjectNav />

          <ProjectTools
            contractId={contract.id}
            issuesCount={issuesCount}
            changeOrdersCount={changeOrdersCount}
            inspectionsCount={inspectionsCount}
          />

          <section className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                  <FolderKanban className="h-4 w-4" />
                  Project workspaces
                </div>
                <h2 className="mt-2 text-2xl font-bold text-foreground">Open the new project-management modules</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  These workspaces are where the Procore-style registers, HeavyJob-style production tracking, and controls/P6 spine are being restored and expanded.
                </p>
              </div>
              <Link
                to={`/projects/${contract.id}/registers`}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Open live registers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {workspaceCards.map((card) => (
                <Link
                  key={card.title}
                  to={card.href}
                  className="group rounded-2xl border border-border bg-muted/20 p-4 transition hover:-translate-y-0.5 hover:bg-muted/40"
                >
                  <div className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-primary/10 px-3 text-xs font-bold text-primary">
                    {card.code}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
                  <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                    Open
                    <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              {projectInfo && <ProjectInfoForm contractData={projectInfo} />}
            </div>
            <div className="lg:col-span-1">
              <ProjectTotalsPanel
                totalBudget={totalBudget}
                lineItemsTotal={lineItemsTotal}
                budgetRemaining={totalBudget - lineItemsTotal}
                percentUsed={(lineItemsTotal / (totalBudget || 1)) * 100}
              />
            </div>
          </div>

          <WbsSection
            wbsItems={wbsItems}
            lineItems={lineItems}
            contractId={contract.id}
            isLoading={isLoading}
            error={error}
            onRetry={() => { void fetchProjectData('user'); }}
          />
          <LineItemsTable
            lineItems={lineItems}
            wbsItems={wbsItems}
            contractId={contract.id}
          />
        </SectionContainer>
      </PageContainer>
    </Page>
  );
}
