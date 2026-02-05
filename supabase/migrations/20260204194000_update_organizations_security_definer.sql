-- Allow organization updates via RPC with proper access checks.

CREATE OR REPLACE FUNCTION public.update_organizations(_id uuid, _input jsonb)
RETURNS SETOF public.organizations
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  SET row_security TO 'off'
  AS $$
    DECLARE
      _old_row public.organizations;
      _new_row public.organizations;
      _row     public.organizations := (jsonb_populate_record(NULL::public.organizations, COALESCE(_input, '{}'::jsonb)));
      _caller_role text;
      _caller_org_id uuid;
    BEGIN
      IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
      END IF;

      SELECT role, organization_id INTO _caller_role, _caller_org_id
      FROM public.profiles
      WHERE id = auth.uid();

      IF _caller_role IS NULL THEN
        RAISE EXCEPTION 'Access denied: profile not found for user %', auth.uid();
      END IF;

      SELECT * INTO _old_row FROM public.organizations WHERE id = _id;
      IF _old_row IS NULL THEN
        RAISE EXCEPTION 'row not found' USING DETAIL = jsonb_build_object('id', _id);
      END IF;

      IF _caller_role <> 'system_admin' THEN
        IF _caller_role <> 'org_admin' THEN
          RAISE EXCEPTION 'Access denied: role % cannot update organizations', _caller_role;
        END IF;
        IF _caller_org_id IS NULL OR _caller_org_id <> _old_row.id THEN
          RAISE EXCEPTION 'Access denied: you do not belong to organization %', _old_row.id;
        END IF;
      END IF;

        UPDATE public.organizations
         SET name = CASE WHEN _input ? 'name' THEN _row.name ELSE name END,
           description = CASE WHEN _input ? 'description' THEN _row.description ELSE description END,
           mission_statement = CASE WHEN _input ? 'mission_statement' THEN _row.mission_statement ELSE mission_statement END,
           headquarters = CASE WHEN _input ? 'headquarters' THEN _row.headquarters ELSE headquarters END,
           logo_url = CASE WHEN _input ? 'logo_url' THEN _row.logo_url ELSE logo_url END,
           updated_at = now()
       WHERE id = _id
       RETURNING * INTO _new_row;

      RETURN NEXT _new_row;
    END;
    $$;
