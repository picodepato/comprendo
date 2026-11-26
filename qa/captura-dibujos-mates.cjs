/* Capturas de los dibujos de mates (mates/dibujos.js), uno por figura.
   Uso: node qa/servidor-prueba.mjs <carpeta> 8790  y luego  node qa/captura-dibujos-mates.cjs http://localhost:8790 <carpeta-capturas> */
const {chromium} = require("playwright");
const URL = process.argv[2] || "http://localhost:8790", DIR = process.argv[3] || ".";
(async () => {
  const b = await chromium.launch(), p = await b.newPage({viewport: {width: 420, height: 900}}), errs = [];
  p.on("pageerror", e => errs.push(e.message));
  let n = 0;
  for (let ap = 1; ap <= 8; ap++) {
    await p.goto(`${URL}/#mates-t2-${ap}`); await p.waitForTimeout(400);
    if (await p.locator('[data-mt="tab"][data-t="aprende"]').count()) await p.click('[data-mt="tab"][data-t="aprende"]');
    const figs = await p.$$(".mt-fig");
    for (let i = 0; i < figs.length; i++) { await figs[i].screenshot({path: `${DIR}/dibujo-${ap}-${i + 1}.png`}); n++; }
  }
  console.log(`${n} dibujos`, errs.length ? "ERRORES: " + errs.join(" | ") : "sin errores");
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
