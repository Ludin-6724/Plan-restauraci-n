"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Trees, CloudRain, Waves, Flame, Moon, ChevronDown } from "lucide-react";
import { useData } from "@/lib/data-context";
import type { SoundScene } from "@/lib/types";

export const SOUND_SCENES: { id: SoundScene; label: string; icon: typeof Trees }[] = [
  { id: "bosque", label: "Bosque", icon: Trees },
  { id: "lluvia", label: "Lluvia", icon: CloudRain },
  { id: "rio", label: "Río", icon: Waves },
  { id: "fuego", label: "Fogata", icon: Flame },
  { id: "noche", label: "Noche", icon: Moon },
];

export function sceneLabel(scene: SoundScene): string {
  return SOUND_SCENES.find((s) => s.id === scene)?.label ?? "Bosque";
}

type NodeBag = { nodes: AudioNode[]; intervals: number[] };

function makeNoiseBuffer(ctx: AudioContext, smoothing: number, gainMul: number) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + smoothing * white) / (1 + smoothing);
    data[i] = last * gainMul;
  }
  return buffer;
}

/** Bosque: viento filtrado + zumbido lejano + pájaros ocasionales. */
function buildBosque(ctx: AudioContext, master: GainNode, bag: NodeBag) {
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx, 0.02, 3.5);
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 400;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.35;
  noise.connect(filter);
  filter.connect(windGain);
  windGain.connect(master);
  noise.start();
  bag.nodes.push(noise, filter, windGain);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 110;
  const oscGain = ctx.createGain();
  oscGain.gain.value = 0.03;
  osc.connect(oscGain);
  oscGain.connect(master);
  osc.start();
  bag.nodes.push(osc, oscGain);

  const chirp = () => {
    if (ctx.state === "closed") return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    const f0 = 1800 + Math.random() * 1200;
    o.frequency.setValueAtTime(f0, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(f0 * 1.4, ctx.currentTime + 0.08);
    o.frequency.exponentialRampToValueAtTime(f0 * 0.9, ctx.currentTime + 0.18);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    o.connect(g);
    g.connect(master);
    o.start();
    o.stop(ctx.currentTime + 0.25);
  };
  const id = window.setInterval(() => {
    if (Math.random() > 0.45) chirp();
  }, 2800 + Math.random() * 2000);
  bag.intervals.push(id);
}

/** Lluvia: ruido brillante filtrado + goteo ocasional más grueso. */
function buildLluvia(ctx: AudioContext, master: GainNode, bag: NodeBag) {
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx, 0.35, 1.4);
  noise.loop = true;
  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 900;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 5200;
  const rainGain = ctx.createGain();
  rainGain.gain.value = 0.45;
  noise.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(rainGain);
  rainGain.connect(master);
  noise.start();
  bag.nodes.push(noise, highpass, lowpass, rainGain);

  const rumbleNoise = ctx.createBufferSource();
  rumbleNoise.buffer = makeNoiseBuffer(ctx, 0.015, 3);
  rumbleNoise.loop = true;
  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = "lowpass";
  rumbleFilter.frequency.value = 180;
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0.08;
  rumbleNoise.connect(rumbleFilter);
  rumbleFilter.connect(rumbleGain);
  rumbleGain.connect(master);
  rumbleNoise.start();
  bag.nodes.push(rumbleNoise, rumbleFilter, rumbleGain);

  const drop = () => {
    if (ctx.state === "closed") return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(900 + Math.random() * 400, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.05, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    o.connect(g);
    g.connect(master);
    o.start();
    o.stop(ctx.currentTime + 0.16);
  };
  const id = window.setInterval(() => {
    if (Math.random() > 0.35) drop();
  }, 400 + Math.random() * 500);
  bag.intervals.push(id);
}

/** Río: ruido con filtro resonante que fluctúa (corriente de agua). */
function buildRio(ctx: AudioContext, master: GainNode, bag: NodeBag) {
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx, 0.08, 2.6);
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 650;
  filter.Q.value = 4;
  const gain = ctx.createGain();
  gain.gain.value = 0.4;
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  noise.start();
  bag.nodes.push(noise, filter, gain);

  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.12;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 220;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
  bag.nodes.push(lfo, lfoGain);

  const shimmer = ctx.createBufferSource();
  shimmer.buffer = makeNoiseBuffer(ctx, 0.5, 0.9);
  shimmer.loop = true;
  const shimmerFilter = ctx.createBiquadFilter();
  shimmerFilter.type = "highpass";
  shimmerFilter.frequency.value = 2200;
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = 0.05;
  shimmer.connect(shimmerFilter);
  shimmerFilter.connect(shimmerGain);
  shimmerGain.connect(master);
  shimmer.start();
  bag.nodes.push(shimmer, shimmerFilter, shimmerGain);
}

/** Fogata: rumor bajo cálido + chisporroteo aleatorio. */
function buildFuego(ctx: AudioContext, master: GainNode, bag: NodeBag) {
  const rumble = ctx.createBufferSource();
  rumble.buffer = makeNoiseBuffer(ctx, 0.02, 3.2);
  rumble.loop = true;
  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = "lowpass";
  rumbleFilter.frequency.value = 220;
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0.22;
  rumble.connect(rumbleFilter);
  rumbleFilter.connect(rumbleGain);
  rumbleGain.connect(master);
  rumble.start();
  bag.nodes.push(rumble, rumbleFilter, rumbleGain);

  const crackle = () => {
    if (ctx.state === "closed") return;
    const o = ctx.createBufferSource();
    o.buffer = makeNoiseBuffer(ctx, 0.6, 1.2);
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1400 + Math.random() * 2200;
    filter.Q.value = 3;
    g.gain.setValueAtTime(0.08 + Math.random() * 0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05 + Math.random() * 0.05);
    o.connect(filter);
    filter.connect(g);
    g.connect(master);
    o.start();
    o.stop(ctx.currentTime + 0.12);
  };
  const id = window.setInterval(() => {
    if (Math.random() > 0.3) crackle();
  }, 150 + Math.random() * 350);
  bag.intervals.push(id);
}

/** Noche: cama de aire suave + grillos con trémolo rítmico. */
function buildNoche(ctx: AudioContext, master: GainNode, bag: NodeBag) {
  const bed = ctx.createBufferSource();
  bed.buffer = makeNoiseBuffer(ctx, 0.03, 2.2);
  bed.loop = true;
  const bedFilter = ctx.createBiquadFilter();
  bedFilter.type = "lowpass";
  bedFilter.frequency.value = 320;
  const bedGain = ctx.createGain();
  bedGain.gain.value = 0.14;
  bed.connect(bedFilter);
  bedFilter.connect(bedGain);
  bedGain.connect(master);
  bed.start();
  bag.nodes.push(bed, bedFilter, bedGain);

  const cricket = ctx.createOscillator();
  cricket.type = "sine";
  cricket.frequency.value = 3200;
  const tremolo = ctx.createOscillator();
  tremolo.type = "sine";
  tremolo.frequency.value = 22;
  const tremoloGain = ctx.createGain();
  tremoloGain.gain.value = 0.028;
  const cricketGain = ctx.createGain();
  cricketGain.gain.value = 0.03;
  tremolo.connect(tremoloGain);
  tremoloGain.connect(cricketGain.gain);
  cricket.connect(cricketGain);
  cricketGain.connect(master);
  cricket.start();
  tremolo.start();
  bag.nodes.push(cricket, tremolo, tremoloGain, cricketGain);

  const pulse = () => {
    if (ctx.state === "closed") return;
    cricketGain.gain.setTargetAtTime(0.05, ctx.currentTime, 0.02);
    window.setTimeout(() => {
      if (ctx.state !== "closed") cricketGain.gain.setTargetAtTime(0.03, ctx.currentTime, 0.15);
    }, 700 + Math.random() * 400);
  };
  const id = window.setInterval(pulse, 1600 + Math.random() * 900);
  bag.intervals.push(id);
}

const SCENE_BUILDERS: Record<SoundScene, (ctx: AudioContext, master: GainNode, bag: NodeBag) => void> = {
  bosque: buildBosque,
  lluvia: buildLluvia,
  rio: buildRio,
  fuego: buildFuego,
  noche: buildNoche,
};

/**
 * Genera ambientes sonoros sintéticos (sin archivos externos) usando Web Audio API.
 * El usuario puede alternar entre varias escenas: bosque, lluvia, río, fogata o noche.
 */
export function ForestAudio() {
  const { data, updateSettings } = useData();
  const muted = data.profile.settings.audio_muted;
  const volume = data.profile.settings.audio_volume;
  const scene = data.profile.settings.audio_scene ?? "bosque";
  const [started, setStarted] = useState(false);
  const [localVol, setLocalVol] = useState(volume);
  const [pickerOpen, setPickerOpen] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const intervalsRef = useRef<number[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  const stop = () => {
    intervalsRef.current.forEach((id) => clearInterval(id));
    intervalsRef.current = [];
    nodesRef.current.forEach((n) => {
      try {
        if ("stop" in n && typeof (n as OscillatorNode).stop === "function") {
          (n as OscillatorNode).stop();
        }
        n.disconnect();
      } catch {
        /* ignore */
      }
    });
    nodesRef.current = [];
    if (ctxRef.current) {
      void ctxRef.current.close();
      ctxRef.current = null;
    }
    gainRef.current = null;
    setStarted(false);
  };

  const start = async (activeScene: SoundScene) => {
    stop();
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") await ctx.resume();

    const master = ctx.createGain();
    master.gain.value = muted ? 0 : volume;
    master.connect(ctx.destination);
    gainRef.current = master;

    const bag: NodeBag = { nodes: [], intervals: [] };
    SCENE_BUILDERS[activeScene](ctx, master, bag);
    nodesRef.current = bag.nodes;
    intervalsRef.current = bag.intervals;

    setStarted(true);
  };

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = muted ? 0 : volume;
    }
  }, [muted, volume]);

  useEffect(() => {
    return () => stop();
  }, []);

  useEffect(() => {
    if (!pickerOpen) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setPickerOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [pickerOpen]);

  const toggle = async () => {
    if (muted) {
      updateSettings({ audio_muted: false });
      if (!started) await start(scene);
      else if (gainRef.current) gainRef.current.gain.value = volume;
    } else {
      updateSettings({ audio_muted: true });
      if (gainRef.current) gainRef.current.gain.value = 0;
    }
  };

  const chooseScene = async (next: SoundScene) => {
    setPickerOpen(false);
    if (next === scene) return;
    updateSettings({ audio_scene: next });
    if (!muted) await start(next);
  };

  const ActiveIcon = SOUND_SCENES.find((s) => s.id === scene)?.icon ?? Trees;

  return (
    <div ref={rootRef} className="fixed top-3 right-3 z-50 flex items-center gap-2 pointer-events-auto">
      {!muted && (
        <input
          type="range"
          min={0.05}
          max={0.6}
          step={0.01}
          value={localVol}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLocalVol(v);
            if (gainRef.current) gainRef.current.gain.value = v;
          }}
          onPointerUp={() => updateSettings({ audio_volume: localVol })}
          onBlur={() => updateSettings({ audio_volume: localVol })}
          className="w-16 sm:w-20 accent-primary"
          aria-label="Volumen del bosque"
        />
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          className="glass-btn flex items-center gap-1.5 text-sm px-2.5"
          title="Elegir sonido ambiente"
          aria-expanded={pickerOpen}
        >
          <ActiveIcon size={16} />
          <ChevronDown size={12} className={pickerOpen ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>
        {pickerOpen && (
          <div className="absolute right-0 top-full mt-2 flex flex-col gap-1 rounded-2xl border border-line bg-surface-raised p-1.5 shadow-xl backdrop-blur-xl min-w-[9.5rem]">
            {SOUND_SCENES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => void chooseScene(id)}
                className={`choice-chip choice-chip--row w-full justify-start ${
                  id === scene ? "choice-chip--active" : ""
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => void toggle()}
        className="glass-btn flex items-center gap-2 text-sm"
        title={muted ? "Activar sonidos del bosque" : "Silenciar"}
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        <span className="hidden sm:inline">{muted ? "En silencio" : sceneLabel(scene)}</span>
      </button>
    </div>
  );
}
