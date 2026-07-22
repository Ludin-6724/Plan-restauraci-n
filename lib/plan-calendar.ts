import { differenceInCalendarDays, format, startOfWeek, addDays } from "date-fns";
import { es } from "date-fns/locale";

export type Phase = 1 | 2 | 3 | 4;

/**
 * Parsea "yyyy-MM-dd" como mediodía LOCAL (evita el bug de UTC de parseISO
 * que desplaza el día en zonas de América).
 */
export function parseLocalDate(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return new Date(iso);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return new Date(y, mo - 1, d, 12, 0, 0, 0);
}

/** Fecha de calendario local "yyyy-MM-dd" (desde Date o ISO con hora). */
export function toLocalISODate(input: Date | string): string {
  if (typeof input === "string") {
    const only = /^(\d{4}-\d{2}-\d{2})$/.exec(input.trim());
    if (only) return only[1];
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return input.slice(0, 10);
    return formatLocal(d);
  }
  return formatLocal(input);
}

function formatLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return formatLocal(new Date());
}

export function planDayNumber(planStartDate: string, onDate: string = todayISO()): number {
  const start = parseLocalDate(planStartDate);
  const on = parseLocalDate(onDate);
  return Math.max(1, differenceInCalendarDays(on, start) + 1);
}

export function phaseForDay(day: number): Phase {
  if (day <= 14) return 1;
  if (day <= 45) return 2;
  if (day <= 90) return 3;
  return 4;
}

export function phaseLabel(phase: Phase): string {
  switch (phase) {
    case 1:
      return "Fase 1 · Estabilizar (días 1–14)";
    case 2:
      return "Fase 2 · Construir (días 15–45)";
    case 3:
      return "Fase 3 · Fortalecer (días 46–90)";
    default:
      return "Más allá de 90 · Continuar con propósito";
  }
}

export function phaseRange(phase: Phase): string {
  if (phase === 1) return "1–14";
  if (phase === 2) return "15–45";
  if (phase === 3) return "46–90";
  return "91+";
}

export function weekStartISO(date: string = todayISO()): string {
  const d = parseLocalDate(date);
  const start = startOfWeek(d, { weekStartsOn: 1 });
  return formatLocal(start);
}

export function weekDates(weekStart: string): string[] {
  const start = parseLocalDate(weekStart);
  return Array.from({ length: 7 }, (_, i) => formatLocal(addDays(start, i)));
}

export function formatDisplayDate(iso: string): string {
  return format(parseLocalDate(iso), "EEEE d 'de' MMMM", { locale: es });
}

export function weekdayIndex(iso: string): number {
  // 0 = lunes … 6 = domingo
  const d = parseLocalDate(iso).getDay();
  return d === 0 ? 6 : d - 1;
}

/** true si `date` es estrictamente posterior a hoy (calendario local). */
export function isFutureDate(date: string, today: string = todayISO()): boolean {
  return date > today;
}
