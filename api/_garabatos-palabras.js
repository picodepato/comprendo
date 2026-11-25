/* Palabras para «Garabatos» (dibuja y adivina): cosas que se pueden dibujar, por nivel.
   Cada fila: [nivel, español, inglés, catalán]. Con «|» van otras formas que también valen al adivinar
   (la primera es la que se enseña). El curso usa la columna del idioma que se aprende y, como traducción
   para quien dibuja, la del idioma que ya sabe (curso de español → inglés; inglés y catalán → español).
   La mayoría están en los diccionarios de las lecturas (content/<idioma>/definiciones.json). */
export const FILAS = [
  /* A1: casa, animales, comida, cuerpo */
  ["A1", "gato", "cat", "gat"], ["A1", "perro", "dog", "gos"], ["A1", "casa", "house", "casa"], ["A1", "sol", "sun", "sol"],
  ["A1", "luna", "moon", "lluna"], ["A1", "árbol", "tree", "arbre"], ["A1", "pez|pescado", "fish", "peix"], ["A1", "pájaro|ave", "bird", "ocell"],
  ["A1", "coche|auto", "car", "cotxe"], ["A1", "pelota|balón", "ball", "pilota"], ["A1", "libro", "book", "llibre"], ["A1", "manzana", "apple", "poma"],
  ["A1", "plátano|banana", "banana", "plàtan"], ["A1", "huevo", "egg", "ou"], ["A1", "pan", "bread", "pa"], ["A1", "queso", "cheese", "formatge"],
  ["A1", "pizza", "pizza", "pizza"], ["A1", "estrella", "star", "estrella"], ["A1", "flor", "flower", "flor"], ["A1", "silla", "chair", "cadira"],
  ["A1", "mesa", "table", "taula"], ["A1", "cama", "bed", "llit"], ["A1", "puerta", "door", "porta"], ["A1", "ventana", "window", "finestra"],
  ["A1", "sombrero", "hat", "barret"], ["A1", "zapato", "shoe", "sabata"], ["A1", "mano", "hand", "mà"], ["A1", "ojo", "eye", "ull"],
  ["A1", "nariz", "nose", "nas"], ["A1", "boca", "mouth", "boca"], ["A1", "oreja", "ear", "orella"], ["A1", "bicicleta|bici", "bike|bicycle", "bicicleta|bici"],
  ["A1", "barco", "boat|ship", "vaixell"], ["A1", "avión", "plane|airplane|aeroplane", "avió"], ["A1", "autobús|bus", "bus", "autobús|bus"],
  ["A1", "teléfono|móvil", "phone|telephone|mobile", "telèfon|mòbil"], ["A1", "reloj", "clock|watch", "rellotge"], ["A1", "pastel|tarta", "cake", "pastís"],
  ["A1", "vaca", "cow", "vaca"], ["A1", "caballo", "horse", "cavall"], ["A1", "gallina", "chicken|hen", "gallina"], ["A1", "rana", "frog", "granota"],
  ["A1", "serpiente", "snake", "serp"], ["A1", "león", "lion", "lleó"], ["A1", "elefante", "elephant", "elefant"], ["A1", "araña", "spider", "aranya"],
  ["A1", "hormiga", "ant", "formiga"], ["A1", "helado", "ice cream|icecream", "gelat"], ["A1", "corazón", "heart", "cor"], ["A1", "llave", "key", "clau"],
  ["A1", "camiseta", "t-shirt|tshirt|shirt", "samarreta"], ["A1", "lluvia", "rain", "pluja"], ["A1", "nieve", "snow", "neu"], ["A1", "oso", "bear", "os"],
  /* A2: lugares, aventuras, objetos */
  ["A2", "castillo", "castle", "castell"], ["A2", "pirámide", "pyramid", "piràmide"], ["A2", "volcán", "volcano", "volcà"], ["A2", "cohete", "rocket", "coet"],
  ["A2", "robot", "robot", "robot"], ["A2", "dinosaurio", "dinosaur", "dinosaure"], ["A2", "esqueleto", "skeleton", "esquelet"], ["A2", "hueso", "bone", "os"],
  ["A2", "cocodrilo", "crocodile", "cocodril"], ["A2", "tiburón", "shark", "tauró"], ["A2", "ballena", "whale", "balena"], ["A2", "pulpo", "octopus", "pop"],
  ["A2", "medusa", "jellyfish", "medusa"], ["A2", "abeja", "bee", "abella"], ["A2", "mosquito", "mosquito", "mosquit"], ["A2", "montaña", "mountain", "muntanya"],
  ["A2", "isla", "island", "illa"], ["A2", "playa", "beach", "platja"], ["A2", "río", "river", "riu"], ["A2", "bosque", "forest", "bosc"],
  ["A2", "puente", "bridge", "pont"], ["A2", "cámara", "camera", "càmera"], ["A2", "ordenador|computadora", "computer", "ordinador"],
  ["A2", "televisión|tele", "television|tv", "televisió|tele"], ["A2", "casco", "helmet", "casc"], ["A2", "espada", "sword", "espasa"],
  ["A2", "corona", "crown", "corona"], ["A2", "tesoro", "treasure", "tresor"], ["A2", "mapa", "map", "mapa"], ["A2", "brújula", "compass", "brúixola"],
  ["A2", "vela", "candle", "espelma"], ["A2", "bombilla", "light bulb|lightbulb|bulb", "bombeta"], ["A2", "máscara", "mask", "màscara"],
  ["A2", "monopatín|skate", "skateboard|skate", "monopatí|skate"], ["A2", "medalla", "medal", "medalla"], ["A2", "nevera|frigorífico", "fridge|refrigerator", "nevera"],
  ["A2", "horno", "oven", "forn"], ["A2", "cuchara", "spoon", "cullera"], ["A2", "hamburguesa", "hamburger|burger", "hamburguesa"],
  ["A2", "palomitas", "popcorn", "crispetes"], ["A2", "limón", "lemon", "llimona"], ["A2", "cebolla", "onion", "ceba"], ["A2", "dragón", "dragon", "drac"],
  ["A2", "monstruo", "monster", "monstre"], ["A2", "fantasma", "ghost", "fantasma"], ["A2", "tormenta", "storm", "tempesta"], ["A2", "nube", "cloud", "núvol"],
  ["A2", "botella", "bottle", "ampolla"], ["A2", "linterna", "torch|flashlight", "llanterna"], ["A2", "tumba", "tomb|grave", "tomba"], ["A2", "rueda", "wheel", "roda"],
  ["A2", "escalera", "ladder|stairs", "escala"], ["A2", "gusano", "worm", "cuc"],
  /* B1: ciencia, espacio, historia, más difíciles de dibujar */
  ["B1", "astronauta", "astronaut", "astronauta"], ["B1", "telescopio", "telescope", "telescopi"], ["B1", "microscopio", "microscope", "microscopi"],
  ["B1", "satélite", "satellite", "satèl·lit|satel·lit"], ["B1", "planeta", "planet", "planeta"], ["B1", "cometa", "comet", "cometa"],
  ["B1", "galaxia", "galaxy", "galàxia"], ["B1", "terremoto", "earthquake", "terratrèmol"], ["B1", "explosión", "explosion", "explosió"],
  ["B1", "bombero", "firefighter|fireman", "bomber"], ["B1", "faro", "lighthouse", "far"], ["B1", "momia", "mummy", "mòmia"],
  ["B1", "faraón", "pharaoh", "faraó"], ["B1", "esfinge", "sphinx", "esfinx"], ["B1", "huella", "footprint", "petjada"], ["B1", "fósil", "fossil", "fòssil"],
  ["B1", "lupa", "magnifying glass", "lupa"], ["B1", "termómetro", "thermometer", "termòmetre"], ["B1", "cronómetro", "stopwatch", "cronòmetre"],
  ["B1", "lavadora", "washing machine", "rentadora"], ["B1", "aspiradora|aspirador", "vacuum cleaner|hoover", "aspiradora|aspirador"],
  ["B1", "submarino", "submarine", "submarí"], ["B1", "paracaídas", "parachute", "paracaigudes"], ["B1", "tornado", "tornado", "tornado"],
  ["B1", "cascada", "waterfall", "cascada"], ["B1", "cueva", "cave", "cova"], ["B1", "desierto", "desert", "desert"], ["B1", "pingüino", "penguin", "pingüí"],
  ["B1", "guepardo", "cheetah", "guepard"], ["B1", "halcón", "falcon", "falcó"], ["B1", "hipopótamo", "hippo|hippopotamus", "hipopòtam"],
  ["B1", "tortuga", "tortoise|turtle", "tortuga"], ["B1", "caracol", "snail", "cargol"], ["B1", "pluma", "feather", "ploma"],
  ["B1", "nave espacial", "spaceship", "nau espacial"], ["B1", "calavera", "skull", "calavera"], ["B1", "pico", "pickaxe", "pic"], ["B1", "hacha", "axe", "destral"],
  ["B1", "pincel", "brush|paintbrush", "pinzell"], ["B1", "espantapájaros", "scarecrow", "espantaocells"], ["B1", "arcoíris|arcoiris", "rainbow", "arc de sant martí|arc iris"],
  ["B1", "sarcófago", "sarcophagus|coffin", "sarcòfag"], ["B1", "cráter", "crater", "cràter"], ["B1", "imán", "magnet", "imant"], ["B1", "radar", "radar", "radar"],
  ["B1", "rascacielos", "skyscraper", "gratacel"], ["B1", "estatua", "statue", "estàtua"], ["B1", "pergamino", "scroll", "pergamí"]
];
const COL = {es: 1, en: 2, ca: 3}, SABE = {es: "en", en: "es", ca: "es"};
const NIVELES = ["A1", "A2", "B1"];
/* nivel del curso → palabras de ese nivel y del anterior (B2 usa las de B1) */
export function palabras(lang, nivel) {
  const c = COL[lang] || 1, t = COL[SABE[lang] || "es"];
  let i = NIVELES.indexOf(nivel); if (i < 0) i = nivel === "todas" ? -1 : NIVELES.length - 1;
  const ok = new Set(i < 0 ? NIVELES : NIVELES.slice(Math.max(0, i - 1), i + 1));
  return FILAS.filter(f => ok.has(f[0])).map(f => { const v = f[c].split("|"); return { w: v[0], alt: v.slice(1), tr: f[t].split("|")[0], lv: f[0] }; });
}
