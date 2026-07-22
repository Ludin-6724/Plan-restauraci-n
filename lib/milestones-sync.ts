import type { AppData, PhaseMilestone } from "./types";
import { ROUTINE_ITEMS } from "./seeds/content";
import { planDayNumber, todayISO } from "./plan-calendar";

/** Hitos que se calculan solos (el resto siguen manuales). */
export const AUTO_MILESTONE_KEYS = new Set([
  "rutina_80",
  "verdades_7",
  "protocolo",
  "ejercicio_suave",
  "bloques_trabajo",
  "ie_practicar",
  "amigo",
  "profundidad",
  "evaluar",
  "reescribir",
]);

function routinePctForDate(data: AppData, date: string): number {
  const day = data.routines.filter((r) => r.date === date);
  if (!day.length) return 0;
  const done = day.filter((r) => r.status === "done" || r.status === "partial").length;
  return done / Math.max(ROUTINE_ITEMS.length, day.length);
}

function lastNDates(n: number, end = todayISO()): string[] {
  const endDate = new Date(end + "T12:00:00");
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    out.push(`${y}-${m}-${day}`);
  }
  return out;
}

export function evaluateAutoMilestone(data: AppData, key: string): boolean {
  const today = todayISO();
  switch (key) {
    case "rutina_80": {
      const dates = lastNDates(7, today);
      const pcts = dates.map((d) => routinePctForDate(data, d));
      const good = pcts.filter((p) => p >= 0.8).length;
      const avg = pcts.reduce((a, b) => a + b, 0) / 7;
      return good >= 5 || avg >= 0.8;
    }
    case "verdades_7":
      return data.truths.filter((t) => t.is_active).length >= 7;
    case "protocolo":
      return data.panic_episodes.some((e) => e.protocol_completed);
    case "ejercicio_suave":
      return data.exercise_logs.length >= 1;
    case "bloques_trabajo":
      return data.software_sessions.length >= 3 || data.trading_entries.length >= 3;
    case "ie_practicar": {
      const n = data.journal_entries.filter((j) => j.gracias || j.verdad).length;
      return n >= 3;
    }
    case "amigo":
      return Boolean(data.profile.settings.trust_contact_name?.trim());
    case "profundidad":
      return data.software_sessions.length + data.trading_entries.length >= 10;
    case "evaluar":
      return planDayNumber(data.profile.plan_start_date, today) >= 14;
    case "reescribir":
      return data.truths.some((t) => t.is_custom);
    default:
      return false;
  }
}

/**
 * Marca hitos automáticos cuando se cumplen.
 * No desmarca hitos ya done. Si no hay cambios, devuelve el mismo `data`.
 */
export function applyMilestonesSync(data: AppData): AppData {
  const now = new Date().toISOString();
  let changed = false;
  const phase_milestones: PhaseMilestone[] = data.phase_milestones.map((m) => {
    if (m.done) return m;
    if (!AUTO_MILESTONE_KEYS.has(m.key)) return m;
    if (!evaluateAutoMilestone(data, m.key)) return m;
    changed = true;
    return { ...m, done: true, done_at: now };
  });
  if (!changed) return data;
  return { ...data, phase_milestones };
}

export function isAutoMilestone(key: string): boolean {
  return AUTO_MILESTONE_KEYS.has(key);
}
