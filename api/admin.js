/* Panel del administrador: propuestas de temas, usuarios (resumen de su progreso) y votos.
   GET /api/admin → todo.  GET /api/admin?usuario=x → detalle de un usuario, lectura por lectura. */
import { redis, esAdmin, claveAdminPorDefecto, normUsuario, responder, seguro } from "./_db.js";
import { leerPropuestas } from "./propuestas.js";

/* estado guardado por la web: S.a = respuestas ("<lectura>:q0"…, "<lectura>:fin" al terminarla), S.g.rd[lectura] = {n veces, best estrellas, bp mejor %, last} */
const empezadas = s => { const m = {}; for (const k of Object.keys((s && s.a) || {})) { const [id, ex] = k.split(":"); if (ex !== "fin") m[id] = (m[id] || 0) + 1; } return m; };
function resumen(u, d, p) {
  const s = p.s || {}, g = s.g || {}, rd = g.rd || {}, emp = empezadas(s), fin = Object.keys(rd);
  return { usuario: u, creado: d.creado || 0, ultimo: p.t || 0, xp: g.xp || 0, racha: g.streak || 0, mejorRacha: g.best || 0,
    terminadas: fin.length, empezadas: Object.keys(emp).filter(id => !rd[id]).length, veces: fin.reduce((n, id) => n + (rd[id].n || 0), 0),
    estrellas: fin.reduce((n, id) => n + (rd[id].best || 0), 0), tres: fin.filter(id => rd[id].best === 3).length,
    cromos: Object.keys(g.album || {}).length, medallas: Object.keys(g.medals || {}).length, palabras: (s.dict || []).length };
}
const leer = x => { try { return JSON.parse(x || "null") || {}; } catch (e) { return {}; } };

export default (req, res) => seguro(res, async () => {
  if (!(await esAdmin(req))) return responder(res, 403, { error: "solo_admin" });
  const q = new URL(req.url || "/", "http://x").searchParams.get("usuario") ?? (req.query || {}).usuario;
  if (q) {
    const u = normUsuario(q), [d, p] = await redis("MGET", "usuario:" + u, "progreso:" + u);
    if (!d) return responder(res, 404, { error: "no_existe" });
    const P = leer(p), s = P.s || {}, rd = ((s.g || {}).rd) || {}, emp = empezadas(s);
    const ids = [...new Set([...Object.keys(rd), ...Object.keys(emp)])];
    const lecturas = ids.map(id => ({ id, veces: (rd[id] || {}).n || 0, estrellas: (rd[id] || {}).best || 0, ultima: (rd[id] || {}).last ?? null, mejorPct: (rd[id] || {}).bp || 0, respuestas: emp[id] || 0, terminada: !!rd[id] }));
    const dict = (s.dict || []).map(x => ({ palabra: x.w, lengua: x.l, fallo: !!x.miss }));
    return responder(res, 200, { resumen: resumen(u, leer(d), P), lecturas, palabras: dict });
  }
  const nombres = ((await redis("SMEMBERS", "usuarios")) || []).sort();
  const usuarios = [];
  for (let i = 0; i < nombres.length; i += 50) {
    const grupo = nombres.slice(i, i + 50);
    const [datos, progresos] = await Promise.all([redis("MGET", ...grupo.map(u => "usuario:" + u)), redis("MGET", ...grupo.map(u => "progreso:" + u))]);
    grupo.forEach((u, j) => usuarios.push(resumen(u, leer(datos[j]), leer(progresos[j]))));
  }
  const claves = (await redis("KEYS", "votos:*")) || [];
  const cuentas = claves.length ? await redis("MGET", ...claves) : [];
  const votos = Object.fromEntries(claves.map((k, i) => [k.slice(6), +cuentas[i] || 0]));
  responder(res, 200, { propuestas: await leerPropuestas(), usuarios, votos, claveAdminPorDefecto: claveAdminPorDefecto() });
});
