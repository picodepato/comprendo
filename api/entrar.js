import { ADMIN, claveAdminCorrecta, redis, normUsuario, claveCorrecta, nuevaSesion, demasiadosIntentos, responder, cuerpo, seguro } from "./_db.js";
export default (req, res) => seguro(res, async () => {
  if (req.method !== "POST") return responder(res, 405, { error: "Usa POST" });
  const { usuario: u0, clave } = cuerpo(req), usuario = normUsuario(u0);
  if (await demasiadosIntentos(req)) return responder(res, 429, { error: "espera" });
  if (usuario === ADMIN) {
    if (!claveAdminCorrecta(clave)) return responder(res, 401, { error: "datos_mal" });
    return responder(res, 200, { token: await nuevaSesion(ADMIN), usuario: ADMIN, admin: true });
  }
  const guardado = usuario && typeof clave === "string" ? JSON.parse((await redis("GET", "usuario:" + usuario)) || "null") : null;
  if (!guardado || !claveCorrecta(clave, guardado)) return responder(res, 401, { error: "datos_mal" });
  responder(res, 200, { token: await nuevaSesion(usuario), usuario });
});
