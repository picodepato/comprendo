// Comprueba los temas de los profes (temas-profe/indice.json y cada temas-profe/<id>.js) antes de publicarlos.
// Uso: node temas-profe/comprobar.mjs [carpeta temas-profe]   → sale con código 1 si hay errores (los avisos no paran).
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.dirname(url.fileURLToPath(import.meta.url));  // la carpeta temas-profe a revisar
const errores = [], avisos = [];
const mal = (id, t) => errores.push(`${id}: ${t}`), ojo = (id, t) => avisos.push(`${id}: ${t}`);

function revisar(L, a) {
  L.forEach((q, j) => {
      const w = `${a} actividad ${j + 1}`;
      if (![1, 2, 3].includes(q.d)) mal(w, "d debe ser 1, 2 o 3");
      if (!q.e) mal(w, "falta el enunciado (e)");
      if (!Array.isArray(q.pi) || q.pi.length < 2) mal(w, "pon al menos 2 pistas (pi)");
      if (!q.r || !q.r.length || !q.r[0]) mal(w, "falta «así se hace» (r)");
      if (!q.tipo) {
        if (!Array.isArray(q.o) || q.o.length < 2) mal(w, "elegir: al menos 2 opciones");
        else { if (new Set(q.o).size !== q.o.length) mal(w, "opciones repetidas"); if (q.o.length < q.d + 1) ojo(w, `nivel ${q.d} con ${q.o.length} opciones (lo normal: ${q.d + 1})`); if ((q.p || []).filter(Boolean).length < q.o.length - 1) ojo(w, "falta el porqué de alguna opción mala (p)"); }
      } else if (q.tipo === "rel") { if (!Array.isArray(q.pares) || q.pares.length < 3) mal(w, "relacionar: al menos 3 parejas"); }
      else if (q.tipo === "cla") { if (!Array.isArray(q.cajas) || q.cajas.length < 2 || !Array.isArray(q.items) || q.items.length < 3) mal(w, "clasificar: al menos 2 cajas y 3 elementos"); else q.items.forEach(it => { if (!(it[1] >= 0 && it[1] < q.cajas.length)) mal(w, `«${it[0]}» va a una caja que no existe`); }); }
      else mal(w, "tipo desconocido (usa E, REL o CLA)");
    });
}
/* SEGURIDAD: los temas son solo datos. Nada de código, HTML peligroso ni enlaces fuera de Wikimedia Commons. */
const CAMPOS = ["id", "profe", "curso", "asignatura", "peticion", "tema", "banco", "adaptado"];
const CAMPOS_IND = ["id", "profe", "curso", "asignatura", "tema", "titulo", "peticion", "creado"];
const ETQ_OK = /^<\/?(b|i|u|em|strong|br|sub|sup|small)\s*\/?>$/i;
function revisarDatos(v, donde, ruta = "") {
  if (typeof v === "string") {
    for (const m of v.matchAll(/<[^>]*>?/g)) if (!ETQ_OK.test(m[0])) mal(donde, `${ruta}: etiqueta HTML no permitida ${m[0].slice(0, 40)} (solo <b> <i> <u> <em> <strong> <br> <sub> <sup> <small>)`);
    if (/javascript:|data:|https?:\/\//i.test(v)) mal(donde, `${ruta}: no se permiten enlaces en el texto`);
    return;
  }
  if (Array.isArray(v)) return v.forEach((x, i) => revisarDatos(x, donde, `${ruta}[${i}]`));
  if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) {
    if (k === "img" || /^on/i.test(k) || ["prep", "gen", "__proto__", "constructor", "prototype"].includes(k)) mal(donde, `${ruta}.${k}: campo no permitido (las imágenes van como «imagen»: "Archivo de Wikimedia Commons.jpg")`);
    else if (k === "imagen") { const n = typeof x === "string" ? x : x && x.archivo; if (!/^[^\/\\:?#<>"]{1,150}\.(jpe?g|png|gif|webp|svg)$/i.test(String(n || ""))) mal(donde, `${ruta}.imagen: debe ser el nombre de un archivo de Wikimedia Commons`); }
    else revisarDatos(x, donde, `${ruta}.${k}`);
  }
}
const DIFS = ["facil", "nee", "tdah", "dislexia", "tea", "idioma", "dibujos", "muchos", "normal"];
const ind = JSON.parse(fs.readFileSync(path.join(DIR, "indice.json"), "utf8"));
if (!Array.isArray(ind)) { console.error("indice.json debe ser una lista"); process.exit(1); }
const vistos = new Set();
for (const t of ind) {
  const id = t.id || "?";
  if (!/^[u-z]\d{1,2}$/.test(id)) { mal(id, "el id debe ser una letra de la u a la z y 1 o 2 cifras (x1, x2… y1…)"); continue; }
  if (vistos.has(id)) mal(id, "id repetido en indice.json"); vistos.add(id);
  for (const k of ["profe", "curso", "asignatura", "titulo", "peticion"]) if (!t[k]) mal(id, `falta «${k}» en indice.json`);
  for (const k of Object.keys(t)) if (!CAMPOS_IND.includes(k)) mal(id, `campo no permitido en indice.json: «${k}»`);
  const f = path.join(DIR, id + ".json");
  if (!fs.existsSync(f)) { mal(id, `no existe temas-profe/${id}.json`); continue; }
  let X; try { X = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { mal(id, "el archivo no es JSON válido: " + e.message); continue; }
  revisarDatos(X, id);
  for (const k of Object.keys(X)) if (!CAMPOS.includes(k)) mal(id, `campo no permitido: «${k}»`);
  const T = X.tema || {}, B = X.banco || {};
  if (X.id !== id || T.id !== id) mal(id, "el id del archivo (registrar.id y tema.id) no coincide con indice.json");
  if (X.profe !== t.profe || X.peticion !== t.peticion) mal(id, "profe o peticion no coinciden con indice.json");
  for (const k of ["titulo", "ic", "color", "intro"]) if (!T[k]) mal(id, `falta tema.${k}`);
  if (!Array.isArray(T.aps) || !T.aps.length) { mal(id, "el tema no tiene apartados (tema.aps)"); continue; }
  T.aps.forEach((A, i) => {
    const a = `${id} apartado ${A.n}`;
    if (A.n !== i + 1) mal(a, "los apartados van numerados 1, 2, 3… en orden");
    for (const k of ["ic", "titulo", "idea"]) if (!A[k]) mal(a, `falta ${k}`);
    if (!Array.isArray(A.reglas) || A.reglas.length < 2) mal(a, "pon al menos 2 reglas (explicación)");
    if (!A.ejemplos || !A.ejemplos.length) ojo(a, "sin ejemplos resueltos");
    const L = (B.manual || {})[A.n] || [];
    if (L.length < 6) (L.length < 3 ? mal : ojo)(a, `tiene ${L.length} actividades (mínimo 3, mejor 6 o más)`);
    for (const d of [1, 2, 3]) if (!L.some(q => q.d === d)) ojo(a, `no hay actividades de nivel ${d}`);
    revisar(L, a);
  });
  /* versiones adaptadas */
  for (const [k, V] of Object.entries(X.adaptado || {})) {
    const a = `${id} adaptado «${k}»`;
    if (!DIFS.includes(k)) { mal(a, "la clave debe ser una de " + DIFS.join(", ")); continue; }
    for (const ap of (V.tema || {}).aps || []) if (!T.aps.some(x => x.n === ap.n)) mal(a, `cambia el apartado ${ap.n}, que no existe`);
    for (const [n, L] of Object.entries((V.banco || {}).manual || {})) { if (!T.aps.some(x => String(x.n) === n)) mal(a, `actividades del apartado ${n}, que no existe`); else { if (L.length < 3) mal(a, `apartado ${n}: al menos 3 actividades`); revisar(L, `${a} apartado ${n}`); } }
  }
  if (!Array.isArray(B.parejas) || B.parejas.length < 4) ojo(id, "banco.parejas: pon al menos 4 parejas para el juego de Parejas en equipo");
}
for (const f of fs.readdirSync(DIR).filter(f => /^[u-z]\d{1,2}\.json$/.test(f))) if (!ind.some(t => t.id + ".json" === f)) ojo(f, "este archivo no está en indice.json (no saldrá en la web)");
avisos.forEach(a => console.log("aviso:", a));
errores.forEach(e => console.log("ERROR:", e));
console.log(`${ind.length} temas · ${errores.length} errores · ${avisos.length} avisos`);
process.exit(errores.length ? 1 : 0);
