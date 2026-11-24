/* Buscar imágenes en Pixabay para las flashcards (solo se devuelven enlaces; no se guarda ninguna imagen).
   GET ?src=pixabay&q=perro&lang=es  → {imgs: [{id, u, by, p}]}
   GET ?src=pixabay&id=123           → la misma imagen con un enlace nuevo (los de Pixabay caducan)
   Necesita la variable PIXABAY_KEY en Vercel (clave gratis en https://pixabay.com/api/docs/).
   Las búsquedas se guardan 24 h en la base de datos, como pide Pixabay. Siempre con safesearch. */
import { redis, responder, seguro, hayDB, contar, ipDe } from "./_db.js";
const LANGS = ["es", "en", "de", "it", "fr", "pt"];
export default (req, res) => seguro(res, async () => {
  const KEY = process.env.PIXABAY_KEY;
  if (!KEY) return responder(res, 200, { error: "sin_clave" });
  const q = req.query || {};
  const id = String(q.id || ""), texto = String(q.q || "").trim().toLowerCase().slice(0, 80);
  const lang = LANGS.includes(q.lang) ? q.lang : "es";
  if (!/^\d{1,12}$/.test(id) && !texto) return responder(res, 400, { error: "falta_busqueda" });
  const ck = id ? "pix:id:" + id : `pix:q:${lang}:${texto}`;
  if (hayDB()) {
    const c = await redis("GET", ck);
    if (c) return responder(res, 200, { imgs: JSON.parse(c) });
    if ((await contar("pixip:" + ipDe(req), 60)) > 30) return responder(res, 429, { error: "demasiadas_busquedas" });
  }
  const u = new URL("https://pixabay.com/api/");
  u.searchParams.set("key", KEY); u.searchParams.set("safesearch", "true"); u.searchParams.set("per_page", "24");
  if (id) u.searchParams.set("id", id); else { u.searchParams.set("q", texto); u.searchParams.set("lang", lang); }
  const r = await fetch(u);
  if (!r.ok) return responder(res, r.status === 429 ? 429 : 502, { error: "pixabay_" + r.status });
  const j = await r.json();
  const imgs = (j.hits || []).map(h => ({ id: h.id, u: h.webformatURL, by: String(h.user || "").slice(0, 40), p: h.pageURL }));
  if (hayDB()) await redis("SET", ck, JSON.stringify(imgs), "EX", 86400);
  responder(res, 200, { imgs });
});
