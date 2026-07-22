import type { ContentPack } from "./types";

/** Pack genérico: reprogramación sin marco eclesial. */
export const PACK_REPROGRAMAR_CALMA: ContentPack = {
  id: "reprogramar-calma",
  label: "Reprogramar y calma",
  blurb: "Ansiedad, identidad y hábitos — sin jerga de iglesia.",
  description:
    "Mismas prácticas (verdades, ancla, cuerpo, diario, rutina). Frases orientadas a calma y reescritura mental. Puedes añadir fe después en Administrar.",
  season_phrase:
    "Esta no es mi caída final. Es mi temporada de reprogramar la mente. Me calmo. Me fortalezco. Construyo un día a la vez.",
  truths: [
    { block: "A", sort_order: 1, text: "Mi valor no depende de la opinión de los demás." },
    { block: "A", sort_order: 2, text: "Estoy en un proceso de reconstrucción; no estoy roto de forma permanente." },
    { block: "A", sort_order: 3, text: "Puedo soltar el pasado y elegir un pensamiento nuevo hoy." },
    { block: "A", sort_order: 4, text: "Soy capaz de cuidarme con paciencia y firmeza." },
    { block: "A", sort_order: 5, text: "Lo que soy en privado y en público puede ser coherente." },
    { block: "B", sort_order: 6, text: "Este sentimiento es intenso, pero no es peligroso; pasará." },
    { block: "B", sort_order: 7, text: "Estoy a salvo en este momento; puedo anclarme al presente." },
    { block: "B", sort_order: 8, text: "Mi mente se reentrena con repetición y calma, un día a la vez." },
    { block: "B", sort_order: 9, text: "Respiro; mi cuerpo puede aprender seguridad otra vez." },
    { block: "B", sort_order: 10, text: "No tengo que pelear solo; pedir ayuda es fortaleza." },
    { block: "C", sort_order: 11, text: "Elijo la honestidad: nombro lo que siento y actúo con integridad." },
    { block: "C", sort_order: 12, text: "Puedo caer y levantarme sin destruirme con culpa." },
    { block: "C", sort_order: 13, text: "Mis límites protegen mi mente y mi futuro." },
    { block: "C", sort_order: 14, text: "No necesito esconderme de mí mismo; puedo mirar con compasión." },
    { block: "D", sort_order: 15, text: "El trabajo de mis manos crece con disciplina y enfoque." },
    { block: "D", sort_order: 16, text: "Aprendo y mejoro en mis habilidades cada semana." },
    { block: "D", sort_order: 17, text: "Tomo decisiones con mente clara y reglas que respeto." },
    { block: "D", sort_order: 18, text: "Construyo estabilidad para vivir con generosidad y paz." },
    { block: "D", sort_order: 19, text: "Tengo tiempo y lo uso con propósito; estoy en proceso, no perdido." },
  ],
  active_truth_count: 10,
  books: [
    {
      title: "El poder de la mente subconsciente",
      author: "Joseph Murphy",
      sort_order: 1,
    },
    {
      title: "Inteligencia emocional",
      author: "Daniel Goleman",
      sort_order: 2,
    },
  ],
  milestones: [
    { phase: 1, key: "rutina_80", label: "Rutina estable ~80% de los días" },
    { phase: 1, key: "verdades_7", label: "7–10 verdades activas en repetición" },
    { phase: 1, key: "protocolo", label: "Protocolo de calma practicado" },
    { phase: 1, key: "ejercicio_suave", label: "Movimiento suave iniciado" },
    { phase: 1, key: "cita_pro", label: "Cita con profesional de salud si la necesitas" },
    { phase: 2, key: "bloques_trabajo", label: "Bloques de propósito con horario" },
    { phase: 2, key: "ie_practicar", label: "Nombrar lo que siento 1×/día" },
    { phase: 2, key: "meds_review", label: "Revisión de medicación solo con profesional" },
    { phase: 2, key: "amigo", label: "Alguien de confianza en el proceso" },
    { phase: 3, key: "profundidad", label: "Más consistencia en tu propósito" },
    { phase: 3, key: "evaluar", label: "Revisar pánico, sueño y pensamientos automáticos" },
    { phase: 3, key: "siguiente", label: "Definir la siguiente meta concreta" },
    { phase: 3, key: "reescribir", label: "Reescribir verdades que ya crees de verdad" },
  ],
  holiness_lines: [
    { text: "Integridad: lo que pienso, digo y hago van alineados" },
    { text: "Honestidad total conmigo y con quien confío" },
    { text: "Si caigo, me levanto sin esconderme en la vergüenza" },
  ],
  purpose_hint: "Trabajo, estudio o proyecto que te dé dirección",
  block_labels: {
    A: "Identidad y valor",
    B: "Calma y mente",
    C: "Integridad y límites",
    D: "Propósito y construcción",
  },
};
