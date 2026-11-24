/* Mascota y personalización.
   - Eliges una mascota (oso, ajolote, dinosaurio, robot, gato) y le pones nombre.
   - Tienda: ropa y accesorios por zonas (fondo, cabeza, ojos, cuello, mano) y colores de la web,
     que se compran con los puntos para gastar (S.g.xp - S.g.spent, los mismos que el escudo).
   - La mascota saluda en la portada y celebra los aciertos (evento window "lya:gain" que emite award()).
   Estado en S.pet = {kind, name, own: [ids], wear: {zona: id}, tema}. Tema copiado en localStorage "lyaTema"
   para aplicarlo antes de que cargue el resto.
   Usa window.LYA (index.html) y sus textos en content/textos-mascota.json. Ruta: #mascota */
(() => {
const KINDS = ["oso", "ajolote", "dino", "robot", "gato"];
const SLOTS = ["cabeza", "ojos", "cuello", "mano", "fondo", "temas"];

/* ---------- colours of the website (free: oscuro, claro) ---------- */
const THEMES = [
  ["oscuro", 0, ["#120e16", "#272030", "#ff4141"]],
  ["claro", 0, ["#f7f2ea", "#efe7dc", "#ff4141"]],
  ["neon", 250, ["#0a0b1e", "#1e2147", "#ff4fd8"]],
  ["oceano", 250, ["#06161f", "#123342", "#38d2e0"]],
  ["lava", 250, ["#1a0a06", "#3a1a10", "#ff7a1a"]],
  ["bosque", 250, ["#0b1710", "#1a3324", "#7bd66b"]],
  ["caramelo", 300, ["#fff0f6", "#ffe0ee", "#e0558f"]]
];
const applyTheme = id => { const h = document.documentElement; if (!id || id === "oscuro") delete h.dataset.tema; else h.dataset.tema = id; try { localStorage.setItem("lyaTema", JSON.stringify(id || "oscuro")); } catch (e) {} };
try { applyTheme(JSON.parse(localStorage.getItem("lyaTema") || "null")); } catch (e) {}

/* ---------- drawings: viewBox 0 -24 200 244; head centre (100,88), neck y 136, right hand (150,168) ---------- */
const C = {
  oso: ["#b07440", "#e8c39a", "#5a3418"],
  ajolote: ["#f6a6c8", "#ffe0ec", "#a83a6a"],
  dino: ["#5cbf6b", "#d9f2a6", "#2c6b37"],
  robot: ["#a9b6c6", "#e3e9f0", "#3f4a5a"],
  gato: ["#e9b45e", "#fbe6bf", "#6b4a1e"]
};
const eyesN = (d, happy) => happy
  ? `<path d="M71 88q9-11 18 0M111 88q9-11 18 0" fill="none" stroke="${d}" stroke-width="5" stroke-linecap="round"/>`
  : `<ellipse cx="80" cy="86" rx="7.5" ry="9.5" fill="#1d1420"/><ellipse cx="120" cy="86" rx="7.5" ry="9.5" fill="#1d1420"/><circle cx="82.5" cy="82" r="2.8" fill="#fff"/><circle cx="122.5" cy="82" r="2.8" fill="#fff"/>`;
const bodyStd = (c, l) => `<ellipse cx="78" cy="208" rx="15" ry="8" fill="${c}"/><ellipse cx="122" cy="208" rx="15" ry="8" fill="${c}"/>
  <ellipse cx="100" cy="172" rx="44" ry="40" fill="${c}"/><ellipse cx="100" cy="178" rx="28" ry="26" fill="${l}"/>
  <ellipse cx="58" cy="168" rx="10" ry="19" fill="${c}" transform="rotate(22 58 168)"/>`;
const armR = c => `<ellipse cx="142" cy="166" rx="10" ry="19" fill="${c}" transform="rotate(-38 142 166)"/>`;
const DRAW = {
  oso: (happy) => { const [c, l, d] = C.oso; return { body: `${bodyStd(c, l)}
    <circle cx="54" cy="46" r="18" fill="${c}"/><circle cx="54" cy="46" r="9" fill="${l}"/><circle cx="146" cy="46" r="18" fill="${c}"/><circle cx="146" cy="46" r="9" fill="${l}"/>
    <ellipse cx="100" cy="88" rx="58" ry="52" fill="${c}"/><ellipse cx="100" cy="108" rx="24" ry="17" fill="${l}"/>
    ${eyesN(d, happy)}<ellipse cx="100" cy="100" rx="8" ry="6" fill="${d}"/><path d="M91 112q9 7 18 0" fill="none" stroke="${d}" stroke-width="3.5" stroke-linecap="round"/>`, arm: armR(c)}; },
  ajolote: (happy) => { const [c, l, d] = C.ajolote, g = "#e0558f";
    const gill = s => `<g fill="none" stroke="${g}" stroke-width="9" stroke-linecap="round"${s ? ' transform="matrix(-1 0 0 1 200 0)"' : ""}><path d="M50 70q-20-8-30-22"/><path d="M45 88q-24-1-36-9"/><path d="M50 106q-20 7-30 20"/></g>`;
    return { body: `${bodyStd(c, l)}${gill(0)}${gill(1)}
    <ellipse cx="100" cy="90" rx="60" ry="48" fill="${c}"/><circle cx="70" cy="104" r="8" fill="#ff7fb0" opacity=".55"/><circle cx="130" cy="104" r="8" fill="#ff7fb0" opacity=".55"/>
    ${eyesN(d, happy)}<path d="M82 106q18 14 36 0" fill="none" stroke="${d}" stroke-width="3.5" stroke-linecap="round"/>`, arm: armR(c)}; },
  dino: (happy) => { const [c, l, d] = C.dino, s = "#3e9a4f";
    return { back: `<path d="M136 178q38 6 52 30q-30 0-56-12z" fill="${c}"/>`, body: `${bodyStd(c, l)}
    <path d="M66 46l12-26 12 20zM88 38l12-28 12 28zM110 40l12-20 12 26z" fill="${s}"/>
    <ellipse cx="100" cy="88" rx="58" ry="52" fill="${c}"/><circle cx="92" cy="104" r="2.6" fill="${d}"/><circle cx="108" cy="104" r="2.6" fill="${d}"/>
    ${eyesN(d, happy)}<path d="M76 112q24 16 48 0" fill="none" stroke="${d}" stroke-width="3.5" stroke-linecap="round"/><path d="M84 116l4 7 4-5z" fill="#fff"/>`, arm: armR(c)}; },
  robot: (happy) => { const [c, l, d] = C.robot, e = "#5ff2ff";
    const eyes = happy ? `<path d="M70 90q10-12 20 0M110 90q10-12 20 0" fill="none" stroke="${e}" stroke-width="5" stroke-linecap="round"/>`
      : `<circle cx="80" cy="86" r="9" fill="${e}"/><circle cx="120" cy="86" r="9" fill="${e}"/><circle cx="83" cy="83" r="3" fill="#fff"/><circle cx="123" cy="83" r="3" fill="#fff"/>`;
    return { body: `<rect x="62" y="202" width="30" height="12" rx="6" fill="${d}"/><rect x="108" y="202" width="30" height="12" rx="6" fill="${d}"/>
    <rect x="58" y="134" width="84" height="72" rx="18" fill="${c}"/><rect x="74" y="148" width="52" height="40" rx="10" fill="${l}"/>
    <circle cx="88" cy="168" r="5" fill="#ff5d5d"/><circle cx="100" cy="168" r="5" fill="#ffd54a"/><circle cx="112" cy="168" r="5" fill="#3fd69c"/>
    <rect x="44" y="150" width="16" height="36" rx="8" fill="${c}" transform="rotate(18 52 168)"/>
    <line x1="100" y1="40" x2="100" y2="16" stroke="${d}" stroke-width="5"/><circle cx="100" cy="12" r="8" fill="#ff5d5d"/>
    <rect x="34" y="74" width="12" height="28" rx="5" fill="${d}"/><rect x="154" y="74" width="12" height="28" rx="5" fill="${d}"/>
    <rect x="42" y="38" width="116" height="98" rx="28" fill="${c}"/><rect x="56" y="64" width="88" height="44" rx="20" fill="#1f2937"/>
    ${eyes}<path d="M84 122h32" stroke="${d}" stroke-width="4" stroke-linecap="round" stroke-dasharray="4 4"/>`,
    arm: `<rect x="134" y="146" width="16" height="36" rx="8" fill="${c}" transform="rotate(-40 142 164)"/>`}; },
  gato: (happy) => { const [c, l, d] = C.gato;
    return { back: `<path d="M138 196q40-4 40-40" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/>`, body: `${bodyStd(c, l)}
    <path d="M50 66L56 20 92 44zM150 66L144 20 108 44z" fill="${c}"/><path d="M58 56l3-24 18 13zM142 56l-3-24-18 13z" fill="${l}"/>
    <ellipse cx="100" cy="88" rx="58" ry="52" fill="${c}"/>
    <path d="M90 44l2 12M100 41v14M110 44l-2 12" stroke="${d}" stroke-width="4" stroke-linecap="round" opacity=".55"/>
    ${eyesN(d, happy)}<path d="M94 100h12l-6 7z" fill="#e8738f"/><path d="M88 112q6 5 12-2q6 7 12 2" fill="none" stroke="${d}" stroke-width="3" stroke-linecap="round"/>
    <path d="M62 102l-22-4M62 110l-22 4M138 102l22-4M138 110l22 4" stroke="${d}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`, arm: armR(c)}; }
};

/* items: [id, slot, price, svg | {back, front}] */
const ITEMS = [
  ["c_flor", "cabeza", 60, `<g transform="translate(140 44)"><g fill="#ff8ac6">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-11" rx="8" ry="11" transform="rotate(${a})"/>`).join("")}</g><circle r="7" fill="#ffd54a"/></g>`],
  ["c_cinta", "cabeza", 70, `<path d="M44 64q56-26 112 0v13q-56-24-112 0z" fill="#ff4141"/><path d="M46 70q54-22 108 0" stroke="#fff" stroke-width="3" fill="none"/><path d="M152 68l16-10 2 18z" fill="#ff4141"/>`],
  ["c_gorra", "cabeza", 80, `<path d="M52 58q48-56 96 0z" fill="#3a7bff"/><path d="M98 58q52-8 74 4q-30 8-74 2z" fill="#2a5bd0"/><circle cx="100" cy="24" r="5" fill="#2a5bd0"/>`],
  ["c_lana", "cabeza", 100, `<path d="M50 62q50-62 100 0z" fill="#3fd69c"/><rect x="46" y="54" width="108" height="16" rx="8" fill="#2aa679"/><circle cx="100" cy="14" r="12" fill="#fff"/>`],
  ["c_chef", "cabeza", 150, `<rect x="66" y="34" width="68" height="26" rx="4" fill="#fff" stroke="#d6d0c8" stroke-width="2"/><g fill="#fff" stroke="#d6d0c8" stroke-width="2"><circle cx="76" cy="18" r="17"/><circle cx="124" cy="18" r="17"/><circle cx="100" cy="6" r="20"/></g><rect x="70" y="30" width="60" height="10" fill="#fff"/>`],
  ["c_auris", "cabeza", 180, `<path d="M42 88q0-76 58-76t58 76" fill="none" stroke="#2b2b33" stroke-width="9"/><rect x="30" y="70" width="22" height="38" rx="10" fill="#ff4fd8"/><rect x="148" y="70" width="22" height="38" rx="10" fill="#ff4fd8"/>`],
  ["c_vikingo", "cabeza", 250, `<path d="M58 44q-30-6-34-36q18 22 40 22z" fill="#f4eee6"/><path d="M142 44q30-6 34-36q-18 22-40 22z" fill="#f4eee6"/><path d="M50 62q50-66 100 0z" fill="#9aa3ad"/><rect x="46" y="56" width="108" height="12" rx="6" fill="#c9a227"/><path d="M96 20h8v38h-8z" fill="#c9a227"/>`],
  ["c_mago", "cabeza", 350, `<path d="M56 58L112 -20 146 58z" fill="#5b3fd0"/><ellipse cx="100" cy="58" rx="62" ry="10" fill="#4a2fb5"/><g fill="#ffd54a"><path d="M104 10l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z"/><circle cx="122" cy="40" r="3"/><circle cx="92" cy="40" r="2.5"/></g>`],
  ["c_astro", "cabeza", 400, {front: `<circle cx="100" cy="90" r="72" fill="#bfe8ff" fill-opacity=".22" stroke="#e6f6ff" stroke-width="6"/><path d="M56 60q14-24 40-30" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/><rect x="62" y="152" width="76" height="14" rx="7" fill="#e6f6ff"/>`}],
  ["c_corona", "cabeza", 500, `<path d="M58 56l-6-40 26 20 22-30 22 30 26-20-6 40z" fill="#ffd54a" stroke="#c9a227" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="40" r="6" fill="#ff4141"/><circle cx="74" cy="44" r="4" fill="#3a7bff"/><circle cx="126" cy="44" r="4" fill="#3fd69c"/>`],
  ["o_redondas", "ojos", 70, `<g fill="none" stroke="#5a3418" stroke-width="4"><circle cx="80" cy="86" r="15"/><circle cx="120" cy="86" r="15"/><path d="M95 84q5-4 10 0M65 84l-14-4M135 84l14-4"/></g>`],
  ["o_sol", "ojos", 90, `<g fill="#14141c"><rect x="60" y="74" width="36" height="26" rx="10"/><rect x="104" y="74" width="36" height="26" rx="10"/></g><path d="M96 82h8M60 80l-10-4M140 80l10-4" stroke="#14141c" stroke-width="5"/><path d="M66 80l10 0" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>`],
  ["o_corazon", "ojos", 150, `<g fill="#ff4f8b" stroke="#b81e57" stroke-width="2"><path d="M80 100l-16-14a9 9 0 0 1 16-10a9 9 0 0 1 16 10z"/><path d="M120 100l-16-14a9 9 0 0 1 16-10a9 9 0 0 1 16 10z"/></g><path d="M96 84h8" stroke="#b81e57" stroke-width="4"/>`],
  ["o_antifaz", "ojos", 200, `<path fill-rule="evenodd" fill="#1d1420" d="M46 80q54-20 108 0q4 22-20 22q-14 0-34-8q-20 8-34 8q-24 0-20-22zM80 76a9 11 0 1 0 0.1 0zM120 76a9 11 0 1 0 0.1 0z"/><path d="M46 82l-16 6M154 82l16 6" stroke="#1d1420" stroke-width="5"/>`],
  ["n_pajarita", "cuello", 60, `<path d="M100 140l-24-12v24zM100 140l24-12v24z" fill="#ff4141"/><circle cx="100" cy="140" r="6" fill="#c92a2a"/>`],
  ["n_bufanda", "cuello", 100, `<path d="M58 132q42 16 84 0l4 14q-46 18-92 0z" fill="#ffd54a"/><path d="M118 142l10 40-14 2-8-38z" fill="#ffb400"/><path d="M62 136l4 10M80 140l2 10M100 142v10M120 140l-2 10" stroke="#ff8a00" stroke-width="3"/>`],
  ["n_medalla", "cuello", 200, `<path d="M80 130l14 30h12l14-30h-12l-8 18-8-18z" fill="#3a7bff"/><circle cx="100" cy="166" r="13" fill="#ffd54a" stroke="#c9a227" stroke-width="3"/><path d="M100 159l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z" fill="#c9a227"/>`],
  ["n_capa", "cuello", 300, {back: `<path d="M64 136q-26 46-20 80h112q6-34-20-80z" fill="#d6283b"/><path d="M64 136q-18 40-14 76" stroke="#a51d2c" stroke-width="4" fill="none"/>`, front: `<path d="M62 134q38 12 76 0" stroke="#a51d2c" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="100" cy="140" r="7" fill="#ffd54a"/>`}],
  ["m_libro", "mano", 50, `<g transform="translate(154 160) rotate(-8)"><rect x="-20" y="-16" width="40" height="30" rx="3" fill="#ff4141"/><rect x="-17" y="-13" width="16" height="24" fill="#fff4e0"/><rect x="1" y="-13" width="16" height="24" fill="#fff4e0"/><path d="M-14-6h10M-14 0h10M4-6h10M4 0h10" stroke="#b9aec4" stroke-width="2"/></g>`],
  ["m_balon", "mano", 90, `<g transform="translate(160 158)"><circle r="17" fill="#fff" stroke="#14141c" stroke-width="2.5"/><path d="M0-7l7 5-3 8h-8l-3-8z" fill="#14141c"/><path d="M0-7v-10M7-2l9-3M4 6l6 8M-4 6l-6 8M-7-2l-9-3" stroke="#14141c" stroke-width="2"/></g>`],
  ["m_helado", "mano", 120, `<g transform="translate(160 150)"><path d="M-11 6l11 30 11-30z" fill="#e0a95a"/><path d="M-8 12h16M-5 20h10" stroke="#b47a32" stroke-width="2"/><circle cx="0" cy="-2" r="13" fill="#ff9ec7"/><circle cx="-4" cy="-14" r="10" fill="#a6f5d6"/><circle cx="3" cy="-24" r="4" fill="#ff4141"/></g>`],
  ["m_lupa", "mano", 150, `<g transform="translate(160 150) rotate(-30)"><rect x="-4" y="12" width="8" height="28" rx="4" fill="#6b4a1e"/><circle r="15" fill="#bfe8ff" fill-opacity=".5" stroke="#3f4a5a" stroke-width="5"/></g>`],
  ["m_varita", "mano", 250, `<g transform="translate(158 152) rotate(25)"><rect x="-3" y="-6" width="6" height="40" rx="3" fill="#2b2b33"/><path d="M0-26l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#ffd54a"/></g><g fill="#fff1c9"><circle cx="182" cy="122" r="2.5"/><circle cx="172" cy="112" r="1.8"/><circle cx="188" cy="140" r="2"/></g>`],
  ["m_cohete", "mano", 300, `<g transform="translate(162 150) rotate(30)"><path d="M0-30q14 14 10 40h-20q-4-26 10-40z" fill="#f4eee6"/><circle cy="-6" r="5" fill="#38d2e0"/><path d="M-10 4l-8 12h8zM10 4l8 12h-8z" fill="#ff4141"/><path d="M-6 10q6 16 12 0z" fill="#ffb400"/></g>`],
  ["f_estrellas", "fondo", 60, `<rect x="0" y="-24" width="200" height="244" fill="#1b2a5a"/><g fill="#fff1c9">${[[20, 0], [60, -10], [170, 10], [30, 60], [180, 70], [15, 140], [185, 150], [140, -8], [90, -14]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${1.5 + i % 3}"/>`).join("")}</g><circle cx="168" cy="-2" r="12" fill="#fff1c9"/><circle cx="174" cy="-6" r="11" fill="#1b2a5a"/>`],
  ["f_playa", "fondo", 120, `<rect x="0" y="-24" width="200" height="244" fill="#9fe0ff"/><circle cx="168" cy="6" r="16" fill="#ffd54a"/><rect x="0" y="150" width="200" height="30" fill="#2d9fd8"/><path d="M0 160q25-8 50 0t50 0 50 0 50 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/><rect x="0" y="180" width="200" height="40" fill="#f3d58f"/>`],
  ["f_selva", "fondo", 150, `<rect x="0" y="-24" width="200" height="244" fill="#bfe8b0"/><g fill="#3e9a4f"><path d="M0 40q30-40 40 10q-20-10-40 30z"/><path d="M200 30q-34-30-40 20q20-12 40 24z"/><path d="M0 150q34-10 44 30h-44z"/><path d="M200 140q-34 0-40 40h40z"/></g><g fill="#2c6b37"><path d="M10-24q20 40 4 90"/><path d="M190-24q-14 40 0 80"/></g><rect x="0" y="196" width="200" height="24" fill="#6b8f3a"/>`],
  ["f_piramides", "fondo", 220, `<rect x="0" y="-24" width="200" height="244" fill="#ffcf8a"/><circle cx="40" cy="10" r="16" fill="#fff1c9"/><path d="M-20 196l60-90 60 90z" fill="#d79a4a"/><path d="M110 196l50-74 50 74z" fill="#c4863a"/><path d="M40 106l60 90h-36z" fill="#b97a34" opacity=".6"/><rect x="0" y="192" width="200" height="28" fill="#e8b46a"/>`],
  ["f_espacio", "fondo", 200, `<rect x="0" y="-24" width="200" height="244" fill="#0b0820"/><g fill="#fff"><circle cx="20" cy="20" r="1.5"/><circle cx="60" cy="-6" r="1"/><circle cx="182" cy="110" r="1.5"/><circle cx="12" cy="120" r="1.2"/><circle cx="150" cy="190" r="1.4"/></g><circle cx="164" cy="20" r="22" fill="#ff7a1a"/><ellipse cx="164" cy="20" rx="38" ry="8" fill="none" stroke="#ffd54a" stroke-width="4" transform="rotate(-18 164 20)"/><circle cx="26" cy="180" r="10" fill="#7f8cff"/>`],
  ["f_arcoiris", "fondo", 300, `<rect x="0" y="-24" width="200" height="244" fill="#fff3fa"/><g fill="none" stroke-width="12">${["#ff4141", "#ff9a1a", "#ffd54a", "#3fd69c", "#38a0ff", "#8a5bff"].map((c, i) => `<path d="M${-10 + i * 12} 180a${110 - i * 12} ${110 - i * 12} 0 0 1 ${220 - i * 24} 0" stroke="${c}"/>`).join("")}</g><g fill="#fff"><ellipse cx="22" cy="176" rx="26" ry="14"/><ellipse cx="178" cy="176" rx="26" ry="14"/></g>`]
];
const ITEM = Object.fromEntries(ITEMS.map(i => [i[0], i]));
const THEME = Object.fromEntries(THEMES.map(t => ["t_" + t[0], t]));

function petSVG(kind, wear, o = {}) {
  const k = DRAW[kind] ? kind : "oso", dr = DRAW[k](o.happy);
  const part = (slot, side) => { const it = ITEM[wear?.[slot]]; if (!it) return ""; const v = it[3]; return typeof v === "string" ? (side === "front" ? v : "") : (v[side] || ""); };
  const hold = wear?.mano && ITEM[wear.mano];
  return `<svg class="pet-svg${o.cls ? " " + o.cls : ""}" viewBox="0 -24 200 244" aria-hidden="true" focusable="false">
    ${part("fondo", "front")}<g class="pet-b">${part("cuello", "back")}${dr.back || ""}${dr.body}${part("ojos", "front")}${part("cuello", "front")}${part("cabeza", "front")}${hold ? part("mano", "front") : ""}${dr.arm}</g></svg>`;
}

/* ---------- texts ---------- */
let TX = null;
const txP = fetch("content/textos-mascota.json").then(r => r.json()).then(j => (TX = j)).catch(() => (TX = {}));
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const tl = (k, lang, v) => { let s = (TX?.[lang] || {})[k] ?? (TX?.es || {})[k] ?? k; for (const x in v || {}) s = s.split(`{${x}}`).join(v[x]); return s; };
const both = () => { try { return L().both(); } catch (e) { return false; } };
const T = (k, v) => { const {S} = st(); return esc(tl(k, S.learn, v)) + (both() ? " · " + esc(tl(k, S.know, v)) : ""); };
const TB = (k, v) => { const {S} = st(); return esc(tl(k, S.learn, v)) + (both() ? `<span class="en" style="display:block">${esc(tl(k, S.know, v))}</span>` : ""); };
const pick = (k, lang) => { const a = tl(k, lang); return Array.isArray(a) ? a : [a]; };

/* ---------- state ---------- */
const pet = () => { const {S} = st(); const p = S.pet && typeof S.pet === "object" ? S.pet : (S.pet = {}); p.own ||= []; p.wear ||= {}; if (!("kind" in p)) p.kind = null; p.name ??= ""; p.tema ||= "oscuro"; return p; };
const pts = () => { const g = st().S.g; return g ? g.xp - g.spent : 0; };
const nameOf = (p, lang) => (p.name || "").trim() || tl("dn_" + (p.kind || "oso"), lang);
const owns = id => { const p = pet(); return THEME[id] ? (THEME[id][1] === 0 || p.own.includes(id)) : p.own.includes(id); };
const save = () => { try { L().save(); } catch (e) {} };
let tab = "cabeza", sel = null, msg = null, choosing = false;

/* ---------- page ---------- */
const isPet = h => h === "mascota";
function itemTile(it) {
  const p = pet(), [id, slot, price] = it, on = p.wear[slot] === id, have = owns(id);
  const fake = {...p.wear, [slot]: id};
  const status = on ? T("wearing") : have ? T("owned") : `${price} XP`;
  return `<button class="pit${on ? " on" : ""}${sel === id ? " sel" : ""}${have ? " have" : ""}" data-pet="sel" data-id="${id}" aria-pressed="${sel === id}">
    ${petSVG(p.kind, slot === "fondo" ? {fondo: id} : fake, {cls: "mini"})}<b>${esc(tl("i_" + id, st().S.learn))}</b><span>${status}</span></button>`;
}
function themeTile([tid, price, sw]) {
  const p = pet(), id = "t_" + tid, on = p.tema === tid, have = owns(id);
  const status = on ? T("in_use") : have ? (price ? T("owned") : T("free")) : `${price} XP`;
  return `<button class="pit thm${on ? " on" : ""}${sel === id ? " sel" : ""}" data-pet="sel" data-id="${id}" aria-pressed="${sel === id}">
    <span class="sw" style="background:${sw[0]}"><i style="background:${sw[1]}"></i><i style="background:${sw[2]}"></i></span><b>${esc(tl("th_" + tid, st().S.learn))}</b><span>${status}</span></button>`;
}
function actionBox() {
  const p = pet(), P = pts();
  if (!sel) return `<p class="small">${T("tap_item")}</p>`;
  const th = THEME[sel], it = ITEM[sel], price = th ? th[1] : it[2], have = owns(sel);
  const nm = esc(tl((th ? "th_" + th[0] : "i_" + sel), st().S.learn));
  let btn;
  if (th) btn = p.tema === th[0] ? `<p class="small">${T("in_use")}</p>` : have ? `<button class="btn main" data-pet="theme">${T("use_theme")}</button>` : null;
  else btn = p.wear[it[1]] === sel ? `<button class="btn" data-pet="off">${T("take_off")}</button>` : have ? `<button class="btn main" data-pet="wear">${T("put_on")}</button>` : null;
  if (!btn) btn = `<button class="btn main" data-pet="buy" ${P >= price ? "" : "disabled"}>${T("buy", {n: price})}</button>${P < price ? `<p class="small" style="margin-top:6px">${T("need", {n: price - P})}</p>` : ""}`;
  return `<p class="pact-t"><b>${nm}</b>${!have ? ` · ${T("trying")}` : ""}</p>${btn}`;
}
function chooser(el) {
  const {S} = st(), p = pet();
  el.innerHTML = `<div class="wrap wide pet-page"><h1>${esc(tl("choose_title", S.learn))}</h1>${both() ? `<p class="en">${esc(tl("choose_title", S.know))}</p>` : ""}
    <p class="lead2">${TB("choose_sub")}</p>
    <div class="pkinds">${KINDS.map(k => `<button class="pkind${p.kind === k ? " on" : ""}" data-pet="kind" data-k="${k}" aria-pressed="${p.kind === k}">${petSVG(k, {}, {cls: "mid"})}<b>${T("k_" + k)}</b></button>`).join("")}</div>
    ${p.kind ? `<p style="margin-top:16px"><button class="btn" data-pet="back">${T("back")}</button></p>` : ""}</div>`;
}
function render(el) {
  if (!TX) { el.innerHTML = `<p class="msg">…</p>`; txP.then(() => { if (st().S.view === "pet") render(el); }); return; }
  const {S} = st(), p = pet(); L().setAcc?.("#ff4141");
  if (!p.kind || choosing) return chooser(el);
  const view = sel && ITEM[sel] ? {...p.wear, [ITEM[sel][1]]: sel} : p.wear;
  const bubble = msg || tl("hi_page", S.learn, {name: nameOf(p, S.learn)});
  const list = tab === "temas" ? THEMES.map(themeTile).join("") : ITEMS.filter(i => i[1] === tab).map(itemTile).join("");
  el.innerHTML = `<div class="wrap wide pet-page">
    <h1>${esc(tl("title", S.learn))}</h1>${both() ? `<p class="en">${esc(tl("title", S.know))}</p>` : ""}
    <div class="pmain">
      <div class="pstage"><p class="bubble" aria-live="polite">${esc(bubble)}</p>${petSVG(p.kind, view, {cls: "big" + (msg ? " jump" : ""), happy: !!msg})}</div>
      <div class="pside">
        <label class="pname"><span>${T("name_label")}</span><input id="petName" type="text" maxlength="16" autocomplete="off" value="${esc(p.name)}" placeholder="${esc(tl("dn_" + p.kind, S.learn))}"></label>
        <div class="box ppts"><span>${T("pts")}</span><b>${pts()}</b><p class="small">${T("how_pts")}</p></div>
        <button class="btn" data-pet="change">${T("change")}</button>
      </div>
    </div>
    <section class="ex"><h2>${esc(tl("shop", S.learn))}</h2>${both() ? `<p class="en">${esc(tl("shop", S.know))}</p>` : ""}
      <div class="seg ptabs" role="group">${SLOTS.map(s => `<button data-pet="tab" data-s="${s}" aria-pressed="${tab === s}">${T("slot_" + s)}</button>`).join("")}</div>
      ${sel ? "" : `<p class="small" style="margin-top:10px">${T("tap_item")}</p>`}<div class="pgrid">${list}</div>
      ${sel ? `<div class="pbar">${ITEM[sel] ? petSVG(p.kind, view, {cls: "small"}) : ""}<div class="pact">${actionBox()}</div></div>` : ""}</section></div>`;
}
const rerender = () => { const el = document.getElementById("app"); if (st().S.view === "pet" && el) render(el); };
function act(a, b) {
  const {S} = st(), p = pet();
  if (a === "kind") { p.kind = b.dataset.k; choosing = false; msg = tl("hello_new", S.learn, {name: nameOf(p, S.learn)}); save(); rerender(); setTimeout(() => { msg = null; rerender(); }, 2600); return; }
  if (a === "change") { choosing = true; return rerender(); }
  if (a === "back") { choosing = false; return rerender(); }
  if (a === "tab") { tab = b.dataset.s; sel = null; return rerender(); }
  if (a === "sel") { sel = sel === b.dataset.id ? null : b.dataset.id; if (sel && owns(sel) && ITEM[sel] && p.wear[ITEM[sel][1]] !== sel) { /* owned: wear at once */ p.wear[ITEM[sel][1]] = sel; save(); } else if (sel && THEME[sel] && owns(sel)) { p.tema = THEME[sel][0]; applyTheme(p.tema); save(); } return rerender(); }
  if (a === "buy" && sel) {
    const th = THEME[sel], price = th ? th[1] : ITEM[sel][2]; if (owns(sel) || pts() < price) return;
    S.g.spent += price; p.own.push(sel);
    if (th) { p.tema = th[0]; applyTheme(p.tema); } else p.wear[ITEM[sel][1]] = sel;
    msg = tl("thanks", S.learn, {name: nameOf(p, S.learn)}); save(); rerender(); setTimeout(() => { msg = null; rerender(); }, 2600); return;
  }
  if (a === "wear" && ITEM[sel]) { p.wear[ITEM[sel][1]] = sel; save(); return rerender(); }
  if (a === "off" && ITEM[sel]) { delete p.wear[ITEM[sel][1]]; sel = null; save(); return rerender(); }
  if (a === "theme" && THEME[sel] && owns(sel)) { p.tema = THEME[sel][0]; applyTheme(p.tema); save(); return rerender(); }
}
document.addEventListener("click", e => { const b = e.target.closest("[data-pet]"); if (!b || b.disabled) return; act(b.dataset.pet, b); });
document.addEventListener("input", e => { if (e.target.id !== "petName") return; pet().name = e.target.value.slice(0, 16); save(); });

/* ---------- home card ---------- */
function homeCard() {
  try {
    if (!TX) return "";
    const {S} = st(), p = pet();
    if (!p.kind) return `<a class="phome" href="#mascota"><span class="pfaces">${petSVG("oso", {}, {cls: "tiny"})}${petSVG("ajolote", {}, {cls: "tiny"})}${petSVG("robot", {}, {cls: "tiny"})}</span><span><b>${T("home_pick")}</b><span class="small" style="display:block">${TB("home_pick_sub")}</span></span></a>`;
    const s = S.g?.streak || 0, lines = pick("hi_home", S.learn), kl = pick("hi_home", S.know);
    const i = (new Date().getDate() + (S.g?.xp || 0)) % lines.length;
    const say = s > 1 ? T("hi_streak", {name: nameOf(p, S.learn), n: s}) : esc(lines[i].split("{name}").join(nameOf(p, S.learn))) + (both() && kl[i] ? ` · ${esc(kl[i].split("{name}").join(nameOf(p, S.know)))}` : "");
    return `<a class="phome" href="#mascota">${petSVG(p.kind, p.wear, {cls: "small wave"})}<span><b>${say}</b><span class="small" style="display:block">${T("home_shop", {n: pts()})}</span></span></a>`;
  } catch (e) { return ""; }
}

/* ---------- cheering: a toast with the pet's face ---------- */
let gains = 0, lastCheer = 0;
addEventListener("lya:gain", e => {
  try {
    const {S} = st(), p = pet(); if (!p.kind || !TX) return;
    const d = e.detail || {}; gains++;
    const big = d.up || /^fin:/.test(d.key || ""), now = Date.now();
    if (big ? now - lastCheer < 4000 : (gains % 4 || now - lastCheer < 15000)) return;
    lastCheer = now;
    const k = d.up ? "cheer_up" : /^fin:/.test(d.key || "") ? "cheer_stk" : "cheer", a = pick(k, S.learn), b2 = pick(k, S.know), i = Math.floor(Math.random() * a.length);
    const txt = esc(a[i]) + (both() && b2[i] ? " · " + esc(b2[i]) : "");
    const box = document.getElementById("toasts"); if (!box) return;
    while (box.children.length > 2) box.firstChild.remove();
    const el = document.createElement("div"); el.className = "toast pett"; el.innerHTML = `${petSVG(p.kind, {...p.wear, fondo: undefined}, {cls: "face jump", happy: true})}<span>${txt}</span>`;
    setTimeout(() => { box.append(el); setTimeout(() => el.remove(), 2600); }, big ? 900 : 350);
  } catch (err) {}
});

const tabLink = () => { try { const {S} = st(), p = pet(); return `${p.kind ? petSVG(p.kind, {...p.wear, fondo: undefined, mano: undefined}, {cls: "ico"}) : "🐾"}<span>${esc(tl("tab", S.learn))}</span>`; } catch (e) { return "🐾"; } };
txP.then(() => { try { const {S} = st(); if (S) { applyTheme(pet().tema); L().renderPage(); } } catch (e) {} });
/* the profile may load after this script: re-apply its colours once it exists */
let tries = 0; const wait = setInterval(() => { try { const {S} = st(); if (S) { clearInterval(wait); applyTheme(pet().tema); } } catch (e) {} if (++tries > 50) clearInterval(wait); }, 100);
const link = () => TX ? `<p class="small" style="margin-top:6px"><a href="#mascota" style="color:var(--ink)">🐾 ${T("see_shop")}</a></p>` : "";
window.LYAMascota = {render, isPet, homeCard, link, tab: tabLink, petSVG, ready: txP};
})();
