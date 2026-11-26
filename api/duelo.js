/* Duelos en directo: una «mesa» con código de 6 cifras, hasta 30 jugadores, preguntas de una lectura.
   Sin websockets: los aparatos preguntan el estado cada 1-3 s (GET ?c=código).
   Todo lo de una mesa va en UNA clave de Upstash (hash «duelo:<código>»), así cada consulta es 1 operación:
     m          → datos de la mesa (JSON)
     p:<pid>    → jugador {n: nombre, j: cuándo entró}
     a:<pid>:<k>→ respuesta a la pregunta k: "opción,milisegundos"
   El GET es igual para todos (sin token) y Vercel lo guarda 1 segundo en su CDN: da igual que miren 5 o 30,
   Upstash recibe como mucho ~1 lectura por segundo y mesa.
   El tiempo lo manda el servidor: cada pregunta dura D s y luego R s de solución; si todos han contestado,
   el aparato del anfitrión pide pasar antes (op «avanzar»).
   POST {a: "crear" | "unir" | "resp" | "avanzar" | "echar" | "cerrar"} — crear, unir, avanzar, echar y cerrar piden sesión. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { redis, usuarioDeSesion, leerJSON, ADMIN, ipDe, contar, responder, cuerpo, seguro } from "./_db.js";
import "../mates/banco.js"; /* duelos de mates: las preguntas salen de una semilla (globalThis.LYAMatesBanco) */
import "../mates/pdc.js";   /* y las de 4.º ESO PDC (spec «p2-…», globalThis.LYAMatesPDC) */

export const MAX = 30, R = 6, TTL = 3 * 3600;
const clave = c => "duelo:" + c;
const SECRETO = process.env.DUELO_SECRETO || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "duelo";
const tokenDe = (c, u) => crypto.createHmac("sha256", SECRETO).update(c + ":" + u).digest("base64url").slice(0, 24);
const pidDe = tk => crypto.createHash("sha256").update(String(tk)).digest("hex").slice(0, 10);
const num = (v, ops, def) => ops.includes(+v) ? +v : def;
const limpiar = (s, n) => String(s || "").replace(/[<>\n\r\t]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);

/* fase en el momento t: lobby · read · q (pregunta k abierta) · r (solución de k) · end */
export function fase(m, t) {
  if (m.st === "lobby") return { f: "lobby" };
  if (m.st === "fin") return { f: "end" };
  if (t < m.tq) return { f: "read", hasta: m.tq };
  const P = (m.D + R) * 1000, k = m.k0 + Math.floor((t - m.tq) / P), off = (t - m.tq) % P;
  if (k >= m.nq) return { f: "end" };
  const ab = m.tq + (k - m.k0) * P;
  return off < m.D * 1000 ? { f: "q", k, ab, hasta: ab + m.D * 1000 } : { f: "r", k, ab, hasta: ab + P };
}
const idFase = x => x.f === "q" || x.f === "r" ? x.f + x.k : x.f;
const puntos = (ok, ms, D) => ok ? Math.round(500 + 500 * Math.max(0, 1 - ms / (D * 1000))) : 0;

async function leerMesa(c) {
  const flat = await redis("HGETALL", clave(c));
  if (!flat || !flat.length) return null;
  const h = {}; for (let i = 0; i < flat.length; i += 2) h[flat[i]] = flat[i + 1];
  let m = null; try { m = JSON.parse(h.m || "null"); } catch (e) {}
  if (!m) return null;
  const jug = {}, resp = {};
  for (const f in h) {
    if (f.startsWith("p:")) { try { jug[f.slice(2)] = JSON.parse(h[f]); } catch (e) {} }
    else if (f.startsWith("a:")) { const [, pid, k] = f.split(":"); const [r, ms] = h[f].split(","); (resp[pid] ||= {})[k] = { r: +r, ms: +ms }; }
  }
  return { m, jug, resp };
}

/* lo que ve todo el mundo: sin las soluciones de las preguntas que aún no se han cerrado ni lo que ha marcado cada uno */
export function publico(M, t) {
  const { m, jug, resp } = M, F = fase(m, t);
  const cerradas = F.f === "end" ? m.nq : F.f === "r" ? F.k + 1 : F.f === "q" ? F.k : 0;
  const lista = Object.entries(jug).map(([pid, j]) => {
    let pts = 0, ok = 0, tms = 0, ult = 0; const res = [];
    for (let k = 0; k < cerradas; k++) {
      const a = (resp[pid] || {})[k], bien = !!a && a.r === m.key[k], p = a ? puntos(bien, a.ms, m.D) : 0;
      pts += p; ok += bien ? 1 : 0; tms += a ? a.ms : m.D * 1000; res.push(a ? (bien ? 1 : 0) : -1);
      if (k === cerradas - 1) ult = p;
    }
    return { pid, n: j.n, pts, ok, tms, ult, res, ya: F.f === "q" && !!(resp[pid] || {})[F.k] };
  }).sort((a, b) => b.pts - a.pts || a.tms - b.tms || a.n.localeCompare(b.n));
  let dist = null;
  if (F.f === "r") { dist = new Array(m.nops[F.k] || 3).fill(0); for (const pid in jug) { const a = (resp[pid] || {})[F.k]; if (a && a.r >= 0 && a.r < dist.length) dist[a.r]++; } }
  const { key, hu, ...rest } = m;
  return { ok: true, now: t, fase: { ...F, id: idFase(F) }, mesa: { ...rest, sol: key.slice(0, cerradas) }, jugadores: lista, dist, max: MAX };
}

function leerLectura(file) {
  if (!/^(es|en|ca)\/lecturas\/[a-z0-9-]{3,60}\.json$/.test(file)) return null;
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", file), "utf8")); } catch (e) { return null; }
}
async function quien(req) {
  const u = await usuarioDeSesion(req); if (!u) return null;
  if (u === ADMIN) return { u, rol: "admin" };
  return { u, rol: (await leerJSON("usuario:" + u, {})).rol || "alumno" };
}

async function crear(req, res, b) {
  const yo = await quien(req); if (!yo) return responder(res, 401, { error: "sin_sesion" });
  if (await contar("duelocrea:" + ipDe(req), 3600) > 60) return responder(res, 429, { error: "espera" });
  const mates = b.mates ? globalThis.LYAMatesBanco?.leerSpec(String(b.mates)) : null;
  if (b.mates && !mates) return responder(res, 400, { error: "lectura_no_valida" });
  const L = mates ? globalThis.LYAMatesBanco.serie(mates) : leerLectura(String(b.file || ""));
  if (!L || !Array.isArray(L.q) || !L.q.length) return responder(res, 400, { error: "lectura_no_valida" });
  const file = mates ? "mates:" + globalThis.LYAMatesBanco.hacerSpec(mates) : b.file;
  const profe = yo.rol === "profe" || yo.rol === "admin";
  const m = {
    st: "lobby", file, lang: mates ? "es" : b.file.slice(0, 2), lectura: L.id, nivel: L.level, titulo: limpiar(mates ? L.titulo : L.title, 80),
    nq: L.q.length, nops: L.q.map(q => q[1].length), key: L.q.map(q => q[2]),
    D: num(b.D, [10, 15, 20, 30, 45, 60], 20), TL: num(b.TL, [0, 30, 60, 90, 120, 180, 300], 90),
    texto: !mates && b.texto !== false, host: yo.u, hu: yo.u, profe, juega: profe ? !!b.juega : true, creada: Date.now()
  };
  /* premios: el profe elige XP y un logro; el alumno, los de siempre */
  if (profe) {
    const x = b.xp || {}, xp = v => Math.max(0, Math.min(200, Math.round(+v || 0)));
    m.xp = { todos: xp(x.todos), p1: xp(x.p1), p2: xp(x.p2), p3: xp(x.p3) };
    const lg = b.logro || {};
    if (limpiar(lg.n, 40)) m.logro = { ic: limpiar(lg.ic, 4) || "🏆", n: limpiar(lg.n, 40), para: num(lg.para, [1, 3, 30], 1) };
  } else m.xp = { todos: 10, p1: 30, p2: 20, p3: 15 };
  for (let i = 0; i < 8; i++) {
    const c = String(crypto.randomInt(100000, 1000000));
    if (await redis("HSETNX", clave(c), "m", JSON.stringify(m))) {
      await redis("EXPIRE", clave(c), TTL);
      const tk = tokenDe(c, yo.u), pid = pidDe(tk);
      if (m.juega) await redis("HSET", clave(c), "p:" + pid, JSON.stringify({ n: yo.u, j: Date.now() }));
      return responder(res, 200, { ok: true, c, tk, pid, host: true });
    }
  }
  responder(res, 500, { error: "sin_codigo" });
}

async function unir(req, res, c) {
  const yo = await quien(req); if (!yo) return responder(res, 401, { error: "sin_sesion" });
  const M = await leerMesa(c); if (!M) return responder(res, 404, { error: "no_existe" });
  const tk = tokenDe(c, yo.u), pid = pidDe(tk), host = M.m.hu === yo.u;
  if (M.jug[pid] || (host && !M.m.juega)) return responder(res, 200, { ok: true, c, tk, pid, host });
  if (M.m.st !== "lobby") return responder(res, 409, { error: "empezada" });
  if (Object.keys(M.jug).length >= MAX) return responder(res, 409, { error: "llena" });
  if (M.m.echados?.includes(yo.u)) return responder(res, 403, { error: "echado" });
  await redis("HSET", clave(c), "p:" + pid, JSON.stringify({ n: yo.u, j: Date.now() }));
  responder(res, 200, { ok: true, c, tk, pid, host });
}

/* responder: 2 operaciones (leer la mesa y el jugador de golpe, y guardar si aún no había contestado) */
async function resp(req, res, c, b) {
  const pid = pidDe(b.tk || ""), k = Math.floor(+b.k), r = Math.floor(+b.r), t = Date.now();
  const [mj, pj] = await redis("HMGET", clave(c), "m", "p:" + pid);
  if (!mj) return responder(res, 404, { error: "no_existe" });
  if (!pj) return responder(res, 403, { error: "no_juegas" });
  const m = JSON.parse(mj), F = fase(m, t);
  if (F.f !== "q" || F.k !== k || !(r >= 0 && r < (m.nops[k] || 3))) return responder(res, 409, { error: "tarde" });
  const nuevo = await redis("HSETNX", clave(c), `a:${pid}:${k}`, `${r},${t - F.ab}`);
  responder(res, 200, { ok: true, nuevo: !!nuevo, ms: t - F.ab });
}

/* el anfitrión: empezar, saltar la lectura, cerrar la pregunta si ya han contestado todos, pasar a la siguiente */
async function avanzar(req, res, c, b) {
  const yo = await quien(req); if (!yo) return responder(res, 401, { error: "sin_sesion" });
  const mj = await redis("HGET", clave(c), "m"); if (!mj) return responder(res, 404, { error: "no_existe" });
  const m = JSON.parse(mj); if (m.hu !== yo.u) return responder(res, 403, { error: "no_eres_anfitrion" });
  const t = Date.now(), F = fase(m, t);
  if (b.de && b.de !== idFase(F)) return responder(res, 200, { ok: true, igual: true });
  if (F.f === "lobby") { m.st = "go"; m.tq = t + m.TL * 1000; m.k0 = 0; }
  else if (F.f === "read") { m.tq = t; m.k0 = 0; }
  else if (F.f === "q") { m.tq = t - m.D * 1000; m.k0 = F.k; }
  else if (F.f === "r") { if (F.k + 1 >= m.nq) m.st = "fin"; else { m.tq = t; m.k0 = F.k + 1; } }
  else return responder(res, 200, { ok: true, igual: true });
  await redis("HSET", clave(c), "m", JSON.stringify(m));
  responder(res, 200, { ok: true });
}

export default (req, res) => seguro(res, async () => {
  if (req.method === "GET") {
    const c = String((req.query || {}).c || "");
    if (!/^\d{6}$/.test(c)) return responder(res, 400, { error: "codigo_no_valido" });
    const M = await leerMesa(c);
    res.setHeader("Vercel-CDN-Cache-Control", "max-age=1");
    res.setHeader("Cache-Control", "no-store");
    if (!M) return res.status(404).json({ error: "no_existe" });
    return res.status(200).json(publico(M, Date.now()));
  }
  if (req.method !== "POST") return responder(res, 405, { error: "Usa GET o POST" });
  const b = cuerpo(req), c = String(b.c || "");
  if (b.a === "crear") return crear(req, res, b);
  if (!/^\d{6}$/.test(c)) return responder(res, 400, { error: "codigo_no_valido" });
  if (b.a === "unir") {
    if (await contar("duelounir:" + ipDe(req), 600) > 300) return responder(res, 429, { error: "espera" });
    return unir(req, res, c);
  }
  if (b.a === "resp") return resp(req, res, c, b);
  if (b.a === "avanzar") return avanzar(req, res, c, b);
  if (b.a === "echar" || b.a === "cerrar") {
    const yo = await quien(req); if (!yo) return responder(res, 401, { error: "sin_sesion" });
    const mj = await redis("HGET", clave(c), "m"); if (!mj) return responder(res, 404, { error: "no_existe" });
    const m = JSON.parse(mj); if (m.hu !== yo.u) return responder(res, 403, { error: "no_eres_anfitrion" });
    if (b.a === "cerrar") { m.st = "fin"; await redis("HSET", clave(c), "m", JSON.stringify(m)); return responder(res, 200, { ok: true }); }
    const pid = String(b.pid || ""); if (!/^[a-f0-9]{10}$/.test(pid)) return responder(res, 400, { error: "pid" });
    const pj = await redis("HGET", clave(c), "p:" + pid);
    if (pj) { m.echados = [...(m.echados || []), JSON.parse(pj).n].slice(-50); await redis("HSET", clave(c), "m", JSON.stringify(m)); await redis("HDEL", clave(c), "p:" + pid); }
    return responder(res, 200, { ok: true });
  }
  responder(res, 400, { error: "accion_no_valida" });
});
