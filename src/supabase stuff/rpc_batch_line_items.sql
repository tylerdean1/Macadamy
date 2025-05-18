-- ✅ INSERT line_item_templates
create or replace function insert_line_item_templates(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into line_item_templates (
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


-- ✅ UPDATE line_item_templates
create or replace function update_line_item_templates(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update line_item_templates
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE line_item_templates
create or replace function delete_line_item_templates(_id uuid)
returns void
language sql
as $$
  delete from line_item_templates where id = _id;
$$;


-- ✅ INSERT line_item_entries
create or replace function insert_line_item_entries(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into line_item_entries (
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


-- ✅ UPDATE line_item_entries
create or replace function update_line_item_entries(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update line_item_entries
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE line_item_entries
create or replace function delete_line_item_entries(_id uuid)
returns void
language sql
as $$
  delete from line_item_entries where id = _id;
$$;


-- ✅ INSERT inspections
create or replace function insert_inspections(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into inspections (
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


-- ✅ UPDATE inspections
create or replace function update_inspections(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update inspections
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE inspections
create or replace function delete_inspections(_id uuid)
returns void
language sql
as $$
  delete from inspections where id = _id;
$$;


-- ✅ INSERT change_orders
create or replace function insert_change_orders(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into change_orders (
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


-- ✅ UPDATE change_orders
create or replace function update_change_orders(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update change_orders
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE change_orders
create or replace function delete_change_orders(_id uuid)
returns void
language sql
as $$
  delete from change_orders where id = _id;
$$;
