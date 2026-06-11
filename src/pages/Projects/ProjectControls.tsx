import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CircleDollarSign,
  Gauge,
  Link2,
} from 'lucide-react';

import { Page, PageContainer } from '@/components/Layout';

export default function ProjectControls(): JSX.Element {
  const { id } = useParams<{ id: string }>();

  const cards = [
    {
      title: 'Budget control',
      description: 'Original budget, committed cost, actual cost, forecast, and variance by project control line.',
      icon: CircleDollarSign,
    },
    {
      title: 'Schedule activities',
      description: 'P6-lite activities, planned dates, actuals, percent complete, critical work, and blockers.',
      icon: CalendarClock,
    },
    {
      title: 'Production feedback',
      description: 'Labor hours, installed quantities, and units per labor hour tied back to project line items.',
      icon: Gauge,
    },
    {
      title: 'Logic ties',
      description: 'Predecessor/successor relationships for future CPM sequencing and blocker analysis.',
      icon: Link2,
    },
  ];

  return (
    <Page>
      <PageContainer className="space-y-8">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Project controls</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Budget, schedule, and production spine
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                This build-safe controls shell keeps the route live while the deeper budget, schedule, logic, and production workflows are reintroduced in smaller deploy-verified patches.
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
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="rounded-xl bg-primary/10 p-3 text-primary w-fit">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-foreground">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
          <div className="flex gap-3">
            <BarChart3 className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <h2 className="font-semibold">Controls route stabilized</h2>
              <p className="mt-1 text-sm leading-6">
                Next, the controls forms and live data widgets should be restored one section at a time after deployment is green.
              </p>
            </div>
          </div>
        </section>
      </PageContainer>
    </Page>
  );
}
