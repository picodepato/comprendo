// GUARDIA de los temas de profes: un PR de la rutina de cada mañana SOLO puede añadir temas.
//   node temas-profe/guardia.mjs <base> [carpeta]
//   <base>: el commit o rama con la que se compara (p. ej. origin/main) · [carpeta]: el repositorio con los cambios (por defecto, este)
// Falla (código 1) si el PR:
//   - toca cualquier archivo que no sea temas-profe/<id>.json (id x1…, y1…, z1…, w1…, v1…, u1…) o temas-profe/indice.json;
//   - borra o renombra archivos;
//   - cambia o quita temas que ya estaban en indice.json (solo se pueden añadir líneas nuevas);
//   - tiene un tema que no pasa temas-profe/comprobar.mjs (que solo admite datos: nada de código, HTML peligroso ni enlaces).
// En GitHub lo pasa .github/workflows/temas-profe.yml, siempre con la versión de main (los cambios del PR no pueden cambiar la guardia).
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import { execFileSync } from "node:child_process";
const [base, carpeta = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..")] = process.argv.slice(2);
if (!base) { console.error("Uso: node temas-profe/guardia.mjs <base> [carpeta]"); process.exit(2); }
const git = (...a) => execFileSync("git", ["-C", carpeta, ...a], { encoding: "utf8", maxBuffer: 50e6 });
const fallos = [], mal = t => fallos.push(t);
const OK = /^temas-profe\/[u-z]\d{1,2}\.json$/;

const cambios = git("diff", "--name-status", "--no-renames", `${base}...HEAD`).trim().split("\n").filter(Boolean).map(l => l.split("\t"));
if (!cambios.length) mal("el PR no cambia nada");
for (const [estado, f] of cambios) {
  if (estado === "D") mal(`no se pueden borrar archivos: ${f}`);
  else if (f === "temas-profe/indice.json") { if (estado !== "M") mal(`indice.json solo se puede modificar (${estado})`); }
  else if (!OK.test(f)) mal(`archivo fuera de los temas de profes: ${f}`);
  else if (!["A", "M"].includes(estado)) mal(`cambio no permitido (${estado}): ${f}`);
}
/* indice.json: lo que ya estaba se queda igual; solo se añaden temas nuevos, con su archivo */
const leer = txt => { try { return JSON.parse(txt); } catch (e) { return null; } };
const antes = leer(git("show", `${base}:temas-profe/indice.json`)) || [];
const ahora = leer(fs.readFileSync(path.join(carpeta, "temas-profe/indice.json"), "utf8"));
if (!Array.isArray(ahora)) mal("indice.json no es una lista JSON");
else {
  for (const t of antes) { const n = ahora.find(x => x && x.id === t.id); if (!n || JSON.stringify(n) !== JSON.stringify(t)) mal(`no se puede cambiar ni quitar el tema ${t.id} de indice.json`); }
  const nuevos = ahora.filter(x => !antes.some(t => t.id === (x && x.id)));
  const anadidos = new Set(cambios.filter(([e, f]) => e === "A" && OK.test(f)).map(([, f]) => path.basename(f, ".json")));
  for (const t of nuevos) if (!anadidos.has(t && t.id)) mal(`el tema nuevo ${t && t.id} no trae su archivo nuevo temas-profe/${t && t.id}.json`);
  for (const id of anadidos) if (!nuevos.some(t => t.id === id)) mal(`temas-profe/${id}.json no está en indice.json`);
}
/* el contenido: solo datos (comprobar.mjs de esta misma versión de la guardia, leyendo la carpeta del PR) */
try { execFileSync("node", [path.join(path.dirname(url.fileURLToPath(import.meta.url)), "comprobar.mjs"), path.join(carpeta, "temas-profe")], { stdio: "inherit" }); }
catch (e) { mal("comprobar.mjs ha encontrado errores en los temas"); }

if (fallos.length) { fallos.forEach(f => console.log("❌ " + f)); console.log("\nGUARDIA: este PR NO se puede juntar."); process.exit(1); }
console.log(`✅ GUARDIA: solo añade temas (${cambios.length} archivos). Se puede juntar.`);
