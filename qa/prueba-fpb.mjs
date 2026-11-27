// FP Básica · Lengua y Literatura (temas 2, 3 y 4): portada, asignatura, tema, Aprende (glosario y textos), Practica en los
// tres niveles (opciones, relacionar y clasificar), ayudas (pistas, quitar una mala, «No lo entiendo», paso a paso), segunda
// oportunidad, fallo explicado, y juegos en grupo: quiz con móviles, parejas por equipos y la pizarra sin móviles.
// Uso: node qa/prueba-fpb.mjs http://localhost:8790 [carpeta-capturas]   (con qa/servidor-prueba.mjs)
import { createRequire } from "module"; const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const B = (process.argv[2] || "http://localhost:8790").replace(/\/index\.html$/, ""), DIR = process.argv[3];
const fallos = [], ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) fallos.push(m); };
const espera = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(), errs = [];
const nueva = async w => { const ctx = await b.newContext({ viewport: { width: w, height: 900 } }); const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); return p; };
const p = await nueva(390);
const ir = async (pg, h) => { await pg.goto(B + "/index.html#" + h, { waitUntil: "networkidle" }); await espera(400); };
const foto = async (pg, n) => { if (DIR) await pg.screenshot({ path: `${DIR}/${n}.png`, fullPage: true }); };

/* portada, asignatura y tema */
await ir(p, "fpb");
ok(/Lengua y Literatura/.test(await p.textContent("#app")), "la portada de FP Básica tiene Lengua y Literatura");
ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "sin scroll horizontal en el móvil (barra con FP Básica)");
await foto(p, "fpb-portada");
await ir(p, "fpb-lengua");
const asig = await p.textContent("#app");
ok(/Romanticismo|golondrinas/i.test(asig) && /voto/i.test(asig) && /Soles/i.test(asig), "la asignatura tiene los temas 2, 3 y 4");
for (const [t, n] of [["l2", 9], ["l3", 4], ["l4", 6]]) {
  await ir(p, "fpb-" + t);
  ok(await p.locator(`a[href^="#fpb-${t}-"]`).count() >= n + 1, `el tema ${t} tiene ${n} apartados y repaso`);
}
await foto(p, "fpb-tema");

/* Aprende: glosario y textos literarios */
await ir(p, "fpb-l2-5");
ok(await p.locator(".fp-glo dt").count() >= 2, "Bécquer tiene palabras difíciles");
ok(await p.locator(".fp-texto").count() >= 4, "Bécquer tiene los textos 2 a 5");
ok(/Poesía eres tú/.test(await p.textContent(".fp-teo")), "la Rima XXI está tal cual");
await foto(p, "fpb-aprende");
await ir(p, "fpb-l4-2");
ok(/Sonatina/.test(await p.textContent(".fp-teo")), "Rubén Darío trae la Sonatina");

/* Practica: contesta toda una serie con el estado del motor, en cada nivel */
const P = () => p.evaluate(() => { const x = LYAFpb._P(); if (!x) return null; const q = x.serie[x.i]; return { fase: x.fase, i: x.i, tot: x.serie.length, tipo: q.tipo, ops: q.ops?.map(o => o.ok), pares: q.pares?.map(p => p[1]), der: q.der, items: q.items?.map(i => i.c), guia: !!q.guia }; });
async function contestar(bien) {
  const q = await P();
  if (q.tipo === "opc") { const i = q.ops.findIndex(o => o === bien); await p.click(`[data-fp="opc"][data-i="${i}"]`); }
  else if (q.tipo === "rel") for (let i = 0; i < q.pares.length; i++) { await p.click(`[data-fp="izq"][data-i="${i}"]`); const j = await p.evaluate(t => [...document.querySelectorAll('[data-fp="der"]:not([disabled])')].find(b => b.textContent === t).dataset.j, q.pares[i]); await p.click(`[data-fp="der"][data-j="${j}"]`); }
  else for (let k = 0; k < q.items.length; k++) { const x = await P(); const libre = await p.locator('[data-fp="item"]').first().getAttribute("data-i"); if (libre == null) break; await p.click(`[data-fp="item"][data-i="${libre}"]`); const c = (await p.evaluate(i => LYAFpb._P().serie[LYAFpb._P().i].items[i].c, +libre)); await p.click(`[data-fp="caja"][data-k="${c}"]`); }
  await espera(50);
}
const tipos = new Set();
for (const [h, d] of [["fpb-l2-8", 1], ["fpb-l3-1", 2], ["fpb-l4-5", 3], ["fpb-l2-repaso", 2], ["fpb-l4-2", 3]]) {
  await ir(p, h);
  if (await p.locator('[data-fp="tab"][data-t="practica"]').count()) await p.click('[data-fp="tab"][data-t="practica"]');
  await p.click(`[data-fp="empezar"][data-d="${d}"]`);
  let n = 0;
  for (;;) { const q = await P(); if (q.fase === "fin") break; tipos.add(q.tipo); await contestar(true); if ((await P()).fase !== "fb") { ok(false, `${h}: la respuesta buena no da por buena la pregunta ${q.i + 1} (${q.tipo})`); break; } await p.click('[data-fp="sig"]'); n++; if (n > 12) break; }
  ok(/de (8|10) bien/.test(await p.textContent("#app")) && /🏆|🌟/.test(await p.textContent(".mt-fin")), `${h} nivel ${d}: se completa la serie con todo bien`);
}
ok(tipos.has("opc") && tipos.has("rel") && tipos.has("cla"), "salen preguntas de elegir, relacionar y clasificar: " + [...tipos].join(", "));

/* ayudas y fallos */
await ir(p, "fpb-l3-1");
await p.click('[data-fp="dejar"]').catch(() => {});
await ir(p, "fpb-l3-1");
if (await p.locator('[data-fp="tab"][data-t="practica"]').count()) await p.click('[data-fp="tab"][data-t="practica"]');
await p.click('[data-fp="empezar"][data-d="3"]');
let q = await P();
while (q.tipo !== "opc" || q.ops.length < 4) { await contestar(true); await p.click('[data-fp="sig"]'); q = await P(); if (q.fase === "fin") break; }
if (q.fase !== "fin") {
  for (let k = 0; k < 3; k++) await p.click('[data-fp="pista"]');
  ok(await p.locator(".mt-pista").count() === 3 && /empieza por/.test(await p.textContent(".mt-pistas")), "tres pistas, la última da el principio de la respuesta");
  await p.click('[data-fp="quitar"]');
  ok(await p.locator(".mt-op.fp-quit").count() === 1, "«Quitar una mala» tacha una opción");
  await p.click('[data-fp="nolo"]');
  ok(await p.locator(".mt-gem").count() === 1 && /Respuesta:/.test(await p.textContent(".mt-gem")), "«No lo entiendo» enseña uno parecido resuelto");
  await p.click('[data-fp="gemcerrar"]');
  if (q.guia) { await p.click('[data-fp="guia"]'); ok(await p.locator(".fp-paso").count() >= 1, "«Paso a paso» guía la pregunta"); await p.evaluate(() => { const x = LYAFpb._P(); x.gm = null; }); await p.click('[data-fp="pista"]').catch(() => {}); }
  const malas = (await P()).ops.map((o, i) => o ? -1 : i).filter(i => i >= 0 && !p.isClosed());
  const libres = [];
  for (const i of malas) if (await p.locator(`[data-fp="opc"][data-i="${i}"]:not([disabled])`).count()) libres.push(i);
  await p.click(`[data-fp="opc"][data-i="${libres[0]}"]`);
  ok((await P()).fase === "preg" && await p.locator(".fp-aviso").count() === 1, "al primer fallo dice por qué y da otra oportunidad");
  await p.click(`[data-fp="opc"][data-i="${libres[1] ?? libres[0]}"]`).catch(() => {});
  if ((await P()).fase === "preg") await contestar(false);
  ok(/La buena es/.test(await p.textContent(".mt-fb")), "al segundo fallo enseña la buena y el porqué");
  await foto(p, "fpb-fallo");
}

/* 📺 en la pizarra, sin móviles */
const pz = await nueva(1280);
await ir(pz, "fpb-clase-l4"); await pz.selectOption("#fc-d", "3"); await espera(100);
await pz.click('[data-fc="go"]');
const qa = await pz.evaluate(() => LYAFpbGrupo._t.C().serie[0].ops.map(o => o.ok));
await pz.click(`[data-fc="op"][data-i="${qa.findIndex(x => !x)}"]`);
ok(/Equipo|rebote/i.test(await pz.textContent("#app")) && (await pz.evaluate(() => LYAFpbGrupo._t.C().turno)) === 1, "pizarra: si falla, rebota al siguiente equipo");
await pz.click(`[data-fc="op"][data-i="${qa.findIndex(x => x)}"]`);
ok((await pz.evaluate(() => LYAFpbGrupo._t.C().pts)).join() === "0,1,0", "pizarra: el rebote acertado vale 1 punto");
await foto(pz, "fpb-pizarra");

/* 🏆 quiz con móviles */
async function sala(j, equipos, extra) {
  await ir(pz, "fpb-juego-" + j);
  await pz.selectOption("#fg-tema", "l2"); await espera(100);
  await pz.selectOption("#fg-eq", String(equipos)); await espera(100);
  if (await pz.isChecked("#fg-juega")) await pz.uncheck("#fg-juega");
  if (extra) await extra();
  await pz.click('[data-fg-form="crear"] button.main');
  await pz.waitForURL(/#fpb-pizarra-\d{6}/); await espera(500);
  return pz.url().match(/(\d{6})/)[1];
}
const cod = await sala("quiz", 0);
ok(/^\d{6}$/.test(cod), "el quiz crea una sala con código");
const al = [await nueva(390), await nueva(390)];
for (const [k, a] of al.entries()) { await ir(a, "fpb-sala-" + cod); await a.fill("#fg-nom", "Alumno" + (k + 1)); await a.click('[data-fg-form="unirme"] button.main'); await espera(300); }
await espera(1500);
await pz.click('[data-fg="empezar"]'); await espera(1500);
for (const a of al) await a.waitForSelector('[data-fg="op"]', { timeout: 8000 });
const buenas = await al[0].evaluate(() => { const s = LYAFpbGrupo._t.E.st.sala; return LYAFpbGrupo._t.rondaQuiz(s.r).ops.map(o => o.ok); });
await al[0].click(`[data-fg="op"][data-i="${buenas.indexOf(true)}"]`);
await al[1].click(`[data-fg="op"][data-i="${buenas.indexOf(false)}"]`);
await espera(1500);
if (await pz.locator('[data-fg="cerrar"]').count()) await pz.click('[data-fg="cerrar"]'); await espera(2500);
ok(/¡Bien!/.test(await al[0].textContent("#app")) && /Esta vez no/.test(await al[1].textContent("#app")), "quiz: cada móvil ve si ha acertado");
ok(/Alumno1/.test(await pz.textContent(".mg-tabla")), "quiz: la pizarra enseña la clasificación");
await foto(al[0], "fpb-quiz-movil");

/* 🃏 parejas por equipos */
const cod2 = await sala("parejas", 1);
const pa = await nueva(390);
await ir(pa, "fpb-sala-" + cod2); await pa.fill("#fg-nom", "Ana"); await pa.click('[data-fg="equipo"][data-e="1"]'); await pa.click('[data-fg-form="unirme"] button.main'); await espera(1500);
await pz.click('[data-fg="empezar"]'); await espera(1500);
await pa.waitForSelector('[data-fg="carta"]', { timeout: 8000 });
const { cartas, pares } = await pa.evaluate(() => { const C = LYAFpbGrupo._t.juegoParejas(); return { cartas: C.cartas.map(c => c.t), pares: C.pares.map(p => p[1]) }; });
const mal = (pares.indexOf(cartas[0]) + 1) % pares.length;
await pa.click('[data-fg="carta"][data-i="0"]'); await pa.click(`[data-fg="hueco"][data-i="${mal}"]`); await espera(800);
ok(/5 segundos sin jugar/.test(await pa.textContent("#app")), "parejas: un fallo explica el error y bloquea 5 segundos");
await espera(5500);
await pa.click('[data-fg="carta"][data-i="0"]'); await pa.click(`[data-fg="hueco"][data-i="${pares.indexOf(cartas[0])}"]`); await espera(800);
ok(await pa.locator(".fp-hueco.ok").count() === 1, "parejas: la carta buena se queda en su sitio");
await foto(pa, "fpb-parejas");

ok(!errs.length, "sin errores de JavaScript" + (errs.length ? ": " + errs.slice(0, 3).join(" | ") : ""));
await b.close();
console.log(fallos.length ? `\n${fallos.length} fallos` : "\nTodo bien");
process.exit(fallos.length ? 1 : 0);
