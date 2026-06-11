import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileCheck2,
  FileQuestion,
  FolderKanban,
  PackageCheck,
  ShieldAlert,
  Truck,
} from 'lucide-react';

import { Page, PageContainer } from '@/components/Layout';
import { invokeRpc, rpcClient } from '@/lib/rpc.client';

type RecordRow = Record<string, unknown>;
type RpcInvoker = Record<string, (args?: Record<string, unknown>) => Promise<unknown>>;

type ProjectPayload = {
  project?: RecordRow;
  wbs?: { total_count?: number; items?: RecordRow[] };
  line_items?: { total_count?: number; items?: RecordRow[] };
  counts?: { issues?: number; change_orders?: number; inspections?: number };
};

type ModuleKey =
  | 'projectItems'
  | 'rfis'
  | 'submittals'
  | 'purchaseOrders'
  | 'dailyLogs'
  | 'changeOrders'
  | 'issues'
  | 'inspections'
  | 'tasks'
  | 'documents'
  | 'punchLists'
  | 'materialOrders';

type ModuleState = Record<ModuleKey, RecordRow[]>;

type WorkstreamCard = {
  title: string;
  description: string;
  href: string;
  icon: typeof FolderKanban;
  status: string;
  count: number;
  attentionCount: number;
};

type AttentionItem = {
  id: string;
  title: string;
  module: string;
  status: string;
  dateLabel: string;
  href: string;
};

const initialModules: ModuleState = {
  projectItems: [],
  rfis: [],
  submittals: [],
  purchaseOrders: [],
  dailyLogs: [],
  changeOrders: [],
  issues: [],
  inspections: [],
  tasks: [],
  documents: [],
  punchLists: [],
  materialOrders: [],
};

const statusDoneWords = ['approved', 'closed', 'complete', 'completed', 'done', 'resolved', 'void', 'cancelled', 'canceled', 'rejected'];
const statusAttentionWords = ['open', 'pending', 'blocked', 'overdue', 'late', 'rejected', 'revise', 'resubmit', 'draft', 'waiting'];

function valueToString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function valueToNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: unknown): string {
  const raw = valueToString(value);
  if (!raw) return 'No date';
  const date = new Date(raw.length === 10 ? `${raw}T00:00:00` : raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function extractStatus(row: RecordRow): string {
  return valueToString(row.status)
    || valueToString(row.workflow_status)
    || valueToString(row.review_status)
    || valueToString(row.state)
    || 'Open';
}

function extractTitle(row: RecordRow, fallback: string): string {
  return valueToString(row.title)
    || valueToString(row.subject)
    || valueToString(row.name)
    || valueToString(row.description)
    || valueToString(row.po_number)
    || valueToString(row.rfi_number)
    || valueToString(row.submittal_number)
    || fallback;
}

function extractDate(row: RecordRow): unknown {
  return row.due_date
    ?? row.required_on_site_date
    ?? row.next_follow_up_at
    ?? row.updated_at
    ?? row.created_at;
}

function isOpenStatus(status: string): boolean {
  const normalized = status.toLowerCase();
  if (!normalized) return true;
  return !statusDoneWords.some((word) => normalized.includes(word));
}

function needsAttention(row: RecordRow): boolean {
  const status = extractStatus(row).toLowerCase();
  if (statusAttentionWords.some((word) => status.includes(word))) return true;

  const dueRaw = row.due_date ?? row.required_on_site_date ?? row.next_follow_up_at;
  const dueDate = typeof dueRaw === 'string' ? new Date(dueRaw) : null;
  if (dueDate && !Number.isNaN(dueDate.getTime())) {
    return dueDate.getTime() <= Date.now();
  }

  return false;
}

function openCount(rows: RecordRow[]): number {
  return rows.filter((row) => isOpenStatus(extractStatus(row))).length;
}

function attentionCount(rows: RecordRow[]): number {
  return rows.filter(needsAttention).length;
}

function buildFilters(projectId: string): Record<string, unknown> {
  return { project_id: projectId };
}

async function safeRpcRows(functionName: string, projectId: string): Promise<RecordRow[]> {
  try {
    const invoker = rpcClient as unknown as RpcInvoker;
    const result = await invoker[functionName]?.({
      _filters: buildFilters(projectId),
      _limit: 200,
      _offset: 0,
      _order_by: 'updated_at',
      _direction: 'desc',
    });

    return Array.isArray(result) ? result.filter((row): row is RecordRow => row !== null && typeof row === 'object' && !Array.isArray(row)) : [];
  } catch (error) {
    console.warn(`[ProjectManagement] ${functionName} failed`, error);
    return [];
  }
}

async function safeProjectManagementItems(projectId: string): Promise<RecordRow[]> {
  try {
    const result = await invokeRpc<unknown>('filter_project_management_items', {
      _filters: buildFilters(projectId),
      _limit: 200,
      _offset: 0,
    });

    return Array.isArray(result) ? result.filter((row): row is RecordRow => row !== null && typeof row === 'object' && !Array.isArray(row)) : [];
  } catch (error) {
    console.warn('[ProjectManagement] filter_project_management_items failed', error);
    return [];
  }
}

function latestItems(rows: RecordRow[], module: string, href: string, limit = 3): AttentionItem[] {
  return rows
    .filter((row) => isOpenStatus(extractStatus(row)))
    .sort((a, b) => {
      const aDate = new Date(valueToString(extractDate(a))).getTime() || 0;
      const bDate = new Date(valueToString(extractDate(b))).getTime() || 0;
      return bDate - aDate;
    })
    .slice(0, limit)
    .map((row, index) => ({
      id: valueToString(row.id) || `${module}-${index}`,
      title: extractTitle(row, `${module} item`),
      module,
      status: extractStatus(row),
      dateLabel: formatDate(extractDate(row)),
      href,
    }));
}

function typeMatches(row: RecordRow, itemTypes: string[]): boolean {
  const type = valueToString(row.item_type).toLowerCase();
  return itemTypes.includes(type);
}

export default function ProjectManagement(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [projectPayload, setProjectPayload] = useState<ProjectPayload | null>(null);
  const [modules, setModules] = useState<ModuleState>(initialModules);

  useEffect(() => {
    let isMounted = true;

    const loadWorkspace = async (): Promise<void> => {
      if (!id) {
        setError('No project ID was provided.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [dashboard, projectItems, rfis, submittals, purchaseOrders, dailyLogs, changeOrders, issues, inspections, tasks, documents, punchLists, materialOrders] = await Promise.all([
          (rpcClient as unknown as RpcInvoker).rpc_project_dashboard_payload({
            p_project_id: id,
            p_line_items_page: 1,
            p_page_size: 500,
          }),
          safeProjectManagementItems(id),
          safeRpcRows('filter_rfis', id),
          safeRpcRows('filter_submittals', id),
          safeRpcRows('filter_purchase_orders', id),
          safeRpcRows('filter_daily_logs', id),
          safeRpcRows('filter_change_orders', id),
          safeRpcRows('filter_issues', id),
          safeRpcRows('filter_inspections', id),
          safeRpcRows('filter_tasks', id),
          safeRpcRows('filter_documents', id),
          safeRpcRows('filter_punch_lists', id),
          safeRpcRows('filter_material_orders', id),
        ]);

        if (!isMounted) return;

        setProjectPayload(dashboard && typeof dashboard === 'object' ? dashboard as ProjectPayload : null);
        setModules({
          projectItems,
          rfis,
          submittals,
          purchaseOrders,
          dailyLogs,
          changeOrders,
          issues,
          inspections,
          tasks,
          documents,
          punchLists,
          materialOrders,
        });
      } catch (err) {
        console.error('[ProjectManagement] workspace load failed', err);
        if (isMounted) {
          setError('Unable to load the project management workspace.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadWorkspace();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const project = projectPayload?.project ?? {};
  const projectName = valueToString(project.name) || valueToString(project.title) || 'Project command workspace';
  const projectStatus = valueToString(project.status) || 'Unknown';
  const projectBudget = valueToNumber(project.budget);
  const wbsCount = projectPayload?.wbs?.total_count ?? projectPayload?.wbs?.items?.length ?? 0;
  const lineItemCount = projectPayload?.line_items?.total_count ?? projectPayload?.line_items?.items?.length ?? 0;
  const lineItemTotal = (projectPayload?.line_items?.items ?? []).reduce((sum, item) => {
    return sum + (valueToNumber(item.quantity) * valueToNumber(item.unit_price));
  }, 0);

  const actionItems = modules.projectItems;
  const controlItems = actionItems.filter((row) => typeMatches(row, ['schedule', 'coordination']));
  const procurementActionItems = actionItems.filter((row) => typeMatches(row, ['procurement']));
  const documentActionItems = actionItems.filter((row) => typeMatches(row, ['submittal', 'rfi', 'document']));
  const costActionItems = actionItems.filter((row) => typeMatches(row, ['change', 'cost']));
  const fieldActionItems = actionItems.filter((row) => typeMatches(row, ['field']));
  const qualitySafetyActionItems = actionItems.filter((row) => typeMatches(row, ['quality', 'safety']));
  const closeoutActionItems = actionItems.filter((row) => typeMatches(row, ['closeout']));

  const workstreams: WorkstreamCard[] = useMemo(() => ([
    {
      title: 'Controls',
      description: 'Action items, tasks, schedule risks, blockers, and ownership tracking.',
      href: '/schedule-tasks',
      icon: FolderKanban,
      status: 'Action register',
      count: openCount([...modules.tasks, ...controlItems]),
      attentionCount: attentionCount([...modules.tasks, ...controlItems]),
    },
    {
      title: 'Procurement',
      description: 'Purchase orders, material orders, vendor follow-ups, lead times, deliveries, and payment blockers.',
      href: '/preconstruction',
      icon: Truck,
      status: 'PO pipeline',
      count: openCount([...modules.purchaseOrders, ...modules.materialOrders, ...procurementActionItems]),
      attentionCount: attentionCount([...modules.purchaseOrders, ...modules.materialOrders, ...procurementActionItems]),
    },
    {
      title: 'Document Control',
      description: 'RFIs, submittals, drawings, specifications, review cycles, and required backup.',
      href: '/document-management',
      icon: FileQuestion,
      status: 'Review log',
      count: openCount([...modules.rfis, ...modules.submittals, ...modules.documents, ...documentActionItems]),
      attentionCount: attentionCount([...modules.rfis, ...modules.submittals, ...modules.documents, ...documentActionItems]),
    },
    {
      title: 'Cost',
      description: 'Budgets, committed cost, change exposure, pay quantities, invoices, and forecast movement.',
      href: '/financial-management',
      icon: DollarSign,
      status: 'Cost impact',
      count: openCount([...modules.changeOrders, ...costActionItems]),
      attentionCount: attentionCount([...modules.changeOrders, ...costActionItems]),
    },
    {
      title: 'Field Operations',
      description: 'Daily reports, production quantities, inspections, issues, photos, crews, equipment, and weather.',
      href: '/field-operations',
      icon: ClipboardList,
      status: 'Field log',
      count: modules.dailyLogs.length + openCount([...modules.issues, ...fieldActionItems]),
      attentionCount: attentionCount([...modules.issues, ...fieldActionItems]),
    },
    {
      title: 'Quality & Safety',
      description: 'Inspections, punch, deficiencies, incidents, corrective actions, and quality reviews.',
      href: '/quality-safety',
      icon: ShieldAlert,
      status: 'Risk log',
      count: openCount([...modules.inspections, ...modules.punchLists, ...qualitySafetyActionItems]),
      attentionCount: attentionCount([...modules.inspections, ...modules.punchLists, ...qualitySafetyActionItems]),
    },
    {
      title: 'Closeout',
      description: 'O&Ms, warranties, spare parts, training, testing, as-builts, final docs, and turnover readiness.',
      href: '/document-management',
      icon: PackageCheck,
      status: 'Turnover tracker',
      count: openCount([...modules.punchLists, ...closeoutActionItems]),
      attentionCount: attentionCount([...modules.punchLists, ...closeoutActionItems]),
    },
    {
      title: 'Reporting',
      description: 'Weekly summaries, owner updates, executive snapshots, action exports, and meeting prep.',
      href: '/reporting',
      icon: FileCheck2,
      status: 'PM reporting',
      count: modules.dailyLogs.length,
      attentionCount: 0,
    },
  ]), [closeoutActionItems, controlItems, costActionItems, documentActionItems, fieldActionItems, modules, procurementActionItems, qualitySafetyActionItems]);

  const attentionItems = useMemo(() => ([
    ...latestItems(modules.projectItems.filter(needsAttention), 'PM Action', `/projects/${id}/management`),
    ...latestItems(modules.rfis.filter(needsAttention), 'RFI', '/document-management'),
    ...latestItems(modules.submittals.filter(needsAttention), 'Submittal', '/document-management'),
    ...latestItems(modules.purchaseOrders.filter(needsAttention), 'Purchase Order', '/preconstruction'),
    ...latestItems(modules.materialOrders.filter(needsAttention), 'Material Order', '/preconstruction'),
    ...latestItems(modules.changeOrders.filter(needsAttention), 'Change Order', '/financial-management'),
    ...latestItems(modules.issues.filter(needsAttention), 'Issue', '/issues'),
    ...latestItems(modules.punchLists.filter(needsAttention), 'Punch', '/quality-safety'),
    ...latestItems(modules.tasks.filter(needsAttention), 'Task', '/schedule-tasks'),
  ]).slice(0, 10), [id, modules]);

  const openProjectActionItems = openCount(modules.projectItems);

  const topMetrics = [
    { label: 'Project status', value: projectStatus, helper: 'Current project phase/status' },
    { label: 'Budget', value: formatCurrency(projectBudget), helper: `${formatCurrency(lineItemTotal)} in line-item value` },
    { label: 'WBS areas', value: String(wbsCount), helper: `${lineItemCount} line items tracked` },
    {
      label: 'Open PM items',
      value: String(workstreams.reduce((sum, stream) => sum + stream.count, 0)),
      helper: `${workstreams.reduce((sum, stream) => sum + stream.attentionCount, 0)} need attention • ${openProjectActionItems} PM actions`,
    },
  ];

  return (
    <Page>
      <PageContainer className="space-y-8">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Project management</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {projectName}
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                A live project command workspace for controls, procurement, documents, cost, field operations, quality, safety, reporting, and closeout.
              </p>
            </div>
            {id && (
              <Link
                to={`/projects/${id}`}
                className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Back to project dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
              Loading project management workspace…
            </div>
          ) : error ? (
            <div className="mt-6 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {topMetrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{metric.helper}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workstreams.map((stream) => {
            const Icon = stream.icon;
            return (
              <Link
                key={stream.title}
                to={stream.href}
                className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {stream.status}
                  </span>
                </div>
                <h2 className="mt-5 text-lg font-semibold text-foreground">{stream.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{stream.description}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stream.count}</p>
                    <p className="text-xs text-muted-foreground">open/tracked</p>
                  </div>
                  <div className={stream.attentionCount > 0 ? 'text-sm font-semibold text-amber-600' : 'text-sm font-semibold text-emerald-600'}>
                    {stream.attentionCount > 0 ? `${stream.attentionCount} attention` : 'Clear'}
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                  Open workstream
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Needs attention</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Open, pending, blocked, overdue, revise/resubmit, or due-soon project items.</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="divide-y divide-border">
              {attentionItems.length === 0 ? (
                <div className="flex items-start gap-3 p-5 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-600" />
                  <span>No attention items found from the currently connected modules.</span>
                </div>
              ) : attentionItems.map((item) => (
                <Link key={`${item.module}-${item.id}`} to={item.href} className="grid gap-3 p-5 transition hover:bg-muted/40 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.module} • {item.status}</p>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">{item.dateLabel}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
              <CalendarDays className="h-4 w-4" />
              Next PM moves
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h3 className="font-semibold text-foreground">1. Clear blockers</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Start with the attention list, then assign ownership and next follow-up dates.</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h3 className="font-semibold text-foreground">2. Connect workflow chains</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Tie PO, submittal, delivery, ticket, invoice, and closeout status together instead of tracking them separately.</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h3 className="font-semibold text-foreground">3. Keep closeout live</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Use punch, documents, O&Ms, warranties, spare parts, training, testing, and as-builts as a running turnover checklist.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <h2 className="font-semibold">Project action-item backend is live</h2>
              <p className="mt-1 text-sm leading-6">
                This workspace now reads the live project-management action-item table through `filter_project_management_items`, while still rolling up the older RFI, submittal, PO, field, cost, quality, and closeout modules.
              </p>
            </div>
          </div>
        </section>
      </PageContainer>
    </Page>
  );
}
