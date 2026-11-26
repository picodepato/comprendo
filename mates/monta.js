/* COMPRENDO · Matemáticas: 🧩 «Monta el problema» (4.º ESO PDC, proporcionalidad y porcentajes).
   Un problema con sus datos como fichas y cuatro columnas que se rellenan en orden, muy guiado:
     1. Datos      → cada número a su sitio (la tabla de la regla de tres, o el total y el %)
     2. Tipo       → directa, inversa, porcentaje o reparto
     3. Operación  → la cuenta buena, entre tres
     4. Respuesta  → el resultado, con el teclado
   Las fichas se arrastran (ratón o dedo) o se tocan y luego se toca el hueco. Si algo no va ahí, dice por qué.
   El problema sale de LYAMatesPDC.monta(r, d). Lo usan mates/mates.js (#mates-p2-monta, a solas) y mates/grupo.js (juego en clase).
   LYAMonta.html(clave, problema, {onFin(errores), onFallo(texto)}) → HTML; el estado se guarda por clave, así que se puede volver a pintar. */
(() => {
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const PD = () => window.LYAMatesPDC;
const ST = {};
const COLS = [["📌", "Datos", "Arrastra cada número a su sitio"], ["🔍", "Tipo", "¿Qué clase de problema es?"], ["🧮", "Operación", "¿Qué cuenta hay que hacer?"], ["✅", "Respuesta", "Haz la cuenta"]];
const ICT = {Directa: "📈", Inversa: "📉", Porcentaje: "💯", Reparto: "🍕"};

function estado(k, X, o) {
  let e = ST[k];
  if (!e || e.firma !== X.texto) e = ST[k] = {X, firma: X.texto, paso: 0, puestos: {}, tipo: null, op: null, inp: "", err: 0, mal: 0, msg: null, ok: false, sel: null, fin: false, avisado: false};
  e.o = o || e.o || {};
  return e;
}
/* el texto con los datos resaltados */
function texto(X) {
  let t = esc(X.texto);
  for (const d of X.datos) { const n = esc(PD().s(d.v)), re = new RegExp(`(^|[^\\d,])(${n.replace(/\./g, "\\.")})(?![\\d,])`); t = t.replace(re, `$1<mark class="mo-n">$2</mark>`); }
  return t;
}
const chip = (id, t, e, extra = "") => `<button type="button" class="mo-chip ${e.sel === id ? "sel" : ""} ${extra}" data-mo-chip="${esc(id)}" aria-pressed="${e.sel === id}">${esc(t)}</button>`;
function slot(e, id, lab) {
  const X = e.X, puesto = e.puestos[id], d = X.datos.find(x => x.id === id);
  return `<button type="button" class="mo-slot ${puesto ? "lleno" : ""}" data-mo-slot="d:${esc(id)}" ${puesto ? "disabled" : ""}>${puesto ? esc(d.t) : `<span>${esc(lab || "?")}</span>`}</button>`;
}
function datosHTML(e) {
  const X = e.X, E = X.esquema;
  if (E.k === "tabla") return `<table class="mo-tabla"><thead><tr><th></th>${E.heads.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${E.filas.map((f, i) => `<tr><th>${esc(E.labs[i])}</th>${f.map(id => `<td>${id === "x" ? `<span class="mo-x">x</span>` : slot(e, id)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  return `<div class="mo-lista">${E.slots.map(z => `<label class="mo-fila"><span>${esc(z.lab)}</span>${slot(e, z.id, "?")}</label>`).join("")}</div>`;
}
function fichas(e) {
  const X = e.X;
  if (e.paso === 0) return X.datos.filter(d => !e.puestos[d.id]).map(d => chip("d:" + d.id, d.t, e)).join("");
  if (e.paso === 1) return PD().TIPOS.map(t => chip("t:" + t, `${ICT[t]} ${t}`, e, "mo-tipo")).join("");
  if (e.paso === 2) return X.ops.map((o, i) => chip("o:" + i, o.t, e, "mo-op")).join("");
  return "";
}
function teclado() {
  const k = (t, v, c = "") => `<button type="button" class="mt-k ${c}" data-mo-k="${v}">${t}</button>`;
  return `<div class="mt-tec mo-tec" role="group" aria-label="Teclado">${[7, 8, 9, 4, 5, 6, 1, 2, 3].map(n => k(n, n)).join("")}${k(",", "dec")}${k(0, 0)}${k("⌫", "bs")}<button type="button" class="mt-k mt-kok" data-mo-k="ok">Comprobar ✓</button></div>`;
}
function html(k, X, o) {
  const e = estado(k, X, o);
  const col = (i, cuerpo) => `<section class="mo-col ${e.paso === i ? "on" : e.paso > i ? "hecho" : "lock"}" aria-label="${COLS[i][1]}"><h3><span>${i + 1}</span> ${COLS[i][0]} ${COLS[i][1]}</h3>${e.paso === i && !e.fin ? `<p class="mo-que">${COLS[i][2]}</p>` : ""}${cuerpo}</section>`;
  const tipoC = e.tipo ? `<p class="mo-res">${ICT[e.tipo]} <b>${esc(e.tipo)}</b></p>` : `<div class="mo-slot ${e.paso === 1 ? "" : "off"}" data-mo-slot="t"><span>${e.paso === 1 ? "Suelta aquí el tipo" : "…"}</span></div>`;
  const opC = e.op !== null ? `<p class="mo-res"><b>${esc(X.ops[e.op].t)}</b></p>` : `<div class="mo-slot ${e.paso === 2 ? "" : "off"}" data-mo-slot="o"><span>${e.paso === 2 ? "Suelta aquí la operación" : "…"}</span></div>`;
  const resC = e.fin ? `<p class="mo-res"><b>${esc(PD().conUd(X.sol, X.ud))}</b></p>` : e.paso === 3 ? `<p class="mt-pant mo-pant">${e.inp ? esc(e.inp) : '<span class="mt-ph">?</span>'} <small>${esc(X.ud === "%" ? "%" : X.ud)}</small></p>${teclado()}` : `<p class="mo-res off">…</p>`;
  const f = fichas(e);
  return `<div class="mo" data-monta="${esc(k)}">
    <p class="mo-txt">${texto(X)}</p>
    ${!e.fin && f ? `<div class="mo-fichas" aria-label="Fichas">${f}</div><p class="mo-ayu">${e.paso === 0 ? "Arrastra cada ficha a su hueco, o tócala y luego toca el hueco." : "Arrástrala a su columna o tócala."}</p>` : ""}
    ${e.msg ? `<p class="mo-msg ${e.ok ? "ok" : "no"}" role="status">${esc(e.msg)}</p>` : ""}
    <div class="mo-cols">${col(0, datosHTML(e))}${col(1, tipoC)}${col(2, opC)}${col(3, resC)}</div>
    ${e.fin ? `<div class="mo-fin"><p><b>${e.err ? `🧩 ¡Montado! Con ${e.err === 1 ? "1 fallo" : e.err + " fallos"}.` : "🏆 ¡Perfecto, sin fallos!"}</b></p><ol>${X.res.map(x => `<li>${esc(x)}</li>`).join("")}</ol>${o && o.sig ? o.sig : ""}</div>` : ""}
  </div>`;
}
function repintar(k) {
  const e = ST[k], el = document.querySelector(`[data-monta="${CSS.escape(k)}"]`); if (!e || !el) return;
  el.outerHTML = html(k, e.X, e.o);
}
function fallo(e, t) { e.err++; e.msg = "❌ " + t; e.ok = false; try { e.o.onFallo && e.o.onFallo(t); } catch (er) {} }
function acierto(e, t) { e.msg = t; e.ok = true; }
function terminar(e) { e.fin = true; e.paso = 4; if (!e.avisado) { e.avisado = true; try { e.o.onFin && e.o.onFin(e.err); } catch (er) {} } }
/* poner la ficha «c» en el hueco «z» */
function poner(k, c, z) {
  const e = ST[k]; if (!e || e.fin) return;
  const X = e.X, [tc, idc] = c.split(":");
  e.sel = null;
  if (tc === "d" && e.paso === 0) {
    if (!z || !z.startsWith("d:")) return repintar(k);
    const ids = z.slice(2), d = X.datos.find(x => x.id === idc), dz = X.datos.find(x => x.id === ids);
    if (e.puestos[ids]) return repintar(k);
    if (ids === idc) { e.puestos[ids] = true; acierto(e, `✅ ${d.t}: ${d.es}.`); if (X.datos.every(x => e.puestos[x.id])) { e.paso = 1; acierto(e, "✅ ¡Datos colocados! Ahora, ¿qué tipo de problema es?"); } }
    else fallo(e, `«${d.t}» no va ahí: es ${d.es}. Ese hueco es para ${dz ? dz.es : "otro dato"}.`);
  } else if (tc === "t" && e.paso === 1) {
    if (idc === X.tipo) { e.tipo = idc; e.paso = 2; acierto(e, `✅ Sí: ${idc.toLowerCase()}. Ahora elige la operación.`); }
    else fallo(e, X.porTipo[idc] || "No es de ese tipo.");
  } else if (tc === "o" && e.paso === 2) {
    const op = X.ops[+idc];
    if (op.ok) { e.op = +idc; e.paso = 3; acierto(e, "✅ Esa es la cuenta. Hazla y escribe el resultado."); }
    else fallo(e, op.por || "Esa cuenta no es.");
  }
  repintar(k);
}
function tecla(k, v) {
  const e = ST[k]; if (!e || e.paso !== 3 || e.fin) return;
  let t = e.inp;
  if (v === "bs") t = t.slice(0, -1);
  else if (v === "dec") { if (!t.includes(",")) t = (t || "0") + ","; }
  else if (v === "ok") {
    const x = PD().leer(t); if (x === null) return;
    if (PD().igual(x, e.X.sol)) { acierto(e, "🎉 ¡Bien!"); return terminar(e), repintar(k); }
    e.mal++; e.inp = "";
    fallo(e, e.mal >= 3 ? `No es ${PD().s(x)}. La respuesta era ${PD().conUd(e.X.sol, e.X.ud)}.` : `No es ${PD().s(x)}. Haz la cuenta con calma: ${e.X.ops[e.op].t}.`);
    if (e.mal >= 3) terminar(e);
    return repintar(k);
  } else if (/^\d$/.test(String(v)) && t.replace(",", "").length < 9 && !/,\d\d$/.test(t)) t = (t === "0" ? "" : t) + v;
  e.inp = t; e.msg = e.ok ? e.msg : null; repintar(k);
}

/* ---------- tocar y arrastrar ---------- */
let arr = null, tragar = false;  /* el «click» que llega justo después de soltar una ficha arrastrada no cuenta */
document.addEventListener("pointerdown", ev => {
  tragar = false;
  const c = ev.target.closest("[data-mo-chip]"); if (!c || ev.button > 0) return;
  arr = {c, k: c.closest("[data-monta]").dataset.monta, id: c.dataset.moChip, x: ev.clientX, y: ev.clientY, g: null, pid: ev.pointerId};
});
document.addEventListener("pointermove", ev => {
  if (!arr || ev.pointerId !== arr.pid) return;
  if (!arr.g && Math.hypot(ev.clientX - arr.x, ev.clientY - arr.y) < 8) return;
  if (!arr.g) {
    const r = arr.c.getBoundingClientRect();
    arr.g = arr.c.cloneNode(true); arr.g.classList.add("mo-fant"); arr.g.style.width = r.width + "px";
    arr.dx = ev.clientX - r.left; arr.dy = ev.clientY - r.top; document.body.appendChild(arr.g); arr.c.classList.add("mo-va");
    try { arr.c.setPointerCapture(ev.pointerId); } catch (e) {}
  }
  ev.preventDefault();
  arr.g.style.left = ev.clientX - arr.dx + "px"; arr.g.style.top = ev.clientY - arr.dy + "px";
  document.querySelectorAll(".mo-slot.sobre").forEach(x => x.classList.remove("sobre"));
  arr.g.style.display = "none"; const z = document.elementFromPoint(ev.clientX, ev.clientY)?.closest("[data-mo-slot]"); arr.g.style.display = "";
  if (z) z.classList.add("sobre");
}, {passive: false});
function soltar(ev) {
  if (!arr || ev.pointerId !== arr.pid) return;
  const a = arr; arr = null;
  if (!a.g) return;
  a.g.remove(); a.c.classList.remove("mo-va"); tragar = true; setTimeout(() => { tragar = false; }, 400);
  const z = document.elementFromPoint(ev.clientX, ev.clientY)?.closest("[data-mo-slot]");
  const tipo = a.id[0];
  if (z) poner(a.k, a.id, z.dataset.moSlot);
  else if (tipo !== "d" && document.elementFromPoint(ev.clientX, ev.clientY)?.closest(".mo-col.on")) poner(a.k, a.id, null);
  else repintar(a.k);
}
document.addEventListener("pointerup", soltar);
document.addEventListener("pointercancel", ev => { if (arr && arr.g) { arr.g.remove(); arr.c.classList.remove("mo-va"); } arr = null; });
document.addEventListener("click", ev => {
  if (tragar) { tragar = false; return; }
  const m = ev.target.closest("[data-monta]"); if (!m) return;
  const k = m.dataset.monta, e = ST[k]; if (!e) return;
  const c = ev.target.closest("[data-mo-chip]"), z = ev.target.closest("[data-mo-slot]"), t = ev.target.closest("[data-mo-k]");
  if (t) return tecla(k, t.dataset.moK);
  if (c) {
    const id = c.dataset.moChip;
    if (id[0] !== "d") return poner(k, id, null);  /* tipo y operación: con tocarlas basta */
    e.sel = e.sel === id ? null : id; return repintar(k);
  }
  if (z && e.sel) return poner(k, e.sel, z.dataset.moSlot);
  if (z && !e.sel && e.paso === 0) { e.msg = "Primero toca una ficha (un número) y luego su hueco."; e.ok = false; repintar(k); }
});
/* teclado del ordenador para la respuesta */
addEventListener("keydown", ev => {
  const m = document.querySelector("[data-monta]"); if (!m || ev.ctrlKey || ev.metaKey || ev.altKey || ev.target.closest?.("input,textarea,select")) return;
  const k = m.dataset.monta, e = ST[k]; if (!e || e.paso !== 3 || e.fin) return;
  const v = /^\d$/.test(ev.key) ? ev.key : ev.key === "," || ev.key === "." ? "dec" : ev.key === "Backspace" ? "bs" : ev.key === "Enter" ? "ok" : null;
  if (v === null) return;
  ev.preventDefault(); ev.stopImmediatePropagation(); tecla(k, v);
}, true);

window.LYAMonta = {html, estado: k => ST[k], borrar: k => { delete ST[k]; }, _poner: poner, _tecla: tecla};
})();
