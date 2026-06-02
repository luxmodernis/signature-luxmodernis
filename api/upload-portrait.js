import { put } from "@vercel/blob";

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { imageData, filename } = req.body;
    if (!imageData || !imageData.startsWith("data:image")) {
      return res.status(400).json({ error: "Invalid image data" });
    }
    const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    const safeName = (filename || "portrait").toLowerCase().replace(/[^a-z0-9]/g, "") || "portrait";
    const key = safeName + ".jpg";
    await put(`portraits/${key}`, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: "image/jpeg",
    });
    res.json({ url: `/api/portrait/${key}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
