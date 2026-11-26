/* Retos en grupo (apartado «En grupo»): cinco juegos de clase con sala y código, para TODAS las lecturas, sin preparar nada a mano.
   - 🔎 Encuentra la prueba (prueba): sale una pregunta o una definición y hay que tocar la frase o la palabra exacta del texto.
     El más rápido gana más; si tocas mal, 3 s bloqueado; mapa de calor de dónde ha tocado la clase. Individual o por equipos.
   - 🎲 Atrapa los puntos (apuesta): afirmación verdadera o falsa sacada de las preguntas, saldo de 1000 y apuesta;
     si el equipo toca la frase que lo demuestra, gana el doble. Individual o por equipos.
   - 🃏 Cartas a la mesa (cartas): texto con huecos; las palabras van repartidas como cartas entre los móviles del equipo,
     con 2 cartas trampa y un comodín por equipo.
   - 🤐 Palabra secreta (tabu): por turnos, un guía explica una palabra clave sin decir las prohibidas; los demás la tocan en el texto.
     Botón «¡Tabú!» para quitarle el turno si dice una prohibida.
   - 🧭 Lector y piloto (piloto): lectores ven solo el texto y pilotos solo los retos (las preguntas); como mucho 3 preguntas
     por reto; a mitad de partida se cambian los papeles.
   El contenido sale de la lectura y de content/<idioma>/retos.json (retos/generar.mjs), igual en todos los aparatos (misma semilla).
   Servidor: api/_retos.js (montado en api/propuestas?retos=1). Polling cada 1,5 s (caché de 1 s en Vercel).
   Rutas: #reto-<juego> (explicación, entrar con código y crear sala), #reto-<código> (alumno), #reto-pizarra-<código> (pizarra). */
(() => {
const API = "api/propuestas?retos=1";
const JUEGOS = {prueba: {ic: "🔎", tipo: "rondas", c: "#ff7a45"}, apuesta: {ic: "🎲", tipo: "rondas", c: "#f5b700"}, cartas: {ic: "🃏", tipo: "libre", c: "#2fbf71"}, tabu: {ic: "🤐", tipo: "libre", c: "#ff4f8b"}, piloto: {ic: "🧭", tipo: "libre", c: "#18b6d6"}};
const L = () => window.LYA, st = () => L().get(), TX = () => window.LYARetosTexto, STR = () => window.LYARetosSTR;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const COLORES = ["#ff7a45", "#7c6cff", "#2fbf71", "#ff4f8b", "#18b6d6", "#f5b700", "#a259ff", "#53c41a"];
const EMOJI = ["🦊", "🐙", "🦉", "🐺", "🐢", "🦄", "🐝", "🦖"];
const IDIOMA = {es: {es: "español", en: "inglés", ca: "catalán"}, en: {es: "Spanish", en: "English", ca: "Catalan"}, ca: {es: "espanyol", en: "anglès", ca: "català"}};
const BLOQUEO = 3000, BLOQUEO_TABU = 2000, SALDO = 1000;

/* ---------- estado ---------- */
const E = {st: null, R: null, D: null, G: null, clave: "", msg: "", msgOk: false, err: "", busy: false, poll: null, tick: null, firma: "", off: 0, crear: {}, ui: {}, inp: {}};
const guard = {get() { try { return JSON.parse(localStorage.getItem("lyaRetos") || "{}"); } catch (e) { return {}; } }, set(v) { try { localStorage.setItem("lyaRetos", JSON.stringify(v)); } catch (e) {} }};
const mem = () => { const m = guard.get(); m.host ||= {}; m.play ||= {}; m.xp ||= {}; return m; };
const sala = () => E.st?.sala;
const lenG = () => sala()?.lang || st().S.learn;
const s1 = (k, lang, v) => { const S = STR(); let o = (S[lang] || S.en)[k] ?? S.es[k] ?? k; if (typeof o === "string") for (const x in v || {}) o = o.split(`{${x}}`).join(v[x]); return o; };
const both = () => { try { return L().both(); } catch (e) { return false; } };
const know = () => st().S.know;
const dosL = () => both() && know() !== lenG();
const T = (k, v) => { const a = s1(k, lenG(), v), b = s1(k, know(), v); return esc(a) + (dosL() && b !== a ? ` <span class="en">· ${esc(b)}</span>` : ""); };
const TB = (k, v) => { const a = s1(k, lenG(), v), b = s1(k, know(), v); return esc(a) + (dosL() && b !== a ? `<span class="en" style="display:block">${esc(b)}</span>` : ""); };
const idioma = () => IDIOMA[lenG()]?.[lenG()] || lenG();
const eqNombre = i => `${EMOJI[(i - 1) % 8]} ${s1("t_eq", lenG())[(i - 1) % 8]}`;
const ahora = () => Date.now() + E.off;
const mmss = ms => { ms = Math.max(0, ms); const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

async function api(metodo, datos, q = "") {
  let r;
  try { r = await fetch(API + q, metodo === "GET" ? {cache: "no-store"} : {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(datos)}); }
  catch (e) { return {ok: false, error: "red"}; }
  const j = await r.json().catch(() => null);
  if (!j) return {ok: false, error: r.status === 404 ? "serv" : "red"};
  return {ok: r.ok, status: r.status, ...j};
}
function recibir(s) {
  if (!s || !s.sala) return;
  if (E.st && E.st.sala.codigo === s.sala.codigo && s.ahora < E.st.ahora) return; /* respuesta de la caché más vieja que la que ya tenemos */
  E.st = s; E.off = s.ahora - Date.now();
}

/* ---------- contenido de cada juego (igual en todos los aparatos) ---------- */
function rnd(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const mezcla = (a, r) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const limpio = t => TX().plain(t);
const DATOS = {};
const cargarDatos = lang => DATOS[lang] ||= fetch(`content/${lang}/retos.json`).then(r => { if (!r.ok) throw new Error("retos"); return r.json(); });
/* lectura nueva que aún no está en retos.json: se prepara aquí, más sencillo (pruebas de q[i][3].ev y palabras del vocabulario) */
const DEFS = {};
async function datosAlVuelo(R, lang) {
  const X = TX(), P = X.parrafos(R);
  const ev = (R.q || []).map(q => (q[3] && Array.isArray(q[3].ev) ? X.evDeFrases(P, q[3].ev) : null));
  let def = {}; try { def = await (DEFS[lang] ||= fetch(`content/${lang}/definiciones.json`).then(r => r.json())); } catch (e) {}
  const kw = [];
  for (const [w] of R.vocab || []) {
    const b = X.base(w), o = [];
    P.forEach((par, p) => par.forEach((fr, s) => X.palabras(fr).forEach((t, wi) => { if (X.base(t) === b || (b.length > 4 && X.base(t).startsWith(b.slice(0, -1)))) o.push([p, s, wi]); })));
    if (!o.length) continue;
    const f = X.palabras(P[o[0][0]][o[0][1]])[o[0][2]].toLowerCase(), d = (def[f] || def[w.toLowerCase()] || [])[1] || "";
    const x = X.palabras(d).filter(t => t.length >= 4 && X.base(t).slice(0, 4) !== X.base(f).slice(0, 4)).map(t => t.toLowerCase()).filter((t, i, a) => a.indexOf(t) === i).slice(0, 3);
    kw.push({f, l: w, d, x, o});
  }
  return {s: P, ev, kw, tr: []};
}
const palabraEn = (D, p, s, w) => (TX().palabras(D.s[p]?.[s] || "")[w]) || "";

function preparar(juego, R, D, semilla) {
  const r = rnd(semilla), Q = R.q || [];
  if (juego === "prueba") {
    const qs = mezcla(Q.map((q, i) => ({q, i, ev: D.ev[i]})).filter(x => x.ev), r).slice(0, /^(B2|C)/.test(R.level) ? 7 : 5).sort((a, b) => a.i - b.i);
    const defs = mezcla(D.kw.filter(k => k.d && k.o.length), r).slice(0, 3);
    const rondas = [];
    qs.forEach((x, n) => { rondas.push({tipo: "q", txt: x.q[0], ok: x.ev.map(e => e.join("."))}); if (n % 2 === 1 && defs.length) { const k = defs.shift(); rondas.push({tipo: "d", txt: k.d, w: k.f, ok: k.o.map(o => o.join("."))}); } });
    for (const k of defs) rondas.push({tipo: "d", txt: k.d, w: k.f, ok: k.o.map(o => o.join("."))});
    return {rondas};
  }
  if (juego === "apuesta") {
    const rondas = Q.slice(0, 8).map(([preg, ops, ok], i) => {
      const ver = r() < 0.5, malas = ops.map((o, j) => j).filter(j => j !== ok), op = ver ? ok : malas[Math.floor(r() * malas.length)];
      const pregunta = /[?？]\s*$/.test(preg.trim());
      return {ver, preg: limpio(preg), resp: limpio(ops[op]), pregunta, ok: (D.ev[i] || []).map(e => e.join("."))};
    });
    return {rondas};
  }
  if (juego === "cartas") {
    const N = {A1: 6, A2: 7, B1: 8, B2: 10, C1: 10, C2: 10}[R.level] || 8, huecos = [], usadas = new Set();
    for (const k of D.kw) {
      if (huecos.length >= N) break;
      const [p, s, w] = k.o[0], f = p + "." + s;
      if (usadas.has(f) && D.kw.length - huecos.length > N) continue;
      usadas.add(f); huecos.push({p, s, w, f: palabraEn(D, p, s, w).toLowerCase()});
    }
    huecos.sort((a, b) => a.p - b.p || a.s - b.s || a.w - b.w);
    huecos.forEach((h, i) => { h.i = i; h.id = `${h.p}.${h.s}.${h.w}`; });
    const reales = new Set(huecos.map(h => TX().base(h.f)));
    const trampas = mezcla((D.tr || []).filter(w => !reales.has(TX().base(w))), r).slice(0, 2);
    const cartas = mezcla([...huecos.map(h => ({id: "g" + h.i, w: h.f, g: h.i})), ...trampas.map((w, j) => ({id: "t" + j, w, g: -1}))], r);
    return {huecos, cartas};
  }
  if (juego === "tabu") return {palabras: mezcla(D.kw.filter(k => (k.x || []).length >= 2 && k.o.length), r).slice(0, 14)};
  if (juego === "piloto") return {retos: Q.map(([preg, ops, ok]) => ({preg: limpio(preg), ops: ops.map(limpio), ok}))};
  return {};
}
async function cargarLectura() {
  const s = sala(); if (!s) return;
  const firma = s.file + s.semilla;
  if (E.G && E.G.firma === firma) return;
  const [R, todos] = await Promise.all([L().loadReading(s.file), cargarDatos(s.lang)]);
  E.R = R; E.D = todos[s.lectura] || await datosAlVuelo(R, s.lang); if (!E.D) throw new Error("sin datos");
  E.G = {...preparar(s.juego, R, E.D, s.semilla), firma};
}

/* ---------- jugadores, equipos y jugadas ---------- */
const yoId = () => mem().play[sala()?.codigo]?.id;
const yo = () => E.st?.jugadores.find(j => j.id === yoId());
const delEquipo = e => (E.st?.jugadores || []).filter(j => j.e === e);
const porEquipos = () => !!sala()?.equipos;
/* «unidades» que puntúan: equipos o, si se juega cada uno por su cuenta, jugadores */
const unidades = () => porEquipos() ? Array.from({length: sala().equipos}, (_, i) => i + 1).filter(e => delEquipo(e).length || Object.keys(E.st.ev).some(k => k.startsWith(`e${e}:`))).map(e => ({u: "e" + e, e, n: eqNombre(e), c: COLORES[(e - 1) % 8]})) : (E.st?.jugadores || []).map((j, i) => ({u: "j" + j.id, j, n: j.n, c: COLORES[i % 8]}));
const miUnidad = () => { const y = yo(); return !y ? null : porEquipos() ? "e" + y.e : "j" + y.id; };
const miembros = e => { const m = delEquipo(e), n = Math.max(1, Math.min(m.length || 1, sala().rep?.[e] || m.length || 1)); return m.slice(0, n); };
function jug(who, k) { const v = E.st?.ev?.[`${who}:${k}`]; if (v == null) return null; const i = String(v).lastIndexOf("|"); return i < 0 ? {v: String(v), ms: 0, n: +v} : {v: String(v).slice(0, i), ms: +String(v).slice(i + 1)}; }
const num = (who, k) => +(jug(who, k)?.v || 0);
const fin = () => sala().t0 + sala().dur * 60000;
const tipo = () => JUEGOS[sala().juego].tipo;
const acabado = () => sala() && (sala().fase === "fin" || (tipo() === "libre" && sala().fase === "juego" && ahora() >= fin()));
const finRonda = () => sala().tr + sala().rd * 1000;

/* ---------- puntuación ---------- */
/* Encuentra la prueba: cada jugador, por ronda {ms} si la encontró */
function pruebaRonda(r) {
  const res = {}; let rap = null;
  for (const j of E.st.jugadores) { const x = jug("j" + j.id, "r" + r); if (x) { res[j.id] = x.ms; if (!rap || x.ms < rap.ms) rap = {id: j.id, n: j.n, ms: x.ms}; } }
  return {res, rap};
}
const ptsPrueba = (ms, rap) => Math.round(500 + 500 * Math.max(0, 1 - ms / (sala().rd * 1000))) + (rap ? 200 : 0);
function rondaAbierta(r = sala().r) {
  if (sala().fase !== "juego" || r !== sala().r) return false;
  if (ahora() >= finRonda()) return false;
  return !todosListos(r);
}
function todosListos(r) {
  const us = unidades(); if (!us.length) return false;
  if (sala().juego === "prueba") { const {res} = pruebaRonda(r); return us.every(u => u.j ? res[u.j.id] != null : miembros(u.e).some(j => res[j.id] != null)); }
  return us.every(u => jug(u.u, "r" + r));
}
function marcador() {
  const s = sala(), us = unidades(), G = E.G; if (!G) return [];
  const cerradas = s.fase === "fin" ? (G.rondas || []).length : s.r + (rondaAbierta() ? 0 : 1);
  for (const u of us) { u.pts = 0; u.det = ""; }
  if (s.juego === "prueba") {
    for (let r = 0; r < cerradas; r++) {
      const {res, rap} = pruebaRonda(r);
      for (const u of us) {
        const ids = u.j ? [u.j.id] : miembros(u.e).map(j => j.id);
        u.pts += Math.max(0, ...ids.map(id => res[id] != null ? ptsPrueba(res[id], rap && rap.id === id) : 0));
      }
    }
  } else if (s.juego === "apuesta") {
    for (const u of us) { u.pts = saldo(u.u, cerradas); }
  } else if (s.juego === "cartas") {
    for (const u of us) { const c = cartasEq(u.u); u.pts = c.llenos * 100 - c.fallos * 20; u.llenos = c.llenos; u.fallos = c.fallos; u.t = c.t; u.det = `${s1("c_huecos", lenG(), {n: c.llenos, m: G.huecos.length})} · ${s1("c_fallos", lenG(), {n: c.fallos})}${c.t ? " · ⏱ " + mmss(c.t) : ""}`; }
  } else if (s.juego === "tabu") {
    for (const u of us) { const t = tabuEq(u.u); u.pts = t.ok * 100; u.det = `${s1("t_aciertos", lenG(), {n: t.ok})} · ${s1("t_turno", lenG(), {n: t.i})}`; }
  } else if (s.juego === "piloto") {
    for (const u of us) { const p = pilotoEq(u.u); u.pts = p.pts; u.det = `${s1("l_reto", lenG(), {n: Math.min(p.i + 1, G.retos.length), m: G.retos.length})}`; }
  }
  return us.sort((a, b) => b.pts - a.pts || (a.t || 9e9) - (b.t || 9e9) || a.n.localeCompare(b.n));
}
/* Atrapa los puntos: saldo de una unidad después de las rondas < hasta */
function apuestaRes(u, r) {
  const x = jug(u, "r" + r); if (!x) return null;
  const [v, b, pr] = x.v.split(":"), R0 = E.G.rondas[r], bet = Math.max(0, Math.round(+b || 0));
  const bien = (v === "1") === R0.ver, prueba = !!pr && R0.ok.includes(pr);
  return {v: v === "1", bet, pr, bien, prueba, gana: bien ? bet * (prueba ? 2 : 1) : -bet};
}
function saldo(u, hasta) { let s = SALDO; for (let r = 0; r < hasta; r++) { const a = apuestaRes(u, r); if (a) s = Math.max(0, s + a.gana); } return s; }
/* Cartas a la mesa */
function cartasEq(u) {
  const G = E.G; let llenos = 0, t = 0;
  const lleno = G.huecos.map(h => { const x = jug(u, "g" + h.i); if (x) { llenos++; t = Math.max(t, x.ms); } return !!x; });
  return {lleno, llenos, fallos: num(u, "x"), t: llenos === G.huecos.length ? t : 0, pista: jug(u, "pista")};
}
/* Palabra secreta: turnos resueltos (ok / tabu / pasa) */
function tabuEq(u) { let i = 0, ok = 0, ult = null; while (true) { const x = jug(u, "t" + i); if (!x) break; if (x.v === "ok") ok++; ult = x.v; i++; } return {i, ok, ult}; }
/* Lector y piloto */
function pilotoEq(u) {
  const G = E.G; let i = 0, pts = 0, ult = null;
  while (i < G.retos.length) { const x = jug(u, "q" + i); if (!x) break; const [o, a] = x.v.split(":"); const bien = +o === G.retos[i].ok; const p = bien ? 100 + 25 * (3 - Math.min(3, +a || 0)) : 0; pts += p; ult = {bien, p, o: +o, i}; i++; }
  return {i, pts, ult, asks: Math.min(3, num(u, "a" + i))};
}

/* ---------- texto con frases y palabras tocables ---------- */
function textoHTML(o = {}) {
  const D = E.D; if (!D) return "";
  let max = 1; if (o.calor) for (const k in o.calor) max = Math.max(max, o.calor[k]);
  return `<div class="rt-txt ${o.tap ? "tap-" + o.tap : ""}" ${o.tap ? `data-rt-tap="${o.tap}"` : ""} lang="${esc(lenG())}">` + D.s.map((par, p) => `<p>` + par.map((fr, s) => {
    const fid = p + "." + s, hf = o.calor?.[fid];
    const inner = TX().trozos(fr).map(x => {
      if (x.w < 0) return esc(x.t);
      const id = fid + "." + x.w, hu = o.hueco && o.hueco(id, x.t); if (hu != null) return hu;
      const hw = o.calor?.[id];
      return `<span class="rt-w ${o.wcls ? o.wcls(id, x.t) : ""}" data-w="${id}"${hw ? ` style="--h:${(hw / max).toFixed(2)}" data-n="${hw}"` : ""}>${esc(x.t)}</span>`;
    }).join("");
    return `<span class="rt-f ${o.fcls ? o.fcls(fid) : ""}" data-f="${fid}"${hf ? ` style="--h:${(hf / max).toFixed(2)}" data-n="${hf}"` : ""}>${inner}</span> `;
  }).join("") + `</p>`).join("") + `</div>`;
}
const calorDe = r => { const c = {}; for (const [k, v] of Object.entries(E.st?.ev || {})) { const m = k.match(/^h(\d+):(.+)$/); if (m && (r == null || +m[1] === r)) c[m[2]] = (c[m[2]] || 0) + (+v || 0); } return c; };

/* ---------- polling ---------- */
function parar() { clearInterval(E.poll); clearInterval(E.tick); E.poll = E.tick = null; }
const enRetos = () => /^reto-/.test(location.hash.slice(1));
function vigilar(codigo) {
  parar();
  const una = async () => {
    if (document.hidden || !enRetos()) return;
    const r = await api("GET", null, "&sala=" + codigo);
    if (!enRetos()) return parar();
    if (r.ok) { recibir(r); await cargarLectura().catch(() => {}); pintar(); }
    else if (r.status === 404) { E.err = "no_existe"; E.st = null; parar(); pintar(true); }
  };
  E.poll = setInterval(una, 1500);
  E.tick = setInterval(() => { if (!enRetos()) return parar(); reloj(); const f = estadoTiempo(); if (f !== E.tf) { E.tf = f; pintar(true); } }, 400);
}
/* lo que cambia solo con el tiempo (para volver a pintar cuando toca) */
function estadoTiempo() {
  const s = sala(); if (!s) return "";
  return [acabado() ? 1 : 0, s.fase === "juego" && tipo() === "rondas" ? (rondaAbierta() ? 1 : 0) : "", E.ui.hasta && E.ui.hasta > ahora() ? 1 : 0].join("");
}
function reloj() {
  const s = sala(); if (!s) return;
  let t;
  if (s.fase !== "juego") t = s.fase === "fin" ? 0 : (tipo() === "rondas" ? s.rd * 1000 : s.dur * 60000);
  else t = tipo() === "rondas" ? (rondaAbierta() ? finRonda() - ahora() : 0) : fin() - ahora();
  for (const el of document.querySelectorAll("[data-rt-reloj]")) el.textContent = mmss(t);
  for (const el of document.querySelectorAll("[data-rt-bloq]")) { const q = +el.dataset.rtBloq - ahora(); el.textContent = q > 0 ? `🔒 ${Math.ceil(q / 1000)}` : ""; }
}

/* ---------- pintar ---------- */
let APP = null, vista = "inicio", codigoRuta = null, juegoRuta = null;
function render(app) {
  APP = app;
  const h = location.hash.slice(1), mp = h.match(/^reto-pizarra-(\d{6})$/), mj = h.match(/^reto-(\d{6})$/), mi = h.match(/^reto-([a-z]+)$/);
  const nueva = mp ? "pizarra" : mj ? "jugar" : "inicio", cod = (mp || mj || [])[1] || null;
  juegoRuta = mi && JUEGOS[mi[1]] ? mi[1] : juegoRuta || "prueba";
  if (nueva !== vista || cod !== codigoRuta) { if (cod !== codigoRuta) parar(); vista = nueva; codigoRuta = cod; E.msg = ""; E.err = ""; E.firma = ""; E.ui = {}; if (!cod) { parar(); E.st = null; } else if (E.st?.sala.codigo !== cod) { E.st = null; E.G = null; } }
  try { L().setAcc?.(JUEGOS[cod && sala() ? sala().juego : juegoRuta].c); } catch (e) {}
  if (cod) { if (!E.poll) vigilar(cod); if (!E.st && !E.err) { app.innerHTML = `<section class="wrap rt"><p class="msg">${T("cargando")}</p></section>`; primera(cod); return; } }
  pintar(true);
}
async function primera(cod) {
  const r = await api("GET", null, "&sala=" + cod);
  if (r.ok && /^m-/.test(r.sala?.juego || "")) { parar(); location.replace("#mates-sala-" + cod); return; } /* sala de mates (mates/grupo.js) */
  if (r.ok) { recibir(r); try { await cargarLectura(); } catch (e) {} }
  else E.err = r.status === 404 ? "no_existe" : r.error === "serv" ? "e_serv" : "e_red";
  pintar(true);
}
function pintar(forzar) {
  if (!APP || !enRetos()) return;
  const s = sala();
  const firma = [vista, JSON.stringify(E.st && {...E.st, ahora: 0}), E.msg, E.err, estadoTiempo(), E.G ? 1 : 0, E.busy ? 1 : 0, JSON.stringify(E.ui)].join("§");
  if (!forzar && firma === E.firma) return;
  E.firma = firma;
  const act = document.activeElement, idf = act && act.id, sel = idf && act.selectionStart, y0 = scrollY;
  for (const el of APP.querySelectorAll("[data-rt-in]")) E.inp[el.id] = el.value;
  let html;
  if (vista === "inicio") html = inicioHTML();
  else if (E.err && !s) html = `<section class="wrap rt"><div class="rt-box"><p>${T(E.err)}</p><a class="btn" href="#reto-${juegoRuta}">← ${T("otro")}</a></div></section>`;
  else if (vista === "pizarra") html = pizarraHTML();
  else html = jugarHTML();
  APP.innerHTML = html;
  for (const el of APP.querySelectorAll("[data-rt-in]")) if (E.inp[el.id] !== undefined) el.value = E.inp[el.id];
  if (idf) { const el = document.getElementById(idf); if (el) { el.focus(); try { el.setSelectionRange(sel, sel); } catch (e) {} } }
  if (!forzar || E.mantener) scrollTo(0, y0);
  reloj();
}
const titulo = j => `${JUEGOS[j].ic} ${esc(s1("n_" + j, lenG()))}`;
function comoHTML(j) {
  return `<details class="rt-como" open><summary>${T("como")}</summary><ol>${s1("c_" + j, lenG()).map((x, i) => `<li>${esc(x)}${dosL() ? `<span class="en" style="display:block">${esc(s1("c_" + j, know())[i])}</span>` : ""}</li>`).join("")}</ol>
    <p class="rt-trab"><b>${T("trabaja")}:</b> ${TB("w_" + j)}</p></details>`;
}
function lecturasDe(lang, nivel) {
  const {CAT} = st();
  return CAT.topics.flatMap(t => (t.readings[lang] || []).filter(r => r.file && r.level === nivel).map(r => ({id: r.id || `${t.id}-${r.level.toLowerCase()}`, file: r.file, title: r.title[lang] || r.title.es, topic: t.name[lang] || t.name.es})));
}
function inicioHTML() {
  const j = juegoRuta, {S, CAT} = st(), cfg = JUEGOS[j];
  const c = E.crear[j] ||= {lang: CAT.courses.find(x => x.learn === S.learn && x.ready) ? S.learn : "en", nivel: S.level || "A1", lectura: "", juega: null, equipos: cfg.tipo === "rondas" ? 0 : 4, dur: j === "piloto" ? 15 : 10, rd: j === "apuesta" ? 60 : 40};
  const cursos = CAT.courses.filter(x => x.ready).map(x => x.learn);
  const lvs = CAT.levels.filter(l => lecturasDe(c.lang, l).length); if (!lvs.includes(c.nivel)) c.nivel = lvs[0] || "A1"; /* C1 only where the course has it */
  const ls = lecturasDe(c.lang, c.nivel); if (!ls.some(r => r.id === c.lectura)) c.lectura = ls[0]?.id || "";
  const mias = Object.entries(mem().host).filter(([, v]) => Date.now() - v.t < 4 * 3600e3 && v.j === j);
  const eqOps = (cfg.tipo === "rondas" ? [0] : []).concat([1, 2, 3, 4, 5, 6, 7, 8]);
  return `<section class="wrap rt" style="--c:${cfg.c}"><p class="rt-migas"><a href="#grupo">← ${T("grupo")}</a></p>
    <h1 class="rt-h">${titulo(j)}</h1>${dosL() ? `<p class="en">${esc(s1("n_" + j, know()))}</p>` : ""}
    <p class="rt-lead">${TB("d_" + j)}</p>
    <div class="rt-dos">
      <form class="rt-box" data-rt-form="ir"><h2>📱 ${T("entrar")}</h2>
        <label for="rt-cod">${T("codigo")}</label>
        <input id="rt-cod" data-rt-in class="rt-cod" inputmode="numeric" maxlength="7" autocomplete="off" placeholder="123456">
        <p class="rt-err" role="alert">${E.msg ? T(E.msg) : ""}</p>
        <button class="btn main">${T("ir")} →</button></form>
      <form class="rt-box" data-rt-form="crear"><h2>🧑‍🏫 ${T("crear")}</h2><p class="rt-small">${T("crear_p")}</p>
        <div class="rt-fila"><label>${T("curso")}<select data-rt-c="lang">${cursos.map(l => `<option value="${l}" ${l === c.lang ? "selected" : ""}>${esc(CAT.languages[l].name[lenG()] || l)}</option>`).join("")}</select></label>
        <label>${T("nivel")}<select data-rt-c="nivel">${lvs.map(l => `<option ${l === c.nivel ? "selected" : ""}>${l}</option>`).join("")}</select></label></div>
        <label>${T("lectura")}<select data-rt-c="lectura">${ls.map(r => `<option value="${esc(r.id)}" ${r.id === c.lectura ? "selected" : ""}>${esc(r.topic)} · ${esc(r.title)}</option>`).join("")}</select></label>
        <div class="rt-fila"><label>${T("equipos")}<select data-rt-c="equipos">${eqOps.map(n => `<option value="${n}" ${n === c.equipos ? "selected" : ""}>${n ? n : esc(s1("solos", lenG()))}</option>`).join("")}</select></label>
        ${cfg.tipo === "rondas" ? `<label>${T("segundos")}<select data-rt-c="rd">${[20, 30, 40, 60, 90, 120].map(n => `<option ${n === c.rd ? "selected" : ""}>${n}</option>`).join("")}</select></label>`
          : `<label>${T("minutos")}<select data-rt-c="dur">${[5, 8, 10, 15, 20, 25, 30].map(n => `<option ${n === c.dur ? "selected" : ""}>${n}</option>`).join("")}</select></label>`}</div>
        <label class="rt-check"><input type="checkbox" data-rt-c="juega" ${(c.juega ?? !esProfe()) ? "checked" : ""}> ${T("juego_yo")}</label>
        <p class="rt-err" role="alert">${E.err ? T(E.err) : ""}</p>
        <button class="btn main" ${E.busy || !c.lectura ? "disabled" : ""}>✨ ${T("crearb")}</button>
        ${mias.length ? `<p class="rt-small">${mias.map(([k]) => `<a href="#reto-pizarra-${k}">${T("pizarra")} ${k}</a>`).join(" · ")}</p>` : ""}</form>
    </div>${comoHTML(j)}</section>`;
}
function equiposHTML(sel) {
  const s = sala(); let h = "";
  for (let e = 1; e <= s.equipos; e++) {
    const js = delEquipo(e);
    h += `<button type="button" class="rt-eq ${sel === e ? "sel" : ""}" style="--c:${COLORES[(e - 1) % 8]}" data-rt="eq" data-e="${e}" aria-pressed="${sel === e}"><b>${esc(eqNombre(e))}</b><small>${js.length ? js.map(j => esc(j.n)).join(", ") : T("nadie")}</small></button>`;
  }
  return `<div class="rt-eqs">${h}</div>`;
}
function cabeza(extra = "") {
  const s = sala(), y = yo(), col = y && porEquipos() ? COLORES[(y.e - 1) % 8] : JUEGOS[s.juego].c;
  return `<div class="rt-top" style="--c:${col}"><span>${JUEGOS[s.juego].ic} ${y ? (porEquipos() ? `<b>${esc(eqNombre(y.e))}</b> · ` : "") + esc(y.n) : `#${s.codigo}`}</span>${extra}<span class="rt-reloj">⏳ <b data-rt-reloj></b></span></div>`;
}
const aviso = () => E.msg ? `<p class="rt-aviso ${E.msgOk ? "ok" : ""}" role="status">${T(E.msg, E.msgV)}</p>` : "";
function avisar(k, ok, v) { E.msg = k; E.msgOk = ok; E.msgV = v; clearTimeout(avisar.t); avisar.t = setTimeout(() => { E.msg = ""; pintar(true); }, 2600); if (!ok && navigator.vibrate) try { navigator.vibrate(150); } catch (e) {} }

const esProfe = () => { const r = window.LYACuentas?.rol; return r === "profe" || r === "admin"; };
/* quien ha creado la sala y también juega: lleva los botones de la pizarra en su móvil */
function mandoHTML() {
  const s = sala(), clave = mem().host[s.codigo]?.clave; if (!clave || s.fase === "fin" || acabado()) return "";
  let b = "";
  if (s.fase === "espera") b = `<button class="btn main" data-rt="empezar" ${E.st.jugadores.length && !E.busy ? "" : "disabled"}>${T("empezar")}</button>`;
  else if (tipo() === "rondas" && E.G) { const ultima = s.r >= E.G.rondas.length - 1; b = `<button class="btn ${rondaAbierta() ? "" : "main"}" data-rt="${ultima ? "terminar" : "siguiente"}">${ultima ? T("verres") : T("siguiente")}</button>`; }
  else b = `<button class="btn" data-rt="terminar">${T("terminar")}</button>`;
  return `<div class="rt-mando"><p class="rt-small">🧑‍🏫 ${T("anfitrion")}</p>${s.fase === "espera" ? `<p class="rt-codigo rt-codigo-s">${s.codigo.slice(0, 3)} ${s.codigo.slice(3)}</p><p class="rt-small">${T("jugadores", {n: E.st.jugadores.length})}</p>` : ""}
    <div class="rt-mando-b">${b}<a class="btn" href="#reto-pizarra-${s.codigo}">${T("ver_piz")}</a></div></div>`;
}
function jugarHTML() {
  const s = sala(), y = yo(), m = mem(), nombreG = m.nombre || (window.LYACuentas?.usuario || "");
  const tit = E.R ? limpio(E.R.title) : "";
  if (!y && s.fase === "fin") return `<section class="wrap rt"><div class="rt-box"><p>${T("e_fin")}</p><a class="btn" href="#reto-${s.juego}">← ${T("otro")}</a></div></section>`;
  if (!y || (s.fase === "espera" && E.ui.cambiar)) {
    const sel = +(E.ui.equipo || (y && y.e) || 0);
    return `<section class="wrap rt" style="--c:${JUEGOS[s.juego].c}"><h1 class="rt-h">${titulo(s.juego)} <small>#${s.codigo}</small></h1>${mandoHTML()}${tit ? `<p class="en">${esc(tit)}</p>` : ""}
      <form class="rt-box" data-rt-form="unirme"><label for="rt-nom">${T("nombre")}</label><input id="rt-nom" data-rt-in maxlength="20" autocomplete="nickname" value="${esc(nombreG)}">
      ${s.equipos ? `<p class="rt-small">${T("elige")}</p>${equiposHTML(sel)}` : ""}
      <p class="rt-err" role="alert">${E.msg ? T(E.msg) : ""}</p><button class="btn main" ${E.busy ? "disabled" : ""}>🚀 ${T("unirme")}</button></form>${comoHTML(s.juego)}</section>`;
  }
  if (s.fase === "espera") {
    return `<section class="wrap rt">${cabeza()}${mandoHTML()}<div class="rt-box rt-espera"><p class="rt-big">⏳ ${T("espera")}</p>
      ${s.equipos ? `<p>${T("tuequipo")}: <b>${esc(eqNombre(y.e))}</b> — ${delEquipo(y.e).map(j => esc(j.n)).join(", ")}</p><button class="btn" data-rt="cambiar">🔁 ${T("cambiar")}</button>` : ""}</div>${comoHTML(s.juego)}</section>`;
  }
  if (!E.G) return `<section class="wrap rt"><p class="msg">${T("cargando")}</p></section>`;
  if (acabado()) return finHTML();
  const J = {prueba: jPrueba, apuesta: jApuesta, cartas: jCartas, tabu: jTabu, piloto: jPiloto}[s.juego];
  return `<section class="wrap rt" style="--c:${JUEGOS[s.juego].c}">${J()}${mandoHTML()}</section>`;
}
function rankingHTML(rk, yoU) {
  return `<ol class="rt-rk">${rk.map((u, i) => `<li class="${u.u === yoU ? "yo" : ""}" style="--c:${u.c}"><span class="rt-pos">${i + 1}</span><b>${esc(u.n)}</b>${u.det ? `<small>${esc(u.det)}</small>` : ""}<span class="rt-pts">${esc(s1("puntos", lenG(), {n: u.pts}))}</span></li>`).join("")}</ol>`;
}
function finHTML() {
  const rk = marcador(), u = miUnidad(), pos = rk.findIndex(x => x.u === u) + 1;
  darXP(pos);
  return `<section class="wrap rt">${cabeza()}<div class="rt-box rt-fin"><p class="rt-big">${sala().fase === "fin" ? T("acabada") : T("tiempo")}</p>
    ${pos ? `<p>${T("puesto", {n: pos, m: rk.length})}</p>` : ""}<h2>🏆 ${T("resultados")}</h2>${rankingHTML(rk, u)}
    ${sala().juego === "prueba" ? `<h2>${T("p_calor_total")}</h2>${textoHTML({calor: calorDe(null)})}` : `<details><summary>${T("ver")}</summary>${textoHTML()}</details>`}
    <a class="btn" href="#reto-${sala().juego}">← ${T("otro")}</a></div></section>`;
}
function darXP(pos) {
  const m = mem(), k = sala().codigo; if (m.xp[k] || !yo()) return;
  m.xp[k] = Date.now(); for (const x in m.xp) if (Date.now() - m.xp[x] > 864e5) delete m.xp[x]; guard.set(m);
  const n = pos === 1 ? 30 : pos === 2 ? 20 : pos === 3 ? 15 : 10;
  try { dispatchEvent(new CustomEvent("lya:xp", {detail: {xp: n, src: "retos-" + sala().juego, ok: true}})); } catch (e) {}
}

/* ---------- 🔎 Encuentra la prueba ---------- */
function promptPrueba(R0, grande) {
  return R0.tipo === "q" ? `<p class="rt-small">${T("p_q")}</p><p class="rt-preg ${grande ? "xl" : ""}" lang="${esc(lenG())}">${esc(limpio(R0.txt))}</p>`
    : `<p class="rt-small">${T("p_d")}</p><p class="rt-preg ${grande ? "xl" : ""}" lang="${esc(lenG())}">«${esc(R0.txt)}»</p>`;
}
function jPrueba() {
  const s = sala(), G = E.G, r = s.r, R0 = G.rondas[r], y = yo(), abierta = rondaAbierta(), mio = jug("j" + y.id, "r" + r);
  const eqYa = porEquipos() && !mio && miembros(y.e).some(j => jug("j" + j.id, "r" + r));
  const bloq = E.ui.bloq && E.ui.bloq > ahora() ? E.ui.bloq : 0;
  const top = cabeza(`<span>${T("ronda", {n: r + 1, m: G.rondas.length})}</span>`);
  if (!R0) return top;
  const okSet = new Set(R0.ok), unidad = R0.tipo === "q" ? "f" : "w";
  if (!abierta) {
    const {res} = pruebaRonda(r);
    return `${top}${promptPrueba(R0)}<div class="rt-box rt-sol"><p class="rt-big">${mio ? "✅" : "⌛"} ${mio ? T("p_bien", {n: ptsPrueba(mio.ms, pruebaRonda(r).rap?.id === y.id)}) : T("p_sol")}</p><p class="rt-small">${T("p_mira")}</p></div>
      ${textoHTML({calor: calorDe(r), fcls: f => unidad === "f" && okSet.has(f) ? "ok" : "", wcls: w => unidad === "w" && okSet.has(w) ? "ok" : ""})}${rankingHTML(marcador(), miUnidad())}`;
  }
  const hecho = mio || eqYa;
  return `${top}${promptPrueba(R0)}${aviso()}
    ${hecho ? `<p class="rt-ok">✅ ${T("p_ya")}</p>` : bloq ? `<p class="rt-bloq" data-rt-bloq="${bloq}"></p>` : ""}
    ${textoHTML({tap: hecho || bloq ? null : unidad, fcls: f => E.ui.toco === f ? "mal" : "", wcls: w => E.ui.toco === w ? "mal" : ""})}`;
}
async function tocarPrueba(fid, wid) {
  const s = sala(), r = s.r, R0 = E.G.rondas[r], id = R0.tipo === "q" ? fid : wid;
  if (!rondaAbierta() || (E.ui.bloq && E.ui.bloq > ahora())) return;
  api("POST", {accion: "toque", sala: s.codigo, jugador: yoId(), r, d: id});
  if (R0.ok.includes(id)) { const res = await accion({accion: "jugar", jugador: yoId(), k: "r" + r, v: "ok", uno: true}); if (res.ok) { const rap = pruebaRonda(r).rap; avisar("p_bien", true, {n: ptsPrueba(res.ms, !rap || rap.id === yoId())}); } pintar(true); }
  else { E.ui.bloq = ahora() + BLOQUEO; E.ui.toco = id; avisar("p_mal", false); pintar(true); setTimeout(() => { E.ui.toco = null; pintar(true); }, BLOQUEO); }
}

/* ---------- 🎲 Atrapa los puntos ---------- */
function afirmacionHTML(R0, grande) {
  return `<p class="rt-small">${T("a_afirm")}</p><p class="rt-preg ${grande ? "xl" : ""}" lang="${esc(lenG())}">${R0.pregunta ? esc(s1("a_q", lenG(), {q: R0.preg, a: R0.resp})) : esc(R0.preg + " " + R0.resp)}</p>`;
}
function jApuesta() {
  const s = sala(), G = E.G, r = s.r, R0 = G.rondas[r], u = miUnidad(), abierta = rondaAbierta(), mia = apuestaRes(u, r), sal = saldo(u, r);
  const top = cabeza(`<span>${T("ronda", {n: r + 1, m: G.rondas.length})} · 💰 ${sal}</span>`);
  if (!R0) return top;
  const okSet = new Set(R0.ok);
  if (!abierta) {
    const res = mia ? `<p class="rt-big ${mia.bien ? "rt-okc" : "rt-malc"}">${mia.gana >= 0 ? "+" : "−"}${Math.abs(mia.gana)}</p>${mia.prueba && mia.bien ? `<p class="rt-ok">${T("a_doble")}</p>` : ""}` : `<p>${T("a_sinap")}</p>`;
    return `${top}${afirmacionHTML(R0)}<div class="rt-box rt-sol"><p class="rt-big">${T("a_era", {vf: s1(R0.ver ? "a_verd" : "a_fals", lenG())})}</p>${res}<p class="rt-small">${T("p_mira")}</p></div>
      ${textoHTML({fcls: f => okSet.has(f) ? "ok" : f === mia?.pr ? "mal" : ""})}${rankingHTML(marcador(), u)}`;
  }
  if (mia) return `${top}${afirmacionHTML(R0)}<div class="rt-box"><p class="rt-big">✅ ${T("a_hecho", {vf: s1(mia.v ? "a_verd" : "a_fals", lenG()), n: mia.bet})}</p>${mia.pr ? `<p class="rt-small">${T("a_pruebasel")}</p>` : ""}<p class="rt-small">${T("a_esperar")}</p></div>${textoHTML({fcls: f => f === mia.pr ? "sel" : ""})}`;
  const ui = E.ui, bet = Math.min(sal, ui.bet ?? Math.round(sal / 4 / 10) * 10);
  return `${top}${afirmacionHTML(R0)}${aviso()}
    <div class="rt-box rt-apuesta"><p class="rt-small">${porEquipos() ? T("habla", {idioma: idioma()}) : ""}</p>
      <div class="rt-vf"><button type="button" class="btn ${ui.vf === 1 ? "main" : ""}" data-rt="vf" data-v="1" aria-pressed="${ui.vf === 1}">${T("a_v")}</button><button type="button" class="btn ${ui.vf === 0 ? "main" : ""}" data-rt="vf" data-v="0" aria-pressed="${ui.vf === 0}">${T("a_f")}</button></div>
      <label for="rt-bet">${T("a_apuesta")} <b class="rt-betn">${bet}</b> / ${sal}</label>
      <input type="range" id="rt-bet" min="0" max="${sal}" step="${sal >= 100 ? 10 : 1}" value="${bet}" data-rt-bet>
      <p class="rt-small">${ui.pr ? `${T("a_pruebasel")} ✓` : T("a_prueba")}</p>
      <button class="btn main rt-grande" data-rt="apostar" ${ui.vf == null || E.busy ? "disabled" : ""}>🎲 ${T("a_enviar", {n: bet})}</button></div>
    <h2>${T("texto")}</h2><p class="rt-small">${T("a_quiere")}</p>${textoHTML({tap: "f", fcls: f => f === ui.pr ? "sel" : ""})}`;
}

/* ---------- 🃏 Cartas a la mesa ---------- */
function misCartas() {
  const y = yo(), ms = miembros(y.e), i = Math.max(0, ms.findIndex(j => j.id === y.id)), n = ms.length;
  return E.G.cartas.filter((c, k) => k % n === i);
}
const duenoCarta = (u, gi) => { const e = +u.slice(1), ms = miembros(e), k = E.G.cartas.findIndex(c => c.g === gi); return ms[k % ms.length]; };
function jCartas() {
  const G = E.G, y = yo(), u = miUnidad(), C = cartasEq(u), mano = misCartas().filter(c => c.g < 0 || !C.lleno[c.g]);
  const top = cabeza(`<span>🧩 ${C.llenos}/${G.huecos.length} · ❌ ${C.fallos}</span>`);
  const completo = C.llenos === G.huecos.length, sel = E.ui.carta && mano.find(c => c.id === E.ui.carta);
  const pista = C.pista ? (() => { const gi = +C.pista.v, h = G.huecos[gi], d = duenoCarta(u, gi); return `<p class="rt-pista">💡 ${T("c_pista", {n: gi + 1, l: h.f[0].toUpperCase(), q: d ? d.n : "?"})}</p>`; })() : "";
  const huecoPorId = Object.fromEntries(G.huecos.map(h => [h.id, h]));
  const texto = textoHTML({hueco: (id, t) => { const h = huecoPorId[id]; if (!h) return null; return C.lleno[h.i] ? `<span class="rt-hueco lleno">${esc(t)}</span>` : `<button type="button" class="rt-hueco ${sel ? "activo" : ""}" data-rt="hueco" data-g="${h.i}" aria-label="${h.i + 1}"><sup>${h.i + 1}</sup>${"_".repeat(Math.max(4, Math.min(9, t.length)))}</button>`; }});
  if (completo) return `${top}<div class="rt-box rt-fin"><p class="rt-big">${T("c_lleno")}</p>${mano.length ? `<p>${T("c_sobran")}</p>` : ""}</div>${texto}`;
  return `${top}${aviso()}<p class="rt-habla">${T("habla", {idioma: idioma()})}</p>
    <h2>${T("c_mano")}</h2><p class="rt-small">${sel ? T("c_sel", {w: sel.w}) : T("c_ayuda")}</p>
    <div class="rt-mano">${mano.length ? mano.map(c => `<button type="button" class="rt-carta ${E.ui.carta === c.id ? "sel" : ""}" data-rt="carta" data-c="${c.id}" aria-pressed="${E.ui.carta === c.id}" lang="${esc(lenG())}">${esc(c.w)}</button>`).join("") : `<p class="rt-small">${T("c_nada")}</p>`}</div>
    ${pista}${C.pista ? `<p class="rt-small">${T("c_usado")}</p>` : `<button type="button" class="btn" data-rt="comodin" ${E.busy ? "disabled" : ""}>${T("c_comodin")}</button>`}
    <h2>${T("c_texto")}</h2>${texto}`;
}
async function lanzarCarta(gi) {
  const c = E.G.cartas.find(x => x.id === E.ui.carta); if (!c) return;
  E.ui.carta = null;
  if (c.g === gi || (c.g >= 0 && TX().base(c.w) === TX().base(E.G.huecos[gi].f))) { const r = await accion({accion: "jugar", jugador: yoId(), k: "g" + gi, v: c.id, eq: true, uno: true}); if (r.ok) avisar("c_bien", true); }
  else { await accion({accion: "jugar", jugador: yoId(), k: "x", eq: true, suma: true}); avisar("c_mal", false); }
  pintar(true);
}

/* ---------- 🤐 Palabra secreta ---------- */
function turnoTabu(u) {
  const e = +u.slice(1), ms = miembros(e), t = tabuEq(u), P = E.G.palabras;
  return {...t, guia: ms[t.i % ms.length], w: t.i < P.length ? P[t.i] : null, n: ms.length};
}
function jTabu() {
  const y = yo(), u = miUnidad(), t = turnoTabu(u), soyGuia = t.guia && t.guia.id === y.id;
  const top = cabeza(`<span>${T("t_turno", {n: t.i + 1})} · ⭐ ${t.ok * 100}</span>`);
  const ult = t.i > 0 ? E.G.palabras[t.i - 1] : null;
  const prev = ult && E.ui.vistoT !== t.i ? `<p class="rt-pista">${t.ult === "ok" ? "✅" : t.ult === "tabu" ? "🚫" : "⏭"} ${T("t_era", {w: ult.f})}</p>` : "";
  if (!t.w) return `${top}<div class="rt-box rt-fin"><p class="rt-big">${T("t_fin")}</p></div>`;
  if (soyGuia || t.n === 1) {
    const occ = new Set(t.w.o.map(o => o.join(".")));
    return `${top}${aviso()}${prev}<div class="rt-box rt-guia"><h2>${T("t_guia")}</h2><p class="rt-small">${T("t_palabra")}</p><p class="rt-secreta" lang="${esc(lenG())}">${esc(t.w.f)}</p>
      <p class="rt-small">${T("t_prohib")}</p><p class="rt-prohib" lang="${esc(lenG())}">${t.w.x.map(x => `<span>${esc(x)}</span>`).join("")}</p>
      <p class="rt-small">${T("t_explica")}</p><button type="button" class="btn" data-rt="tabu" data-v="pasa" ${E.busy ? "disabled" : ""}>${T("t_pasar")}</button></div>
      ${t.n === 1 ? textoHTML({tap: "w", wcls: w => occ.has(w) ? "marca" : ""}) : textoHTML({wcls: w => occ.has(w) ? "marca" : ""})}`;
  }
  const bloq = E.ui.bloq && E.ui.bloq > ahora() ? E.ui.bloq : 0;
  return `${top}${aviso()}${prev}<div class="rt-box"><p class="rt-big">${T("t_busca", {n: esc(t.guia?.n || "")})}</p>
    <button type="button" class="btn rt-tabu" data-rt="tabu" data-v="tabu" ${E.busy ? "disabled" : ""}>${T("t_tabu")}</button><p class="rt-small">${T("t_tabu_p", {n: esc(t.guia?.n || "")})}</p></div>
    ${bloq ? `<p class="rt-bloq" data-rt-bloq="${bloq}"></p>` : ""}${textoHTML({tap: bloq ? null : "w", wcls: w => E.ui.toco === w ? "mal" : ""})}`;
}
async function tocarTabu(wid) {
  const u = miUnidad(), t = turnoTabu(u); if (!t.w || (E.ui.bloq && E.ui.bloq > ahora())) return;
  if (t.w.o.some(o => o.join(".") === wid)) { const r = await accion({accion: "jugar", jugador: yoId(), k: "t" + t.i, v: "ok", eq: true, uno: true}); if (r.ok && r.nuevo) avisar("t_bien", true); E.ui.vistoT = -1; }
  else { E.ui.bloq = ahora() + BLOQUEO_TABU; E.ui.toco = wid; avisar("t_mal", false); setTimeout(() => { E.ui.toco = null; pintar(true); }, BLOQUEO_TABU); }
  pintar(true);
}

/* ---------- 🧭 Lector y piloto ---------- */
function papeles(e, i) {
  const ms = miembros(e), mitad = Math.ceil(E.G.retos.length / 2), cambio = i >= mitad;
  const lect = ms.filter((j, k) => (k % 2 === 0) !== cambio), pil = ms.filter((j, k) => (k % 2 === 0) === cambio);
  return {lect, pil, cambio, mitad, solo: ms.length < 2};
}
function jPiloto() {
  const G = E.G, y = yo(), u = miUnidad(), P = pilotoEq(u), N = G.retos.length, pp = papeles(y.e, P.i);
  const soyPiloto = pp.solo || pp.pil.some(j => j.id === y.id), soyLector = pp.solo || pp.lect.some(j => j.id === y.id);
  const top = cabeza(`<span>${T("l_reto", {n: Math.min(P.i + 1, N), m: N})} · ⭐ ${P.pts}</span>`);
  const ult = P.ult && E.ui.vistoQ !== P.ult.i ? `<p class="rt-pista ${P.ult.bien ? "ok" : "mal"}">${P.ult.bien ? "✅ " + esc(s1("l_bien", lenG(), {n: P.ult.p})) : "❌ " + esc(s1("l_mal", lenG())) + " → " + esc(G.retos[P.ult.i].ops[G.retos[P.ult.i].ok])}</p>` : "";
  if (P.i >= N) return `${top}<div class="rt-box rt-fin"><p class="rt-big">${T("l_hecho")}</p></div>${ult}`;
  const eq = `<p class="rt-small">${T("l_eq", {l: pp.lect.map(j => j.n).join(", "), p: pp.pil.map(j => j.n).join(", ")})}</p>`;
  const cambio = pp.cambio && P.i === pp.mitad && E.ui.vistoC !== true ? `<p class="rt-habla">${T("l_cambio")}</p>` : "";
  const R0 = G.retos[P.i];
  const piloto = `<div class="rt-box rt-piloto"><h2>${T("l_piloto")}</h2>${pp.solo ? `<p class="rt-small">${T("l_solo")}</p>` : `<p class="rt-small">${T("l_piloto_p")}</p>`}
    <p class="rt-preg" lang="${esc(lenG())}">${esc(R0.preg)}</p>
    <div class="rt-ops">${R0.ops.map((o, k) => `<button type="button" class="btn" data-rt="resp" data-o="${k}" ${E.busy ? "disabled" : ""} lang="${esc(lenG())}">${esc(o)}</button>`).join("")}</div>
    <p class="rt-small">${T("l_preg")}: <span class="rt-asks">${[0, 1, 2].map(k => k < P.asks ? "●" : "○").join(" ")}</span></p>
    ${P.asks >= 3 ? `<p class="rt-ok">${T("l_max")}</p>` : `<button type="button" class="btn" data-rt="pregunte" ${E.busy ? "disabled" : ""}>${T("l_pregunte")}</button>`}</div>`;
  const lector = `<div class="rt-box rt-lector"><h2>${T("l_lector")}</h2>${pp.solo ? "" : `<p class="rt-small">${T("l_lector_p")}</p><p>${T("l_espera_l", {n: P.i + 1, m: N})} · ${T("l_preg")}: ${[0, 1, 2].map(k => k < P.asks ? "●" : "○").join(" ")}</p>`}</div>${textoHTML()}`;
  return `${top}${aviso()}${cambio}${ult}${eq}${soyPiloto ? piloto : ""}${soyLector ? lector : ""}`;
}

/* ---------- pizarra ---------- */
function pizarraHTML() {
  const s = sala(), clave = mem().host[s.codigo]?.clave, url = location.host || "comprendo", cfg = JUEGOS[s.juego];
  const tit = E.R ? limpio(E.R.title) : "";
  let h = `<section class="wrap rt rt-piz" style="--c:${cfg.c}"><div class="rt-top"><span>${titulo(s.juego)}${tit ? ` · <b>${esc(tit)}</b> (${esc(s.lang)})` : ""}</span>${s.fase === "juego" && tipo() === "rondas" && E.G ? `<span>${T("ronda", {n: s.r + 1, m: E.G.rondas.length})}</span>` : ""}<span class="rt-reloj">⏳ <b data-rt-reloj></b></span></div>`;
  if (s.fase === "espera") {
    h += `<div class="rt-box rt-codbox"><p>${T("entrad", {url: esc(url)})}</p><p class="rt-codigo">${s.codigo.slice(0, 3)} ${s.codigo.slice(3)}</p><p class="rt-small">${T("jugadores", {n: E.st.jugadores.length})}</p></div>`;
    h += s.equipos ? `<div class="rt-tabla">${Array.from({length: s.equipos}, (_, i) => i + 1).map(e => `<div class="rt-fila-eq" style="--c:${COLORES[(e - 1) % 8]}"><b>${esc(eqNombre(e))}</b><span class="rt-js">${jugadoresHTML(delEquipo(e), clave)}</span></div>`).join("")}</div>`
      : `<div class="rt-tabla"><div class="rt-fila-eq"><span class="rt-js">${jugadoresHTML(E.st.jugadores, clave)}</span></div></div>`;
    if (clave) h += `<div class="rt-mando-b"><button class="btn main rt-grande" data-rt="empezar" ${E.st.jugadores.length && !E.busy ? "" : "disabled"}>${T("empezar")}</button><a class="btn rt-grande" href="#reto-${s.codigo}">${T("jugar_yo")}</a></div>${E.st.jugadores.length ? "" : `<p class="rt-small">${T("sinjug")}</p>`}`;
    return h + comoHTML(s.juego) + `</section>`;
  }
  if (!E.G) return h + `<p class="msg">${T("cargando")}</p></section>`;
  const rk = marcador();
  if (s.fase === "fin" || acabado()) {
    h += `<div class="rt-box rt-fin"><p class="rt-big">${T("acabada")}</p><h2>🏆 ${T("resultados")}</h2>${rankingHTML(rk)}</div>`;
    if (s.juego === "prueba") h += `<h2>${T("p_calor_total")}</h2>${textoHTML({calor: calorDe(null)})}`;
    if (clave && s.fase !== "fin") h += `<button class="btn rt-grande" data-rt="terminar">${T("terminar")}</button>`;
    return h + `<p><a class="btn main" href="#reto-${s.juego}">${T("nueva")}</a></p></section>`;
  }
  if (tipo() === "rondas") {
    const r = s.r, R0 = E.G.rondas[r], abierta = rondaAbierta(), ultima = r >= E.G.rondas.length - 1, us = unidades();
    const listos = s.juego === "prueba" ? (() => { const {res} = pruebaRonda(r); return us.filter(u => u.j ? res[u.j.id] != null : miembros(u.e).some(j => res[j.id] != null)).length; })() : us.filter(u => jug(u.u, "r" + r)).length;
    h += `<div class="rt-box rt-ronda">${s.juego === "prueba" ? promptPrueba(R0, true) : afirmacionHTML(R0, true)}
      <p class="rt-small">${s.juego === "prueba" ? T("p_encont", {n: listos, m: us.length}) : T("a_listos", {n: listos, m: us.length})}</p></div>`;
    if (!abierta) {
      const okSet = new Set(R0.ok);
      if (s.juego === "prueba") {
        const {rap} = pruebaRonda(r), unidad = R0.tipo === "q" ? "f" : "w";
        h += `<p class="rt-big">${rap ? T("p_primero", {n: esc(rap.n)}) + ` · ${(rap.ms / 1000).toFixed(1)} s` : T("p_nadie")}</p><h2>${T("p_calor")}</h2>
          ${textoHTML({calor: calorDe(r), fcls: f => unidad === "f" && okSet.has(f) ? "ok" : "", wcls: w => unidad === "w" && okSet.has(w) ? "ok" : ""})}`;
      } else {
        h += `<p class="rt-big">${T("a_era", {vf: s1(R0.ver ? "a_verd" : "a_fals", lenG())})}</p>
          <div class="rt-tabla">${us.map(u => { const a = apuestaRes(u.u, r); return `<div class="rt-fila-eq" style="--c:${u.c}"><b>${esc(u.n)}</b><span class="rt-js">${a ? `${a.v ? "✔" : "✘"} · 🎲 ${a.bet}${a.prueba ? " · 🔎 x2" : ""}` : "—"}</span><span class="rt-pts ${a ? (a.bien ? "rt-okc" : "rt-malc") : ""}">${a ? (a.gana >= 0 ? "+" : "−") + Math.abs(a.gana) : ""}</span></div>`; }).join("")}</div>
          ${textoHTML({fcls: f => okSet.has(f) ? "ok" : ""})}`;
      }
      if (clave) h += `<button class="btn main rt-grande" data-rt="${ultima ? "terminar" : "siguiente"}">${ultima ? T("verres") : T("siguiente")}</button>`;
    } else if (clave) h += `<button class="btn rt-grande" data-rt="${ultima ? "terminar" : "siguiente"}">${ultima ? T("verres") : T("siguiente")}</button>`;
    h += `<h2>🏆 ${T("resultados")}</h2>${rankingHTML(rk)}`;
  } else {
    h += `<h2>🏆 ${T("resultados")}</h2>${rankingHTML(rk)}`;
    if (clave) h += `<button class="btn rt-grande" data-rt="terminar">${T("terminar")}</button>`;
    h += comoHTML(s.juego);
  }
  return h + `</section>`;
}
const jugadoresHTML = (js, clave) => js.length ? js.map(j => `<span class="rt-j">${esc(j.n)}${clave ? ` <button class="rt-x" data-rt="echar" data-j="${esc(j.id)}" aria-label="${esc(s1("echar", lenG()))} ${esc(j.n)}">✕</button>` : ""}</span>`).join("") : `<i>${T("nadie")}</i>`;

/* ---------- acciones ---------- */
const ERR = {no_existe: "no_existe", red: "e_red", serv: "e_serv", muchas: "e_muchas", llena: "e_llena", fase: "e_fin", nombre: "e_nombre", empezada: "e_empezada"};
async function accion(datos) {
  E.busy = true; pintar(true);
  const r = await api("POST", {sala: sala()?.codigo, ...datos});
  E.busy = false;
  if (r.estado) { recibir(r.estado); await cargarLectura().catch(() => {}); }
  else if (!r.ok) E.msg = ERR[r.error] || "";
  return r;
}
const host = async a => { const r = await accion({clave: mem().host[sala().codigo]?.clave, ...a}); if (!r.ok) E.err = ERR[r.error] || "e_red"; pintar(true); };
document.addEventListener("submit", async ev => {
  const f = ev.target.closest("[data-rt-form]"); if (!f) return; ev.preventDefault();
  const tipoF = f.dataset.rtForm;
  if (tipoF === "ir") {
    const c = (document.getElementById("rt-cod").value || "").replace(/\D/g, "");
    if (c.length !== 6) { E.msg = "e_codigo"; return pintar(true); }
    E.msg = ""; location.hash = "#reto-" + c; return;
  }
  if (tipoF === "crear") {
    const j = juegoRuta, c = E.crear[j], r0 = lecturasDe(c.lang, c.nivel).find(r => r.id === c.lectura); if (!r0) return;
    E.busy = true; E.err = ""; pintar(true);
    try { const [R, todos] = await Promise.all([L().loadReading(r0.file), cargarDatos(c.lang)]); const D0 = todos[r0.id] || await datosAlVuelo(R, c.lang), G = D0 && preparar(j, R, D0, 1); if (!G || (G.rondas || G.huecos || G.palabras || G.retos || []).length < 3) { E.busy = false; E.err = "e_datos"; return pintar(true); } } catch (e) {}
    const r = await api("POST", {accion: "crear", juego: j, lectura: r0.id, file: r0.file, lang: c.lang, equipos: c.equipos, dur: c.dur, rd: c.rd});
    E.busy = false;
    if (!r.ok) { E.err = ERR[r.error] || "e_red"; return pintar(true); }
    const m = mem(); m.host[r.sala] = {clave: r.clave, t: Date.now(), j}; for (const k in m.host) if (Date.now() - m.host[k].t > 864e5) delete m.host[k]; guard.set(m);
    recibir(r.estado); location.hash = ((c.juega ?? !esProfe()) ? "#reto-" : "#reto-pizarra-") + r.sala; return;
  }
  if (tipoF === "unirme") {
    const nombre = document.getElementById("rt-nom").value.trim(), e = sala().equipos ? +(E.ui.equipo || yo()?.e || 0) : 0;
    if (!nombre) { E.msg = "e_nombre"; return pintar(true); }
    if (sala().equipos && !e) { E.msg = "elige"; return pintar(true); }
    const m = mem(), cod = sala().codigo;
    const r = await accion({accion: "entrar", nombre, equipo: e, jugador: m.play[cod]?.id});
    if (!r.ok) { E.msg = ERR[r.error] || "e_red"; return pintar(true); }
    m.play[cod] = {id: r.jugador, t: Date.now()}; m.nombre = nombre; for (const k in m.play) if (Date.now() - m.play[k].t > 864e5) delete m.play[k]; guard.set(m);
    E.msg = ""; E.ui.cambiar = false; return pintar(true);
  }
});
document.addEventListener("change", ev => {
  const el = ev.target.closest("[data-rt-c]"); if (!el) return;
  const c = E.crear[juegoRuta]; if (!c) return;
  const k = el.dataset.rtC; c[k] = el.type === "checkbox" ? el.checked : ["equipos", "dur", "rd"].includes(k) ? +el.value : el.value; E.err = ""; pintar(true);
});
document.addEventListener("input", ev => {
  const el = ev.target;
  if (el.id === "rt-cod") el.value = el.value.replace(/[^\d ]/g, "");
  if (el.matches?.("[data-rt-bet]")) { E.ui.bet = +el.value; const b = APP.querySelector(".rt-betn"); if (b) b.textContent = el.value; const btn = APP.querySelector('[data-rt="apostar"]'); if (btn) btn.textContent = "🎲 " + s1("a_enviar", lenG(), {n: el.value}); E.firma = ""; }
});
document.addEventListener("click", async ev => {
  const w = ev.target.closest(".rt-txt[data-rt-tap] .rt-w, .rt-txt[data-rt-tap] .rt-f");
  if (w && APP?.contains(w)) {
    const box = w.closest(".rt-txt"), modo = box.dataset.rtTap, wEl = ev.target.closest(".rt-w"), fEl = ev.target.closest(".rt-f");
    const wid = wEl?.dataset.w, fid = fEl?.dataset.f, j = sala()?.juego;
    E.mantener = true;
    if (j === "prueba") await tocarPrueba(fid, wid);
    else if (j === "apuesta" && fid) { E.ui.pr = E.ui.pr === fid ? null : fid; pintar(true); }
    else if (j === "tabu" && wid) await tocarTabu(wid);
    E.mantener = false;
    return;
  }
  const b = ev.target.closest("[data-rt]"); if (!b || !APP?.contains(b)) return;
  const a = b.dataset.rt;
  E.mantener = true;
  if (a === "eq") { E.ui.equipo = +b.dataset.e; for (const x of APP.querySelectorAll(".rt-eq")) { x.classList.toggle("sel", x === b); x.setAttribute("aria-pressed", x === b); } }
  else if (a === "cambiar") { E.ui.cambiar = true; E.ui.equipo = yo()?.e; pintar(true); }
  else if (a === "empezar" || a === "terminar") await host({accion: a});
  else if (a === "siguiente") await host({accion: "ronda", r: sala().r + 1});
  else if (a === "echar") { if (b.dataset.ok) await host({accion: "echar", jugador: b.dataset.j}); else { b.dataset.ok = 1; b.textContent = s1("echar", lenG()) + "?"; b.classList.add("seguro"); } }
  else if (a === "vf") { E.ui.vf = +b.dataset.v; pintar(true); }
  else if (a === "apostar") {
    const sal = saldo(miUnidad(), sala().r), bet = Math.max(0, Math.min(sal, E.ui.bet ?? Math.round(sal / 4 / 10) * 10));
    if (E.ui.vf == null) { avisar("a_elige", false); return pintar(true); }
    const r = await accion({accion: "jugar", jugador: yoId(), k: "r" + sala().r, v: `${E.ui.vf}:${bet}:${E.ui.pr || ""}`, eq: true, uno: true});
    if (r.ok) E.ui = {}; pintar(true);
  }
  else if (a === "carta") { E.ui.carta = E.ui.carta === b.dataset.c ? null : b.dataset.c; pintar(true); }
  else if (a === "hueco") { if (E.ui.carta) await lanzarCarta(+b.dataset.g); }
  else if (a === "comodin") {
    const C = cartasEq(miUnidad()), gi = C.lleno.findIndex(x => !x);
    if (gi >= 0) await accion({accion: "jugar", jugador: yoId(), k: "pista", v: String(gi), eq: true, uno: true});
    pintar(true);
  }
  else if (a === "tabu") {
    const t = turnoTabu(miUnidad()); E.ui.vistoT = -1;
    const r = await accion({accion: "jugar", jugador: yoId(), k: "t" + t.i, v: b.dataset.v, eq: true, uno: true});
    if (r.ok && r.nuevo) avisar(b.dataset.v === "tabu" ? "t_perdido" : "t_pasado", false);
    pintar(true);
  }
  else if (a === "pregunte") { const P = pilotoEq(miUnidad()); if (P.asks < 3) await accion({accion: "jugar", jugador: yoId(), k: "a" + P.i, eq: true, suma: true}); pintar(true); }
  else if (a === "resp") {
    const P = pilotoEq(miUnidad());
    await accion({accion: "jugar", jugador: yoId(), k: "q" + P.i, v: `${b.dataset.o}:${P.asks}`, eq: true, uno: true});
    E.ui.vistoQ = null; clearTimeout(E.tq); E.tq = setTimeout(() => { E.ui.vistoQ = P.i; pintar(true); }, 4000);
    pintar(true);
  }
  E.mantener = false;
});
document.addEventListener("visibilitychange", () => { if (!document.hidden && enRetos() && E.poll && sala()) api("GET", null, "&sala=" + sala().codigo).then(async r => { if (r.ok) { recibir(r); await cargarLectura().catch(() => {}); pintar(); } }); });

const isRetos = h => /^reto-(prueba|apuesta|cartas|tabu|piloto|\d{6}|pizarra-\d{6})$/.test(h);
const nombre = j => s1("n_" + j, st().S.know);
window.LYARetos = {render, isRetos, nombre, JUEGOS, preparar, _E: E};
})();
