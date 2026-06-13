create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create or replace function private.can_access_project_source_document(
  p_user_id uuid,
  p_project_id uuid,
  p_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user_id is not null
    and (
      exists (
        select 1
        from public.user_projects up
        where up.project_id = p_project_id
          and up.user_id = p_user_id
          and up.deleted_at is null
      )
      or exists (
        select 1
        from public.profiles p
        where p.id = p_user_id
          and p.organization_id = p_organization_id
          and p.deleted_at is null
      )
    );
$$;

create or replace function private.can_manage_project_source_document(
  p_user_id uuid,
  p_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user_id is not null
    and exists (
      select 1
      from public.profiles p
      where p.id = p_user_id
        and p.organization_id = p_organization_id
        and p.deleted_at is null
    );
$$;

revoke all on function private.can_access_project_source_document(uuid, uuid, uuid) from public, anon;
revoke all on function private.can_manage_project_source_document(uuid, uuid) from public, anon;
grant execute on function private.can_access_project_source_document(uuid, uuid, uuid) to authenticated, service_role;
grant execute on function private.can_manage_project_source_document(uuid, uuid) to authenticated, service_role;

drop policy if exists project_source_documents_select on public.project_source_documents;
drop policy if exists project_source_documents_insert on public.project_source_documents;
drop policy if exists project_source_documents_update on public.project_source_documents;

create policy project_source_documents_select
  on public.project_source_documents
  for select
  to authenticated
  using (
    private.can_access_project_source_document((select auth.uid()), project_id, organization_id)
  );

create policy project_source_documents_insert
  on public.project_source_documents
  for insert
  to authenticated
  with check (
    private.can_manage_project_source_document((select auth.uid()), organization_id)
  );

create policy project_source_documents_update
  on public.project_source_documents
  for update
  to authenticated
  using (
    private.can_manage_project_source_document((select auth.uid()), organization_id)
  )
  with check (
    private.can_manage_project_source_document((select auth.uid()), organization_id)
  );
