/* Concursos: formato de texto para crear un concurso pegando lo que escribe una IA (o a mano).
   Lo usan concursos/concursos.js (navegador, window.LYAFormatoConcurso) y las pruebas (node, module.exports).

   Formato (en español; también entiende las palabras en inglés y catalán):
     TÍTULO: Los volcanes
     ---
     PREGUNTA: ¿Qué sale de un volcán en erupción?
     A) Lava
     B) Nieve
     C) Agua
     D) Arena
     CORRECTA: A
     TIEMPO: 20
     ---
   - De 2 a 4 respuestas por pregunta (A-D). Verdadero/falso = 2 respuestas.
   - TIEMPO (segundos) es opcional: 20 si no se pone. Entre 5 y 120.
   - Tolera lo que suelen añadir las IA: ```bloques```, **negritas**, «1.» delante de la pregunta,
     «a.» o «(a)» en las respuestas, «Respuesta correcta: b)», o un * / ✅ al lado de la correcta. */
(function (raiz) {
const LIM = {preguntas: 40, pregunta: 200, respuesta: 90, titulo: 80, tMin: 5, tMax: 120, tDef: 20};
const LETRAS = "ABCD";

const limpia = s => String(s || "").replace(/\*\*|__|`/g, "").replace(/[ \t ]+/g, " ").trim();
const corta = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
const sinTildes = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

const RE_TIT = /^(?:#+\s*)?(?:t[ií]tulo|title|t[ií]tol|nombre del concurso|concurso|quiz)\s*[:：]\s*(.+)$/i;
const RE_PREG = /^(?:#+\s*)?(?:(?:pregunta|question|q|p)\s*\d*\s*[:：.)-]\s*|\d{1,2}\s*[.)：:-]\s+)(.+)$/i;
const RE_OPC = /^[(\[]?([A-Da-d])[)\].:：-]\s*(.+)$/;
const RE_COR = /^(?:respuesta\s+correcta|respuesta|correcta|correct\s+answer|correct|answer|resposta\s+correcta|resposta|correcte)\s*[:：]\s*\(?([A-Da-d])\b/i;
const RE_TIEMPO = /^(?:tiempo|time|temps|segundos|seconds|segons)\s*[:：]\s*(\d{1,3})/i;
const RE_MARCA = /\s*(?:\(\s*correcta\s*\)|\(\s*correct\s*\)|\(\s*correcte\s*\)|✅|✔️?|☑️?|\*)\s*$/i;
const RE_MARCA_INI = /^(?:✅|✔️?|\*)\s*/;

/* texto → {titulo, preguntas: [{p, o: [...], c, s}], avisos: [...]} */
function leer(texto) {
  const lineas = String(texto || "").replace(/\r/g, "").split("\n").map(limpia);
  let titulo = "", suelto = "", act = null; const preguntas = [], avisos = [];
  const cerrar = () => {
    if (!act) return;
    const n = preguntas.length + 1;
    if (act.o.length < 2) avisos.push({n, k: "pocas", p: act.p});
    else if (act.c < 0 || act.c >= act.o.length) avisos.push({n, k: "sincorrecta", p: act.p});
    else preguntas.push({p: corta(act.p, LIM.pregunta), o: act.o.map(o => corta(o, LIM.respuesta)), c: act.c, s: act.s});
    act = null;
  };
  for (let l of lineas) {
    if (!l || /^(-{3,}|={3,}|_{3,}|```.*)$/.test(l)) continue;
    let m;
    if (!act && !preguntas.length && (m = l.match(RE_TIT))) { titulo = corta(limpia(m[1]), LIM.titulo); continue; }
    if ((m = l.match(RE_COR))) { if (act) act.c = LETRAS.indexOf(m[1].toUpperCase()); continue; }
    if ((m = l.match(RE_TIEMPO))) { if (act) act.s = Math.min(LIM.tMax, Math.max(LIM.tMin, +m[1])); continue; }
    if ((m = l.match(RE_OPC)) && act && !act.cerrada) {
      let txt = m[2], marcada = false;
      if (RE_MARCA.test(txt)) { txt = txt.replace(RE_MARCA, ""); marcada = true; }
      const i = LETRAS.indexOf(m[1].toUpperCase());
      if (i === act.o.length && i < 4) { act.o.push(limpia(txt)); if (marcada && act.c < 0) act.c = i; }
      continue;
    }
    if (RE_MARCA_INI.test(l) && act && (m = l.replace(RE_MARCA_INI, "").match(RE_OPC))) {
      const i = LETRAS.indexOf(m[1].toUpperCase());
      if (i === act.o.length && i < 4) { act.o.push(limpia(m[2])); act.c = i; }
      continue;
    }
    if ((m = l.match(RE_PREG))) { cerrar(); act = {p: limpia(m[1]), o: [], c: -1, s: LIM.tDef}; continue; }
    /* una línea suelta: si aún no hay respuestas, es la continuación de la pregunta */
    if (act && !act.o.length) act.p = (act.p + " " + l).trim();
    else if (!act && !preguntas.length && !suelto && l.length <= LIM.titulo && !/[?¿:]$/.test(l) && !/[?¿]/.test(l)) suelto = l.replace(/^#+\s*/, "");
  }
  cerrar();
  if (!titulo) titulo = corta(suelto, LIM.titulo);
  return {titulo, preguntas: preguntas.slice(0, LIM.preguntas), avisos, demasiadas: preguntas.length > LIM.preguntas};
}

/* concurso → texto en el formato (para copiar, editar o pasar a otro aparato) */
function escribir(c) {
  const out = [`TÍTULO: ${c.titulo || ""}`];
  for (const q of c.preguntas || []) {
    out.push("---", `PREGUNTA: ${q.p}`);
    q.o.forEach((o, i) => out.push(`${LETRAS[i]}) ${o}`));
    out.push(`CORRECTA: ${LETRAS[q.c]}`, `TIEMPO: ${q.s || LIM.tDef}`);
  }
  out.push("---");
  return out.join("\n");
}

/* el prompt que se copia a cualquier IA (ChatGPT, Claude, Gemini, Copilot…) */
const IDIOMAS = {es: "español", en: "inglés (English)", ca: "catalán (català)", fr: "francés", de: "alemán", it: "italiano", pt: "portugués"};
function prompt(op = {}) {
  const n = Math.min(LIM.preguntas, Math.max(3, +op.n || 10));
  const idioma = op.idioma && IDIOMAS[op.idioma] ? `en ${IDIOMAS[op.idioma]}` : "en el mismo idioma que el texto o la foto";
  const nivel = op.nivel ? `\n- Nivel de los alumnos: ${op.nivel}. Adapta el vocabulario y la dificultad.` : "";
  const tema = op.tema ? `\n- Tema o instrucciones extra: ${op.tema}` : "";
  const vf = op.vf ? "\n- Puedes incluir alguna pregunta de verdadero/falso (solo A) Verdadero y B) Falso)." : "";
  return `Eres un profesor que prepara un concurso de preguntas para su clase.

Te voy a pasar un texto o una foto (por ejemplo, la página de un libro). Léelo con atención y crea ${n} preguntas tipo test sobre su contenido.

Reglas:
- Escribe las preguntas y las respuestas ${idioma}.
- Cada pregunta tiene 4 respuestas (A, B, C, D) y solo UNA es correcta.
- Las respuestas incorrectas deben ser creíbles, no absurdas.
- Cambia de sitio la correcta: que no sea siempre la misma letra.
- Preguntas cortas (máximo 200 caracteres) y respuestas cortas (máximo 90 caracteres), porque se leen en un móvil.
- TIEMPO son los segundos para contestar: 20 normalmente, 30 si la pregunta es larga o difícil.${nivel}${tema}${vf}
- Usa SOLO la información del texto o de la foto. Si no puedes leer bien la foto, dímelo en vez de inventar.

Responde ÚNICAMENTE con el concurso dentro de un bloque de código, sin explicaciones ni negritas, con este formato EXACTO:

\`\`\`
TÍTULO: (un título corto para el concurso)
---
PREGUNTA: (texto de la pregunta 1)
A) (respuesta)
B) (respuesta)
C) (respuesta)
D) (respuesta)
CORRECTA: (letra de la correcta: A, B, C o D)
TIEMPO: 20
---
PREGUNTA: (texto de la pregunta 2)
A) …
B) …
C) …
D) …
CORRECTA: …
TIEMPO: 20
---
\`\`\`

(y así hasta la pregunta ${n}).

Aquí tienes el texto o la foto:`;
}

/* comprueba un concurso que llega como objeto (servidor y editor) → objeto limpio o null */
function validar(c) {
  if (!c || typeof c !== "object") return null;
  const titulo = corta(limpia(c.titulo), LIM.titulo);
  const preguntas = (Array.isArray(c.preguntas) ? c.preguntas : []).slice(0, LIM.preguntas).map(q => {
    if (!q || typeof q !== "object" || !Array.isArray(q.o)) return null;
    const p = corta(limpia(q.p), LIM.pregunta), o = q.o.slice(0, 4).map(x => corta(limpia(x), LIM.respuesta));
    const c2 = Number.isInteger(q.c) ? q.c : -1, s = Math.min(LIM.tMax, Math.max(LIM.tMin, Math.round(+q.s || LIM.tDef)));
    if (!p || o.length < 2 || o.some(x => !x) || c2 < 0 || c2 >= o.length) return null;
    return {p, o, c: c2, s};
  });
  if (!titulo || !preguntas.length || preguntas.some(q => !q)) return null;
  return {titulo, preguntas};
}

/* puntos de una respuesta correcta: 500 por acertar + hasta 500 por rapidez (de 10 en 10) */
const puntos = (ms, s) => Math.round((500 + 500 * Math.max(0, 1 - ms / (s * 1000))) / 10) * 10;

const API = {leer, escribir, prompt, validar, puntos, LIM, LETRAS, sinTildes};
if (typeof module !== "undefined" && module.exports) module.exports = API;
else raiz.LYAFormatoConcurso = API;
})(typeof window !== "undefined" ? window : globalThis);
