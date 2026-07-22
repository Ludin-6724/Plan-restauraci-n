"use client";

import { useEffect, useState } from "react";
import { PANIC_STEPS } from "@/lib/seeds/content";
import { useData } from "@/lib/data-context";
import { GlassCard, PrimaryButton, SecondaryButton, TextArea, TextInput } from "@/components/ui/Glass";
import { ThemePickerCompact } from "@/components/theme/ThemePicker";

type Phase = "before" | "steps" | "breath" | "after";

export function PanicProtocol({ onClose }: { onClose?: () => void }) {
  const { addPanicEpisode } = useData();
  const [phase, setPhase] = useState<Phase>("before");
  const [step, setStep] = useState(0);
  const [intensityBefore, setIntensityBefore] = useState(7);
  const [intensityAfter, setIntensityAfter] = useState(4);
  const [trigger, setTrigger] = useState("");
  const [helped, setHelped] = useState("");
  const [notes, setNotes] = useState("");
  const [breathPhase, setBreathPhase] = useState<"in" | "hold1" | "out" | "hold2">("in");
  const [breathCount, setBreathCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [breathing, setBreathing] = useState(false);

  useEffect(() => {
    if (!breathing) return;
    const labels: Array<"in" | "hold1" | "out" | "hold2"> = ["in", "hold1", "out", "hold2"];
    let phaseIdx = 0;
    let count = 4;

    const tick = window.setInterval(() => {
      count -= 1;
      if (count <= 0) {
        phaseIdx = (phaseIdx + 1) % 4;
        count = 4;
        if (phaseIdx === 0) setCycles((c) => c + 1);
        setBreathPhase(labels[phaseIdx]);
      }
      setBreathCount(count);
    }, 1000);

    return () => clearInterval(tick);
  }, [breathing]);

  const scale = breathPhase === "in" ? 1.15 : breathPhase === "out" ? 0.85 : 1;
  const label =
    breathPhase === "in"
      ? "Inhala"
      : breathPhase === "hold1"
        ? "Sostén"
        : breathPhase === "out"
          ? "Exhala"
          : "Sostén";

  const save = () => {
    addPanicEpisode({
      started_at: new Date().toISOString(),
      intensity_before: intensityBefore,
      intensity_after: intensityAfter,
      trigger,
      helped,
      notes,
      protocol_completed: true,
    });
    onClose?.();
  };

  return (
    <GlassCard className="space-y-4 max-w-xl mx-auto border-danger/35">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink">Protocolo de pánico</h2>
        {onClose && (
          <button type="button" className="text-sm text-muted hover:text-ink" onClick={onClose}>
            Cerrar
          </button>
        )}
      </div>

      {phase === "before" && (
        <>
          <p className="text-sm text-muted">
            Estás a salvo en este momento. Vamos paso a paso. Primero, ¿qué tan intenso se siente?
            (1–10)
          </p>
          <div className="space-y-1.5">
            <p className="text-xs text-subtle">¿Este color no te da paz ahora? Cámbialo al instante:</p>
            <ThemePickerCompact />
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={intensityBefore}
            onChange={(e) => setIntensityBefore(Number(e.target.value))}
            className="w-full accent-danger"
          />
          <p className="text-center text-3xl font-bold text-danger-text">{intensityBefore}</p>
          <PrimaryButton
            className="w-full"
            onClick={() => {
              setPhase("steps");
              setStep(0);
            }}
          >
            Empezar protocolo
          </PrimaryButton>
        </>
      )}

      {phase === "steps" && (
        <>
          <div className="text-xs text-subtle">
            Paso {step + 1} de {PANIC_STEPS.length}
          </div>
          <h3 className="text-lg font-medium text-ink">{PANIC_STEPS[step].title}</h3>
          <p className="text-muted leading-relaxed">{PANIC_STEPS[step].body}</p>
          {PANIC_STEPS[step].key === "respiracion" && (
            <SecondaryButton onClick={() => setPhase("breath")}>Abrir respiración caja</SecondaryButton>
          )}
          <div className="flex gap-2">
            {step > 0 && (
              <SecondaryButton onClick={() => setStep((s) => s - 1)}>Atrás</SecondaryButton>
            )}
            {step < PANIC_STEPS.length - 1 ? (
              <PrimaryButton className="flex-1" onClick={() => setStep((s) => s + 1)}>
                Siguiente
              </PrimaryButton>
            ) : (
              <PrimaryButton className="flex-1" onClick={() => setPhase("after")}>
                Registrar y cerrar
              </PrimaryButton>
            )}
          </div>
        </>
      )}

      {phase === "breath" && (
        <>
          <p className="text-sm text-center text-muted">Respiración 4-4-4-4 · Ciclos: {cycles}</p>
          <div className="flex justify-center py-4">
            <div className="breath-circle" style={{ transform: `scale(${scale})` }}>
              <div className="text-center">
                <div className="text-sm text-primary-bright">{label}</div>
                <div className="text-4xl font-bold text-ink">{breathCount}</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <SecondaryButton
              onClick={() => {
                if (!breathing) {
                  setBreathPhase("in");
                  setBreathCount(4);
                }
                setBreathing((b) => !b);
              }}
            >
              {breathing ? "Pausar" : "Iniciar"}
            </SecondaryButton>
            <PrimaryButton
              className="flex-1"
              onClick={() => {
                setBreathing(false);
                setPhase("steps");
              }}
            >
              Volver a pasos
            </PrimaryButton>
          </div>
        </>
      )}

      {phase === "after" && (
        <>
          <p className="text-sm text-muted">¿Cómo te sientes ahora? (1–10)</p>
          <input
            type="range"
            min={1}
            max={10}
            value={intensityAfter}
            onChange={(e) => setIntensityAfter(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-center text-2xl font-bold text-primary-bright">{intensityAfter}</p>
          <TextInput label="¿Qué lo disparó? (si lo sabes)" value={trigger} onChange={setTrigger} />
          <TextInput label="¿Qué te ayudó?" value={helped} onChange={setHelped} />
          <TextArea label="Notas" value={notes} onChange={setNotes} rows={2} />
          <PrimaryButton className="w-full" onClick={save}>
            Guardar episodio
          </PrimaryButton>
        </>
      )}
    </GlassCard>
  );
}
