// Comprueba la mascota: elegir, tienda, comprar, ponerse, colores, tarjeta de portada, ánimo al acertar.
const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'http://localhost:8765/index.html';
const SHOTS = process.argv[3] || '/tmp';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox']});
  const p = await b.newPage(); const errs = [], out = [];
  await p.setViewport({width: 1100, height: 900});
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  await p.goto(BASE, {waitUntil: 'networkidle0'});
  await p.evaluate(() => localStorage.clear()); await p.reload({waitUntil: 'networkidle0'}); await wait(400);
  const go = async h => { await p.evaluate(h => { location.hash = h; }, h); await wait(600); };
  const pet = () => p.evaluate(() => { const P = JSON.parse(localStorage.getItem('lyaPerfiles')); const s = P.list[0].s; return {pet: s.pet, xp: s.g.xp, spent: s.g.spent}; });
  out.push('pestaña: ' + await p.evaluate(() => !!document.querySelector('#tabs a[href="#mascota"]')));
  out.push('tarjeta portada (sin mascota): ' + await p.evaluate(() => document.querySelector('.phome')?.textContent.trim()));
  await p.screenshot({path: SHOTS + '/m-portada.png'});
  await go('mascota');
  out.push('elegir: ' + await p.evaluate(() => document.querySelectorAll('.pkind').length) + ' mascotas');
  await p.screenshot({path: SHOTS + '/m-elegir.png', fullPage: true});
  await p.click('.pkind[data-k="ajolote"]'); await wait(300);
  out.push('tienda: ' + await p.evaluate(() => document.querySelectorAll('.pit').length) + ' cosas en Cabeza, burbuja: ' + await p.evaluate(() => document.querySelector('.bubble')?.textContent));
  // dar puntos
  await p.evaluate(() => { for (let i = 0; i < 6; i++) dispatchEvent(new CustomEvent('lya:xp', {detail: {xp: 100, src: 'prueba'}})); }); await wait(300);
  await go('inicio'); await go('mascota');
  out.push('puntos: ' + await p.evaluate(() => document.querySelector('.ppts b')?.textContent));
  await p.click('.pit[data-id="c_corona"]'); await wait(200);
  out.push('probando corona: ' + await p.evaluate(() => document.querySelector('.pact')?.textContent.trim()));
  await p.click('[data-pet="buy"]'); await wait(300);
  let s = await pet(); out.push('comprada: own=' + s.pet.own + ' wear=' + JSON.stringify(s.pet.wear) + ' spent=' + s.spent);
  await p.screenshot({path: SHOTS + '/m-tienda.png', fullPage: true});
  // try every item for drawing errors
  for (const tab of ['cabeza', 'ojos', 'cuello', 'mano', 'fondo']) { await p.click(`[data-pet="tab"][data-s="${tab}"]`); await wait(100); }
  await p.click('[data-pet="tab"][data-s="temas"]'); await wait(150);
  await p.click('.pit[data-id="t_claro"]'); await wait(300);
  out.push('tema claro: ' + await p.evaluate(() => document.documentElement.dataset.tema + ' bg=' + getComputedStyle(document.body).backgroundColor));
  await p.screenshot({path: SHOTS + '/m-claro.png', fullPage: true});
  await p.click('.pit[data-id="t_neon"]'); await wait(200);
  out.push('neón sin comprar: ' + await p.evaluate(() => (document.documentElement.dataset.tema || 'oscuro') + ' / ' + document.querySelector('.pact')?.textContent.trim()));
  await p.click('[data-pet="buy"]'); await wait(300);
  s = await pet(); out.push('neón comprado: tema=' + s.pet.tema + ' spent=' + s.spent);
  // name
  await p.click('#petName', {clickCount: 3}); await p.type('#petName', 'Pepa'); await wait(200);
  s = await pet(); out.push('nombre: ' + s.pet.name);
  await p.reload({waitUntil: 'networkidle0'}); await wait(500);
  out.push('tras recargar: tema=' + await p.evaluate(() => document.documentElement.dataset.tema) + ', burbuja=' + await p.evaluate(() => document.querySelector('.bubble')?.textContent));
  // cheer on correct answers
  await go('bear-a1');
  for (let k = 0; k < 6; k++) { const q = await p.$('[data-act="q"]:not([disabled])'); if (!q) break; await q.click(); await wait(120); }
  await wait(500);
  out.push('ánimo: ' + await p.evaluate(() => document.querySelector('.toast.pett')?.textContent || 'ninguno visible'));
  await p.screenshot({path: SHOTS + '/m-lectura-neon.png'});
  await go('inicio');
  out.push('tarjeta portada: ' + await p.evaluate(() => document.querySelector('.phome')?.textContent.trim()));
  await go('progreso'); out.push('enlace en progreso: ' + await p.evaluate(() => !!document.querySelector('#app a[href="#mascota"]')));
  // mobile
  await p.setViewport({width: 390, height: 844}); await go('mascota');
  out.push('móvil desborde: ' + await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
  await p.screenshot({path: SHOTS + '/m-movil.png', fullPage: true});
  // A2: only learned language
  await p.evaluate(() => { const P = JSON.parse(localStorage.getItem('lyaPerfiles')); P.list[0].s.level = 'A2'; localStorage.setItem('lyaPerfiles', JSON.stringify(P)); });
  await p.reload({waitUntil: 'networkidle0'}); await go('mascota');
  out.push('A2 texto: ' + await p.evaluate(() => document.querySelector('.ptabs')?.textContent));
  console.log(out.join('\n')); console.log('ERRORES:', errs.length ? errs.join('\n') : 'ninguno');
  await b.close();
})();
