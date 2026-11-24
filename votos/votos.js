/* Votar el próximo tema: los temas de reserva (content/temas-reserva.json) salen en la portada con «Quiero este tema».
   Un voto por tema y aparato. Dónde se guardan los votos:
   - Web en Claude (artefacto): base de datos del artefacto, documento votos/<id de la persona> = {temas: [...]}.
   - Web en Vercel: api/votos (Upstash Redis), con un id de aparato guardado en localStorage "lyaAparato".
   - Sin ninguna de las dos: solo en este aparato (localStorage "lyaVotos"), sin recuento.
   Usa window.LYA (index.html). */
(() => {
let D = null, mode = "local", counts = null, uid = null, db = null, msg = "";
const dP = fetch("content/temas-reserva.json").then(r => r.json()).then(j => (D = j)).catch(() => (D = {temas: [], tx: {}}));
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
const both = () => { try { return L().both(); } catch (e) { return false; } };
const tl = (k, lang, v) => { let s = (D?.tx?.[lang] || {})[k] ?? (D?.tx?.es || {})[k] ?? k; for (const x in v || {}) s = s.split(`{${x}}`).join(v[x]); return s; };
const T = (k, v) => { const {S} = st(); return esc(tl(k, S.learn, v)) + (both() ? " · " + esc(tl(k, S.know, v)) : ""); };
const nm = (o, lang) => o?.[lang] || o?.es || "";
const store = { get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
let mine = new Set(store.get("lyaVotos") || []);
const keepMine = () => store.set("lyaVotos", [...mine]);
const device = () => { let a = store.get("lyaAparato"); if (!a) { a = [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, "0")).join(""); store.set("lyaAparato", a); } return a; };
const ids = () => (D?.temas || []).map(t => t.id);

/* ---------- where votes live ---------- */
async function connect() {
  await dP;
  if (typeof window.claude?.use === "function") {
    try {
      const [d, u] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
      const id = u ? await u.id() : null;
      if (d && id) {
        db = d; uid = id; mode = "db";
        try { const me = await db.doc("votos/" + uid).get(); if (me.exists) { for (const t of me.data().temas || []) mine.add(t); keepMine(); } } catch (e) {}
        db.collection("votos").onSnapshot(snap => {
          const c = {}; for (const t of ids()) c[t] = 0;
          for (const doc of snap.docs) for (const t of new Set(doc.data()?.temas || [])) if (t in c) c[t]++;
          counts = c; paint();
        }, () => { counts = null; paint(); });
        return;
      }
    } catch (e) {}
    return; /* inside Claude without a database: keep votes on this device */
  }
  try { const r = await fetch("api/votos", {cache: "no-store"}); const j = await r.json(); if (r.ok && j.ok) { mode = "api"; counts = j.votos || {}; paint(); } } catch (e) {}
}
async function vote(id) {
  if (mine.has(id) || !ids().includes(id)) return;
  mine.add(id); keepMine(); msg = "thanks"; paint();
  try {
    if (mode === "db") await db.doc("votos/" + uid).set({temas: [...mine].filter(t => ids().includes(t)), t: Date.now()});
    else if (mode === "api") { const r = await fetch("api/votos", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({tema: id, aparato: device()})}); const j = await r.json(); if (r.ok && j.votos) counts = j.votos; }
  } catch (e) { msg = "local"; }
  paint();
}

/* ---------- home section ---------- */
function card(t) {
  const {S} = st(), v = mine.has(t.id), n = counts ? counts[t.id] || 0 : null;
  return `<div class="vcard" style="--c:${esc(t.color)}"><span class="ve" aria-hidden="true">${esc(t.emoji)}</span>
    <b>${esc(nm(t.name, S.learn))}</b>${both() ? `<span class="en">${esc(nm(t.name, S.know))}</span>` : ""}
    <span class="vd">${esc(nm(t.desc, S.learn))}</span>
    <span class="vn" data-vc="${esc(t.id)}">${n === null ? "" : T(n === 1 ? "n1" : "nn", {n})}</span>
    <button class="btn${v ? "" : " main"}" data-voto="${esc(t.id)}" ${v ? "disabled" : ""}>${v ? T("voted") : T("vote")}</button></div>`;
}
function html() {
  if (!D || !D.temas.length) return "";
  const {S} = st();
  return `<section class="votos" id="votos"><div class="vin"><h2>${esc(tl("title", S.learn))}</h2>${both() ? `<p class="en">${esc(tl("title", S.know))}</p>` : ""}
    <p class="small" style="margin-top:6px">${T("sub")}</p><p class="vmsg small" aria-live="polite">${msg ? T(msg) : ""}</p>
    <div class="vgrid">${D.temas.map(card).join("")}</div></div></section>`;
}
function paint() { const el = document.getElementById("votos"); if (!el) return; const w = document.createElement("div"); w.innerHTML = html(); if (w.firstElementChild) el.replaceWith(w.firstElementChild); }
document.addEventListener("click", e => { const b = e.target.closest("[data-voto]"); if (b && !b.disabled) vote(b.dataset.voto); });

dP.then(() => { try { const {S} = st(); if (S && S.view === "home") L().renderPage(); } catch (e) {} });
connect();
window.LYAVotos = {html, ready: dP, vote};
})();
