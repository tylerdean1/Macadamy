-- Keep internal maintenance and trigger-only SECURITY DEFINER helpers out of direct
-- client RPC reach. The prior grant hardening preserves authenticated access for
-- app-facing security-definer RPCs; this follow-up narrows helpers that should be
-- invoked only by service-role operations or database triggers.

do $$
declare
  target record;
begin
  for target in
    select format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)) as function_signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
      and p.proname = any (array[
        'ensure_fk_indexes_for_schema',
        'ensure_soft_delete_cols',
        'fn_find_rpc_dupes',
        'fn_list_tables_and_columns',
        'handle_auth_user_profile_sync',
        'on_create_function_pin_search_path',
        'on_ddl_ensure_fk_indexes'
      ])
  loop
    execute format('revoke execute on function %s from PUBLIC', target.function_signature);
    execute format('revoke execute on function %s from anon', target.function_signature);
    execute format('revoke execute on function %s from authenticated', target.function_signature);
    execute format('grant execute on function %s to service_role', target.function_signature);
  end loop;
end $$;
