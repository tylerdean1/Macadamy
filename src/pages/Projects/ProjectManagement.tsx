import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  DollarSign,
  FileCheck2,
  FileQuestion,
  FolderKanban,
  PackageCheck,
  ShieldAlert,
  Truck,
} from 'lucide-react';

import { Page, PageContainer } from '@/components/Layout';

interface WorkstreamCard {
  title: string;
  description: string;
  href: string;
  icon: typeof FolderKanban;
  status: string;
}

const workstreams: WorkstreamCard[] = [
  {
    title: 'Controls',
    description: 'High-level action items, schedule risks, decisions, blockers, and responsibility tracking.',
    href: '/schedule-tasks',
    icon: FolderKanban,
    status: 'Action register',
  },
  {
    title: 'Procurement',
    description: 'Purchase orders, vendor follow-ups, release status, lead times, deliveries, and payment blockers.',
    href: '/preconstruction',
    icon: Truck,
    status: 'PO pipeline',
  },
  {
    title: 'Document Control',
    description: 'Submittals, RFIs, drawings, specifications, review cycles, and required backup.',
    href: '/document-management',
    icon: FileQuestion,
    status: 'Review log',
  },
  {
    title: 'Cost',
    description: 'Budgets, commitments, change exposure, pay quantities, invoices, and forecast movement.',
    href: '/financial-management',
    icon: DollarSign,
    status: 'Cost impact',
  },
  {
    title: 'Field Operations',
    description: 'Daily reports, production quantities, inspections, issues, photos, crews, equipment, and weather.',
    href: '/field-operations',
    icon: ClipboardList,
    status: 'Field log',
  },
  {
    title: 'Quality & Safety',
    description: 'Inspections, punch, deficiencies, incidents, corrective actions, and quality reviews.',
    href: '/quality-safety',
    icon: ShieldAlert,
    status: 'Risk log',
  },
  {
    title: 'Closeout',
    description: 'O&Ms, warranties, spare parts, training, testing, as-builts, final docs, and turnover readiness.',
    href: '/document-management',
    icon: PackageCheck,
    status: 'Turnover tracker',
  },
  {
    title: 'Reporting',
    description: 'Weekly summaries, owner updates, executive snapshots, action exports, and meeting prep.',
    href: '/reporting',
    icon: FileCheck2,
    status: 'PM reporting',
  },
];

const starterActions = [
  'Identify project blockers and assign next actions.',
  'Connect PO, submittal, delivery, and invoice readiness into one chain.',
  'Tie field quantities and daily reports back to cost/pay-app support.',
  'Track closeout requirements from the beginning instead of at the end.',
];

export default function ProjectManagement(): JSX.Element {
  const { id } = useParams<{ id: string }>();

  return (
    <Page>
      <PageContainer className="space-y-8">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Project management</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Project command workspace
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                A project-centered workspace for controls, procurement, documents, cost, field operations, quality, safety, reporting, and closeout.
              </p>
            </div>
            {id && (
              <Link
                to={`/projects/${id}`}
                className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Back to project dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {starterActions.map((action) => (
              <div key={action} className="rounded-2xl border border-border bg-muted/30 p-4">
                <CalendarDays className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm leading-6 text-foreground">{action}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workstreams.map((stream) => {
            const Icon = stream.icon;
            return (
              <Link
                key={stream.title}
                to={stream.href}
                className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {stream.status}
                  </span>
                </div>
                <h2 className="mt-5 text-lg font-semibold text-foreground">{stream.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{stream.description}</p>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                  Open workstream
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <h2 className="font-semibold">Backend foundation pending migration review</h2>
              <p className="mt-1 text-sm leading-6">
                The first backend pass is staged as a Supabase migration draft for project management action items. Apply it only after reviewing RLS/RPC grants and regenerating TypeScript/RPC definitions.
              </p>
            </div>
          </div>
        </section>
      </PageContainer>
    </Page>
  );
}
