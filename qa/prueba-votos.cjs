// Votar el próximo tema: tarjetas en la portada, votar, un voto por tema y aparato, recuento (con servidor).
// Uso: node prueba-votos.cjs <url> [/tmp/capturas]   (con servidor: node qa/servidor-prueba.mjs <web+api> 8790)
const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'http://localhost:8765/index.html', SHOTS = process.argv[3] || '/tmp';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox']});
  const out = [], errs = [];
  const page = async () => { const c = await b.createBrowserContext(); const p = await c.newPage(); await p.setViewport({width: 1100, height: 900});
    p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('response', r => { if (r.status() >= 400 && !r.url().includes('/api/')) errs.push(r.status() + ' ' + r.url()); });
    await p.goto(BASE, {waitUntil: 'networkidle0'}); await wait(600); return p; };
  const p = await page();
  const cards = () => p.evaluate(() => [...document.querySelectorAll('.vcard')].map(c => c.querySelector('b').textContent + ' [' + c.querySelector('.vn').textContent + '] ' + c.querySelector('button').textContent).join(' | '));
  out.push('tarjetas: ' + await p.evaluate(() => document.querySelectorAll('.vcard').length));
  out.push('antes: ' + await cards());
  await p.click('[data-voto="tiburones"]'); await wait(600);
  await p.click('[data-voto="cuerpo"]'); await wait(600);
  out.push('después: ' + await cards());
  out.push('mensaje: ' + await p.evaluate(() => document.querySelector('.vmsg').textContent));
  out.push('guardado: ' + await p.evaluate(() => localStorage.getItem('lyaVotos')));
  await p.evaluate(() => LYAVotos.vote('tiburones')); await wait(400);
  await p.reload({waitUntil: 'networkidle0'}); await wait(600);
  out.push('tras recargar: ' + await cards());
  await p.evaluate(() => document.getElementById('votos').scrollIntoView()); await p.screenshot({path: SHOTS + '/votos.png'});
  const q = await page(); await q.click('[data-voto="tiburones"]'); await wait(600);
  out.push('otro aparato: ' + await q.evaluate(() => document.querySelector('[data-vc="tiburones"]').textContent));
  await p.setViewport({width: 390, height: 844}); await wait(300);
  out.push('móvil desborde: ' + await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
  console.log(out.join('\n')); console.log('ERRORES:', errs.length ? errs.join('\n') : 'ninguno');
  await b.close();
})();
