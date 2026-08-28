/** Catálogo del Nuevo Testamento: metadatos e introducción por libro.
 * El texto bíblico vive en `public/bible/{version}/{key}.json`
 * (generado por `scripts/fetch-nt.mjs` desde bolls.life).
 * Intros: texto propio de la app.
 *
 * IMPORTANTE: `key` se usa como `book_key` en study_notes y verse_marks;
 * no renombrar keys existentes o se pierde el historial guardado.
 */

export type BookIntro = {
  title: string;
  author: string;
  audience: string;
  purpose: string;
  themes: string[];
  /** Bosquejo; `ch` puede ser un número o rango ("1–3"). */
  outline: { ch: string; label: string }[];
};

export type NTBook = {
  /** Clave estable usada en la persistencia (book_key). */
  key: string;
  name: string;
  /** Id del libro en la API bolls.life (NT: 40–66). */
  bookId: number;
  chapters: number;
  intro: BookIntro;
};

export const NT_BOOKS: NTBook[] = [
  {
    key: "mateo",
    name: "Mateo",
    bookId: 40,
    chapters: 28,
    intro: {
      title: "Contexto e introducción a Mateo",
      author:
        "Mateo (Leví), apóstol y ex recaudador de impuestos (9:9). Escrito probablemente entre 60–80 d.C.",
      audience:
        "Lectores judío-cristianos. Mateo cita constantemente el Antiguo Testamento para mostrar que Jesús es el Mesías prometido.",
      purpose:
        "Presentar a Jesús como el Rey y Mesías de Israel, descendiente de David y Abraham, y registrar su enseñanza sobre el reino de los cielos.",
      themes: [
        "Jesús, el Mesías y Rey prometido.",
        "El reino de los cielos y sus parábolas.",
        "El Sermón del Monte: la ética del reino.",
        "Cumplimiento de las profecías del AT.",
        "La Gran Comisión: hacer discípulos (28:18–20).",
      ],
      outline: [
        { ch: "1–2", label: "Genealogía, nacimiento e infancia de Jesús" },
        { ch: "3–4", label: "Bautismo, tentación e inicio del ministerio" },
        { ch: "5–7", label: "Sermón del Monte" },
        { ch: "8–10", label: "Milagros y envío de los doce" },
        { ch: "11–13", label: "Rechazo creciente; parábolas del reino" },
        { ch: "14–20", label: "Ministerio, enseñanza y camino a Jerusalén" },
        { ch: "21–25", label: "Entrada en Jerusalén; discursos y parábolas finales" },
        { ch: "26–28", label: "Pasión, muerte, resurrección y Gran Comisión" },
      ],
    },
  },
  {
    key: "marcos",
    name: "Marcos",
    bookId: 41,
    chapters: 16,
    intro: {
      title: "Contexto e introducción a Marcos",
      author:
        "Juan Marcos, compañero de Pedro y Pablo; según la tradición, escribió basándose en la predicación de Pedro (~55–65 d.C.).",
      audience:
        "Cristianos gentiles, probablemente en Roma, en contexto de persecución.",
      purpose:
        "Presentar a Jesús como el Hijo de Dios poderoso en acción y como el Siervo sufriente que da su vida en rescate por muchos (10:45).",
      themes: [
        "Jesús, Siervo y Hijo de Dios en acción.",
        "El camino de la cruz y el discipulado que cuesta.",
        "Autoridad de Jesús sobre demonios, enfermedad y naturaleza.",
        "Inmediato: ritmo rápido del relato.",
        "El secreto mesiánico.",
      ],
      outline: [
        { ch: "1", label: "Preparación e inicio del ministerio" },
        { ch: "2–5", label: "Conflictos, parábolas y milagros en Galilea" },
        { ch: "6–8", label: "Rechazo, envío y confesión de Pedro" },
        { ch: "9–10", label: "Camino a Jerusalén: el costo del discipulado" },
        { ch: "11–13", label: "Jerusalén: controversias y discurso escatológico" },
        { ch: "14–16", label: "Pasión, muerte y resurrección" },
      ],
    },
  },
  {
    key: "lucas",
    name: "Lucas",
    bookId: 42,
    chapters: 24,
    intro: {
      title: "Contexto e introducción a Lucas",
      author:
        "Lucas, médico y compañero de Pablo (Col 4:14), autor también de Hechos (~60–80 d.C.).",
      audience:
        "Teófilo y los lectores gentiles; un relato ordenado para dar certeza sobre la fe (1:1–4).",
      purpose:
        "Presentar a Jesús como el Salvador de todos: pecadores, pobres, mujeres, samaritanos y gentiles; el Hijo del Hombre que vino a buscar y salvar lo perdido (19:10).",
      themes: [
        "Jesús, Salvador universal.",
        "Misericordia hacia los marginados y perdidos.",
        "El Espíritu Santo, la oración y la alegría.",
        "Parábolas únicas: el buen samaritano, el hijo pródigo.",
        "Viaje a Jerusalén y la cruz.",
      ],
      outline: [
        { ch: "1–2", label: "Anuncios, nacimiento e infancia" },
        { ch: "3–4", label: "Bautismo, genealogía, tentación e inicio" },
        { ch: "5–9", label: "Ministerio en Galilea; confesión y transfiguración" },
        { ch: "10–19", label: "Viaje a Jerusalén: enseñanza y parábolas" },
        { ch: "20–21", label: "Controversias y discurso final en Jerusalén" },
        { ch: "22–24", label: "Pasión, resurrección y ascensión" },
      ],
    },
  },
  {
    key: "juan",
    name: "Juan",
    bookId: 43,
    chapters: 21,
    intro: {
      title: "Contexto e introducción a Juan",
      author:
        "El apóstol Juan, 'el discípulo amado' (21:20–24). Escrito probablemente en Éfeso hacia 85–95 d.C.",
      audience:
        "La iglesia y los buscadores de su generación: 'para que creáis que Jesús es el Cristo, el Hijo de Dios, y para que creyendo, tengáis vida en su nombre' (20:31).",
      purpose:
        "Revelar la identidad divina de Jesús —el Verbo hecho carne— mediante señales y discursos, para producir fe y vida eterna.",
      themes: [
        "Jesús, el Verbo eterno hecho carne (1:1–14).",
        "Siete señales y los 'Yo soy'.",
        "Fe, vida eterna y nuevo nacimiento.",
        "Amor, unidad y el Espíritu Consolador.",
        "La hora gloriosa: cruz como exaltación.",
      ],
      outline: [
        { ch: "1", label: "Prólogo; testimonio del Bautista; primeros discípulos" },
        { ch: "2–4", label: "Caná, Nicodemo y la samaritana" },
        { ch: "5–10", label: "Señales y conflictos; el Buen Pastor" },
        { ch: "11–12", label: "Lázaro; camino a la cruz" },
        { ch: "13–17", label: "Última cena, discurso de despedida y oración" },
        { ch: "18–21", label: "Pasión, resurrección y apariciones" },
      ],
    },
  },
  {
    key: "hechos",
    name: "Hechos",
    bookId: 44,
    chapters: 28,
    intro: {
      title: "Contexto e introducción a Hechos",
      author:
        "Lucas, segunda parte de su obra (continuación del evangelio), escrita hacia 62–80 d.C.",
      audience:
        "Teófilo y la iglesia gentil: el relato de cómo el evangelio llegó 'hasta lo último de la tierra' (1:8).",
      purpose:
        "Mostrar el avance de la iglesia primitiva por el poder del Espíritu Santo, de Jerusalén a Roma, y la inclusión de los gentiles.",
      themes: [
        "El Espíritu Santo empodera la misión.",
        "Testigos en Jerusalén, Judea, Samaria y hasta lo último.",
        "Pentecostés y el nacimiento de la iglesia.",
        "Conversión y viajes de Pablo.",
        "El evangelio sin fronteras: judíos y gentiles.",
      ],
      outline: [
        { ch: "1–7", label: "Ascensión, Pentecostés y la iglesia en Jerusalén" },
        { ch: "8–12", label: "Dispersión: Samaria, gentiles y Antioquía" },
        { ch: "13–15", label: "Primer viaje de Pablo; concilio de Jerusalén" },
        { ch: "16–20", label: "Segundo y tercer viaje: Macedonia, Grecia, Éfeso" },
        { ch: "21–26", label: "Arresto de Pablo y defensas" },
        { ch: "27–28", label: "Viaje a Roma; el evangelio llega al imperio" },
      ],
    },
  },
  {
    key: "romanos",
    name: "Romanos",
    bookId: 45,
    chapters: 16,
    intro: {
      title: "Contexto e introducción a Romanos",
      author:
        "El apóstol Pablo (1:1), escrita desde Corinto hacia 57 d.C., de camino a Jerusalén y con miras a España (15:23–24).",
      audience:
        "La iglesia de Roma, mezcla de creyentes judíos y gentiles, a quienes Pablo aún no conocía personalmente.",
      purpose:
        "Exponer de forma sistemática el evangelio de la justicia de Dios que se recibe por fe, y mostrar sus implicaciones para la vida y la unidad de la iglesia.",
      themes: [
        "Justificación por fe, no por obras de la ley (3:21–26).",
        "Todos pecaron; la gracia abunda en Cristo.",
        "Vida nueva en el Espíritu (caps. 6–8).",
        "Israel y los gentiles en el plan de Dios (caps. 9–11).",
        "El culto racional: cuerpos, amor y unidad (caps. 12–15).",
      ],
      outline: [
        { ch: "1–3", label: "La necesidad universal: la ira de Dios y la justicia por fe" },
        { ch: "4–5", label: "Abraham, la fe y la gracia que reina" },
        { ch: "6–8", label: "Muertos al pecado, vivos en el Espíritu" },
        { ch: "9–11", label: "Israel, los gentiles y la misericordia de Dios" },
        { ch: "12–13", label: "Vida transformada: amor y autoridades" },
        { ch: "14–16", label: "Los débiles y los fuertes; saludos finales" },
      ],
    },
  },
  {
    key: "1-corintios",
    name: "1 Corintios",
    bookId: 46,
    chapters: 16,
    intro: {
      title: "Contexto e introducción a 1 Corintios",
      author:
        "El apóstol Pablo (1:1), escrita desde Éfeso hacia 55 d.C. durante su tercer viaje misionero.",
      audience:
        "La iglesia en Corinto, ciudad comercial conocida por su inmoralidad; una comunidad con divisiones, pleitos y confusiones doctrinales.",
      purpose:
        "Corregir divisiones, inmoralidad y desórdenes en la iglesia, y responder preguntas sobre matrimonio, ídolos, dones y resurrección, centrando todo en la cruz y el amor.",
      themes: [
        "La cruz contra la sabiduría humana.",
        "Unidad del cuerpo contra las facciones.",
        "Santidad sexual y disciplina en la iglesia.",
        "Dones espirituales ordenados por el amor (caps. 12–14).",
        "La resurrección de Cristo y la nuestra (cap. 15).",
      ],
      outline: [
        { ch: "1–4", label: "Divisiones y la sabiduría de la cruz" },
        { ch: "5–7", label: "Inmoralidad, pleitos y matrimonio" },
        { ch: "8–11", label: "Ídolos, libertad cristiana y la cena del Señor" },
        { ch: "12–14", label: "Dones espirituales y el camino del amor" },
        { ch: "15–16", label: "La resurrección; planes y saludos" },
      ],
    },
  },
  {
    key: "2-corintios",
    name: "2 Corintios",
    bookId: 47,
    chapters: 13,
    intro: {
      title: "Contexto e introducción a 2 Corintios",
      author:
        "El apóstol Pablo (1:1), escrita desde Macedonia hacia 55–56 d.C., poco después de 1 Corintios.",
      audience:
        "La iglesia de Corinto, en un proceso de reconciliación con Pablo tras una visita dolorosa y una carta severa.",
      purpose:
        "Defender la integridad de su ministerio, animar a completar la ofrenda para Jerusalén y advertir contra los falsos apóstoles, mostrando que el poder de Dios se perfecciona en la debilidad.",
      themes: [
        "Consuelo en medio de la aflicción.",
        "El nuevo pacto: ministerio del Espíritu.",
        "Tesoro en vasos de barro: poder en la debilidad.",
        "Mayordomía y dar con gozo (caps. 8–9).",
        "Autoridad apostólica y el aguijón en la carne (cap. 12).",
      ],
      outline: [
        { ch: "1–2", label: "Consuelo de Dios; cambio de planes y perdón" },
        { ch: "3–5", label: "Gloria del nuevo pacto; embajadores de reconciliación" },
        { ch: "6–7", label: "El ministerio probado; gozo por el arrepentimiento" },
        { ch: "8–9", label: "La ofrenda para los santos: gracia de dar" },
        { ch: "10–13", label: "Defensa apostólica; debilidad y poder" },
      ],
    },
  },
  {
    key: "galatas",
    name: "Gálatas",
    bookId: 48,
    chapters: 6,
    intro: {
      title: "Contexto e introducción a Gálatas",
      author:
        "El apóstol Pablo (1:1), escrita hacia 48–55 d.C., quizá la carta más vehemente de Pablo.",
      audience:
        "Las iglesias de Galacia (región de Asia Menor), tentadas por maestros judaizantes a volver a la ley y la circuncisión.",
      purpose:
        "Defender el evangelio de la gracia: la justificación es por fe en Cristo y no por obras de la ley; llamar a permanecer en la libertad del Espíritu.",
      themes: [
        "Un solo evangelio; ninguna 'otra' buena noticia (1:6–9).",
        "Justificación por fe, no por la ley (2:16).",
        "Hijos de Abraham por la fe y la promesa.",
        "Libertad en Cristo: ni esclavos ni libertinos.",
        "El fruto del Espíritu contra las obras de la carne (5:16–25).",
      ],
      outline: [
        { ch: "1–2", label: "Defensa del evangelio y del apostolado de Pablo" },
        { ch: "3–4", label: "Fe, promesa y ley; hijos y herederos" },
        { ch: "5–6", label: "Libertad, vida en el Espíritu y advertencias finales" },
      ],
    },
  },
  {
    key: "efesios",
    name: "Efesios",
    bookId: 49,
    chapters: 6,
    intro: {
      title: "Contexto e introducción a Efesios",
      author:
        "El apóstol Pablo (1:1; 3:1), escrita desde la prisión, probablemente en Roma (~60–62 d.C.).",
      audience:
        "Los creyentes de Éfeso, una ciudad portuaria de Asia Menor llena de comercio, ocultismo y el templo de Artemisa. Posiblemente era una carta circular para varias iglesias de la región.",
      purpose:
        "Recordar quiénes somos en Cristo (caps. 1–3: la doctrina de la identidad y la gracia) y cómo vivirlo (caps. 4–6: la práctica diaria en la iglesia, el hogar y la batalla espiritual).",
      themes: [
        "Identidad en Cristo: elegidos, redimidos, sellados con el Espíritu.",
        "Gracia y salvación por fe, no por obras (2:8–9).",
        "Unidad: judíos y gentiles, un solo cuerpo, la iglesia.",
        "Caminar en santidad, verdad y amor.",
        "Relaciones: matrimonio, hijos, trabajo.",
        "La armadura de Dios y la oración (6:10–18).",
      ],
      outline: [
        { ch: "1", label: "Bendiciones en Cristo; oración por revelación" },
        { ch: "2", label: "De muertos a vivos por gracia; un solo pueblo nuevo" },
        { ch: "3", label: "El misterio revelado; oración por fortaleza interior" },
        { ch: "4", label: "Unidad y madurez del cuerpo; el nuevo hombre" },
        { ch: "5", label: "Caminar en luz y sabiduría; matrimonio" },
        { ch: "6", label: "Hijos y trabajo; la armadura de Dios" },
      ],
    },
  },
  {
    key: "filipenses",
    name: "Filipenses",
    bookId: 50,
    chapters: 4,
    intro: {
      title: "Contexto e introducción a Filipenses",
      author:
        "El apóstol Pablo (1:1), escrita desde la cárcel, probablemente en Roma (~60–62 d.C.).",
      audience:
        "La iglesia de Filipos, la primera fundada por Pablo en Europa (Hch 16), una comunidad generosa y fiel.",
      purpose:
        "Agradecer su apoyo, informar sobre su situación en prisión y exhortar a la unidad, la humildad de Cristo y el gozo constante en el Señor.",
      themes: [
        "Gozo en el Señor, incluso en la cárcel.",
        "La mente de Cristo: humildad y servicio (2:5–11).",
        "Unidad y trabajo en equipo en el evangelio.",
        "Conocer a Cristo como la meta suprema (3:7–14).",
        "Contentamiento en toda circunstancia (4:11–13).",
      ],
      outline: [
        { ch: "1", label: "Gratitud; vivir es Cristo" },
        { ch: "2", label: "Himno de la humildad de Cristo; ejemplos fieles" },
        { ch: "3", label: "Justicia por fe; la carrera hacia la meta" },
        { ch: "4", label: "Gozo, paz y contentamiento; despedida" },
      ],
    },
  },
  {
    key: "colosenses",
    name: "Colosenses",
    bookId: 51,
    chapters: 4,
    intro: {
      title: "Contexto e introducción a Colosenses",
      author:
        "El apóstol Pablo (1:1), escrita desde la prisión en Roma (~60–62 d.C.), a una iglesia que no fundó personalmente (2:1).",
      audience:
        "La iglesia de Colosas, en el valle de Lico (Asia Menor), amenazada por una mezcla de filosofía, legalismo y misticismo.",
      purpose:
        "Exaltar la supremacía y suficiencia absolutas de Cristo —imagen del Dios invisible, cabeza de todo— y desarraigar toda enseñanza que le reste centralidad.",
      themes: [
        "Cristo supremo: creador y sustentador de todo (1:15–20).",
        "Completos en Cristo; ninguna filosofía añade nada (2:8–10).",
        "Muertos y resucitados con Cristo.",
        "La vida nueva: lo de arriba, no lo de la tierra (3:1–4).",
        "Relaciones renovadas: hogar y trabajo.",
      ],
      outline: [
        { ch: "1", label: "Gratitud y oración; la supremacía de Cristo" },
        { ch: "2", label: "Completos en Él; advertencia contra falsas filosofías" },
        { ch: "3", label: "La vida nueva: vestirse del nuevo hombre" },
        { ch: "4", label: "Oración, testimonio y saludos finales" },
      ],
    },
  },
  {
    key: "1-tesalonicenses",
    name: "1 Tesalonicenses",
    bookId: 52,
    chapters: 5,
    intro: {
      title: "Contexto e introducción a 1 Tesalonicenses",
      author:
        "Pablo (con Silas y Timoteo, 1:1), escrita desde Corinto hacia 50–51 d.C.; una de las cartas más antiguas del NT.",
      audience:
        "La joven iglesia de Tesalónica (Macedonia), fundada en medio de persecución (Hch 17), con preguntas sobre la venida del Señor.",
      purpose:
        "Animar a una iglesia perseguida, exhortar a la santidad y el trabajo, y aclarar la esperanza de la segunda venida de Cristo y el destino de los que han muerto.",
      themes: [
        "Fe, amor y esperanza en medio de la persecución.",
        "Ejemplo de ministerio íntegro y afectuoso.",
        "Santidad: abstenerse de inmoralidad (4:3–8).",
        "La venida del Señor y los muertos en Cristo (4:13–18).",
        "Vigilancia, gozo, oración y gratitud (5:16–18).",
      ],
      outline: [
        { ch: "1–3", label: "Gratitud por su fe; recuerdo del ministerio; Timoteo" },
        { ch: "4", label: "Santidad, amor fraternal y la venida del Señor" },
        { ch: "5", label: "El día del Señor; exhortaciones finales" },
      ],
    },
  },
  {
    key: "2-tesalonicenses",
    name: "2 Tesalonicenses",
    bookId: 53,
    chapters: 3,
    intro: {
      title: "Contexto e introducción a 2 Tesalonicenses",
      author:
        "Pablo (con Silas y Timoteo, 1:1), escrita poco después de la primera carta (~50–51 d.C.).",
      audience:
        "La iglesia de Tesalónica, confundida por enseñanzas falsas que decían que el día del Señor ya había llegado (2:2).",
      purpose:
        "Corregir la confusión escatológica, consolar en la persecución y corregir a los ociosos que no querían trabajar.",
      themes: [
        "Justicia de Dios en la persecución.",
        "El día del Señor no ha llegado; el hombre de pecado primero (2:1–12).",
        "Firmeza en las tradiciones recibidas.",
        "Contra la ociosidad: trabajar con quietud (3:6–12).",
      ],
      outline: [
        { ch: "1", label: "Consuelo en la persecución; el juicio justo de Dios" },
        { ch: "2", label: "El día del Señor y el hombre de pecado" },
        { ch: "3", label: "Oración, orden y corrección a los ociosos" },
      ],
    },
  },
  {
    key: "1-timoteo",
    name: "1 Timoteo",
    bookId: 54,
    chapters: 6,
    intro: {
      title: "Contexto e introducción a 1 Timoteo",
      author:
        "El apóstol Pablo (1:1), escrita a su hijo en la fe Timoteo hacia 62–64 d.C.",
      audience:
        "Timoteo, pastor de la iglesia de Éfeso, encargado de frenar las falsas doctrinas y ordenar la vida de la iglesia.",
      purpose:
        "Instruir sobre cómo conducirse en la casa de Dios (3:15): sana doctrina, oración, líderes calificados y una vida piadosa.",
      themes: [
        "Sana doctrina contra falsos maestros.",
        "Oración por todos, incluidas las autoridades (2:1–8).",
        "Requisitos de obispos y diáconos (cap. 3).",
        "La piedad como gran ganancia (6:6).",
        "Cuidado de viudas, ancianos y ricos.",
      ],
      outline: [
        { ch: "1", label: "Advertencia contra falsas doctrinas; la gracia a Pablo" },
        { ch: "2", label: "Oración y orden en la adoración" },
        { ch: "3", label: "Obispos y diáconos; el misterio de la piedad" },
        { ch: "4", label: "Apostasía venidera; el buen ministro" },
        { ch: "5–6", label: "Viudas, ancianos, siervos y ricos; la buena pelea" },
      ],
    },
  },
  {
    key: "2-timoteo",
    name: "2 Timoteo",
    bookId: 55,
    chapters: 4,
    intro: {
      title: "Contexto e introducción a 2 Timoteo",
      author:
        "El apóstol Pablo (1:1), su última carta, escrita desde la cárcel en Roma poco antes de su muerte (~67 d.C.).",
      audience:
        "Timoteo, exhortado a no avergonzarse del evangelio ni de Pablo, y a continuar firme la obra en tiempos difíciles.",
      purpose:
        "Testamento de Pablo: animar a Timoteo a sufrir por el evangelio, guardar la sana doctrina, predicar la Palabra y acabar bien la carrera.",
      themes: [
        "Avivar el don de Dios; espíritu de poder, amor y dominio propio (1:6–7).",
        "Sufrir por el evangelio como buen soldado.",
        "Obrero aprobado que maneja bien la Palabra (2:15).",
        "Toda la Escritura es inspirada y útil (3:16–17).",
        "Predica la Palabra; acabar la carrera (4:1–8).",
      ],
      outline: [
        { ch: "1", label: "Aviva el don; no te avergüences del evangelio" },
        { ch: "2", label: "Soldado, atleta y obrero aprobado" },
        { ch: "3", label: "Tiempos difíciles; la Escritura inspirada" },
        { ch: "4", label: "Predica la Palabra; el combate acabado" },
      ],
    },
  },
  {
    key: "tito",
    name: "Tito",
    bookId: 56,
    chapters: 3,
    intro: {
      title: "Contexto e introducción a Tito",
      author:
        "El apóstol Pablo (1:1), escrita hacia 62–64 d.C. a su colaborador Tito.",
      audience:
        "Tito, encargado de poner en orden las iglesias de Creta, una isla famosa por la mentira y la inmoralidad de su gente (1:12).",
      purpose:
        "Instruir sobre el establecimiento de ancianos, la corrección de falsos maestros y la vida santa que adorna la doctrina de la gracia.",
      themes: [
        "Ancianos idóneos en cada ciudad (1:5–9).",
        "Contra los falsos maestros cretenses.",
        "La gracia que enseña a vivir sobria, justa y piadosamente (2:11–14).",
        "Buenas obras como fruto de la salvación.",
      ],
      outline: [
        { ch: "1", label: "Ancianos calificados; corrección de rebeldes" },
        { ch: "2", label: "Sana doctrina para cada edad; la gracia que instruye" },
        { ch: "3", label: "Buenas obras y vida en sociedad; despedida" },
      ],
    },
  },
  {
    key: "filemon",
    name: "Filemón",
    bookId: 57,
    chapters: 1,
    intro: {
      title: "Contexto e introducción a Filemón",
      author:
        "El apóstol Pablo (v. 1), escrita desde la prisión en Roma (~60–62 d.C.).",
      audience:
        "Filemón, un cristiano de Colosas en cuya casa se reunía una iglesia, dueño del esclavo fugitivo Onésimo.",
      purpose:
        "Interceder por Onésimo —convertido a la fe junto a Pablo— para que Filemón lo reciba no como esclavo sino como hermano amado (v. 16).",
      themes: [
        "Reconciliación y perdón entre hermanos.",
        "La transformación del evangelio en las relaciones.",
        "Intercesión: Pablo paga la deuda de Onésimo.",
        "El amor por encima de los derechos.",
      ],
      outline: [
        { ch: "1", label: "Gratitud por Filemón; apelación por Onésimo; despedida" },
      ],
    },
  },
  {
    key: "hebreos",
    name: "Hebreos",
    bookId: 58,
    chapters: 13,
    intro: {
      title: "Contexto e introducción a Hebreos",
      author:
        "Autor desconocido (la iglesia lo atribuyó a Pablo, Bernabé o Apolos). Escrito antes del 70 d.C. a creyentes judíos.",
      audience:
        "Cristianos de origen judío tentados a volver al judaísmo ante la presión y la persecución.",
      purpose:
        "Mostrar la supremacía absoluta de Cristo —superior a ángeles, Moisés, Aarón y al sistema levítico— y exhortar a perseverar en la fe sin retroceder.",
      themes: [
        "Cristo, la revelación final y superior de Dios.",
        "Sumo Sacerdote perfecto según el orden de Melquisedec.",
        "El nuevo pacto, superior al antiguo.",
        "La fe definida y ejemplificada (cap. 11).",
        "Advertencias contra la apostasía; perseverar mirando a Jesús.",
      ],
      outline: [
        { ch: "1–2", label: "Cristo superior a los ángeles; hecho como sus hermanos" },
        { ch: "3–4", label: "Superior a Moisés; el reposo de Dios" },
        { ch: "5–7", label: "Sumo Sacerdote según Melquisedec" },
        { ch: "8–10", label: "El nuevo pacto y el sacrificio único y perfecto" },
        { ch: "11", label: "La fe: héroes y ejemplos" },
        { ch: "12–13", label: "Disciplina, perseverancia y vida santa" },
      ],
    },
  },
  {
    key: "santiago",
    name: "Santiago",
    bookId: 59,
    chapters: 5,
    intro: {
      title: "Contexto e introducción a Santiago",
      author:
        "Santiago, hermano del Señor y líder de la iglesia de Jerusalén (Hch 15), escrito hacia 45–50 d.C.; de los escritos más antiguos del NT.",
      audience:
        "Las 'doce tribus en la dispersión': creyentes judíos dispersos fuera de Palestina.",
      purpose:
        "Mostrar que la fe genuina se demuestra en obras: paciencia en pruebas, dominio de la lengua, justicia práctica y oración eficaz.",
      themes: [
        "Pruebas que producen paciencia y madurez (1:2–4).",
        "Fe sin obras está muerta (2:14–26).",
        "El poder destructivo o constructivo de la lengua (cap. 3).",
        "Sabiduría de arriba contra la ambición terrenal.",
        "Riqueza, paciencia y oración (caps. 4–5).",
      ],
      outline: [
        { ch: "1", label: "Pruebas, tentaciones y hacedores de la Palabra" },
        { ch: "2", label: "Sin acepción de personas; fe y obras" },
        { ch: "3", label: "La lengua y la sabiduría de arriba" },
        { ch: "4", label: "Amistad con el mundo; humillación ante Dios" },
        { ch: "5", label: "Ricos injustos; paciencia y oración de fe" },
      ],
    },
  },
  {
    key: "1-pedro",
    name: "1 Pedro",
    bookId: 60,
    chapters: 5,
    intro: {
      title: "Contexto e introducción a 1 Pedro",
      author:
        "El apóstol Pedro (1:1), escrita desde 'Babilonia' (probablemente Roma) hacia 62–64 d.C.",
      audience:
        "Creyentes dispersos del Asia Menor (Ponto, Galacia, Capadocia, Asia y Bitinia) que sufrían hostilidad y persecución.",
      purpose:
        "Animar a los creyentes perseguidos a mantener la esperanza viva, vivir en santidad y sufrir por hacer el bien siguiendo el ejemplo de Cristo.",
      themes: [
        "Esperanza viva por la resurrección de Cristo (1:3).",
        "Peregrinos y extranjeros: identidad y conducta.",
        "Santidad en toda manera de vivir.",
        "Sufrir por Cristo con gozo, no por hacer el mal.",
        "El buen Pastor y los pastores de la iglesia.",
      ],
      outline: [
        { ch: "1", label: "Esperanza viva y llamado a la santidad" },
        { ch: "2", label: "Piedra viva, pueblo santo; ejemplo de Cristo sufriente" },
        { ch: "3", label: "Relaciones; sufrir por hacer el bien" },
        { ch: "4", label: "Vivir para la voluntad de Dios; mayordomos de la gracia" },
        { ch: "5", label: "Exhortación a pastores; resistir al diablo" },
      ],
    },
  },
  {
    key: "2-pedro",
    name: "2 Pedro",
    bookId: 61,
    chapters: 3,
    intro: {
      title: "Contexto e introducción a 2 Pedro",
      author:
        "El apóstol Pedro (1:1), escrita poco antes de su muerte (~65–68 d.C.); su testamento espiritual.",
      audience:
        "Los mismos lectores de la primera carta (3:1), ahora amenazados por falsos maestros dentro de la iglesia.",
      purpose:
        "Advertir contra los falsos maestros y sus negaciones, confirmar la fiabilidad de la Escritura y la promesa de la venida del Señor.",
      themes: [
        "Crecer en la gracia y el conocimiento de Cristo.",
        "La Palabra profética: lámpara en lugar oscuro (1:19–21).",
        "Condenación de los falsos maestros (cap. 2).",
        "El día del Señor vendrá; Dios no tarda, es paciente (3:8–9).",
      ],
      outline: [
        { ch: "1", label: "Crecimiento en la fe; la Palabra profética confirmada" },
        { ch: "2", label: "Falsos maestros: su conducta y su juicio" },
        { ch: "3", label: "La venida del Señor y los cielos nuevos" },
      ],
    },
  },
  {
    key: "1-juan",
    name: "1 Juan",
    bookId: 62,
    chapters: 5,
    intro: {
      title: "Contexto e introducción a 1 Juan",
      author:
        "El apóstol Juan (la tradición y el estilo lo confirman), escrita desde Éfeso hacia 85–95 d.C.",
      audience:
        "Iglesias de Asia Menor sacudidas por falsos maestros que negaban la humanidad de Jesús y abandonaron la comunidad (2:19).",
      purpose:
        "Dar seguridad de la vida eterna (5:13): la comunión con Dios se reconoce por caminar en la luz, obedecer sus mandamientos y amar a los hermanos.",
      themes: [
        "Dios es luz: caminar en luz y confesar el pecado (1:5–10).",
        "Jesucristo, abogado y propiciación.",
        "Amor fraternal como evidencia del nuevo nacimiento.",
        "Probar los espíritus; el anticristo (4:1–3).",
        "Dios es amor; la fe que vence al mundo.",
      ],
      outline: [
        { ch: "1–2", label: "La luz, la propiciación y la obediencia" },
        { ch: "3", label: "Hijos de Dios: amor en hechos y en verdad" },
        { ch: "4", label: "Probar los espíritus; Dios es amor" },
        { ch: "5", label: "La fe que vence; seguridad de la vida eterna" },
      ],
    },
  },
  {
    key: "2-juan",
    name: "2 Juan",
    bookId: 63,
    chapters: 1,
    intro: {
      title: "Contexto e introducción a 2 Juan",
      author:
        "El apóstol Juan ('el anciano', v. 1), escrita desde Éfeso hacia 85–95 d.C.",
      audience:
        "'La señora elegida y sus hijos': probablemente una iglesia local y sus miembros.",
      purpose:
        "Exhortar a amar en verdad y advertir contra los engañadores que niegan que Jesucristo vino en carne: no recibirlos ni saludarlos (v. 10).",
      themes: [
        "Amar en la verdad y andar en sus mandamientos.",
        "Los engañadores que niegan la encarnación.",
        "No participar en la mala enseñanza.",
      ],
      outline: [
        { ch: "1", label: "Amor en la verdad; advertencia contra engañadores" },
      ],
    },
  },
  {
    key: "3-juan",
    name: "3 Juan",
    bookId: 64,
    chapters: 1,
    intro: {
      title: "Contexto e introducción a 3 Juan",
      author:
        "El apóstol Juan ('el anciano', v. 1), escrita desde Éfeso hacia 85–95 d.C.",
      audience:
        "Gayo, un creyente fiel que hospedaba a los obreros itinerantes del evangelio.",
      purpose:
        "Elogiar la hospitalidad de Gayo hacia los misioneros, condenar la actitud autoritaria de Diótrefes y recomendar a Demetrio.",
      themes: [
        "Prosperidad del alma y fidelidad a la verdad.",
        "Hospitalidad hacia los obreros del evangelio.",
        "Diótrefes: el peligro del orgullo y la ambición.",
        "Imitar el bien, no el mal (v. 11).",
      ],
      outline: [
        { ch: "1", label: "Elogio a Gayo; conflicto con Diótrefes; recomendación" },
      ],
    },
  },
  {
    key: "judas",
    name: "Judas",
    bookId: 65,
    chapters: 1,
    intro: {
      title: "Contexto e introducción a Judas",
      author:
        "Judas, hermano de Jacobo (Santiago) y del Señor Jesús (v. 1), escrito hacia 65–80 d.C.",
      audience:
        "Creyentes enfrentados a falsos maestros que se habían infiltrado y convertían la gracia en libertinaje (v. 4).",
      purpose:
        "Exhortar a contender ardientemente por la fe entregada una vez a los santos (v. 3), y mostrar cómo conservarse en el amor de Dios.",
      themes: [
        "Contender por la fe una vez dada a los santos.",
        "Juicio histórico sobre los impíos.",
        "Falsos maestros descritos y condenados.",
        "Edificarse en la fe, orar en el Espíritu, conservarse en el amor (vv. 20–21).",
      ],
      outline: [
        { ch: "1", label: "Contender por la fe; juicio de los impíos; doxología" },
      ],
    },
  },
  {
    key: "apocalipsis",
    name: "Apocalipsis",
    bookId: 66,
    chapters: 22,
    intro: {
      title: "Contexto e introducción a Apocalipsis",
      author:
        "El apóstol Juan (1:4, 9), escrito desde la isla de Patmos, exiliado bajo Domiciano (~95 d.C.).",
      audience:
        "Las siete iglesias de Asia Menor (caps. 2–3), presionadas por el imperio romano y el compromiso con la idolatría.",
      purpose:
        "Revelar a Jesucristo glorioso y soberano de la historia, consolar a la iglesia perseguida y anunciar el triunfo final de Dios: nuevo cielo y nueva tierra.",
      themes: [
        "Cristo glorioso en medio de sus iglesias.",
        "El Cordero que venció y es digno de adoración.",
        "Juicio de Dios sobre el mal y los imperios.",
        "La perseverancia y la fidelidad de los santos.",
        "Nuevo cielo y nueva tierra: Dios con los hombres (21–22).",
      ],
      outline: [
        { ch: "1", label: "Visión del Cristo glorioso" },
        { ch: "2–3", label: "Cartas a las siete iglesias" },
        { ch: "4–5", label: "El trono y el Cordero digno" },
        { ch: "6–11", label: "Sellos y trompetas: juicios sobre la tierra" },
        { ch: "12–14", label: "El conflicto cósmico: la mujer, el dragón, las bestias" },
        { ch: "15–18", label: "Las copas de la ira; la caída de Babilonia" },
        { ch: "19–20", label: "La venida del Rey; milenio y juicio final" },
        { ch: "21–22", label: "Nuevo cielo y nueva tierra; la Jerusalén celestial" },
      ],
    },
  },
];

export function getNTBook(key: string): NTBook {
  return NT_BOOKS.find((b) => b.key === key) ?? NT_BOOKS[0];
}
