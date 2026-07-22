"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useData } from "@/lib/data-context";
import { todayISO } from "@/lib/plan-calendar";
import { GlassCard, PageHeader, PrimaryButton, SecondaryButton, TextArea, TextInput } from "@/components/ui/Glass";
import { SaveBanner } from "@/components/ui/Archive";
import { usePersist } from "@/lib/use-persist";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { BookOpen, Plus, Trash2, Pencil, StickyNote } from "lucide-react";

export default function LecturasPage() {
  const {
    data,
    addBook,
    updateBook,
    deleteBook,
    addBookNote,
    deleteBookNote,
    addReadingLog,
    deleteReadingLog,
  } = useData();
  const { persist, msg, busy } = usePersist();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMeta, setEditMeta] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [progress, setProgress] = useState("");
  const [avanceNote, setAvanceNote] = useState("");
  const notesListRef = useRef<HTMLDivElement>(null);

  const books = useMemo(
    () => [...(data.books || [])].sort((a, b) => a.sort_order - b.sort_order),
    [data.books]
  );

  // Auto-seleccionar primer libro
  useEffect(() => {
    if (!selectedId && books[0]) setSelectedId(books[0].id);
  }, [books, selectedId]);

  const selected = books.find((b) => b.id === selectedId) ?? null;
  const activeId = selected?.id ?? null;

  const allBookNotes = useMemo(
    () =>
      [...(data.book_notes || [])].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [data.book_notes]
  );

  const bookNotes = useMemo(() => {
    if (!activeId) return [];
    return allBookNotes.filter((n) => n.book_id === activeId);
  }, [allBookNotes, activeId]);

  const avanceLogs = useMemo(() => {
    if (!activeId) return [];
    return [...(data.reading_logs || [])]
      .filter((l) => l.book_id === activeId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.reading_logs, activeId]);

  const bookTitle = (bookId: string) =>
    books.find((b) => b.id === bookId)?.title || "Libro";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lecturas"
        subtitle="Escribe una nota, guárdala y la ves al instante aquí y en Archivo → Mente."
      />

      {/* ——— Nuevo libro ——— */}
      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2 text-white">
          <Plus size={18} className="text-emerald-300" />
          <h2 className="text-sm font-semibold">Nuevo libro</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <TextInput label="Título" value={title} onChange={setTitle} placeholder="Nombre del libro" />
          <TextInput label="Autor" value={author} onChange={setAuthor} placeholder="Autor (opcional)" />
        </div>
        <PrimaryButton
          disabled={busy || !title.trim()}
          onClick={() => {
            const t = title.trim();
            if (!t) return;
            void persist(() => {
              addBook(t, author.trim());
              setTitle("");
              setAuthor("");
            }, "Libro creado.");
          }}
        >
          Agregar libro
        </PrimaryButton>
      </GlassCard>

      {/* ——— Selector ——— */}
      {books.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {books.map((b) => {
            const active = b.id === activeId;
            const n = allBookNotes.filter((x) => x.book_id === b.id).length;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setSelectedId(b.id);
                  setEditMeta(false);
                  setNoteDraft("");
                }}
                className={`shrink-0 max-w-[210px] text-left px-3 py-2 rounded-xl border transition ${
                  active
                    ? "choice-chip--active border-primary bg-primary"
                    : "bg-black/25 border-white/12 text-white/75 hover:border-white/30"
                }`}
              >
                <p className="text-sm font-medium truncate flex items-center gap-1.5">
                  <BookOpen size={14} className={active ? "text-emerald-300" : "text-white/50"} />
                  {b.title}
                </p>
                <p className="text-[10px] text-white/50 mt-0.5">
                  {n} nota{n === 1 ? "" : "s"}
                  {b.author ? ` · ${b.author}` : ""}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* ——— Libro activo: escribir + ver notas ——— */}
      {selected && (
        <GlassCard className="space-y-4">
          {editMeta ? (
            <div className="space-y-3">
              <TextInput label="Título" value={editTitle} onChange={setEditTitle} />
              <TextInput label="Autor" value={editAuthor} onChange={setEditAuthor} />
              <div className="flex gap-2">
                <PrimaryButton
                  disabled={busy}
                  onClick={() =>
                    void persist(() => {
                      updateBook(selected.id, { title: editTitle, author: editAuthor });
                      setEditMeta(false);
                    }, "Libro actualizado.")
                  }
                >
                  Guardar
                </PrimaryButton>
                <SecondaryButton onClick={() => setEditMeta(false)}>Cancelar</SecondaryButton>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">{selected.title}</h2>
                {selected.author && <p className="text-sm text-white/70">{selected.author}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="p-2 rounded-lg border border-white/15 text-white/70"
                  onClick={() => {
                    setEditMeta(true);
                    setEditTitle(selected.title);
                    setEditAuthor(selected.author);
                  }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg border border-rose-400/30 text-rose-200"
                  onClick={() => {
                    if (confirm(`¿Borrar «${selected.title}» y sus notas?`)) {
                      void persist(() => {
                        deleteBook(selected.id);
                        setSelectedId(null);
                      }, "Libro eliminado.");
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Escribir nota */}
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-950/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <StickyNote size={16} className="text-emerald-300" />
              <h3 className="text-sm font-semibold text-emerald-100">Escribir nota</h3>
            </div>
            <TextArea
              label="Nota del libro"
              value={noteDraft}
              onChange={setNoteDraft}
              rows={4}
              placeholder="Idea, cita, reflexión… se verá abajo al guardar."
            />
            <PrimaryButton
              disabled={busy || !noteDraft.trim()}
              onClick={() => {
                const content = noteDraft.trim();
                if (!content || !activeId) return;
                void persist(
                  () => {
                    addBookNote(activeId, content);
                  },
                  "Nota guardada. Ya la ves abajo y en Archivo.",
                  {
                    clear: () => {
                      setNoteDraft("");
                      setTimeout(() => {
                        notesListRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "nearest",
                        });
                      }, 80);
                    },
                  }
                );
              }}
            >
              {busy ? "Guardando…" : "Guardar nota"}
            </PrimaryButton>
            <SaveBanner msg={msg} busy={busy} />
          </div>

          {/* VER NOTAS DE ESTE LIBRO — siempre visible */}
          <div ref={notesListRef} className="space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
              <h3 className="text-base font-semibold text-white">
                Notas de «{selected.title}»
              </h3>
              <span className="tag tag--accent">
                {bookNotes.length} nota{bookNotes.length === 1 ? "" : "s"}
              </span>
            </div>

            {bookNotes.length === 0 ? (
              <p className="text-sm text-white/55 py-3 text-center border border-dashed border-white/15 rounded-xl">
                Todavía no hay notas de este libro. Escribe una arriba y pulsa Guardar.
              </p>
            ) : (
              <ul className="space-y-3">
                {bookNotes.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-xl border border-white/15 bg-black/30 px-4 py-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-emerald-200/80">{formatNoteDate(n.created_at)}</p>
                      <button
                        type="button"
                        className="text-xs text-rose-200 underline"
                        onClick={() => {
                          if (confirm("¿Borrar esta nota?")) {
                            void persist(() => deleteBookNote(n.id), "Nota borrada.");
                          }
                        }}
                      >
                        Borrar
                      </button>
                    </div>
                    <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                      {n.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </GlassCard>
      )}

      {/* ——— TODAS LAS NOTAS (todos los libros) — siempre en Lecturas ——— */}
      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-white">Todas las notas de lectura</h2>
          <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">
            {allBookNotes.length} en total
          </span>
        </div>
        <p className="text-xs text-white/50">
          Vista completa: lo mismo aparece en <strong className="text-white/70">Archivo → Mente</strong>.
        </p>
        {allBookNotes.length === 0 ? (
          <p className="text-sm text-white/50 py-4 text-center">
            Aún no has guardado notas. Elige un libro, escribe y guarda.
          </p>
        ) : (
          <ul className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
            {allBookNotes.map((n) => (
              <li
                key={n.id}
                className="rounded-xl border border-white/12 bg-black/25 px-4 py-3 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-emerald-200">
                      {bookTitle(n.book_id)}
                    </p>
                    <p className="text-[11px] text-white/45">{formatNoteDate(n.created_at)}</p>
                  </div>
                  <button
                    type="button"
                    className="text-[10px] text-white/50 underline hover:text-emerald-200"
                    onClick={() => setSelectedId(n.book_id)}
                  >
                    Ver libro
                  </button>
                </div>
                <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                  {n.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      {/* Avance opcional */}
      {selected && (
        <GlassCard className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Avance de páginas (opcional)</h2>
          <TextInput
            label="Capítulo / páginas"
            value={progress}
            onChange={setProgress}
            placeholder="Ej. Cap. 4 · págs. 80–95"
          />
          <TextArea label="Resumen breve" value={avanceNote} onChange={setAvanceNote} rows={2} />
          <PrimaryButton
            disabled={busy || (!progress.trim() && !avanceNote.trim())}
            onClick={() =>
              void persist(
                () => {
                  addReadingLog({
                    book_id: selected.id,
                    date: todayISO(),
                    progress_label: progress.trim(),
                    notes: avanceNote.trim(),
                    filter_keep: true,
                  });
                },
                "Avance guardado.",
                {
                  clear: () => {
                    setProgress("");
                    setAvanceNote("");
                  },
                }
              )
            }
          >
            Guardar avance
          </PrimaryButton>
          {avanceLogs.length > 0 && (
            <ul className="text-sm space-y-2 border-t border-white/10 pt-3">
              {avanceLogs.map((l) => (
                <li key={l.id} className="text-white/80">
                  <span className="text-white/45 text-xs">{l.date}</span> · {l.progress_label || "Avance"}
                  {l.notes ? ` — ${l.notes}` : ""}
                  <button
                    type="button"
                    className="ml-2 text-[10px] text-rose-200 underline"
                    onClick={() => deleteReadingLog(l.id)}
                  >
                    borrar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      )}

      {!books.length && (
        <GlassCard>
          <p className="text-sm text-white/60 text-center py-6">
            Agrega un libro arriba para empezar a guardar y ver notas.
          </p>
        </GlassCard>
      )}
    </div>
  );
}

function formatNoteDate(iso: string) {
  try {
    return format(parseISO(iso), "d MMM yyyy · HH:mm", { locale: es });
  } catch {
    return iso.slice(0, 16).replace("T", " ");
  }
}
