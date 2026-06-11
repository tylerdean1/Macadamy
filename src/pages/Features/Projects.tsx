import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarClock,
  ClipboardCheck,
  DollarSign,
  FileText,
  PackageCheck,
  ShieldCheck,
  Truck,
} from 'lucide-react';

import { Page, PageContainer } from '@/components/Layout';
import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

type ProjectHealth = 'Active' | 'Preconstruction' | 'Closeout' | 'On hold' | 'Unknown';

interface PmModule {
  title: string;
  description: string;
  icon: typeof ClipboardCheck;
  href: string;
  metricLabel: string;
}

const pmModules: PmModule[] = [
  {
    title: 'Project Controls',
    description: 'Scope, schedule, budget, risks, action items, and overall project health.',
    icon: BarChart3,
    href: '/schedule-tasks',
    metricLabel: 'Controls hub',
  },
  {
    title: 'Procurement',
    description: 'POs, vendors, submittal release status, lead times, deliveries, and payment blockers.',
    icon: Truck,
    href: '/preconstruction',
    metricLabel: 'PO readiness',
  },
  {
    title: 'Document Control',
    description: 'RFIs, submittals, specs, drawings, document references, and review status.',
    icon: FileText,
    href: '/document-management',
    metricLabel: 'Open reviews',
  },
  {
    title: 'Cost Management',
    description: 'Budgets, committed cost, change orders, pay quantities, and invoice backup.',
    icon: DollarSign,
    href: '/financial-management',
    metricLabel: 'Cost exposure',
  },
  {
    title: 'Field Operations',
    description: 'Daily reports, quantities, equipment, inspections, issues, photos, and weather.',
    icon: ClipboardCheck,
    href: '/field-operations',
    metricLabel: 'Field status',
  },
  {
    title: 'Closeout',
    description: 'Punch, O&Ms, warranties, spare parts, testing, training, as-builts, and final docs.',
    icon: PackageCheck,
    href: '/quality-safety',
    metricLabel: 'Closeout readiness',
  },
];

function getProjectHealth(project: ProjectRow): ProjectHealth {
  const status = String(project.status ?? '').toLowerCase();
  if (status.includes('active') || status.includes('progress')) return 'Active';
  if (status.includes('pre')) return 'Preconstruction';
  if (status.includes('close')) return 'Closeout';
  if (status.includes('hold') || status.includes('paused')) return 'On hold';
  return project.status ? 'Unknown' : 'Unknown';
}

function formatCurrency(value: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'No budget set';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return 'Not set';
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Projects(): JSX.Element {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const data = await rpcClient.filter_projects({ _filters: {} });
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('[Projects] fetch projects failed', {
          error: err,
          identifiers: {},
          trigger: 'user',
        });
        setError('Unable to load projects. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const projectStats = useMemo(() => {
    const activeProjects = projects.filter((project) => getProjectHealth(project) === 'Active').length;
    const totalBudget = projects.reduce((sum, project) => sum + (Number(project.budget) || 0), 0);
    const missingDates = projects.filter((project) => !project.start_date || !project.end_date).length;

    return {
      activeProjects,
      totalBudget,
      missingDates,
    };
  }, [projects]);

  return (
    <Page>
      <PageContainer className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Macadamy project management</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Project-centered command center</h1>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Bring scope, cost, schedule, documents, procurement, field operations, and closeout into one project workflow instead of splitting work by job title.
              </p>
            </div>
            <Link
              to="/projects/create"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              Create project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Active projects</p>
              <p className="mt-2 text-3xl font-bold">{projectStats.activeProjects}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Total tracked budget</p>
              <p className="mt-2 text-3xl font-bold">{formatCurrency(projectStats.totalBudget)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Projects missing schedule dates</p>
              <p className="mt-2 text-3xl font-bold">{projectStats.missingDates}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Management modules</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These are the project-management lanes Macadamy should organize around.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pmModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.title}
                  to={module.href}
                  className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {module.metricLabel}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">{module.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.description}</p>
                  <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                    Open module
                    <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Projects</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a project to manage its dashboard, settings, quantities, documents, and field workflows.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                RPC-first data boundary
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-muted-foreground">Loading projects…</div>
          ) : error ? (
            <div className="flex items-start gap-3 p-8 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground">
              No projects found yet. Create a project to start building out the management workflow.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="grid gap-4 p-5 transition hover:bg-muted/40 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.8fr))_auto] lg:items-center"
                >
                  <div>
                    <p className="font-semibold text-foreground">{project.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {project.description || project.location || 'No project description yet.'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{getProjectHealth(project)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Start</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{formatDate(project.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">End</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{formatDate(project.end_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Budget</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{formatCurrency(Number(project.budget) || null)}</p>
                  </div>
                  <div className="flex items-center justify-end text-primary">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </PageContainer>
    </Page>
  );
}
