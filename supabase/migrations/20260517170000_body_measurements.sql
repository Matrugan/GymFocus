create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at date not null default current_date,
  height_cm numeric(5, 2) check (height_cm is null or height_cm > 0),
  weight_kg numeric(6, 2) check (weight_kg is null or weight_kg > 0),
  chest_cm numeric(6, 2) check (chest_cm is null or chest_cm > 0),
  waist_cm numeric(6, 2) check (waist_cm is null or waist_cm > 0),
  hip_cm numeric(6, 2) check (hip_cm is null or hip_cm > 0),
  arm_cm numeric(6, 2) check (arm_cm is null or arm_cm > 0),
  thigh_cm numeric(6, 2) check (thigh_cm is null or thigh_cm > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, measured_at)
);

create index if not exists body_measurements_user_date_idx
  on public.body_measurements (user_id, measured_at desc);

alter table public.body_measurements enable row level security;

drop policy if exists "Users can read their own body measurements"
  on public.body_measurements;

create policy "Users can read their own body measurements"
  on public.body_measurements
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own body measurements"
  on public.body_measurements;

create policy "Users can insert their own body measurements"
  on public.body_measurements
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own body measurements"
  on public.body_measurements;

create policy "Users can update their own body measurements"
  on public.body_measurements
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own body measurements"
  on public.body_measurements;

create policy "Users can delete their own body measurements"
  on public.body_measurements
  for delete
  using (auth.uid() = user_id);

drop trigger if exists body_measurements_set_updated_at
  on public.body_measurements;

create trigger body_measurements_set_updated_at
  before update on public.body_measurements
  for each row
  execute function public.set_updated_at();
