/* Votar el próximo tema. GET: recuento. POST {tema, aparato}: un voto por tema y aparato.
   Doblajes de la clase (doblaje/doblaje.js), en esta misma función porque Vercel gratis tiene un máximo de 12:
   GET  /api/votos?dob=lista[&grupo=id] → doblajes de la clase (sin el audio) con sus votos
   GET  /api/votos?dob=ver&id=x         → un doblaje con su audio (base64) y la escena para verlo con el vídeo
   POST /api/votos {dob: "enviar", audio, mime, t0, dur, v, titulo, idioma, inicio, fin, ajuste, lineas, escena}
        → el alumno manda su doblaje a la votación de su clase (uno por escena: el nuevo sustituye al anterior; caduca a los 60 días)
   POST /api/votos {dob: "votar", id}   → un voto por alumno y escena (puede cambiarlo; no vale votarse a sí mismo)
   POST /api/votos {dob: "borrar", id}  → el autor, el profe de la clase o el admin
   Claves: dobs:<grupo> = [{id, autor, esc, titulo, v, inicio, dur, creado, votos: [usuarios]}], doba:<id> = {audio, mime, …} */
import { redis, leerJSON, guardarJSON, leerGrupos, usuarioDeSesion, nuevoId, contar, ADMIN, responder, cuerpo, seguro } from "./_db.js";
const BASE = ["tiburones", "esports", "cuerpo", "internet", "olimpicos"];
/* temas añadidos por el admin al aprobar una propuesta */
const extra = () => leerJSON("temas:extra", []);
let TEMAS = BASE;
const cargar = async () => { const x = await extra(); TEMAS = [...BASE, ...x.map(t => t.id)]; return x; };
const contarVotos = async () => { const v = {}; for (const t of TEMAS) v[t] = +(await redis("GET", "votos:" + t)) || 0; return v; };

/* ---------- doblajes ---------- */
const DIAS_DOB = 60, MAX_CLASE = 80, MAX_AUDIO = 1200000; /* ~900 KB de audio: unos 3 minutos a 32 kbps */
const videoValido = v => /^[A-Za-z0-9_-]{11}$/.test(String(v || ""));
const idValido = x => /^[a-f0-9]{12}$/.test(String(x || ""));
const vivos = L => (Array.isArray(L) ? L : []).filter(d => d && Date.now() - (d.creado || 0) < DIAS_DOB * 864e5);
/* quién soy y qué clases puedo ver */
async function yoDob(req) {
  const u = await usuarioDeSesion(req); if (!u) return null;
  const perfil = u === ADMIN ? { rol: "admin" } : await leerJSON("usuario:" + u, {}), rol = perfil.rol || "alumno";
  const G = await leerGrupos();
  const clases = rol === "admin" ? Object.keys(G.grupos) : rol === "profe" ? Object.keys(G.grupos).filter(id => G.grupos[id].profe === u) : (G.miembros[u] && G.grupos[G.miembros[u]] ? [G.miembros[u]] : []);
  return { u, rol, G, clases };
}
const publico = (d, u) => ({ id: d.id, autor: d.autor, esc: d.esc, titulo: d.titulo, v: d.v, inicio: d.inicio, dur: d.dur, creado: d.creado, votos: (d.votos || []).length, mivoto: (d.votos || []).includes(u), mio: d.autor === u });
function limpiarLineas(L) {
  return (Array.isArray(L) ? L : []).slice(0, 300).map(l => ({ t: Math.max(0, +l.t || 0), d: Math.max(0, +l.d || 0), x: String(l.x || "").slice(0, 300), ...(l.who ? { who: String(l.who).slice(0, 30) } : {}) })).filter(l => l.x.trim());
}
async function doblaje(req, res, q) {
  const yo = await yoDob(req);
  if (!yo) return responder(res, 401, { error: "entra" });
  const { u, rol, G, clases } = yo;
  if (req.method === "GET" && q.dob === "lista") {
    const grupo = q.grupo && clases.includes(q.grupo) ? q.grupo : clases[0] || null;
    if (!grupo) return responder(res, 200, { grupo: null, clases: [], rol, yo: u, doblajes: [] });
    const L = vivos(await leerJSON("dobs:" + grupo, []));
    return responder(res, 200, { grupo, nombre: G.grupos[grupo].nombre, clases: rol === "alumno" ? [] : clases.map(id => ({ id, nombre: G.grupos[id].nombre })), rol, yo: u, doblajes: L.map(d => publico(d, u)) });
  }
  if (req.method === "GET" && q.dob === "ver") {
    if (!idValido(q.id)) return responder(res, 400, { error: "no_valido" });
    const a = await leerJSON("doba:" + q.id, null);
    if (!a || !clases.includes(a.grupo)) return responder(res, 404, { error: "no_existe" });
    const m = vivos(await leerJSON("dobs:" + a.grupo, [])).find(d => d.id === q.id);
    if (!m) return responder(res, 404, { error: "no_existe" });
    return responder(res, 200, { ...a, ...publico(m, u) });
  }
  if (req.method !== "POST") return responder(res, 405, { error: "metodo" });
  const b = cuerpo(req);
  if (b.dob === "enviar") {
    if (rol !== "alumno" || !clases.length) return responder(res, 400, { error: "sin_clase" });
    const grupo = clases[0], audio = String(b.audio || ""), mime = String(b.mime || "");
    if (!audio || audio.length > MAX_AUDIO || !/^[A-Za-z0-9+/]+=*$/.test(audio)) return responder(res, 413, { error: "audio_grande" });
    if (!/^audio\/(webm|mp4|ogg|mpeg|aac|x-m4a|wav)(;[a-z0-9=.,\s-]*)?$/i.test(mime) || mime.length > 60) return responder(res, 400, { error: "audio_no_valido" });
    if ((await contar("dobenv:" + u, 3600)) > 20) return responder(res, 429, { error: "demasiados" });
    const v = videoValido(b.v) ? b.v : "", inicio = Math.max(0, +b.inicio || 0), fin = Math.max(inicio, +b.fin || 0), dur = Math.min(600, Math.max(0, +b.dur || 0));
    const escena = idValido(b.escena) ? b.escena : null, esc = escena || `v:${v}:${Math.round(inicio)}`;
    const titulo = String(b.titulo || "").slice(0, 120) || "Doblaje", lineas = limpiarLineas(b.lineas);
    const id = nuevoId();
    let L = vivos(await leerJSON("dobs:" + grupo, []));
    const viejos = L.filter(d => d.autor === u && d.esc === esc);   /* un doblaje por alumno y escena */
    L = L.filter(d => !viejos.includes(d));
    L.push({ id, autor: u, esc, titulo, v, inicio, dur, creado: Date.now(), votos: [] });
    const sobran = L.length > MAX_CLASE ? L.splice(0, L.length - MAX_CLASE) : [];
    await redis("SET", "doba:" + id, JSON.stringify({ grupo, audio, mime, t0: Math.max(0, +b.t0 || 0), v, inicio, fin, titulo, idioma: /^[a-z]{2}$/.test(b.idioma) ? b.idioma : "es", ajuste: Math.max(-30, Math.min(30, +b.ajuste || 0)), lineas }), "EX", DIAS_DOB * 86400);
    await guardarJSON("dobs:" + grupo, L);
    const borrar = [...viejos, ...sobran].map(d => "doba:" + d.id);
    if (borrar.length) await redis("DEL", ...borrar);
    return responder(res, 200, { ok: true, id, sustituido: viejos.length > 0 });
  }
  if (b.dob === "votar" || b.dob === "borrar") {
    if (!idValido(b.id)) return responder(res, 400, { error: "no_valido" });
    const a = await leerJSON("doba:" + b.id, null);
    if (!a || !clases.includes(a.grupo)) return responder(res, 404, { error: "no_existe" });
    let L = vivos(await leerJSON("dobs:" + a.grupo, []));
    const m = L.find(d => d.id === b.id);
    if (!m) return responder(res, 404, { error: "no_existe" });
    if (b.dob === "borrar") {
      if (m.autor !== u && rol === "alumno") return responder(res, 403, { error: "no_es_tuyo" });
      L = L.filter(d => d !== m);
      await guardarJSON("dobs:" + a.grupo, L); await redis("DEL", "doba:" + m.id);
      return responder(res, 200, { ok: true });
    }
    if (rol !== "alumno") return responder(res, 400, { error: "solo_alumnos" });
    if (m.autor === u) return responder(res, 400, { error: "propio" });
    for (const d of L) if (d.esc === m.esc) d.votos = (d.votos || []).filter(x => x !== u);   /* un voto por escena: se mueve */
    if (!b.quitar) m.votos.push(u);
    await guardarJSON("dobs:" + a.grupo, L);
    return responder(res, 200, { ok: true, doblajes: L.filter(d => d.esc === m.esc).map(d => publico(d, u)) });
  }
  return responder(res, 400, { error: "accion" });
}

export default (req, res) => seguro(res, async () => {
  const q = req.query || {};
  if (q.dob || (req.method === "POST" && cuerpo(req).dob)) return doblaje(req, res, q);
  const temas = await cargar();
  if (req.method === "GET") return responder(res, 200, { ok: true, votos: await contarVotos(), temas });
  if (req.method === "POST") {
    const { tema, aparato } = cuerpo(req);
    if (!TEMAS.includes(tema) || !/^[a-f0-9]{16,40}$/.test(String(aparato || ""))) return responder(res, 400, { error: "voto_no_valido" });
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x", k = "votosip:" + ip, n = await redis("INCR", k);
    if (n === 1) await redis("EXPIRE", k, 3600);
    if (n > 40) return responder(res, 429, { error: "demasiados_votos" });
    const nuevo = await redis("SET", `voto:${tema}:${aparato}`, "1", "NX");
    if (nuevo) await redis("INCR", "votos:" + tema);
    return responder(res, 200, { ok: true, nuevo: !!nuevo, votos: await contarVotos(), temas });
  }
  responder(res, 405, { error: "Usa GET o POST" });
});
