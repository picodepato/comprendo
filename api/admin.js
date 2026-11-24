/* Panel del administrador y de los profes (un profe solo ve y gestiona sus clases y sus alumnos).
   GET  /api/admin                → propuestas, usuarios (resumen), grupos, deberes (quién los ha hecho), fallos, votos, temas añadidos
   GET  /api/admin?usuario=x      → detalle de un usuario, lectura por lectura
   POST /api/admin {accion, ...}  → grupo_crear, grupo_borrar, grupo_asignar, deber_crear, deber_borrar, clave, borrar_usuario,
                                    mensaje, propuesta_aprobar, tema_quitar */
import { redis, quienPanel, claveAdminPorDefecto, normUsuario, claveValida, hashClave, cerrarSesiones, leerJSON, guardarJSON, leerGrupos, normCodigo, codigoValido, nuevoId, ADMIN, responder, cuerpo, seguro } from "./_db.js";
import { leerPropuestas } from "./propuestas.js";

/* estado guardado por la web: S.a = respuestas ("<lectura>:q0", "<lectura>:g0"…, "<lectura>:fin" al terminar), S.g.rd[lectura] = {n veces, best estrellas, bp mejor %, last} */
const empezadas = s => { const m = {}; for (const k of Object.keys((s && s.a) || {})) { const [id, ex] = k.split(":"); if (ex !== "fin") m[id] = (m[id] || 0) + 1; } return m; };
function resumen(u, d, p, grupo) {
  const s = p.s || {}, g = s.g || {}, rd = g.rd || {}, emp = empezadas(s), fin = Object.keys(rd);
  return { usuario: u, rol: d.rol || "alumno", idioma: s.learn || null, grupo: grupo || null, creado: d.creado || 0, ultimo: p.t || 0, xp: g.xp || 0, racha: g.streak || 0, mejorRacha: g.best || 0,
    terminadas: fin.length, empezadas: Object.keys(emp).filter(id => !rd[id]).length, veces: fin.reduce((n, id) => n + (rd[id].n || 0), 0),
    estrellas: fin.reduce((n, id) => n + (rd[id].best || 0), 0), tres: fin.filter(id => rd[id].best === 3).length,
    cromos: Object.keys(g.album || {}).length, medallas: Object.keys(g.medals || {}).length, palabras: (s.dict || []).length,
    lecturas: Object.fromEntries(fin.map(id => [id, rd[id].best || 0])) };
}
const leer = x => { try { return JSON.parse(x || "null") || {}; } catch (e) { return {}; } };
/* qué ve cada uno: el admin todo; un profe sus clases y los alumnos que están en ellas */
function alcance(yo, G) {
  const grupos = yo.admin ? Object.keys(G.grupos) : Object.keys(G.grupos).filter(id => G.grupos[id].profe === yo.usuario);
  const set = new Set(grupos);
  return { grupos, esMio: id => set.has(id), alumnos: yo.admin ? null : Object.keys(G.miembros).filter(u => set.has(G.miembros[u])) };
}
async function todos(nombres0) {
  const nombres = (nombres0 || (await redis("SMEMBERS", "usuarios")) || []).sort(), out = [];
  for (let i = 0; i < nombres.length; i += 50) {
    const grupo = nombres.slice(i, i + 50);
    const [datos, progresos] = await Promise.all([redis("MGET", ...grupo.map(u => "usuario:" + u)), redis("MGET", ...grupo.map(u => "progreso:" + u))]);
    grupo.forEach((u, j) => out.push({ u, d: leer(datos[j]), p: leer(progresos[j]) }));
  }
  return out;
}
/* respuestas de todos (para ver qué preguntas se fallan) y palabras marcadas «por repasar» */
function fallos(lista) {
  const respuestas = {}, palabras = {};
  for (const { p } of lista) {
    const s = p.s || {};
    for (const [k, v] of Object.entries(s.a || {})) if (/:(q|g)\d+$/.test(k) && (typeof v === "number" || typeof v === "string")) { const r = respuestas[k] ||= {}; r[v] = (r[v] || 0) + 1; }
    for (const d of s.dict || []) if (d && d.miss) { const w = String(d.w || d.k || "").toLowerCase(); if (w) { const x = palabras[w] ||= { palabra: d.w, lengua: d.l, n: 0 }; x.n++; } }
  }
  return { respuestas, palabras: Object.values(palabras).sort((a, b) => b.n - a.n).slice(0, 100) };
}

const SOLO_ADMIN = ["borrar_usuario", "propuesta_aprobar", "tema_quitar"];
async function accion(b, yo) {
  const G = await leerGrupos(), A = alcance(yo, G);
  const u = normUsuario(b.usuario);
  if (!yo.admin && SOLO_ADMIN.includes(b.accion)) return [403, "solo_admin"];
  /* un profe solo toca a sus alumnos y sus clases */
  const alumnoMio = x => yo.admin || A.alumnos.includes(x);
  if (b.usuario && !alumnoMio(u)) return [403, "no_es_tu_alumno"];
  if (b.grupo && !A.esMio(b.grupo)) return [403, "no_es_tu_clase"];
  switch (b.accion) {
    case "grupo_crear": {
      const nombre = String(b.nombre || "").trim().slice(0, 40); if (!nombre) return [400, "falta_nombre"];
      const codigo = normCodigo(b.codigo || nombre); if (!codigoValido(codigo)) return [400, "codigo_no_valido"];
      if (Object.values(G.grupos).some(g => g.codigo === codigo)) return [409, "codigo_ocupado"];
      const id = nuevoId(); G.grupos[id] = { nombre, codigo, profe: yo.admin ? null : yo.usuario }; await guardarJSON("admin:grupos", G); return [200, { id, codigo }];
    }
    case "grupo_borrar": {
      if (!A.esMio(b.id)) return [403, "no_es_tu_clase"];
      delete G.grupos[b.id]; for (const k in G.miembros) if (G.miembros[k] === b.id) delete G.miembros[k];
      await guardarJSON("admin:grupos", G); return [200, {}];
    }
    case "grupo_asignar": {
      if (!(await redis("GET", "usuario:" + u))) return [404, "no_existe"];
      if (b.grupo && G.grupos[b.grupo]) G.miembros[u] = b.grupo; else delete G.miembros[u];  /* un profe puede sacar a un alumno de su clase */
      await guardarJSON("admin:grupos", G); return [200, {}];
    }
    case "deber_crear": {
      const lectura = String(b.lectura || ""), limite = String(b.limite || "");
      if (!/^[a-z0-9-]{3,40}$/.test(lectura) || !/^\d{4}-\d{2}-\d{2}$/.test(limite)) return [400, "datos_no_validos"];
      const D = await leerJSON("admin:deberes", []);
      if (!yo.admin && !A.grupos.length) return [400, "sin_clases"];
      D.push({ id: nuevoId(), lectura, grupo: b.grupo && G.grupos[b.grupo] ? b.grupo : null, profe: yo.admin ? null : yo.usuario, limite, nota: String(b.nota || "").slice(0, 200), creado: Date.now() });
      await guardarJSON("admin:deberes", D); return [200, {}];
    }
    case "deber_borrar": { const D = await leerJSON("admin:deberes", []); await guardarJSON("admin:deberes", D.filter(d => d.id !== b.id || (!yo.admin && d.profe !== yo.usuario))); return [200, {}]; }
    case "clave": {
      if (!claveValida(b.nueva)) return [400, "clave_corta"];
      const d = leer(await redis("GET", "usuario:" + u)); if (!d.hash) return [404, "no_existe"];
      await redis("SET", "usuario:" + u, JSON.stringify({ ...d, ...hashClave(b.nueva) })); await cerrarSesiones(u); return [200, {}];
    }
    case "borrar_usuario": {
      if (!u || u === ADMIN) return [400, "no_valido"];
      await cerrarSesiones(u);
      await redis("DEL", "usuario:" + u, "progreso:" + u, "mensajes:" + u, "leidos:" + u);
      await redis("SREM", "usuarios", u);
      if (G.miembros[u]) { delete G.miembros[u]; await guardarJSON("admin:grupos", G); }
      return [200, {}];
    }
    case "mensaje": {
      const texto = String(b.texto || "").trim().slice(0, 500); if (!texto) return [400, "falta_texto"];
      let para = [];
      if (b.usuario) para = [u];
      else if (b.grupo) para = Object.keys(G.miembros).filter(k => G.miembros[k] === b.grupo);
      else para = yo.admin ? (await redis("SMEMBERS", "usuarios")) || [] : A.alumnos;
      const m = JSON.stringify({ id: nuevoId(), texto, t: Date.now(), de: yo.admin ? null : yo.usuario });
      for (const x of para) { await redis("LPUSH", "mensajes:" + x, m); await redis("LTRIM", "mensajes:" + x, 0, 49); }
      const ke = "enviados:" + yo.usuario, env = await leerJSON(ke, []); env.unshift({ texto, t: Date.now(), para: b.usuario ? u : b.grupo ? "grupo:" + ((G.grupos[b.grupo] || {}).nombre || "") : "todos", n: para.length });
      await guardarJSON(ke, env.slice(0, 50)); return [200, { n: para.length }];
    }
    case "propuesta_aprobar": {
      const es = String(b.nombre_es || "").trim().slice(0, 40); if (!es) return [400, "falta_nombre"];
      const T = await leerJSON("temas:extra", []);
      const id = "p-" + nuevoId();
      T.push({ id, emoji: String(b.emoji || "💡").slice(0, 8), color: /^#[0-9a-f]{6}$/i.test(b.color || "") ? b.color : "#ffb020",
        name: { es, en: String(b.nombre_en || es).trim().slice(0, 40) }, desc: { es: String(b.desc_es || "").slice(0, 120), en: String(b.desc_en || b.desc_es || "").slice(0, 120) } });
      await guardarJSON("temas:extra", T);
      if (b.id) { const todas = (await redis("LRANGE", "propuestas", 0, -1)) || []; const q = todas.find(x => { try { return JSON.parse(x).id === b.id; } catch (e) { return false; } }); if (q) await redis("LREM", "propuestas", 1, q); }
      return [200, { id }];
    }
    case "tema_quitar": { const T = await leerJSON("temas:extra", []); await guardarJSON("temas:extra", T.filter(t => t.id !== b.id)); return [200, {}]; }
  }
  return [400, "accion_desconocida"];
}

export default (req, res) => seguro(res, async () => {
  const yo = await quienPanel(req);
  if (!yo) return responder(res, 403, { error: "solo_admin" });
  if (req.method === "POST") { const [c, r] = await accion(cuerpo(req), yo); return responder(res, c, typeof r === "string" ? { error: r } : { ok: true, ...r }); }
  const q = new URL(req.url || "/", "http://x").searchParams.get("usuario") ?? (req.query || {}).usuario;
  const G = await leerGrupos(), A = alcance(yo, G);
  if (q) {
    const u = normUsuario(q);
    if (!yo.admin && !A.alumnos.includes(u)) return responder(res, 403, { error: "no_es_tu_alumno" });
    const [d, p] = await redis("MGET", "usuario:" + u, "progreso:" + u);
    if (!d) return responder(res, 404, { error: "no_existe" });
    const P = leer(p), s = P.s || {}, rd = ((s.g || {}).rd) || {}, emp = empezadas(s);
    const ids = [...new Set([...Object.keys(rd), ...Object.keys(emp)])];
    const lecturas = ids.map(id => ({ id, veces: (rd[id] || {}).n || 0, estrellas: (rd[id] || {}).best || 0, ultima: (rd[id] || {}).last ?? null, mejorPct: (rd[id] || {}).bp || 0, respuestas: emp[id] || 0, terminada: !!rd[id] }));
    const palabras = (s.dict || []).map(x => ({ palabra: x.w, lengua: x.l, fallo: !!x.miss }));
    const mensajes = ((await redis("LRANGE", "mensajes:" + u, 0, 19)) || []).map(x => leer(x));
    return responder(res, 200, { resumen: resumen(u, leer(d), P, G.miembros[u]), lecturas, palabras, mensajes, grupos: Object.fromEntries(A.grupos.map(id => [id, G.grupos[id]])) });
  }
  const lista = await todos(yo.admin ? null : A.alumnos);
  const usuarios = lista.map(({ u, d, p }) => resumen(u, d, p, G.miembros[u]));
  const alumnos = usuarios.filter(x => x.rol !== "profe");
  const porU = Object.fromEntries(usuarios.map(x => [x.usuario, x]));
  const misGrupos = Object.fromEntries(A.grupos.map(id => [id, { ...G.grupos[id], alumnos: Object.keys(G.miembros).filter(k => G.miembros[k] === id).length }]));
  const deberes = (await leerJSON("admin:deberes", [])).filter(d => yo.admin || d.profe === yo.usuario).map(d => {
    const para = alumnos.filter(x => d.grupo ? x.grupo === d.grupo : !d.profe || (x.grupo && (G.grupos[x.grupo] || {}).profe === d.profe)).map(x => x.usuario);
    return { ...d, alumnos: para.map(u => ({ usuario: u, hecho: porU[u].lecturas[d.lectura] !== undefined, estrellas: porU[u].lecturas[d.lectura] || 0 })) };
  });
  const base = { soy: yo, usuarios, grupos: misGrupos, deberes, fallos: fallos(lista.filter(x => (x.d.rol || "alumno") !== "profe")), enviados: await leerJSON("enviados:" + yo.usuario, []) };
  if (!yo.admin) return responder(res, 200, { ...base, propuestas: [], votos: {}, temasExtra: [] });
  const claves = (await redis("KEYS", "votos:*")) || [];
  const cuentas = claves.length ? await redis("MGET", ...claves) : [];
  const votos = Object.fromEntries(claves.map((k, i) => [k.slice(6), +cuentas[i] || 0]));
  responder(res, 200, { ...base, propuestas: await leerPropuestas(), votos, temasExtra: await leerJSON("temas:extra", []), claveAdminPorDefecto: claveAdminPorDefecto() });
});
