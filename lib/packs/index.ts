import type { AppData, Book, PhaseMilestone, Truth } from "@/lib/types";
import { PACK_RESTAURACION_FE } from "./restauracion-fe";
import { PACK_REPROGRAMAR_CALMA } from "./reprogramar-calma";
import type { ContentPack, ContentPackId } from "./types";

export type { ContentPack, ContentPackId } from "./types";
export { PACK_RESTAURACION_FE, PACK_REPROGRAMAR_CALMA };

export const CONTENT_PACKS: ContentPack[] = [PACK_RESTAURACION_FE, PACK_REPROGRAMAR_CALMA];

export const DEFAULT_PACK_ID: ContentPackId = "restauracion-fe";

export function getPack(id: ContentPackId | string | undefined): ContentPack {
  return CONTENT_PACKS.find((p) => p.id === id) ?? PACK_RESTAURACION_FE;
}

function uid(): string {
  return crypto.randomUUID();
}

/** Aplica un pack: reemplaza verdades/libros/hitos/líneas de integridad + frase. Conserva historial. */
export function applyPackToData(data: AppData, packId: ContentPackId): AppData {
  const pack = getPack(packId);

  const truths: Truth[] = pack.truths.map((t, i) => ({
    id: uid(),
    text: t.text,
    block: t.block,
    is_active: i < pack.active_truth_count,
    sort_order: t.sort_order,
    is_custom: false,
  }));

  const books: Book[] = pack.books.map((b) => ({
    id: uid(),
    title: b.title,
    author: b.author,
    notes: "",
    active: true,
    sort_order: b.sort_order,
  }));

  const phase_milestones: PhaseMilestone[] = pack.milestones.map((m) => ({
    phase: m.phase,
    key: m.key,
    done: false,
    done_at: null,
  }));

  const holiness_lines = pack.holiness_lines.map((h) => ({
    id: uid(),
    text: h.text,
    active: true,
  }));

  return {
    ...data,
    truths,
    books,
    // Notas de libros viejos pueden quedar huérfanas; se limpian al cambiar pack en onboarding
    book_notes: [],
    reading_logs: [],
    phase_milestones,
    holiness_lines,
    profile: {
      ...data.profile,
      settings: {
        ...data.profile.settings,
        content_pack_id: pack.id,
        season_phrase: pack.season_phrase,
        software_route: data.profile.settings.software_route || pack.purpose_hint,
      },
    },
  };
}

/**
 * Solo rellena pack_id y season_phrase si faltan.
 * No toca verdades ni libros (protege tu cuenta actual).
 */
export function ensurePackMeta(data: AppData): AppData {
  const s = data.profile.settings;
  const packId = (s.content_pack_id as ContentPackId) || DEFAULT_PACK_ID;
  const pack = getPack(packId);
  const season = s.season_phrase?.trim() ? s.season_phrase : pack.season_phrase;

  if (s.content_pack_id === packId && s.season_phrase === season) {
    return data;
  }

  return {
    ...data,
    profile: {
      ...data.profile,
      settings: {
        ...s,
        content_pack_id: packId,
        season_phrase: season,
      },
    },
  };
}
