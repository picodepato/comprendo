/* Panel del administrador (usuario admin) y de los profes (solo sus clases y alumnos). Lo carga cuentas.js al abrirlo.
   Pestañas: propuestas, usuarios (+ detalle y Excel), clases, deberes, fallos, mensajes y votos. Habla con /api/admin.
   Idioma: el del curso (S.learn: es, en o ca). Los textos se escriben en español y t() los traduce con TR. */
(() => {
const C = window.LYACuentas, {esc} = C.ui;
const api = (...a) => C.api(...a);

/* ---------- idioma ---------- */
const LG = () => { try { const l = window.LYA && window.LYA.S && window.LYA.S.learn; return l === "en" || l === "ca" ? l : "es"; } catch (e) { return "es"; } };
const LOC = () => ({es: "es-ES", en: "en-GB", ca: "ca-ES"})[LG()];
const LENGUA = {es: {es: "español", en: "inglés", ca: "catalán"}, en: {es: "Spanish", en: "English", ca: "Catalan"}, ca: {es: "espanyol", en: "anglès", ca: "català"}};
const nomLengua = l => (LENGUA[LG()] || LENGUA.es)[l] || l;
const TR = {
en: {
  "La contraseña debe tener al menos 6 caracteres.": "The password must be at least 6 characters long.", "Ese usuario ya no existe.": "That user no longer exists.", "Falta el nombre.": "The name is missing.", "Escribe el mensaje.": "Write the message.", "Elige una lectura y una fecha.": "Choose a reading and a date.",
  "Ese código ya lo usa otra clase. Elige otro.": "Another class already uses that code. Choose a different one.", "El código debe tener de 3 a 20 letras o números, sin espacios.": "The code must have 3 to 20 letters or numbers, with no spaces.", "Primero crea una clase.": "Create a class first.", "Ese alumno no está en tus clases.": "That student is not in your classes.", "Esa clase no es tuya.": "That class is not yours.",
  "No se ha podido hacer.": "That could not be done.", "Panel": "Panel", "Cargando…": "Loading…", "Tu sesión de administrador ha caducado. Sal y vuelve a entrar.": "Your admin session has expired. Sign out and sign in again.", "No se ha podido cargar.": "It could not be loaded.",
  "🛠 Administración": "🛠 Admin", "🧑‍🏫 Panel del profe": "🧑‍🏫 Teacher panel", "Sin clase": "No class", "📖 Lecturas": "📖 Readings", "✍️ Dictados (5 frases de la lectura)": "✍️ Dictations (5 sentences from the reading)", "✍️ Dictado: {0}": "✍️ Dictation: {0}",
  "{0} de 3 estrellas": "{0} of 3 stars",
  "💡 Propuestas ({0})": "💡 Suggestions ({0})", "👥 Usuarios ({0})": "👥 Users ({0})", "🎒 Mis alumnos ({0})": "🎒 My students ({0})", "🏫 Clases ({0})": "🏫 Classes ({0})", "🏫 Mis clases ({0})": "🏫 My classes ({0})", "🧩 Actividades creadas": "🧩 My activities", "📚 Deberes ({0})": "📚 Homework ({0})", "❌ Fallos": "❌ Mistakes", "✉️ Mensajes": "✉️ Messages", "🗳 Votos": "🗳 Votes",
  "👋 Empieza creando una clase en «Mis clases». Da su código a tus alumnos: lo ponen al crear su cuenta o en «Mi cuenta».": "👋 Start by creating a class in “My classes”. Give its code to your students: they enter it when they create their account or in “My account”.",
  "⚠ La contraseña de admin sigue siendo «admin». Cámbiala en Vercel → Settings → Environment Variables → ADMIN_CLAVE.": "⚠ The admin password is still “admin”. Change it in Vercel → Settings → Environment Variables → ADMIN_CLAVE.",
  "Invitado": "Guest", "✅ Aprobar y pasar a la votación": "✅ Approve and add to the vote", "Borrar": "Delete", "Emoji": "Emoji", "Nombre del tema": "Topic name", "En inglés": "In English", "Descripción corta": "Short description", "Pasar a la votación": "Add to the vote", "Todavía no hay propuestas.": "There are no suggestions yet.",
  "¿Seguro? Pulsa otra vez": "Are you sure? Tap again", "✓ Tema añadido a la votación de la portada.": "✓ Topic added to the vote on the home page.",
  "Clase": "Class", "Todas": "All", "⬇ Descargar Excel": "⬇ Download Excel", "Pulsa un usuario para ver lo que ha hecho en cada lectura, cambiarle la contraseña o mandarle un mensaje.": "Tap a user to see what they have done in each reading, change their password or send them a message.", "Pulsa un alumno para ver lo que ha hecho en cada lectura, cambiarle la contraseña o mandarle un mensaje.": "Tap a student to see what they have done in each reading, change their password or send them a message.",
  "Usuario": "User", "Tipo": "Type", "Aprende": "Learns", "Lecturas terminadas": "Readings finished", "Estrellas": "Stars", "Con ★★★": "With ★★★", "Veces leídas": "Times read", "Sin terminar": "Unfinished", "XP": "XP", "Racha": "Streak", "Cromos": "Cards", "Palabras": "Words", "Último guardado": "Last saved",
  "🧑‍🏫 Profe": "🧑‍🏫 Teacher", "🎒 Alumno": "🎒 Student", "{0} (mejor {1})": "{0} (best {1})", "No hay usuarios.": "There are no users.", "No hay usuarios en esta clase.": "There are no users in this class.", "Todavía no tienes alumnos. Dales el código de tu clase para que se unan.": "You have no students yet. Give them your class code so they can join.",
  "Con 3 estrellas": "With 3 stars", "Mejor racha": "Best streak", "Medallas": "Medals", "Alta": "Joined", "Profe": "Teacher", "Alumno": "Student", "progreso": "progress", "✓ Descargado. Se abre con Excel, Numbers o Google Sheets.": "✓ Downloaded. It opens with Excel, Numbers or Google Sheets.",
  "← Usuarios": "← Users", "lecturas terminadas": "readings finished", "estrellas (de {0})": "stars (out of {0})", "con 3 estrellas": "with 3 stars", "veces leídas": "times read", "sin terminar": "unfinished", "racha (mejor {0})": "streak (best {0})", "cromos": "cards", "medallas": "medals", "palabras guardadas": "saved words", " ({0} por repasar)": " ({0} to review)",
  "Alta: {0} · Último guardado: {1}": "Joined: {0} · Last saved: {1}", "🧑‍🏫 Es profe": "🧑‍🏫 Is a teacher", "Nueva contraseña": "New password", "Cambiar contraseña": "Change password", "Mensaje para {0}": "Message for {0}", "Por ejemplo: ¡Muy bien esta semana!": "For example: Great work this week!", "✉️ Enviar mensaje": "✉️ Send message",
  "Lectura": "Reading", "Tema": "Topic", "Nivel": "Level", "Mejor resultado": "Best result", "Última vez": "Last time", "Veces": "Times", "Mejor %": "Best %", "Empezada ({0} respuesta)": "Started ({0} answer)", "Empezada ({0} respuestas)": "Started ({0} answers)", "Todavía no ha hecho ninguna lectura.": "No readings done yet.",
  "Palabras guardadas ({0})": "Saved words ({0})", "Por repasar": "To review", "Mensajes recibidos ({0})": "Messages received ({0})", "🗑 Borrar usuario": "🗑 Delete user", "✓ Clase guardada.": "✓ Class saved.",
  "✓ Contraseña cambiada. Díselo a {0}: «{1}». Tendrá que volver a entrar.": "✓ Password changed. Tell {0}: “{1}”. They will have to sign in again.", "✓ Mensaje enviado. Lo verá al entrar.": "✓ Message sent. They will see it when they sign in.", "⚠ ¿Borrar a {0} y todo su progreso? Pulsa otra vez": "⚠ Delete {0} and all their progress? Tap again", "✓ {0} borrado.": "✓ {0} deleted.",
  "Nombre de la clase": "Class name", "Ej. 3ºA Inglés": "E.g. Year 9 Spanish", "Código para unirse": "Code to join", "Ej. 3a-ingles": "E.g. 9-spanish", "➕ Crear clase": "➕ Create class", "Tus alumnos ponen el código al crear su cuenta o después en «Mi cuenta».": "Your students enter the code when they create their account or later in “My account”.",
  "Código": "Code", "Alumnos": "Students", "Media por alumno": "Average per student", "Media de estrellas": "Average stars", "XP total": "Total XP", "Ver alumnos": "See students", "Todavía no hay clases. Crea una y luego elige la clase de cada alumno aquí abajo.": "There are no classes yet. Create one and then choose each student's class below.",
  "Alumnos y su clase": "Students and their class", "Clase de {0}": "Class of {0}", "Sacar de mis clases": "Remove from my classes", "✓ Clase creada. Código para tus alumnos: {0}": "✓ Class created. Code for your students: {0}", "¿Seguro? (los alumnos no se borran)": "Are you sure? (students are not deleted)", "✓ {0}: {1}": "✓ {0}: {1}", "sin clase": "no class",
  "Lectura, dictado o mates": "Reading, dictation or maths", "Dificultad": "Difficulty", "Fácil": "Easy", "Medio": "Medium", "Difícil": "Hard", "Mates": "Maths", "Tema {0}": "Unit {0}", "Repaso del tema": "Unit review", "📚 Asignar deber": "📚 Set homework", "{0} intentos": "{0} tries", "❌ Lo que fallaron en su último intento (ejercicio → solución buena):": "❌ What they got wrong on their last try (exercise → right answer):",
  "Lectura o dictado": "Reading or dictation", "Para": "For", "Todos los alumnos": "All students", "Todas mis clases": "All my classes", "Fecha límite": "Due date", "Nota (opcional)": "Note (optional)", "Por ejemplo: intenta sacar 3 estrellas": "For example: try to get 3 stars", "📚 Asignar lectura": "📚 Assign reading",
  "Actividad": "Activity", " · 🔴 en clase, en directo": " · 🔴 in class, live", "Doblaje": "Dubbing", "Canción": "Song", "📺 Abrir la sala ahora": "📺 Open the room now", "Para: {0} · Hasta: {1}": "For: {0} · Due: {1}", "todos": "everyone", "todas mis clases": "all my classes", " (terminado el plazo)": " (past due)",
  "✅ <b>{0}</b> de {1} la han hecho": "✅ <b>{0}</b> of {1} have done it", "Ver quién": "See who", "Nadie en esta clase.": "Nobody in this class.", "Quitar": "Remove", "No hay deberes. Puedes mandar una lectura o un dictado; los alumnos los verán en la portada con la fecha límite.": "There is no homework. You can set a reading or a dictation; students will see it on the home page with the due date.",
  "🎵 Para mandar una canción de YouTube, ábrela en la pestaña «Canciones» y pulsa «Mandar como deberes».": "🎵 To set a YouTube song, open it in the “Songs” tab and tap “Set as homework”.", "🧩 Los concursos y los vídeos con preguntas se mandan desde «Actividades creadas».": "🧩 Quizzes and videos with questions are set from “My activities”.", "🎬 Para mandar una escena para doblar, prepárala en la pestaña «Doblaje» y pulsa «Mandar a la clase».": "🎬 To set a scene to dub, prepare it in the “Dubbing” tab and tap “Send to the class”.", "✓ Deber asignado.": "✓ Homework assigned.",
  "Todo lo que has creado. Ábrelo, juégalo en directo con tu clase o mándalo como deberes (en casa, o en clase en directo: tus alumnos entran solos desde «Deberes»).": "Everything you have created. Open it, play it live with your class or set it as homework (at home, or live in class: your students join on their own from “Homework”).",
  "✨ Crear un concurso": "✨ Create a quiz", "📺 Crear un vídeo con preguntas": "📺 Create a video with questions", "Para: {0} · Hasta: {1} · ✅ {2} de {3}": "For: {0} · Due: {1} · ✅ {2} of {3}", "▶ Abrir": "▶ Open", "Vídeo con preguntas": "Video with questions", "Concurso": "Quiz", "{0} preguntas": "{0} questions", "▶ Probar": "▶ Try it", "📺 En directo": "📺 Live", "✏️ Editar": "✏️ Edit",
  "No se han podido cargar tus actividades.": "Your activities could not be loaded.", "🏆 Mis concursos ({0})": "🏆 My quizzes ({0})", "Aún no has creado ninguno. Se crean con IA en un minuto en «Concursos».": "You have not created any yet. They are made with AI in a minute in “Quizzes”.", "📺 Mis vídeos con preguntas ({0})": "📺 My videos with questions ({0})", "Aún no has creado ninguno: pega un enlace de YouTube y añade preguntas en los momentos que quieras.": "You have not created any yet: paste a YouTube link and add questions wherever you like.",
  "🎬 Doblajes mandados ({0})": "🎬 Dubbing sent ({0})", "Se preparan en la pestaña «Doblaje» y se mandan con «Mandar a la clase».": "They are prepared in the “Dubbing” tab and sent with “Send to the class”.", "🎵 Canciones mandadas ({0})": "🎵 Songs sent ({0})", "Se mandan desde la pestaña «Canciones».": "They are sent from the “Songs” tab.", "⭐ Vídeos preparados por COMPRENDO ({0})": "⭐ Videos prepared by COMPRENDO ({0})",
  "Palabras que más cuestan": "Hardest words", "Palabras que los alumnos tienen marcadas «por repasar» en su diccionario (fallaron al repasarlas).": "Words students have marked “to review” in their dictionary (they got them wrong when reviewing).", "Palabra": "Word", "Aún no hay palabras falladas.": "No missed words yet.", "Preguntas más falladas": "Most missed questions", "Calculando…": "Calculating…",
  "Comprensión": "Comprehension", "Gramática": "Grammar", "Pregunta": "Question", "Respuesta buena": "Right answer", "Fallan": "Missed", "<b>{0}</b> de {1} ({2} %)": "<b>{0}</b> of {1} ({2} %)", "Aún no hay preguntas falladas.": "No missed questions yet.",
  "Todos los usuarios": "All users", "Todos mis alumnos": "All my students", "Clase {0}": "Class {0}", "Mensaje": "Message", "Un aviso o una felicitación. Lo verán al entrar en la web.": "A notice or a well done. They will see it when they open the site.", "✉️ Enviar": "✉️ Send", "Enviados": "Sent", "clase {0}": "class {0}", "Todavía no has enviado mensajes.": "You have not sent any messages yet.",
  "✓ Enviado a {0} alumno.": "✓ Sent to {0} student.", "✓ Enviado a {0} alumnos.": "✓ Sent to {0} students.", "{0} voto": "{0} vote", "{0} votos": "{0} votes", "Todavía no hay votos.": "There are no votes yet.", "Temas añadidos desde propuestas": "Topics added from suggestions", "Quitar de la votación": "Remove from the vote"
},
ca: {
  "La contraseña debe tener al menos 6 caracteres.": "La contrasenya ha de tenir almenys 6 caràcters.", "Ese usuario ya no existe.": "Aquest usuari ja no existeix.", "Falta el nombre.": "Falta el nom.", "Escribe el mensaje.": "Escriu el missatge.", "Elige una lectura y una fecha.": "Tria una lectura i una data.",
  "Ese código ya lo usa otra clase. Elige otro.": "Aquest codi ja el fa servir una altra classe. Tria'n un altre.", "El código debe tener de 3 a 20 letras o números, sin espacios.": "El codi ha de tenir de 3 a 20 lletres o números, sense espais.", "Primero crea una clase.": "Primer crea una classe.", "Ese alumno no está en tus clases.": "Aquest alumne no és a les teves classes.", "Esa clase no es tuya.": "Aquesta classe no és teva.",
  "No se ha podido hacer.": "No s'ha pogut fer.", "Panel": "Tauler", "Cargando…": "Carregant…", "Tu sesión de administrador ha caducado. Sal y vuelve a entrar.": "La teva sessió d'administrador ha caducat. Surt i torna a entrar.", "No se ha podido cargar.": "No s'ha pogut carregar.",
  "🛠 Administración": "🛠 Administració", "🧑‍🏫 Panel del profe": "🧑‍🏫 Tauler del profe", "Sin clase": "Sense classe", "📖 Lecturas": "📖 Lectures", "✍️ Dictados (5 frases de la lectura)": "✍️ Dictats (5 frases de la lectura)", "✍️ Dictado: {0}": "✍️ Dictat: {0}",
  "{0} de 3 estrellas": "{0} de 3 estrelles",
  "💡 Propuestas ({0})": "💡 Propostes ({0})", "👥 Usuarios ({0})": "👥 Usuaris ({0})", "🎒 Mis alumnos ({0})": "🎒 Els meus alumnes ({0})", "🏫 Clases ({0})": "🏫 Classes ({0})", "🏫 Mis clases ({0})": "🏫 Les meves classes ({0})", "🧩 Actividades creadas": "🧩 Activitats creades", "📚 Deberes ({0})": "📚 Deures ({0})", "❌ Fallos": "❌ Errors", "✉️ Mensajes": "✉️ Missatges", "🗳 Votos": "🗳 Vots",
  "👋 Empieza creando una clase en «Mis clases». Da su código a tus alumnos: lo ponen al crear su cuenta o en «Mi cuenta».": "👋 Comença creant una classe a «Les meves classes». Dona'n el codi als teus alumnes: el posen en crear el compte o a «El meu compte».",
  "⚠ La contraseña de admin sigue siendo «admin». Cámbiala en Vercel → Settings → Environment Variables → ADMIN_CLAVE.": "⚠ La contrasenya d'admin continua sent «admin». Canvia-la a Vercel → Settings → Environment Variables → ADMIN_CLAVE.",
  "Invitado": "Convidat", "✅ Aprobar y pasar a la votación": "✅ Aprovar i passar a la votació", "Borrar": "Esborrar", "Emoji": "Emoji", "Nombre del tema": "Nom del tema", "En inglés": "En anglès", "Descripción corta": "Descripció curta", "Pasar a la votación": "Passar a la votació", "Todavía no hay propuestas.": "Encara no hi ha propostes.",
  "¿Seguro? Pulsa otra vez": "Segur? Torna a prémer", "✓ Tema añadido a la votación de la portada.": "✓ Tema afegit a la votació de la portada.",
  "Clase": "Classe", "Todas": "Totes", "⬇ Descargar Excel": "⬇ Descarregar Excel", "Pulsa un usuario para ver lo que ha hecho en cada lectura, cambiarle la contraseña o mandarle un mensaje.": "Prem un usuari per veure què ha fet a cada lectura, canviar-li la contrasenya o enviar-li un missatge.", "Pulsa un alumno para ver lo que ha hecho en cada lectura, cambiarle la contraseña o mandarle un mensaje.": "Prem un alumne per veure què ha fet a cada lectura, canviar-li la contrasenya o enviar-li un missatge.",
  "Usuario": "Usuari", "Tipo": "Tipus", "Aprende": "Aprèn", "Lecturas terminadas": "Lectures acabades", "Estrellas": "Estrelles", "Con ★★★": "Amb ★★★", "Veces leídas": "Vegades llegides", "Sin terminar": "Sense acabar", "XP": "XP", "Racha": "Ratxa", "Cromos": "Cromos", "Palabras": "Paraules", "Último guardado": "Últim desament",
  "🧑‍🏫 Profe": "🧑‍🏫 Profe", "🎒 Alumno": "🎒 Alumne", "{0} (mejor {1})": "{0} (millor {1})", "No hay usuarios.": "No hi ha usuaris.", "No hay usuarios en esta clase.": "No hi ha usuaris en aquesta classe.", "Todavía no tienes alumnos. Dales el código de tu clase para que se unan.": "Encara no tens alumnes. Dona'ls el codi de la teva classe perquè s'hi uneixin.",
  "Con 3 estrellas": "Amb 3 estrelles", "Mejor racha": "Millor ratxa", "Medallas": "Medalles", "Alta": "Alta", "Profe": "Profe", "Alumno": "Alumne", "progreso": "progres", "✓ Descargado. Se abre con Excel, Numbers o Google Sheets.": "✓ Descarregat. S'obre amb Excel, Numbers o Google Sheets.",
  "← Usuarios": "← Usuaris", "lecturas terminadas": "lectures acabades", "estrellas (de {0})": "estrelles (de {0})", "con 3 estrellas": "amb 3 estrelles", "veces leídas": "vegades llegides", "sin terminar": "sense acabar", "racha (mejor {0})": "ratxa (millor {0})", "cromos": "cromos", "medallas": "medalles", "palabras guardadas": "paraules desades", " ({0} por repasar)": " ({0} per repassar)",
  "Alta: {0} · Último guardado: {1}": "Alta: {0} · Últim desament: {1}", "🧑‍🏫 Es profe": "🧑‍🏫 És profe", "Nueva contraseña": "Contrasenya nova", "Cambiar contraseña": "Canviar la contrasenya", "Mensaje para {0}": "Missatge per a {0}", "Por ejemplo: ¡Muy bien esta semana!": "Per exemple: Molt bé aquesta setmana!", "✉️ Enviar mensaje": "✉️ Enviar missatge",
  "Lectura": "Lectura", "Tema": "Tema", "Nivel": "Nivell", "Mejor resultado": "Millor resultat", "Última vez": "Última vegada", "Veces": "Vegades", "Mejor %": "Millor %", "Empezada ({0} respuesta)": "Començada ({0} resposta)", "Empezada ({0} respuestas)": "Començada ({0} respostes)", "Todavía no ha hecho ninguna lectura.": "Encara no ha fet cap lectura.",
  "Palabras guardadas ({0})": "Paraules desades ({0})", "Por repasar": "Per repassar", "Mensajes recibidos ({0})": "Missatges rebuts ({0})", "🗑 Borrar usuario": "🗑 Esborrar l'usuari", "✓ Clase guardada.": "✓ Classe desada.",
  "✓ Contraseña cambiada. Díselo a {0}: «{1}». Tendrá que volver a entrar.": "✓ Contrasenya canviada. Digues-ho a {0}: «{1}». Haurà de tornar a entrar.", "✓ Mensaje enviado. Lo verá al entrar.": "✓ Missatge enviat. El veurà en entrar.", "⚠ ¿Borrar a {0} y todo su progreso? Pulsa otra vez": "⚠ Vols esborrar {0} i tot el seu progrés? Torna a prémer", "✓ {0} borrado.": "✓ {0} esborrat.",
  "Nombre de la clase": "Nom de la classe", "Ej. 3ºA Inglés": "Ex. 3rA Anglès", "Código para unirse": "Codi per unir-s'hi", "Ej. 3a-ingles": "Ex. 3a-angles", "➕ Crear clase": "➕ Crear classe", "Tus alumnos ponen el código al crear su cuenta o después en «Mi cuenta».": "Els teus alumnes posen el codi en crear el compte o després a «El meu compte».",
  "Código": "Codi", "Alumnos": "Alumnes", "Media por alumno": "Mitjana per alumne", "Media de estrellas": "Mitjana d'estrelles", "XP total": "XP total", "Ver alumnos": "Veure alumnes", "Todavía no hay clases. Crea una y luego elige la clase de cada alumno aquí abajo.": "Encara no hi ha classes. Crea'n una i després tria la classe de cada alumne aquí sota.",
  "Alumnos y su clase": "Alumnes i la seva classe", "Clase de {0}": "Classe de {0}", "Sacar de mis clases": "Treure de les meves classes", "✓ Clase creada. Código para tus alumnos: {0}": "✓ Classe creada. Codi per als teus alumnes: {0}", "¿Seguro? (los alumnos no se borran)": "Segur? (els alumnes no s'esborren)", "✓ {0}: {1}": "✓ {0}: {1}", "sin clase": "sense classe",
  "Lectura, dictado o mates": "Lectura, dictat o mates", "Dificultad": "Dificultat", "Fácil": "Fàcil", "Medio": "Mitjà", "Difícil": "Difícil", "Mates": "Mates", "Tema {0}": "Tema {0}", "Repaso del tema": "Repàs del tema", "📚 Asignar deber": "📚 Assignar deure", "{0} intentos": "{0} intents", "❌ Lo que fallaron en su último intento (ejercicio → solución buena):": "❌ El que van fallar en l’últim intent (exercici → solució bona):",
  "Lectura o dictado": "Lectura o dictat", "Para": "Per a", "Todos los alumnos": "Tots els alumnes", "Todas mis clases": "Totes les meves classes", "Fecha límite": "Data límit", "Nota (opcional)": "Nota (opcional)", "Por ejemplo: intenta sacar 3 estrellas": "Per exemple: intenta treure 3 estrelles", "📚 Asignar lectura": "📚 Assignar lectura",
  "Actividad": "Activitat", " · 🔴 en clase, en directo": " · 🔴 a classe, en directe", "Doblaje": "Doblatge", "Canción": "Cançó", "📺 Abrir la sala ahora": "📺 Obrir la sala ara", "Para: {0} · Hasta: {1}": "Per a: {0} · Fins al: {1}", "todos": "tothom", "todas mis clases": "totes les meves classes", " (terminado el plazo)": " (termini acabat)",
  "✅ <b>{0}</b> de {1} la han hecho": "✅ <b>{0}</b> de {1} l'han fet", "Ver quién": "Veure qui", "Nadie en esta clase.": "Ningú en aquesta classe.", "Quitar": "Treure", "No hay deberes. Puedes mandar una lectura o un dictado; los alumnos los verán en la portada con la fecha límite.": "No hi ha deures. Pots enviar una lectura o un dictat; els alumnes els veuran a la portada amb la data límit.",
  "🎵 Para mandar una canción de YouTube, ábrela en la pestaña «Canciones» y pulsa «Mandar como deberes».": "🎵 Per enviar una cançó de YouTube, obre-la a la pestanya «Cançons» i prem «Enviar com a deures».", "🧩 Los concursos y los vídeos con preguntas se mandan desde «Actividades creadas».": "🧩 Els concursos i els vídeos amb preguntes s'envien des d'«Activitats creades».", "🎬 Para mandar una escena para doblar, prepárala en la pestaña «Doblaje» y pulsa «Mandar a la clase».": "🎬 Per enviar una escena per doblar, prepara-la a la pestanya «Doblatge» i prem «Enviar a la classe».", "✓ Deber asignado.": "✓ Deure assignat.",
  "Todo lo que has creado. Ábrelo, juégalo en directo con tu clase o mándalo como deberes (en casa, o en clase en directo: tus alumnos entran solos desde «Deberes»).": "Tot el que has creat. Obre-ho, juga-ho en directe amb la teva classe o envia-ho com a deures (a casa, o a classe en directe: els teus alumnes entren sols des de «Deures»).",
  "✨ Crear un concurso": "✨ Crear un concurs", "📺 Crear un vídeo con preguntas": "📺 Crear un vídeo amb preguntes", "Para: {0} · Hasta: {1} · ✅ {2} de {3}": "Per a: {0} · Fins al: {1} · ✅ {2} de {3}", "▶ Abrir": "▶ Obrir", "Vídeo con preguntas": "Vídeo amb preguntes", "Concurso": "Concurs", "{0} preguntas": "{0} preguntes", "▶ Probar": "▶ Provar", "📺 En directo": "📺 En directe", "✏️ Editar": "✏️ Editar",
  "No se han podido cargar tus actividades.": "No s'han pogut carregar les teves activitats.", "🏆 Mis concursos ({0})": "🏆 Els meus concursos ({0})", "Aún no has creado ninguno. Se crean con IA en un minuto en «Concursos».": "Encara no n'has creat cap. Es creen amb IA en un minut a «Concursos».", "📺 Mis vídeos con preguntas ({0})": "📺 Els meus vídeos amb preguntes ({0})", "Aún no has creado ninguno: pega un enlace de YouTube y añade preguntas en los momentos que quieras.": "Encara no n'has creat cap: enganxa un enllaç de YouTube i afegeix preguntes als moments que vulguis.",
  "🎬 Doblajes mandados ({0})": "🎬 Doblatges enviats ({0})", "Se preparan en la pestaña «Doblaje» y se mandan con «Mandar a la clase».": "Es preparen a la pestanya «Doblatge» i s'envien amb «Enviar a la classe».", "🎵 Canciones mandadas ({0})": "🎵 Cançons enviades ({0})", "Se mandan desde la pestaña «Canciones».": "S'envien des de la pestanya «Cançons».", "⭐ Vídeos preparados por COMPRENDO ({0})": "⭐ Vídeos preparats per COMPRENDO ({0})",
  "Palabras que más cuestan": "Paraules que costen més", "Palabras que los alumnos tienen marcadas «por repasar» en su diccionario (fallaron al repasarlas).": "Paraules que els alumnes tenen marcades «per repassar» al seu diccionari (les van fallar en repassar-les).", "Palabra": "Paraula", "Aún no hay palabras falladas.": "Encara no hi ha paraules fallades.", "Preguntas más falladas": "Preguntes més fallades", "Calculando…": "Calculant…",
  "Comprensión": "Comprensió", "Gramática": "Gramàtica", "Pregunta": "Pregunta", "Respuesta buena": "Resposta bona", "Fallan": "Fallen", "<b>{0}</b> de {1} ({2} %)": "<b>{0}</b> de {1} ({2} %)", "Aún no hay preguntas falladas.": "Encara no hi ha preguntes fallades.",
  "Todos los usuarios": "Tots els usuaris", "Todos mis alumnos": "Tots els meus alumnes", "Clase {0}": "Classe {0}", "Mensaje": "Missatge", "Un aviso o una felicitación. Lo verán al entrar en la web.": "Un avís o una felicitació. El veuran en entrar al web.", "✉️ Enviar": "✉️ Enviar", "Enviados": "Enviats", "clase {0}": "classe {0}", "Todavía no has enviado mensajes.": "Encara no has enviat missatges.",
  "✓ Enviado a {0} alumno.": "✓ Enviat a {0} alumne.", "✓ Enviado a {0} alumnos.": "✓ Enviat a {0} alumnes.", "{0} voto": "{0} vot", "{0} votos": "{0} vots", "Todavía no hay votos.": "Encara no hi ha vots.", "Temas añadidos desde propuestas": "Temes afegits des de propostes", "Quitar de la votación": "Treure de la votació"
}};
/* t("texto en español con {0}", valor): el texto en el idioma del curso */
const t = (s, ...v) => String((TR[LG()] || {})[s] ?? s).replace(/\{(\d)\}/g, (_, i) => v[+i] ?? "");

const ventana = h => { C.ui.ventana(h); C.ui.dlg.classList.add("ancha"); };
const $d = s => C.ui.dlg.querySelector(s), $$ = s => [...C.ui.dlg.querySelectorAll(s)];
const fecha = x => x ? new Date(x).toLocaleString(LOC(), {day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"}) : "—";
const dia = d => d ? new Date(d + "T12:00:00").toLocaleDateString(LOC(), {weekday: "short", day: "numeric", month: "short"}) : "—";
const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const est = n => `<span class="stars" aria-label="${t("{0} de 3 estrellas", n)}">${'<i class="on">★</i>'.repeat(n)}${"<i>★</i>".repeat(3 - n)}</span>`;
const MSG = {clave_corta: "La contraseña debe tener al menos 6 caracteres.", no_existe: "Ese usuario ya no existe.", falta_nombre: "Falta el nombre.", falta_texto: "Escribe el mensaje.", datos_no_validos: "Elige una lectura y una fecha.",
  codigo_ocupado: "Ese código ya lo usa otra clase. Elige otro.", codigo_no_valido: "El código debe tener de 3 a 20 letras o números, sin espacios.", sin_clases: "Primero crea una clase.", no_es_tu_alumno: "Ese alumno no está en tus clases.", no_es_tu_clase: "Esa clase no es tuya."};

/* ---------- catálogo: id de lectura → título, tema, nivel (en el idioma del panel) ---------- */
let CAT = null, CATL = null;
const catalogo = () => { if (CATL !== LG()) { CAT = null; CATL = LG(); } return CAT ||= fetch("content/catalogo.json").then(r => r.json()).then(c => {
  const m = {}, g = CATL; let i = 0;
  for (const tm of c.topics) for (const [lang, rs] of Object.entries(tm.readings || {})) for (const r of rs) {
    const id = r.id || `${tm.id}-${r.level.toLowerCase()}`, nm = tm.name || {}, ti = r.title || {};
    m[id] = {id, tema: nm[g] || nm.es || tm.id, titulo: ti[lang] || ti[g] || ti.es || id, nivel: r.level, lengua: lang, file: r.file, orden: i++};
  }
  return m;
}).catch(() => ({})); };
const otraL = l => l && l !== LG() ? nomLengua(l) : "";
/* mates: «mates-t2-3-2» = tema 2, apartado 3 (o «repaso»), dificultad 2 (p2: 4.º ESO PDC) */
const MDIF = ["", "Fácil", "Medio", "Difícil"], mTemas = () => ((window.LYAMatesTemas || {}).cursos || []).flatMap(c => c.temas.map(x => ({...x, curso: c.n})));
const nombreM = id => { const m = /^mates-([tp]\d+)-([1-8]|repaso)(?:-([123]))?$/.exec(id); if (!m) return id; const T = mTemas().find(x => x.id === m[1]), a = T && T.aps.find(x => String(x.n) === m[2]);
  return `➗ ${t("Mates")} · ${T ? (T.id !== "t2" ? T.curso + " · " : "") + t("Tema {0}", T.n) + " · " : ""}${a ? a.n + ". " + a.titulo : t("Repaso del tema")}${m[3] ? " · " + t(MDIF[m[3]]) : ""}`; };
const nombreL = (T, id) => /^mates-/.test(id) ? nombreM(id) : /^dictado-/.test(id) && T[id.slice(8)] ? t("✍️ Dictado: {0}", nombreL(T, id.slice(8))) : T[id] ? `${T[id].titulo} (${T[id].tema} · ${T[id].nivel}${otraL(T[id].lengua) ? " · " + otraL(T[id].lengua) : ""})` : id;
const marcaL = l => otraL(l) ? ` <small class="ctae">(${esc(otraL(l))})</small>` : "";

let D = null, T = {}, tabActual = "propuestas", filtroGrupo = "";
async function cargar() {
  const [r, cat] = await Promise.all([api("admin").catch(() => ({ok: false})), catalogo()]);
  T = cat; D = r.ok ? r.j : null; return r;
}
async function hacer(datos, btn) {
  if (btn) btn.disabled = true;
  let r; try { r = await api("admin", "POST", datos); } catch (e) { r = {ok: false, j: {}}; }
  if (!r.ok) { alerta(t(MSG[r.j.error] || "No se ha podido hacer.")); if (btn) btn.disabled = false; return null; }
  return r.j;
}
const alerta = x => { const m = $d("#admm"); if (m) m.textContent = x; };

async function abrir(tab = tabActual) {
  tabActual = tab;
  ventana(`<h2>${t("Panel")}</h2><p class="ctas">${t("Cargando…")}</p>`);
  const r = await cargar();
  if (!r.ok) { ventana(`<h2>${t("Panel")}</h2><p class="ctam">${r.code === 403 ? t("Tu sesión de administrador ha caducado. Sal y vuelve a entrar.") : t("No se ha podido cargar.")}</p>`); return; }
  pintar();
}
const nGrupo = id => (D.grupos[id] || {}).nombre || "—";
const esAdmin = () => D && D.soy && D.soy.admin, titulo = () => esAdmin() ? t("🛠 Administración") : t("🧑‍🏫 Panel del profe");
const alumnos = () => D.usuarios.filter(u => u.rol !== "profe");
const optsGrupo = (sel, vacio = t("Sin clase")) => `<option value="">${vacio}</option>${Object.entries(D.grupos).map(([id, g]) => `<option value="${esc(id)}"${id === sel ? " selected" : ""}>${esc(g.nombre)}</option>`).join("")}`;
const optsLectura = () => { const ls = Object.values(T).sort((a, b) => (a.lengua !== LG()) - (b.lengua !== LG()) || (a.lengua > b.lengua) - (a.lengua < b.lengua) || a.orden - b.orden).filter(l => l.file);
  return `<optgroup label="${t("📖 Lecturas")}">${ls.map(l => `<option value="${esc(l.id)}">${esc(nombreL(T, l.id))}</option>`).join("")}</optgroup><optgroup label="${t("✍️ Dictados (5 frases de la lectura)")}">${ls.map(l => `<option value="dictado-${esc(l.id)}">${esc(nombreL(T, "dictado-" + l.id))}</option>`).join("")}</optgroup>${mTemas().map(x => `<optgroup label="➗ ${t("Mates")} ${esc(x.curso)} · ${t("Tema {0}", x.n)}: ${esc(x.titulo)}">${[...x.aps.map(a => a.n), "repaso"].map(n => `<option value="mates-${x.id}-${n}">${esc(nombreM(`mates-${x.id}-${n}`))}</option>`).join("")}</optgroup>`).join("")}`; };

function pintar() {
  const nG = Object.keys(D.grupos).length;
  const tabs = [["propuestas", t("💡 Propuestas ({0})", D.propuestas.length)], ["usuarios", esAdmin() ? t("👥 Usuarios ({0})", D.usuarios.length) : t("🎒 Mis alumnos ({0})", D.usuarios.length)], ["clases", esAdmin() ? t("🏫 Clases ({0})", nG) : t("🏫 Mis clases ({0})", nG)],
    ["actividades", t("🧩 Actividades creadas")], ["deberes", t("📚 Deberes ({0})", D.deberes.length)], ["fallos", t("❌ Fallos")], ["mensajes", t("✉️ Mensajes")], ["votos", t("🗳 Votos")]].filter(([k]) => esAdmin() || !["propuestas", "votos"].includes(k));
  if (esAdmin()) tabs.splice(1, 0, ["temas", t("📥 Temas pedidos ({0})", (D.temasPedidos || []).filter(p => p.estado === "pendiente").length)]);
  if (!tabs.some(([k]) => k === tabActual)) tabActual = tabs[0][0];
  ventana(`<h2>${titulo()}</h2>
    ${!esAdmin() && !nG ? `<p class="ctas">${t("👋 Empieza creando una clase en «Mis clases». Da su código a tus alumnos: lo ponen al crear su cuenta o en «Mi cuenta».")}</p>` : ""}
    ${D.claveAdminPorDefecto ? `<p class="ctam">${t("⚠ La contraseña de admin sigue siendo «admin». Cámbiala en Vercel → Settings → Environment Variables → ADMIN_CLAVE.")}</p>` : ""}
    <div class="ctatabs" role="tablist">${tabs.map(([k, n]) => `<button type="button" class="btn${k === tabActual ? " main" : ""}" data-tab="${k}" role="tab" aria-selected="${k === tabActual}">${n}</button>`).join("")}</div>
    <p class="ctam" id="admm" role="status"></p>
    <div id="admc">${VISTAS[tabActual]()}</div>`);
  $$("[data-tab]").forEach(b => b.onclick = () => abrir(b.dataset.tab)); /* siempre datos al día */
  (ACCIONES[tabActual] || (() => {}))();
}

/* ---------- propuestas ---------- */
const VISTAS = {}, ACCIONES = {};
VISTAS.propuestas = () => D.propuestas.length ? `<ul class="ctali">${D.propuestas.map(p => `<li><p>${esc(p.texto)}</p><small>${p.usuario ? "👤 " + esc(p.usuario) : t("Invitado")} · ${fecha(p.t)}</small>
  <p class="admbt"><button type="button" class="btn" data-aprobar="${esc(p.id)}">${t("✅ Aprobar y pasar a la votación")}</button> <button type="button" class="ctal" data-borrar="${esc(p.id)}">${t("Borrar")}</button></p>
  <form class="admform" data-form="${esc(p.id)}" hidden><label>${t("Emoji")}<input name="emoji" value="💡" maxlength="8" style="width:70px"></label><label>${t("Nombre del tema")}<input name="nombre_es" required maxlength="40" value="${esc(p.texto.slice(0, 40))}"></label><label>${t("En inglés")}<input name="nombre_en" maxlength="40"></label><label class="admw">${t("Descripción corta")}<input name="desc_es" maxlength="120"></label><button class="btn main" type="submit">${t("Pasar a la votación")}</button></form></li>`).join("")}</ul>` : `<p class="ctas">${t("Todavía no hay propuestas.")}</p>`;
ACCIONES.propuestas = () => {
  $$("[data-borrar]").forEach(b => b.onclick = async () => {
    if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = t("¿Seguro? Pulsa otra vez"); return; }
    b.disabled = true; await api("propuestas", "DELETE", {id: b.dataset.borrar}); abrir();
  });
  $$("[data-aprobar]").forEach(b => b.onclick = () => { const f = $d(`[data-form="${b.dataset.aprobar}"]`); f.hidden = !f.hidden; if (!f.hidden) f.nombre_es.focus(); });
  $$("[data-form]").forEach(f => f.onsubmit = async e => {
    e.preventDefault();
    const ok = await hacer({accion: "propuesta_aprobar", id: f.dataset.form, emoji: f.emoji.value, nombre_es: f.nombre_es.value, nombre_en: f.nombre_en.value, desc_es: f.desc_es.value}, f.querySelector("[type=submit]"));
    if (ok) { await abrir("propuestas"); alerta(t("✓ Tema añadido a la votación de la portada.")); }
  });
};

/* ---------- temas pedidos por los profes (temas-profe/temas-profe.js, api/_temas.js) ---------- */
const TPE = () => (window.LYATemasProfe || {}).ESTADO || {};
const TPD = k => (((window.LYATemasProfe || {}).DIFICULTADES || []).find(x => x[0] === k) || [k, k])[1];
const ORDEN_TP = {pendiente: 0, error: 1, aprobada: 2, preparada: 3, rechazada: 4, publicada: 5};
VISTAS.temas = () => {
  const P = [...(D.temasPedidos || [])].sort((a, b) => (ORDEN_TP[a.estado] ?? 9) - (ORDEN_TP[b.estado] ?? 9) || b.creado - a.creado);
  if (!P.length) return `<p class="ctas">${t("Todavía no hay peticiones de temas. Los profes las hacen en Profe → «➕ Añadir un tema».")}</p>`;
  return `<p class="ctas">${t("Revisa cada petición. Las aprobadas se preparan solas la mañana siguiente (con el motor de FP Básica) y se abre un PR. Al rechazar, las fotos se borran.")}</p><ul class="ctali">${P.map(p => { const [ic, n] = TPE()[p.estado] || ["•", p.estado];
    return `<li><p><b>${ic} ${esc(p.asignatura)} · ${esc(p.curso)} · ${t("Tema")} ${esc(p.tema)}: ${esc(p.titulo)}</b></p>
    <small>🧑‍🏫 ${esc(p.profe)} · ${fecha(p.enviado || p.creado)} · ${esc(n)}${p.pr ? ` · <a href="${esc(p.pr)}" target="_blank" rel="noopener">PR</a>` : ""}${p.temaId ? ` · <a href="#fpb-${esc(p.temaId)}">#fpb-${esc(p.temaId)}</a>` : ""}</small>
    ${p.apartados ? `<p><b>${t("Apartados")}:</b><br>${esc(p.apartados).replace(/\n/g, "<br>")}</p>` : ""}
    <p><b>${t("Alumnado")}:</b> ${p.alumnado && p.alumnado.length ? p.alumnado.map(k => esc(TPD(k))).join(", ") : "—"}${p.notas ? `<br>${esc(p.notas)}` : ""}</p>
    ${p.texto ? `<details><summary>${t("Texto ({0} letras)", p.texto.length)}</summary><div class="tpa-txt">${esc(p.texto)}</div></details>` : ""}
    ${p.fotos && p.fotosSubidas ? `<p><button type="button" class="btn" data-tpfotos="${esc(p.id)}" data-n="${p.fotos}">${t("🖼️ Ver las fotos ({0})", p.fotos)}</button></p><div class="tpa-fotos" id="tpaf-${esc(p.id)}"></div>` : p.fotos ? `<p class="ctas">${t("Las fotos ya se han borrado.")}</p>` : ""}
    ${p.motivo ? `<p class="ctam">${esc(p.motivo)}</p>` : ""}
    ${["pendiente", "error", "aprobada"].includes(p.estado) ? `<form class="admform" data-tpform="${esc(p.id)}"><label class="admw">${t("Indicaciones para prepararlo (opcional) o motivo si lo rechazas")}<textarea name="nota" rows="2" maxlength="1500">${esc(p.nota || "")}</textarea></label>
      <button class="btn main" type="submit" data-dec="aprobar">${p.estado === "aprobada" ? t("💾 Guardar indicaciones") : t("✅ Aprobar y mandar a crear")}</button> <button class="btn" type="submit" data-dec="rechazar">${t("❌ Rechazar")}</button></form>` : ""}
    <p class="admbt"><button type="button" class="ctal" data-tpborrar="${esc(p.id)}">${t("Borrar")}</button></p></li>`; }).join("")}</ul>`;
};
ACCIONES.temas = () => {
  $$("[data-tpfotos]").forEach(b => b.onclick = async () => {
    b.disabled = true; const caja = $d("#tpaf-" + b.dataset.tpfotos);
    for (let i = 0; i < +b.dataset.n; i++) {
      const r = await api(`temas?foto=${encodeURIComponent(b.dataset.tpfotos)}&i=${i}`).catch(() => ({ok: false}));
      caja.insertAdjacentHTML("beforeend", r.ok ? `<a href="#" data-tpgrande title="${t("Ver en grande")}"><img src="${esc(r.j.data)}" alt="${t("Foto {0}", i + 1)}"></a>` : `<span class="ctas">${t("Foto {0}: ya no está", i + 1)}</span>`);
    }
    b.hidden = true;
    caja.querySelectorAll("[data-tpgrande]").forEach(a => a.onclick = e => { e.preventDefault(); a.classList.toggle("tpa-grande"); });
  });
  $$("[data-tpform]").forEach(f => { let dec = "aprobar"; f.querySelectorAll("[data-dec]").forEach(b => b.onclick = () => { dec = b.dataset.dec; });
    f.onsubmit = async e => {
      e.preventDefault();
      const r = await api("temas", "POST", {accion: "revisar", id: f.dataset.tpform, decision: dec, nota: f.nota.value}).catch(() => ({ok: false, j: {}}));
      if (!r.ok) return alerta(t("No se ha podido hacer."));
      await abrir("temas"); alerta(dec === "aprobar" ? t("✓ Aprobado. Se preparará la próxima mañana.") : t("✓ Rechazado. Las fotos se han borrado."));
    }; });
  $$("[data-tpborrar]").forEach(b => b.onclick = async () => {
    if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = t("¿Seguro? Pulsa otra vez"); return; }
    b.disabled = true; await api("temas", "POST", {accion: "borrar", id: b.dataset.tpborrar}).catch(() => {}); abrir("temas");
  });
};

/* ---------- usuarios ---------- */
VISTAS.usuarios = () => {
  const us = D.usuarios.filter(u => !filtroGrupo || u.grupo === filtroGrupo).sort((a, b) => b.ultimo - a.ultimo);
  const th = ["Usuario", ...(esAdmin() ? ["Tipo"] : []), "Aprende", "Clase", "Lecturas terminadas", "Estrellas", "Con ★★★", "Veces leídas", "Sin terminar", "XP", "Racha", "Cromos", "Palabras", "Último guardado"].map(h => `<th>${t(h)}</th>`).join("");
  return `<p class="admbt"><label class="admin-l">${t("Clase")} <select id="admfg"><option value="">${t("Todas")}</option>${Object.entries(D.grupos).map(([id, g]) => `<option value="${esc(id)}"${id === filtroGrupo ? " selected" : ""}>${esc(g.nombre)}</option>`).join("")}</select></label>
    <button type="button" class="btn" id="admxl">${t("⬇ Descargar Excel")}</button></p>
  ${us.length ? `<p class="ctas">${esAdmin() ? t("Pulsa un usuario para ver lo que ha hecho en cada lectura, cambiarle la contraseña o mandarle un mensaje.") : t("Pulsa un alumno para ver lo que ha hecho en cada lectura, cambiarle la contraseña o mandarle un mensaje.")}</p><div class="ctatb"><table><thead><tr>${th}</tr></thead><tbody>${us.map(u => `<tr class="ctafila" data-usuario="${esc(u.usuario)}" tabindex="0"><td><b>${esc(u.usuario)}</b></td>${esAdmin() ? `<td>${u.rol === "profe" ? t("🧑‍🏫 Profe") : t("🎒 Alumno")}</td>` : ""}<td>${esc((u.idioma || "—").toUpperCase())}</td><td>${u.grupo ? esc(nGrupo(u.grupo)) : "—"}</td><td>${u.terminadas}</td><td>⭐ ${u.estrellas}</td><td>${u.tres}</td><td>${u.veces}</td><td>${u.empezadas}</td><td>${u.xp}</td><td>${t("{0} (mejor {1})", u.racha, u.mejorRacha)}</td><td>${u.cromos}</td><td>${u.palabras}</td><td>${fecha(u.ultimo)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="ctas">${esAdmin() ? (filtroGrupo ? t("No hay usuarios en esta clase.") : t("No hay usuarios.")) : t("Todavía no tienes alumnos. Dales el código de tu clase para que se unan.")}</p>`}`;
};
ACCIONES.usuarios = () => {
  $d("#admfg").onchange = e => { filtroGrupo = e.target.value; pintar(); };
  $d("#admxl").onclick = excel;
  $$("[data-usuario]").forEach(tr => { tr.onclick = () => usuario(tr.dataset.usuario); tr.onkeydown = e => { if (e.key === "Enter") usuario(tr.dataset.usuario); }; });
};
function excel() {
  const us = D.usuarios.filter(u => !filtroGrupo || u.grupo === filtroGrupo);
  const ids = Object.values(T).filter(l => us.some(u => u.lecturas[l.id] !== undefined)).sort((a, b) => a.orden - b.orden).map(l => l.id);
  const q = v => { const s = String(v ?? ""); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const f = x => x ? new Date(x).toLocaleString(LOC()) : "";
  const filas = [[...["Usuario", "Tipo", "Aprende", "Clase", "Lecturas terminadas", "Estrellas", "Con 3 estrellas", "Veces leídas", "Sin terminar", "XP", "Racha", "Mejor racha", "Cromos", "Medallas", "Palabras", "Último guardado", "Alta"].map(h => t(h)), ...ids.map(id => "★ " + nombreL(T, id))]];
  for (const u of us) filas.push([u.usuario, u.rol === "profe" ? t("Profe") : t("Alumno"), u.idioma || "", u.grupo ? nGrupo(u.grupo) : "", u.terminadas, u.estrellas, u.tres, u.veces, u.empezadas, u.xp, u.racha, u.mejorRacha, u.cromos, u.medallas, u.palabras, f(u.ultimo), f(u.creado), ...ids.map(id => u.lecturas[id] ?? "")]);
  const csv = "﻿" + filas.map(r => r.map(q).join(";")).join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], {type: "text/csv;charset=utf-8"}));
  a.download = `${t("progreso")}-${filtroGrupo ? nGrupo(filtroGrupo).replace(/[^\wñáéíóúàèòïüç-]+/gi, "-") + "-" : ""}${hoy()}.csv`; document.body.appendChild(a); a.click(); a.remove();
  alerta(t("✓ Descargado. Se abre con Excel, Numbers o Google Sheets."));
}

/* detalle de un usuario */
async function usuario(u) {
  ventana(`<h2>👤 ${esc(u)}</h2><p class="ctas">${t("Cargando…")}</p>`);
  const r = await api("admin?usuario=" + encodeURIComponent(u)).catch(() => ({ok: false}));
  if (!r.ok) { ventana(`<p><button class="btn" type="button" id="ctavol">${t("← Usuarios")}</button></p><p class="ctam">${t("No se ha podido cargar.")}</p>`); $d("#ctavol").onclick = () => abrir("usuarios"); return; }
  const {resumen: R, lecturas, palabras, mensajes} = r.j;
  const L = lecturas.map(l => ({...l, ...(T[l.id] || {tema: "—", titulo: l.id, nivel: "", lengua: "", orden: 9999})})).sort((a, b) => b.terminada - a.terminada || a.orden - b.orden);
  const fallos = palabras.filter(p => p.fallo).length;
  ventana(`<p><button class="btn" type="button" id="ctavol">${t("← Usuarios")}</button></p>
    <h2>👤 ${esc(R.usuario)}</h2><p class="ctam" id="admm" role="status"></p>
    <div class="ctares">
      <div><b>${R.terminadas}</b><span>${t("lecturas terminadas")}</span></div>
      <div><b>⭐ ${R.estrellas}</b><span>${t("estrellas (de {0})", R.terminadas * 3)}</span></div>
      <div><b>${R.tres}</b><span>${t("con 3 estrellas")}</span></div>
      <div><b>${R.veces}</b><span>${t("veces leídas")}</span></div>
      <div><b>${R.empezadas}</b><span>${t("sin terminar")}</span></div>
      <div><b>${R.xp}</b><span>XP</span></div>
      <div><b>${R.racha}</b><span>${t("racha (mejor {0})", R.mejorRacha)}</span></div>
      <div><b>${R.cromos}</b><span>${t("cromos")}</span></div>
      <div><b>${R.medallas}</b><span>${t("medallas")}</span></div>
      <div><b>${R.palabras}</b><span>${t("palabras guardadas")}${fallos ? t(" ({0} por repasar)", fallos) : ""}</span></div>
    </div>
    <p class="ctas">${t("Alta: {0} · Último guardado: {1}", fecha(R.creado), fecha(R.ultimo))}</p>
    <div class="admgest">
      ${R.rol === "profe" ? `<p>${t("🧑‍🏫 Es profe")}</p>` : `<label>${t("Clase")} <select id="admug">${optsGrupo(R.grupo || "")}</select></label>`}
      <form id="admuc"><label>${t("Nueva contraseña")} <input name="nueva" type="text" minlength="6" maxlength="100" autocomplete="off" required></label><button class="btn" type="submit">${t("Cambiar contraseña")}</button></form>
      <form id="admum" class="admw"><label>${t("Mensaje para {0}", esc(R.usuario))} <textarea name="texto" rows="2" maxlength="500" required placeholder="${t("Por ejemplo: ¡Muy bien esta semana!")}"></textarea></label><button class="btn" type="submit">${t("✉️ Enviar mensaje")}</button></form>
    </div>
    ${L.length ? `<div class="ctatb"><table><thead><tr>${["Lectura", "Tema", "Nivel", "Mejor resultado", "Última vez", "Veces", "Mejor %"].map(h => `<th>${t(h)}</th>`).join("")}</tr></thead><tbody>${L.map(l => `<tr><td><b>${esc(l.titulo)}</b>${marcaL(l.lengua)}</td><td>${esc(l.tema)}</td><td>${esc(l.nivel)}</td><td>${l.terminada ? est(l.estrellas) : `<small class="ctae">${t(l.respuestas === 1 ? "Empezada ({0} respuesta)" : "Empezada ({0} respuestas)", l.respuestas)}</small>`}</td><td>${l.terminada && l.ultima !== null ? est(l.ultima) : "—"}</td><td>${l.veces || "—"}</td><td>${l.terminada ? l.mejorPct + " %" : "—"}</td></tr>`).join("")}</tbody></table></div>` : `<p class="ctas">${t("Todavía no ha hecho ninguna lectura.")}</p>`}
    ${palabras.length ? `<details class="ctapal"><summary>${t("Palabras guardadas ({0})", palabras.length)}</summary><p>${palabras.map(p => `<span${p.fallo ? ` class="fallo" title="${t("Por repasar")}"` : ""}>${esc(p.palabra)}</span>`).join(" ")}</p></details>` : ""}
    ${mensajes.length ? `<details class="ctapal"><summary>${t("Mensajes recibidos ({0})", mensajes.length)}</summary><ul class="ctali">${mensajes.map(m => `<li><p>${esc(m.texto)}</p><small>${fecha(m.t)}</small></li>`).join("")}</ul></details>` : ""}
    ${esAdmin() ? `<p style="margin-top:18px"><button class="btn" type="button" id="admub">${t("🗑 Borrar usuario")}</button></p>` : ""}`);
  $d("#ctavol").onclick = () => abrir("usuarios");
  if ($d("#admug")) $d("#admug").onchange = async e => { if (await hacer({accion: "grupo_asignar", usuario: u, grupo: e.target.value})) { alerta(t("✓ Clase guardada.")); const x = D.usuarios.find(z => z.usuario === u); if (x) x.grupo = e.target.value || null; } };
  $d("#admuc").onsubmit = async e => { e.preventDefault(); const f = e.target; if (await hacer({accion: "clave", usuario: u, nueva: f.nueva.value}, f.querySelector("button"))) { alerta(t("✓ Contraseña cambiada. Díselo a {0}: «{1}». Tendrá que volver a entrar.", u, f.nueva.value)); f.reset(); f.querySelector("button").disabled = false; } };
  $d("#admum").onsubmit = async e => { e.preventDefault(); const f = e.target; if (await hacer({accion: "mensaje", usuario: u, texto: f.texto.value}, f.querySelector("button"))) { alerta(t("✓ Mensaje enviado. Lo verá al entrar.")); f.reset(); f.querySelector("button").disabled = false; } };
  if ($d("#admub")) $d("#admub").onclick = async e => {
    const b = e.currentTarget;
    if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = t("⚠ ¿Borrar a {0} y todo su progreso? Pulsa otra vez", u); return; }
    if (await hacer({accion: "borrar_usuario", usuario: u}, b)) { await abrir("usuarios"); alerta(t("✓ {0} borrado.", u)); }
  };
}

/* ---------- clases ---------- */
VISTAS.clases = () => {
  const gs = Object.entries(D.grupos);
  const res = id => { const us = D.usuarios.filter(u => u.grupo === id), n = us.length || 1; return {n: us.length, term: us.reduce((s, u) => s + u.terminadas, 0), est: us.reduce((s, u) => s + u.estrellas, 0), xp: us.reduce((s, u) => s + u.xp, 0), media: (us.reduce((s, u) => s + u.terminadas, 0) / n).toFixed(1), mediaE: (us.reduce((s, u) => s + u.estrellas, 0) / n).toFixed(1)}; };
  const th = ["Clase", "Código", ...(esAdmin() ? ["Profe"] : []), "Alumnos", "Lecturas terminadas", "Media por alumno", "Estrellas", "Media de estrellas", "XP total"].map(h => `<th>${t(h)}</th>`).join("") + "<th></th>";
  return `<form id="admgc" class="admform"><label>${t("Nombre de la clase")}<input name="nombre" maxlength="40" required placeholder="${t("Ej. 3ºA Inglés")}"></label><label>${t("Código para unirse")}<input name="codigo" maxlength="20" required placeholder="${t("Ej. 3a-ingles")}" autocapitalize="none" spellcheck="false"></label><button class="btn main" type="submit">${t("➕ Crear clase")}</button></form>
  <p class="ctas">${t("Tus alumnos ponen el código al crear su cuenta o después en «Mi cuenta».")}</p>
  ${gs.length ? `<div class="ctatb"><table><thead><tr>${th}</tr></thead><tbody>${gs.map(([id, g]) => { const r = res(id); return `<tr><td><b>${esc(g.nombre)}</b></td><td><code>${esc(g.codigo || "—")}</code></td>${esAdmin() ? `<td>${g.profe ? esc(g.profe) : "admin"}</td>` : ""}<td>${r.n}</td><td>${r.term}</td><td>${r.media}</td><td>⭐ ${r.est}</td><td>${r.mediaE}</td><td>${r.xp}</td><td><button type="button" class="ctal" data-verg="${esc(id)}">${t("Ver alumnos")}</button> · <button type="button" class="ctal" data-borrag="${esc(id)}">${t("Borrar")}</button></td></tr>`; }).join("")}</tbody></table></div>` : `<p class="ctas">${t("Todavía no hay clases. Crea una y luego elige la clase de cada alumno aquí abajo.")}</p>`}
  ${alumnos().length && gs.length ? `<h3 style="margin-top:18px">${t("Alumnos y su clase")}</h3><div class="ctatb"><table><tbody>${alumnos().map(u => `<tr><td><b>${esc(u.usuario)}</b></td><td><select data-asig="${esc(u.usuario)}" aria-label="${t("Clase de {0}", esc(u.usuario))}">${optsGrupo(u.grupo || "", esAdmin() ? t("Sin clase") : t("Sacar de mis clases"))}</select></td></tr>`).join("")}</tbody></table></div>` : ""}`;
};
ACCIONES.clases = () => {
  $d("#admgc [name=nombre]").oninput = e => { const c = $d("#admgc [name=codigo]"); if (!c.dataset.tocado) c.value = e.target.value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]+/g, "-").replace(/^-|-$/g, "").slice(0, 20); };
  $d("#admgc [name=codigo]").oninput = e => { e.target.dataset.tocado = "1"; };
  $d("#admgc").onsubmit = async e => { e.preventDefault(); const r = await hacer({accion: "grupo_crear", nombre: e.target.nombre.value, codigo: e.target.codigo.value}, e.target.querySelector("button")); if (r) { await abrir("clases"); alerta(t("✓ Clase creada. Código para tus alumnos: {0}", r.codigo)); } };
  $$("[data-borrag]").forEach(b => b.onclick = async () => {
    if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = t("¿Seguro? (los alumnos no se borran)"); return; }
    if (await hacer({accion: "grupo_borrar", id: b.dataset.borrag}, b)) abrir("clases");
  });
  $$("[data-verg]").forEach(b => b.onclick = () => { filtroGrupo = b.dataset.verg; tabActual = "usuarios"; pintar(); });
  $$("[data-asig]").forEach(s => s.onchange = async () => { if (await hacer({accion: "grupo_asignar", usuario: s.dataset.asig, grupo: s.value})) { const x = D.usuarios.find(z => z.usuario === s.dataset.asig); if (x) x.grupo = s.value || null; alerta(t("✓ {0}: {1}", s.dataset.asig, s.value ? nGrupo(s.value) : t("sin clase"))); } });
};

/* ---------- deberes ---------- */
VISTAS.deberes = () => `<form id="admdc" class="admform"><label class="admw">${t("Lectura, dictado o mates")}<select name="lectura" required>${optsLectura()}</select></label>
  <label id="admdif" hidden>${t("Dificultad")}<select name="dif">${[1, 2, 3].map(d => `<option value="${d}">${"●".repeat(d)}${"○".repeat(3 - d)} ${t(MDIF[d])}</option>`).join("")}</select></label>
  <label>${t("Para")}<select name="grupo">${optsGrupo("", esAdmin() ? t("Todos los alumnos") : t("Todas mis clases"))}</select></label><label>${t("Fecha límite")}<input name="limite" type="date" required value="${hoy()}"></label>
  <label class="admw">${t("Nota (opcional)")}<input name="nota" maxlength="200" placeholder="${t("Por ejemplo: intenta sacar 3 estrellas")}"></label><button class="btn main" type="submit">${t("📚 Asignar deber")}</button></form>
  ${D.deberes.length ? `<ul class="ctali">${[...D.deberes].sort((a, b) => a.limite.localeCompare(b.limite)).map(d => { const hechos = d.alumnos.filter(a => a.hecho).length, venc = d.limite < hoy();
    return `<li><p><b>${d.actividad ? `${{quiz: "🏆", video: "📺", doblaje: "🎬"}[d.tipo] || "🧩"} ${esc(d.titulo || t("Actividad"))}${d.directo ? t(" · 🔴 en clase, en directo") : ""}` : d.cancion ? (d.doblaje ? "🎬 " : "🎵 ") + esc(d.titulo || (d.doblaje ? t("Doblaje") : t("Canción"))) : esc(nombreL(T, d.lectura))}</b></p>
    ${d.actividad && d.directo && d.tipo !== "doblaje" ? `<p class="admbt"><a class="btn main" href="#${d.tipo === "video" ? "video-" : "concurso-"}${esc(d.actividad)}" data-sala="${esc(d.actividad)}" data-grupo="${esc(d.grupo || "")}">${t("📺 Abrir la sala ahora")}</a></p>` : ""}<small>${t("Para: {0} · Hasta: {1}", d.grupo ? esc(nGrupo(d.grupo)) : esAdmin() ? t("todos") : t("todas mis clases"), dia(d.limite))}${venc ? t(" (terminado el plazo)") : ""}${d.nota ? " · " + esc(d.nota) : ""}</small>
    <p style="margin-top:6px">${t("✅ <b>{0}</b> de {1} la han hecho", hechos, d.alumnos.length)}</p>
    <details class="ctapal"><summary>${t("Ver quién")}</summary><p>${d.alumnos.map(a => `<span${a.hecho ? "" : ' class="fallo"'}>${a.hecho ? "✓" : "✗"} ${esc(a.usuario)}${a.hecho ? " " + "★".repeat(a.estrellas) : ""}${a.hecho && a.tot ? ` (${a.ok}/${a.tot})` : ""}</span>`).join(" ") || t("Nadie en esta clase.")}</p>
    ${d.alumnos.some(a => a.mal && a.mal.length) ? `<p class="ctas" style="margin-top:6px">${t("❌ Lo que fallaron en su último intento (ejercicio → solución buena):")}</p><ul class="admmal">${d.alumnos.filter(a => a.mal && a.mal.length).map(a => `<li><b>${esc(a.usuario)}</b> · ${a.ok}/${a.tot}${a.veces > 1 ? " · " + t("{0} intentos", a.veces) : ""}<br><small>${a.mal.map(esc).join("<br>")}</small></li>`).join("")}</ul>` : ""}</details>
    <button type="button" class="ctal" data-borrad="${esc(d.id)}">${t("Quitar")}</button></li>`; }).join("")}</ul>` : `<p class="ctas">${t("No hay deberes. Puedes mandar una lectura o un dictado; los alumnos los verán en la portada con la fecha límite.")}</p>`}
  <p class="ctas">${t("🎵 Para mandar una canción de YouTube, ábrela en la pestaña «Canciones» y pulsa «Mandar como deberes».")}<br>${t("🧩 Los concursos y los vídeos con preguntas se mandan desde «Actividades creadas».")}</p><p class="ctas">${t("🎬 Para mandar una escena para doblar, prepárala en la pestaña «Doblaje» y pulsa «Mandar a la clase».")}</p>`;
ACCIONES.deberes = () => {
  const fdc = $d("#admdc"), verDif = () => { $d("#admdif").hidden = !/^mates-/.test(fdc.lectura.value); }; fdc.lectura.onchange = verDif; verDif();
  $d("#admdc").onsubmit = async e => { e.preventDefault(); const f = e.target; if (await hacer({accion: "deber_crear", lectura: f.lectura.value + (/^mates-/.test(f.lectura.value) ? "-" + f.dif.value : ""), grupo: f.grupo.value, limite: f.limite.value, nota: f.nota.value}, f.querySelector("[type=submit]"))) { await abrir("deberes"); alerta(t("✓ Deber asignado.")); } };
  $$("[data-sala]").forEach(a => a.onclick = () => { window.LYAActividades?.preparar(a.dataset.sala, a.dataset.grupo); C.ui.cerrar(); });
  $$("[data-borrad]").forEach(b => b.onclick = async () => { if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = t("¿Seguro? Pulsa otra vez"); return; } if (await hacer({accion: "deber_borrar", id: b.dataset.borrad}, b)) abrir("deberes"); });
};

/* ---------- actividades creadas: concursos, vídeos con preguntas, doblajes y canciones mandadas, y los vídeos preparados ---------- */
const ICO = {quiz: "🏆", video: "📺", doblaje: "🎬"};
VISTAS.actividades = () => `<p class="ctas">${t("Todo lo que has creado. Ábrelo, juégalo en directo con tu clase o mándalo como deberes (en casa, o en clase en directo: tus alumnos entran solos desde «Deberes»).")}</p>
  <p class="admbt"><a class="btn" href="#concursos-crear" data-cierra>${t("✨ Crear un concurso")}</a> <a class="btn" href="#videos-editar" data-cierra>${t("📺 Crear un vídeo con preguntas")}</a></p>
  <div id="admact"><p class="ctas">${t("Cargando…")}</p></div>`;
ACCIONES.actividades = async () => {
  $$("[data-cierra]").forEach(a => a.onclick = () => C.ui.cerrar());
  const r = await api("concursos?mios=1").catch(() => ({ok: false}));
  const box = $d("#admact"); if (!box) return;
  const mias = r.ok ? (r.j.concursos || []).map(x => ({...x, tipo: x.tipo === "video" ? "video" : "quiz"})) : [];
  const prep = (window.LYAVideosPreparados || []).map(x => ({id: x.id, titulo: x.titulo, n: x.preguntas.length, tipo: "video", nivel: x.nivel, prep: true}));
  const canciones = D.deberes.filter(d => d.cancion && !d.doblaje), doblajes = D.deberes.filter(d => d.cancion && d.doblaje);
  const mandada = (d, ico, ruta) => `<li><p><b>${ico} ${esc(d.titulo || "")}</b></p><small>${t("Para: {0} · Hasta: {1} · ✅ {2} de {3}", d.grupo ? esc(nGrupo(d.grupo)) : t("todas mis clases"), dia(d.limite), d.alumnos.filter(a => a.hecho).length, d.alumnos.length)}</small><p class="admbt"><a class="btn" href="#${ruta}${esc(d.cancion)}" data-cierra>${t("▶ Abrir")}</a></p></li>`;
  const fila = x => `<li><p><b>${ICO[x.tipo]} ${esc(x.titulo)}</b></p><small>${x.tipo === "video" ? t("Vídeo con preguntas") : t("Concurso")} · ${t("{0} preguntas", x.n)}${x.nivel ? " · " + esc(x.nivel) : ""}${x.f ? " · " + fecha(x.f) : ""}</small>
    <p class="admbt"><a class="btn" href="#${x.tipo === "video" ? "video-solo-" : "concurso-solo-"}${esc(x.id)}" data-cierra>${t("▶ Probar")}</a> <a class="btn" href="#${x.tipo === "video" ? "video-" : "concurso-"}${esc(x.id)}" data-cierra>${t("📺 En directo")}</a>${x.prep ? "" : ` <a class="btn" href="#${x.tipo === "video" ? "videos-editar-" : "concursos-editar-"}${esc(x.id)}" data-cierra>${t("✏️ Editar")}</a>`}</p>
    <div data-act="${esc(x.id)}" data-tipo="${x.tipo}" data-tit="${esc(x.titulo)}"></div></li>`;
  const sec = (tit, xs, vacio) => `<h3 class="admh3">${tit}</h3>${xs.length ? `<ul class="ctali">${xs.map(fila).join("")}</ul>` : `<p class="ctas">${vacio}</p>`}`;
  const quiz = mias.filter(x => x.tipo === "quiz"), vids = mias.filter(x => x.tipo === "video");
  box.innerHTML = (r.ok ? "" : `<p class="ctam">${t("No se han podido cargar tus actividades.")}</p>`)
    + sec(t("🏆 Mis concursos ({0})", quiz.length), quiz, t("Aún no has creado ninguno. Se crean con IA en un minuto en «Concursos»."))
    + sec(t("📺 Mis vídeos con preguntas ({0})", vids.length), vids, t("Aún no has creado ninguno: pega un enlace de YouTube y añade preguntas en los momentos que quieras."))
    + `<h3 class="admh3">${t("🎬 Doblajes mandados ({0})", doblajes.length)}</h3>${doblajes.length ? `<ul class="ctali">${doblajes.map(d => mandada(d, "🎬", "doblaje-e-")).join("")}</ul>` : `<p class="ctas">${t("Se preparan en la pestaña «Doblaje» y se mandan con «Mandar a la clase».")}</p>`}`
    + `<h3 class="admh3">${t("🎵 Canciones mandadas ({0})", canciones.length)}</h3>${canciones.length ? `<ul class="ctali">${canciones.map(d => mandada(d, "🎵", "cancion-")).join("")}</ul>` : `<p class="ctas">${t("Se mandan desde la pestaña «Canciones».")}</p>`}`
    + sec(t("⭐ Vídeos preparados por COMPRENDO ({0})", prep.length), prep, "—");
  $$("[data-cierra]").forEach(a => a.onclick = () => C.ui.cerrar());
  if (window.LYAActividades) $$("[data-act]").forEach(el => window.LYAActividades.formDeber(el, {id: el.dataset.act, tipo: el.dataset.tipo, titulo: el.dataset.tit}));
};

/* ---------- fallos: palabras «por repasar» y preguntas más falladas ---------- */
VISTAS.fallos = () => `<h3>${t("Palabras que más cuestan")}</h3>
  ${D.fallos.palabras.length ? `<p class="ctas">${t("Palabras que los alumnos tienen marcadas «por repasar» en su diccionario (fallaron al repasarlas).")}</p><div class="ctatb"><table><thead><tr><th>${t("Palabra")}</th><th>${t("Alumnos")}</th></tr></thead><tbody>${D.fallos.palabras.slice(0, 40).map(p => `<tr><td><b>${esc(p.palabra)}</b>${marcaL(p.lengua)}</td><td>${p.n}</td></tr>`).join("")}</tbody></table></div>` : `<p class="ctas">${t("Aún no hay palabras falladas.")}</p>`}
  <h3 style="margin-top:18px">${t("Preguntas más falladas")}</h3><div id="admpq"><p class="ctas">${t("Calculando…")}</p></div>`;
ACCIONES.fallos = async () => {
  const R = D.fallos.respuestas, porL = {};
  for (const k of Object.keys(R)) { const [id] = k.split(":"); (porL[id] ||= []).push(k); }
  const lect = {};
  await Promise.all(Object.keys(porL).filter(id => T[id] && T[id].file).map(id => fetch("content/" + T[id].file).then(r => r.json()).then(j => { lect[id] = j; }).catch(() => {})));
  const filas = [];
  for (const [id, ks] of Object.entries(porL)) {
    const L = lect[id]; if (!L) continue;
    for (const k of ks) {
      const m = k.match(/:(q|g)(\d+)$/), item = m[1] === "q" ? (L.q || [])[+m[2]] : ((L.grammar || {}).items || [])[+m[2]];
      if (!item) continue;
      const c = R[k], tot = Object.values(c).reduce((a, b) => a + b, 0), bien = c[item[2]] || 0, mal = tot - bien;
      if (mal > 0) filas.push({id, tipo: m[1] === "q" ? t("Comprensión") : t("Gramática"), texto: item[0], buena: (item[1] || [])[item[2]], mal, tot, pct: Math.round(mal / tot * 100)});
    }
  }
  filas.sort((a, b) => b.mal - a.mal || b.pct - a.pct);
  const el = $d("#admpq"); if (!el) return;
  el.innerHTML = filas.length ? `<div class="ctatb"><table><thead><tr>${["Pregunta", "Respuesta buena", "Lectura", "Tipo", "Fallan"].map(h => `<th>${t(h)}</th>`).join("")}</tr></thead><tbody>${filas.slice(0, 40).map(f => `<tr><td style="white-space:normal;min-width:220px">${esc(f.texto)}</td><td>${esc(f.buena)}</td><td>${esc(nombreL(T, f.id))}</td><td>${f.tipo}</td><td>${t("<b>{0}</b> de {1} ({2} %)", f.mal, f.tot, f.pct)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="ctas">${t("Aún no hay preguntas falladas.")}</p>`;
};

/* ---------- mensajes ---------- */
VISTAS.mensajes = () => `<form id="admmc" class="admform"><label>${t("Para")}<select name="para"><option value="">${esAdmin() ? t("Todos los usuarios") : t("Todos mis alumnos")}</option>${Object.entries(D.grupos).map(([id, g]) => `<option value="g:${esc(id)}">${t("Clase {0}", esc(g.nombre))}</option>`).join("")}${D.usuarios.map(u => `<option value="u:${esc(u.usuario)}">👤 ${esc(u.usuario)}</option>`).join("")}</select></label>
  <label class="admw">${t("Mensaje")}<textarea name="texto" rows="3" maxlength="500" required placeholder="${t("Un aviso o una felicitación. Lo verán al entrar en la web.")}"></textarea></label><button class="btn main" type="submit">${t("✉️ Enviar")}</button></form>
  <h3 style="margin-top:18px">${t("Enviados")}</h3>${D.enviados.length ? `<ul class="ctali">${D.enviados.map(m => `<li><p>${esc(m.texto)}</p><small>${t("Para")}: ${m.para === "todos" ? t("todos") : m.para.startsWith("grupo:") ? t("clase {0}", esc(m.para.slice(6))) : "👤 " + esc(m.para)} (${m.n}) · ${fecha(m.t)}</small></li>`).join("")}</ul>` : `<p class="ctas">${t("Todavía no has enviado mensajes.")}</p>`}`;
ACCIONES.mensajes = () => {
  $d("#admmc").onsubmit = async e => {
    e.preventDefault(); const f = e.target, p = f.para.value;
    const r = await hacer({accion: "mensaje", texto: f.texto.value, ...(p.startsWith("g:") ? {grupo: p.slice(2)} : p.startsWith("u:") ? {usuario: p.slice(2)} : {})}, f.querySelector("[type=submit]"));
    if (r) { await abrir("mensajes"); alerta(t(r.n === 1 ? "✓ Enviado a {0} alumno." : "✓ Enviado a {0} alumnos.", r.n)); }
  };
};

/* ---------- votos ---------- */
VISTAS.votos = () => {
  const nm = x => (x || {})[LG()] || (x || {}).es || "";
  const nombres = Object.fromEntries((D.temasExtra || []).map(x => [x.id, `${x.emoji} ${nm(x.name)}`]));
  const v = Object.entries(D.votos).sort((a, b) => b[1] - a[1]);
  return `${v.length ? `<ul class="ctali">${v.map(([k, n]) => `<li><p><b>${esc(nombres[k] || k)}</b>: ${t(n === 1 ? "{0} voto" : "{0} votos", n)}</p></li>`).join("")}</ul>` : `<p class="ctas">${t("Todavía no hay votos.")}</p>`}
  ${(D.temasExtra || []).length ? `<h3 style="margin-top:18px">${t("Temas añadidos desde propuestas")}</h3><ul class="ctali">${D.temasExtra.map(x => `<li><p>${esc(x.emoji)} <b>${esc(nm(x.name))}</b>${nm(x.desc) ? " · " + esc(nm(x.desc)) : ""}</p><button type="button" class="ctal" data-quitat="${esc(x.id)}">${t("Quitar de la votación")}</button></li>`).join("")}</ul>` : ""}`;
};
ACCIONES.votos = () => { $$("[data-quitat]").forEach(b => b.onclick = async () => { if (await hacer({accion: "tema_quitar", id: b.dataset.quitat}, b)) abrir("votos"); }); };

window.LYAPanelAdmin = {abrir, t, catalogo, usuario: async u => { if (!D) await cargar(); usuario(u); }};  /* catalogo y usuario: para la portada del profe */
})();
