-- ✅ INSERT contracts
create or replace function insert_contracts(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into contracts (
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


-- ✅ UPDATE contracts
create or replace function update_contracts(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update contracts
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE contracts
create or replace function delete_contracts(_id uuid)
returns void
language sql
as $$
  delete from contracts where id = _id;
$$;


-- ✅ INSERT wbs
create or replace function insert_wbs(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into wbs (
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


-- ✅ UPDATE wbs
create or replace function update_wbs(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update wbs
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE wbs
create or replace function delete_wbs(_id uuid)
returns void
language sql
as $$
  delete from wbs where id = _id;
$$;


-- ✅ INSERT maps
create or replace function insert_maps(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into maps (
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


-- ✅ UPDATE maps
create or replace function update_maps(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update maps
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE maps
create or replace function delete_maps(_id uuid)
returns void
language sql
as $$
  delete from maps where id = _id;
$$;


-- ✅ INSERT line_items
create or replace function insert_line_items(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into line_items (
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


-- ✅ UPDATE line_items
create or replace function update_line_items(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update line_items
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE line_items
create or replace function delete_line_items(_id uuid)
returns void
language sql
as $$
  delete from line_items where id = _id;
$$;
