/* «Añadir un tema»: los profes piden un tema nuevo (curso, asignatura, tema, apartados, cómo es su alumnado y fotos o texto).
   El admin revisa cada petición y la aprueba o la rechaza. Cada mañana una rutina (el «robot») coge las aprobadas,
   prepara el tema con el motor de FP Básica (fpb/fpb.js) en temas-profe/, abre un PR y borra las fotos.
   Ruta: /api/temas (vercel.json la manda a /api/admin?t=temas, así no gasta otra función de Vercel).

   Profe (o admin):
     GET                                   → {peticiones: las suyas (el admin: todas), limites}
     GET  ?foto=<id>&i=<n>                 → {data: "data:image/jpeg;base64,…"} (el admin o el profe que la pidió)
     POST {accion: "pedir", curso, asignatura, tema, titulo, apartados, alumnado, notas, metodologia, actividades, juegos, juegoOtro,
           adaptarClase, clase, texto, fotos: n} → {id} (estado «subiendo»). Con adaptarClase se guarda difsClase = {dif: {tdah: 2…}, n} (sin nombres).
     POST {accion: "foto", id, i, data}    → guarda la foto i (JPEG en base64; caduca sola a los 30 días)
     POST {accion: "enviar", id}           → pasa a «pendiente» (la ve el admin)
     POST {accion: "cancelar", id}         → la borra con sus fotos (solo si aún no está preparada)
   Admin:
     POST {accion: "revisar", id, decision: "aprobar"|"rechazar", nota} → aprobada (con indicaciones para el robot) o rechazada (se borran las fotos)
     POST {accion: "borrar", id}
   Robot (cabecera x-robot = variable TEMAS_ROBOT de Vercel, de 20 caracteres o más; sin ella, el robot no puede entrar):
     GET  ?robot=lista                     → {peticiones: las aprobadas (por preparar) y las preparadas (con PR, por publicar)}
     GET  ?robot=foto&id=<id>&i=<n>        → {data}
     POST {accion: "robot_preparada", id, temaId, archivo, pr} → estado «preparada» y BORRA las fotos
     POST {accion: "robot_publicada", id}  → estado «publicada» (cuando el PR ya está en la web)
     POST {accion: "robot_error", id, motivo} → estado «error» (el admin lo ve; las fotos se quedan para volver a intentarlo)
   Datos: temas:peticiones = [{id, profe, estado, creado, …}] (una sola clave JSON, como admin:deberes) y temafoto:<id>:<i> (con caducidad). */
import crypto from "node:crypto";
import { resumenClase } from "./_perfiles.js";
import { redis, leerGrupos, quienPanel, leerJSON, guardarJSON, nuevoId, contar, responder, cuerpo } from "./_db.js";

export const LIM = { fotos: 6, fotoBytes: 750000, texto: 20000, porProfe: 3, abiertas: 30, fotoDias: 30 };
const K = "temas:peticiones", KF = (id, i) => `temafoto:${id}:${i}`;
const ABIERTA = ["subiendo", "pendiente", "aprobada", "error"];
const DIA = 864e5;
const corta = (s, n) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const lista = (x, n, m) => (Array.isArray(x) ? x : []).map(v => corta(v, m)).filter(Boolean).slice(0, n);
const larga = (s, n) => String(s ?? "").replace(/\r/g, "").trim().slice(0, n);

export const leerPeticiones = () => leerJSON(K, []);
/* limpieza al guardar: las «subiendo» de más de 1 día y las cerradas de más de 90 días se van */
async function guardar(P) {
  const ahora = Date.now(), fuera = P.filter(p => (p.estado === "subiendo" && ahora - p.creado > DIA) || (["rechazada", "publicada"].includes(p.estado) && ahora - (p.cambio || p.creado) > 90 * DIA));
  for (const p of fuera) await borrarFotos(p);
  await guardarJSON(K, P.filter(p => !fuera.includes(p)));
}
async function borrarFotos(p) {
  const n = Math.max(p.fotos || 0, LIM.fotos);
  await redis("DEL", ...Array.from({ length: n }, (_, i) => KF(p.id, i)));
  p.fotosSubidas = 0;
}
const robotOk = req => {
  const clave = process.env.TEMAS_ROBOT || "", dada = String(req.headers["x-robot"] || "");
  if (clave.length < 20 || !dada) return false;
  const a = Buffer.from(dada), b = Buffer.from(clave);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const fotoValida = d => typeof d === "string" && d.length <= LIM.fotoBytes && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(d);
/* lo que se enseña (sin datos internos) */
const vista = p => ({ ...p });

async function robot(req, res, q) {
  if (req.method === "GET") {
    if (q.get("robot") === "lista") return responder(res, 200, { peticiones: (await leerPeticiones()).filter(p => ["aprobada", "preparada"].includes(p.estado)).map(vista) });
    if (q.get("robot") === "foto") { const d = await redis("GET", KF(q.get("id"), +q.get("i") || 0)); return d ? responder(res, 200, { data: d }) : responder(res, 404, { error: "sin_foto" }); }
    return responder(res, 400, { error: "accion_desconocida" });
  }
  const b = cuerpo(req), P = await leerPeticiones(), p = P.find(x => x.id === b.id);
  if (!p) return responder(res, 404, { error: "no_existe" });
  if (b.accion === "robot_preparada") {
    Object.assign(p, { estado: "preparada", cambio: Date.now(), temaId: corta(b.temaId, 10), archivo: corta(b.archivo, 80), pr: corta(b.pr, 200) });
    await borrarFotos(p);
  } else if (b.accion === "robot_publicada") Object.assign(p, { estado: "publicada", cambio: Date.now() });
  else if (b.accion === "robot_error") Object.assign(p, { estado: "error", cambio: Date.now(), motivo: corta(b.motivo, 300) });
  else return responder(res, 400, { error: "accion_desconocida" });
  await guardar(P);
  responder(res, 200, { ok: true });
}

export default async function temas(req, res) {
  const q = new URL(req.url || "/", "http://x").searchParams;
  if (req.headers["x-robot"] !== undefined) {
    if (!robotOk(req)) return responder(res, 403, { error: "robot_no" });
    return robot(req, res, q);
  }
  const yo = await quienPanel(req);
  if (!yo) return responder(res, 403, { error: "solo_profes" });
  const mia = p => yo.admin || p.profe === yo.usuario;
  if (req.method === "GET") {
    const P = await leerPeticiones();
    if (q.get("foto") !== null) {
      const p = P.find(x => x.id === q.get("foto"));
      if (!p || !mia(p)) return responder(res, 404, { error: "no_existe" });
      const d = await redis("GET", KF(p.id, Math.max(0, Math.min(LIM.fotos - 1, +q.get("i") || 0))));
      return d ? responder(res, 200, { data: d }) : responder(res, 404, { error: "sin_foto" });
    }
    return responder(res, 200, { peticiones: P.filter(mia).filter(p => p.estado !== "subiendo" || p.profe === yo.usuario).map(vista), limites: LIM });
  }
  const b = cuerpo(req);
  const P = await leerPeticiones(), p = b.id ? P.find(x => x.id === b.id) : null;
  switch (b.accion) {
    case "pedir": {
      const curso = corta(b.curso, 40), asignatura = corta(b.asignatura, 50), titulo = corta(b.titulo, 80);
      if (!curso || !asignatura || !titulo) return responder(res, 400, { error: "faltan_datos" });
      const fotos = Math.max(0, Math.min(LIM.fotos, Math.floor(+b.fotos || 0))), texto = larga(b.texto, LIM.texto);
      if (!fotos && texto.length < 40) return responder(res, 400, { error: "falta_material" });
      const abiertas = P.filter(x => ABIERTA.includes(x.estado));
      if (!yo.admin && abiertas.filter(x => x.profe === yo.usuario).length >= LIM.porProfe) return responder(res, 429, { error: "demasiadas_mias" });
      if (abiertas.length >= LIM.abiertas) return responder(res, 429, { error: "cola_llena" });
      if ((await contar("temaspedir:" + yo.usuario, 3600)) > 10) return responder(res, 429, { error: "espera" });
      const nueva = { id: nuevoId(), profe: yo.usuario, estado: "subiendo", creado: Date.now(), curso, asignatura, tema: corta(b.tema, 10), titulo,
        apartados: larga(b.apartados, 1500), alumnado: (Array.isArray(b.alumnado) ? b.alumnado : []).map(x => corta(x, 60)).filter(Boolean).slice(0, 10),
        notas: larga(b.notas, 1500), texto, fotos, fotosSubidas: 0,
        metodologia: lista(b.metodologia, 8, 60), actividades: lista(b.actividades, 10, 60), juegos: lista(b.juegos, 6, 80), juegoOtro: corta(b.juegoOtro, 200),
        adaptarClase: !!b.adaptarClase };
      /* «Adaptar para todo mi alumnado»: solo cuántos alumnos hay con cada dificultad (nunca quiénes) */
      if (nueva.adaptarClase) {
        const G = await leerGrupos(), cl = b.clase && G.grupos[b.clase] && (yo.admin || G.grupos[b.clase].profe === yo.usuario) ? b.clase : null;
        nueva.clase = cl ? G.grupos[cl].nombre : ""; nueva.difsClase = await resumenClase(yo.usuario, yo.admin, cl);
      }
      P.push(nueva); await guardar(P);
      return responder(res, 200, { ok: true, id: nueva.id });
    }
    case "foto": {
      if (!p || p.profe !== yo.usuario || p.estado !== "subiendo") return responder(res, 404, { error: "no_existe" });
      const i = Math.floor(+b.i);
      if (!(i >= 0 && i < p.fotos)) return responder(res, 400, { error: "foto_de_mas" });
      if (!fotoValida(b.data)) return responder(res, 400, { error: "foto_no_valida" });
      if ((await contar("temasfotos:" + yo.usuario, 3600)) > 60) return responder(res, 429, { error: "espera" });
      await redis("SET", KF(p.id, i), b.data, "EX", LIM.fotoDias * 86400);
      p.fotosSubidas = Math.max(p.fotosSubidas || 0, i + 1); await guardar(P);
      return responder(res, 200, { ok: true });
    }
    case "enviar": {
      if (!p || p.profe !== yo.usuario || p.estado !== "subiendo") return responder(res, 404, { error: "no_existe" });
      if (p.fotos && (p.fotosSubidas || 0) < p.fotos) return responder(res, 400, { error: "faltan_fotos" });
      Object.assign(p, { estado: "pendiente", enviado: Date.now() }); await guardar(P);
      return responder(res, 200, { ok: true });
    }
    case "cancelar": case "borrar": {
      if (!p || !mia(p)) return responder(res, 404, { error: "no_existe" });
      if (b.accion === "cancelar" && !yo.admin && !["subiendo", "pendiente", "aprobada", "rechazada", "error"].includes(p.estado)) return responder(res, 400, { error: "ya_preparada" });
      if (b.accion === "borrar" && !yo.admin) return responder(res, 403, { error: "solo_admin" });
      await borrarFotos(p); await guardar(P.filter(x => x !== p));
      return responder(res, 200, { ok: true });
    }
    case "revisar": {
      if (!yo.admin) return responder(res, 403, { error: "solo_admin" });
      if (!p || !["pendiente", "aprobada", "rechazada", "error"].includes(p.estado)) return responder(res, 404, { error: "no_existe" });
      if (b.decision === "aprobar") Object.assign(p, { estado: "aprobada", nota: larga(b.nota, 1500), revisado: Date.now(), cambio: Date.now(), motivo: "" });
      else if (b.decision === "rechazar") { Object.assign(p, { estado: "rechazada", motivo: corta(b.nota, 300), revisado: Date.now(), cambio: Date.now() }); await borrarFotos(p); }
      else return responder(res, 400, { error: "decision" });
      await guardar(P);
      return responder(res, 200, { ok: true });
    }
  }
  responder(res, 400, { error: "accion_desconocida" });
}
