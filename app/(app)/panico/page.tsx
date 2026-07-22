"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { PanicProtocol } from "@/components/panic/PanicProtocol";
import { GlassCard, PageHeader, PrimaryButton } from "@/components/ui/Glass";
import { ArchiveItem, ArchiveSection } from "@/components/ui/Archive";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function PanicoPage() {
  const { data, deletePanicEpisode, forceSync } = useData();
  const [open, setOpen] = useState(false);
  const episodes = useMemo(
    () => [...(data.panic_episodes ?? [])].sort((a, b) => b.started_at.localeCompare(a.started_at)),
    [data.panic_episodes]
  );
  const max = Math.max(10, ...episodes.map((e) => e.intensity_before), 1);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pánico"
        subtitle="Cada episodio que registres queda en el archivo con intensidad y notas."
      />

      {!open ? (
        <PrimaryButton className="w-full py-4 text-lg" onClick={() => setOpen(true)}>
          Estoy en pánico — iniciar protocolo
        </PrimaryButton>
      ) : (
        <PanicProtocol
          onClose={() => {
            setOpen(false);
            void forceSync();
          }}
        />
      )}

      {episodes.length > 0 && (
        <GlassCard className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Intensidad (reciente)</h2>
          <div className="flex items-end gap-1 h-28">
            {[...episodes].slice(0, 20).reverse().map((e) => (
              <div key={e.id} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <div
                  className="w-full rounded-t bg-rose-400/80"
                  style={{ height: `${(e.intensity_before / max) * 100}%`, minHeight: 4 }}
                  title={`${e.intensity_before}${e.intensity_after != null ? ` → ${e.intensity_after}` : ""}`}
                />
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <ArchiveSection title="Archivo de episodios" count={episodes.length} empty="Aún no hay episodios. Al terminar el protocolo se archivan solos.">
        {episodes.map((e) => (
          <ArchiveItem
            key={e.id}
            date={format(parseISO(e.started_at), "d MMM yyyy · HH:mm", { locale: es })}
            title={`Intensidad ${e.intensity_before}${e.intensity_after != null ? ` → ${e.intensity_after}` : ""}`}
            body={[e.trigger && `Disparador: ${e.trigger}`, e.helped && `Ayudó: ${e.helped}`, e.notes]
              .filter(Boolean)
              .join("\n")}
            badge={e.protocol_completed ? "Protocolo" : undefined}
            onDelete={() => {
              deletePanicEpisode(e.id);
              void forceSync();
            }}
          />
        ))}
      </ArchiveSection>

      <GlassCard>
        <p className="text-xs text-white/50 leading-relaxed">
          Si el pánico es severo o hay ideas de daño: médico, urgencias o línea de crisis. Esta app
          acompaña; no reemplaza tratamiento.
        </p>
      </GlassCard>
    </div>
  );
}
