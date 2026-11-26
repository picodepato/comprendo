/* Mini-juegos: cartas de memoria, contrarreloj y adivina la palabra.
   Usa window.LYA (creado en index.html) y sus textos en content/textos-juegos.json.
   Rutas: #juegos (sala), #juego-<tipo> (palabras del diccionario), #juego-<tipo>--<lectura> (palabras de una lectura).
   Puntos: emite el evento window "lya:xp" (uno por respuesta con ok, y uno al terminar con n). */
(() => {
const GAMES = ["cartas", "reloj", "ahorcado"];
const ICON = {cartas: "🃏", reloj: "⏱️", ahorcado: "🔤"};
const STOP = new Set("el la los las un una unos unas de del al a en y o que es son con por para su sus se lo le les me te mi tu muy más pero como hay está están ser fue era también este esta estos estas ese esa eso cada otro otra no sí ya hoy els les uns unes amb per és són hi ha seu seva seus seves molt més però com està estan era eren també aquest aquesta aquests aquestes això cada altre altra altres sí ja avui".split(" "));
let TX = null;
const txP = fetch("content/textos-juegos.json").then(r => r.json()).then(j => (TX = j)).catch(() => (TX = {}));
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const tl = (k, lang, v) => { let s = (TX?.[lang] || TX?.es || {})[k] ?? (TX?.es || {})[k] ?? k; for (const x in v || {}) s = s.split(`{${x}}`).join(v[x]); return s; };
const both = () => { try { return L().both(); } catch (e) { return false; } };
/* inline "texto · text" (second language only in A1) */
const T = (k, v) => { const {S} = st(); const a = tl(k, S.learn, v), b = tl(k, S.know, v); return esc(a) + (both() && b !== a ? " · " + esc(b) : ""); };
/* block: main + small line */
const TB = (k, v) => { const {S} = st(); const a = tl(k, S.learn, v), b = tl(k, S.know, v); return esc(a) + (both() && b !== a ? `<span class="en" style="display:block">${esc(b)}</span>` : ""); };
const lname = c => { try { const {CAT, S} = st(); return CAT.languages[c].name[S.learn] || c; } catch (e) { return c; } };
const xp = d => { try { dispatchEvent(new CustomEvent("lya:xp", {detail: d})); } catch (e) {} };
const say = w => { try { if (st().S.say) L().speak(w, 1); } catch (e) {} };
const baseCh = c => c === "ñ" ? "ñ" : c.normalize("NFD").replace(/[̀-ͯ]/g, "");
const prog = () => { const {S} = st(); S.juegos ||= {best: {}, plays: 0, solved: 0}; S.juegos.best ||= {}; return S.juegos; };

/* ---------- word pools ---------- */
function entry(w, k, t, d) { return {w, k: k.toLowerCase(), t, d: d || ""}; }
async function readingWords(id) {
  const {S, PK} = st(), meta = L().rdById(id); if (!meta?.file) return [];
  const R = await L().loadReading(meta.file), tr = R.tr?.[S.know] || {}, out = new Map();
  const NAME = L().NAME;
  const add = (w, key, t) => {
    const k = (key || w).toLowerCase(); if (out.has(k)) return;
    const d = PK.def[k]; t = t || tr.words?.[k] || PK.tr[k];
    if (!t || (d && NAME && NAME.test(d[1])) || /^\d+$/.test(w)) return;
    out.set(k, entry(w, k, t, d ? d[1] : ""));
  };
  (R.vocab || []).forEach(([w, emo], i) => { add(w, w, (tr.vocab || [])[i]); const e = out.get(w.toLowerCase()); if (e && emo) e.emo = emo; });
  for (const d of S.dict) if (d.r === id && d.l === S.learn) add(d.w, d.k, d.tr?.[S.know] || d.t);
  const txt = (R.text || []).join(" ");
  const re = /\[([^\]|]+)(?:\|([^\]]+))?\]|([A-Za-zÁÉÍÓÚÜÑáéíóúüñÀÈÒÇÏàèòçï·]+)/g; let m;
  const cand = [];
  while ((m = re.exec(txt))) { if (m[1]) cand.push([m[1], m[2] || m[1]]); else if (m[3].length >= 4 && !STOP.has(m[3].toLowerCase()) && !/^[A-ZÁÉÍÓÚÑÀÈÒÇ]/.test(m[3])) cand.push([m[3], m[3]]); }
  for (const [w, k] of shuf(cand)) add(w.toLowerCase() === w ? w : w, k);
  return [...out.values()];
}
function dictWords() {
  const {S, PK} = st(), out = new Map();
  for (const d of S.dict) {
    if (d.l !== S.learn || out.has(d.k)) continue;
    const t = d.tr?.[S.know] || d.t, df = PK.def[d.k];
    if (t) out.set(d.k, entry(d.w, d.k, t, df ? df[1] : (d.d || "").replace(/^[^:]*:\s*/, "")));
  }
  return [...out.values()];
}
async function poolFor(src) {
  if (src) return {words: await readingWords(src), few: false};
  const {S} = st(); let words = dictWords(); const have = words.length;
  if (words.length < 12) {
    const rs = shuf(L().rdList().filter(r => r.file && r.level === S.level));
    for (const r of rs) {
      if (words.length >= 18) break;
      const more = (await readingWords(r.id)).slice(0, 8);
      for (const e of more) if (!words.some(x => x.k === e.k)) words.push(e);
    }
  }
  return {words, few: have < 12, have};
}

/* ---------- state & routing ---------- */
let G = null, runN = 0, timer = null;
const parse = h => {
  h = (h || location.hash).replace(/^#/, "");
  if (h === "juegos" || h === "practicar") return {room: true}; /* #practicar: apartado «Practicar» de la barra */
  const m = h.match(/^juego-(cartas|reloj|ahorcado)(?:--(.+))?$/);
  return m ? {game: m[1], src: m[2] || null} : null;
};
const isGames = h => !!parse(h) || !!window.LYAGram?.is(h ?? location.hash) || !!window.LYAGarabatos?.is(h ?? location.hash);
const stopTimer = () => { clearInterval(timer); timer = null; };
const app = () => document.getElementById("app");

async function render(el) {
  el = el || app();
  if (window.LYAGram?.is(location.hash)) { ++runN; stopTimer(); G = null; return window.LYAGram.render(el); } /* gramatica/gramatica.js */
  if (window.LYAGarabatos?.is(location.hash)) { ++runN; stopTimer(); G = null; return window.LYAGarabatos.render(el); } /* garabatos/garabatos.js */
  const n = ++runN, r = parse();
  await txP;
  if (!r) return;
  const {S} = st();
  const meta = r.src ? L().rdById(r.src) : null;
  if (meta) S.level = meta.level; /* buttons follow the level of the reading */
  L().setAcc(meta ? meta.t.color : "#ff4141");
  if (r.room) { stopTimer(); G = null; return renderRoom(el, n); }
  if (G && G.hash === location.hash && !G.over) return draw();
  stopTimer();
  el.innerHTML = `<p class="msg">${T("loading")}</p>`;
  const pool = await poolFor(r.src);
  if (n !== runN) return;
  G = {hash: location.hash, game: r.game, src: r.src, meta, pool: pool.words, lvl: meta ? meta.level : S.level};
  setup();
  draw();
}

/* ---------- room & offer ---------- */
function tile(g, src) {
  const p = prog(), b = p.best[g];
  const rec = g === "ahorcado" ? (p.solved ? tl("best_ahorcado", st().S.learn, {n: p.solved}) : "") : b != null ? tl("best_" + g, st().S.learn, {n: b}) : "";
  return `<a class="gtile" href="#juego-${g}${src ? "--" + esc(src) : ""}"><span class="gi" aria-hidden="true">${ICON[g]}</span>
    <span class="gn">${T("g_" + g)}</span><span class="gd">${TB("d_" + g)}</span>${rec ? `<span class="gr">${esc(rec)}</span>` : ""}<span class="btn main gp">${T("play")}</span></a>`;
}
async function renderRoom(el, n) {
  const {S} = st();
  el.innerHTML = `<p class="msg">${T("loading")}</p>`;
  const pool = await poolFor(null); if (n !== runN) return;
  el.innerHTML = `<section class="intro gintro"><div class="in"><h1>${esc(tl("sala_title", S.learn))}</h1>
    ${both() ? `<p class="en">${esc(tl("sala_title", S.know))}</p>` : ""}<p class="lead">${TB("sala_sub")}</p>
    <p class="gnote">${pool.few ? TB("sala_few", {n: pool.have}) : TB("sala_dict", {n: pool.words.length})}</p></div></section>
    ${window.LYANav ? window.LYANav.practicarExtra() : ""}${window.LYAGram ? window.LYAGram.room() : ""}
    ${window.LYANav ? `<h2 class="nvh2 gmini">🎲 ${esc(window.LYANav.t("t_juegos"))}</h2>` : ""}<div class="ggrid">${GAMES.map(g => tile(g, null)).join("")}</div>${!window.LYANav && window.LYAGarabatos ? window.LYAGarabatos.room() : ""}`;  /* Garabatos está en «En grupo» */
}
function offer(meta) {
  if (!TX || !meta) return "";
  return `<section class="ex goffer"><h2><span>★</span> ${esc(tl("offer_title", st().S.learn))}</h2><p class="en">${TB("offer_sub")}</p>
    <div class="ggrid small">${GAMES.map(g => tile(g, meta.id)).join("")}${window.LYAGram ? window.LYAGram.offerTiles(meta) : ""}</div></section>`;
}

/* ---------- setup per game ---------- */
function setup() {
  const P = G.pool;
  G.over = false; G.xp = 0; G.fails = [];
  if (G.game === "cartas") {
    const pick = shuf(P.slice(0, 10)).slice(0, 6); /* reading vocabulary comes first in the pool */
    G.pairs = pick.length; G.moves = 0; G.found = 0; G.open = []; G.lock = false;
    G.cards = shuf(pick.flatMap((e, i) => [{i, side: "w", e}, {i, side: "t", e}])).map(c => ({...c, up: false, done: false}));
  } else if (G.game === "reloj") {
    G.left = 60; G.hits = 0; G.n = 0; G.started = false; G.cur = null; G.pick = null;
    G.order = shuf(P);
  } else {
    const ok = P.filter(e => /^[a-záéíóúüñàèòçï]{3,12}$/i.test(e.w) && e.d);
    G.words = shuf(ok.slice(0, 12)).slice(0, 5); G.i = 0; G.solved = 0; G.newRound = true;
    nextWord();
  }
}
function nextWord() {
  const e = G.words[G.i]; if (!e) return;
  G.cur = e; G.guess = new Set(); G.miss = 0; G.showTr = false; G.wordDone = null;
}

/* ---------- drawing ---------- */
function head(stats) {
  const {S} = st(), from = G.meta ? tl("words_from", S.learn, {t: G.meta.title[S.learn] || G.meta.title.es}) : tl("words_dict", S.learn);
  const back = G.meta ? `<a class="btn" href="#${esc(G.src)}">${T("back_read")}</a>` : `<a class="btn" href="#juegos">${T("to_room")}</a>`;
  return `<div class="ghead"><div><p class="meta"><span>${G.lvl}</span><a href="#juegos">${esc(tl("sala_title", S.learn))}</a></p>
    <h1>${ICON[G.game]} ${esc(tl("g_" + G.game, S.learn))}</h1><p class="en">${esc(from)}</p></div>${back}</div>
    ${stats ? `<div class="gstats">${stats}</div>` : ""}`;
}
const stat = (k, v, id) => `<div class="gs"><small>${T(k)}</small><b${id ? ` id="${id}"` : ""}>${v}</b></div>`;

function draw() {
  const el = app(); if (!G) return;
  if (G.over) return el.innerHTML = `<div class="wrap gm">${head()}${resultHTML()}</div>`;
  const min = G.game === "cartas" ? 3 : G.game === "reloj" ? 4 : 1;
  const size = G.game === "cartas" ? G.pairs : G.game === "reloj" ? G.pool.length : G.words.length;
  if (size < min) return el.innerHTML = `<div class="wrap gm">${head()}<p class="empty">${TB("too_few")}</p></div>`;
  el.innerHTML = `<div class="wrap gm">${G.game === "cartas" ? cartasHTML() : G.game === "reloj" ? relojHTML() : ahorcadoHTML()}</div>`;
}

/* cartas */
function cartasHTML() {
  return head(stat("pairs", `${G.found} / ${G.pairs}`) + stat("moves", G.moves)) +
    `<div class="mem" role="grid">${G.cards.map((c, j) => {
      const face = c.side === "w" ? `<b>${esc(c.e.w)}</b>` : `${c.e.emo ? `<span class="emo">${esc(c.e.emo)}</span>` : ""}<span>${esc(c.e.t)}</span>`;
      return `<button class="mc${c.up || c.done ? " up" : ""}${c.done ? " done" : ""}${c.side === "t" ? " tside" : ""}" data-g="flip" data-j="${j}" ${c.done ? "disabled" : ""} aria-label="${c.up || c.done ? esc(c.side === "w" ? c.e.w : c.e.t) : "?"}">
        <span class="mb" aria-hidden="true">?</span><span class="mf">${face}</span></button>`;
    }).join("")}</div>`;
}
function flip(j) {
  const c = G.cards[j]; if (G.lock || c.up || c.done) return;
  c.up = true; G.open.push(j); if (c.side === "w") say(c.e.w);
  if (G.open.length === 2) {
    G.moves++;
    const [a, b] = G.open.map(x => G.cards[x]);
    if (a.i === b.i) { a.done = b.done = true; G.found++; G.open = []; xp({n: 0, xp: 0, ok: true, src: "juego", juego: "cartas"}); if (G.found === G.pairs) return finish(); }
    else { G.lock = true; setTimeout(() => { a.up = b.up = false; G.open = []; G.lock = false; if (G?.game === "cartas") draw(); }, 950); }
  }
  draw();
}

/* reloj */
function makeQ() {
  const {S, PK} = st();
  if (!G.order.length) G.order = shuf(G.pool);
  const e = G.order.shift(), dir = G.lvl === "A1" ? "learn" : Math.random() < .5 ? "learn" : "know";
  const ans = dir === "learn" ? e.t : e.w;
  const fromPool = G.pool.filter(x => x.k !== e.k).map(x => dir === "learn" ? x.t : x.w);
  const NAME = L().NAME;
  const extra = shuf(Object.entries(PK.tr)).slice(0, 40).filter(([k]) => !(NAME && NAME.test(PK.def[k]?.[1] || ""))).map(([k, t]) => dir === "learn" ? t : k);
  const opts = [];
  for (const o of shuf(fromPool).concat(extra)) { if (o && o !== ans && !opts.includes(o)) opts.push(o); if (opts.length === 3) break; }
  G.cur = {e, dir, ans, opts: shuf([ans, ...opts])}; G.pick = null;
}
function relojHTML() {
  const {S} = st();
  if (!G.started) return head() + `<div class="qc gstart"><p class="prompt">${T("d_reloj")}</p><p class="mnote">${TB("reloj_help")}</p>
    <div class="row"><button class="btn main" data-g="go">${T("start")}</button></div></div>`;
  const q = G.cur, done = G.pick !== null;
  const ob = q.opts.map((o, j) => { let c = "opt"; if (done) c += o === q.ans ? " right" : j === G.pick ? " wrong" : " dim"; return `<button class="${c}" data-g="ans" data-o="${j}" ${done ? "disabled" : ""}><span class="k">${j + 1}</span><span>${esc(o)}</span></button>`; }).join("");
  const sub = q.dir === "learn" ? tl("q_mean", S.learn, {lang: S.learn === "en" ? lname(S.know) : lname(S.know).toLowerCase()}) : tl("q_say", S.learn, {lang: S.learn === "en" ? lname(S.learn) : lname(S.learn).toLowerCase()});
  return head(stat("time", `${G.left}s`, "gclock") + stat("hits", G.hits)) +
    `<div class="tbar"><i id="gbar" style="width:${G.left / 60 * 100}%"></i></div>
    <div class="qc"><p class="prompt"><em>«${esc(q.dir === "learn" ? q.e.w : q.e.t)}»</em></p><p class="en" style="margin:4px 0 16px">${esc(sub)}</p><div class="opts">${ob}</div></div>`;
}
function go() {
  G.started = true; makeQ(); say(G.cur.dir === "learn" ? G.cur.e.w : "");
  const h = G.hash;
  timer = setInterval(() => {
    if (!G || G.hash !== location.hash || G.over) return stopTimer();
    G.left--;
    const c = document.getElementById("gclock"), b = document.getElementById("gbar");
    if (c) c.textContent = G.left + "s"; if (b) b.style.width = (G.left / 60 * 100) + "%";
    if (G.left <= 0) { stopTimer(); finish(); }
  }, 1000);
  draw();
}
function answer(j) {
  if (!G.started || G.pick !== null || G.over) return;
  G.pick = j; const ok = G.cur.opts[j] === G.cur.ans; G.n++;
  if (ok) G.hits++; else if (!G.fails.some(x => x.k === G.cur.e.k)) G.fails.push(G.cur.e);
  markMiss(G.cur.e, ok);
  xp({n: 0, xp: 0, ok, src: "juego", juego: "reloj"});
  draw();
  setTimeout(() => { if (!G || G.over || G.game !== "reloj") return; makeQ(); draw(); }, ok ? 350 : 1100);
}

/* ahorcado */
const KB = ["qwertyuiop", "asdfghjklñ", "zxcvbnm"];
const MAXF = 7;
function ahorcadoHTML() {
  const {S} = st(), e = G.cur, letters = [...e.w.toLowerCase()];
  const shown = letters.map(c => G.guess.has(baseCh(c)) || G.wordDone ? `<span class="hl${G.guess.has(baseCh(c)) ? "" : " miss"}">${esc(c)}</span>` : `<span class="hl"> </span>`).join("");
  const hearts = Array.from({length: MAXF}, (_, i) => `<span class="${i < MAXF - G.miss ? "" : "lost"}">♥</span>`).join("");
  const keys = KB.map(row => `<div class="krow">${[...row].map(k => {
    const used = G.guess.has(k), good = used && letters.some(c => baseCh(c) === k);
    return `<button class="key${used ? (good ? " good" : " bad") : ""}" data-g="key" data-k="${k}" ${used || G.wordDone ? "disabled" : ""}>${k}</button>`;
  }).join("")}</div>`).join("");
  const end = G.wordDone ? `<p class="fb ${G.wordDone === "ok" ? "ok" : "no"}">${G.wordDone === "ok" ? T("solved") : `${T("failed")} <b>${esc(e.w)}</b>`} · ${esc(e.t)}</p>
    <div class="row"><button class="btn main" data-g="nextw">${T(G.i + 1 < G.words.length ? "next" : "see_res")}</button></div>` : "";
  return head(stat("word", `${G.i + 1} / ${G.words.length}`) + stat("lives", `<span class="hearts">${hearts}</span>`)) +
    `<div class="qc"><p class="mnote" style="margin:0 0 4px">${T("clue")}</p><p class="gclue">${esc(e.d)}</p>
    ${G.showTr || G.wordDone ? `<p class="en">${esc(lname(S.know))}: <b>${esc(e.t)}</b></p>` : `<button class="btn" data-g="tr">${T("show_tr")}</button>`}
    <div class="hword" aria-live="polite">${shown}</div>${end}
    ${G.wordDone ? "" : `<div class="kb">${keys}</div><p class="mnote">${T("keys_help")}</p>`}</div>`;
}
function guess(k) {
  if (G.wordDone || G.guess.has(k)) return;
  G.guess.add(k);
  const letters = [...G.cur.w.toLowerCase()].map(baseCh);
  if (!letters.includes(k)) G.miss++;
  if (letters.every(c => G.guess.has(c))) { G.wordDone = "ok"; G.solved++; say(G.cur.w); xp({n: 0, xp: 0, ok: true, src: "juego", juego: "ahorcado"}); markMiss(G.cur, true); }
  else if (G.miss >= MAXF) { G.wordDone = "no"; G.fails.push(G.cur); say(G.cur.w); xp({n: 0, xp: 0, ok: false, src: "juego", juego: "ahorcado"}); markMiss(G.cur, false); }
  draw();
}

/* words that fail in a game go to "Repasar" in the dictionary (only if saved there) */
function markMiss(e, ok) {
  try { const {S} = st(); let ch = false; for (const d of S.dict) if (d.k === e.k && d.l === S.learn) { if (!ok && !d.miss) { d.miss = true; ch = true; } if (ok && d.miss && G.game !== "cartas") { d.miss = false; ch = true; } } if (ch) L().save(); } catch (err) {}
}

/* ---------- result ---------- */
function finish() {
  stopTimer();
  const p = prog(), lect = G.src || null; let n = 0, ac = 0, tot = 0, rec = false;
  if (G.game === "cartas") { n = G.pairs * 2 + (G.moves <= G.pairs * 1.5 ? 6 : G.moves <= G.pairs * 2 ? 3 : 0); ac = G.pairs; tot = G.pairs;
    if (G.pairs === 6 && (p.best.cartas == null || G.moves < p.best.cartas)) { p.best.cartas = G.moves; rec = true; } }
  else if (G.game === "reloj") { n = G.hits * 2; ac = G.hits; tot = G.n; if (G.hits > 0 && (p.best.reloj == null || G.hits > p.best.reloj)) { p.best.reloj = G.hits; rec = true; } }
  else { n = G.solved * 4; ac = G.solved; tot = G.words.length; p.solved = (p.solved || 0) + G.solved; }
  p.plays = (p.plays || 0) + 1;
  G.over = true; G.xp = n; G.rec = rec;
  try { L().save(); } catch (e) {}
  if (n > 0) xp({n, xp: n, src: "juego", juego: G.game, lectura: lect, aciertos: ac, total: tot});
  draw(); scrollTo(0, 0);
}
function resultHTML() {
  const line = G.game === "cartas" ? T("res_cartas", {p: G.pairs, m: G.moves}) : G.game === "reloj" ? T("res_reloj", {n: G.hits}) : T("res_ahorcado", {n: G.solved, t: G.words.length});
  const others = GAMES.filter(g => g !== G.game);
  return `<div class="res gres"><p class="mnote" style="margin:0">${T("end")}</p><div class="big">${esc(tl("xp", st().S.learn, {n: G.xp}))}</div>
    <p style="margin:0;font-weight:500">${line}</p>${G.rec ? `<p class="fb ok">🏆 ${T("new_best")}</p>` : ""}
    ${G.fails.length ? `<p class="mnote" style="margin-top:16px">${T("review")}</p><ul class="words">${G.fails.map(d => `<li class="miss"><div><b>${esc(d.w)}</b><span>${esc(d.t)}</span></div></li>`).join("")}</ul>` : ""}
    <div class="row"><button class="btn main" data-g="again">${T("again")}</button>
    ${others.map(g => `<a class="btn" href="#juego-${g}${G.src ? "--" + esc(G.src) : ""}">${ICON[g]} ${T("g_" + g)}</a>`).join("")}
    ${G.meta ? `<a class="btn" href="#${esc(G.src)}">${T("back_read")}</a>` : ""}<a class="btn" href="#juegos">${T("to_room")}</a></div></div>`;
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-g]"); if (!b || !G || !b.closest("#app")) return;
  const a = b.dataset.g;
  if (a === "flip") flip(+b.dataset.j);
  else if (a === "go") go();
  else if (a === "ans") answer(+b.dataset.o);
  else if (a === "key") guess(b.dataset.k);
  else if (a === "tr") { G.showTr = true; draw(); }
  else if (a === "nextw") { G.i++; if (G.i >= G.words.length) finish(); else { nextWord(); draw(); } }
  else if (a === "again") { setup(); draw(); scrollTo(0, 0); }
});
document.addEventListener("keydown", e => {
  if (!G || G.over || G.hash !== location.hash || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "")) return;
  const k = e.key.toLowerCase();
  if (G.game === "reloj" && G.started && /^[1-4]$/.test(k)) { e.preventDefault(); answer(+k - 1); }
  else if (G.game === "reloj" && !G.started && k === "enter") { e.preventDefault(); go(); }
  else if (G.game === "ahorcado" && !G.wordDone && /^[a-zñ]$/.test(k)) { e.preventDefault(); guess(k); }
  else if (G.game === "ahorcado" && G.wordDone && k === "enter") { e.preventDefault(); document.querySelector('[data-g="nextw"]')?.click(); }
});

const tab = () => { try { const {S} = st(); return esc(tl("tab", S.learn)) + (both() ? `<span class="tk"> · ${esc(tl("tab", S.know))}</span>` : ""); } catch (e) { return "Juegos"; } };
/* texts arrive after the first paint: repaint once so the tab and the offer appear */
txP.then(() => { try { const {S} = st(); if (S && S.view !== "games") L().renderPage(); } catch (e) {} });
window.LYAJuegos = {render, offer, isGames, tab, ready: txP};
})();
