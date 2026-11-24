/* Cuentas de usuario (usuario + contraseña) y copia del progreso.
   - Con servidor (Vercel + /api): el progreso de cada cuenta se guarda en la nube.
   - Sin servidor (por ejemplo, la versión de prueba): solo «Copia de mi progreso» (exportar / importar).
   - Sin cuenta: modo invitado, todo queda en este dispositivo como siempre.
   Lo usa index.html: LYACuentas.preparar(P, guardarP) al arrancar, LYACuentas.cambio(S) al guardar. */
(() => {
const CKEY = "lyaCuenta"; /* {usuario, token, pend} */
const leer = () => { try { return JSON.parse(localStorage.getItem(CKEY) || "null"); } catch (e) { return null; } };
const escribir = v => { try { v ? localStorage.setItem(CKEY, JSON.stringify(v)) : localStorage.removeItem(CKEY); } catch (e) {} };
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));

let P = null, guardarP = () => {}, C = leer(), servidor = null, estado = "", timer = null, enviando = null;
const pid = u => "u:" + u;
const perfil = () => P && P.list.find(p => p.id === P.cur);

async function api(ruta, metodo = "GET", datos, extra = {}) {
  const h = {"Content-Type": "application/json"};
  if (C && C.token) h.Authorization = "Bearer " + C.token;
  const r = await fetch("api/" + ruta, {method: metodo, headers: h, body: datos === undefined ? undefined : JSON.stringify(datos), ...extra});
  let j = {}; try { j = await r.json(); } catch (e) {}
  return {ok: r.ok, code: r.status, j};
}
async function hayServidor() {
  if (servidor !== null) return servidor;
  try { const r = await api("estado"); servidor = r.ok && r.j.ok === true; } catch (e) { servidor = false; }
  return servidor;
}

/* ---------- al arrancar: elige el perfil (cuenta o invitado) ---------- */
async function preparar(p, g) {
  P = p; guardarP = g || guardarP;
  if (!C || !C.token) return;
  const id = pid(C.usuario);
  let r = null; try { r = await api("progreso"); } catch (e) {}
  if (r && r.code === 401) { /* sesión caducada: vuelve a invitado */
    P.list = P.list.filter(x => x.id !== id); P.cur = "local"; C = null; escribir(null); guardarP(); return;
  }
  let pr = P.list.find(x => x.id === id);
  if (r && r.ok) {
    servidor = true; if (r.j.rol && C.rol !== r.j.rol) { C.rol = r.j.rol; escribir(C); }
    if (r.j.s && !(C.pend && pr)) { if (pr) pr.s = r.j.s; else P.list.push(pr = {id, name: C.usuario, s: r.j.s}); }
    else if (!pr) P.list.push(pr = {id, name: C.usuario, s: copiaLocal()});
    if (C.pend || !r.j.s) setTimeout(subir, 500);
  } else if (!pr) { /* sin conexión y sin copia: invitado por ahora */ P.cur = "local"; guardarP(); estado = "offline"; return; }
  else estado = "offline";
  P.cur = id; guardarP();
}
const copiaLocal = () => { const l = P.list.find(x => x.id === "local"); return l && l.s ? JSON.parse(JSON.stringify(l.s)) : undefined; };

/* ---------- guardar en la nube (con espera de 2 s para juntar cambios) ---------- */
function cambio() {
  if (!C || !C.token) return;
  if (!C.pend) { C.pend = true; escribir(C); }
  clearTimeout(timer); timer = setTimeout(subir, 2000);
}
async function subir(final) {
  const p = perfil(); if (!C || !C.token || !p || p.id !== pid(C.usuario)) return;
  clearTimeout(timer);
  if (enviando && !final) { timer = setTimeout(subir, 1500); return; }
  const marca = JSON.stringify(p.s);
  enviando = api("progreso", "PUT", {s: p.s}, final && marca.length < 60000 ? {keepalive: true} : {}).then(r => {
    if (r.ok) { if (JSON.stringify(p.s) === marca) { C.pend = false; escribir(C); } estado = "ok"; }
    else if (r.code === 401) { estado = "sesion"; }
    else estado = "error";
  }).catch(() => { estado = "offline"; }).finally(() => { enviando = null; pintar(); });
  return enviando;
}
addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && C && C.pend) subir(true); });
addEventListener("pagehide", () => { if (C && C.pend) subir(true); });
addEventListener("online", () => { if (C && C.pend) subir(); });

/* ---------- botón de la barra superior ---------- */
function boton() {
  if (document.getElementById("cta")) return pintar();
  const top = document.querySelector("header.top"); if (!top) return;
  const b = document.createElement("button");
  b.type = "button"; b.id = "cta"; b.className = "cta"; b.onclick = abrir;
  top.appendChild(b); pintar();
  hayServidor().then(pintar);
}
function pintar() {
  const b = document.getElementById("cta"); if (!b) return;
  if (C && C.token) {
    const aviso = estado === "offline" || estado === "error" ? " ⚠" : "";
    b.innerHTML = `<span aria-hidden="true">👤</span> <span class="ctan">${esc(C.usuario)}</span>${aviso}`;
    b.title = estado === "offline" ? "Sin conexión: se guardará cuando vuelva internet" : estado === "error" ? "No se ha podido guardar. Se intentará de nuevo." : "Mi cuenta · My account";
  } else if (servidor) { b.innerHTML = `<span aria-hidden="true">👤</span> <span class="ctan">Entrar</span>`; b.title = "Entrar o crear cuenta · Sign in"; }
  else { b.innerHTML = `<span aria-hidden="true">💾</span>`; b.title = "Copia de mi progreso · Backup"; b.setAttribute("aria-label", "Copia de mi progreso"); }
}

/* ---------- ventana ---------- */
let dlg = null;
function ventana(html) {
  if (!dlg) {
    dlg = document.createElement("div"); dlg.className = "ctaw"; dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true");
    dlg.addEventListener("click", e => { if (e.target === dlg || e.target.closest("[data-cerrar]")) cerrar(); });
    addEventListener("keydown", e => { if (e.key === "Escape" && dlg.classList.contains("on")) cerrar(); });
    document.body.appendChild(dlg);
  }
  dlg.classList.remove("ancha");
  dlg.innerHTML = `<div class="ctab"><button type="button" class="ctax" data-cerrar aria-label="Cerrar">✕</button>${html}</div>`;
  dlg.classList.add("on");
  const f = dlg.querySelector("input,button:not(.ctax)"); if (f) f.focus();
}
const cerrar = () => dlg && dlg.classList.remove("on", "ancha");
const $d = s => dlg.querySelector(s);
const MSG = {
  usuario_no_valido: "El usuario debe tener de 3 a 20 letras o números (sin espacios).",
  clave_corta: "La contraseña debe tener al menos 6 caracteres.",
  usuario_ocupado: "Ese usuario ya existe. Elige otro o entra con él.",
  datos_mal: "Usuario o contraseña incorrectos.",
  espera: "Demasiados intentos. Espera unos minutos.",
  codigo_no_existe: "No hay ninguna clase con ese código. Pregúntaselo a tu profe.",
};

async function abrir() {
  await hayServidor();
  if (C && C.token) return panelCuenta();
  if (servidor) return panelEntrar("entrar");
  panelCopia();
}

function panelEntrar(modo) {
  const crear = modo === "crear", hay = !!copiaLocal();
  ventana(`<h2>${crear ? "Crear cuenta" : "Entrar"} <span class="ctae">· ${crear ? "Create account" : "Sign in"}</span></h2>
    <p class="ctas">${crear ? "Con una cuenta tu progreso (puntos, racha, cromos, medallas, diccionario y lecturas) se guarda y lo puedes seguir en cualquier dispositivo." : "Entra para seguir con tu progreso guardado."}</p>
    <form id="ctaf" autocomplete="on">
      <label><span>Usuario <span class="ctae">· Username</span></span><input name="usuario" autocomplete="username" autocapitalize="none" spellcheck="false" required minlength="3" maxlength="20"></label>
      <label><span>Contraseña <span class="ctae">· Password</span></span><input name="clave" type="password" autocomplete="${crear ? "new-password" : "current-password"}" required minlength="${crear ? 6 : 1}" maxlength="100"></label>
      ${crear ? `<label>Repite la contraseña<input name="clave2" type="password" autocomplete="new-password" required maxlength="100"></label>
      <fieldset class="ctafs"><legend>Quiero aprender <span class="ctae">· I want to learn</span></legend>${cursos().map((c, i) => `<label class="ctak"><input type="radio" name="curso" value="${c.learn}>${c.know}"${i === 0 ? " checked" : ""}> ${esc(c.txt)}</label>`).join("")}</fieldset>
      <fieldset class="ctafs"><legend>Soy <span class="ctae">· I am</span></legend><label class="ctak"><input type="radio" name="rol" value="alumno" checked> 🎒 Alumno <span class="ctae">· Student</span></label><label class="ctak"><input type="radio" name="rol" value="profe"> 🧑‍🏫 Profe <span class="ctae">· Teacher</span></label></fieldset>
      <label id="ctacod"><span>Código de clase <span class="ctae">· Class code (opcional)</span></span><input name="codigo" autocapitalize="none" spellcheck="false" maxlength="20" placeholder="Te lo da tu profe"></label>
      <p class="ctas" id="ctaprof" hidden>Como profe podrás crear tus clases con un código, mandar lecturas y ver el progreso de tus alumnos.</p>` : ""}
      ${hay ? `<label class="ctak"><input type="checkbox" name="llevar" checked> ${crear ? "Llevar a la cuenta el progreso de este dispositivo" : "Si la cuenta está vacía, usar el progreso de este dispositivo"}</label>` : ""}
      <p class="ctam" id="ctam" role="alert"></p>
      <button class="btn main" type="submit">${crear ? "Crear cuenta" : "Entrar"}</button>
    </form>
    <p class="ctas">${crear ? `¿Ya tienes cuenta? <button type="button" class="ctal" id="ctac">Entrar</button>` : `¿No tienes cuenta? <button type="button" class="ctal" id="ctac">Crear una</button>`}</p>
    <p class="ctas"><button type="button" class="ctal" id="ctab2">Copia de mi progreso (exportar / importar)</button> · <button type="button" class="ctal" data-cerrar>Seguir como invitado</button></p>`);
  $d("#ctac").onclick = () => panelEntrar(crear ? "entrar" : "crear");
  if (crear) dlg.querySelectorAll("[name=rol]").forEach(r => r.onchange = () => { const p = $d("[name=rol]:checked").value === "profe"; $d("#ctacod").hidden = p; $d("#ctaprof").hidden = !p; });
  $d("#ctab2").onclick = panelCopia;
  $d("#ctaf").onsubmit = async e => {
    e.preventDefault();
    const f = e.target, m = $d("#ctam"), b = f.querySelector("[type=submit]");
    const usuario = f.usuario.value.trim().toLowerCase(), clave = f.clave.value, llevar = f.llevar ? f.llevar.checked : false;
    const extra = crear ? {rol: f.rol.value, codigo: f.rol.value === "alumno" ? f.codigo.value.trim() : "", curso: f.curso ? f.curso.value : ""} : {};
    if (crear && clave !== f.clave2.value) { m.textContent = "Las contraseñas no coinciden."; return; }
    b.disabled = true; m.textContent = "Un momento…";
    try {
      const prog = crear ? conCurso(llevar ? copiaLocal() : null, extra.curso) : null;
      const r = await api(crear ? "registro" : "entrar", "POST", {usuario, clave, ...(crear ? {rol: extra.rol, codigo: extra.codigo, progreso: prog} : {})});
      if (!r.ok) { m.textContent = MSG[r.j.error] || r.j.error || "No se ha podido. Inténtalo otra vez."; b.disabled = false; return; }
      C = {usuario: r.j.usuario, token: r.j.token, rol: r.j.rol || "alumno", pend: false};
      const g = await api("progreso");
      const id = pid(C.usuario); P.list = P.list.filter(x => x.id !== id);
      let s = g.ok && g.j.s ? g.j.s : null;
      if (!s) { s = crear ? prog : llevar ? copiaLocal() : undefined; if (s) C.pend = true; }
      P.list.push({id, name: C.usuario, s: s || nuevo()}); P.cur = id;
      escribir(C); guardarP();
      if (C.pend) await subir();
      location.reload();
    } catch (err) { m.textContent = "No hay conexión con el servidor."; b.disabled = false; }
  };
}
/* cursos que ofrece la web (catalogo.json → courses) */
function cursos() {
  const cat = window.LYA && window.LYA.CAT, nm = (c, l) => ((cat && cat.languages[c] || {}).name || {})[l] || c;
  const lista = cat && cat.courses ? cat.courses.filter(c => c.ready).flatMap(c => c.know.map(k => ({learn: c.learn, know: k}))) : [{learn: "es", know: "en"}];
  return lista.map(c => ({...c, txt: `${nm(c.learn, "es")} (${nm(c.learn, c.know)}) · sé ${nm(c.know, "es").toLowerCase()}`}));
}
function conCurso(s, curso) {
  const [learn, know] = String(curso || "").split(">"); if (!learn) return s || undefined;
  s = s || nuevo();
  if (s.learn !== learn) { s.learn = learn; s.know = know; s.view = "home"; s.read = learn === "es" ? "bear-a1" : `${learn}-bear-a1`; }
  else s.know = know;
  return s;
}
/* perfil vacío: index.html rellena lo que falte (fix/fixG) */
const nuevo = () => ({learn: "es", know: "en", level: "A1", read: "bear-a1", a: {}, dict: [], dir: "learn", say: false, view: "home"});

function panelCuenta() {
  const t = estado === "offline" ? "⚠ Sin conexión: tus cambios se guardan en este dispositivo y se subirán cuando vuelva internet."
    : estado === "error" ? "⚠ El último guardado falló. Se intentará de nuevo." : estado === "sesion" ? "⚠ Tu sesión ha caducado. Sal y vuelve a entrar." : "✓ Tu progreso se guarda en tu cuenta automáticamente.";
  const adm = C.usuario === "admin", prof = C.rol === "profe", alu = !adm && !prof;
  ventana(`<h2>👤 ${esc(C.usuario)} ${prof ? '<span class="ctae">· 🧑‍🏫 Profe</span>' : ""}</h2>${adm ? `<p><button class="btn main" type="button" id="ctaadm">🛠 Panel de administración</button></p>` : prof ? `<p><button class="btn main" type="button" id="ctaadm">🧑‍🏫 Panel del profe</button></p>` : ""}
    ${alu ? `<div class="ctacl" id="ctacl"><p class="ctas">Cargando tu clase…</p></div>` : ""}<p class="ctas">${t}</p>
    <p><button class="btn" type="button" id="ctag">Guardar ahora</button> <button class="btn" type="button" id="ctab2">Copia de mi progreso</button></p>
    <p><button class="btn" type="button" id="ctas">Salir de la cuenta</button></p>
    <p class="ctas">Al salir, este dispositivo vuelve al modo invitado. Tu progreso sigue en la cuenta.</p>`);
  if (adm || prof) $d("#ctaadm").onclick = () => panelAdmin(adm ? "propuestas" : "usuarios");
  if (alu) miClase();
  $d("#ctag").onclick = async () => { $d("#ctag").disabled = true; await subir(); panelCuenta(); };
  $d("#ctab2").onclick = panelCopia;
  $d("#ctas").onclick = async () => {
    $d("#ctas").disabled = true;
    if (C.pend) await subir();
    try { await api("salir", "POST", {}); } catch (e) {}
    const id = pid(C.usuario); P.list = P.list.filter(x => x.id !== id);
    if (!P.list.some(x => x.id === "local")) P.list.push({id: "local", name: "", s: nuevo()});
    P.cur = "local"; C = null; escribir(null); guardarP(); location.reload();
  };
}

/* ---------- alumno: unirse a una clase con el código del profe ---------- */
async function miClase(aviso = "") {
  let cl = null; try { const r = await api("avisos"); if (r.ok) cl = r.j.clase; } catch (e) {}
  const el = dlg && dlg.querySelector("#ctacl"); if (!el) return;
  el.innerHTML = `<p><b>🏫 Mi clase:</b> ${cl ? `${esc(cl.nombre)}${cl.profe ? ` <span class="ctae">(profe: ${esc(cl.profe)})</span>` : ""}` : "ninguna todavía"}</p>
    <form id="ctaclf" class="ctaclf"><input name="codigo" autocapitalize="none" spellcheck="false" maxlength="20" required placeholder="Código de clase" aria-label="Código de clase"><button class="btn" type="submit">${cl ? "Cambiar de clase" : "Unirme a la clase"}</button>${cl ? ` <button class="ctal" type="button" id="ctaclx">Salir de la clase</button>` : ""}</form>
    <p class="ctam" role="status">${aviso}</p>`;
  el.querySelector("#ctaclf").onsubmit = async e => {
    e.preventDefault(); const b = e.target.querySelector("button"); b.disabled = true;
    const r = await api("avisos", "POST", {codigo: e.target.codigo.value.trim()}).catch(() => ({ok: false, j: {}}));
    if (r.ok) { miClase(`✓ Ya estás en la clase ${esc(r.j.clase.nombre)}.`); if (window.LYAAvisos) window.LYAAvisos.cargar(); }
    else { el.querySelector(".ctam").textContent = MSG[r.j.error] || "No se ha podido."; b.disabled = false; }
  };
  const x = el.querySelector("#ctaclx"); if (x) x.onclick = async () => { await api("avisos", "POST", {salirClase: true}).catch(() => {}); miClase("Has salido de la clase."); if (window.LYAAvisos) window.LYAAvisos.cargar(); };
}

/* ---------- administrador: el panel está en panel-admin.js y se carga solo cuando el admin lo abre ---------- */
let cargaAdmin = null;
function panelAdmin(tab) {
  cargaAdmin ||= new Promise((ok, mal) => { const sc = document.createElement("script"); sc.src = "panel-admin.js"; sc.onload = ok; sc.onerror = mal; document.head.appendChild(sc); });
  cargaAdmin.then(() => window.LYAPanelAdmin.abrir(tab)).catch(() => { cargaAdmin = null; ventana(`<h2>🛠 Administración</h2><p class="ctam">No se ha podido cargar el panel.</p>`); });
}

/* ---------- copia del progreso: sirve para pasar el progreso de la web antigua a la nueva ---------- */
function panelCopia() {
  const p = perfil(), texto = p ? JSON.stringify({app: "lee-y-aprende", v: 1, fecha: new Date().toISOString(), s: p.s}) : "";
  ventana(`<h2>💾 Copia de mi progreso <span class="ctae">· Backup</span></h2>
    <p class="ctas"><b>1. Sacar la copia.</b> Copia este texto (o descárgalo) y guárdalo. Así puedes pasar tu progreso a otra web o a otro dispositivo.</p>
    <textarea id="ctat" readonly rows="3">${esc(texto)}</textarea>
    <p><button class="btn" type="button" id="ctacp">Copiar texto</button> <button class="btn" type="button" id="ctadl">Descargar archivo</button></p>
    <p class="ctas"><b>2. Poner una copia.</b> Pega aquí el texto de una copia (o elige el archivo). <b>Sustituye</b> el progreso que hay ahora${C ? " en tu cuenta" : " en este dispositivo"}.</p>
    <textarea id="ctai" rows="3" placeholder="Pega aquí la copia"></textarea>
    <p><input type="file" id="ctaa" accept=".json,application/json,text/plain"></p>
    <p class="ctam" id="ctam" role="alert"></p>
    <p><button class="btn main" type="button" id="ctaok">Poner esta copia</button></p>`);
  $d("#ctacp").onclick = async () => { const t = $d("#ctat"); t.select(); try { await navigator.clipboard.writeText(t.value); } catch (e) { try { document.execCommand("copy"); } catch (e2) {} } $d("#ctacp").textContent = "✓ Copiado"; };
  $d("#ctadl").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([texto], {type: "application/json"})); a.download = "mi-progreso-lee-y-aprende.json"; document.body.appendChild(a); a.click(); a.remove(); };
  $d("#ctaa").onchange = e => { const f = e.target.files[0]; if (f) f.text().then(t => { $d("#ctai").value = t; }); };
  let seguro = false;
  $d("#ctaok").onclick = async () => {
    const m = $d("#ctam"); let o = null;
    try { o = JSON.parse($d("#ctai").value.trim()); } catch (e) {}
    const s = o && o.s && typeof o.s === "object" ? o.s : o && o.a && o.dict ? o : null; /* también vale un estado suelto */
    if (!s || typeof s.a !== "object") { m.textContent = "Esa copia no es válida."; return; }
    if (!seguro) { seguro = true; m.textContent = "¿Seguro? Se sustituirá el progreso actual. Pulsa otra vez para confirmar."; $d("#ctaok").textContent = "Sí, poner la copia"; return; }
    const pr = perfil(); if (!pr) return;
    pr.s = s; guardarP();
    if (C && C.token) { C.pend = true; escribir(C); await subir(); }
    location.reload();
  };
}

window.LYACuentas = {preparar, cambio, boton, abrir, subir, api, hayServidor, get usuario() { return C && C.usuario; },
  ui: {ventana, cerrar, esc, get dlg() { return dlg; }, $d: s => dlg.querySelector(s)}};
})();
