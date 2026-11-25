// Duelo en directo con 1 profe (pantalla grande) y 3 alumnos en navegadores distintos.
// Uso: node qa/prueba-duelo.mjs http://localhost:8790 [carpeta-capturas]   (con qa/servidor-prueba.mjs)
import { createRequire } from "module"; const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const B = process.argv[2] || "http://localhost:8790", CAP = process.argv[3], id = Date.now().toString(36).slice(-5);
const api = async (p, tok, m = "GET", body) => { const r = await fetch(`${B}/api/${p}`, { method: m, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}) }, body: body && JSON.stringify(body) }); return { ok: r.ok, j: await r.json().catch(() => ({})) }; };
let fallos = 0; const ok = (c, m) => { console.log((c ? "ok  " : "MAL ") + m); if (!c) fallos++; };
const prof = (await api("cuenta?a=registro", null, "POST", { usuario: "prof" + id, clave: "clave1234", rol: "profe" })).j;
const als = []; for (let i = 0; i < 3; i++) als.push((await api("cuenta?a=registro", null, "POST", { usuario: `alu${i}x${id}`, clave: "clave1234", progreso: { learn: "es", know: "en", level: "A1" } })).j);
const b = await chromium.launch(), errs = [];
async function pagina(u, w = 1100, h = 800) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(([tok, us, rol]) => { if (!sessionStorage.getItem("h")) { sessionStorage.setItem("h", 1); localStorage.setItem("lyaCuenta", JSON.stringify({ token: tok, usuario: us, rol })); } }, [u.token, u.usuario, u.rol]);
  const p = await ctx.newPage(); p.on("pageerror", e => errs.push(u.usuario + ": " + e.message)); return p;
}
const shot = async (p, n) => { if (CAP) await p.screenshot({ path: `${CAP}/${n}.png`, fullPage: true }); };
const P = await pagina(prof);
await P.goto(B + "/index.html#duelo", { waitUntil: "networkidle" }); await P.waitForTimeout(600);
ok(await P.locator('nav a[href="#duelo"], a[href="#duelo"]').count() > 0, "pestaña Duelo");
ok(await P.locator("#du-new [name=xp_p1]").count() === 1, "el profe ve los premios (XP y logro)");
await P.click('[data-du=lang][data-l=en]'); await P.click('[data-du=lv][data-l=A1]');
await P.locator(".du-card").first().click();
await P.selectOption("#du-new [name=D]", "10"); await P.selectOption("#du-new [name=TL]", "30");
await P.fill("#du-new [name=xp_p1]", "50"); await P.click('[data-du=ic][data-i="🦖"]'); await P.fill("#du-new [name=lg_n]", "Rey del duelo");
await shot(P, "1-crear-profe");
await P.click("#du-new [type=submit]"); await P.waitForURL(/#duelo-\d{6}/); await P.waitForTimeout(800);
const code = P.url().match(/duelo-(\d{6})/)[1]; ok(true, "mesa creada " + code);
ok((await P.textContent(".du-bigcode")).replace(/\s/g, "") === code, "el código se ve en grande");
const A = [];
for (let i = 0; i < 3; i++) {
  const p = await pagina(als[i], i === 0 ? 390 : 1000, 800); A.push(p);
  await p.goto(B + "/index.html#duelo", { waitUntil: "networkidle" }); await p.waitForTimeout(400);
  if (i === 0) { ok(await p.locator("#du-new [name=xp_p1]").count() === 0, "el alumno no ve los premios, solo tiempos y texto"); await shot(p, "2-alumno-movil-hub"); }
  await p.fill("#du-code", code.slice(0, 3) + " " + code.slice(3)); await p.click("#du-join [type=submit]"); await p.waitForTimeout(700);
}
await P.waitForTimeout(3000);
ok(await P.locator(".du-chip").count() === 3, "el profe ve a los 3 alumnos en la sala");
await shot(P, "3-sala-profe"); await shot(A[0], "3-sala-alumno");
await P.click('[data-du=next][data-de=lobby]'); await P.waitForTimeout(2500);
ok(await A[0].locator(".du-text").count() === 1, "los alumnos leen el texto");
await shot(A[0], "4-lectura-movil");
await P.click('[data-du=next][data-de=read]');
for (let k = 0; k < 6; k++) {
  await A[0].waitForSelector(`.du-op[data-k="${k}"]:not([disabled])`, { timeout: 8000 });
  for (let i = 0; i < 3; i++) { await A[i].waitForSelector(`.du-op[data-k="${k}"]:not([disabled])`, { timeout: 8000 }); try { await A[i].locator(`.du-op[data-k="${k}"]`).nth(i === 2 ? (k + 1) % 3 : 0).click({ timeout: 4000 }); } catch (e) { ok(false, `alumno ${i} no puede pulsar en la pregunta ${k + 1}`); await shot(A[i], `x-fallo-${i}-${k}`); console.log(await A[i].evaluate(() => JSON.stringify({h: location.hash, y: scrollY}))); } await A[i].waitForTimeout(150); }
  if (k === 0) { await shot(A[0], "5-pregunta-movil"); await shot(P, "5-pregunta-proyector"); }
  await A[0].waitForSelector(".du-fb", { timeout: 9000 });
  if (k === 0) { ok(true, "todos contestan → se pasa sola a la solución"); await shot(A[0], "6-solucion-movil"); await shot(P, "6-solucion-proyector"); }
  await P.waitForTimeout(300);
  const nx = P.locator('[data-du=next]'); if (await nx.count()) await nx.click();
}
await A[0].waitForSelector(".du-end", { timeout: 12000 }); await P.waitForSelector(".du-end", { timeout: 8000 });
await A[0].waitForTimeout(500);
ok(await A[0].locator(".du-prize").count() === 1, "premio al final: " + (await A[0].textContent(".du-prize").catch(() => "")));
ok(await P.locator(".du-tabla tbody tr").count() === 3, "el profe ve la tabla pregunta a pregunta");
await shot(A[0], "7-final-movil"); await shot(P, "7-final-proyector");
const g = await A[0].evaluate(() => LYA.get().S.g); ok(g.du && g.du.n === 1 && g.xp > 0, "duelo guardado en el progreso: " + JSON.stringify(g.du));
await A[0].reload({ waitUntil: "networkidle" }); await A[0].waitForTimeout(1200);
ok((await A[0].evaluate(() => LYA.get().S.g.du.n)) === 1, "al recargar no se vuelve a premiar");
ok(errs.length === 0, "sin errores de JavaScript " + errs.join(" | "));
await b.close(); console.log(fallos ? "FALLOS: " + fallos : "TODO BIEN");
