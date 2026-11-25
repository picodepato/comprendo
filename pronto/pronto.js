/* Próximamente: dos actividades que aún no funcionan, explicadas para que alumnos y profes sepan qué viene.
   1) Lectura con cámara: Tesseract.js (OCR gratis en el navegador, sin IA de pago) lee un cartel, menú o etiqueta
      y la web hace preguntas con reglas sencillas (traducir con el diccionario, buscar una palabra, ordenar una frase).
   2) Doblaje: como Canciones (YouTube); letra de LRCLIB o subtítulos pegados/preparados por el profe; vídeo en silencio
      y el móvil graba tu voz encima. Las grabaciones se quedan en el aparato salvo las que mandas a una votación de clase.
   Ruta: #proximamente. Solo informativo: no guarda nada ni pide cámara ni micrófono. */
(() => {
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const STR = {
  es: {tab: "Próximamente", title: "Próximamente", soon: "Próximamente",
    sub: "Estamos preparando dos actividades nuevas. Todavía no funcionan, pero así es como serán.",
    cam_t: "Lectura con cámara", cam_p: "Lee lo que hay a tu alrededor: carteles, menús, etiquetas…",
    cam_s: ["Apuntas con el móvil a un texto de verdad y haces una foto.",
      "La web lee las letras de la foto. Lo hace dentro de tu móvil con un programa gratis (Tesseract), sin inteligencia artificial de pago.",
      "Con ese texto te hace preguntas: qué significa una palabra (con el diccionario), dónde está una palabra o cómo se ordena una frase.",
      "Las palabras nuevas las puedes guardar en tu diccionario."],
    cam_n: "La foto no se sube a internet: se queda en tu aparato.",
    dob_t: "Doblaje", dob_p: "Pon tu voz a una canción o a una escena de película.",
    dob_s: ["Eliges un vídeo de YouTube, como en Canciones.",
      "Si es una canción, la letra sale sola (LRCLIB). Si es una escena, el profe prepara los subtítulos o los pegas tú.",
      "El vídeo se queda sin sonido y las frases van saliendo a su tiempo.",
      "Tú lees en voz alta y el móvil graba tu voz encima del vídeo. Luego lo escuchas y lo repites si quieres."],
    dob_n: "Tus grabaciones se quedan en tu aparato. Solo salen si tú decides mandar una a una votación de tu clase.",
    how: "Cómo funcionará", back: "Volver al inicio"},
  en: {tab: "Coming soon", title: "Coming soon", soon: "Coming soon",
    sub: "We are getting two new activities ready. They don't work yet, but this is how they will be.",
    cam_t: "Camera reading", cam_p: "Read the things around you: signs, menus, labels…",
    cam_s: ["You point your phone at a real text and take a photo.",
      "The website reads the letters in the photo. It does it inside your phone with a free program (Tesseract), with no paid artificial intelligence.",
      "Then it asks you questions about that text: what a word means (with the dictionary), where a word is, or how to put a sentence in order.",
      "You can save the new words in your dictionary."],
    cam_n: "The photo is not uploaded to the internet: it stays on your device.",
    dob_t: "Dubbing", dob_p: "Put your voice on a song or a film scene.",
    dob_s: ["You choose a YouTube video, like in Songs.",
      "If it's a song, the lyrics appear on their own (LRCLIB). If it's a scene, your teacher prepares the subtitles or you paste them.",
      "The video has no sound and the lines appear at the right time.",
      "You read aloud and the phone records your voice over the video. Then you listen and try again if you want."],
    dob_n: "Your recordings stay on your device. They only leave it if you choose to send one to a class vote.",
    how: "How it will work", back: "Back to the start"},
  ca: {tab: "Properament", title: "Properament", soon: "Properament",
    sub: "Estem preparant dues activitats noves. Encara no funcionen, però així és com seran.",
    cam_t: "Lectura amb càmera", cam_p: "Llegeix el que tens al voltant: cartells, menús, etiquetes…",
    cam_s: ["Apuntes amb el mòbil a un text de veritat i fas una foto.",
      "La web llegeix les lletres de la foto. Ho fa dins del teu mòbil amb un programa gratuït (Tesseract), sense intel·ligència artificial de pagament.",
      "Amb aquest text et fa preguntes: què vol dir una paraula (amb el diccionari), on és una paraula o com s'ordena una frase.",
      "Les paraules noves les pots desar al teu diccionari."],
    cam_n: "La foto no es puja a internet: es queda al teu aparell.",
    dob_t: "Doblatge", dob_p: "Posa la teva veu a una cançó o a una escena de pel·lícula.",
    dob_s: ["Tries un vídeo de YouTube, com a Cançons.",
      "Si és una cançó, la lletra surt sola (LRCLIB). Si és una escena, el profe prepara els subtítols o els enganxes tu.",
      "El vídeo es queda sense so i les frases van sortint al seu moment.",
      "Tu llegeixes en veu alta i el mòbil grava la teva veu damunt del vídeo. Després l'escoltes i ho repeteixes si vols."],
    dob_n: "Les teves gravacions es queden al teu aparell. Només en surten si tu decideixes enviar-ne una a una votació de la classe.",
    how: "Com funcionarà", back: "Tornar a l'inici"}
};
const s1 = (k, lang) => (STR[lang] || STR.en)[k] ?? STR.en[k];
const both = () => { try { return L().both(); } catch (e) { return false; } };
const sub = k => { const {S} = st(); const a = s1(k, S.learn), b = s1(k, S.know); return both() && b !== a ? `<span class="en" style="display:block">${esc(b)}</span>` : ""; };
const TB = k => esc(s1(k, st().S.learn)) + sub(k);
function card(id, icon, color) {
  const {S} = st(), a = s1(id + "_s", S.learn), b = s1(id + "_s", S.know), two = both() && S.know !== S.learn;
  return `<article class="pr-card" style="--c:${color}">
    <div class="pr-head"><span class="pr-ic" aria-hidden="true">${icon}</span><div><h2>${TB(id + "_t")}</h2><p class="pr-p">${TB(id + "_p")}</p></div>
      <span class="pr-badge">🔜 ${esc(s1("soon", S.learn))}</span></div>
    <h3>${TB("how")}</h3>
    <ol class="pr-steps">${a.map((x, i) => `<li>${esc(x)}${two && b[i] !== x ? `<span class="en" style="display:block">${esc(b[i])}</span>` : ""}</li>`).join("")}</ol>
    <p class="pr-note">🔒 ${TB(id + "_n")}</p></article>`;
}
function render(app) {
  const {S} = st();
  app.innerHTML = `<section class="wrap pr"><div class="ghead"><div><h1>🔜 ${esc(s1("title", S.learn))}</h1>${S.know !== S.learn && both() ? `<p class="en">${esc(s1("title", S.know))}</p>` : ""}</div></div>
    <p class="pr-lead">${TB("sub")}</p>
    ${card("cam", "📷", "#4cc9f0")}${card("dob", "🎬", "#ff6b9d")}
    <p><a class="btn" href="#inicio">${esc(s1("back", S.learn))}</a></p></section>`;
}
const isPronto = h => h === "proximamente";
const tab = () => { const {S} = st(); return "🔜 " + esc(s1("tab", S.learn)) + (both() ? `<span class="tk"> · ${esc(s1("tab", S.know))}</span>` : ""); };
window.LYAPronto = {render, isPronto, tab};
})();
