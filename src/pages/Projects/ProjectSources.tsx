import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Page, PageContainer } from '@/components/Layout';
import { invokeRpc } from '@/lib/rpc.client';
import ProjectNav from './ProjectNav';

type Row = Record<string, unknown>;

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

function formatBytes(value: unknown): string {
  const bytes = asNumber(value);
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sourceTitle(row: Row): string {
  return asString(row.title) || 'Untitled source';
}

function sourceCategory(row: Row): string {
  return asString(row.category) || 'uncategorized';
}

export default function ProjectSources(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [sources, setSources] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadSources = useCallback(async (): Promise<void> => {
    if (!id) {
      setLoading(false);
      setError('No project ID was provided.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await invokeRpc<unknown>('filter_project_source_documents', {
        _filters: { project_id: id },
        _limit: 500,
        _offset: 0,
        _order_by: 'created_at',
        _direction: 'desc',
      });
      setSources(asRows(result));
    } catch (err) {
      console.error('[ProjectSources] load failed', err);
      setError('Unable to load project source documents right now.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadSources();
  }, [loadSources]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(sources.map(sourceCategory))).filter(Boolean).sort();
    return ['all', ...unique];
  }, [sources]);

  const filteredSources = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return sources.filter((source) => {
      if (categoryFilter !== 'all' && sourceCategory(source) !== categoryFilter) return false;
      if (!term) return true;
      const haystack = [sourceTitle(source), sourceCategory(source), asString(source.folder_path), asString(source.extracted_summary)].join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [categoryFilter, searchTerm, sources]);

  const categoryCounts = useMemo(() => sources.reduce<Record<string, number>>((acc, source) => {
    const category = sourceCategory(source);
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {}), [sources]);

  return (
    <Page>
      <PageContainer className="space-y-8">
        <ProjectNav />

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Project sources</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">25254 SharePoint source index</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Indexed project documents and SharePoint-derived source records tied to this Macadamy project. This is the staging layer for schedule, subcontract, purchase order, closeout, revenue, and execution data imports.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Total sources</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{sources.length}</p>
          </div>
          {Object.entries(categoryCounts).slice(0, 4).map(([category, count]) => (
            <div key={category} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm capitalize text-muted-foreground">{category.replaceAll('_', ' ')}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{count}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Source documents</h2>
                <p className="mt-1 text-sm text-muted-foreground">Search and filter indexed SharePoint project files.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search sources"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary sm:w-64"
                />
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category === 'all' ? 'All categories' : category.replaceAll('_', ' ')}</option>
                  ))}
                </select>
                <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {filteredSources.length}/{sources.length} shown
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-5 text-sm text-muted-foreground">Loading source documents…</div>
          ) : error ? (
            <div className="p-5 text-sm text-destructive">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Title</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Folder</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 text-right font-semibold">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSources.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No source documents found.</td></tr>
                  ) : filteredSources.map((source, index) => (
                    <tr key={asString(source.id) || `source-${index}`} className="transition hover:bg-muted/30">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-foreground">{sourceTitle(source)}</p>
                        {asString(source.extracted_summary) && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{asString(source.extracted_summary)}</p>}
                      </td>
                      <td className="px-5 py-4"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">{sourceCategory(source).replaceAll('_', ' ')}</span></td>
                      <td className="px-5 py-4 text-muted-foreground">{asString(source.folder_path) || '—'}</td>
                      <td className="px-5 py-4 text-muted-foreground">{asString(source.mime_type) || '—'}</td>
                      <td className="px-5 py-4 text-right text-muted-foreground">{formatBytes(source.size_bytes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </PageContainer>
    </Page>
  );
}
