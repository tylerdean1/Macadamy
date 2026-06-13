alter table public.wbs
  add column if not exists code text,
  add column if not exists description text,
  add column if not exists source text;

update public.wbs
set
  code = coalesce(
    nullif(code, ''),
    nullif(substring(name from '^\s*([A-Za-z0-9_.-]+)\s*-\s*'), '')
  ),
  description = coalesce(
    nullif(description, ''),
    nullif(regexp_replace(name, '^\s*[A-Za-z0-9_.-]+\s*-\s*', ''), '')
  ),
  source = coalesce(nullif(source, ''), 'macadamy_seed')
where deleted_at is null;

update public.wbs
set order_num = coalesce(order_num, nullif(regexp_replace(code, '\D', '', 'g'), '')::integer)
where deleted_at is null
  and code is not null;

create unique index if not exists wbs_project_code_active_uidx
  on public.wbs (project_id, lower(code))
  where deleted_at is null and code is not null;

comment on column public.wbs.code is 'Normalized WBS/cost code used for filtering, sorting, and integrations.';
comment on column public.wbs.description is 'Human-readable WBS/cost code description independent of display name.';
comment on column public.wbs.source is 'Source system or import batch for the WBS/cost code row.';
