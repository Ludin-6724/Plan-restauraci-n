import type { TruthBlock } from "@/lib/seeds/content";

export type ContentPackId = "restauracion-fe" | "reprogramar-calma";

export interface PackTruth {
  text: string;
  block: TruthBlock;
  sort_order: number;
  /** Cuántas activar al copiar el pack (por orden) */
}

export interface PackBook {
  title: string;
  author: string;
  sort_order: number;
}

export interface PackMilestone {
  phase: 1 | 2 | 3;
  key: string;
  label: string;
}

export interface PackHolinessLine {
  text: string;
}

export interface ContentPack {
  id: ContentPackId;
  label: string;
  description: string;
  /** Corto para chips de onboarding */
  blurb: string;
  season_phrase: string;
  truths: PackTruth[];
  /** Primeras N verdades activas al aplicar pack */
  active_truth_count: number;
  books: PackBook[];
  milestones: PackMilestone[];
  holiness_lines: PackHolinessLine[];
  purpose_hint: string;
  block_labels: Record<TruthBlock, string>;
}
