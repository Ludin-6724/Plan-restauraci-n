-- Libros personalizados, logs de lectura y scores diarios

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text not null default '',
  notes text not null default '',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reading_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  date date not null,
  progress_label text not null default '',
  notes text not null default '',
  filter_keep boolean,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  score int not null default 0,
  delta int not null default 0,
  breakdown jsonb not null default '{}'::jsonb,
  reasons_up text[] not null default '{}',
  reasons_down text[] not null default '{}',
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.books enable row level security;
alter table public.reading_logs enable row level security;
alter table public.daily_scores enable row level security;

create policy "books_own" on public.books for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reading_logs_own" on public.reading_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_scores_own" on public.daily_scores for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists books_user_idx on public.books(user_id);
create index if not exists reading_logs_user_date_idx on public.reading_logs(user_id, date);
create index if not exists daily_scores_user_date_idx on public.daily_scores(user_id, date desc);
