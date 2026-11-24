import { hayDB, responder } from "./_db.js";
export default function handler(req, res) { responder(res, 200, { ok: true, db: hayDB() }); }
