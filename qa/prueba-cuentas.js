/* Cuentas: invitado → crear cuenta llevando el progreso → otro dispositivo entra y lo ve → salir → copia (exportar/importar).
   Necesita la web con /api (servidor de prueba: node qa/servidor-prueba.mjs <carpeta-web+api> 8790).
   Uso: NODE_PATH=/opt/node22/lib/node_modules node prueba-cuentas.js http://localhost:8790/index.html [http://localhost:8765/index.html sin servidor] */
const { chromium } = require("playwright");
const URL = process.argv[2], URL_SIN = process.argv[3];
const ERR = [], ok = (c, m) => { console.log((c ? "OK  " : "MAL ") + m); if (!c) ERR.push(m); };
const user = "prueba" + Date.now() % 100000;
(async () => {
  const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  const nueva = async () => { const c = await b.newContext({ viewport: { width: 420, height: 800 } }); const p = await c.newPage();
    p.on("pageerror", e => ERR.push("JS: " + e.message)); p.on("response", r => { if (r.status() >= 400 && !r.url().includes("/api/")) ERR.push(r.status() + " " + r.url()); }); return p; };
  const listo = p => p.waitForFunction(() => window.LYA && window.LYA.S && document.getElementById("cta"));
  /* 1. dispositivo A, invitado con progreso antiguo de BEAR */
  const A = await nueva();
  await A.addInitScript(() => { if (!localStorage.getItem("lyaPerfiles")) localStorage.setItem("bearLectura", JSON.stringify({ a: { "0q0": 1 }, dict: [{ es: "Oso", en: "bear", v: 0 }] })); });
  await A.goto(URL); await listo(A);
  ok(await A.evaluate(() => LYA.S.a["bear-a1:q0"] === 1 && LYA.S.dict.length === 1), "invitado: progreso BEAR antiguo migrado");
  await A.evaluate(() => { LYA.S.a["bear-a1:q1"] = 2; LYA.save(); });
  ok((await A.textContent("#cta")).includes("Entrar"), "botón Entrar visible");
  /* 2. crear cuenta llevando el progreso */
  await A.click("#cta"); await A.click("#ctac");
  await A.fill("[name=usuario]", user); await A.fill("[name=clave]", "clave123"); await A.fill("[name=clave2]", "clave123");
  ok(await A.isChecked("[name=llevar]"), "casilla «llevar progreso» marcada");
  await Promise.all([A.waitForNavigation(), A.click("#ctaf [type=submit]")]); await listo(A);
  ok((await A.textContent("#cta")).includes(user), "cuenta creada y sesión abierta");
  ok(await A.evaluate(() => LYA.S.a["bear-a1:q1"] === 2 && LYA.S.dict.length === 1), "el progreso pasó a la cuenta");
  await A.evaluate(() => { LYA.S.a["bear-a2:q0"] = 3; LYA.award ? null : null; LYA.save(); });
  await A.waitForTimeout(3000);
  await A.screenshot({ path: "/tmp/cuentas-a.png" });
  /* 3. dispositivo B entra con usuario y contraseña */
  const B = await nueva(); await B.goto(URL); await listo(B);
  await B.click("#cta"); await B.fill("[name=usuario]", user.toUpperCase()); await B.fill("[name=clave]", "mala");
  await B.click("#ctaf [type=submit]"); await B.waitForFunction(() => /incorrectos/.test(document.getElementById("ctam").textContent));
  ok(true, "contraseña mala rechazada");
  await B.fill("[name=clave]", "clave123");
  await Promise.all([B.waitForNavigation(), B.click("#ctaf [type=submit]")]); await listo(B);
  ok(await B.evaluate(() => LYA.S.a["bear-a1:q1"] === 2 && LYA.S.a["bear-a2:q0"] === 3 && LYA.S.dict.length === 1), "otro dispositivo ve el mismo progreso (también el último cambio)");
  ok(await B.evaluate(() => !!LYA.S.g), "puntos/racha (S.g) presentes");
  /* 4. el usuario ya existe */
  const C = await nueva(); await C.goto(URL); await listo(C); await C.click("#cta"); await C.click("#ctac");
  await C.fill("[name=usuario]", user); await C.fill("[name=clave]", "otra123"); await C.fill("[name=clave2]", "otra123"); await C.click("#ctaf [type=submit]");
  await C.waitForFunction(() => /ya existe/.test(document.getElementById("ctam").textContent)); ok(true, "usuario repetido rechazado");
  /* 5. copia: exportar en B, importar en C (invitado) */
  await B.click("#cta"); await B.click("#ctab2"); const copia = await B.inputValue("#ctat");
  ok(copia.includes('"bear-a2:q0":3'), "exportar copia");
  await C.keyboard.press("Escape"); await C.click("#cta"); await C.click("#ctab2"); await C.fill("#ctai", copia);
  await C.click("#ctaok"); await Promise.all([C.waitForNavigation(), C.click("#ctaok")]); await listo(C);
  ok(await C.evaluate(() => LYA.S.a["bear-a2:q0"] === 3), "importar copia en modo invitado");
  /* 6. salir */
  await B.keyboard.press("Escape"); await B.click("#cta"); await Promise.all([B.waitForNavigation(), B.click("#ctas")]); await listo(B);
  ok((await B.textContent("#cta")).includes("Entrar") && await B.evaluate(() => !LYA.S.a["bear-a2:q0"]), "al salir vuelve a invitado sin el progreso de la cuenta");
  /* 7. sesión de A sigue y recarga bien */
  await A.reload(); await listo(A); ok((await A.textContent("#cta")).includes(user), "A sigue con su sesión tras recargar");
  /* 8. sin servidor */
  if (URL_SIN) { const D = await nueva(); await D.goto(URL_SIN); await listo(D); await D.waitForTimeout(500);
    ok((await D.textContent("#cta")).includes("💾"), "sin servidor: solo botón de copia"); await D.click("#cta"); ok(await D.isVisible("#ctat"), "sin servidor: abre la copia"); }
  console.log("ERRORES:", ERR.length ? ERR.join(" | ") : "ninguno");
  await b.close(); process.exit(ERR.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
