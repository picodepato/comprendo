// FP Básica · Ciencias Sociales (temas s3 y s4): portada de la asignatura, explicaciones con imágenes (mapa, viñetas, cuadros)
// y todos los apartados practicados en los 3 niveles, contestando bien (opciones, relacionar y clasificar).
// Uso: node qa/prueba-fpb-sociales.mjs http://localhost:8790 [carpeta-capturas]   (con qa/servidor-prueba.mjs)
import { createRequire } from "module"; const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const B = (process.argv[2] || "http://localhost:8790").replace(/\/index\.html$/, ""), DIR = process.argv[3];
const fallos = [], ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) fallos.push(m); };
const espera = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(), errs = [];
const ctx = await b.newContext({ viewport: { width: 400, height: 900 } });
const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message));
const ir = async h => { await p.goto(B + "/index.html#" + h, { waitUntil: "networkidle" }); await espera(300); };

/* los datos: cada pregunta de opciones bien formada y con pistas */
await ir("fpb-sociales");
const datos = await p.evaluate(() => {
  const out = [], Bk = LYAFpb._bancos;
  for (const t of ["s3", "s4"]) for (const [ap, L] of Object.entries(Bk[t].manual)) for (const x of L) {
    const id = `${t}-${ap} «${String(x.e).slice(0, 40)}»`;
    if (![1, 2, 3].includes(x.d)) out.push(id + " sin nivel");
    if (!x.pi || x.pi.length < 3) out.push(id + " con menos de 3 pistas");
    if (!x.tipo) { if (x.o.length !== x.d + 1) out.push(`${id}: nivel ${x.d} con ${x.o.length} opciones`); if (x.p.length !== x.o.length) out.push(id + ": falta un porqué"); if (new Set(x.o).size !== x.o.length) out.push(id + ": opciones repetidas"); }
    if (x.tipo === "cla" && x.items.some(i => !(i[1] < x.cajas.length))) out.push(id + ": item en una caja que no existe");
  }
  const n = t => Object.values(Bk[t].manual).flat().length;
  return { out, n3: n("s3"), n4: n("s4"), niv: ["s3", "s4"].map(t => Object.entries(Bk[t].manual).map(([ap, L]) => ap + ":" + [1, 2, 3].map(d => L.filter(x => x.d === d).length).join("/")).join(" ")) };
});
ok(!datos.out.length, `banco bien formado (${datos.n3} actividades en el tema 3 y ${datos.n4} en el 4) ${datos.out.join(" | ")}`);
console.log("   por apartado (fácil/medio/difícil):", datos.niv.join(" · "));

const txt = await p.textContent("#app");
ok(/Ciencias Sociales/.test(txt) && /El disputado voto/.test(txt) && /Soles más limpios/.test(txt), "la asignatura enseña los dos temas");
if (DIR) await p.screenshot({ path: DIR + "/soc-asig.png", fullPage: true });
await ir("fpb");
ok(/Ciencias Sociales/.test(await p.textContent("#app")), "el curso FP Básica enseña Ciencias Sociales");

/* explicaciones */
for (const [t, n] of [["s3", 7], ["s4", 8]]) {
  await ir("fpb-" + t);
  ok(await p.locator(".mt-ap").count() >= n, `${t}: ${n} apartados en la página del tema`);
  for (let a = 1; a <= n; a++) {
    await ir(`fpb-${t}-${a}`);
    const t2 = await p.textContent("#app");
    ok(/Palabras difíciles/.test(t2), `${t}-${a}: explicación con palabras difíciles`);
    if (DIR && ((t === "s3" && [2, 7].includes(a)) || (t === "s4" && [3, 5].includes(a)))) await p.screenshot({ path: `${DIR}/soc-${t}-${a}.png`, fullPage: true });
  }
}
await ir("fpb-s3-7"); ok(await p.locator(".fp-img svg").count() === 2, "s3-7: las dos viñetas dibujadas");
await ir("fpb-s3-2"); ok(/El informe de la comisión central/.test(await p.textContent("#app")), "s3-2: el texto de Engels");
await ir("fpb-s4-6"); ok(await p.locator(".fp-img img, .fp-img .sc-noimg").count() === 2, "s4-6: dos edificios (imagen o ficha)");

/* práctica: todos los apartados y niveles, contestando bien */
const contestar = async () => {
  for (let k = 0; k < 14; k++) {
    const Q = await p.evaluate(() => { const P = LYAFpb._P(); if (!P || P.fase === "fin" || !P.serie) return null; const q = P.serie[P.i]; return q && { tipo: q.tipo, i: q.tipo === "opc" ? q.ops.findIndex(o => o.ok) : null, n: q.pares?.length, der: q.der, items: q.items?.map(x => x.c) }; });
    if (!Q) return true;
    if (Q.tipo === "opc") await p.click(`[data-fp="opc"][data-i="${Q.i}"]`);
    else if (Q.tipo === "rel") for (let i = 0; i < Q.n; i++) { await p.click(`[data-fp="izq"][data-i="${i}"]`); await p.click(`[data-fp="der"][data-j="${i}"]`); }
    else if (Q.tipo === "cla") for (let i = 0; i < Q.items.length; i++) { await p.click(`[data-fp="item"][data-i="${i}"]`); await p.click(`[data-fp="caja"][data-k="${Q.items[i]}"]`); }
    await espera(60);
    if (await p.locator('[data-fp="sig"]').count()) await p.click('[data-fp="sig"]');
    await espera(60);
  }
  return await p.evaluate(() => LYAFpb._P()?.fase === "fin");
};
let hechas = 0, malos = [];
const tipos = new Set();
for (const [t, n] of [["s3", 7], ["s4", 8]]) for (let a = 1; a <= n; a++) for (const d of [1, 2, 3]) {
  await ir(`fpb-${t}-${a}-d${d}`);
  tipos.add(...await p.evaluate(() => (LYAFpb._P()?.serie || []).map(q => q.tipo)));
  const fin = await contestar();
  const est = await p.evaluate(([t, a]) => LYAFpb.prog()[`${t}-${a}`], [t, a]);
  if (est && est.e && est.e[d - 1] === 3) hechas++; else malos.push(`${t}-${a}-d${d}`);
  if (DIR && t === "s3" && a === 5 && d === 1) { await ir(`fpb-${t}-${a}-d3`); await espera(200); await p.screenshot({ path: `${DIR}/soc-practica-mapa.png`, fullPage: true }); }
}
ok(!malos.length, `práctica: ${hechas} de 45 (apartado y nivel) con 3 estrellas ${malos.join(", ")}`);

/* un fallo explicado y las pistas */
await ir("fpb-s3-4-d2");
const Q = await p.evaluate(() => { const P = LYAFpb._P(), q = P.serie[P.i]; return { tipo: q.tipo, mala: q.tipo === "opc" ? q.ops.findIndex(o => !o.ok) : -1 }; });
if (Q.tipo === "opc") {
  await p.click('[data-fp="pista"]'); await p.click('[data-fp="pista"]');
  ok(await p.locator(".mt-pista").count() === 2, "las pistas salen de una en una");
  await p.click(`[data-fp="opc"][data-i="${Q.mala}"]`); await espera(100);
  ok(await p.locator(".fp-aviso").count() === 1, "al fallar dice por qué y deja otra oportunidad");
  if (DIR) await p.screenshot({ path: DIR + "/soc-fallo.png", fullPage: true });
}

/* juegos en grupo: los temas de Sociales salen para elegir y la pizarra saca preguntas de Sociales */
await ir("fpb-juego-quiz");
const opts = await p.locator("#fg-tema option").allTextContents();
ok(opts.some(o => /Ciencias Sociales · Tema 3/.test(o)) && opts.some(o => /Ciencias Sociales · Tema 4/.test(o)), "«¿Quién sabe más?» deja elegir los temas 3 y 4 de Sociales");
await ir("fpb-clase-s3");
const cl = await p.textContent("#app");
ok(/disputado voto|Sociales/i.test(cl), "la pizarra por turnos abre el tema 3 de Sociales");
if (DIR) await p.screenshot({ path: DIR + "/soc-pizarra.png", fullPage: true });

ok(!errs.length, "sin errores de JavaScript " + errs.slice(0, 3).join(" | "));
await b.close();
console.log(fallos.length ? `\n${fallos.length} fallos` : "\nTodo bien");
process.exit(fallos.length ? 1 : 0);
