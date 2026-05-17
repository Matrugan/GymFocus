alter table public.workout_logs
  add column if not exists calories_burned integer check (
    calories_burned is null or calories_burned >= 0
  ),
  add column if not exists workout_type text,
  add column if not exists distance_km numeric check (
    distance_km is null or distance_km >= 0
  ),
  add column if not exists notes text;

create index if not exists workout_logs_calories_burned_idx
  on public.workout_logs (calories_burned)
  where calories_burned is not null;
