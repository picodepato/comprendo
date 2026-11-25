/* Garabatos: dibuja y adivina en grupo. Se sirve desde api/dibujos.js (?sala=… o {accion:…}) para no gastar otra función de Vercel.
   Una sala tiene un código de 6 cifras (máx. 30 jugadores, caduca a las 3 horas). Por turnos, a uno le salen 3 palabras
   del nivel del curso, elige una y la dibuja; los demás escriben lo que creen que es. Más puntos cuanto antes se acierte;
   quien dibuja gana puntos por cada uno que acierta.
   No hay nada encendido en el servidor: los cambios de fase (se acaba el tiempo, siguiente turno) los hace la primera
   petición que llega cuando toca, con un cerrojo para que solo pase una vez.
     POST {accion:"g-crear", nombre, lang, nivel, rondas, tiempo, propias?} → {codigo, clave, pid}  (quien crea también juega)
     POST {accion:"g-entrar", codigo, nombre, pid?}   → {pid}   (con el mismo pid se vuelve a entrar si se recarga)
     POST {accion:"g-empezar", codigo, clave}          → empieza (mín. 2 jugadores)
     POST {accion:"g-yo", codigo, pid}                 → quien dibuja: sus 3 opciones o su palabra
     POST {accion:"g-elegir", codigo, pid, i}          → elige la palabra 0-2
     POST {accion:"g-trazos", codigo, pid, turno, ev}  → trazos del dibujo (se mandan en tandas, cada segundo)
     POST {accion:"g-adivinar", codigo, pid, texto}    → {ok} | {casi} | {tilde}
     POST {accion:"g-echar"|"g-otra"|"g-cerrar", codigo, clave, nombre?}  → del anfitrión
     GET  ?sala=COD&desde=TURNO.N → estado + lo nuevo del turno (trazos, intentos, aciertos). Vercel lo guarda 1 s y lo
          comparte entre todos los que piden lo mismo, así 30 mirando gastan casi lo mismo que 2.
   Claves: gsala:<cod> (JSON) · gsala:<cod>:j (hash pid → {n, t}) · gsala:<cod>:e<turno> (lista de sucesos)
           · gsala:<cod>:a<turno> (hash de aciertos) · gsala:<cod>:lk (cerrojo). */
import crypto from "node:crypto";
import { redis, contar, ipDe, responder, cuerpo } from "./_db.js";
import { palabras } from "./_garabatos-palabras.js";

const TTL = 3 * 3600, MAX_JUG = 30, ELEGIR = 15000, RESULTADO = 7000, MAX_EV = 600, MAX_TANDA = 12000;
const COD = /^\d{6}$/, PID = /^[a-f0-9]{16}$/;
const K = c => "gsala:" + c;
const jsonDe = s => { try { return JSON.parse(s); } catch (e) { return null; } };
const limpia = s => String(s ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim();
const hashClave = k => crypto.createHash("sha256").update(String(k)).digest("hex");
const espera = ms => new Promise(r => setTimeout(r, ms));
const hget = async k => { const a = (await redis("HGETALL", k)) || []; const o = {}; if (Array.isArray(a)) for (let i = 0; i < a.length; i += 2) o[a[i]] = a[i + 1]; else Object.assign(o, a); return o; };
async function jugadores(cod) {
  const h = await hget(K(cod) + ":j"), out = [];
  for (const pid in h) { const j = jsonDe(h[pid]); if (j) out.push({ pid, n: j.n, t: j.t || 0 }); }
  return out.sort((a, b) => a.t - b.t);
}
const adivinadores = async cod => Math.max(1, (+(await redis("HLEN", K(cod) + ":j")) || 2) - 1);
const leer = async cod => (COD.test(cod) ? jsonDe(await redis("GET", K(cod))) : null);
const guardar = (cod, S) => redis("SET", K(cod), JSON.stringify(S), "EX", TTL);

/* comparar lo que escriben con la palabra: igual · igual sin tildes · a una letra */
const norm = s => limpia(s).toLowerCase().replace(/[’`´]/g, "'").replace(/[.,;:!?¡¿"()]/g, "").replace(/\s+/g, " ").trim();
const sinTildes = s => s.normalize("NFD").replace(/(?!̃)[̀-ͯ]/g, "").normalize("NFC").replace(/·/g, "");
const ARTICULOS = /^(el|la|los|las|un|una|unos|unas|l'|els|les|uns|unes|the|a|an)\s*/;
function dist(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function comparar(texto, P) {
  const t = norm(texto), t2 = t.replace(ARTICULOS, "");
  const formas = [P.w, ...(P.alt || [])].map(norm);
  if (formas.includes(t) || formas.includes(t2)) return "ok";
  const st = sinTildes(t2);
  if (formas.some(f => sinTildes(f) === st)) return "tilde";
  if (formas.some(f => f.length >= 4 && dist(sinTildes(f), st) === 1)) return "casi";
  return "";
}
/* lo que ven los demás de la palabra: _ _ _ con alguna letra que se descubre al pasar el tiempo */
function pista(S, ahora) {
  const w = S.p.w, total = S.T * 1000, pasado = total - Math.max(0, S.fin - ahora);
  const n = pasado > total * 0.75 ? 2 : pasado > total * 0.5 ? 1 : 0;
  const ver = new Set((S.rev || []).slice(0, w.length >= 5 ? n : Math.min(n, 1)));
  return [...w].map((c, i) => (/[\s\-'·]/.test(c) ? c : ver.has(i) ? c : "_")).join("");
}

function publico(S, ahora) {
  const o = { ok: true, fase: S.fase, ronda: S.ronda, rondas: S.rondas, turno: S.turno, T: S.T, fin: S.fin, ahora, v: S.v, host: S.host,
    lang: S.lang, nivel: S.nivel, ranking: S.ranking || [] };
  if (S.fase !== "espera") o.dib = S.dibn || "";
  if (S.fase === "dibujar") { o.pista = pista(S, ahora); o.nadiv = S.nadiv; }
  if ((S.fase === "resultado" || S.fase === "fin") && S.p) o.palabra = { w: S.p.w, tr: S.p.tr };
  if (S.fase === "resultado" || S.fase === "fin") o.delta = S.delta || {};
  return o;
}
const ranking = (S, js) => js.map(j => ({ n: j.n, pts: (S.pts || {})[j.pid] || 0 })).sort((a, b) => b.pts - a.pts || a.n.localeCompare(b.n));

/* el siguiente que dibuja: el primero (por orden de llegada) que aún no ha dibujado en esta ronda */
async function siguienteTurno(cod, S, ahora) {
  const js = await jugadores(cod);
  let libres = js.filter(j => !(S.hechos || []).includes(j.pid));
  if (!libres.length || js.length < 2) {
    if (S.ronda >= S.rondas || js.length < 2) { S.fase = "fin"; S.ranking = ranking(S, js); S.fin = 0; return; }
    S.ronda++; S.hechos = []; libres = js;
  }
  const d = libres[0], pool = S.propias && S.propias.length >= 3 ? S.propias : palabras(S.lang, S.nivel);
  const usadas = new Set(S.usadas || []);
  let cand = pool.filter(p => !usadas.has(p.w)); if (cand.length < 3) { cand = pool; S.usadas = []; }
  const ops = [];
  while (ops.length < 3 && cand.length) ops.push(cand.splice(crypto.randomInt(cand.length), 1)[0]);
  S.turno++; S.fase = "elegir"; S.dib = d.pid; S.dibn = d.n; S.ops = ops; S.p = null; S.hechos = [...(S.hechos || []), d.pid];
  S.fin = ahora + ELEGIR; S.ranking = ranking(S, js); S.delta = {};
}
function empezarDibujo(S, i, ahora) {
  const p = S.ops[i] || S.ops[0];
  S.p = p; S.usadas = [...(S.usadas || []), p.w].slice(-200);
  const letras = [...p.w].map((c, k) => (/[\s\-'·]/.test(c) ? -1 : k)).filter(k => k >= 0);
  S.rev = []; while (S.rev.length < 2 && letras.length) S.rev.push(letras.splice(crypto.randomInt(letras.length), 1)[0]);
  S.fase = "dibujar"; S.fin = ahora + S.T * 1000; S.t0 = ahora;
}
async function cerrarDibujo(cod, S, ahora) {
  const ac = await hget(`${K(cod)}:a${S.turno}`), js = await jugadores(cod), pts = S.pts || {}, delta = {};
  const lista = Object.entries(ac).map(([pid, v]) => ({ pid, ms: +v || 0 })).sort((a, b) => a.ms - b.ms);
  const total = S.T * 1000;
  lista.forEach((a, k) => {
    const d = Math.round((100 + 400 * Math.max(0, 1 - a.ms / total) + (k === 0 ? 50 : 0)) / 10) * 10;
    delta[a.pid] = d; pts[a.pid] = (pts[a.pid] || 0) + d;
  });
  if (lista.length && S.dib) {
    const d = Math.min(500, 60 * lista.length + (lista.length >= S.nadiv ? 50 : 0));
    delta[S.dib] = d; pts[S.dib] = (pts[S.dib] || 0) + d;
  }
  S.pts = pts; S.fase = "resultado"; S.fin = ahora + RESULTADO;
  const nom = Object.fromEntries(js.map(j => [j.pid, j.n]));
  S.delta = Object.fromEntries(Object.entries(delta).filter(([p]) => nom[p]).map(([p, d]) => [nom[p], d]));
  S.ranking = ranking(S, js);
}
/* pasa de fase si ya toca; devuelve el estado al día */
async function alDia(cod, S) {
  const ahora = Date.now();
  if (!S || !S.fin || ahora < S.fin || !["elegir", "dibujar", "resultado"].includes(S.fase)) return S;
  return (await conCerrojo(cod, async (X, t) => {
    if (!X.fin || t < X.fin) return false;
    if (X.fase === "elegir") { empezarDibujo(X, 0, t); X.nadiv = await adivinadores(cod); }
    else if (X.fase === "dibujar") await cerrarDibujo(cod, X, t);
    else if (X.fase === "resultado") await siguienteTurno(cod, X, t);
    else return false;
    return true;
  }, 0)) || S;
}
/* cambia el estado con un cerrojo (para que dos peticiones a la vez no lo pisen). intentos = cuántas veces esperar */
async function conCerrojo(cod, fn, intentos = 8) {
  for (let k = 0; k <= intentos; k++) {
    if (await redis("SET", K(cod) + ":lk", "1", "NX", "EX", 4)) {
      try {
        const S = await leer(cod); if (!S || !S.lang) return null;
        const r = await fn(S, Date.now());
        if (r) { S.v = (S.v || 0) + 1; await guardar(cod, S); }
        return r === "error" ? null : S;
      } finally { await redis("DEL", K(cod) + ":lk"); }
    }
    if (k < intentos) await espera(120 + k * 60);
  }
  return null;
}
const suceso = async (cod, turno, ev) => { const n = await redis("RPUSH", `${K(cod)}:e${turno}`, JSON.stringify(ev)); if (n === 1) await redis("EXPIRE", `${K(cod)}:e${turno}`, TTL); return n; };

/* trazos: ["c"] borrar todo · ["u"] deshacer · [color, grosor, sigue, x, y, x, y…] (coordenadas 0-1000) */
function trazosValidos(ev) {
  if (!Array.isArray(ev) || !ev.length || ev.length > 80) return null;
  for (const t of ev) {
    if (t === "c" || t === "u") continue;
    if (!Array.isArray(t) || t.length < 5 || t.length % 2 === 0 || t.length > 1200) return null;
    if (!t.every(Number.isInteger)) return null;
    if (t[0] < 0 || t[0] > 15 || t[1] < 0 || t[1] > 3 || (t[2] !== 0 && t[2] !== 1)) return null;
    for (let i = 3; i < t.length; i++) if (t[i] < 0 || t[i] > 1000) return null;
  }
  return JSON.stringify(ev).length <= MAX_TANDA ? ev : null;
}

export async function garabatosGET(req, res) {
  const q = req.query || {}, cod = String(q.sala || "");
  let S = await leer(cod);
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=1, stale-while-revalidate=0");
  res.setHeader("CDN-Cache-Control", "public, s-maxage=1");
  if (!S || !S.lang) return res.status(404).json({ error: "no_existe" });
  S = await alDia(cod, S);
  const ahora = Date.now(), o = publico(S, ahora);
  if (S.fase === "espera") o.jugadores = (await jugadores(cod)).map(j => j.n);
  if (S.turno > 0 && S.fase !== "espera") {
    const [t, n] = String(q.desde || "").split(".").map(x => parseInt(x, 10));
    const desde = t === S.turno && n >= 0 ? n : 0;
    const ev = (await redis("LRANGE", `${K(cod)}:e${S.turno}`, desde, desde + 299)) || [];
    o.ev = ev.map(jsonDe).filter(Boolean); o.desde = `${S.turno}.${desde + ev.length}`; o.evDesde = desde;
  }
  return res.status(200).json(o);
}

export async function garabatosPOST(req, res, b) {
  const ac = String(b.accion || "").slice(2), cod = String(b.codigo || "").replace(/\D/g, "");
  if (ac === "crear") {
    if ((await contar("gcrear:" + ipDe(req), 3600)) > 30) return responder(res, 429, { error: "espera" });
    const nombre = limpia(b.nombre).slice(0, 16);
    if (nombre.length < 2) return responder(res, 400, { error: "nombre_no_valido" });
    const lang = ["es", "en", "ca"].includes(b.lang) ? b.lang : "es";
    const nivel = ["A1", "A2", "B1", "B2", "todas"].includes(b.nivel) ? b.nivel : "A1";
    const rondas = Math.min(5, Math.max(1, Math.round(+b.rondas || 2))), T = Math.min(150, Math.max(30, Math.round(+b.tiempo || 80)));
    const propias = [...new Set((Array.isArray(b.propias) ? b.propias : String(b.propias || "").split(/[,\n;]/)).map(x => limpia(x).slice(0, 30)).filter(x => x.length >= 2))].slice(0, 200).map(w => ({ w, alt: [], tr: "" }));
    let codigo = "";
    for (let k = 0; k < 8 && !codigo; k++) { const x = String(crypto.randomInt(100000, 1000000)); if (await redis("SET", K(x), "{}", "NX", "EX", TTL)) codigo = x; }
    if (!codigo) return responder(res, 503, { error: "sin_codigo" });
    const clave = crypto.randomBytes(18).toString("base64url"), pid = crypto.randomBytes(8).toString("hex");
    await redis("HSET", K(codigo) + ":j", pid, JSON.stringify({ n: nombre, t: Date.now() }));
    await redis("EXPIRE", K(codigo) + ":j", TTL);
    await guardar(codigo, { lang, nivel, rondas, T, propias: propias.length >= 3 ? propias : null, fase: "espera", ronda: 0, turno: 0, fin: 0, h: hashClave(clave), host: nombre, pts: {}, v: 1, f: Date.now() });
    return responder(res, 200, { ok: true, codigo, clave, pid, nombre });
  }
  let S = await leer(cod);
  if (!S || !S.lang) return responder(res, 404, { error: "no_existe" });

  if (ac === "entrar") {
    if ((await contar("gentrar:" + ipDe(req), 600)) > 200) return responder(res, 429, { error: "espera" });
    const nombre = limpia(b.nombre).slice(0, 16);
    if (nombre.length < 2) return responder(res, 400, { error: "nombre_no_valido" });
    if (S.fase === "fin") return responder(res, 409, { error: "terminado" });
    const js = await jugadores(cod), viejo = PID.test(String(b.pid || "")) ? b.pid : "";
    const mismo = js.find(j => j.n.toLowerCase() === nombre.toLowerCase());
    if (mismo) return mismo.pid === viejo ? responder(res, 200, { ok: true, pid: mismo.pid, nombre: mismo.n }) : responder(res, 409, { error: "nombre_usado" });
    if (js.length >= MAX_JUG) return responder(res, 409, { error: "llena" });
    const pid = crypto.randomBytes(8).toString("hex");
    await redis("HSET", K(cod) + ":j", pid, JSON.stringify({ n: nombre, t: Date.now() }));
    await redis("EXPIRE", K(cod) + ":j", TTL);
    if (S.turno > 0 && S.fase !== "espera") await suceso(cod, S.turno, { j: nombre });
    return responder(res, 200, { ok: true, pid, nombre });
  }

  const pid = String(b.pid || "");
  if (ac === "yo") {
    S = await alDia(cod, S);
    if (!PID.test(pid) || pid !== S.dib) return responder(res, 200, { ok: true, dibujas: false });
    if (S.fase === "elegir") return responder(res, 200, { ok: true, dibujas: true, turno: S.turno, ops: S.ops.map(p => ({ w: p.w, tr: p.tr })) });
    if (S.fase === "dibujar") return responder(res, 200, { ok: true, dibujas: true, turno: S.turno, palabra: { w: S.p.w, tr: S.p.tr } });
    return responder(res, 200, { ok: true, dibujas: false });
  }
  if (ac === "elegir") {
    if (!PID.test(pid)) return responder(res, 403, { error: "no_jugador" });
    const i = Math.min(2, Math.max(0, +b.i || 0));
    const X = await conCerrojo(cod, async (X, t) => {
      if (X.fase !== "elegir" || X.dib !== pid) return "error";
      empezarDibujo(X, i, t); X.nadiv = await adivinadores(cod);
      return true;
    });
    if (!X) return responder(res, 409, { error: "fuera_de_tiempo" });
    return responder(res, 200, { ok: true, turno: X.turno, palabra: { w: X.p.w, tr: X.p.tr }, fin: X.fin, ahora: Date.now() });
  }
  if (ac === "trazos") {
    if (!PID.test(pid) || pid !== S.dib || S.fase !== "dibujar" || +b.turno !== S.turno) return responder(res, 409, { error: "no_te_toca" });
    const ev = trazosValidos(b.ev);
    if (!ev) return responder(res, 400, { error: "trazos_no_validos" });
    if ((await suceso(cod, S.turno, { d: ev })) > MAX_EV) return responder(res, 413, { error: "demasiados_trazos" });
    return responder(res, 200, { ok: true });
  }
  if (ac === "adivinar") {
    S = await alDia(cod, S);
    const texto = limpia(b.texto).slice(0, 40);
    if (!texto) return responder(res, 400, { error: "vacio" });
    if (!PID.test(pid)) return responder(res, 403, { error: "no_jugador" });
    const yo = jsonDe((await hget(K(cod) + ":j"))[pid] || "null");
    if (!yo) return responder(res, 403, { error: "no_jugador" });
    if (S.fase !== "dibujar" || pid === S.dib) {
      /* fuera del dibujo (o quien dibuja) el texto va como charla, sin comparar */
      if (S.fase === "dibujar" && comparar(texto, S.p)) return responder(res, 200, { ok: false, oculto: true });
      if (S.turno > 0) await suceso(cod, S.turno, { m: [yo.n, texto] });
      return responder(res, 200, { ok: false });
    }
    const r = comparar(texto, S.p), ahora = Date.now();
    if (r === "ok" || r === "tilde") {
      const ms = Math.max(0, Math.min(S.T * 1000, ahora - (S.t0 || ahora)));
      const nuevo = await redis("HSETNX", `${K(cod)}:a${S.turno}`, pid, String(ms));
      if (!nuevo) return responder(res, 200, { ok: true, repetida: true });
      await redis("EXPIRE", `${K(cod)}:a${S.turno}`, TTL);
      await suceso(cod, S.turno, { ok: yo.n });
      /* si ya han acertado todos, se acaba el turno */
      if (+(await redis("HLEN", `${K(cod)}:a${S.turno}`)) >= (S.nadiv || 99)) {
        const turno = S.turno;
        await conCerrojo(cod, async (X, t) => { if (X.fase !== "dibujar" || X.turno !== turno) return false; await cerrarDibujo(cod, X, t); return true; });
      }
      return responder(res, 200, { ok: true, tilde: r === "tilde", palabra: S.p.w });
    }
    if (r === "casi") return responder(res, 200, { ok: false, casi: true });
    await suceso(cod, S.turno, { m: [yo.n, texto] });
    return responder(res, 200, { ok: false });
  }

  /* lo demás es del anfitrión (quien creó la sala) */
  if (!b.clave || hashClave(b.clave) !== S.h) return responder(res, 403, { error: "no_eres_el_anfitrion" });
  if (ac === "empezar" || ac === "otra") {
    const X = await conCerrojo(cod, async (X, t) => {
      if (ac === "empezar" ? X.fase !== "espera" : X.fase !== "fin") return "error";
      const js = await jugadores(cod);
      if (js.length < 2) return "error";
      Object.assign(X, { ronda: 1, hechos: [], pts: {}, delta: {}, ranking: [] });
      await siguienteTurno(cod, X, t);
      return true;
    });
    if (!X) return responder(res, 409, { error: "faltan_jugadores" });
    return responder(res, 200, { ok: true });
  }
  if (ac === "echar") {
    const js = await jugadores(cod), j = js.find(x => x.n === b.nombre);
    if (j) await redis("HDEL", K(cod) + ":j", j.pid);
    if (j && S.turno > 0 && S.fase !== "espera") await suceso(cod, S.turno, { x: j.n });
    /* si echan a quien dibuja, se acaba su turno */
    if (j && j.pid === S.dib && (S.fase === "elegir" || S.fase === "dibujar")) await conCerrojo(cod, async (X, t) => { if (X.dib !== j.pid) return false; X.fin = t; return true; });
    return responder(res, 200, { ok: true });
  }
  if (ac === "cerrar") {
    const ks = [K(cod), K(cod) + ":j", K(cod) + ":lk"]; for (let t = 1; t <= (S.turno || 0); t++) ks.push(`${K(cod)}:e${t}`, `${K(cod)}:a${t}`);
    for (let i = 0; i < ks.length; i += 50) await redis("DEL", ...ks.slice(i, i + 50));
    return responder(res, 200, { ok: true });
  }
  responder(res, 400, { error: "accion_no_valida" });
}
