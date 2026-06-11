-- Repair the production database shape expected by the current GymFocus app.
-- This migration is intentionally compatible with the current database export,
-- where workout_plans/workout_exercises use bigint identity primary keys.

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

alter table public.workout_logs
  add column if not exists status text,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists duration_seconds integer,
  add column if not exists calories_burned integer,
  add column if not exists workout_type text,
  add column if not exists distance_km numeric,
  add column if not exists notes text;

update public.workout_logs
set status = 'completed'
where status is null
  or status not in ('completed', 'skipped', 'rest');

update public.workout_logs
set duration_seconds = null
where duration_seconds is not null
  and duration_seconds < 0;

update public.workout_logs
set calories_burned = null
where calories_burned is not null
  and calories_burned < 0;

update public.workout_logs
set distance_km = null
where distance_km is not null
  and distance_km < 0;

alter table public.workout_logs
  alter column status set default 'completed',
  alter column status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_logs_status_check'
      and conrelid = 'public.workout_logs'::regclass
  ) then
    alter table public.workout_logs
      add constraint workout_logs_status_check
      check (status in ('completed', 'skipped', 'rest'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_logs_duration_seconds_check'
      and conrelid = 'public.workout_logs'::regclass
  ) then
    alter table public.workout_logs
      add constraint workout_logs_duration_seconds_check
      check (duration_seconds is null or duration_seconds >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_logs_calories_burned_check'
      and conrelid = 'public.workout_logs'::regclass
  ) then
    alter table public.workout_logs
      add constraint workout_logs_calories_burned_check
      check (calories_burned is null or calories_burned >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_logs_distance_km_check'
      and conrelid = 'public.workout_logs'::regclass
  ) then
    alter table public.workout_logs
      add constraint workout_logs_distance_km_check
      check (distance_km is null or distance_km >= 0);
  end if;
end;
$$;

create index if not exists workout_logs_user_plan_status_date_idx
  on public.workout_logs (user_id, workout_plan_id, status, workout_date);

create index if not exists workout_logs_calories_burned_idx
  on public.workout_logs (calories_burned)
  where calories_burned is not null;

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at date not null default current_date,
  height_cm numeric(5, 2),
  weight_kg numeric(6, 2),
  chest_cm numeric(6, 2),
  waist_cm numeric(6, 2),
  hip_cm numeric(6, 2),
  arm_cm numeric(6, 2),
  thigh_cm numeric(6, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.body_measurements
  add column if not exists measured_at date not null default current_date,
  add column if not exists height_cm numeric(5, 2),
  add column if not exists weight_kg numeric(6, 2),
  add column if not exists chest_cm numeric(6, 2),
  add column if not exists waist_cm numeric(6, 2),
  add column if not exists hip_cm numeric(6, 2),
  add column if not exists arm_cm numeric(6, 2),
  add column if not exists thigh_cm numeric(6, 2),
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

with duplicate_body_measurements as (
  select
    id,
    row_number() over (
      partition by user_id, measured_at
      order by created_at desc nulls last, id desc
    ) as duplicate_rank
  from public.body_measurements
)
delete from public.body_measurements
using duplicate_body_measurements
where public.body_measurements.id = duplicate_body_measurements.id
  and duplicate_body_measurements.duplicate_rank > 1;

update public.body_measurements
set
  height_cm = case when height_cm is not null and height_cm <= 0 then null else height_cm end,
  weight_kg = case when weight_kg is not null and weight_kg <= 0 then null else weight_kg end,
  chest_cm = case when chest_cm is not null and chest_cm <= 0 then null else chest_cm end,
  waist_cm = case when waist_cm is not null and waist_cm <= 0 then null else waist_cm end,
  hip_cm = case when hip_cm is not null and hip_cm <= 0 then null else hip_cm end,
  arm_cm = case when arm_cm is not null and arm_cm <= 0 then null else arm_cm end,
  thigh_cm = case when thigh_cm is not null and thigh_cm <= 0 then null else thigh_cm end;

do $$
begin
  if not exists (
    select 1
    from pg_constraint constraint_record
    where constraint_record.conrelid = 'public.body_measurements'::regclass
      and constraint_record.contype in ('u', 'p')
      and (
        select array_agg(attribute_record.attname::text order by constraint_key.ordinality)
        from unnest(constraint_record.conkey) with ordinality
          as constraint_key(attnum, ordinality)
        join pg_attribute attribute_record
          on attribute_record.attrelid = constraint_record.conrelid
         and attribute_record.attnum = constraint_key.attnum
      ) = array['user_id', 'measured_at']
  ) then
    alter table public.body_measurements
      add constraint body_measurements_unique_user_date
      unique (user_id, measured_at);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'body_measurements_height_cm_check'
      and conrelid = 'public.body_measurements'::regclass
  ) then
    alter table public.body_measurements
      add constraint body_measurements_height_cm_check
      check (height_cm is null or height_cm > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'body_measurements_weight_kg_check'
      and conrelid = 'public.body_measurements'::regclass
  ) then
    alter table public.body_measurements
      add constraint body_measurements_weight_kg_check
      check (weight_kg is null or weight_kg > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'body_measurements_chest_cm_check'
      and conrelid = 'public.body_measurements'::regclass
  ) then
    alter table public.body_measurements
      add constraint body_measurements_chest_cm_check
      check (chest_cm is null or chest_cm > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'body_measurements_waist_cm_check'
      and conrelid = 'public.body_measurements'::regclass
  ) then
    alter table public.body_measurements
      add constraint body_measurements_waist_cm_check
      check (waist_cm is null or waist_cm > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'body_measurements_hip_cm_check'
      and conrelid = 'public.body_measurements'::regclass
  ) then
    alter table public.body_measurements
      add constraint body_measurements_hip_cm_check
      check (hip_cm is null or hip_cm > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'body_measurements_arm_cm_check'
      and conrelid = 'public.body_measurements'::regclass
  ) then
    alter table public.body_measurements
      add constraint body_measurements_arm_cm_check
      check (arm_cm is null or arm_cm > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'body_measurements_thigh_cm_check'
      and conrelid = 'public.body_measurements'::regclass
  ) then
    alter table public.body_measurements
      add constraint body_measurements_thigh_cm_check
      check (thigh_cm is null or thigh_cm > 0);
  end if;
end;
$$;

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

create table if not exists public.workout_set_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_plan_id bigint not null references public.workout_plans(id) on delete cascade,
  exercise_id bigint not null references public.workout_exercises(id) on delete cascade,
  workout_date date not null,
  set_number integer not null,
  reps integer,
  load numeric,
  difficulty text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz not null default now()
);

alter table public.workout_set_logs
  add column if not exists difficulty text,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz;

update public.workout_set_logs
set difficulty = 'moderate'
where difficulty is null
  or difficulty not in ('light', 'moderate', 'heavy', 'failure');

update public.workout_set_logs
set updated_at = coalesce(created_at, now())
where updated_at is null;

update public.workout_set_logs
set
  set_number = case when set_number is null or set_number <= 0 then 1 else set_number end,
  reps = case when reps is not null and reps < 0 then null else reps end,
  load = case when load is not null and load < 0 then null else load end;

alter table public.workout_set_logs
  alter column difficulty set default 'moderate',
  alter column difficulty set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_set_logs_set_number_check'
      and conrelid = 'public.workout_set_logs'::regclass
  ) then
    alter table public.workout_set_logs
      add constraint workout_set_logs_set_number_check
      check (set_number > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_set_logs_reps_check'
      and conrelid = 'public.workout_set_logs'::regclass
  ) then
    alter table public.workout_set_logs
      add constraint workout_set_logs_reps_check
      check (reps is null or reps >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_set_logs_load_check'
      and conrelid = 'public.workout_set_logs'::regclass
  ) then
    alter table public.workout_set_logs
      add constraint workout_set_logs_load_check
      check (load is null or load >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_set_logs_difficulty_check'
      and conrelid = 'public.workout_set_logs'::regclass
  ) then
    alter table public.workout_set_logs
      add constraint workout_set_logs_difficulty_check
      check (difficulty in ('light', 'moderate', 'heavy', 'failure'));
  end if;
end;
$$;

with duplicate_set_logs as (
  select
    id,
    row_number() over (
      partition by user_id, workout_plan_id, exercise_id, workout_date, set_number
      order by created_at desc nulls last, id desc
    ) as duplicate_rank
  from public.workout_set_logs
)
delete from public.workout_set_logs
using duplicate_set_logs
where public.workout_set_logs.id = duplicate_set_logs.id
  and duplicate_set_logs.duplicate_rank > 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint constraint_record
    where constraint_record.conrelid = 'public.workout_set_logs'::regclass
      and constraint_record.contype in ('u', 'p')
      and (
        select array_agg(attribute_record.attname::text order by constraint_key.ordinality)
        from unnest(constraint_record.conkey) with ordinality
          as constraint_key(attnum, ordinality)
        join pg_attribute attribute_record
          on attribute_record.attrelid = constraint_record.conrelid
         and attribute_record.attnum = constraint_key.attnum
      ) = array[
        'user_id',
        'workout_plan_id',
        'exercise_id',
        'workout_date',
        'set_number'
      ]
  ) then
    alter table public.workout_set_logs
      add constraint workout_set_logs_unique_set_per_day
      unique (user_id, workout_plan_id, exercise_id, workout_date, set_number);
  end if;
end;
$$;

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

drop trigger if exists workout_set_logs_set_updated_at
  on public.workout_set_logs;

create trigger workout_set_logs_set_updated_at
  before update on public.workout_set_logs
  for each row
  execute function public.set_updated_at();
