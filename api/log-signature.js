import { list, put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { firstName, lastName, templateName, html } = req.body;
    if (!firstName) return res.status(400).json({ error: "Missing firstName" });

    let log = [];
    const { blobs } = await list({ prefix: "data/signatures-log.json" });
    if (blobs.length) {
      const r = await fetch(blobs[0].url + "?t=" + Date.now());
      log = await r.json();
    }

    const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
    const idx = log.findIndex(e => norm(e.firstName) === norm(firstName));
    const entry = { firstName, lastName: lastName || "", templateName: templateName || "", html: html || "", date: new Date().toISOString() };

    if (idx >= 0) log[idx] = entry; else log.push(entry);

    await put("data/signatures-log.json", JSON.stringify(log), {
      access: "public", addRandomSuffix: false, contentType: "application/json",
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
