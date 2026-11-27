// El «robot» de la rutina de cada mañana: habla con /api/temas usando la clave TEMAS_ROBOT (variable de entorno).
//   node temas-profe/robot.mjs lista <carpeta>                       → baja las peticiones aprobadas a <carpeta>/<id>/ (peticion.json + foto-1.jpg…)
//                                                                      y apunta las ya preparadas (con PR) en <carpeta>/preparadas.json
//   node temas-profe/robot.mjs preparada <id> <temaId> <archivo> <pr> → marca la petición como preparada y BORRA sus fotos del servidor
//   node temas-profe/robot.mjs publicada <id>                        → marca la petición como publicada (cuando el PR ya está en la web)
//   node temas-profe/robot.mjs error <id> "<motivo>"                 → marca la petición con un problema (el admin lo ve)
// Web: variable COMPRENDO_URL (por defecto https://comprendo-dusky.vercel.app).
import fs from "node:fs"; import path from "node:path";
const WEB = (process.env.COMPRENDO_URL || "https://comprendo-dusky.vercel.app").replace(/\/$/, ""), CLAVE = process.env.TEMAS_ROBOT || "";
if (CLAVE.length < 20) { console.error("Falta la variable TEMAS_ROBOT (la misma clave que en Vercel, de 20 caracteres o más)."); process.exit(2); }
const H = {"x-robot": CLAVE, "Content-Type": "application/json"};
async function pedir(ruta, cuerpo) {
  const r = await fetch(`${WEB}/api/temas${ruta}`, cuerpo ? {method: "POST", headers: H, body: JSON.stringify(cuerpo)} : {headers: H});
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status} ${j.error || ""}`);
  return j;
}
const [, , orden, ...a] = process.argv;
if (orden === "lista") {
  const dir = a[0] || "peticiones"; fs.mkdirSync(dir, {recursive: true});
  const {peticiones: todas} = await pedir("?robot=lista");
  const peticiones = todas.filter(p => p.estado === "aprobada");
  for (const p of todas.filter(p => p.estado === "preparada")) console.log(`preparada (falta publicar): ${p.id} · tema ${p.temaId} · ${p.pr || "sin PR"}`);
  fs.writeFileSync(path.join(dir, "preparadas.json"), JSON.stringify(todas.filter(p => p.estado === "preparada"), null, 2));
  for (const p of peticiones) {
    const d = path.join(dir, p.id); fs.mkdirSync(d, {recursive: true});
    fs.writeFileSync(path.join(d, "peticion.json"), JSON.stringify(p, null, 2));
    for (let i = 0; i < (p.fotos || 0); i++) {
      try { const {data} = await pedir(`?robot=foto&id=${encodeURIComponent(p.id)}&i=${i}`); const m = /^data:image\/(\w+);base64,(.*)$/.exec(data); fs.writeFileSync(path.join(d, `foto-${i + 1}.${m[1] === "jpeg" ? "jpg" : m[1]}`), Buffer.from(m[2], "base64")); }
      catch (e) { console.error(`  ${p.id}: la foto ${i + 1} no está (${e.message})`); }
    }
    console.log(`${p.id} · ${p.profe} · ${p.curso} · ${p.asignatura} · tema ${p.tema}: ${p.titulo} · ${p.fotos || 0} fotos → ${d}`);
  }
  console.log(`${peticiones.length} peticiones aprobadas`);
} else if (orden === "preparada") { await pedir("", {accion: "robot_preparada", id: a[0], temaId: a[1], archivo: a[2], pr: a[3] || ""}); console.log("ok: preparada y fotos borradas"); }
else if (orden === "publicada") { await pedir("", {accion: "robot_publicada", id: a[0]}); console.log("ok: publicada"); }
else if (orden === "error") { await pedir("", {accion: "robot_error", id: a[0], motivo: a.slice(1).join(" ")}); console.log("ok: marcada con error"); }
else { console.error("Uso: lista <carpeta> | preparada <id> <temaId> <archivo> <pr> | publicada <id> | error <id> <motivo>"); process.exit(2); }
