const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8766/index.html';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox']});
  const p = await b.newPage(); const errs = [], out = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  await p.addInitScript(() => { window.__xp = []; addEventListener('lya:xp', e => window.__xp.push(e.detail)); });
  await p.goto(BASE + '#bear-a1'); await wait(1200);
  out.push('lectura: ' + await p.textContent('h1'));
  // tap a word and add it
  const w = p.locator('.w').nth(7); await w.scrollIntoViewIfNeeded(); await w.dispatchEvent('pointerdown'); await wait(200);
  out.push('tip: ' + await p.textContent('#tip b') + ' | ' + await p.textContent('#tip .def'));
  await p.locator('#add').dispatchEvent('click'); await wait(300);
  await p.evaluate(() => location.hash = 'diccionario'); await wait(800);
  out.push('dict palabras: ' + await p.locator('.words li').count());
  await p.click('[data-act="addvocab"][data-r="bear-a1"]'); await wait(800);
  out.push('tras vocab clave: ' + await p.locator('.words li').count() + ' | primera: ' + (await p.locator('.words li').first().innerText()).replace(/\n/g,' / '));
  for (const m of ['test', 'fill', 'write']) {
    await p.evaluate(m => { const S = LYA.get().S; S.qmodes = [m]; LYA.save(); LYA.renderPage(); }, m); await wait(200); // Remix: los modos se combinan; dejamos solo uno
    await p.click('[data-act="prac"][data-r="bear-a1"]'); await wait(800);
    let n = 0;
    for (let i = 0; i < 40; i++) {
      if (await p.locator('[data-act="qnext"]').count()) { await p.click('[data-act="qnext"]'); await wait(100); continue; }
      if (!(await p.locator('.prog').count())) break;
      if (i === 0) out.push(`[${m}] ` + (await p.locator('.qc').innerText()).replace(/\n+/g, ' / ').slice(0, 200));
      if (await p.locator('#qin').count()) {
        if (n % 2 === 0) { // right answer
          const ans = await p.evaluate(() => { const d = document.querySelector('.qc'); return null; });
        }
        await p.fill('#qin', n % 3 === 0 ? 'xxx' : 'test'); await p.press('#qin', 'Enter');
        if (n === 1 && m === 'fill') {}
      } else await p.locator('.opt').first().click();
      n++; await wait(120);
      if (n === 1) out.push(`[${m}] tras responder: ` + (await p.locator('.fb').innerText()));
    }
    out.push(`[${m}] final: ` + (await p.locator('.qc').innerText()).replace(/\n+/g, ' / ').slice(0, 160));
    await p.click('[data-act="quit"]'); await wait(200);
  }
  // fill with help
  await p.evaluate(m => { const S = LYA.get().S; S.qmodes = [m]; LYA.save(); LYA.renderPage(); }, 'fill'); await wait(200); await p.click('[data-act="prac"][data-r="bear-a1"]'); await wait(800);
  await p.click('[data-act="qhelp"]'); await wait(100);
  // modo mixto: elegir Test y Completar a la vez
  out.push('ayuda opciones: ' + await p.locator('.opt').count());
  // correct typed answer in write mode via known word
  await p.click('[data-act="quit"]'); await p.evaluate(m => { const S = LYA.get().S; S.qmodes = [m]; LYA.save(); LYA.renderPage(); }, 'write'); await wait(200); await p.click('[data-act="dir"][data-d="know"]');
  await p.click('[data-act="prac"][data-r="bear-a1"]'); await wait(500);
  const word = await p.evaluate(() => { const S = JSON.parse(localStorage.lyaPerfiles).list[0].s; const t = document.querySelector('.prompt').textContent.replace(/[«»]/g, ''); return S.dict.find(d => (d.tr?.en || d.t) === t)?.w; });
  await p.fill('#qin', word.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '')); await p.press('#qin', 'Enter'); await wait(150);
  out.push(`escribir "${word}" sin acentos: ` + await p.locator('.fb').innerText());
  const xp = await p.evaluate(() => window.__xp);
  out.push('xp eventos: ' + xp.length + ' total=' + xp.reduce((a, x) => a + x.xp, 0) + ' srcs=' + [...new Set(xp.map(x => x.src))].join(','));
  await p.screenshot({path: '/tmp/diccionario.png', fullPage: false});
  // regression: other pages
  await p.evaluate(() => location.hash = 'nivel-a1'); await wait(400); out.push('portada tarjetas: ' + await p.locator('.card').count());
  console.log(out.join('\n')); console.log('ERRORES:', errs.length ? errs.join('\n') : 'ninguno');
  await b.close();
})();
