-- ✅ INSERT equipment
create or replace function insert_equipment(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into equipment (
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


-- ✅ UPDATE equipment
create or replace function update_equipment(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update equipment
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE equipment
create or replace function delete_equipment(_id uuid)
returns void
language sql
as $$
  delete from equipment where id = _id;
$$;


-- ✅ INSERT equipment_assignments
create or replace function insert_equipment_assignments(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into equipment_assignments (
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


-- ✅ UPDATE equipment_assignments
create or replace function update_equipment_assignments(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update equipment_assignments
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE equipment_assignments
create or replace function delete_equipment_assignments(_id uuid)
returns void
language sql
as $$
  delete from equipment_assignments where id = _id;
$$;


-- ✅ INSERT equipment_usage
create or replace function insert_equipment_usage(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into equipment_usage (
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


-- ✅ UPDATE equipment_usage
create or replace function update_equipment_usage(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update equipment_usage
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE equipment_usage
create or replace function delete_equipment_usage(_id uuid)
returns void
language sql
as $$
  delete from equipment_usage where id = _id;
$$;


-- ✅ INSERT crews
create or replace function insert_crews(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into crews (
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


-- ✅ UPDATE crews
create or replace function update_crews(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update crews
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE crews
create or replace function delete_crews(_id uuid)
returns void
language sql
as $$
  delete from crews where id = _id;
$$;
