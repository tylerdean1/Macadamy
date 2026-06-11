import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Clock, Gauge, HardHat, Sigma } from 'lucide-react';

import { Page, PageContainer } from '@/components/Layout';
import { invokeRpc } from '@/lib/rpc.client';

type Row = Record<string, unknown>;

function asObject(value: unknown): Row {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {};
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

export default function ProjectProduction(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [production, setProduction] = useState<Row>({});
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
      const result = await invokeRpc<unknown>('rpc_project_controls_payload', { p_project_id: id });
      const payload = asObject(result);
      setProduction(asObject(payload.production));
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

  const laborHours = asNumber(production.labor_hours);
  const quantityCompleted = asNumber(production.quantity_completed);
  const rate = asNumber(production.units_per_labor_hour);

  const cards = [
    { label: 'Labor hours', value: formatNumber(laborHours), helper: 'Man hours tied to project line items', icon: Clock },
    { label: 'Quantity installed', value: formatNumber(quantityCompleted), helper: 'Installed quantity from line item entries', icon: Sigma },
    { label: 'Production rate', value: rate ? `${formatNumber(rate)} units/hr` : 'No rate yet', helper: 'Quantity installed divided by man hours', icon: Gauge },
    { label: 'Production focus', value: 'HeavyJob', helper: 'This page will become the field production workspace', icon: HardHat },
  ];

  return (
    <Page>
      <PageContainer className="space-y-8">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Project production</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Labor, quantities, and production rates
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                A HeavyJob-style production workspace for tracking man hours, installed quantities, production rates, and field performance by project line item and cost code.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {id && (
                <Link to={`/projects/${id}/controls`} className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                  Open controls
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )}
              {id && (
                <Link to={`/projects/${id}/management`} className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted">
                  Back to PM workspace
                </Link>
              )}
            </div>
          </div>

          {loading && <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">Loading production data…</div>}
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
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{card.label}</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
                      </div>
                      <div className="rounded-xl bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">{card.helper}</p>
                  </div>
                );
              })}
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-xl font-bold text-foreground">Next production buildout</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Next this page should add production entry forms for line item, work date, crew size, labor hours, quantity installed, equipment hours, notes, and delay/weather context.
              </p>
            </section>
          </>
        )}
      </PageContainer>
    </Page>
  );
}
