"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useData } from "@/lib/data-context";
import { PASSAGES } from "@/lib/seeds/content";
import {
  BIBLE_VERSION_LABELS,
  CHAPTERS,
  type BibleVerse,
  type BibleVersion,
} from "@/lib/seeds/bible-chapters";
import { getNTBook, NT_BOOKS } from "@/lib/seeds/nt-books";
import { todayISO, weekdayIndex } from "@/lib/plan-calendar";
import { GlassCard, PageHeader, PrimaryButton, SecondaryButton, TextArea } from "@/components/ui/Glass";
import { ArchiveItem, ArchiveSection, SaveBanner } from "@/components/ui/Archive";
import { usePersist } from "@/lib/use-persist";
import { NotesEditor } from "@/components/palabra/NotesEditor";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

const VERSION_STORAGE_KEY = "bosque.bibleVersion";
const BOOK_STORAGE_KEY = "bosque.bibleBook";

type ReaderView = BibleVersion | "paralela";

/** Texto de un libro completo: capítulo → versículos, por versión. */
type BookTexts = Record<BibleVersion, Record<string, BibleVerse[]>>;

const HIGHLIGHTS: { key: string; label: string; swatch: string; verse: string }[] = [
  { key: "yellow", label: "Amarillo", swatch: "bg-yellow-300", verse: "verse-hl-yellow" },
  { key: "green", label: "Verde", swatch: "bg-green-600", verse: "verse-hl-green" },
  { key: "blue", label: "Azul", swatch: "bg-sky-700", verse: "verse-hl-blue" },
  { key: "pink", label: "Rosa", swatch: "bg-pink-700", verse: "verse-hl-pink" },
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

function loadBook(): string {
  if (typeof window === "undefined") return "efesios";
  try {
    const v = localStorage.getItem(BOOK_STORAGE_KEY);
    if (v && NT_BOOKS.some((b) => b.key === v)) return v;
  } catch {
    /* ignore */
  }
  return "efesios";
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
  const [bookKey, setBookKey] = useState("efesios");
  const [chapterNum, setChapterNum] = useState(1);
  const [view, setView] = useState<ReaderView>("rvr1960");
  const [mobilePanel, setMobilePanel] = useState<"biblia" | "notas">("biblia");
  const [introOpen, setIntroOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteDirty, setNoteDirty] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- Texto del libro (JSON estático) ---------- */
  const [bookTexts, setBookTexts] = useState<BookTexts | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadRetry, setLoadRetry] = useState(0);
  const textsCache = useRef<Map<string, BookTexts>>(new Map());

  const book = getNTBook(bookKey);

  useEffect(() => {
    setView(loadView());
    setBookKey(loadBook());
  }, []);

  useEffect(() => {
    const cached = textsCache.current.get(bookKey);
    if (cached) {
      setBookTexts(cached);
      setLoadError(false);
      return;
    }
    let cancelled = false;
    setBookTexts(null);
    setLoadError(false);
    const loadVersion = async (v: BibleVersion): Promise<Record<string, BibleVerse[]>> => {
      const res = await fetch(`/bible/${v}/${bookKey}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${v}/${bookKey}`);
      return res.json();
    };
    Promise.all([loadVersion("rvr1960"), loadVersion("ntv")])
      .then(([rvr1960, ntv]) => {
        if (cancelled) return;
        const texts: BookTexts = { rvr1960, ntv };
        textsCache.current.set(bookKey, texts);
        setBookTexts(texts);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [bookKey, loadRetry]);

  const selectView = (v: ReaderView) => {
    setView(v);
    try {
      localStorage.setItem(VERSION_STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const selectBook = (key: string) => {
    setBookKey(key);
    setChapterNum(1);
    setSelectedVerse(null);
    setCommentDraft("");
    try {
      localStorage.setItem(BOOK_STORAGE_KEY, key);
    } catch {
      /* ignore */
    }
  };

  const chapterVerses: Record<BibleVersion, BibleVerse[]> | null = bookTexts
    ? {
        rvr1960: bookTexts.rvr1960[String(chapterNum)] ?? [],
        ntv: bookTexts.ntv[String(chapterNum)] ?? [],
      }
    : null;

  const marksForChapter = useMemo(
    () =>
      (data.verse_marks || []).filter(
        (m) => m.book_key === bookKey && m.chapter === chapterNum
      ),
    [data.verse_marks, bookKey, chapterNum]
  );
  const markFor = (verse: number) => marksForChapter.find((m) => m.verse === verse);

  const savedNote = useMemo(
    () =>
      (data.study_notes || []).find(
        (n) => n.book_key === bookKey && n.chapter === chapterNum
      ),
    [data.study_notes, bookKey, chapterNum]
  );

  // Cargar nota del capítulo al cambiar de libro/capítulo o llegar data de la nube
  useEffect(() => {
    setNoteText(savedNote?.content ?? "");
    setNoteDirty(false);
    setSelectedVerse(null);
    setCommentDraft("");
  }, [bookKey, chapterNum, savedNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Autosave de notas con debounce (commit ya sincroniza local + nube)
  const onNoteChange = (v: string) => {
    setNoteText(v);
    setNoteDirty(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveStudyNote(bookKey, chapterNum, v);
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
      book_key: bookKey,
      chapter: chapterNum,
      verse: selectedVerse,
      color,
      comment: selectedMark?.comment ?? "",
    });
  };

  const saveComment = () => {
    if (selectedVerse == null) return;
    saveVerseMark({
      book_key: bookKey,
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
          <MessageSquare size={12} className="inline-block ml-1.5 -mt-0.5 text-current opacity-70" />
        ) : null}
      </p>
    );
  };

  const verseEditor = selectedVerse != null && (
    <div className="sticky bottom-0 mt-3 rounded-xl border border-primary/30 bg-surface-raised p-3 space-y-2.5 shadow-lg">
      <p className="text-xs font-semibold text-ink">
        {book.name} {chapterNum}:{selectedVerse}
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
        <PrimaryButton onClick={saveComment} style={{ color: "#ffffff" }}>Guardar comentario</PrimaryButton>
        <SecondaryButton onClick={() => setSelectedVerse(null)}>Cerrar</SecondaryButton>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Palabra · Estudio"
        subtitle={`Estudio de ${book.name}: lee, subraya, comenta y toma notas. Todo queda guardado.`}
      />

      <GlassCard className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Biblioteca bíblica</h2>
            <p className="text-sm text-primary font-medium">
              Nuevo Testamento · {NT_BOOKS.length} libros disponibles
            </p>
          </div>
          <a href="#lectura-del-dia" className="text-sm text-primary underline underline-offset-4">
            Ir a la lectura del día
          </a>
        </div>
        <p className="text-sm text-muted">
          Lee todos sus capítulos en RVR 1960 o NTV, compara ambas versiones y
          estudia con introducciones, subrayados, comentarios y notas personales.
          Elige un libro para comenzar.
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Libros disponibles">
          {NT_BOOKS.map((availableBook) => (
            <button
              key={availableBook.key}
              type="button"
              onClick={() => selectBook(availableBook.key)}
              aria-pressed={bookKey === availableBook.key}
              className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                bookKey === availableBook.key
                  ? "border-primary bg-primary font-semibold"
                  : "border-line bg-surface-soft text-ink hover:bg-surface-raised/60"
              }`}
              style={bookKey === availableBook.key ? { color: "#ffffff" } : undefined}
            >
              {availableBook.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted border-t border-line pt-3">
          Antiguo Testamento: todavía no está disponible como biblioteca completa.
          El plan semanal incluye únicamente los Salmos 23, 91 y 51.
        </p>
      </GlassCard>

      {/* Contexto e introducción */}
      <GlassCard className="space-y-3">
        <button
          type="button"
          onClick={() => setIntroOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 text-left"
          aria-expanded={introOpen}
        >
          <div>
            <h2 className="text-base font-semibold text-ink">{book.intro.title}</h2>
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
              {book.intro.author}
            </p>
            <p>
              <span className="font-medium">Destinatarios: </span>
              {book.intro.audience}
            </p>
            <p>
              <span className="font-medium">Propósito: </span>
              {book.intro.purpose}
            </p>
            <div>
              <p className="font-medium mb-1">Temas clave</p>
              <ul className="list-disc pl-5 space-y-0.5 text-muted">
                {book.intro.themes.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Bosquejo</p>
              <ul className="space-y-0.5 text-muted">
                {book.intro.outline.map((o) => (
                  <li key={o.ch}>
                    <span className="text-primary font-medium">Cap. {o.ch}:</span> {o.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Selector de libro y capítulo */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={bookKey}
          onChange={(e) => selectBook(e.target.value)}
          className="input-field !w-auto min-w-[10.5rem] !py-1.5 text-sm font-medium"
          aria-label="Libro del Nuevo Testamento"
        >
          {NT_BOOKS.map((b) => (
            <option key={b.key} value={b.key}>
              {b.name}
            </option>
          ))}
        </select>
        <div className="inline-flex flex-wrap rounded-xl border border-line bg-surface-soft p-0.5">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => {
            const active = chapterNum === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setChapterNum(c)}
                className={`seg-btn w-9 py-1.5 text-sm rounded-[10px] transition-colors ${
                  active
                    ? "bg-primary font-semibold shadow-sm"
                    : "text-muted hover:text-ink hover:bg-surface-raised/60"
                }`}
                style={active ? { color: "#ffffff" } : undefined}
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
              className={`seg-btn px-4 py-1.5 text-sm rounded-[10px] transition-colors ${
                active
                  ? "bg-primary font-semibold shadow-sm"
                  : "text-muted hover:text-ink hover:bg-surface-raised/60"
              }`}
              style={active ? { color: "#ffffff" } : undefined}
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
            <h3 className="text-sm font-semibold text-ink">
              {book.name} {chapterNum}
            </h3>
            <div className="inline-flex rounded-xl border border-line bg-surface-soft p-0.5">
              {(["rvr1960", "ntv", "paralela"] as const).map((v) => {
                const active = view === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => selectView(v)}
                    className={`seg-btn px-3 py-1.5 text-xs sm:text-sm rounded-[10px] transition-colors ${
                      active
                        ? "bg-primary font-semibold shadow-sm"
                        : "text-muted hover:text-ink hover:bg-surface-raised/60"
                    }`}
                    style={active ? { color: "#ffffff" } : undefined}
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
            {loadError ? (
              <div className="space-y-2">
                <p className="text-sm text-black/60">
                  No se pudo cargar el texto de {book.name}. Revisa tu conexión.
                </p>
                <SecondaryButton onClick={() => setLoadRetry((n) => n + 1)}>
                  Reintentar
                </SecondaryButton>
              </div>
            ) : !chapterVerses ? (
              <p className="text-sm text-black/60">Cargando {book.name}…</p>
            ) : view === "paralela" ? (
              <div className="space-y-3">
                {(() => {
                  // NTV omite algunos versículos (p.ej. Mt 17:21); alinear por número, no por índice
                  const ntvByNum = new Map(chapterVerses.ntv.map((v) => [v.n, v.t]));
                  return chapterVerses.rvr1960.map((rv) => (
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
                        {ntvByNum.has(rv.n) ? (
                          verseRow(rv.n, ntvByNum.get(rv.n) ?? "", "ntv")
                        ) : (
                          <p className="leading-[1.75] text-[13px] text-black/35 italic px-1 -mx-1">
                            (versículo no presente en NTV)
                          </p>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] uppercase tracking-wider font-medium mb-2 text-black/55">
                  {book.name} {chapterNum} · {BIBLE_VERSION_LABELS[view]}
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
              Mis notas · {book.name} {chapterNum}
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

      <div id="lectura-del-dia" className="scroll-mt-24">
        <h2 className="text-lg font-semibold text-ink">Lectura del día</h2>
        <p className="text-sm text-muted">Una lectura del plan semanal, independiente del libro que estás estudiando.</p>
      </div>
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
            style={{ color: "#ffffff" }}
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
