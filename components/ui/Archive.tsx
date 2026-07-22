"use client";

import type { ReactNode } from "react";
import { GlassCard } from "./Glass";

export function SaveBanner({ msg, busy }: { msg?: string; busy?: boolean }) {
  if (!msg && !busy) return null;
  const isError = msg?.includes("No se pudo") || msg?.includes("Error");
  return (
    <p
      className={`text-sm px-3 py-2 rounded-xl border ${
        isError
          ? "bg-amber-500/15 text-warning border-warning/30"
          : "tag-banner-ok"
      }`}
    >
      {busy ? "Guardando y archivando…" : msg}
    </p>
  );
}

export function ArchiveSection({
  title,
  empty,
  children,
  count,
}: {
  title: string;
  empty?: string;
  children: ReactNode;
  count?: number;
}) {
  return (
    <GlassCard className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {typeof count === "number" && (
          <span className="tag tag--accent">{count} en archivo</span>
        )}
      </div>
      {count === 0 ? (
        <p className="text-sm text-muted">{empty || "Aún no hay registros. Lo que guardes aparecerá aquí."}</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">{children}</div>
      )}
    </GlassCard>
  );
}

export function ArchiveItem({
  date,
  title,
  body,
  badge,
  onDelete,
}: {
  date?: string;
  title?: string;
  body?: string;
  badge?: string;
  onDelete?: () => void;
}) {
  return (
    <div className="border-b border-line pb-2 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {date && <p className="text-[11px] text-subtle">{date}</p>}
          {title && <p className="text-sm text-ink font-medium">{title}</p>}
          {body && <p className="text-sm text-muted whitespace-pre-wrap mt-0.5">{body}</p>}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {badge && <span className="tag tag--ok">{badge}</span>}
          {onDelete && (
            <button type="button" onClick={onDelete} className="text-[10px] text-danger-text underline">
              Borrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
