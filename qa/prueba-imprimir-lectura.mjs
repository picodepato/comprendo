// 🖨️ Imprimir una lectura (imprimir/lectura.js): el botón sale en las lecturas, los atajos y las partes cambian la hoja,
// se pueden quitar ejercicios, las soluciones salen donde toca y al imprimir solo sale la hoja.
// Uso: node qa/prueba-imprimir-lectura.mjs http://localhost:8790 [carpeta-capturas]   (con qa/servidor-prueba.mjs)
import { createRequire } from "module"; const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const B = (process.argv[2] || "http://localhost:8790").replace(/\/index\.html$/, ""), DIR = process.argv[3];
const fallos = [], ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) fallos.push(m); };
const espera = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(), errs = [];
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); p.on("pageerror", e => errs.push(e.message));
const ir = async h => { await p.goto(B + "/index.html#" + h, { waitUntil: "networkidle" }); await espera(700); };
const hoja = () => p.textContent(".imp-hoja");
const pdf = async nombre => { if (!DIR) return; await p.emulateMedia({ media: "print" }); await p.pdf({ path: `${DIR}/${nombre}.pdf`, format: "A4" }); await p.emulateMedia({ media: "screen" }); };

await ir("bear-a1");
ok(await p.locator(".imp-barra-l .imp-abrir-l").count() === 1, "la lectura bear-a1 tiene «Imprimir»");
await p.click(".imp-abrir-l"); await espera(300);
ok(await p.locator(".imp-lect").count() === 1, "se abre el panel de la lectura");
const R = await p.evaluate(() => { const S = LYAImprimirLectura._S(); return { q: S.R.q.length, p: S.R.text.length, g: S.R.grammar.items.length }; });
await p.click("[data-impl=todo]"); await espera(200);
ok(await p.locator(".imp-texto-l > p").count() >= R.p, "todo: el texto con sus párrafos");
ok(await p.locator(".imp-hoja .imp-act").count() === R.q + 2 + R.g, `todo: ${R.q} preguntas, vocabulario, frases y ${R.g} de gramática`);
ok(/Soluciones/.test(await hoja()), "con soluciones al final");
await pdf("lectura-bear-a1-todo");
await p.click("[data-impl=solo-texto]"); await espera(200);
ok(await p.locator(".imp-hoja .imp-act").count() === 0 && await p.locator(".imp-texto-l").count() === 1, "solo el texto");
await p.click("[data-impl=texto-preg]"); await espera(200);
ok(await p.locator(".imp-hoja .imp-act").count() === R.q && await p.locator(".imp-texto-l").count() === 1, "texto y preguntas");
await p.click("[data-impl=solo-preg]"); await espera(200);
ok(await p.locator(".imp-hoja .imp-act").count() === R.q && await p.locator(".imp-texto-l").count() === 0, "solo las preguntas");
await p.check(".imp-lect input[name=gej]"); await p.check(".imp-lect input[name=pistas][value=debajo]"); await espera(200);
ok(await p.locator(".imp-hoja .imp-pistas").count() >= 1, "con pistas de gramática");
await p.click('.imp-hoja .imp-act:nth-child(1) [data-impl=quitar]'); await espera(150);
ok(await p.locator(".imp-hoja .imp-act").count() === R.q + R.g - 1, "quitar un ejercicio");
await p.click("[data-impl=reponer]"); await espera(150);
await p.check(".imp-lect input[name=sol][value=no]"); await espera(150);
ok(!/Soluciones/.test(await hoja()), "sin soluciones");
await p.check(".imp-lect input[name=sol][value=aparte]"); await espera(150);
ok(await p.locator(".imp-aparte").count() === 1, "soluciones en hoja aparte");
await p.emulateMedia({ media: "print" });
const vis = await p.evaluate(() => ({ panel: getComputedStyle(document.querySelector(".imp-lect .imp-panel")).display, app: getComputedStyle(document.getElementById("app")).display }));
ok(vis.panel === "none" && vis.app === "none", "al imprimir solo sale la hoja");
await p.emulateMedia({ media: "screen" });
if (DIR) await p.screenshot({ path: DIR + "/lectura-panel.png" });
await p.click("[data-impl=cerrar]"); await espera(150);
ok(await p.locator(".imp-lect").count() === 0, "cerrar");

/* otras lecturas: B2 (Use of English), catalán con preguntas abiertas y V/F */
for (const [id, l] of [["en-bear-b2", "en"], ["va-rap-c1", "ca"], ["comida-b1", "es"]]) {
  await p.evaluate(l => LYA.setLang("learn", l), l); await espera(300);
  await ir(id);
  if (!await p.locator(".imp-abrir-l").count()) { ok(false, `${id}: sale el botón`); continue; }
  await p.click(".imp-abrir-l"); await espera(300);
  await p.click("[data-impl=todo]"); await p.check(".imp-lect input[name=sol][value=final]"); await espera(300);
  const n = await p.locator(".imp-hoja .imp-act").count(), s = await p.locator(".imp-sols li").count();
  ok(n > 0 && s > 0, `${id}: ${n} ejercicios y ${s} soluciones`);
  await pdf("lectura-" + id);
  await p.click("[data-impl=cerrar]");
}

/* móvil */
const m = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); m.on("pageerror", e => errs.push(e.message));
await m.goto(B + "/index.html#bear-a2", { waitUntil: "networkidle" }); await espera(700);
await m.click(".imp-abrir-l"); await espera(300);
ok(await m.evaluate(() => document.querySelector(".imp-lect").scrollWidth <= innerWidth + 1), "en el móvil cabe a lo ancho");

ok(!errs.length, "sin errores de JavaScript" + (errs.length ? ": " + errs.slice(0, 3).join(" | ") : ""));
await b.close();
console.log(fallos.length ? `\n${fallos.length} fallos` : "\nTodo bien");
process.exit(fallos.length ? 1 : 0);
