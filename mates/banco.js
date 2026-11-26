/* COMPRENDO · Matemáticas 1.º ESO: ejercicios que se generan solos (sin IA y sin escribirlos a mano).
   Tema 2 «Números enteros», con los 8 apartados del libro:
     1 Números enteros, recta, valor absoluto y opuesto · 2 Comparar y ordenar · 3 Suma y resta de dos enteros
     4 Suma y resta de varios (forma abreviada y paréntesis) · 5 Multiplicación y división · 6 Potencias
     7 Raíz cuadrada (exacta, entera y resto) · 8 Operaciones combinadas (jerarquía, paréntesis y corchetes)
   El mismo archivo sirve en el navegador (window.LYAMatesBanco) y en el servidor (api/duelo.js lo importa y usa globalThis.LYAMatesBanco).
   Todo sale de una semilla: con la misma semilla salen los mismos ejercicios en todos los móviles (juegos en grupo y duelos).

   Un ejercicio: {ap, tipo, enun, expr, ...}
     tipo "num"   → se contesta con un número entero (sol)
          "opc"   → se elige: opciones (textos) y ok (la buena)
          "orden" → ordenar nums (asc: de menor a mayor)
          "pasos" → operación combinada: arbol; se resuelve paso a paso (resolver)
          "recta" → qué número marca el punto en la recta (desde, hasta, sol)
          "resto" → raíz entera (sol) y resto (resto)
     ayuda: explicación corta que sale al fallar.
   test(q, r) → [enunciado, opciones, buena]: el formato de los duelos, concursos y juegos de opciones.
   serie("t2-<apartados>-<dificultad>-<cuántas>-<semilla>") → {titulo, q: [[enunciado, opciones, buena], …]} */
(() => {
const G = typeof globalThis !== "undefined" ? globalThis : window;
const M = "−"; /* el signo menos de verdad (U+2212) */

/* ---------- azar con semilla ---------- */
function semilla(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function Rn(seed) {
  const f = typeof seed === "function" ? seed : semilla(seed ?? Math.floor(Math.random() * 2 ** 31));
  const int = (a, b) => a + Math.floor(f() * (b - a + 1));
  return {
    f, int,
    nz: (a, b) => { let v = 0, n = 0; while (!v && n++ < 50) v = int(a, b); return v || 1; },
    pick: a => a[Math.floor(f() * a.length)],
    sig: () => f() < .5 ? -1 : 1,
    si: p => f() < p,
    mez: a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  };
}

/* ---------- cómo se escriben los números ---------- */
const s = n => n < 0 ? M + (-n) : String(n);           /* −5, 5 */
const sg = n => n > 0 ? "+" + n : s(n);                 /* −5, +5, 0 */
const p = n => "(" + sg(n) + ")";                       /* (−5), (+5) */
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = e => String(e).split("").map(c => SUP[+c] || c).join("");
/* lo que escribe el alumno: «-5», «−5», «+5», « 5 » → número; si no es un entero, null */
const leer = t => { t = String(t ?? "").trim().replace(/[−–—]/g, "-").replace(/\s+/g, "").replace(/^\+/, ""); return /^-?\d{1,7}$/.test(t) ? parseInt(t, 10) : null; };
const absT = t => "|" + t + "|";

/* ---------- operaciones combinadas: árbol, texto y pasos ---------- */
const N = v => ({k: "n", v});
const POT = (b, e, neg) => ({k: "p", b, e, neg: !!neg});   /* (b)ᵉ; neg = «−5²» (el menos va delante, base positiva) */
const RAIZ = (v, neg) => ({k: "r", v, neg: !!neg});        /* √v (v cuadrado perfecto); en las combinadas solo la raíz positiva */
const GR = (it, br) => ({k: "g", br: br || "", it});        /* it = [operando, op, operando, op, …]; br "", "(" o "[" */
const OPS = {"+": (a, b) => a + b, [M]: (a, b) => a - b, "·": (a, b) => a * b, ":": (a, b) => b !== 0 && a % b === 0 ? a / b : NaN};
const clon = x => JSON.parse(JSON.stringify(x));
function valor1(x) {
  if (x.k === "n") return x.v;
  if (x.k === "p") { const v = Math.pow(x.b, x.e); return x.neg ? -v : v; }
  if (x.k === "r") { const v = Math.round(Math.sqrt(x.v)); return v * v === x.v ? (x.neg ? -v : v) : NaN; }
  return NaN;
}
/* texto: «\u0001» y «\u0002» marcan el trozo que toca hacer ahora (la web lo pinta resaltado) */
function txt(x, first, hl) {
  if (x.k === "n") return first || x.v >= 0 ? s(x.v) : "(" + s(x.v) + ")";
  if (x.k === "p") return x.neg ? M + x.b + sup(x.e) : (x.b < 0 ? "(" + s(x.b) + ")" : String(x.b)) + sup(x.e);
  if (x.k === "r") return (x.neg ? M : "") + "√" + x.v;
  let out = "";
  x.it.forEach((y, i) => {
    if (i % 2) { out += " " + y + " "; return; }
    let t = txt(y, i === 0, hl);
    if (hl && hl.g === x) {
      if (!hl.par && i === hl.i) t = "\u0001" + t + "\u0002";
      if (hl.par && i === hl.i) t = "\u0001" + t;
      if (hl.par && i === hl.i + 2) t += "\u0002";
    }
    out += t;
  });
  return x.br === "(" ? "(" + out + ")" : x.br === "[" ? "[" + out + "]" : out;
}
const texto = x => txt(x, true).replace(/[\u0001\u0002]/g, "");
/* lo siguiente que hay que hacer, siguiendo la jerarquía: lo de dentro de paréntesis y corchetes, potencias y raíces,
   multiplicaciones y divisiones de izquierda a derecha, y sumas y restas de izquierda a derecha */
function siguiente(g) {
  for (let i = 0; i < g.it.length; i += 2) if (g.it[i].k === "g") return siguiente(g.it[i]);
  for (let i = 0; i < g.it.length; i += 2) if (g.it[i].k !== "n") return {g, i, par: false, tipo: g.it[i].k === "p" ? "pot" : "raiz"};
  for (let i = 1; i < g.it.length; i += 2) if (g.it[i] === "·" || g.it[i] === ":") return {g, i: i - 1, par: true, tipo: "mul"};
  return g.it.length > 1 ? {g, i: 0, par: true, tipo: "sum"} : null;
}
const parteTxt = h => h.par ? txt(h.g.it[h.i], h.i === 0) + " " + h.g.it[h.i + 1] + " " + txt(h.g.it[h.i + 2], false) : txt(h.g.it[h.i], true);
function aplicar(h) {
  const g = h.g; let v;
  if (!h.par) { v = valor1(g.it[h.i]); g.it[h.i] = N(v); }
  else { v = OPS[g.it[h.i + 1]](g.it[h.i].v, g.it[h.i + 2].v); g.it.splice(h.i, 3, N(v)); }
  return v;
}
/* un paréntesis que ya es un solo número se quita: (−11) se queda como el número −11 */
function plano(g) { for (let i = 0; i < g.it.length; i += 2) { const y = g.it[i]; if (y.k === "g") { plano(y); if (y.it.length === 1 && y.it[0].k === "n") g.it[i] = y.it[0]; } } }
const TIPOS = {pot: "Potencia", raiz: "Raíz", mul: "Multiplicación o división", sum: "Suma o resta"};
/* resolver: todos los pasos; null si algo no vale (división no exacta, números enormes) */
function resolver(t, lim = 999) {
  t = clon(t); if (t.k !== "g") t = GR([t]);
  plano(t);
  const pasos = []; let h, n = 0;
  while ((h = siguiente(t)) && n++ < 60) {
    const antes = txt(t, true, h), parte = parteTxt(h), dentro = h.g !== t;
    const dato = h.par ? {a: h.g.it[h.i].v, op: h.g.it[h.i + 1], b: h.g.it[h.i + 2].v} : {nodo: clon(h.g.it[h.i])};  /* para las pistas */
    const v = aplicar(h);
    if (!Number.isFinite(v) || Math.abs(v) > lim) return null;
    plano(t);
    pasos.push({antes, parte, v, tipo: h.tipo, dentro, despues: texto(t), dato});
  }
  return t.it.length === 1 && t.it[0].k === "n" ? {pasos, v: t.it[0].v} : null;
}
const valorDe = t => resolver(t)?.v;

/* ---------- operaciones combinadas al azar (apartados 4 y 8, cadena, escape) ---------- */
function operando(r, pot) {
  const x = r.f();
  if (pot && x < .2) { const e = r.pick([2, 2, 3]); return POT(e === 3 ? r.nz(-3, 3) : r.nz(-6, 6), e); }
  if (pot && x < .32) { const v = r.int(2, 12); return RAIZ(v * v); }
  return N(r.si(.1) ? r.sig() : r.sig() * r.int(2, 9));
}
function ristra(r, n, ops, pot, first) {
  const it = [];
  for (let i = 0; i < n; i++) { if (i) it.push(r.pick(ops)); it.push(i === 0 && first ? first : operando(r, pot)); }
  return it;
}
/* las divisiones, exactas: si a la izquierda de «:» hay un número suelto, se cambia por un múltiplo del de la derecha */
function exactas(g, r) {
  for (let i = 1; i < g.it.length; i += 2) {
    const a = g.it[i - 1], b = g.it[i + 1];
    if (g.it[i] === ":") {
      if (b.k === "n" && b.v === 0) b.v = r.nz(-5, 5);
      const vb = b.k === "g" ? valorDe(b) : valor1(b);
      if (a.k === "n" && Number.isFinite(vb) && vb !== 0) a.v = vb * r.nz(-6, 6);
    }
  }
  for (let i = 0; i < g.it.length; i += 2) if (g.it[i].k === "g") exactas(g.it[i], r);
}
function combinada(r, d, o = {}) {
  const lim = o.lim || (d === 1 ? 60 : 120);
  for (let n = 0; n < 400; n++) {
    let t;
    if (o.solo === "sum") { /* sumas y restas con paréntesis (apartado 4) */
      const sub = () => GR(ristra(r, r.int(2, d === 1 ? 2 : 4), ["+", M], false), "(");
      const it = []; const k = d === 1 ? 3 : r.int(3, 5);
      for (let i = 0; i < k; i++) { if (i) it.push(r.pick(["+", M])); it.push(i && r.si(.6) ? sub() : N(r.nz(-15, 20))); }
      if (!it.some(x => x.k === "g")) it[2] = sub();
      t = GR(it);
    } else if (d === 1) {
      t = GR(ristra(r, 3, ["+", M, "·", ":"], false));
      if (!t.it.some(x => x === "·" || x === ":")) t.it[r.pick([1, 3])] = r.pick(["·", ":"]);
    } else if (d === 2) {
      const it = ristra(r, r.int(3, 4), ["+", M, "·", ":"], true), k = 2 * r.int(0, (it.length - 1) / 2);
      it[k] = GR(ristra(r, 2, ["+", M], k === 0 ? false : r.si(.3)), "(");
      if (!it.some((x, i) => i % 2 && (x === "·" || x === ":"))) it[r.pick([1, 3].filter(i => i < it.length))] = r.pick(["·", ":"]);
      t = GR(it);
    } else {
      const dentro = ristra(r, r.int(2, 3), ["+", M, "·", ":"], true), j = 2 * r.int(0, (dentro.length - 1) / 2);
      dentro[j] = GR(ristra(r, 2, ["+", M], r.si(.5)), "(");
      const it = ristra(r, r.int(2, 3), ["+", M, "·", ":"], true), k = 2 * r.int(0, (it.length - 1) / 2);
      it[k] = GR(dentro, "[");
      if (r.si(.3) && it[0].k === "n") it[0] = r.si(.5) ? RAIZ(r.int(2, 12) ** 2, true) : POT(r.int(2, 5), 2, true);
      t = GR(it);
    }
    exactas(t, r);
    const R = resolver(t, 400);
    if (!R || Math.abs(R.v) > lim || R.pasos.length < (d === 1 ? 2 : d === 2 ? 3 : 4)) continue;
    if (n < 300 && R.pasos.slice(0, -1).some(x => x.v === 0)) continue; /* sin ceros a mitad: quedan pasos tontos (0 · 4, 0 : 16) */
    if (o.maxPasos && R.pasos.length > o.maxPasos) continue;
    return t;
  }
  return GR([N(3), "·", N(-4), "+", N(5)]);
}

/* ---------- ejercicios de cada apartado ---------- */
const AP = {};
const MAG = [0, 10, 20, 50];
const SIT = [
  ["Un buzo está a {n} m de profundidad.", -1], ["Un avión vuela a {n} m de altura.", 1], ["El termómetro marca {n} grados bajo cero.", -1],
  ["Hace {n} grados sobre cero.", 1], ["Le debo {n} € a mi hermana.", -1], ["Tengo {n} € en la hucha.", 1],
  ["El coche está aparcado en el sótano {n}.", -1], ["Vivo en la planta {n}.", 1], ["El año {n} antes de Cristo.", -1],
  ["El año {n} después de Cristo.", 1], ["Un submarino navega a {n} m bajo el nivel del mar.", -1], ["Una montaña mide {n} m sobre el nivel del mar.", 1],
  ["He perdido {n} puntos en el juego.", -1], ["He ganado {n} puntos en el juego.", 1], ["La temperatura ha bajado {n} grados.", -1], ["El ascensor sube {n} plantas.", 1]
];
const opcQ = (o, r) => { const vistos = new Set([o.opciones[o.ok]]), ops = r.mez(o.opciones.map((t, i) => ({t, b: i === o.ok})).filter(x => x.b || (!vistos.has(x.t) && vistos.add(x.t)))); return {...o, tipo: "opc", opciones: ops.map(x => x.t), ok: ops.findIndex(x => x.b)}; };
const CMP = ["<", ">", "="];
const cmp = (a, b) => a < b ? 0 : a > b ? 1 : 2;

AP[1] = [
  (r, d) => { const [t, sgn] = r.pick(SIT), n = r.int(2, d === 1 ? 50 : 900); return {tipo: "num", enun: "¿Qué número entero corresponde a esta situación?", expr: t.replace("{n}", n), sol: sgn * n, ayuda: sgn < 0 ? "Bajo cero, profundidad, deber, perder, sótano o antes de Cristo: es un número negativo." : "Sobre cero, altura, tener, ganar o subir: es un número positivo.", mal: [-sgn * n]}; },
  (r, d) => { const v = r.si(.2) ? 0 : r.nz(-MAG[d] * 2, MAG[d] * 2); return opcQ({enun: "¿Cómo es este número entero?", expr: sg(v), opciones: ["Positivo", "Negativo", "Ni positivo ni negativo"], ok: v > 0 ? 0 : v < 0 ? 1 : 2, ayuda: "El 0 es el único entero que no es ni positivo ni negativo."}, r); },
  (r, d) => { const w = d === 1 ? 6 : d === 2 ? 8 : 10, desde = -w + r.int(-3, 3) * (d === 1 ? 0 : 1), hasta = desde + 2 * w; let v; do v = r.int(desde + 1, hasta - 1); while (v === 0 || (d === 1 && Math.abs(v) < 1)); return {tipo: "recta", enun: "¿Qué número marca el punto en la recta?", desde, hasta, marcas: d === 1 ? 1 : d === 2 ? 2 : 5, sol: v, ayuda: "Cuenta las rayitas desde el 0: a la derecha, positivos; a la izquierda, negativos."}; },
  (r, d) => { const a = r.int(-MAG[d], MAG[d]), k = r.int(2, d === 1 ? 6 : 12), izq = r.si(.5); return {tipo: "num", enun: `¿Qué número está ${k} unidades a la ${izq ? "izquierda" : "derecha"} de ${sg(a)}?`, expr: "", sol: izq ? a - k : a + k, ayuda: izq ? "A la izquierda en la recta: restas." : "A la derecha en la recta: sumas.", mal: [izq ? a + k : a - k]}; },
  (r, d) => {
    const v = r.nz(-MAG[d] * 2, MAG[d] * 2), k = d === 1 ? r.int(0, 1) : r.int(0, 3);
    if (k === 0) return {tipo: "num", enun: "Calcula el valor absoluto", expr: absT(sg(v)), sol: Math.abs(v), ayuda: "El valor absoluto es la distancia al 0: el número sin su signo.", mal: [-Math.abs(v)]};
    if (k === 1) return {tipo: "num", enun: "Halla el opuesto", expr: `Op(${sg(v)})`, sol: -v, ayuda: "Para hallar el opuesto se cambia el signo: Op(+a) = −a y Op(−a) = +a.", mal: [v]};
    if (k === 2) return {tipo: "num", enun: "Calcula", expr: `Op(${absT(sg(v))})`, sol: -Math.abs(v), ayuda: `Primero el valor absoluto: ${absT(sg(v))} = ${Math.abs(v)}. Luego el opuesto: ${s(-Math.abs(v))}.`, mal: [Math.abs(v)]};
    return {tipo: "num", enun: "Calcula", expr: `${M}${absT(sg(v))}`, sol: -Math.abs(v), ayuda: `${absT(sg(v))} = ${Math.abs(v)}, y el signo − de delante lo hace negativo.`, mal: [Math.abs(v)]};
  },
  (r, d) => { const n = r.int(1, 30), neg = d === 3 && r.si(.3), op = !neg && r.si(.4); return opcQ(op ? {enun: "¿Qué número va en el hueco?", expr: `Op(▢) = ${sg(n)}`, opciones: [s(-n), sg(n), `${s(n)} y ${s(-n)}`, "Ninguno"], ok: 0, ayuda: "Cada número tiene un solo opuesto: el mismo número con el signo cambiado."} : {enun: "¿Qué números pueden ir en el hueco?", expr: `${absT("▢")} = ${neg ? s(-n) : n}`, opciones: [`${n} y ${s(-n)}`, `Solo ${n}`, `Solo ${s(-n)}`, "Ninguno"], ok: neg ? 3 : 0, ayuda: neg ? "Un valor absoluto es una distancia: nunca puede ser negativo." : "Hay dos números a esa distancia del 0: uno positivo y otro negativo."}, r); }
];
AP[1].pesos = [[3, 2, 3, 2, 3, 0], [2, 1, 3, 2, 3, 1], [1, 1, 2, 2, 3, 2]];

AP[2] = [
  (r, d) => {
    const lim = MAG[d] + 5, a = r.int(-lim, lim);
    let b = r.int(-lim, lim); if (r.si(.15)) b = a; if (d === 1 && r.si(.4)) b = -a;
    const forma = v => { if (d === 1) return [sg(v), v]; const k = r.int(0, d === 2 ? 2 : 3); return k === 1 ? [absT(sg(v)), Math.abs(v)] : k === 2 ? [`Op(${sg(v)})`, -v] : k === 3 ? [`${M}${absT(sg(v))}`, -Math.abs(v)] : [sg(v), v]; };
    const [ta, va] = forma(a), [tb, vb] = forma(b);
    return {tipo: "opc", enun: "¿Qué signo va en el hueco?", expr: `${ta}  ▢  ${tb}`, opciones: CMP, ok: cmp(va, vb), ayuda: `${ta} = ${s(va)} y ${tb} = ${s(vb)}. Es mayor el que está más a la derecha en la recta.`};
  },
  (r, d) => { const n = d === 1 ? 5 : d === 2 ? 6 : 7, lim = d === 3 ? 30 : 15, set = new Set(); while (set.size < n) set.add(r.int(-lim, lim)); const nums = [...set], asc = r.si(.5); return {tipo: "orden", enun: asc ? "Ordena de menor a mayor" : "Ordena de mayor a menor", nums, asc, ayuda: "Los negativos son menores que el 0, y el 0 menor que los positivos. Entre negativos, es mayor el que tiene menor valor absoluto."}; },
  (r, d) => { const set = new Set(); while (set.size < 4) set.add(r.nz(-MAG[d] - 5, MAG[d] + 5)); const v = [...set], mayor = r.si(.5), b = mayor ? Math.max(...v) : Math.min(...v); return {tipo: "opc", enun: mayor ? "¿Cuál es el mayor?" : "¿Cuál es el menor?", expr: "", opciones: v.map(sg), ok: v.indexOf(b), ayuda: "En la recta, el mayor es el que está más a la derecha."}; },
  (r, d) => { const a = r.int(-MAG[d], 0), b = r.int(1, MAG[d]); return {tipo: "num", enun: `¿Cuántos números enteros hay entre ${sg(a)} y ${sg(b)}? (sin contarlos a ellos)`, expr: "", sol: b - a - 1, ayuda: `De ${s(a)} a ${b} hay ${b - a} pasos; los números de en medio son uno menos.`, mal: [b - a, b - a + 1]}; }
];
AP[2].pesos = [[4, 2, 2, 0], [4, 3, 2, 1], [4, 3, 1, 2]];

const ayudaSuma = (a, b) => {
  if (a === 0 || b === 0) return "Sumar 0 no cambia el número.";
  if (Math.sign(a) === Math.sign(b)) return `Mismo signo: se suman los valores absolutos (${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(a + b)}) y se deja el signo ${a < 0 ? "−" : "+"}.`;
  const g = Math.abs(a) > Math.abs(b) ? a : b;
  return `Distinto signo: se restan los valores absolutos (${Math.max(Math.abs(a), Math.abs(b))} − ${Math.min(Math.abs(a), Math.abs(b))} = ${Math.abs(a + b)}) y se pone el signo del de mayor valor absoluto (${sg(g)}).`;
};
/* ---------- pistas: de menos a más, sin dar la solución de golpe ---------- */
const absS = (a, b) => [Math.max(Math.abs(a), Math.abs(b)), Math.min(Math.abs(a), Math.abs(b))];
function pistasSuma(a, b) {
  if (a === 0 || b === 0) return ["Uno de los dos es 0: sumar 0 no cambia el número."];
  if (Math.sign(a) === Math.sign(b)) return ["Mira los signos de los dos números: ¿son iguales o distintos?", `Los dos son ${a < 0 ? "negativos" : "positivos"} (mismo signo): suma ${Math.abs(a)} + ${Math.abs(b)} y pon el signo ${a < 0 ? "−" : "+"}.`];
  const [g, c] = absS(a, b), gr = Math.abs(a) > Math.abs(b) ? a : b;
  return ["Mira los signos de los dos números: ¿son iguales o distintos?", `Son de distinto signo: resta ${g} − ${c} y ponle el signo del que tiene mayor valor absoluto, ${sg(gr)} (${gr < 0 ? "−" : "+"}).`];
}
function pistasVarios(ts) {
  const P = ts.filter(x => x > 0), Ng = ts.filter(x => x < 0), sp = P.reduce((a, b) => a + b, 0), sn = -Ng.reduce((a, b) => a + b, 0);
  return ["Junta por un lado los positivos y por otro los negativos.",
    `Positivos: ${P.join(" + ") || "0"} = ${sp}. Negativos: ${Ng.map(x => -x).join(" + ") || "0"} = ${sn}.`,
    `Ahora resta ${Math.max(sp, sn)} − ${Math.min(sp, sn)} y pon el signo del grupo que gana (${sp >= sn ? "los positivos, +" : "los negativos, −"}).`];
}
function pistasMul(a, b, op) {
  const ig = Math.sign(a) === Math.sign(b);
  return ["Primero el signo, con la regla de los signos: signos iguales → +, distintos → −.", `${p(a)} y ${p(b)} tienen signos ${ig ? "iguales" : "distintos"}: el resultado es ${ig ? "positivo (+)" : "negativo (−)"}. Ahora calcula ${Math.abs(a)} ${op} ${Math.abs(b)}.`];
}
function pistasCadena(its) {
  const nums = its.filter((x, i) => i % 2 === 0).map(x => parseInt(x.replace(/[()+]/g, "").replace(M, "-"), 10)), neg = nums.filter(x => x < 0).length;
  return ["Primero el signo: cuenta cuántos números negativos hay.", `Hay ${neg} negativo${neg === 1 ? "" : "s"} (${neg % 2 ? "impar → el resultado es −" : "par → el resultado es +"}). Ahora opera sin signos, de izquierda a derecha.`,
    `Empieza por ${Math.abs(nums[0])} ${its[1]} ${Math.abs(nums[1])} y sigue con el resultado.`];
}
function pistasPot(b, e) {
  const ab = Math.abs(b), sgn = b > 0 ? "Base positiva: el resultado es +." : e % 2 ? "Base negativa y exponente impar: el resultado es −." : "Base negativa y exponente par: el resultado es +.";
  return ["Una potencia es multiplicar la base por sí misma tantas veces como dice el exponente.", `Aquí: ${Array(Math.min(e, 6)).fill(ab).join(" · ")}${e > 6 ? " · …" : ""} (${e} veces). ${sgn}`];
}
const pasoNombre = x => ({pot: "la potencia", raiz: "la raíz", mul: "multiplicar o dividir", sum: "sumar o restar"}[x.tipo] + " " + x.parte);
/* pistas para un paso de una combinada (resolver → pasos[i]) */
function pistaPaso(x) {
  const qu = {pot: "una potencia", raiz: "una raíz", mul: x.dato?.op === ":" ? "dividir" : "multiplicar", sum: x.dato?.op === M ? "restar" : "sumar"}[x.tipo];
  const por = {pot: "las potencias y las raíces van antes que · : + −", raiz: "las potencias y las raíces van antes que · : + −", mul: "· y : van antes que + y −, de izquierda a derecha", sum: "las sumas y restas van al final, de izquierda a derecha"}[x.tipo];
  const out = [`Ahora toca ${qu}: ${x.parte} (lo resaltado), porque ${por}${x.dentro ? ", y está dentro de un paréntesis o corchete" : ""}.`];
  const d = x.dato || {};
  if (x.tipo === "pot" && d.nodo) out.push(d.nodo.neg ? `Ojo: en ${x.parte} la base es ${d.nodo.b} y el − va delante. Calcula ${d.nodo.b}${sup(d.nodo.e)} y ponle el −.` : pistasPot(d.nodo.b, d.nodo.e)[1]);
  else if (x.tipo === "raiz" && d.nodo) { const r = Math.round(Math.sqrt(d.nodo.v)); out.push(`¿Qué número multiplicado por sí mismo da ${d.nodo.v}? En las combinadas se usa la raíz positiva${d.nodo.neg ? ", y el − de delante se queda" : ""}. Pista: está entre ${r - 1} y ${r + 1}.`); }
  else if (x.tipo === "mul") out.push(pistasMul(d.a, d.b, d.op)[1]);
  else if (x.tipo === "sum") { const b = d.op === M ? -d.b : d.b; out.push((d.op === M ? `Restar ${p(d.b)} es sumar ${p(-d.b)}: ${p(d.a)} + ${p(b)}. ` : "") + pistasSuma(d.a, b).slice(-1)[0]); }
  return out;
}
AP[3] = [
  (r, d) => { const a = r.nz(-MAG[d], MAG[d]), b = r.nz(-MAG[d], MAG[d]); return {tipo: "num", enun: "Calcula", expr: `${p(a)} + ${p(b)}`, sol: a + b, ayuda: ayudaSuma(a, b), pistas: pistasSuma(a, b), mal: [a - b, -(a + b)]}; },
  (r, d) => { const a = r.nz(-MAG[d], MAG[d]), b = r.nz(-MAG[d], MAG[d]); return {tipo: "num", enun: "Calcula", expr: `${p(a)} ${M} ${p(b)}`, sol: a - b, ayuda: `Restar es sumar el opuesto: ${p(a)} + ${p(-b)}. ${ayudaSuma(a, -b)}`, pistas: ["Restar es sumar el opuesto: cambia el − por un + y cambia el signo del segundo número.", `Queda ${p(a)} + ${p(-b)}. ${pistasSuma(a, -b)[0]}`, pistasSuma(a, -b)[1]], mal: [a + b, b - a]}; },
  (r, d) => { const a = r.nz(-MAG[d], MAG[d]), b = r.nz(-MAG[d], MAG[d]); return opcQ({enun: "Transforma la resta en una suma", expr: `${p(a)} ${M} ${p(b)} =`, opciones: [`${p(a)} + ${p(-b)}`, `${p(a)} + ${p(b)}`, `${p(-a)} + ${p(b)}`, `${p(-a)} + ${p(-b)}`], ok: 0, ayuda: "Para restar, se suma al primero el opuesto del segundo."}, r); },
  (r, d) => { const a = r.nz(-MAG[d], MAG[d]), b = r.nz(-MAG[d], MAG[d]), k = r.int(0, 3); const [e, sol] = k === 0 ? [`▢ + ${p(b)} = ${sg(a + b)}`, a] : k === 1 ? [`▢ ${M} ${p(b)} = ${sg(a - b)}`, a] : k === 2 ? [`${p(a)} + ▢ = ${sg(a + b)}`, b] : [`${p(a)} ${M} ▢ = ${sg(a - b)}`, b]; return {tipo: "num", enun: "¿Qué número falta?", expr: e, sol, ayuda: "Prueba con el número que has pensado: tiene que salir el resultado.", mal: [-sol]}; }
];
AP[3].pesos = [[4, 3, 1, 0], [3, 3, 2, 2], [3, 3, 1, 3]];

const abreviada = ts => ts.map((t, i) => (i === 0 ? s(t) : (t < 0 ? ` ${M} ` : " + ") + Math.abs(t))).join("");
const conParentesis = (ts, signos) => ts.map((t, i) => (i === 0 ? p(t) : ` ${signos[i] < 0 ? M : "+"} ${p(signos[i] < 0 ? -t : t)}`)).join("");
AP[4] = [
  (r, d) => { const n = d === 1 ? 3 : 4, ts = Array.from({length: n}, () => r.nz(-MAG[d], MAG[d])), sig = ts.map(() => r.sig()), buena = abreviada(ts);
    const malas = new Set(); let k = 0; while (malas.size < 3 && k++ < 30) { const j = r.int(0, n - 1), t2 = ts.map((x, i) => i === j ? -x : x), m = abreviada(t2); if (m !== buena) malas.add(m); }
    return opcQ({enun: "¿Cómo se escribe en forma abreviada?", expr: conParentesis(ts, sig), opciones: [buena, ...malas], ok: 0, ayuda: "+(+a) = +a, +(−a) = −a, −(+a) = −a y −(−a) = +a."}, r); },
  (r, d) => { const n = d === 1 ? 4 : d === 2 ? 5 : 6, ts = Array.from({length: n}, () => r.nz(-MAG[d], MAG[d])), sol = ts.reduce((a, b) => a + b, 0), pos = ts.filter(x => x > 0).reduce((a, b) => a + b, 0), neg = -ts.filter(x => x < 0).reduce((a, b) => a + b, 0);
    return {tipo: "num", enun: "Calcula", expr: abreviada(ts), sol, ayuda: `Suma los positivos (${pos}) y los negativos (${neg}), y resta: ${pos} − ${neg} = ${s(sol)}.`, pistas: pistasVarios(ts), mal: [-sol, sol + 2 * ts[n - 1]]}; },
  (r, d) => { const n = d === 1 ? 3 : d === 2 ? 4 : 6, ts = Array.from({length: n}, () => r.nz(-MAG[d], MAG[d])), sig = ts.map(() => r.sig()), sol = ts.reduce((a, b) => a + b, 0);
    return {tipo: "num", enun: "Calcula", expr: conParentesis(ts, sig), sol, ayuda: `Primero quita los paréntesis: ${abreviada(ts)}. Luego suma positivos y negativos por separado.`, pistas: ["Quita los paréntesis: un + delante deja el signo como está y un − delante lo cambia.", `Sin paréntesis queda: ${abreviada(ts)}.`, ...pistasVarios(ts).slice(1)], mal: [-sol]}; },
  (r, d) => { const t = combinada(r, d, {solo: "sum", lim: 60}); return {tipo: "pasos", enun: "Resuelve paso a paso", arbol: t, expr: texto(t), sol: valorDe(t), ayuda: "Primero lo que hay dentro de los paréntesis; después, las sumas y restas de izquierda a derecha."}; },
  (r, d) => { const a = r.nz(-MAG[d], MAG[d]), b = r.nz(1, MAG[d]), k = r.int(0, 2); const [e, sol] = k === 0 ? [`▢ + ${b} = ${s(a + b)}`, a] : k === 1 ? [`${s(a)} ${M} ▢ = ${s(a - b)}`, b] : [`▢ ${M} ${b} = ${s(a - b)}`, a]; return {tipo: "num", enun: "¿Qué número falta?", expr: e, sol, ayuda: "Prueba con tu número en el hueco y comprueba que da el resultado.", mal: [-sol]}; }
];
AP[4].pesos = [[3, 3, 3, 1, 1], [2, 3, 3, 3, 1], [1, 2, 3, 4, 1]];

const reglaSignos = (a, b, op) => `${Math.sign(a) === Math.sign(b) ? "Mismo signo" : "Distinto signo"}: el resultado es ${Math.sign(a) === Math.sign(b) ? "positivo" : "negativo"}. ${Math.abs(a)} ${op} ${Math.abs(b)} = ${op === "·" ? Math.abs(a * b) : Math.abs(a / b)}.`;
AP[5] = [
  (r, d) => { const a = r.sig(), b = r.sig(), op = r.pick(["·", ":"]), t = x => x > 0 ? "(+)" : `(${M})`; return {tipo: "opc", enun: "Regla de los signos", expr: `${t(a)} ${op} ${t(b)} = ?`, opciones: ["+", M], ok: a * b > 0 ? 0 : 1, ayuda: "Signos iguales dan +; signos distintos dan −."}; },
  (r, d) => { const m = d === 1 ? 9 : d === 2 ? 12 : 15, a = r.sig() * r.int(2, m), b = r.sig() * r.int(2, m); return {tipo: "num", enun: "Calcula", expr: `${p(a)} · ${p(b)}`, sol: a * b, ayuda: reglaSignos(a, b, "·"), pistas: pistasMul(a, b, "·"), mal: [-a * b, a + b]}; },
  (r, d) => { const m = d === 1 ? 9 : d === 2 ? 12 : 15, b = r.sig() * r.int(2, m), q = r.sig() * r.int(2, m), a = b * q; return {tipo: "num", enun: "Calcula", expr: `${p(a)} : ${p(b)}`, sol: q, ayuda: reglaSignos(a, b, ":"), pistas: pistasMul(a, b, ":"), mal: [-q]}; },
  (r, d) => { const n = d === 1 ? 3 : 4; for (let k = 0; k < 100; k++) { let v = r.sig() * r.int(2, 9); const its = [p(v)]; let ok = true; for (let i = 1; i < n; i++) { const op = r.si(.5) ? "·" : ":"; if (op === "·") { const f = r.sig() * r.int(2, 6); v *= f; its.push("·", p(f)); } else { const ds = []; for (let x = 2; x <= Math.abs(v); x++) if (v % x === 0) ds.push(x); if (!ds.length) { const f = r.sig() * r.int(2, 5); v *= f; its.push("·", p(f)); continue; } const dd = r.pick(ds) * r.sig(); v /= dd; its.push(":", p(dd)); } if (Math.abs(v) > 300) { ok = false; break; } } if (ok) return {tipo: "num", enun: "Calcula (de izquierda a derecha)", expr: its.join(" "), sol: v, ayuda: "Primero el signo: cuenta cuántos negativos hay (par → +, impar → −). Luego opera los valores absolutos de izquierda a derecha.", pistas: pistasCadena(its), mal: [-v]}; } return AP[5][1](r, d); },
  (r, d) => { const m = d === 1 ? 9 : 12, a = r.sig() * r.int(2, m), b = r.sig() * r.int(2, m), k = r.int(0, 2); const [e, sol] = k === 0 ? [`▢ · ${p(b)} = ${sg(a * b)}`, a] : k === 1 ? [`${p(a * b)} : ▢ = ${sg(a)}`, b] : [`▢ : ${p(b)} = ${sg(a)}`, a * b]; return {tipo: "num", enun: "¿Qué número falta?", expr: e, sol, ayuda: "Piensa primero el signo con la regla de los signos y después el número.", mal: [-sol]}; }
];
AP[5].pesos = [[2, 4, 3, 0, 1], [1, 3, 3, 2, 2], [0, 2, 2, 4, 2]];

AP[6] = [
  (r, d) => { let b, e; if (d === 1) { b = r.nz(-5, 5); e = r.int(2, 3); if (e === 3) b = r.nz(-4, 4); } else { e = r.int(2, 5); b = e >= 4 ? r.nz(-3, 3) : r.nz(-6, 6); if (r.si(.15)) { b = -1; e = r.int(7, 40); } } if (Math.abs(b) === 1 && d === 1) b *= 2;
    const v = b ** e; return {tipo: "num", enun: "Calcula la potencia", expr: (b < 0 ? `(${s(b)})` : `(+${b})`) + sup(e), sol: v, pistas: pistasPot(b, e), ayuda: `${Math.abs(b)}${sup(e)} = ${Math.abs(v)}. ${b < 0 ? (e % 2 ? "Base negativa y exponente impar: signo −." : "Base negativa y exponente par: signo +.") : "Base positiva: siempre +."}`, mal: [-v, b * e]}; },
  (r, d) => { const b = r.nz(-90, 90), e = r.int(2, 31); return {tipo: "opc", enun: "Sin calcularla, ¿qué signo tiene?", expr: (b < 0 ? `(${s(b)})` : `(+${b})`) + sup(e), opciones: ["Positivo", "Negativo"], ok: b < 0 && e % 2 ? 1 : 0, ayuda: "Base positiva → siempre +. Base negativa → + si el exponente es par y − si es impar."}; },
  (r, d) => { const b = r.sig() * r.int(2, 9), e = r.int(3, 5), f = Array(e).fill(p(b)).join(" · ");
    return opcQ({enun: "Escribe en forma de potencia", expr: f, opciones: [`(${sg(b)})${sup(e)}`, `(${sg(e)})${sup(Math.abs(b))}`, `(${sg(-b)})${sup(e)}`, `${p(b * e)}`], ok: 0, ayuda: "La base es el número que se repite y el exponente, las veces que se repite."}, r); },
  (r, d) => { const b = r.int(2, 5), e = r.int(2, 4); const k = r.int(0, 1); const [ta, va, tb, vb] = k === 0 ? [`(${M}${b})${sup(e)}`, (-b) ** e, `${M}${b}${sup(e)}`, -(b ** e)] : [`(${M}${b})${sup(e)}`, (-b) ** e, `(+${b})${sup(e)}`, b ** e];
    return {tipo: "opc", enun: "¿Qué signo va en el hueco?", expr: `${ta}  ▢  ${tb}`, opciones: CMP, ok: cmp(va, vb), ayuda: `${ta} = ${s(va)} y ${tb} = ${s(vb)}. Ojo: en ${M}${b}${sup(e)} la base es ${b} y el menos va delante.`}; },
  (r, d) => { const b = r.int(2, 5), e = r.int(2, 4), neg = r.si(.5), forma = r.int(0, 1);
    if (forma) return {tipo: "num", enun: "Calcula", expr: `${M}${b}${sup(e)}`, sol: -(b ** e), ayuda: `${M}${b}${sup(e)} = ${M}(${Array(e).fill(b).join(" · ")}) = ${s(-(b ** e))}. La base es ${b}: el menos va delante.`, mal: [(-b) ** e === -(b ** e) ? b ** e : (-b) ** e]};
    const bb = neg ? -b : b, v = bb ** e; return {tipo: "num", enun: "¿Qué exponente falta?", expr: `(${sg(bb)})${"^▢"} = ${sg(v)}`.replace("^▢", "▢"), sol: e, ayuda: `Multiplica ${p(bb)} por sí mismo hasta llegar a ${sg(v)}.`, mal: [e + 1, e - 1]}; }
];
AP[6].pesos = [[5, 2, 2, 0, 0], [3, 2, 2, 2, 1], [3, 1, 1, 3, 2]];

AP[7] = [
  (r, d) => { const b = r.int(2, d === 1 ? 10 : d === 2 ? 15 : 30), neg = r.si(.2), v = neg ? -(b * b) : b * b;
    return opcQ({enun: "Indica, si existe, la raíz cuadrada", expr: `√${neg ? s(v) : v}`, opciones: [`±${b}`, `Solo ${b}`, `Solo ${M}${b}`, "No existe"], ok: neg ? 3 : 0, ayuda: neg ? "Ningún número al cuadrado da negativo: la raíz de un negativo no existe." : `${b}² = ${b * b} y (${M}${b})² = ${b * b}: un positivo tiene dos raíces.`}, r); },
  (r, d) => { const max = d === 1 ? 99 : d === 2 ? 230 : 900; let a; do a = r.int(5, max); while (Number.isInteger(Math.sqrt(a))); const b = Math.floor(Math.sqrt(a)); return {tipo: "resto", enun: "Calcula la raíz entera y el resto", expr: `√${a}`, sol: b, resto: a - b * b, pistas: [`Busca el número más grande que, al cuadrado, no se pase de ${a}. Prueba: ${Math.max(1, b - 2)}², ${b - 1}², …`, `${b}² = ${b * b} todavía cabe en ${a}, pero ${b + 1}² = ${(b + 1) ** 2} ya se pasa. Esa es la raíz entera.`, `El resto es lo que sobra: ${a} − ${b * b}.`], ayuda: `${b}² = ${b * b} ≤ ${a} y ${b + 1}² = ${(b + 1) ** 2} > ${a}. Raíz entera ${b}; resto ${a} − ${b * b} = ${a - b * b}.`}; },
  (r, d) => { const b = r.nz(-20, 20); return {tipo: "num", enun: `Una raíz cuadrada exacta de un número es ${sg(b)}. ¿Cuál es ese número (el radicando)?`, expr: "", sol: b * b, ayuda: `El radicando es la raíz al cuadrado: (${sg(b)})² = ${b * b}.`, mal: [2 * b, -b * b]}; },
  (r, d) => { let a; do a = r.int(5, d === 1 ? 99 : 500); while (Number.isInteger(Math.sqrt(a))); const b = Math.floor(Math.sqrt(a));
    return opcQ({enun: "¿Entre qué dos enteros está esta raíz?", expr: `√${a}`, opciones: [`${b} y ${b + 1}`, `${b - 1} y ${b}`, `${b + 1} y ${b + 2}`, `${Math.floor(a / 2)} y ${Math.floor(a / 2) + 1}`], ok: 0, ayuda: `${b}² = ${b * b} y ${b + 1}² = ${(b + 1) ** 2}, y ${a} está entre los dos.`}, r); },
  (r, d) => { const b = r.int(4, d === 1 ? 12 : 25), c = b * b, malos = new Set(); while (malos.size < 3) { const m = c + r.nz(-b, b); if (!Number.isInteger(Math.sqrt(m)) && m > 0) malos.add(m); }
    return opcQ({enun: "¿Cuál es un cuadrado perfecto?", expr: "", opciones: [String(c), ...[...malos].map(String)], ok: 0, ayuda: `${c} = ${b}²: su raíz es exacta.`}, r); }
];
AP[7].pesos = [[3, 3, 2, 1, 1], [2, 4, 2, 1, 1], [2, 4, 1, 2, 1]];

AP[8] = [
  (r, d) => { const t = combinada(r, d); return {tipo: "pasos", enun: "Resuelve paso a paso", arbol: t, expr: texto(t), sol: valorDe(t), ayuda: "Paréntesis y corchetes primero; luego potencias y raíces; luego multiplicaciones y divisiones; y al final sumas y restas, de izquierda a derecha."}; },
  (r, d) => { for (let k = 0; k < 40; k++) { const t = combinada(r, d), R = resolver(t); const primero = R.pasos[0].parte, otros = new Set(); const tt = clon(t); plano(tt);
      /* otras operaciones de la expresión que NO van primero */
      const visita = g => { for (let i = 0; i < g.it.length; i++) { const y = g.it[i]; if (i % 2 === 0 && y.k === "g") visita(y); if (i % 2 === 0 && (y.k === "p" || y.k === "r")) otros.add(txt(y, true)); if (i % 2 && g.it[i - 1].k === "n" && g.it[i + 1].k === "n") otros.add(txt(g.it[i - 1], i === 1) + " " + y + " " + txt(g.it[i + 1], false)); } };
      visita(tt); otros.delete(primero);
      if (otros.size >= 2) return opcQ({enun: "¿Qué operación se hace primero?", expr: texto(t), opciones: [primero, ...[...otros].slice(0, 3)], ok: 0, ayuda: "Orden: paréntesis y corchetes → potencias y raíces → multiplicaciones y divisiones → sumas y restas (de izquierda a derecha)."}, r); }
    return AP[8][0](r, d); },
  (r, d) => { const t = combinada(r, d, {maxPasos: d === 1 ? 3 : 5}); const v = valorDe(t), R0 = resolver(t); return {tipo: "num", enun: "Calcula", expr: texto(t), sol: v, pistas: ["Ve por orden: paréntesis y corchetes → potencias y raíces → · y : → + y −.", `Empieza por ${R0.pasos[0].parte}. Te da ${s(R0.pasos[0].v)}.`, ...(R0.pasos[1] ? [`Después: ${R0.pasos[0].despues}. Ahora toca ${pasoNombre(R0.pasos[1])}.`] : [])], ayuda: "Respeta la jerarquía: primero paréntesis, potencias y raíces, luego · y :, y al final + y −.", mal: [-v]}; }
];
AP[8].pesos = [[5, 3, 2], [5, 2, 2], [6, 2, 1]];

const TEMAS = {t2: {titulo: "Números enteros", aps: [1, 2, 3, 4, 5, 6, 7, 8], AP}};

/* un ejercicio del apartado ap con dificultad d (1, 2 o 3). o.texto: solo los que se pueden contestar eligiendo (duelos, concursos) */
function gen(ap, d, r, o = {}) {
  const lista = AP[ap]; if (!lista) return null;
  d = Math.max(1, Math.min(3, d | 0 || 1));
  for (let k = 0; k < 30; k++) {
    const w = lista.pesos[d - 1]; let tot = w.reduce((a, b) => a + b, 0), x = r.f() * tot, i = 0;
    while (x >= w[i]) { x -= w[i]; i++; }
    const q = lista[i](r, d);
    if (!q) continue;
    if (o.texto && (q.tipo === "recta" || q.tipo === "orden")) continue;
    if (o.sinPasos && q.tipo === "pasos") continue;
    q.ap = ap; q.d = d;
    return q;
  }
  return AP[ap][0](r, d);
}
const enunciado = q => q.expr ? `${q.enun}: ${q.expr}` : q.enun;
/* números parecidos al bueno para las opciones malas */
function malos(q, r, n = 3) {
  const sol = q.sol, out = new Set(), poner = v => { if (Number.isFinite(v) && v !== sol && out.size < n) out.add(v); };
  (q.mal || []).forEach(poner); poner(-sol);
  const cerca = r.mez([1, -1, 2, -2, 10, -10, 3, -3, 4, -4]);
  for (const c of cerca) poner(sol + c);
  return [...out];
}
function test(q, r) {
  if (q.tipo === "orden") { const mayor = !q.asc, b = mayor ? Math.max(...q.nums) : Math.min(...q.nums), ops = r.mez(q.nums).slice(0, 4); if (!ops.includes(b)) ops[0] = b; const o2 = r.mez(ops); return [mayor ? "¿Cuál es el mayor?" : "¿Cuál es el menor?", o2.map(sg), o2.indexOf(b)]; }
  if (q.tipo === "recta") return [`¿Qué número está ${q.sol - q.desde} unidades a la derecha de ${sg(q.desde)}?`, ...(() => { const v = r.mez([q.sol, ...malos({sol: q.sol, mal: [q.desde - (q.sol - q.desde)]}, r)]); return [v.map(s), v.indexOf(q.sol)]; })()];
  if (q.tipo === "opc") {
    let ops = q.opciones.map((t, i) => ({t, b: i === q.ok}));
    if (ops.length > 4) ops = [ops.find(x => x.b), ...ops.filter(x => !x.b).slice(0, 3)];
    ops = q.opciones === CMP ? ops : r.mez(ops);
    return [enunciado(q), ops.map(x => x.t), ops.findIndex(x => x.b)];
  }
  if (q.tipo === "resto") {
    const b = [[q.sol, q.resto], [q.sol + 1, q.resto - 2 * q.sol - 1], [q.sol - 1, q.resto + 2 * q.sol - 1], [q.sol, q.resto + 1]].filter(([x, y]) => y >= 0);
    const ops = r.mez(b.map(([x, y], i) => ({t: `Raíz ${x}, resto ${y}`, b: i === 0})));
    return [enunciado(q), ops.map(x => x.t), ops.findIndex(x => x.b)];
  }
  const v = r.mez([q.sol, ...malos(q, r)]);
  return [q.tipo === "pasos" ? `Calcula: ${q.expr}` : enunciado(q), v.map(s), v.indexOf(q.sol)];
}

/* serie para duelos y concursos: "t2-<apartados>-<dificultad>-<cuántas>-<semilla>" */
const SPEC = /^(t2)-([1-8]{1,8})-([123])-(\d{1,2})-(\d{1,10})$/;
function leerSpec(x) {
  const m = String(x || "").match(SPEC); if (!m) return null;
  const aps = [...new Set(m[2].split("").map(Number))].sort();
  return {tema: m[1], aps, d: +m[3], n: Math.max(3, Math.min(30, +m[4])), seed: +m[5] % 2 ** 31};
}
const hacerSpec = o => `${o.tema || "t2"}-${[...new Set(o.aps)].sort().join("")}-${o.d}-${o.n}-${o.seed}`;
const NOMBRES = {1: "Números enteros", 2: "Comparar y ordenar", 3: "Suma y resta de dos", 4: "Suma y resta de varios", 5: "Multiplicación y división", 6: "Potencias", 7: "Raíz cuadrada", 8: "Operaciones combinadas"};
function serie(spec) {
  const o = typeof spec === "string" ? leerSpec(spec) : spec; if (!o) return null;
  const r = Rn(o.seed), q = [], vistos = new Set();
  for (let i = 0, k = 0; q.length < o.n && k < o.n * 20; k++) {
    const ap = o.aps[i % o.aps.length];
    const t = test(gen(ap, o.d, r, {texto: true}), r);
    if (vistos.has(t[0])) continue;
    vistos.add(t[0]); q.push(t); i++;
  }
  const titulo = o.aps.length === 1 ? `Mates · ${NOMBRES[o.aps[0]]}` : o.aps.length === 8 ? "Mates · Números enteros" : `Mates · Enteros (${o.aps.join(", ")})`;
  return {id: "mates", titulo, level: ["", "Fácil", "Medio", "Difícil"][o.d], q};
}

/* pistas de un ejercicio (no de los pasos de una combinada: esos con pistaPaso) */
const ESTRAT = {1: "Piensa en la recta: el 0 en medio, los negativos a la izquierda y los positivos a la derecha.", 2: "En la recta, el mayor es el que está más a la derecha. Entre negativos, gana el que está más cerca del 0.",
  3: "Para sumar, mira si los signos son iguales o distintos. Para restar, suma el opuesto.", 4: "Quita los paréntesis y junta los positivos por un lado y los negativos por otro.",
  5: "Primero el signo con la regla (iguales → +, distintos → −) y después el número.", 6: "Multiplica la base por sí misma tantas veces como dice el exponente; el signo, según la base y si el exponente es par o impar.",
  7: "La raíz de un número es otro número que, al cuadrado, da el primero.", 8: "Sigue el orden: paréntesis y corchetes → potencias y raíces → · y : → + y −."};
function pistas(q) {
  if (q.pistas) return q.pistas;
  const out = [ESTRAT[q.ap] || "Lee bien el enunciado y piensa qué te piden."];
  if (q.tipo === "num" && /▢/.test(q.expr || "")) out.splice(0, 1, "Prueba con un número en el hueco y comprueba si sale el resultado.", `El número que falta es ${q.sol > 0 ? "positivo" : q.sol < 0 ? "negativo" : "el 0"}.`);
  else if (q.tipo === "num" || q.tipo === "recta") out.push(q.sol === 0 ? "El resultado es 0." : `El resultado es ${q.sol > 0 ? "positivo" : "negativo"}.`);
  else if (q.tipo === "opc" && q.opciones.length > 2) { const malo = q.opciones.findIndex((o, i) => i !== q.ok); out.push(`Una que seguro que no es: «${q.opciones[malo]}».`); }
  else if (q.tipo === "orden") { const o = [...q.nums].sort((a, b) => q.asc ? a - b : b - a); out.push(`Separa los negativos y los positivos. ${q.asc ? "El menor" : "El mayor"} de todos es ${sg(o[0])}.`); }
  return out;
}

G.LYAMatesBanco = {pistas, pistaPaso, M, semilla, Rn, s, sg, p, sup, leer, absT, N, POT, RAIZ, GR, txt, texto, resolver, valorDe, combinada, clon, gen, test, enunciado, malos, serie, leerSpec, hacerSpec, TEMAS, NOMBRES, AP};
})();
