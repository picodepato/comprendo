// Prueba de los concursos en el navegador: crear con IA (pegar), editar, guardar, jugar solo y una partida en directo
// con la pantalla grande y 3 móviles. Uso: node qa/servidor-prueba.mjs $PWD 8790 & node qa/prueba-concursos.cjs http://localhost:8790 [carpeta-capturas]
const { chromium, devices } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8790', OUT = process.argv[3] || '/tmp/qa-concursos';
const wait = ms => new Promise(r => setTimeout(r, ms));
const IA = `¡Claro! Aquí tienes el concurso:

\`\`\`
TÍTULO: Los volcanes
---
PREGUNTA: ¿Qué sale de un volcán en erupción?
A) Lava
B) Nieve
C) Agua dulce
D) Arena
CORRECTA: A
TIEMPO: 10
---
PREGUNTA: ¿Cómo se llama la abertura de arriba del volcán?
A) Cráter
B) Raíz
C) Cumbre nevada
D) Valle
CORRECTA: A
TIEMPO: 10
---
**PREGUNTA:** El Teide está en Canarias.
A) Verdadero
B) Falso
CORRECTA: A
TIEMPO: 10
---
\`\`\`
¡Espero que te sirva!`;
(async () => {
  require('fs').mkdirSync(OUT, {recursive: true});
  const b = await chromium.launch(); const fallos = [], errs = [];
  const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fallos.push(m); };
  const shot = (p, n) => p.screenshot({path: `${OUT}/${n}.png`, fullPage: false});
  const vigila = p => { p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('dialog', d => d.accept()); };
  const ctx = await b.newContext({viewport: {width: 1280, height: 800}, permissions: ['clipboard-read', 'clipboard-write']});
  const h = await ctx.newPage(); vigila(h);
  await h.goto(BASE + '/index.html#concursos'); await h.waitForSelector('.cc-unir');
  ok(await h.locator('.tabs a[href="#grupo"]').count() === 1, 'apartado «En grupo» en el menú');
  await shot(h, '01-inicio');
  await h.click('a[href="#concursos-crear"]'); await h.waitForSelector('#cc-prompt');
  await h.selectOption('[data-op=n]', '15'); await h.fill('[data-op=nivel]', '5º de primaria');
  const pr = await h.inputValue('#cc-prompt');
  ok(pr.includes('crea 15 preguntas') && pr.includes('5º de primaria') && pr.includes('CORRECTA:'), 'el prompt cambia con las opciones');
  await h.click('[data-cc=copiarprompt]'); await wait(200);
  ok((await h.evaluate(() => navigator.clipboard.readText())).includes('TÍTULO:'), 'el botón copia el prompt');
  await shot(h, '02-crear');
  await h.click('[data-cc=leer]'); ok(await h.locator('#cc-msg.mal').isVisible(), 'sin texto avisa');
  await h.fill('#cc-pega', IA); await h.click('[data-cc=leer]');
  await h.waitForSelector('.cc-q');
  ok(await h.locator('.cc-q').count() === 3 && await h.inputValue('.cc-tit') === 'Los volcanes', 'el texto de la IA crea 3 preguntas con título');
  ok(await h.locator('.cc-q').nth(2).locator('.cc-o').count() === 2, 'verdadero/falso con 2 respuestas');
  await h.click('[data-cc=masp]'); await h.locator('.cc-q').nth(3).locator('textarea').fill('¿De qué color es la lava?');
  const os = h.locator('.cc-q').nth(3).locator('.cc-o input:not([type=radio])');
  await os.nth(0).fill('Verde'); await os.nth(1).fill('Roja');
  await h.locator('.cc-q').nth(3).locator('input[type=radio]').nth(1).check();
  await shot(h, '03-editor');
  await h.click('[data-cc=guardar]'); await h.waitForSelector('.cc-ver');
  ok(await h.locator('.cc-ver > li').count() === 4, 'guardado (2 respuestas vacías quitadas solas) y se ve la ficha');
  const idl = (await h.evaluate(() => location.hash)).slice(10);
  ok(idl.startsWith('l'), 'sin cuenta se guarda en el aparato: ' + idl);
  await shot(h, '04-ficha');
  // jugar solo
  await h.click(`a[href="#concurso-solo-${idl}"]`); await h.waitForSelector('[data-cc=solor]');
  await h.click('[data-cc=solor][data-j="0"]'); await h.waitForSelector('[data-cc=solosig]');
  ok((await h.textContent('.cc-resj')).includes('Correcto'), 'solo: acierto');
  await shot(h, '05-solo');
  for (let i = 0; i < 3; i++) { await h.click('[data-cc=solosig]'); await h.waitForSelector('[data-cc=solor]'); await h.click('[data-cc=solor][data-j="1"]'); await h.waitForSelector('[data-cc=solosig]'); }
  await h.click('[data-cc=solosig]'); await h.waitForSelector('.cc-fin');
  ok((await h.textContent('.cc-fin')).includes('2 de 4'), 'solo: resultado 2 de 4');
  // en directo
  await h.goto(BASE + `/index.html#concurso-${idl}`); await h.waitForSelector('[data-cc=directo]');
  await h.click('[data-cc=directo]'); await h.waitForSelector('.cc-codigo');
  const cod = (await h.textContent('.cc-codigo')).replace(/\D/g, '');
  ok(/^\d{6}$/.test(cod), 'partida abierta con código ' + cod);
  ok(!(await h.locator('.top').isVisible()), 'pantalla grande sin la barra de arriba');
  const tels = [];
  for (const [i, n] of ['Lucía', 'Marco', 'Aitana'].entries()) {
    const c = await b.newContext({...devices['iPhone 13']}); const p = await c.newPage(); vigila(p);
    await p.goto(BASE + (i ? '/index.html#jugar' : `/index.html#jugar-${cod}`)); await p.waitForSelector('#cc-entrar');
    if (i) await p.fill('[name=codigo]', cod);
    await p.fill('[name=nombre]', n); await p.click('#cc-entrar button'); await p.waitForSelector('.cc-jbox');
    tels.push(p);
  }
  ok((await tels[0].textContent('.cc-jbox')).includes('dentro'), 'el móvil entra en la partida');
  const t4 = await (await b.newContext({...devices['iPhone 13']})).newPage();
  await t4.goto(BASE + `/index.html#jugar-${cod}`); await t4.waitForSelector('#cc-entrar'); await t4.fill('[name=nombre]', 'lucía'); await t4.click('#cc-entrar button'); await t4.waitForSelector('#cc-msg:not([hidden])');
  ok((await t4.textContent('#cc-msg')).includes('ya está'), 'nombre repetido avisa');
  await shot(tels[0], '06-movil-dentro');
  await h.waitForFunction(() => document.querySelectorAll('.cc-chip').length === 3, null, {timeout: 6000});
  ok(true, 'la pantalla grande ve a los 3');
  await shot(h, '07-sala');
  // recargar el móvil no lo saca
  await tels[2].reload(); await tels[2].waitForSelector('.cc-jbox'); ok((await tels[2].textContent('.cc-jtop')).includes('Aitana'), 'recargar el móvil mantiene al jugador');
  await h.click('[data-cc=pasar]');
  await h.waitForSelector('.cc-cuentaatras'); await shot(h, '08-cuenta-atras');
  for (let q = 0; q < 4; q++) {
    await h.waitForSelector('.cc-hb', {timeout: 8000});
    if (q === 0) await shot(h, '09-pregunta');
    for (const [k, p] of tels.entries()) {
      await p.waitForSelector('[data-cc=resp]', {timeout: 8000});
      if (q === 0 && k === 0) await shot(p, '10-movil-pregunta');
      const correcta = q === 3 ? 1 : 0, elige = k === 0 ? correcta : k === 1 ? (q % 2 ? correcta : 2 % (q === 2 || q === 3 ? 2 : 4)) : correcta === 0 ? 1 : 0;
      await wait(k * 400); await p.click(`[data-cc=resp][data-j="${elige}"]`);
    }
    await shot(tels[0], '11-movil-enviada');
    await h.waitForSelector('.cc-barras', {timeout: 8000});
    ok(true, `pregunta ${q + 1}: se cierra sola cuando contestan todos`);
    if (q === 0) await shot(h, '12-resultado');
    await tels[0].waitForSelector('.cc-jbox.si', {timeout: 5000}); if (q === 0) await shot(tels[0], '13-movil-bien');
    await tels[2].waitForSelector('.cc-jbox.no', {timeout: 5000}); if (q === 0) await shot(tels[2], '14-movil-mal');
    await h.click('[data-cc=verrank]'); await h.waitForSelector('.cc-rank');
    if (q === 1) await shot(h, '15-ranking');
    ok((await h.textContent('.cc-rank li:first-child')).includes('Lucía'), `ranking ${q + 1}: Lucía primera`);
    await h.click('[data-cc=pasar]');
  }
  await h.waitForSelector('.cc-podio', {timeout: 8000}); await wait(900);
  await shot(h, '16-podio');
  await tels[0].waitForSelector('.cc-jbox.fin', {timeout: 5000});
  ok((await tels[0].textContent('.cc-jbox')).includes('puesto 1 de 3'), 'el móvil dice el puesto final');
  await shot(tels[0], '17-movil-fin');
  // móvil con ancho pequeño: sin scroll horizontal
  for (const p of [tels[0], h]) ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'sin desbordar a lo ancho');
  await h.click('[data-cc=cerrarp]'); await wait(500);
  ok(errs.length === 0, 'sin errores de página ' + errs.join(' | '));
  await b.close();
  console.log(fallos.length ? `${fallos.length} fallos` : 'todo bien'); process.exit(fallos.length ? 1 : 0);
})();
