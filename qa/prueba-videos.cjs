// Prueba de los vídeos con preguntas en el navegador (con un reproductor de YouTube simulado: aquí no hay internet).
// Profe: crear un vídeo, mandarlo como deberes en directo, abrir la sala avisando a la clase, elegir modo y lanzar.
// Alumno: «Deberes» (tocar abre la actividad), entra solo a la sala, contesta. También a solas y en proyección.
// Uso: node qa/servidor-prueba.mjs $PWD 8790 & node qa/prueba-videos.cjs http://localhost:8790 [carpeta-capturas]
const { chromium, devices } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8790', OUT = process.argv[3] || '/tmp/qa-videos';
const wait = ms => new Promise(r => setTimeout(r, ms));
/* YouTube simulado: 60 s de vídeo que pasan 5 veces más rápido */
const FALSO_YT = `window.YT = {Player: function (id, o) {
  const el = document.getElementById(id), d = document.createElement('div'); d.className = 'ytfalso'; d.id = id; d.style.cssText = 'background:#234;color:#fff'; el.replaceWith(d);
  let t = 0, st = -1, iv = null; const ev = o.events || {};
  const tic = () => { d.textContent = 'vídeo ' + t.toFixed(1); };
  const self = {getCurrentTime: () => t, getPlayerState: () => st,
    playVideo() { if (st === 0) t = 0; st = 1; ev.onStateChange && ev.onStateChange({data: 1}); clearInterval(iv); iv = setInterval(() => { t += .5; tic(); if (t >= 60) { t = 60; st = 0; clearInterval(iv); ev.onStateChange && ev.onStateChange({data: 0}); } }, 100); },
    pauseVideo() { if (st === 1) st = 2; clearInterval(iv); }, seekTo(x) { t = x; tic(); }, destroy() { clearInterval(iv); }};
  window.__yt = self; setTimeout(() => ev.onReady && ev.onReady({target: self}), 30); return self; }};
setTimeout(() => window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady(), 10);`;
const api = async (ruta, datos, token) => { const r = await fetch(BASE + '/api/' + ruta, {method: datos ? 'POST' : 'GET', headers: {'Content-Type': 'application/json', ...(token ? {Authorization: 'Bearer ' + token} : {})}, body: datos ? JSON.stringify(datos) : undefined}); return r.json(); };
(async () => {
  require('fs').mkdirSync(OUT, {recursive: true});
  const b = await chromium.launch(); const fallos = [], errs = [];
  const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fallos.push(m); };
  const shot = (p, n) => p.screenshot({path: `${OUT}/${n}.png`});
  const x = Date.now().toString(36).slice(-5);
  const P = await api('registro', {usuario: 'pv' + x, clave: 'secreta1', rol: 'profe'});
  const cl = await api('admin', {accion: 'grupo_crear', nombre: '3ºB', codigo: 'c' + x}, P.token);
  const Al = await api('registro', {usuario: 'al' + x, clave: 'secreta1', rol: 'alumno', codigo: 'c' + x});
  const pagina = async (cuenta, disp = {viewport: {width: 1280, height: 860}}) => {
    const ctx = await b.newContext(disp);
    await ctx.route(/youtube\.com\/iframe_api/, r => r.fulfill({contentType: 'text/javascript', body: FALSO_YT}));
    await ctx.route(/(ytimg|youtube)\.com\/(?!iframe_api)/, r => r.fulfill({status: 404, body: ''}));
    await ctx.addInitScript(c => { if (c) localStorage.setItem('lyaCuenta', JSON.stringify(c)); }, cuenta);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('dialog', d => d.accept());
    return p;
  };
  /* ---------- profe: crear un vídeo ---------- */
  const h = await pagina({usuario: P.usuario, token: P.token, rol: 'profe'});
  await h.goto(BASE + '/#videos'); await h.waitForSelector('.vd-grid'); await shot(h, '01-inicio');
  ok(await h.locator('nav, #tabs').locator('a[href="#videos"]').count() === 1, 'pestaña Vídeos');
  await h.click('a[href="#videos-editar"]');
  await h.fill('#vd-urlf input', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3'); await h.click('#vd-urlf button');
  await h.waitForSelector('.ytfalso'); await h.fill('#vd-tit', 'Prueba de vídeo');
  await h.evaluate(() => window.__yt.seekTo(12));
  await h.waitForFunction(() => /0:12/.test(document.querySelector('#vd-aqui').textContent));
  await h.click('#vd-aqui');
  await h.fill('#vd-qs textarea', '¿Qué color?'); const os = h.locator('#vd-qs [data-e=o]');
  await os.nth(0).fill('Rojo'); await os.nth(1).fill('Azul'); await os.nth(2).fill('Verde');
  await h.evaluate(() => window.__yt.seekTo(30)); await wait(500); await h.click('#vd-aqui');
  const qs = h.locator('#vd-qs fieldset'); ok(await qs.count() === 2, 'dos preguntas añadidas en su momento');
  ok(await qs.nth(1).locator('.vd-t').inputValue() === '0:30', 'la segunda en el 0:30');
  await qs.nth(1).locator('textarea').fill('¿Cuántos?'); const o2 = qs.nth(1).locator('[data-e=o]'); await o2.nth(0).fill('Uno'); await o2.nth(1).fill('Dos');
  await qs.nth(1).locator('[data-e=c][data-j="1"]').check();
  await shot(h, '02-editor');
  await h.click('[data-vd=guardar]'); await h.waitForURL(/#video-[a-f0-9]{12}$/); const vid = h.url().split('#video-')[1];
  await h.waitForSelector('.vd-ver'); ok(await h.locator('.vd-ver > li').count() === 2, 'guardado: ficha con 2 preguntas');
  /* mandar como deberes en directo */
  await h.waitForSelector('.ac-deber'); await h.click('.ac-deber summary'); await h.check('.ac-form [name=directo][value="1"]'); await h.click('.ac-form button');
  await h.waitForFunction(() => /Mandado/.test(document.querySelector('.ac-ok').textContent)); ok(true, 'mandado como deberes en directo');
  ok(await h.locator('#ac-grupo').count() === 1, 'selector «Avisar a la clase»');
  await shot(h, '03-ficha');
  /* ---------- alumno: deberes ---------- */
  const al = await pagina({usuario: Al.usuario, token: Al.token, rol: 'alumno'}, {...devices['iPhone 13']});
  await al.goto(BASE + '/#deberes'); await al.waitForSelector('.deb-pag li');
  ok(/Prueba de vídeo/.test(await al.locator('.deb-pag').textContent()), 'el alumno ve el deber en «Deberes»');
  ok(await al.locator('a[href="#deberes"]').count() >= 1, 'pestaña Deberes');
  await shot(al, '04-deberes-alumno');
  /* profe abre la sala avisando a la clase → el alumno entra solo */
  await h.selectOption('#ac-grupo', cl.id); await h.click('[data-vd=directo]');
  await h.waitForURL(/#videos-proyectar-\d{6}/); const cod = h.url().split('-').pop();
  await al.waitForURL(new RegExp('#vjugar-' + cod), {timeout: 15000}); ok(true, 'el alumno entra solo a la sala desde Deberes');
  await h.waitForFunction(() => document.querySelectorAll('.cc-chip').length === 1, null, {timeout: 8000}); ok(true, 'el profe lo ve conectado');
  await h.click('[data-m=individual]'); await h.click('[data-vd=lect][data-n="30"]'); await shot(h, '05-sala-opciones');
  await h.click('[data-vd=lanzar]');
  await al.waitForSelector('.vd-todas'); ok(true, 'tiempo de lectura: el alumno ve todas las preguntas'); await shot(al, '06-lectura-movil');
  await h.click('[data-vd=pasar]');
  await al.waitForSelector('#vd-play, .ytfalso', {timeout: 10000}); await wait(3500);
  if (await al.locator('#vd-play').isVisible().catch(() => false)) await al.click('#vd-play');
  await al.waitForSelector('[data-vd=indr]', {timeout: 15000}); ok(true, 'individual: el vídeo del móvil se para en la pregunta'); await shot(al, '07-individual-pregunta');
  await al.click('[data-vd=indr][data-j="0"]'); await al.waitForSelector('[data-vd=indseguir]'); await al.click('[data-vd=indseguir]');
  await al.waitForSelector('[data-vd=indr]', {timeout: 15000}); await al.click('[data-vd=indr][data-j="0"]'); await al.waitForSelector('[data-vd=indseguir]'); await al.click('[data-vd=indseguir]');
  await h.waitForSelector('.vd-tabla'); await shot(h, '08-progreso-profe');
  await al.waitForFunction(() => /terminado|podio|Fin|🏁/i.test(document.body.textContent), null, {timeout: 20000});
  await h.waitForSelector('.cc-podio', {timeout: 15000}); ok(true, 'fin solo cuando todos han contestado'); await shot(h, '09-podio');
  await al.waitForSelector('.cc-jbox.fin', {timeout: 8000}); ok(true, 'el móvil ve el final');
  const ac = await al.evaluate(id => (window.LYA.get().S.g.ac || {})[id], vid); ok(ac && ac.n === 1 && ac.bp === 50, 'el deber queda hecho (1 de 2): ' + JSON.stringify(ac));
  /* ---------- proyección ---------- */
  await h.click('[data-vd=cerrar]'); await h.waitForURL(/#video-[a-f0-9]/); await h.waitForSelector('.vd-ver'); await h.waitForSelector('#ac-grupo');
  await h.selectOption('#ac-grupo', cl.id); await h.click('[data-vd=directo]'); await h.waitForURL(/#videos-proyectar-\d{6}/); const cod2 = h.url().split('-').pop();
  await al.goto(BASE + '/#deberes'); await al.waitForURL(new RegExp('#vjugar-' + cod2), {timeout: 15000}); ok(true, 'segunda sala: entra solo otra vez');
  await h.waitForSelector('.cc-chip'); await h.click('[data-vd=lanzar]');
  await al.waitForFunction(() => /pantalla grande|big screen/.test(document.body.textContent)); ok(true, 'proyección: el móvil dice que mire la pantalla');
  await h.waitForSelector('.vd-hov .cc-hpreg', {timeout: 20000}); ok(true, 'proyección: el vídeo se para y sale la pregunta');
  await al.waitForSelector('[data-vd=resp]', {timeout: 10000}); await shot(al, '10-proyeccion-movil'); await shot(h, '11-proyeccion-pantalla');
  await al.click('[data-vd=resp][data-j="0"]');
  await h.waitForSelector('.vd-hov [data-vd=pasar].main', {timeout: 15000}); ok(true, 'resultado en cuanto contestan todos'); await shot(h, '12-resultado');
  await h.click('.vd-hov [data-vd=pasar]'); await h.waitForFunction(() => /Cuántos/.test(document.querySelector('.vd-hov')?.textContent || ''), null, {timeout: 20000}); ok(await h.evaluate(() => window.__yt.getCurrentTime()) >= 29.5, 'sigue el vídeo y para en la 2ª');
  await al.waitForSelector('[data-vd=resp]', {timeout: 10000}); await al.click('[data-vd=resp][data-j="1"]');
  await h.waitForSelector('.vd-hov [data-vd=pasar].main', {timeout: 15000}); await h.click('.vd-hov [data-vd=pasar]');
  await h.waitForSelector('.cc-podio', {timeout: 30000}); ok(true, 'al acabar el vídeo, podio');
  /* ---------- a solas, desde Deberes ---------- */
  await api('admin', {accion: 'deber_crear', actividad: vid, limite: '2030-01-01', grupo: cl.id}, P.token);
  await al.goto(BASE + '/#deberes'); await al.waitForSelector(`.deb-pag a[href="#video-solo-${vid}"]`);
  await al.click(`.deb-pag a[href="#video-solo-${vid}"]`); ok(/#video-solo-/.test(al.url()), 'tocar el deber abre la actividad');
  await al.waitForSelector('.ytfalso'); await al.evaluate(() => window.__yt.playVideo());
  await al.waitForSelector('[data-vd=solor]', {timeout: 10000}); await al.evaluate(() => window.__yt.seekTo(50));
  await al.click('[data-vd=solor][data-j="0"]'); await al.click('[data-vd=seguir]');
  await al.waitForSelector('[data-vd=solor]:not([disabled])', {timeout: 10000}); ok(/Cuántos/.test(await al.locator('.vd-ov').textContent()), 'si se salta una pregunta, sale igual');
  await al.click('[data-vd=solor][data-j="1"]'); await shot(al, '13-solo-correcta'); await al.click('[data-vd=seguir]');
  await al.waitForSelector('.vd-final', {timeout: 15000}); ok(/2 de 2|2 of 2/.test(await al.locator('.vd-final').textContent()), 'a solas: 2 de 2'); await shot(al, '14-solo-fin');
  /* panel del profe: actividades creadas */
  await h.goto(BASE + '/#inicio'); await h.waitForSelector('#app');
  await h.evaluate(() => window.LYACuentas.panel('actividades')); await h.waitForSelector('#admact .ctali');
  ok(/Prueba de vídeo/.test(await h.locator('#admact').textContent()), 'Actividades creadas lista el vídeo'); await shot(h, '15-actividades-creadas');
  ok(!errs.length, 'sin errores de JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close();
  console.log(fallos.length ? `\n${fallos.length} fallos` : '\nTodo bien');
  process.exit(fallos.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
