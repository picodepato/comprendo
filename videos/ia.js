/* Vídeos con preguntas: «✨ Proponer preguntas con IA» (sin API de IA, igual que en los concursos).
   1. La web trae los subtítulos del vídeo con sus tiempos (api/canciones?v=…&yt=1). Si YouTube no los da,
      el profe pega la transcripción (en YouTube: «…más» → «Mostrar transcripción», copiar).
   2. Arma un prompt con la transcripción para copiar en cualquier IA (ChatGPT, Claude, Gemini, Copilot…).
   3. Se pega la respuesta y cada pregunta va a su segundo (MOMENTO), ajustado al final de la frase de los subtítulos.
   Lo usa videos/videos.js (window.LYAVideosIA). Pruebas: qa/prueba-videos-ia.mjs. */
(function (raiz) {
const F = () => raiz.LYAFormatoConcurso || (typeof require !== "undefined" ? require("../concursos/formato.js") : null);
const mmss = s => { s = Math.max(0, Math.floor(+s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = String(s % 60).padStart(2, "0"); return h ? `${h}:${String(m).padStart(2, "0")}:${x}` : `${m}:${x}`; };
const aSeg = s => String(s).split(":").map(Number).reduce((a, n) => a * 60 + n, 0);
const ENT = {amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " "};
const limpiar = x => String(x || "").replace(/<[^>]+>/g, "").replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e.toLowerCase()] ?? m).replace(/\[(?:música|music|música|aplausos|applause|risas|laughter)\]/gi, "").replace(/\s+/g, " ").trim();

/* transcripción pegada → [{t, d, x}]. Entiende SRT/VTT, «[1:23] texto», «1:23 texto» y la de YouTube (el tiempo en su línea y el texto debajo) */
function transcripcion(txt) {
  const L = [], ls = String(txt || "").replace(/\r/g, "").split("\n").map(l => l.trim());
  const RE_SRT = /^(\d{1,2}:)?(\d{1,2}):(\d{2})[.,]\d{1,3}\s*-->\s*(\d{1,2}:)?(\d{1,2}):(\d{2})/;
  const RE_T = /^\[?\(?((?:\d{1,2}:)?\d{1,2}:\d{2})\)?\]?\s*[-–:]?\s*(.*)$/;
  for (let i = 0; i < ls.length; i++) {
    const l = ls[i]; let m;
    if (!l || /^WEBVTT|^\d+$/.test(l)) continue;
    if ((m = l.match(RE_SRT))) {
      const t = (+(m[1] || "0:").slice(0, -1)) * 3600 + +m[2] * 60 + +m[3], f = (+(m[4] || "0:").slice(0, -1)) * 3600 + +m[5] * 60 + +m[6];
      const x = []; while (i + 1 < ls.length && ls[i + 1]) x.push(ls[++i]);
      if (x.length) L.push({t, d: Math.max(0, f - t), x: limpiar(x.join(" "))});
      continue;
    }
    if ((m = l.match(RE_T))) {
      let x = m[2];
      if (!x) { const y = []; while (i + 1 < ls.length && ls[i + 1] && !RE_T.test(ls[i + 1])) y.push(ls[++i]); x = y.join(" "); }
      x = limpiar(x); if (x) L.push({t: aSeg(m[1]), d: 0, x});
      continue;
    }
    if (L.length) L[L.length - 1].x += " " + limpiar(l);  /* una línea sin tiempo: sigue la frase anterior */
  }
  L.sort((a, b) => a.t - b.t);
  for (let i = 0; i < L.length; i++) if (!L[i].d) L[i].d = Math.min(8, Math.max(1, ((L[i + 1] || {}).t ?? L[i].t + 4) - L[i].t));
  return L.filter(l => l.x);
}

/* subtítulos → texto corto para el prompt: frases juntas en trozos de unos 10 s, «[m:ss] texto» */
function textoPrompt(subs) {
  const out = []; let act = null;
  for (const s of subs) {
    const x = limpiar(s.x); if (!x) continue;
    if (act && s.t - act.t < 10 && act.x.length + x.length < 220) act.x += " " + x;
    else { if (act) out.push(act); act = {t: s.t, x}; }
  }
  if (act) out.push(act);
  return out.map(a => `[${mmss(a.t)}] ${a.x}`).join("\n");
}

const IDIOMAS = {es: "español", en: "inglés (English)", ca: "catalán (català)", fr: "francés", de: "alemán", it: "italiano", pt: "portugués"};
function prompt(op = {}) {
  const n = Math.min(20, Math.max(3, +op.n || 8));
  const idioma = op.idioma && IDIOMAS[op.idioma] ? `en ${IDIOMAS[op.idioma]}` : "en el mismo idioma que el vídeo";
  const nivel = op.nivel ? `\n- Nivel de los alumnos: ${op.nivel}. Adapta el vocabulario y la dificultad.` : "";
  const extra = op.extra ? `\n- Instrucciones extra: ${op.extra}` : "";
  return `Eres un profesor que prepara un vídeo con preguntas para su clase: el vídeo se para en cada pregunta y los alumnos contestan antes de seguir viéndolo.

Te paso la transcripción del vídeo${op.titulo ? ` «${op.titulo}»` : ""}, con el minuto de cada frase entre corchetes. Crea ${n} preguntas tipo test sobre lo que se dice en el vídeo, repartidas a lo largo de todo el vídeo y en orden.

Reglas:
- MOMENTO es el minuto en que el vídeo YA ha dicho la respuesta: copia el tiempo de la línea de la transcripción donde se dice (formato m:ss). Nunca pongas una pregunta antes de que el vídeo dé la respuesta.
- Deja al menos 20 segundos entre una pregunta y la siguiente.
- Escribe las preguntas y las respuestas ${idioma}.
- Cada pregunta tiene 3 o 4 respuestas y solo UNA es correcta. Las incorrectas deben ser creíbles. Cambia de sitio la correcta.
- Preguntas cortas (máximo 200 caracteres) y respuestas cortas (máximo 90 caracteres), porque se leen en un móvil.${nivel}${extra}
- Usa SOLO lo que se dice en la transcripción. No inventes.

Responde ÚNICAMENTE con las preguntas dentro de un bloque de código, sin explicaciones ni negritas, con este formato EXACTO:

\`\`\`
TÍTULO: (un título corto)
---
MOMENTO: 1:23
PREGUNTA: (texto de la pregunta)
A) (respuesta)
B) (respuesta)
C) (respuesta)
D) (respuesta)
CORRECTA: (letra de la correcta)
---
MOMENTO: 2:05
PREGUNTA: …
A) …
B) …
C) …
CORRECTA: …
---
\`\`\`

Transcripción:
${op.texto || ""}`;
}

/* respuesta de la IA → {titulo, preguntas: [{t, p, o, c, s}], sinMomento: n, avisos}. subs (opcional) ajusta cada momento al final de su frase */
const RE_MOM = /^[\s*#_`>-]*(?:momento|minuto|moment|timestamp|time ?stamp|minute|time in (?:the )?video|tiempo del v[ií]deo)[\s*_]*[:：][\s*_]*\[?\(?((?:\d{1,2}:)?\d{1,2}:\d{2})/i;
function leer(texto, subs, durac) {
  const ls = String(texto || "").replace(/\r/g, "").split("\n");
  const trozos = [{t: null, ls: []}];
  for (const l of ls) { const m = l.match(RE_MOM); if (m) trozos.push({t: aSeg(m[1]), ls: []}); else trozos[trozos.length - 1].ls.push(l); }
  const fmt = F(), todo = fmt.leer(texto), preguntas = [], avisos = [...todo.avisos];
  let sinMomento = 0;
  if (trozos.length === 1) {
    /* sin MOMENTO: se busca un «1:23» en la pregunta; si no, se reparten por el vídeo */
    todo.preguntas.forEach((q, i) => {
      const m = q.p.match(/[(\[]?\b((?:\d{1,2}:)?\d{1,2}:\d{2})\b[)\]]?/);
      let t = m ? aSeg(m[1]) : null;
      if (t == null) { sinMomento++; t = durac ? Math.round(durac * (i + 1) / (todo.preguntas.length + 1)) : (i + 1) * 30; }
      preguntas.push({...q, p: m ? q.p.replace(m[0], "").replace(/\s+/g, " ").trim() : q.p, t});
    });
  } else {
    for (const tr of trozos.slice(1)) {
      const r = fmt.leer(tr.ls.join("\n"));
      r.preguntas.forEach((q, i) => preguntas.push({...q, t: tr.t + i}));
    }
  }
  if (subs && subs.length) for (const q of preguntas) {
    /* al final de la frase que empieza en ese momento (la IA copia el inicio de la línea) */
    let k = -1; for (let i = 0; i < subs.length; i++) if (subs[i].t <= q.t + 0.5) k = i; else break;
    if (k >= 0) { const s = subs[k]; let fin = s.t + Math.min(8, s.d || 3); while (k + 1 < subs.length && subs[k + 1].t < fin && subs[k + 1].t - s.t < 8) fin = Math.max(fin, subs[++k].t + Math.min(4, subs[k].d || 2)); q.t = Math.max(q.t, Math.round(fin * 10) / 10); }
  }
  if (durac) for (const q of preguntas) q.t = Math.min(q.t, Math.max(0, durac - 1));
  preguntas.sort((a, b) => a.t - b.t);
  return {titulo: todo.titulo, preguntas: preguntas.slice(0, 40), sinMomento, avisos};
}

const API = {transcripcion, textoPrompt, prompt, leer, mmss};
if (typeof module !== "undefined" && module.exports) module.exports = API;
else raiz.LYAVideosIA = API;
})(typeof window !== "undefined" ? window : globalThis);
