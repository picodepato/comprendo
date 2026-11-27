// Doblaje: sacar las frases de una escena con Gemini (prompt para copiar) o subiendo un .srt (Whisper, TurboScribe…).
// Comprueba el prompt (enlace y trozo), que la web entiende respuestas típicas de una IA (```srt, sin líneas en blanco, sin milisegundos,
// texto antes y después, tiempos desde 0:00), el aviso en vivo y la subida de un .srt. YouTube se simula.
// Uso: node qa/servidor-prueba.mjs "$PWD" 8790  y luego  NODE_PATH=/opt/node22/lib/node_modules node qa/prueba-doblaje-srt.mjs http://localhost:8790 [carpeta-capturas]
import { createRequire } from "module"; const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import fs from "node:fs"; import os from "node:os"; import path from "node:path";
const B = (process.argv[2] || "http://localhost:8790").replace(/\/index\.html$/, ""), OUT = process.argv[3] || "";
const V = "AbCdEfGhIjK";
const fallos = [], ok = (c, m) => { console.log((c ? "OK  " : "MAL ") + m); if (!c) fallos.push(m); };
const FAKE_YT = `window.YT = {Player: class { constructor(id, o) { this.o = o; this.t = 0; this.s = -1; window.__yt = this;
  const f = document.createElement("iframe"); f.id = id; document.getElementById(id).replaceWith(f); setTimeout(() => o.events.onReady && o.events.onReady({target: this}), 30); }
  getCurrentTime() { return this.t } getPlayerState() { return this.s } playVideo() { this.s = 1 } pauseVideo() { this.s = 2 } mute() {} unMute() {} isMuted() { return false }
  seekTo(t) { this.t = t } destroy() {} unloadModule() {} }}; setTimeout(() => window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady(), 20);`;
const b = await chromium.launch(), errs = [];
for (const [w, h] of [[1280, 900], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, permissions: ["clipboard-read", "clipboard-write"] });
  await ctx.route("https://www.youtube.com/iframe_api", r => r.fulfill({ contentType: "text/javascript", body: FAKE_YT }));
  await ctx.route("https://i.ytimg.com/**", r => r.fulfill({ status: 404, body: "" }));
  const p = await ctx.newPage(); p.on("pageerror", e => errs.push(w + ": " + e.message));
  await p.goto(B + "/index.html#doblaje", { waitUntil: "networkidle" }); await p.waitForTimeout(500);
  await p.click('[data-db="tipo"][data-t="escena"]');
  await p.click(".dbia summary");
  await p.click('[data-db="prompt"]');
  ok(/enlace de YouTube|YouTube link|enllaç de YouTube/.test(await p.textContent("#dbcopiado")), w + ": sin enlace pide el enlace antes de copiar");
  await p.fill("#dburl", "https://youtu.be/" + V + "?si=x");
  await p.fill('input[name="desde"]', "1:20"); await p.fill('input[name="hasta"]', "2:05");
  await p.click('[data-db="prompt"]'); await p.waitForTimeout(200);
  const pr = await p.inputValue("#dbprompt"), clip = await p.evaluate(() => navigator.clipboard.readText().catch(() => ""));
  ok(pr.includes("https://www.youtube.com/watch?v=" + V) && /1:20/.test(pr) && /2:05/.test(pr) && /SRT/.test(pr), w + ": el prompt lleva el enlace, el trozo y pide SRT");
  ok(clip === pr, w + ": el prompt queda copiado");
  ok(await p.isVisible('a[href="https://gemini.google.com/app"]'), w + ": botón para abrir Gemini");
  if (OUT) await p.screenshot({ path: `${OUT}/srt-prompt-${w}.png`, fullPage: true });
  // respuesta típica de Gemini: texto antes, ```srt, tiempos desde 0:00 (no desde 1:20), una sin línea en blanco, texto después
  const RESP = "¡Claro! Aquí tienes la transcripción:\n\n```srt\n1\n00:00:01,200 --> 00:00:03,000\n**ANA:** Hello, how are you?\n\n2\n00:00:03,500 --> 00:00:05,100\nBEN: I'm fine, thanks.\n3\n00:00:06,000 --> 00:00:08,000\nANA: Let's go\nto the park!\n```\n\nEspero que te sirva.";
  await p.fill('textarea[name="frases"]', RESP); await p.waitForTimeout(100);
  const chk = await p.textContent("#dbcheck");
  ok(/3 /.test(chk) && /1:21/.test(chk) && /ANA, BEN/.test(chk) && /0:00/.test(chk), w + ": el aviso entiende la respuesta (3 frases, corridas a «Desde», quién habla): " + chk);
  const ls = await p.evaluate(t => LYADoblaje._test.parseFrases(t), RESP);
  ok(ls.length === 3 && ls[2].x === "Let's go to the park!" && ls[0].who === "ANA" && ls[0].x === "Hello, how are you?" && Math.abs(ls[1].t - 3.5) < 0.01, w + ": parse de la respuesta de la IA " + JSON.stringify(ls));
  const sinMs = await p.evaluate(() => LYADoblaje._test.parseFrases("1\n00:00:05 --> 00:00:07\nHola\n\n2\n00:00:08 --> 00:00:10\nAdiós"));
  ok(sinMs.length === 2 && sinMs[1].t === 8 && sinMs[1].d === 2, w + ": tiempos sin milisegundos");
  await p.click('#dbform [type="submit"]'); await p.waitForTimeout(700);
  const D = await p.evaluate(() => LYADoblaje._test.D);
  ok(p.url().endsWith("#doblaje-texto") && D.lineas.length === 3 && Math.abs(D.lineas[0].t - 81.2) < 0.01 && D.inicio > 78 && D.inicio < 81, w + ": abre el estudio con los tiempos contados desde 1:20 (inicio " + D.inicio + ")");
  // subir un .srt (Whisper / TurboScribe)
  await p.evaluate(() => { location.hash = "doblaje"; }); await p.waitForTimeout(500);
  await p.fill("#dburl", "https://youtu.be/" + V); await p.fill('input[name="desde"]', ""); await p.fill('input[name="hasta"]', ""); await p.fill('textarea[name="frases"]', "");
  await p.fill('input[name="titulo"]', "");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "srt")), f1 = path.join(dir, "mi_escena-turboscribe.srt"), f2 = path.join(dir, "nada.txt");
  fs.writeFileSync(f1, "1\r\n00:00:10,000 --> 00:00:12,500\r\nWhere are you going?\r\n\r\n2\r\n00:00:13,000 --> 00:00:15,000\r\nHome.\r\n");
  fs.writeFileSync(f2, "esto no son subtítulos");
  await p.setInputFiles("#dbsrt", f2); await p.waitForTimeout(200);
  ok(/subt/i.test(await p.textContent("#dbcheck")) && !(await p.inputValue('textarea[name="frases"]')), w + ": un archivo que no es .srt se rechaza");
  await p.setInputFiles("#dbsrt", f1); await p.waitForTimeout(200);
  ok(/Where are you going/.test(await p.inputValue('textarea[name="frases"]')) && /2 /.test(await p.textContent("#dbcheck")), w + ": el .srt subido se pone en las frases y se comprueba");
  ok(await p.inputValue('input[name="titulo"]') === "mi escena turboscribe", w + ": el título sale del nombre del archivo");
  await p.click('#dbform [type="submit"]'); await p.waitForTimeout(700);
  const D2 = await p.evaluate(() => LYADoblaje._test.D);
  ok(D2.lineas.length === 2 && D2.lineas[0].t === 10, w + ": el estudio abre con el .srt");
  if (OUT) await p.screenshot({ path: `${OUT}/srt-estudio-${w}.png` });
  const ancho = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  ok(ancho, w + ": sin scroll horizontal");
  await ctx.close();
}
await b.close();
console.log(fallos.length ? "FALLOS: " + fallos.length : "FALLOS: ninguno"); console.log(errs.length ? "ERRORES: " + errs.join(" | ") : "ERRORES: ninguno");
process.exit(fallos.length || errs.length ? 1 : 0);
