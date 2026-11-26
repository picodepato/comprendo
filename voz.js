/* voz.js · escuchar y hablar (voz del navegador, karaoke, grabarse)
   Needs the bridge window.LYA from index.html. Audio never leaves the device. */
{
const L = () => window.LYA;
const app = document.getElementById("app");
if (L() && app && "speechSynthesis" in window) {
document.documentElement.classList.add("voz-on");

/* ---------- texts ---------- */
const STR = {
  ca: {listen: "Escoltar", pause: "Pausa", stop: "Aturar", prev: "Frase anterior", next: "Frase següent", slow: "Lent", normal: "Normal",
    of: "Frase {n} de {t}", pron: "Llegeix en veu alta", pron_help: "Escolta la frase, grava't llegint-la i compara la teva veu amb la de la web.",
    hear: "Escoltar", rec: "Gravar-me", recstop: "Aturar", mine: "La meva veu", both: "Les dues", phone: "Gravar amb el mòbil",
    private: "La teva gravació es queda en aquest aparell i s'esborra quan surts de la lectura.", done: "Has gravat {n} de {t} frases.",
    xp: "Bé! +{n} XP", nomic: "Aquí el navegador no deixa fer servir el micròfon directament. Toca «Gravar amb el mòbil» i tria la gravadora de veu (o un àudio ja gravat); després t'escoltes aquí.",
    norec: "Primer grava't.", word: "Escoltar la paraula", recording: "Gravant… llegeix la frase i toca Aturar.",
    ask_t: "Abans de començar", ask_oir: "Pots escoltar àudio ara?", ask_hablar: "Pots parlar en veu alta ara?", yes: "Sí", no: "No",
    ask_help: "Si dius que no, traiem les parts d'escoltar o de parlar. Ho pots canviar quan vulguis.", ask_go: "Començar", ask_fijo: "No tornar a preguntar",
    snd: "So", talk: "Parlar", change: "Canviar"},
  es: {listen: "Escuchar", pause: "Pausa", stop: "Parar", prev: "Frase anterior", next: "Frase siguiente", slow: "Lento", normal: "Normal",
    of: "Frase {n} de {t}", pron: "Lee en voz alta", pron_help: "Escucha la frase, grábate leyéndola y compara tu voz con la de la web.",
    hear: "Escuchar", rec: "Grabarme", recstop: "Parar", mine: "Mi voz", both: "Las dos", phone: "Grabar con el móvil",
    private: "Tu grabación se queda en este aparato y se borra al salir de la lectura.", done: "Has grabado {n} de {t} frases.",
    xp: "¡Bien! +{n} XP", nomic: "Aquí el navegador no deja usar el micrófono directamente. Pulsa «Grabar con el móvil» y elige la grabadora de voz (o un audio ya grabado); luego te escuchas aquí.",
    norec: "Primero grábate.", word: "Escuchar la palabra", recording: "Grabando… lee la frase y pulsa Parar.",
    ask_t: "Antes de empezar", ask_oir: "¿Puedes escuchar audio ahora?", ask_hablar: "¿Puedes hablar en voz alta ahora?", yes: "Sí", no: "No",
    ask_help: "Si dices que no, quitamos las partes de escuchar o de hablar. Puedes cambiarlo cuando quieras.", ask_go: "Empezar", ask_fijo: "No volver a preguntar",
    snd: "Sonido", talk: "Hablar", change: "Cambiar"},
  en: {listen: "Listen", pause: "Pause", stop: "Stop", prev: "Previous sentence", next: "Next sentence", slow: "Slow", normal: "Normal",
    of: "Sentence {n} of {t}", pron: "Read aloud", pron_help: "Listen to the sentence, record yourself reading it and compare your voice with the website's.",
    hear: "Listen", rec: "Record me", recstop: "Stop", mine: "My voice", both: "Both", phone: "Record with your phone",
    private: "Your recording stays on this device and is deleted when you leave the reading.", done: "You have recorded {n} of {t} sentences.",
    xp: "Nice! +{n} XP", nomic: "The browser does not allow the microphone here. Tap “Record with your phone” and choose the voice recorder (or a saved audio); then listen to yourself here.",
    norec: "Record yourself first.", word: "Listen to the word", recording: "Recording… read the sentence and tap Stop.",
    ask_t: "Before you start", ask_oir: "Can you listen to audio right now?", ask_hablar: "Can you speak out loud right now?", yes: "Yes", no: "No",
    ask_help: "If you say no, we hide the listening or speaking parts. You can change it any time.", ask_go: "Start", ask_fijo: "Don't ask again",
    snd: "Sound", talk: "Speaking", change: "Change"}
};
const award = (...a) => { try { return typeof L().award === "function" ? L().award(...a) : 0; } catch (e) { return 0; } };
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const str = (lang, k, v) => { let s = (STR[lang] || STR.en)[k] || STR.en[k]; for (const x in v || {}) s = s.replace(`{${x}}`, v[x]); return s; };
const T = (k, v) => { const S = L().S; let o = esc(str(S.learn, k, v)); if (L().both()) o += `<span class="en">${esc(str(S.know, k, v))}</span>`; return o; };
const T1 = (k, v) => { const a = str(L().S.learn, k, v), b = str(L().S.know, k, v); return a + (L().both() && b !== a ? " · " + b : ""); };
const ico = {
  play: '<path d="M8 5v14l11-7z"/>', pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>', stop: '<path d="M6 6h12v12H6z"/>',
  prev: '<path d="M6 5h2v14H6zM20 5v14L9 12z"/>', next: '<path d="M16 5h2v14h-2zM4 5v14l11-7z"/>',
  mic: '<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  ear: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  me: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0z"/>',
  both: '<path d="M3 9v6h3l4 4V5L6 9H3z"/><circle cx="17" cy="8" r="3"/><path d="M12 20a5 5 0 0 1 10 0z"/>'
};
const svg = n => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${ico[n]}</svg>`;

/* ---------- sentences ---------- */
function split(p) {
  const parts = p.match(/[^.!?…]+(?:[.!?…]+[»"”)\]]*|$)/g) || [p], out = [];
  for (let s of parts) {
    s = s.trim(); if (!s) continue;
    /* keep 300.000, "p. ej." and similar together */
    if (out.length && (/^[a-zñáéíóúàèòïüç0-9,;:]/.test(s) || /\d[.]$/.test(out[out.length - 1]) && /^\d/.test(s))) out[out.length - 1] += (/^\d/.test(s) && /\d[.]$/.test(out[out.length - 1]) ? "" : " ") + s;
    else out.push(s);
  }
  return out;
}
/* ---------- can I listen / speak right now? (asked once per visit, remembered on this device) ---------- */
const ls = {get(k, st) { try { return JSON.parse((st || localStorage).getItem(k) || "null"); } catch (e) { return null; } }, set(k, v, st) { try { (st || localStorage).setItem(k, JSON.stringify(v)); } catch (e) {} }};
const PREF = Object.assign({oir: true, hablar: true, fijo: false}, ls.get("lyaVozPref") || {});
const ASK = {open: !(PREF.fijo || ls.get("lyaVozPreguntado", sessionStorage)), oir: PREF.oir, hablar: PREF.hablar};
function applyPref() {
  const h = document.documentElement;
  h.classList.toggle("no-oir", !PREF.oir); h.classList.toggle("no-hablar", !PREF.hablar || !PREF.oir);
  if (!PREF.oir) { try { halt(); recStop(); if (audio) audio.pause(); } catch (e) {} }
}
/* every voice on the site goes through speechSynthesis.speak: mute it when sound is off */
try { const sp = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = u => { if (PREF.oir) sp(u); }; } catch (e) {}
const yn = (k, on) => `<div class="vz-yn" role="group" aria-label="${esc(T1(k === "oir" ? "ask_oir" : "ask_hablar"))}">
  <button class="btn" data-vz="ask" data-k="${k}" data-v="1" aria-pressed="${on}">${esc(T1("yes"))}</button><button class="btn" data-vz="ask" data-k="${k}" data-v="0" aria-pressed="${!on}">${esc(T1("no"))}</button></div>`;
function askHTML() {
  if (!ASK.open) return `<p class="vz-chip"><span>${esc(T1("snd"))}: <b>${esc(str(L().S.learn, PREF.oir ? "yes" : "no"))}</b></span><span>${esc(T1("talk"))}: <b>${esc(str(L().S.learn, PREF.hablar && PREF.oir ? "yes" : "no"))}</b></span><button class="vz-link" data-vz="askopen">${esc(T1("change"))}</button></p>`;
  return `<div class="vz-ask" role="region" aria-label="${esc(T1("ask_t"))}"><h2>${T("ask_t")}</h2>
    <div class="vz-q"><p>${T("ask_oir")}</p>${yn("oir", ASK.oir)}</div>
    <div class="vz-q"><p>${T("ask_hablar")}</p>${yn("hablar", ASK.hablar)}</div>
    <p class="vz-small">${T("ask_help")}</p>
    <div class="vz-go"><button class="btn main" data-vz="askgo">${esc(T1("ask_go"))}</button>
    <label class="check"><input type="checkbox" data-vz="askfijo" ${PREF.fijo ? "checked" : ""}> ${esc(T1("ask_fijo"))}</label></div></div>`;
}
const V = {id: null, sents: [], idx: 0, playing: false, run: 0, rate: 0.9, recs: {}, rec: null, msg: "", nomic: false};

/* ---------- browser voice ---------- */
let voices = [];
const loadVoices = () => { try { voices = speechSynthesis.getVoices(); } catch (e) {} };
loadVoices(); try { speechSynthesis.addEventListener("voiceschanged", loadVoices); } catch (e) {}
function utter(text, rate) {
  const code = L().CAT.languages[L().S.learn].voice || L().S.learn, base = code.slice(0, 2);
  const u = new SpeechSynthesisUtterance(text); u.lang = code; u.rate = rate || V.rate;
  const v = voices.find(v => v.lang.replace("_", "-") === code && /Google|Mónica|Monica|Paulina|Microsoft/.test(v.name)) || voices.find(v => v.lang.replace("_", "-") === code) || voices.find(v => v.lang.slice(0, 2) === base);
  if (v) u.voice = v;
  return u;
}
let keep = null; /* keeps the utterance alive (Chrome drops events otherwise) */
function sayOnce(text, rate, after) {
  V.run++; V.playing = false; try { speechSynthesis.cancel(); } catch (e) {}
  const u = keep = utter(text, rate); if (after) u.onend = after;
  try { speechSynthesis.speak(u); } catch (e) {}
  paint();
}

/* ---------- karaoke ---------- */
function play(from) {
  try { speechSynthesis.cancel(); } catch (e) {}
  const run = ++V.run; V.playing = true;
  const step = n => {
    if (run !== V.run) return;
    if (n >= V.sents.length) { V.playing = false; V.idx = 0; paint(); award(2, "listen:" + V.id, V.id); return; }
    V.idx = n; paint(true);
    const u = keep = utter(V.sents[n].say);
    u.onend = () => { if (run !== V.run) return; if (speechSynthesis.speaking) { V.playing = false; paint(); return; } step(n + 1); };
    u.onerror = e => { if (run !== V.run) return; V.playing = false; paint(); };
    try { speechSynthesis.speak(u); } catch (e) { V.playing = false; paint(); }
  };
  step(from);
}
function halt() { V.run++; V.playing = false; try { speechSynthesis.cancel(); } catch (e) {} }

/* ---------- recording (audio stays on the device) ---------- */
const micAllowed = () => { try { const fp = document.permissionsPolicy || document.featurePolicy; return !fp || fp.allowsFeature("microphone"); } catch (e) { return true; } };
V.nomic = !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder || !micAllowed();
async function recStart() {
  halt();
  if (V.rec) return recStop();
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({audio: true}); }
  catch (e) { V.nomic = true; V.msg = "nomic"; paint(); return; }
  const chunks = [], mr = new MediaRecorder(stream), n = V.idx;
  V.rec = {mr, n, t: setTimeout(recStop, 20000)}; V.msg = "recording";
  mr.ondataavailable = e => e.data.size && chunks.push(e.data);
  mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); gotAudio(new Blob(chunks, {type: mr.mimeType || "audio/webm"}), n); };
  mr.start(); paint();
}
function recStop() { if (!V.rec) return; clearTimeout(V.rec.t); try { V.rec.mr.stop(); } catch (e) {} V.rec = null; paint(); }
function gotAudio(blob, n) {
  if (!blob.size || V.id !== L().R?.id) return;
  if (V.recs[n]) URL.revokeObjectURL(V.recs[n]);
  V.recs[n] = URL.createObjectURL(blob);
  const got = award(5, `rec:${V.id}:${n}`, V.id);
  V.msg = got ? ["xp", {n: typeof got === "number" ? got : 5}] : "";
  paint(); playMine(n);
}
let audio = null;
function playMine(n, then) {
  if (!V.recs[n]) { V.msg = "norec"; paint(); return; }
  try { if (audio) audio.pause(); audio = new Audio(V.recs[n]); if (then) audio.onended = then; audio.play().catch(() => {}); } catch (e) {}
}

/* ---------- drawing ---------- */
const bar = () => `<div class="vz-bar" role="group" aria-label="${esc(T1("listen"))}">
  <button class="btn main vz-play" data-vz="play">${svg(V.playing ? "pause" : "play")}<span>${esc(T1(V.playing ? "pause" : "listen"))}</span></button>
  <button class="btn vz-ic" data-vz="prev" aria-label="${esc(T1("prev"))}" title="${esc(T1("prev"))}">${svg("prev")}</button>
  <button class="btn vz-ic" data-vz="next" aria-label="${esc(T1("next"))}" title="${esc(T1("next"))}">${svg("next")}</button>
  <button class="btn vz-ic" data-vz="stop" aria-label="${esc(T1("stop"))}" title="${esc(T1("stop"))}">${svg("stop")}</button>
  <span class="vz-of">${esc(str(L().S.learn, "of", {n: V.idx + 1, t: V.sents.length}))}</span>
  <button class="btn vz-rate" data-vz="rate" aria-pressed="${V.rate < 0.8}" title="${esc(T1(V.rate < 0.8 ? "slow" : "normal"))}">${esc(str(L().S.learn, V.rate < 0.8 ? "slow" : "normal"))}</button></div>`;
function pron() {
  const n = V.idx, has = !!V.recs[n], done = Object.keys(V.recs).length, msg = Array.isArray(V.msg) ? V.msg : V.msg ? [V.msg] : V.nomic && !done ? ["nomic"] : null;
  return `<section class="ex vz-pron"><h2>${esc(str(L().S.learn, "pron"))}</h2>${L().both() ? `<p class="en" style="margin:2px 0 0">${esc(str(L().S.know, "pron"))}</p>` : ""}
  <p class="en">${esc(str(L().S.learn, "pron_help"))}${L().both() ? `<span style="display:block">${esc(str(L().S.know, "pron_help"))}</span>` : ""}</p>
  <div class="vz-card">
    <div class="vz-nav"><button class="btn vz-ic" data-vz="prev" aria-label="${esc(T1("prev"))}">${svg("prev")}</button>
      <span>${esc(str(L().S.learn, "of", {n: n + 1, t: V.sents.length}))}</span>
      <button class="btn vz-ic" data-vz="next" aria-label="${esc(T1("next"))}">${svg("next")}</button></div>
    <p class="vz-line" lang="${esc(L().S.learn)}">${esc(V.sents[n]?.say || "")}</p>
    <div class="vz-steps">
      <button class="btn" data-vz="hear">${svg("ear")}<span><b>1</b> ${esc(T1("hear"))}</span></button>
      ${V.nomic ? `<label class="btn vz-file">${svg("mic")}<span><b>2</b> ${esc(T1("phone"))}</span><input type="file" accept="audio/*,.m4a,.mp3,.wav,.aac,.ogg,.opus,.webm,.3gp,.amr" data-vz="file"></label>`
        : `<button class="btn ${V.rec ? "vz-live" : ""}" data-vz="rec" aria-pressed="${!!V.rec}">${svg(V.rec ? "stop" : "mic")}<span><b>2</b> ${esc(T1(V.rec ? "recstop" : "rec"))}</span></button>`}
      <button class="btn" data-vz="mine" ${has ? "" : "disabled"}>${svg("me")}<span><b>3</b> ${esc(T1("mine"))}</span></button>
      <button class="btn" data-vz="both" ${has ? "" : "disabled"}>${svg("both")}<span><b>4</b> ${esc(T1("both"))}</span></button>
    </div>
    ${msg ? `<p class="vz-msg ${msg[0] === "xp" ? "ok" : ""}" role="status">${T(...msg)}</p>` : ""}
    <p class="vz-small">${done ? esc(str(L().S.learn, "done", {n: done, t: V.sents.length})) + " " : ""}${esc(str(L().S.learn, "private"))}</p>
  </div></section>`;
}
function mount() {
  const R = L().R, art = app.querySelector(".reading");
  if (!art || !R || L().S.view !== "read") { if (V.playing) halt(); recStop(); return; }
  if (V.id !== R.id) { halt(); recStop(); Object.values(V.recs).forEach(u => URL.revokeObjectURL(u)); Object.assign(V, {id: R.id, idx: 0, recs: {}, msg: ""});
    V.sents = []; R.text.forEach((p, i) => split(p).forEach(s => V.sents.push({p: i, raw: s, say: L().plain(s)}))); }
  if (art.dataset.vz) return;
  art.dataset.vz = 1;
  const ps = art.querySelectorAll("p");
  R.text.forEach((p, i) => { if (!ps[i]) return; ps[i].innerHTML = V.sents.map((s, n) => s.p === i ? `<span class="vz-s" data-n="${n}">${L().tok(s.raw)}</span>` : "").filter(Boolean).join(" "); });
  const box = document.createElement("div"); box.className = "vz-box";
  art.before(box); box.append(art); box.insertAdjacentHTML("afterbegin", `<div class="vz-barw"></div>`);
  box.insertAdjacentHTML("afterend", `<div class="vz-pronw"></div>`);
  const how = app.querySelector(".howto"); (how || box).insertAdjacentHTML("beforebegin", `<div class="vz-askw"></div>`);
  paint();
}
function paint(scroll) {
  const art = app.querySelector(".reading[data-vz]"); if (!art) return;
  art.querySelectorAll(".vz-s.now,.vz-s.sel").forEach(e => e.classList.remove("now", "sel"));
  const cur = art.querySelector(`.vz-s[data-n="${V.idx}"]`);
  if (cur) { cur.classList.add(V.playing ? "now" : "sel");
    if (scroll && V.playing) { const r = cur.getBoundingClientRect(); if (r.top < 80 || r.bottom > innerHeight - 90) cur.scrollIntoView({block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}); } }
  const b = app.querySelector(".vz-barw"), p = app.querySelector(".vz-pronw");
  if (b) { b.classList.remove("fx"); b.style.minHeight = ""; b.innerHTML = bar(); if (V.playing) { b.style.minHeight = b.offsetHeight + "px"; b.classList.add("fx"); } }
  if (p) p.innerHTML = pron();
  const q = app.querySelector(".vz-askw"); if (q) q.innerHTML = askHTML();
}
new MutationObserver(mount).observe(app, {childList: true});
mount();

/* ---------- actions ---------- */
document.addEventListener("click", e => {
  /* the old single «Escuchar» button now starts karaoke */
  const old = e.target.closest('[data-act="listen"]');
  if (old && app.querySelector(".reading[data-vz]")) { e.stopPropagation(); e.preventDefault(); V.playing ? halt() : play(V.idx); paint(); return; }
  const b = e.target.closest("[data-vz]"); if (!b || b.tagName === "INPUT") return;
  if (b.dataset.vz === "ask") { ASK[b.dataset.k] = b.dataset.v === "1"; paint(); return; }
  if (b.dataset.vz === "askopen") { Object.assign(ASK, {open: true, oir: PREF.oir, hablar: PREF.hablar}); paint(); app.querySelector(".vz-ask")?.scrollIntoView({block: "nearest"}); return; }
  if (b.dataset.vz === "askgo") {
    const f = app.querySelector('[data-vz="askfijo"]');
    Object.assign(PREF, {oir: ASK.oir, hablar: ASK.hablar, fijo: !!f?.checked}); ASK.open = false;
    ls.set("lyaVozPref", PREF); ls.set("lyaVozPreguntado", 1, sessionStorage); applyPref(); paint(); return;
  }
  const a = b.dataset.vz, N = V.sents.length;
  if (a !== "rec") recStop();
  if (a !== "both" && a !== "mine" && audio) audio.pause();
  if (a === "play") { V.playing ? halt() : play(V.idx); paint(); }
  else if (a === "stop") { halt(); V.idx = 0; paint(); }
  else if (a === "prev" || a === "next") { const n = Math.max(0, Math.min(N - 1, V.idx + (a === "next" ? 1 : -1))); V.msg = ""; if (V.playing) play(n); else { V.idx = n; paint(true); } }
  else if (a === "rate") { V.rate = V.rate < 0.8 ? 0.9 : 0.7; if (V.playing) play(V.idx); else paint(); }
  else if (a === "hear") { V.msg = ""; sayOnce(V.sents[V.idx].say, Math.min(V.rate, 0.85)); }
  else if (a === "rec") recStart();
  else if (a === "mine") { halt(); paint(); playMine(V.idx); }
  else if (a === "both") { const n = V.idx; sayOnce(V.sents[n].say, Math.min(V.rate, 0.85), () => playMine(n)); }
  else if (a === "word") { const w = document.querySelector("#tip small")?.textContent; if (w) { halt(); paint(); try { speechSynthesis.speak(keep = utter(w, 0.75)); } catch (err) {} } }
}, true);
document.addEventListener("change", e => {
  const f = e.target.closest('[data-vz="file"]'); if (!f || !f.files[0]) return;
  gotAudio(f.files[0], V.idx); f.value = "";
});

/* ---------- speaker button in the word bubble ---------- */
const tip = document.getElementById("tip");
if (tip && !tip.querySelector(".vz-word")) {
  const bt = document.createElement("button");
  bt.type = "button"; bt.className = "vz-word"; bt.dataset.vz = "word"; bt.innerHTML = svg("ear");
  /* en el idioma de la web (el que se aprende) */
  const ETQ = {es: "Escuchar la palabra", en: "Listen to the word", ca: "Escoltar la paraula"};
  const etq = () => { let l = "es"; try { l = window.LYA.S.learn; } catch (e) {} bt.setAttribute("aria-label", ETQ[l] || ETQ.es); bt.title = ETQ[l] || ETQ.es; };
  etq(); addEventListener("hashchange", etq); tip.addEventListener("pointerenter", etq); bt.addEventListener("focus", etq);
  tip.prepend(bt);
}
/* for dictados.js: is sound on? turn it on */
window.LYAVoz = {oir: () => PREF.oir, setOir: v => { PREF.oir = !!v; ASK.oir = PREF.oir; ls.set("lyaVozPref", PREF); applyPref(); }};
addEventListener("pagehide", halt);
applyPref();
}
}
