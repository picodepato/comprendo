/* «Propón un tema» + panel de admin (usuario admin). Necesita /api (qa/servidor-prueba.mjs).
   Uso: NODE_PATH=/opt/node22/lib/node_modules node prueba-admin.cjs http://localhost:8790/index.html [clave-admin] */
const { chromium } = require("playwright");
const URL = process.argv[2], CLAVE = process.argv[3] || "admin";
const tab = async (p, k) => { await p.click(`.ctatabs [data-tab=${k}]`); await p.waitForSelector(`.ctatabs [data-tab=${k}][aria-selected=true]`); };
const ERR = [], ok = (c, m) => { console.log((c ? "OK  " : "MAL ") + m); if (!c) ERR.push(m); };
(async () => {
  const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  const nueva = async (w = 420) => { const p = await (await b.newContext({ viewport: { width: w, height: 850 } })).newPage();
    p.on("pageerror", e => ERR.push("JS: " + e.message)); p.on("response", r => { if (r.status() >= 400 && !r.url().includes("/api/")) ERR.push(r.status() + " " + r.url()); }); return p; };
  const listo = p => p.waitForFunction(() => window.LYA && window.LYA.S && document.getElementById("cta"));
  /* alumno invitado propone */
  const A = await nueva(); await A.goto(URL); await listo(A);
  await A.waitForSelector("#propf"); ok(true, "caja «Propón un tema» en la portada");
  await A.fill("#propf textarea", "Los volcanes de Islandia"); await A.click("#propf button");
  await A.waitForFunction(() => /Gracias/.test(document.querySelector("#propf .ctam").textContent)); ok(true, "propuesta enviada (invitado)");
  await A.fill("#propf textarea", "x"); await A.click("#propf button"); ok(/3 letras/.test(await A.textContent("#propf .ctam")), "propuesta demasiado corta rechazada");
  /* alumno con cuenta propone */
  const u = "alu" + Date.now() % 100000;
  await A.click("#cta"); await A.click("#ctac"); await A.fill("[name=usuario]", u); await A.fill("[name=clave]", "clave123"); await A.fill("[name=clave2]", "clave123");
  await Promise.all([A.waitForNavigation(), A.click("#ctaf [type=submit]")]); await listo(A);
  await A.evaluate(() => { const S = LYA.S; S.a["bear-a1:q0"] = 1; S.a["bear-a1:fin"] = 1; S.a["comida-a1:q0"] = 1; S.g.rd = {"bear-a1": {n: 2, best: 3, bp: 100, last: 2}}; S.dict.push({w: "oso", k: "oso", r: "bear-a1", l: "es", t: "bear", miss: true}); LYA.save(); }); await A.waitForTimeout(2600);
  await A.waitForSelector("#propf"); await A.fill("#propf textarea", "Tiburones blancos"); await A.click("#propf button");
  await A.waitForFunction(() => /Gracias/.test(document.querySelector("#propf .ctam").textContent));
  /* nadie más puede registrarse como admin */
  const C = await nueva(); await C.goto(URL); await listo(C); await C.click("#cta"); await C.click("#ctac");
  await C.fill("[name=usuario]", "admin"); await C.fill("[name=clave]", "loquesea1"); await C.fill("[name=clave2]", "loquesea1"); await C.click("#ctaf [type=submit]");
  await C.waitForFunction(() => /ya existe/.test(document.getElementById("ctam").textContent)); ok(true, "no se puede crear la cuenta «admin»");
  ok((await C.evaluate(() => fetch("api/admin").then(r => r.status))) === 403, "api/admin cerrada sin sesión de admin");
  /* admin */
  const D = await nueva(1280); await D.goto(URL); await listo(D);
  await D.click("#cta"); await D.fill("[name=usuario]", "admin"); await D.fill("[name=clave]", CLAVE);
  await Promise.all([D.waitForNavigation(), D.click("#ctaf [type=submit]")]); await listo(D);
  await D.click("#cta"); await D.click("#ctaadm"); await D.waitForSelector(".ctali li");
  const txt = await D.textContent(".ctab");
  ok(txt.includes("Los volcanes de Islandia") && txt.includes("Tiburones blancos") && txt.includes(u), "admin ve las propuestas (y quién las envió)");
  await D.screenshot({ path: "/tmp/admin-propuestas.png" });
  await tab(D, "usuarios"); await D.waitForSelector(".ctatb");
  const fila = await D.textContent(".ctatb tbody"); ok(fila.includes(u), "admin ve los usuarios");
  ok(await D.evaluate(u => [...document.querySelectorAll(".ctatb tbody tr")].some(tr => tr.textContent.includes(u) && tr.children[4].textContent === "1" && tr.children[5].textContent.includes("3") && tr.children[8].textContent === "1"), u), "resumen: 1 terminada, 3 estrellas, 1 sin terminar");
  await D.click(`[data-usuario="${u}"]`); await D.waitForSelector(".ctares");
  const det = await D.textContent(".ctab");
  ok(det.includes("El juego") && det.includes("Empezada") && det.includes("100 %"), "detalle por lectura (título, estrellas, empezada)");
  ok(await D.locator(".ctatb tbody tr >> nth=0 >> td >> nth=3 >> .stars i.on").count() === 3, "detalle: 3 estrellas en la lectura terminada");
  ok(det.includes("Palabras guardadas (1)"), "detalle: palabras guardadas");
  await D.screenshot({ path: "/tmp/admin-detalle.png" });
  await D.click("#ctavol"); await D.waitForSelector("[data-usuario]");
  await D.screenshot({ path: "/tmp/admin-usuarios.png" });
  await tab(D, "votos"); await D.waitForTimeout(300); ok(true, "pestaña votos abre");
  await tab(D, "propuestas"); await D.waitForSelector("[data-borrar]");
  const n0 = await D.locator(".ctali li").count(); await D.click("[data-borrar] >> nth=0"); await D.click("[data-borrar] >> nth=0");
  await D.waitForFunction(n => document.querySelectorAll(".ctali li").length === n - 1 || (n === 1 && !document.querySelector(".ctali")), n0); ok(true, "admin borra una propuesta");
  console.log("ERRORES:", ERR.length ? ERR.join(" | ") : "ninguno");
  await b.close(); process.exit(ERR.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
