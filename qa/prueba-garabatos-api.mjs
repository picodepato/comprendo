// Prueba de la API de Garabatos (dibuja y adivina): node qa/prueba-garabatos-api.mjs http://localhost:8790
// (con node qa/servidor-prueba.mjs . 8790 en marcha)
const B = process.argv[2] || "http://localhost:8790", A = B + "/api/dibujos";
const post = async b => { const r = await fetch(A, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }); return { s: r.status, j: await r.json() }; };
const get = async (c, d = "") => (await fetch(`${A}?sala=${c}&desde=${d}`)).json();
let fallos = 0; const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fallos++; };

const cr = await post({ accion: "g-crear", nombre: "Profe", lang: "es", nivel: "A1", rondas: 1, tiempo: 30 });
ok(cr.s === 200 && /^\d{6}$/.test(cr.j.codigo), "crear sala " + cr.j.codigo);
const cod = cr.j.codigo, clave = cr.j.clave, P = { Profe: cr.j.pid };
for (const n of ["Ana", "Leo"]) { const r = await post({ accion: "g-entrar", codigo: cod, nombre: n }); P[n] = r.j.pid; ok(r.s === 200, "entra " + n); }
ok((await post({ accion: "g-entrar", codigo: cod, nombre: "ana" })).s === 409, "nombre repetido no");
ok((await post({ accion: "g-entrar", codigo: cod, nombre: "Ana", pid: P.Ana })).s === 200, "volver a entrar con el mismo pid");
let e = await get(cod); ok(e.fase === "espera" && e.jugadores.length === 3, "sala de espera con 3");
ok((await post({ accion: "g-empezar", codigo: cod, clave: "mal" })).s === 403, "sin clave no empieza");
ok((await post({ accion: "g-empezar", codigo: cod, clave })).s === 200, "empieza");
e = await get(cod); ok(e.fase === "elegir" && e.dib === "Profe", "elige Profe (el primero)");
const pro = Object.fromEntries(Object.entries(P).map(([n, p]) => [n, p]));
const yo = await post({ accion: "g-yo", codigo: cod, pid: pro.Profe }); ok(yo.j.dibujas && yo.j.ops.length === 3, "Profe ve 3 opciones: " + yo.j.ops.map(o => o.w + "/" + o.tr).join(", "));
ok(!(await post({ accion: "g-yo", codigo: cod, pid: pro.Ana })).j.dibujas, "Ana no las ve");
const el = await post({ accion: "g-elegir", codigo: cod, pid: pro.Profe, i: 1 }); ok(el.s === 200 && el.j.palabra.w === yo.j.ops[1].w, "elige " + el.j.palabra.w);
const w = el.j.palabra.w;
ok((await post({ accion: "g-trazos", codigo: cod, pid: pro.Profe, turno: 1, ev: [[0, 1, 0, 10, 10, 500, 500], "u", [3, 2, 0, 1, 2, 3, 4], [3, 2, 1, 3, 4, 9, 9]] })).s === 200, "manda trazos");
ok((await post({ accion: "g-trazos", codigo: cod, pid: pro.Ana, turno: 1, ev: [[0, 1, 0, 1, 1, 2, 2]] })).s === 409, "Ana no puede dibujar");
ok((await post({ accion: "g-trazos", codigo: cod, pid: pro.Profe, turno: 1, ev: [[0, 1, 0, 1, 1, 2, 2000]] })).s === 400, "trazo fuera del lienzo no");
e = await get(cod, "1.0"); ok(e.fase === "dibujar" && e.ev.length === 1 && e.pista.replace(/[^_]/g, "").length > 0, "los demás ven trazos y pista " + e.pista);
ok(!JSON.stringify(e).includes(`"${w}"`), "la palabra no sale en el estado público");
let g = await post({ accion: "g-adivinar", codigo: cod, pid: pro.Ana, texto: "zzzz" }); ok(g.j.ok === false, "fallo");
const sin = w.normalize("NFD").replace(/[̀-̂̄-ͯ]/g, "").normalize("NFC");
g = await post({ accion: "g-adivinar", codigo: cod, pid: pro.Ana, texto: "el " + sin.toUpperCase() }); ok(g.j.ok === true, "Ana acierta (con artículo, sin tildes, mayúsculas)");
if (w.length >= 4) { g = await post({ accion: "g-adivinar", codigo: cod, pid: pro.Leo, texto: w.slice(0, -1) + "q" }); ok(g.j.casi, "Leo casi"); }
e = await get(cod, "1.1"); ok(e.ev.some(x => x.ok === "Ana") && e.ev.some(x => x.m && x.m[1] === "zzzz"), "se ve el acierto y el intento");
g = await post({ accion: "g-adivinar", codigo: cod, pid: pro.Leo, texto: w }); ok(g.j.ok, "Leo acierta");
e = await get(cod, "x"); ok(e.fase === "resultado" && e.palabra.w === w, "todos acertaron: resultado");
ok(e.delta.Ana > e.delta.Leo && e.delta.Profe > 0, "puntos: " + JSON.stringify(e.delta));
console.log("… esperando el siguiente turno (7 s)"); await new Promise(r => setTimeout(r, 7300));
e = await get(cod, "y"); ok(e.fase === "elegir" && e.dib === "Ana" && e.turno === 2, "turno 2: dibuja Ana");
console.log("… Ana no elige (15 s): se elige sola"); await new Promise(r => setTimeout(r, 15300));
e = await get(cod, "z"); ok(e.fase === "dibujar", "se eligió sola");
ok((await post({ accion: "g-echar", codigo: cod, clave, nombre: "Ana" })).s === 200, "echar a Ana (dibujaba)");
await new Promise(r => setTimeout(r, 300));
e = await get(cod, "w"); ok(e.fase === "resultado", "su turno se acaba");
await new Promise(r => setTimeout(r, 7300));
e = await get(cod, "v"); ok(e.dib === "Leo", "dibuja Leo");
const yl = await post({ accion: "g-yo", codigo: cod, pid: pro.Leo }); await post({ accion: "g-elegir", codigo: cod, pid: pro.Leo, i: 0 });
await post({ accion: "g-adivinar", codigo: cod, pid: pro.Profe, texto: yl.j.ops[0].w });
e = await get(cod, "u"); ok(e.fase === "resultado", "Profe acierta: resultado");
await new Promise(r => setTimeout(r, 7300));
e = await get(cod, "t"); ok(e.fase === "fin" && e.ranking.length === 2, "fin: " + JSON.stringify(e.ranking));
ok((await post({ accion: "g-otra", codigo: cod, clave })).s === 200, "otra partida");
e = await get(cod, "s"); ok(e.fase === "elegir" && e.ronda === 1, "vuelve a empezar");
ok((await post({ accion: "g-cerrar", codigo: cod, clave })).s === 200, "cerrar");
ok((await fetch(`${A}?sala=${cod}`)).status === 404, "sala borrada");
console.log(fallos ? `${fallos} fallos` : "todo bien"); process.exit(fallos ? 1 : 0);
