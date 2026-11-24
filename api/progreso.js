/* GET: devuelve el progreso guardado de la cuenta.  PUT: lo guarda (todo el estado de la web). */
import { redis, leerJSON, ADMIN, usuarioDeSesion, responder, cuerpo, seguro } from "./_db.js";
export default (req, res) => seguro(res, async () => {
  const usuario = await usuarioDeSesion(req);
  if (!usuario) return responder(res, 401, { error: "sin_sesion" });
  if (req.method === "GET") {
    const g = JSON.parse((await redis("GET", "progreso:" + usuario)) || "null");
    const rol = usuario === ADMIN ? "admin" : (await leerJSON("usuario:" + usuario, {})).rol || "alumno";
    return responder(res, 200, { usuario, rol, s: g ? g.s : null, t: g ? g.t : 0 });
  }
  if (req.method === "PUT" || req.method === "POST") {
    const { s } = cuerpo(req);
    if (!s || typeof s !== "object" || Array.isArray(s)) return responder(res, 400, { error: "progreso_no_valido" });
    const t = Date.now(), txt = JSON.stringify({ s, t });
    if (txt.length > 900000) return responder(res, 413, { error: "demasiado_grande" });
    await redis("SET", "progreso:" + usuario, txt);
    return responder(res, 200, { ok: true, t });
  }
  responder(res, 405, { error: "Usa GET o PUT" });
});
