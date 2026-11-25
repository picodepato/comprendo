// Doblaje (doblaje/): el profe prepara una escena (frases pegadas, tiempos marcados tocando) y la manda a la clase,
// dos alumnos la doblan (micrófono falso de Chrome), la mandan a la votación y se votan; canción con letra automática;
// el profe la ve hecha en su panel. YouTube no se usa de verdad: se simula la API del reproductor.
// Uso: node qa/servidor-prueba.mjs . 8790  y luego  NODE_PATH=/opt/node22/lib/node_modules node qa/prueba-doblaje.mjs http://localhost:8790 [carpeta-capturas]
import { createRequire } from "module"; const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const B = (process.argv[2] || "http://localhost:8790").replace(/\/index\.html$/, ""), OUT = process.argv[3] || "", id = Date.now().toString(36).slice(-5);
const V = "AbCdEfGhIjK";
const api = async (p, tok, m = "GET", body) => { const r = await fetch(`${B}/api/${p}`, { method: m, headers: { "Content-Type": "application/json", ...(tok ? { Authorization: "Bearer " + tok } : {}) }, body: body && JSON.stringify(body) }); return { ok: r.ok, code: r.status, j: await r.json().catch(() => ({})) }; };
const fallos = [], ok = (c, m) => { console.log((c ? "OK  " : "MAL ") + m); if (!c) fallos.push(m); };
const FAKE_YT = `window.YT = {Player: class {
  constructor(id, o) { this.o = o; this.t = (o.playerVars && o.playerVars.start) || 0; this.s = -1; this.m = false; window.__yt = this;
    const f = document.createElement("iframe"); f.id = id; document.getElementById(id).replaceWith(f);
    setTimeout(() => o.events.onReady && o.events.onReady({target: this}), 30);
    this.iv = setInterval(() => { if (this.s === 1) this.t += 0.1 * (window.__vel || 1); }, 100); }
  getCurrentTime() { return this.t } getPlayerState() { return this.s }
  playVideo() { this.s = 1; setTimeout(() => this.o.events.onStateChange && this.o.events.onStateChange({data: 1}), 60); }
  pauseVideo() { this.s = 2; this.o.events.onStateChange && this.o.events.onStateChange({data: 2}); }
  mute() { this.m = true } unMute() { this.m = false } isMuted() { return this.m }
  seekTo(t) { this.t = t } destroy() { clearInterval(this.iv) } unloadModule() {} }};
setTimeout(() => window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady(), 20);`;
const LETRA = [["hola amigo cómo estás", 2], ["la música suena bonita", 4], ["vamos todos a cantar", 6]].map(([x, t]) => ({ t, d: 2, x }));

const prof = await api("registro", null, "POST", { usuario: "prof" + id, clave: "clave1234", rol: "profe" });
const g = await api("admin", prof.j.token, "POST", { accion: "grupo_crear", nombre: "Clase " + id, codigo: "db" + id });
const a1 = await api("registro", null, "POST", { usuario: "ana" + id, clave: "clave1234", codigo: g.j.codigo, progreso: { learn: "en", know: "es" } });
const a2 = await api("registro", null, "POST", { usuario: "ben" + id, clave: "clave1234", codigo: g.j.codigo, progreso: { learn: "en", know: "es" } });
ok(prof.ok && g.ok && a1.ok && a2.ok, "profe, clase y dos alumnos creados");

const b = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"] });
const errs = [];
async function pagina(tok, u, w = 1280, h = 900) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, permissions: ["microphone"] });
  await ctx.route("https://www.youtube.com/iframe_api", r => r.fulfill({ contentType: "text/javascript", body: FAKE_YT }));
  await ctx.route("https://i.ytimg.com/**", r => r.fulfill({ status: 404, body: "" }));
  await ctx.route(/\/api\/canciones\?v=/, r => r.fulfill({ contentType: "application/json", body: JSON.stringify({ v: V, titulo: "Canción de prueba", idioma: "es", auto: false, origen: "lrclib", lineas: LETRA }) }));
  await ctx.addInitScript(([tok, u]) => {
    if (tok && !sessionStorage.getItem("hecho")) { sessionStorage.setItem("hecho", 1); localStorage.setItem("lyaCuenta", JSON.stringify({ token: tok, usuario: u })); }
    window.__xp = []; addEventListener("lya:xp", e => window.__xp.push(e.detail));
  }, [tok, u]);
  const p = await ctx.newPage();
  p.on("pageerror", e => errs.push(u + ": " + e.message + " @ " + String(e.stack).split("\n").slice(1, 3).join(" ")));
  return p;
}
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: `${OUT}/${n}.png`, fullPage: false }); };
const vt = p => p.evaluate(() => window.__yt ? window.__yt.t : -1);
const esperaT = (p, t) => p.waitForFunction(t => window.__yt && window.__yt.t >= t, t, { timeout: 20000 });

/* ---------- profe: escena pegada sin tiempos → marcar tiempos → mandar a la clase ---------- */
const P = await pagina(prof.j.token, "prof" + id);
await P.goto(B + "/index.html#doblaje", { waitUntil: "networkidle" }); await P.waitForTimeout(600);
ok(await P.locator('.tabs a[href="#doblaje"], a[href="#doblaje"]').count() > 0, "pestaña Doblaje en la barra");
await P.fill("#dburl", "https://www.youtube.com/watch?v=" + V);
await P.click('[data-db="tipo"][data-t="escena"]');
ok(await P.inputValue("#dburl") === "https://youtu.be/" + V, "cambiar a «escena» conserva el enlace");
await P.fill('textarea[name="frases"]', "ANA: Hello, how are you?\nBEN: I'm fine, thanks.\nANA: Let's go!");
await P.fill('input[name="titulo"]', "Escena del parque");
await P.click('#dbform [type="submit"]'); await P.waitForTimeout(700);
ok(P.url().endsWith("#doblaje-texto"), "abre el estudio con la escena pegada");
const D0 = await P.evaluate(() => LYADoblaje._test.D);
ok(D0.lineas.length === 3 && D0.lineas[0].who === "ANA" && D0.lineas[1].x === "I'm fine, thanks.", "frases con quién habla: " + JSON.stringify(D0.lineas));
ok(await P.locator(".dbwho").count() === 3, "se ve el nombre de quien habla");
ok(await P.locator('[data-db="marcar"]').count() >= 1, "sin tiempos ofrece ⏱️ marcar tiempos");
await P.click('#dbbar [data-db="marcar"]');
await P.evaluate(() => { window.__vel = 4; });
for (const t of [1.5, 3.5, 5.5]) { await esperaT(P, t); await P.click("#dbmarca"); }
await P.waitForFunction(() => LYADoblaje._test.modo === "", null, { timeout: 15000 });
const D1 = await P.evaluate(() => LYADoblaje._test.D);
ok(D1.lineas.every(l => l.t > 0) && D1.lineas[1].t > D1.lineas[0].t && D1.fin > D1.lineas[2].t, "tiempos marcados: " + JSON.stringify(D1.lineas.map(l => [l.t.toFixed(1), l.d.toFixed(1)])) + " fin " + D1.fin.toFixed(1));
ok(await P.locator(".cnadj").count() === 1, "con tiempos sale el ajuste ⏪ ⏩");
await P.waitForSelector("#dbprof .cnteach", { timeout: 5000 });
await P.click("#dbprof summary"); await P.selectOption('#dbteachf select[name="grupo"]', g.j.id);
await P.fill('#dbteachf input[name="nota"]', "Dobla a Ana"); await P.click('#dbteachf [type="submit"]');
await P.waitForSelector("#dbprof .cnok", { timeout: 5000 });
ok(true, "el profe manda la escena a la clase");
await shot(P, "doblaje-profe");

/* ---------- alumna 1: ve la escena en deberes, graba, ve su doblaje y lo manda ---------- */
async function doblar(tok, u, w, h, nombre) {
  const p = await pagina(tok, u, w, h);
  await p.goto(B + "/index.html#inicio", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  const link = p.locator('#deberes a[href^="#doblaje-e-"]');
  ok(await link.count() === 1, u + ": la escena sale en «Tus deberes» con 🎬");
  await link.click(); await p.waitForSelector("#dbyt, .dbvid iframe"); await p.waitForTimeout(400);
  ok(/Escena del parque/.test(await p.textContent(".db h1")), u + ": abre la escena del profe");
  await p.evaluate(() => { window.__vel = 1; });
  await p.click('[data-db="grabar"]');
  await p.waitForFunction(() => LYADoblaje._test.modo === "rec", null, { timeout: 8000 });
  ok(await p.evaluate(() => window.__yt.m === true), u + ": al grabar el vídeo está en silencio");
  await p.waitForFunction(() => document.querySelector("#dblyr li.cur"), null, { timeout: 8000 });
  ok(true, u + ": las frases se iluminan mientras graba");
  if (nombre) await shot(p, nombre + "-grabando");
  await p.evaluate(() => { window.__vel = 3; });
  await p.waitForFunction(() => LYADoblaje._test.modo === "" && document.querySelector(".dbtl li"), null, { timeout: 25000 });
  ok(await p.locator(".dbtl li").count() === 1, u + ": la toma queda guardada en el aparato");
  ok((await p.evaluate(() => window.__xp)).some(x => x.juego === "doblaje" && x.n > 0), u + ": da XP");
  await p.click('.dbtl [data-db="ver"]');
  await p.waitForFunction(() => LYADoblaje._test.modo === "play", null, { timeout: 5000 });
  ok(await p.evaluate(() => window.__yt.m === true), u + ": al ver el doblaje el vídeo sigue en silencio (suena tu voz)");
  await p.waitForTimeout(1200);
  const au = await p.evaluate(() => { const a = LYADoblaje._test.audio; return a && {t: a.currentTime, paused: a.paused, err: a.error && a.error.code}; });
  ok(au && !au.err && au.t > 0.2, u + ": tu voz suena encima del vídeo " + JSON.stringify(au));
  await p.click('[data-db="parar"]');
  await p.click('.dbtl [data-db="enviar"]');
  await p.waitForSelector(".dbtl .cnok", { timeout: 8000 });
  ok(true, u + ": manda su doblaje a la votación");
  if (nombre) await shot(p, nombre + "-toma");
  return p;
}
const A1 = await doblar(a1.j.token, "ana" + id, 1280, 900, "doblaje-escritorio");
const A2 = await doblar(a2.j.token, "ben" + id, 390, 844, "doblaje-movil");

/* ---------- votación ---------- */
await A2.goto(B + "/index.html#doblaje-clase"); await A2.waitForSelector(".dbesc", { timeout: 8000 });
ok(await A2.locator(".dbtl li").count() === 2, "en la votación salen los dos doblajes");
const votoBtn = A2.locator('[data-db="votar"]');
ok(await votoBtn.count() === 1, "no puedes votarte a ti mismo (solo hay un botón de votar)");
await votoBtn.click(); await A2.waitForSelector('[data-db="votar"][aria-pressed="true"]', { timeout: 5000 });
ok(/1 vot/.test(await A2.textContent(".dbwin")), "el voto cuenta y ese doblaje va ganando");
await shot(A2, "doblaje-votacion-movil");
await A2.click('.dbwin a[href^="#doblaje-ver-"]'); await A2.waitForSelector('[data-db="verclase"]', { timeout: 8000 });
await A2.click('[data-db="verclase"]');
await A2.waitForFunction(() => LYADoblaje._test.modo === "play", null, { timeout: 5000 });
ok(await A2.evaluate(() => window.__yt.m === true), "ver el doblaje de una compañera: vídeo en silencio con su voz");
await A2.click('[data-db="parar"]');
const L1 = await api("votos?dob=lista", a1.j.token);
ok(L1.ok && L1.j.doblajes.length === 2 && L1.j.doblajes.find(d => d.mio).votos === 1, "la alumna 1 tiene 1 voto (api)");
const otro = L1.j.doblajes.find(d => !d.mio);
ok((await api("votos?dob=lista", prof.j.token)).j.doblajes.length === 2, "el profe ve los doblajes de su clase");
ok((await api("votos", a1.j.token, "POST", { dob: "borrar", id: otro.id })).code === 403, "un alumno no puede borrar el doblaje de otro");
ok((await api("votos?dob=lista")).code === 401, "sin cuenta no se ve la votación");
/* deberes hechos */
await A1.waitForTimeout(2500);
const Ad = await api("admin", prof.j.token);
const deb = (Ad.j.deberes || []).find(d => d.doblaje);
ok(deb && deb.alumnos.filter(a => a.hecho).length === 2, "el profe ve el deber de doblaje hecho por los dos: " + JSON.stringify(deb && deb.alumnos));
/* los temas siguen funcionando en api/votos */
ok((await api("votos")).j.ok === true, "api/votos (temas) sigue igual");

/* ---------- canción: la letra sale sola ---------- */
await A1.goto(B + "/index.html#doblaje"); await A1.waitForTimeout(500);
ok(await A1.locator('.dbclase:not([hidden])').count() === 1, "en el inicio sale el enlace a la votación");
ok(await A1.locator('#dbmios a[href^="#doblaje-l-"]').count() === 1, "«Tus doblajes» lista la escena grabada");
await A1.fill("#dburl", "https://youtu.be/" + V); await A1.click('#dbform [type="submit"]');
await A1.waitForSelector("#dblyr li", { timeout: 8000 });
const D2 = await A1.evaluate(() => LYADoblaje._test.D);
ok(D2.lineas.length === 3 && D2.inicio < 2 && D2.fin > 8, "canción: letra con tiempos y trozo automático " + D2.inicio + "→" + D2.fin);
await A1.click('[data-db="orig"]'); await A1.waitForTimeout(300);
ok(await A1.evaluate(() => window.__yt.m === false && window.__yt.s === 1), "👂 el original suena con sonido");
await A1.click('[data-db="parar"]');
await shot(A1, "doblaje-cancion");

await b.close();
console.log("FALLOS:", fallos.length ? "\n - " + fallos.join("\n - ") : "ninguno"); console.log("ERRORES:", errs.length ? errs.join("\n") : "ninguno");
process.exit(fallos.length || errs.length ? 1 : 0);
