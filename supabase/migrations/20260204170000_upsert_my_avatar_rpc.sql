-- Upsert current user's avatar and update profile avatar_id.

CREATE OR REPLACE FUNCTION public.upsert_my_avatar(
  p_url text,
  p_is_preset boolean DEFAULT false
) RETURNS SETOF public.avatars
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  SET row_security TO 'off'
  AS $$
    DECLARE
      v_profile public.profiles;
      v_avatar public.avatars;
    BEGIN
      IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
      END IF;

      SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
      IF v_profile IS NULL THEN
        RAISE EXCEPTION 'profile not found' USING DETAIL = jsonb_build_object('id', auth.uid());
      END IF;

      IF v_profile.avatar_id IS NOT NULL THEN
        SELECT * INTO v_avatar FROM public.avatars WHERE id = v_profile.avatar_id;
      END IF;

      IF v_avatar.id IS NOT NULL AND v_avatar.is_preset = false THEN
        UPDATE public.avatars
           SET url = p_url,
           is_preset = false,
               updated_at = now()
         WHERE id = v_avatar.id
         RETURNING * INTO v_avatar;
      ELSE
        INSERT INTO public.avatars (url, is_preset, created_at, updated_at)
        VALUES (p_url, COALESCE(p_is_preset, false), now(), now())
        RETURNING * INTO v_avatar;

        UPDATE public.profiles
           SET avatar_id = v_avatar.id,
               updated_at = now()
         WHERE id = v_profile.id;
      END IF;

      RETURN NEXT v_avatar;
    END;
    $$;
