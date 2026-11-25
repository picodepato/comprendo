// Prueba el escape room de clase (escape/escape.js + api/_escape.js) con 1 pizarra y 4 alumnos (3 en un equipo, 1 en otro).
// Uso: node qa/servidor-prueba.mjs . 8790  y luego  NODE_PATH=/opt/node22/lib/node_modules node qa/prueba-escape.cjs http://localhost:8790/index.html [/tmp/capturas] [en|es|ca]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8790/index.html', OUT = process.argv[3] || '/tmp/qa-escape', LANG = process.argv[4] || 'en';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  require('fs').mkdirSync(OUT, {recursive: true});
  const b = await chromium.launch(); const fallos = [], errs = [];
  const ok = (c, m) => { if (!c) fallos.push(m); else console.log('✓', m); };
  const nueva = async (w, h) => {
    const ctx = await b.newContext({viewport: {width: w, height: h}});
    await ctx.addInitScript(() => { window.__xp = []; addEventListener('lya:xp', e => window.__xp.push(e.detail)); });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('response', r => { if (r.status() >= 500) errs.push(r.status() + ' ' + r.url()); });
    return p;
  };
  /* pizarra */
  const prof = await nueva(1280, 800);
  await prof.goto(BASE + '#escape', {waitUntil: 'networkidle'}); await wait(400);
  ok(await prof.locator('.tabs a[href="#grupo"][aria-current=page]').count() === 1, 'apartado En grupo marcado');
  await prof.selectOption('[data-esc-c="lang"]', LANG); await wait(150);
  await prof.selectOption('[data-esc-c="nivel"]', 'A2'); await wait(150);
  await prof.selectOption('[data-esc-c="equipos"]', '3'); await wait(150);
  await prof.screenshot({path: OUT + '/1-crear.png'});
  await prof.click('[data-esc-form="crear"] .btn.main'); await wait(800);
  const h = await prof.evaluate(() => location.hash);
  ok(/^#escape-pizarra-\d{6}$/.test(h), 'se crea la sala y se abre la pizarra: ' + h);
  const cod = h.slice(-6);
  ok((await prof.locator('.esc-codigo').innerText()).replace(/\s/g, '') === cod, 'la pizarra enseña el código');
  /* alumnos */
  const nombres = ['Ana', 'Biel', 'Carla', 'Dani'], al = [];
  for (const [i, n] of nombres.entries()) {
    const p = await nueva(390, 844); al.push(p);
    await p.goto(BASE + '#escape', {waitUntil: 'networkidle'}); await wait(200);
    await p.fill('#esc-cod', cod.slice(0, 3) + ' ' + cod.slice(3)); await p.click('[data-esc-form="ir"] .btn.main'); await wait(700);
    await p.fill('#esc-nom', n);
    await p.click(`.esc-eq[data-e="${i < 3 ? 1 : 2}"]`);
    await p.click('[data-esc-form="unirme"] .btn.main'); await wait(600);
    ok(await p.locator('.esc-espera').count() === 1, n + ' espera a que empiece');
  }
  await al[0].screenshot({path: OUT + '/2-espera.png'});
  await wait(2500);
  ok(await prof.locator('.esc-j').count() === 4, 'la pizarra ve 4 jugadores');
  await prof.screenshot({path: OUT + '/3-pizarra-espera.png'});
  await prof.click('[data-esc="empezar"]'); await wait(800);
  for (const p of al) { await wait(100); }
  await wait(2500);
  ok(await al[0].locator('.esc-pz').count() > 0, 'Ana ve sus piezas');
  /* cada uno ve cosas distintas */
  const vistos = [];
  for (const p of al.slice(0, 3)) vistos.push(await p.locator('.esc-pzs').innerText());
  ok(new Set(vistos).size === 3, 'los 3 del equipo 1 ven piezas distintas');
  const t2 = await al[3].locator('.esc-pz.trozo').count(), t1 = await al[0].locator('.esc-pz.trozo').count();
  ok(t2 > t1, 'Dani, solo en su equipo, ve todos los trozos (' + t2 + ' > ' + t1 + ')');
  await al[0].screenshot({path: OUT + '/4-ana.png', fullPage: true});
  await al[1].screenshot({path: OUT + '/4-biel.png', fullPage: true});
  /* soluciones: las mismas pistas que el navegador */
  const sol = await al[0].evaluate(async () => {
    const r = await fetch('api/propuestas?escape=1&sala=' + location.hash.slice(-6)).then(r => r.json());
    const R = await window.LYA.loadReading(r.sala.file); const P = window.LYAEscape.pistas(R, r.sala.semilla);
    return {c: P.candados.map(c => ({tipo: c.tipo, sol: c.sol, n: c.princ ? c.princ.length : 0})), codigo: P.codigo};
  });
  ok(sol.c.length === 5, 'hay 5 candados (4 preguntas + frases rotas): ' + sol.c.map(c => c.tipo).join(''));
  /* un fallo congela */
  const c0 = sol.c[0], malo = ['🔺', '🔵', '⭐'].find(s => s !== c0.sol);
  await al[1].click(`[data-esc="q"][data-k="0"][data-s="${malo}"]`); await wait(600);
  ok(await al[1].locator('.esc-aviso').count() === 1, 'al fallar sale el aviso');
  ok(await al[1].locator('.esc-cand.frio').count() === 1, 'el candado queda congelado');
  await wait(2500);
  ok(await al[0].locator('.esc-cand.frio').count() === 1, 'el congelado se ve en el móvil de Ana también');
  await al[0].screenshot({path: OUT + '/5-congelado.png'});
  await wait(13500);
  /* abrir los candados desde móviles diferentes */
  for (const [k, c] of sol.c.entries()) {
    const p = al[k % 3]; await wait(2200);
    if (c.tipo === 'q') await p.click(`[data-esc="q"][data-k="${k}"][data-s="${c.sol}"]`);
    else { for (let i = 0; i < c.n; i++) await p.fill(`#esc-h${k}-${i}`, c.sol[i]); await p.click(`[data-esc-form="h"][data-k="${k}"] .btn`); }
    await wait(500);
    ok(await p.locator('.esc-cand.ab').count() === k + 1, `candado ${k + 1} abierto`);
  }
  await wait(2500);
  const nums = (await Promise.all(al.slice(0, 3).map(p => p.locator('.esc-dig').allInnerTexts()))).flat();
  ok(nums.length === 5, 'los 5 números están repartidos entre los 3 (' + nums.length + ')');
  await al[2].screenshot({path: OUT + '/6-carla.png', fullPage: true});
  await al[2].fill('#esc-fin', sol.codigo); await al[2].click('[data-esc-form="final"] .btn'); await wait(700);
  ok(await al[2].locator('.esc-fin').count() === 1, 'Carla: ¡escapado!');
  await wait(2500);
  ok(await al[0].locator('.esc-fin').count() === 1, 'Ana también ve que han escapado');
  const xp = await al[0].evaluate(() => window.__xp.filter(x => x.src === 'escape').length);
  ok(xp === 1, 'da XP una vez');
  await al[0].screenshot({path: OUT + '/7-fin.png'});
  await wait(1500);
  ok((await prof.locator('.esc-fila-eq').first().innerText()).includes('🚪'), 'la pizarra pone primero al equipo que ha escapado');
  await prof.screenshot({path: OUT + '/8-pizarra-juego.png'});
  await prof.click('[data-esc="terminar"]'); await wait(2800);
  ok(await al[3].locator('.esc-fin').count() === 1, 'al terminar, Dani ve el final');
  await al[3].screenshot({path: OUT + '/9-dani-fin.png'});
  /* código que no existe */
  await al[3].goto(BASE + '#escape-000001'); await wait(800);
  ok((await al[3].locator('.esc-box').innerText()).length > 5, 'código que no existe: aviso');
  await b.close();
  console.log(fallos.length ? 'FALLOS:\n - ' + fallos.join('\n - ') : 'TODO BIEN');
  console.log('ERRORES:', errs.length ? errs.join('\n') : 'ninguno');
})();
