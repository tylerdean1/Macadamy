-- ✅ INSERT asphalt_types
create or replace function insert_asphalt_types(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into asphalt_types (
    id, created_at, updated_at, created_by
  )
  select
    coalesce((_data->>'id')::uuid, gen_random_uuid()),
    now(),
    now(),
    _data->>'created_by'
  returning id into new_id;

  return new_id;
end;
$$;


-- ✅ UPDATE asphalt_types
create or replace function update_asphalt_types(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update asphalt_types
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE asphalt_types
create or replace function delete_asphalt_types(_id uuid)
returns void
language sql
as $$
  delete from asphalt_types where id = _id;
$$;


-- ✅ INSERT dump_trucks
create or replace function insert_dump_trucks(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into dump_trucks (
    id, created_at, updated_at, created_by
  )
  select
    coalesce((_data->>'id')::uuid, gen_random_uuid()),
    now(),
    now(),
    _data->>'created_by'
  returning id into new_id;

  return new_id;
end;
$$;


-- ✅ UPDATE dump_trucks
create or replace function update_dump_trucks(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update dump_trucks
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE dump_trucks
create or replace function delete_dump_trucks(_id uuid)
returns void
language sql
as $$
  delete from dump_trucks where id = _id;
$$;


-- ✅ INSERT tack_rates
create or replace function insert_tack_rates(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into tack_rates (
    id, created_at, updated_at, created_by
  )
  select
    coalesce((_data->>'id')::uuid, gen_random_uuid()),
    now(),
    now(),
    _data->>'created_by'
  returning id into new_id;

  return new_id;
end;
$$;


-- ✅ UPDATE tack_rates
create or replace function update_tack_rates(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update tack_rates
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE tack_rates
create or replace function delete_tack_rates(_id uuid)
returns void
language sql
as $$
  delete from tack_rates where id = _id;
$$;
