import { type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Page, PageContainer } from '@/components/Layout';
import { invokeRpc } from '@/lib/rpc.client';
import ProjectNav from './ProjectNav';

type Row = Record<string, unknown>;
type StatusFilter = 'all' | 'open' | 'closed';

type RfqForm = {
  rfq_number: string;
  title: string;
  due_date: string;
  description: string;
};

const registers = [
  { title: 'Submittals', code: 'SUB', description: 'Shop drawings, product data, O&Ms, samples, and review cycles.' },
  { title: 'RFIs', code: 'RFI', description: 'Questions, clarifications, responses, schedule impacts, and decision logs.' },
  { title: 'RFQs', code: 'RFQ', description: 'Quote requests for buyout, procurement, vendor pricing, and change pricing.' },
  { title: 'Purchase Orders', code: 'PO', description: 'POs, commitments, material orders, equipment releases, and delivery risk.' },
  { title: 'Subcontracts', code: 'SUBC', description: 'Subcontract agreements, scope commitments, subcontractor status, and values.' },
  { title: 'Invoices', code: 'INV', description: 'Project invoice records tied to vendors, subcontractors, owners, POs, and documents.' },
  { title: 'AP Invoices', code: 'AP', description: 'Accounts payable exposure, amount due, review status, and payment timing.' },
  { title: 'Change Orders', code: 'CO', description: 'Pending and approved scope, cost exposure, owner pricing, and subcontract pricing.' },
];

const closedStatusWords = ['closed', 'complete', 'completed', 'awarded', 'cancelled', 'canceled', 'void'];
const emptyRfqForm: RfqForm = { rfq_number: '', title: '', due_date: '', description: '' };

function asRows(value: unknown): Row[] {
  return Array.isArray(value) ? value.filter((row): row is Row => row !== null && typeof row === 'object' && !Array.isArray(row)) : [];
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function firstValue(row: Row, fields: string[]): string {
  for (const field of fields) {
    const value = asString(row[field]);
    if (value) return value;
  }
  return '';
}

function formatDate(value: unknown): string {
  const raw = asString(value);
  if (!raw) return 'No date';
  const date = new Date(raw.length === 10 ? `${raw}T00:00:00` : raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function rfqNumber(row: Row, index: number): string {
  return firstValue(row, ['rfq_number', 'number', 'code']) || `RFQ-${index + 1}`;
}

function rfqTitle(row: Row): string {
  return firstValue(row, ['title', 'subject', 'description']) || 'Untitled RFQ';
}

function rfqStatus(row: Row): string {
  return firstValue(row, ['status', 'workflow_status', 'review_status']) || 'open';
}

function isClosed(row: Row): boolean {
  const status = rfqStatus(row).toLowerCase();
  return closedStatusWords.some((word) => status.includes(word));
}

export default function ProjectRegisters(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [rfqs, setRfqs] = useState<Row[]>([]);
  const [loadingRfqs, setLoadingRfqs] = useState(true);
  const [savingRfq, setSavingRfq] = useState(false);
  const [rfqError, setRfqError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [rfqForm, setRfqForm] = useState<RfqForm>(emptyRfqForm);

  const loadRfqs = useCallback(async (): Promise<void> => {
    if (!id) {
      setLoadingRfqs(false);
      return;
    }

    setLoadingRfqs(true);
    setRfqError(null);

    try {
      const result = await invokeRpc<unknown>('filter_rfqs', {
        _filters: { project_id: id },
        _limit: 100,
        _offset: 0,
        _order_by: 'updated_at',
        _direction: 'desc',
      });
      setRfqs(asRows(result));
    } catch (error) {
      console.error('[ProjectRegisters] load RFQs failed', error);
      setRfqError('Unable to load RFQs right now.');
    } finally {
      setLoadingRfqs(false);
    }
  }, [id]);

  useEffect(() => {
    void loadRfqs();
  }, [loadRfqs]);

  const handleRfqChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    setRfqForm((current) => ({ ...current, [name]: value }));
  };

  const createRfq = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!id) return;

    const title = rfqForm.title.trim();
    if (!title) {
      setFormError('RFQ title is required.');
      return;
    }

    setSavingRfq(true);
    setFormError(null);

    try {
      await invokeRpc<unknown>('insert_rfqs', {
        _input: {
          project_id: id,
          rfq_number: nullable(rfqForm.rfq_number),
          title,
          due_date: nullable(rfqForm.due_date),
          description: nullable(rfqForm.description),
          status: 'draft',
        },
      });
      setRfqForm(emptyRfqForm);
      setStatusFilter('all');
      setSearchTerm('');
      await loadRfqs();
    } catch (error) {
      console.error('[ProjectRegisters] create RFQ failed', error);
      setFormError('Unable to create RFQ right now.');
    } finally {
      setSavingRfq(false);
    }
  };

  const filteredRfqs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return rfqs.filter((row, index) => {
      if (statusFilter === 'open' && isClosed(row)) return false;
      if (statusFilter === 'closed' && !isClosed(row)) return false;
      if (!term) return true;

      const haystack = [
        rfqNumber(row, index),
        rfqTitle(row),
        rfqStatus(row),
        asString(row.description),
      ].join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [rfqs, searchTerm, statusFilter]);

  return (
    <Page>
      <PageContainer className="space-y-8">
        <ProjectNav />

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Project registers</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Core Procore-style tracking logs
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                A project register hub for submittals, RFIs, RFQs, purchase orders, subcontracts, invoices, AP invoices, and change orders.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {id && (
                <Link
                  to={`/projects/${id}/controls`}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Open controls
                </Link>
              )}
              {id && (
                <Link
                  to={`/projects/${id}/management`}
                  className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Back to PM workspace
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {registers.map((register) => (
            <div key={register.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                {register.code}
              </div>
              <h2 className="mt-5 text-lg font-semibold text-foreground">{register.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{register.description}</p>
            </div>
          ))}
        </section>

        <form onSubmit={createRfq} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Quick create</p>
            <h2 className="mt-2 text-xl font-bold text-foreground">Create RFQ</h2>
            <p className="mt-1 text-sm text-muted-foreground">Start a quote request for buyout, procurement, vendor pricing, or change pricing.</p>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.5fr_1fr_0.5fr]">
            <label className="block">
              <span className="text-sm font-medium text-foreground">RFQ #</span>
              <input
                name="rfq_number"
                value={rfqForm.rfq_number}
                onChange={handleRfqChange}
                placeholder="RFQ-001"
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">Title</span>
              <input
                name="title"
                value={rfqForm.title}
                onChange={handleRfqChange}
                placeholder="Example: Valve package quote"
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-foreground">Due date</span>
              <input
                type="date"
                name="due_date"
                value={rfqForm.due_date}
                onChange={handleRfqChange}
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-foreground">Description</span>
            <textarea
              name="description"
              value={rfqForm.description}
              onChange={handleRfqChange}
              rows={3}
              placeholder="Scope, alternates, quote instructions, or required backup"
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
            />
          </label>
          {formError && <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>}
          <button
            type="submit"
            disabled={savingRfq}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {savingRfq ? 'Creating RFQ…' : 'Create RFQ'}
          </button>
        </form>

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Live register</p>
                <h2 className="mt-2 text-xl font-bold text-foreground">RFQs</h2>
                <p className="mt-1 text-sm text-muted-foreground">Quote requests loaded from the project RFQ register.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search RFQs"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary sm:w-64"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                >
                  <option value="all">All statuses</option>
                  <option value="open">Open only</option>
                  <option value="closed">Closed only</option>
                </select>
                <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {filteredRfqs.length}/{rfqs.length} shown
                </div>
              </div>
            </div>
          </div>

          {loadingRfqs ? (
            <div className="p-5 text-sm text-muted-foreground">Loading RFQs…</div>
          ) : rfqError ? (
            <div className="p-5 text-sm text-destructive">{rfqError}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">RFQ #</th>
                    <th className="px-5 py-3 font-semibold">Title / description</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Due / updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRfqs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                        No RFQs match this project/filter.
                      </td>
                    </tr>
                  ) : filteredRfqs.map((row, index) => (
                    <tr key={asString(row.id) || `rfq-${index}`} className="transition hover:bg-muted/30">
                      <td className="px-5 py-4 font-semibold text-foreground">{rfqNumber(row, index)}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-foreground">{rfqTitle(row)}</p>
                        {asString(row.description) && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{asString(row.description)}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          {rfqStatus(row)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{formatDate(row.due_date ?? row.updated_at ?? row.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
          <h2 className="font-semibold">Registers live data v1</h2>
          <p className="mt-1 text-sm leading-6">
            RFQs are now the first restored live register with search, status filtering, and quick-create. Next, the same pattern can be extended to invoices or submittals.
          </p>
        </section>
      </PageContainer>
    </Page>
  );
}
