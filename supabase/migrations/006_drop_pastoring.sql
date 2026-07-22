-- Eliminar sección Pastorado por completo
drop policy if exists "pastoring_own" on public.pastoring_closure;
drop table if exists public.pastoring_closure;
