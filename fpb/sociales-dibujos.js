/* COMPRENDO · FP Básica · Ciencias Sociales: dibujos e imágenes (mapa de África en 1914, las dos viñetas del caciquismo,
   línea del tiempo y cuadros y edificios del siglo XIX).
   Todo es HTML ya preparado para el campo «img» de los apartados y de las actividades (fpb/fpb.js lo pinta).
   Los cuadros vienen de Wikimedia Commons (dominio público). Solo se usan obras apropiadas para el aula:
   donde el libro trae una obra con desnudos, aquí sale otra del mismo autor. Si una imagen no carga, se ve su ficha en texto. */
(() => {
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));

/* ---------- Mapa de África en 1914 (un mapa de casillas: cada territorio es un grupo de cuadraditos en su sitio) ---------- */
const POT = {
  gb: {n: "Gran Bretaña", adj: "Inglesas", c: "#f29a3a"},
  fr: {n: "Francia", adj: "Francesas", c: "#4f7fc2"},
  be: {n: "Bélgica", adj: "Belgas", c: "#9b7fc8"},
  de: {n: "Alemania", adj: "Alemanas", c: "#7a3b3b"},
  it: {n: "Italia", adj: "Italianas", c: "#e05561"},
  es: {n: "España", adj: "Españolas", c: "#9cc45a"},
  pt: {n: "Portugal", adj: "Portuguesas", c: "#3f6b3a"},
  in: {n: "Independiente", adj: "Independientes", c: "#2bb3a3"}};
/* letra → [nombre, potencia] */
const TER = {
  a: ["Norte de Marruecos", "es"], b: ["Marruecos", "fr"], c: ["Argelia", "fr"], d: ["Túnez", "fr"], e: ["Libia", "it"],
  f: ["Egipto", "gb"], g: ["Río de Oro", "es"], h: ["África Occidental Francesa", "fr"], i: ["África Ecuatorial Francesa", "fr"],
  j: ["Sudán Anglo-Egipcio", "gb"], k: ["Eritrea", "it"], l: ["Somalia Francesa", "fr"], m: ["Etiopía", "in"],
  n: ["Somalia Británica", "gb"], o: ["Somalia Italiana", "it"], p: ["Gambia", "gb"], q: ["Guinea Portuguesa", "pt"],
  r: ["Sierra Leona", "gb"], s: ["Liberia", "in"], t: ["Costa de Oro", "gb"], u: ["Togo", "de"], v: ["Nigeria", "gb"],
  w: ["Camerún", "de"], x: ["Río Muni (Guinea Española)", "es"], y: ["Congo Francés", "fr"], z: ["Uganda", "gb"], A: ["Kenia", "gb"],
  B: ["Cabinda", "pt"], C: ["Congo Belga", "be"], D: ["África Oriental Alemana", "de"], E: ["Angola", "pt"], F: ["Rhodesia", "gb"],
  G: ["Nyasalandia", "gb"], H: ["Mozambique", "pt"], I: ["Madagascar", "fr"], J: ["África del Sudoeste Alemana", "de"],
  K: ["Bechuanalandia", "gb"], L: ["Unión Sudafricana", "gb"]};
const GRID = [
  "abccdeeff..",
  "ghccceeff..",
  "ghhhcieejjk",
  "phhhiiijjjl",
  "qhhhiiijjmn",
  "rhhhvwijjmo",
  "shtuvwiizmo",
  "....xyCzAA.",
  "....BCCDDA.",
  "....ECCGD..",
  "....EEFGH.I",
  "....JFFHH.I",
  "....JKKH...",
  "....LLL...."];
/* dónde va el nombre de cada territorio (los pequeños llevan solo el número de la lista) */
const CORTO = {a: "N. Marruecos", h: "Á. Occ. Francesa", i: "Á. Ecuat. Francesa", j: "Sudán", x: "Río Muni", y: "Congo Fr.", C: "Congo Belga",
  D: "Á. Or. Alemana", J: "Á. SO Alemana", L: "Unión Sudafricana", f: "Egipto", g: "Río de Oro", K: "Bechuanalandia", E: "Angola",
  F: "Rhodesia", H: "Mozambique", I: "Madagascar", c: "Argelia", e: "Libia", m: "Etiopía", v: "Nigeria", s: "Liberia"};

function mapaAfrica(op = {}) {
  const S = 30, W = GRID[0].length * S, H = GRID.length * S;
  const celdas = {};
  GRID.forEach((fila, y) => [...fila].forEach((ch, x) => { if (ch !== ".") (celdas[ch] ||= []).push([x, y]); }));
  const ver = op.solo ? new Set(op.solo) : null;  /* potencias que se pintan (las demás, en gris) */
  let rect = "", lab = "", n = 0, lista = [];
  Object.entries(celdas).forEach(([ch, cs]) => {
    const [nom, p] = TER[ch], on = !ver || ver.has(p), col = on ? POT[p].c : "#d9dde3";
    cs.forEach(([x, y]) => { rect += `<rect x="${x * S}" y="${y * S}" width="${S}" height="${S}" fill="${col}"/>`; });
    /* bordes entre territorios distintos */
    cs.forEach(([x, y]) => {
      const otro = (xx, yy) => (GRID[yy]?.[xx] ?? ".") !== ch;
      if (otro(x, y - 1)) rect += `<line x1="${x * S}" y1="${y * S}" x2="${x * S + S}" y2="${y * S}"/>`;
      if (otro(x, y + 1)) rect += `<line x1="${x * S}" y1="${y * S + S}" x2="${x * S + S}" y2="${y * S + S}"/>`;
      if (otro(x - 1, y)) rect += `<line x1="${x * S}" y1="${y * S}" x2="${x * S}" y2="${y * S + S}"/>`;
      if (otro(x + 1, y)) rect += `<line x1="${x * S + S}" y1="${y * S}" x2="${x * S + S}" y2="${y * S + S}"/>`;
    });
    const cx = cs.reduce((s, c) => s + c[0], 0) / cs.length * S + S / 2, cy = cs.reduce((s, c) => s + c[1], 0) / cs.length * S + S / 2;
    n++; lista.push([n, nom, p]);
    const corto = CORTO[ch];
    const txt = corto && cs.length >= 2 ? `${n}. ${corto}` : String(n);
    const fs = corto && cs.length >= 2 ? 8.5 : 10;
    lab += `<text x="${cx}" y="${cy + 3}" font-size="${fs}" text-anchor="middle">${esc(txt)}</text>`;
  });
  const ley = Object.entries(POT).filter(([k]) => !ver || ver.has(k))
    .map(([k, P]) => `<span class="sc-ley"><i style="background:${P.c}"></i>${esc(P.adj)}</span>`).join("");
  const nombres = lista.map(([i, nom, p]) => `<li><b>${i}.</b> ${esc(nom)} <small>· ${esc(POT[p].n)}</small></li>`).join("");
  return `<figure class="sc-fig sc-mapa"><svg viewBox="-6 -6 ${W + 12} ${H + 12}" role="img" aria-label="Mapa de África en 1914 con las colonias de cada país europeo">
    <rect x="-6" y="-6" width="${W + 12}" height="${H + 12}" rx="10" fill="#dceefa"/>
    <g stroke="#ffffff" stroke-width="1.6">${rect}</g>
    <g fill="#1d2433" font-family="system-ui,sans-serif" font-weight="700" style="paint-order:stroke" stroke="#ffffffcc" stroke-width="2.4">${lab}</g>
    <text x="${W - 4}" y="16" text-anchor="end" font-size="13" font-weight="800" fill="#1d4f7a" font-family="system-ui,sans-serif">África en 1914</text>
    <text x="8" y="${H - 34}" font-size="11" fill="#3b6c94" font-family="system-ui,sans-serif">Océano</text>
    <text x="8" y="${H - 20}" font-size="11" fill="#3b6c94" font-family="system-ui,sans-serif">Atlántico</text>
  </svg>
  <figcaption><div class="sc-leyenda">${ley}</div>
  ${op.lista === false ? "" : `<details class="sc-lista"><summary>Ver los nombres de los números</summary><ol>${nombres}</ol></details>`}
  <small>Mapa simplificado: cada cuadradito es un trozo de territorio.</small></figcaption></figure>`;
}
const colonias = p => Object.values(TER).filter(t => t[1] === p).map(t => t[0]);

/* ---------- Las viñetas del caciquismo (dibujadas de nuevo, sencillas) ---------- */
const sombrero = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-14" y="-34" width="28" height="30" rx="3" fill="#222"/><rect x="-22" y="-6" width="44" height="6" rx="3" fill="#222"/></g>`;
function vineta1() {
  return `<figure class="sc-fig sc-vin"><svg viewBox="0 0 320 260" role="img" aria-label="Viñeta 1: un cacique con sombrero de copa habla con un esqueleto que asoma de una tumba">
    <rect width="320" height="260" rx="12" fill="#f4f1d0"/>
    <rect x="22" y="40" width="130" height="170" rx="10" fill="#c9c3a6" stroke="#5b5440" stroke-width="3"/>
    <text x="87" y="64" font-size="12" text-anchor="middle" font-weight="800" fill="#3a3528" font-family="Georgia,serif">AQUÍ DESCANSA</text>
    <rect x="34" y="78" width="66" height="96" rx="6" fill="#2f2b22"/>
    <circle cx="67" cy="104" r="17" fill="#f3efe2" stroke="#222" stroke-width="2"/>
    <circle cx="61" cy="101" r="4.5" fill="#222"/><circle cx="73" cy="101" r="4.5" fill="#222"/>
    <path d="M60 113 h14" stroke="#222" stroke-width="2"/><path d="M62 113 v4 M66 113 v4 M70 113 v4" stroke="#222" stroke-width="1.5"/>
    <path d="M67 122 v34 M54 132 h26 M56 140 h22 M58 148 h18" stroke="#f3efe2" stroke-width="3"/>
    <rect x="96" y="150" width="56" height="18" rx="3" fill="#fff" stroke="#5b5440" transform="rotate(-12 124 159)"/>
    <text x="124" y="163" font-size="11" text-anchor="middle" font-weight="800" fill="#2f2b22" transform="rotate(-12 124 159)" font-family="system-ui,sans-serif">VOTO</text>
    <g><circle cx="226" cy="98" r="16" fill="#f0c9a0" stroke="#222" stroke-width="2"/>${sombrero(226, 86)}
      <path d="M204 118 q22 -8 44 0 l12 110 h-68 z" fill="#2b2b2b"/>
      <path d="M210 130 q-30 -6 -52 -18" stroke="#2b2b2b" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M250 132 l20 40" stroke="#5a3a1a" stroke-width="5" stroke-linecap="round"/></g>
    <g font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="#1d2433">
      <rect x="166" y="14" width="146" height="26" rx="12" fill="#fff" stroke="#222"/><text x="239" y="32" text-anchor="middle">Esqueleto: «¿Salgo?»</text>
      <rect x="8" y="216" width="304" height="36" rx="10" fill="#fff" stroke="#222"/>
      <text x="160" y="239" text-anchor="middle" font-size="12">Cacique: «¡No, hombre! Aún no, hasta el día 10.»</text></g>
  </svg><figcaption>Viñeta 1 (redibujada). El día 10 es el día de las elecciones.</figcaption></figure>`;
}
function vineta2() {
  return `<figure class="sc-fig sc-vin"><svg viewBox="0 0 320 260" role="img" aria-label="Viñeta 2: un hombre gordo con sombrero de copa empuja por detrás a un obrero que mete el voto en la urna">
    <rect width="320" height="260" rx="12" fill="#f4f1d0"/>
    <rect x="30" y="150" width="90" height="10" fill="#6b5a3a"/><rect x="40" y="160" width="10" height="80" fill="#6b5a3a"/><rect x="100" y="160" width="10" height="80" fill="#6b5a3a"/>
    <path d="M45 150 q30 -60 60 0 z" fill="#cfe6f3" stroke="#222" stroke-width="2.5"/><text x="75" y="138" font-size="11" text-anchor="middle" font-weight="800" font-family="system-ui,sans-serif">URNA</text>
    <rect x="96" y="96" width="24" height="16" fill="#fff" stroke="#222" transform="rotate(-10 108 104)"/>
    <g><circle cx="160" cy="92" r="16" fill="#f0c9a0" stroke="#222" stroke-width="2"/><path d="M144 84 q16 -14 32 0 v-6 h-32 z" fill="#555"/>
      <path d="M146 110 h28 l6 80 h-40 z" fill="#e7e2d0" stroke="#222" stroke-width="2"/>
      <path d="M148 120 q-20 -6 -36 -14" stroke="#e7e2d0" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path d="M150 190 v46 M170 190 v46" stroke="#555" stroke-width="10"/><text x="160" y="150" font-size="10" text-anchor="middle" fill="#555" font-family="system-ui,sans-serif">obrero</text></g>
    <g><circle cx="222" cy="80" r="20" fill="#f0c9a0" stroke="#222" stroke-width="2"/>${sombrero(222, 66, 1.1)}
      <path d="M220 74 q4 6 0 10" stroke="#222" fill="none"/><path d="M212 90 q10 6 20 0" stroke="#222" stroke-width="2" fill="none"/>
      <ellipse cx="226" cy="160" rx="42" ry="58" fill="#1f1f1f"/>
      <path d="M196 130 q-14 -4 -26 0" stroke="#1f1f1f" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M210 214 v24 M240 214 v24" stroke="#1f1f1f" stroke-width="12"/><text x="226" y="164" font-size="10" text-anchor="middle" fill="#ddd" font-family="system-ui,sans-serif">cacique</text></g>
    <rect x="8" y="216" width="304" height="36" rx="10" fill="#fff" stroke="#222"/>
    <text x="160" y="239" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#1d2433">El cacique vigila: el obrero vota lo que le mandan.</text>
  </svg><figcaption>Viñeta 2 (redibujada).</figcaption></figure>`;
}

/* ---------- Línea del tiempo del siglo XIX (tema 3) ---------- */
const HITOS = [
  [1864, "Se crea la AIT (I Internacional)"], [1867, "Marx publica «El Capital»"], [1868, "Revolución de 1868: empieza el Sexenio Democrático"],
  [1871, "Empieza el reinado de Amadeo I"], [1873, "Se proclama la I República"], [1874, "Golpe de Estado de Martínez Campos"],
  [1876, "Constitución de la Restauración"], [1879, "Pablo Iglesias funda el PSOE"], [1885, "Conferencia de Berlín"],
  [1890, "Se acaba el sufragio censitario (votan todos los hombres)"], [1898, "Guerra de Cuba: España pierde sus últimas colonias"]];
function lineaTiempo(op = {}) {
  const items = op.hitos || HITOS, W = 640, H = 70 + items.length * 0;
  const x0 = 30, x1 = W - 30, a = 1860, b = 1900, X = y => x0 + (y - a) / (b - a) * (x1 - x0);
  let marcas = "";
  for (let y = a; y <= b; y += 10) marcas += `<line x1="${X(y)}" y1="34" x2="${X(y)}" y2="46" stroke="#1d2433" stroke-width="2"/><text x="${X(y)}" y="62" font-size="13" text-anchor="middle" font-weight="700">${y}</text>`;
  const pts = items.map(([y]) => `<circle cx="${X(y)}" cy="40" r="5" fill="#e05561"/>`).join("");
  return `<figure class="sc-fig sc-linea"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Línea del tiempo de 1860 a 1900">
    <g font-family="system-ui,sans-serif" fill="#1d2433"><line x1="${x0}" y1="40" x2="${x1}" y2="40" stroke="#1d2433" stroke-width="3"/>${marcas}${op.puntos === false ? "" : pts}</g></svg></figure>`;
}

/* ---------- Cuadros y edificios (Wikimedia Commons, dominio público) ----------
   f = nombre del archivo en Commons; q = búsqueda de reserva si ese archivo no carga (se coge el primer resultado
   que no sea un desnudo). Si tampoco hay suerte, sale una ficha con el título. */
const OBRAS = {
  gericault: {f: "Jean Louis Théodore Géricault - Officer of the Hussars - WGA08637.jpg", q: "Géricault charging chasseur", t: "Oficial de cazadores a caballo cargando", a: "Géricault", y: 1812, alt: "Un jinete con su caballo encabritado en plena batalla, entre humo y colores fuertes"},
  angelus: {f: "Jean-François Millet (II) 001.jpg", q: "Millet Angelus Orsay", t: "El Ángelus", a: "Millet", y: 1859, alt: "Dos campesinos rezan de pie en el campo al atardecer"},
  picapedreros: {f: "Gustave Courbet - The Stonebreakers - WGA05457.jpg", q: "Courbet Stonebreakers", t: "Los picapedreros", a: "Courbet", y: 1849, alt: "Dos hombres con ropa vieja rompen piedras junto a un camino"},
  entierro: {f: "Gustave Courbet - A Burial at Ornans - Google Art Project 2.jpg", q: "Courbet Burial at Ornans", t: "El entierro de Ornans", a: "Courbet", y: 1849, alt: "Mucha gente del pueblo, vestida de negro, en un entierro"},
  impresion: {f: "Monet - Impression, Sunrise.jpg", q: "Monet Impression soleil levant", t: "Impresión, sol naciente", a: "Monet", y: 1872, alt: "Un puerto al amanecer, con un sol rojo y barquitas pintadas con manchas"},
  girasoles: {f: "Vincent Willem van Gogh 127.jpg", q: "Van Gogh Sunflowers National Gallery", t: "Los girasoles", a: "Van Gogh", y: 1888, alt: "Un jarrón con girasoles amarillos"},
  habitacion: {f: "Vincent van Gogh - De slaapkamer - Google Art Project.jpg", q: "Van Gogh Bedroom in Arles", t: "La habitación en Arlés", a: "Van Gogh", y: 1888, alt: "Un dormitorio con una cama, dos sillas y colores fuertes"},
  jugadores: {f: "Les Joueurs de cartes, par Paul Cézanne.jpg", q: "Cézanne card players Orsay", t: "Los jugadores de cartas", a: "Cézanne", y: 1893, alt: "Dos hombres juegan a las cartas en una mesa"},
  garnier: {f: "Palais Garnier, Paris 2017.jpg", q: "Palais Garnier facade", t: "Ópera de París", a: "Charles Garnier", y: 1875, alt: "Un edificio lleno de columnas, estatuas doradas y una cúpula verde"},
  carson: {f: "Carson Pirie Scott Building, Chicago.jpg", q: "Carson Pirie Scott building Sullivan", t: "Almacenes Carson, Pirie y Scott", a: "Louis Sullivan", y: 1899, alt: "Un edificio alto con muchas ventanas iguales y pocos adornos"},
  eiffel: {f: "Tour Eiffel Wikimedia Commons.jpg", q: "Tour Eiffel", t: "Torre Eiffel", a: "Gustave Eiffel", y: 1889, alt: "Una torre muy alta de hierro"},
  tresmayo: {f: "El Tres de Mayo, by Francisco de Goya, from Prado thin black margin.jpg", q: "Goya Tres de Mayo Prado", t: "Los fusilamientos del 3 de mayo", a: "Goya", y: 1814, alt: "De noche, unos soldados disparan a un grupo de personas asustadas; uno levanta los brazos"},
  familia: {f: "La familia de Carlos IV, por Francisco de Goya.jpg", q: "Goya familia de Carlos IV", t: "La familia de Carlos IV", a: "Goya", y: 1800, alt: "La familia del rey, de pie y con ropa de lujo"},
  quitasol: {f: "El quitasol.jpg", q: "Goya El quitasol", t: "El quitasol", a: "Goya", y: 1777, alt: "Una joven sentada al sol y un chico que le da sombra con una sombrilla verde"},
  romeria: {f: "La Romería de San Isidro.jpg", q: "Goya romería de San Isidro pinturas negras", t: "La romería de San Isidro (Pinturas Negras)", a: "Goya", y: 1823, alt: "Un grupo de gente con caras extrañas cantando de noche, en colores oscuros"},
  sorolla: {f: "Joaquín Sorolla y Bastida - Paseo a orillas del mar.jpg", q: "Sorolla Paseo a orillas del mar", t: "Paseo a orillas del mar", a: "Sorolla", y: 1909, alt: "Dos mujeres vestidas de blanco pasean por la playa con mucha luz"},
  pedrera: {f: "Casa Milà, general view.jpg", q: "Casa Milà Gaudí facade", t: "La Pedrera (Casa Milà)", a: "Gaudí", y: 1910, alt: "Un edificio con la fachada en curvas, como olas, y balcones de hierro"},
  estacion: {f: "Estació del Nord, València.jpg", q: "Estación del Norte Valencia", t: "Estación del Norte (Valencia)", a: "Demetrio Ribes", y: 1917, alt: "La fachada de una estación con adornos de naranjas"}};
const MALO = /nud|naked|nackt|desnud|\bnu\b|nue\b|bath|bañ|baign|playa de niños/i;
function obra(k, op = {}) {
  const O = OBRAS[k];
  if (!O) return "";
  const src = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(O.f)}?width=${op.w || 640}`;
  const pie = `<b>${esc(O.t)}</b>${O.a ? ` · ${esc(O.a)}` : ""}${O.y ? ` (${O.y})` : ""}`;
  return `<figure class="sc-fig sc-obra"><img src="${esc(src)}" alt="${esc(O.alt || O.t)}" loading="lazy" referrerpolicy="no-referrer" data-sc="${k}"
    onerror="window.LYASocialesDibujos&&LYASocialesDibujos.reserva(this)"><figcaption>${pie}</figcaption></figure>`;
}
/* si el archivo no carga: buscar en Commons; si tampoco, una ficha con el título */
const BUSCADAS = {};
function reserva(im) {
  const k = im.dataset.sc, O = OBRAS[k], ficha = () => { const d = document.createElement("div"); d.className = "sc-noimg"; d.textContent = "🖼️ " + (O ? O.alt : ""); im.replaceWith(d); };
  if (!O || im.dataset.reserva) return ficha();
  im.dataset.reserva = "1";
  const usar = u => { if (u) im.src = u; else ficha(); };
  if (k in BUSCADAS) return BUSCADAS[k].then(usar);
  const u = "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|mime&iiurlwidth=640&gsrsearch=" + encodeURIComponent(O.q);
  BUSCADAS[k] = fetch(u).then(r => r.json()).then(j => {
    const ps = Object.values(j.query?.pages || {}).sort((a, b) => a.index - b.index);
    const p = ps.find(p => /jpe?g|png/.test(p.imageinfo?.[0]?.mime || "") && !MALO.test(p.title));
    return p ? p.imageinfo[0].thumburl : null;
  }).catch(() => null);
  BUSCADAS[k].then(usar);
}
const dos = (a, b, op = {}) => `<div class="sc-dos">${obra(a, op)}${obra(b, op)}</div>`;

window.LYASocialesDibujos = {POT, TER, mapaAfrica, colonias, vineta1, vineta2, lineaTiempo, HITOS, OBRAS, obra, dos, reserva};
})();
