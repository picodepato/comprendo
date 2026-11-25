/* Concursos: preguntas tipo test para jugar en clase en directo (pantalla grande + móviles) o a solas.
   - Crear con IA: la web da un prompt para copiar en cualquier IA (ChatGPT, Claude, Gemini…) junto con un texto
     o la foto de la página del libro. Lo que responde la IA se pega aquí y salen las preguntas (concursos/formato.js).
   - También se crea o se corrige a mano en el editor.
   - Con cuenta se guardan en la base de datos (api/concursos); sin cuenta, en este aparato (localStorage "lyaConcursos").
   - En directo: quien proyecta abre una partida → código de 6 cifras; los alumnos entran desde el móvil (#jugar),
     máx. 30. Más puntos cuanto antes se acierte (lo mide el servidor) y ranking entre preguntas.
   Rutas: #concursos · #concursos-crear · #concursos-editar[-<id>] · #concurso-<id> · #concurso-solo-<id>
          · #concursos-proyectar-<código> · #jugar[-<código>] */
(() => {
const F = () => window.LYAFormatoConcurso;
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const $ = s => document.querySelector(s);
const STR = {
  es: {tab: "🏆 Concursos", h1: "Concursos", sub: "Preguntas tipo test para jugar en clase: la pregunta en la pantalla grande y cada uno contesta desde su móvil. Cuanto antes aciertas, más puntos.",
    unirse: "Unirse a una partida", codigo: "Código", tunombre: "Tu nombre", entrar: "Entrar",
    crearia: "✨ Crear con IA", crearmano: "✏️ Crear a mano", mios: "Mis concursos", ninguno: "Todavía no tienes concursos. Crea uno con IA en un minuto.",
    local: "Sin cuenta, tus concursos se guardan solo en este aparato. Entra con tu cuenta para guardarlos en la nube y abrirlos desde cualquier sitio.",
    subir: "Subir a mi cuenta", subidos: "Subidos a tu cuenta.", npreg: "{n} preguntas",
    proyectar: "📺 Jugar en directo", solo: "🎯 Jugar solo", editar: "✏️ Editar", enlace: "🔗 Copiar enlace", borrar: "🗑 Borrar", copiado: "Copiado.",
    seguro: "¿Borrar «{t}»? No se puede deshacer.", borrado: "Borrado.",
    paso1: "1. Copia este prompt", paso1b: "Pégalo en cualquier IA (ChatGPT, Claude, Gemini, Copilot…) y añade la foto de la página del libro o pega el texto.",
    cuantas: "Preguntas", idioma: "Idioma", mismo: "El del texto", nivel: "Nivel o curso (opcional)", nivelej: "p. ej. 2º de ESO, A2…",
    extra: "Algo más (opcional)", extraej: "p. ej. solo del tema 3, preguntas difíciles…", vf: "Alguna de verdadero/falso",
    copiar: "📋 Copiar el prompt", paso2: "2. Pega aquí lo que te responda la IA", pegaej: "TÍTULO: …\n---\nPREGUNTA: …\nA) …\nB) …\nC) …\nD) …\nCORRECTA: A\nTIEMPO: 20\n---",
    leer: "Crear el concurso", nada: "No he encontrado preguntas. Comprueba que has pegado toda la respuesta de la IA, con el formato PREGUNTA / A) B) C) D) / CORRECTA.",
    avisos: "Estas preguntas no se han podido leer y se han saltado:", a_pocas: "le faltan respuestas", a_sincorrecta: "falta la CORRECTA",
    formato: "Ver el formato", formatop: "También puedes escribirlo tú con este formato:",
    titulo: "Título del concurso", pregunta: "Pregunta {n}", textop: "Escribe la pregunta", respuesta: "Respuesta {l}", correcta: "Correcta",
    tiempo: "Tiempo", seg: "{n} s", masr: "+ Respuesta", menosr: "Quitar la última respuesta", subir1: "Subir", bajar1: "Bajar", quitar: "Quitar la pregunta",
    maspreg: "+ Añadir pregunta", guardar: "💾 Guardar", guardado: "Guardado.", comotexto: "Copiar como texto",
    e_titulo: "Ponle un título.", e_preg: "La pregunta {n} está incompleta: necesita texto, al menos 2 respuestas y la correcta marcada.", e_vacio: "Añade al menos una pregunta.",
    e_red: "No hay conexión con el servidor. Inténtalo otra vez.", e_cuenta: "Para guardarlo en la nube entra con tu cuenta. Se ha guardado en este aparato.",
    e_noexiste: "Este concurso no existe o se ha borrado.", e_demasiados: "Has llegado al máximo de concursos guardados. Borra alguno.",
    copia: "Guardar una copia en mis concursos", de: "Hecho por {u}",
    volver: "← Concursos", abriendo: "Abriendo la partida…", e_abrir: "No se ha podido abrir la partida.",
    entrad: "Entrad en", ycodigo: "y escribid el código", esperando: "Esperando jugadores…", jugadores: "{n} de 30 jugadores", empezar: "▶ Empezar",
    echar: "Toca un nombre para quitarlo.", pantalla: "⛶ Pantalla completa", cerrarp: "Terminar la partida",
    prepara: "¡Preparados!", contestadas: "{a} de {n} han contestado", pasar: "Pasar", siguiente: "Siguiente ▶", resultados: "Ver el ranking",
    ranking: "Ranking", podio: "¡Fin del concurso!", otra: "Jugar otra vez", final: "Ver la clasificación final",
    pdeq: "Pregunta {i} de {n}", nadie: "Aún no hay nadie.",
    j_dentro: "¡Ya estás dentro!", j_mira: "Mira la pantalla grande. Empezamos enseguida.", j_prep: "Mira la pregunta en la pantalla…",
    j_enviada: "¡Respuesta enviada!", j_espera: "Espera a los demás…", j_bien: "¡Correcto!", j_mal: "Incorrecto", j_tarde: "Se acabó el tiempo",
    j_puesto: "Vas en el puesto {p} de {n}", j_final: "Has quedado en el puesto {p} de {n}", j_pts: "{n} puntos", j_racha: "🔥 Racha de {n}",
    e_codigo: "Ese código no existe. Mira bien la pantalla.", e_nombre: "Escribe tu nombre (al menos 2 letras).", e_usado: "Ese nombre ya está en la partida. Ponte otro.",
    e_llena: "La partida está llena (30 jugadores).", e_terminado: "Esta partida ya ha terminado.", e_espera: "Demasiados intentos. Espera un poco.",
    salir: "Salir", s_fin: "¡Terminado!", s_res: "Has acertado {a} de {n}", s_pts: "{n} puntos", s_otra: "Otra vez", e_gen: "Algo ha fallado. Inténtalo otra vez."},
  en: {tab: "🏆 Quizzes", h1: "Quizzes", sub: "Multiple-choice quizzes to play in class: the question on the big screen and everyone answers on their phone. The faster you get it right, the more points.",
    unirse: "Join a game", codigo: "Code", tunombre: "Your name", entrar: "Join",
    crearia: "✨ Create with AI", crearmano: "✏️ Create by hand", mios: "My quizzes", ninguno: "You don't have any quizzes yet. Create one with AI in a minute.",
    local: "Without an account, your quizzes are only saved on this device. Sign in to save them in the cloud and open them anywhere.",
    subir: "Upload to my account", subidos: "Uploaded to your account.", npreg: "{n} questions",
    proyectar: "📺 Play live", solo: "🎯 Play alone", editar: "✏️ Edit", enlace: "🔗 Copy link", borrar: "🗑 Delete", copiado: "Copied.",
    seguro: "Delete “{t}”? This can't be undone.", borrado: "Deleted.",
    paso1: "1. Copy this prompt", paso1b: "Paste it into any AI (ChatGPT, Claude, Gemini, Copilot…) and add a photo of the textbook page or paste the text.",
    cuantas: "Questions", idioma: "Language", mismo: "Same as the text", nivel: "Level or year (optional)", nivelej: "e.g. Year 8, A2…",
    extra: "Anything else (optional)", extraej: "e.g. only unit 3, hard questions…", vf: "Some true/false",
    copiar: "📋 Copy the prompt", paso2: "2. Paste the AI's answer here", pegaej: "TÍTULO: …\n---\nPREGUNTA: …\nA) …\nB) …\nC) …\nD) …\nCORRECTA: A\nTIEMPO: 20\n---",
    leer: "Create the quiz", nada: "I couldn't find any questions. Check you pasted the whole answer, with the PREGUNTA / A) B) C) D) / CORRECTA format.",
    avisos: "These questions couldn't be read and were skipped:", a_pocas: "missing answers", a_sincorrecta: "missing CORRECTA",
    formato: "See the format", formatop: "You can also write it yourself in this format:",
    titulo: "Quiz title", pregunta: "Question {n}", textop: "Write the question", respuesta: "Answer {l}", correcta: "Correct",
    tiempo: "Time", seg: "{n} s", masr: "+ Answer", menosr: "Remove the last answer", subir1: "Up", bajar1: "Down", quitar: "Remove the question",
    maspreg: "+ Add question", guardar: "💾 Save", guardado: "Saved.", comotexto: "Copy as text",
    e_titulo: "Give it a title.", e_preg: "Question {n} is incomplete: it needs text, at least 2 answers and the correct one marked.", e_vacio: "Add at least one question.",
    e_red: "No connection to the server. Try again.", e_cuenta: "Sign in to save it in the cloud. It has been saved on this device.",
    e_noexiste: "This quiz doesn't exist or has been deleted.", e_demasiados: "You've reached the maximum number of saved quizzes. Delete some.",
    copia: "Save a copy in my quizzes", de: "Made by {u}",
    volver: "← Quizzes", abriendo: "Opening the game…", e_abrir: "The game couldn't be opened.",
    entrad: "Go to", ycodigo: "and type the code", esperando: "Waiting for players…", jugadores: "{n} of 30 players", empezar: "▶ Start",
    echar: "Tap a name to remove it.", pantalla: "⛶ Full screen", cerrarp: "End the game",
    prepara: "Get ready!", contestadas: "{a} of {n} have answered", pasar: "Skip", siguiente: "Next ▶", resultados: "See the ranking",
    ranking: "Ranking", podio: "Quiz finished!", otra: "Play again", final: "See the final ranking",
    pdeq: "Question {i} of {n}", nadie: "Nobody yet.",
    j_dentro: "You're in!", j_mira: "Look at the big screen. We'll start soon.", j_prep: "Look at the question on the screen…",
    j_enviada: "Answer sent!", j_espera: "Wait for the others…", j_bien: "Correct!", j_mal: "Wrong", j_tarde: "Time's up",
    j_puesto: "You're in position {p} of {n}", j_final: "You finished {p} of {n}", j_pts: "{n} points", j_racha: "🔥 Streak of {n}",
    e_codigo: "That code doesn't exist. Check the screen.", e_nombre: "Write your name (at least 2 letters).", e_usado: "That name is already in the game. Choose another.",
    e_llena: "The game is full (30 players).", e_terminado: "This game has already finished.", e_espera: "Too many attempts. Wait a little.",
    salir: "Leave", s_fin: "Finished!", s_res: "You got {a} of {n} right", s_pts: "{n} points", s_otra: "Again", e_gen: "Something went wrong. Try again."},
  ca: {tab: "🏆 Concursos", h1: "Concursos", sub: "Preguntes tipus test per jugar a classe: la pregunta a la pantalla gran i cadascú contesta des del mòbil. Com més aviat l'encertes, més punts.",
    unirse: "Unir-se a una partida", codigo: "Codi", tunombre: "El teu nom", entrar: "Entrar",
    crearia: "✨ Crear amb IA", crearmano: "✏️ Crear a mà", mios: "Els meus concursos", ninguno: "Encara no tens concursos. Crea'n un amb IA en un minut.",
    local: "Sense compte, els teus concursos només es guarden en aquest aparell. Entra amb el teu compte per guardar-los al núvol.",
    subir: "Pujar al meu compte", subidos: "Pujats al teu compte.", npreg: "{n} preguntes",
    proyectar: "📺 Jugar en directe", solo: "🎯 Jugar sol", editar: "✏️ Editar", enlace: "🔗 Copiar l'enllaç", borrar: "🗑 Esborrar", copiado: "Copiat.",
    seguro: "Esborrar «{t}»? No es pot desfer.", borrado: "Esborrat.",
    paso1: "1. Copia aquest prompt", paso1b: "Enganxa'l a qualsevol IA (ChatGPT, Claude, Gemini, Copilot…) i afegeix la foto de la pàgina del llibre o enganxa el text.",
    cuantas: "Preguntes", idioma: "Llengua", mismo: "La del text", nivel: "Nivell o curs (opcional)", nivelej: "p. ex. 2n d'ESO, A2…",
    extra: "Alguna cosa més (opcional)", extraej: "p. ex. només del tema 3, preguntes difícils…", vf: "Alguna de vertader/fals",
    copiar: "📋 Copiar el prompt", paso2: "2. Enganxa aquí el que et respongui la IA", pegaej: "TÍTULO: …\n---\nPREGUNTA: …\nA) …\nB) …\nC) …\nD) …\nCORRECTA: A\nTIEMPO: 20\n---",
    leer: "Crear el concurs", nada: "No he trobat preguntes. Comprova que has enganxat tota la resposta de la IA, amb el format PREGUNTA / A) B) C) D) / CORRECTA.",
    avisos: "Aquestes preguntes no s'han pogut llegir i s'han saltat:", a_pocas: "hi falten respostes", a_sincorrecta: "hi falta la CORRECTA",
    formato: "Veure el format", formatop: "També ho pots escriure tu amb aquest format:",
    titulo: "Títol del concurs", pregunta: "Pregunta {n}", textop: "Escriu la pregunta", respuesta: "Resposta {l}", correcta: "Correcta",
    tiempo: "Temps", seg: "{n} s", masr: "+ Resposta", menosr: "Treure l'última resposta", subir1: "Pujar", bajar1: "Baixar", quitar: "Treure la pregunta",
    maspreg: "+ Afegir pregunta", guardar: "💾 Guardar", guardado: "Guardat.", comotexto: "Copiar com a text",
    e_titulo: "Posa-li un títol.", e_preg: "La pregunta {n} està incompleta: necessita text, almenys 2 respostes i la correcta marcada.", e_vacio: "Afegeix almenys una pregunta.",
    e_red: "No hi ha connexió amb el servidor. Torna-ho a provar.", e_cuenta: "Per guardar-lo al núvol entra amb el teu compte. S'ha guardat en aquest aparell.",
    e_noexiste: "Aquest concurs no existeix o s'ha esborrat.", e_demasiados: "Has arribat al màxim de concursos guardats. Esborra'n algun.",
    copia: "Guardar una còpia als meus concursos", de: "Fet per {u}",
    volver: "← Concursos", abriendo: "Obrint la partida…", e_abrir: "No s'ha pogut obrir la partida.",
    entrad: "Entreu a", ycodigo: "i escriviu el codi", esperando: "Esperant jugadors…", jugadores: "{n} de 30 jugadors", empezar: "▶ Començar",
    echar: "Toca un nom per treure'l.", pantalla: "⛶ Pantalla completa", cerrarp: "Acabar la partida",
    prepara: "Preparats!", contestadas: "{a} de {n} han contestat", pasar: "Passar", siguiente: "Següent ▶", resultados: "Veure el rànquing",
    ranking: "Rànquing", podio: "Fi del concurs!", otra: "Tornar a jugar", final: "Veure la classificació final",
    pdeq: "Pregunta {i} de {n}", nadie: "Encara no hi ha ningú.",
    j_dentro: "Ja hi ets!", j_mira: "Mira la pantalla gran. Comencem de seguida.", j_prep: "Mira la pregunta a la pantalla…",
    j_enviada: "Resposta enviada!", j_espera: "Espera els altres…", j_bien: "Correcte!", j_mal: "Incorrecte", j_tarde: "S'ha acabat el temps",
    j_puesto: "Vas en la posició {p} de {n}", j_final: "Has quedat en la posició {p} de {n}", j_pts: "{n} punts", j_racha: "🔥 Ratxa de {n}",
    e_codigo: "Aquest codi no existeix. Mira bé la pantalla.", e_nombre: "Escriu el teu nom (almenys 2 lletres).", e_usado: "Aquest nom ja és a la partida. Posa-te'n un altre.",
    e_llena: "La partida és plena (30 jugadors).", e_terminado: "Aquesta partida ja ha acabat.", e_espera: "Massa intents. Espera una mica.",
    salir: "Sortir", s_fin: "Acabat!", s_res: "N'has encertat {a} de {n}", s_pts: "{n} punts", s_otra: "Una altra vegada", e_gen: "Alguna cosa ha fallat. Torna-ho a provar."}
};
const lang = () => { try { const l = st().S.learn; return STR[l] ? l : (STR[st().S.know] ? st().S.know : "es"); } catch (e) { return "es"; } };
const t = (k, v) => { let o = STR[lang()][k] ?? STR.es[k] ?? k; for (const x in v || {}) o = o.split(`{${x}}`).join(v[x]); return o; };
const T = (k, v) => esc(t(k, v));
const SIMB = ["★", "♥", "☾", "✚"];
const barra = (quedan, s, parado) => `<div class="cc-tiempo"><i class="${parado ? "parado" : ""}" style="--f:${Math.max(0, Math.min(1, quedan / (s * 1000))).toFixed(3)};animation-duration:${Math.round(quedan)}ms"></i></div>`;
const opcHTML = (o, i, extra = "") => `<span class="cc-sim" aria-hidden="true">${SIMB[i]}</span><span class="cc-ot">${esc(o)}</span>${extra}`;

/* ---------- datos ---------- */
const store = {get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }};
const LKEY = "lyaConcursos", HKEY = "lyaCcHost", JKEY = "lyaCcJug";
const locales = () => store.get(LKEY, []);
const cuenta = () => window.LYACuentas && window.LYACuentas.usuario ? window.LYACuentas : null;
async function api(ruta, datos) {
  if (window.LYACuentas) return window.LYACuentas.api(ruta, datos ? "POST" : "GET", datos);
  const r = await fetch("api/" + ruta, {method: datos ? "POST" : "GET", headers: {"Content-Type": "application/json"}, body: datos ? JSON.stringify(datos) : undefined});
  let j = {}; try { j = await r.json(); } catch (e) {} return {ok: r.ok, code: r.status, j};
}
const idLocal = () => "l" + Array.from(crypto.getRandomValues(new Uint8Array(5)), b => b.toString(16).padStart(2, "0")).join("");
async function cargar(id) {
  if (id.startsWith("l")) { const c = locales().find(x => x.id === id); return c ? {c, mio: true} : null; }
  const r = await api("concursos?id=" + encodeURIComponent(id)).catch(() => null);
  if (!r) throw new Error("red");
  return r.ok ? {c: r.j.concurso, mio: r.j.mio} : null;
}
function aviso(txt, mal) {
  const el = $("#cc-msg"); if (!el) return;
  el.textContent = txt; el.className = "cc-msg" + (mal ? " mal" : " bien"); el.hidden = false;
}
async function copiar(txt) {
  try { await navigator.clipboard.writeText(txt); return true; }
  catch (e) { const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (e2) {} ta.remove(); return ok; }
}
const xp = (n, extra) => { try { dispatchEvent(new CustomEvent("lya:xp", {detail: {xp: n, src: "concurso", ...extra}})); } catch (e) {} };

/* ---------- rutas ---------- */
const RE = /^(concursos|concursos-crear|concursos-editar(?:-(l?[a-f0-9]{10,12}))?|concurso-(l?[a-f0-9]{10,12})|concurso-solo-(l?[a-f0-9]{10,12})|concursos-proyectar-(\d{6})|jugar(?:-(\d{6}))?)$/;
const isCc = h => RE.test(h);
let V = {h: ""}; /* estado de la página actual */
let timer = null;
const G = {tras: null}; /* mensaje para la página siguiente */
const parar = () => { clearTimeout(timer); timer = null; document.body.classList.remove("cc-grande"); };
addEventListener("hashchange", () => { if (!isCc(location.hash.slice(1))) { parar(); V = {h: ""}; } });

function render(app) {
  const h = location.hash.slice(1), m = h.match(RE);
  if (!m) return;
  if (V.h !== h) { parar(); V = {h}; }
  V.app = app;
  if (h === "concursos") return inicio(app);
  if (h === "concursos-crear") return crear(app);
  if (h.startsWith("concursos-editar")) return editor(app, m[2]);
  if (m[3]) return ficha(app, m[3]);
  if (m[4]) return solo(app, m[4]);
  if (m[5]) return proyectar(app, m[5]);
  return jugar(app, m[6]);
}
const cab = (titulo, atras = "#concursos") => `<a class="cc-back" href="${atras}">${T("volver")}</a><h1 class="cc-h1">${titulo}</h1>`;

/* ---------- inicio ---------- */
async function inicio(app) {
  const ls = locales(), C = cuenta();
  app.innerHTML = `<section class="wrap cc">
    <div class="ghead"><h1 class="cc-h1">🏆 ${T("h1")}</h1></div>
    <p class="cc-lead">${T("sub")}</p>
    <form class="cc-unir" id="cc-unir"><h2>📱 ${T("unirse")}</h2>
      <div class="cc-fila"><label>${T("codigo")}<input name="codigo" inputmode="numeric" pattern="\\d{6}" maxlength="6" autocomplete="off" placeholder="123456" required></label>
      <button class="btn main">${T("entrar")}</button></div></form>
    <div class="cc-crea"><a class="btn main cc-big" href="#concursos-crear">${T("crearia")}</a><a class="btn cc-big" href="#concursos-editar">${T("crearmano")}</a></div>
    <h2 class="cc-h2">${T("mios")}</h2><p class="cc-msg" id="cc-msg" hidden></p>
    <div class="cc-lista" id="cc-lista">${C ? `<p class="cc-small">…</p>` : ""}</div>
    ${!C && ls.length ? `<p class="cc-small">${T("local")}</p>` : ""}
  </section>`;
  app.querySelector("#cc-unir").onsubmit = e => { e.preventDefault(); const c = e.target.codigo.value.replace(/\D/g, ""); if (c.length === 6) location.hash = "jugar-" + c; };
  let nube = [];
  if (C) { const r = await api("concursos?mios=1").catch(() => null); if (r && r.ok) nube = r.j.concursos || []; }
  if (V.h !== "concursos") return;
  const todos = [...nube.map(x => ({...x, nube: true})), ...ls.map(x => ({id: x.id, titulo: x.titulo, n: x.preguntas.length, f: x.f}))];
  const el = app.querySelector("#cc-lista");
  el.innerHTML = todos.length ? todos.map(x => `<article class="cc-item"><a class="cc-it" href="#concurso-${esc(x.id)}"><b>${esc(x.titulo)}</b><small>${T("npreg", {n: x.n})}${x.nube ? " · ☁️" : " · 📱"}</small></a>
      <div class="cc-acc"><a class="btn main" href="#concurso-${esc(x.id)}" data-cc="directo" data-id="${esc(x.id)}">${T("proyectar")}</a><a class="btn" href="#concurso-solo-${esc(x.id)}">${T("solo")}</a></div></article>`).join("")
    + (C && ls.length ? `<button class="btn" data-cc="subir">☁️ ${T("subir")} (${ls.length})</button>` : "")
    : `<p class="cc-vacio">${T("ninguno")}</p>`;
}

/* ---------- crear con IA ---------- */
function crear(app) {
  const o = V.op || (V.op = {n: 10, idioma: "", nivel: "", tema: "", vf: false});
  const IDS = ["", "es", "en", "ca", "fr", "de", "it", "pt"], NOM = {es: "Español", en: "English", ca: "Català", fr: "Français", de: "Deutsch", it: "Italiano", pt: "Português"};
  app.innerHTML = `<section class="wrap cc">${cab(T("crearia"))}
    <div class="cc-paso"><h2>${T("paso1")}</h2><p class="cc-small">${T("paso1b")}</p>
      <div class="cc-ops">
        <label>${T("cuantas")}<select data-op="n">${[5, 8, 10, 12, 15, 20, 25, 30].map(n => `<option${n === o.n ? " selected" : ""}>${n}</option>`).join("")}</select></label>
        <label>${T("idioma")}<select data-op="idioma">${IDS.map(i => `<option value="${i}"${i === o.idioma ? " selected" : ""}>${i ? NOM[i] : T("mismo")}</option>`).join("")}</select></label>
        <label>${T("nivel")}<input data-op="nivel" maxlength="40" value="${esc(o.nivel)}" placeholder="${T("nivelej")}"></label>
        <label class="cc-ancho">${T("extra")}<input data-op="tema" maxlength="120" value="${esc(o.tema)}" placeholder="${T("extraej")}"></label>
        <label class="cc-chk"><input type="checkbox" data-op="vf"${o.vf ? " checked" : ""}> ${T("vf")}</label>
      </div>
      <textarea class="cc-prompt" id="cc-prompt" readonly rows="9">${esc(F().prompt(o))}</textarea>
      <button class="btn main" data-cc="copiarprompt">${T("copiar")}</button> <span class="cc-ok" id="cc-copiado" hidden>✓ ${T("copiado")}</span>
    </div>
    <div class="cc-paso"><h2>${T("paso2")}</h2>
      <textarea class="cc-pega" id="cc-pega" rows="10" placeholder="${esc(t("pegaej"))}">${esc(V.pegado || "")}</textarea>
      <p class="cc-msg" id="cc-msg" hidden></p>
      <button class="btn main" data-cc="leer">${T("leer")}</button>
      <details class="cc-fmt"><summary>${T("formato")}</summary><p class="cc-small">${T("formatop")}</p><pre>${esc(F().escribir({titulo: "Los volcanes", preguntas: [{p: "¿Qué sale de un volcán en erupción?", o: ["Lava", "Nieve", "Agua", "Arena"], c: 0, s: 20}, {p: "El Teide está en Canarias.", o: ["Verdadero", "Falso"], c: 0, s: 15}]}))}</pre></details>
    </div></section>`;
  const pinta = () => { app.querySelector("#cc-prompt").value = F().prompt(o); };
  app.querySelectorAll("[data-op]").forEach(el => el.addEventListener(el.tagName === "INPUT" && el.type !== "checkbox" ? "input" : "change", () => {
    const k = el.dataset.op; o[k] = el.type === "checkbox" ? el.checked : k === "n" ? +el.value : el.value; pinta();
  }));
  app.querySelector("#cc-pega").addEventListener("input", e => { V.pegado = e.target.value; });
}
function leerPegado() {
  const r = F().leer(V.pegado || "");
  if (!r.preguntas.length) return aviso(t("nada"), true);
  E = {id: null, titulo: r.titulo || "", preguntas: r.preguntas, avisos: r.avisos};
  location.hash = "concursos-editar";
}

/* ---------- editor ---------- */
let E = null; /* {id, titulo, preguntas, avisos} */
const nuevaP = () => ({p: "", o: ["", "", "", ""], c: 0, s: 20});
async function editor(app, id) {
  if (!E || (id && E.id !== id)) {
    if (id) {
      app.innerHTML = `<p class="msg">…</p>`;
      const r = await cargar(id).catch(() => null);
      if (V.app !== app || !location.hash.endsWith(id)) return;
      if (!r) { app.innerHTML = `<section class="wrap cc">${cab("")}<p class="cc-msg mal">${T("e_noexiste")}</p></section>`; return; }
      E = {id: r.mio ? id : null, titulo: r.c.titulo, preguntas: JSON.parse(JSON.stringify(r.c.preguntas))};
    } else E = {id: null, titulo: "", preguntas: [nuevaP()]};
  }
  pintarEditor(app);
}
function pintarEditor(app) {
  const L2 = F().LETRAS, TIEMPOS = [5, 10, 15, 20, 30, 45, 60, 90, 120];
  app.innerHTML = `<section class="wrap cc">${cab("✏️ " + (E.titulo ? esc(E.titulo) : T("crearmano")))}
    ${E.avisos && E.avisos.length ? `<div class="cc-msg mal"><p>${T("avisos")}</p><ul>${E.avisos.map(a => `<li>${esc(a.p || "?")} — ${T("a_" + a.k)}</li>`).join("")}</ul></div>` : ""}
    <label class="cc-lab">${T("titulo")}<input class="cc-tit" data-e="titulo" maxlength="80" value="${esc(E.titulo)}"></label>
    ${E.preguntas.map((q, i) => `<fieldset class="cc-q"><legend>${T("pregunta", {n: i + 1})}</legend>
      <textarea data-e="p" data-i="${i}" maxlength="200" rows="2" placeholder="${T("textop")}">${esc(q.p)}</textarea>
      <div class="cc-os">${q.o.map((o, j) => `<label class="cc-o cc-c${j}"><input type="radio" name="c${i}" data-e="c" data-i="${i}" data-j="${j}"${q.c === j ? " checked" : ""} aria-label="${T("correcta")}"><span class="cc-sim" aria-hidden="true">${SIMB[j]}</span><input data-e="o" data-i="${i}" data-j="${j}" maxlength="90" value="${esc(o)}" placeholder="${T("respuesta", {l: L2[j]})}"></label>`).join("")}</div>
      <div class="cc-qbar"><span class="cc-small">◉ = ${T("correcta")}</span>
        <label>⏱ <select data-e="s" data-i="${i}">${TIEMPOS.map(s => `<option value="${s}"${s === q.s ? " selected" : ""}>${T("seg", {n: s})}</option>`).join("")}</select></label>
        ${q.o.length < 4 ? `<button type="button" class="btn" data-cc="masr" data-i="${i}">${T("masr")}</button>` : ""}
        ${q.o.length > 2 ? `<button type="button" class="btn" data-cc="menosr" data-i="${i}" title="${T("menosr")}">− ${L2[q.o.length - 1]}</button>` : ""}
        <span class="cc-sp"></span>
        <button type="button" class="btn" data-cc="arriba" data-i="${i}" title="${T("subir1")}" aria-label="${T("subir1")}"${i ? "" : " disabled"}>↑</button>
        <button type="button" class="btn" data-cc="abajo" data-i="${i}" title="${T("bajar1")}" aria-label="${T("bajar1")}"${i < E.preguntas.length - 1 ? "" : " disabled"}>↓</button>
        <button type="button" class="btn" data-cc="quitarp" data-i="${i}" title="${T("quitar")}" aria-label="${T("quitar")}">🗑</button></div>
    </fieldset>`).join("")}
    <button class="btn" data-cc="masp">${T("maspreg")}</button>
    <div class="cc-guardar"><p class="cc-msg" id="cc-msg" hidden></p><button class="btn main cc-big" data-cc="guardar">${T("guardar")}</button><button class="btn" data-cc="comotexto">${T("comotexto")}</button></div>
  </section>`;
  app.querySelectorAll("[data-e]").forEach(el => el.addEventListener(el.type === "radio" || el.tagName === "SELECT" ? "change" : "input", () => {
    const k = el.dataset.e, i = +el.dataset.i, j = +el.dataset.j;
    if (k === "titulo") E.titulo = el.value;
    else if (k === "p") E.preguntas[i].p = el.value;
    else if (k === "o") E.preguntas[i].o[j] = el.value;
    else if (k === "c") E.preguntas[i].c = j;
    else if (k === "s") E.preguntas[i].s = +el.value;
  }));
}
function revisar() {
  const titulo = (E.titulo || "").trim();
  if (!titulo) return [t("e_titulo")];
  if (!E.preguntas.length) return [t("e_vacio")];
  const preguntas = [];
  for (let i = 0; i < E.preguntas.length; i++) {
    const q = E.preguntas[i], o = q.o.map(x => x.trim());
    /* las respuestas vacías del final se quitan solas */
    while (o.length > 2 && !o[o.length - 1] && q.c < o.length - 1) o.pop();
    if (!q.p.trim() || o.some(x => !x) || q.c >= o.length) return [t("e_preg", {n: i + 1})];
    preguntas.push({p: q.p.trim(), o, c: q.c, s: q.s});
  }
  const c = F().validar({titulo, preguntas});
  return c ? [null, c] : [t("e_preg", {n: 1})];
}
async function guardar() {
  const [err, c] = revisar(); if (err) return aviso(err, true);
  const btn = $("[data-cc=guardar]"); if (btn) btn.disabled = true;
  let id = null, msg = "guardado", mal = false;
  if (cuenta() && !(E.id && E.id.startsWith("l"))) {
    const r = await api("concursos", {accion: "guardar", id: E.id || undefined, concurso: c}).catch(() => null);
    if (r && r.ok) id = r.j.id;
    else if (r && r.code === 413) { if (btn) btn.disabled = false; return aviso(t("e_demasiados"), true); }
    else { msg = "e_red"; mal = true; }
  }
  if (!id) {
    id = E.id && E.id.startsWith("l") ? E.id : idLocal();
    store.set(LKEY, [{id, ...c, f: Date.now()}, ...locales().filter(x => x.id !== id)]);
    if (!cuenta()) { msg = "e_cuenta"; mal = true; }
  }
  E = null; location.hash = "concurso-" + id;
  G.tras = [t(msg), mal];
}

/* ---------- ficha de un concurso ---------- */
async function ficha(app, id) {
  app.innerHTML = `<p class="msg">…</p>`;
  const tras = G.tras; G.tras = null;
  let r; try { r = await cargar(id); } catch (e) { app.innerHTML = `<section class="wrap cc">${cab("")}<p class="cc-msg mal">${T("e_red")}</p></section>`; return; }
  if (V.h !== "concurso-" + id) return;
  if (!r) { app.innerHTML = `<section class="wrap cc">${cab("")}<p class="cc-msg mal">${T("e_noexiste")}</p></section>`; return; }
  V.c = r.c; V.id = id;
  const c = r.c;
  app.innerHTML = `<section class="wrap cc">${cab(esc(c.titulo))}
    <p class="cc-small">${T("npreg", {n: c.preguntas.length})}${c.autor && !r.mio ? " · " + T("de", {u: c.autor}) : ""}${id.startsWith("l") ? " · 📱" : " · ☁️"}</p>
    <p class="cc-msg" id="cc-msg" hidden></p>
    <div class="cc-crea"><button class="btn main cc-big" data-cc="directo" data-id="${esc(id)}">${T("proyectar")}</button><a class="btn cc-big" href="#concurso-solo-${esc(id)}">${T("solo")}</a></div>
    <div class="cc-acc">${r.mio ? `<a class="btn" href="#concursos-editar-${esc(id)}">${T("editar")}</a>` : `<button class="btn" data-cc="copia">${T("copia")}</button>`}
      ${id.startsWith("l") ? "" : `<button class="btn" data-cc="enlace">${T("enlace")}</button>`}<button class="btn" data-cc="comotexto">${T("comotexto")}</button>
      ${r.mio ? `<button class="btn" data-cc="borrar">${T("borrar")}</button>` : ""}</div>
    <ol class="cc-ver">${c.preguntas.map(q => `<li><b>${esc(q.p)}</b> <small>⏱ ${q.s} s</small><ul>${q.o.map((o, j) => `<li class="${j === q.c ? "cc-si" : ""}">${opcHTML(o, j, j === q.c ? " ✓" : "")}</li>`).join("")}</ul></li>`).join("")}</ol>
  </section>`;
  if (tras) aviso(...tras);
}

/* ---------- jugar solo ---------- */
async function solo(app, id) {
  if (!V.s) {
    const r = await cargar(id).catch(() => null);
    if (V.h !== "concurso-solo-" + id) return;
    if (!r) { app.innerHTML = `<section class="wrap cc">${cab("")}<p class="cc-msg mal">${T("e_noexiste")}</p></section>`; return; }
    V.s = {c: r.c, i: 0, pts: 0, ok: 0, ra: 0, fase: "pregunta", t0: Date.now()};
  }
  pintarSolo(app);
}
function pintarSolo(app) {
  const s = V.s, c = s.c, q = c.preguntas[s.i];
  clearTimeout(timer);
  if (s.fase === "fin") {
    app.innerHTML = `<section class="wrap cc">${cab(esc(c.titulo))}<div class="cc-fin"><h2>🏁 ${T("s_fin")}</h2><p class="cc-gran">${T("s_pts", {n: s.pts})}</p><p>${T("s_res", {a: s.ok, n: c.preguntas.length})}</p>
      <button class="btn main" data-cc="solootra">${T("s_otra")}</button> <a class="btn" href="#concurso-${esc(V.h.slice(14))}">${T("volver").replace("←", "").trim()}</a></div></section>`;
    return;
  }
  const quedan = Math.max(0, q.s * 1000 - (Date.now() - s.t0));
  app.innerHTML = `<section class="wrap cc cc-solo">${cab(esc(c.titulo))}
    <div class="cc-sbar"><span>${T("pdeq", {i: s.i + 1, n: c.preguntas.length})}</span><b>${T("j_pts", {n: s.pts})}</b></div>
    ${barra(quedan, q.s, s.fase !== "pregunta")}
    <h2 class="cc-preg">${esc(q.p)}</h2>
    <div class="cc-botones n${q.o.length}">${q.o.map((o, j) => `<button class="cc-b cc-c${j}${s.fase === "res" ? (j === q.c ? " si" : j === s.elegida ? " no" : " apag") : ""}" data-cc="solor" data-j="${j}"${s.fase !== "pregunta" ? " disabled" : ""}>${opcHTML(o, j)}</button>`).join("")}</div>
    ${s.fase === "res" ? `<div class="cc-resj ${s.ult > 0 ? "si" : "no"}"><b>${s.elegida == null ? T("j_tarde") : s.ult > 0 ? T("j_bien") : T("j_mal")}</b>${s.ult > 0 ? ` +${s.ult}` : ""}${s.ra > 1 ? ` · ${T("j_racha", {n: s.ra})}` : ""}</div>
      <button class="btn main cc-big" data-cc="solosig">${s.i + 1 < c.preguntas.length ? T("siguiente") : T("final")}</button>` : ""}
  </section>`;
  if (s.fase === "pregunta") timer = setTimeout(() => responderSolo(null), quedan);
}
function responderSolo(j) {
  const s = V.s; if (!s || s.fase !== "pregunta") return;
  const q = s.c.preguntas[s.i], ms = Date.now() - s.t0, ok = j === q.c;
  s.ra = ok ? s.ra + 1 : 0;
  s.ult = ok ? F().puntos(ms, q.s) + Math.min(300, Math.max(0, s.ra - 1) * 100) : 0;
  s.pts += s.ult; if (ok) s.ok++;
  s.elegida = j; s.fase = "res";
  xp(ok ? 2 : 0, {ok});
  pintarSolo(V.app);
}

/* ---------- en directo: abrir ---------- */
async function abrirDirecto(id) {
  const c = V.c && V.id === id ? V.c : (await cargar(id).catch(() => null))?.c;
  if (!c) return aviso(t("e_noexiste"), true);
  aviso(t("abriendo"));
  const r = await api("concursos", id.startsWith("l") ? {accion: "abrir", concurso: c} : {accion: "abrir", id}).catch(() => null);
  if (!r || !r.ok) return aviso(r && r.code === 429 ? t("e_espera") : t("e_abrir"), true);
  const hs = store.get(HKEY, {}); hs[r.j.codigo] = {clave: r.j.clave, id, f: Date.now()};
  for (const k in hs) if (Date.now() - (hs[k].f || 0) > 864e5) delete hs[k];
  store.set(HKEY, hs);
  location.hash = "concursos-proyectar-" + r.j.codigo;
}

/* ---------- en directo: pantalla grande ---------- */
const urlJuego = () => location.origin + location.pathname.replace(/index\.html$/, "");
function proyectar(app, cod) {
  const h = store.get(HKEY, {})[cod];
  if (!h) { app.innerHTML = `<section class="wrap cc">${cab("")}<p class="cc-msg mal">${T("e_codigo")}</p></section>`; return; }
  document.body.classList.add("cc-grande");
  if (!V.p) { V.p = {cod, clave: h.clave, id: h.id, e: null}; sondeoHost(); }
  else pintarHost();
}
async function sondeoHost() {
  const P = V.p; if (!P) return;
  const h = V.h;
  try {
    const r = await fetch(`api/concursos?sala=${P.cod}&clave=${encodeURIComponent(P.clave)}`, {cache: "no-store"});
    const j = await r.json().catch(() => ({}));
    if (V.h !== h) return;
    if (r.ok) { P.e = j; P.off = j.ahora - Date.now(); P.err = 0; } else if (r.status === 404) { P.e = {fase: "cerrada"}; }
  } catch (e) { P.err = (P.err || 0) + 1; }
  pintarHost();
  const e = P.e || {};
  if (e.fase === "pregunta") {
    const fin = e.t0 + e.pregunta.s * 1000 - ahoraSrv(P);
    if (fin <= 0 || (e.contestadas >= e.njug && e.njug > 0)) { if (!P.pasando) return pasarHost(); }
  }
  if (e.fase === "espera" || e.fase === "pregunta") timer = setTimeout(sondeoHost, e.fase === "espera" ? 2000 : 1000);
}
const ahoraSrv = P => Date.now() + (P.off || 0);
async function pasarHost() {
  const P = V.p; if (!P || P.pasando) return; P.pasando = true;
  clearTimeout(timer);
  const r = await api("concursos", {accion: "pasar", codigo: P.cod, clave: P.clave}).catch(() => null);
  P.pasando = false;
  if (r && r.ok) { P.e = {...P.e, ...r.j}; if (r.j.fase !== "pregunta") delete P.e.contestadas; P.off = r.j.ahora - Date.now(); }
  pintarHost();
  if (P.e && (P.e.fase === "pregunta" || P.e.fase === "espera")) timer = setTimeout(sondeoHost, 1000);
}
function rankHTML(rk, max = 5, deltas = true) {
  return `<ol class="cc-rank">${rk.slice(0, max).map((x, i) => `<li><span class="cc-pos">${i + 1}</span><span class="cc-nom">${esc(x.n)}</span>${deltas && x.d ? `<small>+${x.d}</small>` : ""}<b>${x.pts}</b></li>`).join("")}</ol>`;
}
function pintarHost() {
  const P = V.p, app = V.app; if (!P || !app) return;
  const e = P.e || {}, top = `<div class="cc-htop"><a class="cc-back" href="#concurso-${esc(P.id || "")}" data-cc="salirhost">${T("volver")}</a><span class="cc-hcod">${T("codigo")}: <b>${P.cod}</b></span><button class="btn" data-cc="pantalla">${T("pantalla")}</button></div>`;
  if (!P.e) { app.innerHTML = `<section class="cc-h">${top}<p class="msg">${T("abriendo")}</p></section>`; return; }
  if (e.fase === "cerrada") { app.innerHTML = `<section class="cc-h">${top}<p class="cc-msg mal">${T("e_terminado")}</p><a class="btn" href="#concursos">${T("volver")}</a></section>`; return; }
  const js = e.jugadores || [];
  V.firma = e.fase === "pregunta" ? V.firma : "";
  if (e.fase === "espera") {
    app.innerHTML = `<section class="cc-h cc-lobby">${top}<h1 class="cc-htit">${esc(e.titulo)}</h1>
      <div class="cc-entra"><p>${T("entrad")} <b>${esc(urlJuego().replace(/^https?:\/\//, ""))}#jugar</b> ${T("ycodigo")}</p><div class="cc-codigo">${P.cod.slice(0, 3)} ${P.cod.slice(3)}</div></div>
      <p class="cc-cuenta">${js.length ? T("jugadores", {n: js.length}) : T("esperando")}</p>
      <div class="cc-chips">${js.map(n => `<button class="cc-chip" data-cc="echar" data-n="${esc(n)}">${esc(n)}</button>`).join("")}</div>
      ${js.length ? `<p class="cc-small">${T("echar")}</p>` : ""}
      <div class="cc-hacc"><button class="btn main cc-big" data-cc="pasar"${js.length ? "" : " disabled"}>${T("empezar")}</button></div></section>`;
    return;
  }
  if (e.fase === "pregunta" || e.fase === "resultado") {
    const q = e.pregunta, falta = e.t0 - ahoraSrv(P), res = e.fase === "resultado";
    if (!res && falta > 0) {
      V.firma = "";
      app.innerHTML = `<section class="cc-h">${top}<p class="cc-pdeq">${T("pdeq", {i: e.i + 1, n: e.total})}</p><h1 class="cc-hpreg">${esc(q.p)}</h1><div class="cc-cuentaatras">${Math.ceil(falta / 1000)}</div><p class="cc-cuenta">${T("prepara")}</p></section>`;
      clearTimeout(V.cuentaT); V.cuentaT = setTimeout(pintarHost, Math.min(falta, 250));
      return;
    }
    const firma = `${e.fase}|${e.i}`;
    if (!res && V.firma === firma && $("#cc-cont")) { $("#cc-cont").textContent = t("contestadas", {a: e.contestadas || 0, n: e.njug || js.length}); return; }
    V.firma = firma;
    const quedan = Math.max(0, e.t0 + q.s * 1000 - ahoraSrv(P)), maxc = Math.max(1, ...(e.cuantos || [1]));
    app.innerHTML = `<section class="cc-h">${top}<div class="cc-sbar"><span>${T("pdeq", {i: e.i + 1, n: e.total})}</span>${res ? "" : `<b class="cc-seg" id="cc-seg">${Math.ceil(quedan / 1000)}</b><span id="cc-cont">${T("contestadas", {a: e.contestadas || 0, n: e.njug || js.length})}</span>`}</div>
      ${res ? "" : barra(quedan, q.s)}
      <h1 class="cc-hpreg">${esc(q.p)}</h1>
      ${res ? `<div class="cc-barras">${q.o.map((o, j) => `<div class="cc-barra cc-c${j}${j === e.correcta ? " si" : " apag"}"><i style="height:${Math.round(100 * (e.cuantos[j] || 0) / maxc)}%"></i><b>${e.cuantos[j] || 0}</b></div>`).join("")}</div>` : ""}
      <div class="cc-botones n${q.o.length} cc-hb">${q.o.map((o, j) => `<div class="cc-b cc-c${j}${res ? (j === e.correcta ? " si" : " apag") : ""}">${opcHTML(o, j, res && j === e.correcta ? " ✓" : "")}</div>`).join("")}</div>
      <div class="cc-hacc">${res ? `<button class="btn main cc-big" data-cc="verrank">${T("resultados")}</button>` : `<button class="btn" data-cc="pasar">${T("pasar")}</button>`}</div></section>`;
    if (!res) { clearInterval(V.segT); V.segT = setInterval(() => { const el = $("#cc-seg"); if (!el || V.p !== P) return clearInterval(V.segT); el.textContent = Math.max(0, Math.ceil((e.t0 + q.s * 1000 - ahoraSrv(P)) / 1000)); }, 250); }
    if (res && P.verRank === e.i) pintarRank();
    return;
  }
  if (e.fase === "fin") {
    const rk = e.ranking || [], pod = [rk[1], rk[0], rk[2]];
    app.innerHTML = `<section class="cc-h">${top}<h1 class="cc-htit">🏆 ${T("podio")}</h1>
      <div class="cc-podio">${pod.map((x, k) => x ? `<div class="cc-pd p${[2, 1, 3][k]}"><span class="cc-nom">${esc(x.n)}</span><b>${x.pts}</b><i>${[2, 1, 3][k]}</i></div>` : `<div class="cc-pd vacio"></div>`).join("")}</div>
      ${rk.length > 3 ? `<ol class="cc-rank" start="4">${rk.slice(3).map((x, i) => `<li><span class="cc-pos">${i + 4}</span><span class="cc-nom">${esc(x.n)}</span><b>${x.pts}</b></li>`).join("")}</ol>` : ""}
      <div class="cc-hacc">${P.id ? `<button class="btn main" data-cc="directo" data-id="${esc(P.id)}">${T("otra")}</button>` : ""}<button class="btn" data-cc="cerrarp">${T("cerrarp")}</button></div></section>`;
  }
}
function pintarRank() {
  const P = V.p, e = P.e, app = V.app; P.verRank = e.i;
  const ult = e.i + 1 >= e.total;
  app.innerHTML = `<section class="cc-h"><div class="cc-htop"><span class="cc-hcod">${T("codigo")}: <b>${P.cod}</b></span></div><h1 class="cc-htit">${T("ranking")}</h1>
    ${(e.ranking || []).length ? rankHTML(e.ranking, 5) : `<p class="cc-cuenta">${T("nadie")}</p>`}
    <div class="cc-hacc"><button class="btn main cc-big" data-cc="pasar">${ult ? T("final") : T("siguiente")}</button></div></section>`;
}

/* ---------- en directo: móvil del jugador ---------- */
function jugar(app, cod) {
  const yo = cod ? store.get(JKEY, {})[cod] : null;
  if (!cod || !yo) {
    if (V.j && V.j.cod === cod && V.j.pid) return pintarJug();
    app.innerHTML = `<section class="wrap cc cc-jug">${cab("📱 " + T("unirse"))}
      <form class="cc-unir" id="cc-entrar"><label>${T("codigo")}<input name="codigo" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="123456" value="${esc(cod || "")}" required></label>
      <label>${T("tunombre")}<input name="nombre" maxlength="16" autocomplete="nickname" value="${esc(store.get("lyaCcNombre", "") || (window.LYACuentas && window.LYACuentas.usuario) || "")}" required></label>
      <p class="cc-msg" id="cc-msg" hidden></p><button class="btn main cc-big">${T("entrar")}</button></form></section>`;
    const f = app.querySelector("#cc-entrar");
    if (cod) f.nombre.focus(); else f.codigo.focus();
    f.onsubmit = async e => {
      e.preventDefault();
      const c = f.codigo.value.replace(/\D/g, ""), n = f.nombre.value.trim();
      if (c.length !== 6) return aviso(t("e_codigo"), true);
      if (n.length < 2) return aviso(t("e_nombre"), true);
      f.querySelector("button").disabled = true;
      const r = await api("concursos", {accion: "entrar", codigo: c, nombre: n}).catch(() => null);
      f.querySelector("button").disabled = false;
      if (!r) return aviso(t("e_red"), true);
      if (!r.ok) return aviso(t({no_existe: "e_codigo", nombre_usado: "e_usado", llena: "e_llena", terminado: "e_terminado", nombre_no_valido: "e_nombre", espera: "e_espera"}[r.j.error] || "e_gen"), true);
      store.set("lyaCcNombre", n);
      const js = store.get(JKEY, {}); js[c] = {pid: r.j.pid, nombre: r.j.nombre, f: Date.now()};
      for (const k in js) if (Date.now() - (js[k].f || 0) > 864e5) delete js[k];
      store.set(JKEY, js);
      V.j = {cod: c, pid: r.j.pid, nombre: r.j.nombre, e: null, resp: {}};
      if (location.hash !== "#jugar-" + c) { V.h = "jugar-" + c; location.hash = "jugar-" + c; }
      sondeoJug();
    };
    return;
  }
  if (!V.j) { V.j = {cod, pid: yo.pid, nombre: yo.nombre, e: null, resp: {}}; sondeoJug(); }
  else pintarJug();
}
async function sondeoJug() {
  const J = V.j; if (!J) return; const h = V.h;
  try {
    const r = await fetch(`api/concursos?sala=${J.cod}`);
    const j = await r.json().catch(() => ({}));
    if (V.h !== h || V.j !== J) return;
    if (r.ok) {
      /* la respuesta puede venir de la caché (hasta 1 s): «Age» dice cuántos segundos tiene */
      const age = +(r.headers.get("age") || 0) || 0, off = j.ahora + age * 1000 - Date.now();
      J.off = J.off == null ? off : Math.max(J.off, off);
      J.e = j;
    } else if (r.status === 404) J.e = {fase: "cerrada"};
  } catch (e) {}
  pintarJug();
  const f = J.e && J.e.fase;
  if (f && f !== "cerrada" && f !== "fin") timer = setTimeout(sondeoJug, f === "espera" ? 2000 : 1000);
  if (f === "fin" && !J.premio) { J.premio = 1; const yo = (J.e.ranking || []).find(x => x.n === J.nombre); if (yo) xp(5 + Math.round(yo.pts / 500), {ok: true}); }
}
function pintarJug() {
  const J = V.j, app = V.app; if (!J || !app) return;
  document.body.classList.add("cc-grande");
  const e = J.e, nom = `<div class="cc-jtop"><span>👤 ${esc(J.nombre)}</span><span>${T("codigo")} ${J.cod}</span><a href="#concursos" class="cc-salir">${T("salir")}</a></div>`;
  const caja = (html, cls = "") => { V.jfirma = ""; app.innerHTML = `<section class="wrap cc cc-jug">${nom}<div class="cc-jbox ${cls}">${html}</div></section>`; };
  if (!e) return caja(`<p>…</p>`);
  if (e.fase === "cerrada") return caja(`<h2>${T("e_terminado")}</h2><a class="btn" href="#concursos">${T("volver")}</a>`);
  const yo = (e.ranking || []).find(x => x.n === J.nombre), pos = yo ? e.ranking.indexOf(yo) + 1 : 0;
  if (e.fase === "espera") return caja(`<div class="cc-gran">✅</div><h2>${T("j_dentro")}</h2><p>${T("j_mira")}</p><p class="cc-small">${esc(e.titulo)}</p>`);
  if (e.fase === "fin") return caja(`<div class="cc-gran">${pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : "🏁"}</div><h2>${T("podio")}</h2>${yo ? `<p class="cc-pts">${T("j_pts", {n: yo.pts})}</p><p>${T("j_final", {p: pos, n: e.ranking.length})}</p>` : ""}<a class="btn" href="#concursos">${T("volver")}</a>`, "fin");
  const q = e.pregunta, res = e.fase === "resultado", mia = J.resp[e.i];
  if (res) {
    const ok = yo && yo.ok === true, nada = !yo || yo.ok === null;
    return caja(`<div class="cc-gran">${ok ? "🎉" : nada ? "⏰" : "❌"}</div><h2>${ok ? T("j_bien") : nada ? T("j_tarde") : T("j_mal")}</h2>${ok ? `<p class="cc-pts">+${yo.d}</p>` : ""}${yo && yo.ra > 1 ? `<p>${T("j_racha", {n: yo.ra})}</p>` : ""}
      <p class="cc-small">✓ ${opcHTML(q.o[e.correcta], e.correcta)}</p>${yo ? `<p>${T("j_puesto", {p: pos, n: e.ranking.length})} · ${T("j_pts", {n: yo.pts})}</p>` : ""}`, ok ? "si" : "no");
  }
  const falta = e.t0 - (Date.now() + (J.off || 0)), quedan = e.t0 + q.s * 1000 - (Date.now() + (J.off || 0));
  if (falta > 0) { clearTimeout(V.cuentaT); V.cuentaT = setTimeout(pintarJug, Math.min(falta, 250)); return caja(`<div class="cc-cuentaatras">${Math.ceil(falta / 1000)}</div><p>${T("j_prep")}</p>`); }
  if (mia != null) return caja(`<div class="cc-gran">📨</div><h2>${T("j_enviada")}</h2><p>${T("j_espera")}</p><div class="cc-b cc-c${mia} cc-mini">${opcHTML(q.o[mia], mia)}</div>`);
  if (quedan <= 0) return caja(`<div class="cc-gran">⏰</div><h2>${T("j_tarde")}</h2>`);
  if (V.jfirma === "q" + e.i && $(".cc-jugando")) { clearTimeout(V.cuentaT); V.cuentaT = setTimeout(pintarJug, quedan + 50); return; }
  V.jfirma = "q" + e.i;
  app.innerHTML = `<section class="wrap cc cc-jug cc-jugando">${nom}<p class="cc-jp">${esc(q.p)}</p>
    ${barra(quedan, q.s)}
    <div class="cc-botones n${q.o.length}">${q.o.map((o, j) => `<button class="cc-b cc-c${j}" data-cc="resp" data-j="${j}">${opcHTML(o, j)}</button>`).join("")}</div></section>`;
}
async function responderJug(j) {
  const J = V.j, e = J && J.e; if (!e || e.fase !== "pregunta" || J.resp[e.i] != null) return;
  J.resp[e.i] = j; pintarJug();
  try { navigator.vibrate && navigator.vibrate(40); } catch (er) {}
  const r = await api("concursos", {accion: "responder", codigo: J.cod, pid: J.pid, i: e.i, o: j}).catch(() => null);
  if (r && !r.ok && r.j.error === "no_jugador") { const js = store.get(JKEY, {}); delete js[J.cod]; store.set(JKEY, js); V.j = null; parar(); location.hash = "jugar-" + J.cod; render(V.app); }
}

/* ---------- botones ---------- */
document.addEventListener("click", async ev => {
  const b = ev.target.closest("[data-cc]"); if (!b || !V.app || !V.app.contains(b)) return;
  const a = b.dataset.cc, i = +b.dataset.i;
  if (a === "copiarprompt") { if (await copiar($("#cc-prompt").value)) { const ok = $("#cc-copiado"); if (ok) { ok.hidden = false; setTimeout(() => { ok.hidden = true; }, 2500); } } else $("#cc-prompt").select(); }
  else if (a === "leer") { V.pegado = $("#cc-pega").value; leerPegado(); }
  else if (a === "masr") { E.preguntas[i].o.push(""); pintarEditor(V.app); }
  else if (a === "menosr") { const q = E.preguntas[i]; q.o.pop(); if (q.c >= q.o.length) q.c = 0; pintarEditor(V.app); }
  else if (a === "arriba" || a === "abajo") { const k = a === "arriba" ? i - 1 : i + 1, P = E.preguntas; [P[i], P[k]] = [P[k], P[i]]; pintarEditor(V.app); }
  else if (a === "quitarp") { E.preguntas.splice(i, 1); pintarEditor(V.app); }
  else if (a === "masp") { E.preguntas.push(nuevaP()); pintarEditor(V.app); V.app.querySelectorAll(".cc-q textarea")[E.preguntas.length - 1]?.focus(); }
  else if (a === "guardar") guardar();
  else if (a === "comotexto") { const c = E && V.h.startsWith("concursos-editar") ? revisar()[1] : V.c; if (c && await copiar(F().escribir(c))) aviso(t("copiado")); else if (!c) aviso(revisar()[0], true); }
  else if (a === "directo") { ev.preventDefault(); abrirDirecto(b.dataset.id); }
  else if (a === "enlace") { if (await copiar(urlJuego() + "#concurso-" + V.id)) aviso(t("copiado")); }
  else if (a === "copia") { E = {id: null, titulo: V.c.titulo, preguntas: JSON.parse(JSON.stringify(V.c.preguntas))}; guardar(); }
  else if (a === "borrar") {
    if (!confirm(t("seguro", {t: V.c.titulo}))) return;
    if (V.id.startsWith("l")) store.set(LKEY, locales().filter(x => x.id !== V.id));
    else { const r = await api("concursos", {accion: "borrar", id: V.id}).catch(() => null); if (!r || !r.ok) return aviso(t("e_red"), true); }
    location.hash = "concursos";
  }
  else if (a === "subir") {
    b.disabled = true; const ls = locales(), quedan = [];
    for (const c of ls) { const r = await api("concursos", {accion: "guardar", concurso: {titulo: c.titulo, preguntas: c.preguntas}}).catch(() => null); if (!r || !r.ok) quedan.push(c); }
    store.set(LKEY, quedan); inicio(V.app); setTimeout(() => aviso(quedan.length ? t("e_red") : t("subidos"), !!quedan.length), 300);
  }
  else if (a === "solor") responderSolo(+b.dataset.j);
  else if (a === "solosig") { const s = V.s; s.i++; s.elegida = undefined; if (s.i >= s.c.preguntas.length) { s.fase = "fin"; xp(5, {ok: true}); } else { s.fase = "pregunta"; s.t0 = Date.now(); } pintarSolo(V.app); scrollTo(0, 0); }
  else if (a === "solootra") { V.s = {...V.s, i: 0, pts: 0, ok: 0, ra: 0, fase: "pregunta", t0: Date.now()}; pintarSolo(V.app); }
  else if (a === "pasar") { b.disabled = true; V.p.verRank = -1; pasarHost(); }
  else if (a === "verrank") pintarRank();
  else if (a === "echar") { await api("concursos", {accion: "echar", codigo: V.p.cod, clave: V.p.clave, nombre: b.dataset.n}).catch(() => null); clearTimeout(timer); sondeoHost(); }
  else if (a === "pantalla") { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (er) {} }
  else if (a === "cerrarp") { await api("concursos", {accion: "cerrarsala", codigo: V.p.cod, clave: V.p.clave}).catch(() => null); const hs = store.get(HKEY, {}); delete hs[V.p.cod]; store.set(HKEY, hs); location.hash = V.p.id ? "concurso-" + V.p.id : "concursos"; }
  else if (a === "resp") responderJug(+b.dataset.j);
});

const tab = () => esc(t("tab"));
window.LYAConcursos = {render, isCc, tab, activo: h => /^(concurso|jugar)/.test(h)};
})();
