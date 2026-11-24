import { borrarSesion, responder, seguro } from "./_db.js";
export default (req, res) => seguro(res, async () => { await borrarSesion(req); responder(res, 200, { ok: true }); });
