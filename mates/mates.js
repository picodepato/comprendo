/* COMPRENDO · Matemáticas (1.º ESO, en castellano). Apartado «➗ Mates» de la barra.
   Rutas:
     #mates              portada: cursos y temas, y los juegos de mates en grupo
     #mates-t2           el tema: sus apartados (con estrellas), el repaso y «Jugar con la clase»
     #mates-t2-<1..8>    un apartado: 📘 Aprende (explicación de mates/temas.js) y ✏️ Practica (ejercicios de mates/banco.js)
     #mates-t2-repaso    repaso del tema: un poco de todo
   Los juegos en grupo están en mates/grupo.js (#mates-grupo, #mates-juego-<juego>, #mates-sala-<código>, #mates-pizarra-<código>).
   Práctica: 10 ejercicios (12 en el repaso) en Fácil, Medio o Difícil. Teclado propio con botón ± (en el móvil el teclado numérico no trae el menos).
   Las operaciones combinadas se hacen paso a paso: sale resaltado lo que toca y la web dice en qué paso te equivocas.
   Progreso en S.g.mt["t2-<n>"] = {e: [estrellas en fácil, medio, difícil], n: veces, ok: aciertos} (se guarda con la cuenta).
   XP: 2 / 3 / 4 por acierto según la dificultad (evento lya:xp, src "mates"). */
(() => {
const B = () => window.LYAMatesBanco, TM = () => window.LYAMatesTemas;
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const RE = /^mates(?:-(t\d+)(?:-([1-8]|repaso))?)?$/;
const isMates = h => RE.test(h) || window.LYAMatesGrupo?.isGrupo(h);
const DIF = ["", "Fácil", "Medio", "Difícil"];
const COLOR = "#4f8cff";
const store = {get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }};
const prog = () => { const {S} = st(); S.g ||= {}; return (S.g.mt ||= {}); };
const estrellas = n => "★".repeat(n) + "☆".repeat(3 - n);
const tema = id => TM().cursos[0].temas.find(t => t.id === id);
/* «\u0001…\u0002» de banco.js → resaltado */
const marca = t => esc(t).replace(/\u0001/g, '<mark class="mt-hl">').replace(/\u0002/g, "</mark>");

let P = null; /* la práctica que está en marcha */
let tab = {};  /* pestaña de cada apartado: aprende | practica */

function render(app) {
  const h = location.hash.slice(1);
  try { L().setAcc?.(COLOR); } catch (e) {}
  if (window.LYAMatesGrupo?.isGrupo(h)) return LYAMatesGrupo.render(app);
  const m = h.match(RE);
  if (!m || !B() || !TM()) { app.innerHTML = `<p class="msg">…</p>`; return; }
  if (!m[1]) return portada(app);
  const T = tema(m[1]); if (!T) { location.hash = "mates"; return; }
  if (!m[2]) return temaHTML(app, T);
  if (m[2] === "repaso") return practica(app, T, "repaso");
  return apartado(app, T, +m[2]);
}

/* ---------- portada ---------- */
function portada(app) {
  const C = TM().cursos[0];
  app.innerHTML = `<section class="wrap mt">
    <h1 class="mt-h1">➗ Matemáticas</h1>
    <p class="mt-lead">${esc(C.n)} · Explicaciones, ejercicios que no se acaban nunca y juegos con tu clase.</p>
    <h2 class="mt-h2">📚 Temas de ${esc(C.n)}</h2>
    <div class="mt-temas">${C.temas.map(T => {
      const hechos = T.aps.filter(a => (prog()[`${T.id}-${a.n}`]?.e || []).some(x => x > 0)).length;
      return `<a class="mt-tema" href="#mates-${T.id}" style="--c:${T.color}"><span class="mt-tn">Tema ${T.n}</span><b>${esc(T.titulo)}</b><span class="mt-small">${esc(T.intro)}</span><span class="mt-bar"><i style="width:${100 * hechos / T.aps.length}%"></i></span><span class="mt-small">${hechos} de ${T.aps.length} apartados practicados</span></a>`;
    }).join("")}
      ${C.pronto.map(t => `<div class="mt-tema soon"><span class="mt-tn">Pronto</span><b>${esc(t)}</b></div>`).join("")}</div>
    <h2 class="mt-h2">🏫 Jugar con la clase</h2>
    <p class="mt-small">Con sala y código, como los juegos de las lecturas. Elegís los apartados del tema y la dificultad.</p>
    ${window.LYAMatesGrupo ? LYAMatesGrupo.tiles() : ""}
  </section>`;
}

/* ---------- tema ---------- */
function temaHTML(app, T) {
  const pr = prog();
  app.innerHTML = `<section class="wrap mt" style="--c:${T.color}">
    <p class="mt-migas"><a href="#mates">← Matemáticas</a></p>
    <h1 class="mt-h1"><small>Tema ${T.n}</small> ${esc(T.titulo)}</h1>
    <p class="mt-lead">${esc(T.intro)}</p>
    <div class="mt-aps">${T.aps.map(a => {
      const e = pr[`${T.id}-${a.n}`]?.e || [0, 0, 0];
      return `<a class="mt-ap" href="#mates-${T.id}-${a.n}"><span class="mt-apn">${a.n}</span><span class="mt-apt"><b>${esc(a.titulo)}</b><span class="mt-small">${esc(a.idea)}</span></span><span class="mt-st" title="Fácil, Medio, Difícil">${e.map((x, i) => `<span aria-label="${DIF[i + 1]}: ${x} estrellas">${estrellas(x)}</span>`).join("")}</span></a>`;
    }).join("")}
      <a class="mt-ap mt-rep" href="#mates-${T.id}-repaso"><span class="mt-apn">🔁</span><span class="mt-apt"><b>Repaso del tema</b><span class="mt-small">Un poco de todo, mezclado, como en un examen.</span></span><span class="mt-st">${estrellas((pr[`${T.id}-repaso`]?.e || [0, 0, 0]).reduce((a, b) => Math.max(a, b), 0))}</span></a></div>
    <h2 class="mt-h2">🏫 Jugar con la clase</h2>
    ${window.LYAMatesGrupo ? LYAMatesGrupo.tiles() : ""}
  </section>`;
}

/* ---------- apartado: aprende / practica ---------- */
function apartado(app, T, n) {
  const A = T.aps.find(a => a.n === n), k = `${T.id}-${n}`;
  if (!tab[k]) tab[k] = prog()[k]?.n ? "practica" : "aprende";
  if (P && P.k !== k) P = null;
  const pestanas = `<div class="mt-tabs" role="tablist">${[["aprende", "📘 Aprende"], ["practica", "✏️ Practica"]].map(([id, t]) => `<button type="button" role="tab" data-mt="tab" data-t="${id}" aria-selected="${tab[k] === id}">${t}</button>`).join("")}</div>`;
  const cab = `<p class="mt-migas"><a href="#mates-${T.id}">← Tema ${T.n} · ${esc(T.titulo)}</a></p><h1 class="mt-h1"><small>${n}.</small> ${esc(A.titulo)}</h1>${pestanas}`;
  if (tab[k] === "aprende") {
    app.innerHTML = `<section class="wrap mt" style="--c:${T.color}">${cab}
      <div class="mt-teo"><p class="mt-idea">${A.ic} ${esc(A.idea)}</p>
        <ul class="mt-reglas">${A.reglas.map(r => `<li>${r}</li>`).join("")}</ul>
        ${A.ejemplos.map(e => `<div class="mt-ej"><p class="mt-ejq"><span>Ejemplo</span> ${esc(e.q)}</p><ol>${e.pasos.map(x => `<li>${esc(x)}</li>`).join("")}</ol><p class="mt-ejr">${/=/.test(e.r) ? "" : "= "}<b>${esc(e.r)}</b></p></div>`).join("")}
        ${A.ojo ? `<p class="mt-ojo">⚠️ ${esc(A.ojo)}</p>` : ""}</div>
      <p class="mt-cta"><button class="btn main" type="button" data-mt="tab" data-t="practica">✏️ A practicar</button></p></section>`;
    return;
  }
  practica(app, T, n, cab);
}

/* ---------- práctica ---------- */
function nuevaPractica(T, n, d) {
  const r = B().Rn(Math.floor(Math.random() * 2 ** 31)), aps = n === "repaso" ? T.aps.map(a => a.n) : [n], tot = n === "repaso" ? 12 : 10, serie = [], vistos = new Set();
  for (let i = 0, k = 0; serie.length < tot && k < 200; k++) {
    const ap = n === "repaso" ? aps[(i + Math.floor(r.f() * 2)) % aps.length] : n, q = B().gen(ap, d, r);
    const firma = q.tipo + "|" + q.enun + "|" + (q.expr || q.nums?.join(",") || q.sol);
    if (vistos.has(firma)) continue;
    vistos.add(firma); serie.push(q); i++;
  }
  return {k: `${T.id}-${n}`, T, n, d, serie, i: 0, ok: 0, fase: "preg", inp: "", inp2: "", campo: 0, orden: [], paso: 0, pasoMal: false, pasoFallo: null, xp: 0};
}
function practica(app, T, n, cab) {
  const k = `${T.id}-${n}`;
  cab ||= `<p class="mt-migas"><a href="#mates-${T.id}">← Tema ${T.n} · ${esc(T.titulo)}</a></p><h1 class="mt-h1">🔁 Repaso del tema</h1>`;
  const dGuardada = store.get("lyaMatesDif") || 1;
  if (!P || P.k !== k) {
    app.innerHTML = `<section class="wrap mt" style="--c:${T.color}">${cab}
      <div class="mt-box"><h2>¿Qué dificultad?</h2>
        <div class="mt-dif">${[1, 2, 3].map(d => `<button type="button" class="mt-dbtn" data-mt="empezar" data-d="${d}" ${d === dGuardada ? 'aria-current="true"' : ""}><b>${"●".repeat(d)}${"○".repeat(3 - d)} ${DIF[d]}</b><span>${estrellas((prog()[k]?.e || [0, 0, 0])[d - 1])}</span></button>`).join("")}</div>
        <p class="mt-small">${n === "repaso" ? 12 : 10} ejercicios nuevos cada vez. ${2 * 1} XP por acierto en Fácil, 3 en Medio y 4 en Difícil.</p></div></section>`;
    return;
  }
  app.innerHTML = `<section class="wrap mt" style="--c:${T.color}">${cab}${P.fase === "fin" ? finHTML() : pregHTML()}</section>`;
  const f = app.querySelector(".mt-q [data-foco]"); if (f) try { f.focus({preventScroll: true}); } catch (e) {}
}
const q = () => P.serie[P.i];
function pregHTML() {
  const Q = q(), fb = P.fase === "fb";
  let cuerpo = "";
  if (Q.tipo === "num") cuerpo = `${exprHTML(Q.expr)}${pantalla(P.inp)}${fb ? "" : teclado()}`;
  else if (Q.tipo === "recta") cuerpo = `${recta(Q, fb)}${pantalla(P.inp)}${fb ? "" : teclado()}`;
  else if (Q.tipo === "resto") cuerpo = `${exprHTML(Q.expr)}<div class="mt-dos"><button type="button" class="mt-campo ${P.campo === 0 ? "on" : ""}" data-mt="campo" data-c="0"><span>Raíz entera</span>${esc(P.inp || "?")}</button><button type="button" class="mt-campo ${P.campo === 1 ? "on" : ""}" data-mt="campo" data-c="1"><span>Resto</span>${esc(P.inp2 || "?")}</button></div>${fb ? "" : teclado(true)}`;
  else if (Q.tipo === "opc") cuerpo = `${exprHTML(Q.expr)}<div class="mt-ops ${Q.opciones.length <= 3 && Q.opciones.every(o => o.length <= 2) ? "mt-ops-c" : ""}">${Q.opciones.map((o, i) => `<button type="button" class="mt-op ${fb ? (i === Q.ok ? "right" : i === P.elegida ? "wrong" : "dim") : ""}" data-mt="opc" data-i="${i}" ${fb ? "disabled" : ""}>${esc(o)}</button>`).join("")}</div>`;
  else if (Q.tipo === "orden") {
    const quedan = Q.nums.map((v, i) => i).filter(i => !P.orden.includes(i));
    cuerpo = `<div class="mt-fila mt-puestos" aria-label="Tu orden">${Q.nums.map((_, j) => { const i = P.orden[j]; const bien = fb && i !== undefined && Q.nums[i] === ordenBueno(Q)[j]; return `<button type="button" class="mt-chip ${i === undefined ? "vacio" : ""} ${fb ? (bien ? "right" : "wrong") : ""}" data-mt="quitar" data-j="${j}" ${fb || i === undefined ? "disabled" : ""}>${i === undefined ? (j + 1) : esc(B().sg(Q.nums[i]))}</button>`; }).join(`<span class="mt-sig">${Q.asc ? "&lt;" : "&gt;"}</span>`)}</div>
      ${fb ? `<p class="mt-small">Bien ordenado: ${esc(ordenBueno(Q).map(B().sg).join(Q.asc ? " < " : " > "))}</p>` : `<div class="mt-fila">${quedan.map(i => `<button type="button" class="mt-chip" data-mt="poner" data-i="${i}">${esc(B().sg(Q.nums[i]))}</button>`).join("")}</div>
      <p class="mt-acc"><button type="button" class="btn main" data-mt="comprobar" ${quedan.length ? "disabled" : ""} data-foco>Comprobar</button> <button type="button" class="btn" data-mt="borrar-orden">Volver a empezar</button></p>`}`;
  }
  else if (Q.tipo === "pasos") cuerpo = pasosHTML(Q, fb);
  const res = fb ? fbHTML() : "";
  return `<div class="mt-q mt-box"><div class="mt-qtop"><span>${P.i + 1} / ${P.serie.length}${P.n === "repaso" ? ` · ${esc(B().NOMBRES[Q.ap])}` : ""}</span><span>✅ ${P.ok} · ${DIF[P.d]}</span></div>
    <div class="mt-prog"><i style="width:${100 * P.i / P.serie.length}%"></i></div>
    <p class="mt-enun">${esc(Q.enun)}</p>${cuerpo}${res}</div>`;
}
const exprHTML = e => e ? `<p class="mt-expr">${marca(e)}</p>` : "";
const pantalla = v => `<p class="mt-pant" aria-live="polite">${v ? esc(v.replace(/^-/, B().M)) : '<span class="mt-ph">?</span>'}</p>`;
function teclado(dos) {
  const k = (t, a, cls = "") => `<button type="button" class="mt-k ${cls}" data-mt="k" data-v="${a}">${t}</button>`;
  return `<div class="mt-tec" role="group" aria-label="Teclado">${[7, 8, 9, 4, 5, 6, 1, 2, 3].map(n => k(n, n)).join("")}${k("±", "pm", "mt-kpm")}${k(0, 0)}${k("⌫", "bs")}
    <button type="button" class="mt-k mt-kok" data-mt="k" data-v="ok" data-foco>${dos && P.campo === 0 ? "Siguiente →" : "Comprobar ✓"}</button></div>`;
}
const ordenBueno = Q => [...Q.nums].sort((a, b) => Q.asc ? a - b : b - a);
/* la recta numérica, con el punto que hay que leer */
function recta(Q, fb) {
  const W = 640, H = 92, pad = 26, n = Q.hasta - Q.desde, x = v => pad + (W - 2 * pad) * (v - Q.desde) / n;
  const lab = Q.d === 1 ? 2 : Q.d === 2 ? 5 : 10;
  let s = `<line x1="${pad - 14}" y1="46" x2="${W - pad + 14}" y2="46" class="mt-rl"/>`;
  for (let v = Q.desde; v <= Q.hasta; v++) {
    const big = v === 0 || v % lab === 0;
    s += `<line x1="${x(v)}" y1="${big ? 36 : 40}" x2="${x(v)}" y2="${big ? 56 : 52}" class="mt-rt"/>`;
    if (big || v === Q.desde || v === Q.hasta) s += `<text x="${x(v)}" y="78" class="mt-rtx">${esc(B().s(v))}</text>`;
  }
  s += `<circle cx="${x(Q.sol)}" cy="46" r="9" class="mt-rp"/>`;
  if (fb) s += `<text x="${x(Q.sol)}" y="22" class="mt-rtx mt-rsol">${esc(B().s(Q.sol))}</text>`;
  return `<svg class="mt-recta" viewBox="0 0 ${W} ${H}" role="img" aria-label="Recta numérica de ${Q.desde} a ${Q.hasta} con un punto marcado">${s}</svg>`;
}
/* operaciones combinadas, paso a paso */
function pasosHTML(Q, fb) {
  Q.R ||= B().resolver(Q.arbol);
  const R = Q.R, hechos = R.pasos.slice(0, P.paso);
  const lista = `<ol class="mt-pasos">${hechos.map((x, i) => `<li class="${P.malos?.[i] ? "mal" : "bien"}"><span class="mt-pa">${marca(x.antes)}</span><span class="mt-pr">${esc(x.parte)} = <b>${esc(B().s(x.v))}</b>${P.malos?.[i] ? ` <small>(pusiste ${esc(B().s(P.malos[i]))})</small>` : ""}</span></li>`).join("")}</ol>`;
  if (fb || P.paso >= R.pasos.length) return `${lista}<p class="mt-expr">= ${esc(B().s(R.v))}</p>`;
  const x = R.pasos[P.paso];
  return `${lista}<p class="mt-expr">${marca(x.antes)}</p>
    <p class="mt-pide">${{pot: "Calcula la potencia", raiz: "Calcula la raíz", mul: "Multiplica o divide", sum: "Suma o resta"}[x.tipo]}: <b>${esc(x.parte)}</b> = ?</p>
    ${P.pasoFallo ? `<p class="mt-fb no">❌ ${esc(P.pasoFallo)}</p>` : ""}
    ${pantalla(P.inp)}${teclado()}`;
}
function fbHTML() {
  const Q = q(), bien = P.ultima;
  let sol = "";
  if (Q.tipo === "num" || Q.tipo === "recta") sol = `La respuesta es <b>${esc(B().s(Q.sol))}</b>.`;
  if (Q.tipo === "resto") sol = `Raíz entera <b>${Q.sol}</b> y resto <b>${Q.resto}</b>.`;
  if (Q.tipo === "pasos") sol = bien ? "" : `Te has equivocado en ${P.malos.filter(x => x !== undefined).length === 1 ? "un paso" : "algunos pasos"} (en rojo).`;
  return `<div class="mt-fb ${bien ? "ok" : "no"}" role="status"><b>${bien ? "🎉 ¡Bien!" : "😬 Casi"}</b>${bien && P.ganado ? ` <span class="mt-xp">+${P.ganado} XP</span>` : ""}
    ${bien ? "" : `<p>${sol}</p><p class="mt-ayuda">💡 ${esc(Q.ayuda || "")}</p>`}</div>
    <p class="mt-acc"><button type="button" class="btn main" data-mt="sig" data-foco>${P.i + 1 < P.serie.length ? "Siguiente →" : "Ver resultado"}</button></p>`;
}
function finHTML() {
  const tot = P.serie.length, pct = P.ok / tot, e = pct >= .9 ? 3 : pct >= .7 ? 2 : pct >= .5 ? 1 : 0;
  return `<div class="mt-box mt-fin"><p class="mt-big">${["💪", "👍", "🌟", "🏆"][e]}</p><h2>${P.ok} de ${tot} bien</h2><p class="mt-stars">${estrellas(e)}</p>
    <p>${P.xp ? `Has ganado <b>${P.xp} XP</b>.` : ""} ${e < 3 ? (P.d < 3 && e >= 2 ? "Prueba el siguiente nivel." : "Repasa la explicación y vuelve a intentarlo.") : P.d < 3 ? "¡Perfecto! Prueba el siguiente nivel." : "¡Eres un crack de los enteros!"}</p>
    <p class="mt-acc"><button type="button" class="btn main" data-mt="otra">🔁 Otros ${tot}</button>${P.d < 3 ? ` <button type="button" class="btn" data-mt="empezar" data-d="${P.d + 1}">Subir a ${DIF[P.d + 1]}</button>` : ""} <a class="btn" href="#mates-${P.T.id}">Volver al tema</a></p></div>`;
}

/* ---------- respuestas ---------- */
const xp = (n, ok) => { try { dispatchEvent(new CustomEvent("lya:xp", {detail: {xp: n, src: "mates", ok}})); } catch (e) {} };
function responder(bien) {
  P.ultima = bien; P.fase = "fb"; P.ganado = 0;
  if (bien) { P.ok++; P.ganado = P.d + 1; P.xp += P.ganado; }
  xp(bien ? P.ganado : 0, bien);
  pintar();
}
function terminar() {
  P.fase = "fin";
  const pr = prog(), x = pr[P.k] ||= {e: [0, 0, 0], n: 0, ok: 0}, pct = P.ok / P.serie.length, e = pct >= .9 ? 3 : pct >= .7 ? 2 : pct >= .5 ? 1 : 0;
  x.e[P.d - 1] = Math.max(x.e[P.d - 1] || 0, e); x.n++; x.ok += P.ok;
  try { L().save?.(); } catch (er) {}
  pintar();
}
function tecla(v) {
  const Q = q(), dos = Q.tipo === "resto", campo = dos && P.campo === 1 ? "inp2" : "inp";
  let t = P[campo];
  if (v === "bs") t = t.slice(0, -1);
  else if (v === "pm") t = t.startsWith("-") ? t.slice(1) : "-" + t;
  else if (v === "ok") return enviar();
  else if (/^\d$/.test(String(v)) && t.replace("-", "").length < 6) t = (t === "0" ? "" : t === "-0" ? "-" : t) + v;
  P[campo] = t; pintar();
}
function enviar() {
  const Q = q();
  if (Q.tipo === "resto") {
    if (P.campo === 0) { if (B().leer(P.inp) === null) return; P.campo = 1; return pintar(); }
    const a = B().leer(P.inp), b = B().leer(P.inp2); if (a === null || b === null) return;
    return responder(a === Q.sol && b === Q.resto);
  }
  const v = B().leer(P.inp); if (v === null) return;
  if (Q.tipo === "pasos") {
    const x = Q.R.pasos[P.paso]; P.malos ||= [];
    if (v !== x.v) { P.malos[P.paso] = v; P.pasoFallo = `${x.parte} no es ${B().s(v)}: es ${B().s(x.v)}. Seguimos con el bueno.`; }
    else P.pasoFallo = null;
    P.paso++; P.inp = "";
    if (P.paso >= Q.R.pasos.length) { P.pasoFallo = null; return responder(!P.malos.some(m => m !== undefined)); }
    return pintar();
  }
  responder(v === Q.sol);
}
let appEl = null;
const pintar = () => { if (appEl && /^mates-/.test(location.hash.slice(1))) render(appEl); };
function siguiente() {
  if (P.i + 1 >= P.serie.length) return terminar();
  Object.assign(P, {i: P.i + 1, fase: "preg", inp: "", inp2: "", campo: 0, orden: [], paso: 0, malos: [], pasoFallo: null, elegida: null});
  pintar();
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-mt]"); if (!b || !b.closest(".mt")) return;
  appEl = b.closest("#app") || document.getElementById("app");
  const a = b.dataset.mt, h = location.hash.slice(1), m = h.match(RE);
  if (a === "tab") { tab[`${m[1]}-${m[2]}`] = b.dataset.t; if (b.dataset.t === "aprende") P = null; return pintar(); }
  if (a === "empezar") { const d = +b.dataset.d; store.set("lyaMatesDif", d); const T = tema(m[1]); P = nuevaPractica(T, m[2] === "repaso" ? "repaso" : +m[2], d); return pintar(); }
  if (a === "otra") { P = nuevaPractica(P.T, P.n, P.d); return pintar(); }
  if (!P) return;
  if (a === "k") return tecla(b.dataset.v);
  if (a === "campo") { P.campo = +b.dataset.c; return pintar(); }
  if (a === "opc") { P.elegida = +b.dataset.i; return responder(P.elegida === q().ok); }
  if (a === "poner") { P.orden.push(+b.dataset.i); return pintar(); }
  if (a === "quitar") { P.orden.splice(+b.dataset.j, 1); return pintar(); }
  if (a === "borrar-orden") { P.orden = []; return pintar(); }
  if (a === "comprobar") { const Q = q(), bueno = ordenBueno(Q); return responder(P.orden.every((i, j) => Q.nums[i] === bueno[j])); }
  if (a === "sig") return siguiente();
});
/* teclado del ordenador: números, «-», borrar e Intro */
addEventListener("keydown", e => {
  if (!P || !/^mates-t/.test(location.hash.slice(1)) || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest?.("input,textarea,select")) return;
  appEl = document.getElementById("app");
  if (P.fase === "fb" && e.key === "Enter") { e.preventDefault(); return siguiente(); }
  if (P.fase !== "preg") return;
  const Q = q(); if (!["num", "recta", "resto", "pasos"].includes(Q.tipo)) {
    if (Q.tipo === "opc" && /^[1-4]$/.test(e.key) && +e.key <= Q.opciones.length) { P.elegida = +e.key - 1; responder(P.elegida === Q.ok); }
    return;
  }
  if (/^\d$/.test(e.key)) { e.preventDefault(); tecla(e.key); }
  else if (e.key === "-" || e.key === "+") { e.preventDefault(); tecla("pm"); }
  else if (e.key === "Backspace") { e.preventDefault(); tecla("bs"); }
  else if (e.key === "Enter") { e.preventDefault(); tecla("ok"); }
  else if (e.key === "Tab" && Q.tipo === "resto") { e.preventDefault(); P.campo = 1 - P.campo; pintar(); }
});
const renderPub = app => { appEl = app; render(app); };
window.LYAMates = {isMates, render: renderPub, estrellas, _P: () => P}; /* _P: para las pruebas (qa/prueba-mates.cjs) */
})();
