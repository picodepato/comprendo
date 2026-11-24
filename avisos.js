/* Para el alumno con cuenta: lecturas asignadas por el profe (caja en la portada) y mensajes del admin (ventana al entrar).
   Solo en la web con servidor. Usa LYACuentas (cuentas.js) y LYA (index.html). */
(() => {
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const TX = {
  es: {deb: "📚 Tus deberes", hasta: "Hasta el {d}", hoy: "¡Hoy es el último día!", tarde: "Se acabó el plazo", hecha: "Hecha", ir: "Leer", msg: "📬 Mensaje de tu profe", msgs: "📬 Mensajes de tu profe", ok: "¡Entendido!", oir: "Escuchar", dict: "Dictado", escribir: "Escribir"},
  en: {deb: "📚 Your homework", hasta: "Due {d}", hoy: "Today is the last day!", tarde: "Past the due date", hecha: "Done", ir: "Read", msg: "📬 A message from your teacher", msgs: "📬 Messages from your teacher", ok: "Got it!", oir: "Listen", dict: "Dictation", escribir: "Write"},
};
let A = null;
const S = () => (window.LYA && window.LYA.S) || {learn: "es", know: "en"};
const both = () => { try { return window.LYA.both(); } catch (e) { return false; } };
const t = (k, v = {}, lang = S().learn) => { let s = (TX[lang] || TX.es)[k]; for (const x in v) s = s.replace(`{${x}}`, v[x]); return s; };
const T = (k, v) => esc(t(k, v)) + (both() && S().know !== S().learn ? ` · ${esc(t(k, v, S().know))}` : "");
const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const dia = d => new Date(d + "T12:00:00").toLocaleDateString(S().learn === "en" ? "en-GB" : "es-ES", {weekday: "long", day: "numeric", month: "long"});
function html() {
  if (!A || !A.deberes.length) return "";
  const s = S(), rd = (s.g && s.g.rd) || {}, h = hoy();
  const cn = (s.g && s.g.cn) || {}, hechoDe = d => d.cancion ? cn[d.cancion] : /^dictado-/.test(d.lectura || "") ? ((s.g && s.g.dc) || {})[d.lectura.slice(8)] : rd[d.lectura];  /* canciones: S.g.cn · dictados: S.g.dc */
  const items = [...A.deberes].sort((a, b) => (!!hechoDe(a)) - (!!hechoDe(b)) || a.limite.localeCompare(b.limite)).map(d => {
    const dic = !d.cancion && /^dictado-/.test(d.lectura || ""), r = !d.cancion && window.LYA.rdById ? window.LYA.rdById(dic ? d.lectura.slice(8) : d.lectura) : null, hecha = hechoDe(d);
    const titulo = d.cancion ? "🎵 " + (d.titulo || "") : r ? (dic ? "✍️ " + t("dict") + ": " : "") + (r.title[s.learn] || r.title.es) + ` · ${r.level}` : d.lectura;
    const cuando = hecha ? `✅ ${T("hecha")} ${"★".repeat(hecha.best)}${"☆".repeat(3 - hecha.best)}` : d.limite < h ? T("tarde") : d.limite === h ? `<b>${T("hoy")}</b>` : T("hasta", {d: dia(d.limite)});
    return `<li class="${hecha ? "ok" : ""}"><div><b>${esc(titulo)}</b><small>${cuando}${d.nota ? " · " + esc(d.nota) : ""}</small></div>${d.cancion ? `<a class="btn${hecha ? "" : " main"}" href="#cancion-${esc(d.cancion)}">${T("oir")}</a>` : r && r.file ? `<a class="btn${hecha ? "" : " main"}" href="#${esc(d.lectura)}">${T(dic ? "escribir" : "ir")}</a>` : ""}</li>`;
  }).join("");
  return `<section class="deb" id="deberes"><h2>${T("deb")}</h2><ul>${items}</ul></section>`;
}
function mensajes() {
  const nuevos = A.mensajes.filter(m => !m.leido); if (!nuevos.length || !C().ui) return;
  C().ui.ventana(`<h2>${T(nuevos.length === 1 ? "msg" : "msgs")}</h2><ul class="ctali">${nuevos.map(m => `<li><p>${esc(m.texto)}</p><small>${new Date(m.t).toLocaleString("es-ES", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"})}</small></li>`).join("")}</ul><p style="margin-top:14px"><button class="btn main" type="button" data-cerrar id="avok">${T("ok")}</button></p>`);
  C().api("avisos", "POST", {leidos: nuevos.map(m => m.id)}).catch(() => {});
}
const C = () => window.LYACuentas || {};
async function cargar() {
  if (!C().usuario || C().usuario === "admin" || !(await C().hayServidor())) return;
  try { const r = await C().api("avisos"); if (!r.ok) return; A = r.j; } catch (e) { return; }
  try { if (S().view === "home") window.LYA.renderPage(); } catch (e) {}
  mensajes();
}
window.LYAAvisos = {html, cargar, deberes: () => (A && A.deberes) || []};
})();
