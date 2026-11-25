/* Cuentas, en una sola función de Vercel (el plan gratis permite 12):
   ?a=estado (GET) · ?a=entrar (POST) · ?a=registro (POST) · ?a=salir (POST).
   vercel.json mantiene las rutas antiguas /api/entrar, /api/registro, /api/salir y /api/estado. */
import { ADMIN, claveAdminCorrecta, hayDB, leerGrupos, grupoPorCodigo, guardarJSON, redis, normUsuario, usuarioValido, claveValida, hashClave, claveCorrecta, nuevaSesion, borrarSesion, bloqueadoEntrar, falloEntrar, demasiadosRegistros, responder, cuerpo, seguro } from "./_db.js";

async function entrar(req, res) {
  if (req.method !== "POST") return responder(res, 405, { error: "Usa POST" });
  const { usuario: u0, clave } = cuerpo(req), usuario = normUsuario(u0);
  if (await bloqueadoEntrar(req, usuario)) return responder(res, 429, { error: "espera" });
  if (usuario === ADMIN) {
    if (!claveAdminCorrecta(clave)) { await falloEntrar(req, usuario); return responder(res, 401, { error: "datos_mal" }); }
    return responder(res, 200, { token: await nuevaSesion(ADMIN), usuario: ADMIN, admin: true, rol: "admin" });
  }
  const guardado = usuario && typeof clave === "string" ? JSON.parse((await redis("GET", "usuario:" + usuario)) || "null") : null;
  if (!guardado || !claveCorrecta(clave, guardado)) { await falloEntrar(req, usuario); return responder(res, 401, { error: "datos_mal" }); }
  responder(res, 200, { token: await nuevaSesion(usuario), usuario, rol: guardado.rol || "alumno" });
}

async function registro(req, res) {
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
}

export default (req, res) => {
  const a = String((req.query || {}).a || "");
  if (a === "estado") return responder(res, 200, { ok: true, db: hayDB() });
  return seguro(res, async () => {
    if (a === "entrar") return entrar(req, res);
    if (a === "registro") return registro(req, res);
    if (a === "salir") { await borrarSesion(req); return responder(res, 200, { ok: true }); }
    responder(res, 404, { error: "no_existe" });
  });
};
