/* Para el alumno con cuenta: «Deberes» (caja en la portada y página #deberes) y mensajes del profe (ventana al entrar).
   - Cada deber se toca y abre directamente la actividad: lectura, dictado, canción, concurso, vídeo con preguntas o doblaje.
   - Deberes «en clase, en directo»: cuando el profe abre la sala avisando a la clase, el alumno entra solo
     (se pregunta cada 5 s a api/concursos?aviso=<clase>, que va con caché y lo comparte toda la clase).
   Solo en la web con servidor. Usa LYACuentas (cuentas.js), LYA (index.html) y LYAActividades (actividades.js). */
(() => {
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const TX = {
  ca: {tab: "📚 Deures", deb: "📚 Els teus deures", hasta: "Fins al {d}", hoy: "Avui és l'últim dia!", tarde: "S'ha acabat el termini", hecha: "Feta", ir: "Llegir", oir: "Escoltar", msg: "📬 Missatge del teu profe", msgs: "📬 Missatges del teu profe", ok: "Entesos!", dict: "Dictat", escribir: "Escriure",
    hacer: "Fer", jugar: "Jugar", ver: "Mirar", directo: "🔴 A classe, en directe", espera: "Quan el teu profe obri la sala, hi entraràs sol.", abierta: "🔴 El teu profe ha obert «{t}»", entrar: "Entrar ara", entrando: "Entrant…",
    todos: "Veure tots els deures", vacio: "No tens deures. 🎉", h1: "Els meus deures", sub: "Toca un deure per fer-lo. Els de «a classe, en directe» s'obren sols quan el teu profe obre la sala.", sinclase: "Encara no ets a cap classe. Posa el codi que et doni el teu profe a «El meu compte».", entra: "Entra amb el teu compte per veure els teus deures.", pendientes: "Per fer", hechos: "Fets"},
  es: {tab: "📚 Deberes", deb: "📚 Tus deberes", hasta: "Hasta el {d}", hoy: "¡Hoy es el último día!", tarde: "Se acabó el plazo", hecha: "Hecha", ir: "Leer", oir: "Escuchar", msg: "📬 Mensaje de tu profe", msgs: "📬 Mensajes de tu profe", ok: "¡Entendido!", dict: "Dictado", escribir: "Escribir",
    hacer: "Hacer", jugar: "Jugar", ver: "Ver", directo: "🔴 En clase, en directo", espera: "Cuando tu profe abra la sala, entrarás solo.", abierta: "🔴 Tu profe ha abierto «{t}»", entrar: "Entrar ahora", entrando: "Entrando…",
    todos: "Ver todos los deberes", vacio: "No tienes deberes. 🎉", h1: "Mis deberes", sub: "Toca un deber para hacerlo. Los de «en clase, en directo» se abren solos cuando tu profe abre la sala.", sinclase: "Todavía no estás en ninguna clase. Pon el código que te dé tu profe en «Mi cuenta».", entra: "Entra con tu cuenta para ver tus deberes.", pendientes: "Por hacer", hechos: "Hechos"},
  en: {tab: "📚 Homework", deb: "📚 Your homework", hasta: "Due {d}", hoy: "Today is the last day!", tarde: "Past the due date", hecha: "Done", ir: "Read", oir: "Listen", msg: "📬 A message from your teacher", msgs: "📬 Messages from your teacher", ok: "Got it!", dict: "Dictation", escribir: "Write",
    hacer: "Do it", jugar: "Play", ver: "Watch", directo: "🔴 Live in class", espera: "When your teacher opens the room, you'll join automatically.", abierta: "🔴 Your teacher has opened “{t}”", entrar: "Join now", entrando: "Joining…",
    todos: "See all homework", vacio: "No homework. 🎉", h1: "My homework", sub: "Tap a task to do it. “Live in class” ones open by themselves when your teacher opens the room.", sinclase: "You're not in a class yet. Enter the code your teacher gives you in “My account”.", entra: "Sign in to see your homework.", pendientes: "To do", hechos: "Done"},
};
let A = null, sala = null, sondeo = null, ignorada = "";
const auto = new Set();
const S = () => (window.LYA && window.LYA.S) || {learn: "es", know: "en"};
const both = () => { try { return window.LYA.both(); } catch (e) { return false; } };
const t = (k, v = {}, lang = S().learn) => { let s = (TX[lang] || TX.es)[k] ?? TX.es[k]; for (const x in v) s = s.replace(`{${x}}`, v[x]); return s; };
const T = (k, v) => esc(t(k, v)) + (both() && S().know !== S().learn ? ` · ${esc(t(k, v, S().know))}` : "");
const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const dia = d => new Date(d + "T12:00:00").toLocaleDateString(S().learn === "en" ? "en-GB" : "es-ES", {weekday: "long", day: "numeric", month: "long"});
const C = () => window.LYACuentas || {};
const ICONO = {quiz: "🏆", video: "🎬", doblaje: "🎙️"};

/* qué abre cada deber y si está hecho */
function info(d) {
  const s = S(), g = s.g || {};
  if (d.actividad) {
    const id = d.actividad, h = (g.ac || {})[id];
    const ruta = d.tipo === "video" ? "#video-solo-" + id : d.tipo === "doblaje" ? "#doblaje-" + id : "#concurso-solo-" + id;
    return {titulo: `${ICONO[d.tipo] || "🧩"} ${d.titulo || ""}`, hecha: h, ruta: d.directo ? null : ruta, boton: d.tipo === "video" ? "ver" : d.tipo === "quiz" ? "jugar" : "hacer", directo: !!d.directo};
  }
  if (d.cancion) return {titulo: "🎵 " + (d.titulo || ""), hecha: (g.cn || {})[d.cancion], ruta: "#cancion-" + d.cancion, boton: "oir"};
  const dic = /^dictado-/.test(d.lectura || ""), r = window.LYA && window.LYA.rdById ? window.LYA.rdById(dic ? d.lectura.slice(8) : d.lectura) : null;
  const titulo = r ? (dic ? "✍️ " + t("dict") + ": " : "📖 ") + (r.title[s.learn] || r.title.es) + ` · ${r.level}` : d.lectura;
  return {titulo, hecha: dic ? (g.dc || {})[d.lectura.slice(8)] : (g.rd || {})[d.lectura], ruta: r && r.file ? "#" + d.lectura : null, boton: dic ? "escribir" : "ir"};
}
function item(d) {
  const x = info(d), h = hoy(), hecha = x.hecha;
  const cuando = hecha ? `✅ ${T("hecha")} ${"★".repeat(hecha.best || 0)}${"☆".repeat(3 - (hecha.best || 0))}` : d.limite < h ? T("tarde") : d.limite === h ? `<b>${T("hoy")}</b>` : T("hasta", {d: dia(d.limite)});
  const abierta = x.directo && sala && (!sala.idc || sala.idc === d.actividad);
  const dentro = `<div><b>${esc(x.titulo)}</b><small>${x.directo ? T("directo") + " · " : ""}${cuando}${d.nota ? " · " + esc(d.nota) : ""}</small>${x.directo && !abierta && !hecha ? `<small>${T("espera")}</small>` : ""}</div>`;
  if (abierta) return `<li class="deb-vivo"><button type="button" class="deb-a" data-deb="entrar">${dentro}<span class="btn main">${T("entrar")}</span></button></li>`;
  if (x.ruta) return `<li class="${hecha ? "ok" : ""}"><a class="deb-a" href="${esc(x.ruta)}">${dentro}<span class="btn${hecha ? "" : " main"}">${T(x.boton)}</span></a></li>`;
  return `<li class="${hecha ? "ok" : ""}"><div class="deb-a">${dentro}</div></li>`;
}
const ordenar = ds => [...ds].sort((a, b) => (!!info(a).hecha) - (!!info(b).hecha) || a.limite.localeCompare(b.limite));
const bandera = () => sala && sala.codigo !== ignorada ? `<button type="button" class="deb-sala" data-deb="entrar">${T("abierta", {t: esc(sala.titulo || "")})} <span class="btn main">${T("entrar")}</span></button>` : "";

/* caja de la portada */
function html() {
  if (!A || (!A.deberes.length && !sala)) return "";
  const ds = ordenar(A.deberes), max = 5;
  return `<section class="deb" id="deberes"><h2>${T("deb")}</h2>${bandera()}<ul>${ds.slice(0, max).map(item).join("")}</ul>
    ${ds.length > max ? `<p class="deb-mas"><a href="#deberes">${T("todos")} (${ds.length}) →</a></p>` : ""}</section>`;
}
/* página #deberes */
const isDeb = h => h === "deberes";
function render(app) {
  let cuerpo;
  if (!C().usuario) cuerpo = `<p class="cc-msg">${T("entra")}</p>`;
  else if (!A) cuerpo = `<p class="msg">…</p>`;
  else if (!A.clase && !A.deberes.length) cuerpo = `<p class="cc-msg">${T("sinclase")}</p>`;
  else {
    const ds = ordenar(A.deberes), pend = ds.filter(d => !info(d).hecha), hechos = ds.filter(d => info(d).hecha);
    cuerpo = `${bandera()}${!ds.length ? `<p class="cc-msg">${T("vacio")}</p>` : ""}
      ${pend.length ? `<h2>${T("pendientes")} (${pend.length})</h2><ul>${pend.map(item).join("")}</ul>` : ""}
      ${hechos.length ? `<h2>${T("hechos")} (${hechos.length})</h2><ul>${hechos.map(item).join("")}</ul>` : ""}`;
  }
  app.innerHTML = `<section class="wrap deb deb-pag"><h1>📚 ${T("h1")}</h1><p class="deb-sub">${T("sub")}</p>${cuerpo}</section>`;
  if (C().usuario && !A) cargar();
}
const tabHTML = view => C().usuario && A && A.rol === "alumno" && (A.clase || A.deberes.length)
  ? `<a href="#deberes" ${view === "deb" ? 'aria-current="page"' : ""}>${esc(t("tab"))}${A.deberes.filter(d => !info(d).hecha).length ? ` <span class="deb-n">${A.deberes.filter(d => !info(d).hecha).length}</span>` : ""}</a>` : "";

function mensajes() {
  const nuevos = A.mensajes.filter(m => !m.leido); if (!nuevos.length || !C().ui) return;
  C().ui.ventana(`<h2>${T(nuevos.length === 1 ? "msg" : "msgs")}</h2><ul class="ctali">${nuevos.map(m => `<li><p>${esc(m.texto)}</p><small>${new Date(m.t).toLocaleString("es-ES", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"})}</small></li>`).join("")}</ul><p style="margin-top:14px"><button class="btn main" type="button" data-cerrar id="avok">${T("ok")}</button></p>`);
  C().api("avisos", "POST", {leidos: nuevos.map(m => m.id)}).catch(() => {});
}
const repintar = () => { try { const v = S().view; if (v === "home" || v === "deb") window.LYA.renderPage(); } catch (e) {} };
async function cargar() {
  if (!C().usuario || C().usuario === "admin" || !(await C().hayServidor())) return;
  try { const r = await C().api("avisos"); if (!r.ok) return; A = r.j; sala = A.sala || null; } catch (e) { return; }
  repintar();
  mensajes();
  if (sala) llega();
  vigilar();
}

/* ---------- sala en directo de la clase ---------- */
const hayDirecto = () => A && A.deberes.some(d => d.directo && !info(d).hecha);
function vigilar() {
  clearTimeout(sondeo);
  if (!A || !A.clase || !A.clase.id || A.rol !== "alumno") return;
  const v = S().view;
  if (!(hayDirecto() || v === "deb") || document.visibilityState === "hidden") { sondeo = setTimeout(vigilar, 15000); return; }
  sondeo = setTimeout(async () => {
    try {
      const r = await fetch("api/concursos?aviso=" + A.clase.id); const j = await r.json();
      const antes = sala && sala.codigo; sala = j.sala || null;
      if ((sala && sala.codigo) !== antes) { repintar(); if (sala) llega(); }
    } catch (e) {}
    vigilar();
  }, 5000);
}
/* acaba de abrirse una sala: si está en la portada o en Deberes, entra solo; si no, se lo dice */
function llega() {
  if (!sala || sala.codigo === ignorada) return;
  const v = S().view, yaDentro = location.hash.includes(sala.codigo);
  if (yaDentro || auto.has(sala.codigo)) return;  /* solo una vez: si sale de la sala, no se le vuelve a meter (tiene el botón) */
  auto.add(sala.codigo);
  if (v === "home" || v === "deb") return entrar();
  if (C().ui) {
    C().ui.ventana(`<h2>${T("abierta", {t: esc(sala.titulo || "")})}</h2><p style="margin-top:14px"><button class="btn main" type="button" id="deb-ent">${T("entrar")}</button> <button class="btn" type="button" data-cerrar id="deb-no">✕</button></p>`);
    const d = C().ui.dlg; d.querySelector("#deb-ent").onclick = () => { C().ui.cerrar(); entrar(); };
    d.querySelector("#deb-no").addEventListener("click", () => { ignorada = sala.codigo; });
  }
}
async function entrar() {
  if (!sala || !window.LYAActividades) return;
  document.querySelectorAll("[data-deb=entrar] .btn").forEach(b => { b.textContent = t("entrando"); });
  await window.LYAActividades.entrar(sala);
}
document.addEventListener("click", e => { const b = e.target.closest("[data-deb=entrar]"); if (b) { e.preventDefault(); entrar(); } });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && A) vigilar(); });
addEventListener("hashchange", () => { if (A && location.hash === "#deberes") setTimeout(cargar, 0); });  /* deberes al día, y después de que index.html cambie la vista */

window.LYAAvisos = {html, cargar, render, isDeb, tabHTML, deberes: () => (A && A.deberes) || []};
})();
