import { type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  ClipboardList,
  FileCheck2,
  FileQuestion,
  FileText,
  PackageCheck,
  PlusCircle,
  Receipt,
  RefreshCw,
  Search,
} from 'lucide-react';

import { Page, PageContainer } from '@/components/Layout';
import { invokeRpc } from '@/lib/rpc.client';

type Row = Record<string, unknown>;
type RegisterKey = 'submittals' | 'rfis' | 'rfqs' | 'purchaseOrders' | 'subcontracts' | 'invoices' | 'apInvoices' | 'changeOrders';

type RegisterConfig = {
  key: RegisterKey;
  label: string;
  description: string;
  rpc: string;
  icon: typeof ClipboardList;
  numberFields: string[];
  titleFields: string[];
  dateFields: string[];
  amountFields: string[];
};

type RegisterState = Record<RegisterKey, Row[]>;

type RfqForm = {
  rfq_number: string;
  title: string;
  description: string;
  due_date: string;
  amount: string;
};

type InvoiceForm = {
  invoice_number: string;
  invoice_type: string;
  description: string;
  invoice_date: string;
  due_date: string;
  amount: string;
};

const registerConfigs: RegisterConfig[] = [
  {
    key: 'submittals',
    label: 'Submittals',
    description: 'Shop drawings, product data, O&Ms, samples, review cycles, and closeout package flow.',
    rpc: 'filter_submittals',
    icon: FileCheck2,
    numberFields: ['submittal_number', 'number', 'code'],
    titleFields: ['title', 'subject', 'name', 'description'],
    dateFields: ['due_date', 'required_date', 'submitted_at', 'updated_at', 'created_at'],
    amountFields: [],
  },
  {
    key: 'rfis',
    label: 'RFIs',
    description: 'Questions, clarifications, responses, schedule impacts, and decision documentation.',
    rpc: 'filter_rfis',
    icon: FileQuestion,
    numberFields: ['rfi_number', 'number', 'code'],
    titleFields: ['subject', 'title', 'question', 'description'],
    dateFields: ['due_date', 'responded_at', 'submitted_at', 'updated_at', 'created_at'],
    amountFields: [],
  },
  {
    key: 'rfqs',
    label: 'RFQs',
    description: 'Vendor/sub quote requests for buyout, change pricing, procurement, and scope comparison.',
    rpc: 'filter_rfqs',
    icon: FileText,
    numberFields: ['rfq_number', 'number', 'code'],
    titleFields: ['title', 'subject', 'description'],
    dateFields: ['due_date', 'sent_at', 'received_at', 'updated_at', 'created_at'],
    amountFields: ['amount'],
  },
  {
    key: 'purchaseOrders',
    label: 'Purchase Orders',
    description: 'POs, vendor commitments, material/equipment orders, release tracking, and delivery risk.',
    rpc: 'filter_purchase_orders',
    icon: PackageCheck,
    numberFields: ['po_number', 'purchase_order_number', 'order_number', 'number'],
    titleFields: ['title', 'name', 'description'],
    dateFields: ['due_date', 'required_on_site_date', 'delivery_date', 'updated_at', 'created_at'],
    amountFields: ['amount', 'total_amount', 'committed_amount'],
  },
  {
    key: 'subcontracts',
    label: 'Subcontracts',
    description: 'Subcontract agreements, scope commitments, subcontractor status, and contract value tracking.',
    rpc: 'filter_subcontracts',
    icon: BriefcaseBusiness,
    numberFields: ['subcontract_number', 'contract_number', 'number'],
    titleFields: ['title', 'name', 'scope', 'description'],
    dateFields: ['due_date', 'start_date', 'end_date', 'updated_at', 'created_at'],
    amountFields: ['amount', 'contract_amount', 'total_amount'],
  },
  {
    key: 'invoices',
    label: 'Invoices',
    description: 'Vendor, subcontractor, owner, AP/AR, and other project invoice records.',
    rpc: 'filter_invoices',
    icon: Receipt,
    numberFields: ['invoice_number', 'number'],
    titleFields: ['description', 'title', 'name'],
    dateFields: ['due_date', 'invoice_date', 'updated_at', 'created_at'],
    amountFields: ['amount', 'amount_due', 'total_amount'],
  },
  {
    key: 'apInvoices',
    label: 'AP Invoices',
    description: 'Accounts payable invoice exposure, review status, due dates, and amount due.',
    rpc: 'filter_accounts_payable',
    icon: Banknote,
    numberFields: ['invoice_number', 'ap_number', 'number'],
    titleFields: ['description', 'title', 'vendor_name', 'name'],
    dateFields: ['due_date', 'invoice_date', 'updated_at', 'created_at'],
    amountFields: ['amount_due', 'amount', 'total_amount'],
  },
  {
    key: 'changeOrders',
    label: 'Change Orders',
    description: 'Pending and approved change movement, cost exposure, scope changes, and owner/sub pricing.',
    rpc: 'filter_change_orders',
    icon: RefreshCw,
    numberFields: ['change_order_number', 'co_number', 'number'],
    titleFields: ['title', 'description', 'scope'],
    dateFields: ['due_date', 'approved_at', 'submitted_at', 'updated_at', 'created_at'],
    amountFields: ['amount', 'approved_amount', 'proposed_amount'],
  },
];

const emptyRegisters: RegisterState = {
  submittals: [],
  rfis: [],
  rfqs: [],
  purchaseOrders: [],
  subcontracts: [],
  invoices: [],
  apInvoices: [],
  changeOrders: [],
};

const initialRfqForm: RfqForm = {
  rfq_number: '',
  title: '',
  description: '',
  due_date: '',
  amount: '',
};

const initialInvoiceForm: InvoiceForm = {
  invoice_number: '',
  invoice_type: 'vendor',
  description: '',
  invoice_date: '',
  due_date: '',
  amount: '',
};

const doneWords = ['approved', 'closed', 'complete', 'completed', 'done', 'resolved', 'void', 'cancelled', 'canceled', 'paid', 'awarded'];
const attentionWords = ['open', 'pending', 'blocked', 'overdue', 'late', 'rejected', 'revise', 'resubmit', 'draft', 'waiting', 'under_review', 'received'];
const invoiceTypes = ['vendor', 'subcontractor', 'owner', 'ap', 'ar', 'other'];

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

function firstValue(row: Row, fields: string[]): string {
  for (const field of fields) {
    const value = asString(row[field]);
    if (value) return value;
  }
  return '';
}

function statusFor(row: Row): string {
  return asString(row.status) || asString(row.workflow_status) || asString(row.review_status) || 'open';
}

function isOpen(row: Row): boolean {
  const status = statusFor(row).toLowerCase();
  return !doneWords.some((word) => status.includes(word));
}

function needsAttention(row: Row): boolean {
  const status = statusFor(row).toLowerCase();
  if (attentionWords.some((word) => status.includes(word))) return true;

  const dueRaw = row.due_date ?? row.required_on_site_date ?? row.next_follow_up_at;
  const dueDate = typeof dueRaw === 'string' ? new Date(dueRaw) : null;
  return Boolean(dueDate && !Number.isNaN(dueDate.getTime()) && dueDate.getTime() <= Date.now());
}

function formatDate(value: string): string {
  if (!value) return 'No date';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(asNumber(value));
}

function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

async function loadRegister(functionName: string, projectId: string): Promise<Row[]> {
  try {
    const result = await invokeRpc<unknown>(functionName, {
      _filters: { project_id: projectId },
      _limit: 500,
      _offset: 0,
      _order_by: 'updated_at',
      _direction: 'desc',
    });
    return asRows(result);
  } catch (error) {
    console.warn(`[ProjectRegisters] ${functionName} failed`, error);
    return [];
  }
}

export default function ProjectRegisters(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [registers, setRegisters] = useState<RegisterState>(emptyRegisters);
  const [activeKey, setActiveKey] = useState<RegisterKey>('submittals');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'attention'>('all');
  const [loading, setLoading] = useState(true);
  const [savingRfq, setSavingRfq] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [rfqForm, setRfqForm] = useState<RfqForm>(initialRfqForm);
  const [invoiceForm, setInvoiceForm] = useState<InvoiceForm>(initialInvoiceForm);

  const loadRegisters = useCallback(async (): Promise<void> => {
    if (!id) {
      setError('No project ID was provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(registerConfigs.map((config) => loadRegister(config.rpc, id)));
      setRegisters(registerConfigs.reduce((acc, config, index) => ({ ...acc, [config.key]: results[index] ?? [] }), emptyRegisters));
    } catch (err) {
      console.error('[ProjectRegisters] load failed', err);
      setError('Unable to load project registers.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadRegisters();
  }, [loadRegisters]);

  const handleRfqChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    setRfqForm((current) => ({ ...current, [name]: value }));
  };

  const handleInvoiceChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    setInvoiceForm((current) => ({ ...current, [name]: value }));
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
          description: nullable(rfqForm.description),
          status: 'draft',
          due_date: nullable(rfqForm.due_date),
          amount: nullable(rfqForm.amount),
        },
      });
      setRfqForm(initialRfqForm);
      setActiveKey('rfqs');
      await loadRegisters();
    } catch (err) {
      console.error('[ProjectRegisters] create RFQ failed', err);
      setFormError('Unable to create RFQ.');
    } finally {
      setSavingRfq(false);
    }
  };

  const createInvoice = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!id) return;

    const description = invoiceForm.description.trim();
    if (!description) {
      setFormError('Invoice description is required.');
      return;
    }

    setSavingInvoice(true);
    setFormError(null);

    try {
      await invokeRpc<unknown>('insert_invoices', {
        _input: {
          project_id: id,
          invoice_number: nullable(invoiceForm.invoice_number),
          invoice_type: invoiceForm.invoice_type,
          description,
          status: 'received',
          invoice_date: nullable(invoiceForm.invoice_date),
          due_date: nullable(invoiceForm.due_date),
          amount: nullable(invoiceForm.amount),
        },
      });
      setInvoiceForm(initialInvoiceForm);
      setActiveKey('invoices');
      await loadRegisters();
    } catch (err) {
      console.error('[ProjectRegisters] create invoice failed', err);
      setFormError('Unable to create invoice.');
    } finally {
      setSavingInvoice(false);
    }
  };

  const activeConfig = registerConfigs.find((config) => config.key === activeKey) ?? registerConfigs[0];
  const activeRows = registers[activeConfig.key] ?? [];
  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return activeRows.filter((row) => {
      if (statusFilter === 'open' && !isOpen(row)) return false;
      if (statusFilter === 'attention' && !needsAttention(row)) return false;
      if (!term) return true;

      const haystack = [
        firstValue(row, activeConfig.numberFields),
        firstValue(row, activeConfig.titleFields),
        statusFor(row),
        asString(row.description),
      ].join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [activeConfig, activeRows, searchTerm, statusFilter]);

  const totalItems = registerConfigs.reduce((sum, config) => sum + (registers[config.key]?.length ?? 0), 0);
  const openItems = registerConfigs.reduce((sum, config) => sum + (registers[config.key]?.filter(isOpen).length ?? 0), 0);
  const attentionItems = registerConfigs.reduce((sum, config) => sum + (registers[config.key]?.filter(needsAttention).length ?? 0), 0);
  const costExposure = [...registers.purchaseOrders, ...registers.subcontracts, ...registers.invoices, ...registers.apInvoices, ...registers.changeOrders]
    .reduce((sum, row) => {
      const config = registerConfigs.find((item) => registers[item.key]?.includes(row));
      const fieldValue = config ? firstValue(row, config.amountFields) : '';
      return sum + asNumber(fieldValue);
    }, 0);

  const summaryCards = [
    { label: 'Register items', value: String(totalItems), helper: 'Across document, procurement, cost, and contract logs' },
    { label: 'Open items', value: String(openItems), helper: 'Not closed, complete, void, paid, or awarded' },
    { label: 'Need attention', value: String(attentionItems), helper: 'Open, pending, received, due, blocked, rejected, or waiting' },
    { label: 'Cost exposure', value: formatCurrency(costExposure), helper: 'PO/subcontract/invoice/AP/change amount rollup' },
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
                One project-level register hub for submittals, RFIs, RFQs, purchase orders, subcontracts, invoices, AP invoices, and change orders.
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

          {loading && (
            <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
              Loading project registers…
            </div>
          )}

          {error && (
            <div className="mt-6 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {!loading && !error && (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{card.helper}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <form onSubmit={createRfq} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                  <PlusCircle className="h-4 w-4" />
                  Quick create RFQ
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Start a vendor/sub quote request for buyout, procurement, or change pricing.
                </p>
                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-[0.45fr_1fr]">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">RFQ #</span>
                      <input name="rfq_number" value={rfqForm.rfq_number} onChange={handleRfqChange} placeholder="RFQ-001" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Title</span>
                      <input name="title" value={rfqForm.title} onChange={handleRfqChange} placeholder="Example: Valve package quote" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary" />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Due date</span>
                      <input type="date" name="due_date" value={rfqForm.due_date} onChange={handleRfqChange} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Amount</span>
                      <input name="amount" value={rfqForm.amount} onChange={handleRfqChange} inputMode="decimal" placeholder="Optional" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-sm font-medium text-foreground">Description</span>
                    <textarea name="description" value={rfqForm.description} onChange={handleRfqChange} rows={3} placeholder="Scope, alternates, quote instructions, or required backup" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary" />
                  </label>
                </div>
                <button type="submit" disabled={savingRfq} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                  {savingRfq ? 'Saving RFQ…' : 'Create RFQ'}
                </button>
              </form>

              <form onSubmit={createInvoice} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                  <PlusCircle className="h-4 w-4" />
                  Quick create invoice
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Add a project invoice record that can later connect to vendor/sub/owner, PO, subcontract, document, and AP workflows.
                </p>
                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-[0.45fr_1fr]">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Invoice #</span>
                      <input name="invoice_number" value={invoiceForm.invoice_number} onChange={handleInvoiceChange} placeholder="INV-001" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Type</span>
                      <select name="invoice_type" value={invoiceForm.invoice_type} onChange={handleInvoiceChange} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary">
                        {invoiceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-sm font-medium text-foreground">Description</span>
                    <input name="description" value={invoiceForm.description} onChange={handleInvoiceChange} placeholder="Example: Pump package progress invoice" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary" />
                  </label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Invoice date</span>
                      <input type="date" name="invoice_date" value={invoiceForm.invoice_date} onChange={handleInvoiceChange} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Due date</span>
                      <input type="date" name="due_date" value={invoiceForm.due_date} onChange={handleInvoiceChange} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">Amount</span>
                      <input name="amount" value={invoiceForm.amount} onChange={handleInvoiceChange} inputMode="decimal" placeholder="0" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary" />
                    </label>
                  </div>
                </div>
                <button type="submit" disabled={savingInvoice} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                  {savingInvoice ? 'Saving invoice…' : 'Create invoice'}
                </button>
              </form>
            </section>

            {formError && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {formError}
              </div>
            )}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {registerConfigs.map((config) => {
                const Icon = config.icon;
                const rows = registers[config.key] ?? [];
                const isActive = activeKey === config.key;
                return (
                  <button
                    key={config.key}
                    type="button"
                    onClick={() => setActiveKey(config.key)}
                    className={`rounded-2xl border p-5 text-left shadow-sm transition ${isActive ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted/40'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-xl bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{rows.length}</span>
                    </div>
                    <h2 className="mt-4 font-semibold text-foreground">{config.label}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{config.description}</p>
                    <p className="mt-3 text-xs text-muted-foreground">{rows.filter(isOpen).length} open • {rows.filter(needsAttention).length} attention</p>
                  </button>
                );
              })}
            </section>

            <section className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{activeConfig.label} register</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{activeConfig.description}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search register" className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary sm:w-64" />
                    </div>
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'open' | 'attention')} className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary">
                      <option value="all">All items</option>
                      <option value="open">Open only</option>
                      <option value="attention">Needs attention</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Number</th>
                      <th className="px-5 py-3 font-semibold">Title / description</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Date</th>
                      <th className="px-5 py-3 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRows.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No {activeConfig.label.toLowerCase()} found for this project/filter.</td></tr>
                    ) : filteredRows.map((row, index) => {
                      const number = firstValue(row, activeConfig.numberFields) || `#${index + 1}`;
                      const title = firstValue(row, activeConfig.titleFields) || 'Untitled item';
                      const date = firstValue(row, activeConfig.dateFields);
                      const amount = firstValue(row, activeConfig.amountFields);
                      return (
                        <tr key={asString(row.id) || `${activeConfig.key}-${index}`} className="transition hover:bg-muted/30">
                          <td className="px-5 py-4 font-medium text-foreground">{number}</td>
                          <td className="px-5 py-4"><p className="font-semibold text-foreground">{title}</p>{asString(row.description) && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{asString(row.description)}</p>}</td>
                          <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${needsAttention(row) ? 'bg-amber-100 text-amber-800' : isOpen(row) ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>{statusFor(row)}</span></td>
                          <td className="px-5 py-4 text-muted-foreground">{formatDate(date)}</td>
                          <td className="px-5 py-4 text-right font-semibold text-foreground">{amount ? formatCurrency(amount) : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </PageContainer>
    </Page>
  );
}
