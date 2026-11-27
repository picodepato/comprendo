/* COMPRENDO · 🖨️ Imprimir tema: una hoja limpia para imprimir o guardar en PDF, hecha a medida.
   Sale un botón «🖨️ Imprimir tema» en cada tema y en cada apartado de las asignaturas por temas
   (Matemáticas 1.º ESO y 4.º ESO PDC; y FP Básica cuando está cargada). Lo pone este archivo solo, sin tocar las páginas:
   mira la dirección y, si es un tema o un apartado de una «fuente» conocida, añade el botón debajo del título.
   El panel deja elegir:
     · el tema entero o solo algunos apartados (si se abre desde un apartado, sale ese marcado)
     · explicación sí o no (con dibujos, con ejemplos resueltos)
     · actividades sí o no: cuántas por apartado, en qué niveles (Fácil, Medio, Difícil, mezclables), qué tipos de ejercicio,
       y un repaso mezclado al final. En la vista previa se puede quitar o cambiar cada actividad.
     · pistas: no, debajo de cada actividad o al final (solo la primera o todas)
     · soluciones: no, al final o en hoja aparte (con «cómo se hace» o sin él)
     · nombre y fecha arriba, sitio para contestar y letra grande
   Las actividades salen de los mismos bancos que la práctica, con semilla: al cambiar una opción no cambian las actividades;
   «🔄 Otras actividades» saca otras. Las opciones se recuerdan en el navegador (localStorage «lyaImprimir»).
   Para otra asignatura por temas: LYAImprimir.fuente(id, {ruta, tema, curso, rng, gen, preg, firma, tipos?, pesoOk?, figs?}). */
(() => {
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const limpia = s => String(s ?? "").replace(/[\u0001\u0002]/g, "");
const DIF = ["", "Fácil", "Medio", "Difícil"];
const LET = "abcdefghij";
const store = {get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }};
/* semilla a partir de varios trozos (FNV-1a) */
const hash = (...xs) => { let h = 2166136261; for (const c of xs.join("|")) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

/* ======================= fuentes ======================= */
const FUENTES = {};
const fuente = (id, f) => { FUENTES[id] = {id, ...f}; };

/* ---------- Matemáticas (mates/temas.js + mates/banco.js o mates/pdc.js) ---------- */
const TM = () => window.LYAMatesTemas, MB = () => window.LYAMatesBanco;
const bancoM = T => (TM()?.banco ? TM().banco(T.id) : null) || MB();
const lineaM = (ud, pre = "=") => `<p class="imp-resp">${pre} <span class="imp-linea"></span>${ud ? ` ${esc(ud)}` : ""}</p>`;
function rectaM(q) {
  const W = 640, H = 80, pad = 26, n = q.hasta - q.desde, x = v => pad + (W - 2 * pad) * (v - q.desde) / n, lab = q.d === 1 ? 2 : q.d === 2 ? 5 : 10;
  let s = `<line x1="${pad - 14}" y1="40" x2="${W - pad + 14}" y2="40" stroke="#222" stroke-width="2"/>`;
  for (let v = q.desde; v <= q.hasta; v++) {
    const big = v === 0 || v % lab === 0;
    s += `<line x1="${x(v)}" y1="${big ? 30 : 34}" x2="${x(v)}" y2="${big ? 50 : 46}" stroke="#222" stroke-width="${big ? 2 : 1.2}"/>`;
    if (big || v === q.desde || v === q.hasta) s += `<text x="${x(v)}" y="72" text-anchor="middle" font-size="16" fill="#222">${esc(MB().s(v))}</text>`;
  }
  s += `<circle cx="${x(q.sol)}" cy="40" r="8" fill="#222"/>`;
  return `<svg class="imp-recta" viewBox="0 0 ${W} ${H}" role="img" aria-label="Recta numérica de ${q.desde} a ${q.hasta} con un punto marcado">${s}</svg>`;
}
fuente("mates", {
  nombre: "Matemáticas",
  ruta(h) { const m = h.match(/^mates-([a-z]\d+)(?:-([1-8]|repaso))?$/); return m && TM()?.tema?.(m[1]) ? {tema: m[1], ap: m[2] && m[2] !== "repaso" ? +m[2] : null} : null; },
  tema: id => TM()?.tema?.(id),
  curso: T => "Matemáticas · " + (TM()?.cursoDe?.(T.id)?.n || ""),
  rng: seed => MB().Rn(seed),
  tipos: (T, ap) => bancoM(T).HAB?.[ap] || null,
  pesoOk: (T, ap, g, d) => { const w = bancoM(T).AP?.[ap]?.pesos?.[d - 1]; return !w || (w[g] || 0) > 0; },
  gen(T, ap, d, r, g) {
    const Bk = bancoM(T); let q = null;
    if (g !== undefined && Bk.AP?.[ap]?.[g]) { try { q = Bk.AP[ap][g](r, d); } catch (e) { q = null; } if (q) Object.assign(q, {ap, d, g}); }
    return q || Bk.gen(ap, d, r);
  },
  firma: q => q.tipo + "|" + q.enun + "|" + (q.expr || q.nums?.join(",") || q.sol),
  figs(T, A) { const f = window.LYAMatesDibujos?.[T.id]?.[A.n]; try { return f ? f() : ""; } catch (e) { return ""; } },
  preg(T, q, o) {
    const Bk = bancoM(T), Bs = MB(), conUd = v => Bk.conUd ? Bk.conUd(v, q.ud) : Bs.s(v);
    const enunTxt = q.fig ? `<div class="imp-tbw">${q.fig}</div>` : q.prob ? `<p class="imp-prob">${esc(q.expr)}</p>` : q.expr && q.tipo !== "recta" ? `<p class="imp-expr">${esc(limpia(q.expr))}</p>` : "";
    let cuerpo = "", sol = "", como = [], pistas = [];
    if (q.tipo === "num") { cuerpo = enunTxt + (o.hueco ? lineaM(q.ud, q.prob || q.fig || /▢/.test(q.expr || "") || !q.expr ? "Respuesta:" : "=") : ""); sol = conUd(q.sol); }
    else if (q.tipo === "recta") { cuerpo = rectaM(q) + (o.hueco ? lineaM("", "El punto es el") : ""); sol = Bs.s(q.sol); }
    else if (q.tipo === "opc") {
      const corto = q.opciones.every(x => String(x).length <= 3);
      cuerpo = enunTxt + `<ol class="imp-ops ${corto ? "corto" : ""}">${q.opciones.map((x, i) => `<li><span class="imp-bola"></span><b>${LET[i]})</b> ${esc(x)}</li>`).join("")}</ol>`;
      sol = `${LET[q.ok]}) ${q.opciones[q.ok]}`;
    }
    else if (q.tipo === "orden") {
      const bueno = [...q.nums].sort((a, b) => q.asc ? a - b : b - a), sig = q.asc ? "<" : ">";
      cuerpo = `<p class="imp-expr">${q.nums.map(v => esc(Bs.sg(v))).join(" &nbsp; · &nbsp; ")}</p>` + (o.hueco ? `<p class="imp-cajas">${q.nums.map(() => `<span class="imp-caja"></span>`).join(` <b>${sig}</b> `)}</p>` : "");
      sol = bueno.map(Bs.sg).join(` ${sig} `);
    }
    else if (q.tipo === "resto") { cuerpo = enunTxt + (o.hueco ? `<p class="imp-resp">Raíz entera: <span class="imp-linea corta"></span> &nbsp; Resto: <span class="imp-linea corta"></span></p>` : ""); sol = `Raíz entera ${q.sol} y resto ${q.resto}`; }
    else if (q.tipo === "pasos") {
      const R = q.R ||= Bs.resolver(q.arbol);
      cuerpo = enunTxt + (o.hueco ? `<div class="imp-renglones">${Array(Math.min(6, (R?.pasos.length || 3) + 1)).fill('<span class="imp-renglon"></span>').join("")}</div>` : "");
      sol = R ? Bs.s(R.v) : Bs.s(q.sol);
      como = R ? R.pasos.map(x => `${x.parte} = ${Bs.s(x.v)} → ${limpia(x.despues)}`) : [];
      pistas = [...Bk.pistas(q), ...(R?.pasos[0] ? Bs.pistaPaso(R.pasos[0]).slice(0, 1).map(t => "Primer paso: " + t) : [])];
    }
    else cuerpo = enunTxt;
    if (!como.length) como = q.res || (q.ayuda ? [q.ayuda] : []);
    if (!pistas.length) pistas = Bk.pistas(q) || [];
    return {enun: esc(q.enun), cuerpo, sol: esc(sol), como: como.map(x => esc(limpia(x))), pistas: pistas.map(x => esc(limpia(x)))};
  }
});

/* ---------- FP Básica (fpb/fpb.js y sus asignaturas: Lengua, Sociales…) ---------- */
const FP = () => window.LYAFpb;
fuente("fpb", {
  nombre: "FP Básica",
  ruta(h) { const m = h.match(/^fpb-([a-z]\d+)(?:-(\d+|repaso))?$/); return m && FP()?.tema?.(m[1]) ? {tema: m[1], ap: m[2] && m[2] !== "repaso" ? +m[2] : null} : null; },
  tema: id => FP()?.tema?.(id),
  curso: T => "FP Básica · " + (FP()?.asigDe?.(T.id)?.n || ""),
  rng: seed => FP().H.Rn(seed),
  gen: (T, ap, d, r) => FP().gen(T.id, ap, d, r),
  firma: q => q.e + "|" + (q.t || "") + "|" + (q.tipo === "rel" ? q.pares.map(p => p[0]).join() : q.tipo === "cla" ? q.items.map(i => i.t).join() : ""),
  preg(T, q, o) {
    const cita = q.t ? `<blockquote class="imp-cita">${q.t.split("\n").map(esc).join("<br>")}</blockquote>` : "";
    const img = q.img ? `<div class="imp-img">${q.img}</div>` : "";
    let cuerpo = "", sol = "";
    if (q.tipo === "rel") {
      cuerpo = `<table class="imp-rel"><tr><td><ol>${q.pares.map(p => `<li>${esc(p[0])}</li>`).join("")}</ol></td><td><ol type="a">${q.der.map(i => `<li>${esc(q.pares[i][1])}</li>`).join("")}</ol></td></tr></table>`
        + (o.hueco ? `<p class="imp-resp">${q.pares.map((_, i) => `${i + 1} → <span class="imp-linea mini"></span>`).join(" &nbsp; ")}</p>` : "");
      sol = q.pares.map((p, i) => `${i + 1} → ${LET[q.der.indexOf(i)]} (${esc(p[1])})`).join(" · ");
    } else if (q.tipo === "cla") {
      const filas = Math.max(2, Math.ceil(q.items.length / q.cajas.length) + 1);
      cuerpo = `<p class="imp-pal">${q.items.map(i => `<span>${esc(i.t)}</span>`).join("")}</p>`
        + (o.hueco ? `<table class="imp-cla"><tr>${q.cajas.map(c => `<th>${esc(c)}</th>`).join("")}</tr>${Array(filas).fill(`<tr>${q.cajas.map(() => "<td></td>").join("")}</tr>`).join("")}</table>` : `<p class="imp-small">Cajas: ${q.cajas.map(esc).join(" · ")}</p>`);
      sol = q.cajas.map((c, k) => `<b>${esc(c)}</b>: ${q.items.filter(i => i.c === k).map(i => esc(i.t)).join(", ")}`).join(" · ");
    } else {
      const ops = q.ops || [], ok = ops.findIndex(x => x.ok);
      cuerpo = `<ol class="imp-ops">${ops.map((x, i) => `<li><span class="imp-bola"></span><b>${LET[i]})</b> ${esc(x.t)}</li>`).join("")}</ol>`;
      sol = ok >= 0 ? `${LET[ok]}) ${esc(ops[ok].t)}` : "";
    }
    /* fuera las pistas que solo tienen sentido en la pantalla (🔊, «se quedan en verde»…) */
    const pantalla = /🔊|escuchar|en verde|te digo por qué|toca /i;
    return {enun: esc(q.e), cuerpo: cita + img + cuerpo, sol, como: (q.r || []).map(esc), pistas: (q.pi || []).filter(t => !pantalla.test(t)).map(esc)};
  }
});

/* ======================= opciones ======================= */
const DEF = {teo: true, dib: true, ejs: true, act: true, n: 5, niv: [1], rep: 0, pistas: "no", npist: "una", sol: "final", como: true, nombre: true, hueco: true, grande: false};
let S = null; /* el panel abierto: {f, T, aps:Set, tipos:{ap:[g]}, base, bump:{}, quit:Set, ...opciones} */

function abrir(fid, temaId, ap) {
  const f = FUENTES[fid], T = f?.tema(temaId); if (!T) return;
  const guard = {...DEF, ...(store.get("lyaImprimir") || {})};
  S = {...guard, f, T, desde: ap || null, aps: new Set(ap ? [ap] : T.aps.map(a => a.n)), tipos: {}, base: Math.floor(Math.random() * 1e9), bump: {}, quit: new Set()};
  if (!Array.isArray(S.niv) || !S.niv.length) S.niv = [1];
  cerrar(true);
  const M = document.createElement("div");
  M.className = "imp-modal"; M.setAttribute("role", "dialog"); M.setAttribute("aria-modal", "true"); M.setAttribute("aria-label", "Imprimir tema");
  M.innerHTML = `<div class="imp-top"><b>🖨️ Imprimir · Tema ${esc(T.n)} · ${esc(T.titulo)}</b><button type="button" class="imp-x" data-imp="cerrar" aria-label="Cerrar">✕</button></div>
    <div class="imp-cuerpo"><form class="imp-panel" onsubmit="return false">${panelHTML()}</form><div class="imp-prev"></div></div>
    <div class="imp-bar"><span class="imp-cuenta"></span><button type="button" class="btn imp-ver" data-imp="ver">👀 Ver la hoja</button><button type="button" class="btn" data-imp="otras">🔄 Otras actividades</button><button type="button" class="btn main" data-imp="imprimir">🖨️ Imprimir o guardar PDF</button></div>`;
  document.body.appendChild(M);
  document.documentElement.classList.add("imp-on");
  M.querySelector(".imp-panel").addEventListener("change", cambio);
  M.querySelector(".imp-panel").addEventListener("input", e => { if (e.target.type === "number") cambio(e); });
  visibles(); pintar();
  try { M.querySelector(".imp-x").focus(); } catch (e) {}
}
function cerrar(sinFoco) {
  document.querySelector(".imp-modal")?.remove();
  document.documentElement.classList.remove("imp-on");
  if (!sinFoco) try { document.querySelector(".imp-abrir")?.focus(); } catch (e) {}
}
const guardar = () => { const o = {}; for (const k of Object.keys(DEF)) o[k] = S[k]; store.set("lyaImprimir", o); };

const chk = (name, on, txt, extra = "") => `<label class="imp-chk"><input type="checkbox" name="${name}" ${on ? "checked" : ""} ${extra}> <span>${txt}</span></label>`;
const rad = (name, val, on, txt) => `<label class="imp-chk"><input type="radio" name="${name}" value="${val}" ${on ? "checked" : ""}> <span>${txt}</span></label>`;
function panelHTML() {
  const {T, f} = S;
  return `
  <fieldset><legend>📚 ¿Qué parte del tema?</legend>
    <p class="imp-fila"><button type="button" class="imp-mini" data-imp="todos">Todo el tema</button><button type="button" class="imp-mini" data-imp="ninguno">Ninguno</button>${S.desde ? `<button type="button" class="imp-mini" data-imp="solo">Solo el apartado ${S.desde}</button>` : ""}</p>
    <div class="imp-aps">${T.aps.map(a => {
      const tipos = f.tipos?.(T, a.n);
      return `<div class="imp-ap">${chk("ap", S.aps.has(a.n), `<b>${a.n}.</b> ${esc(a.titulo)}`, `value="${a.n}"`)}
        ${tipos?.length ? `<details class="imp-tipos" data-ap="${a.n}"><summary>Tipos de ejercicio</summary>${tipos.map((t, g) => chk("tipo", true, esc(t), `data-ap="${a.n}" value="${g}"`)).join("")}</details>` : ""}</div>`;
    }).join("")}</div>
  </fieldset>
  <fieldset><legend>📘 Explicación</legend>
    ${chk("teo", S.teo, "Incluir la explicación")}
    <div class="imp-sub" data-dep="teo">${chk("dib", S.dib, "Con dibujos")}${chk("ejs", S.ejs, "Con ejemplos resueltos")}</div>
  </fieldset>
  <fieldset><legend>✏️ Actividades</legend>
    ${chk("act", S.act, "Incluir actividades")}
    <div class="imp-sub" data-dep="act">
      <label class="imp-num">Por apartado <input type="number" name="n" min="1" max="20" value="${S.n}" inputmode="numeric"></label>
      <p class="imp-lab">Nivel <small>(puedes marcar varios: se reparten)</small></p>
      <p class="imp-fila">${[1, 2, 3].map(d => chk("niv", S.niv.includes(d), DIF[d], `value="${d}"`)).join("")}</p>
      <label class="imp-num">Repaso mezclado al final <input type="number" name="rep" min="0" max="30" value="${S.rep}" inputmode="numeric"></label>
      ${chk("hueco", S.hueco, "Dejar sitio para contestar")}
      <p class="imp-small">En la vista previa puedes quitar (✕) o cambiar (🔄) cada actividad.</p>
    </div>
  </fieldset>
  <fieldset data-dep="act"><legend>💡 Pistas</legend>
    ${rad("pistas", "no", S.pistas === "no", "Sin pistas")}${rad("pistas", "debajo", S.pistas === "debajo", "Debajo de cada actividad")}${rad("pistas", "final", S.pistas === "final", "Todas juntas al final")}
    <div class="imp-sub" data-dep="pistas">${rad("npist", "una", S.npist === "una", "Solo la primera pista")}${rad("npist", "todas", S.npist === "todas", "Todas las pistas (de menos a más)")}</div>
  </fieldset>
  <fieldset data-dep="act"><legend>✅ Soluciones</legend>
    ${rad("sol", "no", S.sol === "no", "Sin soluciones")}${rad("sol", "final", S.sol === "final", "Al final")}${rad("sol", "aparte", S.sol === "aparte", "En una hoja aparte (para el profe o para recortar)")}
    <div class="imp-sub" data-dep="sol">${chk("como", S.como, "Con «cómo se hace» (los pasos)")}</div>
  </fieldset>
  <fieldset><legend>📄 La hoja</legend>
    ${chk("nombre", S.nombre, "Nombre, curso y fecha arriba")}${chk("grande", S.grande, "Letra grande")}
  </fieldset>`;
}
function visibles() {
  const F = document.querySelector(".imp-panel"); if (!F) return;
  const on = {teo: S.teo, act: S.act, pistas: S.pistas !== "no", sol: S.sol !== "no"};
  F.querySelectorAll("[data-dep]").forEach(el => { el.hidden = !on[el.dataset.dep]; });
}
function cambio(e) {
  const t = e.target, F = t.form; if (!F) return;
  const n = t.name;
  if (n === "ap") { const v = +t.value; t.checked ? S.aps.add(v) : S.aps.delete(v); }
  else if (n === "tipo") { const ap = +t.dataset.ap; S.tipos[ap] = [...F.querySelectorAll(`input[name=tipo][data-ap="${ap}"]`)].filter(x => x.checked).map(x => +x.value); if (S.tipos[ap].length === F.querySelectorAll(`input[name=tipo][data-ap="${ap}"]`).length) delete S.tipos[ap]; }
  else if (n === "niv") { const v = [...F.querySelectorAll("input[name=niv]")].filter(x => x.checked).map(x => +x.value); if (!v.length) { t.checked = true; return; } S.niv = v; }
  else if (n === "n" || n === "rep") { const v = parseInt(t.value, 10); if (!Number.isFinite(v)) return; S[n] = Math.max(n === "n" ? 1 : 0, Math.min(n === "n" ? 20 : 30, v)); }
  else if (t.type === "checkbox") S[n] = t.checked;
  else if (t.type === "radio") S[n] = t.value;
  else return;
  guardar(); visibles(); pintar();
}

/* ======================= actividades ======================= */
/* el nivel de la actividad i de n: los niveles marcados, repartidos en orden (primero las fáciles) */
const nivelDe = (i, n) => { const v = [...S.niv].sort(); return v[Math.min(v.length - 1, Math.floor(i * v.length / n))]; };
function una(key, ap, i, d, vistas) {
  const {f, T} = S;
  let tipos = S.tipos[ap];
  if (tipos && f.pesoOk) { const ok = tipos.filter(g => f.pesoOk(T, ap, g, d)); if (ok.length) tipos = ok; }
  if (tipos && !tipos.length) tipos = null;
  let q = null;
  for (let t = 0; t < 14; t++) {
    const r = f.rng(hash(S.base, T.id, key, d, (tipos || []).join(""), S.bump[key] || 0, t));
    const g = tipos ? tipos[(i + hash(S.base, ap, S.bump[key] || 0) + t) % tipos.length] : undefined;
    try { q = f.gen(T, ap, d, r, g); } catch (e) { q = null; }
    if (q && !vistas.has(f.firma(q))) break;
  }
  if (q) vistas.add(f.firma(q));
  return q;
}
function listas() {
  const {T} = S, out = [], vistas = new Set();
  for (const A of T.aps) {
    if (!S.aps.has(A.n)) continue;
    const acts = [];
    if (S.act) for (let i = 0; i < S.n; i++) { const key = `${A.n}.${i}`; if (S.quit.has(key)) continue; const d = nivelDe(i, S.n), q = una(key, A.n, i, d, vistas); if (q) acts.push({key, q, d}); }
    out.push({A, acts});
  }
  let rep = [];
  const aps = [...S.aps].sort((a, b) => a - b);
  if (S.act && S.rep && aps.length) for (let i = 0; i < S.rep; i++) {
    const key = `R.${i}`; if (S.quit.has(key)) continue;
    const ap = aps[hash(S.base, "rep", i) % aps.length], d = nivelDe(i, S.rep), q = una(key, ap, i, d, vistas); if (q) rep.push({key, q, d});
  }
  return {aps: out, rep};
}

/* ======================= la hoja ======================= */
function teoHTML(A) {
  const figs = S.dib ? (S.f.figs?.(S.T, A) || "") + (A.img ? `<div class="imp-img">${A.img}</div>` : "") : "";
  return `<div class="imp-teo"><p class="imp-idea">${A.ic ? A.ic + " " : ""}${esc(A.idea)}</p>
    ${figs ? `<div class="imp-figs">${figs}</div>` : ""}
    <ul class="imp-reglas">${(A.reglas || []).map(r => `<li>${r}</li>`).join("")}</ul>
    ${A.glosario?.length ? `<div class="imp-glo"><p class="imp-lab">📖 Palabras difíciles</p><dl>${A.glosario.map(([p, s]) => `<div><dt>${esc(p)}</dt><dd>${esc(s)}</dd></div>`).join("")}</dl></div>` : ""}
    ${(A.textos || []).map(t => `<div class="imp-texto"><p class="imp-lab">📜 Texto ${esc(t.n)}: <i>${esc(t.titulo)}</i> · ${esc(t.autor)}</p><div class="${t.prosa ? "prosa" : ""}">${t.versos.map(v => v ? `<p>${esc(v)}</p>` : `<p class="imp-blanco"></p>`).join("")}</div></div>`).join("")}
    ${S.ejs && A.ejemplos?.length ? A.ejemplos.map(e => `<div class="imp-ej"><p><b>Ejemplo.</b> ${esc(e.q)}</p><ol>${e.pasos.map(x => `<li>${esc(x)}</li>`).join("")}</ol><p>👉 <b>${esc(e.r)}</b></p></div>`).join("") : ""}
    ${A.ojo ? `<p class="imp-ojo">⚠️ ${esc(A.ojo)}</p>` : ""}</div>`;
}
const pistasDe = P => S.npist === "todas" ? P.pistas : P.pistas.slice(0, 1);
function actHTML(x, num, sec) {
  const P = S.f.preg(S.T, x.q, {hueco: S.hueco}); x.P = P;
  const ps = pistasDe(P);
  return `<li class="imp-act"><div class="imp-acab"><span class="imp-n">${num}</span><p class="imp-enun">${P.enun}${S.niv.length > 1 ? ` <small class="imp-nv">${"●".repeat(x.d)}${"○".repeat(3 - x.d)}</small>` : ""}${sec ? ` <small class="imp-nv">(${esc(sec)})</small>` : ""}</p>
    <span class="imp-ctl"><button type="button" data-imp="cambiar" data-k="${x.key}" title="Cambiar por otra" aria-label="Cambiar la actividad ${num} por otra">🔄</button><button type="button" data-imp="quitar" data-k="${x.key}" title="Quitar" aria-label="Quitar la actividad ${num}">✕</button></span></div>
    <div class="imp-acu">${P.cuerpo}</div>
    ${S.pistas === "debajo" && ps.length ? `<div class="imp-pistas">${ps.map((t, i) => `<p>💡${ps.length > 1 ? ` <b>${i + 1}.</b>` : ""} ${t}</p>`).join("")}</div>` : ""}</li>`;
}
function hojaHTML() {
  const {T, f} = S, L = listas(), nombreAp = n => T.aps.find(a => a.n === n)?.titulo || "";
  let total = 0, html = "";
  const finalP = [], finalS = [];
  for (const {A, acts} of L.aps) {
    html += `<section class="imp-sec"><h2><span>${A.n}</span> ${A.ic ? A.ic + " " : ""}${esc(A.titulo)}</h2>`;
    if (S.teo) html += teoHTML(A);
    if (acts.length) {
      html += `<h3>✏️ Actividades${S.niv.length === 1 ? ` · ${DIF[S.niv[0]]}` : ""}</h3><ol class="imp-acts">${acts.map((x, i) => actHTML(x, i + 1)).join("")}</ol>`;
      total += acts.length;
      finalP.push({t: `${A.n}. ${A.titulo}`, xs: acts}); finalS.push({t: `${A.n}. ${A.titulo}`, xs: acts});
    }
    html += `</section>`;
  }
  if (L.rep.length) {
    html += `<section class="imp-sec"><h2><span>🔁</span> Repaso del tema</h2><ol class="imp-acts">${L.rep.map((x, i) => actHTML(x, i + 1, nombreAp(x.q.ap))).join("")}</ol></section>`;
    total += L.rep.length; finalP.push({t: "Repaso del tema", xs: L.rep}); finalS.push({t: "Repaso del tema", xs: L.rep});
  }
  if (!L.aps.length) html += `<p class="imp-vacio">Marca al menos un apartado.</p>`;
  else if (!S.teo && !total) html += `<p class="imp-vacio">Marca la explicación o las actividades.</p>`;
  if (S.pistas === "final" && total) html += `<section class="imp-sec imp-final"><h2><span>💡</span> Pistas</h2>${finalP.map(g => `<h3>${esc(g.t)}</h3><ol class="imp-sols">${g.xs.map(x => { const ps = pistasDe(x.P); return `<li>${ps.length ? ps.join(" · ") : "—"}</li>`; }).join("")}</ol>`).join("")}</section>`;
  if (S.sol !== "no" && total) html += `<section class="imp-sec imp-final ${S.sol === "aparte" ? "imp-aparte" : ""}"><h2><span>✅</span> Soluciones</h2>${S.sol === "aparte" ? `<p class="imp-small">${esc(f.curso(T))} · Tema ${esc(T.n)} · ${esc(T.titulo)}</p>` : ""}${finalS.map(g => `<h3>${esc(g.t)}</h3><ol class="imp-sols">${g.xs.map(x => `<li><b>${x.P.sol}</b>${S.como && x.P.como.length ? `<span class="imp-como">${x.P.como.join(" · ")}</span>` : ""}</li>`).join("")}</ol>`).join("")}</section>`;
  const cab = S.nombre ? `<div class="imp-datos"><span>Nombre: <i></i></span><span>Curso: <i class="c"></i></span><span>Fecha: <i class="c"></i></span></div>` : "";
  return {total, html: `<article class="imp-hoja ${S.grande ? "grande" : ""}">${cab}
    <header class="imp-tit"><small>${esc(f.curso(T))} · Tema ${esc(T.n)}</small><h1>${T.ic ? T.ic + " " : ""}${esc(T.titulo)}</h1>${S.teo && T.intro && S.aps.size === T.aps.length ? `<p>${esc(T.intro)}</p>` : ""}</header>
    ${html}</article>`};
}
function pintar() {
  const M = document.querySelector(".imp-modal"); if (!M || !S) return;
  const pv = M.querySelector(".imp-prev"), top = pv.scrollTop, {total, html} = hojaHTML();
  pv.innerHTML = (S.quit.size ? `<p class="imp-aviso">Has quitado ${S.quit.size} ${S.quit.size === 1 ? "actividad" : "actividades"}. <button type="button" class="imp-mini" data-imp="reponer">Volver a ponerlas</button></p>` : "") + html;
  pv.scrollTop = top;
  M.querySelector(".imp-cuenta").textContent = `${S.aps.size} ${S.aps.size === 1 ? "apartado" : "apartados"} · ${total} ${total === 1 ? "actividad" : "actividades"}`;
  M.querySelector("[data-imp=otras]").hidden = !total;
}
function imprimir() {
  const t0 = document.title;
  document.title = `${S.T.titulo} · Tema ${S.T.n}`;
  const fin = () => { document.title = t0; removeEventListener("afterprint", fin); };
  addEventListener("afterprint", fin);
  try { window.print(); } catch (e) {}
  setTimeout(fin, 60000);
}

document.addEventListener("click", e => {
  const b = e.target.closest?.("[data-imp]"); if (!b) return;
  const a = b.dataset.imp;
  if (a === "abrir") { e.preventDefault(); return abrir(b.dataset.f, b.dataset.t, b.dataset.ap ? +b.dataset.ap : null); }
  if (!S) return;
  if (a === "cerrar") return cerrar();
  if (a === "imprimir") return imprimir();
  if (a === "ver") { const pv = document.querySelector(".imp-prev"), c = document.querySelector(".imp-cuerpo"); if (pv && c) c.scrollTo({top: pv.offsetTop - c.offsetTop, behavior: "smooth"}); return; }
  if (a === "otras") { S.base = Math.floor(Math.random() * 1e9); S.bump = {}; S.quit.clear(); return pintar(); }
  if (a === "cambiar") { S.bump[b.dataset.k] = (S.bump[b.dataset.k] || 0) + 1; return pintar(); }
  if (a === "quitar") { S.quit.add(b.dataset.k); return pintar(); }
  if (a === "reponer") { S.quit.clear(); return pintar(); }
  if (a === "todos" || a === "ninguno" || a === "solo") {
    S.aps = new Set(a === "todos" ? S.T.aps.map(x => x.n) : a === "solo" ? [S.desde] : []);
    document.querySelectorAll(".imp-panel input[name=ap]").forEach(x => { x.checked = S.aps.has(+x.value); });
    return pintar();
  }
});
addEventListener("keydown", e => { if (e.key === "Escape" && document.querySelector(".imp-modal")) cerrar(); });
addEventListener("hashchange", () => cerrar(true));

/* ======================= el botón en las páginas ======================= */
function boton(fid, temaId, ap) {
  return `<p class="imp-barra"><button type="button" class="btn imp-abrir" data-imp="abrir" data-f="${esc(fid)}" data-t="${esc(temaId)}"${ap ? ` data-ap="${ap}"` : ""}>🖨️ Imprimir tema</button><span class="imp-small">${ap ? "Este apartado o el tema entero, a tu gusto" : "Explicación, actividades, pistas y soluciones, a tu gusto"}</span></p>`;
}
function poner() {
  const app = document.getElementById("app"); if (!app) return;
  const h = location.hash.slice(1);
  for (const f of Object.values(FUENTES)) {
    let r = null; try { r = f.ruta(h); } catch (e) {}
    if (!r) continue;
    const h1 = app.querySelector(".wrap .mt-h1"); if (!h1) return;
    const ya = app.querySelector(".imp-barra");
    const firma = `${f.id}|${r.tema}|${r.ap || ""}`;
    if (ya && ya.dataset.k === firma) return;
    ya?.remove();
    h1.insertAdjacentHTML("afterend", boton(f.id, r.tema, r.ap));
    app.querySelector(".imp-barra").dataset.k = firma;
    return;
  }
}
function vigilar() {
  const app = document.getElementById("app"); if (!app) return setTimeout(vigilar, 300);
  new MutationObserver(poner).observe(app, {childList: true});
  poner();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", vigilar); else vigilar();

window.LYAImprimir = {fuente, abrir, cerrar, boton, _S: () => S, _fuentes: FUENTES}; /* _S: para las pruebas (qa/prueba-imprimir.mjs) */
})();
