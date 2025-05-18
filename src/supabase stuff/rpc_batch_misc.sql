-- ✅ INSERT crew_members
create or replace function insert_crew_members(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into crew_members (
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


-- ✅ UPDATE crew_members
create or replace function update_crew_members(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update crew_members
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE crew_members
create or replace function delete_crew_members(_id uuid)
returns void
language sql
as $$
  delete from crew_members where id = _id;
$$;


-- ✅ INSERT daily_logs
create or replace function insert_daily_logs(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into daily_logs (
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


-- ✅ UPDATE daily_logs
create or replace function update_daily_logs(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update daily_logs
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE daily_logs
create or replace function delete_daily_logs(_id uuid)
returns void
language sql
as $$
  delete from daily_logs where id = _id;
$$;


-- ✅ INSERT job_titles
create or replace function insert_job_titles(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into job_titles (
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


-- ✅ UPDATE job_titles
create or replace function update_job_titles(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update job_titles
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE job_titles
create or replace function delete_job_titles(_id uuid)
returns void
language sql
as $$
  delete from job_titles where id = _id;
$$;


-- ✅ INSERT issues
create or replace function insert_issues(_data jsonb)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  insert into issues (
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


-- ✅ UPDATE issues
create or replace function update_issues(_id uuid, _data jsonb)
returns void
language plpgsql
as $$
begin
  update issues
  set
    updated_at = now()
  where id = _id;
end;
$$;


-- ✅ DELETE issues
create or replace function delete_issues(_id uuid)
returns void
language sql
as $$
  delete from issues where id = _id;
$$;
