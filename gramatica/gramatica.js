/* Juegos de gramática y verbos: conjuga contra reloj, ordena la frase, caza el error,
   pasado/presente/futuro (frases que caen) y memoria de verbos.
   Datos: content/gramatica-<idioma>.json (hecho con build/gramatica/mk.py a partir de las lecturas).
   Textos: content/textos-gramatica.json. Rutas: #gram-<juego> y #gram-<juego>--<lectura>.
   Se engancha en la sala de juegos (juegos/juegos.js). Puntos: evento window "lya:xp".
   Progreso: S.gram = {best: {"<juego>-<nivel>": n}, plays} (se guarda con la cuenta). */
(() => {
const GAMES = ["conj", "orden", "error", "tiempos", "memoria"];
const ICON = {conj: "⚡", orden: "🧩", error: "🔍", tiempos: "⏳", memoria: "🧠"};
const LVS = ["A1", "A2", "B1", "B2"];
let TX = null;
const txP = fetch("content/textos-gramatica.json").then(r => r.json()).then(j => (TX = j)).catch(() => (TX = {}));
const DATA = {};
const loadData = lang => DATA[lang] ||= fetch(`content/gramatica-${lang}.json`).then(r => r.json()).catch(() => null);
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const tl = (k, lang, v) => { let s = (TX?.[lang] || TX?.es || {})[k] ?? (TX?.es || {})[k] ?? k; for (const x in v || {}) s = s.split(`{${x}}`).join(v[x]); return s; };
const both = () => { try { return L().both(); } catch (e) { return false; } };
const T = (k, v) => { const {S} = st(); return esc(tl(k, S.learn, v)) + (both() ? " · " + esc(tl(k, S.know, v)) : ""); };
const TB = (k, v) => { const {S} = st(); return esc(tl(k, S.learn, v)) + (both() ? `<span class="en" style="display:block">${esc(tl(k, S.know, v))}</span>` : ""); };
const xp = d => { try { dispatchEvent(new CustomEvent("lya:xp", {detail: d})); } catch (e) {} };
const say = w => { try { if (st().S.say) L().speak(w, 1); } catch (e) {} };
const prog = () => { const {S} = st(); S.gram ||= {best: {}, plays: 0}; S.gram.best ||= {}; return S.gram; };
const lvN = lv => LVS.indexOf(lv);
const plainA = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ñ/g, "n");
const pickSome = (arr, n) => shuf(arr).slice(0, n);

/* ---------- routing ---------- */
let G = null, runN = 0, timer = null, raf = 0;
const parse = h => {
  h = (h ?? location.hash).replace(/^#/, "");
  const m = h.match(/^gram-(conj|orden|error|tiempos|memoria)(?:--(.+))?$/);
  return m ? {game: m[1], src: m[2] || null} : null;
};
const is = h => !!parse(h);
const stop = () => { clearInterval(timer); timer = null; cancelAnimationFrame(raf); raf = 0; };
const app = () => document.getElementById("app");
const alive = g => G === g && G.hash === location.hash && !G.over;

async function render(el) {
  el = el || app();
  const n = ++runN, r = parse();
  if (!r) return;
  await txP;
  const {S} = st();
  const meta = r.src ? L().rdById(r.src) : null;
  if (meta) S.level = meta.level;
  L().setAcc(meta ? meta.t.color : "#7c5cff");
  if (G && G.hash === location.hash && G.learn === S.learn && G.lvl === (meta ? meta.level : S.level)) return draw();
  stop();
  el.innerHTML = `<p class="msg">${T("loading")}</p>`;
  const D = await loadData(S.learn);
  if (n !== runN) return;
  G = {hash: location.hash, game: r.game, src: r.src, meta, D, learn: S.learn, lvl: meta ? meta.level : S.level};
  setup();
  draw();
}

/* ---------- room tiles & reading offer ---------- */
function tile(g, src) {
  const {S} = st(), b = prog().best[g + "-" + S.level];
  return `<a class="gtile grtile" href="#gram-${g}${src ? "--" + esc(src) : ""}"><span class="gi" aria-hidden="true">${ICON[g]}</span>
    <span class="gn">${T("g_" + g)}</span><span class="gd">${TB("d_" + g)}</span>${b != null && !src ? `<span class="gr">${esc(tl("best", S.learn, {lv: S.level, n: b}))}</span>` : ""}<span class="btn main gp">${T("play")}</span></a>`;
}
function lvPick() {
  const {S} = st();
  return `<div class="grlv" role="group" aria-label="${esc(tl("level", S.learn))}"><span>${T("level")}:</span>${LVS.map(l => `<button class="btn${l === S.level ? " main" : ""}" data-gr="lv" data-l="${l}" aria-pressed="${l === S.level}">${l}</button>`).join("")}</div>`;
}
function room() {
  if (!TX) return "";
  const {S} = st();
  return `<section class="grsec" aria-labelledby="grsec-h"><div class="grsec-in"><h2 id="grsec-h">✏️ ${esc(tl("sec_title", S.learn))}</h2>
    ${both() ? `<p class="en">${esc(tl("sec_title", S.know))}</p>` : ""}<p class="lead">${TB("sec_sub")}</p>${lvPick()}</div>
    <div class="ggrid">${GAMES.map(g => tile(g, null)).join("")}</div></section>`;
}
function offerTiles(meta) {
  if (!TX || !meta) return "";
  return ["orden", "error"].map(g => tile(g, meta.id)).join("");
}

/* ---------- pools ---------- */
const upTo = (arr, lv) => arr.filter(x => lvN(x.lv) <= lvN(lv));
function fromSrc(arr, min) {
  if (G.src) { const a = arr.filter(x => x.r === G.src); if (a.length >= min) return a; }
  const now = arr.filter(x => x.lv === G.lvl);
  return now.length >= min ? now : upTo(arr, G.lvl);
}
const TENSES = {es: {A1: ["pres"], A2: ["pres", "pret"], B1: ["pret", "imp", "fut", "pres"], B2: ["pret", "imp", "fut", "pres"]}, en: {A1: ["pres"], A2: ["pres", "past"], B1: ["past", "fut", "perf"], B2: ["past", "fut", "perf"]}};
const tname = (t, lang) => tl(t === "pret" && (G.lvl === "B1" || G.lvl === "B2") ? "t_pret_b1" : "t_" + t, lang);
const tLabel = t => { const {S} = st(); return esc(tname(t, S.learn)) + (both() ? ` · ${esc(tname(t, S.know))}` : ""); };

/* ---------- setup ---------- */
function setup() {
  const D = G.D; G.over = false; G.xp = 0; G.fails = []; G.hits = 0; G.n = 0;
  if (!D) { G.size = 0; return; }
  const g = G.game;
  if (g === "conj") {
    const verbs = upTo(D.verbs, G.lvl), ts = TENSES[G.learn === "en" ? "en" : "es"][G.lvl];
    G.combos = []; for (const v of verbs) for (const t of ts) for (let p = 0; p < 5; p++) if (v.f[t]) G.combos.push({v, t, p});
    G.allCombos = G.combos; G.combos = shuf(G.combos); G.size = G.combos.length;
    G.start = G.lvl === "A1" ? 25 : 20; G.bonus = G.lvl === "A1" ? 6 : 5; G.left = G.start; G.started = false; G.fb = null;
  } else if (g === "orden") {
    G.items = pickSome(fromSrc(D.order, 3), 6).map(o => mkOrder(o)); G.i = 0; G.size = G.items.length;
  } else if (g === "error") {
    G.items = pickSome(fromSrc(D.error, 3), G.src ? 6 : 8).map(o => mkErr(o)); G.i = 0; G.size = G.items.length;
  } else if (g === "tiempos") {
    const pool = upTo(D.tense, G.lvl), by = {past: [], pres: [], fut: []};
    for (const x of pool) by[x.t]?.push(x);
    for (const k in by) by[k] = shuf(by[k]).sort((a, b) => (b.lv === G.lvl) - (a.lv === G.lvl));
    G.queue = []; const order = [];
    for (let i = 0; i < 10; i++) order.push(...shuf(["past", "pres", "fut"]));
    for (const k of order) { const x = by[k].shift(); if (x) G.queue.push(x); }
    G.size = G.queue.length; G.lives = 3; G.started = false; G.dur = {A1: 12, A2: 10, B1: 8.5, B2: 7.5}[G.lvl] * 1000; G.max = 20;
  } else if (g === "memoria") {
    setupMem();
  }
}
function mkOrder(o) {
  const words = o.s.split(/\s+/);
  let ids = words.map((_, i) => i), bank = shuf(ids);
  for (let k = 0; k < 5 && bank.join() === ids.join(); k++) bank = shuf(ids);
  return {...o, words, bank, line: [], tries: 0, done: null, good: null};
}
function mkErr(o) {
  const bad = o.bad[Math.floor(Math.random() * o.bad.length)];
  const pre = o.pre.trim() ? o.pre.trim().split(/\s+/) : [], post = o.post.trim() ? o.post.trim().split(/\s+/) : [];
  /* punctuation glued to the blank ("___." or "¿___") stays with the chip */
  let lead = "", tail = "";
  if (pre.length && !/\s$/.test(o.pre)) lead = pre.pop();
  if (post.length && !/^\s/.test(o.post)) tail = post.shift();
  const toks = [...pre.map(w => ({w})), {w: lead + bad + tail, bad: true}, ...post.map(w => ({w}))];
  const opts = shuf([o.good, ...o.bad.filter(b => b !== bad)]);
  return {...o, shown: bad, toks, opts, lead, tail, stage: "find", wrongTaps: new Set(), pick: null, showHint: false};
}
function setupMem() {
  const D = G.D, ts = TENSES[G.learn === "en" ? "en" : "es"][G.lvl].filter(t => t !== "pres" || G.lvl === "A1");
  const verbs = shuf(upTo(D.verbs, G.lvl)).sort((a, b) => (b.lv === G.lvl) - (a.lv === G.lvl) || Math.random() - .5);
  const chosen = [], used = new Set();
  for (const v of verbs) {
    if (chosen.length === 6) break;
    const t = ts[Math.floor(Math.random() * ts.length)], p = G.lvl === "A1" ? 2 : Math.floor(Math.random() * 5);
    const f = v.f[t]?.[p]; if (!f || f === v.v) continue;
    /* no form that another chosen verb could also make (ser/ir → fue) */
    const allF = new Set(Object.values(v.f).flat());
    if (used.has(f) || chosen.some(c => allF.has(c.f) || Object.values(c.v.f).flat().includes(f))) continue;
    chosen.push({v, t, p, f}); used.add(f);
  }
  G.pairs = chosen.length; G.moves = 0; G.found = 0; G.open = []; G.lock = false; G.size = chosen.length;
  G.cards = shuf(chosen.flatMap((c, i) => [{i, side: "w", c}, {i, side: "t", c}])).map(c => ({...c, up: false, done: false}));
}

/* ---------- drawing ---------- */
function head(stats, noLv) {
  const {S} = st();
  const from = G.meta ? tl("from_reading", S.learn, {t: G.meta.title[S.learn] || G.meta.title.es}) : tl("from_level", S.learn, {lv: G.lvl});
  const back = G.meta ? `<a class="btn" href="#${esc(G.src)}">${T("back_read")}</a>` : `<a class="btn" href="#juegos">${T("to_room")}</a>`;
  return `<div class="ghead"><div><p class="meta"><span>${G.lvl}</span><a href="#juegos">${esc(tl("to_room", S.learn))}</a></p>
    <h1>${ICON[G.game]} ${esc(tl("g_" + G.game, S.learn))}</h1><p class="en">${esc(from)}</p></div>${back}</div>
    ${!G.meta && !noLv ? lvPick() : ""}${stats ? `<div class="gstats">${stats}</div>` : ""}`;
}
const stat = (k, v, id) => `<div class="gs"><small>${T(k)}</small><b${id ? ` id="${id}"` : ""}>${v}</b></div>`;
function draw() {
  const el = app(); if (!G) return;
  if (G.over) { el.innerHTML = `<div class="wrap gm grm">${head(null, true)}${resultHTML()}</div>`; return; }
  const min = {conj: 5, orden: 2, error: 2, tiempos: 6, memoria: 3}[G.game];
  if (!G.size || G.size < min) { el.innerHTML = `<div class="wrap gm grm">${head()}<p class="empty">${TB("too_few")}</p></div>`; return; }
  el.innerHTML = `<div class="wrap gm grm">${{conj: conjHTML, orden: ordenHTML, error: errorHTML, tiempos: tiemposHTML, memoria: memHTML}[G.game]()}</div>`;
  if (G.game === "conj" && G.started) { const i = document.getElementById("grin"); if (i && !G.fb) i.focus({preventScroll: true}); }
}

/* ===== 1. Conjuga contra reloj ===== */
const ACC = ["á", "é", "í", "ó", "ú", "ñ"], ACC_CA = ["à", "è", "é", "í", "ï", "ò", "ó", "ú", "ü", "ç"];
function conjHTML() {
  if (!G.started) return head() + `<div class="qc gstart"><p class="prompt">${T("d_conj")}</p><p class="mnote">${TB("conj_help", {n: G.start, m: G.bonus})}</p>
    <div class="row"><button class="btn main" data-gr="go">${T("start")}</button></div></div>`;
  const q = G.cur, {S, CAT} = st(), D = G.D;
  return head(stat("time", `${G.left}s`, "grclock") + stat("hits", `<span id="grhits">${G.hits}</span>`)) +
    `<div class="tbar"><i id="grbar" style="width:${Math.min(100, G.left / 40 * 100)}%"></i></div>
    <div class="qc grconj"><p class="grverb" id="grverb">${esc(q.v.v)}</p><p class="en grmean" id="grmean">${both() ? esc(q.v.m) : ""}</p>
    <p class="grchips"><span class="grchip" id="grper">${esc(D.persons[q.p])}</span><span class="grchip t" id="grten">${tLabel(q.t)}</span></p>
    <form class="grform" data-gr="form" autocomplete="off"><label class="sr" for="grin">${esc(tl("type_here", S.learn))}</label>
    <input id="grin" class="grinput" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${esc(tl("type_here", S.learn))}" ${G.fb ? "disabled" : ""}>
    <button class="btn main" type="submit" ${G.fb ? "disabled" : ""}>${T("check")}</button></form>
    ${G.learn === "es" || G.learn === "ca" ? `<div class="gracc" aria-label="tildes">${(G.learn === "ca" ? ACC_CA : ACC).map(c => `<button type="button" class="key" data-gr="acc" data-c="${c}" tabindex="-1">${c}</button>`).join("")}</div>` : ""}
    <p class="fb grfb" id="grfb" aria-live="polite"></p>
    <div class="row"><button class="btn" data-gr="skip" type="button">${T("skip")}</button></div></div>`;
}
function conjNext() { if (!G.combos.length) G.combos = shuf(G.allCombos); G.cur = G.combos.shift(); G.fb = null; }
function conjGo() {
  G.started = true; conjNext();
  const g = G;
  timer = setInterval(() => {
    if (!alive(g)) return stop();
    if (g.fb) return; /* the clock waits while the answer is shown */
    g.left--; const c = document.getElementById("grclock"), b = document.getElementById("grbar");
    if (c) c.textContent = g.left + "s"; if (b) b.style.width = Math.min(100, g.left / 40 * 100) + "%";
    if (g.left <= 0) { stop(); finish(); }
  }, 1000);
  draw();
}
const PRON = /^(yo|t[uú]|[eé]l|ella|usted|nosotros|nosotras|vosotros|ellos|ellas|ustedes|i|you|he|she|it|we|they)\s+/;
const norm = s => s.toLowerCase().replace(/[’']/g, "'").replace(/[.!?¡¿,]/g, "").replace(/\s+/g, " ").trim();
function conjAnswer(raw, skip) {
  if (!G.started || G.fb || G.over) return;
  const q = G.cur, ans = q.v.f[q.t][q.p];
  let a = norm(raw || ""); if (!skip && !a) return;
  a = a.replace(PRON, "");
  const ok = !skip && a === norm(ans), near = !skip && !ok && plainA(a) === plainA(norm(ans));
  const good = ok || near; G.n++;
  const fb = document.getElementById("grfb"), {S} = st();
  if (good) { G.hits++; G.left += G.bonus; const h = document.getElementById("grhits"), c = document.getElementById("grclock"); if (h) h.textContent = G.hits; if (c) c.textContent = G.left + "s"; }
  else if (!G.fails.some(f => f.k === q.v.v + q.t + q.p)) G.fails.push({k: q.v.v + q.t + q.p, w: ans, t: `${q.v.v} · ${G.D.persons[q.p]} · ${tname(q.t, S.learn)}`});
  G.fb = good ? "ok" : "no";
  if (fb) { fb.className = "fb grfb " + (good ? "ok" : "no"); fb.textContent = ok ? `${tl("right", S.learn)} ${tl("plus", S.learn, {n: G.bonus})}` : near ? tl("tilde", S.learn, {w: ans}) : tl("wrong", S.learn, {w: `${G.D.persons[q.p].split(" / ")[0]} ${ans}`}); }
  const i = document.getElementById("grin"); if (i) i.readOnly = true;
  document.querySelectorAll(".grform button").forEach(b => (b.disabled = true));
  if (good) say(ans);
  xp({n: 0, xp: 0, ok: good, src: "juego", juego: "gram-conj"});
  const g = G;
  setTimeout(() => {
    if (!alive(g)) return;
    conjNext();
    const q2 = g.cur, set = (id, v, html) => { const e = document.getElementById(id); if (e) e[html ? "innerHTML" : "textContent"] = v; };
    set("grverb", q2.v.v); set("grmean", both() ? q2.v.m : ""); set("grper", g.D.persons[q2.p]); set("grten", tLabel(q2.t), true);
    const f = document.getElementById("grfb"); if (f) { f.textContent = ""; f.className = "fb grfb"; }
    document.querySelectorAll(".grform button").forEach(b => (b.disabled = false));
    const inp = document.getElementById("grin"); if (inp) { inp.readOnly = false; inp.value = ""; inp.focus({preventScroll: true}); }
  }, good ? (near ? 1300 : 650) : 1800);
}

/* ===== 2. Ordena la frase ===== */
function ordenHTML() {
  const it = G.items[G.i], {S} = st();
  const chip = (id, where) => {
    let c = "grw"; if (where === "line" && it.good && it.good[it.line.indexOf(id)]) c += " ok";
    return `<button class="${c}" data-gr="w" data-id="${id}" data-where="${where}" ${it.done ? "disabled" : ""}>${esc(it.words[id])}</button>`;
  };
  const fin = it.done ? `<p class="fb ${it.done === "ok" ? "ok" : "no"}">${it.done === "ok" ? T("perfect") : `${T("solution")} <b>${esc(it.s)}</b>`}</p>
    <div class="row"><button class="btn main" data-gr="nexto">${T(G.i + 1 < G.items.length ? "next" : "see_res")}</button></div>` : "";
  return head(stat("sentence", `${G.i + 1} / ${G.items.length}`) + stat("hits", G.hits)) +
    `<div class="qc grord"><p class="mnote" style="margin:0 0 6px">${T("your_line")}</p>
    <div class="grline${it.done === "ok" ? " ok" : ""}" id="grline" data-zone="line" aria-live="polite">${it.line.map(id => chip(id, "line")).join("") || `<span class="grph">${esc(tl("d_orden", S.learn))}</span>`}</div>
    ${it.tries && !it.done ? `<p class="fb no">${T("almost")}</p>` : ""}
    <p class="mnote" style="margin:14px 0 6px">${T("bank")}</p>
    <div class="grbank" id="grbank" data-zone="bank">${it.bank.map(id => chip(id, "bank")).join("")}</div>
    ${it.done ? fin : `<div class="row"><button class="btn main" data-gr="checko" ${it.bank.length ? "disabled" : ""}>${T("check")}</button><button class="btn" data-gr="clear" ${it.line.length ? "" : "disabled"}>${T("clear")}</button></div>`}</div>`;
}
function ordMove(id, where, at) {
  const it = G.items[G.i]; if (it.done) return;
  it.good = null;
  it.line = it.line.filter(x => x !== id); it.bank = it.bank.filter(x => x !== id);
  if (where === "line") { at = at == null ? it.line.length : Math.max(0, Math.min(at, it.line.length)); it.line.splice(at, 0, id); }
  else it.bank.push(id);
  draw();
}
function ordCheck() {
  const it = G.items[G.i]; if (it.done || it.bank.length) return;
  const got = it.line.map(id => it.words[id]);
  const ok = got.join(" ") === it.words.join(" ");
  it.tries++; G.n += ok || it.tries >= 2 ? 1 : 0;
  if (ok) { it.done = "ok"; G.hits++; G.xp += it.tries === 1 ? 3 : 1; say(it.s); }
  else if (it.tries >= 2) { it.done = "no"; G.fails.push({w: it.s}); it.line = it.words.map((_, i) => i); it.good = it.line.map(() => true); }
  else it.good = got.map((w, i) => w === it.words[i]);
  xp({n: 0, xp: 0, ok, src: "juego", juego: "gram-orden"});
  draw();
}
/* drag & drop with pointer events (mouse and touch) */
let drag = null;
document.addEventListener("pointerdown", e => {
  const b = e.target.closest?.(".grw"); if (!b || !G || G.game !== "orden" || b.disabled) return;
  drag = {b, id: +b.dataset.id, from: b.dataset.where, x: e.clientX, y: e.clientY, on: false, ghost: null, pid: e.pointerId};
});
document.addEventListener("pointermove", e => {
  if (!drag || e.pointerId !== drag.pid) return;
  if (!drag.on && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return;
  if (!drag.on) {
    drag.on = true; const r = drag.b.getBoundingClientRect();
    const gh = drag.b.cloneNode(true); gh.className = "grw grghost"; gh.style.width = r.width + "px"; gh.removeAttribute("data-gr");
    document.body.appendChild(gh); drag.ghost = gh; drag.dx = drag.x - r.left; drag.dy = drag.y - r.top; drag.b.classList.add("grgone");
  }
  e.preventDefault();
  drag.ghost.style.transform = `translate(${e.clientX - drag.dx}px,${e.clientY - drag.dy}px)`;
  const z = zoneAt(e.clientX, e.clientY);
  document.querySelectorAll(".grline,.grbank").forEach(el => el.classList.toggle("over", el.dataset.zone === z));
}, {passive: false});
function zoneAt(x, y) {
  for (const id of ["grline", "grbank"]) { const el = document.getElementById(id); if (!el) continue; const r = el.getBoundingClientRect(); if (x >= r.left - 12 && x <= r.right + 12 && y >= r.top - 18 && y <= r.bottom + 18) return el.dataset.zone; }
  return null;
}
function lineIndexAt(x, y) {
  const chips = [...document.querySelectorAll("#grline .grw")].filter(c => +c.dataset.id !== drag.id);
  let i = 0;
  for (const c of chips) { const r = c.getBoundingClientRect(); if (y > r.bottom || (y >= r.top && x > r.left + r.width / 2)) i++; }
  return i;
}
function endDrag(e) {
  if (!drag) return;
  const d = drag; drag = null;
  if (!d.on) return;
  d.ghost?.remove(); d.b.classList.remove("grgone");
  document.querySelectorAll(".grline,.grbank").forEach(el => el.classList.remove("over"));
  ordenDragged = true; setTimeout(() => (ordenDragged = false), 0);
  if (!e || e.type === "pointercancel") return draw();
  const z = zoneAt(e.clientX, e.clientY);
  if (z === "line") { drag = d; const at = lineIndexAt(e.clientX, e.clientY); drag = null; ordMove(d.id, "line", at); }
  else if (z === "bank" && d.from === "line") ordMove(d.id, "bank");
  else draw();
}
let ordenDragged = false;
document.addEventListener("pointerup", endDrag);
document.addEventListener("pointercancel", endDrag);

/* ===== 3. Caza el error ===== */
function errorHTML() {
  const it = G.items[G.i], {S} = st();
  const toks = it.toks.map((t, j) => {
    let c = "grtok";
    if (it.wrongTaps.has(j)) c += " fine";
    if (t.bad && it.stage !== "find") c += it.stage === "done" && it.pick === it.good ? " fixed" : " caught";
    const txt = t.bad && it.stage === "done" ? it.lead + it.good + it.tail : t.w;
    return `<button class="${c}" data-gr="tok" data-j="${j}" ${it.stage !== "find" ? "disabled" : ""}>${esc(txt)}</button>`;
  }).join(" ");
  let step = "";
  if (it.stage === "find") step = `<p class="mnote">${T("tap_bad")}</p>${it.msg ? `<p class="fb no">${esc(it.msg)}</p>` : ""}`;
  else if (it.stage === "fix") step = `<p class="mnote">${T("which_good")}</p><div class="opts">${it.opts.map((o, j) => `<button class="opt" data-gr="fix" data-o="${j}"><span class="k">${j + 1}</span><span>${esc(o)}</span></button>`).join("")}</div>`;
  else step = `<p class="fb ${it.pick === it.good ? "ok" : "no"}">${it.pick === it.good ? T("fixed") : esc(tl("was_good", S.learn, {w: it.good}))}</p>
    <div class="row"><button class="btn main" data-gr="nexte">${T(G.i + 1 < G.items.length ? "next" : "see_res")}</button></div>`;
  return head(stat("sentence", `${G.i + 1} / ${G.items.length}`) + stat("hits", G.hits)) +
    `<div class="qc grerr"><p class="grsent">${toks}</p>${step}
    ${it.h && it.stage !== "done" ? (it.showHint ? `<p class="grhint">💡 ${esc(it.h)}</p>` : `<button class="btn grhintb" data-gr="hint">💡 ${T("hint")}</button>`) : ""}</div>`;
}
function errTap(j) {
  const it = G.items[G.i], {S} = st(); if (it.stage !== "find") return;
  if (it.toks[j].bad) { it.stage = "fix"; it.msg = ""; if (!it.wrongTaps.size) G.xp += 2; }
  else { it.wrongTaps.add(j); it.msg = tl("fine_word", S.learn, {w: it.toks[j].w.replace(/[.,!?¡¿]/g, "")}); }
  draw();
}
function errFix(j) {
  const it = G.items[G.i]; if (it.stage !== "fix") return;
  it.pick = it.opts[j]; it.stage = "done"; G.n++;
  const ok = it.pick === it.good && !it.wrongTaps.size;
  if (it.pick === it.good) { G.hits++; G.xp += 2; say(it.pre + it.good + it.post); }
  if (!ok) G.fails.push({w: (it.pre + it.good + it.post).replace(/\s+/g, " ").trim()});
  xp({n: 0, xp: 0, ok: it.pick === it.good, src: "juego", juego: "gram-error"});
  draw();
}

/* ===== 4. Pasado, presente o futuro ===== */
const TB3 = ["past", "pres", "fut"];
function tiemposHTML() {
  const {S} = st();
  if (!G.started) return head() + `<div class="qc gstart"><p class="prompt">${T("d_tiempos")}</p><p class="mnote">${TB("tiempos_help")}</p><p class="mnote">${T("keys_tiempos")}</p>
    <div class="row"><button class="btn main" data-gr="go3">${T("start")}</button></div></div>`;
  const hearts = [0, 1, 2].map(i => `<span class="${i < G.lives ? "" : "lost"}">♥</span>`).join("");
  return head(stat("lives", `<span class="hearts" id="grhearts">${hearts}</span>`) + stat("hits", `<span id="grth">${G.hits}</span>`)) +
    `<div class="grarena" id="grarena"><div class="grfall" id="grfall"></div><div class="grground"></div></div>
    <div class="grbins">${TB3.map((t, j) => `<button class="grbin b-${t}" data-gr="bin" data-t="${t}"><span class="k">${j + 1}</span>${esc(tl("b_" + t, S.learn))}${both() ? `<small>${esc(tl("b_" + t, S.know))}</small>` : ""}</button>`).join("")}</div>
    <p class="fb grfb" id="grtfb" aria-live="polite"></p>`;
}
function tiemposGo() { G.started = true; G.done3 = 0; draw(); try { document.querySelector(".grbins")?.scrollIntoView({block: "end", behavior: "smooth"}); } catch (e) {} dropNext(); }
function dropNext() {
  const g = G; if (!alive(g)) return;
  if (!g.queue.length || g.done3 >= g.max || g.lives <= 0) return finish();
  g.cur = g.queue.shift(); g.t0 = performance.now(); g.locked = false;
  const f = document.getElementById("grfall"); if (!f) return;
  f.className = "grfall"; f.textContent = g.cur.s; f.style.top = "0px";
  const speed = g.dur * Math.pow(.96, g.hits);
  const step = now => {
    if (!alive(g) || g.locked) return;
    const a = document.getElementById("grarena"), el = document.getElementById("grfall"); if (!a || !el) return;
    const p = Math.min(1, (now - g.t0) / speed), maxTop = a.clientHeight - el.offsetHeight - 14;
    el.style.top = Math.max(0, p * maxTop) + "px";
    if (p >= 1) return tAnswer(null);
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}
function tAnswer(t) {
  const g = G; if (!g || g.game !== "tiempos" || !g.started || g.locked || g.over || !g.cur) return;
  g.locked = true; cancelAnimationFrame(raf);
  const ok = t === g.cur.t, {S} = st(); g.done3++; g.n++;
  if (ok) { g.hits++; } else { g.lives--; g.fails.push({w: g.cur.s, t: tl("b_" + g.cur.t, S.learn)}); }
  const el = document.getElementById("grfall"); if (el) el.className = "grfall " + (ok ? "ok" : "no") + " to-" + g.cur.t;
  const fb = document.getElementById("grtfb"); if (fb) { fb.className = "fb grfb " + (ok ? "ok" : "no"); fb.textContent = ok ? tl("right", S.learn) : tl("it_was", S.learn, {t: tl("b_" + g.cur.t, S.learn).toLowerCase()}); }
  const h = document.getElementById("grth"); if (h) h.textContent = g.hits;
  const hs = document.getElementById("grhearts"); if (hs) hs.innerHTML = [0, 1, 2].map(i => `<span class="${i < g.lives ? "" : "lost"}">♥</span>`).join("");
  xp({n: 0, xp: 0, ok, src: "juego", juego: "gram-tiempos"});
  setTimeout(() => { if (alive(g)) { if (fb) fb.textContent = ""; dropNext(); } }, ok ? 550 : 1500);
}

/* ===== 5. Memoria de verbos ===== */
function memHTML() {
  const {S} = st();
  return head(stat("pairs", `${G.found} / ${G.pairs}`) + stat("moves", G.moves)) +
    `<div class="mem grmem" role="grid">${G.cards.map((c, j) => {
      const x = c.c, face = c.side === "w" ? `<b>${esc(x.v.v)}</b>${both() ? `<span>${esc(x.v.m)}</span>` : ""}`
        : `<b>${esc(x.f)}</b><span class="grsmall">${esc(G.D.persons[x.p])} · ${esc(tname(x.t, S.learn))}</span>`;
      const lab = c.side === "w" ? x.v.v : x.f;
      return `<button class="mc${c.up || c.done ? " up" : ""}${c.done ? " done" : ""}${c.side === "t" ? " tside" : ""}" data-gr="flip" data-j="${j}" ${c.done ? "disabled" : ""} aria-label="${c.up || c.done ? esc(lab) : "?"}">
        <span class="mb" aria-hidden="true">?</span><span class="mf">${face}</span></button>`;
    }).join("")}</div>`;
}
function flip(j) {
  const c = G.cards[j]; if (G.lock || c.up || c.done) return;
  c.up = true; G.open.push(j); say(c.side === "w" ? c.c.v.v : c.c.f);
  if (G.open.length === 2) {
    G.moves++;
    const [a, b] = G.open.map(x => G.cards[x]);
    if (a.i === b.i) { a.done = b.done = true; G.found++; G.hits++; G.open = []; xp({n: 0, xp: 0, ok: true, src: "juego", juego: "gram-memoria"}); if (G.found === G.pairs) { draw(); return setTimeout(finish, 500); } }
    else { G.lock = true; const g = G; setTimeout(() => { if (G !== g) return; a.up = b.up = false; g.open = []; g.lock = false; draw(); }, 1100); }
  }
  draw();
}

/* ---------- result ---------- */
function finish() {
  const g = G; if (!g || g.over) return;
  stop();
  const p = prog(); let n = 0, score = 0, tot = 0, better = (a, b) => b == null || a > b;
  if (g.game === "conj") { n = g.hits * 2; score = g.hits; tot = g.n; }
  else if (g.game === "orden") { n = g.xp; score = g.hits; tot = g.items.length; }
  else if (g.game === "error") { n = g.xp; score = g.hits; tot = g.items.length; }
  else if (g.game === "tiempos") { n = g.hits * 2; score = g.hits; tot = g.n; }
  else { n = g.pairs * 2 + (g.moves <= g.pairs * 1.5 ? 6 : g.moves <= g.pairs * 2 ? 3 : 0); score = g.moves; tot = g.pairs; better = (a, b) => b == null || a < b; }
  const key = g.game + "-" + g.lvl;
  g.rec = false;
  if (!g.src && (g.game !== "memoria" || g.pairs === 6) && score > 0 && better(score, p.best[key])) { p.best[key] = score; g.rec = true; }
  p.plays = (p.plays || 0) + 1;
  g.over = true; g.xp = n;
  try { L().save(); } catch (e) {}
  if (n > 0) xp({n, xp: n, src: "juego", juego: "gram-" + g.game, lectura: g.src || null, aciertos: g.game === "memoria" ? g.pairs : score, total: tot});
  if (G === g && g.hash === location.hash) { draw(); scrollTo(0, 0); }
}
function resultHTML() {
  const {S} = st(), g = G;
  const line = g.game === "conj" ? T("res_conj", {n: g.hits}) : g.game === "orden" ? T("res_orden", {n: g.hits, t: g.items.length})
    : g.game === "error" ? T("res_error", {n: g.hits, t: g.items.length}) : g.game === "tiempos" ? T("res_tiempos", {n: g.hits}) : T("res_memoria", {p: g.pairs, m: g.moves});
  const others = GAMES.filter(x => x !== g.game && (!g.src || x === "orden" || x === "error"));
  return `<div class="res gres"><p class="mnote" style="margin:0">${T("end")}</p><div class="big">${esc(tl("xp", S.learn, {n: g.xp}))}</div>
    <p style="margin:0;font-weight:500">${line}</p>${g.rec ? `<p class="fb ok">🏆 ${T("new_best")}</p>` : ""}
    ${g.fails.length ? `<p class="mnote" style="margin-top:16px">${T("review")}</p><ul class="words grrev">${g.fails.slice(0, 12).map(d => `<li class="miss"><div><b>${esc(d.w)}</b>${d.t ? `<span>${esc(d.t)}</span>` : ""}</div></li>`).join("")}</ul>` : ""}
    <div class="row"><button class="btn main" data-gr="again">${T("again")}</button>
    ${others.map(x => `<a class="btn" href="#gram-${x}${g.src ? "--" + esc(g.src) : ""}">${ICON[x]} ${T("g_" + x)}</a>`).join("")}
    ${g.meta ? `<a class="btn" href="#${esc(g.src)}">${T("back_read")}</a>` : ""}<a class="btn" href="#juegos">${T("to_room")}</a></div></div>`;
}

/* ---------- events ---------- */
function setLevel(l) {
  const {S} = st(); if (!LVS.includes(l) || S.level === l) return;
  S.level = l; try { L().save(); } catch (e) {}
  if (G && parse() && !G.src) { stop(); G.lvl = l; setup(); draw(); }
  else { try { L().renderPage(); } catch (e) {} }
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-gr]"); if (!b || !b.closest("#app")) return;
  const a = b.dataset.gr;
  if (a === "lv") return setLevel(b.dataset.l);
  if (!G || !parse()) return;
  if (a === "go") conjGo();
  else if (a === "skip") conjAnswer("", true);
  else if (a === "acc") { const i = document.getElementById("grin"); if (i && !i.readOnly) { const s = i.selectionStart ?? i.value.length, en = i.selectionEnd ?? s; i.value = i.value.slice(0, s) + b.dataset.c + i.value.slice(en); i.focus(); i.setSelectionRange(s + 1, s + 1); } }
  else if (a === "w") { if (ordenDragged) return; ordMove(+b.dataset.id, b.dataset.where === "bank" ? "line" : "bank"); }
  else if (a === "checko") ordCheck();
  else if (a === "clear") { const it = G.items[G.i]; it.bank.push(...it.line); it.line = []; it.good = null; draw(); }
  else if (a === "nexto" || a === "nexte") { G.i++; if (G.i >= G.items.length) finish(); else { draw(); scrollTo(0, 0); } }
  else if (a === "tok") errTap(+b.dataset.j);
  else if (a === "fix") errFix(+b.dataset.o);
  else if (a === "hint") { G.items[G.i].showHint = true; draw(); }
  else if (a === "go3") tiemposGo();
  else if (a === "bin") tAnswer(b.dataset.t);
  else if (a === "flip") flip(+b.dataset.j);
  else if (a === "again") { stop(); setup(); draw(); scrollTo(0, 0); }
});
document.addEventListener("submit", e => {
  if (!e.target.closest?.('[data-gr="form"]')) return;
  e.preventDefault(); conjAnswer(document.getElementById("grin")?.value || "");
});
document.addEventListener("keydown", e => {
  if (!G || G.over || G.hash !== location.hash || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "")) return;
  const k = e.key;
  if (G.game === "tiempos" && G.started && /^[1-3]$/.test(k)) { e.preventDefault(); tAnswer(TB3[+k - 1]); }
  else if (G.game === "tiempos" && G.started && /^Arrow(Left|Down|Right)$/.test(k)) { e.preventDefault(); tAnswer({ArrowLeft: "past", ArrowDown: "pres", ArrowRight: "fut"}[k]); }
  else if (G.game === "error" && G.items?.[G.i]?.stage === "fix" && /^[1-4]$/.test(k)) { e.preventDefault(); errFix(+k - 1); }
  else if ((G.game === "conj" || G.game === "tiempos") && !G.started && k === "Enter") { e.preventDefault(); G.game === "conj" ? conjGo() : tiemposGo(); }
});
addEventListener("hashchange", () => { if (G && G.hash !== location.hash) stop(); });

txP.then(() => { try { const {S} = st(); if (S && S.view === "games" && !parse()) L().renderPage(); } catch (e) {} });
window.LYAGram = {render, is, room, offerTiles, ready: txP};
})();
