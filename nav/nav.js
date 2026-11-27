/* COMPRENDO: navegación (nav/).
   - 5 apartados en una barra (abajo en el móvil, arriba en el ordenador): Inicio, Aprender, Practicar, En grupo y Mi zona.
     El sexto, «Profe», solo lo ven los profes (y el admin).
   - Páginas de cada apartado: #aprender (lo pinta index.html con las lecturas), #practicar (la sala de juegos de juegos/),
     #grupo, #mizona y #profe (las pinta este archivo).
   - Arriba, siempre: 🔍 buscador de palabras y 🌐 idioma (más la racha y la cuenta, que ya estaban).
   - Todas las direcciones antiguas (#juegos, #duelo, #canciones…) siguen funcionando: cada pantalla sabe a qué apartado pertenece. */
(() => {
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const L = () => window.LYA || {};
const st = () => { try { return L().get(); } catch (e) { return {}; } };
const ls = {get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }};

const TX = {
  es: {
    mates: "Mates", t_mates: "Matemáticas 1.º ESO", t_mates_p: "Explicaciones y ejercicios que no se acaban.", t_mgrupo: "Mates en grupo", t_mgrupo_p: "Recta humana, cadena de operaciones y más.", fpb: "FP Básica", t_fpb: "FP Básica: Lengua y más", t_fpb_p: "Lectura fácil, actividades para elegir y muchas pistas.", t_fgrupo: "FP Básica en grupo", t_fgrupo_p: "Concurso, parejas y el juego de la pizarra.", g_fpb: "Juegos de FP Básica", g_mates: "Juegos de mates",
    inicio: "Inicio", aprender: "Aprender", practicar: "Practicar", grupo: "En grupo", mizona: "Mi zona", profe: "Profe", menu: "Menú",
    buscar: "Buscar una palabra", buscar_ph: "Escribe una palabra…", buscar_help: "Escribe una palabra en {a} o en {b}.", nada: "No hemos encontrado esa palabra.", anadir: "＋ Al diccionario", anadida: "✓ En tu diccionario", oir: "Escuchar", cerrar: "Cerrar", buscadas: "🔍 Palabras buscadas",
    idioma: "Idioma", aprendo: "Quiero aprender…", se: "Sé…", pronto: "pronto", cambiar: "Cambiar", aprendes: "Aprendes {a} · Sabes {b}",
    sigue: "Sigue donde lo dejaste", volver: "Volver a", tu_semana: "Tu semana", xp_semana: "XP esta semana", racha_d: "días seguidos", nivel: "Nivel {n}", xp_falta: "{n} XP para el nivel {l}", ver_prog: "Ver mi progreso", empieza: "Empieza por una lectura", empieza_p: "Elige tu nivel y una lectura en «Aprender».", ir_aprender: "📖 Ir a las lecturas",
    t_lect: "Lecturas", t_lect_p: "Por niveles: {l}.", y: "y", t_gram_p: "Ordena frases y encuentra el error.", t_juegos_p: "Cartas, contrarreloj y ahorcado.", todo: "Todo COMPRENDO", todo_p: "Toca lo que quieras hacer.", ver_todo: "Ver todo", codigo_t: "Entrar con código", codigo_t_p: "Únete a la sala de tu clase.", f_seg_p: "Actividades, deberes y resultados.", a_h1: "Aprender", a_sub: "Lecturas por nivel y otras formas de aprender: dictados, canciones, vídeos y más.", mas: "Más formas de aprender", lecturas: "Lecturas",
    p_vocab: "Vocabulario", p_vocab_p: "Repasa las palabras que has guardado.",
    g_h1: "En grupo", g_sub: "Juega con tu clase o con amigos. Si te han dado un código, escríbelo aquí.", codigo: "Entrar con código", entrar: "Entrar", buscando: "Buscando la sala…", no_sala: "No hay ninguna sala abierta con ese código.", seis: "El código tiene 6 números.", crear_sala: "O crea una sala",
    z_h1: "Mi zona", z_sub: "Tus palabras, tu mascota, tus logros y tus deberes.",
    f_h1: "Profe", f_sub: "Tus clases, las actividades que creas, los deberes y los resultados.", solo_profe: "Este apartado es solo para profes. Entra con una cuenta de profe.", entrar_cuenta: "Entrar",
    f_seg: "Seguimiento", f_clases: "Mis clases", f_crear: "Crear actividad", f_creadas: "Actividades creadas", f_deberes: "Deberes", f_result: "Resultados",
    t_dictados: "Dictados", t_dictados_p: "Escucha una frase y escríbela.",
    t_camara: "Lectura con cámara", t_camara_p: "Haz una foto a un cartel y léelo.",
    t_canciones: "Canciones", t_canciones_p: "Escucha y escribe las palabras que faltan.",
    t_videos: "Vídeos con preguntas", t_videos_p: "El vídeo se para y contestas.",
    t_doblaje: "Doblaje", t_doblaje_p: "Pon tu voz a una escena o canción.",
    t_voz: "Pronunciación", t_voz_p: "En cada lectura: 🎤 léela en voz alta.",
    t_pronto: "Próximamente", t_pronto_p: "Lo que estamos preparando.",
    t_dicc: "Mi diccionario", t_dicc_p: "Tus palabras guardadas y el Remix.",
    t_fichas: "Flashcards", t_fichas_p: "Tarjetas con dibujos para repasar.",
    t_canpal: "Palabras de canciones", t_canpal_p: "Las que guardas de las canciones.",
    t_mascota: "Mascota", t_mascota_p: "Cuídala y cámbiale el aspecto.",
    t_logros: "Logros y progreso", t_logros_p: "Nivel, racha, medallas y cromos.",
    t_debhist: "Historial de deberes", t_debhist_p: "Los pendientes y los que ya has hecho.",
    t_duelo: "Duelos", t_duelo_p: "La misma lectura, a la vez, contra tu clase.",
    t_concursos: "Concursos", t_concursos_p: "Preguntas en la pantalla grande y respondes en el móvil.",
    t_escape: "Escape room", t_escape_p: "Habla con tu equipo para abrir los candados.",
    t_garabatos: "Garabatos", t_garabatos_p: "Uno dibuja y los demás adivinan la palabra.",
    t_rprueba: "Encuentra la prueba", t_rprueba_p: "Toca en el texto la frase que lo demuestra.", t_rapuesta: "Atrapa los puntos", t_rapuesta_p: "¿Verdadero o falso? Apuesta y demuéstralo.", t_rcartas: "Cartas a la mesa", t_rcartas_p: "Lanza tus palabras a los huecos del texto.", t_rtabu: "Palabra secreta", t_rtabu_p: "Explícala sin decir las prohibidas.", t_rpiloto: "Lector y piloto", t_rpiloto_p: "Unos ven el texto y otros las preguntas.",
    t_vdirecto: "Vídeos en directo", t_vdirecto_p: "Un vídeo con preguntas para toda la clase.",
    t_juegos: "Mini-juegos", t_gram: "Gramática y verbos",
    f_clases_p: "Tus alumnos y los códigos de clase.", f_creadas_p: "Pruébalas, lánzalas en directo o mándalas como deberes.", f_deberes_p: "Mandados, entregados y notas.", f_result_p: "El progreso de cada alumno y de la clase.", f_fallos: "Fallos", f_fallos_p: "Las preguntas que más fallan.", f_msgs: "Mensajes", f_msgs_p: "Escribe a tu clase.", f_admin: "Propuestas y votos", f_admin_p: "Temas propuestos y votación.",
    c_quiz: "Concurso con IA", c_quiz_p: "Con la foto del libro o un texto.", c_video: "Vídeo con preguntas", c_video_p: "Pega un enlace de YouTube.", c_dob: "Doblaje", c_dob_p: "Una escena o canción para doblar.", c_cancion: "Canción", c_cancion_p: "Una canción con huecos para tu clase.", t_tnuevo: "Añadir un tema", t_tnuevo_p: "Curso, tema y fotos del libro: lo preparamos para tu clase.", t_tmios: "Mis peticiones de temas", t_tmios_p: "En qué estado están los temas que has pedido.", t_tprofes: "Temas de mis profes", t_tprofes_p: "Temas preparados para tu clase."
  },
  en: {
    mates: "Maths", t_mates: "Maths (year 7, in Spanish)", t_mates_p: "Explanations and endless exercises.", t_mgrupo: "Maths together", t_mgrupo_p: "Human number line, operation chain and more.", fpb: "FP Básica", t_fpb: "FP Básica (in Spanish)", t_fpb_p: "Easy-read explanations and multiple-choice practice.", t_fgrupo: "FP Básica together", t_fgrupo_p: "Quiz, pairs and the whiteboard game.", g_fpb: "FP Básica games", g_mates: "Maths games",
    inicio: "Home", aprender: "Learn", practicar: "Practise", grupo: "Together", mizona: "My space", profe: "Teacher", menu: "Menu",
    buscar: "Look up a word", buscar_ph: "Type a word…", buscar_help: "Type a word in {a} or in {b}.", nada: "We couldn't find that word.", anadir: "＋ To my dictionary", anadida: "✓ In your dictionary", oir: "Listen", cerrar: "Close", buscadas: "🔍 Words I looked up",
    idioma: "Language", aprendo: "I want to learn…", se: "I know…", pronto: "soon", cambiar: "Change", aprendes: "You learn {a} · You know {b}",
    sigue: "Carry on where you left off", volver: "Back to", tu_semana: "Your week", xp_semana: "XP this week", racha_d: "days in a row", nivel: "Level {n}", xp_falta: "{n} XP to level {l}", ver_prog: "See my progress", empieza: "Start with a reading", empieza_p: "Pick your level and a reading in «Learn».", ir_aprender: "📖 Go to the readings",
    t_lect: "Readings", t_lect_p: "By level: {l}.", y: "and", t_gram_p: "Order sentences and find the mistake.", t_juegos_p: "Cards, time attack and hangman.", todo: "All of COMPRENDO", todo_p: "Tap what you want to do.", ver_todo: "See all", codigo_t: "Join with a code", codigo_t_p: "Join your class room.", f_seg_p: "Activities, homework and results.", a_h1: "Learn", a_sub: "Readings by level and more ways to learn: dictation, songs, videos and more.", mas: "More ways to learn", lecturas: "Readings",
    p_vocab: "Vocabulary", p_vocab_p: "Review the words you have saved.",
    g_h1: "Together", g_sub: "Play with your class or your friends. If you have a code, type it here.", codigo: "Join with a code", entrar: "Join", buscando: "Looking for the room…", no_sala: "There is no open room with that code.", seis: "The code has 6 numbers.", crear_sala: "Or create a room",
    z_h1: "My space", z_sub: "Your words, your pet, your achievements and your homework.",
    f_h1: "Teacher", f_sub: "Your classes, the activities you create, homework and results.", solo_profe: "This section is only for teachers. Sign in with a teacher account.", entrar_cuenta: "Sign in",
    f_seg: "Follow-up", f_clases: "My classes", f_crear: "Create an activity", f_creadas: "My activities", f_deberes: "Homework", f_result: "Results",
    t_dictados: "Dictation", t_dictados_p: "Listen to a sentence and write it.",
    t_camara: "Camera reading", t_camara_p: "Take a photo of a sign and read it.",
    t_canciones: "Songs", t_canciones_p: "Listen and type the missing words.",
    t_videos: "Videos with questions", t_videos_p: "The video stops and you answer.",
    t_doblaje: "Dubbing", t_doblaje_p: "Put your voice on a scene or a song.",
    t_voz: "Pronunciation", t_voz_p: "In every reading: 🎤 read it aloud.",
    t_pronto: "Coming soon", t_pronto_p: "What we are working on.",
    t_dicc: "My dictionary", t_dicc_p: "Your saved words and the Remix.",
    t_fichas: "Flashcards", t_fichas_p: "Picture cards to review.",
    t_canpal: "Words from songs", t_canpal_p: "The ones you save from songs.",
    t_mascota: "Pet", t_mascota_p: "Look after it and change its look.",
    t_logros: "Achievements and progress", t_logros_p: "Level, streak, medals and stickers.",
    t_debhist: "Homework history", t_debhist_p: "To do and already done.",
    t_duelo: "Duels", t_duelo_p: "The same reading, at the same time, against your class.",
    t_concursos: "Quizzes", t_concursos_p: "Questions on the big screen, answers on your phone.",
    t_escape: "Escape room", t_escape_p: "Talk to your team to open the locks.",
    t_garabatos: "Scribbles", t_garabatos_p: "One draws and the others guess the word.",
    t_rprueba: "Find the proof", t_rprueba_p: "Tap the sentence in the text that proves it.", t_rapuesta: "Catch the points", t_rapuesta_p: "True or false? Bet and prove it.", t_rcartas: "Cards on the table", t_rcartas_p: "Play your words into the gaps in the text.", t_rtabu: "Secret word", t_rtabu_p: "Explain it without the forbidden words.", t_rpiloto: "Reader and pilot", t_rpiloto_p: "Some see the text, others the questions.",
    t_vdirecto: "Live videos", t_vdirecto_p: "A video with questions for the whole class.",
    t_juegos: "Mini-games", t_gram: "Grammar and verbs",
    f_clases_p: "Your students and class codes.", f_creadas_p: "Try them, play them live or set them as homework.", f_deberes_p: "Set, handed in and marks.", f_result_p: "Each student's and the class's progress.", f_fallos: "Mistakes", f_fallos_p: "The questions they get wrong most.", f_msgs: "Messages", f_msgs_p: "Write to your class.", f_admin: "Ideas and votes", f_admin_p: "Topic ideas and voting.",
    c_quiz: "Quiz with AI", c_quiz_p: "From a photo of the book or a text.", c_video: "Video with questions", c_video_p: "Paste a YouTube link.", c_dob: "Dubbing", c_dob_p: "A scene or song to dub.", c_cancion: "Song", c_cancion_p: "A song with gaps for your class.", t_tnuevo: "Add a unit", t_tnuevo_p: "Course, unit and photos of the book: we prepare it for your class.", t_tmios: "My unit requests", t_tmios_p: "The status of the units you asked for.", t_tprofes: "My teachers' units", t_tprofes_p: "Units prepared for your class."
  },
  ca: {
    mates: "Mates", t_mates: "Matemàtiques 1r ESO (en castellà)", t_mates_p: "Explicacions i exercicis que no s’acaben.", t_mgrupo: "Mates en grup", t_mgrupo_p: "Recta humana, cadena d’operacions i més.", fpb: "FP Bàsica", t_fpb: "FP Bàsica (en castellà)", t_fpb_p: "Lectura fàcil, activitats per triar i moltes pistes.", t_fgrupo: "FP Bàsica en grup", t_fgrupo_p: "Concurs, parelles i el joc de la pissarra.", g_fpb: "Jocs de FP Bàsica", g_mates: "Jocs de mates",
    inicio: "Inici", aprender: "Aprendre", practicar: "Practicar", grupo: "En grup", mizona: "El meu espai", profe: "Profe", menu: "Menú",
    buscar: "Buscar una paraula", buscar_ph: "Escriu una paraula…", buscar_help: "Escriu una paraula en {a} o en {b}.", nada: "No hem trobat aquesta paraula.", anadir: "＋ Al diccionari", anadida: "✓ Al teu diccionari", oir: "Escoltar", cerrar: "Tancar", buscadas: "🔍 Paraules buscades",
    idioma: "Idioma", aprendo: "Vull aprendre…", se: "Sé…", pronto: "aviat", cambiar: "Canviar", aprendes: "Aprens {a} · Saps {b}",
    sigue: "Continua on ho vas deixar", volver: "Tornar a", tu_semana: "La teva setmana", xp_semana: "XP aquesta setmana", racha_d: "dies seguits", nivel: "Nivell {n}", xp_falta: "{n} XP per al nivell {l}", ver_prog: "Veure el meu progrés", empieza: "Comença per una lectura", empieza_p: "Tria el teu nivell i una lectura a «Aprendre».", ir_aprender: "📖 Anar a les lectures",
    t_lect: "Lectures", t_lect_p: "Per nivells: {l}.", y: "i", t_gram_p: "Ordena frases i troba l'errada.", t_juegos_p: "Cartes, contrarellotge i penjat.", todo: "Tot COMPRENDO", todo_p: "Toca el que vulguis fer.", ver_todo: "Veure-ho tot", codigo_t: "Entrar amb codi", codigo_t_p: "Uneix-te a la sala de la classe.", f_seg_p: "Activitats, deures i resultats.", a_h1: "Aprendre", a_sub: "Lectures per nivell i altres maneres d'aprendre: dictats, cançons, vídeos i més.", mas: "Més maneres d'aprendre", lecturas: "Lectures",
    p_vocab: "Vocabulari", p_vocab_p: "Repassa les paraules que has desat.",
    g_h1: "En grup", g_sub: "Juga amb la teva classe o amb amics. Si t'han donat un codi, escriu-lo aquí.", codigo: "Entrar amb codi", entrar: "Entrar", buscando: "Buscant la sala…", no_sala: "No hi ha cap sala oberta amb aquest codi.", seis: "El codi té 6 números.", crear_sala: "O crea una sala",
    z_h1: "El meu espai", z_sub: "Les teves paraules, la mascota, els assoliments i els deures.",
    f_h1: "Profe", f_sub: "Les teves classes, les activitats que crees, els deures i els resultats.", solo_profe: "Aquest apartat és només per a profes. Entra amb un compte de profe.", entrar_cuenta: "Entrar",
    f_seg: "Seguiment", f_clases: "Les meves classes", f_crear: "Crear activitat", f_creadas: "Activitats creades", f_deberes: "Deures", f_result: "Resultats",
    t_dictados: "Dictats", t_dictados_p: "Escolta una frase i escriu-la.",
    t_camara: "Lectura amb càmera", t_camara_p: "Fes una foto a un cartell i llegeix-lo.",
    t_canciones: "Cançons", t_canciones_p: "Escolta i escriu les paraules que falten.",
    t_videos: "Vídeos amb preguntes", t_videos_p: "El vídeo s'atura i contestes.",
    t_doblaje: "Doblatge", t_doblaje_p: "Posa la teva veu a una escena o cançó.",
    t_voz: "Pronunciació", t_voz_p: "A cada lectura: 🎤 llegeix-la en veu alta.",
    t_pronto: "Properament", t_pronto_p: "El que estem preparant.",
    t_dicc: "El meu diccionari", t_dicc_p: "Les paraules desades i el Remix.",
    t_fichas: "Flashcards", t_fichas_p: "Targetes amb dibuixos per repassar.",
    t_canpal: "Paraules de cançons", t_canpal_p: "Les que deses de les cançons.",
    t_mascota: "Mascota", t_mascota_p: "Cuida-la i canvia-li l'aspecte.",
    t_logros: "Assoliments i progrés", t_logros_p: "Nivell, ratxa, medalles i cromos.",
    t_debhist: "Historial de deures", t_debhist_p: "Els pendents i els que ja has fet.",
    t_duelo: "Duels", t_duelo_p: "La mateixa lectura, alhora, contra la classe.",
    t_concursos: "Concursos", t_concursos_p: "Preguntes a la pantalla gran i respons al mòbil.",
    t_escape: "Escape room", t_escape_p: "Parla amb el teu equip per obrir els cadenats.",
    t_garabatos: "Gargots", t_garabatos_p: "Un dibuixa i els altres endevinen la paraula.",
    t_rprueba: "Troba la prova", t_rprueba_p: "Toca al text la frase que ho demostra.", t_rapuesta: "Atrapa els punts", t_rapuesta_p: "Vertader o fals? Aposta i demostra-ho.", t_rcartas: "Cartes a la taula", t_rcartas_p: "Llança les teves paraules als buits del text.", t_rtabu: "Paraula secreta", t_rtabu_p: "Explica-la sense dir les prohibides.", t_rpiloto: "Lector i pilot", t_rpiloto_p: "Uns veuen el text i altres les preguntes.",
    t_vdirecto: "Vídeos en directe", t_vdirecto_p: "Un vídeo amb preguntes per a tota la classe.",
    t_juegos: "Minijocs", t_gram: "Gramàtica i verbs",
    f_clases_p: "Els teus alumnes i els codis de classe.", f_creadas_p: "Prova-les, llança-les en directe o envia-les com a deures.", f_deberes_p: "Enviats, entregats i notes.", f_result_p: "El progrés de cada alumne i de la classe.", f_fallos: "Errades", f_fallos_p: "Les preguntes que més fallen.", f_msgs: "Missatges", f_msgs_p: "Escriu a la teva classe.", f_admin: "Propostes i vots", f_admin_p: "Temes proposats i votació.",
    c_quiz: "Concurs amb IA", c_quiz_p: "Amb la foto del llibre o un text.", c_video: "Vídeo amb preguntes", c_video_p: "Enganxa un enllaç de YouTube.", c_dob: "Doblatge", c_dob_p: "Una escena o cançó per doblar.", c_cancion: "Cançó", c_cancion_p: "Una cançó amb buits per a la classe.", t_tnuevo: "Afegir un tema", t_tnuevo_p: "Curs, tema i fotos del llibre: el preparem per a la teva classe.", t_tmios: "Les meves peticions de temes", t_tmios_p: "En quin estat estan els temes que has demanat.", t_tprofes: "Temes dels meus profes", t_tprofes_p: "Temes preparats per a la teva classe."
  }
};
/* la navegación sigue la misma regla que el resto de la web: va en el idioma que se aprende y,
   en A1 (CAT.settings.ui = "both"), con el idioma que ya sabe al lado */
const lg = () => { const S = st().S; return S && TX[S.learn] ? S.learn : "es"; };
const kn = () => { const S = st().S; return S && TX[S.know] ? S.know : null; };
const dos = () => { try { return !!L().both?.() && !!kn() && kn() !== lg(); } catch (e) { return false; } };
const t = (k, v, l = lg()) => { let s = TX[l]?.[k] ?? TX.es[k] ?? k; for (const x in v || {}) s = s.split(`{${x}}`).join(v[x]); return s; };
/* segunda lengua (solo A1 y solo si dice algo distinto): en línea (t2) o en otra línea (tb) */
const t2 = (k, v) => { if (!dos()) return ""; const a = t(k, v), b = t(k, v, kn()); return a === b ? "" : ` <span class="nven">· ${esc(b)}</span>`; };
const tb = (k, v) => { if (!dos()) return ""; const a = t(k, v), b = t(k, v, kn()); return a === b ? "" : `<span class="nven nvenb">${esc(b)}</span>`; };
const rol = () => { try { return window.LYACuentas?.rol || null; } catch (e) { return null; } };
const esProfe = () => rol() === "profe" || rol() === "admin";

/* ---------- apartados ---------- */
const SECS = [["inicio", "🏠"], ["aprender", "📖"], ["practicar", "🎮"], ["mates", "➗"], ["fpb", "🛠️"], ["grupo", "🏫"], ["mizona", "📚"], ["profe", "👩‍🏫"]];
const HUBS = ["grupo", "mizona", "profe"];
const isHub = h => HUBS.includes(h) || /^profe-alumno-./.test(h);  /* profe-alumno-<usuario>: ficha de un alumno (profe/profe.js) */
const hash = () => location.hash.replace(/^#/, "");
function secOf(view, h = hash()) {
  if (view === "hub") return isHub(h) ? h.replace(/^profe-alumno-.*/, "profe") : "inicio";
  if (view === "home") return "inicio";
  if (view === "deb") return "mizona";
  if (["learn", "read", "dictado", "camara", "songs", "dub", "pronto"].includes(view)) return "aprender";
  if (view === "vd") return /^(videos-proyectar|vjugar)/.test(h) ? "grupo" : /^videos-editar/.test(h) && esProfe() ? "profe" : "aprender";
  if (view === "cc") return /^concursos-(crear|editar)/.test(h) && esProfe() ? "profe" : "grupo";
  if (view === "games") return /^garabatos/.test(h) ? "grupo" : "practicar";
  if (view === "duelo" || view === "escape" || view === "retos") return "grupo";
  if (view === "mates") return /^mates-(sala|pizarra)-/.test(h) ? "grupo" : "mates";
  if (view === "tp") return /^profe-/.test(h) ? "profe" : "aprender";
  if (view === "fpb") return /^fpb-(sala|pizarra)-/.test(h) ? "grupo" : "fpb";
  if (["dict", "fc", "pet", "prog"].includes(view)) return "mizona";
  return "inicio";
}
const pendientes = () => { try { return window.LYAAvisos?.pendientes?.() || 0; } catch (e) { return 0; } };
function bar(view) {
  const cur = secOf(view);
  return SECS.filter(([k]) => k !== "profe" || esProfe()).map(([k, ic]) => {
    const n = k === "inicio" ? pendientes() : 0;
    return `<a href="#${k}" data-sec="${k}"${kn() && kn() !== lg() ? ` title="${esc(t(k, null, kn()))}"` : ""} ${cur === k ? 'aria-current="page"' : ""}><span class="nvi" aria-hidden="true">${ic}</span><span class="nvl">${esc(t(k))}</span>${n ? `<span class="nvn" aria-label="(${n})">${n}</span>` : ""}</a>`;
  }).join("");
}

/* ---------- tarjetas ---------- */
/* niveles que tiene de verdad el curso (el catalán llega al C1) */
const niveles = () => { const ls = [...new Set((L().rdList?.() || []).filter(r => r.file).map(r => r.level))].sort(); return ls.length > 1 ? ls.slice(0, -1).join(", ") + " " + t("y") + " " + ls[ls.length - 1] : ls.join("") || "A1, A2, B1 " + t("y") + " B2"; };
const tile = (href, ic, k, extra = "") => `<a class="nvt" href="${href}"${extra}><span class="nvti" aria-hidden="true">${ic}</span><span class="nvtt"><b>${esc(t(k))}</b>${tb(k)}<span>${esc(t(k + "_p", k === "t_lect" ? {l: niveles()} : undefined))}</span></span></a>`;
const btile = (data, ic, k) => `<button class="nvt" type="button" ${data}><span class="nvti" aria-hidden="true">${ic}</span><span class="nvtt"><b>${esc(t(k))}</b>${tb(k)}<span>${esc(t(k + "_p"))}</span></span></button>`;
function pronLink() {
  const {S} = st();
  const r = S && L().rdById?.(S.read);
  if (r && r.file) return "#" + r.id;
  const first = L().rdList?.().find(x => x.file && x.level === (S?.level || "A1"));
  return first ? "#" + first.id : "#aprender";
}
const APRENDER = () => [
  window.LYATemasProfe?.hay && ["#mis-temas", "📚", "t_tprofes"],
  window.LYADictados && ["#dictados", "✍️", "t_dictados"],
  window.LYACamara && ["#camara", "📷", "t_camara"],
  window.LYACanciones && ["#canciones", "🎵", "t_canciones"],
  window.LYAVideos && ["#videos", "📺", "t_videos"],
  window.LYADoblaje && ["#doblaje", "🎬", "t_doblaje"],
  [pronLink(), "🎤", "t_voz"],
  window.LYAPronto?.pending?.() && ["#proximamente", "🔜", "t_pronto"]
].filter(Boolean);
const aprenderTiles = () => `<div class="nvtiles nvsmall">${APRENDER().map(([h, ic, k]) => tile(h, ic, k)).join("")}</div>`;
const practicarExtra = () => `<section class="nvsec"><h2>📝 ${esc(t("p_vocab"))}${t2("p_vocab")}</h2><div class="nvtiles nvsmall">${tile("#diccionario", "📖", "t_dicc")}${window.LYAFichas ? tile("#fichas", "🃏", "t_fichas") : ""}</div></section>`;

function renderGrupo(el) {
  el.innerHTML = `<section class="wrap nvhub"><h1>🏫 ${esc(t("g_h1"))}${t2("g_h1")}</h1><p class="nvsub">${esc(t("g_sub"))}${tb("g_sub")}</p>
    <form class="nvcode" id="nvcode" novalidate><label for="nvcin">🔑 ${esc(t("codigo"))}${t2("codigo")}</label>
      <div class="nvcrow"><input id="nvcin" inputmode="numeric" autocomplete="off" maxlength="6" placeholder="123456" aria-describedby="nvcmsg"><button class="btn main" type="submit">${esc(t("entrar"))}</button></div>
      <p class="nvmsg" id="nvcmsg" role="alert"></p></form>
    <h2 class="nvh2">${esc(t("crear_sala"))}${t2("crear_sala")}</h2>
    <div class="nvtiles">${[
      window.LYADuelo && tile("#duelo", "⚔️", "t_duelo"),
      window.LYAConcursos && tile("#concursos", "🏆", "t_concursos"),
      window.LYAEscape && tile("#escape", "🔐", "t_escape"),
      window.LYAGarabatos && tile("#garabatos", "✏️", "t_garabatos"),
      window.LYAVideos && tile("#videos", "📺", "t_vdirecto"),
      ...(window.LYARetos ? Object.entries(LYARetos.JUEGOS).map(([j, x]) => tile("#reto-" + j, x.ic, "t_r" + j)) : [])].filter(Boolean).join("")}</div>
    ${window.LYAMatesGrupo ? `<h2 class="nvh2">➗ ${esc(t("g_mates"))}${t2("g_mates")}</h2>${LYAMatesGrupo.tiles()}` : ""}
    ${window.LYAFpbGrupo ? `<h2 class="nvh2">🛠️ ${esc(t("g_fpb"))}${t2("g_fpb")}</h2>${LYAFpbGrupo.tiles()}` : ""}</section>`;
  const f = el.querySelector("#nvcode"), inp = f.querySelector("input"), msg = f.querySelector(".nvmsg");
  inp.addEventListener("input", () => { inp.value = inp.value.replace(/\D/g, "").slice(0, 6); msg.textContent = ""; });
  f.addEventListener("submit", async e => {
    e.preventDefault();
    const c = inp.value.trim();
    if (!/^\d{6}$/.test(c)) { msg.textContent = t("seis"); inp.focus(); return; }
    msg.textContent = t("buscando"); f.querySelector("button").disabled = true;
    const ruta = await buscarSala(c);
    f.querySelector("button").disabled = false;
    if (ruta) location.hash = ruta; else { msg.textContent = t("no_sala"); inp.select(); }
  });
}
/* un código de 6 cifras puede ser de un concurso, un vídeo en directo, un duelo, un escape room o una sala de Garabatos */
async function buscarSala(c) {
  const prueba = (url, f) => fetch(url, {cache: "no-store"}).then(async r => r.ok ? f(await r.json().catch(() => ({}))) : null).catch(() => null);
  const rs = await Promise.all([
    prueba("api/concursos?sala=" + c, j => (j.tipo === "video" ? "vjugar-" : "jugar-") + c),
    prueba("api/duelo?c=" + c, () => "duelo-" + c),
    prueba("api/propuestas?escape=1&sala=" + c, () => "escape-" + c),
    prueba("api/dibujos?sala=" + c, () => "garabatos-" + c),
    prueba("api/propuestas?retos=1&sala=" + c, j => (/^m-/.test(j.sala?.juego || "") ? "mates-sala-" : /^f-/.test(j.sala?.juego || "") ? "fpb-sala-" : "reto-") + c)
  ]);
  return rs.find(Boolean) || null;
}
function renderZona(el) {
  const {S} = st();
  const n = S ? S.dict.filter(d => d.l === S.learn).length : 0, nc = S ? S.dict.filter(d => d.l === S.learn && d.r === "canciones").length : 0;
  el.innerHTML = `<section class="wrap nvhub"><h1>📚 ${esc(t("z_h1"))}${t2("z_h1")}</h1><p class="nvsub">${esc(t("z_sub"))}${tb("z_sub")}</p>
    <div class="nvtiles">${tile("#diccionario", "📖", "t_dicc", n ? ` data-n="${n}"` : "")}
      ${window.LYACanciones ? tile("#diccionario", "🎵", "t_canpal", nc ? ` data-n="${nc}"` : "") : ""}
      ${window.LYAFichas ? tile("#fichas", "🃏", "t_fichas") : ""}
      ${window.LYAMascota ? tile("#mascota", "🐾", "t_mascota") : ""}
      ${tile("#progreso", "🏅", "t_logros")}
      ${window.LYAAvisos ? tile("#deberes", "🗂️", "t_debhist") : ""}</div></section>`;
}
function renderProfe(el) {
  if (!esProfe()) {
    el.innerHTML = `<section class="wrap nvhub"><h1>👩‍🏫 ${esc(t("f_h1"))}${t2("f_h1")}</h1><p class="nvsub">${esc(t("solo_profe"))}${tb("solo_profe")}</p>${window.LYACuentas ? `<p><button class="btn main" type="button" data-nv="cuenta">${esc(t("entrar_cuenta"))}</button></p>` : ""}</section>`;
    return;
  }
  const P = k => `data-nv="panel" data-tab="${k}"`;
  el.innerHTML = `<section class="wrap nvhub"><h1>👩‍🏫 ${esc(t("f_h1"))}${t2("f_h1")}</h1><p class="nvsub">${esc(t("f_sub"))}${tb("f_sub")}</p>
    <div class="nvtiles">${btile(P("clases"), "🏫", "f_clases")}</div>
    <h2 class="nvh2">🧩 ${esc(t("f_crear"))}${t2("f_crear")}</h2>
    <div class="nvtiles">${[
      window.LYAConcursos && tile("#concursos-crear", "🏆", "c_quiz"),
      window.LYAVideos && tile("#videos-editar", "📺", "c_video"),
      window.LYADoblaje && tile("#doblaje", "🎬", "c_dob"),
      window.LYACanciones && tile("#canciones", "🎵", "c_cancion"),
      window.LYATemasProfe && tile("#profe-tema-nuevo", "➕", "t_tnuevo"),
      window.LYATemasProfe && tile("#profe-temas", "📥", "t_tmios"),
      window.LYATemasProfe && tile("#mis-temas", "📚", "t_tprofes")].filter(Boolean).join("")}</div>
    <h2 class="nvh2">📋 ${esc(t("f_seg"))}${t2("f_seg")}</h2>
    <div class="nvtiles">${btile(P("actividades"), "🧩", "f_creadas")}${btile(P("deberes"), "📚", "f_deberes")}${btile(P("usuarios"), "📊", "f_result")}${btile(P("fallos"), "❌", "f_fallos")}${btile(P("mensajes"), "✉️", "f_msgs")}${rol() === "admin" ? btile(P("propuestas"), "💡", "f_admin") : ""}</div></section>`;
  /* la portada del profe (su clase, estadísticas, deberes, a qué juegan y fichas de alumnos) está en profe/profe.js; estas tarjetas van abajo como «herramientas» */
  if (window.LYAProfe) { const sec = el.querySelector(".nvhub"); sec.querySelector("h1")?.remove(); sec.querySelector(".nvsub")?.remove(); LYAProfe.render(el, sec.innerHTML); }
}
function render(el) {
  const h = hash();
  if (h === "grupo") renderGrupo(el);
  else if (h === "profe" || /^profe-alumno-/.test(h)) renderProfe(el);
  else renderZona(el);
  try { L().setAcc?.("#ff4141"); } catch (e) {}
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-nv]"); if (!b) return;
  const a = b.dataset.nv;
  if (a === "panel") window.LYACuentas?.panel(b.dataset.tab);
  else if (a === "cuenta") window.LYACuentas?.abrir();
  else if (a === "buscar") abrirBuscar();
  else if (a === "idioma") abrirIdioma(b);
});

/* ---------- Inicio ---------- */
/* lo último que hizo fuera de las lecturas (para «Sigue donde lo dejaste») */
const ULT = "lyaNavUltimo";
const LUGARES = [
  [/^juego-/, "🎮", "t_juegos"], [/^gram-/, "✏️", "t_gram"], [/^dictado/, "✍️", "t_dictados"], [/^camara$/, "📷", "t_camara"],
  [/^canciones/, "🎵", "t_canciones"], [/^(videos$|video-solo-)/, "📺", "t_videos"], [/^doblaje/, "🎬", "t_doblaje"], [/^fichas$/, "🃏", "t_fichas"],
  [/^diccionario$/, "📖", "t_dicc"], [/^mascota$/, "🐾", "t_mascota"], [/^fpb-[a-z]\d+-\d+$/, "🛠️", "t_fpb"]
];
function apuntar() {
  const h = hash(), m = LUGARES.find(([re]) => re.test(h));
  if (m && !/\d{6}/.test(h)) ls.set(ULT, {h, f: Date.now()});
}
addEventListener("hashchange", apuntar);
/* Inicio: todo lo que hay, apartado por apartado, en tarjetas para tocar */
function mapa() {
  const G = [
    ["aprender", "📖", "#aprender", [["#aprender", "📚", "t_lect"], ...APRENDER()]],
    ["practicar", "🎮", "#practicar", [window.LYAGram && ["#practicar", "✏️", "t_gram"], ["#diccionario", "📝", "p_vocab"], window.LYAFichas && ["#fichas", "🃏", "t_fichas"], window.LYAJuegos && ["#practicar", "🎲", "t_juegos"]]],
    ["grupo", "🏫", "#grupo", [["#grupo", "🔑", "codigo_t"], window.LYADuelo && ["#duelo", "⚔️", "t_duelo"], window.LYAConcursos && ["#concursos", "🏆", "t_concursos"], window.LYAEscape && ["#escape", "🔐", "t_escape"], window.LYAGarabatos && ["#garabatos", "✏️", "t_garabatos"], window.LYAVideos && ["#videos", "📺", "t_vdirecto"], ...(window.LYARetos ? Object.entries(LYARetos.JUEGOS).map(([j, x]) => ["#reto-" + j, x.ic, "t_r" + j]) : [])]],
    ["mates", "➗", "#mates", [window.LYAMates && ["#mates", "📚", "t_mates"], window.LYAMatesGrupo && ["#mates-grupo", "🏫", "t_mgrupo"]]],
    ["fpb", "🛠️", "#fpb", [window.LYAFpb && ["#fpb", "📚", "t_fpb"], window.LYAFpbGrupo && ["#fpb-grupo", "🏫", "t_fgrupo"]]],
    ["mizona", "📚", "#mizona", [["#diccionario", "📖", "t_dicc"], window.LYACanciones && ["#diccionario", "🎵", "t_canpal"], window.LYAFichas && ["#fichas", "🃏", "t_fichas"], window.LYAMascota && ["#mascota", "🐾", "t_mascota"], ["#progreso", "🏅", "t_logros"], window.LYAAvisos && ["#deberes", "🗂️", "t_debhist"]]]
  ];
  if (esProfe()) G.push(["profe", "👩‍🏫", "#profe", [["#profe", "🏫", "f_clases"], window.LYAConcursos && ["#concursos-crear", "🏆", "c_quiz"], window.LYAVideos && ["#videos-editar", "📺", "c_video"], window.LYADoblaje && ["#doblaje", "🎬", "c_dob"], window.LYACanciones && ["#canciones", "🎵", "c_cancion"], window.LYATemasProfe && ["#profe-tema-nuevo", "➕", "t_tnuevo"], ["#profe", "📋", "f_seg"]]]);
  return `<section class="nvmapa"><h2>🧭 ${esc(t("todo"))}${t2("todo")}</h2><p class="nvsub">${esc(t("todo_p"))}${tb("todo_p")}</p>
    ${G.map(([k, ic, h, items]) => `<div class="nvgr nvgr-${k}"><div class="nvgrh"><h3>${ic} ${esc(t(k))}</h3><a href="${h}">${esc(t("ver_todo"))} →</a></div>
      <div class="nvtiles">${items.filter(Boolean).map(([hh, i2, kk]) => tile(hh, i2, kk)).join("")}</div></div>`).join("")}</section>`;
}
function inicio({card, streak, lvl, xp, a, b, wk}) {
  const u = ls.get(ULT), m = u && LUGARES.find(([re]) => re.test(u.h));
  const otro = m ? `<a class="nvt" href="#${esc(u.h)}"><span class="nvti" aria-hidden="true">${m[1]}</span><span class="nvtt"><span>${esc(t("volver"))}</span><b>${esc(t(m[2]))}</b></span></a>` : "";
  const sigue = card || otro ? `<section class="nvsec nvsigue"><h2>▶️ ${esc(t("sigue"))}${t2("sigue")}</h2><div class="nvsg">${card || ""}${otro ? `<div class="nvtiles nvsmall">${otro}</div>` : ""}</div></section>`
    : `<section class="nvsec nvsigue"><h2>▶️ ${esc(t("empieza"))}${t2("empieza")}</h2><p class="nvsub">${esc(t("empieza_p"))}${tb("empieza_p")}</p><p><a class="btn main" href="#aprender">${esc(t("ir_aprender"))}</a></p></section>`;
  const semana = `<section class="nvsec"><h2>📅 ${esc(t("tu_semana"))}${t2("tu_semana")}</h2><a class="nvstats" href="#progreso" aria-label="${esc(t("ver_prog"))}">
    <span class="nvst"><b><span class="fire${streak ? "" : " off"}" aria-hidden="true">🔥</span> ${streak}</b><span>${esc(t("racha_d"))}</span></span>
    <span class="nvst"><b>⭐ ${wk}</b><span>${esc(t("xp_semana"))}</span></span>
    <span class="nvst nvlv"><b>${esc(t("nivel", {n: lvl}))}</b><span class="nvxpb"><i style="width:${Math.max(0, Math.min(100, (xp - a) / (b - a) * 100))}%"></i></span><span>${esc(t("xp_falta", {n: b - xp, l: lvl + 1}))}</span></span></a></section>`;
  return sigue + semana;
}
function idiomaLinea() {
  const {S, CAT} = st(); if (!S || !CAT) return "";
  const nm = (c, l = lg()) => CAT.languages[c]?.name?.[l] || CAT.languages[c]?.name?.en || c;
  return `<p class="nvlang">🌐 ${esc(t("aprendes", {a: nm(S.learn), b: nm(S.know)}))}${dos() ? ` <span class="nven">· ${esc(t("aprendes", {a: nm(S.learn, kn()), b: nm(S.know, kn())}, kn()))}</span>` : ""} <button type="button" class="nvlink" data-nv="idioma">${esc(t("cambiar"))}</button></p>`;
}

/* ---------- barra superior: buscador e idioma ---------- */
function tools() {
  const {S} = st();
  return `<button type="button" class="nvtool" data-nv="buscar" aria-label="${esc(t("buscar"))}" title="${esc(t("buscar"))}">🔍</button><button type="button" class="nvtool" data-nv="idioma" aria-label="${esc(t("idioma"))}" title="${esc(t("idioma"))}" aria-haspopup="dialog">🌐<span class="nvtl">${esc((S?.learn || "").toUpperCase())}</span></button>`;
}
let ov = null, ovFrom = null;
function capa(html, cls) {
  if (!ov) {
    ov = document.createElement("div"); ov.className = "nvov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.addEventListener("click", e => { if (e.target === ov || e.target.closest("[data-nvx]")) cerrarCapa(); });
    addEventListener("keydown", e => { if (e.key === "Escape" && ov.classList.contains("on")) cerrarCapa(); });
    document.body.appendChild(ov);
  }
  ovFrom = document.activeElement;
  ov.className = "nvov on " + (cls || "");
  ov.innerHTML = `<div class="nvbox"><button type="button" class="nvx" data-nvx aria-label="${esc(t("cerrar"))}">✕</button>${html}</div>`;
  return ov;
}
function cerrarCapa() { if (!ov) return; ov.classList.remove("on"); ov.innerHTML = ""; try { ovFrom?.focus({preventScroll: true}); } catch (e) {} }
addEventListener("hashchange", cerrarCapa);

/* idioma: lo mismo que los botones que había en la portada */
function abrirIdioma() {
  const {S, CAT} = st(); if (!S || !CAT) return;
  const langs = Object.keys(CAT.languages);
  const okKnow = c => CAT.courses.some(x => x.ready && x.know.includes(c)), okLearn = c => CAT.courses.some(x => x.ready && x.learn === c);
  const nm = (c, l) => CAT.languages[c].name[l] || CAT.languages[c].name.en;
  const chip = (c, on, ok, act) => `<button class="chip" type="button" data-nvl="${act}" data-l="${c}" aria-pressed="${on}" ${ok ? "" : "disabled"}>${esc(nm(c, c))}${ok ? (c !== S.know ? `<small>${esc(nm(c, S.know))}</small>` : "") : `<small>${esc(t("pronto"))}</small>`}</button>`;
  const o = capa(`<h2>🌐 ${esc(t("idioma"))}${t2("idioma")}</h2>
    <div class="pk"><h3>${esc(t("aprendo"))}${t2("aprendo")}</h3><div class="chips" role="group">${langs.map(c => chip(c, c === S.learn, okLearn(c), "learn")).join("")}</div></div>
    <div class="pk"><h3>${esc(t("se"))}${t2("se")}</h3><div class="chips" role="group">${langs.map(c => chip(c, c === S.know, okKnow(c), "know")).join("")}</div></div>`, "nvidioma");
  o.querySelectorAll("[data-nvl]").forEach(b => b.onclick = () => { L().setLang?.(b.dataset.nvl, b.dataset.l); abrirIdioma(); });
  o.querySelector("[aria-pressed=true]")?.focus();
}

/* buscador: diccionario de la web (palabra del idioma que aprende o traducción) + las palabras guardadas */
const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
function buscar(q) {
  const {S, PK} = st(); if (!S || !PK) return [];
  const n = norm(q); if (!n) return [];
  const out = new Map(), add = (k, score) => { const o = out.get(k); if (!o || o > score) out.set(k, score); };
  for (const k of Object.keys(PK.tr)) {
    const nk = norm(k), tr = norm(PK.tr[k]);
    if (nk === n) add(k, 0);
    else if (nk.startsWith(n)) add(k, 2 + nk.length / 100);
    if (tr === n) add(k, 1);
    else if (n.length >= 2 && tr.split(/[\s,/;()]+/).some(w => w === n)) add(k, 1.5);
    else if (n.length >= 3 && tr.split(/[\s,/;()]+/).some(w => w.startsWith(n))) add(k, 3 + tr.length / 100);
  }
  const res = [...out.entries()].sort((a, b) => a[1] - b[1]).slice(0, 30).map(([k]) => ({k, w: PK.def[k]?.[0] || k, t: PK.tr[k] || "", d: PK.def[k] ? `${PK.def[k][0]}: ${PK.def[k][1]}` : ""}));
  for (const d of S.dict) if (d.l === S.learn && !res.some(r => r.k === d.k) && (norm(d.w).startsWith(n) || norm(d.t).split(/\s+/).includes(n))) res.push({k: d.k, w: d.w, t: d.t, d: d.d || "", mia: true});
  return res;
}
function abrirBuscar(q = "") {
  const {S, CAT} = st(); if (!S || !CAT) return;
  const nm = c => CAT.languages[c]?.name?.[lg()] || c;
  const o = capa(`<h2>🔍 ${esc(t("buscar"))}${t2("buscar")}</h2>
    <form class="nvsf" role="search"><input type="search" id="nvsq" placeholder="${esc(t("buscar_ph"))}" aria-label="${esc(t("buscar"))}" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(q)}"></form>
    <p class="nvsub" id="nvsh">${esc(t("buscar_help", {a: nm(S.learn), b: nm(S.know)}))}</p><ul class="nvres" id="nvres" aria-live="polite"></ul>`, "nvbuscar");
  const inp = o.querySelector("#nvsq"), ul = o.querySelector("#nvres");
  const pinta = () => {
    const v = inp.value, rs = buscar(v);
    o.querySelector("#nvsh").hidden = !!v.trim();
    ul.innerHTML = !v.trim() ? "" : rs.length ? rs.map((r, i) => {
      const ya = S.dict.some(d => d.k === r.k && d.l === S.learn);
      return `<li><div><b>${esc(r.w)}</b><span>${esc(r.t)}</span>${r.d ? `<small>${esc(r.d.replace(/^[^:]*: /, ""))}</small>` : ""}</div>
        <div class="nvra"><button type="button" class="btn" data-i="${i}" data-a="oir" aria-label="${esc(t("oir"))} ${esc(r.w)}">🔊</button><button type="button" class="btn${ya ? "" : " main"}" data-i="${i}" data-a="add" ${ya ? "disabled" : ""}>${esc(t(ya ? "anadida" : "anadir"))}</button></div></li>`;
    }).join("") : `<li class="nvnada">${esc(t("nada"))}</li>`;
    ul.onclick = e => {
      const b = e.target.closest("[data-a]"); if (!b) return; const r = rs[+b.dataset.i]; if (!r) return;
      if (b.dataset.a === "oir") L().speak?.(r.w, 1);
      else if (L().addWord?.({w: r.w, k: r.k, t: r.t, d: r.d})) { b.disabled = true; b.classList.remove("main"); b.textContent = t("anadida"); }
    };
  };
  let tm = null;
  inp.addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(pinta, 120); });
  o.querySelector("form").addEventListener("submit", e => { e.preventDefault(); pinta(); });
  pinta(); inp.focus();
}
/* atajo de teclado: «/» abre el buscador */
addEventListener("keydown", e => { if (e.key === "/" && !e.ctrlKey && !e.metaKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "") && !document.activeElement?.isContentEditable) { e.preventDefault(); abrirBuscar(); } });

window.LYANav = {mapa, bar, tools, isHub, secOf, render, aprenderTiles, practicarExtra, inicio, idiomaLinea, t, buscar, abrirBuscar, buscarSala};
})();
