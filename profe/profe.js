/* COMPRENDO · Portada del profe (#profe) y ficha de cada alumno (#profe-alumno-<usuario>).
   Lo que ve un profe al entrar: su clase en números, actividad de los últimos 14 días, a qué juegan, deberes,
   lo que más les cuesta (mates por tipo de ejercicio, lecturas y palabras) y la lista de alumnos con su ficha.
   Datos: GET /api/admin (el mismo del panel) y /api/admin?usuario=<u> para la ficha. Todo sale de la ficha de progreso
   de cada alumno, que se sobrescribe al guardar: contadores pequeños, no un historial (ver README «Portada del profe»).
   nav/nav.js la llama desde renderProfe(el) y le pasa sus tarjetas de herramientas. De momento, en castellano. */
(() => {
const C = () => window.LYACuentas || {};
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const store = {get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }};
const DIA = 864e5, hoyS = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const diaS = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const hace = t => { if (!t) return "nunca"; const d = Math.floor((Date.now() - t) / DIA); return d <= 0 ? "hoy" : d === 1 ? "ayer" : `hace ${d} días`; };
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const B = () => window.LYAMatesBanco;

let D = null, T = {}, carga = null, cuando = 0, appEl = null, herr = "";

/* nombres de los juegos (S.g.act[clave]) */
const JUEGO = {"lecturas": "📖 Lecturas", mates: "➗ Mates · práctica", "mates-grupo": "➗ Mates en grupo", duelo: "⚔️ Duelos", concurso: "🏆 Concursos", video: "📺 Vídeos con preguntas", escape: "🔐 Escape room", dictado: "✍️ Dictados",
  garabatos: "🎨 Garabatos", "garabatos-fin": "🎨 Garabatos", camara: "📷 Cámara", "camara-fin": "📷 Cámara", cancion: "🎵 Canciones", doblaje: "🎬 Doblaje", cartas: "🃏 Parejas", reloj: "⏱️ Contrarreloj", ahorcado: "🪢 Ahorcado",
  "dict-save": "📒 Guardar palabras", "gram-conj": "🔤 Conjugar", "gram-orden": "🔤 Ordenar frases", "gram-error": "🔤 Busca el error", "gram-tiempos": "🔤 Tiempos verbales", "gram-memoria": "🔤 Memoria de gramática",
  prueba: "🔎 La prueba (en grupo)", apuesta: "🎲 Apuesta (en grupo)", tabu: "🤐 Tabú (en grupo)", piloto: "🧭 Piloto (en grupo)"};
const nomJuego = k => { if (JUEGO[k]) return JUEGO[k]; const m = /^m-(\w+)/.exec(k), J = window.LYAMatesGrupo?.J; if (m && J && J[m[1]]) return `${J[m[1]].ic} ${J[m[1]].n}`; if (/^quiz-/.test(k)) return "🧠 Repasar palabras"; return "🎮 " + k.replace(/[-_]/g, " ").replace(/^./, c => c.toUpperCase()); };
/* una habilidad de mates: "t2.3.1" → apartado 3, tipo 1 */
/* el banco de cada tema: t2 (1.º ESO) en mates/banco.js, p2 (4.º ESO PDC) en mates/pdc.js */
const BT = tema => (window.LYAMatesTemas?.banco ? LYAMatesTemas.banco(tema) : null) || B();
const nomHab = k => { const [tema, ap, g] = k.split("."), b = BT(tema), pdc = tema !== "t2"; return {ap: +ap, tema, n: ((b?.HAB?.[ap] || [])[+g] || `Tipo ${g}`) + (pdc ? " (4.º PDC)" : ""), apN: (b?.NOMBRES || {})[ap] || `Apartado ${ap}`}; };
const tira = s => [...String(s || "")].map(c => c === "1" ? '<i class="pf-b" title="Bien">✓</i>' : c === "p" ? '<i class="pf-p" title="Bien, con pistas">💡</i>' : '<i class="pf-m" title="Mal">✗</i>').join("");
const bienDe = s => { s = String(s || ""); return {n: s.length, bien: (s.match(/[1p]/g) || []).length, pistas: (s.match(/p/g) || []).length, mal: (s.match(/0/g) || []).length}; };

async function cargar(forzar) {
  if (!forzar && D && Date.now() - cuando < 15e3) return D;
  carga ||= (async () => {
    try {
      await C().cargarPanel?.();
      const [r, cat] = await Promise.all([C().api("admin"), window.LYAPanelAdmin?.catalogo?.().catch(() => ({})) || {}]);
      T = cat || {}; D = r.ok ? r.j : null; cuando = Date.now();
    } finally { carga = null; }
    return D;
  })();
  return carga;
}
const clase = () => { const c = store.get("lyaProfeClase") || ""; return D && D.grupos[c] ? c : ""; };
const alumnosDe = () => D.usuarios.filter(u => u.rol !== "profe" && (!clase() || u.grupo === clase()));
const deberesDe = () => D.deberes.filter(d => !clase() || !d.grupo || d.grupo === clase());
const nomLectura = id => { const dic = /^dictado-/.test(id), x = T[dic ? id.slice(8) : id]; return x ? `${dic ? "✍️ Dictado: " : "📖 "}${x.titulo} (${x.nivel})` : id; };
const nomDeber = d => d.actividad ? `${{quiz: "🏆", video: "📺", doblaje: "🎬"}[d.tipo] || "🧩"} ${d.titulo || "Actividad"}` : d.cancion ? `${d.doblaje ? "🎬" : "🎵"} ${d.titulo || ""}` : /^mates-/.test(d.lectura) ? nomMates(d.lectura) : nomLectura(d.lectura);
const nomMates = id => { const m = /^mates-([tp]\d+)-([1-8]|repaso)-([123])$/.exec(id); if (!m) return id; const a = m[2] === "repaso" ? "Repaso del tema" : `${m[2]}. ${(BT(m[1])?.NOMBRES || {})[m[2]] || ""}`; return `➗ Mates${m[1] === "p2" ? " 4.º PDC" : ""} · ${a} · ${["", "Fácil", "Medio", "Difícil"][m[3]]}`; };

/* ---------- piezas ---------- */
const tarjeta = (ic, n, t, sub = "") => `<div class="pf-card"><span class="pf-ic">${ic}</span><b>${n}</b><span>${t}</span>${sub ? `<small>${sub}</small>` : ""}</div>`;
function barrasDias(dias, titulo) {
  const ds = []; for (let i = 13; i >= 0; i--) ds.push(diaS(Date.now() - i * DIA));
  const v = ds.map(d => dias[d] || 0), max = Math.max(1, ...v), W = 400, H = 120, bw = W / 14;
  const L = ["D", "L", "M", "X", "J", "V", "S"];
  const bars = v.map((x, i) => { const h = Math.round((H - 34) * x / max), y = H - 20 - h; return `<rect x="${i * bw + 3}" y="${y}" width="${bw - 6}" height="${Math.max(h, x ? 2 : 0)}" rx="3" class="pf-bar${i === 13 ? " hoy" : ""}"><title>${ds[i]}: ${x} XP</title></rect>${x ? `<text x="${i * bw + bw / 2}" y="${y - 4}" class="pf-bt">${x}</text>` : ""}<text x="${i * bw + bw / 2}" y="${H - 4}" class="pf-bl">${L[new Date(ds[i] + "T12:00").getDay()]}</text>`; }).join("");
  return `<figure class="pf-fig"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(titulo)}">${bars}</svg><figcaption>${esc(titulo)} · total ${v.reduce((a, b) => a + b, 0)} XP</figcaption></figure>`;
}
function barrasJuegos(act, conAlumnos) {
  const xs = Object.entries(act).sort((a, b) => b[1].n - a[1].n).slice(0, 10); if (!xs.length) return `<p class="pf-vacio">Todavía no han jugado a nada.</p>`;
  const max = xs[0][1].n;
  return `<ul class="pf-juegos">${xs.map(([k, x]) => { const res = x.ok + x.mal; return `<li><span class="pf-jn">${esc(nomJuego(k))}</span><span class="pf-jb"><i style="width:${Math.max(4, 100 * x.n / max)}%"></i></span><span class="pf-jd">${x.n} ${x.n === 1 ? "vez" : "veces"}${res ? ` · ${pct(x.ok, res)} % bien` : ""}${conAlumnos ? ` · ${x.al} ${x.al === 1 ? "alumno" : "alumnos"}` : ""}${!conAlumnos && x.t ? ` · ${hace(x.t)}` : ""}</span></li>`; }).join("")}</ul>`;
}
/* habilidades de mates ordenadas de peor a mejor (mínimo 3 intentos) */
function cuestan(mhs, min = 3) {
  const m = {};
  for (const mh of mhs) for (const [k, s] of Object.entries(mh || {})) { const b = bienDe(s), x = m[k] ||= {n: 0, bien: 0, pistas: 0, al: 0, flojos: 0}; x.n += b.n; x.bien += b.bien; x.pistas += b.pistas; x.al++; if (b.n >= 3 && b.bien / b.n < .6) x.flojos++; }
  return Object.entries(m).filter(([, x]) => x.n >= min).map(([k, x]) => ({k, ...x, p: pct(x.bien, x.n), ...nomHab(k)})).sort((a, b) => a.p - b.p || b.n - a.n);
}

/* ---------- portada ---------- */
async function portada(app) {
  app.innerHTML = `<section class="wrap pf"><h1 class="pf-h1">🧑‍🏫 Mi clase</h1><p class="pf-sub">Cargando…</p></section>`;
  await cargar();
  if (!D) { app.innerHTML = `<section class="wrap pf"><h1 class="pf-h1">🧑‍🏫 Mi clase</h1><p class="pf-sub">No se ha podido cargar. Vuelve a entrar en tu cuenta.</p>${herr}</section>`; return; }
  const A = alumnosDe(), Ds = deberesDe(), gs = Object.entries(D.grupos), adm = D.soy && D.soy.admin, h = hoyS();
  const semana = Date.now() - 7 * DIA, activos = A.filter(u => u.ultimo > semana).length;
  const dias = {}; for (const u of A) for (const [d, x] of Object.entries(u.dias || {})) dias[d] = (dias[d] || 0) + x;
  const xpSemana = Object.entries(dias).filter(([d]) => d > diaS(semana)).reduce((a, [, x]) => a + x, 0);
  const act = {}; for (const u of A) for (const [k, x] of Object.entries(u.act || {})) { const kk = /^(garabatos|camara)-fin$/.test(k) ? k.slice(0, -4) : k, y = act[kk] ||= {n: 0, ok: 0, mal: 0, al: 0}; y.n += x.n || 0; y.ok += x.ok || 0; y.mal += x.mal || 0; y.al++; }
  const lect = A.reduce((n, u) => n + (u.veces || 0), 0); if (lect) act.lecturas = {n: lect, ok: 0, mal: 0, al: A.filter(u => u.veces).length};
  const vivos = Ds.filter(d => d.limite >= h), hechosV = vivos.reduce((n, d) => n + d.alumnos.filter(a => a.hecho).length, 0), totV = vivos.reduce((n, d) => n + d.alumnos.length, 0);
  const cuesta = cuestan(A.map(u => u.mh)).filter(x => x.p < 85).slice(0, 5);
  const lecturasFl = {}; for (const u of A) for (const [id, [p, nf]] of Object.entries(u.ult || {})) { const x = lecturasFl[id] ||= {n: 0, p: 0, nf: 0}; x.n++; x.p += p; x.nf += nf; }
  const malL = Object.entries(lecturasFl).map(([id, x]) => ({id, n: x.n, p: Math.round(x.p / x.n), nf: x.nf})).filter(x => x.p < 80).sort((a, b) => a.p - b.p).slice(0, 4);
  const palabras = (D.fallos?.palabras || []).slice(0, 10);
  const filas = A.map(u => { const c = cuestan([u.mh], 3)[0], dh = Ds.filter(d => d.alumnos.some(a => a.usuario === u.usuario)), dok = dh.filter(d => d.alumnos.find(a => a.usuario === u.usuario)?.hecho).length;
    const xs = Object.entries(u.dias || {}).filter(([d]) => d > diaS(semana)).reduce((a, [, x]) => a + x, 0), mt = bienDe(Object.values(u.mh || {}).join(""));
    return {u, c, dh: dh.length, dok, xs, mt}; }).sort((a, b) => b.u.ultimo - a.u.ultimo);
  const cod = clase() ? D.grupos[clase()].codigo : "";

  app.innerHTML = `<section class="wrap pf">
    <div class="pf-top"><div><h1 class="pf-h1">${adm ? "🛠 Toda la web" : "🧑‍🏫 Mi clase"}</h1><p class="pf-sub">Hola, ${esc(D.soy.usuario)}. Esto es lo que está pasando ${clase() ? "en " + esc(D.grupos[clase()].nombre) : adm ? "en la web" : "en tus clases"}.</p></div>
      ${gs.length ? `<label class="pf-sel">Clase <select id="pfcl"><option value="">${adm ? "Todos" : "Todas mis clases"}</option>${gs.map(([id, g]) => `<option value="${esc(id)}"${id === clase() ? " selected" : ""}>${esc(g.nombre)}</option>`).join("")}</select></label>` : ""}</div>
    ${!gs.length ? `<div class="pf-aviso">👋 Empieza creando una clase. Da su código a tus alumnos: lo ponen al crear su cuenta o en «Mi cuenta». <button class="btn main" type="button" data-pf="panel" data-tab="clases">🏫 Crear una clase</button></div>` : ""}
    ${cod ? `<p class="pf-cod">Código de la clase: <b>${esc(cod)}</b> <small>(tus alumnos lo ponen en «Mi cuenta»)</small></p>` : ""}
    <div class="pf-acc">
      <button class="btn main" type="button" data-pf="panel" data-tab="deberes">📚 Mandar deberes</button>
      <a class="btn" href="#concursos-crear">🏆 Crear un concurso</a>
      <a class="btn" href="#grupo">🏫 Jugar en clase</a>
      <a class="btn" href="#mates-grupo">➗ Mates en grupo</a>
      <button class="btn" type="button" data-pf="panel" data-tab="mensajes">✉️ Mensaje a la clase</button>
      <button class="btn" type="button" data-pf="alumno-vista">👀 Ver la web como un alumno</button>
    </div>
    <div class="pf-cards">
      ${tarjeta("🎒", A.length, A.length === 1 ? "alumno" : "alumnos", `${activos} han entrado esta semana`)}
      ${tarjeta("⚡", xpSemana, "XP esta semana", A.length ? `${Math.round(xpSemana / A.length)} por alumno` : "")}
      ${tarjeta("📚", totV ? pct(hechosV, totV) + " %" : "—", "deberes hechos", vivos.length ? `${vivos.length} ${vivos.length === 1 ? "deber" : "deberes"} en plazo` : "ninguno en plazo")}
      ${tarjeta("📖", A.reduce((n, u) => n + (u.terminadas || 0), 0), "lecturas terminadas", `${A.reduce((n, u) => n + (u.estrellas || 0), 0)} ⭐ en total`)}
    </div>
    <div class="pf-grid">
      <section class="pf-box"><h2>📈 Actividad de la clase</h2>${barrasDias(dias, "XP de la clase en los últimos 14 días")}</section>
      <section class="pf-box"><h2>🎮 ¿A qué juegan?</h2>${barrasJuegos(act, true)}</section>
      <section class="pf-box"><h2>📚 Deberes</h2>${Ds.length ? `<ul class="pf-deb">${[...Ds].sort((a, b) => b.limite.localeCompare(a.limite)).slice(0, 6).map(d => { const ok = d.alumnos.filter(a => a.hecho).length, falta = d.alumnos.filter(a => !a.hecho).map(a => a.usuario);
          return `<li><b>${esc(nomDeber(d))}</b><span class="pf-jb"><i style="width:${pct(ok, d.alumnos.length)}%"></i></span><small>${ok} de ${d.alumnos.length} · hasta el ${esc(d.limite.split("-").reverse().join("/"))}${d.limite < h ? " (acabado)" : ""}${falta.length && falta.length <= 6 ? ` · faltan: ${falta.map(esc).join(", ")}` : falta.length ? ` · faltan ${falta.length}` : ""}</small></li>`; }).join("")}</ul>` : `<p class="pf-vacio">No has mandado deberes.</p>`}
        <p><button class="btn" type="button" data-pf="panel" data-tab="deberes">📚 Ver y mandar deberes</button></p></section>
      <section class="pf-box"><h2>🧩 Lo que más les cuesta</h2>
        ${cuesta.length ? `<h3>➗ Mates (últimos intentos)</h3><ul class="pf-cuesta">${cuesta.map(x => `<li><b>${esc(x.n)}</b> <small>${esc(x.apN)}</small><span class="pf-jb mal"><i style="width:${x.p}%"></i></span><small>${x.p} % bien${x.pistas ? ` · ${x.pistas} con pistas` : ""}${x.flojos ? ` · flojos: ${x.flojos} ${x.flojos === 1 ? "alumno" : "alumnos"}` : ""}</small></li>`).join("")}</ul>` : ""}
        ${malL.length ? `<h3>📖 Lecturas (último intento)</h3><ul class="pf-cuesta">${malL.map(x => `<li><b>${esc(nomLectura(x.id))}</b><span class="pf-jb mal"><i style="width:${x.p}%"></i></span><small>${x.p} % de media · ${x.nf} preguntas falladas entre ${x.n} ${x.n === 1 ? "alumno" : "alumnos"}</small></li>`).join("")}</ul>` : ""}
        ${palabras.length ? `<h3>🔤 Palabras que se les olvidan</h3><p class="pf-pal">${palabras.map(p => `<span>${esc(p.palabra)} <small>×${p.n}</small></span>`).join("")}</p>` : ""}
        ${!cuesta.length && !malL.length && !palabras.length ? `<p class="pf-vacio">Aún no hay datos: saldrán cuando practiquen.</p>` : ""}
        <p><button class="btn" type="button" data-pf="panel" data-tab="fallos">❌ Ver todas las preguntas falladas</button></p></section>
    </div>
    <section class="pf-box"><h2>🎒 Alumnos <small>(toca uno para ver su ficha)</small></h2>
      ${filas.length ? `<div class="pf-tb"><table><thead><tr><th>Alumno</th><th>Última vez</th><th>XP semana</th><th>Deberes</th><th>Lecturas</th><th>Mates</th><th>Le cuesta</th></tr></thead><tbody>${filas.map(({u, c, dh, dok, xs, mt}) => `<tr class="${u.ultimo < semana ? "pf-dormido" : ""}" data-pf="ficha" data-u="${esc(u.usuario)}" tabindex="0">
        <td><b>${esc(u.usuario)}</b>${!clase() && u.grupo && D.grupos[u.grupo] ? `<small>${esc(D.grupos[u.grupo].nombre)}</small>` : ""}</td><td>${hace(u.ultimo)}</td><td>${xs}</td><td>${dh ? `${dok}/${dh}` : "—"}</td><td>${u.terminadas} · ${u.estrellas} ⭐</td><td>${mt.n ? `${pct(mt.bien, mt.n)} %` : "—"}</td><td>${c && c.p < 70 ? esc(c.n) : "—"}</td></tr>`).join("")}</tbody></table></div>`
        : `<p class="pf-vacio">Todavía no tienes alumnos. ${cod ? `Dales el código <b>${esc(cod)}</b>.` : "Crea una clase y dales su código."}</p>`}
    </section>
    <h2 class="pf-h2">🧰 Herramientas</h2>
    <div class="pf-herr">${herr}</div>
  </section>`;
}

/* ---------- ficha de un alumno ---------- */
async function ficha(app, u) {
  app.innerHTML = `<section class="wrap pf"><p class="pf-migas"><a href="#profe">← Mi clase</a></p><h1 class="pf-h1">👤 ${esc(u)}</h1><p class="pf-sub">Cargando…</p></section>`;
  await cargar();
  const r = await C().api("admin?usuario=" + encodeURIComponent(u)).catch(() => ({ok: false}));
  if (!r.ok || !D) { app.querySelector(".pf-sub").textContent = "No se ha podido cargar."; return; }
  const {resumen: R, lecturas, palabras} = r.j, h = hoyS();
  const Ds = D.deberes.filter(d => d.alumnos.some(a => a.usuario === u)).map(d => ({d, a: d.alumnos.find(a => a.usuario === u)})).sort((a, b) => b.d.limite.localeCompare(a.d.limite));
  const pend = Ds.filter(x => !x.a.hecho && x.d.limite >= h), tarde = Ds.filter(x => !x.a.hecho && x.d.limite < h);
  const habs = cuestan([R.mh], 1), flojas = habs.filter(x => x.p < 70).slice(0, 5);
  const xs = Object.entries(R.dias || {}).filter(([d]) => d > diaS(Date.now() - 7 * DIA)).reduce((a, [, x]) => a + x, 0);
  /* mates por apartado: estrellas por dificultad (R.mates: "mates-t2-3-2" → {...}) y % de los últimos intentos */
  const porAp = {}; for (const [k, v] of Object.entries(R.mates || {})) { const m = /^mates-([tp]\d+)-([1-8]|repaso)-([123])$/.exec(k); if (m) (porAp[`${m[1]}-${m[2]}`] ||= {})[m[3]] = v; }
  for (const x of habs) (porAp[`${x.tema}-${x.ap}`] ||= {});
  const apNom = k => { const [tema, ap] = k.split("-"), pdc = tema !== "t2" ? "4.º PDC · " : ""; return ap === "repaso" ? `🔁 ${pdc}Repaso` : `${pdc}${ap}. ${(BT(tema)?.NOMBRES || {})[ap] || ""}`; };
  const L = lecturas.filter(l => l.terminada).map(l => ({...l, m: T[l.id] || {titulo: l.id, nivel: ""}})).sort((a, b) => (b.cuando || 0) - (a.cuando || 0));
  const pal = palabras.filter(p => p.fallo);
  app.innerHTML = `<section class="wrap pf">
    <p class="pf-migas"><a href="#profe">← Mi clase</a></p>
    <div class="pf-top"><div><h1 class="pf-h1">👤 ${esc(u)}</h1><p class="pf-sub">${R.grupo && D.grupos[R.grupo] ? esc(D.grupos[R.grupo].nombre) + " · " : ""}Última vez: ${hace(R.ultimo)}${R.idioma ? ` · aprende ${esc(R.idioma.toUpperCase())}` : ""}</p></div>
      <button class="btn" type="button" data-pf="usuario" data-u="${esc(u)}">⚙️ Contraseña y mensajes</button>${window.LYAPerfiles ? ` <button class="btn" type="button" data-perfil="${esc(u)}">🧩 Dificultades</button>` : ""}</div>
    <div class="pf-cards">
      ${tarjeta("⚡", R.xp, "XP en total", `${xs} esta semana`)}
      ${tarjeta("🔥", R.racha, "días seguidos", `mejor racha: ${R.mejorRacha}`)}
      ${tarjeta("📚", Ds.length ? `${Ds.length - pend.length - tarde.length}/${Ds.length}` : "—", "deberes hechos", pend.length ? `${pend.length} por hacer` : tarde.length ? `${tarde.length} sin hacer a tiempo` : "al día")}
      ${tarjeta("📖", R.terminadas, "lecturas terminadas", `${R.estrellas} ⭐ · ${R.tres} con 3`)}
    </div>
    ${flojas.length ? `<div class="pf-aviso">🧩 <b>Le cuesta ahora:</b> ${flojas.map(x => `${esc(x.n)} (${x.p} %)`).join(", ")}.</div>` : ""}
    <div class="pf-grid">
      <section class="pf-box"><h2>📈 Su actividad</h2>${barrasDias(R.dias || {}, "XP en los últimos 14 días")}</section>
      <section class="pf-box"><h2>🎮 A qué juega</h2>${barrasJuegos(R.act || {}, false)}</section>
      <section class="pf-box"><h2>📚 Deberes</h2>${Ds.length ? `<ul class="pf-deb">${Ds.slice(0, 10).map(({d, a}) => `<li class="${a.hecho ? "ok" : d.limite < h ? "tarde" : ""}"><b>${a.hecho ? "✅" : d.limite < h ? "⏰" : "⬜"} ${esc(nomDeber(d))}</b><small>${a.hecho ? `${"★".repeat(a.estrellas)}${"☆".repeat(3 - a.estrellas)}${a.tot ? ` · ${a.ok}/${a.tot}` : ""}` : d.limite < h ? "No lo hizo a tiempo" : "Por hacer"} · hasta el ${esc(d.limite.split("-").reverse().join("/"))}</small>${a.mal && a.mal.length ? `<small class="pf-mal">Falló: ${a.mal.slice(0, 4).map(esc).join(" · ")}</small>` : ""}</li>`).join("")}</ul>` : `<p class="pf-vacio">No tiene deberes.</p>`}</section>
      <section class="pf-box"><h2>➗ Mates</h2>${Object.keys(porAp).length ? `<ul class="pf-mates">${Object.keys(porAp).sort().map(ap => { const e = porAp[ap], hs = habs.filter(x => `${x.tema}-${x.ap}` === ap);
          return `<li><b>${esc(apNom(ap))}</b><small>${[1, 2, 3].map(d => e[d] ? `${["", "Fácil", "Medio", "Difícil"][d]} ${"★".repeat(e[d].best)}${"☆".repeat(3 - e[d].best)} ${e[d].ok}/${e[d].tot}${e[d].pi ? ` · ${e[d].pi} 💡` : ""}` : "").filter(Boolean).join(" · ") || "Practicado en grupo o en otros apartados"}</small>
            ${hs.map(x => `<div class="pf-hab"><span>${esc(x.n)}</span><span class="pf-tira">${tira((R.mh || {})[x.k])}</span></div>`).join("")}</li>`; }).join("")}</ul><p class="pf-ley"><i class="pf-b">✓</i> bien · <i class="pf-p">💡</i> bien con pistas · <i class="pf-m">✗</i> mal (los 10 últimos de cada tipo; los antiguos se borran solos)</p>` : `<p class="pf-vacio">Todavía no ha practicado mates.</p>`}</section>
      <section class="pf-box"><h2>📖 Lecturas</h2>${L.length ? `<ul class="pf-lect">${L.slice(0, 12).map(l => { const nf = (l.fq || []).length + (l.fg || []).length;
          return `<li><b>${esc(l.m.titulo)} <small>${esc(l.m.nivel || "")}</small></b><small>${"★".repeat(l.estrellas)}${"☆".repeat(3 - l.estrellas)} · ${l.veces} ${l.veces === 1 ? "vez" : "veces"}${l.pct !== null ? ` · última: ${l.pct} %` : ""}${l.fq ? ` · ${nf ? `${nf} ${nf === 1 ? "pregunta fallada" : "preguntas falladas"}` : "sin fallos"}${l.fv ? ` · ${l.fv} de vocabulario` : ""}` : ""}</small>
            ${nf && l.m.file ? `<details class="pf-det" data-file="${esc(l.m.file)}" data-fq="${esc((l.fq || []).join(","))}" data-fg="${esc((l.fg || []).join(","))}"><summary>Ver qué falló</summary><div>Cargando…</div></details>` : ""}</li>`; }).join("")}</ul>` : `<p class="pf-vacio">Todavía no ha terminado ninguna lectura.</p>`}</section>
      <section class="pf-box"><h2>🔤 Palabras que se le olvidan</h2>${pal.length ? `<p class="pf-pal">${pal.slice(0, 30).map(p => `<span>${esc(p.palabra)}</span>`).join("")}</p>` : `<p class="pf-vacio">Ninguna marcada.</p>`}</section>
    </div></section>`;
}
/* las preguntas falladas de una lectura: se leen del archivo de la lectura (no se guardan en la base de datos) */
document.addEventListener("toggle", async e => {
  const d = e.target; if (!d.matches?.(".pf-det[data-file]") || !d.open || d.dataset.ok) return;
  d.dataset.ok = 1;
  try {
    const L = await fetch("content/" + d.dataset.file).then(r => r.json()), ids = s => s ? s.split(",").map(Number) : [];
    const li = (q, tit) => q ? `<li><span>${esc(tit)}</span> ${esc(q[0])} <small>→ ${esc(q[1][q[2]])}</small></li>` : "";
    d.querySelector("div").innerHTML = `<ul>${ids(d.dataset.fq).map(i => li(L.q[i], "Comprensión:")).join("")}${ids(d.dataset.fg).map(i => li(L.grammar?.items?.[i], "Gramática:")).join("")}</ul><small>→ la respuesta buena</small>`;
  } catch (er) { d.querySelector("div").textContent = "No se ha podido cargar la lectura."; }
}, true);

/* ---------- eventos ---------- */
document.addEventListener("change", e => { if (e.target.id === "pfcl") { store.set("lyaProfeClase", e.target.value); if (appEl) render(appEl, herr); } });
document.addEventListener("click", e => {
  const b = e.target.closest("[data-pf]"); if (!b || !b.closest(".pf")) return;
  const a = b.dataset.pf;
  if (a === "panel") C().panel?.(b.dataset.tab);
  else if (a === "ficha") location.hash = "profe-alumno-" + encodeURIComponent(b.dataset.u);
  else if (a === "usuario") C().cargarPanel?.().then(() => window.LYAPanelAdmin?.usuario(b.dataset.u));
  else if (a === "alumno-vista") { try { sessionStorage.setItem("lyaVerAlumno", "1"); } catch (er) {} location.hash = "inicio"; }
});
document.addEventListener("keydown", e => { const tr = e.target.closest?.("tr[data-pf=ficha]"); if (tr && e.key === "Enter") location.hash = "profe-alumno-" + encodeURIComponent(tr.dataset.u); });

/* el profe entra en Inicio → su portada (salvo si ha pedido ver la web como un alumno) */
const verComoAlumno = () => { try { return sessionStorage.getItem("lyaVerAlumno") === "1"; } catch (e) { return false; } };
const esProfe = () => { const r = C().rol; return r === "profe" || r === "admin"; };
const banda = () => esProfe() && verComoAlumno() ? `<p class="pf-banda">👀 Estás viendo la web como un alumno. <button type="button" class="btn" data-pfb="volver">🧑‍🏫 Volver a mi clase</button></p>` : "";
document.addEventListener("click", e => { if (e.target.closest("[data-pfb=volver]")) { try { sessionStorage.removeItem("lyaVerAlumno"); } catch (er) {} location.hash = "profe"; } });

function render(app, herramientas) {
  appEl = app; if (herramientas !== undefined) herr = herramientas;
  const m = location.hash.slice(1).match(/^profe-alumno-(.+)$/);
  if (m) return ficha(app, decodeURIComponent(m[1]));
  return portada(app);
}
window.LYAProfe = {render, verComoAlumno, esProfe, banda, recargar: () => { cuando = 0; }, _cuestan: cuestan};
})();
