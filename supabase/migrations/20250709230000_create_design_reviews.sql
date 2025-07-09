-- Create design_reviews table and simple CRUD RPCs
create table if not exists public.design_reviews (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references public.projects(id) on delete cascade,
    title text not null,
    status text default 'Open',
    notes text,
    review_date date,
    created_at timestamp with time zone default now(),
    created_by uuid references public.profiles(id)
);

create or replace function public.get_design_reviews(_project_id uuid)
returns setof design_reviews
language sql as $$
  select * from public.design_reviews
  where project_id = _project_id
  order by review_date desc nulls last, created_at desc;
$$;

create or replace function public.insert_design_review(
    _project_id uuid,
    _title text,
    _status text default 'Open',
    _notes text default null,
    _review_date date default null,
    _created_by uuid
) returns uuid language plpgsql as $$
declare
  new_id uuid;
begin
  insert into public.design_reviews (project_id, title, status, notes, review_date, created_by)
  values (_project_id, _title, _status, _notes, _review_date, _created_by)
  returning id into new_id;
  return new_id;
end;
$$;
