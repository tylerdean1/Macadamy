-- Migration: Update complete_my_profile to accept and set organization_id
-- Date: 2026-02-10

-- 1. Drop the old function if it exists
DROP FUNCTION IF EXISTS public.complete_my_profile(text, text, uuid, uuid, public.user_role_type);

-- 2. Create the new function with organization_id
CREATE FUNCTION public.complete_my_profile(
    p_full_name text,
    p_phone text,
    p_job_title_id uuid,
    p_avatar_id uuid,
    p_role public.user_role_type,
    p_organization_id uuid
) RETURNS public.profiles
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
declare
  v_user_id uuid;
  v_profile public.profiles;
  v_role public.user_role_type;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_role := p_role;
  if v_role = 'system_admin' then
    raise exception 'system_admin role cannot be assigned via onboarding';
  end if;

  update public.profiles
  set
    full_name = nullif(btrim(p_full_name), ''),
    phone = nullif(btrim(p_phone), ''),
    job_title_id = p_job_title_id,
    avatar_id = p_avatar_id,
    role = case when v_role is not null then v_role else role end,
    organization_id = p_organization_id,
    profile_completed_at = coalesce(profile_completed_at, now()),
    updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  return v_profile;
end;
$$;
