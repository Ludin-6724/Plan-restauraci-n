"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { BLOCK_LABELS, type TruthBlock } from "@/lib/seeds/content";
import { GlassCard, PageHeader, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui/Glass";
import { ArchiveItem, ArchiveSection, SaveBanner } from "@/components/ui/Archive";
import { usePersist } from "@/lib/use-persist";
import { Mic, Square, Sun, Sunset, Moon, Settings2, Play } from "lucide-react";

type Panel = "practicar" | "administrar";

export default function VerdadesPage() {
  const { data, toggleTruthActive, addCustomTruth, updateTruth, deleteTruth, logTruthSession } = useData();
  const { persist, msg, busy } = usePersist();
  const [panel, setPanel] = useState<Panel>("practicar");
  const [mode, setMode] = useState<"list" | "session">("list");
  const [slot, setSlot] = useState<"morning" | "mid" | "night">("morning");
  const [idx, setIdx] = useState(0);
  const [reps, setReps] = useState(0);
  const [newText, setNewText] = useState("");
  const [newBlock, setNewBlock] = useState<TruthBlock>("A");
  const [speaking, setSpeaking] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const active = useMemo(
    () => data.truths.filter((t) => t.is_active).sort((a, b) => a.sort_order - b.sort_order),
    [data.truths]
  );

  const sessions = useMemo(
    () => [...(data.truth_sessions ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
    [data.truth_sessions]
  );

  const startSession = (s: typeof slot) => {
    if (!active.length) {
      setPanel("administrar");
      return;
    }
    setSlot(s);
    setIdx(0);
    setReps(0);
    setMode("session");
  };

  const stopSpeak = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 0.9;
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const next = () => {
    setReps((r) => r + 1);
    if (idx < active.length - 1) setIdx((i) => i + 1);
    else {
      void persist(() => {
        logTruthSession(
          slot,
          active.map((t) => t.id),
          reps + 1
        );
      }, "Sesión de verdades archivada.");
      setMode("list");
      stopSpeak();
    }
  };

  if (mode === "session" && active.length) {
    const t = active[idx];
    return (
      <div className="mx-auto max-w-lg space-y-5 min-h-[70vh] flex flex-col justify-center px-1">
        <p className="text-center text-xs text-subtle">
          Sesión {slot === "morning" ? "mañana" : slot === "mid" ? "mediodía" : "noche"} · {idx + 1}/
          {active.length}
        </p>
        <GlassCard className="text-center space-y-4 py-10">
          <p className="text-xs uppercase tracking-widest text-primary-bright">
            Bloque {t.block} · {BLOCK_LABELS[t.block]}
          </p>
          <p className="text-xl sm:text-2xl leading-relaxed text-ink font-medium px-2">{t.text}</p>
          <div className="flex justify-center">
            <SecondaryButton onClick={() => (speaking ? stopSpeak() : speak(t.text))}>
              {speaking ? <Square size={16} /> : <Mic size={16} />}
              {speaking ? "Detener" : "Escuchar"}
            </SecondaryButton>
          </div>
        </GlassCard>
        <PrimaryButton className="w-full" onClick={next} disabled={busy}>
          {idx < active.length - 1 ? "Siguiente verdad" : busy ? "Archivando…" : "Completar y archivar sesión"}
        </PrimaryButton>
        <SecondaryButton
          className="w-full"
          onClick={() => {
            setMode("list");
            stopSpeak();
          }}
        >
          Salir de la sesión
        </SecondaryButton>
        <SaveBanner msg={msg} busy={busy} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Verdades"
        subtitle="Practica las frases activas. Agregar o borrar va en otra pestaña."
      />

      {/* Selector de panel: centrado */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl border border-line bg-surface-soft/50 p-1 gap-1">
          <button
            type="button"
            onClick={() => setPanel("practicar")}
            className={`verdades-tab ${panel === "practicar" ? "verdades-tab--on" : ""}`}
          >
            <Play size={14} />
            Practicar
          </button>
          <button
            type="button"
            onClick={() => setPanel("administrar")}
            className={`verdades-tab ${panel === "administrar" ? "verdades-tab--on" : ""}`}
          >
            <Settings2 size={14} />
            Administrar
          </button>
        </div>
      </div>

      {panel === "practicar" && (
        <div className="space-y-5">
          <GlassCard className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-base font-semibold text-ink">Elegir sesión</h2>
              <p className="text-xs text-subtle">
                {active.length
                  ? `${active.length} verdad${active.length === 1 ? "" : "es"} activas en esta sesión`
                  : "No hay verdades activas. Ve a Administrar y marca al menos una."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 max-w-md mx-auto w-full">
              <PrimaryButton
                className="w-full sm:flex-1 justify-center"
                onClick={() => startSession("morning")}
                disabled={!active.length}
              >
                <Sun size={16} />
                Mañana
              </PrimaryButton>
              <SecondaryButton
                className="w-full sm:flex-1 justify-center"
                onClick={() => startSession("mid")}
                disabled={!active.length}
              >
                <Sunset size={16} />
                Mediodía
              </SecondaryButton>
              <SecondaryButton
                className="w-full sm:flex-1 justify-center"
                onClick={() => startSession("night")}
                disabled={!active.length}
              >
                <Moon size={16} />
                Noche
              </SecondaryButton>
            </div>

            {!active.length && (
              <p className="text-center text-sm text-muted">
                <button
                  type="button"
                  className="text-primary-bright underline font-medium"
                  onClick={() => setPanel("administrar")}
                >
                  Ir a Administrar frases →
                </button>
              </p>
            )}
          </GlassCard>

          {active.length > 0 && (
            <GlassCard className="space-y-2">
              <h2 className="text-sm font-semibold text-ink text-center">En tu sesión de hoy</h2>
              <p className="text-[11px] text-subtle text-center mb-2">
                Solo lectura. Para activar, editar o borrar usa Administrar.
              </p>
              <ol className="space-y-2 max-h-56 overflow-y-auto">
                {active.map((t, i) => (
                  <li
                    key={t.id}
                    className="text-sm text-ink leading-snug rounded-xl border border-line bg-surface-soft/30 px-3 py-2"
                  >
                    <span className="text-[10px] text-subtle font-medium">
                      {i + 1}. Bloque {t.block}
                    </span>
                    <p className="mt-0.5">{t.text}</p>
                  </li>
                ))}
              </ol>
            </GlassCard>
          )}

          <ArchiveSection title="Últimas sesiones" count={sessions.length}>
            {sessions.slice(0, 12).map((s) => (
              <ArchiveItem
                key={s.id}
                date={s.date}
                title={`Sesión ${s.slot === "morning" ? "mañana" : s.slot === "mid" ? "mediodía" : "noche"}`}
                body={`${s.reps_total || s.truth_ids?.length || 0} repeticiones / verdades`}
                badge={s.completed ? "Completada" : undefined}
              />
            ))}
          </ArchiveSection>
        </div>
      )}

      {panel === "administrar" && (
        <div className="space-y-5">
          <GlassCard className="space-y-2 !py-3">
            <p className="text-sm text-ink text-center">
              Aquí <strong>agregas, editas, activas o borras</strong> frases. Lo que esté{" "}
              <strong>activo</strong> entra en Practicar.
            </p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold text-ink">Añadir verdad personal</h2>
            <TextInput
              label="Texto en presente (ej. «Estoy a salvo en este momento»)"
              value={newText}
              onChange={setNewText}
            />
            <label className="block space-y-1.5">
              <span className="text-sm text-muted">Bloque</span>
              <select
                className="input-field"
                value={newBlock}
                onChange={(e) => setNewBlock(e.target.value as TruthBlock)}
              >
                {(["A", "B", "C", "D"] as TruthBlock[]).map((b) => (
                  <option key={b} value={b}>
                    {b} · {BLOCK_LABELS[b]}
                  </option>
                ))}
              </select>
            </label>
            <PrimaryButton
              className="w-full sm:w-auto"
              disabled={busy || !newText.trim()}
              onClick={() => {
                if (!newText.trim()) return;
                void persist(
                  () => {
                    addCustomTruth(newText.trim(), newBlock);
                  },
                  "Verdad guardada.",
                  {
                    clear: () => {
                      setNewText("");
                      setNewBlock("A");
                    },
                  }
                );
              }}
            >
              Guardar frase
            </PrimaryButton>
            <SaveBanner msg={msg} busy={busy} />
          </GlassCard>

          {(["A", "B", "C", "D"] as TruthBlock[]).map((block) => {
            const list = data.truths
              .filter((t) => t.block === block)
              .sort((a, b) => a.sort_order - b.sort_order);
            if (!list.length) return null;
            return (
              <GlassCard key={block} className="space-y-2">
                <h2 className="text-sm font-semibold text-primary-bright">
                  {block} · {BLOCK_LABELS[block]}
                </h2>
                {list.map((t) => (
                  <div key={t.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                    {editId === t.id ? (
                      <div className="space-y-2">
                        <TextInput label="Texto" value={editText} onChange={setEditText} />
                        <div className="flex flex-wrap gap-2">
                          <PrimaryButton
                            onClick={() =>
                              void persist(() => {
                                updateTruth(t.id, editText);
                                setEditId(null);
                              }, "Verdad actualizada.")
                            }
                          >
                            Guardar
                          </PrimaryButton>
                          <SecondaryButton onClick={() => setEditId(null)}>Cancelar</SecondaryButton>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <label className="flex items-center gap-2 shrink-0 pt-0.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={t.is_active}
                            onChange={() => toggleTruthActive(t.id)}
                            className="accent-primary w-4 h-4"
                          />
                          <span className="text-[10px] text-subtle uppercase tracking-wide w-10">
                            {t.is_active ? "On" : "Off"}
                          </span>
                        </label>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink leading-snug">{t.text}</p>
                          <div className="flex gap-4 mt-1.5">
                            <button
                              type="button"
                              className="text-xs text-primary-bright underline"
                              onClick={() => {
                                setEditId(t.id);
                                setEditText(t.text);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="text-xs text-danger-text underline"
                              onClick={() => {
                                if (confirm("¿Borrar esta verdad?")) deleteTruth(t.id);
                              }}
                            >
                              Borrar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </GlassCard>
            );
          })}

          <div className="flex justify-center pt-1">
            <SecondaryButton onClick={() => setPanel("practicar")}>
              <Play size={14} />
              Volver a Practicar
            </SecondaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
