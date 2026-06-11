-- START: supabase/migrations/20260611_add_microsoft_365_connector.sql

create table if not exists public.microsoft_oauth_states (
    state_hash text primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    code_verifier text not null,
    requested_scopes text[] not null,
    redirect_after_connect text,
    expires_at timestamptz not null,
    created_at timestamptz not null default now()
);

create index if not exists microsoft_oauth_states_user_id_idx
    on public.microsoft_oauth_states (user_id);

create index if not exists microsoft_oauth_states_expires_at_idx
    on public.microsoft_oauth_states (expires_at);

create table if not exists public.microsoft_connections (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    microsoft_tenant_id text not null,
    microsoft_user_id text not null,
    display_name text,
    email text,
    access_token_ciphertext text not null,
    refresh_token_ciphertext text not null,
    token_type text not null default 'Bearer',
    granted_scopes text[] not null default '{}',
    connected_features text[] not null default '{}',
    expires_at timestamptz not null,
    status text not null default 'connected',
    last_error text,
    last_connected_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint microsoft_connections_status_check
        check (status in ('connected', 'revoked', 'error')),

    constraint microsoft_connections_unique_account
        unique (user_id, microsoft_tenant_id, microsoft_user_id)
);

create index if not exists microsoft_connections_user_id_idx
    on public.microsoft_connections (user_id);

create index if not exists microsoft_connections_status_idx
    on public.microsoft_connections (status);

alter table public.microsoft_oauth_states enable row level security;
alter table public.microsoft_connections enable row level security;

revoke all on public.microsoft_oauth_states from anon, authenticated;
revoke all on public.microsoft_connections from anon, authenticated;

comment on table public.microsoft_oauth_states is
    'Temporary Microsoft OAuth PKCE state records. Accessed only by Supabase Edge Functions.';

comment on table public.microsoft_connections is
    'Encrypted delegated Microsoft Graph connector tokens for SharePoint, Outlook, and Teams. Accessed only by Supabase Edge Functions.';

-- END: supabase/migrations/20260611_add_microsoft_365_connector.sql
