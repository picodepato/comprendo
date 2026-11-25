// Simula Vercel (estáticos + /api) y Upstash (REST) para probar en local
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const RAIZ = process.argv[2], PUERTO = +process.argv[3] || 8790;
const kv = new Map(), exp = new Map();
const vivo = k => { if (exp.has(k) && exp.get(k) < Date.now()) { kv.delete(k); exp.delete(k); } return kv.has(k); };
http.createServer((q, r) => { let b = ""; q.on("data", c => b += c); q.on("end", () => {
  const a = JSON.parse(b), c = a[0].toUpperCase(), k = a[1]; let res = null;
  if (c === "GET") res = vivo(k) ? kv.get(k) : null;
  else if (c === "SET") { const nx = a.includes("NX"); if (nx && vivo(k)) res = null; else { kv.set(k, a[2]); exp.delete(k); const i = a.indexOf("EX"); if (i > 0) exp.set(k, Date.now() + a[i + 1] * 1000); res = "OK"; } }
  else if (c === "INCR") { const n = (vivo(k) ? +kv.get(k) : 0) + 1; kv.set(k, String(n)); res = n; }
  else if (c === "EXPIRE") { if (vivo(k)) exp.set(k, Date.now() + a[2] * 1000); res = 1; }
  else if (c === "DEL") { res = a.slice(1).filter(x => kv.delete(x)).length; }
  else if (c === "SREM") { const st = vivo(k) ? kv.get(k) : new Set(); res = a.slice(2).filter(x => st.delete(x)).length; }
  else if (c === "LPUSH") { const l = vivo(k) ? kv.get(k) : []; kv.set(k, l); l.unshift(...a.slice(2).reverse()); res = l.length; }
  else if (c === "MGET") res = a.slice(1).map(x => vivo(x) ? kv.get(x) : null);
  else if (c === "KEYS") { const re = new RegExp("^" + k.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$"); res = [...kv.keys()].filter(x => vivo(x) && re.test(x) && !Array.isArray(kv.get(x)) && !(kv.get(x) instanceof Set) && !(kv.get(x) instanceof Map)); }
  else if (c === "SADD") { const st = vivo(k) ? kv.get(k) : new Set(); kv.set(k, st); let n = 0; for (const x of a.slice(2)) if (!st.has(x)) { st.add(x); n++; } res = n; }
  else if (c === "SMEMBERS") res = vivo(k) ? [...kv.get(k)] : [];
  else if (c === "RPUSH") { const l = vivo(k) ? kv.get(k) : []; kv.set(k, l); l.push(...a.slice(2)); res = l.length; }
  else if (c === "LRANGE") { const l = vivo(k) ? kv.get(k) : []; const n = l.length, i0 = a[2] < 0 ? Math.max(0, n + a[2]) : a[2], i1 = a[3] < 0 ? n + a[3] : Math.min(a[3], n - 1); res = l.slice(i0, i1 + 1); }
  else if (c === "LTRIM") { const l = vivo(k) ? kv.get(k) : []; const n = l.length, i0 = a[2] < 0 ? Math.max(0, n + a[2]) : a[2], i1 = a[3] < 0 ? n + a[3] : a[3]; kv.set(k, l.slice(i0, i1 + 1)); res = "OK"; }
  else if (c === "LREM") { const l = vivo(k) ? kv.get(k) : []; const i = l.indexOf(a[3]); if (i >= 0) l.splice(i, 1); res = i >= 0 ? 1 : 0; }
  else if (c === "HSET") { const h = vivo(k) ? kv.get(k) : new Map(); kv.set(k, h); let n = 0; for (let i = 2; i < a.length; i += 2) { if (!h.has(a[i])) n++; h.set(a[i], a[i + 1]); } res = n; }
  else if (c === "HSETNX") { const h = vivo(k) ? kv.get(k) : new Map(); kv.set(k, h); if (h.has(a[2])) res = 0; else { h.set(a[2], a[3]); res = 1; } }
  else if (c === "HGETALL") { res = vivo(k) ? [...kv.get(k)].flat() : []; }
  else if (c === "HLEN") { res = vivo(k) ? kv.get(k).size : 0; }
  else if (c === "HEXISTS") { res = vivo(k) && kv.get(k).has(a[2]) ? 1 : 0; }
  else if (c === "HDEL") { res = vivo(k) ? a.slice(2).filter(x => kv.get(k).delete(x)).length : 0; }
  r.setHeader("content-type", "application/json"); r.end(JSON.stringify({result: res}));
}); }).listen(PUERTO + 1);
process.env.KV_REST_API_URL = `http://localhost:${PUERTO + 1}`; process.env.KV_REST_API_TOKEN = "x";
const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml"};
http.createServer(async (q, r) => {
  const u = new URL(q.url, "http://x"); let b = ""; for await (const c of q) b += c;
  if (u.pathname.startsWith("/api/")) {
    const f = path.join(RAIZ, u.pathname + ".js");
    if (!fs.existsSync(f)) { r.statusCode = 404; return r.end("{}"); }
    const h = (await import(f)).default;
    let body = b; if ((q.headers["content-type"] || "").includes("json")) try { body = JSON.parse(b || "{}"); } catch (e) {}
    const req = {method: q.method, url: q.url, query: Object.fromEntries(u.searchParams), headers: q.headers, body};
    const res = {setHeader: (a, v) => r.setHeader(a, v), status(c) { r.statusCode = c; return res; }, json(o) { r.setHeader("content-type", "application/json"); r.end(JSON.stringify(o)); }};
    return h(req, res);
  }
  let f = path.join(RAIZ, decodeURIComponent(u.pathname)); if (u.pathname.endsWith("/")) f += "index.html";
  if (!fs.existsSync(f)) { r.statusCode = 404; return r.end("no"); }
  r.setHeader("content-type", TIPOS[path.extname(f)] || "application/octet-stream"); fs.createReadStream(f).pipe(r);
}).listen(PUERTO, () => console.log("ok", PUERTO));
