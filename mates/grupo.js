/* COMPRENDO · Matemáticas en grupo: juegos de clase con sala y código de 6 cifras (como los retos de las lecturas).
   El servidor es el mismo de los retos (api/_retos.js, en api/propuestas?retos=1): guarda la sala, quién juega y qué ha hecho cada uno.
   El contenido sale de mates/banco.js con la semilla de la sala: es igual en todos los móviles y no hay que preparar nada.
   La sala guarda en «lectura» la configuración: mates-<tema>-<apartados>-<dificultad> (tema t2 o p2). En «dur»: rondas (juegos por rondas) o minutos (juegos libres).
   Juegos:
     🧍 recta    La recta humana: cada uno del equipo tiene cartas (números u operaciones) y entre todos las colocan en orden en la recta.
     🔗 cadena   Cadena de operaciones: una operación combinada larga; cada paso lo hace uno del equipo, por turnos. Si fallas, la cadena se rompe.
     🎯 objetivo Número objetivo: con 5 números enteros y + − · :, llegar al número de la pizarra (o lo más cerca posible).
     🌡️ ascensor Ascensor y termómetro: una historia que avanza con sumas y restas; todos mueven el mismo marcador.
     🔐 escape   Escape room de mates: 4 candados cuyo código es el resultado de una operación; cada móvil tiene solo una parte de los datos.
     🎲 apuesta  Atrapa los puntos: ¿verdadero o falso? Apuesta y, si escribes el resultado bueno, ganas el doble.
     🃏 cartas   Cartas a la mesa: operaciones con hueco; las soluciones están repartidas como cartas entre los móviles del equipo (y 2 trampas).
   4.º ESO PDC (tema p2, proporcionalidad y porcentajes; el contenido sale de mates/pdc.js):
     🃏 cartas   Parejas: «Rebajar un 20 % es multiplicar por ▢», «25 % de 80 = ▢»… y las soluciones como cartas.
     🔐 escape   Escape room «La tienda»: 4 problemas (rebajas, IVA, repartos, regla de tres) con los datos repartidos por letras.
     🏷️ oferta   ¿Cuál es la mejor oferta? Tres tiendas, tres ofertas: elige la más barata y, si quieres, demuestra cuánto se paga.
     🧩 monta    Monta el problema (mates/monta.js): datos a su sitio, tipo, operación y respuesta. Gana quien lo monta antes y con menos fallos.
   Rutas: #mates-grupo · #mates-juego-<juego> (explicación, entrar con código y crear sala) · #mates-sala-<código> (alumno) · #mates-pizarra-<código> (pizarra). */
(() => {
const API = "api/propuestas?retos=1";
const B = () => window.LYAMatesBanco;
/* el banco del tema de la sala (o del que se está creando): banco.js (t2) o pdc.js (p2) */
const BT = () => { const t = sala() ? CFG().tema : E.crear?.tema; return (t && window.LYAMatesTemas?.banco ? LYAMatesTemas.banco(t) : null) || B(); };
const esP2 = () => (sala() ? CFG().tema : E.crear?.tema) === "p2";
const L = () => window.LYA;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const J = {
  recta: {ic: "🧍", n: "La recta humana", c: "#ff7a45", tipo: "rondas", eq: true, p: "Ordenad vuestras cartas en la recta, hablando.", def: {equipos: 4, dur: 5, rd: 90, aps: [1, 2, 3, 6]},
    como: ["Cada uno recibe cartas con números u operaciones (−7, |−3|, (−2)³…).", "Entre todo el equipo tenéis que colocarlas en la recta, de menor a mayor: toca tu carta y luego su sitio.", "Solo ves tus cartas en tu mano: decid en voz alta lo que vale cada una.", "Cuando creáis que está bien, pulsad «¡Listo!». Si falla, perdéis puntos y 5 segundos."]},
  cadena: {ic: "🔗", n: "Cadena de operaciones", c: "#7c6cff", tipo: "rondas", eq: true, p: "Cada paso lo hace uno del equipo, por turnos.", def: {equipos: 4, dur: 5, rd: 120, aps: [4, 5, 6, 7, 8]},
    como: ["Sale una operación combinada larga.", "Se resuelve paso a paso respetando la jerarquía: cada paso le toca a uno del equipo, por turnos.", "Si alguien falla, la cadena se rompe ahí y el paso pasa al siguiente.", "Gana el equipo que llega al final antes y con menos fallos."]},
  objetivo: {ic: "🎯", n: "Número objetivo", c: "#2fbf71", tipo: "rondas", eq: false, p: "Con 5 números y + − · :, llega al número.", def: {equipos: 0, dur: 6, rd: 90, aps: [3, 4, 5]},
    como: ["En la pizarra sale un número objetivo y 5 números enteros.", "Con esos números (cada uno una vez como mucho), + − · : y paréntesis, intenta llegar al objetivo.", "Puedes enviar todas las veces que quieras: cuenta la última.", "Exacto: 1000 puntos más rapidez. Si te quedas cerca, también puntúa."]},
  ascensor: {ic: "🌡️", n: "Ascensor y termómetro", c: "#18b6d6", tipo: "rondas", eq: false, p: "Una historia con sumas y restas; todos movéis el mismo marcador.", def: {equipos: 0, dur: 8, rd: 30, aps: [3, 4]},
    como: ["La pizarra cuenta una historia: un ascensor, un termómetro, un submarino o una cuenta del banco.", "En cada ronda pasa algo (sube, baja, gasta, ingresa…).", "Escribe en tu móvil dónde queda el marcador. Cuanto antes aciertes, más puntos.", "Al cerrar la ronda, el marcador se mueve y la historia sigue desde ahí."]},
  escape: {ic: "🔐", n: "Escape room de mates", c: "#ff4f8b", tipo: "libre", eq: true, p: "Cada móvil tiene una parte de los datos.", def: {equipos: 4, dur: 15, rd: 60},
    como: ["Hay 4 candados. Cada uno se abre con el resultado de una operación.", "La operación viene con letras (A, B, C…) y los valores de las letras están repartidos entre los móviles del equipo.", "Solo hablando podéis juntar todo. Un fallo congela el candado 15 s y suma 30 s.", "El candado final se abre con la suma de los 4 resultados."]},
  apuesta: {ic: "🎲", n: "Atrapa los puntos", c: "#f5b700", tipo: "rondas", eq: false, p: "¿Verdadero o falso? Apuesta y demuéstralo.", def: {equipos: 0, dur: 8, rd: 40},
    como: ["Empiezas con 1000 puntos.", "Sale una operación con un resultado: ¿es verdad o mentira?", "Elige verdadero o falso y cuánto apuestas. Si aciertas, ganas lo apostado; si no, lo pierdes.", "Si además escribes el resultado bueno, ganas el doble."]},
  cartas: {ic: "🃏", n: "Cartas a la mesa", c: "#53c41a", tipo: "libre", eq: true, p: "Operaciones con hueco y las soluciones repartidas como cartas.", def: {equipos: 4, dur: 8, rd: 60},
    como: ["Hay 8 operaciones con un hueco (▢).", "Las soluciones están repartidas como cartas entre los móviles del equipo, con 2 cartas trampa.", "Toca una carta tuya y luego su hueco. Si fallas, 5 segundos sin jugar.", "Tenéis un comodín: dice quién tiene la carta de un hueco."],
    comoP2: ["Hay 8 frases con un hueco (▢): «Rebajar un 20 % es multiplicar por ▢», «25 % de 80 = ▢»…", "Las soluciones están repartidas como cartas entre los móviles del equipo, con 2 cartas trampa.", "Toca una carta tuya y luego su hueco. Si fallas, 5 segundos sin jugar.", "Tenéis un comodín: dice quién tiene la carta de un hueco."]},
  oferta: {ic: "🏷️", n: "¿Cuál es la mejor oferta?", c: "#ff9f1c", tipo: "rondas", eq: false, p: "Tres tiendas, tres ofertas: ¿dónde sale más barato?", def: {equipos: 0, dur: 6, rd: 60}, temas: ["p2"],
    como: ["En cada ronda salen tres ofertas del mismo producto: descuentos, rebajas seguidas, IVA, 3 × 2…", "Elige la más barata. Cuanto antes aciertes, más puntos.", "¿Doble premio? Después escribe cuánto se paga con la mejor oferta y ganas 300 puntos más.", "Al cerrar la ronda se ven las cuentas de las tres."]},
  monta: {ic: "🧩", n: "Monta el problema", c: "#2fbf71", tipo: "rondas", eq: false, p: "Datos a su sitio, tipo, operación y respuesta.", def: {equipos: 0, dur: 5, rd: 120}, temas: ["p2"],
    como: ["Sale un problema de proporcionalidad, porcentajes o repartos.", "Arrastra los datos a su sitio, elige el tipo (directa, inversa, porcentaje o reparto), la operación y escribe la respuesta.", "Si algo no va ahí, te explica por qué, pero cuenta como fallo.", "Gana quien lo monta antes y con menos fallos."]}
};
J.recta.temas = J.cadena.temas = J.objetivo.temas = J.ascensor.temas = J.apuesta.temas = ["t2"];
J.escape.temas = J.cartas.temas = ["t2", "p2"];
J.escape.comoP2 = ["Escape room «La tienda»: hay 4 candados y cada uno se abre con la respuesta de un problema (rebajas, IVA, repartos…).", "El problema viene con letras (A, B, C) y los valores de las letras están repartidos entre los móviles del equipo.", "Solo hablando podéis juntar todo. Un fallo congela el candado 15 s y suma 30 s.", "El candado final se abre con la suma de los 4 resultados."];
const comoDe = (g, tema) => tema === "p2" && g.comoP2 ? g.comoP2 : g.como;
const ORDEN = ["recta", "cadena", "objetivo", "ascensor", "escape", "apuesta", "cartas", "oferta", "monta"];
let temaPref = null;  /* el tema desde el que se ha entrado (tarjetas de #mates-p2) */
document.addEventListener("click", e => { const a = e.target.closest?.("[data-mg-tema]"); if (a) temaPref = a.dataset.mgTema; }, true);
const COLORES = ["#ff7a45", "#7c6cff", "#2fbf71", "#ff4f8b", "#18b6d6", "#f5b700", "#a259ff", "#53c41a"];
const EQN = ["🦊 Zorros", "🐙 Pulpos", "🦉 Búhos", "🐺 Lobos", "🐢 Tortugas", "🦄 Unicornios", "🐝 Abejas", "🦖 Dinos"];
const SALDO = 1000, APUESTAS = [100, 250, 500, 1000];
const DIF = ["", "Fácil", "Medio", "Difícil"];

/* ---------- estado ---------- */
const E = {st: null, off: 0, poll: null, tick: null, firma: "", msg: "", msgOk: false, err: "", busy: false, ui: {}, crear: null, cache: {}};
const guard = {get() { try { return JSON.parse(localStorage.getItem("lyaMatesSala") || "{}"); } catch (e) { return {}; } }, set(v) { try { localStorage.setItem("lyaMatesSala", JSON.stringify(v)); } catch (e) {} }};
const mem = () => { const m = guard.get(); m.host ||= {}; m.play ||= {}; m.xp ||= {}; return m; };
const sala = () => E.st?.sala;
const ahora = () => Date.now() + E.off;
const mmss = ms => { ms = Math.max(0, ms); const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const jg = () => J[sala()?.juego?.slice(2)] || null;
const jid = () => sala()?.juego?.slice(2);
const esProfe = () => { const r = window.LYACuentas?.rol; return r === "profe" || r === "admin"; };
const S = () => BT().s, SG = () => BT().sg;

async function api(metodo, datos, q = "") {
  let r;
  try { r = await fetch(API + q, metodo === "GET" ? {cache: "no-store"} : {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(datos)}); }
  catch (e) { return {ok: false, error: "red"}; }
  const j = await r.json().catch(() => null);
  if (!j) return {ok: false, error: r.status === 404 ? "serv" : "red"};
  return {ok: r.ok, status: r.status, ...j};
}
function recibir(s) {
  if (!s || !s.sala) return;
  if (E.st && E.st.sala.codigo === s.sala.codigo && s.ahora < E.st.ahora) return;
  E.st = s; E.off = s.ahora - Date.now();
}
const ERR = {red: "No hay conexión. Lo intentamos otra vez…", serv: "El servidor no responde.", no_existe: "No hay ninguna sala abierta con ese código.", empezada: "La partida ya ha empezado y es por equipos: ya no se puede entrar.", llena: "La sala está llena.", nombre: "Escribe tu nombre.", equipo: "Elige un equipo.", fase: "Ahora no se puede.", muchas: "Demasiados intentos. Espera un poco.", no_anfitrion: "Solo quien ha creado la sala puede hacer eso.", juego: "Ese juego no existe.", lectura: "Configuración no válida."};

/* ---------- configuración y contenido (igual en todos los móviles) ---------- */
const CFG = () => { const m = String(sala()?.lectura || "").match(/^mates-([tp]\d+)-([1-8]+)-([123])$/); return m ? {tema: m[1], aps: m[2].split("").map(Number), d: +m[3]} : {tema: "t2", aps: [1, 2, 3, 4, 5, 6, 7, 8], d: 1}; };
const rng = salt => B().Rn(((sala()?.semilla || 1) + salt * 7919) % 2147483647);
const memo = (k, f) => { const kk = (sala()?.codigo || "") + ":" + (sala()?.semilla || "") + ":" + k; return E.cache[kk] ??= f(); };

/* una pregunta con respuesta numérica y su texto con hueco (cartas, apuesta, escape) */
function pregNum(r, aps, d, evitar) {
  for (let k = 0; k < 80; k++) {
    const ap = r.pick(aps), q = B().gen(ap, d, r, {texto: true});
    if (!(q.tipo === "num" || q.tipo === "pasos") || !q.expr || !Number.isInteger(q.sol)) continue;
    if (evitar && evitar.has(q.sol)) continue;
    const txt = q.expr.includes("▢") ? q.expr : /[.?]$/.test(q.expr) ? `${q.expr} → ▢` : `${q.expr} = ▢`;
    return {q, txt, sol: q.sol, enun: q.enun};
  }
  const a = r.nz(-12, 12), b = r.nz(-12, 12); return {q: null, txt: `${B().p(a)} + ${B().p(b)} = ▢`, sol: a + b, enun: "Calcula"};
}
/* recta humana: el mismo número escrito de otra forma según los apartados elegidos */
function forma(v, r, aps, d) {
  const b = B(), ops = [() => b.sg(v)];
  if (d >= 2 || r.si(.5)) {
    if (aps.includes(1)) ops.push(() => `Op(${b.sg(-v)})`, () => v >= 0 ? b.absT(b.sg(r.sig() * v)) : b.M + b.absT(b.sg(r.sig() * v)));
    if (aps.includes(3) || aps.includes(4)) ops.push(() => { const a = r.nz(-9, 9); return `${b.p(a)} + ${b.p(v - a)}`; }, () => { const c = r.nz(-9, 9); return `${b.p(v + c)} ${b.M} ${b.p(c)}`; });
    if (aps.includes(5)) ops.push(() => { const c = r.sig() * r.int(2, 4); return `${b.p(v * c)} : ${b.p(c)}`; });
    if (aps.includes(6)) for (let base = -5; base <= 5; base++) for (let e = 2; e <= 5; e++) if (Math.abs(base) > 1 && base ** e === v) ops.push(() => `(${b.sg(base)})${b.sup(e)}`);
    if (aps.includes(7) && v > 0 && v <= 20) ops.push(() => `√${v * v}`);
    if (aps.includes(8)) ops.push(() => { const c = r.sig() * r.int(2, 4), a = v - 2 * c; return `${b.s(a)} + 2 · ${b.p(c)}`; });
  }
  return r.pick(ops.length > 1 && r.si(.75) ? ops.slice(1) : ops)();
}
function rondaRecta(rr) {
  return memo("recta" + rr, () => {
    const {aps, d} = CFG(), r = rng(100 + rr), n = d === 1 ? 5 : d === 2 ? 6 : 7, lim = d === 1 ? 10 : d === 2 ? 20 : 30, set = new Set();
    while (set.size < n) set.add(r.int(-lim, lim));
    const vals = r.mez([...set]);
    return {cartas: vals.map(v => ({v, t: forma(v, r, aps, d)})), orden: [...vals].sort((a, b) => a - b)};
  });
}
function rondaCadena(rr) {
  return memo("cadena" + rr, () => {
    const {aps, d} = CFG(), r = rng(200 + rr), soloSuma = !aps.some(a => a >= 5);
    const t = B().combinada(r, Math.max(2, d), soloSuma ? {solo: "sum"} : {maxPasos: d === 3 ? 8 : 6});
    return {t, R: B().resolver(t), expr: B().texto(t)};
  });
}
/* número objetivo: fichas n0…n4, op + − · :, paréntesis l r */
function tokens(code) { const out = []; const re = /n(\d)|([pmxd])|([lr])/g; let m; while ((m = re.exec(code))) out.push(m[1] !== undefined ? {n: +m[1]} : m[2] ? {o: m[2]} : {par: m[3]}); return out; }
function evaluar(tk, nums) {
  let i = 0;
  const prim = () => { const t = tk[i]; if (!t) throw 0; if (t.n !== undefined) { i++; if (t.n >= nums.length) throw 0; return nums[t.n]; } if (t.par === "l") { i++; const v = suma(); if (tk[i]?.par !== "r") throw 0; i++; return v; } throw 0; };
  const prod = () => { let v = prim(); while (tk[i] && (tk[i].o === "x" || tk[i].o === "d")) { const o = tk[i++].o, w = prim(); if (o === "x") v *= w; else { if (w === 0 || v % w) throw 0; v /= w; } } return v; };
  const suma = () => { let v = prod(); while (tk[i] && (tk[i].o === "p" || tk[i].o === "m")) { const o = tk[i++].o, w = prod(); v = o === "p" ? v + w : v - w; } return v; };
  try { const v = suma(); if (i !== tk.length) return null; const usados = tk.filter(t => t.n !== undefined).map(t => t.n); if (new Set(usados).size !== usados.length) return null; return v; } catch (e) { return null; }
}
const tokTxt = (tk, nums) => tk.map(t => t.n !== undefined ? (nums[t.n] < 0 ? `(${B().s(nums[t.n])})` : String(nums[t.n])) : t.o ? ` ${{p: "+", m: "−", x: "·", d: ":"}[t.o]} ` : t.par === "l" ? "(" : ")").join("").replace(/\( /g, "(").replace(/ \)/g, ")");
function rondaObjetivo(rr) {
  return memo("obj" + rr, () => {
    const {d} = CFG(), r = rng(300 + rr);
    for (let k = 0; k < 400; k++) {
      const nums = Array.from({length: 5}, () => r.sig() * r.int(1, d === 3 ? 12 : 9));
      if (new Set(nums).size < 4) continue;
      const idx = r.mez([0, 1, 2, 3, 4]).slice(0, d === 1 ? 3 : r.int(3, 4)), ops = idx.slice(1).map(() => r.pick(d === 1 ? ["p", "m", "x"] : ["p", "m", "x", "x", "d"]));
      let code = "";
      if (d >= 2 && r.si(.5)) code = `ln${idx[0]}${ops[0]}n${idx[1]}r` + idx.slice(2).map((n, j) => ops[j + 1] + "n" + n).join("");
      else code = `n${idx[0]}` + idx.slice(1).map((n, j) => ops[j] + "n" + n).join("");
      const v = evaluar(tokens(code), nums);
      if (v === null || Math.abs(v) < 3 || Math.abs(v) > (d === 1 ? 40 : 80) || nums.includes(v)) continue;
      return {nums, obj: v, sol: code};
    }
    return {nums: [3, -4, 5, 2, -1], obj: -7, sol: "n0xn1pn2"};
  });
}
/* ascensor: historia entera, ronda a ronda */
const HIST = [
  {id: "ascensor", ic: "🛗", t: "el ascensor", min: -5, max: 14, sube: "sube", baja: "baja", u: n => n === 1 ? "planta" : "plantas", ini: () => 0, k: [1, 6], fmt: v => v === 0 ? "planta baja (0)" : v < 0 ? `sótano ${-v} (${B().s(v)})` : `planta ${v}`, preg: "¿En qué planta está ahora?"},
  {id: "termo", ic: "🌡️", t: "la temperatura", min: -25, max: 40, sube: "sube", baja: "baja", u: n => n === 1 ? "grado" : "grados", ini: r => r.int(-6, 12), k: [2, 9], fmt: v => `${B().s(v)} °C`, preg: "¿Qué temperatura marca ahora?"},
  {id: "sub", ic: "🤿", t: "el submarino", min: -300, max: 0, sube: "sube", baja: "baja", u: () => "m", ini: r => -10 * r.int(2, 8), k: [10, 60], paso: 10, fmt: v => v === 0 ? "superficie (0 m)" : `${B().s(v)} m`, preg: "¿A qué altura está ahora? (negativo = bajo el mar)"},
  {id: "banco", ic: "💶", t: "la cuenta del banco", min: -150, max: 250, sube: "ingresa", baja: "gasta", u: () => "€", ini: r => 5 * r.int(0, 10), k: [5, 45], paso: 5, fmt: v => `${B().s(v)} €`, preg: "¿Cuánto dinero queda en la cuenta? (negativo = números rojos)"}
];
function historia() {
  return memo("hist", () => {
    const {d} = CFG(), r = rng(400), H = HIST[r.int(0, HIST.length - 1)], n = Math.max(1, sala().dur), pasos = [];
    let v = H.ini(r);
    const paso = (lo, hi) => { const p = H.paso || 1; return p * r.int(Math.ceil(lo / p), Math.floor(hi / p)); };
    for (let i = 0; i < n; i++) {
      const antes = v; let txt, cambio;
      const uno = () => { let k = paso(H.k[0], H.k[1]), s = r.sig(); if (v + s * k > H.max || v + s * k < H.min) s = -s; if (v + s * k > H.max || v + s * k < H.min) k = H.paso || 1; return [s * k, `${s > 0 ? H.sube : H.baja} ${k} ${H.u(k)}`]; };
      if (d === 1 || (d === 2 && r.si(.4))) { const [c, t] = uno(); cambio = c; txt = t; }
      else if (d === 2 || r.si(.5)) { const [c1, t1] = uno(); v += c1; const [c2, t2] = uno(); v -= c1; cambio = c1 + c2; txt = `${t1} y luego ${t2}`; if (v + cambio > H.max || v + cambio < H.min) { cambio = c1; txt = t1; } }
      else { const k = paso(H.k[0], Math.max(H.k[0], Math.floor(H.k[1] / 2))), veces = r.int(2, 4); let s = r.sig(); if (v + s * k * veces > H.max || v + s * k * veces < H.min) s = -s; if (v + s * k * veces > H.max || v + s * k * veces < H.min) { const [c, t] = uno(); cambio = c; txt = t; } else { cambio = s * k * veces; txt = `${s > 0 ? H.sube : H.baja} ${k} ${H.u(k)}, ${veces} veces seguidas`; } }
      v = antes + cambio;
      pasos.push({antes, cambio, despues: v, txt: `${H.t[0].toUpperCase() + H.t.slice(1)} ${txt}.`});
    }
    return {H, pasos};
  });
}
function rondaApuesta(rr) {
  return memo("ap" + rr, () => {
    const {aps, d} = CFG(), r = rng(500 + rr), P = pregNum(r, aps, d), verdad = r.si(.5);
    const falso = r.pick(B().malos({sol: P.sol, mal: P.q?.mal}, r, 3));
    const expr = P.txt.replace(" = ▢", "").replace(" → ▢", "");
    return {expr, frase: P.txt.includes("▢") && !P.txt.endsWith("= ▢") && !P.txt.endsWith("→ ▢") ? P.txt.replace("▢", B().s(verdad ? P.sol : falso)) : `${expr} ${P.txt.endsWith("→ ▢") ? "→" : "="} ${B().s(verdad ? P.sol : falso)}`, verdad, sol: P.sol, hueco: P.txt.includes("▢") && !P.txt.endsWith("= ▢") && !P.txt.endsWith("→ ▢")};
  });
}
function juegoCartas() {
  return memo("cartas", () => {
    const {aps, d} = CFG(), r = rng(600), huecos = [], usados = new Set();
    if (esP2()) { const X = BT().cartas(r, d); return {huecos: X.huecos, cartas: r.mez([...X.huecos.map((h, i) => ({v: h.sol, h: i})), ...X.trampas.map(v => ({v, h: -1}))])}; }
    for (let i = 0; i < 8; i++) { const P = pregNum(r, aps, d, usados); usados.add(P.sol); huecos.push(P); }
    const trampas = []; for (const h of r.mez(huecos)) { for (const m of B().malos({sol: h.sol, mal: h.q?.mal}, r, 3)) if (!usados.has(m) && trampas.length < 2 && !trampas.includes(m)) { trampas.push(m); break; } if (trampas.length >= 2) break; }
    const cartas = r.mez([...huecos.map((h, i) => ({v: h.sol, h: i})), ...trampas.map(v => ({v, h: -1}))]);
    return {huecos, cartas};
  });
}
/* escape: operaciones con letras; las letras repartidas entre el equipo */
function arbolPara(r, aps, d) {
  const b = B(), ap = r.pick(aps);
  if (ap === 3) return b.GR([b.N(r.nz(-15, 15)), r.pick(["+", b.M]), b.N(r.nz(-15, 15))]);
  if (ap === 4 || ap === 1 || ap === 2) return b.combinada(r, Math.max(1, d), {solo: "sum", lim: 60});
  if (ap === 5) { const x = r.sig() * r.int(2, 6), y = r.sig() * r.int(2, 6), z = r.sig() * r.int(2, 4); return r.si(.5) ? b.GR([b.N(x * z), ":", b.N(z), "·", b.N(y)]) : b.GR([b.N(x), "·", b.N(y), "+", b.N(z)]); }
  if (ap === 6) return b.GR([b.POT(r.sig() * r.int(2, 4), r.int(2, 3)), r.pick(["+", b.M, "·"]), b.N(r.sig() * r.int(2, 9))]);
  if (ap === 7) return b.GR([b.RAIZ(r.int(2, 12) ** 2), r.pick(["+", b.M, "·"]), b.N(r.sig() * r.int(2, 9))]);
  return b.combinada(r, Math.max(2, d), {maxPasos: 5});
}
const LETRAS = "ABCDEFGH";
function letrear(t) {
  const datos = [];
  const va = x => { if (x.k === "n" || x.k === "p" || x.k === "r") { if (datos.length < 6) { const L1 = LETRAS[datos.length]; datos.push({L: L1, v: x.k === "n" ? x.v : x.k === "p" ? x.b : x.v}); x.L = L1; } } else if (x.k === "g") x.it.forEach((y, i) => { if (i % 2 === 0) va(y); }); };
  va(t);
  const tx = x => { if (x.k === "n") return x.L || (x.v < 0 ? `(${B().s(x.v)})` : B().s(x.v)); if (x.k === "p") return (x.neg ? B().M : "") + (x.L || (x.b < 0 ? `(${B().s(x.b)})` : x.b)) + B().sup(x.e); if (x.k === "r") return (x.neg ? B().M : "") + "√" + (x.L || x.v); const c = x.it.map((y, i) => i % 2 ? ` ${y} ` : tx(y)).join(""); return x.br === "(" ? `(${c})` : x.br === "[" ? `[${c}]` : c; };
  return {plantilla: tx(t), datos};
}
function juegoEscape() {
  return memo("escape", () => {
    const {aps, d} = CFG(), r = rng(700), cands = [];
    if (esP2()) return BT().escape(r, d);
    for (let i = 0; i < 4; i++) { let t, v; for (let k = 0; k < 50; k++) { t = arbolPara(r, aps, d); v = B().valorDe(t); if (Number.isInteger(v) && Math.abs(v) <= 200) break; } const {plantilla, datos} = letrear(B().clon(t)); cands.push({plantilla, datos, v, expr: B().texto(t)}); }
    return {cands, final: cands.reduce((a, c) => a + c.v, 0)};
  });
}

/* 🏷️ oferta y 🧩 monta (4.º ESO PDC) */
const rondaOferta = rr => memo("of" + rr, () => BT().oferta(rng(800 + rr), CFG().d));
const rondaMonta = rr => memo("mo" + rr, () => BT().monta(rng(900 + rr), CFG().d));

/* ---------- jugadores, equipos y unidades ---------- */
const yoId = () => mem().play[sala()?.codigo]?.id;
const yo = () => E.st?.jugadores.find(j => j.id === yoId());
const porEq = () => !!sala()?.equipos;
const miembros = e => (E.st?.jugadores || []).filter(j => j.e === e);
const eqNombre = e => EQN[(e - 1) % 8];
const unidades = () => porEq() ? Array.from({length: sala().equipos}, (_, i) => i + 1).filter(e => miembros(e).length).map(e => ({u: "e" + e, e, n: eqNombre(e), c: COLORES[(e - 1) % 8]})) : (E.st?.jugadores || []).map((j, i) => ({u: "j" + j.id, j, n: j.n, c: COLORES[i % 8]}));
const miU = () => { const y = yo(); return !y ? null : porEq() ? "e" + y.e : "j" + y.id; };
function ev(u, k) { const v = E.st?.ev?.[`${u}:${k}`]; if (v == null) return null; const s = String(v), i = s.lastIndexOf("|"); return i < 0 ? {v: s, ms: 0, n: +s} : {v: s.slice(0, i), ms: +s.slice(i + 1)}; }
const num = (u, k) => +(ev(u, k)?.v || 0);
const rondas = () => jg()?.tipo === "rondas";
const finRonda = () => sala().tr + sala().rd * 1000;
const finLibre = () => sala().t0 + sala().dur * 60000;
const hecho = (u, rr) => { const j = jid(); if (j === "recta") return !!ev(u, `r${rr}ok`); if (j === "oferta") return !!ev(u, `r${rr}`) && !!ev(u, `r${rr}p`); if (j === "monta") return !!ev(u, `r${rr}`); if (j === "cadena") return pasosHechos(u, rr) >= rondaCadena(rr).R.pasos.length; if (j === "objetivo") { const x = ev(u, `r${rr}`); return !!x && valorObj(x.v, rr) === rondaObjetivo(rr).obj; } if (j === "ascensor") return !!ev(u, `r${rr}`); if (j === "apuesta") return !!ev(u, `r${rr}`) && !!ev(u, `r${rr}d`); return false; };
const todosHechos = rr => { const us = unidades(); return us.length > 0 && us.every(u => hecho(u.u, rr)); };
const rondaAbierta = () => sala()?.fase === "juego" && rondas() && sala().cerrada !== sala().r && ahora() < finRonda() && !todosHechos(sala().r);
const libreAcabado = () => { const s = sala(); if (!s) return false; if (s.fase === "fin") return true; if (s.fase !== "juego" || rondas()) return false; if (ahora() >= finLibre()) return true; const us = unidades(); return us.length > 0 && us.every(u => libreHecho(u.u)); };
const libreHecho = u => jid() === "escape" ? !!ev(u, "fin") : jid() === "cartas" ? juegoCartas().huecos.every((_, i) => ev(u, "h" + i)) : false;
const valorObj = (code, rr) => evaluar(tokens(code), rondaObjetivo(rr).nums);

/* ---------- puntos ---------- */
const rapidez = (ms, tot) => Math.round(500 * Math.max(0, 1 - ms / tot));
function puntosRonda(u, rr) {
  const j = jid(), tot = sala().rd * 1000;
  if (j === "recta") { const x = ev(u, `r${rr}ok`), errs = num(u, `r${rr}e`); return x ? Math.max(200, 1000 + rapidez(x.ms, tot) - 150 * errs) : 0; }
  if (j === "cadena") { const n = rondaCadena(rr).R.pasos.length, h = pasosHechos(u, rr), errs = num(u, `r${rr}e`), ult = ev(u, `r${rr}p${n - 1}`); return h >= n ? Math.max(200, 1000 + rapidez(ult.ms, tot) - 100 * errs) : Math.round(600 * h / n); }
  if (j === "objetivo") { const x = ev(u, `r${rr}`); if (!x) return 0; const v = valorObj(x.v, rr); if (v === null) return 0; const dd = Math.abs(v - rondaObjetivo(rr).obj); return dd === 0 ? 1000 + rapidez(x.ms, tot) : Math.max(0, 600 - 100 * dd); }
  if (j === "ascensor") { const x = ev(u, `r${rr}`); return x && +x.v === historia().pasos[rr]?.despues ? 500 + rapidez(x.ms, tot) : 0; }
  if (j === "oferta") { const x = ev(u, `r${rr}`), O = rondaOferta(rr); if (!x || +x.v !== O.mejor) return 0; const p = ev(u, `r${rr}p`), v = p ? BT().leer(p.v) : null; return 500 + rapidez(x.ms, tot) + (v !== null && BT().igual(v, O.ofertas[O.mejor].final) ? 300 : 0); }
  if (j === "monta") { const x = ev(u, `r${rr}`); return x ? Math.max(200, 1000 + rapidez(x.ms, tot) - 150 * (+x.v || 0)) : 0; }
  return 0;
}
function pasosHechos(u, rr) { const n = rondaCadena(rr).R.pasos.length; let h = 0; while (h < n && ev(u, `r${rr}p${h}`)) h++; return h; }
/* atrapa los puntos: el saldo hasta la ronda «hasta» (sin contarla) */
function apuestaRes(u, rr) {
  const x = ev(u, `r${rr}`); if (!x) return null;
  const R0 = rondaApuesta(rr), dice = x.v[0] === "v", cant = +x.v.slice(1), dem = ev(u, `r${rr}d`), bien = dice === R0.verdad, prueba = !!dem && +dem.v === R0.sol;
  return {dice, cant, bien, prueba, gana: bien ? cant * (prueba ? 2 : 1) : -cant};
}
function saldo(u, hasta) { let s = SALDO; for (let rr = 0; rr < hasta; rr++) { const a = apuestaRes(u, rr); if (a) s = Math.max(0, s + a.gana); } return s; }
function cerradas() { const s = sala(); if (!s || s.fase === "espera") return 0; if (s.fase === "fin") return Math.min(s.dur, s.r + 1); return rondaAbierta() ? s.r : s.r + 1; }
function marcador() {
  const j = jid(), us = unidades();
  const filas = us.map(u => {
    let pts = 0, info = "";
    if (rondas()) {
      if (j === "apuesta") { pts = saldo(u.u, cerradas()); }
      else for (let rr = 0; rr < cerradas(); rr++) pts += puntosRonda(u.u, rr);
    } else if (j === "cartas") {
      const C = juegoCartas(), h = C.huecos.filter((_, i) => ev(u.u, "h" + i)).length, errs = num(u.u, "err"), ult = Math.max(0, ...C.huecos.map((_, i) => ev(u.u, "h" + i)?.ms || 0));
      pts = h * 100 - errs * 20 + (h === 8 ? Math.max(0, Math.round(500 * (1 - ult / (sala().dur * 60000)))) : 0); info = `${h}/8`;
    } else if (j === "escape") {
      const ab = [0, 1, 2, 3].filter(k => ev(u.u, "c" + k)).length, f = ev(u.u, "fin"), pen = [0, 1, 2, 3, 4].reduce((a, k) => a + num(u.u, "x" + k), 0) * 30000;
      pts = f ? 10000 - Math.round((f.ms + pen) / 1000) : ab * 1000 - pen / 1000; info = f ? `🔓 ${mmss(f.ms + pen)}` : `${ab}/4 🔒`;
    }
    return {...u, pts: Math.round(pts), info};
  });
  return filas.sort((a, b) => b.pts - a.pts || a.n.localeCompare(b.n));
}

/* ---------- pintar ---------- */
let APP = null, vista = "", cod = null, juegoRuta = "recta";
const RE = /^mates-(grupo|duelo|concurso|juego-([a-z]+)|sala-(\d{6})|pizarra-(\d{6}))$/;
const isGrupo = h => RE.test(h);
const enGrupo = () => isGrupo(location.hash.slice(1));
function parar() { clearInterval(E.poll); clearInterval(E.tick); E.poll = E.tick = null; }
function vigilar(c) {
  parar();
  const una = async () => {
    if (document.hidden || !enGrupo()) return;
    const r = await api("GET", null, "&sala=" + c);
    if (!enGrupo()) return parar();
    if (r.ok) { recibir(r); pintar(); autoHost(); }
    else if (r.status === 404) { E.err = "no_existe"; E.st = null; parar(); pintar(true); }
  };
  E.poll = setInterval(una, 1500);
  E.tick = setInterval(() => { if (!enGrupo()) return parar(); reloj(); const f = tiempoFirma(); if (f !== E.tf) { E.tf = f; pintar(true); } }, 400);
}
const tiempoFirma = () => { const s = sala(); if (!s) return ""; return [rondaAbierta() ? 1 : 0, libreAcabado() ? 1 : 0, E.ui.bloq && E.ui.bloq > ahora() ? 1 : 0, jid() === "escape" && s.fase === "juego" && miU() ? [0, 1, 2, 3, 4].filter(k => frz(k) > ahora()).length : ""].join(""); };
function reloj() {
  const s = sala(); if (!s) return;
  let t = 0;
  if (s.fase === "espera") t = rondas() ? s.rd * 1000 : s.dur * 60000;
  else if (s.fase === "juego") t = rondas() ? (rondaAbierta() ? finRonda() - ahora() : 0) : finLibre() - ahora();
  for (const el of document.querySelectorAll("[data-mg-reloj]")) el.textContent = mmss(t);
  for (const el of document.querySelectorAll("[data-mg-bloq]")) { const q = +el.dataset.mgBloq - ahora(); el.textContent = q > 0 ? `🔒 ${Math.ceil(q / 1000)} s` : ""; }
}
/* el anfitrión cierra solo una partida libre cuando se acaba el tiempo */
let autoT = 0;
function autoHost() {
  const s = sala(); if (!s || !mem().host[s.codigo] || s.fase !== "juego" || Date.now() - autoT < 4000) return;
  if (!rondas() && libreAcabado()) { autoT = Date.now(); host({accion: "terminar"}); }
}
function render(app) {
  APP = app;
  const h = location.hash.slice(1), m = h.match(RE); if (!m) return;
  const nueva = m[4] ? "pizarra" : m[3] ? "sala" : m[2] ? "juego" : m[1] === "duelo" || m[1] === "concurso" ? m[1] : "grupo", c = m[3] || m[4] || null;
  if (m[2] && J[m[2]]) juegoRuta = m[2];
  if (nueva !== vista || c !== cod) { if (c !== cod) parar(); vista = nueva; cod = c; E.msg = ""; E.err = ""; E.firma = ""; E.ui = {}; if (!c) { parar(); E.st = null; } else if (E.st?.sala.codigo !== c) E.st = null; }
  document.body.classList.toggle("mg-pizarra", vista === "pizarra");
  try { L().setAcc?.((c && jg() ? jg() : J[juegoRuta]).c); } catch (e) {}
  if (c) { if (!E.poll) vigilar(c); if (!E.st && !E.err) { app.innerHTML = `<section class="wrap mt"><p class="msg">Cargando la sala…</p></section>`; primera(c); return; } }
  pintar(true);
}
async function primera(c) {
  const r = await api("GET", null, "&sala=" + c);
  if (r.ok) recibir(r); else E.err = r.status === 404 ? "no_existe" : r.error || "red";
  pintar(true);
}
function pintar(forzar) {
  if (!APP || !enGrupo()) return;
  const firma = [vista, JSON.stringify(E.st && {...E.st, ahora: 0}), E.msg, E.err, tiempoFirma(), E.busy ? 1 : 0, JSON.stringify(E.ui)].join("§");
  if (!forzar && firma === E.firma) return;
  E.firma = firma;
  const act = document.activeElement, idf = act && act.id && APP.contains(act) ? act.id : null, val = {}, y0 = scrollY;
  for (const el of APP.querySelectorAll("input[id]")) val[el.id] = el.type === "checkbox" ? el.checked : el.value;
  let html;
  if (vista === "grupo") html = grupoHTML();
  else if (vista === "juego") html = juegoHTML();
  else if (vista === "duelo" || vista === "concurso") html = preguntasHTML(vista);
  else if (E.err && !sala()) html = `<section class="wrap mt"><div class="mt-box"><p>${esc(ERR[E.err] || ERR.red)}</p><a class="btn" href="#mates-grupo">← Juegos de mates</a></div></section>`;
  else if (vista === "pizarra") html = pizarraHTML();
  else html = salaHTML();
  APP.innerHTML = html;
  for (const id in val) { const el = document.getElementById(id); if (el && el.tagName === "INPUT") { if (el.type === "checkbox") el.checked = val[id]; else el.value = val[id]; } }
  if (idf) { const el = document.getElementById(idf); if (el) try { el.focus({preventScroll: true}); } catch (e) {} }
  if (!forzar || E.mantener) scrollTo(0, y0);
  reloj();
}
const aviso = () => E.msg ? `<p class="rt-aviso ${E.msgOk ? "ok" : ""}" role="status">${esc(E.msg)}</p>` : "";
function avisar(t, ok) { E.msg = t; E.msgOk = !!ok; clearTimeout(avisar.t); avisar.t = setTimeout(() => { E.msg = ""; pintar(true); }, 2600); if (!ok && navigator.vibrate) try { navigator.vibrate(150); } catch (e) {} pintar(true); }

/* tarjetas para otras páginas (Mates, En grupo) */
/* tema: solo los juegos de ese tema (en #mates-t2 o #mates-p2); sin tema, todos */
function tiles(tema) {
  const lista = ORDEN.filter(j => !tema || (J[j].temas || ["t2"]).includes(tema)), dt = tema ? ` data-mg-tema="${tema}"` : "";
  const nombre = j => tema === "p2" && j === "cartas" ? "Parejas de porcentajes" : tema === "p2" && j === "escape" ? "Escape room «La tienda»" : J[j].n;
  const desc = j => tema === "p2" && j === "cartas" ? "«Rebajar un 20 % es multiplicar por ▢»… y las soluciones como cartas." : tema === "p2" && j === "escape" ? "Rebajas, IVA y repartos para abrir los candados." : J[j].p;
  return `<div class="mg-tiles">${lista.map(j => `<a class="mg-tile" href="#mates-juego-${j}" style="--c:${J[j].c}"${dt}><span class="mg-ic" aria-hidden="true">${J[j].ic}</span><span><b>${esc(nombre(j))}</b><small>${esc(desc(j))}</small><em>${J[j].eq ? "Por equipos" : "Solos o por equipos"}${!tema && J[j].temas?.[0] === "p2" ? " · 4.º PDC" : ""}</em></span></a>`).join("")}
    <a class="mg-tile" href="#mates-duelo" style="--c:#ff4141"${dt}><span class="mg-ic" aria-hidden="true">⚔️</span><span><b>Duelo de mates</b><small>Preguntas a la vez contra tu clase. Acertar rápido da más puntos.</small><em>Con cuenta</em></span></a>
    <a class="mg-tile" href="#mates-concurso" style="--c:#f5b700"${dt}><span class="mg-ic" aria-hidden="true">🏆</span><span><b>Concurso de mates</b><small>Preguntas en la pantalla grande y respuestas en el móvil.</small><em>Se puede editar</em></span></a></div>`;
}
function codigoForm() {
  return `<form class="mt-box" data-mg-form="ir" style="--c:var(--acc)"><h2>🔑 Entrar con código</h2><div class="mg-mini"><input id="mg-cod" inputmode="numeric" maxlength="7" autocomplete="off" placeholder="123456" aria-label="Código de la sala"><button class="btn main">Entrar</button></div></form>`;
}
function grupoHTML() {
  return `<section class="wrap mt"><p class="mt-migas"><a href="#mates">← Matemáticas</a></p><h1 class="mt-h1">🏫 Mates en grupo</h1>
    <p class="mt-lead">Juegos para la clase con sala y código. Quien crea la sala elige los apartados del tema y la dificultad; los demás entran con el código desde su móvil, sin cuenta.</p>
    ${aviso()}${codigoForm()}<h2 class="mt-h2">Crear una sala</h2>${tiles()}</section>`;
}
/* el tema (1.º ESO o 4.º PDC), si el juego tiene los dos */
function temaSel(c, temas) {
  const TT = (temas || ["t2", "p2"]).map(id => window.LYAMatesTemas?.tema?.(id)).filter(Boolean);
  if (TT.length < 2) return "";
  return `<label for="mg-tema">Tema</label><select id="mg-tema" data-mg-c="tema">${TT.map(T => `<option value="${T.id}" ${c.tema === T.id ? "selected" : ""}>${esc(LYAMatesTemas.cursoDe(T.id).n)} · ${esc(T.titulo)}</option>`).join("")}</select>`;
}
function apsHTML(c) {
  const T = window.LYAMatesTemas?.tema?.(c.tema || "t2") || window.LYAMatesTemas?.T2;
  return `<label>Apartados del tema ${T.n} (${esc(T.titulo.toLowerCase())})</label><div class="mg-aps" role="group" aria-label="Apartados">${T.aps.map(a => `<label><input type="checkbox" id="mg-ap${a.n}" data-mg-ap="${a.n}" ${c.aps.includes(a.n) ? "checked" : ""}> ${a.n}. ${esc(a.titulo)}</label>`).join("")}</div>`;
}
function juegoHTML() {
  const j = juegoRuta, g = J[j], temas = g.temas || ["t2"], t0 = temas.includes(temaPref) ? temaPref : temas[0];
  const c = E.crear?.j === j ? E.crear : (E.crear = {j, tema: t0, d: 1, ...g.def, aps: [...(t0 === "t2" && g.def.aps || [1, 2, 3, 4, 5, 6, 7, 8])], juega: !esProfe()});
  const minEq = g.eq ? 1 : 0;
  const eqOps = [...(minEq ? [] : [0]), 1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}" ${+c.equipos === n ? "selected" : ""}>${n === 0 ? "Cada uno por su cuenta" : n === 1 ? "1 equipo (toda la clase)" : n + " equipos"}</option>`).join("");
  const durOps = rondas2(j) ? [3, 4, 5, 6, 8, 10, 12, 15].map(n => `<option value="${n}" ${+c.dur === n ? "selected" : ""}>${n} rondas</option>`).join("") : [5, 8, 10, 12, 15, 20, 25, 30].map(n => `<option value="${n}" ${+c.dur === n ? "selected" : ""}>${n} minutos</option>`).join("");
  const rdOps = [20, 30, 40, 60, 90, 120, 180].map(n => `<option value="${n}" ${+c.rd === n ? "selected" : ""}>${n < 60 ? n + " s" : n / 60 + " min"}</option>`).join("");
  return `<section class="wrap mt" style="--c:${g.c}"><p class="mt-migas"><a href="#mates-grupo">← Mates en grupo</a></p>
    <h1 class="mt-h1">${g.ic} ${esc(g.n)}</h1><p class="mt-lead">${esc(g.p)}</p>${aviso()}
    <details class="rt-como" open><summary>Cómo se juega</summary><ol>${comoDe(g, c.tema).map(x => `<li>${esc(x)}</li>`).join("")}</ol></details>
    <div class="rt-dos">${codigoForm()}
      <form class="mt-box" data-mg-form="crear"><h2>✨ Crear sala</h2>
        ${temaSel(c, temas)}${c.tema === "p2" ? `<p class="mt-small">Con preguntas de todo el tema 2 (proporcionalidad y porcentajes).</p>` : apsHTML(c)}
        <label for="mg-d">Dificultad</label><select id="mg-d" data-mg-c="d">${[1, 2, 3].map(d => `<option value="${d}" ${+c.d === d ? "selected" : ""}>${DIF[d]}</option>`).join("")}</select>
        <label for="mg-eq">Equipos</label><select id="mg-eq" data-mg-c="equipos">${eqOps}</select>
        <div class="rt-fila"><div><label for="mg-dur">${rondas2(j) ? "Rondas" : "Duración"}</label><select id="mg-dur" data-mg-c="dur">${durOps}</select></div>
          ${rondas2(j) ? `<div><label for="mg-rd">Tiempo por ronda</label><select id="mg-rd" data-mg-c="rd">${rdOps}</select></div>` : ""}</div>
        <label class="check" style="color:var(--ink)"><input type="checkbox" id="mg-juega" data-mg-c="juega" ${c.juega ? "checked" : ""}> Voy a jugar yo también</label>
        <p class="rt-err">${esc(E.err ? ERR[E.err] || E.err : "")}</p>
        <button class="btn main" ${E.busy || !c.aps.length ? "disabled" : ""}>${g.ic} Crear sala</button></form></div></section>`;
}
const rondas2 = j => J[j].tipo === "rondas";
/* ⚔️ duelo y 🏆 concurso de mates: preguntas de opciones generadas con una semilla (se crean en duelo/ y concursos/) */
function preguntasHTML(tipo) {
  const c = E.crear?.j === tipo ? E.crear : (E.crear = {j: tipo, tema: temaPref === "p2" ? "p2" : "t2", aps: [1, 2, 3, 4, 5, 6, 7, 8], d: 1, n: 10, D: 30, juega: !esProfe()});
  const cuenta = window.LYACuentas?.usuario;
  const duelo = tipo === "duelo";
  return `<section class="wrap mt" style="--c:${duelo ? "#ff4141" : "#f5b700"}"><p class="mt-migas"><a href="#mates-grupo">← Mates en grupo</a></p>
    <h1 class="mt-h1">${duelo ? "⚔️ Duelo de mates" : "🏆 Concurso de mates"}</h1>
    <p class="mt-lead">${duelo ? "Todos contestáis las mismas preguntas a la vez desde el móvil. Acertar rápido da más puntos. Hace falta cuenta." : "Se prepara un concurso con preguntas de mates. Lo puedes revisar y cambiar antes de jugarlo en la pantalla grande o de guardarlo."}</p>${aviso()}
    <form class="mt-box" data-mg-form="${tipo}"><h2>✨ Preguntas</h2>
      ${temaSel(c)}${apsHTML(c)}
      <div class="rt-fila"><div><label for="mg-d">Dificultad</label><select id="mg-d" data-mg-c="d">${[1, 2, 3].map(d => `<option value="${d}" ${+c.d === d ? "selected" : ""}>${DIF[d]}</option>`).join("")}</select></div>
        <div><label for="mg-n">Preguntas</label><select id="mg-n" data-mg-c="n">${[5, 8, 10, 12, 15, 20].map(n => `<option value="${n}" ${+c.n === n ? "selected" : ""}>${n}</option>`).join("")}</select></div></div>
      ${duelo ? `<label for="mg-dd">Tiempo por pregunta</label><select id="mg-dd" data-mg-c="D">${[15, 20, 30, 45, 60].map(n => `<option value="${n}" ${+c.D === n ? "selected" : ""}>${n} s</option>`).join("")}</select>
        ${esProfe() ? `<label class="check" style="color:var(--ink)"><input type="checkbox" id="mg-juega" data-mg-c="juega" ${c.juega ? "checked" : ""}> Voy a jugar yo también</label>` : ""}
        ${cuenta ? "" : `<p class="rt-err">Para crear un duelo hace falta entrar con tu cuenta. <button type="button" class="btn" data-mg="login">🔑 Entrar</button></p>`}` : ""}
      <p class="rt-err">${esc(E.err || "")}</p>
      <button class="btn main" ${E.busy || !c.aps.length ? "disabled" : ""}>${duelo ? "⚔️ Crear el duelo" : "🏆 Preparar el concurso"}</button></form></section>`;
}

/* ---------- la sala (móvil del alumno) ---------- */
function cabeza(extra = "") {
  const s = sala(), g = jg(), cfg = CFG();
  return `<p class="mt-migas"><a href="#mates-juego-${jid()}">← ${esc(g.n)}</a> · Código <b>${esc(s.codigo)}</b> · ${esc(cfg.tema === "p2" ? "4.º PDC · Proporcionalidad y porcentajes" : cfg.aps.length === 8 ? "Todo el tema" : "Apartados " + cfg.aps.join(", "))} · ${DIF[cfg.d]}</p>
    <div class="rt-top" style="--c:${g.c}"><span>${g.ic} <b>${esc(g.n)}</b>${extra}</span>${s.fase === "juego" ? `<span class="rt-reloj">⏱ <b data-mg-reloj>--:--</b>${rondas() ? ` · Ronda ${s.r + 1}/${s.dur}` : ""}</span>` : ""}</div>`;
}
function mandoHTML() {
  const s = sala(); if (!mem().host[s.codigo]) return "";
  if (s.fase === "espera") return `<p class="mt-acc"><button class="btn main" data-mg="empezar" ${E.st.jugadores.length ? "" : "disabled"}>🚀 Empezar</button> <a class="btn" href="#mates-pizarra-${s.codigo}">📺 Pizarra</a></p>`;
  if (s.fase === "juego") return `<p class="mt-acc">${rondas() ? (rondaAbierta() ? `<button class="btn" data-mg="cerrar">⏹ Cerrar la ronda</button>` : s.r + 1 < s.dur ? `<button class="btn main" data-mg="ronda">⏭ Siguiente ronda</button>` : `<button class="btn main" data-mg="terminar">🏁 Ver resultados</button>`) : ""} <button class="btn" data-mg="terminar">Terminar</button></p>`;
  return "";
}
function salaHTML() {
  const s = sala(), g = jg(), y = yo();
  if (!g) return `<section class="wrap mt"><div class="mt-box"><p>Esta sala no es de mates.</p><a class="btn" href="#reto-${esc(s.codigo)}">Abrirla</a></div></section>`;
  let body;
  if (!y || E.ui.cambiar) body = unirmeHTML();
  else if (s.fase === "espera") body = `<div class="mt-box" style="--c:${g.c}"><h2>⏳ Esperando a que empiece…</h2><p>Estás dentro como <b>${esc(y.n)}</b>${porEq() ? ` en <b>${esc(eqNombre(y.e))}</b>` : ""}.</p>
    ${porEq() ? equiposLista() : `<p class="mt-small">${E.st.jugadores.map(j => esc(j.n)).join(" · ")}</p>`}
    <details class="rt-como"><summary>Cómo se juega</summary><ol>${comoDe(g, CFG().tema).map(x => `<li>${esc(x)}</li>`).join("")}</ol></details>
    ${s.fase === "espera" ? `<p><button class="btn" data-mg="cambiar">Cambiar nombre o equipo</button></p>` : ""}</div>`;
  else if (s.fase === "fin" || libreAcabado()) body = finHTML();
  else body = jugarHTML();
  return `<section class="wrap mt" style="--c:${g.c}">${cabeza(y && porEq() ? ` · ${esc(eqNombre(y.e))}` : "")}${aviso()}${mandoHTML()}${body}</section>`;
}
function equiposLista() { return `<div class="mg-eqs">${Array.from({length: sala().equipos}, (_, i) => i + 1).map(e => `<div class="mg-eq" style="--c:${COLORES[(e - 1) % 8]}"><b>${esc(eqNombre(e))}</b><span class="mt-small">${miembros(e).map(j => esc(j.n)).join(", ") || "—"}</span></div>`).join("")}</div>`; }
function unirmeHTML() {
  const s = sala(), m = mem();
  if (s.fase === "fin") return `<div class="mt-box"><p>Esta partida ya ha terminado.</p></div>${finHTML()}`;
  if (s.fase === "juego" && porEq()) return `<div class="mt-box"><p>${esc(ERR.empezada)}</p></div>`;
  const sel = E.ui.equipo || yo()?.e || 0;
  return `<form class="mt-box" data-mg-form="unirme"><h2>👋 Entrar en la sala</h2><label for="mg-nom">Tu nombre</label><input id="mg-nom" maxlength="20" autocomplete="off" value="${esc(yo()?.n || m.nombre || "")}">
    ${porEq() ? `<label>Elige equipo</label><div class="rt-eqs">${Array.from({length: s.equipos}, (_, i) => i + 1).map(e => `<button type="button" class="rt-eq ${sel === e ? "sel" : ""}" style="--c:${COLORES[(e - 1) % 8]}" data-mg="equipo" data-e="${e}"><b>${esc(eqNombre(e))}</b><small>${miembros(e).map(j => esc(j.n)).join(", ") || "—"}</small></button>`).join("")}</div>` : ""}
    <p><button class="btn main" ${E.busy ? "disabled" : ""}>Entrar</button></p></form>`;
}
function finHTML() {
  const rk = marcador(), mi = miU(), pos = rk.findIndex(x => x.u === mi);
  darXP(pos);
  return `<div class="mt-box"><h2>🏁 Resultados</h2>${pos >= 0 ? `<p class="mt-big">${["🥇", "🥈", "🥉"][pos] || "🎉"}</p><p>Habéis quedado en el puesto <b>${pos + 1}</b> de ${rk.length}.</p>` : ""}${tablaHTML(rk)}${solucionesHTML()}</div>`;
}
function tablaHTML(rk) { return `<table class="mg-tabla"><thead><tr><th>#</th><th>${porEq() ? "Equipo" : "Jugador"}</th><th>${jid() === "apuesta" ? "Saldo" : "Puntos"}</th></tr></thead><tbody>${rk.map((x, i) => `<tr${x.u === miU() ? ' style="font-weight:800"' : ""}><td>${i + 1}</td><td><span style="color:${x.c}">●</span> ${esc(x.n)} ${x.info ? `<small class="mt-small">${esc(x.info)}</small>` : ""}</td><td>${x.pts}</td></tr>`).join("")}</tbody></table>`; }
function darXP(pos) {
  const c = sala().codigo, m = mem(); if (m.xp[c] || pos < 0) return;
  m.xp[c] = Date.now(); guard.set(m);
  const n = 10 + ([30, 20, 15][pos] || 0);
  try { dispatchEvent(new CustomEvent("lya:xp", {detail: {xp: n, src: "mates-grupo"}})); } catch (e) {}
}
function solucionesHTML() {
  const j = jid();
  if (j === "escape") { const X = juegoEscape(); return `<details class="rt-como"><summary>Soluciones</summary><ol>${X.cands.map(c => `<li>${esc(c.plantilla)} con ${esc(c.datos.map(d => `${d.L} = ${S()(d.v)}`).join(", "))} → ${esc(c.expr)} = <b>${esc(S()(c.v))}</b></li>`).join("")}<li>Final: suma de los 4 = <b>${esc(S()(X.final))}</b></li></ol></details>`; }
  if (j === "cartas") { const C = juegoCartas(); return `<details class="rt-como"><summary>Soluciones</summary><ol>${C.huecos.map(h => `<li>${esc(h.txt.replace("▢", "[" + S()(h.sol) + "]"))}</li>`).join("")}</ol></details>`; }
  return "";
}

/* ---------- cada juego en el móvil ---------- */
function jugarHTML() {
  const j = jid();
  if (rondas() && !rondaAbierta()) return finRondaHTML(true);
  return {recta: jRecta, cadena: jCadena, objetivo: jObjetivo, ascensor: jAscensor, apuesta: jApuesta, cartas: jCartas, escape: jEscape, oferta: jOferta, monta: jMonta}[j]();
}
const teclado = (id, txt = "Enviar") => `<div class="mt-tec" role="group" aria-label="Teclado">${[7, 8, 9, 4, 5, 6, 1, 2, 3].map(n => `<button type="button" class="mt-k" data-mg="k" data-v="${n}" data-t="${id}">${n}</button>`).join("")}${esP2() ? `<button type="button" class="mt-k mt-kpm" data-mg="k" data-v="dec" data-t="${id}">,</button>` : `<button type="button" class="mt-k mt-kpm" data-mg="k" data-v="pm" data-t="${id}">±</button>`}<button type="button" class="mt-k" data-mg="k" data-v="0" data-t="${id}">0</button><button type="button" class="mt-k" data-mg="k" data-v="bs" data-t="${id}">⌫</button><button type="button" class="mt-k mt-kok" data-mg="k" data-v="ok" data-t="${id}">${txt}</button></div>`;
const pant = id => `<p class="mt-pant">${E.ui["in_" + id] ? esc(String(E.ui["in_" + id]).replace(/^-/, "−")) : '<span class="mt-ph">?</span>'}</p>`;
const bloqHTML = () => E.ui.bloq && E.ui.bloq > ahora() ? `<p class="mg-bloq" data-mg-bloq="${E.ui.bloq}"></p>` : "";

/* resultados de la ronda (móvil y pizarra) */
function finRondaHTML(movil) {
  const j = jid(), rr = sala().r, mi = miU();
  let sol = "";
  if (j === "recta") { const R0 = rondaRecta(rr); sol = `<p>Orden bueno:</p><p class="mg-grande" style="font-size:clamp(20px,4vw,34px)">${R0.orden.map(v => esc(SG()(v))).join(" &lt; ")}</p>${rectaSVG(R0.orden, R0.cartas)}`; }
  if (j === "cadena") { const C = rondaCadena(rr); sol = `<p class="mt-expr">${esc(C.expr)} = <b>${esc(S()(C.R.v))}</b></p><ol class="mt-pasos">${C.R.pasos.map(x => `<li class="bien"><span>${esc(x.parte)}</span><b>${esc(S()(x.v))}</b></li>`).join("")}</ol>`; }
  if (j === "objetivo") { const O = rondaObjetivo(rr); sol = `<p>Objetivo <b>${esc(S()(O.obj))}</b>. Una forma: <b>${esc(tokTxt(tokens(O.sol), O.nums))} = ${esc(S()(O.obj))}</b></p>${unidades().map(u => { const x = ev(u.u, `r${rr}`); if (!x) return ""; const v = valorObj(x.v, rr); return `<p class="mt-small"><span style="color:${u.c}">●</span> ${esc(u.n)}: ${esc(tokTxt(tokens(x.v), O.nums))} = ${v === null ? "?" : esc(S()(v))}</p>`; }).join("")}`; }
  if (j === "ascensor") { const P0 = historia().pasos[rr], H = historia().H; sol = `<p>${esc(P0.txt)}</p><p class="mg-grande">${esc(H.fmt(P0.antes))} → ${esc(H.fmt(P0.despues))}</p><p class="mt-small">${esc(S()(P0.antes))} ${P0.cambio < 0 ? "−" : "+"} ${Math.abs(P0.cambio)} = ${esc(S()(P0.despues))}</p>`; }
  if (j === "apuesta") { const R0 = rondaApuesta(rr); sol = `<p class="mg-grande" style="font-size:clamp(22px,4vw,40px)">${esc(R0.frase)}</p><p>Es <b>${R0.verdad ? "VERDADERO ✅" : "FALSO ❌"}</b>. El resultado bueno es <b>${esc(S()(R0.sol))}</b>.</p>`; }
  if (j === "oferta") { const O = rondaOferta(rr); sol = `<p>${esc(O.titulo)}</p><ol class="mg-ofs" type="A">${O.ofertas.map((o, i) => `<li class="${i === O.mejor ? "mejor" : ""}"><b>${esc(o.t)}</b><span>${esc(o.calc)}</span>${i === O.mejor ? "<em>🏆 La más barata</em>" : ""}</li>`).join("")}</ol>`; }
  if (j === "monta") { const X = rondaMonta(rr); sol = `<p class="mo-txt">${esc(X.texto)}</p><p>Tipo: <b>${esc(X.tipo)}</b> · Operación: <b>${esc(X.ops.find(o => o.ok).t)}</b></p><ol>${X.res.map(x => `<li>${esc(x)}</li>`).join("")}</ol><p>Respuesta: <b>${esc(BT().conUd(X.sol, X.ud))}</b></p>`; }
  const mio = movil && mi ? (j === "apuesta" ? (() => { const a = apuestaRes(mi, rr); return a ? `<p class="mt-fb ${a.bien ? "ok" : "no"}">${a.bien ? "🎉" : "😬"} ${a.gana > 0 ? "+" : ""}${a.gana} puntos${a.prueba ? " (¡demostrado, el doble!)" : ""}</p>` : `<p class="mt-fb no">No apostaste en esta ronda.</p>`; })() : `<p class="mt-fb ${puntosRonda(mi, rr) ? "ok" : "no"}">${puntosRonda(mi, rr) ? "🎉 +" + puntosRonda(mi, rr) + " puntos" : "😬 0 puntos esta ronda"}</p>`) : "";
  return `<div class="mt-box"><h2>Ronda ${rr + 1}: solución</h2>${sol}${mio}<h3>Clasificación</h3>${tablaHTML(marcador())}${movil && !mem().host[sala().codigo] ? `<p class="mt-small">⏳ Esperando a la siguiente ronda…</p>` : ""}</div>`;
}
function rectaSVG(vals, cartas) {
  const mn = Math.min(0, ...vals) - 2, mx = Math.max(0, ...vals) + 2, W = 900, H = 120, pad = 30, x = v => pad + (W - 2 * pad) * (v - mn) / (mx - mn);
  let s = `<line x1="${pad}" y1="60" x2="${W - pad}" y2="60" class="mt-rl"/>`;
  const paso = mx - mn > 40 ? 5 : mx - mn > 20 ? 2 : 1;
  for (let v = Math.ceil(mn / paso) * paso; v <= mx; v += paso) s += `<line x1="${x(v)}" y1="${v === 0 ? 48 : 54}" x2="${x(v)}" y2="${v === 0 ? 72 : 66}" class="mt-rt"/>` + (v % (paso * 2) === 0 || v === 0 ? `<text x="${x(v)}" y="92" class="mt-rtx">${esc(S()(v))}</text>` : "");
  vals.forEach((v, i) => { const c = cartas?.find(k => k.v === v); s += `<circle cx="${x(v)}" cy="60" r="8" class="mt-rp"/>` + (c ? `<text x="${x(v)}" y="${i % 2 ? 112 : 30}" class="mt-rtx" style="fill:var(--ink)">${esc(c.t)}</text>` : ""); });
  return `<svg class="mg-rectag" viewBox="0 0 ${W} ${H + 10}" role="img" aria-label="Recta numérica">${s}</svg>`;
}

/* 🧍 recta humana */
function misCartasRecta(rr) {
  const y = yo(), ms = miembros(y.e), k = ms.findIndex(j => j.id === y.id), R0 = rondaRecta(rr);
  return R0.cartas.map((c, i) => ({...c, i})).filter(c => (c.i + rr) % ms.length === k);
}
function colocacion(u, rr) { const R0 = rondaRecta(rr), sl = {}; R0.cartas.forEach((c, i) => { const x = ev(u, `r${rr}c${i}`); if (x && x.v !== "x" && x.v !== "") sl[+x.v] = i; }); return sl; }
function jRecta() {
  const rr = sala().r, R0 = rondaRecta(rr), u = miU(), sl = colocacion(u, rr), mias = misCartasRecta(rr), sel = E.ui.sel, ms = miembros(yo().e);
  if (ev(u, `r${rr}ok`)) return `<div class="mt-box"><h2>✅ ¡Recta ordenada!</h2>${rectaSVG(R0.orden, R0.cartas)}<p class="mt-small">Esperad a que acabe la ronda.</p></div>`;
  const dueno = i => ms[(i + rr) % ms.length]?.n || "?";
  return `<div class="mt-box"><p class="rt-habla">🗣️ Decid en voz alta lo que vale cada carta. Ordenad de menor a mayor.</p>
    <h3>Tus cartas</h3><div class="mg-cartas">${mias.length ? mias.map(c => { const puesta = Object.values(sl).includes(c.i); return `<button class="mg-carta ${sel === c.i ? "sel" : ""}" data-mg="carta" data-i="${c.i}">${esc(c.t)}${puesta ? " ✓" : ""}</button>`; }).join("") : `<span class="mt-small">Esta ronda no tienes cartas: ayuda a tu equipo.</span>`}</div>
    <h3>La recta del equipo (menor → mayor)</h3>
    <div class="mg-slots">${R0.cartas.map((_, k) => { const i = sl[k]; const mia = i !== undefined && mias.some(c => c.i === i); return `<button class="mg-slot ${i !== undefined ? "lleno" : ""} ${mia ? "mio" : ""}" data-mg="slot" data-k="${k}">${i !== undefined ? `<b>${esc(R0.cartas[i].t)}</b>${esc(dueno(i))}` : `${k + 1}.º`}</button>`; }).join('<span class="mt-sig">&lt;</span>')}</div>
    ${bloqHTML()}<p class="mt-acc"><button class="btn main" data-mg="listo" ${Object.keys(sl).length === R0.cartas.length && !(E.ui.bloq > ahora()) ? "" : "disabled"}>✅ ¡Listo!</button></p>
    <p class="mt-small">Toca una carta tuya y luego un sitio. Para quitarla, tócala en la recta.</p></div>`;
}
/* 🔗 cadena */
function turnoCadena(u, rr, h) { const y = yo(), ms = miembros(y.e); return ms[(h + rr + num(u, `r${rr}e${h}`)) % ms.length]; }
function jCadena() {
  const rr = sala().r, C = rondaCadena(rr), u = miU(), h = pasosHechos(u, rr), n = C.R.pasos.length, errs = num(u, `r${rr}e`);
  const cadena = `<ol class="mt-pasos">${C.R.pasos.slice(0, h).map((x, i) => `<li class="${num(u, `r${rr}e${i}`) ? "mal" : "bien"}"><span class="mt-pa">${marca(x.antes)}</span><span>${esc(x.parte)} = <b>${esc(S()(x.v))}</b>${num(u, `r${rr}e${i}`) ? " 🔗💥" : ""}</span></li>`).join("")}</ol>`;
  if (h >= n) return `<div class="mt-box"><h2>✅ ¡Cadena completa!</h2>${cadena}<p class="mt-expr">= ${esc(S()(C.R.v))}</p><p class="mt-small">${errs} fallos. Esperad a que acabe la ronda.</p></div>`;
  const x = C.R.pasos[h], le = turnoCadena(u, rr, h), mio = le?.id === yo().id;
  return `<div class="mt-box"><p class="mt-small">Paso ${h + 1} de ${n} · ${errs} fallos</p><div class="mg-cad">${C.R.pasos.map((_, i) => `<span class="mg-esl ${i < h ? (num(u, `r${rr}e${i}`) ? "mal" : "ok") : ""}"></span>`).join("")}</div>
    ${cadena}<p class="mt-expr">${marca(x.antes)}</p>
    ${mio ? `<p class="rt-habla">👉 ¡Te toca! ${esc({pot: "Calcula la potencia", raiz: "Calcula la raíz", mul: "Multiplica o divide", sum: "Suma o resta"}[x.tipo])}: <b>${esc(x.parte)}</b></p>${E.ui.rota === `${rr}:${h}` ? `<p class="mt-fb no">💥 La cadena se rompió aquí: ahora te toca arreglarla.</p>` : ""}${pant("cad")}${teclado("cad")}` : `<p class="rt-habla">⏳ Le toca a <b>${esc(le?.n || "?")}</b>: ${esc(x.parte)}. ¡Ayúdale hablando!</p>`}</div>`;
}
function marca(t) { return esc(t).replace(/\u0001/g, '<mark class="mt-hl">').replace(/\u0002/g, "</mark>"); }
/* 🎯 número objetivo */
function jObjetivo() {
  const rr = sala().r, O = rondaObjetivo(rr), u = miU(), tk = E.ui.tk?.rr === rr ? E.ui.tk.t : [], v = evaluar(tk, O.nums), env = ev(u, `r${rr}`), vEnv = env ? valorObj(env.v, rr) : null;
  const usado = new Set(tk.filter(t => t.n !== undefined).map(t => t.n));
  return `<div class="mt-box" style="text-align:center"><p class="mt-small">Llega a</p><p><span class="mg-obj">${esc(S()(O.obj))}</span></p>
    <div class="mg-tiles2" style="justify-content:center">${O.nums.map((n, i) => `<button class="mg-t" data-mg="tk" data-t="n${i}" ${usado.has(i) ? "disabled" : ""}>${esc(S()(n))}</button>`).join("")}</div>
    <div class="mg-tiles2" style="justify-content:center">${[["p", "+"], ["m", "−"], ["x", "·"], ["d", ":"], ["l", "("], ["r", ")"]].map(([c, t]) => `<button class="mg-t op" data-mg="tk" data-t="${c}">${t}</button>`).join("")}<button class="mg-t op" data-mg="tkbs">⌫</button><button class="mg-t op" data-mg="tkc">C</button></div>
    <p class="mg-exp">${tk.length ? esc(tokTxt(tk, O.nums)) : '<span class="mt-ph">Toca números y operaciones</span>'}<small>${tk.length ? (v === null ? "Aún no es una operación completa (o hay una división que no es exacta)" : `= ${esc(S()(v))}${v === O.obj ? " 🎯" : ` (te faltan ${Math.abs(O.obj - v)})`}`) : ""}</small></p>
    <p class="mt-acc" style="justify-content:center"><button class="btn main" data-mg="enviarobj" ${v === null ? "disabled" : ""}>📤 Enviar</button></p>
    ${env ? `<p class="mt-small">Enviado: ${esc(tokTxt(tokens(env.v), O.nums))} = ${vEnv === null ? "?" : esc(S()(vEnv))}${vEnv === O.obj ? " 🎯 ¡Exacto!" : ". Puedes mejorarlo."}</p>` : ""}</div>`;
}
/* 🌡️ ascensor */
function escalaHTML(v, H) {
  const rango = H.max - H.min, pos = x => 100 * (H.max - x) / rango, paso = rango > 200 ? 50 : rango > 60 ? 10 : rango > 25 ? 5 : 1;
  let marcas = ""; for (let x = Math.ceil(H.min / paso) * paso; x <= H.max; x += paso) marcas += `<span class="${x === 0 ? "cero" : ""}" style="top:${pos(x)}%">${esc(S()(x))}</span>`;
  return `<div class="mg-escala" style="height:min(56vh,420px)">${marcas}<i class="mg-marcador" style="top:${pos(v)}%" aria-label="Marcador en ${esc(S()(v))}">${H.ic}</i></div>`;
}
function jAscensor() {
  const rr = sala().r, Hs = historia(), P0 = Hs.pasos[rr], u = miU(), x = ev(u, `r${rr}`);
  return `<div class="mt-box"><div class="mg-termo">${escalaHTML(P0.antes, Hs.H)}<div class="mg-historia"><p class="mt-small">Ahora: <b>${esc(Hs.H.fmt(P0.antes))}</b></p><p class="mg-grande" style="font-size:clamp(20px,5vw,30px)">${esc(P0.txt)}</p><p><b>${esc(Hs.H.preg)}</b></p>
    ${x ? `<p class="mt-fb ok">📤 Has contestado ${esc(S()(+x.v))}. Espera a que se cierre la ronda.</p>` : `${pant("asc")}${teclado("asc")}`}</div></div></div>`;
}
/* 🎲 atrapa los puntos */
function jApuesta() {
  const rr = sala().r, R0 = rondaApuesta(rr), u = miU(), s0 = saldo(u, rr), x = ev(u, `r${rr}`), dem = ev(u, `r${rr}d`);
  if (s0 <= 0) return `<div class="mt-box"><h2>😵 Te has quedado sin puntos</h2><p>Mira la pizarra y ayuda a los demás.</p></div>`;
  const vf = E.ui.vf, ap = Math.min(E.ui.ap || 100, s0);
  return `<div class="mt-box"><p class="mt-small">Tu saldo: <b>${s0}</b></p><p class="mg-grande" style="font-size:clamp(24px,6vw,40px)">${esc(R0.frase)}</p>
    ${!x ? `<div class="mg-vf"><button data-mg="vf" data-v="v" aria-pressed="${vf === "v"}">✅ Verdadero</button><button data-mg="vf" data-v="f" aria-pressed="${vf === "f"}">❌ Falso</button></div>
      <p class="mt-small">¿Cuánto apuestas?</p><div class="mg-apuesta">${APUESTAS.filter(a => a <= s0).concat(s0 < 1000 && !APUESTAS.includes(s0) ? [s0] : []).map(a => `<button data-mg="ap" data-v="${a}" aria-pressed="${ap === a}">${a === s0 ? "Todo (" + a + ")" : a}</button>`).join("")}</div>
      <p class="mt-acc"><button class="btn main" data-mg="apostar" ${vf ? "" : "disabled"}>🎲 Apostar ${ap}</button></p>`
    : `<p class="mt-fb ok">Has apostado <b>${+x.v.slice(1)}</b> a <b>${x.v[0] === "v" ? "VERDADERO" : "FALSO"}</b>.</p>
      ${dem ? `<p class="mt-small">Tu demostración: ${esc(S()(+dem.v))}. Espera a que se cierre la ronda.</p>` : `<p><b>¿Doble o nada?</b> Escribe el resultado bueno de <b>${esc(R0.expr)}</b>${R0.hueco ? " (el número del hueco)" : ""}. Si aciertas, ganas el doble.</p>${pant("dem")}${teclado("dem", "Demostrar")}<p><button class="btn" data-mg="nodem">No, gracias</button></p>`}`}</div>`;
}
/* 🃏 cartas */
function misCartas() { const y = yo(), ms = miembros(y.e), k = ms.findIndex(j => j.id === y.id), C = juegoCartas(); return C.cartas.map((c, gi) => ({...c, gi})).filter(c => c.gi % ms.length === k); }
const duenoCarta = (e, gi) => { const ms = miembros(e); return ms[gi % ms.length]; };
function jCartas() {
  const C = juegoCartas(), u = miU(), y = yo(), mias = misCartas(), com = ev(u, "com"), sel = E.ui.sel;
  const usadas = new Set(C.huecos.map((_, i) => ev(u, "h" + i)).filter(Boolean).map(x => +x.v));
  return `<div class="mt-box"><p class="rt-habla">🗣️ Hablad: ¿quién tiene la carta de cada hueco?</p>
    <h3>Tus cartas</h3><div class="mg-cartas">${mias.map(c => `<button class="mg-carta ${sel === c.gi ? "sel" : ""}" data-mg="carta" data-i="${c.gi}" ${usadas.has(c.gi) ? "disabled" : ""}>${esc(S()(c.v))}</button>`).join("") || '<span class="mt-small">No tienes cartas.</span>'}</div>
    ${bloqHTML()}<h3>Huecos</h3><div class="mg-huecos">${C.huecos.map((h, i) => { const x = ev(u, "h" + i); return `<button class="mg-hueco ${x ? "hecho" : ""}" data-mg="hueco" data-i="${i}" ${x ? "disabled" : ""}><span>${esc(x ? h.txt.replace("▢", S()(h.sol)) : h.txt)}</span>${x ? "✅" : com && +com.v === i ? `<small class="mg-q">🃏 ${esc(duenoCarta(y.e, C.cartas.findIndex(c => c.h === i))?.n || "?")}</small>` : ""}</button>`; }).join("")}</div>
    ${!com ? `<p class="mt-acc"><button class="btn" data-mg="comodin" ${E.ui.comodin ? 'aria-pressed="true"' : ""}>🃏 Usar el comodín${E.ui.comodin ? ": toca un hueco" : ""}</button></p>` : ""}</div>`;
}
/* 🔐 escape */
function frz(k) { const u = miU(), x = ev(u, "x" + k); return x ? x.ms + sala().t0 + 15000 : 0; }
function jEscape() {
  const X = juegoEscape(), u = miU(), y = yo(), ms = miembros(y.e), yoK = ms.findIndex(j => j.id === y.id), nM = ms.length;
  const pistas = (c, k) => { const items = [{t: `${esP2() ? "Problema" : "Operación"}: ${c.plantilla}`}, ...c.datos.map(d => ({t: `${d.L} = ${S()(d.v)}`}))]; return items.filter((_, i) => (i + k) % nM === yoK); };
  const abiertos = [0, 1, 2, 3].filter(k => ev(u, "c" + k)).length;
  if (ev(u, "fin")) return `<div class="mt-box"><h2>🎉 ¡Habéis escapado!</h2><p>Tiempo: <b>${mmss(ev(u, "fin").ms + [0, 1, 2, 3, 4].reduce((a, k) => a + num(u, "x" + k), 0) * 30000)}</b> (con las penalizaciones).</p></div>`;
  return `<div class="mt-box"><p class="rt-habla">🗣️ Cada uno tiene solo una parte de los datos. ¡Hablad para juntarlo todo!</p><p class="mt-small">Candados abiertos: ${abiertos} de 4 · Penalizaciones: ${[0, 1, 2, 3, 4].reduce((a, k) => a + num(u, "x" + k), 0)} × 30 s</p>
    <div class="mg-candados">${X.cands.map((c, k) => { const ab = ev(u, "c" + k), f = frz(k), mis = pistas(c, k); return `<div class="mg-cand ${ab ? "abierto" : ""}"><h3>${ab ? "🔓" : "🔒"} Candado ${k + 1}</h3>
      ${ab ? `<p>Código: <b>${esc(S()(c.v))}</b></p>` : `${mis.map(p => `<p class="mg-pista">${esc(p.t)}</p>`).join("") || '<p class="mg-pista no">En este candado no tienes datos: pregunta a tu equipo.</p>'}
      ${f > ahora() ? `<p class="mg-bloq" data-mg-bloq="${f}"></p>` : `<form class="mg-mini" data-mg-form="candado" data-k="${k}"><input id="mg-c${k}" inputmode="text" autocomplete="off" placeholder="Código" aria-label="Código del candado ${k + 1}"><button class="btn main">Abrir</button></form>`}`}</div>`; }).join("")}
    <div class="mg-cand" style="grid-column:1/-1"><h3>🗝️ Candado final</h3><p class="mt-small">Se abre con la suma de los 4 códigos.</p>${abiertos < 4 ? `<p class="mt-small">Abrid antes los 4 candados.</p>` : frz(4) > ahora() ? `<p class="mg-bloq" data-mg-bloq="${frz(4)}"></p>` : `<form class="mg-mini" data-mg-form="candado" data-k="4"><input id="mg-c4" inputmode="text" autocomplete="off" placeholder="Suma" aria-label="Código final"><button class="btn main">Abrir</button></form>`}</div></div></div>`;
}

/* 🏷️ ¿cuál es la mejor oferta? */
function jOferta() {
  const rr = sala().r, O = rondaOferta(rr), u = miU(), x = ev(u, `r${rr}`), p = ev(u, `r${rr}p`);
  return `<div class="mt-box"><p class="mg-grande" style="font-size:clamp(20px,5vw,30px)">${esc(O.titulo)}</p>
    <div class="mg-ofs2">${O.ofertas.map((o, i) => `<button class="mg-of ${x && +x.v === i ? "sel" : ""}" data-mg="of" data-i="${i}" ${x ? "disabled" : ""}><span>${"ABC"[i]}</span><b>${esc(o.t)}</b></button>`).join("")}</div>
    ${!x ? `<p class="mt-small">Toca la oferta más barata. Haz las cuentas con calma: cuanto antes, más puntos.</p>`
      : p ? `<p class="mt-fb ok">📤 Has elegido la ${"ABC"[+x.v]}${p.v !== "no" ? ` y dices que se pagan ${esc(S()(BT().leer(p.v)))} €` : ""}. Espera a que se cierre la ronda.</p>`
      : `<p><b>¿Doble premio?</b> Escribe cuánto se paga con la oferta que has elegido. Si es la mejor y aciertas, +300 puntos.</p>${pant("ofp")}${teclado("ofp", "Enviar")}<p><button class="btn" data-mg="ofno">No, gracias</button></p>`}</div>`;
}
/* 🧩 monta el problema (en clase): cada uno lo monta en su móvil; si hay equipos, cuenta el primero del equipo que lo acaba */
function jMonta() {
  const rr = sala().r, X = rondaMonta(rr), u = miU(), x = ev(u, `r${rr}`);
  if (x) return `<div class="mt-box"><h2>✅ ¡Problema montado!</h2><p>${+x.v ? `Con ${x.v} ${+x.v === 1 ? "fallo" : "fallos"}.` : "¡Sin fallos!"} Esperad a que acabe la ronda.</p></div>`;
  if (!window.LYAMonta) return `<div class="mt-box"><p>Falta una parte de la web. Recarga la página.</p></div>`;
  return `<div class="mt-box">${LYAMonta.html(`g-${sala().codigo}-${sala().semilla}-${rr}-${yoId()}`, X, {onFin: err => jugarU(`r${rr}`, err, {uno: true})})}</div>`;
}
/* ---------- pizarra ---------- */
function pizarraHTML() {
  const s = sala(), g = jg(), c = mem().host[s.codigo];
  if (!g) return `<section class="wrap mt"><p>Esta sala no es de mates.</p></section>`;
  let body = "";
  if (s.fase === "espera") body = `<div class="mt-box" style="text-align:center"><p>Entrad en <b>COMPRENDO → En grupo</b> y escribid el código:</p><p class="mg-grande" style="letter-spacing:8px">${esc(s.codigo)}</p>
    <p class="mt-small">o abrid el enlace: <b>${esc(location.origin + location.pathname)}#mates-sala-${esc(s.codigo)}</b></p></div>
    ${porEq() ? equiposLista() : `<div class="mt-box"><h2>Jugadores (${E.st.jugadores.length})</h2><p>${E.st.jugadores.map(j => `<span class="rt-j">${esc(j.n)}${c ? ` <button class="rt-x" data-mg="echar" data-j="${esc(j.id)}" aria-label="Sacar a ${esc(j.n)}">✕</button>` : ""}</span>`).join(" ") || "<i>Aún no hay nadie</i>"}</p></div>`}
    <details class="rt-como"><summary>Cómo se juega</summary><ol>${comoDe(g, CFG().tema).map(x => `<li>${esc(x)}</li>`).join("")}</ol></details>`;
  else if (s.fase === "fin" || libreAcabado()) body = `<div class="mt-box"><h2>🏁 Resultados</h2>${podio(marcador())}${tablaHTML(marcador())}${solucionesHTML()}</div>`;
  else if (rondas() && !rondaAbierta()) body = finRondaHTML(false);
  else body = pizarraJuego();
  return `<section class="wrap mt" style="--c:${g.c}">${cabeza()}${aviso()}${c ? mandoHTML().replace(/<a class="btn" href="#mates-pizarra[^<]*<\/a>/, "") : ""}${body}</section>`;
}
function podio(rk) { return `<p class="mg-grande" style="text-align:center">${rk.slice(0, 3).map((x, i) => `${["🥇", "🥈", "🥉"][i]} ${esc(x.n)}`).join(" · ")}</p>`; }
function pizarraJuego() {
  const j = jid(), s = sala(), rr = s.r, us = unidades();
  const listos = rr => `<p class="mt-small">Han terminado ${us.filter(u => hecho(u.u, rr)).length} de ${us.length}.</p>`;
  if (j === "recta") { const R0 = rondaRecta(rr); return `<div class="mt-box"><h2>Ordenad de menor a mayor</h2><p class="mg-grande">${R0.cartas.map(c => esc(c.t)).join(" · ")}</p>${listos(rr)}<div class="mg-eqs">${us.map(u => { const sl = colocacion(u.u, rr); return `<div class="mg-eq" style="--c:${u.c}"><b>${esc(u.n)}</b><span>${ev(u.u, `r${rr}ok`) ? "✅ ¡Ordenada!" : `${Object.keys(sl).length}/${R0.cartas.length} colocadas · ${num(u.u, `r${rr}e`)} fallos`}</span></div>`; }).join("")}</div></div>`; }
  if (j === "cadena") { const C = rondaCadena(rr), n = C.R.pasos.length; return `<div class="mt-box"><h2>Cadena ${rr + 1}</h2><p class="mg-grande" style="font-size:clamp(24px,4vw,46px)">${esc(C.expr)}</p>${listos(rr)}<div class="mg-eqs">${us.map(u => { const h = pasosHechos(u.u, rr); return `<div class="mg-eq" style="--c:${u.c}"><b>${esc(u.n)}</b><span class="mg-cad">${C.R.pasos.map((_, i) => `<span class="mg-esl ${i < h ? (num(u.u, `r${rr}e${i}`) ? "mal" : "ok") : ""}"></span>`).join("")} ${h}/${n}</span></div>`; }).join("")}</div></div>`; }
  if (j === "objetivo") { const O = rondaObjetivo(rr); return `<div class="mt-box" style="text-align:center"><p>Llegad a</p><p><span class="mg-obj">${esc(S()(O.obj))}</span></p><p class="mg-grande">${O.nums.map(n => esc(S()(n))).join("  ")}</p><p class="mt-small">Con + − · : y paréntesis. Cada número, una vez como mucho.</p>${listos(rr)}<p class="mt-small">Han enviado algo: ${us.filter(u => ev(u.u, `r${rr}`)).length} de ${us.length}</p></div>`; }
  if (j === "ascensor") { const Hs = historia(), P0 = Hs.pasos[rr]; return `<div class="mt-box"><div class="mg-termo">${escalaHTML(P0.antes, Hs.H)}<div class="mg-historia"><p class="mt-small">${Hs.H.ic} Ahora: <b>${esc(Hs.H.fmt(P0.antes))}</b></p><p class="mg-grande">${esc(P0.txt)}</p><p><b>${esc(Hs.H.preg)}</b></p>${listos(rr)}</div></div></div>`; }
  if (j === "apuesta") { const R0 = rondaApuesta(rr); return `<div class="mt-box" style="text-align:center"><p>¿Verdadero o falso?</p><p class="mg-grande">${esc(R0.frase)}</p><p class="mt-small">Apostad en el móvil. Si escribís el resultado bueno, ganáis el doble.</p>${listos(rr)}</div>`; }
  if (j === "oferta") { const O = rondaOferta(rr); return `<div class="mt-box"><p class="mg-grande" style="font-size:clamp(24px,4vw,44px)">${esc(O.titulo)}</p><div class="mg-ofs2 grande">${O.ofertas.map((o, i) => `<div class="mg-of"><span>${"ABC"[i]}</span><b>${esc(o.t)}</b></div>`).join("")}</div><p class="mt-small">¿Cuál es la más barata? Elegid en el móvil.</p>${listos(rr)}</div>`; }
  if (j === "monta") { const X = rondaMonta(rr); return `<div class="mt-box"><h2>🧩 Problema ${rr + 1}</h2><p class="mg-grande" style="font-size:clamp(22px,3.4vw,40px);line-height:1.35">${esc(X.texto)}</p><p class="mt-small">Montadlo en el móvil: datos, tipo, operación y respuesta.</p>${listos(rr)}</div>`; }
  if (j === "cartas") return `<div class="mt-box"><h2>${esP2() ? "Parejas de porcentajes" : "Cartas a la mesa"}</h2><div class="mg-eqs">${marcador().map(u => `<div class="mg-eq" style="--c:${u.c}"><b>${esc(u.n)}</b><span>${esc(u.info)} huecos · ${num(u.u, "err")} fallos</span></div>`).join("")}</div></div>`;
  if (j === "escape") return `<div class="mt-box"><h2>${esP2() ? "Escape room «La tienda»" : "Escape room"}</h2><div class="mg-eqs">${marcador().map(u => `<div class="mg-eq" style="--c:${u.c}"><b>${esc(u.n)}</b><span>${esc(u.info)}</span></div>`).join("")}</div></div>`;
  return "";
}

/* ---------- acciones ---------- */
async function accion(datos) {
  E.busy = true;
  const r = await api("POST", {sala: sala()?.codigo, ...datos});
  E.busy = false;
  if (r.estado) recibir(r.estado);
  return r;
}
const host = async a => { const r = await accion({clave: mem().host[sala().codigo]?.clave, ...a}); if (!r.ok) avisar(ERR[r.error] || ERR.red); else pintar(true); return r; };
const jugar = async (k, v, o = {}) => { const r = await accion({accion: "jugar", jugador: yoId(), k, v: String(v), eq: porEq() && jg().eq !== false, ...o}); if (!r.ok) avisar(ERR[r.error] || ERR.red); pintar(true); return r; };
/* en los juegos «solos o por equipos», si hay equipos la respuesta es del equipo */
const jugarU = (k, v, o = {}) => accion({accion: "jugar", jugador: yoId(), k, v: String(v), eq: porEq(), ...o}).then(r => { if (!r.ok) avisar(ERR[r.error] || ERR.red); pintar(true); return r; });

function tecla(id, v) {
  let t = String(E.ui["in_" + id] || "");
  if (v === "bs") t = t.slice(0, -1);
  else if (v === "pm") t = t.startsWith("-") ? t.slice(1) : "-" + t;
  else if (v === "dec") { if (!t.includes(",")) t = (t || "0") + ","; }
  else if (v === "ok") return enviarNum(id, BT().leer(t));
  else if (t.replace(/[-,]/g, "").length < 8 && !/,\d\d$/.test(t)) t = (t === "0" ? "" : t) + v;
  E.ui["in_" + id] = t; pintar(true);
}
async function enviarNum(id, v) {
  if (v === null) return;
  const rr = sala().r, u = miU();
  E.ui["in_" + id] = "";
  if (id === "cad") {
    const C = rondaCadena(rr), h = pasosHechos(u, rr), x = C.R.pasos[h];
    if (!x) return;
    if (v === x.v) { E.ui.rota = null; await jugar(`r${rr}p${h}`, v, {uno: true}); }
    else { await jugar(`r${rr}e${h}`, 1, {suma: true}); await jugar(`r${rr}e`, 1, {suma: true}); avisar(`💥 ${x.parte} no es ${S()(v)}. ¡La cadena se rompe! Le toca al siguiente.`); }
    return;
  }
  if (id === "asc") return jugarU(`r${rr}`, v, {uno: true});
  if (id === "dem") return jugarU(`r${rr}d`, v, {uno: true});
  if (id === "ofp") return jugarU(`r${rr}p`, v, {uno: true});
}
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-mg]"); if (!b || !APP?.contains(b)) return;
  const a = b.dataset.mg, s = sala();
  if (a === "k") return tecla(b.dataset.t, b.dataset.v);
  if (a === "empezar") return host({accion: "empezar"});
  if (a === "terminar") return host({accion: "terminar"});
  if (a === "ronda") return host({accion: "ronda", r: s.r + 1});
  if (a === "cerrar") return host({accion: "cerrar"});
  if (a === "echar") return host({accion: "echar", jugador: b.dataset.j});
  if (a === "equipo") { E.ui.equipo = +b.dataset.e; return pintar(true); }
  if (a === "cambiar") { E.ui.cambiar = true; return pintar(true); }
  if (a === "login") return window.LYACuentas?.abrir?.();
  const j = jid(), rr = s?.r, u = miU();
  if (j === "recta") {
    if (a === "carta") { E.ui.sel = E.ui.sel === +b.dataset.i ? null : +b.dataset.i; return pintar(true); }
    if (a === "slot") {
      const k = +b.dataset.k, sl = colocacion(u, rr), aqui = sl[k], mias = misCartasRecta(rr).map(c => c.i);
      if (E.ui.sel == null) { if (aqui !== undefined && mias.includes(aqui)) return jugar(`r${rr}c${aqui}`, "x"); return; }
      if (aqui !== undefined && aqui !== E.ui.sel) return avisar("Ese sitio ya está ocupado. Hablad con quien la ha puesto.");
      const i = E.ui.sel; E.ui.sel = null; return jugar(`r${rr}c${i}`, k);
    }
    if (a === "listo") {
      const R0 = rondaRecta(rr), sl = colocacion(u, rr), bien = R0.orden.filter((v, k) => sl[k] !== undefined && R0.cartas[sl[k]].v === v).length;
      if (bien === R0.cartas.length) return jugar(`r${rr}ok`, "1", {uno: true});
      E.ui.bloq = ahora() + 5000; await jugar(`r${rr}e`, 1, {suma: true}); return avisar(`😬 Solo ${bien} de ${R0.cartas.length} están en su sitio. 5 segundos sin tocar.`);
    }
  }
  if (j === "objetivo") {
    const tk = E.ui.tk?.rr === rr ? E.ui.tk.t : [];
    if (a === "tk") { const t = b.dataset.t; tk.push(t[0] === "n" ? {n: +t.slice(1)} : "pmxd".includes(t) ? {o: t} : {par: t}); E.ui.tk = {rr, t: tk}; return pintar(true); }
    if (a === "tkbs") { tk.pop(); E.ui.tk = {rr, t: tk}; return pintar(true); }
    if (a === "tkc") { E.ui.tk = {rr, t: []}; return pintar(true); }
    if (a === "enviarobj") { const code = tk.map(t => t.n !== undefined ? "n" + t.n : t.o || t.par).join(""); if (evaluar(tk, rondaObjetivo(rr).nums) === null) return; await jugarU(`r${rr}`, code); const v = valorObj(code, rr); return avisar(v === rondaObjetivo(rr).obj ? "🎯 ¡Exacto!" : "📤 Enviado. Puedes mejorarlo.", v === rondaObjetivo(rr).obj); }
  }
  if (j === "apuesta") {
    if (a === "vf") { E.ui.vf = b.dataset.v; return pintar(true); }
    if (a === "ap") { E.ui.ap = +b.dataset.v; return pintar(true); }
    if (a === "apostar") { const s0 = saldo(u, rr), ap = Math.min(E.ui.ap || 100, s0); await jugarU(`r${rr}`, E.ui.vf + ap, {uno: true}); E.ui.vf = null; return; }
    if (a === "nodem") return jugarU(`r${rr}d`, "no", {uno: true});
  }
  if (j === "oferta") {
    if (a === "of") return jugarU(`r${rr}`, +b.dataset.i, {uno: true});
    if (a === "ofno") return jugarU(`r${rr}p`, "no", {uno: true});
  }
  if (j === "cartas") {
    if (a === "carta") { E.ui.sel = E.ui.sel === +b.dataset.i ? null : +b.dataset.i; return pintar(true); }
    if (a === "comodin") { E.ui.comodin = !E.ui.comodin; return pintar(true); }
    if (a === "hueco") {
      const i = +b.dataset.i, C = juegoCartas();
      if (E.ui.comodin) { E.ui.comodin = false; return jugar("com", i, {uno: true}); }
      if (E.ui.sel == null) return avisar("Primero toca una de tus cartas.");
      if (E.ui.bloq > ahora()) return;
      const gi = E.ui.sel; E.ui.sel = null;
      if (C.cartas[gi].h === i) { await jugar("h" + i, gi, {uno: true}); return avisar("✅ ¡Bien!", true); }
      E.ui.bloq = ahora() + 5000; await jugar("err", 1, {suma: true}); return avisar(`❌ ${S()(C.cartas[gi].v)} no va en ese hueco. 5 segundos sin jugar.`);
    }
  }
});
document.addEventListener("submit", async e => {
  const f = e.target.closest("[data-mg-form]"); if (!f || !APP?.contains(f)) return; e.preventDefault();
  const t = f.dataset.mgForm;
  if (t === "ir") { const c = (document.getElementById("mg-cod").value || "").replace(/\D/g, ""); if (c.length !== 6) return avisar("El código tiene 6 números."); location.hash = "#mates-sala-" + c; return; }
  if (t === "crear") {
    const c = E.crear; if (!c.aps.length) return;
    E.busy = true; E.err = ""; pintar(true);
    const tema = c.tema || "t2", lectura = `mates-${tema}-${[...(tema === "t2" ? c.aps : [1, 2, 3, 4, 5, 6, 7, 8])].sort().join("")}-${c.d}`;
    const r = await api("POST", {accion: "crear", juego: "m-" + c.j, lectura, file: "mates/" + tema, lang: "es", equipos: c.equipos, dur: c.dur, rd: c.rd});
    E.busy = false;
    if (!r.ok) { E.err = r.error || "red"; return pintar(true); }
    const m = mem(); m.host[r.sala] = {clave: r.clave, t: Date.now()}; for (const k in m.host) if (Date.now() - m.host[k].t > 864e5) delete m.host[k]; guard.set(m);
    recibir(r.estado); location.hash = (c.juega ? "#mates-sala-" : "#mates-pizarra-") + r.sala; return;
  }
  if (t === "duelo" || t === "concurso") {
    const c = E.crear; if (!c.aps.length) return;
    const spec = B().hacerSpec({tema: c.tema || "t2", aps: c.aps, d: c.d, n: c.n, seed: Math.floor(Math.random() * 2e9)});
    if (t === "concurso") { location.hash = "#concursos-mates-" + spec; return; }
    if (!window.LYADuelo?.crearMates) return;
    E.busy = true; E.err = ""; pintar(true);
    const r = await LYADuelo.crearMates(spec, {D: c.D, juega: c.juega});
    E.busy = false;
    if (!r.ok) { E.err = r.code === 401 ? "Para crear un duelo hace falta entrar con tu cuenta." : "No se ha podido crear el duelo. Inténtalo otra vez."; if (r.code === 401) window.LYACuentas?.abrir?.(); pintar(true); }
    return;
  }
  if (t === "unirme") {
    const nombre = document.getElementById("mg-nom").value.trim(), eq = porEq() ? +(E.ui.equipo || yo()?.e || 0) : 0;
    if (!nombre) return avisar(ERR.nombre);
    if (porEq() && !eq) return avisar(ERR.equipo);
    const m = mem(), c = sala().codigo;
    const r = await accion({accion: "entrar", nombre, equipo: eq, jugador: m.play[c]?.id});
    if (!r.ok) return avisar(ERR[r.error] || ERR.red);
    m.play[c] = {id: r.jugador, t: Date.now()}; m.nombre = nombre; for (const k in m.play) if (Date.now() - m.play[k].t > 864e5) delete m.play[k]; guard.set(m);
    E.ui.cambiar = false; return pintar(true);
  }
  if (t === "candado") {
    const k = +f.dataset.k, inp = f.querySelector("input"), v = BT().leer(inp.value), X = juegoEscape(), u = miU();
    inp.value = "";
    if (v === null) return avisar(esP2() ? "Escribe un número." : "Escribe un número entero (puede ser negativo).");
    const bueno = k < 4 ? X.cands[k].v : X.final;
    if (BT().igual ? BT().igual(v, bueno) : v === bueno) { await jugar(k < 4 ? "c" + k : "fin", v, {uno: true}); return avisar(k < 4 ? "🔓 ¡Candado abierto!" : "🎉 ¡Habéis escapado!", true); }
    await jugar("x" + k, num(u, "x" + k) + 1); return avisar("❌ Código incorrecto: el candado se congela 15 s y sumáis 30 s.");
  }
});
document.addEventListener("change", e => {
  const el = e.target; if (!APP?.contains(el) || !E.crear) return;
  if (el.dataset.mgAp) { const n = +el.dataset.mgAp; E.crear.aps = el.checked ? [...new Set([...E.crear.aps, n])] : E.crear.aps.filter(x => x !== n); return pintar(true); }
  const k = el.dataset.mgC; if (!k) return;
  if (k === "tema") { E.crear.tema = el.value; E.crear.aps = el.value === "t2" && J[E.crear.j]?.def.aps ? [...J[E.crear.j].def.aps] : [1, 2, 3, 4, 5, 6, 7, 8]; return pintar(true); }
  E.crear[k] = el.type === "checkbox" ? el.checked : +el.value; pintar(true);
});
document.addEventListener("input", e => { if (e.target.id === "mg-cod") e.target.value = e.target.value.replace(/[^\d ]/g, ""); });
/* teclado del ordenador para el teclado en pantalla */
addEventListener("keydown", e => {
  if (!enGrupo() || e.target.closest?.("input,textarea,select") || e.ctrlKey || e.metaKey || e.altKey) return;
  const t = APP?.querySelector(".mt-tec [data-t]")?.dataset.t; if (!t) return;
  if (/^\d$/.test(e.key)) tecla(t, e.key); else if ((e.key === "," || e.key === ".") && esP2()) tecla(t, "dec"); else if ((e.key === "-" || e.key === "+") && !esP2()) tecla(t, "pm"); else if (e.key === "Backspace") tecla(t, "bs"); else if (e.key === "Enter") tecla(t, "ok"); else return;
  e.preventDefault();
});
window.LYAMatesGrupo = {isGrupo, render, tiles, J, evaluar, tokens,
  _t: {E, rondaRecta, rondaCadena, rondaObjetivo, historia, rondaApuesta, juegoCartas, juegoEscape, rondaOferta, rondaMonta, misCartasRecta, misCartas, miU, colocacion, pasosHechos, turnoCadena}}; /* _t: para las pruebas (qa/prueba-mates.cjs) */
})();
