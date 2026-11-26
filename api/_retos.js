/* Retos en grupo (retos/retos.js): Encuentra la prueba, Atrapa los puntos, Cartas a la mesa, Palabra secreta y Lector y piloto.
   Módulo, no función de Vercel: se monta en api/propuestas.js (?retos=1), como el escape room (no caben más funciones).
   Todo el contenido (frases, preguntas, palabras clave, trampas…) sale de la lectura y de content/<idioma>/retos.json en el navegador,
   con la misma semilla en todos los aparatos. El servidor solo guarda quién juega y qué ha hecho cada uno:
     reto:<código>     JSON {juego, lectura, file, lang, equipos (0 = cada uno por su cuenta), dur, rd, fase: espera|juego|fin, t0, r, tr, rep, semilla, clave (hash)}
     reto:<código>:j   hash  jugador → JSON {n: nombre, e: equipo, t: cuándo entró}
     reto:<código>:e   hash  "<quién>:<qué>" → "valor|ms"   (quién = e<equipo> o j<jugador>; ms desde que empezó la ronda o la partida)
   Todo caduca a las 4 h.
   GET  ?retos=1&sala=CÓDIGO → estado entero (lo comparten todos; caché de Vercel de 1 s).
   POST ?retos=1 {accion, sala, ...}
     crear {juego, lectura, file, lang, equipos, dur, rd} → {sala, clave}
     empezar / terminar / ronda {r} / cerrar / echar {jugador} → con {clave} (la del anfitrión); cerrar = acabar ya la ronda
   Mates (mates/grupo.js): juegos m-recta, m-cadena, m-objetivo, m-ascensor, m-escape, m-apuesta y m-cartas;
     lectura = mates-t2-<apartados>-<dificultad>, file = mates/t2, lang = es (el contenido sale de mates/banco.js con la semilla).
     entrar {nombre, equipo, jugador?} → {jugador}
     jugar {jugador, k, v, eq?, uno?, suma?}  guarda una jugada (uno: solo la primera; suma: contador +1)
     toque {jugador, r, d}                                mapa de calor: +1 a la frase/palabra d de la ronda r */
import crypto from "node:crypto";
import { redis, contar, ipDe, responder, cuerpo, seguro } from "./_db.js";

const VIDA = 4 * 3600, MAXJ = 80, MAXE = 8, MAXEV = 4000;
const JUEGOS = ["prueba", "apuesta", "cartas", "tabu", "piloto"];
/* juegos de mates (mates/grupo.js): la configuración va en «lectura» = mates-t2-<apartados>-<dificultad> */
const MATES = ["m-recta", "m-cadena", "m-objetivo", "m-ascensor", "m-escape", "m-apuesta", "m-cartas"];
const POR_RONDAS = ["prueba", "apuesta", "m-recta", "m-cadena", "m-objetivo", "m-ascensor", "m-apuesta"];
const SOLO_EQUIPOS = ["cartas", "tabu", "piloto", "m-recta", "m-cadena", "m-escape", "m-cartas"];
const K = c => "reto:" + c;
const hash = s => crypto.createHash("sha256").update(String(s)).digest("hex");
const codigoOk = c => /^\d{6}$/.test(c);
const limpiarNombre = n => String(n || "").replace(/[<>"&\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim().slice(0, 20);
const entre = (v, a, b, d) => { v = Math.round(+v); return v >= a && v <= b ? v : d; };

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
  const {clave, ...publica} = sala;
  return {sala: {codigo: c, ...publica}, jugadores, ev: hashAObjeto(e), ahora: Date.now()};
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
    if ((await contar("reto-crear:" + ipDe(req), 3600)) > 40) return responder(res, 429, {error: "muchas"});
    const juego = String(b.juego || ""), lectura = String(b.lectura || ""), file = String(b.file || ""), lang = String(b.lang || "");
    if (!JUEGOS.includes(juego) && !MATES.includes(juego)) return responder(res, 400, {error: "juego"});
    if (MATES.includes(juego) ? !/^mates-t2-[1-8]{1,8}-[123]$/.test(lectura) || file !== "mates/t2" || lang !== "es"
      : !/^[a-z0-9-]{3,40}$/.test(lectura) || !/^(es|en|ca)\/lecturas\/[a-z0-9-]{3,40}\.json$/.test(file) || !/^(es|en|ca)$/.test(lang)) return responder(res, 400, {error: "lectura"});
    const minimo = SOLO_EQUIPOS.includes(juego) ? 1 : 0;
    const equipos = entre(b.equipos, minimo, MAXE, Math.max(minimo, 4)), dur = entre(b.dur, 3, 60, 15), rd = entre(b.rd, 10, 180, 40);
    const clave = crypto.randomBytes(16).toString("base64url");
    let codigo = null;
    for (let i = 0; i < 8 && !codigo; i++) {
      const p = String(crypto.randomInt(100000, 1000000));
      const sala = {juego, lectura, file, lang, equipos, dur, rd, fase: "espera", t0: 0, r: -1, tr: 0, rep: {}, semilla: crypto.randomInt(1, 2 ** 31), clave: hash(clave), creada: Date.now()};
      if (await redis("SET", K(p), JSON.stringify(sala), "NX", "EX", VIDA)) codigo = p;
    }
    if (!codigo) return responder(res, 503, {error: "ocupado"});
    return responder(res, 200, {sala: codigo, clave, estado: await estado(codigo)});
  }

  if (!codigoOk(c)) return responder(res, 400, {error: "codigo"});
  const sala = await leerSala(c);
  if (!sala) return responder(res, 404, {error: "no_existe"});
  const guardar = async () => { await redis("SET", K(c), JSON.stringify(sala), "EX", VIDA); };

  /* anfitrión (la pizarra) */
  if (["empezar", "terminar", "ronda", "echar", "cerrar"].includes(acc)) {
    if (hash(b.clave || "") !== sala.clave) return responder(res, 403, {error: "no_anfitrion"});
    if (acc === "echar") { await redis("HDEL", K(c) + ":j", String(b.jugador || "")); return responder(res, 200, {ok: true, estado: await estado(c, sala)}); }
    if (acc === "empezar") {
      if (sala.fase !== "espera") return responder(res, 409, {error: "fase"});
      const s = await estado(c, sala), rep = {};
      for (const j of s.jugadores) rep[j.e] = (rep[j.e] || 0) + 1;
      sala.fase = "juego"; sala.t0 = Date.now(); sala.rep = rep; sala.r = 0; sala.tr = sala.t0;
    } else if (acc === "cerrar") { /* cerrar ya la ronda (pasar a la solución) */
      if (sala.fase !== "juego") return responder(res, 409, {error: "fase"});
      sala.cerrada = sala.r;
    } else if (acc === "ronda") {
      if (sala.fase !== "juego") return responder(res, 409, {error: "fase"});
      const r = entre(b.r, 0, 50, -1); if (r < 0) return responder(res, 400, {error: "ronda"});
      if (r !== sala.r) { sala.r = r; sala.tr = Date.now(); }
    } else { sala.fase = "fin"; sala.tfin = Date.now(); }
    await guardar(); await caducar(c);
    return responder(res, 200, {ok: true, estado: await estado(c, sala)});
  }

  /* jugadores */
  if (acc === "entrar") {
    const nombre = limpiarNombre(b.nombre), equipo = sala.equipos ? Math.floor(+b.equipo) : 0;
    if (nombre.length < 1) return responder(res, 400, {error: "nombre"});
    if (sala.equipos && !(equipo >= 1 && equipo <= sala.equipos)) return responder(res, 400, {error: "equipo"});
    if (sala.fase === "fin") return responder(res, 409, {error: "fase"});
    let id = /^[a-f0-9]{12}$/.test(b.jugador || "") ? b.jugador : null;
    const antes = id ? await redis("HGET", K(c) + ":j", id) : null;
    let t = Date.now();
    if (antes) { try { const x = JSON.parse(antes); t = x.t; if (sala.fase !== "espera") return responder(res, 200, {jugador: id, estado: await estado(c, sala)}); } catch (e) {} }
    else {
      if (sala.fase !== "espera" && sala.equipos) return responder(res, 409, {error: "empezada"}); /* en equipo, el reparto se hace al empezar */
      if ((await contar("reto-entrar:" + ipDe(req), 3600)) > 300) return responder(res, 429, {error: "muchas"});
      const n = Object.keys(hashAObjeto(await redis("HGETALL", K(c) + ":j"))).length;
      if (n >= MAXJ) return responder(res, 409, {error: "llena"});
      id = crypto.randomBytes(6).toString("hex");
    }
    await redis("HSET", K(c) + ":j", id, JSON.stringify({n: nombre, e: equipo, t}));
    await caducar(c);
    return responder(res, 200, {jugador: id, estado: await estado(c, sala)});
  }
  if (acc === "jugar" || acc === "toque") {
    const yo = await redis("HGET", K(c) + ":j", String(b.jugador || ""));
    if (!yo) return responder(res, 403, {error: "no_jugador"});
    if (sala.fase !== "juego") return responder(res, 409, {error: "fase"});
    const E = K(c) + ":e", ms = Date.now() - (POR_RONDAS.includes(sala.juego) ? sala.tr : sala.t0);
    if (acc === "toque") {
      const r = entre(b.r, 0, 50, -1), d = String(b.d || "");
      if (r !== sala.r || !/^\d{1,2}\.\d{1,2}(\.\d{1,3})?$/.test(d)) return responder(res, 400, {error: "toque"});
      await redis("HINCRBY", E, `h${r}:${d}`, 1);
      return responder(res, 200, {ok: true});
    }
    const k = String(b.k || ""), v = String(b.v ?? "");
    if (!/^[a-z0-9]{1,12}$/.test(k) || !/^[\p{L}\p{N} .,:;'’·_-]{0,60}$/u.test(v)) return responder(res, 400, {error: "jugada"});
    if (+(await redis("HLEN", E)) > MAXEV) return responder(res, 409, {error: "llena"});
    const eq = JSON.parse(yo).e, quien = b.eq && sala.equipos ? "e" + eq : "j" + b.jugador, campo = `${quien}:${k}`;
    let nuevo = 1;
    if (b.suma) await redis("HINCRBY", E, campo, 1);
    else if (b.uno) nuevo = await redis("HSETNX", E, campo, `${v}|${ms}`);
    else await redis("HSET", E, campo, `${v}|${ms}`);
    await redis("EXPIRE", E, VIDA);
    return responder(res, 200, {ok: true, nuevo: !!nuevo, ms, estado: await estado(c, sala)});
  }
  return responder(res, 400, {error: "accion"});
});
