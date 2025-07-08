-- Ensure the custom access token hook no longer references removed demo tables
create or replace function public.custom_access_token_hook(claims jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return claims;
end;
$$;
