// 🖨️ Imprimir tema (imprimir/imprimir.js): el botón sale en los temas y apartados, el panel cambia la hoja
// (apartados, explicación, niveles, tipos, pistas, soluciones, quitar y cambiar) y al imprimir solo sale la hoja.
// Uso: node qa/prueba-imprimir.mjs http://localhost:8790 [carpeta-capturas]   (con qa/servidor-prueba.mjs)
// Con FP Básica cargada (fpb/), prueba también un tema de FP Básica.
import { createRequire } from "module"; const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const B = (process.argv[2] || "http://localhost:8790").replace(/\/index\.html$/, ""), DIR = process.argv[3];
const fallos = [], ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) fallos.push(m); };
const espera = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(), errs = [];
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message));
const ir = async h => { await p.goto(B + "/index.html#" + h, { waitUntil: "networkidle" }); await espera(400); };
const hoja = () => p.textContent(".imp-hoja");
const marca = async (sel, on) => { const el = p.locator(sel); if ((await el.isChecked()) !== on) await el.click(); await espera(120); };

/* el botón en el tema y en el apartado */
await ir("mates-t2");
ok(await p.locator(".imp-barra .imp-abrir").count() === 1, "1.º ESO tema 2: sale «Imprimir tema»");
await ir("mates-t2-3");
ok(await p.locator(".imp-barra .imp-abrir").count() === 1, "dentro del apartado 3 también sale");
await p.click('.mt-tabs [data-t="practica"]'); await espera(200);
ok(await p.locator(".imp-barra").count() === 1, "y sigue en la pestaña «Practica»");
await ir("mates"); ok(await p.locator(".imp-barra").count() === 0, "en la portada de mates no sale");

/* desde el apartado: solo ese apartado marcado */
await ir("mates-t2-3");
await p.click(".imp-abrir"); await espera(300);
ok(await p.locator(".imp-modal").count() === 1, "se abre el panel");
let st = await p.evaluate(() => { const S = LYAImprimir._S(); return { aps: [...S.aps] }; });
ok(st.aps.length === 1 && st.aps[0] === 3, "abre con el apartado 3 marcado");
ok(await p.locator(".imp-hoja .imp-sec:not(.imp-final)").count() === 1 && await p.locator(".imp-act").count() === 5, "hoja: 1 apartado con 5 actividades");
ok(/Suma y resta de dos enteros/.test(await hoja()) && await p.locator(".imp-teo").count() === 1, "con su explicación");
const antes = await p.locator(".imp-act .imp-acu").allTextContents();

/* opciones que no cambian las actividades */
await marca('.imp-panel input[name=teo]', false);
ok(await p.locator(".imp-teo").count() === 0, "sin explicación");
await p.check('.imp-panel input[name=pistas][value=debajo]'); await espera(150);
ok(await p.locator(".imp-act .imp-pistas").count() === 5, "pistas debajo de cada actividad");
await p.check('.imp-panel input[name=npist][value=todas]'); await espera(150);
ok(await p.locator(".imp-act .imp-pistas p").count() > 5, "con todas las pistas salen más");
await p.check('.imp-panel input[name=sol][value=no]'); await espera(150);
ok(!/Soluciones/.test(await hoja()), "sin soluciones");
await p.check('.imp-panel input[name=sol][value=aparte]'); await espera(150);
ok(await p.locator(".imp-aparte .imp-sols li").count() === 5, "soluciones en hoja aparte (5)");
ok(JSON.stringify(await p.locator(".imp-act .imp-acu").allTextContents()) === JSON.stringify(antes), "cambiar opciones no cambia las actividades");

/* quitar y cambiar */
await p.click('.imp-act:nth-child(2) [data-imp=quitar]'); await espera(150);
ok(await p.locator(".imp-act").count() === 4 && await p.locator(".imp-aviso").count() === 1, "quitar una actividad");
await p.click("[data-imp=reponer]"); await espera(150);
ok(await p.locator(".imp-act").count() === 5, "volver a ponerlas");
const a1 = await p.locator(".imp-act:nth-child(1) .imp-acu").textContent();
await p.click('.imp-act:nth-child(1) [data-imp=cambiar]'); await espera(150);
ok(await p.locator(".imp-act:nth-child(1) .imp-acu").textContent() !== a1, "cambiar una actividad por otra");

/* niveles, cuántas, tema entero, tipos y repaso */
await p.fill('.imp-panel input[name=n]', "6"); await espera(200);
await marca('.imp-panel input[name=niv][value="3"]', true);
ok(await p.locator(".imp-act").count() === 6 && await p.locator(".imp-nv").count() === 6, "6 actividades, fáciles y difíciles (con su nivel)");
await p.click("[data-imp=todos]"); await espera(300);
ok(await p.locator(".imp-hoja .imp-sec:not(.imp-final)").count() === 8 && await p.locator(".imp-act").count() === 48, "tema entero: 8 apartados, 48 actividades");
await p.locator('.imp-tipos[data-ap="8"] summary').click();
for (const g of [1, 2]) await marca(`.imp-panel input[name=tipo][data-ap="8"][value="${g}"]`, false);
const tipos8 = await p.evaluate(() => { const S = LYAImprimir._S(), L = []; return S.tipos[8]; });
ok(JSON.stringify(tipos8) === "[0]", "apartado 8: solo combinadas paso a paso");
const sec8 = await p.locator(".imp-hoja .imp-sec").nth(7).locator(".imp-renglones").count();
ok(sec8 === 6, "y las 6 salen con renglones para hacerlas paso a paso");
await p.fill('.imp-panel input[name=rep]', "10"); await espera(300);
ok(/Repaso del tema/.test(await hoja()) && await p.locator(".imp-act").count() === 58, "repaso mezclado de 10 al final");
const recta = await p.locator(".imp-hoja .imp-recta").count();
console.log("   (rectas en la hoja: " + recta + ")");
if (DIR) { await p.screenshot({ path: DIR + "/imprimir-panel.png" }); }

/* al imprimir: solo la hoja */
await p.emulateMedia({ media: "print" });
const vis = await p.evaluate(() => ({ panel: getComputedStyle(document.querySelector(".imp-panel")).display, top: getComputedStyle(document.querySelector(".nav, .top, header") || document.body).display, ctl: getComputedStyle(document.querySelector(".imp-ctl")).display, pos: getComputedStyle(document.querySelector(".imp-modal")).position }));
ok(vis.panel === "none" && vis.ctl === "none" && vis.pos === "static", "al imprimir no salen el panel ni los botones");
if (DIR) await p.pdf({ path: DIR + "/imprimir-t2.pdf", format: "A4", printBackground: true });
await p.emulateMedia({ media: "screen" });
await p.click("[data-imp=cerrar]"); await espera(150);
ok(await p.locator(".imp-modal").count() === 0, "cerrar el panel");

/* 4.º ESO PDC */
await ir("mates-p2-4"); await p.click(".imp-abrir"); await espera(300);
await marca('.imp-panel input[name=teo]', true);
ok(await p.locator(".imp-act").count() >= 5 && /Porcentajes/.test(await hoja()), "4.º PDC: apartado de porcentajes");
ok(await p.locator(".imp-teo .mt-fig svg").count() >= 1, "con su dibujo");
if (DIR) { await p.screenshot({ path: DIR + "/imprimir-pdc.png" }); await p.emulateMedia({ media: "print" }); await p.pdf({ path: DIR + "/imprimir-p2-4.pdf", format: "A4", printBackground: true }); await p.emulateMedia({ media: "screen" }); }
await p.click("[data-imp=cerrar]");

/* FP Básica (si está) */
const fpb = await p.evaluate(() => window.LYAFpb ? LYAFpb.asignaturas().flatMap(a => a.temas.map(t => t.id)) : []);
if (fpb.length) {
  for (const id of fpb) {
    await ir("fpb-" + id);
    ok(await p.locator(".imp-abrir").count() === 1, `FP Básica ${id}: sale el botón`);
    await p.click(".imp-abrir"); await espera(300);
    await p.click("[data-imp=todos]"); await espera(300);
    for (const d of [1, 2, 3]) await marca(`.imp-panel input[name=niv][value="${d}"]`, true);
    const n = await p.locator(".imp-act").count(), sols = await p.locator(".imp-sols li").count();
    ok(n > 0 && sols === n, `FP Básica ${id}: ${n} actividades y sus soluciones`);
    if (DIR && id === fpb[0]) { await p.screenshot({ path: DIR + `/imprimir-fpb-${id}.png` }); await p.emulateMedia({ media: "print" }); await p.pdf({ path: DIR + `/imprimir-fpb-${id}.pdf`, format: "A4", printBackground: true }); await p.emulateMedia({ media: "screen" }); }
    await p.click("[data-imp=cerrar]");
  }
} else console.log("   (FP Básica no está cargada: no se prueba)");

/* móvil */
const m = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage(); m.on("pageerror", e => errs.push(e.message));
await m.goto(B + "/index.html#mates-t2-6", { waitUntil: "networkidle" }); await espera(400);
await m.click(".imp-abrir"); await espera(300);
const ancho = await m.evaluate(() => document.querySelector(".imp-modal").scrollWidth <= innerWidth + 1);
ok(ancho, "en el móvil el panel cabe a lo ancho");
if (DIR) { await m.screenshot({ path: DIR + "/imprimir-movil.png" }); await m.evaluate(() => document.querySelector(".imp-prev").scrollIntoView()); await espera(100); await m.screenshot({ path: DIR + "/imprimir-movil-hoja.png" }); }

ok(!errs.length, "sin errores de JavaScript" + (errs.length ? ": " + errs.slice(0, 3).join(" | ") : ""));
await b.close();
console.log(fallos.length ? `\n${fallos.length} fallos` : "\nTodo bien");
process.exit(fallos.length ? 1 : 0);
