"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useData } from "@/lib/data-context";
import { PASSAGES } from "@/lib/seeds/content";
import {
  BIBLE_VERSION_LABELS,
  CHAPTERS,
  type BibleVersion,
} from "@/lib/seeds/bible-chapters";
import {
  EPHESIANS,
  EPHESIANS_BOOK_KEY,
  EPHESIANS_CHAPTER_COUNT,
  EPHESIANS_INTRO,
} from "@/lib/seeds/ephesians";
import { todayISO, weekdayIndex } from "@/lib/plan-calendar";
import { GlassCard, PageHeader, PrimaryButton, SecondaryButton, TextArea } from "@/components/ui/Glass";
import { ArchiveItem, ArchiveSection, SaveBanner } from "@/components/ui/Archive";
import { usePersist } from "@/lib/use-persist";
import { NotesEditor } from "@/components/palabra/NotesEditor";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

const VERSION_STORAGE_KEY = "bosque.bibleVersion";

type ReaderView = BibleVersion | "paralela";

const HIGHLIGHTS: { key: string; label: string; swatch: string; verse: string }[] = [
  { key: "yellow", label: "Amarillo", swatch: "bg-yellow-300", verse: "bg-yellow-200/80" },
  { key: "green", label: "Verde", swatch: "bg-green-300", verse: "bg-green-200/80" },
  { key: "blue", label: "Azul", swatch: "bg-sky-300", verse: "bg-sky-200/80" },
  { key: "pink", label: "Rosa", swatch: "bg-pink-300", verse: "bg-pink-200/80" },
];

function highlightClass(color: string): string {
  return HIGHLIGHTS.find((h) => h.key === color)?.verse ?? "";
}

function loadView(): ReaderView {
  if (typeof window === "undefined") return "rvr1960";
  try {
    const v = localStorage.getItem(VERSION_STORAGE_KEY);
    if (v === "ntv" || v === "rvr1960" || v === "paralela") return v;
  } catch {
    /* ignore */
  }
  return "rvr1960";
}

export default function PalabraPage() {
  const {
    data,
    saveScripture,
    saveStudyNote,
    saveVerseMark,
    cloudStatus,
  } = useData();
  const { persist, msg, busy } = usePersist();
  const date = todayISO();
  const dayIdx = weekdayIndex(date);
  const passage = PASSAGES.find((p) => p.dayIndex === dayIdx) ?? PASSAGES[0];
  const chapter = CHAPTERS[passage.key];
  const existing = data.scripture_logs.find((s) => s.date === date);
  const [phrase, setPhrase] = useState("");
  const [done, setDone] = useState(!!existing?.done);

  /* ---------- Estudio: estado ---------- */
  const [chapterNum, setChapterNum] = useState(1);
  const [view, setView] = useState<ReaderView>("rvr1960");
  const [mobilePanel, setMobilePanel] = useState<"biblia" | "notas">("biblia");
  const [introOpen, setIntroOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteDirty, setNoteDirty] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setView(loadView());
  }, []);

  const selectView = (v: ReaderView) => {
    setView(v);
    try {
      localStorage.setItem(VERSION_STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const chapterVerses = EPHESIANS[chapterNum];

  const marksForChapter = useMemo(
    () =>
      (data.verse_marks || []).filter(
        (m) => m.book_key === EPHESIANS_BOOK_KEY && m.chapter === chapterNum
      ),
    [data.verse_marks, chapterNum]
  );
  const markFor = (verse: number) => marksForChapter.find((m) => m.verse === verse);

  const savedNote = useMemo(
    () =>
      (data.study_notes || []).find(
        (n) => n.book_key === EPHESIANS_BOOK_KEY && n.chapter === chapterNum
      ),
    [data.study_notes, chapterNum]
  );

  // Cargar nota del capítulo al cambiar de capítulo o llegar data de la nube
  useEffect(() => {
    setNoteText(savedNote?.content ?? "");
    setNoteDirty(false);
    setSelectedVerse(null);
    setCommentDraft("");
  }, [chapterNum, savedNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Autosave de notas con debounce (commit ya sincroniza local + nube)
  const onNoteChange = (v: string) => {
    setNoteText(v);
    setNoteDirty(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveStudyNote(EPHESIANS_BOOK_KEY, chapterNum, v);
      setNoteDirty(false);
    }, 900);
  };
  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const selectedMark = selectedVerse != null ? markFor(selectedVerse) : undefined;
  useEffect(() => {
    setCommentDraft(selectedMark?.comment ?? "");
  }, [selectedVerse]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyHighlight = (color: string) => {
    if (selectedVerse == null) return;
    saveVerseMark({
      book_key: EPHESIANS_BOOK_KEY,
      chapter: chapterNum,
      verse: selectedVerse,
      color,
      comment: selectedMark?.comment ?? "",
    });
  };

  const saveComment = () => {
    if (selectedVerse == null) return;
    saveVerseMark({
      book_key: EPHESIANS_BOOK_KEY,
      chapter: chapterNum,
      verse: selectedVerse,
      color: selectedMark?.color ?? "",
      comment: commentDraft,
    });
  };

  /* ---------- Historial de frases ---------- */
  const history = useMemo(
    () =>
      [...data.scripture_logs]
        .filter((s) => s.done || s.highlight_phrase)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.scripture_logs]
  );

  const planVerses = chapter?.versions[view === "paralela" ? "rvr1960" : view] ?? [];

  const noteStatus = noteDirty
    ? "Escribiendo…"
    : cloudStatus === "syncing"
      ? "Guardando…"
      : cloudStatus === "saved"
        ? "Guardado ✓"
        : savedNote
          ? "Guardado ✓"
          : "";

  const verseRow = (n: number, text: string, versionTag?: string) => {
    const mark = markFor(n);
    const selected = selectedVerse === n;
    return (
      <p
        key={`${versionTag ?? "v"}-${n}`}
        onClick={() => setSelectedVerse(selected ? null : n)}
        className={`leading-[1.75] text-[15px] sm:text-base text-black rounded-md px-1 -mx-1 cursor-pointer transition ${
          mark?.color ? highlightClass(mark.color) : ""
        } ${selected ? "ring-2 ring-primary/60" : "hover:bg-black/5"}`}
      >
        <sup className="mr-1.5 text-[11px] font-semibold text-black/45 select-none">{n}</sup>
        {text}
        {mark?.comment ? (
          <MessageSquare size={12} className="inline-block ml-1.5 -mt-0.5 text-primary" />
        ) : null}
      </p>
    );
  };

  const verseEditor = selectedVerse != null && (
    <div className="sticky bottom-0 mt-3 rounded-xl border border-primary/30 bg-surface-raised p-3 space-y-2.5 shadow-lg">
      <p className="text-xs font-semibold text-ink">
        Efesios {chapterNum}:{selectedVerse}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-muted uppercase tracking-wide">Subrayar</span>
        {HIGHLIGHTS.map((h) => (
          <button
            key={h.key}
            type="button"
            title={h.label}
            aria-label={`Subrayar en ${h.label}`}
            onClick={() => applyHighlight(h.key)}
            className={`w-7 h-7 rounded-full ${h.swatch} border-2 transition ${
              selectedMark?.color === h.key ? "border-ink scale-110" : "border-transparent"
            }`}
          />
        ))}
        {selectedMark?.color && (
          <button
            type="button"
            onClick={() => applyHighlight("")}
            className="text-xs text-muted underline underline-offset-2 hover:text-ink"
          >
            Quitar subrayado
          </button>
        )}
      </div>
      <textarea
        className="input-field min-h-[64px] !text-sm"
        rows={2}
        placeholder="Comentario sobre este versículo…"
        value={commentDraft}
        onChange={(e) => setCommentDraft(e.target.value)}
      />
      <div className="flex gap-2">
        <PrimaryButton onClick={saveComment}>Guardar comentario</PrimaryButton>
        <SecondaryButton onClick={() => setSelectedVerse(null)}>Cerrar</SecondaryButton>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Palabra · Estudio"
        subtitle="Estudio de Efesios: lee, subraya, comenta y toma notas. Todo queda guardado."
      />

      {/* Contexto e introducción */}
      <GlassCard className="space-y-3">
        <button
          type="button"
          onClick={() => setIntroOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 text-left"
          aria-expanded={introOpen}
        >
          <div>
            <h2 className="text-base font-semibold text-ink">{EPHESIANS_INTRO.title}</h2>
            <p className="text-xs text-muted">Autor, propósito, temas y bosquejo del libro</p>
          </div>
          {introOpen ? (
            <ChevronUp size={18} className="text-muted shrink-0" />
          ) : (
            <ChevronDown size={18} className="text-muted shrink-0" />
          )}
        </button>
        {introOpen && (
          <div className="space-y-3 text-sm text-ink leading-relaxed border-t border-line pt-3">
            <p>
              <span className="font-medium">Autor y fecha: </span>
              {EPHESIANS_INTRO.author}
            </p>
            <p>
              <span className="font-medium">Destinatarios: </span>
              {EPHESIANS_INTRO.audience}
            </p>
            <p>
              <span className="font-medium">Propósito: </span>
              {EPHESIANS_INTRO.purpose}
            </p>
            <div>
              <p className="font-medium mb-1">Temas clave</p>
              <ul className="list-disc pl-5 space-y-0.5 text-muted">
                {EPHESIANS_INTRO.themes.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Bosquejo</p>
              <ul className="space-y-0.5 text-muted">
                {EPHESIANS_INTRO.outline.map((o) => (
                  <li key={o.ch}>
                    <span className="text-primary font-medium">Cap. {o.ch}:</span> {o.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Selector de capítulo */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted uppercase tracking-wide">Efesios</span>
        <div className="inline-flex rounded-xl border border-line bg-surface-soft p-0.5">
          {Array.from({ length: EPHESIANS_CHAPTER_COUNT }, (_, i) => i + 1).map((c) => {
            const active = chapterNum === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setChapterNum(c)}
                className={`w-9 py-1.5 text-sm rounded-[10px] transition-colors ${
                  active
                    ? "bg-primary font-semibold shadow-sm"
                    : "text-muted hover:text-ink hover:bg-surface-raised/60"
                }`}
                style={active ? { color: "var(--on-primary, #fff)" } : undefined}
                aria-pressed={active}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggle móvil Notas / Biblia */}
      <div className="lg:hidden inline-flex rounded-xl border border-line bg-surface-soft p-0.5">
        {(["biblia", "notas"] as const).map((p) => {
          const active = mobilePanel === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setMobilePanel(p)}
              className={`px-4 py-1.5 text-sm rounded-[10px] transition-colors ${
                active
                  ? "bg-primary font-semibold shadow-sm"
                  : "text-muted hover:text-ink hover:bg-surface-raised/60"
              }`}
              style={active ? { color: "var(--on-primary, #fff)" } : undefined}
              aria-pressed={active}
            >
              {p === "biblia" ? "Biblia" : "Mis notas"}
            </button>
          );
        })}
      </div>

      {/* Área de estudio: Biblia + notas */}
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        {/* Biblia */}
        <GlassCard
          className={`space-y-3 ${mobilePanel === "biblia" ? "" : "hidden"} lg:block`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">Efesios {chapterNum}</h3>
            <div className="inline-flex rounded-xl border border-line bg-surface-soft p-0.5">
              {(["rvr1960", "ntv", "paralela"] as const).map((v) => {
                const active = view === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => selectView(v)}
                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-[10px] transition-colors ${
                      active
                        ? "bg-primary font-semibold shadow-sm"
                        : "text-muted hover:text-ink hover:bg-surface-raised/60"
                    }`}
                    style={active ? { color: "var(--on-primary, #fff)" } : undefined}
                    aria-pressed={active}
                  >
                    {v === "paralela" ? "Paralela" : BIBLE_VERSION_LABELS[v]}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-subtle">
            Toca un versículo para subrayarlo o comentarlo.
          </p>
          <div
            className="bible-reader rounded-xl border border-black/10 bg-white px-3.5 py-4 sm:px-5 sm:py-5 max-h-[min(70vh,40rem)] overflow-y-auto"
            style={{ WebkitOverflowScrolling: "touch", color: "#111111" }}
          >
            {view === "paralela" ? (
              <div className="space-y-3">
                {chapterVerses.rvr1960.map((rv, i) => (
                  <div key={rv.n} className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-black/40 mb-0.5">
                        RVR 1960
                      </p>
                      {verseRow(rv.n, rv.t, "rvr")}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-black/40 mb-0.5">
                        NTV
                      </p>
                      {verseRow(rv.n, chapterVerses.ntv[i]?.t ?? "", "ntv")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] uppercase tracking-wider font-medium mb-2 text-black/55">
                  Efesios {chapterNum} · {BIBLE_VERSION_LABELS[view]}
                </p>
                {chapterVerses[view].map((v) => verseRow(v.n, v.t))}
              </div>
            )}
            <p className="mt-4 pt-3 border-t border-black/10 text-[10px] text-black/40 leading-snug">
              Reina-Valera 1960 © Sociedades Bíblicas Unidas. Nueva Traducción Viviente (NTV) ©
              Tyndale House Foundation. Uso personal de meditación.
            </p>
            {verseEditor}
          </div>
        </GlassCard>

        {/* Notas */}
        <GlassCard
          className={`space-y-3 ${mobilePanel === "notas" ? "" : "hidden"} lg:block`}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">
              Mis notas · Efesios {chapterNum}
            </h3>
            {noteStatus && <span className="text-[11px] text-primary-bright">{noteStatus}</span>}
          </div>
          <NotesEditor
            value={noteText}
            onChange={onNoteChange}
            placeholder="Escribe aquí tus notas de estudio de este capítulo: qué te dice Dios, qué no entiendes, qué vas a aplicar… Usa la barra de formato. Se guardan solas."
          />
          <p className="text-[11px] text-subtle">
            Las notas son por capítulo y se guardan automáticamente en tu nube.
          </p>
        </GlassCard>
      </div>

      {/* Lectura del plan de hoy (sin cambios de lógica) */}
      <GlassCard className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-primary uppercase tracking-wide font-medium">
              {passage.dayLabel} · {passage.focus}
            </p>
            <h2 className="text-xl font-semibold text-ink">{passage.title}</h2>
            <p className="text-sm text-muted">{passage.reference} · capítulo completo abajo</p>
          </div>
          {done && <span className="tag tag--ok shrink-0">Hoy leído</span>}
        </div>

        <div
          className="bible-reader rounded-xl border border-black/10 bg-white px-3.5 py-4 sm:px-5 sm:py-5 max-h-[min(50vh,28rem)] overflow-y-auto"
          style={{ WebkitOverflowScrolling: "touch", color: "#111111" }}
        >
          {planVerses.length === 0 ? (
            <p className="text-sm text-black/60">Texto no disponible para este pasaje.</p>
          ) : (
            <div className="space-y-2.5">
              {planVerses.map((v) => (
                <p key={v.n} className="leading-[1.75] text-[15px] sm:text-base text-black">
                  <sup className="mr-1.5 text-[11px] font-semibold text-black/45 select-none">
                    {v.n}
                  </sup>
                  {v.t}
                </p>
              ))}
            </div>
          )}
        </div>

        <TextArea
          label="Frase que se me quedó / verdad del día"
          value={phrase}
          onChange={setPhrase}
          rows={3}
          placeholder="Escribe aquí la frase…"
        />
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            disabled={busy}
            onClick={() =>
              void persist(
                () => {
                  saveScripture({
                    date,
                    passage_key: passage.key,
                    done: true,
                    highlight_phrase: phrase,
                  });
                  setDone(true);
                },
                "Frase archivada. Cuadro limpio.",
                { clear: () => setPhrase("") }
              )
            }
          >
            {busy ? "Guardando…" : "Guardar y limpiar"}
          </PrimaryButton>
          {existing?.highlight_phrase && (
            <SecondaryButton onClick={() => setPhrase(existing.highlight_phrase)}>
              Cargar frase de hoy
            </SecondaryButton>
          )}
        </div>
        <SaveBanner msg={msg} busy={busy} />
      </GlassCard>

      <GlassCard className="space-y-2">
        <h3 className="text-sm font-semibold text-ink">Plan de la semana</h3>
        <ul className="space-y-1">
          {PASSAGES.map((p) => (
            <li
              key={p.key}
              className={`text-sm flex justify-between gap-2 py-1 ${
                p.dayIndex === dayIdx ? "text-primary font-medium" : "text-muted"
              }`}
            >
              <span>
                {p.dayLabel}: {p.title}
              </span>
              <span className="text-xs text-subtle">{p.focus}</span>
            </li>
          ))}
        </ul>
      </GlassCard>

      <ArchiveSection title="Archivo de frases" count={history.length}>
        {history.map((h) => {
          const p = PASSAGES.find((x) => x.key === h.passage_key);
          return (
            <ArchiveItem
              key={h.id}
              date={h.date}
              title={p?.title || h.passage_key}
              body={h.highlight_phrase || "(sin frase)"}
              badge={h.done ? "Leído" : undefined}
            />
          );
        })}
      </ArchiveSection>
    </div>
  );
}
