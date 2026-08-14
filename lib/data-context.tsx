"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createInitialData,
  exportDataJson,
  freshUserData,
  importDataJson,
  loadData,
  migrateData,
  resetAllData,
  saveData,
  uid,
} from "./storage";
import type {
  AppData,
  Book,
  BookNote,
  ExerciseLog,
  HolinessLog,
  ItemStatus,
  JournalEntry,
  PanicEpisode,
  Profile,
  ReadingLog,
  ReadingProgress,
  RoutineEntry,
  ScriptureLog,
  SoftwareSession,
  SoftwareWeekly,
  TradingEntry,
  TradingRules,
  Truth,
  TruthSession,
  StudyNote,
  VerseMark,
  WeeklyBoardCell,
} from "./types";
import type { RoutineBlock } from "./seeds/content";
import { ROUTINE_ITEMS } from "./seeds/content";
import { todayISO, weekStartISO } from "./plan-calendar";
import { applyDerivedSync } from "./derived-sync";
import { applyPackToData, type ContentPackId } from "./packs";
import { pullCloudData, pushCloudData } from "./supabase/cloud";
import { getUser, onAuthChange } from "./supabase/auth";
import type { User } from "@supabase/supabase-js";

interface DataContextValue {
  data: AppData;
  ready: boolean;
  user: User | null;
  cloudStatus: "idle" | "syncing" | "saved" | "error" | "offline";
  updateProfile: (patch: Partial<Profile> | ((p: Profile) => Profile)) => void;
  updateSettings: (patch: Partial<Profile["settings"]>) => void;
  setRoutineStatus: (date: string, itemKey: string, status: ItemStatus, notes?: string) => void;
  ensureDayRoutines: (date: string) => void;
  toggleTruthActive: (id: string) => void;
  addCustomTruth: (text: string, block: Truth["block"]) => void;
  updateTruth: (id: string, text: string) => void;
  deleteTruth: (id: string) => void;
  logTruthSession: (slot: TruthSession["slot"], truthIds: string[], reps: number) => void;
  saveScripture: (log: Omit<ScriptureLog, "id"> & { id?: string }) => void;
  addPanicEpisode: (ep: Omit<PanicEpisode, "id">) => void;
  updatePanicEpisode: (id: string, patch: Partial<PanicEpisode>) => void;
  deletePanicEpisode: (id: string) => void;
  saveJournal: (entry: Omit<JournalEntry, "id"> & { id?: string }) => void;
  addHolinessLine: (text: string) => void;
  removeHolinessLine: (id: string) => void;
  addHolinessLog: (log: Omit<HolinessLog, "id">) => void;
  addExercise: (log: Omit<ExerciseLog, "id">) => void;
  deleteExercise: (id: string) => void;
  addSoftwareSession: (s: Omit<SoftwareSession, "id">) => void;
  saveSoftwareWeekly: (w: Omit<SoftwareWeekly, "id"> & { id?: string }) => void;
  updateTradingRules: (rules: TradingRules) => void;
  addTradingEntry: (e: Omit<TradingEntry, "id">) => void;
  deleteTradingEntry: (id: string) => void;
  updateReading: (book: ReadingProgress["book_key"], patch: Partial<ReadingProgress>) => void;
  addBook: (title: string, author?: string) => void;
  updateBook: (id: string, patch: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  addBookNote: (bookId: string, content: string) => void;
  deleteBookNote: (id: string) => void;
  saveStudyNote: (bookKey: string, chapter: number, content: string) => void;
  saveVerseMark: (mark: Omit<VerseMark, "id" | "created_at"> & { id?: string }) => void;
  deleteVerseMark: (id: string) => void;
  addReadingLog: (log: Omit<ReadingLog, "id">) => void;
  deleteReadingLog: (id: string) => void;
  setBoardCell: (weekStart: string, day: string, pillar: string, checked: boolean, panicScore?: number | null) => void;
  toggleMilestone: (phase: number, key: string) => void;
  exportJson: () => string;
  importJson: (json: string) => void;
  resetAll: () => void;
  completeOnboarding: (
    name: string,
    planStart: string,
    packId?: string,
    focus?: { areas: string[]; primary: string; note: string },
    manual?: {
      truths: { text: string; block: Truth["block"] }[];
      seasonPhrase?: string;
      books?: { title: string; author: string }[];
      purposeLabel?: string;
      tradingEnabled?: boolean;
    }
  ) => void;
  forceSync: () => Promise<void>;
  refreshScores: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [cloudStatus, setCloudStatus] = useState<DataContextValue["cloudStatus"]>("offline");
  const syncTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = React.useRef(false);

  const dataRef = React.useRef<AppData | null>(null);
  const userIdRef = React.useRef<string | null>(null);
  const persistTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAuthId = React.useRef<string | null>(null);

  /** Persistencia diferida: por userId (no mezclar cuentas en el mismo navegador). */
  const schedulePersist = useCallback((next: AppData) => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    if (syncTimer.current) clearTimeout(syncTimer.current);

    // Capturar dueño al programar: si cambia la sesión, no escribir en la cuenta nueva
    const scheduledForUserId = userIdRef.current;
    const payload: AppData = {
      ...next,
      owner_user_id: scheduledForUserId ?? next.owner_user_id ?? null,
    };

    persistTimer.current = setTimeout(() => {
      // Solo si sigue siendo la misma cuenta
      if (userIdRef.current !== scheduledForUserId) return;
      try {
        saveData(payload, scheduledForUserId);
      } catch {
        /* quota */
      }
    }, 300);

    // Solo subir a la nube si hay sesión, es la misma cuenta y el plan ya pasó onboarding
    syncTimer.current = setTimeout(() => {
      if (!scheduledForUserId) return;
      if (userIdRef.current !== scheduledForUserId) return;
      if (!payload.profile.onboarding_done) return;
      setCloudStatus("syncing");
      void pushCloudData(payload).then((r) => {
        // Ignorar resultado si ya cambió de usuario
        if (userIdRef.current !== scheduledForUserId) return;
        setCloudStatus(r.ok ? "saved" : "error");
      });
    }, 2000);
  }, []);

  /**
   * Carga el plan de UN user:
   * 1) nube (RLS por auth.uid) gana
   * 2) local solo de ese userId
   * 3) si no hay nada → fresco + onboarding (nunca el plan de otro correo)
   */
  const hydrateForUser = useCallback(async (u: User) => {
    // Quitar del UI el plan del usuario anterior de inmediato
    if (persistTimer.current) clearTimeout(persistTimer.current);
    if (syncTimer.current) clearTimeout(syncTimer.current);

    userIdRef.current = u.id;
    dataRef.current = null;
    setData(null);
    setCloudStatus("syncing");
    hydrated.current = false;

    try {
      const remote = await pullCloudData();
      // Si cambió de cuenta mientras esperábamos la red, abortar
      if (userIdRef.current !== u.id) return;

      if (remote) {
        const migrated = migrateData(remote);
        // Defensa extra: si el snapshot trae dueño distinto, no usarlo
        if (migrated.owner_user_id && migrated.owner_user_id !== u.id) {
          const fresh = applyDerivedSync(freshUserData(u.id), todayISO());
          dataRef.current = fresh;
          setData(fresh);
          saveData(fresh, u.id);
          setCloudStatus("saved");
          hydrated.current = true;
          return;
        }
        const merged = applyDerivedSync(
          { ...migrated, owner_user_id: u.id },
          todayISO()
        );
        dataRef.current = merged;
        setData(merged);
        saveData(merged, u.id);
        setCloudStatus("saved");
        hydrated.current = true;
        return;
      }

      // Sin snapshot en nube: local SOLO de este userId.
      // claimLegacy una sola vez (tu plan pre-multi-usuario); correos nuevos no lo heredan.
      const localRaw = loadData(u.id, { claimLegacy: true });
      if (userIdRef.current !== u.id) return;

      // Si por error el local es de otro dueño o quedó “terminado” sin ser de este user → fresco
      let local = localRaw;
      if (local.owner_user_id && local.owner_user_id !== u.id) {
        local = freshUserData(u.id);
      }

      local = applyDerivedSync({ ...local, owner_user_id: u.id }, todayISO());
      dataRef.current = local;
      setData(local);
      saveData(local, u.id);

      // Solo subir si YA completó onboarding en ESTE dispositivo para ESTA cuenta
      if (local.profile.onboarding_done) {
        void pushCloudData(local).then((r) => {
          if (userIdRef.current !== u.id) return;
          setCloudStatus(r.ok ? "saved" : "error");
        });
      } else {
        setCloudStatus("saved");
      }
      hydrated.current = true;
    } catch {
      if (userIdRef.current !== u.id) return;
      setCloudStatus("error");
      const fallback = applyDerivedSync(freshUserData(u.id), todayISO());
      dataRef.current = fallback;
      setData(fallback);
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // No cargar un plan “global” antes de saber quién es el usuario
      const u = await getUser();
      if (cancelled) return;
      setUser(u);
      lastAuthId.current = u?.id ?? null;
      userIdRef.current = u?.id ?? null;

      if (u) {
        await hydrateForUser(u);
      } else {
        // Sin sesión: shell vacío (landing); no reutilizar plan de nadie
        const guest = freshUserData(null);
        dataRef.current = guest;
        setData(guest);
        setCloudStatus("offline");
        hydrated.current = true;
      }
    })();

    const unsub = onAuthChange((u) => {
      const id = u?.id ?? null;
      if (id === lastAuthId.current) {
        setUser(u);
        return;
      }
      // Cambio real de cuenta: limpiar timers y NO heredar datos del anterior
      if (persistTimer.current) clearTimeout(persistTimer.current);
      if (syncTimer.current) clearTimeout(syncTimer.current);

      lastAuthId.current = id;
      setUser(u);

      if (u) {
        void hydrateForUser(u);
      } else {
        userIdRef.current = null;
        dataRef.current = null;
        setData(null);
        // Shell de invitado (landing)
        const guest = freshUserData(null);
        dataRef.current = guest;
        setData(guest);
        setCloudStatus("offline");
        hydrated.current = true;
      }
    });

    return () => {
      cancelled = true;
      unsub();
      if (syncTimer.current) clearTimeout(syncTimer.current);
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [hydrateForUser]);

  const commit = useCallback(
    (updater: (prev: AppData) => AppData) => {
      setData((prev) => {
        const base = prev ?? dataRef.current ?? createInitialData();
        const updated = updater(base);
        // Si el updater no cambió nada (p. ej. ensureDayRoutines), evita trabajo pesado
        const next =
          updated === base ? applyDerivedSync(base, todayISO()) : applyDerivedSync(updated, todayISO());
        if (next === base) {
          dataRef.current = base;
          return base;
        }
        dataRef.current = next;
        if (hydrated.current) schedulePersist(next);
        return next;
      });
    },
    [schedulePersist]
  );

  const value = useMemo<DataContextValue | null>(() => {
    if (!data) return null;

    return {
      data,
      ready: true,
      user,
      cloudStatus,

      updateProfile: (patch) => {
        commit((prev) => ({
          ...prev,
          profile: typeof patch === "function" ? patch(prev.profile) : { ...prev.profile, ...patch },
        }));
      },

      updateSettings: (patch) => {
        commit((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            settings: { ...prev.profile.settings, ...patch },
          },
        }));
      },

      ensureDayRoutines: (date) => {
        // applyDerivedSync (en commit) crea filas y marca evidencia del día
        commit((prev) => prev);
      },

      setRoutineStatus: (date, itemKey, status, notes) => {
        commit((prev) => {
          const idx = prev.routines.findIndex((r) => r.date === date && r.item_key === itemKey);
          if (idx === -1) {
            const def = ROUTINE_ITEMS.find((i) => i.key === itemKey);
            if (!def) return prev;
            return {
              ...prev,
              routines: [
                ...prev.routines,
                {
                  id: uid(),
                  date,
                  item_key: itemKey,
                  block: def.block,
                  status,
                  notes: notes ?? "",
                },
              ],
            };
          }
          const routines = [...prev.routines];
          routines[idx] = {
            ...routines[idx],
            status,
            notes: notes !== undefined ? notes : routines[idx].notes,
          };
          return { ...prev, routines };
        });
      },

      toggleTruthActive: (id) => {
        commit((prev) => ({
          ...prev,
          truths: prev.truths.map((t) => (t.id === id ? { ...t, is_active: !t.is_active } : t)),
        }));
      },

      addCustomTruth: (text, block) => {
        commit((prev) => ({
          ...prev,
          truths: [
            ...prev.truths,
            {
              id: uid(),
              text,
              block,
              is_active: true,
              sort_order: prev.truths.length + 1,
              is_custom: true,
            },
          ],
        }));
      },

      updateTruth: (id, text) => {
        commit((prev) => ({
          ...prev,
          truths: prev.truths.map((t) => (t.id === id ? { ...t, text } : t)),
        }));
      },

      deleteTruth: (id) => {
        commit((prev) => ({
          ...prev,
          truths: prev.truths.filter((t) => t.id !== id),
        }));
      },

      deletePanicEpisode: (id) => {
        commit((prev) => ({
          ...prev,
          panic_episodes: prev.panic_episodes.filter((e) => e.id !== id),
        }));
      },

      deleteExercise: (id) => {
        commit((prev) => ({
          ...prev,
          exercise_logs: prev.exercise_logs.filter((e) => e.id !== id),
        }));
      },

      deleteTradingEntry: (id) => {
        commit((prev) => ({
          ...prev,
          trading_entries: prev.trading_entries.filter((e) => e.id !== id),
        }));
      },

      addBook: (title, author = "") => {
        commit((prev) => ({
          ...prev,
          books: [
            ...(prev.books || []),
            {
              id: uid(),
              title,
              author,
              notes: "",
              active: true,
              sort_order: (prev.books?.length || 0) + 1,
            },
          ],
        }));
      },

      updateBook: (id, patch) => {
        commit((prev) => ({
          ...prev,
          books: (prev.books || []).map((b) => (b.id === id ? { ...b, ...patch } : b)),
        }));
      },

      deleteBook: (id) => {
        commit((prev) => ({
          ...prev,
          books: (prev.books || []).filter((b) => b.id !== id),
          book_notes: (prev.book_notes || []).filter((n) => n.book_id !== id),
          reading_logs: (prev.reading_logs || []).filter((l) => l.book_id !== id),
        }));
      },

      addBookNote: (bookId, content) => {
        const note: BookNote = {
          id: uid(),
          book_id: bookId,
          content: content.trim(),
          created_at: new Date().toISOString(),
        };
        commit((prev) => ({
          ...prev,
          book_notes: [note, ...(prev.book_notes || [])],
        }));
      },

      deleteBookNote: (id) => {
        commit((prev) => ({
          ...prev,
          book_notes: (prev.book_notes || []).filter((n) => n.id !== id),
        }));
      },

      saveStudyNote: (bookKey, chapter, content) => {
        commit((prev) => {
          const notes = prev.study_notes || [];
          const existing = notes.find(
            (n) => n.book_key === bookKey && n.chapter === chapter
          );
          const stamp = new Date().toISOString();
          if (existing) {
            return {
              ...prev,
              study_notes: notes.map((n) =>
                n.id === existing.id ? { ...n, content, updated_at: stamp } : n
              ),
            };
          }
          const note: StudyNote = {
            id: uid(),
            book_key: bookKey,
            chapter,
            content,
            updated_at: stamp,
          };
          return { ...prev, study_notes: [note, ...notes] };
        });
      },

      saveVerseMark: (mark) => {
        commit((prev) => {
          const marks = prev.verse_marks || [];
          const existing = marks.find(
            (m) =>
              m.book_key === mark.book_key &&
              m.chapter === mark.chapter &&
              m.verse === mark.verse
          );
          // Sin subrayado ni comentario: eliminar la marca si existe
          if (!mark.color && !mark.comment.trim()) {
            return existing ? { ...prev, verse_marks: marks.filter((m) => m.id !== existing.id) } : prev;
          }
          if (existing) {
            return {
              ...prev,
              verse_marks: marks.map((m) =>
                m.id === existing.id ? { ...m, color: mark.color, comment: mark.comment } : m
              ),
            };
          }
          const entry: VerseMark = {
            id: mark.id ?? uid(),
            book_key: mark.book_key,
            chapter: mark.chapter,
            verse: mark.verse,
            color: mark.color,
            comment: mark.comment,
            created_at: new Date().toISOString(),
          };
          return { ...prev, verse_marks: [...marks, entry] };
        });
      },

      deleteVerseMark: (id) => {
        commit((prev) => ({
          ...prev,
          verse_marks: (prev.verse_marks || []).filter((m) => m.id !== id),
        }));
      },

      addReadingLog: (log) => {
        commit((prev) => ({
          ...prev,
          reading_logs: [{ id: uid(), ...log }, ...(prev.reading_logs || [])],
        }));
      },

      deleteReadingLog: (id) => {
        commit((prev) => ({
          ...prev,
          reading_logs: (prev.reading_logs || []).filter((l) => l.id !== id),
        }));
      },

      logTruthSession: (slot, truthIds, reps) => {
        const date = todayISO();
        commit((prev) => {
          const filtered = prev.truth_sessions.filter((s) => !(s.date === date && s.slot === slot));
          return {
            ...prev,
            truth_sessions: [
              ...filtered,
              {
                id: uid(),
                date,
                slot,
                completed: true,
                reps_total: reps,
                truth_ids: truthIds,
              },
            ],
          };
        });
      },

      saveScripture: (log) => {
        commit((prev) => {
          const existing = prev.scripture_logs.find((s) => s.date === log.date);
          if (existing) {
            return {
              ...prev,
              scripture_logs: prev.scripture_logs.map((s) =>
                s.date === log.date
                  ? {
                      ...s,
                      passage_key: log.passage_key,
                      done: log.done,
                      highlight_phrase: log.highlight_phrase,
                    }
                  : s
              ),
            };
          }
          return {
            ...prev,
            scripture_logs: [
              ...prev.scripture_logs,
              {
                id: log.id ?? uid(),
                date: log.date,
                passage_key: log.passage_key,
                done: log.done,
                highlight_phrase: log.highlight_phrase,
              },
            ],
          };
        });
      },

      addPanicEpisode: (ep) => {
        commit((prev) => ({
          ...prev,
          panic_episodes: [{ id: uid(), ...ep }, ...prev.panic_episodes],
        }));
      },

      updatePanicEpisode: (id, patch) => {
        commit((prev) => ({
          ...prev,
          panic_episodes: prev.panic_episodes.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        }));
      },

      saveJournal: (entry) => {
        commit((prev) => {
          const existing = prev.journal_entries.find((j) => j.date === entry.date);
          if (existing) {
            return {
              ...prev,
              journal_entries: prev.journal_entries.map((j) =>
                j.date === entry.date
                  ? {
                      ...j,
                      gracias: entry.gracias,
                      verdad: entry.verdad,
                      manana_hare: entry.manana_hare,
                      weekly_notes: entry.weekly_notes,
                    }
                  : j
              ),
            };
          }
          return {
            ...prev,
            journal_entries: [
              ...prev.journal_entries,
              {
                id: entry.id ?? uid(),
                date: entry.date,
                gracias: entry.gracias,
                verdad: entry.verdad,
                manana_hare: entry.manana_hare,
                weekly_notes: entry.weekly_notes,
              },
            ],
          };
        });
      },

      addHolinessLine: (text) => {
        commit((prev) => ({
          ...prev,
          holiness_lines: [...prev.holiness_lines, { id: uid(), text, active: true }],
        }));
      },

      removeHolinessLine: (id) => {
        commit((prev) => ({
          ...prev,
          holiness_lines: prev.holiness_lines.filter((h) => h.id !== id),
        }));
      },

      addHolinessLog: (log) => {
        commit((prev) => ({
          ...prev,
          holiness_logs: [{ id: uid(), ...log }, ...prev.holiness_logs],
        }));
      },

      addExercise: (log) => {
        commit((prev) => ({
          ...prev,
          exercise_logs: [{ id: uid(), ...log }, ...prev.exercise_logs],
        }));
      },

      addSoftwareSession: (s) => {
        commit((prev) => ({
          ...prev,
          software_sessions: [{ id: uid(), ...s }, ...(prev.software_sessions ?? [])],
        }));
      },

      saveSoftwareWeekly: (w) => {
        commit((prev) => {
          const list = Array.isArray(prev.software_weekly) ? prev.software_weekly : [];
          const existing = list.find((x) => x.week_start === w.week_start);
          if (existing) {
            return {
              ...prev,
              software_weekly: list.map((x) =>
                x.week_start === w.week_start
                  ? {
                      ...x,
                      deliverable_text: w.deliverable_text,
                      done: w.done,
                    }
                  : x
              ),
            };
          }
          return {
            ...prev,
            software_weekly: [
              {
                id: w.id ?? uid(),
                week_start: w.week_start,
                deliverable_text: w.deliverable_text,
                done: w.done,
              },
              ...list,
            ],
          };
        });
      },

      updateTradingRules: (rules) => {
        commit((prev) => ({ ...prev, trading_rules: rules }));
      },

      addTradingEntry: (e) => {
        commit((prev) => ({
          ...prev,
          trading_entries: [{ id: uid(), ...e }, ...prev.trading_entries],
        }));
      },

      updateReading: (book, patch) => {
        commit((prev) => ({
          ...prev,
          reading: prev.reading.map((r) =>
            r.book_key === book
              ? { ...r, ...patch, updated_at: new Date().toISOString() }
              : r
          ),
        }));
      },

      setBoardCell: (weekStart, day, pillar, checked, panicScore = null) => {
        commit((prev) => {
          const idx = prev.weekly_board.findIndex(
            (c) => c.week_start === weekStart && c.day === day && c.pillar === pillar
          );
          if (idx >= 0) {
            const weekly_board = [...prev.weekly_board];
            weekly_board[idx] = {
              ...weekly_board[idx],
              checked,
              panic_score: panicScore !== undefined ? panicScore : weekly_board[idx].panic_score,
            };
            return { ...prev, weekly_board };
          }
          const cell: WeeklyBoardCell = {
            id: uid(),
            week_start: weekStart,
            day,
            pillar,
            checked,
            panic_score: panicScore ?? null,
          };
          return { ...prev, weekly_board: [...prev.weekly_board, cell] };
        });
      },

      toggleMilestone: (phase, key) => {
        commit((prev) => ({
          ...prev,
          phase_milestones: prev.phase_milestones.map((m) =>
            m.phase === phase && m.key === key
              ? {
                  ...m,
                  done: !m.done,
                  done_at: !m.done ? new Date().toISOString() : null,
                }
              : m
          ),
        }));
      },

      exportJson: () => exportDataJson(data),
      importJson: (json) => {
        const uid = userIdRef.current;
        const next = applyDerivedSync(importDataJson(json, uid), todayISO());
        dataRef.current = next;
        setData(next);
        schedulePersist(next);
      },
      resetAll: () => {
        const uid = userIdRef.current;
        const next = applyDerivedSync(resetAllData(uid), todayISO());
        dataRef.current = next;
        setData(next);
        schedulePersist(next);
      },
      completeOnboarding: (name, planStart, packId, focus, manual) => {
        commit((prev) => {
          // Solo al terminar onboarding se aplica pack (usuarios nuevos).
          // Cuentas ya iniciadas no pasan por aquí → contenido intacto.
          let next = prev;
          if (packId && !prev.profile.onboarding_done) {
            next = applyPackToData(prev, packId as ContentPackId);

            // Modo manual: el usuario escribió sus propias verdades/frase.
            // Se usa el pack solo como esqueleto (libros, hitos, líneas de santidad).
            if (manual?.truths?.length) {
              next = {
                ...next,
                truths: manual.truths.map((t, i) => ({
                  id: uid(),
                  text: t.text,
                  block: t.block,
                  is_active: true,
                  sort_order: i + 1,
                  is_custom: true,
                })),
              };
            }
            if (manual?.seasonPhrase?.trim()) {
              next = {
                ...next,
                profile: {
                  ...next.profile,
                  settings: {
                    ...next.profile.settings,
                    season_phrase: manual.seasonPhrase.trim(),
                  },
                },
              };
            }
            if (manual?.books?.length) {
              next = {
                ...next,
                books: manual.books.map((b, i) => ({
                  id: uid(),
                  title: b.title,
                  author: b.author,
                  notes: "",
                  active: true,
                  sort_order: i + 1,
                })),
              };
            }

            // Propósito y Trading: aplican a modo pack Y manual (no exclusivo de "manual").
            next = {
              ...next,
              profile: {
                ...next.profile,
                settings: {
                  ...next.profile.settings,
                  purpose_label: manual?.purposeLabel?.trim() || "Propósito",
                  trading_enabled: manual?.tradingEnabled ?? false,
                },
              },
            };
          }
          const owner = userIdRef.current ?? next.owner_user_id ?? null;
          return {
            ...next,
            owner_user_id: owner,
            profile: {
              ...next.profile,
              name,
              plan_start_date: planStart,
              onboarding_done: true,
              accepted_disclaimer: true,
              settings: {
                ...next.profile.settings,
                focus_areas: focus?.areas ?? next.profile.settings.focus_areas ?? [],
                primary_focus: focus?.primary ?? next.profile.settings.primary_focus ?? "",
                focus_note: focus?.note ?? next.profile.settings.focus_note ?? "",
              },
            },
          };
        });
      },

      forceSync: async () => {
        await new Promise((r) => setTimeout(r, 0));
        const current = dataRef.current ?? data;
        if (!current) return;
        const uid = userIdRef.current;
        setCloudStatus("syncing");
        try {
          saveData(current, uid);
        } catch {
          /* ignore */
        }
        if (!uid) {
          setCloudStatus("offline");
          return;
        }
        const r = await pushCloudData(current);
        setCloudStatus(r.ok ? "saved" : "error");
      },

      refreshScores: () => {
        // no-op liviano: el score de hoy se calcula en dashboard al vuelo
      },
    };
  }, [data, commit, user, cloudStatus]);

  // `value` is a memoized context object; the compiler conservatively taints it
  // because its callbacks use refs internally for persistence.
  // eslint-disable-next-line react-hooks/refs
  if (!value) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted bg-canvas">
        Cargando el bosque…
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe usarse dentro de DataProvider");
  return ctx;
}

export function useRoutineCompletion(date: string = todayISO()) {
  const { data } = useData();
  const day = data.routines.filter((r) => r.date === date);
  const total = ROUTINE_ITEMS.length;
  const done = day.filter((r) => r.status === "done" || r.status === "partial").length;
  const fullDone = day.filter((r) => r.status === "done").length;
  return {
    total,
    done,
    fullDone,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
}

export function useStreak() {
  const { data } = useData();
  // Simple streak: consecutive days ending today with >= 80% done
  let streak = 0;
  const byDate = new Map<string, RoutineEntry[]>();
  data.routines.forEach((r) => {
    const list = byDate.get(r.date) ?? [];
    list.push(r);
    byDate.set(r.date, list);
  });
  const d = new Date();
  for (let i = 0; i < 120; i++) {
    const iso = formatLocalDate(d);
    const list = byDate.get(iso) ?? [];
    const done = list.filter((r) => r.status === "done" || r.status === "partial").length;
    const pct = ROUTINE_ITEMS.length ? done / ROUTINE_ITEMS.length : 0;
    if (pct >= 0.8) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (i === 0) {
      // today incomplete doesn't break past streak check — stop
      break;
    } else {
      break;
    }
  }
  return streak;
}

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export { weekStartISO, todayISO };
