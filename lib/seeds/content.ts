/** Contenido semilla del plan de restauración */

export const SEASON_PHRASE =
  "Esta no es mi caída final. Es mi temporada de restauración con Dios. Mi mente se renueva. Mi cuerpo se calma. Mi trabajo da fruto. Mi identidad está en Cristo, no en un cargo ni en el qué dirán.";

export type TruthBlock = "A" | "B" | "C" | "D";

export interface SeedTruth {
  text: string;
  block: TruthBlock;
  sort_order: number;
}

export const SEED_TRUTHS: SeedTruth[] = [
  // Bloque A — Identidad
  { block: "A", sort_order: 1, text: "Soy hijo de Dios; mi valor no depende de un cargo ni de la opinión de los hermanos." },
  { block: "A", sort_order: 2, text: "Dios no me ha abandonado en esta temporada; Él me está restaurando." },
  { block: "A", sort_order: 3, text: "Mi pasado no tiene la última palabra; la sangre de Jesús sí." },
  { block: "A", sort_order: 4, text: "Puedo estar en paz aunque no todos entiendan mi decisión." },
  { block: "A", sort_order: 5, text: "Hoy camino en integridad: lo que soy en privado es lo que soy ante Dios." },
  // Bloque B — Pánico y mente
  { block: "B", sort_order: 6, text: "Este sentimiento es intenso, pero no es peligroso; pasará." },
  { block: "B", sort_order: 7, text: "Estoy a salvo en este momento; Dios es mi refugio y fortaleza." },
  { block: "B", sort_order: 8, text: "Mi mente se renueva día a día por la Palabra y por la verdad." },
  { block: "B", sort_order: 9, text: "Respiro; mi cuerpo puede aprender calma otra vez." },
  { block: "B", sort_order: 10, text: "No peleo solo; el Espíritu Santo me ayuda en mi debilidad." },
  // Bloque C — Santidad
  { block: "C", sort_order: 11, text: "Elijo la luz: confieso rápido, me levanto y sigo." },
  { block: "C", sort_order: 12, text: "No sirvo a Dios desde la hipocresía; sirvo desde un corazón limpio, aunque sea imperfecto." },
  { block: "C", sort_order: 13, text: "La gracia de Dios me capacita para vivir en santidad un día a la vez." },
  { block: "C", sort_order: 14, text: "Ya no necesito esconderme; Dios me ve y me ama." },
  // Bloque D — Propósito
  { block: "D", sort_order: 15, text: "Dios bendice el trabajo de mis manos con sabiduría y disciplina." },
  { block: "D", sort_order: 16, text: "Crezco cada día como programador e ingeniero de software." },
  { block: "D", sort_order: 17, text: "Opero el mercado con mente clara, reglas firmes y dominio propio." },
  { block: "D", sort_order: 18, text: "La prosperidad que busco es para honrar a Dios y servir con generosidad." },
  { block: "D", sort_order: 19, text: "Tengo tiempo, y lo uso con propósito; no estoy perdido, estoy en proceso." },
];

export const BLOCK_LABELS: Record<TruthBlock, string> = {
  A: "Identidad en Cristo",
  B: "Pánico y mente",
  C: "Santidad sin dualidad",
  D: "Propósito y provisión",
};

export type RoutineBlock = "manana" | "proposito" | "tarde" | "noche";

export interface RoutineItemDef {
  key: string;
  block: RoutineBlock;
  label: string;
  description?: string;
}

export const ROUTINE_ITEMS: RoutineItemDef[] = [
  { key: "agua_luz", block: "manana", label: "Agua + luz", description: "Beber agua y abrir cortina o salir 2 min" },
  { key: "oracion", block: "manana", label: "Oración breve y honesta", description: "10–15 min de conversación con Dios" },
  { key: "palabra", block: "manana", label: "Palabra", description: "Lectura del pasaje del día" },
  { key: "verdades", block: "manana", label: "Verdades / confesiones", description: "Repetir verdades activas" },
  { key: "cuerpo_am", block: "manana", label: "Cuerpo (estirar / caminar)", description: "10–20 min" },
  { key: "proposito_trabajo", block: "proposito", label: "Bloque de propósito", description: "Software, trading o descanso según el día" },
  { key: "murphy", block: "tarde", label: "Lectura: Mente subconsciente", description: "20–30 min" },
  { key: "ie", block: "tarde", label: "Lectura: Inteligencia emocional", description: "15–25 min (días alternos OK)" },
  { key: "diario", block: "tarde", label: "Diario de 3 líneas", description: "Gracias / verdad / mañana haré" },
  { key: "revision", block: "noche", label: "Revisión del día sin juicios" },
  { key: "arrepentimiento", block: "noche", label: "Arrepentimiento concreto (si aplica)" },
  { key: "verdades_noche", block: "noche", label: "Verdades de la noche" },
  { key: "oracion_sueno", block: "noche", label: "Oración de entrega del sueño" },
  { key: "higiene_sueno", block: "noche", label: "Higiene de sueño", description: "Celular fuera; horario estable" },
];

export const BLOCK_ORDER: RoutineBlock[] = ["manana", "proposito", "tarde", "noche"];

export const BLOCK_TITLES: Record<RoutineBlock, string> = {
  manana: "Mañana — Ancla del día",
  proposito: "Propósito — Trabajo con sentido",
  tarde: "Tarde — Mente y emociones",
  noche: "Noche — Reprogramación",
};

export interface Passage {
  key: string;
  dayIndex: number; // 0 = lunes
  dayLabel: string;
  title: string;
  focus: string;
  reference: string;
  summary: string;
}

export const PASSAGES: Passage[] = [
  { key: "salmo23", dayIndex: 0, dayLabel: "Lunes", title: "Salmo 23", focus: "Seguridad", reference: "Salmo 23", summary: "El Señor es mi pastor; nada me faltará." },
  { key: "salmo91", dayIndex: 1, dayLabel: "Martes", title: "Salmo 91", focus: "Refugio", reference: "Salmo 91", summary: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente." },
  { key: "fil4", dayIndex: 2, dayLabel: "Miércoles", title: "Filipenses 4:4–9", focus: "Pensamientos + paz", reference: "Filipenses 4:4-9", summary: "Todo lo que es verdadero, noble, justo… en esto pensad." },
  { key: "rom8", dayIndex: 3, dayLabel: "Jueves", title: "Romanos 8", focus: "No hay condenación", reference: "Romanos 8:1-39", summary: "Ninguna condenación hay para los que están en Cristo Jesús." },
  { key: "2cor10", dayIndex: 4, dayLabel: "Viernes", title: "2 Corintios 10:3–5", focus: "Cautivar pensamientos", reference: "2 Corintios 10:3-5", summary: "Llevando cautivo todo pensamiento a la obediencia a Cristo." },
  { key: "salmo51", dayIndex: 5, dayLabel: "Sábado", title: "Salmo 51", focus: "Arrepentimiento limpio", reference: "Salmo 51", summary: "Crea en mí, oh Dios, un corazón limpio." },
  { key: "juan15", dayIndex: 6, dayLabel: "Domingo", title: "Juan 15:1–11", focus: "Permanecer en Cristo", reference: "Juan 15:1-11", summary: "Permaneced en mí, y yo en vosotros." },
];

export const PANIC_STEPS = [
  { key: "nombrar", title: "1. Nombra", body: "Di en voz alta o en silencio: «Esto es pánico / ansiedad. No es juicio de Dios ni fin del mundo.»" },
  { key: "cuerpo", title: "2. Cuerpo", body: "Pies en el suelo. Si puedes, manos en agua fría o hielo envuelto 20–30 segundos." },
  { key: "respiracion", title: "3. Respiración caja", body: "Inhala 4 · sostén 4 · exhala 4 · sostén 4. Repite 3–5 ciclos. Usa el timer de abajo." },
  { key: "54321", title: "4. 5-4-3-2-1", body: "5 cosas que ves · 4 que tocas · 3 que oyes · 2 que hueles · 1 que saboreas." },
  { key: "verdad", title: "5. Verdad corta", body: "«Estoy a salvo en este momento. Dios está conmigo.»" },
  { key: "accion", title: "6. Acción mínima", body: "Bebe agua, camina por la casa, o llama a alguien de confianza." },
  { key: "registro", title: "7. Después — registra", body: "Anota intensidad, disparador y qué te ayudó. No te castigues." },
];

export const PHASE_MILESTONES = {
  1: [
    { key: "rutina_80", label: "Rutina mañana/noche sin fallar ~80% de los días" },
    { key: "verdades_7", label: "7–10 verdades fijas activas" },
    { key: "protocolo", label: "Protocolo de pánico practicado en calma" },
    { key: "ejercicio_suave", label: "Ejercicio suave iniciado" },
    { key: "cita_pro", label: "Cita con médico/terapeuta confirmada o en agenda" },
  ],
  2: [
    { key: "bloques_trabajo", label: "Bloques de software/trading con horarios fijos" },
    { key: "ie_practicar", label: "Practicar «nombro lo que siento» 1×/día" },
    { key: "meds_review", label: "Revisión de medicación solo con profesional (si aplica)" },
    { key: "amigo", label: "Una amistad/hermano de confianza en el proceso" },
  ],
  3: [
    { key: "profundidad", label: "Más profundidad técnica y consistencia de trading" },
    { key: "evaluar", label: "Evaluar pánico, sueño y «qué dirán»" },
    { key: "siguiente", label: "Definir siguiente meta (freelance, capital, mudanza…)" },
    { key: "reescribir", label: "Releer y reescribir verdades que ya crees de verdad" },
  ],
} as const;

export const EXERCISE_CIRCUIT = [
  "5 min caminar en sitio / escalón",
  "8–12 sentadillas (o a la silla)",
  "8–12 flexiones (rodillas si hace falta)",
  "20–30 s plancha",
  "10 zancadas por pierna",
  "5 min estirar + respiración",
];

export const PILLARS = [
  { key: "dios", label: "Dios" },
  { key: "cuerpo", label: "Cuerpo" },
  { key: "mente", label: "Mente" },
  { key: "software", label: "Software" },
  { key: "trading", label: "Trading" },
] as const;

export const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"] as const;

/**
 * Lun/Mié/Vie = propósito, Mar/Jue = trading (si está activo), Sáb = ligero, Dom = descanso.
 * "software" es un tag interno del pilar de propósito genérico — el texto visible se
 * resuelve aparte con `purposeLabelFor` (lib/purpose.ts); no implica literalmente software.
 */
export function purposeForWeekday(
  day: number,
  tradingEnabled: boolean = true
): "software" | "trading" | "light" | "rest" {
  if (day === 5) return "light";
  if (day === 6) return "rest";
  if (tradingEnabled && (day === 1 || day === 3)) return "trading";
  return "software";
}
