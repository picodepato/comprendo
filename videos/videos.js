/* Vídeos con preguntas: un vídeo de YouTube que se para en ciertos momentos y no sigue hasta contestar.
   - Preparados por nosotros (videos/preparados.js) y creados por los profes (editor: pegar el enlace, ir al momento
     y «Añadir pregunta aquí»). Se guardan con los concursos (api/concursos, tipo "video"); sin cuenta, en este aparato.
   - A solas (#video-solo-<id>): se para en cada pregunta. Resultado en S.g.ac[id] (deberes).
   - En directo (código de 6 cifras, misma sala que los concursos). Antes de lanzarlo el profe elige:
       📺 Proyección: el vídeo en la pantalla grande; a los móviles solo les salen las preguntas cuando tocan.
       📱 Individual: cada uno ve el vídeo en su móvil y se para solo en cada pregunta.
     y si da tiempo para leer antes todas las preguntas. Si abre la sala «avisando a la clase», los alumnos entran solos desde «Deberes».
   Rutas: #videos · #videos-editar[-<id>] · #video-<id> · #video-solo-<id> · #videos-proyectar-<código> · #vjugar[-<código>] */
(() => {
const L = () => window.LYA, st = () => L().get();
const A = () => window.LYAActividades;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const $ = s => document.querySelector(s);
const STR = {
  es: {tab: "📺 Vídeos", h1: "Vídeos con preguntas", sub: "El vídeo se para y no sigue hasta que contestas. Míralo tú solo o en clase, todos a la vez.",
    unirse: "Unirse con un código", codigo: "Código", entrar: "Entrar", crear: "✏️ Crear un vídeo con preguntas",
    prep: "Preparados por COMPRENDO", prep_otros: "En otros idiomas", prep_no: "Todavía no hay vídeos preparados en {l}.", mios: "Mis vídeos", ninguno: "Todavía no has creado ninguno. Pega un enlace de YouTube y añade preguntas en los momentos que quieras.",
    npreg: "{n} preguntas", solo: "▶ Verlo yo", directo: "📺 En clase, en directo", editar: "✏️ Editar", copia: "Guardar una copia para editarla", borrar: "🗑 Borrar",
    seguro: "¿Borrar «{t}»? No se puede deshacer.", volver: "← Vídeos", e_noexiste: "Este vídeo no existe o se ha borrado.", e_red: "No hay conexión con el servidor. Inténtalo otra vez.",
    local: "Sin cuenta, tus vídeos se guardan solo en este aparato.",
    ed_url: "Enlace de YouTube", ed_cargar: "Cargar", ed_titulo: "Título", ed_aqui: "➕ Añadir pregunta aquí ({t})", ed_ayuda: "Pon el vídeo, páralo donde quieras preguntar y pulsa «Añadir pregunta aquí».",
    ia: "✨ Proponer preguntas con IA", ia_sub: "La web saca lo que se dice en el vídeo (sus subtítulos, con el minuto de cada frase) y te da un prompt para cualquier IA (ChatGPT, Claude, Gemini, Copilot…). Pegas su respuesta y cada pregunta se pone justo después del momento en que el vídeo da la respuesta. Luego puedes cambiar lo que quieras.",
    ia_novid: "Primero carga un vídeo de YouTube.", ia_buscando: "Buscando los subtítulos del vídeo…", ia_subs: "✓ Tenemos los subtítulos de YouTube ({n} frases, {l}).", ia_tr: "✓ Usando la transcripción que has pegado ({n} frases).",
    ia_nosubs: "YouTube no nos da los subtítulos de este vídeo. Pégalos tú: en YouTube, debajo del vídeo, pulsa «…más» → «Mostrar transcripción», selecciona todo el texto (con los minutos) y pégalo aquí.",
    ia_pegartr: "Pegar la transcripción a mano", ia_trph: "0:00\nHola a todos…\n0:04\nHoy vamos a ver…", ia_trusar: "Usar esta transcripción", ia_trmal: "No encuentro minutos (como 1:23) en lo que has pegado. Copia la transcripción con sus marcas de tiempo.",
    ia_p1: "1. Copia este prompt", ia_p1b: "Pégalo en cualquier IA. Ya lleva todo lo que se dice en el vídeo con sus minutos.", ia_n: "Preguntas", ia_idioma: "Idioma de las preguntas", ia_mismo: "El del vídeo", ia_nivel: "Nivel (opcional)", ia_nivelej: "Por ejemplo: 2º ESO, A2",
    ia_extra: "Algo más (opcional)", ia_extraej: "Por ejemplo: solo sobre las fechas", ia_copiar: "📋 Copiar el prompt", ia_copiado: "Copiado", ia_sintexto: "Primero hacen falta los subtítulos o la transcripción del vídeo.",
    ia_p2: "2. Pega aquí lo que te responda la IA", ia_pegaej: "TÍTULO: …\n---\nMOMENTO: 1:23\nPREGUNTA: …\nA) …\nB) …\nC) …\nCORRECTA: A\n---", ia_poner: "✨ Poner las preguntas en el vídeo",
    ia_puestas: "Se han puesto {n} preguntas en su momento. Revísalas abajo y pulsa «Guardar».", ia_sinmom: "{m} no traían MOMENTO y se han repartido por el vídeo: colócalas con «⏱ Ahora».", ia_nada: "No encuentro preguntas en lo que has pegado. Comprueba que has copiado toda la respuesta de la IA.",
    ed_momento: "Momento", ed_ahora: "⏱ Ahora", ed_ir: "▶ Ver", pregunta: "Pregunta {n}", textop: "Escribe la pregunta", respuesta: "Respuesta {l}", correcta: "Correcta", tiempo: "Tiempo (en directo)",
    seg: "{n} s", masr: "+ Respuesta", quitar: "Quitar la pregunta", guardar: "💾 Guardar", guardado: "Guardado.",
    e_url: "Ese enlace no es de un vídeo de YouTube.", e_titulo: "Ponle un título.", e_vacio: "Añade al menos una pregunta.", e_preg: "La pregunta {n} está incompleta: necesita texto, al menos 2 respuestas y la correcta marcada.",
    e_cuenta: "Para guardarlo en la nube entra con tu cuenta. Se ha guardado en este aparato.", e_demasiados: "Has llegado al máximo de actividades guardadas. Borra alguna.",
    sinvideo: "No se ha podido cargar el reproductor de YouTube.", abriryt: "Abrir en YouTube",
    seguir: "Seguir viendo ▶", bien: "¡Correcto!", mal: "No es esa", era: "Era: {r}", fin: "¡Terminado!", res: "Has acertado {a} de {n}", otra: "Otra vez", pdeq: "Pregunta {i} de {n}",
    abriendo: "Abriendo la sala…", e_abrir: "No se ha podido abrir la sala.", e_espera: "Demasiados intentos. Espera un poco.",
    entrad: "Entrad en", ycodigo: "y escribid el código", esperando: "Esperando alumnos…", conectados: "{n} conectados", echar: "Toca un nombre para quitarlo.",
    modo: "¿Cómo lo veis?", m_proy: "📺 Proyección", m_proy2: "El vídeo en esta pantalla. A los móviles solo les salen las preguntas cuando el vídeo se para.",
    m_ind: "📱 Individual", m_ind2: "Cada uno ve el vídeo en su móvil (con auriculares) y se para solo en cada pregunta.",
    lectura: "Tiempo para leer antes todas las preguntas", nolect: "No", lanzar: "▶ Lanzar", pantalla: "⛶ Pantalla completa", terminar: "Terminar",
    leed: "Leed las preguntas", empezarya: "Empezar ya ▶", atentos: "¡Atentos!", contestadas: "{a} de {n} han contestado", pasar: "Cerrar la pregunta",
    progreso: "Progreso de la clase", llevan: "{a}/{n}", aciertos: "aciertos", podio: "¡Fin!", cerrar: "Cerrar la sala", nadie: "Aún no hay nadie.",
    j_dentro: "¡Ya estás dentro!", j_espera: "Espera a que tu profe lance el vídeo.", j_mira: "👀 Mira la pantalla grande. Cuando el vídeo se pare, aquí te sale la pregunta.",
    j_enviada: "¡Respuesta enviada!", j_esperad: "Espera a los demás…", j_tarde: "Se acabó el tiempo", j_play: "▶ Empezar el vídeo", j_acabado: "¡Has terminado! Espera a que acaben los demás.",
    j_puesto: "Vas en el puesto {p} de {n}", j_final: "Has quedado en el puesto {p} de {n}", j_pts: "{n} puntos", tunombre: "Tu nombre",
    e_codigo: "Ese código no existe. Mira bien la pantalla.", e_nombre: "Escribe tu nombre (al menos 2 letras).", e_usado: "Ese nombre ya está en la sala. Ponte otro.",
    e_llena: "La sala está llena (30).", e_terminado: "Esta sala ya ha terminado.", salir: "Salir", e_gen: "Algo ha fallado. Inténtalo otra vez."},
  en: {tab: "📺 Videos", h1: "Videos with questions", sub: "The video stops and won't go on until you answer. Watch it alone or in class, all at the same time.",
    unirse: "Join with a code", codigo: "Code", entrar: "Join", crear: "✏️ Create a video with questions",
    prep: "Made by COMPRENDO", prep_otros: "In other languages", prep_no: "There are no ready-made videos in {l} yet.", mios: "My videos", ninguno: "You haven't made any yet. Paste a YouTube link and add questions wherever you like.",
    npreg: "{n} questions", solo: "▶ Watch it", directo: "📺 Live in class", editar: "✏️ Edit", copia: "Save a copy to edit", borrar: "🗑 Delete",
    seguro: "Delete “{t}”? This can't be undone.", volver: "← Videos", e_noexiste: "This video doesn't exist or has been deleted.", e_red: "No connection to the server. Try again.",
    local: "Without an account, your videos are only saved on this device.",
    ed_url: "YouTube link", ed_cargar: "Load", ed_titulo: "Title", ed_aqui: "➕ Add a question here ({t})", ed_ayuda: "Play the video, pause where you want to ask and press “Add a question here”.",
    ia: "✨ Suggest questions with AI", ia_sub: "The site gets what is said in the video (its subtitles, with the time of each sentence) and gives you a prompt for any AI (ChatGPT, Claude, Gemini, Copilot…). Paste its answer and each question is placed right after the video gives the answer. Then change anything you like.",
    ia_novid: "Load a YouTube video first.", ia_buscando: "Looking for the video's subtitles…", ia_subs: "✓ We have the YouTube subtitles ({n} lines, {l}).", ia_tr: "✓ Using the transcript you pasted ({n} lines).",
    ia_nosubs: "YouTube doesn't give us this video's subtitles. Paste them yourself: on YouTube, under the video, press “…more” → “Show transcript”, select all the text (with the times) and paste it here.",
    ia_pegartr: "Paste the transcript by hand", ia_trph: "0:00\nHi everyone…\n0:04\nToday we're going to see…", ia_trusar: "Use this transcript", ia_trmal: "I can't find any times (like 1:23) in what you pasted. Copy the transcript with its timestamps.",
    ia_p1: "1. Copy this prompt", ia_p1b: "Paste it into any AI. It already includes everything said in the video, with the times.", ia_n: "Questions", ia_idioma: "Language of the questions", ia_mismo: "The video's", ia_nivel: "Level (optional)", ia_nivelej: "For example: Year 8, A2",
    ia_extra: "Anything else (optional)", ia_extraej: "For example: only about the dates", ia_copiar: "📋 Copy the prompt", ia_copiado: "Copied", ia_sintexto: "First we need the video's subtitles or transcript.",
    ia_p2: "2. Paste the AI's answer here", ia_pegaej: "TÍTULO: …\n---\nMOMENTO: 1:23\nPREGUNTA: …\nA) …\nB) …\nC) …\nCORRECTA: A\n---", ia_poner: "✨ Put the questions in the video",
    ia_puestas: "{n} questions have been placed at their time. Check them below and press “Save”.", ia_sinmom: "{m} had no MOMENTO and were spread across the video: place them with “⏱ Now”.", ia_nada: "I can't find any questions in what you pasted. Check you copied the AI's whole answer.",
    ed_momento: "Time", ed_ahora: "⏱ Now", ed_ir: "▶ See", pregunta: "Question {n}", textop: "Write the question", respuesta: "Answer {l}", correcta: "Correct", tiempo: "Time (live)",
    seg: "{n} s", masr: "+ Answer", quitar: "Remove the question", guardar: "💾 Save", guardado: "Saved.",
    e_url: "That isn't a YouTube video link.", e_titulo: "Give it a title.", e_vacio: "Add at least one question.", e_preg: "Question {n} is incomplete: it needs text, at least 2 answers and the correct one marked.",
    e_cuenta: "Sign in to save it in the cloud. It has been saved on this device.", e_demasiados: "You've reached the maximum number of saved activities. Delete some.",
    sinvideo: "The YouTube player couldn't load.", abriryt: "Open on YouTube",
    seguir: "Keep watching ▶", bien: "Correct!", mal: "Not that one", era: "It was: {r}", fin: "Finished!", res: "You got {a} of {n} right", otra: "Again", pdeq: "Question {i} of {n}",
    abriendo: "Opening the room…", e_abrir: "The room couldn't be opened.", e_espera: "Too many attempts. Wait a little.",
    entrad: "Go to", ycodigo: "and type the code", esperando: "Waiting for students…", conectados: "{n} connected", echar: "Tap a name to remove it.",
    modo: "How will you watch it?", m_proy: "📺 Projector", m_proy2: "The video on this screen. Phones only show the questions when the video stops.",
    m_ind: "📱 Individual", m_ind2: "Everyone watches on their phone (with headphones) and it stops by itself at each question.",
    lectura: "Time to read all the questions first", nolect: "No", lanzar: "▶ Launch", pantalla: "⛶ Full screen", terminar: "Finish",
    leed: "Read the questions", empezarya: "Start now ▶", atentos: "Get ready!", contestadas: "{a} of {n} have answered", pasar: "Close the question",
    progreso: "Class progress", llevan: "{a}/{n}", aciertos: "right", podio: "The end!", cerrar: "Close the room", nadie: "Nobody yet.",
    j_dentro: "You're in!", j_espera: "Wait for your teacher to start the video.", j_mira: "👀 Watch the big screen. When the video stops, the question appears here.",
    j_enviada: "Answer sent!", j_esperad: "Wait for the others…", j_tarde: "Time's up", j_play: "▶ Start the video", j_acabado: "You've finished! Wait for the others.",
    j_puesto: "You're in position {p} of {n}", j_final: "You finished {p} of {n}", j_pts: "{n} points", tunombre: "Your name",
    e_codigo: "That code doesn't exist. Check the screen.", e_nombre: "Write your name (at least 2 letters).", e_usado: "That name is already in the room. Choose another.",
    e_llena: "The room is full (30).", e_terminado: "This room has already finished.", salir: "Leave", e_gen: "Something went wrong. Try again."},
  ca: {tab: "📺 Vídeos", h1: "Vídeos amb preguntes", sub: "El vídeo s'atura i no continua fins que contestes. Mira'l tot sol o a classe, tots alhora.",
    unirse: "Unir-se amb un codi", codigo: "Codi", entrar: "Entrar", crear: "✏️ Crear un vídeo amb preguntes",
    prep: "Preparats per COMPRENDO", prep_otros: "En altres llengües", prep_no: "Encara no hi ha vídeos preparats en {l}.", mios: "Els meus vídeos", ninguno: "Encara no n'has creat cap. Enganxa un enllaç de YouTube i afegeix preguntes on vulguis.",
    npreg: "{n} preguntes", solo: "▶ Mirar-lo", directo: "📺 A classe, en directe", editar: "✏️ Editar", copia: "Guardar-ne una còpia per editar-la", borrar: "🗑 Esborrar",
    seguro: "Esborrar «{t}»? No es pot desfer.", volver: "← Vídeos", e_noexiste: "Aquest vídeo no existeix o s'ha esborrat.", e_red: "No hi ha connexió amb el servidor. Torna-ho a provar.",
    local: "Sense compte, els teus vídeos només es guarden en aquest aparell.",
    ed_url: "Enllaç de YouTube", ed_cargar: "Carregar", ed_titulo: "Títol", ed_aqui: "➕ Afegir una pregunta aquí ({t})", ed_ayuda: "Posa el vídeo, atura'l on vulguis preguntar i prem «Afegir una pregunta aquí».",
    ia: "✨ Proposar preguntes amb IA", ia_sub: "La web treu el que es diu al vídeo (els subtítols, amb el minut de cada frase) i et dona un prompt per a qualsevol IA (ChatGPT, Claude, Gemini, Copilot…). Enganxes la resposta i cada pregunta es posa just després del moment en què el vídeo dona la resposta. Després pots canviar el que vulguis.",
    ia_novid: "Primer carrega un vídeo de YouTube.", ia_buscando: "Buscant els subtítols del vídeo…", ia_subs: "✓ Tenim els subtítols de YouTube ({n} frases, {l}).", ia_tr: "✓ Fent servir la transcripció que has enganxat ({n} frases).",
    ia_nosubs: "YouTube no ens dona els subtítols d'aquest vídeo. Enganxa'ls tu: a YouTube, sota el vídeo, prem «…més» → «Mostra la transcripció», selecciona tot el text (amb els minuts) i enganxa'l aquí.",
    ia_pegartr: "Enganxar la transcripció a mà", ia_trph: "0:00\nHola a tothom…\n0:04\nAvui veurem…", ia_trusar: "Fer servir aquesta transcripció", ia_trmal: "No trobo minuts (com 1:23) en el que has enganxat. Copia la transcripció amb les marques de temps.",
    ia_p1: "1. Copia aquest prompt", ia_p1b: "Enganxa'l a qualsevol IA. Ja porta tot el que es diu al vídeo amb els minuts.", ia_n: "Preguntes", ia_idioma: "Idioma de les preguntes", ia_mismo: "El del vídeo", ia_nivel: "Nivell (opcional)", ia_nivelej: "Per exemple: 2n d'ESO, A2",
    ia_extra: "Alguna cosa més (opcional)", ia_extraej: "Per exemple: només sobre les dates", ia_copiar: "📋 Copiar el prompt", ia_copiado: "Copiat", ia_sintexto: "Primer calen els subtítols o la transcripció del vídeo.",
    ia_p2: "2. Enganxa aquí el que et respongui la IA", ia_pegaej: "TÍTULO: …\n---\nMOMENTO: 1:23\nPREGUNTA: …\nA) …\nB) …\nC) …\nCORRECTA: A\n---", ia_poner: "✨ Posar les preguntes al vídeo",
    ia_puestas: "S'han posat {n} preguntes al seu moment. Revisa-les a sota i prem «Guardar».", ia_sinmom: "{m} no portaven MOMENTO i s'han repartit pel vídeo: col·loca-les amb «⏱ Ara».", ia_nada: "No trobo preguntes en el que has enganxat. Comprova que has copiat tota la resposta de la IA.",
    ed_momento: "Moment", ed_ahora: "⏱ Ara", ed_ir: "▶ Veure", pregunta: "Pregunta {n}", textop: "Escriu la pregunta", respuesta: "Resposta {l}", correcta: "Correcta", tiempo: "Temps (en directe)",
    seg: "{n} s", masr: "+ Resposta", quitar: "Treure la pregunta", guardar: "💾 Guardar", guardado: "Guardat.",
    e_url: "Aquest enllaç no és d'un vídeo de YouTube.", e_titulo: "Posa-li un títol.", e_vacio: "Afegeix almenys una pregunta.", e_preg: "La pregunta {n} no està completa: necessita text, almenys 2 respostes i la correcta marcada.",
    e_cuenta: "Per guardar-lo al núvol entra amb el teu compte. S'ha guardat en aquest aparell.", e_demasiados: "Has arribat al màxim d'activitats guardades. Esborra'n alguna.",
    sinvideo: "No s'ha pogut carregar el reproductor de YouTube.", abriryt: "Obrir a YouTube",
    seguir: "Continuar mirant ▶", bien: "Correcte!", mal: "No és aquesta", era: "Era: {r}", fin: "Acabat!", res: "N'has encertat {a} de {n}", otra: "Una altra vegada", pdeq: "Pregunta {i} de {n}",
    abriendo: "Obrint la sala…", e_abrir: "No s'ha pogut obrir la sala.", e_espera: "Massa intents. Espera una mica.",
    entrad: "Entreu a", ycodigo: "i escriviu el codi", esperando: "Esperant alumnes…", conectados: "{n} connectats", echar: "Toca un nom per treure'l.",
    modo: "Com el mireu?", m_proy: "📺 Projecció", m_proy2: "El vídeo en aquesta pantalla. Als mòbils només els surten les preguntes quan el vídeo s'atura.",
    m_ind: "📱 Individual", m_ind2: "Cadascú mira el vídeo al seu mòbil (amb auriculars) i s'atura sol a cada pregunta.",
    lectura: "Temps per llegir abans totes les preguntes", nolect: "No", lanzar: "▶ Llançar", pantalla: "⛶ Pantalla completa", terminar: "Acabar",
    leed: "Llegiu les preguntes", empezarya: "Començar ja ▶", atentos: "Atents!", contestadas: "{a} de {n} han contestat", pasar: "Tancar la pregunta",
    progreso: "Progrés de la classe", llevan: "{a}/{n}", aciertos: "encerts", podio: "Fi!", cerrar: "Tancar la sala", nadie: "Encara no hi ha ningú.",
    j_dentro: "Ja hi ets!", j_espera: "Espera que el teu profe llanci el vídeo.", j_mira: "👀 Mira la pantalla gran. Quan el vídeo s'aturi, aquí et sortirà la pregunta.",
    j_enviada: "Resposta enviada!", j_esperad: "Espera els altres…", j_tarde: "S'ha acabat el temps", j_play: "▶ Començar el vídeo", j_acabado: "Has acabat! Espera que acabin els altres.",
    j_puesto: "Vas en la posició {p} de {n}", j_final: "Has quedat en la posició {p} de {n}", j_pts: "{n} punts", tunombre: "El teu nom",
    e_codigo: "Aquest codi no existeix. Mira bé la pantalla.", e_nombre: "Escriu el teu nom (almenys 2 lletres).", e_usado: "Aquest nom ja és a la sala. Posa-te'n un altre.",
    e_llena: "La sala és plena (30).", e_terminado: "Aquesta sala ja ha acabat.", salir: "Sortir", e_gen: "Alguna cosa ha fallat. Torna-ho a provar."}
};
const lang = () => { try { const l = st().S.learn; return STR[l] ? l : (STR[st().S.know] ? st().S.know : "es"); } catch (e) { return "es"; } };
const t = (k, v) => { let o = STR[lang()][k] ?? STR.es[k] ?? k; for (const x in v || {}) o = o.split(`{${x}}`).join(v[x]); return o; };
/* A1: con el idioma que ya sabe al lado, como el resto de la web (solo si dice algo distinto) */
const t2 = (k, v) => { try { const S = st().S, b = STR[S.know] && S.know !== lang() && window.LYA?.both?.() ? S.know : null; if (!b) return ""; let o = STR[b][k] ?? STR.es[k] ?? k; for (const x in v || {}) o = o.split(`{${x}}`).join(v[x]); return o === t(k, v) ? "" : o; } catch (e) { return ""; } };
const T = (k, v) => { const b = t2(k, v); return esc(t(k, v)) + (b ? " · " + esc(b) : ""); };
const SIMB = ["★", "♥", "☾", "✚"], LETRAS = ["A", "B", "C", "D"];
const opcHTML = (o, i, extra = "") => `<span class="cc-sim" aria-hidden="true">${SIMB[i]}</span><span class="cc-ot">${esc(o)}</span>${extra}`;
const mmss = s => { s = Math.max(0, Math.floor(+s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = String(s % 60).padStart(2, "0"); return h ? `${h}:${String(m).padStart(2, "0")}:${x}` : `${m}:${x}`; };
const leerT = s => { const p = String(s).trim().split(":").map(Number); if (p.some(n => !(n >= 0))) return NaN; return p.reduce((a, n) => a * 60 + n, 0); };
const ytId = s => { s = String(s || "").trim(); if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s; const m = s.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/|\/v\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : ""; };
const miniatura = v => `https://i.ytimg.com/vi/${esc(v)}/mqdefault.jpg`;

/* ---------- datos ---------- */
const store = {get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }};
const LKEY = "lyaVideos", HKEY = "lyaCcHost", JKEY = "lyaCcJug";  /* sala: las mismas claves que los concursos */
const locales = () => store.get(LKEY, []);
const cuenta = () => window.LYACuentas && window.LYACuentas.usuario ? window.LYACuentas : null;
async function api(ruta, datos) {
  if (window.LYACuentas) return window.LYACuentas.api(ruta, datos ? "POST" : "GET", datos);
  const r = await fetch("api/" + ruta, {method: datos ? "POST" : "GET", headers: {"Content-Type": "application/json"}, body: datos ? JSON.stringify(datos) : undefined});
  let j = {}; try { j = await r.json(); } catch (e) {} return {ok: r.ok, code: r.status, j};
}
const PREP = () => window.LYAVideosPreparados || [];
const idLocal = () => "l" + Array.from(crypto.getRandomValues(new Uint8Array(5)), b => b.toString(16).padStart(2, "0")).join("");
async function cargar(id) {
  if (id.startsWith("p-")) { const c = PREP().find(x => x.id === id); return c ? {c: {...c, tipo: "video"}, mio: false, prep: true} : null; }
  if (id.startsWith("l")) { const c = locales().find(x => x.id === id); return c ? {c, mio: true} : null; }
  const r = await api("concursos?id=" + encodeURIComponent(id)).catch(() => null);
  if (!r) throw new Error("red");
  return r.ok && r.j.concurso && r.j.concurso.tipo === "video" ? {c: r.j.concurso, mio: r.j.mio} : null;
}
function aviso(txt, mal) { const el = $("#vd-msg"); if (!el) return; el.textContent = txt; el.className = "cc-msg" + (mal ? " mal" : " bien"); el.hidden = false; }
const xp = (n, extra) => { try { dispatchEvent(new CustomEvent("lya:xp", {detail: {xp: n, src: "video", ...extra}})); } catch (e) {} };

/* ---------- YouTube ---------- */
function cargarYT() {
  if (window.YT && window.YT.Player) return Promise.resolve(true);
  return new Promise(res => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { try { prev && prev(); } catch (e) {} res(true); };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) { const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; s.async = true; s.onerror = () => res(false); document.head.appendChild(s); }
    setTimeout(() => res(!!(window.YT && window.YT.Player)), 9000);
  });
}
/* crea un reproductor en el elemento #idEl; ev = {listo, estado} */
async function reproductor(idEl, v, ev = {}) {
  const ok = await cargarYT(), el = document.getElementById(idEl);
  if (!el) return null;
  if (!ok) { el.outerHTML = `<div class="vd-novid"><p>${T("sinvideo")} <a href="https://www.youtube.com/watch?v=${esc(v)}" target="_blank" rel="noopener">${T("abriryt")} ↗</a></p></div>`; return null; }
  return new Promise(res => {
    const p = new YT.Player(idEl, {videoId: v, width: "100%", height: "100%",
      playerVars: {rel: 0, modestbranding: 1, playsinline: 1, fs: 0, disablekb: 1, cc_load_policy: 0},
      events: {onReady: () => { res(p); ev.listo && ev.listo(p); }, onStateChange: e => ev.estado && ev.estado(e.data, p), onError: () => res(p)}});
  });
}
const ahora = p => { try { return p.getCurrentTime() || 0; } catch (e) { return 0; } };

/* ---------- rutas ---------- */
const ID = "(p-[a-z0-9-]{1,30}|l?[a-f0-9]{10,12})";
const RE = new RegExp(`^(videos|videos-editar(?:-${ID})?|video-${ID}|video-solo-${ID}|videos-proyectar-(\\d{6})|vjugar(?:-(\\d{6}))?)$`);
const isVd = h => RE.test(h);
let V = {h: ""}, timer = null, reloj = null;
/* pantalla sin cabecera (la de los concursos); se pone otra vez después, por si otro módulo la quita al cambiar de página */
const grande = () => { document.body.classList.add("cc-grande"); setTimeout(() => { if (/^(videos-proyectar|vjugar-)/.test(V.h)) document.body.classList.add("cc-grande"); }, 0); };
const parar = () => {
  clearTimeout(timer); clearInterval(reloj); timer = reloj = null; document.body.classList.remove("cc-grande");
  try { V.player && V.player.destroy(); } catch (e) {}
};
addEventListener("hashchange", () => { const h = location.hash.slice(1); if (V.h && V.h !== h) { parar(); V = {h: ""}; } });

function render(app) {
  const h = location.hash.slice(1), m = h.match(RE);
  if (!m) return;
  if (V.h !== h) { parar(); V = {h}; }
  V.app = app;
  if (h === "videos") return inicio(app);
  if (h.startsWith("videos-editar")) return editor(app, m[2]);
  if (m[3]) return ficha(app, m[3]);
  if (m[4]) return solo(app, m[4]);
  if (m[5]) return proyectar(app, m[5]);
  return jugar(app, m[6]);
}
const cab = (titulo, atras = "#videos") => `<a class="cc-back" href="${atras}">${T("volver")}</a><h1 class="cc-h1">${titulo}</h1>`;
const tarjeta = x => `<article class="vd-card"><a href="#video-${esc(x.id)}" class="vd-thumb"><img src="${miniatura(x.v)}" alt="" loading="lazy"><span>${T("npreg", {n: x.n})}</span></a>
  <div class="vd-ci"><a href="#video-${esc(x.id)}"><b>${esc(x.titulo)}</b></a>${x.nivel ? `<small>${esc(x.nivel)}${x.idioma ? " · " + esc(x.idioma.toUpperCase()) : ""}</small>` : ""}
  <div class="cc-acc"><a class="btn main" href="#video-solo-${esc(x.id)}">${T("solo")}</a><a class="btn" href="#video-${esc(x.id)}">${T("directo")}</a></div></div></article>`;

/* ---------- inicio ---------- */
async function inicio(app) {
  const C = cuenta(), ls = locales(), lg = lang();
  const preps = PREP().slice().sort((a, b) => (a.idioma !== lg) - (b.idioma !== lg));
  app.innerHTML = `<section class="wrap cc vd">
    <div class="ghead"><h1 class="cc-h1">📺 ${T("h1")}</h1></div>
    <p class="cc-lead">${T("sub")}</p>
    <form class="cc-unir" id="vd-unir"><h2>📱 ${T("unirse")}</h2>
      <div class="cc-fila"><label>${T("codigo")}<input name="codigo" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="123456" required></label><button class="btn main">${T("entrar")}</button></div></form>
    <div class="cc-crea"><a class="btn main cc-big" href="#videos-editar">${T("crear")}</a></div>
    <h2 class="cc-h2">${T("mios")}</h2><div class="vd-grid" id="vd-mios">${C ? `<p class="cc-small">…</p>` : ""}</div>
    ${!C && ls.length ? `<p class="cc-small">${T("local")}</p>` : ""}
    <h2 class="cc-h2">⭐ ${T("prep")}</h2>${(() => { /* primero los del idioma del curso; los demás, aparte */
      const mio = preps.filter(x => x.idioma === lg), otros = preps.filter(x => x.idioma !== lg), nl = c => L().CAT?.languages?.[c]?.name?.[lg] || c;
      return (mio.length ? `<div class="vd-grid">${mio.map(x => tarjeta({...x, n: x.preguntas.length})).join("")}</div>` : `<p class="cc-small">${T("prep_no", {l: lg === "en" ? nl(lg) : nl(lg).toLowerCase()})}</p>`)
        + (otros.length ? `<h3 class="cc-h2 vd-otros">${T("prep_otros")}</h3><div class="vd-grid">${otros.map(x => tarjeta({...x, n: x.preguntas.length})).join("")}</div>` : "");
    })()}
  </section>`;
  app.querySelector("#vd-unir").onsubmit = e => { e.preventDefault(); const c = e.target.codigo.value.replace(/\D/g, ""); if (c.length === 6) location.hash = "vjugar-" + c; };
  let nube = [];
  if (C) { const r = await api("concursos?mios=1").catch(() => null); if (r && r.ok) nube = (r.j.concursos || []).filter(x => x.tipo === "video"); }
  if (V.h !== "videos") return;
  const todos = [...nube, ...ls.map(x => ({id: x.id, titulo: x.titulo, v: x.v, n: x.preguntas.length}))];
  app.querySelector("#vd-mios").innerHTML = todos.length ? todos.map(tarjeta).join("") : `<p class="cc-vacio">${T("ninguno")}</p>`;
}

/* ---------- editor ---------- */
let E = null; /* {id, titulo, v, preguntas:[{t, p, o, c, s}]} */
const nuevaP = tt => ({t: Math.round(tt * 10) / 10, p: "", o: ["", "", ""], c: 0, s: 20});
async function editor(app, id) {
  if (!E || (id && E.id !== id && E.origen !== id)) {
    if (id) {
      app.innerHTML = `<p class="msg">…</p>`;
      const r = await cargar(id).catch(() => null);
      if (V.app !== app || !location.hash.endsWith(id)) return;
      if (!r) { app.innerHTML = `<section class="wrap cc">${cab("")}<p class="cc-msg mal">${T("e_noexiste")}</p></section>`; return; }
      E = {id: r.mio ? id : null, origen: id, titulo: r.c.titulo, v: r.c.v, preguntas: JSON.parse(JSON.stringify(r.c.preguntas)).map(q => ({...q, s: q.s || 20}))};
    } else E = {id: null, titulo: "", v: "", preguntas: []};
  }
  app.innerHTML = `<section class="wrap cc vd vd-ed">${cab("✏️ " + (E.titulo ? esc(E.titulo) : T("crear").replace(/^✏️\s*/, "")))}
    <form class="vd-urlf" id="vd-urlf"><label>${T("ed_url")}<input name="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://www.youtube.com/watch?v=…" value="${E.v ? "https://youtu.be/" + esc(E.v) : ""}"></label><button class="btn">${T("ed_cargar")}</button></form>
    <label class="cc-lab">${T("ed_titulo")}<input class="cc-tit" id="vd-tit" maxlength="80" value="${esc(E.titulo)}"></label>
    <details class="cc-paso vd-ia" id="vd-ia"${IA.abierto ? " open" : ""}><summary>${T("ia")}</summary><div id="vd-iac"></div></details>
    <div class="vd-edcol"><div class="vd-edvid"><div class="vd-stage"><div id="vd-yt"></div></div>
      <p class="cc-small">${T("ed_ayuda")}</p><button class="btn main cc-big" id="vd-aqui" type="button"${E.v ? "" : " disabled"}>${T("ed_aqui", {t: "0:00"})}</button></div>
    <div class="vd-qs" id="vd-qs"></div></div>
    <div class="cc-guardar"><p class="cc-msg" id="vd-msg" hidden></p><button class="btn main cc-big" data-vd="guardar">${T("guardar")}</button></div>
  </section>`;
  app.querySelector("#vd-tit").oninput = e => { E.titulo = e.target.value; };
  app.querySelector("#vd-ia").addEventListener("toggle", e => { IA.abierto = e.target.open; if (IA.abierto) pintarIA(); });
  if (IA.abierto) pintarIA();
  app.querySelector("#vd-urlf").onsubmit = e => {
    e.preventDefault(); const v = ytId(e.target.url.value); if (!v) return aviso(t("e_url"), true);
    if (v === E.v && V.player) return; E.v = v; ponerVideo(); app.querySelector("#vd-aqui").disabled = false; if (IA.abierto) pintarIA();
    if (!E.titulo) fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v}&format=json`).then(r => r.json()).then(j => { if (!E.titulo && j.title) { E.titulo = j.title.slice(0, 80); const ti = $("#vd-tit"); if (ti) ti.value = E.titulo; } }).catch(() => {});
  };
  app.querySelector("#vd-aqui").onclick = () => {
    const tt = V.player ? ahora(V.player) : 0; try { V.player && V.player.pauseVideo(); } catch (e) {}
    E.preguntas.push(nuevaP(tt)); E.preguntas.sort((a, b) => a.t - b.t); pintarPreguntas();
    const i = E.preguntas.findIndex(q => q.t === Math.round(tt * 10) / 10 && !q.p); const ta = V.app.querySelectorAll("#vd-qs textarea")[i]; if (ta) { ta.focus(); ta.scrollIntoView({block: "center", behavior: "smooth"}); }
  };
  if (E.v) ponerVideo();
  pintarPreguntas();
  clearInterval(reloj); reloj = setInterval(() => { const b = $("#vd-aqui"); if (!b) return clearInterval(reloj); if (V.player) b.textContent = t("ed_aqui", {t: mmss(ahora(V.player))}); }, 400);
}
/* ---------- ✨ proponer preguntas con IA (videos/ia.js): subtítulos → prompt → respuesta pegada → preguntas en su segundo ---------- */
const IA = {abierto: false, v: "", subs: null, estado: "", fuente: "", idioma: "", tr: "", pegado: "", op: {n: 8, idioma: "", nivel: "", extra: ""}};
const VIA = () => window.LYAVideosIA;
const IDIOMAS_IA = ["", "es", "en", "ca", "fr", "de", "it", "pt"], NOM_IA = {es: "Español", en: "English", ca: "Català", fr: "Français", de: "Deutsch", it: "Italiano", pt: "Português"};
function avisoIA(txt, mal) { const el = $("#vd-iamsg"); if (!el) return; el.textContent = txt; el.className = "cc-msg" + (mal ? " mal" : " bien"); el.hidden = !txt; }
const promptIA = () => IA.subs && IA.subs.length ? VIA().prompt({...IA.op, titulo: E.titulo, texto: VIA().textoPrompt(IA.subs)}) : "";
async function subsIA() {
  const v = E.v; IA.v = v; IA.subs = null; IA.estado = "cargando"; IA.fuente = ""; IA.tr = "";
  const r = await api(`canciones?v=${encodeURIComponent(v)}&lang=${IA.op.idioma || lang()}&yt=1`).catch(() => null);
  if (IA.v !== v) return;
  const ls = r && r.ok && Array.isArray(r.j.lineas) ? r.j.lineas.filter(l => l && l.x) : [];
  if (ls.length >= 2) { IA.subs = ls.map(l => ({t: +l.t || 0, d: +l.d || 0, x: String(l.x)})); IA.estado = "ok"; IA.fuente = "yt"; IA.idioma = r.j.idioma || ""; }
  else IA.estado = "no";
  if (IA.abierto) pintarIA();
}
function pintarIA() {
  const c = $("#vd-iac"); if (!c) return;
  if (!E.v) { c.innerHTML = `<p class="cc-small">${T("ia_sub")}</p><p class="cc-msg mal">${T("ia_novid")}</p>`; return; }
  if (IA.v !== E.v) { subsIA(); }
  const est = IA.estado === "cargando" ? `<p class="cc-small vd-iaest">${T("ia_buscando")}</p>`
    : IA.subs ? `<p class="cc-msg bien vd-iaest">${IA.fuente === "yt" ? T("ia_subs", {n: IA.subs.length, l: NOM_IA[IA.idioma] || IA.idioma || "?"}) : T("ia_tr", {n: IA.subs.length})}</p>`
    : `<p class="cc-msg mal vd-iaest">${T("ia_nosubs")}</p>`;
  const o = IA.op, pr = promptIA();
  c.innerHTML = `<p class="cc-small">${T("ia_sub")}</p>${est}
    <details class="vd-iatr"${IA.estado === "no" && IA.fuente !== "tr" ? " open" : ""}><summary>${T("ia_pegartr")}</summary>
      <textarea class="cc-pega" id="vd-iatr" rows="6" placeholder="${esc(t("ia_trph"))}">${esc(IA.tr)}</textarea>
      <button type="button" class="btn" data-vd="iatr">${T("ia_trusar")}</button></details>
    <h3>${T("ia_p1")}</h3><p class="cc-small">${T("ia_p1b")}</p>
    <div class="cc-ops">
      <label>${T("ia_n")}<select data-ia="n">${[5, 8, 10, 12, 15].map(n => `<option${n === o.n ? " selected" : ""}>${n}</option>`).join("")}</select></label>
      <label>${T("ia_idioma")}<select data-ia="idioma">${IDIOMAS_IA.map(i => `<option value="${i}"${i === o.idioma ? " selected" : ""}>${i ? NOM_IA[i] : T("ia_mismo")}</option>`).join("")}</select></label>
      <label>${T("ia_nivel")}<input data-ia="nivel" maxlength="40" value="${esc(o.nivel)}" placeholder="${T("ia_nivelej")}"></label>
      <label class="cc-ancho">${T("ia_extra")}<input data-ia="extra" maxlength="120" value="${esc(o.extra)}" placeholder="${T("ia_extraej")}"></label></div>
    <textarea class="cc-prompt" id="vd-iaprompt" readonly rows="7" placeholder="${T("ia_sintexto")}">${esc(pr)}</textarea>
    <button type="button" class="btn main" data-vd="iacopiar"${pr ? "" : " disabled"}>${T("ia_copiar")}</button> <span class="cc-ok" id="vd-iacop" hidden>✓ ${T("ia_copiado")}</span>
    <h3>${T("ia_p2")}</h3>
    <textarea class="cc-pega" id="vd-iapega" rows="8" placeholder="${esc(t("ia_pegaej"))}">${esc(IA.pegado)}</textarea>
    <p class="cc-msg" id="vd-iamsg" hidden></p>
    <button type="button" class="btn main" data-vd="iaponer">${T("ia_poner")}</button>`;
  c.querySelectorAll("[data-ia]").forEach(el => el.addEventListener(el.tagName === "INPUT" ? "input" : "change", () => {
    const k = el.dataset.ia; o[k] = k === "n" ? +el.value : el.value;
    const p = $("#vd-iaprompt"); if (p) p.value = promptIA();
  }));
  c.querySelector("#vd-iapega").addEventListener("input", e => { IA.pegado = e.target.value; });
  c.querySelector("#vd-iatr").addEventListener("input", e => { IA.tr = e.target.value; });
}
function usarTranscripcion() {
  const L = VIA().transcripcion(IA.tr || "");
  if (L.length < 2) return avisoIA(t("ia_trmal"), true);
  IA.subs = L; IA.estado = "ok"; IA.fuente = "tr"; pintarIA();
}
function ponerIA() {
  let durac = 0; try { durac = V.player ? +V.player.getDuration() || 0 : 0; } catch (e) {}
  const r = VIA().leer(IA.pegado || "", IA.subs || [], durac);
  if (!r.preguntas.length) return avisoIA(t("ia_nada"), true);
  E.preguntas.push(...r.preguntas.map(q => ({t: q.t, p: q.p, o: q.o, c: q.c, s: q.s || 20})));
  E.preguntas.sort((a, b) => a.t - b.t);
  if (!E.titulo && r.titulo) { E.titulo = r.titulo.slice(0, 80); const ti = $("#vd-tit"); if (ti) ti.value = E.titulo; }
  pintarPreguntas();
  avisoIA(t("ia_puestas", {n: r.preguntas.length}) + (r.sinMomento ? " " + t("ia_sinmom", {m: r.sinMomento}) : ""), false);
  IA.pegado = ""; const pg = $("#vd-iapega"); if (pg) pg.value = "";
}
async function copiarTxt(txt) {
  try { await navigator.clipboard.writeText(txt); return true; }
  catch (e) { const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (e2) {} ta.remove(); return ok; }
}

function ponerVideo() {
  try { V.player && V.player.destroy(); } catch (e) {}
  V.player = null; const st0 = $(".vd-stage"); if (st0) st0.innerHTML = `<div id="vd-yt"></div>`;
  const h = V.h; reproductor("vd-yt", E.v).then(p => { if (V.h === h) V.player = p; else try { p && p.destroy(); } catch (e) {} });
}
function pintarPreguntas() {
  const box = $("#vd-qs"); if (!box) return;
  const TIEMPOS = [10, 15, 20, 30, 45, 60, 90];
  box.innerHTML = E.preguntas.map((q, i) => `<fieldset class="cc-q"><legend>${T("pregunta", {n: i + 1})}</legend>
    <div class="vd-qt"><label>${T("ed_momento")} <input class="vd-t" data-e="t" data-i="${i}" value="${mmss(q.t)}" inputmode="numeric" size="6"></label>
      <button type="button" class="btn" data-vd="ahora" data-i="${i}">${T("ed_ahora")}</button><button type="button" class="btn" data-vd="ir" data-i="${i}">${T("ed_ir")}</button></div>
    <textarea data-e="p" data-i="${i}" maxlength="200" rows="2" placeholder="${T("textop")}">${esc(q.p)}</textarea>
    <div class="cc-os">${q.o.map((o, j) => `<label class="cc-o cc-c${j}"><input type="radio" name="c${i}" data-e="c" data-i="${i}" data-j="${j}"${q.c === j ? " checked" : ""} aria-label="${T("correcta")}"><span class="cc-sim" aria-hidden="true">${SIMB[j]}</span><input data-e="o" data-i="${i}" data-j="${j}" maxlength="90" value="${esc(o)}" placeholder="${T("respuesta", {l: LETRAS[j]})}"></label>`).join("")}</div>
    <div class="cc-qbar"><span class="cc-small">◉ = ${T("correcta")}</span>
      <label>⏱ ${T("tiempo")} <select data-e="s" data-i="${i}">${TIEMPOS.map(s => `<option value="${s}"${s === q.s ? " selected" : ""}>${T("seg", {n: s})}</option>`).join("")}</select></label>
      ${q.o.length < 4 ? `<button type="button" class="btn" data-vd="masr" data-i="${i}">${T("masr")}</button>` : ""}
      ${q.o.length > 2 ? `<button type="button" class="btn" data-vd="menosr" data-i="${i}">− ${LETRAS[q.o.length - 1]}</button>` : ""}
      <span class="cc-sp"></span><button type="button" class="btn" data-vd="quitarp" data-i="${i}" title="${T("quitar")}" aria-label="${T("quitar")}">🗑</button></div>
  </fieldset>`).join("");
  box.querySelectorAll("[data-e]").forEach(el => el.addEventListener(el.type === "radio" || el.tagName === "SELECT" ? "change" : "input", () => {
    const k = el.dataset.e, i = +el.dataset.i, j = +el.dataset.j, q = E.preguntas[i];
    if (k === "p") q.p = el.value; else if (k === "o") q.o[j] = el.value; else if (k === "c") q.c = j; else if (k === "s") q.s = +el.value;
    else if (k === "t") { const x = leerT(el.value); el.classList.toggle("mal", !(x >= 0)); if (x >= 0) q.t = x; }
  }));
  box.querySelectorAll(".vd-t").forEach(el => el.addEventListener("change", () => { E.preguntas.sort((a, b) => a.t - b.t); pintarPreguntas(); }));
}
function revisar() {
  const titulo = (E.titulo || "").trim();
  if (!E.v) return [t("e_url")];
  if (!titulo) return [t("e_titulo")];
  if (!E.preguntas.length) return [t("e_vacio")];
  const preguntas = [];
  for (let i = 0; i < E.preguntas.length; i++) {
    const q = E.preguntas[i], o = q.o.map(x => x.trim());
    while (o.length > 2 && !o[o.length - 1] && q.c < o.length - 1) o.pop();
    if (!q.p.trim() || o.some(x => !x) || q.c >= o.length) return [t("e_preg", {n: i + 1})];
    preguntas.push({t: q.t, p: q.p.trim(), o, c: q.c, s: q.s || 20});
  }
  return [null, {tipo: "video", v: E.v, titulo, preguntas: preguntas.sort((a, b) => a.t - b.t)}];
}
async function guardar(c0) {
  const [err, c] = c0 ? [null, c0] : revisar(); if (err) return aviso(err, true);
  const btn = $("[data-vd=guardar]"); if (btn) btn.disabled = true;
  const esLocal = E && E.id && E.id.startsWith("l");
  let id = null, msg = "guardado", mal = false;
  if (cuenta() && !esLocal) {
    const r = await api("concursos", {accion: "guardar", id: (E && E.id) || undefined, concurso: c}).catch(() => null);
    if (r && r.ok) id = r.j.id;
    else if (r && r.code === 413) { if (btn) btn.disabled = false; return aviso(t("e_demasiados"), true); }
    else { msg = "e_red"; mal = true; }
  }
  if (!id) {
    id = esLocal ? E.id : idLocal();
    store.set(LKEY, [{id, ...c, f: Date.now()}, ...locales().filter(x => x.id !== id)]);
    if (!cuenta()) { msg = "e_cuenta"; mal = true; }
  }
  E = null; V.tras = [t(msg), mal]; location.hash = "video-" + id;
}

/* ---------- ficha ---------- */
async function ficha(app, id) {
  const tras = V.tras; V.tras = null;
  app.innerHTML = `<p class="msg">…</p>`;
  let r; try { r = await cargar(id); } catch (e) { app.innerHTML = `<section class="wrap cc">${cab("")}<p class="cc-msg mal">${T("e_red")}</p></section>`; return; }
  if (V.h !== "video-" + id) return;
  if (!r) { app.innerHTML = `<section class="wrap cc">${cab("")}<p class="cc-msg mal">${T("e_noexiste")}</p></section>`; return; }
  V.c = r.c; V.id = id;
  const c = r.c;
  app.innerHTML = `<section class="wrap cc vd">${cab("📺 " + esc(c.titulo))}
    <p class="cc-small">${T("npreg", {n: c.preguntas.length})}${c.autor && !r.mio ? " · " + esc(c.autor) : ""}${r.prep ? " · ⭐ COMPRENDO" : id.startsWith("l") ? " · 📱" : " · ☁️"}</p>
    <p class="cc-msg" id="vd-msg" hidden></p>
    <img class="vd-portada" src="${miniatura(c.v)}" alt="">
    <div class="cc-crea"><a class="btn main cc-big" href="#video-solo-${esc(id)}">${T("solo")}</a><button class="btn cc-big" data-vd="directo">${T("directo")}</button></div>
    <div id="ac-clase"></div>
    <div class="cc-acc">${r.mio ? `<a class="btn" href="#videos-editar-${esc(id)}">${T("editar")}</a><button class="btn" data-vd="borrar">${T("borrar")}</button>` : `<a class="btn" href="#videos-editar-${esc(id)}">${T("copia")}</a>`}</div>
    <div id="ac-deber"></div>
    <ol class="cc-ver vd-ver">${c.preguntas.map(q => `<li><span class="vd-min">${mmss(q.t)}</span> <b>${esc(q.p)}</b><ul>${q.o.map((o, j) => `<li class="${j === q.c ? "cc-si" : ""}">${opcHTML(o, j, j === q.c ? " ✓" : "")}</li>`).join("")}</ul></li>`).join("")}</ol>
  </section>`;
  if (tras) aviso(...tras);
  if (A()) { A().selectorClase($("#ac-clase"), id); A().formDeber($("#ac-deber"), {id, tipo: "video", titulo: c.titulo}); }
}

/* ---------- a solas: se para en cada pregunta ---------- */
async function solo(app, id) {
  if (!V.s) {
    app.innerHTML = `<p class="msg">…</p>`;
    const r = await cargar(id).catch(() => null);
    if (V.h !== "video-solo-" + id) return;
    if (!r) { app.innerHTML = `<section class="wrap cc">${cab("")}<p class="cc-msg mal">${T("e_noexiste")}</p></section>`; return; }
    V.s = {id, c: r.c, resp: {}, ok: 0, abierta: -1, fin: false};
  }
  const s = V.s;
  app.innerHTML = `<section class="wrap cc vd vd-solo">${cab("📺 " + esc(s.c.titulo), "#video-" + esc(id))}
    <div class="vd-sbar"><span id="vd-cuenta"></span><b id="vd-pts"></b></div>
    <div class="vd-stage"><div id="vd-yt"></div><div class="vd-ov" id="vd-ov" hidden></div></div>
    <div id="vd-fin"></div></section>`;
  pintarSolo();
  const h = V.h;
  V.player = await reproductor("vd-yt", s.c.v, {estado: (e, p) => { if (e === 0) alFinal(); }});
  if (V.h !== h) return;
  clearInterval(reloj); reloj = setInterval(vigilarSolo, 250);
}
const pendiente = (s, tt) => s.c.preguntas.findIndex((q, i) => s.resp[i] == null && q.t <= tt + 0.15);
function vigilarSolo() {
  const s = V.s; if (!s || !V.player || s.abierta >= 0 || s.fin) return;
  const i = pendiente(s, ahora(V.player));
  if (i >= 0) { try { V.player.pauseVideo(); } catch (e) {} s.abierta = i; s.elegida = null; pintarSolo(); }
}
function alFinal() {
  const s = V.s; if (!s || s.fin) return;
  const i = pendiente(s, 1e9);  /* si se ha saltado alguna, sale ahora */
  if (i >= 0) { s.abierta = i; s.elegida = null; return pintarSolo(); }
  s.fin = true; pintarSolo();
  A() && A().marcar(s.id, s.ok, s.c.preguntas.length);
  xp(5 + s.ok, {ok: true});
}
function pintarSolo() {
  const s = V.s, n = s.c.preguntas.length, ov = $("#vd-ov"), hechas = Object.keys(s.resp).length;
  const c = $("#vd-cuenta"); if (c) c.textContent = t("pdeq", {i: Math.min(n, hechas + (s.abierta >= 0 ? 1 : 0)) || 1, n});
  const p = $("#vd-pts"); if (p) p.textContent = `✓ ${s.ok}`;
  if (s.fin) {
    if (ov) ov.hidden = true;
    const f = $("#vd-fin"); if (f) f.innerHTML = `<div class="cc-fin vd-final"><h2>🏁 ${T("fin")}</h2><p class="cc-gran">${"★".repeat(s.ok / n >= .9 ? 3 : s.ok / n >= .6 ? 2 : 1)}</p><p>${T("res", {a: s.ok, n})}</p>
      <button class="btn main" data-vd="solootra">${T("otra")}</button> <a class="btn" href="#videos">${T("volver")}</a></div>`;
    return;
  }
  if (!ov) return;
  if (s.abierta < 0) { ov.hidden = true; ov.innerHTML = ""; return; }
  const q = s.c.preguntas[s.abierta], e = s.elegida;
  ov.hidden = false;
  ov.innerHTML = `<div class="vd-q"><p class="vd-qn">${T("pdeq", {i: s.abierta + 1, n})} · ${mmss(q.t)}</p><h2 class="cc-preg">${esc(q.p)}</h2>
    <div class="cc-botones n${q.o.length}">${q.o.map((o, j) => `<button class="cc-b cc-c${j}${e != null ? (j === q.c ? " si" : j === e ? " no" : " apag") : ""}" data-vd="solor" data-j="${j}"${e != null ? " disabled" : ""}>${opcHTML(o, j)}</button>`).join("")}</div>
    ${e != null ? `<div class="cc-resj ${e === q.c ? "si" : "no"}"><b>${e === q.c ? T("bien") : T("mal")}</b>${e === q.c ? "" : ` · ${T("era", {r: q.o[q.c]})}`}</div><button class="btn main cc-big" data-vd="seguir">${T("seguir")}</button>` : ""}</div>`;
  if (e != null) ov.querySelector("[data-vd=seguir]")?.focus();
}

/* ---------- en directo: abrir la sala ---------- */
async function abrirDirecto() {
  const id = V.id, c = V.c; if (!c) return;
  aviso(t("abriendo"));
  const grupo = A() ? A().grupoElegido() : "";
  const datos = id.startsWith("l") || id.startsWith("p-") ? {accion: "abrir", concurso: {tipo: "video", v: c.v, titulo: c.titulo, preguntas: c.preguntas}, ref: id.startsWith("p-") ? id : undefined, grupo} : {accion: "abrir", id, grupo};
  const r = await api("concursos", datos).catch(() => null);
  if (!r || !r.ok) return aviso(r && r.code === 429 ? t("e_espera") : t("e_abrir"), true);
  const hs = store.get(HKEY, {}); hs[r.j.codigo] = {clave: r.j.clave, id, f: Date.now(), video: true};
  for (const k in hs) if (Date.now() - (hs[k].f || 0) > 864e5) delete hs[k];
  store.set(HKEY, hs);
  location.hash = "videos-proyectar-" + r.j.codigo;
}

/* ---------- en directo: pantalla del profe ---------- */
const urlWeb = () => (location.origin + location.pathname.replace(/index\.html$/, "")).replace(/^https?:\/\//, "");
const ahoraSrv = P => Date.now() + (P.off || 0);
function proyectar(app, cod) {
  const h = store.get(HKEY, {})[cod];
  if (!h) { app.innerHTML = `<section class="wrap cc">${cab("")}<p class="cc-msg mal">${T("e_codigo")}</p></section>`; return; }
  grande();
  if (!V.p) {
    V.p = {cod, clave: h.clave, id: h.id, e: null, op: {modo: "proyeccion", lectura: 0}};
    app.innerHTML = `<section class="cc-h vd-h"><div class="cc-htop"><a class="cc-back" href="#video-${esc(h.id || "")}">${T("volver")}</a><span class="cc-hcod">${T("codigo")}: <b>${cod}</b></span><button class="btn" data-vd="pantalla">${T("pantalla")}</button></div>
      <div id="vd-hcont"></div><div class="vd-stage vd-hstage" id="vd-hstage" hidden><div id="vd-yt"></div><div class="vd-ov vd-hov" id="vd-ov" hidden></div></div><div id="vd-hpie"></div></section>`;
    sondeoHost();
  } else pintarHost();
}
async function sondeoHost() {
  const P = V.p; if (!P) return; const h = V.h;
  clearTimeout(timer);
  try {
    const r = await fetch(`api/concursos?sala=${P.cod}&clave=${encodeURIComponent(P.clave)}`, {cache: "no-store"});
    const j = await r.json().catch(() => ({}));
    if (V.h !== h || V.p !== P) return;
    if (r.ok) { P.e = j; P.off = j.ahora - Date.now(); if (j.preguntas) P.preguntas = j.preguntas; } else if (r.status === 404) P.e = {fase: "cerrada"};
  } catch (e) {}
  pintarHost();
  const e = P.e || {};
  if (e.fase === "pregunta") {
    const fin = e.t0 + e.pregunta.s * 1000 - ahoraSrv(P);
    if ((fin <= 0 || (e.contestadas >= e.njug && e.njug > 0)) && !P.pasando) return pasarHost();
  }
  if (e.modo === "individual" && e.fase === "video" && (e.ranking || []).length && e.ranking.every(x => x.nr >= e.total) && !P.pasando) return pasarHost();
  if (["espera", "pregunta", "lectura"].includes(e.fase) || (e.fase === "video" && e.modo === "individual")) timer = setTimeout(sondeoHost, e.fase === "pregunta" ? 1000 : 2000);
}
async function pasarHost(extra = {}, accion = "pasar") {
  const P = V.p; if (!P || P.pasando) return; P.pasando = true;
  clearTimeout(timer);
  const r = await api("concursos", {accion, codigo: P.cod, clave: P.clave, ...extra}).catch(() => null);
  P.pasando = false;
  if (r && r.ok) { P.e = {...P.e, ...r.j}; if (r.j.fase !== "pregunta") delete P.e.contestadas; P.off = r.j.ahora - Date.now(); }
  pintarHost();
  const f = P.e && P.e.fase;
  if (["espera", "pregunta", "lectura"].includes(f) || (f === "video" && P.e.modo === "individual")) timer = setTimeout(sondeoHost, 1000);
}
function rankHTML(rk, max = 5) { return `<ol class="cc-rank">${rk.slice(0, max).map((x, i) => `<li><span class="cc-pos">${i + 1}</span><span class="cc-nom">${esc(x.n)}</span><b>${x.pts}</b></li>`).join("")}</ol>`; }
function preguntasHTML(qs) { return `<ol class="vd-todas">${qs.map(q => `<li><b>${esc(q.p)}</b><ul>${q.o.map((o, j) => `<li class="cc-c${j}">${opcHTML(o, j)}</li>`).join("")}</ul></li>`).join("")}</ol>`; }
function pintarHost() {
  const P = V.p; if (!P || !V.app) return;
  const cont = $("#vd-hcont"), stage = $("#vd-hstage"), ov = $("#vd-ov"), pie = $("#vd-hpie"); if (!cont) return;
  const e = P.e || {}, js = e.jugadores || [];
  const verVideo = e.modo !== "individual" && ["video", "pregunta", "resultado"].includes(e.fase);
  stage.hidden = !verVideo;
  if (!P.e) { cont.innerHTML = `<p class="msg">${T("abriendo")}</p>`; return; }
  if (e.fase === "cerrada") { cont.innerHTML = `<p class="cc-msg mal">${T("e_terminado")}</p><a class="btn" href="#videos">${T("volver")}</a>`; pie.innerHTML = ""; return; }
  if (e.fase === "espera") {
    const op = P.op;
    cont.innerHTML = `<h1 class="cc-htit">${esc(e.titulo)}</h1>
      <div class="cc-entra"><p>${T("entrad")} <b>${esc(urlWeb())}#vjugar</b> ${T("ycodigo")}</p><div class="cc-codigo">${P.cod.slice(0, 3)} ${P.cod.slice(3)}</div></div>
      <p class="cc-cuenta">${js.length ? T("conectados", {n: js.length}) : T("esperando")}</p>
      <div class="cc-chips">${js.map(n => `<button class="cc-chip" data-vd="echar" data-n="${esc(n)}">${esc(n)}</button>`).join("")}</div>
      ${js.length ? `<p class="cc-small">${T("echar")}</p>` : ""}
      <div class="vd-opc"><h2>${T("modo")}</h2><div class="vd-modos">
        <button class="vd-modo${op.modo === "proyeccion" ? " on" : ""}" data-vd="modo" data-m="proyeccion" aria-pressed="${op.modo === "proyeccion"}"><b>${T("m_proy")}</b><span>${T("m_proy2")}</span></button>
        <button class="vd-modo${op.modo === "individual" ? " on" : ""}" data-vd="modo" data-m="individual" aria-pressed="${op.modo === "individual"}"><b>${T("m_ind")}</b><span>${T("m_ind2")}</span></button></div>
        <h2>${T("lectura")}</h2><div class="vd-lects">${[0, 30, 60, 120].map(n => `<button class="btn${op.lectura === n ? " main" : ""}" data-vd="lect" data-n="${n}" aria-pressed="${op.lectura === n}">${n ? (n < 60 ? n + " s" : n / 60 + " min") : T("nolect")}</button>`).join("")}</div></div>`;
    pie.innerHTML = `<div class="cc-hacc"><button class="btn main cc-big" data-vd="lanzar"${js.length ? "" : " disabled"}>${T("lanzar")}</button></div>`;
    return;
  }
  if (e.fase === "lectura") {
    const quedan = Math.max(0, e.t0 - ahoraSrv(P));
    cont.innerHTML = `<h1 class="cc-htit">📖 ${T("leed")}</h1><p class="cc-cuenta"><b class="cc-seg" id="vd-seg">${Math.ceil(quedan / 1000)}</b></p>${preguntasHTML(e.todas || [])}`;
    pie.innerHTML = `<div class="cc-hacc"><button class="btn main cc-big" data-vd="pasar">${T("empezarya")}</button></div>`;
    clearInterval(V.segT); V.segT = setInterval(() => { const el = $("#vd-seg"); if (!el || V.p !== P || P.e.fase !== "lectura") return clearInterval(V.segT); const q = P.e.t0 - ahoraSrv(P); el.textContent = Math.max(0, Math.ceil(q / 1000)); if (q <= 0) { clearInterval(V.segT); pasarHost(); } }, 250);
    return;
  }
  if (e.fase === "fin") {
    try { V.player && V.player.pauseVideo(); } catch (er) {}
    stage.hidden = true;
    const rk = e.ranking || [], pod = [rk[1], rk[0], rk[2]];
    cont.innerHTML = `<h1 class="cc-htit">🏆 ${T("podio")}</h1>
      <div class="cc-podio">${pod.map((x, k) => x ? `<div class="cc-pd p${[2, 1, 3][k]}"><span class="cc-nom">${esc(x.n)}</span><b>${x.pts}</b><i>${[2, 1, 3][k]}</i></div>` : `<div class="cc-pd vacio"></div>`).join("")}</div>
      ${rk.length > 3 ? `<ol class="cc-rank" start="4">${rk.slice(3).map((x, i) => `<li><span class="cc-pos">${i + 4}</span><span class="cc-nom">${esc(x.n)}</span><b>${x.pts}</b></li>`).join("")}</ol>` : ""}`;
    pie.innerHTML = `<div class="cc-hacc"><button class="btn" data-vd="cerrar">${T("cerrar")}</button></div>`;
    return;
  }
  if (e.modo === "individual") {
    const rk = e.ranking || [];
    cont.innerHTML = `<h1 class="cc-htit">📱 ${esc(e.titulo)}</h1><h2 class="vd-c">${T("progreso")}</h2>
      ${rk.length ? `<table class="vd-tabla"><tbody>${rk.map((x, i) => `<tr><td class="cc-pos">${i + 1}</td><td class="cc-nom">${esc(x.n)}</td><td><div class="vd-prog"><i style="width:${Math.round(100 * x.nr / Math.max(1, e.total))}%"></i></div></td><td>${T("llevan", {a: x.nr, n: e.total})}</td><td>✓ ${x.na}</td><td><b>${x.pts}</b></td></tr>`).join("")}</tbody></table>` : `<p class="cc-cuenta">${T("nadie")}</p>`}`;
    pie.innerHTML = `<div class="cc-hacc"><button class="btn main cc-big" data-vd="terminar">${T("terminar")}</button></div>`;
    return;
  }
  /* proyección: el vídeo aquí */
  cont.innerHTML = "";
  pie.innerHTML = `<div class="cc-hacc"><span class="cc-small">${T("conectados", {n: js.length})}</span><button class="btn" data-vd="terminar">${T("terminar")}</button></div>`;
  if (!V.player && !P.cargando) {
    P.cargando = true;
    const hh = V.h;
    reproductor("vd-yt", e.v, {estado: st0 => { if (st0 === 0) finVideoHost(); }}).then(p => { P.cargando = false; if (V.h !== hh) { try { p && p.destroy(); } catch (er) {} return; } V.player = p; pintarHost(); });
  }
  const pl = V.player;
  if (e.fase === "video") {
    ov.hidden = true;
    const falta = e.t0 - ahoraSrv(P);
    if (falta > 0) { ov.hidden = false; ov.innerHTML = `<div class="vd-q"><div class="cc-cuentaatras">${Math.ceil(falta / 1000)}</div><p class="cc-cuenta">${T("atentos")}</p></div>`; clearTimeout(V.cuentaT); V.cuentaT = setTimeout(pintarHost, Math.min(falta, 250)); return; }
    if (pl) { try { const est = pl.getPlayerState(); if (est === 0) return finVideoHost(); if (est !== 1) pl.playVideo(); } catch (er) {} }
    clearInterval(reloj); reloj = setInterval(() => {
      if (V.p !== P || P.e.fase !== "video" || !V.player || P.pasando) return;
      const sig = (P.preguntas || [])[P.e.i + 1];
      if (sig && ahora(V.player) >= sig.t - 0.1) { clearInterval(reloj); try { V.player.pauseVideo(); } catch (er) {} pasarHost(); }
    }, 200);
    return;
  }
  clearInterval(reloj);
  if (pl) try { pl.pauseVideo(); } catch (er) {}
  const q = e.pregunta, res = e.fase === "resultado";
  ov.hidden = false;
  const falta = e.t0 - ahoraSrv(P);
  if (!res && falta > 0) { ov.innerHTML = `<div class="vd-q"><p class="cc-pdeq">${T("pdeq", {i: e.i + 1, n: e.total})}</p><h1 class="cc-hpreg">${esc(q.p)}</h1><div class="cc-cuentaatras">${Math.ceil(falta / 1000)}</div></div>`; clearTimeout(V.cuentaT); V.cuentaT = setTimeout(pintarHost, Math.min(falta, 250)); return; }
  const firma = `${e.fase}|${e.i}`;
  if (!res && V.firma === firma && $("#vd-cont")) { $("#vd-cont").textContent = t("contestadas", {a: e.contestadas || 0, n: e.njug || js.length}); return; }
  V.firma = firma;
  const quedan = Math.max(0, e.t0 + q.s * 1000 - ahoraSrv(P)), maxc = Math.max(1, ...(e.cuantos || [1]));
  ov.innerHTML = `<div class="vd-q"><div class="cc-sbar"><span>${T("pdeq", {i: e.i + 1, n: e.total})}</span>${res ? "" : `<b class="cc-seg" id="vd-seg">${Math.ceil(quedan / 1000)}</b><span id="vd-cont">${T("contestadas", {a: e.contestadas || 0, n: e.njug || js.length})}</span>`}</div>
    <h1 class="cc-hpreg">${esc(q.p)}</h1>
    ${res ? `<div class="cc-barras vd-barras">${q.o.map((o, j) => `<div class="cc-barra cc-c${j}${j === e.correcta ? " si" : " apag"}"><i style="height:${Math.round(100 * (e.cuantos[j] || 0) / maxc)}%"></i><b>${e.cuantos[j] || 0}</b></div>`).join("")}</div>` : ""}
    <div class="cc-botones n${q.o.length} cc-hb">${q.o.map((o, j) => `<div class="cc-b cc-c${j}${res ? (j === e.correcta ? " si" : " apag") : ""}">${opcHTML(o, j, res && j === e.correcta ? " ✓" : "")}</div>`).join("")}</div>
    ${res && (e.ranking || []).length ? rankHTML(e.ranking, 3) : ""}
    <div class="cc-hacc">${res ? `<button class="btn main cc-big" data-vd="pasar">${T("seguir")}</button>` : `<button class="btn" data-vd="pasar">${T("pasar")}</button>`}</div></div>`;
  if (!res) { clearInterval(V.segT); V.segT = setInterval(() => { const el = $("#vd-seg"); if (!el || V.p !== P) return clearInterval(V.segT); el.textContent = Math.max(0, Math.ceil((e.t0 + q.s * 1000 - ahoraSrv(P)) / 1000)); }, 250); }
}
function finVideoHost() {
  const P = V.p; if (!P || !P.e || P.e.fase !== "video") return;
  pasarHost();  /* quedan preguntas → la siguiente; si no, fin */
}

/* ---------- en directo: móvil del alumno ---------- */
function jugar(app, cod) {
  const yo = cod ? store.get(JKEY, {})[cod] : null;
  if (!cod || !yo) {
    app.innerHTML = `<section class="wrap cc cc-jug">${cab("📱 " + T("unirse"))}
      <form class="cc-unir" id="vd-entrar"><label>${T("codigo")}<input name="codigo" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="123456" value="${esc(cod || "")}" required></label>
      <label>${T("tunombre")}<input name="nombre" maxlength="16" autocomplete="nickname" value="${esc(store.get("lyaCcNombre", "") || (cuenta() && cuenta().usuario) || "")}" required></label>
      <p class="cc-msg" id="vd-msg" hidden></p><button class="btn main cc-big">${T("entrar")}</button></form></section>`;
    const f = app.querySelector("#vd-entrar");
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
      const js = store.get(JKEY, {}); js[c] = {pid: r.j.pid, nombre: r.j.nombre, f: Date.now()}; store.set(JKEY, js);
      location.hash = "vjugar-" + c;
    };
    return;
  }
  grande();
  if (!V.j) {
    V.j = {cod, pid: yo.pid, nombre: yo.nombre, e: null, resp: {}, ok: 0};
    app.innerHTML = `<section class="wrap cc cc-jug vd-jug"><div class="cc-jtop"><span>👤 ${esc(yo.nombre)}</span><span>${T("codigo")} ${cod}</span><a href="#videos" class="cc-salir">${T("salir")}</a></div>
      <div id="vd-jcont"></div><div class="vd-stage" id="vd-jstage" hidden><div id="vd-yt"></div><div class="vd-ov" id="vd-ov" hidden></div></div></section>`;
    sondeoJug();
  } else pintarJug();
}
async function sondeoJug() {
  const J = V.j; if (!J) return; const h = V.h;
  clearTimeout(timer);
  try {
    const r = await fetch(`api/concursos?sala=${J.cod}`);
    const j = await r.json().catch(() => ({}));
    if (V.h !== h || V.j !== J) return;
    if (r.ok) { const age = +(r.headers.get("age") || 0) || 0, off = j.ahora + age * 1000 - Date.now(); J.off = J.off == null ? off : Math.max(J.off, off); J.e = j; }
    else if (r.status === 404) J.e = {fase: "cerrada"};
  } catch (e) {}
  if (J.e && J.e.tipo && J.e.tipo !== "video") { location.hash = "jugar-" + J.cod; return; }  /* era un concurso */
  pintarJug();
  const f = J.e && J.e.fase;
  if (f && f !== "cerrada" && f !== "fin") timer = setTimeout(sondeoJug, f === "video" && J.e.modo === "individual" ? 3000 : f === "espera" || f === "lectura" ? 2000 : 1000);
  if (f === "fin" && !J.premio) { J.premio = 1; const yo = (J.e.ranking || []).find(x => x.n === J.nombre); if (yo) { xp(5 + Math.round(yo.pts / 500), {ok: true}); A() && J.e.idc && A().marcar(J.e.idc, J.e.modo === "individual" ? J.ok : Object.values(J.okq || {}).filter(Boolean).length, J.e.total || 1); } }
}
function pintarJug() {
  const J = V.j, cont = $("#vd-jcont"), stage = $("#vd-jstage"), ov = $("#vd-ov"); if (!J || !cont) return;
  const e = J.e, caja = (html, cls = "") => { V.jfirma = ""; cont.innerHTML = `<div class="cc-jbox ${cls}">${html}</div>`; };
  const individual = e && e.modo === "individual" && e.fase === "video";
  stage.hidden = !individual;
  if (!individual) { try { V.player && V.player.pauseVideo(); } catch (er) {} }
  if (!e) return caja(`<p>…</p>`);
  if (e.fase === "cerrada") return caja(`<h2>${T("e_terminado")}</h2><a class="btn" href="#videos">${T("volver")}</a>`);
  const yo = (e.ranking || []).find(x => x.n === J.nombre), pos = yo ? e.ranking.indexOf(yo) + 1 : 0;
  if (e.fase === "espera") return caja(`<div class="cc-gran">✅</div><h2>${T("j_dentro")}</h2><p>${T("j_espera")}</p><p class="cc-small">📺 ${esc(e.titulo)}</p>`);
  if (e.fase === "lectura") { const q = Math.max(0, e.t0 - (Date.now() + (J.off || 0))); return caja(`<h2>📖 ${T("leed")}</h2><p class="cc-small">⏱ ${Math.ceil(q / 1000)} s</p>${preguntasHTML(e.todas || [])}`, "vd-lee"); }
  if (e.fase === "fin") return caja(`<div class="cc-gran">${pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : "🏁"}</div><h2>${T("podio")}</h2>${yo ? `<p class="cc-pts">${T("j_pts", {n: yo.pts})}</p><p>${T("j_final", {p: pos, n: e.ranking.length})}</p>` : ""}<a class="btn" href="#videos">${T("volver")}</a>`, "fin");
  if (individual) return jugIndividual();
  /* proyección */
  if (e.fase === "video") return caja(`<div class="cc-gran">📺</div><p>${T("j_mira")}</p>`);
  const q = e.pregunta, res = e.fase === "resultado", mia = J.resp[e.i];
  if (res) {
    const ok = yo && yo.ok === true, nada = !yo || yo.ok === null;
    (J.okq ||= {})[e.i] = ok;
    return caja(`<div class="cc-gran">${ok ? "🎉" : nada ? "⏰" : "❌"}</div><h2>${ok ? T("bien") : nada ? T("j_tarde") : T("mal")}</h2>${ok ? `<p class="cc-pts">+${yo.d}</p>` : ""}
      <p class="cc-small">✓ ${opcHTML(q.o[e.correcta], e.correcta)}</p>${yo ? `<p>${T("j_puesto", {p: pos, n: e.ranking.length})} · ${T("j_pts", {n: yo.pts})}</p>` : ""}`, ok ? "si" : "no");
  }
  const falta = e.t0 - (Date.now() + (J.off || 0)), quedan = e.t0 + q.s * 1000 - (Date.now() + (J.off || 0));
  if (falta > 0) { clearTimeout(V.cuentaT); V.cuentaT = setTimeout(pintarJug, Math.min(falta, 250)); return caja(`<div class="cc-cuentaatras">${Math.ceil(falta / 1000)}</div><p>${esc(q.p)}</p>`); }
  if (mia != null) return caja(`<div class="cc-gran">📨</div><h2>${T("j_enviada")}</h2><p>${T("j_esperad")}</p>`);
  if (quedan <= 0) return caja(`<div class="cc-gran">⏰</div><h2>${T("j_tarde")}</h2>`);
  if (V.jfirma === "q" + e.i) return;
  V.jfirma = "q" + e.i;
  cont.innerHTML = `<div class="cc-jugando"><p class="cc-jp">${esc(q.p)}</p><div class="cc-botones n${q.o.length}">${q.o.map((o, j) => `<button class="cc-b cc-c${j}" data-vd="resp" data-j="${j}">${opcHTML(o, j)}</button>`).join("")}</div></div>`;
}
async function responderProy(j) {
  const J = V.j, e = J && J.e; if (!e || e.fase !== "pregunta" || J.resp[e.i] != null) return;
  J.resp[e.i] = j; pintarJug();
  try { navigator.vibrate && navigator.vibrate(40); } catch (er) {}
  await api("concursos", {accion: "responder", codigo: J.cod, pid: J.pid, i: e.i, o: j}).catch(() => null);
}
/* individual: el vídeo en el móvil, que se para solo */
function jugIndividual() {
  const J = V.j, e = J.e, cont = $("#vd-jcont"), ov = $("#vd-ov"), qs = e.todas || [];
  const hechas = Object.keys(J.resp).length;
  if (J.acabado) { cont.innerHTML = `<div class="cc-jbox"><div class="cc-gran">🏁</div><h2>${T("j_acabado")}</h2><p>${T("res", {a: J.ok, n: qs.length})}</p></div>`; $("#vd-jstage").hidden = true; return; }
  cont.innerHTML = `<div class="vd-sbar"><span>${T("pdeq", {i: Math.min(qs.length, hechas + 1), n: qs.length})}</span><b>✓ ${J.ok}</b></div>`;
  if (!V.player && !J.cargando) {
    J.cargando = true; const hh = V.h;
    reproductor("vd-yt", e.v, {estado: st0 => { if (st0 === 1) { J.sonando = true; const b = $("#vd-play"); if (b && J.abierta == null) { ov.hidden = true; ov.innerHTML = ""; } } if (st0 === 0) finIndividual(); }})
      .then(p => { J.cargando = false; if (V.h !== hh) { try { p && p.destroy(); } catch (er) {} return; } V.player = p; jugIndividual(); });
    return;
  }
  if (!V.player) return;
  if (!J.sonando && J.abierta == null) {
    const falta = e.t0 - (Date.now() + (J.off || 0));
    ov.hidden = false;
    if (falta > 0) { ov.innerHTML = `<div class="vd-q"><div class="cc-cuentaatras">${Math.ceil(falta / 1000)}</div><p>${T("atentos")}</p></div>`; clearTimeout(V.cuentaT); V.cuentaT = setTimeout(jugIndividual, Math.min(falta, 250)); return; }
    ov.innerHTML = `<div class="vd-q"><button class="btn main cc-big" id="vd-play" data-vd="play">${T("j_play")}</button></div>`;
    try { V.player.playVideo(); } catch (er) {}  /* en muchos móviles hace falta tocar el botón */
  }
  if (!reloj) reloj = setInterval(() => {
    const J2 = V.j; if (!J2 || J2.abierta != null || !V.player || J2.acabado) return;
    const tt = ahora(V.player), i = (J2.e.todas || []).findIndex((q, k) => J2.resp[k] == null && q.t <= tt + 0.15);
    if (i >= 0) { try { V.player.pauseVideo(); } catch (er) {} J2.abierta = i; J2.elegida = null; preguntaInd(); }
  }, 250);
}
function preguntaInd() {
  const J = V.j, ov = $("#vd-ov"), q = J.e.todas[J.abierta], e = J.elegida;
  ov.hidden = false;
  ov.innerHTML = `<div class="vd-q"><p class="vd-qn">${T("pdeq", {i: J.abierta + 1, n: J.e.todas.length})}</p><h2 class="cc-preg">${esc(q.p)}</h2>
    <div class="cc-botones n${q.o.length}">${q.o.map((o, j) => `<button class="cc-b cc-c${j}${J.correcta != null ? (j === J.correcta ? " si" : j === e ? " no" : " apag") : ""}" data-vd="indr" data-j="${j}"${e != null ? " disabled" : ""}>${opcHTML(o, j)}</button>`).join("")}</div>
    ${J.correcta != null ? `<div class="cc-resj ${e === J.correcta ? "si" : "no"}"><b>${e === J.correcta ? T("bien") : T("mal")}</b></div><button class="btn main cc-big" data-vd="indseguir">${T("seguir")}</button>` : e != null ? `<p>…</p>` : ""}</div>`;
}
async function responderInd(j) {
  const J = V.j; if (!J || J.abierta == null || J.elegida != null) return;
  J.elegida = j; preguntaInd();
  let r = null; for (let k = 0; k < 3 && !(r && r.ok); k++) r = await api("concursos", {accion: "responder", codigo: J.cod, pid: J.pid, i: J.abierta, o: j}).catch(() => null);
  J.correcta = r && r.ok ? r.j.correcta : j;  /* sin conexión: seguimos igual */
  J.resp[J.abierta] = j; if (r && r.ok && r.j.bien) J.ok++;
  preguntaInd();
}
function finIndividual() {
  const J = V.j; if (!J || J.acabado) return;
  const i = (J.e.todas || []).findIndex((q, k) => J.resp[k] == null);
  if (i >= 0) { J.abierta = i; J.elegida = null; J.correcta = null; return preguntaInd(); }
  J.acabado = true; clearInterval(reloj); reloj = null; jugIndividual();
}

/* ---------- botones ---------- */
document.addEventListener("click", async ev => {
  const b = ev.target.closest("[data-vd]"); if (!b || !V.app || !V.app.contains(b)) return;
  const a = b.dataset.vd, i = +b.dataset.i;
  if (a === "guardar") guardar();
  else if (a === "iatr") usarTranscripcion();
  else if (a === "iaponer") ponerIA();
  else if (a === "iacopiar") { const p = $("#vd-iaprompt"); if (await copiarTxt(p.value)) { const ok = $("#vd-iacop"); ok.hidden = false; setTimeout(() => { ok.hidden = true; }, 2500); } else p.select(); }
  else if (a === "masr") { E.preguntas[i].o.push(""); pintarPreguntas(); }
  else if (a === "menosr") { const q = E.preguntas[i]; q.o.pop(); if (q.c >= q.o.length) q.c = 0; pintarPreguntas(); }
  else if (a === "quitarp") { E.preguntas.splice(i, 1); pintarPreguntas(); }
  else if (a === "ahora") { if (V.player) { E.preguntas[i].t = Math.round(ahora(V.player) * 10) / 10; E.preguntas.sort((x, y) => x.t - y.t); pintarPreguntas(); } }
  else if (a === "ir") { if (V.player) { try { V.player.seekTo(Math.max(0, E.preguntas[i].t - 3), true); V.player.playVideo(); } catch (e) {} } }
  else if (a === "borrar") {
    if (!confirm(t("seguro", {t: V.c.titulo}))) return;
    if (V.id.startsWith("l")) store.set(LKEY, locales().filter(x => x.id !== V.id));
    else { const r = await api("concursos", {accion: "borrar", id: V.id}).catch(() => null); if (!r || !r.ok) return aviso(t("e_red"), true); }
    location.hash = "videos";
  }
  else if (a === "directo") { b.disabled = true; await abrirDirecto(); b.disabled = false; }
  else if (a === "solor") { const s = V.s; if (s.elegida != null) return; s.elegida = +b.dataset.j; s.resp[s.abierta] = s.elegida; const ok = s.elegida === s.c.preguntas[s.abierta].c; if (ok) s.ok++; xp(ok ? 2 : 0, {ok}); pintarSolo(); }
  else if (a === "seguir") {
    const s = V.s; s.abierta = -1; pintarSolo();
    let acabado = false; try { acabado = V.player.getPlayerState() === 0; } catch (e) {}
    if (acabado) alFinal(); else if (pendiente(s, ahora(V.player)) >= 0) vigilarSolo(); else try { V.player.playVideo(); } catch (e) {}
  }
  else if (a === "solootra") { const s = V.s; V.s = {...s, resp: {}, ok: 0, abierta: -1, fin: false}; $("#vd-fin").innerHTML = ""; try { V.player.seekTo(0, true); V.player.playVideo(); } catch (e) {} pintarSolo(); }
  else if (a === "modo") { V.p.op.modo = b.dataset.m; pintarHost(); }
  else if (a === "lect") { V.p.op.lectura = +b.dataset.n; pintarHost(); }
  else if (a === "lanzar") { b.disabled = true; pasarHost({modo: V.p.op.modo, lectura: V.p.op.lectura}); }
  else if (a === "pasar") { b.disabled = true; const P = V.p; const era = P.e && P.e.fase; await pasarHost(); if (era === "resultado" && V.player) try { V.player.playVideo(); } catch (e) {} }
  else if (a === "terminar") { b.disabled = true; pasarHost({}, "terminar"); }
  else if (a === "echar") { await api("concursos", {accion: "echar", codigo: V.p.cod, clave: V.p.clave, nombre: b.dataset.n}).catch(() => null); sondeoHost(); }
  else if (a === "pantalla") { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (er) {} }
  else if (a === "cerrar") { await api("concursos", {accion: "cerrarsala", codigo: V.p.cod, clave: V.p.clave}).catch(() => null); const hs = store.get(HKEY, {}); delete hs[V.p.cod]; store.set(HKEY, hs); location.hash = V.p.id ? "video-" + V.p.id : "videos"; }
  else if (a === "resp") responderProy(+b.dataset.j);
  else if (a === "play") { try { V.player.playVideo(); } catch (e) {} }
  else if (a === "indr") responderInd(+b.dataset.j);
  else if (a === "indseguir") { const J = V.j; J.abierta = null; J.elegida = null; J.correcta = null; const ov = $("#vd-ov"); ov.hidden = true; ov.innerHTML = "";
    let terminado = false; try { terminado = V.player.getPlayerState() === 0; } catch (e) {}
    if (terminado) finIndividual(); else try { V.player.playVideo(); } catch (e) {}
    const c = $("#vd-jcont .vd-sbar"); if (c) c.innerHTML = `<span>${T("pdeq", {i: Math.min(J.e.todas.length, Object.keys(J.resp).length + 1), n: J.e.todas.length})}</span><b>✓ ${J.ok}</b>`; }
});

const tab = () => esc(t("tab"));
window.LYAVideos = {render, isVd, tab, cargar};
})();
