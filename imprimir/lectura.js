/* COMPRENDO · 🖨️ Imprimir una lectura (comprensión lectora), eligiendo qué partes salen.
   Pone un botón «🖨️ Imprimir» debajo del título de cada lectura (#<id de la lectura>) y abre el mismo tipo de panel que
   «Imprimir tema» (imprimir/imprimir.js, que tiene el CSS y la impresión: solo sale la hoja).
   Se elige:
     · atajos: solo el texto · texto y preguntas · solo las preguntas · todo
     · partes: texto, preguntas de comprensión, vocabulario, unir frases, gramática (la regla y la tabla, los ejercicios)
     · ayudas en el idioma que ya sabe: traducción del texto (si la lectura la trae), del vocabulario y de la tabla de gramática
     · pistas: sin, o debajo de cada ejercicio (en qué párrafo está la respuesta y las pistas de gramática)
     · soluciones: sin, al final o en hoja aparte, con «dónde lo dice el texto» o sin él
     · nombre y fecha arriba, sitio para contestar, letra grande; y en la vista previa ✕ para quitar cualquier ejercicio.
   Los títulos de la hoja salen en el idioma de la lectura (es, en, ca). Opciones guardadas en localStorage «lyaImprimirLectura». */
(() => {
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const L = () => window.LYA || {};
const plain = s => String(s ?? "").replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, "$1");
const LET = "abcdefghijklmnopqrstuvwxyz";
const store = {get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }};
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
/* el orden de la columna de la derecha al relacionar: siempre el mismo para la misma lectura, y nunca el de la izquierda */
function orden(n, seed) {
  const a = [...Array(n).keys()]; let s = hash(seed) || 1;
  const f = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let k = 0; k < 5; k++) { for (let i = n - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } if (n < 3 || a.some((x, i) => x !== i)) break; }
  return a;
}
const TX = {
  es: {lect: "Lectura", nivel: "Nivel", nombre: "Nombre", curso: "Curso", fecha: "Fecha", texto: "Texto", q: "Preguntas de comprensión", vocab: "Vocabulario: relaciona cada palabra con su significado", halves: "Une el principio de cada frase con su final", g: "Gramática", sol: "Soluciones", donde: "Dónde lo dice el texto", parr: "Mira el párrafo", vf: "V / F", v: "V", f: "F", porque: "Explica por qué", fuente: "Fuente", pista: "Pista"},
  en: {lect: "Reading", nivel: "Level", nombre: "Name", curso: "Class", fecha: "Date", texto: "Text", q: "Reading comprehension", vocab: "Vocabulary: match each word with its meaning", halves: "Match the beginning of each sentence with its ending", g: "Grammar", sol: "Answers", donde: "Where the text says it", parr: "Look at paragraph", vf: "T / F", v: "T", f: "F", porque: "Explain why", fuente: "Source", pista: "Hint"},
  ca: {lect: "Lectura", nivel: "Nivell", nombre: "Nom", curso: "Curs", fecha: "Data", texto: "Text", q: "Preguntes de comprensió", vocab: "Vocabulari: relaciona cada paraula amb el seu significat", halves: "Uneix el principi de cada frase amb el seu final", g: "Gramàtica", sol: "Solucions", donde: "On ho diu el text", parr: "Mira el paràgraf", vf: "C / F", v: "C", f: "F", porque: "Explica per què", fuente: "Font", pista: "Pista"}
};
const DEF = {texto: true, q: true, vocab: true, halves: true, gregla: true, gej: true, trTexto: false, trAyuda: true, pistas: "no", sol: "final", donde: true, nombre: true, hueco: true, grande: false};
let S = null;

/* ---------- la lectura que está abierta ---------- */
function lecturaAbierta() {
  const A = L(); let st = null; try { st = A.get?.(); } catch (e) {}
  const R = st?.R || A.R, view = st?.S?.view;
  return R && view === "read" && location.hash.slice(1) === R.id ? {R, S: st.S} : null;
}

/* ---------- panel ---------- */
function abrir() {
  const x = lecturaAbierta(); if (!x) return;
  const {R} = x, know = x.S?.know, learn = x.S?.learn || "es";
  let meta = null; try { meta = L().rdById?.(R.id); } catch (e) {}
  S = {...DEF, ...(store.get("lyaImprimirLectura") || {}), R, tr: (R.tr || {})[know] || {}, know, t: TX[learn] || TX.es, tema: meta?.t?.name?.[learn] || "", quit: new Set()};
  window.LYAImprimir?.cerrar?.(true);
  document.querySelector(".imp-modal")?.remove();
  const M = document.createElement("div");
  M.className = "imp-modal imp-lect"; M.setAttribute("role", "dialog"); M.setAttribute("aria-modal", "true"); M.setAttribute("aria-label", "Imprimir la lectura");
  M.innerHTML = `<div class="imp-top"><b>🖨️ Imprimir · ${esc(R.title)} (${esc(R.level)})</b><button type="button" class="imp-x" data-impl="cerrar" aria-label="Cerrar">✕</button></div>
    <div class="imp-cuerpo"><form class="imp-panel" onsubmit="return false">${panelHTML()}</form><div class="imp-prev"></div></div>
    <div class="imp-bar"><span class="imp-cuenta"></span><button type="button" class="btn imp-ver" data-impl="ver">👀 Ver la hoja</button><button type="button" class="btn main" data-impl="imprimir">🖨️ Imprimir o guardar PDF</button></div>`;
  document.body.appendChild(M);
  document.documentElement.classList.add("imp-on");
  M.querySelector(".imp-panel").addEventListener("change", cambio);
  visibles(); pintar();
  try { M.querySelector(".imp-x").focus(); } catch (e) {}
}
function cerrar() { document.querySelector(".imp-lect")?.remove(); document.documentElement.classList.remove("imp-on"); S = null; try { document.querySelector(".imp-abrir-l")?.focus(); } catch (e) {} }
const guardar = () => { const o = {}; for (const k of Object.keys(DEF)) o[k] = S[k]; store.set("lyaImprimirLectura", o); };
const chk = (name, on, txt) => `<label class="imp-chk"><input type="checkbox" name="${name}" ${on ? "checked" : ""}> <span>${txt}</span></label>`;
const rad = (name, val, on, txt) => `<label class="imp-chk"><input type="radio" name="${name}" value="${val}" ${on ? "checked" : ""}> <span>${txt}</span></label>`;
const lname = l => ({es: "castellano", en: "inglés", ca: "catalán", de: "alemán", it: "italiano", fr: "francés"}[l] || l || "tu idioma");
function panelHTML() {
  const {R, tr} = S, uoe = !!R.grammar?.parts;
  return `
  <fieldset><legend>⚡ Rápido</legend>
    <p class="imp-fila"><button type="button" class="imp-mini" data-impl="solo-texto">Solo el texto</button><button type="button" class="imp-mini" data-impl="texto-preg">Texto y preguntas</button><button type="button" class="imp-mini" data-impl="solo-preg">Solo las preguntas</button><button type="button" class="imp-mini" data-impl="todo">Todo</button></p>
  </fieldset>
  <fieldset><legend>📄 ¿Qué partes?</legend>
    ${chk("texto", S.texto, "📖 El texto")}
    ${chk("q", S.q, `❓ Preguntas de comprensión <small>(${R.q.length})</small>`)}
    ${chk("vocab", S.vocab, `🔤 Vocabulario <small>(relacionar, ${R.vocab.length})</small>`)}
    ${chk("halves", S.halves, `🧩 Unir frases <small>(${R.halves.length})</small>`)}
    ${chk("gregla", S.gregla, `📐 Gramática: ${uoe ? "explicación" : "la regla y la tabla"}`)}
    ${chk("gej", S.gej, `✏️ Gramática: ejercicios <small>(${R.grammar.items.length})</small>`)}
    <p class="imp-small">En la vista previa puedes quitar (✕) cualquier ejercicio.</p>
  </fieldset>
  <fieldset><legend>🌍 Ayudas en ${esc(lname(S.know))}</legend>
    ${tr.text ? chk("trTexto", S.trTexto, "Traducción del texto, debajo de cada párrafo") : ""}
    ${chk("trAyuda", S.trAyuda, "Traducción en el vocabulario y en la tabla de gramática")}
  </fieldset>
  <fieldset><legend>💡 Pistas</legend>
    ${rad("pistas", "no", S.pistas === "no", "Sin pistas")}${rad("pistas", "debajo", S.pistas === "debajo", "Debajo de cada ejercicio (en qué párrafo está y las pistas de gramática)")}
  </fieldset>
  <fieldset><legend>✅ Soluciones</legend>
    ${rad("sol", "no", S.sol === "no", "Sin soluciones")}${rad("sol", "final", S.sol === "final", "Al final")}${rad("sol", "aparte", S.sol === "aparte", "En una hoja aparte (para el profe o para recortar)")}
    <div class="imp-sub" data-dep="sol">${chk("donde", S.donde, "Con «dónde lo dice el texto»")}</div>
  </fieldset>
  <fieldset><legend>📄 La hoja</legend>
    ${chk("nombre", S.nombre, "Nombre, curso y fecha arriba")}${chk("hueco", S.hueco, "Dejar sitio para contestar")}${chk("grande", S.grande, "Letra grande")}
  </fieldset>`;
}
function visibles() { document.querySelectorAll(".imp-lect [data-dep]").forEach(el => { el.hidden = el.dataset.dep === "sol" ? S.sol === "no" : false; }); }
function cambio(e) {
  const t = e.target; if (!t.name || !S) return;
  if (t.type === "checkbox") S[t.name] = t.checked; else if (t.type === "radio") S[t.name] = t.value; else return;
  guardar(); visibles(); pintar();
}
function preset(a) {
  const p = {"solo-texto": {texto: true, q: false, vocab: false, halves: false, gregla: false, gej: false},
    "texto-preg": {texto: true, q: true, vocab: false, halves: false, gregla: false, gej: false},
    "solo-preg": {texto: false, q: true, vocab: false, halves: false, gregla: false, gej: false},
    "todo": {texto: true, q: true, vocab: true, halves: true, gregla: true, gej: true}}[a];
  Object.assign(S, p);
  for (const k in p) { const el = document.querySelector(`.imp-lect input[name=${k}]`); if (el) el.checked = p[k]; }
  guardar(); pintar();
}

/* ---------- la hoja ---------- */
const linea = (cls = "") => `<span class="imp-linea ${cls}"></span>`;
const renglones = n => `<div class="imp-renglones">${Array(n).fill('<span class="imp-renglon"></span>').join("")}</div>`;
const ctl = k => `<span class="imp-ctl"><button type="button" data-impl="quitar" data-k="${k}" title="Quitar" aria-label="Quitar este ejercicio">✕</button></span>`;
/* en qué párrafo está la respuesta (por la cita del texto que traen algunas preguntas) */
function parrafoDe(ev) {
  if (!ev?.length) return 0;
  const ps = S.R.text.map(p => plain(p).toLowerCase()), trozo = plain(ev[0]).toLowerCase().slice(0, 40);
  const i = ps.findIndex(p => p.includes(trozo)); return i + 1;
}
function preguntas(sol) {
  const {R, t} = S, out = [];
  R.q.forEach((q, i) => {
    const k = "q" + i; if (S.quit.has(k)) return;
    const m = q[3] || {}, n = out.length + 1, par = parrafoDe(m.ev);
    let cuerpo = "", s = "";
    if (m.t === "vf") {
      cuerpo = `<table class="imp-vf">${m.items.map(([x], j) => `<tr><td>${j + 1}. ${esc(plain(x))}</td><td class="imp-vfb">${t.v} ☐ &nbsp; ${t.f} ☐</td></tr>`).join("")}</table>`;
      s = m.items.map(([, v], j) => `${j + 1}. ${v ? t.v : t.f}`).join(" · ");
    } else if (m.t === "open") {
      cuerpo = S.hueco ? renglones(3) : "";
      s = esc(plain(m.a || q[1]?.[q[2]] || ""));
    } else {
      cuerpo = `<ol class="imp-ops${q[1].every(o => plain(o).length <= 14) ? " corto" : ""}">${q[1].map((o, j) => `<li><span class="imp-bola"></span><b>${LET[j]})</b> ${esc(plain(o))}</li>`).join("")}</ol>`;
      if (m.just) cuerpo += `<p class="imp-prob">■ ${esc(plain(m.just))}</p>${S.hueco ? renglones(2) : ""}`;
      s = `${LET[q[2]]}) ${esc(plain(q[1][q[2]]))}${m.just && m.a ? ` — ${esc(plain(m.a))}` : ""}`;
    }
    const stem = m.t === "vf" ? (m.orig || q[0]) : q[0];
    out.push({k, html: `<li class="imp-act"><div class="imp-acab"><span class="imp-n">${n}</span><p class="imp-enun">${esc(plain(stem))}</p>${ctl(k)}</div><div class="imp-acu">${cuerpo}</div>${S.pistas === "debajo" && par ? `<div class="imp-pistas"><p>💡 ${t.parr} ${par}.</p></div>` : ""}</li>`});
    sol.push({n, s, ev: (m.ev || []).map(e => esc(plain(e)))});
  });
  return out;
}
function relacionar(k, izq, der, cab) {
  const ord = orden(izq.length, S.R.id + k);
  const html = `<li class="imp-act"><div class="imp-acab"><p class="imp-enun">${cab}</p>${ctl(k)}</div>
    <table class="imp-rel"><tr><td><ol>${izq.map(x => `<li>${x}</li>`).join("")}</ol></td><td><ol type="a">${ord.map(i => `<li>${der[i]}</li>`).join("")}</ol></td></tr></table>
    ${S.hueco ? `<p class="imp-resp">${izq.map((_, i) => `${i + 1} → ${linea("mini")}`).join(" &nbsp; ")}</p>` : ""}</li>`;
  const sol = izq.map((_, i) => `${i + 1} → ${LET[ord.indexOf(i)]}`).join(" · ");
  return {html, sol};
}
function gramatica(solG) {
  const {R, tr, t} = S, g = R.grammar, items = [];
  if (g.parts) {
    let n = 0;
    for (const [pi, p] of g.parts.entries()) {
      const k = "gp" + pi; if (S.quit.has(k)) { n += p.items.length; continue; }
      const nums = {}; p.items.forEach(i => nums[i] = ++n);
      let cuerpo = "";
      if (p.type === "kwt") cuerpo = p.items.map(i => { const x = g.items[i][3], [a, b] = x.p.split("___"); return `<div class="imp-kwt"><p>${nums[i]}. ${esc(plain(x.s))}</p><p class="imp-kw">${esc(x.w)}</p><p>${esc(plain(a))} ${linea()} ${esc(plain(b || ""))}</p></div>`; }).join("");
      else {
        cuerpo = `<p class="imp-uoe">${p.text.split(/\{\{(\d+)\}\}/).map((s, j) => j % 2 ? `<b>(${nums[+s]})</b> ${linea("corta")}${g.items[+s][3]?.t === "wf" ? ` <b class="imp-kw">${esc(g.items[+s][3].w)}</b>` : ""}` : esc(plain(s))).join("")}</p>`;
        if (p.type === "mc") cuerpo += `<div class="imp-mc">${p.items.map(i => `<p><b>${nums[i]}.</b> ${g.items[i][1].map((o, j) => `<span class="imp-bola"></span><b>${LET[j]})</b> ${esc(o)}`).join(" &nbsp; ")}</p>`).join("")}</div>`;
      }
      items.push(`<li class="imp-act"><div class="imp-acab"><p class="imp-enun">${esc(p.title)}${p.help ? `<br><small class="imp-nv">${esc(p.help)}</small>` : ""}</p>${ctl(k)}</div>${cuerpo}</li>`);
      p.items.forEach(i => solG.push({n: nums[i], s: esc(g.items[i][3] ? g.items[i][1].join(" / ") : `${LET[g.items[i][2]]}) ${g.items[i][1][g.items[i][2]]}`)}));
    }
    return items;
  }
  g.items.forEach((q, i) => {
    const k = "g" + i; if (S.quit.has(k)) return;
    const n = items.length + 1, pista = (tr.hints || [])[i];
    items.push(`<li class="imp-act"><div class="imp-acab"><span class="imp-n">${n}</span><p class="imp-enun">${esc(plain(q[0])).replace("___", '<span class="imp-linea corta"></span>')}</p>${ctl(k)}</div>
      <div class="imp-acu"><ol class="imp-ops corto">${q[1].map((o, j) => `<li><span class="imp-bola"></span><b>${LET[j]})</b> ${esc(o)}</li>`).join("")}</ol></div>
      ${S.pistas === "debajo" && pista ? `<div class="imp-pistas"><p>💡 ${esc(pista)}</p></div>` : ""}</li>`);
    solG.push({n, s: `${LET[q[2]]}) ${esc(q[1][q[2]])}`});
  });
  return items;
}
function hojaHTML() {
  const {R, tr, t} = S, g = R.grammar;
  let html = "", sec = 0, total = 0;
  const sols = [];
  const h2 = (txt) => `<h2><span>${++sec}</span> ${txt}</h2>`;
  if (S.texto) {
    html += `<section class="imp-sec"><div class="imp-texto-l">${R.text.map((p, i) => `<p><span class="imp-pn">${i + 1}</span>${esc(plain(p))}</p>${S.trTexto && tr.text?.[i] ? `<p class="imp-trx">${esc(tr.text[i])}</p>` : ""}`).join("")}</div>
      ${R.font ? `<p class="imp-small">${t.fuente}: ${esc(R.font.autor)}, <i>${esc(R.font.obra)}</i>. ${esc(R.font.llibre || "")} ${esc(R.font.editorial || "")}</p>` : ""}</section>`;
  }
  if (S.q) {
    const sq = [], qs = preguntas(sq);
    if (qs.length) { html += `<section class="imp-sec">${h2(t.q)}<ol class="imp-acts">${qs.map(x => x.html).join("")}</ol></section>`; total += qs.length; sols.push({t: t.q, xs: sq}); }
  }
  if (S.vocab && !S.quit.has("vocab")) {
    const r = relacionar("vocab", R.vocab.map(v => `<b>${esc(v[0])}</b>`), R.vocab.map((v, i) => `${esc(v[1])}${S.trAyuda && tr.vocab?.[i] ? ` ${esc(tr.vocab[i])}` : ""}`), "");
    html += `<section class="imp-sec">${h2(t.vocab)}<ol class="imp-acts">${r.html}</ol></section>`; total++; sols.push({t: t.vocab, xs: [{s: r.sol}]});
  }
  if (S.halves && !S.quit.has("halves")) {
    const r = relacionar("halves", R.halves.map(h => esc(plain(h[0]))), R.halves.map(h => esc(plain(h[1]))), "");
    html += `<section class="imp-sec">${h2(t.halves)}<ol class="imp-acts">${r.html}</ol></section>`; total++; sols.push({t: t.halves, xs: [{s: r.sol}]});
  }
  if (S.gregla || S.gej) {
    let gh = "";
    if (S.gregla) gh += `<div class="imp-teo"><p class="imp-idea">${g.rule}</p>${S.trAyuda && tr.grammar ? `<p class="imp-trx">${esc(tr.grammar)}</p>` : ""}${g.rows?.length ? `<table class="imp-tabla">${g.rows.map((x, i) => `<tr><td>${esc(x)}</td>${S.trAyuda && tr.rows?.[i] ? `<td>${esc(tr.rows[i])}</td>` : ""}</tr>`).join("")}</table>` : ""}</div>`;
    if (S.gej) { const sg = [], it = gramatica(sg); if (it.length) { gh += `<ol class="imp-acts">${it.join("")}</ol>`; total += it.length; sols.push({t: g.title || t.g, xs: sg}); } }
    if (gh) html += `<section class="imp-sec">${h2(esc(g.title || t.g))}${gh}</section>`;
  }
  if (!html) html = `<p class="imp-vacio">Marca al menos una parte.</p>`;
  if (S.sol !== "no" && sols.length) html += `<section class="imp-sec imp-final ${S.sol === "aparte" ? "imp-aparte" : ""}"><h2><span>✅</span> ${t.sol}</h2>${S.sol === "aparte" ? `<p class="imp-small">${esc(R.title)} · ${esc(R.level)}</p>` : ""}${sols.map(g => `<h3>${esc(g.t)}</h3><ol class="imp-sols">${g.xs.map(x => `<li${x.n ? ` value="${x.n}"` : ' class="imp-sin-n"'}><b>${x.s}</b>${S.donde && x.ev?.length ? `<span class="imp-como">🔎 ${t.donde}: ${x.ev.map(e => `«${e}»`).join(" ")}</span>` : ""}</li>`).join("")}</ol>`).join("")}</section>`;
  const cab = S.nombre ? `<div class="imp-datos"><span>${t.nombre}: <i></i></span><span>${t.curso}: <i class="c"></i></span><span>${t.fecha}: <i class="c"></i></span></div>` : "";
  return {total, html: `<article class="imp-hoja ${S.grande ? "grande" : ""}">${cab}<header class="imp-tit"><small>${t.lect} · ${t.nivel} ${esc(R.level)}${S.tema ? " · " + esc(S.tema) : ""}</small><h1>${esc(R.title)}</h1>${S.trAyuda && tr.title ? `<p>${esc(tr.title)}${tr.sub ? " · " + esc(tr.sub) : ""}</p>` : ""}</header>${html}</article>`};
}
function pintar() {
  const M = document.querySelector(".imp-lect"); if (!M || !S) return;
  const pv = M.querySelector(".imp-prev"), top = pv.scrollTop, {total, html} = hojaHTML();
  pv.innerHTML = (S.quit.size ? `<p class="imp-aviso">Has quitado ${S.quit.size} ${S.quit.size === 1 ? "ejercicio" : "ejercicios"}. <button type="button" class="imp-mini" data-impl="reponer">Volver a ponerlos</button></p>` : "") + html;
  pv.scrollTop = top;
  M.querySelector(".imp-cuenta").textContent = `${total} ${total === 1 ? "ejercicio" : "ejercicios"}${S.texto ? " · con el texto" : ""}`;
}
function imprimir() {
  const t0 = document.title; document.title = `${S.R.title} (${S.R.level})`;
  const fin = () => { document.title = t0; removeEventListener("afterprint", fin); };
  addEventListener("afterprint", fin);
  try { window.print(); } catch (e) {}
  setTimeout(fin, 60000);
}
document.addEventListener("click", e => {
  const b = e.target.closest?.("[data-impl]"); if (!b) return;
  const a = b.dataset.impl;
  if (a === "abrir") { e.preventDefault(); return abrir(); }
  if (!S) return;
  if (a === "cerrar") return cerrar();
  if (a === "imprimir") return imprimir();
  if (a === "ver") { const pv = document.querySelector(".imp-lect .imp-prev"), c = document.querySelector(".imp-lect .imp-cuerpo"); if (pv && c) c.scrollTo({top: pv.offsetTop - c.offsetTop, behavior: "smooth"}); return; }
  if (a === "quitar") { S.quit.add(b.dataset.k); return pintar(); }
  if (a === "reponer") { S.quit.clear(); return pintar(); }
  if (["solo-texto", "texto-preg", "solo-preg", "todo"].includes(a)) return preset(a);
});
addEventListener("keydown", e => { if (e.key === "Escape" && S) cerrar(); });
addEventListener("hashchange", () => { if (S) cerrar(); });

/* ---------- el botón, debajo del título de la lectura ---------- */
function poner() {
  const app = document.getElementById("app"), x = lecturaAbierta(); if (!app || !x) return;
  if (app.querySelector(".imp-barra-l")) return;
  const h1 = app.querySelector(".wrap > h1"); if (!h1) return;
  const ancla = h1.nextElementSibling?.classList.contains("en") ? h1.nextElementSibling : h1;
  ancla.insertAdjacentHTML("afterend", `<p class="imp-barra imp-barra-l"><button type="button" class="btn imp-abrir imp-abrir-l" data-impl="abrir">🖨️ Imprimir</button><span class="imp-small">El texto, las preguntas, el vocabulario o la gramática: tú eliges</span></p>`);
}
function vigilar() {
  const app = document.getElementById("app"); if (!app) return setTimeout(vigilar, 300);
  new MutationObserver(poner).observe(app, {childList: true});
  poner();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", vigilar); else vigilar();
window.LYAImprimirLectura = {abrir, cerrar, _S: () => S};
})();
