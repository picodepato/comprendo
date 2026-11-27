/* COMPRENDO · Cuaderno de clase del profe (#profe-cuaderno, #profe-cuaderno-<pestaña>). De momento, en castellano.
   Pestañas: notas (medias ponderadas por categorías; los deberes de la web entran solos), lista (asistencia y puntos de
   comportamiento por habilidades), plano (plano de clase para pasar lista o dar puntos tocando el sitio),
   herramientas (alumno al azar, grupos, temporizador, medidor de ruido) e informes (uno por alumno, para imprimir o PDF).
   Datos: los alumnos y los deberes salen de /api/admin (LYAProfe.datos()). Lo demás es del profe y se guarda por clase en
   /api/admin?t=cuaderno (api/_cuaderno.js), unos segundos después de cada cambio. Ver README «Cuaderno de clase». */
(() => {
const C = () => window.LYACuentas || {}, P = () => window.LYAProfe || {};
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const store = {get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }};
const dS = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const hoyS = () => dS(new Date());
const fES = s => s ? s.split("-").reverse().join("/") : "";
const n1 = x => x === null || x === undefined || isNaN(x) ? "" : (Math.round(x * 10) / 10).toLocaleString("es-ES", {maximumFractionDigits: 1});
const leerN = s => { s = String(s ?? "").trim().replace(",", "."); if (s === "") return null; const x = +s; return isNaN(x) ? NaN : Math.max(0, Math.min(10, x)); };
const id6 = () => Math.random().toString(36).slice(2, 8);
const inicioCurso = () => { const d = new Date(); return `${d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1}-09-01`; };
const mezcla = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const TABS = [["notas", "📊 Notas"], ["lista", "✅ Pasar lista"], ["plano", "🪑 Plano de clase"], ["herramientas", "🎲 Herramientas"], ["informes", "📄 Informes"]];
const ASIS = {p: ["✅", "Presente", "presentes"], f: ["❌", "Falta", "faltas"], r: ["⏰", "Retraso", "retrasos"], j: ["📄", "Justificada", "faltas justificadas"]};
const ASIS1 = {p: "presente", f: "falta", r: "retraso", j: "falta justificada"};
const NUEVO = () => ({
  cats: [{id: "deberes", n: "Deberes de la web", peso: 30}, {id: "examenes", n: "Exámenes", peso: 40}, {id: "trabajos", n: "Trabajos y cuaderno", peso: 20}, {id: "actitud", n: "Actitud (puntos)", peso: 10, puntos: true}],
  cols: [], notas: {}, auto: {}, sinHacer0: true,
  hab: [{id: "part", ic: "🙋", n: "Participa", v: 1}, {id: "ayu", ic: "🤝", n: "Ayuda a otros", v: 1}, {id: "esf", ic: "💪", n: "Se esfuerza", v: 1}, {id: "equ", ic: "🧩", n: "Trabaja en equipo", v: 1},
    {id: "int", ic: "🔇", n: "Interrumpe", v: -1}, {id: "mat", ic: "🎒", n: "Sin material", v: -1}, {id: "tar", ic: "📝", n: "Sin la tarea", v: -1}],
  pts: [], asis: {}, plano: {f: 5, c: 6, s: {}}, obs: {}, nom: {}
});
const MAXPTS = 4000;

let D = null, G = "", CU = null, V = 0, cargadoDe = "", appEl = null;
let tGuardar = 0, guardando = false, pendiente = false, estado = "", fallo = false;
let diaL = hoyS(), modoPlano = "lista", elegido = "", popSitio = -1, formNotas = "", infU = "", infDe = inicioCurso(), infA = hoyS();

/* ---------- datos ---------- */
const alumnos = () => (D ? D.usuarios.filter(u => u.rol !== "profe" && u.grupo === G) : []).sort((a, b) => nom(a.usuario).localeCompare(nom(b.usuario), "es"));
const nom = u => (CU && CU.nom && CU.nom[u]) || u;
const deberes = () => {
  if (!D) return [];
  const mios = new Set(alumnos().map(a => a.usuario));
  return D.deberes.filter(d => d.grupo === G || (!d.grupo && d.alumnos.some(a => mios.has(a.usuario))));
};
const catDe = id => CU.cats.find(c => c.id === id) ? id : (CU.cats.find(c => !c.puntos) || {}).id;
/* todas las columnas: las de los deberes (salen solas) y las del profe, por fecha */
function columnas(conQuitadas) {
  const nd = P().nomDeber || (d => d.titulo || d.lectura);
  const auto = deberes().filter(d => conQuitadas || !(CU.auto[d.id] || {}).fuera)
    .map(d => ({id: "d:" + d.id, n: nd(d), cat: catDe((CU.auto[d.id] || {}).cat || "deberes"), fecha: d.limite, auto: true, d}));
  return [...auto, ...CU.cols.map(c => ({...c, cat: catDe(c.cat)}))].sort((a, b) => (a.fecha || "9999").localeCompare(b.fecha || "9999"));
}
function notaDeber(d, u) {
  const a = d.alumnos.find(x => x.usuario === u); if (!a) return null;
  if (a.hecho) return a.tot ? 10 * a.ok / a.tot : 10 * (a.estrellas || 0) / 3;
  return CU.sinHacer0 && d.limite < hoyS() ? 0 : null;
}
const puesta = (col, u) => { const x = (CU.notas[col.id] || {})[u]; return typeof x === "number" ? x : null; };
const valor = (col, u) => { const x = puesta(col, u); return x !== null ? x : col.auto ? notaDeber(col.d, u) : null; };
const enPeriodo = (f, de, a) => !f || ((!de || f >= de) && (!a || f <= a));
const puntosDe = (u, de, a) => CU.pts.filter(p => p.u === u && enPeriodo(p.d, de, a));
function mediaCat(cat, u, cols, de, a) {
  if (cat.puntos) {
    const ps = puntosDe(u, de, a), hab = Object.fromEntries(CU.hab.map(h => [h.id, h.v]));
    const pos = ps.filter(p => hab[p.h] > 0).length, neg = ps.filter(p => hab[p.h] < 0).length;
    return pos + neg ? 10 * pos / (pos + neg) : null;
  }
  const vs = cols.filter(c => c.cat === cat.id && enPeriodo(c.fecha, de, a)).map(c => valor(c, u)).filter(x => x !== null);
  return vs.length ? vs.reduce((s, x) => s + x, 0) / vs.length : null;
}
function media(u, cols, de, a) {
  let s = 0, w = 0;
  for (const cat of CU.cats) { const m = mediaCat(cat, u, cols, de, a), p = +cat.peso || 0; if (m !== null && p > 0) { s += m * p; w += p; } }
  return w ? s / w : null;
}
const asisDe = (dia, u) => ((CU.asis[dia] || {})[u]) || "p";
function resumenAsis(u, de, a) {
  const r = {f: [], r: [], j: []};
  for (const [dia, m] of Object.entries(CU.asis)) if (enPeriodo(dia, de, a) && m[u] && r[m[u]]) r[m[u]].push(dia);
  for (const k in r) r[k].sort();
  return r;
}
const color = x => x === null ? "" : x < 5 ? "cq-sus" : x < 7 ? "cq-apr" : x < 9 ? "cq-not" : "cq-sob";

/* ---------- guardar ---------- */
function cambio() { pendiente = true; fallo = false; marca("Guardando…"); clearTimeout(tGuardar); tGuardar = setTimeout(guardar, 800); }
async function guardar() {
  clearTimeout(tGuardar);
  if (guardando || !pendiente || !CU) return;
  guardando = true; pendiente = false;
  const {v, t, ...c} = CU, g = G;
  if (c.pts.length > MAXPTS) c.pts = CU.pts = c.pts.slice(-MAXPTS);
  const r = await C().api("admin?t=cuaderno", "POST", {g, c, v: V}).catch(() => ({ok: false, j: {}}));
  guardando = false;
  if (g !== G) return;
  if (r.ok) { V = r.j.v; marca(pendiente ? "Guardando…" : "✓ Guardado"); }
  else if (r.code === 409) { CU = {...NUEVO(), ...r.j.cuaderno}; V = r.j.cuaderno.v || 0; marca("⚠️ Se había cambiado en otro aparato: ya tienes la versión nueva."); pintar(); return; }
  else { pendiente = true; fallo = true; marca(r.j.error === "demasiado_grande" ? "⚠️ El cuaderno está demasiado lleno. Borra columnas o puntos antiguos." : "⚠️ No se ha podido guardar. Lo intento otra vez en unos segundos."); tGuardar = setTimeout(guardar, 8000); return; }
  if (pendiente) tGuardar = setTimeout(guardar, 300);
}
function marca(t) { estado = t; const e = document.getElementById("cq-estado"); if (e) { e.textContent = t; e.classList.toggle("mal", fallo || /^⚠️/.test(t)); } }
addEventListener("beforeunload", e => { if (pendiente || guardando) { guardar(); e.preventDefault(); e.returnValue = ""; } });
addEventListener("pagehide", () => { if (pendiente) guardar(); });

async function abrir(g) {
  if (g === cargadoDe && CU) return true;
  if (pendiente) await guardar();
  const r = await C().api("admin?t=cuaderno&g=" + encodeURIComponent(g)).catch(() => ({ok: false}));
  if (!r.ok) return false;
  const c = r.j.cuaderno || {};
  CU = {...NUEVO(), ...c}; V = c.v || 0; cargadoDe = g; estado = c.t ? "✓ Guardado" : ""; infU = ""; elegido = ""; usadosAzar = new Set();
  return true;
}

/* ---------- pintar ---------- */
const tabDe = () => { const m = location.hash.slice(1).match(/^profe-cuaderno-?([a-z]*)/); return TABS.some(([k]) => k === (m && m[1])) ? m[1] : "notas"; };
async function render(app) {
  appEl = app;
  app.innerHTML = `<section class="wrap pf cq"><p class="pf-migas"><a href="#profe">← Mi clase</a></p><h1 class="pf-h1">📒 Cuaderno de clase</h1><p class="pf-sub">Cargando…</p></section>`;
  D = await P().datos?.().catch(() => null);
  if (!D) { app.querySelector(".pf-sub").textContent = "No se ha podido cargar. Vuelve a entrar en tu cuenta."; return; }
  const gs = Object.keys(D.grupos);
  if (!gs.length) { app.querySelector(".pf-sub").innerHTML = `Primero crea una clase y dales el código a tus alumnos. <button class="btn main" type="button" data-cq="crear-clase">🏫 Crear una clase</button>`; return; }
  const pref = store.get("lyaProfeClase");
  G = D.grupos[pref] ? pref : D.grupos[G] ? G : gs[0];
  if (!(await abrir(G))) { app.querySelector(".pf-sub").textContent = "No se ha podido abrir el cuaderno de esta clase."; return; }
  pintar();
}
function pintar() {
  if (!appEl || !CU) return;
  const tab = tabDe(), gs = Object.entries(D.grupos);
  paraRuido();
  appEl.innerHTML = `<section class="wrap pf cq">
    <p class="pf-migas"><a href="#profe">← Mi clase</a></p>
    <div class="pf-top"><div><h1 class="pf-h1">📒 Cuaderno de clase</h1><p class="pf-sub">${esc(D.grupos[G].nombre)} · ${alumnos().length} alumnos <span id="cq-estado" class="cq-estado">${esc(estado)}</span></p></div>
      <label class="pf-sel">Clase <select id="cqcl">${gs.map(([id, g]) => `<option value="${esc(id)}"${id === G ? " selected" : ""}>${esc(g.nombre)}</option>`).join("")}</select></label></div>
    <nav class="cq-tabs" aria-label="Partes del cuaderno">${TABS.map(([k, n]) => `<a class="btn${k === tab ? " main" : ""}" href="#profe-cuaderno-${k}"${k === tab ? ' aria-current="page"' : ""}>${n}</a>`).join("")}</nav>
    <div id="cq-cont">${!alumnos().length && tab !== "herramientas" ? `<div class="pf-aviso">Esta clase aún no tiene alumnos. Dales el código <b>${esc(D.grupos[G].codigo)}</b>: lo ponen al crear su cuenta o en «Mi cuenta».</div>` : VISTA[tab]()}</div>
  </section>`;
  marca(estado);
  if (tab === "herramientas") pintaReloj();
}
const VISTA = {};

/* ---------- notas ---------- */
VISTA.notas = () => {
  const cols = columnas(), A = alumnos(), quitadas = columnas(true).filter(c => c.auto && (CU.auto[c.d.id] || {}).fuera);
  const cats = CU.cats, sumaP = cats.reduce((s, c) => s + (+c.peso || 0), 0);
  const nomCat = id => (cats.find(c => c.id === id) || {}).n || "";
  return `<div class="cq-bar">
      <button class="btn main" type="button" data-cq="col-nueva">➕ Nueva columna</button>
      <button class="btn" type="button" data-cq="cats">⚖️ Categorías y pesos</button>
      <button class="btn" type="button" data-cq="excel">⬇️ Excel</button>
      <label class="cq-chk"><input type="checkbox" data-cqk="sinHacer0"${CU.sinHacer0 ? " checked" : ""}> Los deberes no hechos a tiempo cuentan un 0</label></div>
    <div id="cq-form">${formNotas === "cats" ? formCats() : formNotas ? formCol(formNotas) : ""}</div>
    <p class="cq-ayuda">Los deberes que mandas desde la web salen solos (📚) con su nota sobre 10. Escribe encima para cambiarla. La media usa los pesos: ${cats.filter(c => +c.peso > 0).map(c => `${esc(c.n)} ${Math.round(100 * c.peso / (sumaP || 1))} %`).join(" · ")}.</p>
    <div class="pf-tb cq-tb"><table class="cq-notas"><thead><tr><th class="cq-fijo">Alumno</th>
      ${cols.map(c => `<th class="cq-col"><span class="cq-cn" title="${esc(c.n)}">${c.auto ? "📚 " : ""}${esc(c.n)}</span><small>${esc(nomCat(c.cat))}${c.fecha ? " · " + esc(fES(c.fecha).slice(0, 5)) : ""}</small>
        <button type="button" class="cq-mini" data-cq="${c.auto ? "auto-edit" : "col-edit"}" data-id="${esc(c.id)}" title="Cambiar">✏️</button></th>`).join("")}
      ${cats.map(c => `<th class="cq-med"><span>Media ${esc(c.n)}</span><small>${Math.round(100 * (+c.peso || 0) / (sumaP || 1))} %</small></th>`).join("")}<th class="cq-med cq-fin">Nota final</th></tr></thead>
      <tbody>${A.map(u => `<tr data-u="${esc(u.usuario)}"><th class="cq-fijo" scope="row">${esc(nom(u.usuario))}</th>
        ${cols.map(c => { const x = puesta(c, u.usuario), au = c.auto ? notaDeber(c.d, u.usuario) : null;
          return `<td><input class="cq-n ${color(x !== null ? x : au)}" inputmode="decimal" autocomplete="off" aria-label="${esc(c.n)} de ${esc(nom(u.usuario))}" data-c="${esc(c.id)}" value="${x !== null ? n1(x) : ""}" placeholder="${au !== null ? n1(au) : "—"}"></td>`; }).join("")}
        ${filaMedias(u.usuario, cols)}</tr>`).join("")}</tbody></table></div>
    ${!cols.length ? `<p class="pf-vacio">Todavía no hay columnas. Manda deberes desde la web o pulsa «➕ Nueva columna» (un examen, un trabajo, el cuaderno…).</p>` : ""}
    ${quitadas.length ? `<details class="cq-quit"><summary>Deberes que has quitado del cuaderno (${quitadas.length})</summary><ul>${quitadas.map(c => `<li>${esc(c.n)} <button type="button" class="btn" data-cq="auto-volver" data-id="${esc(c.d.id)}">Volver a ponerlo</button></li>`).join("")}</ul></details>` : ""}`;
};
const filaMedias = (u, cols) => CU.cats.map(c => { const m = mediaCat(c, u, cols); return `<td class="cq-med ${color(m)}" data-m="${esc(c.id)}">${m === null ? "—" : n1(m)}</td>`; }).join("")
  + (m => `<td class="cq-med cq-fin ${color(m)}" data-m="fin">${m === null ? "—" : n1(m)}</td>`)(media(u, cols));
function formCol(idc) {
  const nueva = idc === "nueva", c = nueva ? {n: "", cat: (CU.cats.find(x => x.id === "examenes") || CU.cats.find(x => !x.puntos) || {}).id, fecha: hoyS()} : CU.cols.find(x => x.id === idc) || {};
  return `<form class="cq-form" data-cqf="col" data-id="${esc(idc)}"><h3>${nueva ? "➕ Nueva columna" : "✏️ Cambiar la columna"}</h3>
    <label>Nombre <input name="n" required maxlength="40" value="${esc(c.n)}" placeholder="Examen tema 3"></label>
    <label>Categoría <select name="cat">${CU.cats.filter(x => !x.puntos).map(x => `<option value="${esc(x.id)}"${x.id === c.cat ? " selected" : ""}>${esc(x.n)}</option>`).join("")}</select></label>
    <label>Fecha <input type="date" name="fecha" value="${esc(c.fecha || "")}"></label>
    <div class="cq-fbt"><button class="btn main" type="submit">💾 Guardar</button> <button class="btn" type="button" data-cq="form-cerrar">Cancelar</button>${nueva ? "" : ` <button class="btn cq-borrar" type="button" data-cq="col-borrar" data-id="${esc(idc)}">🗑️ Borrar la columna y sus notas</button>`}</div></form>`;
}
function formAuto(id) {
  const d = deberes().find(x => x.id === id); if (!d) return "";
  const a = CU.auto[id] || {};
  return `<form class="cq-form" data-cqf="auto" data-id="${esc(id)}"><h3>📚 ${esc((P().nomDeber || (x => x.titulo))(d))}</h3><p class="cq-ayuda">Es un deber de la web: la nota sale sola. Aquí eliges en qué categoría cuenta.</p>
    <label>Categoría <select name="cat">${CU.cats.filter(x => !x.puntos).map(x => `<option value="${esc(x.id)}"${x.id === catDe(a.cat || "deberes") ? " selected" : ""}>${esc(x.n)}</option>`).join("")}</select></label>
    <div class="cq-fbt"><button class="btn main" type="submit">💾 Guardar</button> <button class="btn" type="button" data-cq="form-cerrar">Cancelar</button> <button class="btn cq-borrar" type="button" data-cq="auto-quitar" data-id="${esc(id)}">🙈 Que no cuente en el cuaderno</button></div></form>`;
}
let borrC = null, borrH = null;  /* borradores mientras se edita (no cuentan hasta pulsar Guardar) */
function formCats(L = borrC || CU.cats) {
  return `<form class="cq-form" data-cqf="cats"><h3>⚖️ Categorías y pesos</h3><p class="cq-ayuda">El peso es lo que cuenta cada categoría en la nota final. Si un alumno no tiene notas en una categoría, se reparte entre las demás.</p>
    <div class="cq-cats">${L.map((c, i) => `<div class="cq-cat" data-i="${i}"><input name="n" maxlength="30" value="${esc(c.n)}" aria-label="Nombre de la categoría"><label class="cq-peso"><input name="peso" type="number" min="0" max="100" value="${+c.peso || 0}" aria-label="Peso"> %</label>
      <label class="cq-chk"><input type="radio" name="puntos" value="${i}"${c.puntos ? " checked" : ""}> Con los puntos de comportamiento</label><button type="button" class="cq-mini" data-cq="cat-borrar" data-i="${i}" title="Borrar">🗑️</button></div>`).join("")}</div>
    <label class="cq-chk"><input type="radio" name="puntos" value="-1"${L.some(c => c.puntos) ? "" : " checked"}> Los puntos de comportamiento no cuentan en la nota</label>
    <div class="cq-fbt"><button class="btn" type="button" data-cq="cat-nueva">➕ Otra categoría</button> <button class="btn main" type="submit">💾 Guardar</button> <button class="btn" type="button" data-cq="form-cerrar">Cancelar</button></div></form>`;
}
function leerCats(f, L = borrC || CU.cats) {
  const marcado = +((f.querySelector("[name=puntos]:checked") || {}).value ?? -1);
  return [...f.querySelectorAll(".cq-cat")].map(el => { const i = +el.dataset.i, c = L[i] || {id: "c" + id6()}; return {id: c.id, n: el.querySelector("[name=n]").value.trim().slice(0, 30) || "Sin nombre", peso: Math.max(0, Math.min(100, +el.querySelector("[name=peso]").value || 0)), ...(marcado === i ? {puntos: true} : {})}; });
}
function excel() {
  const cols = columnas(), q = v => { const s = String(v ?? ""); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const filas = [["Alumno", "Usuario", ...cols.map(c => c.n + (c.fecha ? ` (${fES(c.fecha)})` : "")), ...CU.cats.map(c => `Media ${c.n} (${c.peso} %)`), "Nota final", "Faltas", "Retrasos", "Faltas justificadas", "Puntos +", "Puntos −"]];
  const hv = Object.fromEntries(CU.hab.map(h => [h.id, h.v]));
  for (const u of alumnos()) { const x = u.usuario, as = resumenAsis(x), ps = puntosDe(x);
    filas.push([nom(x), x, ...cols.map(c => n1(valor(c, x))), ...CU.cats.map(c => n1(mediaCat(c, x, cols))), n1(media(x, cols)), as.f.length, as.r.length, as.j.length, ps.filter(p => hv[p.h] > 0).length, ps.filter(p => hv[p.h] < 0).length]); }
  const csv = "﻿" + filas.map(r => r.map(q).join(";")).join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], {type: "text/csv;charset=utf-8"}));
  a.download = `cuaderno-${D.grupos[G].nombre.replace(/[^\wñáéíóúàèòïüç-]+/gi, "-")}-${hoyS()}.csv`; document.body.appendChild(a); a.click(); a.remove();
}

/* ---------- pasar lista y puntos ---------- */
VISTA.lista = () => {
  const A = alumnos(), m = CU.asis[diaL] || {}, cuenta = {p: 0, f: 0, r: 0, j: 0};
  for (const u of A) cuenta[m[u.usuario] || "p"]++;
  const hoyP = CU.pts.filter(p => p.d === diaL);
  return `<div class="cq-bar"><label class="cq-dia">Día <input type="date" id="cqdia" value="${esc(diaL)}" max="${hoyS()}"></label>
      <button class="btn" type="button" data-cq="todos-presentes">✅ Todos presentes</button>
      <button class="btn" type="button" data-cq="deshacer"${hoyP.length ? "" : " disabled"}>↩️ Deshacer el último punto</button>
      <button class="btn" type="button" data-cq="habs">⭐ Cambiar las habilidades</button></div>
    <div id="cq-form">${formNotas === "habs" ? formHabs() : ""}</div>
    <p class="cq-resumen">${Object.entries(ASIS).map(([k, [ic, , pl]]) => `${ic} ${cuenta[k]} ${cuenta[k] === 1 ? ASIS1[k] : pl}`).join(" · ")}</p>
    <div class="cq-todos"><span>Para toda la clase (los presentes):</span>${CU.hab.map(h => `<button type="button" class="cq-hab ${h.v > 0 ? "bien" : "mal"}" data-cq="punto-todos" data-h="${esc(h.id)}" title="${esc(h.n)} a toda la clase">${h.ic}</button>`).join("")}</div>
    <ul class="cq-lista">${A.map(u => { const x = u.usuario, a = m[x] || "p", ps = hoyP.filter(p => p.u === x);
      return `<li class="cq-al asis-${a}" data-u="${esc(x)}"><b class="cq-aln">${esc(nom(x))}</b>
        <span class="cq-asis" role="group" aria-label="Asistencia">${Object.entries(ASIS).map(([k, [ic, n]]) => `<button type="button" data-cq="asis" data-a="${k}" aria-pressed="${a === k}" title="${ASIS1[k]}">${ic}<span>${n}</span></button>`).join("")}</span>
        <span class="cq-habs">${CU.hab.map(h => { const n = ps.filter(p => p.h === h.id).length; return `<button type="button" class="cq-hab ${h.v > 0 ? "bien" : "mal"}" data-cq="punto" data-h="${esc(h.id)}" title="${esc(h.n)}">${h.ic}${n ? `<i>${n}</i>` : ""}</button>`; }).join("")}</span>
        <span class="cq-net">${netoTxt(ps)}</span></li>`; }).join("")}</ul>
    <p class="cq-ayuda">${CU.hab.map(h => `${h.ic} ${esc(h.n)}`).join(" · ")}</p>`;
};
const netoTxt = ps => { const hv = Object.fromEntries(CU.hab.map(h => [h.id, h.v])), pos = ps.filter(p => hv[p.h] > 0).length, neg = ps.filter(p => hv[p.h] < 0).length; return pos || neg ? `<b class="bien">+${pos}</b> <b class="mal">−${neg}</b>` : ""; };
function formHabs(L = borrH || CU.hab) {
  return `<form class="cq-form" data-cqf="habs"><h3>⭐ Habilidades</h3><p class="cq-ayuda">Las verdes suman y las rojas restan. Pon un emoji y un nombre corto.</p>
    <div class="cq-cats">${L.map((h, i) => `<div class="cq-cat" data-i="${i}"><input name="ic" maxlength="4" value="${esc(h.ic)}" class="cq-ic" aria-label="Emoji"><input name="n" maxlength="30" value="${esc(h.n)}" aria-label="Nombre">
      <select name="v" aria-label="Suma o resta"><option value="1"${h.v > 0 ? " selected" : ""}>👍 Suma</option><option value="-1"${h.v < 0 ? " selected" : ""}>👎 Resta</option></select><button type="button" class="cq-mini" data-cq="hab-borrar" data-i="${i}" title="Borrar">🗑️</button></div>`).join("")}</div>
    <div class="cq-fbt"><button class="btn" type="button" data-cq="hab-nueva">➕ Otra habilidad</button> <button class="btn main" type="submit">💾 Guardar</button> <button class="btn" type="button" data-cq="form-cerrar">Cancelar</button></div></form>`;
}
const leerHabs = (f, L = borrH || CU.hab) => [...f.querySelectorAll(".cq-cat")].map(el => { const h = L[+el.dataset.i] || {id: "h" + id6()}; return {id: h.id, ic: el.querySelector("[name=ic]").value.trim().slice(0, 4) || "⭐", n: el.querySelector("[name=n]").value.trim().slice(0, 30) || "Sin nombre", v: +el.querySelector("[name=v]").value < 0 ? -1 : 1}; });
function ponAsis(dia, u, a) { const m = CU.asis[dia] ||= {}; if (a === "p") delete m[u]; else m[u] = a; if (!Object.keys(m).length) delete CU.asis[dia]; cambio(); }
function darPunto(u, h, dia = diaL) { CU.pts.push({u, h, d: dia, t: Date.now()}); cambio(); }

/* ---------- plano de clase ---------- */
VISTA.plano = () => {
  const {f, c, s} = CU.plano, porSitio = {}, A = alumnos(), dia = hoyS(), m = CU.asis[dia] || {};
  for (const [u, i] of Object.entries(s)) if (A.some(a => a.usuario === u)) porSitio[i] = u;
  const sueltos = A.filter(a => s[a.usuario] === undefined || porSitio[s[a.usuario]] !== a.usuario);
  const hoyP = CU.pts.filter(p => p.d === dia);
  return `<div class="cq-bar"><span class="seg cq-modo" role="group" aria-label="Qué hace un toque">${[["lista", "✅ Pasar lista"], ["puntos", "⭐ Dar puntos"], ["colocar", "🪑 Colocar"]].map(([k, n]) => `<button type="button" data-cq="modo" data-m="${k}" aria-pressed="${modoPlano === k}">${n}</button>`).join("")}</span>
      <label class="cq-dia">Filas <input type="number" id="cqf" min="1" max="10" value="${f}"></label><label class="cq-dia">Mesas por fila <input type="number" id="cqc" min="1" max="10" value="${c}"></label>
      ${modoPlano === "colocar" ? `<button class="btn" type="button" data-cq="plano-azar">🎲 Colocar al azar</button> <button class="btn" type="button" data-cq="plano-vaciar">🧹 Vaciar</button>` : ""}</div>
    <p class="cq-ayuda">${modoPlano === "lista" ? `Toca una mesa para cambiar: ✅ presente → ❌ falta → ⏰ retraso → 📄 justificada. Es la lista de hoy (${fES(dia)}).` : modoPlano === "puntos" ? "Toca una mesa y elige la habilidad." : elegido ? `Ahora toca la mesa de <b>${esc(nom(elegido))}</b>.` : "Toca un nombre de abajo (o una mesa ocupada) y luego la mesa donde se sienta."}</p>
    <div class="cq-pizarra">Pizarra</div>
    <div class="cq-plano" style="--c:${c}">${Array.from({length: f * c}, (_, i) => { const u = porSitio[i], a = u ? m[u] || "p" : "";
      return `<button type="button" class="cq-sitio${u ? " ocupado asis-" + a : ""}${u && u === elegido ? " elegido" : ""}" data-cq="sitio" data-i="${i}" aria-label="${u ? esc(nom(u)) : "Mesa vacía"}">${u ? `<b>${esc(nom(u))}</b><small>${ASIS[a][0]} ${netoTxt(hoyP.filter(p => p.u === u))}</small>` : "<small>·</small>"}</button>`; }).join("")}</div>
    ${popSitio >= 0 && porSitio[popSitio] && modoPlano === "puntos" ? `<div class="cq-pop" role="dialog" aria-label="Dar un punto"><b>${esc(nom(porSitio[popSitio]))}</b><span>${CU.hab.map(h => `<button type="button" class="cq-hab ${h.v > 0 ? "bien" : "mal"}" data-cq="punto-plano" data-u="${esc(porSitio[popSitio])}" data-h="${esc(h.id)}" title="${esc(h.n)}">${h.ic}<small>${esc(h.n)}</small></button>`).join("")}</span><button type="button" class="btn" data-cq="pop-cerrar">Cerrar</button></div>` : ""}
    ${sueltos.length ? `<h3 class="cq-h3">Sin mesa (${sueltos.length})</h3><p class="cq-sueltos">${sueltos.map(a => `<button type="button" class="cq-chip${a.usuario === elegido ? " elegido" : ""}" data-cq="suelto" data-u="${esc(a.usuario)}">${esc(nom(a.usuario))}</button>`).join("")}</p>` : ""}`;
};
function tocarSitio(i) {
  const {s} = CU.plano, A = new Set(alumnos().map(a => a.usuario)), u = Object.keys(s).find(k => s[k] === i && A.has(k));
  if (modoPlano === "lista") { if (!u) return; const orden = ["p", "f", "r", "j"], a = asisDe(hoyS(), u); ponAsis(hoyS(), u, orden[(orden.indexOf(a) + 1) % 4]); return pintar(); }
  if (modoPlano === "puntos") { popSitio = u ? i : -1; return pintar(); }
  if (elegido) { const antes = s[elegido]; if (u && u !== elegido) { if (antes !== undefined) s[u] = antes; else delete s[u]; } s[elegido] = i; elegido = ""; cambio(); }
  else if (u) elegido = u;
  pintar();
}

/* ---------- herramientas de clase ---------- */
let usadosAzar = new Set(), reloj = {fin: 0, resto: 300e3, va: false, tot: 300e3}, tReloj = 0, ruido = null;
VISTA.herramientas = () => `<div class="cq-herr">
  <section class="pf-box cq-tool" id="cq-azar"><h2>🎲 Alumno al azar</h2>
    <div class="cq-grande" id="cq-azar-n" aria-live="polite">¿Quién será?</div>
    <p><label class="cq-chk"><input type="checkbox" id="cq-az-pres" checked> Solo los presentes hoy</label> <label class="cq-chk"><input type="checkbox" id="cq-az-rep" checked> Sin repetir hasta que salgan todos</label></p>
    <p><button class="btn main" type="button" data-cq="azar">🎲 ¡Elegir!</button> <button class="btn" type="button" data-cq="pantalla" data-t="cq-azar">⛶ Pantalla completa</button></p></section>
  <section class="pf-box cq-tool" id="cq-grupos"><h2>👥 Hacer grupos</h2>
    <p class="cq-gform"><select id="cq-g-modo"><option value="tam">Grupos de</option><option value="num">Hacer</option></select> <input type="number" id="cq-g-n" min="2" max="15" value="4" aria-label="Número"> <span id="cq-g-txt">alumnos</span>
      <label class="cq-chk"><input type="checkbox" id="cq-g-pres" checked> Solo los presentes</label></p>
    <p><button class="btn main" type="button" data-cq="grupos">👥 Hacer grupos</button> <button class="btn" type="button" data-cq="pantalla" data-t="cq-grupos">⛶ Pantalla completa</button></p>
    <div id="cq-g-out" class="cq-gout"></div></section>
  <section class="pf-box cq-tool" id="cq-reloj"><h2>⏱️ Temporizador</h2>
    <div class="cq-grande cq-tiempo" id="cq-r-t">5:00</div><div class="pf-jb cq-rbar"><i id="cq-r-b"></i></div>
    <p class="cq-presets">${[1, 2, 3, 5, 10, 15].map(m => `<button class="btn" type="button" data-cq="reloj-pon" data-m="${m}">${m} min</button>`).join("")} <button class="btn" type="button" data-cq="reloj-mas">+1 min</button></p>
    <p><button class="btn main" type="button" data-cq="reloj-va" id="cq-r-va">▶️ Empezar</button> <button class="btn" type="button" data-cq="reloj-cero">↺ Reiniciar</button> <button class="btn" type="button" data-cq="pantalla" data-t="cq-reloj">⛶ Pantalla completa</button></p></section>
  <section class="pf-box cq-tool" id="cq-ruido"><h2>🔊 Medidor de ruido</h2>
    <div class="cq-grande" id="cq-ru-e">🤫</div><div class="cq-rubar"><i id="cq-ru-b"></i><span id="cq-ru-l" style="left:60%"></span></div>
    <p><label>Límite <input type="range" id="cq-ru-lim" min="10" max="95" value="60"></label> <span id="cq-ru-msg" class="cq-ayuda"></span></p>
    <p><button class="btn main" type="button" data-cq="ruido">🎤 Empezar a escuchar</button> <button class="btn" type="button" data-cq="pantalla" data-t="cq-ruido">⛶ Pantalla completa</button></p>
    <p class="cq-ayuda">Usa el micrófono del aparato. No se graba nada y el sonido no sale de aquí.</p></section>
</div>`;
function candidatos(pres) { const A = alumnos().map(a => a.usuario), m = CU.asis[hoyS()] || {}; return pres ? A.filter(u => !["f", "j"].includes(m[u])) : A; }
function azar() {
  const el = document.getElementById("cq-azar-n"); let lista = candidatos(document.getElementById("cq-az-pres").checked);
  if (!lista.length) { el.textContent = "No hay alumnos"; return; }
  const rep = document.getElementById("cq-az-rep").checked;
  if (rep) { let q = lista.filter(u => !usadosAzar.has(u)); if (!q.length) { usadosAzar = new Set(); q = lista; } lista = q; }
  const gana = lista[Math.floor(Math.random() * lista.length)]; if (rep) usadosAzar.add(gana);
  let n = 0; el.classList.add("girando");
  const t = setInterval(() => { el.textContent = nom(lista[Math.floor(Math.random() * lista.length)]); if (++n > 14) { clearInterval(t); el.textContent = "🎉 " + nom(gana); el.classList.remove("girando"); } }, 70);
}
function hacerGrupos() {
  const lista = mezcla(candidatos(document.getElementById("cq-g-pres").checked)), n = Math.max(2, +document.getElementById("cq-g-n").value || 2);
  const k = document.getElementById("cq-g-modo").value === "num" ? Math.min(n, lista.length) : Math.max(1, Math.round(lista.length / n));
  const gs = Array.from({length: k}, () => []); lista.forEach((u, i) => gs[i % k].push(u));
  document.getElementById("cq-g-out").innerHTML = lista.length ? gs.map((g, i) => `<div class="cq-grupo"><b>Grupo ${i + 1}</b>${g.map(u => `<span>${esc(nom(u))}</span>`).join("")}</div>`).join("") : `<p class="pf-vacio">No hay alumnos.</p>`;
}
const mmss = ms => { const s = Math.ceil(Math.max(0, ms) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
function pintaReloj() {
  const t = document.getElementById("cq-r-t"); if (!t) return;
  const resto = reloj.va ? reloj.fin - Date.now() : reloj.resto;
  t.textContent = mmss(resto); t.classList.toggle("fin", resto <= 0);
  document.getElementById("cq-r-b").style.width = `${Math.max(0, 100 * resto / reloj.tot)}%`;
  document.getElementById("cq-r-va").textContent = reloj.va ? "⏸️ Pausa" : "▶️ Empezar";
}
function tic() {
  if (!reloj.va) return;
  if (reloj.fin - Date.now() <= 0) { reloj.va = false; reloj.resto = 0; clearInterval(tReloj); pita(); }
  pintaReloj();
}
function pita() { try { const ac = new (window.AudioContext || window.webkitAudioContext)(); [0, .35, .7].forEach(w => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ac.destination); g.gain.setValueAtTime(.25, ac.currentTime + w); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + w + .3); o.start(ac.currentTime + w); o.stop(ac.currentTime + w + .3); }); setTimeout(() => ac.close(), 1500); } catch (e) {} }
async function empiezaRuido(btn) {
  if (ruido) { paraRuido(); btn.textContent = "🎤 Empezar a escuchar"; return; }
  const msg = document.getElementById("cq-ru-msg");
  try {
    const st = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: false, noiseSuppression: false}});
    const ac = new (window.AudioContext || window.webkitAudioContext)(), an = ac.createAnalyser(); an.fftSize = 1024; ac.createMediaStreamSource(st).connect(an);
    const buf = new Float32Array(an.fftSize); let alto = 0, avisos = 0;
    ruido = {st, ac, raf: 0};
    const paso = () => {
      const e = document.getElementById("cq-ru-b"); if (!e || !ruido) return paraRuido();
      an.getFloatTimeDomainData(buf); let s = 0; for (const x of buf) s += x * x;
      const db = 20 * Math.log10(Math.sqrt(s / buf.length) || 1e-8), nivel = Math.max(0, Math.min(100, (db + 60) * 100 / 55));  /* −60 dB → 0, −5 dB → 100 */
      const lim = +document.getElementById("cq-ru-lim").value; document.getElementById("cq-ru-l").style.left = lim + "%";
      e.style.width = nivel + "%"; e.className = nivel > lim ? "mal" : nivel > lim * .75 ? "medio" : "";
      alto = nivel > lim ? alto + 1 : Math.max(0, alto - 2);
      if (alto === 40) { avisos++; msg.textContent = `¡Demasiado ruido! (${avisos} ${avisos === 1 ? "vez" : "veces"})`; }
      document.getElementById("cq-ru-e").textContent = nivel > lim ? "🙉" : nivel > lim * .75 ? "😬" : nivel > lim * .35 ? "🙂" : "🤫";
      ruido.raf = requestAnimationFrame(paso);
    };
    btn.textContent = "⏹️ Parar"; msg.textContent = ""; paso();
  } catch (e) { msg.textContent = "No se ha podido usar el micrófono. Dale permiso en el navegador."; }
}
function paraRuido() { if (!ruido) return; cancelAnimationFrame(ruido.raf); ruido.st.getTracks().forEach(t => t.stop()); ruido.ac.close().catch(() => {}); ruido = null; }

/* ---------- informes ---------- */
VISTA.informes = () => {
  const A = alumnos(); if (!infU || !A.some(a => a.usuario === infU)) infU = A[0]?.usuario || "";
  return `<div class="cq-bar"><label class="pf-sel">Alumno <select id="cq-inf-u">${A.map(a => `<option value="${esc(a.usuario)}"${a.usuario === infU ? " selected" : ""}>${esc(nom(a.usuario))}</option>`).join("")}</select></label>
      <label class="cq-dia">Desde <input type="date" id="cq-inf-de" value="${esc(infDe)}"></label><label class="cq-dia">Hasta <input type="date" id="cq-inf-a" value="${esc(infA)}"></label></div>
    <div class="cq-bar"><button class="btn main" type="button" data-cq="imprimir">🖨️ Imprimir o guardar en PDF</button> <button class="btn" type="button" data-cq="imprimir-todos">🖨️ Los de toda la clase (uno por hoja)</button></div>
    <div class="pf-box cq-inf-edit"><label>Nombre en los informes <input id="cq-inf-nom" maxlength="60" value="${esc((CU.nom || {})[infU] || "")}" placeholder="${esc(infU)}"></label>
      <label>Comentario para la familia <textarea id="cq-inf-obs" rows="3" maxlength="1500" placeholder="Lo que quieras contar: cómo va, en qué puede mejorar, qué le sale muy bien…">${esc((CU.obs || {})[infU] || "")}</textarea></label></div>
    <div class="cq-hoja" id="cq-hoja">${infU ? informe(infU) : ""}</div>`;
};
function informe(x) {
  const u = alumnos().find(a => a.usuario === x) || {}, cols = columnas().filter(c => enPeriodo(c.fecha, infDe, infA)), as = resumenAsis(x, infDe, infA), ps = puntosDe(x, infDe, infA);
  const fin = media(x, columnas(), infDe, infA), dbs = deberes().filter(d => enPeriodo(d.limite, infDe, infA)), mios = dbs.map(d => d.alumnos.find(a => a.usuario === x)).filter(Boolean);
  const hechos = mios.filter(a => a.hecho).length;
  const notasCat = CU.cats.map(c => ({c, m: mediaCat(c, x, columnas(), infDe, infA), cs: cols.filter(k => k.cat === c.id && valor(k, x) !== null)}));
  const obs = (CU.obs || {})[x];
  return `<article class="cq-inf">
    <header><p class="cq-inf-web">COMPRENDO · Informe para la familia</p><h2>${esc(nom(x))}</h2><p>${esc(D.grupos[G].nombre)} · del ${fES(infDe)} al ${fES(infA)}</p></header>
    <section><h3>📊 Notas</h3><table class="cq-inf-tb"><thead><tr><th>Categoría</th><th>Cuenta</th><th>Notas</th><th>Media</th></tr></thead><tbody>
      ${notasCat.filter(({c}) => +c.peso > 0).map(({c, m, cs}) => `<tr><td>${esc(c.n)}</td><td>${c.peso} %</td><td class="cq-inf-ns">${c.puntos ? `${ps.length} puntos de comportamiento` : cs.map(k => `${esc(k.n)}: <b>${n1(valor(k, x))}</b>`).join(" · ") || "—"}</td><td><b>${m === null ? "—" : n1(m)}</b></td></tr>`).join("")}
      </tbody><tfoot><tr><th colspan="3">Nota media</th><th class="${color(fin)}">${fin === null ? "—" : n1(fin)}</th></tr></tfoot></table></section>
    <div class="cq-inf-2">
    <section><h3>📚 Deberes de la web</h3><p>${mios.length ? `Ha hecho <b>${hechos} de ${mios.length}</b> deberes.` : "No ha tenido deberes en estas fechas."}</p></section>
    <section><h3>✅ Asistencia</h3><p>${as.f.length || as.r.length || as.j.length ? `${as.f.length} ${as.f.length === 1 ? "falta" : "faltas"} · ${as.r.length} ${as.r.length === 1 ? "retraso" : "retrasos"} · ${as.j.length} ${as.j.length === 1 ? "falta justificada" : "faltas justificadas"}` : "Ninguna falta ni retraso."}</p>
      ${as.f.length ? `<p class="cq-inf-peq">Faltas: ${as.f.map(fES).join(", ")}</p>` : ""}${as.r.length ? `<p class="cq-inf-peq">Retrasos: ${as.r.map(fES).join(", ")}</p>` : ""}</section>
    <section><h3>⭐ Comportamiento</h3>${ps.length ? `<ul class="cq-inf-habs">${CU.hab.map(h => ({h, n: ps.filter(p => p.h === h.id).length})).filter(y => y.n).sort((a, b) => b.h.v - a.h.v || b.n - a.n).map(({h, n}) => `<li class="${h.v > 0 ? "bien" : "mal"}">${h.ic} ${esc(h.n)}: <b>${n}</b></li>`).join("")}</ul>` : "<p>Sin puntos en estas fechas.</p>"}</section>
    <section><h3>📖 En la web</h3><p>${u.xp || 0} XP · ${u.terminadas || 0} lecturas terminadas · ${u.estrellas || 0} ⭐ · racha de ${u.racha || 0} días</p></section>
    </div>
    ${obs ? `<section><h3>💬 Comentario del profe</h3><p class="cq-inf-obs">${esc(obs).replace(/\n/g, "<br>")}</p></section>` : ""}
    <footer><span>Fecha: ${fES(hoyS())}</span><span>Firma del profe:</span><span>Firma de la familia:</span></footer>
  </article>`;
}
function imprimir(xs) {
  let caja = document.getElementById("cq-print"); if (!caja) { caja = document.createElement("div"); caja.id = "cq-print"; document.body.appendChild(caja); }
  caja.innerHTML = xs.map(informe).join("");
  document.documentElement.classList.add("cq-imprimiendo");
  const fin = () => { document.documentElement.classList.remove("cq-imprimiendo"); caja.innerHTML = ""; removeEventListener("afterprint", fin); };
  addEventListener("afterprint", fin);
  setTimeout(() => { print(); setTimeout(() => { if (!matchMedia("print").matches) fin(); }, 500); }, 50);
}

/* ---------- eventos ---------- */
const dentro = e => e.target.closest?.(".cq");
document.addEventListener("click", e => {
  const b = e.target.closest("[data-cq]"); if (!b || !dentro(e)) return;
  const a = b.dataset.cq, li = b.closest("[data-u]"), u = li && li.dataset.u;
  switch (a) {
    case "crear-clase": return C().panel?.("clases");
    case "col-nueva": formNotas = "nueva"; return pintar();
    case "col-edit": formNotas = b.dataset.id; return pintar();
    case "auto-edit": { formNotas = ""; pintar(); document.getElementById("cq-form").innerHTML = formAuto(b.dataset.id.slice(2)); document.querySelector("#cq-form select")?.focus(); return; }
    case "cats": borrC = null; formNotas = formNotas === "cats" ? "" : "cats"; return pintar();
    case "habs": borrH = null; formNotas = formNotas === "habs" ? "" : "habs"; return pintar();
    case "form-cerrar": formNotas = ""; borrC = borrH = null; return pintar();
    case "col-borrar": if (!confirm("¿Borrar esta columna y todas sus notas?")) return; CU.cols = CU.cols.filter(c => c.id !== b.dataset.id); delete CU.notas[b.dataset.id]; formNotas = ""; cambio(); return pintar();
    case "auto-quitar": (CU.auto[b.dataset.id] ||= {}).fuera = true; formNotas = ""; cambio(); return pintar();
    case "auto-volver": if (CU.auto[b.dataset.id]) delete CU.auto[b.dataset.id].fuera; cambio(); return pintar();
    case "cat-nueva": case "cat-borrar": { const cs = leerCats(b.closest("form")); if (a === "cat-nueva") cs.push({id: "c" + id6(), n: "", peso: 0}); else cs.splice(+b.dataset.i, 1);
      borrC = cs; document.getElementById("cq-form").innerHTML = formCats(); if (a === "cat-nueva") document.querySelector(".cq-cat:last-of-type [name=n]")?.focus(); return; }
    case "hab-nueva": case "hab-borrar": { const hs = leerHabs(b.closest("form")); if (a === "hab-nueva") hs.push({id: "h" + id6(), ic: "⭐", n: "", v: 1}); else hs.splice(+b.dataset.i, 1);
      borrH = hs; document.getElementById("cq-form").innerHTML = formHabs(); if (a === "hab-nueva") document.querySelector(".cq-cat:last-of-type [name=n]")?.focus(); return; }
    case "excel": return excel();
    case "todos-presentes": delete CU.asis[diaL]; cambio(); return pintar();
    case "asis": ponAsis(diaL, u, b.dataset.a); return pintar();
    case "punto": darPunto(u, b.dataset.h); return pintar();
    case "punto-todos": { const m = CU.asis[diaL] || {}; for (const x of alumnos()) if (!["f", "j"].includes(m[x.usuario])) CU.pts.push({u: x.usuario, h: b.dataset.h, d: diaL, t: Date.now()}); cambio(); return pintar(); }
    case "deshacer": { for (let i = CU.pts.length - 1; i >= 0; i--) if (CU.pts[i].d === diaL) { CU.pts.splice(i, 1); break; } cambio(); return pintar(); }
    case "modo": modoPlano = b.dataset.m; elegido = ""; popSitio = -1; return pintar();
    case "sitio": return tocarSitio(+b.dataset.i);
    case "suelto": elegido = elegido === b.dataset.u ? "" : b.dataset.u; return pintar();
    case "punto-plano": darPunto(b.dataset.u, b.dataset.h, hoyS()); popSitio = -1; return pintar();
    case "pop-cerrar": popSitio = -1; return pintar();
    case "plano-azar": { const {f, c} = CU.plano, sitios = mezcla([...Array(f * c).keys()]); CU.plano.s = {}; mezcla(alumnos()).forEach((x, i) => { if (i < sitios.length) CU.plano.s[x.usuario] = sitios[i]; }); cambio(); return pintar(); }
    case "plano-vaciar": if (!confirm("¿Quitar a todos de sus mesas?")) return; CU.plano.s = {}; elegido = ""; cambio(); return pintar();
    case "azar": return azar();
    case "grupos": return hacerGrupos();
    case "pantalla": { const el = document.getElementById(b.dataset.t); if (document.fullscreenElement) document.exitFullscreen?.(); else el?.requestFullscreen?.().catch(() => {}); return; }
    case "reloj-pon": reloj = {va: false, resto: +b.dataset.m * 60e3, tot: +b.dataset.m * 60e3, fin: 0}; clearInterval(tReloj); return pintaReloj();
    case "reloj-mas": if (reloj.va) reloj.fin += 60e3; else reloj.resto += 60e3; reloj.tot += 60e3; return pintaReloj();
    case "reloj-va": if (reloj.va) { reloj.resto = reloj.fin - Date.now(); reloj.va = false; clearInterval(tReloj); } else if (reloj.resto > 0) { reloj.fin = Date.now() + reloj.resto; reloj.va = true; clearInterval(tReloj); tReloj = setInterval(tic, 250); } return pintaReloj();
    case "reloj-cero": clearInterval(tReloj); reloj = {va: false, resto: reloj.tot, tot: reloj.tot, fin: 0}; return pintaReloj();
    case "ruido": return empiezaRuido(b);
    case "imprimir": return imprimir([infU]);
    case "imprimir-todos": return imprimir(alumnos().map(x => x.usuario));
  }
});
document.addEventListener("submit", e => {
  const f = e.target.closest?.("[data-cqf]"); if (!f || !dentro(e)) return;
  e.preventDefault();
  const k = f.dataset.cqf;
  if (k === "col") {
    const n = f.n.value.trim().slice(0, 40); if (!n) return;
    const c = {n, cat: f.cat.value, fecha: /^\d{4}-\d{2}-\d{2}$/.test(f.fecha.value) ? f.fecha.value : ""};
    if (f.dataset.id === "nueva") CU.cols.push({id: "c" + id6(), ...c}); else Object.assign(CU.cols.find(x => x.id === f.dataset.id) || {}, c);
  } else if (k === "auto") (CU.auto[f.dataset.id] ||= {}).cat = f.cat.value;
  else if (k === "cats") { const cs = leerCats(f); if (!cs.length) return alert("Tiene que haber al menos una categoría."); CU.cats = cs; }
  else if (k === "habs") { const hs = leerHabs(f); if (!hs.length) return alert("Tiene que haber al menos una habilidad."); CU.hab = hs; }
  borrC = borrH = null; formNotas = ""; cambio(); pintar();
});
document.addEventListener("change", e => {
  const el = e.target; if (!dentro(e)) return;
  if (el.id === "cqcl") { store.set("lyaProfeClase", el.value); (async () => { G = el.value; if (await abrir(G)) pintar(); })(); return; }
  if (el.dataset.cqk === "sinHacer0") { CU.sinHacer0 = el.checked; cambio(); return pintar(); }
  if (el.id === "cqdia") { diaL = el.value || hoyS(); return pintar(); }
  if (el.id === "cqf" || el.id === "cqc") { const v = Math.max(1, Math.min(10, +el.value || 1)); CU.plano[el.id === "cqf" ? "f" : "c"] = v; const max = CU.plano.f * CU.plano.c; for (const k in CU.plano.s) if (CU.plano.s[k] >= max) delete CU.plano.s[k]; cambio(); return pintar(); }
  if (el.id === "cq-g-modo") { document.getElementById("cq-g-txt").textContent = el.value === "num" ? "grupos" : "alumnos"; return; }
  if (el.id === "cq-inf-u") { infU = el.value; return pintar(); }
  if (el.id === "cq-inf-de" || el.id === "cq-inf-a") { if (el.id === "cq-inf-de") infDe = el.value; else infA = el.value; document.getElementById("cq-hoja").innerHTML = informe(infU); return; }
  if (el.classList.contains("cq-n")) {
    const x = leerN(el.value), tr = el.closest("tr"), u = tr.dataset.u, c = el.dataset.c;
    if (Number.isNaN(x)) { el.value = ""; el.classList.add("cq-malo"); setTimeout(() => el.classList.remove("cq-malo"), 1200); return; }
    const m = CU.notas[c] ||= {}; if (x === null) delete m[u]; else m[u] = x; if (!Object.keys(m).length) delete CU.notas[c];
    if (x !== null) el.value = n1(x);
    const col = columnas().find(k => k.id === c), au = col && col.auto ? notaDeber(col.d, u) : null;
    el.className = `cq-n ${color(x !== null ? x : au)}`;
    const tmp = document.createElement("tbody"); tmp.innerHTML = `<tr>${filaMedias(u, columnas())}</tr>`;
    tr.querySelectorAll("[data-m]").forEach((td, i) => td.replaceWith(tmp.firstElementChild.children[0]));
    cambio();
  }
});
document.addEventListener("input", e => {
  const el = e.target; if (!dentro(e)) return;
  if (el.id === "cq-inf-nom") { const v = el.value.trim().slice(0, 60); CU.nom ||= {}; if (v) CU.nom[infU] = v; else delete CU.nom[infU]; cambio(); document.getElementById("cq-hoja").innerHTML = informe(infU); const o = document.querySelector(`#cq-inf-u option[value="${CSS.escape(infU)}"]`); if (o) o.textContent = nom(infU); }
  if (el.id === "cq-inf-obs") { const v = el.value.slice(0, 1500); CU.obs ||= {}; if (v.trim()) CU.obs[infU] = v; else delete CU.obs[infU]; cambio(); document.getElementById("cq-hoja").innerHTML = informe(infU); }
});
/* con Intro en una nota se baja a la del alumno siguiente (como en una hoja de cálculo) */
document.addEventListener("keydown", e => {
  const el = e.target; if (e.key !== "Enter" || !el.classList?.contains("cq-n")) return;
  e.preventDefault(); const tr = el.closest("tr"), i = [...tr.querySelectorAll(".cq-n")].indexOf(el), sig = (e.shiftKey ? tr.previousElementSibling : tr.nextElementSibling)?.querySelectorAll(".cq-n")[i];
  el.blur(); (sig || el).focus(); sig?.select?.();
});
addEventListener("hashchange", () => { if (!/^#profe-cuaderno/.test(location.hash)) { paraRuido(); if (pendiente) guardar(); formNotas = ""; } });

const isCuaderno = h => /^profe-cuaderno(-[a-z]+)?$/.test(h);
window.LYACuaderno = {render, isCuaderno, _calc: {media, mediaCat, notaDeber, leerN}};
})();
