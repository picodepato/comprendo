/* Dibujos de las flashcards (aparte del progreso, para que el progreso no crezca).
   GET ?ids=a,b,c  → {dibujos: {id: "data:image/..."}}
   POST {id, img}  → guarda un dibujo (máx. 40 KB, máx. 2000 por cuenta)
   DELETE ?id=a    → lo borra
   Claves: dibujo:<usuario>:<id> y el conjunto dibujos:<usuario>.
   También sirve el juego «Garabatos» (dibuja y adivina en grupo): GET ?sala=… y POST {accion:"g-…"}. Está aquí para
   no gastar otra función de Vercel; el código está en api/_garabatos.js. */
import { redis, usuarioDeSesion, responder, cuerpo, seguro } from "./_db.js";
import { garabatosGET, garabatosPOST } from "./_garabatos.js";
const ID = /^[a-f0-9]{8,24}$/, MAX = 2000;
export default (req, res) => seguro(res, async () => {
  if (req.method === "GET" && (req.query || {}).sala) return garabatosGET(req, res);
  if (req.method === "POST") { const b = cuerpo(req); if (/^g-/.test(String(b.accion || ""))) return garabatosPOST(req, res, b); }
  const u = await usuarioDeSesion(req);
  if (!u) return responder(res, 401, { error: "sin_sesion" });
  const q = req.query || {};
  if (req.method === "GET") {
    const ids = String(q.ids || "").split(",").filter(x => ID.test(x)).slice(0, 200);
    if (!ids.length) return responder(res, 200, { dibujos: {} });
    const v = await redis("MGET", ...ids.map(id => `dibujo:${u}:${id}`));
    const dibujos = {}; ids.forEach((id, i) => { if (v[i]) dibujos[id] = v[i]; });
    return responder(res, 200, { dibujos });
  }
  if (req.method === "POST" || req.method === "PUT") {
    const { id, img } = cuerpo(req);
    if (!ID.test(String(id || "")) || typeof img !== "string" || !/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(img) || img.length > 40000)
      return responder(res, 400, { error: "dibujo_no_valido" });
    const n = ((await redis("SMEMBERS", "dibujos:" + u)) || []).length;
    if (n >= MAX) return responder(res, 413, { error: "demasiados_dibujos" });
    await redis("SET", `dibujo:${u}:${id}`, img);
    await redis("SADD", "dibujos:" + u, id);
    return responder(res, 200, { ok: true });
  }
  if (req.method === "DELETE") {
    const id = String(q.id || "");
    if (!ID.test(id)) return responder(res, 400, { error: "id_no_valido" });
    await redis("DEL", `dibujo:${u}:${id}`);
    await redis("SREM", "dibujos:" + u, id);
    return responder(res, 200, { ok: true });
  }
  responder(res, 405, { error: "Usa GET, POST o DELETE" });
});
