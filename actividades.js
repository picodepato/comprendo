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

async function formDeber(caja, act) {
  if (!caja) return;
  if (!esProfe()) { caja.innerHTML = ""; return; }
  if (String(act.id).startsWith("l")) { caja.innerHTML = `<p class="ac-nota">📚 Para mandarlo como deberes, primero guárdalo en tu cuenta (entra y pulsa «Guardar»).</p>`; return; }
  const cs = await clases();
  if (!cs.length && C().rol !== "admin") { caja.innerHTML = `<p class="ac-nota">📚 Para mandarlo como deberes, primero crea una clase en tu Panel del profe.</p>`; return; }
  caja.innerHTML = `<details class="ac-deber"><summary>📚 Mandar como deberes</summary>
    <form class="ac-form">
      <label>Para<select name="grupo">${C().rol === "admin" ? `<option value="">Todos los alumnos</option>` : cs.length > 1 ? `<option value="">Todas mis clases</option>` : ""}${cs.map(c => `<option value="${esc(c.id)}">${esc(c.nombre)}</option>`).join("")}</select></label>
      <label>Fecha límite<input type="date" name="limite" required value="${hoyMas(7)}"></label>
      <fieldset class="ac-como"><legend>Cómo</legend>
        <label><input type="radio" name="directo" value="" checked> 🏠 Cada uno en casa</label>
        <label><input type="radio" name="directo" value="1"> 🔴 En clase, en directo <small>(entran solos cuando abras la sala)</small></label></fieldset>
      <label class="ac-ancho">Nota (opcional)<input name="nota" maxlength="200" placeholder="Por ejemplo: fíjate en los números"></label>
      <button class="btn main">📚 Mandar</button> <span class="ac-ok" role="status"></span>
    </form></details>`;
  const f = caja.querySelector("form");
  f.onsubmit = async e => {
    e.preventDefault();
    const b = f.querySelector("button"), ok = f.querySelector(".ac-ok"); b.disabled = true; ok.textContent = "";
    const r = await C().api("admin", "POST", {accion: "deber_crear", actividad: act.id, tipo: act.tipo, titulo: act.titulo, grupo: f.grupo.value, limite: f.limite.value, directo: !!f.directo.value, nota: f.nota.value}).catch(() => ({ok: false, j: {}}));
    b.disabled = false;
    ok.textContent = r.ok ? (f.directo.value ? "✓ Mandado. Cuando quieras jugarlo, pulsa «En directo» y elige la clase: tus alumnos entrarán solos desde «Deberes»." : "✓ Mandado. Tus alumnos lo verán en «Deberes».")
      : ({sin_clases: "Primero crea una clase.", no_existe: "Esta actividad ya no existe.", no_es_tu_clase: "Esa clase no es tuya."}[r.j && r.j.error] || "No se ha podido mandar. Prueba otra vez.");
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
  caja.innerHTML = `<label class="ac-clase">🔔 Avisar a la clase <select id="ac-grupo"><option value="">Ninguna (darán el código)</option>${cs.map(c => `<option value="${esc(c.id)}"${c.id === pre ? " selected" : ""}>${esc(c.nombre)}</option>`).join("")}</select></label>
    <p class="ac-nota">Los alumnos de esa clase que tengan abierta la web entran solos desde «Deberes».</p>`;
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

window.LYAActividades = {esProfe, clases, formDeber, selectorClase, grupoElegido, preparar, marcar, entrar, ICONO, esc};
})();
