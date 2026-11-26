// Deberes de mates: el profe manda un apartado con una dificultad desde su panel, el alumno lo ve en «Deberes», lo hace
// (mirando la explicación sin perder la práctica) y el profe ve sus estrellas, aciertos y lo que falló.
// Uso: node qa/prueba-deberes-mates.mjs http://localhost:8790   (con qa/servidor-prueba.mjs)
import { createRequire } from "module"; const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const B = (process.argv[2] || "http://localhost:8790").replace(/\/index\.html$/, ""), id = Date.now().toString(36).slice(-5);
const api = async (p, tok, m = "GET", body) => { const r = await fetch(`${B}/api/${p}`, { method: m, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}) }, body: body && JSON.stringify(body) }); return { ok: r.ok, j: await r.json().catch(() => ({})) }; };
const fallos = [], ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) fallos.push(m); };
const espera = ms => new Promise(r => setTimeout(r, ms));
const prof = await api("registro", null, "POST", { usuario: "profe" + id, clave: "clave1234", rol: "profe" });
const g = await api("admin", prof.j.token, "POST", { accion: "grupo_crear", nombre: "Mates " + id, codigo: "mt" + id });
const al = await api("registro", null, "POST", { usuario: "alu" + id, clave: "clave1234", codigo: g.j.codigo, progreso: { learn: "es", know: "en" } });
ok(prof.ok && g.ok && al.ok, "crear profe, clase y alumno");
ok(!(await api("admin", prof.j.token, "POST", { accion: "deber_crear", lectura: "mates-t2-9-1", grupo: g.j.id, limite: "2030-01-01" })).ok, "un apartado de mates que no existe se rechaza");

const b = await chromium.launch(), errs = [];
const pagina = async (tok, u, w) => {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(([tok, u]) => { if (!sessionStorage.getItem("hecho")) { sessionStorage.setItem("hecho", 1); localStorage.setItem("lyaCuenta", JSON.stringify({ token: tok, usuario: u })); } }, [tok, u]);
  const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); return p;
};

/* 1. el profe lo manda desde el panel: apartado 3, dificultad Medio */
const P = await pagina(prof.j.token, "profe" + id, 1280);
await P.goto(B + "/index.html#inicio", { waitUntil: "networkidle" }); await P.waitForFunction(() => window.LYA && document.getElementById("cta"));
await P.click("#cta"); await P.click("#ctaadm"); await P.waitForSelector("#admc");
await P.click(".ctatabs [data-tab=deberes]"); await P.waitForSelector("#admdc");
ok(await P.isHidden("#admdif"), "la dificultad no sale para una lectura");
await P.selectOption("#admdc [name=lectura]", "mates-t2-3");
ok(await P.isVisible("#admdif"), "al elegir mates sale la dificultad");
await P.selectOption("#admdc [name=dif]", "2"); await P.selectOption("#admdc [name=grupo]", g.j.id);
await P.click("#admdc [type=submit]"); await P.waitForSelector("[data-borrad]");
const lista = await P.textContent("#admc .ctali");
ok(/Mates · Tema 2 · 3\. Suma y resta de dos enteros · Medio/.test(lista), "el deber sale con su nombre en el panel: " + lista.slice(0, 120));

/* 2. el alumno lo ve en Deberes y entra: empieza la práctica en Medio */
const A = await pagina(al.j.token, "alu" + id, 420);
await A.goto(B + "/index.html#deberes", { waitUntil: "networkidle" }); await espera(800);
const enlace = A.locator('a[href="#mates-t2-3-d2"]');
ok(await enlace.count() === 1 && /Mates · 3\. Suma y resta de dos enteros · Medio/.test(await A.textContent("main, #app")), "el alumno ve el deber de mates");
await enlace.first().click(); await espera(500);
const P0 = await A.evaluate(() => { const P = LYAMates._P(); return P && { k: P.k, d: P.d, i: P.i }; });
ok(P0 && P0.k === "t2-3" && P0.d === 2 && P0.i === 0, "abre la práctica ya en Medio: " + JSON.stringify(P0));
ok(await A.evaluate(() => location.hash) === "#mates-t2-3", "y deja la dirección normal del apartado");

/* contesta: las 2 primeras mal, el resto bien */
const contestar = async (bien) => {
  const Q = await A.evaluate(() => { const P = LYAMates._P(), q = P.serie[P.i]; return { tipo: q.tipo, sol: q.sol, resto: q.resto, ok: q.ok, n: (q.opciones || []).length, nums: q.nums, asc: q.asc, pasos: q.tipo === "pasos" ? LYAMatesBanco.resolver(q.arbol).pasos.map(x => x.v) : null }; });
  const teclear = async v => { for (const ch of String(Math.abs(v))) await A.click(`.mt-tec [data-v="${ch}"]`); if (v < 0) await A.click('.mt-tec [data-v="pm"]'); await A.click('.mt-tec [data-v="ok"]'); };
  const mal = v => v + 1;
  if (Q.tipo === "num" || Q.tipo === "recta") await teclear(bien ? Q.sol : mal(Q.sol));
  else if (Q.tipo === "resto") { await teclear(Q.sol); await teclear(bien ? Q.resto : mal(Q.resto)); }
  else if (Q.tipo === "opc") await A.click(`[data-mt="opc"][data-i="${bien ? Q.ok : (Q.ok + 1) % Q.n}"]`);
  else if (Q.tipo === "pasos") for (const [i, v] of Q.pasos.entries()) await teclear(bien || i ? v : mal(v));
  else if (Q.tipo === "orden") { const s = [...Q.nums].sort((a, b) => Q.asc ? a - b : b - a); if (!bien) s.reverse(); for (const v of s) await A.click(`[data-mt="poner"][data-i="${Q.nums.indexOf(v)}"]`); await A.click('[data-mt="comprobar"]'); }
  await espera(120); await A.click('[data-mt="sig"]'); await espera(120);
};
await contestar(false); await contestar(false);

/* 3. «Aprende» a mitad: no se pierde nada */
await A.click('[data-mt="tab"][data-t="aprende"]'); await espera(200);
ok(await A.locator(".mt-seguir").count() === 1 && /3 de 10/.test(await A.textContent(".mt-seguir")), "en «Aprende» avisa de la práctica a medias");
ok(await A.locator(".mt-teo .mt-fig svg").count() >= 2, "la explicación tiene dibujos");
await A.click('.mt-seguir [data-mt="tab"][data-t="practica"]'); await espera(200);
const P1 = await A.evaluate(() => { const P = LYAMates._P(); return { i: P.i, ok: P.ok, d: P.d }; });
ok(P1.i === 2 && P1.ok === 0 && P1.d === 2, "vuelve a la misma pregunta: " + JSON.stringify(P1));
/* la ayuda dentro de la práctica */
await A.click(".mt-ayu > summary"); await espera(100);
ok(await A.isVisible(".mt-ayu .mt-fig svg"), "la explicación se abre dentro de la práctica, con dibujos");
for (let i = 2; i < 10; i++) await contestar(true);
ok(/8 de 10/.test(await A.textContent(".mt-fin h2")), "termina con 8 de 10");
await espera(2600); /* se guarda en la nube */

/* 4. el profe ve quién lo ha hecho, con aciertos y fallos */
const R = await api("admin", prof.j.token);
const x = (R.j.deberes || []).find(z => z.lectura === "mates-t2-3-2"), a = x && x.alumnos[0];
ok(a && a.hecho && a.estrellas === 2 && a.ok === 8 && a.tot === 10 && a.mal.length === 2, "el profe lo ve hecho: 2 estrellas, 8/10 y 2 fallos: " + JSON.stringify(a));
await P.click(".ctatabs [data-tab=usuarios]"); await P.click(".ctatabs [data-tab=deberes]"); await P.waitForSelector("#admc .ctali");
await P.click("#admc .ctapal summary");
const det = await P.textContent("#admc .ctapal");
ok(det.includes("(8/10)") && det.includes("Lo que fallaron") && det.includes("→"), "en el panel salen los aciertos y lo que falló");
await A.goto(B + "/index.html#deberes"); await espera(900);
ok(/✅/.test(await A.textContent("#app")), "en «Deberes» sale como hecho");
await P.screenshot({ path: process.argv[3] ? process.argv[3] + "/panel-deber-mates.png" : "/dev/null", fullPage: false }).catch(() => {});
await b.close();
console.log("FALLOS:", fallos.length ? "\n - " + fallos.join("\n - ") : "ninguno"); console.log("ERRORES:", errs.length ? errs.join("\n") : "ninguno");
process.exit(fallos.length || errs.length ? 1 : 0);
