/* Panel del administrador: propuestas de temas, usuarios (con un resumen de su progreso) y votos. */
import { redis, esAdmin, claveAdminPorDefecto, responder, seguro } from "./_db.js";
import { leerPropuestas } from "./propuestas.js";
const lecturasDe = s => new Set(Object.keys((s && s.a) || {}).map(k => k.split(":")[0])).size;
export default (req, res) => seguro(res, async () => {
  if (!(await esAdmin(req))) return responder(res, 403, { error: "solo_admin" });
  const nombres = ((await redis("SMEMBERS", "usuarios")) || []).sort();
  const usuarios = [];
  for (let i = 0; i < nombres.length; i += 50) {
    const grupo = nombres.slice(i, i + 50);
    const [datos, progresos] = await Promise.all([redis("MGET", ...grupo.map(u => "usuario:" + u)), redis("MGET", ...grupo.map(u => "progreso:" + u))]);
    grupo.forEach((u, j) => {
      const d = JSON.parse(datos[j] || "null") || {}, p = JSON.parse(progresos[j] || "null") || {}, s = p.s || {}, g = s.g || {};
      usuarios.push({ usuario: u, creado: d.creado || 0, ultimo: p.t || 0, xp: g.xp || 0, racha: g.streak || 0, mejorRacha: g.best || 0,
        cromos: Object.keys(g.album || {}).length, medallas: Object.keys(g.medals || {}).length, lecturas: lecturasDe(s), palabras: (s.dict || []).length });
    });
  }
  const claves = (await redis("KEYS", "votos:*")) || [];
  const cuentas = claves.length ? await redis("MGET", ...claves) : [];
  const votos = Object.fromEntries(claves.map((k, i) => [k.slice(6), +cuentas[i] || 0]));
  responder(res, 200, { propuestas: await leerPropuestas(), usuarios, votos, claveAdminPorDefecto: claveAdminPorDefecto() });
});
