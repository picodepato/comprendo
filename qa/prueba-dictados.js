// Comprueba la sección de dictados (dictados/dictados.js)
// Uso: NODE_PATH=/opt/node22/lib/node_modules node prueba-dictados.js http://localhost:8765/index.html [/tmp/capturas]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765/index.html', OUT = process.argv[3] || '/tmp/qa';
const wait = ms => new Promise(r => setTimeout(r, ms));
const fake = () => {
  window.__said = []; window.__xp = [];
  addEventListener('lya:xp', e => window.__xp.push(e.detail));
  const ss = {speaking: false, pending: false, getVoices: () => [], addEventListener() {}, speak(u) { window.__said.push([u.text, u.rate]); }, cancel() {}};
  Object.defineProperty(window, 'speechSynthesis', {value: ss});
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
};
(async () => {
  require('fs').mkdirSync(OUT, {recursive: true});
  const b = await chromium.launch(); const fallos = [], errs = [];
  const ok = (c, m) => { if (!c) fallos.push(m); };
  const ctx = await b.newContext({viewport: {width: 1100, height: 900}});
  await ctx.addInitScript(fake);
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('response', r => { if (r.status() >= 400 && !/api\//.test(r.url())) errs.push(r.status() + ' ' + r.url()); });
  await p.goto(BASE + '#dictados', {waitUntil: 'networkidle'}); await wait(400);
  ok(await p.locator('.tabs a[href="#dictados"][aria-current=page]').count() === 1, 'pestaña Dictados marcada');
  const cards = await p.locator('.dc-card').count(); ok(cards === 15, 'hay 15 tarjetas de dictado en A1, hay ' + cards);
  await p.click('.dc-lv [data-l="B1"]'); await wait(200);
  ok(await p.locator('.dc-card[href="#dictado-bear-b1"]').count() === 1, 'nivel B1 cambia la lista');
  await p.click('.dc-lv [data-l="A1"]'); await wait(200);
  await p.click('.dc-card[href="#dictado-bear-a1"]'); await wait(400);
  ok(await p.locator('#dc-in').count() === 1, 'se abre el dictado con caja para escribir');
  await p.click('[data-dc="play"]'); await p.click('[data-dc="slow"]'); await wait(100);
  const said = await p.evaluate(() => __said); const s0 = await p.evaluate(() => LYADictados.actual());
  ok(said.length === 2 && said[0][0] === s0 && said[1][1] < said[0][1], 'escuchar y más lento leen la frase: ' + JSON.stringify(said));
  ok(!/[[\]]/.test(s0), 'la frase no lleva corchetes');
  // 1: perfecta
  await p.fill('#dc-in', s0); await p.click('[data-dc="check"]'); await wait(200);
  ok(await p.locator('.dc-score.ok').count() === 1, 'frase perfecta = 100 %');
  // 2: con fallos (sin tildes, una palabra menos, una mal escrita)
  await p.click('[data-dc="next"]'); await wait(200);
  const s1 = await p.evaluate(() => LYADictados.actual());
  const ws = s1.split(' '); const bad = ws.filter((_, i) => i !== 1).join(' ').normalize('NFD').replace(/[́]/g, '').replace(/(\p{L}{4,})/u, m => m.slice(0, -1) + 'x');
  await p.fill('#dc-in', bad); await p.keyboard.press('Enter'); await wait(200);
  const kinds = await p.$$eval('.dc-ops .dc-t', es => es.map(e => e.className.replace('dc-t ', '')));
  ok(kinds.includes('falta'), 'marca la palabra que falta: ' + kinds.join(','));
  ok(kinds.some(k => k === 'mal' || k === 'tilde'), 'marca mal escrita o tilde');
  ok(await p.locator('.dc-counts .dc-c').count() >= 2, 'resumen de fallos');
  await p.screenshot({path: OUT + '/dictado-correccion.png', fullPage: true});
  // vacía
  await p.click('[data-dc="next"]'); await wait(200);
  await p.click('[data-dc="check"]'); await wait(100);
  ok((await p.textContent('#dc-msg')).length > 3, 'avisa si no has escrito nada');
  // teclas de acentos
  await p.click('#dc-in'); await p.click('[data-dc="key"][data-c="á"]');
  ok((await p.inputValue('#dc-in')) === 'á', 'botón de letra especial escribe');
  for (let i = 2; i < 5; i++) { const s = await p.evaluate(() => LYADictados.actual()); await p.fill('#dc-in', s); await p.click('[data-dc="check"]'); await wait(100); await p.click('[data-dc="next"]'); await wait(150); }
  ok(await p.locator('.dc-end').count() === 1, 'página final');
  const g = await p.evaluate(() => ({dc: LYA.S.g.dc, xp: __xp.filter(x => x.src === 'dictado').length, got: LYA.S.g.got['dictado:bear-a1']}));
  ok(g.dc && g.dc['bear-a1'] && g.dc['bear-a1'].n === 1 && g.dc['bear-a1'].bp > 50, 'progreso guardado en S.g.dc: ' + JSON.stringify(g.dc));
  ok(g.xp === 5 && g.got, 'XP por frase y premio final');
  await p.screenshot({path: OUT + '/dictado-final.png', fullPage: true});
  await p.click('[data-dc="more"]'); await wait(300);
  ok(await p.locator('#dc-in').count() === 1, '«Otras 5 frases» empieza otro');
  await p.goto(BASE + '#dictados'); await wait(300);
  ok((await p.textContent('.dc-card[href="#dictado-bear-a1"]')).includes('★'), 'estrellas en la tarjeta');
  // sonido apagado
  await p.evaluate(() => localStorage.setItem('lyaVozPref', JSON.stringify({oir: false, hablar: true, fijo: true})));
  await p.reload({waitUntil: 'networkidle'}); await wait(400);
  ok(await p.locator('.dc-warn [data-dc="oir"]').count() === 1, 'sin sonido: explica que el dictado necesita audio');
  await p.click('[data-dc="oir"]'); await wait(200);
  ok(await p.locator('.dc-warn').count() === 0 && await p.evaluate(() => LYAVoz.oir()), 'activar el sonido desde el dictado');
  // inglés
  await p.goto(BASE + '#inicio'); await wait(300); await p.click('.chip[data-act="learn"][data-l="en"]'); await wait(500);
  await p.goto(BASE + '#dictados'); await wait(400);
  ok(await p.locator('.dc-card[href="#dictado-en-bear-a1"]').count() === 1, 'curso de inglés: dictados en inglés');
  await p.click('.dc-card[href="#dictado-en-bear-a1"]'); await wait(400);
  ok(await p.locator('.dc-keys').count() === 0, 'en inglés no salen las letras españolas');
  const se = await p.evaluate(() => LYADictados.actual()); ok(/^[\x00-\x7F’]+$/.test(se), 'frase en inglés: ' + se);
  // móvil
  const m = await b.newContext({viewport: {width: 360, height: 740}, deviceScaleFactor: 1}); await m.addInitScript(fake);
  const q = await m.newPage(); q.on('pageerror', e => errs.push('pageerror móvil: ' + e.message));
  await q.goto(BASE + '#dictado-bear-b1', {waitUntil: 'networkidle'}); await wait(400);
  const s = await q.evaluate(() => LYADictados.actual()); await q.fill('#dc-in', s.replace(/,/g, '').toLowerCase()); await q.click('[data-dc="check"]'); await wait(200);
  ok(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'móvil sin scroll lateral');
  await q.screenshot({path: OUT + '/dictado-movil.png', fullPage: true});
  // corrección (sin navegador)
  const c = await q.evaluate(() => { const C = LYADictados.correct; return [C('el oso es grande rapido y peligroso', 'El Oso es grande, rápido y peligroso.'), C('¿Qué tipo de juego es?', '¿Qué tipo de juego es?'), C('a spon on you nose', 'a spoon on your nose')].map(r => [r.pct, r.ops.map(o => o.k).join(' ')]); });
  ok(c[0][1] === 'may may ok ok punt tilde ok ok punt' && c[1][0] === 100 && c[2][1] === 'ok mal ok mal ok', 'corrección palabra a palabra: ' + JSON.stringify(c));
  await b.close();
  console.log('FALLOS:', fallos.length ? '\n - ' + fallos.join('\n - ') : 'ninguno');
  console.log('ERRORES:', errs.length ? '\n - ' + errs.join('\n - ') : 'ninguno');
  process.exit(fallos.length || errs.length ? 1 : 0);
})();
