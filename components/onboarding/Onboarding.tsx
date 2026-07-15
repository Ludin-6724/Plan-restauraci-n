"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { todayISO } from "@/lib/plan-calendar";
import { CONTENT_PACKS, DEFAULT_PACK_ID, getPack, type ContentPackId } from "@/lib/packs";
import { BLOCK_LABELS, type TruthBlock } from "@/lib/seeds/content";
import { FOCUS_AREAS, buildPlanSummary, type FocusId } from "@/lib/focus-areas";
import { GlassCard, PrimaryButton, SecondaryButton, TextInput, TextArea } from "@/components/ui/Glass";
import { TreePine } from "lucide-react";

/** Pack neutro usado como esqueleto (libros/hitos/santidad) cuando el usuario escribe sus propias verdades. */
const MANUAL_SKELETON_PACK_ID: ContentPackId = "reprogramar-calma";

export function Onboarding() {
  const { completeOnboarding, updateSettings } = useData();
  const [name, setName] = useState("");
  const [start, setStart] = useState(todayISO());
  const [accepted, setAccepted] = useState(false);
  const [packId, setPackId] = useState<ContentPackId>(DEFAULT_PACK_ID);
  const [focusIds, setFocusIds] = useState<FocusId[]>([]);
  const [primary, setPrimary] = useState<FocusId | "">("");
  const [focusNote, setFocusNote] = useState("");
  const [step, setStep] = useState(0);

  const [contentMode, setContentMode] = useState<"pack" | "manual">("pack");
  const [manualTruths, setManualTruths] = useState<{ text: string; block: TruthBlock }[]>([]);
  const [manualText, setManualText] = useState("");
  const [manualBlock, setManualBlock] = useState<TruthBlock>("A");
  const [manualSeasonPhrase, setManualSeasonPhrase] = useState("");
  const [manualBooks, setManualBooks] = useState<{ title: string; author: string }[]>([]);
  const [manualBookTitle, setManualBookTitle] = useState("");
  const [manualBookAuthor, setManualBookAuthor] = useState("");
  const [purposeLabel, setPurposeLabel] = useState("");
  const [tradingEnabled, setTradingEnabled] = useState(false);

  const pack = getPack(packId);
  const planPreview = useMemo(
    () => buildPlanSummary(focusIds, primary || focusIds[0]),
    [focusIds, primary]
  );

  const toggleFocus = (id: FocusId) => {
    setFocusIds((prev) => {
      const on = prev.includes(id);
      const next = on ? prev.filter((x) => x !== id) : [...prev, id];
      if (primary && !next.includes(primary as FocusId)) {
        setPrimary(next[0] ?? "");
      }
      if (!primary && next.length === 1) setPrimary(next[0]);
      return next;
    });
  };

  const addManualTruth = () => {
    if (!manualText.trim()) return;
    setManualTruths((prev) => [...prev, { text: manualText.trim(), block: manualBlock }]);
    setManualText("");
  };

  const removeManualTruth = (idx: number) => {
    setManualTruths((prev) => prev.filter((_, i) => i !== idx));
  };

  const addManualBook = () => {
    if (!manualBookTitle.trim()) return;
    setManualBooks((prev) => [
      ...prev,
      { title: manualBookTitle.trim(), author: manualBookAuthor.trim() },
    ]);
    setManualBookTitle("");
    setManualBookAuthor("");
  };

  const removeManualBook = (idx: number) => {
    setManualBooks((prev) => prev.filter((_, i) => i !== idx));
  };

  const finish = () => {
    if (!name.trim() || !accepted) return;
    if (contentMode === "manual" && manualTruths.length < 1) return;
    const areas = focusIds.length ? focusIds : (["mente"] as FocusId[]);
    const pri = primary && areas.includes(primary as FocusId) ? primary : areas[0];
    const effectivePackId = contentMode === "manual" ? MANUAL_SKELETON_PACK_ID : packId;
    completeOnboarding(
      name.trim(),
      start,
      effectivePackId,
      {
        areas,
        primary: pri,
        note: focusNote.trim(),
      },
      {
        truths: contentMode === "manual" ? manualTruths : [],
        seasonPhrase: contentMode === "manual" ? manualSeasonPhrase : undefined,
        books: contentMode === "manual" ? manualBooks : undefined,
        purposeLabel,
        tradingEnabled,
      }
    );
    updateSettings({ audio_muted: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <GlassCard className="card-spiritual w-full max-w-lg space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center gap-2 text-spiritual sticky top-0 bg-inherit pb-1 z-10">
          <TreePine />
          <span className="font-semibold tracking-wide">Bosque de Restauración</span>
          <span className="ml-auto text-[10px] text-subtle">{step + 1}/6</span>
        </div>

        {step === 0 && (
          <>
            <h1 className="text-2xl font-semibold text-ink">Bienvenido al bosque</h1>
            <p className="text-muted text-sm leading-relaxed">
              Aquí reprogramas lo que se grabó en el subconsciente con práctica diaria: verdades,
              calma, cuerpo y propósito. Primero entendemos <strong className="text-ink">qué se te
              repite</strong> y luego armamos tu plan — sin IA y sin diagnóstico.
            </p>
            <PrimaryButton onClick={() => setStep(1)} className="w-full">
              Empezar
            </PrimaryButton>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-ink">¿Por qué funciona esto?</h2>
            <p className="text-muted text-sm leading-relaxed">
              No es magia ni fuerza de voluntad. Son 3 ideas simples detrás del plan:
            </p>
            <ul className="text-sm text-muted space-y-3 list-disc pl-5">
              <li>
                <strong className="text-ink">Repetir verdades reentrena la mente automática.</strong>{" "}
                Los pensamientos que se disparan solos (miedo, vergüenza, «no valgo») se grabaron con
                repetición. Se cambian igual: repitiendo frases nuevas a diario hasta que se vuelven
                automáticas también.
              </li>
              <li>
                <strong className="text-ink">La respiración interrumpe el pánico en el cuerpo.</strong>{" "}
                El pánico es una reacción física, no solo mental. Respirar pausado y guiado le manda
                al cuerpo la señal de que no hay peligro real, y baja la intensidad en minutos.
              </li>
              <li>
                <strong className="text-ink">90 días en fases, no todo a la vez.</strong> Intentar
                arreglarlo todo junto agota y hace que abandones rápido. Ir por fases con metas
                pequeñas es lo que sostiene el cambio en el tiempo.
              </li>
            </ul>
            <PrimaryButton onClick={() => setStep(2)} className="w-full">
              Entiendo, seguir
            </PrimaryButton>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-ink">Límites de seguridad</h2>
            <ul className="text-sm text-muted space-y-2 list-disc pl-5">
              <li>No sustituye médico, psiquiatra o psicólogo.</li>
              <li>No cambies medicación sin tu profesional.</li>
              <li>Crisis grave o ideas de daño: ayuda inmediata / urgencias.</li>
              <li>Éxito = un día bien vivido, no perfección.</li>
            </ul>
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 accent-primary"
              />
              <span>He leído y acepto. Caminaré con paciencia.</span>
            </label>
            <PrimaryButton onClick={() => accepted && setStep(3)} disabled={!accepted} className="w-full">
              Continuar
            </PrimaryButton>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold text-ink">¿Qué se te activa?</h2>
            <p className="text-sm text-muted">
              Marca todo lo que resuene. Luego elige <strong className="text-ink">una prioridad</strong>.
              No es un diagnóstico: ordena tu menú y tu plan de repetición.
            </p>
            <div className="flex flex-wrap gap-2">
              {FOCUS_AREAS.map((f) => {
                const on = focusIds.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFocus(f.id)}
                    className={`text-left text-xs rounded-full border px-3 py-2 transition ${
                      on
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface-soft border-line text-ink"
                    }`}
                    style={on ? { color: "var(--on-primary, #fff)" } : undefined}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            {focusIds.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-ink">Prioridad principal</p>
                <div className="flex flex-wrap gap-2">
                  {focusIds.map((id) => {
                    const f = FOCUS_AREAS.find((x) => x.id === id)!;
                    const on = primary === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPrimary(id)}
                        className={`text-xs rounded-xl border px-3 py-2 ${
                          on ? "border-primary bg-primary/15 font-semibold text-ink" : "border-line text-muted"
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <TextArea
              label="Opcional: ¿qué frase o miedo se te repite solo?"
              value={focusNote}
              onChange={setFocusNote}
              rows={2}
              placeholder="Ej. «No valgo si no me aprueban»…"
            />
            <PrimaryButton
              onClick={() => setStep(4)}
              disabled={!focusIds.length || !primary}
              className="w-full"
            >
              Continuar
            </PrimaryButton>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-xl font-semibold text-ink">Tu plan de salida</h2>
            <p className="text-sm text-muted leading-relaxed border border-line rounded-xl p-3 bg-surface-soft/40">
              {planPreview}
            </p>
            <p className="text-xs text-subtle">
              En la app verás <strong className="text-ink">Registrar</strong> por secciones: prioridad,
              calma, mente, propósito y estructura. Todas las funciones siguen ahí.
            </p>
            <h3 className="text-sm font-semibold text-ink pt-1">Tu propósito</h3>
            <TextInput
              label="¿En qué querés poner tu enfoque? (estudio, arte, negocio, software, lo que sea)"
              value={purposeLabel}
              onChange={setPurposeLabel}
              placeholder={
                contentMode === "pack" ? pack.purpose_hint : "Ej. «Arte», «Mi negocio», «Estudio»…"
              }
            />
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={tradingEnabled}
                onChange={(e) => setTradingEnabled(e.target.checked)}
                className="mt-1 accent-primary"
              />
              <span>También quiero activar el módulo de Trading (journal, reglas de riesgo, PnL).</span>
            </label>

            <h3 className="text-sm font-semibold text-ink pt-1">Tus frases</h3>
            <div className="flex rounded-2xl border border-line bg-surface-soft/50 p-1 gap-1">
              <button
                type="button"
                onClick={() => setContentMode("pack")}
                className={`flex-1 text-xs rounded-xl py-2 transition ${
                  contentMode === "pack" ? "bg-primary text-on-primary" : "text-ink"
                }`}
                style={contentMode === "pack" ? { color: "var(--on-primary, #fff)" } : undefined}
              >
                Usar plantilla
              </button>
              <button
                type="button"
                onClick={() => setContentMode("manual")}
                className={`flex-1 text-xs rounded-xl py-2 transition ${
                  contentMode === "manual" ? "bg-primary text-on-primary" : "text-ink"
                }`}
                style={contentMode === "manual" ? { color: "var(--on-primary, #fff)" } : undefined}
              >
                Escribir las mías
              </button>
            </div>

            {contentMode === "pack" && (
              <div className="space-y-2">
                {CONTENT_PACKS.map((p) => {
                  const on = p.id === packId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPackId(p.id)}
                      className={`w-full text-left rounded-2xl border p-3 transition ${
                        on ? "nav-tile nav-tile--active" : "nav-tile"
                      }`}
                    >
                      <p className="nav-tile__title text-sm font-semibold">{p.label}</p>
                      <p className="nav-tile__hint text-xs mt-1">{p.blurb}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {contentMode === "manual" && (
              <div className="space-y-3">
                <p className="text-xs text-subtle leading-relaxed">
                  Escribe frases en presente que sean verdad para ti (ej. «Estoy a salvo en este
                  momento»). Puedes editarlas o añadir más después, en Verdades → Administrar.
                </p>
                <TextArea
                  label="Frase de tu temporada (opcional, se ve en tu inicio)"
                  value={manualSeasonPhrase}
                  onChange={setManualSeasonPhrase}
                  rows={2}
                  placeholder="Ej. «Esta no es mi caída final; es mi temporada de restauración.»"
                />
                <TextInput
                  label="Nueva frase"
                  value={manualText}
                  onChange={setManualText}
                  placeholder="Ej. «Este sentimiento es intenso, pero no es peligroso.»"
                />
                <label className="block space-y-1.5">
                  <span className="text-sm text-muted">Bloque</span>
                  <select
                    className="input-field"
                    value={manualBlock}
                    onChange={(e) => setManualBlock(e.target.value as TruthBlock)}
                  >
                    {(["A", "B", "C", "D"] as TruthBlock[]).map((b) => (
                      <option key={b} value={b}>
                        {b} · {BLOCK_LABELS[b]}
                      </option>
                    ))}
                  </select>
                </label>
                <SecondaryButton onClick={addManualTruth} disabled={!manualText.trim()} className="w-full">
                  Añadir frase
                </SecondaryButton>

                {manualTruths.length > 0 && (
                  <ol className="space-y-2 max-h-40 overflow-y-auto">
                    {manualTruths.map((t, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm rounded-xl border border-line bg-surface-soft/30 px-3 py-2"
                      >
                        <span className="flex-1">
                          <span className="text-[10px] text-subtle font-medium block">
                            Bloque {t.block}
                          </span>
                          {t.text}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-danger-text underline shrink-0"
                          onClick={() => removeManualTruth(i)}
                        >
                          Borrar
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
                <p className="text-xs text-subtle">
                  {manualTruths.length === 0
                    ? "Añade al menos una frase para continuar."
                    : `${manualTruths.length} frase${manualTruths.length === 1 ? "" : "s"} lista${
                        manualTruths.length === 1 ? "" : "s"
                      }.`}
                </p>

                <h3 className="text-sm font-semibold text-ink pt-2">Tus lecturas (opcional)</h3>
                <p className="text-xs text-subtle leading-relaxed">
                  Libros que quieras seguir en la app (progreso semanal en Lecturas). Puedes añadir
                  o quitar más después en Lecturas → Administrar.
                </p>
                <TextInput
                  label="Título del libro"
                  value={manualBookTitle}
                  onChange={setManualBookTitle}
                  placeholder="Ej. «El poder de la mente subconsciente»"
                />
                <TextInput
                  label="Autor (opcional)"
                  value={manualBookAuthor}
                  onChange={setManualBookAuthor}
                  placeholder="Ej. «Joseph Murphy»"
                />
                <SecondaryButton
                  onClick={addManualBook}
                  disabled={!manualBookTitle.trim()}
                  className="w-full"
                >
                  Añadir libro
                </SecondaryButton>

                {manualBooks.length > 0 && (
                  <ol className="space-y-2 max-h-40 overflow-y-auto">
                    {manualBooks.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm rounded-xl border border-line bg-surface-soft/30 px-3 py-2"
                      >
                        <span className="flex-1">
                          <span className="text-ink">{b.title}</span>
                          {b.author && <span className="text-subtle"> — {b.author}</span>}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-danger-text underline shrink-0"
                          onClick={() => removeManualBook(i)}
                        >
                          Borrar
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            <PrimaryButton
              onClick={() => setStep(5)}
              disabled={contentMode === "manual" && manualTruths.length < 1}
              className="w-full"
            >
              Continuar
            </PrimaryButton>
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="text-xl font-semibold text-ink">Tu inicio</h2>
            <TextInput label="¿Cómo te llamas?" value={name} onChange={setName} placeholder="Tu nombre" />
            <TextInput
              label="Fecha de inicio del plan (Día 1)"
              value={start}
              onChange={setStart}
              type="date"
            />
            <p className="text-xs text-subtle leading-relaxed">
              {contentMode === "manual" ? (
                <>
                  Frases <strong className="text-ink">escritas por ti</strong> ({manualTruths.length})
                </>
              ) : (
                <>
                  Plantilla <strong className="text-ink">{pack.label}</strong>
                </>
              )}
              {primary ? (
                <>
                  {" "}
                  · Prioridad:{" "}
                  <strong className="text-ink">
                    {FOCUS_AREAS.find((f) => f.id === primary)?.label}
                  </strong>
                </>
              ) : null}
              .
            </p>
            <PrimaryButton onClick={finish} disabled={!name.trim()} className="w-full">
              Entrar a mi bosque
            </PrimaryButton>
            <button
              type="button"
              className="text-xs text-muted underline w-full text-center"
              onClick={() => setStep(3)}
            >
              Volver a las preguntas
            </button>
          </>
        )}
      </GlassCard>
    </div>
  );
}
