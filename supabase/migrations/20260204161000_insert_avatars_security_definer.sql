-- Allow authenticated avatar inserts via RPC.

CREATE OR REPLACE FUNCTION public.insert_avatars(_input jsonb) RETURNS SETOF public.avatars
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  SET row_security TO 'off'
  AS $$
    DECLARE
      _new_row public.avatars;
    BEGIN
      _input := COALESCE(_input, '{}'::jsonb)
                - 'id' - 'created_at' - 'updated_at' - 'deleted_at';

      IF (_input ? 'id') IS FALSE OR (_input->>'id') IS NULL THEN
        _input := jsonb_set(_input, '{id}', to_jsonb(gen_random_uuid()), true);
      END IF;

      IF (_input ? 'created_at') IS FALSE OR (_input->>'created_at') IS NULL THEN
        _input := jsonb_set(_input, '{created_at}', to_jsonb(now()), true);
      END IF;

      IF (_input ? 'updated_at') IS FALSE OR (_input->>'updated_at') IS NULL THEN
        _input := jsonb_set(_input, '{updated_at}', to_jsonb(now()), true);
      END IF;

      INSERT INTO public.avatars
      SELECT (jsonb_populate_record(NULL::public.avatars, _input)).*
      RETURNING * INTO _new_row;

      RETURN NEXT _new_row;
    END;
    $$;
