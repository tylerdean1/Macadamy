-- Require explicit grants for future public-schema API objects.
-- Existing object grants are intentionally left unchanged to avoid disrupting
-- current security-invoker RPCs that still rely on table privileges plus RLS.

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from public;

alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated, service_role;
