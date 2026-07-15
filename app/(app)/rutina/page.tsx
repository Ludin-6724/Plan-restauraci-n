"use client";

import { useEffect, useMemo } from "react";
import { useData } from "@/lib/data-context";
import { todayISO, weekdayIndex } from "@/lib/plan-calendar";
import {
  BLOCK_ORDER,
  BLOCK_TITLES,
  ROUTINE_ITEMS,
  purposeForWeekday,
  type RoutineBlock,
} from "@/lib/seeds/content";
import type { ItemStatus } from "@/lib/types";
import { GlassCard, PageHeader, PrimaryButton } from "@/components/ui/Glass";
import { ArchiveItem, ArchiveSection, SaveBanner } from "@/components/ui/Archive";
import { usePersist } from "@/lib/use-persist";
import { isAutoRoutineKey } from "@/lib/routine-sync";
import { purposeLabelFor, tradingEnabledFor } from "@/lib/purpose";
import { Check, Circle, Minus, Link2 } from "lucide-react";

const CYCLE: ItemStatus[] = ["pending", "done", "partial", "skipped"];

export default function RutinaPage() {
  const { data, ensureDayRoutines, setRoutineStatus } = useData();
  const { persist, msg, busy } = usePersist();
  const date = todayISO();
  const tradingEnabled = tradingEnabledFor(data.profile.settings);
  const dynLabel = purposeLabelFor(data.profile.settings);
  const purpose = purposeForWeekday(weekdayIndex(date), tradingEnabled);
  const purposeDisplay =
    purpose === "trading"
      ? "trading"
      : purpose === "light"
        ? "trabajo ligero"
        : purpose === "rest"
          ? "descanso"
          : dynLabel.toLowerCase();

  useEffect(() => {
    ensureDayRoutines(date);
  }, [date, ensureDayRoutines]);

  const byKey = new Map(data.routines.filter((r) => r.date === date).map((r) => [r.item_key, r]));

  const cycle = (key: string) => {
    const cur = byKey.get(key)?.status ?? "pending";
    const next = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
    setRoutineStatus(date, key, next);
  };

  const done = ROUTINE_ITEMS.filter((i) => {
    const s = byKey.get(i.key)?.status;
    return s === "done" || s === "partial";
  }).length;

  const dayArchive = useMemo(() => {
    const byDate = new Map<string, { done: number; total: number }>();
    for (const r of data.routines) {
      const cur = byDate.get(r.date) ?? { done: 0, total: 0 };
      cur.total += 1;
      if (r.status === "done" || r.status === "partial") cur.done += 1;
      byDate.set(r.date, cur);
    }
    return [...byDate.entries()]
      .map(([d, v]) => ({
        date: d,
        done: v.done,
        total: Math.max(v.total, ROUTINE_ITEMS.length),
        pct: Math.round((v.done / Math.max(v.total, ROUTINE_ITEMS.length)) * 100),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.routines]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rutina del día"
        subtitle={`${done}/${ROUTINE_ITEMS.length} · Propósito: ${purposeDisplay}`}
      />

      <GlassCard className="space-y-2 !py-3">
        <p className="text-sm text-ink flex items-start gap-2">
          <Link2 size={16} className="text-primary-bright shrink-0 mt-0.5" />
          <span>
            <strong>Checks automáticos:</strong> si registras Palabra, verdades, lecturas, diario,
            cuerpo, software o trading, esos ítems se marcan solos. Los demás (oración, sueño…)
            siguen siendo manuales. Toca un ítem para ciclar: hecho → parcial → omitido.
          </span>
        </p>
      </GlassCard>

      {BLOCK_ORDER.map((block: RoutineBlock) => (
        <GlassCard key={block} className="space-y-2">
          <h2 className="text-sm font-semibold text-ink tracking-wide">{BLOCK_TITLES[block]}</h2>
          <div className="space-y-1">
            {ROUTINE_ITEMS.filter((i) => i.block === block).map((item) => {
              const entry = byKey.get(item.key);
              const status = entry?.status ?? "pending";
              const auto = isAutoRoutineKey(item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`check-row w-full text-left ${status === "done" ? "done" : status === "partial" ? "partial" : ""}`}
                  onClick={() => cycle(item.key)}
                >
                  <StatusIcon status={status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink font-medium flex items-center gap-2 flex-wrap">
                      {item.label}
                      {auto && <span className="tag tag--accent !normal-case !tracking-normal">Auto</span>}
                    </p>
                    {item.description && <p className="text-xs text-subtle">{item.description}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCard>
      ))}

      <PrimaryButton
        disabled={busy}
        onClick={() => void persist(() => undefined, "Rutina de hoy confirmada y archivada en la nube.")}
      >
        {busy ? "Guardando…" : "Confirmar y archivar rutina de hoy"}
      </PrimaryButton>
      <SaveBanner msg={msg} busy={busy} />

      <ArchiveSection title="Archivo de rutinas (por día)" count={dayArchive.length}>
        {dayArchive.map((d) => (
          <ArchiveItem
            key={d.date}
            date={d.date}
            title={`${d.done}/${d.total} · ${d.pct}%`}
            badge={d.pct >= 80 ? "Sólido" : d.pct >= 40 ? "Parcial" : "Bajo"}
          />
        ))}
      </ArchiveSection>
    </div>
  );
}

function StatusIcon({ status }: { status: ItemStatus }) {
  if (status === "done") return <Check className="text-primary-bright shrink-0" size={20} />;
  if (status === "partial") return <Minus className="text-warning shrink-0" size={20} />;
  if (status === "skipped") return <Circle className="text-subtle shrink-0 opacity-40" size={20} />;
  return <Circle className="text-subtle shrink-0" size={20} />;
}
