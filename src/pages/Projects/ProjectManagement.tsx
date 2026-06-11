import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  FileText,
  FolderKanban,
  Gauge,
  Settings,
} from 'lucide-react';

import { Page, PageContainer } from '@/components/Layout';

type WorkspaceCard = {
  title: string;
  description: string;
  href: string;
  icon: typeof FolderKanban;
  label: string;
};

export default function ProjectManagement(): JSX.Element {
  const { id } = useParams<{ id: string }>();

  const projectHref = id ? `/projects/${id}` : '/projects';
  const cards: WorkspaceCard[] = [
    {
      title: 'Project controls',
      description: 'Budget items, forecast variance, P6-lite schedule activities, logic ties, blockers, labor, and production rollups.',
      href: id ? `/projects/${id}/controls` : '/schedule-tasks',
      icon: BarChart3,
      label: 'HeavyBid / P6 spine',
    },
    {
      title: 'Project registers',
      description: 'Submittals, RFIs, RFQs, purchase orders, subcontracts, invoices, AP invoices, and change orders in one project hub.',
      href: id ? `/projects/${id}/registers` : '/document-management',
      icon: FileText,
      label: 'Procore-style logs',
    },
    {
      title: 'Production',
      description: 'Labor hours, installed quantities, worker counts, production rates, and line-item production feedback.',
      href: id ? `/projects/${id}/production` : '/field-operations',
      icon: Gauge,
      label: 'HeavyJob feedback',
    },
    {
      title: 'Daily reports',
      description: 'Daily field reporting, production context, notes, issues, weather, and project recordkeeping.',
      href: '/dailyreports',
      icon: ClipboardList,
      label: 'Field logs',
    },
    {
      title: 'Project dashboard',
      description: 'Return to the main project dashboard for high-level project status and module entry points.',
      href: projectHref,
      icon: FolderKanban,
      label: 'Overview',
    },
    {
      title: 'Settings',
      description: 'Project settings, access, configuration, and administrative controls.',
      href: id ? `/projects/${id}/settings` : '/projects',
      icon: Settings,
      label: 'Admin',
    },
  ];

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
                A stable command center linking the core construction-management workspaces: controls, registers, production, daily reporting, and project administration.
              </p>
            </div>
            <Link
              to={projectHref}
              className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Back to project dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.href}
                className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {card.label}
                  </span>
                </div>
                <h2 className="mt-5 text-lg font-semibold text-foreground">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                  Open workspace
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </section>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
          <h2 className="font-semibold">Build-safe PM workspace</h2>
          <p className="mt-1 text-sm leading-6">
            This page is intentionally lightweight while the deeper Controls, Registers, and Production pages carry the heavier workflows. That keeps deployment risk down while the platform grows.
          </p>
        </section>
      </PageContainer>
    </Page>
  );
}
