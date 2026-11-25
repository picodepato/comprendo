// Prueba los 5 retos en grupo (retos/retos.js + api/_retos.js) con 1 pizarra y 3 alumnos.
// Uso: node qa/servidor-prueba.mjs $PWD 8790  y luego  NODE_PATH=$(npm root -g) node qa/prueba-retos.cjs http://localhost:8790/index.html [/tmp/qa-retos] [es|en|ca]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8790/index.html', OUT = process.argv[3] || '/tmp/qa-retos', LANG = process.argv[4] || 'es';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  require('fs').mkdirSync(OUT, {recursive: true});
  const b = await chromium.launch(); const fallos = [], errs = [];
  const ok = (c, m) => { if (!c) { fallos.push(m); console.log('✗', m); } else console.log('✓', m); };
  const nueva = async (w, h) => {
    const ctx = await b.newContext({viewport: {width: w, height: h}});
    await ctx.addInitScript(() => { window.__xp = []; addEventListener('lya:xp', e => window.__xp.push(e.detail)); });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('response', r => { if (r.status() >= 500) errs.push(r.status() + ' ' + r.url()); });
    return p;
  };
  const prof = await nueva(1280, 800), al = [await nueva(390, 844), await nueva(390, 844), await nueva(390, 844)];
  const E = p => p.evaluate(() => { const E = LYARetos._E; return {st: E.st, G: E.G, ui: E.ui}; });
  async function sala(juego, equipos, nivel = 'A2', reparto = [1, 1, 2]) {
    await prof.goto(BASE + '#reto-' + juego, {waitUntil: 'networkidle'}); await wait(300);
    ok(await prof.locator('.tabs a[href="#grupo"][aria-current=page], [data-sec="grupo"][aria-current=page]').count() >= 1, juego + ': apartado En grupo marcado');
    await prof.selectOption('[data-rt-c="lang"]', LANG); await wait(100);
    await prof.selectOption('[data-rt-c="nivel"]', nivel); await wait(100);
    await prof.selectOption('[data-rt-c="equipos"]', String(equipos)); await wait(100);
    await prof.uncheck('[data-rt-c="juega"]'); await wait(100); /* la pizarra del profe, sin jugar */
    await prof.click('[data-rt-form="crear"] .btn.main'); await wait(900);
    const h = await prof.evaluate(() => location.hash); ok(/^#reto-pizarra-\d{6}$/.test(h), juego + ': sala creada ' + h);
    const cod = h.slice(-6);
    for (const [i, p] of al.entries()) {
      /* entrar con código desde «En grupo» (busca la sala entre todos los juegos) */
      await p.goto(BASE + '#grupo', {waitUntil: 'networkidle'}); await wait(200);
      await p.fill('#nvcin', cod); await p.click('#nvcode button'); await wait(1200);
      ok((await p.evaluate(() => location.hash)) === '#reto-' + cod, juego + ': «Entrar con código» lleva a la sala');
      await p.fill('#rt-nom', ['Ana', 'Biel', 'Carla'][i]);
      if (equipos) await p.click(`.rt-eq[data-e="${reparto[i]}"]`);
      await p.click('[data-rt-form="unirme"] .btn.main'); await wait(500);
      ok(await p.locator('.rt-espera').count() === 1, juego + ': alumno ' + i + ' espera');
    }
    await wait(1700);
    await prof.screenshot({path: `${OUT}/${juego}-0-pizarra.png`});
    await prof.click('[data-rt="empezar"]'); await wait(2000);
    return cod;
  }
  const clickW = (p, id) => p.click(`.rt-txt [data-w="${id}"]`);
  const clickF = (p, id) => p.click(`.rt-txt [data-f="${id}"] .rt-w >> nth=0`);

  /* 🔎 Encuentra la prueba (individual) */
  await sala('prueba', 0, 'A2');
  let s = await E(al[0]); const R0 = s.G.rondas[0];
  ok(s.G.rondas.length >= 5, 'prueba: ' + s.G.rondas.length + ' rondas');
  const bueno = R0.ok[0], malo = R0.tipo === 'q' ? (bueno === '0.0' ? '0.1' : '0.0') : '0.0.0';
  await (R0.tipo === 'q' ? clickF(al[1], malo) : clickW(al[1], malo)); await wait(300);
  ok(await al[1].locator('.rt-bloq').count() === 1, 'prueba: tocar mal bloquea');
  await (R0.tipo === 'q' ? clickF(al[0], bueno) : clickW(al[0], (R0.ok[0]))); await wait(600);
  ok(await al[0].locator('.rt-ok').count() >= 1, 'prueba: tocar la buena → encontrado');
  await al[0].screenshot({path: `${OUT}/prueba-1-alumno.png`, fullPage: true});
  await wait(3200);
  await (R0.tipo === 'q' ? clickF(al[1], bueno) : clickW(al[1], bueno)); await wait(300);
  await (R0.tipo === 'q' ? clickF(al[2], bueno) : clickW(al[2], bueno)); await wait(2500);
  ok(await prof.locator('.rt-txt [style*="--h"]').count() >= 1, 'prueba: mapa de calor en la pizarra');
  await prof.screenshot({path: `${OUT}/prueba-2-pizarra-solucion.png`, fullPage: true});
  const rk = await prof.locator('.rt-rk li').first().innerText(); ok(/Ana/.test(rk), 'prueba: Ana (la más rápida) va primera');
  await prof.click('[data-rt="siguiente"]'); await wait(1800);
  ok((await E(al[0])).st.sala.r === 1, 'prueba: pasa a la ronda 2');
  await prof.click('[data-rt="siguiente"]'); await wait(300);
  /* acabar: terminar */
  await prof.evaluate(() => { location.hash = location.hash; });
  const fin = async () => { for (let i = 0; i < 12; i++) { const b2 = prof.locator('[data-rt="terminar"]'); if (await b2.count()) { await b2.click(); break; } await prof.click('[data-rt="siguiente"]').catch(() => {}); await wait(400); } await wait(2200); };
  await fin();
  ok(await al[0].locator('.rt-fin').count() === 1, 'prueba: el alumno ve el final');
  ok((await al[0].evaluate(() => window.__xp)).some(x => /retos-prueba/.test(x.src)), 'prueba: da XP');
  await al[0].screenshot({path: `${OUT}/prueba-3-fin.png`, fullPage: true});

  /* 🎲 Atrapa los puntos (2 equipos) */
  await sala('apuesta', 2, 'B1');
  s = await E(al[0]); const A0 = s.G.rondas[0];
  await al[0].screenshot({path: `${OUT}/apuesta-1-alumno.png`, fullPage: true});
  await al[0].click(`[data-rt="vf"][data-v="${A0.ver ? 1 : 0}"]`); await wait(150);
  if (A0.ok[0]) { await clickF(al[0], A0.ok[0]); await wait(150); }
  await al[0].evaluate(() => { const r = document.querySelector('[data-rt-bet]'); r.value = 200; r.dispatchEvent(new Event('input', {bubbles: true})); });
  await al[0].click('[data-rt="apostar"]'); await wait(2000);
  ok(await al[1].locator('.rt-apuesta').count() === 0, 'apuesta: el compañero ve la apuesta del equipo');
  await al[2].click(`[data-rt="vf"][data-v="${A0.ver ? 0 : 1}"]`); await wait(100);
  await al[2].click('[data-rt="apostar"]'); await wait(2600);
  await prof.screenshot({path: `${OUT}/apuesta-2-pizarra.png`, fullPage: true});
  const sal1 = await prof.locator('.rt-rk li').first().innerText();
  ok(new RegExp(A0.ok[0] ? '1400' : '1200').test(sal1), 'apuesta: el equipo que acierta con prueba dobla: ' + sal1.replace(/\n/g, ' '));
  await fin();

  /* 🃏 Cartas a la mesa (1 equipo de 2 + 1 equipo de 1) */
  await sala('cartas', 2, 'A1');
  s = await E(al[0]);
  ok(s.G.huecos.length === 6 && s.G.cartas.length === 8, 'cartas: 6 huecos y 2 trampas');
  const mano = await al[0].locator('.rt-carta').allInnerTexts(), mano1 = await al[1].locator('.rt-carta').allInnerTexts();
  ok(mano.length + mano1.length === 8 && mano.length >= 3, 'cartas: las cartas se reparten entre el equipo (' + mano.length + ' + ' + mano1.length + ')');
  const c0 = s.G.cartas.filter((c, k) => k % 2 === 0), real = c0.find(c => c.g >= 0), trampa = s.G.cartas.find((c, k) => c.g < 0);
  await al[0].click(`[data-rt="carta"][data-c="${real.id}"]`); await wait(100);
  await al[0].click(`[data-rt="hueco"][data-g="${real.g}"]`); await wait(700);
  ok(await al[0].locator('.rt-hueco.lleno').count() === 1, 'cartas: la carta buena llena el hueco');
  const owner = s.G.cartas.indexOf(trampa) % 2 === 0 ? al[0] : al[1];
  await owner.click(`[data-rt="carta"][data-c="${trampa.id}"]`); await owner.click(`[data-rt="hueco"] >> nth=0`); await wait(700);
  await owner.screenshot({path: `${OUT}/cartas-1-fallo.png`, fullPage: true});
  await al[1].click('[data-rt="comodin"]'); await wait(700);
  ok(await al[1].locator('.rt-pista').count() === 1, 'cartas: el comodín da una pista');
  await wait(1600);
  ok(await al[0].locator('.rt-hueco.lleno').count() === 1 && (await al[1].locator('.rt-top').innerText()).includes('❌ 1'), 'cartas: el compañero ve el hueco y el fallo');
  await al[1].screenshot({path: `${OUT}/cartas-2-alumno.png`, fullPage: true});
  await prof.screenshot({path: `${OUT}/cartas-3-pizarra.png`, fullPage: true});
  await prof.click('[data-rt="terminar"]'); await wait(2200);
  ok(await al[2].locator('.rt-fin').count() === 1, 'cartas: final');

  /* 🤐 Palabra secreta (un equipo de 3) */
  await sala('tabu', 1, 'B1', [1, 1, 1]);
  s = await E(al[0]);
  const guia = await Promise.all(al.map(p => p.locator('.rt-guia').count()));
  ok(guia.filter(Boolean).length === 1 && guia[0] === 1, 'tabu: solo el primero es el guía');
  await al[0].screenshot({path: `${OUT}/tabu-1-guia.png`, fullPage: true});
  await al[1].screenshot({path: `${OUT}/tabu-2-companero.png`, fullPage: true});
  const w0 = s.G.palabras[0].o[0].join('.');
  await clickW(al[1], w0); await wait(1800);
  ok(await al[1].locator('.rt-guia').count() === 1, 'tabu: tras acertar, el guía pasa a ser el segundo');
  await al[0].click('[data-rt="tabu"][data-v="tabu"]'); await wait(1800);
  ok(await al[2].locator('.rt-guia').count() === 1, 'tabu: «¡Tabú!» quita el turno y pasa al tercero');
  ok((await prof.locator('.rt-rk li').first().innerText()).includes('100'), 'tabu: 100 puntos en la pizarra');
  await prof.click('[data-rt="terminar"]'); await wait(2200);

  /* 🧭 Lector y piloto (un equipo de 3) */
  await sala('piloto', 1, 'A1', [1, 1, 1]);
  s = await E(al[0]);
  ok(await al[0].locator('.rt-lector').count() === 1 && await al[0].locator('.rt-piloto').count() === 0, 'piloto: Ana es lectora y no ve los retos');
  ok(await al[1].locator('.rt-piloto').count() === 1 && await al[1].locator('.rt-txt').count() === 0, 'piloto: Biel es piloto y no ve el texto');
  await al[1].screenshot({path: `${OUT}/piloto-1-piloto.png`, fullPage: true});
  await al[0].screenshot({path: `${OUT}/piloto-2-lector.png`, fullPage: true});
  for (let k = 0; k < 3; k++) { await al[1].click('[data-rt="pregunte"]'); await wait(400); }
  ok(await al[1].locator('[data-rt="pregunte"]').count() === 0, 'piloto: después de 3 preguntas no se puede preguntar más');
  for (let q = 0; q < 3; q++) { const p = q === 0 ? al[1] : al[1]; await p.click(`[data-rt="resp"][data-o="${s.G.retos[q].ok}"]`); await wait(700); }
  await wait(1600);
  ok(await al[0].locator('.rt-piloto').count() === 1 && await al[1].locator('.rt-lector').count() === 1, 'piloto: a mitad se cambian los papeles');
  await al[0].screenshot({path: `${OUT}/piloto-3-cambio.png`, fullPage: true});
  const pts = await prof.locator('.rt-rk li').first().innerText(); ok(/(100|...)/.test(pts) && /3[0-9]{2}|4[0-9]{2}/.test(pts), 'piloto: puntos ' + pts.replace(/\n/g, ' '));
  await prof.click('[data-rt="terminar"]'); await wait(2200);

  ok(!errs.length, 'sin errores: ' + errs.join(' | '));
  console.log(fallos.length ? `\n${fallos.length} FALLOS` : '\nTODO BIEN');
  await b.close(); process.exit(fallos.length ? 1 : 0);
})();
