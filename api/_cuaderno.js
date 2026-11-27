/* Cuaderno de clase del profe (cuaderno/cuaderno.js). Va dentro de /api/admin para no gastar otra función de Vercel.
   GET  /api/admin?t=cuaderno&g=<clase>          → {cuaderno} (vacío si aún no hay)
   POST /api/admin?t=cuaderno {g, c, v}          → guarda el cuaderno entero. v = la versión que tenía el profe al abrirlo:
                                                   si otro aparato lo ha guardado antes, responde 409 con el que hay (no se pisa).
   Una clave por clase: cuaderno:<clase> (JSON). Lo ve y lo cambia solo el profe de esa clase (y el admin).
   Dentro: categorías y pesos, columnas de notas propias, notas, deberes que cuentan, asistencia, puntos de comportamiento,
   plano de clase y observaciones para los informes. Las notas de los deberes NO se guardan aquí: salen de /api/admin. */
import { redis, leerGrupos, responder, cuerpo } from "./_db.js";

const MAX = 400000;  /* ~400 KB por clase (Upstash admite 1 MB por clave) */
const leer = x => { try { return JSON.parse(x || "null"); } catch (e) { return null; } };

export default async function cuaderno(req, res, yo) {
  const url = new URL(req.url || "/", "http://x"), q = k => url.searchParams.get(k) ?? (req.query || {})[k];
  const b = req.method === "POST" ? cuerpo(req) : {};
  const g = String((req.method === "POST" ? b.g : q("g")) || "");
  const G = await leerGrupos(), clase = G.grupos[g];
  if (!clase) return responder(res, 404, { error: "no_existe" });
  if (!yo.admin && clase.profe !== yo.usuario) return responder(res, 403, { error: "no_es_tu_clase" });
  const k = "cuaderno:" + g, ahora = leer(await redis("GET", k)) || { v: 0 };
  if (req.method !== "POST") return responder(res, 200, { ok: true, cuaderno: ahora });
  const c = b.c;
  if (!c || typeof c !== "object" || Array.isArray(c)) return responder(res, 400, { error: "datos_no_validos" });
  if ((+b.v || 0) !== (ahora.v || 0)) return responder(res, 409, { error: "cambiado", cuaderno: ahora });
  const nuevo = { ...c, v: (ahora.v || 0) + 1, t: Date.now() }, txt = JSON.stringify(nuevo);
  if (txt.length > MAX) return responder(res, 413, { error: "demasiado_grande" });
  await redis("SET", k, txt);
  return responder(res, 200, { ok: true, v: nuevo.v, t: nuevo.t });
}
