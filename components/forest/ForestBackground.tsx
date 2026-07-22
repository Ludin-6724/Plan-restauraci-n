"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useData } from "@/lib/data-context";
import { getTheme } from "@/lib/themes";
import type { ThemeId } from "@/lib/types";
import { ForestVideo } from "./ForestVideo";

const Forest3D = dynamic(() => import("./Forest3D").then((m) => m.Forest3D), {
  ssr: false,
  loading: () => null,
});

/**
 * Bosque inmersivo detrás de la UI.
 * Preferencia: video real → 3D (WebGL) → siluetas SVG.
 * REGLA DE ORO: esta capa NUNCA captura clics/taps.
 */
export function ForestBackground() {
  const { data } = useData();
  const theme = data.profile.settings.theme ?? "bosque";
  const [reduceMotion, setReduceMotion] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const [videoOk, setVideoOk] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let supportsWebgl = false;
    try {
      const c = document.createElement("canvas");
      supportsWebgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      supportsWebgl = false;
    }

    const initializationFrame = window.requestAnimationFrame(() => {
      setReduceMotion(mediaQuery?.matches ?? false);
      setWebgl(supportsWebgl);
    });
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.cancelAnimationFrame(initializationFrame);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const themeDef = getTheme(theme);
  const isLight = themeDef.mode === "light";
  const wantVideo = !reduceMotion;
  const videoActive = wantVideo && videoOk !== false;
  // Fallback 3D solo si no hay video (o falló) y no es tema claro
  const use3D = !videoActive && webgl === true && !reduceMotion && !isLight;
  const useSvg = !videoActive && !use3D;

  return (
    <div
      className={[
        "forest-root",
        isLight ? "forest-root--light" : "",
        videoActive ? "forest-root--video" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      {/* Cielo / atmósfera (también actúa de fallback mientras carga el video) */}
      <div className="forest-sky" />

      {wantVideo && (
        <ForestVideo
          play={visible}
          onReady={() => setVideoOk(true)}
          onFailed={() => setVideoOk(false)}
        />
      )}

      {use3D && <Forest3D animate={visible} quality="auto" theme={theme} />}
      {useSvg && <StaticForestSvg light={isLight} />}

      {/* Velo temático: asegura legibilidad al cambiar de paleta sobre el video real */}
      {videoActive && <div className="forest-video-scrim" />}

      {/* Capas 2D de ambiente encima (profundidad) */}
      <div className="forest-canopy" />
      <div className="forest-mist forest-mist-1" />
      <div className="forest-mist forest-mist-2" />
      <div className="forest-rays" />
      <div className="forest-dust" />
      {!reduceMotion && !isLight && !videoActive && <ForestMotes visible={visible} theme={theme} />}
      {/* Velo claro solo si no hay video (el video ya usa --video-scrim temático) */}
      {isLight && !videoActive && <div className="forest-light-scrim" />}
      <div className="forest-vignette" />
    </div>
  );
}

type Mote = { x: number; y: number; r: number; speed: number; drift: number; phase: number; hue: "cool" | "warm" };

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3 ? clean.replace(/./g, (c) => c + c) : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

/**
 * Capa de partículas 2D (fallback sin video): motas de luz y polen
 * flotando suavemente, coloreadas según el tema activo.
 */
function ForestMotes({ visible, theme }: { visible: boolean; theme: ThemeId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = getTheme(theme);
    const coolRgb = hexToRgb(palette.vars["--forest-light"]);
    const warmRgb = hexToRgb(palette.forest3d.fireflyColor);

    let width = 0;
    let height = 0;
    let motes: Mote[] = [];
    let rafId = 0;
    let lastFrame = 0;

    const spawn = (): Mote[] => {
      const density = Math.min(60, Math.max(26, Math.round((width * height) / 26000)));
      const arr: Mote[] = [];
      for (let i = 0; i < density; i++) {
        arr.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.7 + Math.random() * 1.8,
          speed: 6 + Math.random() * 14,
          drift: (Math.random() - 0.5) * 10,
          phase: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.78 ? "warm" : "cool",
        });
      }
      return arr;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      motes = spawn();
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      rafId = window.requestAnimationFrame(draw);
      if (!visible || now - lastFrame < 33) return;
      const dt = Math.min(0.05, (now - lastFrame) / 1000 || 0.033);
      lastFrame = now;
      ctx.clearRect(0, 0, width, height);
      for (const m of motes) {
        m.y -= m.speed * dt;
        m.x += Math.sin(now * 0.0006 + m.phase) * m.drift * dt;
        if (m.y < -10) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;
        const flicker = 0.35 + Math.sin(now * 0.002 + m.phase) * 0.25;
        ctx.beginPath();
        ctx.fillStyle =
          m.hue === "warm"
            ? `rgba(${warmRgb}, ${Math.max(0.08, flicker * 0.75)})`
            : `rgba(${coolRgb}, ${Math.max(0.06, flicker * 0.6)})`;
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    rafId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [visible, theme]);

  return <canvas ref={canvasRef} className="forest-motes" aria-hidden="true" />;
}

/**
 * Bosque plano (sin video, sin WebGL o con "reducir movimiento").
 */
function StaticForestSvg({ light = false }: { light?: boolean }) {
  const farA = light ? "#c5ddd4" : "var(--forest-mid)";
  const farB = light ? "#b4d0c4" : "var(--forest-leaf)";
  const nearLeaf = light ? "#9fc4b4" : "var(--forest-leaf)";
  const nearHighlight = light ? "#b8d9cb" : "var(--forest-light)";
  const trunkTop = light ? "#b0c9bb" : "var(--forest-mid)";
  const trunkBot = light ? "#8fad9e" : "var(--forest-deep)";
  const baseOpacity = light ? 0.28 : 0.4;

  return (
    <svg
      className={`forest-trees${light ? " forest-trees--light" : ""}`}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id={light ? "trunk-light" : "trunk2"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trunkTop} />
          <stop offset="100%" stopColor={trunkBot} />
        </linearGradient>
      </defs>
      {[60, 160, 280, 400, 520, 650, 780, 920, 1060, 1200, 1340].map((x, i) => {
        const h = 300 + (i % 5) * 45;
        return (
          <g key={x} opacity={baseOpacity + (i % 3) * (light ? 0.06 : 0.1)}>
            <polygon
              points={`${x},${900 - h} ${x - 60},${900} ${x + 60},${900}`}
              fill={i % 2 ? farA : farB}
            />
          </g>
        );
      })}
      {[30, 200, 450, 700, 980, 1250].map((x, i) => {
        const h = 440 + (i % 3) * 40;
        return (
          <g key={`n-${x}`} opacity={light ? 0.45 : 1}>
            <rect
              x={x - 10}
              y={900 - h + 90}
              width={18}
              height={h - 90}
              fill={`url(#${light ? "trunk-light" : "trunk2"})`}
            />
            <polygon
              points={`${x},${900 - h} ${x - 95},${900 - 100} ${x + 95},${900 - 100}`}
              fill={nearLeaf}
            />
            <polygon
              points={`${x},${900 - h + 80} ${x - 75},${900 - 50} ${x + 75},${900 - 50}`}
              fill={nearHighlight}
              opacity={light ? 0.65 : 0.5}
            />
          </g>
        );
      })}
    </svg>
  );
}
