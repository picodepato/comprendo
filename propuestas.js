/* «Propón un tema para una lectura»: caja en la portada. Solo aparece en la web con servidor (Vercel).
   Las propuestas las ve el administrador (usuario admin) en su panel. Usa LYACuentas (cuentas.js) y LYA (index.html). */
(() => {
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const TX = {
  ca: {t: "💡 Proposa un tema per a una lectura", s: "Sobre què t'agradaria llegir? Escriu-ho i ho tindrem en compte.", ph: "Per exemple: els volcans, el meu videojoc preferit…", b: "Enviar", ok: "Gràcies! Hem rebut la teva idea.", corto: "Escriu almenys 3 lletres.", espera: "Has enviat moltes idees. Prova-ho d'aquí a una estona.", mal: "No s'ha pogut enviar. Torna-ho a provar."},
  es: {t: "💡 Propón un tema para una lectura", s: "¿Sobre qué te gustaría leer? Escríbelo y lo tendremos en cuenta.", ph: "Por ejemplo: los volcanes, mi videojuego favorito…", b: "Enviar", ok: "¡Gracias! Hemos recibido tu idea.", corto: "Escribe al menos 3 letras.", espera: "Has enviado muchas ideas. Prueba dentro de un rato.", mal: "No se ha podido enviar. Inténtalo otra vez."},
  en: {t: "💡 Suggest a topic for a reading", s: "What would you like to read about? Write it and we will take it into account.", ph: "For example: volcanoes, my favourite video game…", b: "Send", ok: "Thank you! We got your idea.", corto: "Write at least 3 letters.", espera: "You have sent many ideas. Try again later.", mal: "It could not be sent. Try again."},
};
let activo = false, msg = "";
const S = () => (window.LYA && window.LYA.S) || {learn: "es", know: "en"};
const both = () => { try { return window.LYA.both(); } catch (e) { return false; } };
const T = k => { const s = S(); const a = (TX[s.learn] || TX.es)[k]; return both() && s.know !== s.learn ? `${esc(a)}<span class="en" style="display:block">${esc((TX[s.know] || TX.en)[k])}</span>` : esc(a); };
const P = k => esc((TX[S().learn] || TX.es)[k]);
function html() {
  if (!activo) return "";
  return `<section class="prop" id="prop"><h2>${T("t")}</h2><p class="ctas" style="margin:0">${T("s")}</p>
    <form id="propf"><textarea name="texto" maxlength="300" rows="2" placeholder="${P("ph")}" aria-label="${P("t")}"></textarea><button class="btn main" type="submit">${P("b")}</button><p class="ctam" role="status">${msg}</p></form></section>`;
}
function pintar() { const el = document.getElementById("prop"); const w = document.createElement("div"); w.innerHTML = html(); if (el && w.firstElementChild) el.replaceWith(w.firstElementChild); else if (!el && activo && window.LYA?.renderPage && S().view === "home") window.LYA.renderPage(); }
document.addEventListener("submit", async e => {
  if (e.target.id !== "propf") return;
  e.preventDefault();
  const f = e.target, texto = f.texto.value.trim(), m = f.querySelector(".ctam"), b = f.querySelector("button");
  if (texto.length < 3) { m.innerHTML = T("corto"); return; }
  b.disabled = true;
  try {
    const r = await window.LYACuentas.api("propuestas", "POST", {texto});
    msg = r.ok ? T("ok") : r.code === 429 ? T("espera") : T("mal");
    if (r.ok) f.texto.value = "";
  } catch (err) { msg = T("mal"); }
  m.innerHTML = msg; b.disabled = false;
});
if (window.LYACuentas) window.LYACuentas.hayServidor().then(ok => { activo = !!ok; if (activo) pintar(); });
window.LYAPropuestas = {html};
})();
