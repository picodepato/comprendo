/* Canciones de YouTube (web/canciones/): enlace → vídeo con letra y huecos, el vídeo se para en cada hueco,
   acertar / fallar / pista / ver palabra, terminar (estrellas, XP, S.g.cn), canciones recientes, letra pegada sin vídeo,
   móvil, y deberes del profe (mandar canción → el alumno la ve y la hace → el profe ve que está hecha → quitarla la borra).
   YouTube no se usa de verdad: se simulan la API del reproductor y la respuesta de api/canciones?v=…
   Uso: sh vercel/montar.sh /tmp/site && node qa/servidor-prueba.mjs /tmp/site 8790
        NODE_PATH=/opt/node22/lib/node_modules node qa/prueba-canciones.js http://localhost:8790/index.html [carpeta-capturas] */
const { chromium } = require("playwright");
const URL = process.argv[2] || "http://localhost:8790/index.html", OUT = process.argv[3] || "";
const ERR = [], ok = (c, m) => { console.log((c ? "OK  " : "MAL ") + m); if (!c) ERR.push(m); };
const V = "AbCdEfGhIjK";
const LINEAS = [["hola amigo cómo estás hoy", 1], ["la música suena muy bonita", 3], ["vamos todos juntos a cantar", 5], ["el verano llega con alegría", 7], ["bailamos bajo la luna llena", 9], ["mañana volveremos a empezar", 11]].map(([x, t]) => ({t, d: 2, x}));
const FAKE_YT = `window.YT = {Player: class {
  constructor(id, o) { this.o = o; this.t = (o.playerVars && o.playerVars.start) || 0; this.s = -1; window.__yt = this;
    const f = document.createElement("iframe"); f.id = id; document.getElementById(id).replaceWith(f);
    setTimeout(() => o.events.onReady && o.events.onReady({target: this}), 30);
    this.iv = setInterval(() => { if (this.s === 1) this.t += 0.1 * (window.__vel || 3); }, 100); }
  getCurrentTime() { return this.t } getPlayerState() { return this.s }
  playVideo() { this.s = 1; this.o.events.onStateChange && this.o.events.onStateChange({data: 1}); }
  pauseVideo() { this.s = 2; this.o.events.onStateChange && this.o.events.onStateChange({data: 2}); }
  seekTo(t) { this.t = t } destroy() { clearInterval(this.iv) } unloadModule() {} }};
setTimeout(() => window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady(), 20);`;
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
  const nueva = async (w = 1280, h = 900) => {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.route("https://www.youtube.com/iframe_api", r => r.fulfill({ contentType: "text/javascript", body: FAKE_YT }));
    await ctx.route("https://i.ytimg.com/**", r => r.fulfill({ status: 404, body: "" }));
    await ctx.route(/\/api\/canciones\?v=/, r => r.fulfill({ contentType: "application/json", body: JSON.stringify({ v: V, titulo: "Canción de prueba", idioma: "es", auto: true, lineas: LINEAS }) }));
    const p = await ctx.newPage();
    p.on("pageerror", e => ERR.push("JS: " + e.message + " @ " + String(e.stack).split("\n").slice(1, 3).join(" ")));
    p.on("response", r => { if (r.status() >= 400 && !r.url().includes("/api/") && !r.url().includes("ytimg")) ERR.push(r.status() + " " + r.url()); });
    await p.addInitScript(() => { window.__xp = []; addEventListener("lya:xp", e => window.__xp.push(e.detail)); });
    return p;
  };
  const listo = p => p.waitForFunction(() => window.LYA && window.LYA.S && window.LYACanciones);
  const M = p => p.evaluate(() => { const m = LYACanciones._test.M; return m && {gaps: m.gaps.map(g => ({w: g.w, st: g.st, li: g.li})), espera: m.espera, fin: m.fin}; });
  const pendiente = async p => (await M(p)).gaps.findIndex(g => !g.st);
  const pausadoEn = p => p.waitForFunction(() => { const m = LYACanciones._test.M; return m && m.espera >= 0 && window.__yt && window.__yt.s === 2; }, null, { timeout: 15000 });

  /* ---------- invitado, ordenador ---------- */
  const P = await nueva();
  await P.goto(URL + "#canciones"); await listo(P); await P.waitForSelector("#cnform");
  ok(/Canciones/.test(await P.textContent("#tabs")), "pestaña «Canciones» en el menú");
  ok(await P.getAttribute('#tabs a[href="#canciones"]', "aria-current") === "page", "la pestaña se marca");
  await P.fill("#cnurl", "no es un enlace"); await P.click("#cnform [type=submit]");
  ok(/no parece de YouTube/.test(await P.textContent(".cnerr")), "enlace malo: avisa");
  await P.click('[data-cn="pref"][data-n="2"]');
  await P.fill("#cnurl", `https://www.youtube.com/watch?v=${V}&t=10s`); await P.click("#cnform [type=submit]");
  await P.waitForSelector(".cnplay"); ok(P.url().endsWith("#canciones-" + V), "el enlace lleva a #canciones-<vídeo>");
  await P.waitForSelector(".cnvid iframe");
  const m0 = await M(P);
  ok(m0.gaps.length === 6 && (await P.$$(".cngap")).length === 6, `nivel normal: 1 hueco por frase (${m0.gaps.length})`);
  ok(/automáticos/.test(await P.textContent(".cnhead")), "avisa de subtítulos automáticos");
  if (OUT) await P.screenshot({ path: OUT + "/canciones-escritorio.png" });
  await P.click('[data-cn="play"]'); await pausadoEn(P);
  let m = await M(P); ok(m.espera === 0, "el vídeo se para al final de la 1.ª frase");
  ok(await P.evaluate(() => document.activeElement.classList.contains("cngap") && document.activeElement.classList.contains("now")), "el hueco que toca tiene el foco");
  ok(/Escribe/.test(await P.textContent("#cnmsg")), "mensaje «Escribe la palabra que falta»");
  ok(await P.$eval('.cnlyr li[data-li="0"]', e => e.classList.contains("cur")), "la frase que suena se resalta");
  /* sin acentos también vale */
  const w0 = m.gaps[0].w.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
  await P.keyboard.type(w0);
  await P.waitForSelector('.cnw.ok[data-gi="0"]'); ok(true, `acierto (escrito «${w0}»)`);
  await P.waitForFunction(() => window.__yt.s === 1, null, { timeout: 3000 }); ok(true, "tras acertar, el vídeo sigue solo");
  /* 2.º hueco: fallo, pistas, repetir y ver palabra */
  await pausadoEn(P); m = await M(P); ok(m.espera === 1, "se para en el 2.º hueco");
  await P.keyboard.type("zzz"); await P.keyboard.press("Enter");
  ok(await P.$eval('.cngap[data-gi="1"]', e => e.classList.contains("bad")) && /Casi/.test(await P.textContent("#cnmsg")), "fallo: tiembla y dice «Casi»");
  await P.click('[data-cn="pista"]');
  ok((await P.getAttribute('.cngap[data-gi="1"]', "placeholder")) === m.gaps[1].w.slice(0, 1) + "…", "💡 enseña la primera letra");
  const t1 = await P.evaluate(() => window.__yt.t);
  await P.click('[data-cn="rep"]'); await wait(150);
  ok(await P.evaluate(t => window.__yt.t < t && window.__yt.s === 1, t1), "🔁 vuelve al principio de la frase");
  await pausadoEn(P); ok((await M(P)).espera === 1, "…y se vuelve a parar al final");
  await P.click('[data-cn="ver"]'); await P.waitForSelector('.cnw.skip[data-gi="1"]'); ok(true, "👀 enseña la palabra");
  await P.waitForFunction(() => window.__yt.s === 1, null, { timeout: 3000 }); ok(true, "y el vídeo sigue");
  /* adelantarse: escribir huecos que aún no han sonado */
  m = await M(P);
  for (let i = 2; i < 6; i++) { await P.fill(`.cngap[data-gi="${i}"]`, m.gaps[i].w); }
  await P.waitForSelector(".cnres"); ok(true, "al completar todo sale el resultado");
  const res = await P.textContent(".cnres");
  ok(/★★☆/.test(res) && /5 de 6/.test(res), "resultado: 5 de 6 y 2 estrellas (" + res.replace(/\s+/g, " ").slice(0, 60) + ")");
  ok(await P.evaluate(() => window.__yt.s === 2), "al terminar se para el vídeo");
  const cn = await P.evaluate(v => LYA.S.g.cn && LYA.S.g.cn["yt-" + v], V);
  ok(cn && cn.best === 2 && cn.n === 1 && cn.v === V && cn.t === "Canción de prueba", "se guarda en S.g.cn (estrellas, veces, título)");
  const xs = await P.evaluate(() => window.__xp.filter(x => x.juego === "cancion"));
  ok(xs.filter(x => x.ok === true).length === 5 && xs.filter(x => x.ok === false).length === 1 && xs.some(x => x.n === 10), "eventos lya:xp: 5 aciertos, 1 fallo y 10 XP al final");
  /* otra vez / cambiar de nivel */
  await P.click('[data-cn="otra"]'); await P.waitForSelector(".cngap"); ok(!(await P.$(".cnres")) && (await P.$$(".cngap")).length === 6, "«Otra vez» vuelve a empezar");
  await P.click('[data-cn="nivel"][data-n="3"]'); await P.waitForSelector('.cnlv.on[data-n="3"]');
  ok((await M(P)).gaps.length === 12 && await P.evaluate(() => LYA.S.cnNivel === 3), "nivel difícil: 2 huecos por frase y se recuerda");
  await P.click('[data-cn="nivel"][data-n="1"]'); await P.waitForSelector('.cnlv.on[data-n="1"]');
  ok((await M(P)).gaps.length === 3, "nivel fácil: 1 hueco cada 2 frases");
  /* terminar antes de tiempo */
  await P.click('[data-cn="fin"]'); ok(/Te faltan 3/.test(await P.textContent('[data-cn="fin2"]')), "«Terminar» con huecos pide confirmar");
  await P.click('[data-cn="fin2"]'); await P.waitForSelector(".cnres"); ok(/☆☆☆/.test(await P.textContent(".cnres")), "terminar sin hacer nada: 0 estrellas");
  ok(await P.evaluate(v => LYA.S.g.cn["yt-" + v].best === 2 && LYA.S.g.cn["yt-" + v].n === 2, V), "el récord se conserva");
  /* inicio: canciones recientes */
  await P.click(".cnback"); await P.waitForSelector("#cnform");
  ok(await P.$(`.cnrec a[href="#canciones-${V}"]`) !== null, "«Tus canciones» muestra la canción");
  ok(!(await P.$(".cnvid")) && await P.evaluate(() => !window.__yt || window.__yt.iv), "al salir se quita el vídeo");
  /* letra pegada, sin vídeo */
  await P.fill("#cnurl", ""); await P.click(".cnpaste:not(.cnsearch) summary");
  await P.fill("#cnpform [name=letra]", "uno"); await P.click("#cnpform [type=submit]");
  ok(!(await P.isHidden("#cnperr")), "letra de una línea: pide más");
  await P.fill("#cnpform [name=titulo]", "Mi poema");
  await P.fill("#cnpform [name=letra]", "Caminante no hay camino\nse hace camino al andar\n\nal andar se hace camino\ny al volver la vista atrás");
  await P.click("#cnpform [type=submit]"); await P.waitForSelector(".cnplay");
  ok(P.url().endsWith("#canciones-texto") && !(await P.$(".cnvid")) && !(await P.$('[data-cn="play"]')), "letra pegada: sin vídeo ni botón de play");
  m = await M(P); ok(m.gaps.length >= 1, `letra pegada: ${m.gaps.length} huecos`);
  for (const [i, g] of m.gaps.entries()) await P.fill(`.cngap[data-gi="${i}"]`, g.w);
  await P.waitForSelector(".cnres"); ok(/★★★/.test(await P.textContent(".cnres")), "letra pegada perfecta: 3 estrellas");
  /* LRC y SRT */
  const lrc = await P.evaluate(() => LYACanciones._test.parseLetra("[00:01.50]hola\n[00:04.00]adiós amigo\n[00:07]fin"));
  ok(lrc.length === 3 && lrc[0].t === 1.5 && lrc[0].d === 2.5, "lee letras LRC con tiempos");
  const srt = await P.evaluate(() => LYACanciones._test.parseLetra("1\n00:00:01,000 --> 00:00:03,500\nprimera línea\n\n2\n00:00:04,000 --> 00:00:06,000\n<i>segunda</i> línea"));
  ok(srt.length === 2 && srt[0].d === 2.5 && srt[1].x === "segunda línea", "lee subtítulos SRT");
  ok(await P.evaluate(() => ["https://youtu.be/AbCdEfGhIjK?si=x", "https://m.youtube.com/watch?feature=share&v=AbCdEfGhIjK", "https://youtube.com/shorts/AbCdEfGhIjK", "AbCdEfGhIjK"].every(u => LYACanciones._test.idVideo(u) === "AbCdEfGhIjK")), "entiende enlaces youtu.be, m.youtube, shorts");

  /* ---------- YouTube no da subtítulos: letra de LRCLIB (sincronizada), ajustar, «¿No es esta?» y buscar por nombre ---------- */
  const V2 = "LrCliBxxxxx", LR = LINEAS.map(l => ({...l, t: l.t + 1}));
  await P.route(/\/api\/canciones\?v=LrCliBxxxxx/, r => r.fulfill({ contentType: "application/json", body: JSON.stringify({ v: V2, titulo: "Grupo - Canción (Official Video)", idioma: null, auto: false, origen: "lrclib", lrc: {id: 7, nombre: "Grupo - Canción", dur: 200, sincronizada: true}, lineas: LR }) }));
  await P.route(/\/api\/canciones\?q=/, r => r.fulfill({ contentType: "application/json", body: JSON.stringify({ resultados: [{id: 8, titulo: "Grupo - Canción buena", dur: 185, sincronizada: true, lineas: LINEAS}, {id: 9, titulo: "Otro - Sin tiempos", dur: 0, sincronizada: false, lineas: LINEAS.map(l => ({...l, t: 0, d: 0}))}] }) }));
  await P.goto(URL + "#canciones-" + V2); await P.waitForSelector(".cnplay");
  ok(/Letra encontrada: Grupo - Canción/.test(await P.textContent(".cnhead")) && /LRCLIB/.test(await P.textContent(".cnsrc")), "sin subtítulos: usa la letra sincronizada de LRCLIB y lo dice");
  await P.click('[data-cn="aj"][data-d="-0.5"]'); await P.click('[data-cn="aj"][data-d="-0.5"]');
  ok((await P.textContent("#cnadjv")).includes("-1.0") && await P.evaluate(() => LYACanciones._test.M.lineas[0].t === 1 && LYACanciones._test.M.crudas[0].t === 1), "«Antes» adelanta la letra 0,5 s cada vez");
  await P.click('[data-cn="play"]'); await pausadoEn(P); ok((await M(P)).espera === 0, "con la letra ajustada se para en el 1.er hueco");
  await P.click('[data-cn="noes"]'); await P.waitForSelector("#cnsform");
  ok(await P.$eval(".cnsearch", d => d.open) && (await P.inputValue("#cnsform [name=q]")) === "Grupo - Canción", "«¿No es esta?» abre la búsqueda con el título del vídeo");
  ok(await P.evaluate(() => !document.querySelector(".cnvid")), "y quita el vídeo");
  await P.fill("#cnsform [name=q]", "grupo cancion"); await P.click("#cnsform [type=submit]"); await P.waitForSelector(".cnres li");
  ok((await P.$$(".cnres li")).length === 2 && /sin tiempos/.test(await P.textContent(".cnres")), "buscar por nombre: lista de letras (y avisa si no tienen tiempos)");
  await P.fill("#cnurl", "https://youtu.be/" + V2);
  await P.click('[data-cn="usarres"][data-i="0"]'); await P.waitForSelector(".cnplay .cnvid iframe");
  ok(/Grupo - Canción buena/.test(await P.textContent(".cnhead")) && (await M(P)).gaps.length >= 3, "«Usar» abre la letra elegida con el vídeo");

  /* ---------- móvil ---------- */
  const Mv = await nueva(390, 800);
  await Mv.goto(URL + "#canciones-" + V); await listo(Mv); await Mv.waitForSelector(".cnvid iframe");
  ok(await Mv.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "móvil: sin scroll horizontal");
  await Mv.click('[data-cn="play"]'); await pausadoEn(Mv);
  ok(await Mv.evaluate(() => { const v = document.querySelector(".cnstick").getBoundingClientRect(), g = document.querySelector(".cngap.now").getBoundingClientRect(); return v.top >= 0 && g.top >= v.bottom - 2 && g.bottom <= innerHeight; }), "móvil: vídeo arriba y el hueco visible debajo");
  if (OUT) await Mv.screenshot({ path: OUT + "/canciones-movil.png" });
  const Mi = await nueva(390, 800); await Mi.goto(URL + "#canciones"); await listo(Mi); await Mi.waitForSelector("#cnform");
  ok(await Mi.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "móvil: inicio sin scroll horizontal");
  if (OUT) await Mi.screenshot({ path: OUT + "/canciones-inicio-movil.png", fullPage: true });

  /* ---------- profe y alumno (deberes) ---------- */
  const n = Date.now() % 100000, PR = "prof" + n, AL = "alu" + n, COD = "cn-" + n;
  const api = (p, ruta, metodo, datos, token) => p.evaluate(async ([ruta, metodo, datos, token]) => { const r = await fetch("api/" + ruta, {method: metodo, headers: {"Content-Type": "application/json", ...(token ? {Authorization: "Bearer " + token} : {})}, body: datos ? JSON.stringify(datos) : undefined}); return {code: r.status, j: await r.json().catch(() => ({}))}; }, [ruta, metodo, datos, token]);
  const rp = await api(P, "registro", "POST", {usuario: PR, clave: "clave123", rol: "profe"});
  const tp = rp.j.token; await api(P, "admin", "POST", {accion: "grupo_crear", nombre: "Clase " + n, codigo: COD}, tp);
  const ra = await api(P, "registro", "POST", {usuario: AL, clave: "clave123", rol: "alumno", codigo: COD}); const ta = ra.j.token;
  ok(tp && ta, "cuentas de profe y alumno creadas");
  ok((await api(P, "canciones", "POST", {accion: "asignar", v: V, titulo: "x", lineas: LINEAS, limite: "2030-01-01"}, ta)).code === 403, "un alumno no puede mandar canciones");
  ok((await api(P, "canciones?id=aaaaaaaaaaaa", "GET")).code === 401, "sin entrar no se puede abrir una canción de deberes");
  const conCuenta = async (u, t, hash) => { const p = await nueva(1280); await p.addInitScript(([u, t]) => localStorage.setItem("lyaCuenta", JSON.stringify({usuario: u, token: t, pend: false})), [u, t]); await p.goto(URL + hash); await listo(p); return p; };
  const PF = await conCuenta(PR, tp, "#canciones-" + V);
  await PF.waitForSelector(".cnteach"); await PF.click(".cnteach summary");
  ok((await PF.$$eval(".cnteach [name=grupo] option", o => o.map(x => x.textContent))).includes("Clase " + n), "profe: elige su clase");
  await PF.selectOption(".cnteach [name=nivel]", "2"); await PF.fill(".cnteach [name=nota]", "Escuchad con cascos");
  await PF.click("#cnteachf [type=submit]"); await PF.waitForSelector(".cnteach .cnok"); ok(true, "profe: «Mandar como deberes» funciona");
  let adm = await api(PF, "admin", "GET", null, tp); let d = adm.j.deberes.find(x => x.cancion);
  ok(d && d.titulo === "Canción de prueba" && d.alumnos.length === 1 && !d.alumnos[0].hecho, "el deber sale en el panel del profe (nadie lo ha hecho)");
  const AA = await conCuenta(AL, ta, "#inicio");
  await AA.waitForSelector("#deberes"); const deb = await AA.textContent("#deberes");
  ok(/🎵 Canción de prueba/.test(deb) && /cascos/.test(deb), "alumno: ve la canción en «Tus deberes»");
  await AA.click(`#deberes a[href="#cancion-${d.cancion}"]`); await AA.waitForSelector(".cnplay");
  ok(/Deberes/.test(await AA.textContent(".cnhead")) && !(await AA.$(".cnlvrow")) && !(await AA.$(".cnteach")), "alumno: canción de deberes, con el nivel del profe");
  m = await M(AA); ok(m.gaps.length === 6, "nivel normal elegido por el profe");
  for (const [i, g] of m.gaps.entries()) await AA.fill(`.cngap[data-gi="${i}"]`, g.w);
  await AA.waitForSelector(".cnres"); await AA.evaluate(() => LYACuentas.subir()); await wait(500);
  adm = await api(PF, "admin", "GET", null, tp); d = adm.j.deberes.find(x => x.cancion);
  ok(d.alumnos[0].hecho && d.alumnos[0].estrellas === 3, "el profe ve que el alumno la ha hecho (3 estrellas)");
  await AA.goto(URL + "#inicio"); await AA.waitForSelector("#deberes .ok"); ok(/Hecha/.test(await AA.textContent("#deberes")), "alumno: el deber sale como hecho");
  await api(PF, "admin", "POST", {accion: "deber_borrar", id: d.id}, tp);
  ok((await api(AA, "canciones?id=" + d.cancion, "GET", null, ta)).code === 404, "al quitar el deber, la canción se borra");

  await b.close();
  console.log(ERR.length ? "\nERRORES:\n" + ERR.join("\n") : "\nERRORES: ninguno");
  process.exit(ERR.length ? 1 : 0);
})().catch(e => { console.error(e); console.log("ERRORES:\n" + ERR.join("\n")); process.exit(1); });
