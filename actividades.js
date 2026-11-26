/* Actividades creadas (concursos, vídeos con preguntas y, más adelante, doblajes): piezas que comparten
   concursos/, videos/, avisos.js (Deberes del alumno) y panel-admin.js («Actividades creadas» del profe).
   - formDeber(caja, act): formulario «Mandar como deberes» (clase, fecha, en casa / en clase en directo, nota) → /api/admin deber_crear
   - selectorClase(id): <select> «Avisar a la clase» para abrir la sala en directo y que los alumnos entren solos
   - marcar(id, aciertos, total): guarda el resultado en S.g.ac[id] = {n, best, bp, last} (así el profe ve quién lo ha hecho)
   - entrar(sala): el alumno entra solo en la sala que ha abierto su profe (código, con su usuario como nombre)
   act = {id, tipo: "quiz" | "video" | "doblaje", titulo} */
(() => {
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const C = () => window.LYACuentas;
const esProfe = () => !!(C() && C().usuario && ["profe", "admin"].includes(C().rol));
let cache = null;
/* las clases del profe (api/canciones ya las da y no gasta otra función de Vercel) */
const clases = () => cache ||= (esProfe() ? C().api("canciones").then(r => r.ok ? r.j.clases || [] : []).catch(() => []) : Promise.resolve([]));
const hoyMas = n => { const d = new Date(Date.now() + n * 864e5); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const ICONO = {quiz: "🏆", video: "📺", doblaje: "🎬", cancion: "🎵"};
/* idioma: el del curso (S.learn). Los textos van en español y t() los traduce */
const LG = () => { try { const l = window.LYA && window.LYA.S && window.LYA.S.learn; return l === "en" || l === "ca" ? l : "es"; } catch (e) { return "es"; } };
const TR = {
  en: {"📚 Para mandarlo como deberes, primero guárdalo en tu cuenta (entra y pulsa «Guardar»).": "📚 To set it as homework, first save it to your account (sign in and tap “Save”).", "📚 Para mandarlo como deberes, primero crea una clase en tu Panel del profe.": "📚 To set it as homework, first create a class in your Teacher panel.",
    "📚 Mandar como deberes": "📚 Set as homework", "Para": "For", "Todos los alumnos": "All students", "Todas mis clases": "All my classes", "Fecha límite": "Due date", "Cómo": "How", "🏠 Cada uno en casa": "🏠 Each at home", "🔴 En clase, en directo": "🔴 In class, live", "(entran solos cuando abras la sala)": "(they join on their own when you open the room)",
    "Nota (opcional)": "Note (optional)", "Por ejemplo: fíjate en los números": "For example: pay attention to the numbers", "📚 Mandar": "📚 Send",
    "✓ Mandado. Cuando quieras jugarlo, pulsa «En directo» y elige la clase: tus alumnos entrarán solos desde «Deberes».": "✓ Sent. When you want to play it, tap “Live” and choose the class: your students will join on their own from “Homework”.", "✓ Mandado. Tus alumnos lo verán en «Deberes».": "✓ Sent. Your students will see it in “Homework”.",
    "Primero crea una clase.": "Create a class first.", "Esta actividad ya no existe.": "This activity no longer exists.", "Esa clase no es tuya.": "That class is not yours.", "No se ha podido mandar. Prueba otra vez.": "It could not be sent. Try again.",
    "🔔 Avisar a la clase": "🔔 Notify the class", "Ninguna (darán el código)": "None (they will enter the code)", "Los alumnos de esa clase que tengan abierta la web entran solos desde «Deberes».": "Students in that class who have the site open join on their own from “Homework”."},
  ca: {"📚 Para mandarlo como deberes, primero guárdalo en tu cuenta (entra y pulsa «Guardar»).": "📚 Per enviar-ho com a deures, primer desa-ho al teu compte (entra i prem «Desar»).", "📚 Para mandarlo como deberes, primero crea una clase en tu Panel del profe.": "📚 Per enviar-ho com a deures, primer crea una classe al teu Tauler del profe.",
    "📚 Mandar como deberes": "📚 Enviar com a deures", "Para": "Per a", "Todos los alumnos": "Tots els alumnes", "Todas mis clases": "Totes les meves classes", "Fecha límite": "Data límit", "Cómo": "Com", "🏠 Cada uno en casa": "🏠 Cadascú a casa", "🔴 En clase, en directo": "🔴 A classe, en directe", "(entran solos cuando abras la sala)": "(entren sols quan obris la sala)",
    "Nota (opcional)": "Nota (opcional)", "Por ejemplo: fíjate en los números": "Per exemple: fixa't en els números", "📚 Mandar": "📚 Enviar",
    "✓ Mandado. Cuando quieras jugarlo, pulsa «En directo» y elige la clase: tus alumnos entrarán solos desde «Deberes».": "✓ Enviat. Quan vulguis jugar-hi, prem «En directe» i tria la classe: els teus alumnes entraran sols des de «Deures».", "✓ Mandado. Tus alumnos lo verán en «Deberes».": "✓ Enviat. Els teus alumnes ho veuran a «Deures».",
    "Primero crea una clase.": "Primer crea una classe.", "Esta actividad ya no existe.": "Aquesta activitat ja no existeix.", "Esa clase no es tuya.": "Aquesta classe no és teva.", "No se ha podido mandar. Prueba otra vez.": "No s'ha pogut enviar. Torna-ho a provar.",
    "🔔 Avisar a la clase": "🔔 Avisar la classe", "Ninguna (darán el código)": "Cap (posaran el codi)", "Los alumnos de esa clase que tengan abierta la web entran solos desde «Deberes».": "Els alumnes d'aquesta classe que tinguin el web obert entren sols des de «Deures»."}
};
const t = s => (TR[LG()] || {})[s] ?? s;

async function formDeber(caja, act) {
  if (!caja) return;
  if (!esProfe()) { caja.innerHTML = ""; return; }
  if (String(act.id).startsWith("l")) { caja.innerHTML = `<p class="ac-nota">${t("📚 Para mandarlo como deberes, primero guárdalo en tu cuenta (entra y pulsa «Guardar»).")}</p>`; return; }
  const cs = await clases();
  if (!cs.length && C().rol !== "admin") { caja.innerHTML = `<p class="ac-nota">${t("📚 Para mandarlo como deberes, primero crea una clase en tu Panel del profe.")}</p>`; return; }
  caja.innerHTML = `<details class="ac-deber"><summary>${t("📚 Mandar como deberes")}</summary>
    <form class="ac-form">
      <label>${t("Para")}<select name="grupo">${C().rol === "admin" ? `<option value="">${t("Todos los alumnos")}</option>` : cs.length > 1 ? `<option value="">${t("Todas mis clases")}</option>` : ""}${cs.map(c => `<option value="${esc(c.id)}">${esc(c.nombre)}</option>`).join("")}</select></label>
      <label>${t("Fecha límite")}<input type="date" name="limite" required value="${hoyMas(7)}"></label>
      <fieldset class="ac-como"><legend>${t("Cómo")}</legend>
        <label><input type="radio" name="directo" value="" checked> ${t("🏠 Cada uno en casa")}</label>
        <label><input type="radio" name="directo" value="1"> ${t("🔴 En clase, en directo")} <small>${t("(entran solos cuando abras la sala)")}</small></label></fieldset>
      <label class="ac-ancho">${t("Nota (opcional)")}<input name="nota" maxlength="200" placeholder="${t("Por ejemplo: fíjate en los números")}"></label>
      <button class="btn main">${t("📚 Mandar")}</button> <span class="ac-ok" role="status"></span>
    </form></details>`;
  const f = caja.querySelector("form");
  f.onsubmit = async e => {
    e.preventDefault();
    const b = f.querySelector("button"), ok = f.querySelector(".ac-ok"); b.disabled = true; ok.textContent = "";
    const r = await C().api("admin", "POST", {accion: "deber_crear", actividad: act.id, tipo: act.tipo, titulo: act.titulo, grupo: f.grupo.value, limite: f.limite.value, directo: !!f.directo.value, nota: f.nota.value}).catch(() => ({ok: false, j: {}}));
    b.disabled = false;
    ok.textContent = r.ok ? t(f.directo.value ? "✓ Mandado. Cuando quieras jugarlo, pulsa «En directo» y elige la clase: tus alumnos entrarán solos desde «Deberes»." : "✓ Mandado. Tus alumnos lo verán en «Deberes».")
      : t({sin_clases: "Primero crea una clase.", no_existe: "Esta actividad ya no existe.", no_es_tu_clase: "Esa clase no es tuya."}[r.j && r.j.error] || "No se ha podido mandar. Prueba otra vez.");
  };
}

/* «Avisar a la clase»: al abrir la sala, los alumnos de esa clase la ven en «Deberes» y entran solos */
const PREF = "lyaAcGrupo";
async function selectorClase(caja, id) {
  if (!caja) return;
  if (!esProfe()) { caja.innerHTML = ""; return; }
  const cs = await clases(); if (!cs.length) { caja.innerHTML = ""; return; }
  let pre = ""; try { const p = JSON.parse(sessionStorage.getItem(PREF) || "null"); if (p && (!p.id || p.id === id)) pre = p.grupo || ""; } catch (e) {}
  if (!pre && cs.length === 1) pre = cs[0].id;
  caja.innerHTML = `<label class="ac-clase">${t("🔔 Avisar a la clase")} <select id="ac-grupo"><option value="">${t("Ninguna (darán el código)")}</option>${cs.map(c => `<option value="${esc(c.id)}"${c.id === pre ? " selected" : ""}>${esc(c.nombre)}</option>`).join("")}</select></label>
    <p class="ac-nota">${t("Los alumnos de esa clase que tengan abierta la web entran solos desde «Deberes».")}</p>`;
}
const grupoElegido = () => { const s = document.getElementById("ac-grupo"); return s ? s.value : ""; };
const preparar = (id, grupo) => { try { sessionStorage.setItem(PREF, JSON.stringify({id, grupo})); } catch (e) {} };

/* resultado del alumno (S.g.ac) */
function marcar(id, aciertos, total) {
  if (!id) return;
  try {
    const S = window.LYA.get().S; S.g = S.g || {}; S.g.ac = S.g.ac || {};
    const pct = total ? Math.round(100 * aciertos / total) : 100, est = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
    const o = S.g.ac[id] || {n: 0, best: 0, bp: 0};
    o.n++; o.best = Math.max(o.best, est); o.bp = Math.max(o.bp, pct); o.last = Date.now();
    S.g.ac[id] = o; window.LYA.save();
  } catch (e) {}
}

/* entrar solo en la sala del profe */
const JKEY = "lyaCcJug";
const jget = () => { try { return JSON.parse(localStorage.getItem(JKEY)) || {}; } catch (e) { return {}; } };
async function entrar(sala) {
  if (!sala || !/^\d{6}$/.test(sala.codigo || "")) return false;
  const ruta = (sala.tipo === "video" ? "vjugar-" : "jugar-") + sala.codigo;
  const js = jget();
  if (!js[sala.codigo]) {
    const nombre = String((C() && C().usuario) || "").slice(0, 16);
    const r = await C().api("concursos", "POST", {accion: "entrar", codigo: sala.codigo, nombre}).catch(() => null);
    if (!r || !r.ok) { location.hash = ruta; return false; }  /* que escriba su nombre a mano */
    js[sala.codigo] = {pid: r.j.pid, nombre: r.j.nombre, f: Date.now()};
    for (const k in js) if (Date.now() - (js[k].f || 0) > 864e5) delete js[k];
    try { localStorage.setItem(JKEY, JSON.stringify(js)); } catch (e) {}
  }
  location.hash = ruta;
  return true;
}

window.LYAActividades = {esProfe, clases, formDeber, selectorClase, grupoElegido, preparar, marcar, entrar, ICONO, esc, t};
})();
