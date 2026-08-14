import type { ThemeId } from "./types";

/** Variables CSS (globals.css) que cambian según el tema elegido. */
export interface ThemeCssVars {
  "--forest-deep": string;
  "--forest-mid": string;
  "--forest-leaf": string;
  "--forest-light": string;
  "--surface": string;
  "--surface-raised": string;
  "--surface-soft": string;
  "--glass-border": string;
  "--text": string;
  "--text-muted": string;
  "--text-subtle": string;
  "--primary": string;
  "--primary-bright": string;
  "--line": string;
}

/** Colores usados por la escena 3D (Forest3D) para que el bosque cambie de tono con el tema. */
export interface ThemeForest3D {
  fogColor: string;
  fogDensity: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  ambientColor: string;
  ambientIntensity: number;
  dirColor: string;
  dirIntensity: number;
  dir2Color: string;
  dir2Intensity: number;
  pointColor: string;
  pointIntensity: number;
  foliage: string[];
  trunkColor: string;
  groundColor: string;
  groundEmissive: string;
  trailColor: string;
  trailEmissive: string;
  fireflyColor: string;
  /** Triple "r, g, b" (sin rgba()) usado para el glow de las luciérnagas y los rayos de luz. */
  fireflyGlowRgb: string;
  rayColor: string;
}

export interface ThemeDef {
  id: ThemeId;
  label: string;
  description: string;
  swatch: [string, string, string];
  themeColor: string;
  /** light = fondos claros + texto oscuro (requiere overrides CSS) */
  mode?: "light" | "dark";
  vars: ThemeCssVars;
  forest3d: ThemeForest3D;
}

export const THEMES: ThemeDef[] = [
  {
    id: "bosque",
    label: "Bosque",
    description: "Verde profundo de naturaleza. Cálido, terroso, el clásico de la app.",
    swatch: ["#071a12", "#22c55e", "#6ee7a5"],
    themeColor: "#071a12",
    vars: {
      "--forest-deep": "#071a12",
      "--forest-mid": "#0d2a1d",
      "--forest-leaf": "#22c55e",
      "--forest-light": "#6ee7a5",
      "--surface": "rgba(13, 42, 29, 0.9)",
      "--surface-raised": "rgba(16, 50, 35, 0.94)",
      "--surface-soft": "rgba(21, 61, 43, 0.78)",
      "--glass-border": "rgba(184, 203, 192, 0.24)",
      "--text": "#f5faf7",
      "--text-muted": "#b8cbc0",
      "--text-subtle": "#8fa79a",
      "--primary": "#22c55e",
      "--primary-bright": "#6ee7a5",
      "--line": "rgba(184, 203, 192, 0.2)",
    },
    forest3d: {
      fogColor: "#0a2116",
      fogDensity: 0.03,
      hemiSky: "#b6e8c9",
      hemiGround: "#0a2417",
      hemiIntensity: 0.85,
      ambientColor: "#2a6444",
      ambientIntensity: 0.5,
      dirColor: "#eafbe6",
      dirIntensity: 1.3,
      dir2Color: "#4d8a63",
      dir2Intensity: 0.34,
      pointColor: "#8ef2b2",
      pointIntensity: 4.4,
      foliage: ["#13492b", "#175c35", "#1c6b3d", "#207c46", "#155131", "#268f52", "#1a6b3a"],
      trunkColor: "#3d2716",
      groundColor: "#0f3d24",
      groundEmissive: "#052015",
      trailColor: "#26402a",
      trailEmissive: "#0f1e10",
      fireflyColor: "#e7c873",
      fireflyGlowRgb: "190, 242, 100",
      rayColor: "187, 247, 208",
    },
  },
  {
    id: "oceano",
    label: "Océano",
    description: "Azul y turquesa calmado, como mirar el mar. Ideal si el verde te resulta intenso.",
    swatch: ["#06131f", "#2dd4bf", "#7dd3fc"],
    themeColor: "#06131f",
    vars: {
      "--forest-deep": "#06131f",
      "--forest-mid": "#0d2740",
      "--forest-leaf": "#2dd4bf",
      "--forest-light": "#7dd3fc",
      "--surface": "rgba(13, 36, 56, 0.9)",
      "--surface-raised": "rgba(16, 45, 68, 0.94)",
      "--surface-soft": "rgba(21, 56, 82, 0.78)",
      "--glass-border": "rgba(173, 201, 214, 0.24)",
      "--text": "#eef7fb",
      "--text-muted": "#adc9d6",
      "--text-subtle": "#7fa0ae",
      "--primary": "#2dd4bf",
      "--primary-bright": "#67e8f9",
      "--line": "rgba(173, 201, 214, 0.2)",
    },
    forest3d: {
      fogColor: "#0a2434",
      fogDensity: 0.03,
      hemiSky: "#bfeaf5",
      hemiGround: "#07202f",
      hemiIntensity: 0.85,
      ambientColor: "#276076",
      ambientIntensity: 0.5,
      dirColor: "#eafbff",
      dirIntensity: 1.3,
      dir2Color: "#4d818a",
      dir2Intensity: 0.34,
      pointColor: "#7fe3f2",
      pointIntensity: 4.4,
      foliage: ["#0f4256", "#136076", "#137e8c", "#1b8fa0", "#0e5468", "#26a5b8", "#157691"],
      trunkColor: "#3a2e22",
      groundColor: "#0f3a4d",
      groundEmissive: "#052029",
      trailColor: "#254452",
      trailEmissive: "#0e1e24",
      fireflyColor: "#a5f3fc",
      fireflyGlowRgb: "125, 211, 252",
      rayColor: "165, 226, 247",
    },
  },
  {
    id: "lavanda",
    label: "Lavanda",
    description: "Violeta suave, asociado a la relajación y a bajar la ansiedad.",
    swatch: ["#140f22", "#a78bfa", "#c4b5fd"],
    themeColor: "#140f22",
    vars: {
      "--forest-deep": "#140f22",
      "--forest-mid": "#241a3a",
      "--forest-leaf": "#a78bfa",
      "--forest-light": "#c4b5fd",
      "--surface": "rgba(36, 26, 58, 0.9)",
      "--surface-raised": "rgba(44, 32, 70, 0.94)",
      "--surface-soft": "rgba(54, 40, 84, 0.78)",
      "--glass-border": "rgba(203, 191, 224, 0.24)",
      "--text": "#f6f3fb",
      "--text-muted": "#cbbfe0",
      "--text-subtle": "#9c8bb8",
      "--primary": "#a78bfa",
      "--primary-bright": "#c4b5fd",
      "--line": "rgba(203, 191, 224, 0.2)",
    },
    forest3d: {
      fogColor: "#1c1430",
      fogDensity: 0.03,
      hemiSky: "#d8cdf5",
      hemiGround: "#160f28",
      hemiIntensity: 0.85,
      ambientColor: "#4a3a72",
      ambientIntensity: 0.5,
      dirColor: "#f1ebfb",
      dirIntensity: 1.3,
      dir2Color: "#6c5a94",
      dir2Intensity: 0.34,
      pointColor: "#c9b6fa",
      pointIntensity: 4.4,
      foliage: ["#332259", "#402c6e", "#4d3684", "#5c3f9c", "#3a2868", "#6d4bb0", "#463079"],
      trunkColor: "#372a2e",
      groundColor: "#251a40",
      groundEmissive: "#100a1e",
      trailColor: "#332745",
      trailEmissive: "#150f22",
      fireflyColor: "#e9d5ff",
      fireflyGlowRgb: "196, 181, 253",
      rayColor: "216, 205, 245",
    },
  },
  {
    id: "atardecer",
    label: "Atardecer",
    description: "Ámbar y tierra cálidos, sensación de abrigo y seguridad.",
    swatch: ["#1a0f08", "#f59e0b", "#fbbf6d"],
    themeColor: "#1a0f08",
    vars: {
      "--forest-deep": "#1a0f08",
      "--forest-mid": "#2e1c0f",
      "--forest-leaf": "#f59e0b",
      "--forest-light": "#fbbf6d",
      "--surface": "rgba(46, 28, 15, 0.9)",
      "--surface-raised": "rgba(56, 35, 19, 0.94)",
      "--surface-soft": "rgba(68, 43, 24, 0.78)",
      "--glass-border": "rgba(227, 200, 168, 0.24)",
      "--text": "#fdf6ee",
      "--text-muted": "#e3c8a8",
      "--text-subtle": "#b8916a",
      "--primary": "#f59e0b",
      "--primary-bright": "#fbbf6d",
      "--line": "rgba(227, 200, 168, 0.2)",
    },
    forest3d: {
      fogColor: "#2a1810",
      fogDensity: 0.03,
      hemiSky: "#f6d9a8",
      hemiGround: "#20120a",
      hemiIntensity: 0.85,
      ambientColor: "#79501f",
      ambientIntensity: 0.5,
      dirColor: "#fff0d8",
      dirIntensity: 1.3,
      dir2Color: "#9c6f3f",
      dir2Intensity: 0.34,
      pointColor: "#ffcf87",
      pointIntensity: 4.4,
      foliage: ["#5a3a15", "#78501a", "#8c611e", "#a67424", "#6b4718", "#c08a30", "#7a531c"],
      trunkColor: "#3d2314",
      groundColor: "#432711",
      groundEmissive: "#1c0f06",
      trailColor: "#4a3018",
      trailEmissive: "#1e130a",
      fireflyColor: "#ffe3a3",
      fireflyGlowRgb: "251, 191, 109",
      rayColor: "246, 217, 168",
    },
  },
  {
    id: "noche",
    label: "Noche serena",
    description: "Índigo muy oscuro y sobrio, poca estimulación visual para momentos de sobrecarga.",
    swatch: ["#05060f", "#6366f1", "#a5b4fc"],
    themeColor: "#05060f",
    vars: {
      "--forest-deep": "#05060f",
      "--forest-mid": "#0d1024",
      "--forest-leaf": "#6366f1",
      "--forest-light": "#a5b4fc",
      "--surface": "rgba(13, 16, 36, 0.9)",
      "--surface-raised": "rgba(17, 21, 45, 0.94)",
      "--surface-soft": "rgba(22, 27, 56, 0.78)",
      "--glass-border": "rgba(183, 188, 219, 0.24)",
      "--text": "#eef0fb",
      "--text-muted": "#b7bcdb",
      "--text-subtle": "#7f86ad",
      "--primary": "#6366f1",
      "--primary-bright": "#a5b4fc",
      "--line": "rgba(183, 188, 219, 0.2)",
    },
    forest3d: {
      fogColor: "#0a0c1e",
      fogDensity: 0.034,
      hemiSky: "#b7bdf0",
      hemiGround: "#08091c",
      hemiIntensity: 0.72,
      ambientColor: "#2c2f63",
      ambientIntensity: 0.42,
      dirColor: "#e4e6fb",
      dirIntensity: 1.05,
      dir2Color: "#4a4d86",
      dir2Intensity: 0.28,
      pointColor: "#a5b0f7",
      pointIntensity: 4.0,
      foliage: ["#181c40", "#20255a", "#282e6e", "#333a86", "#1e2350", "#3e4699", "#252b63"],
      trunkColor: "#221f30",
      groundColor: "#12142e",
      groundEmissive: "#070814",
      trailColor: "#1a1d3a",
      trailEmissive: "#0a0b18",
      fireflyColor: "#c7d2fe",
      fireflyGlowRgb: "165, 180, 252",
      rayColor: "183, 189, 240",
    },
  },
  {
    id: "arena",
    label: "Arena suave",
    description: "Tono neutro y poco saturado, pensado para minimizar el ruido visual.",
    swatch: ["#14120f", "#a3977f", "#cfc3ab"],
    themeColor: "#14120f",
    vars: {
      "--forest-deep": "#14120f",
      "--forest-mid": "#211d18",
      "--forest-leaf": "#a3977f",
      "--forest-light": "#cfc3ab",
      "--surface": "rgba(33, 29, 24, 0.9)",
      "--surface-raised": "rgba(40, 35, 29, 0.94)",
      "--surface-soft": "rgba(49, 43, 36, 0.78)",
      "--glass-border": "rgba(206, 197, 181, 0.24)",
      "--text": "#f7f4ee",
      "--text-muted": "#cec5b5",
      "--text-subtle": "#9c9182",
      "--primary": "#a3977f",
      "--primary-bright": "#cfc3ab",
      "--line": "rgba(206, 197, 181, 0.2)",
    },
    forest3d: {
      fogColor: "#1c1813",
      fogDensity: 0.03,
      hemiSky: "#d9d0bc",
      hemiGround: "#14120e",
      hemiIntensity: 0.78,
      ambientColor: "#4f4638",
      ambientIntensity: 0.48,
      dirColor: "#f5efe2",
      dirIntensity: 1.2,
      dir2Color: "#6b6152",
      dir2Intensity: 0.3,
      pointColor: "#cbbea3",
      pointIntensity: 3.8,
      foliage: ["#3a3428", "#4a4232", "#59503b", "#665c44", "#433c2d", "#726650", "#4d4534"],
      trunkColor: "#332c22",
      groundColor: "#2c2620",
      groundEmissive: "#12100c",
      trailColor: "#38312a",
      trailEmissive: "#16130f",
      fireflyColor: "#efe6d4",
      fireflyGlowRgb: "207, 195, 171",
      rayColor: "217, 208, 188",
    },
  },
  {
    id: "blanco",
    label: "Blanco",
    description:
      "Claridad y convicción: blanco limpio, texto casi negro (alto contraste) y acento teal oscuro legible.",
    swatch: ["#ffffff", "#0b3d36", "#115e59"],
    themeColor: "#f4f7f5",
    mode: "light",
    vars: {
      /* Fondos claros sólidos (no lavados) */
      "--forest-deep": "#f4f7f5",
      "--forest-mid": "#e6eeea",
      "--forest-leaf": "#0b3d36",
      "--forest-light": "#115e59",
      /* Tarjetas blancas opacas para contraste máximo */
      "--surface": "rgba(255, 255, 255, 0.97)",
      "--surface-raised": "#ffffff",
      "--surface-soft": "rgba(232, 240, 236, 0.98)",
      "--glass-border": "rgba(11, 40, 32, 0.18)",
      /* Texto: casi negro + grises oscuros (WCAG AA+) */
      "--text": "#0a1210",
      "--text-muted": "#1e332c",
      "--text-subtle": "#3a5249",
      "--primary": "#0b3d36",
      "--primary-bright": "#115e59",
      "--line": "rgba(11, 40, 32, 0.16)",
    },
    forest3d: {
      fogColor: "#c5ddd4",
      fogDensity: 0.02,
      hemiSky: "#f8fffc",
      hemiGround: "#9fc4b4",
      hemiIntensity: 1.1,
      ambientColor: "#7aab95",
      ambientIntensity: 0.75,
      dirColor: "#ffffff",
      dirIntensity: 1.6,
      dir2Color: "#4d8a6e",
      dir2Intensity: 0.45,
      pointColor: "#2dd4bf",
      pointIntensity: 2.8,
      foliage: ["#0f4a2e", "#165c3a", "#1c6e45", "#124f32", "#1a6640", "#20784c", "#155a38"],
      trunkColor: "#3d2a1c",
      groundColor: "#b8d4c6",
      groundEmissive: "#9abdae",
      trailColor: "#a8c9ba",
      trailEmissive: "#8fb5a4",
      fireflyColor: "#fef08a",
      fireflyGlowRgb: "250, 204, 21",
      rayColor: "153, 246, 228",
    },
  },
];

export function getTheme(id: ThemeId | undefined): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Mezcla un hex con negro (pct% del color original, resto negro). */
function darken(hex: string, pct: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = pct / 100;
  return `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`;
}

/**
 * Variables CSS "derivadas" (tonos translúcidos y degradados) calculadas en JS a partir
 * de la paleta base del tema. Se calculan aquí — y NO con color-mix() en el CSS — porque
 * el minificador de Turbopack (Lightning CSS) resuelve color-mix() con var()s en tiempo de
 * build usando los valores de :root, "congelando" el color y rompiendo el cambio de tema
 * en tiempo real. Estas variables sí quedan como var() planas en el CSS, que sí se
 * actualizan correctamente al cambiar de tema.
 */
export function getDerivedVars(theme: ThemeDef): Record<string, string> {
  const v = theme.vars;
  const forestDeep = v["--forest-deep"];
  const forestMid = v["--forest-mid"];
  const forestLight = v["--forest-light"];
  const primary = v["--primary"];
  const primaryBright = v["--primary-bright"];
  const text = v["--text"];
  const isLight = theme.mode === "light";

  if (isLight) {
    // Fondos de atmósfera claros; acentos con primary oscuro para contraste
    return {
      "--amb-sky-1": rgba(primaryBright, 0.12),
      "--amb-sky-2": rgba(primary, 0.08),
      "--amb-sky-3": rgba(forestLight, 0.1),
      "--amb-sky-top": "#f8fbf9",
      "--amb-sky-bot1": "#eef4f1",
      "--amb-sky-bot2": "#e4ede8",
      "--amb-canopy-1": "rgba(255, 255, 255, 0.55)",
      "--amb-canopy-2": "rgba(232, 240, 236, 0.35)",
      "--amb-canopy-1-sm": "rgba(255, 255, 255, 0.4)",
      "--amb-canopy-2-sm": "rgba(232, 240, 236, 0.25)",
      "--amb-mist-1": "rgba(244, 247, 245, 0.92)",
      "--amb-mist-2": "rgba(220, 232, 226, 0.45)",
      "--amb-mist-1-sm": "rgba(244, 247, 245, 0.75)",
      "--amb-mist-2-sm": "rgba(220, 232, 226, 0.3)",
      "--amb-mist2": "rgba(214, 228, 220, 0.5)",
      "--amb-rays": rgba(primaryBright, 0.06),
      "--amb-dust-cool": rgba(primary, 0.18),
      "--amb-dust-warm": "rgba(15, 40, 32, 0.12)",
      "--amb-vignette-edge": "rgba(15, 40, 32, 0.06)",
      "--amb-vignette-center": "rgba(15, 40, 32, 0.03)",
      "--amb-vignette-edge-sm": "rgba(15, 40, 32, 0.05)",
      "--amb-vignette-center-sm": "rgba(15, 40, 32, 0.02)",
      "--acc-14": rgba(primary, 0.12),
      "--acc-48": rgba(primary, 0.45),
      "--acc-30": rgba(primary, 0.28),
      "--acc-16": rgba(primary, 0.14),
      "--acc-45": rgba(primary, 0.4),
      "--acc-12": rgba(primary, 0.1),
      "--acc-08": rgba(primary, 0.07),
      "--acc-35": rgba(primary, 0.32),
      "--acc-13": rgba(primary, 0.12),
      "--primary-deep": darken(primary, 88),
      "--on-primary": "#ffffff",
      "--input-bg": "#ffffff",
      "--breath-border": rgba(primary, 0.65),
      "--breath-glow": rgba(primary, 0.15),
      "--breath-base": "rgba(255, 255, 255, 0.85)",
      "--danger-text": "#9f1239",
      "--spiritual": "#a16207",
      /* Velo sobre el video real: blanco/crema para texto oscuro legible */
      "--video-scrim":
        "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(248,251,249,0.62) 40%, rgba(244,247,245,0.7) 100%)",
    };
  }

  return {
    "--amb-sky-1": rgba(forestLight, 0.45),
    "--amb-sky-2": rgba(primary, 0.22),
    "--amb-sky-3": rgba(forestLight, 0.2),
    "--amb-sky-top": darken(forestMid, 88),
    "--amb-sky-bot1": darken(forestDeep, 82),
    "--amb-sky-bot2": darken(forestDeep, 55),
    "--amb-canopy-1": rgba(forestDeep, 0.84),
    "--amb-canopy-2": rgba(forestMid, 0.46),
    "--amb-canopy-1-sm": rgba(forestDeep, 0.62),
    "--amb-canopy-2-sm": rgba(forestMid, 0.3),
    "--amb-mist-1": rgba(forestDeep, 0.88),
    "--amb-mist-2": rgba(forestMid, 0.35),
    "--amb-mist-1-sm": rgba(forestDeep, 0.68),
    "--amb-mist-2-sm": rgba(forestMid, 0.24),
    "--amb-mist2": rgba(forestMid, 0.4),
    "--amb-rays": rgba(forestLight, 0.04),
    "--amb-dust-cool": rgba(forestLight, 0.32),
    "--amb-dust-warm": rgba(text, 0.22),
    "--amb-vignette-edge": rgba(forestDeep, 0.18),
    "--amb-vignette-center": rgba(forestMid, 0.14),
    "--amb-vignette-edge-sm": rgba(forestDeep, 0.14),
    "--amb-vignette-center-sm": rgba(forestMid, 0.08),
    "--acc-14": rgba(primaryBright, 0.14),
    "--acc-48": rgba(primaryBright, 0.48),
    "--acc-30": rgba(primary, 0.3),
    "--acc-16": rgba(primary, 0.16),
    "--acc-45": rgba(primaryBright, 0.45),
    "--acc-12": rgba(primaryBright, 0.12),
    "--acc-08": rgba(primary, 0.08),
    "--acc-35": rgba(primaryBright, 0.35),
    "--acc-13": rgba(primary, 0.13),
    "--primary-deep": darken(primary, 78),
    /* Texto sobre fondos verdes: blanco en todos los temas oscuros */
    "--on-primary": "#ffffff",
    "--input-bg": rgba(forestDeep, 0.72),
    "--breath-border": rgba(primaryBright, 0.72),
    "--breath-glow": rgba(primary, 0.2),
    "--breath-base": rgba(forestMid, 0.55),
    /* Velo tintado con el tema: el video se ve, pero la UI siempre contrasta */
    "--video-scrim": `linear-gradient(180deg, ${rgba(forestDeep, 0.72)} 0%, ${rgba(forestMid, 0.52)} 45%, ${rgba(forestDeep, 0.68)} 100%)`,
  };
}
