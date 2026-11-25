/* Lectura con cámara: haz una foto a un cartel, un menú o una etiqueta y la web te hace preguntas sobre ese texto.
   - Lee la foto con Tesseract.js (OCR gratis) DENTRO del navegador: la foto no se sube a ningún sitio.
     Solo se descargan (la primera vez) el programa y el modelo del idioma desde cdn.jsdelivr.net.
   - El texto leído se puede corregir a mano. Tocar una palabra muestra su traducción con el diccionario de la web
     (PK.tr del curso + tus palabras guardadas) y la puedes guardar en tu diccionario (r: "camara").
   - Preguntas sin IA, con reglas: «¿qué significa?» (opciones), «toca la palabra que significa…», «toca la palabra…»
     y «ordena la frase». Puntos con el evento "lya:xp" (src "camara").
   Ruta: #camara. */
(() => {
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const STR = {
  es: {tab: "Cámara", title: "Lectura con cámara",
    sub: "Haz una foto a un texto de verdad en {lang}: un cartel, un menú, una etiqueta… La web lo lee y te hace preguntas.",
    shoot: "Hacer una foto", pick: "Elegir una foto",
    tips: "Consejos: mucha luz, el texto recto y de cerca, y letras grandes.",
    priv: "La foto no se sube a internet: se lee dentro de tu aparato. La primera vez se descarga el lector de {lang} (unos segundos).",
    loading: "Preparando el lector de {lang}…", reading: "Leyendo la foto…", first: "Solo tarda la primera vez.",
    e_load: "No se ha podido descargar el lector. Revisa la conexión y prueba otra vez.", e_read: "No se ha podido leer esta foto. Prueba con otra.",
    read: "Esto es lo que he leído", touch: "👆 Toca una palabra para ver qué significa.",
    edit: "Corregir el texto", editp: "Si alguna palabra está mal leída, corrígela aquí:", done_edit: "Listo",
    little: "Casi no he podido leer nada. Prueba con más luz, más cerca o el texto más recto. También puedes escribirlo tú.",
    start: "Empezar las preguntas", another: "Otra foto",
    notr: "Esta palabra no está en el diccionario de la web.", add: "＋ Añadir al diccionario", saved: "✓ En tu diccionario",
    of: "Pregunta {n} de {t}",
    q_mean: "¿Qué significa «{w}»?", q_find: "Toca en el texto la palabra que significa «{t}».", q_same: "Toca en el texto la palabra «{w}».",
    q_order: "Ordena esta frase de la foto.", o_hint: "Toca las palabras en orden.", o_check: "Comprobar", o_clear: "Borrar",
    ok: "¡Bien! 🎉", no: "Era: {a}", next: "Siguiente", finish: "Ver el resultado",
    end: "¡Foto terminada!", score: "Aciertos: {a} de {n}", again: "Repetir las preguntas", dict: "📷 Palabras de fotos"},
  en: {tab: "Camera", title: "Camera reading",
    sub: "Take a photo of a real text in {lang}: a sign, a menu, a label… The website reads it and asks you questions.",
    shoot: "Take a photo", pick: "Choose a photo",
    tips: "Tips: lots of light, the text straight and close, and big letters.",
    priv: "The photo is not uploaded to the internet: it is read inside your device. The first time, the {lang} reader is downloaded (a few seconds).",
    loading: "Getting the {lang} reader ready…", reading: "Reading the photo…", first: "This is only slow the first time.",
    e_load: "The reader could not be downloaded. Check the connection and try again.", e_read: "This photo could not be read. Try another one.",
    read: "This is what I read", touch: "👆 Tap a word to see what it means.",
    edit: "Fix the text", editp: "If a word was read wrong, fix it here:", done_edit: "Done",
    little: "I could hardly read anything. Try with more light, closer, or with the text straight. You can also type it yourself.",
    start: "Start the questions", another: "Another photo",
    notr: "This word is not in the website's dictionary.", add: "＋ Add to dictionary", saved: "✓ In your dictionary",
    of: "Question {n} of {t}",
    q_mean: "What does «{w}» mean?", q_find: "Tap the word in the text that means «{t}».", q_same: "Tap the word «{w}» in the text.",
    q_order: "Put this sentence from the photo in order.", o_hint: "Tap the words in order.", o_check: "Check", o_clear: "Clear",
    ok: "Well done! 🎉", no: "It was: {a}", next: "Next", finish: "See the result",
    end: "Photo finished!", score: "Right answers: {a} of {n}", again: "Do the questions again", dict: "📷 Words from photos"},
  ca: {tab: "Càmera", title: "Lectura amb càmera",
    sub: "Fes una foto a un text de veritat en {lang}: un cartell, un menú, una etiqueta… La web el llegeix i et fa preguntes.",
    shoot: "Fer una foto", pick: "Triar una foto",
    tips: "Consells: molta llum, el text recte i a prop, i lletres grans.",
    priv: "La foto no es puja a internet: es llegeix dins del teu aparell. La primera vegada es descarrega el lector de {lang} (uns segons).",
    loading: "Preparant el lector de {lang}…", reading: "Llegint la foto…", first: "Només triga la primera vegada.",
    e_load: "No s'ha pogut descarregar el lector. Revisa la connexió i torna-ho a provar.", e_read: "No s'ha pogut llegir aquesta foto. Prova'n una altra.",
    read: "Això és el que he llegit", touch: "👆 Toca una paraula per veure què vol dir.",
    edit: "Corregir el text", editp: "Si alguna paraula està mal llegida, corregeix-la aquí:", done_edit: "Fet",
    little: "Gairebé no he pogut llegir res. Prova amb més llum, més a prop o el text més recte. També el pots escriure tu.",
    start: "Començar les preguntes", another: "Una altra foto",
    notr: "Aquesta paraula no és al diccionari de la web.", add: "＋ Afegir al diccionari", saved: "✓ Al teu diccionari",
    of: "Pregunta {n} de {t}",
    q_mean: "Què vol dir «{w}»?", q_find: "Toca al text la paraula que vol dir «{t}».", q_same: "Toca al text la paraula «{w}».",
    q_order: "Ordena aquesta frase de la foto.", o_hint: "Toca les paraules en ordre.", o_check: "Comprovar", o_clear: "Esborrar",
    ok: "Molt bé! 🎉", no: "Era: {a}", next: "Següent", finish: "Veure el resultat",
    end: "Foto acabada!", score: "Encerts: {a} de {n}", again: "Repetir les preguntes", dict: "📷 Paraules de fotos"}
};
const OCR = {es: "spa", en: "eng", ca: "cat", de: "deu", it: "ita"};
const TESS = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
const NQ = 6;

const s1 = (k, lang, v) => { let o = (STR[lang] || STR.en)[k] ?? STR.en[k] ?? k; for (const x in v || {}) o = o.split(`{${x}}`).join(v[x]); return o; };
const both = () => { try { return L().both(); } catch (e) { return false; } };
const lname = (c, inL) => { try { const n = st().CAT.languages[c].name; const s = n[inL] || n.en; return inL === "en" ? s : s.toLowerCase(); } catch (e) { return c; } };
const vv = (lang, v) => ({lang: lname(st().S.learn, lang), ...(v || {})});
const T = (k, v) => { const {S} = st(); const a = s1(k, S.learn, vv(S.learn, v)), b = s1(k, S.know, vv(S.know, v)); return esc(a) + (both() && b !== a ? ` · ${esc(b)}` : ""); };
const TB = (k, v) => { const {S} = st(); const a = s1(k, S.learn, vv(S.learn, v)), b = s1(k, S.know, vv(S.know, v)); return esc(a) + (both() && b !== a ? `<span class="en" style="display:block">${esc(b)}</span>` : ""); };
const shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const xp = d => { try { dispatchEvent(new CustomEvent("lya:xp", {detail: d})); } catch (e) {} };

/* ---------- text and dictionary ---------- */
const WRE = /[\p{L}\p{N}][\p{L}\p{N}'’·-]*[\p{L}\p{N}]|[\p{L}\p{N}]/gu;
/* clean what Tesseract gives: drop lines that are mostly symbols (noise from edges, logos…) */
function cleanText(t) {
  return String(t || "").replace(/[|_~^`<>{}\[\]\\=+*#@]/g, " ").split(/\n/).map(l => l.replace(/[ \t]+/g, " ").trim())
    .filter(l => { const letters = (l.match(/\p{L}/gu) || []).length; return letters >= 2 && letters >= l.replace(/\s/g, "").length * 0.6; }).join("\n");
}
const wordsOf = t => (String(t).match(WRE) || []).filter(w => /\p{L}/u.test(w));
const low = w => w.toLowerCase().replace(/’/g, "'");
/* translation of a word in the language you know: your saved words first, then the course dictionary */
function trans(w) {
  const {S, PK} = st(), k = low(w);
  const b = k.replace(/^(l|d|s|n|m|t|qu)'/, "").replace(/['-].*$/, "");
  const keys = [...new Set([k, b, b.replace(/es$/, ""), b.replace(/s$/, "")])].filter(x => x.length > 1);
  for (const x of keys) {
    const d = S.dict.find(d => d.l === S.learn && d.k === x && (d.tr?.[S.know] || d.t));
    if (d) return {k: x, t: d.tr?.[S.know] || d.t};
    const t = PK?.tr?.[x]; if (t) return {k: x, t};
  }
  return null;
}

/* ---------- questions (rules, no AI) ---------- */
function sentences(t) {
  const out = [];
  for (const line of String(t).split(/\n/)) for (const s of line.split(/(?<=[.!?¡¿;:])\s+/)) { const w = wordsOf(s); if (w.length >= 3 && w.length <= 8) out.push(w); }
  if (!out.length) { const w = wordsOf(t); for (let i = 0; i + 4 <= w.length && out.length < 3; i += 5) out.push(w.slice(i, i + Math.min(6, w.length - i))); }
  return out.filter(w => w.length >= 3 && new Set(w.map(low)).size > 1);
}
function makeQuestions(text) {
  const {PK} = st(), ws = wordsOf(text), seen = new Set(), known = [];
  for (const w of ws) { const k = low(w); if (seen.has(k) || w.length < 2 || /^\d+$/.test(w)) continue; seen.add(k); const r = trans(w); if (r) known.push({w, ...r}); }
  const pool = [...new Set(Object.values(PK?.tr || {}).filter(t => t && t.length < 30))];
  /* better questions with longer words, and never a word that is the same in both languages (no → no) */
  const good = known.filter(x => low(x.t) !== low(x.w)), rank = a => shuf(a).sort((x, y) => (y.w.length >= 4) - (x.w.length >= 4));
  const qs = [], k1 = rank(good), k2 = rank(good);
  const mean = x => { const others = shuf(pool.filter(t => low(t) !== low(x.t))).slice(0, 3); return others.length < 2 ? null : {type: "mean", w: x.w, a: x.t, opts: shuf([x.t, ...others])}; };
  for (const x of k1.slice(0, 2)) { const q = mean(x); if (q) qs.push(q); }
  for (const x of k2.filter(x => !qs.some(q => q.w === x.w)).slice(0, 2)) qs.push({type: "find", t: x.t, a: low(x.w)});
  for (const s of shuf(sentences(text)).slice(0, 2)) qs.push({type: "order", a: s});
  const long = shuf([...new Set(ws.filter(w => w.length >= 4 && !/^\d+$/.test(w)).map(low))]);
  for (const w of long) { if (qs.length >= NQ) break; if (!qs.some(q => q.a === w)) qs.push({type: "same", w, a: w}); }
  for (const x of k1.slice(2)) { if (qs.length >= NQ) break; const q = mean(x); if (q && !qs.some(o => o.w === x.w)) qs.push(q); }
  return shuf(qs).slice(0, NQ);
}

/* ---------- OCR with Tesseract.js (in the browser) ---------- */
let tessP = null; const workers = {};
const loadTess = () => tessP ||= new Promise((ok, ko) => { if (window.Tesseract) return ok(); const s = document.createElement("script"); s.src = TESS; s.onload = ok; s.onerror = () => { tessP = null; ko(new Error("load")); }; document.head.appendChild(s); });
async function worker(lang) {
  if (!workers[lang]) workers[lang] = (async () => { await loadTess(); return Tesseract.createWorker(lang, 1, {logger: m => progress(m)}); })().catch(e => { delete workers[lang]; throw e; });
  return workers[lang];
}
/* make big phone photos smaller (faster) */
async function shrink(file) {
  const img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = C.url; });
  const max = 1800, sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const cv = document.createElement("canvas"); cv.width = Math.round(img.naturalWidth * sc); cv.height = Math.round(img.naturalHeight * sc);
  cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); return cv;
}

/* ---------- state ---------- */
let C = {phase: "pick"};
function progress(m) {
  if (!C || C.phase !== "ocr") return;
  const p = Math.round((m.progress || 0) * 100), rec = /recogniz/.test(m.status || "");
  C.step = rec ? "reading" : "loading"; C.pct = p;
  const bar = document.querySelector(".cm-bar i"), lab = document.querySelector(".cm-step");
  if (bar) bar.style.width = (rec ? 50 + p / 2 : p / 2) + "%";
  if (lab) lab.innerHTML = T(C.step);
}
async function readPhoto(file) {
  if (C.url) URL.revokeObjectURL(C.url);
  C = {phase: "ocr", url: URL.createObjectURL(file), step: "loading", pct: 0, lang: st().S.learn}; draw();
  const me = C, lang = OCR[st().S.learn] || "eng";
  let w; try { w = await worker(lang); } catch (e) { if (C === me) { C.phase = "error"; C.err = "e_load"; draw(); } return; }
  try {
    const cv = await shrink(file); if (C !== me) return;
    C.step = "reading"; progress({status: "recognizing text", progress: 0});
    const r = await w.recognize(cv); if (C !== me) return;
    C.text = cleanText(r.data.text); C.phase = "text"; draw();
  } catch (e) { if (C === me) { C.phase = "error"; C.err = "e_read"; draw(); } }
}

/* ---------- drawing ---------- */
const wordBtns = (t, act, mark) => String(t).split(/\n/).map(line => {
  let out = "", last = 0;
  for (const m of line.matchAll(WRE)) {
    const w = m[0]; out += esc(line.slice(last, m.index)); last = m.index + w.length;
    out += /\p{L}/u.test(w) ? `<button type="button" class="cm-w${mark ? mark(w) : ""}" data-cm="${act}" data-k="${esc(low(w))}" data-w="${esc(w)}">${esc(w)}</button>` : esc(w);
  }
  return `<p class="cm-line">${out + esc(line.slice(last))}</p>`;
}).join("");
function head() {
  const {S} = st();
  return `<div class="ghead"><div><h1>📷 ${esc(s1("title", S.learn))}</h1>${S.know !== S.learn && both() ? `<p class="en">${esc(s1("title", S.know))}</p>` : ""}</div></div>`;
}
function draw() {
  const app = document.getElementById("app"); if (!app || st().S.view !== "camara") return;
  const {S} = st();
  let h = "";
  if (C.phase === "pick" || C.phase === "error") {
    h = `<p class="cm-lead">${TB("sub")}</p>
      ${C.phase === "error" ? `<p class="cm-err" role="alert">${TB(C.err)}</p>` : ""}
      <div class="cm-pick">
        <label class="btn main cm-big">📷 ${T("shoot")}<input type="file" accept="image/*" capture="environment" data-cm="file" hidden></label>
        <label class="btn cm-big">🖼️ ${T("pick")}<input type="file" accept="image/*" data-cm="file" hidden></label>
      </div>
      <p class="cm-small">💡 ${TB("tips")}</p>
      <p class="cm-note">🔒 ${TB("priv")}</p>`;
  } else if (C.phase === "ocr") {
    h = `<div class="cm-box"><img class="cm-img" src="${esc(C.url)}" alt="">
      <p class="cm-step" role="status">${T(C.step)}</p><div class="cm-bar"><i style="width:${C.step === "reading" ? 50 + C.pct / 2 : C.pct / 2}%"></i></div>
      <p class="cm-small">${TB("first")}</p></div>`;
  } else if (C.phase === "text") {
    const n = wordsOf(C.text).length;
    h = `<div class="cm-box"><div class="cm-top"><img class="cm-img sm" src="${esc(C.url || "")}" alt="" ${C.url ? "" : "hidden"}><h2>${TB("read")}</h2></div>
      ${n < 3 && !C.editing ? `<p class="cm-err">${TB("little")}</p>` : ""}
      ${C.editing ? `<p class="cm-small">${TB("editp")}</p><textarea id="cm-ed" class="cm-ed" rows="6" lang="${esc(S.learn)}" spellcheck="false">${esc(C.text)}</textarea>
        <p><button class="btn main" data-cm="saveed">${T("done_edit")}</button></p>`
      : `${n ? `<p class="cm-small">${TB("touch")}</p><div class="cm-text">${wordBtns(C.text, "tr", w => C.tip?.k === low(w) ? " on" : "")}</div>` : ""}
        ${C.tip ? tipHTML() : ""}
        <div class="cm-row"><button class="btn main" data-cm="start" ${n < 3 ? "disabled" : ""}>▶ ${T("start")}</button>
          <button class="btn" data-cm="edit">✏️ ${T("edit")}</button><button class="btn" data-cm="new">📷 ${T("another")}</button></div>`}</div>`;
  } else if (C.phase === "quiz") h = quizHTML();
  else if (C.phase === "end") {
    const a = C.res.filter(Boolean).length, n = C.res.length;
    h = `<div class="cm-box cm-endbox"><h2>🏁 ${TB("end")}</h2><p class="cm-score">${T("score", {a, n})}</p><p class="cm-stars">${"★".repeat(Math.round(a / n * 3))}${"☆".repeat(3 - Math.round(a / n * 3))}</p>
      <div class="cm-row"><button class="btn main" data-cm="new">📷 ${T("another")}</button><button class="btn" data-cm="again">🔁 ${T("again")}</button><button class="btn" data-cm="back">${T("read")}</button></div></div>`;
  }
  app.innerHTML = `<section class="wrap cm">${head()}${h}</section>`;
}
function tipHTML() {
  const t = C.tip, {S} = st(), has = t.t && S.dict.some(d => d.l === S.learn && d.k === t.k);
  return `<div class="cm-tip" role="status"><b>${esc(t.w)}</b> ${t.t ? `→ <span class="cm-tr">${esc(t.t)}</span>` : `<small>${TB("notr")}</small>`}
    ${t.t ? `<button class="btn" data-cm="add" ${has ? "disabled" : ""}>${T(has ? "saved" : "add")}</button>` : ""}</div>`;
}
function quizHTML() {
  const q = C.qs[C.i], done = C.ans !== undefined, {S} = st();
  let body = "", title = "";
  if (q.type === "mean") {
    title = TB("q_mean", {w: q.w});
    body = `<div class="cm-opts">${q.opts.map(o => `<button class="btn cm-opt${done && o === q.a ? " ok" : done && o === C.ans ? " no" : ""}" data-cm="opt" data-o="${esc(o)}" ${done ? "disabled" : ""} lang="${esc(S.know)}">${esc(o)}</button>`).join("")}</div>`;
  } else if (q.type === "find" || q.type === "same") {
    title = q.type === "find" ? TB("q_find", {t: q.t}) : TB("q_same", {w: q.w});
    body = `<div class="cm-text">${wordBtns(C.text, "pickw", w => !done ? "" : low(w) === q.a ? " ok" : low(w) === C.ans ? " no" : "")}</div>`;
  } else {
    title = TB("q_order");
    const used = C.ord || [], left = C.shuf.map((w, i) => [w, i]).filter(([, i]) => !used.includes(i));
    body = `<p class="cm-small">${TB("o_hint")}</p><div class="cm-built${done ? (C.res[C.i] ? " ok" : " no") : ""}">${used.map(i => `<span class="cm-chip">${esc(C.shuf[i])}</span>`).join(" ") || "&nbsp;"}</div>
      ${done ? "" : `<div class="cm-pool">${left.map(([w, i]) => `<button class="btn cm-chip" data-cm="ow" data-i="${i}">${esc(w)}</button>`).join("")}</div>
      <div class="cm-row"><button class="btn main" data-cm="ocheck" ${left.length ? "disabled" : ""}>${T("o_check")}</button><button class="btn" data-cm="oclear" ${used.length ? "" : "disabled"}>${T("o_clear")}</button></div>`}`;
  }
  const fb = !done ? "" : C.res[C.i] ? `<p class="cm-fb ok">${T("ok")}</p>` : `<p class="cm-fb no">${esc(s1("no", S.learn, {a: q.type === "order" ? q.a.join(" ") : q.type === "mean" ? q.a : q.type === "find" ? q.a : q.w}))}</p>`;
  return `<div class="cm-box"><div class="cm-top"><span class="cm-small">${T("of", {n: C.i + 1, t: C.qs.length})}</span>
      <span class="cm-dots">${C.qs.map((_, i) => `<i class="${i < C.res.length ? (C.res[i] ? "ok" : "no") : i === C.i ? "now" : ""}"></i>`).join("")}</span></div>
    <h2 class="cm-q">${title}</h2>${body}${fb}
    ${done ? `<p><button class="btn main" data-cm="next">${T(C.i + 1 < C.qs.length ? "next" : "finish")}</button></p>` : ""}</div>`;
}
function answer(ok, a) {
  C.ans = a; C.res[C.i] = ok;
  xp({xp: ok ? 2 : 0, src: "camara", ok});
  draw();
}
function startQuiz() {
  C.qs = makeQuestions(C.text); if (!C.qs.length) return;
  Object.assign(C, {phase: "quiz", i: 0, res: [], ans: undefined, tip: null}); prepQ(); draw(); scrollTo(0, 0);
}
function prepQ() { const q = C.qs[C.i]; C.ans = undefined; C.ord = []; if (q.type === "order") { let s; do s = shuf(q.a); while (q.a.length > 1 && s.join(" ") === q.a.join(" ")); C.shuf = s; } }

/* ---------- events ---------- */
document.addEventListener("change", e => {
  const i = e.target.closest("[data-cm=file]"); if (!i || !i.files?.[0]) return;
  readPhoto(i.files[0]);
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-cm]"); if (!b || b.dataset.cm === "file") return;
  const a = b.dataset.cm, q = C.qs?.[C.i];
  if (a === "tr") { const w = b.dataset.w; C.tip = C.tip?.k === low(w) ? null : (() => { const r = trans(w); return {w, k: r ? r.k : low(w), t: r ? r.t : ""}; })(); draw(); document.querySelector(".cm-tip")?.scrollIntoView({block: "nearest"}); }
  else if (a === "add") {
    const t = C.tip, {S} = st(); if (!t?.t || S.dict.some(d => d.l === S.learn && d.k === t.k)) return;
    S.dict.push({w: t.k, k: t.k, r: "camara", l: S.learn, t: t.t, tr: {[S.know]: t.t}, d: "", miss: false});
    xp({xp: 1, src: "dict-save", ok: true, word: t.w}); L().save(); draw();
  }
  else if (a === "edit") { C.editing = true; C.tip = null; draw(); document.getElementById("cm-ed")?.focus(); }
  else if (a === "saveed") { C.text = cleanText(document.getElementById("cm-ed").value) || document.getElementById("cm-ed").value.trim(); C.editing = false; draw(); }
  else if (a === "new") { if (C.url) URL.revokeObjectURL(C.url); C = {phase: "pick"}; draw(); scrollTo(0, 0); }
  else if (a === "start") startQuiz();
  else if (a === "again") startQuiz();
  else if (a === "back") { C.phase = "text"; draw(); }
  else if (C.phase !== "quiz" || C.ans !== undefined && a !== "next") return;
  else if (a === "opt") answer(b.dataset.o === q.a, b.dataset.o);
  else if (a === "pickw") answer(b.dataset.k === q.a, b.dataset.k);
  else if (a === "ow") { C.ord.push(+b.dataset.i); draw(); }
  else if (a === "oclear") { C.ord = []; draw(); }
  else if (a === "ocheck") { const s = C.ord.map(i => C.shuf[i]); answer(s.map(low).join(" ") === q.a.map(low).join(" "), s.join(" ")); }
  else if (a === "next") {
    if (C.i + 1 < C.qs.length) { C.i++; prepQ(); }
    else { C.phase = "end"; const n = C.res.filter(Boolean).length; xp({xp: 5 + n, src: "camara-fin"}); }
    draw(); scrollTo(0, 0);
  }
});

function render(app) {
  try { L().setAcc("#4cc9f0"); } catch (e) {}
  const l = st().S.learn; if (C.lang && C.lang !== l && C.phase !== "pick") { if (C.url) URL.revokeObjectURL(C.url); C = {phase: "pick"}; }
  C.lang = l; draw();
}
const isCam = h => h === "camara";
const tab = () => { const {S} = st(); return "📷 " + esc(s1("tab", S.learn)) + (both() ? `<span class="tk"> · ${esc(s1("tab", S.know))}</span>` : ""); };
window.LYACamara = {render, isCam, tab, dictTitulo: () => { try { return s1("dict", st().S.learn); } catch (e) { return "📷"; } },
  _test: {cleanText, wordsOf, makeQuestions, sentences, trans, setText: t => { C = {phase: "text", text: cleanText(t)}; draw(); }}};
})();
