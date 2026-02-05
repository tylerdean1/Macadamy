-- Update current user's profile without onboarding role restrictions.

CREATE OR REPLACE FUNCTION public.update_my_profile(
  p_full_name text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_job_title_id uuid DEFAULT NULL,
  p_avatar_id uuid DEFAULT NULL,
  p_role public.user_role_type DEFAULT NULL
) RETURNS SETOF public.profiles
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  SET row_security TO 'off'
  AS $$
    DECLARE
      v_profile public.profiles;
    BEGIN
      IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
      END IF;

      SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
      IF v_profile IS NULL THEN
        RAISE EXCEPTION 'profile not found' USING DETAIL = jsonb_build_object('id', auth.uid());
      END IF;

      IF p_role IS NOT NULL AND p_role = 'system_admin' AND v_profile.role <> 'system_admin' THEN
        RAISE EXCEPTION 'system_admin role cannot be assigned via onboarding';
      END IF;

      UPDATE public.profiles
         SET full_name = COALESCE(p_full_name, full_name),
             phone = COALESCE(p_phone, phone),
             job_title_id = COALESCE(p_job_title_id, job_title_id),
             avatar_id = COALESCE(p_avatar_id, avatar_id),
             role = COALESCE(p_role, role),
             updated_at = now()
       WHERE id = v_profile.id
       RETURNING * INTO v_profile;

      RETURN NEXT v_profile;
    END;
    $$;
