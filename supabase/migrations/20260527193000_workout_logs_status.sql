alter table public.workout_logs
  add column if not exists status text;

update public.workout_logs
set status = 'completed'
where status is null
  or status not in ('completed', 'skipped', 'rest');

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
end $$;

create index if not exists workout_logs_user_plan_status_date_idx
  on public.workout_logs (user_id, workout_plan_id, status, workout_date);
