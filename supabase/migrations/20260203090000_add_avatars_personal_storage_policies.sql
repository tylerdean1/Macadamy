-- Ensure avatars-personal bucket exists and is public
insert into storage.buckets (id, name, public)
values ('avatars-personal', 'avatars-personal', true)
on conflict (id) do update set public = excluded.public;

-- Allow authenticated users to upload into their own folder
drop policy if exists "avatars_personal_insert_own" on storage.objects;
create policy "avatars_personal_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars-personal'
    and owner = auth.uid()
  );

-- Allow authenticated users to update/delete their own objects if needed
drop policy if exists "avatars_personal_update_own" on storage.objects;
create policy "avatars_personal_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars-personal'
    and owner = auth.uid()
  )
  with check (
    bucket_id = 'avatars-personal'
    and owner = auth.uid()
  );

drop policy if exists "avatars_personal_delete_own" on storage.objects;
create policy "avatars_personal_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars-personal'
    and owner = auth.uid()
  );
