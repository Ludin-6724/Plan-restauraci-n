import type { AppData, DailyScore } from "./types";
import { ROUTINE_ITEMS, purposeForWeekday } from "./seeds/content";
import { weekdayIndex } from "./plan-calendar";
import { purposeLabelFor, tradingEnabledFor } from "./purpose";

const WEIGHTS = {
  rutina: 35,
  verdades: 15,
  palabra: 10,
  lecturas: 10,
  ejercicio: 10,
  proposito: 15,
  diario: 5,
} as const;

export function computeDailyScore(data: AppData, date: string, prevScore?: number | null): DailyScore {
  const reasons_up: string[] = [];
  const reasons_down: string[] = [];
  const breakdown: Record<string, number> = {};

  // Rutina
  const dayRoutines = data.routines.filter((r) => r.date === date);
  const doneCount = dayRoutines.filter((r) => r.status === "done" || r.status === "partial").length;
  const totalItems = ROUTINE_ITEMS.length;
  const rutinaRatio = totalItems ? doneCount / totalItems : 0;
  breakdown.rutina = Math.round(rutinaRatio * 100) / 100;
  if (rutinaRatio >= 0.8) reasons_up.push(`Rutina sólida (${doneCount}/${totalItems} ítems)`);
  else if (rutinaRatio === 0) reasons_down.push("No marcaste ningún ítem de la rutina del día");
  else {
    const missing = ROUTINE_ITEMS.filter((i) => {
      const e = dayRoutines.find((r) => r.item_key === i.key);
      return !e || e.status === "pending" || e.status === "skipped";
    });
    const blocks = [...new Set(missing.map((m) => m.block))];
    reasons_down.push(
      `Rutina incompleta: faltan ${missing.length} ítems (${blocks.join(", ")})`
    );
  }

  // Verdades
  const truthSession = data.truth_sessions.some((s) => s.date === date && s.completed);
  breakdown.verdades = truthSession ? 1 : 0;
  if (truthSession) reasons_up.push("Completaste sesión de verdades");
  else reasons_down.push("No registraste sesión de verdades (mañana/mediodía/noche)");

  // Palabra
  const scripture = data.scripture_logs.find((s) => s.date === date && s.done);
  breakdown.palabra = scripture ? 1 : 0;
  if (scripture) reasons_up.push("Leíste y marcaste la Palabra");
  else reasons_down.push("No marcaste la lectura de la Palabra");

  // Lecturas
  const hasReadingLog = (data.reading_logs ?? []).some((l) => l.date === date);
  const hasLegacyNote = (data.reading ?? []).some(
    (r) => r.notes && r.updated_at && r.updated_at.slice(0, 10) === date
  );
  breakdown.lecturas = hasReadingLog || hasLegacyNote ? 1 : 0;
  if (breakdown.lecturas) reasons_up.push("Anotaste avance de lectura");
  else reasons_down.push("No registraste lectura de libros hoy");

  // Ejercicio
  const exercise = data.exercise_logs.some((e) => e.date === date);
  breakdown.ejercicio = exercise ? 1 : 0;
  if (exercise) reasons_up.push("Registraste ejercicio / cuerpo");
  else reasons_down.push("No registraste ejercicio (ni caminata)");

  // Propósito
  const tradingEnabled = tradingEnabledFor(data.profile.settings);
  const purposeLabel = purposeLabelFor(data.profile.settings).toLowerCase();
  const purpose = purposeForWeekday(weekdayIndex(date), tradingEnabled);
  let proposito = 0;
  if (purpose === "rest") {
    proposito = 1; // descanso cuenta como cumplido
    reasons_up.push("Día de descanso (propósito espiritual prioritario)");
  } else if (purpose === "software" || purpose === "light") {
    const s = data.software_sessions.some((x) => x.date === date);
    proposito = s ? 1 : 0;
    if (s) reasons_up.push(`Bloque de ${purposeLabel} registrado`);
    else reasons_down.push(`No registraste sesión de ${purposeLabel}`);
  } else if (purpose === "trading") {
    const t = data.trading_entries.some((x) => x.date === date);
    proposito = t ? 1 : 0;
    if (t) reasons_up.push("Journal de trading del día");
    else reasons_down.push("No registraste trading (ni ‘no operé’)");
  }
  breakdown.proposito = proposito;

  // Diario
  const journal = data.journal_entries.find((j) => j.date === date);
  const diarioOk = !!(journal && (journal.gracias || journal.verdad || journal.manana_hare));
  breakdown.diario = diarioOk ? 1 : 0;
  if (diarioOk) reasons_up.push("Escribiste el diario de 3 líneas");
  else reasons_down.push("Falta el diario de 3 líneas");

  let score = 0;
  score += breakdown.rutina * WEIGHTS.rutina;
  score += breakdown.verdades * WEIGHTS.verdades;
  score += breakdown.palabra * WEIGHTS.palabra;
  score += breakdown.lecturas * WEIGHTS.lecturas;
  score += breakdown.ejercicio * WEIGHTS.ejercicio;
  score += breakdown.proposito * WEIGHTS.proposito;
  score += breakdown.diario * WEIGHTS.diario;
  score = Math.round(Math.min(100, Math.max(0, score)));

  const delta = prevScore == null ? 0 : score - prevScore;

  // Limit reasons for UI
  return {
    date,
    score,
    delta,
    breakdown,
    reasons_up: reasons_up.slice(0, 6),
    reasons_down: reasons_down.slice(0, 6),
  };
}

export function recomputeAllScores(data: AppData, days = 30): DailyScore[] {
  const dates = new Set<string>();
  data.routines.forEach((r) => dates.add(r.date));
  data.truth_sessions.forEach((s) => dates.add(s.date));
  data.scripture_logs.forEach((s) => dates.add(s.date));
  data.exercise_logs.forEach((e) => dates.add(e.date));
  data.software_sessions.forEach((s) => dates.add(s.date));
  data.trading_entries.forEach((t) => dates.add(t.date));
  data.journal_entries.forEach((j) => dates.add(j.date));
  (data.reading_logs ?? []).forEach((l) => dates.add(l.date));

  // always include today
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dates.add(`${y}-${m}-${day}`);
  }

  const sorted = [...dates].sort();
  const scores: DailyScore[] = [];
  let prev: number | null = null;
  for (const date of sorted) {
    const s = computeDailyScore(data, date, prev);
    scores.push(s);
    prev = s.score;
  }
  return scores.slice(-days);
}
