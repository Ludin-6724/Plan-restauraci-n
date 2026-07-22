"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { todayISO } from "@/lib/plan-calendar";
import { GlassCard, PageHeader, PrimaryButton, SecondaryButton, TextArea, TextInput } from "@/components/ui/Glass";
import { ArchiveItem, ArchiveSection, SaveBanner } from "@/components/ui/Archive";
import { usePersist } from "@/lib/use-persist";

export default function SantidadPage() {
  const { data, addHolinessLine, removeHolinessLine, addHolinessLog, updateSettings } = useData();
  const { persist, msg, busy } = usePersist();
  const [newLine, setNewLine] = useState("");
  const [note, setNote] = useState("");
  const settings = data.profile.settings;

  const logs = useMemo(
    () => [...(data.holiness_logs ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
    [data.holiness_logs]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Santidad sin dualidad"
        subtitle="Líneas y registros de luz se guardan en tu archivo privado."
      />

      <GlassCard className="space-y-2">
        <h2 className="text-sm font-semibold text-white">Líneas no negociables</h2>
        {data.holiness_lines.map((h) => (
          <div key={h.id} className="flex items-start justify-between gap-2 check-row">
            <span className="text-sm text-white">{h.text}</span>
            <button type="button" className="text-xs text-rose-200" onClick={() => removeHolinessLine(h.id)}>
              Quitar
            </button>
          </div>
        ))}
        <TextInput label="Nueva línea" value={newLine} onChange={setNewLine} />
        <SecondaryButton
          disabled={busy}
          onClick={() => {
            if (!newLine.trim()) return;
            void persist(() => {
              addHolinessLine(newLine.trim());
              setNewLine("");
            }, "Línea añadida y archivada.");
          }}
        >
          Añadir línea
        </SecondaryButton>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Log de luz (privado)</h2>
        <TextArea label="Nota breve (opcional)" value={note} onChange={setNote} rows={2} />
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            disabled={busy}
            onClick={() =>
              void persist(
                () => {
                  addHolinessLog({ date: todayISO(), type: "confession", note });
                },
                "Registrado. Nota limpia.",
                { clear: () => setNote("") }
              )
            }
          >
            Confesé y me levanto
          </PrimaryButton>
          <SecondaryButton
            disabled={busy}
            onClick={() =>
              void persist(
                () => {
                  addHolinessLog({ date: todayISO(), type: "integrity", note });
                },
                "Registrado. Nota limpia.",
                { clear: () => setNote("") }
              )
            }
          >
            Paso de integridad
          </SecondaryButton>
        </div>
        <SaveBanner msg={msg} busy={busy} />
      </GlassCard>

      <ArchiveSection title="Archivo de luz" count={logs.length}>
        {logs.map((l) => (
          <ArchiveItem
            key={l.id}
            date={l.date}
            title={l.type === "confession" ? "Confesión / me levanto" : "Paso de integridad"}
            body={l.note || undefined}
          />
        ))}
      </ArchiveSection>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Hermano / contacto de confianza</h2>
        <TextInput
          label="Nombre"
          value={settings.trust_contact_name}
          onChange={(v) => updateSettings({ trust_contact_name: v })}
        />
        <TextInput
          label="Nota (cómo contactar)"
          value={settings.trust_contact_note}
          onChange={(v) => updateSettings({ trust_contact_note: v })}
        />
        <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
          <input
            type="checkbox"
            checked={settings.no_preach_for_now}
            onChange={(e) => updateSettings({ no_preach_for_now: e.target.checked })}
            className="accent-emerald-500"
          />
          Por ahora no predico
        </label>
        <PrimaryButton
          disabled={busy}
          onClick={() => void persist(() => updateSettings({ ...settings }), "Contacto y preferencias guardados.")}
        >
          Guardar contacto
        </PrimaryButton>
      </GlassCard>
    </div>
  );
}
