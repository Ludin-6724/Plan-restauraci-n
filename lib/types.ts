import type { RoutineBlock, TruthBlock } from "./seeds/content";

export type ItemStatus = "pending" | "done" | "partial" | "skipped";

export type SoundScene = "bosque" | "lluvia" | "rio" | "fuego" | "noche";

export type ThemeId =
  | "bosque"
  | "oceano"
  | "lavanda"
  | "atardecer"
  | "noche"
  | "arena"
  | "blanco";

export interface Profile {
  id: string;
  name: string;
  plan_start_date: string;
  onboarding_done: boolean;
  accepted_disclaimer: boolean;
  settings: {
    audio_muted: boolean;
    audio_volume: number;
    audio_scene: SoundScene;
    theme: ThemeId;
    software_route: string;
    trust_contact_name: string;
    trust_contact_note: string;
    no_preach_for_now: boolean;
    sleep_goal: string;
    panic_skip_trade_threshold: number;
    /** Plantilla de contenido (packs). No resetea datos al migrar. */
    content_pack_id: string;
    /** Frase de temporada en el panel Hoy (editable). */
    season_phrase: string;
    /** Áreas de problemática marcadas en onboarding (chips). */
    focus_areas: string[];
    /** Enfoque principal del plan (un FocusId). */
    primary_focus: string;
    /** Nota libre: “qué se me repite” (opcional). */
    focus_note: string;
    /** Etiqueta visible del módulo de propósito (nav, dashboard, tablero, scoring). */
    purpose_label: string;
    /** Si el módulo opcional de Trading está activo para este usuario. */
    trading_enabled: boolean;
  };
}

export interface Truth {
  id: string;
  text: string;
  block: TruthBlock;
  is_active: boolean;
  sort_order: number;
  is_custom: boolean;
}

export interface RoutineEntry {
  id: string;
  date: string;
  item_key: string;
  block: RoutineBlock;
  status: ItemStatus;
  notes: string;
}

export interface TruthSession {
  id: string;
  date: string;
  slot: "morning" | "mid" | "night";
  completed: boolean;
  reps_total: number;
  truth_ids: string[];
}

export interface ScriptureLog {
  id: string;
  date: string;
  passage_key: string;
  done: boolean;
  highlight_phrase: string;
}

export interface PanicEpisode {
  id: string;
  started_at: string;
  intensity_before: number;
  intensity_after: number | null;
  trigger: string;
  helped: string;
  notes: string;
  protocol_completed: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  gracias: string;
  verdad: string;
  manana_hare: string;
  weekly_notes: string;
}

export interface HolinessLine {
  id: string;
  text: string;
  active: boolean;
}

export interface HolinessLog {
  id: string;
  date: string;
  type: "confession" | "integrity";
  note: string;
}

export interface ExerciseLog {
  id: string;
  date: string;
  minutes: number;
  circuit_done: boolean;
  walk_only: boolean;
  rpe: number;
  notes: string;
}

export interface SoftwareSession {
  id: string;
  date: string;
  minutes: number;
  deliverable: string;
  notes: string;
}

export interface SoftwareWeekly {
  id: string;
  week_start: string;
  deliverable_text: string;
  done: boolean;
}

export interface TradingRules {
  max_daily_loss: number;
  max_weekly_loss: number;
  rules_text: string;
}

export interface TradingEntry {
  id: string;
  date: string;
  thesis: string;
  emotion: number;
  result: string;
  lesson: string;
  skipped_reason: string;
}

/** @deprecated prefer Book + ReadingLog */
export interface ReadingProgress {
  id: string;
  book_key: string;
  progress_label: string;
  notes: string;
  filter_keep: boolean | null;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  /** Resumen general del libro (opcional) */
  notes: string;
  active: boolean;
  sort_order: number;
}

/** Nota individual del libro, guardada en Supabase `book_notes` */
export interface BookNote {
  id: string;
  book_id: string;
  content: string;
  created_at: string;
}

export interface ReadingLog {
  id: string;
  book_id: string;
  date: string;
  progress_label: string;
  notes: string;
  filter_keep: boolean | null;
}

export interface WeeklyBoardCell {
  id: string;
  week_start: string;
  day: string;
  pillar: string;
  checked: boolean;
  panic_score: number | null;
}

export interface PhaseMilestone {
  phase: number;
  key: string;
  done: boolean;
  done_at: string | null;
}

export interface DailyScore {
  date: string;
  score: number;
  delta: number;
  breakdown: Record<string, number>;
  reasons_up: string[];
  reasons_down: string[];
}

export interface AppData {
  version: number;
  /**
   * Dueño del plan en este navegador (Supabase user id).
   * Evita que un correo vea el dashboard de otro en el mismo dispositivo.
   */
  owner_user_id?: string | null;
  profile: Profile;
  truths: Truth[];
  routines: RoutineEntry[];
  truth_sessions: TruthSession[];
  scripture_logs: ScriptureLog[];
  panic_episodes: PanicEpisode[];
  journal_entries: JournalEntry[];
  holiness_lines: HolinessLine[];
  holiness_logs: HolinessLog[];
  exercise_logs: ExerciseLog[];
  software_sessions: SoftwareSession[];
  software_weekly: SoftwareWeekly[];
  trading_rules: TradingRules;
  trading_entries: TradingEntry[];
  reading: ReadingProgress[];
  books: Book[];
  book_notes: BookNote[];
  reading_logs: ReadingLog[];
  daily_scores: DailyScore[];
  weekly_board: WeeklyBoardCell[];
  phase_milestones: PhaseMilestone[];
}
