"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { EXERCISE_CIRCUIT } from "@/lib/seeds/content";
import { todayISO, weekStartISO, weekDates } from "@/lib/plan-calendar";
import { GlassCard, PageHeader, PrimaryButton, TextInput } from "@/components/ui/Glass";
import { SaveBanner } from "@/components/ui/Archive";
import { usePersist } from "@/lib/use-persist";

export default function EjercicioPage() {
  const { data, addExercise, deleteExercise } = useData();
  const { persist, msg, busy } = usePersist();
  const [minutes, setMinutes] = useState("25");
  const [rpe, setRpe] = useState("5");
  const [circuit, setCircuit] = useState(true);
  const [walkOnly, setWalkOnly] = useState(false);
  const [notes, setNotes] = useState("");

  const week = weekStartISO();
  const days = weekDates(week);
  const logs = Array.isArray(data.exercise_logs) ? data.exercise_logs : [];
  const thisWeek = useMemo(() => logs.filter((e) => days.includes(e.date)), [logs, days]);
  const history = useMemo(
    () => [...logs].sort((a, b) => b.date.localeCompare(a.date)),
    [logs]
  );

  const clearForm = () => {
    setNotes("");
    setMinutes("25");
    setRpe("5");
    setCircuit(true);
    setWalkOnly(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Cuerpo en casa"
        subtitle="Guarda → se limpia → ves la sesión abajo (Supabase)."
      />

      <GlassCard className="space-y-2">
        <h2 className="text-sm font-semibold text-white">Circuito A</h2>
        <ol className="text-sm text-white/80 list-decimal pl-5 space-y-1">
          {EXERCISE_CIRCUIT.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Nueva sesión</h2>
        <TextInput label="Minutos" type="number" value={minutes} onChange={setMinutes} />
        <TextInput label="Esfuerzo (1–10)" type="number" value={rpe} onChange={setRpe} />
        <label className="flex items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={circuit}
            onChange={(e) => setCircuit(e.target.checked)}
            className="accent-emerald-500"
          />
          Completé el circuito
        </label>
        <label className="flex items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={walkOnly}
            onChange={(e) => setWalkOnly(e.target.checked)}
            className="accent-emerald-500"
          />
          Solo caminata
        </label>
        <TextInput label="Notas" value={notes} onChange={setNotes} />
        <PrimaryButton
          disabled={busy}
          onClick={() =>
            void persist(
              () => {
                addExercise({
                  date: todayISO(),
                  minutes: Number(minutes) || 0,
                  circuit_done: circuit,
                  walk_only: walkOnly,
                  rpe: Number(rpe) || 0,
                  notes: notes.trim(),
                });
              },
              "Sesión guardada. Formulario limpio.",
              { clear: clearForm }
            )
          }
        >
          {busy ? "Guardando…" : "Guardar y limpiar"}
        </PrimaryButton>
        <SaveBanner msg={msg} busy={busy} />
      </GlassCard>

      <GlassCard className="space-y-2">
        <h2 className="text-sm font-semibold text-white">Esta semana: {thisWeek.length}/5</h2>
        <div className="flex gap-1">
          {days.map((d) => (
            <div
              key={d}
              className={`flex-1 h-8 rounded-lg ${
                thisWeek.some((e) => e.date === d)
                  ? "bg-emerald-500/50"
                  : "bg-black/30 border border-white/15"
              }`}
              title={d}
            />
          ))}
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Sesiones guardadas</h2>
          <span className="tag tag--accent">{history.length}</span>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-white/50 text-center py-4">Sin sesiones aún.</p>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {history.map((e) => (
              <li key={e.id} className="rounded-xl border border-white/12 bg-black/25 px-3 py-2">
                <div className="flex justify-between gap-2">
                  <p className="text-xs text-emerald-200/80">
                    {e.date} · {e.minutes} min · RPE {e.rpe}
                  </p>
                  <button
                    type="button"
                    className="text-[10px] text-rose-200 underline"
                    onClick={() => {
                      if (confirm("¿Borrar?")) {
                        void persist(() => deleteExercise(e.id), "Sesión borrada.");
                      }
                    }}
                  >
                    Borrar
                  </button>
                </div>
                <p className="text-sm text-white/80 mt-1">
                  {[e.circuit_done && "Circuito", e.walk_only && "Caminata", e.notes]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
