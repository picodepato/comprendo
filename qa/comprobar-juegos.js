// Comprueba los mini-juegos: sala, oferta al final de la lectura, y una partida de cada juego.
const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'http://localhost:8765/index.html';
const SHOTS = process.argv[3] || '/tmp';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox']});
  const p = await b.newPage(); const errs = [], xp = [];
  await p.setViewport({width: 1100, height: 900});
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); if (m.text().startsWith('XP ')) xp.push(m.text()); });
  p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  await p.evaluateOnNewDocument(() => addEventListener('lya:xp', e => console.log('XP ' + JSON.stringify(e.detail))));
  await p.goto(BASE, {waitUntil: 'networkidle0'});
  const out = [];
  const go = async h => { await p.evaluate(h => { location.hash = h; }, h); await wait(700); };
  out.push('pestaña Juegos: ' + await p.evaluate(() => !!document.querySelector('#tabs a[href="#juegos"]')));
  await go('bear-a1');
  out.push('oferta en lectura: ' + await p.evaluate(() => document.querySelectorAll('.goffer .gtile').length) + ' juegos');
  await go('juegos'); await wait(500);
  out.push('sala: ' + await p.evaluate(() => document.querySelectorAll('.gtile').length + ' juegos · ' + document.querySelector('.gnote')?.textContent));
  await p.screenshot({path: SHOTS + '/sala.png'});
  // cartas (lectura)
  await go('juego-cartas--bear-a1');
  const pairs = await p.evaluate(() => document.querySelectorAll('.mc').length / 2);
  for (let guard = 0; guard < 80; guard++) {
    const free = await p.evaluate(() => [...document.querySelectorAll('.mc')].map((c, j) => c.disabled ? -1 : j).filter(j => j >= 0));
    if (free.length < 2) break;
    let matched = false;
    for (const j of free.slice(1)) {
      await p.click(`.mc[data-j="${free[0]}"]`); await wait(60);
      await p.click(`.mc[data-j="${j}"]`); await wait(120);
      if (await p.evaluate(i => document.querySelector(`.mc[data-j="${i}"]`)?.disabled, free[0])) { matched = true; break; }
      if (guard === 0) await p.screenshot({path: SHOTS + '/cartas.png'});
      await wait(1000);
    }
    if (!matched || await p.$('.gres')) break;
  }
  out.push(`cartas: ${pairs} parejas → ` + await p.evaluate(() => document.querySelector('.gres')?.innerText.replace(/\s+/g, ' ').slice(0, 120)));
  await p.screenshot({path: SHOTS + '/cartas-fin.png'});
  // reloj (diccionario)
  await go('juego-reloj');
  await p.click('[data-g="go"]'); await wait(300);
  await p.screenshot({path: SHOTS + '/reloj.png'});
  for (let k = 0; k < 6; k++) { await p.keyboard.press(String(1 + (k % 4))); await wait(1200); }
  out.push('reloj en marcha: ' + await p.evaluate(() => document.getElementById('gclock')?.textContent + ' aciertos=' + document.querySelectorAll('.gs b')[1]?.textContent));
  // ahorcado
  await go('juego-ahorcado--minecraft-a2');
  await p.screenshot({path: SHOTS + '/ahorcado.png'});
  for (let w = 0; w < 6; w++) {
    for (const ch of 'eaosrnildtcumpbgvyqhfzjñxkw') { const dis = await p.evaluate(() => !document.querySelector('.kb')); if (dis) break; await p.keyboard.press(ch); await wait(30); }
    await wait(100);
    if (w === 0) await p.screenshot({path: SHOTS + '/ahorcado-palabra.png'});
    const nb = await p.$('[data-g="nextw"]'); if (!nb) break; await nb.click(); await wait(200);
  }
  out.push('ahorcado: ' + await p.evaluate(() => document.querySelector('.gres')?.innerText.replace(/\s+/g, ' ').slice(0, 140)));
  await p.screenshot({path: SHOTS + '/ahorcado-fin.png'});
  // mobile
  await p.setViewport({width: 390, height: 800});
  await go('juego-cartas'); await p.screenshot({path: SHOTS + '/movil-cartas.png'});
  await go('juego-ahorcado'); await p.screenshot({path: SHOTS + '/movil-ahorcado.png'});
  out.push('progreso guardado: ' + await p.evaluate(() => JSON.stringify(JSON.parse(localStorage.lyaPerfiles).list[0].s.juegos)));
  console.log(out.join('\n'));
  console.log('eventos XP: ' + xp.length + '\n  ' + xp.filter(x => !x.includes('"n":0')).join('\n  '));
  console.log('ERRORES:', errs.length ? errs.join('\n') : 'ninguno');
  await b.close();
})();
