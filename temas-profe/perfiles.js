/* COMPRENDO · Perfil de la clase: las dificultades de cada alumno y qué se le adapta (lo marca su profe).
   - #profe-perfil-clase: todos los alumnos de una clase, con sus dificultades para tocar (se guarda al momento).
   - LYAPerfiles.editor(usuario): ventana para un alumno (la abre el botón «🧩 Dificultades» de su ficha, y el cuaderno de clase).
   - LYAPerfiles.mio(): el perfil del alumno que ha entrado ({dif, adaptar}); con él, cada tema de profe le sale ya adaptado.
   Datos: GET|POST /api/perfiles (api/_perfiles.js) → perfil:<alumno> = {dif, adaptar, notas, por, t}. Las claves de dificultad son LYATemasProfe.DIFICULTADES. */
(() => {
const C = () => window.LYACuentas || {};
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const DIF = () => (window.LYATemasProfe || {}).DIFICULTADES || [];
const ADAPTAR = [["temas", "📚 Temas de mis profes"], ["fpb", "🛠️ FP Básica"], ["mates", "➗ Mates"], ["lecturas", "📖 Lecturas"]];
const PRONTO = new Set(["fpb", "mates", "lecturas"]);  /* de momento solo se adaptan los temas de los profes */
const nomDif = k => (DIF().find(x => x[0] === k) || [k, k])[1];

let mioP = null;
const mio = () => mioP ||= (C().rol === "alumno" ? C().api("perfiles").then(r => r.ok ? r.j.perfil : null).catch(() => null) : Promise.resolve(null));

/* ---------- formulario de un alumno ---------- */
const formHTML = (u, p) => `<form class="pfl-f" data-pfl-form="${esc(u)}">
  <p class="mt-small">Marca lo que le pasa a <b>${esc(u)}</b>. Solo lo ves tú (y el administrador). El alumno no ve tus notas.</p>
  <div class="tp-chips" role="group" aria-label="Dificultades">${DIF().filter(([k]) => k !== "normal").map(([k, n]) => `<button type="button" class="tp-chip" data-pfl-dif="${k}" aria-pressed="${(p.dif || []).includes(k)}">${esc(n)}</button>`).join("")}</div>
  <fieldset class="pfl-ad"><legend>¿Qué se le adapta?</legend>${ADAPTAR.map(([k, n]) => `<label><input type="checkbox" name="ad-${k}"${(p.adaptar || {})[k] ?? k === "temas" ? " checked" : ""}${PRONTO.has(k) ? " disabled" : ""}> ${esc(n)}${PRONTO.has(k) ? " <small>(pronto)</small>" : ""}</label>`).join("")}</fieldset>
  <label class="tp-l">Notas para adaptar (opcional)<textarea class="tp-in" name="notas" rows="3" maxlength="600" placeholder="Por ejemplo: se cansa con textos largos; mejor con dibujos; necesita más tiempo…">${esc(p.notas || "")}</textarea></label>
  <p class="mt-acc"><button class="btn main" type="submit">💾 Guardar</button> <span class="ctam" role="status"></span></p></form>`;
const leerForm = f => ({dif: [...f.querySelectorAll("[data-pfl-dif][aria-pressed=true]")].map(b => b.dataset.pflDif), adaptar: Object.fromEntries(ADAPTAR.map(([k]) => [k, !!f["ad-" + k]?.checked])), notas: f.notas.value});
async function guardar(f) {
  const m = f.querySelector(".ctam"); m.textContent = "Guardando…";
  const r = await C().api("perfiles", "POST", {accion: "perfil", usuario: f.dataset.pflForm, ...leerForm(f)}).catch(() => ({ok: false, j: {}}));
  m.textContent = r.ok ? "✓ Guardado" : r.j.error === "no_es_tu_alumno" ? "⚠ Este alumno no está en tus clases." : "⚠ No se ha podido guardar.";
  if (r.ok) P = null;
  return r.ok;
}
async function editor(u) {
  const ui = C().ui; if (!ui) return;
  ui.ventana(`<h2>🧩 Dificultades de ${esc(u)}</h2><p class="ctas">Cargando…</p>`);
  const p = ((await cargarClase()).perfiles || {})[u] || {};
  ui.ventana(`<h2>🧩 Dificultades de ${esc(u)}</h2>${formHTML(u, p)}`);
}

/* ---------- la página del perfil de la clase ---------- */
let P = null, clase = "";
const cargarClase = async () => P ||= await C().api("perfiles").then(r => r.ok ? r.j : {alumnos: [], perfiles: {}}).catch(() => ({alumnos: [], perfiles: {}}));
const isPc = h => h === "profe-perfil-clase";
async function render(app) {
  if (!["profe", "admin"].includes(C().rol)) { app.innerHTML = `<section class="wrap mt tp"><h1 class="mt-h1">🧩 Perfil de la clase</h1><p class="mt-lead">Esto es solo para profes.</p></section>`; return; }
  app.innerHTML = `<section class="wrap mt tp"><h1 class="mt-h1">🧩 Perfil de la clase</h1><p class="mt-lead">Cargando…</p></section>`;
  P = null; const D = await cargarClase(); if (!isPc(location.hash.slice(1))) return;
  const clases = D.clases || {}, enClase = D.clase || {};
  if (clase && !clases[clase]) clase = "";
  const us = D.alumnos.filter(u => !clase || enClase[u] === clase).sort();
  const cuenta = {}; us.forEach(u => ((D.perfiles[u] || {}).dif || []).forEach(d => { cuenta[d] = (cuenta[d] || 0) + 1; }));
  app.innerHTML = `<section class="wrap mt tp"><p class="mt-migas"><a href="#profe">← Profe</a></p>
    <h1 class="mt-h1">🧩 Perfil de la clase</h1>
    <p class="mt-lead">Marca las dificultades de cada alumno. Al pedir un tema con «Adaptar para todo mi alumnado», cada uno verá su versión adaptada. Se guarda al tocar.</p>
    ${Object.keys(clases).length > 1 ? `<p><label class="tp-l" style="max-width:320px">Clase<select class="tp-in" data-pfl-clase><option value="">Todas mis clases</option>${Object.entries(clases).map(([id, n]) => `<option value="${esc(id)}"${id === clase ? " selected" : ""}>${esc(n)}</option>`).join("")}</select></label></p>` : ""}
    <p class="pfl-res">${Object.keys(cuenta).length ? Object.entries(cuenta).map(([d, n]) => `<span class="pfl-tag">${esc(nomDif(d))} · ${n}</span>`).join(" ") : `<span class="mt-small">Todavía no has marcado dificultades.</span>`}</p>
    ${us.length ? `<div class="pfl-lista">${us.map(u => { const p = D.perfiles[u] || {}; return `<article class="pfl-al"><h3>${esc(u)} <small class="mt-small">${esc(clases[enClase[u]] || "")}</small></h3>
      <div class="tp-chips" role="group">${DIF().filter(([k]) => k !== "normal").map(([k, n]) => `<button type="button" class="tp-chip" data-pfl-rapido="${esc(u)}" data-d="${k}" aria-pressed="${(p.dif || []).includes(k)}">${esc(n)}</button>`).join("")}</div>
      <p class="mt-small">${p.notas ? "📝 " + esc(p.notas) + " · " : ""}<button type="button" class="ctal" data-perfil="${esc(u)}">Notas y qué se adapta</button></p></article>`; }).join("")}</div>`
      : `<p class="mt-box">No tienes alumnos en tus clases todavía.</p>`}
    <p class="ctam" role="status" id="pflm"></p></section>`;
}

document.addEventListener("click", async e => {
  const d = e.target.closest("[data-pfl-dif]"); if (d) { d.setAttribute("aria-pressed", d.getAttribute("aria-pressed") !== "true"); return; }
  const ed = e.target.closest("[data-perfil]"); if (ed) { e.preventDefault(); editor(ed.dataset.perfil); return; }
  const r = e.target.closest("[data-pfl-rapido]"); if (!r) return;
  const u = r.dataset.pflRapido, D = await cargarClase(), p = D.perfiles[u] || {dif: [], adaptar: {temas: true}, notas: ""};
  const dif = (p.dif || []).includes(r.dataset.d) ? p.dif.filter(x => x !== r.dataset.d) : [...(p.dif || []), r.dataset.d];
  r.setAttribute("aria-pressed", dif.includes(r.dataset.d));
  const x = await C().api("perfiles", "POST", {accion: "perfil", usuario: u, dif, adaptar: p.adaptar || {temas: true}, notas: p.notas || ""}).catch(() => ({ok: false}));
  const m = document.getElementById("pflm");
  if (x.ok) { D.perfiles[u] = {...p, dif}; if (m) m.textContent = `✓ Guardado (${u})`; } else { r.setAttribute("aria-pressed", !dif.includes(r.dataset.d)); if (m) m.textContent = "⚠ No se ha podido guardar."; }
});
document.addEventListener("submit", async e => {
  const f = e.target.closest("[data-pfl-form]"); if (!f) return;
  e.preventDefault(); if (await guardar(f) && isPc(location.hash.slice(1))) setTimeout(() => { C().ui?.cerrar?.(); window.LYA?.render?.(); dispatchEvent(new HashChangeEvent("hashchange")); }, 500);
});
document.addEventListener("change", e => { if (e.target.matches?.("[data-pfl-clase]")) { clase = e.target.value; dispatchEvent(new HashChangeEvent("hashchange")); } });

window.LYAPerfiles = {editor, mio, render, isPc, nomDif, ADAPTAR};
})();
