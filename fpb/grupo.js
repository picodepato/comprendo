/* COMPRENDO · FP Básica en grupo. Dos juegos con sala y código (el servidor de los retos: api/_retos.js en api/propuestas?retos=1)
   y uno sin móviles, para la pizarra digital.
   La sala guarda en «lectura» la configuración: fpb-<tema>-<apartados>-<nivel> (p. ej. fpb-l2-89-1). El contenido sale del banco
   de la asignatura con la semilla de la sala: es igual en todos los móviles.
     🏆 quiz     ¿Quién sabe más? Por rondas: sale una pregunta de elegir en la pizarra y en el móvil; acertar rápido da más puntos.
                 Cada uno puede pedir una pista (vale la mitad). Al cerrar la ronda se ve la buena y por qué las otras están mal.
     🃏 parejas  Parejas en equipo: a la izquierda las palabras y, repartidas entre los móviles del equipo, sus parejas como cartas.
                 Toca tu carta y luego su sitio. Si fallas, 5 segundos sin jugar. Solo hablando lo conseguís.
     📺 clase    En la pizarra, sin móviles: equipos por turnos. La clase lee la pregunta, el equipo contesta en voz alta y el profe toca la respuesta.
                 Si falla, rebota al siguiente equipo. Pistas y «quitar una mala» también aquí.
   Rutas: #fpb-grupo · #fpb-juego-<quiz|parejas> · #fpb-sala-<código> (móvil) · #fpb-pizarra-<código> (pizarra) · #fpb-clase-<tema> (sin móviles). */
(() => {
const API = "api/propuestas?retos=1";
const F = () => window.LYAFpb;
const L = () => window.LYA;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const J = {
  quiz: {ic: "🏆", n: "¿Quién sabe más?", c: "#f5b700", tipo: "rondas", eq: false, p: "Preguntas de elegir en la pizarra y en el móvil. Acertar rápido da más puntos.", def: {equipos: 0, dur: 8, rd: 45},
    como: ["En cada ronda sale una pregunta con opciones en la pizarra y en tu móvil.", "Toca la respuesta. Cuanto antes aciertes, más puntos.", "¿Te atascas? Pide una pista: si aciertas, ganas la mitad.", "Al cerrar la ronda se ve la buena y por qué las otras están mal."]},
  parejas: {ic: "🃏", n: "Parejas en equipo", c: "#53c41a", tipo: "libre", eq: true, p: "Las parejas están repartidas entre los móviles del equipo: solo hablando las juntáis.", def: {equipos: 3, dur: 8, rd: 60},
    como: ["Todos veis la lista de palabras (izquierda).", "Sus parejas están repartidas como cartas entre los móviles del equipo.", "Toca una carta tuya y luego su sitio. Si fallas, 5 segundos sin jugar.", "Gana el equipo que pone más parejas, con menos fallos y antes."]}
};
const ORDEN = ["quiz", "parejas"];
const COLORES = ["#ff7a45", "#7c6cff", "#2fbf71", "#ff4f8b", "#18b6d6", "#f5b700", "#a259ff", "#53c41a"];
const EQN = ["🦊 Zorros", "🐙 Pulpos", "🦉 Búhos", "🐺 Lobos", "🐢 Tortugas", "🦄 Unicornios", "🐝 Abejas", "🦖 Dinos"];
const DIF = ["", "Fácil", "Medio", "Difícil"];
const RE = /^fpb-(grupo|juego-([a-z]+)|sala-(\d{6})|pizarra-(\d{6})|clase-([a-z]\d{1,2}))$/;
const isGrupo = h => RE.test(h);
const enGrupo = () => isGrupo(location.hash.slice(1));
const E = {st: null, off: 0, poll: null, tick: null, firma: "", msg: "", msgOk: false, err: "", busy: false, ui: {}, crear: null, cache: {}};
const guard = {get() { try { return JSON.parse(localStorage.getItem("lyaFpbSala") || "{}"); } catch (e) { return {}; } }, set(v) { try { localStorage.setItem("lyaFpbSala", JSON.stringify(v)); } catch (e) {} }};
const mem = () => { const m = guard.get(); m.host ||= {}; m.play ||= {}; m.xp ||= {}; return m; };
const sala = () => E.st?.sala;
const ahora = () => Date.now() + E.off;
const mmss = ms => { ms = Math.max(0, ms); const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const jid = () => sala()?.juego?.slice(2);
const jg = () => J[jid()] || null;
const esProfe = () => { const r = window.LYACuentas?.rol; return r === "profe" || r === "admin"; };
let APP = null, vista = null, cod = null, juegoRuta = "quiz", temaPref = null;
document.addEventListener("click", e => { const a = e.target.closest?.("[data-fg-tema]"); if (a) temaPref = a.dataset.fgTema; }, true);

async function api(metodo, datos, q = "") {
  let r;
  try { r = await fetch(API + q, metodo === "GET" ? {cache: "no-store"} : {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(datos)}); }
  catch (e) { return {ok: false, error: "red"}; }
  const j = await r.json().catch(() => null);
  if (!j) return {ok: false, error: r.status === 404 ? "serv" : "red"};
  return {ok: r.ok, status: r.status, ...j};
}
function recibir(s) { if (!s || !s.sala) return; if (E.st && E.st.sala.codigo === s.sala.codigo && s.ahora < E.st.ahora) return; E.st = s; E.off = s.ahora - Date.now(); }
const ERR = {red: "No hay conexión. Lo intentamos otra vez…", serv: "El servidor no responde.", no_existe: "No hay ninguna sala abierta con ese código.", empezada: "La partida ya ha empezado y es por equipos: ya no se puede entrar.", llena: "La sala está llena.", nombre: "Escribe tu nombre.", equipo: "Elige un equipo.", fase: "Ahora no se puede.", muchas: "Demasiados intentos. Espera un poco.", juego: "Ese juego no existe.", lectura: "La configuración no es válida."};

/* ---------- configuración y contenido ---------- */
const CFG = () => { const m = String(sala()?.lectura || "").match(/^fpb-([a-z]\d{1,2})-([1-9]+)-([123])$/); return m ? {tema: m[1], aps: m[2].split("").map(Number), d: +m[3]} : {tema: "l2", aps: [1], d: 1}; };
const memo = (k, f) => { const kk = (sala()?.codigo || "") + ":" + (sala()?.semilla || "") + ":" + k; return E.cache[kk] ??= f(); };
const rng = salt => F().H.Rn(((sala()?.semilla || 1) + salt * 7919) % 2147483647);
function rondaQuiz(rr) {
  return memo("q" + rr, () => {
    const {tema, aps, d} = CFG(), evitar = new Set();
    for (let k = 0; k < rr; k++) evitar.add(rondaQuiz(k).e);
    return F().preguntaOpc(tema, aps, d, rng(100 + rr), evitar);
  });
}
function juegoParejas() {
  return memo("par", () => {
    const {tema, aps, d} = CFG(), r = rng(600), P = F().parejas(tema, aps, r, d === 1 ? 5 : d === 2 ? 7 : 9);
    return {pares: P, cartas: r.mez(P.map((p, i) => ({t: p[1], h: i})))};
  });
}

/* ---------- jugadores, equipos y puntos ---------- */
const yoId = () => mem().play[sala()?.codigo]?.id;
const yo = () => E.st?.jugadores.find(j => j.id === yoId());
const porEq = () => !!sala()?.equipos;
const miembros = e => (E.st?.jugadores || []).filter(j => j.e === e);
const eqNombre = e => EQN[(e - 1) % 8];
const unidades = () => porEq() ? Array.from({length: sala().equipos}, (_, i) => i + 1).filter(e => miembros(e).length).map(e => ({u: "e" + e, e, n: eqNombre(e), c: COLORES[(e - 1) % 8]})) : (E.st?.jugadores || []).map((j, i) => ({u: "j" + j.id, n: j.n, c: COLORES[i % 8]}));
const miU = () => { const y = yo(); return !y ? null : porEq() ? "e" + y.e : "j" + y.id; };
function ev(u, k) { const v = E.st?.ev?.[`${u}:${k}`]; if (v == null) return null; const s = String(v), i = s.lastIndexOf("|"); return i < 0 ? {v: s, ms: 0} : {v: s.slice(0, i), ms: +s.slice(i + 1)}; }
const num = (u, k) => +(ev(u, k)?.v || 0);
const rondas = () => jg()?.tipo === "rondas";
const finRonda = () => sala().tr + sala().rd * 1000;
const finLibre = () => sala().t0 + sala().dur * 60000;
const hecho = (u, rr) => !!ev(u, `r${rr}`);
const todosHechos = rr => { const us = unidades(); return us.length > 0 && us.every(u => hecho(u.u, rr)); };
const rondaAbierta = () => sala()?.fase === "juego" && rondas() && sala().cerrada !== sala().r && ahora() < finRonda() && !todosHechos(sala().r);
const parejasHecho = u => juegoParejas().pares.every((_, i) => ev(u, "h" + i));
const libreAcabado = () => { const s = sala(); if (!s) return false; if (s.fase === "fin") return true; if (s.fase !== "juego" || rondas()) return false; if (ahora() >= finLibre()) return true; const us = unidades(); return us.length > 0 && us.every(u => parejasHecho(u.u)); };
const rapidez = (ms, tot) => Math.round(500 * Math.max(0, 1 - ms / tot));
function puntosRonda(u, rr) {
  const x = ev(u, `r${rr}`); if (!x) return 0;
  const i = parseInt(x.v, 10), pista = /p$/.test(x.v), Q = rondaQuiz(rr);
  if (!Q.ops[i]?.ok) return 0;
  const p = 500 + rapidez(x.ms, sala().rd * 1000); return pista ? Math.round(p / 2) : p;
}
function cerradas() { const s = sala(); if (!s || s.fase === "espera") return 0; if (s.fase === "fin") return Math.min(s.dur, s.r + 1); return rondaAbierta() ? s.r : s.r + 1; }
function marcador() {
  const us = unidades();
  if (jid() === "quiz") { const n = cerradas(); return us.map(u => { let pts = 0, ac = 0; for (let rr = 0; rr < n; rr++) { const p = puntosRonda(u.u, rr); pts += p; if (p) ac++; } return {...u, pts, info: `${ac} aciertos`}; }).sort((a, b) => b.pts - a.pts); }
  const P = juegoParejas().pares;
  return us.map(u => { const puestos = P.filter((_, i) => ev(u.u, "h" + i)).length, err = num(u.u, "err"), fin = puestos === P.length; const ult = Math.max(0, ...P.map((_, i) => ev(u.u, "h" + i)?.ms || 0));
    return {...u, pts: Math.max(0, puestos * 100 - err * 20 + (fin ? Math.round(300 * Math.max(0, 1 - ult / (sala().dur * 60000))) : 0)), info: `${puestos}/${P.length} parejas · ${err} fallos`}; }).sort((a, b) => b.pts - a.pts);
}

/* ---------- vigilar la sala ---------- */
function parar() { clearInterval(E.poll); clearInterval(E.tick); E.poll = E.tick = null; }
function vigilar(c) {
  parar();
  const una = async () => {
    if (document.hidden || !enGrupo()) return;
    const r = await api("GET", null, "&sala=" + c);
    if (!enGrupo()) return parar();
    if (r.ok) { recibir(r); pintar(); autoHost(); }
    else if (r.status === 404) { E.err = "no_existe"; E.st = null; parar(); pintar(true); }
  };
  E.poll = setInterval(una, 1500);
  E.tick = setInterval(() => { if (!enGrupo()) return parar(); reloj(); const f = tiempoFirma(); if (f !== E.tf) { E.tf = f; pintar(true); } }, 400);
}
const tiempoFirma = () => { const s = sala(); if (!s) return ""; return [rondaAbierta() ? 1 : 0, libreAcabado() ? 1 : 0, E.ui.bloq && E.ui.bloq > ahora() ? 1 : 0].join(""); };
function reloj() {
  const s = sala(); if (!s) return;
  let t = 0;
  if (s.fase === "espera") t = rondas() ? s.rd * 1000 : s.dur * 60000;
  else if (s.fase === "juego") t = rondas() ? (rondaAbierta() ? finRonda() - ahora() : 0) : finLibre() - ahora();
  for (const el of document.querySelectorAll("[data-fg-reloj]")) el.textContent = mmss(t);
  for (const el of document.querySelectorAll("[data-fg-bloq]")) { const q = +el.dataset.fgBloq - ahora(); el.textContent = q > 0 ? `🔒 ${Math.ceil(q / 1000)} s` : ""; }
}
let autoT = 0;
function autoHost() { const s = sala(); if (!s || !mem().host[s.codigo] || s.fase !== "juego" || Date.now() - autoT < 4000) return; if (!rondas() && libreAcabado()) { autoT = Date.now(); host({accion: "terminar"}); } }

function render(app) {
  APP = app;
  const h = location.hash.slice(1), m = h.match(RE); if (!m) return;
  const nueva = m[5] ? "clase" : m[4] ? "pizarra" : m[3] ? "sala" : m[2] ? "juego" : "grupo", c = m[3] || m[4] || null;
  if (m[2]) { if (!J[m[2]]) { location.hash = "fpb-grupo"; return; } juegoRuta = m[2]; }
  if (nueva !== vista || c !== cod) { if (c !== cod) parar(); vista = nueva; cod = c; E.msg = ""; E.err = ""; E.firma = ""; E.ui = {}; if (!c) { parar(); E.st = null; } else if (E.st?.sala.codigo !== c) E.st = null; }
  if (vista === "clase") { parar(); return clase(app, m[5]); }
  document.body.classList.toggle("mg-pizarra", vista === "pizarra");
  try { L().setAcc?.((c && jg() ? jg() : J[juegoRuta]).c); } catch (e) {}
  if (c) { if (!E.poll) vigilar(c); if (!E.st && !E.err) { app.innerHTML = `<section class="wrap mt fp"><p class="msg">Cargando la sala…</p></section>`; primera(c); return; } }
  pintar(true);
}
async function primera(c) { const r = await api("GET", null, "&sala=" + c); if (r.ok) recibir(r); else E.err = r.status === 404 ? "no_existe" : r.error || "red"; pintar(true); }
function pintar(forzar) {
  if (!APP || !enGrupo() || vista === "clase") return;
  const firma = [vista, JSON.stringify(E.st && {...E.st, ahora: 0}), E.msg, E.err, tiempoFirma(), E.busy ? 1 : 0, JSON.stringify(E.ui), JSON.stringify(E.crear)].join("§");
  if (!forzar && firma === E.firma) return;
  E.firma = firma;
  const act = document.activeElement, idf = act && act.id && APP.contains(act) ? act.id : null, val = {}, y0 = scrollY;
  for (const el of APP.querySelectorAll("input[id]")) val[el.id] = el.type === "checkbox" ? el.checked : el.value;
  let html;
  if (vista === "grupo") html = grupoHTML();
  else if (vista === "juego") html = juegoHTML();
  else if (E.err && !sala()) html = `<section class="wrap mt fp"><div class="mt-box"><p>${esc(ERR[E.err] || ERR.red)}</p><a class="btn" href="#fpb-grupo">← Juegos de FP Básica</a></div></section>`;
  else if (vista === "pizarra") html = pizarraHTML();
  else html = salaHTML();
  APP.innerHTML = html;
  for (const id in val) { const el = document.getElementById(id); if (el && el.tagName === "INPUT") { if (el.type === "checkbox") el.checked = val[id]; else el.value = val[id]; } }
  if (idf) { const el = document.getElementById(idf); if (el) try { el.focus({preventScroll: true}); } catch (e) {} }
  if (!forzar) scrollTo(0, y0);
  reloj();
}
const aviso = () => E.msg ? `<p class="rt-aviso ${E.msgOk ? "ok" : ""}" role="status">${esc(E.msg)}</p>` : "";
function avisar(t, ok) { E.msg = t; E.msgOk = !!ok; clearTimeout(avisar.t); avisar.t = setTimeout(() => { E.msg = ""; pintar(true); }, 2600); if (!ok && navigator.vibrate) try { navigator.vibrate(150); } catch (e) {} pintar(true); }

/* ---------- tarjetas (FP Básica, la asignatura, el tema y «En grupo») ---------- */
function tiles(tema) {
  const dt = tema ? ` data-fg-tema="${tema}"` : "";
  return `<div class="mg-tiles">${ORDEN.map(j => `<a class="mg-tile" href="#fpb-juego-${j}" style="--c:${J[j].c}"${dt}><span class="mg-ic" aria-hidden="true">${J[j].ic}</span><span><b>${esc(J[j].n)}</b><small>${esc(J[j].p)}</small><em>${J[j].eq ? "Por equipos, con móvil" : "Con móvil, solos o por equipos"}</em></span></a>`).join("")}
    <a class="mg-tile" href="#fpb-clase-${tema || F()?.asignaturas()[0]?.temas[0]?.id || "l2"}" style="--c:#7c5cff"><span class="mg-ic" aria-hidden="true">📺</span><span><b>En la pizarra, por turnos</b><small>Sin móviles: los equipos contestan en voz alta y el profe toca la respuesta.</small><em>Sin móviles</em></span></a></div>`;
}
const codigoForm = () => `<form class="mt-box" data-fg-form="ir"><h2>🔑 Entrar con código</h2><div class="mg-mini"><input id="fg-cod" inputmode="numeric" maxlength="7" autocomplete="off" placeholder="123456" aria-label="Código de la sala"><button class="btn main">Entrar</button></div></form>`;
function grupoHTML() {
  return `<section class="wrap mt fp"><p class="mt-migas"><a href="#fpb">← FP Básica</a></p><h1 class="mt-h1">🏫 FP Básica en grupo</h1>
    <p class="mt-lead">Juegos para la clase. Con sala y código (los alumnos entran desde el móvil, sin cuenta) o en la pizarra, sin móviles.</p>
    ${aviso()}${codigoForm()}<h2 class="mt-h2">Crear una sala</h2>${tiles()}</section>`;
}
const todosTemas = () => (F()?.asignaturas() || []).flatMap(A => A.temas.map(T => ({A, T})));
function temaSel(c) {
  return `<label for="fg-tema">Tema</label><select id="fg-tema" data-fg-c="tema">${todosTemas().map(({A, T}) => `<option value="${T.id}" ${c.tema === T.id ? "selected" : ""}>${esc(A.n)} · Tema ${T.n}: ${esc(T.titulo)}</option>`).join("")}</select>`;
}
function apsHTML(c) {
  const T = F().tema(c.tema); if (!T) return "";
  return `<label>Apartados</label><div class="mg-aps" role="group" aria-label="Apartados">${T.aps.map(a => `<label><input type="checkbox" id="fg-ap${a.n}" data-fg-ap="${a.n}" ${c.aps.includes(a.n) ? "checked" : ""}> ${a.n}. ${esc(a.titulo)}</label>`).join("")}</div>`;
}
const temaInicial = () => { const ts = todosTemas().map(x => x.T.id); return ts.includes(temaPref) ? temaPref : ts[0] || "l2"; };
function juegoHTML() {
  const j = juegoRuta, g = J[j];
  const c = E.crear?.j === j ? E.crear : (E.crear = {j, tema: temaInicial(), d: 1, ...g.def, aps: (F().tema(temaInicial())?.aps || []).map(a => a.n), juega: !esProfe()});
  const eqOps = [...(g.eq ? [] : [0]), 1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}" ${+c.equipos === n ? "selected" : ""}>${n === 0 ? "Cada uno por su cuenta" : n === 1 ? "1 equipo (toda la clase)" : n + " equipos"}</option>`).join("");
  const durOps = g.tipo === "rondas" ? [4, 5, 6, 8, 10, 12, 15].map(n => `<option value="${n}" ${+c.dur === n ? "selected" : ""}>${n} preguntas</option>`).join("") : [5, 8, 10, 12, 15].map(n => `<option value="${n}" ${+c.dur === n ? "selected" : ""}>${n} minutos</option>`).join("");
  const rdOps = [30, 45, 60, 90, 120].map(n => `<option value="${n}" ${+c.rd === n ? "selected" : ""}>${n < 60 ? n + " s" : n / 60 + " min"}</option>`).join("");
  return `<section class="wrap mt fp" style="--c:${g.c}"><p class="mt-migas"><a href="#fpb-grupo">← FP Básica en grupo</a></p>
    <h1 class="mt-h1">${g.ic} ${esc(g.n)}</h1><p class="mt-lead">${esc(g.p)}</p>${aviso()}
    <details class="rt-como" open><summary>Cómo se juega</summary><ol>${g.como.map(x => `<li>${esc(x)}</li>`).join("")}</ol></details>
    <div class="rt-dos">${codigoForm()}
      <form class="mt-box" data-fg-form="crear"><h2>✨ Crear sala</h2>
        ${temaSel(c)}${apsHTML(c)}
        <label for="fg-d">Nivel</label><select id="fg-d" data-fg-c="d">${[1, 2, 3].map(d => `<option value="${d}" ${+c.d === d ? "selected" : ""}>${DIF[d]}</option>`).join("")}</select>
        <label for="fg-eq">Equipos</label><select id="fg-eq" data-fg-c="equipos">${eqOps}</select>
        <div class="rt-fila"><div><label for="fg-dur">${g.tipo === "rondas" ? "Preguntas" : "Duración"}</label><select id="fg-dur" data-fg-c="dur">${durOps}</select></div>
          ${g.tipo === "rondas" ? `<div><label for="fg-rd">Tiempo por pregunta</label><select id="fg-rd" data-fg-c="rd">${rdOps}</select></div>` : ""}</div>
        <label class="check" style="color:var(--ink)"><input type="checkbox" id="fg-juega" data-fg-c="juega" ${c.juega ? "checked" : ""}> Voy a jugar yo también</label>
        <p class="rt-err">${esc(E.err ? ERR[E.err] || E.err : "")}</p>
        <button class="btn main" ${E.busy || !c.aps.length ? "disabled" : ""}>${g.ic} Crear sala</button></form></div></section>`;
}

/* ---------- sala (móvil) ---------- */
function cabeza(extra = "") {
  const s = sala(), g = jg(), cfg = CFG(), T = F().tema(cfg.tema);
  return `<p class="mt-migas"><a href="#fpb-juego-${jid()}">← ${esc(g.n)}</a> · Código <b>${esc(s.codigo)}</b> · ${esc(T ? `Tema ${T.n}: ${T.titulo}` : "")} · ${DIF[cfg.d]}</p>
    <div class="rt-top" style="--c:${g.c}"><span>${g.ic} <b>${esc(g.n)}</b>${extra}</span>${s.fase === "juego" ? `<span class="rt-reloj">⏱ <b data-fg-reloj>--:--</b>${rondas() ? ` · Pregunta ${s.r + 1}/${s.dur}` : ""}</span>` : ""}</div>`;
}
function mandoHTML() {
  const s = sala(); if (!mem().host[s.codigo]) return "";
  if (s.fase === "espera") return `<p class="mt-acc"><button class="btn main" data-fg="empezar" ${E.st.jugadores.length ? "" : "disabled"}>🚀 Empezar</button> <a class="btn" href="#fpb-pizarra-${s.codigo}">📺 Pizarra</a></p>`;
  if (s.fase === "juego") return `<p class="mt-acc">${rondas() ? (rondaAbierta() ? `<button class="btn" data-fg="cerrar">⏹ Cerrar la pregunta</button>` : s.r + 1 < s.dur ? `<button class="btn main" data-fg="ronda">⏭ Siguiente pregunta</button>` : `<button class="btn main" data-fg="terminar">🏁 Ver resultados</button>`) : ""} <button class="btn" data-fg="terminar">Terminar</button></p>`;
  return "";
}
const equiposLista = () => `<div class="mg-eqs">${Array.from({length: sala().equipos}, (_, i) => i + 1).map(e => `<div class="mg-eq" style="--c:${COLORES[(e - 1) % 8]}"><b>${esc(eqNombre(e))}</b><span class="mt-small">${miembros(e).map(j => esc(j.n)).join(", ") || "—"}</span></div>`).join("")}</div>`;
function salaHTML() {
  const s = sala(), g = jg(), y = yo();
  if (!g) return `<section class="wrap mt fp"><div class="mt-box"><p>Esta sala no es de FP Básica.</p><a class="btn" href="#grupo">Ir a «En grupo»</a></div></section>`;
  let body;
  if (!y || E.ui.cambiar) body = unirmeHTML();
  else if (s.fase === "espera") body = `<div class="mt-box"><h2>⏳ Esperando a que empiece…</h2><p>Estás dentro como <b>${esc(y.n)}</b>${porEq() ? ` en <b>${esc(eqNombre(y.e))}</b>` : ""}.</p>
    ${porEq() ? equiposLista() : `<p class="mt-small">${E.st.jugadores.map(j => esc(j.n)).join(" · ")}</p>`}
    <details class="rt-como"><summary>Cómo se juega</summary><ol>${g.como.map(x => `<li>${esc(x)}</li>`).join("")}</ol></details>
    <p><button class="btn" data-fg="cambiar">Cambiar nombre o equipo</button></p></div>`;
  else if (s.fase === "fin" || libreAcabado()) body = finHTML();
  else body = jid() === "quiz" ? jQuiz() : jParejas();
  return `<section class="wrap mt fp" style="--c:${g.c}">${cabeza(y && porEq() ? ` · ${esc(eqNombre(y.e))}` : "")}${aviso()}${mandoHTML()}${body}</section>`;
}
function unirmeHTML() {
  const s = sala(), m = mem();
  if (s.fase === "fin") return `<div class="mt-box"><p>Esta partida ya ha terminado.</p></div>${finHTML()}`;
  if (s.fase === "juego" && porEq()) return `<div class="mt-box"><p>${esc(ERR.empezada)}</p></div>`;
  const sel = E.ui.equipo || yo()?.e || 0;
  return `<form class="mt-box" data-fg-form="unirme"><h2>👋 Entrar en la sala</h2><label for="fg-nom">Tu nombre</label><input id="fg-nom" maxlength="20" autocomplete="off" value="${esc(yo()?.n || m.nombre || "")}">
    ${porEq() ? `<label>Elige equipo</label><div class="rt-eqs">${Array.from({length: s.equipos}, (_, i) => i + 1).map(e => `<button type="button" class="rt-eq ${sel === e ? "sel" : ""}" style="--c:${COLORES[(e - 1) % 8]}" data-fg="equipo" data-e="${e}"><b>${esc(eqNombre(e))}</b><small>${miembros(e).map(j => esc(j.n)).join(", ") || "—"}</small></button>`).join("")}</div>` : ""}
    <p><button class="btn main" ${E.busy ? "disabled" : ""}>Entrar</button></p></form>`;
}
const tablaHTML = rk => `<table class="mg-tabla"><thead><tr><th>#</th><th>${porEq() ? "Equipo" : "Jugador"}</th><th>Puntos</th></tr></thead><tbody>${rk.map((x, i) => `<tr${x.u === miU() ? ' style="font-weight:800"' : ""}><td>${i + 1}</td><td><span style="color:${x.c}">●</span> ${esc(x.n)} <small class="mt-small">${esc(x.info || "")}</small></td><td>${x.pts}</td></tr>`).join("")}</tbody></table>`;
function finHTML() {
  const rk = marcador(), mi = miU(), pos = rk.findIndex(x => x.u === mi);
  darXP(pos);
  return `<div class="mt-box"><h2>🏁 Resultados</h2>${pos >= 0 ? `<p class="mt-big">${["🥇", "🥈", "🥉"][pos] || "🎉"}</p><p>Puesto <b>${pos + 1}</b> de ${rk.length}.</p>` : ""}${tablaHTML(rk)}${solucionesHTML()}</div>`;
}
function darXP(pos) { const c = sala().codigo, m = mem(); if (m.xp[c] || pos < 0) return; m.xp[c] = Date.now(); guard.set(m); try { dispatchEvent(new CustomEvent("lya:xp", {detail: {xp: 10 + ([30, 20, 15][pos] || 0), src: "fpb-grupo"}})); } catch (e) {} }
function solucionesHTML() {
  if (jid() === "parejas") return `<details class="rt-como"><summary>Ver las parejas</summary><ol>${juegoParejas().pares.map(p => `<li>${esc(p[0])} → <b>${esc(p[1])}</b></li>`).join("")}</ol></details>`;
  return `<details class="rt-como"><summary>Ver las respuestas</summary><ol>${Array.from({length: cerradas()}, (_, rr) => { const Q = rondaQuiz(rr); return `<li>${esc(Q.e)} → <b>${esc(Q.ops.find(o => o.ok).t)}</b></li>`; }).join("")}</ol></details>`;
}
/* 🏆 quiz en el móvil */
function opsQuiz(Q, elegida, abierta) {
  return `<div class="mt-ops fp-ops">${Q.ops.map((o, i) => `<button type="button" class="mt-op ${!abierta ? (o.ok ? "right" : i === elegida ? "wrong" : "dim") : i === elegida ? "sel" : ""}" data-fg="op" data-i="${i}" ${!abierta || elegida !== null ? "disabled" : ""}><span class="fp-letra">${"ABCD"[i]}</span> ${esc(o.t)}</button>`).join("")}</div>`;
}
function jQuiz() {
  const s = sala(), rr = s.r, Q = rondaQuiz(rr), u = miU(), x = ev(u, `r${rr}`), el = x ? parseInt(x.v, 10) : null, ab = rondaAbierta(), pista = E.ui.pista === rr;
  if (!ab) return finRondaHTML(true);
  return `<div class="mt-box"><p class="fp-enun">${esc(Q.e)} ${F().btnVoz([Q.e, Q.t || "", ...Q.ops.map(o => o.t)].join(". "))}</p>${Q.t ? `<blockquote class="fp-cita">${Q.t.split("\n").map(esc).join("<br>")}</blockquote>` : ""}
    ${!x ? (pista ? `<p class="mt-pista"><b>💡</b> ${esc(Q.pi[0] || "")}</p>` : `<p><button type="button" class="mt-pbtn" data-fg="pista">💡 Pista <small>(si aciertas, la mitad de puntos)</small></button></p>`) : ""}
    ${opsQuiz(Q, el, true)}${x ? `<p class="mt-small">✅ Respuesta enviada. Esperando a los demás…</p>` : ""}</div>`;
}
function finRondaHTML(movil) {
  const rr = sala().r, Q = rondaQuiz(rr), u = miU(), x = movil ? ev(u, `r${rr}`) : null, el = x ? parseInt(x.v, 10) : null, buena = Q.ops.find(o => o.ok);
  const rk = marcador();
  return `<div class="mt-box"><p class="fp-enun">${esc(Q.e)}</p>${opsQuiz(Q, el, false)}
    ${movil ? `<p class="mt-fb ${el !== null && Q.ops[el]?.ok ? "ok" : "no"}"><b>${el === null ? "⌛ No has contestado" : Q.ops[el]?.ok ? `🎉 ¡Bien! +${puntosRonda(u, rr)}` : "😬 Esta vez no"}</b></p>` : ""}
    <p>La buena: <b>${esc(buena.t)}</b></p>
    <ul class="mt-small">${Q.ops.filter(o => !o.ok && o.por).map(o => `<li><b>${esc(o.t)}</b>: ${esc(o.por)}</li>`).join("")}</ul>
    ${movil ? "" : `<h3>Clasificación</h3>${tablaHTML(rk.slice(0, 8))}`}
    ${movil ? `<p class="mt-small">Espera a la siguiente pregunta…</p>` : ""}</div>`;
}
/* 🃏 parejas en el móvil */
function misCartas() { const y = yo(), ms = miembros(y.e), k = ms.findIndex(j => j.id === y.id), C = juegoParejas(); return C.cartas.map((c, gi) => ({...c, gi})).filter(c => c.gi % ms.length === k); }
function jParejas() {
  const C = juegoParejas(), u = miU(), mias = misCartas().filter(c => !ev(u, "h" + c.h)), bloq = E.ui.bloq > ahora();
  return `<div class="mt-box"><h2>🃏 Tus cartas</h2>${bloq ? `<p class="mg-bloq" data-fg-bloq="${E.ui.bloq}"></p>` : ""}
    <div class="fp-cartas">${mias.map(c => `<button type="button" class="fp-chip ${E.ui.sel === c.gi ? "sel" : ""}" data-fg="carta" data-i="${c.gi}" ${bloq ? "disabled" : ""}>${esc(c.t)}</button>`).join("") || `<p class="mt-small">Ya no te quedan cartas. ¡Ayuda a tu equipo hablando!</p>`}</div>
    <h2>📋 Las parejas</h2><p class="mt-small">${E.ui.sel != null ? "Ahora toca su sitio." : "Toca una carta tuya y luego su sitio."}</p>
    <div class="fp-huecos">${C.pares.map((p, i) => { const x = ev(u, "h" + i); return `<button type="button" class="fp-hueco ${x ? "ok" : ""}" data-fg="hueco" data-i="${i}" ${x || bloq ? "disabled" : ""}><span>${esc(p[0])}</span><b>${x ? "✅ " + esc(p[1]) : "▢"}</b></button>`; }).join("")}</div>
    <p class="mt-small">${num(u, "err")} fallos del equipo</p></div>`;
}

/* ---------- pizarra ---------- */
function pizarraHTML() {
  const s = sala(), g = jg(), c = mem().host[s.codigo];
  if (!g) return `<section class="wrap mt fp"><p>Esta sala no es de FP Básica.</p></section>`;
  let body = "";
  if (s.fase === "espera") body = `<div class="mt-box" style="text-align:center"><p>Entrad en <b>COMPRENDO → En grupo</b> y escribid el código:</p><p class="mg-grande" style="letter-spacing:8px">${esc(s.codigo)}</p>
    <p class="mt-small">o abrid el enlace: <b>${esc(location.origin + location.pathname)}#fpb-sala-${esc(s.codigo)}</b></p></div>
    ${porEq() ? equiposLista() : `<div class="mt-box"><h2>Jugadores (${E.st.jugadores.length})</h2><p>${E.st.jugadores.map(j => `<span class="rt-j">${esc(j.n)}${c ? ` <button class="rt-x" data-fg="echar" data-j="${esc(j.id)}" aria-label="Sacar a ${esc(j.n)}">✕</button>` : ""}</span>`).join(" ") || "<i>Aún no hay nadie</i>"}</p></div>`}
    <details class="rt-como"><summary>Cómo se juega</summary><ol>${g.como.map(x => `<li>${esc(x)}</li>`).join("")}</ol></details>`;
  else if (s.fase === "fin" || libreAcabado()) body = `<div class="mt-box"><h2>🏁 Resultados</h2><p class="mg-grande" style="text-align:center">${marcador().slice(0, 3).map((x, i) => `${["🥇", "🥈", "🥉"][i]} ${esc(x.n)}`).join(" · ")}</p>${tablaHTML(marcador())}${solucionesHTML()}</div>`;
  else if (jid() === "quiz") {
    const Q = rondaQuiz(s.r), us = unidades();
    body = rondaAbierta() ? `<div class="mt-box fp-clase"><p class="fp-enun">${esc(Q.e)}</p>${Q.t ? `<blockquote class="fp-cita">${Q.t.split("\n").map(esc).join("<br>")}</blockquote>` : ""}<div class="mt-ops fp-ops">${Q.ops.map((o, i) => `<div class="mt-op"><span class="fp-letra">${"ABCD"[i]}</span> ${esc(o.t)}</div>`).join("")}</div><p class="mt-small">Han contestado ${us.filter(u => hecho(u.u, s.r)).length} de ${us.length}.</p></div>` : finRondaHTML(false);
  } else body = `<div class="mt-box"><h2>🃏 Parejas</h2><div class="mg-eqs">${marcador().map(u => `<div class="mg-eq" style="--c:${u.c}"><b>${esc(u.n)}</b><span>${esc(u.info)}</span></div>`).join("")}</div></div>`;
  return `<section class="wrap mt fp" style="--c:${g.c}">${cabeza()}${aviso()}${c ? mandoHTML().replace(/<a class="btn" href="#fpb-pizarra[^<]*<\/a>/, "") : ""}${body}</section>`;
}

/* ---------- acciones ---------- */
async function accion(datos) { E.busy = true; const r = await api("POST", {sala: sala()?.codigo, ...datos}); E.busy = false; if (r.estado) recibir(r.estado); return r; }
const host = async a => { const r = await accion({clave: mem().host[sala().codigo]?.clave, ...a}); if (!r.ok) avisar(ERR[r.error] || ERR.red); else pintar(true); return r; };
const jugar = async (k, v, o = {}) => { const r = await accion({accion: "jugar", jugador: yoId(), k, v: String(v), eq: porEq(), ...o}); if (!r.ok) avisar(ERR[r.error] || ERR.red); pintar(true); return r; };
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-fg]"); if (!b || !APP?.contains(b) || vista === "clase") return;
  const a = b.dataset.fg, s = sala();
  if (a === "empezar") return host({accion: "empezar"});
  if (a === "terminar") return host({accion: "terminar"});
  if (a === "ronda") return host({accion: "ronda", r: s.r + 1});
  if (a === "cerrar") return host({accion: "cerrar"});
  if (a === "echar") return host({accion: "echar", jugador: b.dataset.j});
  if (a === "equipo") { E.ui.equipo = +b.dataset.e; return pintar(true); }
  if (a === "cambiar") { E.ui.cambiar = true; return pintar(true); }
  const rr = s?.r, u = miU();
  if (a === "pista") { E.ui.pista = rr; return pintar(true); }
  if (a === "op") { if (!rondaAbierta() || ev(u, `r${rr}`)) return; return jugar(`r${rr}`, `${+b.dataset.i}${E.ui.pista === rr ? "p" : ""}`, {uno: true}); }
  if (a === "carta") { E.ui.sel = E.ui.sel === +b.dataset.i ? null : +b.dataset.i; return pintar(true); }
  if (a === "hueco") {
    const i = +b.dataset.i, C = juegoParejas();
    if (E.ui.sel == null) return avisar("Primero toca una de tus cartas.");
    if (E.ui.bloq > ahora()) return;
    const gi = E.ui.sel; E.ui.sel = null;
    if (C.cartas[gi].t === C.pares[i][1]) { await jugar("h" + i, gi, {uno: true}); return avisar("✅ ¡Bien!", true); }
    E.ui.bloq = ahora() + 5000; await jugar("err", 1, {suma: true}); return avisar(`❌ «${C.cartas[gi].t}» no va con «${C.pares[i][0]}». 5 segundos sin jugar.`);
  }
});
document.addEventListener("submit", async e => {
  const f = e.target.closest("[data-fg-form]"); if (!f || !APP?.contains(f)) return; e.preventDefault();
  const t = f.dataset.fgForm;
  if (t === "ir") { const c = (document.getElementById("fg-cod").value || "").replace(/\D/g, ""); if (c.length !== 6) return avisar("El código tiene 6 números."); location.hash = "#fpb-sala-" + c; return; }
  if (t === "crear") {
    const c = E.crear; if (!c.aps.length) return;
    E.busy = true; E.err = ""; pintar(true);
    const lectura = `fpb-${c.tema}-${[...c.aps].sort((a, b) => a - b).join("")}-${c.d}`;
    const r = await api("POST", {accion: "crear", juego: "f-" + c.j, lectura, file: "fpb/" + c.tema, lang: "es", equipos: c.equipos, dur: c.dur, rd: c.rd});
    E.busy = false;
    if (!r.ok) { E.err = r.error || "red"; return pintar(true); }
    const m = mem(); m.host[r.sala] = {clave: r.clave, t: Date.now()}; for (const k in m.host) if (Date.now() - m.host[k].t > 864e5) delete m.host[k]; guard.set(m);
    recibir(r.estado); location.hash = (c.juega ? "#fpb-sala-" : "#fpb-pizarra-") + r.sala; return;
  }
  if (t === "unirme") {
    const nombre = document.getElementById("fg-nom").value.trim(), eq = porEq() ? +(E.ui.equipo || yo()?.e || 0) : 0;
    if (!nombre) return avisar(ERR.nombre);
    if (porEq() && !eq) return avisar(ERR.equipo);
    const m = mem(), c = sala().codigo;
    const r = await accion({accion: "entrar", nombre, equipo: eq, jugador: m.play[c]?.id});
    if (!r.ok) return avisar(ERR[r.error] || ERR.red);
    m.play[c] = {id: r.jugador, t: Date.now()}; m.nombre = nombre; for (const k in m.play) if (Date.now() - m.play[k].t > 864e5) delete m.play[k]; guard.set(m);
    E.ui.cambiar = false; return pintar(true);
  }
});
document.addEventListener("change", e => {
  const el = e.target; if (!APP?.contains(el) || !E.crear || vista === "clase") return;
  if (el.dataset.fgAp) { const n = +el.dataset.fgAp; E.crear.aps = el.checked ? [...new Set([...E.crear.aps, n])] : E.crear.aps.filter(x => x !== n); return pintar(true); }
  const k = el.dataset.fgC; if (!k) return;
  if (k === "tema") { E.crear.tema = el.value; E.crear.aps = (F().tema(el.value)?.aps || []).map(a => a.n); return pintar(true); }
  E.crear[k] = el.type === "checkbox" ? el.checked : +el.value; pintar(true);
});

/* ---------- 📺 en la pizarra, sin móviles ---------- */
let C = null;
function clase(app, temaId) {
  APP = app;
  const T = F().tema(temaId); if (!T) { location.hash = "fpb-grupo"; return; }
  try { L().setAcc?.(T.color); } catch (e) {}
  const A = F().asigDe(T.id);
  const cab = `<p class="mt-migas"><a href="#fpb-${T.id}">← Tema ${T.n} · ${esc(T.titulo)}</a> · <a href="#fpb-grupo">Juegos</a></p><h1 class="mt-h1"><small>${esc(A.n)} · Tema ${T.n}</small> 📺 En la pizarra, por turnos</h1>`;
  if (!C || C.tema !== T.id || C.prep) {
    const c = C?.tema === T.id && C.prep ? C : (C = {tema: T.id, prep: true, eq: 3, n: 10, d: 1, aps: T.aps.map(a => a.n)});
    app.innerHTML = `<section class="wrap mt fp fp-clase" style="--c:${T.color}">${cab}
      <p class="mt-lead">Sin móviles. La pregunta sale en grande; le toca a un equipo, que contesta en voz alta, y el profe toca la respuesta. Si falla, rebota al siguiente equipo.</p>
      <div class="mt-box"><h2>Preparar</h2>
        <label for="fc-tema">Tema</label><select id="fc-tema" data-fc="tema">${todosTemas().map(({A, T: t}) => `<option value="${t.id}" ${t.id === T.id ? "selected" : ""}>${esc(A.n)} · Tema ${t.n}: ${esc(t.titulo)}</option>`).join("")}</select>
        <label>Apartados</label><div class="mg-aps">${T.aps.map(a => `<label><input type="checkbox" data-fc-ap="${a.n}" ${c.aps.includes(a.n) ? "checked" : ""}> ${a.n}. ${esc(a.titulo)}</label>`).join("")}</div>
        <div class="rt-fila"><div><label for="fc-eq">Equipos</label><select id="fc-eq" data-fc="eq">${[2, 3, 4, 5, 6].map(n => `<option value="${n}" ${c.eq === n ? "selected" : ""}>${n}</option>`).join("")}</select></div>
          <div><label for="fc-n">Preguntas</label><select id="fc-n" data-fc="n">${[6, 8, 10, 12, 15, 20].map(n => `<option value="${n}" ${c.n === n ? "selected" : ""}>${n}</option>`).join("")}</select></div>
          <div><label for="fc-d">Nivel</label><select id="fc-d" data-fc="d">${[1, 2, 3].map(d => `<option value="${d}" ${c.d === d ? "selected" : ""}>${DIF[d]}</option>`).join("")}</select></div></div>
        <p class="mt-acc"><button class="btn main" data-fc="go" ${c.aps.length ? "" : "disabled"}>🚀 Empezar</button></p></div></section>`;
    return;
  }
  const marc = `<div class="fp-marc">${C.pts.map((p, e) => `<span class="${e === C.turno && C.fase !== "fin" ? "turno" : ""}" style="border-color:${e === C.turno ? COLORES[e] : ""}">${esc(EQN[e])}: ${p}</span>`).join("")}</div>`;
  if (C.fase === "fin") {
    const max = Math.max(...C.pts), gan = C.pts.map((p, e) => p === max ? EQN[e] : null).filter(Boolean);
    app.innerHTML = `<section class="wrap mt fp fp-clase" style="--c:${T.color}">${cab}<div class="mt-box mt-fin"><p class="mt-big">🏆</p><h2>${gan.length > 1 ? "¡Empate! " : "¡Gana "}${esc(gan.join(" y "))}${gan.length > 1 ? "" : "!"}</h2>${marc}
      <p class="mt-acc"><button class="btn main" data-fc="otra">🔁 Otra partida</button> <button class="btn" data-fc="prep">Cambiar</button></p></div></section>`;
    return;
  }
  const Q = C.serie[C.i], fb = C.fase === "fb";
  app.innerHTML = `<section class="wrap mt fp fp-clase" style="--c:${T.color}">${cab}${marc}
    <div class="mt-box"><div class="mt-qtop"><span>Pregunta ${C.i + 1} / ${C.serie.length}</span><span>Le toca a <b style="color:${COLORES[C.turno]}">${esc(EQN[C.turno])}</b>${C.rebote ? " (rebote)" : ""}</span></div>
      <p class="fp-enun">${esc(Q.e)} ${F().btnVoz([Q.e, Q.t || "", ...Q.ops.map((o, i) => "ABCD"[i] + ": " + o.t)].join(". "))}</p>
      ${Q.t ? `<blockquote class="fp-cita">${Q.t.split("\n").map(esc).join("<br>")}</blockquote>` : ""}
      ${Q.img ? `<div class="fp-img">${Q.img}</div>` : ""}
      ${!fb ? `<div class="mt-pistas">${Q.pi.slice(0, C.pist).map((t, i) => `<p class="mt-pista"><b>💡 ${i + 1}</b> ${esc(t)}</p>`).join("")}</div><div class="fp-ayudas">${C.pist < Q.pi.length ? `<button class="mt-pbtn" data-fc="pista">💡 Pista (vale 1 punto)</button>` : ""}${Q.ops.length - C.fuera.length > 2 ? `<button class="mt-pbtn" data-fc="quitar">✂️ Quitar una mala</button>` : ""}</div>` : ""}
      ${C.aviso ? `<p class="mt-fb no">❌ ${esc(C.aviso)}</p>` : ""}
      <div class="mt-ops fp-ops">${Q.ops.map((o, i) => { const f = C.fuera.includes(i); return `<button type="button" class="mt-op ${fb ? (o.ok ? "right" : "dim") : f ? "dim fp-quit" : ""}" data-fc="op" data-i="${i}" ${fb || f ? "disabled" : ""}><span class="fp-letra">${"ABCD"[i]}</span> ${esc(o.t)}</button>`; }).join("")}</div>
      ${fb ? `<div class="mt-fb ${C.gano >= 0 ? "ok" : "no"}"><b>${C.gano >= 0 ? `🎉 ¡Punto para ${esc(EQN[C.gano])}!` : "😬 Nadie ha acertado"}</b>${Q.r?.length ? `<div class="mt-asi"><b>Así se hace:</b><ol>${Q.r.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>` : ""}</div>
        <p class="mt-acc"><button class="btn main" data-fc="sig">${C.i + 1 < C.serie.length ? "Siguiente pregunta →" : "Ver quién gana"}</button></p>` : ""}</div></section>`;
}
function nuevaClase() {
  const r = F().H.Rn(Math.floor(Math.random() * 2 ** 31)), serie = [], vistos = new Set();
  for (let k = 0; serie.length < C.n && k < 400; k++) { const q = F().preguntaOpc(C.tema, C.aps, C.d, r, vistos); if (vistos.has(q.e) && k < 300) continue; vistos.add(q.e); serie.push(q); }
  Object.assign(C, {prep: false, serie, i: 0, turno: 0, pts: Array(C.eq).fill(0), fase: "preg", fuera: [], pist: 0, intentos: 0, rebote: false, aviso: null, gano: -1, r});
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-fc]"); if (!b || vista !== "clase" || !C || b.tagName === "SELECT") return;
  const a = b.dataset.fc, Q = C.serie?.[C.i];
  if (a === "go") { nuevaClase(); }
  else if (a === "otra") { nuevaClase(); }
  else if (a === "prep") { C.prep = true; }
  else if (a === "pista") { C.pist++; }
  else if (a === "quitar") { const m = Q.ops.map((o, i) => i).filter(i => !Q.ops[i].ok && !C.fuera.includes(i)); if (m.length) C.fuera.push(C.r.pick(m)); }
  else if (a === "op") {
    const i = +b.dataset.i, o = Q.ops[i];
    if (o.ok) { C.pts[C.turno] += C.pist || C.rebote ? 1 : 2; C.gano = C.turno; C.fase = "fb"; C.aviso = null; }
    else { C.fuera.push(i); C.intentos++; C.aviso = `${EQN[C.turno]}: ${o.por || "no es esa."}`;
      if (C.intentos >= Math.min(C.eq, Q.ops.length - 1) || Q.ops.length - C.fuera.length <= 1) { C.gano = -1; C.fase = "fb"; }
      else { C.turno = (C.turno + 1) % C.eq; C.rebote = true; } }
  } else if (a === "sig") {
    if (C.i + 1 >= C.serie.length) C.fase = "fin";
    else { C.i++; C.turno = (C.i) % C.eq; Object.assign(C, {fase: "preg", fuera: [], pist: 0, intentos: 0, rebote: false, aviso: null, gano: -1}); }
  } else return;
  clase(APP, C.tema);
});
document.addEventListener("change", e => {
  const el = e.target; if (vista !== "clase" || !C || !APP?.contains(el)) return;
  if (el.dataset.fcAp) { const n = +el.dataset.fcAp; C.aps = el.checked ? [...new Set([...C.aps, n])] : C.aps.filter(x => x !== n); return clase(APP, C.tema); }
  const k = el.dataset.fc; if (!k) return;
  if (k === "tema") { location.hash = "fpb-clase-" + el.value; C = null; return; }
  C[k] = +el.value; clase(APP, C.tema);
});
document.addEventListener("input", e => { if (e.target.id === "fg-cod") e.target.value = e.target.value.replace(/[^\d ]/g, ""); });

window.LYAFpbGrupo = {isGrupo, render, tiles, J, _t: {E, rondaQuiz, juegoParejas, marcador, misCartas, C: () => C}}; /* _t: para las pruebas */
})();
