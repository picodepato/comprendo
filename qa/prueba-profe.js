/* Cuentas de profe y alumno: idioma al crear la cuenta, profe crea clase con código, alumno se une (al crear la cuenta y después),
   cada profe solo ve a sus alumnos, deberes del profe, el admin lo ve todo. Necesita /api (qa/servidor-prueba.mjs).
   Uso: NODE_PATH=/opt/node22/lib/node_modules node prueba-profe.js http://localhost:8790/index.html [clave-admin] */
const { chromium } = require("playwright");
const URL = process.argv[2], CLAVE = process.argv[3] || "admin";
const tab = async (p, k) => { await p.click(`[data-tab=${k}]`); await p.waitForSelector(`[data-tab=${k}][aria-selected=true]`); };
const ERR = [], ok = (c, m) => { console.log((c ? "OK  " : "MAL ") + m); if (!c) ERR.push(m); };
const n = Date.now() % 100000, P1 = "profe" + n, P2 = "otraprofe" + n, AL1 = "lucia" + n, AL2 = "mario" + n, AL3 = "nora" + n, COD = "clase-" + n;
(async () => {
  const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  const nueva = async (w = 420) => { const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    p.on("pageerror", e => ERR.push("JS: " + e.message)); p.on("response", r => { if (r.status() >= 400 && !r.url().includes("/api/")) ERR.push(r.status() + " " + r.url()); }); return p; };
  const listo = p => p.waitForFunction(() => window.LYA && window.LYA.S && document.getElementById("cta"));
  const crear = async (p, u, {rol = "alumno", codigo = "", curso = "es>en"} = {}) => {
    await p.goto(URL); await listo(p); await p.click("#cta"); await p.click("#ctac");
    await p.fill("[name=usuario]", u); await p.fill("[name=clave]", "clave123"); await p.fill("[name=clave2]", "clave123");
    await p.check(`[name=curso][value="${curso}"]`); await p.check(`[name=rol][value=${rol}]`);
    if (rol === "alumno" && codigo) await p.fill("[name=codigo]", codigo);
    await p.click("#ctaf [type=submit]"); };
  const hecho = async p => { await p.waitForNavigation(); await listo(p); };
  /* profe 1 crea cuenta y clase */
  const P = await nueva(1280); await crear(P, P1, {rol: "profe"});
  ok(await P.isHidden("#ctacod"), "profe: no se pide código de clase"); await hecho(P);
  await P.click("#cta"); ok(await P.isVisible("#ctaadm") && (await P.textContent("#ctaadm")).includes("profe"), "profe: botón «Panel del profe»");
  await P.click("#ctaadm"); await P.waitForSelector("#admc"); const tabs = await P.textContent(".ctatabs");
  ok(!tabs.includes("Propuestas") && !tabs.includes("Votos"), "profe: no ve propuestas ni votos");
  await tab(P, "clases"); await P.fill("#admgc [name=nombre]", "Inglés " + n); await P.fill("#admgc [name=codigo]", COD); await P.click("#admgc [type=submit]");
  await P.waitForFunction(c => ((document.getElementById("admm") || {}).textContent || "").includes(c), COD); ok(true, "profe crea clase con su código");
  /* código repetido */
  await P.fill("#admgc [name=nombre]", "Otra"); await P.fill("#admgc [name=codigo]", COD); await P.click("#admgc [type=submit]");
  await P.waitForFunction(() => /ya lo usa/.test(((document.getElementById("admm") || {}).textContent || ""))); ok(true, "código de clase repetido rechazado");
  /* alumno 1: inglés y con código al crear la cuenta */
  const A = await nueva(); await crear(A, AL1, {codigo: COD.toUpperCase(), curso: "en>es"}); await hecho(A);
  ok(await A.evaluate(() => LYA.S.learn === "en" && LYA.S.know === "es"), "alumno eligió aprender inglés al crear la cuenta");
  await A.click("#cta"); await A.waitForFunction(() => /Mi clase:/.test((document.getElementById("ctacl") || {}).textContent || ""));
  ok((await A.textContent("#ctacl")).includes("Inglés " + n) && (await A.textContent("#ctacl")).includes(P1), "alumno ve su clase y su profe");
  /* código malo al crear */
  const X = await nueva(); await crear(X, "x" + n, {codigo: "noexiste-" + n}); await X.waitForFunction(() => /ninguna clase/.test(document.getElementById("ctam").textContent)); ok(true, "código de clase inexistente rechazado");
  /* alumno 2 sin código; se une después desde Mi cuenta */
  const B = await nueva(); await crear(B, AL2); await hecho(B);
  await B.click("#cta"); await B.waitForSelector("#ctaclf"); ok((await B.textContent("#ctacl")).includes("ninguna"), "alumno sin clase");
  await B.fill("#ctaclf [name=codigo]", "mal"); await B.click("#ctaclf button"); await B.waitForFunction(() => /ninguna clase/.test(document.querySelector("#ctacl .ctam").textContent)); ok(true, "unirse con código malo: aviso");
  await B.fill("#ctaclf [name=codigo]", COD); await B.click("#ctaclf button"); await B.waitForFunction(() => /Ya estás en la clase/.test(document.querySelector("#ctacl .ctam").textContent)); ok(true, "alumno se une a la clase desde Mi cuenta");
  await B.keyboard.press("Escape"); await B.evaluate(() => { LYA.S.g.rd = {"bear-a1": {n: 1, best: 3, bp: 100, last: 3}}; LYA.S.a["bear-a1:fin"] = 1; LYA.save(); }); await B.waitForTimeout(2600);
  /* alumno 3 de otra profe */
  const Q = await nueva(1280); await crear(Q, P2, {rol: "profe"}); await hecho(Q);
  await Q.click("#cta"); await Q.click("#ctaadm"); await Q.waitForSelector("#admc"); await tab(Q, "clases"); await Q.fill("#admgc [name=nombre]", "Otra " + n); await Q.fill("#admgc [name=codigo]", "otra-" + n); await Q.click("#admgc [type=submit]"); await Q.waitForFunction(() => /Clase creada/.test(((document.getElementById("admm") || {}).textContent || "")));
  const C3 = await nueva(); await crear(C3, AL3, {codigo: "otra-" + n}); await hecho(C3);
  /* profe 1 solo ve a los suyos */
  await tab(P, "usuarios"); await P.waitForSelector(".ctatb");
  const lista = await P.textContent(".ctatb tbody"); ok(lista.includes(AL1) && lista.includes(AL2) && !lista.includes(AL3) && !lista.includes(P2), "profe ve solo a sus alumnos");
  ok((await P.evaluate(u => window.LYACuentas.api("admin?usuario=" + u).then(r => r.code), AL3)) === 403, "profe no puede ver el detalle de alumnos ajenos");
  ok((await P.evaluate(() => window.LYACuentas.api("admin", "POST", {accion: "borrar_usuario", usuario: "x"}).then(r => r.code))) === 403, "profe no puede borrar usuarios");
  /* deberes del profe para todas sus clases */
  await tab(P, "deberes"); await P.selectOption("#admdc [name=lectura]", "bear-a1"); await P.click("#admdc [type=submit]"); await P.waitForSelector("[data-borrad]");
  ok(/1<\/b> de 2/.test(await P.innerHTML("#admc")), "deber del profe: 1 de 2 alumnos lo han hecho");
  await P.click(`[data-tab=usuarios]`); await P.click(`[data-usuario="${AL2}"]`); await P.waitForSelector(".ctares"); ok(!(await P.$("#admub")), "detalle para el profe sin botón de borrar");
  await P.screenshot({ path: "/tmp/profe-detalle.png" });
  await B.reload(); await listo(B); await B.waitForSelector("#deberes"); ok(true, "alumno de la clase ve los deberes de su profe");
  await C3.reload(); await listo(C3); await C3.waitForTimeout(1500); ok(!(await C3.$("#deberes")), "alumno de otra profe no los ve");
  /* admin ve todo */
  const D = await nueva(1280); await D.goto(URL); await listo(D); await D.click("#cta"); await D.fill("[name=usuario]", "admin"); await D.fill("[name=clave]", CLAVE);
  await Promise.all([D.waitForNavigation(), D.click("#ctaf [type=submit]")]); await listo(D); await D.click("#cta"); await D.click("#ctaadm"); await D.waitForSelector("#admc");
  await tab(D, "clases"); const cl = await D.textContent("#admc"); ok(cl.includes(COD) && cl.includes(P1) && cl.includes("otra-" + n), "admin ve todas las clases con su código y su profe");
  await tab(D, "usuarios"); const us = await D.textContent(".ctatb"); ok(us.includes(AL3) && us.includes(P2) && us.includes("Profe"), "admin ve a todos (alumnos y profes)");
  await D.screenshot({ path: "/tmp/admin-clases.png" });
  console.log("ERRORES:", ERR.length ? ERR.join(" | ") : "ninguno");
  await b.close(); process.exit(ERR.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
