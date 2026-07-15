import type { AppData, DailyScore } from "./types";
import { computeDailyScore } from "./scoring";
import { todayISO } from "./plan-calendar";

export type PillarKey =
  | "rutina"
  | "verdades"
  | "palabra"
  | "lecturas"
  | "ejercicio"
  | "proposito"
  | "diario";

export type PillarStatus = {
  key: PillarKey;
  label: string;
  href: string;
  done: boolean;
  /** 0–1 ratio for rutina; 0/1 for others */
  value: number;
};

const PILLARS: { key: PillarKey; label: string; href: string }[] = [
  { key: "rutina", label: "Rutina", href: "/rutina" },
  { key: "verdades", label: "Verdades", href: "/verdades" },
  { key: "palabra", label: "Palabra", href: "/palabra" },
  { key: "lecturas", label: "Lecturas", href: "/lecturas" },
  { key: "ejercicio", label: "Cuerpo", href: "/ejercicio" },
  { key: "proposito", label: "Propósito", href: "/software" },
  { key: "diario", label: "Diario", href: "/diario" },
];

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

/** Scores diarios para los últimos `days` días (reusa cache o calcula). */
export function scoresForLastDays(data: AppData, days = 14): DailyScore[] {
  const dates = lastNDates(days);
  const cached = new Map((data.daily_scores ?? []).map((s) => [s.date, s]));
  let prev: number | null = null;
  const out: DailyScore[] = [];
  for (const date of dates) {
    const hit = cached.get(date);
    if (hit) {
      out.push(hit);
      prev = hit.score;
    } else {
      const s = computeDailyScore(data, date, prev);
      out.push(s);
      prev = s.score;
    }
  }
  return out;
}

export function averageScore(scores: DailyScore[]): number | null {
  if (!scores.length) return null;
  return Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length);
}

export function pillarStatus(score: DailyScore): PillarStatus[] {
  const b = score.breakdown || {};
  return PILLARS.map((p) => {
    const value = typeof b[p.key] === "number" ? b[p.key] : 0;
    const done = p.key === "rutina" ? value >= 0.8 : value >= 1;
    // Propósito en día software/trading: enlace según breakdown no disponible — default software
    // Propósito: /software es la ruta interna del pilar genérico de propósito
    // (el nombre visible se resuelve aparte con purposeLabelFor).
    const href = p.key === "proposito" ? "/software" : p.href;
    return { ...p, href, done, value };
  });
}

/** Mapea un reason_down a una ruta de acción prioritaria. */
export function primaryActionFromReasons(
  reasons: string[],
  purposeHref: string = "/software",
  purposeLabel: string = "Software"
): { href: string; label: string } {
  const text = reasons.join(" ").toLowerCase();
  if (text.includes("rutina")) return { href: "/rutina", label: "Ir a la rutina" };
  if (text.includes("verdad")) return { href: "/verdades", label: "Sesión de verdades" };
  if (text.includes("palabra")) return { href: "/palabra", label: "Marcar la Palabra" };
  if (text.includes("ejercicio") || text.includes("cuerpo") || text.includes("caminata"))
    return { href: "/ejercicio", label: "Registrar cuerpo" };
  if (text.includes("trading")) return { href: "/trading", label: "Journal de trading" };
  if (text.includes(purposeLabel.toLowerCase()))
    return { href: purposeHref, label: `Bloque de ${purposeLabel}` };
  if (text.includes("diario")) return { href: "/diario", label: "Escribir el diario" };
  if (text.includes("lectura")) return { href: "/lecturas", label: "Notas de lectura" };
  return { href: "/rutina", label: "Ir a la rutina" };
}

export function scoreBarClass(score: number): string {
  if (score >= 75) return "spark-bar spark-bar--good";
  if (score >= 45) return "spark-bar spark-bar--mid";
  return "spark-bar spark-bar--low";
}
