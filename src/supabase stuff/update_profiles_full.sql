
create or replace function update_profiles(
  _id uuid,
  _data jsonb
)
returns void
language plpgsql
as $$
declare
  new_job_title_id uuid;
  new_avatar_id uuid;
begin
  -- Insert custom job title if title provided and is_custom = true
  if _data ? 'job_title' and (_data->>'is_custom')::boolean is true then
    insert into job_titles (id, title, is_custom, created_by, updated_at, session_id)
    values (
      gen_random_uuid(),
      _data->>'job_title',
      true,
      _data->>'created_by',
      now(),
      _data->>'session_id'
    )
    returning id into new_job_title_id;
  end if;

  -- Insert custom avatar if url is provided and is_preset = false
  if _data ? 'avatar_url' and (_data->>'is_preset')::boolean is false then
    insert into avatars (id, name, url, created_at, is_preset, profile_id, session_id)
    values (
      gen_random_uuid(),
      _data->>'full_name',
      _data->>'avatar_url',
      now(),
      false,
      _id,
      _data->>'session_id'
    )
    returning id into new_avatar_id;
  end if;

  -- Update profile with coalesced fields
  update profiles
  set
    full_name = coalesce(_data->>'full_name', full_name),
    email = coalesce(_data->>'email', email),
    username = coalesce(_data->>'username', username),
    phone = coalesce(_data->>'phone', phone),
    location = coalesce(_data->>'location', location),
    role = coalesce((_data->>'role')::user_role, role),
    job_title_id = coalesce(new_job_title_id, (_data->>'job_title_id')::uuid, job_title_id),
    organization_id = coalesce((_data->>'organization_id')::uuid, organization_id),
    avatar_id = coalesce(new_avatar_id, (_data->>'avatar_id')::uuid, avatar_id),
    session_id = coalesce((_data->>'session_id')::uuid, session_id),
    updated_at = now()
  where id = _id;
end;
$$;
