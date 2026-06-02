import { list, put } from "@vercel/blob";

const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { firstName } = req.body;
    if (!firstName) return res.status(400).json({ error: "Missing firstName" });

    const { blobs } = await list({ prefix: "data/signatures-log.json" });
    if (!blobs.length) return res.json({ ok: true });

    const r = await fetch(blobs[0].url + "?t=" + Date.now());
    const log = await r.json();
    const filtered = log.filter(e => norm(e.firstName) !== norm(firstName));

    await put("data/signatures-log.json", JSON.stringify(filtered), {
      access: "public", addRandomSuffix: false, contentType: "application/json",
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
