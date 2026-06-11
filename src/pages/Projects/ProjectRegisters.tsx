import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  FileCheck2,
  FileQuestion,
  FileText,
  PackageCheck,
  Receipt,
  RefreshCw,
} from 'lucide-react';

import { Page, PageContainer } from '@/components/Layout';

export default function ProjectRegisters(): JSX.Element {
  const { id } = useParams<{ id: string }>();

  const registers = [
    { title: 'Submittals', description: 'Shop drawings, product data, O&Ms, samples, and review cycles.', icon: FileCheck2 },
    { title: 'RFIs', description: 'Questions, clarifications, responses, schedule impacts, and decision logs.', icon: FileQuestion },
    { title: 'RFQs', description: 'Quote requests for buyout, procurement, vendor pricing, and change pricing.', icon: FileText },
    { title: 'Purchase Orders', description: 'POs, commitments, material orders, equipment releases, and delivery risk.', icon: PackageCheck },
    { title: 'Subcontracts', description: 'Subcontract agreements, scope commitments, subcontractor status, and values.', icon: BriefcaseBusiness },
    { title: 'Invoices', description: 'Project invoice records tied to vendors, subcontractors, owners, POs, and documents.', icon: Receipt },
    { title: 'AP Invoices', description: 'Accounts payable exposure, amount due, review status, and payment timing.', icon: Banknote },
    { title: 'Change Orders', description: 'Pending and approved scope, cost exposure, owner pricing, and subcontract pricing.', icon: RefreshCw },
  ];

  return (
    <Page>
      <PageContainer className="space-y-8">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Project registers</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Core Procore-style tracking logs
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                This build-safe register shell keeps the project log route live while full register tables, filters, quick-create forms, and detail drawers are reintroduced in smaller deploy-verified patches.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {id && (
                <Link
                  to={`/projects/${id}/controls`}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Open controls
                  <ArrowRight className="ml-2 h-4 w-4" />
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
          {registers.map((register) => {
            const Icon = register.icon;
            return (
              <div key={register.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="rounded-xl bg-primary/10 p-3 text-primary w-fit">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-foreground">{register.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{register.description}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
          <h2 className="font-semibold">Registers route stabilized</h2>
          <p className="mt-1 text-sm leading-6">
            Next, live register data and quick-create workflows should be restored one module at a time after deployment is green.
          </p>
        </section>
      </PageContainer>
    </Page>
  );
}
