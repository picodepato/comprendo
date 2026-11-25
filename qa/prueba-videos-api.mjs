// Prueba de vídeos con preguntas, deberes de actividades y sala avisada a la clase.
// Uso: node qa/servidor-prueba.mjs . 8790 & node qa/prueba-videos-api.mjs http://localhost:8790
const B = process.argv[2] || "http://localhost:8790";
let fallos = 0; const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fallos++; };
const api = async (ruta, datos, token) => { const r = await fetch(B + "/api/" + ruta, {method: datos ? "POST" : "GET", headers: {"Content-Type": "application/json", ...(token ? {Authorization: "Bearer " + token} : {})}, body: datos ? JSON.stringify(datos) : undefined}); return {code: r.status, j: await r.json().catch(() => ({}))}; };
const espera = ms => new Promise(r => setTimeout(r, ms));
const VIDEO = {tipo: "video", v: "dQw4w9WgXcQ", titulo: "Vídeo de prueba", preguntas: [
  {t: 40, p: "¿Segunda?", o: ["Sí", "No"], c: 1, s: 10}, {t: 12.5, p: "¿Primera?", o: ["A", "B", "C"], c: 0, s: 10}]};
const x = Date.now().toString(36).slice(-5);
const prof = (await api("registro", {usuario: "pv" + x, clave: "secreta1", rol: "profe"})).j.token;
ok(!!prof, "profe creado");
const cl = await api("admin", {accion: "grupo_crear", nombre: "3ºB", codigo: "c" + x}, prof); ok(cl.j.id, "clase creada");
const alu = (await api("registro", {usuario: "av" + x, clave: "secreta1", rol: "alumno", codigo: "c" + x})).j.token;
ok(!!alu, "alumno en la clase");

// guardar vídeo
ok((await api("concursos", {accion: "guardar", concurso: {...VIDEO, v: "malo"}}, prof)).code === 400, "id de YouTube malo → 400");
ok((await api("concursos", {accion: "guardar", concurso: {...VIDEO, preguntas: [{...VIDEO.preguntas[0], t: -3}]}}, prof)).code === 400, "segundo negativo → 400");
const g = await api("concursos", {accion: "guardar", concurso: VIDEO}, prof); ok(g.j.id, "vídeo guardado");
const c = (await api("concursos?id=" + g.j.id)).j.concurso;
ok(c.tipo === "video" && c.v === VIDEO.v && c.preguntas[0].t === 12.5, "se guarda ordenado por tiempo");
const mios = (await api("concursos?mios=1", null, prof)).j.concursos; ok(mios[0].tipo === "video" && mios[0].v === VIDEO.v, "aparece en mis actividades como vídeo");

// deberes
ok((await api("admin", {accion: "deber_crear", actividad: g.j.id, limite: "2030-01-01", grupo: cl.j.id, directo: true}, prof)).code === 200, "mandado como deber en directo");
ok((await api("admin", {accion: "deber_crear", actividad: "p-agua", tipo: "video", titulo: "El agua", limite: "2030-01-01", grupo: cl.j.id}, prof)).code === 200, "mandado un preparado en casa");
ok((await api("admin", {accion: "deber_crear", actividad: "aaaaaaaaaaaa", limite: "2030-01-01"}, prof)).code === 404, "actividad que no existe → 404");
let av = (await api("avisos", null, alu)).j;
ok(av.deberes.length === 2 && av.deberes.some(d => d.actividad === g.j.id && d.tipo === "video" && d.directo), "el alumno ve los deberes");
ok(av.clase && av.clase.id === cl.j.id && !av.sala, "sin sala abierta todavía");

// sala avisada a la clase
const s = await api("concursos", {accion: "abrir", id: g.j.id, grupo: cl.j.id}, prof); ok(s.j.codigo && s.j.grupo === cl.j.id, "sala abierta avisando a la clase");
const cod = s.j.codigo, clave = s.j.clave;
const aviso = (await api("concursos?aviso=" + cl.j.id)).j.sala; ok(aviso && aviso.codigo === cod && aviso.tipo === "video" && aviso.idc === g.j.id, "?aviso= da la sala");
ok((await api("avisos", null, alu)).j.sala?.codigo === cod, "avisos también");
const otra = (await api("registro", {usuario: "po" + x, clave: "secreta1", rol: "profe"})).j.token;
const s2 = await api("concursos", {accion: "abrir", id: g.j.id, grupo: cl.j.id}, otra); ok(!s2.j.grupo, "otro profe no puede avisar a una clase que no es suya");
const a = await api("concursos", {accion: "entrar", codigo: cod, nombre: "av" + x}, alu); ok(a.j.pid, "el alumno entra con su usuario");
ok((await api("concursos", {accion: "entrar", codigo: cod, nombre: "av" + x}, alu)).j.pid === a.j.pid, "si vuelve a entrar con su cuenta recupera su sitio");
const b = await api("concursos", {accion: "entrar", codigo: cod, nombre: "Beto"});

// individual con tiempo de lectura
let p = await api("concursos", {accion: "pasar", codigo: cod, clave, modo: "individual", lectura: 30});
ok(p.j.fase === "lectura" && p.j.todas.length === 2 && p.j.todas[0].c === undefined && p.j.modo === "individual", "lectura: todas las preguntas sin la correcta");
p = await api("concursos", {accion: "pasar", codigo: cod, clave}); ok(p.j.fase === "video" && p.j.todas[0].t === 12.5 && p.j.v === VIDEO.v, "vídeo individual: tiempos para pararse");
let r = await api("concursos", {accion: "responder", codigo: cod, pid: a.j.pid, i: 1, o: 1}); ok(r.j.bien === true && r.j.correcta === 1 && r.j.pts === 1000, "responde (bien) cuando le toca");
r = await api("concursos", {accion: "responder", codigo: cod, pid: a.j.pid, i: 1, o: 0}); ok(r.j.repetida && r.j.pts === 1000, "no se puede contestar dos veces");
await api("concursos", {accion: "responder", codigo: cod, pid: a.j.pid, i: 0, o: 1});
await api("concursos", {accion: "responder", codigo: cod, pid: b.j.pid, i: 0, o: 0});
let e = (await api(`concursos?sala=${cod}&clave=${encodeURIComponent(clave)}`)).j;
const yo = e.ranking.find(z => z.n === "av" + x); ok(yo && yo.nr === 2 && yo.na === 1 && e.preguntas[0].c === 0, "el profe ve el progreso de cada uno");
p = await api("concursos", {accion: "pasar", codigo: cod, clave}); ok(p.j.fase === "fin" && p.j.ranking.length === 2 && p.j.idc === g.j.id, "fin con ranking");
ok(!(await api("concursos?aviso=" + cl.j.id)).j.sala, "al acabar se quita el aviso de la clase");

// proyección
const s3 = await api("concursos", {accion: "abrir", concurso: VIDEO, ref: "p-prueba"}); const c3 = s3.j.codigo, k3 = s3.j.clave;
const j1 = await api("concursos", {accion: "entrar", codigo: c3, nombre: "Ana"});
p = await api("concursos", {accion: "pasar", codigo: c3, clave: k3, modo: "proyeccion"}); ok(p.j.fase === "video" && !p.j.todas && p.j.idc === "p-prueba", "proyección: el móvil no recibe las preguntas");
p = await api("concursos", {accion: "pasar", codigo: c3, clave: k3}); ok(p.j.fase === "pregunta" && p.j.i === 0 && p.j.pregunta.p === "¿Primera?", "el vídeo se para: pregunta 1");
await espera(3100);
ok((await api("concursos", {accion: "responder", codigo: c3, pid: j1.j.pid, i: 0, o: 0})).code === 200, "contesta desde el móvil");
p = await api("concursos", {accion: "pasar", codigo: c3, clave: k3}); ok(p.j.fase === "resultado" && p.j.correcta === 0 && p.j.ranking[0].pts > 500, "resultado");
p = await api("concursos", {accion: "pasar", codigo: c3, clave: k3}); ok(p.j.fase === "video" && p.j.i === 0, "sigue el vídeo");
p = await api("concursos", {accion: "pasar", codigo: c3, clave: k3}); ok(p.j.fase === "pregunta" && p.j.i === 1, "pregunta 2");
p = await api("concursos", {accion: "terminar", codigo: c3, clave: k3}); ok(p.j.fase === "fin", "terminar en cualquier momento");

// deberes: hecho
await api("progreso", {s: {g: {ac: {[g.j.id]: {n: 1, best: 2, bp: 50}}}}, t: Date.now()}, alu).catch(() => null);
const pa = (await api("admin", null, prof)).j;
const d = pa.deberes.find(z => z.actividad === g.j.id); ok(d && d.alumnos.length === 1, "el profe ve el deber y a quién va");
console.log(fallos ? `\n${fallos} fallos` : "\nTodo bien");
process.exit(fallos ? 1 : 0);
