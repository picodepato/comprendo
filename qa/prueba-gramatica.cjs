// Comprueba los 5 juegos de gramática y verbos (gramatica/gramatica.js) en los dos cursos.
// Uso: NODE_PATH=/opt/node22/lib/node_modules node prueba-gramatica.cjs http://localhost:8765/index.html /tmp/capturas
// Sin servidor de cuentas, los 404 de api/estado son esperados.
const {chromium} = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765/index.html';
const SHOTS = process.argv[3] || '/tmp';
const wait = ms => new Promise(r => setTimeout(r, ms));
const fresh = (learn, level) => ({list: [{id: 'local', name: '', s: {learn, know: learn === 'es' ? 'en' : 'es', level, read: learn === 'es' ? 'bear-a1' : 'en-bear-a1', a: {}, dict: [], dir: 'learn', say: false, view: 'home'}}], cur: 'local'});

async function run(browser, learn, level, mobile, out, errs) {
  const ctx = await browser.newContext(mobile ? {viewport: {width: 390, height: 800}, hasTouch: true, isMobile: true} : {viewport: {width: 1100, height: 900}});
  const p = await ctx.newPage(); const xp = [];
  const tag = `${learn}-${level}${mobile ? '-movil' : ''}`;
  p.on('pageerror', e => errs.push(`${tag} pageerror: ${e.message}`));
  p.on('console', m => { if (m.type() === 'error' && !/api\/estado/.test(m.text()) && !/404/.test(m.text())) errs.push(`${tag} console: ${m.text()}`); if (m.text().startsWith('XP ')) xp.push(JSON.parse(m.text().slice(3))); });
  p.on('response', r => { if (r.status() >= 400 && !/\/api\//.test(r.url())) errs.push(`${tag} ${r.status()} ${r.url()}`); });
  await p.addInitScript(([k, v]) => { if (!sessionStorage.getItem('init')) { localStorage.setItem(k, JSON.stringify(v)); sessionStorage.setItem('init', 1); } addEventListener('lya:xp', e => console.log('XP ' + JSON.stringify(e.detail))); }, ['lyaPerfiles', fresh(learn, level)]);
  await p.goto(BASE, {waitUntil: 'networkidle'});
  const D = await p.evaluate(l => fetch(`content/gramatica-${l}.json`).then(r => r.json()), learn);
  const TX = await p.evaluate(() => fetch('content/textos-gramatica.json').then(r => r.json()));
  const go = async h => { await p.evaluate(h => { location.hash = h; }, h); await wait(600); };
  const res = async () => (await p.locator('.gres').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 90);
  const o = [];
  await go('juegos');
  o.push('sala: ' + await p.locator('.grtile').count() + ' juegos de gramática');
  await p.screenshot({path: `${SHOTS}/gram-sala-${tag}.png`, fullPage: true});

  // 1. conjuga
  await go('gram-conj');
  await p.click('[data-gr="go"]'); await wait(300);
  const tense = lab => { const t = TX[learn]; const first = lab.split(' · ')[0]; return Object.keys(t).filter(k => /^t_/.test(k) && t[k] === first).map(k => k.slice(2).replace('_b1', ''))[0]; };
  let good = 0;
  for (let k = 0; k < 6; k++) {
    const v = await p.locator('#grverb').innerText(), per = await p.locator('#grper').innerText(), lab = await p.locator('#grten').innerText();
    const verb = D.verbs.find(x => x.v === v), pi = D.persons.indexOf(per), first = lab.split(' · ')[0], t = Object.keys(TX[learn]).filter(k => /^t_/.test(k) && TX[learn][k] === first).map(k => k.slice(2).replace('_b1', '')).find(k => verb?.f?.[k]);
    let ans = verb?.f?.[t]?.[pi];
    if (k === 1) ans = 'xxx'; // one wrong answer
    if (k === 2 && learn === 'es' && ans) ans = ans.normalize('NFD').replace(/[́]/g, ''); // without accent → still right
    if (!ans) { o.push(`conj: no encuentro ${v}/${per}/${lab}`); break; }
    await p.fill('#grin', ans); await p.keyboard.press('Enter'); await wait(150);
    const fb = await p.locator('#grfb').innerText(); if (k === 0 || k === 2) o.push(`  conj ${v} · ${per} · ${lab} → ${ans}: ${fb}`);
    if (/Correct|Bien|bien/.test(fb)) good++;
    await wait(k === 1 ? 1900 : 1400);
  }
  o.push(`conj: ${good}/6 bien, reloj ${await p.locator('#grclock').innerText()}`);
  await p.screenshot({path: `${SHOTS}/gram-conj-${tag}.png`});

  // 2. ordena (with a drag for the first word)
  await go('gram-orden');
  for (let s = 0; s < 6; s++) {
    if (!(await p.locator('#grbank').count())) break;
    const bank = await p.$$eval('#grbank .grw', bs => bs.map(b => [b.dataset.id, b.textContent]));
    const words = bank.map(b => b[1]);
    const item = D.order.find(x => { const w = x.s.split(/\s+/); return w.length === words.length && [...w].sort().join('|') === [...words].sort().join('|'); });
    if (!item) { o.push('orden: frase no encontrada ' + words.join(' ')); break; }
    const target = item.s.split(/\s+/);
    for (let i = 0; i < target.length; i++) {
      const id = await p.$$eval('#grbank .grw', (bs, w) => bs.find(b => b.textContent === w)?.dataset.id, target[i]);
      const loc = p.locator(`#grbank .grw[data-id="${id}"]`);
      if (i === 0 && s === 0) {
        const bb = await loc.boundingBox(), lb = await p.locator('#grline').boundingBox();
        if (mobile) {
          const cdp = await ctx.newCDPSession(p);
          const tp = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y}]});
          await tp('touchStart', bb.x + 10, bb.y + 10);
          for (let k = 1; k <= 8; k++) await tp('touchMove', bb.x + 10 + (lb.x + 30 - bb.x) * k / 8, bb.y + 10 + (lb.y + lb.height / 2 - bb.y) * k / 8);
          await tp('touchEnd');
        } else {
          await p.mouse.move(bb.x + 10, bb.y + 10); await p.mouse.down();
          await p.mouse.move(lb.x + 30, lb.y + lb.height / 2, {steps: 8}); await p.mouse.up();
        }
        await wait(150);
        o.push('  orden: arrastrar una palabra → en la línea: ' + await p.locator('#grline .grw').count());
        if (!(await p.locator('#grline .grw').count())) await p.locator(`#grbank .grw[data-id="${id}"]`).click();
      } else await loc.click();
    }
    if (s === 0) await p.screenshot({path: `${SHOTS}/gram-orden-${tag}.png`});
    await p.click('[data-gr="checko"]'); await wait(120);
    await p.click('[data-gr="nexto"]'); await wait(120);
  }
  o.push('orden: ' + await res());

  // 3. caza el error
  await go('gram-error');
  for (let s = 0; s < 8; s++) {
    if (!(await p.locator('.grtok').count())) break;
    const n = await p.locator('.grtok').count();
    for (let j = 0; j < n; j++) { await p.locator('.grtok').nth(j).click(); await wait(60); if (await p.locator('[data-gr="fix"]').count()) break; }
    const sent = await p.locator('.grsent').innerText();
    const sq = sent.replace(/\s+/g, ''); const item = D.error.find(x => x.bad.some(b => (x.pre + b + x.post).replace(/\s+/g, '') === sq));
    if (s === 0) await p.screenshot({path: `${SHOTS}/gram-error-${tag}.png`});
    const opts = await p.$$eval('[data-gr="fix"]', bs => bs.map(b => b.innerText.split('\n').pop()));
    const j = item ? Math.max(0, opts.indexOf(item.good)) : 0;
    await p.locator('[data-gr="fix"]').nth(j).click(); await wait(80);
    await p.click('[data-gr="nexte"]'); await wait(80);
  }
  o.push('error: ' + await res());

  // 4. pasado / presente / futuro
  await go('gram-tiempos');
  await p.click('[data-gr="go3"]'); await wait(900);
  await p.screenshot({path: `${SHOTS}/gram-tiempos-${tag}.png`});
  let fallMoved = await p.evaluate(() => parseFloat(document.getElementById('grfall').style.top));
  for (let k = 0; k < 25; k++) {
    if (await p.locator('.gres').count()) break;
    const s = await p.locator('#grfall').innerText();
    const it = D.tense.find(x => x.s === s);
    const t = k % 4 === 3 ? (it?.t === 'past' ? 'fut' : 'past') : it?.t;
    if (k === 5) await p.locator(`[data-gr="bin"][data-t="${t}"]`).click(); else await p.keyboard.press(String(['past', 'pres', 'fut'].indexOf(t) + 1));
    await wait(k % 4 === 3 ? 1600 : 650);
  }
  o.push(`tiempos: la frase baja (${fallMoved > 0 ? 'sí' : 'NO'}) → ` + await res());

  // 5. memoria
  await go('gram-memoria');
  await p.screenshot({path: `${SHOTS}/gram-memoria-${tag}.png`});
  for (let guard = 0; guard < 60; guard++) {
    const free = await p.$$eval('.grmem .mc', cs => cs.map((c, j) => c.disabled ? -1 : j).filter(j => j >= 0));
    if (free.length < 2) break;
    let matched = false;
    for (const j of free.slice(1)) {
      await p.click(`.mc[data-j="${free[0]}"]`); await wait(40);
      await p.click(`.mc[data-j="${j}"]`); await wait(80);
      if (await p.evaluate(i => document.querySelector(`.mc[data-j="${i}"]`)?.disabled, free[0])) { matched = true; break; }
      await wait(1150);
    }
    if (!matched) break;
  }
  await wait(700);
  o.push('memoria: ' + await res());

  // reading offer + progress saved
  await go(learn === 'es' ? 'minecraft-a2' : 'en-minecraft-a2'); await wait(400);
  o.push('oferta en la lectura: ' + await p.locator('.goffer .grtile').count() + ' juegos de gramática');
  await go(`gram-error--${learn === 'es' ? 'minecraft-a2' : 'en-minecraft-a2'}`);
  o.push('caza el error de una lectura: ' + await p.locator('.gstats').innerText().then(t => t.replace(/\s+/g, ' ')));
  const saved = await p.evaluate(() => JSON.stringify(JSON.parse(localStorage.lyaPerfiles).list[0].s.gram));
  o.push('guardado S.gram: ' + saved);
  o.push(`eventos lya:xp: ${xp.length}, con puntos: ${xp.filter(x => x.n > 0).map(x => x.juego + '+' + x.n).join(' ')}`);
  const over = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  o.push('scroll horizontal: ' + (over ? 'SÍ (mal)' : 'no'));
  out.push(`== ${tag}\n` + o.join('\n'));
  await ctx.close();
}
(async () => {
  const browser = await chromium.launch(); const out = [], errs = [];
  await run(browser, 'es', 'A1', false, out, errs);
  await run(browser, 'en', 'A2', false, out, errs);
  await run(browser, 'es', 'B1', true, out, errs);
  await run(browser, 'en', 'A1', true, out, errs);
  console.log(out.join('\n'));
  console.log('ERRORES: ' + (errs.length ? '\n' + errs.join('\n') : 'ninguno'));
  await browser.close();
})();
