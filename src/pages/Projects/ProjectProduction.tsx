import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Page, PageContainer } from '@/components/Layout';
import { logBackendError, toBackendErrorToastMessage } from '@/lib/backendErrors';
import { invokeRpc } from '@/lib/rpc.client';
import ProjectNav from './ProjectNav';

type Row = Record<string, unknown>;

type ProductionPayload = {
  summary?: Row;
  line_items?: Row[];
  recent_labor?: Row[];
  recent_quantity_entries?: Row[];
};

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

function formatNumber(value: unknown): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(asNumber(value));
}

function formatDate(value: unknown): string {
  const raw = asString(value);
  if (!raw) return 'No date';
  const date = new Date(raw.length === 10 ? `${raw}T00:00:00` : raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function lineItemTitle(row: Row): string {
  return asString(row.name) || asString(row.description) || 'Line item';
}

function lineItemLabel(lineItems: Row[], lineItemId: unknown): string {
  const id = asString(lineItemId);
  const row = lineItems.find((item) => asString(item.id) === id);
  return row ? lineItemTitle(row) : id || 'Not linked';
}

function reportProductionError(
  operation: string,
  error: unknown,
  projectId: string | null,
  trigger: 'user' | 'background' = 'background',
): string {
  const context = {
    module: 'ProjectProduction',
    operation,
    trigger,
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

export default function ProjectProduction(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const projectId = typeof id === 'string' && id.trim() !== '' ? id : null;
  const [payload, setPayload] = useState<ProductionPayload>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduction = useCallback(async (): Promise<void> => {
    if (!projectId) {
      setPayload({});
      setError('Project context is missing. Return to the project and try again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await invokeRpc<unknown>('rpc_project_production_payload', { p_project_id: projectId });
      const nextPayload = asObject(result);
      setPayload({
        summary: asObject(nextPayload.summary),
        line_items: asRows(nextPayload.line_items),
        recent_labor: asRows(nextPayload.recent_labor),
        recent_quantity_entries: asRows(nextPayload.recent_quantity_entries),
      });
    } catch (err) {
      setPayload({});
      setError(reportProductionError('load production data', err, projectId));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadProduction();
  }, [loadProduction]);

  const summary = asObject(payload.summary);
  const lineItems = payload.line_items ?? [];
  const recentLabor = (payload.recent_labor ?? []).slice(0, 6);
  const recentQuantities = (payload.recent_quantity_entries ?? []).slice(0, 6);

  const cards = [
    { label: 'Labor hours', value: formatNumber(summary.labor_hours), helper: 'Man hours tied to project line items' },
    { label: 'Quantity installed', value: formatNumber(summary.quantity_completed), helper: 'Installed quantity from line item entries' },
    { label: 'Production rate', value: asNumber(summary.units_per_labor_hour) ? `${formatNumber(summary.units_per_labor_hour)} units/hr` : 'No rate yet', helper: 'Quantity installed divided by man hours' },
    { label: 'Worker count total', value: formatNumber(summary.worker_count_total), helper: 'Sum of worker_count across labor records' },
  ];

  return (
    <Page>
      <PageContainer className="space-y-8">
        <ProjectNav />

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Project production</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Labor, quantities, and production rates</h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                A HeavyJob-style production workspace for tracking man hours, installed quantities, production rates, and field performance by project line item and cost code.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {projectId && (
                <Link to={`/projects/${projectId}/controls`} className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                  Open controls
                </Link>
              )}
              {projectId && (
                <Link to={`/projects/${projectId}/management`} className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted">
                  Back to PM workspace
                </Link>
              )}
            </div>
          </div>
          {loading && <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">Loading production data...</div>}
          {error && (
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              {projectId && (
                <button
                  type="button"
                  onClick={() => void loadProduction()}
                  className="inline-flex items-center justify-center rounded-xl border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </section>

        {!loading && !error && (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{card.helper}</p>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Line item production</p>
                <h2 className="mt-2 text-xl font-bold text-foreground">Production by line item</h2>
                <p className="mt-1 text-sm text-muted-foreground">Budget quantity, installed quantity, labor hours, worker count, and production rate by project line item.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Line item</th>
                      <th className="px-5 py-3 text-right font-semibold">Budget qty</th>
                      <th className="px-5 py-3 text-right font-semibold">Installed qty</th>
                      <th className="px-5 py-3 text-right font-semibold">Labor hrs</th>
                      <th className="px-5 py-3 text-right font-semibold">Workers</th>
                      <th className="px-5 py-3 text-right font-semibold">Units/hr</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lineItems.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">No line items found yet.</td></tr>
                    ) : lineItems.map((item) => (
                      <tr key={asString(item.id) || lineItemTitle(item)} className="transition hover:bg-muted/30">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-foreground">{lineItemTitle(item)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Unit: {asString(item.unit_measure) || 'not set'}</p>
                        </td>
                        <td className="px-5 py-4 text-right text-muted-foreground">{formatNumber(item.budget_quantity)}</td>
                        <td className="px-5 py-4 text-right font-semibold text-foreground">{formatNumber(item.quantity_completed)}</td>
                        <td className="px-5 py-4 text-right font-semibold text-foreground">{formatNumber(item.labor_hours)}</td>
                        <td className="px-5 py-4 text-right text-muted-foreground">{formatNumber(item.worker_count)}</td>
                        <td className="px-5 py-4 text-right font-semibold text-foreground">{asNumber(item.units_per_labor_hour) ? formatNumber(item.units_per_labor_hour) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-5">
                  <h2 className="text-xl font-bold text-foreground">Recent labor</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Latest labor records tied to this project through line items.</p>
                </div>
                <div className="divide-y divide-border">
                  {recentLabor.length === 0 ? (
                    <div className="p-5 text-sm text-muted-foreground">No labor records found yet.</div>
                  ) : recentLabor.map((row, index) => (
                    <div key={asString(row.id) || `labor-${index}`} className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <p className="font-semibold text-foreground">{formatDate(row.work_date ?? row.created_at)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{lineItemLabel(lineItems, row.line_item_id)}</p>
                        {asString(row.notes) && <p className="mt-2 text-sm text-muted-foreground">{asString(row.notes)}</p>}
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-foreground">{formatNumber(row.hours_worked)} hrs</p>
                        <p className="text-xs text-muted-foreground">{formatNumber(row.worker_count)} workers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-5">
                  <h2 className="text-xl font-bold text-foreground">Recent quantity entries</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Latest installed-quantity records tied to this project through line items.</p>
                </div>
                <div className="divide-y divide-border">
                  {recentQuantities.length === 0 ? (
                    <div className="p-5 text-sm text-muted-foreground">No quantity entries found yet.</div>
                  ) : recentQuantities.map((row, index) => (
                    <div key={asString(row.id) || `quantity-${index}`} className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <p className="font-semibold text-foreground">{formatDate(row.date ?? row.created_at)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{lineItemLabel(lineItems, row.line_item_id)}</p>
                        {asString(row.notes) && <p className="mt-2 text-sm text-muted-foreground">{asString(row.notes)}</p>}
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-foreground">{formatNumber(row.quantity_completed)} units</p>
                        <p className="text-xs text-muted-foreground">Entry #{index + 1}</p>
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