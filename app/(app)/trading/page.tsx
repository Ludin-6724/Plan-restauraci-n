"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { todayISO } from "@/lib/plan-calendar";
import { GlassCard, PageHeader, PrimaryButton, TextArea, TextInput } from "@/components/ui/Glass";
import { SaveBanner } from "@/components/ui/Archive";
import { usePersist } from "@/lib/use-persist";

export default function TradingPage() {
  const { data, updateTradingRules, addTradingEntry, deleteTradingEntry } = useData();
  const { persist, msg, busy } = usePersist();
  const rules = data.trading_rules;

  const [thesis, setThesis] = useState("");
  const [emotion, setEmotion] = useState("5");
  const [result, setResult] = useState("");
  const [lesson, setLesson] = useState("");
  const [skipped, setSkipped] = useState("");

  const threshold = data.profile.settings.panic_skip_trade_threshold;
  const todayPanic = data.panic_episodes.find((e) => e.started_at.startsWith(todayISO()));
  const warn =
    todayPanic && todayPanic.intensity_before >= threshold
      ? `Hoy registraste pánico ≥ ${threshold}. Considera no operar o reducir tamaño.`
      : null;

  const history = useMemo(
    () => [...(data.trading_entries ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
    [data.trading_entries]
  );

  const clearForm = () => {
    setThesis("");
    setResult("");
    setLesson("");
    setSkipped("");
    setEmotion("5");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Trading · calls y puts"
        subtitle="Guarda → se limpia el cuadro → ves la entrada abajo (Supabase)."
      />

      {warn && (
        <GlassCard className="border-amber-400/30">
          <p className="text-sm text-amber-100">{warn}</p>
        </GlassCard>
      )}

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Reglas de riesgo</h2>
        <TextInput
          label="Pérdida máxima diaria"
          type="number"
          value={String(rules.max_daily_loss)}
          onChange={(v) => updateTradingRules({ ...rules, max_daily_loss: Number(v) || 0 })}
        />
        <TextInput
          label="Pérdida máxima semanal"
          type="number"
          value={String(rules.max_weekly_loss)}
          onChange={(v) => updateTradingRules({ ...rules, max_weekly_loss: Number(v) || 0 })}
        />
        <TextArea
          label="Reglas escritas"
          value={rules.rules_text}
          onChange={(v) => updateTradingRules({ ...rules, rules_text: v })}
          rows={3}
        />
        <PrimaryButton
          disabled={busy}
          onClick={() =>
            void persist(() => updateTradingRules({ ...rules }), "Reglas guardadas en Supabase.")
          }
        >
          Guardar reglas
        </PrimaryButton>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Nueva entrada del journal</h2>
        <TextArea label="Tesis" value={thesis} onChange={setThesis} rows={2} />
        <TextInput label="Emoción 1–10" type="number" value={emotion} onChange={setEmotion} />
        <TextInput label="Resultado" value={result} onChange={setResult} placeholder="PnL o resultado" />
        <TextArea label="Lección" value={lesson} onChange={setLesson} rows={2} />
        <TextInput
          label="Si no operé: razón"
          value={skipped}
          onChange={setSkipped}
          placeholder="pánico / sueño / regla"
        />
        <PrimaryButton
          disabled={busy}
          onClick={() =>
            void persist(
              () => {
                addTradingEntry({
                  date: todayISO(),
                  thesis: thesis.trim(),
                  emotion: Number(emotion) || 0,
                  result: result.trim(),
                  lesson: lesson.trim(),
                  skipped_reason: skipped.trim(),
                });
              },
              "Entrada guardada. Formulario limpio.",
              { clear: clearForm }
            )
          }
        >
          {busy ? "Guardando…" : "Guardar y limpiar"}
        </PrimaryButton>
        <SaveBanner msg={msg} busy={busy} />
      </GlassCard>

      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Journal guardado</h2>
          <span className="tag tag--accent">{history.length}</span>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-white/50 text-center py-4 border border-dashed border-white/15 rounded-xl">
            Sin entradas. Guarda una arriba y la verás aquí.
          </p>
        ) : (
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((e) => (
              <li key={e.id} className="rounded-xl border border-white/12 bg-black/25 px-3 py-2.5 space-y-1">
                <div className="flex justify-between gap-2">
                  <p className="text-xs text-emerald-200/80">{e.date}</p>
                  <button
                    type="button"
                    className="text-[10px] text-rose-200 underline"
                    onClick={() => {
                      if (confirm("¿Borrar esta entrada?")) {
                        void persist(() => deleteTradingEntry(e.id), "Entrada borrada.");
                      }
                    }}
                  >
                    Borrar
                  </button>
                </div>
                {e.skipped_reason ? (
                  <p className="text-sm text-amber-100">No operé: {e.skipped_reason}</p>
                ) : (
                  <>
                    <p className="text-sm text-white font-medium">{e.thesis || "—"}</p>
                    <p className="text-xs text-white/60">
                      Emoción {e.emotion} · {e.result || "—"}
                    </p>
                    {e.lesson && (
                      <p className="text-sm text-white/80 whitespace-pre-wrap">Lección: {e.lesson}</p>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
