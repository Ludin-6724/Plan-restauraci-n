import type { AppData, ItemStatus } from "./types";
import { ROUTINE_ITEMS, type RoutineBlock } from "./seeds/content";
import { todayISO, toLocalISODate } from "./plan-calendar";

function hasText(s: string | undefined | null): boolean {
  return Boolean(s && s.trim().length > 0);
}

function newId(): string {
  return crypto.randomUUID();
}

function isMurphyBook(title: string, author: string): boolean {
  const t = `${title} ${author}`.toLowerCase();
  return t.includes("murphy") || t.includes("subconsciente") || t.includes("subconscious");
}

function isIEBook(title: string, author: string): boolean {
  const t = `${title} ${author}`.toLowerCase();
  return (
    t.includes("goleman") ||
    t.includes("inteligencia emocional") ||
    t.includes("emotional intelligence")
  );
}

/** Keys de rutina que se marcan solas con evidencia de otros módulos. */
export const AUTO_ROUTINE_KEYS = new Set([
  "palabra",
  "verdades",
  "verdades_noche",
  "murphy",
  "ie",
  "diario",
  "cuerpo_am",
  "proposito_trabajo",
]);

/**
 * Calcula qué ítems de rutina deberían estar "done" por evidencia real del día.
 * No incluye skipped (eso lo decide el usuario).
 */
export function evidenceDoneKeys(data: AppData, date: string): Set<string> {
  const done = new Set<string>();

  if (data.scripture_logs.some((s) => s.date === date && s.done)) {
    done.add("palabra");
  }

  const sessions = data.truth_sessions.filter((s) => s.date === date && s.completed);
  if (sessions.some((s) => s.slot === "morning" || s.slot === "mid")) {
    done.add("verdades");
  }
  if (sessions.some((s) => s.slot === "night")) {
    done.add("verdades_noche");
  }
  // Si hay cualquier sesión de verdades y no hay noche, al menos mañana
  if (sessions.length && !done.has("verdades") && !done.has("verdades_noche")) {
    done.add("verdades");
  }

  const journal = data.journal_entries.find((j) => j.date === date);
  if (
    journal &&
    (hasText(journal.gracias) ||
      hasText(journal.verdad) ||
      hasText(journal.manana_hare) ||
      hasText(journal.weekly_notes))
  ) {
    done.add("diario");
  }

  if (data.exercise_logs.some((e) => e.date === date)) {
    done.add("cuerpo_am");
  }

  if (
    data.software_sessions.some((s) => s.date === date) ||
    data.trading_entries.some((t) => t.date === date)
  ) {
    done.add("proposito_trabajo");
  }

  // Lecturas: notas del día o logs del día, por libro
  const books = data.books || [];
  // Fecha LOCAL (no UTC de created_at), para no “saltar” al día siguiente
  const notesToday = (data.book_notes || []).filter(
    (n) => hasText(n.content) && toLocalISODate(n.created_at) === date
  );
  const logsToday = (data.reading_logs || []).filter(
    (l) => l.date === date && (hasText(l.notes) || hasText(l.progress_label))
  );

  let anyReading = false;
  let murphy = false;
  let ie = false;

  const touchBook = (bookId: string) => {
    anyReading = true;
    const b = books.find((x) => x.id === bookId);
    if (!b) return;
    if (isMurphyBook(b.title, b.author)) murphy = true;
    if (isIEBook(b.title, b.author)) ie = true;
  };

  notesToday.forEach((n) => touchBook(n.book_id));
  logsToday.forEach((l) => touchBook(l.book_id));

  if (murphy) done.add("murphy");
  if (ie) done.add("ie");
  // Libro custom u otro: cuenta como lectura del día → al menos un check de lectura
  if (anyReading && !murphy && !ie) {
    done.add("murphy"); // “lectura hecha” en el slot de lectura principal
  }

  return done;
}

/**
 * Asegura filas de rutina del día y marca done según evidencia.
 * No pisa status === "skipped".
 * Si no hay cambios, devuelve el mismo objeto `data` (evita re-renders y lag).
 */
export function applyRoutineSync(data: AppData, date: string = todayISO()): AppData {
  const evidence = evidenceDoneKeys(data, date);
  const existing = new Set(data.routines.filter((r) => r.date === date).map((r) => r.item_key));

  const missing = ROUTINE_ITEMS.filter((i) => !existing.has(i.key));
  let changed = missing.length > 0;

  let routines = data.routines;
  if (missing.length) {
    routines = [
      ...data.routines,
      ...missing.map((item) => ({
        id: newId(),
        date,
        item_key: item.key,
        block: item.block as RoutineBlock,
        status: "pending" as ItemStatus,
        notes: "",
      })),
    ];
  }

  const nextRoutines = routines.map((r) => {
    if (r.date !== date) return r;
    if (!evidence.has(r.item_key)) return r;
    if (r.status === "skipped" || r.status === "done") return r;
    changed = true;
    return { ...r, status: "done" as ItemStatus };
  });

  if (!changed) return data;
  return { ...data, routines: nextRoutines };
}

export function isAutoRoutineKey(key: string): boolean {
  return AUTO_ROUTINE_KEYS.has(key);
}
