import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Page, PageContainer } from '@/components/Layout';
import { invokeRpc } from '@/lib/rpc.client';
import ProjectNav from './ProjectNav';

type Row = Record<string, unknown>;

type RegisterConfig = {
  title: string;
  code: string;
  description: string;
};

const registers: RegisterConfig[] = [
  { title: 'Submittals', code: 'SUB', description: 'Shop drawings, product data, O&Ms, samples, and review cycles.' },
  { title: 'RFIs', code: 'RFI', description: 'Questions, clarifications, responses, schedule impacts, and decision logs.' },
  { title: 'RFQs', code: 'RFQ', description: 'Quote requests for buyout, procurement, vendor pricing, and change pricing.' },
  { title: 'Purchase Orders', code: 'PO', description: 'POs, commitments, material orders, equipment releases, and delivery risk.' },
  { title: 'Subcontracts', code: 'SUBC', description: 'Subcontract agreements, scope commitments, subcontractor status, and values.' },
  { title: 'Invoices', code: 'INV', description: 'Project invoice records tied to vendors, subcontractors, owners, POs, and documents.' },
  { title: 'AP Invoices', code: 'AP', description: 'Accounts payable exposure, amount due, review status, and payment timing.' },
  { title: 'Source Index', code: 'SRC', description: 'SharePoint-derived source documents staged for structured project import.' },
];

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

function firstValue(row: Row, fields: string[], fallback: string): string {
  for (const field of fields) {
    const value = asString(row[field]);
    if (value) return value;
  }
  return fallback;
}

function formatDate(value: unknown): string {
  const raw = asString(value);
  if (!raw) return 'No date';
  const date = new Date(raw.length === 10 ? `${raw}T00:00:00` : raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatBytes(value: unknown): string {
  const bytes = asNumber(value);
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function rowTitle(row: Row): string {
  return firstValue(row, ['title', 'subject', 'name', 'description'], 'Untitled');
}

function rowNumber(row: Row, index: number, prefix: string): string {
  return firstValue(row, ['rfq_number', 'submittal_number', 'number', 'code'], `${prefix}-${index + 1}`);
}

function rowStatus(row: Row): string {
  return firstValue(row, ['status', 'workflow_status', 'review_status', 'import_status'], 'open');
}

export default function ProjectRegisters(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [rfqs, setRfqs] = useState<Row[]>([]);
  const [submittals, setSubmittals] = useState<Row[]>([]);
  const [sources, setSources] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceCategory, setSourceCategory] = useState('all');

  const loadRegisters = useCallback(async (): Promise<void> => {
    if (!id) {
      setError('No project ID was provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [rfqResult, submittalResult, sourceResult] = await Promise.allSettled([
        invokeRpc<unknown>('filter_rfqs', {
          _filters: { project_id: id },
          _limit: 100,
          _offset: 0,
          _order_by: 'updated_at',
          _direction: 'desc',
        }),
        invokeRpc<unknown>('filter_submittals', {
          _filters: { project_id: id },
          _limit: 100,
          _offset: 0,
          _order_by: 'updated_at',
          _direction: 'desc',
        }),
        invokeRpc<unknown>('filter_project_source_documents', {
          _filters: { project_id: id },
          _limit: 500,
          _offset: 0,
          _order_by: 'created_at',
          _direction: 'desc',
        }),
      ]);

      if (rfqResult.status === 'fulfilled') setRfqs(asRows(rfqResult.value));
      if (submittalResult.status === 'fulfilled') setSubmittals(asRows(submittalResult.value));
      if (sourceResult.status === 'fulfilled') setSources(asRows(sourceResult.value));

      if (rfqResult.status === 'rejected' || submittalResult.status === 'rejected' || sourceResult.status === 'rejected') {
        setError('Some registers could not be loaded. Showing the records that are available.');
      }
    } catch (err) {
      console.error('[ProjectRegisters] load failed', err);
      setError('Unable to load project registers right now.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadRegisters();
  }, [loadRegisters]);

  const sourceCategories = useMemo(() => ['all', ...Array.from(new Set(sources.map((row) => asString(row.category) || 'uncategorized'))).sort()], [sources]);

  const filteredSources = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return sources.filter((row) => {
      const category = asString(row.category) || 'uncategorized';
      if (sourceCategory !== 'all' && category !== sourceCategory) return false;
      if (!term) return true;
      const haystack = [rowTitle(row), category, asString(row.folder_path), asString(row.extracted_summary)].join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [searchTerm, sourceCategory, sources]);

  const sourceCounts = useMemo(() => sources.reduce<Record<string, number>>((acc, row) => {
    const category = asString(row.category) || 'uncategorized';
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {}), [sources]);

  return (
    <Page>
      <PageContainer className="space-y-8">
        <ProjectNav />

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Project registers</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Core project tracking logs</h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                RFQs, submittals, and the SharePoint source index are live for this project. The source index is the staging layer for turning 25254 SharePoint files into structured Macadamy records.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {id && <Link to={`/projects/${id}/controls`} className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">Open controls</Link>}
              {id && <Link to={`/projects/${id}/production`} className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted">Open production</Link>}
            </div>
          </div>
          {loading && <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">Loading project registers…</div>}
          {error && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">{error}</div>}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {registers.map((register) => (
            <div key={register.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">{register.code}</div>
              <h2 className="mt-5 text-lg font-semibold text-foreground">{register.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{register.description}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm text-muted-foreground">RFQs</p><p className="mt-2 text-3xl font-bold text-foreground">{rfqs.length}</p></div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm text-muted-foreground">Submittals</p><p className="mt-2 text-3xl font-bold text-foreground">{submittals.length}</p></div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm text-muted-foreground">Source docs</p><p className="mt-2 text-3xl font-bold text-foreground">{sources.length}</p></div>
          {Object.entries(sourceCounts).slice(0, 2).map(([category, count]) => (
            <div key={category} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm capitalize text-muted-foreground">{category.replaceAll('_', ' ')}</p><p className="mt-2 text-3xl font-bold text-foreground">{count}</p></div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5"><h2 className="text-xl font-bold text-foreground">RFQs</h2><p className="mt-1 text-sm text-muted-foreground">Quote requests tied to this project.</p></div>
          <RegisterTable rows={rfqs} prefix="RFQ" emptyText="No RFQs found for this project yet." />
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5"><h2 className="text-xl font-bold text-foreground">Submittals</h2><p className="mt-1 text-sm text-muted-foreground">Submittals tied to this project.</p></div>
          <RegisterTable rows={submittals} prefix="SUB" emptyText="No submittals found for this project yet." />
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">SharePoint import staging</p>
                <h2 className="mt-2 text-xl font-bold text-foreground">Project source index</h2>
                <p className="mt-1 text-sm text-muted-foreground">Indexed 25254 files staged for schedule, subcontract, PO, closeout, and revenue imports.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search source docs" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary sm:w-64" />
                <select value={sourceCategory} onChange={(event) => setSourceCategory(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary">
                  {sourceCategories.map((category) => <option key={category} value={category}>{category === 'all' ? 'All categories' : category.replaceAll('_', ' ')}</option>)}
                </select>
                <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{filteredSources.length}/{sources.length} shown</div>
              </div>
            </div>
          </div>
          <SourceTable rows={filteredSources} />
        </section>
      </PageContainer>
    </Page>
  );
}

function RegisterTable({ rows, prefix, emptyText }: { rows: Row[]; prefix: string; emptyText: string }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr><th className="px-5 py-3 font-semibold">Number</th><th className="px-5 py-3 font-semibold">Title / description</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Due / updated</th></tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">{emptyText}</td></tr> : rows.map((row, index) => (
            <tr key={asString(row.id) || `${prefix}-${index}`} className="transition hover:bg-muted/30">
              <td className="px-5 py-4 font-semibold text-foreground">{rowNumber(row, index, prefix)}</td>
              <td className="px-5 py-4"><p className="font-semibold text-foreground">{rowTitle(row)}</p>{asString(row.description) && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{asString(row.description)}</p>}</td>
              <td className="px-5 py-4"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{rowStatus(row)}</span></td>
              <td className="px-5 py-4 text-muted-foreground">{formatDate(row.due_date ?? row.updated_at ?? row.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SourceTable({ rows }: { rows: Row[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr><th className="px-5 py-3 font-semibold">Title</th><th className="px-5 py-3 font-semibold">Category</th><th className="px-5 py-3 font-semibold">Folder</th><th className="px-5 py-3 font-semibold">Type</th><th className="px-5 py-3 text-right font-semibold">Size</th></tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No source documents found.</td></tr> : rows.map((row, index) => (
            <tr key={asString(row.id) || `source-${index}`} className="transition hover:bg-muted/30">
              <td className="px-5 py-4"><p className="font-semibold text-foreground">{rowTitle(row)}</p>{asString(row.extracted_summary) && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{asString(row.extracted_summary)}</p>}</td>
              <td className="px-5 py-4"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">{(asString(row.category) || 'uncategorized').replaceAll('_', ' ')}</span></td>
              <td className="px-5 py-4 text-muted-foreground">{asString(row.folder_path) || '—'}</td>
              <td className="px-5 py-4 text-muted-foreground">{asString(row.mime_type) || '—'}</td>
              <td className="px-5 py-4 text-right text-muted-foreground">{formatBytes(row.size_bytes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
