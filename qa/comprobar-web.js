const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'http://localhost:8765/index.html';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox']});
  const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  p.on('requestfailed', r => errs.push('reqfail: ' + r.url()));
  p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  await p.goto(BASE, {waitUntil: 'networkidle0'});
  const out = [];
  const IDS = await p.evaluate(async () => { const c = await (await fetch('content/catalogo.json')).json(); return c.topics.flatMap(t => (t.readings.es || []).filter(r => r.file).map(r => `${t.id}-${r.level.toLowerCase()}`)); });
  for (const lv of ['a1', 'a2', 'b1']) {
    await p.evaluate(h => { location.hash = h; }, 'nivel-' + lv); await wait(400);
    out.push(`nivel ${lv}: ` + await p.evaluate(() => { const c = [...document.querySelectorAll('.card')]; return c.length + ' tarjetas, listas: ' + c.filter(x => !/Próximamente|Coming soon/i.test(x.textContent)).length; }));
  }
  for (const id of IDS) {
    await p.evaluate(h => { location.hash = h; }, id); await wait(500);
    const info = await p.evaluate(() => ({h1: document.querySelector('h1')?.textContent, words: document.querySelectorAll('.w').length, qs: document.querySelectorAll('[data-act="q"]').length, gs: document.querySelectorAll('[data-act="g"]').length}));
    const els = await p.$$('.w'); let k = '', t = '';
    if (els[7]) {
      k = await els[7].evaluate(e => e.dataset.k);
      await els[7].click(); await wait(300);
      t = await p.evaluate(() => { const t = document.getElementById('tip'); return (t.querySelector('b').textContent + ' | ' + t.querySelector('small').textContent + ' | ' + t.querySelector('.def').textContent).slice(0, 110); });
    }
    const q = await p.$('[data-act="q"]'); if (q) await q.click(); await wait(200);
    const answered = await p.evaluate(() => document.querySelectorAll('[data-act="q"][disabled]').length);
    out.push(`${id}: "${info.h1}" palabras=${info.words} preg=${info.qs} gram=${info.gs} toque[${k}] => ${t} | respondida=${answered > 0}`);
  }
  await p.evaluate(h => { location.hash = h; }, 'diccionario'); await wait(400);
  out.push('diccionario: ' + await p.evaluate(() => document.getElementById('app').textContent.slice(0, 80)));
  await p.screenshot({path: '/home/user/qa/shot.png'});
  console.log(out.join('\n')); console.log('ERRORES:', errs.length ? errs.join('\n') : 'ninguno');
  await b.close();
})();
