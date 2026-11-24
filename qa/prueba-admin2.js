/* Panel de admin ampliado: clases, deberes, mensajes, fallos, aprobar propuestas, cambiar contraseña, borrar usuario, Excel.
   Necesita /api (qa/servidor-prueba.mjs). Uso: NODE_PATH=/opt/node22/lib/node_modules node prueba-admin2.js http://localhost:8790/index.html [clave-admin] */
const { chromium } = require("playwright");
const URL = process.argv[2], CLAVE = process.argv[3] || "admin";
const tab = async (p, k) => { await p.click(`[data-tab=${k}]`); await p.waitForSelector(`[data-tab=${k}][aria-selected=true]`); };
const ERR = [], ok = (c, m) => { console.log((c ? "OK  " : "MAL ") + m); if (!c) ERR.push(m); };
const sufijo = Date.now() % 100000, A1 = "ana" + sufijo, B1 = "beto" + sufijo, CLASE = "3A-" + sufijo;
(async () => {
  const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  const nueva = async (w = 420) => { const ctx = await b.newContext({ viewport: { width: w, height: 900 }, acceptDownloads: true }); const p = await ctx.newPage();
    p.on("pageerror", e => ERR.push("JS: " + e.message)); p.on("response", r => { if (r.status() >= 400 && !r.url().includes("/api/")) ERR.push(r.status() + " " + r.url()); }); return p; };
  const listo = p => p.waitForFunction(() => window.LYA && window.LYA.S && document.getElementById("cta"));
  const crear = async (p, u, clave = "clave123") => { await p.goto(URL); await listo(p); await p.click("#cta"); await p.click("#ctac");
    await p.fill("[name=usuario]", u); await p.fill("[name=clave]", clave); await p.fill("[name=clave2]", clave);
    await Promise.all([p.waitForNavigation(), p.click("#ctaf [type=submit]")]); await listo(p); };
  const entrar = async (p, u, clave) => { await p.click("#cta"); await p.fill("[name=usuario]", u); await p.fill("[name=clave]", clave); await p.click("#ctaf [type=submit]"); };
  /* dos alumnos con respuestas (una mala) y una palabra por repasar */
  const A = await nueva(); await crear(A, A1);
  await A.evaluate(() => { const S = LYA.S; S.a["bear-a1:q0"] = 0; S.a["bear-a1:q1"] = 0; S.g.rd = {"bear-a1": {n: 1, best: 2, bp: 70, last: 2}}; S.a["bear-a1:fin"] = 1; S.dict.push({w: "oso", k: "oso", r: "bear-a1", l: "es", t: "bear", miss: true}); LYA.save(); });
  const B = await nueva(); await crear(B, B1);
  await B.evaluate(() => { const S = LYA.S; S.a["bear-a1:q0"] = 2; S.dict.push({w: "oso", k: "oso", r: "bear-a1", l: "es", t: "bear", miss: true}); LYA.save(); });
  await A.waitForTimeout(2600); await B.waitForSelector("#propf"); await B.fill("#propf textarea", "Los volcanes"); await B.click("#propf button");
  await B.waitForFunction(() => /Gracias/.test(document.querySelector("#propf .ctam").textContent));
  /* admin */
  const D = await nueva(1280); await D.goto(URL); await listo(D); await entrar(D, "admin", CLAVE); await D.waitForNavigation(); await listo(D);
  await D.click("#cta"); await D.click("#ctaadm"); await D.waitForSelector("#admc");
  /* clases */
  await tab(D, "clases"); await D.fill("#admgc [name=nombre]", CLASE); await D.click("#admgc button"); await D.waitForSelector(`text=${CLASE}`);
  await D.selectOption(`[data-asig="${A1}"]`, { label: CLASE }); await D.waitForFunction(() => /✓/.test(document.getElementById("admm").textContent));
  await tab(D, "clases"); const nAl = await D.evaluate(c => { const tr = [...document.querySelectorAll("#admc tr")].find(t => t.children[0] && t.children[0].textContent === c); return tr && tr.children[3].textContent; }, CLASE); ok(nAl === "1", "clase creada (con código) con 1 alumno y resumen");
  /* deberes para la clase */
  await tab(D, "deberes"); await D.selectOption("#admdc [name=lectura]", "bear-a1"); await D.selectOption("#admdc [name=grupo]", { label: CLASE });
  await D.fill("#admdc [name=nota]", "Saca 3 estrellas"); await D.click("#admdc [type=submit]"); await D.waitForSelector("[data-borrad]");
  ok(/1<\/b> de 1|1 de 1/.test(await D.innerHTML("#admc")), "deber asignado y se ve quién lo ha hecho (1 de 1)");
  /* mensaje a la clase */
  await tab(D, "mensajes"); await D.selectOption("#admmc [name=para]", { label: "Clase " + CLASE }); await D.fill("#admmc [name=texto]", "¡Muy bien, clase!");
  await D.click("#admmc [type=submit]"); await D.waitForFunction(() => /Enviado a 1/.test(document.getElementById("admm").textContent)); ok(true, "mensaje enviado a la clase (1 alumno)");
  /* fallos */
  await tab(D, "fallos"); await D.waitForFunction(() => !/Calculando/.test(document.getElementById("admpq").textContent));
  const fal = await D.textContent("#admc"); ok(fal.includes("oso") && /de 2/.test(fal) && fal.includes("Un juego de terror"), "fallos: palabra «oso» y pregunta fallada con su respuesta buena");
  /* aprobar propuesta → votación */
  await tab(D, "propuestas"); await D.click("[data-aprobar] >> nth=0"); await D.fill("[data-form] [name=emoji] >> nth=0", "🌋"); await D.fill("[data-form] [name=nombre_es] >> nth=0", "Volcanes " + sufijo);
  await D.click("[data-form] [type=submit] >> nth=0"); await D.waitForFunction(() => /votación/.test(document.getElementById("admm").textContent)); ok(true, "propuesta aprobada");
  /* Excel */
  await tab(D, "usuarios"); const [dl] = await Promise.all([D.waitForEvent("download"), D.click("#admxl")]);
  const csv = require("fs").readFileSync(await dl.path(), "utf8"); ok(csv.includes(A1) && csv.includes("Estrellas") && csv.includes(CLASE), "Excel (CSV) con usuarios, clase y estrellas");
  /* cambiar contraseña de B y borrar A */
  await D.click(`[data-usuario="${B1}"]`); await D.waitForSelector("#admuc"); await D.fill("#admuc [name=nueva]", "nueva456"); await D.click("#admuc button");
  await D.waitForFunction(() => /Contraseña cambiada/.test(document.getElementById("admm").textContent)); ok(true, "contraseña cambiada por el admin");
  await D.screenshot({ path: "/tmp/admin2-usuario.png" });
  /* el alumno A ve deberes y mensaje */
  await A.reload(); await listo(A); await A.waitForSelector("#avok", { timeout: 8000 }).catch(() => {});
  ok(await A.isVisible("#avok") && (await A.textContent(".ctab")).includes("Muy bien, clase"), "el alumno ve el mensaje al entrar");
  await A.click("#avok"); await A.waitForSelector("#deberes"); const deb = await A.textContent("#deberes"); ok(deb.includes("El juego") && deb.includes("Saca 3 estrellas"), "el alumno ve sus deberes en la portada");
  await A.screenshot({ path: "/tmp/alumno-deberes.png", fullPage: false });
  await A.reload(); await listo(A); await A.waitForTimeout(1500); ok(!(await A.isVisible("#avok")), "el mensaje no vuelve a salir");
  ok((await A.textContent("#votos")).includes("Volcanes " + sufijo), "el tema aprobado sale en la votación de la portada");
  /* B: no ve deberes (no está en la clase); su sesión se cerró y entra con la nueva contraseña */
  await B.reload(); await listo(B); await B.waitForTimeout(800); ok((await B.textContent("#cta")).includes("Entrar"), "al cambiar la contraseña se cierra la sesión del alumno");
  await entrar(B, B1, "clave123"); await B.waitForFunction(() => /incorrectos/.test(document.getElementById("ctam").textContent)); ok(true, "la contraseña vieja ya no vale");
  await B.fill("[name=clave]", "nueva456"); await Promise.all([B.waitForNavigation(), B.click("#ctaf [type=submit]")]); await listo(B);
  ok((await B.textContent("#cta")).includes(B1) && !(await B.$("#deberes")), "entra con la nueva y no ve deberes de otra clase");
  /* borrar A */
  await D.click("#ctavol"); await D.click(`[data-usuario="${A1}"]`); await D.waitForSelector("#admub"); await D.click("#admub"); await D.click("#admub");
  await D.waitForFunction(() => /borrado/.test((document.getElementById("admm") || {}).textContent || "")); ok(!(await D.$(`[data-usuario="${A1}"]`)), "usuario borrado");
  await A.reload(); await listo(A); await A.waitForTimeout(800); ok((await A.textContent("#cta")).includes("Entrar"), "el alumno borrado queda fuera");
  console.log("ERRORES:", ERR.length ? ERR.join(" | ") : "ninguno");
  await b.close(); process.exit(ERR.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
