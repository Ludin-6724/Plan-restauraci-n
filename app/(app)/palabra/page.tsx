"use client";

import { useEffect, useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { PASSAGES } from "@/lib/seeds/content";
import {
  BIBLE_VERSION_LABELS,
  CHAPTERS,
  type BibleVersion,
} from "@/lib/seeds/bible-chapters";
import { todayISO, weekdayIndex } from "@/lib/plan-calendar";
import { GlassCard, PageHeader, PrimaryButton, SecondaryButton, TextArea } from "@/components/ui/Glass";
import { ArchiveItem, ArchiveSection, SaveBanner } from "@/components/ui/Archive";
import { usePersist } from "@/lib/use-persist";

const VERSION_STORAGE_KEY = "bosque.bibleVersion";

function loadVersion(): BibleVersion {
  if (typeof window === "undefined") return "rvr1960";
  try {
    const v = localStorage.getItem(VERSION_STORAGE_KEY);
    if (v === "ntv" || v === "rvr1960") return v;
  } catch {
    /* ignore */
  }
  return "rvr1960";
}

export default function PalabraPage() {
  const { data, saveScripture } = useData();
  const { persist, msg, busy } = usePersist();
  const date = todayISO();
  const dayIdx = weekdayIndex(date);
  const passage = PASSAGES.find((p) => p.dayIndex === dayIdx) ?? PASSAGES[0];
  const chapter = CHAPTERS[passage.key];
  const existing = data.scripture_logs.find((s) => s.date === date);
  const [phrase, setPhrase] = useState("");
  const [done, setDone] = useState(!!existing?.done);
  const [version, setVersion] = useState<BibleVersion>("rvr1960");

  useEffect(() => {
    setVersion(loadVersion());
  }, []);

  const selectVersion = (v: BibleVersion) => {
    setVersion(v);
    try {
      localStorage.setItem(VERSION_STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const verses = chapter?.versions[version] ?? [];
  const focusStart = chapter?.focusStart ?? null;
  const focusEnd = chapter?.focusEnd ?? null;
  const hasFocusRange = focusStart != null && focusEnd != null;

  const history = useMemo(
    () =>
      [...data.scripture_logs]
        .filter((s) => s.done || s.highlight_phrase)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.scripture_logs]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Palabra"
        subtitle="Lee el capítulo completo, medita y guarda la frase que se te quede."
      />

      <GlassCard className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-primary uppercase tracking-wide font-medium">
              {passage.dayLabel} · {passage.focus}
            </p>
            <h2 className="text-xl font-semibold text-ink">{passage.title}</h2>
            <p className="text-sm text-muted">
              {passage.reference}
              {hasFocusRange ? " · capítulo completo abajo" : ""}
            </p>
          </div>
          {done && <span className="tag tag--ok shrink-0">Hoy leído</span>}
        </div>

        {/* Selector de versión */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted uppercase tracking-wide">Versión</span>
          <div className="inline-flex rounded-xl border border-line bg-surface-soft p-0.5">
            {(["rvr1960", "ntv"] as const).map((v) => {
              const active = version === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => selectVersion(v)}
                  className={`px-3.5 py-1.5 text-sm rounded-[10px] transition-colors ${
                    active
                      ? "bg-primary font-semibold shadow-sm"
                      : "text-muted hover:text-ink hover:bg-surface-raised/60"
                  }`}
                  style={active ? { color: "var(--on-primary, #fff)" } : undefined}
                  aria-pressed={active}
                >
                  {BIBLE_VERSION_LABELS[v]}
                </button>
              );
            })}
          </div>
        </div>

        {hasFocusRange && (
          <p className="text-xs text-muted leading-relaxed">
            Porción del plan: vv. {focusStart}–{focusEnd}. El capítulo completo está para meditar;
            los versículos del plan se destacan suavemente.
          </p>
        )}

        {/* Texto del capítulo — contraste legible en todos los temas */}
        <div
          className="bible-reader rounded-xl border border-line bg-surface-soft px-3.5 py-4 sm:px-5 sm:py-5 max-h-[min(70vh,36rem)] overflow-y-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <p className="text-[11px] uppercase tracking-wider text-primary font-medium mb-3">
            {passage.reference.split(":")[0]} · {BIBLE_VERSION_LABELS[version]}
          </p>
          {verses.length === 0 ? (
            <p className="text-muted text-sm">Texto no disponible para este pasaje.</p>
          ) : (
            <div className="space-y-2.5">
              {verses.map((v) => {
                const inFocus =
                  hasFocusRange && v.n >= (focusStart as number) && v.n <= (focusEnd as number);
                return (
                  <p
                    key={v.n}
                    id={`v-${v.n}`}
                    className={`leading-[1.7] text-[15px] sm:text-base text-ink ${
                      inFocus
                        ? "bg-primary/10 border-l-2 border-primary pl-3 -ml-1 rounded-r-md py-0.5"
                        : ""
                    }`}
                  >
                    <sup className="mr-1.5 text-[11px] font-semibold text-primary select-none">
                      {v.n}
                    </sup>
                    {v.t}
                  </p>
                );
              })}
            </div>
          )}
          <p className="mt-4 pt-3 border-t border-line text-[10px] text-subtle leading-snug">
            {version === "rvr1960"
              ? "Reina-Valera 1960 © Sociedades Bíblicas Unidas. Uso personal de meditación."
              : "Nueva Traducción Viviente (NTV) © Tyndale House Foundation. Uso personal de meditación."}
          </p>
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
