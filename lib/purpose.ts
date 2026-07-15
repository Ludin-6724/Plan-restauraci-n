import type { Profile } from "./types";

/** Etiqueta que ven las cuentas anteriores a este campo (comportamiento idéntico al actual). */
export const DEFAULT_PURPOSE_LABEL = "Software";

export function purposeLabelFor(settings: Profile["settings"]): string {
  return settings.purpose_label?.trim() || DEFAULT_PURPOSE_LABEL;
}

/** `undefined` (cuentas anteriores a este campo) cuenta como activo. */
export function tradingEnabledFor(settings: Profile["settings"]): boolean {
  return settings.trading_enabled !== false;
}
