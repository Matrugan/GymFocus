-- Profile avatar/banner columns and Storage buckets.

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists banner_url text;

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('profile-banners', 'profile-banners', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can view profile media"
  on storage.objects;

create policy "Public can view profile media"
  on storage.objects
  for select
  using (bucket_id in ('avatars', 'profile-banners'));

drop policy if exists "Users can upload their own profile media"
  on storage.objects;

create policy "Users can upload their own profile media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('avatars', 'profile-banners')
    and name like (auth.uid()::text || '/%')
  );

drop policy if exists "Users can update their own profile media"
  on storage.objects;

create policy "Users can update their own profile media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('avatars', 'profile-banners')
    and name like (auth.uid()::text || '/%')
  )
  with check (
    bucket_id in ('avatars', 'profile-banners')
    and name like (auth.uid()::text || '/%')
  );

drop policy if exists "Users can delete their own profile media"
  on storage.objects;

create policy "Users can delete their own profile media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('avatars', 'profile-banners')
    and name like (auth.uid()::text || '/%')
  );
