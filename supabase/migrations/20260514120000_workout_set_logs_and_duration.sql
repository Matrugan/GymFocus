-- Enable per-set load/reps logging and workout duration tracking.

alter table public.workout_logs
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists duration_seconds integer check (
    duration_seconds is null or duration_seconds >= 0
  );

create index if not exists workout_logs_user_plan_duration_idx
  on public.workout_logs (user_id, workout_plan_id, workout_date)
  where duration_seconds is not null;

create table if not exists public.workout_set_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_plan_id uuid not null references public.workout_plans(id) on delete cascade,
  exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  workout_date date not null,
  set_number integer not null check (set_number > 0),
  reps integer check (reps >= 0),
  load numeric(7, 2) check (load >= 0),
  difficulty text not null default 'moderate'
    check (difficulty in ('light', 'moderate', 'heavy', 'failure')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, workout_plan_id, exercise_id, workout_date, set_number)
);

create index if not exists workout_set_logs_user_plan_date_idx
  on public.workout_set_logs (user_id, workout_plan_id, workout_date);

create index if not exists workout_set_logs_exercise_date_idx
  on public.workout_set_logs (exercise_id, workout_date);

alter table public.workout_set_logs enable row level security;

drop policy if exists "Users can read their own workout set logs"
  on public.workout_set_logs;

create policy "Users can read their own workout set logs"
  on public.workout_set_logs
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own workout set logs"
  on public.workout_set_logs;

create policy "Users can insert their own workout set logs"
  on public.workout_set_logs
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own workout set logs"
  on public.workout_set_logs;

create policy "Users can update their own workout set logs"
  on public.workout_set_logs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own workout set logs"
  on public.workout_set_logs;

create policy "Users can delete their own workout set logs"
  on public.workout_set_logs
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists workout_set_logs_set_updated_at
  on public.workout_set_logs;

create trigger workout_set_logs_set_updated_at
  before update on public.workout_set_logs
  for each row
  execute function public.set_updated_at();
