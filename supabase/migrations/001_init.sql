-- Bosque de Restauración — schema + RLS
-- Ejecutar en Supabase SQL Editor o: supabase db push

create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  plan_start_date date not null default current_date,
  onboarding_done boolean not null default false,
  accepted_disclaimer boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.truths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  block text not null check (block in ('A','B','C','D')),
  is_active boolean not null default true,
  sort_order int not null default 0,
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  item_key text not null,
  block text not null,
  status text not null default 'pending',
  notes text not null default '',
  unique (user_id, date, item_key)
);

create table if not exists public.truth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  slot text not null check (slot in ('morning','mid','night')),
  completed boolean not null default true,
  reps_total int not null default 0,
  truth_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.scripture_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  passage_key text not null,
  done boolean not null default false,
  highlight_phrase text not null default '',
  unique (user_id, date)
);

create table if not exists public.panic_episodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  intensity_before int not null,
  intensity_after int,
  trigger text not null default '',
  helped text not null default '',
  notes text not null default '',
  protocol_completed boolean not null default false
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  gracias text not null default '',
  verdad text not null default '',
  manana_hare text not null default '',
  weekly_notes text not null default '',
  unique (user_id, date)
);

create table if not exists public.pastoring_closure (
  user_id uuid primary key references auth.users(id) on delete cascade,
  checklist jsonb not null default '{}'::jsonb,
  letter_text text not null default '',
  completed_at timestamptz
);

create table if not exists public.holiness_lines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  active boolean not null default true
);

create table if not exists public.holiness_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  type text not null check (type in ('confession','integrity')),
  note text not null default ''
);

create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  minutes int not null default 0,
  circuit_done boolean not null default false,
  walk_only boolean not null default false,
  rpe int not null default 0,
  notes text not null default ''
);

create table if not exists public.software_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  minutes int not null default 0,
  deliverable text not null default '',
  notes text not null default ''
);

create table if not exists public.software_weekly (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  deliverable_text text not null default '',
  done boolean not null default false,
  unique (user_id, week_start)
);

create table if not exists public.trading_rules (
  user_id uuid primary key references auth.users(id) on delete cascade,
  max_daily_loss numeric not null default 0,
  max_weekly_loss numeric not null default 0,
  rules_text text not null default ''
);

create table if not exists public.trading_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  thesis text not null default '',
  emotion int not null default 0,
  result text not null default '',
  lesson text not null default '',
  skipped_reason text not null default ''
);

create table if not exists public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_key text not null check (book_key in ('murphy','ie')),
  progress_label text not null default '',
  notes text not null default '',
  filter_keep boolean,
  updated_at timestamptz not null default now(),
  unique (user_id, book_key)
);

create table if not exists public.weekly_board (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  day date not null,
  pillar text not null,
  checked boolean not null default false,
  panic_score int,
  unique (user_id, week_start, day, pillar)
);

create table if not exists public.phase_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phase int not null,
  key text not null,
  done boolean not null default false,
  done_at timestamptz,
  unique (user_id, phase, key)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.truths enable row level security;
alter table public.daily_routines enable row level security;
alter table public.truth_sessions enable row level security;
alter table public.scripture_logs enable row level security;
alter table public.panic_episodes enable row level security;
alter table public.journal_entries enable row level security;
alter table public.pastoring_closure enable row level security;
alter table public.holiness_lines enable row level security;
alter table public.holiness_logs enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.software_sessions enable row level security;
alter table public.software_weekly enable row level security;
alter table public.trading_rules enable row level security;
alter table public.trading_entries enable row level security;
alter table public.reading_progress enable row level security;
alter table public.weekly_board enable row level security;
alter table public.phase_milestones enable row level security;

-- Policies helper: own rows only
create policy "profiles_own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "truths_own" on public.truths for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "routines_own" on public.daily_routines for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "truth_sessions_own" on public.truth_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "scripture_own" on public.scripture_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "panic_own" on public.panic_episodes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "journal_own" on public.journal_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "pastoring_own" on public.pastoring_closure for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "holiness_lines_own" on public.holiness_lines for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "holiness_logs_own" on public.holiness_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercise_own" on public.exercise_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "software_own" on public.software_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "software_weekly_own" on public.software_weekly for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "trading_rules_own" on public.trading_rules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "trading_entries_own" on public.trading_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reading_own" on public.reading_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "board_own" on public.weekly_board for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "milestones_own" on public.phase_milestones for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
