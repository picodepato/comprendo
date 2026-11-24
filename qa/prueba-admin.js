/* «Propón un tema» + panel de admin (usuario admin). Necesita /api (qa/servidor-prueba.mjs).
   Uso: NODE_PATH=/opt/node22/lib/node_modules node prueba-admin.js http://localhost:8790/index.html [clave-admin] */
const { chromium } = require("playwright");
const URL = process.argv[2], CLAVE = process.argv[3] || "admin";
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
  await A.evaluate(() => { LYA.S.a["bear-a1:q0"] = 1; LYA.S.a["comida-a1:q0"] = 1; LYA.save(); }); await A.waitForTimeout(2600);
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
  await D.click("[data-tab=usuarios]"); await D.waitForSelector(".ctatb");
  const fila = await D.textContent(".ctatb tbody"); ok(fila.includes(u), "admin ve los usuarios");
  ok(await D.evaluate(u => [...document.querySelectorAll(".ctatb tbody tr")].some(tr => tr.textContent.includes(u) && tr.children[3].textContent === "2"), u), "admin ve lecturas del usuario (2)");
  await D.screenshot({ path: "/tmp/admin-usuarios.png" });
  await D.click("[data-tab=votos]"); await D.waitForTimeout(300); ok(true, "pestaña votos abre");
  await D.click("[data-tab=propuestas]"); await D.waitForSelector("[data-borrar]");
  const n0 = await D.locator(".ctali li").count(); await D.click("[data-borrar] >> nth=0"); await D.click("[data-borrar] >> nth=0");
  await D.waitForFunction(n => document.querySelectorAll(".ctali li").length === n - 1 || (n === 1 && !document.querySelector(".ctali")), n0); ok(true, "admin borra una propuesta");
  console.log("ERRORES:", ERR.length ? ERR.join(" | ") : "ninguno");
  await b.close(); process.exit(ERR.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
