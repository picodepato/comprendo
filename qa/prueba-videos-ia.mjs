/* Pruebas de videos/ia.js (proponer preguntas de un vídeo con IA): node qa/prueba-videos-ia.mjs */
await import("../concursos/formato.js");  /* el package.json es "type": "module": se cuelgan de globalThis */
await import("../videos/ia.js");
const IA = globalThis.LYAVideosIA;
let mal = 0, n = 0;
const ok = (c, m) => { n++; if (!c) { mal++; console.log("✗", m); } else console.log("✓", m); };

/* transcripción de YouTube (minuto en su línea, texto debajo) */
const yt = IA.transcripcion("0:00\nHello everyone\n0:04\ntoday the water cycle\n1:05\nclouds form when\nwater vapor condenses\n1:12\nand then it rains");
ok(yt.length === 4 && yt[2].t === 65 && yt[2].x === "clouds form when water vapor condenses", "transcripción de YouTube");
ok(yt[0].d === 4 && yt[3].d === 4, "duración de cada frase");
/* SRT */
const srt = IA.transcripcion("1\n00:00:01,000 --> 00:00:03,500\nFirst <i>line</i>\n\n2\n00:01:10,000 --> 00:01:14,000\nSecond &amp; last\n");
ok(srt.length === 2 && srt[1].t === 70 && srt[1].d === 4 && srt[0].x === "First line" && srt[1].x === "Second & last", "SRT con etiquetas y entidades");
/* «[m:ss] texto» y [Música] */
const br = IA.transcripcion("[0:10] uno\n[0:20] [Música]\n(0:30) tres");
ok(br.length === 2 && br[1].t === 30, "[m:ss] texto, sin [Música]");
ok(IA.transcripcion("sin tiempos aquí").length === 0, "texto sin tiempos → nada");

/* prompt */
const tp = IA.textoPrompt([{t: 0, x: "a"}, {t: 3, x: "b"}, {t: 12, x: "c"}, {t: 3700, x: "d"}]);
ok(tp === "[0:00] a b\n[0:12] c\n[1:01:40] d", "texto para el prompt en trozos de ~10 s");
const pr = IA.prompt({n: 5, idioma: "en", nivel: "A2", titulo: "Agua", texto: tp});
ok(pr.includes("Crea 5 preguntas") && pr.includes("inglés") && pr.includes("A2") && pr.includes("«Agua»") && pr.endsWith(tp) && pr.includes("MOMENTO: 1:23"), "prompt con opciones y transcripción");

/* respuesta de la IA con MOMENTO */
const resp = "```\nTÍTULO: El ciclo del agua\n---\nMOMENTO: 1:05\nPREGUNTA: ¿Qué forma las nubes?\nA) El vapor que se condensa\nB) La sal\nC) El polvo\nCORRECTA: A\n---\n**Momento:** 0:04\nPREGUNTA: ¿De qué trata?\nA) Del fuego\nB) Del ciclo del agua\nCORRECTA: B\n---\n```";
const r = IA.leer(resp, yt, 100);
ok(r.titulo === "El ciclo del agua" && r.preguntas.length === 2 && r.sinMomento === 0, "lee título y 2 preguntas");
ok(r.preguntas[0].p === "¿De qué trata?" && r.preguntas[0].c === 1 && r.preguntas[1].o.length === 3, "ordenadas por momento, correcta bien leída");
ok(r.preguntas[0].t === 12 && r.preguntas[1].t === 72, "cada pregunta al final de su frase (0:04→12 s, 1:05→72 s), también con «**Momento:**»");
const r2 = IA.leer(resp, [], 30);
ok(r2.preguntas.every(q => q.t <= 29), "sin pasarse del final del vídeo");
/* sin MOMENTO: se reparten y se avisan */
const r3 = IA.leer("PREGUNTA: Uno\nA) a\nB) b\nCORRECTA: A\n---\nPREGUNTA: Dos (1:00)\nA) a\nB) b\nCORRECTA: B", null, 90);
ok(r3.preguntas.length === 2 && r3.sinMomento === 1 && r3.preguntas.some(q => q.t === 60 && q.p === "Dos"), "sin MOMENTO: se reparten y se cuentan");
ok(IA.leer("hola", yt, 100).preguntas.length === 0, "texto sin preguntas → nada");
console.log(`\n${n - mal}/${n} bien`); process.exit(mal ? 1 : 0);
