"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useData, useRoutineCompletion, useStreak } from "@/lib/data-context";
import {
  formatDisplayDate,
  phaseForDay,
  phaseLabel,
  planDayNumber,
  todayISO,
} from "@/lib/plan-calendar";
import { purposeForWeekday, PHASE_MILESTONES } from "@/lib/seeds/content";
import { getPack } from "@/lib/packs";
import { buildPlanSummary, getFocus } from "@/lib/focus-areas";
import { purposeLabelFor, tradingEnabledFor } from "@/lib/purpose";
import { weekdayIndex } from "@/lib/plan-calendar";
import { GlassCard, PageHeader, PrimaryButton } from "@/components/ui/Glass";
import { HeartPulse, TrendingUp, Check, Circle } from "lucide-react";
import { computeDailyScore } from "@/lib/scoring";
import {
  averageScore,
  pillarStatus,
  primaryActionFromReasons,
  scoreBarClass,
  scoresForLastDays,
} from "@/lib/home-insights";

export default function DashboardPage() {
  const { data } = useData();
  const today = todayISO();
  const dayNum = planDayNumber(data.profile.plan_start_date, today);
  const phase = phaseForDay(dayNum);
  const completion = useRoutineCompletion(today);
  const streak = useStreak();
  const tradingEnabled = tradingEnabledFor(data.profile.settings);
  const dynLabel = purposeLabelFor(data.profile.settings);
  const purpose = purposeForWeekday(weekdayIndex(today), tradingEnabled);

  const recentPanic = data.panic_episodes.slice(0, 5);
  const avgPanic =
    recentPanic.length > 0
      ? (
          recentPanic.reduce((a, e) => a + e.intensity_before, 0) / recentPanic.length
        ).toFixed(1)
      : null;

  const milestones = data.phase_milestones.filter((m) => m.phase === phase);
  const milestonesDone = milestones.filter((m) => m.done).length;
  const milestoneDefs =
    phase <= 3 ? PHASE_MILESTONES[phase as 1 | 2 | 3] : [];

  const last14 = useMemo(() => scoresForLastDays(data, 14), [data]);
  const last7 = last14.slice(-7);
  const prev7 = last14.slice(0, 7);
  const avg7 = averageScore(last7);
  const avgPrev7 = averageScore(prev7);
  const weekDelta =
    avg7 != null && avgPrev7 != null && prev7.some((s) => s.score > 0) ? avg7 - avgPrev7 : null;

  const todayScore =
    data.daily_scores?.find((s) => s.date === today) ??
    last7[last7.length - 1] ??
    computeDailyScore(data, today, null);

  const pillars = useMemo(() => pillarStatus(todayScore), [todayScore]);
  const pillarsDone = pillars.filter((p) => p.done).length;

  // Propósito: chip enlaza a software o trading según el día
  const purposeHref =
    purpose === "trading" ? "/trading" : purpose === "rest" ? "/palabra" : "/software";

  const action = primaryActionFromReasons(todayScore.reasons_down, purposeHref, dynLabel);

  const purposeLabel =
    purpose === "software"
      ? `Hoy: bloque de ${dynLabel.toLowerCase()}`
      : purpose === "trading"
        ? "Hoy: bloque de trading"
        : purpose === "light"
          ? "Hoy: trabajo ligero / repaso"
          : "Hoy: descanso y prioridad espiritual";

  const seasonPhrase =
    data.profile.settings.season_phrase?.trim() ||
    getPack(data.profile.settings.content_pack_id).season_phrase;

  const planSummary = buildPlanSummary(
    data.profile.settings.focus_areas || [],
    data.profile.settings.primary_focus
  );
  const primaryLabel = getFocus(data.profile.settings.primary_focus)?.label;

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Hola, ${data.profile.name || "amigo"}`}
        subtitle={formatDisplayDate(today)}
      />

      <GlassCard className="card-spiritual space-y-3">
        <p className="text-xs uppercase tracking-widest text-spiritual">Frase de temporada</p>
        <p className="text-sm sm:text-base leading-relaxed text-ink italic">{seasonPhrase}</p>
      </GlassCard>

      {(primaryLabel || (data.profile.settings.focus_areas || []).length > 0) && (
        <GlassCard className="space-y-2">
          <h2 className="text-sm font-semibold text-ink">Tu plan integral</h2>
          {primaryLabel && (
            <p className="text-xs text-primary-bright font-medium">Prioridad: {primaryLabel}</p>
          )}
          <p className="text-sm text-muted leading-relaxed">{planSummary}</p>
          <p className="text-[11px] text-subtle">
            En <strong className="text-ink">Registrar</strong> verás secciones (prioridad, calma,
            mente, propósito…). Todas las funciones siguen disponibles.
          </p>
        </GlassCard>
      )}

      {/* ——— Tu avance ——— */}
      <GlassCard className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Tu avance</p>
            <p className="text-4xl font-bold text-ink tabular-nums">
              {todayScore.score}
              <span className="text-base font-normal text-subtle">/100</span>
            </p>
            {todayScore.delta !== 0 && (
              <p
                className={`text-sm mt-0.5 ${
                  todayScore.delta > 0 ? "text-primary-bright" : "text-danger-text"
                }`}
              >
                {todayScore.delta > 0 ? `↑ +${todayScore.delta}` : `↓ ${todayScore.delta}`} vs ayer
              </p>
            )}
          </div>
          <Link
            href="/progreso"
            className="shrink-0 inline-flex items-center gap-1 text-xs text-primary-bright underline"
          >
            <TrendingUp size={14} /> 30 días
          </Link>
        </div>

        {/* Sparkline 7 días */}
        <div>
          <div className="flex items-end gap-1 h-16">
            {last7.map((s) => {
              const h = Math.max(8, (s.score / 100) * 100);
              const isToday = s.date === today;
              return (
                <div
                  key={s.date}
                  className={`flex-1 min-w-0 rounded-t transition ${scoreBarClass(s.score)} ${
                    isToday ? "ring-2 ring-primary-bright/60 opacity-100" : "opacity-85"
                  }`}
                  style={{ height: `${h}%` }}
                  title={`${s.date}: ${s.score}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-subtle mt-1">
            <span>Hace 6 días</span>
            <span>Hoy</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <p className="text-muted">
            Promedio 7d:{" "}
            <strong className="text-ink">{avg7 != null ? avg7 : "—"}</strong>
          </p>
          {weekDelta != null && weekDelta !== 0 && (
            <p className={weekDelta > 0 ? "text-primary-bright" : "text-danger-text"}>
              {weekDelta > 0 ? `↑ +${weekDelta}` : `↓ ${weekDelta}`} vs semana anterior
            </p>
          )}
        </div>
      </GlassCard>

      {/* ——— Hoy por pilares ——— */}
      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">Hoy por pilares</h2>
          <span className="text-xs text-subtle">
            {pillarsDone}/{pillars.length} en buen estado
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pillars.map((p) => {
            const href = p.key === "proposito" ? purposeHref : p.href;
            return (
              <Link
                key={p.key}
                href={href}
                className={`pillar-chip ${p.done ? "pillar-chip--done" : "pillar-chip--todo"}`}
              >
                {p.done ? <Check size={12} strokeWidth={2.5} /> : <Circle size={12} />}
                {p.label}
                {p.key === "rutina" && (
                  <span className="opacity-80">{completion.percent}%</span>
                )}
              </Link>
            );
          })}
        </div>
      </GlassCard>

      {/* ——— Camino del plan ——— */}
      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Camino del plan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Stat label="Día del plan" value={String(dayNum)} />
          <Stat label="Rutina hoy" value={`${completion.percent}%`} accent />
          <Stat label="Racha ≥80%" value={`${streak}d`} accent />
          <Stat label="Pánico avg" value={avgPanic ?? "—"} />
        </div>
        <div className="pt-1 border-t border-line space-y-1">
          <p className="text-sm font-medium text-spiritual">{phaseLabel(phase)}</p>
          {phase <= 3 && milestoneDefs.length > 0 && (
            <p className="text-xs text-subtle">
              Hitos de fase: {milestonesDone}/{milestoneDefs.length}
              {milestonesDone < milestoneDefs.length
                ? " · sigue marcando en Progreso / Tablero"
                : " · fase en buen ritmo"}
            </p>
          )}
          <p className="text-xs text-muted">{purposeLabel}</p>
        </div>
      </GlassCard>

      {/* ——— Para subir hoy ——— */}
      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Para subir el score hoy</h2>
        {todayScore.reasons_down.length === 0 ? (
          <p className="text-sm text-primary-bright">
            Muy bien: no hay huecos graves en el score de hoy. Mantén la racha.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {todayScore.reasons_down.slice(0, 3).map((r) => (
              <li key={r} className="text-sm text-danger-text flex gap-2">
                <span className="shrink-0">·</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}
        {todayScore.reasons_up.length > 0 && (
          <ul className="space-y-1 border-t border-line pt-2">
            {todayScore.reasons_up.slice(0, 2).map((r) => (
              <li key={r} className="text-xs text-primary-bright flex gap-2">
                <span>✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href={action.href}>
          <PrimaryButton className="w-full sm:w-auto">{action.label}</PrimaryButton>
        </Link>
        <p className="text-[11px] text-subtle">
          Para anotar otras áreas usa <strong className="text-ink">Registrar</strong> abajo (móvil) o
          el menú.
        </p>
      </GlassCard>

      <Link href="/panico" className="block">
        <div className="panic-cta rounded-2xl p-4 flex items-center gap-3">
          <HeartPulse className="text-white shrink-0" size={28} />
          <div>
            <p className="font-semibold text-white">Estoy en pánico</p>
            <p className="text-xs text-white/80">Protocolo de 10 minutos · un tap</p>
          </div>
        </div>
      </Link>

      <p className="text-[11px] text-subtle text-center pb-4">
        No sustituye atención médica. No cambies medicación sin tu profesional de salud.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-soft/40 px-3 py-2">
      <p className="text-[10px] text-subtle uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${accent ? "text-primary-bright" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
