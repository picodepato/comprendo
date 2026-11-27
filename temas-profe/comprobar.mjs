// Comprueba los temas de los profes (temas-profe/indice.json y cada temas-profe/<id>.js) antes de publicarlos.
// Uso: node temas-profe/comprobar.mjs   → sale con código 1 si hay errores (los avisos no paran).
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm"; import url from "node:url";
const DIR = path.dirname(url.fileURLToPath(import.meta.url)), RAIZ = path.join(DIR, "..");
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
const DIFS = ["facil", "nee", "tdah", "dislexia", "tea", "idioma", "dibujos", "muchos", "normal"];
const ind = JSON.parse(fs.readFileSync(path.join(DIR, "indice.json"), "utf8"));
if (!Array.isArray(ind)) { console.error("indice.json debe ser una lista"); process.exit(1); }
const vistos = new Set();
for (const t of ind) {
  const id = t.id || "?";
  if (!/^[u-z]\d{1,2}$/.test(id)) mal(id, "el id debe ser una letra de la u a la z y 1 o 2 cifras (x1, x2… y1…)");
  if (vistos.has(id)) mal(id, "id repetido en indice.json"); vistos.add(id);
  for (const k of ["profe", "curso", "asignatura", "titulo", "archivo", "peticion"]) if (!t[k]) mal(id, `falta «${k}» en indice.json`);
  const f = path.join(RAIZ, t.archivo || "");
  if (!t.archivo || !fs.existsSync(f)) { mal(id, `no existe el archivo ${t.archivo}`); continue; }
  const src = fs.readFileSync(f, "utf8");
  if (/<script|javascript:|on\w+\s*=\s*["']/i.test(src)) mal(id, "el tema no puede llevar <script>, javascript: ni on…= en el HTML");
  for (const m of src.matchAll(/https?:\/\/[^\s"'`)]+/g)) if (!/^https:\/\/(upload\.wikimedia\.org|commons\.wikimedia\.org)\//.test(m[0])) ojo(id, `enlace externo: ${m[0]} (solo Wikimedia Commons)`);
  // cargar el archivo con un LYATemasProfe de mentira
  const reg = [];
  const E = (d, g, e, o, p, pi, r, x = {}) => ({d, g, e, o, p: ["", ...p], pi, r: [].concat(r), ...x});
  const REL = (d, g, e, pares, pi, r, x = {}) => ({d, g, e, tipo: "rel", pares, pi, r: [].concat(r), ...x});
  const CLA = (d, g, e, cajas, items, pi, r, x = {}) => ({d, g, e, tipo: "cla", cajas, items, pi, r: [].concat(r), ...x});
  const window = {LYATemasProfe: {E, REL, CLA, registrar: x => reg.push(x)}};
  try { vm.runInNewContext(src, {window, console}, {filename: t.archivo, timeout: 2000}); } catch (e) { mal(id, "el archivo da error al cargarlo: " + e.message); continue; }
  if (reg.length !== 1) { mal(id, `el archivo debe llamar 1 vez a LYATemasProfe.registrar (lo llama ${reg.length})`); continue; }
  const X = reg[0], T = X.tema || {}, B = X.banco || {};
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
for (const f of fs.readdirSync(DIR).filter(f => /^[u-z]\d{1,2}\.js$/.test(f))) if (!ind.some(t => t.archivo === "temas-profe/" + f)) ojo(f, "este archivo no está en indice.json (no saldrá en la web)");
avisos.forEach(a => console.log("aviso:", a));
errores.forEach(e => console.log("ERROR:", e));
console.log(`${ind.length} temas · ${errores.length} errores · ${avisos.length} avisos`);
process.exit(errores.length ? 1 : 0);
