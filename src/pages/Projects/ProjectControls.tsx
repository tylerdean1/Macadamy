import { useCallback, useEffect, useState } from 'react';
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

export default function ProjectControls(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [payload, setPayload] = useState<ControlsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
              <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-5">
                  <h2 className="text-xl font-bold text-foreground">Budget items</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Estimate-to-budget lines connected to WBS, cost codes, line items, commitments, actuals, and forecast.</p>
                </div>
                <div className="divide-y divide-border">
                  {budgetItems.length === 0 ? (
                    <div className="p-5 text-sm text-muted-foreground">No budget items yet. This is where estimate items will become project budget/control lines.</div>
                  ) : budgetItems.slice(0, 8).map((item) => (
                    <div key={asString(item.id) || titleFor(item)} className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <p className="font-semibold text-foreground">{titleFor(item)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{statusFor(item)} • {asString(item.budget_type) || 'original'}</p>
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
                    <div className="p-5 text-sm text-muted-foreground">No schedule activities yet. This is where CPM-lite activities and blockers will live.</div>
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
