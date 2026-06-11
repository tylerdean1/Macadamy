-- Project management foundation for Macadamy.
-- Review before applying to production. This migration adds project-centered PM tables
-- without replacing existing procurement, document, RFI, submittal, or cost modules.

create table if not exists public.project_management_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  item_type text not null check (item_type in (
    'procurement',
    'submittal',
    'rfi',
    'change',
    'cost',
    'schedule',
    'field',
    'quality',
    'safety',
    'closeout',
    'document',
    'coordination'
  )),
  status text not null default 'open' check (status in (
    'open',
    'waiting',
    'in_progress',
    'blocked',
    'ready_for_review',
    'complete',
    'closed',
    'cancelled'
  )),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'critical')),
  responsible_profile_id uuid references public.profiles(id) on delete set null,
  responsible_organization_id uuid references public.organizations(id) on delete set null,
  due_date date,
  required_on_site_date date,
  source_table text,
  source_id uuid,
  blocking_reason text,
  next_action text,
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_project_management_items_project_id
  on public.project_management_items(project_id)
  where deleted_at is null;

create index if not exists idx_project_management_items_status_due
  on public.project_management_items(project_id, status, due_date)
  where deleted_at is null;

create index if not exists idx_project_management_items_type_status
  on public.project_management_items(project_id, item_type, status)
  where deleted_at is null;

alter table public.project_management_items enable row level security;

-- Match the existing project-scoped RLS pattern used by project tables.
drop policy if exists p_check_access_select on public.project_management_items;
create policy p_check_access_select on public.project_management_items
  for select using (check_access_bool('select'::text, 'project_management_items'::text, project_id, null::uuid));

drop policy if exists p_check_access_insert on public.project_management_items;
create policy p_check_access_insert on public.project_management_items
  for insert with check (check_access_bool('insert'::text, 'project_management_items'::text, project_id, null::uuid));

drop policy if exists p_check_access_update on public.project_management_items;
create policy p_check_access_update on public.project_management_items
  for update using (check_access_bool('update'::text, 'project_management_items'::text, project_id, null::uuid));

drop policy if exists p_check_access_delete on public.project_management_items;
create policy p_check_access_delete on public.project_management_items
  for delete using (check_access_bool('delete'::text, 'project_management_items'::text, project_id, null::uuid));

create or replace function public.filter_project_management_items(_filters jsonb default '{}'::jsonb, _limit integer default 100, _offset integer default 0)
returns setof public.project_management_items
language sql
security invoker
as $$
  select pmi.*
  from public.project_management_items pmi
  where pmi.deleted_at is null
    and (_filters ? 'project_id' is false or pmi.project_id = (_filters->>'project_id')::uuid)
    and (_filters ? 'item_type' is false or pmi.item_type = _filters->>'item_type')
    and (_filters ? 'status' is false or pmi.status = _filters->>'status')
    and (_filters ? 'priority' is false or pmi.priority = _filters->>'priority')
    and (_filters ? 'responsible_profile_id' is false or pmi.responsible_profile_id = (_filters->>'responsible_profile_id')::uuid)
    and (_filters ? 'responsible_organization_id' is false or pmi.responsible_organization_id = (_filters->>'responsible_organization_id')::uuid)
  order by
    case pmi.priority
      when 'critical' then 1
      when 'high' then 2
      when 'normal' then 3
      else 4
    end,
    pmi.due_date nulls last,
    pmi.created_at desc
  limit greatest(coalesce(_limit, 100), 0)
  offset greatest(coalesce(_offset, 0), 0);
$$;

create or replace function public.insert_project_management_items(_input jsonb)
returns public.project_management_items
language plpgsql
security invoker
as $$
declare
  inserted public.project_management_items;
begin
  insert into public.project_management_items (
    project_id,
    title,
    description,
    item_type,
    status,
    priority,
    responsible_profile_id,
    responsible_organization_id,
    due_date,
    required_on_site_date,
    source_table,
    source_id,
    blocking_reason,
    next_action,
    last_contacted_at,
    next_follow_up_at,
    created_by
  ) values (
    (_input->>'project_id')::uuid,
    _input->>'title',
    _input->>'description',
    coalesce(_input->>'item_type', 'coordination'),
    coalesce(_input->>'status', 'open'),
    coalesce(_input->>'priority', 'normal'),
    nullif(_input->>'responsible_profile_id', '')::uuid,
    nullif(_input->>'responsible_organization_id', '')::uuid,
    nullif(_input->>'due_date', '')::date,
    nullif(_input->>'required_on_site_date', '')::date,
    _input->>'source_table',
    nullif(_input->>'source_id', '')::uuid,
    _input->>'blocking_reason',
    _input->>'next_action',
    nullif(_input->>'last_contacted_at', '')::timestamptz,
    nullif(_input->>'next_follow_up_at', '')::timestamptz,
    auth.uid()
  )
  returning * into inserted;

  return inserted;
end;
$$;

create or replace function public.update_project_management_items(_id uuid, _input jsonb)
returns public.project_management_items
language plpgsql
security invoker
as $$
declare
  updated public.project_management_items;
begin
  update public.project_management_items
  set
    title = coalesce(_input->>'title', title),
    description = case when _input ? 'description' then _input->>'description' else description end,
    item_type = coalesce(_input->>'item_type', item_type),
    status = coalesce(_input->>'status', status),
    priority = coalesce(_input->>'priority', priority),
    responsible_profile_id = case when _input ? 'responsible_profile_id' then nullif(_input->>'responsible_profile_id', '')::uuid else responsible_profile_id end,
    responsible_organization_id = case when _input ? 'responsible_organization_id' then nullif(_input->>'responsible_organization_id', '')::uuid else responsible_organization_id end,
    due_date = case when _input ? 'due_date' then nullif(_input->>'due_date', '')::date else due_date end,
    required_on_site_date = case when _input ? 'required_on_site_date' then nullif(_input->>'required_on_site_date', '')::date else required_on_site_date end,
    blocking_reason = case when _input ? 'blocking_reason' then _input->>'blocking_reason' else blocking_reason end,
    next_action = case when _input ? 'next_action' then _input->>'next_action' else next_action end,
    last_contacted_at = case when _input ? 'last_contacted_at' then nullif(_input->>'last_contacted_at', '')::timestamptz else last_contacted_at end,
    next_follow_up_at = case when _input ? 'next_follow_up_at' then nullif(_input->>'next_follow_up_at', '')::timestamptz else next_follow_up_at end,
    updated_at = now()
  where id = _id
  returning * into updated;

  return updated;
end;
$$;

create or replace function public.delete_project_management_items(_id uuid)
returns public.project_management_items
language plpgsql
security invoker
as $$
declare
  deleted public.project_management_items;
begin
  update public.project_management_items
  set deleted_at = now(), updated_at = now()
  where id = _id
  returning * into deleted;

  return deleted;
end;
$$;
