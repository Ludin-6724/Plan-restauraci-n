/**
 * Áreas de problemática / enfoque del plan (sin IA, sin diagnóstico).
 * Ordenan el menú Registrar y el mensaje de plan; no ocultan funciones.
 */

export type FocusId =
  | "panico"
  | "mente"
  | "identidad"
  | "fe"
  | "proposito"
  | "cuerpo"
  | "habitos";

export type FocusArea = {
  id: FocusId;
  label: string;
  /** Pregunta corta en onboarding */
  question: string;
  hint: string;
  /** Secciones del menú que prioriza (hrefs) */
  priorityHrefs: string[];
};

export const FOCUS_AREAS: FocusArea[] = [
  {
    id: "panico",
    label: "Pánico / ansiedad corporal",
    question: "El cuerpo se dispara (pánico, pecho, ahogo) sin control",
    hint: "Protocolo primero; luego calma y verdades de seguridad",
    priorityHrefs: ["/panico", "/verdades", "/ejercicio", "/rutina", "/diario"],
  },
  {
    id: "mente",
    label: "Pensamientos que se repiten",
    question: "Frases o miedos automáticos en la mente (subconsciente)",
    hint: "Repetición de verdades + lecturas + diario",
    priorityHrefs: ["/verdades", "/lecturas", "/diario", "/palabra", "/rutina"],
  },
  {
    id: "identidad",
    label: "Identidad y “qué dirán”",
    question: "Vergüenza, rechazo o valor atado a la opinión de otros",
    hint: "Verdades de identidad + ancla + integridad",
    priorityHrefs: ["/verdades", "/palabra", "/santidad", "/diario", "/rutina"],
  },
  {
    id: "fe",
    label: "Fe y ancla espiritual",
    question: "Necesito anclarme en Dios / Palabra en esta temporada",
    hint: "Palabra, verdades, santidad, oración en la rutina",
    priorityHrefs: ["/palabra", "/verdades", "/santidad", "/diario", "/rutina"],
  },
  {
    id: "proposito",
    label: "Propósito y trabajo",
    question: "Quiero avanzar en un proyecto (estudio, software, trading…)",
    hint: "Bloques de propósito + rutina + mente clara",
    priorityHrefs: ["/software", "/trading", "/rutina", "/tablero", "/ejercicio"],
  },
  {
    id: "cuerpo",
    label: "Cuerpo y energía",
    question: "Me falta movimiento, sueño o sensación de estar en el cuerpo",
    hint: "Ejercicio, higiene de sueño en rutina, pánico si aparece",
    priorityHrefs: ["/ejercicio", "/rutina", "/panico", "/diario"],
  },
  {
    id: "habitos",
    label: "Hábitos y constancia",
    question: "Sé qué hacer pero no lo sostengo día a día",
    hint: "Rutina + tablero + progreso visibles",
    priorityHrefs: ["/rutina", "/tablero", "/progreso", "/diario", "/verdades"],
  },
];

export function getFocus(id: string | undefined): FocusArea | undefined {
  return FOCUS_AREAS.find((f) => f.id === id);
}

/** Mensaje de plan integral según focos elegidos (texto fijo, sin IA). */
export function buildPlanSummary(focusIds: string[], primary: string | undefined): string {
  const primaryArea = getFocus(primary) ?? getFocus(focusIds[0]);
  if (!primaryArea) {
    return "Tu plan es integral: calma cuando el cuerpo se dispara, reescritura de la mente con verdades, ancla del día, cuerpo, diario y un propósito con sentido. Usa Registrar por secciones.";
  }

  const others = focusIds
    .filter((id) => id !== primaryArea.id)
    .map((id) => getFocus(id)?.label)
    .filter(Boolean) as string[];

  let base = `Prioridad: ${primaryArea.label}. ${primaryArea.hint}.`;
  if (others.length) {
    base += ` También marcaste: ${others.join(", ")}.`;
  }
  base +=
    " El método es el mismo para todos: repetición + hábito. Las secciones de abajo están agrupadas; empieza por «Tu prioridad» y completa el resto cuando puedas.";
  return base;
}

export type NavSectionId = "prioridad" | "mente" | "calma" | "proposito" | "estructura" | "ver" | "cuenta";

export type NavSectionDef = {
  id: NavSectionId;
  title: string;
  subtitle?: string;
  hrefs: string[];
};

/** Secciones fijas de Registrar (todas las funciones, ordenadas). */
export const REGISTER_SECTIONS: NavSectionDef[] = [
  {
    id: "calma",
    title: "Calma y crisis",
    subtitle: "Cuando el cuerpo o el miedo se disparan",
    hrefs: ["/panico", "/ejercicio"],
  },
  {
    id: "mente",
    title: "Reprogramar la mente",
    subtitle: "Repetición, ancla y lecturas",
    hrefs: ["/verdades", "/palabra", "/lecturas", "/diario", "/santidad"],
  },
  {
    id: "proposito",
    title: "Propósito",
    subtitle: "Trabajo con sentido",
    hrefs: ["/software", "/trading"],
  },
  {
    id: "estructura",
    title: "Estructura del día",
    subtitle: "Checklist y visión de la semana",
    hrefs: ["/rutina", "/tablero"],
  },
];

export const META_SECTIONS: NavSectionDef[] = [
  {
    id: "ver",
    title: "Ver y repasar",
    subtitle: "Historial y avance",
    hrefs: ["/progreso", "/archivo"],
  },
  {
    id: "cuenta",
    title: "Cuenta",
    hrefs: ["/ajustes"],
  },
];

/** Hrefs prioritarios del foco principal (para la sección “Tu prioridad”). */
export function priorityHrefsForUser(
  primaryFocus: string | undefined,
  focusAreas: string[],
  tradingEnabled: boolean = true
): string[] {
  const p = getFocus(primaryFocus) ?? getFocus(focusAreas[0]);
  const hrefs = p ? p.priorityHrefs : ["/rutina", "/verdades", "/panico"];
  return tradingEnabled ? hrefs : hrefs.filter((h) => h !== "/trading");
}

/** REGISTER_SECTIONS sin /trading cuando el módulo está desactivado. */
export function registerSectionsFor(tradingEnabled: boolean): NavSectionDef[] {
  if (tradingEnabled) return REGISTER_SECTIONS;
  return REGISTER_SECTIONS.map((sec) =>
    sec.hrefs.includes("/trading")
      ? { ...sec, hrefs: sec.hrefs.filter((h) => h !== "/trading") }
      : sec
  );
}
