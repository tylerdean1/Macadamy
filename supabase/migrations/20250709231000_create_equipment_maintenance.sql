-- Create equipment_maintenance table and simple CRUD RPCs
create table if not exists public.equipment_maintenance (
    id uuid primary key default gen_random_uuid(),
    equipment_id uuid references public.equipment(id) on delete cascade,
    description text not null,
    service_date date not null,
    service_provider text,
    notes text,
    created_at timestamp with time zone default now(),
    created_by uuid references public.profiles(id)
);

create or replace function public.get_equipment_maintenance(_equipment_id uuid)
returns setof equipment_maintenance
language sql as $$
  select * from public.equipment_maintenance
  where equipment_id = _equipment_id
  order by service_date desc, created_at desc;
$$;

create or replace function public.insert_equipment_maintenance(
    _equipment_id uuid,
    _description text,
    _service_date date,
    _service_provider text default null,
    _notes text default null,
    _created_by uuid
) returns uuid language plpgsql as $$
declare
  new_id uuid;
begin
  insert into public.equipment_maintenance (
    equipment_id, description, service_date, service_provider, notes, created_by
  ) values (
    _equipment_id, _description, _service_date, _service_provider, _notes, _created_by
  ) returning id into new_id;
  return new_id;
end;
$$;
