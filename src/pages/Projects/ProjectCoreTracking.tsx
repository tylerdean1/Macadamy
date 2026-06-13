import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  Briefcase,
  ClipboardList,
  Clock,
  FileCheck2,
  FileQuestion,
  FileText,
  Gauge,
  Hash,
  PackageCheck,
  Receipt,
  RefreshCw,
  Sigma,
} from 'lucide-react';

import { Page, PageContainer } from '@/components/Layout';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { getBackendErrorMessage, logBackendError } from '@/lib/backendErrors';
import { invokeRpc } from '@/lib/rpc.client';
import { toast } from 'sonner';

type JsonObject = Record<string, unknown>;

type CorePayload = {
  counts?: JsonObject;
  costs?: JsonObject;
  production?: JsonObject;
};

type MetricCard = {
  label: string;
  value: string;
  helper: string;
  icon: typeof ClipboardList;
};

function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
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
  if (!parsed) return 'Not enough data';
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(parsed)} units/hr`;
}

export default function ProjectCoreTracking(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [payload, setPayload] = useState<CorePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayload = useCallback(async (): Promise<void> => {
    if (!id) {
      setPayload(null);
      setError('No project ID was provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await invokeRpc<unknown>('rpc_project_management_core_payload', {
        p_project_id: id,
      });
      setPayload(asObject(result) as CorePayload);
    } catch (err) {
      logBackendError({
        module: 'Project Core Tracking',
        operation: 'load project management core payload',
        trigger: 'user',
        error: err,
        ids: { projectId: id },
      });
      setPayload(null);
      setError(getBackendErrorMessage(err));
      toast.error('Unable to load project core tracking data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadPayload();
  }, [loadPayload]);

  const counts = asObject(payload?.counts);
  const costs = asObject(payload?.costs);
  const production = asObject(payload?.production);

  const documentMetrics: MetricCard[] = [
    { label: 'Submittals', value: formatCount(counts.submittals), helper: 'Product data, shop drawings, O&Ms, and review workflow.', icon: FileCheck2 },
    { label: 'RFIs', value: formatCount(counts.rfis), helper: 'Questions, responses, and decision documentation.', icon: FileQuestion },
    { label: 'RFQs', value: formatCount(counts.rfqs), helper: 'Quotes requested from vendors/subs before award or buyout.', icon: FileText },
    { label: 'Change orders', value: formatCount(counts.change_orders), helper: 'Approved/pending cost and scope movement.', icon: RefreshCw },
  ];

  const procurementMetrics: MetricCard[] = [
    { label: 'Purchase orders', value: formatCount(counts.purchase_orders), helper: `${formatCurrency(costs.purchase_orders_amount)} committed/tracked in POs.`, icon: PackageCheck },
    { label: 'Subcontracts', value: formatCount(counts.subcontracts), helper: `${formatCurrency(costs.subcontracts_amount)} tracked against subcontract agreements.`, icon: Briefcase },
    { label: 'Invoices', value: formatCount(counts.invoices), helper: `${formatCurrency(costs.invoices_amount)} in vendor/sub/owner invoices.`, icon: Receipt },
    { label: 'AP invoices', value: formatCount(counts.ap_invoices), helper: `${formatCurrency(costs.ap_amount_due)} currently represented in accounts payable.`, icon: Banknote },
  ];

  const productionMetrics: MetricCard[] = [
    { label: 'Labor hours', value: formatCount(production.labor_hours), helper: 'Man hours tracked through labor records tied to line items.', icon: Clock },
    { label: 'Quantity installed', value: formatCount(production.quantity_completed), helper: 'Production quantity from line item entries.', icon: Sigma },
    { label: 'Production rate', value: formatRate(production.units_per_labor_hour), helper: 'Installed units per labor hour, when enough data exists.', icon: Gauge },
    { label: 'Cost codes used', value: formatCount(counts.cost_codes), helper: `${formatCount(counts.line_items)} line items connected to the project quantity/cost structure.`, icon: Hash },
  ];

  const sections = [
    {
      title: 'Document control',
      description: 'Submittals, RFIs, RFQs, and change-order movement.',
      metrics: documentMetrics,
    },
    {
      title: 'Procurement / contracts / invoices',
      description: 'POs, subcontracts, invoices, and AP invoice visibility.',
      metrics: procurementMetrics,
    },
    {
      title: 'Labor, production, and cost codes',
      description: 'Man hours, production rates, line items, and cost-code coverage.',
      metrics: productionMetrics,
    },
  ];

  return (
    <Page>
      <PageContainer className="space-y-8">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Core project tracking</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Basic PM functions coverage
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                A project-level check that core construction-management functions exist and are being counted: submittals, POs, RFIs, RFQs, subcontracts, invoices, AP invoices, change orders, labor hours, production, and cost codes.
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
            <div className="mt-6">
              <LoadingState message="Loading core tracking coverage..." />
            </div>
          )}

          {error && (
            <div className="mt-6">
              <ErrorState
                error={error}
                onRetry={() => { void loadPayload(); }}
                title="Unable to load core tracking data"
              />
            </div>
          )}
        </section>

        {!loading && !error && sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {section.metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="rounded-2xl border border-border bg-muted/30 p-4">
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
            </div>
          </section>
        ))}
      </PageContainer>
    </Page>
  );
}
