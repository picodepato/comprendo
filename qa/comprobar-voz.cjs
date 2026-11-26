const puppeteer = require('puppeteer-core');
const fs = require('fs');
const BASE = process.argv[2] || 'http://localhost:8765/index.html';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox']});
  const p = await b.newPage(); const errs = [];
  await p.setViewport({width: +(process.argv[3]||420), height: 800});
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errs.push('console: ' + m.text()); });
  await p.evaluateOnNewDocument(() => {
    window.__said = [];
    const ss = {speaking: false, pending: false, _u: null, getVoices: () => [{name: 'Google español', lang: 'es-ES'}], addEventListener() {},
      speak(u) { window.__said.push(u.text); this.speaking = true; this._u = u; clearTimeout(this._t); this._t = setTimeout(() => { this.speaking = false; u.onend && u.onend(); }, 60); },
      cancel() { clearTimeout(this._t); const u = this._u; this._u = null; if (this.speaking) { this.speaking = false; u && u.onerror && u.onerror({error: 'interrupted'}); } }};
    Object.defineProperty(window, 'speechSynthesis', {value: ss});
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  });
  await p.goto(BASE + '#bear-a1', {waitUntil: 'networkidle0'}); await wait(500);
  const r = {};
  r.sents = await p.$$eval('.vz-s', e => e.length);
  r.words = await p.$$eval('.reading .w', e => e.length);
  r.bar = await p.$eval('.vz-bar', e => e.textContent.trim().replace(/\s+/g, ' '));
  r.pron = await p.$eval('.vz-pron', e => e.textContent.trim().replace(/\s+/g, ' ').slice(0, 200));
  r.nomic = !!(await p.$('.vz-file'));
  await p.click('.vz-play'); await wait(250);
  r.playing = await p.evaluate(() => ({now: document.querySelector('.vz-s.now')?.dataset.n, fixed: getComputedStyle(document.querySelector('.vz-bar')).position, said: __said.length}));
  await p.screenshot({path: '/tmp/qa/voz-play.png'});
  await p.click('[data-act="q"]'); await wait(200);
  r.afterRender = await p.evaluate(() => ({now: document.querySelector('.vz-s.now')?.dataset.n, words: document.querySelectorAll('.reading .w').length}));
  await wait(2500);
  r.end = await p.evaluate(() => ({said: __said.length, now: !!document.querySelector('.vz-s.now'), first: __said[0], last: __said[__said.length - 1]}));
  await p.click('.vz-pron [data-vz="next"]'); await wait(100);
  await p.click('.vz-pron [data-vz="hear"]'); await wait(100);
  r.hear = await p.evaluate(() => __said[__said.length - 1]);
  await p.evaluate(() => scrollTo(0, 0));
  await p.evaluate(() => { const w = document.querySelectorAll('.reading .w')[3]; w.scrollIntoView({block: 'center'}); }); await wait(300); const w = await p.$$('.reading .w'); await w[3].click(); await wait(200);
  r.btn = await p.evaluate(() => { const b = document.querySelector('#tip .vz-word').getBoundingClientRect(); const t = document.getElementById('tip'); return [b.x, b.y, b.width, document.elementFromPoint(b.x + 18, b.y + 18)?.className, t.className, getComputedStyle(t).opacity]; });
  await p.click('#tip .vz-word'); await wait(100);
  r.word = await p.evaluate(() => [__said[__said.length - 1], document.querySelector('#tip small').textContent]);
  const fi = await p.$('.vz-file input');
  if (fi) {
    fs.writeFileSync('/tmp/qa/a.wav', Buffer.alloc(2000)); await fi.uploadFile('/tmp/qa/a.wav'); await wait(300);
    r.rec = await p.evaluate(() => ({mine: !document.querySelector('[data-vz="mine"]').disabled, small: document.querySelector('.vz-small').textContent, msg: document.querySelector('.vz-msg')?.textContent}));
  }
  await p.screenshot({path: '/tmp/qa/voz.png'});
  await p.evaluate(() => document.querySelector('.vz-pron').scrollIntoView()); await p.screenshot({path: '/tmp/qa/voz2.png'});
  console.log(JSON.stringify(r, null, 1)); console.log('ERRORES:', errs.join('\n') || 'ninguno');
  await b.close();
})();
