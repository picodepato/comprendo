/* Prueba de Matemáticas (mates/): práctica de los 8 apartados y los 7 juegos en grupo.
   Uso: node qa/servidor-prueba.mjs <carpeta> 8790  y luego  node qa/prueba-mates.cjs http://localhost:8790 [carpeta-capturas] */
const {chromium} = require("playwright");
const URL = process.argv[2] || "http://localhost:8790", DIR = process.argv[3] && process.argv[3] !== "-" ? process.argv[3] : null;
/* 4.º argumento opcional: solo algunas partes, p. ej. «practica,escape,concurso» */
const SOLO = process.argv[4] ? process.argv[4].split(",") : null, quiere = x => !SOLO || SOLO.includes(x);
const ok = (c, m) => { if (!c) { console.log("❌", m); process.exitCode = 1; } else console.log("✅", m); };
const espera = ms => new Promise(r => setTimeout(r, ms));
async function teclear(p, v) {
  for (const ch of String(Math.abs(v))) await p.click(`.mt-tec [data-v="${ch}"]`);
  if (v < 0) await p.click('.mt-tec [data-v="pm"]');
  await p.click('.mt-tec [data-v="ok"]');
  await espera(250);
}
async function practica(b) {
  const p = await b.newPage({viewport: {width: 420, height: 900}}); const errs = []; p.on("pageerror", e => errs.push(e.message));
  for (let ap = 1; ap <= 8; ap++) for (const d of [1, 3]) {
    await p.goto(`${URL}/#mates-t2-${ap}`); await espera(400);
    await p.click('[data-mt="tab"][data-t="aprende"]'); await p.click('[data-mt="tab"][data-t="practica"]'); await p.click(`[data-mt="empezar"][data-d="${d}"]`); await espera(200);
    for (let i = 0; i < 10; i++) {
      const Q = await p.evaluate(() => { const P = LYAMates._P(), q = P.serie[P.i]; return {tipo: q.tipo, sol: q.sol, resto: q.resto, ok: q.ok, nums: q.nums, asc: q.asc, pasos: q.tipo === "pasos" ? LYAMatesBanco.resolver(q.arbol).pasos.map(x => x.v) : null}; });
      if (Q.tipo === "num" || Q.tipo === "recta") await teclear(p, Q.sol);
      else if (Q.tipo === "resto") { await teclear(p, Q.sol); await teclear(p, Q.resto); }
      else if (Q.tipo === "opc") await p.click(`[data-mt="opc"][data-i="${Q.ok}"]`);
      else if (Q.tipo === "pasos") for (const v of Q.pasos) await teclear(p, v);
      else if (Q.tipo === "orden") { const s = [...Q.nums].sort((a, b) => Q.asc ? a - b : b - a); for (const v of s) await p.click(`[data-mt="poner"][data-i="${Q.nums.indexOf(v)}"]`); await p.click('[data-mt="comprobar"]'); }
      await espera(150);
      if (DIR && ap === 8 && d === 3 && i === 0) await p.screenshot({path: `${DIR}/pasos-bien.png`, fullPage: true});
      await p.click('[data-mt="sig"]');
    }
    const t = await p.textContent(".mt-fin h2");
    ok(t.includes("10 de 10"), `apartado ${ap} (${d === 1 ? "fácil" : "difícil"}): ${t}`);
  }
  /* un fallo en un paso */
  await p.goto(`${URL}/#mates-t2-8`); await p.click('[data-mt="tab"][data-t="aprende"]'); await p.click('[data-mt="tab"][data-t="practica"]'); await p.click('[data-mt="empezar"][data-d="2"]'); await espera(200);
  const q0 = await p.evaluate(() => { const P = LYAMates._P(); return P.serie[P.i].tipo; });
  if (q0 === "pasos") { await teclear(p, 999); ok((await p.textContent(".mt-q")).includes("Seguimos con el bueno"), "un paso mal: dice cuál era"); if (DIR) await p.screenshot({path: `${DIR}/pasos-mal.png`, fullPage: true}); }
  const xp = await p.evaluate(() => LYA.get().S.g.mt);
  ok(xp && xp["t2-8"] && xp["t2-8"].e[2] === 3, "se guardan las estrellas del apartado");
  ok(!errs.length, "sin errores en la práctica " + errs.join(" | "));
  await p.close();
}
/* pistas: en una combinada difícil, pistas del paso que toca (cambian al pasar de paso) y quitan XP; y en una suma */
async function pistas(b) {
  const p = await b.newPage({viewport: {width: 420, height: 900}}); const errs = []; p.on("pageerror", e => errs.push(e.message));
  let paso = false;
  for (let k = 0; k < 6 && !paso; k++) {
    await p.goto(`${URL}/#mates-t2-8-d3`); await espera(300);
    paso = await p.evaluate(() => { const P = LYAMates._P(); return P.serie[P.i].tipo === "pasos"; });
    if (!paso) await p.evaluate(() => { location.hash = "mates-t2-8"; });
  }
  ok(paso, "una combinada difícil para probar las pistas");
  const n0 = await p.locator(".mt-pista").count();
  await p.click('[data-mt="pista"]'); await espera(100);
  const t1 = await p.textContent(".mt-pista");
  ok(n0 === 0 && /Ahora toca/.test(t1), "la primera pista dice qué toca ahora: " + t1);
  await p.click('[data-mt="pista"]'); await espera(100);
  ok(await p.locator(".mt-pista").count() === 2, "la segunda pista dice cómo hacerlo: " + (await p.locator(".mt-pista").nth(1).textContent()));
  if (DIR) await p.screenshot({path: `${DIR}/pistas.png`, fullPage: true});
  const pasos = await p.evaluate(() => { const P = LYAMates._P(), q = P.serie[P.i]; return LYAMatesBanco.resolver(q.arbol).pasos.map(x => x.v); });
  await teclear(p, pasos[0]);
  if (pasos.length > 1) ok(await p.locator(".mt-pista").count() === 0, "al pasar de paso, las pistas empiezan de nuevo");
  for (const v of pasos.slice(1)) await teclear(p, v);
  const xp = await p.evaluate(() => LYAMates._P().ganado);
  ok(xp === 2 && /con 2 pistas/.test(await p.textContent(".mt-fb")), "con 2 pistas gana 2 XP en vez de 4: " + xp);
  ok(!errs.length, "pistas sin errores " + errs.join(" | "));
  await p.close();
}
async function sala(b, juego, cfg, jugadores) {
  const host = await b.newPage({viewport: {width: 1200, height: 900}}); const errs = []; host.on("pageerror", e => errs.push(juego + ": " + e.message));
  await host.goto(`${URL}/#mates-grupo`); await espera(300);
  const c = await host.evaluate(async ([juego, cfg]) => {
    const r = await (await fetch("api/propuestas?retos=1", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({accion: "crear", juego: "m-" + juego, lectura: cfg.lectura, file: "mates/t2", lang: "es", equipos: cfg.equipos, dur: cfg.dur, rd: cfg.rd})})).json();
    const m = JSON.parse(localStorage.getItem("lyaMatesSala") || "{}"); m.host = m.host || {}; m.host[r.sala] = {clave: r.clave, t: Date.now()}; localStorage.setItem("lyaMatesSala", JSON.stringify(m));
    return r.sala;
  }, [juego, cfg]);
  await host.goto(`${URL}/#mates-pizarra-${c}`); await espera(800);
  const ps = [];
  for (const [n, e] of jugadores) {
    const ctx = await b.newContext({viewport: {width: 420, height: 900}}); const p = await ctx.newPage(); p.on("pageerror", er => errs.push(juego + " " + n + ": " + er.message));
    await p.goto(`${URL}/#mates-sala-${c}`); await espera(700);
    await p.fill("#mg-nom", n); if (e) await p.click(`[data-mg="equipo"][data-e="${e}"]`);
    await p.click('[data-mg-form="unirme"] button.main'); await espera(400);
    ps.push(p);
  }
  await espera(1700);
  await host.click('[data-mg="empezar"]'); await espera(2000);
  return {host, ps, c, errs};
}
const T = p => p.evaluate(() => LYAMatesGrupo._t);
async function juegos(b) {
  let s;
  if (quiere("recta")) {
  /* 🧍 recta humana: 2 en el mismo equipo */
  s = await sala(b, "recta", {lectura: "mates-t2-1236-2", equipos: 2, dur: 3, rd: 120}, [["Ana", 1], ["Bea", 1]]);
  for (const p of s.ps) {
    const mias = await p.evaluate(() => { const t = LYAMatesGrupo._t, r = t.E.st.sala.r; const R = t.rondaRecta(r); return t.misCartasRecta(r).map(c => ({i: c.i, k: R.orden.indexOf(c.v)})); });
    for (const x of mias) { await p.click(`[data-mg="carta"][data-i="${x.i}"]`); await espera(150); await p.click(`[data-mg="slot"][data-k="${x.k}"]`); await espera(500); }
  }
  await espera(1800);
  if (DIR) await s.ps[0].screenshot({path: `${DIR}/g-recta.png`, fullPage: true});
  await s.ps[1].click('[data-mg="listo"]'); await espera(2500);
  ok((await s.ps[0].textContent("main")).includes("Recta ordenada") || (await s.ps[0].textContent("main")).includes("solución"), "recta: equipo ordena bien");
  if (DIR) await s.host.screenshot({path: `${DIR}/g-recta-pizarra.png`, fullPage: true});
  await finJuego(s, "recta");
  }
  if (quiere("cadena")) {
  /* 🔗 cadena */
  s = await sala(b, "cadena", {lectura: "mates-t2-58-2", equipos: 1, dur: 3, rd: 180}, [["Ana", 1], ["Bea", 1]]);
  for (let k = 0; k < 20; k++) {
    let hecho = false;
    for (const p of s.ps) {
      const v = await p.evaluate(() => { const t = LYAMatesGrupo._t, r = t.E.st.sala.r, C = t.rondaCadena(r), u = t.miU(), h = t.pasosHechos(u, r); if (h >= C.R.pasos.length) return "fin"; return document.querySelector('.mt-tec') ? C.R.pasos[h].v : null; });
      if (v === "fin") { hecho = true; break; }
      if (v !== null) { if (k === 1) await teclear(p, 777); else await teclear(p, v); await espera(1700); break; }
    }
    if (hecho) break;
    await espera(600);
  }
  if (DIR) await s.ps[0].screenshot({path: `${DIR}/g-cadena.png`, fullPage: true});
  ok(/Cadena completa|solución/.test(await s.ps[0].textContent("main")), "cadena: completa por turnos (con un fallo)");
  await finJuego(s, "cadena");
  }
  if (quiere("objetivo")) {
  /* 🎯 objetivo: individual */
  s = await sala(b, "objetivo", {lectura: "mates-t2-345-2", equipos: 0, dur: 3, rd: 120}, [["Ana", 0], ["Bea", 0]]);
  const sol = await s.ps[0].evaluate(() => { const t = LYAMatesGrupo._t; return t.rondaObjetivo(t.E.st.sala.r).sol; });
  for (const m of sol.match(/n\d|[pmxdlr]/g)) await s.ps[0].click(`[data-mg="tk"][data-t="${m}"]`);
  await s.ps[0].click('[data-mg="enviarobj"]'); await espera(1200);
  if (DIR) await s.ps[0].screenshot({path: `${DIR}/g-objetivo.png`, fullPage: true});
  ok((await s.ps[0].textContent("main")).includes("Exacto"), "objetivo: llega al número");
  await finJuego(s, "objetivo");
  }
  if (quiere("ascensor")) {
  /* 🌡️ ascensor */
  s = await sala(b, "ascensor", {lectura: "mates-t2-34-2", equipos: 0, dur: 3, rd: 60}, [["Ana", 0]]);
  const v = await s.ps[0].evaluate(() => { const t = LYAMatesGrupo._t; return t.historia().pasos[t.E.st.sala.r].despues; });
  if (DIR) await s.host.screenshot({path: `${DIR}/g-ascensor-pizarra.png`, fullPage: true});
  await teclear(s.ps[0], v); await espera(2500);
  ok(/\+\d+ puntos/.test(await s.ps[0].textContent("main")), "ascensor: acierta y suma puntos");
  await finJuego(s, "ascensor");
  }
  if (quiere("apuesta")) {
  /* 🎲 apuesta */
  s = await sala(b, "apuesta", {lectura: "mates-t2-12345678-1", equipos: 0, dur: 3, rd: 60}, [["Ana", 0]]);
  const A = await s.ps[0].evaluate(() => { const t = LYAMatesGrupo._t, R = t.rondaApuesta(t.E.st.sala.r); return {verdad: R.verdad, sol: R.sol}; });
  await s.ps[0].click(`[data-mg="vf"][data-v="${A.verdad ? "v" : "f"}"]`); await s.ps[0].click('[data-mg="ap"][data-v="250"]'); await s.ps[0].click('[data-mg="apostar"]'); await espera(800);
  await teclear(s.ps[0], A.sol); await espera(2500);
  if (DIR) await s.ps[0].screenshot({path: `${DIR}/g-apuesta.png`, fullPage: true});
  ok((await s.ps[0].textContent("main")).includes("+500 puntos"), "apuesta: acierta y demuestra (doble)");
  await finJuego(s, "apuesta");
  }
  if (quiere("cartas")) {
  /* 🃏 cartas */
  s = await sala(b, "cartas", {lectura: "mates-t2-3567-1", equipos: 1, dur: 5, rd: 60}, [["Ana", 1], ["Bea", 1]]);
  for (const p of s.ps) {
    const mias = await p.evaluate(() => LYAMatesGrupo._t.misCartas().filter(c => c.h >= 0).map(c => ({gi: c.gi, h: c.h})));
    for (const x of mias) { await p.click(`[data-mg="carta"][data-i="${x.gi}"]`); await p.click(`[data-mg="hueco"][data-i="${x.h}"]`); await espera(500); }
  }
  await espera(2500);
  if (DIR) await s.ps[0].screenshot({path: `${DIR}/g-cartas.png`, fullPage: true});
  ok((await s.host.textContent("main")).includes("Resultados"), "cartas: el equipo llena los 8 huecos y se acaba");
  await finJuego(s, "cartas");
  }
  if (quiere("escape")) {
  /* 🔐 escape */
  s = await sala(b, "escape", {lectura: "mates-t2-3568-2", equipos: 1, dur: 10, rd: 60}, [["Ana", 1], ["Bea", 1]]);
  if (DIR) await s.ps[0].screenshot({path: `${DIR}/g-escape.png`, fullPage: true});
  const X = await s.ps[0].evaluate(() => { const x = LYAMatesGrupo._t.juegoEscape(); return {v: x.cands.map(c => c.v), f: x.final}; });
  await s.ps[0].fill("#mg-c0", String(X.v[0] + 1)); await s.ps[0].press("#mg-c0", "Enter"); await espera(1500);
  ok((await s.ps[1].textContent("main")).includes("🔒"), "escape: un fallo congela");
  for (let k = 1; k < 4; k++) { await s.ps[k % 2].fill(`#mg-c${k}`, String(X.v[k])); await s.ps[k % 2].press(`#mg-c${k}`, "Enter"); await espera(700); }
  await espera(16000);
  await s.ps[0].fill("#mg-c0", String(X.v[0])); await s.ps[0].press("#mg-c0", "Enter"); await espera(1500);
  await s.ps[1].fill("#mg-c4", String(X.f)); await s.ps[1].press("#mg-c4", "Enter"); await espera(2500);
  ok((await s.host.textContent("main")).includes("Resultados"), "escape: abren el final y se acaba");
  if (DIR) await s.host.screenshot({path: `${DIR}/g-escape-fin.png`, fullPage: true});
  await finJuego(s, "escape");
  }
}
async function finJuego(s, j) {
  if (!(await s.host.textContent("main")).includes("Resultados")) { await s.host.click('[data-mg="terminar"]').catch(() => {}); await espera(1500); }
  const t = await s.host.textContent("main");
  ok(t.includes("Resultados") && /\b[1-9]\d*\b/.test(t), `${j}: resultados en la pizarra`);
  ok(!s.errs.length, `${j}: sin errores ${s.errs.join(" | ")}`);
  for (const p of s.ps) await p.context().close();
  await s.host.close();
}
async function dueloConcurso(b) {
  const p = await b.newPage({viewport: {width: 420, height: 900}}); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(`${URL}/#mates-concurso`); await espera(400); await p.click('[data-mg-form="concurso"] button.main'); await espera(800);
  ok((await p.evaluate(() => location.hash)) === "#concursos-editar" && (await p.$$(".cc-q")).length === 10, "concurso de mates: 10 preguntas en el editor");
  if (DIR) await p.screenshot({path: `${DIR}/concurso.png`, fullPage: true});
  ok(!errs.length, "concurso sin errores " + errs.join(" | "));
  await p.close();
}
(async () => {
  const b = await chromium.launch();
  if (quiere("practica")) await practica(b);
  if (quiere("pistas")) await pistas(b);
  await juegos(b);
  if (quiere("concurso")) await dueloConcurso(b);
  await b.close();
})();
