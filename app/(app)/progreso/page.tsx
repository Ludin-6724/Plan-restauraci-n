"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { todayISO } from "@/lib/plan-calendar";
import { computeDailyScore } from "@/lib/scoring";
import { GlassCard, PageHeader } from "@/components/ui/Glass";

export default function ProgresoPage() {
  const { data } = useData();
  const today = todayISO();
  const scores = useMemo(() => {
    if (data.daily_scores?.length) return data.daily_scores.slice(-30);
    // fallback compute
    const days: string[] = [];
    const d = new Date();
    for (let i = 29; i >= 0; i--) {
      const x = new Date(d);
      x.setDate(x.getDate() - i);
      days.push(x.toISOString().slice(0, 10));
    }
    let prev: number | null = null;
    return days.map((date) => {
      const s = computeDailyScore(data, date, prev);
      prev = s.score;
      return s;
    });
  }, [data]);

  const [selected, setSelected] = useState(today);
  const current = scores.find((s) => s.date === selected) || scores[scores.length - 1];
  const max = Math.max(100, ...scores.map((s) => s.score), 1);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Progreso"
        subtitle="Gráfico de los últimos 30 días. Verde = bien · Amarillo = medio · Rojo = bajo. Toca un día para ver por qué."
      />

      <GlassCard className="space-y-4">
        <div className="flex items-end gap-1 h-40">
          {scores.map((s) => {
            const h = Math.max(4, (s.score / max) * 100);
            const color =
              s.score >= 75 ? "bg-primary-bright" : s.score >= 45 ? "bg-warning" : "bg-danger";
            const active = s.date === selected;
            return (
              <button
                key={s.date}
                type="button"
                title={`${s.date}: ${s.score}`}
                onClick={() => setSelected(s.date)}
                className={`flex-1 min-w-0 rounded-t transition ${color} ${
                  active ? "ring-2 ring-white opacity-100" : "opacity-80 hover:opacity-100"
                }`}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-subtle">
          <span>{scores[0]?.date}</span>
          <span>Hoy</span>
        </div>
      </GlassCard>

      {current && (
        <GlassCard className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">{current.date}</h2>
            <p className="text-3xl font-bold text-white">
              {current.score}
              <span className="text-sm font-normal text-subtle">/100</span>
            </p>
          </div>
          <p
            className={`text-sm font-medium ${
              current.delta > 0
                ? "text-primary-bright"
                : current.delta < 0
                  ? "text-danger-text"
                  : "text-muted"
            }`}
          >
            {current.delta > 0 && `↑ Subiste ${current.delta} pts vs día anterior`}
            {current.delta < 0 && `↓ Bajaste ${Math.abs(current.delta)} pts vs día anterior`}
            {current.delta === 0 && "→ Sin cambio vs día anterior"}
          </p>

          {current.reasons_up.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-primary-bright mb-1">Por qué subiste / cumpliste</p>
              <ul className="text-sm text-muted space-y-1 list-disc pl-5">
                {current.reasons_up.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {current.reasons_down.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-danger-text mb-1">Por qué bajaste / te descuidaste</p>
              <ul className="text-sm text-muted space-y-1 list-disc pl-5">
                {current.reasons_down.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-muted pt-2 border-t border-line">
            {Object.entries(current.breakdown).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="capitalize">{k}</span>
                <span>{Math.round(v * 100)}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
