/* Retos en grupo: cómo se parte una lectura en frases y palabras.
   Lo usan igual el navegador (retos/retos.js) y el generador (retos/generar.mjs), así las posiciones «párrafo.frase.palabra»
   que guarda content/<idioma>/retos.json coinciden con lo que ve el alumno. */
(function (root) {
  const plain = s => String(s || "").replace(/\[([^\]|]+)(?:\|[^\]]+)?\]/g, "$1").replace(/\s+/g, " ").trim();
  /* frases: corta después de . ! ? … (y comillas de cierre) cuando lo siguiente empieza en mayúscula, número o signo de apertura */
  const CORTE = /(?<=[.!?…])["»”’)]*\s+(?=[¿¡«"“(A-ZÁÉÍÓÚÀÈÒÏÜÑÇ0-9])/u;
  function frases(par) {
    const out = [], t = plain(par);
    let resto = t;
    while (resto) {
      const m = resto.match(CORTE);
      if (!m) { out.push(resto); break; }
      const fin = m.index + m[0].length;
      out.push(resto.slice(0, fin).trim()); resto = resto.slice(fin);
    }
    return out.filter(Boolean);
  }
  const PAL = /[\p{L}\p{N}]+(?:[’'·.\-][\p{L}\p{N}]+)*/gu;
  /* trozos de una frase: [{t: texto, w: índice de palabra o -1 si es espacio/puntuación}] */
  function trozos(fr) {
    const out = []; let i = 0, n = 0, m; PAL.lastIndex = 0;
    while ((m = PAL.exec(fr))) {
      if (m.index > i) out.push({t: fr.slice(i, m.index), w: -1});
      out.push({t: m[0], w: n++}); i = m.index + m[0].length;
    }
    if (i < fr.length) out.push({t: fr.slice(i), w: -1});
    return out;
  }
  const palabras = fr => trozos(fr).filter(x => x.w >= 0).map(x => x.t);
  const base = w => String(w).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/’/g, "'");
  const parrafos = R => (R.text || []).map(frases);
  /* frases del texto que coinciden con las «pruebas» escritas a mano en una pregunta (q[i][3].ev: frases exactas del texto) */
  const norm = t => base(plain(t)).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  function evDeFrases(P, evs) {
    const out = [];
    for (const e of evs || []) {
      const ne = norm(e); if (!ne) continue;
      P.forEach((par, p) => par.forEach((fr, s) => { const nf = norm(fr); if (nf && (nf.includes(ne) || (nf.length > 12 && ne.includes(nf))) && !out.some(x => x[0] === p && x[1] === s)) out.push([p, s]); }));
    }
    return out.length ? out : null;
  }
  const X = {plain, frases, trozos, palabras, base, parrafos, evDeFrases};
  root.LYARetosTexto = X;
  if (typeof module === "object" && module && module.exports) module.exports = X;
})(typeof window !== "undefined" ? window : globalThis);
