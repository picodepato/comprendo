/* COMPRENDO · Matemáticas: dibujos (SVG hechos a mano) que acompañan la explicación de cada apartado.
   LYAMatesDibujos.t2[n]() → HTML con una o varias <figure class="mt-fig">. Colores con las variables de la web (mates.css: .mt-fig).
   Todos miden 400 de ancho para que en el móvil el texto se lea a su tamaño. */
(() => {
const M = "−", W = 400;
const sg = v => v > 0 ? "+" + v : v < 0 ? M + Math.abs(v) : "0";
const fig = (svg, pie) => `<figure class="mt-fig">${svg}<figcaption>${pie}</figcaption></figure>`;
const svg = (h, cuerpo, label) => `<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="${label}">${DEFS}${cuerpo}</svg>`;
const tx = (x, y, t, cls = "", extra = "") => `<text x="${x}" y="${y}" class="${cls}" ${extra}>${t}</text>`;
const DEFS = `<defs><marker id="mtf" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="mf-c"/></marker><marker id="mtfi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="mf-ink"/></marker></defs>`;
const colorDe = v => v > 0 ? "mf-pos" : v < 0 ? "mf-neg" : "mf-ink";

/* recta numérica de desde a hasta: positivos en verde y negativos en rojo */
function recta({desde, hasta, y = 70, pad = 22, puntos = [], saltos = [], arcos = [], etiquetas = true, cada = 1}) {
  const x = v => pad + (W - 2 * pad) * (v - desde) / (hasta - desde);
  let s = `<line x1="${pad - 14}" y1="${y}" x2="${W - pad + 14}" y2="${y}" class="ms-ink" marker-start="url(#mtfi)" marker-end="url(#mtfi)"/>`;
  for (let v = desde; v <= hasta; v++) {
    s += `<line x1="${x(v)}" y1="${y - 6}" x2="${x(v)}" y2="${y + 6}" class="ms-ink"/>`;
    if (etiquetas && (v % cada === 0)) s += tx(x(v), y + 26, sg(v), colorDe(v) + " mt-num");
  }
  for (const a of arcos) {  /* distancia al 0 */
    const x1 = x(a.de), x2 = x(a.a), h = a.h || 26;
    s += `<path d="M${x1} ${y - 10} Q${(x1 + x2) / 2} ${y - 10 - h * 2} ${x2} ${y - 10}" class="ms-c" fill="none" stroke-dasharray="5 4"/>` + tx((x1 + x2) / 2, y - 16 - h, a.t, "mf-c mt-num");
  }
  for (const j of saltos) {  /* saltos de una unidad, con flecha */
    const paso = j.a > j.de ? 1 : -1;
    for (let v = j.de; v !== j.a; v += paso) {
      const x1 = x(v), x2 = x(v + paso);
      s += `<path d="M${x1} ${y - 9} Q${(x1 + x2) / 2} ${y - 36} ${x2 - paso * 2} ${y - 11}" class="ms-c" fill="none" marker-end="url(#mtf)"/>`;
    }
    if (j.t) s += tx((x(j.de) + x(j.a)) / 2, y - 36, j.t, "mf-c mt-sm");
  }
  for (const p of puntos) {
    s += `<circle cx="${x(p.v)}" cy="${y}" r="7" class="${p.cls || colorDe(p.v)} ms-bg"/>`;
    if (p.t) s += tx(x(p.v), y - 16, p.t, colorDe(p.v) + " mt-num");
  }
  return s;
}

const T2 = {
  1: () => fig(svg(130, recta({desde: -5, hasta: 5, y: 86, arcos: [{de: -4, a: 0, t: "|−4| = 4"}, {de: 0, a: 4, t: "|+4| = 4"}], puntos: [{v: -4}, {v: 4}]})
      + tx(8, 18, "← negativos", "mf-neg mt-sm", 'style="text-anchor:start"') + tx(392, 18, "positivos →", "mf-pos mt-sm", 'style="text-anchor:end"'), "Recta numérica de −5 a +5 con −4 y +4 a la misma distancia del cero"),
      "−4 y +4 están a la misma distancia del 0, cada uno a un lado: son <b>opuestos</b> y los dos tienen <b>valor absoluto 4</b>.")
    + fig(svg(236, (() => {
      /* un edificio con sótanos y un termómetro */
      let s = "";
      [3, 2, 1, 0, -1, -2].forEach((p, i) => {
        const y = 14 + i * 34 + (p < 0 ? 8 : 0);
        s += `<rect x="10" y="${y}" width="196" height="30" rx="5" class="${p < 0 ? "mt-bajo" : "mt-alto"}"/>` + tx(108, y + 21, p === 0 ? "Planta baja: 0" : p > 0 ? `Planta ${sg(p)}` : `Sótano ${sg(p)}`, colorDe(p) + " mt-num");
      });
      s += `<line x1="0" y1="${14 + 4 * 34 + 2}" x2="216" y2="${14 + 4 * 34 + 2}" class="ms-ink" stroke-width="3"/>`;
      const t0 = 290, top = 20, bot = 186, v2y = v => top + (bot - top) * (10 - v) / 20;
      s += `<rect x="${t0 - 10}" y="${top - 8}" width="20" height="${bot - top + 16}" rx="10" class="mt-termo"/><circle cx="${t0}" cy="${bot + 20}" r="15" class="mf-neg"/>`;
      s += `<rect x="${t0 - 5}" y="${v2y(-5)}" width="10" height="${bot + 12 - v2y(-5)}" class="mf-neg"/>`;
      for (let v = -10; v <= 10; v += 5) s += `<line x1="${t0 + 12}" y1="${v2y(v)}" x2="${t0 + 20}" y2="${v2y(v)}" class="ms-ink"/>` + tx(t0 + 26, v2y(v) + 5, sg(v) + " °C", colorDe(v) + " mt-sm", 'style="text-anchor:start"');
      s += `<line x1="${t0 - 30}" y1="${v2y(-5)}" x2="${t0 - 12}" y2="${v2y(-5)}" class="ms-neg" stroke-width="2"/>` + tx(t0 - 34, v2y(-5) + 5, "−5", "mf-neg mt-lbl", 'style="text-anchor:end"');
      return s;
    })(), "Un edificio con plantas positivas y sótanos negativos, y un termómetro que marca menos cinco grados"),
      "Los sótanos y los grados bajo cero son números <b>negativos</b>: están por debajo del 0."),
  2: () => fig(svg(150, tx(200, 24, "−10 < −7 < −3 < +3 < +8", "mf-ink mt-big") + recta({desde: -10, hasta: 8, y: 84, etiquetas: false, puntos: [{v: -10, t: "−10"}, {v: -7, t: "−7"}, {v: -3, t: "−3"}, {v: 0, t: "0"}, {v: 3, t: "+3"}, {v: 8, t: "+8"}]})
      + `<line x1="40" y1="118" x2="360" y2="118" class="ms-c" stroke-width="3" marker-end="url(#mtf)"/>` + tx(200, 142, "más a la derecha → MAYOR", "mf-c mt-lbl"), "Recta con varios números: el de más a la derecha es el mayor"),
      "−3 es <b>mayor</b> que −7 porque está más a la derecha (más cerca del 0), aunque 7 sea más que 3."),
  3: () => fig(svg(130, tx(200, 22, "(−5) + (+3) = −2", "mf-ink mt-big") + recta({desde: -7, hasta: 3, y: 92, puntos: [{v: -5}, {v: -2, cls: "mf-c"}], saltos: [{de: -5, a: -2, t: "3 saltos →"}]}), "Sumar más tres desde menos cinco: tres saltos a la derecha hasta menos dos"),
      "<b>Sumar un positivo</b> es avanzar hacia la derecha: empiezo en −5, doy 3 saltos y llego a −2. (Sumar un negativo sería ir a la izquierda.)")
    + fig(svg(130, tx(200, 22, "(−2) − (−7) = (−2) + (+7) = +5", "mf-ink mt-lbl") + recta({desde: -3, hasta: 6, y: 92, puntos: [{v: -2}, {v: 5}], saltos: [{de: -2, a: 5, t: "7 saltos →"}]}), "Restar menos siete es sumar siete: siete saltos a la derecha desde menos dos hasta cinco"),
      "<b>Restar un negativo</b> es sumar su opuesto: también se avanza a la derecha."),
  4: () => fig(svg(240, (() => {
      /* balanza: baja el lado que pesa más (los positivos) */
      const yI = 84, yD = 60;  /* extremos del brazo */
      let s = tx(200, 22, "−6 − 4 + 2 + 5 + 7 − 3", "mf-ink mt-big");
      s += `<line x1="200" y1="72" x2="200" y2="214" class="ms-ink" stroke-width="4"/><polygon points="200,206 178,232 222,232" class="mf-mute"/>`;
      s += `<line x1="40" y1="${yI}" x2="360" y2="${yD}" class="ms-ink" stroke-width="5"/><circle cx="200" cy="72" r="6" class="mf-ink"/>`;
      s += `<line x1="100" y1="${yI - 4}" x2="34" y2="140" class="ms-mute"/><line x1="100" y1="${yI - 4}" x2="166" y2="140" class="ms-mute"/>`;
      s += `<line x1="300" y1="${yD - 4}" x2="234" y2="116" class="ms-mute"/><line x1="300" y1="${yD - 4}" x2="366" y2="116" class="ms-mute"/>`;
      s += `<rect x="20" y="140" width="160" height="58" rx="12" class="mt-cajap"/>` + tx(100, 163, "Positivos", "mf-pos mt-num") + tx(100, 187, "2 + 5 + 7 = 14", "mf-ink mt-num");
      s += `<rect x="220" y="116" width="160" height="58" rx="12" class="mt-cajan"/>` + tx(300, 139, "Negativos", "mf-neg mt-num") + tx(300, 163, "6 + 4 + 3 = 13", "mf-ink mt-num");
      return s;
    })(), "Balanza: los positivos suman catorce y los negativos trece; pesan más los positivos"),
      "Junta los positivos y los negativos. Pesan más los positivos, por 1: el resultado es <b>14 − 13 = +1</b>."),
  5: () => fig(svg(250, (() => {
      const c = 78, x0 = 83, y0 = 10;
      let s = tx(x0 + c / 2, y0 + 36, "· o :", "mf-mute mt-num") + tx(x0 + c * 1.5, y0 + 38, "+", "mf-pos mt-big") + tx(x0 + c * 2.5, y0 + 38, "−", "mf-neg mt-big");
      s += tx(x0 + c / 2, y0 + 58 + 40, "+", "mf-pos mt-big") + tx(x0 + c / 2, y0 + 58 + 104, "−", "mf-neg mt-big");
      [["+", "+", "+"], ["+", "−", "−"], ["−", "+", "−"], ["−", "−", "+"]].forEach(([a, b, r]) => {
        const x = x0 + c * (b === "+" ? 1 : 2), y = y0 + 58 + (a === "+" ? 0 : 64);
        s += `<rect x="${x + 4}" y="${y}" width="${c - 8}" height="56" rx="10" class="${r === "+" ? "mt-cajap" : "mt-cajan"}"/>` + tx(x + c / 2, y + 38, r, (r === "+" ? "mf-pos" : "mf-neg") + " mt-big");
      });
      s += tx(200, 220, "signos iguales → +", "mf-pos mt-lbl") + tx(200, 244, "signos distintos → −", "mf-neg mt-lbl");
      return s;
    })(), "Tabla de la regla de los signos"),
      "La <b>regla de los signos</b> vale igual para multiplicar y para dividir: (−6) · (+2) = −12 y (−6) : (−2) = +3."),
  6: () => fig(svg(190, (() => {
      let s = "";
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += `<rect x="${40 + j * 38}" y="${44 + i * 38}" width="36" height="36" rx="4" class="mt-cuad"/>`;
      s += tx(97, 28, "3² = 3 · 3 = 9", "mf-ink mt-lbl");
      /* cubo 2×2×2 en perspectiva: 8 cubitos */
      const cx = 250, cy = 76, a = 40, dx = 20, dy = -16;
      const cara = (x, y, cls, pts) => `<polygon points="${pts.map(([u, v]) => `${x + u},${y + v}`).join(" ")}" class="${cls}"/>`;
      for (let k = 1; k >= 0; k--) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        const x = cx + j * a + k * dx, y = cy + i * a + k * dy;
        s += cara(x, y, "mt-cuad", [[0, 0], [a, 0], [a, a], [0, a]]);
        if (i === 0) s += cara(x, y, "mt-cuad2", [[0, 0], [dx, dy], [a + dx, dy], [a, 0]]);
        if (j === 1) s += cara(x, y, "mt-cuad3", [[a, 0], [a + dx, dy], [a + dx, a + dy], [a, a]]);
      }
      s += tx(cx + a + dx / 2, 28, "2³ = 2 · 2 · 2 = 8", "mf-ink mt-lbl");
      return s;
    })(), "Un cuadrado de tres por tres cuadraditos y un cubo de dos por dos por dos cubitos"),
      "<b>Al cuadrado</b> es el área de un cuadrado; <b>al cubo</b>, los cubitos que caben en un cubo.")
    + fig(svg(120, (() => {
      let s = tx(200, 22, "Base negativa: el signo va cambiando", "mf-ink mt-num");
      [[1, -2], [2, 4], [3, -8], [4, 16]].forEach(([n, v], i) => {
        const x = 52 + i * 98;
        s += `<rect x="${x - 42}" y="38" width="84" height="66" rx="12" class="${v > 0 ? "mt-cajap" : "mt-cajan"}"/>` + tx(x, 62, `(−2)${["", "¹", "²", "³", "⁴"][n]}`, "mf-mute mt-num") + tx(x, 92, sg(v), (v > 0 ? "mf-pos" : "mf-neg") + " mt-big");
      });
      return s;
    })(), "Potencias de menos dos: menos dos, más cuatro, menos ocho, más dieciséis"),
      "Exponente <b>impar → −</b> y exponente <b>par → +</b>."),
  7: () => fig(svg(220, (() => {
      let s = "", l = 20;
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) s += `<rect x="${20 + j * l}" y="${44 + i * l}" width="${l - 2}" height="${l - 2}" rx="3" class="mt-cuad"/>`;
      s += `<line x1="20" y1="${44 + 6 * l + 8}" x2="${18 + 6 * l}" y2="${44 + 6 * l + 8}" class="ms-c" stroke-width="3"/>` + tx(20 + 3 * l, 44 + 6 * l + 30, "lado 6", "mf-c mt-num");
      s += tx(20 + 3 * l, 28, "√36 = 6", "mf-ink mt-lbl");
      const k = 13, x0 = 186;
      for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) s += `<rect x="${x0 + j * k}" y="${44 + i * k}" width="${k - 2}" height="${k - 2}" rx="2" class="mt-cuad"/>`;
      for (let i = 0; i < 11; i++) s += `<rect x="${x0 + 9 * k + 12 + (i % 3) * k}" y="${44 + Math.floor(i / 3) * k}" width="${k - 2}" height="${k - 2}" rx="2" class="mt-cajan"/>`;
      s += tx(x0 + 4.5 * k, 28, "√92", "mf-ink mt-lbl") + tx(x0 + 9 * k + 12 + 1.5 * k, 120, "sobran", "mf-neg mt-sm") + tx(x0 + 9 * k + 12 + 1.5 * k, 140, "11", "mf-neg mt-lbl");
      s += tx(x0 + 4.5 * k, 44 + 9 * k + 28, "lado 9 (81)", "mf-c mt-num") + tx(x0 + 4.5 * k, 44 + 9 * k + 50, "raíz 9 y resto 11", "mf-ink mt-num");
      return s;
    })(), "Treinta y seis cuadraditos forman un cuadrado de lado seis; con noventa y dos, el cuadrado es de lado nueve y sobran once"),
      "La raíz cuadrada es el <b>lado</b> del cuadrado que puedes formar. Si no sale exacto, lo que sobra es el <b>resto</b>."),
  8: () => fig(svg(226, (() => {
      let s = "";
      [["1.º", "( )  [ ]", "paréntesis y corchetes"], ["2.º", "x²  √", "potencias y raíces"], ["3.º", "·  :", "multiplicar y dividir"], ["4.º", "+  −", "sumar y restar"]].forEach(([n, sim, t], i) => {
        const x = 8 + i * 26, y = 6 + i * 55;
        s += `<rect x="${x}" y="${y}" width="${384 - i * 26}" height="49" rx="10" class="mt-esc" style="opacity:${1 - i * 0.17}"/>`
          + tx(x + 26, y + 32, n, "mf-ink mt-lbl") + tx(x + 100, y + 32, sim, "mf-ink mt-lbl") + tx(x + 156, y + 31, t, "mf-ink mt-num", 'style="text-anchor:start"');
      });
      return s;
    })(), "Escalera con el orden de las operaciones: paréntesis, potencias y raíces, multiplicar y dividir, sumar y restar"),
      "Se baja la escalera en orden. Si hay dos del mismo escalón, de <b>izquierda a derecha</b>.")
};

/* 4.º ESO PDC · Tema 2: proporcionalidad y porcentajes */
const st = 'style="text-anchor:start"', en = 'style="text-anchor:end"';
const flecha = (x1, y1, x2, y2, t, ty) => `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.min(y1, y2) - 26} ${x2} ${y2}" class="ms-c" fill="none" marker-end="url(#mtf)"/>` + (t ? tx((x1 + x2) / 2, ty ?? Math.min(y1, y2) - 22, t, "mf-c mt-num") : "");
const flechaAb = (x1, y1, x2, y2, t, ty) => `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.max(y1, y2) + 26} ${x2} ${y2}" class="ms-c" fill="none" marker-end="url(#mtf)"/>` + (t ? tx((x1 + x2) / 2, ty ?? Math.max(y1, y2) + 34, t, "mf-c mt-num") : "");
/* tabla de dos filas: cabeceras y valores, con flechas arriba y abajo */
function tablaSVG(y0, h1, h2, xs, ys) {
  const x0 = 120, cw = (W - x0 - 6) / xs.length; let o = "";
  o += `<rect x="6" y="${y0}" width="${W - 12}" height="76" rx="8" class="mt-alto"/><line x1="6" y1="${y0 + 38}" x2="${W - 6}" y2="${y0 + 38}" class="ms-mute"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 + 76}" class="ms-mute"/>`;
  o += tx(14, y0 + 25, h1, "mf-ink mt-num", st) + tx(14, y0 + 63, h2, "mf-ink mt-num", st);
  xs.forEach((v, i) => { o += tx(x0 + cw * (i + .5), y0 + 25, v, "mf-ink mt-lbl") + tx(x0 + cw * (i + .5), y0 + 63, ys[i], "mf-c mt-lbl"); });
  return {o, cx: i => x0 + cw * (i + .5)};
}
const P2 = {
  1: () => { const T = tablaSVG(40, "Kilos", "Precio (€)", ["1", "2", "3", "4"], ["1,5", "3", "4,5", "6"]);
      return fig(svg(170, T.o + flecha(T.cx(0), 38, T.cx(1) - 6, 38, "× 2") + flecha(T.cx(0), 38, T.cx(2) - 6, 32, "× 3", 4) + flechaAb(T.cx(0), 118, T.cx(1) - 6, 118, "× 2") + flechaAb(T.cx(0), 118, T.cx(2) - 6, 124, "× 3", 160), "Tabla de kilos y precio: si los kilos se multiplican por 2 o por 3, el precio también"),
        "Si los kilos se hacen el <b>doble</b> o el <b>triple</b>, el precio también: es <b>directa</b>. Y precio : kilos da siempre <b>1,5</b> (lo que vale 1 kg).")
      + fig(svg(150, (() => { let o = tx(200, 22, "Regla de tres directa: en cruz", "mf-ink mt-lbl");
          o += tx(110, 64, "3 kg", "mf-ink mt-lbl") + tx(290, 64, "4,5 €", "mf-ink mt-lbl") + tx(110, 112, "4 kg", "mf-ink mt-lbl") + tx(290, 112, "x", "mf-c mt-big");
          o += `<line x1="150" y1="58" x2="250" y2="58" class="ms-mute" marker-end="url(#mtfi)"/><line x1="150" y1="106" x2="250" y2="106" class="ms-mute" marker-end="url(#mtfi)"/>`;
          o += `<line x1="140" y1="104" x2="262" y2="70" class="ms-c" stroke-dasharray="6 4"/>` + tx(200, 140, "x = 4 · 4,5 : 3 = 6 €", "mf-c mt-lbl"); return o; })(), "Regla de tres directa con tres kilos y cuatro con cincuenta euros: se multiplica en cruz cuatro por cuatro con cincuenta"),
        "Se multiplican los dos que están <b>en cruz</b> (4 y 4,5) y se divide entre el que queda (3)."); },
  2: () => fig(svg(200, (() => { let o = tx(200, 22, "Todas tienen el mismo trabajo: 12", "mf-ink mt-lbl");
      [[1, 12], [2, 6], [3, 4], [4, 3], [6, 2]].forEach(([a, b], i) => { const x = 14 + i * 78, w = 10 * a, h = 10 * b; o += `<rect x="${x}" y="${160 - h}" width="${w}" height="${h}" class="mt-cuad"/>` + tx(x + 32, 186, `${a} × ${b}`, "mf-ink mt-num"); });
      return o; })(), "Rectángulos de la misma área: uno por doce, dos por seis, tres por cuatro, cuatro por tres y seis por dos"),
      "1 albañil 12 días, 2 albañiles 6 días, 3 albañiles 4 días… Si uno se hace el <b>doble</b>, el otro la <b>mitad</b>: el producto (el área) es siempre <b>12</b>.")
    + (() => { const T = tablaSVG(40, "Grifos", "Horas", ["1", "2", "3", "6"], ["12", "6", "4", "2"]);
      return fig(svg(170, T.o + flecha(T.cx(0), 38, T.cx(1) - 6, 38, "× 2") + flechaAb(T.cx(0), 118, T.cx(1) - 6, 118, ": 2") + flecha(T.cx(1), 38, T.cx(3) - 6, 38, "× 3") + flechaAb(T.cx(1), 118, T.cx(3) - 6, 118, ": 3"), "Tabla de grifos y horas: cuando los grifos se multiplican por dos, las horas se dividen entre dos"),
        "Arriba se <b>multiplica</b> y abajo se <b>divide</b> por lo mismo: es <b>inversa</b>. Regla de tres inversa: x = 2 · 6 : 3 = 4 (se multiplica en línea)."); })(),
  3: () => fig(svg(190, (() => { let o = "";
      const caja = (x, t, t2) => `<rect x="${x}" y="40" width="112" height="60" rx="10" class="mt-alto"/>` + tx(x + 56, 66, t, "mf-ink mt-lbl") + tx(x + 56, 88, t2, "mf-mute mt-sm");
      o += caja(8, "Obreros", "2 → 4") + caja(144, "Horas al día", "5 → 6") + caja(280, "Metros", "50 → x");
      o += flechaAb(64, 100, 330, 104, "directa: más obreros, más metros", 168) + flecha(200, 40, 318, 36, "directa", 10);
      return o; })(), "Tres cajas: obreros, horas al día y metros. Cada una se compara con los metros"),
      "Cada magnitud se compara <b>con la que te preguntan</b> (los metros), una a una. Luego: 1 obrero en 1 hora hace 50 : 2 : 5 = 5 m, y 4 obreros 6 horas hacen 5 · 4 · 6 = 120 m."),
  4: () => fig(svg(250, (() => { let o = tx(200, 20, "15 % = 15 de cada 100", "mf-ink mt-lbl");
      for (let i = 0; i < 100; i++) { const x = 100 + (i % 10) * 20, y = 34 + Math.floor(i / 10) * 20; o += `<rect x="${x}" y="${y}" width="17" height="17" rx="3" class="${i < 15 ? "mt-cuad2" : "mt-cuad3"}"/>`; }
      return o; })(), "Cuadrícula de cien cuadros con quince coloreados"),
      "De cada <b>100</b> cuadritos, <b>15</b> están pintados: eso es el <b>15 %</b>.")
    + fig(svg(120, (() => { let o = "";
      o += `<rect x="20" y="36" width="360" height="30" rx="6" class="mt-cuad3"/><rect x="20" y="36" width="54" height="30" rx="6" class="mt-cuad2"/>`;
      o += tx(20, 26, "0 %", "mf-mute mt-sm", st) + tx(380, 26, "100 %", "mf-mute mt-sm", en) + tx(47, 26, "15 %", "mf-c mt-sm");
      o += tx(20, 90, "0 €", "mf-mute mt-sm", st) + tx(380, 90, "35 €", "mf-ink mt-num", en) + tx(47, 90, "5,25 €", "mf-c mt-num") + tx(200, 114, "15 % de 35 = 15 · 35 : 100 = 5,25", "mf-ink mt-num"); return o; })(), "Barra de cero a cien por cien que equivale a cero a treinta y cinco euros; el quince por ciento son cinco con veinticinco"),
      "El total (35 €) es el <b>100 %</b>. El 15 % es un trozo de la barra: <b>5,25 €</b>."),
  5: () => fig(svg(150, (() => { let o = tx(200, 20, "Con el IVA pagas el 116 %", "mf-ink mt-lbl");
      o += `<rect x="16" y="40" width="300" height="34" rx="6" class="mt-cuad3"/><rect x="316" y="40" width="48" height="34" rx="6" class="mt-cuad2"/>`;
      o += tx(166, 63, "100 % · 240 €", "mf-ink mt-num") + tx(340, 63, "+16 %", "mf-c mt-sm") + tx(340, 96, "38,40 €", "mf-c mt-sm");
      o += `<line x1="16" y1="112" x2="364" y2="112" class="ms-c" marker-start="url(#mtf)" marker-end="url(#mtf)"/>` + tx(190, 136, "116 % → 240 · 1,16 = 278,40 €", "mf-c mt-lbl"); return o; })(), "Barra del cien por cien con un trozo más del dieciséis por ciento: en total el ciento dieciséis por ciento"),
      "Subir un 16 % es pagar el <b>100 % + 16 % = 116 %</b>: se multiplica por <b>1,16</b>. Para volver atrás, se <b>divide</b> entre 1,16."),
  6: () => fig(svg(150, (() => { let o = tx(200, 20, "Con un 10 % de descuento pagas el 90 %", "mf-ink mt-lbl");
      o += `<rect x="16" y="40" width="331" height="34" rx="6" class="mt-cuad2"/><rect x="347" y="40" width="37" height="34" rx="6" class="mt-cuad3" stroke-dasharray="5 4"/>`;
      o += tx(180, 63, "90 % · lo que pagas", "mf-ink mt-num") + tx(366, 63, "−10 %", "mf-neg mt-sm");
      o += tx(200, 106, "24 € · 0,9 = 21,60 €", "mf-c mt-lbl") + tx(200, 132, "(el 10 % de 24 son 2,40 €, que te ahorras)", "mf-mute mt-sm"); return o; })(), "Barra del cien por cien a la que se le quita un diez por ciento: queda el noventa por ciento"),
      "Rebajar un 10 % es pagar el <b>90 %</b>: se multiplica por <b>0,9</b>.")
    + fig(svg(170, (() => { let o = tx(200, 20, "−10 % y después −20 %", "mf-ink mt-lbl"), y = 38;
      [[100, "60 €"], [90, "54 € (60 · 0,9)"], [72, "43,20 € (54 · 0,8)"]].forEach(([p, t], i) => { o += `<rect x="16" y="${y + i * 42}" width="${2.2 * p}" height="30" rx="6" class="${i ? "mt-cuad2" : "mt-cuad3"}"/>` + tx(24, y + i * 42 + 21, `${p} %`, "mf-ink mt-num", st) + tx(2.2 * p + 26, y + i * 42 + 21, t, "mf-c mt-num", st); });
      return o; })(), "Tres barras: cien por cien, noventa por ciento y setenta y dos por ciento"),
      "La segunda rebaja se hace sobre el precio <b>ya rebajado</b>: al final pagas el <b>72 %</b>, no el 70 %."),
  7: () => fig(svg(200, (() => { let o = tx(200, 20, "1.000 € al 5 % durante 3 años", "mf-ink mt-lbl");
      for (let i = 0; i <= 3; i++) { const x = 30 + i * 92; o += `<rect x="${x}" y="${170 - 100}" width="60" height="100" rx="6" class="mt-cuad3"/>` + tx(x + 30, 125, "1.000", "mf-ink mt-sm");
        for (let k = 0; k < i; k++) o += `<rect x="${x}" y="${66 - (k + 1) * 14}" width="60" height="12" rx="3" class="mt-cuad2"/>`;
        o += tx(x + 30, 190, i === 0 ? "al meterlo" : `año ${i}`, "mf-mute mt-sm"); }
      return o; })(), "Cuatro montones: el capital de mil euros y cada año un trocito más de cincuenta euros"),
      "Cada año te dan el 5 % de 1.000 € = <b>50 €</b>. En 3 años: 50 · 3 = <b>150 €</b> de intereses (I = C · r · t : 100). Al final tienes 1.150 €."),
  8: () => fig(svg(220, (() => { const cx = 110, cy = 110, R = 92, quien = ["Juan", "Juan", "Juan", "Juan", "Ana", "Ana", "Ana", "Luis"], cls = {Juan: "mt-cuad2", Ana: "mt-cuad", Luis: "mt-cuad3"};
      let o = "";
      quien.forEach((q, i) => { const a1 = -Math.PI / 2 + i * Math.PI / 4, a2 = a1 + Math.PI / 4; o += `<path d="M${cx} ${cy} L${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} A${R} ${R} 0 0 1 ${cx + R * Math.cos(a2)} ${cy + R * Math.sin(a2)} Z" class="${cls[q]}"/>`; });
      [["Juan", "4 porciones → 6 €"], ["Ana", "3 porciones → 4,50 €"], ["Luis", "1 porción → 1,50 €"]].forEach(([n, t], i) => { o += `<rect x="226" y="${46 + i * 48}" width="22" height="22" rx="4" class="${cls[n]}"/>` + tx(256, 56 + i * 48, n, "mf-ink mt-num", st) + tx(256, 74 + i * 48, t, "mf-c mt-sm", st); });
      o += tx(300, 208, "12 € : 8 = 1,50 € la porción", "mf-ink mt-sm"); return o; })(), "Una pizza de ocho porciones: cuatro de Juan, tres de Ana y una de Luis"),
      "Total 12 € y 8 porciones: <b>una porción vale 1,50 €</b>. Cada uno paga sus porciones por 1,50 €.")
};
window.LYAMatesDibujos = {t2: T2, p2: P2, recta};
})();
