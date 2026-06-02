import { list } from "@vercel/blob";

export default async function handler(req, res) {
  const { name } = req.query;
  try {
    const { blobs } = await list({ prefix: `portraits/${name}` });
    if (!blobs.length) return res.status(404).end();
    const r = await fetch(blobs[0].url);
    const buffer = await r.arrayBuffer();
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(buffer));
  } catch {
    res.status(500).end();
  }
}
