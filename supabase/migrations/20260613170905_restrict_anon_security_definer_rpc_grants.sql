-- Remove inherited anonymous execution from SECURITY DEFINER functions while keeping
-- signed-in and service-role access explicit. A small set of read-only lookup RPCs
-- remains callable by anon because the app uses them for public organization/profile setup flows.

do $$
declare
  target record;
begin
  for target in
    select
      format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)) as function_signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
  loop
    execute format('revoke execute on function %s from PUBLIC', target.function_signature);
    execute format('revoke execute on function %s from anon', target.function_signature);
    execute format('grant execute on function %s to authenticated, service_role', target.function_signature);
  end loop;
end $$;

grant execute on function public.get_organizations_public(text) to anon;
grant execute on function public.get_job_titles_public() to anon;
grant execute on function public.get_avatar_by_id_public(uuid) to anon;
grant execute on function public.get_preset_avatars_public() to anon;
