const { chromium } = require('playwright');
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox']});
  const p = await b.newPage({viewport: {width: 420, height: 900}}); const errs = [], out = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await p.addInitScript(() => { window.__xp = []; addEventListener('lya:xp', e => window.__xp.push(e.detail)); });
  await p.goto('http://localhost:8766/index.html#diccionario'); await wait(1200);
  await p.click('[data-act="addvocab"][data-r="bear-a1"]'); await wait(600);
  out.push('remix btn (no sé): ' + await p.locator('[data-act="remix"]').innerText() + ' disabled=' + await p.locator('[data-act="remix"]').isDisabled());
  await p.click('[data-act="rxall"][data-v="1"]'); await wait(200);
  out.push('remix btn (todas): ' + await p.locator('[data-act="remix"]').innerText());
  await p.click('[data-act="qmode"][data-m="fill"]'); await p.click('[data-act="qmode"][data-m="write"]'); await wait(200);
  out.push('modos: ' + (await p.locator('.qm .seg').innerText()).replace(/\n/g,' | ') + ' || ' + (await p.locator('.remix .mnote').innerText()));
  await p.screenshot({path: '/tmp/remix.png', fullPage: false});
  await p.click('[data-act="remix"]'); await wait(800);
  const seen = {};
  for (let i = 0; i < 40; i++) {
    if (await p.locator('[data-act="qnext"]').count()) { await p.click('[data-act="qnext"]'); await wait(80); continue; }
    if (!(await p.locator('.prog').count())) break;
    const m = (await p.locator('.qtop span').first().innerText()).split('·').pop().trim(); seen[m] = (seen[m]||0)+1;
    if (await p.locator('#qin').count()) { await p.fill('#qin', 'x'); await p.press('#qin', 'Enter'); } else await p.locator('.opt').first().click();
    await wait(80);
  }
  out.push('tipos vistos: ' + JSON.stringify(seen));
  out.push('final: ' + (await p.locator('.qc').innerText()).replace(/\n+/g,' / ').slice(0,80));
  await p.click('[data-act="quit"]'); await wait(200);
  await p.click('[data-act="rxall"][data-v="0"]'); await wait(100);
  out.push('remix no sé tras fallar todo: ' + await p.locator('[data-act="remix"]').innerText());
  // cannot deselect all
  for (const m of ['test','fill','write']) await p.click(`[data-act="qmode"][data-m="${m}"]`);
  out.push('tras desmarcar todo: ' + (await p.locator('.qm .seg').innerText()).replace(/\n/g,' | '));
  out.push('xp srcs: ' + [...new Set((await p.evaluate(() => window.__xp)).map(x => x.src))].join(','));
  console.log(out.join('\n')); console.log('ERRORES:', errs.join('\n') || 'ninguno'); await b.close();
})();
