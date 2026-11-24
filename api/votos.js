/* Votar el próximo tema. GET: recuento. POST {tema, aparato}: un voto por tema y aparato. */
import { redis, responder, cuerpo, seguro } from "./_db.js";
const TEMAS = ["tiburones", "esports", "cuerpo", "internet", "olimpicos"];
const contar = async () => { const v = {}; for (const t of TEMAS) v[t] = +(await redis("GET", "votos:" + t)) || 0; return v; };
export default (req, res) => seguro(res, async () => {
  if (req.method === "GET") return responder(res, 200, { ok: true, votos: await contar() });
  if (req.method === "POST") {
    const { tema, aparato } = cuerpo(req);
    if (!TEMAS.includes(tema) || !/^[a-f0-9]{16,40}$/.test(String(aparato || ""))) return responder(res, 400, { error: "voto_no_valido" });
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x", k = "votosip:" + ip, n = await redis("INCR", k);
    if (n === 1) await redis("EXPIRE", k, 3600);
    if (n > 40) return responder(res, 429, { error: "demasiados_votos" });
    const nuevo = await redis("SET", `voto:${tema}:${aparato}`, "1", "NX");
    if (nuevo) await redis("INCR", "votos:" + tema);
    return responder(res, 200, { ok: true, nuevo: !!nuevo, votos: await contar() });
  }
  responder(res, 405, { error: "Usa GET o POST" });
});
