const puppeteer = require('puppeteer-core');
const BASE = process.argv[2] || 'http://localhost:8765/index.html';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox']});
  const p = await b.newPage(); const errs = [];
  await p.setViewport({width: 1200, height: 900});
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  await p.goto(BASE, {waitUntil: 'networkidle0'});
  await p.evaluate(() => localStorage.clear()); await p.reload({waitUntil: 'networkidle0'});
  const out = [];
  const st = () => p.evaluate(() => { const P = JSON.parse(localStorage.getItem('lyaPerfiles')); const g = P.list[0].s.g; return {xp: g.xp, streak: g.streak, album: Object.keys(g.album), medals: g.medals, secrets: Object.keys(g.secrets), ok: g.st.ok}; });
  out.push('chip: ' + await p.$eval('#me', e => e.hidden + ' ' + e.textContent));
  for (const id of ['bear-a1', 'peligrosos-b1']) {
    await p.evaluate(h => { location.hash = h; }, id); await wait(500);
    // answer all mcq with the right answer (read from R via data) -> click first option for q, then grammar
    for (let k = 0; k < 40; k++) { const q = await p.$('[data-act="q"]:not([disabled]), [data-act="g"]:not([disabled])'); if (!q) break; await q.click(); await wait(60); }
    for (const m of ['vocab', 'halves']) {
      for (let k = 0; k < 20; k++) {
        const n = await p.$$eval(`[data-m="${m}"][data-side="L"]:not([disabled])`, a => a.map(x => x.dataset.i)); if (!n.length) break;
        await p.click(`[data-m="${m}"][data-side="L"][data-i="${n[0]}"]`); await wait(40);
        await p.click(`[data-m="${m}"][data-side="R"][data-i="${n[0]}"]`); await wait(80);
      }
    }
    await wait(300);
    out.push(`${id}: ` + JSON.stringify(await st()) + ' | resultado: ' + await p.evaluate(() => document.querySelector('.won')?.textContent.slice(0, 120) || 'sin cromo'));
  }
  out.push('toasts ahora: ' + await p.$$eval('.toast', a => a.map(x => x.textContent).join(' / ')));
  await p.screenshot({path: '/home/user/qa/lectura.png'});
  // event from other parts
  await p.evaluate(() => { for (let i = 0; i < 10; i++) dispatchEvent(new CustomEvent('lya:xp', {detail: {n: 0, ok: true, src: 'juego'}})); dispatchEvent(new CustomEvent('lya:xp', {detail: {n: 20, src: 'juego', lectura: 'bear-b1', aciertos: 10}})); dispatchEvent(new CustomEvent('lya:xp', {detail: {xp: 2, src: 'quiz-test'}})); });
  await wait(200);
  out.push('tras eventos: ' + JSON.stringify(await st()));
  out.push('LYA.award: ' + await p.evaluate(() => typeof window.LYA?.award));
  await p.evaluate(() => { location.hash = 'progreso'; }); await wait(500);
  out.push('progreso: ' + await p.evaluate(() => document.getElementById('app').innerText.slice(0, 600).replace(/\n+/g, ' | ')));
  out.push('cromos: ' + await p.$$eval('.stk', a => a.length + ' total, ' + a.filter(x => x.classList.contains('got')).length + ' ganados'));
  await p.screenshot({path: '/home/user/qa/progreso.png', fullPage: true});
  // shield purchase
  const sb = await p.$('[data-act="shield"]'); if (sb) { await sb.click(); await wait(200); }
  out.push('escudos: ' + await p.evaluate(() => JSON.parse(localStorage.getItem('lyaPerfiles')).list[0].s.g.shields));
  // streak simulation: last = 2 days ago with shield -> keeps; 3 days ago without -> resets
  await p.evaluate(() => { const P = JSON.parse(localStorage.getItem('lyaPerfiles')); const g = P.list[0].s.g; const d = new Date(); d.setDate(d.getDate() - 2); g.last = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; g.streak = 5; localStorage.setItem('lyaPerfiles', JSON.stringify(P)); });
  await p.reload({waitUntil: 'networkidle0'}); await wait(300);
  out.push('racha con escudo antes de jugar: ' + await p.$eval('#me', e => e.textContent));
  await p.evaluate(() => dispatchEvent(new CustomEvent('lya:xp', {detail: {xp: 2, src: 'quiz-test'}}))); await wait(200);
  out.push('tras actividad: ' + JSON.stringify(await st()) + ' escudos=' + await p.evaluate(() => JSON.parse(localStorage.getItem('lyaPerfiles')).list[0].s.g.shields));
  // mobile
  await p.setViewport({width: 380, height: 800}); await p.evaluate(() => { location.hash = 'progreso'; }); await wait(400);
  await p.screenshot({path: '/home/user/qa/movil.png', fullPage: false});
  out.push('overflow movil: ' + await p.evaluate(() => document.documentElement.scrollWidth + ' / ' + innerWidth));
  console.log(out.join('\n')); console.log('ERRORES:', errs.length ? errs.join('\n') : 'ninguno');
  await b.close();
})();
