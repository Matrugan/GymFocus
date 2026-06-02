-- Storage buckets and policies for feed and chat images.

insert into storage.buckets (id, name, public)
values
  ('post-images', 'post-images', true),
  ('chat-images', 'chat-images', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can view feed and chat media"
  on storage.objects;

create policy "Public can view feed and chat media"
  on storage.objects
  for select
  using (bucket_id in ('post-images', 'chat-images'));

drop policy if exists "Users can upload their own feed and chat media"
  on storage.objects;

create policy "Users can upload their own feed and chat media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('post-images', 'chat-images')
    and (
      name like (auth.uid()::text || '-%')
      or name like (auth.uid()::text || '/%')
    )
  );

drop policy if exists "Users can update their own feed and chat media"
  on storage.objects;

create policy "Users can update their own feed and chat media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('post-images', 'chat-images')
    and (
      name like (auth.uid()::text || '-%')
      or name like (auth.uid()::text || '/%')
    )
  )
  with check (
    bucket_id in ('post-images', 'chat-images')
    and (
      name like (auth.uid()::text || '-%')
      or name like (auth.uid()::text || '/%')
    )
  );

drop policy if exists "Users can delete their own feed and chat media"
  on storage.objects;

create policy "Users can delete their own feed and chat media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('post-images', 'chat-images')
    and (
      name like (auth.uid()::text || '-%')
      or name like (auth.uid()::text || '/%')
    )
  );
