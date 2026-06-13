-- Enable RLS on public tables previously reported by Supabase advisors as exposed.
-- No permissive policies are added intentionally:
--   - public.rpc_error_debug should not be directly accessible through client roles.
--   - public.organization_email_invites is managed through SECURITY DEFINER invite RPCs,
--     so direct table access should stay closed unless a future UI path needs scoped policies.

alter table public.rpc_error_debug enable row level security;
alter table public.organization_email_invites enable row level security;
