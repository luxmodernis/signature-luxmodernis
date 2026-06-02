import { list } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const { blobs } = await list({ prefix: "data/signatures-log.json" });
    if (!blobs.length) return res.json([]);
    const r = await fetch(blobs[0].url + "?t=" + Date.now());
    res.json(await r.json());
  } catch {
    res.json([]);
  }
}
