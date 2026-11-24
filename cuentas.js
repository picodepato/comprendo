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
    servidor = true;
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
      ${crear ? `<label>Repite la contraseña<input name="clave2" type="password" autocomplete="new-password" required maxlength="100"></label>` : ""}
      ${hay ? `<label class="ctak"><input type="checkbox" name="llevar" checked> ${crear ? "Llevar a la cuenta el progreso de este dispositivo" : "Si la cuenta está vacía, usar el progreso de este dispositivo"}</label>` : ""}
      <p class="ctam" id="ctam" role="alert"></p>
      <button class="btn main" type="submit">${crear ? "Crear cuenta" : "Entrar"}</button>
    </form>
    <p class="ctas">${crear ? `¿Ya tienes cuenta? <button type="button" class="ctal" id="ctac">Entrar</button>` : `¿No tienes cuenta? <button type="button" class="ctal" id="ctac">Crear una</button>`}</p>
    <p class="ctas"><button type="button" class="ctal" id="ctab2">Copia de mi progreso (exportar / importar)</button> · <button type="button" class="ctal" data-cerrar>Seguir como invitado</button></p>`);
  $d("#ctac").onclick = () => panelEntrar(crear ? "entrar" : "crear");
  $d("#ctab2").onclick = panelCopia;
  $d("#ctaf").onsubmit = async e => {
    e.preventDefault();
    const f = e.target, m = $d("#ctam"), b = f.querySelector("[type=submit]");
    const usuario = f.usuario.value.trim().toLowerCase(), clave = f.clave.value, llevar = f.llevar ? f.llevar.checked : false;
    if (crear && clave !== f.clave2.value) { m.textContent = "Las contraseñas no coinciden."; return; }
    b.disabled = true; m.textContent = "Un momento…";
    try {
      const r = await api(crear ? "registro" : "entrar", "POST", {usuario, clave, ...(crear && llevar ? {progreso: copiaLocal()} : {})});
      if (!r.ok) { m.textContent = MSG[r.j.error] || r.j.error || "No se ha podido. Inténtalo otra vez."; b.disabled = false; return; }
      C = {usuario: r.j.usuario, token: r.j.token, pend: false};
      const g = await api("progreso");
      const id = pid(C.usuario); P.list = P.list.filter(x => x.id !== id);
      let s = g.ok && g.j.s ? g.j.s : null;
      if (!s) { s = llevar ? copiaLocal() : undefined; if (s) C.pend = true; }
      P.list.push({id, name: C.usuario, s: s || nuevo()}); P.cur = id;
      escribir(C); guardarP();
      if (C.pend) await subir();
      location.reload();
    } catch (err) { m.textContent = "No hay conexión con el servidor."; b.disabled = false; }
  };
}
/* perfil vacío: index.html rellena lo que falte (fix/fixG) */
const nuevo = () => ({learn: "es", know: "en", level: "A1", read: "bear-a1", a: {}, dict: [], dir: "learn", say: false, view: "home"});

function panelCuenta() {
  const t = estado === "offline" ? "⚠ Sin conexión: tus cambios se guardan en este dispositivo y se subirán cuando vuelva internet."
    : estado === "error" ? "⚠ El último guardado falló. Se intentará de nuevo." : estado === "sesion" ? "⚠ Tu sesión ha caducado. Sal y vuelve a entrar." : "✓ Tu progreso se guarda en tu cuenta automáticamente.";
  const adm = C.usuario === "admin";
  ventana(`<h2>👤 ${esc(C.usuario)}</h2>${adm ? `<p><button class="btn main" type="button" id="ctaadm">🛠 Panel de administración</button></p>` : ""}<p class="ctas">${t}</p>
    <p><button class="btn" type="button" id="ctag">Guardar ahora</button> <button class="btn" type="button" id="ctab2">Copia de mi progreso</button></p>
    <p><button class="btn" type="button" id="ctas">Salir de la cuenta</button></p>
    <p class="ctas">Al salir, este dispositivo vuelve al modo invitado. Tu progreso sigue en la cuenta.</p>`);
  if (adm) $d("#ctaadm").onclick = () => panelAdmin("propuestas");
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

/* ---------- administrador: propuestas, usuarios y votos ---------- */
const fecha = t => t ? new Date(t).toLocaleString("es-ES", {day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"}) : "—";
async function panelAdmin(tab) {
  ventana(`<h2>🛠 Administración</h2><p class="ctas">Cargando…</p>`); dlg.classList.add("ancha");
  let r; try { r = await api("admin"); } catch (e) { r = {ok: false, j: {}}; }
  if (!r.ok) { ventana(`<h2>🛠 Administración</h2><p class="ctam">${r.code === 403 ? "Tu sesión de administrador ha caducado. Sal y vuelve a entrar." : "No se ha podido cargar."}</p>`); return; }
  const {propuestas, usuarios, votos, claveAdminPorDefecto} = r.j;
  const tabs = [["propuestas", `💡 Propuestas (${propuestas.length})`], ["usuarios", `👥 Usuarios (${usuarios.length})`], ["votos", "🗳 Votos"]];
  let cuerpoHTML = "";
  if (tab === "propuestas") cuerpoHTML = propuestas.length ? `<ul class="ctali">${propuestas.map(p => `<li><p>${esc(p.texto)}</p><small>${p.usuario ? "👤 " + esc(p.usuario) : "Invitado"} · ${fecha(p.t)}</small> <button type="button" class="ctal" data-borrar="${esc(p.id)}">Borrar</button></li>`).join("")}</ul>` : `<p class="ctas">Todavía no hay propuestas.</p>`;
  if (tab === "usuarios") cuerpoHTML = usuarios.length ? `<div class="ctatb"><table><thead><tr><th>Usuario</th><th>XP</th><th>Racha</th><th>Lecturas</th><th>Cromos</th><th>Medallas</th><th>Palabras</th><th>Último guardado</th><th>Alta</th></tr></thead><tbody>${usuarios.sort((a, b) => b.ultimo - a.ultimo).map(u => `<tr><td><b>${esc(u.usuario)}</b></td><td>${u.xp}</td><td>${u.racha} (mejor ${u.mejorRacha})</td><td>${u.lecturas}</td><td>${u.cromos}</td><td>${u.medallas}</td><td>${u.palabras}</td><td>${fecha(u.ultimo)}</td><td>${fecha(u.creado)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="ctas">Todavía no hay usuarios.</p>`;
  if (tab === "votos") { const v = Object.entries(votos).sort((a, b) => b[1] - a[1]); cuerpoHTML = v.length ? `<ul class="ctali">${v.map(([k, n]) => `<li><p><b>${esc(k)}</b>: ${n} ${n === 1 ? "voto" : "votos"}</p></li>`).join("")}</ul>` : `<p class="ctas">Todavía no hay votos.</p>`; }
  ventana(`<h2>🛠 Administración</h2>
    ${claveAdminPorDefecto ? `<p class="ctam">⚠ La contraseña de admin sigue siendo «admin». Cámbiala en Vercel → Settings → Environment Variables → ADMIN_CLAVE.</p>` : ""}
    <div class="ctatabs" role="tablist">${tabs.map(([k, n]) => `<button type="button" class="btn${k === tab ? " main" : ""}" data-tab="${k}" role="tab" aria-selected="${k === tab}">${n}</button>`).join("")}</div>
    ${cuerpoHTML}`);
  dlg.classList.add("ancha");
  dlg.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => panelAdmin(b.dataset.tab));
  dlg.querySelectorAll("[data-borrar]").forEach(b => b.onclick = async () => {
    if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = "¿Seguro? Pulsa otra vez"; return; }
    b.disabled = true; await api("propuestas", "DELETE", {id: b.dataset.borrar}); panelAdmin("propuestas");
  });
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

window.LYACuentas = {preparar, cambio, boton, abrir, subir, api, hayServidor, get usuario() { return C && C.usuario; }};
})();
