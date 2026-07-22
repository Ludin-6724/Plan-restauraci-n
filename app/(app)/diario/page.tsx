"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { todayISO } from "@/lib/plan-calendar";
import { GlassCard, PageHeader, PrimaryButton, SecondaryButton, TextArea } from "@/components/ui/Glass";
import { SaveBanner } from "@/components/ui/Archive";
import { usePersist } from "@/lib/use-persist";

export default function DiarioPage() {
  const { data, saveJournal } = useData();
  const { persist, msg, busy } = usePersist();
  const date = todayISO();
  const existing = data.journal_entries.find((j) => j.date === date);

  const [gracias, setGracias] = useState("");
  const [verdad, setVerdad] = useState("");
  const [manana, setManana] = useState("");
  const [weekly, setWeekly] = useState("");

  const history = useMemo(
    () => [...(data.journal_entries ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
    [data.journal_entries]
  );

  const clearForm = () => {
    setGracias("");
    setVerdad("");
    setManana("");
    setWeekly("");
  };

  const loadToday = () => {
    const e = data.journal_entries.find((j) => j.date === date);
    if (!e) return;
    setGracias(e.gracias ?? "");
    setVerdad(e.verdad ?? "");
    setManana(e.manana_hare ?? "");
    setWeekly(e.weekly_notes ?? "");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Diario de 3 líneas"
        subtitle="Guarda → se limpia el cuadro → lo ves abajo en el archivo (Supabase)."
      />

      <GlassCard className="space-y-3">
        <TextArea
          label="1. Gracias a Dios por…"
          value={gracias}
          onChange={setGracias}
          rows={2}
          placeholder="Una cosa real"
        />
        <TextArea
          label="2. Hoy mi mente creyó… / elegí la verdad de…"
          value={verdad}
          onChange={setVerdad}
          rows={2}
        />
        <TextArea
          label="3. Mañana haré solo…"
          value={manana}
          onChange={setManana}
          rows={2}
          placeholder="Una cosa pequeña"
        />
        <TextArea label="Opcional semanal" value={weekly} onChange={setWeekly} rows={2} />
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            disabled={busy}
            onClick={() =>
              void persist(
                () => {
                  saveJournal({
                    date,
                    gracias: gracias.trim(),
                    verdad: verdad.trim(),
                    manana_hare: manana.trim(),
                    weekly_notes: weekly.trim(),
                  });
                },
                "Diario guardado. Formulario limpio.",
                { clear: clearForm }
              )
            }
          >
            {busy ? "Guardando…" : "Guardar y limpiar"}
          </PrimaryButton>
          {existing && <SecondaryButton onClick={loadToday}>Cargar lo de hoy</SecondaryButton>}
        </div>
        <SaveBanner msg={msg} busy={busy} />
      </GlassCard>

      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Diario guardado</h2>
          <span className="tag tag--accent">{history.length}</span>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-white/50 text-center py-4 border border-dashed border-white/15 rounded-xl">
            Aún no hay entradas. Guarda arriba y aparecen aquí.
          </p>
        ) : (
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((h) => (
              <li key={h.id} className="rounded-xl border border-white/12 bg-black/25 px-3 py-2.5 space-y-1">
                <p className="text-xs text-emerald-200/80">{h.date}</p>
                <p className="text-sm text-white">
                  <span className="text-white/50">Gracias:</span> {h.gracias || "—"}
                </p>
                <p className="text-sm text-white">
                  <span className="text-white/50">Verdad:</span> {h.verdad || "—"}
                </p>
                <p className="text-sm text-white">
                  <span className="text-white/50">Mañana:</span> {h.manana_hare || "—"}
                </p>
                {h.weekly_notes && (
                  <p className="text-sm text-white/75">Semanal: {h.weekly_notes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
