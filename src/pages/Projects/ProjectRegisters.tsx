import { Link, useParams } from 'react-router-dom';

import { Page, PageContainer } from '@/components/Layout';

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

export default function ProjectRegisters(): JSX.Element {
  const { id } = useParams<{ id: string }>();

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
                A build-safe project register hub for submittals, RFIs, RFQs, purchase orders, subcontracts, invoices, AP invoices, and change orders.
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

        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
          <h2 className="font-semibold">Registers route stabilized</h2>
          <p className="mt-1 text-sm leading-6">
            Next, live register data, filters, quick-create workflows, and detail drawers can be restored one module at a time after deployment is green.
          </p>
        </section>
      </PageContainer>
    </Page>
  );
}
