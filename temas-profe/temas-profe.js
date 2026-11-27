/* COMPRENDO · Temas de los profes («➕ Añadir un tema»).
   1) El profe pide un tema nuevo con un asistente de preguntas (#profe-tema-nuevo): curso, asignatura, tema, apartados,
      cómo es su alumnado y fotos del libro o texto. Las fotos se reducen en el móvil antes de subirlas (máx. 6).
   2) La petición va a la cola (api/temas → api/_temas.js). Sus peticiones y en qué estado están: #profe-temas.
   3) El admin la revisa en su panel (pestaña «📥 Temas pedidos») y la aprueba o la rechaza.
   4) Cada mañana la rutina prepara los aprobados con el motor de FP Básica (fpb/fpb.js) en temas-profe/<id>.js,
      los apunta en temas-profe/indice.json, abre un PR y borra las fotos (ver temas-profe/RUTINA.md).
   5) Los temas publicados salen en «Temas de mis profes» (#mis-temas): solo para el profe que lo pidió, sus alumnos y el admin.
      Cada tema usa las rutas de FP Básica (#fpb-<id>…), con ids x1…x99, y1…y99 (las letras x, y, z, w, v, u son de los profes).
   Formato de temas-profe/<id>.js: LYATemasProfe.registrar({id, profe, curso, asignatura, peticion, tema, banco, adaptado})
     tema   = como un tema de fpb/sociales-temas.js ({id, n, titulo, ic, color, intro, aps: [{n, ic, titulo, idea, reglas, glosario, ejemplos, ojo}]})
     banco  = {manual: {<apartado>: [preguntas]}, nombres: {<apartado>: nombre}, parejas: [[a, b, apartado]…]} (preguntas con E, REL y CLA de aquí)
     adaptado = (para el futuro) versiones por dificultad del alumno: {tdah: {banco?, tema?}, …} con las claves de DIFICULTADES.
   Futuro (no está hecho): ficha de dificultades por alumno, perfil:<alumno> = {dif: ["tdah"…], adaptar: {fpb: true, temas: true, lecturas: false…}, notas},
   y el motor elegiría tema.adaptado[dif] cuando el profe haya marcado que se adapte. DIFICULTADES es la misma lista para todo. */
(() => {
const C = () => window.LYACuentas || {};
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const store = {get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }};
const fecha = t => t ? new Date(t).toLocaleString("es-ES", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}) : "—";

/* las dificultades del alumnado: las mismas claves servirán para la ficha de cada alumno */
const DIFICULTADES = [
  ["facil", "📖 Lectura fácil"], ["nee", "🧩 NEE / discapacidad intelectual"], ["tdah", "⚡ TDAH"], ["dislexia", "🔤 Dislexia"],
  ["tea", "🧠 TEA"], ["idioma", "🌍 Poco castellano (recién llegados)"], ["dibujos", "🖼️ Más dibujos, menos texto"],
  ["muchos", "🔁 Muchos ejercicios de repaso"], ["normal", "🎓 Nivel normal del curso"]];
const CURSOS = ["5.º Primaria", "6.º Primaria", "1.º ESO", "2.º ESO", "3.º ESO", "4.º ESO", "4.º ESO PDC", "3.º ESO PDC", "1.º FP Básica", "2.º FP Básica", "1.º Bachillerato", "2.º Bachillerato"];
const ASIGS = ["Matemáticas", "Lengua Castellana y Literatura", "Inglés", "Valenciano", "Catalán", "Ciencias Sociales", "Geografía e Historia", "Biología y Geología", "Física y Química", "Ciencias Aplicadas", "Comunicación y Sociedad", "Tecnología", "Música", "Educación Física", "Francés", "Economía"];
const ESTADO = {subiendo: ["⏫", "Subiendo…"], pendiente: ["⏳", "Esperando revisión"], aprobada: ["✅", "Aprobado: se prepara una mañana de estas"], rechazada: ["❌", "No aprobado"],
  error: ["⚠️", "Ha habido un problema al prepararlo"], preparada: ["🛠️", "Preparado: falta publicarlo en la web"], publicada: ["🎉", "Publicado"]};
const LIM = {fotos: 6, fotoBytes: 750000};

/* ---------- helpers para los archivos de temas (iguales que en fpb/sociales-banco.js) ---------- */
const E = (d, g, e, o, p, pi, r, x = {}) => ({d, g, e, o, p: ["", ...p], pi, r: [].concat(r), ...x});
const REL = (d, g, e, pares, pi, r, x = {}) => ({d, g, e, tipo: "rel", pares, pi, r: [].concat(r), ...x});
const CLA = (d, g, e, cajas, items, pi, r, x = {}) => ({d, g, e, tipo: "cla", cajas, items, pi, r: [].concat(r), ...x});

/* ---------- temas publicados ---------- */
let IND = null, cargaInd = null, miProfe, cargados = {}, REG = {};
let indT = 0;
const indice = () => { if (Date.now() - indT > 60e3) { cargaInd = null; indT = Date.now(); } return cargaInd ||= fetch("temas-profe/indice.json", {cache: "no-cache"}).then(r => r.ok ? r.json() : []).catch(() => []).then(x => (IND = Array.isArray(x) ? x : (x.temas || []))); };
/* el profe de mi clase (alumno) */
async function profeDeMiClase() {
  if (miProfe !== undefined) return miProfe;
  try { const r = await C().api("avisos"); miProfe = r.ok && r.j.clase ? r.j.clase.profe || null : null; } catch (e) { miProfe = null; }
  return miProfe;
}
async function visibles() {
  const yo = C().usuario, rol = C().rol; if (!yo) return [];
  const I = await indice();
  if (rol === "admin") return I;
  if (rol === "profe") return I.filter(t => t.profe === yo);
  const p = await profeDeMiClase();
  return p ? I.filter(t => t.profe === p) : [];
}
const cargarScript = src => new Promise((ok, mal) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = mal; document.head.appendChild(s); });
async function cargarTemas() {
  const V = await visibles();
  await Promise.all(V.filter(t => !cargados[t.id]).map(t => (cargados[t.id] = cargarScript(t.archivo || `temas-profe/${t.id}.js`).catch(() => { delete cargados[t.id]; }))));
  return V;
}
/* id de la asignatura (solo letras: fpb.js lo pide así) para cada profe + curso + asignatura */
const idAsig = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; let o = "tp"; for (let i = 0; i < 6; i++) { o += String.fromCharCode(97 + h % 26); h = Math.floor(h / 26) || (h * 7 + 13); } return o; };
function registrar(x) {
  const F = window.LYAFpb; if (!F || !x || !x.tema) return;
  const T = x.tema; T.id ||= x.id;
  T.aps.forEach(A => { if (typeof A.img === "function") Object.defineProperty(A, "img", {get: A.img, enumerable: true}); });
  const id = idAsig(`${x.profe}|${x.curso}|${x.asignatura}`);
  let A = F.asignaturas().find(a => a.id === id);
  if (!A) { A = {id, n: x.asignatura, ic: T.ic || "📘", color: T.color || "#7c5cff", intro: `${x.curso} · temas preparados para la clase de ${x.profe}.`, temas: [], pronto: [], profe: x.profe, curso: x.curso}; F.asignatura(A); }
  if (!A.temas.some(t => t.id === T.id)) { A.temas.push(T); A.temas.sort((a, b) => (a.n || 0) - (b.n || 0)); }
  const B = x.banco || {}, P = B.parejas;
  F.banco(T.id, {...B, parejas: Array.isArray(P) ? (aps => P.filter(p => !aps || !aps.length || aps.includes(p[2]))) : P});
  REG[T.id] = x;
}

/* ---------- rutas ---------- */
const RE = /^(mis-temas|profe-tema-nuevo|profe-temas)$/;
const isTp = h => RE.test(h);
const RE_FPB = /^fpb-([u-z]\d{1,2})(-|$)/;
let appEl = null;
function render(app) {
  appEl = app;
  const h = location.hash.slice(1);
  try { window.LYA?.setAcc?.("#7c5cff"); } catch (e) {}
  if (h === "profe-tema-nuevo") return asistente(app);
  if (h === "profe-temas") return misPeticiones(app);
  return misTemas(app);
}
const esProfe = () => ["profe", "admin"].includes(C().rol);
const sinCuenta = app => { app.innerHTML = `<section class="wrap mt tp"><h1 class="mt-h1">📚 Temas de mis profes</h1><p class="mt-lead">Entra con tu cuenta para ver los temas que ha preparado tu profe.</p><p><button class="btn main" type="button" data-tp="cuenta">Entrar</button></p></section>`; };

async function misTemas(app) {
  if (!C().usuario) return sinCuenta(app);
  app.innerHTML = `<section class="wrap mt tp"><h1 class="mt-h1">📚 Temas de mis profes</h1><p class="mt-lead">Cargando…</p></section>`;
  const V = await cargarTemas(); if (appEl !== app || location.hash.slice(1) !== "mis-temas") return;
  const F = window.LYAFpb, As = (F?.asignaturas() || []).filter(a => a.profe && a.temas.some(t => V.some(v => v.id === t.id)));
  app.innerHTML = `<section class="wrap mt fp tp">
    <h1 class="mt-h1">📚 Temas de mis profes</h1>
    <p class="mt-lead">${esProfe() ? "Los temas que has pedido y ya están publicados. Solo los ves tú y tus alumnos." : "Temas preparados por tu profe para tu clase."}</p>
    ${esProfe() ? `<p class="mt-acc"><a class="btn main" href="#profe-tema-nuevo">➕ Añadir un tema</a> <a class="btn" href="#profe-temas">📥 Mis peticiones</a></p>` : ""}
    ${As.length ? As.map(A => `<h2 class="mt-h2">${A.ic} ${esc(A.n)} <small class="mt-small">${esc(A.curso)}${C().rol === "admin" ? ` · ${esc(A.profe)}` : ""}</small></h2>
      <div class="mt-temas">${A.temas.filter(T => V.some(v => v.id === T.id)).map(T => `<a class="mt-tema" href="#fpb-${T.id}" style="--c:${T.color}"><span class="mt-tn">Tema ${esc(T.n)}</span><b>${T.ic} ${esc(T.titulo)}</b><span class="mt-small">${esc(T.intro)}</span><span class="mt-small">${T.aps.length} apartados</span></a>`).join("")}</div>`).join("")
      : `<p class="mt-box">${esProfe() ? "Todavía no tienes temas publicados. Pide uno con «➕ Añadir un tema»." : "Tu profe todavía no ha publicado temas."}</p>`}
  </section>`;
}

/* ---------- mis peticiones (profe) ---------- */
async function misPeticiones(app) {
  if (!esProfe()) return sinCuenta(app);
  app.innerHTML = `<section class="wrap mt tp"><p class="mt-migas"><a href="#profe">← Profe</a></p><h1 class="mt-h1">📥 Mis peticiones de temas</h1><p class="mt-lead">Cargando…</p></section>`;
  const r = await C().api("temas").catch(() => ({ok: false, j: {}})); if (appEl !== app || location.hash.slice(1) !== "profe-temas") return;
  await indice();
  const P = (r.j.peticiones || []).filter(p => C().rol === "admin" ? p.profe === C().usuario : true).sort((a, b) => b.creado - a.creado);
  app.innerHTML = `<section class="wrap mt tp"><p class="mt-migas"><a href="#profe">← Profe</a></p>
    <h1 class="mt-h1">📥 Mis peticiones de temas</h1>
    <p class="mt-lead">Cada petición la revisa el administrador. Cuando la aprueba, el tema se prepara una de las mañanas siguientes y te sale en «📚 Temas de mis profes».</p>
    <p class="mt-acc"><a class="btn main" href="#profe-tema-nuevo">➕ Añadir un tema</a> <a class="btn" href="#mis-temas">📚 Mis temas publicados</a></p>
    ${!r.ok ? `<p class="mt-box">No se han podido cargar tus peticiones.</p>` : P.length ? `<div class="tp-lista">${P.map(peticionHTML).join("")}</div>` : `<p class="mt-box">Todavía no has pedido ningún tema.</p>`}
    <p class="ctam" id="tpm" role="status"></p></section>`;
}
function peticionHTML(p) {
  const pub = (IND || []).find(t => t.peticion === p.id), [ic, n] = pub ? ESTADO.publicada : ESTADO[p.estado] || ["•", p.estado];
  return `<article class="tp-pet tp-${pub ? "publicada" : p.estado}"><h3>${ic} ${esc(p.asignatura)} · ${esc(p.curso)} · Tema ${esc(p.tema)}: ${esc(p.titulo)}</h3>
    <p class="tp-est"><b>${n}</b> · pedido el ${fecha(p.creado)}${p.fotos ? ` · ${p.fotos} foto${p.fotos > 1 ? "s" : ""}` : ""}${p.texto ? " · con texto" : ""}</p>
    ${p.estado === "rechazada" && p.motivo ? `<p class="tp-mot">Motivo: ${esc(p.motivo)}</p>` : ""}
    ${pub ? `<p><a class="btn main" href="#fpb-${esc(pub.id)}">Abrir el tema</a></p>` : ""}
    ${["subiendo", "pendiente", "aprobada", "rechazada", "error"].includes(p.estado) && !pub ? `<p><button type="button" class="ctal" data-tp="cancelar" data-id="${esc(p.id)}">${p.estado === "rechazada" ? "Quitar de la lista" : "Cancelar la petición"}</button></p>` : ""}</article>`;
}

/* ---------- el asistente ---------- */
const BORR = "lyaTemaBorrador";
let W = null;
const nuevoW = () => ({paso: 0, d: {curso: "", asignatura: "", tema: "", titulo: "", apartados: "", alumnado: [], notas: "", texto: ""}, fotos: [], acepto: false, enviando: false});
const PASOS = [
  {k: "curso", t: "¿Para qué curso es el tema?", ok: d => d.curso.trim()},
  {k: "asignatura", t: "¿De qué asignatura?", ok: d => d.asignatura.trim()},
  {k: "tema", t: "¿Qué tema es?", ok: d => d.titulo.trim()},
  {k: "apartados", t: "¿Qué apartados tiene?", ok: () => true},
  {k: "alumnado", t: "¿Cómo es tu alumnado?", ok: () => true},
  {k: "material", t: "Adjunta el material", ok: (d, w) => (w.fotos.length || d.texto.trim().length >= 40) && w.acepto},
  {k: "resumen", t: "Revisa y envía", ok: () => true}];
const guardarBorrador = () => store.set(BORR, W.d);
/* lo que más ha usado (para sugerirlo primero) */
const usados = k => store.get("lyaTemaUsados:" + k) || [];
const usar = (k, v) => { if (!v) return; store.set("lyaTemaUsados:" + k, [v, ...usados(k).filter(x => x !== v)].slice(0, 6)); };
const sugerencias = (k, base) => [...new Set([...usados(k), ...base])];
const chips = (k, lista, actual) => `<div class="tp-chips" role="group">${lista.map(v => `<button type="button" class="tp-chip" data-tp="chip" data-k="${k}" data-v="${esc(v)}" aria-pressed="${v === actual}">${esc(v)}</button>`).join("")}</div>`;
const dl = (id, lista) => `<datalist id="${id}">${lista.map(v => `<option value="${esc(v)}">`).join("")}</datalist>`;

function asistente(app) {
  if (!esProfe()) { app.innerHTML = `<section class="wrap mt tp"><h1 class="mt-h1">➕ Añadir un tema</h1><p class="mt-lead">Esto es solo para profes. Entra con una cuenta de profe.</p><p><button class="btn main" type="button" data-tp="cuenta">Entrar</button></p></section>`; return; }
  if (!W) { W = nuevoW(); const b = store.get(BORR); if (b) Object.assign(W.d, b); }
  const P = PASOS[W.paso], d = W.d;
  let cuerpo = "";
  if (P.k === "curso") cuerpo = `${chips("curso", sugerencias("curso", CURSOS), d.curso)}
    <label class="tp-l">O escríbelo:<input class="tp-in" list="tpdlc" data-tpin="curso" value="${esc(d.curso)}" maxlength="40" placeholder="Por ejemplo: 2.º ESO"></label>${dl("tpdlc", sugerencias("curso", CURSOS))}`;
  else if (P.k === "asignatura") cuerpo = `${chips("asignatura", sugerencias("asignatura", ASIGS), d.asignatura)}
    <label class="tp-l">O escríbela:<input class="tp-in" list="tpdla" data-tpin="asignatura" value="${esc(d.asignatura)}" maxlength="50" placeholder="Por ejemplo: Matemáticas"></label>${dl("tpdla", sugerencias("asignatura", ASIGS))}`;
  else if (P.k === "tema") cuerpo = `<div class="tp-fila"><label class="tp-l tp-n">Número<input class="tp-in" data-tpin="tema" value="${esc(d.tema)}" maxlength="10" inputmode="numeric" placeholder="4"></label>
    <label class="tp-l">Nombre del tema<input class="tp-in" data-tpin="titulo" value="${esc(d.titulo)}" maxlength="80" placeholder="Por ejemplo: Las fracciones"></label></div>
    <p class="mt-small">Pon el nombre como sale en vuestro libro, así tus alumnos lo reconocen.</p>`;
  else if (P.k === "apartados") cuerpo = `<label class="tp-l">Un apartado en cada línea (si lo dejas vacío, los sacamos de las fotos):<textarea class="tp-in" rows="6" data-tpin="apartados" maxlength="1500" placeholder="1. Qué es una fracción&#10;2. Fracciones equivalentes&#10;3. Sumar y restar fracciones">${esc(d.apartados)}</textarea></label>`;
  else if (P.k === "alumnado") cuerpo = `<p class="mt-small">Marca todo lo que encaje con tu clase. Así adaptamos las explicaciones y las actividades.</p>
    <div class="tp-chips" role="group">${DIFICULTADES.map(([k, n]) => `<button type="button" class="tp-chip" data-tp="dif" data-v="${k}" aria-pressed="${d.alumnado.includes(k)}">${esc(n)}</button>`).join("")}</div>
    <label class="tp-l">Algo más que debamos saber (opcional):<textarea class="tp-in" rows="4" data-tpin="notas" maxlength="1500" placeholder="Por ejemplo: les cuesta mucho leer enunciados largos; quiero ejercicios con dinero; el examen es el día 12…">${esc(d.notas)}</textarea></label>`;
  else if (P.k === "material") cuerpo = `<p class="mt-small">Haz fotos a las páginas del libro o de tus apuntes (hasta ${LIM.fotos}), o pega el texto. Puedes hacer las dos cosas.</p>
    <div class="tp-fotos">${W.fotos.map((f, i) => `<figure class="tp-foto"><img src="${f}" alt="Foto ${i + 1}"><button type="button" class="tp-x" data-tp="quitar" data-i="${i}" aria-label="Quitar la foto ${i + 1}">✕</button></figure>`).join("")}
      ${W.fotos.length < LIM.fotos ? `<label class="tp-add"><input type="file" accept="image/*" multiple data-tpfile hidden><span>📷</span><b>Añadir fotos</b></label>` : ""}</div>
    <p class="mt-small" id="tpfm" role="status"></p>
    <label class="tp-l">O pega aquí el texto:<textarea class="tp-in" rows="6" data-tpin="texto" maxlength="20000" placeholder="Copia aquí la teoría o los ejercicios…">${esc(d.texto)}</textarea></label>
    <label class="tp-ok"><input type="checkbox" data-tp="acepto"${W.acepto ? " checked" : ""}> En las fotos no salen alumnos, caras ni datos personales.</label>`;
  else cuerpo = `<dl class="tp-res"><dt>Curso</dt><dd>${esc(d.curso)}</dd><dt>Asignatura</dt><dd>${esc(d.asignatura)}</dd><dt>Tema</dt><dd>${esc(d.tema ? d.tema + ". " : "")}${esc(d.titulo)}</dd>
      <dt>Apartados</dt><dd>${d.apartados ? esc(d.apartados).replace(/\n/g, "<br>") : "Los sacamos de las fotos"}</dd>
      <dt>Alumnado</dt><dd>${d.alumnado.map(k => esc((DIFICULTADES.find(x => x[0] === k) || [k, k])[1])).join(", ") || "—"}${d.notas ? `<br>${esc(d.notas)}` : ""}</dd>
      <dt>Material</dt><dd>${W.fotos.length} foto${W.fotos.length === 1 ? "" : "s"}${d.texto ? ` y ${d.texto.length} letras de texto` : ""}</dd></dl>
    <p class="mt-small">El administrador lo revisa antes de prepararlo. Cuando el tema esté listo, las fotos se borran.</p>`;
  app.innerHTML = `<section class="wrap mt tp" style="--c:#7c5cff"><p class="mt-migas"><a href="#profe">← Profe</a> · <a href="#profe-temas">📥 Mis peticiones</a></p>
    <h1 class="mt-h1">➕ Añadir un tema</h1>
    <div class="mt-prog" aria-hidden="true"><i style="width:${100 * (W.paso + 1) / PASOS.length}%"></i></div>
    <div class="mt-box"><p class="mt-tn">Paso ${W.paso + 1} de ${PASOS.length}</p><h2>${P.t}</h2>${cuerpo}
      <p class="ctam" id="tpm" role="status"></p>
      <p class="mt-acc">${W.paso ? `<button type="button" class="btn" data-tp="atras">← Atrás</button> ` : ""}${P.k === "resumen" ? `<button type="button" class="btn main" data-tp="enviar"${W.enviando ? " disabled" : ""}>📤 Enviar la petición</button>` : `<button type="button" class="btn main" data-tp="sigue"${P.ok(d, W) ? "" : " disabled"}>Siguiente →</button>`}
      ${W.paso ? ` <button type="button" class="ctal" data-tp="empezar">Empezar de nuevo</button>` : ""}</p></div></section>`;
  const f = app.querySelector("[data-tpin]"); if (f && P.k !== "material" && P.k !== "alumnado") try { f.focus({preventScroll: true}); } catch (e) {}
}
const pintarW = () => appEl && asistente(appEl);
const msg = (t, id = "tpm") => { const m = document.getElementById(id); if (m) m.textContent = t; };
const botonSigue = () => { const b = document.querySelector("[data-tp=sigue]"); if (b) b.disabled = !PASOS[W.paso].ok(W.d, W); };

/* reducir una foto (máx. 1600 px de lado y menos de 750 KB en JPEG) */
async function reducir(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = url; });
    for (const lado of [1600, 1280, 1000]) {
      const k = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      for (const q of [.8, .7, .6, .5]) { const d = c.toDataURL("image/jpeg", q); if (d.length <= LIM.fotoBytes - 1000) return d; }
    }
    return null;
  } finally { URL.revokeObjectURL(url); }
}
const ERR = {faltan_datos: "Falta el curso, la asignatura o el nombre del tema.", falta_material: "Añade al menos una foto o un texto más largo.", demasiadas_mias: "Ya tienes 3 peticiones esperando. Cuando se preparen podrás pedir más.",
  cola_llena: "Ahora mismo hay muchas peticiones en la cola. Prueba dentro de unos días.", espera: "Has enviado muchas cosas seguidas. Espera un rato.", foto_no_valida: "Una foto no se ha podido subir (es demasiado grande).", solo_profes: "Tu sesión ha caducado. Sal y vuelve a entrar."};
async function enviar() {
  if (W.enviando) return; W.enviando = true; pintarW();
  const d = W.d, api = C().api;
  const fallo = e => { W.enviando = false; pintarW(); msg("⚠ " + (ERR[e] || "No se ha podido enviar. Prueba otra vez.")); };
  try {
    msg("Enviando los datos…");
    const r = await api("temas", "POST", {accion: "pedir", ...d, fotos: W.fotos.length});
    if (!r.ok) return fallo(r.j.error);
    for (let i = 0; i < W.fotos.length; i++) {
      msg(`Subiendo la foto ${i + 1} de ${W.fotos.length}…`);
      let f = await api("temas", "POST", {accion: "foto", id: r.j.id, i, data: W.fotos[i]});
      if (!f.ok && f.code >= 500) f = await api("temas", "POST", {accion: "foto", id: r.j.id, i, data: W.fotos[i]});
      if (!f.ok) { await api("temas", "POST", {accion: "cancelar", id: r.j.id}).catch(() => {}); return fallo(f.j.error); }
    }
    const e = await api("temas", "POST", {accion: "enviar", id: r.j.id});
    if (!e.ok) return fallo(e.j.error);
    usar("curso", d.curso); usar("asignatura", d.asignatura);
    store.set(BORR, null); W = null;
    location.hash = "profe-temas";
    setTimeout(() => msg("✓ Petición enviada. Te avisaremos aquí cuando esté lista."), 400);
  } catch (er) { fallo(); }
}

document.addEventListener("input", e => {
  const k = e.target.dataset?.tpin; if (!k || !W) return;
  W.d[k] = e.target.value; guardarBorrador(); botonSigue();
  document.querySelectorAll(`[data-tp=chip][data-k=${k}]`).forEach(b => b.setAttribute("aria-pressed", b.dataset.v === e.target.value));
});
document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.matches?.("input[data-tpin]") && W && PASOS[W.paso].ok(W.d, W)) { e.preventDefault(); W.paso++; pintarW(); } });
document.addEventListener("change", async e => {
  if (e.target.matches?.("[data-tp=acepto]") && W) { W.acepto = e.target.checked; botonSigue(); return; }
  if (!e.target.matches?.("[data-tpfile]") || !W) return;
  const fs = [...e.target.files].slice(0, LIM.fotos - W.fotos.length);
  for (let i = 0; i < fs.length; i++) {
    msg(`Preparando la foto ${i + 1} de ${fs.length}…`, "tpfm");
    const d = await reducir(fs[i]).catch(() => null);
    if (d) W.fotos.push(d); else { msg("⚠ Esa foto no se ha podido leer.", "tpfm"); }
  }
  pintarW();
});
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-tp]"); if (!b) return;
  const a = b.dataset.tp;
  if (a === "cuenta") return C().abrir?.();
  if (a === "cancelar") {
    if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = "¿Seguro? Pulsa otra vez"; return; }
    b.disabled = true; await C().api("temas", "POST", {accion: "cancelar", id: b.dataset.id}).catch(() => {}); if (appEl) misPeticiones(appEl); return;
  }
  if (!W) return;
  if (a === "chip") { W.d[b.dataset.k] = b.dataset.v; guardarBorrador(); W.paso++; pintarW(); }
  else if (a === "dif") { const v = b.dataset.v, L = W.d.alumnado; W.d.alumnado = L.includes(v) ? L.filter(x => x !== v) : [...L, v]; b.setAttribute("aria-pressed", W.d.alumnado.includes(v)); guardarBorrador(); }
  else if (a === "sigue" && PASOS[W.paso].ok(W.d, W)) { W.paso++; pintarW(); scrollTo(0, 0); }
  else if (a === "atras") { W.paso = Math.max(0, W.paso - 1); pintarW(); }
  else if (a === "empezar") { if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = "¿Borrar todo? Pulsa otra vez"; return; } store.set(BORR, null); W = nuevoW(); pintarW(); }
  else if (a === "quitar") { W.fotos.splice(+b.dataset.i, 1); pintarW(); }
  else if (a === "enviar") enviar();
});

/* un enlace directo a un tema de profe (#fpb-x1…): primero se cargan sus archivos */
async function antesDeFpb() {
  const h = location.hash.slice(1), m = h.match(RE_FPB);
  if (!m || window.LYAFpb?.tema(m[1]) || !C().usuario) return;
  await cargarTemas();
  if (window.LYAFpb?.tema(m[1]) && location.hash.slice(1) === h) dispatchEvent(new HashChangeEvent("hashchange"));
}
addEventListener("hashchange", antesDeFpb);
addEventListener("load", () => setTimeout(() => { antesDeFpb(); hayTemas().then(x => { API.hay = x; }).catch(() => {}); }, 300));
/* hay temas para mí (para enseñar la tarjeta en Aprender) */
const hayTemas = async () => (await visibles()).length > 0;

const API = window.LYATemasProfe = {hay: false, isTp, render, registrar, cargarTemas, hayTemas, visibles, E, REL, CLA, DIFICULTADES, ESTADO, LIM, _reg: REG};
})();
