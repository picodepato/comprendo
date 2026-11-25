/* Escape room de clase. El profe abre una sala en la pizarra (elige lectura, nº de equipos y minutos) y sale un código.
   Cada alumno entra con el código en su móvil y elige su equipo. Al empezar, cada miembro del equipo ve una parte DISTINTA:
   trozos de la lectura, preguntas, las respuestas posibles (con símbolos), medias frases y los números del candado final.
   Solo hablando (en el idioma que aprenden) pueden juntar lo que sabe cada uno y abrir los candados.
   - Candados 1-4: preguntas de la lectura (R.q). Uno tiene la pregunta, otro las respuestas con símbolos y otro el trozo con la respuesta.
   - Candado 5: «frases rotas» (R.halves). Uno tiene los principios (1-4), otro los finales (A-D).
   - Cada candado abierto da un número a UN miembro. El candado final es el código con los números en orden.
   - Un fallo congela ese candado 15 s para todo el equipo y suma 30 s de penalización.
   Todo sale de la lectura, sin IA. Las pistas se generan igual en todos los móviles (misma semilla).
   Servidor: api/_escape.js (montado en api/propuestas?escape=1). Polling cada 2 s (con caché de 1 s en Vercel).
   Rutas: #escape (entrar con código / crear sala), #escape-<código> (alumno), #escape-pizarra-<código> (profe). */
(() => {
const API = "api/propuestas?escape=1";
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const COLORES = ["#ff7a45", "#7c6cff", "#2fbf71", "#ff4f8b", "#18b6d6", "#f5b700", "#a259ff", "#53c41a"];
const EMOJI = ["🦊", "🐙", "🦉", "🐺", "🐢", "🦄", "🐝", "🦖"];
const SIMB = ["🔺", "🔵", "⭐", "🌙"];
const CONGELA = 15000, PENA = 30000;
const STR = {
  es: {tab: "🔐 Escape room", h1: "Escape room de clase", sub: "Cada uno ve en su móvil un trozo distinto de la lectura y de las pistas. Solo hablando con tu equipo podéis abrir los candados y escapar.",
    entrar: "Entrar en una sala", codigo: "Código de la sala", ir: "Entrar", crear: "Crear una sala (profe)", crear_p: "Para la pizarra: eliges la lectura y salen un código y los equipos.",
    curso: "Idioma", nivel: "Nivel", lectura: "Lectura", equipos: "Equipos", minutos: "Minutos", crearb: "Crear la sala", como: "Cómo se juega",
    como1: "El profe crea la sala en la pizarra y cada alumno entra con el código en su móvil.", como2: "Equipos de 3 a 5. Cada miembro ve una parte diferente: trozos de la lectura, preguntas, respuestas, medias frases…",
    como3: "No enseñéis la pantalla: leed vuestra parte en voz alta y hablad en {idioma}.", como4: "Cada candado abierto da un número a alguien del equipo. Con todos los números, se abre el candado final.",
    nombre: "Tu nombre", elige: "Elige tu equipo", unirme: "¡Dentro!", cambiar: "Cambiar de equipo", tuequipo: "Tu equipo", espera: "Esperando a que el profe empiece…",
    nadie: "nadie todavía", no_existe: "No hay ninguna sala con ese código. Mira bien los números.", e_codigo: "El código tiene 6 números.", e_nombre: "Escribe tu nombre.",
    e_red: "No hay conexión. Prueba otra vez.", e_muchas: "Demasiadas salas en poco tiempo. Espera un poco.", e_llena: "La sala está llena.", e_fin: "Esta partida ya ha terminado.", e_serv: "Aquí no funciona la sala en directo (falta el servidor).",
    historia: "Os habéis quedado encerrados en la biblioteca 📚. Para salir tenéis que abrir {n} candados con lo que dice la lectura «{t}».",
    habla: "🗣️ Habla en {idioma}. Lee tu parte en voz alta. ¡No enseñes tu pantalla!", tuparte: "🤫 Lo que solo ves tú", candados: "🔐 Candados del equipo",
    trozo: "📜 Trozo {n} de la lectura", pregunta: "❓ Pregunta del candado {n}", respuestas: "🔣 Respuestas del candado {n}", principios: "🧩 Principios de frase (candado {n})", finales: "🧩 Finales de frase (candado {n})",
    numero: "🔢 Número del candado {n}", numero_no: "Cuando abráis el candado {n}, aquí saldrá un número. ¡Recuérdalo!", numero_si: "Tu número es",
    cand: "Candado {n}", c_q: "Elegid el símbolo de la respuesta correcta.", c_h: "Unid cada principio (1-{m}) con su final: escribid la letra.", abierto: "Abierto", congelado: "❄️ Congelado {s} s",
    probar: "Probar", mal: "¡No! Candado congelado 15 s.", bien: "¡Abierto! 🔓", final: "🚪 Candado final", final_p: "Juntad los números de todos los candados, en orden (1, 2, 3…).", escapar: "Abrir la puerta",
    final_no: "Abrid primero los otros candados.", escapado: "¡Habéis escapado! 🎉", en: "en {t}", fallos: "{n} fallos (+{p})", puesto: "Puesto {n} de {m}",
    tiempo: "⏳ ¡Se acabó el tiempo!", acabada: "La partida ha terminado.", otro: "Volver al escape room", xp: "+{n} XP",
    pizarra: "Pizarra del profe", entrad: "Entrad en {url} → 🔐 Escape room, con el código:", empezar: "▶ Empezar", terminar: "⏹ Terminar la partida", nueva: "Crear otra sala",
    jugadores: "{n} jugadores", echar: "Quitar", vacio: "Esperando jugadores…", resultados: "Clasificación", sinjug: "Aún no hay nadie en la sala.", quedan: "Quedan",
    sinpiezas: "Esta lectura no tiene preguntas para un escape room. Elige otra.", lect_q: "{q} preguntas", cargando: "Cargando…", ver: "Ver el texto entero",
    t_eq: ["Zorros", "Pulpos", "Búhos", "Lobos", "Tortugas", "Unicornios", "Abejas", "Dinos"]},
  en: {tab: "🔐 Escape room", h1: "Class escape room", sub: "Everyone sees a different part of the reading and the clues on their phone. Only by talking with your team can you open the locks and escape.",
    entrar: "Join a room", codigo: "Room code", ir: "Join", crear: "Create a room (teacher)", crear_p: "For the whiteboard: choose the reading and you get a code and the teams.",
    curso: "Language", nivel: "Level", lectura: "Reading", equipos: "Teams", minutos: "Minutes", crearb: "Create the room", como: "How to play",
    como1: "The teacher creates the room on the whiteboard and each student joins with the code on their phone.", como2: "Teams of 3 to 5. Each member sees a different part: pieces of the text, questions, answers, half sentences…",
    como3: "Don't show your screen: read your part aloud and speak {idioma}.", como4: "Each lock you open gives a number to someone in the team. With all the numbers, the final lock opens.",
    nombre: "Your name", elige: "Choose your team", unirme: "I'm in!", cambiar: "Change team", tuequipo: "Your team", espera: "Waiting for the teacher to start…",
    nadie: "nobody yet", no_existe: "There is no room with that code. Check the numbers.", e_codigo: "The code has 6 numbers.", e_nombre: "Write your name.",
    e_red: "No connection. Try again.", e_muchas: "Too many rooms in a short time. Wait a little.", e_llena: "The room is full.", e_fin: "This game has finished.", e_serv: "The live room doesn't work here (no server).",
    historia: "You are locked in the library 📚. To get out you have to open {n} locks with what the reading “{t}” says.",
    habla: "🗣️ Speak {idioma}. Read your part aloud. Don't show your screen!", tuparte: "🤫 Only you can see this", candados: "🔐 Team locks",
    trozo: "📜 Piece {n} of the text", pregunta: "❓ Question for lock {n}", respuestas: "🔣 Answers for lock {n}", principios: "🧩 Sentence beginnings (lock {n})", finales: "🧩 Sentence endings (lock {n})",
    numero: "🔢 Number from lock {n}", numero_no: "When your team opens lock {n}, a number will appear here. Remember it!", numero_si: "Your number is",
    cand: "Lock {n}", c_q: "Choose the symbol of the right answer.", c_h: "Match each beginning (1-{m}) with its ending: write the letter.", abierto: "Open", congelado: "❄️ Frozen {s} s",
    probar: "Try", mal: "No! Lock frozen for 15 s.", bien: "Open! 🔓", final: "🚪 Final lock", final_p: "Put together the numbers from all the locks, in order (1, 2, 3…).", escapar: "Open the door",
    final_no: "Open the other locks first.", escapado: "You escaped! 🎉", en: "in {t}", fallos: "{n} mistakes (+{p})", puesto: "Place {n} of {m}",
    tiempo: "⏳ Time is up!", acabada: "The game has finished.", otro: "Back to the escape room", xp: "+{n} XP",
    pizarra: "Teacher's board", entrad: "Go to {url} → 🔐 Escape room, with the code:", empezar: "▶ Start", terminar: "⏹ End the game", nueva: "Create another room",
    jugadores: "{n} players", echar: "Remove", vacio: "Waiting for players…", resultados: "Ranking", sinjug: "Nobody is in the room yet.", quedan: "Left",
    sinpiezas: "This reading has no questions for an escape room. Choose another one.", lect_q: "{q} questions", cargando: "Loading…", ver: "See the whole text",
    t_eq: ["Foxes", "Octopuses", "Owls", "Wolves", "Turtles", "Unicorns", "Bees", "Dinos"]},
  ca: {tab: "🔐 Escape room", h1: "Escape room de classe", sub: "Cadascú veu al mòbil un tros diferent de la lectura i de les pistes. Només parlant amb el teu equip podeu obrir els cadenats i escapar.",
    entrar: "Entrar en una sala", codigo: "Codi de la sala", ir: "Entrar", crear: "Crear una sala (profe)", crear_p: "Per a la pissarra: tries la lectura i surten un codi i els equips.",
    curso: "Llengua", nivel: "Nivell", lectura: "Lectura", equipos: "Equips", minutos: "Minuts", crearb: "Crear la sala", como: "Com es juga",
    como1: "El profe crea la sala a la pissarra i cada alumne entra amb el codi al seu mòbil.", como2: "Equips de 3 a 5. Cada membre veu una part diferent: trossos de la lectura, preguntes, respostes, mitges frases…",
    como3: "No ensenyeu la pantalla: llegiu la vostra part en veu alta i parleu en {idioma}.", como4: "Cada cadenat obert dona un número a algú de l'equip. Amb tots els números, s'obre el cadenat final.",
    nombre: "El teu nom", elige: "Tria el teu equip", unirme: "Som-hi!", cambiar: "Canviar d'equip", tuequipo: "El teu equip", espera: "Esperant que el profe comenci…",
    nadie: "ningú encara", no_existe: "No hi ha cap sala amb aquest codi. Mira bé els números.", e_codigo: "El codi té 6 números.", e_nombre: "Escriu el teu nom.",
    e_red: "No hi ha connexió. Torna-ho a provar.", e_muchas: "Massa sales en poc temps. Espera una mica.", e_llena: "La sala és plena.", e_fin: "Aquesta partida ja s'ha acabat.", e_serv: "Aquí no funciona la sala en directe (falta el servidor).",
    historia: "Us heu quedat tancats a la biblioteca 📚. Per sortir heu d'obrir {n} cadenats amb el que diu la lectura «{t}».",
    habla: "🗣️ Parla en {idioma}. Llegeix la teva part en veu alta. No ensenyis la pantalla!", tuparte: "🤫 El que només veus tu", candados: "🔐 Cadenats de l'equip",
    trozo: "📜 Tros {n} de la lectura", pregunta: "❓ Pregunta del cadenat {n}", respuestas: "🔣 Respostes del cadenat {n}", principios: "🧩 Principis de frase (cadenat {n})", finales: "🧩 Finals de frase (cadenat {n})",
    numero: "🔢 Número del cadenat {n}", numero_no: "Quan obriu el cadenat {n}, aquí sortirà un número. Recorda'l!", numero_si: "El teu número és",
    cand: "Cadenat {n}", c_q: "Trieu el símbol de la resposta correcta.", c_h: "Uniu cada principi (1-{m}) amb el seu final: escriviu la lletra.", abierto: "Obert", congelado: "❄️ Congelat {s} s",
    probar: "Provar", mal: "No! Cadenat congelat 15 s.", bien: "Obert! 🔓", final: "🚪 Cadenat final", final_p: "Ajunteu els números de tots els cadenats, en ordre (1, 2, 3…).", escapar: "Obrir la porta",
    final_no: "Obriu primer els altres cadenats.", escapado: "Heu escapat! 🎉", en: "en {t}", fallos: "{n} errades (+{p})", puesto: "Posició {n} de {m}",
    tiempo: "⏳ S'ha acabat el temps!", acabada: "La partida s'ha acabat.", otro: "Tornar a l'escape room", xp: "+{n} XP",
    pizarra: "Pissarra del profe", entrad: "Entreu a {url} → 🔐 Escape room, amb el codi:", empezar: "▶ Començar", terminar: "⏹ Acabar la partida", nueva: "Crear una altra sala",
    jugadores: "{n} jugadors", echar: "Treure", vacio: "Esperant jugadors…", resultados: "Classificació", sinjug: "Encara no hi ha ningú a la sala.", quedan: "Queden",
    sinpiezas: "Aquesta lectura no té preguntes per a un escape room. Tria'n una altra.", lect_q: "{q} preguntes", cargando: "Carregant…", ver: "Veure el text sencer",
    t_eq: ["Guineus", "Pops", "Mussols", "Llops", "Tortugues", "Unicorns", "Abelles", "Dinos"]}
};
const IDIOMA = {es: {es: "español", en: "inglés", ca: "catalán"}, en: {es: "Spanish", en: "English", ca: "Catalan"}, ca: {es: "castellà", en: "anglès", ca: "català"}};

/* ---------- estado ---------- */
const E = {st: null, R: null, file: null, P: null, msg: "", inp: {}, err: "", busy: false, poll: null, tick: null, firma: "", off: 0, crear: null};
const guard = {get() { try { return JSON.parse(localStorage.getItem("lyaEscape") || "{}"); } catch (e) { return {}; } }, set(v) { try { localStorage.setItem("lyaEscape", JSON.stringify(v)); } catch (e) {} }};
const mem = () => { const m = guard.get(); m.host ||= {}; m.play ||= {}; m.xp ||= {}; return m; };
const lenG = () => E.st?.sala.lang || st().S.learn;
const s1 = (k, lang, v) => { let o = (STR[lang] || STR.en)[k] ?? STR.en[k] ?? k; for (const x in v || {}) o = String(o).split(`{${x}}`).join(v[x]); return o; };
const both = () => { try { return L().both(); } catch (e) { return false; } };
const know = () => st().S.know;
const T = (k, v) => { const a = s1(k, lenG(), v), b = s1(k, know(), v); return esc(a) + (both() && know() !== lenG() && b !== a ? ` <span class="en">· ${esc(b)}</span>` : ""); };
const TB = (k, v) => { const a = s1(k, lenG(), v), b = s1(k, know(), v); return esc(a) + (both() && know() !== lenG() && b !== a ? `<span class="en" style="display:block">${esc(b)}</span>` : ""); };
const idioma = () => IDIOMA[lenG()]?.[lenG()] || lenG();
const eqNombre = (i, lang = lenG()) => `${EMOJI[(i - 1) % 8]} ${s1("t_eq", lang)[(i - 1) % 8]}`;
const ahora = () => Date.now() + E.off;
const mmss = ms => { ms = Math.max(0, ms); const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

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

/* ---------- pistas sacadas de la lectura (iguales en todos los móviles) ---------- */
function rnd(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const mezcla = (a, r) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const limpio = t => String(t).replace(/[[\]]/g, "").replace(/\s+/g, " ").trim();
const base = w => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const pals = s => new Set((base(s).match(/[a-zñç0-9]+/g) || []).filter(w => w.length > 3 || /\d/.test(w)));
function pistas(R, semilla) {
  const r = rnd(semilla), trozos = (R.text || []).map(limpio).filter(Boolean), candados = [];
  const qs = mezcla((R.q || []).map((q, i) => ({q, i})), r).slice(0, 4).sort((a, b) => a.i - b.i);
  for (const {q} of qs) {
    const [preg, ops, ok] = q, qp = pals(preg + " " + ops[ok]);
    let mejor = 0, pt = -1; trozos.forEach((t, i) => { const tp = pals(t); let n = 0; for (const w of qp) if (tp.has(w)) n++; if (n > pt) { pt = n; mejor = i; } });
    const simb = mezcla(SIMB.slice(0, ops.length), r), orden = mezcla(ops.map((t, i) => i), r);
    candados.push({tipo: "q", preg, trozo: mejor, ops: orden.map((i, k) => ({s: simb[k], t: ops[i], ok: i === ok})), sol: simb[orden.indexOf(ok)]});
  }
  const hs = mezcla(R.halves || [], r).slice(0, 4);
  if (hs.length >= 3) {
    const letras = "ABCD".slice(0, hs.length).split(""), fin = mezcla(hs.map((h, i) => i), r);
    const finales = fin.map((i, k) => ({l: letras[k], t: hs[i][1]}));
    candados.push({tipo: "h", princ: hs.map(h => h[0]), finales, sol: hs.map((h, i) => letras[fin.indexOf(i)]).join("")});
  }
  candados.forEach(c => c.num = Math.floor(r() * 10));
  return {trozos, candados, codigo: candados.map(c => c.num).join("")};
}
/* reparto: quién del equipo ve cada cosa. n = jugadores del equipo al empezar (como mucho 6) */
function reparto(P, n) {
  n = Math.max(1, Math.min(6, n)); const R = [];
  P.trozos.forEach((t, i) => R.push({rol: i % n, que: "trozo", i}));
  P.candados.forEach((c, k) => {
    if (c.tipo === "q") { const d = c.trozo % n; R.push({rol: (d + 1) % n, que: "preg", k}, {rol: (d + 2) % n, que: "ops", k}); }
    else R.push({rol: k % n, que: "princ", k}, {rol: (k + 1) % n, que: "fin", k});
    R.push({rol: k % n, que: "num", k}); /* los números, repartidos uno a cada miembro */
  });
  return R;
}

/* ---------- datos de la sala ---------- */
const sala = () => E.st?.sala;
const yoId = () => mem().play[sala()?.codigo]?.id;
const yo = () => E.st?.jugadores.find(j => j.id === yoId());
const delEquipo = e => (E.st?.jugadores || []).filter(j => j.e === e);
const eqEst = e => E.st?.equipos[e] || {abiertos: {}, x: 0, z: {}, fin: 0};
const finJuego = () => sala() && sala().t0 + sala().dur * 60000;
const acabado = () => sala() && (sala().fase === "fin" || (sala().fase === "juego" && ahora() >= finJuego()));
const miRol = () => { const y = yo(); if (!y) return 0; const m = delEquipo(y.e), n = Math.max(1, Math.min(6, sala().rep[y.e] || m.length)); return Math.max(0, m.findIndex(j => j.id === y.id)) % n; };
const nRep = e => Math.max(1, Math.min(6, sala().rep[e] || delEquipo(e).length));
function tiempoEq(e) { const x = eqEst(e); return x.fin ? x.fin - sala().t0 + x.x * PENA : Infinity; }
function ranking() {
  const s = sala(), eqs = [];
  for (let e = 1; e <= s.equipos; e++) if (delEquipo(e).length || E.st.equipos[e]) eqs.push(e);
  return eqs.sort((a, b) => tiempoEq(a) - tiempoEq(b) || Object.keys(eqEst(b).abiertos).length - Object.keys(eqEst(a).abiertos).length || eqEst(a).x - eqEst(b).x);
}
async function cargarLectura() {
  const s = sala(); if (!s) return;
  if (E.file === s.file + s.semilla && E.R) return;
  E.R = await L().loadReading(s.file); E.file = s.file + s.semilla; E.P = pistas(E.R, s.semilla);
}

/* ---------- polling ---------- */
function parar() { clearInterval(E.poll); clearInterval(E.tick); E.poll = E.tick = null; }
function vigilar(codigo) {
  parar();
  const una = async () => {
    if (document.hidden || !enEscape()) return;
    const r = await api("GET", null, "&sala=" + codigo);
    if (!enEscape()) return parar();
    if (r.ok) { recibir(r); await cargarLectura().catch(() => {}); pintar(); }
    else if (r.status === 404) { E.err = "no_existe"; E.st = null; parar(); pintar(true); }
  };
  E.poll = setInterval(una, 2000);
  E.tick = setInterval(() => { if (!enEscape()) return parar(); reloj(); if (acabado() && E.firma && !E.firma.includes("|acab")) pintar(); }, 500);
}
const enEscape = () => /^escape/.test(location.hash.slice(1));
function reloj() {
  const s = sala(); if (!s) return;
  for (const el of document.querySelectorAll("[data-esc-reloj]")) el.textContent = s.fase === "juego" ? mmss(finJuego() - ahora()) : s.fase === "fin" ? "0:00" : mmss(s.dur * 60000);
  for (const el of document.querySelectorAll("[data-esc-hielo]")) { const q = +el.dataset.escHielo - ahora(); if (q <= 0) pintar(true); else el.textContent = s1("congelado", lenG(), {s: Math.ceil(q / 1000)}); }
}

/* ---------- pintar ---------- */
let APP = null, vista = "inicio", codigoRuta = null;
function render(app) {
  APP = app;
  const h = location.hash.slice(1), mp = h.match(/^escape-pizarra-(\d{6})$/), mj = h.match(/^escape-(\d{6})$/);
  const nueva = mp ? "pizarra" : mj ? "jugar" : "inicio", cod = (mp || mj || [])[1] || null;
  if (nueva !== vista || cod !== codigoRuta) { if (cod !== codigoRuta) parar(); vista = nueva; codigoRuta = cod; E.msg = ""; E.err = ""; E.firma = ""; if (!cod) { parar(); E.st = null; } else if (E.st?.sala.codigo !== cod) E.st = null; }
  if (cod) { if (!E.poll) { vigilar(cod); } if (!E.st && !E.err) { app.innerHTML = `<section class="wrap esc"><p class="msg">${T("cargando")}</p></section>`; primera(cod); return; } }
  pintar(true);
}
async function primera(cod) {
  const r = await api("GET", null, "&sala=" + cod);
  if (r.ok) { recibir(r); try { await cargarLectura(); } catch (e) {} }
  else E.err = r.status === 404 ? "no_existe" : r.error === "serv" ? "e_serv" : "e_red";
  pintar(true);
}
function pintar(forzar) {
  if (!APP || !enEscape()) return;
  const s = sala();
  const firma = [vista, JSON.stringify(E.st && {...E.st, ahora: 0}), E.msg, E.err, acabado() ? "|acab" : "", E.R ? 1 : 0, E.busy ? 1 : 0].join("§");
  if (!forzar && firma === E.firma) return;
  E.firma = firma;
  /* conservar lo escrito y el foco */
  const act = document.activeElement, idf = act && act.id, sel = idf && act.selectionStart;
  for (const el of APP.querySelectorAll("[data-esc-in]")) E.inp[el.id] = el.value;
  let html;
  if (vista === "inicio") html = inicioHTML();
  else if (E.err && !s) html = `<section class="wrap esc"><div class="esc-box"><p>${T(E.err)}</p><a class="btn" href="#escape">← ${T("otro")}</a></div></section>`;
  else if (vista === "pizarra") html = pizarraHTML();
  else html = jugarHTML();
  APP.innerHTML = html;
  for (const el of APP.querySelectorAll("[data-esc-in]")) if (E.inp[el.id] !== undefined && el.type !== "hidden") el.value = E.inp[el.id];
  if (idf) { const el = document.getElementById(idf); if (el) { el.focus(); try { el.setSelectionRange(sel, sel); } catch (e) {} } }
  reloj();
}
function comoHTML(lang) {
  return `<details class="esc-como" open><summary>${T("como")}</summary><ol>${["como1", "como2", "como3", "como4"].map(k => `<li>${TB(k, {idioma: IDIOMA[lang]?.[lenG()] || lang})}</li>`).join("")}</ol></details>`;
}
function lecturasDe(lang, nivel) {
  const {CAT} = st();
  return CAT.topics.flatMap(t => (t.readings[lang] || []).filter(r => r.file && r.level === nivel).map(r => ({id: r.id || `${t.id}-${r.level.toLowerCase()}`, file: r.file, title: r.title[lang] || r.title.es, topic: t.name[lang] || t.name.es})));
}
function inicioHTML() {
  const {S, CAT} = st(); const c = E.crear ||= {lang: (CAT.courses.find(x => x.learn === S.learn && x.ready) ? S.learn : "en"), nivel: S.level || "A1", lectura: "", equipos: 4, dur: 20};
  const cursos = CAT.courses.filter(x => x.ready).map(x => x.learn);
  const lvs = CAT.levels.filter(l => lecturasDe(c.lang, l).length); if (!lvs.includes(c.nivel)) c.nivel = lvs[0] || "A1"; /* C1 only where the course has it */
  const ls = lecturasDe(c.lang, c.nivel); if (!ls.some(r => r.id === c.lectura)) c.lectura = ls[0]?.id || "";
  const m = mem(), mias = Object.entries(m.host).filter(([, v]) => Date.now() - v.t < 4 * 3600e3);
  return `<section class="wrap esc"><div class="ghead"><div><h1>🔐 ${esc(s1("h1", lenG()))}</h1>${both() && know() !== lenG() ? `<p class="en">${esc(s1("h1", know()))}</p>` : ""}</div></div>
    <p class="esc-lead">${TB("sub")}</p>
    <div class="esc-dos">
      <form class="esc-box" data-esc-form="ir"><h2>📱 ${T("entrar")}</h2>
        <label for="esc-cod">${T("codigo")}</label>
        <input id="esc-cod" data-esc-in class="esc-cod" inputmode="numeric" pattern="[0-9 ]*" maxlength="7" autocomplete="off" placeholder="123456">
        <p class="esc-err" role="alert">${E.msg ? T(E.msg) : ""}</p>
        <button class="btn main">${T("ir")} →</button></form>
      <form class="esc-box" data-esc-form="crear"><h2>🧑‍🏫 ${T("crear")}</h2><p class="esc-small">${T("crear_p")}</p>
        <div class="esc-fila"><label>${T("curso")}<select data-esc-c="lang">${cursos.map(l => `<option value="${l}" ${l === c.lang ? "selected" : ""}>${esc(CAT.languages[l].name[lenG()] || l)}</option>`).join("")}</select></label>
        <label>${T("nivel")}<select data-esc-c="nivel">${lvs.map(l => `<option ${l === c.nivel ? "selected" : ""}>${l}</option>`).join("")}</select></label></div>
        <label>${T("lectura")}<select data-esc-c="lectura">${ls.map(r => `<option value="${esc(r.id)}" ${r.id === c.lectura ? "selected" : ""}>${esc(r.topic)} · ${esc(r.title)}</option>`).join("")}</select></label>
        <div class="esc-fila"><label>${T("equipos")}<select data-esc-c="equipos">${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option ${n === c.equipos ? "selected" : ""}>${n}</option>`).join("")}</select></label>
        <label>${T("minutos")}<select data-esc-c="dur">${[10, 15, 20, 25, 30, 40].map(n => `<option ${n === c.dur ? "selected" : ""}>${n}</option>`).join("")}</select></label></div>
        <p class="esc-err" role="alert">${E.err ? T(E.err) : ""}</p>
        <button class="btn main" ${E.busy || !c.lectura ? "disabled" : ""}>✨ ${T("crearb")}</button>
        ${mias.length ? `<p class="esc-small">${mias.map(([k]) => `<a href="#escape-pizarra-${k}">${T("pizarra")} ${k}</a>`).join(" · ")}</p>` : ""}</form>
    </div>${comoHTML(st().S.learn)}</section>`;
}
function equiposHTML(sel) {
  const s = sala(); let h = "";
  for (let e = 1; e <= s.equipos; e++) {
    const js = delEquipo(e);
    h += `<button type="button" class="esc-eq ${sel === e ? "sel" : ""}" style="--c:${COLORES[(e - 1) % 8]}" data-esc="eq" data-e="${e}" aria-pressed="${sel === e}"><b>${esc(eqNombre(e))}</b><small>${js.length ? js.map(j => esc(j.n)).join(", ") : T("nadie")}</small></button>`;
  }
  return `<div class="esc-eqs">${h}</div>`;
}
function cabeza(extra = "") {
  const s = sala(), y = yo();
  return `<div class="esc-top" style="--c:${y ? COLORES[(y.e - 1) % 8] : "var(--acc)"}"><span>${y ? `<b>${esc(eqNombre(y.e))}</b> · ${esc(y.n)}` : `#${s.codigo}`}</span>${extra}<span class="esc-reloj">⏳ <b data-esc-reloj></b></span></div>`;
}
function jugarHTML() {
  const s = sala(), y = yo(), m = mem(), nombreG = m.nombre || (window.LYACuentas?.usuario || "");
  const tit = E.R ? limpio(E.R.title) : "";
  /* aún no estoy dentro (o espera): formulario */
  if (!y && s.fase === "fin") return `<section class="wrap esc"><div class="esc-box"><p>${T("e_fin")}</p><a class="btn" href="#escape">← ${T("otro")}</a></div></section>`;
  if (!y || (s.fase === "espera" && E.inp.cambiar)) {
    const sel = +(E.inp.equipo || (y && y.e) || 0);
    return `<section class="wrap esc"><h1 class="esc-h">🔐 ${esc(s1("h1", lenG()))} <small>#${s.codigo}</small></h1>${tit ? `<p class="en">${esc(tit)}</p>` : ""}
      <form class="esc-box" data-esc-form="unirme"><label for="esc-nom">${T("nombre")}</label><input id="esc-nom" data-esc-in maxlength="20" autocomplete="nickname" value="${esc(nombreG)}">
      <p class="esc-small">${T("elige")}</p>${equiposHTML(sel)}
      <p class="esc-err" role="alert">${E.msg ? T(E.msg) : ""}</p><button class="btn main" ${E.busy ? "disabled" : ""}>🚀 ${T("unirme")}</button></form>${comoHTML(s.lang)}</section>`;
  }
  if (s.fase === "espera") {
    return `<section class="wrap esc">${cabeza()}<div class="esc-box esc-espera"><p class="esc-big">⏳ ${T("espera")}</p>
      <p>${T("tuequipo")}: <b>${esc(eqNombre(y.e))}</b> — ${delEquipo(y.e).map(j => esc(j.n)).join(", ")}</p>
      <button class="btn" data-esc="cambiar">🔁 ${T("cambiar")}</button></div>${comoHTML(s.lang)}</section>`;
  }
  if (!E.P) return `<section class="wrap esc"><p class="msg">${T("cargando")}</p></section>`;
  const P = E.P, X = eqEst(y.e), n = nRep(y.e), rol = miRol(), mio = reparto(P, n).filter(x => x.rol === rol);
  const abiertos = P.candados.filter((c, k) => X.abiertos[k]).length, todos = abiertos === P.candados.length;
  const prog = `<span class="esc-prog">${P.candados.map((c, k) => X.abiertos[k] ? "🔓" : "🔒").join("")}${X.fin ? "🚪" : ""}</span>`;
  if (X.fin || acabado()) return finHTML(y.e, prog);
  /* mis piezas */
  const piezas = mio.map(x => {
    const c = P.candados[x.k];
    if (x.que === "trozo") return `<div class="esc-pz trozo"><h3>${T("trozo", {n: x.i + 1})}</h3><p lang="${esc(s.lang)}">${esc(P.trozos[x.i])}</p></div>`;
    if (x.que === "preg") return `<div class="esc-pz preg"><h3>${T("pregunta", {n: x.k + 1})}</h3><p class="esc-q" lang="${esc(s.lang)}">${esc(c.preg)}</p></div>`;
    if (x.que === "ops") return `<div class="esc-pz ops"><h3>${T("respuestas", {n: x.k + 1})}</h3><ul lang="${esc(s.lang)}">${c.ops.map(o => `<li><span class="esc-s">${o.s}</span> ${esc(o.t)}</li>`).join("")}</ul></div>`;
    if (x.que === "princ") return `<div class="esc-pz h"><h3>${T("principios", {n: x.k + 1})}</h3><ol lang="${esc(s.lang)}">${c.princ.map(t => `<li>${esc(t)}</li>`).join("")}</ol></div>`;
    if (x.que === "fin") return `<div class="esc-pz h"><h3>${T("finales", {n: x.k + 1})}</h3><ul class="esc-let" lang="${esc(s.lang)}">${c.finales.map(f => `<li><b>${f.l}</b> ${esc(f.t)}</li>`).join("")}</ul></div>`;
    if (x.que === "num") return `<div class="esc-pz num ${X.abiertos[x.k] ? "si" : ""}"><h3>${T("numero", {n: x.k + 1})}</h3>${X.abiertos[x.k] ? `<p>${T("numero_si")}</p><p class="esc-dig">${c.num}</p>` : `<p class="esc-small">${T("numero_no", {n: x.k + 1})}</p>`}</div>`;
    return "";
  }).join("");
  /* candados */
  const cands = P.candados.map((c, k) => {
    const ab = X.abiertos[k], hielo = (X.z[k] || 0) + CONGELA, frio = !ab && hielo > ahora();
    let cuerpoC;
    if (ab) cuerpoC = `<p class="esc-ok">🔓 ${T("abierto")}</p>`;
    else if (frio) cuerpoC = `<p class="esc-hielo" data-esc-hielo="${hielo}"></p>`;
    else if (c.tipo === "q") cuerpoC = `<p class="esc-small">${T("c_q")}</p><div class="esc-simbs">${SIMB.slice(0, c.ops.length).map(sb => `<button type="button" class="btn esc-sb" data-esc="q" data-k="${k}" data-s="${sb}" ${E.busy ? "disabled" : ""}>${sb}</button>`).join("")}</div>`;
    else cuerpoC = `<p class="esc-small">${T("c_h", {m: c.princ.length})}</p><form class="esc-hs" data-esc-form="h" data-k="${k}">${c.princ.map((_, i) => `<label>${i + 1} <input id="esc-h${k}-${i}" data-esc-in maxlength="1" autocomplete="off" autocapitalize="characters"></label>`).join("")}<button class="btn main" ${E.busy ? "disabled" : ""}>${T("probar")}</button></form>`;
    return `<div class="esc-cand ${ab ? "ab" : ""} ${frio ? "frio" : ""}"><h3>${ab ? "🔓" : "🔒"} ${T("cand", {n: k + 1})}</h3>${cuerpoC}</div>`;
  }).join("");
  const final = `<div class="esc-cand final ${todos ? "" : "cerrado"}"><h3>${T("final")}</h3>${todos ? `<p class="esc-small">${T("final_p")}</p>
    <form class="esc-hs" data-esc-form="final"><input id="esc-fin" data-esc-in class="esc-cod" inputmode="numeric" maxlength="${P.candados.length}" autocomplete="off" placeholder="${"•".repeat(P.candados.length)}"><button class="btn main" ${E.busy ? "disabled" : ""}>🚪 ${T("escapar")}</button></form>` : `<p class="esc-small">${T("final_no")}</p>`}</div>`;
  return `<section class="wrap esc">${cabeza(prog)}
    <p class="esc-hist">${T("historia", {n: P.candados.length + 1, t: tit})}</p>
    <p class="esc-habla">${T("habla", {idioma: idioma()})}</p>
    ${E.msg ? `<p class="esc-aviso ${E.msg === "bien" ? "ok" : ""}" role="status">${T(E.msg)}</p>` : ""}
    <h2>${T("tuparte")}</h2><div class="esc-pzs">${piezas}</div>
    <h2>${T("candados")}</h2><div class="esc-cands">${cands}${final}</div></section>`;
}
function finHTML(e, prog) {
  const X = eqEst(e), rk = ranking(), pos = rk.indexOf(e) + 1;
  let h = `<section class="wrap esc">${cabeza(prog)}<div class="esc-box esc-fin">`;
  if (X.fin) {
    h += `<p class="esc-big">${T("escapado")}</p><p>${T("en", {t: mmss(X.fin - sala().t0)})}${X.x ? ` · ${T("fallos", {n: X.x, p: mmss(X.x * PENA)})}` : ""}</p>`;
    darXP();
  } else h += `<p class="esc-big">${sala().fase === "fin" ? T("acabada") : T("tiempo")}</p>`;
  if (pos) h += `<p>${T("puesto", {n: pos, m: rk.length})}</p>`;
  if (E.R) h += `<details><summary>${T("ver")}</summary>${E.P.trozos.map(t => `<p lang="${esc(sala().lang)}">${esc(t)}</p>`).join("")}</details>`;
  return h + `<a class="btn" href="#escape">← ${T("otro")}</a></div></section>`;
}
function darXP() {
  const m = mem(), k = sala().codigo; if (m.xp[k]) return;
  m.xp[k] = Date.now(); for (const x in m.xp) if (Date.now() - m.xp[x] > 864e5) delete m.xp[x]; guard.set(m);
  const n = 30 - Math.min(20, eqEst(yo().e).x * 3);
  try { dispatchEvent(new CustomEvent("lya:xp", {detail: {xp: n, src: "escape", ok: true}})); } catch (e) {}
}
function pizarraHTML() {
  const s = sala(), clave = mem().host[s.codigo]?.clave, url = location.host || "comprendo";
  const tit = E.R ? limpio(E.R.title) : "", total = E.P ? E.P.candados.length : 0;
  let h = `<section class="wrap esc esc-piz"><div class="esc-top"><span>🧑‍🏫 ${T("pizarra")}${tit ? ` · <b>${esc(tit)}</b> (${esc(s.lang)})` : ""}</span><span class="esc-reloj">⏳ <b data-esc-reloj></b></span></div>`;
  if (s.fase === "espera") h += `<div class="esc-box esc-codbox"><p>${T("entrad", {url: esc(url)})}</p><p class="esc-codigo">${s.codigo.slice(0, 3)} ${s.codigo.slice(3)}</p><p class="esc-small">${T("jugadores", {n: E.st.jugadores.length})}</p></div>`;
  const rk = s.fase === "espera" ? null : ranking();
  const eqs = rk || Array.from({length: s.equipos}, (_, i) => i + 1);
  h += `<div class="esc-tabla">` + eqs.map((e, i) => {
    const X = eqEst(e), js = delEquipo(e);
    const can = E.P ? E.P.candados.map((c, k) => X.abiertos[k] ? "🔓" : "🔒").join("") + (X.fin ? "🚪" : "") : "";
    return `<div class="esc-fila-eq" style="--c:${COLORES[(e - 1) % 8]}">${rk ? `<span class="esc-pos">${i + 1}</span>` : ""}<b>${esc(eqNombre(e))}</b>
      <span class="esc-js">${js.length ? js.map(j => `<span class="esc-j">${esc(j.n)}${clave && s.fase === "espera" ? ` <button class="esc-x" data-esc="echar" data-j="${esc(j.id)}" aria-label="${esc(s1("echar", lenG()))} ${esc(j.n)}">✕</button>` : ""}</span>`).join("") : `<i>${T("nadie")}</i>`}</span>
      ${rk ? `<span class="esc-can">${can}</span><span class="esc-t">${X.fin ? mmss(X.fin - s.t0) + (X.x ? ` +${mmss(X.x * PENA)}` : "") : `${Object.keys(X.abiertos).length}/${total}`}${X.x ? ` · ❌${X.x}` : ""}</span>` : ""}</div>`;
  }).join("") + `</div>`;
  if (clave) {
    if (s.fase === "espera") h += `<button class="btn main esc-grande" data-esc="empezar" ${E.st.jugadores.length && !E.busy ? "" : "disabled"}>${T("empezar")}</button>${E.st.jugadores.length ? "" : `<p class="esc-small">${T("sinjug")}</p>`}`;
    else if (s.fase === "juego") h += `<button class="btn esc-grande" data-esc="terminar">${T("terminar")}</button>`;
  }
  if (s.fase === "fin" || acabado()) h += `<p><a class="btn main" href="#escape">${T("nueva")}</a></p>`;
  return h + comoHTML(s.lang) + `</section>`;
}

/* ---------- acciones ---------- */
const ERR = {no_existe: "no_existe", red: "e_red", serv: "e_serv", muchas: "e_muchas", llena: "e_llena", fase: "e_fin", nombre: "e_nombre"};
async function accion(datos) {
  E.busy = true; pintar(true);
  const r = await api("POST", {sala: sala()?.codigo, ...datos});
  E.busy = false;
  if (r.estado) { recibir(r.estado); await cargarLectura().catch(() => {}); }
  return r;
}
document.addEventListener("submit", async ev => {
  const f = ev.target.closest("[data-esc-form]"); if (!f) return; ev.preventDefault();
  const tipo = f.dataset.escForm;
  if (tipo === "ir") {
    const c = (document.getElementById("esc-cod").value || "").replace(/\D/g, "");
    if (c.length !== 6) { E.msg = "e_codigo"; return pintar(true); }
    E.msg = ""; location.hash = "#escape-" + c; return;
  }
  if (tipo === "crear") {
    const c = E.crear, r0 = lecturasDe(c.lang, c.nivel).find(r => r.id === c.lectura); if (!r0) return;
    E.busy = true; E.err = ""; pintar(true);
    try { const R = await L().loadReading(r0.file); if (!(R.q || []).length) { E.busy = false; E.err = "sinpiezas"; return pintar(true); } } catch (e) {}
    const r = await api("POST", {accion: "crear", lectura: r0.id, file: r0.file, lang: c.lang, equipos: c.equipos, dur: c.dur});
    E.busy = false;
    if (!r.ok) { E.err = ERR[r.error] || "e_red"; return pintar(true); }
    const m = mem(); m.host[r.sala] = {clave: r.clave, t: Date.now()}; for (const k in m.host) if (Date.now() - m.host[k].t > 864e5) delete m.host[k]; guard.set(m);
    recibir(r.estado); location.hash = "#escape-pizarra-" + r.sala; return;
  }
  if (tipo === "unirme") {
    const nombre = document.getElementById("esc-nom").value.trim(), e = +(E.inp.equipo || yo()?.e || 0);
    if (!nombre) { E.msg = "e_nombre"; return pintar(true); }
    if (!e) { E.msg = "elige"; return pintar(true); }
    const m = mem(), cod = sala().codigo;
    const r = await accion({accion: "entrar", nombre, equipo: e, jugador: m.play[cod]?.id});
    if (!r.ok) { E.msg = ERR[r.error] || "e_red"; return pintar(true); }
    m.play[cod] = {id: r.jugador, t: Date.now()}; m.nombre = nombre; for (const k in m.play) if (Date.now() - m.play[k].t > 864e5) delete m.play[k]; guard.set(m);
    E.msg = ""; E.inp.cambiar = false; return pintar(true);
  }
  if (tipo === "h" || tipo === "final") {
    const k = +f.dataset.k, P = E.P;
    let ok, dato;
    if (tipo === "h") { const c = P.candados[k]; dato = c.princ.map((_, i) => (document.getElementById(`esc-h${k}-${i}`).value || "").trim().toUpperCase()).join(""); if (dato.length < c.princ.length) return; ok = dato === c.sol; }
    else { dato = (document.getElementById("esc-fin").value || "").replace(/\D/g, ""); if (dato.length < P.candados.length) return; ok = dato === P.codigo; }
    for (const el of f.querySelectorAll("input")) { el.value = ""; delete E.inp[el.id]; }
    await probar(tipo === "final" ? -1 : k, ok);
  }
});
async function probar(k, ok) {
  const r = await accion({accion: k < 0 ? (ok ? "escapar" : "fallo") : ok ? "abrir" : "fallo", jugador: yoId(), candado: k < 0 ? 6 : k});
  E.msg = r.ok ? (ok ? "bien" : "mal") : ERR[r.error] || "e_red";
  pintar(true); clearTimeout(probar.t); probar.t = setTimeout(() => { E.msg = ""; pintar(true); }, 3500);
  if (!ok && navigator.vibrate) try { navigator.vibrate(200); } catch (e) {}
}
document.addEventListener("change", ev => {
  const el = ev.target.closest("[data-esc-c]"); if (!el || !E.crear) return;
  const k = el.dataset.escC; E.crear[k] = k === "equipos" || k === "dur" ? +el.value : el.value; E.err = ""; pintar(true);
});
document.addEventListener("input", ev => {
  const el = ev.target; if (!el.id || !el.id.startsWith("esc-h")) return;
  el.value = el.value.toUpperCase().replace(/[^A-D]/g, "");
  if (el.value) { const nx = el.closest("label")?.nextElementSibling?.querySelector("input"); if (nx) nx.focus(); }
});
document.addEventListener("click", async ev => {
  const b = ev.target.closest("[data-esc]"); if (!b) return;
  const a = b.dataset.esc;
  if (a === "eq") { E.inp.equipo = +b.dataset.e; for (const x of APP.querySelectorAll(".esc-eq")) { x.classList.toggle("sel", x === b); x.setAttribute("aria-pressed", x === b); } }
  else if (a === "cambiar") { E.inp.cambiar = true; E.inp.equipo = yo()?.e; pintar(true); }
  else if (a === "q") { const k = +b.dataset.k; await probar(k, b.dataset.s === E.P.candados[k].sol); }
  else if (a === "empezar" || a === "terminar") { const r = await accion({accion: a, clave: mem().host[sala().codigo]?.clave}); if (!r.ok) E.err = ERR[r.error] || "e_red"; pintar(true); }
  else if (a === "echar") { if (b.dataset.ok) { await accion({accion: "echar", clave: mem().host[sala().codigo]?.clave, jugador: b.dataset.j}); pintar(true); } else { b.dataset.ok = 1; b.textContent = s1("echar", lenG()) + "?"; b.classList.add("seguro"); } }
});
document.addEventListener("visibilitychange", () => { if (!document.hidden && enEscape() && E.poll && sala()) api("GET", null, "&sala=" + sala().codigo).then(async r => { if (r.ok) { recibir(r); await cargarLectura().catch(() => {}); pintar(); } }); });

const isEscape = h => /^escape(-pizarra)?(-\d{6})?$/.test(h);
const tab = () => esc(s1("tab", st().S.learn));
window.LYAEscape = {render, isEscape, tab, pistas, reparto};
})();
