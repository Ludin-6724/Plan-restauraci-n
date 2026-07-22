import type { AppData } from "./types";
import { todayISO } from "./plan-calendar";
import { applyRoutineSync } from "./routine-sync";
import { applyBoardSyncForDate } from "./board-sync";
import { applyMilestonesSync } from "./milestones-sync";

/**
 * Alinea rutina del día, tablero e hitos.
 * Si nada cambia, devuelve la misma referencia `data` (sin re-render ni lag).
 */
export function applyDerivedSync(data: AppData, date: string = todayISO()): AppData {
  const a = applyRoutineSync(data, date);
  const b = applyBoardSyncForDate(a, date);
  const c = applyMilestonesSync(b);
  return c;
}
