/* COMPRENDO · Matemáticas 4.º ESO PDC: ejercicios que se generan solos para el tema 2 «Proporcionalidad y porcentajes».
   Los 8 apartados del tema (el libro empieza en el punto 2):
     1 Proporcionalidad directa · 2 Proporcionalidad inversa · 3 Proporcionalidad compuesta · 4 Porcentajes
     5 Aumentos porcentuales · 6 Disminuciones porcentuales · 7 Interés simple · 8 Repartos proporcionales
   Usa el azar con semilla de mates/banco.js (va antes): con la misma semilla salen los mismos ejercicios en todos los móviles.
   Sirve en el navegador (window.LYAMatesPDC) y en el servidor (api/duelo.js lo importa: globalThis.LYAMatesPDC).

   Además de lo de 1.º (tipo, enun, expr, sol, ayuda, pistas), cada ejercicio de aquí trae ayudas para cuando no se entiende:
     dec: true     → la respuesta puede llevar decimales (con coma) · ud: la unidad (€, km, %…) · prob: es un problema con texto
     res: [...]    → cómo se resuelve, paso a paso (sale al fallar y en «No lo entiendo», con un ejercicio gemelo)
     trampas       → [{v, por}]: los fallos típicos y por qué están mal («has hecho regla de tres inversa, pero…»)
     guia          → [{tipo: "opc"|"num", pide, …, porque}]: el modo guiado, el problema partido en pasos
     porque (opc)  → por qué está mal cada opción
     fig           → HTML de una tabla para completar
   Y para los juegos: monta() (Monta el problema), oferta() (¿Cuál es la mejor oferta?), escape() y cartas(). */
(() => {
const G = typeof globalThis !== "undefined" ? globalThis : window;
const BB = () => G.LYAMatesBanco;
const Rn = x => BB().Rn(x);

/* ---------- números con coma ---------- */
const r2 = v => Math.round(v * 100) / 100;
const dec2 = v => Number.isFinite(v) && Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
function s(v) {
  if (!Number.isFinite(v)) return "?";
  v = r2(v); const neg = v < 0; v = Math.abs(v);
  let [e, d] = v.toFixed(2).split("."); d = d.replace(/0+$/, "");
  if (e.length > 4) e = e.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "−" : "") + e + (d ? "," + d : "");
}
const sg = s;
/* lo que escribe el alumno: «29,75», «29.75», «1.500», «1500», «−3» → número; si no es un número, null */
const leer = t => {
  t = String(t ?? "").trim().replace(/[−–—]/g, "-").replace(/\s+/g, "").replace(/[€%]$/, "");
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, "");
  t = t.replace(",", ".");
  return /^-?\d{1,9}(\.\d{1,4})?$/.test(t) ? parseFloat(t) : null;
};
const igual = (a, b) => a !== null && Number.isFinite(a) && Math.abs(a - b) < 0.006;
const conUd = (v, ud) => s(v) + (ud ? (ud === "%" ? " %" : " " + ud) : "");
const tpl = (t, o) => t.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? "");
const gcd = (a, b) => b ? gcd(b, a % b) : a;
const lcm = (a, b) => a / gcd(a, b) * b;
const NOM = ["Ana", "Luis", "Marta", "Pablo", "Irene", "Hugo", "Sara", "Dani", "Lucía", "Iker", "Nora", "Álex", "Carla", "Mario", "Alba", "Leo"];

/* un problema con respuesta numérica */
const prob = o => ({tipo: "num", dec: true, prob: true, enun: "Resuelve el problema", ...o, trampas: (o.trampas || []).filter(x => Number.isFinite(x.v) && !igual(r2(x.v), o.sol))});
const calc = o => ({tipo: "num", dec: true, enun: "Calcula", ...o, trampas: (o.trampas || []).filter(x => Number.isFinite(x.v) && !igual(r2(x.v), o.sol))});
const opcQ = (o, r, fijo) => {
  const items = o.opciones.map((t, i) => ({t, b: i === o.ok, p: (o.porque || [])[i] || ""}));
  const vistos = new Set(), uni = items.filter(x => !vistos.has(x.t) && vistos.add(x.t));
  const ops = fijo ? uni : r.mez(uni);
  return {...o, tipo: "opc", opciones: ops.map(x => x.t), ok: ops.findIndex(x => x.b), porque: ops.map(x => x.p)};
};
const DIRINV = ["Directa", "Inversa"];

/* ---------- 1 y 2: directa e inversa ---------- */
const DIR = [
  {A: "kg", A1: "kg", B: "€", ma: "Kilos", mb: "Precio (€)", t: "Si {a} kg de cerezas cuestan {p} €, ¿cuánto costarán {b} kg?", rel: "cuantos más kilos compras, más pagas", u: [[2, 3, 4, 5], [1.5, 2.5, 3.5, 1.2], [1.25, 2.75, 3.6, 4.8]], a: [2, 6], b: [2, 12]},
  {A: "horas", A1: "hora", B: "km", ma: "Horas", mb: "Kilómetros", t: "Un tren recorre {p} km en {a} horas. Al mismo ritmo, ¿cuántos km recorrerá en {b} horas?", rel: "cuantas más horas viaja, más kilómetros recorre", u: [[60, 70, 80, 100], [75, 90, 110, 120], [72.5, 85, 95, 105]], a: [2, 5], b: [2, 9]},
  {A: "minutos", A1: "minuto", B: "litros", ma: "Minutos", mb: "Litros", t: "Un grifo echa {p} litros en {a} minutos. ¿Cuántos litros echará en {b} minutos?", rel: "cuanto más tiempo está abierto, más litros echa", u: [[2, 3, 5, 6], [4.5, 7.5, 2.5], [2.25, 8.5, 12.5]], a: [2, 8], b: [3, 20]},
  {A: "minutos", A1: "minuto", B: "€", ma: "Minutos", mb: "Precio (€)", t: "Por una llamada de {a} minutos he pagado {p} €. ¿Cuánto pagaré por una llamada de {b} minutos?", rel: "cuantos más minutos hablas, más pagas", u: [[1, 2], [0.2, 0.5, 0.3, 0.6], [0.15, 0.35, 0.45]], a: [2, 6], b: [5, 20]},
  {A: "vueltas", A1: "vuelta", B: "minutos", ma: "Vueltas", mb: "Minutos", t: "Un corredor da {a} vueltas a la pista en {p} minutos. Al mismo ritmo, ¿cuánto tardará en dar {b} vueltas?", rel: "cuantas más vueltas, más tiempo", u: [[2, 3, 4], [1.5, 2.5, 3.5], [1.75, 2.25, 3.2]], a: [2, 6], b: [5, 25]},
  {A: "kg", A1: "kg", B: "m²", ma: "Pintura (kg)", mb: "Pared (m²)", t: "Con {a} kg de pintura se pintan {p} m² de pared. ¿Cuántos m² se pintarán con {b} kg de la misma pintura?", rel: "cuanta más pintura, más pared pintas", u: [[5, 10], [6, 8, 12], [7.5, 12.5, 4.5]], a: [2, 5], b: [3, 9]},
  {A: "entradas", A1: "entrada", B: "€", ma: "Entradas", mb: "Precio (€)", t: "{a} entradas de cine cuestan {p} €. ¿Cuánto costarán {b} entradas?", rel: "cuantas más entradas, más dinero", u: [[5, 6, 8], [7, 9, 6.5], [7.5, 8.5, 9.25]], a: [2, 6], b: [3, 12]},
  {A: "días", A1: "día", B: "€", ma: "Días", mb: "Dinero (€)", t: "Una clase recauda {p} € en {a} días para el viaje de fin de curso. Al mismo ritmo, ¿cuánto recaudará en {b} días?", rel: "cuantos más días, más dinero recaudan", u: [[50, 100, 150], [120, 75, 90], [62.5, 87.5, 112.5]], a: [2, 5], b: [4, 12]}
];
function directa(r, d, c) {
  c ||= r.pick(DIR);
  const u = r.pick(c.u[d - 1]), a = r.int(c.a[0], c.a[1]);
  let b; do b = r.int(c.b[0], c.b[1]); while (b === a);
  return {c, a, b, u, p: r2(a * u), sol: r2(b * u)};
}
const INV = [
  {A: "grifos", A1: "grifo", B: "horas", ma: "Grifos", mb: "Horas", t: "{a} grifos iguales llenan un depósito en {p} horas. ¿Cuánto tardarán {b} grifos?", rel: "cuantos más grifos, menos tiempo", a: [2, 8], pmax: 30},
  {A: "albañiles", A1: "albañil", B: "días", ma: "Albañiles", mb: "Días", t: "{a} albañiles levantan un muro en {p} días. ¿Cuántos días tardarán {b} albañiles?", rel: "cuantos más albañiles, menos días", a: [2, 10], pmax: 60},
  {A: "vacas", A1: "vaca", B: "días", ma: "Vacas", mb: "Días", t: "Un granjero tiene pienso para alimentar a {a} vacas durante {p} días. ¿Para cuántos días le llegará si tiene {b} vacas?", rel: "cuantas más vacas, menos días dura el pienso", a: [4, 30], pmax: 120},
  {A: "km/h", A1: "km/h", B: "horas", ma: "Velocidad (km/h)", mb: "Horas", t: "Yendo a {a} km/h se tarda {p} horas en hacer un viaje. ¿Cuánto se tardará yendo a {b} km/h?", rel: "cuanto más rápido vas, menos tardas", vals: [40, 50, 60, 75, 80, 90, 100, 120], pmax: 12},
  {A: "personas", A1: "persona", B: "horas", ma: "Personas", mb: "Horas", t: "{a} personas cortan el césped de un jardín en {p} horas. ¿Cuánto tardarán {b} personas?", rel: "cuanta más gente, menos tiempo", a: [2, 6], pmax: 18},
  {A: "horas al día", A1: "hora al día", B: "días", ma: "Horas al día", mb: "Días", t: "Trabajando {a} horas al día, un taller termina un pedido en {p} días. ¿Cuántos días tardará trabajando {b} horas al día?", rel: "cuantas más horas al día, menos días", a: [4, 12], pmax: 40},
  {A: "amigos", A1: "amigo", B: "€", ma: "Amigos", mb: "€ cada uno", t: "Si {a} amigos pagan un regalo, cada uno pone {p} €. ¿Cuánto pondría cada uno si fueran {b} amigos?", rel: "cuantos más amigos, menos pone cada uno", a: [2, 10], pmax: 60}
];
function inversa(r, d, c) {
  c ||= r.pick(INV);
  for (let k = 0; k < 300; k++) {
    const pk = () => c.vals ? r.pick(c.vals) : r.int(c.a[0], c.a[1] + (d > 1 ? 3 : 0));
    const a = pk(), b = pk(); if (a === b) continue;
    const K = d === 3 && r.si(.5) ? a * r.int(1, 12) : lcm(a, b) * r.int(1, d === 1 ? 3 : 6);
    const p = K / a, sol = K / b;
    if (!dec2(p) || !dec2(sol) || p < 1 || sol < 1 || p > c.pmax * 1.5 || sol > c.pmax * 1.5) continue;
    if (d < 3 && (!Number.isInteger(p) || !Number.isInteger(sol))) continue;
    return {c, a, b, K, p, sol: r2(sol)};
  }
  return {c, a: 2, b: 4, K: 24, p: 12, sol: 6};
}
const tipoPor = (rel, es) => es === "d" ? ["", `No es inversa: ${rel}. Si una sube y la otra también, es directa.`] : [`No es directa: ${rel}. Si una sube y la otra baja, es inversa.`, ""];
function probDirecta(r, d, X) {
  const {c, a, b, u, p, sol} = X || directa(r, d);
  return prob({expr: tpl(c.t, {a: s(a), b: s(b), p: s(p)}), sol, ud: c.B,
    ayuda: `Es directa: ${c.rel}. x = ${s(b)} · ${s(p)} : ${s(a)} = ${conUd(sol, c.B)}.`,
    pistas: [`¿Directa o inversa? Piensa: ${c.rel}.`, `Reduce a la unidad: ¿cuánto corresponde a 1 ${c.A1}? Divide ${s(p)} entre ${s(a)}.`, `1 ${c.A1} → ${conUd(u, c.B)}. Ahora multiplica por ${s(b)}.`],
    res: [`Es proporcionalidad directa: ${c.rel}.`, `Reducción a la unidad: 1 ${c.A1} → ${s(p)} : ${s(a)} = ${conUd(u, c.B)}.`, `${s(b)} ${c.A} → ${s(b)} · ${s(u)} = ${conUd(sol, c.B)}.`, `(Con regla de tres: x = ${s(b)} · ${s(p)} : ${s(a)}.)`],
    trampas: [{v: a * p / b, por: `Has hecho una regla de tres inversa. Pero aquí ${c.rel}: es directa, y x = ${s(b)} · ${s(p)} : ${s(a)}.`}, {v: p * b, por: `Has multiplicado ${s(p)} · ${s(b)}, pero te falta dividir entre ${s(a)}.`}, {v: u, por: `Eso es lo que corresponde a 1 ${c.A1}. Te falta multiplicarlo por ${s(b)}.`}, {v: p + b - a, por: `En la proporcionalidad no se suma la diferencia: se multiplica y se divide.`}],
    guia: [
      {tipo: "opc", pide: "¿Qué tipo de proporcionalidad es?", opciones: DIRINV, ok: 0, porque: tipoPor(c.rel, "d")},
      {tipo: "num", pide: `Reduce a la unidad: ¿cuánto corresponde a 1 ${c.A1}?`, sol: u, ud: c.B, porque: `Se divide: ${s(p)} : ${s(a)} = ${s(u)}.`},
      {tipo: "num", pide: `Y a ${s(b)} ${c.A}, ¿cuánto le corresponde?`, sol, ud: c.B, porque: `Se multiplica: ${s(b)} · ${s(u)} = ${s(sol)}.`}]});
}
function probInversa(r, d, X) {
  const {c, a, b, K, p, sol} = X || inversa(r, d);
  return prob({expr: tpl(c.t, {a: s(a), b: s(b), p: s(p)}), sol, ud: c.B,
    ayuda: `Es inversa: ${c.rel}. x = ${s(a)} · ${s(p)} : ${s(b)} = ${conUd(sol, c.B)}.`,
    pistas: [`¿Directa o inversa? Piensa: ${c.rel}.`, `Reduce a la unidad: con 1 ${c.A1}, ¿cuánto sería? En la inversa se multiplica: ${s(a)} · ${s(p)}.`, `Con 1 ${c.A1} → ${conUd(K, c.B)}. Ahora divide entre ${s(b)}.`],
    res: [`Es proporcionalidad inversa: ${c.rel}.`, `Reducción a la unidad: con 1 ${c.A1} → ${s(a)} · ${s(p)} = ${conUd(K, c.B)}.`, `Con ${s(b)} ${c.A} → ${s(K)} : ${s(b)} = ${conUd(sol, c.B)}.`, `(Con regla de tres inversa: x = ${s(a)} · ${s(p)} : ${s(b)}.)`],
    trampas: [{v: b * p / a, por: `Has hecho una regla de tres directa. Pero aquí ${c.rel}: es inversa, y x = ${s(a)} · ${s(p)} : ${s(b)}.`}, {v: K, por: `Eso es lo que sería con 1 ${c.A1}. Te falta dividir entre ${s(b)}.`}, {v: p / b, por: `Has dividido ${s(p)} entre ${s(b)}. Primero multiplica ${s(a)} · ${s(p)} y luego divide entre ${s(b)}.`}],
    guia: [
      {tipo: "opc", pide: "¿Qué tipo de proporcionalidad es?", opciones: DIRINV, ok: 1, porque: tipoPor(c.rel, "i")},
      {tipo: "num", pide: `Reduce a la unidad: con 1 ${c.A1}, ¿cuánto sería?`, sol: K, ud: c.B, porque: `En la inversa, para pasar a 1 se multiplica: ${s(a)} · ${s(p)} = ${s(K)}.`},
      {tipo: "num", pide: `Y con ${s(b)} ${c.A}, ¿cuánto?`, sol, ud: c.B, porque: `Ahora se divide: ${s(K)} : ${s(b)} = ${s(sol)}.`}]});
}
const PARES = [
  ["Los kilos de fruta que compro y lo que pago", "d", "Si compras el doble de kilos, pagas el doble."],
  ["Los kilómetros que hace un coche y la gasolina que gasta", "d", "El doble de kilómetros gasta el doble de gasolina."],
  ["Los minutos que hablo por teléfono y lo que cuesta la llamada", "d", "El doble de minutos cuesta el doble."],
  ["El número de entradas y lo que pagas por ellas", "d", "El doble de entradas cuesta el doble."],
  ["Las horas que trabajas (cobrando por horas) y lo que cobras", "d", "El doble de horas, el doble de dinero."],
  ["El número de hojas de un libro y su grosor", "d", "El doble de hojas, el doble de grosor."],
  ["El lado de un cuadrado y su perímetro", "d", "Si el lado es el doble, el perímetro también."],
  ["El número de obreros y lo que tardan en hacer una obra", "i", "El doble de obreros tarda la mitad."],
  ["La velocidad de un coche y el tiempo que tarda en un viaje", "i", "Al doble de velocidad se tarda la mitad."],
  ["El número de grifos y lo que tardan en llenar un depósito", "i", "El doble de grifos tarda la mitad."],
  ["El número de vacas y los días que dura el pienso", "i", "Con el doble de vacas, el pienso dura la mitad."],
  ["Los amigos que pagan un regalo y lo que pone cada uno", "i", "Si son el doble, cada uno pone la mitad."],
  ["Las horas al día que trabajas y los días que tardas en acabar", "i", "Con el doble de horas al día, tardas la mitad de días."],
  ["La edad de una persona y su altura", "n", "Crecer no va en la misma proporción: con 20 años no mides el doble que con 10."],
  ["La edad de una persona y su número de pie", "n", "El pie no crece en la misma proporción que la edad."],
  ["El color de una camiseta y su talla", "n", "El color no tiene nada que ver con la talla."],
  ["La estatura y el peso de una persona", "n", "Alguien que mide el doble no pesa el doble justo."],
  ["El tamaño de un coche y su precio", "n", "Un coche el doble de grande no cuesta el doble justo."],
  ["La nota de un examen y las horas que duermes", "n", "Dormir el doble no te da el doble de nota."]
];
function identificar(r, d, soloDir) {
  const [t, es, por] = r.pick(soloDir ? PARES.filter(x => x[1] !== "i") : PARES);
  if (soloDir) return opcQ({enun: "¿Son magnitudes directamente proporcionales?", expr: t, opciones: ["Sí, son directamente proporcionales", "No"], ok: es === "d" ? 0 : 1,
    porque: es === "d" ? ["", `Sí lo son: ${por}`] : [`No lo son: ${por}`, ""], ayuda: `${por} Son directas si al doble le corresponde el doble, al triple el triple…`, res: [`Pregúntate: si una es el doble, ¿la otra es justo el doble?`, por]}, r, true);
  const ok = es === "d" ? 0 : es === "i" ? 1 : 2;
  const porque = ["Directa", "Inversa", "No son proporcionales"].map((_, i) => i === ok ? "" : `${es === "d" ? "Es directa" : es === "i" ? "Es inversa" : "No son proporcionales"}: ${por}`);
  return opcQ({enun: "¿Qué relación hay entre estas magnitudes?", expr: t, opciones: ["Directa", "Inversa", "No son proporcionales"], ok, porque,
    ayuda: `${por} Directa: el doble con el doble. Inversa: el doble con la mitad.`, res: ["Imagina que la primera se hace el doble.", "Si la otra se hace el doble → directa; si se hace la mitad → inversa; si no pasa ninguna de las dos cosas → no son proporcionales.", por]}, r, true);
}
const celda = (v, hueco) => hueco ? `<td class="mt-tbh">▢</td>` : `<td>${s(v)}</td>`;
function tablaHTML(ma, mb, xs, ys, hi, hj) {
  return `<table class="mt-tabla"><tr><th>${ma}</th>${xs.map((v, j) => celda(v, hi === 0 && hj === j)).join("")}</tr><tr><th>${mb}</th>${ys.map((v, j) => celda(v, hi === 1 && hj === j)).join("")}</tr></table>`;
}
const tablaTxt = (ma, mb, xs, ys, hi, hj) => `${ma}: ${xs.map((v, j) => hi === 0 && hj === j ? "▢" : s(v)).join(", ")} · ${mb}: ${ys.map((v, j) => hi === 1 && hj === j ? "▢" : s(v)).join(", ")}`;
function tablaDirecta(r, d) {
  const k = r.pick([[2, 3, 4, 5, 6], [1.5, 2.5, 0.5, 3.5, 7], [1.2, 0.75, 2.4, 1.25, 4.5]][d - 1]), set = new Set();
  while (set.size < 4) set.add(r.int(1, d === 1 ? 10 : 15));
  const xs = [...set].sort((a, b) => a - b), ys = xs.map(x => r2(x * k)), hj = r.int(1, 3), hi = d > 1 && r.si(.4) ? 0 : 1, sol = hi ? ys[hj] : xs[hj];
  const j0 = hj === 0 ? 1 : 0;
  return {tipo: "num", dec: true, enun: "Las dos filas son directamente proporcionales. ¿Qué número va en el hueco?", expr: tablaTxt("Fila 1", "Fila 2", xs, ys, hi, hj), fig: tablaHTML("Fila 1", "Fila 2", xs, ys, hi, hj), sol,
    ayuda: `En una tabla directa, abajo siempre es arriba por el mismo número: ${s(k)} (la razón). ${hi ? `${s(xs[hj])} · ${s(k)} = ${s(sol)}` : `${s(ys[hj])} : ${s(k)} = ${s(sol)}`}.`,
    pistas: [`Busca el número por el que se multiplica la fila de arriba para tener la de abajo.`, `Mira una columna completa: ${s(ys[j0])} : ${s(xs[j0])} = ${s(k)}.`, hi ? `Multiplica ${s(xs[hj])} por ${s(k)}.` : `Divide ${s(ys[hj])} entre ${s(k)}.`],
    res: [`La razón es ${s(ys[j0])} : ${s(xs[j0])} = ${s(k)} (vale para todas las columnas).`, hi ? `Abajo = arriba · ${s(k)} → ${s(xs[hj])} · ${s(k)} = ${s(sol)}.` : `Arriba = abajo : ${s(k)} → ${s(ys[hj])} : ${s(k)} = ${s(sol)}.`],
    trampas: [{v: hi ? xs[hj] / k : ys[hj] * k, por: hi ? "Has dividido, pero para ir de arriba a abajo se multiplica por la razón." : "Has multiplicado, pero para ir de abajo a arriba se divide entre la razón."}, {v: hi ? ys[0] * xs[0] / xs[hj] : 0, por: "Eso sería en una tabla inversa (el producto igual). Aquí es directa: el cociente es igual."}]};
}
function tablaInversa(r, d) {
  const K = r.pick([[12, 24, 36, 60], [48, 72, 90, 120], [180, 240, 360, 30]][d - 1]), divs = [];
  for (let x = 1; x <= K; x++) if (K % x === 0 && x <= 30) divs.push(x);
  const xs = r.mez(divs).slice(0, 4).sort((a, b) => a - b), ys = xs.map(x => K / x), hj = r.int(1, 3), hi = d > 1 && r.si(.4) ? 0 : 1, sol = hi ? ys[hj] : xs[hj];
  const j0 = hj === 0 ? 1 : 0;
  return {tipo: "num", dec: true, enun: "Las dos filas son inversamente proporcionales. ¿Qué número va en el hueco?", expr: tablaTxt("Fila 1", "Fila 2", xs, ys, hi, hj), fig: tablaHTML("Fila 1", "Fila 2", xs, ys, hi, hj), sol,
    ayuda: `En una tabla inversa, arriba por abajo da siempre lo mismo: ${s(K)}. ${s(K)} : ${s(hi ? xs[hj] : ys[hj])} = ${s(sol)}.`,
    pistas: [`En la inversa, el producto de cada columna es el mismo.`, `Multiplica una columna completa: ${s(xs[j0])} · ${s(ys[j0])} = ${s(K)}.`, `Divide ${s(K)} entre ${s(hi ? xs[hj] : ys[hj])}.`],
    res: [`Producto de una columna: ${s(xs[j0])} · ${s(ys[j0])} = ${s(K)} (es igual en todas).`, `${s(K)} : ${s(hi ? xs[hj] : ys[hj])} = ${s(sol)}.`],
    trampas: [{v: hi ? xs[hj] * ys[j0] / xs[j0] : ys[hj] * xs[j0] / ys[j0], por: "Eso sería en una tabla directa. Aquí es inversa: cuando una sube, la otra baja, y el producto se mantiene."}]};
}
function unidadDirecta(r, d) {
  const {c, a, u, p} = directa(r, d);
  return prob({enun: "Reducción a la unidad", expr: tpl(c.t.replace(/¿[^?]*\?$/, ""), {a: s(a), p: s(p)}) + `¿Cuánto corresponde a 1 ${c.A1}?`, sol: u, ud: c.B,
    ayuda: `En la directa, para pasar a 1 se divide: ${s(p)} : ${s(a)} = ${s(u)}.`, pistas: [`Si a ${s(a)} ${c.A} le corresponden ${conUd(p, c.B)}, a 1 le corresponde menos: hay que repartir.`, `Divide ${s(p)} entre ${s(a)}.`],
    res: [`Es directa: ${c.rel}.`, `1 ${c.A1} → ${s(p)} : ${s(a)} = ${conUd(u, c.B)}.`], trampas: [{v: p * a, por: `Has multiplicado. Para 1 ${c.A1} sale menos que para ${s(a)}: se divide.`}]});
}
function unidadInversa(r, d) {
  const {c, a, K, p} = inversa(r, d);
  return prob({enun: "Reducción a la unidad", expr: tpl(c.t.replace(/¿[^?]*\?$/, ""), {a: s(a), p: s(p)}) + `¿Cuánto sería con 1 ${c.A1}?`, sol: K, ud: c.B,
    ayuda: `En la inversa, para pasar a 1 se multiplica: ${s(a)} · ${s(p)} = ${s(K)}.`, pistas: [`Con menos ${c.A}, ¿más o menos ${c.B}? (${c.rel}).`, `Con 1 solo sale ${s(a)} veces más: multiplica ${s(a)} · ${s(p)}.`],
    res: [`Es inversa: ${c.rel}.`, `Con 1 ${c.A1} → ${s(a)} · ${s(p)} = ${conUd(K, c.B)}.`], trampas: [{v: p / a, por: `Has dividido. En la inversa, con 1 solo se tarda (o se pone) más: se multiplica.`}]});
}

/* ---------- 3: compuesta ---------- */
const COMP = [
  {k: "dd", t: "{x1} obreros, trabajando {y1} horas al día, construyen {z1} m de valla. ¿Cuántos metros construirán {x2} obreros trabajando {y2} horas al día?", X: "obreros", X1: "obrero", Y: "horas al día", Y1: "hora al día", Z: "metros", Zu: "m", rx: "más obreros, más metros", ry: "más horas al día, más metros"},
  {k: "dd", t: "{x1} perros comen {z1} kg de pienso en {y1} días. ¿Cuántos kg comerán {x2} perros en {y2} días?", X: "perros", X1: "perro", Y: "días", Y1: "día", Z: "kg de pienso", Zu: "kg", rx: "más perros, más pienso", ry: "más días, más pienso"},
  {k: "dd", t: "{x1} embotelladoras llenan {z1} litros de zumo en {y1} días. ¿Cuántos litros llenarán {x2} embotelladoras en {y2} días?", X: "embotelladoras", X1: "embotelladora", Y: "días", Y1: "día", Z: "litros", Zu: "litros", rx: "más embotelladoras, más litros", ry: "más días, más litros"},
  {k: "dd", t: "Un autocar, haciendo {x1} viajes al día durante {y1} días, lleva a {z1} personas. ¿A cuántas personas llevará haciendo {x2} viajes al día durante {y2} días?", X: "viajes al día", X1: "viaje al día", Y: "días", Y1: "día", Z: "personas", Zu: "personas", rx: "más viajes, más personas", ry: "más días, más personas"},
  {k: "dx", t: "{x1} máquinas tejen {z1} polos en {y1} horas. ¿Cuántas máquinas hacen falta para tejer {z2} polos en {y2} horas?", X: "máquinas", X1: "máquina", Y: "horas", Y1: "hora", Z: "polos", Zu: "polos", rx: "más polos, más máquinas", ry: "más horas, menos máquinas"},
  {k: "dx", t: "{x1} sastres hacen {z1} trajes en {y1} días. ¿Cuántos sastres hacen falta para hacer {z2} trajes en {y2} días?", X: "sastres", X1: "sastre", Y: "días", Y1: "día", Z: "trajes", Zu: "sastres", rx: "más trajes, más sastres", ry: "más días, menos sastres"},
  {k: "ii", t: "{x1} obreros, trabajando {y1} horas al día, hacen un pozo en {z1} días. ¿Cuántos días tardarían {x2} obreros trabajando {y2} horas al día?", X: "obreros", X1: "obrero", Y: "horas al día", Y1: "hora al día", Z: "días", Zu: "días", rx: "más obreros, menos días", ry: "más horas al día, menos días"},
  {k: "ii", t: "{x1} grifos, abiertos {y1} horas al día, llenan una piscina en {z1} días. ¿Cuántos días tardarían {x2} grifos abiertos {y2} horas al día?", X: "grifos", X1: "grifo", Y: "horas al día", Y1: "hora al día", Z: "días", Zu: "días", rx: "más grifos, menos días", ry: "más horas al día, menos días"}
];
function compuesta(r, d, k) {
  const lista = COMP.filter(c => k ? c.k === k : true), c = r.pick(lista);
  for (let n = 0; n < 400; n++) {
    const x1 = r.int(2, 8), y1 = r.int(2, 8), x2 = r.int(2, 9), y2 = r.int(2, 9);
    if (x1 === x2 || y1 === y2) continue;
    if (c.k === "dd" || c.k === "dx") {
      const q = r.pick(d === 1 ? [2, 3, 4, 5, 10] : d === 2 ? [2, 5, 10, 12, 15, 20, 2.5] : [1.5, 2.5, 7.5, 12, 25, 30]);
      const z1 = r2(q * x1 * y1), z2 = r2(q * x2 * y2);
      if (!dec2(z1) || !dec2(z2)) continue;
      return c.k === "dd" ? {c, x1, y1, z1, x2, y2, q, sol: z2, pide: "z"} : {c, x1, y1, z1, z2, y2, q, sol: x2, pide: "x"};
    }
    const z1 = r.int(3, 30), K = x1 * y1 * z1, z2 = K / (x2 * y2);
    if (!Number.isInteger(z2) && !(d === 3 && dec2(z2))) continue;
    if (z2 < 1 || z2 > 200) continue;
    return {c, x1, y1, z1, x2, y2, K, sol: z2, pide: "z"};
  }
  return compuesta(r, d, "dd");
}
function probCompuesta(r, d, k) {
  const X = compuesta(r, d, k), {c, x1, y1, z1, x2, y2} = X, o = {x1, y1, z1: s(z1), x2, y2, z2: s(X.z2)};
  const expr = tpl(c.t, o);
  const relX = c.k === "ii" ? 1 : 0, relY = c.k === "dd" ? 0 : 1;
  const g1 = {tipo: "opc", pide: `¿Cómo son «${c.X}» y «${c.k === "dx" ? c.Z : c.Z}»?`, opciones: DIRINV, ok: relX, porque: tipoPor(c.rx, relX ? "i" : "d")};
  const g2 = {tipo: "opc", pide: `¿Y «${c.Y}» y «${c.k === "dx" ? c.X : c.Z}»?`, opciones: DIRINV, ok: relY, porque: tipoPor(c.ry, relY ? "i" : "d")};
  if (c.k === "dd") {
    const {q, sol} = X;
    return prob({expr, sol, ud: c.Zu, ayuda: `Las dos son directas. 1 ${c.X1} en 1 ${c.Y1} → ${s(z1)} : ${x1} : ${y1} = ${s(q)}. Luego ${s(q)} · ${x2} · ${y2} = ${s(sol)}.`,
      pistas: [`Mira cada magnitud con la que preguntan por separado: ${c.rx}; ${c.ry}.`, `Reduce a la unidad: 1 ${c.X1} en 1 ${c.Y1}. Divide ${s(z1)} entre ${x1} y entre ${y1}.`, `1 ${c.X1} en 1 ${c.Y1} → ${s(q)} ${c.Zu}. Ahora multiplica por ${x2} y por ${y2}.`],
      res: [`${c.rx[0].toUpperCase() + c.rx.slice(1)} (directa). ${c.ry[0].toUpperCase() + c.ry.slice(1)} (directa).`, `1 ${c.X1} en 1 ${c.Y1} → ${s(z1)} : ${x1} : ${y1} = ${s(q)} ${c.Zu}.`, `${x2} ${c.X} en ${y2} ${c.Y} → ${s(q)} · ${x2} · ${y2} = ${s(sol)} ${c.Zu}.`],
      trampas: [{v: z1 * x2 / x1, por: `Solo has tenido en cuenta a los ${c.X}. Falta lo de ${c.Y}: multiplica también por ${y2} y divide entre ${y1}.`}, {v: z1 * y2 / y1, por: `Solo has tenido en cuenta ${c.Y}. Falta lo de ${c.X}: multiplica también por ${x2} y divide entre ${x1}.`}, {v: z1 * x1 * y1 / (x2 * y2), por: "Has hecho las dos inversas, pero las dos son directas: más de cada una da más."}],
      guia: [g1, g2, {tipo: "num", pide: `Reduce a la unidad: 1 ${c.X1} en 1 ${c.Y1}, ¿cuánto?`, sol: q, ud: c.Zu, porque: `${s(z1)} : ${x1} : ${y1} = ${s(q)}.`}, {tipo: "num", pide: `Y ${x2} ${c.X} en ${y2} ${c.Y}?`, sol, ud: c.Zu, porque: `${s(q)} · ${x2} · ${y2} = ${s(sol)}.`}]});
  }
  if (c.k === "dx") {
    const {q, z2, sol} = X;
    return prob({expr, sol, ud: c.X, ayuda: `1 ${c.X1} en 1 ${c.Y1} hace ${s(q)} ${c.Z}. Para ${s(z2)} en ${y2} ${c.Y}: ${s(z2)} : (${s(q)} · ${y2}) = ${sol}.`,
      pistas: [`Piensa: ${c.rx}; ${c.ry}.`, `Calcula lo que hace 1 ${c.X1} en 1 ${c.Y1}: ${s(z1)} : ${x1} : ${y1}.`, `1 ${c.X1} hace ${s(q)} en 1 ${c.Y1}; en ${y2} ${c.Y} hace ${s(q * y2)}. ¿Cuántas veces cabe eso en ${s(z2)}?`],
      res: [`${c.rx[0].toUpperCase() + c.rx.slice(1)} (directa). ${c.ry[0].toUpperCase() + c.ry.slice(1)} (inversa).`, `1 ${c.X1} en 1 ${c.Y1} → ${s(z1)} : ${x1} : ${y1} = ${s(q)} ${c.Z}.`, `1 ${c.X1} en ${y2} ${c.Y} → ${s(q)} · ${y2} = ${s(q * y2)} ${c.Z}.`, `${s(z2)} : ${s(q * y2)} = ${sol} ${c.X}.`],
      trampas: [{v: x1 * (z2 / z1) * (y2 / y1), por: `Más ${c.Y} no necesita más ${c.X}: ${c.ry}. Esa es inversa.`}, {v: x1 * z2 / z1, por: `Te falta tener en cuenta las ${c.Y}: ${c.ry}.`}],
      guia: [{...g1, pide: `¿Cómo son «${c.Z}» y «${c.X}»?`, ok: 0, porque: tipoPor(c.rx, "d")}, {...g2, ok: 1, porque: tipoPor(c.ry, "i")}, {tipo: "num", pide: `¿Cuántos ${c.Z} hace 1 ${c.X1} en 1 ${c.Y1}?`, sol: q, ud: c.Z, porque: `${s(z1)} : ${x1} : ${y1} = ${s(q)}.`}, {tipo: "num", pide: `¿Cuántos ${c.X} hacen falta para ${s(z2)} ${c.Z} en ${y2} ${c.Y}?`, sol, ud: c.X, porque: `${s(z2)} : (${s(q)} · ${y2}) = ${sol}.`}]});
  }
  const {K, sol} = X;
  return prob({expr, sol, ud: c.Zu, ayuda: `Las dos son inversas. El trabajo total: ${x1} · ${y1} · ${z1} = ${K}. Luego ${K} : (${x2} · ${y2}) = ${s(sol)}.`,
    pistas: [`Piensa: ${c.rx}; ${c.ry}. Las dos son inversas.`, `Reduce a la unidad: 1 ${c.X1} 1 ${c.Y1} tardaría ${x1} · ${y1} · ${z1} ${c.Z}.`, `Con 1 ${c.X1} y 1 ${c.Y1} → ${K}. Divide entre ${x2} y entre ${y2}.`],
    res: [`${c.rx[0].toUpperCase() + c.rx.slice(1)} (inversa). ${c.ry[0].toUpperCase() + c.ry.slice(1)} (inversa).`, `1 ${c.X1}, 1 ${c.Y1} → ${x1} · ${y1} · ${z1} = ${K} ${c.Z}.`, `${x2} ${c.X}, ${y2} ${c.Y} → ${K} : ${x2} : ${y2} = ${s(sol)} ${c.Z}.`],
    trampas: [{v: z1 * x2 * y2 / (x1 * y1), por: `Has hecho las dos directas, pero ${c.rx} y ${c.ry}: las dos son inversas.`}, {v: K, por: `Eso sería con 1 ${c.X1} y 1 ${c.Y1}. Te falta dividir entre ${x2} y ${y2}.`}],
    guia: [g1, g2, {tipo: "num", pide: `Reduce a la unidad: ¿cuánto con 1 ${c.X1} y 1 ${c.Y1}?`, sol: K, ud: c.Zu, porque: `Son inversas: se multiplica. ${x1} · ${y1} · ${z1} = ${K}.`}, {tipo: "num", pide: `¿Y con ${x2} ${c.X} y ${y2} ${c.Y}?`, sol, ud: c.Zu, porque: `${K} : ${x2} : ${y2} = ${s(sol)}.`}]});
}
function idCompuesta(r, d) {
  const X = compuesta(r, d), c = X.c, o = {x1: X.x1, y1: X.y1, z1: s(X.z1), x2: X.x2, y2: X.y2, z2: s(X.z2)}, cual = r.si(.5);
  const ok = cual ? (c.k === "ii" ? 1 : 0) : (c.k === "dd" ? 0 : 1), rel = cual ? c.rx : c.ry, mag = cual ? c.X : c.Y, otra = c.k === "dx" && !cual ? c.X : c.k === "dx" ? c.Z : c.Z;
  return opcQ({enun: `En este problema, ¿cómo son «${mag}» y «${otra}»?`, expr: tpl(c.t, o), opciones: DIRINV, ok, porque: tipoPor(rel, ok ? "i" : "d"), prob: true,
    ayuda: `${rel[0].toUpperCase() + rel.slice(1)}: ${ok ? "inversa" : "directa"}.`, res: ["En la compuesta se mira cada magnitud por separado, como si las demás no cambiaran.", `${rel[0].toUpperCase() + rel.slice(1)} → ${ok ? "inversa" : "directa"}.`]}, r, true);
}

/* ---------- 4: porcentajes ---------- */
const PCT = [[10, 20, 25, 50, 75], [5, 15, 30, 35, 40, 60, 80, 12, 45], [3, 7, 13, 17, 24, 65, 120, 150, 2.5, 12.5]];
function pctDe(r, d) {
  for (let n = 0; n < 100; n++) {
    const a = r.pick(PCT[d - 1]), b = d === 1 ? 20 * r.int(1, 25) : d === 2 ? 10 * r.int(2, 60) : r.int(20, 2000), sol = a * b / 100;
    if (!dec2(sol)) continue;
    const trucos = {10: "El 10 % es dividir entre 10.", 20: "El 20 % es el doble del 10 %.", 25: "El 25 % es la cuarta parte: divide entre 4.", 50: "El 50 % es la mitad.", 75: "El 75 % son tres cuartas partes."};
    return calc({expr: `${s(a)} % de ${s(b)}`, sol: r2(sol), ayuda: `El ${s(a)} % de ${s(b)} es ${s(a)} · ${s(b)} : 100 = ${s(sol)}.`,
      pistas: [trucos[a] || "El a % de b es a · b : 100.", `Multiplica ${s(a)} · ${s(b)} = ${s(a * b)}.`, `Ahora divide ${s(a * b)} entre 100.`],
      res: [`${s(a)} % de ${s(b)} = ${s(a)} · ${s(b)} : 100`, `= ${s(a * b)} : 100 = ${s(sol)}.`],
      trampas: [{v: a * b, por: `Te falta dividir entre 100: el ${s(a)} % es ${s(a)} de cada 100.`}, {v: b - sol, por: `Eso es lo que queda al quitar el ${s(a)} %. Te piden el ${s(a)} % en sí.`}, {v: a * b / 10, por: "Se divide entre 100, no entre 10."}]});
  }
  return calc({expr: "10 % de 50", sol: 5, ayuda: "50 : 10 = 5."});
}
const QUEPCT = [
  ["En un instituto hay {T} alumnos y {p} están en 1.º de ESO. ¿Qué porcentaje de alumnos está en 1.º?", "alumnos"],
  ["De un trayecto de {T} km ya he recorrido {p} km. ¿Qué porcentaje del trayecto he recorrido?", "km"],
  ["En una clase de {T} alumnos, {p} llevan gafas. ¿Qué porcentaje de la clase lleva gafas?", "alumnos"],
  ["Un embalse tiene capacidad para {T} hm³ y ahora tiene {p} hm³. ¿A qué porcentaje de su capacidad está?", "hm³"],
  ["En un examen de {T} preguntas he acertado {p}. ¿Qué porcentaje he acertado?", "preguntas"],
  ["De los {T} € que tenía ahorrados me he gastado {p} €. ¿Qué porcentaje me he gastado?", "€"]
];
const TOT = [20, 25, 40, 50, 80, 120, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1200, 1500];
function quePct(r, d) {
  for (let n = 0; n < 200; n++) {
    const [t] = r.pick(QUEPCT), T = r.pick(TOT), pct = r.pick(d === 1 ? [10, 20, 25, 50, 75] : d === 2 ? [5, 15, 30, 40, 60, 80, 35] : [12, 24, 36, 45, 65, 85, 12.5, 37.5]), p = T * pct / 100;
    if (!Number.isInteger(p) || p <= 0) continue;
    return prob({expr: tpl(t, {T: s(T), p: s(p)}), sol: pct, ud: "%", ayuda: `${s(p)} · 100 : ${s(T)} = ${s(pct)} %.`,
      pistas: ["Regla de tres: el total es el 100 %.", `${s(T)} → 100 %; ${s(p)} → x %.`, `x = ${s(p)} · 100 : ${s(T)}.`],
      res: [`Regla de tres: ${s(T)} → 100 % y ${s(p)} → x.`, `x = ${s(p)} · 100 : ${s(T)} = ${s(p * 100)} : ${s(T)} = ${s(pct)} %.`],
      trampas: [{v: p / T, por: `Eso es la parte de 1. Para tenerlo en %, multiplica por 100: ${s(p)} · 100 : ${s(T)}.`}, {v: T / p, por: `Lo has dividido al revés: es la parte entre el total, ${s(p)} : ${s(T)}, por 100.`}, {v: p * T / 100, por: `Eso sería el ${s(p)} % de ${s(T)}. Aquí te preguntan qué % es ${s(p)} de ${s(T)}.`}],
      guia: [{tipo: "opc", pide: "¿Qué cantidad es el 100 %?", opciones: [s(T), s(p)], ok: 0, porque: ["", `El 100 % es el total, ${s(T)}; ${s(p)} es solo una parte.`]}, {tipo: "num", pide: `x = ${s(p)} · 100 : ${s(T)} = ?`, sol: pct, ud: "%", porque: `${s(p * 100)} : ${s(T)} = ${s(pct)}.`}]});
  }
}
const TOTAL = [
  ["El {pct} % de los alumnos de un instituto está en 2.º de ESO. Si en 2.º hay {p} alumnos, ¿cuántos alumnos tiene el instituto?", "alumnos"],
  ["Una empresa gana {p} € con el {pct} % de su producción. ¿Cuánto ganaría con toda la producción?", "€"],
  ["He pagado {p} € de entrada, que es el {pct} % del precio de una moto. ¿Cuánto cuesta la moto?", "€"],
  ["Llevo {p} km, que son el {pct} % del camino. ¿Cuántos km tiene el camino?", "km"],
  ["En una votación, {p} personas (el {pct} %) votaron que sí. ¿Cuántas personas votaron?", "personas"]
];
function totalDe(r, d) {
  for (let n = 0; n < 200; n++) {
    const [t, ud] = r.pick(TOTAL), T = r.pick(TOT) * (d === 3 ? r.int(1, 3) : 1), pct = r.pick(d === 1 ? [10, 20, 25, 50] : d === 2 ? [5, 15, 30, 40, 60, 75, 80] : [12, 35, 45, 65, 85, 12.5]), p = T * pct / 100;
    if (!Number.isInteger(p) || p <= 0) continue;
    return prob({expr: tpl(t, {pct: s(pct), p: s(p)}), sol: T, ud, ayuda: `${s(p)} es el ${s(pct)} %. El total (100 %) es ${s(p)} · 100 : ${s(pct)} = ${s(T)}.`,
      pistas: [`Ojo: ${s(p)} no es el total, es el ${s(pct)} % del total.`, `Regla de tres: ${s(pct)} % → ${s(p)}; 100 % → x.`, `x = ${s(p)} · 100 : ${s(pct)}.`],
      res: [`${s(pct)} % → ${s(p)} y 100 % → x.`, `x = ${s(p)} · 100 : ${s(pct)} = ${s(T)} ${ud}.`],
      trampas: [{v: p * pct / 100, por: `Has calculado el ${s(pct)} % de ${s(p)}, pero ${s(p)} ya es el ${s(pct)} %. Busca el total: ${s(p)} · 100 : ${s(pct)}.`}, {v: p * 100, por: `Te falta dividir entre ${s(pct)}.`}, {v: p + pct, por: "No se suman el número y el porcentaje: haz la regla de tres."}],
      guia: [{tipo: "opc", pide: `¿Qué es ${s(p)}?`, opciones: ["El total (100 %)", `El ${s(pct)} % del total`], ok: 1, porque: [`No: el enunciado dice que ${s(p)} es el ${s(pct)} %. El total es lo que buscas.`, ""]}, {tipo: "num", pide: `Si ${s(pct)} % → ${s(p)}, ¿cuánto es el 1 %?`, sol: p / pct, ud, porque: `${s(p)} : ${s(pct)} = ${s(p / pct)}.`}, {tipo: "num", pide: "¿Y el 100 %?", sol: T, ud, porque: `${s(p / pct)} · 100 = ${s(T)}.`}]});
  }
}
const RESTO = [
  ["En una clase de {T} alumnos, el {pct} % son chicos. ¿Cuántas chicas hay?", "chicas", "chicos"],
  ["De un trayecto de {T} km he recorrido el {pct} %. ¿Cuántos km me quedan?", "km", "km recorridos"],
  ["Un embalse de {T} hm³ está al {pct} % de su capacidad. ¿Cuántos hm³ le faltan para llenarse?", "hm³", "hm³ que tiene"],
  ["En una empresa de {T} empleados, el {pct} % tiene más de 45 años. ¿Cuántos tienen 45 o menos?", "empleados", "empleados de más de 45"],
  ["De los {T} alumnos de un curso, el {pct} % viene en autobús. ¿Cuántos no vienen en autobús?", "alumnos", "que vienen en autobús"]
];
function restoPct(r, d) {
  for (let n = 0; n < 200; n++) {
    const [t, ud, parte] = r.pick(RESTO), T = r.pick(TOT), pct = r.pick(d === 1 ? [10, 20, 25, 50] : d === 2 ? [15, 30, 40, 60, 35] : [12, 24, 45, 65, 85]), p = T * pct / 100;
    if (!Number.isInteger(p) || p <= 0) continue;
    const sol = T - p;
    return prob({expr: tpl(t, {T: s(T), pct: s(pct)}), sol, ud, ayuda: `El ${s(pct)} % de ${s(T)} son ${s(p)} (${parte}). El resto: ${s(T)} − ${s(p)} = ${s(sol)}. O directamente el ${100 - pct} % de ${s(T)}.`,
      pistas: ["Te preguntan por lo que queda, no por el porcentaje que dicen.", `Calcula el ${s(pct)} % de ${s(T)} y réstalo del total. O calcula el ${s(100 - pct)} %.`, `${s(pct)} % de ${s(T)} = ${s(p)}. Ahora ${s(T)} − ${s(p)}.`],
      res: [`${s(pct)} % de ${s(T)} = ${s(pct)} · ${s(T)} : 100 = ${s(p)} (${parte}).`, `Lo que queda: ${s(T)} − ${s(p)} = ${s(sol)} ${ud}.`, `(Otra forma: el ${s(100 - pct)} % de ${s(T)} = ${s(sol)}.)`],
      trampas: [{v: p, por: `${s(p)} es el ${s(pct)} % (${parte}). Te piden el resto: ${s(T)} − ${s(p)}.`}, {v: T - pct, por: `No se resta el porcentaje al total: primero calcula cuánto es el ${s(pct)} %.`}],
      guia: [{tipo: "num", pide: `¿Cuánto es el ${s(pct)} % de ${s(T)}?`, sol: p, ud, porque: `${s(pct)} · ${s(T)} : 100 = ${s(p)}.`}, {tipo: "num", pide: "¿Y cuánto queda?", sol, ud, porque: `${s(T)} − ${s(p)} = ${s(sol)}.`}]});
  }
}
function pctDecimal(r, d) {
  if (d === 1 && r.si(.5)) {
    const [a, f] = r.pick([[50, "la mitad"], [25, "la cuarta parte"], [10, "la décima parte"], [20, "la quinta parte"], [75, "tres cuartas partes"]]);
    const ops = ["la mitad", "la cuarta parte", "la décima parte", "la quinta parte", "tres cuartas partes"].filter(x => x !== f);
    return opcQ({enun: `El ${a} % de una cantidad es…`, expr: "", opciones: [f, ...r.mez(ops).slice(0, 3)], ok: 0, porque: ["", `${a} % = ${a}/100. ${f[0].toUpperCase() + f.slice(1)}.`, `${a} % = ${a}/100. ${f[0].toUpperCase() + f.slice(1)}.`, `${a} % = ${a}/100. ${f[0].toUpperCase() + f.slice(1)}.`], ayuda: `${a} de cada 100 es ${f}.`, res: [`${a} % = ${a}/100.`, `Simplificando, es ${f}.`]}, r);
  }
  const a = r.pick(PCT[Math.min(2, d)]), v = a / 100;
  return opcQ({enun: `Calcular el ${s(a)} % de una cantidad es lo mismo que multiplicarla por…`, expr: "", opciones: [s(v), s(a / 10), s(a), s(a / 1000)], ok: 0,
    porque: ["", `Se divide entre 100, no entre 10: ${s(a)} : 100 = ${s(v)}.`, `Falta dividir entre 100: ${s(a)} : 100 = ${s(v)}.`, `Has dividido entre 1000: ${s(a)} : 100 = ${s(v)}.`],
    ayuda: `${s(a)} % = ${s(a)} : 100 = ${s(v)}.`, res: [`El ${s(a)} % es ${s(a)}/100.`, `${s(a)} : 100 = ${s(v)}.`]}, r);
}

/* ---------- 5 y 6: aumentos y disminuciones ---------- */
const OBJ = ["una cámara", "un móvil", "una bici", "una sudadera", "un abrigo", "una tele", "un patinete", "un chándal", "una mochila", "un videojuego"];
function precio(r, d, a) {
  for (let n = 0; n < 100; n++) {
    const P = d === 1 ? 20 * r.int(1, 25) : d === 2 ? 5 * r.int(4, 100) : r.int(12, 900);
    if (dec2(P * a / 100)) return P;
  }
  return 100;
}
const SUBE = [
  ["El precio sin IVA de {obj} es {P} €. Si el IVA es del {a} %, ¿cuánto hay que pagar?", "€", "IVA"],
  ["{Obj} costaba {P} €, pero ha subido un {a} %. ¿Cuál es el precio nuevo?", "€", ""],
  ["{Obj} cuesta {P} €, pero si la quieres en otro color sube un {a} %. ¿Cuánto cuesta en ese color?", "€", ""],
  ["Un artículo costaba {P} € pero, por su éxito, el precio ha aumentado un {a} %. ¿Cuál es el precio definitivo?", "€", ""]
];
const BAJA = [
  ["{Obj} cuesta {P} € y en rebajas tiene un {a} % de descuento. ¿Cuánto se paga?", "€"],
  ["Al comprar un traje que costaba {P} € me rebajan un {a} %. ¿Cuánto pagaré?", "€"],
  ["Un coche que costaba {P} € ha bajado un {a} %. ¿Cuánto cuesta ahora?", "€"],
  ["A {N} le daban {P} € de paga al mes, pero se la han bajado un {a} %. ¿Cuánto le darán ahora?", "€"]
];
const may = t => t[0].toUpperCase() + t.slice(1);
function variacion(r, d, sube, k) {
  const a = sube && r.si(.4) ? r.pick(d === 1 ? [10, 21] : [21, 10, 4]) : r.pick(d === 1 ? [10, 20, 25, 50] : d === 2 ? [5, 15, 30, 40, 12] : [16, 35, 8, 22, 45, 7]);
  const P = precio(r, d, a), inc = r2(P * a / 100), sol = r2(sube ? P + inc : P - inc), m = r2(1 + (sube ? a : -a) / 100), obj = r.pick(OBJ);
  const [t, ud] = sube ? r.pick(SUBE.filter(x => (a === 21 || a === 10 || a === 4) === (x[2] === "IVA") || x[2] === "")) : r.pick(BAJA);
  const expr = tpl(t, {obj, Obj: may(obj), P: s(P), a: s(a), N: r.pick(NOM)}), mas = sube ? "+" : "−", verbo = sube ? "sube" : "te rebajan";
  return prob({expr, sol, ud, ayuda: `${may(verbo)} el ${s(a)} % de ${s(P)} = ${s(inc)} €. ${s(P)} ${mas} ${s(inc)} = ${s(sol)} €. (O: ${s(P)} · ${s(m)}.)`,
    pistas: [`Primero calcula cuánto ${verbo}: el ${s(a)} % de ${s(P)}.`, `El ${s(a)} % de ${s(P)} = ${s(a)} · ${s(P)} : 100 = ${s(inc)} €.`, `Ahora ${sube ? "súmalo a" : "réstalo de"} ${s(P)}. (Más rápido: ${s(P)} · ${s(m)}.)`],
    res: [`Método 1: el ${s(a)} % de ${s(P)} = ${s(a)} · ${s(P)} : 100 = ${s(inc)} €.`, `${s(P)} ${mas} ${s(inc)} = ${s(sol)} €.`, `Método 2: 100 % ${mas} ${s(a)} % = ${s(100 + (sube ? a : -a))} % → ${s(P)} · ${s(m)} = ${s(sol)} €.`],
    trampas: [{v: inc, por: `Eso es solo lo que ${verbo}. Ahora ${sube ? "súmalo al" : "réstalo del"} precio: ${s(P)} ${mas} ${s(inc)}.`}, {v: sube ? P - inc : P + inc, por: sube ? "Has restado, pero es una subida: se suma." : "Has sumado, pero es un descuento: se resta."}, {v: sube ? P + a : P - a, por: `Has ${sube ? "sumado" : "restado"} ${s(a)} €, pero es un ${s(a)} %: primero calcula cuánto es en euros.`}],
    guia: [{tipo: "num", pide: `¿Cuánto ${verbo}? (el ${s(a)} % de ${s(P)})`, sol: inc, ud: "€", porque: `${s(a)} · ${s(P)} : 100 = ${s(inc)}.`}, {tipo: "opc", pide: `¿Ahora sumo o resto ${s(inc)}?`, opciones: ["Sumo", "Resto"], ok: sube ? 0 : 1, porque: sube ? ["", "Es una subida: el precio se hace más grande, se suma."] : ["Es un descuento: el precio baja, se resta.", ""]}, {tipo: "num", pide: "¿Cuál es el precio final?", sol, ud: "€", porque: `${s(P)} ${mas} ${s(inc)} = ${s(sol)}.`}]});
}
function indice(r, d, sube) {
  const a = r.pick(PCT[d - 1].filter(x => sube || x < 100)), m = r2(1 + (sube ? a : -a) / 100);
  if (d === 3 && r.si(.5)) return calc({enun: sube ? "¿Qué porcentaje se ha subido?" : "¿Qué porcentaje se ha rebajado?", expr: `Multiplicar por ${s(m)} es ${sube ? "subir" : "rebajar"} un ▢ %`, sol: a, ud: "%",
    ayuda: sube ? `${s(m)} = 1 + ${s(a / 100)} → sube un ${s(a)} %.` : `${s(m)} = 1 − ${s(a / 100)} → baja un ${s(a)} %.`, pistas: [`${s(m)} es el ${s(m * 100)} %.`, sube ? `${s(m * 100)} % − 100 % = ?` : `100 % − ${s(m * 100)} % = ?`],
    res: [`Multiplicar por ${s(m)} es quedarse con el ${s(m * 100)} %.`, sube ? `${s(m * 100)} − 100 = ${s(a)} % de subida.` : `100 − ${s(m * 100)} = ${s(a)} % de rebaja.`], trampas: [{v: m * 100, por: `Ese es el % final. ${sube ? "Réstale 100" : "Réstalo de 100"} para saber cuánto ${sube ? "sube" : "baja"}.`}]});
  return calc({enun: sube ? `Para aumentar una cantidad un ${s(a)} %, ¿por qué número se multiplica?` : `Para rebajar una cantidad un ${s(a)} %, ¿por qué número se multiplica?`, expr: "", sol: m,
    ayuda: `100 % ${sube ? "+" : "−"} ${s(a)} % = ${s(100 + (sube ? a : -a))} % → ${s(m)}.`, pistas: [`Al final te quedas con el 100 % ${sube ? "+" : "−"} ${s(a)} %.`, `${s(100 + (sube ? a : -a))} % = ${s(100 + (sube ? a : -a))} : 100.`],
    res: [`100 % ${sube ? "+" : "−"} ${s(a)} % = ${s(100 + (sube ? a : -a))} %.`, `${s(100 + (sube ? a : -a))} : 100 = ${s(m)}. Se multiplica por ${s(m)}.`],
    trampas: [{v: a / 100, por: `Con ${s(a / 100)} sacas solo ${sube ? "el aumento" : "el descuento"}. Para el precio final: 1 ${sube ? "+" : "−"} ${s(a / 100)} = ${s(m)}.`}, {v: r2(1 + (sube ? -a : a) / 100), por: sube ? "Ese es el número para una rebaja. Para subir: 1 + …" : "Ese es el número para una subida. Para rebajar: 1 − …"}, {v: 100 + (sube ? a : -a), por: `Ese es el %. Divídelo entre 100: ${s(m)}.`}]});
}
function original(r, d, sube) {
  for (let n = 0; n < 200; n++) {
    const a = sube && r.si(.4) ? r.pick([21, 10]) : r.pick(d === 1 ? [10, 20, 25, 50] : d === 2 ? [5, 15, 30, 40] : [16, 35, 12, 8, 45]);
    const O = d === 1 ? 20 * r.int(1, 20) : d === 2 ? 10 * r.int(2, 60) : r.int(15, 600), m = 1 + (sube ? a : -a) / 100, F = r2(O * m);
    if (!dec2(O * m)) continue;
    const expr = sube ? (a === 21 || a === 10 ? `El precio de un producto con un ${s(a)} % de IVA es ${s(F)} €. ¿Cuál era el precio sin IVA?` : `Después de subir un ${s(a)} %, un abono cuesta ${s(F)} €. ¿Cuánto costaba antes de la subida?`)
      : `El precio de ${r.pick(OBJ)} rebajado un ${s(a)} % es ${s(F)} €. ¿Cuál era el precio antes de la rebaja?`;
    const pf = 100 + (sube ? a : -a);
    return prob({expr, sol: O, ud: "€", ayuda: `${s(F)} € es el ${s(pf)} % del precio de antes. Antes = ${s(F)} · 100 : ${s(pf)} = ${s(O)} €.`,
      pistas: [`El precio final no es el 100 %: es el ${s(pf)} % del de antes.`, `Regla de tres: ${s(pf)} % → ${s(F)} €; 100 % → x.`, `x = ${s(F)} · 100 : ${s(pf)}. (O ${s(F)} : ${s(m)}.)`],
      res: [`Precio final = ${s(pf)} % del precio de antes.`, `${s(pf)} % → ${s(F)} € y 100 % → x.`, `x = ${s(F)} · 100 : ${s(pf)} = ${s(O)} €.`],
      trampas: [{v: sube ? F - F * a / 100 : F + F * a / 100, por: `No vale ${sube ? "restar" : "sumar"} el ${s(a)} % al precio final, porque ese ${s(a)} % era del precio de antes, no del de ahora. Divide entre ${s(m)}.`}, {v: F * m, por: `Has multiplicado por ${s(m)}; para volver atrás se divide.`}],
      guia: [{tipo: "opc", pide: `${s(F)} € es…`, opciones: ["El 100 % (el precio de antes)", `El ${s(pf)} % del precio de antes`], ok: 1, porque: [`No: ${s(F)} € es el precio después de ${sube ? "subir" : "rebajar"}. El de antes es el que buscas.`, ""]}, {tipo: "num", pide: `¿Qué % del precio de antes son esos ${s(F)} €?`, sol: pf, ud: "%", porque: `100 % ${sube ? "+" : "−"} ${s(a)} % = ${s(pf)} %.`}, {tipo: "num", pide: "¿Y el 100 % (el precio de antes)?", sol: O, ud: "€", porque: `${s(F)} · 100 : ${s(pf)} = ${s(O)}.`}]});
  }
}
function quePctVar(r, d, sube) {
  for (let n = 0; n < 200; n++) {
    const A = r.pick([20, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 800]) * (d === 3 ? r.int(1, 3) : 1), a = r.pick(d === 1 ? [10, 20, 25, 50] : d === 2 ? [5, 15, 30, 40, 60] : [12, 35, 45, 8, 16]);
    const dlt = A * a / 100; if (!Number.isInteger(dlt)) continue;
    const B = sube ? A + dlt : A - dlt;
    const ctx = sube ? r.pick([`Un embalse ha pasado de tener ${s(A)} hm³ a tener ${s(B)} hm³. ¿Qué porcentaje ha subido?`, `Un artículo costaba ${s(A)} € y ahora cuesta ${s(B)} €. ¿Qué porcentaje ha subido?`, `El coste de un artículo era de ${s(A)} €. Si lo han subido ${s(dlt)} €, ¿qué porcentaje ha supuesto la subida?`, `Un depósito ha pasado de tener ${s(A)} kg a tener ${s(B)} kg. ¿Qué porcentaje ha aumentado?`])
      : r.pick([`Unos zapatos que costaban ${s(A)} € ahora cuestan ${s(B)} €. ¿Qué porcentaje los han rebajado?`, `Una ciudad tenía ${s(A)} parados y ahora tiene ${s(B)}. ¿En qué porcentaje ha bajado el paro?`, `${may(r.pick(OBJ))} costaba ${s(A)} €. Si me descuentan ${s(dlt)} €, ¿qué porcentaje de descuento es?`]);
    return prob({expr: ctx, sol: a, ud: "%", ayuda: `${sube ? "Ha subido" : "Ha bajado"} ${s(dlt)}. ${s(dlt)} · 100 : ${s(A)} = ${s(a)} %.`,
      pistas: [`Calcula cuánto ha ${sube ? "subido" : "bajado"}: ${s(Math.max(A, B))} − ${s(Math.min(A, B))}.`, `El 100 % es lo que había al principio: ${s(A)}.`, `${s(dlt)} · 100 : ${s(A)} = ?`],
      res: [`${sube ? "Subida" : "Bajada"}: ${s(Math.max(A, B))} − ${s(Math.min(A, B))} = ${s(dlt)}.`, `${s(A)} → 100 % y ${s(dlt)} → x.`, `x = ${s(dlt)} · 100 : ${s(A)} = ${s(a)} %.`],
      trampas: [{v: dlt * 100 / B, por: `Has dividido entre ${s(B)} (lo de después). El 100 % es lo que había al principio: ${s(A)}.`}, {v: B * 100 / A, por: `Ese es el % final respecto al principio. ${sube ? "Réstale 100" : "Réstalo de 100"}.`}, {v: dlt, por: `${s(dlt)} es lo que ha cambiado, pero no en %. Pásalo a %: ${s(dlt)} · 100 : ${s(A)}.`}],
      guia: [{tipo: "num", pide: `¿Cuánto ha ${sube ? "subido" : "bajado"}?`, sol: dlt, porque: `${s(Math.max(A, B))} − ${s(Math.min(A, B))} = ${s(dlt)}.`}, {tipo: "opc", pide: "¿Qué cantidad es el 100 %?", opciones: [s(A), s(B)], ok: 0, porque: ["", `El 100 % es lo que había al principio, ${s(A)}.`]}, {tipo: "num", pide: `¿Qué % es ${s(dlt)} de ${s(A)}?`, sol: a, ud: "%", porque: `${s(dlt)} · 100 : ${s(A)} = ${s(a)}.`}]});
  }
}
function encadenadas(r, d) {
  for (let n = 0; n < 200; n++) {
    const a = r.pick([10, 20, 25, 30, 15]), b = r.pick([10, 20, 5, 50, 25]), P = d === 2 ? 20 * r.int(2, 30) : 4 * r.int(5, 150);
    const p1 = r2(P * (1 - a / 100)), sol = r2(p1 * (1 - b / 100));
    if (!dec2(P * (1 - a / 100)) || !dec2(p1 * (1 - b / 100))) continue;
    const obj = r.pick(OBJ);
    return prob({expr: `${may(obj)} cuesta ${s(P)} €. En las primeras rebajas tiene un ${s(a)} % de descuento y en las segundas, otro ${s(b)} % sobre el último precio. ¿Cuánto cuesta después de las segundas rebajas?`, sol, ud: "€",
      ayuda: `Primero ${s(P)} · ${s(1 - a / 100)} = ${s(p1)} €. Luego ${s(p1)} · ${s(1 - b / 100)} = ${s(sol)} €. No es un ${s(a + b)} %.`,
      pistas: ["Los descuentos se hacen uno detrás de otro: el segundo, sobre el precio ya rebajado.", `Después de la primera rebaja: ${s(P)} · ${s(1 - a / 100)} = ${s(p1)} €.`, `Ahora rebaja un ${s(b)} % a ${s(p1)}: ${s(p1)} · ${s(1 - b / 100)}.`],
      res: [`Primera rebaja: ${s(P)} · ${s(1 - a / 100)} = ${s(p1)} €.`, `Segunda rebaja, sobre ${s(p1)}: ${s(p1)} · ${s(1 - b / 100)} = ${s(sol)} €.`, `(Todo junto: ${s(P)} · ${s(1 - a / 100)} · ${s(1 - b / 100)}.)`],
      trampas: [{v: P * (1 - (a + b) / 100), por: `Un ${s(a)} % y luego un ${s(b)} % no es un ${s(a + b)} %: el segundo descuento se hace sobre el precio ya rebajado (${s(p1)} €), que es más pequeño.`}, {v: p1, por: `Ese es el precio después de la primera rebaja. Falta la segunda: el ${s(b)} % de ${s(p1)}.`}],
      guia: [{tipo: "num", pide: `Precio después de la primera rebaja (−${s(a)} %)`, sol: p1, ud: "€", porque: `${s(P)} · ${s(1 - a / 100)} = ${s(p1)}.`}, {tipo: "opc", pide: `La segunda rebaja del ${s(b)} %, ¿sobre qué precio se hace?`, opciones: [`Sobre ${s(p1)} € (el ya rebajado)`, `Sobre ${s(P)} € (el de antes)`], ok: 0, porque: ["", `El enunciado dice «sobre el último precio»: el de ${s(p1)} €.`]}, {tipo: "num", pide: "Precio final", sol, ud: "€", porque: `${s(p1)} · ${s(1 - b / 100)} = ${s(sol)}.`}]});
  }
}
function ivaDescuento(r, d) {
  for (let n = 0; n < 200; n++) {
    const a = r.pick([21, 10, 16]), b = r.pick([5, 10, 15, 20]), P = r.pick([50, 100, 150, 200, 250, 300, 400, 500, 120, 80]);
    const p1 = r2(P * (1 + a / 100)), sol = r2(p1 * (1 - b / 100));
    if (!dec2(P * (1 + a / 100)) || !dec2(p1 * (1 - b / 100))) continue;
    return prob({expr: `Al comprar un mueble de ${s(P)} € me añaden el ${s(a)} % de IVA y, después, me rebajan un ${s(b)} % por montarlo yo. ¿Cuánto tengo que pagar?`, sol, ud: "€",
      ayuda: `Con IVA: ${s(P)} · ${s(1 + a / 100)} = ${s(p1)}. Con el descuento: ${s(p1)} · ${s(1 - b / 100)} = ${s(sol)} €.`,
      pistas: ["Primero el IVA (sube) y después el descuento (baja), sobre el precio con IVA.", `Con IVA: ${s(P)} · ${s(1 + a / 100)} = ${s(p1)} €.`, `Ahora quita el ${s(b)} % a ${s(p1)}: multiplica por ${s(1 - b / 100)}.`],
      res: [`Con IVA: ${s(P)} · ${s(1 + a / 100)} = ${s(p1)} €.`, `Con el descuento: ${s(p1)} · ${s(1 - b / 100)} = ${s(sol)} €.`],
      trampas: [{v: P * (1 + (a - b) / 100), por: `No se pueden juntar los porcentajes (${s(a)} − ${s(b)}): el descuento se hace sobre el precio con IVA.`}, {v: p1, por: "Ese es el precio con IVA. Falta el descuento."}],
      guia: [{tipo: "num", pide: "Precio con IVA", sol: p1, ud: "€", porque: `${s(P)} · ${s(1 + a / 100)} = ${s(p1)}.`}, {tipo: "num", pide: `Precio con el descuento del ${s(b)} %`, sol, ud: "€", porque: `${s(p1)} · ${s(1 - b / 100)} = ${s(sol)}.`}]});
  }
}

/* ---------- 7: interés simple ---------- */
function interes(r, d) {
  const C = r.pick(d === 1 ? [1000, 2000, 3000, 5000, 10000] : d === 2 ? [1500, 2500, 4000, 6000, 8000, 9000, 12000] : [750, 1250, 3500, 7500, 15000, 200000]);
  const rr = r.pick(d === 1 ? [1, 2, 3, 4, 5, 10] : d === 2 ? [2, 3, 4, 5, 6, 7, 8] : [1.5, 2.5, 3.5, 4, 6, 7]), t = r.int(1, d === 1 ? 3 : d === 2 ? 6 : 10);
  const I1 = r2(C * rr / 100), I = r2(C * rr * t / 100);
  return {C, rr, t, I1, I};
}
const INT_CTX = ["Ingreso {C} € en el banco al {r} % de interés simple anual durante {t} años.", "Meto {C} € en una cuenta que da un {r} % de interés simple anual y los dejo {t} años.", "Un banco me paga un {r} % de interés simple anual por {C} € durante {t} años."];
function probInteres(r, d, k) {
  const X = interes(r, d), {C, rr, t, I1, I} = X, base = tpl(r.pick(INT_CTX), {C: s(C), r: s(rr), t});
  const pist = [`El interés de 1 año es el ${s(rr)} % de ${s(C)}.`, `Un año: ${s(C)} · ${s(rr)} : 100 = ${s(I1)} €.`, `En ${t} años: ${s(I1)} · ${t}.`];
  const res = [`Interés de 1 año: ${s(C)} · ${s(rr)} : 100 = ${s(I1)} €.`, `En ${t} años: ${s(I1)} · ${t} = ${s(I)} €. (Fórmula: I = C · r · t : 100.)`];
  if (k === 0) return prob({expr: base + " ¿Cuántos € de intereses recibo?", sol: I, ud: "€", ayuda: `I = ${s(C)} · ${s(rr)} · ${t} : 100 = ${s(I)} €.`, pistas: pist, res,
    trampas: [{v: I1, por: `Ese es el interés de un solo año. Multiplícalo por ${t}.`}, {v: C + I, por: "Eso es todo el dinero al final. Te preguntan solo los intereses."}, {v: C * rr * t, por: "Te falta dividir entre 100."}],
    guia: [{tipo: "num", pide: "¿Cuánto dan en 1 año?", sol: I1, ud: "€", porque: `${s(C)} · ${s(rr)} : 100 = ${s(I1)}.`}, {tipo: "num", pide: `¿Y en ${t} años?`, sol: I, ud: "€", porque: `${s(I1)} · ${t} = ${s(I)}.`}]});
  if (k === 1) return prob({expr: base + " ¿Cuánto dinero tendré en total al final?", sol: r2(C + I), ud: "€", ayuda: `Intereses: ${s(I)} €. Total: ${s(C)} + ${s(I)} = ${s(C + I)} €.`, pistas: [...pist, `Súmale los intereses a ${s(C)}.`], res: [...res, `Total: ${s(C)} + ${s(I)} = ${s(C + I)} €.`],
    trampas: [{v: I, por: `Eso son solo los intereses. Súmalos a los ${s(C)} € que metiste.`}, {v: C + I1, por: `Has sumado el interés de un año. Son ${t} años.`}],
    guia: [{tipo: "num", pide: `¿Cuántos intereses dan en ${t} años?`, sol: I, ud: "€", porque: `${s(C)} · ${s(rr)} · ${t} : 100 = ${s(I)}.`}, {tipo: "num", pide: "¿Cuánto dinero hay al final?", sol: r2(C + I), ud: "€", porque: `${s(C)} + ${s(I)} = ${s(C + I)}.`}]});
  if (k === 2) return prob({expr: `¿Qué dinero tenía en el banco si me han dado ${s(I)} € de intereses en ${t} años con un interés simple del ${s(rr)} % anual?`, sol: C, ud: "€",
    ayuda: `Un año dan ${s(I)} : ${t} = ${s(I1)} €, que es el ${s(rr)} % del capital. Capital = ${s(I1)} · 100 : ${s(rr)} = ${s(C)} €.`,
    pistas: [`Primero, los intereses de 1 año: ${s(I)} : ${t}.`, `${s(I1)} € es el ${s(rr)} % del dinero que tenía.`, `Busca el 100 %: ${s(I1)} · 100 : ${s(rr)}.`],
    res: [`Intereses de 1 año: ${s(I)} : ${t} = ${s(I1)} €.`, `${s(rr)} % → ${s(I1)} € y 100 % → C.`, `C = ${s(I1)} · 100 : ${s(rr)} = ${s(C)} €.`],
    trampas: [{v: I * rr / 100, por: `Has calculado el ${s(rr)} % de los intereses. Al revés: los intereses son el ${s(rr)} % del capital (cada año).`}, {v: I * 100 / rr, por: `Te falta dividir entre los ${t} años.`}],
    guia: [{tipo: "num", pide: "¿Cuántos intereses dan cada año?", sol: I1, ud: "€", porque: `${s(I)} : ${t} = ${s(I1)}.`}, {tipo: "num", pide: `Si ${s(I1)} € es el ${s(rr)} %, ¿cuál es el capital (el 100 %)?`, sol: C, ud: "€", porque: `${s(I1)} · 100 : ${s(rr)} = ${s(C)}.`}]});
  if (r.si(.5)) return prob({expr: `Meto ${s(C)} € al ${s(rr)} % de interés simple anual. ¿Cuántos años tienen que pasar para ganar ${s(I)} € de intereses?`, sol: t, ud: "años",
    ayuda: `Cada año dan ${s(I1)} €. ${s(I)} : ${s(I1)} = ${t} años.`, pistas: [`Calcula los intereses de un año: el ${s(rr)} % de ${s(C)}.`, `Un año: ${s(I1)} €. ¿Cuántas veces cabe en ${s(I)}?`],
    res: [`Un año: ${s(C)} · ${s(rr)} : 100 = ${s(I1)} €.`, `${s(I)} : ${s(I1)} = ${t} años.`], trampas: [{v: I1, por: `Eso es lo que dan en un año. Divide ${s(I)} entre eso.`}]});
  return prob({expr: `Meto ${s(C)} € durante ${t} ${t === 1 ? "año" : "años"} y me dan ${s(I)} € de intereses. ¿Qué % de interés simple anual me dan?`, sol: rr, ud: "%",
    ayuda: `Un año: ${s(I)} : ${t} = ${s(I1)} €. ${s(I1)} · 100 : ${s(C)} = ${s(rr)} %.`, pistas: [`Primero, los intereses de 1 año: ${s(I)} : ${t}.`, `¿Qué % es ${s(I1)} de ${s(C)}?`],
    res: [`Un año: ${s(I)} : ${t} = ${s(I1)} €.`, `${s(I1)} · 100 : ${s(C)} = ${s(rr)} %.`], trampas: [{v: I * 100 / C, por: `Ese es el % de todos los años juntos. Divídelo entre ${t}.`}]});
}

/* ---------- 8: repartos ---------- */
const REP = [
  {t: "{N1}, {N2} y {N3} compran lotería: {N1} pone {a} €, {N2} pone {b} € y {N3} pone {c} €. Les toca un premio de {T} € y lo reparten según lo que puso cada uno. ¿Cuánto le toca a {Nx}?", ud: "€", parte: "€ puestos"},
  {t: "{N1}, {N2} y {N3} cobran {T} € por un trabajo. {N1} trabajó {a} horas, {N2} {b} horas y {N3} {c} horas. Si se reparten el dinero según las horas, ¿cuánto cobra {Nx}?", ud: "€", parte: "horas"},
  {t: "{N1}, {N2} y {N3} se comen una pizza de {S} porciones: {N1} {a}, {N2} {b} y {N3} {c}. La cuenta es de {T} €. Si cada uno paga lo que ha comido, ¿cuánto paga {Nx}?", ud: "€", parte: "porciones", pizza: true},
  {t: "Una herencia de {T} € se reparte entre tres hermanos de forma proporcional a sus edades: {a}, {b} y {c} años. ¿Cuánto recibe el de {ax} años?", ud: "€", parte: "años", edad: true},
  {t: "{N1} invierte {a} €, {N2} {b} € y {N3} {c} € en un negocio. Ganan {T} € y los reparten según lo que invirtió cada uno. ¿Cuánto le toca a {Nx}?", ud: "€", parte: "€ invertidos", mil: true}
];
function reparto(r, d, c) {
  c ||= r.pick(REP);
  for (let n = 0; n < 200; n++) {
    let a, b, cc;
    if (c.pizza) { a = r.int(1, 4); b = r.int(1, 4); cc = 8 - a - b; if (cc < 1) continue; }
    else if (c.edad) { a = r.int(10, 40); b = r.int(10, 40); cc = r.int(10, 40); }
    else if (c.mil) { a = 1000 * r.int(1, 6); b = 1000 * r.int(1, 6); cc = 1000 * r.int(1, 6); }
    else { a = r.int(1, d === 1 ? 6 : 9); b = r.int(1, d === 1 ? 6 : 9); cc = r.int(1, d === 1 ? 6 : 9); }
    if (a === b || b === cc || a === cc) continue;
    const S = a + b + cc, v = c.mil ? r.pick([0.1, 0.2, 0.25, 0.5]) : c.edad ? r.pick([100, 250, 500, 1000]) : r.pick(d === 1 ? [2, 3, 5, 10, 20] : d === 2 ? [1.5, 2.5, 4, 6, 12, 25] : [1.25, 1.75, 3.5, 7.5, 15]);
    const T = r2(S * v), i = r.int(0, 2), ax = [a, b, cc][i], sol = r2(ax * v);
    if (!dec2(T) || !dec2(sol)) continue;
    const ns = r.mez(NOM).slice(0, 3);
    return {c, a, b, cc, S, v, T, i, ax, sol, ns, Nx: ns[i]};
  }
}
function probReparto(r, d, c, dos) {
  if (dos) {
    for (let n = 0; n < 100; n++) {
      const a = r.int(2, 9), b = r.int(2, 9); if (a === b) continue;
      const v = r.pick(d === 1 ? [5, 10, 20, 25] : [12, 15, 7.5, 40]), T = r2((a + b) * v), pri = r.si(.5), sol = r2((pri ? a : b) * v);
      return prob({expr: `Dos carpinteros cobran ${s(T)} € por un trabajo. El primero trabajó ${a} horas y el segundo ${b} horas. Si se reparten el dinero según las horas, ¿cuánto cobra el ${pri ? "primero" : "segundo"}?`, sol, ud: "€",
        ayuda: `En total, ${a + b} horas. 1 hora: ${s(T)} : ${a + b} = ${s(v)} €. ${pri ? a : b} · ${s(v)} = ${s(sol)} €.`,
        pistas: ["Cuenta cuántas horas trabajaron entre los dos.", `Cada hora vale ${s(T)} : ${a + b}.`, `1 hora = ${s(v)} €. Multiplícalo por ${pri ? a : b}.`],
        res: [`Total de horas: ${a} + ${b} = ${a + b}.`, `1 hora → ${s(T)} : ${a + b} = ${s(v)} €.`, `El ${pri ? "primero" : "segundo"}: ${pri ? a : b} · ${s(v)} = ${s(sol)} €.`],
        trampas: [{v: T / 2, por: "Eso sería a partes iguales. Quien trabajó más horas cobra más."}, {v: v, por: `Eso es lo que vale 1 hora. Multiplícalo por ${pri ? a : b}.`}],
        guia: [{tipo: "num", pide: "¿Cuántas horas hay en total?", sol: a + b, porque: `${a} + ${b} = ${a + b}.`}, {tipo: "num", pide: "¿Cuánto vale 1 hora?", sol: v, ud: "€", porque: `${s(T)} : ${a + b} = ${s(v)}.`}, {tipo: "num", pide: `¿Cuánto cobra el ${pri ? "primero" : "segundo"}?`, sol, ud: "€", porque: `${pri ? a : b} · ${s(v)} = ${s(sol)}.`}]});
    }
  }
  const X = reparto(r, d, c), {a, b, cc, S, v, T, ax, sol, ns, Nx} = X, C = X.c;
  const o = {N1: ns[0], N2: ns[1], N3: ns[2], Nx, a: s(a), b: s(b), c: s(cc), T: s(T), S: s(S), ax: s(ax)}, quien = C.edad ? `el de ${s(ax)} años` : Nx;
  return prob({expr: tpl(C.t, o), sol, ud: C.ud, ayuda: `Partes en total: ${s(a)} + ${s(b)} + ${s(cc)} = ${s(S)}. Cada parte: ${s(T)} : ${s(S)} = ${s(v)}. ${may(quien)}: ${s(ax)} · ${s(v)} = ${s(sol)} €.`,
    pistas: [`Es un reparto proporcional: a quien tiene más ${C.parte}, más le toca. Suma todas las partes.`, `Partes en total: ${s(S)}. Cada parte vale ${s(T)} : ${s(S)}.`, `Cada parte vale ${s(v)} €. ${may(quien)} tiene ${s(ax)} partes.`],
    res: [`Partes en total: ${s(a)} + ${s(b)} + ${s(cc)} = ${s(S)}.`, `Una parte: ${s(T)} : ${s(S)} = ${s(v)} €.`, `${may(quien)}: ${s(ax)} · ${s(v)} = ${s(sol)} €.`],
    trampas: [{v: T / 3, por: "Eso sería a partes iguales. En un reparto proporcional, a quien pone (o tiene) más, le toca más."}, {v, por: `Eso es lo que vale una parte. Multiplícalo por las ${s(ax)} partes de ${quien}.`}, {v: T * ax, por: `Te falta dividir entre el total de partes (${s(S)}).`}],
    guia: [{tipo: "num", pide: "¿Cuántas partes hay en total?", sol: S, porque: `${s(a)} + ${s(b)} + ${s(cc)} = ${s(S)}.`}, {tipo: "num", pide: "¿Cuánto vale una parte?", sol: v, ud: "€", porque: `${s(T)} : ${s(S)} = ${s(v)}.`}, {tipo: "num", pide: `¿Cuánto le toca a ${quien}?`, sol, ud: "€", porque: `${s(ax)} · ${s(v)} = ${s(sol)}.`}]});
}
function partes(r, d) {
  const X = reparto(r, d, REP[0]), {a, b, cc, S, v, T} = X;
  return calc({enun: "Reparte en partes directamente proporcionales", expr: `${s(T)} en partes proporcionales a ${s(a)}, ${s(b)} y ${s(cc)}. ¿Cuánto vale cada parte (lo que corresponde a 1)?`, sol: v,
    ayuda: `${s(T)} : (${s(a)} + ${s(b)} + ${s(cc)}) = ${s(T)} : ${s(S)} = ${s(v)}.`, pistas: ["Suma las partes.", `${s(a)} + ${s(b)} + ${s(cc)} = ${s(S)}. Divide ${s(T)} entre ${s(S)}.`],
    res: [`Partes: ${s(a)} + ${s(b)} + ${s(cc)} = ${s(S)}.`, `Cada parte: ${s(T)} : ${s(S)} = ${s(v)}.`], trampas: [{v: T / 3, por: "Has dividido entre 3 personas, pero hay que dividir entre el total de partes."}]});
}

/* ---------- los apartados ---------- */
const AP = {};
AP[1] = [(r, d) => identificar(r, d, true), probDirecta, tablaDirecta, unidadDirecta];
AP[1].pesos = [[3, 3, 2, 3], [2, 4, 3, 2], [1, 5, 3, 1]];
AP[2] = [(r, d) => identificar(r, d), probInversa, tablaInversa, unidadInversa, (r, d) => r.si(.5) ? probDirecta(r, d) : probInversa(r, d)];
AP[2].pesos = [[3, 3, 2, 3, 0], [2, 3, 2, 1, 3], [1, 3, 2, 0, 4]];
AP[3] = [idCompuesta, (r, d) => probCompuesta(r, d, "dd"), (r, d) => probCompuesta(r, d, r.si(.5) ? "dx" : "ii")];
AP[3].pesos = [[3, 4, 1], [2, 4, 3], [1, 3, 5]];
AP[4] = [pctDe, quePct, totalDe, restoPct, pctDecimal];
AP[4].pesos = [[5, 1, 0, 2, 2], [3, 2, 2, 3, 1], [2, 3, 3, 3, 1]];
AP[5] = [(r, d) => variacion(r, d, true), (r, d) => indice(r, d, true), (r, d) => original(r, d, true), (r, d) => quePctVar(r, d, true)];
AP[5].pesos = [[5, 3, 0, 1], [3, 2, 2, 2], [2, 1, 3, 3]];
AP[6] = [(r, d) => variacion(r, d, false), (r, d) => indice(r, d, false), (r, d) => original(r, d, false), (r, d) => quePctVar(r, d, false), encadenadas, ivaDescuento];
AP[6].pesos = [[5, 3, 0, 1, 0, 0], [3, 2, 2, 2, 2, 0], [2, 1, 2, 2, 3, 2]];
AP[7] = [(r, d) => probInteres(r, d, 0), (r, d) => probInteres(r, d, 1), (r, d) => probInteres(r, d, 2), (r, d) => probInteres(r, d, 3)];
AP[7].pesos = [[5, 3, 0, 0], [3, 3, 2, 1], [2, 2, 3, 3]];
AP[8] = [(r, d) => probReparto(r, d), (r, d) => partes(r, d), (r, d) => probReparto(r, d, null, true)];
AP[8].pesos = [[2, 3, 4], [4, 2, 2], [5, 1, 1]];

const HAB = {1: ["¿Son directamente proporcionales?", "Problemas de regla de tres directa", "Tablas de proporcionalidad directa", "Reducción a la unidad (directa)"],
  2: ["¿Directa, inversa o ninguna?", "Problemas de regla de tres inversa", "Tablas de proporcionalidad inversa", "Reducción a la unidad (inversa)", "Problemas mezclados: ¿directa o inversa?"],
  3: ["Ver si cada relación es directa o inversa", "Compuesta con dos directas", "Compuesta con alguna inversa"],
  4: ["Calcular el % de una cantidad", "¿Qué porcentaje es?", "Hallar el total a partir de una parte", "Lo que queda (el resto)", "El % como número decimal o fracción"],
  5: ["Precio después de una subida (IVA)", "Por qué número se multiplica (subida)", "Precio antes de la subida", "¿Qué % ha subido?"],
  6: ["Precio después de una rebaja", "Por qué número se multiplica (rebaja)", "Precio antes de la rebaja", "¿Qué % han rebajado?", "Rebajas seguidas", "IVA y descuento juntos"],
  7: ["Calcular los intereses", "Dinero total al final", "Calcular el capital", "Calcular el tiempo o el %"],
  8: ["¿Cuánto le toca a cada uno?", "Valor de una parte", "Reparto entre dos"]};
const NOMBRES = {1: "Proporcionalidad directa", 2: "Proporcionalidad inversa", 3: "Proporcionalidad compuesta", 4: "Porcentajes", 5: "Aumentos porcentuales", 6: "Disminuciones porcentuales", 7: "Interés simple", 8: "Repartos proporcionales"};
const ESTRAT = {1: "Directa: si una magnitud se hace el doble, la otra también. Reduce a la unidad (divide) y luego multiplica.", 2: "Inversa: si una se hace el doble, la otra la mitad. Para pasar a 1 se multiplica y luego se divide.",
  3: "Mira cada magnitud por separado: ¿directa o inversa con la que te preguntan? Luego reduce a la unidad.", 4: "El a % de b es a · b : 100. El total siempre es el 100 %.",
  5: "Subir un a % es quedarse con el (100 + a) %: multiplica por 1,a.", 6: "Rebajar un a % es quedarse con el (100 − a) %: multiplica por 0,(100 − a).", 7: "Interés de un año: capital · % : 100. Luego multiplica por los años.", 8: "Suma todas las partes, divide el total entre esa suma y multiplica por las partes de cada uno."};

function gen(ap, d, r, o = {}) {
  const lista = AP[ap]; if (!lista) return null;
  d = Math.max(1, Math.min(3, d | 0 || 1));
  for (let k = 0; k < 30; k++) {
    const w = lista.pesos[d - 1]; let x = r.f() * w.reduce((a, b) => a + b, 0), i = 0;
    while (x >= w[i]) { x -= w[i]; i++; }
    if (o.g !== undefined) i = o.g;
    const q = lista[i](r, d);
    if (!q) continue;
    q.ap = ap; q.d = d; q.g = i;
    return q;
  }
  const q0 = lista[1] ? lista[1](r, d) : lista[0](r, d); q0.ap = ap; q0.d = d; q0.g = lista[1] ? 1 : 0; return q0;
}
/* «No lo entiendo»: un ejercicio del mismo tipo con otros números, para verlo resuelto */
function gemelo(q, r) {
  r ||= Rn(Math.floor(Math.random() * 2 ** 31));
  for (let k = 0; k < 20; k++) { const x = gen(q.ap, q.d, r, {g: q.g}); if (x && x.res && (x.enun + x.expr) !== (q.enun + q.expr)) return x; }
  return null;
}
const pistas = q => q.pistas || [ESTRAT[q.ap] || "Lee bien el enunciado."];
const enunciado = q => q.prob ? q.expr : q.expr ? `${q.enun}: ${q.expr}` : q.enun;
const respuesta = q => q.tipo === "opc" ? q.opciones[q.ok] : conUd(q.sol, q.ud);
function malos(q, r, n = 3) {
  const out = [], ya = new Set([s(q.sol)]), poner = v => { v = r2(v); if (Number.isFinite(v) && v > 0 && !ya.has(s(v)) && out.length < n) { ya.add(s(v)); out.push(v); } };
  (q.trampas || []).forEach(x => poner(x.v));
  for (const f of r.mez([1.1, 0.9, 2, 0.5, 1.2, 0.8, 10, 0.1])) poner(q.sol * f);
  return out;
}
function test(q, r) {
  if (q.tipo === "opc") {
    let ops = q.opciones.map((t, i) => ({t, b: i === q.ok}));
    if (ops.length > 4) ops = [ops.find(x => x.b), ...ops.filter(x => !x.b).slice(0, 3)];
    if (ops.length > 2 && !q.opciones.includes("Directa")) ops = r.mez(ops);
    return [enunciado(q), ops.map(x => x.t), ops.findIndex(x => x.b)];
  }
  const v = r.mez([q.sol, ...malos(q, r)]);
  return [enunciado(q), v.map(x => conUd(x, q.ud)), v.findIndex(x => igual(x, q.sol))];
}
const SPEC = /^(p2)-([1-8]{1,8})-([123])-(\d{1,2})-(\d{1,10})$/;
function leerSpec(x) {
  const m = String(x || "").match(SPEC); if (!m) return null;
  return {tema: m[1], aps: [...new Set(m[2].split("").map(Number))].sort(), d: +m[3], n: Math.max(3, Math.min(30, +m[4])), seed: +m[5] % 2 ** 31};
}
const hacerSpec = o => `${o.tema || "p2"}-${[...new Set(o.aps)].sort().join("")}-${o.d}-${o.n}-${o.seed}`;
function serie(spec) {
  const o = typeof spec === "string" ? leerSpec(spec) : spec; if (!o) return null;
  const r = Rn(o.seed), q = [], vistos = new Set();
  for (let i = 0, k = 0; q.length < o.n && k < o.n * 20; k++) {
    const t = test(gen(o.aps[i % o.aps.length], o.d, r), r);
    if (vistos.has(t[0]) || t[0].length > 240 || t[1].some(x => x.length > 60)) continue;
    vistos.add(t[0]); q.push(t); i++;
  }
  const titulo = o.aps.length === 1 ? `Mates · ${NOMBRES[o.aps[0]]}` : o.aps.length === 8 ? "Mates · Proporcionalidad y porcentajes" : `Mates · Proporcionalidad (${o.aps.join(", ")})`;
  return {id: "mates", titulo, level: ["", "Fácil", "Medio", "Difícil"][o.d], q};
}

/* ---------- 🧩 Monta el problema: los datos a su sitio, el tipo, la operación y la respuesta ---------- */
const TIPOS = ["Directa", "Inversa", "Porcentaje", "Reparto"];
const porTipo = (bueno, rel) => ({
  Directa: bueno === "Directa" ? "" : bueno === "Inversa" ? `No es directa: ${rel}. Cuando una sube y la otra baja, es inversa.` : bueno === "Porcentaje" ? "Hay un %: es un problema de porcentajes." : "Hay que repartir una cantidad entre varios según lo que tiene cada uno: es un reparto.",
  Inversa: bueno === "Inversa" ? "" : bueno === "Directa" ? `No es inversa: ${rel}. Si las dos suben a la vez, es directa.` : bueno === "Porcentaje" ? "Hay un %: es un problema de porcentajes." : "Hay que repartir una cantidad entre varios: es un reparto.",
  Porcentaje: bueno === "Porcentaje" ? "" : "En el problema no aparece ningún %.",
  Reparto: bueno === "Reparto" ? "" : "No hay que repartir nada entre varias personas."});
function monta(r, d) {
  const tipos = d === 1 ? ["dir", "inv", "pct"] : ["dir", "inv", "rebaja", "subida", "pct", "rep"];
  const k = r.pick(tipos);
  if (k === "dir" || k === "inv") {
    const X = k === "dir" ? directa(r, d) : inversa(r, d), c = X.c, dir = k === "dir";
    const datos = [{id: "a", v: X.a, t: `${s(X.a)} ${c.A}`, es: `lo que ya sabes de «${c.ma.toLowerCase()}»`}, {id: "p", v: X.p, t: `${s(X.p)} ${c.B}`, es: `lo que ya sabes de «${c.mb.toLowerCase()}»`}, {id: "b", v: X.b, t: `${s(X.b)} ${c.A}`, es: `lo que te preguntan de «${c.ma.toLowerCase()}»`}];
    const bien = dir ? `${s(X.b)} · ${s(X.p)} : ${s(X.a)}` : `${s(X.a)} · ${s(X.p)} : ${s(X.b)}`, mal1 = dir ? `${s(X.a)} · ${s(X.p)} : ${s(X.b)}` : `${s(X.b)} · ${s(X.p)} : ${s(X.a)}`;
    return {texto: tpl(c.t, {a: s(X.a), b: s(X.b), p: s(X.p)}), datos, esquema: {k: "tabla", heads: [c.ma, c.mb], filas: [["a", "p"], ["b", "x"]], labs: ["Lo que sé", "Lo que me preguntan"]},
      tipo: dir ? "Directa" : "Inversa", porTipo: porTipo(dir ? "Directa" : "Inversa", c.rel),
      ops: r.mez([{t: `x = ${bien}`, ok: true}, {t: `x = ${mal1}`, por: dir ? `Así se hace la inversa. En la directa se multiplica en cruz: ${bien}.` : `Así se hace la directa. En la inversa se multiplica en línea: ${bien}.`}, {t: `x = ${s(X.a)} · ${s(X.b)} : ${s(X.p)}`, por: `Has mezclado las magnitudes: ${c.A} con ${c.A} y ${c.B} con ${c.B}. Mira la tabla.`}]),
      sol: X.sol, ud: c.B, res: dir ? [`Directa: ${c.rel}.`, `x = ${bien} = ${conUd(X.sol, c.B)}.`] : [`Inversa: ${c.rel}.`, `x = ${bien} = ${conUd(X.sol, c.B)}.`]};
  }
  if (k === "rebaja" || k === "subida") {
    const sube = k === "subida", a = r.pick(sube ? [10, 21, 15, 20] : [10, 15, 20, 25, 30]), P = precio(r, d, a), sol = r2(P * (1 + (sube ? a : -a) / 100)), obj = r.pick(OBJ);
    const texto = sube ? `${may(obj)} cuesta ${s(P)} € sin IVA. Con un IVA del ${s(a)} %, ¿cuánto cuesta?` : `${may(obj)} cuesta ${s(P)} € y tiene un ${s(a)} % de descuento. ¿Cuánto pagas?`;
    return {texto, datos: [{id: "P", v: P, t: `${s(P)} €`, es: "el precio de partida (el 100 %)"}, {id: "a", v: a, t: `${s(a)} %`, es: `el porcentaje que ${sube ? "sube" : "te rebajan"}`}],
      esquema: {k: "lista", slots: [{id: "P", lab: "Precio de partida (100 %)"}, {id: "a", lab: sube ? "% que sube" : "% de descuento"}]},
      tipo: "Porcentaje", porTipo: porTipo("Porcentaje", ""),
      ops: r.mez([{t: `${s(P)} · ${s(100 + (sube ? a : -a))} : 100`, ok: true}, {t: `${s(P)} · ${s(a)} : 100`, por: `Así sacas solo lo que ${sube ? "sube" : "te rebajan"}, no el precio final.`}, {t: `${s(P)} ${sube ? "+" : "−"} ${s(a)}`, por: `No se ${sube ? "suma" : "resta"} el ${s(a)} directamente: es un ${s(a)} %, no ${s(a)} €.`}]),
      sol, ud: "€", res: [`Te quedas con el 100 % ${sube ? "+" : "−"} ${s(a)} % = ${s(100 + (sube ? a : -a))} %.`, `${s(P)} · ${s(100 + (sube ? a : -a))} : 100 = ${s(sol)} €.`]};
  }
  if (k === "pct") {
    const a = r.pick(d === 1 ? [10, 20, 25, 50] : [15, 30, 40, 60, 75]), T = r.pick(TOT), sol = T * a / 100;
    if (!Number.isInteger(sol)) return monta(r, d);
    const [t, ud] = r.pick([["En un instituto hay {T} alumnos y el {a} % va en bici. ¿Cuántos alumnos van en bici?", "alumnos"], ["De un camino de {T} km ya llevo el {a} %. ¿Cuántos km llevo?", "km"], ["Un embalse de {T} hm³ está al {a} %. ¿Cuántos hm³ tiene?", "hm³"]]);
    return {texto: tpl(t, {T: s(T), a: s(a)}), datos: [{id: "P", v: T, t: s(T) + (ud === "alumnos" ? " alumnos" : " " + ud), es: "el total (el 100 %)"}, {id: "a", v: a, t: `${s(a)} %`, es: "el porcentaje que te piden"}],
      esquema: {k: "lista", slots: [{id: "P", lab: "Total (100 %)"}, {id: "a", lab: "Porcentaje"}]}, tipo: "Porcentaje", porTipo: porTipo("Porcentaje", ""),
      ops: r.mez([{t: `${s(a)} · ${s(T)} : 100`, ok: true}, {t: `${s(T)} : ${s(a)}`, por: `Dividir entre ${s(a)} no da el ${s(a)} %. Se multiplica por ${s(a)} y se divide entre 100.`}, {t: `${s(T)} · ${s(a)}`, por: "Te falta dividir entre 100."}]),
      sol, ud, res: [`El ${s(a)} % de ${s(T)} = ${s(a)} · ${s(T)} : 100 = ${s(sol)}.`]};
  }
  const X = reparto(r, d, r.pick([REP[0], REP[1], REP[2]])), C = X.c, ns = X.ns, o = {N1: ns[0], N2: ns[1], N3: ns[2], Nx: X.Nx, a: s(X.a), b: s(X.b), c: s(X.cc), T: s(X.T), S: s(X.S)};
  const ids = ["a", "b", "c"], partesN = [X.a, X.b, X.cc];
  return {texto: tpl(C.t, o), datos: [{id: "T", v: X.T, t: `${s(X.T)} €`, es: "el total que se reparte"}, ...ids.map((id, i) => ({id, v: partesN[i], t: `${s(partesN[i])} ${C.parte.split(" ")[0]}`, es: `las partes de ${ns[i]}`}))],
    esquema: {k: "lista", slots: [{id: "T", lab: "Total a repartir"}, ...ids.map((id, i) => ({id, lab: `Partes de ${ns[i]}`}))]}, tipo: "Reparto", porTipo: porTipo("Reparto", ""),
    ops: r.mez([{t: `${s(X.T)} : ${s(X.S)} · ${s(X.ax)}`, ok: true}, {t: `${s(X.T)} : 3`, por: "Eso es a partes iguales. En un reparto proporcional, a quien tiene más partes le toca más."}, {t: `${s(X.T)} · ${s(X.ax)}`, por: `Te falta dividir entre el total de partes (${s(X.a)} + ${s(X.b)} + ${s(X.cc)} = ${s(X.S)}).`}]),
    sol: X.sol, ud: "€", res: [`Partes: ${s(X.a)} + ${s(X.b)} + ${s(X.cc)} = ${s(X.S)}.`, `Una parte: ${s(X.T)} : ${s(X.S)} = ${s(X.v)} €.`, `${X.Nx}: ${s(X.ax)} · ${s(X.v)} = ${s(X.sol)} €.`]};
}

/* ---------- 🏷️ ¿Cuál es la mejor oferta? ---------- */
function oferta(r, d) {
  for (let n = 0; n < 300; n++) {
    const varias = d > 1 && r.si(.4);
    if (varias) {
      const P = r.pick([4, 5, 6, 8, 10, 12, 15, 20]), obj = r.pick(["botes de crema", "camisetas", "libretas", "botellas de zumo", "paquetes de galletas"]);
      const ofs = [{t: "3 × 2 (te llevas 3 y pagas 2)", f: 2 * P, c: `Pagas 2: 2 · ${s(P)} = ${s(2 * P)} €`}, {t: "30 % de descuento en todo", f: r2(3 * P * 0.7), c: `3 · ${s(P)} · 0,7 = ${s(3 * P * 0.7)} €`},
        {t: "La 2.ª unidad a mitad de precio", f: r2(2.5 * P), c: `${s(P)} + ${s(P / 2)} + ${s(P)} = ${s(2.5 * P)} €`}, {t: "40 % de descuento en todo", f: r2(3 * P * 0.6), c: `3 · ${s(P)} · 0,6 = ${s(3 * P * 0.6)} €`},
        {t: "10 % y luego otro 20 %", f: r2(3 * P * 0.9 * 0.8), c: `3 · ${s(P)} · 0,9 · 0,8 = ${s(3 * P * 0.72)} €`}, {t: "25 % de descuento en todo", f: r2(3 * P * 0.75), c: `3 · ${s(P)} · 0,75 = ${s(3 * P * 0.75)} €`}];
      const tres = r.mez(ofs).slice(0, 3), fs = tres.map(o => o.f);
      if (new Set(fs.map(s)).size < 3 || fs.some(f => !dec2(f))) continue;
      const min = Math.min(...fs), seg = fs.filter(f => f !== min).sort((a, b) => a - b)[0];
      if (seg - min < 0.3) continue;
      return {titulo: `Quieres comprar 3 ${obj}. Cada uno cuesta ${s(P)} €.`, ofertas: tres.map(o => ({t: o.t, final: o.f, calc: o.c})), mejor: fs.indexOf(min)};
    }
    const obj = r.pick(OBJ), base = d === 1 ? 10 * r.int(4, 20) : 5 * r.int(8, 60);
    const una = () => {
      const k = r.int(0, d === 1 ? 1 : 3), P = base + r.pick([-10, -5, 0, 5, 10, 15]) * (d === 1 ? 2 : 1);
      if (P <= 10) return null;
      if (k === 0) { const a = r.pick([10, 20, 25, 30, 40, 50]); return {t: `${s(P)} € con un ${s(a)} % de descuento`, final: r2(P * (1 - a / 100)), calc: `${s(P)} · ${s(1 - a / 100)} = ${s(P * (1 - a / 100))} €`}; }
      if (k === 1) { const e = r.pick([5, 10, 15, 20]); return {t: `${s(P)} € con ${s(e)} € de descuento`, final: P - e, calc: `${s(P)} − ${s(e)} = ${s(P - e)} €`}; }
      if (k === 2) { const a = r.pick([10, 20]), b = r.pick([10, 20, 25]); return {t: `${s(P)} € con un ${s(a)} % y después otro ${s(b)} %`, final: r2(P * (1 - a / 100) * (1 - b / 100)), calc: `${s(P)} · ${s(1 - a / 100)} · ${s(1 - b / 100)} = ${s(P * (1 - a / 100) * (1 - b / 100))} €`}; }
      const Q = Math.round(P * 0.8); return {t: `${s(Q)} € más un 21 % de IVA`, final: r2(Q * 1.21), calc: `${s(Q)} · 1,21 = ${s(Q * 1.21)} €`};
    };
    const tres = [una(), una(), una()]; if (tres.some(x => !x || !dec2(x.final))) continue;
    const fs = tres.map(o => o.final); if (new Set(fs.map(s)).size < 3) continue;
    const min = Math.min(...fs), seg = fs.filter(f => f !== min).sort((a, b) => a - b)[0];
    if (seg - min < 0.5 || seg - min > base * 0.25) continue;
    return {titulo: `Quieres comprar ${obj}. Hay tres tiendas:`, ofertas: tres, mejor: fs.indexOf(min)};
  }
  return {titulo: "Quieres comprar una mochila.", ofertas: [{t: "40 € con un 25 % de descuento", final: 30, calc: "40 · 0,75 = 30 €"}, {t: "35 € con 3 € de descuento", final: 32, calc: "35 − 3 = 32 €"}, {t: "25 € más un 21 % de IVA", final: 30.25, calc: "25 · 1,21 = 30,25 €"}], mejor: 0};
}

/* ---------- 🔐 escape room «La tienda»: problemas con letras; cada móvil tiene unos datos ---------- */
const ESC = [
  r => { const B = r.pick([10, 20, 25, 50]), A = 20 * r.int(2, 15); return {plantilla: "Una camiseta cuesta A € y tiene un B % de descuento. ¿Cuánto se paga?", datos: [{L: "A", v: A}, {L: "B", v: B}], v: A * (100 - B) / 100, expr: `${A} · ${100 - B} : 100`}; },
  r => { const u = r.int(2, 6), A = r.int(2, 5), C = r.int(6, 12); return {plantilla: "A kg de manzanas cuestan B €. ¿Cuántos € cuestan C kg?", datos: [{L: "A", v: A}, {L: "B", v: A * u}, {L: "C", v: C}], v: C * u, expr: `${C} · ${A * u} : ${A}`}; },
  r => { for (;;) { const A = r.int(2, 6), C = r.int(2, 8), K = lcm(A, C) * r.int(1, 3); if (A !== C) return {plantilla: "A albañiles levantan un muro en B días. ¿Cuántos días tardan C albañiles?", datos: [{L: "A", v: A}, {L: "B", v: K / A}, {L: "C", v: C}], v: K / C, expr: `${A} · ${K / A} : ${C}`}; } },
  r => { const B = r.int(1, 5), C = r.int(2, 6), v = r.pick([5, 10, 20]); return {plantilla: "Se reparten A € entre dos primos en partes proporcionales a B y C. ¿Cuántos € recibe el de las C partes?", datos: [{L: "A", v: (B + C) * v}, {L: "B", v: B}, {L: "C", v: C}], v: C * v, expr: `${(B + C) * v} : ${B + C} · ${C}`}; },
  r => { const A = r.pick([1000, 2000, 5000]), B = r.int(2, 6), C = r.int(2, 5); return {plantilla: "Meto A € al B % de interés simple durante C años. ¿Cuántos € de intereses gano?", datos: [{L: "A", v: A}, {L: "B", v: B}, {L: "C", v: C}], v: A * B * C / 100, expr: `${A} · ${B} · ${C} : 100`}; },
  r => { const A = r.pick([100, 200, 300, 400, 500]), B = r.pick([10, 20, 21]); return {plantilla: "Un patinete cuesta A € sin IVA. Con un B % de IVA, ¿cuánto cuesta?", datos: [{L: "A", v: A}, {L: "B", v: B}], v: A * (100 + B) / 100, expr: `${A} · ${100 + B} : 100`}; },
  r => { const T = r.pick([20, 25, 40, 50, 200]), a = r.pick([10, 20, 40, 50]); return {plantilla: "En una clase de A alumnos, el B % juega al fútbol. ¿Cuántos juegan al fútbol?", datos: [{L: "A", v: T}, {L: "B", v: a}], v: T * a / 100, expr: `${a} · ${T} : 100`}; }
];
function escape(r, d) {
  const cands = [], usados = new Set();
  while (cands.length < 4) {
    const i = r.int(0, ESC.length - 1); if (usados.has(i)) continue;
    const c = ESC[i](r); if (!Number.isInteger(c.v)) continue;
    usados.add(i); cands.push(c);
  }
  return {cands, final: cands.reduce((a, c) => a + c.v, 0)};
}

/* ---------- 🃏 parejas: huecos y las soluciones como cartas (con 2 trampas) ---------- */
const CARTAS = [
  r => { const a = r.pick([10, 20, 25, 50]), b = 20 * r.int(1, 20); return {txt: `${a} % de ${b} = ▢`, sol: a * b / 100, mal: [a * b / 10, b - a * b / 100]}; },
  r => { const a = r.pick([5, 10, 15, 20, 25, 30, 40]); return {txt: `Rebajar un ${a} % es multiplicar por ▢`, sol: r2(1 - a / 100), mal: [a / 100, r2(1 + a / 100)]}; },
  r => { const a = r.pick([4, 10, 15, 21, 30]); return {txt: `Subir un ${a} % es multiplicar por ▢`, sol: r2(1 + a / 100), mal: [a / 100, r2(1 - a / 100)]}; },
  r => { const T = r.pick([20, 40, 50, 200]), a = r.pick([10, 20, 25, 50]); return {txt: `${T * a / 100} de ${T} es el ▢ %`, sol: a, mal: [T * a / 100 / T, 100 - a]}; },
  r => { const P = 20 * r.int(2, 10), a = r.pick([10, 25, 50]); return {txt: `${P} € con un ${a} % de descuento = ▢ €`, sol: P * (100 - a) / 100, mal: [P * a / 100, P - a]}; },
  r => { const u = r.int(2, 5), a = r.int(2, 4), b = r.int(5, 9); return {txt: `Si ${a} kg cuestan ${a * u} €, ${b} kg cuestan ▢ €`, sol: b * u, mal: [a * a * u / b, u]}; },
  r => { const a = r.pick([2, 3, 4, 6]), b = r.pick([2, 3, 4, 6].filter(x => x !== a)), K = 12 * r.int(1, 2); return {txt: `${a} grifos tardan ${K / a} h; ${b} grifos tardan ▢ h`, sol: K / b, mal: [b * (K / a) / a, K]}; },
  r => { const C = r.pick([1000, 2000, 500]), t = r.int(2, 4), i = r.pick([2, 5, 10]); return {txt: `Interés de ${C} € al ${i} % durante ${t} años = ▢ €`, sol: C * i * t / 100, mal: [C * i / 100, C + C * i * t / 100]}; },
  r => { const a = r.int(1, 4), b = r.int(1, 4) + 4, v = r.pick([2, 5, 10]); return {txt: `${(a + b) * v} € a repartir en proporción a ${a} y ${b}: al de ${b} le toca ▢ €`, sol: b * v, mal: [(a + b) * v / 2, v]}; }
];
function cartas(r, d) {
  const huecos = [], usados = new Set(), tipos = r.mez(CARTAS.map((_, i) => i));
  for (let k = 0; huecos.length < 8 && k < 200; k++) {
    const h = CARTAS[tipos[k % tipos.length]](r); if (!dec2(h.sol) || usados.has(s(h.sol))) continue;
    usados.add(s(h.sol)); huecos.push(h);
  }
  const trampas = [];
  for (const h of r.mez(huecos)) { for (const m of h.mal) { const v = r2(m); if (dec2(v) && v > 0 && !usados.has(s(v)) && !trampas.some(t => s(t) === s(v))) { trampas.push(v); break; } } if (trampas.length >= 2) break; }
  return {huecos: huecos.map(h => ({txt: h.txt, sol: h.sol})), trampas};
}

G.LYAMatesPDC = {id: "p2", AP, HAB, NOMBRES, ESTRAT, gen, gemelo, pistas, enunciado, respuesta, malos, test, serie, leerSpec, hacerSpec, s, sg, leer, igual, conUd, r2, dec2, Rn,
  monta, oferta, escape, cartas, TIPOS, _ctx: {DIR, INV, COMP, PARES}};
})();
