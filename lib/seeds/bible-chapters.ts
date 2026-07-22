/** Capítulos bíblicos del plan semanal (RV1960 y NTV).
 * Texto para meditación personal en la app.
 * RV1960 © Sociedades Bíblicas Unidas. NTV © Tyndale House Foundation.
 */

export type BibleVersion = "rvr1960" | "ntv";

export type BibleVerse = {
  n: number;
  t: string;
};

export type ChapterText = {
  bookId: number;
  chapter: number;
  /** Versículos del plan original (porción); null = capítulo completo es el foco */
  focusStart: number | null;
  focusEnd: number | null;
  versions: Record<BibleVersion, BibleVerse[]>;
};

export const BIBLE_VERSION_LABELS: Record<BibleVersion, string> = {
  rvr1960: "RVR 1960",
  ntv: "NTV",
};

export const CHAPTERS: Record<string, ChapterText> =
{
  "salmo23": {
    "bookId": 19,
    "chapter": 23,
    "focusStart": null,
    "focusEnd": null,
    "versions": {
      "rvr1960": [
        {
          "n": 1,
          "t": "Jehová es mi pastor; nada me faltará."
        },
        {
          "n": 2,
          "t": "En lugares de delicados pastos me hará descansar; Junto a aguas de reposo me pastoreará."
        },
        {
          "n": 3,
          "t": "Confortará mi alma; Me guiará por sendas de justicia por amor de su nombre."
        },
        {
          "n": 4,
          "t": "Aunque ande en valle de sombra de muerte, No temeré mal alguno, porque tú estarás conmigo; Tu vara y tu cayado me infundirán aliento."
        },
        {
          "n": 5,
          "t": "Aderezas mesa delante de mí en presencia de mis angustiadores; Unges mi cabeza con aceite; mi copa está rebosando."
        },
        {
          "n": 6,
          "t": "Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, Y en la casa de Jehová moraré por largos días."
        }
      ],
      "ntv": [
        {
          "n": 1,
          "t": "El SEÑOR es mi pastor; tengo todo lo que necesito."
        },
        {
          "n": 2,
          "t": "En verdes prados me deja descansar; me conduce junto a arroyos tranquilos."
        },
        {
          "n": 3,
          "t": "Él renueva mis fuerzas. Me guía por sendas correctas, y así da honra a su nombre."
        },
        {
          "n": 4,
          "t": "Aun cuando yo pase por el valle más oscuro, no temeré, porque tú estás a mi lado. Tu vara y tu cayado me protegen y me confortan."
        },
        {
          "n": 5,
          "t": "Me preparas un banquete en presencia de mis enemigos. Me honras ungiendo mi cabeza con aceite. Mi copa se desborda de bendiciones."
        },
        {
          "n": 6,
          "t": "Ciertamente tu bondad y tu amor inagotable me seguirán todos los días de mi vida, y en la casa del SEÑOR viviré por siempre."
        }
      ]
    }
  },
  "salmo91": {
    "bookId": 19,
    "chapter": 91,
    "focusStart": null,
    "focusEnd": null,
    "versions": {
      "rvr1960": [
        {
          "n": 1,
          "t": "El que habita al abrigo del Altísimo Morará bajo la sombra del Omnipotente."
        },
        {
          "n": 2,
          "t": "Diré yo a Jehová: Esperanza mía, y castillo mío; Mi Dios, en quien confiaré."
        },
        {
          "n": 3,
          "t": "El te librará del lazo del cazador, De la peste destructora."
        },
        {
          "n": 4,
          "t": "Con sus plumas te cubrirá, Y debajo de sus alas estarás seguro; Escudo y adarga es su verdad."
        },
        {
          "n": 5,
          "t": "No temerás el terror nocturno, Ni saeta que vuele de día,"
        },
        {
          "n": 6,
          "t": "Ni pestilencia que ande en oscuridad, Ni mortandad que en medio del día destruya."
        },
        {
          "n": 7,
          "t": "Caerán a tu lado mil, Y diez mil a tu diestra; Mas a ti no llegará."
        },
        {
          "n": 8,
          "t": "Ciertamente con tus ojos mirarás Y verás la recompensa de los impíos."
        },
        {
          "n": 9,
          "t": "Porque has puesto a Jehová, que es mi esperanza, Al Altísimo por tu habitación,"
        },
        {
          "n": 10,
          "t": "No te sobrevendrá mal, Ni plaga tocará tu morada."
        },
        {
          "n": 11,
          "t": "Pues a sus ángeles mandará acerca de ti, Que te guarden en todos tus caminos."
        },
        {
          "n": 12,
          "t": "En las manos te llevarán, Para que tu pie no tropiece en piedra."
        },
        {
          "n": 13,
          "t": "Sobre el león y el áspid pisarás; Hollarás al cachorro del león y al dragón."
        },
        {
          "n": 14,
          "t": "Por cuanto en mí ha puesto su amor, yo también lo libraré; Le pondré en alto, por cuanto ha conocido mi nombre."
        },
        {
          "n": 15,
          "t": "Me invocará, y yo le responderé; Con él estaré yo en la angustia; Lo libraré y le glorificaré."
        },
        {
          "n": 16,
          "t": "Lo saciaré de larga vida, Y le mostraré mi salvación."
        }
      ],
      "ntv": [
        {
          "n": 1,
          "t": "Los que viven al amparo del Altísimo encontrarán descanso a la sombra del Todopoderoso."
        },
        {
          "n": 2,
          "t": "Declaro lo siguiente acerca del SEÑOR: Solo él es mi refugio, mi lugar seguro; él es mi Dios y en él confío."
        },
        {
          "n": 3,
          "t": "Te rescatará de toda trampa y te protegerá de enfermedades mortales."
        },
        {
          "n": 4,
          "t": "Con sus plumas te cubrirá y con sus alas te dará refugio. Sus fieles promesas son tu armadura y tu protección."
        },
        {
          "n": 5,
          "t": "No tengas miedo de los terrores de la noche ni de la flecha que se lanza en el día."
        },
        {
          "n": 6,
          "t": "No temas a la enfermedad que acecha en la oscuridad, ni a la catástrofe que estalla al mediodía."
        },
        {
          "n": 7,
          "t": "Aunque caigan mil a tu lado, aunque mueran diez mil a tu alrededor, esos males no te tocarán."
        },
        {
          "n": 8,
          "t": "Simplemente abre tus ojos y mira cómo los perversos reciben su merecido."
        },
        {
          "n": 9,
          "t": "Si haces al SEÑOR tu refugio y al Altísimo tu resguardo,"
        },
        {
          "n": 10,
          "t": "ningún mal te conquistará; ninguna plaga se acercará a tu hogar."
        },
        {
          "n": 11,
          "t": "Pues él ordenará a sus ángeles que te protejan por donde vayas."
        },
        {
          "n": 12,
          "t": "Te sostendrán con sus manos para que ni siquiera te lastimes el pie con una piedra."
        },
        {
          "n": 13,
          "t": "Pisotearás leones y cobras; ¡aplastarás feroces leones y serpientes bajo tus pies!"
        },
        {
          "n": 14,
          "t": "El SEÑOR dice: «Rescataré a los que me aman; protegeré a los que confían en mi nombre."
        },
        {
          "n": 15,
          "t": "Cuando me llamen, yo les responderé; estaré con ellos en medio de las dificultades. Los rescataré y los honraré."
        },
        {
          "n": 16,
          "t": "Los recompensaré con una larga vida y les daré mi salvación»."
        }
      ]
    }
  },
  "fil4": {
    "bookId": 50,
    "chapter": 4,
    "focusStart": 4,
    "focusEnd": 9,
    "versions": {
      "rvr1960": [
        {
          "n": 1,
          "t": "Así que, hermanos míos amados y deseados, gozo y corona mía, estad así firmes en el Señor, amados."
        },
        {
          "n": 2,
          "t": "Ruego a Evodia y a Síntique, que sean de un mismo sentir en el Señor."
        },
        {
          "n": 3,
          "t": "Asimismo te ruego también a ti, compañero fiel, que ayudes a éstas que combatieron juntamente conmigo en el evangelio, con Clemente también y los demás colaboradores míos, cuyos nombres están en el libro de la vida."
        },
        {
          "n": 4,
          "t": "Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!"
        },
        {
          "n": 5,
          "t": "Vuestra gentileza sea conocida de todos los hombres. El Señor está cerca."
        },
        {
          "n": 6,
          "t": "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias."
        },
        {
          "n": 7,
          "t": "Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús."
        },
        {
          "n": 8,
          "t": "Por lo demás, hermanos, todo lo que es verdadero, todo lo honesto, todo lo justo, todo lo puro, todo lo amable, todo lo que es de buen nombre; si hay virtud alguna, si algo digno de alabanza, en esto pensad."
        },
        {
          "n": 9,
          "t": "Lo que aprendisteis y recibisteis y oísteis y visteis en mí, esto haced; y el Dios de paz estará con vosotros."
        },
        {
          "n": 10,
          "t": "En gran manera me gocé en el Señor de que ya al fin habéis revivido vuestro cuidado de mí; de lo cual también estabais solícitos, pero os faltaba la oportunidad."
        },
        {
          "n": 11,
          "t": "No lo digo porque tenga escasez, pues he aprendido a contentarme, cualquiera que sea mi situación."
        },
        {
          "n": 12,
          "t": "Sé vivir humildemente, y sé tener abundancia; en todo y por todo estoy enseñado, así para estar saciado como para tener hambre, así para tener abundancia como para padecer necesidad."
        },
        {
          "n": 13,
          "t": "Todo lo puedo en Cristo que me fortalece."
        },
        {
          "n": 14,
          "t": "Sin embargo, bien hicisteis en participar conmigo en mi tribulación."
        },
        {
          "n": 15,
          "t": "Y sabéis también vosotros, oh filipenses, que al principio de la predicación del evangelio, cuando partí de Macedonia, ninguna iglesia participó conmigo en razón de dar y recibir, sino vosotros solos;"
        },
        {
          "n": 16,
          "t": "pues aun a Tesalónica me enviasteis una y otra vez para mis necesidades."
        },
        {
          "n": 17,
          "t": "No es que busque dádivas, sino que busco fruto que abunde en vuestra cuenta."
        },
        {
          "n": 18,
          "t": "Pero todo lo he recibido, y tengo abundancia; estoy lleno, habiendo recibido de Epafrodito lo que enviasteis; olor fragante, sacrificio acepto, agradable a Dios."
        },
        {
          "n": 19,
          "t": "Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús."
        },
        {
          "n": 20,
          "t": "Al Dios y Padre nuestro sea gloria por los siglos de los siglos. Amén."
        },
        {
          "n": 21,
          "t": "Saludad a todos los santos en Cristo Jesús. Los hermanos que están conmigo os saludan."
        },
        {
          "n": 22,
          "t": "Todos los santos os saludan, y especialmente los de la casa de César."
        },
        {
          "n": 23,
          "t": "La gracia de nuestro Señor Jesucristo sea con todos vosotros. Amén."
        }
      ],
      "ntv": [
        {
          "n": 1,
          "t": "Por lo tanto, mis amados hermanos, manténganse fieles al Señor. Los amo y anhelo verlos, mis queridos amigos, porque ustedes son mi alegría y la corona que recibo por mi trabajo."
        },
        {
          "n": 2,
          "t": "Ahora les ruego a Evodia y a Síntique, dado que pertenecen al Señor, que arreglen su desacuerdo."
        },
        {
          "n": 3,
          "t": "Y te pido a ti, mi fiel colaborador, que ayudes a esas dos mujeres, porque trabajaron mucho a mi lado para dar a conocer a otros la Buena Noticia. Trabajaron junto con Clemente y mis demás colaboradores, cuyos nombres están escritos en el libro de la vida."
        },
        {
          "n": 4,
          "t": "Estén siempre llenos de alegría en el Señor. Lo repito, ¡alégrense!"
        },
        {
          "n": 5,
          "t": "Que todo el mundo vea que son considerados en todo lo que hacen. Recuerden que el Señor vuelve pronto."
        },
        {
          "n": 6,
          "t": "No se preocupen por nada; en cambio, oren por todo. Díganle a Dios lo que necesitan y denle gracias por todo lo que él ha hecho."
        },
        {
          "n": 7,
          "t": "Así experimentarán la paz de Dios, que supera todo lo que podemos entender. La paz de Dios cuidará su corazón y su mente mientras vivan en Cristo Jesús."
        },
        {
          "n": 8,
          "t": "Y ahora, amados hermanos, una cosa más para terminar. Concéntrense en todo lo que es verdadero, todo lo honorable, todo lo justo, todo lo puro, todo lo bello y todo lo admirable. Piensen en cosas excelentes y dignas de alabanza."
        },
        {
          "n": 9,
          "t": "No dejen de poner en práctica todo lo que aprendieron y recibieron de mí, todo lo que oyeron de mis labios y vieron que hice. Entonces el Dios de paz estará con ustedes."
        },
        {
          "n": 10,
          "t": "¡Cuánto alabo al Señor de que hayan vuelto a preocuparse por mí! Sé que siempre se han preocupado por mí, pero no tenían la oportunidad de ayudarme."
        },
        {
          "n": 11,
          "t": "No que haya pasado necesidad alguna vez, porque he aprendido a estar contento con lo que tengo."
        },
        {
          "n": 12,
          "t": "Sé vivir con casi nada o con todo lo necesario. He aprendido el secreto de vivir en cualquier situación, sea con el estómago lleno o vacío, con mucho o con poco."
        },
        {
          "n": 13,
          "t": "Pues todo lo puedo hacer por medio de Cristo, quien me da las fuerzas."
        },
        {
          "n": 14,
          "t": "De todos modos, han hecho bien al compartir conmigo en la dificultad por la que ahora atravieso."
        },
        {
          "n": 15,
          "t": "Como saben, filipenses, ustedes fueron los únicos que me ayudaron económicamente cuando les llevé la Buena Noticia por primera vez y luego seguí mi viaje desde Macedonia. Ninguna otra iglesia hizo lo mismo."
        },
        {
          "n": 16,
          "t": "Incluso cuando estuve en Tesalónica, ustedes me mandaron ayuda más de una vez."
        },
        {
          "n": 17,
          "t": "No digo esto esperando que me envíen una ofrenda. Más bien, quiero que ustedes reciban una recompensa por su bondad."
        },
        {
          "n": 18,
          "t": "Por el momento, tengo todo lo que necesito, ¡y aún más! Estoy bien abastecido con las ofrendas que ustedes me enviaron por medio de Epafrodito. Son un sacrificio de olor fragante aceptable y agradable a Dios."
        },
        {
          "n": 19,
          "t": "Y este mismo Dios quien me cuida suplirá todo lo que necesiten, de las gloriosas riquezas que nos ha dado por medio de Cristo Jesús."
        },
        {
          "n": 20,
          "t": "¡Toda la gloria sea a Dios nuestro Padre por siempre y para siempre! Amén."
        },
        {
          "n": 21,
          "t": "Denle saludos de mi parte a cada persona del pueblo santo de Dios, a todos los que pertenecen a Cristo Jesús. Los hermanos que están conmigo envían saludos."
        },
        {
          "n": 22,
          "t": "Los demás del pueblo de Dios también les envían saludos, en particular los de la casa de César."
        },
        {
          "n": 23,
          "t": "Que la gracia del Señor Jesucristo sea con el espíritu de cada uno de ustedes."
        }
      ]
    }
  },
  "rom8": {
    "bookId": 45,
    "chapter": 8,
    "focusStart": null,
    "focusEnd": null,
    "versions": {
      "rvr1960": [
        {
          "n": 1,
          "t": "Ahora, pues, ninguna condenación hay para los que están en Cristo Jesús, los que no andan conforme a la carne, sino conforme al Espíritu."
        },
        {
          "n": 2,
          "t": "Porque la ley del Espíritu de vida en Cristo Jesús me ha librado de la ley del pecado y de la muerte."
        },
        {
          "n": 3,
          "t": "Porque lo que era imposible para la ley, por cuanto era débil por la carne, Dios, enviando a su Hijo en semejanza de carne de pecado y a causa del pecado, condenó al pecado en la carne;"
        },
        {
          "n": 4,
          "t": "para que la justicia de la ley se cumpliese en nosotros, que no andamos conforme a la carne, sino conforme al Espíritu."
        },
        {
          "n": 5,
          "t": "Porque los que son de la carne piensan en las cosas de la carne; pero los que son del Espíritu, en las cosas del Espíritu."
        },
        {
          "n": 6,
          "t": "Porque el ocuparse de la carne es muerte, pero el ocuparse del Espíritu es vida y paz."
        },
        {
          "n": 7,
          "t": "Por cuanto los designios de la carne son enemistad contra Dios; porque no se sujetan a la ley de Dios, ni tampoco pueden;"
        },
        {
          "n": 8,
          "t": "y los que viven según la carne no pueden agradar a Dios."
        },
        {
          "n": 9,
          "t": "Mas vosotros no vivís según la carne, sino según el Espíritu, si es que el Espíritu de Dios mora en vosotros. Y si alguno no tiene el Espíritu de Cristo, no es de él."
        },
        {
          "n": 10,
          "t": "Pero si Cristo está en vosotros, el cuerpo en verdad está muerto a causa del pecado, mas el espíritu vive a causa de la justicia."
        },
        {
          "n": 11,
          "t": "Y si el Espíritu de aquel que levantó de los muertos a Jesús mora en vosotros, el que levantó de los muertos a Cristo Jesús vivificará también vuestros cuerpos mortales por su Espíritu que mora en vosotros."
        },
        {
          "n": 12,
          "t": "Así que, hermanos, deudores somos, no a la carne, para que vivamos conforme a la carne;"
        },
        {
          "n": 13,
          "t": "porque si vivís conforme a la carne, moriréis; mas si por el Espíritu hacéis morir las obras de la carne, viviréis."
        },
        {
          "n": 14,
          "t": "Porque todos los que son guiados por el Espíritu de Dios, éstos son hijos de Dios."
        },
        {
          "n": 15,
          "t": "Pues no habéis recibido el espíritu de esclavitud para estar otra vez en temor, sino que habéis recibido el espíritu de adopción, por el cual clamamos: ¡Abba, Padre!"
        },
        {
          "n": 16,
          "t": "El Espíritu mismo da testimonio a nuestro espíritu, de que somos hijos de Dios."
        },
        {
          "n": 17,
          "t": "Y si hijos, también herederos; herederos de Dios y coherederos con Cristo, si es que padecemos juntamente con él, para que juntamente con él seamos glorificados."
        },
        {
          "n": 18,
          "t": "Pues tengo por cierto que las aflicciones del tiempo presente no son comparables con la gloria venidera que en nosotros ha de manifestarse."
        },
        {
          "n": 19,
          "t": "Porque el anhelo ardiente de la creación es el aguardar la manifestación de los hijos de Dios."
        },
        {
          "n": 20,
          "t": "Porque la creación fue sujetada a vanidad, no por su propia voluntad, sino por causa del que la sujetó en esperanza;"
        },
        {
          "n": 21,
          "t": "porque también la creación misma será libertada de la esclavitud de corrupción, a la libertad gloriosa de los hijos de Dios."
        },
        {
          "n": 22,
          "t": "Porque sabemos que toda la creación gime a una, y a una está con dolores de parto hasta ahora;"
        },
        {
          "n": 23,
          "t": "y no sólo ella, sino que también nosotros mismos, que tenemos las primicias del Espíritu, nosotros también gemimos dentro de nosotros mismos, esperando la adopción, la redención de nuestro cuerpo."
        },
        {
          "n": 24,
          "t": "Porque en esperanza fuimos salvos; pero la esperanza que se ve, no es esperanza; porque lo que alguno ve, ¿a qué esperarlo?"
        },
        {
          "n": 25,
          "t": "Pero si esperamos lo que no vemos, con paciencia lo aguardamos."
        },
        {
          "n": 26,
          "t": "Y de igual manera el Espíritu nos ayuda en nuestra debilidad; pues qué hemos de pedir como conviene, no lo sabemos, pero el Espíritu mismo intercede por nosotros con gemidos indecibles."
        },
        {
          "n": 27,
          "t": "Mas el que escudriña los corazones sabe cuál es la intención del Espíritu, porque conforme a la voluntad de Dios intercede por los santos."
        },
        {
          "n": 28,
          "t": "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados."
        },
        {
          "n": 29,
          "t": "Porque a los que antes conoció, también los predestinó para que fuesen hechos conformes a la imagen de su Hijo, para que él sea el primogénito entre muchos hermanos."
        },
        {
          "n": 30,
          "t": "Y a los que predestinó, a éstos también llamó; y a los que llamó, a éstos también justificó; y a los que justificó, a éstos también glorificó."
        },
        {
          "n": 31,
          "t": "¿Qué, pues, diremos a esto? Si Dios es por nosotros, ¿quién contra nosotros?"
        },
        {
          "n": 32,
          "t": "El que no escatimó ni a su propio Hijo, sino que lo entregó por todos nosotros, ¿cómo no nos dará también con él todas las cosas?"
        },
        {
          "n": 33,
          "t": "¿Quién acusará a los escogidos de Dios? Dios es el que justifica."
        },
        {
          "n": 34,
          "t": "¿Quién es el que condenará? Cristo es el que murió; más aun, el que también resucitó, el que además está a la diestra de Dios, el que también intercede por nosotros."
        },
        {
          "n": 35,
          "t": "¿Quién nos separará del amor de Cristo? ¿Tribulación, o angustia, o persecución, o hambre, o desnudez, o peligro, o espada?"
        },
        {
          "n": 36,
          "t": "Como está escrito: Por causa de ti somos muertos todo el tiempo; Somos contados como ovejas de matadero."
        },
        {
          "n": 37,
          "t": "Antes, en todas estas cosas somos más que vencedores por medio de aquel que nos amó."
        },
        {
          "n": 38,
          "t": "Por lo cual estoy seguro de que ni la muerte, ni la vida, ni ángeles, ni principados, ni potestades, ni lo presente, ni lo por venir,"
        },
        {
          "n": 39,
          "t": "ni lo alto, ni lo profundo, ni ninguna otra cosa creada nos podrá separar del amor de Dios, que es en Cristo Jesús Señor nuestro."
        }
      ],
      "ntv": [
        {
          "n": 1,
          "t": "Por lo tanto, ya no hay condenación para los que pertenecen a Cristo Jesús;"
        },
        {
          "n": 2,
          "t": "y porque ustedes pertenecen a él, el poder del Espíritu que da vida los ha libertado del poder del pecado, que lleva a la muerte."
        },
        {
          "n": 3,
          "t": "La ley de Moisés no podía salvarnos, porque nuestra naturaleza pecaminosa es débil. Así que Dios hizo lo que la ley no podía hacer. Él envió a su propio Hijo en un cuerpo como el que nosotros los pecadores tenemos; y en ese cuerpo, mediante la entrega de su Hijo como sacrificio por nuestros pecados, Dios declaró el fin del dominio que el pecado tenía sobre nosotros."
        },
        {
          "n": 4,
          "t": "Lo hizo para que se cumpliera totalmente la exigencia justa de la ley a favor de nosotros, que ya no seguimos a nuestra naturaleza pecaminosa sino que seguimos al Espíritu."
        },
        {
          "n": 5,
          "t": "Los que están dominados por la naturaleza pecaminosa piensan en cosas pecaminosas, pero los que son controlados por el Espíritu Santo piensan en las cosas que agradan al Espíritu."
        },
        {
          "n": 6,
          "t": "Por lo tanto, permitir que la naturaleza pecaminosa les controle la mente lleva a la muerte. Pero permitir que el Espíritu les controle la mente lleva a la vida y a la paz."
        },
        {
          "n": 7,
          "t": "Pues la naturaleza pecaminosa es enemiga de Dios siempre. Nunca obedeció las leyes de Dios y jamás lo hará."
        },
        {
          "n": 8,
          "t": "Por eso, los que todavía viven bajo el dominio de la naturaleza pecaminosa nunca pueden agradar a Dios."
        },
        {
          "n": 9,
          "t": "Pero ustedes no están dominados por su naturaleza pecaminosa. Son controlados por el Espíritu si el Espíritu de Dios vive en ustedes. (Y recuerden que los que no tienen al Espíritu de Cristo en ellos, de ninguna manera pertenecen a él)."
        },
        {
          "n": 10,
          "t": "Y Cristo vive en ustedes; entonces, aunque el cuerpo morirá por causa del pecado, el Espíritu les da vida, porque ustedes ya fueron declarados justos a los ojos de Dios."
        },
        {
          "n": 11,
          "t": "El Espíritu de Dios, quien levantó a Jesús de los muertos, vive en ustedes; y así como Dios levantó a Cristo Jesús de los muertos, él dará vida a sus cuerpos mortales mediante el mismo Espíritu, quien vive en ustedes."
        },
        {
          "n": 12,
          "t": "Por lo tanto, amados hermanos, no están obligados a hacer lo que su naturaleza pecaminosa los incita a hacer;"
        },
        {
          "n": 13,
          "t": "pues, si viven obedeciéndola, morirán; pero si mediante el poder del Espíritu hacen morir las acciones de la naturaleza pecaminosa, vivirán."
        },
        {
          "n": 14,
          "t": "Pues todos los que son guiados por el Espíritu de Dios son hijos de Dios."
        },
        {
          "n": 15,
          "t": "Y ustedes no han recibido un espíritu que los esclavice al miedo. En cambio, recibieron el Espíritu de Dios cuando él los adoptó como sus propios hijos. Ahora lo llamamos «Abba, Padre» ."
        },
        {
          "n": 16,
          "t": "Pues su Espíritu se une a nuestro espíritu para confirmar que somos hijos de Dios."
        },
        {
          "n": 17,
          "t": "Así que como somos sus hijos, también somos sus herederos. De hecho, somos herederos junto con Cristo de la gloria de Dios; pero si vamos a participar de su gloria, también debemos participar de su sufrimiento."
        },
        {
          "n": 18,
          "t": "Sin embargo, lo que ahora sufrimos no es nada comparado con la gloria que él nos revelará más adelante."
        },
        {
          "n": 19,
          "t": "Pues toda la creación espera con anhelo el día futuro en que Dios revelará quiénes son verdaderamente sus hijos."
        },
        {
          "n": 20,
          "t": "Contra su propia voluntad, toda la creación quedó sujeta a la maldición de Dios. Sin embargo, con gran esperanza,"
        },
        {
          "n": 21,
          "t": "la creación espera el día en que será liberada de la muerte y la descomposición, y se unirá a la gloria de los hijos de Dios."
        },
        {
          "n": 22,
          "t": "Pues sabemos que, hasta el día de hoy, toda la creación gime de angustia como si tuviera dolores de parto;"
        },
        {
          "n": 23,
          "t": "y los creyentes también gemimos —aunque tenemos al Espíritu de Dios en nosotros como una muestra anticipada de la gloria futura— porque anhelamos que nuestro cuerpo sea liberado del pecado y el sufrimiento. Nosotros también deseamos con una esperanza ferviente que llegue el día en que Dios nos dé todos nuestros derechos como sus hijos adoptivos, incluido el nuevo cuerpo que nos prometió."
        },
        {
          "n": 24,
          "t": "Recibimos esa esperanza cuando fuimos salvos. (Si uno ya tiene algo, no necesita esperarlo;"
        },
        {
          "n": 25,
          "t": "pero si deseamos algo que todavía no tenemos, debemos esperar con paciencia y confianza)."
        },
        {
          "n": 26,
          "t": "Además, el Espíritu Santo nos ayuda en nuestra debilidad. Por ejemplo, nosotros no sabemos qué quiere Dios que le pidamos en oración, pero el Espíritu Santo ora por nosotros con gemidos que no pueden expresarse con palabras."
        },
        {
          "n": 27,
          "t": "Y el Padre, quien conoce cada corazón, sabe lo que el Espíritu dice, porque el Espíritu intercede por nosotros, los creyentes, en armonía con la voluntad de Dios."
        },
        {
          "n": 28,
          "t": "Y sabemos que Dios hace que todas las cosas cooperen para el bien de quienes lo aman y son llamados según el propósito que él tiene para ellos."
        },
        {
          "n": 29,
          "t": "Pues Dios conoció a los suyos de antemano y los eligió para que llegaran a ser como su Hijo, a fin de que su Hijo fuera el hijo mayor de muchos hermanos."
        },
        {
          "n": 30,
          "t": "Después de haberlos elegido, Dios los llamó para que se acercaran a él; y una vez que los llamó, los puso en la relación correcta con él; y luego de ponerlos en la relación correcta con él, les dio su gloria."
        },
        {
          "n": 31,
          "t": "¿Qué podemos decir acerca de cosas tan maravillosas como estas? Si Dios está a favor de nosotros, ¿quién podrá ponerse en nuestra contra?"
        },
        {
          "n": 32,
          "t": "Si Dios no se guardó ni a su propio Hijo, sino que lo entregó por todos nosotros, ¿no nos dará también todo lo demás?"
        },
        {
          "n": 33,
          "t": "¿Quién se atreve a acusarnos a nosotros, a quienes Dios ha elegido para sí? Nadie, porque Dios mismo nos puso en la relación correcta con él."
        },
        {
          "n": 34,
          "t": "Entonces, ¿quién nos condenará? Nadie, porque Cristo Jesús murió por nosotros y resucitó por nosotros, y está sentado en el lugar de honor, a la derecha de Dios, e intercede por nosotros."
        },
        {
          "n": 35,
          "t": "¿Acaso hay algo que pueda separarnos del amor de Cristo? ¿Será que él ya no nos ama si tenemos problemas o aflicciones, si somos perseguidos o pasamos hambre o estamos en la miseria o en peligro o bajo amenaza de muerte?"
        },
        {
          "n": 36,
          "t": "(Como dicen las Escrituras: «Por tu causa nos matan cada día; nos tratan como a ovejas en el matadero» )."
        },
        {
          "n": 37,
          "t": "Claro que no, a pesar de todas estas cosas, nuestra victoria es absoluta por medio de Cristo, quien nos amó."
        },
        {
          "n": 38,
          "t": "Y estoy convencido de que nada podrá jamás separarnos del amor de Dios. Ni la muerte ni la vida, ni ángeles ni demonios, ni nuestros temores de hoy ni nuestras preocupaciones de mañana. Ni siquiera los poderes del infierno pueden separarnos del amor de Dios."
        },
        {
          "n": 39,
          "t": "Ningún poder en las alturas ni en las profundidades, de hecho, nada en toda la creación podrá jamás separarnos del amor de Dios, que está revelado en Cristo Jesús nuestro Señor."
        }
      ]
    }
  },
  "2cor10": {
    "bookId": 47,
    "chapter": 10,
    "focusStart": 3,
    "focusEnd": 5,
    "versions": {
      "rvr1960": [
        {
          "n": 1,
          "t": "Yo Pablo os ruego por la mansedumbre y ternura de Cristo, yo que estando presente ciertamente soy humilde entre vosotros, mas ausente soy osado para con vosotros;"
        },
        {
          "n": 2,
          "t": "ruego, pues, que cuando esté presente, no tenga que usar de aquella osadía con que estoy dispuesto a proceder resueltamente contra algunos que nos tienen como si anduviésemos según la carne."
        },
        {
          "n": 3,
          "t": "Pues aunque andamos en la carne, no militamos según la carne;"
        },
        {
          "n": 4,
          "t": "porque las armas de nuestra milicia no son carnales, sino poderosas en Dios para la destrucción de fortalezas,"
        },
        {
          "n": 5,
          "t": "derribando argumentos y toda altivez que se levanta contra el conocimiento de Dios, y llevando cautivo todo pensamiento a la obediencia a Cristo,"
        },
        {
          "n": 6,
          "t": "y estando prontos para castigar toda desobediencia, cuando vuestra obediencia sea perfecta."
        },
        {
          "n": 7,
          "t": "Miráis las cosas según la apariencia. Si alguno está persuadido en sí mismo que es de Cristo, esto también piense por sí mismo, que como él es de Cristo, así también nosotros somos de Cristo."
        },
        {
          "n": 8,
          "t": "Porque aunque me gloríe algo más todavía de nuestra autoridad, la cual el Señor nos dio para edificación y no para vuestra destrucción, no me avergonzaré;"
        },
        {
          "n": 9,
          "t": "para que no parezca como que os quiero amedrentar por cartas."
        },
        {
          "n": 10,
          "t": "Porque a la verdad, dicen, las cartas son duras y fuertes; mas la presencia corporal débil, y la palabra menospreciable."
        },
        {
          "n": 11,
          "t": "Esto tenga en cuenta tal persona, que así como somos en la palabra por cartas, estando ausentes, lo seremos también en hechos, estando presentes."
        },
        {
          "n": 12,
          "t": "Porque no nos atrevemos a contarnos ni a compararnos con algunos que se alaban a sí mismos; pero ellos, midiéndose a sí mismos por sí mismos, y comparándose consigo mismos, no son juiciosos."
        },
        {
          "n": 13,
          "t": "Pero nosotros no nos gloriaremos desmedidamente, sino conforme a la regla que Dios nos ha dado por medida, para llegar también hasta vosotros."
        },
        {
          "n": 14,
          "t": "Porque no nos hemos extralimitado, como si no llegásemos hasta vosotros, pues fuimos los primeros en llegar hasta vosotros con el evangelio de Cristo."
        },
        {
          "n": 15,
          "t": "No nos gloriamos desmedidamente en trabajos ajenos, sino que esperamos que conforme crezca vuestra fe seremos muy engrandecidos entre vosotros, conforme a nuestra regla;"
        },
        {
          "n": 16,
          "t": "y que anunciaremos el evangelio en los lugares más allá de vosotros, sin entrar en la obra de otro para gloriarnos en lo que ya estaba preparado."
        },
        {
          "n": 17,
          "t": "Mas el que se gloría, gloríese en el Señor;"
        },
        {
          "n": 18,
          "t": "porque no es aprobado el que se alaba a sí mismo, sino aquel a quien Dios alaba."
        }
      ],
      "ntv": [
        {
          "n": 1,
          "t": "Ahora yo, Pablo, les ruego con la ternura y bondad de Cristo, aunque me doy cuenta de que piensan que soy tímido en persona y valiente solo cuando escribo desde lejos."
        },
        {
          "n": 2,
          "t": "Pues bien, les suplico ahora, para que cuando vaya, no tenga que ser atrevido con los que piensan que actuamos con intenciones humanas."
        },
        {
          "n": 3,
          "t": "Somos humanos, pero no luchamos como lo hacen los humanos."
        },
        {
          "n": 4,
          "t": "Usamos las armas poderosas de Dios, no las del mundo, para derribar las fortalezas del razonamiento humano y para destruir argumentos falsos."
        },
        {
          "n": 5,
          "t": "Destruimos todo obstáculo de arrogancia que impide que la gente conozca a Dios. Capturamos los pensamientos rebeldes y enseñamos a las personas a obedecer a Cristo;"
        },
        {
          "n": 6,
          "t": "y una vez que ustedes lleguen a ser totalmente obedientes, castigaremos a todo el que siga en desobediencia."
        },
        {
          "n": 7,
          "t": "Fíjense en los hechos evidentes. Los que afirman que pertenecen a Cristo deben reconocer que nosotros pertenecemos a Cristo tanto como ellos."
        },
        {
          "n": 8,
          "t": "Pareciera que estoy jactándome demasiado de la autoridad que nos dio el Señor, pero nuestra autoridad los edifica a ustedes, no los destruye. Así que no me avergonzaré de usar mi autoridad."
        },
        {
          "n": 9,
          "t": "No es mi intención asustarlos con mis cartas."
        },
        {
          "n": 10,
          "t": "Pues algunos dicen: «Las cartas de Pablo son exigentes y fuertes, ¡pero él en persona es débil y sus discursos no valen nada!»."
        },
        {
          "n": 11,
          "t": "Esas personas deberían darse cuenta de que nuestras acciones, cuando lleguemos en persona, serán tan enérgicas como lo que decimos en nuestras cartas, que llegan desde lejos."
        },
        {
          "n": 12,
          "t": "¡Ah, no se preocupen! No nos atreveríamos a decir que somos tan maravillosos como esos hombres, que les dicen qué importantes son ellos pero solo se comparan el uno con el otro, empleándose a sí mismos como estándar de medición. ¡Qué ignorantes!"
        },
        {
          "n": 13,
          "t": "Nosotros no nos jactaremos de cosas hechas fuera de nuestro campo de autoridad. Nos jactaremos solo de lo que haya sucedido dentro de los límites del trabajo que Dios nos ha dado, los cuales incluyen nuestro trabajo con ustedes."
        },
        {
          "n": 14,
          "t": "No traspasamos esos límites cuando afirmamos tener autoridad sobre ustedes, como si nunca hubiéramos ido a visitarlos. Pues fuimos los primeros en viajar hasta Corinto con la Buena Noticia de Cristo."
        },
        {
          "n": 15,
          "t": "Tampoco nos jactamos ni nos atribuimos el mérito por el trabajo que otro haya hecho. En cambio, esperamos que la fe de ustedes crezca, a fin de que se extiendan los límites de nuestro trabajo entre ustedes."
        },
        {
          "n": 16,
          "t": "Entonces podremos ir a predicar la Buena Noticia en otros lugares más allá de ustedes, donde ningún otro esté trabajando. Así nadie pensará que nos jactamos de trabajar en el territorio de otro."
        },
        {
          "n": 17,
          "t": "Como dicen las Escrituras: «Si quieres jactarte, jáctate solo del SEÑOR» ."
        },
        {
          "n": 18,
          "t": "Cuando la gente se alaba a sí misma, ese elogio no sirve de mucho. Lo importante es que los elogios provengan del Señor."
        }
      ]
    }
  },
  "salmo51": {
    "bookId": 19,
    "chapter": 51,
    "focusStart": null,
    "focusEnd": null,
    "versions": {
      "rvr1960": [
        {
          "n": 1,
          "t": "Ten piedad de mí, oh Dios, conforme a tu misericordia; Conforme a la multitud de tus piedades borra mis rebeliones."
        },
        {
          "n": 2,
          "t": "Lávame más y más de mi maldad, Y límpiame de mi pecado."
        },
        {
          "n": 3,
          "t": "Porque yo reconozco mis rebeliones, Y mi pecado está siempre delante de mí."
        },
        {
          "n": 4,
          "t": "Contra ti, contra ti solo he pecado, Y he hecho lo malo delante de tus ojos; Para que seas reconocido justo en tu palabra, Y tenido por puro en tu juicio."
        },
        {
          "n": 5,
          "t": "He aquí, en maldad he sido formado, Y en pecado me concibió mi madre."
        },
        {
          "n": 6,
          "t": "He aquí, tú amas la verdad en lo íntimo, Y en lo secreto me has hecho comprender sabiduría."
        },
        {
          "n": 7,
          "t": "Purifícame con hisopo, y seré limpio; Lávame, y seré más blanco que la nieve."
        },
        {
          "n": 8,
          "t": "Hazme oír gozo y alegría, Y se recrearán los huesos que has abatido."
        },
        {
          "n": 9,
          "t": "Esconde tu rostro de mis pecados, Y borra todas mis maldades."
        },
        {
          "n": 10,
          "t": "Crea en mí, oh Dios, un corazón limpio, Y renueva un espíritu recto dentro de mí."
        },
        {
          "n": 11,
          "t": "No me eches de delante de ti, Y no quites de mí tu santo Espíritu."
        },
        {
          "n": 12,
          "t": "Vuélveme el gozo de tu salvación, Y espíritu noble me sustente."
        },
        {
          "n": 13,
          "t": "Entonces enseñaré a los transgresores tus caminos, Y los pecadores se convertirán a ti."
        },
        {
          "n": 14,
          "t": "Líbrame de homicidios, oh Dios, Dios de mi salvación; Cantará mi lengua tu justicia."
        },
        {
          "n": 15,
          "t": "Señor, abre mis labios, Y publicará mi boca tu alabanza."
        },
        {
          "n": 16,
          "t": "Porque no quieres sacrificio, que yo lo daría; No quieres holocausto."
        },
        {
          "n": 17,
          "t": "Los sacrificios de Dios son el espíritu quebrantado; Al corazón contrito y humillado no despreciarás tú, oh Dios."
        },
        {
          "n": 18,
          "t": "Haz bien con tu benevolencia a Sion; Edifica los muros de Jerusalén."
        },
        {
          "n": 19,
          "t": "Entonces te agradarán los sacrificios de justicia, el holocausto u ofrenda del todo quemada; Entonces ofrecerán becerros sobre tu altar."
        }
      ],
      "ntv": [
        {
          "n": 1,
          "t": "Ten misericordia de mí, oh Dios, debido a tu amor inagotable; a causa de tu gran compasión, borra la mancha de mis pecados."
        },
        {
          "n": 2,
          "t": "Lávame de la culpa hasta que quede limpio y purifícame de mis pecados."
        },
        {
          "n": 3,
          "t": "Pues reconozco mis rebeliones; día y noche me persiguen."
        },
        {
          "n": 4,
          "t": "Contra ti y sólo contra ti he pecado; he hecho lo que es malo ante tus ojos. Quedará demostrado que tienes razón en lo que dices y que tu juicio contra mí es justo."
        },
        {
          "n": 5,
          "t": "Pues soy pecador de nacimiento, así es, desde el momento en que me concibió mi madre."
        },
        {
          "n": 6,
          "t": "Pero tú deseas honradez desde el vientre y aun allí me enseñas sabiduría."
        },
        {
          "n": 7,
          "t": "Purifícame de mis pecados, y quedaré limpio; lávame, y quedaré más blanco que la nieve."
        },
        {
          "n": 8,
          "t": "Devuélveme la alegría; deja que me goce ahora que me has quebrantado."
        },
        {
          "n": 9,
          "t": "No sigas mirando mis pecados; quita la mancha de mi culpa."
        },
        {
          "n": 10,
          "t": "Crea en mí, oh Dios, un corazón limpio y renueva un espíritu fiel dentro de mí."
        },
        {
          "n": 11,
          "t": "No me expulses de tu presencia y no me quites tu Espíritu Santo."
        },
        {
          "n": 12,
          "t": "Restaura en mí la alegría de tu salvación y haz que esté dispuesto a obedecerte."
        },
        {
          "n": 13,
          "t": "Entonces enseñaré a los rebeldes tus caminos, y ellos se volverán a ti."
        },
        {
          "n": 14,
          "t": "Perdóname por derramar sangre, oh Dios que salva; entonces con alegría cantaré de tu perdón."
        },
        {
          "n": 15,
          "t": "Desata mis labios, oh Señor, para que mi boca pueda alabarte."
        },
        {
          "n": 16,
          "t": "Tú no deseas sacrificios; de lo contrario, te ofrecería uno. Tampoco quieres una ofrenda quemada."
        },
        {
          "n": 17,
          "t": "El sacrificio que sí deseas es un espíritu quebrantado; tú no rechazarás un corazón arrepentido y quebrantado, oh Dios."
        },
        {
          "n": 18,
          "t": "Mira a Sión con tu favor y ayúdala; reconstruye las murallas de Jerusalén."
        },
        {
          "n": 19,
          "t": "Entonces te agradarán los sacrificios ofrecidos con un espíritu correcto; con ofrendas quemadas y ofrendas quemadas enteras. Entonces volverán a sacrificarse toros sobre tu altar."
        }
      ]
    }
  },
  "juan15": {
    "bookId": 43,
    "chapter": 15,
    "focusStart": 1,
    "focusEnd": 11,
    "versions": {
      "rvr1960": [
        {
          "n": 1,
          "t": "Yo soy la vid verdadera, y mi Padre es el labrador."
        },
        {
          "n": 2,
          "t": "Todo pámpano que en mí no lleva fruto, lo quitará; y todo aquel que lleva fruto, lo limpiará, para que lleve más fruto."
        },
        {
          "n": 3,
          "t": "Ya vosotros estáis limpios por la palabra que os he hablado."
        },
        {
          "n": 4,
          "t": "Permaneced en mí, y yo en vosotros. Como el pámpano no puede llevar fruto por sí mismo, si no permanece en la vid, así tampoco vosotros, si no permanecéis en mí."
        },
        {
          "n": 5,
          "t": "Yo soy la vid, vosotros los pámpanos; el que permanece en mí, y yo en él, éste lleva mucho fruto; porque separados de mí nada podéis hacer."
        },
        {
          "n": 6,
          "t": "El que en mí no permanece, será echado fuera como pámpano, y se secará; y los recogen, y los echan en el fuego, y arden."
        },
        {
          "n": 7,
          "t": "Si permanecéis en mí, y mis palabras permanecen en vosotros, pedid todo lo que queréis, y os será hecho."
        },
        {
          "n": 8,
          "t": "En esto es glorificado mi Padre, en que llevéis mucho fruto, y seáis así mis discípulos."
        },
        {
          "n": 9,
          "t": "Como el Padre me ha amado, así también yo os he amado; permaneced en mi amor."
        },
        {
          "n": 10,
          "t": "Si guardareis mis mandamientos, permaneceréis en mi amor; así como yo he guardado los mandamientos de mi Padre, y permanezco en su amor."
        },
        {
          "n": 11,
          "t": "Estas cosas os he hablado, para que mi gozo esté en vosotros, y vuestro gozo sea cumplido."
        },
        {
          "n": 12,
          "t": "Este es mi mandamiento: Que os améis unos a otros, como yo os he amado."
        },
        {
          "n": 13,
          "t": "Nadie tiene mayor amor que este, que uno ponga su vida por sus amigos."
        },
        {
          "n": 14,
          "t": "Vosotros sois mis amigos, si hacéis lo que yo os mando."
        },
        {
          "n": 15,
          "t": "Ya no os llamaré siervos, porque el siervo no sabe lo que hace su señor; pero os he llamado amigos, porque todas las cosas que oí de mi Padre, os las he dado a conocer."
        },
        {
          "n": 16,
          "t": "No me elegisteis vosotros a mí, sino que yo os elegí a vosotros, y os he puesto para que vayáis y llevéis fruto, y vuestro fruto permanezca; para que todo lo que pidiereis al Padre en mi nombre, él os lo dé."
        },
        {
          "n": 17,
          "t": "Esto os mando: Que os améis unos a otros."
        },
        {
          "n": 18,
          "t": "Si el mundo os aborrece, sabed que a mí me ha aborrecido antes que a vosotros."
        },
        {
          "n": 19,
          "t": "Si fuerais del mundo, el mundo amaría lo suyo; pero porque no sois del mundo, antes yo os elegí del mundo, por eso el mundo os aborrece."
        },
        {
          "n": 20,
          "t": "Acordaos de la palabra que yo os he dicho: El siervo no es mayor que su señor. Si a mí me han perseguido, también a vosotros os perseguirán; si han guardado mi palabra, también guardarán la vuestra."
        },
        {
          "n": 21,
          "t": "Mas todo esto os harán por causa de mi nombre, porque no conocen al que me ha enviado."
        },
        {
          "n": 22,
          "t": "Si yo no hubiera venido, ni les hubiera hablado, no tendrían pecado; pero ahora no tienen excusa por su pecado."
        },
        {
          "n": 23,
          "t": "El que me aborrece a mí, también a mi Padre aborrece."
        },
        {
          "n": 24,
          "t": "Si yo no hubiese hecho entre ellos obras que ningún otro ha hecho, no tendrían pecado; pero ahora han visto y han aborrecido a mí y a mi Padre."
        },
        {
          "n": 25,
          "t": "Pero esto es para que se cumpla la palabra que está escrita en su ley: Sin causa me aborrecieron."
        },
        {
          "n": 26,
          "t": "Pero cuando venga el Consolador, a quien yo os enviaré del Padre, el Espíritu de verdad, el cual procede del Padre, él dará testimonio acerca de mí."
        },
        {
          "n": 27,
          "t": "Y vosotros daréis testimonio también, porque habéis estado conmigo desde el principio."
        }
      ],
      "ntv": [
        {
          "n": 1,
          "t": "»Yo soy la vid verdadera, y mi Padre es el labrador."
        },
        {
          "n": 2,
          "t": "Él corta de mí toda rama que no produce fruto y poda las ramas que sí dan fruto, para que den aún más."
        },
        {
          "n": 3,
          "t": "Ustedes ya han sido podados y purificados por el mensaje que les di."
        },
        {
          "n": 4,
          "t": "Permanezcan en mí, y yo permaneceré en ustedes. Pues una rama no puede producir fruto si la cortan de la vid, y ustedes tampoco pueden ser fructíferos a menos que permanezcan en mí."
        },
        {
          "n": 5,
          "t": "»Ciertamente, yo soy la vid; ustedes son las ramas. Los que permanecen en mí y yo en ellos producirán mucho fruto porque, separados de mí, no pueden hacer nada."
        },
        {
          "n": 6,
          "t": "El que no permanece en mí es desechado como rama inútil y se seca. Todas esas ramas se juntan en un montón para quemarlas en el fuego."
        },
        {
          "n": 7,
          "t": "Si ustedes permanecen en mí y mis palabras permanecen en ustedes, pueden pedir lo que quieran, ¡y les será concedido!"
        },
        {
          "n": 8,
          "t": "Cuando producen mucho fruto, demuestran que son mis verdaderos discípulos. Eso le da mucha gloria a mi Padre."
        },
        {
          "n": 9,
          "t": "»Yo los he amado a ustedes tanto como el Padre me ha amado a mí. Permanezcan en mi amor."
        },
        {
          "n": 10,
          "t": "Cuando obedecen mis mandamientos, permanecen en mi amor, así como yo obedezco los mandamientos de mi Padre y permanezco en su amor."
        },
        {
          "n": 11,
          "t": "Les he dicho estas cosas para que se llenen de mi gozo; así es, desbordarán de gozo."
        },
        {
          "n": 12,
          "t": "Este es mi mandamiento: ámense unos a otros de la misma manera en que yo los he amado."
        },
        {
          "n": 13,
          "t": "No hay un amor más grande que el dar la vida por los amigos."
        },
        {
          "n": 14,
          "t": "Ustedes son mis amigos si hacen lo que yo les mando."
        },
        {
          "n": 15,
          "t": "Ya no los llamo esclavos, porque el amo no confía sus asuntos a los esclavos. Ustedes ahora son mis amigos, porque les he contado todo lo que el Padre me dijo."
        },
        {
          "n": 16,
          "t": "Ustedes no me eligieron a mí, yo los elegí a ustedes. Les encargué que vayan y produzcan frutos duraderos, así el Padre les dará todo lo que pidan en mi nombre."
        },
        {
          "n": 17,
          "t": "Este es mi mandato: ámense unos a otros."
        },
        {
          "n": 18,
          "t": "»Si el mundo los odia, recuerden que a mí me odió primero."
        },
        {
          "n": 19,
          "t": "Si pertenecieran al mundo, el mundo los amaría como a uno de los suyos, pero ustedes ya no forman parte del mundo. Yo los elegí para que salieran del mundo, por eso el mundo los odia."
        },
        {
          "n": 20,
          "t": "¿Recuerdan lo que les dije? “El esclavo no es superior a su amo”. Ya que me persiguieron a mí, también a ustedes los perseguirán. Y, si me hubieran escuchado a mí, también los escucharían a ustedes."
        },
        {
          "n": 21,
          "t": "Les harán todo eso a causa de mí, porque han rechazado a aquel que me envió."
        },
        {
          "n": 22,
          "t": "Ellos no serían culpables si yo no hubiera venido a hablarles, pero ahora no tienen ninguna excusa por su pecado."
        },
        {
          "n": 23,
          "t": "Cualquiera que me odia a mí también odia a mi Padre."
        },
        {
          "n": 24,
          "t": "Si yo no hubiera hecho entre ellos esas señales tan milagrosas que nadie más podría hacer, no serían culpables; pero la verdad es que vieron todo lo que hice, y aun así nos siguen odiando a mí y a mi Padre."
        },
        {
          "n": 25,
          "t": "Con eso se cumple lo que está registrado en sus Escrituras: “Me odiaron sin motivo”."
        },
        {
          "n": 26,
          "t": "»A ustedes yo les enviaré al Abogado Defensor, el Espíritu de verdad. Él vendrá del Padre y dará testimonio acerca de mí,"
        },
        {
          "n": 27,
          "t": "y también ustedes deben dar testimonio de mí porque han estado conmigo desde el principio de mi ministerio."
        }
      ]
    }
  }
} satisfies Record<string, ChapterText>;
