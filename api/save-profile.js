import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { key, role, phone } = req.body;
    if (!key) return res.status(400).json({ error: "Missing key" });
    await put(`profiles/${key}.json`, JSON.stringify({ role, phone }), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
