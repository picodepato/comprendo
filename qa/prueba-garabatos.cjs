// Prueba una partida de Garabatos (dibuja y adivina) con 3 navegadores a la vez: crear, unirse con el enlace,
// empezar, elegir palabra, dibujar, ver el dibujo en los otros, fallar, acertar, resultado, fin y otra partida.
// Uso: node qa/servidor-prueba.mjs $PWD 8790 & NODE_PATH=/opt/node22/lib/node_modules node qa/prueba-garabatos.cjs http://localhost:8790/index.html [/tmp/capturas]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8790/index.html', OUT = process.argv[3] || '/tmp/qa';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  require('fs').mkdirSync(OUT, {recursive: true});
  const b = await chromium.launch(); const fallos = [], errs = [];
  const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fallos.push(m); };
  const abre = async (nombre, vp) => {
    const ctx = await b.newContext(vp ? {viewport: vp, hasTouch: true, isMobile: true} : {viewport: {width: 1200, height: 900}});
    await ctx.addInitScript(() => { window.__xp = []; addEventListener('lya:xp', e => window.__xp.push(e.detail)); });
    const p = await ctx.newPage(); p.nombre = nombre;
    p.on('pageerror', e => errs.push(nombre + ' pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(nombre + ' console: ' + m.text()); });
    return p;
  };
  const profe = await abre('Profe'), ana = await abre('Ana'), leo = await abre('Leo', {width: 390, height: 844});
  const P = [profe, ana, leo];
  await profe.goto(BASE + '#juegos', {waitUntil: 'networkidle'}); await wait(400);
  ok(await profe.locator('a.gbtile[href="#garabatos"]').count() === 1, 'la sala de juegos tiene la tarjeta de Garabatos');
  await profe.click('a.gbtile'); await wait(400);
  await profe.screenshot({path: OUT + '/garabatos-1-inicio.png'});
  const fc = profe.locator('[data-gbf="crear"]');
  await fc.locator('[name=nombre]').fill('Profe'); await fc.locator('[name=rondas]').selectOption('1'); await fc.locator('[name=tiempo]').selectOption('60');
  await fc.locator('button.main').click(); await wait(800);
  const cod = (await profe.evaluate(() => location.hash)).replace('#garabatos-', '');
  ok(/^\d{6}$/.test(cod), 'sala creada: ' + cod);
  const link = await profe.locator('.gblink code').textContent();
  ok(link.endsWith('#garabatos-' + cod), 'enlace para compartir');
  for (const p of [ana, leo]) {
    await p.goto(link.replace(/^https?:\/\/[^/]+/, BASE.replace(/\/index\.html$/, '')), {waitUntil: 'networkidle'}); await wait(400);
    ok(await p.locator('[data-gbf="entrar"] [name=codigo]').inputValue() === cod, p.nombre + ': el enlace pone el código');
    await p.fill('[data-gbf="entrar"] [name=nombre]', p.nombre); await p.click('[data-gbf="entrar"] button.main'); await wait(600);
  }
  await wait(2800);
  ok((await profe.locator('.gbchips li').count()) === 3, 'el anfitrión ve 3 jugadores');
  ok(await ana.locator('.gbwait').count() === 1, 'Ana espera al anfitrión');
  await profe.screenshot({path: OUT + '/garabatos-2-espera.png'});
  await leo.screenshot({path: OUT + '/garabatos-2-espera-movil.png'});
  await profe.click('[data-gb="empezar"]'); await wait(1800);
  const turno = async (dib, otros, n) => {
    await dib.waitForSelector('[data-gbo]', {timeout: 6000});
    ok(true, `turno ${n}: ${dib.nombre} ve 3 palabras: ` + (await dib.locator('[data-gbo]').allInnerTexts()).map(t => t.replace(/\n/g, '/')).join(', '));
    for (const o of otros) ok(/eligiendo|choosing|triant/.test(await o.locator('#gbov').innerText()), `${o.nombre} ve que ${dib.nombre} elige`);
    if (n === 1) await dib.screenshot({path: OUT + '/garabatos-3-elegir.png'});
    await dib.click('[data-gbo="0"]'); await wait(400);
    const w = (await dib.locator('#gbw').innerText()).replace(/^Dibuja: /, '').replace(/\s*\(.*$/, '').trim();
    ok(w.length > 1, `${dib.nombre} dibuja «${w}»`);
    ok(await dib.locator('#gbtools').isVisible(), 'tiene las herramientas');
    const cv = await dib.locator('#gbcv').boundingBox();
    const raya = async (pts) => { await dib.mouse.move(cv.x + cv.width * pts[0][0], cv.y + cv.height * pts[0][1]); await dib.mouse.down();
      for (const [x, y] of pts.slice(1)) { for (let k = 1; k <= 8; k++) await dib.mouse.move(cv.x + cv.width * x, cv.y + cv.height * y, {steps: 3}); } await dib.mouse.up(); };
    if (dib.nombre === 'Leo') { // en el móvil, con el dedo
      const t = async (x, y) => dib.locator('#gbcv').dispatchEvent('pointerdown', {clientX: cv.x + cv.width * x, clientY: cv.y + cv.height * y, pointerId: 1, isPrimary: true, bubbles: true});
      await t(.2, .2);
      for (let k = 0; k <= 20; k++) await dib.locator('#gbcv').dispatchEvent('pointermove', {clientX: cv.x + cv.width * (.2 + k * .03), clientY: cv.y + cv.height * (.2 + k * .025), pointerId: 1, bubbles: true});
      await dib.locator('#gbcv').dispatchEvent('pointerup', {pointerId: 1, bubbles: true});
    } else {
      await dib.click('[data-gbc="6"]');
      await raya([[.2, .7], [.5, .2], [.8, .7], [.2, .7]]);
      await dib.click('[data-gbc="2"]'); await dib.click('[data-gbs="2"]');
      await raya([[.5, .5], [.55, .55]]);
      await raya([[.1, .1], [.15, .9]]); await dib.click('[data-gb="deshacer"]');
    }
    await wait(2600);
    for (const o of otros) {
      const pix = await o.evaluate(() => { const c = document.getElementById('gbcv'), d = c.getContext('2d').getImageData(0, 0, 1000, 1000).data; let n = 0; for (let i = 0; i < d.length; i += 4 * 37) if (d[i] < 240 || d[i + 1] < 240 || d[i + 2] < 240) n++; return n; });
      const mio = await dib.evaluate(() => { const c = document.getElementById('gbcv'), d = c.getContext('2d').getImageData(0, 0, 1000, 1000).data; let n = 0; for (let i = 0; i < d.length; i += 4 * 37) if (d[i] < 240 || d[i + 1] < 240 || d[i + 2] < 240) n++; return n; });
      ok(pix > 50 && Math.abs(pix - mio) / mio < 0.15, `${o.nombre} ve el dibujo (${pix} vs ${mio} puntos pintados)`);
      ok(!(await o.locator('#gbw').innerText()).includes(w) || w.length < 3, `${o.nombre} no ve la palabra, ve la pista «${(await o.locator('#gbw').innerText()).replace(/\n/g, '')}»`);
    }
    if (n === 1) { await otros[0].screenshot({path: OUT + '/garabatos-4-adivinar.png'}); await dib.screenshot({path: OUT + '/garabatos-4-dibujar.png'}); }
    const [o1, o2] = otros;
    await o1.fill('#gbin', 'xyzzy'); await o1.press('#gbin', 'Enter'); await wait(1600);
    ok((await o2.locator('#gbchat').innerText()).includes('xyzzy'), `${o2.nombre} ve el intento fallido de ${o1.nombre}`);
    await o1.fill('#gbin', w.toUpperCase()); await o1.press('#gbin', 'Enter'); await wait(500);
    ok(/Acertaste|got it|encertada/.test(await o1.locator('#gbav').innerText()), `${o1.nombre} acierta`);
    await wait(1300);
    ok(/acertado|guessed|encertada/.test(await o2.locator('#gbchat').innerText()), `${o2.nombre} ve que ${o1.nombre} ha acertado`);
    if (n === 1 && o2.nombre === 'Leo') await o2.screenshot({path: OUT + '/garabatos-5-movil.png'});
    await o2.fill('#gbin', w); await o2.press('#gbin', 'Enter'); await wait(1800);
    ok(/era|was/.test(await dib.locator('#gbov').innerText()), 'todos aciertan → resultado: ' + (await dib.locator('#gbov').innerText()).replace(/\n/g, ' '));
    if (n === 1) await profe.screenshot({path: OUT + '/garabatos-6-resultado.png'});
    await wait(7200);
  };
  await turno(profe, [ana, leo], 1);
  await turno(ana, [profe, leo], 2);
  await turno(leo, [profe, ana], 3);
  await wait(1500);
  for (const p of P) ok(await p.locator('.gbpod li').count() === 3, p.nombre + ' ve el ranking final');
  const xp = await ana.evaluate(() => __xp.filter(x => x.src && x.src.startsWith('garabatos')));
  ok(xp.some(x => x.src === 'garabatos-fin' && x.xp > 0) && xp.some(x => x.ok), 'Ana gana XP: ' + JSON.stringify(xp));
  await profe.screenshot({path: OUT + '/garabatos-7-fin.png'}); await leo.screenshot({path: OUT + '/garabatos-7-fin-movil.png'});
  // recargar la página vuelve a la sala
  await ana.reload({waitUntil: 'networkidle'}); await wait(1500);
  ok(await ana.locator('.gbpod li').count() === 3, 'al recargar, Ana sigue en la sala');
  await profe.click('[data-gb="otra"]'); await wait(2500);
  ok(await ana.locator('#gbcv').count() === 1, 'otra partida: vuelve el juego');
  const ancho = await leo.evaluate(() => document.documentElement.scrollWidth); ok(ancho <= 390, 'el móvil no se sale de ancho: ' + ancho);
  await profe.click('[data-gb="salir"]'); await wait(300);
  ok(await profe.locator('[data-gbf="crear"]').count() === 1, 'salir vuelve al inicio');
  ok(!errs.length, 'sin errores: ' + errs.join(' | '));
  console.log(fallos.length ? `\n${fallos.length} FALLOS` : '\ntodo bien');
  await b.close(); process.exit(fallos.length ? 1 : 0);
})();
