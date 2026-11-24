/* Base de datos: Upstash Redis (se conecta desde Vercel → Storage).
   Vercel crea solo las variables KV_REST_API_URL y KV_REST_API_TOKEN
   (o UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). */
import crypto from "node:crypto";

const URL_DB = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN_DB = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const hayDB = () => !!(URL_DB && TOKEN_DB);

export async function redis(...args) {
  if (!hayDB()) throw new Error("sin base de datos");
  const r = await fetch(URL_DB, { method: "POST", headers: { Authorization: `Bearer ${TOKEN_DB}`, "Content-Type": "application/json" }, body: JSON.stringify(args) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || "error de base de datos " + r.status);
  return j.result;
}

export const SESION_DIAS = 90;
export const normUsuario = u => String(u || "").trim().toLowerCase();
export const usuarioValido = u => /^[a-z0-9ñ._-]{3,20}$/.test(u);
export const claveValida = c => typeof c === "string" && c.length >= 6 && c.length <= 100;

export function hashClave(clave, sal = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(clave, sal, 64).toString("hex");
  return { sal, hash };
}
export function claveCorrecta(clave, guardado) {
  const { hash } = hashClave(clave, guardado.sal);
  const a = Buffer.from(hash, "hex"), b = Buffer.from(guardado.hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function nuevaSesion(usuario) {
  const token = crypto.randomBytes(32).toString("base64url");
  await redis("SET", "sesion:" + token, usuario, "EX", SESION_DIAS * 86400);
  await redis("SADD", "sesiones:" + usuario, token);
  await redis("EXPIRE", "sesiones:" + usuario, SESION_DIAS * 86400);
  return token;
}
const tokenDe = req => (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
export async function usuarioDeSesion(req) {
  const t = tokenDe(req);
  if (!t || t.length > 100) return null;
  const u = await redis("GET", "sesion:" + t);
  if (u) await redis("EXPIRE", "sesion:" + t, SESION_DIAS * 86400);
  return u || null;
}
/* Administrador: usuario «admin». La contraseña se cambia en Vercel → Settings → Environment Variables → ADMIN_CLAVE (si no existe, es «admin»). */
export const ADMIN = "admin";
export const claveAdminCorrecta = c => {
  const a = Buffer.from(String(c || "")), b = Buffer.from(process.env.ADMIN_CLAVE || "admin");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
export const claveAdminPorDefecto = () => !process.env.ADMIN_CLAVE;
export async function esAdmin(req) { return (await usuarioDeSesion(req)) === ADMIN; }
/* quién abre el panel: el admin (todo) o un profe (solo sus clases y sus alumnos) */
export async function quienPanel(req) {
  const u = await usuarioDeSesion(req); if (!u) return null;
  if (u === ADMIN) return { usuario: u, admin: true, profe: false };
  const d = await leerJSON("usuario:" + u, {});
  return d.rol === "profe" ? { usuario: u, admin: false, profe: true } : null;
}
export const normCodigo = c => String(c || "").trim().toLowerCase().replace(/\s+/g, "-");
export const codigoValido = c => /^[a-z0-9ñ_-]{3,20}$/.test(c);
/* clases: admin:grupos = {grupos: {id: {nombre, codigo, profe}}, miembros: {alumno: id}} */
export const leerGrupos = () => leerJSON("admin:grupos", { grupos: {}, miembros: {} });
export const grupoPorCodigo = (G, c) => Object.keys(G.grupos).find(id => G.grupos[id].codigo === normCodigo(c)) || null;
export const ipDe = req => String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";

/* cierra todas las sesiones de un usuario (al cambiarle la contraseña o borrarlo) */
export async function cerrarSesiones(usuario) {
  const ts = (await redis("SMEMBERS", "sesiones:" + usuario)) || [];
  if (ts.length) await redis("DEL", ...ts.map(t => "sesion:" + t));
  await redis("DEL", "sesiones:" + usuario);
}
/* datos del admin guardados como JSON en una sola clave */
export const leerJSON = async (k, def) => { try { return JSON.parse((await redis("GET", k)) || "null") ?? def; } catch (e) { return def; } };
export const guardarJSON = (k, v) => redis("SET", k, JSON.stringify(v));
export const nuevoId = () => crypto.randomBytes(6).toString("hex");

export async function borrarSesion(req) { const t = tokenDe(req); if (t) await redis("DEL", "sesion:" + t); }

/* Frenos (pensados para que una clase entera, con la misma conexión, pueda crear cuentas a la vez):
   - entrar: 10 contraseñas mal seguidas para el mismo usuario desde la misma conexión → esperar 15 minutos
   - crear cuentas: 100 por hora y conexión */
const ipKey = req => String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";
export async function contar(k, segundos) { const n = await redis("INCR", k); if (n === 1) await redis("EXPIRE", k, segundos); return n; }
export async function bloqueadoEntrar(req, usuario) { return +(await redis("GET", `fallos:${ipKey(req)}:${usuario}`)) >= 10; }
export const falloEntrar = (req, usuario) => contar(`fallos:${ipKey(req)}:${usuario}`, 900);
export async function demasiadosRegistros(req) { return (await contar("registros:" + ipKey(req), 3600)) > 100; }

export function responder(res, codigo, datos) {
  res.setHeader("Cache-Control", "no-store");
  res.status(codigo).json(datos);
}
export function cuerpo(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch (e) { return {}; }
}
export async function seguro(res, fn) {
  try { await fn(); }
  catch (e) { console.error(e); responder(res, 500, { error: hayDB() ? "Error del servidor" : "Falta conectar la base de datos en Vercel (Storage → Upstash Redis)" }); }
}
