"use client";

import { todayISO } from "./plan-calendar";
import type { AppData, Profile } from "./types";
import {
  applyPackToData,
  DEFAULT_PACK_ID,
  ensurePackMeta,
  getPack,
  type ContentPackId,
} from "./packs";

const STORAGE_PREFIX = "bosque-restauracion-v1";
/** Clave legacy global (pre multi-usuario). Solo se migra al primer user de esa sesión. */
const LEGACY_STORAGE_KEY = STORAGE_PREFIX;
export const DATA_VERSION = 2;

/** Cada cuenta de Supabase tiene su propio localStorage. */
export function storageKeyFor(userId: string | null | undefined): string {
  if (userId) return `${STORAGE_PREFIX}:u:${userId}`;
  return `${STORAGE_PREFIX}:guest`;
}

function uid(): string {
  return crypto.randomUUID();
}

export function defaultProfile(): Profile {
  const pack = getPack(DEFAULT_PACK_ID);
  return {
    id: uid(),
    name: "",
    plan_start_date: todayISO(),
    onboarding_done: false,
    accepted_disclaimer: false,
    settings: {
      audio_muted: true,
      audio_volume: 0.25,
      audio_scene: "bosque",
      theme: "bosque",
      software_route: "",
      trust_contact_name: "",
      trust_contact_note: "",
      no_preach_for_now: true,
      sleep_goal: "22:30",
      panic_skip_trade_threshold: 7,
      content_pack_id: pack.id,
      season_phrase: pack.season_phrase,
      focus_areas: [],
      primary_focus: "",
      focus_note: "",
      purpose_label: "",
      trading_enabled: true,
    },
  };
}

/**
 * Datos iniciales vacíos + pack por defecto (solo plantilla).
 * Siempre onboarding_done: false → el test de bienvenida se muestra.
 */
export function createInitialData(packId: ContentPackId = DEFAULT_PACK_ID): AppData {
  const empty: AppData = {
    version: DATA_VERSION,
    owner_user_id: null,
    profile: defaultProfile(),
    truths: [],
    routines: [],
    truth_sessions: [],
    scripture_logs: [],
    panic_episodes: [],
    journal_entries: [],
    holiness_lines: [],
    holiness_logs: [],
    exercise_logs: [],
    software_sessions: [],
    software_weekly: [],
    trading_rules: {
      max_daily_loss: 0,
      max_weekly_loss: 0,
      rules_text:
        "No opero con pánico alto o sin dormir bien.\nRespeto el tamaño de posición.\nJournal de cada operación.",
    },
    trading_entries: [],
    reading: [],
    books: [],
    book_notes: [],
    reading_logs: [],
    daily_scores: [],
    weekly_board: [],
    phase_milestones: [],
  };
  return applyPackToData(empty, packId);
}

/** Datos frescos para un correo que aún no tiene nada en la nube ni en local. */
export function freshUserData(userId?: string | null): AppData {
  const data = createInitialData();
  data.owner_user_id = userId ?? null;
  // Plantilla de pack sin “plan ya empezado”
  data.profile.onboarding_done = false;
  data.profile.accepted_disclaimer = false;
  data.profile.name = "";
  return data;
}

/** Migra datos v1 → v2 (books). Elimina módulos retirados (pastorado). */
export function migrateData(raw: AppData): AppData {
  const base = createInitialData();
  const data = { ...base, ...raw, version: DATA_VERSION };
  // Rellena claves de settings agregadas en versiones posteriores para perfiles antiguos.
  data.profile = {
    ...base.profile,
    ...raw.profile,
    settings: { ...base.profile.settings, ...raw.profile?.settings },
  };
  // Pack meta sin tocar verdades existentes (tu cuenta intacta)
  const withPack = ensurePackMeta(data);
  Object.assign(data, withPack);
  data.profile = withPack.profile;
  // Conservar dueño si venía en el snapshot
  if (typeof raw.owner_user_id === "string") {
    data.owner_user_id = raw.owner_user_id;
  }
  // Focos de plan (defaults seguros)
  if (!Array.isArray(data.profile.settings.focus_areas)) {
    data.profile.settings.focus_areas = [];
  }
  if (typeof data.profile.settings.primary_focus !== "string") {
    data.profile.settings.primary_focus = "";
  }
  if (typeof data.profile.settings.focus_note !== "string") {
    data.profile.settings.focus_note = "";
  }
  // Sección Pastorado eliminada: no persistir en nuevos guardados
  delete (data as { pastoring?: unknown }).pastoring;
  if (Array.isArray(data.phase_milestones)) {
    data.phase_milestones = data.phase_milestones.filter((m) => m.key !== "carta_cierre");
  }
  if (!data.books || data.books.length === 0) {
    data.books = base.books;
    // migrate legacy reading entries into books if titles known
    if (raw.reading?.length) {
      raw.reading.forEach((r) => {
        const title =
          r.book_key === "murphy"
            ? "El poder de la mente subconsciente"
            : r.book_key === "ie"
              ? "Inteligencia emocional"
              : r.book_key;
        let book = data.books.find((b) => b.title === title);
        if (!book) {
          book = {
            id: uid(),
            title,
            author: "",
            notes: "",
            active: true,
            sort_order: data.books.length + 1,
          };
          data.books.push(book);
        }
        if (r.notes || r.progress_label) {
          data.reading_logs = data.reading_logs || [];
          data.reading_logs.push({
            id: uid(),
            book_id: book.id,
            date: r.updated_at?.slice(0, 10) || todayISO(),
            progress_label: r.progress_label,
            notes: r.notes,
            filter_keep: r.filter_keep,
          });
        }
      });
    }
  }
  if (!data.reading_logs) data.reading_logs = [];
  if (!Array.isArray(data.book_notes)) data.book_notes = [];
  if (!data.daily_scores) data.daily_scores = [];
  if (!data.reading) data.reading = [];
  if (!Array.isArray(data.books)) data.books = base.books;
  if (!Array.isArray(data.software_sessions)) data.software_sessions = [];
  if (!Array.isArray(data.software_weekly)) data.software_weekly = [];
  if (!Array.isArray(data.exercise_logs)) data.exercise_logs = [];
  if (!Array.isArray(data.trading_entries)) data.trading_entries = [];
  return data;
}

const LEGACY_CLAIMED_KEY = `${STORAGE_PREFIX}:legacy-claimed`;

/**
 * Si el snapshot pertenece a otro userId, no se reutiliza.
 * Snapshots sin owner (antiguos) se aceptan solo bajo la clave de ese user
 * o en claim legacy controlado.
 */
function isOwnedBy(data: AppData, userId: string | null | undefined): boolean {
  if (!userId) return !data.owner_user_id;
  if (!data.owner_user_id) return true; // legacy sin marca: se estampa al guardar
  return data.owner_user_id === userId;
}

function stampOwner(data: AppData, userId: string | null | undefined): AppData {
  if (!userId) return { ...data, owner_user_id: data.owner_user_id ?? null };
  return { ...data, owner_user_id: userId };
}

/**
 * ¿Se puede migrar el plan global antiguo a este userId?
 * - Solo una vez
 * - Nunca si ya hay otras cuentas con datos en este navegador
 *   (evita que un correo de prueba se quede con tu dashboard)
 */
function canClaimLegacy(userId: string): boolean {
  if (typeof window === "undefined") return false;
  const alreadyClaimed = localStorage.getItem(LEGACY_CLAIMED_KEY);
  if (alreadyClaimed) return alreadyClaimed === userId;
  if (!localStorage.getItem(LEGACY_STORAGE_KEY)) return false;

  const prefix = `${STORAGE_PREFIX}:u:`;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(prefix)) continue;
      // Ya hay al menos un plan por usuario → no regalar el legacy a un correo nuevo
      if (k !== storageKeyFor(userId)) return false;
    }
  } catch {
    return false;
  }
  return true;
}

/**
 * Carga datos del usuario.
 * - Nunca reutiliza el plan de otro correo.
 * - El snapshot legacy (clave sin userId) solo se asigna UNA vez y solo si
 *   no hay otras cuentas con datos en este navegador.
 */
export function loadData(userId?: string | null, opts?: { claimLegacy?: boolean }): AppData {
  if (typeof window === "undefined") return freshUserData(userId);
  const key = storageKeyFor(userId);
  try {
    let raw = localStorage.getItem(key);

    // Migración única: plan pre-multi-usuario → solo si es seguro (no robar a correos nuevos)
    if (!raw && userId && opts?.claimLegacy && canClaimLegacy(userId)) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        try {
          const legacyParsed = JSON.parse(legacy) as AppData;
          if (isOwnedBy(legacyParsed, userId)) {
            const claimed = stampOwner(migrateData(legacyParsed), userId);
            localStorage.setItem(key, JSON.stringify(claimed));
            localStorage.setItem(LEGACY_CLAIMED_KEY, userId);
            try {
              localStorage.removeItem(LEGACY_STORAGE_KEY);
            } catch {
              /* ignore */
            }
            raw = JSON.stringify(claimed);
          } else {
            localStorage.setItem(LEGACY_CLAIMED_KEY, "blocked-foreign");
          }
        } catch {
          /* legacy corrupto → fresco abajo */
        }
      }
    }

    if (!raw) {
      const initial = freshUserData(userId);
      saveData(initial, userId);
      return initial;
    }

    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.version) {
      const initial = freshUserData(userId);
      saveData(initial, userId);
      return initial;
    }

    const migrated = migrateData(parsed);

    // Defensa: datos de otro user bajo esta clave → descartar
    if (userId && migrated.owner_user_id && migrated.owner_user_id !== userId) {
      const initial = freshUserData(userId);
      saveData(initial, userId);
      return initial;
    }

    const owned = stampOwner(migrated, userId);
    saveData(owned, userId);
    return owned;
  } catch {
    const initial = freshUserData(userId);
    saveData(initial, userId);
    return initial;
  }
}

export function saveData(data: AppData, userId?: string | null): void {
  if (typeof window === "undefined") return;
  const stamped = stampOwner(data, userId);
  localStorage.setItem(storageKeyFor(userId), JSON.stringify(stamped));
}

export function exportDataJson(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importDataJson(json: string, userId?: string | null): AppData {
  const parsed = stampOwner(migrateData(JSON.parse(json) as AppData), userId);
  if (!parsed.profile || !parsed.truths) throw new Error("JSON inválido");
  saveData(parsed, userId);
  return parsed;
}

export function resetAllData(userId?: string | null): AppData {
  const initial = freshUserData(userId);
  saveData(initial, userId);
  return initial;
}

export { uid };
