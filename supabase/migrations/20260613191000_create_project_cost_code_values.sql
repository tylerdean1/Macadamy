create table if not exists public.project_cost_code_values (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  cost_code_id uuid references public.cost_codes(id) on delete set null,
  division_code text not null,
  code text not null,
  description text,
  quantity numeric,
  unit text,
  manhours numeric,
  e_cost numeric,
  i_cost numeric,
  l_cost numeric,
  m_cost numeric,
  o_cost numeric,
  s_cost numeric,
  total_cost numeric,
  phase_combo text,
  phase_number integer,
  phase_description text,
  phase_total numeric,
  source_workbook text not null,
  source_sheet text not null,
  source_row integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.project_cost_code_values enable row level security;

create unique index if not exists project_cost_code_values_project_code_source_uidx
  on public.project_cost_code_values (project_id, code, source_workbook, source_sheet)
  where deleted_at is null;

comment on table public.project_cost_code_values is 'Project-specific cost-code quantities, hours, cost buckets, and total values imported from project control workbooks such as 25254 Master PAD.';
comment on column public.project_cost_code_values.e_cost is 'Equipment cost bucket from source workbook.';
comment on column public.project_cost_code_values.i_cost is 'Indirect cost bucket from source workbook.';
comment on column public.project_cost_code_values.l_cost is 'Labor cost bucket from source workbook.';
comment on column public.project_cost_code_values.m_cost is 'Material cost bucket from source workbook.';
comment on column public.project_cost_code_values.o_cost is 'Other cost bucket from source workbook.';
comment on column public.project_cost_code_values.s_cost is 'Subcontract cost bucket from source workbook.';
