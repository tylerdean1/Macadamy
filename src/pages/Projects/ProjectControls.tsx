import { type ChangeEvent, type FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Gauge,
  Link2,
  PlusCircle,
  Sigma,
  TrendingUp,
} from 'lucide-react';

import { Page, PageContainer } from '@/components/Layout';
import { invokeRpc } from '@/lib/rpc.client';

type Row = Record<string, unknown>;

type ControlsPayload = {
  budget?: Row;
  schedule?: Row;
  production?: Row;
};

type BudgetFormState = {
  title: string;
  budget_type: string;
  quantity: string;
  unit: string;
  unit_cost: string;
  budget_amount: string;
};

type ActivityFormState = {
  activity_code: string;
  title: string;
  activity_type: string;
  status: string;
  planned_start: string;
  planned_finish: string;
  percent_complete: string;
  is_critical: boolean;
  blocker_summary: string;
};

const initialBudgetForm: BudgetFormState = {
  title: '',
  budget_type: 'original',
  quantity: '',
  unit: '',
  unit_cost: '',
  budget_amount: '',
};

const initialActivityForm: ActivityFormState = {
  activity_code: '',
  title: '',
  activity_type: 'task',
  status: 'not_started',
  planned_start: '',
  planned_finish: '',
  percent_complete: '0',
  is_critical: false,
  blocker_summary: '',
};

const budgetTypes = ['original', 'change', 'allowance', 'contingency', 'forecast', 'transfer'];
const activityTypes = ['task', 'milestone', 'procurement', 'submittal', 'rfi', 'change', 'field', 'closeout'];
const activityStatuses = ['not_started', 'in_progress', 'blocked', 'complete', 'cancelled'];

function asObject(value: unknown): Row {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {};
}

function asRows(value: unknown): Row[] {
  return Array.isArray(value) ? value.filter((row): row is Row => row !== null && typeof row === 'object' && !Array.isArray(row)) : [];
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(asNumber(value));
}

function formatNumber(value: unknown): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(asNumber(value));
}

function formatPercent(value: unknown): string {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(asNumber(value))}%`;
}

function formatDate(value: unknown): string {
  const raw = asString(value);
  if (!raw) return 'Not set';
  const date = new Date(raw.length === 10 ? `${raw}T00:00:00` : raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function titleFor(row: Row): string {
  return asString(row.title) || asString(row.name) || asString(row.activity_code) || 'Untitled';
}

function statusFor(row: Row): string {
  return asString(row.status) || 'active';
}

function cleanNumber(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export default function ProjectControls(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [payload, setPayload] = useState<ControlsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingBudget, setSavingBudget] = useState<boolean>(false);
  const [savingActivity, setSavingActivity] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [budgetForm, setBudgetForm] = useState<BudgetFormState>(initialBudgetForm);
  const [activityForm, setActivityForm] = useState<ActivityFormState>(initialActivityForm);

  const loadControls = useCallback(async (): Promise<void> => {
    if (!id) {
      setError('No project ID was provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await invokeRpc<unknown>('rpc_project_controls_payload', {
        p_project_id: id,
      });
      setPayload(asObject(result) as ControlsPayload);
    } catch (err) {
      console.error('[ProjectControls] load failed', err);
      setError('Unable to load project controls data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadControls();
  }, [loadControls]);

  const handleBudgetChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setBudgetForm((current) => ({ ...current, [name]: value }));
  };

  const handleActivityChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    setActivityForm((current) => ({ ...current, [name]: type === 'checkbox' ? Boolean(checked) : value }));
  };

  const createBudgetItem = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!id) return;

    const title = budgetForm.title.trim();
    if (!title) {
      setBudgetError('Budget item title is required.');
      return;
    }

    setSavingBudget(true);
    setBudgetError(null);

    const calculatedAmount = budgetForm.budget_amount.trim()
      || (budgetForm.quantity.trim() && budgetForm.unit_cost.trim()
        ? String(asNumber(budgetForm.quantity) * asNumber(budgetForm.unit_cost))
        : '0');

    try {
      await invokeRpc<unknown>('insert_project_budget_items', {
        _input: {
          project_id: id,
          title,
          budget_type: budgetForm.budget_type,
          quantity: cleanNumber(budgetForm.quantity),
          unit: budgetForm.unit.trim() || null,
          unit_cost: cleanNumber(budgetForm.unit_cost),
          budget_amount: calculatedAmount,
          forecast_amount: calculatedAmount,
          status: 'active',
        },
      });
      setBudgetForm(initialBudgetForm);
      await loadControls();
    } catch (err) {
      console.error('[ProjectControls] create budget item failed', err);
      setBudgetError('Unable to create the budget item.');
    } finally {
      setSavingBudget(false);
    }
  };

  const createActivity = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!id) return;

    const title = activityForm.title.trim();
    if (!title) {
      setActivityError('Schedule activity title is required.');
      return;
    }

    setSavingActivity(true);
    setActivityError(null);

    try {
      await invokeRpc<unknown>('insert_project_schedule_activities', {
        _input: {
          project_id: id,
          activity_code: activityForm.activity_code.trim() || null,
          title,
          activity_type: activityForm.activity_type,
          status: activityForm.status,
          planned_start: activityForm.planned_start || null,
          planned_finish: activityForm.planned_finish || null,
          percent_complete: cleanNumber(activityForm.percent_complete) ?? '0',
          is_critical: activityForm.is_critical,
          blocker_summary: activityForm.blocker_summary.trim() || null,
        },
      });
      setActivityForm(initialActivityForm);
      await loadControls();
    } catch (err) {
      console.error('[ProjectControls] create schedule activity failed', err);
      setActivityError('Unable to create the schedule activity.');
    } finally {
      setSavingActivity(false);
    }
  };

  const budget = asObject(payload?.budget);
  const schedule = asObject(payload?.schedule);
  const production = asObject(payload?.production);
  const budgetItems = asRows(budget.items);
  const activities = asRows(schedule.activities);
  const relationships = asRows(schedule.relationships);

  const budgetVariance = asNumber(budget.forecast_amount) - asNumber(budget.budget_amount);
  const completeActivities = asNumber(schedule.complete_activities);
  const totalActivities = asNumber(schedule.total_activities);
  const scheduleProgress = totalActivities > 0 ? (completeActivities / totalActivities) * 100 : 0;

  const metricCards = [
    { label: 'Budget', value: formatCurrency(budget.budget_amount), helper: `${formatCurrency(budget.committed_amount)} committed`, icon: CircleDollarSign },
    { label: 'Forecast variance', value: formatCurrency(budgetVariance), helper: `${formatCurrency(budget.forecast_amount)} forecast`, icon: TrendingUp },
    { label: 'Activities', value: formatNumber(schedule.total_activities), helper: `${formatNumber(schedule.critical_activities)} critical • ${formatNumber(schedule.blocked_activities)} blocked`, icon: CalendarClock },
    { label: 'Schedule complete', value: formatPercent(scheduleProgress), helper: `${formatNumber(schedule.complete_activities)} of ${formatNumber(schedule.total_activities)} complete`, icon: CheckCircle2 },
    { label: 'Labor hours', value: formatNumber(production.labor_hours), helper: 'From labor records tied to line items', icon: Clock },
    { label: 'Quantity installed', value: formatNumber(production.quantity_completed), helper: 'From line item entries', icon: Sigma },
    { label: 'Production rate', value: asNumber(production.units_per_labor_hour) ? `${formatNumber(production.units_per_labor_hour)} units/hr` : 'No rate yet', helper: 'Quantity installed / labor hours', icon: Gauge },
    { label: 'Logic ties', value: formatNumber(relationships.length), helper: 'Schedule dependency relationships', icon: Link2 },
  ];

  return (
    <Page>
      <PageContainer className="space-y-8">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Project controls</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Budget, schedule, and production spine
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                This is the HeavyBid/HeavyJob/P6 bridge: budget items, schedule activities, logic ties, labor hours, production quantity, production rate, and forecast variance in one project controls view.
              </p>
            </div>
            {id && (
              <Link
                to={`/projects/${id}/management`}
                className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Back to PM workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            )}
          </div>

          {loading && (
            <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
              Loading project controls…
            </div>
          )}

          {error && (
            <div className="mt-6 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {!loading && !error && (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">{metric.value}</p>
                      </div>
                      <div className="rounded-xl bg-primary/10 p-2 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">{metric.helper}</p>
                  </div>
                );
              })}
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <form onSubmit={createBudgetItem} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                  <PlusCircle className="h-4 w-4" />
                  Add budget item
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Create the estimate-to-budget control line that later connects to cost codes, commitments, actual cost, forecast, and production.
                </p>
                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-foreground">Title</span>
                    <input
                      name="title"
                      value={budgetForm.title}
                      onChange={handleBudgetChange}
                      placeholder="Example: Yard piping installation"
                      className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                    />
                  </label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Type</span>
                      <select
                        name="budget_type"
                        value={budgetForm.budget_type}
                        onChange={handleBudgetChange}
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      >
                        {budgetTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Quantity</span>
                      <input
                        name="quantity"
                        value={budgetForm.quantity}
                        onChange={handleBudgetChange}
                        inputMode="decimal"
                        placeholder="100"
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Unit</span>
                      <input
                        name="unit"
                        value={budgetForm.unit}
                        onChange={handleBudgetChange}
                        placeholder="LF, CY, EA"
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Unit cost</span>
                      <input
                        name="unit_cost"
                        value={budgetForm.unit_cost}
                        onChange={handleBudgetChange}
                        inputMode="decimal"
                        placeholder="125"
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Budget amount</span>
                      <input
                        name="budget_amount"
                        value={budgetForm.budget_amount}
                        onChange={handleBudgetChange}
                        inputMode="decimal"
                        placeholder="Optional; calculated from qty × unit cost if blank"
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </label>
                  </div>
                </div>
                {budgetError && <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{budgetError}</div>}
                <button
                  type="submit"
                  disabled={savingBudget}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingBudget ? 'Saving budget item…' : 'Create budget item'}
                </button>
              </form>

              <form onSubmit={createActivity} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                  <PlusCircle className="h-4 w-4" />
                  Add schedule activity
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Start building the P6-lite activity register: activities, dates, status, percent complete, critical flags, and blockers.
                </p>
                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-[0.45fr_1fr]">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Code</span>
                      <input
                        name="activity_code"
                        value={activityForm.activity_code}
                        onChange={handleActivityChange}
                        placeholder="A1000"
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Title</span>
                      <input
                        name="title"
                        value={activityForm.title}
                        onChange={handleActivityChange}
                        placeholder="Example: Install clarifier equipment"
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Type</span>
                      <select
                        name="activity_type"
                        value={activityForm.activity_type}
                        onChange={handleActivityChange}
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      >
                        {activityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Status</span>
                      <select
                        name="status"
                        value={activityForm.status}
                        onChange={handleActivityChange}
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      >
                        {activityStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Percent complete</span>
                      <input
                        name="percent_complete"
                        value={activityForm.percent_complete}
                        onChange={handleActivityChange}
                        inputMode="decimal"
                        placeholder="0"
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Planned start</span>
                      <input
                        type="date"
                        name="planned_start"
                        value={activityForm.planned_start}
                        onChange={handleActivityChange}
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Planned finish</span>
                      <input
                        type="date"
                        name="planned_finish"
                        value={activityForm.planned_finish}
                        onChange={handleActivityChange}
                        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                      />
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      name="is_critical"
                      checked={activityForm.is_critical}
                      onChange={handleActivityChange}
                      className="h-4 w-4 rounded border-border"
                    />
                    Critical activity
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-foreground">Blocker summary</span>
                    <textarea
                      name="blocker_summary"
                      value={activityForm.blocker_summary}
                      onChange={handleActivityChange}
                      rows={3}
                      placeholder="Example: Waiting on approved submittal or equipment delivery"
                      className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                    />
                  </label>
                </div>
                {activityError && <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{activityError}</div>}
                <button
                  type="submit"
                  disabled={savingActivity}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingActivity ? 'Saving activity…' : 'Create schedule activity'}
                </button>
              </form>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-5">
                  <h2 className="text-xl font-bold text-foreground">Budget items</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Estimate-to-budget lines connected to WBS, cost codes, line items, commitments, actuals, and forecast.</p>
                </div>
                <div className="divide-y divide-border">
                  {budgetItems.length === 0 ? (
                    <div className="p-5 text-sm text-muted-foreground">No budget items yet. Create one above to start building the control budget.</div>
                  ) : budgetItems.slice(0, 8).map((item) => (
                    <div key={asString(item.id) || titleFor(item)} className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <p className="font-semibold text-foreground">{titleFor(item)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{statusFor(item)} • {asString(item.budget_type) || 'original'} • {formatNumber(item.quantity)} {asString(item.unit)}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-foreground">{formatCurrency(item.budget_amount)}</p>
                        <p className="text-xs text-muted-foreground">Forecast {formatCurrency(item.forecast_amount ?? item.budget_amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-5">
                  <h2 className="text-xl font-bold text-foreground">Schedule activities</h2>
                  <p className="mt-1 text-sm text-muted-foreground">P6-lite activity register with planned, baseline, actual, status, float, critical, and blocker fields.</p>
                </div>
                <div className="divide-y divide-border">
                  {activities.length === 0 ? (
                    <div className="p-5 text-sm text-muted-foreground">No schedule activities yet. Create one above to begin the CPM-lite activity register.</div>
                  ) : activities.slice(0, 8).map((activity) => (
                    <div key={asString(activity.id) || titleFor(activity)} className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <p className="font-semibold text-foreground">{titleFor(activity)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {asString(activity.activity_code) || 'No code'} • {statusFor(activity)} • {formatPercent(activity.percent_complete)}
                        </p>
                        {asString(activity.blocker_summary) && (
                          <p className="mt-2 text-sm text-amber-600">Blocked: {asString(activity.blocker_summary)}</p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-foreground">{formatDate(activity.planned_start)}</p>
                        <p className="text-xs text-muted-foreground">to {formatDate(activity.planned_finish)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </PageContainer>
    </Page>
  );
}
