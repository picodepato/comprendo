/* Panel del administrador (usuario admin) y de los profes (solo sus clases y alumnos). Lo carga cuentas.js al abrirlo.
   Pestañas: propuestas, usuarios (+ detalle y Excel), clases, deberes, fallos, mensajes y votos. Habla con /api/admin. */
(() => {
const C = window.LYACuentas, {esc} = C.ui;
const api = (...a) => C.api(...a);
const ventana = h => { C.ui.ventana(h); C.ui.dlg.classList.add("ancha"); };
const $d = s => C.ui.dlg.querySelector(s), $$ = s => [...C.ui.dlg.querySelectorAll(s)];
const fecha = t => t ? new Date(t).toLocaleString("es-ES", {day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"}) : "—";
const dia = d => d ? new Date(d + "T12:00:00").toLocaleDateString("es-ES", {weekday: "short", day: "numeric", month: "short"}) : "—";
const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const est = n => `<span class="stars" aria-label="${n} de 3 estrellas">${'<i class="on">★</i>'.repeat(n)}${"<i>★</i>".repeat(3 - n)}</span>`;
const MSG = {clave_corta: "La contraseña debe tener al menos 6 caracteres.", no_existe: "Ese usuario ya no existe.", falta_nombre: "Falta el nombre.", falta_texto: "Escribe el mensaje.", datos_no_validos: "Elige una lectura y una fecha.",
  codigo_ocupado: "Ese código ya lo usa otra clase. Elige otro.", codigo_no_valido: "El código debe tener de 3 a 20 letras o números, sin espacios.", sin_clases: "Primero crea una clase.", no_es_tu_alumno: "Ese alumno no está en tus clases.", no_es_tu_clase: "Esa clase no es tuya."};

/* ---------- catálogo: id de lectura → título, tema, nivel ---------- */
let CAT = null;
const catalogo = () => CAT ||= fetch("content/catalogo.json").then(r => r.json()).then(c => {
  const m = {}; let i = 0;
  for (const t of c.topics) for (const [lang, rs] of Object.entries(t.readings || {})) for (const r of rs) {
    const id = r.id || `${t.id}-${r.level.toLowerCase()}`;
    m[id] = {id, tema: (t.name || {}).es || t.id, titulo: (r.title || {}).es || (r.title || {})[lang] || id, nivel: r.level, lengua: lang, file: r.file, orden: i++};
  }
  return m;
}).catch(() => ({}));
const nombreL = (T, id) => /^dictado-/.test(id) && T[id.slice(8)] ? "✍️ Dictado: " + nombreL(T, id.slice(8)) : T[id] ? `${T[id].titulo} (${T[id].tema} · ${T[id].nivel}${T[id].lengua === "en" ? " · inglés" : ""})` : id;

let D = null, T = {}, tabActual = "propuestas", filtroGrupo = "";
async function cargar() {
  const [r, cat] = await Promise.all([api("admin").catch(() => ({ok: false})), catalogo()]);
  T = cat; D = r.ok ? r.j : null; return r;
}
async function hacer(datos, btn) {
  if (btn) btn.disabled = true;
  let r; try { r = await api("admin", "POST", datos); } catch (e) { r = {ok: false, j: {}}; }
  if (!r.ok) { alerta(MSG[r.j.error] || "No se ha podido hacer."); if (btn) btn.disabled = false; return null; }
  return r.j;
}
const alerta = t => { const m = $d("#admm"); if (m) m.textContent = t; };

async function abrir(tab = tabActual) {
  tabActual = tab;
  ventana(`<h2>Panel</h2><p class="ctas">Cargando…</p>`);
  const r = await cargar();
  if (!r.ok) { ventana(`<h2>Panel</h2><p class="ctam">${r.code === 403 ? "Tu sesión de administrador ha caducado. Sal y vuelve a entrar." : "No se ha podido cargar."}</p>`); return; }
  pintar();
}
const nGrupo = id => (D.grupos[id] || {}).nombre || "—";
const esAdmin = () => D && D.soy && D.soy.admin, titulo = () => esAdmin() ? "🛠 Administración" : "🧑‍🏫 Panel del profe";
const alumnos = () => D.usuarios.filter(u => u.rol !== "profe");
const optsGrupo = (sel, vacio = "Sin clase") => `<option value="">${vacio}</option>${Object.entries(D.grupos).map(([id, g]) => `<option value="${esc(id)}"${id === sel ? " selected" : ""}>${esc(g.nombre)}</option>`).join("")}`;
const optsLectura = () => { const ls = Object.values(T).sort((a, b) => (a.lengua > b.lengua) - (a.lengua < b.lengua) || a.orden - b.orden).filter(l => l.file);
  return `<optgroup label="📖 Lecturas">${ls.map(l => `<option value="${esc(l.id)}">${esc(nombreL(T, l.id))}</option>`).join("")}</optgroup><optgroup label="✍️ Dictados (5 frases de la lectura)">${ls.map(l => `<option value="dictado-${esc(l.id)}">${esc(nombreL(T, "dictado-" + l.id))}</option>`).join("")}</optgroup>`; };

function pintar() {
  const tabs = [["propuestas", `💡 Propuestas (${D.propuestas.length})`], ["usuarios", esAdmin() ? `👥 Usuarios (${D.usuarios.length})` : `🎒 Mis alumnos (${D.usuarios.length})`], ["clases", `🏫 ${esAdmin() ? "Clases" : "Mis clases"} (${Object.keys(D.grupos).length})`],
    ["actividades", "🧩 Actividades creadas"], ["deberes", `📚 Deberes (${D.deberes.length})`], ["fallos", "❌ Fallos"], ["mensajes", "✉️ Mensajes"], ["votos", "🗳 Votos"]].filter(([k]) => esAdmin() || !["propuestas", "votos"].includes(k));
  if (!tabs.some(([k]) => k === tabActual)) tabActual = tabs[0][0];
  ventana(`<h2>${titulo()}</h2>
    ${!esAdmin() && !Object.keys(D.grupos).length ? `<p class="ctas">👋 Empieza creando una clase en «Mis clases». Da su código a tus alumnos: lo ponen al crear su cuenta o en «Mi cuenta».</p>` : ""}
    ${D.claveAdminPorDefecto ? `<p class="ctam">⚠ La contraseña de admin sigue siendo «admin». Cámbiala en Vercel → Settings → Environment Variables → ADMIN_CLAVE.</p>` : ""}
    <div class="ctatabs" role="tablist">${tabs.map(([k, n]) => `<button type="button" class="btn${k === tabActual ? " main" : ""}" data-tab="${k}" role="tab" aria-selected="${k === tabActual}">${n}</button>`).join("")}</div>
    <p class="ctam" id="admm" role="status"></p>
    <div id="admc">${VISTAS[tabActual]()}</div>`);
  $$("[data-tab]").forEach(b => b.onclick = () => abrir(b.dataset.tab)); /* siempre datos al día */
  (ACCIONES[tabActual] || (() => {}))();
}

/* ---------- propuestas ---------- */
const VISTAS = {}, ACCIONES = {};
VISTAS.propuestas = () => D.propuestas.length ? `<ul class="ctali">${D.propuestas.map(p => `<li><p>${esc(p.texto)}</p><small>${p.usuario ? "👤 " + esc(p.usuario) : "Invitado"} · ${fecha(p.t)}</small>
  <p class="admbt"><button type="button" class="btn" data-aprobar="${esc(p.id)}">✅ Aprobar y pasar a la votación</button> <button type="button" class="ctal" data-borrar="${esc(p.id)}">Borrar</button></p>
  <form class="admform" data-form="${esc(p.id)}" hidden><label>Emoji<input name="emoji" value="💡" maxlength="8" style="width:70px"></label><label>Nombre del tema<input name="nombre_es" required maxlength="40" value="${esc(p.texto.slice(0, 40))}"></label><label>En inglés<input name="nombre_en" maxlength="40"></label><label class="admw">Descripción corta<input name="desc_es" maxlength="120"></label><button class="btn main" type="submit">Pasar a la votación</button></form></li>`).join("")}</ul>` : `<p class="ctas">Todavía no hay propuestas.</p>`;
ACCIONES.propuestas = () => {
  $$("[data-borrar]").forEach(b => b.onclick = async () => {
    if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = "¿Seguro? Pulsa otra vez"; return; }
    b.disabled = true; await api("propuestas", "DELETE", {id: b.dataset.borrar}); abrir();
  });
  $$("[data-aprobar]").forEach(b => b.onclick = () => { const f = $d(`[data-form="${b.dataset.aprobar}"]`); f.hidden = !f.hidden; if (!f.hidden) f.nombre_es.focus(); });
  $$("[data-form]").forEach(f => f.onsubmit = async e => {
    e.preventDefault();
    const ok = await hacer({accion: "propuesta_aprobar", id: f.dataset.form, emoji: f.emoji.value, nombre_es: f.nombre_es.value, nombre_en: f.nombre_en.value, desc_es: f.desc_es.value}, f.querySelector("[type=submit]"));
    if (ok) { await abrir("propuestas"); alerta("✓ Tema añadido a la votación de la portada."); }
  });
};

/* ---------- usuarios ---------- */
VISTAS.usuarios = () => {
  const us = D.usuarios.filter(u => !filtroGrupo || u.grupo === filtroGrupo).sort((a, b) => b.ultimo - a.ultimo);
  return `<p class="admbt"><label class="admin-l">Clase <select id="admfg"><option value="">Todas</option>${Object.entries(D.grupos).map(([id, g]) => `<option value="${esc(id)}"${id === filtroGrupo ? " selected" : ""}>${esc(g.nombre)}</option>`).join("")}</select></label>
    <button type="button" class="btn" id="admxl">⬇ Descargar Excel</button></p>
  ${us.length ? `<p class="ctas">Pulsa un ${esAdmin() ? "usuario" : "alumno"} para ver lo que ha hecho en cada lectura, cambiarle la contraseña o mandarle un mensaje.</p><div class="ctatb"><table><thead><tr><th>Usuario</th>${esAdmin() ? "<th>Tipo</th>" : ""}<th>Aprende</th><th>Clase</th><th>Lecturas terminadas</th><th>Estrellas</th><th>Con ★★★</th><th>Veces leídas</th><th>Sin terminar</th><th>XP</th><th>Racha</th><th>Cromos</th><th>Palabras</th><th>Último guardado</th></tr></thead><tbody>${us.map(u => `<tr class="ctafila" data-usuario="${esc(u.usuario)}" tabindex="0"><td><b>${esc(u.usuario)}</b></td>${esAdmin() ? `<td>${u.rol === "profe" ? "🧑‍🏫 Profe" : "🎒 Alumno"}</td>` : ""}<td>${esc((u.idioma || "—").toUpperCase())}</td><td>${u.grupo ? esc(nGrupo(u.grupo)) : "—"}</td><td>${u.terminadas}</td><td>⭐ ${u.estrellas}</td><td>${u.tres}</td><td>${u.veces}</td><td>${u.empezadas}</td><td>${u.xp}</td><td>${u.racha} (mejor ${u.mejorRacha})</td><td>${u.cromos}</td><td>${u.palabras}</td><td>${fecha(u.ultimo)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="ctas">${esAdmin() ? `No hay usuarios${filtroGrupo ? " en esta clase" : ""}.` : "Todavía no tienes alumnos. Dales el código de tu clase para que se unan."}</p>`}`;
};
ACCIONES.usuarios = () => {
  $d("#admfg").onchange = e => { filtroGrupo = e.target.value; pintar(); };
  $d("#admxl").onclick = excel;
  $$("[data-usuario]").forEach(tr => { tr.onclick = () => usuario(tr.dataset.usuario); tr.onkeydown = e => { if (e.key === "Enter") usuario(tr.dataset.usuario); }; });
};
function excel() {
  const us = D.usuarios.filter(u => !filtroGrupo || u.grupo === filtroGrupo);
  const ids = Object.values(T).filter(l => us.some(u => u.lecturas[l.id] !== undefined)).sort((a, b) => a.orden - b.orden).map(l => l.id);
  const q = v => { const s = String(v ?? ""); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const f = t => t ? new Date(t).toLocaleString("es-ES") : "";
  const filas = [["Usuario", "Tipo", "Aprende", "Clase", "Lecturas terminadas", "Estrellas", "Con 3 estrellas", "Veces leídas", "Sin terminar", "XP", "Racha", "Mejor racha", "Cromos", "Medallas", "Palabras", "Último guardado", "Alta", ...ids.map(id => "★ " + nombreL(T, id))]];
  for (const u of us) filas.push([u.usuario, u.rol === "profe" ? "Profe" : "Alumno", u.idioma || "", u.grupo ? nGrupo(u.grupo) : "", u.terminadas, u.estrellas, u.tres, u.veces, u.empezadas, u.xp, u.racha, u.mejorRacha, u.cromos, u.medallas, u.palabras, f(u.ultimo), f(u.creado), ...ids.map(id => u.lecturas[id] ?? "")]);
  const csv = "﻿" + filas.map(r => r.map(q).join(";")).join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], {type: "text/csv;charset=utf-8"}));
  a.download = `progreso-${filtroGrupo ? nGrupo(filtroGrupo).replace(/[^\wñáéíóú-]+/gi, "-") + "-" : ""}${hoy()}.csv`; document.body.appendChild(a); a.click(); a.remove();
  alerta("✓ Descargado. Se abre con Excel, Numbers o Google Sheets.");
}

/* detalle de un usuario */
async function usuario(u) {
  ventana(`<h2>👤 ${esc(u)}</h2><p class="ctas">Cargando…</p>`);
  const r = await api("admin?usuario=" + encodeURIComponent(u)).catch(() => ({ok: false}));
  if (!r.ok) { ventana(`<p><button class="btn" type="button" id="ctavol">← Usuarios</button></p><p class="ctam">No se ha podido cargar.</p>`); $d("#ctavol").onclick = () => abrir("usuarios"); return; }
  const {resumen: R, lecturas, palabras, mensajes} = r.j;
  const L = lecturas.map(l => ({...l, ...(T[l.id] || {tema: "—", titulo: l.id, nivel: "", lengua: "", orden: 9999})})).sort((a, b) => b.terminada - a.terminada || a.orden - b.orden);
  const fallos = palabras.filter(p => p.fallo).length;
  ventana(`<p><button class="btn" type="button" id="ctavol">← Usuarios</button></p>
    <h2>👤 ${esc(R.usuario)}</h2><p class="ctam" id="admm" role="status"></p>
    <div class="ctares">
      <div><b>${R.terminadas}</b><span>lecturas terminadas</span></div>
      <div><b>⭐ ${R.estrellas}</b><span>estrellas (de ${R.terminadas * 3})</span></div>
      <div><b>${R.tres}</b><span>con 3 estrellas</span></div>
      <div><b>${R.veces}</b><span>veces leídas</span></div>
      <div><b>${R.empezadas}</b><span>sin terminar</span></div>
      <div><b>${R.xp}</b><span>XP</span></div>
      <div><b>${R.racha}</b><span>racha (mejor ${R.mejorRacha})</span></div>
      <div><b>${R.cromos}</b><span>cromos</span></div>
      <div><b>${R.medallas}</b><span>medallas</span></div>
      <div><b>${R.palabras}</b><span>palabras guardadas${fallos ? ` (${fallos} por repasar)` : ""}</span></div>
    </div>
    <p class="ctas">Alta: ${fecha(R.creado)} · Último guardado: ${fecha(R.ultimo)}</p>
    <div class="admgest">
      ${R.rol === "profe" ? "<p>🧑‍🏫 Es profe</p>" : `<label>Clase <select id="admug">${optsGrupo(R.grupo || "")}</select></label>`}
      <form id="admuc"><label>Nueva contraseña <input name="nueva" type="text" minlength="6" maxlength="100" autocomplete="off" required></label><button class="btn" type="submit">Cambiar contraseña</button></form>
      <form id="admum" class="admw"><label>Mensaje para ${esc(R.usuario)} <textarea name="texto" rows="2" maxlength="500" required placeholder="Por ejemplo: ¡Muy bien esta semana!"></textarea></label><button class="btn" type="submit">✉️ Enviar mensaje</button></form>
    </div>
    ${L.length ? `<div class="ctatb"><table><thead><tr><th>Lectura</th><th>Tema</th><th>Nivel</th><th>Mejor resultado</th><th>Última vez</th><th>Veces</th><th>Mejor %</th></tr></thead><tbody>${L.map(l => `<tr><td><b>${esc(l.titulo)}</b>${l.lengua === "en" ? ' <small class="ctae">(inglés)</small>' : ""}</td><td>${esc(l.tema)}</td><td>${esc(l.nivel)}</td><td>${l.terminada ? est(l.estrellas) : `<small class="ctae">Empezada (${l.respuestas} ${l.respuestas === 1 ? "respuesta" : "respuestas"})</small>`}</td><td>${l.terminada && l.ultima !== null ? est(l.ultima) : "—"}</td><td>${l.veces || "—"}</td><td>${l.terminada ? l.mejorPct + " %" : "—"}</td></tr>`).join("")}</tbody></table></div>` : `<p class="ctas">Todavía no ha hecho ninguna lectura.</p>`}
    ${palabras.length ? `<details class="ctapal"><summary>Palabras guardadas (${palabras.length})</summary><p>${palabras.map(p => `<span${p.fallo ? ' class="fallo" title="Por repasar"' : ""}>${esc(p.palabra)}</span>`).join(" ")}</p></details>` : ""}
    ${mensajes.length ? `<details class="ctapal"><summary>Mensajes recibidos (${mensajes.length})</summary><ul class="ctali">${mensajes.map(m => `<li><p>${esc(m.texto)}</p><small>${fecha(m.t)}</small></li>`).join("")}</ul></details>` : ""}
    ${esAdmin() ? `<p style="margin-top:18px"><button class="btn" type="button" id="admub">🗑 Borrar usuario</button></p>` : ""}`);
  $d("#ctavol").onclick = () => abrir("usuarios");
  if ($d("#admug")) $d("#admug").onchange = async e => { if (await hacer({accion: "grupo_asignar", usuario: u, grupo: e.target.value})) { alerta("✓ Clase guardada."); const x = D.usuarios.find(z => z.usuario === u); if (x) x.grupo = e.target.value || null; } };
  $d("#admuc").onsubmit = async e => { e.preventDefault(); const f = e.target; if (await hacer({accion: "clave", usuario: u, nueva: f.nueva.value}, f.querySelector("button"))) { alerta(`✓ Contraseña cambiada. Díselo a ${u}: «${f.nueva.value}». Tendrá que volver a entrar.`); f.reset(); f.querySelector("button").disabled = false; } };
  $d("#admum").onsubmit = async e => { e.preventDefault(); const f = e.target; if (await hacer({accion: "mensaje", usuario: u, texto: f.texto.value}, f.querySelector("button"))) { alerta("✓ Mensaje enviado. Lo verá al entrar."); f.reset(); f.querySelector("button").disabled = false; } };
  if ($d("#admub")) $d("#admub").onclick = async e => {
    const b = e.currentTarget;
    if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = `⚠ ¿Borrar a ${u} y todo su progreso? Pulsa otra vez`; return; }
    if (await hacer({accion: "borrar_usuario", usuario: u}, b)) { await abrir("usuarios"); alerta(`✓ ${u} borrado.`); }
  };
}

/* ---------- clases ---------- */
VISTAS.clases = () => {
  const gs = Object.entries(D.grupos);
  const res = id => { const us = D.usuarios.filter(u => u.grupo === id), n = us.length || 1; return {n: us.length, term: us.reduce((s, u) => s + u.terminadas, 0), est: us.reduce((s, u) => s + u.estrellas, 0), xp: us.reduce((s, u) => s + u.xp, 0), media: (us.reduce((s, u) => s + u.terminadas, 0) / n).toFixed(1), mediaE: (us.reduce((s, u) => s + u.estrellas, 0) / n).toFixed(1)}; };
  return `<form id="admgc" class="admform"><label>Nombre de la clase<input name="nombre" maxlength="40" required placeholder="Ej. 3ºA Inglés"></label><label>Código para unirse<input name="codigo" maxlength="20" required placeholder="Ej. 3a-ingles" autocapitalize="none" spellcheck="false"></label><button class="btn main" type="submit">➕ Crear clase</button></form>
  <p class="ctas">Tus alumnos ponen el código al crear su cuenta o después en «Mi cuenta».</p>
  ${gs.length ? `<div class="ctatb"><table><thead><tr><th>Clase</th><th>Código</th>${esAdmin() ? "<th>Profe</th>" : ""}<th>Alumnos</th><th>Lecturas terminadas</th><th>Media por alumno</th><th>Estrellas</th><th>Media de estrellas</th><th>XP total</th><th></th></tr></thead><tbody>${gs.map(([id, g]) => { const r = res(id); return `<tr><td><b>${esc(g.nombre)}</b></td><td><code>${esc(g.codigo || "—")}</code></td>${esAdmin() ? `<td>${g.profe ? esc(g.profe) : "admin"}</td>` : ""}<td>${r.n}</td><td>${r.term}</td><td>${r.media}</td><td>⭐ ${r.est}</td><td>${r.mediaE}</td><td>${r.xp}</td><td><button type="button" class="ctal" data-verg="${esc(id)}">Ver alumnos</button> · <button type="button" class="ctal" data-borrag="${esc(id)}">Borrar</button></td></tr>`; }).join("")}</tbody></table></div>` : `<p class="ctas">Todavía no hay clases. Crea una y luego elige la clase de cada alumno aquí abajo.</p>`}
  ${alumnos().length && gs.length ? `<h3 style="margin-top:18px">Alumnos y su clase</h3><div class="ctatb"><table><tbody>${alumnos().map(u => `<tr><td><b>${esc(u.usuario)}</b></td><td><select data-asig="${esc(u.usuario)}" aria-label="Clase de ${esc(u.usuario)}">${optsGrupo(u.grupo || "", esAdmin() ? "Sin clase" : "Sacar de mis clases")}</select></td></tr>`).join("")}</tbody></table></div>` : ""}`;
};
ACCIONES.clases = () => {
  $d("#admgc [name=nombre]").oninput = e => { const c = $d("#admgc [name=codigo]"); if (!c.dataset.tocado) c.value = e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9ñ]+/g, "-").replace(/^-|-$/g, "").slice(0, 20); };
  $d("#admgc [name=codigo]").oninput = e => { e.target.dataset.tocado = "1"; };
  $d("#admgc").onsubmit = async e => { e.preventDefault(); const r = await hacer({accion: "grupo_crear", nombre: e.target.nombre.value, codigo: e.target.codigo.value}, e.target.querySelector("button")); if (r) { await abrir("clases"); alerta(`✓ Clase creada. Código para tus alumnos: ${r.codigo}`); } };
  $$("[data-borrag]").forEach(b => b.onclick = async () => {
    if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = "¿Seguro? (los alumnos no se borran)"; return; }
    if (await hacer({accion: "grupo_borrar", id: b.dataset.borrag}, b)) abrir("clases");
  });
  $$("[data-verg]").forEach(b => b.onclick = () => { filtroGrupo = b.dataset.verg; tabActual = "usuarios"; pintar(); });
  $$("[data-asig]").forEach(s => s.onchange = async () => { if (await hacer({accion: "grupo_asignar", usuario: s.dataset.asig, grupo: s.value})) { const x = D.usuarios.find(z => z.usuario === s.dataset.asig); if (x) x.grupo = s.value || null; alerta(`✓ ${s.dataset.asig}: ${s.value ? nGrupo(s.value) : "sin clase"}`); } });
};

/* ---------- deberes ---------- */
VISTAS.deberes = () => `<form id="admdc" class="admform"><label class="admw">Lectura o dictado<select name="lectura" required>${optsLectura()}</select></label>
  <label>Para<select name="grupo">${optsGrupo("", esAdmin() ? "Todos los alumnos" : "Todas mis clases")}</select></label><label>Fecha límite<input name="limite" type="date" required value="${hoy()}"></label>
  <label class="admw">Nota (opcional)<input name="nota" maxlength="200" placeholder="Por ejemplo: intenta sacar 3 estrellas"></label><button class="btn main" type="submit">📚 Asignar lectura</button></form>
  ${D.deberes.length ? `<ul class="ctali">${[...D.deberes].sort((a, b) => a.limite.localeCompare(b.limite)).map(d => { const hechos = d.alumnos.filter(a => a.hecho).length, venc = d.limite < hoy();
    return `<li><p><b>${d.actividad ? `${{quiz: "🏆", video: "📺", doblaje: "🎬"}[d.tipo] || "🧩"} ${esc(d.titulo || "Actividad")}${d.directo ? " · 🔴 en clase, en directo" : ""}` : d.cancion ? (d.doblaje ? "🎬 " : "🎵 ") + esc(d.titulo || (d.doblaje ? "Doblaje" : "Canción")) : esc(nombreL(T, d.lectura))}</b></p>
    ${d.actividad && d.directo && d.tipo !== "doblaje" ? `<p class="admbt"><a class="btn main" href="#${d.tipo === "video" ? "video-" : "concurso-"}${esc(d.actividad)}" data-sala="${esc(d.actividad)}" data-grupo="${esc(d.grupo || "")}">📺 Abrir la sala ahora</a></p>` : ""}<small>Para: ${d.grupo ? esc(nGrupo(d.grupo)) : esAdmin() ? "todos" : "todas mis clases"} · Hasta: ${dia(d.limite)}${venc ? " (terminado el plazo)" : ""}${d.nota ? " · " + esc(d.nota) : ""}</small>
    <p style="margin-top:6px">✅ <b>${hechos}</b> de ${d.alumnos.length} la han hecho</p>
    <details class="ctapal"><summary>Ver quién</summary><p>${d.alumnos.map(a => `<span${a.hecho ? "" : ' class="fallo"'}>${a.hecho ? "✓" : "✗"} ${esc(a.usuario)}${a.hecho ? " " + "★".repeat(a.estrellas) : ""}</span>`).join(" ") || "Nadie en esta clase."}</p></details>
    <button type="button" class="ctal" data-borrad="${esc(d.id)}">Quitar</button></li>`; }).join("")}</ul>` : `<p class="ctas">No hay deberes. Puedes mandar una lectura o un dictado; los alumnos los verán en la portada con la fecha límite.</p>`}
  <p class="ctas">🎵 Para mandar una canción de YouTube, ábrela en la pestaña «Canciones» y pulsa «Mandar como deberes».<br>🧩 Los concursos y los vídeos con preguntas se mandan desde «Actividades creadas».</p><p class="ctas">🎬 Para mandar una escena para doblar, prepárala en la pestaña «Doblaje» y pulsa «Mandar a la clase».</p>`;
ACCIONES.deberes = () => {
  $d("#admdc").onsubmit = async e => { e.preventDefault(); const f = e.target; if (await hacer({accion: "deber_crear", lectura: f.lectura.value, grupo: f.grupo.value, limite: f.limite.value, nota: f.nota.value}, f.querySelector("[type=submit]"))) { await abrir("deberes"); alerta("✓ Deber asignado."); } };
  $$("[data-sala]").forEach(a => a.onclick = () => { window.LYAActividades?.preparar(a.dataset.sala, a.dataset.grupo); C.ui.cerrar(); });
  $$("[data-borrad]").forEach(b => b.onclick = async () => { if (b.dataset.ok !== "1") { b.dataset.ok = "1"; b.textContent = "¿Seguro? Pulsa otra vez"; return; } if (await hacer({accion: "deber_borrar", id: b.dataset.borrad}, b)) abrir("deberes"); });
};

/* ---------- actividades creadas: concursos, vídeos con preguntas, doblajes y canciones mandadas, y los vídeos preparados ---------- */
const ICO = {quiz: "🏆", video: "📺", doblaje: "🎬"};
VISTAS.actividades = () => `<p class="ctas">Todo lo que has creado. Ábrelo, juégalo en directo con tu clase o mándalo como deberes (en casa, o en clase en directo: tus alumnos entran solos desde «Deberes»).</p>
  <p class="admbt"><a class="btn" href="#concursos-crear" data-cierra>✨ Crear un concurso</a> <a class="btn" href="#videos-editar" data-cierra>📺 Crear un vídeo con preguntas</a></p>
  <div id="admact"><p class="ctas">Cargando…</p></div>`;
ACCIONES.actividades = async () => {
  $$("[data-cierra]").forEach(a => a.onclick = () => C.ui.cerrar());
  const r = await api("concursos?mios=1").catch(() => ({ok: false}));
  const box = $d("#admact"); if (!box) return;
  const mias = r.ok ? (r.j.concursos || []).map(x => ({...x, tipo: x.tipo === "video" ? "video" : "quiz"})) : [];
  const prep = (window.LYAVideosPreparados || []).map(x => ({id: x.id, titulo: x.titulo, n: x.preguntas.length, tipo: "video", nivel: x.nivel, prep: true}));
  const canciones = D.deberes.filter(d => d.cancion && !d.doblaje), doblajes = D.deberes.filter(d => d.cancion && d.doblaje);
  const mandada = (d, ico, ruta) => `<li><p><b>${ico} ${esc(d.titulo || "")}</b></p><small>Para: ${d.grupo ? esc(nGrupo(d.grupo)) : "todas mis clases"} · Hasta: ${dia(d.limite)} · ✅ ${d.alumnos.filter(a => a.hecho).length} de ${d.alumnos.length}</small><p class="admbt"><a class="btn" href="#${ruta}${esc(d.cancion)}" data-cierra>▶ Abrir</a></p></li>`;
  const fila = x => `<li><p><b>${ICO[x.tipo]} ${esc(x.titulo)}</b></p><small>${x.tipo === "video" ? "Vídeo con preguntas" : "Concurso"} · ${x.n} preguntas${x.nivel ? " · " + esc(x.nivel) : ""}${x.f ? " · " + fecha(x.f) : ""}</small>
    <p class="admbt"><a class="btn" href="#${x.tipo === "video" ? "video-solo-" : "concurso-solo-"}${esc(x.id)}" data-cierra>▶ Probar</a> <a class="btn" href="#${x.tipo === "video" ? "video-" : "concurso-"}${esc(x.id)}" data-cierra>📺 En directo</a>${x.prep ? "" : ` <a class="btn" href="#${x.tipo === "video" ? "videos-editar-" : "concursos-editar-"}${esc(x.id)}" data-cierra>✏️ Editar</a>`}</p>
    <div data-act="${esc(x.id)}" data-tipo="${x.tipo}" data-tit="${esc(x.titulo)}"></div></li>`;
  const sec = (tit, xs, vacio) => `<h3 class="admh3">${tit}</h3>${xs.length ? `<ul class="ctali">${xs.map(fila).join("")}</ul>` : `<p class="ctas">${vacio}</p>`}`;
  const quiz = mias.filter(x => x.tipo === "quiz"), vids = mias.filter(x => x.tipo === "video");
  box.innerHTML = (r.ok ? "" : `<p class="ctam">No se han podido cargar tus actividades.</p>`)
    + sec(`🏆 Mis concursos (${quiz.length})`, quiz, "Aún no has creado ninguno. Se crean con IA en un minuto en «Concursos».")
    + sec(`📺 Mis vídeos con preguntas (${vids.length})`, vids, "Aún no has creado ninguno: pega un enlace de YouTube y añade preguntas en los momentos que quieras.")
    + `<h3 class="admh3">🎬 Doblajes mandados (${doblajes.length})</h3>${doblajes.length ? `<ul class="ctali">${doblajes.map(d => mandada(d, "🎬", "doblaje-e-")).join("")}</ul>` : `<p class="ctas">Se preparan en la pestaña «Doblaje» y se mandan con «Mandar a la clase».</p>`}`
    + `<h3 class="admh3">🎵 Canciones mandadas (${canciones.length})</h3>${canciones.length ? `<ul class="ctali">${canciones.map(d => mandada(d, "🎵", "cancion-")).join("")}</ul>` : `<p class="ctas">Se mandan desde la pestaña «Canciones».</p>`}`
    + sec(`⭐ Vídeos preparados por COMPRENDO (${prep.length})`, prep, "—");
  $$("[data-cierra]").forEach(a => a.onclick = () => C.ui.cerrar());
  if (window.LYAActividades) $$("[data-act]").forEach(el => window.LYAActividades.formDeber(el, {id: el.dataset.act, tipo: el.dataset.tipo, titulo: el.dataset.tit}));
};

/* ---------- fallos: palabras «por repasar» y preguntas más falladas ---------- */
VISTAS.fallos = () => `<h3>Palabras que más cuestan</h3>
  ${D.fallos.palabras.length ? `<p class="ctas">Palabras que los alumnos tienen marcadas «por repasar» en su diccionario (fallaron al repasarlas).</p><div class="ctatb"><table><thead><tr><th>Palabra</th><th>Alumnos</th></tr></thead><tbody>${D.fallos.palabras.slice(0, 40).map(p => `<tr><td><b>${esc(p.palabra)}</b>${p.lengua === "en" ? ' <small class="ctae">(inglés)</small>' : ""}</td><td>${p.n}</td></tr>`).join("")}</tbody></table></div>` : `<p class="ctas">Aún no hay palabras falladas.</p>`}
  <h3 style="margin-top:18px">Preguntas más falladas</h3><div id="admpq"><p class="ctas">Calculando…</p></div>`;
ACCIONES.fallos = async () => {
  const R = D.fallos.respuestas, porL = {};
  for (const k of Object.keys(R)) { const [id] = k.split(":"); (porL[id] ||= []).push(k); }
  const lect = {};
  await Promise.all(Object.keys(porL).filter(id => T[id] && T[id].file).map(id => fetch("content/" + T[id].file).then(r => r.json()).then(j => { lect[id] = j; }).catch(() => {})));
  const filas = [];
  for (const [id, ks] of Object.entries(porL)) {
    const L = lect[id]; if (!L) continue;
    for (const k of ks) {
      const m = k.match(/:(q|g)(\d+)$/), item = m[1] === "q" ? (L.q || [])[+m[2]] : ((L.grammar || {}).items || [])[+m[2]];
      if (!item) continue;
      const c = R[k], tot = Object.values(c).reduce((a, b) => a + b, 0), bien = c[item[2]] || 0, mal = tot - bien;
      if (mal > 0) filas.push({id, tipo: m[1] === "q" ? "Comprensión" : "Gramática", texto: item[0], buena: (item[1] || [])[item[2]], mal, tot, pct: Math.round(mal / tot * 100)});
    }
  }
  filas.sort((a, b) => b.mal - a.mal || b.pct - a.pct);
  const el = $d("#admpq"); if (!el) return;
  el.innerHTML = filas.length ? `<div class="ctatb"><table><thead><tr><th>Pregunta</th><th>Respuesta buena</th><th>Lectura</th><th>Tipo</th><th>Fallan</th></tr></thead><tbody>${filas.slice(0, 40).map(f => `<tr><td style="white-space:normal;min-width:220px">${esc(f.texto)}</td><td>${esc(f.buena)}</td><td>${esc(nombreL(T, f.id))}</td><td>${f.tipo}</td><td><b>${f.mal}</b> de ${f.tot} (${f.pct} %)</td></tr>`).join("")}</tbody></table></div>` : `<p class="ctas">Aún no hay preguntas falladas.</p>`;
};

/* ---------- mensajes ---------- */
VISTAS.mensajes = () => `<form id="admmc" class="admform"><label>Para<select name="para"><option value="">${esAdmin() ? "Todos los usuarios" : "Todos mis alumnos"}</option>${Object.entries(D.grupos).map(([id, g]) => `<option value="g:${esc(id)}">Clase ${esc(g.nombre)}</option>`).join("")}${D.usuarios.map(u => `<option value="u:${esc(u.usuario)}">👤 ${esc(u.usuario)}</option>`).join("")}</select></label>
  <label class="admw">Mensaje<textarea name="texto" rows="3" maxlength="500" required placeholder="Un aviso o una felicitación. Lo verán al entrar en la web."></textarea></label><button class="btn main" type="submit">✉️ Enviar</button></form>
  <h3 style="margin-top:18px">Enviados</h3>${D.enviados.length ? `<ul class="ctali">${D.enviados.map(m => `<li><p>${esc(m.texto)}</p><small>Para: ${m.para === "todos" ? "todos" : m.para.startsWith("grupo:") ? "clase " + esc(m.para.slice(6)) : "👤 " + esc(m.para)} (${m.n}) · ${fecha(m.t)}</small></li>`).join("")}</ul>` : `<p class="ctas">Todavía no has enviado mensajes.</p>`}`;
ACCIONES.mensajes = () => {
  $d("#admmc").onsubmit = async e => {
    e.preventDefault(); const f = e.target, p = f.para.value;
    const r = await hacer({accion: "mensaje", texto: f.texto.value, ...(p.startsWith("g:") ? {grupo: p.slice(2)} : p.startsWith("u:") ? {usuario: p.slice(2)} : {})}, f.querySelector("[type=submit]"));
    if (r) { await abrir("mensajes"); alerta(`✓ Enviado a ${r.n} ${r.n === 1 ? "alumno" : "alumnos"}.`); }
  };
};

/* ---------- votos ---------- */
VISTAS.votos = () => {
  const nombres = Object.fromEntries((D.temasExtra || []).map(t => [t.id, `${t.emoji} ${t.name.es}`]));
  const v = Object.entries(D.votos).sort((a, b) => b[1] - a[1]);
  return `${v.length ? `<ul class="ctali">${v.map(([k, n]) => `<li><p><b>${esc(nombres[k] || k)}</b>: ${n} ${n === 1 ? "voto" : "votos"}</p></li>`).join("")}</ul>` : `<p class="ctas">Todavía no hay votos.</p>`}
  ${(D.temasExtra || []).length ? `<h3 style="margin-top:18px">Temas añadidos desde propuestas</h3><ul class="ctali">${D.temasExtra.map(t => `<li><p>${esc(t.emoji)} <b>${esc(t.name.es)}</b>${t.desc.es ? " · " + esc(t.desc.es) : ""}</p><button type="button" class="ctal" data-quitat="${esc(t.id)}">Quitar de la votación</button></li>`).join("")}</ul>` : ""}`;
};
ACCIONES.votos = () => { $$("[data-quitat]").forEach(b => b.onclick = async () => { if (await hacer({accion: "tema_quitar", id: b.dataset.quitat}, b)) abrir("votos"); }); };

window.LYAPanelAdmin = {abrir};
})();
