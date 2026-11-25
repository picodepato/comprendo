/* Canciones de YouTube: escuchar y completar la letra.
   GET  /api/canciones?v=VIDEO&lang=es → letra con tiempos. Primero los subtítulos de YouTube; si YouTube no los da
        (a los servidores de Vercel suele bloquearlos), busca la canción por su título en LRCLIB (lrclib.net, letras
        sincronizadas, gratis y sin clave). NO se guarda nada.
   GET  /api/canciones?q=artista canción → hasta 5 letras de LRCLIB para elegir (cuando no encuentra la buena)
   GET  /api/canciones?tr=palabra&de=es&a=en → traducción de una palabra (traductor gratis MyMemory; se guarda 30 días en caché)
   GET  /api/canciones?id=x            → canción que un profe mandó como deberes (hace falta haber entrado)
   GET  /api/canciones?clases=1        → clases del profe (o todas, el admin), para elegir a quién mandarla
   POST /api/canciones {accion: "asignar", v, titulo, idioma, nivel, lineas, grupo, limite, nota}
        → guarda la canción (solo las de deberes; caduca a los 180 días) y la añade a los deberes */
import { redis, hayDB, usuarioDeSesion, quienPanel, leerJSON, guardarJSON, leerGrupos, nuevoId, contar, ipDe, responder, cuerpo, seguro } from "./_db.js";

const DIAS = 180;
const UA_WEB = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const CLIENTES = [
  { client: { clientName: "ANDROID", clientVersion: "20.10.38", androidSdkVersion: 30, osName: "Android", osVersion: "11" }, ua: "com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip" },
  { client: { clientName: "IOS", clientVersion: "20.10.4", deviceMake: "Apple", deviceModel: "iPhone16,2", osName: "iPhone", osVersion: "18.3.2.22D82" }, ua: "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)" },
  { client: { clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER", clientVersion: "2.0" }, ua: UA_WEB, embed: true }
];
export const videoValido = v => /^[A-Za-z0-9_-]{11}$/.test(String(v || ""));

const conTiempo = (url, ms = 6000) => { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); return [c.signal, () => clearTimeout(t)]; };
async function pedir(url, opc = {}, ms) {
  const [signal, fin] = conTiempo(url, ms);
  try { return await fetch(url, { ...opc, signal }); } finally { fin(); }
}

/* lista de pistas de subtítulos del vídeo: [{url, lang, auto, nombre}] + título */
async function pistas(v, hl) {
  let titulo = "", ultimoError = "sin_subtitulos";
  for (const c of CLIENTES) {
    try {
      const body = { context: { client: { ...c.client, hl: hl || "es", gl: "ES" }, ...(c.embed ? { thirdParty: { embedUrl: "https://www.youtube.com/" } } : {}) }, videoId: v, contentCheckOk: true, racyCheckOk: true };
      const r = await pedir("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", { method: "POST", headers: { "Content-Type": "application/json", "User-Agent": c.ua, "X-Youtube-Client-Name": "3", "Accept-Language": "es-ES,es;q=0.9,en;q=0.8" }, body: JSON.stringify(body) });
      if (!r.ok) { ultimoError = "youtube_" + r.status; continue; }
      const j = await r.json();
      titulo = titulo || (j.videoDetails && j.videoDetails.title) || "";
      const st = j.playabilityStatus && j.playabilityStatus.status;
      if (st && st !== "OK" && !(j.captions)) { ultimoError = st === "LOGIN_REQUIRED" ? "youtube_bloquea" : "no_disponible"; continue; }
      const ts = ((j.captions || {}).playerCaptionsTracklistRenderer || {}).captionTracks || [];
      if (ts.length) return { titulo, lista: ts.map(t => ({ url: t.baseUrl, lang: (t.languageCode || "").toLowerCase(), auto: t.kind === "asr", nombre: (t.name && (t.name.simpleText || (t.name.runs || []).map(x => x.text).join(""))) || t.languageCode })) };
    } catch (e) { ultimoError = "youtube_no_responde"; }
  }
  /* último intento: la página del vídeo */
  try {
    const r = await pedir(`https://www.youtube.com/watch?v=${v}&hl=${hl || "es"}`, { headers: { "User-Agent": UA_WEB, "Accept-Language": "es-ES,es;q=0.9,en;q=0.8", Cookie: "CONSENT=YES+cb; SOCS=CAI" } });
    const h = await r.text();
    titulo = titulo || ((h.match(/<meta name="title" content="([^"]*)"/) || [])[1] || "");
    const m = h.match(/"captionTracks":(\[.*?\])(?:,"audioTracks"|,"translationLanguages")/);
    if (m) { const ts = JSON.parse(m[1]); if (ts.length) return { titulo, lista: ts.map(t => ({ url: t.baseUrl, lang: (t.languageCode || "").toLowerCase(), auto: t.kind === "asr", nombre: t.languageCode })) }; }
    if (/"status":"LOGIN_REQUIRED"|confirm you.re not a bot/i.test(h)) ultimoError = "youtube_bloquea";
  } catch (e) {}
  return { titulo, lista: [], error: ultimoError };
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const desc = s => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e.toLowerCase()] ?? m);
export const limpiar = s => desc(desc(String(s || ""))).replace(/<[^>]+>/g, "").replace(/\[[^\]]*\]|\([^)]*(?:music|música|musica|aplausos|applause|risas|laughter)[^)]*\)/gi, " ").replace(/[♪♫♬🎵🎶]/g, " ").replace(/^\s*[-–>]+\s*/, "").replace(/\s+/g, " ").trim();

/* convierte la respuesta de YouTube (json3, srv3 o XML clásico) en [{t, d, x}] (segundos) */
export function aLineas(txt) {
  let L = [];
  const s = String(txt || "").trim();
  if (s.startsWith("{")) {
    const j = JSON.parse(s);
    for (const e of j.events || []) {
      if (!e.segs) continue;
      const x = e.segs.map(g => g.utf8 || "").join("");
      if (!x.trim()) continue;
      L.push({ t: (e.tStartMs || 0) / 1000, d: (e.dDurationMs || 0) / 1000, x });
    }
  } else if (/<p\s/.test(s)) {
    for (const m of s.matchAll(/<p\s+t="(\d+)"(?:\s+d="(\d+)")?[^>]*>([\s\S]*?)<\/p>/g)) L.push({ t: +m[1] / 1000, d: +(m[2] || 0) / 1000, x: m[3] });
  } else {
    for (const m of s.matchAll(/<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g)) L.push({ t: +m[1], d: +(m[2] || 0), x: m[3] });
  }
  return ordenar(L);
}
/* limpia, ordena y hace que cada línea acabe cuando empieza la siguiente (los automáticos se solapan) */
export function ordenar(L) {
  L = L.map(l => ({ t: +l.t || 0, d: +l.d || 0, x: limpiar(l.x) })).filter(l => l.x && /[\p{L}\p{N}]/u.test(l.x)).sort((a, b) => a.t - b.t);
  const out = [];
  for (const l of L) {
    const p = out[out.length - 1];
    if (p && p.x === l.x && l.t - (p.t + p.d) < 1) { p.d = Math.max(p.d, l.t + l.d - p.t); continue; }
    out.push(l);
  }
  for (let i = 0; i < out.length; i++) {
    const n = out[i + 1];
    if (n && out[i].t + out[i].d > n.t) out[i].d = Math.max(0.3, n.t - out[i].t);
    if (!out[i].d) out[i].d = n ? Math.max(0.3, n.t - out[i].t) : 4;
    out[i].t = Math.round(out[i].t * 100) / 100; out[i].d = Math.round(out[i].d * 100) / 100;
  }
  return out.slice(0, 600);
}

function elegir(lista, lang) {
  const base = l => l.split("-")[0];
  return lista.find(t => base(t.lang) === lang && !t.auto) || lista.find(t => base(t.lang) === lang) || lista.find(t => !t.auto) || lista[0];
}

/* ---------- LRCLIB: letras sincronizadas buscadas por el título del vídeo ---------- */
const UA_APP = "Comprendo (web educativa de lectura e idiomas)";
async function tituloVideo(v) {
  try {
    const r = await pedir(`https://www.youtube.com/oembed?url=${encodeURIComponent("https://www.youtube.com/watch?v=" + v)}&format=json`, { headers: { "User-Agent": UA_WEB } }, 5000);
    if (r.ok) { const j = await r.json(); return { titulo: j.title || "", canal: j.author_name || "" }; }
  } catch (e) {}
  return { titulo: "", canal: "" };
}
/* «Artista - Canción (Official Video) ft. X» → «Artista Canción» */
export const limpiarTitulo = t => String(t || "").replace(/\([^)]*\)|\[[^\]]*\]|【[^】]*】/g, " ")
  .replace(/\b(official|oficial|music|video|vídeo|videoclip|lyrics?|letra|audio|visualizer|hd|4k|remastered|remaster|en vivo|live)\b/gi, " ")
  .replace(/\b(ft|feat|featuring)\.?\s.*$/i, " ").replace(/[|•–—"“”]/g, " ").replace(/\s+-\s+/g, " ").replace(/\s+/g, " ").trim();
const canalLimpio = c => String(c || "").replace(/vevo$|\s*-\s*topic$|official|oficial/gi, "").trim();
const sinAcentos = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
export async function buscarLrclib(q) {
  if (!q || q.length < 2) return [];
  try {
    const r = await pedir("https://lrclib.net/api/search?q=" + encodeURIComponent(q.slice(0, 150)), { headers: { "User-Agent": UA_APP } }, 7000);
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j) ? j.filter(x => !x.instrumental && (x.syncedLyrics || x.plainLyrics)) : [];
  } catch (e) { return []; }
}
/* LRC «[01:02.50] texto» → [{t, d, x}] */
export function deLrc(txt) {
  const L = [];
  for (const ln of String(txt || "").split(/\r?\n/)) {
    const ts = [...ln.matchAll(/\[(\d+):(\d+(?:[.:]\d+)?)\]/g)], x = ln.replace(/\[[^\]]*\]/g, "").trim();
    for (const m of ts) L.push({ t: +m[1] * 60 + parseFloat(m[2].replace(":", ".")), d: 0, x });
  }
  return ordenar(L.sort((a, b) => a.t - b.t).map((l, i, a) => ({ ...l, d: a[i + 1] ? a[i + 1].t - l.t : 5 })));
}
const dePlano = txt => String(txt || "").split(/\r?\n/).map(x => ({ t: 0, d: 0, x })).map(l => ({ ...l, x: limpiar(l.x) })).filter(l => /[\p{L}\p{N}]/u.test(l.x)).slice(0, 600);
/* puntúa lo bien que encaja un resultado con el título y el canal del vídeo */
function puntuar(x, titulo, canal) {
  const t = sinAcentos(titulo), c = sinAcentos(canalLimpio(canal)), tn = sinAcentos(x.trackName), an = sinAcentos(x.artistName);
  let p = 0;
  if (tn && t.includes(tn)) p += 3;
  if (an && (t.includes(an) || (c && (c.includes(an) || an.includes(c))))) p += 2;
  if (x.syncedLyrics) p += 2;
  return p;
}
const aCancion = x => ({ id: x.id, titulo: `${x.artistName || ""} - ${x.trackName || ""}`.replace(/^ - | - $/g, ""), dur: x.duration || 0, sincronizada: !!x.syncedLyrics, lineas: x.syncedLyrics ? deLrc(x.syncedLyrics) : dePlano(x.plainLyrics) });
async function letraPorTitulo(v) {
  const { titulo, canal } = await tituloVideo(v);
  if (!titulo) return null;
  const video = titulo;
  const q1 = limpiarTitulo(titulo), canalOk = canalLimpio(canal);
  let res = await buscarLrclib(q1);
  if (!res.length && canalOk && !sinAcentos(q1).includes(sinAcentos(canalOk))) res = await buscarLrclib(canalOk + " " + q1);
  const mejor = res.map(x => [puntuar(x, titulo, canal), x]).filter(([p]) => p >= 3).sort((a, b) => b[0] - a[0])[0];
  if (!mejor) return { video };
  const c = aCancion(mejor[1]);
  return c.lineas.length >= 2 ? { video, ...c } : { video };
}

async function subtitulos(v, lang) {
  /* YouTube y LRCLIB a la vez: si YouTube da subtítulos del autor, mandan; si no, la letra sincronizada de LRCLIB */
  const [yt, lr] = await Promise.all([subtitulosYT(v, lang).catch(() => [404, { error: "youtube_no_responde" }]), letraPorTitulo(v).catch(() => null)]);
  const okYT = yt[0] === 200 && !yt[1].auto;
  if (okYT) return yt;
  const deLr = () => [200, { v, titulo: lr.video, idioma: null, auto: false, origen: "lrclib", lrc: { id: lr.id, nombre: lr.titulo, dur: lr.dur, sincronizada: lr.sincronizada }, lineas: lr.lineas }];
  if (lr && lr.lineas && lr.sincronizada) return deLr();
  if (yt[0] === 200) return yt;
  if (lr && lr.lineas) return deLr();
  return [404, { ...yt[1], titulo: (lr && lr.video) || yt[1].titulo || "" }];
}

async function subtitulosYT(v, lang) {
  const P = await pistas(v, lang);
  if (!P.lista.length) return [404, { error: P.error || "sin_subtitulos", titulo: P.titulo }];
  const orden = [elegir(P.lista, lang), ...P.lista].filter((t, i, a) => t && a.indexOf(t) === i);
  for (const t of orden.slice(0, 3)) {
    for (const fmt of ["json3", null]) {
      try {
        const u = new URL(t.url.startsWith("http") ? t.url : "https://www.youtube.com" + t.url);
        u.searchParams.delete("fmt"); if (fmt) u.searchParams.set("fmt", fmt);
        const r = await pedir(u.toString(), { headers: { "User-Agent": UA_WEB, "Accept-Language": "es-ES,es;q=0.9" } });
        if (!r.ok) continue;
        const lineas = aLineas(await r.text());
        if (lineas.length >= 2) return [200, { v, titulo: P.titulo, idioma: t.lang.split("-")[0], auto: t.auto, pista: t.nombre, otras: [...new Set(P.lista.map(x => x.lang.split("-")[0]))], lineas }];
      } catch (e) {}
    }
  }
  return [404, { error: "sin_subtitulos", titulo: P.titulo }];
}

/* la canción que manda un profe: se comprueba y se recorta */
/* traducción de una palabra con MyMemory (gratis, sin clave). null = el traductor no responde */
export function limpiarTraduccion(j, w) {
  const t = String(j && j.responseData && j.responseData.translatedText || "").trim();
  if (!t || /MYMEMORY|QUERY LENGTH|INVALID|PLEASE SELECT/i.test(t) || t.length > 60 || t.toLowerCase() === w.toLowerCase()) return "";
  return w === w.toLowerCase() ? t.toLowerCase() : t;
}
async function traducir(w, de, a) {
  try {
    const r = await pedir(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(w)}&langpair=${de}|${a}`, { headers: { "User-Agent": "Comprendo (web educativa de lectura e idiomas)" } }, 5000);
    if (!r.ok) return null;
    return limpiarTraduccion(await r.json(), w);
  } catch (e) { return null; }
}

function validarCancion(b) {
  const v = videoValido(b.v) ? b.v : "";
  const lineas = Array.isArray(b.lineas) ? b.lineas.slice(0, 600).map(l => ({ t: Math.max(0, +l.t || 0), d: Math.max(0, +l.d || 0), x: String(l.x || "").slice(0, 300) })).filter(l => l.x.trim()) : [];
  if (lineas.length < 2) return null;
  return { v, titulo: String(b.titulo || "").slice(0, 120) || "Canción", idioma: /^[a-z]{2}$/.test(b.idioma) ? b.idioma : "es", nivel: Math.min(4, Math.max(1, +b.nivel || 2)), tiempos: lineas.some(l => l.t > 0), lineas };
}

export default async function handler(req, res) {
  await seguro(res, async () => {
    const q = req.query || {};
    if (req.method === "GET" && q.v !== undefined) {
      if (!videoValido(q.v)) return responder(res, 400, { error: "enlace_no_valido" });
      if (hayDB() && (await contar("subs:" + ipDe(req), 3600)) > 150) return responder(res, 429, { error: "demasiadas" });
      const [c, d] = await subtitulos(q.v, /^[a-z]{2}$/.test(q.lang) ? q.lang : "es");
      return responder(res, c, d);
    }
    if (req.method === "GET" && q.q !== undefined) {
      if (hayDB() && (await contar("subs:" + ipDe(req), 3600)) > 150) return responder(res, 429, { error: "demasiadas" });
      const r = (await buscarLrclib(String(q.q).trim())).sort((a, b) => !!b.syncedLyrics - !!a.syncedLyrics).slice(0, 5).map(aCancion).filter(c => c.lineas.length >= 2);
      return responder(res, r.length ? 200 : 404, r.length ? { resultados: r } : { error: "sin_resultados" });
    }
    if (req.method === "GET" && q.tr !== undefined) {
      const w = String(q.tr).trim(), de = String(q.de || ""), a = String(q.a || "");
      if (!w || w.length > 40 || !/^[a-z]{2}$/.test(de) || !/^[a-z]{2}$/.test(a) || de === a) return responder(res, 400, { error: "no_valido" });
      const clave = `trad:${de}:${a}:${w.toLowerCase()}`;
      if (hayDB()) {
        const c = await redis("GET", clave).catch(() => null);
        if (c !== null && c !== undefined) return responder(res, c ? 200 : 404, c ? { t: c } : { error: "sin_traduccion" });
        if ((await contar("tr:" + ipDe(req), 3600)) > 300) return responder(res, 429, { error: "demasiadas" });
      }
      const t = await traducir(w, de, a);
      if (t === null) return responder(res, 502, { error: "traductor" });
      if (hayDB()) await redis("SET", clave, t, "EX", 30 * 86400).catch(() => {});
      return responder(res, t ? 200 : 404, t ? { t } : { error: "sin_traduccion" });
    }
    if (req.method === "GET" && q.id !== undefined) {
      if (!(await usuarioDeSesion(req))) return responder(res, 401, { error: "entra" });
      if (!/^[a-f0-9]{12}$/.test(String(q.id))) return responder(res, 400, { error: "no_valido" });
      const c = await leerJSON("cancion:" + q.id, null);
      return c ? responder(res, 200, { id: q.id, ...c }) : responder(res, 404, { error: "no_existe" });
    }
    const yo = await quienPanel(req);
    if (!yo) return responder(res, 403, { error: "solo_profes" });
    const G = await leerGrupos();
    const mias = Object.keys(G.grupos).filter(id => yo.admin || G.grupos[id].profe === yo.usuario);
    if (req.method === "GET") return responder(res, 200, { admin: yo.admin, clases: mias.map(id => ({ id, nombre: G.grupos[id].nombre })) });
    if (req.method !== "POST") return responder(res, 405, { error: "metodo" });
    const b = cuerpo(req);
    if (b.accion !== "asignar") return responder(res, 400, { error: "accion" });
    const c = validarCancion(b), limite = String(b.limite || "");
    if (!c || !/^\d{4}-\d{2}-\d{2}$/.test(limite)) return responder(res, 400, { error: "datos_no_validos" });
    if (!yo.admin && !mias.length) return responder(res, 400, { error: "sin_clases" });
    const grupo = b.grupo && mias.includes(b.grupo) ? b.grupo : null;
    const id = nuevoId();
    await redis("SET", "cancion:" + id, JSON.stringify({ ...c, profe: yo.admin ? null : yo.usuario, creado: Date.now() }), "EX", DIAS * 86400);
    const D = await leerJSON("admin:deberes", []);
    D.push({ id: nuevoId(), lectura: "cancion", cancion: id, titulo: c.titulo, grupo, profe: yo.admin ? null : yo.usuario, limite, nota: String(b.nota || "").slice(0, 200), creado: Date.now() });
    await guardarJSON("admin:deberes", D);
    responder(res, 200, { id });
  });
}
