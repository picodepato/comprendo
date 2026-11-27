// Cuaderno de clase del profe (#profe-cuaderno): API (permisos, versión), notas con medias ponderadas, deberes automáticos,
// pasar lista, puntos, plano de clase, herramientas e informe imprimible.
// Uso: node qa/prueba-cuaderno.mjs http://localhost:8790 [carpeta-capturas]   (con qa/servidor-prueba.mjs)
import { createRequire } from "module"; const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const B = (process.argv[2] || "http://localhost:8790").replace(/\/index\.html$/, ""), DIR = process.argv[3], id = Date.now().toString(36).slice(-5);
const api = async (p, tok, m = "GET", body) => { const r = await fetch(`${B}/api/${p}`, { method: m, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}) }, body: body && JSON.stringify(body) }); return { ok: r.ok, code: r.status, j: await r.json().catch(() => ({})) }; };
const fallos = [], ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) fallos.push(m); };
const espera = ms => new Promise(r => setTimeout(r, ms));
const dia = n => { const d = new Date(Date.now() + n * 864e5); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

const prof = await api("registro", null, "POST", { usuario: "cprofe" + id, clave: "clave1234", rol: "profe" });
const otro = await api("registro", null, "POST", { usuario: "cotro" + id, clave: "clave1234", rol: "profe" });
const g = await api("admin", prof.j.token, "POST", { accion: "grupo_crear", nombre: "2.º A " + id, codigo: "cq" + id });
const gid = g.j.id;
const nombres = ["ana", "leo", "eva", "max"], tok = {};
for (const n of nombres) { const r = await api("registro", null, "POST", { usuario: n + id, clave: "clave1234", codigo: g.j.codigo, progreso: { learn: "es", know: "en" } }); tok[n] = r.j.token; }
ok(prof.ok && g.ok && Object.keys(tok).length === 4, "crear profe, clase y 4 alumnos");
/* un deber de lectura: Ana lo hace con 3 estrellas, Leo con 1; ya ha pasado la fecha (los demás = 0) */
await api("admin", prof.j.token, "POST", { accion: "deber_crear", lectura: "bear-a1", grupo: gid, limite: dia(-1) });
await api("progreso", tok.ana, "PUT", { s: { learn: "es", know: "en", g: { xp: 120, rd: { "bear-a1": { n: 1, best: 3, bp: 100 } } } } });
await api("progreso", tok.leo, "PUT", { s: { learn: "es", know: "en", g: { rd: { "bear-a1": { n: 1, best: 1, bp: 40 } } } } });

/* API */
let r = await api("admin?t=cuaderno&g=" + gid, prof.j.token);
ok(r.ok && r.j.cuaderno && r.j.cuaderno.v === 0, "GET de un cuaderno nuevo: vacío, versión 0");
ok((await api("admin?t=cuaderno&g=" + gid, otro.j.token)).code === 403, "otro profe no puede ver el cuaderno");
ok((await api("admin?t=cuaderno&g=" + gid, tok.ana)).code === 403, "un alumno no puede ver el cuaderno");
r = await api("admin?t=cuaderno", prof.j.token, "POST", { g: gid, v: 0, c: { cols: [] } });
ok(r.ok && r.j.v === 1, "guardar sube la versión");
ok((await api("admin?t=cuaderno", prof.j.token, "POST", { g: gid, v: 0, c: { cols: [] } })).code === 409, "guardar con una versión vieja → 409 (no pisa lo de otro aparato)");
ok((await api("admin?t=cuaderno", prof.j.token, "POST", { g: gid, v: 1, c: { x: "a".repeat(420000) } })).code === 413, "demasiado grande → 413");

const b = await chromium.launch(), errs = [];
const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } });
await ctx.addInitScript(([t, u]) => { if (!sessionStorage.getItem("hecho")) { sessionStorage.setItem("hecho", 1); localStorage.setItem("lyaCuenta", JSON.stringify({ token: t, usuario: u, rol: "profe" })); } }, [prof.j.token, "cprofe" + id]);
const p = await ctx.newPage(); p.on("pageerror", e => errs.push(e.message)); p.on("dialog", d => d.accept());
await p.goto(B + "/index.html#profe", { waitUntil: "networkidle" }); await espera(1200);
ok(await p.locator('a[href="#profe-cuaderno"]').count() >= 1, "la portada del profe tiene el botón «Cuaderno de clase»");
await p.click('a[href="#profe-cuaderno"]'); await p.waitForSelector(".cq-notas"); await espera(300);
ok(await p.locator(".cq-notas tbody tr").count() === 4, "la tabla de notas tiene los 4 alumnos");
const fila = n => p.locator(`.cq-notas tr[data-u="${n + id}"]`);
const ph = await fila("ana").locator(".cq-n").first().getAttribute("placeholder"), phL = await fila("leo").locator(".cq-n").first().getAttribute("placeholder"), phE = await fila("eva").locator(".cq-n").first().getAttribute("placeholder");
ok(ph === "10" && phL === "3,3" && phE === "0", `el deber sale solo: Ana 10, Leo 3,3, Eva 0 (sale ${ph}, ${phL}, ${phE})`);
/* nueva columna: examen */
await p.click('[data-cq="col-nueva"]'); await p.fill('[data-cqf="col"] [name=n]', "Examen tema 1"); await p.click('[data-cqf="col"] button[type=submit]');
await p.waitForSelector('.cq-cn:has-text("Examen tema 1")');
const ex = n => fila(n).locator(".cq-n").nth(1);
await ex("ana").fill("8"); await ex("ana").press("Enter"); await p.keyboard.type("6,5"); await p.keyboard.press("Enter"); await espera(200);  /* van por orden alfabético: Ana, Eva, Leo, Max */
await ex("leo").fill("6,5"); await ex("leo").press("Tab"); await espera(200);
const fin = async n => (await fila(n).locator('[data-m="fin"]').textContent()).trim();
/* Ana: deberes 10 (30) + examen 8 (40) → (300+320)/70 = 8,857 → 8,9 · Leo: 3,33·30 + 6,5·40 → (100+260)/70 = 5,1 */
ok(await fin("ana") === "8,9" && await fin("leo") === "5,1", `media ponderada: Ana 8,9 y Leo 5,1 (sale ${await fin("ana")} y ${await fin("leo")})`);
ok(await ex("eva").inputValue() === "6,5", "Intro baja a la nota del alumno siguiente y acepta la coma");
/* cambiar la nota del deber a mano */
await fila("eva").locator(".cq-n").first().fill("5"); await fila("eva").locator(".cq-n").first().press("Tab"); await espera(200);
/* Eva: deber 5 (a mano) y examen 6,5 → (150+260)/70 = 5,9 */
ok(await fin("eva") === "5,9", `una nota puesta a mano pisa la del deber (${await fin("eva")})`);
/* pesos */
await p.click('[data-cq="cats"]'); await p.locator('[data-cqf="cats"] .cq-cat').nth(0).locator("[name=peso]").fill("0"); await p.click('[data-cqf="cats"] button[type=submit]'); await espera(200);
ok(await fin("ana") === "8", `con peso 0 en deberes, la media de Ana es la del examen (${await fin("ana")})`);
await espera(1500);
ok(/Guardado/.test(await p.textContent("#cq-estado")), "se guarda solo");
if (DIR) await p.screenshot({ path: DIR + "/cuaderno-notas.png", fullPage: true });

/* pasar lista y puntos */
await p.click('a[href="#profe-cuaderno-lista"]'); await p.waitForSelector(".cq-lista");
await p.locator(`.cq-al[data-u="max${id}"] [data-a="f"]`).click();
await p.locator(`.cq-al[data-u="ana${id}"] [data-h="part"]`).click(); await p.locator(`.cq-al[data-u="ana${id}"] [data-h="part"]`).click();
await p.locator(`.cq-al[data-u="leo${id}"] [data-h="int"]`).click();
ok(/❌ 1 falta · ⏰ 0 retrasos/.test(await p.textContent(".cq-resumen")), "pasar lista: 1 falta");
ok((await p.locator(`.cq-al[data-u="ana${id}"] .cq-net`).textContent()).includes("+2"), "Ana tiene +2 hoy");
await p.click('[data-cq="punto-todos"][data-h="esf"]');
ok(await p.locator(`.cq-al[data-u="max${id}"] [data-h="esf"] i`).count() === 0 && (await p.locator(`.cq-al[data-u="eva${id}"] [data-h="esf"] i`).textContent()) === "1", "el punto a toda la clase no llega al que ha faltado");
if (DIR) await p.screenshot({ path: DIR + "/cuaderno-lista.png", fullPage: true });

/* plano */
await p.click('a[href="#profe-cuaderno-plano"]'); await p.waitForSelector(".cq-plano");
await p.click('[data-cq="modo"][data-m="colocar"]'); await p.click('[data-cq="plano-azar"]');
ok(await p.locator(".cq-sitio.ocupado").count() === 4, "colocar al azar sienta a los 4");
await p.click('[data-cq="modo"][data-m="lista"]');
const sitioMax = p.locator(`.cq-sitio[aria-label="max${id}"]`);
ok(await sitioMax.evaluate(e => e.classList.contains("asis-f")), "en el plano, Max sale con falta");
await sitioMax.click(); ok(await p.locator(`.cq-sitio[aria-label="max${id}"]`).evaluate(e => e.classList.contains("asis-r")), "tocar su mesa pasa a retraso");
await p.click('[data-cq="modo"][data-m="puntos"]'); await p.locator(`.cq-sitio[aria-label="eva${id}"]`).click();
await p.click('.cq-pop [data-h="ayu"]');
ok((await p.locator(`.cq-sitio[aria-label="eva${id}"]`).textContent()).includes("+2"), "dar un punto desde el plano");
if (DIR) await p.screenshot({ path: DIR + "/cuaderno-plano.png", fullPage: true });

/* herramientas */
await p.click('a[href="#profe-cuaderno-herramientas"]'); await p.waitForSelector("#cq-azar");
await p.click('[data-cq="azar"]'); await espera(1300);
ok(/🎉/.test(await p.textContent("#cq-azar-n")), "alumno al azar");
await p.fill("#cq-g-n", "2"); await p.click('[data-cq="grupos"]');
ok(await p.locator(".cq-grupo").count() === 2, "grupos de 2 con los 4 presentes (Max llega tarde, cuenta)");
await p.click('[data-cq="reloj-pon"][data-m="1"]'); await p.click('[data-cq="reloj-va"]'); await espera(1600);
ok(/^0:5\d$/.test(await p.textContent("#cq-r-t")), "el temporizador baja: " + await p.textContent("#cq-r-t"));
if (DIR) await p.screenshot({ path: DIR + "/cuaderno-herramientas.png", fullPage: true });

/* informes */
await p.click('a[href="#profe-cuaderno-informes"]'); await p.waitForSelector(".cq-inf");
await p.selectOption("#cq-inf-u", "ana" + id);
await p.fill("#cq-inf-nom", "Ana García"); await p.fill("#cq-inf-obs", "Trabaja muy bien en clase.");
const inf = await p.textContent(".cq-inf");
ok(/Ana García/.test(inf) && /Examen tema 1: 8/.test(inf) && /Participa: 2/.test(inf) && /Trabaja muy bien/.test(inf) && /Ha hecho 1 de 1/.test(inf), "el informe tiene nombre, notas, puntos, deberes y comentario");
await p.emulateMedia({ media: "print" });
await p.evaluate(() => { window.print = () => {}; }); await p.click('[data-cq="imprimir-todos"]'); await espera(200);
ok(await p.locator("#cq-print .cq-inf").count() === 4 && await p.locator("#cq-print").isVisible() && !(await p.locator("#app").isVisible()), "al imprimir solo sale el informe (uno por alumno)");
if (DIR) await p.screenshot({ path: DIR + "/cuaderno-informe-imprimir.png", fullPage: true });
await p.emulateMedia({ media: "screen" });
await espera(1500);

/* se ha guardado todo en el servidor */
r = await api("admin?t=cuaderno&g=" + gid, prof.j.token);
const c = r.j.cuaderno;
ok(c.cols.length === 1 && c.notas[c.cols[0].id]["ana" + id] === 8 && c.asis[dia(0)]["max" + id] === "r" && c.pts.length >= 7 && c.plano.s["ana" + id] !== undefined && c.nom["ana" + id] === "Ana García", "en el servidor: columna, notas, asistencia, puntos, plano y nombre");

/* móvil */
const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await m.addInitScript(([t, u]) => localStorage.setItem("lyaCuenta", JSON.stringify({ token: t, usuario: u, rol: "profe" })), [prof.j.token, "cprofe" + id]);
const pm = await m.newPage(); pm.on("pageerror", e => errs.push(e.message));
for (const tb of ["notas", "lista", "plano", "herramientas", "informes"]) {
  await pm.goto(B + "/index.html#profe-cuaderno-" + tb, { waitUntil: "networkidle" }); await pm.waitForSelector("#cq-cont"); await espera(300);
  const ancho = await pm.evaluate(() => document.documentElement.scrollWidth);
  ok(ancho <= 392, `móvil (${tb}): sin scroll de lado (${ancho}px)`);
  if (DIR) await pm.screenshot({ path: `${DIR}/cuaderno-movil-${tb}.png`, fullPage: true });
}
ok(!errs.length, "sin errores de JavaScript" + (errs.length ? ": " + errs.join(" | ") : ""));
await b.close();
console.log(fallos.length ? `\n${fallos.length} fallos` : "\nTodo bien");
process.exit(fallos.length ? 1 : 0);
