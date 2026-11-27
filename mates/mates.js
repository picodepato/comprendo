/* COMPRENDO · Matemáticas (1.º ESO y 4.º ESO PDC, en castellano). Apartado «➗ Mates» de la barra.
   Cada curso es un apartado propio (los cursos y sus temas, en mates/temas.js). Rutas:
     #mates              portada: un botón por curso (1.º ESO, 4.º ESO PDC…) y los juegos en grupo
     #mates-<curso>          un curso (1eso, 4pdc…): sus temas y los juegos en grupo de ese curso
   (tema: t2 = 1.º ESO, números enteros · p2 = 4.º ESO PDC, proporcionalidad y porcentajes):
     #mates-<tema>           el tema: sus apartados (con estrellas), el repaso y «Jugar con la clase»
     #mates-<tema>-<1..8>    un apartado: 📘 Aprende (explicación de mates/temas.js) y ✏️ Practica (ejercicios de mates/banco.js o mates/pdc.js)
     #mates-<tema>-repaso    repaso del tema: un poco de todo
     #mates-p2-monta         🧩 Monta el problema (mates/monta.js), a solas
   Ayudas cuando no se entiende (los ejercicios de mates/pdc.js las traen): 🤔 «No lo entiendo» (uno igual con otros números, resuelto),
   🧭 «Paso a paso» (el problema partido en preguntas pequeñas), y al fallar: por qué está mal lo que has puesto y cómo se hace.
   Los juegos en grupo están en mates/grupo.js (#mates-grupo, #mates-juego-<juego>, #mates-sala-<código>, #mates-pizarra-<código>).
   Práctica: 10 ejercicios (12 en el repaso) en Fácil, Medio o Difícil. Teclado propio con botón ± (en el móvil el teclado numérico no trae el menos).
   Las operaciones combinadas se hacen paso a paso: sale resaltado lo que toca y la web dice en qué paso te equivocas.
   Progreso en S.g.mt["t2-<n>"] = {e: [estrellas en fácil, medio, difícil], n: veces, ok: aciertos} (se guarda con la cuenta).
   XP: 2 / 3 / 4 por acierto según la dificultad (evento lya:xp, src "mates"). */
(() => {
const B = () => window.LYAMatesBanco, TM = () => window.LYAMatesTemas;
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const RE = /^mates(?:-([a-z]\d+)(?:-([1-8]|repaso|monta)(?:-d([123]))?)?)?$/;  /* «-d2»: abre la práctica ya en esa dificultad (deberes) */
const RE_CURSO = /^mates-(\d[a-z]+)$/;  /* #mates-1eso, #mates-4pdc */
const isMates = h => RE.test(h) || RE_CURSO.test(h) || window.LYAMatesGrupo?.isGrupo(h);
const DIF = ["", "Fácil", "Medio", "Difícil"];
const COLOR = "#4f8cff";
const store = {get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }};
const prog = () => { const {S} = st(); S.g ||= {}; return (S.g.mt ||= {}); };
const estrellas = n => "★".repeat(n) + "☆".repeat(3 - n);
const tema = id => TM().tema ? TM().tema(id) : TM().cursos[0].temas.find(t => t.id === id);
/* el banco de ejercicios del tema (banco.js para 1.º, pdc.js para 4.º PDC) y el de la práctica en marcha */
const BT = T => (T && TM()?.banco ? TM().banco(T.id) : null) || B();
const BQ = () => BT(P && P.T);
/* «\u0001…\u0002» de banco.js → resaltado */
const marca = t => esc(t).replace(/\u0001/g, '<mark class="mt-hl">').replace(/\u0002/g, "</mark>");

let P = null; /* la práctica que está en marcha */
let tab = {};  /* pestaña de cada apartado: aprende | practica */

function render(app) {
  const h = location.hash.slice(1);
  try { L().setAcc?.(COLOR); } catch (e) {}
  if (window.LYAMatesGrupo?.isGrupo(h)) return LYAMatesGrupo.render(app);
  const mc = h.match(RE_CURSO);
  if (mc && TM()) { const C = TM().curso?.(mc[1]); if (!C) { location.hash = "mates"; return; } return cursoHTML(app, C); }
  const m = h.match(RE);
  if (!m || !B() || !TM()) { app.innerHTML = `<p class="msg">…</p>`; return; }
  if (!m[1]) return portada(app);
  const T = tema(m[1]); if (!T) { location.hash = "mates"; return; }
  if (!m[2]) return temaHTML(app, T);
  if (m[3]) {  /* deber: empieza (o sigue) la práctica en esa dificultad y deja la dirección normal */
    const n = m[2] === "repaso" ? "repaso" : +m[2], k = `${T.id}-${n}`, d = +m[3];
    if (!P || P.k !== k || P.d !== d || P.fase === "fin") P = nuevaPractica(T, n, d);
    tab[k] = "practica";
    try { history.replaceState(null, "", `#mates-${T.id}-${n}`); } catch (e) {}
  }
  if (m[2] === "monta") return T.banco === "LYAMatesPDC" ? montaSolo(app, T) : (location.hash = "mates-" + T.id);
  if (m[2] === "repaso") return practica(app, T, "repaso");
  return apartado(app, T, +m[2]);
}

/* ---------- portada: un apartado por curso ---------- */
const hechosTema = T => T.aps.filter(a => (prog()[`${T.id}-${a.n}`]?.e || []).some(x => x > 0)).length;
function portada(app) {
  app.innerHTML = `<section class="wrap mt">
    <h1 class="mt-h1">➗ Matemáticas</h1>
    <p class="mt-lead">Elige tu curso. Explicaciones, ejercicios que no se acaban nunca y juegos con tu clase.</p>
    <div class="mt-cursos">${TM().cursos.map(C => {
      const aps = C.temas.reduce((n, T) => n + T.aps.length, 0), hechos = C.temas.reduce((n, T) => n + hechosTema(T), 0);
      return `<a class="mt-curso" href="#mates-${C.id}" style="--c:${C.color}"><span class="mt-cic" aria-hidden="true">${C.ic}</span><span class="mt-cbody"><b>${esc(C.n)}</b><span class="mt-small">${esc(C.temas.map(T => "Tema " + T.n + " · " + T.titulo).join(" · "))}</span><span class="mt-bar"><i style="width:${aps ? 100 * hechos / aps : 0}%"></i></span><span class="mt-small">${hechos} de ${aps} apartados practicados</span></span><span class="mt-cgo" aria-hidden="true">→</span></a>`;
    }).join("")}</div>
    <h2 class="mt-h2">🏫 Jugar con la clase</h2>
    <p class="mt-small">Con sala y código, como los juegos de las lecturas. Dentro de cada curso están sus juegos.</p>
    <p class="mt-acc"><a class="btn main" href="#mates-grupo">🏫 Mates en grupo</a></p>
  </section>`;
}

/* ---------- curso: sus temas y sus juegos ---------- */
function cursoHTML(app, C) {
  app.innerHTML = `<section class="wrap mt" style="--c:${C.color}">
    <p class="mt-migas"><a href="#mates">← Matemáticas</a></p>
    <h1 class="mt-h1">${C.ic} ${esc(C.n)}</h1>
    <p class="mt-lead">${esc(C.intro || "")}</p>
    <h2 class="mt-h2">📚 Temas</h2>
    <div class="mt-temas">${C.temas.map(T => {
      const hechos = hechosTema(T);
      return `<a class="mt-tema" href="#mates-${T.id}" style="--c:${T.color}"><span class="mt-tn">Tema ${T.n}</span><b>${esc(T.titulo)}</b><span class="mt-small">${esc(T.intro)}</span><span class="mt-bar"><i style="width:${100 * hechos / T.aps.length}%"></i></span><span class="mt-small">${hechos} de ${T.aps.length} apartados practicados</span></a>`;
    }).join("")}
      ${(C.pronto || []).map(t => `<div class="mt-tema soon"><span class="mt-tn">Pronto</span><b>${esc(t)}</b></div>`).join("")}</div>
    <h2 class="mt-h2">🏫 Jugar con la clase</h2>
    <p class="mt-small">Con sala y código. Elegís los apartados del tema y la dificultad.</p>
    ${window.LYAMatesGrupo ? LYAMatesGrupo.tiles(C.temas.map(T => T.id)) : ""}
  </section>`;
}

/* ---------- tema ---------- */
function temaHTML(app, T) {
  const pr = prog();
  app.innerHTML = `<section class="wrap mt" style="--c:${T.color}">
    <p class="mt-migas">${TM().cursoDe?.(T.id) ? `<a href="#mates-${TM().cursoDe(T.id).id}">← ${esc(TM().cursoDe(T.id).n)}</a>` : `<a href="#mates">← Matemáticas</a>`}</p>
    <h1 class="mt-h1"><small>${esc(TM().cursoDe?.(T.id)?.n || "")} · Tema ${T.n}</small> ${esc(T.titulo)}</h1>
    <p class="mt-lead">${esc(T.intro)}</p>
    <div class="mt-aps">${T.aps.map(a => {
      const e = pr[`${T.id}-${a.n}`]?.e || [0, 0, 0];
      return `<a class="mt-ap" href="#mates-${T.id}-${a.n}"><span class="mt-apn">${a.n}</span><span class="mt-apt"><b>${esc(a.titulo)}</b><span class="mt-small">${esc(a.idea)}</span></span><span class="mt-st" title="Fácil, Medio, Difícil">${e.map((x, i) => `<span aria-label="${DIF[i + 1]}: ${x} estrellas">${estrellas(x)}</span>`).join("")}</span></a>`;
    }).join("")}
      <a class="mt-ap mt-rep" href="#mates-${T.id}-repaso"><span class="mt-apn">🔁</span><span class="mt-apt"><b>Repaso del tema</b><span class="mt-small">Un poco de todo, mezclado, como en un examen.</span></span><span class="mt-st">${estrellas((pr[`${T.id}-repaso`]?.e || [0, 0, 0]).reduce((a, b) => Math.max(a, b), 0))}</span></a>
      ${T.banco === "LYAMatesPDC" && window.LYAMonta ? `<a class="mt-ap mt-rep" href="#mates-${T.id}-monta"><span class="mt-apn">🧩</span><span class="mt-apt"><b>Monta el problema</b><span class="mt-small">Arrastra los datos a su sitio, elige el tipo y la operación… y resuélvelo. Si te equivocas, te dice por qué.</span></span><span class="mt-st">${pr[`${T.id}-monta`]?.best ? `🏆 ${pr[`${T.id}-monta`].best}/8` : ""}</span></a>` : ""}</div>
    <h2 class="mt-h2">🏫 Jugar con la clase</h2>
    ${window.LYAMatesGrupo ? LYAMatesGrupo.tiles(T.id) : ""}
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
    const aMedias = P && P.k === k && P.fase !== "fin";
    app.innerHTML = `<section class="wrap mt" style="--c:${T.color}">${cab}
      ${aMedias ? `<div class="mt-seguir"><span>✏️ Tienes una práctica a medias: vas por el <b>${P.i + 1} de ${P.serie.length}</b> (${DIF[P.d]}).</span><button class="btn main" type="button" data-mt="tab" data-t="practica">Seguir practicando →</button></div>` : ""}
      ${teoHTML(T, A)}
      <p class="mt-cta"><button class="btn main" type="button" data-mt="tab" data-t="practica">${aMedias ? "✏️ Seguir practicando" : "✏️ A practicar"}</button></p></section>`;
    return;
  }
  practica(app, T, n, cab);
}

/* la explicación de un apartado, con sus dibujos (sirve en «Aprende» y como ayuda dentro de la práctica) */
function teoHTML(T, A) {
  const dib = window.LYAMatesDibujos?.[T.id]?.[A.n];
  let figs = ""; try { figs = dib ? dib() : ""; } catch (e) {}
  return `<div class="mt-teo"><p class="mt-idea">${A.ic} ${esc(A.idea)}</p>
    ${figs ? `<div class="mt-figs">${figs}</div>` : ""}
    <ul class="mt-reglas">${A.reglas.map(r => `<li>${r}</li>`).join("")}</ul>
    ${A.ejemplos.map(e => `<div class="mt-ej"><p class="mt-ejq"><span>Ejemplo</span> ${esc(e.q)}</p><ol>${e.pasos.map(x => `<li>${esc(x)}</li>`).join("")}</ol><p class="mt-ejr">${/=/.test(e.r) ? "" : "= "}<b>${esc(e.r)}</b></p></div>`).join("")}
    ${A.ojo ? `<p class="mt-ojo">⚠️ ${esc(A.ojo)}</p>` : ""}</div>`;
}
/* ---------- práctica ---------- */
function nuevaPractica(T, n, d) {
  const r = B().Rn(Math.floor(Math.random() * 2 ** 31)), aps = n === "repaso" ? T.aps.map(a => a.n) : [n], tot = n === "repaso" ? 12 : 10, serie = [], vistos = new Set();
  for (let i = 0, k = 0; serie.length < tot && k < 200; k++) {
    const ap = n === "repaso" ? aps[(i + Math.floor(r.f() * 2)) % aps.length] : n, q = BT(T).gen(ap, d, r);
    const firma = q.tipo + "|" + q.enun + "|" + (q.expr || q.nums?.join(",") || q.sol);
    if (vistos.has(firma)) continue;
    vistos.add(firma); serie.push(q); i++;
  }
  return {k: `${T.id}-${n}`, T, n, d, serie, mal: [], pist: 0, usadas: 0, i: 0, ok: 0, fase: "preg", inp: "", inp2: "", campo: 0, orden: [], paso: 0, pasoMal: false, pasoFallo: null, xp: 0, gm: null, gem: null, seguidos: 0};
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
  if (P.gm) cuerpo = `${probHTML(Q)}${guiaHTML(Q)}`;
  else if (Q.tipo === "num") cuerpo = `${probHTML(Q)}${pantalla(P.inp, Q.ud)}${fb ? "" : teclado(false, Q.dec)}`;
  else if (Q.tipo === "recta") cuerpo = `${recta(Q, fb)}${pantalla(P.inp)}${fb ? "" : teclado()}`;
  else if (Q.tipo === "resto") cuerpo = `${exprHTML(Q.expr)}<div class="mt-dos"><button type="button" class="mt-campo ${P.campo === 0 ? "on" : ""}" data-mt="campo" data-c="0"><span>Raíz entera</span>${esc(P.inp || "?")}</button><button type="button" class="mt-campo ${P.campo === 1 ? "on" : ""}" data-mt="campo" data-c="1"><span>Resto</span>${esc(P.inp2 || "?")}</button></div>${fb ? "" : teclado(true)}`;
  else if (Q.tipo === "opc") cuerpo = `${probHTML(Q)}<div class="mt-ops ${Q.opciones.length <= 3 && Q.opciones.every(o => o.length <= 2) ? "mt-ops-c" : ""}">${Q.opciones.map((o, i) => `<button type="button" class="mt-op ${fb ? (i === Q.ok ? "right" : i === P.elegida ? "wrong" : "dim") : ""}" data-mt="opc" data-i="${i}" ${fb ? "disabled" : ""}>${esc(o)}</button>`).join("")}</div>`;
  else if (Q.tipo === "orden") {
    const quedan = Q.nums.map((v, i) => i).filter(i => !P.orden.includes(i));
    cuerpo = `<div class="mt-fila mt-puestos" aria-label="Tu orden">${Q.nums.map((_, j) => { const i = P.orden[j]; const bien = fb && i !== undefined && Q.nums[i] === ordenBueno(Q)[j]; return `<button type="button" class="mt-chip ${i === undefined ? "vacio" : ""} ${fb ? (bien ? "right" : "wrong") : ""}" data-mt="quitar" data-j="${j}" ${fb || i === undefined ? "disabled" : ""}>${i === undefined ? (j + 1) : esc(B().sg(Q.nums[i]))}</button>`; }).join(`<span class="mt-sig">${Q.asc ? "&lt;" : "&gt;"}</span>`)}</div>
      ${fb ? `<p class="mt-small">Bien ordenado: ${esc(ordenBueno(Q).map(B().sg).join(Q.asc ? " < " : " > "))}</p>` : `<div class="mt-fila">${quedan.map(i => `<button type="button" class="mt-chip" data-mt="poner" data-i="${i}">${esc(B().sg(Q.nums[i]))}</button>`).join("")}</div>
      <p class="mt-acc"><button type="button" class="btn main" data-mt="comprobar" ${quedan.length ? "disabled" : ""} data-foco>Comprobar</button> <button type="button" class="btn" data-mt="borrar-orden">Volver a empezar</button></p>`}`;
  }
  else if (Q.tipo === "pasos") cuerpo = pasosHTML(Q, fb);
  const res = fb ? fbHTML() : "";
  const A = P.T.aps.find(a => a.n === (Q.ap || P.n));
  const BQq = BQ(), puedeGem = !!(BQq.gemelo && Q.res), puedeGuia = !!(Q.guia && !P.gm && !fb);
  const ayudas = fb ? "" : `${pistasHTML(Q)}${puedeGem || puedeGuia ? `<div class="mt-ayudas">${puedeGem && !P.gem ? `<button type="button" class="mt-pbtn mt-nolo" data-mt="nolo">🤔 No lo entiendo <small>uno igual, resuelto</small></button>` : ""}${puedeGuia ? `<button type="button" class="mt-pbtn mt-guiab" data-mt="guia">🧭 Hazlo paso a paso</button>` : ""}</div>` : ""}`;
  return `<div class="mt-q mt-box"><div class="mt-qtop"><span>${P.i + 1} / ${P.serie.length}${P.n === "repaso" ? ` · ${esc(BQq.NOMBRES[Q.ap])}` : ""}</span><span>✅ ${P.ok} · ${DIF[P.d]} <button type="button" class="mt-dejar" data-mt="dejar">cambiar</button></span></div>
    <div class="mt-prog"><i style="width:${100 * P.i / P.serie.length}%"></i></div>
    <p class="mt-enun">${esc(Q.enun)}</p>${ayudas}${P.gem ? gemHTML(Q) : ""}${cuerpo}${res}</div>
    ${A ? `<details class="mt-ayu"${P.ayuda ? " open" : ""}><summary>📘 ¿Cómo se hacía? Ver la explicación${P.n === "repaso" ? ` de «${esc(A.titulo)}»` : ""} sin salir</summary>${teoHTML(P.T, A)}</details>` : ""}`;
}
/* pistas: de menos a más; en las combinadas, las del paso que toca. Cada pista usada quita 1 XP (mínimo 1) */
function pistasDe(Q) {
  if (Q.tipo === "pasos") { Q.R ||= B().resolver(Q.arbol); const x = Q.R.pasos[P.paso]; return x ? B().pistaPaso(x) : []; }
  return BQ().pistas(Q) || [];
}
function pistasHTML(Q) {
  const ps = pistasDe(Q); if (!ps.length) return "";
  return `<div class="mt-pistas">${ps.slice(0, P.pist).map((t, i) => `<p class="mt-pista"><b>💡 ${i + 1}</b> ${esc(t)}</p>`).join("")}${P.pist < ps.length ? `<button type="button" class="mt-pbtn" data-mt="pista">💡 ${P.pist ? "Otra pista" : Q.tipo === "pasos" ? "Pista para este paso" : "Pista"} <small>${P.pist + 1} de ${ps.length}</small></button>` : ""}</div>`;
}
const exprHTML = e => e ? `<p class="mt-expr">${marca(e)}</p>` : "";
/* el enunciado: un problema con texto, una tabla para completar o una operación */
const probHTML = Q => Q.fig ? `<div class="mt-tbw">${Q.fig}</div>` : Q.prob ? `<p class="mt-prob">${esc(Q.expr)}</p>` : exprHTML(Q.expr);
const udTxt = ud => ud ? ` <small class="mt-ud">${esc(ud)}</small>` : "";
const pantalla = (v, ud) => `<p class="mt-pant" aria-live="polite">${v ? esc(v.replace(/^-/, B().M)) : '<span class="mt-ph">?</span>'}${udTxt(ud)}</p>`;
function teclado(dos, dec) {
  const k = (t, a, cls = "") => `<button type="button" class="mt-k ${cls}" data-mt="k" data-v="${a}">${t}</button>`;
  return `<div class="mt-tec" role="group" aria-label="Teclado">${[7, 8, 9, 4, 5, 6, 1, 2, 3].map(n => k(n, n)).join("")}${dec ? k(",", "dec", "mt-kpm") : k("±", "pm", "mt-kpm")}${k(0, 0)}${k("⌫", "bs")}
    <button type="button" class="mt-k mt-kok" data-mt="k" data-v="ok" data-foco>${dos && P.campo === 0 ? "Siguiente →" : "Comprobar ✓"}</button></div>`;
}
const ordenBueno = Q => [...Q.nums].sort((a, b) => Q.asc ? a - b : b - a);
/* 🧭 paso a paso: el problema partido en preguntas pequeñas; si fallas un paso, te dice por qué y sigue con el bueno */
function guiaHTML(Q) {
  const G = Q.guia, gm = P.gm, Bq = BQ(), resp = g => g.tipo === "opc" ? g.opciones[g.ok] : Bq.conUd(g.sol, g.ud);
  const hechos = G.slice(0, gm.i).map((g, i) => { const m = gm.mal[i]; return `<li class="${m ? "mal" : "bien"}"><span>${esc(g.pide)}</span> <b>${esc(resp(g))}</b>${m ? `<small>Pusiste ${esc(m.puso)}. ${esc(m.por)}</small>` : ""}</li>`; }).join("");
  const g = G[gm.i]; if (!g) return `<ol class="mt-guia">${hechos}</ol>`;
  return `<ol class="mt-guia">${hechos}<li class="ahora"><span>${esc(g.pide)}</span></li></ol>
    ${gm.aviso ? `<p class="mt-fb no">❌ ${esc(gm.aviso)}</p>` : ""}
    ${g.tipo === "opc" ? `<div class="mt-ops">${g.opciones.map((o, i) => `<button type="button" class="mt-op" data-mt="gopc" data-i="${i}">${esc(o)}</button>`).join("")}</div>` : `${pantalla(P.inp, g.ud)}${teclado(false, true)}`}`;
}
/* 🤔 «No lo entiendo»: uno igual con otros números, resuelto */
function gemHTML(Q) {
  const X = P.gem, Bq = BQ();
  return `<div class="mt-gem" role="region" aria-label="Ejemplo resuelto"><p class="mt-gemt">📗 Mira uno igual, con otros números:</p>
    ${X.fig ? `<div class="mt-tbw">${X.fig}</div>` : `<p class="mt-gemq">${esc(X.prob ? X.expr : Bq.enunciado(X))}</p>`}
    <ol class="mt-gemp">${X.res.map(x => `<li>${esc(x)}</li>`).join("")}</ol>
    <p class="mt-gemr">Solución: <b>${esc(Bq.respuesta(X))}</b></p>
    <p class="mt-acc">${P.fase === "preg" ? `<button type="button" class="btn main" data-mt="gemcerrar">👍 Entendido, vuelvo al mío</button>${Q.guia && !P.gm ? ` <button type="button" class="btn" data-mt="guia">🧭 Hacer el mío paso a paso</button>` : ""}` : `<button type="button" class="btn" data-mt="gemcerrar">Cerrar</button>`} <button type="button" class="btn" data-mt="nolo">🔁 Otro ejemplo</button></p></div>`;
}
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
  const Bq = BQ();
  if (Q.tipo === "num" || Q.tipo === "recta") sol = `La respuesta es <b>${esc(Bq.conUd ? Bq.conUd(Q.sol, Q.ud) : Bq.s(Q.sol))}</b>.${P.puso !== undefined && P.puso !== null && Bq.conUd ? ` Has puesto ${esc(Bq.s(P.puso))}.` : ""}`;
  if (Q.tipo === "opc" && !bien && Q.porque?.[P.elegida]) sol = `La buena es <b>${esc(Q.opciones[Q.ok])}</b>.`;
  if (Q.tipo === "resto") sol = `Raíz entera <b>${Q.sol}</b> y resto <b>${Q.resto}</b>.`;
  if (Q.tipo === "pasos") sol = bien ? "" : `Te has equivocado en ${P.malos.filter(x => x !== undefined).length === 1 ? "un paso" : "algunos pasos"} (en rojo).`;
  return `<div class="mt-fb ${bien ? "ok" : "no"}" role="status"><b>${bien ? "🎉 ¡Bien!" : "😬 Casi"}</b>${bien && P.ganado ? ` <span class="mt-xp">+${P.ganado} XP</span>` : ""}${bien && P.usadas ? ` <small>(con ${P.usadas === 1 ? "1 pista" : P.usadas + " pistas"})</small>` : ""}
    ${bien ? "" : `<p>${sol}</p>${P.trampa ? `<p class="mt-porque">🔎 ${esc(P.trampa)}</p>` : Q.tipo === "opc" && Q.porque?.[P.elegida] ? `<p class="mt-porque">🔎 ${esc(Q.porque[P.elegida])}</p>` : ""}
      ${Q.res && !P.gm ? `<div class="mt-asi"><b>Así se hace:</b><ol>${Q.res.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>` : `<p class="mt-ayuda">💡 ${esc(Q.ayuda || "")}</p>`}`}</div>
    ${!bien && P.seguidos >= 2 ? `<p class="mt-seguir"><span>🤗 Llevas ${P.seguidos} fallos seguidos. ¿Lo vemos con calma?</span><span>${BQ().gemelo && Q.res ? `<button type="button" class="btn" data-mt="nolo">📗 Ver uno parecido resuelto</button> ` : ""}${P.d > 1 ? `<button type="button" class="btn" data-mt="bajar">⬇️ Pasar a ${DIF[P.d - 1]}</button>` : ""}</span></p>` : !bien && BQ().gemelo && Q.res && !P.gem ? `<p class="mt-acc"><button type="button" class="btn" data-mt="nolo">📗 Ver uno parecido resuelto</button></p>` : ""}
    <p class="mt-acc"><button type="button" class="btn main" data-mt="sig" data-foco>${P.i + 1 < P.serie.length ? "Siguiente →" : "Ver resultado"}</button></p>`;
}
function finHTML() {
  const tot = P.serie.length, pct = P.ok / tot, e = pct >= .9 ? 3 : pct >= .7 ? 2 : pct >= .5 ? 1 : 0;
  return `<div class="mt-box mt-fin"><p class="mt-big">${["💪", "👍", "🌟", "🏆"][e]}</p><h2>${P.ok} de ${tot} bien</h2><p class="mt-stars">${estrellas(e)}</p>
    <p>${P.xp ? `Has ganado <b>${P.xp} XP</b>.` : ""} ${e < 3 ? (P.d < 3 && e >= 2 ? "Prueba el siguiente nivel." : "Repasa la explicación y vuelve a intentarlo.") : P.d < 3 ? "¡Perfecto! Prueba el siguiente nivel." : `¡Eres un crack ${P.T.id === "t2" ? "de los enteros" : "de las proporciones"}!`}</p>
    <p class="mt-acc"><button type="button" class="btn main" data-mt="otra">🔁 Otros ${tot}</button>${P.d < 3 ? ` <button type="button" class="btn" data-mt="empezar" data-d="${P.d + 1}">Subir a ${DIF[P.d + 1]}</button>` : ""} <button type="button" class="btn" data-mt="dejar">Elegir dificultad</button> <a class="btn" href="#mates-${P.T.id}">Volver al tema</a></p></div>`;
}

/* ---------- 🧩 Monta el problema, a solas: 8 problemas ---------- */
let M = null;
function montaSolo(app, T) {
  const k = `${T.id}-monta`, d0 = store.get("lyaMatesDif") || 1;
  const cab = `<p class="mt-migas"><a href="#mates-${T.id}">← Tema ${T.n} · ${esc(T.titulo)}</a></p><h1 class="mt-h1">🧩 Monta el problema</h1>`;
  if (!M) {
    app.innerHTML = `<section class="wrap mt" style="--c:${T.color}">${cab}<p class="mt-lead">Cada problema tiene cuatro columnas: los <b>datos</b> a su sitio, el <b>tipo</b> (directa, inversa, porcentaje o reparto), la <b>operación</b> y la <b>respuesta</b>. Arrastra las fichas o tócalas. Si algo no va ahí, te explica por qué.</p>
      <div class="mt-box"><h2>¿Qué dificultad?</h2><div class="mt-dif">${[1, 2, 3].map(d => `<button type="button" class="mt-dbtn" data-mt="monta-ir" data-d="${d}" ${d === d0 ? 'aria-current="true"' : ""}><b>${"●".repeat(d)}${"○".repeat(3 - d)} ${DIF[d]}</b><span>${d === 1 ? "Directa, inversa y %" : d === 2 ? "Con rebajas, IVA y repartos" : "Números con decimales"}</span></button>`).join("")}</div></div></section>`;
    return;
  }
  if (M.i >= M.n) {
    const pr = prog(), x = pr[k] ||= {best: 0, n: 0}; if (!M.guardado) { M.guardado = true; x.n++; x.best = Math.max(x.best || 0, M.sin); try { L().save?.(); } catch (e) {} }
    app.innerHTML = `<section class="wrap mt" style="--c:${T.color}">${cab}<div class="mt-box mt-fin"><p class="mt-big">${M.sin >= 7 ? "🏆" : M.sin >= 4 ? "🌟" : "💪"}</p><h2>${M.sin} de ${M.n} sin ningún fallo</h2><p>${M.err} fallos en total${M.xp ? ` · <b>${M.xp} XP</b>` : ""}.</p>
      <p class="mt-acc"><button type="button" class="btn main" data-mt="monta-otra">🔁 Otra vez</button> <a class="btn" href="#mates-${T.id}">Volver al tema</a></p></div></section>`;
    return;
  }
  if (!M.X) M.X = window.LYAMatesPDC.monta(M.r, M.d);
  const clave = `solo-${M.id}-${M.i}`, e = window.LYAMonta.estado(clave), hecho = e && e.fin;
  app.innerHTML = `<section class="wrap mt mt-monta" style="--c:${T.color}">${cab}<div class="mt-qtop"><span>Problema ${M.i + 1} / ${M.n} · ${DIF[M.d]}</span><span>🏆 ${M.sin} sin fallos <button type="button" class="mt-dejar" data-mt="monta-otra">cambiar</button></span></div>
    ${window.LYAMonta.html(clave, M.X, {onFin: err => { M.err += err; if (!err) M.sin++; const n = err ? 1 : M.d + 1; M.xp += n; try { dispatchEvent(new CustomEvent("lya:xp", {detail: {xp: n, src: "mates-monta", ok: !err}})); } catch (er) {} setTimeout(pintar, 0); },
      sig: `<p class="mt-acc"><button type="button" class="btn main" data-mt="monta-otro">${M.i + 1 < M.n ? "Siguiente problema →" : "Ver resultado"}</button></p>`})}</section>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest('[data-mt="monta-ir"]'); if (!b) return;
  appEl = b.closest("#app") || document.getElementById("app");
  const d = +b.dataset.d; store.set("lyaMatesDif", d);
  M = {d, i: 0, n: 8, sin: 0, err: 0, xp: 0, id: Date.now().toString(36), r: B().Rn(Math.floor(Math.random() * 2 ** 31)), X: null};
  pintar();
});

/* ---------- respuestas ---------- */
/* lo que se guarda de un fallo: el ejercicio y la solución, en corto */
function fallo(Q) {
  const lim = t => String(t || "").replace(/[\u0001\u0002]/g, "").replace(/\s+/g, " ").trim().slice(0, 70);
  const sol = Q.tipo === "resto" ? `raíz ${Q.sol}, resto ${Q.resto}` : Q.tipo === "opc" ? Q.opciones[Q.ok] : Q.tipo === "orden" ? ordenBueno(Q).map(B().sg).join(Q.asc ? " < " : " > ")
    : Q.tipo === "pasos" ? B().s((Q.R ||= B().resolver(Q.arbol)).v) : BQ().conUd ? BQ().conUd(Q.sol, Q.ud) : B().s(Q.sol);
  const que = Q.tipo === "orden" ? Q.nums.map(B().sg).join(", ") : Q.tipo === "recta" ? "Punto en la recta" : Q.expr || Q.enun;
  return Q.prob ? `${lim(que).slice(0, 90)} → ${lim(sol)}` : lim(`${lim(que)} → ${lim(sol)}`);
}
const xp = (n, ok) => { try { dispatchEvent(new CustomEvent("lya:xp", {detail: {xp: n, src: "mates", ok}})); } catch (e) {} };
function responder(bien) {
  P.ultima = bien; P.fase = "fb"; P.ganado = 0;
  if (bien) { P.ok++; P.ganado = Math.max(1, P.d + 1 - (P.usadas || 0)); P.xp += P.ganado; }
  else P.mal.push(fallo(q()));
  P.seguidos = bien ? 0 : (P.seguidos || 0) + 1;
  /* por tipo de ejercicio, los últimos 10: «1» bien, «p» bien con pistas, «0» mal (el profe ve qué le cuesta ahora) */
  { const Q = q(), k = `${P.T.id}.${Q.ap || P.n}.${Q.g ?? 0}`, g = st().S.g, mh = g.mh ||= {}; mh[k] = ((mh[k] || "") + (bien ? (P.usadas ? "p" : "1") : "0")).slice(-10); }
  P.pistasTot = (P.pistasTot || 0) + (P.usadas || 0);
  xp(bien ? P.ganado : 0, bien);
  pintar();
}
function terminar() {
  P.fase = "fin";
  const pr = prog(), x = pr[P.k] ||= {e: [0, 0, 0], n: 0, ok: 0}, pct = P.ok / P.serie.length, e = pct >= .9 ? 3 : pct >= .7 ? 2 : pct >= .5 ? 1 : 0;
  x.e[P.d - 1] = Math.max(x.e[P.d - 1] || 0, e); x.n++; x.ok += P.ok;
  /* por dificultad, para los deberes: veces, mejores estrellas y el último intento (aciertos y lo que falló, lo ve el profe) */
  x.h ||= [null, null, null];
  const h = x.h[P.d - 1] ||= {n: 0, best: 0};
  Object.assign(h, {n: h.n + 1, best: Math.max(h.best, e), ok: P.ok, tot: P.serie.length, last: Date.now(), mal: P.mal.slice(0, 12), pi: P.pistasTot || 0});
  try { L().save?.(); } catch (er) {}
  pintar();
}
function tecla(v) {
  const Q = q(), dos = Q.tipo === "resto", campo = dos && P.campo === 1 ? "inp2" : "inp";
  let t = P[campo];
  if (v === "bs") t = t.slice(0, -1);
  else if (v === "pm") t = t.startsWith("-") ? t.slice(1) : "-" + t;
  else if (v === "dec") { if (!t.includes(",")) t = (t || "0") + ","; }
  else if (v === "ok") return enviar();
  else if (/^\d$/.test(String(v)) && t.replace(/[-,]/g, "").length < (Q.dec ? 9 : 6) && !/,\d\d$/.test(t)) t = (t === "0" ? "" : t === "-0" ? "-" : t) + v;
  P[campo] = t; pintar();
}
function enviar() {
  const Q = q();
  if (Q.tipo === "resto") {
    if (P.campo === 0) { if (B().leer(P.inp) === null) return; P.campo = 1; return pintar(); }
    const a = B().leer(P.inp), b = B().leer(P.inp2); if (a === null || b === null) return;
    return responder(a === Q.sol && b === Q.resto);
  }
  const Bq = BQ(), v = Bq.leer(P.inp); if (v === null) return;
  if (P.gm) return pasoGuia(v);
  if (Q.tipo === "pasos") {
    const x = Q.R.pasos[P.paso]; P.malos ||= [];
    if (v !== x.v) { P.malos[P.paso] = v; P.pasoFallo = `${x.parte} no es ${B().s(v)}: es ${B().s(x.v)}. Seguimos con el bueno.`; }
    else P.pasoFallo = null;
    P.paso++; P.inp = ""; P.pist = 0;
    if (P.paso >= Q.R.pasos.length) { P.pasoFallo = null; return responder(!P.malos.some(m => m !== undefined)); }
    return pintar();
  }
  const bien = Bq.igual ? Bq.igual(v, Q.sol) : v === Q.sol;
  P.puso = v;
  P.trampa = bien ? null : (Q.trampas || []).find(t => Bq.igual(v, Bq.r2(t.v)))?.por || null;
  responder(bien);
}
/* un paso del modo guiado: v es el número escrito o la opción elegida */
function pasoGuia(v, opc) {
  const Q = q(), g = Q.guia[P.gm.i], Bq = BQ();
  const bien = opc ? v === g.ok : Bq.igual(v, g.sol);
  P.gm.aviso = null;
  if (!bien) { P.gm.mal[P.gm.i] = {puso: opc ? g.opciones[v] : Bq.s(v), por: (opc ? (g.porque || [])[v] : g.porque) || ""}; P.gm.aviso = `${P.gm.mal[P.gm.i].por} Seguimos con el bueno.`; }
  P.gm.i++; P.inp = "";
  if (P.gm.i >= Q.guia.length) { P.puso = null; P.trampa = null; return responder(!P.gm.mal.some(Boolean)); }
  pintar();
}
let appEl = null;
document.addEventListener("toggle", e => { if (P && e.target.matches?.(".mt-ayu")) P.ayuda = e.target.open; }, true);  /* la ayuda sigue abierta entre pregunta y pregunta */
const pintar = () => { if (appEl && /^mates-/.test(location.hash.slice(1))) render(appEl); };
function siguiente() {
  if (P.i + 1 >= P.serie.length) return terminar();
  Object.assign(P, {i: P.i + 1, fase: "preg", inp: "", inp2: "", campo: 0, orden: [], paso: 0, malos: [], pasoFallo: null, elegida: null, pist: 0, usadas: 0, gm: null, gem: null, puso: null, trampa: null});
  pintar();
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-mt]"); if (!b || !b.closest(".mt")) return;
  appEl = b.closest("#app") || document.getElementById("app");
  const a = b.dataset.mt, h = location.hash.slice(1), m = h.match(RE);
  if (a === "tab") { tab[`${m[1]}-${m[2]}`] = b.dataset.t; if (b.dataset.t === "practica" && P && P.fase === "fin") P = null; scrollTo(0, 0); return pintar(); }  /* «Aprende» ya no borra la práctica: se sigue donde estaba */
  if (a === "dejar") { P = null; return pintar(); }
  if (a === "empezar") { const d = +b.dataset.d; store.set("lyaMatesDif", d); const T = tema(m[1]); P = nuevaPractica(T, m[2] === "repaso" ? "repaso" : +m[2], d); return pintar(); }
  if (a === "otra") { P = nuevaPractica(P.T, P.n, P.d); return pintar(); }
  if (a === "monta-otro" && M) { M.i++; M.X = null; return pintar(); }
  if (a === "monta-otra" && M) { M = null; return pintar(); }
  if (!P) return;
  if (a === "nolo") { const g = BQ().gemelo?.(q()); if (g) P.gem = g; pintar(); document.querySelector(".mt-gem")?.scrollIntoView?.({block: "nearest"}); return; }
  if (a === "gemcerrar") { P.gem = null; return pintar(); }
  if (a === "guia") { if (P.fase !== "preg" || !q().guia) return; P.gm = {i: 0, mal: []}; P.gem = null; P.inp = ""; P.usadas++; return pintar(); }
  if (a === "gopc") { if (!P.gm) return; return pasoGuia(+b.dataset.i, true); }
  if (a === "bajar") { if (P.d > 1) { store.set("lyaMatesDif", P.d - 1); P = nuevaPractica(P.T, P.n, P.d - 1); } return pintar(); }
  if (a === "k") return tecla(b.dataset.v);
  if (a === "pista") { if (P.fase !== "preg") return; P.pist++; P.usadas++; return pintar(); }
  if (a === "campo") { P.campo = +b.dataset.c; return pintar(); }
  if (a === "opc") { if (P.fase !== "preg") return; P.elegida = +b.dataset.i; return responder(P.elegida === q().ok); }
  if (a === "poner") { P.orden.push(+b.dataset.i); return pintar(); }
  if (a === "quitar") { P.orden.splice(+b.dataset.j, 1); return pintar(); }
  if (a === "borrar-orden") { P.orden = []; return pintar(); }
  if (a === "comprobar") { const Q = q(), bueno = ordenBueno(Q); return responder(P.orden.every((i, j) => Q.nums[i] === bueno[j])); }
  if (a === "sig") return siguiente();
});
/* teclado del ordenador: números, «-», borrar e Intro */
addEventListener("keydown", e => {
  if (!P || !/^mates-[tp]\d+-(\d|repaso)/.test(location.hash.slice(1)) || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest?.("input,textarea,select,summary")) return;
  appEl = document.getElementById("app");
  if (P.fase === "fb" && e.key === "Enter") { e.preventDefault(); return siguiente(); }
  if (P.fase !== "preg") return;
  const Q = q(); if (P.gm) { const g = Q.guia[P.gm.i]; if (g && g.tipo === "opc") { if (/^[1-4]$/.test(e.key) && +e.key <= g.opciones.length) pasoGuia(+e.key - 1, true); return; } }
  else if (!["num", "recta", "resto", "pasos"].includes(Q.tipo)) {
    if (Q.tipo === "opc" && /^[1-4]$/.test(e.key) && +e.key <= Q.opciones.length) { P.elegida = +e.key - 1; responder(P.elegida === Q.ok); }
    return;
  }
  if (/^\d$/.test(e.key)) { e.preventDefault(); tecla(e.key); }
  else if ((e.key === "," || e.key === ".") && (Q.dec || P.gm)) { e.preventDefault(); tecla("dec"); }
  else if ((e.key === "-" || e.key === "+") && !Q.dec) { e.preventDefault(); tecla("pm"); }
  else if (e.key === "Backspace") { e.preventDefault(); tecla("bs"); }
  else if (e.key === "Enter") { e.preventDefault(); tecla("ok"); }
  else if (e.key === "Tab" && Q.tipo === "resto") { e.preventDefault(); P.campo = 1 - P.campo; pintar(); }
});
const renderPub = app => { appEl = app; render(app); };
window.LYAMates = {isMates, render: renderPub, estrellas, _P: () => P, _M: () => M}; /* _P: para las pruebas (qa/prueba-mates.cjs) */
})();
