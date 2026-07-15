"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useData } from "@/lib/data-context";
import { todayISO, weekStartISO } from "@/lib/plan-calendar";
import { GlassCard, PageHeader, PrimaryButton, TextArea, TextInput } from "@/components/ui/Glass";
import { SaveBanner } from "@/components/ui/Archive";
import { usePersist } from "@/lib/use-persist";
import { format, parseISO, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { purposeLabelFor } from "@/lib/purpose";

function weekLabel(weekStart: string) {
  try {
    const start = parseISO(weekStart);
    const end = addDays(start, 6);
    return `${format(start, "d MMM", { locale: es })} – ${format(end, "d MMM yyyy", { locale: es })}`;
  } catch {
    return weekStart;
  }
}

export default function SoftwarePage() {
  const { data, updateSettings, addSoftwareSession, saveSoftwareWeekly } = useData();
  const { persist, msg, busy } = usePersist();

  const [minutes, setMinutes] = useState("90");
  const [deliverable, setDeliverable] = useState("");
  const [notes, setNotes] = useState("");
  const [weekText, setWeekText] = useState("");
  const [weekDone, setWeekDone] = useState(false);
  const weekLoaded = useRef<string | null>(null);

  const dynLabel = purposeLabelFor(data.profile.settings);
  const isDefaultSoftware = dynLabel === "Software";

  const week = weekStartISO();
  const weeklyList = Array.isArray(data.software_weekly) ? data.software_weekly : [];
  const sessions = Array.isArray(data.software_sessions) ? data.software_sessions : [];
  const weekly = weeklyList.find((w) => w.week_start === week);

  // Cargar meta de la semana solo al cambiar de semana (no rellena tras guardar)
  useEffect(() => {
    if (weekLoaded.current === week) return;
    weekLoaded.current = week;
    if (weekly) {
      setWeekText(weekly.deliverable_text ?? "");
      setWeekDone(!!weekly.done);
    } else {
      setWeekText("");
      setWeekDone(false);
    }
  }, [week, weekly]);

  const weekMinutes = useMemo(
    () => sessions.filter((s) => s.date >= week).reduce((a, s) => a + (s.minutes || 0), 0),
    [sessions, week]
  );

  const weeklyHistory = useMemo(
    () => [...weeklyList].sort((a, b) => b.week_start.localeCompare(a.week_start)),
    [weeklyList]
  );

  const sessionHistory = useMemo(
    () => [...sessions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [sessions]
  );

  const clearSessionForm = () => {
    setDeliverable("");
    setNotes("");
    setMinutes("90");
  };

  const clearWeeklyForm = () => {
    setWeekText("");
    setWeekDone(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={isDefaultSoftware ? "Software e ingeniería" : dynLabel}
        subtitle="Guarda → se limpia el formulario → ves el registro abajo (Supabase)."
      />

      <GlassCard className="space-y-3">
        <TextInput
          label={isDefaultSoftware ? "Ruta 90 días (stack / meta)" : "Ruta 90 días (meta / plan)"}
          value={data.profile.settings.software_route}
          onChange={(v) => updateSettings({ software_route: v })}
          placeholder="Ej. Next.js full-stack, Python backend…"
        />
        <p className="text-xs text-white/70">
          Semana: <strong className="text-white">{weekLabel(week)}</strong>
          {" · "}
          Minutos: <strong className="text-white">{weekMinutes}</strong>
          {" · "}
          Sesiones: <strong className="text-white">{sessionHistory.length}</strong>
        </p>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Nueva sesión</h2>
        <TextInput label="Minutos" type="number" value={minutes} onChange={setMinutes} />
        <TextInput
          label={isDefaultSoftware ? "Entregable / qué construí" : "Entregable / qué logré"}
          value={deliverable}
          onChange={setDeliverable}
          placeholder="Ej. Auth, pantalla de progreso…"
        />
        <TextArea label="Notas" value={notes} onChange={setNotes} rows={2} />
        <PrimaryButton
          disabled={busy}
          onClick={() => {
            if (!deliverable.trim() && !notes.trim() && !(Number(minutes) > 0)) return;
            void persist(
              () => {
                addSoftwareSession({
                  date: todayISO(),
                  minutes: Number(minutes) || 0,
                  deliverable: deliverable.trim(),
                  notes: notes.trim(),
                });
              },
              "Sesión guardada en Supabase. Formulario limpio.",
              { clear: clearSessionForm }
            );
          }}
        >
          {busy ? "Guardando…" : "Guardar sesión y limpiar"}
        </PrimaryButton>
        <SaveBanner msg={msg} busy={busy} />
      </GlassCard>

      {/* Historial de sesiones SIEMPRE visible */}
      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Sesiones guardadas</h2>
          <span className="tag tag--accent">{sessionHistory.length}</span>
        </div>
        {sessionHistory.length === 0 ? (
          <p className="text-sm text-white/50 text-center py-4 border border-dashed border-white/15 rounded-xl">
            Aún no hay sesiones. Guarda una arriba.
          </p>
        ) : (
          <ul className="space-y-3 max-h-80 overflow-y-auto">
            {sessionHistory.map((s) => (
              <li key={s.id} className="rounded-xl border border-white/12 bg-black/25 px-3 py-2.5">
                <p className="text-xs text-emerald-200/80">
                  {s.date} · {s.minutes} min
                </p>
                {s.deliverable && (
                  <p className="text-sm text-white font-medium mt-1">{s.deliverable}</p>
                )}
                {s.notes && <p className="text-sm text-white/75 mt-0.5 whitespace-pre-wrap">{s.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Meta semanal</h2>
        <p className="text-xs text-white/55">{weekLabel(week)}</p>
        <TextArea
          label="Qué debe funcionar esta semana"
          value={weekText}
          onChange={setWeekText}
          rows={3}
        />
        <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
          <input
            type="checkbox"
            checked={weekDone}
            onChange={(e) => setWeekDone(e.target.checked)}
            className="accent-emerald-500"
          />
          Completado
        </label>
        <PrimaryButton
          disabled={busy || !weekText.trim()}
          onClick={() =>
            void persist(
              () => {
                saveSoftwareWeekly({
                  week_start: week,
                  deliverable_text: weekText.trim(),
                  done: weekDone,
                });
              },
              "Meta semanal guardada. Formulario limpio.",
              { clear: clearWeeklyForm }
            )
          }
        >
          {busy ? "Guardando…" : "Guardar meta y limpiar"}
        </PrimaryButton>
        <SaveBanner msg={msg} busy={busy} />
      </GlassCard>

      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Metas semanales guardadas</h2>
          <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">
            {weeklyHistory.length}
          </span>
        </div>
        {weeklyHistory.length === 0 ? (
          <p className="text-sm text-white/50 text-center py-4">Sin metas semanales aún.</p>
        ) : (
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {weeklyHistory.map((w) => (
              <li key={w.id || w.week_start} className="rounded-xl border border-white/12 bg-black/25 px-3 py-2.5">
                <div className="flex justify-between gap-2">
                  <span className="text-xs text-white/50">{weekLabel(w.week_start)}</span>
                  <span className={w.done ? "tag tag--ok" : "tag tag--muted"}>
                    {w.done ? "Completada" : "En curso"}
                  </span>
                </div>
                <p className="text-sm text-white mt-1 whitespace-pre-wrap">{w.deliverable_text}</p>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
