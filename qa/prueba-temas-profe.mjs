// «➕ Añadir un tema» de punta a punta: el profe pide un tema con fotos, el admin lo revisa y lo aprueba,
// el robot lo baja y lo marca como preparado (se borran las fotos), y el tema publicado lo ven el profe y sus alumnos (y nadie más).
// Uso: TEMAS_ROBOT=<clave de 20+> node qa/servidor-prueba.mjs <carpeta> 8790 &  →  TEMAS_ROBOT=<la misma> node qa/prueba-temas-profe.mjs http://localhost:8790 <carpeta> [capturas]
// <carpeta> es una copia de la web: la prueba cambia su temas-profe/indice.json para que el tema de ejemplo sea del profe de la prueba.
import { createRequire } from "module"; const require = createRequire(import.meta.url);
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process"; import os from "node:os";
const { chromium } = require("playwright");
const B = (process.argv[2] || "http://localhost:8790").replace(/\/index\.html$/, ""), RAIZ = process.argv[3], DIR = process.argv[4], id = Date.now().toString(36).slice(-5);
const api = async (p, tok, m = "GET", body, h = {}) => { const r = await fetch(`${B}/api/${p}`, { method: m, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}), ...h }, body: body && JSON.stringify(body) }); return { ok: r.ok, code: r.status, j: await r.json().catch(() => ({})) }; };
const fallos = [], ok = (c, m) => { console.log((c ? "✅ " : "❌ ") + m); if (!c) fallos.push(m); };
const espera = ms => new Promise(r => setTimeout(r, ms));
if (!RAIZ) { console.error("Falta la carpeta de la web (una copia)"); process.exit(2); }

const prof = await api("registro", null, "POST", { usuario: "profe" + id, clave: "clave1234", rol: "profe" });
const otro = await api("registro", null, "POST", { usuario: "otro" + id, clave: "clave1234", rol: "profe" });
const g = await api("admin", prof.j.token, "POST", { accion: "grupo_crear", nombre: "2.º A " + id, codigo: "tp" + id });
const alu = await api("registro", null, "POST", { usuario: "ana" + id, clave: "clave1234", codigo: g.j.codigo, progreso: { learn: "es", know: "en" } });
const ajeno = await api("registro", null, "POST", { usuario: "leo" + id, clave: "clave1234", progreso: { learn: "es", know: "en" } });
const adm = await api("entrar", null, "POST", { usuario: "admin", clave: process.env.ADMIN_CLAVE || "admin" });
ok(prof.ok && otro.ok && g.ok && alu.ok && ajeno.ok && adm.ok, "crear 2 profes, una clase, 2 alumnos y entrar como admin");

/* la API: quién puede */
ok((await api("temas", alu.j.token)).code === 403, "un alumno no puede usar /api/temas");
ok((await api("temas", null, "GET", undefined, { "x-robot": "mala-clave-mala-clave-1234" })).code === 403, "el robot con una clave mala no entra");
ok((await api("temas", prof.j.token, "POST", { accion: "pedir", curso: "2.º ESO", asignatura: "Mates", titulo: "X", texto: "corto" })).j.error === "falta_material", "sin fotos ni texto no deja pedir");

const b = await chromium.launch(), errs = [];
const ctxDe = async (tok, u, rol) => { const c = await b.newContext({ viewport: { width: 420, height: 900 } }); await c.addInitScript(([t, uu, r]) => { if (!sessionStorage.getItem("hecho")) { sessionStorage.setItem("hecho", 1); localStorage.setItem("lyaCuenta", JSON.stringify({ token: t, usuario: uu, rol: r })); } }, [tok, u, rol]); const p = await c.newPage(); p.on("pageerror", e => errs.push(e.message)); return p; };

/* 1) el profe pide un tema con el asistente (en el móvil) */
const p = await ctxDe(prof.j.token, "profe" + id, "profe");
await p.goto(B + "/index.html#profe", { waitUntil: "networkidle" }); await espera(800);
ok(await p.locator('a[href="#profe-tema-nuevo"]').count() > 0, "en Profe sale «➕ Añadir un tema»");
await p.goto(B + "/index.html#profe-tema-nuevo"); await p.waitForSelector(".tp .mt-box");
ok(/¿Para qué curso/.test(await p.textContent(".tp")), "paso 1: ¿para qué curso?");
await p.click('[data-tp=chip][data-v="2.º ESO"]');
ok(/¿De qué asignatura/.test(await p.textContent(".tp")), "al tocar un curso pasa a la asignatura");
await p.fill("[data-tpin=asignatura]", "Matem"); ok(await p.locator("#tpdla option[value=Matemáticas]").count() === 1, "la asignatura se autocompleta (lista de sugerencias)");
await p.click('[data-tp=chip][data-v="Matemáticas"]');
ok(await p.locator("[data-tp=sigue]").isDisabled(), "sin nombre del tema no deja seguir");
await p.fill("[data-tpin=tema]", "4"); await p.fill("[data-tpin=titulo]", "Las fracciones");
await p.click("[data-tp=sigue]");
await p.fill("[data-tpin=apartados]", "1. Qué es una fracción\n2. Fracciones equivalentes"); await p.click("[data-tp=sigue]");
await p.click('[data-tp=dif][data-v=tdah]'); await p.click('[data-tp=dif][data-v=facil]'); await p.fill("[data-tpin=notas]", "Les cuesta leer enunciados largos."); await p.click("[data-tp=sigue]");
/* fotos: dos capturas grandes (se reducen en el navegador) */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tp-")), f1 = path.join(tmp, "pagina1.png"), f2 = path.join(tmp, "pagina2.png");
fs.writeFileSync(f1, await p.screenshot({ fullPage: true })); fs.writeFileSync(f2, await p.screenshot());
await p.setInputFiles("[data-tpfile]", [f1, f2]);
await p.waitForFunction(() => document.querySelectorAll(".tp-foto").length === 2);
ok(true, "se añaden 2 fotos y se ven en miniatura");
const tam = await p.evaluate(() => [...document.querySelectorAll(".tp-foto img")].map(i => i.src.length));
ok(tam.every(n => n < 750000), `las fotos se reducen antes de subirlas (${tam.map(n => Math.round(n / 1024) + " KB").join(", ")})`);
ok(await p.locator("[data-tp=sigue]").isDisabled(), "sin marcar «no salen alumnos» no deja seguir");
await p.check("[data-tp=acepto]"); await p.click("[data-tp=sigue]");
const res = await p.textContent(".tp-res");
ok(/2\.º ESO/.test(res) && /Las fracciones/.test(res) && /TDAH/.test(res) && /2 fotos/.test(res), "el resumen enseña todo lo elegido");
if (DIR) await p.screenshot({ path: DIR + "/tp-resumen.png", fullPage: true });
await p.click("[data-tp=enviar]");
await p.waitForFunction(() => location.hash === "#profe-temas" && document.querySelector(".tp-pet"), null, { timeout: 15000 });
ok(/Esperando revisión/.test(await p.textContent(".tp-lista")), "después de enviar sale en «Mis peticiones» esperando revisión");
if (DIR) await p.screenshot({ path: DIR + "/tp-mis-peticiones.png", fullPage: true });

const mias = (await api("temas", prof.j.token)).j.peticiones, pet = mias[0];
ok(mias.length === 1 && pet.fotos === 2 && pet.fotosSubidas === 2 && pet.alumnado.includes("tdah") && pet.estado === "pendiente", "la petición está en la cola con sus 2 fotos");
ok((await api("temas", otro.j.token)).j.peticiones.length === 0, "otro profe no ve la petición");
ok((await api(`temas?foto=${pet.id}&i=0`, otro.j.token)).code === 404, "otro profe no puede ver las fotos");
ok((await api("temas", otro.j.token, "POST", { accion: "revisar", id: pet.id, decision: "aprobar" })).code === 403, "un profe no puede aprobar");

/* 2) el admin la revisa en su panel y la aprueba */
const pa = await ctxDe(adm.j.token, "admin", "admin");
await pa.setViewportSize({ width: 1280, height: 1000 });
await pa.goto(B + "/index.html#profe", { waitUntil: "networkidle" }); await espera(500);
await pa.evaluate(() => window.LYACuentas.panel("temas")); await pa.waitForSelector("[data-tpform]");
const txtA = await pa.textContent("#admc");
ok(/Las fracciones/.test(txtA) && /profe/.test(txtA) && /TDAH/.test(txtA) && /Les cuesta leer/.test(txtA), "el admin ve la petición en «📥 Temas pedidos»");
ok(/Temas pedidos \(1\)/.test(await pa.textContent(".ctatabs")), "la pestaña dice cuántas hay por revisar");
await pa.click("[data-tpfotos]"); await pa.waitForFunction(() => document.querySelectorAll(".tpa-fotos img").length === 2);
ok(true, "el admin ve las 2 fotos");
if (DIR) await pa.screenshot({ path: DIR + "/tp-admin.png", fullPage: true });
await pa.fill("[data-tpform] textarea", "Más ejercicios de nivel 1, por favor.");
await pa.click("[data-tpform] [data-dec=aprobar]");
await pa.waitForFunction(() => /Aprobado/.test(document.querySelector("#admm")?.textContent || ""));
let P1 = (await api("temas", adm.j.token)).j.peticiones.find(x => x.id === pet.id);
ok(P1.estado === "aprobada" && /nivel 1/.test(P1.nota), "aprobada con las indicaciones del admin");

/* 3) el robot la baja y la marca como preparada → se borran las fotos */
const env = { ...process.env, COMPRENDO_URL: B }, carp = path.join(tmp, "peticiones");
const sal = execFileSync("node", [path.join(RAIZ, "temas-profe/robot.mjs"), "lista", carp], { env }).toString();
ok(/1 peticiones aprobadas/.test(sal) && fs.existsSync(path.join(carp, pet.id, "foto-1.jpg")) && fs.existsSync(path.join(carp, pet.id, "foto-2.jpg")), "el robot baja la petición y sus 2 fotos");
ok(JSON.parse(fs.readFileSync(path.join(carp, pet.id, "peticion.json"))).nota.includes("nivel 1"), "el robot recibe las indicaciones del admin");
execFileSync("node", [path.join(RAIZ, "temas-profe/robot.mjs"), "preparada", pet.id, "x1", "temas-profe/x1.js", "https://github.com/x/y/pull/1"], { env });
P1 = (await api("temas", adm.j.token)).j.peticiones.find(x => x.id === pet.id);
ok(P1.estado === "preparada" && P1.fotosSubidas === 0 && P1.temaId === "x1", "preparada con su PR");
ok((await api(`temas?foto=${pet.id}&i=0`, adm.j.token)).code === 404 && (await api(`temas?foto=${pet.id}&i=1`, adm.j.token)).code === 404, "las fotos ya no están en la base de datos");

/* 4) se publica (simulado: el tema de ejemplo pasa a ser de este profe) */
const indF = path.join(RAIZ, "temas-profe/indice.json"), ind = JSON.parse(fs.readFileSync(indF, "utf8"));
ind[0] = { ...ind[0], profe: "profe" + id, peticion: pet.id }; fs.writeFileSync(indF, JSON.stringify(ind));
fs.writeFileSync(path.join(RAIZ, "temas-profe/x1.js"), fs.readFileSync(path.join(RAIZ, "temas-profe/x1.js"), "utf8").replace('profe: "admin"', `profe: "profe${id}"`).replace('peticion: "ejemplo"', `peticion: "${pet.id}"`));
await p.goto(B + "/index.html?otra=1#profe-temas"); await p.waitForSelector(".tp-pet");
ok(/Publicado/.test(await p.textContent(".tp-lista")) && await p.locator('.tp-pet a[href="#fpb-x1"]').count() === 1, "el profe ve su petición como publicada, con el enlace al tema");
await p.goto(B + "/index.html#mis-temas"); await p.waitForSelector('.tp a[href="#fpb-x1"]');
ok(true, "el profe ve su tema en «Temas de mis profes»");

/* el alumno de su clase: lo ve y lo practica; entra por enlace directo */
const pal = await ctxDe(alu.j.token, "ana" + id, "alumno");
await pal.goto(B + "/index.html#fpb-x1", { waitUntil: "networkidle" });
await pal.waitForFunction(() => /Las fracciones/.test(document.querySelector("#app")?.textContent || ""), null, { timeout: 10000 });
ok(true, "el alumno abre el tema con un enlace directo (#fpb-x1)");
await pal.goto(B + "/index.html#fpb-x1-1"); await pal.waitForSelector(".fp");
ok(/numerador/i.test(await pal.textContent("#app")), "el apartado 1 enseña la explicación");
await pal.goto(B + "/index.html#fpb-x1-1-d1"); await pal.waitForSelector(".fp-q", { timeout: 10000 });
ok(await pal.locator(".fp-q button").count() >= 2, "la práctica de nivel Fácil funciona con el motor de FP Básica");
if (DIR) await pal.screenshot({ path: DIR + "/tp-alumno-practica.png", fullPage: true });
await pal.goto(B + "/index.html#mis-temas"); await pal.waitForSelector('.tp a[href="#fpb-x1"]');
ok(true, "el alumno ve el tema en «Temas de mis profes»");
await pal.goto(B + "/index.html#fpb"); await espera(500);
ok(!/Matemáticas/.test(await pal.textContent("#app")), "el tema de un profe no sale en la portada de FP Básica");

/* otro alumno (sin esa clase) y el otro profe: no lo ven */
const pj = await ctxDe(ajeno.j.token, "leo" + id, "alumno");
await pj.goto(B + "/index.html#mis-temas"); await pj.waitForSelector(".tp"); await espera(800);
ok(await pj.locator('a[href="#fpb-x1"]').count() === 0, "un alumno de otra clase no lo ve");
const po = await ctxDe(otro.j.token, "otro" + id, "profe");
await po.goto(B + "/index.html#mis-temas"); await po.waitForSelector(".tp"); await espera(800);
ok(await po.locator('a[href="#fpb-x1"]').count() === 0, "otro profe no lo ve");

/* el robot la marca publicada; el profe puede cancelar una petición pendiente */
execFileSync("node", [path.join(RAIZ, "temas-profe/robot.mjs"), "publicada", pet.id], { env });
ok((await api("temas", adm.j.token)).j.peticiones.find(x => x.id === pet.id).estado === "publicada", "el robot la marca como publicada");
const r2 = await api("temas", prof.j.token, "POST", { accion: "pedir", curso: "2.º ESO", asignatura: "Lengua", titulo: "El verbo", texto: "Los verbos expresan acciones, estados o procesos. Tienen persona, número, tiempo y modo." });
await api("temas", prof.j.token, "POST", { accion: "enviar", id: r2.j.id });
ok((await api("temas", prof.j.token, "POST", { accion: "cancelar", id: r2.j.id })).ok && !(await api("temas", adm.j.token)).j.peticiones.some(x => x.id === r2.j.id), "el profe cancela una petición pendiente");
/* el admin rechaza: las fotos se borran al momento */
const r3 = await api("temas", prof.j.token, "POST", { accion: "pedir", curso: "2.º ESO", asignatura: "Lengua", titulo: "El sujeto", fotos: 1 });
const foto = "data:image/jpeg;base64," + fs.readFileSync(path.join(carp, pet.id, "foto-2.jpg")).toString("base64");
ok((await api("temas", prof.j.token, "POST", { accion: "foto", id: r3.j.id, i: 0, data: foto })).ok, "subir una foto por la API");
ok((await api("temas", prof.j.token, "POST", { accion: "foto", id: r3.j.id, i: 0, data: "data:text/html;base64,PHNjcmlwdD4=" })).j.error === "foto_no_valida", "no acepta cosas que no son fotos");
await api("temas", prof.j.token, "POST", { accion: "enviar", id: r3.j.id });
await api("temas", adm.j.token, "POST", { accion: "revisar", id: r3.j.id, decision: "rechazar", nota: "Las fotos no se leen bien." });
ok((await api(`temas?foto=${r3.j.id}&i=0`, adm.j.token)).code === 404 && /no se leen/.test((await api("temas", prof.j.token)).j.peticiones.find(x => x.id === r3.j.id).motivo), "al rechazar se borran las fotos y el profe ve el motivo");

ok(!errs.length, "sin errores en la página" + (errs.length ? ": " + errs.join(" | ") : ""));
await b.close();
console.log(fallos.length ? `\n${fallos.length} fallos` : "\nTodo bien");
process.exit(fallos.length ? 1 : 0);
