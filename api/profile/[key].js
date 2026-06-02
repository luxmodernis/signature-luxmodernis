import { list } from "@vercel/blob";

export default async function handler(req, res) {
  const { key } = req.query;
  try {
    const { blobs } = await list({ prefix: `profiles/${key}.json` });
    if (!blobs.length) return res.json(null);
    const r = await fetch(blobs[0].url + "?t=" + Date.now());
    const data = await r.json();
    res.json(data);
  } catch {
    res.json(null);
  }
}
