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
export const ipDe = req => String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";

export async function borrarSesion(req) { const t = tokenDe(req); if (t) await redis("DEL", "sesion:" + t); }

/* Freno a quien prueba muchas contraseñas: 20 intentos cada 15 minutos por IP */
export async function demasiadosIntentos(req) {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";
  const k = "intentos:" + ip, n = await redis("INCR", k);
  if (n === 1) await redis("EXPIRE", k, 900);
  return n > 20;
}

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
