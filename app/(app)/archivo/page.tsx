"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { PASSAGES } from "@/lib/seeds/content";
import { GlassCard, PageHeader, PrimaryButton } from "@/components/ui/Glass";
import { ArchiveItem, ArchiveSection, SaveBanner } from "@/components/ui/Archive";
import { usePersist } from "@/lib/use-persist";
import { format, parseISO, addDays } from "date-fns";
import { es } from "date-fns/locale";

type TabId =
  | "resumen"
  | "fe"
  | "mente"
  | "cuerpo"
  | "proposito"
  | "crisis";

const TABS: { id: TabId; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "fe", label: "Fe" },
  { id: "mente", label: "Mente" },
  { id: "cuerpo", label: "Cuerpo" },
  { id: "proposito", label: "Propósito" },
  { id: "crisis", label: "Crisis" },
];

function weekLabel(weekStart: string) {
  try {
    const start = parseISO(weekStart);
    const end = addDays(start, 6);
    return `${format(start, "d MMM", { locale: es })} – ${format(end, "d MMM yyyy", { locale: es })}`;
  } catch {
    return weekStart;
  }
}

export default function ArchivoPage() {
  const { data } = useData();
  const { persist, msg, busy } = usePersist();
  const [tab, setTab] = useState<TabId>("resumen");

  const counts = useMemo(
    () => ({
      diario: data.journal_entries?.length ?? 0,
      palabra: data.scripture_logs?.filter((s) => s.done || s.highlight_phrase).length ?? 0,
      verdades: data.truth_sessions?.length ?? 0,
      panico: data.panic_episodes?.length ?? 0,
      ejercicio: data.exercise_logs?.length ?? 0,
      software: data.software_sessions?.length ?? 0,
      softwareWeekly: data.software_weekly?.length ?? 0,
      trading: data.trading_entries?.length ?? 0,
      lecturas: (data.reading_logs?.length ?? 0) + (data.book_notes?.length ?? 0),
      bookNotes: data.book_notes?.length ?? 0,
      santidad: data.holiness_logs?.length ?? 0,
      rutinaDias: new Set(data.routines?.map((r) => r.date) ?? []).size,
    }),
    [data]
  );

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Archivo"
        subtitle={`${total} registros guardados. Organizado por área para consultar sin mezclar todo.`}
      />

      <GlassCard className="space-y-3">
        <p className="text-sm text-white/80">
          Todo lo que guardas en cada sección queda aquí (dispositivo + nube). Elige un área abajo.
        </p>
        <PrimaryButton
          disabled={busy}
          onClick={() => void persist(() => undefined, "Archivo sincronizado con la nube.")}
        >
          {busy ? "Sincronizando…" : "Sincronizar archivo ahora"}
        </PrimaryButton>
        <SaveBanner msg={msg} busy={busy} />
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition ${
              tab === t.id
                ? "choice-chip choice-chip--row choice-chip--active"
                : "choice-chip choice-chip--row"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "resumen" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                ["fe", "Fe", counts.palabra + counts.diario + counts.santidad + counts.verdades],
                ["mente", "Mente / notas", counts.bookNotes + (data.reading_logs?.length ?? 0)],
                ["cuerpo", "Cuerpo", counts.ejercicio + counts.rutinaDias],
                ["proposito", "Propósito", counts.software + counts.softwareWeekly + counts.trading],
                ["crisis", "Crisis / pánico", counts.panico],
              ] as const
            ).map(([id, label, n]) => (
              <button key={id} type="button" onClick={() => setTab(id)} className="text-left">
                <GlassCard className="!p-3 h-full hover:border-white/30 transition">
                  <p className="text-xs text-white/60">{label}</p>
                  <p className="text-2xl font-bold text-emerald-200 mt-1">{n}</p>
                </GlassCard>
              </button>
            ))}
            <Link href="/lecturas">
              <GlassCard className="!p-3 h-full hover:border-white/30 transition">
                <p className="text-xs text-white/60">Ir a Lecturas</p>
                <p className="text-sm text-white mt-2">Ver y escribir notas →</p>
              </GlassCard>
            </Link>
          </div>

          {/* Notas de libros siempre visibles en el resumen */}
          <ArchiveSection
            title="Notas de libros (todas)"
            count={counts.bookNotes}
            empty="Aún no hay notas. Ve a Lecturas, escribe y guarda."
          >
            {[...(data.book_notes ?? [])]
              .sort((a, b) => b.created_at.localeCompare(a.created_at))
              .slice(0, 20)
              .map((n) => {
                const book = data.books?.find((b) => b.id === n.book_id);
                return (
                  <ArchiveItem
                    key={n.id}
                    date={n.created_at.slice(0, 16).replace("T", " · ")}
                    title={book?.title || "Libro"}
                    body={n.content}
                  />
                );
              })}
          </ArchiveSection>
          {(data.book_notes?.length ?? 0) > 20 && (
            <button
              type="button"
              className="text-sm text-emerald-200 underline"
              onClick={() => setTab("mente")}
            >
              Ver todas en pestaña Mente →
            </button>
          )}
        </div>
      )}

      {tab === "fe" && (
        <div className="space-y-4">
          <ArchiveSection title="Diario" count={counts.diario} empty="Sin entradas de diario.">
            {[...(data.journal_entries ?? [])]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((j) => (
                <ArchiveItem
                  key={j.id}
                  date={j.date}
                  body={`Gracias: ${j.gracias || "—"}\nVerdad: ${j.verdad || "—"}\nMañana: ${j.manana_hare || "—"}`}
                />
              ))}
          </ArchiveSection>
          <ArchiveSection title="Palabra" count={counts.palabra} empty="Sin frases guardadas.">
            {[...(data.scripture_logs ?? [])]
              .filter((s) => s.done || s.highlight_phrase)
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((h) => (
                <ArchiveItem
                  key={h.id}
                  date={h.date}
                  title={PASSAGES.find((p) => p.key === h.passage_key)?.title || h.passage_key}
                  body={h.highlight_phrase || "—"}
                />
              ))}
          </ArchiveSection>
          <ArchiveSection title="Sesiones de verdades" count={counts.verdades}>
            {[...(data.truth_sessions ?? [])]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((s) => (
                <ArchiveItem
                  key={s.id}
                  date={s.date}
                  title={`Sesión ${s.slot === "morning" ? "mañana" : s.slot === "mid" ? "mediodía" : "noche"}`}
                  body={`${s.reps_total || s.truth_ids?.length || 0} verdades`}
                />
              ))}
          </ArchiveSection>
          <ArchiveSection title="Santidad / luz" count={counts.santidad}>
            {[...(data.holiness_logs ?? [])]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((l) => (
                <ArchiveItem
                  key={l.id}
                  date={l.date}
                  title={l.type === "confession" ? "Confesión" : "Integridad"}
                  body={l.note || undefined}
                />
              ))}
          </ArchiveSection>
        </div>
      )}

      {tab === "mente" && (
        <div className="space-y-4">
          <GlassCard className="!py-3">
            <p className="text-sm text-white/80">
              Aquí ves <strong className="text-white">todas</strong> las notas de lectura. También
              están en <Link href="/lecturas" className="text-emerald-200 underline">Lecturas</Link>.
            </p>
          </GlassCard>

          <ArchiveSection
            title="Notas de libros"
            count={counts.bookNotes}
            empty="Sin notas aún. En Lecturas escribe y pulsa Guardar nota."
          >
            {[...(data.book_notes ?? [])]
              .sort((a, b) => b.created_at.localeCompare(a.created_at))
              .map((n) => {
                const book = data.books?.find((b) => b.id === n.book_id);
                return (
                  <ArchiveItem
                    key={n.id}
                    date={n.created_at.slice(0, 16).replace("T", " · ")}
                    title={book?.title || "Libro"}
                    body={n.content}
                  />
                );
              })}
          </ArchiveSection>

          <ArchiveSection title="Avances de páginas" count={data.reading_logs?.length ?? 0}>
            {[...(data.reading_logs ?? [])]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((l) => {
                const book = data.books?.find((b) => b.id === l.book_id);
                return (
                  <ArchiveItem
                    key={l.id}
                    date={l.date}
                    title={book?.title || "Libro"}
                    body={[l.progress_label, l.notes].filter(Boolean).join("\n")}
                  />
                );
              })}
          </ArchiveSection>

          <ArchiveSection title="Biblioteca" count={data.books?.length ?? 0}>
            {(data.books ?? []).map((b) => (
              <ArchiveItem
                key={b.id}
                title={b.title}
                body={`${b.author || "Sin autor"} · ${(data.book_notes ?? []).filter((n) => n.book_id === b.id).length} notas`}
              />
            ))}
          </ArchiveSection>
        </div>
      )}

      {tab === "cuerpo" && (
        <div className="space-y-4">
          <ArchiveSection title="Ejercicio" count={counts.ejercicio}>
            {[...(data.exercise_logs ?? [])]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((e) => (
                <ArchiveItem
                  key={e.id}
                  date={e.date}
                  title={`${e.minutes} min · RPE ${e.rpe}`}
                  body={[e.circuit_done && "Circuito", e.walk_only && "Caminata", e.notes]
                    .filter(Boolean)
                    .join(" · ")}
                />
              ))}
          </ArchiveSection>
          <ArchiveSection title="Rutina (días)" count={counts.rutinaDias}>
            {[...new Set(data.routines?.map((r) => r.date) ?? [])]
              .sort((a, b) => b.localeCompare(a))
              .map((d) => {
                const day = data.routines.filter((r) => r.date === d);
                const done = day.filter((r) => r.status === "done" || r.status === "partial").length;
                return (
                  <ArchiveItem key={d} date={d} title={`${done} ítems marcados`} />
                );
              })}
          </ArchiveSection>
        </div>
      )}

      {tab === "proposito" && (
        <div className="space-y-4">
          <ArchiveSection title="Software · sesiones" count={counts.software}>
            {[...(data.software_sessions ?? [])]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((s) => (
                <ArchiveItem
                  key={s.id}
                  date={s.date}
                  title={`${s.minutes} min${s.deliverable ? ` · ${s.deliverable}` : ""}`}
                  body={s.notes || undefined}
                />
              ))}
          </ArchiveSection>
          <ArchiveSection title="Software · metas semanales" count={counts.softwareWeekly}>
            {[...(data.software_weekly ?? [])]
              .sort((a, b) => b.week_start.localeCompare(a.week_start))
              .map((w) => (
                <ArchiveItem
                  key={w.id || w.week_start}
                  date={weekLabel(w.week_start)}
                  body={w.deliverable_text}
                  badge={w.done ? "Completada" : "En curso"}
                />
              ))}
          </ArchiveSection>
          <ArchiveSection title="Trading" count={counts.trading}>
            {[...(data.trading_entries ?? [])]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((e) => (
                <ArchiveItem
                  key={e.id}
                  date={e.date}
                  title={e.skipped_reason ? `No operé: ${e.skipped_reason}` : e.thesis || "Operación"}
                  body={
                    e.skipped_reason
                      ? undefined
                      : `Emoción ${e.emotion} · ${e.result || "—"}${e.lesson ? `\n${e.lesson}` : ""}`
                  }
                />
              ))}
          </ArchiveSection>
        </div>
      )}

      {tab === "crisis" && (
        <ArchiveSection title="Episodios de pánico" count={counts.panico} empty="Sin episodios registrados.">
          {[...(data.panic_episodes ?? [])]
            .sort((a, b) => b.started_at.localeCompare(a.started_at))
            .map((e) => (
              <ArchiveItem
                key={e.id}
                date={(() => {
                  try {
                    return format(parseISO(e.started_at), "d MMM yyyy · HH:mm", { locale: es });
                  } catch {
                    return e.started_at;
                  }
                })()}
                title={`Intensidad ${e.intensity_before}${e.intensity_after != null ? ` → ${e.intensity_after}` : ""}`}
                body={[e.trigger && `Disparador: ${e.trigger}`, e.helped && `Ayudó: ${e.helped}`, e.notes]
                  .filter(Boolean)
                  .join("\n")}
              />
            ))}
        </ArchiveSection>
      )}
    </div>
  );
}
