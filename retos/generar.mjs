/* Genera content/<idioma>/retos.json con lo que necesitan los retos en grupo, para TODAS las lecturas, sin IA:
   - s:  la lectura partida en párrafos y frases (igual que la parte retos/texto.js en el navegador)
   - ev: para cada pregunta de la lectura, la frase (o las 2 frases) que la demuestra: [[párrafo, frase], …] o null
   - kw: palabras clave que salen en el texto y tienen definición en el diccionario de la web:
         {f: palabra tal como sale, l: lema, d: definición, x: [palabras prohibidas para el tabú], o: [[p, s, w], …] dónde sale}
   - tr: palabras trampa para «Cartas a la mesa» (palabras clave de otras lecturas del mismo nivel que no salen en esta)
   Uso: node retos/generar.mjs   (vuelve a generarlo todo; tarda unos segundos) */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ctx = {}; ctx.globalThis = ctx; vm.runInNewContext(fs.readFileSync(path.join(RAIZ, "retos/texto.js"), "utf8"), ctx);
const {parrafos, palabras, base, evDeFrases} = ctx.LYARetosTexto;

const STOP = {
  es: "el la los las un una unos unas de del al a en y o u e ni que qué con por para sin sobre entre hasta desde como cómo cuando cuándo donde dónde muy más menos mucho mucha muchos muchas poco poca pocos pocas este esta estos estas ese esa esos esas aquel aquella esto eso lo le les se me te nos os su sus mi mis tu tus nuestro nuestra es son ser fue fueron era eran está están estar estaba han ha hay había tiene tienen tener hace hacen hacer puede pueden poder también pero porque aunque si sí no ya todo toda todos todas otro otra otros otras cada mismo misma algo alguno alguna algunos algunas varios varias alguien nada nadie así entonces después antes luego siempre nunca solo sólo bien mal tan tanto tanta cual cuál cuales quien quién según durante mientras dice dicen va van vez veces año años día días parte forma manera cosa cosas gente persona personas ejemplo hoy aquí allí ahora",
  en: "the a an of to in on at for from by with about into over after before and or but nor so if then than that this these those there here it its they them their he him his she her we us our you your i me my is are was were be been being am do does did done have has had having can could will would shall should may might must not no yes very more most much many some any all each every other another such several only also just even still too as like what which who whom whose when where why how because while though although again ever never always often one two first new way thing things people person time times year years day days part lot",
  ca: "el la els les un una uns unes de del dels al als a en i o u ni que què amb per sense sobre entre fins des com quan on molt més menys molts moltes poc poca pocs poques aquest aquesta aquests aquestes aquell aquella això allò ho li els es se em et ens us seu seva seus seves meu meva teu teva nostre nostra és són ser era eren està estan estar ha han hi hem havia té tenen tenir fa fan fer pot poden poder també però perquè encara si sí no ja tot tota tots totes altre altra altres cada mateix mateixa alguns algunes diversos alguna algú res ningú així llavors després abans sempre mai només bé malament tan tant tanta qual quin quina quins quines qui segons durant mentre diu diuen va van vegada vegades any anys dia dies part forma manera cosa coses gent persona persones exemple avui aquí allà ara"
};
const NAME = /^Nom d|^Nom:|^Paraula anglesa|^Paraula grega|^Tecla |^Part del nom|^Name of |: name of |^Nickname |^Short name |^The letter |^The person who is speaking|^Nombre |^Palabra inglesa|^Plataforma |^Dinero que se gana|^Ropa o aspecto/;
const FUNC = /^(Palabra que|Palabra para|Forma de|A word|Form of|Paraula que|Paraula per|Forma del|Past of|Plural of|The past|Passat de|Pasado de)/i;
const ORD = {
  es: [[/primer(o)? párrafo/i, 0], [/segundo párrafo/i, 1], [/tercer(o)? párrafo/i, 2], [/cuarto párrafo/i, 3], [/quinto párrafo/i, 4], [/sexto párrafo/i, 5], [/(último|final) párrafo/i, -1]],
  en: [[/first paragraph/i, 0], [/second paragraph/i, 1], [/third paragraph/i, 2], [/fourth paragraph/i, 3], [/fifth paragraph/i, 4], [/sixth paragraph/i, 5], [/(last|final) paragraph/i, -1]],
  ca: [[/primer paràgraf/i, 0], [/segon paràgraf/i, 1], [/tercer paràgraf/i, 2], [/quart paràgraf/i, 3], [/cinquè paràgraf/i, 4], [/sisè paràgraf/i, 5], [/(últim|darrer) paràgraf/i, -1]]
};
const tallo = w => { const b = base(w); return /\d/.test(b) ? b : b.slice(0, 5); };

function generar(lang) {
  const dir = path.join(RAIZ, "content", lang, "lecturas");
  const DEF = JSON.parse(fs.readFileSync(path.join(RAIZ, "content", lang, "definiciones.json"), "utf8"));
  const stop = new Set(STOP[lang].split(" ").map(base));
  const util = w => { const b = base(w); return b.length >= 3 && !stop.has(b); };
  const sinElision = w => w.replace(/^(l|d|s|m|t|n)['’]/i, "").replace(/-(se|lo|la|los|les|nos|me|te|hi|ne|ho|li)$/i, "");
  const def = f => { const k = f.toLowerCase(); return DEF[k] || DEF[sinElision(k)] || null; };
  const stems = txt => { const out = new Map(); for (const w of palabras(txt)) if (util(w)) { const t = tallo(w); out.set(t, /\d/.test(t) ? 3 : 1); } return out; };
  const salida = {}, porNivel = {};
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort()) {
    const R = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    const P = parrafos(R), id = R.id;
    const S = P.map(fs_ => fs_.map(fr => stems(fr)));
    /* evidencias */
    const ev = (R.q || []).map(([preg, ops, ok, extra]) => {
      /* si la lectura trae las pruebas escritas a mano (q[i][3].ev), mandan ellas */
      const aMano = extra && Array.isArray(extra.ev) ? evDeFrases(P, extra.ev) : null;
      if (aMano) return aMano.slice(0, 3);
      let solo = null; for (const [re, n] of ORD[lang]) if (re.test(preg)) { solo = n < 0 ? P.length - 1 : n; break; }
      const qa = stems(preg.replace(/párrafo|paragraph|paràgraf/gi, "")), an = stems(ops[ok]), mal = new Map();
      ops.forEach((o, i) => { if (i !== ok) for (const [t] of stems(o)) mal.set(t, 1); });
      const cand = [];
      S.forEach((par, p) => { if (solo !== null && p !== solo) return; par.forEach((st, s) => {
        let sc = 0;
        let sa = 0; for (const [t, v] of an) if (st.has(t)) sa += 2 * v; sc += sa;
        for (const [t, v] of qa) if (st.has(t)) sc += v;
        for (const [t] of mal) if (st.has(t) && !an.has(t)) sc -= 0.3;
        cand.push({p, s, sc, sa});
      }); });
      cand.sort((a, b) => b.sc - a.sc);
      if (!cand.length || cand[0].sc < (solo !== null ? 1 : 1.5)) return null;
      return cand.filter((c, i) => i < 2 && (i === 0 || (c.sc >= cand[0].sc * 0.9 && c.sa > 0))).map(c => [c.p, c.s]);
    });
    /* palabras clave */
    const vocab = new Set((R.vocab || []).map(v => base(v[0])));
    const correctas = new Set((R.q || []).flatMap(q => palabras(q[1][q[2]]).map(tallo)));
    const lemas = new Map();
    P.forEach((par, p) => par.forEach((fr, s) => palabras(fr).forEach((w, wi) => {
      if (/\d/.test(w) || !util(w) || base(sinElision(w)).length < 4) return;
      if ((wi > 0 && /^\p{Lu}/u.test(w)) || /^\p{Lu}{2}/u.test(w) || /['’]/.test(w)) return; /* nombres propios, siglas y «d'animals» */
      const d = def(w); if (!d || NAME.test(d[1]) || FUNC.test(d[1])) return;
      const l = d[0].toLowerCase();
      if (stop.has(base(l))) return;
      const e = lemas.get(l) || {f: w.toLowerCase(), l, d: d[1], o: [], sc: 0};
      e.o.push([p, s, wi]); lemas.set(l, e);
    })));
    for (const e of lemas.values()) {
      e.sc = (vocab.has(base(e.l)) || vocab.has(base(e.f)) ? 6 : 0) + (correctas.has(tallo(e.f)) ? 2 : 0) + Math.min(3, e.o.length) + Math.min(3, base(e.f).length / 3);
      const prop = new Set([tallo(e.f), tallo(e.l)]), x = [];
      for (const w0 of palabras(e.d)) { const w = sinElision(w0), t = tallo(w); if (util(w) && base(w).length >= 4 && !prop.has(t) && !x.some(y => tallo(y) === t)) x.push(w.toLowerCase()); if (x.length === 3) break; }
      if (x.length < 2) { const [p, s] = e.o[0]; for (const w0 of palabras(P[p][s])) { const w = sinElision(w0), t = tallo(w); if (util(w) && base(w).length >= 4 && !prop.has(t) && !x.some(y => tallo(y) === t)) x.push(w.toLowerCase()); if (x.length === 3) break; } }
      e.x = x;
    }
    const kw = [...lemas.values()].sort((a, b) => b.sc - a.sc || a.f.localeCompare(b.f)).slice(0, 18).map(({sc, ...e}) => e);
    salida[id] = {s: P, ev, kw};
    (porNivel[R.level] ||= []).push(id);
  }
  /* trampas: palabras clave de otras lecturas del mismo nivel que no salen en esta (las de final parecido primero) */
  const NIV = ["A1", "A2", "B1", "B2", "C1"];
  for (const [nv, ids] of Object.entries(porNivel)) for (const id of ids) {
    const aqui = new Set(salida[id].s.flat().flatMap(palabras).map(base));
    /* un nivel con una sola lectura (C1) coge las trampas del nivel de abajo */
    let otros = ids.filter(o => o !== id);
    for (let k = NIV.indexOf(nv) - 1; otros.length < 3 && k >= 0; k--) otros = otros.concat(porNivel[NIV[k]] || []);
    const pool = [...new Set(otros.flatMap(o => salida[o].kw.map(k => k.f.toLowerCase())))].filter(w => !aqui.has(base(w)) && !/^\p{Lu}/u.test(w));
    const fins = new Set(salida[id].kw.map(k => base(k.f).slice(-2)));
    const h = w => { let x = 7; for (const c of w + id) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x; };
    pool.sort((a, b) => (fins.has(base(b).slice(-2)) - fins.has(base(a).slice(-2))) || h(a) - h(b));
    salida[id].tr = pool.slice(0, 16);
  }
  fs.writeFileSync(path.join(RAIZ, "content", lang, "retos.json"), JSON.stringify(salida));
  return salida;
}
for (const lang of ["es", "en", "ca"]) {
  const s = generar(lang), ids = Object.keys(s);
  const sinEv = ids.reduce((n, id) => n + s[id].ev.filter(x => !x).length, 0), totQ = ids.reduce((n, id) => n + s[id].ev.length, 0);
  const pocasKw = ids.filter(id => s[id].kw.length < 8);
  console.log(`${lang}: ${ids.length} lecturas · preguntas sin frase-prueba ${sinEv}/${totQ} · lecturas con < 8 palabras clave: ${pocasKw.join(", ") || "ninguna"}`);
}
