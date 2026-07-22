"use client";

import type {
  AppData,
  Book,
  BookNote,
  ExerciseLog,
  JournalEntry,
  ReadingLog,
  SoftwareSession,
  SoftwareWeekly,
  TradingEntry,
} from "@/lib/types";
import { tryCreateClient } from "./client";
import { computeDailyScore } from "@/lib/scoring";
import { todayISO } from "@/lib/plan-calendar";
import { migrateData } from "@/lib/storage";

function mergeById<T extends { id: string }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();
  local.forEach((x) => map.set(x.id, x));
  remote.forEach((x) => map.set(x.id, x));
  return [...map.values()];
}

export async function pullCloudData(): Promise<AppData | null> {
  const sb = tryCreateClient();
  if (!sb) return null;
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  const userId = auth.user.id;

  const { data, error } = await sb
    .from("app_snapshots")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("pullCloudData", error);
    return null;
  }

  let app = data?.data ? migrateData(data.data as AppData) : null;
  if (!app) return null;

  try {
    const [
      booksRes,
      notesRes,
      logsRes,
      softSessRes,
      softWeekRes,
      tradeRes,
      exRes,
      jourRes,
    ] = await Promise.all([
      sb.from("books").select("*").eq("user_id", userId),
      sb.from("book_notes").select("*").eq("user_id", userId),
      sb.from("reading_logs").select("*").eq("user_id", userId),
      sb.from("software_sessions").select("*").eq("user_id", userId),
      sb.from("software_weekly").select("*").eq("user_id", userId),
      sb.from("trading_entries").select("*").eq("user_id", userId),
      sb.from("exercise_logs").select("*").eq("user_id", userId),
      sb.from("journal_entries").select("*").eq("user_id", userId),
    ]);

    if (booksRes.data?.length) {
      const books: Book[] = booksRes.data.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author ?? "",
        notes: b.notes ?? "",
        active: b.active ?? true,
        sort_order: b.sort_order ?? 0,
      }));
      app = { ...app, books: mergeById(app.books || [], books) };
    }

    if (notesRes.data?.length) {
      const book_notes: BookNote[] = notesRes.data.map((n) => ({
        id: n.id,
        book_id: n.book_id,
        content: n.content ?? "",
        created_at: n.created_at ?? new Date().toISOString(),
      }));
      app = {
        ...app,
        book_notes: mergeById(app.book_notes || [], book_notes).sort((a, b) =>
          b.created_at.localeCompare(a.created_at)
        ),
      };
    }

    if (logsRes.data?.length) {
      const reading_logs: ReadingLog[] = logsRes.data.map((l) => ({
        id: l.id,
        book_id: l.book_id,
        date: l.date,
        progress_label: l.progress_label ?? "",
        notes: l.notes ?? "",
        filter_keep: l.filter_keep ?? null,
      }));
      app = { ...app, reading_logs: mergeById(app.reading_logs || [], reading_logs) };
    }

    if (softSessRes.data?.length) {
      const software_sessions: SoftwareSession[] = softSessRes.data.map((s) => ({
        id: s.id,
        date: s.date,
        minutes: s.minutes ?? 0,
        deliverable: s.deliverable ?? "",
        notes: s.notes ?? "",
      }));
      app = {
        ...app,
        software_sessions: mergeById(app.software_sessions || [], software_sessions),
      };
    }

    if (softWeekRes.data?.length) {
      const software_weekly: SoftwareWeekly[] = softWeekRes.data.map((w) => ({
        id: w.id,
        week_start: w.week_start,
        deliverable_text: w.deliverable_text ?? "",
        done: !!w.done,
      }));
      // merge by week_start
      const map = new Map<string, SoftwareWeekly>();
      (app.software_weekly || []).forEach((w) => map.set(w.week_start, w));
      software_weekly.forEach((w) => map.set(w.week_start, w));
      app = { ...app, software_weekly: [...map.values()] };
    }

    if (tradeRes.data?.length) {
      const trading_entries: TradingEntry[] = tradeRes.data.map((t) => ({
        id: t.id,
        date: t.date,
        thesis: t.thesis ?? "",
        emotion: t.emotion ?? 0,
        result: t.result ?? "",
        lesson: t.lesson ?? "",
        skipped_reason: t.skipped_reason ?? "",
      }));
      app = {
        ...app,
        trading_entries: mergeById(app.trading_entries || [], trading_entries),
      };
    }

    if (exRes.data?.length) {
      const exercise_logs: ExerciseLog[] = exRes.data.map((e) => ({
        id: e.id,
        date: e.date,
        minutes: e.minutes ?? 0,
        circuit_done: !!e.circuit_done,
        walk_only: !!e.walk_only,
        rpe: e.rpe ?? 0,
        notes: e.notes ?? "",
      }));
      app = {
        ...app,
        exercise_logs: mergeById(app.exercise_logs || [], exercise_logs),
      };
    }

    if (jourRes.data?.length) {
      const journal_entries: JournalEntry[] = jourRes.data.map((j) => ({
        id: j.id,
        date: j.date,
        gracias: j.gracias ?? "",
        verdad: j.verdad ?? "",
        manana_hare: j.manana_hare ?? "",
        weekly_notes: j.weekly_notes ?? "",
      }));
      // merge by date
      const map = new Map<string, JournalEntry>();
      (app.journal_entries || []).forEach((j) => map.set(j.date, j));
      journal_entries.forEach((j) => map.set(j.date, j));
      app = { ...app, journal_entries: [...map.values()] };
    }
  } catch (e) {
    console.warn("pull module tables", e);
  }

  return app;
}

export async function pushCloudData(appData: AppData): Promise<{ ok: boolean; error?: string }> {
  const sb = tryCreateClient();
  if (!sb) return { ok: false, error: "Sin Supabase" };
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { ok: false, error: "Sin sesión" };
  const userId = auth.user.id;

  const today = todayISO();
  const prev = appData.daily_scores?.find((s) => s.date < today);
  const todayScore = computeDailyScore(appData, today, prev?.score ?? null);
  const otherScores = (appData.daily_scores ?? []).filter((s) => s.date !== today);
  const payload: AppData = {
    ...appData,
    book_notes: appData.book_notes ?? [],
    books: appData.books ?? [],
    reading_logs: appData.reading_logs ?? [],
    software_sessions: appData.software_sessions ?? [],
    software_weekly: appData.software_weekly ?? [],
    trading_entries: appData.trading_entries ?? [],
    exercise_logs: appData.exercise_logs ?? [],
    journal_entries: appData.journal_entries ?? [],
    daily_scores: [...otherScores, todayScore]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-45),
  };

  const { error } = await sb.from("app_snapshots").upsert({
    user_id: userId,
    data: payload,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };

  try {
    await syncAllModuleTables(userId, payload);
  } catch (e) {
    console.warn("syncAllModuleTables", e);
  }

  void sb.from("daily_scores").upsert(
    {
      user_id: userId,
      date: todayScore.date,
      score: todayScore.score,
      delta: todayScore.delta,
      breakdown: todayScore.breakdown,
      reasons_up: todayScore.reasons_up,
      reasons_down: todayScore.reasons_down,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" }
  );

  return { ok: true };
}

async function upsertRows(
  table: string,
  rows: Record<string, unknown>[],
  onConflict = "id"
) {
  if (!rows.length) return;
  const sb = tryCreateClient();
  if (!sb) return;
  const { error } = await sb.from(table).upsert(rows, { onConflict });
  if (error) console.warn(`${table} upsert`, error.message);
}

async function syncAllModuleTables(userId: string, app: AppData) {
  const books = (app.books ?? []).map((b) => ({
    id: b.id,
    user_id: userId,
    title: b.title,
    author: b.author || "",
    notes: b.notes || "",
    active: b.active !== false,
    sort_order: b.sort_order ?? 0,
    updated_at: new Date().toISOString(),
  }));
  await upsertRows("books", books);

  const bookNotes = (app.book_notes ?? []).map((n) => ({
    id: n.id,
    user_id: userId,
    book_id: n.book_id,
    content: n.content,
    created_at: n.created_at || new Date().toISOString(),
  }));
  await upsertRows("book_notes", bookNotes);

  const readingLogs = (app.reading_logs ?? []).map((l) => ({
    id: l.id,
    user_id: userId,
    book_id: l.book_id,
    date: l.date,
    progress_label: l.progress_label || "",
    notes: l.notes || "",
    filter_keep: l.filter_keep,
  }));
  await upsertRows("reading_logs", readingLogs);

  const softSess = (app.software_sessions ?? []).map((s) => ({
    id: s.id,
    user_id: userId,
    date: s.date,
    minutes: s.minutes || 0,
    deliverable: s.deliverable || "",
    notes: s.notes || "",
  }));
  await upsertRows("software_sessions", softSess);

  const softWeek = (app.software_weekly ?? []).map((w) => ({
    id: w.id,
    user_id: userId,
    week_start: w.week_start,
    deliverable_text: w.deliverable_text || "",
    done: !!w.done,
  }));
  // unique (user_id, week_start) — use id conflict
  await upsertRows("software_weekly", softWeek);

  const trading = (app.trading_entries ?? []).map((t) => ({
    id: t.id,
    user_id: userId,
    date: t.date,
    thesis: t.thesis || "",
    emotion: t.emotion || 0,
    result: t.result || "",
    lesson: t.lesson || "",
    skipped_reason: t.skipped_reason || "",
  }));
  await upsertRows("trading_entries", trading);

  const exercise = (app.exercise_logs ?? []).map((e) => ({
    id: e.id,
    user_id: userId,
    date: e.date,
    minutes: e.minutes || 0,
    circuit_done: !!e.circuit_done,
    walk_only: !!e.walk_only,
    rpe: e.rpe || 0,
    notes: e.notes || "",
  }));
  await upsertRows("exercise_logs", exercise);

  const journal = (app.journal_entries ?? []).map((j) => ({
    id: j.id,
    user_id: userId,
    date: j.date,
    gracias: j.gracias || "",
    verdad: j.verdad || "",
    manana_hare: j.manana_hare || "",
    weekly_notes: j.weekly_notes || "",
  }));
  await upsertRows("journal_entries", journal);
}
