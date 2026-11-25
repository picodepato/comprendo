/* Para el alumno: su clase, mensajes del profe/admin, deberes y la sala en directo que su profe tenga abierta.
   GET: todo.  GET ?sala=1: solo la sala.  POST {leidos: [ids]}: marca mensajes como leídos.  POST {codigo}: unirse a una clase (o cambiar).  POST {salirClase: true}. */
import { redis, usuarioDeSesion, leerJSON, guardarJSON, leerGrupos, grupoPorCodigo, ADMIN, responder, cuerpo, seguro } from "./_db.js";
export default (req, res) => seguro(res, async () => {
  const u = await usuarioDeSesion(req);
  if (!u) return responder(res, 401, { error: "sin_sesion" });
  const yo = u === ADMIN ? { rol: "admin" } : await leerJSON("usuario:" + u, {}), rol = yo.rol || "alumno";
  if (req.method === "POST") {
    const b = cuerpo(req);
    if (b.codigo !== undefined || b.salirClase) {
      if (rol !== "alumno") return responder(res, 400, { error: "solo_alumnos" });
      const G = await leerGrupos();
      if (b.salirClase) delete G.miembros[u];
      else { const gid = grupoPorCodigo(G, b.codigo); if (!gid) return responder(res, 404, { error: "codigo_no_existe" }); G.miembros[u] = gid; }
      await guardarJSON("admin:grupos", G);
      const g = G.grupos[G.miembros[u]];
      return responder(res, 200, { ok: true, clase: g ? { nombre: g.nombre, profe: g.profe || null } : null });
    }
    const ids = (b.leidos || []).filter(x => typeof x === "string").slice(0, 100);
    if (ids.length) await redis("SADD", "leidos:" + u, ...ids);
    return responder(res, 200, { ok: true });
  }
  const [lista, leidos, G, deberes] = await Promise.all([redis("LRANGE", "mensajes:" + u, 0, 29), redis("SMEMBERS", "leidos:" + u), leerGrupos(), leerJSON("admin:deberes", [])]);
  const vistos = new Set(leidos || []), gid = G.miembros[u] || null, g = gid ? G.grupos[gid] : null;
  /* ?sala=1: solo mirar si el profe ha abierto una sala en directo para su clase (la web lo pregunta cada pocos segundos) */
  const sala = gid ? await leerJSON("csclase:" + gid, null) : null;
  if ((req.query || {}).sala) return responder(res, 200, { sala });
  const mensajes = (lista || []).map(x => { try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean).map(m => ({ ...m, leido: vistos.has(m.id) }));
  /* deberes: los de su clase, los del admin para todos y los de su profe «para todas mis clases» */
  const mios = rol !== "alumno" ? [] : deberes.filter(d => d.grupo ? d.grupo === gid : !d.profe || (g && g.profe === d.profe));
  responder(res, 200, { rol, mensajes, deberes: mios, sala, clase: g ? { nombre: g.nombre, profe: g.profe || null } : null });
});
