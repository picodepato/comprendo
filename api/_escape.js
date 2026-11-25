/* Escape room de clase (escape/escape.js). Módulo, no función de Vercel: se monta en api/propuestas.js (?escape=1).
   Cada alumno ve en su móvil un trozo distinto de la lectura y de las pistas; el equipo tiene que hablar para abrir los candados.
   Las pistas y las respuestas se sacan de la lectura en el navegador (misma semilla para todos), así el servidor solo guarda:
     esc:<código>     JSON {lectura, file, lang, equipos, dur, fase: espera|juego|fin, t0, rep: {equipo: nº de jugadores al empezar}, semilla, clave (hash)}
     esc:<código>:j   hash  jugador → JSON {n: nombre, e: equipo, t: cuándo entró}
     esc:<código>:e   hash  "<equipo>:<candado>" → ms abierto · "<equipo>:x" → fallos · "<equipo>:z<candado>" → ms del último fallo · "<equipo>:fin" → ms de la huida
   Todo caduca a las 4 h.
   GET  ?escape=1&sala=CÓDIGO  → estado entero (lo comparten todos; caché de Vercel de 1 s para que una clase entera no gaste la base de datos).
   POST ?escape=1 {accion, sala, ...}
     crear {lectura, file, lang, equipos, dur} → {sala, clave}      empezar / terminar / echar {jugador} → con {clave} (la del anfitrión)
     entrar {nombre, equipo, jugador?} → {jugador}                   abrir / fallo {jugador, candado} · escapar {jugador} */
import crypto from "node:crypto";
import { redis, contar, ipDe, responder, cuerpo, seguro } from "./_db.js";

const VIDA = 4 * 3600, MAXJ = 80, MAXE = 8, CANDADOS = 6;
const K = c => "esc:" + c;
const hash = s => crypto.createHash("sha256").update(String(s)).digest("hex");
const codigoOk = c => /^\d{6}$/.test(c);
const limpiarNombre = n => String(n || "").replace(/[<>"&\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim().slice(0, 20);

async function leerSala(c) { try { return JSON.parse((await redis("GET", K(c))) || "null"); } catch (e) { return null; } }
function hashAObjeto(a) {
  if (!a) return {}; if (!Array.isArray(a)) return a;
  const o = {}; for (let i = 0; i + 1 < a.length; i += 2) o[a[i]] = a[i + 1]; return o;
}
async function estado(c, sala) {
  sala = sala || await leerSala(c);
  if (!sala) return null;
  const [j, e] = await Promise.all([redis("HGETALL", K(c) + ":j"), redis("HGETALL", K(c) + ":e")]);
  const jugadores = Object.entries(hashAObjeto(j)).map(([id, v]) => { try { const x = JSON.parse(v); return {id, n: x.n, e: x.e, t: x.t}; } catch (er) { return null; } }).filter(Boolean).sort((a, b) => a.t - b.t || (a.id < b.id ? -1 : 1));
  const equipos = {};
  for (const [k, v] of Object.entries(hashAObjeto(e))) {
    const [eq, cl] = k.split(":"); const E = equipos[eq] ||= {abiertos: {}, x: 0, z: {}, fin: 0};
    if (cl === "x") E.x = +v; else if (cl === "fin") E.fin = +v; else if (cl[0] === "z") E.z[cl.slice(1)] = +v; else E.abiertos[cl] = +v;
  }
  const {clave, ...publica} = sala;
  return {sala: {codigo: c, ...publica}, jugadores, equipos, ahora: Date.now()};
}
const caducar = c => Promise.all([K(c), K(c) + ":j", K(c) + ":e"].map(k => redis("EXPIRE", k, VIDA)));

export default (req, res) => seguro(res, async () => {
  if (req.method === "GET") {
    const c = String(req.query.sala || "").trim();
    if (!codigoOk(c)) return responder(res, 400, {error: "codigo"});
    const s = await estado(c);
    if (!s) return responder(res, 404, {error: "no_existe"});
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=1");
    res.setHeader("CDN-Cache-Control", "public, s-maxage=1");
    res.setHeader("Vercel-CDN-Cache-Control", "max-age=1");
    return res.status(200).json(s);
  }
  if (req.method !== "POST") return responder(res, 405, {error: "metodo"});
  const b = cuerpo(req), acc = String(b.accion || ""), c = String(b.sala || "").trim();

  if (acc === "crear") {
    if ((await contar("esc-crear:" + ipDe(req), 3600)) > 30) return responder(res, 429, {error: "muchas"});
    const lectura = String(b.lectura || ""), file = String(b.file || ""), lang = String(b.lang || "");
    if (!/^[a-z0-9-]{3,40}$/.test(lectura) || !/^(es|en|ca)\/lecturas\/[a-z0-9-]{3,40}\.json$/.test(file) || !/^(es|en|ca)$/.test(lang)) return responder(res, 400, {error: "lectura"});
    const equipos = Math.max(1, Math.min(MAXE, +b.equipos || 4)), dur = Math.max(5, Math.min(60, +b.dur || 20));
    const clave = crypto.randomBytes(16).toString("base64url");
    let codigo = null;
    for (let i = 0; i < 8 && !codigo; i++) {
      const p = String(crypto.randomInt(100000, 1000000));
      const sala = {lectura, file, lang, equipos, dur, fase: "espera", t0: 0, rep: {}, semilla: crypto.randomInt(1, 2 ** 31), clave: hash(clave), creada: Date.now()};
      if (await redis("SET", K(p), JSON.stringify(sala), "NX", "EX", VIDA)) codigo = p;
    }
    if (!codigo) return responder(res, 503, {error: "ocupado"});
    return responder(res, 200, {sala: codigo, clave, estado: await estado(codigo)});
  }

  if (!codigoOk(c)) return responder(res, 400, {error: "codigo"});
  const sala = await leerSala(c);
  if (!sala) return responder(res, 404, {error: "no_existe"});
  const guardar = async () => { await redis("SET", K(c), JSON.stringify(sala), "EX", VIDA); };

  /* anfitrión (el profe en la pizarra) */
  if (acc === "empezar" || acc === "terminar" || acc === "echar") {
    if (hash(b.clave || "") !== sala.clave) return responder(res, 403, {error: "no_anfitrion"});
    if (acc === "echar") { await redis("HDEL", K(c) + ":j", String(b.jugador || "")); return responder(res, 200, {ok: true, estado: await estado(c, sala)}); }
    if (acc === "empezar") {
      if (sala.fase !== "espera") return responder(res, 409, {error: "fase"});
      const s = await estado(c, sala), rep = {};
      for (const j of s.jugadores) rep[j.e] = (rep[j.e] || 0) + 1;
      sala.fase = "juego"; sala.t0 = Date.now(); sala.rep = rep;
    } else { sala.fase = "fin"; sala.tfin = Date.now(); }
    await guardar(); await caducar(c);
    return responder(res, 200, {ok: true, estado: await estado(c, sala)});
  }

  /* alumnos */
  if (acc === "entrar") {
    const nombre = limpiarNombre(b.nombre), equipo = Math.floor(+b.equipo);
    if (nombre.length < 1) return responder(res, 400, {error: "nombre"});
    if (!(equipo >= 1 && equipo <= sala.equipos)) return responder(res, 400, {error: "equipo"});
    if (sala.fase === "fin") return responder(res, 409, {error: "fase"});
    let id = /^[a-f0-9]{12}$/.test(b.jugador || "") ? b.jugador : null;
    const antes = id ? await redis("HGET", K(c) + ":j", id) : null;
    let t = Date.now();
    if (antes) { try { const x = JSON.parse(antes); t = x.t; if (sala.fase !== "espera") return responder(res, 200, {jugador: id, estado: await estado(c, sala)}); } catch (e) {} }
    else {
      if ((await contar("esc-entrar:" + ipDe(req), 3600)) > 300) return responder(res, 429, {error: "muchas"});
      const n = Object.keys(hashAObjeto(await redis("HGETALL", K(c) + ":j"))).length;
      if (n >= MAXJ) return responder(res, 409, {error: "llena"});
      id = crypto.randomBytes(6).toString("hex");
    }
    await redis("HSET", K(c) + ":j", id, JSON.stringify({n: nombre, e: equipo, t}));
    await caducar(c);
    return responder(res, 200, {jugador: id, estado: await estado(c, sala)});
  }
  if (acc === "abrir" || acc === "fallo" || acc === "escapar") {
    const yo = await redis("HGET", K(c) + ":j", String(b.jugador || ""));
    if (!yo) return responder(res, 403, {error: "no_jugador"});
    if (sala.fase !== "juego") return responder(res, 409, {error: "fase"});
    const eq = JSON.parse(yo).e, E = K(c) + ":e";
    if (await redis("HGET", E, eq + ":fin")) return responder(res, 200, {ok: true, estado: await estado(c, sala)});
    if (acc === "escapar") await redis("HSETNX", E, eq + ":fin", String(Date.now()));
    else {
      const cand = Math.floor(+b.candado);
      if (!(cand >= 0 && cand <= CANDADOS)) return responder(res, 400, {error: "candado"});
      if (acc === "abrir") await redis("HSETNX", E, eq + ":" + cand, String(Date.now()));
      else { await redis("HINCRBY", E, eq + ":x", 1); await redis("HSET", E, eq + ":z" + cand, String(Date.now())); }
    }
    await redis("EXPIRE", E, VIDA);
    return responder(res, 200, {ok: true, estado: await estado(c, sala)});
  }
  return responder(res, 400, {error: "accion"});
});
