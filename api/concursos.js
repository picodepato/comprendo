/* Concursos: preguntas tipo test que se juegan en directo (pantalla grande + móviles) o a solas.
   Concursos guardados (hace falta cuenta para guardar; para jugar, no):
     GET  ?id=X                       → un concurso (cualquiera con el enlace o el código)
     GET  ?mios=1                     → mis concursos [{id, titulo, n, f}]
     POST {accion:"guardar", concurso:{titulo, preguntas}, id?} → guarda (o cambia el mío) → {id}
     POST {accion:"borrar", id}       → borra el mío (o cualquiera, el admin)
   Partidas en directo (código de 6 cifras, máx. 30 jugadores, caducan a las 4 horas):
     POST {accion:"abrir", id | concurso}            → {codigo, clave}  (la clave solo la tiene quien proyecta)
     POST {accion:"entrar", codigo, nombre}          → {pid}
     POST {accion:"responder", codigo, pid, i, o}    → {ok}   (el tiempo lo mide el servidor)
     POST {accion:"pasar", codigo, clave}            → espera/resultado → siguiente pregunta (3 s de cuenta atrás);
                                                       pregunta → cerrar y puntuar; última → fin
     POST {accion:"echar", codigo, clave, nombre}    → quita a un jugador
     POST {accion:"cerrarsala", codigo, clave}       → borra la partida
     GET  ?sala=CODIGO                               → estado público. Vercel lo guarda 1 s y lo comparte entre
                                                       todos los móviles: da igual 5 que 30 jugadores mirando.
     GET  ?sala=CODIGO&clave=K                       → lo mismo sin caché + cuántos han contestado (pantalla grande)
   Vídeos con preguntas (tipo "video"): {tipo:"video", v:<id de YouTube>, titulo, preguntas:[{p, o, c, s, t:<segundo>}]}.
     Se guardan igual que los concursos. En directo, el profe elige antes de lanzar (en el primer «pasar»):
       modo "proyeccion" (el vídeo en la pantalla grande; las preguntas salen en los móviles cuando tocan) o
       "individual" (cada uno lo ve en su móvil y se para solo), y lectura = segundos para leer antes todas las preguntas.
     POST {accion:"abrir", ..., grupo}   → además avisa a esa clase (csclase:<grupo>): los alumnos entran solos desde «Deberes»
     POST {accion:"terminar", codigo, clave} → fin y ranking
   Claves: concurso:<id> · concursos:<usuario> (índice) · csala:<código> (JSON) · csala:<código>:j (hash de jugadores)
           · csala:<código>:r<i> (hash de respuestas a la pregunta i). */
import crypto from "node:crypto";
import { redis, usuarioDeSesion, ADMIN, leerJSON, guardarJSON, leerGrupos, nuevoId, contar, ipDe, responder, cuerpo, seguro } from "./_db.js";

const MAX_MIOS = 100, MAX_JUG = 30, TTL = 4 * 3600, CUENTA = 3000, MARGEN = 1500;
const LIM = { preguntas: 40, pregunta: 200, respuesta: 90, titulo: 80, tMin: 5, tMax: 120, tDef: 20 };
const ID = /^[a-f0-9]{12}$/, COD = /^\d{6}$/, PID = /^[a-f0-9]{16}$/, REF = /^p-[a-z0-9-]{1,30}$/;
export const VID = /^[A-Za-z0-9_-]{11}$/;

const limpia = s => String(s ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim();
const corta = (s, n) => (s.length > n ? s.slice(0, n) : s);
/* igual que validar() de concursos/formato.js */
export function validar(c) {
  if (!c || typeof c !== "object") return null;
  const titulo = corta(limpia(c.titulo), LIM.titulo);
  const preguntas = (Array.isArray(c.preguntas) ? c.preguntas : []).slice(0, LIM.preguntas).map(q => {
    if (!q || typeof q !== "object" || !Array.isArray(q.o)) return null;
    const p = corta(limpia(q.p), LIM.pregunta), o = q.o.slice(0, 4).map(x => corta(limpia(x), LIM.respuesta));
    const ci = Number.isInteger(q.c) ? q.c : -1, s = Math.min(LIM.tMax, Math.max(LIM.tMin, Math.round(+q.s || LIM.tDef)));
    if (!p || o.length < 2 || o.some(x => !x) || ci < 0 || ci >= o.length) return null;
    return { p, o, c: ci, s };
  });
  if (!titulo || !preguntas.length || preguntas.some(q => !q)) return null;
  if (c.tipo !== "video") return { titulo, preguntas };
  /* vídeo con preguntas: un vídeo de YouTube y cada pregunta en su segundo (t) */
  const v = String(c.v || ""); if (!VID.test(v)) return null;
  for (let i = 0; i < preguntas.length; i++) { const t = +((c.preguntas[i] || {}).t); if (!(t >= 0 && t <= 6 * 3600)) return null; preguntas[i].t = Math.round(t * 10) / 10; }
  preguntas.sort((a, b) => a.t - b.t);
  return { tipo: "video", v, titulo, preguntas };
}

const puntos = (ms, s) => Math.round((500 + 500 * Math.max(0, 1 - ms / (s * 1000))) / 10) * 10;
const hashClave = k => crypto.createHash("sha256").update(String(k)).digest("hex");
const hget = async k => { const a = (await redis("HGETALL", k)) || []; const o = {}; if (Array.isArray(a)) for (let i = 0; i < a.length; i += 2) o[a[i]] = a[i + 1]; else Object.assign(o, a); return o; };
const jsonDe = s => { try { return JSON.parse(s); } catch (e) { return null; } };

async function leerSala(cod) { return COD.test(cod) ? jsonDe(await redis("GET", "csala:" + cod)) : null; }
const guardarSala = (cod, s) => redis("SET", "csala:" + cod, JSON.stringify(s), "EX", TTL);
async function jugadores(cod) {
  const h = await hget(`csala:${cod}:j`), out = [];
  for (const pid in h) { const j = jsonDe(h[pid]); if (j) out.push({ pid, ...j }); }
  return out;
}
const ranking = js => js.map(j => ({ n: j.n, pts: j.pts || 0, d: j.d || 0, ok: j.ok ?? null, ra: j.ra || 0, nr: j.nr || 0, na: j.na || 0 })).sort((a, b) => b.pts - a.pts || a.n.localeCompare(b.n));

/* lo que ve todo el mundo (sin la respuesta correcta mientras se contesta) */
async function publico(cod, S) {
  const q = S.i >= 0 && S.i < S.c.preguntas.length ? S.c.preguntas[S.i] : null;
  const o = { ok: true, fase: S.fase, i: S.i, total: S.c.preguntas.length, titulo: S.c.titulo, ahora: Date.now(), v: S.v || 0 };
  if (S.fase === "espera") o.jugadores = (await jugadores(cod)).map(j => j.n).sort((a, b) => a.localeCompare(b));
  if (q && (S.fase === "pregunta" || S.fase === "resultado")) { o.pregunta = { p: q.p, o: q.o, s: q.s }; o.t0 = S.t0; }
  if (S.fase === "resultado") { o.correcta = q.c; o.cuantos = S.cuantos || []; }
  if (S.fase === "resultado" || S.fase === "fin") o.ranking = S.ranking || [];
  if (S.fase === "pregunta") o.njug = S.njug || 0;
  o.idc = S.idc || null;
  if (S.c.tipo === "video") {
    /* vídeo con preguntas. proyeccion: el vídeo en la pantalla grande y las preguntas en los móviles cuando tocan.
       individual: cada uno ve el vídeo en su móvil y se para solo en cada pregunta. */
    o.tipo = "video"; o.v = S.c.v; o.modo = S.modo || "proyeccion";
    if (S.fase === "lectura") { o.todas = S.c.preguntas.map(x => ({ p: x.p, o: x.o })); o.t0 = S.t0; }
    if (S.fase === "video") { o.t0 = S.t0; if (o.modo === "individual") o.todas = S.c.preguntas.map(x => ({ p: x.p, o: x.o, t: x.t })); }
  }
  return o;
}

async function cerrarPregunta(cod, S) {
  const q = S.c.preguntas[S.i], resp = await hget(`csala:${cod}:r${S.i}`), js = await jugadores(cod);
  const cuantos = q.o.map(() => 0);
  for (const j of js) {
    const r = jsonDe(resp[j.pid] || "null");
    if (r && Number.isInteger(r.o) && r.o >= 0 && r.o < q.o.length) cuantos[r.o]++;
    const ok = !!r && r.o === q.c;
    j.ra = ok ? (j.ra || 0) + 1 : 0;
    /* racha: +100 por cada acierto seguido a partir del segundo, máximo +300 */
    j.d = ok ? puntos(r.ms, q.s) + Math.min(300, Math.max(0, j.ra - 1) * 100) : 0;
    j.pts = (j.pts || 0) + j.d; j.ok = r ? ok : null;
    const { pid, ...guardar } = j;
    await redis("HSET", `csala:${cod}:j`, pid, JSON.stringify(guardar));
  }
  await redis("EXPIRE", `csala:${cod}:j`, TTL);
  S.fase = "resultado"; S.cuantos = cuantos; S.ranking = ranking(js);
}

/* vídeo: espera → (lectura) → video → pregunta → resultado → video … → fin (en individual: video → fin) */
async function pasarVideo(cod, S, b) {
  const n = S.c.preguntas.length;
  const aVideo = async () => { S.fase = "video"; S.t0 = Date.now() + CUENTA; S.njug = +(await redis("HLEN", `csala:${cod}:j`)) || 0; };
  const fin = async () => { S.fase = "fin"; S.ranking = ranking(await jugadores(cod)); };
  if (S.fase === "espera") {
    S.modo = b.modo === "individual" ? "individual" : "proyeccion";
    S.lectura = Math.min(600, Math.max(0, Math.round(+b.lectura || 0)));
    if (S.lectura) { S.fase = "lectura"; S.t0 = Date.now() + S.lectura * 1000; } else await aVideo();
  }
  else if (S.fase === "lectura") await aVideo();
  else if (S.modo === "individual") { if (S.fase === "video") await fin(); }
  else if (S.fase === "video") {
    if (S.i + 1 < n) { S.i++; S.fase = "pregunta"; S.t0 = Date.now() + CUENTA; S.njug = +(await redis("HLEN", `csala:${cod}:j`)) || 0; }
    else await fin();
  }
  else if (S.fase === "pregunta") await cerrarPregunta(cod, S);
  else if (S.fase === "resultado") { S.fase = "video"; S.t0 = Date.now(); }
}
/* la clase del profe ve en «Deberes» que la sala está abierta y entra sola */
const avisoClave = g => "csclase:" + g;
async function quitarAviso(cod, S) {
  if (!S.grupo) return;
  const a = jsonDe(await redis("GET", avisoClave(S.grupo)));
  if (a && a.codigo === cod) await redis("DEL", avisoClave(S.grupo));
}

async function salas(req, res, b, u) {
  const cod = String(b.codigo || "").replace(/\D/g, "");
  if (b.accion === "abrir") {
    if ((await contar("csalas:" + ipDe(req), 3600)) > 30) return responder(res, 429, { error: "espera" });
    let c = null;
    if (ID.test(String(b.id || ""))) c = validar(jsonDe(await redis("GET", "concurso:" + b.id)));
    else c = validar(b.concurso);
    if (!c) return responder(res, 400, { error: "concurso_no_valido" });
    let codigo = "";
    for (let k = 0; k < 8 && !codigo; k++) {
      const x = String(crypto.randomInt(100000, 1000000));
      if (await redis("SET", "csala:" + x, "{}", "NX", "EX", TTL)) codigo = x;
    }
    if (!codigo) return responder(res, 503, { error: "sin_codigo" });
    const clave = crypto.randomBytes(18).toString("base64url");
    /* grupo: solo el profe de esa clase (o el admin) */
    let grupo = null;
    if (u && b.grupo) { const G = await leerGrupos(), g = G.grupos[String(b.grupo)]; if (g && (u === ADMIN || g.profe === u)) grupo = String(b.grupo); }
    const idc = ID.test(String(b.id || "")) ? b.id : REF.test(String(b.ref || "")) ? b.ref : null;
    await guardarSala(codigo, { c, fase: "espera", i: -1, t0: 0, h: hashClave(clave), autor: u || null, idc, grupo, f: Date.now(), v: 1 });
    if (grupo) await redis("SET", avisoClave(grupo), JSON.stringify({ codigo, titulo: c.titulo, tipo: c.tipo || "quiz", idc, f: Date.now() }), "EX", TTL);
    return responder(res, 200, { ok: true, codigo, clave, grupo });
  }
  const S = await leerSala(cod);
  if (!S || !S.c) return responder(res, 404, { error: "no_existe" });

  if (b.accion === "entrar") {
    if ((await contar("centrar:" + ipDe(req), 600)) > 200) return responder(res, 429, { error: "espera" });
    const nombre = corta(limpia(b.nombre), 16);
    if (nombre.length < 2) return responder(res, 400, { error: "nombre_no_valido" });
    if (S.fase === "fin") return responder(res, 409, { error: "terminado" });
    const js = await jugadores(cod);
    /* volver a entrar con el mismo nombre desde el mismo móvil (si se recarga la página) */
    const pidViejo = PID.test(String(b.pid || "")) ? b.pid : "";
    const mismo = js.find(j => j.n.toLowerCase() === nombre.toLowerCase());
    if (mismo) { if (mismo.pid === pidViejo || (u && mismo.u === u)) return responder(res, 200, { ok: true, pid: mismo.pid, nombre: mismo.n }); return responder(res, 409, { error: "nombre_usado" }); }
    if (js.length >= MAX_JUG) return responder(res, 409, { error: "llena" });
    const pid = crypto.randomBytes(8).toString("hex");
    await redis("HSET", `csala:${cod}:j`, pid, JSON.stringify({ n: nombre, pts: 0, u: u || null }));
    await redis("EXPIRE", `csala:${cod}:j`, TTL);
    return responder(res, 200, { ok: true, pid, nombre });
  }

  if (b.accion === "responder" && S.c.tipo === "video" && S.modo === "individual") {
    /* individual: cada uno contesta cuando su vídeo llega a la pregunta; 1000 puntos por acierto */
    const pid = String(b.pid || ""), i = +b.i, o = +b.o, q = S.c.preguntas[i];
    if (!PID.test(pid) || S.fase !== "video" || !q) return responder(res, 409, { error: "fuera_de_tiempo" });
    if (!Number.isInteger(o) || o < 0 || o >= q.o.length) return responder(res, 400, { error: "respuesta_no_valida" });
    const j = jsonDe(await redis("HGET", `csala:${cod}:j`, pid));
    if (!j) return responder(res, 403, { error: "no_jugador" });
    const nuevo = await redis("HSETNX", `csala:${cod}:r${i}`, pid, JSON.stringify({ o, ms: 0 }));
    if (nuevo) {
      await redis("EXPIRE", `csala:${cod}:r${i}`, TTL);
      const ok = o === q.c; j.ra = ok ? (j.ra || 0) + 1 : 0; j.d = ok ? 1000 : 0; j.pts = (j.pts || 0) + j.d; j.ok = ok;
      j.nr = (j.nr || 0) + 1; j.na = (j.na || 0) + (ok ? 1 : 0);
      await redis("HSET", `csala:${cod}:j`, pid, JSON.stringify(j));
    }
    return responder(res, 200, { ok: true, repetida: !nuevo, correcta: q.c, bien: o === q.c, pts: j.pts || 0 });
  }

  if (b.accion === "responder") {
    const pid = String(b.pid || ""), i = +b.i, o = +b.o, ahora = Date.now();
    if (!PID.test(pid) || S.fase !== "pregunta" || i !== S.i) return responder(res, 409, { error: "fuera_de_tiempo" });
    const q = S.c.preguntas[i];
    if (!Number.isInteger(o) || o < 0 || o >= q.o.length) return responder(res, 400, { error: "respuesta_no_valida" });
    const ms = Math.max(0, ahora - S.t0);
    if (ahora < S.t0 - 300 || ms > q.s * 1000 + MARGEN) return responder(res, 409, { error: "fuera_de_tiempo" });
    if (!(await redis("HEXISTS", `csala:${cod}:j`, pid))) return responder(res, 403, { error: "no_jugador" });
    const nuevo = await redis("HSETNX", `csala:${cod}:r${i}`, pid, JSON.stringify({ o, ms: Math.min(ms, q.s * 1000) }));
    if (nuevo) await redis("EXPIRE", `csala:${cod}:r${i}`, TTL);
    return responder(res, 200, { ok: true, repetida: !nuevo });
  }

  /* lo demás es solo de quien proyecta */
  if (!b.clave || hashClave(b.clave) !== S.h) return responder(res, 403, { error: "no_eres_el_anfitrion" });
  if (b.accion === "pasar" && S.c.tipo === "video") {
    await pasarVideo(cod, S, b);
    if (S.fase === "fin") await quitarAviso(cod, S);
    S.v = (S.v || 0) + 1; await guardarSala(cod, S);
    return responder(res, 200, await publico(cod, S));
  }
  if (b.accion === "terminar") {
    S.fase = "fin"; S.ranking = ranking(await jugadores(cod)); await quitarAviso(cod, S);
    S.v = (S.v || 0) + 1; await guardarSala(cod, S);
    return responder(res, 200, await publico(cod, S));
  }
  if (b.accion === "pasar") {
    if (S.fase === "pregunta") await cerrarPregunta(cod, S);
    else if (S.fase === "espera" || S.fase === "resultado") {
      if (S.i + 1 >= S.c.preguntas.length) { S.fase = "fin"; S.ranking = ranking(await jugadores(cod)); }
      else {
        S.i++; S.fase = "pregunta"; S.t0 = Date.now() + CUENTA;
        S.njug = +(await redis("HLEN", `csala:${cod}:j`)) || 0;
      }
    }
    if (S.fase === "fin") await quitarAviso(cod, S);
    S.v = (S.v || 0) + 1;
    await guardarSala(cod, S);
    return responder(res, 200, await publico(cod, S));
  }
  if (b.accion === "echar") {
    const js = await jugadores(cod), j = js.find(x => x.n === b.nombre);
    if (j) await redis("HDEL", `csala:${cod}:j`, j.pid);
    S.v = (S.v || 0) + 1; await guardarSala(cod, S);
    return responder(res, 200, { ok: true });
  }
  if (b.accion === "cerrarsala") {
    await quitarAviso(cod, S);
    await redis("DEL", "csala:" + cod, `csala:${cod}:j`, ...S.c.preguntas.map((_, i) => `csala:${cod}:r${i}`));
    return responder(res, 200, { ok: true });
  }
  responder(res, 400, { error: "accion_no_valida" });
}

export default (req, res) => seguro(res, async () => {
  const q = req.query || {};
  if (req.method === "GET" && q.sala) {
    const cod = String(q.sala), S = await leerSala(cod);
    if (q.clave) {
      if (!S || !S.c) return responder(res, 404, { error: "no_existe" });
      if (hashClave(q.clave) !== S.h) return responder(res, 403, { error: "no_eres_el_anfitrion" });
      const o = await publico(cod, S);
      if (S.fase === "pregunta") o.contestadas = +(await redis("HLEN", `csala:${cod}:r${S.i}`)) || 0;
      if (S.fase !== "espera") o.jugadores = (await jugadores(cod)).map(j => j.n).sort((a, b) => a.localeCompare(b));
      if (S.c.tipo === "video" && S.modo === "individual" && S.fase === "video") o.ranking = ranking(await jugadores(cod));
      if (S.c.tipo === "video") o.preguntas = S.c.preguntas;  /* quien proyecta lo tiene todo (tiempos y correctas) */
      return responder(res, 200, o);
    }
    /* respuesta compartida por la caché de Vercel durante 1 segundo */
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=1, stale-while-revalidate=0");
    res.setHeader("Vercel-CDN-Cache-Control", "max-age=1");
    if (!S || !S.c) return res.status(404).json({ error: "no_existe" });
    return res.status(200).json(await publico(cod, S));
  }

  /* ?aviso=<id de la clase>: ¿ha abierto el profe una sala para esta clase? Lo preguntan los alumnos desde «Deberes»
     cada pocos segundos; Vercel guarda la respuesta 4 s y la comparte entre toda la clase (1 consulta a Upstash). */
  if (req.method === "GET" && q.aviso) {
    if (!/^[a-f0-9]{12}$/.test(String(q.aviso))) return res.status(400).json({ error: "no_valido" });
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=4, stale-while-revalidate=0");
    res.setHeader("Vercel-CDN-Cache-Control", "max-age=4");
    return res.status(200).json({ ok: true, sala: jsonDe(await redis("GET", avisoClave(q.aviso))) });
  }
  const u = await usuarioDeSesion(req).catch(() => null);
  if (req.method === "GET") {
    if (q.id) {
      if (!ID.test(String(q.id))) return responder(res, 400, { error: "id_no_valido" });
      const c = jsonDe(await redis("GET", "concurso:" + q.id));
      if (!c) return responder(res, 404, { error: "no_existe" });
      return responder(res, 200, { ok: true, concurso: c, mio: !!u && (c.autor === u || u === ADMIN) });
    }
    if (q.mios) {
      if (!u) return responder(res, 401, { error: "sin_sesion" });
      return responder(res, 200, { ok: true, concursos: await leerJSON("concursos:" + u, []) });
    }
    return responder(res, 400, { error: "falta_algo" });
  }
  if (req.method !== "POST") return responder(res, 405, { error: "Usa GET o POST" });
  const b = cuerpo(req);
  if (["abrir", "entrar", "responder", "pasar", "terminar", "echar", "cerrarsala"].includes(b.accion)) return salas(req, res, b, u);

  if (!u) return responder(res, 401, { error: "sin_sesion" });
  if (b.accion === "guardar") {
    if ((await contar("cguardar:" + u, 3600)) > 120) return responder(res, 429, { error: "espera" });
    const c = validar(b.concurso);
    if (!c) return responder(res, 400, { error: "concurso_no_valido" });
    const lista = await leerJSON("concursos:" + u, []);
    let id = ID.test(String(b.id || "")) ? b.id : "";
    if (id) { const viejo = jsonDe(await redis("GET", "concurso:" + id)); if (!viejo || (viejo.autor !== u && u !== ADMIN)) id = ""; }
    if (!id && lista.length >= MAX_MIOS) return responder(res, 413, { error: "demasiados" });
    if (!id) id = nuevoId();
    const viejo = id ? jsonDe(await redis("GET", "concurso:" + id)) : null;
    const autor = viejo && viejo.autor ? viejo.autor : u;
    await redis("SET", "concurso:" + id, JSON.stringify({ id, autor, ...c, f: Date.now() }));
    if (autor === u) {
      const otros = lista.filter(x => x.id !== id);
      await guardarJSON("concursos:" + u, [{ id, titulo: c.titulo, n: c.preguntas.length, f: Date.now(), ...(c.tipo ? { tipo: c.tipo, v: c.v } : {}) }, ...otros]);
    }
    return responder(res, 200, { ok: true, id });
  }
  if (b.accion === "borrar") {
    const id = String(b.id || ""); if (!ID.test(id)) return responder(res, 400, { error: "id_no_valido" });
    const c = jsonDe(await redis("GET", "concurso:" + id));
    if (c && c.autor !== u && u !== ADMIN) return responder(res, 403, { error: "no_es_tuyo" });
    await redis("DEL", "concurso:" + id);
    const dueno = c ? c.autor : u;
    await guardarJSON("concursos:" + dueno, (await leerJSON("concursos:" + dueno, [])).filter(x => x.id !== id));
    return responder(res, 200, { ok: true });
  }
  responder(res, 400, { error: "accion_no_valida" });
});
