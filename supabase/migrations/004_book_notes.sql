-- Notas individuales por libro (archivo de lecturas)

create table if not exists public.book_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null,
  content text not null default '',
  created_at timestamptz not null default now()
);

-- Índice y RLS
create index if not exists book_notes_user_idx on public.book_notes(user_id);
create index if not exists book_notes_book_idx on public.book_notes(book_id, created_at desc);

alter table public.book_notes enable row level security;

drop policy if exists "book_notes_own" on public.book_notes;
create policy "book_notes_own" on public.book_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Asegurar que books / reading_logs acepten ids del cliente (ya existen en 003)
-- Sin FK estricta book_id → books: los ids se generan en el cliente y se sincronizan juntos
