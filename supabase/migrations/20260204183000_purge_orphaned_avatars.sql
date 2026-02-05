-- Purge orphaned non-preset avatars and report active storage paths.

CREATE OR REPLACE FUNCTION public.purge_orphaned_avatars()
RETURNS SETOF public.avatars
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  SET row_security TO 'off'
  AS $$
    BEGIN
      IF COALESCE(auth.role(), '') NOT IN ('service_role', 'supabase_admin') THEN
        RAISE EXCEPTION 'not authorized';
      END IF;

      RETURN QUERY
      DELETE FROM public.avatars AS a
       WHERE a.is_preset = false
         AND NOT EXISTS (
           SELECT 1
             FROM public.profiles AS p
            WHERE p.avatar_id = a.id
              AND p.deleted_at IS NULL
         )
       RETURNING *;
    END;
    $$;

CREATE OR REPLACE FUNCTION public.get_avatar_storage_paths()
RETURNS SETOF text
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  SET row_security TO 'off'
  AS $$
    BEGIN
      IF COALESCE(auth.role(), '') NOT IN ('service_role', 'supabase_admin') THEN
        RAISE EXCEPTION 'not authorized';
      END IF;

      RETURN QUERY
      SELECT regexp_replace(url, '^.*?/storage/v1/object/public/avatars-personal/', '')
        FROM public.avatars
       WHERE deleted_at IS NULL
         AND url LIKE '%/storage/v1/object/public/avatars-personal/%';
    END;
    $$;
