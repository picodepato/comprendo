/* Perfil de cada alumno: sus dificultades y qué se le adapta (lo marca su profe). Lo usan «Añadir un tema» y el cuaderno de clase.
   Ruta: /api/perfiles (vercel.json la manda a /api/admin?t=perfiles, sin gastar otra función de Vercel).
   Datos: perfil:<alumno> = {dif: [claves de LYATemasProfe.DIFICULTADES], adaptar: {temas: true, …}, notas, por: <profe>, t}
   Profe (sus alumnos) o admin (todos):
     GET  ?grupo=<id>          → {perfiles: {alumno: perfil}, alumnos: [...]} de esa clase (sin grupo: de todas sus clases)
     GET  ?clase=<id>&resumen=1 → {dif: {tdah: 2, …}, n} cuántos alumnos con cada dificultad (sin nombres; para pedir un tema)
     POST {accion: "perfil", usuario, dif, adaptar, notas} → guarda (dif vacío y sin notas = borra)
   Alumno: GET → {perfil: {dif, adaptar}} el suyo (nunca las notas del profe). */
import { redis, usuarioDeSesion, leerJSON, leerGrupos, normUsuario, ADMIN, responder, cuerpo } from "./_db.js";

export const DIFS = ["facil", "nee", "tdah", "dislexia", "tea", "idioma", "dibujos", "muchos", "normal"];
export const ADAPTAR = ["temas", "fpb", "mates", "lecturas"];
const K = u => "perfil:" + u;
const leer = x => { try { return JSON.parse(x || "null"); } catch (e) { return null; } };
export const leerPerfil = async u => leer(await redis("GET", K(u)));
/* el perfil que ve el propio alumno */
const publico = p => p ? { dif: p.dif || [], adaptar: p.adaptar || {} } : { dif: [], adaptar: {} };

/* alumnos de un profe (los de sus clases); el admin, todos los de las clases o de la clase pedida */
function suyos(G, yo, grupo) {
  const ids = Object.keys(G.grupos).filter(id => (yo.admin || G.grupos[id].profe === yo.usuario) && (!grupo || id === grupo));
  const set = new Set(ids);
  return Object.keys(G.miembros).filter(u => set.has(G.miembros[u]));
}
export async function resumenClase(profe, admin, grupo) {
  const G = await leerGrupos(), us = suyos(G, { usuario: profe, admin }, grupo);
  const ps = us.length ? await redis("MGET", ...us.map(K)) : [], dif = {};
  ps.map(leer).filter(Boolean).forEach(p => (p.dif || []).forEach(d => { dif[d] = (dif[d] || 0) + 1; }));
  return { dif, n: us.length };
}

export default async function perfiles(req, res) {
  const u = await usuarioDeSesion(req);
  if (!u) return responder(res, 401, { error: "sin_sesion" });
  const yoD = u === ADMIN ? { rol: "admin" } : await leerJSON("usuario:" + u, {}), rol = yoD.rol || "alumno";
  const q = new URL(req.url || "/", "http://x").searchParams;
  if (rol === "alumno") {
    if (req.method !== "GET") return responder(res, 403, { error: "solo_profes" });
    return responder(res, 200, { perfil: publico(await leerPerfil(u)) });
  }
  const yo = { usuario: u, admin: rol === "admin" };
  if (req.method === "GET") {
    const grupo = q.get("clase") || q.get("grupo") || null;
    if (q.get("resumen")) return responder(res, 200, await resumenClase(u, yo.admin, grupo));
    const G = await leerGrupos(), us = suyos(G, yo, grupo);
    const ps = us.length ? await redis("MGET", ...us.map(K)) : [];
    const clases = Object.fromEntries(Object.keys(G.grupos).filter(id => yo.admin || G.grupos[id].profe === u).map(id => [id, G.grupos[id].nombre]));
    return responder(res, 200, { clases, clase: Object.fromEntries(us.map(x => [x, G.miembros[x]])), alumnos: us, perfiles: Object.fromEntries(us.map((x, i) => [x, leer(ps[i])]).filter(([, p]) => p)) });
  }
  const b = cuerpo(req);
  if (b.accion !== "perfil") return responder(res, 400, { error: "accion_desconocida" });
  const al = normUsuario(b.usuario), G = await leerGrupos();
  if (!suyos(G, yo, null).includes(al)) return responder(res, 403, { error: "no_es_tu_alumno" });
  const dif = [...new Set((Array.isArray(b.dif) ? b.dif : []).filter(d => DIFS.includes(d)))];
  const adaptar = Object.fromEntries(ADAPTAR.map(k => [k, !!(b.adaptar || {})[k]]));
  const notas = String(b.notas || "").replace(/\r/g, "").trim().slice(0, 600);
  if (!dif.length && !notas) await redis("DEL", K(al));
  else await redis("SET", K(al), JSON.stringify({ dif, adaptar, notas, por: u, t: Date.now() }));
  responder(res, 200, { ok: true });
}
