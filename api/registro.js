import { ADMIN, leerGrupos, grupoPorCodigo, guardarJSON, redis, normUsuario, usuarioValido, claveValida, hashClave, nuevaSesion, demasiadosRegistros, responder, cuerpo, seguro } from "./_db.js";
export default (req, res) => seguro(res, async () => {
  if (req.method !== "POST") return responder(res, 405, { error: "Usa POST" });
  const { usuario: u0, clave, progreso, rol: r0, codigo } = cuerpo(req), rol = r0 === "profe" ? "profe" : "alumno", usuario = normUsuario(u0);
  if (!usuarioValido(usuario)) return responder(res, 400, { error: "usuario_no_valido" });
  if (usuario === ADMIN || usuario === "administrador") return responder(res, 409, { error: "usuario_ocupado" });
  if (!claveValida(clave)) return responder(res, 400, { error: "clave_corta" });
  if (await demasiadosRegistros(req)) return responder(res, 429, { error: "espera" });
  let G = null, gid = null;
  if (rol === "alumno" && codigo) { G = await leerGrupos(); gid = grupoPorCodigo(G, codigo); if (!gid) return responder(res, 400, { error: "codigo_no_existe" }); }
  const datos = { ...hashClave(clave), creado: Date.now(), rol };
  const ok = await redis("SET", "usuario:" + usuario, JSON.stringify(datos), "NX");
  if (!ok) return responder(res, 409, { error: "usuario_ocupado" });
  await redis("SADD", "usuarios", usuario);
  if (gid) { G.miembros[usuario] = gid; await guardarJSON("admin:grupos", G); }
  if (progreso && typeof progreso === "object") {
    const txt = JSON.stringify({ s: progreso, t: Date.now() });
    if (txt.length < 900000) await redis("SET", "progreso:" + usuario, txt);
  }
  responder(res, 200, { token: await nuevaSesion(usuario), usuario, rol });
});
