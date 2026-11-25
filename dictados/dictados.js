/* Dictados: la web lee una frase (voz del navegador) y el alumno la escribe. Corrección palabra a palabra, sin IA:
   bien, tilde, mayúscula, mal escrita (letras marcadas), falta, sobra y puntuación.
   Frases sacadas de las lecturas del curso (texto sin los [corchetes]). 5 frases por dictado.
   Rutas: #dictados (lista por nivel) y #dictado-<lectura>.
   Progreso en S.g.dc[lectura] = {n veces, best estrellas, bp mejor %, last fecha} (se guarda en la nube con cuentas.js).
   Puntos: evento "lya:xp" por frase (src "dictado") + award() al terminar (una vez por lectura, y otra con 3 estrellas).
   Respeta «¿Puedes escuchar ahora?» (voz.js · window.LYAVoz). Deberes del profe: lectura "dictado-<id>". */
(() => {
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const STR = {
  ca: {tab: "Dictats", title: "Dictats", sub: "Escolta una frase de les lectures i escriu-la. La web et corregeix paraula per paraula.",
    level: "Nivell", pick: "Tria una lectura. Cada dictat té 5 frases.", go: "Començar", again: "Una altra vegada", best: "Millor: {p} %",
    of: "Frase {n} de {t}", listen: "Escoltar", slow: "Més lent", part: "Per parts", partn: "Part {n} de {t}",
    write: "Escriu aquí el que sents", check: "Corregir", next: "Frase següent", finish: "Veure el resultat", empty: "Primer escriu la frase.",
    hints: "Noms i números d'aquesta frase", right: "La frase correcta", yours: "El que has escrit",
    k_ok: "bé", k_tilde: "accent", k_may: "majúscula", k_mal: "mal escrita", k_falta: "falta", k_sobra: "sobra", k_punt: "puntuació",
    legend: "Verd: bé · Taronja: accent o majúscula · Vermell: mal escrita o falta · Ratllat: sobra",
    perfect: "Perfecta! Sense cap errada.", score: "Has encertat el {p} %",
    end: "Dictat acabat!", total: "Resultat: {p} %", tip_tilde: "Repassa els accents: {w}", tip_mal: "Paraules per practicar: {w}",
    back: "Tots els dictats", more: "Unes altres 5 frases", read: "Llegir la lectura",
    noaudio: "El dictat necessita so", noaudio_p: "Has dit que ara no pots escoltar àudio. Per fer un dictat has de sentir les frases.",
    noaudio_b: "Ja puc escoltar: activar el so", nosynth: "Aquest navegador no pot llegir en veu alta. Prova amb Chrome, Edge o Safari.",
    novoice: "El teu aparell no té una veu en aquesta llengua. La frase pot sonar estranya.", keys: "Lletres especials",
    hw: "Dictat que t'ha enviat el teu profe", none: "Encara no hi ha lectures en aquest nivell.", done_n: "Fet {n} vegades"},
  es: {tab: "Dictados", title: "Dictados", sub: "Escucha una frase de las lecturas y escríbela. La web te corrige palabra a palabra.",
    level: "Nivel", pick: "Elige una lectura. Cada dictado tiene 5 frases.", go: "Empezar", again: "Otra vez", best: "Mejor: {p} %",
    of: "Frase {n} de {t}", listen: "Escuchar", slow: "Más lento", part: "Por partes", partn: "Parte {n} de {t}",
    write: "Escribe aquí lo que oyes", check: "Corregir", next: "Siguiente frase", finish: "Ver el resultado", empty: "Primero escribe la frase.",
    hints: "Nombres y números de esta frase", right: "La frase correcta", yours: "Lo que has escrito",
    k_ok: "bien", k_tilde: "tilde", k_may: "mayúscula", k_mal: "mal escrita", k_falta: "falta", k_sobra: "sobra", k_punt: "puntuación",
    legend: "Verde: bien · Naranja: tilde o mayúscula · Rojo: mal escrita o falta · Tachado: sobra",
    perfect: "¡Perfecta! Sin ningún fallo.", score: "Has acertado el {p} %",
    end: "¡Dictado terminado!", total: "Resultado: {p} %", tip_tilde: "Repasa las tildes: {w}", tip_mal: "Palabras para practicar: {w}",
    back: "Todos los dictados", more: "Otras 5 frases", read: "Leer la lectura",
    noaudio: "El dictado necesita sonido", noaudio_p: "Has dicho que ahora no puedes escuchar audio. Para hacer un dictado tienes que oír las frases.",
    noaudio_b: "Ya puedo escuchar: activar el sonido", nosynth: "Este navegador no puede leer en voz alta. Prueba con Chrome, Edge o Safari.",
    novoice: "Tu aparato no tiene una voz en este idioma. La frase puede sonar rara.", keys: "Letras especiales",
    hw: "Dictado que te ha mandado tu profe", none: "Aún no hay lecturas en este nivel.", done_n: "Hecho {n} veces"},
  en: {tab: "Dictation", title: "Dictation", sub: "Listen to a sentence from the readings and write it. The website checks it word by word.",
    level: "Level", pick: "Choose a reading. Each dictation has 5 sentences.", go: "Start", again: "Again", best: "Best: {p} %",
    of: "Sentence {n} of {t}", listen: "Listen", slow: "Slower", part: "In parts", partn: "Part {n} of {t}",
    write: "Write what you hear here", check: "Check", next: "Next sentence", finish: "See the result", empty: "Write the sentence first.",
    hints: "Names and numbers in this sentence", right: "The correct sentence", yours: "What you wrote",
    k_ok: "right", k_tilde: "accent", k_may: "capital letter", k_mal: "misspelt", k_falta: "missing", k_sobra: "extra", k_punt: "punctuation",
    legend: "Green: right · Orange: accent or capital letter · Red: misspelt or missing · Crossed out: extra",
    perfect: "Perfect! No mistakes.", score: "You got {p} % right",
    end: "Dictation finished!", total: "Result: {p} %", tip_tilde: "Check the accents: {w}", tip_mal: "Words to practise: {w}",
    back: "All dictations", more: "5 more sentences", read: "Read the text",
    noaudio: "Dictation needs sound", noaudio_p: "You said you can't listen to audio right now. To do a dictation you need to hear the sentences.",
    noaudio_b: "I can listen now: turn the sound on", nosynth: "This browser can't read aloud. Try Chrome, Edge or Safari.",
    novoice: "Your device has no voice for this language. The sentence may sound strange.", keys: "Special letters",
    hw: "Dictation from your teacher", none: "There are no readings at this level yet.", done_n: "Done {n} times"}
};
const s1 = (k, lang, v) => { let o = (STR[lang] || STR.en)[k] ?? STR.en[k] ?? k; for (const x in v || {}) o = o.split(`{${x}}`).join(v[x]); return o; };
const both = () => { try { return L().both(); } catch (e) { return false; } };
const T = (k, v) => { const {S} = st(); const a = s1(k, S.learn, v), b = s1(k, S.know, v); return esc(a) + (both() && b !== a ? ` · ${esc(b)}` : ""); };
const TB = (k, v) => { const {S} = st(); const a = s1(k, S.learn, v), b = s1(k, S.know, v); return esc(a) + (both() && b !== a ? `<span class="en" style="display:block">${esc(b)}</span>` : ""); };
const shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const prog = () => { const {S} = st(); S.g ||= {}; return (S.g.dc ||= {}); };
const N = 5;

/* ---------- sentences from a reading ---------- */
const clean = t => String(t).replace(/[[\]]/g, "").replace(/\s+/g, " ").trim();
function split(p) {
  const parts = p.match(/[^.!?…]+(?:[.!?…]+[»"”)\]]*|$)/g) || [p], out = [];
  for (let s of parts) {
    s = s.trim(); if (!s) continue;
    if (out.length && (/^[a-zñáéíóúàèòïüç0-9,;:]/.test(s) || /\d[.]$/.test(out[out.length - 1]) && /^\d/.test(s))) out[out.length - 1] += (/^\d/.test(s) && /\d[.]$/.test(out[out.length - 1]) ? "" : " ") + s;
    else out.push(s);
  }
  return out;
}
const LIM = {A1: [3, 14], A2: [4, 18], B1: [5, 24], B2: [6, 28], C1: [6, 32]};
function sentencesOf(R, level) {
  const all = (R.text || []).flatMap(p => split(clean(p))), [lo, hi] = LIM[level] || LIM.B1;
  const ok = all.filter(s => { const n = words(s).length; return n >= lo && n <= hi && hintsOf(s).length <= 3 && !/[:;"“”«»]/.test(s); });
  return ok.length >= N ? ok : all.filter(s => words(s).length >= 3);
}

/* ---------- tokens and correction (no AI: alignment + letter distance) ---------- */
const TOK = /\d+(?:[.,]\d+)*|\.\.\.|…|[\p{L}\p{M}\p{N}]+(?:['’-][\p{L}\p{M}\p{N}]+)*|[.,;:!?¿¡]/gu;
const tokens = s => (String(s).normalize("NFC").match(TOK) || []).map(t => { t = t.replace(/’/g, "'").replace("…", "..."); return {t, p: /^[.,;:!?¿¡]|^\.\.\.$/.test(t)}; });
const words = s => tokens(s).filter(x => !x.p);
const base = w => w.toLowerCase().replace(/[áàâä]/g, "a").replace(/[éèêë]/g, "e").replace(/[íìîï]/g, "i").replace(/[óòôö]/g, "o").replace(/[úùûü]/g, "u");
function lev(a, b) {
  const m = a.length, n = b.length; let prev = Array.from({length: n + 1}, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
/* how a typed token compares with the right one */
function kind(a, b) {
  if (a.p !== b.p) return null;
  if (a.p) return a.t === b.t ? "ok" : "punt";
  if (a.t === b.t) return "ok";
  if (a.t.toLowerCase() === b.t.toLowerCase()) return "may";
  if (base(a.t) === base(b.t)) return "tilde";
  const d = lev(base(a.t), base(b.t)), n = Math.max(a.t.length, b.t.length);
  return d <= Math.max(1, Math.floor(n / 3)) ? "mal" : null;
}
const COST = {ok: 0, may: 0.1, tilde: 0.2, punt: 0.6, mal: 0.8};
function correct(typed, right) {
  const A = tokens(typed), B = tokens(right), m = A.length, n = B.length;
  const D = Array.from({length: m + 1}, () => new Array(n + 1).fill(0)), K = Array.from({length: m + 1}, () => new Array(n + 1).fill(null));
  for (let i = 1; i <= m; i++) D[i][0] = D[i - 1][0] + (A[i - 1].p ? 0.5 : 1);
  for (let j = 1; j <= n; j++) D[0][j] = D[0][j - 1] + (B[j - 1].p ? 0.5 : 1);
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const k = kind(A[i - 1], B[j - 1]); K[i][j] = k;
    D[i][j] = Math.min(D[i - 1][j] + (A[i - 1].p ? 0.5 : 1), D[i][j - 1] + (B[j - 1].p ? 0.5 : 1), k ? D[i - 1][j - 1] + COST[k] : Infinity);
  }
  const ops = []; let i = m, j = n;
  while (i > 0 || j > 0) {
    const k = i && j ? K[i][j] : null;
    if (k && Math.abs(D[i][j] - (D[i - 1][j - 1] + COST[k])) < 1e-9) { ops.push({k, a: A[i - 1].t, b: B[j - 1].t, p: B[j - 1].p}); i--; j--; }
    else if (j && (!i || Math.abs(D[i][j] - (D[i][j - 1] + (B[j - 1].p ? 0.5 : 1))) < 1e-9)) { ops.push({k: B[j - 1].p ? "punt" : "falta", a: "", b: B[j - 1].t, p: B[j - 1].p}); j--; }
    else { ops.push({k: A[i - 1].p ? "punt" : "sobra", a: A[i - 1].t, b: "", p: A[i - 1].p}); i--; }
  }
  ops.reverse();
  /* score: a word is worth 1, a punctuation mark 0.5 */
  const VAL = {ok: 1, may: 0.75, tilde: 0.5, mal: 0.25, falta: 0, punt: 0};
  let tot = 0, pts = 0;
  for (const o of ops) {
    if (o.b) { const w = o.p ? 0.5 : 1; tot += w; pts += w * (VAL[o.k] ?? 0); }
    else pts -= o.p ? 0.25 : 0.5;
  }
  const pct = tot ? Math.max(0, Math.round(100 * pts / tot)) : 0;
  return {ops, pct: ops.every(o => o.k === "ok") ? 100 : Math.min(pct, 99)};
}
/* letters of the right word that the student missed (underlined) */
function marks(a, b) {
  const x = base(a), y = base(b), m = x.length, n = y.length, M = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) M[i][j] = x[i] === y[j] ? M[i + 1][j + 1] + 1 : Math.max(M[i + 1][j], M[i][j + 1]);
  const pair = new Map(); let i = 0, j = 0;
  while (i < m && j < n) { if (x[i] === y[j]) { pair.set(j, i); i++; j++; } else if (M[i + 1][j] >= M[i][j + 1]) i++; else j++; }
  return [...b].map((c, k) => pair.has(k) && (a[pair.get(k)] || "").toLowerCase() === c.toLowerCase() ? esc(c) : `<u>${esc(c)}</u>`).join("");
}
function markTilde(a, b) { return [...b].map((c, k) => c !== a[k] ? `<u>${esc(c)}</u>` : esc(c)).join(""); }
/* proper names and numbers: shown as a hint, they can't be guessed by ear */
function hintsOf(s) {
  const ws = words(s), out = [];
  ws.forEach((w, i) => {
    if (/\d/.test(w.t) || (i > 0 && /^\p{Lu}/u.test(w.t) && !/^(I|I'm|I've|I'll|I'd)$/.test(w.t))) { if (!out.includes(w.t)) out.push(w.t); }
  });
  return out;
}

/* ---------- sound ---------- */
let voices = [];
const loadVoices = () => { try { voices = speechSynthesis.getVoices(); } catch (e) {} };
try { loadVoices(); speechSynthesis.addEventListener("voiceschanged", loadVoices); } catch (e) {}
const canSynth = () => "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
function canHear() {
  try { if (window.LYAVoz) return LYAVoz.oir(); } catch (e) {}
  try { return (JSON.parse(localStorage.getItem("lyaVozPref") || "null") || {}).oir !== false; } catch (e) { return true; }
}
const vcode = () => { const {CAT, S} = st(); return CAT.languages[S.learn].voice || S.learn; };
function voiceFor() { const code = vcode(), b = code.slice(0, 2); return voices.find(v => v.lang.replace("_", "-") === code && /Google|Mónica|Monica|Paulina|Microsoft/.test(v.name)) || voices.find(v => v.lang.replace("_", "-") === code) || voices.find(v => v.lang.slice(0, 2) === b); }
let keep = null;
function say(text, rate) {
  try {
    speechSynthesis.cancel();
    const u = keep = new SpeechSynthesisUtterance(text); u.lang = vcode(); u.rate = rate; const v = voiceFor(); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) {}
}
const stop = () => { try { speechSynthesis.cancel(); } catch (e) {} };
/* parts: cut at commas, or in halves for long sentences without commas */
function partsOf(s) {
  let p = s.split(/(?<=[,;:])\s+/).filter(Boolean);
  const out = [];
  for (const x of p) { const w = x.split(" "); if (w.length > 9) { const h = Math.ceil(w.length / 2); out.push(w.slice(0, h).join(" "), w.slice(h).join(" ")); } else out.push(x); }
  return out;
}

/* ---------- state of the current dictation ---------- */
let D = null, lastH = "";
const parse = h => { if (h === "dictados") return {hub: true}; const m = h.match(/^dictado-([a-z0-9-]+)$/); return m && L().rdById(m[1])?.file ? {id: m[1]} : null; };
const isDict = h => !!parse(h);
async function start(id) {
  const meta = L().rdById(id), R = await L().loadReading(meta.file);
  D = {id, sents: shuf(sentencesOf(R, meta.level)).slice(0, N), i: 0, res: [], typed: "", part: 0, phase: "write"};
}

/* ---------- pages ---------- */
function audioBlock() {
  if (!canSynth()) return `<div class="dc-warn"><p>${TB("nosynth")}</p></div>`;
  if (canHear()) return "";
  return `<div class="dc-warn" role="alert"><h2>🔇 ${T("noaudio")}</h2><p>${TB("noaudio_p")}</p><button class="btn main" data-dc="oir">🔊 ${T("noaudio_b")}</button></div>`;
}
function stars(n) { return `<span class="dc-st" aria-label="${n}/3">${"★".repeat(n)}${"☆".repeat(3 - n)}</span>`; }
function hub(app) {
  const {S} = st(), P = prog(), LV = ["A1", "A2", "B1", "B2", "C1"].filter(l => L().rdList().some(r => r.level === l && r.file));
  const rs = L().rdList().filter(r => r.level === S.level && r.file);
  app.innerHTML = `<section class="wrap dc"><div class="ghead"><div><h1>✍️ ${esc(s1("title", S.learn))}</h1>${S.know !== S.learn && both() ? `<p class="en">${esc(s1("title", S.know))}</p>` : ""}</div></div>
    <p class="dc-lead">${TB("sub")}</p>${audioBlock()}
    <div class="dc-lv" role="group" aria-label="${esc(s1("level", S.learn))}">${LV.map(l => `<button class="btn" data-dc="lv" data-l="${l}" aria-pressed="${l === S.level}">${l}</button>`).join("")}</div>
    <p class="dc-small">${T("pick")}</p>
    <div class="dc-grid">${rs.length ? rs.map(r => { const p = P[r.id]; return `<a class="dc-card" href="#dictado-${esc(r.id)}" style="--c:${esc(r.t.color)}"><img src="${esc(r.art || r.t.art)}" alt="" loading="lazy">
      <span class="dc-ct"><b>${esc(r.t.name[S.learn] || r.t.name.es)}</b><small>${esc(r.title[S.learn] || r.title.es)} · ${r.level}</small>
      ${p ? `<small>${stars(p.best)} ${T("best", {p: p.bp})}</small>` : ""}</span></a>`; }).join("") : `<p>${T("none")}</p>`}</div></section>`;
}
function keysHTML() {
  const {S} = st(); if (S.learn !== "es" && S.learn !== "ca") return "";
  return `<div class="dc-keys" role="group" aria-label="${esc(s1("keys", S.learn))}">${(S.learn === "ca" ? "à è é í ï ò ó ú ü ç ·" : "á é í ó ú ñ ü ¿ ¡").split(" ").map(c => `<button type="button" class="btn" data-dc="key" data-c="${c}">${c}</button>`).join("")}</div>`;
}
function opsHTML(ops) {
  return ops.map(o => {
    const lab = esc(s1("k_" + o.k, st().S.learn));
    if (o.k === "ok") return `<span class="dc-t ok">${esc(o.b)}</span>`;
    if (o.k === "falta") return `<span class="dc-t falta" title="${lab}"><small>—</small><b>${esc(o.b)}</b></span>`;
    if (o.k === "sobra" || (o.k === "punt" && !o.b)) return `<span class="dc-t sobra" title="${lab}"><small><s>${esc(o.a)}</s></small><b>&nbsp;</b></span>`;
    if (o.k === "punt") return `<span class="dc-t punt" title="${lab}"><small>${esc(o.a) || "—"}</small><b>${esc(o.b)}</b></span>`;
    const right = o.k === "mal" ? marks(o.a, o.b) : markTilde(o.a, o.b);
    return `<span class="dc-t ${o.k}" title="${lab}"><small>${esc(o.a)}</small><b>${right}</b></span>`;
  }).join(" ");
}
function countsHTML(ops) {
  const c = {}; for (const o of ops) c[o.k === "punt" && !o.b ? "punt" : o.k] = (c[o.k] || 0) + 1;
  return ["ok", "tilde", "may", "mal", "falta", "sobra", "punt"].filter(k => c[k]).map(k => `<span class="dc-c ${k}"><b>${c[k]}</b> ${T("k_" + k)}</span>`).join("");
}
function session(app) {
  const {S} = st(), meta = L().rdById(D.id), s = D.sents[D.i], r = D.res[D.i], parts = partsOf(s), hints = hintsOf(s);
  const hw = window.LYAAvisos?.deberes?.().some(d => d.lectura === "dictado-" + D.id);
  const novoice = canSynth() && voices.length && !voiceFor();
  app.innerHTML = `<section class="wrap dc" style="--c:${esc(meta.t.color)}">
    <p class="dc-small"><a href="#dictados">← ${T("back")}</a>${hw ? ` · 📚 ${T("hw")}` : ""}</p>
    <h1 class="dc-h">${esc(meta.t.name[S.learn] || meta.t.name.es)}</h1><p class="en">${esc(meta.title[S.learn] || meta.title.es)} · ${meta.level}</p>
    ${audioBlock()}${novoice ? `<p class="dc-small">⚠️ ${T("novoice")}</p>` : ""}
    <div class="dc-box">
      <div class="dc-top"><b>${T("of", {n: D.i + 1, t: D.sents.length})}</b><span class="dc-dots">${D.sents.map((_, k) => `<i class="${k < D.i || (k === D.i && r) ? (D.res[k].pct === 100 ? "ok" : "no") : k === D.i ? "now" : ""}"></i>`).join("")}</span></div>
      <div class="dc-play">
        <button class="btn main" data-dc="play">🔊 ${T("listen")}</button><button class="btn" data-dc="slow">🐢 ${T("slow")}</button>
        ${parts.length > 1 ? `<button class="btn" data-dc="part">✂️ ${D.part ? T("partn", {n: D.part, t: parts.length}) : T("part")}</button>` : ""}
      </div>
      ${hints.length ? `<p class="dc-hint">💡 ${T("hints")}: ${hints.map(h => `<b>${esc(h)}</b>`).join(", ")}</p>` : ""}
      ${r ? `<div class="dc-res"><p class="dc-small">${T("right")}</p><p class="dc-sent">${esc(s)}</p>
          <p class="dc-small">${T("yours")}</p><div class="dc-ops">${opsHTML(r.ops)}</div>
          <p class="dc-counts">${countsHTML(r.ops)}</p>
          <p class="dc-score ${r.pct === 100 ? "ok" : ""}">${r.pct === 100 ? "🎉 " + T("perfect") : T("score", {p: r.pct})}</p>
          <p class="dc-small">${T("legend")}</p>
          <button class="btn main" data-dc="next">${D.i + 1 < D.sents.length ? T("next") + " →" : "🏁 " + T("finish")}</button></div>`
        : `<label class="dc-small" for="dc-in">${T("write")}</label>
          <textarea id="dc-in" class="dc-in" rows="3" lang="${esc(S.learn)}" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off">${esc(D.typed)}</textarea>${keysHTML()}
          <p class="dc-msg" id="dc-msg" role="status"></p><button class="btn main" data-dc="check">✓ ${T("check")}</button>`}
    </div></section>`;
  const ta = app.querySelector("#dc-in");
  if (ta) { ta.oninput = () => { D.typed = ta.value; }; ta.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); check(app); } }; }
}
function endHTML(app) {
  const {S} = st(), meta = L().rdById(D.id), pct = Math.round(D.res.reduce((a, r) => a + r.pct, 0) / D.res.length);
  const n = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
  const bad = (k) => [...new Set(D.res.flatMap(r => r.ops.filter(o => o.k === k || (k === "mal" && o.k === "falta" && !o.p)).map(o => o.b)))].slice(0, 8);
  const tl = bad("tilde"), ml = bad("mal");
  app.innerHTML = `<section class="wrap dc" style="--c:${esc(meta.t.color)}"><div class="dc-box dc-end">
    <h1 class="dc-h">🏁 ${esc(s1("end", S.learn))}</h1>${both() ? `<p class="en">${esc(s1("end", S.know))}</p>` : ""}
    <p class="dc-big">${stars(n)}</p><p class="dc-score">${T("total", {p: pct})}</p>
    ${tl.length ? `<p>${T("tip_tilde", {w: tl.join(", ")})}</p>` : ""}${ml.length ? `<p>${T("tip_mal", {w: ml.join(", ")})}</p>` : ""}
    <div class="dc-play"><button class="btn main" data-dc="more">🔁 ${T("more")}</button><a class="btn" href="#${esc(D.id)}" style="text-decoration:none">📖 ${T("read")}</a><a class="btn" href="#dictados" style="text-decoration:none">✍️ ${T("back")}</a></div>
  </div></section>`;
}
function finish() {
  const P = prog(), pct = Math.round(D.res.reduce((a, r) => a + r.pct, 0) / D.res.length), n = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
  const p = P[D.id] ||= {n: 0, best: 0, bp: 0, last: null};
  p.n++; p.best = Math.max(p.best, n); p.bp = Math.max(p.bp, pct); p.last = today();
  try { L().award(10, "dictado:" + D.id, D.id); if (n === 3) L().award(10, "dictado3:" + D.id, D.id); else L().save(); } catch (e) {}
  D.phase = "end";
}
function check(app) {
  const ta = app.querySelector("#dc-in"), v = (ta ? ta.value : D.typed).trim();
  if (!words(v).length) { const m = app.querySelector("#dc-msg"); if (m) m.innerHTML = T("empty"); ta?.focus(); return; }
  stop();
  const r = correct(v, D.sents[D.i]); D.res[D.i] = r; D.typed = "";
  const xp = r.pct === 100 ? 4 : r.pct >= 75 ? 3 : r.pct >= 50 ? 2 : 1;
  try { dispatchEvent(new CustomEvent("lya:xp", {detail: {xp, src: "dictado", ok: r.pct >= 75, lectura: D.id}})); } catch (e) {}
  render(app); app.querySelector(".dc-res")?.scrollIntoView({block: "nearest", behavior: "smooth"});
}
async function render(app) {
  const h = location.hash.slice(1), r = parse(h);
  if (!r || r.hub) { D = null; lastH = h; return hub(app); }
  if (!D || D.id !== r.id || lastH !== h) { app.innerHTML = `<p class="msg">…</p>`; lastH = h; try { await start(r.id); } catch (e) { app.innerHTML = `<p class="msg">Error</p>`; return; } }
  /* the level of the reading decides the language of the buttons (A1 both, A2/B1 only the one you learn) */
  { const S = st().S, lv = L().rdById(D.id)?.level; if (lv && S.level !== lv) { S.level = lv; L().save(); return L().renderPage(); } }
  if (D.phase === "end") return endHTML(app);
  session(app);
}
const tab = () => { const {S} = st(); return "✍️ " + esc(s1("tab", S.learn)) + (both() ? `<span class="tk"> · ${esc(s1("tab", S.know))}</span>` : ""); };

/* ---------- clicks ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-dc]"); if (!b) return;
  const app = document.getElementById("app"), a = b.dataset.dc;
  if (a === "lv") { st().S.level = b.dataset.l; L().save(); L().renderPage(); return; }
  if (a === "oir") { try { if (window.LYAVoz) LYAVoz.setOir(true); else { const p = JSON.parse(localStorage.getItem("lyaVozPref") || "{}") || {}; p.oir = true; localStorage.setItem("lyaVozPref", JSON.stringify(p)); } } catch (err) {} render(app); return; }
  if (!D) return;
  const s = D.sents[D.i];
  if (a === "play") { D.part = 0; say(s, 0.85); render(app); }
  else if (a === "slow") { D.part = 0; say(s, 0.55); render(app); }
  else if (a === "part") { const p = partsOf(s); D.part = D.part % p.length + 1; say(p[D.part - 1], 0.65); render(app); }
  else if (a === "check") check(app);
  else if (a === "key") { const ta = app.querySelector("#dc-in"); if (!ta) return; const i = ta.selectionStart ?? ta.value.length, j = ta.selectionEnd ?? i; ta.value = ta.value.slice(0, i) + b.dataset.c + ta.value.slice(j); D.typed = ta.value; ta.focus(); ta.setSelectionRange(i + 1, i + 1); }
  else if (a === "next") { stop(); D.part = 0; if (D.i + 1 < D.sents.length) { D.i++; render(app); app.querySelector("#dc-in")?.focus({preventScroll: true}); } else { finish(); render(app); } scrollTo(0, 0); }
  else if (a === "more") { D = null; lastH = ""; render(app); scrollTo(0, 0); }
  if (a === "play" || a === "slow" || a === "part") app.querySelector("#dc-in")?.focus({preventScroll: true});
});
addEventListener("hashchange", () => { if (!isDict(location.hash.slice(1))) { stop(); lastH = ""; } });

window.LYADictados = {render, isDict, tab, correct, sentencesOf, prog, actual: () => D && D.sents[D.i]};
})();
