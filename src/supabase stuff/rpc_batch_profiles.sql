-- ✅ INSERT profiles
create or replace function insert_profiles(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into profiles (
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


-- ✅ UPDATE profiles
create or replace function update_profiles(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update profiles
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE profiles
create or replace function delete_profiles(_id uuid)
returns void
language sql
as $$
  delete from profiles where id = _id;
$$;


-- ✅ INSERT organizations
create or replace function insert_organizations(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into organizations (
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


-- ✅ UPDATE organizations
create or replace function update_organizations(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update organizations
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE organizations
create or replace function delete_organizations(_id uuid)
returns void
language sql
as $$
  delete from organizations where id = _id;
$$;


-- ✅ INSERT user_contracts
create or replace function insert_user_contracts(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into user_contracts (
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


-- ✅ UPDATE user_contracts
create or replace function update_user_contracts(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update user_contracts
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE user_contracts
create or replace function delete_user_contracts(_id uuid)
returns void
language sql
as $$
  delete from user_contracts where id = _id;
$$;


-- ✅ INSERT avatars
create or replace function insert_avatars(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into avatars (
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


-- ✅ UPDATE avatars
create or replace function update_avatars(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update avatars
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE avatars
create or replace function delete_avatars(_id uuid)
returns void
language sql
as $$
  delete from avatars where id = _id;
$$;
