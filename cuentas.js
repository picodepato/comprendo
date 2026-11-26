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

/* textos: van en el idioma que se aprende y, en A1, con el que ya sabe al lado (como el resto de la web) */
const TX = {
  es: {mi_cuenta: "Mi cuenta", entrar: "Entrar", entrar_o_crear: "Entrar o crear cuenta", copia: "Copia de mi progreso", copia_t: "Copia de mi progreso (exportar / importar)", cerrar: "Cerrar",
    sin_red: "Sin conexión: se guardará cuando vuelva internet", fallo_guardar: "No se ha podido guardar. Se intentará de nuevo.",
    usuario_no_valido: "El usuario debe tener de 3 a 20 letras o números (sin espacios).", clave_corta: "La contraseña debe tener al menos 6 caracteres.", usuario_ocupado: "Ese usuario ya existe. Elige otro o entra con él.", datos_mal: "Usuario o contraseña incorrectos.", espera: "Demasiados intentos. Espera unos minutos.", codigo_no_existe: "No hay ninguna clase con ese código. Pregúntaselo a tu profe.",
    crear: "Crear cuenta", crear_p: "Con una cuenta tu progreso (puntos, racha, cromos, medallas, diccionario y lecturas) se guarda y lo puedes seguir en cualquier dispositivo.", entrar_p: "Entra para seguir con tu progreso guardado.",
    usuario: "Usuario", clave: "Contraseña", clave2: "Repite la contraseña", aprender: "Quiero aprender", soy: "Soy", alumno: "Alumno", profe: "Profe", codigo: "Código de clase (opcional)", codigo_ph: "Te lo da tu profe", codigo_c: "Código de clase",
    profe_p: "Como profe podrás crear tus clases con un código, mandar lecturas y ver el progreso de tus alumnos.", llevar_c: "Llevar a la cuenta el progreso de este dispositivo", llevar_e: "Si la cuenta está vacía, usar el progreso de este dispositivo",
    ya_tienes: "¿Ya tienes cuenta?", no_tienes: "¿No tienes cuenta?", crear_una: "Crear una", invitado: "Seguir como invitado", no_coinciden: "Las contraseñas no coinciden.", momento: "Un momento…", no_se_pudo: "No se ha podido. Inténtalo otra vez.", sin_servidor: "No hay conexión con el servidor.",
    curso: "{a} · sé {b}", e_offline: "⚠ Sin conexión: tus cambios se guardan en este dispositivo y se subirán cuando vuelva internet.", e_error: "⚠ El último guardado falló. Se intentará de nuevo.", e_sesion: "⚠ Tu sesión ha caducado. Sal y vuelve a entrar.", e_ok: "✓ Tu progreso se guarda en tu cuenta automáticamente.",
    panel_admin: "Panel de administración", panel_profe: "Panel del profe", cargando_clase: "Cargando tu clase…", guardar: "Guardar ahora", salir: "Salir de la cuenta", salir_p: "Al salir, este dispositivo vuelve al modo invitado. Tu progreso sigue en la cuenta.",
    mi_clase: "Mi clase", ninguna: "ninguna todavía", cambiar_clase: "Cambiar de clase", unirme: "Unirme a la clase", salir_clase: "Salir de la clase", ya_en_clase: "✓ Ya estás en la clase {c}.", no_pudo: "No se ha podido.", fuera_clase: "Has salido de la clase.",
    admin: "Administración", admin_mal: "No se ha podido cargar el panel.",
    c1: "1. Sacar la copia.", c1_p: "Copia este texto (o descárgalo) y guárdalo. Así puedes pasar tu progreso a otra web o a otro dispositivo.", copiar: "Copiar texto", descargar: "Descargar archivo", c2: "2. Poner una copia.", c2_p: "Pega aquí el texto de una copia (o elige el archivo). Sustituye el progreso que hay ahora en este dispositivo.", c2_pc: "Pega aquí el texto de una copia (o elige el archivo). Sustituye el progreso que hay ahora en tu cuenta.",
    pega: "Pega aquí la copia", poner: "Poner esta copia", copiado: "✓ Copiado", no_valida: "Esa copia no es válida.", seguro: "¿Seguro? Se sustituirá el progreso actual. Pulsa otra vez para confirmar.", si_poner: "Sí, poner la copia"},
  en: {mi_cuenta: "My account", entrar: "Sign in", entrar_o_crear: "Sign in or create an account", copia: "Backup of my progress", copia_t: "Backup of my progress (export / import)", cerrar: "Close",
    sin_red: "Offline: it will be saved when you are back online", fallo_guardar: "Could not save. We will try again.",
    usuario_no_valido: "The username must have 3 to 20 letters or numbers (no spaces).", clave_corta: "The password must have at least 6 characters.", usuario_ocupado: "That username already exists. Choose another one or sign in with it.", datos_mal: "Wrong username or password.", espera: "Too many tries. Wait a few minutes.", codigo_no_existe: "There is no class with that code. Ask your teacher.",
    crear: "Create account", crear_p: "With an account your progress (points, streak, stickers, medals, dictionary and readings) is saved and you can carry on from any device.", entrar_p: "Sign in to carry on with your saved progress.",
    usuario: "Username", clave: "Password", clave2: "Repeat the password", aprender: "I want to learn", soy: "I am", alumno: "Student", profe: "Teacher", codigo: "Class code (optional)", codigo_ph: "Your teacher gives it to you", codigo_c: "Class code",
    profe_p: "As a teacher you can create classes with a code, send readings and see your students' progress.", llevar_c: "Take the progress on this device to the account", llevar_e: "If the account is empty, use the progress on this device",
    ya_tienes: "Already have an account?", no_tienes: "No account yet?", crear_una: "Create one", invitado: "Carry on as a guest", no_coinciden: "The passwords do not match.", momento: "One moment…", no_se_pudo: "It did not work. Try again.", sin_servidor: "No connection to the server.",
    curso: "{a} · I know {b}", e_offline: "⚠ Offline: your changes are saved on this device and will be uploaded when you are back online.", e_error: "⚠ The last save failed. We will try again.", e_sesion: "⚠ Your session has expired. Sign out and sign in again.", e_ok: "✓ Your progress is saved in your account automatically.",
    panel_admin: "Admin panel", panel_profe: "Teacher panel", cargando_clase: "Loading your class…", guardar: "Save now", salir: "Sign out", salir_p: "When you sign out, this device goes back to guest mode. Your progress stays in the account.",
    mi_clase: "My class", ninguna: "none yet", cambiar_clase: "Change class", unirme: "Join the class", salir_clase: "Leave the class", ya_en_clase: "✓ You are now in the class {c}.", no_pudo: "It did not work.", fuera_clase: "You have left the class.",
    admin: "Admin", admin_mal: "The panel could not be loaded.",
    c1: "1. Make a backup.", c1_p: "Copy this text (or download it) and keep it. That way you can move your progress to another website or device.", copiar: "Copy text", descargar: "Download file", c2: "2. Restore a backup.", c2_p: "Paste the text of a backup here (or choose the file). It replaces the progress on this device now.", c2_pc: "Paste the text of a backup here (or choose the file). It replaces the progress in your account now.",
    pega: "Paste the backup here", poner: "Restore this backup", copiado: "✓ Copied", no_valida: "That backup is not valid.", seguro: "Are you sure? Your current progress will be replaced. Press again to confirm.", si_poner: "Yes, restore the backup"},
  ca: {mi_cuenta: "El meu compte", entrar: "Entrar", entrar_o_crear: "Entrar o crear un compte", copia: "Còpia del meu progrés", copia_t: "Còpia del meu progrés (exportar / importar)", cerrar: "Tancar",
    sin_red: "Sense connexió: es desarà quan torni internet", fallo_guardar: "No s'ha pogut desar. Es tornarà a provar.",
    usuario_no_valido: "L'usuari ha de tenir de 3 a 20 lletres o números (sense espais).", clave_corta: "La contrasenya ha de tenir almenys 6 caràcters.", usuario_ocupado: "Aquest usuari ja existeix. Tria'n un altre o entra-hi.", datos_mal: "Usuari o contrasenya incorrectes.", espera: "Massa intents. Espera uns minuts.", codigo_no_existe: "No hi ha cap classe amb aquest codi. Pregunta-ho al teu profe.",
    crear: "Crear un compte", crear_p: "Amb un compte el teu progrés (punts, ratxa, cromos, medalles, diccionari i lectures) es desa i el pots seguir des de qualsevol dispositiu.", entrar_p: "Entra per continuar amb el teu progrés desat.",
    usuario: "Usuari", clave: "Contrasenya", clave2: "Repeteix la contrasenya", aprender: "Vull aprendre", soy: "Soc", alumno: "Alumne", profe: "Profe", codigo: "Codi de classe (opcional)", codigo_ph: "Te'l dona el teu profe", codigo_c: "Codi de classe",
    profe_p: "Com a profe podràs crear les teves classes amb un codi, enviar lectures i veure el progrés dels teus alumnes.", llevar_c: "Portar al compte el progrés d'aquest dispositiu", llevar_e: "Si el compte és buit, fer servir el progrés d'aquest dispositiu",
    ya_tienes: "Ja tens compte?", no_tienes: "No tens compte?", crear_una: "Crea'n un", invitado: "Continuar com a convidat", no_coinciden: "Les contrasenyes no coincideixen.", momento: "Un moment…", no_se_pudo: "No s'ha pogut. Torna-ho a provar.", sin_servidor: "No hi ha connexió amb el servidor.",
    curso: "{a} · sé {b}", e_offline: "⚠ Sense connexió: els canvis es desen en aquest dispositiu i es pujaran quan torni internet.", e_error: "⚠ L'últim desament ha fallat. Es tornarà a provar.", e_sesion: "⚠ La teva sessió ha caducat. Surt i torna a entrar.", e_ok: "✓ El teu progrés es desa al teu compte automàticament.",
    panel_admin: "Tauler d'administració", panel_profe: "Tauler del profe", cargando_clase: "Carregant la teva classe…", guardar: "Desar ara", salir: "Sortir del compte", salir_p: "En sortir, aquest dispositiu torna al mode convidat. El teu progrés continua al compte.",
    mi_clase: "La meva classe", ninguna: "cap encara", cambiar_clase: "Canviar de classe", unirme: "Unir-me a la classe", salir_clase: "Sortir de la classe", ya_en_clase: "✓ Ja ets a la classe {c}.", no_pudo: "No s'ha pogut.", fuera_clase: "Has sortit de la classe.",
    admin: "Administració", admin_mal: "No s'ha pogut carregar el tauler.",
    c1: "1. Fer la còpia.", c1_p: "Copia aquest text (o descarrega'l) i guarda'l. Així pots passar el teu progrés a una altra web o a un altre dispositiu.", copiar: "Copiar el text", descargar: "Descarregar l'arxiu", c2: "2. Posar una còpia.", c2_p: "Enganxa aquí el text d'una còpia (o tria l'arxiu). Substitueix el progrés que hi ha ara en aquest dispositiu.", c2_pc: "Enganxa aquí el text d'una còpia (o tria l'arxiu). Substitueix el progrés que hi ha ara al teu compte.",
    pega: "Enganxa aquí la còpia", poner: "Posar aquesta còpia", copiado: "✓ Copiat", no_valida: "Aquesta còpia no és vàlida.", seguro: "Segur? Se substituirà el progrés actual. Prem una altra vegada per confirmar.", si_poner: "Sí, posar la còpia"}
};
const lgs = () => { try { const L = window.LYA, S = L && L.S, a = S && TX[S.learn] ? S.learn : "es", b = S && TX[S.know] && S.know !== a && L.both && L.both() ? S.know : null; return [a, b]; } catch (e) { return ["es", null]; } };
const s1 = (k, l, v) => { let s = (TX[l] || TX.es)[k] ?? TX.es[k] ?? k; for (const x in v || {}) s = s.split(`{${x}}`).join(v[x]); return s; };
/* X: HTML con la segunda lengua en pequeño · XT: texto plano «a · b» · X1: solo la primera */
const X = (k, v) => { const [a, b] = lgs(), A = s1(k, a, v), B = b ? s1(k, b, v) : A; return esc(A) + (B !== A ? ` <span class="ctae">· ${esc(B)}</span>` : ""); };
const XT = (k, v) => { const [a, b] = lgs(), A = s1(k, a, v), B = b ? s1(k, b, v) : A; return B !== A ? `${A} · ${B}` : A; };
const X1 = (k, v) => s1(k, lgs()[0], v);

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
  try { const r = await api("cuenta?a=estado"); servidor = r.ok && r.j.ok === true; } catch (e) { servidor = false; }
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
    else if (!pr) P.list.push(pr = {id, name: C.usuario, s: copiaLocal() || nuevo()});
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
    b.title = XT(estado === "offline" ? "sin_red" : estado === "error" ? "fallo_guardar" : "mi_cuenta");
  } else if (servidor) { b.innerHTML = `<span aria-hidden="true">👤</span> <span class="ctan">${esc(X1("entrar"))}</span>`; b.title = XT("entrar_o_crear"); }
  else { b.innerHTML = `<span aria-hidden="true">💾</span>`; b.title = XT("copia"); b.setAttribute("aria-label", X1("copia")); }
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
  dlg.innerHTML = `<div class="ctab"><button type="button" class="ctax" data-cerrar aria-label="${esc(X1("cerrar"))}">✕</button>${html}</div>`;
  dlg.classList.add("on");
  const f = dlg.querySelector("input,button:not(.ctax)"); if (f) f.focus();
}
const cerrar = () => dlg && dlg.classList.remove("on", "ancha");
const $d = s => dlg.querySelector(s);
/* errores del servidor: van en TX (mismas claves) */
const MSG = new Proxy({}, {get: (o, k) => typeof k === "string" && k in TX.es ? XT(k) : undefined});

async function abrir() {
  await hayServidor();
  if (C && C.token) return panelCuenta();
  if (servidor) return panelEntrar("entrar");
  panelCopia();
}

function panelEntrar(modo) {
  const crear = modo === "crear", hay = !!copiaLocal();
  ventana(`<h2>${X(crear ? "crear" : "entrar")}</h2>
    <p class="ctas">${X(crear ? "crear_p" : "entrar_p")}</p>
    <form id="ctaf" autocomplete="on">
      <label><span>${X("usuario")}</span><input name="usuario" autocomplete="username" autocapitalize="none" spellcheck="false" required minlength="3" maxlength="20"></label>
      <label><span>${X("clave")}</span><input name="clave" type="password" autocomplete="${crear ? "new-password" : "current-password"}" required minlength="${crear ? 6 : 1}" maxlength="100"></label>
      ${crear ? `<label><span>${X("clave2")}</span><input name="clave2" type="password" autocomplete="new-password" required maxlength="100"></label>
      <fieldset class="ctafs"><legend>${X("aprender")}</legend>${cursos().map((c, i, all) => `<label class="ctak"><input type="radio" name="curso" value="${c.learn}>${c.know}"${(all.some(x => x.learn === window.LYA?.S?.learn) ? c.learn === window.LYA.S.learn && (c.know === window.LYA.S.know || !all.some(x => x.learn === c.learn && x.know === window.LYA.S.know)) : i === 0) ? " checked" : ""}> ${esc(c.txt)}</label>`).join("")}</fieldset>
      <fieldset class="ctafs"><legend>${X("soy")}</legend><label class="ctak"><input type="radio" name="rol" value="alumno" checked> 🎒 ${X("alumno")}</label><label class="ctak"><input type="radio" name="rol" value="profe"> 🧑‍🏫 ${X("profe")}</label></fieldset>
      <label id="ctacod"><span>${X("codigo")}</span><input name="codigo" autocapitalize="none" spellcheck="false" maxlength="20" placeholder="${esc(X1("codigo_ph"))}"></label>
      <p class="ctas" id="ctaprof" hidden>${X("profe_p")}</p>` : ""}
      ${hay ? `<label class="ctak"><input type="checkbox" name="llevar" checked> ${X(crear ? "llevar_c" : "llevar_e")}</label>` : ""}
      <p class="ctam" id="ctam" role="alert"></p>
      <button class="btn main" type="submit">${esc(X1(crear ? "crear" : "entrar"))}</button>
    </form>
    <p class="ctas">${crear ? `${X("ya_tienes")} <button type="button" class="ctal" id="ctac">${esc(X1("entrar"))}</button>` : `${X("no_tienes")} <button type="button" class="ctal" id="ctac">${esc(X1("crear_una"))}</button>`}</p>
    <p class="ctas"><button type="button" class="ctal" id="ctab2">${esc(X1("copia_t"))}</button> · <button type="button" class="ctal" data-cerrar>${esc(X1("invitado"))}</button></p>`);
  $d("#ctac").onclick = () => panelEntrar(crear ? "entrar" : "crear");
  if (crear) dlg.querySelectorAll("[name=rol]").forEach(r => r.onchange = () => { const p = $d("[name=rol]:checked").value === "profe"; $d("#ctacod").hidden = p; $d("#ctaprof").hidden = !p; });
  $d("#ctab2").onclick = panelCopia;
  $d("#ctaf").onsubmit = async e => {
    e.preventDefault();
    const f = e.target, m = $d("#ctam"), b = f.querySelector("[type=submit]");
    const usuario = f.usuario.value.trim().toLowerCase(), clave = f.clave.value, llevar = f.llevar ? f.llevar.checked : false;
    const extra = crear ? {rol: f.rol.value, codigo: f.rol.value === "alumno" ? f.codigo.value.trim() : "", curso: f.curso ? f.curso.value : ""} : {};
    if (crear && clave !== f.clave2.value) { m.textContent = XT("no_coinciden"); return; }
    b.disabled = true; m.textContent = XT("momento");
    try {
      const prog = crear ? conCurso(llevar ? copiaLocal() : null, extra.curso) : null;
      const r = await api(crear ? "cuenta?a=registro" : "cuenta?a=entrar", "POST", {usuario, clave, ...(crear ? {rol: extra.rol, codigo: extra.codigo, progreso: prog} : {})});
      if (!r.ok) { m.textContent = MSG[r.j.error] || r.j.error || XT("no_se_pudo"); b.disabled = false; return; }
      C = {usuario: r.j.usuario, token: r.j.token, rol: r.j.rol || "alumno", pend: false};
      const g = await api("progreso");
      const id = pid(C.usuario); P.list = P.list.filter(x => x.id !== id);
      let s = g.ok && g.j.s ? g.j.s : null;
      if (!s) { s = crear ? prog : llevar ? copiaLocal() : undefined; if (s) C.pend = true; }
      P.list.push({id, name: C.usuario, s: s || nuevo()}); P.cur = id;
      escribir(C); guardarP();
      if (C.pend) await subir();
      location.reload();
    } catch (err) { m.textContent = XT("sin_servidor"); b.disabled = false; }
  };
}
/* cursos que ofrece la web (catalogo.json → courses) */
function cursos() {
  const cat = window.LYA && window.LYA.CAT, nm = (c, l) => ((cat && cat.languages[c] || {}).name || {})[l] || c, ui = lgs()[0];
  const lista = cat && cat.courses ? cat.courses.filter(c => c.ready).flatMap(c => c.know.map(k => ({learn: c.learn, know: k}))) : [{learn: "es", know: "en"}];
  return lista.map(c => ({...c, txt: `${s1("curso", ui, {a: nm(c.learn, ui), b: ui === "en" ? nm(c.know, ui) : nm(c.know, ui).toLowerCase()})}${nm(c.learn, c.learn) !== nm(c.learn, ui) ? ` (${nm(c.learn, c.learn)})` : ""}`}));
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
  const t = X(estado === "offline" ? "e_offline" : estado === "error" ? "e_error" : estado === "sesion" ? "e_sesion" : "e_ok");
  const adm = C.usuario === "admin", prof = C.rol === "profe", alu = !adm && !prof;
  ventana(`<h2>👤 ${esc(C.usuario)} ${prof ? `<span class="ctae">· 🧑‍🏫 ${esc(X1("profe"))}</span>` : ""}</h2>${adm ? `<p><button class="btn main" type="button" id="ctaadm">🛠 ${esc(X1("panel_admin"))}</button></p>` : prof ? `<p><button class="btn main" type="button" id="ctaadm">🧑‍🏫 ${esc(X1("panel_profe"))}</button></p>` : ""}
    ${alu ? `<div class="ctacl" id="ctacl"><p class="ctas">${X("cargando_clase")}</p></div>` : ""}<p class="ctas">${t}</p>
    <p><button class="btn" type="button" id="ctag">${esc(X1("guardar"))}</button> <button class="btn" type="button" id="ctab2">${esc(X1("copia"))}</button></p>
    <p><button class="btn" type="button" id="ctas">${esc(X1("salir"))}</button></p>
    <p class="ctas">${X("salir_p")}</p>`);
  if (adm || prof) $d("#ctaadm").onclick = () => panelAdmin(adm ? "propuestas" : "usuarios");
  if (alu) miClase();
  $d("#ctag").onclick = async () => { $d("#ctag").disabled = true; await subir(); panelCuenta(); };
  $d("#ctab2").onclick = panelCopia;
  $d("#ctas").onclick = async () => {
    $d("#ctas").disabled = true;
    if (C.pend) await subir();
    try { await api("cuenta?a=salir", "POST", {}); } catch (e) {}
    const id = pid(C.usuario); P.list = P.list.filter(x => x.id !== id);
    if (!P.list.some(x => x.id === "local")) P.list.push({id: "local", name: "", s: nuevo()});
    P.cur = "local"; C = null; escribir(null); guardarP(); location.reload();
  };
}

/* ---------- alumno: unirse a una clase con el código del profe ---------- */
async function miClase(aviso = "") {
  let cl = null; try { const r = await api("avisos"); if (r.ok) cl = r.j.clase; } catch (e) {}
  const el = dlg && dlg.querySelector("#ctacl"); if (!el) return;
  el.innerHTML = `<p><b>🏫 ${X("mi_clase")}:</b> ${cl ? `${esc(cl.nombre)}${cl.profe ? ` <span class="ctae">(profe: ${esc(cl.profe)})</span>` : ""}` : X("ninguna")}</p>
    <form id="ctaclf" class="ctaclf"><input name="codigo" autocapitalize="none" spellcheck="false" maxlength="20" required placeholder="${esc(X1("codigo_c"))}" aria-label="${esc(X1("codigo_c"))}"><button class="btn" type="submit">${esc(X1(cl ? "cambiar_clase" : "unirme"))}</button>${cl ? ` <button class="ctal" type="button" id="ctaclx">${esc(X1("salir_clase"))}</button>` : ""}</form>
    <p class="ctam" role="status">${aviso}</p>`;
  el.querySelector("#ctaclf").onsubmit = async e => {
    e.preventDefault(); const b = e.target.querySelector("button"); b.disabled = true;
    const r = await api("avisos", "POST", {codigo: e.target.codigo.value.trim()}).catch(() => ({ok: false, j: {}}));
    if (r.ok) { miClase(esc(XT("ya_en_clase", {c: r.j.clase.nombre}))); if (window.LYAAvisos) window.LYAAvisos.cargar(); }
    else { el.querySelector(".ctam").textContent = MSG[r.j.error] || XT("no_pudo"); b.disabled = false; }
  };
  const x = el.querySelector("#ctaclx"); if (x) x.onclick = async () => { await api("avisos", "POST", {salirClase: true}).catch(() => {}); miClase(esc(XT("fuera_clase"))); if (window.LYAAvisos) window.LYAAvisos.cargar(); };
}

/* ---------- administrador: el panel está en panel-admin.js y se carga solo cuando el admin lo abre ---------- */
let cargaAdmin = null;
const cargarPanel = () => cargaAdmin ||= new Promise((ok, mal) => { const sc = document.createElement("script"); sc.src = "panel-admin.js"; sc.onload = ok; sc.onerror = mal; document.head.appendChild(sc); });
function panelAdmin(tab) {
  cargaAdmin ||= new Promise((ok, mal) => { const sc = document.createElement("script"); sc.src = "panel-admin.js"; sc.onload = ok; sc.onerror = mal; document.head.appendChild(sc); });
  cargaAdmin.then(() => window.LYAPanelAdmin.abrir(tab)).catch(() => { cargaAdmin = null; ventana(`<h2>🛠 ${X("admin")}</h2><p class="ctam">${X("admin_mal")}</p>`); });
}

/* ---------- copia del progreso: sirve para pasar el progreso de la web antigua a la nueva ---------- */
function panelCopia() {
  const p = perfil(), texto = p ? JSON.stringify({app: "lee-y-aprende", v: 1, fecha: new Date().toISOString(), s: p.s}) : "";
  ventana(`<h2>💾 ${X("copia")}</h2>
    <p class="ctas"><b>${esc(X1("c1"))}</b> ${X("c1_p")}</p>
    <textarea id="ctat" readonly rows="3">${esc(texto)}</textarea>
    <p><button class="btn" type="button" id="ctacp">${esc(X1("copiar"))}</button> <button class="btn" type="button" id="ctadl">${esc(X1("descargar"))}</button></p>
    <p class="ctas"><b>${esc(X1("c2"))}</b> ${X(C ? "c2_pc" : "c2_p")}</p>
    <textarea id="ctai" rows="3" placeholder="${esc(X1("pega"))}"></textarea>
    <p><input type="file" id="ctaa" accept=".json,application/json,text/plain"></p>
    <p class="ctam" id="ctam" role="alert"></p>
    <p><button class="btn main" type="button" id="ctaok">${esc(X1("poner"))}</button></p>`);
  $d("#ctacp").onclick = async () => { const t = $d("#ctat"); t.select(); try { await navigator.clipboard.writeText(t.value); } catch (e) { try { document.execCommand("copy"); } catch (e2) {} } $d("#ctacp").textContent = X1("copiado"); };
  $d("#ctadl").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([texto], {type: "application/json"})); a.download = "mi-progreso-lee-y-aprende.json"; document.body.appendChild(a); a.click(); a.remove(); };
  $d("#ctaa").onchange = e => { const f = e.target.files[0]; if (f) f.text().then(t => { $d("#ctai").value = t; }); };
  let seguro = false;
  $d("#ctaok").onclick = async () => {
    const m = $d("#ctam"); let o = null;
    try { o = JSON.parse($d("#ctai").value.trim()); } catch (e) {}
    const s = o && o.s && typeof o.s === "object" ? o.s : o && o.a && o.dict ? o : null; /* también vale un estado suelto */
    if (!s || typeof s.a !== "object") { m.textContent = XT("no_valida"); return; }
    if (!seguro) { seguro = true; m.textContent = XT("seguro"); $d("#ctaok").textContent = X1("si_poner"); return; }
    const pr = perfil(); if (!pr) return;
    pr.s = s; guardarP();
    if (C && C.token) { C.pend = true; escribir(C); await subir(); }
    location.reload();
  };
}

window.LYACuentas = {preparar, cambio, boton, abrir, subir, api, hayServidor, get usuario() { return C && C.usuario; }, get rol() { return C && C.token ? (C.usuario === "admin" ? "admin" : C.rol || "alumno") : null; }, panel: tab => panelAdmin(tab), cargarPanel, /* la portada del profe (profe/profe.js) usa el panel sin abrirlo */
  ui: {ventana, cerrar, esc, get dlg() { return dlg; }, $d: s => dlg.querySelector(s)}};
})();
