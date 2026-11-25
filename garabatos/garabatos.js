/* Garabatos: dibuja y adivina en grupo (sala con código, por turnos).
   A quien le toca le salen 3 palabras del nivel del curso y elige una; la dibuja y los demás escriben qué es.
   Más puntos cuanto antes se acierta; quien dibuja gana por cada acierto. API en api/dibujos.js → api/_garabatos.js.
   El dibujo no va trazo a trazo: se manda en tandas cada segundo y aquí se vuelve a pintar poco a poco, así casi no se nota.
   Rutas: #garabatos (crear o unirse) y #garabatos-<código> (enlace para unirse).
   En el aparato (localStorage «lyaGarabatos»): la sala en la que estás {cod, pid, nombre, clave?}, para volver si se recarga.
   Puntos: evento "lya:xp" (src "garabatos") al acertar y al terminar la partida. */
(() => {
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const API = "api/dibujos", KEY = "lyaGarabatos";
const STR = {
  es: {tab: "Garabatos", title: "Garabatos", tile_d: "Dibuja y adivina en grupo: una sala con código, por turnos.",
    sub: "Dibuja y adivina en grupo. Por turnos, a uno le sale una palabra del idioma que aprendes y la dibuja; los demás la escriben. Cuanto antes aciertas, más puntos.",
    create: "Crear una sala", join: "Unirse a una sala", name: "Tu nombre", code: "Código de la sala", enter: "Entrar", make: "Crear sala",
    level: "Palabras de nivel", all: "Todos los niveles", rounds: "Rondas", time: "Tiempo para dibujar", secs: "{n} s",
    own: "Usar mis propias palabras (opcional)", own_p: "Escribe al menos 3, separadas por comas: gato, cohete, pirámide…",
    back_to: "Volver a la sala {c}", wait: "Sala de espera", share: "Diles a los demás este código o pásales el enlace", copy: "Copiar enlace", copied: "¡Copiado!",
    players: "Jugadores ({n}/30)", start: "Empezar", need2: "Hace falta al menos otro jugador.", waiting_host: "Esperando a que {h} empiece la partida…",
    leave: "Salir", close: "Cerrar la sala", kick: "Echar a {n}", round: "Ronda {r} de {t}", draws: "Dibuja {n}",
    choose: "¡Te toca! Elige qué vas a dibujar", choosing: "{n} está eligiendo una palabra…", draw_this: "Dibuja: {w}",
    guess: "¿Qué es? Escríbelo…", send: "Enviar", you_draw: "Tú dibujas ✏️",
    guessed: "{n} ha acertado", joined: "{n} se ha unido", left: "{n} ya no está", you_ok: "¡Acertaste! Era «{w}»", you_tilde: "¡Bien! Pero se escribe «{w}»",
    almost: "¡Casi! Revisa una letra.", hidden: "No digas la palabra 😉", was: "La palabra era", nobody: "Nadie la ha adivinado",
    end: "¡Partida terminada!", again: "Otra partida", xp: "+{n} XP", turn_n: "Turno {n}: dibuja {d}",
    colors: "Colores", eraser: "Goma", size: "Grosor", undo: "Deshacer", clear: "Borrar todo", gone: "Esta sala ya no existe.",
    e_nombre_no_valido: "Escribe un nombre (de 2 a 16 letras).", e_nombre_usado: "Ese nombre ya está en la sala. Elige otro.", e_llena: "La sala está llena (30).",
    e_terminado: "Esa partida ya ha terminado.", e_no_existe: "No hay ninguna sala con ese código.", e_espera: "Demasiados intentos. Espera un poco.",
    e_net: "No se ha podido conectar. Mira tu conexión.", e_offline: "Para jugar en grupo hace falta la web publicada (con servidor).", pts: "{n} pts",
    you: "tú", host: "anfitrión"},
  en: {tab: "Doodles", title: "Doodles", tile_d: "Draw and guess in a group: a room with a code, taking turns.",
    sub: "Draw and guess in a group. Taking turns, one player gets a word in the language you're learning and draws it; the others type it. The sooner you guess, the more points.",
    create: "Create a room", join: "Join a room", name: "Your name", code: "Room code", enter: "Join", make: "Create room",
    level: "Word level", all: "All levels", rounds: "Rounds", time: "Time to draw", secs: "{n} s",
    own: "Use my own words (optional)", own_p: "Write at least 3, separated by commas: cat, rocket, pyramid…",
    back_to: "Back to room {c}", wait: "Waiting room", share: "Tell the others this code or send them the link", copy: "Copy link", copied: "Copied!",
    players: "Players ({n}/30)", start: "Start", need2: "You need at least one more player.", waiting_host: "Waiting for {h} to start the game…",
    leave: "Leave", close: "Close the room", kick: "Remove {n}", round: "Round {r} of {t}", draws: "{n} is drawing",
    choose: "Your turn! Choose what to draw", choosing: "{n} is choosing a word…", draw_this: "Draw: {w}",
    guess: "What is it? Type it…", send: "Send", you_draw: "You're drawing ✏️",
    guessed: "{n} guessed it", joined: "{n} joined", left: "{n} has gone", you_ok: "You got it! It was “{w}”", you_tilde: "Right! But it's spelt “{w}”",
    almost: "Almost! Check one letter.", hidden: "Don't say the word 😉", was: "The word was", nobody: "Nobody guessed it",
    end: "Game over!", again: "Play again", xp: "+{n} XP", turn_n: "Turn {n}: {d} draws",
    colors: "Colours", eraser: "Eraser", size: "Size", undo: "Undo", clear: "Clear all", gone: "This room doesn't exist any more.",
    e_nombre_no_valido: "Write a name (2 to 16 letters).", e_nombre_usado: "That name is already in the room. Choose another one.", e_llena: "The room is full (30).",
    e_terminado: "That game has already finished.", e_no_existe: "There is no room with that code.", e_espera: "Too many tries. Wait a little.",
    e_net: "Couldn't connect. Check your connection.", e_offline: "Group games need the published website (with a server).", pts: "{n} pts",
    you: "you", host: "host"},
  ca: {tab: "Gargots", title: "Gargots", tile_d: "Dibuixa i endevina en grup: una sala amb codi, per torns.",
    sub: "Dibuixa i endevina en grup. Per torns, a un li surt una paraula de la llengua que aprens i la dibuixa; els altres l'escriuen. Com més aviat l'encertes, més punts.",
    create: "Crear una sala", join: "Unir-se a una sala", name: "El teu nom", code: "Codi de la sala", enter: "Entrar", make: "Crear sala",
    level: "Paraules de nivell", all: "Tots els nivells", rounds: "Rondes", time: "Temps per dibuixar", secs: "{n} s",
    own: "Fer servir les meves paraules (opcional)", own_p: "Escriu-ne almenys 3, separades per comes: gat, coet, piràmide…",
    back_to: "Tornar a la sala {c}", wait: "Sala d'espera", share: "Digues als altres aquest codi o passa'ls l'enllaç", copy: "Copiar l'enllaç", copied: "Copiat!",
    players: "Jugadors ({n}/30)", start: "Començar", need2: "Cal almenys un altre jugador.", waiting_host: "Esperant que {h} comenci la partida…",
    leave: "Sortir", close: "Tancar la sala", kick: "Treure {n}", round: "Ronda {r} de {t}", draws: "Dibuixa {n}",
    choose: "Et toca! Tria què dibuixaràs", choosing: "{n} està triant una paraula…", draw_this: "Dibuixa: {w}",
    guess: "Què és? Escriu-ho…", send: "Enviar", you_draw: "Tu dibuixes ✏️",
    guessed: "{n} l'ha encertada", joined: "{n} s'ha unit", left: "{n} ja no hi és", you_ok: "L'has encertada! Era «{w}»", you_tilde: "Bé! Però s'escriu «{w}»",
    almost: "Gairebé! Revisa una lletra.", hidden: "No diguis la paraula 😉", was: "La paraula era", nobody: "Ningú no l'ha endevinada",
    end: "Partida acabada!", again: "Una altra partida", xp: "+{n} XP", turn_n: "Torn {n}: dibuixa {d}",
    colors: "Colors", eraser: "Goma", size: "Gruix", undo: "Desfer", clear: "Esborrar-ho tot", gone: "Aquesta sala ja no existeix.",
    e_nombre_no_valido: "Escriu un nom (de 2 a 16 lletres).", e_nombre_usado: "Aquest nom ja és a la sala. Tria'n un altre.", e_llena: "La sala és plena (30).",
    e_terminado: "Aquesta partida ja s'ha acabat.", e_no_existe: "No hi ha cap sala amb aquest codi.", e_espera: "Massa intents. Espera una mica.",
    e_net: "No s'ha pogut connectar. Mira la connexió.", e_offline: "Per jugar en grup cal la web publicada (amb servidor).", pts: "{n} pts",
    you: "tu", host: "amfitrió"}
};
const s1 = (k, lang, v) => { let o = (STR[lang] || STR.es)[k] ?? STR.es[k] ?? k; for (const x in v || {}) o = o.split(`{${x}}`).join(v[x]); return o; };
const both = () => { try { return L().both(); } catch (e) { return false; } };
const lg = () => { try { return st().S.learn; } catch (e) { return "es"; } };
const kn = () => { try { return st().S.know; } catch (e) { return "en"; } };
/* textos ya escapados: idioma que se aprende (y el que se sabe, en A1) */
const T = (k, v) => { const a = s1(k, lg(), v), b = s1(k, kn(), v); return esc(a) + (both() && b !== a ? ` · ${esc(b)}` : ""); };
const TB = (k, v) => { const a = s1(k, lg(), v), b = s1(k, kn(), v); return esc(a) + (both() && b !== a ? `<span class="en" style="display:block">${esc(b)}</span>` : ""); };
const t1 = (k, v) => s1(k, lg(), v);
const xp = d => { try { dispatchEvent(new CustomEvent("lya:xp", {detail: {src: "garabatos", ...d}})); } catch (e) {} };
const leerSes = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } };
const guardarSes = v => { try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY); } catch (e) {} };
const $ = s => document.querySelector(s);

/* ---------- lienzo ---------- */
const COLS = ["#1d1420", "#ffffff", "#e23b3b", "#f29d1b", "#f2d21b", "#2fa84f", "#2b7fe0", "#8a4fd6", "#8b5a2b", "#ff8fc0", "#8e8e8e", "#14b8c4"];
const SIZES = [6, 14, 28, 56], N = 1000;
function pintaSeg(x, s, desde = 0, hasta = Infinity) {
  /* s = [color, grosor, sigue, x, y, x, y…] · desde/hasta: índices de punto (para pintar poco a poco) */
  const n = (s.length - 3) / 2, h = Math.min(n, hasta);
  x.strokeStyle = x.fillStyle = COLS[s[0]] || COLS[0]; x.lineWidth = SIZES[s[1]] || SIZES[1]; x.lineCap = x.lineJoin = "round";
  if (n === 1 && !s[2]) { if (desde === 0) { x.beginPath(); x.arc(s[3], s[4], x.lineWidth / 2, 0, 7); x.fill(); } return; }
  const a = Math.max(0, desde - 1); if (h - a < 2) return;
  x.beginPath(); x.moveTo(s[3 + a * 2], s[4 + a * 2]);
  for (let i = a + 1; i < h; i++) x.lineTo(s[3 + i * 2], s[4 + i * 2]);
  x.stroke();
}
function limpiaLienzo(x) { x.fillStyle = "#fff"; x.fillRect(0, 0, N, N); }
function redibuja() {
  const cv = $("#gbcv"); if (!cv) return; const x = cv.getContext("2d");
  limpiaLienzo(x); for (const s of G.trz) pintaSeg(x, s);
  G.cola = [];
}
/* deshacer: quita el último trazo entero (con sus trozos «sigue») */
const deshacer = trz => { while (trz.length) { const s = trz.pop(); if (!s[2]) break; } };
/* lo que llega del servidor se pinta poco a poco (≈ 0,9 s) para que no salte de golpe */
let raf = 0;
function anima() {
  raf = 0;
  const cv = $("#gbcv"); if (!cv || !G || !G.cola.length) { if (G) G.cola = []; return; }
  const x = cv.getContext("2d");
  const quedan = G.cola.reduce((t, c) => t + (c.s.length - 3) / 2 - c.i, 0);
  let n = Math.max(2, Math.ceil(quedan / 50));
  while (n > 0 && G.cola.length) {
    const c = G.cola[0], tot = (c.s.length - 3) / 2, h = Math.min(tot, c.i + n);
    pintaSeg(x, c.s, c.i, h); n -= h - c.i; c.i = h;
    if (c.i >= tot) G.cola.shift();
  }
  if (G.cola.length) raf = requestAnimationFrame(anima);
}
const encola = s => { G.cola.push({s, i: 0}); if (!raf) raf = requestAnimationFrame(anima); };

/* quien dibuja: los puntos se guardan y cada segundo se manda una tanda */
function preparaLienzo() {
  const cv = $("#gbcv"); if (!cv) return;
  const x = cv.getContext("2d"); redibuja();
  const pt = e => { const r = cv.getBoundingClientRect(); return [Math.max(0, Math.min(N, Math.round((e.clientX - r.left) * N / r.width))), Math.max(0, Math.min(N, Math.round((e.clientY - r.top) * N / r.height)))]; };
  cv.addEventListener("pointerdown", e => {
    if (!puedoDibujar()) return;
    e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    const p = pt(e); G.cur = {c: G.col, w: G.size, sigue: 0, pts: [p]};
    pintaSeg(x, [G.col, G.size, 0, ...p]);
  });
  cv.addEventListener("pointermove", e => {
    const c = G.cur; if (!c) return;
    const p = pt(e), l = c.pts[c.pts.length - 1];
    if (Math.hypot(p[0] - l[0], p[1] - l[1]) < 4) return;
    c.pts.push(p); pintaSeg(x, [c.c, c.w, 1, ...l, ...p]);
    if (c.pts.length >= 590) cierraTrozo(true);
  });
  const fin = () => { if (G.cur) { cierraTrozo(false); G.cur = null; } };
  cv.addEventListener("pointerup", fin); cv.addEventListener("pointercancel", fin); cv.addEventListener("lostpointercapture", fin);
}
/* pasa el trozo que se está dibujando a la tanda; si sigue dibujando, el siguiente trozo empieza en el último punto */
function cierraTrozo(sigue) {
  const c = G.cur; if (!c) return;
  if (c.pts.length > (c.sigue ? 1 : 0)) {
    const s = [c.c, c.w, c.sigue, ...c.pts.flat()];
    G.trz.push(s); G.buf.push(s);
  }
  if (sigue) { c.pts = [c.pts[c.pts.length - 1]]; c.sigue = 1; }
}
const puedoDibujar = () => G && G.S && G.S.fase === "dibujar" && G.S.dib === G.nombre && G.yo && G.yo.turno === G.S.turno;
async function mandaTanda() {
  if (!G || G.enviando) return;
  if (G.cur && puedoDibujar()) cierraTrozo(true);
  if (!G.buf.length || !puedoDibujar()) { if (!puedoDibujar()) G.buf = []; return; }
  const ev = G.buf.splice(0, 80); G.enviando = true;
  try { await api({accion: "g-trazos", codigo: G.cod, pid: G.pid, turno: G.S.turno, ev}); } catch (e) {}
  G.enviando = false;
}

/* ---------- servidor ---------- */
async function api(b) {
  const r = await fetch(API, {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify(b)});
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error || "net"); e.code = j.error || (r.status === 404 ? "offline" : "net"); throw e; }
  return j;
}
const errTxt = e => { const k = "e_" + (e && e.code || "net"); return STR.es[k] ? T(k) : T("e_net"); };

/* ---------- estado de la partida en este aparato ---------- */
let G = null, pollT = 0, relojT = 0, tandaT = 0;
function nuevaPartida(ses) {
  G = {...ses, S: null, desde: "", turno: 0, trz: [], cola: [], buf: [], chat: [], ac: new Set(), extra: [], yo: null, off: [], col: 0, size: 1,
    cur: null, enviando: false, borrador: "", aviso: null, pantalla: "", premio: {}, puesto: false, alcanzar: false};
}
const ahora = () => Date.now() + (G && G.off.length ? Math.max(...G.off) : 0);
function para() { clearTimeout(pollT); pollT = 0; clearInterval(relojT); relojT = 0; clearInterval(tandaT); tandaT = 0; }
function salir(cerrar) {
  if (G && cerrar && G.clave) api({accion: "g-cerrar", codigo: G.cod, clave: G.clave}).catch(() => {});
  para(); guardarSes(null); G = null;
  if (location.hash !== "#garabatos") location.hash = "#garabatos"; else render();
}
async function sondea() {
  pollT = 0;
  if (!G || !is(location.hash)) { para(); return; }
  try {
    const r = await fetch(`${API}?sala=${G.cod}&desde=${encodeURIComponent(G.desde)}`);
    if (r.status === 404) { para(); guardarSes(null); const c = G.cod; G = null; pantallaInicio($("#app"), T("gone"), c); return; }
    const S = await r.json();
    if (S && S.ok) aplica(S);
  } catch (e) {}
  if (!G) return;
  const f = G.S && G.S.fase, oculto = document.hidden;
  const ms = oculto ? 5000 : f === "espera" ? 2500 : f === "fin" ? 2500 : f === "dibujar" ? (G.S.dib === G.nombre ? 1500 : 1000) : 1200;
  pollT = setTimeout(sondea, ms);
}
function aplica(S) {
  const viejo = G.S;
  if (viejo && S.v < viejo.v && S.turno <= viejo.turno) S = {...viejo, ev: S.ev, desde: S.desde, evDesde: S.evDesde}; /* respuesta vieja de la caché */
  G.off.push(S.ahora - Date.now()); if (G.off.length > 8) G.off.shift();
  if (S.turno !== G.turno && S.fase !== "espera") nuevoTurno(S);
  G.S = S;
  if (S.desde) {
    const [t, n] = S.desde.split(".").map(Number);
    if (t === G.turno) {
      const ya = +(G.desde.split(".")[0]) === t ? +(G.desde.split(".")[1]) || 0 : 0;
      const ev = (S.ev || []).slice(Math.max(0, ya - (S.evDesde || 0)));
      sucesos(ev, S);
      if (n >= ya) G.desde = S.desde;
      if ((S.ev || []).length < 300) G.alcanzar = false;
    }
  }
  /* quien dibuja pide sus palabras (al empezar el turno o si se eligió sola) */
  if (S.dib === G.nombre && (S.fase === "elegir" || S.fase === "dibujar") && (!G.yo || G.yo.turno !== S.turno || (S.fase === "dibujar" && !G.yo.palabra)) && !G.pidiendo) {
    G.pidiendo = true;
    api({accion: "g-yo", codigo: G.cod, pid: G.pid}).then(y => { if (G && y.dibujas) { G.yo = y; pinta(); } }).catch(() => {}).finally(() => { if (G) G.pidiendo = false; });
  }
  if (S.fase === "fin" && !G.premio[S.turno] && (leerSes() || {}).premio !== S.turno) {
    G.premio[S.turno] = true; const ses = leerSes(); if (ses && ses.cod === G.cod) guardarSes({...ses, premio: S.turno});
    const yo = (S.ranking || []).find(r => r.n === G.nombre);
    if (yo && yo.pts > 0) { const n = Math.min(40, 10 + Math.round(yo.pts / 100)); G.xpFin = n; xp({xp: n, src: "garabatos-fin"}); }
  }
  pinta();
}
function nuevoTurno(S) {
  G.turno = S.turno; G.desde = ""; G.trz = []; G.cola = []; G.buf = []; G.cur = null; G.ac = new Set(); G.aviso = null;
  G.alcanzar = true; /* lo que ya hubiera dibujado este turno (si se recarga la página) */
  if (G.yo && G.yo.turno !== S.turno) G.yo = null;
  charla({s: t1("turn_n", {n: S.turno, d: S.dib})});
  redibuja();
}
function charla(l) { G.chat.push(l); if (G.chat.length > 80) G.chat.splice(0, G.chat.length - 80); }
function sucesos(ev, S) {
  const dibujo = S.dib === G.nombre;
  for (const e of ev) {
    if (e.d) {
      if (dibujo && !G.alcanzar) continue; /* lo mío ya está pintado */
      for (const t of e.d) {
        if (t === "c") { G.trz = []; redibuja(); }
        else if (t === "u") { deshacer(G.trz); redibuja(); }
        else if (Array.isArray(t)) { G.trz.push(t); encola(t); }
      }
    } else if (e.m) charla({n: e.m[0], t: e.m[1]});
    else if (e.ok) { G.ac.add(e.ok); charla({s: t1("guessed", {n: e.ok}), ok: 1}); }
    else if (e.j) { if (!G.extra.includes(e.j)) G.extra.push(e.j); charla({s: t1("joined", {n: e.j})}); }
    else if (e.x) charla({s: t1("left", {n: e.x})});
  }
}

/* ---------- pantallas ---------- */
const is = h => /^#?garabatos(-\d{6})?$/.test(h ?? location.hash);
function room() {
  return `<section class="gbroom"><a class="gtile gbtile" href="#garabatos"><span class="gi" aria-hidden="true">✏️</span>
    <span class="gn">${T("title")}</span><span class="gd">${TB("tile_d")}</span><span class="btn main gp">${T("create")} · ${T("join")}</span></a></section>`;
}
function render(el) {
  el = el || $("#app");
  const m = location.hash.match(/^#garabatos-(\d{6})$/), ses = leerSes();
  if (G && (!m || m[1] === G.cod)) return arranca(el);
  if (ses && ses.cod && (!m || m[1] === ses.cod) && ses.pid) { nuevaPartida(ses); return arranca(el); }
  para(); G = null;
  pantallaInicio(el, "", m ? m[1] : "");
}
function arranca(el) {
  G.pantalla = ""; pinta(el);
  if (!pollT) sondea();
  if (!relojT) relojT = setInterval(reloj, 250);
  if (!tandaT) tandaT = setInterval(mandaTanda, 1000);
}
function nombreDef() { const s = leerSes(); return (s && s.nombre) || (window.LYACuentas && LYACuentas.usuario) || ""; }
function pantallaInicio(el, msg, cod) {
  el = el || $("#app"); const {S} = st(), ses = leerSes();
  const niv = ["A1", "A2", "B1"].includes(S.level) ? S.level : "A1";
  el.innerHTML = `<section class="intro gintro"><div class="in"><h1>✏️ ${esc(t1("title"))}</h1>${both() && s1("title", kn()) !== t1("title") ? `<p class="en">${esc(s1("title", kn()))}</p>` : ""}
    <p class="lead">${TB("sub")}</p></div></section>
    <div class="wrap gb">
    ${msg ? `<p class="gbmsg" role="alert">${msg}</p>` : ""}
    ${ses && ses.cod && ses.cod !== cod ? `<p><button class="btn main" data-gb="volver">${T("back_to", {c: ses.cod})}</button></p>` : ""}
    <div class="gbcols">
      <form class="gbbox" data-gbf="entrar"><h2>${T("join")}</h2>
        <label>${T("code")}<input name="codigo" inputmode="numeric" autocomplete="off" maxlength="7" pattern="[0-9 ]*" value="${esc(cod)}" required></label>
        <label>${T("name")}<input name="nombre" maxlength="16" autocomplete="nickname" value="${esc(nombreDef())}" required></label>
        <button class="btn main">${T("enter")}</button><p class="gberr" aria-live="polite"></p></form>
      <form class="gbbox" data-gbf="crear"><h2>${T("create")}</h2>
        <label>${T("name")}<input name="nombre" maxlength="16" autocomplete="nickname" value="${esc(nombreDef())}" required></label>
        <label>${T("level")}<select name="nivel">${["A1", "A2", "B1"].map(l => `<option${l === niv ? " selected" : ""}>${l}</option>`).join("")}<option value="todas">${T("all")}</option></select></label>
        <div class="gbrow"><label>${T("rounds")}<select name="rondas">${[1, 2, 3].map(n => `<option${n === 2 ? " selected" : ""}>${n}</option>`).join("")}</select></label>
          <label>${T("time")}<select name="tiempo">${[60, 80, 100, 120].map(n => `<option value="${n}"${n === 80 ? " selected" : ""}>${esc(t1("secs", {n}))}</option>`).join("")}</select></label></div>
        <details><summary>${T("own")}</summary><textarea name="propias" rows="3" maxlength="3000" placeholder="${esc(t1("own_p"))}"></textarea></details>
        <button class="btn main">${T("make")}</button><p class="gberr" aria-live="polite"></p></form>
    </div></div>`;
  if (cod) el.querySelector('[data-gbf="entrar"] [name="nombre"]').focus();
}
const fmt = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : String(s); };
function reloj() {
  if (!G || !G.S || !is(location.hash)) return;
  const el = $("#gbt"); if (!el) return;
  const S = G.S, q = S.fin ? S.fin - ahora() : 0;
  el.textContent = S.fin && S.fase !== "fin" && S.fase !== "espera" ? fmt(q) : "";
  el.classList.toggle("poco", S.fase === "dibujar" && q < 10000);
  const b = $("#gbbar"); if (b && S.fase === "dibujar") b.style.width = Math.max(0, Math.min(100, q / (S.T * 10))) + "%";
}
/* jugadores de la partida: ranking (al día en cada turno) + los que han entrado después */
function lista() {
  const r = [...(G.S.ranking || [])];
  for (const n of G.extra) if (!r.some(x => x.n === n)) r.push({n, pts: 0});
  return r;
}
function pinta(el) {
  el = el || $("#app"); if (!G || !el || !is(location.hash)) return;
  const S = G.S;
  if (!S) { if (!el.querySelector(".gb")) el.innerHTML = `<div class="wrap gb"><p class="msg">…</p></div>`; return; }
  const p = S.fase === "espera" ? "espera" : S.fase === "fin" ? "fin" : "juego";
  if (p !== G.pantalla || !el.querySelector(".gb-" + p)) {
    G.pantalla = p;
    if (p === "espera") el.innerHTML = `<div class="wrap gb gb-espera"></div>`;
    else if (p === "fin") el.innerHTML = `<div class="wrap gb gb-fin"></div>`;
    else { el.innerHTML = juegoHTML(); preparaLienzo(); }
  }
  if (p === "espera") return pintaEspera(el.querySelector(".gb-espera"));
  if (p === "fin") return pintaFin(el.querySelector(".gb-fin"));
  pintaJuego();
}
function pintaEspera(box) {
  const S = G.S, js = S.jugadores || [], host = !!G.clave, link = `${location.origin}${location.pathname}#garabatos-${G.cod}`;
  box.innerHTML = `<div class="ghead"><div><h1>✏️ ${esc(t1("title"))}</h1><p class="en">${T("wait")}</p></div>
      <button class="btn" data-gb="salir">${T("leave")}</button></div>
    <div class="gbcode"><p>${T("share")}</p><b aria-label="${esc(t1("code"))}">${G.cod.slice(0, 3)} ${G.cod.slice(3)}</b>
      <p class="gblink"><code>${esc(link)}</code> <button class="btn" data-gb="copiar">${T("copy")}</button></p></div>
    <h2>${T("players", {n: js.length})}</h2>
    <ul class="gbchips">${js.map(n => `<li>${esc(n)}${n === G.nombre ? ` <small>(${T("you")})</small>` : ""}${n === S.host ? " 👑" : ""}${host && n !== G.nombre ? ` <button class="gbx" data-gbk="${esc(n)}" aria-label="${esc(t1("kick", {n}))}" title="${esc(t1("kick", {n}))}">×</button>` : ""}</li>`).join("")}</ul>
    ${host ? `<p><button class="btn main gbgo" data-gb="empezar"${js.length < 2 ? " disabled" : ""}>▶ ${T("start")}</button></p>${js.length < 2 ? `<p class="small">${T("need2")}</p>` : ""}
      <p><button class="btn" data-gb="cerrar">${T("close")}</button></p>`
      : `<p class="gbwait">${T("waiting_host", {h: S.host})}</p>`}
    <p class="small">${esc(S.lang.toUpperCase())} · ${esc(S.nivel === "todas" ? t1("all") : S.nivel)} · ${T("rounds")}: ${S.rondas} · ${esc(t1("secs", {n: S.T}))}</p>`;
}
function pintaFin(box) {
  const S = G.S, r = S.ranking || [], host = !!G.clave, med = ["🥇", "🥈", "🥉"];
  box.innerHTML = `<div class="ghead"><div><h1>🏁 ${T("end")}</h1></div><button class="btn" data-gb="salir">${T("leave")}</button></div>
    ${S.palabra ? `<p class="gbwas">${T("was")}: <b>${esc(S.palabra.w)}</b>${S.palabra.tr ? ` <span class="en">(${esc(S.palabra.tr)})</span>` : ""}</p>` : ""}
    <ol class="gbpod">${r.map((x, i) => `<li class="${x.n === G.nombre ? "yo" : ""}"><span class="gbm">${med[i] || i + 1}</span><span class="gbn">${esc(x.n)}</span><b>${esc(t1("pts", {n: x.pts}))}</b></li>`).join("")}</ol>
    ${G.xpFin ? `<p class="gbxp">${T("xp", {n: G.xpFin})}</p>` : ""}
    <p class="gbacts">${host ? `<button class="btn main" data-gb="otra">↻ ${T("again")}</button> <button class="btn" data-gb="cerrar">${T("close")}</button>` : ""}</p>`;
}
function juegoHTML() {
  return `<div class="wrap wide gb gb-juego">
    <div class="gbtop"><span id="gbr" class="gbr"></span><span id="gbw" class="gbw" aria-live="polite"></span><span id="gbt" class="gbt" role="timer"></span></div>
    <div class="gbbarw"><i id="gbbar"></i></div>
    <div class="gbgame">
      <div class="gbleft"><div class="gbcvw"><canvas id="gbcv" width="${N}" height="${N}" aria-label="${esc(t1("title"))}"></canvas><div id="gbov" class="gbov" hidden></div></div>
        <div id="gbtools" class="gbtools" hidden>
          <div class="gbcols2" role="group" aria-label="${esc(t1("colors"))}">${COLS.map((c, i) => `<button type="button" class="gbcol${i === 1 ? " gber" : ""}" data-gbc="${i}" style="--c:${c}" aria-label="${i === 1 ? esc(t1("eraser")) : c}" title="${i === 1 ? esc(t1("eraser")) : ""}">${i === 1 ? "🧽" : ""}</button>`).join("")}</div>
          <div class="gbsz" role="group" aria-label="${esc(t1("size"))}">${SIZES.map((s, i) => `<button type="button" data-gbs="${i}" aria-label="${esc(t1("size"))} ${i + 1}"><i style="width:${Math.max(4, s / 2.4)}px;height:${Math.max(4, s / 2.4)}px"></i></button>`).join("")}
            <button type="button" class="btn" data-gb="deshacer">↶ ${T("undo")}</button><button type="button" class="btn" data-gb="borrar">🗑 ${T("clear")}</button></div>
        </div></div>
      <div class="gbright"><ul id="gbjs" class="gbjs"></ul>
        <div id="gbchat" class="gbchat" aria-live="polite"></div>
        <form class="gbform" data-gbf="adivinar"><input id="gbin" name="texto" maxlength="40" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(t1("guess"))}" aria-label="${esc(t1("guess"))}"><button class="btn main">${T("send")}</button></form>
        <p id="gbav" class="gbav" aria-live="polite"></p>
        <p class="gbacts"><button class="btn" data-gb="salir">${T("leave")}</button></p></div>
    </div></div>`;
}
function pintaJuego() {
  const S = G.S, yoDibujo = S.dib === G.nombre;
  $("#gbr").textContent = t1("round", {r: S.ronda, t: S.rondas});
  const w = $("#gbw");
  if (S.fase === "dibujar") {
    if (yoDibujo && G.yo && G.yo.palabra) w.innerHTML = `${esc(t1("draw_this", {w: G.yo.palabra.w}))}${G.yo.palabra.tr ? ` <span class="en">(${esc(G.yo.palabra.tr)})</span>` : ""}`;
    else w.innerHTML = `<span class="gbpista" aria-label="${esc(S.pista.replace(/_/g, "?"))}">${[...S.pista].map(c => `<i>${c === " " ? "&nbsp;" : esc(c)}</i>`).join("")}</span> <small>${[...S.pista].filter(c => /[^\s\-'·]/.test(c)).length}</small>`;
  } else w.textContent = t1("draws", {n: S.dib || ""});
  $("#gbtools").hidden = !(yoDibujo && S.fase === "dibujar");
  document.querySelectorAll("[data-gbc]").forEach(b => b.classList.toggle("on", +b.dataset.gbc === G.col));
  document.querySelectorAll("[data-gbs]").forEach(b => b.classList.toggle("on", +b.dataset.gbs === G.size));
  $("#gbcv").classList.toggle("puede", yoDibujo && S.fase === "dibujar");
  const ov = $("#gbov");
  if (S.fase === "elegir") {
    ov.hidden = false;
    ov.innerHTML = yoDibujo && G.yo && G.yo.ops ? `<h2>${T("choose")}</h2><div class="gbops">${G.yo.ops.map((o, i) => `<button class="btn main" data-gbo="${i}">${esc(o.w)}${o.tr ? `<small>${esc(o.tr)}</small>` : ""}</button>`).join("")}</div>`
      : `<p class="gbbig">${T("choosing", {n: S.dib})}</p>`;
  } else if (S.fase === "resultado") {
    ov.hidden = false;
    const d = Object.entries(S.delta || {}).sort((a, b) => b[1] - a[1]);
    ov.innerHTML = `<p>${T("was")}</p><p class="gbbig"><b>${esc(S.palabra?.w || "")}</b>${S.palabra?.tr ? ` <span class="en">(${esc(S.palabra.tr)})</span>` : ""}</p>
      ${d.length ? `<ul class="gbdel">${d.map(([n, x]) => `<li>${esc(n)} <b>+${x}</b></li>`).join("")}</ul>` : `<p>${T("nobody")}</p>`}`;
  } else ov.hidden = true;
  /* jugadores */
  $("#gbjs").innerHTML = lista().map(j => `<li class="${j.n === G.nombre ? "yo" : ""}${G.ac.has(j.n) ? " ok" : ""}"><span>${j.n === S.dib ? "✏️ " : G.ac.has(j.n) ? "✓ " : ""}${esc(j.n)}</span><b>${j.pts}</b>${G.clave && j.n !== G.nombre ? `<button class="gbx" data-gbk="${esc(j.n)}" aria-label="${esc(t1("kick", {n: j.n}))}" title="${esc(t1("kick", {n: j.n}))}">×</button>` : ""}</li>`).join("");
  /* charla */
  const ch = $("#gbchat"), abajo = ch.scrollHeight - ch.scrollTop - ch.clientHeight < 40;
  ch.innerHTML = G.chat.map(l => l.s ? `<p class="sis${l.ok ? " ok" : ""}">${esc(l.s)}</p>` : `<p><b>${esc(l.n)}:</b> ${esc(l.t)}</p>`).join("");
  if (abajo) ch.scrollTop = ch.scrollHeight;
  const inp = $("#gbin"), yaOk = G.ac.has(G.nombre);
  inp.placeholder = yoDibujo ? t1("you_draw") : t1("guess");
  if (inp.value !== G.borrador && document.activeElement !== inp) inp.value = G.borrador;
  const av = $("#gbav");
  av.innerHTML = G.aviso && G.aviso.turno === S.turno ? G.aviso.html : "";
  inp.disabled = yaOk && S.fase === "dibujar" && !yoDibujo;
  av.className = "gbav" + (G.aviso && G.aviso.turno === S.turno ? " " + G.aviso.k : "");
  reloj();
}

/* ---------- acciones ---------- */
async function entrar(f, crear) {
  const err = f.querySelector(".gberr"), btn = f.querySelector("button.main"); err.textContent = ""; btn.disabled = true;
  const d = Object.fromEntries(new FormData(f));
  try {
    let r, ses;
    if (crear) {
      r = await api({accion: "g-crear", nombre: d.nombre, lang: lg(), nivel: d.nivel, rondas: +d.rondas, tiempo: +d.tiempo, propias: d.propias || ""});
      ses = {cod: r.codigo, pid: r.pid, nombre: r.nombre, clave: r.clave};
    } else {
      const cod = String(d.codigo || "").replace(/\D/g, ""), vieja = leerSes();
      r = await api({accion: "g-entrar", codigo: cod, nombre: d.nombre, pid: vieja && vieja.cod === cod ? vieja.pid : ""});
      ses = {cod, pid: r.pid, nombre: r.nombre, clave: vieja && vieja.cod === cod && vieja.nombre === r.nombre ? vieja.clave : undefined};
    }
    guardarSes(ses); para(); nuevaPartida(ses);
    if (location.hash !== "#garabatos-" + ses.cod) location.hash = "#garabatos-" + ses.cod; else arranca($("#app"));
  } catch (e) { err.innerHTML = errTxt(e); btn.disabled = false; }
}
async function adivinar(f) {
  const inp = f.querySelector("input"), texto = inp.value.trim(); if (!texto || !G) return;
  if (G.ultimo && Date.now() - G.ultimo < 700) return; G.ultimo = Date.now();
  inp.value = ""; G.borrador = "";
  const S = G.S;
  try {
    const r = await api({accion: "g-adivinar", codigo: G.cod, pid: G.pid, texto});
    if (!G) return;
    if (r.ok && !r.repetida) {
      G.ac.add(G.nombre);
      G.aviso = {turno: S.turno, k: "ok", html: esc(r.tilde ? t1("you_tilde", {w: r.palabra}) : t1("you_ok", {w: r.palabra}))};
      xp({xp: 5, ok: true});
    } else if (r.casi) G.aviso = {turno: S.turno, k: "casi", html: T("almost")};
    else if (r.oculto) G.aviso = {turno: S.turno, k: "casi", html: T("hidden")};
    pinta(); /* los intentos que fallan llegan a la charla con el siguiente sondeo, para todos igual */
  } catch (e) {}
  inp.focus();
}
document.addEventListener("submit", e => {
  const f = e.target.closest("[data-gbf]"); if (!f) return; e.preventDefault();
  const k = f.dataset.gbf;
  if (k === "crear" || k === "entrar") entrar(f, k === "crear");
  else if (k === "adivinar") adivinar(f);
});
document.addEventListener("input", e => { if (e.target.id === "gbin" && G) G.borrador = e.target.value; });
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-gb],[data-gbc],[data-gbs],[data-gbo],[data-gbk]"); if (!b || !b.closest(".gb")) return;
  if (b.dataset.gbc != null) { G.col = +b.dataset.gbc; if (G.col === 1 && G.size < 2) G.size = 2; return pintaJuego(); }
  if (b.dataset.gbs != null) { G.size = +b.dataset.gbs; return pintaJuego(); }
  if (b.dataset.gbo != null) {
    b.disabled = true;
    try { const r = await api({accion: "g-elegir", codigo: G.cod, pid: G.pid, i: +b.dataset.gbo}); G.yo = {dibujas: true, turno: r.turno, palabra: r.palabra};
      G.S = {...G.S, fase: "dibujar", fin: r.fin, pista: r.palabra.w.replace(/[^\s\-'·]/g, "_"), v: G.S.v + 0.5}; G.off.push(r.ahora - Date.now()); pinta(); } catch (er) {}
    return;
  }
  if (b.dataset.gbk != null) { if (G && G.clave) { b.disabled = true; api({accion: "g-echar", codigo: G.cod, clave: G.clave, nombre: b.dataset.gbk}).catch(() => {}); } return; }
  const a = b.dataset.gb;
  if (a === "volver") { const s = leerSes(); if (s) location.hash = "#garabatos-" + s.cod; }
  else if (a === "salir") salir(false);
  else if (a === "cerrar") salir(true);
  else if (a === "copiar") { const c = b.parentElement.querySelector("code").textContent; try { await navigator.clipboard.writeText(c); b.textContent = t1("copied"); } catch (er) {} }
  else if (a === "empezar" || a === "otra") { b.disabled = true; try { await api({accion: "g-" + a, codigo: G.cod, clave: G.clave}); clearTimeout(pollT); sondea(); } catch (er) { b.disabled = false; } }
  else if (a === "deshacer" && puedoDibujar()) { if (G.cur) { cierraTrozo(false); G.cur = null; } deshacer(G.trz); G.buf.push("u"); redibuja(); }
  else if (a === "borrar" && puedoDibujar()) { G.cur = null; G.trz = []; G.buf.push("c"); redibuja(); }
});
document.addEventListener("visibilitychange", () => { if (!document.hidden && G && pollT && is(location.hash)) { clearTimeout(pollT); sondea(); } });
addEventListener("hashchange", () => { if (!is(location.hash)) para(); });

window.LYAGarabatos = {is, render, room, tab: () => t1("tab")};
})();
