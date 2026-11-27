/* COMPRENDO · FP Básica: el curso, sus asignaturas y el motor de actividades (apartado «🛠️ FP Básica» de la barra).
   Pensado para alumnado con necesidades educativas (también discapacidad intelectual): explicaciones en lectura fácil,
   todas las actividades son de ELEGIR (opciones, relacionar o clasificar tocando), muchas pistas y varias ayudas.
   Cada asignatura se registra con LYAFpb.asignatura({id, n, ic, color, intro, temas, pronto}) y su banco con LYAFpb.banco(tema, {...})
   (ver fpb/lengua-temas.js y fpb/lengua-banco.js). Los ids de tema son una letra y un número (l2, l3, s1…), únicos.
   Imágenes: campo opcional «img» (HTML ya preparado: <img> o <svg>) en un apartado (sale tras la idea) o en una pregunta (sale encima de las opciones).
   Rutas:
     #fpb                     el curso: sus asignaturas
     #fpb-<asignatura>        la asignatura (#fpb-lengua): sus temas y los juegos en grupo
     #fpb-<tema>              el tema: sus apartados (con estrellas) y el repaso
     #fpb-<tema>-<n>          un apartado: 📘 Aprende (explicación, palabras difíciles, textos) y ✏️ Practica
     #fpb-<tema>-repaso       un poco de todo
     #fpb-<tema>-<n>-d<1..3>  empezar la práctica ya en ese nivel (para mandarlo como deber)
     #fpb-grupo, #fpb-juego-<j>, #fpb-sala-<código>, #fpb-pizarra-<código>, #fpb-clase-<tema>: fpb/grupo.js
   Ayudas en cada pregunta: 💡 pistas de menos a más (mínimo 3; la última casi da la respuesta), ✂️ quitar una opción mala,
   🤔 «No lo entiendo» (otra igual, resuelta), 🧭 «Paso a paso» (si la pregunta lo trae), 🔊 escuchar, 📘 la explicación sin salir.
   Al fallar: por qué está mal lo que has elegido y una segunda oportunidad; si vuelves a fallar, la solución y cómo se hace.
   Con 2 fallos seguidos ofrece ver un ejemplo resuelto o bajar de nivel.
   Progreso en S.g.fp["<tema>-<n>"] = {e: [estrellas por nivel], n, ok, h} (se guarda con la cuenta). XP: evento lya:xp, src "fpb". */
(() => {
/* ---------- utilidades para los bancos ---------- */
function Rn(seed) {
  let s = seed >>> 0 || 1;
  const f = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const int = (a, b) => a + Math.floor(f() * (b - a + 1));
  const pick = a => a[Math.floor(f() * a.length)];
  const mez = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  return {f, int, pick, mez, si: p => f() < p};
}
/* opciones: la primera es la buena; p[i] = por qué la i está mal */
const opc = (o, p = []) => o.map((t, i) => ({t, ok: i === 0, por: i ? p[i] || "" : ""}));
/* n elementos de la lista distintos de la buena */
const otras = (r, lista, buena, n) => r.mez([...new Set(lista)].filter(x => x !== buena && !String(x).includes(buena) && !String(buena).includes(x))).slice(0, n);

/* ---------- registro ---------- */
const ASIG = [], BANCOS = {};
const asignatura = a => { if (!ASIG.some(x => x.id === a.id)) ASIG.push(a); };
const banco = (id, b) => { BANCOS[id] = b; };
const temas = () => ASIG.flatMap(a => a.temas);
const tema = id => temas().find(t => t.id === id);
const asigDe = id => ASIG.find(a => a.temas.some(t => t.id === id));

/* ---------- el banco: preparar y sacar preguntas ---------- */
function preparar(x, r) {
  const q = {...x};
  if (!q.tipo || q.tipo === "opc") { q.tipo = "opc"; q.ops = q.ops || opc(x.o, x.p || []); }
  if (q.prep) q.prep(q, r);
  if (q.tipo === "cla" && Array.isArray(q.items[0])) q.items = q.items.map(([t, c, por]) => ({t, c, por}));
  if (q.tipo === "opc") q.ops = r.mez(q.ops);
  if (q.guia) q.guia = q.guia.filter(Boolean).map(g => ({...g, ops: r.mez(g.ops)}));
  if (q.tipo === "cla") q.items = r.mez(q.items);
  if (q.tipo === "rel") q.der = r.mez(q.pares.map((p, i) => i));
  q.pi = [...(q.pi || [])]; q.r ||= [];
  /* muchas pistas: siempre al menos 3, y la última casi da la respuesta */
  if (q.tipo === "opc") { const b = q.ops.find(o => o.ok).t; if (q.pi.length < 2) q.pi.push("Lee otra vez la pregunta despacio. Puedes tocar 🔊 para escucharla."); if (q.pi.length < 3 || !/empieza/.test(q.pi.join(" "))) q.pi.push(`La respuesta buena empieza por «${b.slice(0, Math.max(2, Math.min(5, Math.ceil(b.length / 3))))}…».`); }
  if (q.tipo === "rel") { if (q.pi.length < 2) q.pi.push("Empieza por la pareja que tengas más clara. Las que ya están bien se quedan en verde."); q.pi.push(`Te ayudo con una: «${q.pares[0][0]}» va con «${q.pares[0][1]}».`); }
  if (q.tipo === "cla") { if (q.pi.length < 2) q.pi.push("Hazlo de uno en uno. Si te equivocas, te digo por qué."); q.pi.push(`Te ayudo con una: «${q.items[0].t}» va en «${q.cajas[q.items[0].c]}».`); }
  return q;
}
function gen(temaId, ap, d, r) {
  const B = BANCOS[temaId] || {}, g = B.gen?.[ap];
  if (g) return preparar({...g(d, r), ap, d}, r);
  const L = B.manual?.[ap] || [];
  let pool = L.filter(x => x.d === d);
  if (pool.length < 3) pool = L.filter(x => Math.abs(x.d - d) <= 1);
  if (!L.length) return preparar({e: "Aún no hay actividades en este apartado.", o: ["Vale"], ap, d}, r);
  return preparar({...r.pick(pool.length ? pool : L), ap}, r);
}
/* «No lo entiendo»: otra del mismo grupo (de opciones), resuelta */
function gemelo(Q, temaId, r) {
  for (let k = 0; k < 50; k++) {
    const X = gen(temaId, Q.ap, Math.max(1, (Q.d || 1) - (k > 25 ? 1 : 0)), r);
    if (X.e !== Q.e && X.tipo === "opc" && (X.g === Q.g || k > 30)) return X;
  }
  return null;
}
const respuesta = Q => Q.tipo === "opc" ? Q.ops.find(o => o.ok).t : Q.tipo === "rel" ? Q.pares.map(p => p.join(" → ")).join(" · ") : Q.items.map(i => `${i.t}: ${Q.cajas[i.c]}`).join(" · ");
/* para los juegos: una pregunta de opciones de los apartados elegidos */
function preguntaOpc(temaId, aps, d, r, evitar) {
  for (let k = 0; k < 80; k++) { const q = gen(temaId, r.pick(aps), d, r); if (q.tipo === "opc" && q.ops.length >= 2 && !(evitar && evitar.has(q.e))) return q; }
  return gen(temaId, aps[0], d, r);
}
function parejas(temaId, aps, r, n) {
  const P = BANCOS[temaId]?.parejas?.(aps, r) || [], vistos = new Set();
  return r.mez(P).filter(p => !vistos.has(p[0]) && !vistos.has(p[1]) && vistos.add(p[0]) && vistos.add(p[1])).slice(0, n);
}
const nombreAp = (temaId, n) => BANCOS[temaId]?.nombres?.[n] || tema(temaId)?.aps.find(a => a.n === n)?.titulo || "";

/* ---------- páginas ---------- */
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const RE = /^fpb(?:-([a-z]\d{1,2})(?:-(\d{1,2}|repaso)(?:-d([123]))?)?)?$/;
const REA = /^fpb-([a-z]{3,})$/;
const esGrupo = h => !!window.LYAFpbGrupo?.isGrupo(h);
const isFpb = h => RE.test(h) || (REA.test(h) && !esGrupo(h)) || esGrupo(h);
const DIF = ["", "Fácil", "Medio", "Difícil"];
const DIFP = ["", "2 opciones para elegir", "3 opciones, y relacionar", "4 opciones, relacionar y clasificar"];
const store = {get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }};
const prog = () => { const {S} = st(); S.g ||= {}; return (S.g.fp ||= {}); };
const estrellas = n => "★".repeat(n) + "☆".repeat(3 - n);
let P = null, tab = {}, appEl = null;

function render(app) {
  appEl = app;
  const h = location.hash.slice(1);
  if (esGrupo(h)) return LYAFpbGrupo.render(app);
  const ma = h.match(REA);
  if (ma) { const A = ASIG.find(a => a.id === ma[1]); if (!A) { location.hash = "fpb"; return; } try { L().setAcc?.(A.color); } catch (e) {} return asigHTML(app, A); }
  const m = h.match(RE);
  try { L().setAcc?.("#ff9f1c"); } catch (e) {}
  if (!m) return;
  if (!m[1]) return portada(app);
  const T = tema(m[1]);
  /* temas de los profes (x1, y1…): se cargan al entrar (temas-profe/temas-profe.js) */
  if (!T && /^[u-z]/.test(m[1]) && window.LYATemasProfe) {
    app.innerHTML = `<section class="wrap mt fp"><p class="mt-lead">Cargando el tema…</p></section>`;
    LYATemasProfe.cargarTemas().then(() => { if (location.hash.slice(1) !== h) return; if (tema(m[1])) render(app); else location.hash = "mis-temas"; });
    return;
  }
  if (!T) { location.hash = "fpb"; return; }
  try { L().setAcc?.(T.color); } catch (e) {}
  if (!m[2]) return temaHTML(app, T);
  const n = m[2] === "repaso" ? "repaso" : +m[2];
  if (n !== "repaso" && !T.aps.some(a => a.n === n)) { location.hash = "fpb-" + T.id; return; }
  if (m[3]) {
    const k = `${T.id}-${n}`, d = +m[3];
    if (!P || P.k !== k || P.d !== d || P.fase === "fin") P = nuevaPractica(T, n, d);
    tab[k] = "practica";
    try { history.replaceState(null, "", `#fpb-${T.id}-${n}`); } catch (e) {}
  }
  if (n === "repaso") return practica(app, T, "repaso");
  return apartado(app, T, n);
}
const hechos = T => T.aps.filter(a => (prog()[`${T.id}-${a.n}`]?.e || []).some(x => x > 0)).length;
function portada(app) {
  app.innerHTML = `<section class="wrap mt fp">
    <h1 class="mt-h1">🛠️ FP Básica</h1>
    <p class="mt-lead">Elige una asignatura. Todo está explicado en lectura fácil, con actividades para elegir y muchas pistas.</p>
    <div class="mt-temas fp-asigs">${ASIG.filter(A => !A.profe).map(A => { const tot = A.temas.reduce((s, T) => s + T.aps.length, 0), hh = A.temas.reduce((s, T) => s + hechos(T), 0);
      return `<a class="mt-tema fp-asig" href="#fpb-${A.id}" style="--c:${A.color}"><span class="fp-aic" aria-hidden="true">${A.ic}</span><b>${esc(A.n)}</b><span class="mt-small">${esc(A.intro || "")}</span><span class="mt-small">${A.temas.length} ${A.temas.length === 1 ? "tema" : "temas"}</span><span class="mt-bar"><i style="width:${tot ? 100 * hh / tot : 0}%"></i></span><span class="mt-small">${hh} de ${tot} apartados practicados</span></a>`; }).join("") || `<p class="mt-small">Pronto habrá asignaturas.</p>`}</div>
    <h2 class="mt-h2">🏫 Jugar con la clase</h2>
    ${window.LYAFpbGrupo ? LYAFpbGrupo.tiles() : ""}
  </section>`;
}
function asigHTML(app, A) {
  app.innerHTML = `<section class="wrap mt fp" style="--c:${A.color}">
    <p class="mt-migas">${A.profe ? `<a href="#mis-temas">← Temas de mis profes</a>` : `<a href="#fpb">← FP Básica</a>`}</p>
    <h1 class="mt-h1"><small>${A.profe ? esc(A.curso) : "FP Básica"}</small> ${A.ic} ${esc(A.n)}</h1>
    <p class="mt-lead">${esc(A.intro || "")}</p>
    <div class="mt-temas">${A.temas.map(T => `<a class="mt-tema" href="#fpb-${T.id}" style="--c:${T.color}"><span class="mt-tn">Tema ${T.n}</span><b>${T.ic} ${esc(T.titulo)}</b><span class="mt-small">${esc(T.intro)}</span><span class="mt-bar"><i style="width:${100 * hechos(T) / T.aps.length}%"></i></span><span class="mt-small">${hechos(T)} de ${T.aps.length} apartados practicados</span></a>`).join("")}
      ${(A.pronto || []).map(t => `<div class="mt-tema soon"><span class="mt-tn">Pronto</span><b>${esc(t)}</b></div>`).join("")}</div>
    <h2 class="mt-h2">🏫 Jugar con la clase</h2>
    ${window.LYAFpbGrupo ? LYAFpbGrupo.tiles(A.temas[0]?.id) : ""}
  </section>`;
}
function temaHTML(app, T) {
  const pr = prog(), A = asigDe(T.id), bloques = [...new Set(T.aps.map(a => a.bloque || ""))];
  app.innerHTML = `<section class="wrap mt fp" style="--c:${T.color}">
    <p class="mt-migas"><a href="#fpb-${A.id}">← ${esc(A.n)}</a></p>
    <h1 class="mt-h1"><small>${esc(A.n)} · Tema ${T.n}</small> ${esc(T.titulo)}</h1>
    ${window.LYATemasProfe?.barra?.(T.id) || ""}
    <p class="mt-lead">${esc(T.intro)}</p>
    ${bloques.map(b => `${b && bloques.length > 1 ? `<h2 class="mt-h2">${b === "Lengua" ? "🔤" : "📚"} ${esc(b)}</h2>` : ""}<div class="mt-aps">${T.aps.filter(a => (a.bloque || "") === b).map(a => {
      const e = pr[`${T.id}-${a.n}`]?.e || [0, 0, 0];
      return `<a class="mt-ap" href="#fpb-${T.id}-${a.n}"><span class="mt-apn">${a.ic}</span><span class="mt-apt"><b>${a.n}. ${esc(a.titulo)}</b><span class="mt-small">${esc(a.idea)}</span></span><span class="mt-st" title="Fácil, Medio, Difícil">${e.map((x, i) => `<span aria-label="${DIF[i + 1]}: ${x} estrellas">${estrellas(x)}</span>`).join("")}</span></a>`;
    }).join("")}</div>`).join("")}
    <div class="mt-aps"><a class="mt-ap mt-rep" href="#fpb-${T.id}-repaso"><span class="mt-apn">🔁</span><span class="mt-apt"><b>Repaso del tema</b><span class="mt-small">Un poco de todo, mezclado.</span></span><span class="mt-st">${estrellas((pr[`${T.id}-repaso`]?.e || [0, 0, 0]).reduce((a, b) => Math.max(a, b), 0))}</span></a></div>
    <h2 class="mt-h2">🏫 Jugar con la clase</h2>
    ${window.LYAFpbGrupo ? LYAFpbGrupo.tiles(T.id) : ""}
  </section>`;
}
function apartado(app, T, n) {
  const A = T.aps.find(a => a.n === n), k = `${T.id}-${n}`;
  if (!tab[k]) tab[k] = prog()[k]?.n ? "practica" : "aprende";
  if (P && P.k !== k) P = null;
  const pestanas = `<div class="mt-tabs" role="tablist">${[["aprende", "📘 Aprende"], ["practica", "✏️ Practica"]].map(([id, t]) => `<button type="button" role="tab" data-fp="tab" data-t="${id}" aria-selected="${tab[k] === id}">${t}</button>`).join("")}</div>`;
  const cab = `<p class="mt-migas"><a href="#fpb-${T.id}">← Tema ${T.n} · ${esc(T.titulo)}</a></p><h1 class="mt-h1"><small>${n}.</small> ${A.ic} ${esc(A.titulo)}</h1>${pestanas}`;
  if (tab[k] === "aprende") {
    const aMedias = P && P.k === k && P.fase !== "fin";
    app.innerHTML = `<section class="wrap mt fp" style="--c:${T.color}">${cab}
      ${aMedias ? `<div class="mt-seguir"><span>✏️ Tienes una práctica a medias: vas por la <b>${P.i + 1} de ${P.serie.length}</b>.</span><button class="btn main" type="button" data-fp="tab" data-t="practica">Seguir →</button></div>` : ""}
      ${teoHTML(A)}
      <p class="mt-cta"><button class="btn main" type="button" data-fp="tab" data-t="practica">${aMedias ? "✏️ Seguir practicando" : "✏️ A practicar"}</button></p></section>`;
    return;
  }
  practica(app, T, n, cab);
}
const sinHTML = s => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
/* la explicación: idea, reglas, palabras difíciles, textos, ejemplos y «ojo» */
function teoHTML(A, corto) {
  const voz = [A.idea, ...A.reglas.map(sinHTML)].join(". ");
  return `<div class="mt-teo fp-teo"><p class="mt-idea">${A.ic} ${esc(A.idea)} ${btnVoz(voz)}</p>
    ${A.img ? `<div class="fp-img">${A.img}</div>` : ""}
    <ul class="mt-reglas fp-reglas">${A.reglas.map(r => `<li>${r}</li>`).join("")}</ul>
    ${A.glosario?.length ? `<details class="fp-glo" ${corto ? "" : "open"}><summary>📖 Palabras difíciles</summary><dl>${A.glosario.map(([p, s]) => `<div><dt>${esc(p)}</dt><dd>${esc(s)}</dd></div>`).join("")}</dl></details>` : ""}
    ${(A.textos || []).map(t => textoHTML(t, corto)).join("")}
    ${A.ejemplos?.length ? A.ejemplos.map(e => `<div class="mt-ej"><p class="mt-ejq"><span>Ejemplo</span> ${esc(e.q)}</p><ol>${e.pasos.map(x => `<li>${esc(x)}</li>`).join("")}</ol><p class="mt-ejr">👉 <b>${esc(e.r)}</b></p></div>`).join("") : ""}
    ${A.ojo ? `<p class="mt-ojo">⚠️ ${esc(A.ojo)}</p>` : ""}</div>`;
}
function textoHTML(t, corto) {
  const largo = t.versos.length > 24 || t.prosa;
  return `<details class="fp-texto" ${corto || largo ? "" : "open"}><summary>📜 Texto ${t.n}: <i>${esc(t.titulo)}</i> <small>· ${esc(t.autor)}</small></summary>
    <div class="fp-tx ${t.prosa ? "prosa" : ""}">${btnVoz(t.versos.join(t.prosa ? " " : ". "))}${t.versos.map(v => v ? `<p>${esc(v)}</p>` : `<p class="fp-blanco"></p>`).join("")}</div></details>`;
}
/* 🔊 escuchar (voz del navegador) */
const voces = [];
const btnVoz = txt => { if (!("speechSynthesis" in window)) return ""; voces.push(txt); if (voces.length > 400) voces.splice(0, 200); return `<button type="button" class="fp-voz" data-fp="voz" data-v="${voces.length - 1}" aria-label="Escuchar" title="Escuchar">🔊</button>`; };
function hablar(txt) {
  try {
    const s = speechSynthesis; if (s.speaking) { s.cancel(); return; }
    const u = new SpeechSynthesisUtterance(String(txt).replace(/[«»"“”]/g, "")); u.lang = "es-ES"; u.rate = .9;
    const v = s.getVoices().find(v => /^es(-|_)ES/i.test(v.lang)) || s.getVoices().find(v => /^es/i.test(v.lang)); if (v) u.voice = v;
    s.speak(u);
  } catch (e) {}
}

/* ---------- práctica ---------- */
function nuevaPractica(T, n, d) {
  const r = Rn(Math.floor(Math.random() * 2 ** 31)), aps = n === "repaso" ? T.aps.map(a => a.n) : [n], tot = n === "repaso" ? 10 : 8, serie = [], vistos = new Set();
  for (let k = 0; serie.length < tot && k < 300; k++) {
    const ap = n === "repaso" ? aps[serie.length % aps.length] : n, q = gen(T.id, ap, d, r);
    const firma = q.tipo + "|" + q.e + "|" + (q.t || "") + "|" + (q.tipo === "opc" ? q.ops.find(o => o.ok).t : respuesta(q));
    if (vistos.has(firma) && k < 200) continue;
    vistos.add(firma); serie.push(q);
  }
  if (n === "repaso") serie.sort(() => r.f() - .5);
  return {k: `${T.id}-${n}`, T, n, d, r, serie, i: 0, ok: 0, ok2: 0, fase: "preg", xp: 0, mal: [], seguidos: 0, ...limpio()};
}
const limpio = () => ({pist: 0, usadas: 0, quitadas: [], intento: 0, elegida: null, fallada: null, gm: null, gem: null, sel: null, hechas: {}, errores: 0, aviso: null, ultima: null});
const q = () => P.serie[P.i];
function practica(app, T, n, cab) {
  const k = `${T.id}-${n}`;
  cab ||= `<p class="mt-migas"><a href="#fpb-${T.id}">← Tema ${T.n} · ${esc(T.titulo)}</a></p><h1 class="mt-h1">🔁 Repaso del tema</h1>`;
  const d0 = store.get("lyaFpbDif") || 1;
  if (!P || P.k !== k) {
    app.innerHTML = `<section class="wrap mt fp" style="--c:${T.color}">${cab}
      <div class="mt-box"><h2>¿Qué nivel?</h2>
        <div class="mt-dif">${[1, 2, 3].map(d => `<button type="button" class="mt-dbtn" data-fp="empezar" data-d="${d}" ${d === d0 ? 'aria-current="true"' : ""}><b>${"●".repeat(d)}${"○".repeat(3 - d)} ${DIF[d]}</b><span class="fp-dp">${DIFP[d]}</span><span>${estrellas((prog()[k]?.e || [0, 0, 0])[d - 1])}</span></button>`).join("")}</div>
        <p class="mt-small">${n === "repaso" ? 10 : 8} actividades. Siempre se elige la respuesta tocando. Tienes pistas y ayudas en cada una.</p></div></section>`;
    return;
  }
  app.innerHTML = `<section class="wrap mt fp" style="--c:${T.color}">${cab}${P.fase === "fin" ? finHTML() : pregHTML()}</section>`;
  const f = app.querySelector(".fp-q [data-foco]"); if (f) try { f.focus({preventScroll: true}); } catch (e) {}
}
function pregHTML() {
  const Q = q(), fb = P.fase === "fb", A = P.T.aps.find(a => a.n === Q.ap);
  const voz = [Q.e, Q.t || "", Q.tipo === "opc" ? "Opciones: " + Q.ops.filter((o, i) => !P.quitadas.includes(i)).map(o => o.t).join(". ") : ""].join(". ");
  let cuerpo = "";
  if (P.gm && !P.gm.fin) cuerpo = guiaHTML(Q);
  else if (Q.tipo === "opc") cuerpo = `${P.gm ? guiaHechaHTML(Q) : ""}<div class="mt-ops fp-ops">${Q.ops.map((o, i) => {
    const quit = P.quitadas.includes(i), cls = fb ? (o.ok ? "right" : i === P.elegida || i === P.fallada ? "wrong" : "dim") : i === P.fallada ? "wrong" : quit ? "dim" : "";
    return `<button type="button" class="mt-op ${cls} ${quit ? "fp-quit" : ""}" data-fp="opc" data-i="${i}" ${fb || quit || i === P.fallada ? "disabled" : ""}><span class="fp-letra">${"ABCD"[i]}</span> ${esc(o.t)}</button>`; }).join("")}</div>`;
  else if (Q.tipo === "rel") cuerpo = relHTML(Q, fb);
  else if (Q.tipo === "cla") cuerpo = claHTML(Q, fb);
  const ps = Q.pi || [], puedeQuitar = Q.tipo === "opc" && !fb && !P.gm && Q.ops.length - P.quitadas.length - (P.fallada !== null ? 1 : 0) > 2;
  const ayudas = fb ? "" : `<div class="mt-pistas">${ps.slice(0, P.pist).map((t, i) => `<p class="mt-pista"><b>💡 ${i + 1}</b> ${esc(t)}</p>`).join("")}</div>
    <div class="mt-ayudas fp-ayudas">${P.pist < ps.length ? `<button type="button" class="mt-pbtn" data-fp="pista">💡 ${P.pist ? "Otra pista" : "Pista"} <small>${P.pist + 1} de ${ps.length}</small></button>` : ""}
      ${puedeQuitar ? `<button type="button" class="mt-pbtn" data-fp="quitar">✂️ Quitar una mala</button>` : ""}
      ${Q.tipo === "opc" && !P.gem ? `<button type="button" class="mt-pbtn mt-nolo" data-fp="nolo">🤔 No lo entiendo <small>uno igual, resuelto</small></button>` : ""}
      ${Q.guia && !P.gm ? `<button type="button" class="mt-pbtn mt-guiab" data-fp="guia">🧭 Hazlo paso a paso</button>` : ""}</div>`;
  return `<div class="fp-q mt-box"><div class="mt-qtop"><span>${P.i + 1} / ${P.serie.length}${P.n === "repaso" ? ` · ${esc(nombreAp(P.T.id, Q.ap))}` : ""}</span><span>✅ ${P.ok + P.ok2} · ${DIF[P.d]} <button type="button" class="mt-dejar" data-fp="dejar">cambiar</button></span></div>
    <div class="mt-prog"><i style="width:${100 * P.i / P.serie.length}%"></i></div>
    <p class="mt-enun fp-enun">${esc(Q.e)} ${btnVoz(voz)}</p>
    ${Q.t ? `<blockquote class="fp-cita">${Q.t.split("\n").map(l => esc(l)).join("<br>")}</blockquote>` : ""}
    ${Q.img ? `<div class="fp-img">${Q.img}</div>` : ""}
    ${ayudas}${P.gem ? gemHTML() : ""}${P.aviso ? `<p class="mt-fb no fp-aviso" role="status">❌ ${esc(P.aviso)}</p>` : ""}${cuerpo}${fb ? fbHTML() : ""}</div>
    ${A ? `<details class="mt-ayu"${P.ayuda ? " open" : ""}><summary>📘 ¿Cómo se hacía? Ver la explicación${P.n === "repaso" ? ` de «${esc(A.titulo)}»` : ""} sin salir</summary>${teoHTML(A, true)}</details>` : ""}`;
}
/* relacionar: toca una de la izquierda y luego su pareja */
function relHTML(Q, fb) {
  const izq = Q.pares.map((p, i) => i), der = Q.der, hecho = i => P.hechas[i] !== undefined || fb;
  const derHecha = j => Object.values(P.hechas).includes(j);
  return `<p class="mt-small">Toca una palabra de la izquierda y luego su pareja de la derecha.</p><div class="fp-rel">
    <div class="fp-col">${izq.map(i => `<button type="button" class="fp-chip ${hecho(i) ? "right" : P.sel === i ? "sel" : ""}" data-fp="izq" data-i="${i}" ${hecho(i) ? "disabled" : ""}>${esc(Q.pares[i][0])}${hecho(i) ? ` <small>→ ${esc(Q.pares[i][1])}</small>` : ""}</button>`).join("")}</div>
    <div class="fp-col">${der.map(j => `<button type="button" class="fp-chip ${derHecha(j) || fb ? "dim" : ""}" data-fp="der" data-j="${j}" ${derHecha(j) || fb ? "disabled" : ""}>${esc(Q.pares[j][1])}</button>`).join("")}</div></div>`;
}
/* clasificar: toca una palabra y luego su caja */
function claHTML(Q, fb) {
  const quedan = Q.items.map((it, i) => i).filter(i => P.hechas[i] === undefined && !fb);
  return `<p class="mt-small">Toca una palabra y luego la caja donde va.</p>
    <div class="mt-fila fp-quedan">${quedan.map(i => `<button type="button" class="fp-chip ${P.sel === i ? "sel" : ""}" data-fp="item" data-i="${i}">${esc(Q.items[i].t)}</button>`).join("") || (fb ? "" : "<span class='mt-small'>¡Ya está todo!</span>")}</div>
    <div class="fp-cajas" style="--n:${Q.cajas.length}">${Q.cajas.map((c, k) => `<button type="button" class="fp-caja" data-fp="caja" data-k="${k}" ${fb ? "disabled" : ""}><b>${esc(c)}</b><span>${Q.items.map((it, i) => (P.hechas[i] === k || (fb && it.c === k)) ? `<i>${esc(it.t)}</i>` : "").join("")}</span></button>`).join("")}</div>`;
}
/* 🧭 paso a paso */
function guiaHTML(Q) {
  const g = Q.guia[P.gm.i];
  return `${guiaHechaHTML(Q)}<p class="fp-paso">🧭 Paso ${P.gm.i + 1} de ${Q.guia.length}: <b>${esc(g.pide)}</b></p>
    ${P.gm.aviso ? `<p class="mt-fb no">❌ ${esc(P.gm.aviso)}</p>` : ""}
    <div class="mt-ops fp-ops">${g.ops.map((o, i) => `<button type="button" class="mt-op ${P.gm.mal === i ? "wrong" : ""}" data-fp="gopc" data-i="${i}" ${P.gm.mal === i ? "disabled" : ""}>${esc(o.t)}</button>`).join("")}</div>`;
}
const guiaHechaHTML = Q => P.gm?.i ? `<ol class="mt-guia">${Q.guia.slice(0, P.gm.i).map(g => `<li class="bien"><span>${esc(g.pide)}</span> <b>${esc(g.ops.find(o => o.ok).t)}</b></li>`).join("")}</ol>${P.gm.fin ? `<p class="fp-paso">👍 ¡Muy bien! Ahora elige la respuesta:</p>` : ""}` : "";
function gemHTML() {
  const X = P.gem;
  return `<div class="mt-gem" role="region" aria-label="Ejemplo resuelto"><p class="mt-gemt">📗 Mira uno parecido, ya resuelto:</p>
    <p class="mt-gemq">${esc(X.e)}</p>${X.t ? `<blockquote class="fp-cita">${X.t.split("\n").map(l => esc(l)).join("<br>")}</blockquote>` : ""}
    <p class="mt-gemr">Respuesta: <b>${esc(respuesta(X))}</b></p>
    ${X.r?.length ? `<ol class="mt-gemp">${X.r.map(x => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}
    <p class="mt-acc"><button type="button" class="btn main" data-fp="gemcerrar">👍 Entendido, vuelvo a la mía</button> <button type="button" class="btn" data-fp="nolo">🔁 Otro ejemplo</button></p></div>`;
}
function fbHTML() {
  const Q = q(), bien = P.ultima, o = Q.tipo === "opc" ? Q.ops[P.elegida] : null;
  const titulo = bien === 2 ? "🎉 ¡Muy bien!" : bien === 1 ? "👍 ¡Bien, a la segunda!" : "😬 Esta vez no";
  return `<div class="mt-fb ${bien ? "ok" : "no"}" role="status"><b>${titulo}</b>${P.ganado ? ` <span class="mt-xp">+${P.ganado} XP</span>` : ""}
    ${!bien && Q.tipo === "opc" ? `<p>La buena es: <b>${esc(Q.ops.find(x => x.ok).t)}</b>.</p>${o?.por ? `<p class="mt-porque">🔎 ${esc(o.por)}</p>` : ""}` : ""}
    ${!bien && Q.tipo !== "opc" ? `<p>Has tenido ${P.errores} fallos. Mira cómo queda bien arriba.</p>` : ""}
    ${!bien && Q.r?.length ? `<div class="mt-asi"><b>Así se hace:</b><ol>${Q.r.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>` : ""}</div>
    ${!bien && P.seguidos >= 2 ? `<p class="mt-seguir"><span>🤗 Llevas ${P.seguidos} seguidas sin acertar. ¿Lo vemos con calma?</span><span><button type="button" class="btn" data-fp="verteo">📘 Ver la explicación</button> ${P.d > 1 ? `<button type="button" class="btn" data-fp="bajar">⬇️ Pasar a ${DIF[P.d - 1]}</button>` : ""}</span></p>` : ""}
    <p class="mt-acc"><button type="button" class="btn main" data-fp="sig" data-foco>${P.i + 1 < P.serie.length ? "Siguiente →" : "Ver resultado"}</button></p>`;
}
function finHTML() {
  const tot = P.serie.length, pct = (P.ok + P.ok2 * .5) / tot, e = pct >= .85 ? 3 : pct >= .65 ? 2 : pct >= .4 ? 1 : 0;
  return `<div class="mt-box mt-fin"><p class="mt-big">${["💪", "👍", "🌟", "🏆"][e]}</p><h2>${P.ok + P.ok2} de ${tot} bien</h2><p class="mt-stars">${estrellas(e)}</p>
    <p>${P.ok2 ? `${P.ok2} a la segunda. ` : ""}${P.xp ? `Has ganado <b>${P.xp} XP</b>.` : ""} ${e < 2 ? "Repasa la explicación y vuelve a intentarlo. ¡Tú puedes!" : P.d < 3 ? "¡Genial! Puedes probar el siguiente nivel." : "¡Eres un crack!"}</p>
    <p class="mt-acc"><button type="button" class="btn main" data-fp="otra">🔁 Otras ${tot}</button>${P.d < 3 && e >= 2 ? ` <button type="button" class="btn" data-fp="empezar" data-d="${P.d + 1}">Subir a ${DIF[P.d + 1]}</button>` : ""} <button type="button" class="btn" data-fp="dejar">Elegir nivel</button> <a class="btn" href="#fpb-${P.T.id}">Volver al tema</a></p></div>`;
}

/* ---------- respuestas ---------- */
const xp = (n, ok) => { try { dispatchEvent(new CustomEvent("lya:xp", {detail: {xp: n, src: "fpb", ok}})); } catch (e) {} };
/* bien: 2 a la primera, 1 a la segunda (o con fallos en relacionar/clasificar), 0 mal */
function responder(bien) {
  P.ultima = bien; P.fase = "fb"; P.ganado = 0; P.aviso = null;
  if (bien === 2) { P.ok++; P.ganado = Math.max(1, P.d + 1 - Math.floor((P.usadas || 0) / 2)); }
  else if (bien === 1) { P.ok2++; P.ganado = 1; }
  else P.mal.push(String(q().e).slice(0, 70));
  P.xp += P.ganado;
  P.seguidos = bien ? 0 : (P.seguidos || 0) + 1;
  { const Q = q(), k = `${P.T.id}.${Q.ap}.${Q.g || 0}`, g = st().S.g, mh = g.fph ||= {}; mh[k] = ((mh[k] || "") + (bien === 2 ? (P.usadas ? "p" : "1") : bien ? "p" : "0")).slice(-10); }
  xp(P.ganado, !!bien);
  pintar();
}
function terminar() {
  P.fase = "fin";
  const pr = prog(), x = pr[P.k] ||= {e: [0, 0, 0], n: 0, ok: 0}, pct = (P.ok + P.ok2 * .5) / P.serie.length, e = pct >= .85 ? 3 : pct >= .65 ? 2 : pct >= .4 ? 1 : 0;
  x.e[P.d - 1] = Math.max(x.e[P.d - 1] || 0, e); x.n++; x.ok += P.ok + P.ok2;
  x.h ||= [null, null, null];
  const h = x.h[P.d - 1] ||= {n: 0, best: 0};
  Object.assign(h, {n: h.n + 1, best: Math.max(h.best, e), ok: P.ok + P.ok2, tot: P.serie.length, last: Date.now(), mal: P.mal.slice(0, 12)});
  try { L().save?.(); } catch (er) {}
  pintar();
}
function siguiente() { if (P.i + 1 >= P.serie.length) return terminar(); P.i++; P.fase = "preg"; Object.assign(P, limpio()); scrollTo(0, 0); pintar(); }
const pintar = () => { if (appEl && /^fpb-/.test(location.hash.slice(1)) && !esGrupo(location.hash.slice(1))) render(appEl); };
function elegirOpc(i) {
  const Q = q(), o = Q.ops[i]; if (!o || P.fase !== "preg") return;
  P.elegida = i;
  if (o.ok) return responder(P.intento ? 1 : 2);
  if (!P.intento && Q.ops.length - P.quitadas.length > 2) { P.intento = 1; P.fallada = i; P.aviso = `${o.por || "Esa no es."} Prueba otra vez.`; P.seguidos++; return pintar(); }
  P.fallada = null; responder(0);
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-fp]"); if (!b || !b.closest(".fp")) return;
  appEl = b.closest("#app") || document.getElementById("app");
  const a = b.dataset.fp, h = location.hash.slice(1), m = h.match(RE);
  if (a === "voz") return hablar(voces[+b.dataset.v] || "");
  if (!m) return;
  if (a === "tab") { tab[`${m[1]}-${m[2]}`] = b.dataset.t; if (b.dataset.t === "practica" && P && P.fase === "fin") P = null; scrollTo(0, 0); return pintar(); }
  if (a === "dejar") { P = null; return pintar(); }
  if (a === "empezar") { const d = +b.dataset.d; store.set("lyaFpbDif", d); P = nuevaPractica(tema(m[1]), m[2] === "repaso" ? "repaso" : +m[2], d); return pintar(); }
  if (a === "otra") { P = nuevaPractica(P.T, P.n, P.d); return pintar(); }
  if (!P) return;
  const Q = q();
  if (a === "verteo") { P.ayuda = true; pintar(); document.querySelector(".mt-ayu")?.scrollIntoView?.({block: "start"}); return; }
  if (a === "bajar") { if (P.d > 1) { store.set("lyaFpbDif", P.d - 1); P = nuevaPractica(P.T, P.n, P.d - 1); } return pintar(); }
  if (a === "sig") return siguiente();
  if (P.fase !== "preg") return;
  if (a === "pista") { P.pist++; P.usadas++; return pintar(); }
  if (a === "quitar") { const malas = Q.ops.map((o, i) => i).filter(i => !Q.ops[i].ok && !P.quitadas.includes(i) && i !== P.fallada); if (malas.length) { P.quitadas.push(P.r.pick(malas)); P.usadas++; } return pintar(); }
  if (a === "nolo") { const g = gemelo(Q, P.T.id, P.r); if (g) { P.gem = g; P.usadas++; } pintar(); document.querySelector(".mt-gem")?.scrollIntoView?.({block: "nearest"}); return; }
  if (a === "gemcerrar") { P.gem = null; return pintar(); }
  if (a === "guia") { if (!Q.guia) return; P.gm = {i: 0, aviso: null, mal: null}; P.usadas++; return pintar(); }
  if (a === "gopc") { const g = Q.guia[P.gm.i], o = g.ops[+b.dataset.i]; if (o.ok) { P.gm.i++; P.gm.aviso = null; P.gm.mal = null; if (P.gm.i >= Q.guia.length) P.gm.fin = true; } else { P.gm.aviso = `${o.por || "Esa no es."} Prueba otra vez.`; P.gm.mal = +b.dataset.i; } return pintar(); }
  if (a === "opc") return elegirOpc(+b.dataset.i);
  if (a === "izq") { P.sel = P.sel === +b.dataset.i ? null : +b.dataset.i; P.aviso = null; return pintar(); }
  if (a === "der") {
    if (P.sel === null) { P.aviso = "Primero toca una palabra de la izquierda."; return pintar(); }
    const i = P.sel, j = +b.dataset.j;
    if (Q.pares[j][1] === Q.pares[i][1]) { P.hechas[i] = j; P.sel = null; P.aviso = null; if (Object.keys(P.hechas).length === Q.pares.length) return responder(P.errores === 0 ? 2 : P.errores <= 2 ? 1 : 0); }
    else { P.errores++; P.aviso = `«${Q.pares[i][0]}» no va con «${Q.pares[j][1]}». Prueba otra vez.`; }
    return pintar();
  }
  if (a === "item") { P.sel = P.sel === +b.dataset.i ? null : +b.dataset.i; P.aviso = null; return pintar(); }
  if (a === "caja") {
    if (P.sel === null) { P.aviso = "Primero toca una palabra."; return pintar(); }
    const i = P.sel, k = +b.dataset.k, it = Q.items[i];
    if (it.c === k) { P.hechas[i] = k; P.sel = null; P.aviso = null; if (Object.keys(P.hechas).length === Q.items.length) return responder(P.errores === 0 ? 2 : P.errores <= 2 ? 1 : 0); }
    else { P.errores++; P.aviso = `«${it.t}» no va en «${Q.cajas[k]}». ${it.por || ""}`; }
    return pintar();
  }
});
document.addEventListener("toggle", e => { if (P && e.target.matches?.(".mt-ayu")) P.ayuda = e.target.open; }, true);
/* teclado: 1-4 / A-D eligen opción, Intro sigue */
addEventListener("keydown", e => {
  if (!P || !/^fpb-[a-z]\d/.test(location.hash.slice(1)) || e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.("input,textarea,select,summary")) return;
  appEl = document.getElementById("app");
  if (P.fase === "fb" && e.key === "Enter") { e.preventDefault(); return siguiente(); }
  if (P.fase !== "preg" || P.gm || q().tipo !== "opc") return;
  const k = "1234".indexOf(e.key) >= 0 ? "1234".indexOf(e.key) : "abcd".indexOf(e.key.toLowerCase());
  if (k >= 0 && k < q().ops.length && !P.quitadas.includes(k) && k !== P.fallada) { e.preventDefault(); elegirOpc(k); }
});

window.LYAFpb = {asignatura, banco, asignaturas: () => ASIG, tema, asigDe, isFpb, render: app => { appEl = app; render(app); }, estrellas,
  H: {Rn, opc, otras}, gen, gemelo, respuesta, preguntaOpc, parejas, nombreAp, prog, hablar, btnVoz, voces,
  _P: () => P, _bancos: BANCOS}; /* _P y _bancos: para las pruebas (qa/prueba-fpb.mjs) */
})();
