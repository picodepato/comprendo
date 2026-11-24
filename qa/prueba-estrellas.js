// Comprueba las estrellas por lectura, la relectura y los logros de estrellas.
const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'http://localhost:8765/index.html';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox']});
  const p = await b.newPage(); const errs = [];
  await p.setViewport({width: 1200, height: 900});
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('response', r => { if (r.status() >= 400 && !/favicon|\/api\//.test(r.url())) errs.push(r.status() + ' ' + r.url()); });
  await p.goto(BASE, {waitUntil: 'networkidle0'});
  await p.evaluate(() => localStorage.removeItem('lyaPerfiles')); await p.reload({waitUntil: 'networkidle0'});
  const out = [];
  const st = id => p.evaluate(id => (JSON.parse(localStorage.getItem('lyaPerfiles')).list.find(x => x.id === JSON.parse(localStorage.getItem('lyaPerfiles')).cur).s.g.rd || {})[id] || null, id);
  // play a reading: right = answer everything right; otherwise pick option A everywhere
  async function play(id, right) {
    await p.evaluate(h => { location.hash = h; }, id); await wait(600);
    for (let k = 0; k < 60; k++) {
      const done = await p.evaluate(right => {
        const R = window.LYA.get().R;
        const bt = document.querySelector('[data-act="q"]:not([disabled]), [data-act="g"]:not([disabled])'); if (!bt) return true;
        const key = bt.dataset.k, i = +key.split(':').pop().slice(1), it = bt.dataset.act === 'q' ? R.q[i] : R.grammar.items[i];
        const o = right ? it[2] : 0; document.querySelector(`[data-k="${key}"][data-o="${o}"]`).click(); return false;
      }, right);
      if (done) break; await wait(40);
    }
    for (const m of ['vocab', 'halves']) for (let k = 0; k < 20; k++) {
      const n = await p.$$eval(`[data-m="${m}"][data-side="L"]:not([disabled])`, a => a.map(x => x.dataset.i)); if (!n.length) break;
      await p.click(`[data-m="${m}"][data-side="L"][data-i="${n[0]}"]`); await wait(30);
      await p.click(`[data-m="${m}"][data-side="R"][data-i="${n[0]}"]`); await wait(60);
    }
    await wait(300);
  }
  await play('bear-a1', false);
  out.push('1ª vez (respuestas A): ' + JSON.stringify(await st('bear-a1')) + ' | resultado: ' + await p.evaluate(() => document.querySelector('.runstars')?.innerText.replace(/\n/g, ' ')));
  out.push('botón: ' + await p.$eval('[data-act="reset"]', e => e.textContent + ' main=' + e.classList.contains('main')));
  await p.click('[data-act="reset"]'); await wait(400);
  out.push('tras volver a leer, scrollY=' + await p.evaluate(() => scrollY) + ' preguntas abiertas=' + await p.$$eval('[data-act="q"]:not([disabled])', a => a.length));
  await play('bear-a1', true);
  out.push('2ª vez (todo bien): ' + JSON.stringify(await st('bear-a1')) + ' | meta: ' + await p.$eval('.meta', e => e.innerText.replace(/\n/g, ' ')));
  await p.evaluate(() => { location.hash = 'nivel-a1'; }); await wait(500);
  out.push('tarjetas A1: ' + await p.$$eval('.card .rs', a => a.slice(0, 3).map(x => x.innerText.replace(/\n/g, ' ')).join(' | ')));
  await p.screenshot({path: '/home/user/qa/estrellas-portada.png'});
  // fake 3 stars in the whole BEAR topic and all of A1 to test achievements
  await p.evaluate(() => { const S = window.LYA.get().S; for (const r of window.LYA.rdList().filter(r => r.file && (r.t.id === 'bear' || r.level === 'A1'))) S.g.rd[r.id] = {n: 1, best: 3, bp: 100}; window.LYA.save(); });
  await play('bear-b1', true);
  out.push('logros: ' + JSON.stringify(await p.evaluate(() => window.LYA.get().S.g.ach)));
  await p.evaluate(() => { location.hash = 'progreso'; }); await wait(500);
  out.push('progreso: ' + await p.$eval('#estrellas', e => e.innerText.replace(/\n+/g, ' | ').slice(0, 300)));
  await p.screenshot({path: '/home/user/qa/estrellas-progreso.png', fullPage: true});
  // English course
  const en = await p.evaluate(() => window.LYA.rdList && true);
  await p.evaluate(() => { const S = window.LYA.get().S; S.learn = 'en'; S.know = 'es'; window.LYA.save(); location.hash = 'nivel-a1'; }); await p.reload({waitUntil: 'networkidle0'}); await wait(800);
  await play(await p.evaluate(() => window.LYA.rdList().find(r => r.file && r.level === 'A1').id), true);
  out.push('inglés tras jugar: ' + JSON.stringify(await p.evaluate(() => { const S = window.LYA.get().S; return Object.keys(S.g.rd).filter(k => k.startsWith('en-')).map(k => [k, S.g.rd[k]]); })));
  await p.evaluate(() => { location.hash = 'nivel-a1'; }); await wait(600);
  out.push('curso inglés: ' + await p.evaluate(() => [window.LYA.get().S.learn, document.querySelectorAll('.card .rs').length + ' tarjetas con estrellas']));
  console.log(out.join('\n')); console.log('ERRORES:', errs.length ? errs.join('\n') : 'ninguno');
  await b.close();
})();
