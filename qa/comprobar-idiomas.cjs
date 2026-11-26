// Comprueba que cada pantalla sale en el idioma que toca (sin IA: cuenta palabras típicas de cada idioma).
// A2 en adelante: todo en el idioma que se aprende. A1: el que se aprende y el que ya sabe.
// Uso: node qa/servidor-prueba.mjs $PWD 8790  y luego  NODE_PATH=$(npm root -g) node qa/comprobar-idiomas.cjs http://localhost:8790/ [B1|A1|todos]
// Saca las líneas que parecen de otro idioma. Algunas son falsos avisos (palabras iguales en catalán y castellano,
// nombres propios, traducciones de la gramática): hay que mirarlas a ojo.
const {chromium} = require('playwright');
const W={
es:'y los con para por está están más muy pero también cómo qué cuál cuáles tu tus puedes hay este esta estos aquí palabras palabra sí ya son todo todos desde hasta lo nuestro uno elige elegir mira toca pulsa escribe lectura lecturas juego juegos jugar tienes tiene eres cuando donde dónde ningún ninguna nada otra otro otros quieres ahora después antes nivel clase alumnos profe pregunta preguntas respuesta respuestas código empezar empieza el las del al una se le les'.split(' '),
ca:'els amb i per és són més molt però també què quin quina quines teu teva teus teves pots hi ho aquest aquesta aquests aquí paraules paraula mòbil fins sense tot tots tria triar crea mira toca prem escriu lectura lectures joc jocs jugar tens té ets quan on cap res altra altre altres vols ara després abans nivell classe alumnes professor pregunta preguntes resposta respostes codi entra entrar començar comença el les del al una dels als pel amb heu podeu sou'.split(' '),
en:'the and of to with your you is are this for on it what which can word words reading readings my all each more game games play have has when where none nothing other others want now after before level class students teacher question questions answer answers code enter start create room pick choose tap write type'.split(' ')};
const SH=new Set(['el','les','del','al','una','lectura','pregunta','mira','toca','entrar','jugar','aquí']);
const sets={};for(const l in W)sets[l]=new Set(W[l]);
function detect(s){const t=s.toLowerCase().replace(/[^a-záéíóúñüàèòçïl·'’ -]/g,' ').replace(/[dlmnst][’']/g,' ').split(/\s+/).filter(Boolean);if(t.length<3)return null;
 const sc={es:0,ca:0,en:0};for(const w of t)for(const l in sets)if(sets[l].has(w))sc[l]+=SH.has(w)?0.3:1;
 if(/[ñ¿¡]|ción\b|ción |\bá/.test(s.toLowerCase()))sc.es+=1.5; if(/l·l|[àèò]|ç|ció\b|\bels\b/.test(s.toLowerCase()))sc.ca+=1.5;
 const best=Object.entries(sc).sort((a,b)=>b[1]-a[1]);if(best[0][1]<1.5||best[0][1]<best[1][1]*1.5)return null;return best[0][0]}
const BASE = process.argv[2] || 'http://localhost:8790/', QUE = process.argv[3] || 'B1';
const ROUTES = ['inicio', 'aprender', 'practicar', 'grupo', 'mizona', 'diccionario', 'fichas', 'progreso', 'mascota', 'canciones', 'doblaje', 'dictados', 'duelo', 'escape', 'concursos', 'videos', 'deberes', 'camara', 'garabatos', 'reto-prueba', 'reto-apuesta', 'reto-cartas', 'reto-tabu', 'reto-piloto'];
const COURSES = [['es', 'en'], ['en', 'es'], ['ca', 'es']], LEVELS = QUE === 'todos' ? ['A1', 'B1'] : [QUE];
(async () => {
  const b = await chromium.launch(); const out = [], errs = [];
  for (const [learn, know] of COURSES) for (const level of LEVELS) {
    const ctx = await b.newContext({viewport: {width: 1200, height: 900}});
    await ctx.addInitScript(([learn, know, level]) => { if (location.href.startsWith('http')) localStorage.setItem('lyaPerfiles', JSON.stringify({list: [{id: 'local', name: '', s: {learn, know, level, read: '', a: {}, dict: [], dir: 'learn', say: false, view: 'home'}}], cur: 'local'})); }, [learn, know, level]);
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(`${learn}/${level} ${p.url()} ${e.message}`));
    for (const r of ROUTES) {
      await p.goto('about:blank'); await p.goto(BASE + '#' + r); await p.waitForTimeout(800);
      const txt = await p.evaluate(() => document.body.innerText);
      const ok = level === 'A1' ? [learn, know] : [learn];
      for (const line of new Set(txt.split('\n').map(s => s.trim()).filter(Boolean))) { const d = detect(line); if (d && !ok.includes(d)) out.push(`${learn}>${know} ${level} #${r} [${d}] ${line.slice(0, 140)}`); }
    }
    await ctx.close();
  }
  await b.close();
  console.log(out.length ? out.join('\n') : 'Ninguna línea en otro idioma.');
  console.log(errs.length ? 'ERRORES:\n' + errs.join('\n') : 'ERRORES: ninguno');
})();
