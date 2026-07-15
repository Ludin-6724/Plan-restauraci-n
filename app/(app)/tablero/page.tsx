"use client";

import { useEffect, useMemo } from "react";
import { useData } from "@/lib/data-context";
import { DAY_LABELS, PILLARS, PHASE_MILESTONES } from "@/lib/seeds/content";
import {
  phaseForDay,
  phaseLabel,
  planDayNumber,
  todayISO,
  weekDates,
  weekStartISO,
} from "@/lib/plan-calendar";
import { GlassCard, PageHeader, PrimaryButton } from "@/components/ui/Glass";
import { ArchiveItem, ArchiveSection, SaveBanner } from "@/components/ui/Archive";
import { usePersist } from "@/lib/use-persist";
import { isAutoMilestone } from "@/lib/milestones-sync";
import { purposeLabelFor, tradingEnabledFor } from "@/lib/purpose";

export default function TableroPage() {
  const { data, ensureDayRoutines, toggleMilestone } = useData();
  const { persist, msg, busy } = usePersist();
  const week = weekStartISO();
  const days = weekDates(week);
  const dayNum = planDayNumber(data.profile.plan_start_date, todayISO());
  const phase = phaseForDay(dayNum);
  const tradingEnabled = tradingEnabledFor(data.profile.settings);
  const dynLabel = purposeLabelFor(data.profile.settings);
  const visiblePillars = useMemo(
    () =>
      PILLARS.filter((p) => tradingEnabled || p.key !== "trading").map((p) =>
        p.key === "software" ? { ...p, label: dynLabel } : p
      ),
    [tradingEnabled, dynLabel]
  );

  // Refresca derivados (tablero = espejo de registros)
  useEffect(() => {
    ensureDayRoutines(todayISO());
  }, [ensureDayRoutines]);

  const getCell = (day: string, pillar: string) =>
    data.weekly_board.find((c) => c.week_start === week && c.day === day && c.pillar === pillar);

  const getPanic = (day: string) =>
    data.weekly_board.find((c) => c.week_start === week && c.day === day && c.pillar === "panic");

  const weekArchive = useMemo(() => {
    const weeks = new Set(data.weekly_board.map((c) => c.week_start));
    return [...weeks]
      .sort((a, b) => b.localeCompare(a))
      .map((ws) => {
        const cells = data.weekly_board.filter((c) => c.week_start === ws && c.pillar !== "panic");
        const checked = cells.filter((c) => c.checked).length;
        return { week_start: ws, checked, total: cells.length };
      });
  }, [data.weekly_board]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tablero semanal"
        subtitle={`${phaseLabel(phase)} · Se actualiza solo con lo que registras.`}
      />

      <GlassCard className="space-y-2 !py-3">
        <p className="text-sm text-ink">
          Cada casilla refleja tu actividad real de ese día:
        </p>
        <ul className="text-xs text-muted space-y-1 list-disc pl-4">
          <li>
            <strong className="text-ink">Dios</strong> — Palabra o sesión de verdades
          </li>
          <li>
            <strong className="text-ink">Cuerpo</strong> — ejercicio / caminata
          </li>
          <li>
            <strong className="text-ink">Mente</strong> — lecturas o diario
          </li>
          <li>
            <strong className="text-ink">
              {dynLabel}
              {tradingEnabled ? " / Trading" : ""}
            </strong>{" "}
            — sesiones o journal
          </li>
          <li>
            <strong className="text-ink">Pánico</strong> — intensidad máxima registrada
          </li>
        </ul>
      </GlassCard>

      <GlassCard className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm border-collapse min-w-[520px]">
          <thead>
            <tr>
              <th className="text-left p-2 text-subtle font-medium">Pilar</th>
              {days.map((d, i) => (
                <th key={d} className="p-2 text-muted font-medium">
                  {DAY_LABELS[i]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiblePillars.map((p) => (
              <tr key={p.key} className="border-t border-line">
                <td className="p-2 text-ink">{p.label}</td>
                {days.map((d) => {
                  const cell = getCell(d, p.key);
                  const checked = cell?.checked ?? false;
                  return (
                    <td key={d} className="p-1 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border text-sm ${
                          checked
                            ? "board-cell board-cell--on"
                            : "board-cell board-cell--off"
                        }`}
                        title={checked ? "Registrado" : "Sin registro"}
                        aria-label={`${p.label} ${d}: ${checked ? "sí" : "no"}`}
                      >
                        {checked ? "✓" : ""}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t border-line">
              <td className="p-2 text-ink">Pánico /10</td>
              {days.map((d) => {
                const cell = getPanic(d);
                const score = cell?.panic_score;
                return (
                  <td key={d} className="p-1 text-center">
                    <span className="inline-block min-w-[2rem] text-sm font-medium text-ink tabular-nums">
                      {score != null ? score : "—"}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </GlassCard>

      <PrimaryButton
        disabled={busy}
        onClick={() => void persist(() => undefined, "Tablero de la semana sincronizado con la nube.")}
      >
        {busy ? "Sincronizando…" : "Sincronizar semana con la nube"}
      </PrimaryButton>
      <SaveBanner msg={msg} busy={busy} />

      {([1, 2, 3] as const).map((ph) => (
        <GlassCard key={ph} className="space-y-2">
          <h2 className="text-sm font-semibold text-ink">
            Hitos fase {ph} {phase === ph ? "· actual" : ""}
          </h2>
          <p className="text-xs text-subtle">
            Los marcados <span className="tag tag--accent !normal-case">Auto</span> se completan
            solos al cumplir el criterio. Los de <span className="tag tag--muted">Tú</span> los
            marcas a mano.
          </p>
          {PHASE_MILESTONES[ph].map((m) => {
            const state = data.phase_milestones.find((x) => x.phase === ph && x.key === m.key);
            const auto = isAutoMilestone(m.key);
            return (
              <label key={m.key} className={`check-row ${state?.done ? "done" : ""}`}>
                <input
                  type="checkbox"
                  checked={!!state?.done}
                  onChange={() => {
                    if (auto && state?.done) return; // auto cumplido: no desmarcar a mano
                    toggleMilestone(ph, m.key);
                  }}
                  disabled={auto && !!state?.done}
                  className="mt-1 accent-primary"
                />
                <span className="text-sm text-ink flex-1 flex items-center gap-2 flex-wrap">
                  {m.label}
                  {auto ? (
                    <span className="tag tag--accent !normal-case !tracking-normal">Auto</span>
                  ) : (
                    <span className="tag tag--muted !normal-case !tracking-normal">Tú</span>
                  )}
                </span>
              </label>
            );
          })}
        </GlassCard>
      ))}

      <ArchiveSection title="Archivo de semanas" count={weekArchive.length}>
        {weekArchive.map((w) => (
          <ArchiveItem
            key={w.week_start}
            date={`Semana del ${w.week_start}`}
            title={`${w.checked} marcas guardadas`}
          />
        ))}
      </ArchiveSection>
    </div>
  );
}
