import { put } from "@vercel/blob";

const NETLIFY = "https://signaturelux.netlify.app";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const listRes = await fetch(`${NETLIFY}/api/list-portraits`);
    const keys = await listRes.json();
    if (!keys.length) return res.json({ migrated: 0 });

    const results = [];
    for (const key of keys) {
      try {
        const imgRes = await fetch(`${NETLIFY}/api/portrait/${key}`);
        if (!imgRes.ok) { results.push({ key, ok: false }); continue; }
        const buffer = await imgRes.arrayBuffer();
        await put(`portraits/${key}`, Buffer.from(buffer), {
          access: "public",
          addRandomSuffix: false,
          contentType: "image/jpeg",
        });
        results.push({ key, ok: true });
      } catch {
        results.push({ key, ok: false });
      }
    }
    res.json({ migrated: results.filter(r => r.ok).length, total: keys.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
