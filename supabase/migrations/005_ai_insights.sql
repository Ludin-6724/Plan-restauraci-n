-- Insights generados por IA (app híbrida + n8n)
-- Ejecutar en Supabase SQL Editor si no usas CLI.

create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('weekly_review', 'trading_review', 'truths_panel', 'full_coach')),
  period text,
  title text not null default '',
  content text not null,
  input_summary jsonb not null default '{}'::jsonb,
  model text,
  source text not null default 'app' check (source in ('app', 'n8n', 'cron')),
  created_at timestamptz not null default now()
);

create index if not exists ai_insights_user_kind_created
  on public.ai_insights (user_id, kind, created_at desc);

alter table public.ai_insights enable row level security;

create policy "ai_insights_select_own"
  on public.ai_insights for select
  using (auth.uid() = user_id);

create policy "ai_insights_insert_own"
  on public.ai_insights for insert
  with check (auth.uid() = user_id);

create policy "ai_insights_delete_own"
  on public.ai_insights for delete
  using (auth.uid() = user_id);

-- Service role (n8n / cron) bypasea RLS por defecto.
