alter table public.profiles
  add column if not exists fitness_goal text,
  add column if not exists training_level text,
  add column if not exists initial_template text,
  add column if not exists onboarding_completed boolean not null default false;
