/* Flashcards (web/fichas/): crear con dibujo, emoji, enlace, Wikimedia (simulada) y Pixabay (sin clave / simulada),
   repaso espaciado, juego «¿Qué es?», juego «Dibújalo», XP, y con cuenta: el dibujo se sube aparte (/api/dibujos)
   y otro dispositivo lo ve. El progreso (S) no lleva la imagen.
   Uso: NODE_PATH=/opt/node22/lib/node_modules node prueba-fichas.js http://localhost:8790/index.html [carpeta-capturas] */
const { chromium } = require("playwright");
const URL = process.argv[2], OUT = process.argv[3] || "/tmp";
const ERR = [], ok = (c, m) => { console.log((c ? "OK  " : "MAL ") + m); if (!c) ERR.push(m); };
const user = "fichas" + Date.now() % 100000;
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
(async () => {
  const b = await chromium.launch();
  const nueva = async (w = 420) => { const c = await b.newContext({ viewport: { width: w, height: 860 } }); const p = await c.newPage();
    p.on("pageerror", e => ERR.push("JS: " + e.message));
    p.on("response", r => { if (r.status() >= 400 && !/\/api\/(estado|votos|dibujos)/.test(r.url())) ERR.push(r.status() + " " + r.url()); });
    p.on("dialog", d => d.accept());
    /* internet simulado: imágenes https y la API de Wikimedia */
    await p.route("https://img.example.org/**", r => r.fulfill({ status: 200, contentType: "image/png", body: PNG }));
    await p.route("https://commons.wikimedia.org/w/api.php**", r => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ query: { pages: { 1: { index: 1, title: "File:Bear.jpg", imageinfo: [{ thumburl: "https://img.example.org/bear.png", user: "Ana", mime: "image/jpeg" }] }, 2: { index: 2, title: "File:Naked bear.jpg", imageinfo: [{ thumburl: "https://img.example.org/x.png", user: "X", mime: "image/jpeg" }] } } } }) }));
    return p; };
  const listo = p => p.waitForFunction(() => window.LYA && window.LYA.S && window.LYAFichas && document.getElementById("cta"));
  const dibujar = async p => { const c = await p.$("#fccv"); await c.scrollIntoViewIfNeeded(); const r = await c.boundingBox();
    const y0 = r.y + r.height / 2 - 40; await p.mouse.move(r.x + 30, y0); await p.mouse.down(); for (let i = 1; i <= 12; i++) await p.mouse.move(r.x + 30 + i * 18, y0 + (i % 3) * 40); await p.mouse.up(); };
  const xpEv = p => p.evaluate(() => { window.__xp = []; addEventListener("lya:xp", e => window.__xp.push(e.detail)); });

  const A = await nueva();
  await A.goto(URL); await listo(A); await xpEv(A);
  /* palabras en el diccionario */
  await A.evaluate(() => { const S = LYA.S; S.dict.push(
    { w: "oso", k: "oso", r: "bear-a1", l: "es", t: "bear", tr: { en: "bear" }, d: "", miss: false },
    { w: "árbol", k: "árbol", r: "bear-a1", l: "es", t: "tree", tr: { en: "tree" }, d: "", miss: false },
    { w: "miel", k: "miel", r: "bear-a1", l: "es", t: "honey", tr: { en: "honey" }, d: "", miss: false },
    { w: "río", k: "río", r: "bear-a1", l: "es", t: "river", tr: { en: "river" }, d: "", miss: false },
    { w: "pez", k: "pez", r: "bear-a1", l: "es", t: "fish", tr: { en: "fish" }, d: "", miss: false }); LYA.save(); });
  await A.goto(URL.replace(/#.*/, "") + "#diccionario"); await A.waitForSelector(".fcban");
  ok(await A.isVisible(".fcban"), "diccionario: enlace «Mis flashcards»");
  ok((await A.$$(".words .fcwb")).length === 5, "diccionario: botón de flashcard en cada palabra");
  /* 1. dibujo desde el diccionario */
  await A.click('.fcwb[data-k="oso"]'); await A.waitForSelector("#fcov .fcimgbtn");
  ok(/Crear/.test(await A.textContent("#fcov")), "el botón abre la carta en grande con «Crear su flashcard»");
  await A.click("#fcov .fcimgbtn"); await A.waitForSelector("#fccv");
  ok(A.url().endsWith("#fichas"), "tocar la imagen abre el editor (#fichas)");
  await A.click('[data-fca="save"]'); ok(await A.isVisible(".fcmsg"), "sin dibujo: pide hacer una imagen");
  await dibujar(A); await A.click('[data-fcc="#e23b3b"]'); await dibujar(A); await A.click('[data-fcd="undo"]');
  await A.fill("#fcnote", "Vive en el bosque"); await A.screenshot({ path: OUT + "/fichas-dibujar.png" });
  await A.click('[data-fca="save"]');
  await A.waitForSelector("#fcov .fcbigc");
  ok(A.url().endsWith("#diccionario"), "al guardar vuelve al diccionario con la carta en grande");
  await A.keyboard.press("Escape"); await A.goto(URL.replace(/#.*/, "") + "#fichas"); await A.waitForSelector("#fcalb");
  const d1 = await A.evaluate(() => { const c = Object.values(LYA.S.fc.c)[0], m = JSON.parse(localStorage.getItem("lyaDibujos") || "{}"); return { c, len: (m[c.im.id] || "").length, s: JSON.stringify(LYA.S).length }; });
  ok(d1.c.im.t === "draw" && d1.c.n === "Vive en el bosque" && d1.len > 200, `dibujo guardado aparte (${(d1.len / 1024).toFixed(1)} KB) con su nota`);
  ok(d1.len < 30000 && !JSON.stringify(await A.evaluate(() => LYA.S.fc)).includes("data:image"), "el progreso no lleva la imagen (solo su id)");
  /* 2. emoji desde «Crear flashcards» */
  await A.click('.fcchip[data-k="miel"]'); await A.click('[data-fca="tab"][data-v="emoji"]'); await A.click('[data-fca="emo"][data-v="🍯"]').catch(async () => { await A.fill("#fcemoin", "🍯"); });
  if (!(await A.$('[data-fca="emo"][data-v="🍯"]'))) await A.fill("#fcemoin", "🍯");
  await A.click('[data-fca="save"]'); await A.waitForSelector("#fcalb");
  ok(await A.evaluate(() => Object.values(LYA.S.fc.c).some(c => c.k === "miel" && c.im.t === "emoji" && c.im.v === "🍯")), "tarjeta con emoji");
  /* 3. enlace pegado */
  await A.click('.fcchip[data-k="árbol"]'); await A.click('[data-fca="tab"][data-v="web"]');
  await A.fill("#fclink", "javascript:alert(1)"); await A.click('[data-fcform="link"] button'); await A.waitForSelector(".fcmsg");
  ok(true, "enlace no válido rechazado");
  await A.fill("#fclink", "https://img.example.org/arbol.png"); await A.click('[data-fcform="link"] button'); await A.waitForSelector('.fcprev img');
  await A.click('[data-fca="save"]'); await A.waitForSelector("#fcalb");
  ok(await A.evaluate(() => Object.values(LYA.S.fc.c).some(c => c.k === "árbol" && c.im.t === "url" && c.im.v === "https://img.example.org/arbol.png")), "tarjeta con enlace (solo se guarda la dirección)");
  /* 4. Wikimedia (simulada) con filtro */
  await A.click('.fcchip[data-k="río"]'); await A.click('[data-fca="tab"][data-v="web"]'); await A.click('[data-fca="web"][data-v="wiki"]');
  await A.fill("#fcq", "bear"); await A.click('[data-fcform="search"] button'); await A.waitForSelector(".fcres button");
  ok((await A.$$(".fcres button")).length === 1, "Wikimedia: resultados (y filtra los inapropiados)");
  await A.click(".fcres button"); await A.screenshot({ path: OUT + "/fichas-wikimedia.png" });
  await A.click('[data-fca="save"]'); await A.waitForSelector("#fcalb");
  ok(await A.evaluate(() => Object.values(LYA.S.fc.c).some(c => c.k === "río" && c.im.t === "wiki" && c.im.by === "Ana")), "tarjeta con imagen de Wikimedia y autor");
  /* 5. Pixabay sin clave → aviso; con clave simulada → resultados */
  await A.click('.fcchip[data-k="pez"]'); await A.click('[data-fca="tab"][data-v="web"]'); await A.click('[data-fca="web"][data-v="pix"]');
  await A.click('[data-fcform="search"] button'); await A.waitForSelector(".fcmsg");
  const pmsg = await A.textContent(".fcmsg"); ok(/Pixabay/.test(pmsg), "Pixabay sin clave: " + pmsg.trim());
  await A.route("**/api/imagenes?**", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ imgs: [{ id: 77, u: "https://img.example.org/pez.png", by: "Leo" }] }) }));
  await A.click('[data-fcform="search"] button'); await A.waitForSelector(".fcres button"); await A.click(".fcres button");
  await A.click('[data-fca="save"]'); await A.waitForSelector("#fcalb");
  ok(await A.evaluate(() => Object.values(LYA.S.fc.c).some(c => c.k === "pez" && c.im.t === "pix" && c.im.id === "77")), "tarjeta con imagen de Pixabay");
  await A.screenshot({ path: OUT + "/fichas-lista.png", fullPage: true });
  ok(await A.evaluate(() => window.__xp.filter(x => x.src === "fichas-crear").length === 5), "XP al crear cada tarjeta (una vez)");
  /* 6. repaso espaciado */
  await A.click('[data-fca="play"]'); await A.click('[data-fca="rev"]'); await A.waitForSelector(".fcbig");
  await A.screenshot({ path: OUT + "/fichas-repaso.png" });
  await A.click('[data-fca="flip"]'); await A.click('[data-fca="ans"][data-v="0"]');
  for (let i = 0; i < 4; i++) { await A.click('[data-fca="flip"]'); await A.click('[data-fca="ans"][data-v="1"]'); }
  await A.click('[data-fca="flip"]'); await A.screenshot({ path: OUT + "/fichas-repaso-vuelta.png" }); await A.click('[data-fca="ans"][data-v="1"]');
  ok(/4 de 5/.test(await A.textContent(".qc")), "repaso: la fallada vuelve al final y cuenta 4 de 5");
  const bx = await A.evaluate(() => Object.values(LYA.S.fc.c).map(c => [c.b, c.due - Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000)]));
  ok(bx.filter(([b, d]) => b === 1 && d === 1).length === 4 && bx.filter(([b, d]) => b === 0 && d === 0).length === 1, "cajas: 4 vuelven mañana, la fallada sigue para hoy");
  /* 7. ¿Qué es? */
  await A.click('[data-fca="home"]'); await A.click('[data-fca="play"]'); await A.click('[data-fca="what"]'); await A.waitForSelector("#fcans");
  const n = await A.evaluate(() => LYAFichas._V().q.length); let bien = 0;
  for (let i = 0; i < n; i++) {
    const w = await A.evaluate(() => { const V = LYAFichas._V(); return LYA.S.fc.c[V.q[V.i]].w; });
    await A.fill("#fcans", i === 0 ? w.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase() : i === 1 ? "nada" : w); await A.press("#fcans", "Enter");
    await A.waitForSelector('[data-fca="wnext"]'); if (i === 0) await A.screenshot({ path: OUT + "/fichas-quees.png" });
    if (!(await A.$(".fcmsg.bad"))) bien++; await A.click('[data-fca="wnext"]');
  }
  ok(bien === n - 1 && new RegExp(`${n - 1} de ${n}`).test(await A.textContent(".qc")), `¿Qué es?: ${bien} de ${n} (sin acentos y en mayúsculas vale)`);
  /* 8. Dibújalo: las 5 palabras ya tienen imagen → al final pregunta con cuál quedarse */
  await A.click('[data-fca="home"]'); await A.click('[data-fca="play"]'); await A.click('[data-fca="draw"]'); await A.waitForSelector("#fccv");
  const q8 = await A.evaluate(() => LYAFichas._V().q), w0 = q8[0];
  await A.click('[data-fca="dkeep"]'); ok(await A.isVisible(".fcmsg"), "Dibújalo: sin dibujo no guarda");
  await dibujar(A); await A.screenshot({ path: OUT + "/fichas-dibujalo.png" }); await A.click('[data-fca="dkeep"]');
  await dibujar(A); await A.click('[data-fca="dkeep"]');
  for (let i = 2; i < q8.length; i++) await A.click('[data-fca="dskip"]');
  await A.waitForSelector(".fccmp"); await A.screenshot({ path: OUT + "/fichas-antigua-nueva.png" });
  const im0 = await A.evaluate(k => JSON.stringify(Object.values(LYA.S.fc.c).find(c => c.k === k).im), q8[1]);
  await A.click('[data-fca="keep"][data-v="new"]'); await A.waitForSelector(".fccmp"); await A.click('[data-fca="keep"][data-v="old"]'); await A.waitForSelector(".qc");
  ok(await A.evaluate(k => Object.values(LYA.S.fc.c).find(c => c.k === k)?.im.t === "draw", w0), `Dibújalo: «la nueva» → el dibujo de «${w0}» queda en su tarjeta`);
  ok(await A.evaluate(([k, im]) => JSON.stringify(Object.values(LYA.S.fc.c).find(c => c.k === k).im) === im, [q8[1], im0]), `Dibújalo: «la que tenía» → «${q8[1]}» no cambia`);
  ok(await A.evaluate(() => window.__xp.some(x => x.src === "fichas-dibujo") && window.__xp.some(x => x.src === "fichas" && x.ok === true) && window.__xp.some(x => x.src === "fichas-que")), "eventos de XP de repaso y juegos");
  /* 9. recargar: todo sigue */
  await A.reload(); await listo(A); await A.waitForSelector("#fcalb");
  ok((await A.$$(".fcslot img.fcdraw")).length >= 1 && (await A.$$(".fcslot:not(.fcempty)")).length === 5, "tras recargar siguen las 5 tarjetas y los dibujos");
  /* 9b. álbum: 4 por página, 8 a la vista, pasar página */
  await A.evaluate(() => { const S = LYA.S; for (let i = 0; i < 7; i++) S.dict.push({ w: "palabra" + i, k: "palabra" + i, r: "bear-a1", l: "es", t: "word" + i, tr: { en: "word" + i }, d: "", miss: false }); LYA.save(); });
  await A.goto(URL.replace(/#.*/, "") + "#diccionario"); await A.goto(URL.replace(/#.*/, "") + "#fichas"); await A.waitForSelector("#fcalb");
  for (let i = 0; i < 7; i++) { await A.click(`.fcchip[data-k="palabra${i}"]`); await A.click('[data-fca="tab"][data-v="emoji"]'); await A.click('.fcemos button >> nth=' + (i + 3)); await A.click('[data-fca="save"]'); await A.waitForSelector("#fcalb"); }
  await A.click('.fcdots button >> nth=0'); await A.waitForTimeout(450);
  ok((await A.$$(".fcpage")).length === 2 && (await A.$$(".fcpage.l .fcslot")).length === 4 && (await A.$$(".fcslot:not(.fcempty)")).length === 8, "álbum: 2 páginas abiertas, 4 cartas por página, 8 a la vista");
  await A.screenshot({ path: OUT + "/fichas-album-movil.png", fullPage: true });
  await A.click('.fcturn.next'); await A.waitForTimeout(450);
  ok((await A.$$(".fcslot:not(.fcempty)")).length === 4 && /3/.test(await A.textContent(".fcpage.l .fcpn")), "álbum: flecha → páginas 3-4 (4 cartas)");
  await A.keyboard.press("ArrowLeft"); await A.waitForTimeout(450); ok((await A.$$(".fcslot:not(.fcempty)")).length === 8, "álbum: teclado ← vuelve");
  await A.$eval("#fcalb", e => e.scrollIntoView({ block: "center" })); const al = await (await A.$("#fcalb")).boundingBox();
  await A.mouse.move(al.x + al.width - 60, 430); await A.mouse.down(); await A.mouse.move(al.x + 60, 440, { steps: 6 }); await A.mouse.up(); await A.waitForTimeout(450);
  ok((await A.$$(".fcslot:not(.fcempty)")).length === 4, "álbum: deslizar pasa página"); await A.click('.fcdots button >> nth=0'); await A.waitForTimeout(450);
  /* carta en grande desde el álbum: vuelta, frase de la lectura, cuánto te la sabes, cambiar imagen */
  await A.click('.fcslot:not(.fcempty) >> nth=0'); await A.waitForSelector("#fcov .fcbigc");
  ok(await A.isVisible("#fcov .fcimgbtn"), "carta en grande: delante la imagen (tocar para cambiarla)");
  await A.screenshot({ path: OUT + "/fichas-grande.png" });
  await A.click('#fcov [data-fca="bflip"]'); await A.waitForSelector("#fcov .fcknow");
  await A.waitForTimeout(800); await A.screenshot({ path: OUT + "/fichas-grande-detras.png" });
  ok(await A.isVisible("#fcov .fctr") && await A.isVisible("#fcov .fcknow"), "detrás: traducción y «cuánto te la sabes»");
  console.log("   frase de la lectura:", (await A.$("#fcov .fcsent")) ? (await A.textContent("#fcov .fcsent")).slice(0, 90) : "(no encontrada)");
  await A.click('#fcov [data-fca="bnav"][data-v="1"]'); ok(!(await A.$("#fcov .fcknow")), "› pasa a la siguiente carta (por delante)");
  await A.keyboard.press("Escape"); ok(!(await A.$("#fcov")), "Esc cierra la carta");
  await A.click('.fcslot:not(.fcempty) >> nth=1'); await A.click('#fcov .fcimgbtn'); await A.waitForSelector(".fctabs");
  ok(true, "tocar la imagen de la carta abre el editor de imagen");
  await A.click('[data-fca="tab"][data-v="emoji"]'); await A.click('.fcemos button >> nth=20'); await A.click('[data-fca="save"]'); await A.waitForSelector("#fcov .fcbigc");
  ok(true, "al guardar vuelve a la carta en grande");
  await A.keyboard.press("Escape");
  /* diccionario: tocar una palabra abre su carta */
  await A.goto(URL.replace(/#.*/, "") + "#diccionario"); await A.waitForSelector(".words li");
  await A.click('.words li:has(.fcwb[data-k="oso"]) b'); await A.waitForSelector("#fcov .fcbigc");
  await A.click('#fcov [data-fca="bflip"]'); await A.waitForTimeout(800);
  ok(await A.isVisible('#fcov [data-fca="brev"]'), "diccionario: tocar la palabra abre su flashcard con «Repasar esta palabra»");
  await A.screenshot({ path: OUT + "/fichas-desde-diccionario.png" });
  await A.click('#fcov [data-fca="brev"]'); await A.waitForSelector('[data-fca="flip"]'); await A.click('[data-fca="flip"]'); await A.click('[data-fca="ans"][data-v="1"]');
  ok(/1 de 1/.test(await A.textContent(".qc")), "«Repasar esta palabra» repasa solo esa");
  await A.click('.qc [data-fca="home"] >> nth=0'); await A.waitForSelector("#fcalb");
  /* 10. con cuenta: el dibujo sube aparte y otro aparato lo ve */
  const hay = await A.evaluate(() => fetch("api/estado").then(r => r.ok).catch(() => false));
  if (hay) {
    await A.click("#cta"); await A.click("#ctac");
    await A.fill("[name=usuario]", user); await A.fill("[name=clave]", "clave123"); await A.fill("[name=clave2]", "clave123");
    await Promise.all([A.waitForNavigation(), A.click("#ctaf [type=submit]")]); await listo(A);
    await A.goto(URL.replace(/#.*/, "") + "#fichas"); await A.waitForSelector("#fcalb"); await A.waitForFunction(u => ((JSON.parse(localStorage.getItem("lyaDibujosSub") || "{}")[u]) || []).length >= 2, user, { timeout: 15000 }).catch(() => {});
    ok(await A.evaluate(u => ((JSON.parse(localStorage.getItem("lyaDibujosSub") || "{}")[u]) || []).length >= 2, user), "con cuenta: los dibujos de antes se suben a la nube");
    const B = await nueva(1200); await B.goto(URL); await listo(B);
    await B.click("#cta"); await B.fill("[name=usuario]", user); await B.fill("[name=clave]", "clave123");
    await Promise.all([B.waitForNavigation(), B.click("#ctaf [type=submit]")]); await listo(B);
    await B.goto(URL.replace(/#.*/, "") + "#fichas"); await B.waitForSelector("#fcalb");
    await B.waitForFunction(() => document.querySelectorAll(".fcslot img.fcdraw").length >= 2, null, { timeout: 8000 }).catch(() => {});
    ok((await B.$$(".fcslot img.fcdraw")).length >= 2, "otro aparato con la misma cuenta ve las tarjetas y descarga los dibujos");
    await B.screenshot({ path: OUT + "/fichas-escritorio.png", fullPage: true });
    const st = await B.evaluate(() => fetch("api/dibujos?ids=zz", { headers: { Authorization: "Bearer " + JSON.parse(localStorage.getItem("lyaCuenta")).token } }).then(r => r.status));
    ok(st === 200, "api/dibujos responde con sesión");
    const sin = await B.evaluate(() => fetch("api/dibujos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: "abcdef12", img: "data:image/png;base64,AA" }) }).then(r => r.status));
    ok(sin === 401, "api/dibujos sin sesión: rechazado");
    const big = await B.evaluate(() => fetch("api/dibujos", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + JSON.parse(localStorage.getItem("lyaCuenta")).token }, body: JSON.stringify({ id: "abcdef12", img: "data:image/png;base64," + "A".repeat(50000) }) }).then(r => r.status));
    ok(big === 400, "api/dibujos: dibujo demasiado grande rechazado");
  } else console.log("(sin servidor: no se prueba la cuenta)");
  console.log("ERRORES:", ERR.length ? ERR.join(" | ") : "ninguno");
  await b.close(); process.exit(ERR.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
