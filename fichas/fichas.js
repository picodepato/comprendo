/* Flashcards personales del diccionario.
   - Cada palabra guardada en el diccionario puede tener su flashcard con una imagen:
     un dibujo hecho a mano, un emoji o una imagen de internet (pegar un enlace, buscar en Pixabay o en Wikimedia Commons).
     De internet solo se guarda el ENLACE, nunca la imagen.
   - Los dibujos NO van dentro del progreso (S): se guardan aparte, en este aparato (localStorage «lyaDibujos»)
     y, con cuenta, en la nube con /api/dibujos (una clave pequeña por dibujo). Así el progreso no crece.
   - Repaso espaciado (cajas de Leitner): si aciertas, la tarjeta vuelve más tarde (1, 3, 7, 14, 30, 60 días);
     si fallas, vuelve hoy mismo.
   - Minijuegos: «¿Qué es?» (ves tu imagen y escribes la palabra) y «Dibújalo» (ves la palabra y la dibujas:
     el dibujo se queda en la tarjeta).
   Estado: S.fc = {c: {id: {l, k, w, t, im, n, b, due, ok, ko, x}}, first: "img"|"word"}
     im = {t: "draw", id} | {t: "emoji", v} | {t: "url", v} | {t: "pix", v, id, by} | {t: "wiki", v, by}
   Usa window.LYA (index.html). Ruta: #fichas. Puntos con el evento "lya:xp". */
(() => {
const L = () => window.LYA, st = () => L().get();
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const both = () => { try { return L().both(); } catch (e) { return false; } };
const xp = (n, src, extra) => { try { dispatchEvent(new CustomEvent("lya:xp", {detail: {xp: n, src, ...extra}})); } catch (e) {} };
const save = () => { try { L().save(); } catch (e) {} };
const dayN = (d = new Date()) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
const GAP = [0, 1, 3, 7, 14, 30, 60];

/* ---------- textos ---------- */
const TX = {
  ca: {tab: "Flashcards", title: "Les meves flashcards", sub: "Les paraules del teu diccionari amb un dibuix, un emoji o una imatge.", n_cards: "{n} targetes", due: "Per repassar avui: {n}",
    review: "Repassar", g_what: "Què és?", g_what_h: "Veus la teva imatge i escrius la paraula.", g_draw: "Dibuixa-ho", g_draw_h: "Veus la paraula i la dibuixes. El dibuix es queda a la teva targeta.",
    rev_h: "Les que falles tornen abans; les que saps, més tard.", first: "Què vols veure primer?", f_img: "La imatge", f_word: "La paraula",
    none: "Encara no tens flashcards. Tria una paraula del teu diccionari per crear la primera.", no_dict: "El teu diccionari és buit. Toca paraules en una lectura i guarda-les.",
    make: "Crear flashcards", make_h: "Paraules del teu diccionari sense targeta. Toca'n una per crear-la.", edit: "Canviar", del: "Esborrar", del_q: "Vols esborrar la targeta de «{w}»?",
    new_for: "Flashcard de", t_draw: "Dibuixar", t_emoji: "Emoji", t_web: "Imatge d'internet", w_link: "Enganxar enllaç", w_pix: "Pixabay", w_wiki: "Wikimedia",
    pen: "Llapis", eraser: "Goma", undo: "Desfer", clear: "Esborrar-ho tot", size: "Gruix",
    emoji_ph: "O escriu / enganxa qualsevol emoji", link_ph: "https://… (enllaç a una imatge)", link_h: "Copia l'adreça d'una imatge (botó dret o mantén premuda la imatge → «Copiar l'adreça de la imatge») i enganxa-la aquí.",
    try: "Provar", bad_link: "Aquest enllaç no és una imatge que es pugui veure. Prova'n un altre.", search: "Buscar", search_ph: "Què busques?", searching: "Buscant…", no_res: "No hi ha resultats. Prova amb una altra paraula (en anglès sol haver-n'hi més).",
    pix_off: "La cerca de Pixabay encara no està activada en aquesta web.", pix_noserver: "Pixabay només funciona a la web amb servidor (Vercel).", net_err: "No s'ha pogut buscar. Revisa la connexió.",
    by: "Foto de {a}", note: "Nota (opcional)", note_ph: "Una frase o una pista per recordar-te'n", save: "Guardar la targeta", cancel: "Cancel·lar", need_img: "Primer tria o fes una imatge.",
    saved: "Targeta guardada!", show: "Veure la resposta", knew: "Me la sabia", not_knew: "No me la sabia", done: "Repàs acabat!", res: "{a} de {n} bé",
    back: "Tornar", again: "Una altra ronda", nothing: "Ara no tens targetes per repassar. Torna demà o crea'n més!", next: "Següent", check: "Comprovar",
    type_ph: "Escriu la paraula…", right: "Bé!", wrong: "Era «{w}».", accent: "Bé! Compte amb els accents: «{w}».", skip: "No ho sé",
    draw_this: "Dibuixa: «{w}»", draw_keep: "Guardar el dibuix", draw_skip: "Passar", draw_done: "Dibuixos guardats a les teves targetes!", draw_none: "Dibuixa alguna cosa abans de guardar.",
    g_need: "Necessites almenys 1 targeta amb imatge.", g_need_w: "Necessites paraules al teu diccionari.", other_dev: "Dibuix en un altre aparell",
    album: "Àlbum de flashcards", flip: "Girar", flip_front: "Veure la imatge", rev_one: "Repassar aquesta paraula", make_card: "Crear-ne la flashcard", to_read: "Anar a la lectura",
    box0: "Encara no", box1: "Comences a saber-la", box2: "Gairebé la tens", box3: "Te la saps!", play: "Jugar", pg_prev: "Pàgina anterior", pg_next: "Pàgina següent", pages: "Pàgines {a} i {b} de {n}",
    pg_how: "Passa pàgina amb les fletxes, lliscant o amb el teclat.", ch_img: "Canviar la imatge", close: "Tancar", box: "Com de bé te la saps",
    which: "Aquesta targeta ja tenia imatge. Amb quina et quedes?", old_img: "La que tenia", new_img: "La nova",
    from_dict: "Àlbum de flashcards", card_btn: "Flashcard", in_dict: "Diccionari", pick_emoji: "Tria un emoji", qty: "{a} / {n}"},
  es: {tab: "Flashcards", title: "Mis flashcards", sub: "Tus palabras del diccionario con un dibujo, un emoji o una imagen.", n_cards: "{n} tarjetas", due: "Para repasar hoy: {n}",
    review: "Repasar", g_what: "¿Qué es?", g_what_h: "Ves tu imagen y escribes la palabra.", g_draw: "Dibújalo", g_draw_h: "Ves la palabra y la dibujas. El dibujo se queda en tu tarjeta.",
    rev_h: "Las que fallas vuelven antes; las que sabes, más tarde.", first: "¿Qué ver primero?", f_img: "La imagen", f_word: "La palabra",
    none: "Aún no tienes flashcards. Elige una palabra de tu diccionario para crear la primera.", no_dict: "Tu diccionario está vacío. Toca palabras en una lectura y guárdalas.",
    make: "Crear flashcards", make_h: "Palabras de tu diccionario sin tarjeta. Toca una para crearla.", edit: "Cambiar", del: "Borrar", del_q: "¿Borrar la tarjeta de «{w}»?",
    new_for: "Flashcard de", t_draw: "Dibujar", t_emoji: "Emoji", t_web: "Imagen de internet", w_link: "Pegar enlace", w_pix: "Pixabay", w_wiki: "Wikimedia",
    pen: "Lápiz", eraser: "Goma", undo: "Deshacer", clear: "Borrar todo", size: "Grosor",
    emoji_ph: "O escribe / pega cualquier emoji", link_ph: "https://… (enlace a una imagen)", link_h: "Copia la dirección de una imagen (botón derecho o mantén pulsada la imagen → «Copiar dirección de la imagen») y pégala aquí.",
    try: "Probar", bad_link: "Ese enlace no es una imagen que se pueda ver. Prueba con otro.", search: "Buscar", search_ph: "¿Qué buscas?", searching: "Buscando…", no_res: "No hay resultados. Prueba con otra palabra (en inglés suele haber más).",
    pix_off: "La búsqueda de Pixabay aún no está activada en esta web.", pix_noserver: "Pixabay solo funciona en la web con servidor (Vercel).", net_err: "No se ha podido buscar. Revisa la conexión.",
    by: "Foto de {a}", note: "Nota (opcional)", note_ph: "Una frase o una pista para acordarte", save: "Guardar tarjeta", cancel: "Cancelar", need_img: "Elige o haz una imagen primero.",
    saved: "¡Tarjeta guardada!", show: "Ver la respuesta", knew: "Me la sabía", not_knew: "No me la sabía", done: "¡Repaso terminado!", res: "{a} de {n} bien",
    back: "Volver", again: "Otra ronda", nothing: "No tienes tarjetas para repasar ahora. ¡Vuelve mañana o crea más!", next: "Siguiente", check: "Comprobar",
    type_ph: "Escribe la palabra…", right: "¡Bien!", wrong: "Era «{w}».", accent: "¡Bien! Ojo con los acentos: «{w}».", skip: "No lo sé",
    draw_this: "Dibuja: «{w}»", draw_keep: "Guardar el dibujo", draw_skip: "Pasar", draw_done: "¡Dibujos guardados en tus tarjetas!", draw_none: "Dibuja algo antes de guardar.",
    g_need: "Necesitas al menos 1 tarjeta con imagen.", g_need_w: "Necesitas palabras en tu diccionario.", other_dev: "Dibujo en otro aparato",
    album: "Álbum de flashcards", flip: "Dar la vuelta", flip_front: "Ver la imagen", rev_one: "Repasar esta palabra", make_card: "Crear su flashcard", to_read: "Ir a la lectura",
    box0: "Todavía no", box1: "Empiezas a saberla", box2: "Casi la tienes", box3: "¡Te la sabes!", play: "Jugar", pg_prev: "Página anterior", pg_next: "Página siguiente", pages: "Páginas {a} y {b} de {n}",
    pg_how: "Pasa página con las flechas, deslizando o con el teclado.", ch_img: "Cambiar imagen", close: "Cerrar", box: "Lo bien que te la sabes",
    which: "Esta tarjeta ya tenía imagen. ¿Con cuál te quedas?", old_img: "La que tenía", new_img: "La nueva",
    from_dict: "Álbum de flashcards", card_btn: "Flashcard", in_dict: "Diccionario", pick_emoji: "Elige un emoji", qty: "{a} / {n}"},
  en: {tab: "Flashcards", title: "My flashcards", sub: "Your dictionary words with a drawing, an emoji or a picture.", n_cards: "{n} cards", due: "To review today: {n}",
    review: "Review", g_what: "What is it?", g_what_h: "See your picture and type the word.", g_draw: "Draw it", g_draw_h: "See the word and draw it. The drawing stays on your card.",
    rev_h: "Cards you miss come back sooner; cards you know come back later.", first: "What to see first?", f_img: "The picture", f_word: "The word",
    none: "You have no flashcards yet. Pick a word from your dictionary to make the first one.", no_dict: "Your dictionary is empty. Tap words in a reading and save them.",
    make: "Make flashcards", make_h: "Dictionary words with no card. Tap one to make it.", edit: "Change", del: "Delete", del_q: "Delete the card for “{w}”?",
    new_for: "Flashcard for", t_draw: "Draw", t_emoji: "Emoji", t_web: "Picture from the internet", w_link: "Paste a link", w_pix: "Pixabay", w_wiki: "Wikimedia",
    pen: "Pencil", eraser: "Eraser", undo: "Undo", clear: "Clear all", size: "Size",
    emoji_ph: "Or type / paste any emoji", link_ph: "https://… (link to a picture)", link_h: "Copy a picture's address (right-click or press and hold the picture → “Copy image address”) and paste it here.",
    try: "Try it", bad_link: "That link is not a picture we can show. Try another one.", search: "Search", search_ph: "What are you looking for?", searching: "Searching…", no_res: "No results. Try another word (English often gives more).",
    pix_off: "Pixabay search is not switched on in this website yet.", pix_noserver: "Pixabay only works on the website with a server (Vercel).", net_err: "The search failed. Check your connection.",
    by: "Photo by {a}", note: "Note (optional)", note_ph: "A sentence or a clue to remember it", save: "Save card", cancel: "Cancel", need_img: "Pick or make a picture first.",
    saved: "Card saved!", show: "Show the answer", knew: "I knew it", not_knew: "I didn't know it", done: "Review finished!", res: "{a} of {n} right",
    back: "Back", again: "Another round", nothing: "No cards to review right now. Come back tomorrow or make more!", next: "Next", check: "Check",
    type_ph: "Type the word…", right: "Well done!", wrong: "It was “{w}”.", accent: "Well done! Watch the accents: “{w}”.", skip: "I don't know",
    draw_this: "Draw: “{w}”", draw_keep: "Save the drawing", draw_skip: "Skip", draw_done: "Drawings saved on your cards!", draw_none: "Draw something before saving.",
    g_need: "You need at least 1 card with a picture.", g_need_w: "You need words in your dictionary.", other_dev: "Drawing on another device",
    album: "Flashcard album", flip: "Turn over", flip_front: "See the picture", rev_one: "Review this word", make_card: "Make its flashcard", to_read: "Go to the reading",
    box0: "Not yet", box1: "Starting to know it", box2: "Almost there", box3: "You know it!", play: "Play", pg_prev: "Previous page", pg_next: "Next page", pages: "Pages {a} and {b} of {n}",
    pg_how: "Turn the page with the arrows, by swiping or with the keyboard.", ch_img: "Change picture", close: "Close", box: "How well you know it",
    which: "This card already had a picture. Which one do you keep?", old_img: "The old one", new_img: "The new one",
    from_dict: "Flashcard album", card_btn: "Flashcard", in_dict: "Dictionary", pick_emoji: "Pick an emoji", qty: "{a} / {n}"}
};
const tl = (k, lang, v) => { let s = (TX[lang] || TX.en)[k] ?? TX.es[k] ?? k; for (const x in v || {}) s = s.split(`{${x}}`).join(v[x]); return s; };
const S_ = () => st().S;
/* main text in the language you learn + small line in the language you know (A1) */
const TI = (k, v) => { const s = S_(); return esc(tl(k, s.learn, v)) + (both() && s.know !== s.learn ? `<span class="fcen"> · ${esc(tl(k, s.know, v))}</span>` : ""); };
const T1 = (k, v) => tl(k, S_().learn, v);

/* ---------- datos ---------- */
const FC = () => { const s = S_(); if (!s.fc || typeof s.fc !== "object") s.fc = {c: {}, first: "img"}; s.fc.c ||= {}; return s.fc; };
const hash = str => { let h = 5381; for (const ch of str) h = ((h << 5) + h + ch.codePointAt(0)) >>> 0; return h.toString(36); };
const cid = (l, k) => "c" + hash(l + ":" + k);
const dictMine = () => { const s = S_(); return (s.dict || []).filter(d => d.l === s.learn); };
const trOf = d => { try { return window.LYA_DICT.trOf(d) || d.t || ""; } catch (e) { return d.t || ""; } };
const entryOf = c => dictMine().find(d => d.k === c.k);
const cards = () => { const s = S_(), f = FC(); return Object.entries(f.c).filter(([, c]) => c.l === s.learn).map(([id, c]) => ({id, ...c})); };
const trCard = c => { const d = entryOf(c); return d ? trOf(d) : c.t || ""; };
const defCard = c => entryOf(c)?.d || "";
const dueCards = () => { const t = dayN(); return cards().filter(c => c.im && (c.due ?? 0) <= t); };

/* ---------- dibujos: guardados aparte (aparato + nube) ---------- */
const DKEY = "lyaDibujos", SKEY = "lyaDibujosSub";
const lget = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
const lset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
let DIB = lget(DKEY) || {};
const acct = () => window.LYACuentas?.usuario || null;
const api = (...a) => window.LYACuentas.api(...a);
const subidos = () => { const u = acct(); const all = lget(SKEY) || {}; return [all, u ? (all[u] ||= []) : null]; };
async function subirDibujo(id) {
  const u = acct(); if (!u || !DIB[id]) return false;
  try { const r = await api("dibujos", "POST", {id, img: DIB[id]}); if (!r.ok) return false; const [all, mine] = subidos(); if (!mine.includes(id)) mine.push(id); lset(SKEY, all); return true; } catch (e) { return false; }
}
function guardarDibujo(data) {
  const id = Array.from(crypto.getRandomValues(new Uint8Array(6)), b => b.toString(16).padStart(2, "0")).join("");
  DIB[id] = data; lset(DKEY, DIB); subirDibujo(id); return id;
}
let syncing = null;
/* fetch drawings this device lacks and upload the ones the server lacks */
function sync() {
  if (syncing || !acct()) return syncing;
  syncing = (async () => {
    try {
      if (!(await window.LYACuentas.hayServidor())) return;
      const ids = [...new Set(Object.values(FC().c).filter(c => c.im?.t === "draw").map(c => c.im.id))];
      const falta = ids.filter(id => !DIB[id]);
      if (falta.length) {
        const r = await api("dibujos?ids=" + falta.slice(0, 200).join(","));
        if (r.ok) { let n = 0; for (const [id, v] of Object.entries(r.j.dibujos || {})) if (v) { DIB[id] = v; n++; } if (n) { lset(DKEY, DIB); if (S_().view === "fc") L().renderPage(); } }
      }
      const [, mine] = subidos();
      for (const id of ids.filter(id => DIB[id] && !mine.includes(id)).slice(0, 50)) await subirDibujo(id);
    } catch (e) {} finally { setTimeout(() => { syncing = null; }, 8000); }
  })();
  return syncing;
}
/* with an account, keep drawings in step in the background (also right after signing in) */
setTimeout(() => { try { if (S_()) sync(); } catch (e) {} }, 1500);
setInterval(() => { try { if (S_() && acct() && document.visibilityState !== "hidden") sync(); } catch (e) {} }, 10000);
function borrarDibujo(id) {
  if (Object.values(FC().c).some(c => c.im?.t === "draw" && c.im.id === id)) return;
  delete DIB[id]; lset(DKEY, DIB);
  if (acct()) api("dibujos?id=" + id, "DELETE").catch(() => {});
}

/* ---------- imagen de una tarjeta ---------- */
function imgHTML(im, big) {
  if (!im) return `<span class="fcimg fcno">?</span>`;
  const cls = "fcimg" + (big ? " big" : "");
  if (im.t === "emoji") return `<span class="${cls} fcemo" role="img" aria-label="emoji">${esc(im.v)}</span>`;
  if (im.t === "draw") return DIB[im.id] ? `<img class="${cls} fcdraw" src="${esc(DIB[im.id])}" alt="">` : `<span class="${cls} fcno" title="${esc(T1("other_dev"))}">🖌️</span>`;
  const pix = im.t === "pix" ? ` data-pix="${esc(im.id)}"` : "";
  return `<img class="${cls}" src="${esc(im.v)}" alt="" loading="lazy" referrerpolicy="no-referrer"${pix} onerror="this.dispatchEvent(new CustomEvent('fcbad',{bubbles:true}))">`;
}
/* Pixabay links can expire: ask the server for a fresh one by id */
document.addEventListener("fcbad", async e => {
  const img = e.target, id = img.dataset.pix; if (!id || img.dataset.tried) { img.replaceWith(Object.assign(document.createElement("span"), {className: "fcimg fcno", textContent: "🖼️"})); return; }
  img.dataset.tried = 1;
  try { const r = await fetch("api/imagenes?src=pixabay&id=" + encodeURIComponent(id)).then(r => r.json()); const u = r.imgs?.[0]?.u; if (!u) throw 0;
    for (const c of Object.values(FC().c)) if (c.im?.t === "pix" && c.im.id === id) c.im.v = u; save(); img.src = u; } catch (err) { img.dispatchEvent(new CustomEvent("fcbad", {bubbles: true})); }
}, true);

/* ---------- lienzo para dibujar ---------- */
const COLS = ["#1d1420", "#e23b3b", "#f29d1b", "#f2d21b", "#2fa84f", "#2b7fe0", "#8a4fd6", "#8b5a2b", "#ff8fc0"];
function canvasHTML() {
  return `<div class="fccv"><canvas id="fccv" width="320" height="320" aria-label="${esc(T1("t_draw"))}"></canvas>
    <div class="fctools"><div class="fccols">${COLS.map((c, i) => `<button type="button" class="fccol${i ? "" : " on"}" data-fcc="${c}" style="--c:${c}" aria-label="${c}"></button>`).join("")}<button type="button" class="fccol fcer" data-fcc="er" aria-label="${esc(T1("eraser"))}" title="${esc(T1("eraser"))}">🧽</button></div>
      <div class="fcsz">${[4, 9, 18].map((s, i) => `<button type="button" data-fcs="${s}" class="${i === 1 ? "on" : ""}" aria-label="${esc(T1("size"))} ${s}"><i style="width:${s}px;height:${s}px"></i></button>`).join("")}
      <button type="button" class="btn" data-fcd="undo">↶ ${esc(T1("undo"))}</button><button type="button" class="btn" data-fcd="clear">🗑 ${esc(T1("clear"))}</button></div></div></div>`;
}
let PAD = null;
function setupCanvas(start) {
  const cv = document.getElementById("fccv"); if (!cv) return null;
  const x = cv.getContext("2d"), hist = [];
  const P = {col: COLS[0], size: 9, drawn: false, cv};
  const blank = () => { x.fillStyle = "#fff"; x.fillRect(0, 0, cv.width, cv.height); };
  blank();
  if (start) { const im = new Image(); im.onload = () => { x.drawImage(im, 0, 0, cv.width, cv.height); P.drawn = true; }; im.src = start; }
  let last = null;
  const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
  const line = (a, b) => { x.strokeStyle = P.col === "er" ? "#fff" : P.col; x.lineWidth = P.col === "er" ? P.size * 2.2 : P.size; x.lineCap = x.lineJoin = "round"; x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke(); };
  cv.addEventListener("pointerdown", e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); hist.push(x.getImageData(0, 0, cv.width, cv.height)); if (hist.length > 25) hist.shift(); last = pt(e); line(last, [last[0] + .01, last[1]]); P.drawn = true; if (V.msg) { V.msg = ""; document.querySelector("#app .fcmsg")?.remove(); } });
  cv.addEventListener("pointermove", e => { if (!last) return; const p = pt(e); line(last, p); last = p; });
  const up = () => { last = null; }; cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  P.undo = () => { const h = hist.pop(); if (h) x.putImageData(h, 0, 0); if (!hist.length && !start) P.drawn = false; };
  P.clear = () => { hist.push(x.getImageData(0, 0, cv.width, cv.height)); blank(); P.drawn = false; };
  /* small and compressed: 160×160, WebP (or JPEG) ≈ 3-8 KB */
  P.data = () => {
    const o = document.createElement("canvas"); o.width = o.height = 160; const ox = o.getContext("2d"); ox.fillStyle = "#fff"; ox.fillRect(0, 0, 160, 160); ox.imageSmoothingQuality = "high"; ox.drawImage(cv, 0, 0, 160, 160);
    let d = o.toDataURL("image/webp", .7); if (!d.startsWith("data:image/webp")) d = o.toDataURL("image/jpeg", .7);
    if (d.length > 30000) d = o.toDataURL("image/jpeg", .5);
    return d;
  };
  return (PAD = P);
}
document.addEventListener("click", e => {
  if (!PAD) return;
  const c = e.target.closest("[data-fcc]"), s = e.target.closest("[data-fcs]"), d = e.target.closest("[data-fcd]");
  if (c) { PAD.col = c.dataset.fcc; c.parentNode.querySelectorAll(".fccol").forEach(b => b.classList.toggle("on", b === c)); }
  else if (s) { PAD.size = +s.dataset.fcs; s.parentNode.querySelectorAll("[data-fcs]").forEach(b => b.classList.toggle("on", b === s)); }
  else if (d) PAD[d.dataset.fcd]?.();
});

/* ---------- emojis ---------- */
const EMOJI = ("🐻 🐼 🐶 🐱 🐭 🐰 🦊 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🦅 🦉 🐺 🐴 🦄 🐝 🦋 🐌 🐞 🐢 🐍 🦖 🦕 🐙 🦈 🐬 🐳 🐟 🐊 🦒 🐘 🦏 🐪 🐿️ 🦔 🕷️ " +
  "🌳 🌲 🌵 🌴 🌸 🌻 🍁 🍄 🌍 🌋 🏔️ 🏝️ 🌊 🔥 💧 ❄️ ⛄ ☀️ 🌙 ⭐ 🌈 ☁️ ⚡ 🌪️ 🪐 🚀 🛸 ☄️ " +
  "🍎 🍌 🍇 🍓 🍉 🍊 🍋 🥕 🌽 🥦 🍅 🥔 🍞 🧀 🥚 🍗 🍕 🍔 🍟 🌮 🍝 🍣 🍦 🍰 🍫 🍬 🥛 ☕ 🍵 💩 " +
  "🏠 🏰 🏛️ 🏟️ 🏫 🏥 🚗 🚌 🚲 ✈️ 🚂 🚢 ⛵ 🗿 🔺 🧭 🗺️ ⛺ 🎮 🕹️ 💻 📱 📺 📷 🔦 💡 🔋 🧲 🔧 🔨 ⛏️ 🪓 🗡️ 🛡️ 🏹 💣 🧱 💎 🪙 💰 🔑 🔒 🎁 📦 📚 ✏️ ✂️ ⏱️ ⏰ 🧪 🔬 🔭 🩺 " +
  "⚽ 🏀 🏈 ⚾ 🎾 🏐 🏓 🏸 🥊 🥇 🏆 🏊 🚴 ⛷️ 🏃 🧗 🤸 🎨 🎵 🎸 🥁 " +
  "😀 😂 😍 😎 🤔 😴 😱 😡 😭 🤢 🥶 🥵 🤯 🥳 👋 👍 👎 👏 💪 🦵 🦶 👂 👃 👀 👅 🦷 🧠 ❤️ 💔 👶 🧒 👦 👧 🧑 👨 👩 👴 👵 👮 🧑‍🚀 🧑‍🍳 🧑‍🚒 🧙 🧛 🧟 👻 👽 🤖 💀 👑 " +
  "✅ ❌ ❓ ❗ ➕ ➖ ⬆️ ⬇️ ⬅️ ➡️ 🔴 🟢 🔵 🟡 ⚫ ⚪ 1️⃣ 2️⃣ 3️⃣ 💯").split(" ").filter(Boolean);

/* ---------- búsqueda de imágenes ---------- */
const BAD = /\b(sex|sexy|porn|nude|nud[eo]s?|naked|desnud[oa]s?|erotic|er[oó]tic[oa]|xxx|genital|penis|pene|vagina|breast|pecho|tetas?|boobs?|butt|culo|hentai|fetish|lingerie|bikini|corpse|cad[aá]ver|gore|blood|sangre|drug|droga|weapon|arma)\b/i;
async function buscar(src, q) {
  q = q.trim(); if (!q) return {imgs: []};
  if (BAD.test(q)) return {imgs: []};
  if (src === "pix") {
    let r; try { r = await fetch("api/imagenes?src=pixabay&q=" + encodeURIComponent(q) + "&lang=" + S_().learn); } catch (e) { return {err: "net_err"}; }
    if (r.status === 404) return {err: "pix_noserver"};
    const j = await r.json().catch(() => ({}));
    if (j.error === "sin_clave") return {err: "pix_off"};
    if (!r.ok) return {err: "net_err"};
    return {imgs: j.imgs || []};
  }
  const u = "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=24&prop=imageinfo&iiprop=url|user|mime&iiurlwidth=320&gsrsearch="
    + encodeURIComponent(q + " filetype:bitmap|drawing");
  try {
    const j = await fetch(u).then(r => r.json());
    const ps = Object.values(j.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
    return {imgs: ps.filter(p => p.imageinfo?.[0]?.thumburl && /image\/(jpeg|png|gif|webp|svg)/.test(p.imageinfo[0].mime || "") && !BAD.test(p.title))
      .map(p => ({u: p.imageinfo[0].thumburl, by: (p.imageinfo[0].user || "").slice(0, 40), p: p.imageinfo[0].descriptionurl}))};
  } catch (e) { return {err: "net_err"}; }
}

/* ---------- vistas ---------- */
let V = {p: "home"}; /* p: home | edit | rev | what | draw */
const app = () => document.getElementById("app");
const isFc = h => /^fichas$/.test(h);
const tab = () => `🃏 ${esc(T1("tab"))}`;
function render(el) {
  L().setAcc?.("#ff4141");
  sync();
  const f = {home, edit, rev, what, draw}[V.p] || home;
  el.innerHTML = `<div class="wrap fcw">${f()}</div>`;
  PAD = null;
  if (V.p === "edit" && V.tab === "draw") setupCanvas(V.im?.t === "draw" ? DIB[V.im.id] : null);
  if (V.p === "draw" && V.q && V.i < V.q.length) setupCanvas();
  const inp = el.querySelector("[data-fcfocus]"); if (inp) inp.focus({preventScroll: true});
}
const rerender = () => { if (S_().view === "fc") L().renderPage(); };
const go = (p, extra = {}) => { V = {p, ...extra}; rerender(); scrollTo(0, 0); };

let PG = 0; /* album: spread shown (2 pages of 4 cards) */
const order = () => cards().sort((a, b) => (a.c0 || a.x || 0) - (b.c0 || b.x || 0));
function home() {
  const cs = order(), due = dueCards().length, f = FC(), withImg = cs.filter(c => c.im), dn = dictMine().length;
  const have = new Set(cs.map(c => c.k)), sin = dictMine().filter((d, i, a) => !have.has(d.k) && a.findIndex(x => x.k === d.k) === i);
  const spreads = Math.max(1, Math.ceil(cs.length / 8)); PG = Math.min(Math.max(0, PG), spreads - 1);
  const slot = c => c ? `<button type="button" class="fcslot" data-fca="big" data-id="${c.id}" aria-label="${esc(c.w)}">${imgHTML(c.im)}<b>${esc(c.w)}</b><span class="fcbox" aria-hidden="true">${"●".repeat(Math.min(c.b || 0, 6))}${"○".repeat(Math.max(0, 6 - (c.b || 0)))}</span></button>`
    : `<span class="fcslot fcempty" aria-hidden="true"></span>`;
  const page = n => `<div class="fcpage${n % 2 ? " r" : " l"}">${[0, 1, 2, 3].map(i => slot(cs[n * 4 + i])).join("")}<span class="fcpn">${n + 1}</span></div>`;
  const play = V.play ? `<div class="fcplay">
      <div class="fcpl"><h2>🔁 ${TI("review")}</h2><p>${TI("rev_h")}</p><p class="fcsm">${TI("due", {n: due})}</p>
        <div class="seg" role="group" aria-label="${esc(T1("first"))}"><button data-fca="first" data-v="img" aria-pressed="${f.first !== "word"}">${TI("f_img")}</button><button data-fca="first" data-v="word" aria-pressed="${f.first === "word"}">${TI("f_word")}</button></div>
        <button class="btn main" data-fca="rev" ${due ? "" : "disabled"}>${TI("review")} · ${due}</button></div>
      <div class="fcpl"><h2>🖼️ ${TI("g_what")}</h2><p>${TI("g_what_h")}</p><button class="btn main" data-fca="what" ${withImg.length ? "" : "disabled"}>${TI("g_what")}</button>${withImg.length ? "" : `<p class="fcsm">${TI("g_need")}</p>`}</div>
      <div class="fcpl"><h2>✏️ ${TI("g_draw")}</h2><p>${TI("g_draw_h")}</p><button class="btn main" data-fca="draw" ${dn ? "" : "disabled"}>${TI("g_draw")}</button>${dn ? "" : `<p class="fcsm">${TI("g_need_w")}</p>`}</div>
    </div>` : "";
  return `<p class="fcback"><a href="#diccionario">← ${TI("in_dict")}</a></p>
    <div class="fchead"><div><h1>📒 ${esc(T1("album"))}</h1><p class="en">${TI("sub")}</p></div>
      <button class="btn main fcplaybtn" data-fca="play" aria-expanded="${!!V.play}">🎮 ${TI("play")}${due ? ` <span class="fcdue">${due}</span>` : ""}</button></div>
    ${play}
    ${cs.length ? `<div class="fcalb" id="fcalb" aria-roledescription="${esc(T1("album"))}">
        <button type="button" class="fcturn prev" data-fca="pg" data-v="-1" ${PG ? "" : "disabled"} aria-label="${esc(T1("pg_prev"))}">‹</button>
        <div class="fcspread${V.turn ? " t" + V.turn : ""}" aria-live="polite" aria-label="${esc(T1("pages", {a: PG * 2 + 1, b: PG * 2 + 2, n: spreads * 2}))}">${page(PG * 2)}${page(PG * 2 + 1)}</div>
        <button type="button" class="fcturn next" data-fca="pg" data-v="1" ${PG < spreads - 1 ? "" : "disabled"} aria-label="${esc(T1("pg_next"))}">›</button>
      </div>
      <div class="fcdots">${Array.from({length: spreads}, (_, i) => `<button type="button" data-fca="pgto" data-v="${i}" aria-current="${i === PG}" aria-label="${esc(T1("pages", {a: i * 2 + 1, b: i * 2 + 2, n: spreads * 2}))}"></button>`).join("")}</div>
      <p class="fcsm fcmid">${esc(T1("n_cards", {n: cs.length}))} · ${esc(T1("pg_how"))}</p>`
      : `<p class="empty">${TI(dn ? "none" : "no_dict")}</p>`}
    ${sin.length ? `<section class="ex"><h2>➕ ${TI("make")}</h2><p class="en">${TI("make_h")}</p><div class="fcchips">${sin.map(d => `<button type="button" class="fcchip" data-fca="new" data-k="${esc(d.k)}">${esc(d.w)}</button>`).join("")}</div></section>` : ""}
`;
}
/* ---------- carta en grande (álbum y diccionario): delante imagen + palabra; detrás todo lo demás ---------- */
let OV = null; /* {k, list: [keys], flip, sent} */
const boxTxt = b => T1(["box0", "box1", "box1", "box2", "box2", "box3", "box3"][Math.min(b || 0, 6)]);
const reEsc = x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
async function sentenceOf(d) {
  try {
    const r = L().rdById(d.r); if (!r?.file) return null;
    const R = await L().loadReading(r.file), w = (d.w || "").toLowerCase();
    const raw = new RegExp(`\\[[^\\]|]*\\|${reEsc(d.k)}\\]`, "i"), wre = new RegExp(`(^|[^\\p{L}])(${reEsc(w)})(?=[^\\p{L}]|$)`, "iu");
    for (const p of R.text || []) for (const sn of p.match(/[^.!?]+[.!?]*/g) || []) {
      const pl = L().plain(sn).trim();
      if ((raw.test(sn) || wre.test(pl)) && pl.length < 300) return {txt: pl, r: r.id, title: r.title?.[S_().learn] || ""};
    }
  } catch (e) {}
  return null;
}
function openBig(k, list) {
  OV = {k, list: list || [k], flip: false, sent: undefined, t: Date.now()};
  drawOV(); document.querySelector("#fcov .fcbigc")?.focus({preventScroll: true});
}
function closeBig() { OV = null; document.getElementById("fcov")?.remove(); }
function drawOV() {
  if (!OV) return closeBig();
  const s = S_(), d = dictMine().find(x => x.k === OV.k), c = FC().c[cid(s.learn, OV.k)];
  if (!d && !c) return closeBig();
  const w = d?.w || c.w, tr = d ? trOf(d) : c.t || "", def = d?.d || "", i = OV.list.indexOf(OV.k);
  if (OV.sent === undefined && d) { OV.sent = null; sentenceOf(d).then(x => { if (OV && OV.k === d.k) { OV.sent = x || false; drawOV(); } }); }
  let el = document.getElementById("fcov");
  if (!el) { el = document.createElement("div"); el.id = "fcov"; el.className = "fcmodal"; el.dataset.fca = "close"; document.body.appendChild(el); }
  const sn = OV.sent ? `<p class="fcsent"><span>«${esc(OV.sent.txt).replace(new RegExp(`(^|[^\\p{L}])(${reEsc(esc(w))})(?=[^\\p{L}]|$)`, "iu"), "$1<mark>$2</mark>")}»</span><a href="#${esc(OV.sent.r)}" data-fca="goread">📖 ${esc(OV.sent.title || T1("to_read"))} →</a></p>` : "";
  const front = `<button type="button" class="fcimgbtn" data-fca="chimg" data-k="${esc(OV.k)}" aria-label="${esc(T1(c?.im ? "ch_img" : "make_card"))}">${imgHTML(c?.im, true)}<span class="fcpen">${c?.im ? "✏️ " + esc(T1("ch_img")) : "➕ " + esc(T1("make_card"))}</span></button>
      <b class="fcw1">${esc(w)}</b>`;
  const back = `<b class="fcw1">${esc(w)}</b><span class="fctr">${esc(tr)}</span>${def ? `<span class="fcdef">${esc(def)}</span>` : ""}${c?.n ? `<span class="fcnote">📝 ${esc(c.n)}</span>` : ""}
      ${sn}${c ? `<p class="fcknow"><span>${esc(T1("box"))}</span><span class="fcbox big">${"●".repeat(Math.min(c.b || 0, 6))}${"○".repeat(Math.max(0, 6 - (c.b || 0)))}</span><b>${esc(boxTxt(c.b))}</b></p>` : ""}`;
  el.innerHTML = `<div class="fcbigc${OV.flip ? " flip" : ""}" role="dialog" aria-modal="true" aria-label="${esc(w)}" tabindex="-1">
    <div class="fcside">${OV.flip ? back : front}</div>
    <div class="row fcctr"><button class="btn" data-fca="bsay" data-w="${esc(w)}" aria-label="🔊 ${esc(w)}">🔊</button><button class="btn main" data-fca="bflip">🔄 ${esc(T1(OV.flip ? "flip_front" : "flip"))}</button>
      ${c ? `<button class="btn" data-fca="brev">🔁 ${esc(T1("rev_one"))}</button>` : `<button class="btn" data-fca="chimg" data-k="${esc(OV.k)}">➕ ${esc(T1("make_card"))}</button>`}</div>
    <div class="row fcctr fcsm2"><button class="btn" data-fca="bnav" data-v="-1" ${i > 0 ? "" : "disabled"} aria-label="${esc(T1("pg_prev"))}">‹</button>
      ${c ? `<button class="btn" data-fca="chimg" data-k="${esc(OV.k)}">🖼️ ${esc(T1("ch_img"))}</button><button class="btn fcko" data-fca="bdel">🗑 ${esc(T1("del"))}</button>` : ""}
      <button class="btn" data-fca="bnav" data-v="1" ${i >= 0 && i < OV.list.length - 1 ? "" : "disabled"} aria-label="${esc(T1("pg_next"))}">›</button></div>
    <button type="button" class="x fcclose" data-fca="close" aria-label="${esc(T1("close"))}">×</button></div>`;
}
/* overlay actions (it lives outside #app, so it works on any page) */
document.addEventListener("click", e => {
  const ov = e.target.closest("#fcov"); if (!ov || !OV) return;
  const b = e.target.closest("[data-fca]"); if (!b) return;
  const a = b.dataset.fca;
  if (a === "close") { if (b === ov && e.target !== ov) return; closeBig(); if (S_().view === "fc") rerender(); return; }
  e.stopPropagation();
  const c = FC().c[cid(S_().learn, OV.k)];
  if (a === "bflip") { OV.flip = !OV.flip; drawOV(); }
  else if (a === "bsay") { try { L().speak(b.dataset.w, 1); } catch (err) {} }
  else if (a === "bnav") { const k = OV.list[OV.list.indexOf(OV.k) + +b.dataset.v]; if (k) { OV = {...OV, k, flip: false, sent: undefined}; const j = order().findIndex(x => x.k === k); if (j >= 0) PG = Math.floor(j / 8); drawOV(); } }
  else if (a === "goread") closeBig();
  else if (a === "chimg") { const k = OV.k; RET = {k, list: OV.list, hash: location.hash || "#diccionario"}; closeBig(); V = {p: "home"}; if (location.hash !== "#fichas") location.hash = "#fichas"; setTimeout(() => openEdit(k), 0); }
  else if (a === "brev" && c) { const id = cid(S_().learn, OV.k); closeBig(); if (location.hash !== "#fichas") location.hash = "#fichas"; setTimeout(() => go("rev", {q: [id], i: 0, flip: false, a: 0, n: 1, again: {}, one: 1}), 0); }
  else if (a === "bdel" && c && confirmDel(c)) { delete FC().c[cid(S_().learn, OV.k)]; if (c.im?.t === "draw") borrarDibujo(c.im.id); save(); closeBig(); if (S_().view === "fc") rerender(); else L().renderPage(); }
}, true);
/* clicking a card anywhere in the card itself flips it (not the buttons) */
document.addEventListener("click", e => { if (!OV) return; const side = e.target.closest("#fcov .fcside"); if (side && !e.target.closest("button,a")) { OV.flip = !OV.flip; drawOV(); } });
let RET = null; /* where to go back after changing a picture from the big card */

const turn = d => { const spreads = Math.max(1, Math.ceil(cards().length / 8)), n = Math.min(Math.max(0, PG + d), spreads - 1); if (n === PG) return; PG = n; V.turn = d > 0 ? "n" : "p"; rerender(); setTimeout(() => { V.turn = ""; }, 400); };

/* --- editor --- */
function openEdit(k) {
  const s = S_(), id = cid(s.learn, k), c = FC().c[id], d = dictMine().find(x => x.k === k) || (c && {l: c.l, k: c.k, w: c.w, t: c.t}); if (!d) return;
  go("edit", {id, k: d.k, w: d.w, t: d.tr ? trOf(d) : d.t || "", im: c?.im ? {...c.im} : null, n: c?.n || "", tab: c?.im ? (c.im.t === "draw" ? "draw" : c.im.t === "emoji" ? "emoji" : "web") : "draw", web: c?.im?.t === "pix" ? "pix" : c?.im?.t === "wiki" ? "wiki" : "link", res: null, msg: ""});
}
function edit() {
  const tabs = [["draw", "✏️", "t_draw"], ["emoji", "😀", "t_emoji"], ["web", "🌐", "t_web"]];
  const webs = [["link", "w_link"], ["pix", "w_pix"], ["wiki", "w_wiki"]];
  let body = "";
  if (V.tab === "draw") body = canvasHTML();
  else if (V.tab === "emoji") body = `<p class="fcsm">${TI("pick_emoji")}</p><div class="fcemos">${EMOJI.map(e => `<button type="button" data-fca="emo" data-v="${e}" class="${V.im?.t === "emoji" && V.im.v === e ? "on" : ""}">${e}</button>`).join("")}</div>
      <label class="fclab">${TI("emoji_ph")}<input id="fcemoin" maxlength="16" value="${V.im?.t === "emoji" && !EMOJI.includes(V.im.v) ? esc(V.im.v) : ""}" autocomplete="off"></label>`;
  else {
    body = `<div class="seg fcsub" role="group">${webs.map(([w, k]) => `<button data-fca="web" data-v="${w}" aria-pressed="${V.web === w}">${TI(k)}</button>`).join("")}</div>`;
    if (V.web === "link") body += `<p class="fcsm">${TI("link_h")}</p><form class="fcrow" data-fcform="link"><input id="fclink" type="url" inputmode="url" placeholder="${esc(T1("link_ph"))}" value="${V.im?.t === "url" ? esc(V.im.v) : ""}" autocomplete="off"><button class="btn" type="submit">${TI("try")}</button></form>`;
    else body += `<form class="fcrow" data-fcform="search"><input id="fcq" type="search" placeholder="${esc(T1("search_ph"))}" value="${esc(V.q ?? V.w)}" autocomplete="off"><button class="btn" type="submit">🔎 ${TI("search")}</button></form>
      ${V.res === "…" ? `<p class="fcsm">${TI("searching")}</p>` : V.res ? (V.res.length ? `<div class="fcres">${V.res.map((r, i) => `<button type="button" data-fca="pickimg" data-i="${i}" class="${V.im?.v === r.u ? "on" : ""}"><img src="${esc(r.u)}" alt="" loading="lazy" referrerpolicy="no-referrer"></button>`).join("")}</div>
        <p class="fcsm">${V.web === "pix" ? `<a href="https://pixabay.com/" target="_blank" rel="noopener">Pixabay</a>` : `<a href="https://commons.wikimedia.org/" target="_blank" rel="noopener">Wikimedia Commons</a>`}</p>` : `<p class="fcsm">${TI("no_res")}</p>`) : ""}`;
  }
  const preview = V.tab !== "draw" ? `<div class="fcprev">${imgHTML(V.im && V.im.t !== "draw" ? V.im : null, true)}${V.im?.by ? `<small>${esc(T1("by", {a: V.im.by}))}</small>` : ""}</div>` : "";
  return `<p class="fcback"><button type="button" class="fclink" data-fca="ehome">← ${TI("back")}</button></p>
    <h1><span class="fcsm">${esc(T1("new_for"))}</span><br>${esc(V.w)}</h1><p class="en">${esc(V.t)}</p>
    <div class="seg fctabs" role="tablist">${tabs.map(([t, i, k]) => `<button role="tab" data-fca="tab" data-v="${t}" aria-selected="${V.tab === t}" aria-pressed="${V.tab === t}">${i} ${TI(k)}</button>`).join("")}</div>
    <div class="fced">${preview}<div class="fcbody">${body}</div></div>
    ${V.msg ? `<p class="fcmsg" role="status">${esc(V.msg)}</p>` : ""}
    <label class="fclab">${TI("note")}<input id="fcnote" maxlength="140" placeholder="${esc(T1("note_ph"))}" value="${esc(V.n)}"></label>
    <div class="row"><button class="btn main" data-fca="save">💾 ${TI("save")}</button><button class="btn" data-fca="ehome">${TI("cancel")}</button></div>`;
}
function saveCard() {
  const note = document.getElementById("fcnote")?.value.trim().slice(0, 140) || "";
  let im = V.im;
  if (V.tab === "draw") { if (!PAD?.drawn) { V.msg = T1("need_img"); V.n = note; return rerender(); } im = {t: "draw", id: guardarDibujo(PAD.data())}; }
  if (V.tab === "emoji") { const v = document.getElementById("fcemoin")?.value.trim(); if (v) im = {t: "emoji", v: v.slice(0, 16)}; }
  if (!im || (V.tab !== "draw" && im.t === "draw")) { V.msg = T1("need_img"); V.n = note; return rerender(); }
  putCard(V.k, im, note);
  toast(T1("saved")); goHome();
}
/* back to the album, on the page of the card (and open again if it came from the big card) */
function goHome() {
  const id = V.id, ret = RET; RET = null;
  if (ret && ret.hash !== "#fichas") { V = {p: "home"}; location.hash = ret.hash; setTimeout(() => openBig(ret.k, ret.list), 250); return; }
  go("home"); const i = order().findIndex(c => c.id === id); if (i >= 0) PG = Math.floor(i / 8);
  rerender(); if (ret) openBig(ret.k, order().map(c => c.k));
}
function putCard(k, im, note) {
  const s = S_(), d = dictMine().find(x => x.k === k), id = cid(s.learn, k), f = FC(), old = f.c[id];
  const c = f.c[id] = {...(old || {b: 0, due: dayN(), ok: 0, ko: 0, c0: Date.now()}), l: s.learn, k, w: d?.w || old?.w || k, t: d ? trOf(d) : old?.t || "", im, x: Date.now()};
  if (note !== undefined) c.n = note;
  if (old?.im?.t === "draw" && (im.t !== "draw" || im.id !== old.im.id)) setTimeout(() => borrarDibujo(old.im.id), 0);
  if (!old) xp(2, "fichas-crear"); /* once per card */
  save(); return c;
}
const toast = m => { let t = document.getElementById("fctoast"); if (!t) { t = document.createElement("div"); t.id = "fctoast"; t.setAttribute("role", "status"); document.body.appendChild(t); } t.textContent = m; t.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove("on"), 1800); };

/* --- repaso espaciado --- */
function startRev() { const q = shuf(dueCards()).slice(0, 20).map(c => c.id); if (!q.length) return; go("rev", {q, i: 0, flip: false, a: 0, n: q.length, again: {}}); }
function rev() {
  if (V.i >= V.q.length) return endHTML(TI("res", {a: V.a, n: V.n}), V.one ? "home" : "rev");
  const c = FC().c[V.q[V.i]], imgFirst = FC().first !== "word";
  const front = imgFirst ? imgHTML(c.im, true) : `<b class="fcw1">${esc(c.w)}</b>`;
  const back = `${imgFirst ? "" : imgHTML(c.im, true)}<b class="fcw1">${esc(c.w)}</b><span class="fctr">${esc(trCard(c))}</span>${defCard(c) ? `<span class="fcdef">${esc(defCard(c))}</span>` : ""}${c.n ? `<span class="fcnote">📝 ${esc(c.n)}</span>` : ""}`;
  return `<p class="fcback"><button type="button" class="fclink" data-fca="home">← ${TI("back")}</button> <span class="fcsm">${esc(T1("qty", {a: Math.min(V.i + 1, V.q.length), n: V.q.length}))}</span></p>
    <div class="fcbig${V.flip ? " flip" : ""}">${V.flip ? back : front}${V.flip ? `<button type="button" class="fcsay" data-fca="say" aria-label="🔊">🔊</button>` : ""}</div>
    <div class="row fcctr">${V.flip ? `<button class="btn fcko" data-fca="ans" data-v="0">✗ ${TI("not_knew")}</button><button class="btn main" data-fca="ans" data-v="1">✓ ${TI("knew")}</button>` : `<button class="btn main" data-fca="flip" data-fcfocus>${TI("show")}</button>`}</div>`;
}
function answer(ok) {
  const id = V.q[V.i], c = FC().c[id]; if (!c) { V.i++; return rerender(); }
  if (ok) { if (!V.again[id]) { c.b = Math.min((c.b || 0) + 1, GAP.length - 1); c.due = dayN() + GAP[c.b]; V.a++; } c.ok = (c.ok || 0) + 1; }
  else { c.b = 0; c.due = dayN(); c.ko = (c.ko || 0) + 1; if (!V.again[id]) { V.again[id] = 1; V.q.push(id); } }
  xp(ok ? 3 : 0, "fichas", {ok});
  V.i++; V.flip = false; save(); rerender();
}
function endHTML(score, again) {
  return `<h1>${TI("done")}</h1><div class="qc"><div class="big">${score}</div>
    <div class="row"><button class="btn main" data-fca="${again}">${TI("again")}</button><button class="btn" data-fca="home">${TI("back")}</button></div></div>`;
}

/* --- juego: ¿Qué es? --- */
const fold = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const norm = s => String(s).toLowerCase().replace(/\([^)]*\)/g, " ").replace(/[¡!¿?.,;:"«»'’…]/g, " ").replace(/\s+/g, " ").trim().replace(/^(to|the|a|an|el|la|los|las|un|una|der|die|das|ein|eine|il|lo|gli|le|uno)\s+/, "");
function startWhat() { const q = shuf(cards().filter(c => c.im && !(c.im.t === "draw" && !DIB[c.im.id]))).slice(0, 10).map(c => c.id); if (!q.length) return; go("what", {q, i: 0, a: 0, res: null, typed: ""}); }
function what() {
  if (V.i >= V.q.length) return endHTML(TI("res", {a: V.a, n: V.q.length}), "what");
  const c = FC().c[V.q[V.i]], r = V.res;
  return `<p class="fcback"><button type="button" class="fclink" data-fca="home">← ${TI("back")}</button> <span class="fcsm">${esc(T1("qty", {a: V.i + 1, n: V.q.length}))}</span></p>
    <h1>${TI("g_what")}</h1><div class="fcbig">${imgHTML(c.im, true)}${r ? `<span class="fctr">${esc(trCard(c))}</span>` : ""}</div>
    <form class="fcrow" data-fcform="what"><input id="fcans" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="${esc(T1("type_ph"))}" value="${esc(V.typed)}" ${r ? "readonly" : "data-fcfocus"}>
      ${r ? `<button class="btn main" type="button" data-fca="wnext" data-fcfocus>${TI("next")} →</button>` : `<button class="btn main" type="submit">${TI("check")}</button><button class="btn" type="button" data-fca="wskip">${TI("skip")}</button>`}</form>
    ${r ? `<p class="fcmsg ${r === "bad" ? "bad" : "ok"}" role="status">${r === "ok" ? TI("right") : r === "acc" ? TI("accent", {w: c.w}) : TI("wrong", {w: c.w})}</p>` : ""}`;
}
function checkWhat(typed) {
  const c = FC().c[V.q[V.i]], t = norm(typed), ok = c.w.split(/\s*[\/;,]\s*/).map(norm);
  V.typed = typed;
  V.res = !t ? "bad" : ok.includes(t) ? "ok" : ok.map(fold).includes(fold(t)) ? "acc" : "bad";
  const good = V.res !== "bad";
  if (good) V.a++;
  /* counts as a review too: a right answer moves the card up only if it was due */
  if (good && (c.due ?? 0) <= dayN()) { c.b = Math.min((c.b || 0) + 1, GAP.length - 1); c.due = dayN() + GAP[c.b]; }
  if (!good) { c.b = 0; c.due = dayN(); }
  xp(good ? 5 : 0, "fichas-que", {ok: good}); save(); rerender();
}

/* --- juego: Dibújalo --- */
function startDraw() {
  const cs = Object.fromEntries(cards().map(c => [c.k, c]));
  const ws = dictMine().filter((d, i, a) => a.findIndex(x => x.k === d.k) === i);
  /* first the words without a card or without a drawing */
  const q = [...shuf(ws.filter(d => !cs[d.k]?.im)), ...shuf(ws.filter(d => cs[d.k]?.im && cs[d.k].im.t !== "draw")), ...shuf(ws.filter(d => cs[d.k]?.im?.t === "draw"))].slice(0, 5).map(d => d.k);
  if (!q.length) return; go("draw", {q, i: 0, a: 0, msg: "", pend: [], pn: 0});
}
function draw() {
  if (V.i >= V.q.length && V.pend?.length) return compareHTML();
  if (V.i >= V.q.length) return endHTML(`${V.a} ✏️<br><small>${TI("draw_done")}</small>`, "draw");
  const d = dictMine().find(x => x.k === V.q[V.i]);
  if (!d) { V.i++; return draw(); }
  return `<p class="fcback"><button type="button" class="fclink" data-fca="home">← ${TI("back")}</button> <span class="fcsm">${esc(T1("qty", {a: V.i + 1, n: V.q.length}))}</span></p>
    <h1>${esc(T1("draw_this", {w: d.w}))}</h1><p class="en">${esc(trOf(d))}</p>${canvasHTML()}
    ${V.msg ? `<p class="fcmsg" role="status">${esc(V.msg)}</p>` : ""}
    <div class="row"><button class="btn main" data-fca="dkeep">💾 ${TI("draw_keep")}</button><button class="btn" data-fca="dskip">${TI("draw_skip")} →</button></div>`;
}
/* the card already had a picture: old or new? */
function compareHTML() {
  const p = V.pend[0], c = FC().c[cid(S_().learn, p.k)];
  return `<h1>${esc(c?.w || p.k)}</h1><p class="en">${TI("which")}</p>
    <div class="fccmp"><button type="button" class="fcopt" data-fca="keep" data-v="old">${imgHTML(c?.im, true)}<b>${TI("old_img")}</b></button>
      <button type="button" class="fcopt" data-fca="keep" data-v="new"><img class="fcimg big fcdraw" src="${esc(p.data)}" alt=""><b>${TI("new_img")}</b></button></div>
    <p class="fcsm fcmid">${esc(T1("qty", {a: V.pn - V.pend.length + 1, n: V.pn}))}</p>`;
}

/* ---------- acciones ---------- */
/* dictionary: tapping a word (not its buttons) opens its card big */
document.addEventListener("click", e => {
  if (S_()?.view !== "dict" || e.target.closest("button,a,input")) return;
  const li = e.target.closest("#app .words li"), k = li?.querySelector(".fcwb")?.dataset.k; if (!k) return;
  openBig(k, [...new Set([...document.querySelectorAll("#app .words .fcwb")].map(x => x.dataset.k))]);
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-fca]"); if (!b || b.closest("#fcov") || S_()?.view !== "fc" && !b.closest("#app .words, #app .fcdict")) return;
  const a = b.dataset.fca;
  if (a === "open") { const ks = [...document.querySelectorAll("#app .words .fcwb")].map(x => x.dataset.k); openBig(b.dataset.k, [...new Set(ks)]); return; }
  if (S_().view !== "fc") return;
  if (a === "home") go("home");
  else if (a === "ehome") goHome();
  else if (a === "play") { V.play = !V.play; rerender(); }
  else if (a === "pg") turn(+b.dataset.v);
  else if (a === "pgto") turn(+b.dataset.v - PG);
  else if (a === "big") { const c = FC().c[b.dataset.id]; if (c) openBig(c.k, order().map(x => x.k)); }
  else if (a === "keep") { const p = V.pend.shift(); if (b.dataset.v === "new") putCard(p.k, {t: "draw", id: guardarDibujo(p.data)}); rerender(); }
  else if (a === "first") { FC().first = b.dataset.v; save(); rerender(); }
  else if (a === "new" || a === "edit") { const k = a === "new" ? b.dataset.k : FC().c[b.dataset.id]?.k; if (k) { if (dictMine().some(d => d.k === k)) openEdit(k); } }
  else if (a === "del") { const c = FC().c[b.dataset.id]; if (c && confirmDel(c)) { delete FC().c[b.dataset.id]; if (c.im?.t === "draw") borrarDibujo(c.im.id); save(); rerender(); } }
  else if (a === "tab") { keepNote(); V.tab = b.dataset.v; V.msg = ""; rerender(); }
  else if (a === "web") { keepNote(); V.web = b.dataset.v; V.res = null; V.msg = ""; rerender(); }
  else if (a === "emo") { keepNote(); V.im = {t: "emoji", v: b.dataset.v}; V.msg = ""; rerender(); }
  else if (a === "pickimg") { keepNote(); const r = V.res[+b.dataset.i]; V.im = V.web === "pix" ? {t: "pix", v: r.u, id: String(r.id), by: r.by} : {t: "wiki", v: r.u, by: r.by}; V.msg = ""; rerender(); }
  else if (a === "save") saveCard();
  else if (a === "rev") startRev();
  else if (a === "flip") { V.flip = true; rerender(); }
  else if (a === "ans") answer(b.dataset.v === "1");
  else if (a === "say") { const w = b.dataset.w || FC().c[V.q?.[V.i]]?.w; try { if (w) L().speak(w, 1); } catch (err) {} }
  else if (a === "what") startWhat();
  else if (a === "wskip") checkWhat("");
  else if (a === "wnext") { V.i++; V.res = null; V.typed = ""; rerender(); }
  else if (a === "draw") startDraw();
  else if (a === "dskip") { V.i++; V.msg = ""; rerender(); scrollTo(0, 0); }
  else if (a === "dkeep") {
    if (!PAD?.drawn) { V.msg = T1("draw_none"); return rerender(); }
    const k = V.q[V.i], c = FC().c[cid(S_().learn, k)], data = PAD.data();
    if (c?.im && !(c.im.t === "draw" && !DIB[c.im.id])) { V.pend.push({k, data}); V.pn++; } else putCard(k, {t: "draw", id: guardarDibujo(data)});
    xp(3, "fichas-dibujo"); V.a++; V.i++; V.msg = ""; rerender(); scrollTo(0, 0);
  }
});
const confirmDel = c => { try { return confirm(T1("del_q", {w: c.w})); } catch (e) { return true; } };
const keepNote = () => { const n = document.getElementById("fcnote"); if (n) V.n = n.value; };
document.addEventListener("submit", async e => {
  const f = e.target.closest("[data-fcform]"); if (!f) return; e.preventDefault();
  const k = f.dataset.fcform;
  if (k === "what") return checkWhat(document.getElementById("fcans").value);
  keepNote();
  if (k === "link") {
    const v = document.getElementById("fclink").value.trim();
    if (!/^https:\/\/[^\s"'<>]{4,1500}$/.test(v)) { V.msg = T1("bad_link"); return rerender(); }
    const ok = await new Promise(res => { const im = new Image(); im.referrerPolicy = "no-referrer"; im.onload = () => res(im.naturalWidth > 0); im.onerror = () => res(false); setTimeout(() => res(false), 8000); im.src = v; });
    V.im = ok ? {t: "url", v} : V.im; V.msg = ok ? "" : T1("bad_link"); return rerender();
  }
  if (k === "search") {
    const q = document.getElementById("fcq").value; V.q = q; V.res = "…"; V.msg = ""; rerender();
    const r = await buscar(V.web, q); if (V.p !== "edit") return;
    V.res = r.err ? null : r.imgs; V.msg = r.err ? T1(r.err) : ""; rerender();
  }
});
document.addEventListener("keydown", e => {
  if (OV && !e.target.closest("input,textarea")) {
    if (e.key === "Escape") { closeBig(); if (S_().view === "fc") rerender(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowRight") document.querySelector(`#fcov [data-fca="bnav"][data-v="${e.key === "ArrowLeft" ? -1 : 1}"]`)?.click();
    else if (e.key === " ") { e.preventDefault(); OV.flip = !OV.flip; drawOV(); }
    return;
  }
  if (S_()?.view !== "fc" || e.target.closest("input,textarea")) return;
  if (V.p === "home") {
    if (e.key === "ArrowLeft" || e.key === "PageUp") turn(-1); else if (e.key === "ArrowRight" || e.key === "PageDown") turn(1);
    return;
  }
  if (V.p !== "rev") return;
  if (!V.flip && (e.key === " " || e.key === "Enter")) { e.preventDefault(); V.flip = true; rerender(); }
  else if (V.flip && (e.key === "1" || e.key === "ArrowLeft")) answer(false);
  else if (V.flip && (e.key === "2" || e.key === "ArrowRight")) answer(true);
});
/* swipe to turn the page (finger or mouse) */
let sw = null;
document.addEventListener("pointerdown", e => { const a = e.target.closest("#fcalb"); sw = a && !OV ? {x: e.clientX, y: e.clientY} : null; });
document.addEventListener("pointerup", e => { if (!sw) return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { turn(dx < 0 ? 1 : -1); swiped = Date.now(); } });
let swiped = 0;
document.addEventListener("click", e => { if (Date.now() - swiped < 300 && e.target.closest("#fcalb")) { e.stopPropagation(); e.preventDefault(); } }, true);
document.addEventListener("wheel", e => { if (S_()?.view !== "fc" || V.p !== "home" || OV || !e.target.closest("#fcalb") || Math.abs(e.deltaX) < 30 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return; e.preventDefault(); if (Date.now() - (turn.w || 0) > 500) { turn.w = Date.now(); turn(e.deltaX > 0 ? 1 : -1); } }, {passive: false});
addEventListener("hashchange", () => { if (OV && !RET && Date.now() - OV.t > 600) closeBig(); if (location.hash !== "#fichas") V = {p: "home"}; });

/* ---------- para el diccionario ---------- */
/* banner at the top of the dictionary page */
function dictBanner() {
  const n = cards().length, due = dueCards().length;
  return `<a class="fcban fcdict" href="#fichas"><span class="fcbi" aria-hidden="true">🃏</span><span><b>${TI("from_dict")}</b><small>${esc(T1("n_cards", {n}))}${due ? ` · ${esc(T1("due", {n: due}))}` : ""}</small></span><span aria-hidden="true">→</span></a>`;
}
/* small button on each word of the dictionary */
function wordBtn(d) {
  const c = FC().c[cid(d.l, d.k)];
  return `<button type="button" class="fcwb" data-fca="open" data-k="${esc(d.k)}" aria-label="${esc(T1("card_btn"))} ${esc(d.w)}" title="${esc(T1("card_btn"))}">${c?.im ? imgHTML(c.im) : "🃏"}</button>`;
}

window.LYAFichas = {render, isFc, tab, dictBanner, wordBtn, sync, _V: () => V, _P: () => PAD && {drawn: PAD.drawn, same: PAD.cv === document.getElementById("fccv")}};
})();
