create table if not exists users (
  id uuid primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists workout_templates (
  id text primary key,
  name text not null,
  display_order int not null
);

create table if not exists exercise_templates (
  id text primary key,
  workout_template_id text not null references workout_templates(id) on delete cascade,
  exercise_name text not null,
  body_part text not null,
  region_group text not null check (region_group in ('upper','lower')),
  default_set_count int not null check (default_set_count > 0),
  display_order int not null
);

create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  workout_template_id text not null references workout_templates(id),
  log_date date not null,
  is_draft boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, workout_template_id, log_date)
);

create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references workout_logs(id) on delete cascade,
  exercise_template_id text not null references exercise_templates(id),
  weight numeric,
  reps int,
  tonnage numeric not null default 0,
  skipped boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(workout_log_id, exercise_template_id)
);
