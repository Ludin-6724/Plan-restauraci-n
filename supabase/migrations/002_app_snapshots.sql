-- Snapshot completo del plan (JSON) para backup en la nube
create table if not exists public.app_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_snapshots enable row level security;

create policy "app_snapshots_own" on public.app_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
