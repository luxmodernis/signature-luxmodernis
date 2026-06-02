import { put } from "@vercel/blob";

const NETLIFY = "https://signaturelux.netlify.app";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const r = await fetch(`${NETLIFY}/api/list-profiles`);
    const profiles = await r.json();
    const keys = Object.keys(profiles);
    if (!keys.length) return res.json({ migrated: 0 });

    let migrated = 0;
    for (const key of keys) {
      try {
        await put(`profiles/${key}.json`, JSON.stringify(profiles[key]), {
          access: "public",
          addRandomSuffix: false,
          contentType: "application/json",
        });
        migrated++;
      } catch {}
    }
    res.json({ migrated, total: keys.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
