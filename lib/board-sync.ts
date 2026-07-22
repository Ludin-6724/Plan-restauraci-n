import type { AppData, WeeklyBoardCell } from "./types";
import { PILLARS } from "./seeds/content";
import { isFutureDate, todayISO, toLocalISODate, weekDates, weekStartISO } from "./plan-calendar";

function newId(): string {
  return crypto.randomUUID();
}

function hasText(s: string | undefined | null): boolean {
  return Boolean(s && s.trim().length > 0);
}

function dayHasScripture(data: AppData, date: string): boolean {
  return data.scripture_logs.some((s) => s.date === date && s.done);
}

function dayHasTruths(data: AppData, date: string): boolean {
  return data.truth_sessions.some((s) => s.date === date && s.completed);
}

function dayHasExercise(data: AppData, date: string): boolean {
  return data.exercise_logs.some((e) => e.date === date);
}

function dayHasMente(data: AppData, date: string): boolean {
  const journal = data.journal_entries.find((j) => j.date === date);
  const journalOk = !!(
    journal &&
    (hasText(journal.gracias) || hasText(journal.verdad) || hasText(journal.manana_hare))
  );
  const note = (data.book_notes || []).some(
    (n) => hasText(n.content) && toLocalISODate(n.created_at) === date
  );
  const log = (data.reading_logs || []).some(
    (l) => l.date === date && (hasText(l.notes) || hasText(l.progress_label))
  );
  return journalOk || note || log;
}

function dayHasSoftware(data: AppData, date: string): boolean {
  return data.software_sessions.some((s) => s.date === date);
}

function dayHasTrading(data: AppData, date: string): boolean {
  return data.trading_entries.some((t) => t.date === date);
}

function dayPanicMax(data: AppData, date: string): number | null {
  const eps = data.panic_episodes.filter((e) => toLocalISODate(e.started_at) === date);
  if (!eps.length) return null;
  return Math.max(...eps.map((e) => e.intensity_before));
}

function pillarChecked(data: AppData, date: string, pillar: string): boolean {
  if (isFutureDate(date)) return false;
  switch (pillar) {
    case "dios":
      return dayHasScripture(data, date) || dayHasTruths(data, date);
    case "cuerpo":
      return dayHasExercise(data, date);
    case "mente":
      return dayHasMente(data, date);
    case "software":
      return dayHasSoftware(data, date);
    case "trading":
      return dayHasTrading(data, date);
    default:
      return false;
  }
}

/**
 * Tablero = espejo de lo registrado.
 * Si no hay cambios reales, devuelve el mismo `data` (sin re-render).
 */
export function applyBoardSync(data: AppData, weekStart: string = weekStartISO()): AppData {
  const days = weekDates(weekStart);
  const pillars = PILLARS.map((p) => p.key as string);
  const weekCells = data.weekly_board.filter((c) => c.week_start === weekStart);
  const byKey = new Map(weekCells.map((c) => [`${c.day}|${c.pillar}`, c]));

  let changed = false;
  const updatedWeek: WeeklyBoardCell[] = [];

  for (const day of days) {
    for (const p of pillars) {
      const key = `${day}|${p}`;
      const wantChecked = pillarChecked(data, day, p);
      const old = byKey.get(key);
      if (old) {
        if (old.checked !== wantChecked) {
          changed = true;
          updatedWeek.push({ ...old, checked: wantChecked });
        } else {
          updatedWeek.push(old);
        }
      } else {
        changed = true;
        updatedWeek.push({
          id: newId(),
          week_start: weekStart,
          day,
          pillar: p,
          checked: wantChecked,
          panic_score: null,
        });
      }
    }

    const panicKey = `${day}|panic`;
    const wantPanic = isFutureDate(day) ? null : dayPanicMax(data, day);
    const oldPanic = byKey.get(panicKey);
    if (oldPanic) {
      if (oldPanic.panic_score !== wantPanic) {
        changed = true;
        updatedWeek.push({ ...oldPanic, panic_score: wantPanic });
      } else {
        updatedWeek.push(oldPanic);
      }
    } else {
      changed = true;
      updatedWeek.push({
        id: newId(),
        week_start: weekStart,
        day,
        pillar: "panic",
        checked: false,
        panic_score: wantPanic,
      });
    }
  }

  // Celdas de la semana que ya no aplican (días raros) se descartan
  if (weekCells.length !== updatedWeek.length) changed = true;

  if (!changed) return data;

  const otherWeeks = data.weekly_board.filter((c) => c.week_start !== weekStart);
  return { ...data, weekly_board: [...otherWeeks, ...updatedWeek] };
}

export function applyBoardSyncForDate(data: AppData, date: string = todayISO()): AppData {
  return applyBoardSync(data, weekStartISO(date));
}
