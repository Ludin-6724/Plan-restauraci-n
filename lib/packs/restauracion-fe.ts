import { SEASON_PHRASE, SEED_TRUTHS, PHASE_MILESTONES } from "@/lib/seeds/content";
import type { ContentPack } from "./types";

const milestones = ([1, 2, 3] as const).flatMap((phase) =>
  PHASE_MILESTONES[phase].map((m) => ({
    phase,
    key: m.key,
    label: m.label,
  }))
);

/** Pack fundador: fe + Murphy + tu plan de restauración (contenido actual). */
export const PACK_RESTAURACION_FE: ContentPack = {
  id: "restauracion-fe",
  label: "Restauración con fe",
  blurb: "Identidad en Cristo, pánico, integridad y propósito.",
  description:
    "Tu pack actual: reprogramar el subconsciente con verdades, Palabra, santidad y propósito (software/trading). Ideal si tu fe es el ancla.",
  season_phrase: SEASON_PHRASE,
  truths: SEED_TRUTHS.map((t) => ({
    text: t.text,
    block: t.block,
    sort_order: t.sort_order,
  })),
  active_truth_count: 10,
  books: [
    {
      title: "El poder de la mente subconsciente",
      author: "Joseph Murphy",
      sort_order: 1,
    },
    {
      title: "Inteligencia emocional",
      author: "Daniel Goleman",
      sort_order: 2,
    },
  ],
  milestones,
  holiness_lines: [
    { text: "Pureza sexual e integridad en la mirada" },
    { text: "Honestidad total; sin dobles vidas" },
    { text: "Confesar rápido a Dios (y a un hermano de confianza si aplica)" },
  ],
  purpose_hint: "Software / trading / trabajo con sentido",
  block_labels: {
    A: "Identidad en Cristo",
    B: "Pánico y mente",
    C: "Santidad sin dualidad",
    D: "Propósito y provisión",
  },
};
