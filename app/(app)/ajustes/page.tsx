"use client";

import { useRef, useState } from "react";
import { useData } from "@/lib/data-context";
import { GlassCard, PageHeader, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui/Glass";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signOut } from "@/lib/supabase/auth";
import { SOUND_SCENES } from "@/components/forest/ForestAudio";
import { ThemePicker } from "@/components/theme/ThemePicker";
import { getPack } from "@/lib/packs";
import { FOCUS_AREAS, buildPlanSummary, type FocusId } from "@/lib/focus-areas";

export default function AjustesPage() {
  const { data, user, cloudStatus, updateProfile, updateSettings, exportJson, importJson, resetAll, forceSync } =
    useData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const supabaseOk = isSupabaseConfigured();
  const pack = getPack(data.profile.settings.content_pack_id);
  const focusAreas = (data.profile.settings.focus_areas || []) as FocusId[];
  const primaryFocus = data.profile.settings.primary_focus || "";

  return (
    <div className="space-y-5">
      <PageHeader title="Ajustes" subtitle="Perfil, tema y preferencias." />

      <div id="perfil">
      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">1 · Perfil</h2>
        <TextInput label="Nombre" value={data.profile.name} onCommit={(v) => updateProfile({ name: v })} />
        <TextInput
          label="Inicio del plan"
          type="date"
          value={data.profile.plan_start_date}
          onChange={(v) => updateProfile({ plan_start_date: v })}
        />
        <TextInput
          label="Meta de hora de sueño"
          type="time"
          value={data.profile.settings.sleep_goal}
          onCommit={(v) => updateSettings({ sleep_goal: v })}
        />
        <TextInput
          label="Umbral pánico para no tradear (1–10)"
          type="number"
          value={String(data.profile.settings.panic_skip_trade_threshold)}
          onChange={(v) => updateSettings({ panic_skip_trade_threshold: Number(v) || 7 })}
        />
      </GlassCard>
      </div>

      <div id="tema">
      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">2 · Tema de color</h2>
        <p className="text-xs text-subtle">
          Elige la paleta que más te ayude a bajar la ansiedad.
        </p>
        <ThemePicker />
      </GlassCard>
      </div>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Sesión</h2>
        {user ? (
          <>
            <p className="text-sm text-muted">
              Conectado: <span className="text-primary-bright">{user.email}</span>
            </p>
            <p className="text-xs text-subtle">Nube: {cloudStatus}</p>
            <div className="flex flex-wrap gap-2">
              <PrimaryButton
                onClick={async () => {
                  await forceSync();
                  setMsg("Sincronizado con la nube.");
                }}
              >
                Forzar sync ahora
              </PrimaryButton>
              <SecondaryButton
                onClick={async () => {
                  await signOut();
                  window.location.href = "/";
                }}
              >
                Cerrar sesión
              </SecondaryButton>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">
            {supabaseOk ? "Sin sesión (recarga para login)." : "Supabase no configurado."}
          </p>
        )}
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Plantilla de contenido</h2>
        <p className="text-sm text-muted">
          Plantilla de partida:{" "}
          <strong className="text-ink">{pack.label}</strong>
        </p>
        <p className="text-xs text-subtle">{pack.description}</p>
        <TextInput
          label="Frase de temporada (panel Hoy)"
          value={data.profile.settings.season_phrase || pack.season_phrase}
          onCommit={(v) => updateSettings({ season_phrase: v })}
        />
        <p className="text-[11px] text-subtle">
          Tus verdades y registros no se borran al cambiar la frase. Las plantillas solo se eligen
          al empezar (onboarding). Edita frases en Verdades → Administrar.
        </p>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Enfoque del plan</h2>
        <p className="text-xs text-subtle">
          Ordena Registrar y tu mensaje de plan. No quita funciones: solo prioriza.
        </p>
        <div className="flex flex-wrap gap-2">
          {FOCUS_AREAS.map((f) => {
            const on = focusAreas.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  const next = on
                    ? focusAreas.filter((x) => x !== f.id)
                    : [...focusAreas, f.id];
                  let pri = primaryFocus;
                  if (pri && !next.includes(pri as FocusId)) pri = next[0] || "";
                  if (!pri && next.length) pri = next[0];
                  updateSettings({ focus_areas: next, primary_focus: pri });
                }}
                className={`text-xs rounded-full border px-3 py-1.5 ${
                  on ? "bg-primary border-primary text-white" : "border-line text-ink bg-surface-soft"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        {focusAreas.length > 0 && (
          <>
            <p className="text-xs font-medium text-ink">Prioridad</p>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((id) => {
                const f = FOCUS_AREAS.find((x) => x.id === id)!;
                const on = primaryFocus === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => updateSettings({ primary_focus: id })}
                    className={`text-xs rounded-xl border px-3 py-1.5 ${
                      on ? "border-primary bg-primary/12 font-semibold" : "border-line text-muted"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {buildPlanSummary(focusAreas, primaryFocus)}
            </p>
          </>
        )}
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Bosque (audio)</h2>
        <label className="flex items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={data.profile.settings.audio_muted}
            onChange={(e) => updateSettings({ audio_muted: e.target.checked })}
            className="accent-primary"
          />
          Silenciado
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">Volumen</span>
          <VolumeSlider
            value={data.profile.settings.audio_volume}
            onCommit={(v) => updateSettings({ audio_volume: v })}
          />
        </label>
        <div className="space-y-1.5">
          <span className="text-sm text-muted">Sonido ambiente</span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {SOUND_SCENES.map(({ id, label, icon: Icon }) => {
              const active = (data.profile.settings.audio_scene ?? "bosque") === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => updateSettings({ audio_scene: id })}
                  className={`choice-chip${active ? " choice-chip--active" : ""}`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Respaldo local (extra)</h2>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            onClick={() => {
              const blob = new Blob([exportJson()], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `bosque-restauracion-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              setMsg("Exportado.");
            }}
          >
            Exportar JSON
          </PrimaryButton>
          <SecondaryButton onClick={() => fileRef.current?.click()}>Importar JSON</SecondaryButton>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                importJson(await file.text());
                setMsg("Importado.");
              } catch {
                setMsg("Error al importar.");
              }
            }}
          />
        </div>
        {msg && <p className="text-xs text-primary-bright">{msg}</p>}
      </GlassCard>

      <GlassCard className="space-y-2 border-danger/45">
        <h2 className="text-sm font-semibold text-danger-text">Zona de peligro</h2>
        <SecondaryButton
          onClick={() => {
            if (confirm("¿Borrar datos locales y reiniciar? La nube se actualizará al sync.")) {
              resetAll();
              setMsg("Reiniciado.");
            }
          }}
        >
          Reiniciar plan local
        </SecondaryButton>
      </GlassCard>
    </div>
  );
}

/** Slider de volumen: arrastra en local y guarda una sola vez al soltar. */
function VolumeSlider({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const [draft, setDraft] = useState(value);
  const [dirty, setDirty] = useState(false);
  const shown = dirty ? draft : value;
  const commit = () => {
    if (dirty && draft !== value) onCommit(draft);
    setDirty(false);
  };
  return (
    <input
      type="range"
      min={0.05}
      max={0.6}
      step={0.01}
      value={shown}
      onChange={(e) => {
        setDraft(Number(e.target.value));
        setDirty(true);
      }}
      onPointerUp={commit}
      onKeyUp={commit}
      onBlur={commit}
      className="w-full accent-primary"
    />
  );
}
