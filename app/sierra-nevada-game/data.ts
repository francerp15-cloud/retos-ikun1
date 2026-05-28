import type { Animal, QuizQuestion } from "./types";

// ── Fuente: "Ana'nʉga jina niwi ka'gʉmʉse' kwʉya. Los animales de nuestra Sierra"
// ── y "Ka'se' wʉreri nʉya jina / Los reptiles"
// ── Editorial Unimagdalena / Cabildo Arhuaco 2025

export const ANIMALS_DB: Animal[] = [
  // ── INSECTOS / Chún Jina ──────────────────────────────────────────────────
  {
    id: "libelula",
    nameEs: "Libélula",
    nameArh: "Ayugungu",
    type: "insecto",
    image: "/assets/images/animals/libelula.jpeg",
    audio: "/assets/audio/animals/libelula.ogg",
    desc: "Wesu arigeku nari, neykari ingumʉn sʉmʉ kwʉya ni — son los animales más numerosos del planeta, tienen seis patas, no tienen huesos y viven en la tierra y el agua. ¡Son importantes porque son polinizadores, oxigenan el suelo, comen y son comidos por otros!",
  },
  {
    id: "mantis",
    nameEs: "Mantis",
    nameArh: "Mamʉ",
    type: "insecto",
    image: "/assets/images/animals/mantis.jpeg",
    audio: "/assets/audio/animals/mantis.ogg",
    desc: "Mamʉ es la mantis religiosa de nuestra Sierra. Tiene patas delanteras en forma de pinza para atrapar presas con gran precisión. Es una cazadora silenciosa que ayuda a controlar otros insectos.",
  },
  {
    id: "abeja",
    nameEs: "Abeja",
    nameArh: "Bun",
    type: "insecto",
    image: "/assets/images/animals/abeja.jpeg",
    audio: "/assets/audio/animals/abeja.ogg",
    desc: "Bun, la abeja, poliniza las plantas de nuestra Sierra. Sin ella, muchas flores no podrían reproducirse. ¡Su trabajo mantiene vivo el bosque y nos da alimento a todos!",
  },
  {
    id: "grillo",
    nameEs: "Grillo",
    nameArh: "Sekʉnʉ",
    type: "insecto",
    image: "/assets/images/animals/grillo.jpeg",
    audio: "/assets/audio/animals/grillo.ogg",
    desc: "Sekʉnʉ llena las noches de la Sierra con su canto. Produce su música frotando las alas y sirve de alimento a aves y ranas. Es parte del coro natural de la montaña.",
  },
  {
    id: "hormiga",
    nameEs: "Hormiga",
    nameArh: "Isʉ",
    type: "insecto",
    image: "/assets/images/animals/hormiga.jpeg",
    audio: "/assets/audio/animals/hormiga.ogg",
    desc: "Isʉ, la hormiga, trabaja en comunidad como nosotros. Sus colonias airean el suelo y reciclan materia orgánica, manteniendo fértil la tierra serrana.",
  },
  {
    id: "luciernaga",
    nameEs: "Luciérnaga",
    nameArh: "Tínchume",
    type: "insecto",
    image: "/assets/images/animals/luciernaga.jpeg",
    audio: "/assets/audio/animals/luciernaga.ogg",
    desc: "Tínchume ilumina las noches oscuras de la Sierra con su luz bioluminiscente. Usa su brillo para encontrar pareja. Es una de las maravillas de nuestra Sierra.",
  },
  {
    id: "arana",
    nameEs: "Araña",
    nameArh: "Mʉnkwʉ",
    type: "insecto",
    image: "/assets/images/animals/arana.jpeg",
    audio: "/assets/audio/animals/arana.ogg",
    desc: "Mʉnkwʉ, la araña, tiene ocho patas y ayuda a controlar las plagas. Mʉnkwʉ awiri zeykuri abewa hʉtʉ wininuga ni — las arañas y escorpiones son importantes para el equilibrio de la naturaleza.",
  },
  {
    id: "escorpion",
    nameEs: "Escorpión",
    nameArh: "Zeyku",
    type: "insecto",
    image: "/assets/images/animals/escorpion.jpeg",
    audio: "/assets/audio/animals/escorpion.ogg",
    desc: "Zeyku, el escorpión, tiene ocho patas y su veneno le sirve para cazar y defenderse. Con su hermano Mʉnkwʉ, ayudan a controlar las plagas de la Sierra.",
  },
  {
    id: "lombriz",
    nameEs: "Lombriz",
    nameArh: "Mawʉnsiro",
    type: "insecto",
    image: "/assets/images/animals/lombriz.jpeg",
    audio: "/assets/audio/animals/lombriz.ogg",
    desc: "Mawʉnsiro, la lombriz, ayuda a tener la mejor tierra para la siembra. Al moverse airea el suelo y al descomponerse enriquece la tierra con nutrientes vitales para nuestros cultivos.",
  },
  {
    id: "caracol",
    nameEs: "Caracol",
    nameArh: "Urumʉ",
    type: "insecto",
    image: "/assets/images/animals/caracol.jpeg",
    audio: "/assets/audio/animals/caracol.ogg",
    desc: "Urumʉ, el caracol, recicla nutrientes y sirve de alimento. Lleva su casa a cuestas por los caminos húmedos de la Sierra y su concha espiral crece con él toda la vida.",
  },
  {
    id: "mariposa",
    nameEs: "Mariposa",
    nameArh: "Kwintʉro",
    type: "insecto",
    desc: "Kwintʉro jinari sʉmu juna diwʉn diwʉn kawa kwʉya ni — las mariposas son diversas, bellas e importantes, pues polinizan las plantas y sirven de alimento para otros animales, como las aves.",
  },

  // ── PECES / Ɉwiwaka - Wakʉ ───────────────────────────────────────────────
  {
    id: "guavino",
    nameEs: "Guavino",
    nameArh: "Kʉneyru",
    type: "pez",
    image: "/assets/images/animals/guavino.jpeg",
    audio: "/assets/audio/animals/guavino.ogg",
    desc: "Kʉneyru nada en los ríos de nuestra Sierra. Hay 99 tipos de peces en total en la Sierra. Cuando nuestros ríos y quebradas están limpios, los peces pueden vivir felices. ¡Los peces son muy importantes porque sirven de alimento a otros animales, incluso a nosotros!",
  },
  {
    id: "cucho",
    nameEs: "Cucho",
    nameArh: "Ucho",
    type: "pez",
    image: "/assets/images/animals/cucho.jpeg",
    audio: "/assets/audio/animals/cucho.ogg",
    desc: "Ucho es un pez de fondo que habita los ríos serranos. Su cuerpo cubierto de placas óseas lo protege de depredadores y corrientes. Waku jinari chow a'chwamʉ kawa — los peces son custodios de nuestras aguas.",
  },
  {
    id: "rollicito",
    nameEs: "Rollicito",
    nameArh: "Wakʉ",
    type: "pez",
    image: "/assets/images/animals/rollicito.jpeg",
    audio: "/assets/audio/animals/rollicito.ogg",
    desc: "Wakʉ, el rollicito, nada en las quebradas cristalinas de la Sierra. Es un pez pequeño y veloz. I Kawa úgg juna ingwi yowri, wakʉ kwʉya ni, niwi kagʉmuse — los peces son parte viva de nuestra Sierra Nevada.",
  },
  {
    id: "sardina",
    nameEs: "Sardina",
    nameArh: "Wabunsi",
    type: "pez",
    image: "/assets/images/animals/sardina.jpeg",
    audio: "/assets/audio/animals/sardina.ogg",
    desc: "Wabunsi viaja en cardúmenes por los ríos de la Sierra. Es alimento fundamental para aves, nutrias y comunidades indígenas. Su presencia nos habla de la salud de nuestros ríos.",
  },

  // ── RANAS Y SAPOS / Gowna awiri sapu jina ────────────────────────────────
  {
    id: "rana_cristal",
    nameEs: "Rana cristal",
    nameArh: "Kikro",
    type: "anfibio",
    image: "/assets/images/animals/rana_cristal.jpeg",
    audio: "/assets/audio/animals/rana_cristal.ogg",
    desc: "Kikro, la rana de cristal, tiene la piel tan transparente que se pueden ver sus órganos. Gowna awiri sapuri eyki ingiti kawéri jese' winkuya ni — estos viven primero en el agua y cuando crecen viven en la tierra. Son importantes para el control de otros animales.",
  },
  {
    id: "rana_hoja",
    nameEs: "Rana hoja",
    nameArh: "Akiriko",
    type: "anfibio",
    image: "/assets/images/animals/rana_hoja.jpeg",
    audio: "/assets/audio/animals/rana_hoja.ogg",
    desc: "Akiriko, la rana de hoja, tiene ojos rojos vibrantes y vive en la canopia del bosque. Muchos de ellos tienen un significado ancestral para nuestro pueblo. Son bioindicadores: su presencia nos dice que el ecosistema está sano.",
  },
  {
    id: "rana_dardo",
    nameEs: "Rana dardo",
    nameArh: "Sisika",
    type: "anfibio",
    image: "/assets/images/animals/rana_dardo.jpeg",
    audio: "/assets/audio/animals/rana_dardo.ogg",
    desc: "Sisika, la rana dardo, habita en el suelo del bosque húmedo. Aunque pequeña, produce toxinas que la protegen. Ey awi keymʉ eyma jinari ayeigwi niwi nʉna'bari — los anfibios conectan el mundo del agua y la tierra.",
  },
  {
    id: "arlequin",
    nameEs: "Arlequín de San Lorenzo",
    nameArh: "Gamaku",
    type: "anfibio",
    image: "/assets/images/animals/arlequin.jpeg",
    audio: "/assets/audio/animals/arlequin.ogg",
    desc: "Gamaku, el arlequín de San Lorenzo, es una rana endémica en peligro crítico de extinción. Solo habita en los bosques nublados de nuestra Sierra Nevada. Su protección es responsabilidad de todos.",
  },
  {
    id: "salamandra",
    nameEs: "Salamandra serrana",
    nameArh: "Nürü",
    type: "anfibio",
    image: "/assets/images/animals/salamandra.jpeg",
    desc: "Nürü, la salamandra serrana, es endémica de la Sierra Nevada. Estos viven primero en el agua y cuando crecen viven en la tierra. Son importantes para el control de otros animales y muchos tienen un significado ancestral para nuestro pueblo.",
  },

  // ── REPTILES / Ka'se' wʉreri nʉya jina ───────────────────────────────────
  {
    id: "lobito",
    nameEs: "Lobito",
    nameArh: "Mʉrrunza",
    type: "reptil",
    image: "/assets/images/animals/lobito.jpeg",
    audio: "/assets/audio/animals/lobito.ogg",
    desc: "Mʉrrunza, el lobito. Ka'se' wʉreri nʉya jinari ayeigwi webu gagʉyani, awiri azúna name chwamʉ kawani — estos caminan arrastrándose y ponen huevos. Son importantes para el control de otros animales y la dispersión de semillas.",
  },
  {
    id: "anolis",
    nameEs: "Anolis",
    nameArh: "Usameiro",
    type: "reptil",
    image: "/assets/images/animals/anolis.jpeg",
    audio: "/assets/audio/animals/anolis.ogg",
    desc: "Usameiro, el anolis, es un lagarto ágil que cambia de color para comunicarse. Ka'se' wʉreri nʉya jinari ayeigwi webu gagʉyani — caminan arrastrándose y ponen huevos. Son importantes para el control de insectos y la dispersión de semillas.",
  },
  {
    id: "iguana",
    nameEs: "Iguana",
    nameArh: "Iwanʉ",
    type: "reptil",
    image: "/assets/images/animals/iguana.jpeg",
    audio: "/assets/audio/animals/iguana.ogg",
    desc: "Iwanʉ, la iguana, es uno de los reptiles más grandes de nuestra Sierra. Caminan arrastrándose y ponen huevos. Son importantes para el control de otros animales y la dispersión de semillas por el bosque.",
  },
  {
    id: "cascabel",
    nameEs: "Cascabel",
    nameArh: "Aku",
    type: "reptil",
    audio: "/assets/audio/animals/cascabel.ogg",
    desc: "Aku, la cascabel, es una serpiente venenosa que usa su cola para advertir peligros. Ka'se' wʉreri nʉya jinari ayeigwi webu gagʉyani — es fundamental en el ecosistema como controladora de roedores.",
  },
  {
    id: "coral",
    nameEs: "Coral",
    nameArh: "Geyro'ta",
    type: "reptil",
    image: "/assets/images/animals/coral.jpeg",
    audio: "/assets/audio/animals/coral.ogg",
    desc: "Geyro'ta, la coral, tiene bandas de colores brillantes que advierten su veneno. Aunque venenosa, es tímida y rara vez ataca si no se le molesta. Es parte del equilibrio de la Sierra.",
  },
  {
    id: "mapana",
    nameEs: "Mapaná",
    nameArh: "Makuku",
    type: "reptil",
    audio: "/assets/audio/animals/mapana.ogg",
    desc: "Makuku, la mapaná, es una serpiente muy presente en la Sierra Nevada. Ka'se' wʉreri nʉya jinari ayeigwi — cumple un papel ecológico importante como depredadora de pequeños animales.",
  },
  {
    id: "tortuga",
    nameEs: "Tortuga",
    nameArh: "Marʉkonʉ",
    type: "reptil",
    image: "/assets/images/animals/tortuga.jpeg",
    audio: "/assets/audio/animals/tortuga.ogg",
    desc: "Marʉkonʉ, la tortuga, camina arrastrándose y pone huevos. Ka'se' wʉreri nʉya jinari ayeigwi webu gagʉyani, ana'nuga ʉjwase' zi azeyza name — son importantes para el control de otros animales y la dispersión de semillas.",
  },

  // ── AVES / Turi duruntʉya jina ────────────────────────────────────────────
  {
    id: "condor",
    nameEs: "Cóndor",
    nameArh: "Gwitiri",
    type: "ave",
    image: "/assets/images/animals/condor.jpeg",
    audio: "/assets/audio/animals/condor.ogg",
    desc: "Gwitiri, el cóndor. Ana'nuga turi jinari, a'kanʉya. Chwi ʉweri dukawa neykani — las aves son hermosas de ver y oír. Ellas nos transmiten mensajes, cuidan a nuestra Sierra Nevada y sus plumas y nidos hacen parte de los pagamentos.",
  },
  {
    id: "turpial",
    nameEs: "Toche o Turpial",
    nameArh: "Chu'mmisi",
    type: "ave",
    image: "/assets/images/animals/turpial.jpeg",
    audio: "/assets/audio/animals/turpial.ogg",
    desc: "Chu'mmisi, el toche o turpial, es un ave de hermoso canto y plumaje dorado. Las aves nos transmiten mensajes y cuidan a nuestra Sierra Nevada. Su melodía es un tesoro del bosque serrano.",
  },
  {
    id: "tucan1",
    nameEs: "Tucán pechiamarillo",
    nameArh: "Cha'go chummi",
    type: "ave",
    image: "/assets/images/animals/tucan1.jpeg",
    audio: "/assets/audio/animals/tucan_amarillo.ogg",
    desc: "Cha'go chummi, el tucán pechiamarillo, dispersa semillas al comer frutos. Sus plumas y nidos hacen parte de los pagamentos de nuestro pueblo. Su pico colorido es una de las maravillas de la biodiversidad de la Sierra.",
  },
  {
    id: "tucan_blanco",
    nameEs: "Tucán pechiblanco",
    nameArh: "Cha'go tungʉ'ngʉrʉ",
    type: "ave",
    image: "/assets/images/animals/tucan_blanco.jpeg",
    audio: "/assets/audio/animals/tucan_blanco.ogg",
    desc: "Cha'go tungʉ'ngʉrʉ, el tucán pechiblanco, habita los bosques húmedos de la Sierra. Las aves son hermosas de ver y oír. Ellas nos transmiten mensajes y cuidan a nuestra Sierra Nevada.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const LETTERS = "ABCDEFGHIJKLMNOPRSTUVWXZ";
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[ʉɉ]/g, (c) => c === "ʉ" ? "u" : "j");
}

function normalizeWord(w: string) {
  return w.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, "");
}

function buildWordSearchGrid(rawWord: string): { grid: string[][]; wordCoords: [number, number][] } {
  const word = normalizeWord(rawWord).slice(0, 8);
  const N = 9;
  const grid: string[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)])
  );
  const directions: [number, number][] = [[0, 1], [1, 0], [1, 1]];
  let placed = false;
  let coords: [number, number][] = [];
  for (let attempt = 0; attempt < 80 && !placed; attempt++) {
    const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
    const maxR = N - dr * (word.length - 1);
    const maxC = N - dc * (word.length - 1);
    if (maxR <= 0 || maxC <= 0) continue;
    const r = Math.floor(Math.random() * maxR);
    const c = Math.floor(Math.random() * maxC);
    coords = word.split("").map((_, i) => [r + dr * i, c + dc * i] as [number, number]);
    coords.forEach(([row, col], i) => { grid[row][col] = word[i]; });
    placed = true;
  }
  return { grid, wordCoords: coords };
}

function makeTrueFalseStatements(animal: Animal): { statement: string; answer: boolean }[] {
  const falsePool = ANIMALS_DB.filter((a) => a.id !== animal.id);
  const other = falsePool[Math.floor(Math.random() * falsePool.length)];
  return shuffle([
    // True: "${animal.nameEs}" ana'nuga jina Iku "${animal.nameArh}" zakachozʉndi.
    { statement: `"${animal.nameEs}" ana'nuga jina Iku "${animal.nameArh}" zakachozʉndi.`, answer: true },
    // True: "${animal.nameEs}" ${animal.type} ana'nuga jina.
    { statement: `"${animal.nameEs}" ${animal.type} ana'nuga jina.`, answer: true },
    // False: wrong Iku name
    { statement: `"${animal.nameEs}" ana'nuga jina Iku "${other.nameArh}" zakachozʉndi.`, answer: false },
    // False: wrong type
    { statement: `"${animal.nameEs}" ${other.type} ana'nuga jina.`, answer: false },
  ]);
}

export function createQuizForAnimals(animals: Animal[]): QuizQuestion[] {
  const safeAnimals = animals.length > 0 ? animals : shuffle(ANIMALS_DB).slice(0, 5);
  const animalsWithImages = safeAnimals.filter((a) => a.image);
  const picked = shuffle(safeAnimals);
  const a0 = picked[0];
  const a1 = picked[1] ?? picked[0];
  const a2 = picked[2] ?? picked[0];

  const pool: QuizQuestion[] = [];

  // 1. Multiple choice — ¿Cómo se llama en español?
  const otherNamesEs = shuffle(ANIMALS_DB.filter((a) => a.id !== a0.id)).slice(0, 3).map((a) => a.nameEs);
  pool.push({
    type: "multiple",
    prompt: `"${a0.nameArh}" azi du zakachozʉndi?`,  // ¿Cómo se llama este animal?
    subject: a0,
    options: shuffle([a0.nameEs, ...otherNamesEs]),
    answer: a0.nameEs,
    success: `¡Ey! "${a0.nameArh}" — ${a0.nameEs}.`,
  });

  // 2. Write — escribe el nombre Iku
  pool.push({
    type: "write",
    prompt: `Ana'nuga jina Iku zakachozʉndi: "${a1.nameEs}". Ɉʉnkunu "${a1.nameArh[0]}"...`,  // Escribe el nombre Iku. Empieza con...
    subject: a1,
    answer: normalizeAnswer(a1.nameArh),
    success: `¡Ey! Iku: "${a1.nameArh}" — ${a1.nameEs}.`,
  });

  // 3. Word search — busca el nombre Iku
  const wsWord = a2.nameArh;
  const { grid, wordCoords } = buildWordSearchGrid(wsWord);
  pool.push({
    type: "wordsearch",
    prompt: `Ana'nuga jina Iku nʉnkunu: "${normalizeWord(wsWord)}" (${a2.nameEs}).`,  // Busca el nombre Iku
    subject: a2,
    grid,
    answer: normalizeWord(wsWord),
    wordCoords,
    success: `¡Ey! "${a2.nameArh}" nʉnkusʉ — ${a2.nameEs}.`,
  });

  // 4. Order letters — ordena el nombre Iku
  const orderAnimal = picked[Math.floor(Math.random() * picked.length)];
  const rawLetters = normalizeWord(orderAnimal.nameArh).split("");
  pool.push({
    type: "order",
    prompt: `Ana'nuga jina Iku zukutu: "${orderAnimal.nameEs}".`,  // Ordena el nombre Iku
    subject: orderAnimal,
    answer: normalizeWord(orderAnimal.nameArh),
    shuffled: shuffle([...rawLetters]),
    success: `¡Ey! Iku jina: "${orderAnimal.nameArh}" — ${orderAnimal.nameEs}.`,
  });

  // 5. Match — conecta Iku con español
  const matchAnimals = shuffle(safeAnimals).slice(0, 3);
  pool.push({
    type: "match",
    prompt: "Ana'nuga jina Iku awiri ka'se' zakachozʉndi zakutu.",  // Conecta el nombre Iku con su nombre
    pairs: matchAnimals.map((a) => ({ iku: a.nameArh, es: a.nameEs, subjectId: a.id })),
    success: "¡Ey! Miwihuyase' kwa na'nʉndi.",  // ¡Muy bien! Los emparejaste todos.
  });

  // 6. Image pick — elige la imagen del animal Iku
  const imgPool = shuffle(ANIMALS_DB.filter((a) => a.image));
  if (animalsWithImages.length > 0 && imgPool.length >= 4) {
    const subject = animalsWithImages[Math.floor(Math.random() * animalsWithImages.length)];
    const others = imgPool.filter((a) => a.id !== subject.id).slice(0, 3);
    pool.push({
      type: "image_pick",
      prompt: `"${subject.nameArh}" azi ana'nuga jina ʉjwase' zakachozʉndi?`,  // ¿Cuál imagen muestra este animal?
      options: shuffle([subject, ...others]),
      answer: subject.id,
      success: `¡Ey! "${subject.nameArh}" — ${subject.nameEs}.`,
    });
  }

  // 7. True / False — verdadero o falso en Iku
  const tfAnimal = picked[Math.floor(Math.random() * picked.length)];
  const tf = makeTrueFalseStatements(tfAnimal)[0];
  pool.push({
    type: "truefalse",
    prompt: "Ey du zakachozʉndi? / Awi du zakachozʉndi?",  // ¿Es verdad? ¿Es correcto?
    subject: tfAnimal,
    statement: tf.statement,
    answer: tf.answer,
    success: tf.answer ? "¡Ey! Awi zakachozʉndi." : "¡Awi! Nʉkwa zakachozʉndi.",
  });

  const types = ["wordsearch", "order", "match", "image_pick", "truefalse", "multiple", "write"];
  const selected: QuizQuestion[] = [];
  for (const t of shuffle(types)) {
    const q = pool.find((p) => p.type === t);
    if (q && selected.length < 3) selected.push(q);
  }
  for (const q of pool) {
    if (selected.length >= 3) break;
    if (!selected.includes(q)) selected.push(q);
  }
  return selected.slice(0, 3);
}
