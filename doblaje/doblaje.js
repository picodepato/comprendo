/* Doblaje: pon tu voz a una canción o a una escena de un vídeo de YouTube.
   - El vídeo se ve con la API de YouTube. Canción: la letra sale sola (api/canciones?v=… → subtítulos o LRCLIB) o se busca por su nombre.
     Escena de película: las frases se pegan (texto, SRT/VTT o LRC; «ANA: hola» dice quién habla) o las prepara el profe.
     Si las frases no tienen tiempos, se marcan tocando un botón mientras suena el original.
   - Grabar: el vídeo se queda en silencio, las frases se iluminan a su tiempo y el móvil graba la voz (MediaRecorder, audio comprimido).
     Luego se ve el vídeo en silencio con tu voz encima, sincronizada.
   - Las tomas se guardan solo en este aparato (IndexedDB "comprendoDoblaje"). Solo sale una si el alumno la manda a la votación
     de su clase (api/votos {dob: "enviar"}). En #doblaje-clase la clase vota el mejor doblaje de cada escena.
   - Profes: «Mandar a la clase» guarda la escena como deberes (api/canciones {accion: "asignar", doblaje: true}); los alumnos la abren en #doblaje-e-<id>.
   Rutas: #doblaje · #doblaje-<vídeo> (canción) · #doblaje-texto (escena pegada) · #doblaje-e-<id> (del profe) · #doblaje-l-<clave> (guardada aquí)
          #doblaje-clase (votación) · #doblaje-ver-<id> (ver un doblaje de la clase). */
(() => {
const TX = {
  es: {tab: "🎬 Doblaje", h1: "Doblaje", sub: "Pon tu voz a una canción o a una escena de película. El vídeo se queda sin sonido, las frases salen a su tiempo y el móvil graba tu voz encima.",
    pega: "1. Pega el enlace de YouTube", ej: "https://www.youtube.com/watch?v=…", que: "2. ¿Qué vas a doblar?", t_cancion: "🎵 Una canción", td_cancion: "La letra sale sola", t_escena: "🎞️ Una escena", td_escena: "Pegas las frases",
    frases: "Frases de la escena (una por línea)", frases_ayuda: "Escribe «NOMBRE: frase» para saber quién habla. Si las copias con tiempos (SRT o LRC) salen solas; si no, marcarás los tiempos escuchando el original.",
    desde: "Desde (min:seg)", hasta: "Hasta (min:seg)", titulo: "Título (opcional)", empezar: "Empezar", cargando: "Buscando la letra…", volver: "← Doblaje",
    e_enlace: "Ese enlace no parece de YouTube. Cópialo de la barra del navegador o del botón «Compartir».", e_frases: "Pega al menos una frase.",
    e_sinletra: "No hemos encontrado la letra de este vídeo. Búscala por su nombre o pégala como escena.", e_muchas: "Has buscado muchas canciones en una hora. Espera un poco.", e_red: "No hay conexión. Prueba otra vez.",
    e_entra: "Entra con tu cuenta para abrir esta escena.", e_noesc: "Esta escena ya no está (tu profe la ha quitado).",
    buscar: "🔎 Busca la letra por su nombre", buscarq: "Artista y canción", buscarb: "Buscar", buscando: "Buscando…", sinres: "No la hemos encontrado. Prueba con otro nombre.", usar: "Usar", sinsync: "sin tiempos",
    profe_esc: "📚 Escenas de tu profe", tus: "Tus doblajes", tomas_n: "{n} tomas", clase_b: "🗳️ Votación de tu clase", clase_p: "Escucha los doblajes de tus compañeros y vota el mejor de cada escena.",
    como: "Cómo funciona", como1: "👂 Escucha primero el original para saber cómo se dice.", como2: "🎙️ Graba: el vídeo se queda sin sonido y tú dices las frases cuando se iluminan.", como3: "▶️ Mira tu doblaje: el vídeo con tu voz. Repite las veces que quieras.", como4: "🔒 Tus grabaciones se quedan en tu aparato. Solo sale la que tú mandes a la votación de tu clase.",
    orig: "👂 Escuchar original", grabar: "🎙️ Grabar mi voz", parar: "⏹️ Parar", marcar: "⏱️ Marcar tiempos", verdob: "▶️ Ver mi doblaje",
    m_listo: "Pulsa 👂 para oír el original o 🎙️ para grabar tu voz.", m_sintiempos: "Estas frases no tienen tiempos. Pulsa ⏱️ y toca el botón cada vez que empieza una frase.",
    m_orig: "Escuchando el original…", m_mic: "Permite usar el micrófono para grabar.", m_nomic: "No podemos usar el micrófono. Revisa el permiso del navegador.", m_norec: "Este navegador no puede grabar audio. Prueba con Chrome o Safari actualizados.",
    m_cuenta: "¡Prepárate!", m_grabando: "🔴 Grabando… di las frases cuando se iluminen.", m_grabado: "✓ ¡Grabado! Mira tu doblaje con ▶️.", m_viendo: "Tu doblaje…", m_corto: "La grabación es muy corta. Prueba otra vez.",
    m_marca: "Toca «Empieza la frase» justo cuando empiece cada frase.", sig: "👉 Empieza la frase {n}", deshacer: "↩️ Deshacer", m_marcado: "✓ Tiempos marcados. Ya puedes grabar.",
    ajuste: "Si las frases van adelantadas o atrasadas, ajústalas:", antes: "⏪ Antes", despues: "Después ⏩",
    trozo: "✂️ Elegir el trozo del vídeo", inicio_aqui: "Empieza aquí", fin_aqui: "Acaba aquí", escena_de: "Escena: {a} → {b}", todo: "todo el vídeo",
    yo: "Yo hago de", todos: "Todos",
    tomas: "Tus tomas", sintomas: "Todavía no has grabado ninguna toma.", ver: "▶️ Ver", borrar: "🗑️", borrar_t: "Borrar", mandar: "📤 Mandar a la votación", mandada: "✓ En la votación de tu clase", mandando: "Mandando…",
    soloaqui: "🔒 Se guardan solo en este aparato.", nolocal: "Este navegador no deja guardar las tomas: se perderán al salir.",
    e_mandar: "No se ha podido mandar. Prueba otra vez.", e_sinclase: "Para mandarla, únete a una clase (botón de tu cuenta → código de la clase).", e_grande: "La toma es demasiado larga para mandarla. Elige un trozo más corto.", e_cuenta: "Entra con tu cuenta para mandar tu doblaje a la clase.",
    sustituida: "✓ Mandada. Sustituye a la que habías mandado de esta escena.",
    deber: "📚 Deberes de tu profe", hecho: "+{n} XP",
    mandar_cl: "🧑‍🏫 Mandar a la clase", para: "Para", todas: "Todas mis clases", todosal: "Todos los alumnos", fecha: "Fecha límite", nota: "Nota (opcional)", mandarb: "Mandar a la clase",
    mandada_cl: "✓ Mandada. Tus alumnos la verán en la portada, en «Tus deberes».", sinclases: "Primero crea una clase en tu Panel del profe.", e_mandar_cl: "No se ha podido mandar. Prueba otra vez.",
    votacion: "Votación de la clase", clase_de: "Clase: {c}", sindobs: "Todavía nadie ha mandado un doblaje. ¡Sé el primero!", votos: "{n} votos", voto1: "1 voto", votar: "⭐ Votar", tuvoto: "✓ Tu voto", tuyo: "Es tuyo",
    gana: "🏆 Va ganando", e_clase: "Entra con tu cuenta y únete a una clase para ver la votación.", e_sinclase_v: "Únete a una clase para ver los doblajes de tus compañeros.",
    de: "de {u}", hace: "{d}", e_audio: "Este navegador no puede reproducir esta grabación (está en un formato que no entiende).", nodob: "Este doblaje ya no está.", quitar: "Quitar", seguro: "¿Seguro? Pulsa otra vez",
    sinvideo: "El vídeo no se puede ver aquí.", abriryt: "Ábrelo en YouTube", dur: "{s} s"},
  en: {tab: "🎬 Dubbing", h1: "Dubbing", sub: "Put your voice on a song or a film scene. The video has no sound, the lines appear on time and your phone records your voice over it.",
    pega: "1. Paste the YouTube link", ej: "https://www.youtube.com/watch?v=…", que: "2. What are you going to dub?", t_cancion: "🎵 A song", td_cancion: "The lyrics come on their own", t_escena: "🎞️ A scene", td_escena: "You paste the lines",
    frases: "Lines of the scene (one per line)", frases_ayuda: "Write «NAME: line» to show who speaks. If you copy them with times (SRT or LRC) they appear on their own; if not, you will mark the times while you listen to the original.",
    desde: "From (min:sec)", hasta: "To (min:sec)", titulo: "Title (optional)", empezar: "Start", cargando: "Looking for the lyrics…", volver: "← Dubbing",
    e_enlace: "That link does not look like YouTube. Copy it from the address bar or the «Share» button.", e_frases: "Paste at least one line.",
    e_sinletra: "We could not find the lyrics of this video. Search them by name or paste them as a scene.", e_muchas: "You have looked up a lot of songs this hour. Wait a little.", e_red: "No connection. Try again.",
    e_entra: "Sign in to open this scene.", e_noesc: "This scene is no longer here (your teacher removed it).",
    buscar: "🔎 Search the lyrics by name", buscarq: "Artist and song", buscarb: "Search", buscando: "Searching…", sinres: "We could not find it. Try another name.", usar: "Use", sinsync: "no times",
    profe_esc: "📚 Scenes from your teacher", tus: "Your dubs", tomas_n: "{n} takes", clase_b: "🗳️ Your class vote", clase_p: "Listen to your classmates' dubs and vote for the best one of each scene.",
    como: "How it works", como1: "👂 First listen to the original to hear how it is said.", como2: "🎙️ Record: the video has no sound and you say the lines when they light up.", como3: "▶️ Watch your dub: the video with your voice. Try again as many times as you like.", como4: "🔒 Your recordings stay on your device. Only the one you send to your class vote leaves it.",
    orig: "👂 Listen to the original", grabar: "🎙️ Record my voice", parar: "⏹️ Stop", marcar: "⏱️ Mark the times", verdob: "▶️ Watch my dub",
    m_listo: "Press 👂 to hear the original or 🎙️ to record your voice.", m_sintiempos: "These lines have no times. Press ⏱️ and tap the button every time a line starts.",
    m_orig: "Listening to the original…", m_mic: "Allow the microphone to record.", m_nomic: "We cannot use the microphone. Check the browser permission.", m_norec: "This browser cannot record audio. Try an up-to-date Chrome or Safari.",
    m_cuenta: "Get ready!", m_grabando: "🔴 Recording… say the lines when they light up.", m_grabado: "✓ Recorded! Watch your dub with ▶️.", m_viendo: "Your dub…", m_corto: "The recording is too short. Try again.",
    m_marca: "Tap «Line starts» right when each line starts.", sig: "👉 Line {n} starts", deshacer: "↩️ Undo", m_marcado: "✓ Times marked. You can record now.",
    ajuste: "If the lines come too early or too late, adjust them:", antes: "⏪ Earlier", despues: "Later ⏩",
    trozo: "✂️ Choose the part of the video", inicio_aqui: "Start here", fin_aqui: "End here", escena_de: "Scene: {a} → {b}", todo: "the whole video",
    yo: "I play", todos: "Everyone",
    tomas: "Your takes", sintomas: "You have not recorded any take yet.", ver: "▶️ Watch", borrar: "🗑️", borrar_t: "Delete", mandar: "📤 Send to the vote", mandada: "✓ In your class vote", mandando: "Sending…",
    soloaqui: "🔒 They are saved only on this device.", nolocal: "This browser does not let us save takes: they will be lost when you leave.",
    e_mandar: "It could not be sent. Try again.", e_sinclase: "To send it, join a class (your account button → class code).", e_grande: "This take is too long to send. Choose a shorter part.", e_cuenta: "Sign in to send your dub to the class.",
    sustituida: "✓ Sent. It replaces the one you had sent for this scene.",
    deber: "📚 Homework from your teacher", hecho: "+{n} XP",
    mandar_cl: "🧑‍🏫 Send to the class", para: "For", todas: "All my classes", todosal: "All students", fecha: "Due date", nota: "Note (optional)", mandarb: "Send to the class",
    mandada_cl: "✓ Sent. Your students will see it on the home page, in «Your homework».", sinclases: "First create a class in your Teacher panel.", e_mandar_cl: "It could not be sent. Try again.",
    votacion: "Class vote", clase_de: "Class: {c}", sindobs: "Nobody has sent a dub yet. Be the first!", votos: "{n} votes", voto1: "1 vote", votar: "⭐ Vote", tuvoto: "✓ Your vote", tuyo: "It's yours",
    gana: "🏆 Winning", e_clase: "Sign in and join a class to see the vote.", e_sinclase_v: "Join a class to see your classmates' dubs.",
    de: "by {u}", hace: "{d}", e_audio: "This browser cannot play this recording (its format is not supported).", nodob: "This dub is no longer here.", quitar: "Remove", seguro: "Sure? Press again",
    sinvideo: "The video cannot be shown here.", abriryt: "Open it on YouTube", dur: "{s} s"},
  ca: {tab: "🎬 Doblatge", h1: "Doblatge", sub: "Posa la teva veu a una cançó o a una escena de pel·lícula. El vídeo es queda sense so, les frases surten al seu moment i el mòbil grava la teva veu damunt.",
    pega: "1. Enganxa l'enllaç de YouTube", ej: "https://www.youtube.com/watch?v=…", que: "2. Què doblaràs?", t_cancion: "🎵 Una cançó", td_cancion: "La lletra surt sola", t_escena: "🎞️ Una escena", td_escena: "Enganxes les frases",
    frases: "Frases de l'escena (una per línia)", frases_ayuda: "Escriu «NOM: frase» per saber qui parla. Si les copies amb temps (SRT o LRC) surten soles; si no, marcaràs els temps escoltant l'original.",
    desde: "Des de (min:seg)", hasta: "Fins a (min:seg)", titulo: "Títol (opcional)", empezar: "Començar", cargando: "Buscant la lletra…", volver: "← Doblatge",
    e_enlace: "Aquest enllaç no sembla de YouTube. Copia'l de la barra del navegador o del botó «Compartir».", e_frases: "Enganxa almenys una frase.",
    e_sinletra: "No hem trobat la lletra d'aquest vídeo. Busca-la pel nom o enganxa-la com a escena.", e_muchas: "Has buscat moltes cançons en una hora. Espera una mica.", e_red: "No hi ha connexió. Torna-ho a provar.",
    e_entra: "Entra amb el teu compte per obrir aquesta escena.", e_noesc: "Aquesta escena ja no hi és (el teu profe l'ha treta).",
    buscar: "🔎 Busca la lletra pel nom", buscarq: "Artista i cançó", buscarb: "Buscar", buscando: "Buscant…", sinres: "No l'hem trobada. Prova amb un altre nom.", usar: "Fer servir", sinsync: "sense temps",
    profe_esc: "📚 Escenes del teu profe", tus: "Els teus doblatges", tomas_n: "{n} preses", clase_b: "🗳️ Votació de la teva classe", clase_p: "Escolta els doblatges dels teus companys i vota el millor de cada escena.",
    como: "Com funciona", como1: "👂 Escolta primer l'original per saber com es diu.", como2: "🎙️ Grava: el vídeo es queda sense so i tu dius les frases quan s'il·luminen.", como3: "▶️ Mira el teu doblatge: el vídeo amb la teva veu. Repeteix-ho tantes vegades com vulguis.", como4: "🔒 Les teves gravacions es queden al teu aparell. Només en surt la que enviïs a la votació de la classe.",
    orig: "👂 Escoltar l'original", grabar: "🎙️ Gravar la meva veu", parar: "⏹️ Aturar", marcar: "⏱️ Marcar els temps", verdob: "▶️ Veure el meu doblatge",
    m_listo: "Toca 👂 per sentir l'original o 🎙️ per gravar la teva veu.", m_sintiempos: "Aquestes frases no tenen temps. Toca ⏱️ i prem el botó cada vegada que comença una frase.",
    m_orig: "Escoltant l'original…", m_mic: "Deixa fer servir el micròfon per gravar.", m_nomic: "No podem fer servir el micròfon. Revisa el permís del navegador.", m_norec: "Aquest navegador no pot gravar àudio. Prova amb Chrome o Safari actualitzats.",
    m_cuenta: "Prepara't!", m_grabando: "🔴 Gravant… digues les frases quan s'il·luminin.", m_grabado: "✓ Gravat! Mira el teu doblatge amb ▶️.", m_viendo: "El teu doblatge…", m_corto: "La gravació és massa curta. Torna-ho a provar.",
    m_marca: "Toca «Comença la frase» just quan comenci cada frase.", sig: "👉 Comença la frase {n}", deshacer: "↩️ Desfer", m_marcado: "✓ Temps marcats. Ja pots gravar.",
    ajuste: "Si les frases van avançades o endarrerides, ajusta-les:", antes: "⏪ Abans", despues: "Després ⏩",
    trozo: "✂️ Triar el tros del vídeo", inicio_aqui: "Comença aquí", fin_aqui: "Acaba aquí", escena_de: "Escena: {a} → {b}", todo: "tot el vídeo",
    yo: "Jo faig de", todos: "Tothom",
    tomas: "Les teves preses", sintomas: "Encara no has gravat cap presa.", ver: "▶️ Veure", borrar: "🗑️", borrar_t: "Esborrar", mandar: "📤 Enviar a la votació", mandada: "✓ A la votació de la teva classe", mandando: "Enviant…",
    soloaqui: "🔒 Només es desen en aquest aparell.", nolocal: "Aquest navegador no deixa desar les preses: es perdran en sortir.",
    e_mandar: "No s'ha pogut enviar. Torna-ho a provar.", e_sinclase: "Per enviar-la, uneix-te a una classe (botó del teu compte → codi de la classe).", e_grande: "La presa és massa llarga per enviar-la. Tria un tros més curt.", e_cuenta: "Entra amb el teu compte per enviar el teu doblatge a la classe.",
    sustituida: "✓ Enviada. Substitueix la que havies enviat d'aquesta escena.",
    deber: "📚 Deures del teu profe", hecho: "+{n} XP",
    mandar_cl: "🧑‍🏫 Enviar a la classe", para: "Per a", todas: "Totes les meves classes", todosal: "Tots els alumnes", fecha: "Data límit", nota: "Nota (opcional)", mandarb: "Enviar a la classe",
    mandada_cl: "✓ Enviada. Els teus alumnes la veuran a la portada, a «Els teus deures».", sinclases: "Primer crea una classe al teu Tauler del profe.", e_mandar_cl: "No s'ha pogut enviar. Torna-ho a provar.",
    votacion: "Votació de la classe", clase_de: "Classe: {c}", sindobs: "Encara ningú no ha enviat cap doblatge. Sigues el primer!", votos: "{n} vots", voto1: "1 vot", votar: "⭐ Votar", tuvoto: "✓ El teu vot", tuyo: "És teu",
    gana: "🏆 Va guanyant", e_clase: "Entra amb el teu compte i uneix-te a una classe per veure la votació.", e_sinclase_v: "Uneix-te a una classe per veure els doblatges dels teus companys.",
    de: "de {u}", hace: "{d}", e_audio: "Aquest navegador no pot reproduir aquesta gravació (té un format que no entén).", nodob: "Aquest doblatge ja no hi és.", quitar: "Treure", seguro: "Segur? Torna-hi a prémer",
    sinvideo: "El vídeo no es pot veure aquí.", abriryt: "Obre'l a YouTube", dur: "{s} s"}
};
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const both = () => { try { return L().both(); } catch (e) { return false; } };
const lg = () => { try { return st().S.learn; } catch (e) { return "es"; } };
const tl = (k, l, v) => { let s = (TX[l] || TX.es)[k] ?? TX.es[k] ?? k; for (const x in v || {}) s = s.split(`{${x}}`).join(v[x]); return s; };
const two = () => { try { const S = st().S; return both() && S.know !== S.learn; } catch (e) { return false; } };
const T = (k, v) => esc(tl(k, lg(), v)) + (two() ? " · " + esc(tl(k, st().S.know, v)) : "");
const TB = (k, v) => esc(tl(k, lg(), v)) + (two() ? `<span class="en">${esc(tl(k, st().S.know, v))}</span>` : "");
const T1 = (k, v) => esc(tl(k, lg(), v));
/* botón con icono + texto (en el móvil solo el icono) */
const IB = k => { const full = tl(k, lg()), i = full.indexOf(" "); return `<span class="cnic" aria-hidden="true">${esc(full.slice(0, i))}</span><span class="cnlbl">${esc(full.slice(i + 1))}</span>`; };
const IBA = k => { const s = esc(tl(k, lg()).replace(/^\S+\s/, "")); return `title="${s}" aria-label="${s}"`; };
const xp = d => { try { dispatchEvent(new CustomEvent("lya:xp", {detail: d})); } catch (e) {} };
const app = () => document.getElementById("app");
const C = () => window.LYACuentas || null;
const hoy = (mas = 0) => { const d = new Date(Date.now() + mas * 864e5); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const mmss = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const leerMMSS = s => { s = String(s || "").trim(); if (!s) return null; const p = s.split(/[:.,']/).map(Number); if (p.some(isNaN)) return null; return p.length >= 2 ? p[0] * 60 + p[1] : p[0]; };
const fecha = t => { try { return new Date(t).toLocaleDateString(lg() === "en" ? "en-GB" : lg() === "ca" ? "ca-ES" : "es-ES", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}); } catch (e) { return ""; } };

/* ---------- utilidades ---------- */
function idVideo(s) {
  s = String(s || "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/|\/v\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
/* frases pegadas: SRT/VTT, LRC o texto normal → [{t, d, x, who}]. «ANA: hola» → who: "ANA" */
const QUIEN = /^\s*(?:[-–—]\s*)?([\p{Lu}][\p{L}.' ]{0,18}?)\s*:\s+(\S.*)$/u;
function parseFrases(txt) {
  txt = String(txt || "").replace(/\r/g, "").trim();
  const seg = h => { const p = h.replace(",", ".").split(":").map(Number); return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]; };
  let out = [];
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
  out = out.map(l => ({...l, x: l.x.replace(/[♪♫]/g, " ").replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim()})).filter(l => /[\p{L}\p{N}]/u.test(l.x));
  for (const l of out) { const m = l.x.match(QUIEN); if (m && !/^\d/.test(m[1])) { l.who = m[1].trim().slice(0, 30); l.x = m[2].trim(); } }
  return out.slice(0, 300);
}
const conTiempos = ls => ls.some(l => l.t > 0) || (ls.length === 1 && ls[0].d > 0);
const COLORES = ["#ff6b9d", "#4cc9f0", "#ffcc4d", "#3fd69c", "#b98cff", "#ff9f43"];
const quienes = () => [...new Set((D && D.lineas || []).map(l => l.who).filter(Boolean))];
const colorDe = w => COLORES[Math.max(0, quienes().indexOf(w)) % COLORES.length];

/* ---------- guardar tomas en el aparato (IndexedDB) ---------- */
let dbP = null;
function db() {
  if (dbP) return dbP;
  dbP = new Promise(res => {
    try {
      const r = indexedDB.open("comprendoDoblaje", 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore("escenas", {keyPath: "k"}); d.createObjectStore("tomas", {keyPath: "id"}).createIndex("k", "k"); };
      r.onsuccess = () => res(r.result); r.onerror = () => res(null); r.onblocked = () => res(null);
    } catch (e) { res(null); }
  });
  return dbP;
}
async function idb(store, modo, fn) {
  const d = await db(); if (!d) return null;
  return new Promise(res => {
    try { const tx = d.transaction(store, modo), s = tx.objectStore(store), r = fn(s); tx.oncomplete = () => res(r && "result" in r ? r.result : true); tx.onerror = tx.onabort = () => res(null); }
    catch (e) { res(null); }
  });
}
const MEM = {escenas: new Map(), tomas: new Map()};   /* si no hay IndexedDB: solo mientras la página está abierta */
let sinLocal = false;
async function guardarEscena(e) { const r = await idb("escenas", "readwrite", s => s.put(e)); if (r === null) { sinLocal = true; MEM.escenas.set(e.k, e); } }
async function escenaLocal(k) { const r = await idb("escenas", "readonly", s => s.get(k)); return r || MEM.escenas.get(k) || null; }
async function escenasLocales() { const r = await idb("escenas", "readonly", s => s.getAll()); return (r || [...MEM.escenas.values()]).sort((a, b) => (b.d || 0) - (a.d || 0)); }
async function guardarToma(t) { const r = await idb("tomas", "readwrite", s => s.put(t)); if (r === null) { sinLocal = true; MEM.tomas.set(t.id, t); } }
async function tomasDe(k) { const r = await idb("tomas", "readonly", s => s.index("k").getAll(k)); return (r || [...MEM.tomas.values()].filter(t => t.k === k)).sort((a, b) => b.creado - a.creado); }
async function todasTomas() { const r = await idb("tomas", "readonly", s => s.getAll()); return r || [...MEM.tomas.values()]; }
async function borrarToma(id) { await idb("tomas", "readwrite", s => s.delete(id)); MEM.tomas.delete(id); }
const MAX_TOMAS = 5;

/* ---------- estado ---------- */
let D = null;        /* escena abierta: {h, k, v, titulo, idioma, lineas, inicio, fin, ajuste, escena, origen, deber, clase} */
let F = {tipo: "cancion"};   /* inicio: {err, v, tipo, q, abrir, frases, titulo} */
let player = null, timer = null, root = null, modo = "", TOMAS = [], viendo = null, audioEl = null;
let rec = null, stream = null, chunks = [], t0 = 0, cuentaT = null, marcaI = 0, xpDado = 0;

const RUTA = /^doblaje(?:-(?:[A-Za-z0-9_-]{11}|texto|clase|e-[a-f0-9]{12}|ver-[a-f0-9]{12}|l-[A-Za-z0-9_-]{1,40}))?$/;
const isDub = h => RUTA.test(h);
const tab = () => { try { const S = st().S; return esc(tl("tab", S.learn)) + (both() && S.know !== S.learn ? `<span class="tk"> · ${esc(tl("tab", S.know).replace(/^\S+\s/, ""))}</span>` : ""); } catch (e) { return "🎬 Doblaje"; } };
addEventListener("hashchange", () => { const h = location.hash.slice(1); if (!isDub(h) || (D && D.h !== h)) parar(); });
function parar() {
  pararTodo();
  clearInterval(timer); timer = null;
  try { if (player) player.destroy(); } catch (e) {}
  player = null; root = null;
}
function pararTodo() {
  clearInterval(cuentaT); cuentaT = null;
  if (rec && rec.state !== "inactive") { rec._cancel = true; try { rec.stop(); } catch (e) {} }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  if (audioEl) { try { audioEl.pause(); } catch (e) {} }
  const o = document.getElementById("dbcount"); if (o) o.remove();
  modo = ""; viendo = null;
}

async function servidor() { try { return !!(C() && await C().hayServidor()); } catch (e) { return false; } }

async function render(el) {
  el = el || app();
  const h = location.hash.slice(1) || "doblaje";
  try { L().setAcc("#ff6b9d"); } catch (e) {}
  if (D && D.h === h && root && el.contains(root)) return;   /* ya está pintado: no tocar el vídeo */
  if (D && D.h === h) return pintarEstudio(el);
  parar();
  if (h === "doblaje" || h === "doblaje-texto") { D = null; return pintarInicio(el); }
  if (h === "doblaje-clase") { D = null; return pintarClase(el); }
  el.innerHTML = `<section class="cn db"><p class="msg">${T("cargando")}</p></section>`;
  if (h.startsWith("doblaje-e-")) return abrirEscenaProfe(el, h.slice(10), h);
  if (h.startsWith("doblaje-ver-")) return abrirDeClase(el, h.slice(12), h);
  if (h.startsWith("doblaje-l-")) return abrirLocal(el, h.slice(10), h);
  return abrirCancion(el, h.slice(8), h);
}

function nuevaEscena(d) {
  /* d = {h, v, titulo, idioma, lineas, inicio, fin, ajuste, escena, origen, deber} */
  const ls = d.lineas.map(l => ({...l})), tiempos = conTiempos(ls);
  let inicio = d.inicio != null ? +d.inicio : null, fin = d.fin != null && +d.fin > 0 ? +d.fin : null;
  if (tiempos) {
    const dentro = ls.filter(l => (inicio == null || l.t >= inicio - 0.5) && (fin == null || l.t < fin));
    if (dentro.length) { ls.length = 0; ls.push(...dentro); }
    if (inicio == null) inicio = Math.max(0, ls[0].t - 1.5);
    if (fin == null) { const u = ls[ls.length - 1]; fin = u.t + (u.d || 4) + 0.8; }
  }
  const k = d.escena ? "e" + d.escena : (d.v || "x") + "-" + Math.round(inicio || 0) + (d.h === "doblaje-texto" ? "-" + hashTxt(ls.map(l => l.x).join("|")) : "");
  D = {h: d.h, k, v: d.v, titulo: d.titulo || tl("h1", lg()), idioma: d.idioma || lg(), lineas: ls, inicio: inicio || 0, fin: fin || 0, ajuste: +d.ajuste || 0, escena: d.escena || null, origen: d.origen || "", deber: !!d.deber, yo: "", msg: ""};
  xpDado = 0;
}
const hashTxt = s => { let h = 0; for (const c of s) h = (h * 31 + c.codePointAt(0)) >>> 0; return h.toString(36).slice(0, 6); };
const tiemposOK = () => D && conTiempos(D.lineas);
const finEscena = () => D.fin > D.inicio ? D.fin : 0;

async function abrirCancion(el, v, h) {
  F = {v, tipo: "cancion"};
  if (!(await servidor())) { F.err = "e_sinletra"; F.abrir = true; location.hash = "doblaje"; return; }
  let r;
  try { r = await C().api(`canciones?v=${encodeURIComponent(v)}&lang=${lg()}`); } catch (e) { F.err = "e_red"; return pintarInicio(el); }
  if (location.hash.slice(1) !== h) return;
  if (!r.ok) {
    const e = (r.j || {}).error || "";
    F.err = e === "enlace_no_valido" ? "e_enlace" : e === "demasiadas" ? "e_muchas" : "e_sinletra";
    F.abrir = F.err === "e_sinletra"; F.titulo = (r.j || {}).titulo || "";
    if (F.titulo) F.q = F.titulo.replace(/\([^)]*\)|\[[^\]]*\]/g, " ").replace(/\b(official|oficial|video|vídeo|lyrics?|letra|audio)\b/gi, " ").replace(/[|"]/g, " ").replace(/\s+/g, " ").trim();
    return pintarInicio(el);
  }
  nuevaEscena({h, v, titulo: r.j.titulo || "YouTube", idioma: r.j.idioma, lineas: r.j.lineas, origen: r.j.origen === "lrclib" ? "LRCLIB" : "YouTube"});
  pintarEstudio(el);
}
async function abrirEscenaProfe(el, id, h) {
  if (!C() || !C().usuario || !(await servidor())) { el.innerHTML = `<section class="cn db"><p class="msg">${T("e_entra")}</p></section>`; return; }
  const r = await C().api("canciones?id=" + id).catch(() => ({ok: false, j: {}}));
  if (location.hash.slice(1) !== h) return;
  if (!r.ok || !r.j.v) { el.innerHTML = `<section class="cn db"><p class="msg">${T(r.code === 401 ? "e_entra" : r.code === 404 || !r.j.v ? "e_noesc" : "e_red")}</p><p class="msg"><a class="btn" href="#doblaje">${T("volver")}</a></p></section>`; return; }
  nuevaEscena({h, v: r.j.v, titulo: r.j.titulo, idioma: r.j.idioma, lineas: r.j.lineas, inicio: r.j.inicio, fin: r.j.fin, ajuste: r.j.ajuste, escena: id, deber: true});
  pintarEstudio(el);
}
async function abrirLocal(el, k, h) {
  const e = await escenaLocal(k);
  if (location.hash.slice(1) !== h) return;
  if (!e) { location.hash = "doblaje"; return; }
  nuevaEscena({...e, h}); D.k = k;
  pintarEstudio(el);
}

/* ---------- inicio ---------- */
async function pintarInicio(el) {
  const tipo = F.tipo || "cancion";
  const tBtn = k => `<button type="button" class="cnlv${tipo === k ? " on" : ""}" data-db="tipo" data-t="${k}" aria-pressed="${tipo === k}"><b>${T("t_" + k)}</b><small>${T("td_" + k)}</small></button>`;
  el.innerHTML = `<section class="cn db">
    <div class="cnintro"><h1>🎬 ${TB("h1")}</h1><p>${TB("sub")}</p></div>
    <form class="cnform" id="dbform"><label for="dburl">${T("pega")}</label>
      <div class="cnrow"><input id="dburl" name="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="${esc(tl("ej", lg()))}" value="${F.v ? "https://youtu.be/" + esc(F.v) : ""}"></div>
      <fieldset class="cnlvs"><legend>${T("que")}</legend>${tBtn("cancion")}${tBtn("escena")}</fieldset>
      <div id="dbesc"${tipo === "escena" ? "" : " hidden"}>
        <label class="dblab">${T("frases")}<textarea name="frases" rows="7" placeholder="ANA: Hello, how are you?&#10;BEN: I'm fine, thanks.">${esc(F.frases || "")}</textarea></label>
        <p class="small dbhelp">${TB("frases_ayuda")}</p>
        <div class="dbrango"><label class="dblab">${T("desde")}<input name="desde" inputmode="numeric" placeholder="0:00" value="${esc(F.desde || "")}"></label><label class="dblab">${T("hasta")}<input name="hasta" inputmode="numeric" placeholder="1:30" value="${esc(F.hasta || "")}"></label></div>
        <label class="dblab">${T("titulo")}<input name="titulo" maxlength="120" value="${esc(F.titulo || "")}"></label>
      </div>
      ${F.err ? `<p class="cnerr" role="alert">${T(F.err)}</p>` : ""}
      <p><button class="btn main" type="submit">${T("empezar")}</button></p>
    </form>
    <details class="cnpaste cnsearch"${F.abrir || F.q ? " open" : ""}><summary>${T("buscar")}</summary>
      <form id="dbsform"><div class="cnrow"><input name="q" maxlength="150" autocomplete="off" placeholder="${esc(tl("buscarq", lg()))}" aria-label="${esc(tl("buscarq", lg()))}" value="${esc(F.q || "")}"><button class="btn main" type="submit">${T("buscarb")}</button></div></form>
      <div id="dbsres" aria-live="polite"></div></details>
    <details class="cnhow"><summary>${T("como")}</summary><ul class="dbhow"><li>${TB("como1")}</li><li>${TB("como2")}</li><li>${TB("como3")}</li><li>${TB("como4")}</li></ul></details>
    <div id="dbprofe"></div>
    <a class="dbclase" href="#doblaje-clase" id="dbclasel" hidden><b>${T("clase_b")}</b><span>${T("clase_p")}</span></a>
    <div id="dbmios"></div>
  </section>`;
  const f = el.querySelector("#dbform");
  f.onsubmit = e => {
    e.preventDefault();
    const v = idVideo(f.url.value); F.v = v; F.frases = f.frases.value; F.desde = f.desde.value; F.hasta = f.hasta.value; F.titulo = f.titulo.value;
    if (!v) { F.err = "e_enlace"; return pintarInicio(el); }
    F.err = "";
    if (F.tipo === "escena") {
      const ls = parseFrases(f.frases.value);
      if (!ls.length) { F.err = "e_frases"; return pintarInicio(el); }
      nuevaEscena({h: "doblaje-texto", v, titulo: f.titulo.value.trim() || "YouTube", idioma: lg(), lineas: ls, inicio: leerMMSS(f.desde.value), fin: leerMMSS(f.hasta.value), origen: ""});
      if (location.hash.slice(1) === "doblaje-texto") pintarEstudio(el); else location.hash = "doblaje-texto";
      return;
    }
    if (location.hash.slice(1) === "doblaje-" + v) { D = null; render(el); } else location.hash = "doblaje-" + v;
  };
  el.querySelector("#dbsform").onsubmit = e => { e.preventDefault(); F.v = idVideo(f.url.value) || F.v; buscar(el, e.target.q.value.trim()); };
  listaInicio(el);
}
async function listaInicio(el) {
  /* tus doblajes (en este aparato), escenas del profe y enlace a la votación */
  const [esc_, tomas] = await Promise.all([escenasLocales(), todasTomas()]);
  const n = {}; for (const t of tomas) n[t.k] = (n[t.k] || 0) + 1;
  const box = el.querySelector("#dbmios"); if (!box || !document.body.contains(box)) return;
  const mias = esc_.filter(e => n[e.k]).slice(0, 12);
  if (mias.length) box.innerHTML = `<h2>${T("tus")}</h2><ul class="cnrec">${mias.map(e => `<li><a href="#doblaje-l-${esc(e.k)}"><img src="https://i.ytimg.com/vi/${esc(e.v)}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span>${esc(e.titulo)}</span><small class="dbn">🎙️ ${T1("tomas_n", {n: n[e.k]})}</small></a></li>`).join("")}</ul>`;
  if (!C() || !C().usuario || !(await servidor())) return;
  const r = await C().api("avisos").catch(() => ({ok: false}));
  if (!document.body.contains(box)) return;
  if (r.ok && r.j) {
    const cl = el.querySelector("#dbclasel"); if (cl && (r.j.clase || r.j.rol !== "alumno")) cl.hidden = false;
    const ds = (r.j.deberes || []).filter(d => d.doblaje && d.cancion);
    const pb = el.querySelector("#dbprofe");
    if (ds.length && pb) pb.innerHTML = `<h2>${T("profe_esc")}</h2><ul class="dbdeb">${ds.map(d => `<li><a class="btn" href="#doblaje-e-${esc(d.cancion)}">🎬 ${esc(d.titulo || "")}</a>${d.nota ? `<small>${esc(d.nota)}</small>` : ""}</li>`).join("")}</ul>`;
  }
}
/* buscar letras por nombre (LRCLIB): por el servidor, o directamente desde el navegador si no hay servidor */
let RES = [];
async function buscar(el, q) {
  const box = el.querySelector("#dbsres"); if (!box || q.length < 2) return;
  F.q = q; box.innerHTML = `<p class="small">${T("buscando")}</p>`; RES = [];
  try {
    if (await servidor()) { const r = await C().api("canciones?q=" + encodeURIComponent(q)); RES = r.ok ? r.j.resultados || [] : []; }
    else {
      const r = await fetch("https://lrclib.net/api/search?q=" + encodeURIComponent(q)); const j = r.ok ? await r.json() : [];
      RES = (Array.isArray(j) ? j : []).filter(x => !x.instrumental && (x.syncedLyrics || x.plainLyrics)).sort((a, b) => !!b.syncedLyrics - !!a.syncedLyrics).slice(0, 5)
        .map(x => ({id: x.id, titulo: `${x.artistName || ""} - ${x.trackName || ""}`, dur: x.duration || 0, sincronizada: !!x.syncedLyrics, lineas: parseFrases(x.syncedLyrics || x.plainLyrics)})).filter(c => c.lineas.length >= 2);
    }
  } catch (e) { RES = []; }
  if (!document.body.contains(box)) return;
  box.innerHTML = RES.length ? `<ul class="cnres">${RES.map((c, i) => `<li><span><b>${esc(c.titulo)}</b><small>${c.dur ? mmss(c.dur) : ""}${c.sincronizada ? "" : " · " + T("sinsync")}</small></span><button type="button" class="btn" data-db="usarres" data-i="${i}">${T("usar")}</button></li>`).join("")}</ul>` : `<p class="cnerr">${T("sinres")}</p>`;
}
function usarResultado(i) {
  const c = RES[i]; if (!c) return;
  const v = idVideo((document.getElementById("dburl") || {}).value) || F.v;
  if (!v) { F.err = "e_enlace"; return pintarInicio(app()); }
  nuevaEscena({h: "doblaje-texto", v, titulo: c.titulo, idioma: lg(), lineas: c.lineas, origen: "LRCLIB"});
  if (location.hash.slice(1) === "doblaje-texto") pintarEstudio(app()); else location.hash = "doblaje-texto";
}

/* ---------- estudio de doblaje ---------- */
function lineaHTML(l, i) {
  const yo = D.yo, otro = yo && l.who && l.who !== yo;
  return `<li data-li="${i}" class="${otro ? "dbotro" : ""}">${l.who ? `<span class="dbwho" style="--w:${colorDe(l.who)}">${esc(l.who)}</span>` : ""}<span class="dbx">${esc(l.x)}</span></li>`;
}
function pintarEstudio(el) {
  const sync = tiemposOK(), ws = quienes(), clase = !!D.clase;
  el.innerHTML = `<section class="cn cnplay db">
    <div class="cnhead"><a class="cnback" href="${clase ? "#doblaje-clase" : "#doblaje"}">${clase ? "← " + T1("votacion") : T1("volver")}</a>${D.deber ? `<span class="cntag">${T("deber")}</span>` : ""}
      <h1>${esc(D.titulo)}</h1>${clase ? `<p class="cnnote">${T("de", {u: D.clase.autor})} · ${esc(fecha(D.clase.creado))}</p>` : ""}${D.origen ? `<p class="cnnote">${esc(D.origen)}</p>` : ""}</div>
    <div class="cngrid">
      <div class="cnleft"><div class="cnstick">
        <div class="cnvid dbvid"><div id="dbyt"></div><div class="dbsub" id="dbsub" aria-hidden="true"></div></div>
        <div class="cnbar" id="dbbar"></div>
        <p class="cnmsg" id="dbmsg" aria-live="polite"></p></div>
        ${clase ? `<div id="dbvoto"></div>` : `<div id="dbctl"></div>
        <div id="dbtomas" class="dbtomas"></div>
        <div id="dbprof"></div>`}
      </div>
      <div class="cnright">
        <ol class="cnlyr dblyr" id="dblyr">${D.lineas.map(lineaHTML).join("")}</ol>
      </div>
    </div></section>`;
  root = el.querySelector(".db");
  const alto = (document.querySelector(".top") || {}).offsetHeight || 58, stick = root.querySelector(".cnstick");
  root.style.setProperty("--cntop", alto + "px");
  if (stick && alto + stick.offsetHeight > innerHeight * 0.72) root.classList.add("cnflat");
  barra(); msg(D.msg ? null : sync ? "m_listo" : "m_sintiempos", null, D.msg || null);
  controles(); ponerVideo();
  if (clase) pintarVoto(); else { pintarTomas(); profe(); }
}
function controles() {
  const box = document.getElementById("dbctl"); if (!box || !D) return;
  const sync = tiemposOK(), ws = quienes();
  box.innerHTML = `${sync ? `<div class="cnadj"><small>${T("ajuste")}</small><button type="button" class="btn" data-db="aj" data-d="-0.25">${T("antes")}</button><span id="dbadjv">${ajTxt()}</span><button type="button" class="btn" data-db="aj" data-d="0.25">${T("despues")}</button></div>` : ""}
    <details class="cnpaste dbtrozo"><summary>${T("trozo")}</summary><p id="dbrango" class="small">${rangoTxt()}</p>
      <p class="dbbtns"><button type="button" class="btn" data-db="ini">⏮️ ${T("inicio_aqui")}</button><button type="button" class="btn" data-db="finaqui">⏭️ ${T("fin_aqui")}</button>${sync ? `<button type="button" class="btn" data-db="marcar">${T("marcar")}</button>` : ""}</p></details>
    ${ws.length > 1 ? `<div class="cnlvrow" role="group" aria-label="${esc(tl("yo", lg()))}"><small class="dbyo">${T("yo")}:</small>${["", ...ws].map(w => `<button type="button" class="cnlv sm${D.yo === w ? " on" : ""}" data-db="yo" data-w="${esc(w)}" aria-pressed="${D.yo === w}">${w ? esc(w) : T("todos")}</button>`).join("")}</div>` : ""}`;
}
const ajTxt = () => D.ajuste ? (D.ajuste > 0 ? "+" : "") + D.ajuste.toFixed(2).replace(/0$/, "") + " s" : "0 s";
const rangoTxt = () => T("escena_de", {a: mmss(D.inicio), b: finEscena() ? mmss(finEscena()) : tl("todo", lg())});
function barra() {
  const b = document.getElementById("dbbar"); if (!b) return;
  if (D.clase) { b.innerHTML = modo ? `<button type="button" class="btn main" data-db="parar" ${IBA("parar")}>${IB("parar")}</button>` : `<button type="button" class="btn main" data-db="verclase">▶️ ${T1("ver").replace(/^\S+\s/, "")}</button><button type="button" class="btn" data-db="orig" ${IBA("orig")}>${IB("orig")}</button>`; return; }
  if (modo === "marcar") {
    const n = marcaI + 1;
    b.innerHTML = `<button type="button" class="btn main dbbig" data-db="marca" id="dbmarca">${esc(tl("sig", lg(), {n}))}</button><button type="button" class="btn" data-db="deshacer">${T1("deshacer")}</button><button type="button" class="btn" data-db="parar" ${IBA("parar")}>${IB("parar")}</button>`;
    return;
  }
  if (modo) { b.innerHTML = `<button type="button" class="btn main${modo === "rec" ? " dbrec" : ""}" data-db="parar" ${IBA("parar")}>${IB("parar")}</button>`; return; }
  const ult = TOMAS[0];
  b.innerHTML = `<button type="button" class="btn" data-db="orig" ${IBA("orig")}>${IB("orig")}</button>
    <button type="button" class="btn main dbrecb" data-db="grabar" ${IBA("grabar")}>${IB("grabar")}</button>
    ${ult ? `<button type="button" class="btn" data-db="ver" data-id="${esc(ult.id)}" ${IBA("verdob")}>${IB("verdob")}</button>` : ""}
    ${!tiemposOK() ? `<button type="button" class="btn" data-db="marcar" ${IBA("marcar")}>${IB("marcar")}</button>` : ""}`;
}
function msg(k, v, raw) {
  const m = document.getElementById("dbmsg"); const t = raw != null ? raw : k ? TB(k, v) : "";
  if (D) D.msg = raw != null ? raw : k && /^m_(grabado|marcado|corto|nomic|norec)$/.test(k) ? t : "";
  if (m) m.innerHTML = t;
}

/* ---------- frases a su tiempo ---------- */
let curLi = -2;
function lineaEn(t) {
  if (!D || !tiemposOK()) return -1;
  const a = t - D.ajuste;
  for (let i = D.lineas.length - 1; i >= 0; i--) { const l = D.lineas[i]; if (a >= l.t) return a < l.t + Math.max(l.d || 0, 0.5) + 0.25 ? i : -1; }
  return -1;
}
function marcarLinea(i) {
  if (i === curLi || !root) return; curLi = i;
  root.querySelectorAll("#dblyr li.cur").forEach(x => x.classList.remove("cur"));
  const sub = document.getElementById("dbsub");
  if (i < 0) { if (sub) sub.innerHTML = ""; return; }
  const li = root.querySelector(`#dblyr li[data-li="${i}"]`);
  if (li) { li.classList.add("cur"); const box = root.querySelector("#dblyr"), r = li.getBoundingClientRect();
    if (getComputedStyle(box).overflowY === "auto") box.scrollTop = li.offsetTop - box.clientHeight / 3;
    else if (r.top < innerHeight * 0.45 || r.bottom > innerHeight - 20) { const y = scrollY + r.top - innerHeight * 0.55; scrollTo({top: Math.max(0, y), behavior: "smooth"}); } }
  const l = D.lineas[i];
  if (sub && modo) sub.innerHTML = `<span${l.who ? ` style="--w:${colorDe(l.who)}"` : ""}>${l.who ? `<b>${esc(l.who)}</b> ` : ""}${esc(l.x)}</span>`;
}
function tick() {
  if (!player || !D) return;
  let t = 0; try { t = player.getCurrentTime() || 0; } catch (e) { return; }
  if (modo === "marcar") { if (finEscena() && t >= finEscena() + 1) terminarMarcar(); return; }
  marcarLinea(modo || (player.getPlayerState && player.getPlayerState() === 1) ? lineaEn(t) : curLi);
  const fin = viendo ? viendo.t0 + viendo.dur : finEscena();
  if (modo && fin && t >= fin) { if (modo === "rec") return pararGrabar(); return acabar(); }
  if (modo === "play" && audioEl && !audioEl.paused) {   /* corregir el desfase entre el vídeo y la voz */
    const want = t - viendo.t0; if (want >= 0 && Math.abs(audioEl.currentTime - want) > 0.35) { try { audioEl.currentTime = want; } catch (e) {} }
  }
}

/* ---------- YouTube ---------- */
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
let alEmpezar = null;   /* qué hacer cuando el vídeo empieza a sonar de verdad (grabar o poner la voz) */
async function ponerVideo() {
  const ok = await cargarYT(), mio = D;
  if (!D || D !== mio || !root || !document.getElementById("dbyt")) return;
  if (!ok) return sinVideo();
  try {
    player = new YT.Player("dbyt", {videoId: D.v, width: "100%", height: "100%",
      playerVars: {playsinline: 1, rel: 0, modestbranding: 1, cc_load_policy: 0, iv_load_policy: 3, disablekb: 1, start: Math.floor(D.inicio || 0), origin: location.origin && location.origin !== "null" ? location.origin : undefined},
      events: {
        onReady: () => { try { player.unloadModule && player.unloadModule("captions"); } catch (e) {} },
        onStateChange: e => {
          if (e.data === 1) { try { player.unloadModule && player.unloadModule("captions"); } catch (x) {} if (alEmpezar) { const f = alEmpezar; alEmpezar = null; f(); } }
          if (e.data === 0 && modo) { if (modo === "rec") pararGrabar(); else if (modo === "marcar") terminarMarcar(); else acabar(); }
          if (e.data === 2 && modo === "play" && audioEl) { try { audioEl.pause(); } catch (x) {} }
          if (e.data === 1 && modo === "play" && audioEl && audioEl.paused && viendo) { try { audioEl.currentTime = Math.max(0, player.getCurrentTime() - viendo.t0); audioEl.play(); } catch (x) {} }
        },
        onError: () => sinVideo()
      }});
  } catch (e) { return sinVideo(); }
  clearInterval(timer); timer = setInterval(tick, 100);
}
function sinVideo() {
  const v = root && root.querySelector(".cnvid"); if (!v || !D) return;
  v.outerHTML = `<div class="cnnovid"><p>${T("sinvideo")} <a href="https://www.youtube.com/watch?v=${esc(D.v)}" target="_blank" rel="noopener">${T("abriryt")} ↗</a></p></div>`;
  player = null;
}
function irA(t, sonido) {
  try { if (sonido) player.unMute(); else player.mute(); player.seekTo(Math.max(0, t), true); player.playVideo(); } catch (e) {}
}

/* ---------- escuchar el original ---------- */
function original() {
  if (!player) return;
  pararTodo(); modo = "orig"; curLi = -2; barra(); msg("m_orig");
  irA(D.inicio, true);
}
function acabar() {
  const era = modo;
  pararTodo();
  try { if (player) { player.pauseVideo(); player.unMute(); } } catch (e) {}
  barra(); marcarLinea(-1);
  if (era === "orig" || era === "play") msg(D.clase ? "" : tiemposOK() ? "m_listo" : "m_sintiempos");
}

/* ---------- grabar ---------- */
const TIPOS = ["audio/webm;codecs=opus", "audio/mp4;codecs=mp4a.40.2", "audio/mp4", "audio/ogg;codecs=opus", "audio/webm"];
const puedeGrabar = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
async function grabar() {
  if (!player) return;
  if (!puedeGrabar()) return msg("m_norec");
  pararTodo(); msg("m_mic");
  try { stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1}}); }
  catch (e) { stream = null; return msg("m_nomic"); }
  if (!D || !root) { pararTodo(); return; }
  /* cuenta atrás con el vídeo parado al principio de la escena */
  modo = "cuenta"; barra(); msg("m_cuenta");
  try { player.mute(); player.seekTo(D.inicio, true); player.pauseVideo(); } catch (e) {}
  const vid = root.querySelector(".dbvid"); let n = 3;
  const o = document.createElement("div"); o.id = "dbcount"; o.className = "dbcount"; o.textContent = n; vid && vid.appendChild(o);
  cuentaT = setInterval(() => {
    n--; if (n > 0) { o.textContent = n; return; }
    clearInterval(cuentaT); cuentaT = null; o.remove();
    if (modo !== "cuenta") return;
    empezarGrabacion();
  }, 800);
}
function empezarGrabacion() {
  const tipo = TIPOS.find(t => { try { return MediaRecorder.isTypeSupported(t); } catch (e) { return false; } }) || "";
  try { rec = new MediaRecorder(stream, {...(tipo ? {mimeType: tipo} : {}), audioBitsPerSecond: 32000}); }
  catch (e) { try { rec = new MediaRecorder(stream); } catch (x) { pararTodo(); return msg("m_norec"); } }
  chunks = []; const r = rec;
  r.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  r.onstop = () => tomaHecha(r);
  modo = "rec"; curLi = -2; barra(); msg("m_grabando");
  root && root.classList.add("dbgrabando");
  alEmpezar = () => { try { t0 = player.getCurrentTime() || D.inicio; r.start(250); r._t = performance.now(); } catch (e) { pararTodo(); msg("m_norec"); } };
  irA(D.inicio, false);
}
function pararGrabar() {
  if (modo !== "rec") return;
  root && root.classList.remove("dbgrabando");
  try { player.pauseVideo(); } catch (e) {}
  alEmpezar = null;
  if (rec && rec.state !== "inactive") { try { rec.requestData && rec.requestData(); } catch (e) {} rec.stop(); }
  else { pararTodo(); barra(); }
  modo = "guardando";
}
async function tomaHecha(r) {
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  root && root.classList.remove("dbgrabando");
  const cancel = r._cancel, dur = r._t ? (performance.now() - r._t) / 1000 : 0;
  modo = ""; rec = null;
  if (cancel || !D) return;
  const blob = new Blob(chunks, {type: (r.mimeType || "audio/webm").split(";")[0] === "audio/mp4" ? "audio/mp4" : r.mimeType || "audio/webm"}); chunks = [];
  if (dur < 1 || blob.size < 800) { barra(); return msg("m_corto"); }
  const t = {id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), k: D.k, blob, mime: blob.type || r.mimeType || "audio/webm", t0, dur, creado: Date.now(), ajuste: D.ajuste};
  await guardarEscena({k: D.k, v: D.v, titulo: D.titulo, idioma: D.idioma, lineas: D.lineas, inicio: D.inicio, fin: D.fin, ajuste: D.ajuste, escena: D.escena, deber: D.deber, d: Date.now()});
  await guardarToma(t);
  /* solo se guardan las últimas tomas de cada escena */
  const ts = await tomasDe(D.k);
  for (const x of ts.slice(MAX_TOMAS)) await borrarToma(x.id);
  TOMAS = ts.slice(0, MAX_TOMAS);
  premiar();
  barra(); msg("m_grabado"); pintarTomas();
}
function premiar() {
  if (xpDado >= 3) return;
  xpDado++;
  xp({n: 8, xp: 8, src: "juego", juego: "doblaje"});
  const S = st().S;
  if (D.escena && S.g) {   /* deberes del profe: queda hecho (el profe lo ve en su panel) */
    S.g.cn = S.g.cn || {};
    const o = S.g.cn[D.escena] || {n: 0, best: 0, bp: 0};
    o.n++; o.best = 3; o.last = 3; o.bp = 100; o.t = D.titulo; o.d = Date.now();
    S.g.cn[D.escena] = o; try { L().save(); } catch (e) {}
  }
}

/* ---------- ver un doblaje: vídeo en silencio + tu voz ---------- */
function verToma(t) {
  if (!player || !t) return;
  pararTodo();
  if (!audioEl) { audioEl = new Audio(); audioEl.preload = "auto"; }
  if (audioEl._src) URL.revokeObjectURL(audioEl._src);
  audioEl._src = t.url || URL.createObjectURL(t.blob); audioEl.src = audioEl._src;
  audioEl.onerror = () => { if (modo === "play") { acabar(); msg("e_audio"); } };
  audioEl.onended = () => { if (modo === "play") setTimeout(() => { if (modo === "play") acabar(); }, 600); };
  viendo = {t0: t.t0, dur: t.dur}; modo = "play"; curLi = -2; barra(); msg(D.clase ? "" : "m_viendo");
  if (t.ajuste != null && !D.clase) D.ajuste = t.ajuste;
  alEmpezar = () => { try { audioEl.currentTime = Math.max(0, player.getCurrentTime() - t.t0); audioEl.play().catch(() => {}); } catch (e) {} };
  try { audioEl.load(); audioEl.play().then(() => audioEl.pause()).catch(() => {}); } catch (e) {}   /* desbloquea el audio con el toque */
  irA(t.t0, false);
}

/* ---------- marcar los tiempos tocando ---------- */
function empezarMarcar() {
  if (!player) return;
  pararTodo(); modo = "marcar"; marcaI = 0;
  D.lineas.forEach(l => { l.t = 0; l.d = 0; }); D.ajuste = 0;
  barra(); msg("m_marca");
  irA(D.inicio, true);
}
function marca() {
  if (modo !== "marcar" || !player) return;
  let t = 0; try { t = player.getCurrentTime(); } catch (e) {}
  const l = D.lineas[marcaI]; if (!l) return;
  l.t = Math.max(0.01, t - 0.15);
  if (marcaI > 0) D.lineas[marcaI - 1].d = Math.max(0.4, l.t - D.lineas[marcaI - 1].t);
  marcarLineaForzada(marcaI);
  marcaI++;
  if (marcaI >= D.lineas.length) {
    if (!finEscena()) { setTimeout(() => terminarMarcar(), 3500); l.d = 3.5; }
    else l.d = Math.max(0.5, Math.min(8, finEscena() - l.t));
    const b = document.getElementById("dbmarca"); if (b) b.disabled = true;
    return;
  }
  barra();
}
function marcarLineaForzada(i) { curLi = -2; const m = modo; modo = "orig"; marcarLinea(i); modo = m; }
function deshacer() {
  if (modo !== "marcar" || marcaI === 0) return;
  marcaI--; D.lineas[marcaI].t = 0; D.lineas[marcaI].d = 0;
  const t = marcaI > 0 ? D.lineas[marcaI - 1].t : D.inicio;
  try { player.seekTo(Math.max(0, t - 0.5), true); } catch (e) {}
  barra(); marcarLineaForzada(marcaI - 1);
}
function terminarMarcar() {
  if (modo !== "marcar") return;
  const ok = D.lineas.every(l => l.t > 0);
  if (ok) {
    const u = D.lineas[D.lineas.length - 1]; if (!u.d) u.d = 3.5;
    if (!finEscena()) D.fin = u.t + u.d + 0.8;
    if (D.inicio > D.lineas[0].t) D.inicio = Math.max(0, D.lineas[0].t - 1.5);
  } else D.lineas.forEach(l => { l.t = 0; l.d = 0; });
  modo = "";
  try { player.pauseVideo(); } catch (e) {}
  D.msg = ""; repintar();
  msg(ok ? "m_marcado" : "m_sintiempos");
}
/* volver a pintar los controles y las frases sin tocar el vídeo (un iframe que se mueve se recarga) */
function repintar() {
  controles(); barra(); curLi = -2;
  const ol = document.getElementById("dblyr"); if (ol) ol.innerHTML = D.lineas.map(lineaHTML).join("");
}

/* ---------- tus tomas ---------- */
let enviadas = {}; try { enviadas = JSON.parse(localStorage.getItem("lyaDobEnv") || "{}"); } catch (e) {}
const guardarEnv = () => { try { localStorage.setItem("lyaDobEnv", JSON.stringify(enviadas)); } catch (e) {} };
async function pintarTomas() {
  const box = document.getElementById("dbtomas"); if (!box || !D) return;
  TOMAS = (await tomasDe(D.k)).slice(0, MAX_TOMAS);
  if (!document.body.contains(box)) return;
  barra();
  const puede = C() && C().usuario;
  box.innerHTML = `<h2>${T("tomas")}</h2>${TOMAS.length ? `<ul class="dbtl">${TOMAS.map((t, i) => `<li><span><b>#${TOMAS.length - i}</b> ${esc(fecha(t.creado))} · ${T1("dur", {s: Math.round(t.dur)})}</span>
      <span class="dbtb"><button type="button" class="btn" data-db="ver" data-id="${esc(t.id)}">${T1("ver")}</button>
      ${enviadas[t.id] ? `<small class="cnok">${T1("mandada")}</small>` : puede ? `<button type="button" class="btn" data-db="enviar" data-id="${esc(t.id)}">${T1("mandar")}</button>` : ""}
      <button type="button" class="btn" data-db="borrart" data-id="${esc(t.id)}" title="${esc(tl("borrar_t", lg()))}" aria-label="${esc(tl("borrar_t", lg()))}">${T1("borrar")}</button></span></li>`).join("")}</ul>` : `<p class="small">${T("sintomas")}</p>`}
    <p class="small">${sinLocal ? T("nolocal") : T("soloaqui")}</p>${!puede && TOMAS.length ? `<p class="small">${T("e_cuenta")}</p>` : ""}<p class="cnerr" id="dbterr" role="alert" hidden></p>`;
}
const aBase64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1] || ""); r.onerror = rej; r.readAsDataURL(blob); });
async function enviar(id, b) {
  const t = TOMAS.find(x => x.id === id), er = document.getElementById("dbterr"); if (!t) return;
  const fallo = k => { if (er) { er.hidden = false; er.innerHTML = T(k); } if (b) { b.disabled = false; b.textContent = tl("mandar", lg()); } };
  if (!C() || !C().usuario || !(await servidor())) return fallo("e_cuenta");
  if (b) { b.disabled = true; b.textContent = tl("mandando", lg()); }
  if (er) er.hidden = true;
  let audio = ""; try { audio = await aBase64(t.blob); } catch (e) { return fallo("e_mandar"); }
  if (audio.length > 1200000) return fallo("e_grande");
  const r = await C().api("votos", "POST", {dob: "enviar", audio, mime: t.mime, t0: t.t0, dur: t.dur, v: D.v, titulo: D.titulo, idioma: D.idioma, inicio: D.inicio, fin: D.fin, ajuste: t.ajuste ?? D.ajuste, lineas: D.lineas, escena: D.escena}).catch(() => ({ok: false, j: {}}));
  if (!r.ok) { const e = (r.j || {}).error; return fallo(e === "sin_clase" ? "e_sinclase" : e === "audio_grande" ? "e_grande" : r.code === 401 ? "e_cuenta" : "e_mandar"); }
  for (const x of TOMAS) if (enviadas[x.id]) delete enviadas[x.id];
  enviadas[id] = r.j.id; guardarEnv();
  await pintarTomas();
  if (r.j.sustituido) msg("sustituida");
}

/* ---------- profe: mandar la escena a la clase ---------- */
async function profe() {
  const box = document.getElementById("dbprof"); if (!box || D.deber || !C() || !C().usuario) return;
  if (!(await servidor())) return;
  const r = await C().api("canciones?clases=1").catch(() => ({ok: false}));
  if (!r.ok || !document.body.contains(box)) return;
  const {admin, clases} = r.j;
  box.innerHTML = `<details class="cnteach"><summary>${T("mandar_cl")}</summary>${!admin && !clases.length ? `<p class="small">${T("sinclases")}</p>` : `<form id="dbteachf">
    <label>${T("para")}<select name="grupo"><option value="">${T(admin ? "todosal" : "todas")}</option>${clases.map(c => `<option value="${esc(c.id)}">${esc(c.nombre)}</option>`).join("")}</select></label>
    <label>${T("fecha")}<input type="date" name="limite" required value="${hoy(7)}"></label>
    <label>${T("nota")}<input name="nota" maxlength="200"></label>
    <p class="small">${rangoTxt()}</p>
    <p class="cnerr" id="dbtterr" role="alert" hidden></p><button class="btn main" type="submit">${T("mandarb")}</button></form>`}</details>`;
  const f = box.querySelector("#dbteachf"); if (!f) return;
  f.onsubmit = async e => {
    e.preventDefault(); const b = f.querySelector("[type=submit]"), er = f.querySelector("#dbtterr"); b.disabled = true; er.hidden = true;
    const q = await C().api("canciones", "POST", {accion: "asignar", doblaje: true, v: D.v, titulo: D.titulo, idioma: D.idioma, lineas: D.lineas, inicio: D.inicio, fin: D.fin, ajuste: D.ajuste, grupo: f.grupo.value, limite: f.limite.value, nota: f.nota.value}).catch(() => ({ok: false, j: {}}));
    b.disabled = false;
    if (q.ok) f.outerHTML = `<p class="cnok">${T("mandada_cl")}</p>`; else { er.hidden = false; er.innerHTML = T(q.j && q.j.error === "sin_clases" ? "sinclases" : "e_mandar_cl"); }
  };
}

/* ---------- votación de la clase ---------- */
let CL = null;   /* última lista: {grupo, nombre, clases, rol, doblajes} */
async function pintarClase(el, grupo) {
  el.innerHTML = `<section class="cn db"><div class="cnhead"><a class="cnback" href="#doblaje">${T1("volver")}</a><h1>🗳️ ${TB("votacion")}</h1></div><div id="dbcl"><p class="msg">${T("buscando")}</p></div></section>`;
  const box = el.querySelector("#dbcl");
  if (!C() || !C().usuario || !(await servidor())) { box.innerHTML = `<p class="msg">${T("e_clase")}</p>`; return; }
  const r = await C().api("votos?dob=lista" + (grupo ? "&grupo=" + encodeURIComponent(grupo) : "")).catch(() => ({ok: false, j: {}}));
  if (!document.body.contains(box)) return;
  if (!r.ok) { box.innerHTML = `<p class="msg">${T(r.code === 401 ? "e_clase" : "e_red")}</p>`; return; }
  CL = r.j;
  if (!CL.grupo) { box.innerHTML = `<p class="msg">${T("e_sinclase_v")}</p>`; return; }
  pintarListaClase(box);
}
function pintarListaClase(box) {
  const g = {}; for (const d of CL.doblajes) (g[d.esc] = g[d.esc] || []).push(d);
  const grupos = Object.values(g).sort((a, b) => Math.max(...b.map(x => x.creado)) - Math.max(...a.map(x => x.creado)));
  const alumno = CL.rol === "alumno";
  box.innerHTML = `${CL.clases.length > 1 ? `<label class="dblab">${T("clase_de", {c: ""}).replace(/:\s*$/, "")}<select id="dbclsel">${CL.clases.map(c => `<option value="${esc(c.id)}"${c.id === CL.grupo ? " selected" : ""}>${esc(c.nombre)}</option>`).join("")}</select></label>` : `<p class="cnnote">${T("clase_de", {c: CL.nombre})}</p>`}
    ${grupos.length ? grupos.map(ds => { ds.sort((a, b) => b.votos - a.votos || a.creado - b.creado); const max = ds[0].votos;
      return `<article class="dbesc"><div class="dbeh">${ds[0].v ? `<img src="https://i.ytimg.com/vi/${esc(ds[0].v)}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()">` : ""}<h2>${esc(ds[0].titulo)}</h2></div>
        <ul class="dbtl">${ds.map(d => `<li class="${max > 0 && d.votos === max ? "dbwin" : ""}"><span><b>${esc(d.autor)}</b>${max > 0 && d.votos === max ? ` <small class="dbgana">${T1("gana")}</small>` : ""}<small>${esc(fecha(d.creado))} · ${T1("dur", {s: Math.round(d.dur)})} · ${d.votos === 1 ? T1("voto1") : T1("votos", {n: d.votos})}</small></span>
          <span class="dbtb"><a class="btn" href="#doblaje-ver-${esc(d.id)}">${T1("ver")}</a>
          ${alumno ? d.mio ? `<small>${T1("tuyo")}</small>` : `<button type="button" class="btn${d.mivoto ? " main" : ""}" data-db="votar" data-id="${esc(d.id)}" aria-pressed="${d.mivoto}">${d.mivoto ? T1("tuvoto") : T1("votar")}</button>` : ""}
          ${d.mio || !alumno ? `<button type="button" class="btn" data-db="quitar" data-id="${esc(d.id)}">${T1("quitar")}</button>` : ""}</span></li>`).join("")}</ul></article>`; }).join("") : `<p class="msg">${T("sindobs")}</p>`}`;
  const s = box.querySelector("#dbclsel"); if (s) s.onchange = () => pintarClase(app(), s.value);
}
async function votar(id, b, desdeVer) {
  if (b) b.disabled = true;
  const d = desdeVer ? D.clase : CL && CL.doblajes.find(x => x.id === id);
  const r = await C().api("votos", "POST", {dob: "votar", id, quitar: !!(d && d.mivoto)}).catch(() => ({ok: false, j: {}}));
  if (b) b.disabled = false;
  if (!r.ok) return;
  const nuevos = r.j.doblajes || [];
  if (CL) for (const n of nuevos) { const i = CL.doblajes.findIndex(x => x.id === n.id); if (i >= 0) CL.doblajes[i] = n; }
  if (desdeVer) { const n = nuevos.find(x => x.id === id); if (n) D.clase = {...D.clase, ...n}; pintarVoto(); }
  else { const box = document.getElementById("dbcl"); if (box) pintarListaClase(box); }
}
async function quitar(id, b) {
  if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = tl("seguro", lg()); return; }
  b.disabled = true;
  const r = await C().api("votos", "POST", {dob: "borrar", id}).catch(() => ({ok: false}));
  if (r.ok && CL) { CL.doblajes = CL.doblajes.filter(x => x.id !== id); for (const k in enviadas) if (enviadas[k] === id) delete enviadas[k]; guardarEnv(); const box = document.getElementById("dbcl"); if (box) pintarListaClase(box); }
  else b.disabled = false;
}
async function abrirDeClase(el, id, h) {
  if (!C() || !C().usuario || !(await servidor())) { el.innerHTML = `<section class="cn db"><p class="msg">${T("e_clase")}</p></section>`; return; }
  const r = await C().api("votos?dob=ver&id=" + id).catch(() => ({ok: false, j: {}}));
  if (location.hash.slice(1) !== h) return;
  if (!r.ok || !r.j.audio) { el.innerHTML = `<section class="cn db"><p class="msg">${T(r.code === 404 ? "nodob" : "e_red")}</p><p class="msg"><a class="btn" href="#doblaje-clase">← ${T1("votacion")}</a></p></section>`; return; }
  const j = r.j;
  let blob = null; try { const bin = atob(j.audio), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); blob = new Blob([u], {type: j.mime}); } catch (e) {}
  nuevaEscena({h, v: j.v, titulo: j.titulo, idioma: j.idioma, lineas: j.lineas || [], inicio: j.inicio, fin: j.fin, ajuste: j.ajuste});
  D.clase = {id, autor: j.autor, creado: j.creado, votos: j.votos, mivoto: j.mivoto, mio: j.mio, rol: CL ? CL.rol : null, toma: blob ? {id: "c" + id, blob, mime: j.mime, t0: j.t0, dur: j.dur, ajuste: j.ajuste} : null};
  pintarEstudio(el);
}
function pintarVoto() {
  const box = document.getElementById("dbvoto"); if (!box || !D.clase) return;
  const c = D.clase, alumno = !c.rol || c.rol === "alumno";
  box.innerHTML = `<p class="dbvotos">${c.votos === 1 ? T1("voto1") : T1("votos", {n: c.votos})}</p>${c.mio ? `<p class="small">${T1("tuyo")}</p>` : alumno ? `<p><button type="button" class="btn${c.mivoto ? " main" : ""}" data-db="votarver" aria-pressed="${!!c.mivoto}">${c.mivoto ? T1("tuvoto") : T1("votar")}</button></p>` : ""}`;
}

/* ---------- clics ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-db]"); if (!b) return;
  const a = b.dataset.db;
  if (a === "tipo") { F.tipo = b.dataset.t; const f = document.getElementById("dbform"); if (f) { F.v = idVideo(f.url.value) || F.v; F.frases = f.frases.value; F.desde = f.desde.value; F.hasta = f.hasta.value; F.titulo = f.titulo.value; } F.err = ""; return pintarInicio(app()); }
  if (a === "usarres") return usarResultado(+b.dataset.i);
  if (a === "votar") return votar(b.dataset.id, b);
  if (a === "quitar") return quitar(b.dataset.id, b);
  if (!D) return;
  if (a === "orig") return original();
  if (a === "grabar") return grabar();
  if (a === "parar") { if (modo === "rec") return pararGrabar(); if (modo === "marcar") return terminarMarcar(); return acabar(); }
  if (a === "ver") return verToma(TOMAS.find(t => t.id === b.dataset.id));
  if (a === "verclase") return D.clase && D.clase.toma ? verToma(D.clase.toma) : msg("e_audio");
  if (a === "votarver") return votar(D.clase.id, b, true);
  if (a === "marcar") return empezarMarcar();
  if (a === "marca") return marca();
  if (a === "deshacer") return deshacer();
  if (a === "enviar") return enviar(b.dataset.id, b);
  if (a === "borrart") { if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = tl("seguro", lg()); return; } return borrarToma(b.dataset.id).then(() => { delete enviadas[b.dataset.id]; guardarEnv(); pintarTomas(); }); }
  if (a === "aj") { D.ajuste = Math.round((D.ajuste + +b.dataset.d) * 100) / 100; const s = document.getElementById("dbadjv"); if (s) s.textContent = ajTxt(); curLi = -2; return; }
  if (a === "yo") { D.yo = b.dataset.w; root.querySelectorAll('[data-db="yo"]').forEach(x => { const on = x.dataset.w === D.yo; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
    root.querySelectorAll("#dblyr li").forEach(li => { const l = D.lineas[+li.dataset.li]; li.classList.toggle("dbotro", !!(D.yo && l.who && l.who !== D.yo)); }); return; }
  if (a === "ini" || a === "finaqui") {
    let t = 0; try { t = player ? player.getCurrentTime() : 0; } catch (x) {}
    if (a === "ini") { D.inicio = Math.max(0, t); if (finEscena() && D.fin <= D.inicio) D.fin = 0; } else if (t > D.inicio + 1) D.fin = t;
    const r = document.getElementById("dbrango"); if (r) r.innerHTML = rangoTxt(); return;
  }
});
/* tocar una frase: el vídeo va a ese momento (con sonido) */
document.addEventListener("click", e => {
  const li = e.target.closest && e.target.closest("#dblyr li"); if (!li || !D || !player || modo || !tiemposOK()) return;
  const l = D.lineas[+li.dataset.li]; if (!l) return;
  try { player.unMute(); player.seekTo(Math.max(0, l.t + D.ajuste - 0.3), true); player.playVideo(); } catch (x) {}
});
/* espacio / Enter para marcar tiempos con el teclado */
document.addEventListener("keydown", e => { if (modo === "marcar" && (e.key === " " || e.key === "Enter") && !/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ""))) { e.preventDefault(); marca(); } });

window.LYADoblaje = {render, isDub, tab, _test: {parseFrases, idVideo, get D() { return D; }, get modo() { return modo; }, get audio() { return audioEl; }, lineaEn}};
})();
