-- Repair older workout_set_logs tables that existed before per-set metadata.

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
