import { type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  DollarSign,
  FileCheck2,
  FileQuestion,
  FileText,
  FolderKanban,
  Gauge,
  Hash,
  Link2,
  PackageCheck,
  PlusCircle,
  Receipt,
  RefreshCw,
  ShieldAlert,
  Sigma,
  Truck,
} from 'lucide-react';

import { Page, PageContainer } from '@/components/Layout';
import { invokeRpc } from '@/lib/rpc.client';

type Row = Record<string, unknown>;

type ProjectPayload = {
  project?: Row;
  wbs?: { total_count?: number; items?: Row[] };
  line_items?: { total_count?: number; items?: Row[] };
};

type CorePayload = {
  counts?: Row;
  costs?: Row;
  production?: Row;
};

type Modules = {
  projectItems: Row[];
  rfis: Row[];
  rfqs: Row[];
  submittals: Row[];
  purchaseOrders: Row[];
  subcontracts: Row[];
  invoices: Row[];
  apInvoices: Row[];
  dailyLogs: Row[];
  changeOrders: Row[];
  issues: Row[];
  inspections: Row[];
  tasks: Row[];
  documents: Row[];
  punchLists: Row[];
  materialOrders: Row[];
};

type ActionFormState = {
  title: string;
  item_type: string;
  priority: string;
  due_date: string;
  next_action: string;
};

type Workstream = {
  title: string;
  description: string;
  href: string;
  icon: typeof FolderKanban;
  status: string;
  count: number;
  attentionCount: number;
};

const initialModules: Modules = {
  projectItems: [],
  rfis: [],
  rfqs: [],
  submittals: [],
  purchaseOrders: [],
  subcontracts: [],
  invoices: [],
  apInvoices: [],
  dailyLogs: [],
  changeOrders: [],
  issues: [],
  inspections: [],
  tasks: [],
  documents: [],
  punchLists: [],
  materialOrders: [],
};

const initialActionForm: ActionFormState = {
  title: '',
  item_type: 'coordination',
  priority: 'normal',
  due_date: '',
  next_action: '',
};

const actionTypes = [
  { value: 'coordination', label: 'Coordination' },
  { value: 'schedule', label: 'Schedule / Controls' },
  { value: 'procurement', label: 'Procurement' },
  { value: 'submittal', label: 'Submittal' },
  { value: 'rfi', label: 'RFI' },
  { value: 'change', label: 'Change' },
  { value: 'cost', label: 'Cost' },
  { value: 'field', label: 'Field' },
  { value: 'quality', label: 'Quality' },
  { value: 'safety', label: 'Safety' },
  { value: 'closeout', label: 'Closeout' },
  { value: 'document', label: 'Document' },
];

const priorities = ['low', 'normal', 'high', 'critical'];
const doneWords = ['approved', 'closed', 'complete', 'completed', 'done', 'resolved', 'void', 'cancelled', 'canceled', 'paid'];
const attentionWords = ['open', 'pending', 'blocked', 'overdue', 'late', 'rejected', 'revise', 'resubmit', 'draft', 'waiting', 'under_review'];

function asObject(value: unknown): Row {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {};
}

function asRows(value: unknown): Row[] {
  return Array.isArray(value) ? value.filter((row): row is Row => row !== null && typeof row === 'object' && !Array.isArray(row)) : [];
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCount(value: unknown): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(asNumber(value));
}

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(asNumber(value));
}

function formatRate(value: unknown): string {
  const parsed = asNumber(value);
  return parsed ? `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(parsed)} units/hr` : 'No rate yet';
}

function formatDate(value: unknown): string {
  const raw = asString(value);
  if (!raw) return 'No date';
  const date = new Date(raw.length === 10 ? `${raw}T00:00:00` : raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function titleFor(row: Row, fallback = 'Untitled'): string {
  return asString(row.title)
    || asString(row.subject)
    || asString(row.name)
    || asString(row.description)
    || asString(row.order_number)
    || asString(row.invoice_number)
    || asString(row.rfq_number)
    || asString(row.po_number)
    || asString(row.rfi_number)
    || asString(row.submittal_number)
    || fallback;
}

function statusFor(row: Row): string {
  return asString(row.status) || asString(row.workflow_status) || asString(row.review_status) || 'open';
}

function dateFor(row: Row): unknown {
  return row.due_date ?? row.required_on_site_date ?? row.next_follow_up_at ?? row.reviewed_at ?? row.submitted_at ?? row.updated_at ?? row.created_at;
}

function isOpen(row: Row): boolean {
  const status = statusFor(row).toLowerCase();
  return !doneWords.some((word) => status.includes(word));
}

function needsAttention(row: Row): boolean {
  const status = statusFor(row).toLowerCase();
  if (attentionWords.some((word) => status.includes(word))) return true;

  const dueRaw = row.due_date ?? row.required_on_site_date ?? row.next_follow_up_at;
  const dueDate = typeof dueRaw === 'string' ? new Date(dueRaw) : null;
  return Boolean(dueDate && !Number.isNaN(dueDate.getTime()) && dueDate.getTime() <= Date.now());
}

function openCount(rows: Row[]): number {
  return rows.filter(isOpen).length;
}

function attentionCount(rows: Row[]): number {
  return rows.filter(needsAttention).length;
}

async function safeRows(functionName: string, projectId: string): Promise<Row[]> {
  try {
    const result = await invokeRpc<unknown>(functionName, {
      _filters: { project_id: projectId },
      _limit: 200,
      _offset: 0,
      _order_by: 'updated_at',
      _direction: 'desc',
    });
    return asRows(result);
  } catch (error) {
    console.warn(`[ProjectManagement] ${functionName} failed`, error);
    return [];
  }
}

async function safeCorePayload(projectId: string): Promise<CorePayload> {
  try {
    const result = await invokeRpc<unknown>('rpc_project_management_core_payload', { p_project_id: projectId });
    return asObject(result) as CorePayload;
  } catch (error) {
    console.warn('[ProjectManagement] rpc_project_management_core_payload failed', error);
    return {};
  }
}

function latestAttention(rows: Row[], module: string, href: string, limit = 3) {
  return rows
    .filter((row) => isOpen(row))
    .sort((a, b) => (new Date(asString(dateFor(b))).getTime() || 0) - (new Date(asString(dateFor(a))).getTime() || 0))
    .slice(0, limit)
    .map((row, index) => ({
      id: asString(row.id) || `${module}-${index}`,
      title: titleFor(row, `${module} item`),
      module,
      status: statusFor(row),
      dateLabel: formatDate(dateFor(row)),
      href,
    }));
}

function typeMatches(row: Row, itemTypes: string[]): boolean {
  return itemTypes.includes(asString(row.item_type).toLowerCase());
}

function labelForActionType(value: unknown): string {
  const normalized = asString(value).toLowerCase();
  return actionTypes.find((type) => type.value === normalized)?.label ?? 'Coordination';
}

function priorityClass(priority: unknown): string {
  switch (asString(priority).toLowerCase()) {
    case 'critical':
      return 'border-red-300 bg-red-50 text-red-700';
    case 'high':
      return 'border-amber-300 bg-amber-50 text-amber-700';
    case 'low':
      return 'border-slate-300 bg-slate-50 text-slate-700';
    default:
      return 'border-blue-300 bg-blue-50 text-blue-700';
  }
}

export default function ProjectManagement(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [projectPayload, setProjectPayload] = useState<ProjectPayload | null>(null);
  const [corePayload, setCorePayload] = useState<CorePayload>({});
  const [modules, setModules] = useState<Modules>(initialModules);
  const [actionForm, setActionForm] = useState<ActionFormState>(initialActionForm);

  const loadWorkspace = useCallback(async (): Promise<void> => {
    if (!id) {
      setError('No project ID was provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [dashboard, core, projectItems, rfis, rfqs, submittals, purchaseOrders, subcontracts, invoices, apInvoices, dailyLogs, changeOrders, issues, inspections, tasks, documents, punchLists, materialOrders] = await Promise.all([
        invokeRpc<unknown>('rpc_project_dashboard_payload', { p_project_id: id, p_line_items_page: 1, p_page_size: 500 }),
        safeCorePayload(id),
        safeRows('filter_project_management_items', id),
        safeRows('filter_rfis', id),
        safeRows('filter_rfqs', id),
        safeRows('filter_submittals', id),
        safeRows('filter_purchase_orders', id),
        safeRows('filter_subcontracts', id),
        safeRows('filter_invoices', id),
        safeRows('filter_accounts_payable', id),
        safeRows('filter_daily_logs', id),
        safeRows('filter_change_orders', id),
        safeRows('filter_issues', id),
        safeRows('filter_inspections', id),
        safeRows('filter_tasks', id),
        safeRows('filter_documents', id),
        safeRows('filter_punch_lists', id),
        safeRows('filter_material_orders', id),
      ]);

      setProjectPayload(asObject(dashboard) as ProjectPayload);
      setCorePayload(core);
      setModules({ projectItems, rfis, rfqs, submittals, purchaseOrders, subcontracts, invoices, apInvoices, dailyLogs, changeOrders, issues, inspections, tasks, documents, punchLists, materialOrders });
    } catch (err) {
      console.error('[ProjectManagement] workspace load failed', err);
      setError('Unable to load the project management workspace.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const handleActionFormChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    setActionForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateAction = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!id) return;

    const title = actionForm.title.trim();
    if (!title) {
      setActionError('Action item title is required.');
      return;
    }

    setSavingAction(true);
    setActionError(null);

    try {
      await invokeRpc<unknown>('insert_project_management_items', {
        _input: {
          project_id: id,
          title,
          item_type: actionForm.item_type,
          status: 'open',
          priority: actionForm.priority,
          due_date: actionForm.due_date || null,
          next_action: actionForm.next_action.trim() || null,
        },
      });
      setActionForm(initialActionForm);
      await loadWorkspace();
    } catch (err) {
      console.error('[ProjectManagement] create action failed', err);
      setActionError('Unable to create the action item.');
    } finally {
      setSavingAction(false);
    }
  };

  const handleCompleteAction = async (row: Row): Promise<void> => {
    const actionId = asString(row.id);
    if (!actionId) return;

    setCompletingId(actionId);
    setActionError(null);

    try {
      await invokeRpc<unknown>('update_project_management_items', {
        _id: actionId,
        _input: { status: 'complete' },
      });
      await loadWorkspace();
    } catch (err) {
      console.error('[ProjectManagement] complete action failed', err);
      setActionError('Unable to complete the action item.');
    } finally {
      setCompletingId(null);
    }
  };

  const project = asObject(projectPayload?.project);
  const counts = asObject(corePayload.counts);
  const costs = asObject(corePayload.costs);
  const production = asObject(corePayload.production);
  const projectName = asString(project.name) || asString(project.title) || 'Project command workspace';
  const projectStatus = asString(project.status) || 'Unknown';
  const projectBudget = asNumber(project.budget);
  const wbsCount = projectPayload?.wbs?.total_count ?? projectPayload?.wbs?.items?.length ?? 0;
  const lineItemCount = projectPayload?.line_items?.total_count ?? projectPayload?.line_items?.items?.length ?? 0;
  const lineItemTotal = (projectPayload?.line_items?.items ?? []).reduce((sum, item) => sum + (asNumber(item.quantity) * asNumber(item.unit_price)), 0);

  const actionItems = modules.projectItems;
  const openActionItems = actionItems.filter(isOpen);
  const recentlyCompletedActionItems = actionItems.filter((row) => !isOpen(row)).slice(0, 3);
  const controlItems = actionItems.filter((row) => typeMatches(row, ['schedule', 'coordination']));
  const procurementActionItems = actionItems.filter((row) => typeMatches(row, ['procurement']));
  const documentActionItems = actionItems.filter((row) => typeMatches(row, ['submittal', 'rfi', 'document']));
  const costActionItems = actionItems.filter((row) => typeMatches(row, ['change', 'cost']));
  const fieldActionItems = actionItems.filter((row) => typeMatches(row, ['field']));
  const qualitySafetyActionItems = actionItems.filter((row) => typeMatches(row, ['quality', 'safety']));
  const closeoutActionItems = actionItems.filter((row) => typeMatches(row, ['closeout']));

  const workstreams: Workstream[] = useMemo(() => ([
    { title: 'Controls', description: 'Budget, schedule, production, blockers, and ownership tracking.', href: id ? `/projects/${id}/controls` : '/schedule-tasks', icon: FolderKanban, status: 'Control spine', count: openCount([...modules.tasks, ...controlItems]), attentionCount: attentionCount([...modules.tasks, ...controlItems]) },
    { title: 'Procurement', description: 'POs, RFQs, subcontracts, material orders, vendors, lead times, and delivery risk.', href: '/preconstruction', icon: Truck, status: 'Buyout pipeline', count: openCount([...modules.purchaseOrders, ...modules.rfqs, ...modules.subcontracts, ...modules.materialOrders, ...procurementActionItems]), attentionCount: attentionCount([...modules.purchaseOrders, ...modules.rfqs, ...modules.subcontracts, ...modules.materialOrders, ...procurementActionItems]) },
    { title: 'Document Control', description: 'RFIs, submittals, drawings, specifications, review cycles, and required backup.', href: '/document-management', icon: FileQuestion, status: 'Review log', count: openCount([...modules.rfis, ...modules.submittals, ...modules.documents, ...documentActionItems]), attentionCount: attentionCount([...modules.rfis, ...modules.submittals, ...modules.documents, ...documentActionItems]) },
    { title: 'Cost', description: 'Budgets, committed cost, invoices, AP, change exposure, pay quantities, and forecast movement.', href: '/financial-management', icon: DollarSign, status: 'Cost impact', count: openCount([...modules.changeOrders, ...modules.invoices, ...modules.apInvoices, ...costActionItems]), attentionCount: attentionCount([...modules.changeOrders, ...modules.invoices, ...modules.apInvoices, ...costActionItems]) },
    { title: 'Field Operations', description: 'Daily reports, labor hours, production quantities, inspections, issues, photos, crews, equipment, and weather.', href: '/field-operations', icon: ClipboardList, status: 'Field log', count: modules.dailyLogs.length + openCount([...modules.issues, ...fieldActionItems]), attentionCount: attentionCount([...modules.issues, ...fieldActionItems]) },
    { title: 'Quality & Safety', description: 'Inspections, punch, deficiencies, incidents, corrective actions, and quality reviews.', href: '/quality-safety', icon: ShieldAlert, status: 'Risk log', count: openCount([...modules.inspections, ...modules.punchLists, ...qualitySafetyActionItems]), attentionCount: attentionCount([...modules.inspections, ...modules.punchLists, ...qualitySafetyActionItems]) },
    { title: 'Closeout', description: 'O&Ms, warranties, spare parts, training, testing, as-builts, final docs, and turnover readiness.', href: '/document-management', icon: PackageCheck, status: 'Turnover tracker', count: openCount([...modules.punchLists, ...closeoutActionItems]), attentionCount: attentionCount([...modules.punchLists, ...closeoutActionItems]) },
    { title: 'Reporting', description: 'Weekly summaries, owner updates, executive snapshots, action exports, and meeting prep.', href: '/reporting', icon: FileCheck2, status: 'PM reporting', count: modules.dailyLogs.length, attentionCount: 0 },
  ]), [closeoutActionItems, controlItems, costActionItems, documentActionItems, fieldActionItems, id, modules, procurementActionItems, qualitySafetyActionItems]);

  const attentionItems = useMemo(() => ([
    ...latestAttention(modules.projectItems.filter(needsAttention), 'PM Action', id ? `/projects/${id}/management` : '/projects'),
    ...latestAttention(modules.rfis.filter(needsAttention), 'RFI', '/document-management'),
    ...latestAttention(modules.submittals.filter(needsAttention), 'Submittal', '/document-management'),
    ...latestAttention(modules.rfqs.filter(needsAttention), 'RFQ', '/preconstruction'),
    ...latestAttention(modules.purchaseOrders.filter(needsAttention), 'Purchase Order', '/preconstruction'),
    ...latestAttention(modules.subcontracts.filter(needsAttention), 'Subcontract', '/subcontractors'),
    ...latestAttention(modules.invoices.filter(needsAttention), 'Invoice', '/financial-management'),
    ...latestAttention(modules.apInvoices.filter(needsAttention), 'AP Invoice', '/accounts-payable'),
    ...latestAttention(modules.materialOrders.filter(needsAttention), 'Material Order', '/preconstruction'),
    ...latestAttention(modules.changeOrders.filter(needsAttention), 'Change Order', '/financial-management'),
    ...latestAttention(modules.issues.filter(needsAttention), 'Issue', '/issues'),
    ...latestAttention(modules.punchLists.filter(needsAttention), 'Punch', '/quality-safety'),
    ...latestAttention(modules.tasks.filter(needsAttention), 'Task', '/schedule-tasks'),
  ]).slice(0, 10), [id, modules]);

  const openProjectActionItems = openCount(modules.projectItems);
  const totalOpenPmItems = workstreams.reduce((sum, stream) => sum + stream.count, 0);
  const totalAttentionItems = workstreams.reduce((sum, stream) => sum + stream.attentionCount, 0);

  const topMetrics = [
    { label: 'Project status', value: projectStatus, helper: 'Current project phase/status' },
    { label: 'Budget', value: formatCurrency(projectBudget), helper: `${formatCurrency(lineItemTotal)} in line-item value` },
    { label: 'WBS areas', value: String(wbsCount), helper: `${lineItemCount} line items tracked` },
    { label: 'Open PM items', value: String(totalOpenPmItems), helper: `${totalAttentionItems} need attention • ${openProjectActionItems} PM actions` },
  ];

  const trackingMetrics = [
    { label: 'Submittals', value: formatCount(counts.submittals), helper: 'Review workflow and package tracking.', icon: FileCheck2 },
    { label: 'RFIs', value: formatCount(counts.rfis), helper: 'Questions, answers, and decisions.', icon: FileQuestion },
    { label: 'RFQs', value: formatCount(counts.rfqs), helper: 'Quote requests for buyout and changes.', icon: FileText },
    { label: 'Change orders', value: formatCount(counts.change_orders), helper: `${formatCurrency(costs.change_orders_amount)} in change exposure.`, icon: RefreshCw },
    { label: 'Purchase orders', value: formatCount(counts.purchase_orders), helper: `${formatCurrency(costs.purchase_orders_amount)} committed/tracked in POs.`, icon: PackageCheck },
    { label: 'Subcontracts', value: formatCount(counts.subcontracts), helper: `${formatCurrency(costs.subcontracts_amount)} tracked against subcontracts.`, icon: BriefcaseBusiness },
    { label: 'Invoices', value: formatCount(counts.invoices), helper: `${formatCurrency(costs.invoices_amount)} in project invoices.`, icon: Receipt },
    { label: 'AP invoices', value: formatCount(counts.ap_invoices), helper: `${formatCurrency(costs.ap_amount_due)} in accounts payable.`, icon: Banknote },
    { label: 'Labor hours', value: formatCount(production.labor_hours), helper: 'Man hours tied to line items.', icon: Clock },
    { label: 'Quantity installed', value: formatCount(production.quantity_completed), helper: 'Installed quantity from production entries.', icon: Sigma },
    { label: 'Production rate', value: formatRate(production.units_per_labor_hour), helper: 'Installed units per labor hour.', icon: Gauge },
    { label: 'Cost codes used', value: formatCount(counts.cost_codes), helper: `${formatCount(counts.line_items)} project line items.`, icon: Hash },
  ];

  const registerLinks = [
    { title: 'Project controls spine', description: 'Budget items, schedule activities, labor hours, production rate, forecast variance, and P6-lite logic ties.', href: id ? `/projects/${id}/controls` : '/schedule-tasks', icon: Link2 },
    { title: 'Document control', description: 'Submittals, RFIs, RFQs, drawings, specs, and review workflow.', href: '/document-management', icon: FileText },
    { title: 'Procurement / buyout', description: 'Purchase orders, RFQs, vendors, subcontracts, materials, and deliveries.', href: '/preconstruction', icon: Truck },
    { title: 'Cost / financials', description: 'Change orders, invoices, AP, commitments, and payment visibility.', href: '/financial-management', icon: DollarSign },
  ];

  return (
    <Page>
      <PageContainer className="space-y-8">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Project management</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{projectName}</h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                A live project command workspace for controls, procurement, documents, cost, field operations, quality, safety, reporting, and closeout.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {id && (
                <Link to={`/projects/${id}/controls`} className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                  Open controls spine
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )}
              {id && (
                <Link to={`/projects/${id}`} className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted">
                  Back to project dashboard
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">Loading project management workspace…</div>
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
              <Link key={stream.title} to={stream.href} className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-6 w-6" /></div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{stream.status}</span>
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
                <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">Open workstream<ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" /></div>
              </Link>
            );
          })}
        </section>

        {id && (
          <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[1.2fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                  <CalendarClock className="h-4 w-4" />
                  Controls spine now live
                </div>
                <h2 className="mt-2 text-2xl font-bold text-foreground">Budget + schedule + production belong together</h2>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
                  Use the controls page to create budget items and P6-lite schedule activities, then compare forecast, labor hours, installed quantity, production rate, critical work, and blocked activities from one project view.
                </p>
              </div>
              <Link to={`/projects/${id}/controls`} className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                Open project controls
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-foreground">Core tracking coverage</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The basic Procore/HeavyJob/HeavyBid/P6-adjacent objects are visible together: documents, buyout, financials, production, and cost-code structure.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trackingMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">{metric.value}</p>
                    </div>
                    <div className="rounded-xl bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{metric.helper}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-foreground">Register launchpad</h2>
            <p className="mt-1 text-sm text-muted-foreground">These are the register families Macadamy needs to mature into full CRUD tables next.</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {registerLinks.map((register) => {
              const Icon = register.icon;
              return (
                <Link key={register.title} to={register.href} className="rounded-2xl border border-border bg-muted/30 p-4 transition hover:bg-muted">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary w-fit"><Icon className="h-5 w-5" /></div>
                  <h3 className="mt-4 font-semibold text-foreground">{register.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{register.description}</p>
                  <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">Open register area<ArrowRight className="ml-2 h-4 w-4" /></div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={handleCreateAction} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary"><PlusCircle className="h-4 w-4" />Add PM action</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Create a lightweight project action item for blockers, follow-ups, delivery risks, closeout gaps, and coordination tasks.</p>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-foreground">Title</span>
                <input name="title" value={actionForm.title} onChange={handleActionFormChange} placeholder="Example: Follow up with vendor on approved submittal release" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary" />
              </label>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Type</span>
                  <select name="item_type" value={actionForm.item_type} onChange={handleActionFormChange} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary">
                    {actionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Priority</span>
                  <select name="priority" value={actionForm.priority} onChange={handleActionFormChange} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary">
                    {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Due date</span>
                  <input type="date" name="due_date" value={actionForm.due_date} onChange={handleActionFormChange} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary" />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-foreground">Next action</span>
                <textarea name="next_action" value={actionForm.next_action} onChange={handleActionFormChange} rows={3} placeholder="What needs to happen next?" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary" />
              </label>
            </div>
            {actionError && <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{actionError}</div>}
            <button type="submit" disabled={savingAction} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {savingAction ? 'Saving action…' : 'Create action item'}
            </button>
          </form>

          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">PM action register</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Live action items stored in project_management_items.</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">{openActionItems.length} open</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {openActionItems.length === 0 ? (
                <div className="flex items-start gap-3 p-5 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-600" /><span>No open PM action items yet. Add one from the form to start using the live project action register.</span></div>
              ) : openActionItems.map((item) => {
                const itemId = asString(item.id);
                return (
                  <div key={itemId || titleFor(item)} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClass(item.priority)}`}>{asString(item.priority) || 'normal'}</span>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{labelForActionType(item.item_type)}</span>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{statusFor(item)}</span>
                      </div>
                      <h3 className="mt-3 font-semibold text-foreground">{titleFor(item, 'PM action item')}</h3>
                      {asString(item.next_action) && <p className="mt-1 text-sm leading-6 text-muted-foreground">{asString(item.next_action)}</p>}
                      <p className="mt-2 text-xs text-muted-foreground">Due: {formatDate(item.due_date)}</p>
                    </div>
                    <button type="button" onClick={() => { void handleCompleteAction(item); }} disabled={completingId === itemId} className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60">
                      <CheckCircle2 className="mr-2 h-4 w-4" />{completingId === itemId ? 'Completing…' : 'Mark complete'}
                    </button>
                  </div>
                );
              })}
            </div>
            {recentlyCompletedActionItems.length > 0 && (
              <div className="border-t border-border bg-muted/20 p-5">
                <h3 className="text-sm font-semibold text-foreground">Recently completed</h3>
                <div className="mt-3 space-y-2">
                  {recentlyCompletedActionItems.map((item) => (
                    <div key={asString(item.id)} className="flex items-center justify-between gap-3 text-sm text-muted-foreground"><span>{titleFor(item, 'Completed action')}</span><span>{formatDate(item.updated_at)}</span></div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
                <div className="flex items-start gap-3 p-5 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-600" /><span>No attention items found from the currently connected modules.</span></div>
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
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary"><CalendarClock className="h-4 w-4" />Next build moves</div>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4"><h3 className="font-semibold text-foreground">1. Expand controls details</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Add edit/detail views and link budget items to cost codes, line items, commitments, and actuals.</p></div>
              <div className="rounded-xl border border-border bg-muted/30 p-4"><h3 className="font-semibold text-foreground">2. Add schedule logic ties UI</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Create predecessor/successor relationships and surface blocked critical-path activities.</p></div>
              <div className="rounded-xl border border-border bg-muted/30 p-4"><h3 className="font-semibold text-foreground">3. Build full registers</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">RFIs, submittals, RFQs, POs, subcontracts, invoices, AP, and change orders need filters, detail views, and exports.</p></div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <h2 className="font-semibold">Core PM tracking and controls foundation is live</h2>
              <p className="mt-1 text-sm leading-6">This workspace now links directly to the project controls spine while still surfacing submittals, POs, RFIs, RFQs, subcontracts, invoices, AP invoices, change orders, labor hours, production quantity, production rate, line items, cost codes, and PM action items.</p>
            </div>
          </div>
        </section>
      </PageContainer>
    </Page>
  );
}
