import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const templates = req.body;
    if (!Array.isArray(templates)) return res.status(400).json({ error: "Invalid data" });
    await put("data/templates.json", JSON.stringify(templates), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
