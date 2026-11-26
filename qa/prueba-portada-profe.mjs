// Portada del profe (#profe) y ficha de alumno (#profe-alumno-<u>): con datos de 2 alumnos guardados por la API.
// También: un alumno practica mates y lee, y se guarda a qué juega, sus días y lo que falla.
// Uso: node qa/prueba-portada-profe.mjs http://localhost:8790 [carpeta-capturas]   (con qa/servidor-prueba.mjs)
import { createRequire } from "module"; const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const B = (process.argv[2] || "http://localhost:8790").replace(/\/index\.html$/, ""), DIR = process.argv[3], id = Date.now().toString(36).slice(-5);
const api = async (p, tok, m = "GET", body) => { const r = await fetch(`${B}/api/${p}`, { method: m, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}) }, body: body && JSON.stringify(body) }); return { ok: r.ok, j: await r.json().catch(() => ({})) }; };
const fallos = [], ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) fallos.push(m); };
const espera = ms => new Promise(r => setTimeout(r, ms));
const dia = n => { const d = new Date(Date.now() - n * 864e5); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

const prof = await api("registro", null, "POST", { usuario: "profe" + id, clave: "clave1234", rol: "profe" });
const g = await api("admin", prof.j.token, "POST", { accion: "grupo_crear", nombre: "1.º B " + id, codigo: "pf" + id });
const a1 = await api("registro", null, "POST", { usuario: "ana" + id, clave: "clave1234", codigo: g.j.codigo, progreso: { learn: "es", know: "en" } });
const a2 = await api("registro", null, "POST", { usuario: "leo" + id, clave: "clave1234", codigo: g.j.codigo, progreso: { learn: "es", know: "en" } });
ok(prof.ok && g.ok && a1.ok && a2.ok, "crear profe, clase y 2 alumnos");
/* Ana: datos como los que guarda la web */
const sAna = { learn: "es", know: "en", a: {}, dict: [{ w: "oso", l: "es", miss: true }], g: { xp: 340, streak: 3, best: 5, dias: { [dia(0)]: 40, [dia(1)]: 25, [dia(3)]: 60 }, wk: null,
  act: { mates: { n: 30, ok: 21, mal: 9, xp: 70, t: Date.now() }, ahorcado: { n: 8, ok: 6, mal: 2, xp: 10, t: Date.now() - 864e5 }, "m-escape": { n: 4, ok: 4, mal: 0, xp: 40 } },
  mh: { "t2.3.1": "0010p00p10", "t2.3.0": "1111111p11", "t2.6.0": "1p1101" },
  mt: { "t2-3": { e: [3, 1, 0], n: 3, ok: 25, h: [null, { n: 1, best: 1, ok: 6, tot: 10, last: Date.now(), mal: ["(−5) − (−8) → +3"], pi: 2 }, null] } },
  rd: { "bear-a1": { n: 2, best: 2, bp: 80, last: 2, fq: [1, 3], fg: [0], fv: 1, fh: 0, pct: 70, t: Date.now() } } } };
await api("progreso", a1.j.token, "PUT", { s: sAna });
const sLeo = { learn: "es", know: "en", a: {}, g: { xp: 50, dias: { [dia(2)]: 50 }, act: { mates: { n: 10, ok: 4, mal: 6, xp: 12 } }, mh: { "t2.3.1": "0100100" } } };
await api("progreso", a2.j.token, "PUT", { s: sLeo });

const b = await chromium.launch(), errs = [];
const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } });
await ctx.addInitScript(([tok, u]) => { if (!sessionStorage.getItem("hecho")) { sessionStorage.setItem("hecho", 1); localStorage.setItem("lyaCuenta", JSON.stringify({ token: tok, usuario: u, rol: "profe" })); } }, [prof.j.token, "profe" + id]);
const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message));
await p.goto(B + "/index.html#inicio", { waitUntil: "networkidle" }); await espera(1500);
ok(await p.evaluate(() => location.hash) === "#profe", "el profe entra en Inicio y va a su portada");
await p.waitForSelector(".pf-cards");
const txt = await p.textContent(".pf");
ok(/2\s*alumnos/.test(txt) && /XP esta semana/.test(txt), "tarjetas con alumnos y XP de la semana");
ok(/Mates · práctica/.test(txt) && /Ahorcado/.test(txt) && /Escape room de mates/.test(txt), "¿A qué juegan? con los juegos de la clase");
ok(/Restar dos enteros/.test(txt), "«Lo que más les cuesta» saca restar dos enteros");
ok(await p.locator(".pf-tb tbody tr").count() === 2, "la tabla tiene los 2 alumnos");
ok(await p.locator(".pf-herr .nvtiles").count() >= 1, "abajo, las herramientas de siempre");
if (DIR) await p.screenshot({ path: DIR + "/portada-profe.png", fullPage: true });
/* ficha */
await p.click(`.pf-tb tr[data-u="ana${id}"]`); await p.waitForSelector(".pf-mates"); await espera(300);
const f = await p.textContent(".pf");
ok(/Le cuesta ahora/.test(f) && /Restar dos enteros/.test(f), "la ficha dice lo que le cuesta ahora");
ok(/2 preguntas falladas/.test(f) || /3 preguntas falladas/.test(f), "lecturas con las preguntas falladas del último intento");
await p.click(".pf-det summary"); await espera(600);
ok(/Comprensión:/.test(await p.textContent(".pf-det")), "abre qué preguntas falló, con la respuesta buena");
ok(await p.locator(".pf-tira i").count() >= 10, "tira de los últimos resultados de mates");
if (DIR) await p.screenshot({ path: DIR + "/ficha-alumno.png", fullPage: true });
/* ver la web como alumno y volver */
await p.goto(B + "/index.html#profe"); await p.waitForSelector("[data-pf=alumno-vista]"); await p.click("[data-pf=alumno-vista]"); await espera(800);
ok(await p.evaluate(() => location.hash) === "#inicio" && await p.locator(".pf-banda").count() === 1, "«Ver la web como un alumno» enseña Inicio con la banda para volver");
await p.click("[data-pfb=volver]"); await espera(800);
ok(await p.evaluate(() => location.hash) === "#profe", "y vuelve a su clase");

/* un alumno de verdad: practica mates con una pista y se guardan act, dias y mh */
const ctx2 = await b.newContext({ viewport: { width: 420, height: 900 } });
await ctx2.addInitScript(([tok, u]) => { if (!sessionStorage.getItem("hecho")) { sessionStorage.setItem("hecho", 1); localStorage.setItem("lyaCuenta", JSON.stringify({ token: tok, usuario: u })); } }, [a2.j.token, "leo" + id]);
const q = await ctx2.newPage(); q.on("pageerror", e => errs.push(e.message));
await q.goto(B + "/index.html#mates-t2-3-d1", { waitUntil: "networkidle" }); await espera(800);
const Q = await q.evaluate(() => { const P = LYAMates._P(), x = P.serie[P.i]; return { tipo: x.tipo, ok: x.ok, sol: x.sol, g: x.g, ap: x.ap }; });
if (await q.locator('[data-mt="pista"]').count()) await q.click('[data-mt="pista"]');
if (Q.tipo === "opc") await q.click(`[data-mt="opc"][data-i="${Q.ok}"]`);
else { for (const ch of String(Math.abs(Q.sol))) await q.click(`.mt-tec [data-v="${ch}"]`); if (Q.sol < 0) await q.click('.mt-tec [data-v="pm"]'); await q.click('.mt-tec [data-v="ok"]'); }
await espera(3000);
const P2 = await api("progreso", a2.j.token);
const gg = P2.j.s?.g || {};
ok(gg.mh && /p$/.test(gg.mh[`t2.3.${Q.g}`] || ""), "se guarda el resultado de ese tipo de ejercicio, con pista: " + JSON.stringify(gg.mh));
ok(gg.act && gg.act.mates && gg.act.mates.n === 11, "y el contador de «mates» sube (sin crecer la lista): " + JSON.stringify(gg.act && gg.act.mates));
ok(gg.dias && Object.keys(gg.dias).length <= 14, "días: 14 como mucho");
await b.close();
console.log("FALLOS:", fallos.length ? "\n - " + fallos.join("\n - ") : "ninguno"); console.log("ERRORES:", errs.length ? errs.join("\n") : "ninguno");
process.exit(fallos.length || errs.length ? 1 : 0);
