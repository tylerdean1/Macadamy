-- Update current user's organization details without requiring full payload.

CREATE OR REPLACE FUNCTION public.update_my_organization(_input jsonb)
RETURNS SETOF public.organizations
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  SET row_security TO 'off'
  AS $$
    DECLARE
      v_profile public.profiles;
      v_org public.organizations;
      v_row public.organizations := (jsonb_populate_record(NULL::public.organizations, COALESCE(_input, '{}'::jsonb)));
    BEGIN
      IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
      END IF;

      SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
      IF v_profile IS NULL THEN
        RAISE EXCEPTION 'profile not found' USING DETAIL = jsonb_build_object('id', auth.uid());
      END IF;

      IF v_profile.role IS DISTINCT FROM 'system_admin' AND v_profile.role IS DISTINCT FROM 'org_admin' AND v_profile.role IS DISTINCT FROM 'org_supervisor' THEN
        RAISE EXCEPTION 'Access denied: role % cannot update organizations', v_profile.role;
      END IF;

      IF v_profile.organization_id IS NULL THEN
        RAISE EXCEPTION 'organization not found for user %', auth.uid();
      END IF;

      SELECT * INTO v_org FROM public.organizations WHERE id = v_profile.organization_id;
      IF v_org IS NULL THEN
        RAISE EXCEPTION 'organization not found' USING DETAIL = jsonb_build_object('id', v_profile.organization_id);
      END IF;

      UPDATE public.organizations
         SET name = CASE WHEN _input ? 'name' THEN v_row.name ELSE name END,
             description = CASE WHEN _input ? 'description' THEN v_row.description ELSE description END,
             mission_statement = CASE WHEN _input ? 'mission_statement' THEN v_row.mission_statement ELSE mission_statement END,
             headquarters = CASE WHEN _input ? 'headquarters' THEN v_row.headquarters ELSE headquarters END,
             logo_url = CASE WHEN _input ? 'logo_url' THEN v_row.logo_url ELSE logo_url END,
             updated_at = now()
       WHERE id = v_profile.organization_id
       RETURNING * INTO v_org;

      RETURN NEXT v_org;
    END;
    $$;
