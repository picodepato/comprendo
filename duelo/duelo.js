/* Duelos en directo (api/duelo.js): alguien crea una mesa con una lectura, sale un código de 6 cifras,
   y hasta 30 personas se unen escribiéndolo. Todos leen el texto y contestan sus preguntas a la vez;
   acertar rápido da más puntos y entre pregunta y pregunta se ve el ranking.
   Si la crea un profe y no juega, su pantalla es la «pantalla grande» para el proyector.
   Rutas: #duelo (crear o unirse) y #duelo-<código>.
   Sin websockets: se consulta el estado (una sola lectura de Upstash, compartida 1 s en la CDN de Vercel)
   cada 1,5-3 s según la fase, y más despacio si la pestaña no se ve.
   Premios al terminar (una vez por duelo): XP con award() y, si el profe lo ha puesto, un logro en S.g.du.tr. */
(() => {
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const STR = {
  es: {tab: "Duelo", title: "Duelos en directo", sub: "Compite con tu clase en tiempo real: leéis la misma lectura y contestáis sus preguntas a la vez. Acertar rápido da más puntos.",
    join: "Unirme a un duelo", code: "Código del duelo", join_b: "Entrar", create: "Crear un duelo", lang: "Idioma", level: "Nivel", pick: "Elige la lectura",
    opts: "Opciones", t_q: "Tiempo por pregunta", t_read: "Tiempo para leer", no_read: "sin tiempo de lectura", show_text: "Se puede mirar el texto durante las preguntas",
    i_play: "Yo también juego", prizes: "Premios (solo profes)", xp_all: "XP para todos los que jueguen", xp_1: "XP extra 1.º", xp_2: "XP extra 2.º", xp_3: "XP extra 3.º",
    ach: "Logro del duelo (opcional)", ach_name: "Nombre del logro", ach_ph: "Por ejemplo: Campeón de los dinosaurios", ach_for: "Para", ach_1: "el ganador", ach_3: "los 3 primeros", ach_all: "todos",
    student_prizes: "Premio: 10 XP por jugar y 30, 20 y 15 XP extra para los 3 primeros.", go_create: "Crear la mesa", need_acc: "Para jugar duelos hace falta una cuenta (así tu clase sabe quién eres).",
    login: "Entrar o crear cuenta", no_server: "Los duelos necesitan el servidor de la web.", bad_code: "El código tiene 6 cifras.",
    e_no_existe: "No hay ningún duelo con ese código (o ya ha caducado).", e_llena: "Este duelo ya está lleno (30 personas).", e_empezada: "Este duelo ya ha empezado.", e_echado: "El anfitrión te ha sacado de este duelo.", e_net: "Sin conexión. Lo vuelvo a intentar…", e_x: "No se ha podido. Inténtalo otra vez.",
    lobby: "Esperando jugadores", lobby_how: "Entrad en COMPRENDO → Duelo y escribid este código:", players: "Jugadores", start: "¡Empezar!", close: "Cerrar la mesa", wait_host: "Esperando a que {h} empiece el duelo…",
    kick: "Sacar del duelo", read: "¡A leer!", read_how: "Lee con atención: después vienen las preguntas.", to_q: "¡Ya! A las preguntas", left: "Quedan {n} s",
    q: "Pregunta {n} de {t}", answered: "{n} de {t} han contestado", sent: "¡Respuesta enviada! A ver qué tal…", late: "Se acabó el tiempo", see_text: "Ver el texto",
    next: "Siguiente", ok: "¡Bien!", bad: "¡Uy! No era esa", none: "No has contestado", pos: "Vas el {n}.º de {t}", top: "Clasificación", pts: "puntos",
    end: "¡Duelo terminado!", podium: "Podio", final: "Clasificación final", per_q: "Pregunta a pregunta", you_won: "Has ganado {xp} XP", you_ach: "¡Logro: {m}!",
    again: "Otro duelo", my_tr: "Mis logros de duelos", host_screen: "Pantalla grande", you: "tú", copy: "Copiar el código", copied: "¡Copiado!", host_lbl: "Anfitrión: {h}",
    closed: "Este duelo se ha cerrado.", none_rd: "Aún no hay lecturas en este nivel.", played: "Duelos jugados: {n} · Ganados: {w}"},
  en: {tab: "Duel", title: "Live duels", sub: "Compete with your class in real time: you all read the same text and answer its questions at the same time. Fast right answers win more points.",
    join: "Join a duel", code: "Duel code", join_b: "Join", create: "Create a duel", lang: "Language", level: "Level", pick: "Choose the reading",
    opts: "Options", t_q: "Time per question", t_read: "Time to read", no_read: "no reading time", show_text: "Players can look at the text during the questions",
    i_play: "I play too", prizes: "Prizes (teachers only)", xp_all: "XP for everyone who plays", xp_1: "Extra XP 1st", xp_2: "Extra XP 2nd", xp_3: "Extra XP 3rd",
    ach: "Duel achievement (optional)", ach_name: "Achievement name", ach_ph: "For example: Dinosaur champion", ach_for: "For", ach_1: "the winner", ach_3: "the top 3", ach_all: "everyone",
    student_prizes: "Prize: 10 XP for playing and 30, 20 and 15 extra XP for the top 3.", go_create: "Create the room", need_acc: "You need an account to play duels (so your class knows who you are).",
    login: "Sign in or create an account", no_server: "Duels need the website's server.", bad_code: "The code has 6 digits.",
    e_no_existe: "There is no duel with that code (or it has expired).", e_llena: "This duel is full (30 people).", e_empezada: "This duel has already started.", e_echado: "The host removed you from this duel.", e_net: "No connection. Trying again…", e_x: "That didn't work. Try again.",
    lobby: "Waiting for players", lobby_how: "Open COMPRENDO → Duel and type this code:", players: "Players", start: "Start!", close: "Close the room", wait_host: "Waiting for {h} to start the duel…",
    kick: "Remove from the duel", read: "Time to read!", read_how: "Read carefully: the questions come next.", to_q: "Go! To the questions", left: "{n} s left",
    q: "Question {n} of {t}", answered: "{n} of {t} have answered", sent: "Answer sent! Let's see…", late: "Time's up", see_text: "See the text",
    next: "Next", ok: "Right!", bad: "Oops! Not that one", none: "You didn't answer", pos: "You are {n} of {t}", top: "Leaderboard", pts: "points",
    end: "Duel finished!", podium: "Podium", final: "Final leaderboard", per_q: "Question by question", you_won: "You won {xp} XP", you_ach: "Achievement: {m}!",
    again: "Another duel", my_tr: "My duel achievements", host_screen: "Big screen", you: "you", copy: "Copy the code", copied: "Copied!", host_lbl: "Host: {h}",
    closed: "This duel has been closed.", none_rd: "There are no readings at this level yet.", played: "Duels played: {n} · Won: {w}"},
  ca: {tab: "Duel", title: "Duels en directe", sub: "Competeix amb la teva classe en temps real: llegiu la mateixa lectura i en contesteu les preguntes alhora. Encertar ràpid dona més punts.",
    join: "Unir-me a un duel", code: "Codi del duel", join_b: "Entrar", create: "Crear un duel", lang: "Llengua", level: "Nivell", pick: "Tria la lectura",
    opts: "Opcions", t_q: "Temps per pregunta", t_read: "Temps per llegir", no_read: "sense temps de lectura", show_text: "Es pot mirar el text durant les preguntes",
    i_play: "Jo també jugo", prizes: "Premis (només professors)", xp_all: "XP per a tothom que jugui", xp_1: "XP extra 1r", xp_2: "XP extra 2n", xp_3: "XP extra 3r",
    ach: "Assoliment del duel (opcional)", ach_name: "Nom de l'assoliment", ach_ph: "Per exemple: Campió dels dinosaures", ach_for: "Per a", ach_1: "el guanyador", ach_3: "els 3 primers", ach_all: "tothom",
    student_prizes: "Premi: 10 XP per jugar i 30, 20 i 15 XP extra per als 3 primers.", go_create: "Crear la taula", need_acc: "Per jugar duels cal un compte (així la teva classe sap qui ets).",
    login: "Entrar o crear compte", no_server: "Els duels necessiten el servidor de la web.", bad_code: "El codi té 6 xifres.",
    e_no_existe: "No hi ha cap duel amb aquest codi (o ja ha caducat).", e_llena: "Aquest duel ja és ple (30 persones).", e_empezada: "Aquest duel ja ha començat.", e_echado: "L'amfitrió t'ha tret d'aquest duel.", e_net: "Sense connexió. Ho torno a provar…", e_x: "No s'ha pogut. Torna-ho a provar.",
    lobby: "Esperant jugadors", lobby_how: "Entreu a COMPRENDO → Duel i escriviu aquest codi:", players: "Jugadors", start: "Comencem!", close: "Tancar la taula", wait_host: "Esperant que {h} comenci el duel…",
    kick: "Treure del duel", read: "A llegir!", read_how: "Llegeix amb atenció: després venen les preguntes.", to_q: "Som-hi! A les preguntes", left: "Queden {n} s",
    q: "Pregunta {n} de {t}", answered: "{n} de {t} han contestat", sent: "Resposta enviada! A veure què tal…", late: "S'ha acabat el temps", see_text: "Veure el text",
    next: "Següent", ok: "Molt bé!", bad: "Ui! No era aquesta", none: "No has contestat", pos: "Vas el {n}è de {t}", top: "Classificació", pts: "punts",
    end: "Duel acabat!", podium: "Podi", final: "Classificació final", per_q: "Pregunta a pregunta", you_won: "Has guanyat {xp} XP", you_ach: "Assoliment: {m}!",
    again: "Un altre duel", my_tr: "Els meus assoliments de duels", host_screen: "Pantalla gran", you: "tu", copy: "Copiar el codi", copied: "Copiat!", host_lbl: "Amfitrió: {h}",
    closed: "Aquest duel s'ha tancat.", none_rd: "Encara no hi ha lectures en aquest nivell.", played: "Duels jugats: {n} · Guanyats: {w}"}
};
const s1 = (k, lang, v) => { let o = (STR[lang] || STR.es)[k] ?? STR.es[k] ?? k; for (const x in v || {}) o = o.split(`{${x}}`).join(v[x]); return o; };
const both = () => { try { return L().both(); } catch (e) { return false; } };
const T = (k, v) => { const {S} = st(); const a = s1(k, S.learn, v), b = s1(k, S.know, v); return esc(a) + (both() && b !== a ? ` · ${esc(b)}` : ""); };
const TB = (k, v) => { const {S} = st(); const a = s1(k, S.learn, v), b = s1(k, S.know, v); return esc(a) + (both() && b !== a ? `<span class="en" style="display:block">${esc(b)}</span>` : ""); };
const R = 6, LV = ["A1", "A2", "B1", "C1"], COL = ["#e23b4a", "#2f7de1", "#e9a400", "#22a55b"], FORM = ["▲", "◆", "●", "■"];
const ICONS = ["🏆", "🥇", "⭐", "🔥", "🚀", "📚", "🦉", "💎", "🦖", "👑"];
const store = {get: k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }};
const TKEY = "lyaDuelos"; /* {código: {tk, pid, host, t}} */
const misMesas = () => { const o = store.get(TKEY) || {}; for (const c in o) if (Date.now() - (o[c].t || 0) > 4 * 3600e3) delete o[c]; return o; };
const guardarMesa = (c, v) => { const o = misMesas(); o[c] = {...v, t: Date.now()}; store.set(TKEY, o); };
const prog = () => { const {S} = st(); S.g ||= {}; return (S.g.du ||= {n: 0, w: 0, tr: []}); };
const cuenta = () => window.LYACuentas;
const api = (ruta, metodo, datos) => cuenta().api(ruta, metodo, datos);
const plain = s => { if (D?.s?.mesa?.file?.startsWith("mates:")) return String(s); /* mates: los corchetes son de verdad */ try { return L().plain(s); } catch (e) { return String(s).replace(/[[\]]/g, ""); } };
const fmtCode = c => String(c).replace(/^(\d{3})(\d{3})$/, "$1 $2");

/* ---------- creating: remembered choices ---------- */
const OPC = Object.assign({lang: null, level: null, file: null, D: 20, TL: 90, texto: true, juega: false, xp: {todos: 10, p1: 30, p2: 20, p3: 15}, logro: {ic: "🏆", n: "", para: 1}}, store.get("lyaDueloOpc") || {});
const guardarOpc = () => store.set("lyaDueloOpc", OPC);
const cursos = () => { const {CAT} = st(); return [...new Set(CAT.courses.filter(c => c.ready).map(c => c.learn))]; };
function lecturas(lang, level) {
  const {CAT} = st();
  return CAT.topics.flatMap(t => (t.readings[lang] || []).filter(r => r.level === level && r.file).map(r => ({...r, t, id: r.id || `${t.id}-${r.level.toLowerCase()}`})));
}

/* ---------- state of the room ---------- */
let D = null; /* {c, tk, pid, host, s (último estado), off (reloj del servidor), R (lectura), ... } */
let polT = null, tickT = null, lastId = "", msgHub = "";
const now = () => Date.now() + (D ? D.off : 0);
function fase(m, t) {
  if (m.st === "lobby") return {f: "lobby", id: "lobby"};
  if (m.st === "fin") return {f: "end", id: "end"};
  if (t < m.tq) return {f: "read", id: "read", hasta: m.tq};
  const P = (m.D + R) * 1000, k = m.k0 + Math.floor((t - m.tq) / P), off = (t - m.tq) % P;
  if (k >= m.nq) return {f: "end", id: "end"};
  const ab = m.tq + (k - m.k0) * P;
  return off < m.D * 1000 ? {f: "q", k, id: "q" + k, ab, hasta: ab + m.D * 1000} : {f: "r", k, id: "r" + k, ab, hasta: ab + P};
}
const F = () => D && D.s ? fase(D.s.mesa, now()) : null;
/* points as the server counts them (for the local "+n" before the next poll) */
const puntos = (ok, ms, Ds) => ok ? Math.round(500 + 500 * Math.max(0, 1 - ms / (Ds * 1000))) : 0;

async function consultar() {
  if (!D) return;
  const c = D.c, t0 = Date.now();
  let r, j;
  try { r = await fetch("api/duelo?c=" + c, {cache: "no-store"}); j = await r.json(); }
  catch (e) { if (D && D.c === c) { D.err = "e_net"; pintar(); planear(4000); } return; }
  if (!D || D.c !== c) return;
  if (r.status === 404) { D.err = "e_no_existe"; D.s = null; pintar(true); return; }
  if (!r.ok || !j.ok) { planear(4000); return; }
  /* offset of the server clock: the freshest answer (CDN copies can be up to 1 s old) */
  const o = j.now - (t0 + Date.now()) / 2; D.offs = [...(D.offs || []), o].slice(-8); D.off = Math.max(...D.offs);
  D.err = ""; D.s = j;
  if (D.pid && !j.jugadores.some(p => p.pid === D.pid) && D.jugo && j.fase.f === "lobby") { D.err = "e_echado"; D.pid = null; }
  if (D.pid && j.jugadores.some(p => p.pid === D.pid)) D.jugo = true;
  if (!D.R) { try { D.R = j.mesa.file.startsWith("mates:") ? window.LYAMatesBanco.serie(j.mesa.file.slice(6)) : await L().loadReading(j.mesa.file); } catch (e) {} }
  pintar();
  anfitrionAuto();
  const f = F();
  planear(!f || f.f === "end" ? 0 : intervalo(f));
}
function intervalo(f) {
  let ms = f.f === "lobby" ? 2500 : f.f === "read" ? 4000 : f.f === "q" ? (yaContesto(f.k) && !D.host ? 2500 : 1500) : 3000;
  if (f.hasta) ms = Math.min(ms, Math.max(300, f.hasta - now() + 250)); /* justo cuando cambia de fase */
  if (document.hidden) ms = Math.max(ms, 6000);
  return ms + Math.random() * 300;
}
function planear(ms) { clearTimeout(polT); if (ms > 0 && D) polT = setTimeout(consultar, ms); }
const yaContesto = k => D && D.mias && D.mias[k] !== undefined;

/* the host's device moves on as soon as everybody has answered */
let autoPedido = "";
function anfitrionAuto() {
  if (!D || !D.host || !D.s) return;
  const f = F(), js = D.s.jugadores;
  if (f.f === "q" && js.length && js.every(p => p.ya) && autoPedido !== f.id) { autoPedido = f.id; avanzar(f.id); }
}
async function avanzar(de) {
  try { await api("duelo", "POST", {a: "avanzar", c: D.c, de}); } catch (e) {}
  planear(150);
}

/* local clock: changes phase exactly on time and moves the countdown */
function tick() {
  if (!D || !D.s) return;
  const f = F();
  if (f.id !== lastId) { pintar(); planear(Math.min(800, intervalo(f))); return; }
  const el = document.getElementById("du-left");
  if (el && f.hasta) { const n = Math.max(0, Math.ceil((f.hasta - now()) / 1000)); el.textContent = n; const bar = document.getElementById("du-bar"); if (bar) bar.style.width = (100 * Math.max(0, f.hasta - now()) / ((f.f === "q" ? D.s.mesa.D : f.f === "r" ? R : D.s.mesa.TL) * 1000)) + "%"; }
}

async function entrarMesa(c) {
  const guard = misMesas()[c];
  D = {c, off: 0, mias: {}, ...(guard || {})};
  D.mias = (store.get("lyaDueloResp") || {})[c] || {};
  if (!guard) {
    if (!cuenta()?.usuario) { D.err = "need_acc"; return; }
    const r = await api("duelo", "POST", {a: "unir", c});
    if (!r.ok) { D.err = "e_" + (r.j.error || "x"); if (!STR.es[D.err]) D.err = "e_x"; return; }
    D.tk = r.j.tk; D.pid = r.j.pid; D.host = r.j.host; guardarMesa(c, {tk: D.tk, pid: D.pid, host: D.host});
  }
  if (D.host === undefined) D.host = false;
  clearInterval(tickT); tickT = setInterval(tick, 250);
  await consultar();
}
function salirMesa() { clearTimeout(polT); clearInterval(tickT); D = null; lastId = ""; autoPedido = ""; }

async function contestar(k, r) {
  if (!D || yaContesto(k) || !D.pid) return;
  const t = now(), f = F();
  D.mias[k] = {r, ms: f && f.ab ? t - f.ab : 0};
  const all = store.get("lyaDueloResp") || {}; all[D.c] = D.mias; for (const c in all) if (!misMesas()[c]) delete all[c]; store.set("lyaDueloResp", all);
  pintar();
  try {
    const x = await fetch("api/duelo", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({a: "resp", c: D.c, tk: D.tk, k, r})});
    const j = await x.json().catch(() => ({}));
    if (x.ok && j.ms !== undefined && j.nuevo) D.mias[k].ms = j.ms;
    if (!x.ok && j.error === "tarde") { delete D.mias[k]; D.tardes = {...(D.tardes || {}), [k]: 1}; pintar(); }
  } catch (e) { delete D.mias[k]; pintar(); }
  planear(600);
}

/* ---------- prizes ---------- */
function premiar() {
  const s = D.s, m = s.mesa, js = s.jugadores, i = js.findIndex(p => p.pid === D.pid);
  if (i < 0 || !js[i].res.some(x => x >= 0)) return null;
  const P = prog(), key = `duelo:${D.c}:${m.creada}`;
  const xp = (m.xp?.todos || 0) + ([m.xp?.p1, m.xp?.p2, m.xp?.p3][i] || 0);
  const lg = m.logro && (m.logro.para === 30 || i < m.logro.para) ? m.logro : null;
  const {S} = st();
  if (!S.g.got?.[key]) {
    P.n++; if (i === 0 && js.length > 1) P.w++;
    if (lg) P.tr.unshift({ic: lg.ic, n: lg.n, pos: i + 1, d: new Date().toISOString().slice(0, 10), titulo: m.titulo});
    P.tr = P.tr.slice(0, 60);
    try { L().award(xp, key); } catch (e) { try { L().save(); } catch (e2) {} }
    try { dispatchEvent(new CustomEvent("lya:xp", {detail: {xp: 0, src: "duelo", ok: true}})); } catch (e) {}
  }
  return {xp, lg, pos: i + 1};
}

/* ---------- pages ---------- */
const head = (sub) => { const {S} = st(); return `<div class="ghead"><div><h1>⚔️ ${esc(s1("title", S.learn))}</h1>${S.know !== S.learn && both() ? `<p class="en">${esc(s1("title", S.know))}</p>` : ""}</div></div>${sub ? `<p class="du-lead">${TB("sub")}</p>` : ""}`; };

function hub(app) {
  const {S, CAT} = st(), u = cuenta()?.usuario, rol = cuenta()?.rol, profe = rol === "profe" || rol === "admin";
  const ls = cursos(); if (!ls.includes(OPC.lang)) OPC.lang = ls.includes(S.learn) ? S.learn : ls[0];
  const lvs = LV.filter(l => lecturas(OPC.lang, l).length); /* C1 only where the course has it */
  if (!lvs.includes(OPC.level)) OPC.level = lvs.includes(S.level) ? S.level : lvs[0] || "A1";
  const rs = lecturas(OPC.lang, OPC.level); if (!rs.some(r => r.file === OPC.file)) OPC.file = rs[0]?.file || null;
  const lname = l => esc(CAT.languages[l].name[S.learn] || CAT.languages[l].name.es);
  const sel = (name, vals, cur, fmt) => `<select name="${name}">${vals.map(v => `<option value="${v}" ${+cur === v ? "selected" : ""}>${fmt(v)}</option>`).join("")}</select>`;
  const P = prog();
  app.innerHTML = `<section class="wrap du">${head(true)}
    ${msgHub ? `<p class="du-err" role="alert">${T(msgHub)}</p>` : ""}
    ${!u ? `<div class="du-box"><p>${TB("need_acc")}</p><button class="btn main" data-du="login">🔑 ${T("login")}</button></div>` : `
    <div class="du-two">
    <form class="du-box du-join" id="du-join"><h2>🎟️ ${T("join")}</h2>
      <label for="du-code">${T("code")}</label>
      <input id="du-code" class="du-code" inputmode="numeric" autocomplete="off" maxlength="7" placeholder="123 456" pattern="[0-9 ]*">
      <p class="du-msg" id="du-jm" role="status"></p>
      <button class="btn main" type="submit">${T("join_b")} →</button></form>
    <form class="du-box du-new" id="du-new"><h2>⚔️ ${T("create")}</h2>
      <div class="du-row"><span>${T("lang")}</span><div class="du-seg">${ls.map(l => `<button type="button" class="btn" data-du="lang" data-l="${l}" aria-pressed="${l === OPC.lang}">${lname(l)}</button>`).join("")}</div></div>
      <div class="du-row"><span>${T("level")}</span><div class="du-seg">${lvs.map(l => `<button type="button" class="btn" data-du="lv" data-l="${l}" aria-pressed="${l === OPC.level}">${l}</button>`).join("")}</div></div>
      <p class="du-small">${T("pick")}</p>
      <div class="du-grid">${rs.length ? rs.map(r => `<button type="button" class="du-card" data-du="rd" data-f="${esc(r.file)}" aria-pressed="${r.file === OPC.file}" style="--c:${esc(r.t.color)}"><img src="${esc(r.art || r.t.art)}" alt="" loading="lazy"><span><b>${esc(r.t.name[OPC.lang] || r.t.name.es)}</b><small>${esc(r.title[OPC.lang] || r.title.es)}</small></span></button>`).join("") : `<p>${T("none_rd")}</p>`}</div>
      <fieldset class="du-opts"><legend>${T("opts")}</legend>
        <label>${T("t_q")} ${sel("D", [10, 15, 20, 30, 45, 60], OPC.D, v => v + " s")}</label>
        <label>${T("t_read")} ${sel("TL", [0, 30, 60, 90, 120, 180, 300], OPC.TL, v => v ? (v < 60 ? v + " s" : v / 60 + " min") : s1("no_read", S.learn))}</label>
        <label class="du-chk"><input type="checkbox" name="texto" ${OPC.texto ? "checked" : ""}> ${T("show_text")}</label>
        ${profe ? `<label class="du-chk"><input type="checkbox" name="juega" ${OPC.juega ? "checked" : ""}> ${T("i_play")}</label>` : ""}
      </fieldset>
      ${profe ? `<fieldset class="du-opts"><legend>🎁 ${T("prizes")}</legend>
        <div class="du-xp">${["todos", "p1", "p2", "p3"].map(k => `<label>${T(k === "todos" ? "xp_all" : "xp_" + k.slice(1))}<input type="number" name="xp_${k}" min="0" max="200" step="5" value="${+OPC.xp[k] || 0}"></label>`).join("")}</div>
        <p class="du-small">${T("ach")}</p>
        <div class="du-icons" role="group">${ICONS.map(ic => `<button type="button" class="btn" data-du="ic" data-i="${ic}" aria-pressed="${ic === OPC.logro.ic}">${ic}</button>`).join("")}</div>
        <label>${T("ach_name")}<input type="text" name="lg_n" maxlength="40" value="${esc(OPC.logro.n)}" placeholder="${esc(s1("ach_ph", S.learn))}"></label>
        <label>${T("ach_for")} ${sel("lg_para", [1, 3, 30], OPC.logro.para, v => s1(v === 1 ? "ach_1" : v === 3 ? "ach_3" : "ach_all", S.learn))}</label>
      </fieldset>` : `<p class="du-small">🎁 ${T("student_prizes")}</p>`}
      <p class="du-msg" id="du-nm" role="status"></p>
      <button class="btn main" type="submit" ${OPC.file ? "" : "disabled"}>⚔️ ${T("go_create")}</button></form>
    </div>`}
    ${P.n || P.tr.length ? `<div class="du-box"><h2>🏅 ${T("my_tr")}</h2><p class="du-small">${T("played", {n: P.n, w: P.w})}</p>
      ${P.tr.length ? `<div class="du-trs">${P.tr.map(x => `<div class="du-tr"><span class="du-tri">${esc(x.ic)}</span><span><b>${esc(x.n)}</b><small>${esc(x.titulo || "")} · ${x.pos}.º · ${esc(x.d)}</small></span></div>`).join("")}</div>` : ""}</div>` : ""}
  </section>`;
  msgHub = "";
  const jf = app.querySelector("#du-join");
  if (jf) jf.onsubmit = e => { e.preventDefault(); const c = jf.querySelector("input").value.replace(/\D/g, ""); if (c.length !== 6) { app.querySelector("#du-jm").innerHTML = T("bad_code"); return; } location.hash = "duelo-" + c; };
  const nf = app.querySelector("#du-new");
  if (nf) {
    const leer = () => { OPC.D = +nf.D.value; OPC.TL = +nf.TL.value; OPC.texto = nf.texto.checked; if (nf.juega) OPC.juega = nf.juega.checked;
      if (nf.xp_todos) { for (const k of ["todos", "p1", "p2", "p3"]) OPC.xp[k] = Math.max(0, Math.min(200, +nf["xp_" + k].value || 0)); OPC.logro.n = nf.lg_n.value.trim(); OPC.logro.para = +nf.lg_para.value; }
      guardarOpc(); };
    nf.onchange = leer;
    nf.onsubmit = async e => {
      e.preventDefault(); leer(); const b = nf.querySelector("[type=submit]"), m = app.querySelector("#du-nm"); b.disabled = true; m.textContent = "…";
      const r = await api("duelo", "POST", {a: "crear", file: OPC.file, D: OPC.D, TL: OPC.TL, texto: OPC.texto, juega: OPC.juega, xp: OPC.xp, logro: OPC.logro}).catch(() => ({ok: false, j: {}}));
      if (!r.ok) { b.disabled = false; m.innerHTML = r.code === 401 ? T("need_acc") : T("e_x"); return; }
      guardarMesa(r.j.c, {tk: r.j.tk, pid: OPC.juega || !(rol === "profe" || rol === "admin") ? r.j.pid : null, host: true});
      location.hash = "duelo-" + r.j.c;
    };
  }
}

/* duelo de mates (mates/grupo.js, #mates-duelo): las preguntas salen de mates/banco.js con una semilla; sin texto ni tiempo de lectura */
async function crearMates(spec, o = {}) {
  const rol = cuenta()?.rol, profe = rol === "profe" || rol === "admin";
  const r = await api("duelo", "POST", {a: "crear", mates: spec, D: o.D || 30, TL: 0, texto: false, juega: !!o.juega, xp: OPC.xp, logro: OPC.logro}).catch(() => ({ok: false, j: {}}));
  if (!r.ok) return r;
  guardarMesa(r.j.c, {tk: r.j.tk, pid: o.juega || !profe ? r.j.pid : null, host: true});
  location.hash = "duelo-" + r.j.c;
  return r;
}
function textoHTML() {
  if (!D.R) return "";
  return `<div class="du-text" lang="${esc(D.s.mesa.lang)}">${(D.R.text || []).map(p => `<p>${esc(plain(p))}</p>`).join("")}</div>`;
}
const timer = (f, total) => `<div class="du-timer"><span class="du-bar"><i id="du-bar" style="width:${100 * Math.max(0, f.hasta - now()) / (total * 1000)}%"></i></span><b id="du-left">${Math.max(0, Math.ceil((f.hasta - now()) / 1000))}</b></div>`;
const yo = () => D.s.jugadores.find(p => p.pid === D.pid);
function ranking(js, n, cls = "") {
  return `<ol class="du-rank ${cls}">${js.slice(0, n).map((p, i) => `<li class="${p.pid === D.pid ? "me" : ""}"><span class="du-pos">${i + 1}</span><span class="du-name">${esc(p.n)}${p.pid === D.pid ? ` <small>(${T("you")})</small>` : ""}</span>${p.ult ? `<small class="du-gain">+${p.ult}</small>` : ""}<b>${p.pts}</b></li>`).join("")}</ol>`;
}
function opcionesHTML(q, k, f, sol, dist) {
  const mia = D.mias[k], tot = dist ? Math.max(1, dist.reduce((a, b) => a + b, 0)) : 1;
  return `<div class="du-ops ${D.pid ? "" : "big"}">${q[1].map((o, i) => {
    const cls = [sol !== undefined ? (i === sol ? "right" : "wrong") : "", mia && mia.r === i ? "mine" : "", mia && mia.r !== i && sol === undefined ? "dim" : ""].join(" ");
    const dis = !D.pid || mia || f.f !== "q" || D.tardes?.[k];
    return `<button class="du-op ${cls}" style="--oc:${COL[i % 4]}" data-du="ans" data-k="${k}" data-r="${i}" ${dis ? "disabled" : ""}><span class="du-f" aria-hidden="true">${FORM[i % 4]}</span><span class="du-ot">${esc(plain(o))}</span>${dist ? `<span class="du-n">${dist[i] || 0}</span><span class="du-dist" style="width:${100 * (dist[i] || 0) / tot}%"></span>` : ""}</button>`;
  }).join("")}</div>`;
}
function sala(app) {
  const {S} = st(), s = D.s, m = s.mesa, f = F(), js = s.jugadores, host = D.host, n = js.length;
  lastId = f.id;
  const top = `<p class="du-small"><a href="#duelo">← ${T("title")}</a> · ${T("code")}: <b>${fmtCode(D.c)}</b> · ${esc(m.titulo)} · ${esc(m.nivel)}${host && !D.pid ? ` · 📺 ${T("host_screen")}` : ""}</p>`;
  let body = "";
  if (f.f === "lobby") {
    body = `<div class="du-box du-lobby"><h2>${T("lobby")}</h2><p>${T("lobby_how")}</p>
      <p class="du-bigcode" aria-label="${esc(D.c)}">${fmtCode(D.c)}</p><button class="btn" data-du="copy">📋 ${T("copy")}</button>
      <h3>${T("players")} · ${n} / ${s.max}</h3>
      <div class="du-chips">${js.map(p => `<span class="du-chip ${p.pid === D.pid ? "me" : ""}">${esc(p.n)}${host && p.pid !== D.pid ? `<button class="du-x" data-du="kick" data-p="${esc(p.pid)}" title="${esc(s1("kick", S.learn))}" aria-label="${esc(s1("kick", S.learn))}: ${esc(p.n)}">✕</button>` : ""}</span>`).join("")}</div>
      ${host ? `<div class="du-play"><button class="btn main du-go" data-du="next" data-de="lobby" ${n ? "" : "disabled"}>🚀 ${T("start")}</button><button class="btn" data-du="close">${T("close")}</button></div>` : `<p class="du-wait">⏳ ${T("wait_host", {h: esc(m.host)})}</p>`}</div>`;
  } else if (f.f === "read") {
    body = `<div class="du-box"><div class="du-top"><h2>📖 ${T("read")}</h2>${timer(f, m.TL)}</div><p class="du-small">${T("read_how")}</p>${textoHTML()}
      ${host ? `<div class="du-play"><button class="btn main" data-du="next" data-de="read">⚡ ${T("to_q")}</button></div>` : ""}</div>`;
  } else if (f.f === "q" || f.f === "r") {
    const k = f.k, q = D.R?.q?.[k];
    if (!q) { body = `<p class="msg">…</p>`; }
    else {
      const sol = f.f === "r" ? m.sol[k] : undefined, ya = js.filter(p => p.ya).length, me = D.pid ? yo() : null, mia = D.mias[k];
      let fb = "";
      if (f.f === "q" && D.pid) fb = mia ? `<p class="du-sent">✅ ${T("sent")}</p>` : D.tardes?.[k] ? `<p class="du-sent">⏰ ${T("late")}</p>` : "";
      if (f.f === "r" && D.pid && sol !== undefined) {
        const ok = mia && mia.r === sol, pos = js.findIndex(p => p.pid === D.pid) + 1;
        fb = `<div class="du-fb ${ok ? "ok" : "no"}"><b>${ok ? "🎉 " + T("ok") : mia ? "😬 " + T("bad") : "⏰ " + T("none")}</b>${me && me.ult ? ` <span class="du-gain">+${me.ult}</span>` : ""}${pos ? `<span>${T("pos", {n: pos, t: n})}</span>` : ""}</div>`;
      }
      body = `<div class="du-box du-q" style="--c:${COL[k % 4]}">
        <div class="du-top"><b>${T("q", {n: k + 1, t: m.nq})}</b>${f.f === "q" ? timer(f, m.D) : `<span class="du-small">${T("answered", {n: s.dist ? s.dist.reduce((a, b) => a + b, 0) : ya, t: n})}</span>`}</div>
        <h2 class="du-qt" lang="${esc(m.lang)}">${esc(plain(q[0]))}</h2>
        ${opcionesHTML(q, k, f, sol, f.f === "r" ? s.dist : null)}
        ${f.f === "q" ? `<p class="du-small" id="du-ya">${T("answered", {n: ya, t: n})}</p>` : ""}
        ${fb}
        ${f.f === "r" ? `<h3>🏆 ${T("top")}</h3>${ranking(js, host && !D.pid ? 10 : 5)}` : ""}
        ${host ? `<div class="du-play"><button class="btn main" data-du="next" data-de="${f.id}">⏭ ${T("next")}</button></div>` : ""}
        ${m.texto && f.f === "q" && D.pid ? `<details class="du-det"><summary>📖 ${T("see_text")}</summary>${textoHTML()}</details>` : ""}
      </div>`;
    }
  } else body = finHTML();
  app.innerHTML = `<section class="wrap du ${host && !D.pid ? "du-proj" : ""}">${top}${D.err === "e_net" ? `<p class="du-err">${T("e_net")}</p>` : ""}${body}</section>`;
}
function finHTML() {
  const s = D.s, m = s.mesa, js = s.jugadores, pr = D.pid ? premiar() : null;
  const pod = [1, 0, 2].filter(i => js[i]).map(i => `<div class="du-pod p${i + 1}"><span class="du-medal">${["🥇", "🥈", "🥉"][i]}</span><b>${esc(js[i].n)}</b><small>${js[i].pts} ${T("pts")}</small><i></i></div>`).join("");
  const tabla = D.host ? `<h3>${T("per_q")}</h3><div class="du-tablew"><table class="du-tabla"><thead><tr><th>#</th><th></th>${Array.from({length: m.nq}, (_, k) => `<th>${k + 1}</th>`).join("")}<th>${T("pts")}</th></tr></thead><tbody>${js.map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.n)}</td>${p.res.map(x => `<td class="${x === 1 ? "ok" : x === 0 ? "no" : ""}">${x === 1 ? "✓" : x === 0 ? "✗" : "–"}</td>`).join("")}<td><b>${p.pts}</b></td></tr>`).join("")}</tbody></table></div>` : "";
  return `<div class="du-box du-end"><h2>🏁 ${T("end")}</h2>
    ${m.st === "fin" && !js.some(p => p.res.some(x => x >= 0)) ? `<p>${T("closed")}</p>` : ""}
    <div class="du-podium" aria-label="${esc(s1("podium", st().S.learn))}">${pod}</div>
    ${pr ? `<div class="du-prize"><b>✨ ${T("you_won", {xp: pr.xp})}</b>${pr.lg ? `<span class="du-ach">${esc(pr.lg.ic)} ${T("you_ach", {m: esc(pr.lg.n)})}</span>` : ""}</div>` : ""}
    <h3>${T("final")}</h3>${ranking(js, 30)}${tabla}
    <div class="du-play"><a class="btn main" href="#duelo" style="text-decoration:none">⚔️ ${T("again")}</a></div></div>`;
}
function errorHTML(app) {
  app.innerHTML = `<section class="wrap du">${head(false)}<div class="du-box"><p class="du-err" role="alert">${T(D.err === "need_acc" ? "need_acc" : D.err)}</p>
    ${D.err === "need_acc" ? `<button class="btn main" data-du="login">🔑 ${T("login")}</button>` : ""}<p><a class="btn" href="#duelo" style="text-decoration:none">← ${T("title")}</a></p></div></section>`;
}

/* repaint: whole page on a phase change, only the counters otherwise (so a tap is never lost) */
let firma = "";
function pintar(forzar) {
  const app = document.getElementById("app"); if (!app || !D || !esDuelo(location.hash.slice(1))) return;
  if (!D.s) { if (D.err && D.err !== "e_net") errorHTML(app); return; }
  const f = F(), s = D.s;
  const sig = [f.id, s.jugadores.length, s.jugadores.map(p => p.pid + p.pts).join(), JSON.stringify(D.mias[f.k] || null), D.R ? 1 : 0, D.err, s.dist?.join(), s.mesa.st].join("|");
  if (!forzar && sig === firma && f.id === lastId) {
    const ya = document.getElementById("du-ya"); if (ya && f.f === "q") ya.innerHTML = T("answered", {n: s.jugadores.filter(p => p.ya).length, t: s.jugadores.length});
    return;
  }
  const scroll = f.id === lastId ? scrollY : 0;
  firma = sig; sala(app);
  if (scroll) scrollTo(0, scroll); else if (f.id !== "lobby") scrollTo(0, 0);
}

/* ---------- routing ---------- */
const parse = h => h === "duelo" ? {hub: true} : (h.match(/^duelo-(\d{6})$/) ? {c: h.slice(6)} : null);
const esDuelo = h => !!parse(h);
async function render(app) {
  const r = parse(location.hash.slice(1));
  if (!r || r.hub) { salirMesa(); if (cuenta()?.hayServidor && !(await cuenta().hayServidor())) { app.innerHTML = `<section class="wrap du">${head(true)}<div class="du-box"><p>${TB("no_server")}</p></div></section>`; return; } return hub(app); }
  if (D && D.c === r.c) { if (D.s) { firma = ""; return pintar(true); } if (D.err) return errorHTML(app); return; }
  salirMesa(); app.innerHTML = `<p class="msg">…</p>`;
  try { await entrarMesa(r.c); } catch (e) { D = D || {c: r.c}; D.err = "e_x"; }
  if (D && !D.s && D.err) errorHTML(app);
}
const tab = () => { const {S} = st(); return "⚔️ " + esc(s1("tab", S.learn)) + (both() ? `<span class="tk"> · ${esc(s1("tab", S.know))}</span>` : ""); };

/* ---------- clicks ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-du]"); if (!b) return;
  const a = b.dataset.du, app = document.getElementById("app");
  if (a === "login") { cuenta()?.abrir(); return; }
  if (a === "lang") { OPC.lang = b.dataset.l; OPC.file = null; guardarOpc(); hub(app); return; }
  if (a === "lv") { OPC.level = b.dataset.l; OPC.file = null; guardarOpc(); hub(app); return; }
  if (a === "rd") { OPC.file = b.dataset.f; guardarOpc(); app.querySelectorAll(".du-card").forEach(x => x.setAttribute("aria-pressed", x === b)); app.querySelector("#du-new [type=submit]")?.removeAttribute("disabled"); return; }
  if (a === "ic") { OPC.logro.ic = b.dataset.i; guardarOpc(); app.querySelectorAll("[data-du=ic]").forEach(x => x.setAttribute("aria-pressed", x === b)); return; }
  if (!D) return;
  if (a === "ans") contestar(+b.dataset.k, +b.dataset.r);
  else if (a === "next") { b.disabled = true; avanzar(b.dataset.de); }
  else if (a === "close") { b.disabled = true; api("duelo", "POST", {a: "cerrar", c: D.c}).finally(() => planear(100)); }
  else if (a === "kick") { b.disabled = true; api("duelo", "POST", {a: "echar", c: D.c, pid: b.dataset.p}).finally(() => planear(100)); }
  else if (a === "copy") { try { navigator.clipboard.writeText(D.c); b.textContent = "✓ " + s1("copied", st().S.learn); } catch (err) {} }
});
document.addEventListener("visibilitychange", () => { if (D && D.s && !document.hidden) planear(100); });
addEventListener("hashchange", () => { if (!esDuelo(location.hash.slice(1))) salirMesa(); });

window.LYADuelo = {render, isDuelo: esDuelo, tab, prog, fase, crearMates};
})();
