-- Migration to create labor_records table and CRUD RPCs

-- Create table
create table if not exists public.labor_records (
    id uuid primary key default gen_random_uuid(),
    line_item_id uuid references public.line_items(id) on delete cascade,
    worker_count integer not null,
    hours_worked numeric not null,
    work_date date not null,
    work_type text not null,
    notes text,
    created_at timestamp with time zone default now()
);

-- RPC to fetch records for a line item
create or replace function public.get_labor_records(_line_item_id uuid)
returns table(
    id uuid,
    line_item_id uuid,
    worker_count integer,
    hours_worked numeric,
    work_date date,
    work_type text,
    notes text,
    created_at timestamp with time zone
) language sql as $$
  select id, line_item_id, worker_count, hours_worked, work_date,
         work_type, notes, created_at
  from public.labor_records
  where line_item_id = _line_item_id
  order by work_date desc;
$$;

-- RPC to insert a labor record
create or replace function public.insert_labor_record(
    _line_item_id uuid,
    _worker_count integer,
    _hours_worked numeric,
    _work_date date,
    _work_type text,
    _notes text default null
) returns uuid language plpgsql as $$
declare
  new_id uuid;
begin
  insert into public.labor_records (
    id, line_item_id, worker_count, hours_worked, work_date, work_type, notes, created_at
  ) values (
    gen_random_uuid(), _line_item_id, _worker_count, _hours_worked, _work_date, _work_type, _notes, now()
  ) returning id into new_id;
  return new_id;
end;
$$;

-- RPC to update a labor record
create or replace function public.update_labor_record(
    _id uuid,
    _worker_count integer default null,
    _hours_worked numeric default null,
    _work_date date default null,
    _work_type text default null,
    _notes text default null
) returns void language plpgsql as $$
begin
  update public.labor_records set
    worker_count = coalesce(_worker_count, worker_count),
    hours_worked = coalesce(_hours_worked, hours_worked),
    work_date = coalesce(_work_date, work_date),
    work_type = coalesce(_work_type, work_type),
    notes = coalesce(_notes, notes)
  where id = _id;
end;
$$;

-- RPC to delete a labor record
create or replace function public.delete_labor_record(_id uuid)
returns void language plpgsql as $$
begin
  delete from public.labor_records where id = _id;
end;
$$;

