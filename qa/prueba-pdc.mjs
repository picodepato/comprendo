// Mates 4.º ESO PDC, tema 2 «Proporcionalidad y porcentajes»: portada, teoría con dibujos, práctica con decimales,
// «No lo entiendo», «Paso a paso», fallos explicados, 🧩 Monta el problema (a solas y en clase), 🏷️ ¿Cuál es la mejor oferta?,
// parejas y escape room del tema, concurso, y deberes del profe.
// Uso: node qa/prueba-pdc.mjs http://localhost:8790 [carpeta-capturas]   (con qa/servidor-prueba.mjs)
import { createRequire } from "module"; const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const B = (process.argv[2] || "http://localhost:8790").replace(/\/index\.html$/, ""), DIR = process.argv[3], id = Date.now().toString(36).slice(-5);
const api = async (p, tok, m = "GET", body) => { const r = await fetch(`${B}/api/${p}`, { method: m, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}) }, body: body && JSON.stringify(body) }); return { ok: r.ok, j: await r.json().catch(() => ({})) }; };
const fallos = [], ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) fallos.push(m); };
const espera = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(), errs = [];
const nueva = async (w, tok, u) => { const ctx = await b.newContext({ viewport: { width: w, height: 900 } }); if (tok) await ctx.addInitScript(([tok, u]) => { if (!sessionStorage.getItem("hecho")) { sessionStorage.setItem("hecho", 1); localStorage.setItem("lyaCuenta", JSON.stringify({ token: tok, usuario: u })); } }, [tok, u]); const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); return p; };
const p = await nueva(420);
const ir = async h => { await p.goto(B + "/index.html#" + h, { waitUntil: "networkidle" }); await espera(500); };

/* portada y tema */
await ir("mates");
const port = await p.textContent("#app");
ok(await p.locator(".mt-curso").count() === 2 && /1\.º ESO/.test(port) && /4\.º ESO PDC/.test(port) && !(await p.locator(".mt-tema").count()), "la portada tiene un apartado por curso, sin los temas mezclados");
await ir("mates-4pdc");
const c4 = await p.textContent("#app");
ok(/Proporcionalidad y porcentajes/.test(c4) && !/Números enteros/.test(c4) && !/La recta humana/.test(c4) && /Monta el problema/.test(c4), "4.º ESO PDC: solo sus temas y sus juegos");
await ir("mates-1eso");
const c1 = await p.textContent("#app");
ok(/Números enteros/.test(c1) && !/Proporcionalidad y porcentajes/.test(c1) && !/Monta el problema/.test(c1) && /La recta humana/.test(c1), "1.º ESO: solo sus temas y sus juegos");
await ir("mates-p2");
ok((await p.getAttribute(".mt-migas a", "href")) === "#mates-4pdc", "el tema vuelve a su curso");
await ir("mates-p2");
ok(await p.locator(".mt-ap").count() === 10, "el tema tiene 8 apartados, el repaso y «Monta el problema»");
const tiles = await p.locator(".mg-tile").allTextContents();
ok(tiles.some(t => /mejor oferta/.test(t)) && tiles.some(t => /Monta el problema/.test(t)) && tiles.some(t => /Parejas/.test(t)) && tiles.some(t => /La tienda/.test(t)) && !tiles.some(t => /recta humana/i.test(t)), "los juegos en grupo del tema: oferta, monta, parejas y escape (sin los de enteros)");
if (DIR) await p.screenshot({ path: DIR + "/pdc-tema.png", fullPage: true });
/* teoría con dibujos */
let figs = 0;
for (let n = 1; n <= 8; n++) { await ir(`mates-p2-${n}`); figs += (await p.locator(".mt-teo .mt-fig svg").count()) ? 1 : 0; if (DIR && n === 6) await p.screenshot({ path: DIR + "/pdc-teoria-6.png", fullPage: true }); }
ok(figs === 8, "los 8 apartados tienen dibujos en la explicación: " + figs);

/* práctica: decimales con coma, fallo explicado, «No lo entiendo» y «Paso a paso» */
const teclear = async v => { const t = String(Math.round(v * 100) / 100).replace(".", ","); for (const ch of t) await p.click(`.mt-tec [data-v="${ch === "," ? "dec" : ch}"]`); await p.click('.mt-tec [data-v="ok"]'); };
const Qde = () => p.evaluate(() => { const P = LYAMates._P(), q = P && P.serie[P.i]; return q && { tipo: q.tipo, sol: q.sol, ok: q.ok, guia: !!q.guia, trampas: (q.trampas || []).map(t => t.v), g: q.g, ap: q.ap, fase: P.fase, i: P.i }; });
let vistoTrampa = false, vistoGem = false, vistoGuia = false, vistoDec = false; const malAcierto = [];
for (let intento = 0; intento < 6 && !(vistoTrampa && vistoGem && vistoGuia); intento++) {
  await ir(`mates-p2-${[1, 6, 2, 5, 8, 7][intento]}-d2`);
  for (let k = 0; k < 10; k++) {
    const Q = await Qde(); if (!Q || Q.fase === "fin") break;
    if (Q.tipo === "num" && !vistoGem && await p.locator('[data-mt="nolo"]').count()) {
      await p.click('[data-mt="nolo"]'); await espera(150);
      vistoGem = await p.locator(".mt-gem .mt-gemp li").count() >= 2 && /Solución/.test(await p.textContent(".mt-gem"));
      if (DIR) await p.screenshot({ path: DIR + "/pdc-nolo.png", fullPage: true });
      await p.click('[data-mt="gemcerrar"]'); await espera(100);
    }
    if (Q.tipo === "num" && Q.guia && !vistoGuia) {
      await p.click('[data-mt="guia"]'); await espera(100);
      const pasos = await p.evaluate(() => LYAMates._P().serie[LYAMates._P().i].guia.map(g => ({ tipo: g.tipo, ok: g.ok, sol: g.sol })));
      for (const [i, g] of pasos.entries()) {
        if (g.tipo === "opc") await p.click(`[data-mt="gopc"][data-i="${i === 0 ? (g.ok + 1) % 2 : g.ok}"]`);  /* el primer paso, mal: tiene que explicarlo */
        else await teclear(g.sol);
        await espera(80);
        if (i === 0 && pasos.length > 1) vistoGuia = g.tipo === "opc" ? (await p.locator(".mt-guia li.mal small").count()) === 1 : true;
      }
      if (DIR) await p.screenshot({ path: DIR + "/pdc-guia.png", fullPage: true });
      await p.click('[data-mt="sig"]'); continue;
    }
    if (Q.tipo === "num" && Q.trampas.length && !vistoTrampa) {
      await teclear(Q.trampas[0]); await espera(100);
      vistoTrampa = await p.locator(".mt-porque").count() === 1 && await p.locator(".mt-asi li").count() >= 1;
      if (DIR) await p.screenshot({ path: DIR + "/pdc-fallo.png", fullPage: true });
      await p.click('[data-mt="sig"]'); continue;
    }
    if (Q.tipo === "num") { await teclear(Q.sol); await espera(80); const bien = /¡Bien!/.test(await p.textContent(".mt-fb")); if (!bien) malAcierto.push(JSON.stringify(Q)); else if (!Number.isInteger(Q.sol)) vistoDec = true; }
    else if (Q.tipo === "opc") await p.click(`[data-mt="opc"][data-i="${Q.ok}"]`);
    await p.click('[data-mt="sig"]'); await espera(60);
  }
}
ok(vistoGem, "«No lo entiendo» enseña uno igual, resuelto paso a paso");
ok(vistoGuia, "«Paso a paso»: si fallas un paso, dice por qué y sigue");
ok(vistoTrampa, "al fallar con un error típico explica por qué y cómo se hace");
fallos.splice(0, fallos.length, ...fallos.filter(f => f !== ""));
const sinAcierto = fallos.filter(f => /^no acierta/.test(f)); ok(!sinAcierto.length, "las respuestas buenas (también con coma) se dan por buenas " + sinAcierto.join(" "));
const P2 = await p.evaluate(() => JSON.parse(localStorage.getItem("lyaState") || localStorage.getItem("lya") || "{}"));

/* 🧩 Monta el problema, a solas */
await ir("mates-p2-monta");
await p.click('[data-mt="monta-ir"][data-d="2"]'); await espera(200);
const montar = async (pg, conFallo, arrastrar) => {
  const X = await pg.evaluate(() => { const el = document.querySelector("[data-monta]"), e = LYAMonta.estado(el.dataset.monta); return { k: el.dataset.monta, datos: e.X.datos.map(d => d.id), tipo: e.X.tipo, ops: e.X.ops.map(o => !!o.ok), sol: e.X.sol }; });
  if (conFallo) { await pg.click(`[data-mo-chip="d:${X.datos[0]}"]`); await pg.click(`[data-mo-slot="d:${X.datos[1]}"]`); }
  for (const [i, d] of X.datos.entries()) {
    if (arrastrar && i === 0) { const a = await pg.locator(`[data-mo-chip="d:${d}"]`).boundingBox(), z = await pg.locator(`[data-mo-slot="d:${d}"]`).boundingBox(); await pg.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await pg.mouse.down(); await pg.mouse.move(a.x + 30, a.y + 30, { steps: 4 }); await pg.mouse.move(z.x + z.width / 2, z.y + z.height / 2, { steps: 8 }); await pg.mouse.up(); await espera(150); continue; }
    await pg.click(`[data-mo-chip="d:${d}"]`); await pg.click(`[data-mo-slot="d:${d}"]`);
  }
  if (conFallo) await pg.click(`[data-mo-chip="t:${X.tipo === "Directa" ? "Inversa" : "Directa"}"]`);
  await pg.click(`[data-mo-chip="t:${X.tipo}"]`);
  await pg.click(`[data-mo-chip="o:${X.ops.indexOf(true)}"]`);
  const t = String(X.sol).replace(".", ","); for (const ch of t) await pg.click(`[data-mo-k="${ch === "," ? "dec" : ch}"]`); await pg.click('[data-mo-k="ok"]'); await espera(150);
  return X;
};
await montar(p, true, true);
ok(await p.locator(".mo-fin").count() === 1 && /2 fallos/.test(await p.textContent(".mo-fin")), "Monta el problema: arrastrando y tocando, con 2 fallos explicados");
if (DIR) await p.screenshot({ path: DIR + "/pdc-monta.png", fullPage: true });
await p.click('[data-mt="monta-otro"]'); await espera(150);
await montar(p, false, false);
ok(/Sin fallos|sin fallos/.test(await p.textContent(".mo-fin")) && (await p.evaluate(() => LYAMates._M().sin)) === 1, "el segundo, sin fallos, suma uno «sin fallos»");
const pd = await nueva(1280); pd.on("pageerror", e => errs.push(e.message));
await pd.goto(B + "/index.html#mates-p2-monta", { waitUntil: "networkidle" }); await espera(300); await pd.click('[data-mt="monta-ir"][data-d="1"]'); await espera(200);
if (DIR) await pd.screenshot({ path: DIR + "/pdc-monta-pc.png", fullPage: false });
await montar(pd, false, true);
ok(await pd.locator(".mo-fin").count() === 1, "en el ordenador también se monta arrastrando con el ratón");

/* concurso del tema */
await ir("concursos-mates-p2-12345678-1-8-4242"); await espera(500);
ok(await p.evaluate(() => location.hash) === "#concursos-editar" && (await p.locator(".cc-q, [data-q], .ccq").count() > 0 || /Proporcionalidad/.test(await p.textContent("#app"))), "el concurso de mates de 4.º PDC se prepara en el editor");

/* juegos en grupo: oferta y monta (en el móvil, crea la sala y juega) */
for (const juego of ["oferta", "monta"]) {
  await ir("mates-p2"); await p.click(`.mg-tile[href="#mates-juego-${juego}"]`); await espera(400);
  await p.click('[data-mg-form="crear"] button.main'); await espera(1200);
  ok(/^#mates-sala-\d{6}$/.test(await p.evaluate(() => location.hash)), `${juego}: se crea la sala (tema p2)`);
  await p.fill("#mg-nom", "Ana"); await p.click('[data-mg-form="unirme"] button.main'); await espera(800);
  await p.click('[data-mg="empezar"]'); await espera(1500);
  if (juego === "oferta") {
    const O = await p.evaluate(() => LYAMatesGrupo._t.rondaOferta(0));
    await p.click(`[data-mg="of"][data-i="${O.mejor}"]`); await espera(900);
    const t = String(O.ofertas[O.mejor].final).replace(".", ","); for (const ch of t) await p.click(`.mt-tec [data-v="${ch === "," ? "dec" : ch}"]`); await p.click('.mt-tec [data-v="ok"]'); await espera(1800);
    if (DIR) await p.screenshot({ path: DIR + "/pdc-oferta.png", fullPage: true });
    const txt = await p.textContent("#app");
    ok(/La más barata/.test(txt) && /\+\d{3,4} puntos/.test(txt), "oferta: al acertar la más barata y su precio se cierra la ronda con los puntos: " + (txt.match(/\+\d+ puntos/) || [""])[0]);
  } else {
    await espera(300); await montar(p, true, false); await espera(1800);
    const txt = await p.textContent("#app");
    if (DIR) await p.screenshot({ path: DIR + "/pdc-monta-grupo.png", fullPage: true });
    ok(/Ronda 1: solución/.test(txt) && /puntos/.test(txt), "monta en clase: al montarlo se acaba la ronda y da puntos");
  }
  await p.click('[data-mg="terminar"]').catch(() => {}); await espera(500);
}
/* parejas y escape del tema: contenido */
const cont = await p.evaluate(() => { const X = LYAMatesPDC.cartas(LYAMatesPDC.Rn(7), 2), E = LYAMatesPDC.escape(LYAMatesPDC.Rn(7), 2); return { h: X.huecos.length, t: X.trampas.length, e: E.cands.length, fin: E.final }; });
ok(cont.h === 8 && cont.t === 2 && cont.e === 4, "parejas (8 huecos y 2 trampas) y escape «La tienda» (4 candados)");

/* deberes: el profe manda «Disminuciones porcentuales», Medio */
const prof = await api("registro", null, "POST", { usuario: "profe" + id, clave: "clave1234", rol: "profe" });
const g = await api("admin", prof.j.token, "POST", { accion: "grupo_crear", nombre: "4.º PDC " + id, codigo: "pd" + id });
const al = await api("registro", null, "POST", { usuario: "alu" + id, clave: "clave1234", codigo: g.j.codigo, progreso: { learn: "es", know: "en" } });
const dc = await api("admin", prof.j.token, "POST", { accion: "deber_crear", lectura: "mates-p2-6-2", grupo: g.j.id, limite: "2030-01-01" });
ok(prof.ok && g.ok && al.ok && dc.ok, "el profe manda un apartado de 4.º PDC como deberes");
const A = await nueva(420, al.j.token, "alu" + id);
await A.goto(B + "/index.html#deberes", { waitUntil: "networkidle" }); await espera(900);
ok(await A.locator('a[href="#mates-p2-6-d2"]').count() === 1 && /Disminuciones porcentuales/.test(await A.textContent("#app")), "el alumno lo ve en Deberes");
await A.click('a[href="#mates-p2-6-d2"]'); await espera(500);
const PA = await A.evaluate(() => { const P = LYAMates._P(); return P && { k: P.k, d: P.d }; });
ok(PA && PA.k === "p2-6" && PA.d === 2, "y abre la práctica en Medio: " + JSON.stringify(PA));

await b.close();
console.log("FALLOS:", fallos.length ? "\n - " + fallos.join("\n - ") : "ninguno"); console.log("ERRORES:", errs.length ? errs.join("\n") : "ninguno");
process.exit(fallos.length || errs.length ? 1 : 0);
