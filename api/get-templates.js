import { list } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const { blobs } = await list({ prefix: "data/templates.json" });
    if (!blobs.length) return res.json([]);
    const r = await fetch(blobs[0].url + "?t=" + Date.now());
    const data = await r.json();
    res.json(data);
  } catch {
    res.json([]);
  }
}
