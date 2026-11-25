// Quien crea la sala también juega (por defecto si no es profe): se une desde su móvil, empieza y lleva la partida desde ahí.
// Uso: node qa/servidor-prueba.mjs $PWD 8790  y luego  NODE_PATH=$(npm root -g) node qa/prueba-retos-creador.cjs http://localhost:8790/index.html [/tmp/qa]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8790/index.html', OUT = process.argv[3] || '/tmp/qa-retos-creador';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  require('fs').mkdirSync(OUT, {recursive: true});
  const b = await chromium.launch(); const fallos = [], errs = [];
  const ok = (c, m) => { if (!c) { fallos.push(m); console.log('✗', m); } else console.log('✓', m); };
  const nueva = async () => { const p = await (await b.newContext({viewport: {width: 390, height: 844}})).newPage(); p.on('pageerror', e => errs.push(e.message)); return p; };
  for (const juego of ['tabu', 'prueba', 'cartas', 'piloto', 'apuesta']) {
    const yo = await nueva(), otro = await nueva();
    await yo.goto(BASE + '#reto-' + juego, {waitUntil: 'networkidle'}); await wait(300);
    ok(await yo.locator('[data-rt-c="juega"]').isChecked(), juego + ': «Voy a jugar yo también» marcado por defecto');
    await yo.selectOption('[data-rt-c="lang"]', 'es'); await yo.selectOption('[data-rt-c="nivel"]', 'A1');
    const eq = juego === 'prueba' || juego === 'apuesta' ? '0' : '1';
    await yo.selectOption('[data-rt-c="equipos"]', eq); await wait(100);
    await yo.click('[data-rt-form="crear"] .btn.main'); await wait(1000);
    const h = await yo.evaluate(() => location.hash); ok(/^#reto-\d{6}$/.test(h), juego + ': el creador va a la vista de jugador ' + h);
    const cod = h.slice(-6);
    ok(await yo.locator('.rt-mando .rt-codigo').count() === 1, juego + ': ve el código para que entren los demás');
    await yo.fill('#rt-nom', 'Creador'); if (eq !== '0') await yo.click('.rt-eq[data-e="1"]');
    await yo.click('[data-rt-form="unirme"] .btn.main'); await wait(500);
    await otro.goto(BASE + '#reto-' + cod, {waitUntil: 'networkidle'}); await wait(500);
    await otro.fill('#rt-nom', 'Otra'); if (eq !== '0') await otro.click('.rt-eq[data-e="1"]');
    await otro.click('[data-rt-form="unirme"] .btn.main'); await wait(1800);
    ok(await otro.locator('.rt-mando').count() === 0, juego + ': el otro no tiene los botones de la pizarra');
    await yo.screenshot({path: `${OUT}/${juego}-1-espera.png`, fullPage: true});
    await yo.click('.rt-mando [data-rt="empezar"]'); await wait(2000);
    ok((await yo.evaluate(() => LYARetos._E.st.sala.fase)) === 'juego', juego + ': el creador empieza desde su móvil');
    await yo.screenshot({path: `${OUT}/${juego}-2-juego.png`, fullPage: true});
    if (juego === 'tabu') ok(await yo.locator('.rt-guia').count() === 1 && await otro.locator('.rt-txt[data-rt-tap]').count() === 1, 'tabu: el creador es el primer guía y la otra busca');
    if (juego === 'prueba') ok(await yo.locator('.rt-txt[data-rt-tap]').count() === 1, 'prueba: el creador puede tocar el texto');
    if (juego === 'cartas') ok(await yo.locator('.rt-carta').count() >= 3, 'cartas: el creador tiene cartas');
    if (juego === 'piloto') ok(await yo.locator('.rt-lector, .rt-piloto').count() >= 1, 'piloto: el creador tiene papel');
    if (juego === 'apuesta') ok(await yo.locator('.rt-apuesta').count() === 1, 'apuesta: el creador puede apostar');
    await yo.click('.rt-mando [data-rt="terminar"], .rt-mando [data-rt="siguiente"]'); await wait(1500);
  }
  /* un profe: por defecto solo la pizarra, pero puede jugar */
  const p = await nueva();
  await p.goto(BASE + '#reto-tabu', {waitUntil: 'networkidle'}); await p.evaluate(() => { Object.defineProperty(window.LYACuentas, 'rol', {get: () => 'profe', configurable: true}); location.hash = '#reto-cartas'; }); await wait(400);
  ok(!(await p.locator('[data-rt-c="juega"]').isChecked()), 'profe: por defecto no juega');
  await p.selectOption('[data-rt-c="lang"]', 'es'); await p.click('[data-rt-form="crear"] .btn.main'); await wait(1000);
  ok(/^#reto-pizarra-/.test(await p.evaluate(() => location.hash)), 'profe: va a la pizarra');
  ok(await p.locator('a[href^="#reto-"]', {hasText: /Jugar yo/}).count() === 1, 'profe: tiene «Jugar yo también» en la pizarra');
  await p.screenshot({path: `${OUT}/profe-pizarra.png`, fullPage: true});
  ok(!errs.length, 'sin errores: ' + errs.join(' | '));
  console.log(fallos.length ? `\n${fallos.length} FALLOS` : '\nTODO BIEN');
  await b.close(); process.exit(fallos.length ? 1 : 0);
})();
