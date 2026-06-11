import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BarChart3, Clock, Gauge, HardHat, Sigma } from 'lucide-react';

import { Page, PageContainer } from '@/components/Layout';
import { invokeRpc } from '@/lib/rpc.client';

type Row = Record<string, unknown>;

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

function lineItemTitle(row: Row): string {
  return asString(row.name) || asString(row.description) || asString(row.title) || 'Line item';
}

async function safeRows(functionName: string, projectId: string): Promise<Row[]> {
  try {
    const result = await invokeRpc<unknown>(functionName, {
      _filters: { project_id: projectId },
      _limit: 500,
      _offset: 0,
      _order_by: 'updated_at',
      _direction: 'desc',
    });
    return asRows(result);
  } catch (error) {
    console.warn(`[ProjectProduction] ${functionName} failed`, error);
    return [];
  }
}

export default function ProjectProduction(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [production, setProduction] = useState<Row>({});
  const [lineItems, setLineItems] = useState<Row[]>([]);
  const [laborRecords, setLaborRecords] = useState<Row[]>([]);
  const [quantityEntries, setQuantityEntries] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduction = useCallback(async (): Promise<void> => {
    if (!id) {
      setError('No project ID was provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [payloadResult, projectLineItems, labor, quantities] = await Promise.all([
        invokeRpc<unknown>('rpc_project_controls_payload', { p_project_id: id }),
        safeRows('filter_line_items', id),
        safeRows('filter_labor_records', id),
        safeRows('filter_line_item_entries', id),
      ]);
      const payload = asObject(payloadResult);
      setProduction(asObject(payload.production));
      setLineItems(projectLineItems);
      setLaborRecords(labor);
      setQuantityEntries(quantities);
    } catch (err) {
      console.error('[ProjectProduction] load failed', err);
      setError('Unable to load project production data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadProduction();
  }, [loadProduction]);

  const laborHours = asNumber(production.labor_hours) || laborRecords.reduce((sum, row) => sum + asNumber(row.hours_worked), 0);
  const quantityCompleted = asNumber(production.quantity_completed) || quantityEntries.reduce((sum, row) => sum + asNumber(row.quantity_completed), 0);
  const rate = laborHours > 0 ? quantityCompleted / laborHours : asNumber(production.units_per_labor_hour);
  const workerCount = laborRecords.reduce((sum, row) => sum + asNumber(row.worker_count), 0);

  const lineItemStats = useMemo(() => lineItems.map((item) => {
    const lineItemId = asString(item.id);
    const hours = laborRecords.filter((row) => asString(row.line_item_id) === lineItemId).reduce((sum, row) => sum + asNumber(row.hours_worked), 0);
    const quantity = quantityEntries.filter((row) => asString(row.line_item_id) === lineItemId).reduce((sum, row) => sum + asNumber(row.quantity_completed), 0);
    return {
      id: lineItemId,
      name: lineItemTitle(item),
      unit: asString(item.unit_measure),
      budgetQuantity: asNumber(item.quantity),
      hours,
      quantity,
      rate: hours > 0 ? quantity / hours : 0,
    };
  }), [laborRecords, lineItems, quantityEntries]);

  const cards = [
    { label: 'Labor hours', value: formatNumber(laborHours), helper: 'Man hours tied to project line items', icon: Clock },
    { label: 'Quantity installed', value: formatNumber(quantityCompleted), helper: 'Installed quantity from line item entries', icon: Sigma },
    { label: 'Production rate', value: rate ? `${formatNumber(rate)} units/hr` : 'No rate yet', helper: 'Quantity installed divided by man hours', icon: Gauge },
    { label: 'Worker count total', value: formatNumber(workerCount), helper: 'Sum of worker_count across labor records', icon: HardHat },
  ];

  return (
    <Page>
      <PageContainer className="space-y-8">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Project production</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Labor, quantities, and production rates</h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">A HeavyJob-style production workspace for tracking man hours, installed quantities, production rates, and field performance by project line item and cost code.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {id && <Link to={`/projects/${id}/controls`} className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Open controls<ArrowRight className="ml-2 h-4 w-4" /></Link>}
              {id && <Link to={`/projects/${id}/management`} className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted">Back to PM workspace</Link>}
            </div>
          </div>
          {loading && <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">Loading production data…</div>}
          {error && <div className="mt-6 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive"><AlertTriangle className="mt-0.5 h-5 w-5 flex-none" /><span>{error}</span></div>}
        </section>

        {!loading && !error && (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => {
                const Icon = card.icon;
                return <div key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-muted-foreground">{card.label}</p><p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p></div><div className="rounded-xl bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div></div><p className="mt-3 text-xs leading-5 text-muted-foreground">{card.helper}</p></div>;
              })}
            </section>

            <section className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border p-5">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary"><BarChart3 className="h-4 w-4" />Line item production</div>
                <h2 className="mt-2 text-xl font-bold text-foreground">Production by line item</h2>
                <p className="mt-1 text-sm text-muted-foreground">Budget quantity, installed quantity, labor hours, and production rate by project line item.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr><th className="px-5 py-3 font-semibold">Line item</th><th className="px-5 py-3 text-right font-semibold">Budget qty</th><th className="px-5 py-3 text-right font-semibold">Installed qty</th><th className="px-5 py-3 text-right font-semibold">Labor hrs</th><th className="px-5 py-3 text-right font-semibold">Units/hr</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lineItemStats.length === 0 ? <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No line items found yet.</td></tr> : lineItemStats.map((item) => <tr key={item.id || item.name} className="transition hover:bg-muted/30"><td className="px-5 py-4"><p className="font-semibold text-foreground">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">Unit: {item.unit || 'not set'}</p></td><td className="px-5 py-4 text-right text-muted-foreground">{formatNumber(item.budgetQuantity)}</td><td className="px-5 py-4 text-right font-semibold text-foreground">{formatNumber(item.quantity)}</td><td className="px-5 py-4 text-right font-semibold text-foreground">{formatNumber(item.hours)}</td><td className="px-5 py-4 text-right font-semibold text-foreground">{item.rate ? formatNumber(item.rate) : '—'}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </PageContainer>
    </Page>
  );
}
