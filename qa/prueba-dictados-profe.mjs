// Deberes de dictado: el profe manda un dictado, el alumno lo ve en la portada, lo hace y el profe lo ve hecho.
// Uso: node prueba-dictados-profe.mjs http://localhost:8790   (con qa/servidor-prueba.mjs)
import { createRequire } from "module"; const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const B = (process.argv[2] || "http://localhost:8790").replace(/\/index\.html$/, ""), id = Date.now().toString(36).slice(-5);
const api = async (p, tok, m = "GET", body) => { const r = await fetch(`${B}/api/${p}`, { method: m, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}) }, body: body && JSON.stringify(body) }); return { ok: r.ok, j: await r.json().catch(() => ({})) }; };
const fallos = [], ok = (c, m) => { if (!c) fallos.push(m); };
const prof = await api("registro", null, "POST", { usuario: "profe" + id, clave: "clave1234", rol: "profe" });
const g = await api("admin", prof.j.token, "POST", { accion: "grupo_crear", nombre: "Clase " + id, codigo: "dc" + id });
const al = await api("registro", null, "POST", { usuario: "alu" + id, clave: "clave1234", codigo: g.j.codigo, progreso: { learn: "es", know: "en" } });
const hoy = new Date().toISOString().slice(0, 10);
const d = await api("admin", prof.j.token, "POST", { accion: "deber_crear", lectura: "dictado-bear-a1", grupo: g.j.id, limite: hoy, nota: "Dictado" });
ok(prof.ok && g.ok && al.ok && d.ok, "crear profe, clase, alumno y deber de dictado: " + JSON.stringify([prof.j, g.j, al.j, d.j]));
const b = await chromium.launch(), ctx = await b.newContext();
await ctx.addInitScript(([tok, u]) => {
  if (!sessionStorage.getItem("hecho")) { sessionStorage.setItem("hecho", 1); localStorage.setItem("lyaCuenta", JSON.stringify({ token: tok, usuario: u })); }
  const ss = { speaking: false, pending: false, getVoices: () => [], addEventListener() {}, speak() {}, cancel() {} };
  Object.defineProperty(window, "speechSynthesis", { value: ss }); window.SpeechSynthesisUtterance = function (t) { this.text = t; };
}, [al.j.token, "alu" + id]);
const p = await ctx.newPage(), errs = []; p.on("pageerror", e => errs.push(e.message));
await p.goto(B + "/index.html#inicio", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
const deb = await p.textContent("#deberes").catch(() => "");
ok(/Dictado/.test(deb) && await p.locator('#deberes a[href="#dictado-bear-a1"]').count() === 1, "el alumno ve el dictado en sus deberes: " + deb);
await p.click('#deberes a[href="#dictado-bear-a1"]'); await p.waitForTimeout(500);
ok((await p.textContent(".dc")).includes("profe"), "dentro del dictado se ve que es un deber del profe");
for (let i = 0; i < 5; i++) { const s = await p.evaluate(() => LYADictados.actual()); await p.fill("#dc-in", s); await p.click('[data-dc="check"]'); await p.click('[data-dc="next"]'); await p.waitForTimeout(100); }
await p.waitForTimeout(2500); /* se guarda en la nube */
const A = await api("admin", prof.j.token);
const x = (A.j.deberes || []).find(z => z.lectura === "dictado-bear-a1");
ok(x && x.alumnos.length === 1 && x.alumnos[0].hecho && x.alumnos[0].estrellas === 3, "el profe lo ve hecho con 3 estrellas: " + JSON.stringify(x && x.alumnos));
await p.goto(B + "/index.html#inicio"); await p.waitForTimeout(800);
ok(/✅/.test(await p.textContent("#deberes").catch(() => "")), "en la portada sale como hecho");
await b.close();
console.log("FALLOS:", fallos.length ? "\n - " + fallos.join("\n - ") : "ninguno"); console.log("ERRORES:", errs.length ? errs.join("\n") : "ninguno");
process.exit(fallos.length || errs.length ? 1 : 0);
