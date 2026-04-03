import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const { imageData, filename } = await req.json();
    if (!imageData || imageData.indexOf("data:image") !== 0) {
      return Response.json({ error: "Invalid image data" }, { status: 400 });
    }
    const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    const safeName = (filename || "portrait").toLowerCase().replace(/[^a-z0-9]/g, "") || "portrait";
    const key = safeName + ".jpg";
    const store = getStore("portraits");
    await store.set(key, buffer);
    return Response.json({ url: `/api/portrait/${key}` });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config = { path: "/api/upload-portrait" };
