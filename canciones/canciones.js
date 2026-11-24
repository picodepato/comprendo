/* Canciones: pega un enlace de YouTube, escucha y escribe las palabras que faltan en la letra.
   - Los subtítulos (con sus tiempos) los trae api/canciones?v=… desde YouTube y NO se guardan.
     Sin servidor (o si el vídeo no tiene subtítulos) se puede pegar la letra: texto, LRC o SRT/VTT.
   - El vídeo se ve con la API de YouTube; se para al acabar cada frase con hueco hasta que escribes la palabra.
   - Niveles: 1 fácil (1 hueco cada 2 frases) · 2 normal (1 por frase) · 3 difícil (2 por frase) · 4 experto (1 de cada 3 palabras).
   - Puntos: evento "lya:xp" (uno por acierto y uno al terminar). Resultado en S.g.cn[clave] = {n, best, bp, last, t, v, d}.
   - Profes: «Mandar como deberes» guarda esa canción para su clase (api/canciones, POST). Los alumnos la abren en #cancion-<id>.
   Rutas: #canciones (inicio), #canciones-<vídeo> (jugar ese vídeo), #canciones-texto (letra pegada), #cancion-<id> (deberes). */
(() => {
const TX = {
  ca: {buscar: "🔎 Busca la lletra pel nom", buscarq: "Artista i cançó", buscarb: "Buscar", buscando: "Buscant…", sinres: "No l'hem trobada. Prova amb un altre nom o enganxa la lletra.", sinsync: "sense temps", usar: "Fer servir", s_lrc: "LRCLIB (lletres sincronitzades)", lrcnota: "Lletra trobada: {n}.", noes: "No és aquesta?", ajuste: "Si la lletra va avançada o endarrerida, ajusta-la:", antes: "⏪ Abans", despues: "Després ⏩", tab: "🎵 Cançons", h1: "Cançons", sub: "Escolta una cançó o un vídeo de YouTube i escriu les paraules que falten.",
    pega: "Enganxa l'enllaç de YouTube", ej: "https://www.youtube.com/watch?v=…", empezar: "Començar", nivel: "Nivell", n1: "Fàcil", n2: "Normal", n3: "Difícil", n4: "Expert",
    nd1: "1 buit cada 2 frases", nd2: "1 buit per frase", nd3: "2 buits per frase", nd4: "1 de cada 3 paraules",
    como: "Com funciona", como1: "El vídeo s'atura al final de cada frase amb un buit.", como2: "Escriu la paraula que has sentit. Si l'encertes, continua sol.", como3: "🔁 repeteix la frase, 💡 et dona una lletra i 👀 et mostra la paraula (sense punts).",
    sinsubs: "No té subtítols? Enganxa tu la lletra", pegaletra: "Enganxa aquí la lletra (una frase per línia). També val amb temps (LRC o SRT).", usarletra: "Fer servir aquesta lletra", titulo: "Títol (opcional)",
    recientes: "Les teves cançons", cargando: "Buscant els subtítols…", volver: "← Cançons",
    e_enlace: "Aquest enllaç no sembla de YouTube. Copia'l de la barra del navegador o del botó «Compartir».",
    e_sinsubs: "No hem trobat la lletra d'aquest vídeo. Busca-la pel nom o enganxa-la a sota i la fem servir amb el vídeo.",
    e_yt: "No hem trobat la lletra d'aquest vídeo. Busca-la pel nom o enganxa-la a sota.",
    e_muchas: "Has buscat moltes cançons en una hora. Espera una mica i torna-ho a provar.",
    e_noserv: "Aquí no es poden descarregar els subtítols. Enganxa tu la lletra a sota.", e_red: "No hi ha connexió. Torna-ho a provar.",
    e_letra: "Enganxa almenys dues frases.", e_entra: "Entra amb el teu compte per obrir aquesta cançó.", e_nodeber: "Aquesta cançó ja no hi és (el teu profe l'ha treta).",
    auto: "Subtítols automàtics: potser alguna paraula no és exacta.", otroidioma: "Compte: els subtítols d'aquest vídeo són en {l}.",
    huecos: "{a} de {n} buits", play: "▶ Reproduir", pausa: "⏸ Pausa", rep: "🔁 Repetir la frase", pista: "💡 Pista", ver: "👀 Veure la paraula", fin: "Acabar",
    escribe: "✍️ Escriu la paraula que falta.", bien: "Bé! 🎉", casi: "Gairebé… escolta-ho una altra vegada.", pulsa: "Toca ▶ per començar. El vídeo s'aturarà a cada buit.",
    sintiempos: "Aquesta lletra no té temps: el vídeo no s'aturarà sol. Fes servir ⏸ quan ho necessitis.",
    sinvideo: "El vídeo no es pot veure aquí.", abriryt: "Obre'l a YouTube", sinvideo2: "Escolta'l en una altra pestanya i completa la lletra aquí.",
    hueco: "Paraula que falta", res: "Acabat!", aciertos: "Encerts: {a} de {n}", xpg: "+{n} XP", estrellas: "{n} de 3 estrelles",
    otra: "Una altra vegada", otronivel: "Provar un altre nivell", otracancion: "Una altra cançó", faltan: "Et falten {n} buits. Vols acabar igualment?",
    deber: "📚 Deures del teu profe", mandar: "🧑‍🏫 Enviar com a deures", para: "Per a", todas: "Totes les meves classes", todos: "Tots els alumnes", hasta: "Data límit", nota: "Nota (opcional)",
    mandarb: "Enviar a la classe", mandada: "✓ Enviada. Els teus alumnes la veuran a la portada, a «Els teus deures».", sinclases: "Primer crea una classe al teu Tauler del profe.", e_mandar: "No s'ha pogut enviar. Torna-ho a provar.",
    letra_de: "Lletra: {s}", s_auto: "subtítols automàtics de YouTube", s_yt: "subtítols de YouTube", s_tuya: "enganxada per tu"},
  es: {buscar: "🔎 Busca la letra por su nombre", buscarq: "Artista y canción", buscarb: "Buscar", buscando: "Buscando…", sinres: "No la hemos encontrado. Prueba con otro nombre o pega la letra.", sinsync: "sin tiempos", usar: "Usar", s_lrc: "LRCLIB (letras sincronizadas)", lrcnota: "Letra encontrada: {n}.", noes: "¿No es esta?", ajuste: "Si la letra va adelantada o atrasada, ajústala:", antes: "⏪ Antes", despues: "Después ⏩", tab: "🎵 Canciones", h1: "Canciones", sub: "Escucha una canción o un vídeo de YouTube y escribe las palabras que faltan.",
    pega: "Pega el enlace de YouTube", ej: "https://www.youtube.com/watch?v=…", empezar: "Empezar", nivel: "Nivel", n1: "Fácil", n2: "Normal", n3: "Difícil", n4: "Experto",
    nd1: "1 hueco cada 2 frases", nd2: "1 hueco por frase", nd3: "2 huecos por frase", nd4: "1 de cada 3 palabras",
    como: "Cómo funciona", como1: "El vídeo se para al final de cada frase con un hueco.", como2: "Escribe la palabra que has oído. Si aciertas, sigue solo.", como3: "🔁 repite la frase, 💡 te da una letra y 👀 te enseña la palabra (sin puntos).",
    sinsubs: "¿No tiene subtítulos? Pega tú la letra", pegaletra: "Pega aquí la letra (una frase por línea). También vale con tiempos (LRC o SRT).", usarletra: "Usar esta letra", titulo: "Título (opcional)",
    recientes: "Tus canciones", cargando: "Buscando los subtítulos…", volver: "← Canciones",
    e_enlace: "Ese enlace no parece de YouTube. Cópialo de la barra del navegador o del botón «Compartir».",
    e_sinsubs: "No hemos encontrado la letra de este vídeo. Búscala por su nombre o pégala abajo y la usamos con el vídeo.",
    e_yt: "No hemos encontrado la letra de este vídeo. Búscala por su nombre o pégala abajo.",
    e_muchas: "Has buscado muchas canciones en una hora. Espera un poco y vuelve a probar.",
    e_noserv: "Aquí no se pueden descargar los subtítulos. Pega tú la letra abajo.", e_red: "No hay conexión. Prueba otra vez.",
    e_letra: "Pega al menos dos frases.", e_entra: "Entra con tu cuenta para abrir esta canción.", e_nodeber: "Esta canción ya no está (tu profe la ha quitado).",
    auto: "Subtítulos automáticos: puede que alguna palabra no sea exacta.", otroidioma: "Ojo: los subtítulos de este vídeo están en {l}.",
    huecos: "{a} de {n} huecos", play: "▶ Reproducir", pausa: "⏸ Pausa", rep: "🔁 Repetir frase", pista: "💡 Pista", ver: "👀 Ver palabra", fin: "Terminar",
    escribe: "✍️ Escribe la palabra que falta.", bien: "¡Bien! 🎉", casi: "Casi… escucha otra vez.", pulsa: "Pulsa ▶ para empezar. El vídeo se parará en cada hueco.",
    sintiempos: "Esta letra no tiene tiempos: el vídeo no se parará solo. Usa ⏸ cuando lo necesites.",
    sinvideo: "El vídeo no se puede ver aquí.", abriryt: "Ábrelo en YouTube", sinvideo2: "Escúchalo en otra pestaña y completa la letra aquí.",
    hueco: "Palabra que falta", res: "¡Terminado!", aciertos: "Aciertos: {a} de {n}", xpg: "+{n} XP", estrellas: "{n} de 3 estrellas",
    otra: "Otra vez", otronivel: "Probar otro nivel", otracancion: "Otra canción", faltan: "Te faltan {n} huecos. ¿Terminar igualmente?",
    deber: "📚 Deberes de tu profe", mandar: "🧑‍🏫 Mandar como deberes", para: "Para", todas: "Todas mis clases", todos: "Todos los alumnos", hasta: "Fecha límite", nota: "Nota (opcional)",
    mandarb: "Mandar a la clase", mandada: "✓ Mandada. Tus alumnos la verán en la portada, en «Tus deberes».", sinclases: "Primero crea una clase en tu Panel del profe.", e_mandar: "No se ha podido mandar. Prueba otra vez.",
    letra_de: "Letra: {s}", s_auto: "subtítulos automáticos de YouTube", s_yt: "subtítulos de YouTube", s_tuya: "pegada por ti"},
  en: {buscar: "🔎 Search the lyrics by name", buscarq: "Artist and song", buscarb: "Search", buscando: "Searching…", sinres: "We could not find it. Try another name or paste the lyrics.", sinsync: "no times", usar: "Use", s_lrc: "LRCLIB (synced lyrics)", lrcnota: "Lyrics found: {n}.", noes: "Not this one?", ajuste: "If the lyrics come too early or too late, adjust them:", antes: "⏪ Earlier", despues: "Later ⏩", tab: "🎵 Songs", h1: "Songs", sub: "Listen to a song or a YouTube video and type the missing words.",
    pega: "Paste the YouTube link", ej: "https://www.youtube.com/watch?v=…", empezar: "Start", nivel: "Level", n1: "Easy", n2: "Normal", n3: "Hard", n4: "Expert",
    nd1: "1 gap every 2 lines", nd2: "1 gap per line", nd3: "2 gaps per line", nd4: "1 in 3 words",
    como: "How it works", como1: "The video stops at the end of each line with a gap.", como2: "Type the word you heard. If it is right, the video goes on.", como3: "🔁 repeats the line, 💡 gives you a letter and 👀 shows the word (no points).",
    sinsubs: "No subtitles? Paste the lyrics yourself", pegaletra: "Paste the lyrics here (one line each). Timed lyrics work too (LRC or SRT).", usarletra: "Use these lyrics", titulo: "Title (optional)",
    recientes: "Your songs", cargando: "Looking for the subtitles…", volver: "← Songs",
    e_enlace: "That link does not look like YouTube. Copy it from the address bar or the «Share» button.",
    e_sinsubs: "We could not find the lyrics of this video. Search them by name or paste them below and we will use them with the video.",
    e_yt: "We could not find the lyrics of this video. Search them by name or paste them below.",
    e_muchas: "You have looked up a lot of songs this hour. Wait a little and try again.",
    e_noserv: "Subtitles cannot be downloaded here. Paste the lyrics below.", e_red: "No connection. Try again.",
    e_letra: "Paste at least two lines.", e_entra: "Sign in to open this song.", e_nodeber: "This song is no longer here (your teacher removed it).",
    auto: "Automatic subtitles: some words may not be exact.", otroidioma: "Note: the subtitles of this video are in {l}.",
    huecos: "{a} of {n} gaps", play: "▶ Play", pausa: "⏸ Pause", rep: "🔁 Repeat line", pista: "💡 Hint", ver: "👀 Show word", fin: "Finish",
    escribe: "✍️ Type the missing word.", bien: "Well done! 🎉", casi: "Almost… listen again.", pulsa: "Press ▶ to start. The video will stop at each gap.",
    sintiempos: "These lyrics have no times: the video will not stop by itself. Use ⏸ when you need it.",
    sinvideo: "The video cannot be shown here.", abriryt: "Open it on YouTube", sinvideo2: "Listen in another tab and fill in the lyrics here.",
    hueco: "Missing word", res: "Finished!", aciertos: "Correct: {a} of {n}", xpg: "+{n} XP", estrellas: "{n} of 3 stars",
    otra: "Again", otronivel: "Try another level", otracancion: "Another song", faltan: "{n} gaps left. Finish anyway?",
    deber: "📚 Homework from your teacher", mandar: "🧑‍🏫 Send as homework", para: "For", todas: "All my classes", todos: "All students", hasta: "Due date", nota: "Note (optional)",
    mandarb: "Send to the class", mandada: "✓ Sent. Your students will see it on the home page, in «Your homework».", sinclases: "First create a class in your Teacher panel.", e_mandar: "It could not be sent. Try again.",
    letra_de: "Lyrics: {s}", s_auto: "automatic YouTube subtitles", s_yt: "YouTube subtitles", s_tuya: "pasted by you"}
};
const STOP = {
  es: new Set("el la los las un una unos unas del al en que es son con por para sus se lo le les me te mi tu muy más pero como hay ser fue era este esta ese esa eso yo ella ellos nos ya no si sí".split(" ")),
  en: new Set("the a an and or of to in on at is are was were be it its i you he she we they me my your his her our their that this with for but not do don so as by oh yeah".split(" "))
};
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const both = () => { try { return L().both(); } catch (e) { return false; } };
const lg = () => { try { return st().S.learn; } catch (e) { return "es"; } };
const tl = (k, l, v) => { let s = (TX[l] || TX.es)[k] ?? TX.es[k] ?? k; for (const x in v || {}) s = s.split(`{${x}}`).join(v[x]); return s; };
const T = (k, v) => { const S = st().S; return esc(tl(k, S.learn, v)) + (both() && S.know !== S.learn ? " · " + esc(tl(k, S.know, v)) : ""); };
const TB = (k, v) => { const S = st().S; return esc(tl(k, S.learn, v)) + (both() && S.know !== S.learn ? `<span class="en">${esc(tl(k, S.know, v))}</span>` : ""); };
/* botón con icono + texto (en el móvil solo el icono) */
const IB = k => { const S = st().S, full = tl(k, S.learn), i = full.indexOf(" "), ic = full.slice(0, i), tx = full.slice(i + 1), tx2 = both() && S.know !== S.learn ? " · " + tl(k, S.know).replace(/^\S+\s/, "") : "";
  return `<span class="cnic" aria-hidden="true">${esc(ic)}</span><span class="cnlbl">${esc(tx + tx2)}</span>`; };
const IBA = k => `title="${esc(tl(k, lg()).replace(/^\S+\s/, ""))}" aria-label="${esc(tl(k, lg()).replace(/^\S+\s/, ""))}"`;
const lname = c => { try { const {CAT, S} = st(); return CAT.languages[c].name[S.learn] || c; } catch (e) { return c; } };
const xp = d => { try { dispatchEvent(new CustomEvent("lya:xp", {detail: d})); } catch (e) {} };
const app = () => document.getElementById("app");
const C = () => window.LYACuentas || null;
const hoy = (mas = 0) => { const d = new Date(Date.now() + mas * 864e5); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

/* ---------- utilidades ---------- */
const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/’/g, "'").replace(/[^\p{L}\p{N}']/gu, "");
const WORD = /[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu;
function idVideo(s) {
  s = String(s || "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/|\/v\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
/* letra pegada: SRT/VTT, LRC o texto normal → [{t, d, x}] */
function parseLetra(txt) {
  txt = String(txt || "").replace(/\r/g, "").trim();
  const seg = h => { const p = h.replace(",", ".").split(":").map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]; };
  const out = [];
  if (/\d+:\d+[.,]\d+\s*-->/.test(txt)) {
    for (const b of txt.split(/\n\s*\n/)) {
      const m = b.match(/((?:\d+:)?\d+:\d+[.,]\d+)\s*-->\s*((?:\d+:)?\d+:\d+[.,]\d+)[^\n]*\n([\s\S]*)/); if (!m) continue;
      const a = seg(m[1]), z = seg(m[2]); out.push({t: a, d: Math.max(0.3, z - a), x: m[3].replace(/<[^>]+>/g, "").replace(/\n/g, " ")});
    }
  } else if (/^\s*\[\d+:\d+(?:[.:]\d+)?\]/m.test(txt)) {
    for (const ln of txt.split("\n")) {
      const ts = [...ln.matchAll(/\[(\d+):(\d+(?:[.:]\d+)?)\]/g)], x = ln.replace(/\[[^\]]*\]/g, "").trim();
      for (const m of ts) out.push({t: +m[1] * 60 + parseFloat(m[2].replace(":", ".")), d: 0, x});
    }
    out.sort((a, b) => a.t - b.t);
    out.forEach((l, i) => { l.d = out[i + 1] ? Math.max(0.3, out[i + 1].t - l.t) : 5; });
  } else for (const ln of txt.split("\n")) out.push({t: 0, d: 0, x: ln});
  return out.map(l => ({...l, x: l.x.replace(/[♪♫]/g, " ").replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim()})).filter(l => /[\p{L}\p{N}]/u.test(l.x)).slice(0, 600);
}

/* ---------- estado ---------- */
let M = null;        /* ejercicio actual */
let F = {};          /* inicio: {err, v, abrir (caja de letra), cargando} */
let player = null, ytOk = null, timer = null, root = null;
const nivelPref = () => st().S.cnNivel || 2;

function huecos(lineas, nivel, idioma) {
  const stop = STOP[idioma] || new Set(), minLen = nivel === 1 ? 4 : 3, gaps = [];
  let acc = 0;
  const L2 = lineas.map((l, li) => {
    const tok = []; let last = 0;
    for (const m of l.x.matchAll(WORD)) { if (m.index > last) tok.push({s: l.x.slice(last, m.index)}); tok.push({s: m[0], w: 1}); last = m.index + m[0].length; }
    if (last < l.x.length) tok.push({s: l.x.slice(last)});
    const words = tok.filter(t => t.w), cand = words.filter(t => /^\p{L}+$/u.test(t.s) && t.s.length >= minLen && !(nivel <= 2 && stop.has(t.s.toLowerCase())));
    const q = nivel === 1 ? 0.5 : nivel === 2 ? 1 : nivel === 3 ? 2 : Math.max(1, words.length / 3);
    acc += q; let k = Math.min(Math.floor(acc), cand.length); acc -= Math.floor(acc);
    const elegidos = new Set();
    while (k-- > 0) { const libres = cand.filter(c => !elegidos.has(c)); if (!libres.length) break; elegidos.add(libres[Math.floor(Math.random() * libres.length)]); }
    for (const t of tok) if (elegidos.has(t)) { t.g = gaps.length; gaps.push({li, w: t.s, st: "", pista: 0, fallos: 0}); }
    return {...l, tok};
  });
  /* que siempre haya algún hueco */
  if (!gaps.length) for (const [li, l] of L2.entries()) { const t = l.tok.find(t => t.w && t.s.length >= 3); if (t) { t.g = 0; gaps.push({li, w: t.s, st: "", pista: 0, fallos: 0}); break; } }
  return {lineas: L2, gaps};
}
function nuevo(d) {
  /* d = {h, clave, v, titulo, idioma, auto, origen, lineas, nivel, deber} */
  const nivel = d.deber ? d.nivel || 2 : nivelPref();
  const tiempos = d.lineas.some(l => l.t > 0);
  M = {...d, nivel, tiempos, crudas: d.lineas, ...huecos(d.lineas, nivel, d.idioma || lg()), espera: -1, sel: -1, lastT: 0, pos: 0, fin: false, xpRun: 0, msg: ""};
}
function reiniciar(nivel) {
  if (nivel) { M.nivel = nivel; if (!M.deber) { st().S.cnNivel = nivel; L().save(); } }
  Object.assign(M, huecos(M.crudas, M.nivel, M.idioma || lg()), {espera: -1, sel: -1, lastT: 0, pos: 0, fin: false, xpRun: 0, msg: ""});
  try { if (player) { player.seekTo(0, true); player.pauseVideo(); } } catch (e) {}
  root = null; render(app());
}

/* ---------- rutas ---------- */
const isSongs = h => h === "canciones" || h === "canciones-texto" || /^canciones-[A-Za-z0-9_-]{11}$/.test(h) || /^cancion-[a-f0-9]{12}$/.test(h);
const tabLink = () => { try { const S = st().S; return esc(tl("tab", S.learn)) + (both() && S.know !== S.learn ? `<span class="tk"> · ${esc(tl("tab", S.know).replace(/^\S+\s/, ""))}</span>` : ""); } catch (e) { return "🎵 Canciones"; } };
addEventListener("hashchange", () => { if (!isSongs(location.hash.slice(1)) || (M && M.h !== location.hash.slice(1))) parar(); });
function parar() {
  clearInterval(timer); timer = null;
  try { if (player) { if (M) M.pos = player.getCurrentTime() || 0; player.destroy(); } } catch (e) {}
  player = null; root = null;
}

async function render(el) {
  el = el || app();
  const h = location.hash.slice(1) || "canciones";
  try { L().setAcc("#b98cff"); } catch (e) {}
  if (M && M.h === h) {
    if (root && el.contains(root)) return;   /* ya está pintado: no tocar el vídeo */
    return pintarJuego(el);
  }
  parar();
  if (h === "canciones" || h === "canciones-texto") { if (M || h === "canciones-texto") F = {}; M = null; return pintarInicio(el); }
  const v = h.startsWith("canciones-") ? h.slice(10) : null, deber = h.startsWith("cancion-") ? h.slice(8) : null;
  el.innerHTML = `<section class="cn"><p class="msg">${T("cargando")}</p></section>`;
  if (deber) return abrirDeber(el, deber, h);
  return abrirVideo(el, v, h);
}

async function servidor() { try { return !!(C() && await C().hayServidor()); } catch (e) { return false; } }

async function abrirVideo(el, v, h) {
  F = {v, err: "", abrir: false};
  if (!(await servidor())) { F.err = "e_noserv"; F.abrir = true; return pintarInicio(el); }
  let r;
  try { r = await C().api(`canciones?v=${encodeURIComponent(v)}&lang=${lg()}`); } catch (e) { F.err = "e_red"; return pintarInicio(el); }
  if (location.hash.slice(1) !== h) return;
  if (!r.ok) {
    const e = (r.j || {}).error || "";
    F.err = e === "enlace_no_valido" ? "e_enlace" : e === "sin_subtitulos" ? "e_sinsubs" : e === "demasiadas" ? "e_muchas" : "e_yt";
    F.abrir = F.err !== "e_enlace" && F.err !== "e_muchas"; F.titulo = (r.j || {}).titulo || "";
    if (F.abrir && F.titulo) F.q = F.titulo.replace(/\([^)]*\)|\[[^\]]*\]/g, " ").replace(/\b(official|oficial|video|vídeo|lyrics?|letra|audio)\b/gi, " ").replace(/[|"]/g, " ").replace(/\s+/g, " ").trim();
    return pintarInicio(el);
  }
  nuevo({h, clave: "yt-" + v, v, titulo: r.j.titulo || "YouTube", idioma: r.j.idioma, auto: r.j.auto, origen: r.j.origen === "lrclib" ? "s_lrc" : r.j.auto ? "s_auto" : "s_yt", lrc: r.j.lrc || null, lineas: r.j.lineas});
  pintarJuego(el);
}
async function abrirDeber(el, id, h) {
  if (!C() || !C().usuario || !(await servidor())) { el.innerHTML = `<section class="cn"><p class="msg">${T("e_entra")}</p></section>`; return; }
  const r = await C().api("canciones?id=" + id).catch(() => ({ok: false, j: {}}));
  if (location.hash.slice(1) !== h) return;
  if (!r.ok) { el.innerHTML = `<section class="cn"><p class="msg">${T(r.code === 401 ? "e_entra" : r.code === 404 ? "e_nodeber" : "e_red")}</p><p class="msg"><a class="btn" href="#canciones">${T("volver")}</a></p></section>`; return; }
  nuevo({h, clave: id, v: r.j.v || "", titulo: r.j.titulo, idioma: r.j.idioma, auto: false, origen: "", lineas: r.j.lineas, nivel: r.j.nivel, deber: true});
  pintarJuego(el);
}

/* ---------- inicio ---------- */
function pintarInicio(el) {
  const S = st().S, cn = (S.g && S.g.cn) || {}, n = nivelPref();
  const rec = Object.entries(cn).filter(([k, x]) => k.startsWith("yt-") && x.v).sort((a, b) => (b[1].d || 0) - (a[1].d || 0)).slice(0, 8);
  const lvBtn = i => `<button type="button" class="cnlv${n === i ? " on" : ""}" data-cn="pref" data-n="${i}" aria-pressed="${n === i}"><b>${T("n" + i)}</b><small>${T("nd" + i)}</small></button>`;
  el.innerHTML = `<section class="cn">
    <div class="cnintro"><h1>🎵 ${TB("h1")}</h1><p>${TB("sub")}</p></div>
    <form class="cnform" id="cnform"><label for="cnurl">${T("pega")}</label>
      <div class="cnrow"><input id="cnurl" name="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="${esc(tl("ej", lg()))}" value="${F.v ? "https://youtu.be/" + esc(F.v) : ""}"><button class="btn main" type="submit">${T("empezar")}</button></div>
      ${F.err ? `<p class="cnerr" role="alert">${T(F.err)}</p>` : ""}
      <fieldset class="cnlvs"><legend>${T("nivel")}</legend>${[1, 2, 3, 4].map(lvBtn).join("")}</fieldset>
    </form>
    <details class="cnpaste cnsearch"${F.abrir || F.q ? " open" : ""}><summary>${T("buscar")}</summary>
      <form id="cnsform"><div class="cnrow"><input name="q" maxlength="150" autocomplete="off" placeholder="${esc(tl("buscarq", lg()))}" aria-label="${esc(tl("buscarq", lg()))}" value="${esc(F.q || "")}"><button class="btn main" type="submit">${T("buscarb")}</button></div></form>
      <div id="cnsres" aria-live="polite"></div></details>
    <details class="cnpaste"${F.abrir ? " open" : ""}><summary>${T("sinsubs")}</summary>
      <form id="cnpform"><label>${T("titulo")}<input name="titulo" maxlength="120" value="${esc(F.titulo || "")}"></label>
      <label>${T("pegaletra")}<textarea name="letra" rows="8"></textarea></label>
      <p class="cnerr" id="cnperr" role="alert" hidden></p><button class="btn main" type="submit">${T("usarletra")}</button></form></details>
    <details class="cnhow"><summary>${T("como")}</summary><ul><li>${TB("como1")}</li><li>${TB("como2")}</li><li>${TB("como3")}</li></ul></details>
    ${rec.length ? `<h2>${T("recientes")}</h2><ul class="cnrec">${rec.map(([k, x]) => `<li><a href="#canciones-${esc(x.v)}"><img src="https://i.ytimg.com/vi/${esc(x.v)}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span>${esc(x.t || x.v)}</span><small>${"★".repeat(x.best || 0)}${"☆".repeat(3 - (x.best || 0))}</small></a></li>`).join("")}</ul>` : ""}
  </section>`;
  el.querySelector("#cnform").onsubmit = e => {
    e.preventDefault();
    const v = idVideo(e.target.url.value);
    if (!v) { F = {err: "e_enlace"}; return pintarInicio(el); }
    F = {v};
    if (location.hash.slice(1) === "canciones-" + v) { M = null; render(el); } else location.hash = "canciones-" + v;
  };
  el.querySelector("#cnsform").onsubmit = e => { e.preventDefault(); buscar(el, e.target.q.value.trim()); };
  el.querySelector("#cnpform").onsubmit = e => {
    e.preventDefault();
    const lineas = parseLetra(e.target.letra.value), perr = el.querySelector("#cnperr");
    if (lineas.length < 2) { perr.hidden = false; perr.innerHTML = T("e_letra"); return; }
    const v = idVideo(el.querySelector("#cnurl").value) || F.v || "";
    const titulo = e.target.titulo.value.trim() || F.titulo || (v ? "YouTube" : tl("h1", lg()));
    nuevo({h: "canciones-texto", clave: v ? "yt-" + v : "", v, titulo, idioma: lg(), auto: false, origen: "s_tuya", lineas});
    if (location.hash.slice(1) === "canciones-texto") pintarJuego(el); else location.hash = "canciones-texto";
  };
}

/* buscar letras por nombre (LRCLIB): por el servidor, o directamente desde el navegador si no hay servidor */
async function buscarDirecto(q) {
  const r = await fetch("https://lrclib.net/api/search?q=" + encodeURIComponent(q)); if (!r.ok) return [];
  const j = await r.json();
  return (Array.isArray(j) ? j : []).filter(x => !x.instrumental && (x.syncedLyrics || x.plainLyrics)).sort((a, b) => !!b.syncedLyrics - !!a.syncedLyrics).slice(0, 5)
    .map(x => ({id: x.id, titulo: `${x.artistName || ""} - ${x.trackName || ""}`, dur: x.duration || 0, sincronizada: !!x.syncedLyrics, lineas: parseLetra(x.syncedLyrics || x.plainLyrics)})).filter(c => c.lineas.length >= 2);
}
let RES = [];
async function buscar(el, q) {
  const box = el.querySelector("#cnsres"); if (!box || q.length < 2) return;
  F.q = q; box.innerHTML = `<p class="small">${T("buscando")}</p>`;
  RES = [];
  try {
    if (await servidor()) { const r = await C().api("canciones?q=" + encodeURIComponent(q)); RES = r.ok ? r.j.resultados || [] : []; }
    else RES = await buscarDirecto(q);
  } catch (e) { RES = []; }
  if (!document.body.contains(box)) return;
  box.innerHTML = RES.length ? `<ul class="cnres">${RES.map((c, i) => `<li><span><b>${esc(c.titulo)}</b><small>${c.dur ? Math.floor(c.dur / 60) + ":" + String(Math.round(c.dur % 60)).padStart(2, "0") : ""}${c.sincronizada ? "" : " · " + T("sinsync")}</small></span><button type="button" class="btn" data-cn="usarres" data-i="${i}">${T("usar")}</button></li>`).join("")}</ul>` : `<p class="cnerr">${T("sinres")}</p>`;
}
function usarResultado(i) {
  const c = RES[i]; if (!c) return;
  const v = idVideo((document.getElementById("cnurl") || {}).value) || F.v || "";
  nuevo({h: "canciones-texto", clave: v ? "yt-" + v : "lrc-" + c.id, v, titulo: c.titulo, idioma: lg(), auto: false, origen: "s_lrc", lrc: {id: c.id, nombre: c.titulo, dur: c.dur}, lineas: c.lineas});
  if (location.hash.slice(1) === "canciones-texto") pintarJuego(app()); else location.hash = "canciones-texto";
}

/* ---------- juego ---------- */
const hechos = () => M.gaps.filter(g => g.st).length;
function gapHTML(g, i) {
  if (g.st === "ok") return `<span class="cnw ok" data-gi="${i}">${esc(g.w)}</span>`;
  if (g.st === "skip") return `<span class="cnw skip" data-gi="${i}">${esc(g.w)}</span>`;
  const ph = g.pista ? g.w.slice(0, g.pista) + "…" : "";
  return `<input class="cngap" data-gi="${i}" style="width:${Math.max(4, g.w.length + 1.5)}ch" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="${esc(tl("hueco", lg()))}" placeholder="${esc(ph)}">`;
}
function lineaHTML(l, i) { return `<li data-li="${i}">${l.tok.map(t => t.g !== undefined ? gapHTML(M.gaps[t.g], t.g) : esc(t.s)).join("")}</li>`; }
function pintarJuego(el) {
  const S = st().S, sync = M.tiempos;
  const nota = [M.lrc ? `${T("lrcnota", {n: M.lrc.nombre})} <a href="#canciones" data-cn="noes">${T("noes")}</a>` : "", M.auto ? T("auto") : "", M.idioma && M.idioma !== S.learn ? T("otroidioma", {l: lname(M.idioma)}) : ""].filter(Boolean).map(x => `<p class="cnnote">${x}</p>`).join("");
  el.innerHTML = `<section class="cn cnplay">
    <div class="cnhead"><a class="cnback" href="#canciones">${T("volver")}</a>${M.deber ? `<span class="cntag">${T("deber")}</span>` : ""}
      <h1>${esc(M.titulo)}</h1>${nota}</div>
    <div class="cngrid">
      <div class="cnleft"><div class="cnstick">
        ${M.v ? `<div class="cnvid"><div id="cnyt"></div></div>` : ""}
        <div class="cnbar">
          <span class="cnprog" id="cnprog">${T("huecos", {a: hechos(), n: M.gaps.length})}</span>
          ${M.v ? `<button type="button" class="btn main" data-cn="play" id="cnplaybtn" ${IBA("play")}>${IB("play")}</button>` : ""}
          ${M.v && sync ? `<button type="button" class="btn" data-cn="rep" ${IBA("rep")}>${IB("rep")}</button>` : ""}
          <button type="button" class="btn" data-cn="pista" ${IBA("pista")}>${IB("pista")}</button>
          <button type="button" class="btn" data-cn="ver" ${IBA("ver")}>${IB("ver")}</button>
        </div>
        <p class="cnmsg" id="cnmsg" aria-live="polite">${M.msg || (M.v ? (sync ? T("pulsa") : T("sintiempos")) : "")}</p></div>
        ${M.v && M.tiempos ? `<div class="cnadj"><small>${T("ajuste")}</small><button type="button" class="btn" data-cn="aj" data-d="-0.5">${T("antes")}</button><span id="cnadjv">${M.ajuste ? (M.ajuste > 0 ? "+" : "") + M.ajuste.toFixed(1) + " s" : "0 s"}</span><button type="button" class="btn" data-cn="aj" data-d="0.5">${T("despues")}</button></div>` : ""}
        ${M.deber ? "" : `<div class="cnlvrow" role="group" aria-label="${esc(tl("nivel", lg()))}">${[1, 2, 3, 4].map(i => `<button type="button" class="cnlv sm${M.nivel === i ? " on" : ""}" data-cn="nivel" data-n="${i}" aria-pressed="${M.nivel === i}">${T("n" + i)}</button>`).join("")}</div>`}
        <div id="cnprof"></div>
      </div>
      <div class="cnright">
        <ol class="cnlyr" id="cnlyr">${M.lineas.map(lineaHTML).join("")}</ol>
        <p class="cnsrc">${M.origen ? esc(tl("letra_de", lg(), {s: tl(M.origen, lg())})) : ""}</p>
        <div id="cnend"><p><button type="button" class="btn" data-cn="fin">${T("fin")}</button></p></div>
      </div>
    </div></section>`;
  root = el.querySelector(".cn");
  const alto = (document.querySelector(".top") || {}).offsetHeight || 58, stick = root.querySelector(".cnstick");
  root.style.setProperty("--cntop", alto + "px");
  /* si la barra de arriba y el vídeo no dejan sitio para la letra, el vídeo no se queda fijo */
  if (stick && alto + stick.offsetHeight > innerHeight * 0.72) root.classList.add("cnflat");
  if (M.fin) pintarFin();
  if (M.v) ponerVideo();
  profe();
}
function msg(k, v) { const m = document.getElementById("cnmsg"); M.msg = k ? T(k, v) : ""; if (m) m.innerHTML = M.msg; }
function prog() { const p = document.getElementById("cnprog"); if (p) p.innerHTML = T("huecos", {a: hechos(), n: M.gaps.length}); }
const inputDe = i => root && root.querySelector(`.cngap[data-gi="${i}"]`);

function resolver(i, como) {
  const g = M.gaps[i]; if (!g || g.st) return;
  g.st = como;
  const inp = inputDe(i);
  if (inp) { const s = document.createElement("span"); s.className = "cnw " + como + " pop"; s.dataset.gi = i; s.textContent = g.w; inp.replaceWith(s); }
  if (como === "ok") { xp({n: 0, xp: 0, ok: true, src: "juego", juego: "cancion"}); msg("bien"); }
  prog();
  if (M.gaps.every(x => x.st)) return terminar();
  if (M.espera === i) { M.espera = -1; setTimeout(() => { try { if (player && !M.fin) player.playVideo(); } catch (e) {} }, 500); }
  else if (!player) { const sig = M.gaps.findIndex(x => !x.st); const n = inputDe(sig); if (n && i < sig) n.focus({preventScroll: true}); }
}
function actual() {
  /* el hueco sobre el que actúan 💡 y 👀: el que espera, el que tiene el foco o el primero sin hacer */
  if (M.espera >= 0 && !M.gaps[M.espera].st) return M.espera;
  if (M.sel >= 0 && !M.gaps[M.sel].st) return M.sel;
  return M.gaps.findIndex(g => !g.st);
}
function pista() {
  const i = actual(); if (i < 0) return; const g = M.gaps[i];
  g.pista = Math.min(g.w.length - 1, g.pista + 1);
  const inp = inputDe(i); if (inp) { inp.placeholder = g.w.slice(0, g.pista) + "…"; inp.focus({preventScroll: true}); }
}
function puntos() {
  const n = M.gaps.length, ok = M.gaps.reduce((s, g) => s + (g.st === "ok" ? (g.pista ? 0.5 : 1) : 0), 0), pct = n ? ok / n : 0;
  return {n, ok: M.gaps.filter(g => g.st === "ok").length, pct, est: pct >= 0.999 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0};
}
function terminar(forzar) {
  if (M.fin) return;
  const pend = M.gaps.filter(g => !g.st).length;
  if (pend && !forzar) { const b = root && root.querySelector('[data-cn="fin"]'); if (b) { b.dataset.cn = "fin2"; b.innerHTML = T("faltan", {n: pend}); } return; }
  M.fin = true; clearInterval(timer); timer = null;
  try { if (player) player.pauseVideo(); } catch (e) {}
  const p = puntos(), S = st().S;
  M.xpRun = Math.min(60, p.ok * 2) + (p.est === 3 ? 10 : 0);
  if (M.xpRun > 0) xp({n: M.xpRun, xp: M.xpRun, src: "juego", juego: "cancion"});
  if (M.clave && S.g) {
    S.g.cn = S.g.cn || {};
    const o = S.g.cn[M.clave] || {n: 0, best: 0, bp: 0};
    o.n++; o.last = p.est; o.best = Math.max(o.best, p.est); o.bp = Math.max(o.bp, Math.round(p.pct * 100)); o.t = M.titulo; o.d = Date.now(); if (M.v) o.v = M.v;
    S.g.cn[M.clave] = o; L().save();
  }
  pintarFin();
}
function pintarFin() {
  const p = puntos(), box = document.getElementById("cnend"); if (!box) return;
  box.innerHTML = `<div class="cnres" role="status"><h2>${T("res")}</h2><p class="cnstars" aria-label="${esc(tl("estrellas", lg(), {n: p.est}))}">${"★".repeat(p.est)}${"☆".repeat(3 - p.est)}</p>
    <p>${T("aciertos", {a: p.ok, n: p.n})}${M.xpRun ? ` · <b>${T("xpg", {n: M.xpRun})}</b>` : ""}</p>
    <p class="cnbtns"><button type="button" class="btn main" data-cn="otra">${T("otra")}</button>${M.deber ? "" : `<button type="button" class="btn" data-cn="otronivel">${T("otronivel")}</button>`}<a class="btn" href="#canciones">${T("otracancion")}</a></p></div>`;
  box.scrollIntoView({block: "nearest", behavior: "smooth"});
}

/* ---------- vídeo de YouTube ---------- */
let ytP = null;
function cargarYT() {
  if (window.YT && window.YT.Player) return Promise.resolve(true);
  if (ytP) return ytP;
  ytP = new Promise(res => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { try { prev && prev(); } catch (e) {} res(true); };
    const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; s.async = true; s.onerror = () => res(false);
    document.head.appendChild(s);
    setTimeout(() => res(!!(window.YT && window.YT.Player)), 9000);
  });
  return ytP;
}
function sinVideo() {
  const v = root && root.querySelector(".cnvid"); if (!v || !M) return;
  v.outerHTML = `<div class="cnnovid"><p>${T("sinvideo")} <a href="https://www.youtube.com/watch?v=${esc(M.v)}" target="_blank" rel="noopener">${T("abriryt")} ↗</a></p><p class="small">${TB("sinvideo2")}</p></div>`;
  root.querySelectorAll('[data-cn="play"],[data-cn="rep"]').forEach(b => b.remove()); msg("");
  player = null;
}
async function ponerVideo() {
  const ok = await cargarYT(), mio = M;
  if (!M || M !== mio || !root || !document.getElementById("cnyt")) return;
  if (!ok) return sinVideo();
  try {
    player = new YT.Player("cnyt", {videoId: M.v, width: "100%", height: "100%",
      playerVars: {playsinline: 1, rel: 0, modestbranding: 1, cc_load_policy: 0, iv_load_policy: 3, start: Math.floor(M.pos || 0), origin: location.origin && location.origin !== "null" ? location.origin : undefined},
      events: {
        onReady: () => { try { player.unloadModule && player.unloadModule("captions"); } catch (e) {} if (M && M.pos) M.lastT = M.pos; },
        onStateChange: e => { const b = document.getElementById("cnplaybtn"); if (b) { const k = e.data === 1 ? "pausa" : "play"; b.innerHTML = IB(k); b.title = b.ariaLabel = tl(k, lg()).replace(/^\S+\s/, ""); } if (e.data === 1) { try { player.unloadModule && player.unloadModule("captions"); } catch (x) {} arrancar(); } },
        onError: () => sinVideo()
      }});
  } catch (e) { sinVideo(); }
}
function arrancar() { if (!timer) timer = setInterval(tic, 120); }
function tic() {
  if (!M || !player || !root || !document.body.contains(root)) { clearInterval(timer); timer = null; return; }
  let t; try { t = player.getCurrentTime(); } catch (e) { return; }
  if (typeof t !== "number") return;
  const prev = M.lastT; M.lastT = t; M.pos = t;
  /* frase que suena: resaltarla y llevarla a la vista */
  const li = M.espera >= 0 && !M.gaps[M.espera].st && M.tiempos ? M.gaps[M.espera].li : M.tiempos ? M.lineas.findIndex((l, i) => t >= l.t && t < l.t + l.d + (M.lineas[i + 1] ? 0 : 2)) : -1;
  if (li !== M.cur) {
    root.querySelectorAll(".cnlyr li.cur").forEach(x => x.classList.remove("cur"));
    M.cur = li;
    const n = li >= 0 && root.querySelector(`.cnlyr li[data-li="${li}"]`);
    if (n) {
      n.classList.add("cur"); const box = document.getElementById("cnlyr");
      if (box && box.scrollHeight > box.clientHeight + 4) box.scrollTo({top: n.offsetTop - box.clientHeight / 2 + n.offsetHeight / 2, behavior: "smooth"});
      else { /* móvil: la página entera; que la frase quede debajo del vídeo */
        const stick = root.querySelector(".cnstick"), arriba = stick ? stick.getBoundingClientRect().bottom + 12 : 80, r = n.getBoundingClientRect();
        if (r.top < arriba || r.bottom > innerHeight - 20) scrollTo({top: scrollY + r.top - arriba - 10, behavior: "smooth"});
      }
    }
  }
  if (!M.tiempos || M.fin) return;
  /* ¿hemos pasado el final de una frase con un hueco sin hacer? → parar */
  let st1; try { st1 = player.getPlayerState(); } catch (e) {}
  if (st1 !== 1 || t < prev || t - prev > 2) return;
  for (const [i, g] of M.gaps.entries()) {
    if (g.st) continue;
    const l = M.lineas[g.li], fin = l.t + l.d - 0.12;
    if (prev < fin && t >= fin) {
      try { player.pauseVideo(); } catch (e) {}
      M.espera = i; msg("escribe"); setTimeout(tic, 0);
      const inp = inputDe(i); if (inp) { inp.classList.add("now"); inp.focus({preventScroll: true}); }
      break;
    }
  }
}
function repetir() {
  if (!player) return;
  const i = actual(), li = i >= 0 && M.espera === i ? M.gaps[i].li : (M.cur >= 0 ? M.cur : (i >= 0 ? M.gaps[i].li : 0));
  const l = M.lineas[li]; if (!l) return;
  const t = Math.max(0, l.t - 0.6); M.lastT = t;
  try { player.seekTo(t, true); player.playVideo(); } catch (e) {}
}
function irALinea(li) {
  if (!player || !M.tiempos) return;
  const l = M.lineas[li]; if (!l) return; const t = Math.max(0, l.t - 0.3); M.lastT = t;
  try { player.seekTo(t, true); player.playVideo(); } catch (e) {}
}

/* ---------- profe: mandar como deberes ---------- */
async function profe() {
  const box = document.getElementById("cnprof"); if (!box || M.deber || !C() || !C().usuario) return;
  if (!(await servidor())) return;
  const r = await C().api("canciones?clases=1").catch(() => ({ok: false}));
  if (!r.ok || !document.body.contains(box)) return;
  const {admin, clases} = r.j;
  box.innerHTML = `<details class="cnteach"><summary>${T("mandar")}</summary>${!admin && !clases.length ? `<p class="small">${T("sinclases")}</p>` : `<form id="cnteachf">
    <label>${T("para")}<select name="grupo"><option value="">${T(admin ? "todos" : "todas")}</option>${clases.map(c => `<option value="${esc(c.id)}">${esc(c.nombre)}</option>`).join("")}</select></label>
    <label>${T("nivel")}<select name="nivel">${[1, 2, 3, 4].map(i => `<option value="${i}"${M.nivel === i ? " selected" : ""}>${esc(tl("n" + i, lg()))} · ${esc(tl("nd" + i, lg()))}</option>`).join("")}</select></label>
    <label>${T("hasta")}<input type="date" name="limite" required value="${hoy(7)}"></label>
    <label>${T("nota")}<input name="nota" maxlength="200"></label>
    <p class="cnerr" id="cnterr" role="alert" hidden></p><button class="btn main" type="submit">${T("mandarb")}</button></form>`}</details>`;
  const f = box.querySelector("#cnteachf"); if (!f) return;
  f.onsubmit = async e => {
    e.preventDefault(); const b = f.querySelector("[type=submit]"), er = f.querySelector("#cnterr"); b.disabled = true; er.hidden = true;
    const q = await C().api("canciones", "POST", {accion: "asignar", v: M.v, titulo: M.titulo, idioma: M.idioma || lg(), nivel: +f.nivel.value, lineas: M.crudas, grupo: f.grupo.value, limite: f.limite.value, nota: f.nota.value}).catch(() => ({ok: false, j: {}}));
    b.disabled = false;
    if (q.ok) { f.outerHTML = `<p class="cnok">${T("mandada")}</p>`; } else { er.hidden = false; er.innerHTML = T(q.j && q.j.error === "sin_clases" ? "sinclases" : "e_mandar"); }
  };
}

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-cn]");
  if (!b) {
    const li = e.target.closest(".cnlyr li"); if (li && M && !e.target.closest("input")) irALinea(+li.dataset.li);
    return;
  }
  const a = b.dataset.cn;
  if (a === "pref") { st().S.cnNivel = +b.dataset.n; L().save(); b.parentElement.querySelectorAll(".cnlv").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); }); return; }
  if (a === "usarres") return usarResultado(+b.dataset.i);
  if (a === "noes") { e.preventDefault(); const v = M && M.v, q = M ? String(M.titulo || "").replace(/\([^)]*\)|\[[^\]]*\]/g, " ").replace(/\b(official|oficial|video|vídeo|lyrics?|letra|audio)\b/gi, " ").replace(/\s+/g, " ").trim() : ""; parar(); M = null; F = {v, q}; if (location.hash.slice(1) === "canciones") pintarInicio(app()); else location.hash = "canciones"; return; }
  if (!M) return;
  if (a === "play") { try { if (player.getPlayerState() === 1) player.pauseVideo(); else { M.espera = -1; player.playVideo(); } } catch (x) {} }
  else if (a === "rep") repetir();
  else if (a === "pista") pista();
  else if (a === "ver") { const i = actual(); if (i >= 0) resolver(i, "skip"); }
  else if (a === "fin") terminar();
  else if (a === "fin2") terminar(true);
  else if (a === "nivel") reiniciar(+b.dataset.n);
  else if (a === "otra") reiniciar();
  else if (a === "aj") {
    const d = +b.dataset.d, mv = l => ({...l, t: Math.max(0, Math.round((l.t + d) * 100) / 100)}); M.ajuste = Math.round(((M.ajuste || 0) + d) * 10) / 10;
    for (const l of M.lineas) l.t = mv(l).t;
    M.crudas = M.crudas.map(mv);
    const s = document.getElementById("cnadjv"); if (s) s.textContent = (M.ajuste > 0 ? "+" : "") + M.ajuste.toFixed(1) + " s";
    try { if (player) M.lastT = player.getCurrentTime(); } catch (x) {}
  }
  else if (a === "otronivel") { const s = root && root.querySelector(".cnlvrow"); if (s) s.scrollIntoView({block: "center", behavior: "smooth"}); }
});
document.addEventListener("input", e => {
  const inp = e.target.closest && e.target.closest(".cngap"); if (!inp || !M) return;
  const i = +inp.dataset.gi, g = M.gaps[i]; inp.classList.remove("bad");
  if (g && norm(inp.value) === norm(g.w)) resolver(i, "ok");
});
document.addEventListener("keydown", e => {
  const inp = e.target.closest && e.target.closest(".cngap"); if (!inp || !M || e.key !== "Enter") return;
  e.preventDefault();
  const i = +inp.dataset.gi, g = M.gaps[i]; if (!g || g.st) return;
  if (!inp.value.trim()) { if (M.espera === i) repetir(); return; }
  if (norm(inp.value) === norm(g.w)) return resolver(i, "ok");
  g.fallos++; inp.classList.remove("bad"); void inp.offsetWidth; inp.classList.add("bad"); msg("casi");
  xp({n: 0, xp: 0, ok: false, src: "juego", juego: "cancion"});
  if (g.fallos >= 2 && g.pista < 1) pista();
});
document.addEventListener("focusin", e => { const inp = e.target.closest && e.target.closest(".cngap"); if (inp && M) M.sel = +inp.dataset.gi; });

window.LYACanciones = {render, isSongs, tab: tabLink, _test: {idVideo, parseLetra, huecos, norm, get M() { return M; }}};
})();
