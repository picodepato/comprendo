/* «Propón un tema para una lectura».
   ?votos=1 → votar el próximo tema (api/_votos.js; va aquí para no gastar otra función de Vercel).
   POST {texto}: cualquiera (con o sin cuenta) deja una propuesta.  GET y DELETE {id}: solo el administrador. */
import crypto from "node:crypto";
import votos from "./_votos.js";
import { redis, usuarioDeSesion, esAdmin, ipDe, responder, cuerpo, seguro } from "./_db.js";
import escape from "./_escape.js"; /* escape room de clase: ?escape=1 (no cabe otra función en Vercel) */
const MAX = 2000;
export const leerPropuestas = async () => ((await redis("LRANGE", "propuestas", 0, -1)) || []).map(x => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean).reverse();
export default (req, res) => (req.query || {}).escape ? escape(req, res) : (req.query || {}).votos ? votos(req, res) : seguro(res, async () => {
  if (req.method === "POST") {
    const texto = String(cuerpo(req).texto || "").replace(/\s+/g, " ").trim();
    if (texto.length < 3 || texto.length > 300) return responder(res, 400, { error: "texto_no_valido" });
    const k = "propip:" + ipDe(req), n = await redis("INCR", k);
    if (n === 1) await redis("EXPIRE", k, 3600);
    if (n > 10) return responder(res, 429, { error: "espera" });
    const usuario = await usuarioDeSesion(req).catch(() => null);
    const p = { id: crypto.randomBytes(6).toString("hex"), texto, usuario: usuario || null, t: Date.now() };
    await redis("RPUSH", "propuestas", JSON.stringify(p));
    await redis("LTRIM", "propuestas", -MAX, -1);
    return responder(res, 200, { ok: true });
  }
  if (!(await esAdmin(req))) return responder(res, 403, { error: "solo_admin" });
  if (req.method === "GET") return responder(res, 200, { propuestas: await leerPropuestas() });
  if (req.method === "DELETE") {
    const id = String(cuerpo(req).id || "");
    const todas = (await redis("LRANGE", "propuestas", 0, -1)) || [];
    const quitar = todas.find(x => { try { return JSON.parse(x).id === id; } catch (e) { return false; } });
    if (quitar) await redis("LREM", "propuestas", 1, quitar);
    return responder(res, 200, { ok: true, borrada: !!quitar });
  }
  responder(res, 405, { error: "Usa GET, POST o DELETE" });
});
